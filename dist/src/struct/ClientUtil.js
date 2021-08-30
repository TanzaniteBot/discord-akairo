"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/**
 * Client utilities to help with common tasks.
 * @param {AkairoClient} client - The client.
 */
class ClientUtil {
    constructor(client) {
        this.client = client;
    }
    /**
     * The Akairo client.
     */
    client;
    /**
     * Makes a MessageAttachment.
     * @param file - The file.
     * @param name - The filename.
     */
    attachment(file, name) {
        return new discord_js_1.MessageAttachment(file, name);
    }
    /**
     * Checks if a string could be referring to a channel.
     * @param text - Text to check.
     * @param channel - Channel to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkChannel(text, channel, caseSensitive = false, wholeWord = false) {
        if (channel.id === text)
            return true;
        const reg = /<#(\d{17,19})>/;
        const match = text.match(reg);
        if (match && channel.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? channel.name : channel.name.toLowerCase();
        if (!wholeWord) {
            return name.includes(text) || name.includes(text.replace(/^#/, ""));
        }
        return name === text || name === text.replace(/^#/, "");
    }
    /**
     * Checks if a string could be referring to a emoji.
     * @param text - Text to check.
     * @param emoji - Emoji to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkEmoji(text, emoji, caseSensitive = false, wholeWord = false) {
        if (emoji.id === text)
            return true;
        const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/;
        const match = text.match(reg);
        if (match && emoji.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? emoji.name : emoji.name?.toLowerCase();
        if (!wholeWord) {
            return name.includes(text) || name.includes(text.replace(/:/, ""));
        }
        return name === text || name === text.replace(/:/, "");
    }
    /**
     * Checks if a string could be referring to a guild.
     * @param text - Text to check.
     * @param guild - Guild to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkGuild(text, guild, caseSensitive = false, wholeWord = false) {
        if (guild.id === text)
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? guild.name : guild.name.toLowerCase();
        if (!wholeWord)
            return name.includes(text);
        return name === text;
    }
    /**
     * Checks if a string could be referring to a member.
     * @param text - Text to check.
     * @param member - Member to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkMember(text, member, caseSensitive = false, wholeWord = false) {
        if (member.id === text)
            return true;
        const reg = /<@!?(\d{17,19})>/;
        const match = text.match(reg);
        if (match && member.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const username = caseSensitive ? member.user.username : member.user.username.toLowerCase();
        const displayName = caseSensitive ? member.displayName : member.displayName.toLowerCase();
        const discrim = member.user.discriminator;
        if (!wholeWord) {
            return (displayName.includes(text) ||
                username.includes(text) ||
                ((username.includes(text.split("#")[0]) || displayName.includes(text.split("#")[0])) &&
                    discrim.includes(text.split("#")[1])));
        }
        return (displayName === text ||
            username === text ||
            ((username === text.split("#")[0] || displayName === text.split("#")[0]) && discrim === text.split("#")[1]));
    }
    /**
     * Checks if a string could be referring to a role.
     * @param text - Text to check.
     * @param role - Role to check.
     * @param caseSensitive - Makes checking by name case sensitive.
     * @param wholeWord - Makes checking by name match full word only.
     */
    checkRole(text, role, caseSensitive = false, wholeWord = false) {
        if (role.id === text)
            return true;
        const reg = /<@&(\d{17,19})>/;
        const match = text.match(reg);
        if (match && role.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const name = caseSensitive ? role.name : role.name.toLowerCase();
        if (!wholeWord) {
            return name.includes(text) || name.includes(text.replace(/^@/, ""));
        }
        return name === text || name === text.replace(/^@/, "");
    }
    /**
     * Resolves a user from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param users - Collection of users to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    checkUser(text, user, caseSensitive = false, wholeWord = false) {
        if (user.id === text)
            return true;
        const reg = /<@!?(\d{17,19})>/;
        const match = text.match(reg);
        if (match && user.id === match[1])
            return true;
        text = caseSensitive ? text : text.toLowerCase();
        const username = caseSensitive ? user.username : user.username.toLowerCase();
        const discrim = user.discriminator;
        if (!wholeWord) {
            return username.includes(text) || (username.includes(text.split("#")[0]) && discrim.includes(text.split("#")[1]));
        }
        return username === text || (username === text.split("#")[0] && discrim === text.split("#")[1]);
    }
    /**
     * Makes a Collection.
     * @param iterable - Entries to fill with.
     */
    collection(iterable) {
        return new discord_js_1.Collection(iterable);
    }
    /**
     * Compares two member objects presences and checks if they stopped or started a stream or not.
     * Returns `0`, `1`, or `2` for no change, stopped, or started.
     * @param oldMember - The old member.
     * @param newMember - The new member.
     */
    compareStreaming(oldMember, newMember) {
        const s1 = oldMember.presence?.activities.find(c => c.type === "STREAMING");
        const s2 = newMember.presence?.activities.find(c => c.type === "STREAMING");
        if (s1 === s2)
            return 0;
        if (s1)
            return 1;
        if (s2)
            return 2;
        return 0;
    }
    /**
     * Makes a MessageEmbed.
     * @param data - Embed data.
     */
    embed(data) {
        return new discord_js_1.MessageEmbed(data);
    }
    /**
     * Combination of `<Client>.fetchUser()` and `<Guild>.fetchMember()`.
     * @param guild - Guild to fetch in.
     * @param id - ID of the user.
     * @param cache - Whether or not to add to cache.
     */
    async fetchMember(guild, id, cache) {
        const user = await this.client.users.fetch(id, { cache });
        return guild.members.fetch({ user, cache });
    }
    /**
     * Array of permission names.
     */
    permissionNames() {
        return Object.keys(discord_js_1.Permissions.FLAGS);
    }
    /**
     * Resolves a channel from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param channels - Collection of channels to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveChannel(text, channels, caseSensitive = false, wholeWord = false) {
        return (channels.get(text) ||
            channels.find(channel => this.checkChannel(text, channel, caseSensitive, wholeWord)));
    }
    /**
     * Resolves multiple channels from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param channels - Collection of channels to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveChannels(text, channels, caseSensitive = false, wholeWord = false) {
        return channels.filter(channel => this.checkChannel(text, channel, caseSensitive, wholeWord));
    }
    /**
     * Resolves a custom emoji from a string, such as a name or a mention.
     * @param text - Text to resolve.
     * @param emojis - Collection of emojis to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveEmoji(text, emojis, caseSensitive = false, wholeWord = false) {
        return (emojis.get(text) || emojis.find(emoji => this.checkEmoji(text, emoji, caseSensitive, wholeWord)));
    }
    /**
     * Resolves multiple custom emojis from a string, such as a name or a mention.
     * @param text - Text to resolve.
     * @param emojis - Collection of emojis to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveEmojis(text, emojis, caseSensitive = false, wholeWord = false) {
        return emojis.filter(emoji => this.checkEmoji(text, emoji, caseSensitive, wholeWord));
    }
    /**
     * Resolves a guild from a string, such as an ID or a name.
     * @param text - Text to resolve.
     * @param guilds - Collection of guilds to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveGuild(text, guilds, caseSensitive = false, wholeWord = false) {
        return (guilds.get(text) || guilds.find(guild => this.checkGuild(text, guild, caseSensitive, wholeWord)));
    }
    /**
     * Resolves multiple guilds from a string, such as an ID or a name.
     * @param text - Text to resolve.
     * @param guilds - Collection of guilds to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveGuilds(text, guilds, caseSensitive = false, wholeWord = false) {
        return guilds.filter(guild => this.checkGuild(text, guild, caseSensitive, wholeWord));
    }
    /**
     * Resolves a member from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param members - Collection of members to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveMember(text, members, caseSensitive = false, wholeWord = false) {
        return (members.get(text) || members.find(member => this.checkMember(text, member, caseSensitive, wholeWord)));
    }
    /**
     * Resolves multiple members from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param members - Collection of members to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveMembers(text, members, caseSensitive = false, wholeWord = false) {
        return members.filter(member => this.checkMember(text, member, caseSensitive, wholeWord));
    }
    /**
     * Resolves a permission number and returns an array of permission names.
     * @param number - The permissions number.
     */
    resolvePermissionNumber(number) {
        const resolved = [];
        for (const key of Object.keys(discord_js_1.Permissions.FLAGS)) {
            if (BigInt(number) & discord_js_1.Permissions.FLAGS[key])
                resolved.push(key);
        }
        return resolved;
    }
    /**
     * Resolves a role from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param roles - Collection of roles to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveRole(text, roles, caseSensitive = false, wholeWord = false) {
        return roles.get(text) || roles.find(role => this.checkRole(text, role, caseSensitive, wholeWord));
    }
    /**
     * Resolves multiple roles from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param roles - Collection of roles to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveRoles(text, roles, caseSensitive = false, wholeWord = false) {
        return roles.filter(role => this.checkRole(text, role, caseSensitive, wholeWord));
    }
    /**
     * Resolves a user from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param users - Collection of users to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveUser(text, users, caseSensitive = false, wholeWord = false) {
        return users.get(text) || users.find(user => this.checkUser(text, user, caseSensitive, wholeWord));
    }
    /**
     * Resolves multiple users from a string, such as an ID, a name, or a mention.
     * @param text - Text to resolve.
     * @param users - Collection of users to find in.
     * @param caseSensitive - Makes finding by name case sensitive.
     * @param wholeWord - Makes finding by name match full word only.
     */
    resolveUsers(text, users, caseSensitive = false, wholeWord = false) {
        return users.filter(user => this.checkUser(text, user, caseSensitive, wholeWord));
    }
}
exports.default = ClientUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQ2xpZW50VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQWNvQjtBQUtwQjs7O0dBR0c7QUFDSCxNQUFxQixVQUFVO0lBQzlCLFlBQW1CLE1BQW9CO1FBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU0sQ0FBZTtJQUVyQzs7OztPQUlHO0lBQ0ksVUFBVSxDQUFDLElBQStCLEVBQUUsSUFBYTtRQUMvRCxPQUFPLElBQUksOEJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxZQUFZLENBQ2xCLElBQVksRUFDWixPQUF1RCxFQUN2RCxhQUFhLEdBQUcsS0FBSyxFQUNyQixTQUFTLEdBQUcsS0FBSztRQUVqQixJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssSUFBSTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRXJDLE1BQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDO1FBQzdCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFOUIsSUFBSSxLQUFLLElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFbEQsSUFBSSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakQsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXZFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZixP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bEMsYUFBYSxHQUFHLEtBQUssRUFDckIsU0FBUyxHQUFHLEtBQUs7UUFFakIsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQWlCLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2pILENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxZQUFZLENBQ2xCLElBQVksRUFDWixLQUFrQyxFQUNsQyxhQUFhLEdBQUcsS0FBSyxFQUNyQixTQUFTLEdBQUcsS0FBSztRQUVqQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDbkYsQ0FBQztDQUNEO0FBcGJELDZCQW9iQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEJhc2VHdWlsZFZvaWNlQ2hhbm5lbCxcblx0QnVmZmVyUmVzb2x2YWJsZSxcblx0Q29sbGVjdGlvbixcblx0RW1vamksXG5cdEd1aWxkLFxuXHRHdWlsZE1lbWJlcixcblx0TWVzc2FnZUF0dGFjaG1lbnQsXG5cdE1lc3NhZ2VFbWJlZCxcblx0TWVzc2FnZUVtYmVkT3B0aW9ucyxcblx0UGVybWlzc2lvbnMsXG5cdFJvbGUsXG5cdFNub3dmbGFrZSxcblx0VXNlclxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgU3RyZWFtIH0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHsgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB9IGZyb20gXCIuLi90eXBpbmdzL2d1aWxkVGV4dEJhc2VkQ2hhbm5lbHNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4vQWthaXJvQ2xpZW50XCI7XG5cbi8qKlxuICogQ2xpZW50IHV0aWxpdGllcyB0byBoZWxwIHdpdGggY29tbW9uIHRhc2tzLlxuICogQHBhcmFtIHtBa2Fpcm9DbGllbnR9IGNsaWVudCAtIFRoZSBjbGllbnQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsaWVudFV0aWwge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoY2xpZW50OiBBa2Fpcm9DbGllbnQpIHtcblx0XHR0aGlzLmNsaWVudCA9IGNsaWVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyByZWFkb25seSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogTWFrZXMgYSBNZXNzYWdlQXR0YWNobWVudC5cblx0ICogQHBhcmFtIGZpbGUgLSBUaGUgZmlsZS5cblx0ICogQHBhcmFtIG5hbWUgLSBUaGUgZmlsZW5hbWUuXG5cdCAqL1xuXHRwdWJsaWMgYXR0YWNobWVudChmaWxlOiBCdWZmZXJSZXNvbHZhYmxlIHwgU3RyZWFtLCBuYW1lPzogc3RyaW5nKTogTWVzc2FnZUF0dGFjaG1lbnQge1xuXHRcdHJldHVybiBuZXcgTWVzc2FnZUF0dGFjaG1lbnQoZmlsZSwgbmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgc3RyaW5nIGNvdWxkIGJlIHJlZmVycmluZyB0byBhIGNoYW5uZWwuXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBjaGVjay5cblx0ICogQHBhcmFtIGNoYW5uZWwgLSBDaGFubmVsIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBjaGVja2luZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIGNoZWNrQ2hhbm5lbChcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0Y2hhbm5lbDogR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbCxcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogYm9vbGVhbiB7XG5cdFx0aWYgKGNoYW5uZWwuaWQgPT09IHRleHQpIHJldHVybiB0cnVlO1xuXG5cdFx0Y29uc3QgcmVnID0gLzwjKFxcZHsxNywxOX0pPi87XG5cdFx0Y29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKHJlZyk7XG5cblx0XHRpZiAobWF0Y2ggJiYgY2hhbm5lbC5pZCA9PT0gbWF0Y2hbMV0pIHJldHVybiB0cnVlO1xuXG5cdFx0dGV4dCA9IGNhc2VTZW5zaXRpdmUgPyB0ZXh0IDogdGV4dC50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IG5hbWUgPSBjYXNlU2Vuc2l0aXZlID8gY2hhbm5lbC5uYW1lIDogY2hhbm5lbC5uYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRpZiAoIXdob2xlV29yZCkge1xuXHRcdFx0cmV0dXJuIG5hbWUuaW5jbHVkZXModGV4dCkgfHwgbmFtZS5pbmNsdWRlcyh0ZXh0LnJlcGxhY2UoL14jLywgXCJcIikpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuYW1lID09PSB0ZXh0IHx8IG5hbWUgPT09IHRleHQucmVwbGFjZSgvXiMvLCBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBzdHJpbmcgY291bGQgYmUgcmVmZXJyaW5nIHRvIGEgZW1vamkuXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBjaGVjay5cblx0ICogQHBhcmFtIGVtb2ppIC0gRW1vamkgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgY2hlY2tFbW9qaSh0ZXh0OiBzdHJpbmcsIGVtb2ppOiBFbW9qaSwgY2FzZVNlbnNpdGl2ZSA9IGZhbHNlLCB3aG9sZVdvcmQgPSBmYWxzZSk6IGJvb2xlYW4ge1xuXHRcdGlmIChlbW9qaS5pZCA9PT0gdGV4dCkgcmV0dXJuIHRydWU7XG5cblx0XHRjb25zdCByZWcgPSAvPGE/OlthLXpBLVowLTlfXSs6KFxcZHsxNywxOX0pPi87XG5cdFx0Y29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKHJlZyk7XG5cblx0XHRpZiAobWF0Y2ggJiYgZW1vamkuaWQgPT09IG1hdGNoWzFdKSByZXR1cm4gdHJ1ZTtcblxuXHRcdHRleHQgPSBjYXNlU2Vuc2l0aXZlID8gdGV4dCA6IHRleHQudG9Mb3dlckNhc2UoKTtcblx0XHRjb25zdCBuYW1lID0gY2FzZVNlbnNpdGl2ZSA/IGVtb2ppLm5hbWUgOiBlbW9qaS5uYW1lPy50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0aWYgKCF3aG9sZVdvcmQpIHtcblx0XHRcdHJldHVybiBuYW1lLmluY2x1ZGVzKHRleHQpIHx8IG5hbWUuaW5jbHVkZXModGV4dC5yZXBsYWNlKC86LywgXCJcIikpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuYW1lID09PSB0ZXh0IHx8IG5hbWUgPT09IHRleHQucmVwbGFjZSgvOi8sIFwiXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHN0cmluZyBjb3VsZCBiZSByZWZlcnJpbmcgdG8gYSBndWlsZC5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gZ3VpbGQgLSBHdWlsZCB0byBjaGVjay5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBjaGVja2luZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyBjaGVja0d1aWxkKHRleHQ6IHN0cmluZywgZ3VpbGQ6IEd1aWxkLCBjYXNlU2Vuc2l0aXZlID0gZmFsc2UsIHdob2xlV29yZCA9IGZhbHNlKTogYm9vbGVhbiB7XG5cdFx0aWYgKGd1aWxkLmlkID09PSB0ZXh0KSByZXR1cm4gdHJ1ZTtcblxuXHRcdHRleHQgPSBjYXNlU2Vuc2l0aXZlID8gdGV4dCA6IHRleHQudG9Mb3dlckNhc2UoKTtcblx0XHRjb25zdCBuYW1lID0gY2FzZVNlbnNpdGl2ZSA/IGd1aWxkLm5hbWUgOiBndWlsZC5uYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRpZiAoIXdob2xlV29yZCkgcmV0dXJuIG5hbWUuaW5jbHVkZXModGV4dCk7XG5cdFx0cmV0dXJuIG5hbWUgPT09IHRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgc3RyaW5nIGNvdWxkIGJlIHJlZmVycmluZyB0byBhIG1lbWJlci5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gbWVtYmVyIC0gTWVtYmVyIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBjaGVja2luZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIGNoZWNrTWVtYmVyKHRleHQ6IHN0cmluZywgbWVtYmVyOiBHdWlsZE1lbWJlciwgY2FzZVNlbnNpdGl2ZSA9IGZhbHNlLCB3aG9sZVdvcmQgPSBmYWxzZSk6IGJvb2xlYW4ge1xuXHRcdGlmIChtZW1iZXIuaWQgPT09IHRleHQpIHJldHVybiB0cnVlO1xuXG5cdFx0Y29uc3QgcmVnID0gLzxAIT8oXFxkezE3LDE5fSk+Lztcblx0XHRjb25zdCBtYXRjaCA9IHRleHQubWF0Y2gocmVnKTtcblxuXHRcdGlmIChtYXRjaCAmJiBtZW1iZXIuaWQgPT09IG1hdGNoWzFdKSByZXR1cm4gdHJ1ZTtcblxuXHRcdHRleHQgPSBjYXNlU2Vuc2l0aXZlID8gdGV4dCA6IHRleHQudG9Mb3dlckNhc2UoKTtcblx0XHRjb25zdCB1c2VybmFtZSA9IGNhc2VTZW5zaXRpdmUgPyBtZW1iZXIudXNlci51c2VybmFtZSA6IG1lbWJlci51c2VyLnVzZXJuYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0Y29uc3QgZGlzcGxheU5hbWUgPSBjYXNlU2Vuc2l0aXZlID8gbWVtYmVyLmRpc3BsYXlOYW1lIDogbWVtYmVyLmRpc3BsYXlOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0Y29uc3QgZGlzY3JpbSA9IG1lbWJlci51c2VyLmRpc2NyaW1pbmF0b3I7XG5cblx0XHRpZiAoIXdob2xlV29yZCkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0ZGlzcGxheU5hbWUuaW5jbHVkZXModGV4dCkgfHxcblx0XHRcdFx0dXNlcm5hbWUuaW5jbHVkZXModGV4dCkgfHxcblx0XHRcdFx0KCh1c2VybmFtZS5pbmNsdWRlcyh0ZXh0LnNwbGl0KFwiI1wiKVswXSkgfHwgZGlzcGxheU5hbWUuaW5jbHVkZXModGV4dC5zcGxpdChcIiNcIilbMF0pKSAmJlxuXHRcdFx0XHRcdGRpc2NyaW0uaW5jbHVkZXModGV4dC5zcGxpdChcIiNcIilbMV0pKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0ZGlzcGxheU5hbWUgPT09IHRleHQgfHxcblx0XHRcdHVzZXJuYW1lID09PSB0ZXh0IHx8XG5cdFx0XHQoKHVzZXJuYW1lID09PSB0ZXh0LnNwbGl0KFwiI1wiKVswXSB8fCBkaXNwbGF5TmFtZSA9PT0gdGV4dC5zcGxpdChcIiNcIilbMF0pICYmIGRpc2NyaW0gPT09IHRleHQuc3BsaXQoXCIjXCIpWzFdKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgc3RyaW5nIGNvdWxkIGJlIHJlZmVycmluZyB0byBhIHJvbGUuXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBjaGVjay5cblx0ICogQHBhcmFtIHJvbGUgLSBSb2xlIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBjaGVja2luZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIGNoZWNrUm9sZSh0ZXh0OiBzdHJpbmcsIHJvbGU6IFJvbGUsIGNhc2VTZW5zaXRpdmUgPSBmYWxzZSwgd2hvbGVXb3JkID0gZmFsc2UpOiBib29sZWFuIHtcblx0XHRpZiAocm9sZS5pZCA9PT0gdGV4dCkgcmV0dXJuIHRydWU7XG5cblx0XHRjb25zdCByZWcgPSAvPEAmKFxcZHsxNywxOX0pPi87XG5cdFx0Y29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKHJlZyk7XG5cblx0XHRpZiAobWF0Y2ggJiYgcm9sZS5pZCA9PT0gbWF0Y2hbMV0pIHJldHVybiB0cnVlO1xuXG5cdFx0dGV4dCA9IGNhc2VTZW5zaXRpdmUgPyB0ZXh0IDogdGV4dC50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IG5hbWUgPSBjYXNlU2Vuc2l0aXZlID8gcm9sZS5uYW1lIDogcm9sZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRpZiAoIXdob2xlV29yZCkge1xuXHRcdFx0cmV0dXJuIG5hbWUuaW5jbHVkZXModGV4dCkgfHwgbmFtZS5pbmNsdWRlcyh0ZXh0LnJlcGxhY2UoL15ALywgXCJcIikpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuYW1lID09PSB0ZXh0IHx8IG5hbWUgPT09IHRleHQucmVwbGFjZSgvXkAvLCBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIHVzZXIgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhbiBJRCwgYSBuYW1lLCBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gdXNlcnMgLSBDb2xsZWN0aW9uIG9mIHVzZXJzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIGNoZWNrVXNlcih0ZXh0OiBzdHJpbmcsIHVzZXI6IFVzZXIsIGNhc2VTZW5zaXRpdmUgPSBmYWxzZSwgd2hvbGVXb3JkID0gZmFsc2UpOiBib29sZWFuIHtcblx0XHRpZiAodXNlci5pZCA9PT0gdGV4dCkgcmV0dXJuIHRydWU7XG5cblx0XHRjb25zdCByZWcgPSAvPEAhPyhcXGR7MTcsMTl9KT4vO1xuXHRcdGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaChyZWcpO1xuXG5cdFx0aWYgKG1hdGNoICYmIHVzZXIuaWQgPT09IG1hdGNoWzFdKSByZXR1cm4gdHJ1ZTtcblxuXHRcdHRleHQgPSBjYXNlU2Vuc2l0aXZlID8gdGV4dCA6IHRleHQudG9Mb3dlckNhc2UoKTtcblx0XHRjb25zdCB1c2VybmFtZSA9IGNhc2VTZW5zaXRpdmUgPyB1c2VyLnVzZXJuYW1lIDogdXNlci51c2VybmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IGRpc2NyaW0gPSB1c2VyLmRpc2NyaW1pbmF0b3I7XG5cblx0XHRpZiAoIXdob2xlV29yZCkge1xuXHRcdFx0cmV0dXJuIHVzZXJuYW1lLmluY2x1ZGVzKHRleHQpIHx8ICh1c2VybmFtZS5pbmNsdWRlcyh0ZXh0LnNwbGl0KFwiI1wiKVswXSkgJiYgZGlzY3JpbS5pbmNsdWRlcyh0ZXh0LnNwbGl0KFwiI1wiKVsxXSkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB1c2VybmFtZSA9PT0gdGV4dCB8fCAodXNlcm5hbWUgPT09IHRleHQuc3BsaXQoXCIjXCIpWzBdICYmIGRpc2NyaW0gPT09IHRleHQuc3BsaXQoXCIjXCIpWzFdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNYWtlcyBhIENvbGxlY3Rpb24uXG5cdCAqIEBwYXJhbSBpdGVyYWJsZSAtIEVudHJpZXMgdG8gZmlsbCB3aXRoLlxuXHQgKi9cblx0cHVibGljIGNvbGxlY3Rpb248SywgVj4oaXRlcmFibGU/OiBSZWFkb25seUFycmF5PHJlYWRvbmx5IFtLLCBWXT4gfCBudWxsKTogQ29sbGVjdGlvbjxLLCBWPiB7XG5cdFx0cmV0dXJuIG5ldyBDb2xsZWN0aW9uKGl0ZXJhYmxlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb21wYXJlcyB0d28gbWVtYmVyIG9iamVjdHMgcHJlc2VuY2VzIGFuZCBjaGVja3MgaWYgdGhleSBzdG9wcGVkIG9yIHN0YXJ0ZWQgYSBzdHJlYW0gb3Igbm90LlxuXHQgKiBSZXR1cm5zIGAwYCwgYDFgLCBvciBgMmAgZm9yIG5vIGNoYW5nZSwgc3RvcHBlZCwgb3Igc3RhcnRlZC5cblx0ICogQHBhcmFtIG9sZE1lbWJlciAtIFRoZSBvbGQgbWVtYmVyLlxuXHQgKiBAcGFyYW0gbmV3TWVtYmVyIC0gVGhlIG5ldyBtZW1iZXIuXG5cdCAqL1xuXHRwdWJsaWMgY29tcGFyZVN0cmVhbWluZyhvbGRNZW1iZXI6IEd1aWxkTWVtYmVyLCBuZXdNZW1iZXI6IEd1aWxkTWVtYmVyKTogMCB8IDEgfCAyIHtcblx0XHRjb25zdCBzMSA9IG9sZE1lbWJlci5wcmVzZW5jZT8uYWN0aXZpdGllcy5maW5kKGMgPT4gYy50eXBlID09PSBcIlNUUkVBTUlOR1wiKTtcblx0XHRjb25zdCBzMiA9IG5ld01lbWJlci5wcmVzZW5jZT8uYWN0aXZpdGllcy5maW5kKGMgPT4gYy50eXBlID09PSBcIlNUUkVBTUlOR1wiKTtcblx0XHRpZiAoczEgPT09IHMyKSByZXR1cm4gMDtcblx0XHRpZiAoczEpIHJldHVybiAxO1xuXHRcdGlmIChzMikgcmV0dXJuIDI7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblxuXHQvKipcblx0ICogTWFrZXMgYSBNZXNzYWdlRW1iZWQuXG5cdCAqIEBwYXJhbSBkYXRhIC0gRW1iZWQgZGF0YS5cblx0ICovXG5cdHB1YmxpYyBlbWJlZChkYXRhPzogTWVzc2FnZUVtYmVkIHwgTWVzc2FnZUVtYmVkT3B0aW9ucyk6IE1lc3NhZ2VFbWJlZCB7XG5cdFx0cmV0dXJuIG5ldyBNZXNzYWdlRW1iZWQoZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29tYmluYXRpb24gb2YgYDxDbGllbnQ+LmZldGNoVXNlcigpYCBhbmQgYDxHdWlsZD4uZmV0Y2hNZW1iZXIoKWAuXG5cdCAqIEBwYXJhbSBndWlsZCAtIEd1aWxkIHRvIGZldGNoIGluLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgdXNlci5cblx0ICogQHBhcmFtIGNhY2hlIC0gV2hldGhlciBvciBub3QgdG8gYWRkIHRvIGNhY2hlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGZldGNoTWVtYmVyKGd1aWxkOiBHdWlsZCwgaWQ6IFNub3dmbGFrZSwgY2FjaGU6IGJvb2xlYW4pOiBQcm9taXNlPEd1aWxkTWVtYmVyPiB7XG5cdFx0Y29uc3QgdXNlciA9IGF3YWl0IHRoaXMuY2xpZW50LnVzZXJzLmZldGNoKGlkLCB7IGNhY2hlIH0pO1xuXHRcdHJldHVybiBndWlsZC5tZW1iZXJzLmZldGNoKHsgdXNlciwgY2FjaGUgfSk7XG5cdH1cblxuXHQvKipcblx0ICogQXJyYXkgb2YgcGVybWlzc2lvbiBuYW1lcy5cblx0ICovXG5cdHB1YmxpYyBwZXJtaXNzaW9uTmFtZXMoKTogc3RyaW5nW10ge1xuXHRcdHJldHVybiBPYmplY3Qua2V5cyhQZXJtaXNzaW9ucy5GTEFHUyk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgYSBjaGFubmVsIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQsIGEgbmFtZSwgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIGNoYW5uZWxzIC0gQ29sbGVjdGlvbiBvZiBjaGFubmVscyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlQ2hhbm5lbChcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0Y2hhbm5lbHM6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbCB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGNoYW5uZWxzLmdldCh0ZXh0IGFzIFNub3dmbGFrZSkgfHxcblx0XHRcdGNoYW5uZWxzLmZpbmQoY2hhbm5lbCA9PiB0aGlzLmNoZWNrQ2hhbm5lbCh0ZXh0LCBjaGFubmVsLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgbXVsdGlwbGUgY2hhbm5lbHMgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhbiBJRCwgYSBuYW1lLCBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gY2hhbm5lbHMgLSBDb2xsZWN0aW9uIG9mIGNoYW5uZWxzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVDaGFubmVscyhcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0Y2hhbm5lbHM6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogQ29sbGVjdGlvbjxTbm93Zmxha2UsIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWw+IHtcblx0XHRyZXR1cm4gY2hhbm5lbHMuZmlsdGVyKGNoYW5uZWwgPT4gdGhpcy5jaGVja0NoYW5uZWwodGV4dCwgY2hhbm5lbCwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgYSBjdXN0b20gZW1vamkgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhIG5hbWUgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIGVtb2ppcyAtIENvbGxlY3Rpb24gb2YgZW1vamlzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVFbW9qaShcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0ZW1vamlzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgRW1vamk+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBFbW9qaSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGVtb2ppcy5nZXQodGV4dCBhcyBTbm93Zmxha2UpIHx8IGVtb2ppcy5maW5kKGVtb2ppID0+IHRoaXMuY2hlY2tFbW9qaSh0ZXh0LCBlbW9qaSwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKSlcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG11bHRpcGxlIGN1c3RvbSBlbW9qaXMgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhIG5hbWUgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIGVtb2ppcyAtIENvbGxlY3Rpb24gb2YgZW1vamlzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVFbW9qaXMoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdGVtb2ppczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIEVtb2ppPixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogQ29sbGVjdGlvbjxTbm93Zmxha2UsIEVtb2ppPiB7XG5cdFx0cmV0dXJuIGVtb2ppcy5maWx0ZXIoZW1vamkgPT4gdGhpcy5jaGVja0Vtb2ppKHRleHQsIGVtb2ppLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIGd1aWxkIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQgb3IgYSBuYW1lLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIGd1aWxkcyAtIENvbGxlY3Rpb24gb2YgZ3VpbGRzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVHdWlsZChcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0Z3VpbGRzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgR3VpbGQ+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBHdWlsZCB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGd1aWxkcy5nZXQodGV4dCBhcyBTbm93Zmxha2UpIHx8IGd1aWxkcy5maW5kKGd1aWxkID0+IHRoaXMuY2hlY2tHdWlsZCh0ZXh0LCBndWlsZCwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKSlcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG11bHRpcGxlIGd1aWxkcyBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElEIG9yIGEgbmFtZS5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSBndWlsZHMgLSBDb2xsZWN0aW9uIG9mIGd1aWxkcyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlR3VpbGRzKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRndWlsZHM6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZD4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZD4ge1xuXHRcdHJldHVybiBndWlsZHMuZmlsdGVyKGd1aWxkID0+IHRoaXMuY2hlY2tHdWlsZCh0ZXh0LCBndWlsZCwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgYSBtZW1iZXIgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhbiBJRCwgYSBuYW1lLCBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gbWVtYmVycyAtIENvbGxlY3Rpb24gb2YgbWVtYmVycyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHJlc29sdmVNZW1iZXIoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdG1lbWJlcnM6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZE1lbWJlcj4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IEd1aWxkTWVtYmVyIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0bWVtYmVycy5nZXQodGV4dCBhcyBTbm93Zmxha2UpIHx8IG1lbWJlcnMuZmluZChtZW1iZXIgPT4gdGhpcy5jaGVja01lbWJlcih0ZXh0LCBtZW1iZXIsIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZCkpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBtdWx0aXBsZSBtZW1iZXJzIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQsIGEgbmFtZSwgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIG1lbWJlcnMgLSBDb2xsZWN0aW9uIG9mIG1lbWJlcnMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRyZXNvbHZlTWVtYmVycyhcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0bWVtYmVyczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIEd1aWxkTWVtYmVyPixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogQ29sbGVjdGlvbjxTbm93Zmxha2UsIEd1aWxkTWVtYmVyPiB7XG5cdFx0cmV0dXJuIG1lbWJlcnMuZmlsdGVyKG1lbWJlciA9PiB0aGlzLmNoZWNrTWVtYmVyKHRleHQsIG1lbWJlciwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgYSBwZXJtaXNzaW9uIG51bWJlciBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBwZXJtaXNzaW9uIG5hbWVzLlxuXHQgKiBAcGFyYW0gbnVtYmVyIC0gVGhlIHBlcm1pc3Npb25zIG51bWJlci5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlUGVybWlzc2lvbk51bWJlcihudW1iZXI6IG51bWJlcik6IHN0cmluZ1tdIHtcblx0XHRjb25zdCByZXNvbHZlZCA9IFtdO1xuXG5cdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoUGVybWlzc2lvbnMuRkxBR1MpKSB7XG5cdFx0XHRpZiAoQmlnSW50KG51bWJlcikgJiBQZXJtaXNzaW9ucy5GTEFHU1trZXldKSByZXNvbHZlZC5wdXNoKGtleSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc29sdmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIGEgcm9sZSBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSByb2xlcyAtIENvbGxlY3Rpb24gb2Ygcm9sZXMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZVJvbGUodGV4dDogc3RyaW5nLCByb2xlczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIFJvbGU+LCBjYXNlU2Vuc2l0aXZlID0gZmFsc2UsIHdob2xlV29yZCA9IGZhbHNlKTogUm9sZSB7XG5cdFx0cmV0dXJuIHJvbGVzLmdldCh0ZXh0IGFzIFNub3dmbGFrZSkgfHwgcm9sZXMuZmluZChyb2xlID0+IHRoaXMuY2hlY2tSb2xlKHRleHQsIHJvbGUsIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG11bHRpcGxlIHJvbGVzIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQsIGEgbmFtZSwgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIHJvbGVzIC0gQ29sbGVjdGlvbiBvZiByb2xlcyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlUm9sZXMoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdHJvbGVzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgUm9sZT4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBSb2xlPiB7XG5cdFx0cmV0dXJuIHJvbGVzLmZpbHRlcihyb2xlID0+IHRoaXMuY2hlY2tSb2xlKHRleHQsIHJvbGUsIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIGEgdXNlciBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSB1c2VycyAtIENvbGxlY3Rpb24gb2YgdXNlcnMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZVVzZXIoXG5cdFx0dGV4dDogU25vd2ZsYWtlIHwgc3RyaW5nLFxuXHRcdHVzZXJzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgVXNlcj4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IFVzZXIge1xuXHRcdHJldHVybiB1c2Vycy5nZXQodGV4dCBhcyBTbm93Zmxha2UpIHx8IHVzZXJzLmZpbmQodXNlciA9PiB0aGlzLmNoZWNrVXNlcih0ZXh0LCB1c2VyLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBtdWx0aXBsZSB1c2VycyBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSB1c2VycyAtIENvbGxlY3Rpb24gb2YgdXNlcnMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZVVzZXJzKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHR1c2VyczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIFVzZXI+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgVXNlcj4ge1xuXHRcdHJldHVybiB1c2Vycy5maWx0ZXIodXNlciA9PiB0aGlzLmNoZWNrVXNlcih0ZXh0LCB1c2VyLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpKTtcblx0fVxufVxuIl19