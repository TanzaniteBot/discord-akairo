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
        if (this.handler instanceof CommandHandler_1.default && this.handler.storeMessages) {
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
        const hasFiles = typeof options === "string" || !options.files?.length ? false : options.files?.length > 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsMkNBV29CO0FBQ3BCLDZFQUFxRDtBQUVyRCxzRUFBdUU7QUFFdkU7Ozs7R0FJRztBQUNILE1BQXFCLFdBQVc7SUFDL0IsWUFBbUIsT0FBbUQsRUFBRSxPQUFnQztRQUN2RyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUVuQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUV4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUV6QixJQUFJLElBQUksQ0FBQyxPQUFPLFlBQVksd0JBQWMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUN6RSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDTixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sWUFBWSx1QkFBYSxDQUFDO0lBQ3RELENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU8sQ0FBNkM7SUFFM0Q7O09BRUc7SUFDSSxPQUFPLENBQVU7SUFFeEI7O09BRUc7SUFDSSxZQUFZLENBQVc7SUFFOUI7O09BRUc7SUFDSSxPQUFPLENBQTBCO0lBRXhDOztPQUVHO0lBQ0ksUUFBUSxDQUFrQztJQUVqRDs7T0FFRztJQUNJLE1BQU0sQ0FBdUI7SUFFcEM7O09BRUc7SUFDSSxVQUFVLENBQVU7SUFFM0I7OztPQUdHO0lBQ0ksVUFBVSxDQUFDLE9BQTRCO1FBQzdDLElBQUksSUFBSSxD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S0FBSyxDQUFDLE1BQU07UUFDbEIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2pCLE9BQVEsSUFBSSxDQUFDLE9BQXlCLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ2pFO2FBQU07WUFDTixPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLENBQUM7U0FDbkM7SUFDRixDQUFDO0NBQ0Q7QUE5T0QsOEJBOE9DIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgcmVxdWlyZS1hd2FpdCAqL1xuaW1wb3J0IHsgQVBJTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLWFwaS10eXBlc1wiO1xuaW1wb3J0IHtcblx0Q29sbGVjdGlvbixcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyxcblx0TWVzc2FnZSxcblx0TWVzc2FnZUVkaXRPcHRpb25zLFxuXHRNZXNzYWdlT3B0aW9ucyxcblx0TWVzc2FnZVBheWxvYWQsXG5cdFJlcGx5TWVzc2FnZU9wdGlvbnMsXG5cdFNub3dmbGFrZSxcblx0V2ViaG9va0VkaXRNZXNzYWdlT3B0aW9uc1xufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEFrYWlyb01lc3NhZ2UgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvTWVzc2FnZVwiO1xuaW1wb3J0IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXIgZnJvbSBcIi4uL2NvbnRleHRNZW51Q29tbWFuZHMvQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlclwiO1xuaW1wb3J0IENvbW1hbmRIYW5kbGVyLCB7IFBhcnNlZENvbXBvbmVudERhdGEgfSBmcm9tIFwiLi9Db21tYW5kSGFuZGxlclwiO1xuXG4vKipcbiAqIENvbW1hbmQgdXRpbGl0aWVzLlxuICogQHBhcmFtIGhhbmRsZXIgLSBUaGUgY29tbWFuZCBoYW5kbGVyLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kVXRpbCB7XG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihoYW5kbGVyOiBDb21tYW5kSGFuZGxlciB8IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXIsIG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlKSB7XG5cdFx0dGhpcy5oYW5kbGVyID0gaGFuZGxlcjtcblxuXHRcdHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG5cblx0XHR0aGlzLnBhcnNlZCA9IG51bGw7XG5cblx0XHR0aGlzLnNob3VsZEVkaXQgPSBmYWxzZTtcblxuXHRcdHRoaXMubGFzdFJlc3BvbnNlID0gbnVsbDtcblxuXHRcdGlmICh0aGlzLmhhbmRsZXIgaW5zdGFuY2VvZiBDb21tYW5kSGFuZGxlciAmJiB0aGlzLmhhbmRsZXIuc3RvcmVNZXNzYWdlcykge1xuXHRcdFx0dGhpcy5tZXNzYWdlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubWVzc2FnZXMgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMuaXNTbGFzaCA9IHRoaXMubWVzc2FnZSBpbnN0YW5jZW9mIEFrYWlyb01lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBoYW5kbGVyOiBDb21tYW5kSGFuZGxlciB8IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBpc1NsYXNoOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgbGFzdCByZXNwb25zZSBzZW50LlxuXHQgKi9cblx0cHVibGljIGxhc3RSZXNwb25zZT86IE1lc3NhZ2U7XG5cblx0LyoqXG5cdCAqIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgbWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2U7XG5cblx0LyoqXG5cdCAqIE1lc3NhZ2VzIHN0b3JlZCBmcm9tIHByb21wdHMgYW5kIHByb21wdCByZXBsaWVzLlxuXHQgKi9cblx0cHVibGljIG1lc3NhZ2VzPzogQ29sbGVjdGlvbjxTbm93Zmxha2UsIE1lc3NhZ2U+O1xuXG5cdC8qKlxuXHQgKiBUaGUgcGFyc2VkIGNvbXBvbmVudHMuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VkPzogUGFyc2VkQ29tcG9uZW50RGF0YTtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGxhc3QgcmVzcG9uc2Ugc2hvdWxkIGJlIGVkaXRlZC5cblx0ICovXG5cdHB1YmxpYyBzaG91bGRFZGl0OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBBZGRzIGNsaWVudCBwcm9tcHQgb3IgdXNlciByZXBseSB0byBtZXNzYWdlcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGFkZC5cblx0ICovXG5cdHB1YmxpYyBhZGRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UgfCBNZXNzYWdlW10pOiBNZXNzYWdlIHwgTWVzc2FnZVtdIHtcblx0XHRpZiAodGhpcy5oYW5kbGVyIGluc3RhbmNlb2YgQ29tbWFuZEhhbmRsZXIgJiYgdGhpcy5oYW5kbGVyLnN0b3JlTWVzc2FnZXMpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgbXNnIG9mIG1lc3NhZ2UpIHtcblx0XHRcdFx0XHR0aGlzLm1lc3NhZ2VzPy5zZXQobXNnLmlkLCBtc2cpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1lc3NhZ2VzPy5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogRWRpdHMgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIElmIHRoZSBtZXNzYWdlIGlzIGEgc2xhc2ggY29tbWFuZCwgZWRpdHMgdGhlIHNsYXNoIHJlc3BvbnNlLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0LyogcHVibGljIGFzeW5jIGVkaXQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZUVkaXRPcHRpb25zIHwgTWVzc2FnZVBheWxvYWRcblx0KTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIGVkaXQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBXZWJob29rRWRpdE1lc3NhZ2VPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+ICovXG5cdHB1YmxpYyBhc3luYyBlZGl0KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VFZGl0T3B0aW9ucyB8IE1lc3NhZ2VQYXlsb2FkIHwgV2ViaG9va0VkaXRNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0aWYgKHRoaXMuaXNTbGFzaCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLmxhc3RSZXNwb25zZSBhcyBhbnkgYXMgQWthaXJvTWVzc2FnZSkuaW50ZXJhY3Rpb24uZWRpdFJlcGx5KG9wdGlvbnMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UuZWRpdChvcHRpb25zKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2VuZCBhbiBpbmxpbmUgcmVwbHkgb3IgcmVzcG9uZCB0byBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqIElmIHRoZSBtZXNzYWdlIGlzIGEgc2xhc2ggY29tbWFuZCwgaXQgcmVwbGllcyBvciBlZGl0cyB0aGUgbGFzdCByZXBseS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdC8qIHB1YmxpYyBhc3luYyByZXBseShcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IFJlcGx5TWVzc2FnZU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIHJlcGx5KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4gKi9cblx0cHVibGljIGFzeW5jIHJlcGx5KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgUmVwbHlNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRsZXQgbmV3T3B0aW9uczogUmVwbHlNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zID0ge307XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09IFwic3RyaW5nXCIpIHtcblx0XHRcdG5ld09wdGlvbnMuY29udGVudCA9IG9wdGlvbnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5ld09wdGlvbnMgPSBvcHRpb25zO1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdCF0aGlzLmlzU2xhc2ggJiZcblx0XHRcdCF0aGlzLnNob3VsZEVkaXQgJiZcblx0XHRcdCEobmV3T3B0aW9ucyBpbnN0YW5jZW9mIE1lc3NhZ2VQYXlsb2FkKSAmJlxuXHRcdFx0IVJlZmxlY3QuaGFzKHRoaXMubWVzc2FnZSwgXCJkZWxldGVkXCIpXG5cdFx0KSB7XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRuZXdPcHRpb25zLnJlcGx5ID0ge1xuXHRcdFx0XHRtZXNzYWdlUmVmZXJlbmNlOiB0aGlzLm1lc3NhZ2UsIC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0ZmFpbElmTm90RXhpc3RzOiBuZXdPcHRpb25zLmZhaWxJZk5vdEV4aXN0cyA/PyB0cnVlXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5zZW5kKG5ld09wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2Ugb3IgZWRpdHMgYW4gb2xkIHJlc3BvbnNlIGlmIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdC8qIHB1YmxpYyBhc3luYyBzZW5kKFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIHNlbmQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHRcdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+ICovXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuXHRwdWJsaWMgYXN5bmMgc2VuZChcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdGNvbnN0IGhhc0ZpbGVzID0gdHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIgfHwgIW9wdGlvbnMuZmlsZXM/Lmxlbmd0aCA/IGZhbHNlIDogb3B0aW9ucy5maWxlcz8ubGVuZ3RoID4gMDtcblxuXHRcdGxldCBuZXdPcHRpb25zOiBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zID0ge307XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRuZXdPcHRpb25zLmNvbnRlbnQgPSBvcHRpb25zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXdPcHRpb25zID0gb3B0aW9ucyBhcyBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zO1xuXHRcdH1cblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMgIT09IFwic3RyaW5nXCIpIGRlbGV0ZSAob3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZXBoZW1lcmFsO1xuXHRcdFx0aWYgKHRoaXMuc2hvdWxkRWRpdCAmJiAhaGFzRmlsZXMgJiYgIXRoaXMubGFzdFJlc3BvbnNlLmRlbGV0ZWQgJiYgIXRoaXMubGFzdFJlc3BvbnNlLmF0dGFjaG1lbnRzLnNpemUpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlLmVkaXQob3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cblx0XHRcdGNvbnN0IGxhc3RTZW50ID0gdGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCk7XG5cdFx0XHR0aGlzLnNldEVkaXRhYmxlKCFsYXN0U2VudC5hdHRhY2htZW50cy5zaXplKTtcblxuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gXCJzdHJpbmdcIikgZGVsZXRlIChvcHRpb25zIGFzIE1lc3NhZ2VPcHRpb25zKS5yZXBseTtcblx0XHRcdGlmICh0aGlzLmxhc3RSZXNwb25zZSB8fCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24uZGVmZXJyZWQgfHwgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLnJlcGxpZWQpIHtcblx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmVkaXRSZXBseShvcHRpb25zKSkgYXMgTWVzc2FnZTtcblx0XHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKCEobmV3T3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZXBoZW1lcmFsKSB7XG5cdFx0XHRcdFx0KG5ld09wdGlvbnMgYXMgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMpLmZldGNoUmVwbHkgPSB0cnVlO1xuXHRcdFx0XHRcdHRoaXMubGFzdFJlc3BvbnNlID0gKGF3YWl0IHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5yZXBseShuZXdPcHRpb25zKSkgYXMgdW5rbm93biBhcyBNZXNzYWdlO1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbHkobmV3T3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2UsIG92ZXJ3cml0aW5nIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKi9cblx0LyogcHVibGljIGFzeW5jIHNlbmROZXcoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgc2VuZE5ldyhcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+ICovXG5cdHB1YmxpYyBhc3luYyBzZW5kTmV3KFxuXHRcdG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc1xuXHQpOiBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPiB7XG5cdFx0aWYgKCEodGhpcy5tZXNzYWdlLmludGVyYWN0aW9uIGluc3RhbmNlb2YgQ29tbWFuZEludGVyYWN0aW9uKSkge1xuXHRcdFx0Y29uc3Qgc2VudCA9IGF3YWl0IHRoaXMubWVzc2FnZS5jaGFubmVsPy5zZW5kKG9wdGlvbnMpO1xuXHRcdFx0Y29uc3QgbGFzdFNlbnQgPSB0aGlzLnNldExhc3RSZXNwb25zZShzZW50KTtcblx0XHRcdHRoaXMuc2V0RWRpdGFibGUoIWxhc3RTZW50LmF0dGFjaG1lbnRzLnNpemUpO1xuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNlbnQgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmZvbGxvd1VwKG9wdGlvbnMpKSBhcyBNZXNzYWdlO1xuXHRcdFx0dGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCk7XG5cdFx0XHRyZXR1cm4gc2VudDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyBpZiB0aGUgbWVzc2FnZSBzaG91bGQgYmUgZWRpdGVkLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBDaGFuZ2UgdG8gZWRpdGFibGUgb3Igbm90LlxuXHQgKi9cblx0cHVibGljIHNldEVkaXRhYmxlKHN0YXRlOiBib29sZWFuKTogQ29tbWFuZFV0aWwge1xuXHRcdHRoaXMuc2hvdWxkRWRpdCA9IEJvb2xlYW4oc3RhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqL1xuXHRwdWJsaWMgc2V0TGFzdFJlc3BvbnNlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBNZXNzYWdlIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlKSkge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlLnNsaWNlKC0xKVswXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UgYXMgTWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGRlbGV0ZSgpOiBQcm9taXNlPE1lc3NhZ2UgfCB2b2lkPiB7XG5cdFx0aWYgKHRoaXMuaXNTbGFzaCkge1xuXHRcdFx0cmV0dXJuICh0aGlzLm1lc3NhZ2UgYXMgQWthaXJvTWVzc2FnZSkuaW50ZXJhY3Rpb24uZGVsZXRlUmVwbHkoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlPy5kZWxldGUoKTtcblx0XHR9XG5cdH1cbn1cbiJdfQ==