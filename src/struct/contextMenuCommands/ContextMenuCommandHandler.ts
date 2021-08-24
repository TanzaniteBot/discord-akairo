import { Category } from "discord-akairo";
import { Awaited, Collection, ContextMenuInteraction } from "discord.js";
import { ContextMenuCommandHandlerEvents } from "../../typings/events";
import AkairoError from "../../util/AkairoError";
import { BuiltInReasons, ContextCommandHandlerEvents } from "../../util/Constants";
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
	public constructor(
		client: AkairoClient,
		{
			directory,
			classToHandle = ContextMenuCommand,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		}: AkairoHandlerOptions = {}
	) {
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
	public inhibitorHandler?: InhibitorHandler;

	/**
	 * Context menu commands loaded, mapped by ID to context menu command.
	 */
	public declare modules: Collection<string, ContextMenuCommand>;

	protected setup() {
		this.client.once("ready", () => {
			this.client.on("interactionCreate", i => {
				if (!i.isContextMenu()) return;

				this.handle(i);
			});
		});
	}

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

	/**
	 * Deregisters a module.
	 * @param contextMenuCommand - Module to use.
	 */
	public override deregister(contextMenuCommand: ContextMenuCommand): void {
		return super.deregister(contextMenuCommand);
	}

	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	public override findCategory(name: string): Category<string, ContextMenuCommand> {
		return super.findCategory(name) as Category<string, ContextMenuCommand>;
	}

	/**
	 * Loads an context menu command.
	 * @param thing - Module or path to module.
	 */
	public override load(thing: string | ContextMenuCommand): ContextMenuCommand {
		return super.load(thing) as ContextMenuCommand;
	}

	/**
	 * Reads all context menu commands from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	public override loadAll(directory?: string, filter?: LoadPredicate): ContextMenuCommandHandler {
		return super.loadAll(directory, filter) as ContextMenuCommandHandler;
	}

	/**
	 * Registers a module.
	 * @param contextMenuCommand - Module to use.
	 * @param filepath - Filepath of module.
	 */
	public override register(contextMenuCommand: ContextMenuCommand, filepath?: string): void {
		return super.register(contextMenuCommand, filepath);
	}

	/**
	 * Reloads an context menu command.
	 * @param id - ID of the context menu command.
	 */
	public override reload(id: string): ContextMenuCommand {
		return super.reload(id) as ContextMenuCommand;
	}

	/**
	 * Reloads all context menu commands.
	 */
	public override reloadAll(): ContextMenuCommandHandler {
		return super.reloadAll() as ContextMenuCommandHandler;
	}

	/**
	 * Removes an context menu command.
	 * @param {string} id - ID of the context menu command.
	 */
	public override remove(id: string): ContextMenuCommand {
		return super.remove(id) as ContextMenuCommand;
	}

	/**
	 * Removes all context menu commands.
	 */
	public override removeAll(): ContextMenuCommandHandler {
		return super.removeAll() as ContextMenuCommandHandler;
	}

	public override on<K extends keyof ContextMenuCommandHandlerEvents>(
		event: K,
		listener: (...args: ContextMenuCommandHandlerEvents[K]) => Awaited<void>
	): this {
		return super.on(event, listener);
	}
	public override once<K extends keyof ContextMenuCommandHandlerEvents>(
		event: K,
		listener: (...args: ContextMenuCommandHandlerEvents[K]) => Awaited<void>
	): this {
		return super.once(event, listener);
	}
}
