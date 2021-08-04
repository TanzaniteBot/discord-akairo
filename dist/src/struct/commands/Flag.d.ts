import { Message } from "discord.js";
/**
 * Represents a special return value during command execution or argument parsing.
 * @param type - Type of flag.
 * @param data - Extra data.
 */
export default class Flag {
    constructor(type: string, data?: any);
    /**
     * The type of flag.
     */
    type: string;
    /**
     * Creates a flag that cancels the command.
     */
    static cancel(): Flag;
    /**
     * Creates a flag that retries with another input.
     * @param message - Message to handle.
     */
    static retry(message: Message): Flag;
    /**
     * Creates a flag that acts as argument cast failure with extra data.
     * @param value - The extra data for the failure.
     */
    static fail(value: any): Flag;
    /**
     * Creates a flag that runs another command with the rest of the arguments.
     * @param command - Command ID.
     * @param ignore - Whether or not to ignore permission checks.
     * @param rest - The rest of the arguments. If this is not set, the argument handler will automatically use the rest of the content.
     */
    static continue(command: string, ignore?: boolean, rest?: string | null): Flag;
    /**
     * Checks if a value is a flag and of some type.
     * @param value - Value to check.
     * @param type - Type of flag.
     */
    static is(value: any, type: string): boolean;
}
//# sourceMappingURL=Flag.d.ts.map
