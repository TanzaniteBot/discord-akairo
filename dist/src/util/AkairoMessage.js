"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A command interaction represented as a message.
 * @param client - AkairoClient
 * @param interaction - CommandInteraction
 * @param command - The command of the interaction
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL0FrYWlyb01lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFnQkE7Ozs7O0dBS0c7QUFDSCxNQUFxQixhQUFhO0lBQ2pDLFlBQ0MsTUFBb0IsRUFDcEIsV0FBK0IsRUFDL0IsT0FBZ0I7UUFFaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBRS9CLElBQUksQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUVuQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTdDLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUV2QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLGdCQUFnQixDQUFDO1FBRXJELElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUUvQixJQUFJLENBQUMsRUFBRSxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDO1FBRWpDLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtZQUMxQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksS0FDOUIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQ2pFLEVBQUUsQ0FBQztTQUNIO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTSxDQUFPO0lBRXBCOztPQUVHO0lBQ0ksT0FBTyxDQUFxQjtJQUVuQzs7T0FFRztJQUNJLE1BQU0sQ0FBZTtJQUU1Qjs7T0FFRztJQUNJLE9BQU8sQ0FBUztJQUV2Qjs7T0FFRztJQUNJLFNBQVMsQ0FBTztJQUV2Qjs7T0FFRztJQUNJLGdCQUFnQixDQUFTO0lBRWhDOztPQUVHO0lBQ0ksS0FBSyxDQUFnQjtJQUU1Qjs7T0FFRztJQUNJLEVBQUUsQ0FBWTtJQUVyQjs7T0FFRztJQUNJLFdBQVcsQ0FBcUI7SUFFdkM7OztPQUdHO0lBQ0ksTUFBTSxDQUEwQztJQUV2RDs7T0FFRztJQUNJLElBQUksQ0FBYztJQUV6Qjs7T0FFRztJQUNILElBQVcsR0FBRztRQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTO1lBQ2hDLENBQUMsQ0FBQyxJQUFJO1lBQ04sQ0FBQyxDQUFDLGdDQUFnQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUNsRSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQ2QsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTTtRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksS0FBSyxDQUNYLE9BQTBEO1FBRTFELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNEO0FBcEhELGdDQW9IQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUludGVyYWN0aW9uR3VpbGRNZW1iZXIsIEFQSU1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC1hcGktdHlwZXMvdjlcIjtcbmltcG9ydCB7XG5cdENvbW1hbmRJbnRlcmFjdGlvbixcblx0R3VpbGQsXG5cdEd1aWxkTWVtYmVyLFxuXHRJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyxcblx0TWVzc2FnZSxcblx0TWVzc2FnZVBheWxvYWQsXG5cdFNub3dmbGFrZSxcblx0VGV4dEJhc2VkQ2hhbm5lbHMsXG5cdFVzZXJcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL3N0cnVjdC9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBDb21tYW5kIGZyb20gXCIuLi9zdHJ1Y3QvY29tbWFuZHMvQ29tbWFuZFwiO1xuaW1wb3J0IENvbW1hbmRVdGlsIGZyb20gXCIuLi9zdHJ1Y3QvY29tbWFuZHMvQ29tbWFuZFV0aWxcIjtcblxuLyoqXG4gKiBBIGNvbW1hbmQgaW50ZXJhY3Rpb24gcmVwcmVzZW50ZWQgYXMgYSBtZXNzYWdlLlxuICogQHBhcmFtIGNsaWVudCAtIEFrYWlyb0NsaWVudFxuICogQHBhcmFtIGludGVyYWN0aW9uIC0gQ29tbWFuZEludGVyYWN0aW9uXG4gKiBAcGFyYW0gY29tbWFuZCAtIFRoZSBjb21tYW5kIG9mIHRoZSBpbnRlcmFjdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBa2Fpcm9NZXNzYWdlIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNsaWVudDogQWthaXJvQ2xpZW50LFxuXHRcdGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb24sXG5cdFx0Y29tbWFuZDogQ29tbWFuZFxuXHQpIHtcblx0XHR0aGlzLmF1dGhvciA9IGludGVyYWN0aW9uLnVzZXI7XG5cblx0XHR0aGlzLmNoYW5uZWwgPSBpbnRlcmFjdGlvbi5jaGFubmVsO1xuXG5cdFx0dGhpcy5jbGllbnQgPSBjbGllbnQ7XG5cblx0XHR0aGlzLmNvbnRlbnQgPSBgLyR7aW50ZXJhY3Rpb24uY29tbWFuZE5hbWV9YDtcblxuXHRcdHRoaXMuY3JlYXRlZEF0ID0gaW50ZXJhY3Rpb24uY3JlYXRlZEF0O1xuXG5cdFx0dGhpcy5jcmVhdGVkVGltZXN0YW1wID0gaW50ZXJhY3Rpb24uY3JlYXRlZFRpbWVzdGFtcDtcblxuXHRcdHRoaXMuZ3VpbGQgPSBpbnRlcmFjdGlvbi5ndWlsZDtcblxuXHRcdHRoaXMuaWQgPSBpbnRlcmFjdGlvbi5pZDtcblxuXHRcdHRoaXMuaW50ZXJhY3Rpb24gPSBpbnRlcmFjdGlvbjtcblxuXHRcdHRoaXMubWVtYmVyID0gaW50ZXJhY3Rpb24ubWVtYmVyO1xuXG5cdFx0Zm9yIChjb25zdCBvcHRpb24gb2YgY29tbWFuZC5zbGFzaE9wdGlvbnMpIHtcblx0XHRcdHRoaXMuY29udGVudCArPSBgICR7b3B0aW9uLm5hbWV9OiAke1xuXHRcdFx0XHRpbnRlcmFjdGlvbi5vcHRpb25zLmdldChvcHRpb24ubmFtZSwgb3B0aW9uLnJlcXVpcmVkIHx8IGZhbHNlKT8udmFsdWVcblx0XHRcdH1gO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYXV0aG9yIG9mIHRoZSBpbnRlcmFjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBhdXRob3I6IFVzZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBjaGFubmVsIHRoYXQgdGhlIGludGVyYWN0aW9uIHdhcyBzZW50IGluLlxuXHQgKi9cblx0cHVibGljIGNoYW5uZWw/OiBUZXh0QmFzZWRDaGFubmVscztcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIG5hbWUgYW5kIGFyZ3VtZW50cyByZXByZXNlbnRlZCBhcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBjb250ZW50OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lIHRoZSBpbnRlcmFjdGlvbiB3YXMgc2VudC5cblx0ICovXG5cdHB1YmxpYyBjcmVhdGVkQXQ6IERhdGU7XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lc3RhbXAgdGhlIGludGVyYWN0aW9uIHdhcyBzZW50IGF0LlxuXHQgKi9cblx0cHVibGljIGNyZWF0ZWRUaW1lc3RhbXA6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGd1aWxkIHRoZSBpbnRlcmFjdGlvbiB3YXMgc2VudCBpbiAoaWYgaW4gYSBndWlsZCBjaGFubmVsKS5cblx0ICovXG5cdHB1YmxpYyBndWlsZD86IEd1aWxkIHwgbnVsbDtcblxuXHQvKipcblx0ICogVGhlIElEIG9mIHRoZSBpbnRlcmFjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBpZDogU25vd2ZsYWtlO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBpbnRlcmFjdGlvbi5cblx0ICovXG5cdHB1YmxpYyBpbnRlcmFjdGlvbjogQ29tbWFuZEludGVyYWN0aW9uO1xuXG5cdC8qKlxuXHQgKiBSZXByZXNlbnRzIHRoZSBhdXRob3Igb2YgdGhlIGludGVyYWN0aW9uIGFzIGEgZ3VpbGQgbWVtYmVyLlxuXHQgKiBPbmx5IGF2YWlsYWJsZSBpZiB0aGUgaW50ZXJhY3Rpb24gY29tZXMgZnJvbSBhIGd1aWxkIHdoZXJlIHRoZSBhdXRob3IgaXMgc3RpbGwgYSBtZW1iZXIuXG5cdCAqL1xuXHRwdWJsaWMgbWVtYmVyOiBHdWlsZE1lbWJlciB8IEFQSUludGVyYWN0aW9uR3VpbGRNZW1iZXI7XG5cblx0LyoqXG5cdCAqIFV0aWxpdGllcyBmb3IgY29tbWFuZCByZXNwb25kaW5nLlxuXHQgKi9cblx0cHVibGljIHV0aWw6IENvbW1hbmRVdGlsO1xuXG5cdC8qKlxuXHQgKiBUaGUgdXJsIHRvIGp1bXAgdG8gdGhpcyBtZXNzYWdlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHVybCgpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5pbnRlcmFjdGlvbi5lcGhlbWVyYWxcblx0XHRcdD8gbnVsbFxuXHRcdFx0OiBgaHR0cHM6Ly9kaXNjb3JkLmNvbS9jaGFubmVscy8ke3RoaXMuZ3VpbGQgPyB0aGlzLmd1aWxkLmlkIDogXCJAbWVcIn0vJHtcblx0XHRcdFx0XHR0aGlzLmNoYW5uZWw/LmlkXG5cdFx0XHQgIH0vJHt0aGlzLmlkfWA7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyB0aGUgcmVwbHkgdG8gdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVsZXRlKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLmludGVyYWN0aW9uLmRlbGV0ZVJlcGx5KCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGllcyBvciBlZGl0cyB0aGUgcmVwbHkgb2YgdGhlIHNsYXNoIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBvcHRpb25zIFRoZSBvcHRpb25zIHRvIGVkaXQgdGhlIHJlcGx5LlxuXHQgKi9cblx0cHVibGljIHJlcGx5KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdHJldHVybiB0aGlzLnV0aWwucmVwbHkob3B0aW9ucyk7XG5cdH1cbn1cbiJdfQ==