"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A command interaction represented as a message.
 * @param client - AkairoClient
 * @param interaction - CommandInteraction
 * @param additionalInfo - Other information
 */
class AkairoMessage {
    constructor(client, interaction, command) {
        this.author = interaction.user;
        this.channel = interaction.channel;
        this.client = client;
        this.content = `/${interaction.commandName}`;
        this.createdAt = interaction.createdAt;
        this.createdTimestamp = interaction.createdTimestamp;
        this.guild = interaction.guild;
        this.id = interaction.id;
        this.interaction = interaction;
        this.member = interaction.member;
        for (const option of command.slashOptions) {
            this.content += ` ${option.name}: ${interaction.options.get(option.name, option.required || false)?.value}`;
        }
    }
    /**
     * The author of the interaction.
     */
    author;
    /**
     * The channel that the interaction was sent in.
     */
    channel;
    /**
     * The Akairo client.
     */
    client;
    /**
     * The command name and arguments represented as a string.
     */
    content;
    /**
     * The time the interaction was sent.
     */
    createdAt;
    /**
     * The timestamp the interaction was sent at.
     */
    createdTimestamp;
    /**
     * The guild the interaction was sent in (if in a guild channel).
     */
    guild;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL0FrYWlyb01lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFvQkE7Ozs7O0dBS0c7QUFDSCxNQUFxQixhQUFhO0lBQ2pDLFlBQ0MsTUFBb0IsRUFDcEIsV0FBK0IsRUFDL0IsT0FBZ0I7UUFFaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBRS9CLElBQUksQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUVuQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTdDLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUV2QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFDO1FBRXJELElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUUvQixJQUFJLENBQUMsRUFBRSxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO1FBRWpDLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtZQUMxQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksS0FDOUIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQ2pFLEVBQUUsQ0FBQztTQUNIO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFPO0lBRXBCOztPQUVHO0lBQ0ksT0FBTyxDQUtNO0lBRXBCOztPQUVHO0lBQ0ksTUFBTSxDQUFlO0lBRTVCOztPQUVHO0lBQ0ksT0FBTyxDQUFTO0lBRXZCOztPQUVHO0lBQ0ksU0FBUyxDQUFPO0lBRXZCOztPQUVHO0lBQ0ksZ0JBQWdCLENBQVM7SUFFaEM7O09BRUc7SUFDSSxLQUFLLENBQWdCO0lBRTVCOztPQUVHO0lBQ0ksRUFBRSxDQUFZO0lBRXJCOztPQUVHO0lBQ0ksV0FBVyxDQUFxQjtJQUV2Qzs7O09BR0c7SUFDSSxNQUFNLENBQTBDO0lBRXZEOztPQUVHO0lBQ0ksSUFBSSxDQUFjO0lBRXpCOztPQUVHO0lBQ0gsSUFBVyxHQUFHO1FBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVM7WUFDaEMsQ0FBQyxDQUFDLElBQUk7WUFDTixDQUFDLENBQUMsZ0NBQWdDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQ2xFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFDZCxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxNQUFNO1FBQ1osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxLQUFLLENBQ1gsT0FBMEQ7UUFFMUQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0Q7QUF6SEQsZ0NBeUhDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRNZXNzYWdlUGF5bG9hZCxcblx0SW50ZXJhY3Rpb25SZXBseU9wdGlvbnMsXG5cdE1lc3NhZ2UsXG5cdERNQ2hhbm5lbCxcblx0R3VpbGQsXG5cdEd1aWxkTWVtYmVyLFxuXHROZXdzQ2hhbm5lbCxcblx0UGFydGlhbERNQ2hhbm5lbCxcblx0U25vd2ZsYWtlLFxuXHRUZXh0Q2hhbm5lbCxcblx0VGhyZWFkQ2hhbm5lbCxcblx0VXNlclxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vc3RydWN0L0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IENvbW1hbmQgZnJvbSBcIi4uL3N0cnVjdC9jb21tYW5kcy9Db21tYW5kXCI7XG5pbXBvcnQgeyBBUElJbnRlcmFjdGlvbkd1aWxkTWVtYmVyLCBBUElNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQtYXBpLXR5cGVzL3Y5XCI7XG5pbXBvcnQgQ29tbWFuZFV0aWwgZnJvbSBcIi4uL3N0cnVjdC9jb21tYW5kcy9Db21tYW5kVXRpbFwiO1xuXG4vKipcbiAqIEEgY29tbWFuZCBpbnRlcmFjdGlvbiByZXByZXNlbnRlZCBhcyBhIG1lc3NhZ2UuXG4gKiBAcGFyYW0gY2xpZW50IC0gQWthaXJvQ2xpZW50XG4gKiBAcGFyYW0gaW50ZXJhY3Rpb24gLSBDb21tYW5kSW50ZXJhY3Rpb25cbiAqIEBwYXJhbSBhZGRpdGlvbmFsSW5mbyAtIE90aGVyIGluZm9ybWF0aW9uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFrYWlyb01lc3NhZ2Uge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0aW50ZXJhY3Rpb246IENvbW1hbmRJbnRlcmFjdGlvbixcblx0XHRjb21tYW5kOiBDb21tYW5kXG5cdCkge1xuXHRcdHRoaXMuYXV0aG9yID0gaW50ZXJhY3Rpb24udXNlcjtcblxuXHRcdHRoaXMuY2hhbm5lbCA9IGludGVyYWN0aW9uLmNoYW5uZWw7XG5cblx0XHR0aGlzLmNsaWVudCA9IGNsaWVudDtcblxuXHRcdHRoaXMuY29udGVudCA9IGAvJHtpbnRlcmFjdGlvbi5jb21tYW5kTmFtZX1gO1xuXG5cdFx0dGhpcy5jcmVhdGVkQXQgPSBpbnRlcmFjdGlvbi5jcmVhdGVkQXQ7XG5cblx0XHR0aGlzLmNyZWF0ZWRUaW1lc3RhbXAgPSBpbnRlcmFjdGlvbi5jcmVhdGVkVGltZXN0YW1wO1xuXG5cdFx0dGhpcy5ndWlsZCA9IGludGVyYWN0aW9uLmd1aWxkO1xuXG5cdFx0dGhpcy5pZCA9IGludGVyYWN0aW9uLmlkO1xuXG5cdFx0dGhpcy5pbnRlcmFjdGlvbiA9IGludGVyYWN0aW9uO1xuXG5cdFx0dGhpcy5tZW1iZXIgPSBpbnRlcmFjdGlvbi5tZW1iZXI7XG5cblx0XHRmb3IgKGNvbnN0IG9wdGlvbiBvZiBjb21tYW5kLnNsYXNoT3B0aW9ucykge1xuXHRcdFx0dGhpcy5jb250ZW50ICs9IGAgJHtvcHRpb24ubmFtZX06ICR7XG5cdFx0XHRcdGludGVyYWN0aW9uLm9wdGlvbnMuZ2V0KG9wdGlvbi5uYW1lLCBvcHRpb24ucmVxdWlyZWQgfHwgZmFsc2UpPy52YWx1ZVxuXHRcdFx0fWA7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBhdXRob3Igb2YgdGhlIGludGVyYWN0aW9uLlxuXHQgKi9cblx0cHVibGljIGF1dGhvcjogVXNlcjtcblxuXHQvKipcblx0ICogVGhlIGNoYW5uZWwgdGhhdCB0aGUgaW50ZXJhY3Rpb24gd2FzIHNlbnQgaW4uXG5cdCAqL1xuXHRwdWJsaWMgY2hhbm5lbD86XG5cdFx0fCBUZXh0Q2hhbm5lbFxuXHRcdHwgRE1DaGFubmVsXG5cdFx0fCBOZXdzQ2hhbm5lbFxuXHRcdHwgVGhyZWFkQ2hhbm5lbFxuXHRcdHwgUGFydGlhbERNQ2hhbm5lbDtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIG5hbWUgYW5kIGFyZ3VtZW50cyByZXByZXNlbnRlZCBhcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBjb250ZW50OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lIHRoZSBpbnRlcmFjdGlvbiB3YXMgc2VudC5cblx0ICovXG5cdHB1YmxpYyBjcmVhdGVkQXQ6IERhdGU7XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lc3RhbXAgdGhlIGludGVyYWN0aW9uIHdhcyBzZW50IGF0LlxuXHQgKi9cblx0cHVibGljIGNyZWF0ZWRUaW1lc3RhbXA6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGd1aWxkIHRoZSBpbnRlcmFjdGlvbiB3YXMgc2VudCBpbiAoaWYgaW4gYSBndWlsZCBjaGFubmVsKS5cblx0ICovXG5cdHB1YmxpYyBndWlsZD86IEd1aWxkIHwgbnVsbDtcblxuXHQvKipcblx0ICogVGhlIElEIG9mIHRoZSBpbnRlcmFjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBpZDogU25vd2ZsYWtlO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBpbnRlcmFjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBpbnRlcmFjdGlvbjogQ29tbWFuZEludGVyYWN0aW9uO1xuXG5cdC8qKlxuXHQgKiBSZXByZXNlbnRzIHRoZSBhdXRob3Igb2YgdGhlIGludGVyYWN0aW9uIGFzIGEgZ3VpbGQgbWVtYmVyLlxuXHQgKiBPbmx5IGF2YWlsYWJsZSBpZiB0aGUgaW50ZXJhY3Rpb24gY29tZXMgZnJvbSBhIGd1aWxkIHdoZXJlIHRoZSBhdXRob3IgaXMgc3RpbGwgYSBtZW1iZXIuXG5cdCAqL1xuXHRwdWJsaWMgbWVtYmVyOiBHdWlsZE1lbWJlciB8IEFQSUludGVyYWN0aW9uR3VpbGRNZW1iZXI7XG5cblx0LyoqXG5cdCAqIFV0aWxpdGllcyBmb3IgY29tbWFuZCByZXNwb25kaW5nLlxuXHQgKi9cblx0cHVibGljIHV0aWw6IENvbW1hbmRVdGlsO1xuXG5cdC8qKlxuXHQgKiBUaGUgdXJsIHRvIGp1bXAgdG8gdGhpcyBtZXNzYWdlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHVybCgpIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcmFjdGlvbi5lcGhlbWVyYWxcblx0XHRcdD8gbnVsbFxuXHRcdFx0OiBgaHR0cHM6Ly9kaXNjb3JkLmNvbS9jaGFubmVscy8ke3RoaXMuZ3VpbGQgPyB0aGlzLmd1aWxkLmlkIDogXCJAbWVcIn0vJHtcblx0XHRcdFx0XHR0aGlzLmNoYW5uZWw/LmlkXG5cdFx0XHQgIH0vJHt0aGlzLmlkfWA7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyB0aGUgcmVwbHkgdG8gdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVsZXRlKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLmludGVyYWN0aW9uLmRlbGV0ZVJlcGx5KCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGllcyBvciBlZGl0cyB0aGUgcmVwbHkgb2YgdGhlIHNsYXNoIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zIHRvIGVkaXQgdGhlIHJlcGx5LlxuXHQgKi9cblx0cHVibGljIHJlcGx5KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdHJldHVybiB0aGlzLnV0aWwucmVwbHkob3B0aW9ucyk7XG5cdH1cbn1cbiJdfQ==