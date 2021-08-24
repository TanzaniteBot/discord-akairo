import { Category } from "discord-akairo";
import { Awaited, Collection, ContextMenuInteraction } from "discord.js";
import { ContextMenuCommandHandlerEvents } from "../../typings/events";
import AkairoClient from "../AkairoClient";
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from "../AkairoHandler";
import AkairoModule from "../AkairoModule";
import InhibitorHandler from "../inhibitors/InhibitorHandler";
import ContextMenuCommand from "./ContextMenuCommand";
/**
 * Loads context menu commands and handles them.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export default class ContextMenuCommandHandler extends AkairoHandler {
    constructor(client: AkairoClient, { directory, classToHandle, extensions, automateCategories, loadFilter }?: AkairoHandlerOptions);
    /**
     * Categories, mapped by ID to Category.
     */
    categories: Collection<string, Category<string, ContextMenuCommand>>;
    /**
     * Class to handle.
     */
    classToHandle: typeof ContextMenuCommand;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * Directory to context menu commands.
     */
    directory: string;
    /**
     * Inhibitor handler to use.
     */
    inhibitorHandler?: InhibitorHandler;
    /**
     * Context menu commands loaded, mapped by ID to context menu command.
     */
    modules: Collection<string, ContextMenuCommand>;
    protected setup(): void;
    handle(interaction: ContextMenuInteraction): Promise<boolean | null>;
    /**
     * Handles errors from the handling.
     * @param err - The error.
     * @param interaction - Interaction that called the command.
     * @param command - Command that errored.
     */
    emitError(err: Error, interaction: ContextMenuInteraction, command: ContextMenuCommand | AkairoModule): void;
    /**
     * Deregisters a module.
     * @param contextMenuCommand - Module to use.
     */
    deregister(contextMenuCommand: ContextMenuCommand): void;
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name: string): Category<string, ContextMenuCommand>;
    /**
     * Loads an context menu command.
     * @param thing - Module or path to module.
     */
    load(thing: string | ContextMenuCommand): ContextMenuCommand;
    /**
     * Reads all context menu commands from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory?: string, filter?: LoadPredicate): ContextMenuCommandHandler;
    /**
     * Registers a module.
     * @param contextMenuCommand - Module to use.
     * @param filepath - Filepath of module.
     */
    register(contextMenuCommand: ContextMenuCommand, filepath?: string): void;
    /**
     * Reloads an context menu command.
     * @param id - ID of the context menu command.
     */
    reload(id: string): ContextMenuCommand;
    /**
     * Reloads all context menu commands.
     */
    reloadAll(): ContextMenuCommandHandler;
    /**
     * Removes an context menu command.
     * @param {string} id - ID of the context menu command.
     */
    remove(id: string): ContextMenuCommand;
    /**
     * Removes all context menu commands.
     */
    removeAll(): ContextMenuCommandHandler;
    on<K extends keyof ContextMenuCommandHandlerEvents>(event: K, listener: (...args: ContextMenuCommandHandlerEvents[K]) => Awaited<void>): this;
    once<K extends keyof ContextMenuCommandHandlerEvents>(event: K, listener: (...args: ContextMenuCommandHandlerEvents[K]) => Awaited<void>): this;
}
//# sourceMappingURL=ContextMenuCommandHandler.d.ts.map