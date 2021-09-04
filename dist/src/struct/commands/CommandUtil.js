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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEsMkNBV29CO0FBQ3BCLDZFQUFxRDtBQUVyRCxzRUFBdUU7QUFFdkU7Ozs7R0FJRztBQUNILE1BQXFCLFdBQVc7SUFDL0IsWUFBbUIsT0FBbUQsRUFBRSxPQUFnQztRQUN2RyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUVuQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUV4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUV6QixJQUFJLElBQUksQ0FBQyxPQUFPLFlBQVksd0JBQWMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUN6RSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDTixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sWUFBWSx1QkFBYSxDQUFDO0lBQ3RELENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU8sQ0FBNkM7SUFFM0Q7O09BRUc7SUFDSSxPQUFPLENBQVU7SUFFeEI7O09BRUc7SUFDSSxZQUFZLENBQWlCO0lBRXBDOztPQUVHO0lBQ0ksT0FBTyxDQUEwQjtJQUV4Qzs7T0FFRztJQUNJLFFBQVEsQ0FBd0M7SUFFdkQ7O09BRUc7SUFDSSxNQUFNLENBQTZCO0lBRTFDOztPQUVHO0lBQ0ksVUFBVSxDQUFVO0lBRTNCOzs7T0FHRztJQUNJLFVBQVUsQ0FBQyxPQUE0QjtRQUM3QyxJQUFJLElBQUks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LFlBQVksRUFBRSxNQUFNLEVBQUUsQ0FBQztTQUNuQztJQUNGLENBQUM7Q0FDRDtBQWpORCw4QkFpTkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSByZXF1aXJlLWF3YWl0ICovXG5pbXBvcnQgeyBBUElNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQtYXBpLXR5cGVzXCI7XG5pbXBvcnQge1xuXHRDb2xsZWN0aW9uLFxuXHRDb21tYW5kSW50ZXJhY3Rpb24sXG5cdEludGVyYWN0aW9uUmVwbHlPcHRpb25zLFxuXHRNZXNzYWdlLFxuXHRNZXNzYWdlRWRpdE9wdGlvbnMsXG5cdE1lc3NhZ2VPcHRpb25zLFxuXHRNZXNzYWdlUGF5bG9hZCxcblx0UmVwbHlNZXNzYWdlT3B0aW9ucyxcblx0U25vd2ZsYWtlLFxuXHRXZWJob29rRWRpdE1lc3NhZ2VPcHRpb25zXG59IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgQWthaXJvTWVzc2FnZSBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9NZXNzYWdlXCI7XG5pbXBvcnQgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciBmcm9tIFwiLi4vY29udGV4dE1lbnVDb21tYW5kcy9Db250ZXh0TWVudUNvbW1hbmRIYW5kbGVyXCI7XG5pbXBvcnQgQ29tbWFuZEhhbmRsZXIsIHsgUGFyc2VkQ29tcG9uZW50RGF0YSB9IGZyb20gXCIuL0NvbW1hbmRIYW5kbGVyXCI7XG5cbi8qKlxuICogQ29tbWFuZCB1dGlsaXRpZXMuXG4gKiBAcGFyYW0gaGFuZGxlciAtIFRoZSBjb21tYW5kIGhhbmRsZXIuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRVdGlsIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKGhhbmRsZXI6IENvbW1hbmRIYW5kbGVyIHwgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciwgbWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UpIHtcblx0XHR0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xuXG5cdFx0dGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcblxuXHRcdHRoaXMucGFyc2VkID0gbnVsbDtcblxuXHRcdHRoaXMuc2hvdWxkRWRpdCA9IGZhbHNlO1xuXG5cdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBudWxsO1xuXG5cdFx0aWYgKHRoaXMuaGFuZGxlciBpbnN0YW5jZW9mIENvbW1hbmRIYW5kbGVyICYmIHRoaXMuaGFuZGxlci5zdG9yZU1lc3NhZ2VzKSB7XG5cdFx0XHR0aGlzLm1lc3NhZ2VzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tZXNzYWdlcyA9IG51bGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5pc1NsYXNoID0gdGhpcy5tZXNzYWdlIGluc3RhbmNlb2YgQWthaXJvTWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGhhbmRsZXI6IENvbW1hbmRIYW5kbGVyIHwgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGlzU2xhc2g6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBsYXN0IHJlc3BvbnNlIHNlbnQuXG5cdCAqL1xuXHRwdWJsaWMgbGFzdFJlc3BvbnNlOiBNZXNzYWdlIHwgbnVsbDtcblxuXHQvKipcblx0ICogTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZTtcblxuXHQvKipcblx0ICogTWVzc2FnZXMgc3RvcmVkIGZyb20gcHJvbXB0cyBhbmQgcHJvbXB0IHJlcGxpZXMuXG5cdCAqL1xuXHRwdWJsaWMgbWVzc2FnZXM6IENvbGxlY3Rpb248U25vd2ZsYWtlLCBNZXNzYWdlPiB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSBwYXJzZWQgY29tcG9uZW50cy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZWQ6IFBhcnNlZENvbXBvbmVudERhdGEgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgbGFzdCByZXNwb25zZSBzaG91bGQgYmUgZWRpdGVkLlxuXHQgKi9cblx0cHVibGljIHNob3VsZEVkaXQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFkZHMgY2xpZW50IHByb21wdCBvciB1c2VyIHJlcGx5IHRvIG1lc3NhZ2VzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gYWRkLlxuXHQgKi9cblx0cHVibGljIGFkZE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSB8IE1lc3NhZ2VbXSk6IE1lc3NhZ2UgfCBNZXNzYWdlW10ge1xuXHRcdGlmICh0aGlzLmhhbmRsZXIgaW5zdGFuY2VvZiBDb21tYW5kSGFuZGxlciAmJiB0aGlzLmhhbmRsZXIuc3RvcmVNZXNzYWdlcykge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZSkpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBtc2cgb2YgbWVzc2FnZSkge1xuXHRcdFx0XHRcdHRoaXMubWVzc2FnZXM/LnNldChtc2cuaWQsIG1zZyk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubWVzc2FnZXM/LnNldChtZXNzYWdlLmlkLCBtZXNzYWdlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFZGl0cyB0aGUgbGFzdCByZXNwb25zZS5cblx0ICogSWYgdGhlIG1lc3NhZ2UgaXMgYSBzbGFzaCBjb21tYW5kLCBlZGl0cyB0aGUgc2xhc2ggcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgZWRpdChvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlRWRpdE9wdGlvbnMgfCBNZXNzYWdlUGF5bG9hZCk6IFByb21pc2U8TWVzc2FnZT47XG5cdHB1YmxpYyBhc3luYyBlZGl0KG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgV2ViaG9va0VkaXRNZXNzYWdlT3B0aW9ucyk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRpZiAodGhpcy5pc1NsYXNoKSB7XG5cdFx0XHRyZXR1cm4gKHRoaXMubGFzdFJlc3BvbnNlIGFzIGFueSBhcyBBa2Fpcm9NZXNzYWdlKS5pbnRlcmFjdGlvbi5lZGl0UmVwbHkob3B0aW9ucyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZSEuZWRpdChvcHRpb25zKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2VuZCBhbiBpbmxpbmUgcmVwbHkgb3IgcmVzcG9uZCB0byBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqIElmIHRoZSBtZXNzYWdlIGlzIGEgc2xhc2ggY29tbWFuZCwgaXQgcmVwbGllcyBvciBlZGl0cyB0aGUgbGFzdCByZXBseS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyByZXBseShvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IFJlcGx5TWVzc2FnZU9wdGlvbnMpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgcmVwbHkob3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRsZXQgbmV3T3B0aW9uczogUmVwbHlNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zID0ge307XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09IFwic3RyaW5nXCIpIHtcblx0XHRcdG5ld09wdGlvbnMuY29udGVudCA9IG9wdGlvbnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5ld09wdGlvbnMgPSBvcHRpb25zO1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdCF0aGlzLmlzU2xhc2ggJiZcblx0XHRcdCF0aGlzLnNob3VsZEVkaXQgJiZcblx0XHRcdCEobmV3T3B0aW9ucyBpbnN0YW5jZW9mIE1lc3NhZ2VQYXlsb2FkKSAmJlxuXHRcdFx0IVJlZmxlY3QuaGFzKHRoaXMubWVzc2FnZSwgXCJkZWxldGVkXCIpXG5cdFx0KSB7XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRuZXdPcHRpb25zLnJlcGx5ID0ge1xuXHRcdFx0XHRtZXNzYWdlUmVmZXJlbmNlOiB0aGlzLm1lc3NhZ2UsIC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0ZmFpbElmTm90RXhpc3RzOiBuZXdPcHRpb25zLmZhaWxJZk5vdEV4aXN0cyA/PyB0cnVlXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5zZW5kKG5ld09wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2Ugb3IgZWRpdHMgYW4gb2xkIHJlc3BvbnNlIGlmIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBzZW5kKG9wdGlvbnM6IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMpOiBQcm9taXNlPE1lc3NhZ2U+O1xuXHRwdWJsaWMgYXN5bmMgc2VuZChvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zKTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdGNvbnN0IGhhc0ZpbGVzID0gdHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIgfHwgIW9wdGlvbnMuZmlsZXM/Lmxlbmd0aCA/IGZhbHNlIDogb3B0aW9ucy5maWxlcz8ubGVuZ3RoID4gMDtcblxuXHRcdGxldCBuZXdPcHRpb25zOiBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zID0ge307XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRuZXdPcHRpb25zLmNvbnRlbnQgPSBvcHRpb25zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXdPcHRpb25zID0gb3B0aW9ucyBhcyBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zO1xuXHRcdH1cblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMgIT09IFwic3RyaW5nXCIpIGRlbGV0ZSAob3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZXBoZW1lcmFsO1xuXHRcdFx0aWYgKHRoaXMuc2hvdWxkRWRpdCAmJiAhaGFzRmlsZXMgJiYgIXRoaXMubGFzdFJlc3BvbnNlIS5kZWxldGVkICYmICF0aGlzLmxhc3RSZXNwb25zZSEuYXR0YWNobWVudHMuc2l6ZSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UhLmVkaXQob3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cblx0XHRcdGNvbnN0IGxhc3RTZW50ID0gdGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCEpO1xuXHRcdFx0dGhpcy5zZXRFZGl0YWJsZSghbGFzdFNlbnQuYXR0YWNobWVudHMuc2l6ZSk7XG5cblx0XHRcdHJldHVybiBzZW50ITtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zICE9PSBcInN0cmluZ1wiKSBkZWxldGUgKG9wdGlvbnMgYXMgTWVzc2FnZU9wdGlvbnMpLnJlcGx5O1xuXHRcdFx0aWYgKHRoaXMubGFzdFJlc3BvbnNlIHx8IHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5kZWZlcnJlZCB8fCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbGllZCkge1xuXHRcdFx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IChhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24uZWRpdFJlcGx5KG9wdGlvbnMpKSBhcyBNZXNzYWdlO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoIShuZXdPcHRpb25zIGFzIEludGVyYWN0aW9uUmVwbHlPcHRpb25zKS5lcGhlbWVyYWwpIHtcblx0XHRcdFx0XHQobmV3T3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZmV0Y2hSZXBseSA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLnJlcGx5KG5ld09wdGlvbnMpKSBhcyB1bmtub3duIGFzIE1lc3NhZ2U7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbHkobmV3T3B0aW9ucykgYXMgdW5rbm93biBhcyBQcm9taXNlPE1lc3NhZ2UgfCBBUElNZXNzYWdlPjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2VuZHMgYSByZXNwb25zZSwgb3ZlcndyaXRpbmcgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgc2VuZE5ldyhvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zKTogUHJvbWlzZTxNZXNzYWdlPjtcblx0cHVibGljIGFzeW5jIHNlbmROZXcob3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucyk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cdFx0XHRjb25zdCBsYXN0U2VudCA9IHRoaXMuc2V0TGFzdFJlc3BvbnNlKHNlbnQhKTtcblx0XHRcdHRoaXMuc2V0RWRpdGFibGUoIWxhc3RTZW50LmF0dGFjaG1lbnRzLnNpemUpO1xuXHRcdFx0cmV0dXJuIHNlbnQhO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBzZW50ID0gKGF3YWl0IHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5mb2xsb3dVcChvcHRpb25zKSkgYXMgTWVzc2FnZTtcblx0XHRcdHRoaXMuc2V0TGFzdFJlc3BvbnNlKHNlbnQpO1xuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENoYW5nZXMgaWYgdGhlIG1lc3NhZ2Ugc2hvdWxkIGJlIGVkaXRlZC5cblx0ICogQHBhcmFtIHN0YXRlIC0gQ2hhbmdlIHRvIGVkaXRhYmxlIG9yIG5vdC5cblx0ICovXG5cdHB1YmxpYyBzZXRFZGl0YWJsZShzdGF0ZTogYm9vbGVhbik6IENvbW1hbmRVdGlsIHtcblx0XHR0aGlzLnNob3VsZEVkaXQgPSBCb29sZWFuKHN0YXRlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKi9cblx0cHVibGljIHNldExhc3RSZXNwb25zZShtZXNzYWdlOiBNZXNzYWdlKTogTWVzc2FnZSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZSkpIHtcblx0XHRcdHRoaXMubGFzdFJlc3BvbnNlID0gbWVzc2FnZS5zbGljZSgtMSlbMF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubGFzdFJlc3BvbnNlID0gbWVzc2FnZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlIGFzIE1lc3NhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyB0aGUgbGFzdCByZXNwb25zZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBkZWxldGUoKTogUHJvbWlzZTxNZXNzYWdlIHwgdm9pZD4ge1xuXHRcdGlmICh0aGlzLmlzU2xhc2gpIHtcblx0XHRcdHJldHVybiAodGhpcy5tZXNzYWdlIGFzIEFrYWlyb01lc3NhZ2UpLmludGVyYWN0aW9uLmRlbGV0ZVJlcGx5KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZT8uZGVsZXRlKCk7XG5cdFx0fVxuXHR9XG59XG4iXX0=