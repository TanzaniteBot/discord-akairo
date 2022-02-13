import type { Awaitable, Collection, ContextMenuInteraction } from "discord.js";
import type { ContextMenuCommandHandlerEvents } from "../../typings/events";
import { AkairoError } from "../../util/AkairoError.js";
import type { Category } from "../../util/Category.js";
import { BuiltInReasons, ContextCommandHandlerEvents } from "../../util/Constants.js";
import type { AkairoClient } from "../AkairoClient.js";
import { AkairoHandler, AkairoHandlerOptions, LoadPredicate } from "../AkairoHandler.js";
import type { AkairoModule } from "../AkairoModule.js";
import type { InhibitorHandler } from "../inhibitors/InhibitorHandler.js";
import { ContextMenuCommand } from "./ContextMenuCommand.js";

/**
 * Loads context menu commands and handles them.
 */
export class ContextMenuCommandHandler extends AkairoHandler {
	/**
	 * Categories, mapped by ID to Category.
	 */
	public declare categories: Collection<string, Category<string, ContextMenuCommand>>;

	/**
	 * Class to handle.
	 */
	public declare classToHandle: typeof ContextMenuCommand;

	/**
	 * The Akairo client.
	 */
	public declare client: AkairoClient;

	/**
	 * Directory to context menu commands.
	 */
	public declare directory: string;

	/**
	 * Inhibitor handler to use.
	 */
	public declare inhibitorHandler?: InhibitorHandler;

	/**
	 * Context menu commands loaded, mapped by ID to context menu command.
	 */
	public declare modules: Collection<string, ContextMenuCommand>;

	/**
	 * @param client - The Akairo client.
	 * @param options - Options.
	 */
	public constructor(client: AkairoClient, options: AkairoHandlerOptions) {
		const {
			directory,
			classToHandle = ContextMenuCommand,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		} = options ?? {};

		if (!(classToHandle.prototype instanceof ContextMenuCommand || classToHandle === ContextMenuCommand)) {
			throw new AkairoError("INVALID_CLASS_TO_HANDLE", classToHandle.name, ContextMenuCommand.name);
		}

		super(client, {
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		});

		this.setup();
	}

	/**
	 * Set up the context menu command handler
	 */
	protected setup() {
		this.client.once("ready", () => {
			this.client.on("interactionCreate", i => {
				if (!i.isUserContextMenu()) return;

				this.handle(i);
			});
		});
	}

	/**
	 * Handles an interaction.
	 * @param interaction - Interaction to handle.
	 */
	public async handle(interaction: ContextMenuInteraction): Promise<boolean | null> {
		const command = this.modules.find(module => module.name === interaction.commandName);

		if (!command) {
			this.emit(ContextCommandHandlerEvents.NOT_FOUND, interaction);
			return false;
		}

		if (command.ownerOnly && !this.client.isOwner(interaction.user.id)) {
			this.emit(ContextCommandHandlerEvents.BLOCKED, interaction, command, BuiltInReasons.OWNER);
		}
		if (command.superUserOnly && !this.client.isSuperUser(interaction.user.id)) {
			this.emit(ContextCommandHandlerEvents.BLOCKED, interaction, command, BuiltInReasons.SUPER_USER);
		}

		try {
			this.emit(ContextCommandHandlerEvents.STARTED, interaction, command);
			const ret = await command.exec(interaction);
			this.emit(ContextCommandHandlerEvents.FINISHED, interaction, command, ret);
			return true;
		} catch (err) {
			this.emitError(err, interaction, command);
			return false;
		}
	}

	/**
	 * Handles errors from the handling.
	 * @param err - The error.
	 * @param interaction - Interaction that called the command.
	 * @param command - Command that errored.
	 */
	public emitError(err: Error, interaction: ContextMenuInteraction, command: ContextMenuCommand | AkairoModule): void {
		if (this.listenerCount(ContextCommandHandlerEvents.ERROR)) {
			this.emit(ContextCommandHandlerEvents.ERROR, err, interaction, command);
			return;
		}

		throw err;
	}
}

type Events = ContextMenuCommandHandlerEvents;

export interface ContextMenuCommandHandler extends AkairoHandler {
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
	load(thing: string | ContextMenuCommand): Promise<ContextMenuCommand>;

	/**
	 * Reads all context menu commands from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	loadAll(directory?: string, filter?: LoadPredicate): Promise<ContextMenuCommandHandler>;

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
	reload(id: string): Promise<ContextMenuCommand>;

	/**
	 * Reloads all context menu commands.
	 */
	reloadAll(): Promise<ContextMenuCommandHandler>;

	/**
	 * Removes an context menu command.
	 * @param id - ID of the context menu command.
	 */
	remove(id: string): ContextMenuCommand;

	/**
	 * Removes all context menu commands.
	 */
	removeAll(): ContextMenuCommandHandler;

	on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
	once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
}
