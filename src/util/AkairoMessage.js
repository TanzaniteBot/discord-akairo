// @ts-check
"use strict";

import Command from "../struct/commands/Command";

/**
 * @typedef {import("discord.js").InteractionReplyOptions} InteractionReplyOptions
 * @typedef {import("discord.js").CommandInteraction} CommandInteraction
 * @typedef {import("discord.js").User} User
 * @typedef {import("discord.js").TextChannel} TextChannel
 * @typedef {import("discord.js").DMChannel } DMChannel
 * @typedef {import("discord.js").PartialDMChannel } PartialDMChannel
 * @typedef {import("discord.js").NewsChannel} NewsChannel
 * @typedef {import("discord.js").ThreadChannel} ThreadChannel
 * @typedef {import("discord.js").GuildMember} GuildMember
 * @typedef {import("discord.js").Guild} Guild
 * @typedef {import("discord-api-types/v8").APIMessage} APIMessage
 * @typedef {import("discord.js").Snowflake} Snowflake
 * @typedef {import("discord.js").MessagePayload} MessagePayload
 * @typedef {import("discord-api-types/v9").APIInteractionGuildMember} APIInteractionGuildMember
 * @typedef {import("../struct/AkairoClient").default} AkairoClient
 * @typedef {import("../struct/commands/CommandUtil").default} CommandUtil
 * @typedef {import("../struct/commands/CommandUtil").Message} Message
 */

/**
 * A command interaction represented as a message.
 * @param {AkairoClient} client - AkairoClient
 * @param {CommandInteraction} interaction - CommandInteraction
 * @param {{slash: boolean, replied: boolean}} additionalInfo - Other information
 */
export default class AkairoMessage {
	/**
	 * A command interaction represented as a message.
	 * @param {AkairoClient} client - AkairoClient
	 * @param {CommandInteraction} interaction - CommandInteraction
	 * @param {{slash: boolean, replied: boolean, command: Command}} additionalInfo - Other information
	 */
	constructor(client, interaction, { slash, replied, command }) {
		/**
		 * The author of the interaction.
		 * @type {User}
		 */
		this.author = interaction.user;

		/**
		 * The channel that the interaction was sent in.
		 * @type {TextChannel | DMChannel | NewsChannel | ThreadChannel | PartialDMChannel}
		 */
		this.channel = interaction.channel;

		/**
		 * The Akairo client.
		 * @type {AkairoClient}
		 */
		this.client = client;

		/**
		 * The command name and arguments represented as a string.
		 * @type {string}
		 */
		this.content = `/${interaction.commandName}`;

		/**
		 * The time the interaction was sent.
		 * @type {Date}
		 */
		this.createdAt = interaction.createdAt;

		/**
		 * The timestamp the interaction was sent at.
		 * @type {number}
		 */
		this.createdTimestamp = interaction.createdTimestamp;

		/**
		 * The guild the interaction was sent in (if in a guild channel).
		 * @type {Guild}
		 */
		this.guild = interaction.guild;

		/**
		 * The ID of the interaction.
		 * @type {Snowflake}
		 */
		this.id = interaction.id;

		/**
		 * The command interaction.
		 * @type {CommandInteraction}
		 */
		this.interaction = interaction;

		/**
		 * Represents the author of the interaction as a guild member.
		 * Only available if the interaction comes from a guild where the author is still a member.
		 * @type {GuildMember|APIInteractionGuildMember}
		 */
		this.member = interaction.member;

		/**
		 * Whether or not the interaction has been replied to.
		 * @type {boolean}
		 */
		this.replied = replied;

		/**
		 * Utilities for command responding.
		 * @type {CommandUtil}
		 */
		// @ts-expect-error
		this.util = { parsed: { slash } };
		for (const option of command.slashOptions){
			this.content += ` ${option.name}: ${interaction.options.get(option.name, option.required||false)}`;
		}
	}

	/**
	 * Replies or edits the reply of the slash command.
	 * @param {string | MessagePayload | InteractionReplyOptions} options The options to edit the reply.
	 * @returns {Promise<Message | APIMessage>}
	 */
	reply(options) {
		return this.util.reply(options);
	}

	/**
	 * Deletes the reply to the command.
	 * @returns {Promise<void>}
	 */
	delete() {
		return this.interaction.deleteReply();
	}
}
