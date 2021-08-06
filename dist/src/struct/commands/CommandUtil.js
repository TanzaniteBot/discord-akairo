"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const AkairoMessage_1 = __importDefault(require("../../util/AkairoMessage"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsMkNBV29CO0FBQ3BCLDZFQUFxRDtBQUdyRDs7OztHQUlHO0FBQ0gsTUFBcUIsV0FBVztJQUMvQixZQUNDLE9BQXVCLEVBQ3ZCLE9BQWdDO1FBRWhDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRW5CLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBRXhCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBRXpCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7WUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztTQUNqQzthQUFNO1lBQ04sSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDckI7UUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLFlBQVksdUJBQWEsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPLENBQWlCO0lBRS9COztPQUVHO0lBQ0ksT0FBTyxDQUFVO0lBRXhCOztPQUVHO0lBQ0ksWUFBWSxDQUFXO0lBRTlCOztPQUVHO0lBQ0ksT0FBTyxDQUEwQjtJQUV4Qzs7T0FFRztJQUNJLFFBQVEsQ0FBa0M7SUFFakQ7O09BRUc7SUFDSSxNQUFNLENBQXVCO0lBRXBDOztPQUVHO0lBQ0ksVUFBVSxDQUFVO0lBRTNCOzs7T0FHRztJQUNJLFVBQVUsQ0FBQyxPQUE0QjtRQUM3QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQy9CLElBQUksS0FBSyxDQUFD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QUMsT0FBeUIsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDakU7YUFBTTtZQUNOLE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsQ0FBQztTQUNuQztJQUNGLENBQUM7Q0FDRDtBQTlRRCw4QkE4UUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSByZXF1aXJlLWF3YWl0ICovXG5pbXBvcnQgeyBBUElNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQtYXBpLXR5cGVzXCI7XG5pbXBvcnQge1xuXHRDb2xsZWN0aW9uLFxuXHRNZXNzYWdlUGF5bG9hZCxcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyxcblx0TWVzc2FnZSxcblx0TWVzc2FnZUVkaXRPcHRpb25zLFxuXHRNZXNzYWdlT3B0aW9ucyxcblx0UmVwbHlNZXNzYWdlT3B0aW9ucyxcblx0V2ViaG9va0VkaXRNZXNzYWdlT3B0aW9ucyxcblx0U25vd2ZsYWtlXG59IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgQWthaXJvTWVzc2FnZSBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9NZXNzYWdlXCI7XG5pbXBvcnQgQ29tbWFuZEhhbmRsZXIsIHsgUGFyc2VkQ29tcG9uZW50RGF0YSB9IGZyb20gXCIuL0NvbW1hbmRIYW5kbGVyXCI7XG5cbi8qKlxuICogQ29tbWFuZCB1dGlsaXRpZXMuXG4gKiBAcGFyYW0gaGFuZGxlciAtIFRoZSBjb21tYW5kIGhhbmRsZXIuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRVdGlsIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGhhbmRsZXI6IENvbW1hbmRIYW5kbGVyLFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlXG5cdCkge1xuXHRcdHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG5cblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXG5cdFx0dGhpcy5wYXJzZWQgPSBudWxsO1xuXG5cdFx0dGhpcy5zaG91bGRFZGl0ID0gZmFsc2U7XG5cblx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IG51bGw7XG5cblx0XHRpZiAodGhpcy5oYW5kbGVyLnN0b3JlTWVzc2FnZXMpIHtcblx0XHRcdHRoaXMubWVzc2FnZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1lc3NhZ2VzID0gbnVsbDtcblx0XHR9XG5cblx0XHR0aGlzLmlzU2xhc2ggPSB0aGlzLm1lc3NhZ2UgaW5zdGFuY2VvZiBBa2Fpcm9NZXNzYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgaGFuZGxlcjogQ29tbWFuZEhhbmRsZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBpc1NsYXNoOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgbGFzdCByZXNwb25zZSBzZW50LlxuXHQgKi9cblx0cHVibGljIGxhc3RSZXNwb25zZT86IE1lc3NhZ2U7XG5cblx0LyoqXG5cdCAqIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgbWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2U7XG5cblx0LyoqXG5cdCAqIE1lc3NhZ2VzIHN0b3JlZCBmcm9tIHByb21wdHMgYW5kIHByb21wdCByZXBsaWVzLlxuXHQgKi9cblx0cHVibGljIG1lc3NhZ2VzPzogQ29sbGVjdGlvbjxTbm93Zmxha2UsIE1lc3NhZ2U+O1xuXG5cdC8qKlxuXHQgKiBUaGUgcGFyc2VkIGNvbXBvbmVudHMuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VkPzogUGFyc2VkQ29tcG9uZW50RGF0YTtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGxhc3QgcmVzcG9uc2Ugc2hvdWxkIGJlIGVkaXRlZC5cblx0ICovXG5cdHB1YmxpYyBzaG91bGRFZGl0OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBBZGRzIGNsaWVudCBwcm9tcHQgb3IgdXNlciByZXBseSB0byBtZXNzYWdlcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGFkZC5cblx0ICovXG5cdHB1YmxpYyBhZGRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UgfCBNZXNzYWdlW10pOiBNZXNzYWdlIHwgTWVzc2FnZVtdIHtcblx0XHRpZiAodGhpcy5oYW5kbGVyLnN0b3JlTWVzc2FnZXMpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgbXNnIG9mIG1lc3NhZ2UpIHtcblx0XHRcdFx0XHR0aGlzLm1lc3NhZ2VzPy5zZXQobXNnLmlkLCBtc2cpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1lc3NhZ2VzPy5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogRWRpdHMgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIElmIHRoZSBtZXNzYWdlIGlzIGEgc2xhc2ggY29tbWFuZCwgZWRpdHMgdGhlIHNsYXNoIHJlc3BvbnNlLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0LyogcHVibGljIGFzeW5jIGVkaXQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZUVkaXRPcHRpb25zIHwgTWVzc2FnZVBheWxvYWRcblx0KTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIGVkaXQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBXZWJob29rRWRpdE1lc3NhZ2VPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+ICovXG5cdHB1YmxpYyBhc3luYyBlZGl0KFxuXHRcdG9wdGlvbnM6XG5cdFx0XHR8IHN0cmluZ1xuXHRcdFx0fCBNZXNzYWdlRWRpdE9wdGlvbnNcblx0XHRcdHwgTWVzc2FnZVBheWxvYWRcblx0XHRcdHwgV2ViaG9va0VkaXRNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0aWYgKHRoaXMuaXNTbGFzaCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLmxhc3RSZXNwb25zZSBhcyBhbnkgYXMgQWthaXJvTWVzc2FnZSkuaW50ZXJhY3Rpb24uZWRpdFJlcGx5KFxuXHRcdFx0XHRvcHRpb25zXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UuZWRpdChvcHRpb25zKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2VuZCBhbiBpbmxpbmUgcmVwbHkgb3IgcmVzcG9uZCB0byBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqIElmIHRoZSBtZXNzYWdlIGlzIGEgc2xhc2ggY29tbWFuZCwgaXQgcmVwbGllcyBvciBlZGl0cyB0aGUgbGFzdCByZXBseS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdC8qIHB1YmxpYyBhc3luYyByZXBseShcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IFJlcGx5TWVzc2FnZU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIHJlcGx5KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4gKi9cblx0cHVibGljIGFzeW5jIHJlcGx5KFxuXHRcdG9wdGlvbnM6XG5cdFx0XHR8IHN0cmluZ1xuXHRcdFx0fCBNZXNzYWdlUGF5bG9hZFxuXHRcdFx0fCBSZXBseU1lc3NhZ2VPcHRpb25zXG5cdFx0XHR8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRsZXQgbmV3T3B0aW9uczogUmVwbHlNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zID0ge307XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09IFwic3RyaW5nXCIpIHtcblx0XHRcdG5ld09wdGlvbnMuY29udGVudCA9IG9wdGlvbnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5ld09wdGlvbnMgPSBvcHRpb25zO1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdCF0aGlzLmlzU2xhc2ggJiZcblx0XHRcdCF0aGlzLnNob3VsZEVkaXQgJiZcblx0XHRcdCEobmV3T3B0aW9ucyBpbnN0YW5jZW9mIE1lc3NhZ2VQYXlsb2FkKSAmJlxuXHRcdFx0IVJlZmxlY3QuaGFzKHRoaXMubWVzc2FnZSwgXCJkZWxldGVkXCIpXG5cdFx0KSB7XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRuZXdPcHRpb25zLnJlcGx5ID0ge1xuXHRcdFx0XHRtZXNzYWdlUmVmZXJlbmNlOiB0aGlzLm1lc3NhZ2UsIC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0ZmFpbElmTm90RXhpc3RzOiBuZXdPcHRpb25zLmZhaWxJZk5vdEV4aXN0cyA/PyB0cnVlXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5zZW5kKG5ld09wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2Ugb3IgZWRpdHMgYW4gb2xkIHJlc3BvbnNlIGlmIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdC8qIHB1YmxpYyBhc3luYyBzZW5kKFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIHNlbmQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHRcdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+ICovXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuXHRwdWJsaWMgYXN5bmMgc2VuZChcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdGNvbnN0IGhhc0ZpbGVzID1cblx0XHRcdHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiIHx8ICFvcHRpb25zLmZpbGVzPy5sZW5ndGhcblx0XHRcdFx0PyBmYWxzZVxuXHRcdFx0XHQ6IG9wdGlvbnMuZmlsZXM/Lmxlbmd0aCA+IDA7XG5cblx0XHRsZXQgbmV3T3B0aW9uczogTWVzc2FnZU9wdGlvbnMgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyA9IHt9O1xuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0bmV3T3B0aW9ucy5jb250ZW50ID0gb3B0aW9ucztcblx0XHR9IGVsc2Uge1xuXHRcdFx0bmV3T3B0aW9ucyA9IG9wdGlvbnMgYXMgTWVzc2FnZU9wdGlvbnMgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucztcblx0XHR9XG5cdFx0aWYgKCEodGhpcy5tZXNzYWdlLmludGVyYWN0aW9uIGluc3RhbmNlb2YgQ29tbWFuZEludGVyYWN0aW9uKSkge1xuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zICE9PSBcInN0cmluZ1wiKVxuXHRcdFx0XHRkZWxldGUgKG9wdGlvbnMgYXMgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMpLmVwaGVtZXJhbDtcblx0XHRcdGlmIChcblx0XHRcdFx0dGhpcy5zaG91bGRFZGl0ICYmXG5cdFx0XHRcdCFoYXNGaWxlcyAmJlxuXHRcdFx0XHQhdGhpcy5sYXN0UmVzcG9uc2UuZGVsZXRlZCAmJlxuXHRcdFx0XHQhdGhpcy5sYXN0UmVzcG9uc2UuYXR0YWNobWVudHMuc2l6ZVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZS5lZGl0KG9wdGlvbnMpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qgc2VudCA9IGF3YWl0IHRoaXMubWVzc2FnZS5jaGFubmVsPy5zZW5kKG9wdGlvbnMpO1xuXG5cdFx0XHRjb25zdCBsYXN0U2VudCA9IHRoaXMuc2V0TGFzdFJlc3BvbnNlKHNlbnQpO1xuXHRcdFx0dGhpcy5zZXRFZGl0YWJsZSghbGFzdFNlbnQuYXR0YWNobWVudHMuc2l6ZSk7XG5cblx0XHRcdHJldHVybiBzZW50O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMgIT09IFwic3RyaW5nXCIpIGRlbGV0ZSAob3B0aW9ucyBhcyBNZXNzYWdlT3B0aW9ucykucmVwbHk7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHRoaXMubGFzdFJlc3BvbnNlIHx8XG5cdFx0XHRcdHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5kZWZlcnJlZCB8fFxuXHRcdFx0XHR0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbGllZFxuXHRcdFx0KSB7XG5cdFx0XHRcdHRoaXMubGFzdFJlc3BvbnNlID0gKGF3YWl0IHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5lZGl0UmVwbHkoXG5cdFx0XHRcdFx0b3B0aW9uc1xuXHRcdFx0XHQpKSBhcyBNZXNzYWdlO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIShuZXdPcHRpb25zIGFzIEludGVyYWN0aW9uUmVwbHlPcHRpb25zKS5lcGhlbWVyYWwpIHtcblx0XHRcdFx0XHQobmV3T3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZmV0Y2hSZXBseSA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLnJlcGx5KFxuXHRcdFx0XHRcdFx0bmV3T3B0aW9uc1xuXHRcdFx0XHRcdCkpIGFzIHVua25vd24gYXMgTWVzc2FnZTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0YXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLnJlcGx5KG5ld09wdGlvbnMpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kcyBhIHJlc3BvbnNlLCBvdmVyd3JpdGluZyB0aGUgbGFzdCByZXNwb25zZS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdC8qIHB1YmxpYyBhc3luYyBzZW5kTmV3KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIHNlbmROZXcoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiAqL1xuXHRwdWJsaWMgYXN5bmMgc2VuZE5ldyhcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdGlmICghKHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbiBpbnN0YW5jZW9mIENvbW1hbmRJbnRlcmFjdGlvbikpIHtcblx0XHRcdGNvbnN0IHNlbnQgPSBhd2FpdCB0aGlzLm1lc3NhZ2UuY2hhbm5lbD8uc2VuZChvcHRpb25zKTtcblx0XHRcdGNvbnN0IGxhc3RTZW50ID0gdGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCk7XG5cdFx0XHR0aGlzLnNldEVkaXRhYmxlKCFsYXN0U2VudC5hdHRhY2htZW50cy5zaXplKTtcblx0XHRcdHJldHVybiBzZW50O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBzZW50ID0gKGF3YWl0IHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5mb2xsb3dVcChcblx0XHRcdFx0b3B0aW9uc1xuXHRcdFx0KSkgYXMgTWVzc2FnZTtcblx0XHRcdHRoaXMuc2V0TGFzdFJlc3BvbnNlKHNlbnQpO1xuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENoYW5nZXMgaWYgdGhlIG1lc3NhZ2Ugc2hvdWxkIGJlIGVkaXRlZC5cblx0ICogQHBhcmFtIHN0YXRlIC0gQ2hhbmdlIHRvIGVkaXRhYmxlIG9yIG5vdC5cblx0ICovXG5cdHB1YmxpYyBzZXRFZGl0YWJsZShzdGF0ZTogYm9vbGVhbik6IENvbW1hbmRVdGlsIHtcblx0XHR0aGlzLnNob3VsZEVkaXQgPSBCb29sZWFuKHN0YXRlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKi9cblx0cHVibGljIHNldExhc3RSZXNwb25zZShtZXNzYWdlOiBNZXNzYWdlKTogTWVzc2FnZSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZSkpIHtcblx0XHRcdHRoaXMubGFzdFJlc3BvbnNlID0gbWVzc2FnZS5zbGljZSgtMSlbMF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubGFzdFJlc3BvbnNlID0gbWVzc2FnZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlIGFzIE1lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyB0aGUgbGFzdCByZXNwb25zZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBkZWxldGUoKTogUHJvbWlzZTxNZXNzYWdlIHwgdm9pZD4ge1xuXHRcdGlmICh0aGlzLmlzU2xhc2gpIHtcblx0XHRcdHJldHVybiAodGhpcy5tZXNzYWdlIGFzIEFrYWlyb01lc3NhZ2UpLmludGVyYWN0aW9uLmRlbGV0ZVJlcGx5KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZT8uZGVsZXRlKCk7XG5cdFx0fVxuXHR9XG59XG4iXX0=