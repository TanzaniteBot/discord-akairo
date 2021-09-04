import { Message } from "discord.js";
import AkairoMessage from "../../util/AkairoMessage";
import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule";
import Command from "../commands/Command";
import InhibitorHandler from "./InhibitorHandler";
/**
 * Represents an inhibitor.
 * @param id - Inhibitor ID.
 * @param options - Options for the inhibitor.
 */
export default abstract class Inhibitor extends AkairoModule {
    constructor(id: string, { category, reason, type, priority }?: InhibitorOptions);
    /**
     * The priority of the inhibitor.
     */
    priority: number;
    /**
     * The category the inhibitor belongs to.
     */
    category: Category<string, Inhibitor>;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The filepath.
     */
    filepath: string;
    /**
     * The inhibitor handler.
     */
    handler: InhibitorHandler;
    /**
     * The ID of this inhibitor.
     */
    id: string;
    /**
     * Reason emitted when command is inhibited.
     */
    reason: string;
    /**
     * The type of the inhibitor for when it should run.
     */
    type: string;
    /**
     * Checks if message should be blocked.
     * A return value of true will block the message.
     * If returning a Promise, a resolved value of true will block the message.
     * @param message - Message being handled.
     * @param command - Command to check.
     */
    exec(message: Message | AkairoMessage, command?: Command): boolean | Promise<boolean>;
    /**
     * Reloads the inhibitor.
     */
    reload(): Inhibitor;
    /**
     * Removes the inhibitor.
     */
    remove(): Inhibitor;
}
/**
 * Options to use for inhibitor execution behavior.
 * Also includes properties from AkairoModuleOptions.
 */
export interface InhibitorOptions extends AkairoModuleOptions {
    /**
     * Reason emitted when command or message is blocked.
     */
    reason?: string;
    /**
     * Can be 'all' to run on all messages, 'pre' to run on messages not blocked by the built-in inhibitors, or 'post' to run on messages that are commands.
     * Defaults to `post`
     */
    type?: "all" | "pre" | "post";
    /**
     * Priority for the inhibitor for when more than one inhibitors block a message.
     * The inhibitor with the highest priority is the one that is used for the block reason.
     * Defaults to `0`
     */
    priority?: number;
}
//# sourceMappingURL=Inhibitor.d.ts.map