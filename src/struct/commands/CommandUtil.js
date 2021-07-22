// @ts-check
"use strict";

/**
 * @typedef {import("discord.js").MessageOptions} MessageOptions
 * @typedef {import("discord.js").ReplyMessageOptions} ReplyMessageOptions
 * @typedef {import("discord.js").MessageEditOptions} MessageEditOptions
 * @typedef {import("discord.js").Snowflake} Snowflake
 * @typedef {import("discord.js").InteractionReplyOptions} InteractionReplyOptions
 * @typedef {import("discord.js").MessageEmbed} MessageEmbed
 * @typedef {import("discord.js").WebhookEditMessageOptions} WebhookEditMessageOptions
 * @typedef {import("discord.js").MessageEmbedOptions} MessageEmbedOptions
 * @typedef {import("../../struct/commands/CommandHandler").default} CommandHandler
 * @typedef {import("../../util/AkairoMessage").default} AkairoMessage
 * @typedef {import("../../struct/commands/CommandHandler").ParsedComponentData} ParsedComponentData
 */
/**
 * @typedef {Object} TempMessage
 * @property {CommandUtil} [util] - command util
 * @typedef {import("discord.js").Message & TempMessage} Message
 */

import { Collection, MessagePayload, CommandInteraction } from "discord.js";

/**
 * Command utilities.
 * @param {CommandHandler} handler - The command handler.
 * @param {Message} message - Message that triggered the command.
 */
export default class CommandUtil {
	/**
	 * @param {CommandHandler} handler - The command handler.
	 * @param {Message|AkairoMessage} message - The message
	 */
	constructor(handler, message) {
		/**
		 * The command handler.
		 * @type {CommandHandler}
		 */
		this.handler = handler;

		/**
		 * Message that triggered the command.
		 * @type {Message | AkairoMessage}
		 */
		this.message = message;

		/**
		 * The parsed components.
		 * @type {?ParsedComponentData}
		 */
		this.parsed = null;

		/**
		 * Whether or not the last response should be edited.
		 * @type {boolean}
		 */
		this.shouldEdit = false;

		/**
		 * The last response sent.
		 * @type {?Message}
		 */
		this.lastResponse = null;

		if (this.handler.storeMessages) {
			/**
			 * Messages stored from prompts and prompt replies.
			 * @type {Collection<Snowflake, Message>}
			 */
			this.messages = new Collection();
		} else {
			this.messages = null;
		}

		/**
		 * Whether or not the command is a slash command.
		 * @type {boolean}
		 */
		this.isSlash = !!message.interaction;
	}

	/**
	 * Sets the last response.
	 * @param {Message} message - Message to set.
	 * @returns {Message}
	 */
	setLastResponse(message) {
		if (Array.isArray(message)) {
			this.lastResponse = message.slice(-1)[0];
		} else {
			this.lastResponse = message;
		}
		return this.lastResponse;
	}

	/**
	 * Adds client prompt or user reply to messages.
	 * @param {Message|Message[]} message - Message to add.
	 * @returns {Message|Message[]}
	 */
	addMessage(message) {
		if (this.handler.storeMessages) {
			if (Array.isArray(message)) {
				for (const msg of message) {
					this.messages.set(msg.id, msg);
				}
			} else {
				this.messages.set(message.id, message);
			}
		}

		return message;
	}

	/**
	 * Changes if the message should be edited.
	 * @param {boolean} state - Change to editable or not.
	 * @returns {CommandUtil}
	 */
	setEditable(state) {
		this.shouldEdit = Boolean(state);
		return this;
	}

	/**
	 * Sends a response or edits an old response if available.
	 * @param {string | MessagePayload | MessageOptions | InteractionReplyOptions} options - Options to use.
	 * @returns {Promise<Message>}
	 */
	// eslint-disable-next-line consistent-return
	async send(options) {
		const hasFiles =
			typeof options === "string" ? false : options.files?.length > 0;

		/** @type {MessageOptions | InteractionReplyOptions} */
		let newOptions = {};
		if (typeof options === "string") {
			newOptions.content = options;
		} else {
			// @ts-expect-error
			newOptions = options;
		}
		if (!(this.message.interaction instanceof CommandInteraction)) {
			// @ts-expect-error
			if (typeof options !== "string") delete options.ephemeral;
			if (
				this.shouldEdit &&
				!hasFiles &&
				!this.lastResponse.deleted &&
				!this.lastResponse.attachments.size
			) {
				return this.lastResponse.edit(options);
			}
			const sent = await this.message.channel.send(options);

			const lastSent = this.setLastResponse(sent);
			this.setEditable(!lastSent.attachments.size);

			return sent;
		} else {
			// @ts-expect-error
			if (typeof options !== "string") delete options.reply;
			if (
				this.lastResponse ||
				this.message.interaction.deferred ||
				this.message.interaction.replied
			) {
				// @ts-expect-error
				this.lastResponse = await this.message.interaction.editReply(options);
				return this.lastResponse;
			} else {
				// @ts-expect-error
				if (!newOptions.ephemeral) {
					// @ts-expect-error
					options.fetchReply = true;
				}
				// @ts-expect-error
				this.lastResponse = await this.message.interaction.reply(newOptions);
				return this.lastResponse;
			}
		}
	}

	/**
	 * Sends a response, overwriting the last response.
	 * @param {string | MessagePayload | MessageOptions} options - Options to use.
	 * @returns {Promise<Message>}
	 */
	async sendNew(options) {
		if (!(this.message.interaction instanceof CommandInteraction)) {
			const sent = await this.message.channel.send(options);
			const lastSent = this.setLastResponse(sent);
			this.setEditable(!lastSent.attachments.size);
			return sent;
		} else {
			const sent = await this.message.interaction.followUp(options);
			// @ts-expect-error
			this.setLastResponse(sent);
			// @ts-expect-error
			return sent;
		}
	}

	/**
	 * Send an inline reply or respond to a slash command.
	 * @param {string | MessagePayload | ReplyMessageOptions | InteractionReplyOptions} options - Options to use.
	 * @returns {Promise<Message>}
	 */
	reply(options) {
		/** @type {ReplyMessageOptions | InteractionReplyOptions} */
		let newOptions = {};
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
				messageReference: this.message,
				// @ts-expect-error
				failIfNotExists: newOptions.failIfNotExists ?? true
			};
		}
		return this.send(newOptions);
	}

	/**
	 * Edits the last response.
	 * If the message is a slash command, edits the slash response.
	 * @param {string | MessagePayload | WebhookEditMessageOptions} options - Options to use.
	 * @returns {Promise<Message>}
	 */
	edit(options) {
		if (this.isSlash) {
			// @ts-expect-error
			return this.lastResponse.interaction.editReply(options);
		} else {
			return this.lastResponse.edit(options);
		}
	}

	/**
	 * Deletes the last response.
	 * @returns {Promise<Message | void>}
	 */
	delete() {
		if (this.isSlash) {
			// @ts-expect-error
			return this.message.interaction.deleteReply();
		} else {
			return this.lastResponse?.delete();
		}
	}
}

/**
 * Extra properties applied to the Discord.js message object.
 * @typedef {Object} MessageExtensions
 * @prop {?CommandUtil} util - Utilities for command responding.
 * Available on all messages after `all" inhibitors and built-in inhibitors (bot, client).
 * Not all properties of the util are available, depending on the input.
 */
