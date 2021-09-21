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
        this.taskHandler = null;
        this.contextMenuCommandHandler = null;
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
     * The task handler.
     */
    taskHandler;
    /**
     * The context menu command handler.
     */
    contextMenuCommandHandler;
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
                    : this.client.util.resolveUser(phrase, new discord_js_1.Collection([
                        [message.channel.recipient.id, message.channel.recipient],
                        [this.client.user.id, this.client.user]
                    ]));
                if (!person)
                    return null;
                return message.guild ? person.user : person;
            },
            [Constants_1.ArgumentTypes.RELEVANTS]: (message, phrase) => {
                if (!phrase)
                    return null;
                const persons = message.guild
                    ? this.client.util.resolveMembers(phrase, message.guild.members.cache)
                    : this.client.util.resolveUsers(phrase, new discord_js_1.Collection([
                        [message.channel.recipient.id, message.channel.recipient],
                        [this.client.user.id, this.client.user]
                    ]));
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
            },
            [Constants_1.ArgumentTypes.TASK]: (_message, phrase) => {
                if (!phrase)
                    return null;
                return this.taskHandler?.modules.get(phrase) || null;
            },
            [Constants_1.ArgumentTypes.CONTEXT_MENU_COMMAND]: (_message, phrase) => {
                if (!phrase)
                    return null;
                return this.contextMenuCommandHandler?.modules.get(phrase) || null;
            }
        };
        for (const [key, value] of Object.entries(builtins)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9jb21tYW5kcy9hcmd1bWVudHMvVHlwZVJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBVW9CO0FBQ3BCLDZCQUEwQjtBQUUxQix1REFBd0Q7QUFTeEQ7Ozs7R0FJRztBQUNILE1BQXFCLFlBQVk7SUFDaEMsWUFBbUIsT0FBdUI7UUFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO1FBQzlCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQztRQUN0QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQWU7SUFFNUI7O09BRUc7SUFDSSxjQUFjLENBQWlCO0lBRXRDOztPQUVHO0lBQ0ksZ0JBQWdCLENBQTJCO0lBRWxEOztPQUVHO0lBQ0ksZUFBZSxDQUEwQjtJQUVoRDs7T0FFRztJQUNJLFdBQVcsQ0FBcUI7SUFFdkM7O09BRUc7SUFDSSx5QkFBeUIsQ0FBbUM7SUFFbkU7O09BRUc7SUFDSSxLQUFLLENBQXlDO0lBRXJEOztPQUVHO0lBQ0ksZUFBZTtRQUNyQixNQUFNLFFBQVEsR0FBRztZQUNoQixDQUFDLHlCQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFpQixFQUFFLE1BQWMsRUFBRSxFQUFFO2dCQUM3RCxPQUFPLE1BQU0sSUFBSSxJQUFJLENBQUM7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Q0FBQztTQUMzQjtJQUNGLENBQUM7SUFFRDs7O09BR0c7SUFDSSxJQUFJLENBQUMsSUFBWTtRQUN2QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksT0FBTyxDQUFDLElBQVksRUFBRSxFQUFzQjtRQUNsRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekIsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksUUFBUSxDQUFDLEtBQVU7UUFDekIsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDakQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBWSxDQUFDLENBQUM7U0FDaEM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRDtBQTVqQkQsK0JBNGpCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEJhc2VHdWlsZFZvaWNlQ2hhbm5lbCxcblx0Q29sbGVjdGlvbixcblx0RE1DaGFubmVsLFxuXHRHdWlsZE1lbWJlcixcblx0TWVzc2FnZSxcblx0TmV3c0NoYW5uZWwsXG5cdFNub3dmbGFrZSxcblx0VGV4dENoYW5uZWwsXG5cdFRocmVhZENoYW5uZWxcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IFVSTCB9IGZyb20gXCJ1cmxcIjtcbmltcG9ydCB7IEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfSBmcm9tIFwiLi4vLi4vLi4vdHlwaW5ncy9ndWlsZFRleHRCYXNlZENoYW5uZWxzXCI7XG5pbXBvcnQgeyBBcmd1bWVudFR5cGVzIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi8uLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyIGZyb20gXCIuLi8uLi9jb250ZXh0TWVudUNvbW1hbmRzL0NvbnRleHRNZW51Q29tbWFuZEhhbmRsZXJcIjtcbmltcG9ydCBJbmhpYml0b3JIYW5kbGVyIGZyb20gXCIuLi8uLi9pbmhpYml0b3JzL0luaGliaXRvckhhbmRsZXJcIjtcbmltcG9ydCBMaXN0ZW5lckhhbmRsZXIgZnJvbSBcIi4uLy4uL2xpc3RlbmVycy9MaXN0ZW5lckhhbmRsZXJcIjtcbmltcG9ydCBUYXNrSGFuZGxlciBmcm9tIFwiLi4vLi4vdGFza3MvVGFza0hhbmRsZXJcIjtcbmltcG9ydCBDb21tYW5kSGFuZGxlciBmcm9tIFwiLi4vQ29tbWFuZEhhbmRsZXJcIjtcbmltcG9ydCB7IEFyZ3VtZW50VHlwZUNhc3RlciB9IGZyb20gXCIuL0FyZ3VtZW50XCI7XG5cbi8qKlxuICogVHlwZSByZXNvbHZlciBmb3IgY29tbWFuZCBhcmd1bWVudHMuXG4gKiBUaGUgdHlwZXMgYXJlIGRvY3VtZW50ZWQgdW5kZXIgQXJndW1lbnRUeXBlLlxuICogQHBhcmFtIGhhbmRsZXIgLSBUaGUgY29tbWFuZCBoYW5kbGVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUeXBlUmVzb2x2ZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoaGFuZGxlcjogQ29tbWFuZEhhbmRsZXIpIHtcblx0XHR0aGlzLmNsaWVudCA9IGhhbmRsZXIuY2xpZW50O1xuXHRcdHRoaXMuY29tbWFuZEhhbmRsZXIgPSBoYW5kbGVyO1xuXHRcdHRoaXMuaW5oaWJpdG9ySGFuZGxlciA9IG51bGw7XG5cdFx0dGhpcy5saXN0ZW5lckhhbmRsZXIgPSBudWxsO1xuXHRcdHRoaXMudGFza0hhbmRsZXIgPSBudWxsO1xuXHRcdHRoaXMuY29udGV4dE1lbnVDb21tYW5kSGFuZGxlciA9IG51bGw7XG5cdFx0dGhpcy50eXBlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdFx0dGhpcy5hZGRCdWlsdEluVHlwZXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kSGFuZGxlcjogQ29tbWFuZEhhbmRsZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBpbmhpYml0b3IgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBpbmhpYml0b3JIYW5kbGVyPzogSW5oaWJpdG9ySGFuZGxlciB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSBsaXN0ZW5lciBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGxpc3RlbmVySGFuZGxlcj86IExpc3RlbmVySGFuZGxlciB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSB0YXNrIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgdGFza0hhbmRsZXI6IFRhc2tIYW5kbGVyIHwgbnVsbDtcblxuXHQvKipcblx0ICogVGhlIGNvbnRleHQgbWVudSBjb21tYW5kIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgY29udGV4dE1lbnVDb21tYW5kSGFuZGxlcjogQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciB8IG51bGw7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgdHlwZXMuXG5cdCAqL1xuXHRwdWJsaWMgdHlwZXM6IENvbGxlY3Rpb248c3RyaW5nLCBBcmd1bWVudFR5cGVDYXN0ZXI+O1xuXG5cdC8qKlxuXHQgKiBBZGRzIGJ1aWx0LWluIHR5cGVzLlxuXHQgKi9cblx0cHVibGljIGFkZEJ1aWx0SW5UeXBlcygpOiB2b2lkIHtcblx0XHRjb25zdCBidWlsdGlucyA9IHtcblx0XHRcdFtBcmd1bWVudFR5cGVzLlNUUklOR106IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0cmV0dXJuIHBocmFzZSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTE9XRVJDQVNFXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcGhyYXNlID8gcGhyYXNlLnRvTG93ZXJDYXNlKCkgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVVBQRVJDQVNFXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcGhyYXNlID8gcGhyYXNlLnRvVXBwZXJDYXNlKCkgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0hBUl9DT0RFU106IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjb2RlcyA9IFtdO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGNoYXIgb2YgcGhyYXNlKSBjb2Rlcy5wdXNoKGNoYXIuY2hhckNvZGVBdCgwKSk7XG5cdFx0XHRcdHJldHVybiBjb2Rlcztcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLk5VTUJFUl06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UgfHwgaXNOYU4oK3BocmFzZSkpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VGbG9hdChwaHJhc2UpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuSU5URUdFUl06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UgfHwgaXNOYU4oK3BocmFzZSkpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQocGhyYXNlKTtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkJJR0lOVF06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UgfHwgaXNOYU4oK3BocmFzZSkpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gQmlnSW50KHBocmFzZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvLyBKdXN0IGZvciBmdW4uXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5FTU9KSU5UXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IG4gPSBwaHJhc2UucmVwbGFjZSgvMOKDo3wx4oOjfDLig6N8M+KDo3w04oOjfDXig6N8NuKDo3w34oOjfDjig6N8OeKDo3zwn5SfL2csIChtOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gW1wiMOKDo1wiLCBcIjHig6NcIiwgXCIy4oOjXCIsIFwiM+KDo1wiLCBcIjTig6NcIiwgXCI14oOjXCIsIFwiNuKDo1wiLCBcIjfig6NcIiwgXCI44oOjXCIsIFwiOeKDo1wiLCBcIvCflJ9cIl0uaW5kZXhPZihtKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGlzTmFOKG4pKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHBhcnNlSW50KG4pO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVVJMXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICgvXjwuKz4kLy50ZXN0KHBocmFzZSkpIHBocmFzZSA9IHBocmFzZS5zbGljZSgxLCAtMSk7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFVSTChwaHJhc2UpO1xuXHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuREFURV06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCB0aW1lc3RhbXAgPSBEYXRlLnBhcnNlKHBocmFzZSk7XG5cdFx0XHRcdGlmIChpc05hTih0aW1lc3RhbXApKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DT0xPUl06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IGNvbG9yID0gcGFyc2VJbnQocGhyYXNlLnJlcGxhY2UoXCIjXCIsIFwiXCIpLCAxNik7XG5cdFx0XHRcdGlmIChjb2xvciA8IDAgfHwgY29sb3IgPiAweGZmZmZmZiB8fCBpc05hTihjb2xvcikpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBjb2xvcjtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlVTRVJdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXIocGhyYXNlLCB0aGlzLmNsaWVudC51c2Vycy5jYWNoZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5VU0VSU106IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCB1c2VycyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXJzKHBocmFzZSwgdGhpcy5jbGllbnQudXNlcnMuY2FjaGUpO1xuXHRcdFx0XHRyZXR1cm4gdXNlcnMuc2l6ZSA/IHVzZXJzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLk1FTUJFUl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVNZW1iZXIocGhyYXNlLCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuY2FjaGUpO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTUVNQkVSU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IG1lbWJlcnMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVNZW1iZXJzKHBocmFzZSwgbWVzc2FnZS5ndWlsZC5tZW1iZXJzLmNhY2hlKTtcblx0XHRcdFx0cmV0dXJuIG1lbWJlcnMuc2l6ZSA/IG1lbWJlcnMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuUkVMRVZBTlRdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHBlcnNvbiA9IG1lc3NhZ2UuZ3VpbGRcblx0XHRcdFx0XHQ/IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZU1lbWJlcihwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5jYWNoZSlcblx0XHRcdFx0XHQ6IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZVVzZXIoXG5cdFx0XHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRcdFx0bmV3IENvbGxlY3Rpb24oW1xuXHRcdFx0XHRcdFx0XHRcdFsobWVzc2FnZS5jaGFubmVsIGFzIERNQ2hhbm5lbCkucmVjaXBpZW50LmlkISwgKG1lc3NhZ2UuY2hhbm5lbCBhcyBETUNoYW5uZWwpLnJlY2lwaWVudCFdLFxuXHRcdFx0XHRcdFx0XHRcdFt0aGlzLmNsaWVudC51c2VyIS5pZCwgdGhpcy5jbGllbnQudXNlciFdXG5cdFx0XHRcdFx0XHRcdF0pXG5cdFx0XHRcdFx0ICApO1xuXG5cdFx0XHRcdGlmICghcGVyc29uKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQgPyAocGVyc29uIGFzIEd1aWxkTWVtYmVyKS51c2VyIDogcGVyc29uO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuUkVMRVZBTlRTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgcGVyc29ucyA9IG1lc3NhZ2UuZ3VpbGRcblx0XHRcdFx0XHQ/IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZU1lbWJlcnMocGhyYXNlLCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuY2FjaGUpXG5cdFx0XHRcdFx0OiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVVc2Vycyhcblx0XHRcdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdFx0XHRuZXcgQ29sbGVjdGlvbihbXG5cdFx0XHRcdFx0XHRcdFx0WyhtZXNzYWdlLmNoYW5uZWwgYXMgRE1DaGFubmVsKS5yZWNpcGllbnQuaWQsIChtZXNzYWdlLmNoYW5uZWwgYXMgRE1DaGFubmVsKS5yZWNpcGllbnRdLFxuXHRcdFx0XHRcdFx0XHRcdFt0aGlzLmNsaWVudC51c2VyIS5pZCwgdGhpcy5jbGllbnQudXNlciFdXG5cdFx0XHRcdFx0XHRcdF0pXG5cdFx0XHRcdFx0ICApO1xuXG5cdFx0XHRcdGlmICghcGVyc29ucy5zaXplKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQgPyAocGVyc29ucyBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRNZW1iZXI+KS5tYXAobWVtYmVyID0+IG1lbWJlci51c2VyKSA6IHBlcnNvbnM7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DSEFOTkVMU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWxzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBjaGFubmVscy5zaXplID8gY2hhbm5lbHMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVEVYVF9DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbCA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbCB8fCBjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfVEVYVFwiKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlRFWFRfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWxzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IHRleHRDaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihjID0+IGMudHlwZSA9PT0gXCJHVUlMRF9URVhUXCIpO1xuXHRcdFx0XHRyZXR1cm4gdGV4dENoYW5uZWxzLnNpemUgPyB0ZXh0Q2hhbm5lbHMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVk9JQ0VfQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWwgfHwgIWNoYW5uZWwuaXNWb2ljZSgpKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIGNoYW5uZWw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5WT0lDRV9DSEFOTkVMU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWxzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3Qgdm9pY2VDaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihjID0+IGMudHlwZSA9PT0gXCJHVUlMRF9WT0lDRVwiKTtcblx0XHRcdFx0cmV0dXJuIHZvaWNlQ2hhbm5lbHMuc2l6ZSA/IHZvaWNlQ2hhbm5lbHMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0FURUdPUllfQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWwgfHwgY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX0NBVEVHT1JZXCIpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0FURUdPUllfQ0hBTk5FTFNdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVscyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWxzKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWxzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdGNvbnN0IGNhdGVnb3J5Q2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfQ0FURUdPUllcIik7XG5cdFx0XHRcdHJldHVybiBjYXRlZ29yeUNoYW5uZWxzLnNpemUgPyBjYXRlZ29yeUNoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLk5FV1NfQ0hBTk5FTF06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVsKFxuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlIGFzIENvbGxlY3Rpb248c3RyaW5nLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIWNoYW5uZWwgfHwgY2hhbm5lbC50eXBlICE9PSBcIkdVSUxEX05FV1NcIikgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0cmV0dXJuIGNoYW5uZWw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5ORVdTX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVscy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCBuZXdzQ2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiR1VJTERfTkVXU1wiKTtcblx0XHRcdFx0cmV0dXJuIG5ld3NDaGFubmVscy5zaXplID8gbmV3c0NoYW5uZWxzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlNUT1JFX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8IGNoYW5uZWwudHlwZSAhPT0gXCJHVUlMRF9TVE9SRVwiKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gY2hhbm5lbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlNUT1JFX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVscy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCBzdG9yZUNoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGMgPT4gYy50eXBlID09PSBcIkdVSUxEX1NUT1JFXCIpO1xuXHRcdFx0XHRyZXR1cm4gc3RvcmVDaGFubmVscy5zaXplID8gc3RvcmVDaGFubmVscyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5TVEFHRV9DSEFOTkVMXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbCA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUNoYW5uZWwoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbCB8fCBjaGFubmVsLnR5cGUgIT09IFwiR1VJTERfU1RBR0VfVk9JQ0VcIikgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0cmV0dXJuIGNoYW5uZWw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5TVEFHRV9DSEFOTkVMU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGNoYW5uZWxzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbHMoXG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUgYXMgQ29sbGVjdGlvbjxzdHJpbmcsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghY2hhbm5lbHMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRcdFx0Y29uc3Qgc3RvcmVDaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihjID0+IGMudHlwZSA9PT0gXCJHVUlMRF9TVEFHRV9WT0lDRVwiKTtcblx0XHRcdFx0cmV0dXJuIHN0b3JlQ2hhbm5lbHMuc2l6ZSA/IHN0b3JlQ2hhbm5lbHMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVEhSRUFEX0NIQU5ORUxdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ3VpbGQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBjaGFubmVsID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlQ2hhbm5lbChcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVsIHx8ICFjaGFubmVsLnR5cGUuaW5jbHVkZXMoXCJUSFJFQURcIikpIHJldHVybiBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBjaGFubmVsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVEhSRUFEX0NIQU5ORUxTXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgY2hhbm5lbHMgPSB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVDaGFubmVscyhcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0bWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZSBhcyBDb2xsZWN0aW9uPHN0cmluZywgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD5cblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFjaGFubmVscy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0XHRjb25zdCBzdG9yZUNoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGMgPT4gYy50eXBlLmluY2x1ZGVzKFwiVEhSRUFEXCIpKTtcblx0XHRcdFx0cmV0dXJuIHN0b3JlQ2hhbm5lbHMuc2l6ZSA/IHN0b3JlQ2hhbm5lbHMgOiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuUk9MRV06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVSb2xlKHBocmFzZSwgbWVzc2FnZS5ndWlsZC5yb2xlcy5jYWNoZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5ST0xFU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IHJvbGVzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlUm9sZXMocGhyYXNlLCBtZXNzYWdlLmd1aWxkLnJvbGVzLmNhY2hlKTtcblx0XHRcdFx0cmV0dXJuIHJvbGVzLnNpemUgPyByb2xlcyA6IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5FTU9KSV06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVFbW9qaShwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQuZW1vamlzLmNhY2hlKTtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkVNT0pJU106IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGVtb2ppcyA9IHRoaXMuY2xpZW50LnV0aWwucmVzb2x2ZUVtb2ppcyhwaHJhc2UsIG1lc3NhZ2UuZ3VpbGQuZW1vamlzLmNhY2hlKTtcblx0XHRcdFx0cmV0dXJuIGVtb2ppcy5zaXplID8gZW1vamlzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkdVSUxEXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNsaWVudC51dGlsLnJlc29sdmVHdWlsZChwaHJhc2UsIHRoaXMuY2xpZW50Lmd1aWxkcy5jYWNoZSk7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5HVUlMRFNdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgZ3VpbGRzID0gdGhpcy5jbGllbnQudXRpbC5yZXNvbHZlR3VpbGRzKHBocmFzZSwgdGhpcy5jbGllbnQuZ3VpbGRzLmNhY2hlKTtcblx0XHRcdFx0cmV0dXJuIGd1aWxkcy5zaXplID8gZ3VpbGRzIDogbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLk1FU1NBR0VdOiAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJldHVybiBtZXNzYWdlLmNoYW5uZWwubWVzc2FnZXMuZmV0Y2gocGhyYXNlIGFzIFNub3dmbGFrZSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuR1VJTERfTUVTU0FHRV06IGFzeW5jIChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGZvciAoY29uc3QgY2hhbm5lbCBvZiBtZXNzYWdlLmd1aWxkLmNoYW5uZWxzLmNhY2hlLnZhbHVlcygpKSB7XG5cdFx0XHRcdFx0aWYgKGNoYW5uZWwudHlwZSAhPT0gXCJHVUlMRF9URVhUXCIpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYXdhaXQgKGNoYW5uZWwgYXMgVGV4dENoYW5uZWwgfCBOZXdzQ2hhbm5lbCB8IFRocmVhZENoYW5uZWwpLm1lc3NhZ2VzLmZldGNoKHBocmFzZSBhcyBTbm93Zmxha2UpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0aWYgKC9eSW52YWxpZCBGb3JtIEJvZHkvLnRlc3QoZXJyLm1lc3NhZ2UpKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlJFTEVWQU5UX01FU1NBR0VdOiBhc3luYyAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRjb25zdCBoZXJlTXNnID0gYXdhaXQgbWVzc2FnZS5jaGFubmVsLm1lc3NhZ2VzLmZldGNoKHBocmFzZSBhcyBTbm93Zmxha2UpLmNhdGNoKCgpID0+IG51bGwpO1xuXHRcdFx0XHRpZiAoaGVyZU1zZykge1xuXHRcdFx0XHRcdHJldHVybiBoZXJlTXNnO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGNoYW5uZWwgb2YgbWVzc2FnZS5ndWlsZC5jaGFubmVscy5jYWNoZS52YWx1ZXMoKSkge1xuXHRcdFx0XHRcdFx0aWYgKGNoYW5uZWwudHlwZSAhPT0gXCJHVUlMRF9URVhUXCIpIGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGF3YWl0IChjaGFubmVsIGFzIFRleHRDaGFubmVsIHwgTmV3c0NoYW5uZWwgfCBUaHJlYWRDaGFubmVsKS5tZXNzYWdlcy5mZXRjaChwaHJhc2UgYXMgU25vd2ZsYWtlKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0XHRpZiAoL15JbnZhbGlkIEZvcm0gQm9keS8udGVzdChlcnIubWVzc2FnZSkpIHJldHVybiBudWxsO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuSU5WSVRFXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LmZldGNoSW52aXRlKHBocmFzZSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuVVNFUl9NRU5USU9OXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88QCE/KFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2xpZW50LnVzZXJzLmNhY2hlLmdldChpZFsxXSBhcyBTbm93Zmxha2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5NRU1CRVJfTUVOVElPTl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88QCE/KFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5jYWNoZS5nZXQoaWRbMV0gYXMgU25vd2ZsYWtlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ0hBTk5FTF9NRU5USU9OXTogKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0aWYgKCFtZXNzYWdlLmd1aWxkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0Y29uc3QgaWQgPSBwaHJhc2UubWF0Y2goLzwjKFxcZHsxNywxOX0pPi8pO1xuXHRcdFx0XHRpZiAoIWlkKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ3VpbGQuY2hhbm5lbHMuY2FjaGUuZ2V0KGlkWzFdIGFzIFNub3dmbGFrZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLlJPTEVfTUVOVElPTl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88QCYoXFxkezE3LDE5fSk+Lyk7XG5cdFx0XHRcdGlmICghaWQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5ndWlsZC5yb2xlcy5jYWNoZS5nZXQoaWRbMV0gYXMgU25vd2ZsYWtlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuRU1PSklfTUVOVElPTl06IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGlmICghbWVzc2FnZS5ndWlsZCkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdGNvbnN0IGlkID0gcGhyYXNlLm1hdGNoKC88YT86W2EtekEtWjAtOV9dKzooXFxkezE3LDE5fSk+Lyk7XG5cdFx0XHRcdGlmICghaWQpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5ndWlsZC5lbW9qaXMuY2FjaGUuZ2V0KGlkWzFdIGFzIFNub3dmbGFrZSkgfHwgbnVsbDtcblx0XHRcdH0sXG5cblx0XHRcdFtBcmd1bWVudFR5cGVzLkNPTU1BTkRfQUxJQVNdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY29tbWFuZEhhbmRsZXIuZmluZENvbW1hbmQocGhyYXNlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuQ09NTUFORF06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jb21tYW5kSGFuZGxlci5tb2R1bGVzLmdldChwaHJhc2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5JTkhJQklUT1JdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuaW5oaWJpdG9ySGFuZGxlcj8ubW9kdWxlcy5nZXQocGhyYXNlKSB8fCBudWxsO1xuXHRcdFx0fSxcblxuXHRcdFx0W0FyZ3VtZW50VHlwZXMuTElTVEVORVJdOiAoX21lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghcGhyYXNlKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0cmV0dXJuIHRoaXMubGlzdGVuZXJIYW5kbGVyPy5tb2R1bGVzLmdldChwaHJhc2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5UQVNLXTogKF9tZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRpZiAoIXBocmFzZSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdHJldHVybiB0aGlzLnRhc2tIYW5kbGVyPy5tb2R1bGVzLmdldChwaHJhc2UpIHx8IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHRbQXJndW1lbnRUeXBlcy5DT05URVhUX01FTlVfQ09NTUFORF06IChfbWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKCFwaHJhc2UpIHJldHVybiBudWxsO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyPy5tb2R1bGVzLmdldChwaHJhc2UpIHx8IG51bGw7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGJ1aWx0aW5zKSkge1xuXHRcdFx0dGhpcy50eXBlcy5zZXQoa2V5LCB2YWx1ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHJlc29sdmVyIGZ1bmN0aW9uIGZvciBhIHR5cGUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSBvZiB0eXBlLlxuXHQgKi9cblx0cHVibGljIHR5cGUobmFtZTogc3RyaW5nKTogQXJndW1lbnRUeXBlQ2FzdGVyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy50eXBlcy5nZXQobmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG5ldyB0eXBlLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgb2YgdGhlIHR5cGUuXG5cdCAqIEBwYXJhbSBmbiAtIEZ1bmN0aW9uIHRoYXQgY2FzdHMgdGhlIHR5cGUuXG5cdCAqL1xuXHRwdWJsaWMgYWRkVHlwZShuYW1lOiBzdHJpbmcsIGZuOiBBcmd1bWVudFR5cGVDYXN0ZXIpOiBUeXBlUmVzb2x2ZXIge1xuXHRcdHRoaXMudHlwZXMuc2V0KG5hbWUsIGZuKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIG11bHRpcGxlIG5ldyB0eXBlcy5cblx0ICogQHBhcmFtIHR5cGVzICAtIE9iamVjdCB3aXRoIGtleXMgYXMgdGhlIHR5cGUgbmFtZSBhbmQgdmFsdWVzIGFzIHRoZSBjYXN0IGZ1bmN0aW9uLlxuXHQgKi9cblx0cHVibGljIGFkZFR5cGVzKHR5cGVzOiBhbnkpOiBUeXBlUmVzb2x2ZXIge1xuXHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHR5cGVzKSkge1xuXHRcdFx0dGhpcy5hZGRUeXBlKGtleSwgdmFsdWUgYXMgYW55KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuIl19