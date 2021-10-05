import { Awaitable, Collection, Message } from "discord.js";
import { Category } from "../..";
import { InhibitorHandlerEvents } from "../../typings/events";
import AkairoError from "../../util/AkairoError";
import AkairoMessage from "../../util/AkairoMessage";
import Util from "../../util/Util";
import AkairoClient from "../AkairoClient";
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from "../AkairoHandler";
import Command from "../commands/Command";
import Inhibitor from "./Inhibitor";

/**
 * Loads inhibitors and checks messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export default class InhibitorHandler extends AkairoHandler {
	public constructor(
		client: AkairoClient,
		{
			directory,
			classToHandle = Inhibitor,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		}: AkairoHandlerOptions = {}
	) {
		if (!(classToHandle.prototype instanceof Inhibitor || classToHandle === Inhibitor)) {
			throw new AkairoError("INVALID_CLASS_TO_HANDLE", classToHandle.name, Inhibitor.name);
		}

		super(client, {
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		});
	}

	/**
	 * Categories, mapped by ID to Category.
	 */
	public declare categories: Collection<string, Category<string, Inhibitor>>;

	/**
	 * Class to handle.
	 */
	public declare classToHandle: typeof Inhibitor;

	/**
	 * The Akairo client.
	 */
	public declare client: AkairoClient;

	/**
	 * Directory to inhibitors.
	 */
	public declare directory: string;

	/**
	 * Inhibitors loaded, mapped by ID to Inhibitor.
	 */
	public declare modules: Collection<string, Inhibitor>;

	/**
	 * Deregisters a module.
	 * @param inhibitor - Module to use.
	 */
	public override deregister(inhibitor: Inhibitor): void {
		return super.deregister(inhibitor);
	}

	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	public override findCategory(name: string): Category<string, Inhibitor> {
		return super.findCategory(name) as Category<string, Inhibitor>;
	}

	/**
	 * Loads an inhibitor.
	 * @param thing - Module or path to module.
	 */
	public override load(thing: string | Inhibitor): Promise<Inhibitor> {
		return super.load(thing) as Promise<Inhibitor>;
	}

	/**
	 * Reads all inhibitors from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	public override loadAll(directory?: string, filter?: LoadPredicate): Promise<InhibitorHandler> {
		return super.loadAll(directory, filter) as Promise<InhibitorHandler>;
	}

	/**
	 * Registers a module.
	 * @param inhibitor - Module to use.
	 * @param filepath - Filepath of module.
	 */
	public override register(inhibitor: Inhibitor, filepath?: string): void {
		return super.register(inhibitor, filepath);
	}

	/**
	 * Reloads an inhibitor.
	 * @param id - ID of the inhibitor.
	 */
	public override reload(id: string): Promise<Inhibitor> {
		return super.reload(id) as Promise<Inhibitor>;
	}

	/**
	 * Reloads all inhibitors.
	 */
	public override reloadAll(): Promise<InhibitorHandler> {
		return super.reloadAll() as Promise<InhibitorHandler>;
	}

	/**
	 * Removes an inhibitor.
	 * @param {string} id - ID of the inhibitor.
	 */
	public override remove(id: string): Inhibitor {
		return super.remove(id) as Inhibitor;
	}

	/**
	 * Removes all inhibitors.
	 */
	public override removeAll(): InhibitorHandler {
		return super.removeAll() as InhibitorHandler;
	}

	/**
	 * Tests inhibitors against the message.
	 * Returns the reason if blocked.
	 * @param type - Type of inhibitor, 'all', 'pre', or 'post'.
	 * @param message - Message to test.
	 * @param command - Command to use.
	 */
	public async test(
		type: "all" | "pre" | "post",
		message: Message | AkairoMessage,
		command?: Command
	): Promise<string | null | void> {
		if (!this.modules.size) return null;

		const inhibitors = this.modules.filter(i => i.type === type);
		if (!inhibitors.size) return null;

		const promises = [];

		for (const inhibitor of inhibitors.values()) {
			promises.push(
				(async () => {
					let inhibited = inhibitor.exec(message, command);
					if (Util.isPromise(inhibited)) inhibited = await inhibited;
					if (inhibited) return inhibitor;
					return null;
				})()
			);
		}

		const inhibitedInhibitors = (await Promise.all(promises)).filter(r => r) as Inhibitor[];
		if (!inhibitedInhibitors.length) return null;

		inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
		return inhibitedInhibitors[0].reason;
	}

	public override on<K extends keyof InhibitorHandlerEvents>(
		event: K,
		listener: (...args: InhibitorHandlerEvents[K][]) => Awaitable<void>
	): this {
		return super.on(event, listener);
	}
	public override once<K extends keyof InhibitorHandlerEvents>(
		event: K,
		listener: (...args: InhibitorHandlerEvents[K][]) => Awaitable<void>
	): this {
		return super.once(event, listener);
	}
}
