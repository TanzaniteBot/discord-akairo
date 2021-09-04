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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL0FrYWlyb01lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSwyQ0FZb0I7QUFFcEIseUVBQWlEO0FBSWpEOzs7OztHQUtHO0FBQ0gsTUFBcUIsYUFBYyxTQUFRLGlCQUFJO0lBQzlDLFlBQW1CLE1BQW9CLEVBQUUsV0FBK0IsRUFBRSxPQUFxQztRQUM5RyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFFL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDO1FBRS9DLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUV2QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsV0FBVyxDQUFDLE9BQVEsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztRQUVyRCxJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFFbkMsSUFBSSxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBRXpCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRS9CLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUVyQixJQUFJLE9BQU8sWUFBWSxpQkFBTyxFQUFFO1lBQy9CLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7Z0JBQUUsSUFBSSxDQUFDLE9BQU8sSUFB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QUFLLENBQUMsT0FBMEQ7UUFDdEUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0Q7QUEvSUQsZ0NBK0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJSW50ZXJhY3Rpb25HdWlsZE1lbWJlciwgQVBJTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLWFwaS10eXBlcy92OVwiO1xuaW1wb3J0IHtcblx0QmFzZSxcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRHdWlsZCxcblx0R3VpbGRNZW1iZXIsXG5cdEludGVyYWN0aW9uUmVwbHlPcHRpb25zLFxuXHRNZXNzYWdlLFxuXHRNZXNzYWdlUGF5bG9hZCxcblx0U25vd2ZsYWtlLFxuXHRUZXh0QmFzZWRDaGFubmVscyxcblx0VXNlcixcblx0VXRpbFxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vc3RydWN0L0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IENvbW1hbmQgZnJvbSBcIi4uL3N0cnVjdC9jb21tYW5kcy9Db21tYW5kXCI7XG5pbXBvcnQgQ29tbWFuZFV0aWwgZnJvbSBcIi4uL3N0cnVjdC9jb21tYW5kcy9Db21tYW5kVXRpbFwiO1xuaW1wb3J0IENvbnRleHRNZW51Q29tbWFuZCBmcm9tIFwiLi4vc3RydWN0L2NvbnRleHRNZW51Q29tbWFuZHMvQ29udGV4dE1lbnVDb21tYW5kXCI7XG5cbi8qKlxuICogQSBjb21tYW5kIGludGVyYWN0aW9uIHJlcHJlc2VudGVkIGFzIGEgbWVzc2FnZS5cbiAqIEBwYXJhbSBjbGllbnQgLSBBa2Fpcm9DbGllbnRcbiAqIEBwYXJhbSBpbnRlcmFjdGlvbiAtIENvbW1hbmRJbnRlcmFjdGlvblxuICogQHBhcmFtIGNvbW1hbmQgLSBUaGUgY29tbWFuZCBvZiB0aGUgaW50ZXJhY3Rpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvTWVzc2FnZSBleHRlbmRzIEJhc2Uge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoY2xpZW50OiBBa2Fpcm9DbGllbnQsIGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb24sIGNvbW1hbmQ6IENvbW1hbmQgfCBDb250ZXh0TWVudUNvbW1hbmQpIHtcblx0XHRzdXBlcihjbGllbnQpO1xuXG5cdFx0dGhpcy5hdXRob3IgPSBpbnRlcmFjdGlvbi51c2VyO1xuXG5cdFx0dGhpcy5hcHBsaWNhdGlvbklkID0gaW50ZXJhY3Rpb24uYXBwbGljYXRpb25JZDtcblxuXHRcdHRoaXMuY2hhbm5lbElkID0gaW50ZXJhY3Rpb24uY2hhbm5lbElkO1xuXG5cdFx0dGhpcy5jb250ZW50ID0gYCR7aW50ZXJhY3Rpb24uY29tbWFuZCEudHlwZSA9PT0gXCJDSEFUX0lOUFVUXCIgPyBcIi9cIiA6IFwiXCJ9JHtpbnRlcmFjdGlvbi5jb21tYW5kTmFtZX1gO1xuXG5cdFx0dGhpcy5jcmVhdGVkVGltZXN0YW1wID0gaW50ZXJhY3Rpb24uY3JlYXRlZFRpbWVzdGFtcDtcblxuXHRcdHRoaXMuZ3VpbGRJZCA9IGludGVyYWN0aW9uLmd1aWxkSWQ7XG5cblx0XHR0aGlzLmlkID0gaW50ZXJhY3Rpb24uaWQ7XG5cblx0XHR0aGlzLmludGVyYWN0aW9uID0gaW50ZXJhY3Rpb247XG5cblx0XHR0aGlzLm1lbWJlciA9IGludGVyYWN0aW9uLm1lbWJlcjtcblxuXHRcdHRoaXMucGFydGlhbCA9IGZhbHNlO1xuXG5cdFx0aWYgKGNvbW1hbmQgaW5zdGFuY2VvZiBDb21tYW5kKSB7XG5cdFx0XHRpZiAoaW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9ncm91cFwiXSkgdGhpcy5jb250ZW50ICs9IGBncm91cDogJHtpbnRlcmFjdGlvbi5vcHRpb25zW1wiX2dyb3VwXCJdfWA7XG5cdFx0XHRpZiAoaW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9zdWJjb21tYW5kXCJdKSB0aGlzLmNvbnRlbnQgKz0gYHN1YmNvbW1hbmQ6ICR7aW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9zdWJjb21tYW5kXCJdfWA7XG5cdFx0XHRmb3IgKGNvbnN0IG9wdGlvbiBvZiBpbnRlcmFjdGlvbi5vcHRpb25zW1wiX2hvaXN0ZWRPcHRpb25zXCJdKSB7XG5cdFx0XHRcdGlmIChbXCJTVUJfQ09NTUFORFwiLCBcIlNVQl9DT01NQU5EX0dST1VQXCJdLmluY2x1ZGVzKG9wdGlvbi50eXBlIGFzIGFueSkpIGNvbnRpbnVlO1xuXHRcdFx0XHR0aGlzLmNvbnRlbnQgKz0gYCAke29wdGlvbi5uYW1lfTogJHtpbnRlcmFjdGlvbi5vcHRpb25zLmdldChvcHRpb24ubmFtZSwgZmFsc2UpPy52YWx1ZX1gO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoaW50ZXJhY3Rpb24uY29tbWFuZCEudHlwZSA9PT0gXCJNRVNTQUdFXCIpIHtcblx0XHRcdHRoaXMuY29udGVudCArPSBgIG1lc3NhZ2U6ICR7aW50ZXJhY3Rpb24ub3B0aW9ucy5nZXRNZXNzYWdlKFwibWVzc2FnZVwiKSEuaWR9YDtcblx0XHR9IGVsc2UgaWYgKGludGVyYWN0aW9uLmNvbW1hbmQhLnR5cGUgPT09IFwiVVNFUlwiKSB7XG5cdFx0XHR0aGlzLmNvbnRlbnQgKz0gYCBtZXNzYWdlOiAke2ludGVyYWN0aW9uLm9wdGlvbnMuZ2V0VXNlcihcInVzZXJcIikhLmlkfWA7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhdXRob3Igb2YgdGhlIGludGVyYWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGF1dGhvcjogVXNlcjtcblxuXHQvKipcblx0ICogVGhlIGFwcGxpY2F0aW9uJ3MgaWRcblx0ICovXG5cdHB1YmxpYyBhcHBsaWNhdGlvbklkOiBTbm93Zmxha2U7XG5cblx0LyoqXG5cdCAqIFRoZSBjaGFubmVsIHRoYXQgdGhlIGludGVyYWN0aW9uIHdhcyBzZW50IGluLlxuXHQgKi9cblx0cHVibGljIGdldCBjaGFubmVsKCk6IFRleHRCYXNlZENoYW5uZWxzIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuaW50ZXJhY3Rpb24uY2hhbm5lbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaWQgb2YgdGhlIGNoYW5uZWwgdGhpcyBpbnRlcmFjdGlvbiB3YXMgc2VudCBpblxuXHQgKi9cblx0cHVibGljIGNoYW5uZWxJZDogU25vd2ZsYWtlIHwgbnVsbDtcblxuXHQvKipcblx0ICogVGhlIG1lc3NhZ2UgY29udGVudHMgd2l0aCBhbGwgbWVudGlvbnMgcmVwbGFjZWQgYnkgdGhlIGVxdWl2YWxlbnQgdGV4dC5cblx0ICogSWYgbWVudGlvbnMgY2Fubm90IGJlIHJlc29sdmVkIHRvIGEgbmFtZSwgdGhlIHJlbGV2YW50IG1lbnRpb24gaW4gdGhlIG1lc3NhZ2UgY29udGVudCB3aWxsIG5vdCBiZSBjb252ZXJ0ZWQuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNsZWFuQ29udGVudCgpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5jb250ZW50ICE9IG51bGwgPyBVdGlsLmNsZWFuQ29udGVudCh0aGlzLmNvbnRlbnQsIHRoaXMuY2hhbm5lbCEpIDogbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBuYW1lIGFuZCBhcmd1bWVudHMgcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmcuXG5cdCAqL1xuXHRwdWJsaWMgY29udGVudDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSB0aGUgbWVzc2FnZSB3YXMgc2VudCBhdFxuXHQgKi9cblx0cHVibGljIGdldCBjcmVhdGVkQXQoKTogRGF0ZSB7XG5cdFx0cmV0dXJuIHRoaXMuaW50ZXJhY3Rpb24uY3JlYXRlZEF0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lc3RhbXAgdGhlIGludGVyYWN0aW9uIHdhcyBzZW50IGF0LlxuXHQgKi9cblx0cHVibGljIGNyZWF0ZWRUaW1lc3RhbXA6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGd1aWxkIHRoZSBpbnRlcmFjdGlvbiB3YXMgc2VudCBpbiAoaWYgaW4gYSBndWlsZCBjaGFubmVsKS5cblx0ICovXG5cdHB1YmxpYyBnZXQgZ3VpbGQoKTogR3VpbGQgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcmFjdGlvbi5ndWlsZDtcblx0fVxuXG5cdHB1YmxpYyBndWlsZElkOiBTbm93Zmxha2UgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgSUQgb2YgdGhlIGludGVyYWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGlkOiBTbm93Zmxha2U7XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIGludGVyYWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb247XG5cblx0LyoqXG5cdCAqIFJlcHJlc2VudHMgdGhlIGF1dGhvciBvZiB0aGUgaW50ZXJhY3Rpb24gYXMgYSBndWlsZCBtZW1iZXIuXG5cdCAqIE9ubHkgYXZhaWxhYmxlIGlmIHRoZSBpbnRlcmFjdGlvbiBjb21lcyBmcm9tIGEgZ3VpbGQgd2hlcmUgdGhlIGF1dGhvciBpcyBzdGlsbCBhIG1lbWJlci5cblx0ICovXG5cdHB1YmxpYyBtZW1iZXI6IEd1aWxkTWVtYmVyIHwgQVBJSW50ZXJhY3Rpb25HdWlsZE1lbWJlciB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoaXMgbWVzc2FnZSBpcyBhIHBhcnRpYWxcblx0ICovXG5cdHB1YmxpYyByZWFkb25seSBwYXJ0aWFsOiBmYWxzZTtcblxuXHQvKipcblx0ICogVXRpbGl0aWVzIGZvciBjb21tYW5kIHJlc3BvbmRpbmcuXG5cdCAqL1xuXHRwdWJsaWMgdXRpbCE6IENvbW1hbmRVdGlsO1xuXG5cdC8qKlxuXHQgKiBUaGUgdXJsIHRvIGp1bXAgdG8gdGhpcyBtZXNzYWdlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHVybCgpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcmFjdGlvbi5lcGhlbWVyYWxcblx0XHRcdD8gbnVsbFxuXHRcdFx0OiBgaHR0cHM6Ly9kaXNjb3JkLmNvbS9jaGFubmVscy8ke3RoaXMuZ3VpbGQgPyB0aGlzLmd1aWxkLmlkIDogXCJAbWVcIn0vJHt0aGlzLmNoYW5uZWw/LmlkfS8ke3RoaXMuaWR9YDtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIHRoZSByZXBseSB0byB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBkZWxldGUoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW50ZXJhY3Rpb24uZGVsZXRlUmVwbHkoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXBsaWVzIG9yIGVkaXRzIHRoZSByZXBseSBvZiB0aGUgc2xhc2ggY29tbWFuZC5cblx0ICogQHBhcmFtIG9wdGlvbnMgVGhlIG9wdGlvbnMgdG8gZWRpdCB0aGUgcmVwbHkuXG5cdCAqL1xuXHRwdWJsaWMgcmVwbHkob3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRyZXR1cm4gdGhpcy51dGlsLnJlcGx5KG9wdGlvbnMpO1xuXHR9XG59XG4iXX0=