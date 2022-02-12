/* eslint-disable require-await */
import { APIMessage } from "discord-api-types/v9";
import {
	Collection,
	InteractionReplyOptions,
	Message,
	MessageEditOptions,
	MessageOptions,
	MessagePayload,
	ReplyMessageOptions,
	Snowflake,
	WebhookEditMessageOptions
} from "discord.js";
import { AkairoMessage } from "../../util/AkairoMessage.js";
import type { ContextMenuCommandHandler } from "../contextMenuCommands/ContextMenuCommandHandler.js";
import { CommandHandler, ParsedComponentData } from "./CommandHandler.js";

/**
 * Command utilities.
 */
export class CommandUtil<MessageType extends AkairoMessage | Message> {
	/**
	 * Saved deleted message ids.
	 */
	public static deletedMessages = new Set<Snowflake>();

	/**
	 * The command handler.
	 */
	public declare handler: CommandHandler | ContextMenuCommandHandler;

	/**
	 * Whether or not the command is a slash command.
	 */
	public declare isSlash: boolean;

	/**
	 * The last response sent.
	 */
	public declare lastResponse: Message | null;

	/**
	 * Message that triggered the command.
	 */
	public declare message: MessageType;

	/**
	 * Messages stored from prompts and prompt replies.
	 */
	public declare messages: Collection<Snowflake, Message> | null;

	/**
	 * The parsed components.
	 */
	public declare parsed: ParsedComponentData | null;

	/**
	 * Whether or not the last response should be edited.
	 */
	public declare shouldEdit: boolean;

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
	public isSlashMessage(message: Message | AkairoMessage): message is AkairoMessage {
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
	public async edit(options: string | WebhookEditMessageOptions | MessagePayload): Promise<Message | APIMessage>;
	public async edit(
		options: string | WebhookEditMessageOptions | WebhookEditMessageOptions | MessagePayload
	): Promise<Message | APIMessage> {
		if (!this.isSlashMessage(this.message)) {
			return this.lastResponse!.edit(options);
		} else {
			return this.message.interaction.editReply(options);
		}
	}

	/**
	 * Send an inline reply or respond to a slash command.
	 * If the message is a slash command, it replies or edits the last reply.
	 * @param options - Options to use.
	 */
	public async reply(options: string | MessagePayload | ReplyMessageOptions): Promise<Message>;
	public async reply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | APIMessage>;
	public async reply(
		options: string | MessagePayload | ReplyMessageOptions | InteractionReplyOptions
	): Promise<Message | APIMessage> {
		const newOptions = (typeof options === "string" ? { content: options } : options) as ReplyMessageOptions;

		if (!this.isSlashMessage(this.message) && !this.shouldEdit && !(newOptions instanceof MessagePayload) && !this.deleted) {
			(newOptions as MessageOptions).reply = {
				messageReference: this.message,
				failIfNotExists: newOptions.failIfNotExists ?? this.handler.client.options.failIfNotExists
			};
		}
		return this.send(newOptions);
	}

	/**
	 * Sends a response or edits an old response if available.
	 * @param options - Options to use.
	 */
	public async send(options: string | MessagePayload | MessageOptions): Promise<Message>;
	public async send(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | APIMessage>;
	public async send(options: string | MessagePayload | MessageOptions | InteractionReplyOptions): Promise<Message | APIMessage> {
		const hasFiles = typeof options === "string" || !options.files?.length ? false : options.files?.length > 0;
		const newOptions = typeof options === "string" ? { content: options } : options;
		if (!this.isSlashMessage(this.message)) {
			(newOptions as InteractionReplyOptions).ephemeral = undefined;
			if (
				this.shouldEdit &&
				!hasFiles &&
				!CommandUtil.deletedMessages.has(this.lastResponse!.id) &&
				!this.lastResponse!.attachments.size
			) {
				return this.lastResponse!.edit(newOptions as MessageEditOptions);
			}
			const sent = await this.message.channel?.send(newOptions as MessageOptions);

			const lastSent = this.setLastResponse(sent!);
			this.setEditable(!lastSent.attachments.size);

			return sent!;
		} else {
			(newOptions as MessageOptions).reply = undefined;
			if (this.lastResponse || this.message.interaction.deferred || this.message.interaction.replied) {
				this.lastResponse = (await this.message.interaction.editReply(newOptions)) as Message;
				return this.lastResponse;
			} else {
				Object.assign(newOptions, { fetchReply: true });
				this.lastResponse = (await this.message.interaction.reply(
					newOptions as InteractionReplyOptions & { fetchReply: true }
				)) as Message;
				return this.lastResponse;
			}
		}
	}

	/**
	 * Sends a response, overwriting the last response.
	 * @param options - Options to use.
	 */
	public async sendNew(options: string | MessagePayload | MessageOptions): Promise<Message>;
	public async sendNew(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | APIMessage>;
	public async sendNew(
		options: string | MessagePayload | MessageOptions | InteractionReplyOptions
	): Promise<Message | APIMessage> {
		if (!this.isSlashMessage(this.message)) {
			const sent = await this.message.channel?.send(options as string | MessagePayload | MessageOptions);
			const lastSent = this.setLastResponse(sent!);
			this.setEditable(!lastSent.attachments.size);
			return sent!;
		} else {
			const sent = (await this.message.interaction.followUp(
				options as string | MessagePayload | InteractionReplyOptions
			)) as Message;
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
		return this.lastResponse as Message;
	}

	/**
	 * Deletes the last response.
	 */
	public async delete(): Promise<Message | void> {
		if (this.isSlashMessage(this.message)) {
			return this.message.interaction.deleteReply();
		} else {
			return this.lastResponse?.delete();
		}
	}
}
