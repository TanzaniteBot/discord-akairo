"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
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
        if (this.handler.storeMessages) {
            this.messages = new discord_js_1.Collection();
        }
        else {
            this.messages = null;
        }
        this.isSlash = !!(this.message instanceof discord_js_1.Message);
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
     * Adds client prompt or user reply to messages.
     * @param message - Message to add.
     */
    addMessage(message) {
        if (this.handler.storeMessages) {
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
    /**
     * Changes if the message should be edited.
     * @param state - Change to editable or not.
     */
    setEditable(state) {
        this.shouldEdit = Boolean(state);
        return this;
    }
    /**
     * Sends a response or edits an old response if available.
     * @param options - Options to use.
     */
    // eslint-disable-next-line consistent-return
    async send(options) {
        const hasFiles = typeof options === "string" || !options.files?.length
            ? false
            : options.files?.length > 0;
        let newOptions = {};
        if (typeof options === "string") {
            newOptions.content = options;
        }
        else {
            newOptions = options;
        }
        if (!(this.message.interaction instanceof discord_js_1.CommandInteraction)) {
            if (typeof options !== "string")
                delete options.ephemeral;
            if (this.shouldEdit &&
                !hasFiles &&
                !this.lastResponse.deleted &&
                !this.lastResponse.attachments.size) {
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
            if (this.lastResponse ||
                this.message.interaction.deferred ||
                this.message.interaction.replied) {
                this.lastResponse = (await this.message.interaction.editReply(options));
                return this.lastResponse;
            }
            else {
                if (!newOptions.ephemeral) {
                    newOptions.fetchReply = true;
                    this.lastResponse = (await this.message.interaction.reply(newOptions));
                    return this.lastResponse;
                }
                await this.message.interaction.reply(newOptions);
            }
        }
    }
    /**
     * Sends a response, overwriting the last response.
     * @param options - Options to use.
     */
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
     * Send an inline reply or respond to a slash command.
     * @param options - Options to use.
     */
    async reply(options) {
        let newOptions = {};
        if (typeof options == "string") {
            newOptions.content = options;
        }
        else {
            // @ts-expect-error
            newOptions = options;
        }
        if (!this.isSlash &&
            !this.shouldEdit &&
            !(newOptions instanceof discord_js_1.MessagePayload) &&
            // @ts-expect-error
            !this.message.deleted) {
            // @ts-expect-error
            newOptions.reply = {
                messageReference: this.message,
                failIfNotExists: newOptions.failIfNotExists ?? true
            };
        } // @ts-expect-error
        return this.send(newOptions);
    }
    /**
     * Edits the last response.
     * If the message is a slash command, edits the slash response.
     * @param options - Options to use.
     */
    async edit(options) {
        if (this.isSlash) {
            // @ts-expect-error
            return this.lastResponse.interaction.editReply(options);
        }
        else {
            return this.lastResponse.edit(options);
        }
    }
    /**
     * Deletes the last response.
     */
    async delete() {
        if (this.isSlash) {
            // @ts-expect-error
            return this.message.interaction.deleteReply();
        }
        else {
            return this.lastResponse?.delete();
        }
    }
}
exports.default = CommandUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsMkNBV29CO0FBSXBCOzs7O0dBSUc7QUFDSCxNQUFxQixXQUFXO0lBQy9CLFlBQ0MsT0FBdUIsRUFDdkIsT0FBZ0M7UUFFaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFFbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDTixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxvQkFBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOztPQUVHO0lBQ0ksT0FBTyxDQUFpQjtJQUUvQjs7T0FFRztJQUNJLE9BQU8sQ0FBZTtJQUU3Qjs7T0FFRztJQUNJLFlBQVksQ0FBVztJQUU5Qjs7T0FFRztJQUNJLE9BQU8sQ0FBMEI7SUFFeEM7O09BRUc7SUFDSSxRQUFRLENBQWtDO0lBRWpEOztPQUVHO0lBQ0ksTUFBTSxDQUF1QjtJQUVwQzs7T0FFRztJQUNJLFVBQVUsQ0FBVTtJQUUzQjs7O09BR0c7SUFDSSxlQUFlLENBQUMsT0FBZ0I7UUFDdEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzNCLElBQUks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QUM5QzthQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDO1NBQ25DO0lBQ0YsQ0FBQztDQUNEO0FBdFBELDhCQXNQQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIHJlcXVpcmUtYXdhaXQgKi9cbmltcG9ydCB7IEFQSU1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC1hcGktdHlwZXNcIjtcbmltcG9ydCB7XG5cdENvbGxlY3Rpb24sXG5cdE1lc3NhZ2VQYXlsb2FkLFxuXHRDb21tYW5kSW50ZXJhY3Rpb24sXG5cdEludGVyYWN0aW9uUmVwbHlPcHRpb25zLFxuXHRNZXNzYWdlLFxuXHRNZXNzYWdlRWRpdE9wdGlvbnMsXG5cdE1lc3NhZ2VPcHRpb25zLFxuXHRSZXBseU1lc3NhZ2VPcHRpb25zLFxuXHRXZWJob29rRWRpdE1lc3NhZ2VPcHRpb25zLFxuXHRTbm93Zmxha2Vcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBBa2Fpcm9NZXNzYWdlIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb01lc3NhZ2VcIjtcbmltcG9ydCBDb21tYW5kSGFuZGxlciwgeyBQYXJzZWRDb21wb25lbnREYXRhIH0gZnJvbSBcIi4vQ29tbWFuZEhhbmRsZXJcIjtcblxuLyoqXG4gKiBDb21tYW5kIHV0aWxpdGllcy5cbiAqIEBwYXJhbSBoYW5kbGVyIC0gVGhlIGNvbW1hbmQgaGFuZGxlci5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZFV0aWwge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0aGFuZGxlcjogQ29tbWFuZEhhbmRsZXIsXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2Vcblx0KSB7XG5cdFx0dGhpcy5oYW5kbGVyID0gaGFuZGxlcjtcblxuXHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cblx0XHR0aGlzLnBhcnNlZCA9IG51bGw7XG5cblx0XHR0aGlzLnNob3VsZEVkaXQgPSBmYWxzZTtcblxuXHRcdHRoaXMubGFzdFJlc3BvbnNlID0gbnVsbDtcblxuXHRcdGlmICh0aGlzLmhhbmRsZXIuc3RvcmVNZXNzYWdlcykge1xuXHRcdFx0dGhpcy5tZXNzYWdlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubWVzc2FnZXMgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMuaXNTbGFzaCA9ICEhKHRoaXMubWVzc2FnZSBpbnN0YW5jZW9mIE1lc3NhZ2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgaGFuZGxlcjogQ29tbWFuZEhhbmRsZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBpc1NsYXNoOiB0cnVlIHwgZmFsc2U7XG5cblx0LyoqXG5cdCAqIFRoZSBsYXN0IHJlc3BvbnNlIHNlbnQuXG5cdCAqL1xuXHRwdWJsaWMgbGFzdFJlc3BvbnNlPzogTWVzc2FnZTtcblxuXHQvKipcblx0ICogTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZTtcblxuXHQvKipcblx0ICogTWVzc2FnZXMgc3RvcmVkIGZyb20gcHJvbXB0cyBhbmQgcHJvbXB0IHJlcGxpZXMuXG5cdCAqL1xuXHRwdWJsaWMgbWVzc2FnZXM/OiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgTWVzc2FnZT47XG5cblx0LyoqXG5cdCAqIFRoZSBwYXJzZWQgY29tcG9uZW50cy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZWQ/OiBQYXJzZWRDb21wb25lbnREYXRhO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgbGFzdCByZXNwb25zZSBzaG91bGQgYmUgZWRpdGVkLlxuXHQgKi9cblx0cHVibGljIHNob3VsZEVkaXQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqL1xuXHRwdWJsaWMgc2V0TGFzdFJlc3BvbnNlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBNZXNzYWdlIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlKSkge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlLnNsaWNlKC0xKVswXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UgYXMgTWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGNsaWVudCBwcm9tcHQgb3IgdXNlciByZXBseSB0byBtZXNzYWdlcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGFkZC5cblx0ICovXG5cdHB1YmxpYyBhZGRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UgfCBNZXNzYWdlW10pOiBNZXNzYWdlIHwgTWVzc2FnZVtdIHtcblx0XHRpZiAodGhpcy5oYW5kbGVyLnN0b3JlTWVzc2FnZXMpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgbXNnIG9mIG1lc3NhZ2UpIHtcblx0XHRcdFx0XHR0aGlzLm1lc3NhZ2VzPy5zZXQobXNnLmlkLCBtc2cpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1lc3NhZ2VzPy5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyBpZiB0aGUgbWVzc2FnZSBzaG91bGQgYmUgZWRpdGVkLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBDaGFuZ2UgdG8gZWRpdGFibGUgb3Igbm90LlxuXHQgKi9cblx0cHVibGljIHNldEVkaXRhYmxlKHN0YXRlOiBib29sZWFuKTogQ29tbWFuZFV0aWwge1xuXHRcdHRoaXMuc2hvdWxkRWRpdCA9IEJvb2xlYW4oc3RhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2Ugb3IgZWRpdHMgYW4gb2xkIHJlc3BvbnNlIGlmIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuXHRwdWJsaWMgYXN5bmMgc2VuZChcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZSB8IHZvaWQ+IHtcblx0XHRjb25zdCBoYXNGaWxlcyA9XG5cdFx0XHR0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIiB8fCAhb3B0aW9ucy5maWxlcz8ubGVuZ3RoXG5cdFx0XHRcdD8gZmFsc2Vcblx0XHRcdFx0OiBvcHRpb25zLmZpbGVzPy5sZW5ndGggPiAwO1xuXG5cdFx0bGV0IG5ld09wdGlvbnM6IE1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMgPSB7fTtcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdG5ld09wdGlvbnMuY29udGVudCA9IG9wdGlvbnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5ld09wdGlvbnMgPSBvcHRpb25zIGFzIE1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnM7XG5cdFx0fVxuXHRcdGlmICghKHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbiBpbnN0YW5jZW9mIENvbW1hbmRJbnRlcmFjdGlvbikpIHtcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gXCJzdHJpbmdcIilcblx0XHRcdFx0ZGVsZXRlIChvcHRpb25zIGFzIEludGVyYWN0aW9uUmVwbHlPcHRpb25zKS5lcGhlbWVyYWw7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHRoaXMuc2hvdWxkRWRpdCAmJlxuXHRcdFx0XHQhaGFzRmlsZXMgJiZcblx0XHRcdFx0IXRoaXMubGFzdFJlc3BvbnNlLmRlbGV0ZWQgJiZcblx0XHRcdFx0IXRoaXMubGFzdFJlc3BvbnNlLmF0dGFjaG1lbnRzLnNpemVcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UuZWRpdChvcHRpb25zKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHNlbnQgPSBhd2FpdCB0aGlzLm1lc3NhZ2UuY2hhbm5lbD8uc2VuZChvcHRpb25zKTtcblxuXHRcdFx0Y29uc3QgbGFzdFNlbnQgPSB0aGlzLnNldExhc3RSZXNwb25zZShzZW50KTtcblx0XHRcdHRoaXMuc2V0RWRpdGFibGUoIWxhc3RTZW50LmF0dGFjaG1lbnRzLnNpemUpO1xuXG5cdFx0XHRyZXR1cm4gc2VudDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zICE9PSBcInN0cmluZ1wiKSBkZWxldGUgKG9wdGlvbnMgYXMgTWVzc2FnZU9wdGlvbnMpLnJlcGx5O1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR0aGlzLmxhc3RSZXNwb25zZSB8fFxuXHRcdFx0XHR0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24uZGVmZXJyZWQgfHxcblx0XHRcdFx0dGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLnJlcGxpZWRcblx0XHRcdCkge1xuXHRcdFx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IChhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24uZWRpdFJlcGx5KFxuXHRcdFx0XHRcdG9wdGlvbnNcblx0XHRcdFx0KSkgYXMgTWVzc2FnZTtcblx0XHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCEobmV3T3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZXBoZW1lcmFsKSB7XG5cdFx0XHRcdFx0KG5ld09wdGlvbnMgYXMgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMpLmZldGNoUmVwbHkgPSB0cnVlO1xuXHRcdFx0XHRcdHRoaXMubGFzdFJlc3BvbnNlID0gKGF3YWl0IHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5yZXBseShcblx0XHRcdFx0XHRcdG5ld09wdGlvbnNcblx0XHRcdFx0XHQpKSBhcyB1bmtub3duIGFzIE1lc3NhZ2U7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGF3YWl0IHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5yZXBseShuZXdPcHRpb25zKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2VuZHMgYSByZXNwb25zZSwgb3ZlcndyaXRpbmcgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgc2VuZE5ldyhcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cdFx0XHRjb25zdCBsYXN0U2VudCA9IHRoaXMuc2V0TGFzdFJlc3BvbnNlKHNlbnQpO1xuXHRcdFx0dGhpcy5zZXRFZGl0YWJsZSghbGFzdFNlbnQuYXR0YWNobWVudHMuc2l6ZSk7XG5cdFx0XHRyZXR1cm4gc2VudDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgc2VudCA9IChhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24uZm9sbG93VXAoXG5cdFx0XHRcdG9wdGlvbnNcblx0XHRcdCkpIGFzIE1lc3NhZ2U7XG5cdFx0XHR0aGlzLnNldExhc3RSZXNwb25zZShzZW50KTtcblx0XHRcdHJldHVybiBzZW50O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kIGFuIGlubGluZSByZXBseSBvciByZXNwb25kIHRvIGEgc2xhc2ggY29tbWFuZC5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyByZXBseShcblx0XHRvcHRpb25zOlxuXHRcdFx0fCBzdHJpbmdcblx0XHRcdHwgTWVzc2FnZVBheWxvYWRcblx0XHRcdHwgUmVwbHlNZXNzYWdlT3B0aW9uc1xuXHRcdFx0fCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0bGV0IG5ld09wdGlvbnM6IFJlcGx5TWVzc2FnZU9wdGlvbnMgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyA9IHt9O1xuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRuZXdPcHRpb25zLmNvbnRlbnQgPSBvcHRpb25zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRuZXdPcHRpb25zID0gb3B0aW9ucztcblx0XHR9XG5cblx0XHRpZiAoXG5cdFx0XHQhdGhpcy5pc1NsYXNoICYmXG5cdFx0XHQhdGhpcy5zaG91bGRFZGl0ICYmXG5cdFx0XHQhKG5ld09wdGlvbnMgaW5zdGFuY2VvZiBNZXNzYWdlUGF5bG9hZCkgJiZcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdCF0aGlzLm1lc3NhZ2UuZGVsZXRlZFxuXHRcdCkge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0bmV3T3B0aW9ucy5yZXBseSA9IHtcblx0XHRcdFx0bWVzc2FnZVJlZmVyZW5jZTogdGhpcy5tZXNzYWdlLCAvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdGZhaWxJZk5vdEV4aXN0czogbmV3T3B0aW9ucy5mYWlsSWZOb3RFeGlzdHMgPz8gdHJ1ZVxuXHRcdFx0fTtcblx0XHR9IC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRyZXR1cm4gdGhpcy5zZW5kKG5ld09wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVkaXRzIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKiBJZiB0aGUgbWVzc2FnZSBpcyBhIHNsYXNoIGNvbW1hbmQsIGVkaXRzIHRoZSBzbGFzaCByZXNwb25zZS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBlZGl0KFxuXHRcdG9wdGlvbnM6XG5cdFx0XHR8IHN0cmluZ1xuXHRcdFx0fCBNZXNzYWdlRWRpdE9wdGlvbnNcblx0XHRcdHwgTWVzc2FnZVBheWxvYWRcblx0XHRcdHwgV2ViaG9va0VkaXRNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2U+IHtcblx0XHRpZiAodGhpcy5pc1NsYXNoKSB7XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UuaW50ZXJhY3Rpb24uZWRpdFJlcGx5KG9wdGlvbnMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UuZWRpdChvcHRpb25zKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyB0aGUgbGFzdCByZXNwb25zZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBkZWxldGUoKTogUHJvbWlzZTxNZXNzYWdlIHwgdm9pZD4ge1xuXHRcdGlmICh0aGlzLmlzU2xhc2gpIHtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdHJldHVybiB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24uZGVsZXRlUmVwbHkoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlPy5kZWxldGUoKTtcblx0XHR9XG5cdH1cbn1cbiJdfQ==
