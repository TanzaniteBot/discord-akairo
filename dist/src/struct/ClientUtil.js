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
            // If anyone knows how to fix this without disabling eslint please do
            // eslint-disable-next-line
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50VXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQ2xpZW50VXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQWNvQjtBQUtwQjs7O0dBR0c7QUFDSCxNQUFxQixVQUFVO0lBQzlCLFlBQW1CLE1BQW9CO1FBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU0sQ0FBZTtJQUVyQzs7OztPQUlHO0lBQ0ksVUFBVSxDQUNoQixJQUErQixFQUMvQixJQUFhO1FBRWIsT0FBTyxJQUFJLDhCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksWUFBWSxDQUNsQixJQUFZLEVBQ1osT0FBdUQsRUFDdkQsYUFBYSxHQUFHLEtBQUssRUFDckIsU0FBUyxHQUFHLEtBQUs7UUFFakIsSUFBSSxPQUFPLENBQUMsRUFBRSxLQUFLLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVyQyxNQUFNLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQztRQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTlCLElBQUksS0FBSyxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRWxELElBQUksR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pELE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUV2RSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2Ys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LEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUNwRCxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLFdBQVcsQ0FDakIsSUFBd0IsRUFDeEIsS0FBa0MsRUFDbEMsYUFBYSxHQUFHLEtBQUssRUFDckIsU0FBUyxHQUFHLEtBQUs7UUFFakIsT0FBTyxDQUNOLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBaUIsQ0FBQztZQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUN4RSxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLFlBQVksQ0FDbEIsSUFBWSxFQUNaLEtBQWtDLEVBQ2xDLGFBQWEsR0FBRyxLQUFLLEVBQ3JCLFNBQVMsR0FBRyxLQUFLO1FBRWpCLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUNwRCxDQUFDO0lBQ0gsQ0FBQztDQUNEO0FBdmhCRCw2QkF1aEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0QmFzZUd1aWxkVm9pY2VDaGFubmVsLFxuXHRCdWZmZXJSZXNvbHZhYmxlLFxuXHRDb2xsZWN0aW9uLFxuXHRFbW9qaSxcblx0R3VpbGQsXG5cdEd1aWxkTWVtYmVyLFxuXHRNZXNzYWdlQXR0YWNobWVudCxcblx0TWVzc2FnZUVtYmVkLFxuXHRNZXNzYWdlRW1iZWRPcHRpb25zLFxuXHRQZXJtaXNzaW9ucyxcblx0Um9sZSxcblx0U25vd2ZsYWtlLFxuXHRVc2VyXG59IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBTdHJlYW0gfSBmcm9tIFwic3RyZWFtXCI7XG5pbXBvcnQgeyBHdWlsZFRleHRCYXNlZENoYW5uZWxzIH0gZnJvbSBcIi4uL3R5cGluZ3MvZ3VpbGRUZXh0QmFzZWRDaGFubmVsc1wiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi9Ba2Fpcm9DbGllbnRcIjtcblxuLyoqXG4gKiBDbGllbnQgdXRpbGl0aWVzIHRvIGhlbHAgd2l0aCBjb21tb24gdGFza3MuXG4gKiBAcGFyYW0ge0FrYWlyb0NsaWVudH0gY2xpZW50IC0gVGhlIGNsaWVudC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xpZW50VXRpbCB7XG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihjbGllbnQ6IEFrYWlyb0NsaWVudCkge1xuXHRcdHRoaXMuY2xpZW50ID0gY2xpZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIHJlYWRvbmx5IGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBNYWtlcyBhIE1lc3NhZ2VBdHRhY2htZW50LlxuXHQgKiBAcGFyYW0gZmlsZSAtIFRoZSBmaWxlLlxuXHQgKiBAcGFyYW0gbmFtZSAtIFRoZSBmaWxlbmFtZS5cblx0ICovXG5cdHB1YmxpYyBhdHRhY2htZW50KFxuXHRcdGZpbGU6IEJ1ZmZlclJlc29sdmFibGUgfCBTdHJlYW0sXG5cdFx0bmFtZT86IHN0cmluZ1xuXHQpOiBNZXNzYWdlQXR0YWNobWVudCB7XG5cdFx0cmV0dXJuIG5ldyBNZXNzYWdlQXR0YWNobWVudChmaWxlLCBuYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBzdHJpbmcgY291bGQgYmUgcmVmZXJyaW5nIHRvIGEgY2hhbm5lbC5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gY2hhbm5lbCAtIENoYW5uZWwgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgY2hlY2tDaGFubmVsKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRjaGFubmVsOiBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsLFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBib29sZWFuIHtcblx0XHRpZiAoY2hhbm5lbC5pZCA9PT0gdGV4dCkgcmV0dXJuIHRydWU7XG5cblx0XHRjb25zdCByZWcgPSAvPCMoXFxkezE3LDE5fSk+Lztcblx0XHRjb25zdCBtYXRjaCA9IHRleHQubWF0Y2gocmVnKTtcblxuXHRcdGlmIChtYXRjaCAmJiBjaGFubmVsLmlkID09PSBtYXRjaFsxXSkgcmV0dXJuIHRydWU7XG5cblx0XHR0ZXh0ID0gY2FzZVNlbnNpdGl2ZSA/IHRleHQgOiB0ZXh0LnRvTG93ZXJDYXNlKCk7XG5cdFx0Y29uc3QgbmFtZSA9IGNhc2VTZW5zaXRpdmUgPyBjaGFubmVsLm5hbWUgOiBjaGFubmVsLm5hbWUudG9Mb3dlckNhc2UoKTtcblxuXHRcdGlmICghd2hvbGVXb3JkKSB7XG5cdFx0XHRyZXR1cm4gbmFtZS5pbmNsdWRlcyh0ZXh0KSB8fCBuYW1lLmluY2x1ZGVzKHRleHQucmVwbGFjZSgvXiMvLCBcIlwiKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5hbWUgPT09IHRleHQgfHwgbmFtZSA9PT0gdGV4dC5yZXBsYWNlKC9eIy8sIFwiXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHN0cmluZyBjb3VsZCBiZSByZWZlcnJpbmcgdG8gYSBlbW9qaS5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gZW1vamkgLSBFbW9qaSB0byBjaGVjay5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBjaGVja2luZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyBjaGVja0Vtb2ppKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRlbW9qaTogRW1vamksXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IGJvb2xlYW4ge1xuXHRcdGlmIChlbW9qaS5pZCA9PT0gdGV4dCkgcmV0dXJuIHRydWU7XG5cblx0XHRjb25zdCByZWcgPSAvPGE/OlthLXpBLVowLTlfXSs6KFxcZHsxNywxOX0pPi87XG5cdFx0Y29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKHJlZyk7XG5cblx0XHRpZiAobWF0Y2ggJiYgZW1vamkuaWQgPT09IG1hdGNoWzFdKSByZXR1cm4gdHJ1ZTtcblxuXHRcdHRleHQgPSBjYXNlU2Vuc2l0aXZlID8gdGV4dCA6IHRleHQudG9Mb3dlckNhc2UoKTtcblx0XHRjb25zdCBuYW1lID0gY2FzZVNlbnNpdGl2ZSA/IGVtb2ppLm5hbWUgOiBlbW9qaS5uYW1lPy50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0aWYgKCF3aG9sZVdvcmQpIHtcblx0XHRcdHJldHVybiBuYW1lLmluY2x1ZGVzKHRleHQpIHx8IG5hbWUuaW5jbHVkZXModGV4dC5yZXBsYWNlKC86LywgXCJcIikpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuYW1lID09PSB0ZXh0IHx8IG5hbWUgPT09IHRleHQucmVwbGFjZSgvOi8sIFwiXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHN0cmluZyBjb3VsZCBiZSByZWZlcnJpbmcgdG8gYSBndWlsZC5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gZ3VpbGQgLSBHdWlsZCB0byBjaGVjay5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBjaGVja2luZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyBjaGVja0d1aWxkKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRndWlsZDogR3VpbGQsXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IGJvb2xlYW4ge1xuXHRcdGlmIChndWlsZC5pZCA9PT0gdGV4dCkgcmV0dXJuIHRydWU7XG5cblx0XHR0ZXh0ID0gY2FzZVNlbnNpdGl2ZSA/IHRleHQgOiB0ZXh0LnRvTG93ZXJDYXNlKCk7XG5cdFx0Y29uc3QgbmFtZSA9IGNhc2VTZW5zaXRpdmUgPyBndWlsZC5uYW1lIDogZ3VpbGQubmFtZS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0aWYgKCF3aG9sZVdvcmQpIHJldHVybiBuYW1lLmluY2x1ZGVzKHRleHQpO1xuXHRcdHJldHVybiBuYW1lID09PSB0ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHN0cmluZyBjb3VsZCBiZSByZWZlcnJpbmcgdG8gYSBtZW1iZXIuXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBjaGVjay5cblx0ICogQHBhcmFtIG1lbWJlciAtIE1lbWJlciB0byBjaGVjay5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBjaGVja2luZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyBjaGVja01lbWJlcihcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0bWVtYmVyOiBHdWlsZE1lbWJlcixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogYm9vbGVhbiB7XG5cdFx0aWYgKG1lbWJlci5pZCA9PT0gdGV4dCkgcmV0dXJuIHRydWU7XG5cblx0XHRjb25zdCByZWcgPSAvPEAhPyhcXGR7MTcsMTl9KT4vO1xuXHRcdGNvbnN0IG1hdGNoID0gdGV4dC5tYXRjaChyZWcpO1xuXG5cdFx0aWYgKG1hdGNoICYmIG1lbWJlci5pZCA9PT0gbWF0Y2hbMV0pIHJldHVybiB0cnVlO1xuXG5cdFx0dGV4dCA9IGNhc2VTZW5zaXRpdmUgPyB0ZXh0IDogdGV4dC50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IHVzZXJuYW1lID0gY2FzZVNlbnNpdGl2ZVxuXHRcdFx0PyBtZW1iZXIudXNlci51c2VybmFtZVxuXHRcdFx0OiBtZW1iZXIudXNlci51c2VybmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IGRpc3BsYXlOYW1lID0gY2FzZVNlbnNpdGl2ZVxuXHRcdFx0PyBtZW1iZXIuZGlzcGxheU5hbWVcblx0XHRcdDogbWVtYmVyLmRpc3BsYXlOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0Y29uc3QgZGlzY3JpbSA9IG1lbWJlci51c2VyLmRpc2NyaW1pbmF0b3I7XG5cblx0XHRpZiAoIXdob2xlV29yZCkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0ZGlzcGxheU5hbWUuaW5jbHVkZXModGV4dCkgfHxcblx0XHRcdFx0dXNlcm5hbWUuaW5jbHVkZXModGV4dCkgfHxcblx0XHRcdFx0KCh1c2VybmFtZS5pbmNsdWRlcyh0ZXh0LnNwbGl0KFwiI1wiKVswXSkgfHxcblx0XHRcdFx0XHRkaXNwbGF5TmFtZS5pbmNsdWRlcyh0ZXh0LnNwbGl0KFwiI1wiKVswXSkpICYmXG5cdFx0XHRcdFx0ZGlzY3JpbS5pbmNsdWRlcyh0ZXh0LnNwbGl0KFwiI1wiKVsxXSkpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHRkaXNwbGF5TmFtZSA9PT0gdGV4dCB8fFxuXHRcdFx0dXNlcm5hbWUgPT09IHRleHQgfHxcblx0XHRcdCgodXNlcm5hbWUgPT09IHRleHQuc3BsaXQoXCIjXCIpWzBdIHx8XG5cdFx0XHRcdGRpc3BsYXlOYW1lID09PSB0ZXh0LnNwbGl0KFwiI1wiKVswXSkgJiZcblx0XHRcdFx0ZGlzY3JpbSA9PT0gdGV4dC5zcGxpdChcIiNcIilbMV0pXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBzdHJpbmcgY291bGQgYmUgcmVmZXJyaW5nIHRvIGEgcm9sZS5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gcm9sZSAtIFJvbGUgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgY2hlY2tpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGNoZWNraW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgY2hlY2tSb2xlKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRyb2xlOiBSb2xlLFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBib29sZWFuIHtcblx0XHRpZiAocm9sZS5pZCA9PT0gdGV4dCkgcmV0dXJuIHRydWU7XG5cblx0XHRjb25zdCByZWcgPSAvPEAmKFxcZHsxNywxOX0pPi87XG5cdFx0Y29uc3QgbWF0Y2ggPSB0ZXh0Lm1hdGNoKHJlZyk7XG5cblx0XHRpZiAobWF0Y2ggJiYgcm9sZS5pZCA9PT0gbWF0Y2hbMV0pIHJldHVybiB0cnVlO1xuXG5cdFx0dGV4dCA9IGNhc2VTZW5zaXRpdmUgPyB0ZXh0IDogdGV4dC50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IG5hbWUgPSBjYXNlU2Vuc2l0aXZlID8gcm9sZS5uYW1lIDogcm9sZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG5cblx0XHRpZiAoIXdob2xlV29yZCkge1xuXHRcdFx0cmV0dXJuIG5hbWUuaW5jbHVkZXModGV4dCkgfHwgbmFtZS5pbmNsdWRlcyh0ZXh0LnJlcGxhY2UoL15ALywgXCJcIikpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuYW1lID09PSB0ZXh0IHx8IG5hbWUgPT09IHRleHQucmVwbGFjZSgvXkAvLCBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIHVzZXIgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhbiBJRCwgYSBuYW1lLCBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gdXNlcnMgLSBDb2xsZWN0aW9uIG9mIHVzZXJzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIGNoZWNrVXNlcihcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0dXNlcjogVXNlcixcblx0XHRjYXNlU2Vuc2l0aXZlID0gZmFsc2UsXG5cdFx0d2hvbGVXb3JkID0gZmFsc2Vcblx0KTogYm9vbGVhbiB7XG5cdFx0aWYgKHVzZXIuaWQgPT09IHRleHQpIHJldHVybiB0cnVlO1xuXG5cdFx0Y29uc3QgcmVnID0gLzxAIT8oXFxkezE3LDE5fSk+Lztcblx0XHRjb25zdCBtYXRjaCA9IHRleHQubWF0Y2gocmVnKTtcblxuXHRcdGlmIChtYXRjaCAmJiB1c2VyLmlkID09PSBtYXRjaFsxXSkgcmV0dXJuIHRydWU7XG5cblx0XHR0ZXh0ID0gY2FzZVNlbnNpdGl2ZSA/IHRleHQgOiB0ZXh0LnRvTG93ZXJDYXNlKCk7XG5cdFx0Y29uc3QgdXNlcm5hbWUgPSBjYXNlU2Vuc2l0aXZlXG5cdFx0XHQ/IHVzZXIudXNlcm5hbWVcblx0XHRcdDogdXNlci51c2VybmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdGNvbnN0IGRpc2NyaW0gPSB1c2VyLmRpc2NyaW1pbmF0b3I7XG5cblx0XHRpZiAoIXdob2xlV29yZCkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0dXNlcm5hbWUuaW5jbHVkZXModGV4dCkgfHxcblx0XHRcdFx0KHVzZXJuYW1lLmluY2x1ZGVzKHRleHQuc3BsaXQoXCIjXCIpWzBdKSAmJlxuXHRcdFx0XHRcdGRpc2NyaW0uaW5jbHVkZXModGV4dC5zcGxpdChcIiNcIilbMV0pKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0dXNlcm5hbWUgPT09IHRleHQgfHxcblx0XHRcdCh1c2VybmFtZSA9PT0gdGV4dC5zcGxpdChcIiNcIilbMF0gJiYgZGlzY3JpbSA9PT0gdGV4dC5zcGxpdChcIiNcIilbMV0pXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNYWtlcyBhIENvbGxlY3Rpb24uXG5cdCAqIEBwYXJhbSBpdGVyYWJsZSAtIEVudHJpZXMgdG8gZmlsbCB3aXRoLlxuXHQgKi9cblx0cHVibGljIGNvbGxlY3Rpb248SywgVj4oXG5cdFx0aXRlcmFibGU/OiBSZWFkb25seUFycmF5PHJlYWRvbmx5IFtLLCBWXT4gfCBudWxsXG5cdCk6IENvbGxlY3Rpb248SywgVj4ge1xuXHRcdHJldHVybiBuZXcgQ29sbGVjdGlvbihpdGVyYWJsZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29tcGFyZXMgdHdvIG1lbWJlciBvYmplY3RzIHByZXNlbmNlcyBhbmQgY2hlY2tzIGlmIHRoZXkgc3RvcHBlZCBvciBzdGFydGVkIGEgc3RyZWFtIG9yIG5vdC5cblx0ICogUmV0dXJucyBgMGAsIGAxYCwgb3IgYDJgIGZvciBubyBjaGFuZ2UsIHN0b3BwZWQsIG9yIHN0YXJ0ZWQuXG5cdCAqIEBwYXJhbSBvbGRNZW1iZXIgLSBUaGUgb2xkIG1lbWJlci5cblx0ICogQHBhcmFtIG5ld01lbWJlciAtIFRoZSBuZXcgbWVtYmVyLlxuXHQgKi9cblx0cHVibGljIGNvbXBhcmVTdHJlYW1pbmcoXG5cdFx0b2xkTWVtYmVyOiBHdWlsZE1lbWJlcixcblx0XHRuZXdNZW1iZXI6IEd1aWxkTWVtYmVyXG5cdCk6IDAgfCAxIHwgMiB7XG5cdFx0Y29uc3QgczEgPSBvbGRNZW1iZXIucHJlc2VuY2U/LmFjdGl2aXRpZXM/LnNvbWUoXG5cdFx0XHRhY3Rpdml0eSA9PiBhY3Rpdml0eT8udHlwZSA9PT0gXCJTVFJFQU1JTkdcIlxuXHRcdCk7XG5cdFx0Y29uc3QgczIgPSBuZXdNZW1iZXIucHJlc2VuY2U/LmFjdGl2aXRpZXM/LnNvbWUoXG5cdFx0XHRhY3Rpdml0eSA9PiBhY3Rpdml0eT8udHlwZSA9PT0gXCJTVFJFQU1JTkdcIlxuXHRcdCk7XG5cdFx0aWYgKHMxID09PSBzMikgcmV0dXJuIDA7XG5cdFx0aWYgKHMxKSByZXR1cm4gMTtcblx0XHRpZiAoczIpIHJldHVybiAyO1xuXHRcdHJldHVybiAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ha2VzIGEgTWVzc2FnZUVtYmVkLlxuXHQgKiBAcGFyYW0gZGF0YSAtIEVtYmVkIGRhdGEuXG5cdCAqL1xuXHRwdWJsaWMgZW1iZWQoZGF0YTogTWVzc2FnZUVtYmVkIHwgTWVzc2FnZUVtYmVkT3B0aW9ucyk6IE1lc3NhZ2VFbWJlZCB7XG5cdFx0cmV0dXJuIG5ldyBNZXNzYWdlRW1iZWQoZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29tYmluYXRpb24gb2YgYDxDbGllbnQ+LmZldGNoVXNlcigpYCBhbmQgYDxHdWlsZD4uZmV0Y2hNZW1iZXIoKWAuXG5cdCAqIEBwYXJhbSBndWlsZCAtIEd1aWxkIHRvIGZldGNoIGluLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgdXNlci5cblx0ICogQHBhcmFtIGNhY2hlIC0gV2hldGhlciBvciBub3QgdG8gYWRkIHRvIGNhY2hlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGZldGNoTWVtYmVyKFxuXHRcdGd1aWxkOiBHdWlsZCxcblx0XHRpZDogU25vd2ZsYWtlLFxuXHRcdGNhY2hlOiBib29sZWFuXG5cdCk6IFByb21pc2U8R3VpbGRNZW1iZXI+IHtcblx0XHRjb25zdCB1c2VyID0gYXdhaXQgdGhpcy5jbGllbnQudXNlcnMuZmV0Y2goaWQsIHsgY2FjaGUgfSk7XG5cdFx0cmV0dXJuIGd1aWxkLm1lbWJlcnMuZmV0Y2goeyB1c2VyLCBjYWNoZSB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcnJheSBvZiBwZXJtaXNzaW9uIG5hbWVzLlxuXHQgKi9cblx0cHVibGljIHBlcm1pc3Npb25OYW1lcygpOiBzdHJpbmdbXSB7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKFBlcm1pc3Npb25zLkZMQUdTKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIGNoYW5uZWwgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhbiBJRCwgYSBuYW1lLCBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gY2hhbm5lbHMgLSBDb2xsZWN0aW9uIG9mIGNoYW5uZWxzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVDaGFubmVsKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRjaGFubmVsczogQ29sbGVjdGlvbjxcblx0XHRcdFNub3dmbGFrZSxcblx0XHRcdEd1aWxkVGV4dEJhc2VkQ2hhbm5lbHMgfCBCYXNlR3VpbGRWb2ljZUNoYW5uZWxcblx0XHQ+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0Y2hhbm5lbHMuZ2V0KHRleHQgYXMgU25vd2ZsYWtlKSB8fFxuXHRcdFx0Y2hhbm5lbHMuZmluZChjaGFubmVsID0+XG5cdFx0XHRcdHRoaXMuY2hlY2tDaGFubmVsKHRleHQsIGNoYW5uZWwsIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZClcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG11bHRpcGxlIGNoYW5uZWxzIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQsIGEgbmFtZSwgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIGNoYW5uZWxzIC0gQ29sbGVjdGlvbiBvZiBjaGFubmVscyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlQ2hhbm5lbHMoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdGNoYW5uZWxzOiBDb2xsZWN0aW9uPFxuXHRcdFx0U25vd2ZsYWtlLFxuXHRcdFx0R3VpbGRUZXh0QmFzZWRDaGFubmVscyB8IEJhc2VHdWlsZFZvaWNlQ2hhbm5lbFxuXHRcdD4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZFRleHRCYXNlZENoYW5uZWxzIHwgQmFzZUd1aWxkVm9pY2VDaGFubmVsPiB7XG5cdFx0cmV0dXJuIGNoYW5uZWxzLmZpbHRlcihjaGFubmVsID0+XG5cdFx0XHR0aGlzLmNoZWNrQ2hhbm5lbCh0ZXh0LCBjaGFubmVsLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIGN1c3RvbSBlbW9qaSBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGEgbmFtZSBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gZW1vamlzIC0gQ29sbGVjdGlvbiBvZiBlbW9qaXMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZUVtb2ppKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRlbW9qaXM6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBFbW9qaT4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IEVtb2ppIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0ZW1vamlzLmdldCh0ZXh0IGFzIFNub3dmbGFrZSkgfHxcblx0XHRcdGVtb2ppcy5maW5kKGVtb2ppID0+XG5cdFx0XHRcdHRoaXMuY2hlY2tFbW9qaSh0ZXh0LCBlbW9qaSwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgbXVsdGlwbGUgY3VzdG9tIGVtb2ppcyBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGEgbmFtZSBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gZW1vamlzIC0gQ29sbGVjdGlvbiBvZiBlbW9qaXMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZUVtb2ppcyhcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0ZW1vamlzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgRW1vamk+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgRW1vamk+IHtcblx0XHRyZXR1cm4gZW1vamlzLmZpbHRlcihlbW9qaSA9PlxuXHRcdFx0dGhpcy5jaGVja0Vtb2ppKHRleHQsIGVtb2ppLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIGd1aWxkIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQgb3IgYSBuYW1lLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIGd1aWxkcyAtIENvbGxlY3Rpb24gb2YgZ3VpbGRzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVHdWlsZChcblx0XHR0ZXh0OiBzdHJpbmcsXG5cdFx0Z3VpbGRzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgR3VpbGQ+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBHdWlsZCB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGd1aWxkcy5nZXQodGV4dCBhcyBTbm93Zmxha2UpIHx8XG5cdFx0XHRndWlsZHMuZmluZChndWlsZCA9PlxuXHRcdFx0XHR0aGlzLmNoZWNrR3VpbGQodGV4dCwgZ3VpbGQsIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZClcblx0XHRcdClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG11bHRpcGxlIGd1aWxkcyBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElEIG9yIGEgbmFtZS5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSBndWlsZHMgLSBDb2xsZWN0aW9uIG9mIGd1aWxkcyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlR3VpbGRzKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRndWlsZHM6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZD4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZD4ge1xuXHRcdHJldHVybiBndWlsZHMuZmlsdGVyKGd1aWxkID0+XG5cdFx0XHR0aGlzLmNoZWNrR3VpbGQodGV4dCwgZ3VpbGQsIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZClcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIGEgbWVtYmVyIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQsIGEgbmFtZSwgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIG1lbWJlcnMgLSBDb2xsZWN0aW9uIG9mIG1lbWJlcnMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRyZXNvbHZlTWVtYmVyKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHRtZW1iZXJzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgR3VpbGRNZW1iZXI+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBHdWlsZE1lbWJlciB7XG5cdFx0cmV0dXJuIChcblx0XHRcdG1lbWJlcnMuZ2V0KHRleHQgYXMgU25vd2ZsYWtlKSB8fFxuXHRcdFx0bWVtYmVycy5maW5kKG1lbWJlciA9PlxuXHRcdFx0XHR0aGlzLmNoZWNrTWVtYmVyKHRleHQsIG1lbWJlciwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZXMgbXVsdGlwbGUgbWVtYmVycyBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSBtZW1iZXJzIC0gQ29sbGVjdGlvbiBvZiBtZW1iZXJzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cmVzb2x2ZU1lbWJlcnMoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdG1lbWJlcnM6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZE1lbWJlcj4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBHdWlsZE1lbWJlcj4ge1xuXHRcdHJldHVybiBtZW1iZXJzLmZpbHRlcihtZW1iZXIgPT5cblx0XHRcdHRoaXMuY2hlY2tNZW1iZXIodGV4dCwgbWVtYmVyLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIHBlcm1pc3Npb24gbnVtYmVyIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIHBlcm1pc3Npb24gbmFtZXMuXG5cdCAqIEBwYXJhbSBudW1iZXIgLSBUaGUgcGVybWlzc2lvbnMgbnVtYmVyLlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVQZXJtaXNzaW9uTnVtYmVyKG51bWJlcjogbnVtYmVyKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IHJlc29sdmVkID0gW107XG5cblx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhQZXJtaXNzaW9ucy5GTEFHUykpIHtcblx0XHRcdC8vIElmIGFueW9uZSBrbm93cyBob3cgdG8gZml4IHRoaXMgd2l0aG91dCBkaXNhYmxpbmcgZXNsaW50IHBsZWFzZSBkb1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5cdFx0XHRpZiAoQmlnSW50KG51bWJlcikgJiBQZXJtaXNzaW9ucy5GTEFHU1trZXldKSByZXNvbHZlZC5wdXNoKGtleSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc29sdmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIGEgcm9sZSBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSByb2xlcyAtIENvbGxlY3Rpb24gb2Ygcm9sZXMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZVJvbGUoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdHJvbGVzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgUm9sZT4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IFJvbGUge1xuXHRcdHJldHVybiAoXG5cdFx0XHRyb2xlcy5nZXQodGV4dCBhcyBTbm93Zmxha2UpIHx8XG5cdFx0XHRyb2xlcy5maW5kKHJvbGUgPT4gdGhpcy5jaGVja1JvbGUodGV4dCwgcm9sZSwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKSlcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIG11bHRpcGxlIHJvbGVzIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYW4gSUQsIGEgbmFtZSwgb3IgYSBtZW50aW9uLlxuXHQgKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gcmVzb2x2ZS5cblx0ICogQHBhcmFtIHJvbGVzIC0gQ29sbGVjdGlvbiBvZiByb2xlcyB0byBmaW5kIGluLlxuXHQgKiBAcGFyYW0gY2FzZVNlbnNpdGl2ZSAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBjYXNlIHNlbnNpdGl2ZS5cblx0ICogQHBhcmFtIHdob2xlV29yZCAtIE1ha2VzIGZpbmRpbmcgYnkgbmFtZSBtYXRjaCBmdWxsIHdvcmQgb25seS5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlUm9sZXMoXG5cdFx0dGV4dDogc3RyaW5nLFxuXHRcdHJvbGVzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgUm9sZT4sXG5cdFx0Y2FzZVNlbnNpdGl2ZSA9IGZhbHNlLFxuXHRcdHdob2xlV29yZCA9IGZhbHNlXG5cdCk6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBSb2xlPiB7XG5cdFx0cmV0dXJuIHJvbGVzLmZpbHRlcihyb2xlID0+XG5cdFx0XHR0aGlzLmNoZWNrUm9sZSh0ZXh0LCByb2xlLCBjYXNlU2Vuc2l0aXZlLCB3aG9sZVdvcmQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIHVzZXIgZnJvbSBhIHN0cmluZywgc3VjaCBhcyBhbiBJRCwgYSBuYW1lLCBvciBhIG1lbnRpb24uXG5cdCAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byByZXNvbHZlLlxuXHQgKiBAcGFyYW0gdXNlcnMgLSBDb2xsZWN0aW9uIG9mIHVzZXJzIHRvIGZpbmQgaW4uXG5cdCAqIEBwYXJhbSBjYXNlU2Vuc2l0aXZlIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKiBAcGFyYW0gd2hvbGVXb3JkIC0gTWFrZXMgZmluZGluZyBieSBuYW1lIG1hdGNoIGZ1bGwgd29yZCBvbmx5LlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVVc2VyKFxuXHRcdHRleHQ6IFNub3dmbGFrZSB8IHN0cmluZyxcblx0XHR1c2VyczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIFVzZXI+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBVc2VyIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0dXNlcnMuZ2V0KHRleHQgYXMgU25vd2ZsYWtlKSB8fFxuXHRcdFx0dXNlcnMuZmluZCh1c2VyID0+IHRoaXMuY2hlY2tVc2VyKHRleHQsIHVzZXIsIGNhc2VTZW5zaXRpdmUsIHdob2xlV29yZCkpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBtdWx0aXBsZSB1c2VycyBmcm9tIGEgc3RyaW5nLCBzdWNoIGFzIGFuIElELCBhIG5hbWUsIG9yIGEgbWVudGlvbi5cblx0ICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIHJlc29sdmUuXG5cdCAqIEBwYXJhbSB1c2VycyAtIENvbGxlY3Rpb24gb2YgdXNlcnMgdG8gZmluZCBpbi5cblx0ICogQHBhcmFtIGNhc2VTZW5zaXRpdmUgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgY2FzZSBzZW5zaXRpdmUuXG5cdCAqIEBwYXJhbSB3aG9sZVdvcmQgLSBNYWtlcyBmaW5kaW5nIGJ5IG5hbWUgbWF0Y2ggZnVsbCB3b3JkIG9ubHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZVVzZXJzKFxuXHRcdHRleHQ6IHN0cmluZyxcblx0XHR1c2VyczogQ29sbGVjdGlvbjxTbm93Zmxha2UsIFVzZXI+LFxuXHRcdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcblx0XHR3aG9sZVdvcmQgPSBmYWxzZVxuXHQpOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgVXNlcj4ge1xuXHRcdHJldHVybiB1c2Vycy5maWx0ZXIodXNlciA9PlxuXHRcdFx0dGhpcy5jaGVja1VzZXIodGV4dCwgdXNlciwgY2FzZVNlbnNpdGl2ZSwgd2hvbGVXb3JkKVxuXHRcdCk7XG5cdH1cbn1cbiJdfQ==