import {
	BaseGuildVoiceChannel,
	Collection,
	GuildMember,
	Message,
	NewsChannel,
	Snowflake,
	TextChannel,
	ThreadChannel
} from "discord.js";
import { URL } from "url";
import { GuildTextBasedChannels } from "../../../typings/guildTextBasedChannels";
import { ArgumentTypes } from "../../../util/Constants";
import AkairoClient from "../../AkairoClient";
import InhibitorHandler from "../../inhibitors/InhibitorHandler";
import ListenerHandler from "../../listeners/ListenerHandler";
import CommandHandler from "../CommandHandler";
import { ArgumentTypeCaster } from "./Argument";

/**
 * Type resolver for command arguments.
 * The types are documented under ArgumentType.
 * @param handler - The command handler.
 */
export default class TypeResolver {
	public constructor(handler: CommandHandler) {
		this.client = handler.client;

		this.commandHandler = handler;

		this.inhibitorHandler = null;

		this.listenerHandler = null;

		this.types = new Collection();

		this.addBuiltInTypes();
	}

	/**
	 * The Akairo client.
	 */
	public client: AkairoClient;

	/**
	 * The command handler.
	 */
	public commandHandler: CommandHandler;

	/**
	 * The inhibitor handler.
	 */
	public inhibitorHandler?: InhibitorHandler | null;

	/**
	 * The listener handler.
	 */
	public listenerHandler?: ListenerHandler | null;

	/**
	 * Collection of types.
	 */
	public types: Collection<string, ArgumentTypeCaster>;

	/**
	 * Adds built-in types.
	 */
	public addBuiltInTypes(): void {
		const builtins = {
			[ArgumentTypes.STRING]: (_message: Message, phrase: string) => {
				return phrase || null;
			},

			[ArgumentTypes.LOWERCASE]: (_message: Message, phrase: string) => {
				return phrase ? phrase.toLowerCase() : null;
			},

			[ArgumentTypes.UPPERCASE]: (_message: Message, phrase: string) => {
				return phrase ? phrase.toUpperCase() : null;
			},

			[ArgumentTypes.CHAR_CODES]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				const codes = [];
				for (const char of phrase) codes.push(char.charCodeAt(0));
				return codes;
			},

			[ArgumentTypes.NUMBER]: (_message: Message, phrase: string) => {
				if (!phrase || isNaN(+phrase)) return null;
				return parseFloat(phrase);
			},

			[ArgumentTypes.INTEGER]: (_message: Message, phrase: string) => {
				if (!phrase || isNaN(+phrase)) return null;
				return parseInt(phrase);
			},

			[ArgumentTypes.BIGINT]: (_message: Message, phrase: string) => {
				if (!phrase || isNaN(+phrase)) return null;
				return BigInt(phrase);
			},

			// Just for fun.
			[ArgumentTypes.EMOJINT]: (
				_message: Message,
				phrase: {
					replace: (arg0: RegExp, arg1: (m: any) => number) => any;
				}
			) => {
				if (!phrase) return null;
				const n = phrase.replace(
					/0⃣|1⃣|2⃣|3⃣|4⃣|5⃣|6⃣|7⃣|8⃣|9⃣|🔟/g,
					(m: string) => {
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

			[ArgumentTypes.URL]: (_message: Message, phrase) => {
				if (!phrase) return null;
				if (/^<.+>$/.test(phrase)) phrase = phrase.slice(1, -1);

				try {
					return new URL(phrase);
				} catch (err) {
					return null;
				}
			},

			[ArgumentTypes.DATE]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				const timestamp = Date.parse(phrase);
				if (isNaN(timestamp)) return null;
				return new Date(timestamp);
			},

			[ArgumentTypes.COLOR]: (_message: Message, phrase: string) => {
				if (!phrase) return null;

				const color = parseInt(phrase.replace("#", ""), 16);
				if (color < 0 || color > 0xffffff || isNaN(color)) {
					return null;
				}

				return color;
			},

			[ArgumentTypes.USER]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				return this.client.util.resolveUser(phrase, this.client.users.cache);
			},

			[ArgumentTypes.USERS]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				const users = this.client.util.resolveUsers(
					phrase,
					this.client.users.cache
				);
				return users.size ? users : null;
			},

			[ArgumentTypes.MEMBER]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveMember(
					phrase,
					message.guild.members.cache
				);
			},

			[ArgumentTypes.MEMBERS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const members = this.client.util.resolveMembers(
					phrase,
					message.guild.members.cache
				);
				return members.size ? members : null;
			},

			[ArgumentTypes.RELEVANT]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;

				const person = message.guild
					? this.client.util.resolveMember(phrase, message.guild.members.cache)
					: message.channel.type === "DM"
					? this.client.util.resolveUser(
							phrase,
							new Collection([
								[message.channel.recipient.id, message.channel.recipient],
								[this.client.user?.id, this.client.user]
							])
					  )
					: this.client.util.resolveUser(
							phrase,
							new Collection([
								[this.client.user?.id, this.client.user]
								// Not sure why this is here, bots can't be in group dms
								// @ts-expect-error
							]).concat(message.channel.recipients)
					  );

				if (!person) return null;
				return message.guild ? (person as GuildMember).user : person;
			},

			[ArgumentTypes.RELEVANTS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				const persons = message.guild
					? this.client.util.resolveMembers(phrase, message.guild.members.cache)
					: message.channel.type === "DM"
					? this.client.util.resolveUsers(
							phrase,
							new Collection([
								[message.channel.recipient.id, message.channel.recipient],
								[this.client.user?.id, this.client.user]
							])
					  )
					: this.client.util.resolveUsers(
							phrase,
							new Collection([
								[this.client.user?.id, this.client.user]
								// Not sure why this is here, bots can't be in group dms
								// @ts-expect-error
							]).concat(message.channel.recipients)
					  );

				if (!persons.size) return null;
				return message.guild
					? (persons as Collection<string, GuildMember>).map(
							member => member.user
					  )
					: persons;
			},

			[ArgumentTypes.CHANNEL]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
			},

			[ArgumentTypes.CHANNELS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				return channels.size ? channels : null;
			},

			[ArgumentTypes.TEXT_CHANNEL]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channel || channel.type !== "GUILD_TEXT") return null;

				return channel;
			},

			[ArgumentTypes.TEXT_CHANNELS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channels.size) return null;

				const textChannels = channels.filter(c => c.type === "GUILD_TEXT");
				return textChannels.size ? textChannels : null;
			},

			[ArgumentTypes.VOICE_CHANNEL]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channel || !channel.isVoice()) return null;
				return channel;
			},

			[ArgumentTypes.VOICE_CHANNELS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channels.size) return null;

				const voiceChannels = channels.filter(c => c.type === "GUILD_VOICE");
				return voiceChannels.size ? voiceChannels : null;
			},

			[ArgumentTypes.CATEGORY_CHANNEL]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channel || channel.type !== "GUILD_CATEGORY") return null;

				return channel;
			},

			[ArgumentTypes.CATEGORY_CHANNELS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channels.size) return null;

				const categoryChannels = channels.filter(
					c => c.type === "GUILD_CATEGORY"
				);
				return categoryChannels.size ? categoryChannels : null;
			},

			[ArgumentTypes.NEWS_CHANNEL]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channel || channel.type !== "GUILD_NEWS") return null;

				return channel;
			},

			[ArgumentTypes.NEWS_CHANNELS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channels.size) return null;

				const newsChannels = channels.filter(c => c.type === "GUILD_NEWS");
				return newsChannels.size ? newsChannels : null;
			},

			[ArgumentTypes.STORE_CHANNEL]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channel || channel.type !== "GUILD_STORE") return null;

				return channel;
			},

			[ArgumentTypes.STORE_CHANNELS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channels.size) return null;

				const storeChannels = channels.filter(c => c.type === "GUILD_STORE");
				return storeChannels.size ? storeChannels : null;
			},

			[ArgumentTypes.STAGE_CHANNEL]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channel || channel.type !== "GUILD_STAGE_VOICE") return null;

				return channel;
			},

			[ArgumentTypes.STAGE_CHANNELS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channels.size) return null;

				const storeChannels = channels.filter(
					c => c.type === "GUILD_STAGE_VOICE"
				);
				return storeChannels.size ? storeChannels : null;
			},

			[ArgumentTypes.THREAD_CHANNEL]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channel || !channel.type.includes("THREAD")) return null;

				return channel;
			},

			[ArgumentTypes.THREAD_CHANNELS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache as Collection<
						string,
						GuildTextBasedChannels | BaseGuildVoiceChannel
					>
				);
				if (!channels.size) return null;

				const storeChannels = channels.filter(c => c.type.includes("THREAD"));
				return storeChannels.size ? storeChannels : null;
			},

			[ArgumentTypes.ROLE]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveRole(phrase, message.guild.roles.cache);
			},

			[ArgumentTypes.ROLES]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const roles = this.client.util.resolveRoles(
					phrase,
					message.guild.roles.cache
				);
				return roles.size ? roles : null;
			},

			[ArgumentTypes.EMOJI]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveEmoji(
					phrase,
					message.guild.emojis.cache
				);
			},

			[ArgumentTypes.EMOJIS]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const emojis = this.client.util.resolveEmojis(
					phrase,
					message.guild.emojis.cache
				);
				return emojis.size ? emojis : null;
			},

			[ArgumentTypes.GUILD]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				return this.client.util.resolveGuild(phrase, this.client.guilds.cache);
			},

			[ArgumentTypes.GUILDS]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				const guilds = this.client.util.resolveGuilds(
					phrase,
					this.client.guilds.cache
				);
				return guilds.size ? guilds : null;
			},

			[ArgumentTypes.MESSAGE]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				try {
					return message.channel.messages.fetch(phrase as Snowflake);
				} catch (e) {
					return null;
				}
			},

			[ArgumentTypes.GUILD_MESSAGE]: async (
				message: Message,
				phrase: string
			) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				for (const channel of message.guild.channels.cache.values()) {
					if (channel.type !== "GUILD_TEXT") continue;
					try {
						return await (
							channel as TextChannel | NewsChannel | ThreadChannel
						).messages.fetch(phrase as Snowflake);
					} catch (err) {
						if (/^Invalid Form Body/.test(err.message)) return null;
					}
				}

				return null;
			},

			[ArgumentTypes.RELEVANT_MESSAGE]: async (
				message: Message,
				phrase: string
			) => {
				if (!phrase) return null;
				const hereMsg = await message.channel.messages
					.fetch(phrase as Snowflake)
					.catch(() => null);
				if (hereMsg) {
					return hereMsg;
				}

				if (message.guild) {
					for (const channel of message.guild.channels.cache.values()) {
						if (channel.type !== "GUILD_TEXT") continue;
						try {
							return await (
								channel as TextChannel | NewsChannel | ThreadChannel
							).messages.fetch(phrase as Snowflake);
						} catch (err) {
							if (/^Invalid Form Body/.test(err.message)) return null;
						}
					}
				}

				return null;
			},

			[ArgumentTypes.INVITE]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				try {
					return this.client.fetchInvite(phrase);
				} catch (e) {
					return null;
				}
			},

			[ArgumentTypes.USER_MENTION]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				const id = phrase.match(/<@!?(\d{17,19})>/);
				if (!id) return null;
				return this.client.users.cache.get(id[1] as Snowflake) || null;
			},

			[ArgumentTypes.MEMBER_MENTION]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<@!?(\d{17,19})>/);
				if (!id) return null;
				return message.guild.members.cache.get(id[1] as Snowflake) || null;
			},

			[ArgumentTypes.CHANNEL_MENTION]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<#(\d{17,19})>/);
				if (!id) return null;
				return message.guild.channels.cache.get(id[1] as Snowflake) || null;
			},

			[ArgumentTypes.ROLE_MENTION]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<@&(\d{17,19})>/);
				if (!id) return null;
				return message.guild.roles.cache.get(id[1] as Snowflake) || null;
			},

			[ArgumentTypes.EMOJI_MENTION]: (message: Message, phrase: string) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<a?:[a-zA-Z0-9_]+:(\d{17,19})>/);
				if (!id) return null;
				return message.guild.emojis.cache.get(id[1] as Snowflake) || null;
			},

			[ArgumentTypes.COMMAND_ALIAS]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				return this.commandHandler.findCommand(phrase) || null;
			},

			[ArgumentTypes.COMMAND]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				return this.commandHandler.modules.get(phrase) || null;
			},

			[ArgumentTypes.INHIBITOR]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				return this.inhibitorHandler?.modules.get(phrase) || null;
			},

			[ArgumentTypes.LISTENER]: (_message: Message, phrase: string) => {
				if (!phrase) return null;
				return this.listenerHandler?.modules.get(phrase) || null;
			}
		};

		for (const [key, value] of Object.entries(builtins)) {
			// @ts-expect-error
			this.types.set(key, value);
		}
	}

	/**
	 * Gets the resolver function for a type.
	 * @param name - Name of type.
	 */
	public type(name: string): ArgumentTypeCaster | undefined {
		return this.types.get(name);
	}

	/**
	 * Adds a new type.
	 * @param name - Name of the type.
	 * @param fn - Function that casts the type.
	 */
	public addType(name: string, fn: ArgumentTypeCaster): TypeResolver {
		this.types.set(name, fn);
		return this;
	}

	/**
	 * Adds multiple new types.
	 * @param types  - Object with keys as the type name and values as the cast function.
	 */
	public addTypes(types: any): TypeResolver {
		for (const [key, value] of Object.entries(types)) {
			this.addType(key, value as any);
		}

		return this;
	}
}
