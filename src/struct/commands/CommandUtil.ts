import {
	type BitFieldResolvable,
	Collection,
	type InteractionEditReplyOptions,
	type InteractionReplyOptions,
	type Message,
	type MessageCreateOptions,
	type MessageEditOptions,
	MessageFlags,
	MessageFlagsBitField,
	type MessageFlagsString,
	MessagePayload,
	type MessageReplyOptions,
	type Snowflake
} from "discord.js";
import { type MessageUnion } from "../../typings/Util.js";
import { AkairoMessage } from "../../util/AkairoMessage.js";
import type { ContextMenuCommandHandler } from "../contextMenuCommands/ContextMenuCommandHandler.js";
import { CommandHandler, type ParsedComponentData } from "./CommandHandler.js";

/**
 * Command utilities.
 */
export class CommandUtil<MessageType extends MessageUnion> {
	/**
	 * Saved deleted message ids.
	 */
	public static deletedMessages = new Set<Snowflake>();

	/**
	 * The command handler.
	 */
	public handler: CommandHandler | ContextMenuCommandHandler;

	/**
	 * Whether or not the command is a slash command.
	 */
	public isSlash: boolean;

	/**
	 * The last response sent.
	 */
	public lastResponse: Message | null;

	/**
	 * Message that triggered the command.
	 */
	public message: MessageType;

	/**
	 * Messages stored from prompts and prompt replies.
	 */
	public messages: Collection<Snowflake, Message> | null;

	/**
	 * The parsed components.
	 */
	public parsed: ParsedComponentData | null;

	/**
	 * Whether or not the last response should be edited.
	 */
	public shouldEdit: boolean;

	/**
	 * Whether or not `this.message` has been deleted.
	 */
	public get deleted(): boolean {
		return this.isSlash ? false : CommandUtil.deletedMessages.has(this.message.id);
	}

	/**
	 * @param handler - The command handler.
	 * @param message - Message that triggered the command.
	 */
	public constructor(handler: CommandHandler | ContextMenuCommandHandler, message: MessageType) {
		this.handler = handler;
		this.message = message;
		this.parsed = null;
		this.shouldEdit = false;
		this.lastResponse = null;
		this.messages = this.handler instanceof CommandHandler && this.handler.storeMessages ? new Collection() : null;
		this.isSlash = this.message instanceof AkairoMessage;
	}

	/**
	 * Whether or not the provided message is a slash message
	 * @param message - The message to test
	 */
	public isSlashMessage(message: MessageUnion): message is AkairoMessage {
		return message instanceof AkairoMessage;
	}

	/**
	 * Adds client prompt or user reply to messages.
	 * @param message - Message to add.
	 */
	public addMessage(message: Message): Message;
	public addMessage(message: Message[]): Message[];
	public addMessage(message: Message | Message[]): Message | Message[] {
		if (this.handler instanceof CommandHandler && this.handler.storeMessages) {
			if (Array.isArray(message)) {
				for (const msg of message) {
					this.messages?.set(msg.id, msg);
				}
			} else {
				this.messages?.set(message.id, message);
			}
		}

		return message;
	}

	/**
	 * Edits the last response.
	 * If the message is a slash command, edits the slash response.
	 * @param options - Options to use.
	 */
	public async edit(options: string | MessageEditOptions | MessagePayload): Promise<Message>;
	public async edit(options: string | InteractionEditReplyOptions | MessagePayload): Promise<Message>;
	public async edit(options: string | InteractionEditReplyOptions | MessageEditOptions | MessagePayload): Promise<Message> {
		if (!this.isSlashMessage(this.message)) {
			return await this.lastResponse!.edit(options);
		} else {
			return await this.message.interaction.editReply(options);
		}
	}

	/**
	 * Send an inline reply or respond to a slash command.
	 * If the message is a slash command, it replies or edits the last reply.
	 * @param options - Options to use.
	 */
	public async reply(options: string | MessagePayload | MessageReplyOptions): Promise<Message>;
	public async reply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message>;
	public async reply(options: string | MessagePayload | MessageReplyOptions | InteractionReplyOptions): Promise<Message> {
		const newOptions = (typeof options === "string" ? { content: options } : options) as MessageReplyOptions;

		if (!this.isSlashMessage(this.message) && !this.shouldEdit && !(newOptions instanceof MessagePayload) && !this.deleted) {
			(newOptions as MessageCreateOptions).reply = {
				messageReference: this.message,
				failIfNotExists: newOptions.failIfNotExists ?? this.handler.client.options.failIfNotExists
			};
		}
		return await this.send(newOptions);
	}

	/**
	 * Sends a response or edits an old response if available.
	 * @param options - Options to use.
	 */
	public async send(options: string | MessagePayload | MessageCreateOptions): Promise<Message>;
	public async send(options: string | MessagePayload | InteractionReplyOptions): Promise<Message>;
	public async send(options: string | MessagePayload | MessageCreateOptions | InteractionReplyOptions): Promise<Message> {
		const hasFiles = typeof options === "string" || !options.files?.length ? false : options.files.length > 0;
		const newOptions = typeof options === "string" ? { content: options } : options;
		if (!this.isSlashMessage(this.message)) {
			const cast = newOptions as InteractionReplyOptions;

			if (cast.flags) {
				cast.flags = new MessageFlagsBitField(cast.flags as BitFieldResolvable<MessageFlagsString, number>).remove(
					MessageFlags.Ephemeral
				).bitfield;
			}

			if (
				this.shouldEdit &&
				!hasFiles &&
				!CommandUtil.deletedMessages.has(this.lastResponse!.id) &&
				!this.lastResponse!.attachments.size
			) {
				return await this.lastResponse!.edit(newOptions as MessageEditOptions);
			}
			const sent = await this.message.channel?.send(newOptions as MessageCreateOptions);

			const lastSent = this.setLastResponse(sent!);
			this.setEditable(!lastSent.attachments.size);

			return sent!;
		} else {
			(newOptions as MessageCreateOptions).reply = undefined;
			if (this.lastResponse || this.message.interaction.deferred || this.message.interaction.replied) {
				this.lastResponse = (await this.message.interaction.editReply(newOptions)) as Message;
				return this.lastResponse;
			} else {
				Object.assign(newOptions, { withResponse: true });
				this.lastResponse = (await this.message.interaction.reply(newOptions as InteractionReplyOptions & { withResponse: true }))
					.resource!.message as Message;
				return this.lastResponse;
			}
		}
	}

	/**
	 * Sends a response, overwriting the last response.
	 * @param options - Options to use.
	 */
	public async sendNew(options: string | MessagePayload | MessageCreateOptions): Promise<Message>;
	public async sendNew(options: string | MessagePayload | InteractionReplyOptions): Promise<Message>;
	public async sendNew(options: string | MessagePayload | MessageCreateOptions | InteractionReplyOptions): Promise<Message> {
		if (!this.isSlashMessage(this.message)) {
			const sent = await this.message.channel?.send(options as string | MessagePayload | MessageCreateOptions);
			const lastSent = this.setLastResponse(sent!);
			this.setEditable(!lastSent.attachments.size);
			return sent;
		} else {
			const sent = await this.message.interaction.followUp(options as string | MessagePayload | InteractionReplyOptions);
			this.setLastResponse(sent);
			return sent;
		}
	}

	/**
	 * Changes if the message should be edited.
	 * @param state - Change to editable or not.
	 */
	public setEditable(state: boolean): CommandUtil<MessageType> {
		this.shouldEdit = Boolean(state);
		return this;
	}

	/**
	 * Sets the last response.
	 * @param message - The last response.
	 */
	public setLastResponse(message: Message): Message {
		if (Array.isArray(message)) {
			this.lastResponse = message.slice(-1)[0];
		} else {
			this.lastResponse = message;
		}
		return this.lastResponse!;
	}

	/**
	 * Deletes the last response.
	 */
	public async delete(): Promise<Message | void> {
		if (this.isSlashMessage(this.message)) {
			return await this.message.interaction.deleteReply();
		} else {
			return await this.lastResponse?.delete();
		}
	}
}
