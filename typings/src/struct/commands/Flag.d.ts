import { Message } from "discord.js";
/**
 * Represents a special return value during command execution or argument parsing.
 * @param {string} type - Type of flag.
 * @param {any} [data={}] - Extra data.
 */
export default class Flag {
    /** The type of flag. */
    type: string;
    constructor(type: string, data?: any);
    /**
     * Creates a flag that cancels the command.
     * @returns {Flag}
     */
    static cancel(): Flag;
    /**
     * Creates a flag that retries with another input.
     * @param {Message} message - Message to handle.
     * @returns {Flag}
     */
    static retry(message: Message): Flag;
    /**
     * Creates a flag that acts as argument cast failure with extra data.
     * @param {any} value - The extra data for the failure.
     * @returns {Flag}
     */
    static fail(value: any): Flag;
    /**
     * Creates a flag that runs another command with the rest of the arguments.
     * @param {string} command - Command ID.
     * @param {boolean} [ignore=false] - Whether or not to ignore permission checks.
     * @param {string|null} [rest] - The rest of the arguments.
     * If this is not set, the argument handler will automatically use the rest of the content.
     * @returns {Flag}
     */
    static continue(command: string, ignore?: boolean, rest?: string | null): Flag;
    /**
     * Checks if a value is a flag and of some type.
     * @param {any} value - Value to check.
     * @param {string} type - Type of flag.
     * @returns {boolean}
     */
    static is(value: any, type: string): boolean;
}
//# sourceMappingURL=Flag.d.ts.map