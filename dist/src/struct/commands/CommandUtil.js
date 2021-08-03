"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/**
 * Command utilities.
 * @param handler - The command handler.
 * @param message - Message that triggered the command.
 */
class CommandUtil {
    /**  The command handler. */
    handler;
    /** Whether or not the command is a slash command. */
    isSlash;
    /** The last response sent. */
    lastResponse;
    /** Message that triggered the command. */
    message;
    /** Messages stored from prompts and prompt replies. */
    messages;
    /** The parsed components. */
    parsed;
    /** Whether or not the last response should be edited. */
    shouldEdit;
    constructor(handler, message) {
        /**
         * The command handler.
         * @type {CommandHandler}
         */
        this.handler = handler;
        /**
         * Message that triggered the command.
         * @type {Message | AkairoMessage}
         */
        this.message = message;
        /**
         * The parsed components.
         * @type {?ParsedComponentData}
         */
        this.parsed = null;
        /**
         * Whether or not the last response should be edited.
         * @type {boolean}
         */
        this.shouldEdit = false;
        /**
         * The last response sent.
         * @type {?Message | ?}
         */
        this.lastResponse = null;
        if (this.handler.storeMessages) {
            /**
             * Messages stored from prompts and prompt replies.
             * @type {Collection<Snowflake, Message>?}
             */
            this.messages = new discord_js_1.Collection();
        }
        else {
            this.messages = null;
        }
        /**
         * Whether or not the command is a slash command.
         * @type {boolean}
         */
        this.isSlash = !!message.interaction;
    }
    /**
     * Sets the last response.
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
     * @param {Message | Message[]} message - Message to add.
     * @returns {Message | Message[]}
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
     * @param {boolean} state - Change to editable or not.
     * @returns {CommandUtil}
     */
    setEditable(state) {
        this.shouldEdit = Boolean(state);
        return this;
    }
    /**
     * Sends a response or edits an old response if available.
     * @param {string | MessagePayload | MessageOptions | InteractionReplyOptions} options - Options to use.
     * @returns {Promise<Message | APIMessage | undefined>}
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
     * @param {string | MessagePayload | MessageOptions} options - Options to use.
     * @returns {Promise<Message | APIMessage>}
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
     * @param {string | MessagePayload | ReplyMessageOptions | InteractionReplyOptions} options - Options to use.
     * @returns {Promise<Message|APIMessage>}
     */
    reply(options) {
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
     * @param {string | MessageEditOptions | MessagePayload | WebhookEditMessageOptions} options - Options to use.
     * @returns {Promise<Message>}
     */
    edit(options) {
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
     * @returns {Promise<Message | void>}
     */
    delete() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMkNBV29CO0FBSXBCOzs7O0dBSUc7QUFDSCxNQUFxQixXQUFXO0lBQy9CLDRCQUE0QjtJQUNyQixPQUFPLENBQWlCO0lBRS9CLHFEQUFxRDtJQUM5QyxPQUFPLENBQVU7SUFFeEIsOEJBQThCO0lBQ3ZCLFlBQVksQ0FBVztJQUU5QiwwQ0FBMEM7SUFDbkMsT0FBTyxDQUEwQjtJQUV4Qyx1REFBdUQ7SUFDaEQsUUFBUSxDQUFrQztJQUVqRCw2QkFBNkI7SUFDdEIsTUFBTSxDQUF1QjtJQUVwQyx5REFBeUQ7SUFDbEQsVUFBVSxDQUFVO0lBRTNCLFlBQ0MsT0FBdUIsRUFDdkIsT0FBZ0M7UUFFaEM7OztXQUdHO1FBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkI7OztXQUdHO1FBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkI7OztXQUdHO1FBQ0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFFbkI7OztXQUdHO1FBQ0gsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFeEI7OztXQUdHO1FBQ0gsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFFekIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUMvQjs7O2VBR0c7WUFDSCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1NBQ2pDO2FBQU07WUFDTixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUNyQjtRQUVEOzs7V0FHRztRQUNILElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7SUFDdEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZUFBZSxDQUFDLE9BQWdCO1FBQy9CLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN6QzthQUFNO1lBQ04sSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7U0FDNUI7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUF1QixDQUFDO0lBQ3JDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsVUFBVSxDQUFDLE9BQTRCO1FBQ3RDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7WUFDL0IsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMzQixLQUFLLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRTtvQkFDMUIsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDaEM7YUFDRDtpQkFBTTtnQkFDTixJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ3hDO1NBQ0Q7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxLQUFjO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCw2Q0FBNkM7SUFDN0MsS0FBSyxDQUFDLElBQUksQ0FDVCxPQUEyRTtRQUUzRSxNQUFNLFFBQVEsR0FDYixPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU07WUFDcEQsQ0FBQyxDQUFDLEtBQUs7WUFDUCxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRTlCLElBQUksVUFBVSxHQUE2QyxFQUFFLENBQUM7UUFDOUQsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDaEMsVUFBVSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7U0FDN0I7YUFBTTtZQUNOLFVBQVUsR0FBRyxPQUFtRCxDQUFDO1NBQ2pFO1FBQ0QsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLFlBQVksK0JBQWtCLENBQUMsRUFBRTtZQUM5RCxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVE7Z0JBQzlCLE9BQVEsT0FBbUMsQ0FBQyxTQUFTLENBQUM7WUFDdkQsSUFDQyxJQUFJLENBQUMsVUFBVTtnQkFDZixDQUFDLFFBQVE7Z0JBQ1QsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU87Z0JBQzFCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUNsQztnQkFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3ZDO1lBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdkQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3QyxPQUFPLElBQUksQ0FBQztTQUNaO2FBQU07WUFDTixJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVE7Z0JBQUUsT0FBUSxPQUEwQixDQUFDLEtBQUssQ0FBQztZQUMxRSxJQUNDLElBQUksQ0FBQyxZQUFZO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRO2dCQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQy9CO2dCQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FDNUQsT0FBTyxDQUNQLENBQVksQ0FBQztnQkFDZCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7YUFDekI7aUJBQU07Z0JBQ04sSUFBSSxDQUFFLFVBQXNDLENBQUMsU0FBUyxFQUFFO29CQUN0RCxVQUFzQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7b0JBQzFELElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FDeEQsVUFBVSxDQUNWLENBQXVCLENBQUM7b0JBQ3pCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztpQkFDekI7Z0JBQ0QsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDakQ7U0FDRDtJQUNGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FDWixPQUFpRDtRQUVqRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsWUFBWSwrQkFBa0IsQ0FBQyxFQUFFO1lBQzlELE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsT0FBTyxJQUFJLENBQUM7U0FDWjthQUFNO1lBQ04sTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FDcEQsT0FBTyxDQUNQLENBQVksQ0FBQztZQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsT0FBTyxJQUFJLENBQUM7U0FDWjtJQUNGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUNKLE9BSTBCO1FBRTFCLElBQUksVUFBVSxHQUFrRCxFQUFFLENBQUM7UUFDbkUsSUFBSSxPQUFPLE9BQU8sSUFBSSxRQUFRLEVBQUU7WUFDL0IsVUFBVSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7U0FDN0I7YUFBTTtZQUNOLG1CQUFtQjtZQUNuQixVQUFVLEdBQUcsT0FBTyxDQUFDO1NBQ3JCO1FBRUQsSUFDQyxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQ2IsQ0FBQyxJQUFJLENBQUMsVUFBVTtZQUNoQixDQUFDLENBQUMsVUFBVSxZQUFZLDJCQUFjLENBQUM7WUFDdkMsbUJBQW1CO1lBQ25CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQ3BCO1lBQ0QsbUJBQW1CO1lBQ25CLFVBQVUsQ0FBQyxLQUFLLEdBQUc7Z0JBQ2xCLGdCQUFnQixFQUFFLElBQUksQ0FBQyxPQUFPO2dCQUM5QixlQUFlLEVBQUUsVUFBVSxDQUFDLGVBQWUsSUFBSSxJQUFJO2FBQ25ELENBQUM7U0FDRixDQUFDLG1CQUFtQjtRQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsSUFBSSxDQUNILE9BSTRCO1FBRTVCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNqQixtQkFBbUI7WUFDbkIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEQ7YUFBTTtZQUNOLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdkM7SUFDRixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTTtRQUNMLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNqQixtQkFBbUI7WUFDbkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUM5QzthQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxDQUFDO1NBQ25DO0lBQ0YsQ0FBQztDQUNEO0FBMVFELDhCQTBRQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSU1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC1hcGktdHlwZXNcIjtcbmltcG9ydCB7XG5cdENvbGxlY3Rpb24sXG5cdE1lc3NhZ2VQYXlsb2FkLFxuXHRDb21tYW5kSW50ZXJhY3Rpb24sXG5cdEludGVyYWN0aW9uUmVwbHlPcHRpb25zLFxuXHRNZXNzYWdlLFxuXHRNZXNzYWdlRWRpdE9wdGlvbnMsXG5cdE1lc3NhZ2VPcHRpb25zLFxuXHRSZXBseU1lc3NhZ2VPcHRpb25zLFxuXHRXZWJob29rRWRpdE1lc3NhZ2VPcHRpb25zLFxuXHRTbm93Zmxha2Vcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBBa2Fpcm9NZXNzYWdlIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb01lc3NhZ2VcIjtcbmltcG9ydCBDb21tYW5kSGFuZGxlciwgeyBQYXJzZWRDb21wb25lbnREYXRhIH0gZnJvbSBcIi4vQ29tbWFuZEhhbmRsZXJcIjtcblxuLyoqXG4gKiBDb21tYW5kIHV0aWxpdGllcy5cbiAqIEBwYXJhbSBoYW5kbGVyIC0gVGhlIGNvbW1hbmQgaGFuZGxlci5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZFV0aWwge1xuXHQvKiogIFRoZSBjb21tYW5kIGhhbmRsZXIuICovXG5cdHB1YmxpYyBoYW5kbGVyOiBDb21tYW5kSGFuZGxlcjtcblxuXHQvKiogV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgaXMgYSBzbGFzaCBjb21tYW5kLiAqL1xuXHRwdWJsaWMgaXNTbGFzaDogYm9vbGVhbjtcblxuXHQvKiogVGhlIGxhc3QgcmVzcG9uc2Ugc2VudC4gKi9cblx0cHVibGljIGxhc3RSZXNwb25zZT86IE1lc3NhZ2U7XG5cblx0LyoqIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuICovXG5cdHB1YmxpYyBtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZTtcblxuXHQvKiogTWVzc2FnZXMgc3RvcmVkIGZyb20gcHJvbXB0cyBhbmQgcHJvbXB0IHJlcGxpZXMuICovXG5cdHB1YmxpYyBtZXNzYWdlcz86IENvbGxlY3Rpb248U25vd2ZsYWtlLCBNZXNzYWdlPjtcblxuXHQvKiogVGhlIHBhcnNlZCBjb21wb25lbnRzLiAqL1xuXHRwdWJsaWMgcGFyc2VkPzogUGFyc2VkQ29tcG9uZW50RGF0YTtcblxuXHQvKiogV2hldGhlciBvciBub3QgdGhlIGxhc3QgcmVzcG9uc2Ugc2hvdWxkIGJlIGVkaXRlZC4gKi9cblx0cHVibGljIHNob3VsZEVkaXQ6IGJvb2xlYW47XG5cblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGhhbmRsZXI6IENvbW1hbmRIYW5kbGVyLFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlXG5cdCkge1xuXHRcdC8qKlxuXHRcdCAqIFRoZSBjb21tYW5kIGhhbmRsZXIuXG5cdFx0ICogQHR5cGUge0NvbW1hbmRIYW5kbGVyfVxuXHRcdCAqL1xuXHRcdHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG5cblx0XHQvKipcblx0XHQgKiBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHRcdCAqIEB0eXBlIHtNZXNzYWdlIHwgQWthaXJvTWVzc2FnZX1cblx0XHQgKi9cblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIHBhcnNlZCBjb21wb25lbnRzLlxuXHRcdCAqIEB0eXBlIHs/UGFyc2VkQ29tcG9uZW50RGF0YX1cblx0XHQgKi9cblx0XHR0aGlzLnBhcnNlZCA9IG51bGw7XG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgbGFzdCByZXNwb25zZSBzaG91bGQgYmUgZWRpdGVkLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuc2hvdWxkRWRpdCA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGxhc3QgcmVzcG9uc2Ugc2VudC5cblx0XHQgKiBAdHlwZSB7P01lc3NhZ2UgfCA/fVxuXHRcdCAqL1xuXHRcdHRoaXMubGFzdFJlc3BvbnNlID0gbnVsbDtcblxuXHRcdGlmICh0aGlzLmhhbmRsZXIuc3RvcmVNZXNzYWdlcykge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBNZXNzYWdlcyBzdG9yZWQgZnJvbSBwcm9tcHRzIGFuZCBwcm9tcHQgcmVwbGllcy5cblx0XHRcdCAqIEB0eXBlIHtDb2xsZWN0aW9uPFNub3dmbGFrZSwgTWVzc2FnZT4/fVxuXHRcdFx0ICovXG5cdFx0XHR0aGlzLm1lc3NhZ2VzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tZXNzYWdlcyA9IG51bGw7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuaXNTbGFzaCA9ICEhbWVzc2FnZS5pbnRlcmFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKi9cblx0c2V0TGFzdFJlc3BvbnNlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBNZXNzYWdlIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlKSkge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlLnNsaWNlKC0xKVswXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSBtZXNzYWdlO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2UgYXMgTWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGNsaWVudCBwcm9tcHQgb3IgdXNlciByZXBseSB0byBtZXNzYWdlcy5cblx0ICogQHBhcmFtIHtNZXNzYWdlIHwgTWVzc2FnZVtdfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBhZGQuXG5cdCAqIEByZXR1cm5zIHtNZXNzYWdlIHwgTWVzc2FnZVtdfVxuXHQgKi9cblx0YWRkTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlIHwgTWVzc2FnZVtdKTogTWVzc2FnZSB8IE1lc3NhZ2VbXSB7XG5cdFx0aWYgKHRoaXMuaGFuZGxlci5zdG9yZU1lc3NhZ2VzKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShtZXNzYWdlKSkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IG1zZyBvZiBtZXNzYWdlKSB7XG5cdFx0XHRcdFx0dGhpcy5tZXNzYWdlcz8uc2V0KG1zZy5pZCwgbXNnKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tZXNzYWdlcz8uc2V0KG1lc3NhZ2UuaWQsIG1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBtZXNzYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoYW5nZXMgaWYgdGhlIG1lc3NhZ2Ugc2hvdWxkIGJlIGVkaXRlZC5cblx0ICogQHBhcmFtIHtib29sZWFufSBzdGF0ZSAtIENoYW5nZSB0byBlZGl0YWJsZSBvciBub3QuXG5cdCAqIEByZXR1cm5zIHtDb21tYW5kVXRpbH1cblx0ICovXG5cdHNldEVkaXRhYmxlKHN0YXRlOiBib29sZWFuKTogQ29tbWFuZFV0aWwge1xuXHRcdHRoaXMuc2hvdWxkRWRpdCA9IEJvb2xlYW4oc3RhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2Ugb3IgZWRpdHMgYW4gb2xkIHJlc3BvbnNlIGlmIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIHtzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnN9IG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICogQHJldHVybnMge1Byb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2UgfCB1bmRlZmluZWQ+fVxuXHQgKi9cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG5cdGFzeW5jIHNlbmQoXG5cdFx0b3B0aW9uczogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2UgfCB2b2lkPiB7XG5cdFx0Y29uc3QgaGFzRmlsZXMgPVxuXHRcdFx0dHlwZW9mIG9wdGlvbnMgPT09IFwic3RyaW5nXCIgfHwgIW9wdGlvbnMuZmlsZXM/Lmxlbmd0aFxuXHRcdFx0XHQ/IGZhbHNlXG5cdFx0XHRcdDogb3B0aW9ucy5maWxlcz8ubGVuZ3RoID4gMDtcblxuXHRcdGxldCBuZXdPcHRpb25zOiBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zID0ge307XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRuZXdPcHRpb25zLmNvbnRlbnQgPSBvcHRpb25zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXdPcHRpb25zID0gb3B0aW9ucyBhcyBNZXNzYWdlT3B0aW9ucyB8IEludGVyYWN0aW9uUmVwbHlPcHRpb25zO1xuXHRcdH1cblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMgIT09IFwic3RyaW5nXCIpXG5cdFx0XHRcdGRlbGV0ZSAob3B0aW9ucyBhcyBJbnRlcmFjdGlvblJlcGx5T3B0aW9ucykuZXBoZW1lcmFsO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR0aGlzLnNob3VsZEVkaXQgJiZcblx0XHRcdFx0IWhhc0ZpbGVzICYmXG5cdFx0XHRcdCF0aGlzLmxhc3RSZXNwb25zZS5kZWxldGVkICYmXG5cdFx0XHRcdCF0aGlzLmxhc3RSZXNwb25zZS5hdHRhY2htZW50cy5zaXplXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlLmVkaXQob3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cblx0XHRcdGNvbnN0IGxhc3RTZW50ID0gdGhpcy5zZXRMYXN0UmVzcG9uc2Uoc2VudCk7XG5cdFx0XHR0aGlzLnNldEVkaXRhYmxlKCFsYXN0U2VudC5hdHRhY2htZW50cy5zaXplKTtcblxuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gXCJzdHJpbmdcIikgZGVsZXRlIChvcHRpb25zIGFzIE1lc3NhZ2VPcHRpb25zKS5yZXBseTtcblx0XHRcdGlmIChcblx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgfHxcblx0XHRcdFx0dGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmRlZmVycmVkIHx8XG5cdFx0XHRcdHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5yZXBsaWVkXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy5sYXN0UmVzcG9uc2UgPSAoYXdhaXQgdGhpcy5tZXNzYWdlLmludGVyYWN0aW9uLmVkaXRSZXBseShcblx0XHRcdFx0XHRvcHRpb25zXG5cdFx0XHRcdCkpIGFzIE1lc3NhZ2U7XG5cdFx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICghKG5ld09wdGlvbnMgYXMgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMpLmVwaGVtZXJhbCkge1xuXHRcdFx0XHRcdChuZXdPcHRpb25zIGFzIEludGVyYWN0aW9uUmVwbHlPcHRpb25zKS5mZXRjaFJlcGx5ID0gdHJ1ZTtcblx0XHRcdFx0XHR0aGlzLmxhc3RSZXNwb25zZSA9IChhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbHkoXG5cdFx0XHRcdFx0XHRuZXdPcHRpb25zXG5cdFx0XHRcdFx0KSkgYXMgdW5rbm93biBhcyBNZXNzYWdlO1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmxhc3RSZXNwb25zZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24ucmVwbHkobmV3T3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmRzIGEgcmVzcG9uc2UsIG92ZXJ3cml0aW5nIHRoZSBsYXN0IHJlc3BvbnNlLlxuXHQgKiBAcGFyYW0ge3N0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnN9IG9wdGlvbnMgLSBPcHRpb25zIHRvIHVzZS5cblx0ICogQHJldHVybnMge1Byb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+fVxuXHQgKi9cblx0YXN5bmMgc2VuZE5ldyhcblx0XHRvcHRpb25zOiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zXG5cdCk6IFByb21pc2U8TWVzc2FnZSB8IEFQSU1lc3NhZ2U+IHtcblx0XHRpZiAoISh0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24gaW5zdGFuY2VvZiBDb21tYW5kSW50ZXJhY3Rpb24pKSB7XG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgdGhpcy5tZXNzYWdlLmNoYW5uZWw/LnNlbmQob3B0aW9ucyk7XG5cdFx0XHRjb25zdCBsYXN0U2VudCA9IHRoaXMuc2V0TGFzdFJlc3BvbnNlKHNlbnQpO1xuXHRcdFx0dGhpcy5zZXRFZGl0YWJsZSghbGFzdFNlbnQuYXR0YWNobWVudHMuc2l6ZSk7XG5cdFx0XHRyZXR1cm4gc2VudDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgc2VudCA9IChhd2FpdCB0aGlzLm1lc3NhZ2UuaW50ZXJhY3Rpb24uZm9sbG93VXAoXG5cdFx0XHRcdG9wdGlvbnNcblx0XHRcdCkpIGFzIE1lc3NhZ2U7XG5cdFx0XHR0aGlzLnNldExhc3RSZXNwb25zZShzZW50KTtcblx0XHRcdHJldHVybiBzZW50O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kIGFuIGlubGluZSByZXBseSBvciByZXNwb25kIHRvIGEgc2xhc2ggY29tbWFuZC5cblx0ICogQHBhcmFtIHtzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IFJlcGx5TWVzc2FnZU9wdGlvbnMgfCBJbnRlcmFjdGlvblJlcGx5T3B0aW9uc30gb3B0aW9ucyAtIE9wdGlvbnMgdG8gdXNlLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTxNZXNzYWdlfEFQSU1lc3NhZ2U+fVxuXHQgKi9cblx0cmVwbHkoXG5cdFx0b3B0aW9uczpcblx0XHRcdHwgc3RyaW5nXG5cdFx0XHR8IE1lc3NhZ2VQYXlsb2FkXG5cdFx0XHR8IFJlcGx5TWVzc2FnZU9wdGlvbnNcblx0XHRcdHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlIHwgQVBJTWVzc2FnZT4ge1xuXHRcdGxldCBuZXdPcHRpb25zOiBSZXBseU1lc3NhZ2VPcHRpb25zIHwgSW50ZXJhY3Rpb25SZXBseU9wdGlvbnMgPSB7fTtcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0bmV3T3B0aW9ucy5jb250ZW50ID0gb3B0aW9ucztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0bmV3T3B0aW9ucyA9IG9wdGlvbnM7XG5cdFx0fVxuXG5cdFx0aWYgKFxuXHRcdFx0IXRoaXMuaXNTbGFzaCAmJlxuXHRcdFx0IXRoaXMuc2hvdWxkRWRpdCAmJlxuXHRcdFx0IShuZXdPcHRpb25zIGluc3RhbmNlb2YgTWVzc2FnZVBheWxvYWQpICYmXG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHQhdGhpcy5tZXNzYWdlLmRlbGV0ZWRcblx0XHQpIHtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5ld09wdGlvbnMucmVwbHkgPSB7XG5cdFx0XHRcdG1lc3NhZ2VSZWZlcmVuY2U6IHRoaXMubWVzc2FnZSwgLy8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRmYWlsSWZOb3RFeGlzdHM6IG5ld09wdGlvbnMuZmFpbElmTm90RXhpc3RzID8/IHRydWVcblx0XHRcdH07XG5cdFx0fSAvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0cmV0dXJuIHRoaXMuc2VuZChuZXdPcHRpb25zKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFZGl0cyB0aGUgbGFzdCByZXNwb25zZS5cblx0ICogSWYgdGhlIG1lc3NhZ2UgaXMgYSBzbGFzaCBjb21tYW5kLCBlZGl0cyB0aGUgc2xhc2ggcmVzcG9uc2UuXG5cdCAqIEBwYXJhbSB7c3RyaW5nIHwgTWVzc2FnZUVkaXRPcHRpb25zIHwgTWVzc2FnZVBheWxvYWQgfCBXZWJob29rRWRpdE1lc3NhZ2VPcHRpb25zfSBvcHRpb25zIC0gT3B0aW9ucyB0byB1c2UuXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPE1lc3NhZ2U+fVxuXHQgKi9cblx0ZWRpdChcblx0XHRvcHRpb25zOlxuXHRcdFx0fCBzdHJpbmdcblx0XHRcdHwgTWVzc2FnZUVkaXRPcHRpb25zXG5cdFx0XHR8IE1lc3NhZ2VQYXlsb2FkXG5cdFx0XHR8IFdlYmhvb2tFZGl0TWVzc2FnZU9wdGlvbnNcblx0KTogUHJvbWlzZTxNZXNzYWdlPiB7XG5cdFx0aWYgKHRoaXMuaXNTbGFzaCkge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlLmludGVyYWN0aW9uLmVkaXRSZXBseShvcHRpb25zKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMubGFzdFJlc3BvbnNlLmVkaXQob3B0aW9ucyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGxhc3QgcmVzcG9uc2UuXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPE1lc3NhZ2UgfCB2b2lkPn1cblx0ICovXG5cdGRlbGV0ZSgpOiBQcm9taXNlPE1lc3NhZ2UgfCB2b2lkPiB7XG5cdFx0aWYgKHRoaXMuaXNTbGFzaCkge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0cmV0dXJuIHRoaXMubWVzc2FnZS5pbnRlcmFjdGlvbi5kZWxldGVSZXBseSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5sYXN0UmVzcG9uc2U/LmRlbGV0ZSgpO1xuXHRcdH1cblx0fVxufVxuIl19