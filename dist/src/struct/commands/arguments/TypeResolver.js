"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("../../../util/Constants");
const discord_js_1 = require("discord.js");
const url_1 = require("url");
/**
 * Type resolver for command arguments.
 * The types are documented under ArgumentType.
 * @param handler - The command handler.
 */
class TypeResolver {
	/** The Akairo client. */
	client;
	/** The command handler. */
	commandHandler;
	/** The inhibitor handler. */
	inhibitorHandler;
	/** The listener handler. */
	listenerHandler;
	/** Collection of types. */
	types;
	constructor(handler) {
		this.client = handler.client;
		this.commandHandler = handler;
		this.inhibitorHandler = null;
		this.listenerHandler = null;
		this.types = new discord_js_1.Collection();
		this.addBuiltInTypes();
	}
	/**
	 * Adds built-in types.
	 * @returns {void}
	 */
	addBuiltInTypes() {
		const builtins = {
			[Constants_1.ArgumentTypes.STRING]: (_message, phrase) => {
				return phrase || null;
			},
			[Constants_1.ArgumentTypes.LOWERCASE]: (_message, phrase) => {
				return phrase ? phrase.toLowerCase() : null;
			},
			[Constants_1.ArgumentTypes.UPPERCASE]: (_message, phrase) => {
				return phrase ? phrase.toUpperCase() : null;
			},
			[Constants_1.ArgumentTypes.CHAR_CODES]: (_message, phrase) => {
				if (!phrase) return null;
				const codes = [];
				for (const char of phrase) codes.push(char.charCodeAt(0));
				return codes;
			},
			[Constants_1.ArgumentTypes.NUMBER]: (_message, phrase) => {
				if (!phrase || isNaN(+phrase)) return null;
				return parseFloat(phrase);
			},
			[Constants_1.ArgumentTypes.INTEGER]: (_message, phrase) => {
				if (!phrase || isNaN(+phrase)) return null;
				return parseInt(phrase);
			},
			[Constants_1.ArgumentTypes.BIGINT]: (_message, phrase) => {
				if (!phrase || isNaN(+phrase)) return null;
				return BigInt(phrase); // eslint-disable-line no-undef, new-cap
			},
			// Just for fun.
			[Constants_1.ArgumentTypes.EMOJINT]: (_message, phrase) => {
				if (!phrase) return null;
				const n = phrase.replace(/0⃣|1⃣|2⃣|3⃣|4⃣|5⃣|6⃣|7⃣|8⃣|9⃣|🔟/g, m => {
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
				});
				if (isNaN(n)) return null;
				return parseInt(n);
			},
			[Constants_1.ArgumentTypes.URL]: (_message, phrase) => {
				if (!phrase) return null;
				if (/^<.+>$/.test(phrase)) phrase = phrase.slice(1, -1);
				try {
					return new url_1.URL(phrase);
				} catch (err) {
					return null;
				}
			},
			[Constants_1.ArgumentTypes.DATE]: (_message, phrase) => {
				if (!phrase) return null;
				const timestamp = Date.parse(phrase);
				if (isNaN(timestamp)) return null;
				return new Date(timestamp);
			},
			[Constants_1.ArgumentTypes.COLOR]: (_message, phrase) => {
				if (!phrase) return null;
				const color = parseInt(phrase.replace("#", ""), 16);
				if (color < 0 || color > 0xffffff || isNaN(color)) {
					return null;
				}
				return color;
			},
			[Constants_1.ArgumentTypes.USER]: (_message, phrase) => {
				if (!phrase) return null;
				return this.client.util.resolveUser(phrase, this.client.users.cache);
			},
			[Constants_1.ArgumentTypes.USERS]: (_message, phrase) => {
				if (!phrase) return null;
				const users = this.client.util.resolveUsers(
					phrase,
					this.client.users.cache
				);
				return users.size ? users : null;
			},
			[Constants_1.ArgumentTypes.MEMBER]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveMember(
					phrase,
					message.guild.members.cache
				);
			},
			[Constants_1.ArgumentTypes.MEMBERS]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const members = this.client.util.resolveMembers(
					phrase,
					message.guild.members.cache
				);
				return members.size ? members : null;
			},
			[Constants_1.ArgumentTypes.RELEVANT]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const person = message.channel.type.startsWith("GUILD")
					? this.client.util.resolveMember(phrase, message.guild.members.cache)
					: message.channel.type === "DM"
					? this.client.util.resolveUser(
							phrase,
							new discord_js_1.Collection([
								[message.channel.recipient.id, message.channel.recipient],
								[this.client.user?.id, this.client.user]
							])
					  )
					: this.client.util.resolveUser(
							phrase,
							new discord_js_1.Collection([
								[this.client.user?.id, this.client.user]
								// Not sure why this is here, bots can't be in group dms
								// @ts-expect-error
							]).concat(message.channel.recipients)
					  );
				if (!person) return null;
				if (message.guild) return person.user;
				return person;
			},
			[Constants_1.ArgumentTypes.RELEVANTS]: (message, phrase) => {
				if (!phrase) return null;
				const persons = message.channel.type.startsWith("GUILD")
					? this.client.util.resolveMembers(phrase, message.guild.members.cache)
					: message.channel.type === "DM"
					? this.client.util.resolveUsers(
							phrase,
							new discord_js_1.Collection([
								[message.channel.recipient.id, message.channel.recipient],
								[this.client.user?.id, this.client.user]
							])
					  )
					: this.client.util.resolveUsers(
							phrase,
							new discord_js_1.Collection([
								[this.client.user?.id, this.client.user]
								// Not sure why this is here, bots can't be in group dms
								// @ts-expect-error
							]).concat(message.channel.recipients)
					  );
				if (!persons.size) return null;
				if (message.channel.type.startsWith("GUILD")) {
					// @ts-expect-error
					return persons.map(member => member.user);
				}
				return persons;
			},
			[Constants_1.ArgumentTypes.CHANNEL]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
			},
			[Constants_1.ArgumentTypes.CHANNELS]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channels = this.client.util.resolveChannels(
					phrase,
					message.guild.channels.cache
				);
				return channels.size ? channels : null;
			},
			[Constants_1.ArgumentTypes.TEXT_CHANNEL]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_TEXT") return null;
				return channel;
			},
			[Constants_1.ArgumentTypes.TEXT_CHANNELS]: (message, phrase) => {
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
			[Constants_1.ArgumentTypes.VOICE_CHANNEL]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_VOICE") return null;
				return channel;
			},
			[Constants_1.ArgumentTypes.VOICE_CHANNELS]: (message, phrase) => {
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
			[Constants_1.ArgumentTypes.CATEGORY_CHANNEL]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_CATEGORY") return null;
				return channel;
			},
			[Constants_1.ArgumentTypes.CATEGORY_CHANNELS]: (message, phrase) => {
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
			[Constants_1.ArgumentTypes.NEWS_CHANNEL]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_NEWS") return null;
				return channel;
			},
			[Constants_1.ArgumentTypes.NEWS_CHANNELS]: (message, phrase) => {
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
			[Constants_1.ArgumentTypes.STORE_CHANNEL]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_STORE") return null;
				return channel;
			},
			[Constants_1.ArgumentTypes.STORE_CHANNELS]: (message, phrase) => {
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
			[Constants_1.ArgumentTypes.STAGE_CHANNEL]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || channel.type !== "GUILD_STAGE_VOICE") return null;
				return channel;
			},
			[Constants_1.ArgumentTypes.STAGE_CHANNELS]: (message, phrase) => {
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
			[Constants_1.ArgumentTypes.THREAD_CHANNEL]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const channel = this.client.util.resolveChannel(
					phrase,
					message.guild.channels.cache
				);
				if (!channel || !channel.type.includes("THREAD")) return null;
				return channel;
			},
			[Constants_1.ArgumentTypes.THREAD_CHANNELS]: (message, phrase) => {
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
			[Constants_1.ArgumentTypes.ROLE]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveRole(phrase, message.guild.roles.cache);
			},
			[Constants_1.ArgumentTypes.ROLES]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const roles = this.client.util.resolveRoles(
					phrase,
					message.guild.roles.cache
				);
				return roles.size ? roles : null;
			},
			[Constants_1.ArgumentTypes.EMOJI]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				return this.client.util.resolveEmoji(
					phrase,
					message.guild.emojis.cache
				);
			},
			[Constants_1.ArgumentTypes.EMOJIS]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const emojis = this.client.util.resolveEmojis(
					phrase,
					message.guild.emojis.cache
				);
				return emojis.size ? emojis : null;
			},
			[Constants_1.ArgumentTypes.GUILD]: (_message, phrase) => {
				if (!phrase) return null;
				return this.client.util.resolveGuild(phrase, this.client.guilds.cache);
			},
			[Constants_1.ArgumentTypes.GUILDS]: (_message, phrase) => {
				if (!phrase) return null;
				const guilds = this.client.util.resolveGuilds(
					phrase,
					this.client.guilds.cache
				);
				return guilds.size ? guilds : null;
			},
			[Constants_1.ArgumentTypes.MESSAGE]: (message, phrase) => {
				if (!phrase) return null;
				try {
					return message.channel.messages.fetch(phrase);
				} catch (e) {
					return null;
				}
			},
			[Constants_1.ArgumentTypes.GUILD_MESSAGE]: async (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				for (const channel of message.guild.channels.cache.values()) {
					if (channel.type !== "GUILD_TEXT") continue;
					try {
						return await channel.messages.fetch(phrase);
					} catch (err) {
						if (/^Invalid Form Body/.test(err.message)) return null;
					}
				}
				return null;
			},
			[Constants_1.ArgumentTypes.RELEVANT_MESSAGE]: async (message, phrase) => {
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
							return await channel.messages.fetch(phrase);
						} catch (err) {
							if (/^Invalid Form Body/.test(err.message)) return null;
						}
					}
				}
				return null;
			},
			[Constants_1.ArgumentTypes.INVITE]: (_message, phrase) => {
				if (!phrase) return null;
				try {
					return this.client.fetchInvite(phrase);
				} catch (e) {
					return null;
				}
			},
			[Constants_1.ArgumentTypes.USER_MENTION]: (_message, phrase) => {
				if (!phrase) return null;
				const id = phrase.match(/<@!?(\d{17,19})>/);
				if (!id) return null;
				return this.client.users.cache.get(id[1]) || null;
			},
			[Constants_1.ArgumentTypes.MEMBER_MENTION]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<@!?(\d{17,19})>/);
				if (!id) return null;
				return message.guild.members.cache.get(id[1]) || null;
			},
			[Constants_1.ArgumentTypes.CHANNEL_MENTION]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<#(\d{17,19})>/);
				if (!id) return null;
				return message.guild.channels.cache.get(id[1]) || null;
			},
			[Constants_1.ArgumentTypes.ROLE_MENTION]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<@&(\d{17,19})>/);
				if (!id) return null;
				return message.guild.roles.cache.get(id[1]) || null;
			},
			[Constants_1.ArgumentTypes.EMOJI_MENTION]: (message, phrase) => {
				if (!phrase) return null;
				if (!message.guild) return null;
				const id = phrase.match(/<a?:[a-zA-Z0-9_]+:(\d{17,19})>/);
				if (!id) return null;
				return message.guild.emojis.cache.get(id[1]) || null;
			},
			[Constants_1.ArgumentTypes.COMMAND_ALIAS]: (_message, phrase) => {
				if (!phrase) return null;
				return this.commandHandler.findCommand(phrase) || null;
			},
			[Constants_1.ArgumentTypes.COMMAND]: (_message, phrase) => {
				if (!phrase) return null;
				return this.commandHandler.modules.get(phrase) || null;
			},
			[Constants_1.ArgumentTypes.INHIBITOR]: (_message, phrase) => {
				if (!phrase) return null;
				return this.inhibitorHandler?.modules.get(phrase) || null;
			},
			[Constants_1.ArgumentTypes.LISTENER]: (_message, phrase) => {
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
	 * @param types  - Object with keys as the type name and values as the cast function.
	 */
	addTypes(types) {
		for (const [key, value] of Object.entries(types)) {
			this.addType(key, value);
		}
		return this;
	}
}
exports.default = TypeResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9jb21tYW5kcy9hcmd1bWVudHMvVHlwZVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQXdEO0FBQ3hELDJDQVFvQjtBQUNwQiw2QkFBMEI7QUFPMUI7Ozs7R0FJRztBQUNILE1BQXFCLFlBQVk7SUFDaEMseUJBQXlCO0lBQ2xCLE1BQU0sQ0FBZTtJQUU1QiwyQkFBMkI7SUFDcEIsY0FBYyxDQUFpQjtJQUV0Qyw2QkFBNkI7SUFDdEIsZ0JBQWdCLENBQTJCO0lBRWxELDRCQUE0QjtJQUNyQixlQUFlLENBQTBCO0lBRWhELDJCQUEyQjtJQUNwQixLQUFLLENBQXlDO0lBRXJELFlBQW1CLE9BQXVCO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUU3QixJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztRQUU5QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1FBRTdCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBRTVCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7UUFFOUIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxlQUFlO1FBQ2QsTUFBTSxRQUFRLEdBQUc7WUFDaEIsQ0FBQyx5QkFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBaUIsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDN0QsT0FBTyxNQUFNLElBQUksSUFBSSxDQUFDO1lBQ3ZCLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUNoRSxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDN0MsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQWlCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQ2hFLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM3QyxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsUUFBaUIsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDakUsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDakIsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNO29CQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUM3RCxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDM0MsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQWlCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUMzQyxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QixDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBaUIsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDN0QsSUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQzNDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0NBQXdDO1lBQ2hFLENBQUM7WUFFRCxnQkFBZ0I7WUFDaEIsQ0FBQyx5QkFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQ3hCLFFBQWlCLEVBQ2pCLE1BRUMsRUFDQSxFQUFFO2dCQUNILElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUN2QixtQ0FBbUMsRUFDbkMsQ0FBQyxDQUFTLEVBQUUsRUFBRTtvQkFDYixPQUFPO3dCQUNOLElBQUk7d0JBQ0osSUFBSTt3QkFDSixJQUFJO3dCQUNKLElBQUk7d0JBQ0osSUFBSTt3QkFDSixJQUFJO3dCQUNKLElBQUk7d0JBQ0osSUFBSTt3QkFDSixJQUFJO3dCQUNKLElBQUk7d0JBQ0osSUFBSTtxQkFDSixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZCxDQUFDLENBQ0QsQ0FBQztnQkFFRixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQzFCLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNsRCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFeEQsSUFBSTtvQkFDSCxPQUFPLElBQUksU0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN2QjtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDYixPQUFPLElBQUksQ0FBQztpQkFDWjtZQUNGLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUMzRCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNsQyxPQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVCLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUM1RCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFFekIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLFFBQVEsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2xELE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQWlCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQzNELElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQWlCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQzFDLE1BQU0sRUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQ3ZCLENBQUM7Z0JBQ0YsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNsQyxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQ3BDLE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQzNCLENBQUM7WUFDSCxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDN0QsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUM5QyxNQUFNLEVBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUMzQixDQUFDO2dCQUNGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDdEMsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQWdCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBRWhDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7b0JBQ3RELENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDckUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLElBQUk7d0JBQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQzVCLE1BQU0sRUFDTixJQUFJLHVCQUFVLENBQUM7NEJBQ2QsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7NEJBQ3pELENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO3lCQUN4QyxDQUFDLENBQ0Q7d0JBQ0gsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FDNUIsTUFBTSxFQUNOLElBQUksdUJBQVUsQ0FBQzs0QkFDZCxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQzs0QkFDeEMsd0RBQXdEOzRCQUN4RCxtQkFBbUI7eUJBQ25CLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FDcEMsQ0FBQztnQkFFTCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFFekIsSUFBSSxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFRLE1BQXNCLENBQUMsSUFBSSxDQUFDO2dCQUN2RCxPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUMvRCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztvQkFDdkQsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO29CQUN0RSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSTt3QkFDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FDN0IsTUFBTSxFQUVOLElBQUksdUJBQVUsQ0FBQzs0QkFDZCxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQzs0QkFDekQsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7eUJBQ3hDLENBQUMsQ0FDRDt3QkFDSCxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUM3QixNQUFNLEVBQ04sSUFBSSx1QkFBVSxDQUFDOzRCQUNkLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDOzRCQUN4Qyx3REFBd0Q7NEJBQ3hELG1CQUFtQjt5QkFDbkIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUNwQyxDQUFDO2dCQUVMLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFFL0IsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQzdDLG1CQUFtQjtvQkFDbkIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBbUIsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN6RDtnQkFFRCxPQUFPLE9BQU8sQ0FBQztZQUNoQixDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDN0QsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQ3JDLE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQzVCLENBQUM7WUFDSCxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUNoRCxNQUFNLEVBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUM1QixDQUFDO2dCQUNGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDeEMsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE9BQWdCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQ2xFLElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FDOUMsTUFBTSxFQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FDNUIsQ0FBQztnQkFDRixJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssWUFBWTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFFM0QsT0FBTyxPQUFPLENBQUM7WUFDaEIsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLE9BQWdCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQ25FLElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ2hDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FDaEQsTUFBTSxFQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FDNUIsQ0FBQztnQkFDRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUk7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBRWhDLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDO2dCQUNuRSxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ2hELENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUNuRSxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQzlDLE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQzVCLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLGFBQWE7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBRTVELE9BQU8sT0FBTyxDQUFDO1lBQ2hCLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUNwRSxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQ2hELE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQzVCLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUVoQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsQ0FBQztnQkFDckUsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNsRCxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUN0RSxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQzlDLE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQzVCLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLGdCQUFnQjtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFFL0QsT0FBTyxPQUFPLENBQUM7WUFDaEIsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDdkUsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUNoRCxNQUFNLEVBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUM1QixDQUFDO2dCQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFFaEMsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUN2QyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssZ0JBQWdCLENBQ2hDLENBQUM7Z0JBQ0YsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDeEQsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE9BQWdCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQ2xFLElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FDOUMsTUFBTSxFQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FDNUIsQ0FBQztnQkFDRixJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssWUFBWTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFFM0QsT0FBTyxPQUFPLENBQUM7WUFDaEIsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLE9BQWdCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQ25FLElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ2hDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FDaEQsTUFBTSxFQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FDNUIsQ0FBQztnQkFDRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUk7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBRWhDLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDO2dCQUNuRSxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ2hELENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUNuRSxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQzlDLE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQzVCLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLGFBQWE7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBRTVELE9BQU8sT0FBTyxDQUFDO1lBQ2hCLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUNwRSxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQ2hELE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQzVCLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUVoQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsQ0FBQztnQkFDckUsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNsRCxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDbkUsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUM5QyxNQUFNLEVBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUM1QixDQUFDO2dCQUNGLElBQUksQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxtQkFBbUI7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBRWxFLE9BQU8sT0FBTyxDQUFDO1lBQ2hCLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUNwRSxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQ2hELE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQzVCLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUVoQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUNwQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssbUJBQW1CLENBQ25DLENBQUM7Z0JBQ0YsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNsRCxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDcEUsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUM5QyxNQUFNLEVBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUM1QixDQUFDO2dCQUNGLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBRTlELE9BQU8sT0FBTyxDQUFDO1lBQ2hCLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUNyRSxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQ2hELE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQzVCLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUVoQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDdEUsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNsRCxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hFLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFnQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUMzRCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQzFDLE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQ3pCLENBQUM7Z0JBQ0YsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNsQyxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDM0QsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQ25DLE1BQU0sRUFDTixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQzFCLENBQUM7WUFDSCxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUM1QyxNQUFNLEVBQ04sT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUMxQixDQUFDO2dCQUNGLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDcEMsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQWlCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQzVELElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEUsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFFBQWlCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQzdELElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQzVDLE1BQU0sRUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQ3hCLENBQUM7Z0JBQ0YsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNwQyxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDN0QsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUk7b0JBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBbUIsQ0FBQyxDQUFDO2lCQUMzRDtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDWCxPQUFPLElBQUksQ0FBQztpQkFDWjtZQUNGLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsYUFBYSxDQUFDLEVBQUUsS0FBSyxFQUNuQyxPQUFnQixFQUNoQixNQUFjLEVBQ2IsRUFBRTtnQkFDSCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQyxLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRTtvQkFDNUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFlBQVk7d0JBQUUsU0FBUztvQkFDNUMsSUFBSTt3QkFDSCxPQUFPLE1BQ04sT0FDQSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBbUIsQ0FBQyxDQUFDO3FCQUN0QztvQkFBQyxPQUFPLEdBQUcsRUFBRTt3QkFDYixJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDOzRCQUFFLE9BQU8sSUFBSSxDQUFDO3FCQUN4RDtpQkFDRDtnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxLQUFLLEVBQ3RDLE9BQWdCLEVBQ2hCLE1BQWMsRUFDYixFQUFFO2dCQUNILElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUTtxQkFDNUMsS0FBSyxDQUFDLE1BQW1CLENBQUM7cUJBQzFCLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxPQUFPLEVBQUU7b0JBQ1osT0FBTyxPQUFPLENBQUM7aUJBQ2Y7Z0JBRUQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO29CQUNsQixLQUFLLE1BQU0sT0FBTyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRTt3QkFDNUQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFlBQVk7NEJBQUUsU0FBUzt3QkFDNUMsSUFBSTs0QkFDSCxPQUFPLE1BQ04sT0FDQSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBbUIsQ0FBQyxDQUFDO3lCQUN0Qzt3QkFBQyxPQUFPLEdBQUcsRUFBRTs0QkFDYixJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO2dDQUFFLE9BQU8sSUFBSSxDQUFDO3lCQUN4RDtxQkFDRDtpQkFDRDtnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUM3RCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsSUFBSTtvQkFDSCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN2QztnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDWCxPQUFPLElBQUksQ0FBQztpQkFDWjtZQUNGLENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUNuRSxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsRUFBRTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDckIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNoRSxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDcEUsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsRUFBRTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDckIsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNwRSxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDckUsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsRUFBRTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDckIsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNyRSxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDbEUsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsRUFBRTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDckIsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNsRSxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsT0FBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDbkUsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDaEMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsRUFBRTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDckIsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNuRSxDQUFDO1lBRUQsQ0FBQyx5QkFBYSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsUUFBaUIsRUFBRSxNQUFjLEVBQUUsRUFBRTtnQkFDcEUsSUFBSSxDQUFDLE1BQU07b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ3hELENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUM5RCxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQ3hELENBQUM7WUFFRCxDQUFDLHlCQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUNoRSxJQUFJLENBQUMsTUFBTTtvQkFBRSxPQUFPLElBQUksQ0FBQztnQkFDekIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDM0QsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQWlCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxNQUFNO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7WUFDMUQsQ0FBQztTQUNELENBQUM7UUFFRixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNwRCxtQkFBbUI7WUFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzNCO0lBQ0YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxJQUFJLENBQUMsSUFBWTtRQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE9BQU8sQ0FBQyxJQUFZLEVBQUUsRUFBc0I7UUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxLQUFVO1FBQ2xCLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQVksQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0NBQ0Q7QUExbkJELCtCQTBuQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcmd1bWVudFR5cGVzIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQge1xuXHRDb2xsZWN0aW9uLFxuXHRHdWlsZE1lbWJlcixcblx0TWVzc2FnZSxcblx0TmV3c0NoYW5uZWwsXG5cdFNub3dmbGFrZSxcblx0VGV4dENoYW5uZWwsXG5cdFRocmVhZENoYW5uZWxcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IFVSTCB9IGZyb20gXCJ1cmxcIjtcbmltcG9ydCBDb21tYW5kSGFuZGxlciBmcm9tIFwiLi4vQ29tbWFuZEhhbmRsZXJcIjtcbmltcG9ydCB7IEFyZ3VtZW50VHlwZUNhc3RlciB9IGZyb20gXCIuL0FyZ3VtZW50XCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi8uLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBJbmhpYml0b3JIYW5kbGVyIGZyb20gXCIuLi8uLi9pbmhpYml0b3JzL0luaGliaXRvckhhbmRsZXJcIjtcbmltcG9ydCBMaXN0ZW5lckhhbmRsZXIgZnJvbSBcIi4uLy4uL2xpc3RlbmVycy9MaXN0ZW5lckhhbmRsZXJcIjtcblxuLyoqXG4gKiBUeXBlIHJlc29sdmVyIGZvciBjb21tYW5kIGFyZ3VtZW50cy5cbiAqIFRoZSB0eXBlcyBhcmUgZG9jdW1lbnRlZCB1bmRlciBBcmd1bWVudFR5cGUuXG4gKiBAcGFyYW0gaGFuZGxlciAtIFRoZSBjb21tYW5kIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGVSZXNvbHZlciB7XG5cdC8qKiBUaGUgQWthaXJvIGNsaWVudC4gKi9cblx0cHVibGljIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKiBUaGUgY29tbWFuZCBoYW5kbGVyLiAqL1xuXHRwdWJsaWMgY29tbWFuZEhhbmRsZXI6IENvbW1hbmRIYW5kbGVyO1xuXG5cdC8qKiBUaGUgaW5oaWJpdG9yIGhhbmRsZXIuICovXG5cdHB1YmxpYyBpbmhpYml0b3JIYW5kbGVyPzogSW5oaWJpdG9ySGFuZGxlciB8IG51bGw7XG5cblx0LyoqIFRoZSBsaXN0ZW5lciBoYW5kbGVyLiAqL1xuXHRwdWJsaWMgbGlzdGVuZXJIYW5kbGVyPzogTGlzdGVuZXJIYW5kbGVyIHwgbnVsbDtcblxuXHQvKiogQ29sbGVjdGlvbiBvZiB0eXBlcy4gKi9cblx0cHVibGljIHR5cGVzOiBDb2xsZWN0aW9uPHN0cmluZywgQXJndW1lbnRUeXBlQ2FzdGVyPjtcblxuXHRwdWJsaWMgY29uc3RydWN0b3IoaGFuZGxlcjogQ29tbWFuZEhhbmRsZXIpIHtcblx0XHR0aGlzLmNsaWVudCA9IGhhbmRsZXIuY2xpZW50O1xuXG5cdFx0dGhpcy5jb21tYW5kSGFuZGxlciA9IGhhbmRsZXI7XG5cblx0XHR0aGlzLmluaGliaXRvckhhbmRsZXIgPSBudWxsO1xuXG5cdFx0dGhpcy5saXN0ZW5lckhhbmRsZXIgPSBudWxsO1xuXG5cdFx0dGhpcy50eXBlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmFkZEJ1aWx0SW5UeXBlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYnVpbHQtaW4gdHlwZXMuXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKi9cblx0YWRkQnVpbHRJblR5cGVzKCk6IHZvaWQge1xuXHRcdGNvbnN0IGJ1aWx0aW5zID0ge1xuXHRcdFx0W0FyZ3VtZW50VHlwZXMuU1RSSU5HXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcGhyYXNlIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5MT1dFUkNBU0VdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiBwaHJhc2UgPyBwaHJhc2UudG9Mb3dlckNhc2UoKSA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5VUFBFUkNBU0VdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiBwaHJhc2UgPyBwaHJhc2UudG9VcHBlckNhc2UoKSA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DSEFSX0NPREVTXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNvZGVzID0gW107XG5cdFx0XHRcdGZvciAoY29uc3QgY2hhciBvZiBwaHJhc2UpIGNvZGVzLnB1c2goY2hhci5jaGFyQ29kZUF0KDApKTtcblx0XHRcdFx0cmV0dXJuIGNvZGVzO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTlVNQkVSXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSB8fCBpc05hTigrcGhyYXNlKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBwYXJzZUZsb2F0KHBocmFzZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5JTlRFR0VSXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSB8fCBpc05hTigrcGhyYXNlKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBwYXJzZUludChwaHJhc2UpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQklHSU5UXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSB8fCBpc05hTigrcGhyYXNlKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBCaWdJbnQocGhyYXNlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiwgbmV3LWNhcFxuXHRcdFx0fSxcblxuXHRcdFx0Ly8gSnVzdCBmb3IgZnVuLlxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuRU1PSklOVF06IChcblx0XHRcdFx0X21lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0XHRcdHBocmFzZToge1xuXHRcdFx0XHRcdHJlcGxhY2U6IChhcmcwOiBSZWdFeHAsIGFyZzE6IChtOiBhbnkpID0+IG51bWJlcikgPT4gYW55O1xuXHRcdFx0XHR9XG5cdFx0XHQpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBuID0gcGhyYXNlLnJlcGxhY2UoXG5cdFx0XHRcdFx0LzDig6N8MeKDo3wy4oOjfDPig6N8NOKDo3w14oOjfDbig6N8N+KDo3w44oOjfDnig6N88J+Uny9nLFxuXHRcdFx0XHRcdChtOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFx0XHRcdFwiMOKDo1wiLFxuXHRcdFx0XHRcdFx0XHRcIjHig6NcIixcblx0XHRcdFx0XHRcdFx0XCIy4oOjXCIsXG5cdFx0XHRcdFx0XHRcdFwiM+KDo1wiLFxuXHRcdFx0XHRcdFx0XHRcIjTig6NcIixcblx0XHRcdFx0XHRcdFx0XCI14oOjXCIsXG5cdFx0XHRcdFx0XHRcdFwiNuKDo1wiLFxuXHRcdFx0XHRcdFx0XHRcIjfig6NcIixcblx0XHRcdFx0XHRcdFx0XCI44oOjXCIsXG5cdFx0XHRcdFx0XHRcdFwiOeKDo1wiLFxuXHRcdFx0XHRcdFx0XHRcIvCflJ9cIlxuXHRcdFx0XHRcdFx0XS5pbmRleE9mKG0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KTtcblxuXHRcdFx0XHRpZiAoaXNOYU4obikpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQobik7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5VUkxdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZSkgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICgvXjwuKz4kLy50ZXN0KHBocmFzZSkpIHBocmFzZSA9IHBocmFzZS5zbGljZSgxLCAtMSk7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFVSTChwaHJhc2UpO1xuXHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuREFURV06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCB0aW1lc3RhbXAgPSBEYXRlLnBhcnNlKHBocmFzZSk7XG5cdFx0XHRcdGlmIChpc05hTih0aW1lc3RhbXApKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DT0xPUl06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IGNvbG9yID0gcGFyc2VJbnQocGhyYXNlLnJlcGxhY2UoXCIjXCIsIFwiXCIpLCAxNik7XG5cdFx0XHRcdGlmIChjb2xvciA8IDAgfHwgY29sb3IgPiAweGZmZmZmZiB8fCBpc05hTihjb2xvcikpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBjb2xvcjtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlVTRVJdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXIocGhyYXNlLCB0aGlzLmNsaWVudC51c2Vycy5jYWNoZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5VU0VSU106IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCB1c2VycyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXJzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHR0aGlzLmNsaWVudC51c2Vycy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gdXNlcnMuc2l6ZSA/IHVzZXJzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLk1FTUJFUl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVNZW1iZXIoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTUVNQkVSU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IG1lbWJlcnMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVNZW1iZXJzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLm1lbWJlcnMuY2FjaGVcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIG1lbWJlcnMuc2l6ZSA/IG1lbWJlcnMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuUkVMRVZBTlRdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHBlcnNvbiA9IG1lc3NhZ2UuY2hhbm5lbC50eXBlLnN0YXJ0c1dpdGgoXCJHVUlMRFwiKVxuXHRcdFx0XHRcdD8gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlTWVtYmVyKHBocmFzZSwgbWVzc2FnZS5ndWlsZC5tZW1iZXJzLmNhY2hlKVxuXHRcdFx0XHRcdDogbWVzc2FnZS5jaGFubmVsLnR5cGUgPT09IFwiRE1cIlxuXHRcdFx0XHRcdD8gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlVXNlcihcblx0XHRcdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdFx0XHRuZXcgQ29sbGVjdGlvbihbXG5cdFx0XHRcdFx0XHRcdFx0W21lc3NhZ2UuY2hhbm5lbC5yZWNpcGllbnQuaWQsIG1lc3NhZ2UuY2hhbm5lbC5yZWNpcGllbnRdLFxuXHRcdFx0XHRcdFx0XHRcdFt0aGlzLmNsaWVudC51c2VyPy5pZCwgdGhpcy5jbGllbnQudXNlcl1cblx0XHRcdFx0XHRcdFx0XSlcblx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHQ6IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXIoXG5cdFx0XHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRcdFx0bmV3IENvbGxlY3Rpb24oW1xuXHRcdFx0XHRcdFx0XHRcdFt0aGlzLmNsaWVudC51c2VyPy5pZCwgdGhpcy5jbGllbnQudXNlcl1cblx0XHRcdFx0XHRcdFx0XHQvLyBOb3Qgc3VyZSB3aHkgdGhpcyBpcyBoZXJlLCBib3RzIGNhbid0IGJlIGluIGdyb3VwIGRtc1xuXHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRcdFx0XSkuY29uY2F0KG1lc3NhZ2UuY2hhbm5lbC5yZWNpcGllbnRzKVxuXHRcdFx0XHRcdCAgKTtcblxuXHRcdFx0XHRpZiAoIXBlcnNvbikgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0aWYgKG1lc3NhZ2UuZ3VpbGQpIHJldHVybiAocGVyc29uIGFzIEd1aWxkTWVtYmVyKS51c2VyO1xuXHRcdFx0XHRyZXR1cm4gcGVyc29uO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuUkVMRVZBTlRTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgcGVyc29ucyA9IG1lc3NhZ2UuY2hhbm5lbC50eXBlLnN0YXJ0c1dpdGgoXCJHVUlMRFwiKVxuXHRcdFx0XHRcdD8gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlTWVtYmVycyhwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5jYWNoZSlcblx0XHRcdFx0XHQ6IG1lc3NhZ2UuY2hhbm5lbC50eXBlID09PSBcIkRNXCJcblx0XHRcdFx0XHQ/IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXJzKFxuXHRcdFx0XHRcdFx0XHRwaHJhc2UsXG5cblx0XHRcdFx0XHRcdFx0bmV3IENvbGxlY3Rpb24oW1xuXHRcdFx0XHRcdFx0XHRcdFttZXNzYWdlLmNoYW5uZWwucmVjaXBpZW50LmlkLCBtZXNzYWdlLmNoYW5uZWwucmVjaXBpZW50XSxcblx0XHRcdFx0XHRcdFx0XHRbdGhpcy5jbGllbnQudXNlcj8uaWQsIHRoaXMuY2xpZW50LnVzZXJdXG5cdFx0XHRcdFx0XHRcdF0pXG5cdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0OiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVVc2Vycyhcblx0XHRcdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdFx0XHRuZXcgQ29sbGVjdGlvbihbXG5cdFx0XHRcdFx0XHRcdFx0W3RoaXMuY2xpZW50LnVzZXI/LmlkLCB0aGlzLmNsaWVudC51c2VyXVxuXHRcdFx0XHRcdFx0XHRcdC8vIE5vdCBzdXJlIHdoeSB0aGlzIGlzIGhlcmUsIGJvdHMgY2FuJ3QgYmUgaW4gZ3JvdXAgZG1zXG5cdFx0XHRcdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdFx0XHRdKS5jb25jYXQobWVzc2FnZS5jaGFubmVsLnJlY2lwaWVudHMpXG5cdFx0XHRcdFx0ICApO1xuXG5cdFx0XHRcdGlmICghcGVyc29ucy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRpZiAobWVzc2FnZS5jaGFubmVsLnR5cGUuc3RhcnRzV2l0aChcIkdVSUxEXCIpKSB7XG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdHJldHVybiBwZXJzb25zLm1hcCgobWVtYmVyOiBHdWlsZE1lbWJlcikgPT4gbWVtYmVyLnVzZXIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHBlcnNvbnM7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGVcblx0XHRcdFx0KTtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbHMuc2l6ZSA/IGNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRFWFRfQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbCB8fCBjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfVEVYVFwiKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRFWFRfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3QgdGV4dENoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGMgPT4gYy50eXBlID09PSBcIkdVSUxEX1RFWFRcIik7XG5cdFx0XHRcdHJldHVybiB0ZXh0Q2hhbm5lbHMuc2l6ZSA/IHRleHRDaGFubmVscyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5WT0lDRV9DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbCA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGVcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8IGNoYW5uZWwudHlwZSAhPT0gXCJHVUlMRF9WT0lDRVwiKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlZPSUNFX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWxzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHZvaWNlQ2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfVk9JQ0VcIik7XG5cdFx0XHRcdHJldHVybiB2b2ljZUNoYW5uZWxzLnNpemUgPyB2b2ljZUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNBVEVHT1JZX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWwgfHwgY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX0NBVEVHT1JZXCIpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0FURUdPUllfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3QgY2F0ZWdvcnlDaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihcblx0XHRcdFx0XHRjID0+IGMudHlwZSA9PT0gXCJHVUlMRF9DQVRFR09SWVwiXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBjYXRlZ29yeUNoYW5uZWxzLnNpemUgPyBjYXRlZ29yeUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLk5FV1NfQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbCB8fCBjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfTkVXU1wiKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLk5FV1NfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3QgbmV3c0NoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGMgPT4gYy50eXBlID09PSBcIkdVSUxEX05FV1NcIik7XG5cdFx0XHRcdHJldHVybiBuZXdzQ2hhbm5lbHMuc2l6ZSA/IG5ld3NDaGFubmVscyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5TVE9SRV9DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbCA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGVcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8IGNoYW5uZWwudHlwZSAhPT0gXCJHVUlMRF9TVE9SRVwiKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlNUT1JFX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWxzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHN0b3JlQ2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfU1RPUkVcIik7XG5cdFx0XHRcdHJldHVybiBzdG9yZUNoYW5uZWxzLnNpemUgPyBzdG9yZUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlNUQUdFX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWwgfHwgY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX1NUQUdFX1ZPSUNFXCIpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuU1RBR0VfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3Qgc3RvcmVDaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihcblx0XHRcdFx0XHRjID0+IGMudHlwZSA9PT0gXCJHVUlMRF9TVEFHRV9WT0lDRVwiXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBzdG9yZUNoYW5uZWxzLnNpemUgPyBzdG9yZUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRIUkVBRF9DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbCA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGVcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8ICFjaGFubmVsLnR5cGUuaW5jbHVkZXMoXCJUSFJFQURcIikpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVEhSRUFEX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWxzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHN0b3JlQ2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUuaW5jbHVkZXMoXCJUSFJFQURcIikpO1xuXHRcdFx0XHRyZXR1cm4gc3RvcmVDaGFubmVscy5zaXplID8gc3RvcmVDaGFubmVscyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5ST0xFXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVJvbGUocGhyYXNlLCBtZXNzYWdlLmd1aWxkLnJvbGVzLmNhY2hlKTtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlJPTEVTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3Qgcm9sZXMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVSb2xlcyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5yb2xlcy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gcm9sZXMuc2l6ZSA/IHJvbGVzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkVNT0pJXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUVtb2ppKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmVtb2ppcy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuRU1PSklTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgZW1vamlzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlRW1vamlzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmVtb2ppcy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gZW1vamlzLnNpemUgPyBlbW9qaXMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuR1VJTERdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUd1aWxkKHBocmFzZSwgdGhpcy5jbGllbnQuZ3VpbGRzLmNhY2hlKTtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkdVSUxEU106IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBndWlsZHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVHdWlsZHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdHRoaXMuY2xpZW50Lmd1aWxkcy5jYWNoZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gZ3VpbGRzLnNpemUgPyBndWlsZHMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTUVTU0FHRV06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuY2hhbm5lbC5tZXNzYWdlcy5mZXRjaChwaHJhc2UgYXMgU25vd2ZsYWtlKTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5HVUlMRF9NRVNTQUdFXTogYXN5bmMgKFxuXHRcdFx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdFx0XHRwaHJhc2U6IHN0cmluZ1xuXHRcdFx0KSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Zm9yIChjb25zdCBjaGFubmVsIG9mIG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUudmFsdWVzKCkpIHtcblx0XHRcdFx0XHRpZiAoY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX1RFWFRcIikgY29udGludWU7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHJldHVybiBhd2FpdCAoXG5cdFx0XHRcdFx0XHRcdGNoYW5uZWwgYXMgVGV4dENoYW5uZWwgfCBOZXdzQ2hhbm5lbCB8IFRocmVhZENoYW5uZWxcblx0XHRcdFx0XHRcdCkubWVzc2FnZXMuZmV0Y2gocGhyYXNlIGFzIFNub3dmbGFrZSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRpZiAoL15JbnZhbGlkIEZvcm0gQm9keS8udGVzdChlcnIubWVzc2FnZSkpIHJldHVybiBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuUkVMRVZBTlRfTUVTU0FHRV06IGFzeW5jIChcblx0XHRcdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRcdFx0cGhyYXNlOiBzdHJpbmdcblx0XHRcdCkgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGhlcmVNc2cgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwubWVzc2FnZXNcblx0XHRcdFx0XHQuZmV0Y2gocGhyYXNlIGFzIFNub3dmbGFrZSlcblx0XHRcdFx0XHQuY2F0Y2goKCkgPT4gbnVsbCk7XG5cdFx0XHRcdGlmIChoZXJlTXNnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGhlcmVNc2c7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAobWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgY2hhbm5lbCBvZiBtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlLnZhbHVlcygpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX1RFWFRcIikgY29udGludWU7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYXdhaXQgKFxuXHRcdFx0XHRcdFx0XHRcdGNoYW5uZWwgYXMgVGV4dENoYW5uZWwgfCBOZXdzQ2hhbm5lbCB8IFRocmVhZENoYW5uZWxcblx0XHRcdFx0XHRcdFx0KS5tZXNzYWdlcy5mZXRjaChwaHJhc2UgYXMgU25vd2ZsYWtlKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0XHRpZiAoL15JbnZhbGlkIEZvcm0gQm9keS8udGVzdChlcnIubWVzc2FnZSkpIHJldHVybiBudWxsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuSU5WSVRFXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LmZldGNoSW52aXRlKHBocmFzZSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVVNFUl9NRU5USU9OXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88QCE/KFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnVzZXJzLmNhY2hlLmdldChpZFsxXSBhcyBTbm93Zmxha2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5NRU1CRVJfTUVOVElPTl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88QCE/KFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5jYWNoZS5nZXQoaWRbMV0gYXMgU25vd2ZsYWtlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0hBTk5FTF9NRU5USU9OXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgaWQgPSBwaHJhc2UubWF0Y2goLzwjKFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUuZ2V0KGlkWzFdIGFzIFNub3dmbGFrZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlJPTEVfTUVOVElPTl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88QCYoXFxkezE3LDE5fSk+Lyk7XG5cdFx0XHRcdGlmICghaWQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5ndWlsZC5yb2xlcy5jYWNoZS5nZXQoaWRbMV0gYXMgU25vd2ZsYWtlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuRU1PSklfTUVOVElPTl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88YT86W2EtekEtWjAtOV9dKzooXFxkezE3LDE5fSk+Lyk7XG5cdFx0XHRcdGlmICghaWQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5ndWlsZC5lbW9qaXMuY2FjaGUuZ2V0KGlkWzFdIGFzIFNub3dmbGFrZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNPTU1BTkRfQUxJQVNdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY29tbWFuZEhhbmRsZXIuZmluZENvbW1hbmQocGhyYXNlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ09NTUFORF06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jb21tYW5kSGFuZGxlci5tb2R1bGVzLmdldChwaHJhc2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5JTkhJQklUT1JdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuaW5oaWJpdG9ySGFuZGxlcj8ubW9kdWxlcy5nZXQocGhyYXNlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTElTVEVORVJdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMubGlzdGVuZXJIYW5kbGVyPy5tb2R1bGVzLmdldChwaHJhc2UpIHx8IG51bGw7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGJ1aWx0aW5zKSkge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0dGhpcy50eXBlcy5zZXQoa2V5LCB2YWx1ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHJlc29sdmVyIGZ1bmN0aW9uIGZvciBhIHR5cGUuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gTmFtZSBvZiB0eXBlLlxuXHQgKiBAcmV0dXJucyB7QXJndW1lbnRUeXBlQ2FzdGVyfHVuZGVmaW5lZH1cblx0ICovXG5cdHR5cGUobmFtZTogc3RyaW5nKTogQXJndW1lbnRUeXBlQ2FzdGVyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy50eXBlcy5nZXQobmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG5ldyB0eXBlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIE5hbWUgb2YgdGhlIHR5cGUuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRUeXBlQ2FzdGVyfSBmbiAtIEZ1bmN0aW9uIHRoYXQgY2FzdHMgdGhlIHR5cGUuXG5cdCAqIEByZXR1cm5zIHtUeXBlUmVzb2x2ZXJ9XG5cdCAqL1xuXHRhZGRUeXBlKG5hbWU6IHN0cmluZywgZm46IEFyZ3VtZW50VHlwZUNhc3Rlcik6IFR5cGVSZXNvbHZlciB7XG5cdFx0dGhpcy50eXBlcy5zZXQobmFtZSwgZm4pO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgbXVsdGlwbGUgbmV3IHR5cGVzLlxuXHQgKiBAcGFyYW0gdHlwZXMgIC0gT2JqZWN0IHdpdGgga2V5cyBhcyB0aGUgdHlwZSBuYW1lIGFuZCB2YWx1ZXMgYXMgdGhlIGNhc3QgZnVuY3Rpb24uXG5cdCAqL1xuXHRhZGRUeXBlcyh0eXBlczogYW55KTogVHlwZVJlc29sdmVyIHtcblx0XHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh0eXBlcykpIHtcblx0XHRcdHRoaXMuYWRkVHlwZShrZXksIHZhbHVlIGFzIGFueSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbiJdfQ==
