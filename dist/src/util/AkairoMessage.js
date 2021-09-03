"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../struct/commands/Command"));
/**
 * A command interaction represented as a message.
 * @param client - AkairoClient
 * @param interaction - CommandInteraction
 * @param command - The command of the interaction
 */
class AkairoMessage extends discord_js_1.Base {
    constructor(client, interaction, command) {
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
        if (command instanceof Command_1.default) {
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
        else if (interaction.command.type === "MESSAGE") {
            this.content += ` message: ${interaction.options.getMessage("message").id}`;
        }
        else if (interaction.command.type === "USER") {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL0FrYWlyb01lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSwyQ0FZb0I7QUFFcEIseUVBQWlEO0FBSWpEOzs7OztHQUtHO0FBQ0gsTUFBcUIsYUFBYyxTQUFRLGlCQUFJO0lBQzlDLFlBQW1CLE1BQW9CLEVBQUUsV0FBK0IsRUFBRSxPQUFxQztRQUM5RyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFFL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDO1FBRS9DLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUV2QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbkcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUVyRCxJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFFbkMsSUFBSSxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBRXpCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRS9CLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUVyQixJQUFJLE9BQU8sWUFBWSxpQkFBTyxFQUFFO1lBQy9CLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7Z0JBQUUsSUFBSSxDQUFDLE9BQU8sSUFB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QUFLLENBQUMsT0FBMEQ7UUFDdEUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0Q7QUEvSUQsZ0NBK0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJSW50ZXJhY3Rpb25HdWlsZE1lbWJlciwgQVBJTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLWFwaS10eXBlcy92OVwiO1xuaW1wb3J0IHtcblx0QmFzZSxcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRHdWlsZCxcblx0R3VpbGRNZW1iZXIsXG5cdEludGVyYWN0aW9uUmVwbHlPcHRpb25zLFxuXHRNZXNzYWdlLFxuXHRNZXNzYWdlUGF5bG9hZCxcblx0U25vd2ZsYWtlLFxuXHRUZXh0QmFzZWRDaGFubmVscyxcblx0VXNlcixcblx0VXRpbFxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vc3RydWN0L0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IENvbW1hbmQgZnJvbSBcIi4uL3N0cnVjdC9jb21tYW5kcy9Db21tYW5kXCI7XG5pbXBvcnQgQ29tbWFuZFV0aWwgZnJvbSBcIi4uL3N0cnVjdC9jb21tYW5kcy9Db21tYW5kVXRpbFwiO1xuaW1wb3J0IENvbnRleHRNZW51Q29tbWFuZCBmcm9tIFwiLi4vc3RydWN0L2NvbnRleHRNZW51Q29tbWFuZHMvQ29udGV4dE1lbnVDb21tYW5kXCI7XG5cbi8qKlxuICogQSBjb21tYW5kIGludGVyYWN0aW9uIHJlcHJlc2VudGVkIGFzIGEgbWVzc2FnZS5cbiAqIEBwYXJhbSBjbGllbnQgLSBBa2Fpcm9DbGllbnRcbiAqIEBwYXJhbSBpbnRlcmFjdGlvbiAtIENvbW1hbmRJbnRlcmFjdGlvblxuICogQHBhcmFtIGNvbW1hbmQgLSBUaGUgY29tbWFuZCBvZiB0aGUgaW50ZXJhY3Rpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvTWVzc2FnZSBleHRlbmRzIEJhc2Uge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoY2xpZW50OiBBa2Fpcm9DbGllbnQsIGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb24sIGNvbW1hbmQ6IENvbW1hbmQgfCBDb250ZXh0TWVudUNvbW1hbmQpIHtcblx0XHRzdXBlcihjbGllbnQpO1xuXG5cdFx0dGhpcy5hdXRob3IgPSBpbnRlcmFjdGlvbi51c2VyO1xuXG5cdFx0dGhpcy5hcHBsaWNhdGlvbklkID0gaW50ZXJhY3Rpb24uYXBwbGljYXRpb25JZDtcblxuXHRcdHRoaXMuY2hhbm5lbElkID0gaW50ZXJhY3Rpb24uY2hhbm5lbElkO1xuXG5cdFx0dGhpcy5jb250ZW50ID0gYCR7aW50ZXJhY3Rpb24uY29tbWFuZC50eXBlID09PSBcIkNIQVRfSU5QVVRcIiA/IFwiL1wiIDogXCJcIn0ke2ludGVyYWN0aW9uLmNvbW1hbmROYW1lfWA7XG5cblx0XHR0aGlzLmNyZWF0ZWRUaW1lc3RhbXAgPSBpbnRlcmFjdGlvbi5jcmVhdGVkVGltZXN0YW1wO1xuXG5cdFx0dGhpcy5ndWlsZElkID0gaW50ZXJhY3Rpb24uZ3VpbGRJZDtcblxuXHRcdHRoaXMuaWQgPSBpbnRlcmFjdGlvbi5pZDtcblxuXHRcdHRoaXMuaW50ZXJhY3Rpb24gPSBpbnRlcmFjdGlvbjtcblxuXHRcdHRoaXMubWVtYmVyID0gaW50ZXJhY3Rpb24ubWVtYmVyO1xuXG5cdFx0dGhpcy5wYXJ0aWFsID0gZmFsc2U7XG5cblx0XHRpZiAoY29tbWFuZCBpbnN0YW5jZW9mIENvbW1hbmQpIHtcblx0XHRcdGlmIChpbnRlcmFjdGlvbi5vcHRpb25zW1wiX2dyb3VwXCJdKSB0aGlzLmNvbnRlbnQgKz0gYGdyb3VwOiAke2ludGVyYWN0aW9uLm9wdGlvbnNbXCJfZ3JvdXBcIl19YDtcblx0XHRcdGlmIChpbnRlcmFjdGlvbi5vcHRpb25zW1wiX3N1YmNvbW1hbmRcIl0pIHRoaXMuY29udGVudCArPSBgc3ViY29tbWFuZDogJHtpbnRlcmFjdGlvbi5vcHRpb25zW1wiX3N1YmNvbW1hbmRcIl19YDtcblx0XHRcdGZvciAoY29uc3Qgb3B0aW9uIG9mIGludGVyYWN0aW9uLm9wdGlvbnNbXCJfaG9pc3RlZE9wdGlvbnNcIl0pIHtcblx0XHRcdFx0aWYgKFtcIlNVQl9DT01NQU5EXCIsIFwiU1VCX0NPTU1BTkRfR1JPVVBcIl0uaW5jbHVkZXMob3B0aW9uLnR5cGUgYXMgYW55KSkgY29udGludWU7XG5cdFx0XHRcdHRoaXMuY29udGVudCArPSBgICR7b3B0aW9uLm5hbWV9OiAke2ludGVyYWN0aW9uLm9wdGlvbnMuZ2V0KG9wdGlvbi5uYW1lLCBmYWxzZSk/LnZhbHVlfWA7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChpbnRlcmFjdGlvbi5jb21tYW5kLnR5cGUgPT09IFwiTUVTU0FHRVwiKSB7XG5cdFx0XHR0aGlzLmNvbnRlbnQgKz0gYCBtZXNzYWdlOiAke2ludGVyYWN0aW9uLm9wdGlvbnMuZ2V0TWVzc2FnZShcIm1lc3NhZ2VcIikuaWR9YDtcblx0XHR9IGVsc2UgaWYgKGludGVyYWN0aW9uLmNvbW1hbmQudHlwZSA9PT0gXCJVU0VSXCIpIHtcblx0XHRcdHRoaXMuY29udGVudCArPSBgIG1lc3NhZ2U6ICR7aW50ZXJhY3Rpb24ub3B0aW9ucy5nZXRVc2VyKFwidXNlclwiKS5pZH1gO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYXV0aG9yIG9mIHRoZSBpbnRlcmFjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBhdXRob3I6IFVzZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBhcHBsaWNhdGlvbidzIGlkXG5cdCAqL1xuXHRwdWJsaWMgYXBwbGljYXRpb25JZDogU25vd2ZsYWtlO1xuXG5cdC8qKlxuXHQgKiBUaGUgY2hhbm5lbCB0aGF0IHRoZSBpbnRlcmFjdGlvbiB3YXMgc2VudCBpbi5cblx0ICovXG5cdHB1YmxpYyBnZXQgY2hhbm5lbCgpOiBUZXh0QmFzZWRDaGFubmVscyB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLmludGVyYWN0aW9uLmNoYW5uZWw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGlkIG9mIHRoZSBjaGFubmVsIHRoaXMgaW50ZXJhY3Rpb24gd2FzIHNlbnQgaW5cblx0ICovXG5cdHB1YmxpYyBjaGFubmVsSWQ6IFNub3dmbGFrZSB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSBtZXNzYWdlIGNvbnRlbnRzIHdpdGggYWxsIG1lbnRpb25zIHJlcGxhY2VkIGJ5IHRoZSBlcXVpdmFsZW50IHRleHQuXG5cdCAqIElmIG1lbnRpb25zIGNhbm5vdCBiZSByZXNvbHZlZCB0byBhIG5hbWUsIHRoZSByZWxldmFudCBtZW50aW9uIGluIHRoZSBtZXNzYWdlIGNvbnRlbnQgd2lsbCBub3QgYmUgY29udmVydGVkLlxuXHQgKi9cblx0cHVibGljIGdldCBjbGVhbkNvbnRlbnQoKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuY29udGVudCAhPSBudWxsID8gVXRpbC5jbGVhbkNvbnRlbnQodGhpcy5jb250ZW50LCB0aGlzLmNoYW5uZWwpIDogbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBuYW1lIGFuZCBhcmd1bWVudHMgcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmcuXG5cdCAqL1xuXHRwdWJsaWMgY29udGVudDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB0aGUgbWVzc2FnZSB3YXMgc2VudCBhdFxuXHQgKi9cblx0cHVibGljIGdldCBjcmVhdGVkQXQoKTogRGF0ZSB7XG5cdFx0cmV0dXJuIHRoaXMuaW50ZXJhY3Rpb24uY3JlYXRlZEF0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lc3RhbXAgdGhlIGludGVyYWN0aW9uIHdhcyBzZW50IGF0LlxuXHQgKi9cblx0cHVibGljIGNyZWF0ZWRUaW1lc3RhbXA6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGd1aWxkIHRoZSBpbnRlcmFjdGlvbiB3YXMgc2VudCBpbiAoaWYgaW4gYSBndWlsZCBjaGFubmVsKS5cblx0ICovXG5cdHB1YmxpYyBnZXQgZ3VpbGQoKTogR3VpbGQgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcmFjdGlvbi5ndWlsZDtcblx0fVxuXG5cdHB1YmxpYyBndWlsZElkOiBTbm93Zmxha2UgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgSUQgb2YgdGhlIGludGVyYWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGlkOiBTbm93Zmxha2U7XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIGludGVyYWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb247XG5cblx0LyoqXG5cdCAqIFJlcHJlc2VudHMgdGhlIGF1dGhvciBvZiB0aGUgaW50ZXJhY3Rpb24gYXMgYSBndWlsZCBtZW1iZXIuXG5cdCAqIE9ubHkgYXZhaWxhYmxlIGlmIHRoZSBpbnRlcmFjdGlvbiBjb21lcyBmcm9tIGEgZ3VpbGQgd2hlcmUgdGhlIGF1dGhvciBpcyBzdGlsbCBhIG1lbWJlci5cblx0ICovXG5cdHB1YmxpYyBtZW1iZXI6IEd1aWxkTWVtYmVyIHwgQVBJSW50ZXJhY3Rpb25HdWlsZE1lbWJlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhpcyBtZXNzYWdlIGlzIGEgcGFydGlhbFxuXHQgKi9cblx0cHVibGljIHJlYWRvbmx5IHBhcnRpYWw6IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBVdGlsaXRpZXMgZm9yIGNvbW1hbmQgcmVzcG9uZGluZy5cblx0ICovXG5cdHB1YmxpYyB1dGlsOiBDb21tYW5kVXRpbDtcblxuXHQvKipcblx0ICogVGhlIHVybCB0byBqdW1wIHRvIHRoaXMgbWVzc2FnZVxuXHQgKi9cblx0cHVibGljIGdldCB1cmwoKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuaW50ZXJhY3Rpb24uZXBoZW1lcmFsXG5cdFx0XHQ/IG51bGxcblx0XHRcdDogYGh0dHBzOi8vZGlzY29yZC5jb20vY2hhbm5lbHMvJHt0aGlzLmd1aWxkID8gdGhpcy5ndWlsZC5pZCA6IFwiQG1lXCJ9LyR7dGhpcy5jaGFubmVsPy5pZH0vJHt0aGlzLmlkfWA7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyB0aGUgcmVwbHkgdG8gdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVsZXRlKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLmludGVyYWN0aW9uLmRlbGV0ZVJlcGx5KCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGllcyBvciBlZGl0cyB0aGUgcmVwbHkgb2YgdGhlIHNsYXNoIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zIHRvIGVkaXQgdGhlIHJlcGx5LlxuXHQgKi9cblx0cHVibGljIHJlcGx5KG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0cmV0dXJuIHRoaXMudXRpbC5yZXBseShvcHRpb25zKTtcblx0fVxufVxuIl19