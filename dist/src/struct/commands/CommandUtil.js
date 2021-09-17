"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const AkairoMessage_1 = __importDefault(require("../../util/AkairoMessage"));
const CommandHandler_1 = __importDefault(require("./CommandHandler"));
/**
 * Command utilities.
 * @param handler - The command handler.
 * @param message - Message that triggered the command.
 */
class CommandUtil {
    constructor(handler, message) {
        this.handler = handler;
        this.message = message;
        this.parsed = null;
        this.shouldEdit = false;
        this.lastResponse = null;
        this.messages = this.handler instanceof CommandHandler_1.default && this.handler.storeMessages ? new discord_js_1.Collection() : null;
        this.isSlash = this.message instanceof AkairoMessage_1.default;
    }
    /**
     * The command handler.
     */
    handler;
    /**
     * Whether or not the command is a slash command.
     */
    isSlash;
    /**
     * The last response sent.
     */
    lastResponse;
    /**
     * Message that triggered the command.
     */
    message;
    /**
     * Messages stored from prompts and prompt replies.
     */
    messages;
    /**
     * The parsed components.
     */
    parsed;
    /**
     * Whether or not the last response should be edited.
     */
    shouldEdit;
    /**
     * Adds client prompt or user reply to messages.
     * @param message - Message to add.
     */
    addMessage(message) {
        if (this.handler instanceof CommandHandler_1.default && this.handler.storeMessages) {
            if (Array.isArray(message)) {
                for (const msg of message) {
                    this.messages?.set(msg.id, msg);
                }
            }
            else {
                this.messages?.set(message.id, message);
            }
        }
        return message;
    }
    async edit(options) {
        if (this.isSlash) {
            return this.lastResponse.interaction.editReply(options);
        }
        else {
            return this.lastResponse.edit(options);
        }
    }
    async reply(options) {
        const newOptions = typeof options === "string" ? { content: options } : options;
        if (!this.isSlash &&
            !this.shouldEdit &&
            !(newOptions instanceof discord_js_1.MessagePayload) &&
            !Reflect.has(this.message, "deleted")) {
            newOptions.reply = {
                messageReference: this.message,
                failIfNotExists: newOptions.failIfNotExists ?? true
            };
        }
        return this.send(newOptions);
    }
    async send(options) {
        const hasFiles = typeof options === "string" || !options.files?.length ? false : options.files?.length > 0;
        const newOptions = typeof options === "string" ? { content: options } : options;
        if (!(this.message.interaction instanceof discord_js_1.CommandInteraction)) {
            if (typeof options !== "string")
                delete options.ephemeral;
            if (this.shouldEdit && !hasFiles && !this.lastResponse.deleted && !this.lastResponse.attachments.size) {
                return this.lastResponse.edit(options);
            }
            const sent = await this.message.channel?.send(options);
            const lastSent = this.setLastResponse(sent);
            this.setEditable(!lastSent.attachments.size);
            return sent;
        }
        else {
            if (typeof options !== "string")
                delete options.reply;
            if (this.lastResponse || this.message.interaction.deferred || this.message.interaction.replied) {
                this.lastResponse = (await this.message.interaction.editReply(options));
                return this.lastResponse;
            }
            else {
                if (!newOptions.ephemeral) {
                    newOptions.fetchReply = true;
                    this.lastResponse = (await this.message.interaction.reply(newOptions));
                    return this.lastResponse;
                }
                return this.message.interaction.reply(newOptions);
            }
        }
    }
    async sendNew(options) {
        if (!(this.message.interaction instanceof discord_js_1.CommandInteraction)) {
            const sent = await this.message.channel?.send(options);
            const lastSent = this.setLastResponse(sent);
            this.setEditable(!lastSent.attachments.size);
            return sent;
        }
        else {
            const sent = (await this.message.interaction.followUp(options));
            this.setLastResponse(sent);
            return sent;
        }
    }
    /**
     * Changes if the message should be edited.
     * @param state - Change to editable or not.
     */
    setEditable(state) {
        this.shouldEdit = Boolean(state);
        return this;
    }
    /**
     * Sets the last response.
     * @param message - The last response.
     */
    setLastResponse(message) {
        if (Array.isArray(message)) {
            this.lastResponse = message.slice(-1)[0];
        }
        else {
            this.lastResponse = message;
        }
        return this.lastResponse;
    }
    /**
     * Deletes the last response.
     */
    async delete() {
        if (this.isSlash) {
            return this.message.interaction.deleteReply();
        }
        else {
            return this.lastResponse?.delete();
        }
    }
}
exports.default = CommandUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsMkNBV29CO0FBQ3BCLDZFQUFxRDtBQUVyRCxzRUFBdUU7QUFFdkU7Ozs7R0FJRztBQUNILE1BQXFCLFdBQVc7SUFDL0IsWUFBbUIsT0FBbUQsRUFBRSxPQUFnQztRQUN2RyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLFlBQVksd0JBQWMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSx1QkFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMvRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLFlBQVksdUJBQWEsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPLENBQTZDO0lBRTNEOztPQUVHO0lBQ0ksT0FBTyxDQUFVO0lBRXhCOztPQUVHO0lBQ0ksWUFBWSxDQUFpQjtJQUVwQzs7T0FFRztJQUNJLE9BQU8sQ0FBMEI7SUFFeEM7O09BRUc7SUFDSSxRQUFRLENBQXdDO0lBRXZEOztPQUVHO0lBQ0ksTUFBTSxDQUE2QjtJQUUxQzs7T0FFRztJQUNJLFVBQVUsQ0FBVTtJQUUzQjs7O09BR0c7SUFDSSxVQUFVLENBQUMsT0FBNEI7UUFDN0MsSUFBSSxJQUFJLENBQUMsT0FBTyxZQUFZLHdCQUFjLElBQUksSUFBSSxD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Q0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLE9BQU8sSUFBSyxDQUFDO1NBQ2I7YUFBTTtZQUNOLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQVksQ0FBQztZQUMzRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7SUFDRixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksV0FBVyxDQUFDLEtBQWM7UUFDaEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksZUFBZSxDQUFDLE9BQWdCO1FBQ3RDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN6QzthQUFNO1lBQ04sSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7U0FDNUI7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUF1QixDQUFDO0lBQ3JDLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxNQUFNO1FBQ2xCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNqQixPQUFRLElBQUksQ0FBQyxPQUF5QixDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNqRTthQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDO1NBQ25DO0lBQ0YsQ0FBQztDQUNEO0FBck1ELDhCQXFNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIHJlcXVpcmUtYXdhaXQgKi9cbmltcG9ydCB7IEFQSU1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC1hcGktdHlwZXNcIjtcbmltcG9ydCB7XG5cdENvbGxlY3Rpb24sXG5cdENvbW1hbmRJbnRlcmFjdGlvbixcblx0SW50ZXJhY3Rpb25SZXBseU9wdGlvbnMsXG5cdE1lc3NhZ2UsXG5cdE1lc3NhZ2VFZGl0T3B0aW9ucyxcblx0TWVzc2FnZU9wdGlvbnMsXG5cdE1lc3NhZ2VQYXlsb2FkLFxuXHRSZXBseU1lc3NhZ2VPcHRpb25zLFxuXHRTbm93Zmxha2UsXG5cdFdlYmhvb2tFZGl0TWVzc2FnZU9wdGlvbnNcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBBa2Fpcm9NZXNzYWdlIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb01lc3NhZ2VcIjtcbmltcG9ydCBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyIGZyb20gXCIuLi9jb250ZXh0TWVudUNvbW1hbmRzL0NvbnRleHRNZW51Q29tbWFuZEhhbmRsZXJcIjtcbmltcG9ydCBDb21tYW5kSGFuZGxlciwgeyBQYXJzZWRDb21wb25lbnREYXRhIH0gZnJvbSBcIi4vQ29tbWFuZEhhbmRsZXJcIjtcblxuLyoqXG4gKiBDb21tYW5kIHV0aWxpdGllcy5cbiAqIEBwYXJhbSBoYW5kbGVyIC0gVGhlIGNvbW1hbmQgaGFuZGxlci5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZFV0aWwge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoaGFuZGxlcjogQ29tbWFuZEhhbmRsZXIgfCBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyLCBtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSkge1xuXHRcdHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblx0XHR0aGlzLnBhcnNlZCA9IG51bGw7XG5cdFx0dGhpcy5zaG91bGRFZGl0ID0gZmFsc2U7XG5cdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBudWxsO1xuXHRcdHRoaXMubWVzc2FnZXMgPSB0aGlzLmhhbmRsZXIgaW5zdGFuY2VvZiBDb21tYW5kSGFuZGxlciAmJiB0aGlzLmhhbmRsZXIuc3RvcmVNZXNzYWdlcyA/IG5ldyBDb2xsZWN0aW9uKCkgOiBudWxsO1xuXHRcdHRoaXMuaXNTbGFzaCA9IHRoaXMubWVzc2FnZSBpbnN0YW5jZW9mIEFrYWlyb01lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBoYW5kbGVyOiBDb21tYW5kSGFuZGxlciB8IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBpc1NsYXNoOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgbGFzdCByZXNwb25zZSBzZW50LlxuXHQgKi9cblx0cHVibGljIGxhc3RSZXNwb25zZTogTWVzc2FnZSB8IG51bGw7XG5cblx0LyoqXG5cdCAqIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgbWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2U7XG5cblx0LyoqXG5cdCAqIE1lc3NhZ2VzIHN0b3JlZCBmcm9tIHByb21wdHMgYW5kIHByb21wdCByZXBsaWVzLlxuXHQgKi9cblx0cHVibGljIG1lc3NhZ2VzOiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgTWVzc2FnZT4gfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgcGFyc2VkIGNvbXBvbmVudHMuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VkOiBQYXJzZWRDb21wb25lbnREYXRhIHwgbnVsbDtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGxhc3QgcmVzcG9uc2Ugc2hvdWxkIGJlIGVkaXRlZC5cblx0ICovXG5cdHB1YmxpYyBzaG91bGRFZGl0OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBBZGRzIGNsaWVudCBwcm9tcHQgb3IgdXNlciByZXBseSB0byBtZXNzYWdlcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGFkZC5cblx0ICovXG5cdHB1YmxpYyBhZGRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UgfCBNZXNzYWdlW10pOiBNZXNzYWdlIHwgTWVzc2FnZVtdIHtcblx0XHRpZiAodGhpcy5oYW5kbGVyIGluc3RhbmNlb2YgQ29tbWFuZEhhbmRsZXIgJiYgdGhpcy5oYW5kbGVyLnN0b3JlTWVzc2FnZXMpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgbXNnIG9mIG1lc3NhZ2UpIHtcblx0XHRcdFx0XHR0aGlzLm1lc3NhZ2VzPy5zZXQobXNnLmlkLCBtc2cpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1lc3NhZ2VzPy5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogRWRpdHMgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIElmIHRoZSBtZXNzYWdlIGlzIGEgc2xhc2ggY29tbWFuZCwgZWRpdHMgdGhlIHNsYXNoIHJlc3BvbnNlLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGVkaXQob3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZUVkaXRPcHRpb25zIHwgTWVzc2FnZVBheWxvYWQpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgZWRpdChvcHRpb25zOiBzdHJpbmcgfCBXZWJob29rRWRpdE1lc3NhZ2VPcHRpb25zIHwgTWVzc2FnZVBheWxvYWQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIGVkaXQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgV2ViaG9va0VkaXRNZXNzYWdlT3B0aW9ucyB8IFdlYmhvb2tFZGl0TWVzc2FnZU9wdGlvbnMgfCBNZXNzYWdlUGF5bG9hZFxuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0aWYgKHRoaXMuaXNTbGFzaCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLmxhc3RSZXNwb25zZSBhcyB1bmtub3duIGFzIEFrYWlyb01lc3NhZ2UpLmludGVyYWN0aW9uLmVkaXRSZXBseShvcHRpb25zKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlIS5lZGl0KG9wdGlvbnMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kIGFuIGlubGluZSByZXBseSBvciByZXNwb25kIHRvIGEgc2xhc2ggY29tbWFuZC5cblx0ICogSWYgdGhlIG1lc3NhZ2UgaXMgYSBzbGFzaCBjb21tYW5kLCBpdCByZXBsaWVzIG9yIGVkaXRzIHRoZSBsYXN0IHJlcGx5LlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJlcGx5KG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgUmVwbHlNZXNzYWdlT3B0aW9ucyk6IFByb21pc2U8TWVzc2FnZT47XG5cdHB1YmxpYyBhc3luYyByZXBseShvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zKTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT47XG5cdHB1YmxpYyBhc3luYyByZXBseShcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IFJlcGx5TWVzc2FnZU9wdGlvbnMgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0Y29uc3QgbmV3T3B0aW9ucyA9IHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiID8geyBjb250ZW50OiBvcHRpb25zIH0gOiBvcHRpb25zO1xuXHRcdGlmIChcblx0XHRcdCF0aGlzLmlzU2xhc2ggJiZcblx0XHRcdCF0aGlzLnNob3VsZEVkaXQgJiZcblx0XHRcdCEobmV3T3B0aW9ucyBpbnN0YW5jZW9mIE1lc3NhZ2VQYXlsb2FkKSAmJlxuXHRcdFx0IVJlZmxlY3QuaGFzKHRoaXMubWVzc2FnZSwgXCJkZWxldGVkXCIpXG5cdFx0KSB7XG5cdFx0XHQobmV3T3B0aW9ucyBhcyBNZXNzYWdlT3B0aW9ucykucmVwbHkgPSB7XG5cdFx0XHRcdG1lc3NhZ2VSZWZlcmVuY2U6IHRoaXMubWVzc2FnZSBhcyBNZXNzYWdlLFxuXHRcdFx0XHRmYWlsSWZOb3RFeGlzdHM6IChuZXdPcHRpb25zIGFzIFJlcGx5TWVzc2FnZU9wdGlvbnMpLmZhaWxJZk5vdEV4aXN0cyA/PyB0cnVlXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5zZW5kKG5ld09wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2Ugb3IgZWRpdHMgYW4gb2xkIHJlc3BvbnNlIGlmIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBzZW5kKG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgc2VuZChvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zKTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT47XG5cdHB1YmxpYyBhc3luYyBzZW5kKFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0Y29uc3QgaGFzRmlsZXMgPSB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIiB8fCAhb3B0aW9ucy5maWxlcz8ubGVuZ3RoID8gZmFsc2UgOiBvcHRpb25zLmZpbGVzPy5sZW5ndGggPiAwO1xuXHRcdGNvbnN0IG5ld09wdGlvbnMgPSB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIiA/IHsgY29udGVudDogb3B0aW9ucyB9IDogb3B0aW9ucztcblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMgIT09IFwic3RyaW5nXCIpIGRlbGV0ZSAob3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZXBoZW1lcmFsO1xuXHRcdFx0aWYgKHRoaXMuc2hvdWxkRWRpdCAmJiAhaGFzRmlsZXMgJiYgIXRoaXMubGFzdFJlc3BvbnNlIS5kZWxldGVkICYmICF0aGlzLmxhc3RSZXNwb25zZSEuYXR0YWNobWVudHMuc2l6ZSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UhLmVkaXQob3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cblx0XHRcdGNvbnN0IGxhc3RTZW50ID0gdGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCEpO1xuXHRcdFx0dGhpcy5zZXRFZGl0YWJsZSghbGFzdFNlbnQuYXR0YWNobWVudHMuc2l6ZSk7XG5cblx0XHRcdHJldHVybiBzZW50ITtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zICE9PSBcInN0cmluZ1wiKSBkZWxldGUgKG9wdGlvbnMgYXMgTWVzc2FnZU9wdGlvbnMpLnJlcGx5O1xuXHRcdFx0aWYgKHRoaXMubGFzdFJlc3BvbnNlIHx8IHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5kZWZlcnJlZCB8fCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbGllZCkge1xuXHRcdFx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IChhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24uZWRpdFJlcGx5KG9wdGlvbnMpKSBhcyBNZXNzYWdlO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIShuZXdPcHRpb25zIGFzIEludGVyYWN0aW9uUmVwbHlPcHRpb25zKS5lcGhlbWVyYWwpIHtcblx0XHRcdFx0XHQobmV3T3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZmV0Y2hSZXBseSA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLnJlcGx5KG5ld09wdGlvbnMpKSBhcyB1bmtub3duIGFzIE1lc3NhZ2U7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbHkobmV3T3B0aW9ucykgYXMgdW5rbm93biBhcyBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2VuZHMgYSByZXNwb25zZSwgb3ZlcndyaXRpbmcgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgc2VuZE5ldyhvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zKTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIHNlbmROZXcob3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgc2VuZE5ldyhcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdGlmICghKHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbiBpbnN0YW5jZW9mIENvbW1hbmRJbnRlcmFjdGlvbikpIHtcblx0XHRcdGNvbnN0IHNlbnQgPSBhd2FpdCB0aGlzLm1lc3NhZ2UuY2hhbm5lbD8uc2VuZChvcHRpb25zKTtcblx0XHRcdGNvbnN0IGxhc3RTZW50ID0gdGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCEpO1xuXHRcdFx0dGhpcy5zZXRFZGl0YWJsZSghbGFzdFNlbnQuYXR0YWNobWVudHMuc2l6ZSk7XG5cdFx0XHRyZXR1cm4gc2VudCE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNlbnQgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmZvbGxvd1VwKG9wdGlvbnMpKSBhcyBNZXNzYWdlO1xuXHRcdFx0dGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCk7XG5cdFx0XHRyZXR1cm4gc2VudDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyBpZiB0aGUgbWVzc2FnZSBzaG91bGQgYmUgZWRpdGVkLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBDaGFuZ2UgdG8gZWRpdGFibGUgb3Igbm90LlxuXHQgKi9cblx0cHVibGljIHNldEVkaXRhYmxlKHN0YXRlOiBib29sZWFuKTogQ29tbWFuZFV0aWwge1xuXHRcdHRoaXMuc2hvdWxkRWRpdCA9IEJvb2xlYW4oc3RhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqL1xuXHRwdWJsaWMgc2V0TGFzdFJlc3BvbnNlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBNZXNzYWdlIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlKSkge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlLnNsaWNlKC0xKVswXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UgYXMgTWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGRlbGV0ZSgpOiBQcm9taXNlPE1lc3NhZ2UgfCB2b2lkPiB7XG5cdFx0aWYgKHRoaXMuaXNTbGFzaCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLm1lc3NhZ2UgYXMgQWthaXJvTWVzc2FnZSkuaW50ZXJhY3Rpb24uZGVsZXRlUmVwbHkoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlPy5kZWxldGUoKTtcblx0XHR9XG5cdH1cbn1cbiJdfQ==