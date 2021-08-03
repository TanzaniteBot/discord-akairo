import AkairoHandler, {
	AkairoHandlerOptions,
	LoadPredicate
} from "../AkairoHandler";
import Inhibitor from "./Inhibitor";
import { Awaited, Collection, Message } from "discord.js";
import AkairoMessage from "../../util/AkairoMessage";
import AkairoClient from "../AkairoClient";
import Command from "../commands/Command";
import { Category } from "../..";
import { InhibitorHandlerEvents } from "../../typings/events";
/**
 * Loads inhibitors and checks messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export default class InhibitorHandler extends AkairoHandler {
	/**
	 * Categories, mapped by ID to Category.
	 */
	categories: Collection<string, Category<string, Inhibitor>>;
	/**
	 * Class to handle.
	 */
	classToHandle: typeof Inhibitor;
	/**
	 * The Akairo client.
	 */
	client: AkairoClient;
	/**
	 * Directory to inhibitors.
	 */
	directory: string;
	/**
	 * Inhibitors loaded, mapped by ID to Inhibitor.
	 */
	modules: Collection<string, Inhibitor>;
	constructor(
		client: AkairoClient,
		{
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		}?: AkairoHandlerOptions
	);
	/**
	 * Deregisters a module.
	 * @param inhibitor - Module to use.
	 */
	deregister(inhibitor: Inhibitor): void;
	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	findCategory(name: string): Category<string, Inhibitor>;
	/**
	 * Loads an inhibitor.
	 * @param thing - Module or path to module.
	 */
	load(thing: string | Function): Inhibitor;
	/**
	 * Reads all inhibitors from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	loadAll(directory?: string, filter?: LoadPredicate): InhibitorHandler;
	/**
	 * Registers a module.
	 * @param inhibitor - Module to use.
	 * @param filepath - Filepath of module.
	 */
	register(inhibitor: Inhibitor, filepath?: string): void;
	/**
	 * Reloads an inhibitor.
	 * @param id - ID of the inhibitor.
	 */
	reload(id: string): Inhibitor;
	/**
	 * Reloads all inhibitors.
	 */
	reloadAll(): InhibitorHandler;
	/**
	 * Removes an inhibitor.
	 * @param {string} id - ID of the inhibitor.
	 */
	remove(id: string): Inhibitor;
	/**
	 * Removes all inhibitors.
	 */
	removeAll(): InhibitorHandler;
	/**
	 * Tests inhibitors against the message.
	 * Returns the reason if blocked.
	 * @param type - Type of inhibitor, 'all', 'pre', or 'post'.
	 * @param message - Message to test.
	 * @param command - Command to use.
	 */
	test(
		type: "all" | "pre" | "post",
		message: Message | AkairoMessage,
		command?: Command
	): Promise<string | null | void>;
	on<K extends keyof InhibitorHandlerEvents>(
		event: K,
		listener: (...args: InhibitorHandlerEvents[K]) => Awaited<void>
	): this;
}
//# sourceMappingURL=InhibitorHandler.d.ts.map
