/* eslint-disable require-await */
import { APIMessage } from "discord-api-types";
import {
	Collection,
	MessagePayload,
	CommandInteraction,
	InteractionReplyOptions,
	Message,
	MessageEditOptions,
	MessageOptions,
	ReplyMessageOptions,
	WebhookEditMessageOptions,
	Snowflake
} from "discord.js";
import AkairoMessage from "../../util/AkairoMessage";
import CommandHandler, { ParsedComponentData } from "./CommandHandler";

/**
 * Command utilities.
 * @param handler - The command handler.
 * @param message - Message that triggered the command.
 */
export default class CommandUtil {
	public constructor(
		handler: CommandHandler,
		message: Message | AkairoMessage
	) {
		this.handler = handler;

		this.message = message;

		this.parsed = null;

		this.shouldEdit = false;

		this.lastResponse = null;

		if (this.handler.storeMessages) {
			this.messages = new Collection();
		} else {
			this.messages = null;
		}

		this.isSlash = !!(this.message instanceof Message);
	}

	/**
	 * The command handler.
	 */
	public handler: CommandHandler;

	/**
	 * Whether or not the command is a slash command.
	 */
	public isSlash: true | false;

	/**
	 * The last response sent.
	 */
	public lastResponse?: Message;

	/**
	 * Message that triggered the command.
	 */
	public message: Message | AkairoMessage;

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
	 * Adds client prompt or user reply to messages.
	 * @param message - Message to add.
	 */
	public addMessage(message: Message | Message[]): Message | Message[] {
		if (this.handler.storeMessages) {
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
	 * Changes if the message should be edited.
	 * @param state - Change to editable or not.
	 */
	public setEditable(state: boolean): CommandUtil {
		this.shouldEdit = Boolean(state);
		return this;
	}

	/**
	 * Sends a response or edits an old response if available.
	 * @param options - Options to use.
	 */
	// eslint-disable-next-line consistent-return
	public async send(
		options: string | MessagePayload | MessageOptions | InteractionReplyOptions
	): Promise<Message | APIMessage | void> {
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
	public async sendNew(
		options: string | MessagePayload | MessageOptions
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
	 * Send an inline reply or respond to a slash command.
	 * @param options - Options to use.
	 */
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
			// @ts-expect-error
			!this.message.deleted
		) {
			// @ts-expect-error
			newOptions.reply = {
				messageReference: this.message, // @ts-expect-error
				failIfNotExists: newOptions.failIfNotExists ?? true
			};
		} // @ts-expect-error
		return this.send(newOptions);
	}

	/**
	 * Edits the last response.
	 * If the message is a slash command, edits the slash response.
	 * @param options - Options to use.
	 */
	public async edit(
		options:
			| string
			| MessageEditOptions
			| MessagePayload
			| WebhookEditMessageOptions
	): Promise<Message | APIMessage> {
		if (this.isSlash) {
			return (this.lastResponse as any as AkairoMessage).interaction.editReply(
				options
			);
		} else {
			return this.lastResponse.edit(options);
		}
	}

	/**
	 * Deletes the last response.
	 */
	public async delete(): Promise<Message | void> {
		if (this.isSlash) {
			return (this.message as AkairoMessage).interaction.deleteReply();
		} else {
			return this.lastResponse?.delete();
		}
	}
}
