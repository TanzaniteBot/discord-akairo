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
    async edit(options) {
        if (this.isSlash) {
            return this.lastResponse.interaction.editReply(options);
        }
        else {
            return this.lastResponse.edit(options);
        }
    }
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
            !Reflect.has(this.message, "deleted")) {
            // @ts-expect-error
            newOptions.reply = {
                messageReference: this.message,
                failIfNotExists: newOptions.failIfNotExists ?? true
            };
        }
        return this.send(newOptions);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsMkNBV29CO0FBSXBCOzs7O0dBSUc7QUFDSCxNQUFxQixXQUFXO0lBQy9CLFlBQ0MsT0FBdUIsRUFDdkIsT0FBZ0M7UUFFaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFFbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDTixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxvQkFBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOztPQUVHO0lBQ0ksT0FBTyxDQUFpQjtJQUUvQjs7T0FFRztJQUNJLE9BQU8sQ0FBVTtJQUV4Qjs7T0FFRztJQUNJLFlBQVksQ0FBVztJQUU5Qjs7T0FFRztJQUNJLE9BQU8sQ0FBMEI7SUFFeEM7O09BRUc7SUFDSSxRQUFRLENBQWtDO0lBRWpEOztPQUVHO0lBQ0ksTUFBTSxDQUF1QjtJQUVwQzs7T0FFRztJQUNJLFVBQVUsQ0FBVTtJQUUzQjs7O09BR0c7SUFDSSxVQUFVLENBQUMsT0FBNEI7UUFDN0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUMvQixJQUFJLEtBQUss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RDtBQTFQRCw4QkEwUEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSByZXF1aXJlLWF3YWl0ICovXG5pbXBvcnQgeyBBUElNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQtYXBpLXR5cGVzXCI7XG5pbXBvcnQge1xuXHRDb2xsZWN0aW9uLFxuXHRNZXNzYWdlUGF5bG9hZCxcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyxcblx0TWVzc2FnZSxcblx0TWVzc2FnZUVkaXRPcHRpb25zLFxuXHRNZXNzYWdlT3B0aW9ucyxcblx0UmVwbHlNZXNzYWdlT3B0aW9ucyxcblx0V2ViaG9va0VkaXRNZXNzYWdlT3B0aW9ucyxcblx0U25vd2ZsYWtlXG59IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgQWthaXJvTWVzc2FnZSBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9NZXNzYWdlXCI7XG5pbXBvcnQgQ29tbWFuZEhhbmRsZXIsIHsgUGFyc2VkQ29tcG9uZW50RGF0YSB9IGZyb20gXCIuL0NvbW1hbmRIYW5kbGVyXCI7XG5cbi8qKlxuICogQ29tbWFuZCB1dGlsaXRpZXMuXG4gKiBAcGFyYW0gaGFuZGxlciAtIFRoZSBjb21tYW5kIGhhbmRsZXIuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRVdGlsIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGhhbmRsZXI6IENvbW1hbmRIYW5kbGVyLFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlXG5cdCkge1xuXHRcdHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG5cblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXG5cdFx0dGhpcy5wYXJzZWQgPSBudWxsO1xuXG5cdFx0dGhpcy5zaG91bGRFZGl0ID0gZmFsc2U7XG5cblx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IG51bGw7XG5cblx0XHRpZiAodGhpcy5oYW5kbGVyLnN0b3JlTWVzc2FnZXMpIHtcblx0XHRcdHRoaXMubWVzc2FnZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1lc3NhZ2VzID0gbnVsbDtcblx0XHR9XG5cblx0XHR0aGlzLmlzU2xhc2ggPSAhISh0aGlzLm1lc3NhZ2UgaW5zdGFuY2VvZiBNZXNzYWdlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGhhbmRsZXI6IENvbW1hbmRIYW5kbGVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgY29tbWFuZCBpcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgaXNTbGFzaDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIGxhc3QgcmVzcG9uc2Ugc2VudC5cblx0ICovXG5cdHB1YmxpYyBsYXN0UmVzcG9uc2U/OiBNZXNzYWdlO1xuXG5cdC8qKlxuXHQgKiBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlO1xuXG5cdC8qKlxuXHQgKiBNZXNzYWdlcyBzdG9yZWQgZnJvbSBwcm9tcHRzIGFuZCBwcm9tcHQgcmVwbGllcy5cblx0ICovXG5cdHB1YmxpYyBtZXNzYWdlcz86IENvbGxlY3Rpb248U25vd2ZsYWtlLCBNZXNzYWdlPjtcblxuXHQvKipcblx0ICogVGhlIHBhcnNlZCBjb21wb25lbnRzLlxuXHQgKi9cblx0cHVibGljIHBhcnNlZD86IFBhcnNlZENvbXBvbmVudERhdGE7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoZSBsYXN0IHJlc3BvbnNlIHNob3VsZCBiZSBlZGl0ZWQuXG5cdCAqL1xuXHRwdWJsaWMgc2hvdWxkRWRpdDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQWRkcyBjbGllbnQgcHJvbXB0IG9yIHVzZXIgcmVwbHkgdG8gbWVzc2FnZXMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBhZGQuXG5cdCAqL1xuXHRwdWJsaWMgYWRkTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlIHwgTWVzc2FnZVtdKTogTWVzc2FnZSB8IE1lc3NhZ2VbXSB7XG5cdFx0aWYgKHRoaXMuaGFuZGxlci5zdG9yZU1lc3NhZ2VzKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlKSkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IG1zZyBvZiBtZXNzYWdlKSB7XG5cdFx0XHRcdFx0dGhpcy5tZXNzYWdlcz8uc2V0KG1zZy5pZCwgbXNnKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tZXNzYWdlcz8uc2V0KG1lc3NhZ2UuaWQsIG1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBtZXNzYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVkaXRzIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKiBJZiB0aGUgbWVzc2FnZSBpcyBhIHNsYXNoIGNvbW1hbmQsIGVkaXRzIHRoZSBzbGFzaCByZXNwb25zZS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBlZGl0KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VFZGl0T3B0aW9ucyB8IE1lc3NhZ2VQYXlsb2FkXG5cdCk6IFByb21pc2U8TWVzc2FnZT47XG5cdHB1YmxpYyBhc3luYyBlZGl0KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgV2ViaG9va0VkaXRNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0aWYgKHRoaXMuaXNTbGFzaCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLmxhc3RSZXNwb25zZSBhcyBhbnkgYXMgQWthaXJvTWVzc2FnZSkuaW50ZXJhY3Rpb24uZWRpdFJlcGx5KFxuXHRcdFx0XHRvcHRpb25zXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UuZWRpdChvcHRpb25zKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2VuZCBhbiBpbmxpbmUgcmVwbHkgb3IgcmVzcG9uZCB0byBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqIElmIHRoZSBtZXNzYWdlIGlzIGEgc2xhc2ggY29tbWFuZCwgaXQgcmVwbGllcyBvciBlZGl0cyB0aGUgbGFzdCByZXBseS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyByZXBseShcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IFJlcGx5TWVzc2FnZU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIHJlcGx5KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdGxldCBuZXdPcHRpb25zOiBSZXBseU1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMgPSB7fTtcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0bmV3T3B0aW9ucy5jb250ZW50ID0gb3B0aW9ucztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0bmV3T3B0aW9ucyA9IG9wdGlvbnM7XG5cdFx0fVxuXG5cdFx0aWYgKFxuXHRcdFx0IXRoaXMuaXNTbGFzaCAmJlxuXHRcdFx0IXRoaXMuc2hvdWxkRWRpdCAmJlxuXHRcdFx0IShuZXdPcHRpb25zIGluc3RhbmNlb2YgTWVzc2FnZVBheWxvYWQpICYmXG5cdFx0XHQhUmVmbGVjdC5oYXModGhpcy5tZXNzYWdlLCBcImRlbGV0ZWRcIilcblx0XHQpIHtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5ld09wdGlvbnMucmVwbHkgPSB7XG5cdFx0XHRcdG1lc3NhZ2VSZWZlcmVuY2U6IHRoaXMubWVzc2FnZSwgLy8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRmYWlsSWZOb3RFeGlzdHM6IG5ld09wdGlvbnMuZmFpbElmTm90RXhpc3RzID8/IHRydWVcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnNlbmQobmV3T3B0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogU2VuZHMgYSByZXNwb25zZSBvciBlZGl0cyBhbiBvbGQgcmVzcG9uc2UgaWYgYXZhaWxhYmxlLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHNlbmQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cblx0cHVibGljIGFzeW5jIHNlbmQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0Y29uc3QgaGFzRmlsZXMgPVxuXHRcdFx0dHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIgfHwgIW9wdGlvbnMuZmlsZXM/Lmxlbmd0aFxuXHRcdFx0XHQ/IGZhbHNlXG5cdFx0XHRcdDogb3B0aW9ucy5maWxlcz8ubGVuZ3RoID4gMDtcblxuXHRcdGxldCBuZXdPcHRpb25zOiBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zID0ge307XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRuZXdPcHRpb25zLmNvbnRlbnQgPSBvcHRpb25zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXdPcHRpb25zID0gb3B0aW9ucyBhcyBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zO1xuXHRcdH1cblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMgIT09IFwic3RyaW5nXCIpXG5cdFx0XHRcdGRlbGV0ZSAob3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZXBoZW1lcmFsO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR0aGlzLnNob3VsZEVkaXQgJiZcblx0XHRcdFx0IWhhc0ZpbGVzICYmXG5cdFx0XHRcdCF0aGlzLmxhc3RSZXNwb25zZS5kZWxldGVkICYmXG5cdFx0XHRcdCF0aGlzLmxhc3RSZXNwb25zZS5hdHRhY2htZW50cy5zaXplXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlLmVkaXQob3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cblx0XHRcdGNvbnN0IGxhc3RTZW50ID0gdGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCk7XG5cdFx0XHR0aGlzLnNldEVkaXRhYmxlKCFsYXN0U2VudC5hdHRhY2htZW50cy5zaXplKTtcblxuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gXCJzdHJpbmdcIikgZGVsZXRlIChvcHRpb25zIGFzIE1lc3NhZ2VPcHRpb25zKS5yZXBseTtcblx0XHRcdGlmIChcblx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgfHxcblx0XHRcdFx0dGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmRlZmVycmVkIHx8XG5cdFx0XHRcdHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5yZXBsaWVkXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmVkaXRSZXBseShcblx0XHRcdFx0XHRvcHRpb25zXG5cdFx0XHRcdCkpIGFzIE1lc3NhZ2U7XG5cdFx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghKG5ld09wdGlvbnMgYXMgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMpLmVwaGVtZXJhbCkge1xuXHRcdFx0XHRcdChuZXdPcHRpb25zIGFzIEludGVyYWN0aW9uUmVwbHlPcHRpb25zKS5mZXRjaFJlcGx5ID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IChhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbHkoXG5cdFx0XHRcdFx0XHRuZXdPcHRpb25zXG5cdFx0XHRcdFx0KSkgYXMgdW5rbm93biBhcyBNZXNzYWdlO1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbHkobmV3T3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2UsIG92ZXJ3cml0aW5nIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHNlbmROZXcoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgc2VuZE5ldyhcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cdFx0XHRjb25zdCBsYXN0U2VudCA9IHRoaXMuc2V0TGFzdFJlc3BvbnNlKHNlbnQpO1xuXHRcdFx0dGhpcy5zZXRFZGl0YWJsZSghbGFzdFNlbnQuYXR0YWNobWVudHMuc2l6ZSk7XG5cdFx0XHRyZXR1cm4gc2VudDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgc2VudCA9IChhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24uZm9sbG93VXAoXG5cdFx0XHRcdG9wdGlvbnNcblx0XHRcdCkpIGFzIE1lc3NhZ2U7XG5cdFx0XHR0aGlzLnNldExhc3RSZXNwb25zZShzZW50KTtcblx0XHRcdHJldHVybiBzZW50O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIGlmIHRoZSBtZXNzYWdlIHNob3VsZCBiZSBlZGl0ZWQuXG5cdCAqIEBwYXJhbSBzdGF0ZSAtIENoYW5nZSB0byBlZGl0YWJsZSBvciBub3QuXG5cdCAqL1xuXHRwdWJsaWMgc2V0RWRpdGFibGUoc3RhdGU6IGJvb2xlYW4pOiBDb21tYW5kVXRpbCB7XG5cdFx0dGhpcy5zaG91bGRFZGl0ID0gQm9vbGVhbihzdGF0ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgbGFzdCByZXNwb25zZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgbGFzdCByZXNwb25zZS5cblx0ICovXG5cdHB1YmxpYyBzZXRMYXN0UmVzcG9uc2UobWVzc2FnZTogTWVzc2FnZSk6IE1lc3NhZ2Uge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG5cdFx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IG1lc3NhZ2Uuc2xpY2UoLTEpWzBdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IG1lc3NhZ2U7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZSBhcyBNZXNzYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgZGVsZXRlKCk6IFByb21pc2U8TWVzc2FnZSB8IHZvaWQ+IHtcblx0XHRpZiAodGhpcy5pc1NsYXNoKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMubWVzc2FnZSBhcyBBa2Fpcm9NZXNzYWdlKS5pbnRlcmFjdGlvbi5kZWxldGVSZXBseSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2U/LmRlbGV0ZSgpO1xuXHRcdH1cblx0fVxufVxuIl19