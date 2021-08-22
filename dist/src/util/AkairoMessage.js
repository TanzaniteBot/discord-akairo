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
        this.content = `${interaction.command.type === "CHAT_INPUT" ? "/" : ""}${interaction.commandName}`;
        this.createdTimestamp = interaction.createdTimestamp;
        this.id = interaction.id;
        this.interaction = interaction;
        this.member = interaction.member;
        this.partial = false;
        if (command instanceof Command_1.default) {
            for (const option of command.slashOptions) {
                this.content += ` ${option.name}: ${interaction.options.get(option.name, option.required || false)?.value}`;
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
     * The channel that the interaction was sent in.
     */
    get channel() {
        return this.interaction.channel;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL0FrYWlyb01lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSwyQ0FZb0I7QUFFcEIseUVBQWlEO0FBSWpEOzs7OztHQUtHO0FBQ0gsTUFBcUIsYUFBYyxTQUFRLGlCQUFJO0lBQzlDLFlBQW1CLE1BQW9CLEVBQUUsV0FBK0IsRUFBRSxPQUFxQztRQUM5RyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFFL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRW5HLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUM7UUFFckQsSUFBSSxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDO1FBRXpCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRS9CLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUVqQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUVyQixJQUFJLE9BQU8sWUFBWSxpQkFBTyxFQUFFO1lBQy9CLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtnQkFDMUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQzVHO1NBQ0Q7YUFBTSxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNsRCxJQUFJLENBQUMsT0FBTyxJQUFJLGFBQWEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7U0FDNUU7YUFBTSxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtZQUMvQyxJQUFJLENBQUMsT0FBTyxJQUFJLGFBQWEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7U0FDdEU7SUFDRixDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNLENBQU87SUFFcEI7O09BRUc7SUFDSCxJQUFXLE9BQU87UUFDakIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztJQUNqQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBVyxZQUFZO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDcEYsQ0FBQztJQUVEOztPQUVHO0lBQ0ksT0FBTyxDQUFTO0lBRXZCOztPQUVHO0lBQ0gsSUFBVyxTQUFTO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7SUFDbkMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksZ0JBQWdCLENBQVM7SUFFaEM7O09BRUc7SUFDSCxJQUFXLEtBQUs7UUFDZixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7T0FFRztJQUNJLEVBQUUsQ0FBWTtJQUVyQjs7T0FFRztJQUNJLFdBQVcsQ0FBcUI7SUFFdkM7OztPQUdHO0lBQ0ksTUFBTSxDQUEwQztJQUV2RDs7T0FFRztJQUNhLE9BQU8sQ0FBUTtJQUUvQjs7T0FFRztJQUNJLElBQUksQ0FBYztJQUV6Qjs7T0FFRztJQUNILElBQVcsR0FBRztRQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTO1lBQ2hDLENBQUMsQ0FBQyxJQUFJO1lBQ04sQ0FBQyxDQUFDLGdDQUFnQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUN4RyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNO1FBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxLQUFLLENBQUMsT0FBMEQ7UUFDdEUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0Q7QUExSEQsZ0NBMEhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJSW50ZXJhY3Rpb25HdWlsZE1lbWJlciwgQVBJTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLWFwaS10eXBlcy92OVwiO1xuaW1wb3J0IHtcblx0QmFzZSxcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRHdWlsZCxcblx0R3VpbGRNZW1iZXIsXG5cdEludGVyYWN0aW9uUmVwbHlPcHRpb25zLFxuXHRNZXNzYWdlLFxuXHRNZXNzYWdlUGF5bG9hZCxcblx0U25vd2ZsYWtlLFxuXHRUZXh0QmFzZWRDaGFubmVscyxcblx0VXNlcixcblx0VXRpbFxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vc3RydWN0L0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IENvbW1hbmQgZnJvbSBcIi4uL3N0cnVjdC9jb21tYW5kcy9Db21tYW5kXCI7XG5pbXBvcnQgQ29tbWFuZFV0aWwgZnJvbSBcIi4uL3N0cnVjdC9jb21tYW5kcy9Db21tYW5kVXRpbFwiO1xuaW1wb3J0IENvbnRleHRNZW51Q29tbWFuZCBmcm9tIFwiLi4vc3RydWN0L2NvbnRleHRNZW51Q29tbWFuZHMvQ29udGV4dE1lbnVDb21tYW5kXCI7XG5cbi8qKlxuICogQSBjb21tYW5kIGludGVyYWN0aW9uIHJlcHJlc2VudGVkIGFzIGEgbWVzc2FnZS5cbiAqIEBwYXJhbSBjbGllbnQgLSBBa2Fpcm9DbGllbnRcbiAqIEBwYXJhbSBpbnRlcmFjdGlvbiAtIENvbW1hbmRJbnRlcmFjdGlvblxuICogQHBhcmFtIGNvbW1hbmQgLSBUaGUgY29tbWFuZCBvZiB0aGUgaW50ZXJhY3Rpb25cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvTWVzc2FnZSBleHRlbmRzIEJhc2Uge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoY2xpZW50OiBBa2Fpcm9DbGllbnQsIGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb24sIGNvbW1hbmQ6IENvbW1hbmQgfCBDb250ZXh0TWVudUNvbW1hbmQpIHtcblx0XHRzdXBlcihjbGllbnQpO1xuXG5cdFx0dGhpcy5hdXRob3IgPSBpbnRlcmFjdGlvbi51c2VyO1xuXG5cdFx0dGhpcy5jb250ZW50ID0gYCR7aW50ZXJhY3Rpb24uY29tbWFuZC50eXBlID09PSBcIkNIQVRfSU5QVVRcIiA/IFwiL1wiIDogXCJcIn0ke2ludGVyYWN0aW9uLmNvbW1hbmROYW1lfWA7XG5cblx0XHR0aGlzLmNyZWF0ZWRUaW1lc3RhbXAgPSBpbnRlcmFjdGlvbi5jcmVhdGVkVGltZXN0YW1wO1xuXG5cdFx0dGhpcy5pZCA9IGludGVyYWN0aW9uLmlkO1xuXG5cdFx0dGhpcy5pbnRlcmFjdGlvbiA9IGludGVyYWN0aW9uO1xuXG5cdFx0dGhpcy5tZW1iZXIgPSBpbnRlcmFjdGlvbi5tZW1iZXI7XG5cblx0XHR0aGlzLnBhcnRpYWwgPSBmYWxzZTtcblxuXHRcdGlmIChjb21tYW5kIGluc3RhbmNlb2YgQ29tbWFuZCkge1xuXHRcdFx0Zm9yIChjb25zdCBvcHRpb24gb2YgY29tbWFuZC5zbGFzaE9wdGlvbnMpIHtcblx0XHRcdFx0dGhpcy5jb250ZW50ICs9IGAgJHtvcHRpb24ubmFtZX06ICR7aW50ZXJhY3Rpb24ub3B0aW9ucy5nZXQob3B0aW9uLm5hbWUsIG9wdGlvbi5yZXF1aXJlZCB8fCBmYWxzZSk/LnZhbHVlfWA7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChpbnRlcmFjdGlvbi5jb21tYW5kLnR5cGUgPT09IFwiTUVTU0FHRVwiKSB7XG5cdFx0XHR0aGlzLmNvbnRlbnQgKz0gYCBtZXNzYWdlOiAke2ludGVyYWN0aW9uLm9wdGlvbnMuZ2V0TWVzc2FnZShcIm1lc3NhZ2VcIikuaWR9YDtcblx0XHR9IGVsc2UgaWYgKGludGVyYWN0aW9uLmNvbW1hbmQudHlwZSA9PT0gXCJVU0VSXCIpIHtcblx0XHRcdHRoaXMuY29udGVudCArPSBgIG1lc3NhZ2U6ICR7aW50ZXJhY3Rpb24ub3B0aW9ucy5nZXRVc2VyKFwidXNlclwiKS5pZH1gO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYXV0aG9yIG9mIHRoZSBpbnRlcmFjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBhdXRob3I6IFVzZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBjaGFubmVsIHRoYXQgdGhlIGludGVyYWN0aW9uIHdhcyBzZW50IGluLlxuXHQgKi9cblx0cHVibGljIGdldCBjaGFubmVsKCk6IFRleHRCYXNlZENoYW5uZWxzIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuaW50ZXJhY3Rpb24uY2hhbm5lbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWVzc2FnZSBjb250ZW50cyB3aXRoIGFsbCBtZW50aW9ucyByZXBsYWNlZCBieSB0aGUgZXF1aXZhbGVudCB0ZXh0LlxuXHQgKiBJZiBtZW50aW9ucyBjYW5ub3QgYmUgcmVzb2x2ZWQgdG8gYSBuYW1lLCB0aGUgcmVsZXZhbnQgbWVudGlvbiBpbiB0aGUgbWVzc2FnZSBjb250ZW50IHdpbGwgbm90IGJlIGNvbnZlcnRlZC5cblx0ICovXG5cdHB1YmxpYyBnZXQgY2xlYW5Db250ZW50KCk6IHN0cmluZyB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQgIT0gbnVsbCA/IFV0aWwuY2xlYW5Db250ZW50KHRoaXMuY29udGVudCwgdGhpcy5jaGFubmVsKSA6IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgbmFtZSBhbmQgYXJndW1lbnRzIHJlcHJlc2VudGVkIGFzIGEgc3RyaW5nLlxuXHQgKi9cblx0cHVibGljIGNvbnRlbnQ6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIHRpbWUgdGhlIG1lc3NhZ2Ugd2FzIHNlbnQgYXRcblx0ICovXG5cdHB1YmxpYyBnZXQgY3JlYXRlZEF0KCk6IERhdGUge1xuXHRcdHJldHVybiB0aGlzLmludGVyYWN0aW9uLmNyZWF0ZWRBdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdGltZXN0YW1wIHRoZSBpbnRlcmFjdGlvbiB3YXMgc2VudCBhdC5cblx0ICovXG5cdHB1YmxpYyBjcmVhdGVkVGltZXN0YW1wOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBndWlsZCB0aGUgaW50ZXJhY3Rpb24gd2FzIHNlbnQgaW4gKGlmIGluIGEgZ3VpbGQgY2hhbm5lbCkuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGd1aWxkKCk6IEd1aWxkIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuaW50ZXJhY3Rpb24uZ3VpbGQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIElEIG9mIHRoZSBpbnRlcmFjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBpZDogU25vd2ZsYWtlO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBpbnRlcmFjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBpbnRlcmFjdGlvbjogQ29tbWFuZEludGVyYWN0aW9uO1xuXG5cdC8qKlxuXHQgKiBSZXByZXNlbnRzIHRoZSBhdXRob3Igb2YgdGhlIGludGVyYWN0aW9uIGFzIGEgZ3VpbGQgbWVtYmVyLlxuXHQgKiBPbmx5IGF2YWlsYWJsZSBpZiB0aGUgaW50ZXJhY3Rpb24gY29tZXMgZnJvbSBhIGd1aWxkIHdoZXJlIHRoZSBhdXRob3IgaXMgc3RpbGwgYSBtZW1iZXIuXG5cdCAqL1xuXHRwdWJsaWMgbWVtYmVyOiBHdWlsZE1lbWJlciB8IEFQSUludGVyYWN0aW9uR3VpbGRNZW1iZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoaXMgbWVzc2FnZSBpcyBhIHBhcnRpYWxcblx0ICovXG5cdHB1YmxpYyByZWFkb25seSBwYXJ0aWFsOiBmYWxzZTtcblxuXHQvKipcblx0ICogVXRpbGl0aWVzIGZvciBjb21tYW5kIHJlc3BvbmRpbmcuXG5cdCAqL1xuXHRwdWJsaWMgdXRpbDogQ29tbWFuZFV0aWw7XG5cblx0LyoqXG5cdCAqIFRoZSB1cmwgdG8ganVtcCB0byB0aGlzIG1lc3NhZ2Vcblx0ICovXG5cdHB1YmxpYyBnZXQgdXJsKCk6IHN0cmluZyB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLmludGVyYWN0aW9uLmVwaGVtZXJhbFxuXHRcdFx0PyBudWxsXG5cdFx0XHQ6IGBodHRwczovL2Rpc2NvcmQuY29tL2NoYW5uZWxzLyR7dGhpcy5ndWlsZCA/IHRoaXMuZ3VpbGQuaWQgOiBcIkBtZVwifS8ke3RoaXMuY2hhbm5lbD8uaWR9LyR7dGhpcy5pZH1gO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIHJlcGx5IHRvIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGRlbGV0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcmFjdGlvbi5kZWxldGVSZXBseSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxpZXMgb3IgZWRpdHMgdGhlIHJlcGx5IG9mIHRoZSBzbGFzaCBjb21tYW5kLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBUaGUgb3B0aW9ucyB0byBlZGl0IHRoZSByZXBseS5cblx0ICovXG5cdHB1YmxpYyByZXBseShvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zKTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdHJldHVybiB0aGlzLnV0aWwucmVwbHkob3B0aW9ucyk7XG5cdH1cbn1cbiJdfQ==