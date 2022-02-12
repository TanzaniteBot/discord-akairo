import { Awaitable, Collection } from "discord.js";
import type EventEmitter from "events";
import type { ListenerHandlerEvents } from "../../typings/events";
import { AkairoError } from "../../util/AkairoError.js";
import type { Category } from "../../util/Category.js";
import { Util } from "../../util/Util.js";
import type { AkairoClient } from "../AkairoClient.js";
import { AkairoHandler, AkairoHandlerOptions, LoadPredicate } from "../AkairoHandler.js";
import { Listener } from "./Listener.js";

/**
 * Loads listeners and registers them with EventEmitters.
 */
export class ListenerHandler extends AkairoHandler {
	/**
	 * Categories, mapped by ID to Category.
	 */
	public declare categories: Collection<string, Category<string, Listener>>;

	/**
	 * Class to handle.
	 */
	public declare classToHandle: typeof Listener;

	/**
	 * The Akairo client
	 */
	public declare client: AkairoClient;

	/**
	 * Directory to listeners.
	 */
	public declare directory: string;

	/**
	 * EventEmitters for use, mapped by name to EventEmitter.
	 * By default, 'client' is set to the given client.
	 */
	public declare emitters: Collection<string, EventEmitter>;

	/**
	 * Listeners loaded, mapped by ID to Listener.
	 */
	public declare modules: Collection<string, Listener>;

	/**
	 * @param client - The Akairo client.
	 * @param options - Options.
	 */
	public constructor(client: AkairoClient, options: AkairoHandlerOptions) {
		const { directory, classToHandle = Listener, extensions = [".js", ".ts"], automateCategories, loadFilter } = options ?? {};

		if (!(classToHandle.prototype instanceof Listener || classToHandle === Listener)) {
			throw new AkairoError("INVALID_CLASS_TO_HANDLE", classToHandle.name, Listener.name);
		}

		super(client, {
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		});

		this.emitters = new Collection();
		this.emitters.set("client", this.client);
	}

	/**
	 * Adds a listener to the EventEmitter.
	 * @param id - ID of the listener.
	 */
	public addToEmitter(id: string): Listener {
		const listener: Listener = this.modules.get(id.toString())!;
		if (!listener) throw new AkairoError("MODULE_NOT_FOUND", this.classToHandle.name, id);

		const emitter: EventEmitter = Util.isEventEmitter(listener.emitter)
			? (listener.emitter as EventEmitter)
			: this.emitters.get(listener.emitter as string)!;
		if (!Util.isEventEmitter(emitter)) throw new AkairoError("INVALID_TYPE", "emitter", "EventEmitter", true);

		emitter[listener.type ?? "on"](listener.event, listener.exec);
		return listener;
	}

	/**
	 * Deregisters a listener.
	 * @param mod - Listener to use.
	 */
	public override deregister(listener: Listener): void {
		this.removeFromEmitter(listener.id);
		super.deregister(listener);
	}

	/**
	 * Registers a listener.
	 * @param listener - Listener to use.
	 * @param filepath - Filepath of listener.
	 */
	public override register(listener: Listener, filepath?: string): void {
		super.register(listener, filepath);
		listener.exec = listener.exec.bind(listener);
		this.addToEmitter(listener.id);
	}

	/**
	 * Removes a listener from the EventEmitter.
	 * @param id - ID of the listener.
	 */
	public removeFromEmitter(id: string): Listener {
		const listener: Listener = this.modules.get(id.toString())!;
		if (!listener) throw new AkairoError("MODULE_NOT_FOUND", this.classToHandle.name, id);

		const emitter: EventEmitter = Util.isEventEmitter(listener.emitter)
			? (listener.emitter as EventEmitter)
			: this.emitters.get(listener.emitter as string)!;
		if (!Util.isEventEmitter(emitter)) throw new AkairoError("INVALID_TYPE", "emitter", "EventEmitter", true);

		emitter.removeListener(listener.event, listener.exec);
		return listener;
	}

	/**
	 * Sets custom emitters.
	 * @param emitters - Emitters to use. The key is the name and value is the emitter.
	 */
	public setEmitters(emitters: any): ListenerHandler {
		for (const [key, value] of Object.entries(emitters)) {
			if (!Util.isEventEmitter(value)) throw new AkairoError("INVALID_TYPE", key, "EventEmitter", true);
			this.emitters.set(key, value);
		}

		return this;
	}
}

type Events = ListenerHandlerEvents;

export interface ListenerHandler extends AkairoHandler {
	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	findCategory(name: string): Category<string, Listener>;

	/**
	 * Loads a listener, can be a listener class or a filepath.
	 * @param thing - Listener class or path to listener.
	 * @param isReload - Whether this is a reload or not.
	 */
	load(thing: string | Listener, isReload?: boolean): Promise<Listener>;

	/**
	 * Reads all listeners from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	loadAll(directory?: string, filter?: LoadPredicate): Promise<ListenerHandler>;

	/**
	 * Reloads a listener.
	 * @param id - ID of the listener.
	 */
	reload(id: string): Promise<Listener>;

	/**
	 * Reloads all listeners.
	 */
	reloadAll(): Promise<ListenerHandler>;

	/**
	 * Removes a listener.
	 * @param id - ID of the listener.
	 */
	remove(id: string): Listener;

	/**
	 * Removes all listeners.
	 */
	removeAll(): ListenerHandler;

	on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
	once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
}
