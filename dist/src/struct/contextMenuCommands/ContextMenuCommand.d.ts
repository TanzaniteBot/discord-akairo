import { ContextMenuInteraction, Snowflake } from "discord.js";
import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule";
import ContextMenuCommandHandler from "./ContextMenuCommandHandler";
/**
 * Represents a context menu command.
 * @param id - Listener ID.
 * @param options - Options for the context menu command.
 */
export default abstract class ContextMenuCommand extends AkairoModule {
    constructor(id: string, { category, guilds, name, ownerOnly, superUserOnly, type }: ContextMenuCommandOptions);
    /**
     * Assign context menu commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
     */
    guilds: Snowflake[];
    /**
     * The name of the context menu command.
     */
    name: string;
    /**
     * Usable only by the client owner.
     */
    ownerOnly: boolean;
    /**
     * Whether or not to allow client superUsers(s) only.
     */
    superUserOnly: boolean;
    /**
     * The type of the context menu command.
     */
    type: "USER" | "MESSAGE";
    /**
     * The category of this context menu command.
     */
    category: Category<string, ContextMenuCommand>;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The filepath.
     */
    filepath: string;
    /**
     * The handler.
     */
    handler: ContextMenuCommandHandler;
    /**
     * Executes the context menu command.
     * @param interaction - The context menu command interaction.
     */
    exec(interaction: ContextMenuInteraction): any;
    /**
     * Reloads the context menu command.
     */
    reload(): ContextMenuCommand;
    /**
     * Removes the context menu command.
     */
    remove(): ContextMenuCommand;
}
/**
 * Options to use for context menu command execution behavior.
 */
export interface ContextMenuCommandOptions extends AkairoModuleOptions {
    /**
     * Assign context menu commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
     */
    guilds?: Snowflake[];
    /**
     * The name of the context menu command.
     */
    name: string;
    /**
     * Usable only by the client owner.
     */
    ownerOnly?: boolean;
    /**
     * Whether or not to allow client superUsers(s) only.
     */
    superUserOnly?: boolean;
    /**
     * The type of the context menu command.
     */
    type: "USER" | "MESSAGE";
}
//# sourceMappingURL=ContextMenuCommand.d.ts.map