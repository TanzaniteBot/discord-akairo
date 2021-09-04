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
                            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                            [this.client.user?.id, this.client.user]
                        ]))
                        : this.client.util.resolveUser(phrase, new discord_js_1.Collection([
                            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
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
                            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                            [this.client.user?.id, this.client.user]
                        ]))
                        : this.client.util.resolveUsers(phrase, new discord_js_1.Collection([
                            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9jb21tYW5kcy9hcmd1bWVudHMvVHlwZVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBU29CO0FBQ3BCLDZCQUEwQjtBQUUxQix1REFBd0Q7QUFPeEQ7Ozs7R0FJRztBQUNILE1BQXFCLFlBQVk7SUFDaEMsWUFBbUIsT0FBdUI7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO1FBRTlCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFFN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFFNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUU5QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFlO0lBRTVCOztPQUVHO0lBQ0ksY0FBYyxDQUFpQjtJQUV0Qzs7T0FFRztJQUNJLGdCQUFnQixDQUEyQjtJQUVsRDs7T0FFRztJQUNJLGVBQWUsQ0FBMEI7SUFFaEQ7O09BRUc7SUFDSSxLQUFLLENBQXlDO0lBRXJEOztPQUVHO0lBQ0ksZUFBZTtRQUNyQixNQUFNLFFBQVEsR0FBRztZQUNoQixDQUFDLHlCQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUM3RCxPQUFPLE1BQU0sSUFBSSxJQUFJLENBQUM7WUFDdkIsQ0FBQztZQUVELENBQUMseUJBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQWlCLEVBQUUsTUFBYyxFQUFFLEVBQUU7Z0JBQ2hFLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENB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QUVGLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3BELG1CQUFtQjtZQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDM0I7SUFDRixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksSUFBSSxDQUFDLElBQVk7UUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE9BQU8sQ0FBQyxJQUFZLEVBQUUsRUFBc0I7UUFDbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFFBQVEsQ0FBQyxLQUFVO1FBQ3pCLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQVksQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0NBQ0Q7QUF2a0JELCtCQXVrQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRCYXNlR3VpbGRWb2ljZUNoYW5uZWwsXG5cdENvbGxlY3Rpb24sXG5cdEd1aWxkTWVtYmVyLFxuXHRNZXNzYWdlLFxuXHROZXdzQ2hhbm5lbCxcblx0U25vd2ZsYWtlLFxuXHRUZXh0Q2hhbm5lbCxcblx0VGhyZWFkQ2hhbm5lbFxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgVVJMIH0gZnJvbSBcInVybFwiO1xuaW1wb3J0IHsgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB9IGZyb20gXCIuLi8uLi8uLi90eXBpbmdzL2d1aWxkVGV4dEJhc2VkQ2hhbm5lbHNcIjtcbmltcG9ydCB7IEFyZ3VtZW50VHlwZXMgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uLy4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEluaGliaXRvckhhbmRsZXIgZnJvbSBcIi4uLy4uL2luaGliaXRvcnMvSW5oaWJpdG9ySGFuZGxlclwiO1xuaW1wb3J0IExpc3RlbmVySGFuZGxlciBmcm9tIFwiLi4vLi4vbGlzdGVuZXJzL0xpc3RlbmVySGFuZGxlclwiO1xuaW1wb3J0IENvbW1hbmRIYW5kbGVyIGZyb20gXCIuLi9Db21tYW5kSGFuZGxlclwiO1xuaW1wb3J0IHsgQXJndW1lbnRUeXBlQ2FzdGVyIH0gZnJvbSBcIi4vQXJndW1lbnRcIjtcblxuLyoqXG4gKiBUeXBlIHJlc29sdmVyIGZvciBjb21tYW5kIGFyZ3VtZW50cy5cbiAqIFRoZSB0eXBlcyBhcmUgZG9jdW1lbnRlZCB1bmRlciBBcmd1bWVudFR5cGUuXG4gKiBAcGFyYW0gaGFuZGxlciAtIFRoZSBjb21tYW5kIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR5cGVSZXNvbHZlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihoYW5kbGVyOiBDb21tYW5kSGFuZGxlcikge1xuXHRcdHRoaXMuY2xpZW50ID0gaGFuZGxlci5jbGllbnQ7XG5cblx0XHR0aGlzLmNvbW1hbmRIYW5kbGVyID0gaGFuZGxlcjtcblxuXHRcdHRoaXMuaW5oaWJpdG9ySGFuZGxlciA9IG51bGw7XG5cblx0XHR0aGlzLmxpc3RlbmVySGFuZGxlciA9IG51bGw7XG5cblx0XHR0aGlzLnR5cGVzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdHRoaXMuYWRkQnVpbHRJblR5cGVzKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZEhhbmRsZXI6IENvbW1hbmRIYW5kbGVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgaW5oaWJpdG9yIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgaW5oaWJpdG9ySGFuZGxlcj86IEluaGliaXRvckhhbmRsZXIgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgbGlzdGVuZXIgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBsaXN0ZW5lckhhbmRsZXI/OiBMaXN0ZW5lckhhbmRsZXIgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBDb2xsZWN0aW9uIG9mIHR5cGVzLlxuXHQgKi9cblx0cHVibGljIHR5cGVzOiBDb2xsZWN0aW9uPHN0cmluZywgQXJndW1lbnRUeXBlQ2FzdGVyPjtcblxuXHQvKipcblx0ICogQWRkcyBidWlsdC1pbiB0eXBlcy5cblx0ICovXG5cdHB1YmxpYyBhZGRCdWlsdEluVHlwZXMoKTogdm9pZCB7XG5cdFx0Y29uc3QgYnVpbHRpbnMgPSB7XG5cdFx0XHRbQXJndW1lbnRUeXBlcy5TVFJJTkddOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdHJldHVybiBwaHJhc2UgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkxPV0VSQ0FTRV06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0cmV0dXJuIHBocmFzZSA/IHBocmFzZS50b0xvd2VyQ2FzZSgpIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlVQUEVSQ0FTRV06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0cmV0dXJuIHBocmFzZSA/IHBocmFzZS50b1VwcGVyQ2FzZSgpIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNIQVJfQ09ERVNdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY29kZXMgPSBbXTtcblx0XHRcdFx0Zm9yIChjb25zdCBjaGFyIG9mIHBocmFzZSkgY29kZXMucHVzaChjaGFyLmNoYXJDb2RlQXQoMCkpO1xuXHRcdFx0XHRyZXR1cm4gY29kZXM7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5OVU1CRVJdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlIHx8IGlzTmFOKCtwaHJhc2UpKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHBhcnNlRmxvYXQocGhyYXNlKTtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLklOVEVHRVJdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlIHx8IGlzTmFOKCtwaHJhc2UpKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KHBocmFzZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5CSUdJTlRdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlIHx8IGlzTmFOKCtwaHJhc2UpKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIEJpZ0ludChwaHJhc2UpO1xuXHRcdFx0fSxcblxuXHRcdFx0Ly8gSnVzdCBmb3IgZnVuLlxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuRU1PSklOVF06IChcblx0XHRcdFx0X21lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0XHRcdHBocmFzZToge1xuXHRcdFx0XHRcdHJlcGxhY2U6IChhcmcwOiBSZWdFeHAsIGFyZzE6IChtOiBhbnkpID0+IG51bWJlcikgPT4gYW55O1xuXHRcdFx0XHR9XG5cdFx0XHQpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBuID0gcGhyYXNlLnJlcGxhY2UoLzDig6N8MeKDo3wy4oOjfDPig6N8NOKDo3w14oOjfDbig6N8N+KDo3w44oOjfDnig6N88J+Uny9nLCAobTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIFtcIjDig6NcIiwgXCIx4oOjXCIsIFwiMuKDo1wiLCBcIjPig6NcIiwgXCI04oOjXCIsIFwiNeKDo1wiLCBcIjbig6NcIiwgXCI34oOjXCIsIFwiOOKDo1wiLCBcIjnig6NcIiwgXCLwn5SfXCJdLmluZGV4T2YobSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChpc05hTihuKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBwYXJzZUludChuKTtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlVSTF06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoL148Lis+JC8udGVzdChwaHJhc2UpKSBwaHJhc2UgPSBwaHJhc2Uuc2xpY2UoMSwgLTEpO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBVUkwocGhyYXNlKTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkRBVEVdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgdGltZXN0YW1wID0gRGF0ZS5wYXJzZShwaHJhc2UpO1xuXHRcdFx0XHRpZiAoaXNOYU4odGltZXN0YW1wKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ09MT1JdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCBjb2xvciA9IHBhcnNlSW50KHBocmFzZS5yZXBsYWNlKFwiI1wiLCBcIlwiKSwgMTYpO1xuXHRcdFx0XHRpZiAoY29sb3IgPCAwIHx8IGNvbG9yID4gMHhmZmZmZmYgfHwgaXNOYU4oY29sb3IpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gY29sb3I7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5VU0VSXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVVc2VyKHBocmFzZSwgdGhpcy5jbGllbnQudXNlcnMuY2FjaGUpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVVNFUlNdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgdXNlcnMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVVc2VycyhwaHJhc2UsIHRoaXMuY2xpZW50LnVzZXJzLmNhY2hlKTtcblx0XHRcdFx0cmV0dXJuIHVzZXJzLnNpemUgPyB1c2VycyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5NRU1CRVJdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlTWVtYmVyKHBocmFzZSwgbWVzc2FnZS5ndWlsZC5tZW1iZXJzLmNhY2hlKTtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLk1FTUJFUlNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBtZW1iZXJzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlTWVtYmVycyhwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5jYWNoZSk7XG5cdFx0XHRcdHJldHVybiBtZW1iZXJzLnNpemUgPyBtZW1iZXJzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlJFTEVWQU5UXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCBwZXJzb24gPSBtZXNzYWdlLmd1aWxkXG5cdFx0XHRcdFx0PyB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVNZW1iZXIocGhyYXNlLCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuY2FjaGUpXG5cdFx0XHRcdFx0OiBtZXNzYWdlLmNoYW5uZWwudHlwZSA9PT0gXCJETVwiXG5cdFx0XHRcdFx0PyB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVVc2VyKFxuXHRcdFx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0XHRcdG5ldyBDb2xsZWN0aW9uKFtcblx0XHRcdFx0XHRcdFx0XHRbbWVzc2FnZS5jaGFubmVsLnJlY2lwaWVudC5pZCEsIG1lc3NhZ2UuY2hhbm5lbC5yZWNpcGllbnQhXSxcblx0XHRcdFx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGVkLW9wdGlvbmFsLWNoYWluXG5cdFx0XHRcdFx0XHRcdFx0W3RoaXMuY2xpZW50LnVzZXI/LmlkISwgdGhpcy5jbGllbnQudXNlciFdXG5cdFx0XHRcdFx0XHRcdF0pXG5cdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0OiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVVc2VyKFxuXHRcdFx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0XHRcdG5ldyBDb2xsZWN0aW9uKFtcblx0XHRcdFx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGVkLW9wdGlvbmFsLWNoYWluXG5cdFx0XHRcdFx0XHRcdFx0W3RoaXMuY2xpZW50LnVzZXI/LmlkISwgdGhpcy5jbGllbnQudXNlciFdXG5cdFx0XHRcdFx0XHRcdFx0Ly8gTm90IHN1cmUgd2h5IHRoaXMgaXMgaGVyZSwgYm90cyBjYW4ndCBiZSBpbiBncm91cCBkbXNcblx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0XHRcdF0pLmNvbmNhdChtZXNzYWdlLmNoYW5uZWwucmVjaXBpZW50cylcblx0XHRcdFx0XHQgICk7XG5cblx0XHRcdFx0aWYgKCFwZXJzb24pIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5ndWlsZCA/IChwZXJzb24gYXMgR3VpbGRNZW1iZXIpLnVzZXIgOiBwZXJzb247XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5SRUxFVkFOVFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBwZXJzb25zID0gbWVzc2FnZS5ndWlsZFxuXHRcdFx0XHRcdD8gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlTWVtYmVycyhwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5jYWNoZSlcblx0XHRcdFx0XHQ6IG1lc3NhZ2UuY2hhbm5lbC50eXBlID09PSBcIkRNXCJcblx0XHRcdFx0XHQ/IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXJzKFxuXHRcdFx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0XHRcdG5ldyBDb2xsZWN0aW9uKFtcblx0XHRcdFx0XHRcdFx0XHRbbWVzc2FnZS5jaGFubmVsLnJlY2lwaWVudC5pZCwgbWVzc2FnZS5jaGFubmVsLnJlY2lwaWVudF0sXG5cdFx0XHRcdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRlZC1vcHRpb25hbC1jaGFpblxuXHRcdFx0XHRcdFx0XHRcdFt0aGlzLmNsaWVudC51c2VyPy5pZCEsIHRoaXMuY2xpZW50LnVzZXIhXVxuXHRcdFx0XHRcdFx0XHRdKVxuXHRcdFx0XHRcdCAgKVxuXHRcdFx0XHRcdDogdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlVXNlcnMoXG5cdFx0XHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRcdFx0bmV3IENvbGxlY3Rpb24oW1xuXHRcdFx0XHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0ZWQtb3B0aW9uYWwtY2hhaW5cblx0XHRcdFx0XHRcdFx0XHRbdGhpcy5jbGllbnQudXNlcj8uaWQhLCB0aGlzLmNsaWVudC51c2VyIV1cblx0XHRcdFx0XHRcdFx0XHQvLyBOb3Qgc3VyZSB3aHkgdGhpcyBpcyBoZXJlLCBib3RzIGNhbid0IGJlIGluIGdyb3VwIGRtc1xuXHRcdFx0XHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRcdFx0XSkuY29uY2F0KG1lc3NhZ2UuY2hhbm5lbC5yZWNpcGllbnRzKVxuXHRcdFx0XHRcdCAgKTtcblxuXHRcdFx0XHRpZiAoIXBlcnNvbnMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmd1aWxkID8gKHBlcnNvbnMgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkTWVtYmVyPikubWFwKG1lbWJlciA9PiBtZW1iZXIudXNlcikgOiBwZXJzb25zO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbHMuc2l6ZSA/IGNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRFWFRfQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWwgfHwgY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX1RFWFRcIikgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0cmV0dXJuIGNoYW5uZWw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5URVhUX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVscy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCB0ZXh0Q2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfVEVYVFwiKTtcblx0XHRcdFx0cmV0dXJuIHRleHRDaGFubmVscy5zaXplID8gdGV4dENoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlZPSUNFX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8ICFjaGFubmVsLmlzVm9pY2UoKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVk9JQ0VfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWxzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHZvaWNlQ2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfVk9JQ0VcIik7XG5cdFx0XHRcdHJldHVybiB2b2ljZUNoYW5uZWxzLnNpemUgPyB2b2ljZUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNBVEVHT1JZX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8IGNoYW5uZWwudHlwZSAhPT0gXCJHVUlMRF9DQVRFR09SWVwiKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNBVEVHT1JZX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVscy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCBjYXRlZ29yeUNoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGMgPT4gYy50eXBlID09PSBcIkdVSUxEX0NBVEVHT1JZXCIpO1xuXHRcdFx0XHRyZXR1cm4gY2F0ZWdvcnlDaGFubmVscy5zaXplID8gY2F0ZWdvcnlDaGFubmVscyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5ORVdTX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8IGNoYW5uZWwudHlwZSAhPT0gXCJHVUlMRF9ORVdTXCIpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTkVXU19DSEFOTkVMU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWxzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3QgbmV3c0NoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGMgPT4gYy50eXBlID09PSBcIkdVSUxEX05FV1NcIik7XG5cdFx0XHRcdHJldHVybiBuZXdzQ2hhbm5lbHMuc2l6ZSA/IG5ld3NDaGFubmVscyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5TVE9SRV9DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbCA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbCB8fCBjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfU1RPUkVcIikgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0cmV0dXJuIGNoYW5uZWw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5TVE9SRV9DSEFOTkVMU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWxzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3Qgc3RvcmVDaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihjID0+IGMudHlwZSA9PT0gXCJHVUlMRF9TVE9SRVwiKTtcblx0XHRcdFx0cmV0dXJuIHN0b3JlQ2hhbm5lbHMuc2l6ZSA/IHN0b3JlQ2hhbm5lbHMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuU1RBR0VfQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWwgfHwgY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX1NUQUdFX1ZPSUNFXCIpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuU1RBR0VfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWxzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHN0b3JlQ2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfU1RBR0VfVk9JQ0VcIik7XG5cdFx0XHRcdHJldHVybiBzdG9yZUNoYW5uZWxzLnNpemUgPyBzdG9yZUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRIUkVBRF9DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbCA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbCB8fCAhY2hhbm5lbC50eXBlLmluY2x1ZGVzKFwiVEhSRUFEXCIpKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRIUkVBRF9DSEFOTkVMU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWxzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3Qgc3RvcmVDaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihjID0+IGMudHlwZS5pbmNsdWRlcyhcIlRIUkVBRFwiKSk7XG5cdFx0XHRcdHJldHVybiBzdG9yZUNoYW5uZWxzLnNpemUgPyBzdG9yZUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlJPTEVdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlUm9sZShwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQucm9sZXMuY2FjaGUpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuUk9MRVNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCByb2xlcyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVJvbGVzKHBocmFzZSwgbWVzc2FnZS5ndWlsZC5yb2xlcy5jYWNoZSk7XG5cdFx0XHRcdHJldHVybiByb2xlcy5zaXplID8gcm9sZXMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuRU1PSkldOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlRW1vamkocGhyYXNlLCBtZXNzYWdlLmd1aWxkLmVtb2ppcy5jYWNoZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5FTU9KSVNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBlbW9qaXMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVFbW9qaXMocGhyYXNlLCBtZXNzYWdlLmd1aWxkLmVtb2ppcy5jYWNoZSk7XG5cdFx0XHRcdHJldHVybiBlbW9qaXMuc2l6ZSA/IGVtb2ppcyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5HVUlMRF06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlR3VpbGQocGhyYXNlLCB0aGlzLmNsaWVudC5ndWlsZHMuY2FjaGUpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuR1VJTERTXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGd1aWxkcyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUd1aWxkcyhwaHJhc2UsIHRoaXMuY2xpZW50Lmd1aWxkcy5jYWNoZSk7XG5cdFx0XHRcdHJldHVybiBndWlsZHMuc2l6ZSA/IGd1aWxkcyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5NRVNTQUdFXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5jaGFubmVsLm1lc3NhZ2VzLmZldGNoKHBocmFzZSBhcyBTbm93Zmxha2UpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkdVSUxEX01FU1NBR0VdOiBhc3luYyAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGNoYW5uZWwgb2YgbWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZS52YWx1ZXMoKSkge1xuXHRcdFx0XHRcdGlmIChjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfVEVYVFwiKSBjb250aW51ZTtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGF3YWl0IChjaGFubmVsIGFzIFRleHRDaGFubmVsIHwgTmV3c0NoYW5uZWwgfCBUaHJlYWRDaGFubmVsKS5tZXNzYWdlcy5mZXRjaChwaHJhc2UgYXMgU25vd2ZsYWtlKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdGlmICgvXkludmFsaWQgRm9ybSBCb2R5Ly50ZXN0KGVyci5tZXNzYWdlKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5SRUxFVkFOVF9NRVNTQUdFXTogYXN5bmMgKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgaGVyZU1zZyA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5tZXNzYWdlcy5mZXRjaChwaHJhc2UgYXMgU25vd2ZsYWtlKS5jYXRjaCgoKSA9PiBudWxsKTtcblx0XHRcdFx0aWYgKGhlcmVNc2cpIHtcblx0XHRcdFx0XHRyZXR1cm4gaGVyZU1zZztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChtZXNzYWdlLmd1aWxkKSB7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBjaGFubmVsIG9mIG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUudmFsdWVzKCkpIHtcblx0XHRcdFx0XHRcdGlmIChjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfVEVYVFwiKSBjb250aW51ZTtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhd2FpdCAoY2hhbm5lbCBhcyBUZXh0Q2hhbm5lbCB8IE5ld3NDaGFubmVsIHwgVGhyZWFkQ2hhbm5lbCkubWVzc2FnZXMuZmV0Y2gocGhyYXNlIGFzIFNub3dmbGFrZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0aWYgKC9eSW52YWxpZCBGb3JtIEJvZHkvLnRlc3QoZXJyLm1lc3NhZ2UpKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLklOVklURV06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC5mZXRjaEludml0ZShwaHJhc2UpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlVTRVJfTUVOVElPTl06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBpZCA9IHBocmFzZS5tYXRjaCgvPEAhPyhcXGR7MTcsMTl9KT4vKTtcblx0XHRcdFx0aWYgKCFpZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51c2Vycy5jYWNoZS5nZXQoaWRbMV0gYXMgU25vd2ZsYWtlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTUVNQkVSX01FTlRJT05dOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBpZCA9IHBocmFzZS5tYXRjaCgvPEAhPyhcXGR7MTcsMTl9KT4vKTtcblx0XHRcdFx0aWYgKCFpZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuY2FjaGUuZ2V0KGlkWzFdIGFzIFNub3dmbGFrZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNIQU5ORUxfTUVOVElPTl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88IyhcXGR7MTcsMTl9KT4vKTtcblx0XHRcdFx0aWYgKCFpZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlLmdldChpZFsxXSBhcyBTbm93Zmxha2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5ST0xFX01FTlRJT05dOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBpZCA9IHBocmFzZS5tYXRjaCgvPEAmKFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQucm9sZXMuY2FjaGUuZ2V0KGlkWzFdIGFzIFNub3dmbGFrZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkVNT0pJX01FTlRJT05dOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBpZCA9IHBocmFzZS5tYXRjaCgvPGE/OlthLXpBLVowLTlfXSs6KFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQuZW1vamlzLmNhY2hlLmdldChpZFsxXSBhcyBTbm93Zmxha2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DT01NQU5EX0FMSUFTXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNvbW1hbmRIYW5kbGVyLmZpbmRDb21tYW5kKHBocmFzZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNPTU1BTkRdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY29tbWFuZEhhbmRsZXIubW9kdWxlcy5nZXQocGhyYXNlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuSU5ISUJJVE9SXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmluaGliaXRvckhhbmRsZXI/Lm1vZHVsZXMuZ2V0KHBocmFzZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkxJU1RFTkVSXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmxpc3RlbmVySGFuZGxlcj8ubW9kdWxlcy5nZXQocGhyYXNlKSB8fCBudWxsO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhidWlsdGlucykpIHtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdHRoaXMudHlwZXMuc2V0KGtleSwgdmFsdWUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSByZXNvbHZlciBmdW5jdGlvbiBmb3IgYSB0eXBlLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgb2YgdHlwZS5cblx0ICovXG5cdHB1YmxpYyB0eXBlKG5hbWU6IHN0cmluZyk6IEFyZ3VtZW50VHlwZUNhc3RlciB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMudHlwZXMuZ2V0KG5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBuZXcgdHlwZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIG9mIHRoZSB0eXBlLlxuXHQgKiBAcGFyYW0gZm4gLSBGdW5jdGlvbiB0aGF0IGNhc3RzIHRoZSB0eXBlLlxuXHQgKi9cblx0cHVibGljIGFkZFR5cGUobmFtZTogc3RyaW5nLCBmbjogQXJndW1lbnRUeXBlQ2FzdGVyKTogVHlwZVJlc29sdmVyIHtcblx0XHR0aGlzLnR5cGVzLnNldChuYW1lLCBmbik7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBtdWx0aXBsZSBuZXcgdHlwZXMuXG5cdCAqIEBwYXJhbSB0eXBlcyAgLSBPYmplY3Qgd2l0aCBrZXlzIGFzIHRoZSB0eXBlIG5hbWUgYW5kIHZhbHVlcyBhcyB0aGUgY2FzdCBmdW5jdGlvbi5cblx0ICovXG5cdHB1YmxpYyBhZGRUeXBlcyh0eXBlczogYW55KTogVHlwZVJlc29sdmVyIHtcblx0XHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh0eXBlcykpIHtcblx0XHRcdHRoaXMuYWRkVHlwZShrZXksIHZhbHVlIGFzIGFueSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbiJdfQ==