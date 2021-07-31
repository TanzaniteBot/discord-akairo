// @ts-check
"use strict";

/**
 * @typedef {import("../CommandUtil").CommandHandler} CommandHandler
 * @typedef {import("../../AkairoClient")} AkairoClient
 * @typedef {import("./Argument").ArgumentTypeCaster} ArgumentTypeCaster
 * @typedef {import("../../listeners/ListenerHandler")} ListenerHandler
 * @typedef {import("../../inhibitors/InhibitorHandler")} InhibitorHandler
 * @typedef {import("../CommandUtil")} CommandUtil
 * @typedef {import("discord.js").User} User
 * @typedef {import("discord.js").GuildMember} GuildMember
 * @typedef {import("discord.js").Snowflake} Snowflake
 * @typedef {import("../CommandUtil").Message} Message
 */

const { ArgumentTypes } = require("../../../util/Constants");
const { Collection } = require("discord.js");
const { URL } = require("url");

/**
 * Type resolver for command arguments.
 * The types are documented under ArgumentType.
 * @param {CommandHandler} handler - The command handler.
 */
class TypeResolver {
	/**
	 * @param {CommandHandler} handler - The command handler.
	 */
	constructor(handler) {
		/**
		 * The Akairo client.
		 * @type {AkairoClient}
		 */
		this.client = handler.client;

		/**
		 * The command handler.
		 * @type {CommandHandler}
		 */
		this.commandHandler = handler;

		/**
		 * The inhibitor handler.
		 * @type {InhibitorHandler|null}
		 */
		this.inhibitorHandler = null;

		/**
		 * The listener handler.
		 * @type {ListenerHandler|null}
		 */
		this.listenerHandler = null;

		/**
		 * Collection of types.
		 * @type {Collection<string, ArgumentTypeCaster>}
		 */
		this.types = new Collection();

		this.addBuiltInTypes();
	}

	/**
	 * Adds built-in types.
	 * @returns {void}
	 */
	addBuiltInTypes() {
		const builtins = {
			[ArgumentTypes.STRING]: (/** @type {Message} */ message, phrase) => {
				return phrase || null;
			},

			[ArgumentTypes.LOWERCASE]: (/** @type {Message} */ message, phrase) => {
				return phrase ? phrase.toLowerCase() : null;
			},

			[ArgumentTypes.UPPERCASE]: (/** @type {Message} */ message, phrase) => {
				return phrase ? phrase.toUpperCase() : null;
			},

			[ArgumentTypes.CHAR_CODES]: (/** @type {Message} */ message, phrase) => {
				if (!phrase) return null;
				const codes = [];
				for (const char of phrase) codes.push(char.charCodeAt(0));
				return codes;
			},

			[ArgumentTypes.NUMBER]: (/** @type {Message} */ message, phrase) => {
				if (!phrase || isNaN(phrase)) return null;
				return parseFloat(phrase);
			},

			[ArgumentTypes.INTEGER]: (/** @type {Message} */ message, phrase) => {
				if (!phrase || isNaN(phrase)) return null;
				return parseInt(phrase);
			},

			[ArgumentTypes.BIGINT]: (/** @type {Message} */ message, phrase) => {
				if (!phrase || isNaN(phrase)) return null;
				return BigInt(phrase); // eslint-disable-line no-undef, new-cap
			},

			// Just for fun.
			[ArgumentTypes.EMOJINT]: (
				/** @type {Message} */ message,
				/** @type {{ replace: (arg0: RegExp, arg1: (m: any) => number) => any; }} */ phrase
			) => {
				if (!phrase) return null;
				const n = phrase.replace(
					/0⃣|1⃣|2⃣|3⃣|4⃣|5⃣|6⃣|7⃣|8⃣|9⃣|🔟/g,
					(/** @type {string} */ m) => {
						return [
							"0⃣",
							"1⃣",
							"2⃣",
							"3⃣",
							"4⃣",
							"5⃣",
							"6⃣",
							"7⃣",
							"8⃣",
							"9⃣",
							"🔟"
						].indexOf(m);
					}
				);

				if (isNaN(n)) return null;
				return parseInt(n);
			},

			[ArgumentTypes.URL]: (/** @type {Message} */ message, phrase) => {
				if (!phrase) return null;
				if (/^<.+>$/.test(phrase)) phrase = phrase.slice(1, -1);

				try {
					return new URL(phrase);
				} catch (err) {
					return null;
				}
			},

			[ArgumentTypes.DATE]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				const timestamp = Date.parse(phrase);
				if (isNaN(timestamp)) return null;
				return new Date(timestamp);
			},

			[ArgumentTypes.COLOR]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;

				const color = parseInt(phrase.replace("#", ""), 16);
				if (color < 0 || color > 0xffffff || isNaN(color)) {
					return null;
				}

				return color;
			},

			[ArgumentTypes.USER]: (
				/** @type {Message} */ message,
				/** @type {string | `${bigint}`} */ phrase
			) => {
				if (!phrase) return null;
				return this.client.util.resolveUser(phrase, this.client.users.cache);
			},

			[ArgumentTypes.USERS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				const users = this.client.util.resolveUsers(
					phrase,
					this.client.users.cache
				);
				return users.size ? users : null;
			},

			[ArgumentTypes.MEMBER]: (
				/** @type {Message}} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveMember(
					phrase,
					message.guild.members.cache
				);
			},

			[ArgumentTypes.MEMBERS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const members = this.client.util.resolveMembers(
					phrase,
					message.guild.members.cache
				);
				return members.size ? members : null;
			},

			[ArgumentTypes.RELEVANT]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;

				const person = message.channel.type.startsWith("GUILD")
					? this.client.util.resolveMember(phrase, message.guild.members.cache)
					: message.channel.type === "DM"
					? this.client.util.resolveUser(
							phrase,
							// @ts-expect-error
							new Collection([
								[message.channel.recipient.id, message.channel.recipient],
								[this.client.user?.id, this.client.user]
							])
					  )
					: this.client.util.resolveUser(
							phrase, // @ts-expect-error
							new Collection([
								[this.client.user?.id, this.client.user]
								// Not sure why this is here, bots can't be in group dms
								// @ts-expect-error
							]).concat(message.channel.recipients)
					  );

				if (!person) return null;
				// @ts-expect-error
				if (message.channel.type.startsWith("GUILD")) return person.user;
				return person;
			},

			[ArgumentTypes.RELEVANTS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				const persons = message.channel.type.startsWith("GUILD")
					? // @ts-expect-error
					  this.client.util.resolveMembers(phrase, message.guild.members.cache)
					: message.channel.type === "DM"
					? this.client.util.resolveUsers(
							phrase,
							// @ts-expect-error
							new Collection([
								[message.channel.recipient.id, message.channel.recipient],
								[this.client.user?.id, this.client.user]
							])
					  )
					: this.client.util.resolveUsers(
							phrase,
							// @ts-expect-error
							new Collection([
								[this.client.user?.id, this.client.user]
								// Not sure why this is here, bots can't be in group dms
								// @ts-expect-error
							]).concat(message.channel.recipients)
					  );

				if (!persons.size) return null;

				if (message.channel.type.startsWith("GUILD")) {
					// @ts-expect-error
					return persons.map(
						(/** @type {GuildMember} */ member) => member.user
					);
				}

				return persons;
			},

			[ArgumentTypes.CHANNEL]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
			},

			[ArgumentTypes.CHANNELS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache
				);
				return channels.size ? channels : null;
			},

			[ArgumentTypes.TEXT_CHANNEL]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_TEXT") return null;

				return channel;
			},

			[ArgumentTypes.TEXT_CHANNELS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache
				);
				if (!channels.size) return null;

				const textChannels = channels.filter(c => c.type === "GUILD_TEXT");
				return textChannels.size ? textChannels : null;
			},

			[ArgumentTypes.VOICE_CHANNEL]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_VOICE") return null;

				return channel;
			},

			[ArgumentTypes.VOICE_CHANNELS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache
				);
				if (!channels.size) return null;

				const voiceChannels = channels.filter(c => c.type === "GUILD_VOICE");
				return voiceChannels.size ? voiceChannels : null;
			},

			[ArgumentTypes.CATEGORY_CHANNEL]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_CATEGORY") return null;

				return channel;
			},

			[ArgumentTypes.CATEGORY_CHANNELS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache
				);
				if (!channels.size) return null;

				const categoryChannels = channels.filter(
					c => c.type === "GUILD_CATEGORY"
				);
				return categoryChannels.size ? categoryChannels : null;
			},

			[ArgumentTypes.NEWS_CHANNEL]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_NEWS") return null;

				return channel;
			},

			[ArgumentTypes.NEWS_CHANNELS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache
				);
				if (!channels.size) return null;

				const newsChannels = channels.filter(c => c.type === "GUILD_NEWS");
				return newsChannels.size ? newsChannels : null;
			},

			[ArgumentTypes.STORE_CHANNEL]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_STORE") return null;

				return channel;
			},

			[ArgumentTypes.STORE_CHANNELS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache
				);
				if (!channels.size) return null;

				const storeChannels = channels.filter(c => c.type === "GUILD_STORE");
				return storeChannels.size ? storeChannels : null;
			},

			[ArgumentTypes.STAGE_CHANNEL]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_STAGE_VOICE") return null;

				return channel;
			},

			[ArgumentTypes.STAGE_CHANNELS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache
				);
				if (!channels.size) return null;

				const storeChannels = channels.filter(
					c => c.type === "GUILD_STAGE_VOICE"
				);
				return storeChannels.size ? storeChannels : null;
			},

			[ArgumentTypes.THREAD_CHANNEL]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || !channel.type.includes("THREAD")) return null;

				return channel;
			},

			[ArgumentTypes.THREAD_CHANNELS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache
				);
				if (!channels.size) return null;

				const storeChannels = channels.filter(c => c.type.includes("THREAD"));
				return storeChannels.size ? storeChannels : null;
			},

			[ArgumentTypes.ROLE]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveRole(phrase, message.guild.roles.cache);
			},

			[ArgumentTypes.ROLES]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const roles = this.client.util.resolveRoles(
					phrase,
					message.guild.roles.cache
				);
				return roles.size ? roles : null;
			},

			[ArgumentTypes.EMOJI]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveEmoji(
					phrase,
					message.guild.emojis.cache
				);
			},

			[ArgumentTypes.EMOJIS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const emojis = this.client.util.resolveEmojis(
					phrase,
					message.guild.emojis.cache
				);
				return emojis.size ? emojis : null;
			},

			[ArgumentTypes.GUILD]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				return this.client.util.resolveGuild(phrase, this.client.guilds.cache);
			},

			[ArgumentTypes.GUILDS]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				const guilds = this.client.util.resolveGuilds(
					phrase,
					this.client.guilds.cache
				);
				return guilds.size ? guilds : null;
			},

			[ArgumentTypes.MESSAGE]: (/** @type {Message} */ message, phrase) => {
				if (!phrase) return null;
				return message.channel.messages.fetch(phrase).catch(() => null);
			},

			[ArgumentTypes.GUILD_MESSAGE]: async (
				/** @type {Message} */ message,
				phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				for (const channel of message.guild.channels.cache.values()) {
					if (channel.type !== "GUILD_TEXT") continue;
					try {
						// @ts-expect-error
						return await channel.messages.fetch(phrase);
					} catch (err) {
						if (/^Invalid Form Body/.test(err.message)) return null;
					}
				}

				return null;
			},

			[ArgumentTypes.RELEVANT_MESSAGE]: async (
				/** @type {Message} */ message,
				phrase
			) => {
				if (!phrase) return null;
				const hereMsg = await message.channel.messages
					.fetch(phrase)
					.catch(() => null);
				if (hereMsg) {
					return hereMsg;
				}

				if (message.guild) {
					for (const channel of message.guild.channels.cache.values()) {
						if (channel.type !== "GUILD_TEXT") continue;
						try {
							// @ts-expect-error
							return await channel.messages.fetch(phrase);
						} catch (err) {
							if (/^Invalid Form Body/.test(err.message)) return null;
						}
					}
				}

				return null;
			},

			[ArgumentTypes.INVITE]: (/** @type {Message} */ message, phrase) => {
				if (!phrase) return null;
				return this.client.fetchInvite(phrase).catch(() => null);
			},

			[ArgumentTypes.USER_MENTION]: (
				/** @type {Message} */ message,
				phrase
			) => {
				if (!phrase) return null;
				const id = phrase.match(/<@!?(\d{17,19})>/);
				if (!id) return null;
				return this.client.users.cache.get(id[1]) || null;
			},

			[ArgumentTypes.MEMBER_MENTION]: (
				/** @type {Message} */ message,
				phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<@!?(\d{17,19})>/);
				if (!id) return null;
				return message.guild.members.cache.get(id[1]) || null;
			},

			[ArgumentTypes.CHANNEL_MENTION]: (
				/** @type {Message} */ message,
				phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<#(\d{17,19})>/);
				if (!id) return null;
				return message.guild.channels.cache.get(id[1]) || null;
			},

			[ArgumentTypes.ROLE_MENTION]: (
				/** @type {Message} */ message,
				phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<@&(\d{17,19})>/);
				if (!id) return null;
				return message.guild.roles.cache.get(id[1]) || null;
			},

			[ArgumentTypes.EMOJI_MENTION]: (
				/** @type {Message} */ message,
				phrase
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<a?:[a-zA-Z0-9_]+:(\d{17,19})>/);
				if (!id) return null;
				return message.guild.emojis.cache.get(id[1]) || null;
			},

			[ArgumentTypes.COMMAND_ALIAS]: (
				/** @type {Message} */ message,
				phrase
			) => {
				if (!phrase) return null;
				return this.commandHandler.findCommand(phrase) || null;
			},

			[ArgumentTypes.COMMAND]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				return this.commandHandler.modules.get(phrase) || null;
			},

			[ArgumentTypes.INHIBITOR]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				return this.inhibitorHandler?.modules.get(phrase) || null;
			},

			[ArgumentTypes.LISTENER]: (
				/** @type {Message} */ message,
				/** @type {string} */ phrase
			) => {
				if (!phrase) return null;
				return this.listenerHandler?.modules.get(phrase) || null;
			}
		};

		for (const [key, value] of Object.entries(builtins)) {
			this.types.set(key, value);
		}
	}

	/**
	 * Gets the resolver function for a type.
	 * @param {string} name - Name of type.
	 * @returns {ArgumentTypeCaster|undefined}
	 */
	type(name) {
		return this.types.get(name);
	}

	/**
	 * Adds a new type.
	 * @param {string} name - Name of the type.
	 * @param {ArgumentTypeCaster} fn - Function that casts the type.
	 * @returns {TypeResolver}
	 */
	addType(name, fn) {
		this.types.set(name, fn);
		return this;
	}

	/**
	 * Adds multiple new types.
	 * @param {Object} types  - Object with keys as the type name and values as the cast function.
	 * @returns {TypeResolver}
	 */
	addTypes(types) {
		for (const [key, value] of Object.entries(types)) {
			this.addType(key, value);
		}

		return this;
	}
}

module.exports = TypeResolver;
