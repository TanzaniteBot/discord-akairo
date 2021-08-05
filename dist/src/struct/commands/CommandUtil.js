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
    /**
     * Edits the last response.
     * If the message is a slash command, edits the slash response.
     * @param options - Options to use.
     */
    /* public async edit(
        options: string | MessageEditOptions | MessagePayload
    ): Promise<Message>;
    public async edit(
        options: string | MessagePayload | WebhookEditMessageOptions
    ): Promise<Message | APIMessage> */
    async edit(options) {
        if (this.isSlash) {
            return this.lastResponse.interaction.editReply(options);
        }
        else {
            return this.lastResponse.edit(options);
        }
    }
    /**
     * Send an inline reply or respond to a slash command.
     * If the message is a slash command, it replies or edits the last reply.
     * @param options - Options to use.
     */
    /* public async reply(
        options: string | MessagePayload | ReplyMessageOptions
    ): Promise<Message>;
    public async reply(
        options: string | MessagePayload | InteractionReplyOptions
    ): Promise<Message | APIMessage> */
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
    /**
     * Sends a response or edits an old response if available.
     * @param options - Options to use.
     */
    /* public async send(
        options: string | MessagePayload | MessageOptions
    ): Promise<Message>;
    public async send(
        options: string | MessagePayload | InteractionReplyOptions
        ): Promise<Message | APIMessage> */
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
    /* public async sendNew(
        options: string | MessagePayload | MessageOptions
    ): Promise<Message>;
    public async sendNew(
        options: string | MessagePayload | InteractionReplyOptions
    ): Promise<Message | APIMessage> */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsMkNBV29CO0FBSXBCOzs7O0dBSUc7QUFDSCxNQUFxQixXQUFXO0lBQy9CLFlBQ0MsT0FBdUIsRUFDdkIsT0FBZ0M7UUFFaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFFbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDTixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxvQkFBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOztPQUVHO0lBQ0ksT0FBTyxDQUFpQjtJQUUvQjs7T0FFRztJQUNJLE9BQU8sQ0FBVTtJQUV4Qjs7T0FFRztJQUNJLFlBQVksQ0FBVztJQUU5Qjs7T0FFRztJQUNJLE9BQU8sQ0FBMEI7SUFFeEM7O09BRUc7SUFDSSxRQUFRLENBQWtDO0lBRWpEOztPQUVHO0lBQ0ksTUFBTSxDQUF1QjtJQUVwQzs7T0FFRztJQUNJLFVBQVUsQ0FBVTtJQUUzQjs7O09BR0c7SUFDSSxVQUFVLENBQUMsT0FBNEI7UUFDN0MsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUMvQixJQUFJLEtBQUss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SSxDQUFDLE9BQXlCLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ2pFO2FBQU07WUFDTixPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUM7U0FDbkM7SUFDRixDQUFDO0NBQ0Q7QUE5UUQsOEJBOFFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgcmVxdWlyZS1hd2FpdCAqL1xuaW1wb3J0IHsgQVBJTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLWFwaS10eXBlc1wiO1xuaW1wb3J0IHtcblx0Q29sbGVjdGlvbixcblx0TWVzc2FnZVBheWxvYWQsXG5cdENvbW1hbmRJbnRlcmFjdGlvbixcblx0SW50ZXJhY3Rpb25SZXBseU9wdGlvbnMsXG5cdE1lc3NhZ2UsXG5cdE1lc3NhZ2VFZGl0T3B0aW9ucyxcblx0TWVzc2FnZU9wdGlvbnMsXG5cdFJlcGx5TWVzc2FnZU9wdGlvbnMsXG5cdFdlYmhvb2tFZGl0TWVzc2FnZU9wdGlvbnMsXG5cdFNub3dmbGFrZVxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEFrYWlyb01lc3NhZ2UgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvTWVzc2FnZVwiO1xuaW1wb3J0IENvbW1hbmRIYW5kbGVyLCB7IFBhcnNlZENvbXBvbmVudERhdGEgfSBmcm9tIFwiLi9Db21tYW5kSGFuZGxlclwiO1xuXG4vKipcbiAqIENvbW1hbmQgdXRpbGl0aWVzLlxuICogQHBhcmFtIGhhbmRsZXIgLSBUaGUgY29tbWFuZCBoYW5kbGVyLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kVXRpbCB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRoYW5kbGVyOiBDb21tYW5kSGFuZGxlcixcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZVxuXHQpIHtcblx0XHR0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xuXG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblxuXHRcdHRoaXMucGFyc2VkID0gbnVsbDtcblxuXHRcdHRoaXMuc2hvdWxkRWRpdCA9IGZhbHNlO1xuXG5cdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBudWxsO1xuXG5cdFx0aWYgKHRoaXMuaGFuZGxlci5zdG9yZU1lc3NhZ2VzKSB7XG5cdFx0XHR0aGlzLm1lc3NhZ2VzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tZXNzYWdlcyA9IG51bGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5pc1NsYXNoID0gISEodGhpcy5tZXNzYWdlIGluc3RhbmNlb2YgTWVzc2FnZSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBoYW5kbGVyOiBDb21tYW5kSGFuZGxlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGlzU2xhc2g6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBsYXN0IHJlc3BvbnNlIHNlbnQuXG5cdCAqL1xuXHRwdWJsaWMgbGFzdFJlc3BvbnNlPzogTWVzc2FnZTtcblxuXHQvKipcblx0ICogTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZTtcblxuXHQvKipcblx0ICogTWVzc2FnZXMgc3RvcmVkIGZyb20gcHJvbXB0cyBhbmQgcHJvbXB0IHJlcGxpZXMuXG5cdCAqL1xuXHRwdWJsaWMgbWVzc2FnZXM/OiBDb2xsZWN0aW9uPFNub3dmbGFrZSwgTWVzc2FnZT47XG5cblx0LyoqXG5cdCAqIFRoZSBwYXJzZWQgY29tcG9uZW50cy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZWQ/OiBQYXJzZWRDb21wb25lbnREYXRhO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgbGFzdCByZXNwb25zZSBzaG91bGQgYmUgZWRpdGVkLlxuXHQgKi9cblx0cHVibGljIHNob3VsZEVkaXQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFkZHMgY2xpZW50IHByb21wdCBvciB1c2VyIHJlcGx5IHRvIG1lc3NhZ2VzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gYWRkLlxuXHQgKi9cblx0cHVibGljIGFkZE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSB8IE1lc3NhZ2VbXSk6IE1lc3NhZ2UgfCBNZXNzYWdlW10ge1xuXHRcdGlmICh0aGlzLmhhbmRsZXIuc3RvcmVNZXNzYWdlcykge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZSkpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBtc2cgb2YgbWVzc2FnZSkge1xuXHRcdFx0XHRcdHRoaXMubWVzc2FnZXM/LnNldChtc2cuaWQsIG1zZyk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubWVzc2FnZXM/LnNldChtZXNzYWdlLmlkLCBtZXNzYWdlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFZGl0cyB0aGUgbGFzdCByZXNwb25zZS5cblx0ICogSWYgdGhlIG1lc3NhZ2UgaXMgYSBzbGFzaCBjb21tYW5kLCBlZGl0cyB0aGUgc2xhc2ggcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyB0byB1c2UuXG5cdCAqL1xuXHQvKiBwdWJsaWMgYXN5bmMgZWRpdChcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlRWRpdE9wdGlvbnMgfCBNZXNzYWdlUGF5bG9hZFxuXHQpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgZWRpdChcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IFdlYmhvb2tFZGl0TWVzc2FnZU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4gKi9cblx0cHVibGljIGFzeW5jIGVkaXQoXG5cdFx0b3B0aW9uczpcblx0XHRcdHwgc3RyaW5nXG5cdFx0XHR8IE1lc3NhZ2VFZGl0T3B0aW9uc1xuXHRcdFx0fCBNZXNzYWdlUGF5bG9hZFxuXHRcdFx0fCBXZWJob29rRWRpdE1lc3NhZ2VPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRpZiAodGhpcy5pc1NsYXNoKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMubGFzdFJlc3BvbnNlIGFzIGFueSBhcyBBa2Fpcm9NZXNzYWdlKS5pbnRlcmFjdGlvbi5lZGl0UmVwbHkoXG5cdFx0XHRcdG9wdGlvbnNcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZS5lZGl0KG9wdGlvbnMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kIGFuIGlubGluZSByZXBseSBvciByZXNwb25kIHRvIGEgc2xhc2ggY29tbWFuZC5cblx0ICogSWYgdGhlIG1lc3NhZ2UgaXMgYSBzbGFzaCBjb21tYW5kLCBpdCByZXBsaWVzIG9yIGVkaXRzIHRoZSBsYXN0IHJlcGx5LlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0LyogcHVibGljIGFzeW5jIHJlcGx5KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgUmVwbHlNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgcmVwbHkoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiAqL1xuXHRwdWJsaWMgYXN5bmMgcmVwbHkoXG5cdFx0b3B0aW9uczpcblx0XHRcdHwgc3RyaW5nXG5cdFx0XHR8IE1lc3NhZ2VQYXlsb2FkXG5cdFx0XHR8IFJlcGx5TWVzc2FnZU9wdGlvbnNcblx0XHRcdHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdGxldCBuZXdPcHRpb25zOiBSZXBseU1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMgPSB7fTtcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0bmV3T3B0aW9ucy5jb250ZW50ID0gb3B0aW9ucztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0bmV3T3B0aW9ucyA9IG9wdGlvbnM7XG5cdFx0fVxuXG5cdFx0aWYgKFxuXHRcdFx0IXRoaXMuaXNTbGFzaCAmJlxuXHRcdFx0IXRoaXMuc2hvdWxkRWRpdCAmJlxuXHRcdFx0IShuZXdPcHRpb25zIGluc3RhbmNlb2YgTWVzc2FnZVBheWxvYWQpICYmXG5cdFx0XHQhUmVmbGVjdC5oYXModGhpcy5tZXNzYWdlLCBcImRlbGV0ZWRcIilcblx0XHQpIHtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5ld09wdGlvbnMucmVwbHkgPSB7XG5cdFx0XHRcdG1lc3NhZ2VSZWZlcmVuY2U6IHRoaXMubWVzc2FnZSwgLy8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRmYWlsSWZOb3RFeGlzdHM6IG5ld09wdGlvbnMuZmFpbElmTm90RXhpc3RzID8/IHRydWVcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnNlbmQobmV3T3B0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogU2VuZHMgYSByZXNwb25zZSBvciBlZGl0cyBhbiBvbGQgcmVzcG9uc2UgaWYgYXZhaWxhYmxlLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0LyogcHVibGljIGFzeW5jIHNlbmQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgc2VuZChcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zXG5cdFx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4gKi9cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG5cdHB1YmxpYyBhc3luYyBzZW5kKFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0Y29uc3QgaGFzRmlsZXMgPVxuXHRcdFx0dHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIgfHwgIW9wdGlvbnMuZmlsZXM/Lmxlbmd0aFxuXHRcdFx0XHQ/IGZhbHNlXG5cdFx0XHRcdDogb3B0aW9ucy5maWxlcz8ubGVuZ3RoID4gMDtcblxuXHRcdGxldCBuZXdPcHRpb25zOiBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zID0ge307XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRuZXdPcHRpb25zLmNvbnRlbnQgPSBvcHRpb25zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXdPcHRpb25zID0gb3B0aW9ucyBhcyBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zO1xuXHRcdH1cblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMgIT09IFwic3RyaW5nXCIpXG5cdFx0XHRcdGRlbGV0ZSAob3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZXBoZW1lcmFsO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR0aGlzLnNob3VsZEVkaXQgJiZcblx0XHRcdFx0IWhhc0ZpbGVzICYmXG5cdFx0XHRcdCF0aGlzLmxhc3RSZXNwb25zZS5kZWxldGVkICYmXG5cdFx0XHRcdCF0aGlzLmxhc3RSZXNwb25zZS5hdHRhY2htZW50cy5zaXplXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlLmVkaXQob3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cblx0XHRcdGNvbnN0IGxhc3RTZW50ID0gdGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCk7XG5cdFx0XHR0aGlzLnNldEVkaXRhYmxlKCFsYXN0U2VudC5hdHRhY2htZW50cy5zaXplKTtcblxuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gXCJzdHJpbmdcIikgZGVsZXRlIChvcHRpb25zIGFzIE1lc3NhZ2VPcHRpb25zKS5yZXBseTtcblx0XHRcdGlmIChcblx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgfHxcblx0XHRcdFx0dGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmRlZmVycmVkIHx8XG5cdFx0XHRcdHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5yZXBsaWVkXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmVkaXRSZXBseShcblx0XHRcdFx0XHRvcHRpb25zXG5cdFx0XHRcdCkpIGFzIE1lc3NhZ2U7XG5cdFx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghKG5ld09wdGlvbnMgYXMgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMpLmVwaGVtZXJhbCkge1xuXHRcdFx0XHRcdChuZXdPcHRpb25zIGFzIEludGVyYWN0aW9uUmVwbHlPcHRpb25zKS5mZXRjaFJlcGx5ID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IChhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbHkoXG5cdFx0XHRcdFx0XHRuZXdPcHRpb25zXG5cdFx0XHRcdFx0KSkgYXMgdW5rbm93biBhcyBNZXNzYWdlO1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbHkobmV3T3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2UsIG92ZXJ3cml0aW5nIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0LyogcHVibGljIGFzeW5jIHNlbmROZXcoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgc2VuZE5ldyhcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+ICovXG5cdHB1YmxpYyBhc3luYyBzZW5kTmV3KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0aWYgKCEodGhpcy5tZXNzYWdlLmludGVyYWN0aW9uIGluc3RhbmNlb2YgQ29tbWFuZEludGVyYWN0aW9uKSkge1xuXHRcdFx0Y29uc3Qgc2VudCA9IGF3YWl0IHRoaXMubWVzc2FnZS5jaGFubmVsPy5zZW5kKG9wdGlvbnMpO1xuXHRcdFx0Y29uc3QgbGFzdFNlbnQgPSB0aGlzLnNldExhc3RSZXNwb25zZShzZW50KTtcblx0XHRcdHRoaXMuc2V0RWRpdGFibGUoIWxhc3RTZW50LmF0dGFjaG1lbnRzLnNpemUpO1xuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNlbnQgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmZvbGxvd1VwKFxuXHRcdFx0XHRvcHRpb25zXG5cdFx0XHQpKSBhcyBNZXNzYWdlO1xuXHRcdFx0dGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCk7XG5cdFx0XHRyZXR1cm4gc2VudDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyBpZiB0aGUgbWVzc2FnZSBzaG91bGQgYmUgZWRpdGVkLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBDaGFuZ2UgdG8gZWRpdGFibGUgb3Igbm90LlxuXHQgKi9cblx0cHVibGljIHNldEVkaXRhYmxlKHN0YXRlOiBib29sZWFuKTogQ29tbWFuZFV0aWwge1xuXHRcdHRoaXMuc2hvdWxkRWRpdCA9IEJvb2xlYW4oc3RhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqL1xuXHRwdWJsaWMgc2V0TGFzdFJlc3BvbnNlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBNZXNzYWdlIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlKSkge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlLnNsaWNlKC0xKVswXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UgYXMgTWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGRlbGV0ZSgpOiBQcm9taXNlPE1lc3NhZ2UgfCB2b2lkPiB7XG5cdFx0aWYgKHRoaXMuaXNTbGFzaCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLm1lc3NhZ2UgYXMgQWthaXJvTWVzc2FnZSkuaW50ZXJhY3Rpb24uZGVsZXRlUmVwbHkoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlPy5kZWxldGUoKTtcblx0XHR9XG5cdH1cbn1cbiJdfQ==