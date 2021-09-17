"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/**
 * A command interaction represented as a message.
 * @param client - AkairoClient
 * @param interaction - CommandInteraction
 * @param command - The command of the interaction
 */
class AkairoMessage extends discord_js_1.Base {
    constructor(client, interaction) {
        super(client);
        this.author = interaction.user;
        this.applicationId = interaction.applicationId;
        this.channelId = interaction.channelId;
        this.content = `${interaction.command.type === "CHAT_INPUT" ? "/" : ""}${interaction.commandName}`;
        this.createdTimestamp = interaction.createdTimestamp;
        this.guildId = interaction.guildId;
        this.id = interaction.id;
        this.interaction = interaction;
        this.member = interaction.member;
        this.partial = false;
        if (interaction.command?.type === "CHAT_INPUT") {
            if (interaction.options["_group"])
                this.content += `group: ${interaction.options["_group"]}`;
            if (interaction.options["_subcommand"])
                this.content += `subcommand: ${interaction.options["_subcommand"]}`;
            for (const option of interaction.options["_hoistedOptions"]) {
                if (["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(option.type))
                    continue;
                this.content += ` ${option.name}: ${interaction.options.get(option.name, false)?.value}`;
            }
        }
        else if (interaction.command?.type === "MESSAGE") {
            this.content += ` message: ${interaction.options.getMessage("message").id}`;
        }
        else if (interaction.command?.type === "USER") {
            this.content += ` message: ${interaction.options.getUser("user").id}`;
        }
    }
    /**
     * The author of the interaction.
     */
    author;
    /**
     * The application's id
     */
    applicationId;
    /**
     * The channel that the interaction was sent in.
     */
    get channel() {
        return this.interaction.channel;
    }
    /**
     * The id of the channel this interaction was sent in
     */
    channelId;
    /**
     * The message contents with all mentions replaced by the equivalent text.
     * If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted.
     */
    get cleanContent() {
        return this.content != null ? discord_js_1.Util.cleanContent(this.content, this.channel) : null;
    }
    /**
     * The command name and arguments represented as a string.
     */
    content;
    /**
     * The time the message was sent at
     */
    get createdAt() {
        return this.interaction.createdAt;
    }
    /**
     * The timestamp the interaction was sent at.
     */
    createdTimestamp;
    /**
     * The guild the interaction was sent in (if in a guild channel).
     */
    get guild() {
        return this.interaction.guild;
    }
    guildId;
    /**
     * The ID of the interaction.
     */
    id;
    /**
     * The command interaction.
     */
    interaction;
    /**
     * Represents the author of the interaction as a guild member.
     * Only available if the interaction comes from a guild where the author is still a member.
     */
    member;
    /**
     * Whether or not this message is a partial
     */
    partial;
    /**
     * Utilities for command responding.
     */
    util;
    /**
     * The url to jump to this message
     */
    get url() {
        return this.interaction.ephemeral
            ? null
            : `https://discord.com/channels/${this.guild ? this.guild.id : "@me"}/${this.channel?.id}/${this.id}`;
    }
    /**
     * Deletes the reply to the command.
     */
    delete() {
        return this.interaction.deleteReply();
    }
    /**
     * Replies or edits the reply of the slash command.
     * @param options The options to edit the reply.
     */
    reply(options) {
        return this.util.reply(options);
    }
}
exports.default = AkairoMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL0FrYWlyb01lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FZb0I7QUFJcEI7Ozs7O0dBS0c7QUFDSCxNQUFxQixhQUFjLFNBQVEsaUJBQUk7SUFDOUMsWUFBbUIsTUFBb0IsRUFBRSxXQUErQjtRQUN2RSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDO1FBQy9DLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsV0FBVyxDQUFDLE9BQVEsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUNyRCxJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDbkMsSUFBSSxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUVyQixJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLFlBQVksRUFBRTtZQUMvQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO2dCQUFFLElBQUksQ0FBQyxPQUFPLElBQUksVUFBVSxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDN0YsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztnQkFBRSxJQUFJLENBQUMsT0FBTyxJQUFJLGVBQWUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1lBQzVHLEtBQUssTUFBTSxNQUFNLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUM1RCxJQUFJLENBQUMsYUFBYSxFQUFFLG1CQUFtQixDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQUUsU0FBUztnQkFDekUsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUN6RjtTQUNEO2FBQU0sSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDbkQsSUFBSSxDQUFDLE9BQU8sSUFBSSxhQUFhLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1NBQzdFO2FBQU0sSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksS0FBSyxNQUFNLEVBQUU7WUFDaEQsSUFBSSxDQUFDLE9BQU8sSUFBSSxhQUFhLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1NBQ3ZFO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFPO0lBRXBCOztPQUVHO0lBQ0ksYUFBYSxDQUFZO0lBRWhDOztPQUVHO0lBQ0gsSUFBVyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksU0FBUyxDQUFtQjtJQUVuQzs7O09BR0c7SUFDSCxJQUFXLFlBQVk7UUFDdEIsT0FBTyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsaUJBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNyRixDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPLENBQVM7SUFFdkI7O09BRUc7SUFDSCxJQUFXLFNBQVM7UUFDbkIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxnQkFBZ0IsQ0FBUztJQUVoQzs7T0FFRztJQUNILElBQVcsS0FBSztRQUNmLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7SUFDL0IsQ0FBQztJQUVNLE9BQU8sQ0FBbUI7SUFFakM7O09BRUc7SUFDSSxFQUFFLENBQVk7SUFFckI7O09BRUc7SUFDSSxXQUFXLENBQXFCO0lBRXZDOzs7T0FHRztJQUNJLE1BQU0sQ0FBaUQ7SUFFOUQ7O09BRUc7SUFDYSxPQUFPLENBQVE7SUFFL0I7O09BRUc7SUFDSSxJQUFJLENBQWU7SUFFMUI7O09BRUc7SUFDSCxJQUFXLEdBQUc7UUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUztZQUNoQyxDQUFDLENBQUMsSUFBSTtZQUNOLENBQUMsQ0FBQyxnQ0FBZ0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDeEcsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTTtRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLE9BQTBEO1FBQ3RFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNEO0FBdElELGdDQXNJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUludGVyYWN0aW9uR3VpbGRNZW1iZXIsIEFQSU1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC1hcGktdHlwZXMvdjlcIjtcbmltcG9ydCB7XG5cdEJhc2UsXG5cdENvbW1hbmRJbnRlcmFjdGlvbixcblx0R3VpbGQsXG5cdEd1aWxkTWVtYmVyLFxuXHRJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyxcblx0TWVzc2FnZSxcblx0TWVzc2FnZVBheWxvYWQsXG5cdFNub3dmbGFrZSxcblx0VGV4dEJhc2VkQ2hhbm5lbHMsXG5cdFVzZXIsXG5cdFV0aWxcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL3N0cnVjdC9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBDb21tYW5kVXRpbCBmcm9tIFwiLi4vc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRVdGlsXCI7XG5cbi8qKlxuICogQSBjb21tYW5kIGludGVyYWN0aW9uIHJlcHJlc2VudGVkIGFzIGEgbWVzc2FnZS5cbiAqIEBwYXJhbSBjbGllbnQgLSBBa2Fpcm9DbGllbnRcbiAqIEBwYXJhbSBpbnRlcmFjdGlvbiAtIENvbW1hbmRJbnRlcmFjdGlvblxuICogQHBhcmFtIGNvbW1hbmQgLSBUaGUgY29tbWFuZCBvZiB0aGUgaW50ZXJhY3Rpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvTWVzc2FnZSBleHRlbmRzIEJhc2Uge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoY2xpZW50OiBBa2Fpcm9DbGllbnQsIGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb24pIHtcblx0XHRzdXBlcihjbGllbnQpO1xuXG5cdFx0dGhpcy5hdXRob3IgPSBpbnRlcmFjdGlvbi51c2VyO1xuXHRcdHRoaXMuYXBwbGljYXRpb25JZCA9IGludGVyYWN0aW9uLmFwcGxpY2F0aW9uSWQ7XG5cdFx0dGhpcy5jaGFubmVsSWQgPSBpbnRlcmFjdGlvbi5jaGFubmVsSWQ7XG5cdFx0dGhpcy5jb250ZW50ID0gYCR7aW50ZXJhY3Rpb24uY29tbWFuZCEudHlwZSA9PT0gXCJDSEFUX0lOUFVUXCIgPyBcIi9cIiA6IFwiXCJ9JHtpbnRlcmFjdGlvbi5jb21tYW5kTmFtZX1gO1xuXHRcdHRoaXMuY3JlYXRlZFRpbWVzdGFtcCA9IGludGVyYWN0aW9uLmNyZWF0ZWRUaW1lc3RhbXA7XG5cdFx0dGhpcy5ndWlsZElkID0gaW50ZXJhY3Rpb24uZ3VpbGRJZDtcblx0XHR0aGlzLmlkID0gaW50ZXJhY3Rpb24uaWQ7XG5cdFx0dGhpcy5pbnRlcmFjdGlvbiA9IGludGVyYWN0aW9uO1xuXHRcdHRoaXMubWVtYmVyID0gaW50ZXJhY3Rpb24ubWVtYmVyO1xuXHRcdHRoaXMucGFydGlhbCA9IGZhbHNlO1xuXG5cdFx0aWYgKGludGVyYWN0aW9uLmNvbW1hbmQ/LnR5cGUgPT09IFwiQ0hBVF9JTlBVVFwiKSB7XG5cdFx0XHRpZiAoaW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9ncm91cFwiXSkgdGhpcy5jb250ZW50ICs9IGBncm91cDogJHtpbnRlcmFjdGlvbi5vcHRpb25zW1wiX2dyb3VwXCJdfWA7XG5cdFx0XHRpZiAoaW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9zdWJjb21tYW5kXCJdKSB0aGlzLmNvbnRlbnQgKz0gYHN1YmNvbW1hbmQ6ICR7aW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9zdWJjb21tYW5kXCJdfWA7XG5cdFx0XHRmb3IgKGNvbnN0IG9wdGlvbiBvZiBpbnRlcmFjdGlvbi5vcHRpb25zW1wiX2hvaXN0ZWRPcHRpb25zXCJdKSB7XG5cdFx0XHRcdGlmIChbXCJTVUJfQ09NTUFORFwiLCBcIlNVQl9DT01NQU5EX0dST1VQXCJdLmluY2x1ZGVzKG9wdGlvbi50eXBlKSkgY29udGludWU7XG5cdFx0XHRcdHRoaXMuY29udGVudCArPSBgICR7b3B0aW9uLm5hbWV9OiAke2ludGVyYWN0aW9uLm9wdGlvbnMuZ2V0KG9wdGlvbi5uYW1lLCBmYWxzZSk/LnZhbHVlfWA7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChpbnRlcmFjdGlvbi5jb21tYW5kPy50eXBlID09PSBcIk1FU1NBR0VcIikge1xuXHRcdFx0dGhpcy5jb250ZW50ICs9IGAgbWVzc2FnZTogJHtpbnRlcmFjdGlvbi5vcHRpb25zLmdldE1lc3NhZ2UoXCJtZXNzYWdlXCIpIS5pZH1gO1xuXHRcdH0gZWxzZSBpZiAoaW50ZXJhY3Rpb24uY29tbWFuZD8udHlwZSA9PT0gXCJVU0VSXCIpIHtcblx0XHRcdHRoaXMuY29udGVudCArPSBgIG1lc3NhZ2U6ICR7aW50ZXJhY3Rpb24ub3B0aW9ucy5nZXRVc2VyKFwidXNlclwiKSEuaWR9YDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGF1dGhvciBvZiB0aGUgaW50ZXJhY3Rpb24uXG5cdCAqL1xuXHRwdWJsaWMgYXV0aG9yOiBVc2VyO1xuXG5cdC8qKlxuXHQgKiBUaGUgYXBwbGljYXRpb24ncyBpZFxuXHQgKi9cblx0cHVibGljIGFwcGxpY2F0aW9uSWQ6IFNub3dmbGFrZTtcblxuXHQvKipcblx0ICogVGhlIGNoYW5uZWwgdGhhdCB0aGUgaW50ZXJhY3Rpb24gd2FzIHNlbnQgaW4uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNoYW5uZWwoKTogVGV4dEJhc2VkQ2hhbm5lbHMgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcmFjdGlvbi5jaGFubmVsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpZCBvZiB0aGUgY2hhbm5lbCB0aGlzIGludGVyYWN0aW9uIHdhcyBzZW50IGluXG5cdCAqL1xuXHRwdWJsaWMgY2hhbm5lbElkOiBTbm93Zmxha2UgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgbWVzc2FnZSBjb250ZW50cyB3aXRoIGFsbCBtZW50aW9ucyByZXBsYWNlZCBieSB0aGUgZXF1aXZhbGVudCB0ZXh0LlxuXHQgKiBJZiBtZW50aW9ucyBjYW5ub3QgYmUgcmVzb2x2ZWQgdG8gYSBuYW1lLCB0aGUgcmVsZXZhbnQgbWVudGlvbiBpbiB0aGUgbWVzc2FnZSBjb250ZW50IHdpbGwgbm90IGJlIGNvbnZlcnRlZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgY2xlYW5Db250ZW50KCk6IHN0cmluZyB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQgIT0gbnVsbCA/IFV0aWwuY2xlYW5Db250ZW50KHRoaXMuY29udGVudCwgdGhpcy5jaGFubmVsISkgOiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIG5hbWUgYW5kIGFyZ3VtZW50cyByZXByZXNlbnRlZCBhcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBjb250ZW50OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lIHRoZSBtZXNzYWdlIHdhcyBzZW50IGF0XG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNyZWF0ZWRBdCgpOiBEYXRlIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcmFjdGlvbi5jcmVhdGVkQXQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHRpbWVzdGFtcCB0aGUgaW50ZXJhY3Rpb24gd2FzIHNlbnQgYXQuXG5cdCAqL1xuXHRwdWJsaWMgY3JlYXRlZFRpbWVzdGFtcDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgZ3VpbGQgdGhlIGludGVyYWN0aW9uIHdhcyBzZW50IGluIChpZiBpbiBhIGd1aWxkIGNoYW5uZWwpLlxuXHQgKi9cblx0cHVibGljIGdldCBndWlsZCgpOiBHdWlsZCB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLmludGVyYWN0aW9uLmd1aWxkO1xuXHR9XG5cblx0cHVibGljIGd1aWxkSWQ6IFNub3dmbGFrZSB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSBJRCBvZiB0aGUgaW50ZXJhY3Rpb24uXG5cdCAqL1xuXHRwdWJsaWMgaWQ6IFNub3dmbGFrZTtcblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgaW50ZXJhY3Rpb24uXG5cdCAqL1xuXHRwdWJsaWMgaW50ZXJhY3Rpb246IENvbW1hbmRJbnRlcmFjdGlvbjtcblxuXHQvKipcblx0ICogUmVwcmVzZW50cyB0aGUgYXV0aG9yIG9mIHRoZSBpbnRlcmFjdGlvbiBhcyBhIGd1aWxkIG1lbWJlci5cblx0ICogT25seSBhdmFpbGFibGUgaWYgdGhlIGludGVyYWN0aW9uIGNvbWVzIGZyb20gYSBndWlsZCB3aGVyZSB0aGUgYXV0aG9yIGlzIHN0aWxsIGEgbWVtYmVyLlxuXHQgKi9cblx0cHVibGljIG1lbWJlcjogR3VpbGRNZW1iZXIgfCBBUElJbnRlcmFjdGlvbkd1aWxkTWVtYmVyIHwgbnVsbDtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhpcyBtZXNzYWdlIGlzIGEgcGFydGlhbFxuXHQgKi9cblx0cHVibGljIHJlYWRvbmx5IHBhcnRpYWw6IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBVdGlsaXRpZXMgZm9yIGNvbW1hbmQgcmVzcG9uZGluZy5cblx0ICovXG5cdHB1YmxpYyB1dGlsITogQ29tbWFuZFV0aWw7XG5cblx0LyoqXG5cdCAqIFRoZSB1cmwgdG8ganVtcCB0byB0aGlzIG1lc3NhZ2Vcblx0ICovXG5cdHB1YmxpYyBnZXQgdXJsKCk6IHN0cmluZyB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLmludGVyYWN0aW9uLmVwaGVtZXJhbFxuXHRcdFx0PyBudWxsXG5cdFx0XHQ6IGBodHRwczovL2Rpc2NvcmQuY29tL2NoYW5uZWxzLyR7dGhpcy5ndWlsZCA/IHRoaXMuZ3VpbGQuaWQgOiBcIkBtZVwifS8ke3RoaXMuY2hhbm5lbD8uaWR9LyR7dGhpcy5pZH1gO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIHJlcGx5IHRvIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGRlbGV0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcmFjdGlvbi5kZWxldGVSZXBseSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxpZXMgb3IgZWRpdHMgdGhlIHJlcGx5IG9mIHRoZSBzbGFzaCBjb21tYW5kLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBUaGUgb3B0aW9ucyB0byBlZGl0IHRoZSByZXBseS5cblx0ICovXG5cdHB1YmxpYyByZXBseShvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zKTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdHJldHVybiB0aGlzLnV0aWwucmVwbHkob3B0aW9ucyk7XG5cdH1cbn1cbiJdfQ==