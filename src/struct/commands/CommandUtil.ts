/* eslint-disable require-await */
import { APIMessage } from "discord-api-types";
import {
	Collection,
	CommandInteraction,
	ContextMenuInteraction,
	InteractionReplyOptions,
	Message,
	MessageEditOptions,
	MessageOptions,
	MessagePayload,
	ReplyMessageOptions,
	Snowflake,
	WebhookEditMessageOptions
} from "discord.js";
import AkairoMessage from "../../util/AkairoMessage";
import ContextMenuCommandHandler from "../contextMenuCommands/ContextMenuCommandHandler";
import CommandHandler, { ParsedComponentData } from "./CommandHandler";

/**
 * Command utilities.
 * @param handler - The command handler.
 * @param message - Message that triggered the command.
 */
export default class CommandUtil<
	InteractionType extends CommandInteraction | ContextMenuInteraction
> {
	public constructor(
		handler: CommandHandler | ContextMenuCommandHandler,
		message: Message | AkairoMessage<InteractionType>
	) {
		this.handler = handler;

		this.message = message;

		this.parsed = null;

		this.shouldEdit = false;

		this.lastResponse = null;

		if (this.handler instanceof CommandHandler && this.handler.storeMessages) {
			this.messages = new Collection();
		} else {
			this.messages = null;
		}

		this.isSlash = this.message instanceof AkairoMessage;
	}

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
	public lastResponse?: Message;

	/**
	 * Message that triggered the command.
	 */
	public message: Message | AkairoMessage<InteractionType>;

	/**
	 * Messages stored from prompts and prompt replies.
	 */
	public messages?: Collection<Snowflake, Message>;

	/**
	 * The parsed components.
	 */
	public parsed?: ParsedComponentData;

	/**
	 * Whether or not the last response should be edited.
	 */
	public shouldEdit: boolean;

	/**
	 * Adds client prompt or user reply to messages.
	 * @param message - Message to add.
	 */
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
	/* public async edit(
		options: string | MessageEditOptions | MessagePayload
	): Promise<Message>;
	public async edit(
		options: string | MessagePayload | WebhookEditMessageOptions
	): Promise<Message | APIMessage> */
	public async edit(
		options:
			| string
			| MessageEditOptions
			| MessagePayload
			| WebhookEditMessageOptions
	): Promise<Message | APIMessage> {
		if (this.isSlash) {
			return (
				this.lastResponse as any as AkairoMessage<InteractionType>
			).interaction.editReply(options);
		} else {
			return this.lastResponse.edit(options);
		}
	}

	/**
	 * Send an inline reply or respond to a slash command.
	 * If the message is a slash command, it replies or edits the last reply.
	 * @param options - Options to use.
	 */
	/* public async reply(
		options: string | MessagePayload | ReplyMessageOptions
	): Promise<Message>;
	public async reply(
		options: string | MessagePayload | InteractionReplyOptions
	): Promise<Message | APIMessage> */
	public async reply(
		options:
			| string
			| MessagePayload
			| ReplyMessageOptions
			| InteractionReplyOptions
	): Promise<Message | APIMessage> {
		let newOptions: ReplyMessageOptions | InteractionReplyOptions = {};
		if (typeof options == "string") {
			newOptions.content = options;
		} else {
			// @ts-expect-error
			newOptions = options;
		}

		if (
			!this.isSlash &&
			!this.shouldEdit &&
			!(newOptions instanceof MessagePayload) &&
			!Reflect.has(this.message, "deleted")
		) {
			// @ts-expect-error
			newOptions.reply = {
				messageReference: this.message, // @ts-expect-error
				failIfNotExists: newOptions.failIfNotExists ?? true
			};
		}
		return this.send(newOptions);
	}

	/**
	 * Sends a response or edits an old response if available.
	 * @param options - Options to use.
	 */
	/* public async send(
		options: string | MessagePayload | MessageOptions
	): Promise<Message>;
	public async send(
		options: string | MessagePayload | InteractionReplyOptions
		): Promise<Message | APIMessage> */
	// eslint-disable-next-line consistent-return
	public async send(
		options: string | MessagePayload | MessageOptions | InteractionReplyOptions
	): Promise<Message | APIMessage> {
		const hasFiles =
			typeof options === "string" || !options.files?.length
				? false
				: options.files?.length > 0;

		let newOptions: MessageOptions | InteractionReplyOptions = {};
		if (typeof options === "string") {
			newOptions.content = options;
		} else {
			newOptions = options as MessageOptions | InteractionReplyOptions;
		}
		if (!(this.message.interaction instanceof CommandInteraction)) {
			if (typeof options !== "string")
				delete (options as InteractionReplyOptions).ephemeral;
			if (
				this.shouldEdit &&
				!hasFiles &&
				!this.lastResponse.deleted &&
				!this.lastResponse.attachments.size
			) {
				return this.lastResponse.edit(options);
			}
			const sent = await this.message.channel?.send(options);

			const lastSent = this.setLastResponse(sent);
			this.setEditable(!lastSent.attachments.size);

			return sent;
		} else {
			if (typeof options !== "string") delete (options as MessageOptions).reply;
			if (
				this.lastResponse ||
				this.message.interaction.deferred ||
				this.message.interaction.replied
			) {
				this.lastResponse = (await this.message.interaction.editReply(
					options
				)) as Message;
				return this.lastResponse;
			} else {
				if (!(newOptions as InteractionReplyOptions).ephemeral) {
					(newOptions as InteractionReplyOptions).fetchReply = true;
					this.lastResponse = (await this.message.interaction.reply(
						newOptions
					)) as unknown as Message;
					return this.lastResponse;
				}
				await this.message.interaction.reply(newOptions);
			}
		}
	}

	/**
	 * Sends a response, overwriting the last response.
	 * @param options - Options to use.
	 */
	/* public async sendNew(
		options: string | MessagePayload | MessageOptions
	): Promise<Message>;
	public async sendNew(
		options: string | MessagePayload | InteractionReplyOptions
	): Promise<Message | APIMessage> */
	public async sendNew(
		options: string | MessagePayload | MessageOptions | InteractionReplyOptions
	): Promise<Message | APIMessage> {
		if (!(this.message.interaction instanceof CommandInteraction)) {
			const sent = await this.message.channel?.send(options);
			const lastSent = this.setLastResponse(sent);
			this.setEditable(!lastSent.attachments.size);
			return sent;
		} else {
			const sent = (await this.message.interaction.followUp(
				options
			)) as Message;
			this.setLastResponse(sent);
			return sent;
		}
	}

	/**
	 * Changes if the message should be edited.
	 * @param state - Change to editable or not.
	 */
	public setEditable(state: boolean): CommandUtil<InteractionType> {
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
		if (this.isSlash) {
			return (
				this.message as AkairoMessage<InteractionType>
			).interaction.deleteReply();
		} else {
			return this.lastResponse?.delete();
		}
	}
}
