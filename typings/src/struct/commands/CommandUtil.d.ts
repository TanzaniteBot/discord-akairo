import { APIMessage } from "discord-api-types";
import { Collection, MessagePayload, InteractionReplyOptions, Message, MessageEditOptions, MessageOptions, ReplyMessageOptions, WebhookEditMessageOptions, Snowflake } from "discord.js";
import AkairoMessage from "../../util/AkairoMessage";
import CommandHandler, { ParsedComponentData } from "./CommandHandler";
/**
 * Command utilities.
 * @param handler - The command handler.
 * @param message - Message that triggered the command.
 */
export default class CommandUtil {
    /**  The command handler. */
    handler: CommandHandler;
    /** Whether or not the command is a slash command. */
    isSlash: boolean;
    /** The last response sent. */
    lastResponse?: Message;
    /** Message that triggered the command. */
    message: Message | AkairoMessage;
    /** Messages stored from prompts and prompt replies. */
    messages?: Collection<Snowflake, Message>;
    /** The parsed components. */
    parsed?: ParsedComponentData;
    /** Whether or not the last response should be edited. */
    shouldEdit: boolean;
    constructor(handler: CommandHandler, message: Message | AkairoMessage);
    /**
     * Sets the last response.
     */
    setLastResponse(message: Message): Message;
    /**
     * Adds client prompt or user reply to messages.
     * @param {Message | Message[]} message - Message to add.
     * @returns {Message | Message[]}
     */
    addMessage(message: Message | Message[]): Message | Message[];
    /**
     * Changes if the message should be edited.
     * @param {boolean} state - Change to editable or not.
     * @returns {CommandUtil}
     */
    setEditable(state: boolean): CommandUtil;
    /**
     * Sends a response or edits an old response if available.
     * @param {string | MessagePayload | MessageOptions | InteractionReplyOptions} options - Options to use.
     * @returns {Promise<Message | APIMessage | undefined>}
     */
    send(options: string | MessagePayload | MessageOptions | InteractionReplyOptions): Promise<Message | APIMessage | void>;
    /**
     * Sends a response, overwriting the last response.
     * @param {string | MessagePayload | MessageOptions} options - Options to use.
     * @returns {Promise<Message | APIMessage>}
     */
    sendNew(options: string | MessagePayload | MessageOptions): Promise<Message | APIMessage>;
    /**
     * Send an inline reply or respond to a slash command.
     * @param {string | MessagePayload | ReplyMessageOptions | InteractionReplyOptions} options - Options to use.
     * @returns {Promise<Message|APIMessage>}
     */
    reply(options: string | MessagePayload | ReplyMessageOptions | InteractionReplyOptions): Promise<Message | APIMessage>;
    /**
     * Edits the last response.
     * If the message is a slash command, edits the slash response.
     * @param {string | MessageEditOptions | MessagePayload | WebhookEditMessageOptions} options - Options to use.
     * @returns {Promise<Message>}
     */
    edit(options: string | MessageEditOptions | MessagePayload | WebhookEditMessageOptions): Promise<Message>;
    /**
     * Deletes the last response.
     * @returns {Promise<Message | void>}
     */
    delete(): Promise<Message | void>;
}
//# sourceMappingURL=CommandUtil.d.ts.map