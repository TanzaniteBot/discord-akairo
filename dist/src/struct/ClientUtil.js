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
        const username = caseSensitive
            ? member.user.username
            : member.user.username.toLowerCase();
        const displayName = caseSensitive
            ? member.displayName
            : member.displayName.toLowerCase();
        const discrim = member.user.discriminator;
        if (!wholeWord) {
            return (displayName.includes(text) ||
                username.includes(text) ||
                ((username.includes(text.split("#")[0]) ||
                    displayName.includes(text.split("#")[0])) &&
                    discrim.includes(text.split("#")[1])));
        }
        return (displayName === text ||
            username === text ||
            ((username === text.split("#")[0] ||
                displayName === text.split("#")[0]) &&
                discrim === text.split("#")[1]));
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
        const username = caseSensitive
            ? user.username
            : user.username.toLowerCase();
        const discrim = user.discriminator;
        if (!wholeWord) {
            return (username.includes(text) ||
                (username.includes(text.split("#")[0]) &&
                    discrim.includes(text.split("#")[1])));
        }
        return (username === text ||
            (username === text.split("#")[0] && discrim === text.split("#")[1]));
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
        const s1 = oldMember.presence?.activities?.some(activity => activity?.type === "STREAMING");
        const s2 = newMember.presence?.activities?.some(activity => activity?.type === "STREAMING");
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
        return (emojis.get(text) ||
            emojis.find(emoji => this.checkEmoji(text, emoji, caseSensitive, wholeWord)));
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
        return (guilds.get(text) ||
            guilds.find(guild => this.checkGuild(text, guild, caseSensitive, wholeWord)));
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
        return (members.get(text) ||
            members.find(member => this.checkMember(text, member, caseSensitive, wholeWord)));
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
        return (roles.get(text) ||
            roles.find(role => this.checkRole(text, role, caseSensitive, wholeWord)));
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
        return (users.get(text) ||
            users.find(user => this.checkUser(text, user, caseSensitive, wholeWord)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQ2xpZW50VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQWNvQjtBQUtwQjs7O0dBR0c7QUFDSCxNQUFxQixVQUFVO0lBQzlCLFlBQW1CLE1BQW9CO1FBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU0sQ0FBZTtJQUVyQzs7OztPQUlHO0lBQ0ksVUFBVSxDQUNoQixJQUErQixFQUMvQixJQUFhO1FBRWIsT0FBTyxJQUFJLDhCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksWUFBWSxDQUNsQixJQUFZLEVBQ1osT0FBdUQsRUFDdkQsYUFBYSxHQUFHLEtBQUssRUFDckIsU0FBUyxHQUFHLEtBQUs7UUFFakIsSUFBSSxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVyQyxNQUFNLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQztRQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTlCLElBQUksS0FBSyxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRWxELElBQUksR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pELE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUV2RSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2Ys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Q0FDcEQsQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxXQUFXLENBQ2pCLElBQXdCLEVBQ3hCLEtBQWtDLEVBQ2xDLGFBQWEsR0FBRyxLQUFLLEVBQ3JCLFNBQVMsR0FBRyxLQUFLO1FBRWpCLE9BQU8sQ0FDTixLQUFLLENBQUMsR0FBRyxDQUFDLElBQWlCLENBQUM7WUFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDeEUsQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxZQUFZLENBQ2xCLElBQVksRUFDWixLQUFrQyxFQUNsQyxhQUFhLEdBQUcsS0FBSyxFQUNyQixTQUFTLEdBQUcsS0FBSztRQUVqQixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FDMUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FDcEQsQ0FBQztJQUNILENBQUM7Q0FDRDtBQXJoQkQsNkJBcWhCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEJhc2VHdWlsZFZvaWNlQ2hhbm5lbCxcblx0QnVmZmVyUmVzb2x2YWJsZSxcblx0Q29sbGVjdGlvbixcblx0RW1vamksXG5cdEd1aWxkLFxuXHRHdWlsZE1lbWJlcixcblx0TWVzc2FnZUF0dGFjaG1lbnQsXG5cdE1lc3NhZ2VFbWJlZCxcblx0TWVzc2FnZUVtYmVkT3B0aW9ucyxcblx0UGVybWlzc2lvbnMsXG5cdFJvbGUsXG5cdFNub3dmbGFrZSxcblx0VXNlclxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgU3RyZWFtIH0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHsgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB9IGZyb20gXCIuLi90eXBpbmdzL2d1aWxkVGV4dEJhc2VkQ2hhbm5lbHNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4vQWthaXJvQ2xpZW50XCI7XG5cbi8qKlxuICogQ2xpZW50IHV0aWxpdGllcyB0byBoZWxwIHdpdGggY29tbW9uIHRhc2tzLlxuICogQHBhcmFtIHtBa2Fpcm9DbGllbnR9IGNsaWVudCAtIFRoZSBjbGllbnQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsaWVudFV0aWwge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoY2xpZW50OiBBa2Fpcm9DbGllbnQpIHtcblx0XHR0aGlzLmNsaWVudCA9IGNsaWVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyByZWFkb25seSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogTWFrZXMgYSBNZXNzYWdlQXR0YWNobWVudC5cblx0ICogQHBhcmFtIGZpbGUgLSBUaGUgZmlsZS5cblx0ICogQHBhcmFtIG5hbWUgLSBUaGUgZmlsZW5hbWUuXG5cdCAqL1xuXHRwdWJsaWMgYXR0YWNobWVudChcblx0XHRmaWxlOiBCdWZmZXJSZXNvbHZhYmxlIHwgU3RyZWFtLFxuXHRcdG5hbWU/OiBzdHJpbmdcblx0KTogTWVzc2FnZUF0dGFjaG1lbnQge1xuXHRcdHJldHVybiBuZXcgTWVzc2FnZUF0dGFjaG1lbnQoZmlsZSwgbmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgc3RyaW5nIGNvdWxkIGJlIHJlZmVycmluZyB0byBhIGNoYW5uZWwuXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBjaGVjay5cblx0ICogQHBhcmFtIGNoYW5uZWwgLSBDaGFubmVsIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBjaGVja2luZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIGNoZWNrQ2hhbm5lbChcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0Y2hhbm5lbDogR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbCxcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogYm9vbGVhbiB7XG5cdFx0aWYgKGNoYW5uZWwuaWQgPT09IHRleHQpIHJldHVybiB0cnVlO1xuXG5cdFx0Y29uc3QgcmVnID0gLzwjKFxcZHsxNywxOX0pPi87XG5cdFx0Y29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKHJlZyk7XG5cblx0XHRpZiAobWF0Y2ggJiYgY2hhbm5lbC5pZCA9PT0gbWF0Y2hbMV0pIHJldHVybiB0cnVlO1xuXG5cdFx0dGV4dCA9IGNhc2VTZW5zaXRpdmUgPyB0ZXh0IDogdGV4dC50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IG5hbWUgPSBjYXNlU2Vuc2l0aXZlID8gY2hhbm5lbC5uYW1lIDogY2hhbm5lbC5uYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRpZiAoIXdob2xlV29yZCkge1xuXHRcdFx0cmV0dXJuIG5hbWUuaW5jbHVkZXModGV4dCkgfHwgbmFtZS5pbmNsdWRlcyh0ZXh0LnJlcGxhY2UoL14jLywgXCJcIikpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuYW1lID09PSB0ZXh0IHx8IG5hbWUgPT09IHRleHQucmVwbGFjZSgvXiMvLCBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBzdHJpbmcgY291bGQgYmUgcmVmZXJyaW5nIHRvIGEgZW1vamkuXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBjaGVjay5cblx0ICogQHBhcmFtIGVtb2ppIC0gRW1vamkgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgY2hlY2tFbW9qaShcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0ZW1vamk6IEVtb2ppLFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBib29sZWFuIHtcblx0XHRpZiAoZW1vamkuaWQgPT09IHRleHQpIHJldHVybiB0cnVlO1xuXG5cdFx0Y29uc3QgcmVnID0gLzxhPzpbYS16QS1aMC05X10rOihcXGR7MTcsMTl9KT4vO1xuXHRcdGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaChyZWcpO1xuXG5cdFx0aWYgKG1hdGNoICYmIGVtb2ppLmlkID09PSBtYXRjaFsxXSkgcmV0dXJuIHRydWU7XG5cblx0XHR0ZXh0ID0gY2FzZVNlbnNpdGl2ZSA/IHRleHQgOiB0ZXh0LnRvTG93ZXJDYXNlKCk7XG5cdFx0Y29uc3QgbmFtZSA9IGNhc2VTZW5zaXRpdmUgPyBlbW9qaS5uYW1lIDogZW1vamkubmFtZT8udG9Mb3dlckNhc2UoKTtcblxuXHRcdGlmICghd2hvbGVXb3JkKSB7XG5cdFx0XHRyZXR1cm4gbmFtZS5pbmNsdWRlcyh0ZXh0KSB8fCBuYW1lLmluY2x1ZGVzKHRleHQucmVwbGFjZSgvOi8sIFwiXCIpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmFtZSA9PT0gdGV4dCB8fCBuYW1lID09PSB0ZXh0LnJlcGxhY2UoLzovLCBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBzdHJpbmcgY291bGQgYmUgcmVmZXJyaW5nIHRvIGEgZ3VpbGQuXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBjaGVjay5cblx0ICogQHBhcmFtIGd1aWxkIC0gR3VpbGQgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgY2hlY2tHdWlsZChcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0Z3VpbGQ6IEd1aWxkLFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBib29sZWFuIHtcblx0XHRpZiAoZ3VpbGQuaWQgPT09IHRleHQpIHJldHVybiB0cnVlO1xuXG5cdFx0dGV4dCA9IGNhc2VTZW5zaXRpdmUgPyB0ZXh0IDogdGV4dC50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IG5hbWUgPSBjYXNlU2Vuc2l0aXZlID8gZ3VpbGQubmFtZSA6IGd1aWxkLm5hbWUudG9Mb3dlckNhc2UoKTtcblxuXHRcdGlmICghd2hvbGVXb3JkKSByZXR1cm4gbmFtZS5pbmNsdWRlcyh0ZXh0KTtcblx0XHRyZXR1cm4gbmFtZSA9PT0gdGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBzdHJpbmcgY291bGQgYmUgcmVmZXJyaW5nIHRvIGEgbWVtYmVyLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSBtZW1iZXIgLSBNZW1iZXIgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgY2hlY2tNZW1iZXIoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdG1lbWJlcjogR3VpbGRNZW1iZXIsXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IGJvb2xlYW4ge1xuXHRcdGlmIChtZW1iZXIuaWQgPT09IHRleHQpIHJldHVybiB0cnVlO1xuXG5cdFx0Y29uc3QgcmVnID0gLzxAIT8oXFxkezE3LDE5fSk+Lztcblx0XHRjb25zdCBtYXRjaCA9IHRleHQubWF0Y2gocmVnKTtcblxuXHRcdGlmIChtYXRjaCAmJiBtZW1iZXIuaWQgPT09IG1hdGNoWzFdKSByZXR1cm4gdHJ1ZTtcblxuXHRcdHRleHQgPSBjYXNlU2Vuc2l0aXZlID8gdGV4dCA6IHRleHQudG9Mb3dlckNhc2UoKTtcblx0XHRjb25zdCB1c2VybmFtZSA9IGNhc2VTZW5zaXRpdmVcblx0XHRcdD8gbWVtYmVyLnVzZXIudXNlcm5hbWVcblx0XHRcdDogbWVtYmVyLnVzZXIudXNlcm5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRjb25zdCBkaXNwbGF5TmFtZSA9IGNhc2VTZW5zaXRpdmVcblx0XHRcdD8gbWVtYmVyLmRpc3BsYXlOYW1lXG5cdFx0XHQ6IG1lbWJlci5kaXNwbGF5TmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IGRpc2NyaW0gPSBtZW1iZXIudXNlci5kaXNjcmltaW5hdG9yO1xuXG5cdFx0aWYgKCF3aG9sZVdvcmQpIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGRpc3BsYXlOYW1lLmluY2x1ZGVzKHRleHQpIHx8XG5cdFx0XHRcdHVzZXJuYW1lLmluY2x1ZGVzKHRleHQpIHx8XG5cdFx0XHRcdCgodXNlcm5hbWUuaW5jbHVkZXModGV4dC5zcGxpdChcIiNcIilbMF0pIHx8XG5cdFx0XHRcdFx0ZGlzcGxheU5hbWUuaW5jbHVkZXModGV4dC5zcGxpdChcIiNcIilbMF0pKSAmJlxuXHRcdFx0XHRcdGRpc2NyaW0uaW5jbHVkZXModGV4dC5zcGxpdChcIiNcIilbMV0pKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0ZGlzcGxheU5hbWUgPT09IHRleHQgfHxcblx0XHRcdHVzZXJuYW1lID09PSB0ZXh0IHx8XG5cdFx0XHQoKHVzZXJuYW1lID09PSB0ZXh0LnNwbGl0KFwiI1wiKVswXSB8fFxuXHRcdFx0XHRkaXNwbGF5TmFtZSA9PT0gdGV4dC5zcGxpdChcIiNcIilbMF0pICYmXG5cdFx0XHRcdGRpc2NyaW0gPT09IHRleHQuc3BsaXQoXCIjXCIpWzFdKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgc3RyaW5nIGNvdWxkIGJlIHJlZmVycmluZyB0byBhIHJvbGUuXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBjaGVjay5cblx0ICogQHBhcmFtIHJvbGUgLSBSb2xlIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBjaGVja2luZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIGNoZWNrUm9sZShcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0cm9sZTogUm9sZSxcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogYm9vbGVhbiB7XG5cdFx0aWYgKHJvbGUuaWQgPT09IHRleHQpIHJldHVybiB0cnVlO1xuXG5cdFx0Y29uc3QgcmVnID0gLzxAJihcXGR7MTcsMTl9KT4vO1xuXHRcdGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaChyZWcpO1xuXG5cdFx0aWYgKG1hdGNoICYmIHJvbGUuaWQgPT09IG1hdGNoWzFdKSByZXR1cm4gdHJ1ZTtcblxuXHRcdHRleHQgPSBjYXNlU2Vuc2l0aXZlID8gdGV4dCA6IHRleHQudG9Mb3dlckNhc2UoKTtcblx0XHRjb25zdCBuYW1lID0gY2FzZVNlbnNpdGl2ZSA/IHJvbGUubmFtZSA6IHJvbGUubmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0aWYgKCF3aG9sZVdvcmQpIHtcblx0XHRcdHJldHVybiBuYW1lLmluY2x1ZGVzKHRleHQpIHx8IG5hbWUuaW5jbHVkZXModGV4dC5yZXBsYWNlKC9eQC8sIFwiXCIpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmFtZSA9PT0gdGV4dCB8fCBuYW1lID09PSB0ZXh0LnJlcGxhY2UoL15ALywgXCJcIik7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgYSB1c2VyIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQsIGEgbmFtZSwgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIHVzZXJzIC0gQ29sbGVjdGlvbiBvZiB1c2VycyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyBjaGVja1VzZXIoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdHVzZXI6IFVzZXIsXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IGJvb2xlYW4ge1xuXHRcdGlmICh1c2VyLmlkID09PSB0ZXh0KSByZXR1cm4gdHJ1ZTtcblxuXHRcdGNvbnN0IHJlZyA9IC88QCE/KFxcZHsxNywxOX0pPi87XG5cdFx0Y29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKHJlZyk7XG5cblx0XHRpZiAobWF0Y2ggJiYgdXNlci5pZCA9PT0gbWF0Y2hbMV0pIHJldHVybiB0cnVlO1xuXG5cdFx0dGV4dCA9IGNhc2VTZW5zaXRpdmUgPyB0ZXh0IDogdGV4dC50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IHVzZXJuYW1lID0gY2FzZVNlbnNpdGl2ZVxuXHRcdFx0PyB1c2VyLnVzZXJuYW1lXG5cdFx0XHQ6IHVzZXIudXNlcm5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRjb25zdCBkaXNjcmltID0gdXNlci5kaXNjcmltaW5hdG9yO1xuXG5cdFx0aWYgKCF3aG9sZVdvcmQpIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdHVzZXJuYW1lLmluY2x1ZGVzKHRleHQpIHx8XG5cdFx0XHRcdCh1c2VybmFtZS5pbmNsdWRlcyh0ZXh0LnNwbGl0KFwiI1wiKVswXSkgJiZcblx0XHRcdFx0XHRkaXNjcmltLmluY2x1ZGVzKHRleHQuc3BsaXQoXCIjXCIpWzFdKSlcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdHVzZXJuYW1lID09PSB0ZXh0IHx8XG5cdFx0XHQodXNlcm5hbWUgPT09IHRleHQuc3BsaXQoXCIjXCIpWzBdICYmIGRpc2NyaW0gPT09IHRleHQuc3BsaXQoXCIjXCIpWzFdKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogTWFrZXMgYSBDb2xsZWN0aW9uLlxuXHQgKiBAcGFyYW0gaXRlcmFibGUgLSBFbnRyaWVzIHRvIGZpbGwgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBjb2xsZWN0aW9uPEssIFY+KFxuXHRcdGl0ZXJhYmxlPzogUmVhZG9ubHlBcnJheTxyZWFkb25seSBbSywgVl0+IHwgbnVsbFxuXHQpOiBDb2xsZWN0aW9uPEssIFY+IHtcblx0XHRyZXR1cm4gbmV3IENvbGxlY3Rpb24oaXRlcmFibGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbXBhcmVzIHR3byBtZW1iZXIgb2JqZWN0cyBwcmVzZW5jZXMgYW5kIGNoZWNrcyBpZiB0aGV5IHN0b3BwZWQgb3Igc3RhcnRlZCBhIHN0cmVhbSBvciBub3QuXG5cdCAqIFJldHVybnMgYDBgLCBgMWAsIG9yIGAyYCBmb3Igbm8gY2hhbmdlLCBzdG9wcGVkLCBvciBzdGFydGVkLlxuXHQgKiBAcGFyYW0gb2xkTWVtYmVyIC0gVGhlIG9sZCBtZW1iZXIuXG5cdCAqIEBwYXJhbSBuZXdNZW1iZXIgLSBUaGUgbmV3IG1lbWJlci5cblx0ICovXG5cdHB1YmxpYyBjb21wYXJlU3RyZWFtaW5nKFxuXHRcdG9sZE1lbWJlcjogR3VpbGRNZW1iZXIsXG5cdFx0bmV3TWVtYmVyOiBHdWlsZE1lbWJlclxuXHQpOiAwIHwgMSB8IDIge1xuXHRcdGNvbnN0IHMxID0gb2xkTWVtYmVyLnByZXNlbmNlPy5hY3Rpdml0aWVzPy5zb21lKFxuXHRcdFx0YWN0aXZpdHkgPT4gYWN0aXZpdHk/LnR5cGUgPT09IFwiU1RSRUFNSU5HXCJcblx0XHQpO1xuXHRcdGNvbnN0IHMyID0gbmV3TWVtYmVyLnByZXNlbmNlPy5hY3Rpdml0aWVzPy5zb21lKFxuXHRcdFx0YWN0aXZpdHkgPT4gYWN0aXZpdHk/LnR5cGUgPT09IFwiU1RSRUFNSU5HXCJcblx0XHQpO1xuXHRcdGlmIChzMSA9PT0gczIpIHJldHVybiAwO1xuXHRcdGlmIChzMSkgcmV0dXJuIDE7XG5cdFx0aWYgKHMyKSByZXR1cm4gMjtcblx0XHRyZXR1cm4gMDtcblx0fVxuXG5cdC8qKlxuXHQgKiBNYWtlcyBhIE1lc3NhZ2VFbWJlZC5cblx0ICogQHBhcmFtIGRhdGEgLSBFbWJlZCBkYXRhLlxuXHQgKi9cblx0cHVibGljIGVtYmVkKGRhdGE6IE1lc3NhZ2VFbWJlZCB8IE1lc3NhZ2VFbWJlZE9wdGlvbnMpOiBNZXNzYWdlRW1iZWQge1xuXHRcdHJldHVybiBuZXcgTWVzc2FnZUVtYmVkKGRhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbWJpbmF0aW9uIG9mIGA8Q2xpZW50Pi5mZXRjaFVzZXIoKWAgYW5kIGA8R3VpbGQ+LmZldGNoTWVtYmVyKClgLlxuXHQgKiBAcGFyYW0gZ3VpbGQgLSBHdWlsZCB0byBmZXRjaCBpbi5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIHVzZXIuXG5cdCAqIEBwYXJhbSBjYWNoZSAtIFdoZXRoZXIgb3Igbm90IHRvIGFkZCB0byBjYWNoZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBmZXRjaE1lbWJlcihcblx0XHRndWlsZDogR3VpbGQsXG5cdFx0aWQ6IFNub3dmbGFrZSxcblx0XHRjYWNoZTogYm9vbGVhblxuXHQpOiBQcm9taXNlPEd1aWxkTWVtYmVyPiB7XG5cdFx0Y29uc3QgdXNlciA9IGF3YWl0IHRoaXMuY2xpZW50LnVzZXJzLmZldGNoKGlkLCB7IGNhY2hlIH0pO1xuXHRcdHJldHVybiBndWlsZC5tZW1iZXJzLmZldGNoKHsgdXNlciwgY2FjaGUgfSk7XG5cdH1cblxuXHQvKipcblx0ICogQXJyYXkgb2YgcGVybWlzc2lvbiBuYW1lcy5cblx0ICovXG5cdHB1YmxpYyBwZXJtaXNzaW9uTmFtZXMoKTogc3RyaW5nW10ge1xuXHRcdHJldHVybiBPYmplY3Qua2V5cyhQZXJtaXNzaW9ucy5GTEFHUyk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgYSBjaGFubmVsIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQsIGEgbmFtZSwgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIGNoYW5uZWxzIC0gQ29sbGVjdGlvbiBvZiBjaGFubmVscyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlQ2hhbm5lbChcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0Y2hhbm5lbHM6IENvbGxlY3Rpb248XG5cdFx0XHRTbm93Zmxha2UsXG5cdFx0XHRHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsXG5cdFx0Pixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbCB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGNoYW5uZWxzLmdldCh0ZXh0IGFzIFNub3dmbGFrZSkgfHxcblx0XHRcdGNoYW5uZWxzLmZpbmQoY2hhbm5lbCA9PlxuXHRcdFx0XHR0aGlzLmNoZWNrQ2hhbm5lbCh0ZXh0LCBjaGFubmVsLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBtdWx0aXBsZSBjaGFubmVscyBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSBjaGFubmVscyAtIENvbGxlY3Rpb24gb2YgY2hhbm5lbHMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZUNoYW5uZWxzKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRjaGFubmVsczogQ29sbGVjdGlvbjxcblx0XHRcdFNub3dmbGFrZSxcblx0XHRcdEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWxcblx0XHQ+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgR3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbD4ge1xuXHRcdHJldHVybiBjaGFubmVscy5maWx0ZXIoY2hhbm5lbCA9PlxuXHRcdFx0dGhpcy5jaGVja0NoYW5uZWwodGV4dCwgY2hhbm5lbCwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgYSBjdXN0b20gZW1vamkgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhIG5hbWUgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIGVtb2ppcyAtIENvbGxlY3Rpb24gb2YgZW1vamlzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVFbW9qaShcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0ZW1vamlzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgRW1vamk+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBFbW9qaSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGVtb2ppcy5nZXQodGV4dCBhcyBTbm93Zmxha2UpIHx8XG5cdFx0XHRlbW9qaXMuZmluZChlbW9qaSA9PlxuXHRcdFx0XHR0aGlzLmNoZWNrRW1vamkodGV4dCwgZW1vamksIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZClcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG11bHRpcGxlIGN1c3RvbSBlbW9qaXMgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhIG5hbWUgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIGVtb2ppcyAtIENvbGxlY3Rpb24gb2YgZW1vamlzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVFbW9qaXMoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdGVtb2ppczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIEVtb2ppPixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogQ29sbGVjdGlvbjxTbm93Zmxha2UsIEVtb2ppPiB7XG5cdFx0cmV0dXJuIGVtb2ppcy5maWx0ZXIoZW1vamkgPT5cblx0XHRcdHRoaXMuY2hlY2tFbW9qaSh0ZXh0LCBlbW9qaSwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgYSBndWlsZCBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElEIG9yIGEgbmFtZS5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSBndWlsZHMgLSBDb2xsZWN0aW9uIG9mIGd1aWxkcyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlR3VpbGQoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdGd1aWxkczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIEd1aWxkPixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogR3VpbGQge1xuXHRcdHJldHVybiAoXG5cdFx0XHRndWlsZHMuZ2V0KHRleHQgYXMgU25vd2ZsYWtlKSB8fFxuXHRcdFx0Z3VpbGRzLmZpbmQoZ3VpbGQgPT5cblx0XHRcdFx0dGhpcy5jaGVja0d1aWxkKHRleHQsIGd1aWxkLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBtdWx0aXBsZSBndWlsZHMgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhbiBJRCBvciBhIG5hbWUuXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gZ3VpbGRzIC0gQ29sbGVjdGlvbiBvZiBndWlsZHMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZUd1aWxkcyhcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0Z3VpbGRzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgR3VpbGQ+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgR3VpbGQ+IHtcblx0XHRyZXR1cm4gZ3VpbGRzLmZpbHRlcihndWlsZCA9PlxuXHRcdFx0dGhpcy5jaGVja0d1aWxkKHRleHQsIGd1aWxkLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIG1lbWJlciBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSBtZW1iZXJzIC0gQ29sbGVjdGlvbiBvZiBtZW1iZXJzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cmVzb2x2ZU1lbWJlcihcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0bWVtYmVyczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIEd1aWxkTWVtYmVyPixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogR3VpbGRNZW1iZXIge1xuXHRcdHJldHVybiAoXG5cdFx0XHRtZW1iZXJzLmdldCh0ZXh0IGFzIFNub3dmbGFrZSkgfHxcblx0XHRcdG1lbWJlcnMuZmluZChtZW1iZXIgPT5cblx0XHRcdFx0dGhpcy5jaGVja01lbWJlcih0ZXh0LCBtZW1iZXIsIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZClcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG11bHRpcGxlIG1lbWJlcnMgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhbiBJRCwgYSBuYW1lLCBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gbWVtYmVycyAtIENvbGxlY3Rpb24gb2YgbWVtYmVycyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHJlc29sdmVNZW1iZXJzKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRtZW1iZXJzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgR3VpbGRNZW1iZXI+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgR3VpbGRNZW1iZXI+IHtcblx0XHRyZXR1cm4gbWVtYmVycy5maWx0ZXIobWVtYmVyID0+XG5cdFx0XHR0aGlzLmNoZWNrTWVtYmVyKHRleHQsIG1lbWJlciwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgYSBwZXJtaXNzaW9uIG51bWJlciBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBwZXJtaXNzaW9uIG5hbWVzLlxuXHQgKiBAcGFyYW0gbnVtYmVyIC0gVGhlIHBlcm1pc3Npb25zIG51bWJlci5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlUGVybWlzc2lvbk51bWJlcihudW1iZXI6IG51bWJlcik6IHN0cmluZ1tdIHtcblx0XHRjb25zdCByZXNvbHZlZCA9IFtdO1xuXG5cdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoUGVybWlzc2lvbnMuRkxBR1MpKSB7XG5cdFx0XHRpZiAoQmlnSW50KG51bWJlcikgJiBQZXJtaXNzaW9ucy5GTEFHU1trZXldKSByZXNvbHZlZC5wdXNoKGtleSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc29sdmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIGEgcm9sZSBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSByb2xlcyAtIENvbGxlY3Rpb24gb2Ygcm9sZXMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZVJvbGUoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdHJvbGVzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgUm9sZT4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IFJvbGUge1xuXHRcdHJldHVybiAoXG5cdFx0XHRyb2xlcy5nZXQodGV4dCBhcyBTbm93Zmxha2UpIHx8XG5cdFx0XHRyb2xlcy5maW5kKHJvbGUgPT4gdGhpcy5jaGVja1JvbGUodGV4dCwgcm9sZSwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKSlcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG11bHRpcGxlIHJvbGVzIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQsIGEgbmFtZSwgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIHJvbGVzIC0gQ29sbGVjdGlvbiBvZiByb2xlcyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlUm9sZXMoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdHJvbGVzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgUm9sZT4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBSb2xlPiB7XG5cdFx0cmV0dXJuIHJvbGVzLmZpbHRlcihyb2xlID0+XG5cdFx0XHR0aGlzLmNoZWNrUm9sZSh0ZXh0LCByb2xlLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIHVzZXIgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhbiBJRCwgYSBuYW1lLCBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gdXNlcnMgLSBDb2xsZWN0aW9uIG9mIHVzZXJzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVVc2VyKFxuXHRcdHRleHQ6IFNub3dmbGFrZSB8IHN0cmluZyxcblx0XHR1c2VyczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIFVzZXI+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBVc2VyIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0dXNlcnMuZ2V0KHRleHQgYXMgU25vd2ZsYWtlKSB8fFxuXHRcdFx0dXNlcnMuZmluZCh1c2VyID0+IHRoaXMuY2hlY2tVc2VyKHRleHQsIHVzZXIsIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZCkpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBtdWx0aXBsZSB1c2VycyBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSB1c2VycyAtIENvbGxlY3Rpb24gb2YgdXNlcnMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZVVzZXJzKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHR1c2VyczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIFVzZXI+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgVXNlcj4ge1xuXHRcdHJldHVybiB1c2Vycy5maWx0ZXIodXNlciA9PlxuXHRcdFx0dGhpcy5jaGVja1VzZXIodGV4dCwgdXNlciwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKVxuXHRcdCk7XG5cdH1cbn1cbiJdfQ==