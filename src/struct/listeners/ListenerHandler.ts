import AkairoError from "../../util/AkairoError";
import AkairoHandler, {
	AkairoHandlerOptions,
	LoadPredicate
} from "../AkairoHandler";
import { Awaited, Collection } from "discord.js";
import Util from "../../util/Util";
import Listener from "./Listener";
import AkairoClient from "../AkairoClient";
import EventEmitter from "events";
import Category from "../../util/Category";
import { ListenerHandlerEvents } from "../../typings/events";

/**
 * Loads listeners and registers them with EventEmitters.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export default class ListenerHandler extends AkairoHandler {
	public constructor(
		client: AkairoClient,
		{
			directory,
			classToHandle = Listener,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		}: AkairoHandlerOptions = {}
	) {
		if (
			!(
				classToHandle.prototype instanceof Listener ||
				classToHandle === Listener
			)
		) {
			throw new AkairoError(
				"INVALID_CLASS_TO_HANDLE",
				classToHandle.name,
				Listener.name
			);
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
	public emitters: Collection<string, EventEmitter>;

	/**
	 * Listeners loaded, mapped by ID to Listener.
	 */
	public declare modules: Collection<string, Listener>;

	/**
	 * Adds a listener to the EventEmitter.
	 * @param id - ID of the listener.
	 */
	public addToEmitter(id: string): Listener {
		const listener: Listener = this.modules.get(id.toString());
		if (!listener)
			throw new AkairoError("MODULE_NOT_FOUND", this.classToHandle.name, id);

		/**
		 * @type {AkairoHandler}
		 */
		const emitter: EventEmitter = Util.isEventEmitter(listener.emitter)
			? (listener.emitter as EventEmitter)
			: this.emitters.get(listener.emitter as string);
		if (!Util.isEventEmitter(emitter))
			throw new AkairoError("INVALID_TYPE", "emitter", "EventEmitter", true);

		if (listener.type === "once") {
			emitter.once(listener.event, listener.exec);
			return listener;
		}

		emitter.on(listener.event as any, listener.exec);
		return listener;
	}

	/**
	 * Deregisters a module.
	 * @param mod - Module to use.
	 */
	public override deregister(listener: Listener): void {
		this.removeFromEmitter(listener.id);
		super.deregister(listener);
	}

	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	public override findCategory(name: string): Category<string, Listener> {
		return super.findCategory(name) as Category<string, Listener>;
	}

	/**
	 * Loads a module, can be a module class or a filepath.
	 * @param thing - Module class or path to module.
	 * @param isReload - Whether this is a reload or not.
	 */
	public override load(thing: string | Listener, isReload?: boolean): Listener {
		return super.load(thing, isReload) as Listener;
	}

	/**
	 * Reads all listeners from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	public override loadAll(
		directory?: string,
		filter?: LoadPredicate
	): ListenerHandler {
		return super.loadAll(directory, filter) as ListenerHandler;
	}

	/**
	 * Registers a module.
	 * @param listener - Module to use.
	 * @param filepath - Filepath of module.
	 */
	public override register(listener: Listener, filepath: string): void {
		super.register(listener, filepath);
		listener.exec = listener.exec.bind(listener);
		this.addToEmitter(listener.id);
	}

	/**
	 * Reloads a listener.
	 * @param id - ID of the listener.
	 */
	public override reload(id: string): Listener {
		return super.reload(id) as Listener;
	}

	/**
	 * Reloads all listeners.
	 */
	public override reloadAll(): ListenerHandler {
		return super.reloadAll() as ListenerHandler;
	}

	/**
	 * Removes a listener.
	 * @param id - ID of the listener.
	 */
	public override remove(id: string): Listener {
		return super.remove(id) as Listener;
	}

	/**
	 * Removes all listeners.
	 */
	public override removeAll(): ListenerHandler {
		return super.removeAll() as ListenerHandler;
	}

	/**
	 * Removes a listener from the EventEmitter.
	 * @param id - ID of the listener.
	 */
	public removeFromEmitter(id: string): Listener {
		const listener: Listener = this.modules.get(id.toString());
		if (!listener)
			throw new AkairoError("MODULE_NOT_FOUND", this.classToHandle.name, id);

		const emitter: EventEmitter = Util.isEventEmitter(listener.emitter)
			? (listener.emitter as EventEmitter)
			: this.emitters.get(listener.emitter as string);
		if (!Util.isEventEmitter(emitter))
			throw new AkairoError("INVALID_TYPE", "emitter", "EventEmitter", true);

		emitter.removeListener(listener.event, listener.exec);
		return listener;
	}

	/**
	 * Sets custom emitters.
	 * @param emitters - Emitters to use. The key is the name and value is the emitter.
	 */
	setEmitters(emitters: any): ListenerHandler {
		for (const [key, value] of Object.entries(emitters)) {
			if (!Util.isEventEmitter(value))
				throw new AkairoError("INVALID_TYPE", key, "EventEmitter", true);
			this.emitters.set(key, value as any);
		}

		return this;
	}

	public override on<K extends keyof ListenerHandlerEvents>(
		event: K,
		listener: (...args: ListenerHandlerEvents[K][]) => Awaited<void>
	): this {
		return super.on(event, listener);
	}
}
