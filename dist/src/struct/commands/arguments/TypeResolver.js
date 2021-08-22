"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const url_1 = require("url");
const Constants_1 = require("../../../util/Constants");
/**
 * Type resolver for command arguments.
 * The types are documented under ArgumentType.
 * @param handler - The command handler.
 */
class TypeResolver {
    constructor(handler) {
        this.client = handler.client;
        this.commandHandler = handler;
        this.inhibitorHandler = null;
        this.listenerHandler = null;
        this.types = new discord_js_1.Collection();
        this.addBuiltInTypes();
    }
    /**
     * The Akairo client.
     */
    client;
    /**
     * The command handler.
     */
    commandHandler;
    /**
     * The inhibitor handler.
     */
    inhibitorHandler;
    /**
     * The listener handler.
     */
    listenerHandler;
    /**
     * Collection of types.
     */
    types;
    /**
     * Adds built-in types.
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
                if (!phrase)
                    return null;
                const codes = [];
                for (const char of phrase)
                    codes.push(char.charCodeAt(0));
                return codes;
            },
            [Constants_1.ArgumentTypes.NUMBER]: (_message, phrase) => {
                if (!phrase || isNaN(+phrase))
                    return null;
                return parseFloat(phrase);
            },
            [Constants_1.ArgumentTypes.INTEGER]: (_message, phrase) => {
                if (!phrase || isNaN(+phrase))
                    return null;
                return parseInt(phrase);
            },
            [Constants_1.ArgumentTypes.BIGINT]: (_message, phrase) => {
                if (!phrase || isNaN(+phrase))
                    return null;
                return BigInt(phrase);
            },
            // Just for fun.
            [Constants_1.ArgumentTypes.EMOJINT]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const n = phrase.replace(/0⃣|1⃣|2⃣|3⃣|4⃣|5⃣|6⃣|7⃣|8⃣|9⃣|🔟/g, (m) => {
                    return ["0⃣", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"].indexOf(m);
                });
                if (isNaN(n))
                    return null;
                return parseInt(n);
            },
            [Constants_1.ArgumentTypes.URL]: (_message, phrase) => {
                if (!phrase)
                    return null;
                if (/^<.+>$/.test(phrase))
                    phrase = phrase.slice(1, -1);
                try {
                    return new url_1.URL(phrase);
                }
                catch (err) {
                    return null;
                }
            },
            [Constants_1.ArgumentTypes.DATE]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const timestamp = Date.parse(phrase);
                if (isNaN(timestamp))
                    return null;
                return new Date(timestamp);
            },
            [Constants_1.ArgumentTypes.COLOR]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const color = parseInt(phrase.replace("#", ""), 16);
                if (color < 0 || color > 0xffffff || isNaN(color)) {
                    return null;
                }
                return color;
            },
            [Constants_1.ArgumentTypes.USER]: (_message, phrase) => {
                if (!phrase)
                    return null;
                return this.client.util.resolveUser(phrase, this.client.users.cache);
            },
            [Constants_1.ArgumentTypes.USERS]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const users = this.client.util.resolveUsers(phrase, this.client.users.cache);
                return users.size ? users : null;
            },
            [Constants_1.ArgumentTypes.MEMBER]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                return this.client.util.resolveMember(phrase, message.guild.members.cache);
            },
            [Constants_1.ArgumentTypes.MEMBERS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const members = this.client.util.resolveMembers(phrase, message.guild.members.cache);
                return members.size ? members : null;
            },
            [Constants_1.ArgumentTypes.RELEVANT]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const person = message.guild
                    ? this.client.util.resolveMember(phrase, message.guild.members.cache)
                    : message.channel.type === "DM"
                        ? this.client.util.resolveUser(phrase, new discord_js_1.Collection([
                            [message.channel.recipient.id, message.channel.recipient],
                            [this.client.user?.id, this.client.user]
                        ]))
                        : this.client.util.resolveUser(phrase, new discord_js_1.Collection([
                            [this.client.user?.id, this.client.user]
                            // Not sure why this is here, bots can't be in group dms
                            // @ts-expect-error
                        ]).concat(message.channel.recipients));
                if (!person)
                    return null;
                return message.guild ? person.user : person;
            },
            [Constants_1.ArgumentTypes.RELEVANTS]: (message, phrase) => {
                if (!phrase)
                    return null;
                const persons = message.guild
                    ? this.client.util.resolveMembers(phrase, message.guild.members.cache)
                    : message.channel.type === "DM"
                        ? this.client.util.resolveUsers(phrase, new discord_js_1.Collection([
                            [message.channel.recipient.id, message.channel.recipient],
                            [this.client.user?.id, this.client.user]
                        ]))
                        : this.client.util.resolveUsers(phrase, new discord_js_1.Collection([
                            [this.client.user?.id, this.client.user]
                            // Not sure why this is here, bots can't be in group dms
                            // @ts-expect-error
                        ]).concat(message.channel.recipients));
                if (!persons.size)
                    return null;
                return message.guild ? persons.map(member => member.user) : persons;
            },
            [Constants_1.ArgumentTypes.CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                return this.client.util.resolveChannel(phrase, message.guild.channels.cache);
            },
            [Constants_1.ArgumentTypes.CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                return channels.size ? channels : null;
            },
            [Constants_1.ArgumentTypes.TEXT_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== "GUILD_TEXT")
                    return null;
                return channel;
            },
            [Constants_1.ArgumentTypes.TEXT_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const textChannels = channels.filter(c => c.type === "GUILD_TEXT");
                return textChannels.size ? textChannels : null;
            },
            [Constants_1.ArgumentTypes.VOICE_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || !channel.isVoice())
                    return null;
                return channel;
            },
            [Constants_1.ArgumentTypes.VOICE_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const voiceChannels = channels.filter(c => c.type === "GUILD_VOICE");
                return voiceChannels.size ? voiceChannels : null;
            },
            [Constants_1.ArgumentTypes.CATEGORY_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== "GUILD_CATEGORY")
                    return null;
                return channel;
            },
            [Constants_1.ArgumentTypes.CATEGORY_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const categoryChannels = channels.filter(c => c.type === "GUILD_CATEGORY");
                return categoryChannels.size ? categoryChannels : null;
            },
            [Constants_1.ArgumentTypes.NEWS_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== "GUILD_NEWS")
                    return null;
                return channel;
            },
            [Constants_1.ArgumentTypes.NEWS_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const newsChannels = channels.filter(c => c.type === "GUILD_NEWS");
                return newsChannels.size ? newsChannels : null;
            },
            [Constants_1.ArgumentTypes.STORE_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== "GUILD_STORE")
                    return null;
                return channel;
            },
            [Constants_1.ArgumentTypes.STORE_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const storeChannels = channels.filter(c => c.type === "GUILD_STORE");
                return storeChannels.size ? storeChannels : null;
            },
            [Constants_1.ArgumentTypes.STAGE_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || channel.type !== "GUILD_STAGE_VOICE")
                    return null;
                return channel;
            },
            [Constants_1.ArgumentTypes.STAGE_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const storeChannels = channels.filter(c => c.type === "GUILD_STAGE_VOICE");
                return storeChannels.size ? storeChannels : null;
            },
            [Constants_1.ArgumentTypes.THREAD_CHANNEL]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channel = this.client.util.resolveChannel(phrase, message.guild.channels.cache);
                if (!channel || !channel.type.includes("THREAD"))
                    return null;
                return channel;
            },
            [Constants_1.ArgumentTypes.THREAD_CHANNELS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const channels = this.client.util.resolveChannels(phrase, message.guild.channels.cache);
                if (!channels.size)
                    return null;
                const storeChannels = channels.filter(c => c.type.includes("THREAD"));
                return storeChannels.size ? storeChannels : null;
            },
            [Constants_1.ArgumentTypes.ROLE]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                return this.client.util.resolveRole(phrase, message.guild.roles.cache);
            },
            [Constants_1.ArgumentTypes.ROLES]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const roles = this.client.util.resolveRoles(phrase, message.guild.roles.cache);
                return roles.size ? roles : null;
            },
            [Constants_1.ArgumentTypes.EMOJI]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                return this.client.util.resolveEmoji(phrase, message.guild.emojis.cache);
            },
            [Constants_1.ArgumentTypes.EMOJIS]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const emojis = this.client.util.resolveEmojis(phrase, message.guild.emojis.cache);
                return emojis.size ? emojis : null;
            },
            [Constants_1.ArgumentTypes.GUILD]: (_message, phrase) => {
                if (!phrase)
                    return null;
                return this.client.util.resolveGuild(phrase, this.client.guilds.cache);
            },
            [Constants_1.ArgumentTypes.GUILDS]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const guilds = this.client.util.resolveGuilds(phrase, this.client.guilds.cache);
                return guilds.size ? guilds : null;
            },
            [Constants_1.ArgumentTypes.MESSAGE]: (message, phrase) => {
                if (!phrase)
                    return null;
                try {
                    return message.channel.messages.fetch(phrase);
                }
                catch (e) {
                    return null;
                }
            },
            [Constants_1.ArgumentTypes.GUILD_MESSAGE]: async (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                for (const channel of message.guild.channels.cache.values()) {
                    if (channel.type !== "GUILD_TEXT")
                        continue;
                    try {
                        return await channel.messages.fetch(phrase);
                    }
                    catch (err) {
                        if (/^Invalid Form Body/.test(err.message))
                            return null;
                    }
                }
                return null;
            },
            [Constants_1.ArgumentTypes.RELEVANT_MESSAGE]: async (message, phrase) => {
                if (!phrase)
                    return null;
                const hereMsg = await message.channel.messages.fetch(phrase).catch(() => null);
                if (hereMsg) {
                    return hereMsg;
                }
                if (message.guild) {
                    for (const channel of message.guild.channels.cache.values()) {
                        if (channel.type !== "GUILD_TEXT")
                            continue;
                        try {
                            return await channel.messages.fetch(phrase);
                        }
                        catch (err) {
                            if (/^Invalid Form Body/.test(err.message))
                                return null;
                        }
                    }
                }
                return null;
            },
            [Constants_1.ArgumentTypes.INVITE]: (_message, phrase) => {
                if (!phrase)
                    return null;
                try {
                    return this.client.fetchInvite(phrase);
                }
                catch (e) {
                    return null;
                }
            },
            [Constants_1.ArgumentTypes.USER_MENTION]: (_message, phrase) => {
                if (!phrase)
                    return null;
                const id = phrase.match(/<@!?(\d{17,19})>/);
                if (!id)
                    return null;
                return this.client.users.cache.get(id[1]) || null;
            },
            [Constants_1.ArgumentTypes.MEMBER_MENTION]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const id = phrase.match(/<@!?(\d{17,19})>/);
                if (!id)
                    return null;
                return message.guild.members.cache.get(id[1]) || null;
            },
            [Constants_1.ArgumentTypes.CHANNEL_MENTION]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const id = phrase.match(/<#(\d{17,19})>/);
                if (!id)
                    return null;
                return message.guild.channels.cache.get(id[1]) || null;
            },
            [Constants_1.ArgumentTypes.ROLE_MENTION]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const id = phrase.match(/<@&(\d{17,19})>/);
                if (!id)
                    return null;
                return message.guild.roles.cache.get(id[1]) || null;
            },
            [Constants_1.ArgumentTypes.EMOJI_MENTION]: (message, phrase) => {
                if (!phrase)
                    return null;
                if (!message.guild)
                    return null;
                const id = phrase.match(/<a?:[a-zA-Z0-9_]+:(\d{17,19})>/);
                if (!id)
                    return null;
                return message.guild.emojis.cache.get(id[1]) || null;
            },
            [Constants_1.ArgumentTypes.COMMAND_ALIAS]: (_message, phrase) => {
                if (!phrase)
                    return null;
                return this.commandHandler.findCommand(phrase) || null;
            },
            [Constants_1.ArgumentTypes.COMMAND]: (_message, phrase) => {
                if (!phrase)
                    return null;
                return this.commandHandler.modules.get(phrase) || null;
            },
            [Constants_1.ArgumentTypes.INHIBITOR]: (_message, phrase) => {
                if (!phrase)
                    return null;
                return this.inhibitorHandler?.modules.get(phrase) || null;
            },
            [Constants_1.ArgumentTypes.LISTENER]: (_message, phrase) => {
                if (!phrase)
                    return null;
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
    type(name) {
        return this.types.get(name);
    }
    /**
     * Adds a new type.
     * @param name - Name of the type.
     * @param fn - Function that casts the type.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9jb21tYW5kcy9hcmd1bWVudHMvVHlwZVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBU29CO0FBQ3BCLDZCQUEwQjtBQUUxQix1REFBd0Q7QUFPeEQ7Ozs7R0FJRztBQUNILE1BQXFCLFlBQVk7SUFDaEMsWUFBbUIsT0FBdUI7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO1FBRTlCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFFN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFFNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUU5QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFlO0lBRTVCOztPQUVHO0lBQ0ksY0FBYyxDQUFpQjtJQUV0Qzs7T0FFRztJQUNJLGdCQUFnQixDQUEyQjtJQUVsRDs7T0FFRztJQUNJLGVBQWUsQ0FBMEI7SUFFaEQ7O09BRUc7SUFDSSxLQUFLLENBQXlDO0lBRXJEOztPQUVHO0lBQ0ksZUFBZTtRQUNyQixNQUFNLFFBQVEsR0FBRztZQUNoQixDQUFDLHlCQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUM3RCxPQUFPLE1BQU0sSUFBSSxJQUFJLENBQUM7WUFDdkIsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQWlCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQ2hFLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENB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QU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNwRCxtQkFBbUI7WUFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzNCO0lBQ0YsQ0FBQztJQUVEOzs7T0FHRztJQUNJLElBQUksQ0FBQyxJQUFZO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxPQUFPLENBQUMsSUFBWSxFQUFFLEVBQXNCO1FBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7O09BR0c7SUFDSSxRQUFRLENBQUMsS0FBVTtRQUN6QixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFZLENBQUMsQ0FBQztTQUNoQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUNEO0FBbmtCRCwrQkFta0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0QmFzZUd1aWxkVm9pY2VDaGFubmVsLFxuXHRDb2xsZWN0aW9uLFxuXHRHdWlsZE1lbWJlcixcblx0TWVzc2FnZSxcblx0TmV3c0NoYW5uZWwsXG5cdFNub3dmbGFrZSxcblx0VGV4dENoYW5uZWwsXG5cdFRocmVhZENoYW5uZWxcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IFVSTCB9IGZyb20gXCJ1cmxcIjtcbmltcG9ydCB7IEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfSBmcm9tIFwiLi4vLi4vLi4vdHlwaW5ncy9ndWlsZFRleHRCYXNlZENoYW5uZWxzXCI7XG5pbXBvcnQgeyBBcmd1bWVudFR5cGVzIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi8uLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBJbmhpYml0b3JIYW5kbGVyIGZyb20gXCIuLi8uLi9pbmhpYml0b3JzL0luaGliaXRvckhhbmRsZXJcIjtcbmltcG9ydCBMaXN0ZW5lckhhbmRsZXIgZnJvbSBcIi4uLy4uL2xpc3RlbmVycy9MaXN0ZW5lckhhbmRsZXJcIjtcbmltcG9ydCBDb21tYW5kSGFuZGxlciBmcm9tIFwiLi4vQ29tbWFuZEhhbmRsZXJcIjtcbmltcG9ydCB7IEFyZ3VtZW50VHlwZUNhc3RlciB9IGZyb20gXCIuL0FyZ3VtZW50XCI7XG5cbi8qKlxuICogVHlwZSByZXNvbHZlciBmb3IgY29tbWFuZCBhcmd1bWVudHMuXG4gKiBUaGUgdHlwZXMgYXJlIGRvY3VtZW50ZWQgdW5kZXIgQXJndW1lbnRUeXBlLlxuICogQHBhcmFtIGhhbmRsZXIgLSBUaGUgY29tbWFuZCBoYW5kbGVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlUmVzb2x2ZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoaGFuZGxlcjogQ29tbWFuZEhhbmRsZXIpIHtcblx0XHR0aGlzLmNsaWVudCA9IGhhbmRsZXIuY2xpZW50O1xuXG5cdFx0dGhpcy5jb21tYW5kSGFuZGxlciA9IGhhbmRsZXI7XG5cblx0XHR0aGlzLmluaGliaXRvckhhbmRsZXIgPSBudWxsO1xuXG5cdFx0dGhpcy5saXN0ZW5lckhhbmRsZXIgPSBudWxsO1xuXG5cdFx0dGhpcy50eXBlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmFkZEJ1aWx0SW5UeXBlcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmRIYW5kbGVyOiBDb21tYW5kSGFuZGxlcjtcblxuXHQvKipcblx0ICogVGhlIGluaGliaXRvciBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGluaGliaXRvckhhbmRsZXI/OiBJbmhpYml0b3JIYW5kbGVyIHwgbnVsbDtcblxuXHQvKipcblx0ICogVGhlIGxpc3RlbmVyIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgbGlzdGVuZXJIYW5kbGVyPzogTGlzdGVuZXJIYW5kbGVyIHwgbnVsbDtcblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiB0eXBlcy5cblx0ICovXG5cdHB1YmxpYyB0eXBlczogQ29sbGVjdGlvbjxzdHJpbmcsIEFyZ3VtZW50VHlwZUNhc3Rlcj47XG5cblx0LyoqXG5cdCAqIEFkZHMgYnVpbHQtaW4gdHlwZXMuXG5cdCAqL1xuXHRwdWJsaWMgYWRkQnVpbHRJblR5cGVzKCk6IHZvaWQge1xuXHRcdGNvbnN0IGJ1aWx0aW5zID0ge1xuXHRcdFx0W0FyZ3VtZW50VHlwZXMuU1RSSU5HXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcGhyYXNlIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5MT1dFUkNBU0VdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiBwaHJhc2UgPyBwaHJhc2UudG9Mb3dlckNhc2UoKSA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5VUFBFUkNBU0VdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiBwaHJhc2UgPyBwaHJhc2UudG9VcHBlckNhc2UoKSA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DSEFSX0NPREVTXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNvZGVzID0gW107XG5cdFx0XHRcdGZvciAoY29uc3QgY2hhciBvZiBwaHJhc2UpIGNvZGVzLnB1c2goY2hhci5jaGFyQ29kZUF0KDApKTtcblx0XHRcdFx0cmV0dXJuIGNvZGVzO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTlVNQkVSXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSB8fCBpc05hTigrcGhyYXNlKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBwYXJzZUZsb2F0KHBocmFzZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5JTlRFR0VSXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSB8fCBpc05hTigrcGhyYXNlKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBwYXJzZUludChwaHJhc2UpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQklHSU5UXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSB8fCBpc05hTigrcGhyYXNlKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBCaWdJbnQocGhyYXNlKTtcblx0XHRcdH0sXG5cblx0XHRcdC8vIEp1c3QgZm9yIGZ1bi5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkVNT0pJTlRdOiAoXG5cdFx0XHRcdF9tZXNzYWdlOiBNZXNzYWdlLFxuXHRcdFx0XHRwaHJhc2U6IHtcblx0XHRcdFx0XHRyZXBsYWNlOiAoYXJnMDogUmVnRXhwLCBhcmcxOiAobTogYW55KSA9PiBudW1iZXIpID0+IGFueTtcblx0XHRcdFx0fVxuXHRcdFx0KSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgbiA9IHBocmFzZS5yZXBsYWNlKC8w4oOjfDHig6N8MuKDo3wz4oOjfDTig6N8NeKDo3w24oOjfDfig6N8OOKDo3w54oOjfPCflJ8vZywgKG06IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBbXCIw4oOjXCIsIFwiMeKDo1wiLCBcIjLig6NcIiwgXCIz4oOjXCIsIFwiNOKDo1wiLCBcIjXig6NcIiwgXCI24oOjXCIsIFwiN+KDo1wiLCBcIjjig6NcIiwgXCI54oOjXCIsIFwi8J+Un1wiXS5pbmRleE9mKG0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoaXNOYU4obikpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQobik7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5VUkxdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZSkgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICgvXjwuKz4kLy50ZXN0KHBocmFzZSkpIHBocmFzZSA9IHBocmFzZS5zbGljZSgxLCAtMSk7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFVSTChwaHJhc2UpO1xuXHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuREFURV06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCB0aW1lc3RhbXAgPSBEYXRlLnBhcnNlKHBocmFzZSk7XG5cdFx0XHRcdGlmIChpc05hTih0aW1lc3RhbXApKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DT0xPUl06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IGNvbG9yID0gcGFyc2VJbnQocGhyYXNlLnJlcGxhY2UoXCIjXCIsIFwiXCIpLCAxNik7XG5cdFx0XHRcdGlmIChjb2xvciA8IDAgfHwgY29sb3IgPiAweGZmZmZmZiB8fCBpc05hTihjb2xvcikpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBjb2xvcjtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlVTRVJdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXIocGhyYXNlLCB0aGlzLmNsaWVudC51c2Vycy5jYWNoZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5VU0VSU106IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCB1c2VycyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXJzKHBocmFzZSwgdGhpcy5jbGllbnQudXNlcnMuY2FjaGUpO1xuXHRcdFx0XHRyZXR1cm4gdXNlcnMuc2l6ZSA/IHVzZXJzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLk1FTUJFUl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVNZW1iZXIocGhyYXNlLCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuY2FjaGUpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTUVNQkVSU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IG1lbWJlcnMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVNZW1iZXJzKHBocmFzZSwgbWVzc2FnZS5ndWlsZC5tZW1iZXJzLmNhY2hlKTtcblx0XHRcdFx0cmV0dXJuIG1lbWJlcnMuc2l6ZSA/IG1lbWJlcnMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuUkVMRVZBTlRdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHBlcnNvbiA9IG1lc3NhZ2UuZ3VpbGRcblx0XHRcdFx0XHQ/IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZU1lbWJlcihwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5jYWNoZSlcblx0XHRcdFx0XHQ6IG1lc3NhZ2UuY2hhbm5lbC50eXBlID09PSBcIkRNXCJcblx0XHRcdFx0XHQ/IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXIoXG5cdFx0XHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRcdFx0bmV3IENvbGxlY3Rpb24oW1xuXHRcdFx0XHRcdFx0XHRcdFttZXNzYWdlLmNoYW5uZWwucmVjaXBpZW50LmlkLCBtZXNzYWdlLmNoYW5uZWwucmVjaXBpZW50XSxcblx0XHRcdFx0XHRcdFx0XHRbdGhpcy5jbGllbnQudXNlcj8uaWQsIHRoaXMuY2xpZW50LnVzZXJdXG5cdFx0XHRcdFx0XHRcdF0pXG5cdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0OiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVVc2VyKFxuXHRcdFx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0XHRcdG5ldyBDb2xsZWN0aW9uKFtcblx0XHRcdFx0XHRcdFx0XHRbdGhpcy5jbGllbnQudXNlcj8uaWQsIHRoaXMuY2xpZW50LnVzZXJdXG5cdFx0XHRcdFx0XHRcdFx0Ly8gTm90IHN1cmUgd2h5IHRoaXMgaXMgaGVyZSwgYm90cyBjYW4ndCBiZSBpbiBncm91cCBkbXNcblx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0XHRcdF0pLmNvbmNhdChtZXNzYWdlLmNoYW5uZWwucmVjaXBpZW50cylcblx0XHRcdFx0XHQgICk7XG5cblx0XHRcdFx0aWYgKCFwZXJzb24pIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5ndWlsZCA/IChwZXJzb24gYXMgR3VpbGRNZW1iZXIpLnVzZXIgOiBwZXJzb247XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5SRUxFVkFOVFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBwZXJzb25zID0gbWVzc2FnZS5ndWlsZFxuXHRcdFx0XHRcdD8gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlTWVtYmVycyhwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5jYWNoZSlcblx0XHRcdFx0XHQ6IG1lc3NhZ2UuY2hhbm5lbC50eXBlID09PSBcIkRNXCJcblx0XHRcdFx0XHQ/IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXJzKFxuXHRcdFx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0XHRcdG5ldyBDb2xsZWN0aW9uKFtcblx0XHRcdFx0XHRcdFx0XHRbbWVzc2FnZS5jaGFubmVsLnJlY2lwaWVudC5pZCwgbWVzc2FnZS5jaGFubmVsLnJlY2lwaWVudF0sXG5cdFx0XHRcdFx0XHRcdFx0W3RoaXMuY2xpZW50LnVzZXI/LmlkLCB0aGlzLmNsaWVudC51c2VyXVxuXHRcdFx0XHRcdFx0XHRdKVxuXHRcdFx0XHRcdCAgKVxuXHRcdFx0XHRcdDogdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlVXNlcnMoXG5cdFx0XHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRcdFx0bmV3IENvbGxlY3Rpb24oW1xuXHRcdFx0XHRcdFx0XHRcdFt0aGlzLmNsaWVudC51c2VyPy5pZCwgdGhpcy5jbGllbnQudXNlcl1cblx0XHRcdFx0XHRcdFx0XHQvLyBOb3Qgc3VyZSB3aHkgdGhpcyBpcyBoZXJlLCBib3RzIGNhbid0IGJlIGluIGdyb3VwIGRtc1xuXHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRcdFx0XSkuY29uY2F0KG1lc3NhZ2UuY2hhbm5lbC5yZWNpcGllbnRzKVxuXHRcdFx0XHRcdCAgKTtcblxuXHRcdFx0XHRpZiAoIXBlcnNvbnMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmd1aWxkID8gKHBlcnNvbnMgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkTWVtYmVyPikubWFwKG1lbWJlciA9PiBtZW1iZXIudXNlcikgOiBwZXJzb25zO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbHMuc2l6ZSA/IGNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRFWFRfQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWwgfHwgY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX1RFWFRcIikgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0cmV0dXJuIGNoYW5uZWw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5URVhUX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVscy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCB0ZXh0Q2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfVEVYVFwiKTtcblx0XHRcdFx0cmV0dXJuIHRleHRDaGFubmVscy5zaXplID8gdGV4dENoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlZPSUNFX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8ICFjaGFubmVsLmlzVm9pY2UoKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVk9JQ0VfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWxzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHZvaWNlQ2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfVk9JQ0VcIik7XG5cdFx0XHRcdHJldHVybiB2b2ljZUNoYW5uZWxzLnNpemUgPyB2b2ljZUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNBVEVHT1JZX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8IGNoYW5uZWwudHlwZSAhPT0gXCJHVUlMRF9DQVRFR09SWVwiKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNBVEVHT1JZX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVscy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCBjYXRlZ29yeUNoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGMgPT4gYy50eXBlID09PSBcIkdVSUxEX0NBVEVHT1JZXCIpO1xuXHRcdFx0XHRyZXR1cm4gY2F0ZWdvcnlDaGFubmVscy5zaXplID8gY2F0ZWdvcnlDaGFubmVscyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5ORVdTX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8IGNoYW5uZWwudHlwZSAhPT0gXCJHVUlMRF9ORVdTXCIpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTkVXU19DSEFOTkVMU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWxzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3QgbmV3c0NoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGMgPT4gYy50eXBlID09PSBcIkdVSUxEX05FV1NcIik7XG5cdFx0XHRcdHJldHVybiBuZXdzQ2hhbm5lbHMuc2l6ZSA/IG5ld3NDaGFubmVscyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5TVE9SRV9DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbCA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbCB8fCBjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfU1RPUkVcIikgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0cmV0dXJuIGNoYW5uZWw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5TVE9SRV9DSEFOTkVMU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWxzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3Qgc3RvcmVDaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihjID0+IGMudHlwZSA9PT0gXCJHVUlMRF9TVE9SRVwiKTtcblx0XHRcdFx0cmV0dXJuIHN0b3JlQ2hhbm5lbHMuc2l6ZSA/IHN0b3JlQ2hhbm5lbHMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuU1RBR0VfQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWwgfHwgY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX1NUQUdFX1ZPSUNFXCIpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuU1RBR0VfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWxzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHN0b3JlQ2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfU1RBR0VfVk9JQ0VcIik7XG5cdFx0XHRcdHJldHVybiBzdG9yZUNoYW5uZWxzLnNpemUgPyBzdG9yZUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRIUkVBRF9DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbCA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbCB8fCAhY2hhbm5lbC50eXBlLmluY2x1ZGVzKFwiVEhSRUFEXCIpKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRIUkVBRF9DSEFOTkVMU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWxzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3Qgc3RvcmVDaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihjID0+IGMudHlwZS5pbmNsdWRlcyhcIlRIUkVBRFwiKSk7XG5cdFx0XHRcdHJldHVybiBzdG9yZUNoYW5uZWxzLnNpemUgPyBzdG9yZUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlJPTEVdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlUm9sZShwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQucm9sZXMuY2FjaGUpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuUk9MRVNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCByb2xlcyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVJvbGVzKHBocmFzZSwgbWVzc2FnZS5ndWlsZC5yb2xlcy5jYWNoZSk7XG5cdFx0XHRcdHJldHVybiByb2xlcy5zaXplID8gcm9sZXMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuRU1PSkldOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlRW1vamkocGhyYXNlLCBtZXNzYWdlLmd1aWxkLmVtb2ppcy5jYWNoZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5FTU9KSVNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBlbW9qaXMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVFbW9qaXMocGhyYXNlLCBtZXNzYWdlLmd1aWxkLmVtb2ppcy5jYWNoZSk7XG5cdFx0XHRcdHJldHVybiBlbW9qaXMuc2l6ZSA/IGVtb2ppcyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5HVUlMRF06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlR3VpbGQocGhyYXNlLCB0aGlzLmNsaWVudC5ndWlsZHMuY2FjaGUpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuR1VJTERTXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGd1aWxkcyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUd1aWxkcyhwaHJhc2UsIHRoaXMuY2xpZW50Lmd1aWxkcy5jYWNoZSk7XG5cdFx0XHRcdHJldHVybiBndWlsZHMuc2l6ZSA/IGd1aWxkcyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5NRVNTQUdFXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5jaGFubmVsLm1lc3NhZ2VzLmZldGNoKHBocmFzZSBhcyBTbm93Zmxha2UpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkdVSUxEX01FU1NBR0VdOiBhc3luYyAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGNoYW5uZWwgb2YgbWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZS52YWx1ZXMoKSkge1xuXHRcdFx0XHRcdGlmIChjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfVEVYVFwiKSBjb250aW51ZTtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGF3YWl0IChjaGFubmVsIGFzIFRleHRDaGFubmVsIHwgTmV3c0NoYW5uZWwgfCBUaHJlYWRDaGFubmVsKS5tZXNzYWdlcy5mZXRjaChwaHJhc2UgYXMgU25vd2ZsYWtlKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdGlmICgvXkludmFsaWQgRm9ybSBCb2R5Ly50ZXN0KGVyci5tZXNzYWdlKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5SRUxFVkFOVF9NRVNTQUdFXTogYXN5bmMgKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgaGVyZU1zZyA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5tZXNzYWdlcy5mZXRjaChwaHJhc2UgYXMgU25vd2ZsYWtlKS5jYXRjaCgoKSA9PiBudWxsKTtcblx0XHRcdFx0aWYgKGhlcmVNc2cpIHtcblx0XHRcdFx0XHRyZXR1cm4gaGVyZU1zZztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChtZXNzYWdlLmd1aWxkKSB7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBjaGFubmVsIG9mIG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUudmFsdWVzKCkpIHtcblx0XHRcdFx0XHRcdGlmIChjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfVEVYVFwiKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhd2FpdCAoY2hhbm5lbCBhcyBUZXh0Q2hhbm5lbCB8IE5ld3NDaGFubmVsIHwgVGhyZWFkQ2hhbm5lbCkubWVzc2FnZXMuZmV0Y2gocGhyYXNlIGFzIFNub3dmbGFrZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0aWYgKC9eSW52YWxpZCBGb3JtIEJvZHkvLnRlc3QoZXJyLm1lc3NhZ2UpKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLklOVklURV06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC5mZXRjaEludml0ZShwaHJhc2UpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlVTRVJfTUVOVElPTl06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBpZCA9IHBocmFzZS5tYXRjaCgvPEAhPyhcXGR7MTcsMTl9KT4vKTtcblx0XHRcdFx0aWYgKCFpZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51c2Vycy5jYWNoZS5nZXQoaWRbMV0gYXMgU25vd2ZsYWtlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTUVNQkVSX01FTlRJT05dOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBpZCA9IHBocmFzZS5tYXRjaCgvPEAhPyhcXGR7MTcsMTl9KT4vKTtcblx0XHRcdFx0aWYgKCFpZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuY2FjaGUuZ2V0KGlkWzFdIGFzIFNub3dmbGFrZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNIQU5ORUxfTUVOVElPTl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88IyhcXGR7MTcsMTl9KT4vKTtcblx0XHRcdFx0aWYgKCFpZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlLmdldChpZFsxXSBhcyBTbm93Zmxha2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5ST0xFX01FTlRJT05dOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBpZCA9IHBocmFzZS5tYXRjaCgvPEAmKFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQucm9sZXMuY2FjaGUuZ2V0KGlkWzFdIGFzIFNub3dmbGFrZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkVNT0pJX01FTlRJT05dOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBpZCA9IHBocmFzZS5tYXRjaCgvPGE/OlthLXpBLVowLTlfXSs6KFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQuZW1vamlzLmNhY2hlLmdldChpZFsxXSBhcyBTbm93Zmxha2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DT01NQU5EX0FMSUFTXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNvbW1hbmRIYW5kbGVyLmZpbmRDb21tYW5kKHBocmFzZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNPTU1BTkRdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY29tbWFuZEhhbmRsZXIubW9kdWxlcy5nZXQocGhyYXNlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuSU5ISUJJVE9SXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmluaGliaXRvckhhbmRsZXI/Lm1vZHVsZXMuZ2V0KHBocmFzZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkxJU1RFTkVSXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmxpc3RlbmVySGFuZGxlcj8ubW9kdWxlcy5nZXQocGhyYXNlKSB8fCBudWxsO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhidWlsdGlucykpIHtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdHRoaXMudHlwZXMuc2V0KGtleSwgdmFsdWUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSByZXNvbHZlciBmdW5jdGlvbiBmb3IgYSB0eXBlLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgb2YgdHlwZS5cblx0ICovXG5cdHB1YmxpYyB0eXBlKG5hbWU6IHN0cmluZyk6IEFyZ3VtZW50VHlwZUNhc3RlciB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMudHlwZXMuZ2V0KG5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBuZXcgdHlwZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIG9mIHRoZSB0eXBlLlxuXHQgKiBAcGFyYW0gZm4gLSBGdW5jdGlvbiB0aGF0IGNhc3RzIHRoZSB0eXBlLlxuXHQgKi9cblx0cHVibGljIGFkZFR5cGUobmFtZTogc3RyaW5nLCBmbjogQXJndW1lbnRUeXBlQ2FzdGVyKTogVHlwZVJlc29sdmVyIHtcblx0XHR0aGlzLnR5cGVzLnNldChuYW1lLCBmbik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBtdWx0aXBsZSBuZXcgdHlwZXMuXG5cdCAqIEBwYXJhbSB0eXBlcyAgLSBPYmplY3Qgd2l0aCBrZXlzIGFzIHRoZSB0eXBlIG5hbWUgYW5kIHZhbHVlcyBhcyB0aGUgY2FzdCBmdW5jdGlvbi5cblx0ICovXG5cdHB1YmxpYyBhZGRUeXBlcyh0eXBlczogYW55KTogVHlwZVJlc29sdmVyIHtcblx0XHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh0eXBlcykpIHtcblx0XHRcdHRoaXMuYWRkVHlwZShrZXksIHZhbHVlIGFzIGFueSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbiJdfQ==