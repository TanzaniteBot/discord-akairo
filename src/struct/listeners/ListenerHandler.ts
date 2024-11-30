import { Collection } from "discord.js";
import type EventEmitter from "node:events";
import type { ListenerHandlerEvents } from "../../typings/events.js";
import { AkairoError } from "../../util/AkairoError.js";
import { isEventEmitter } from "../../util/Util.js";
import type { AkairoClient } from "../AkairoClient.js";
import { AkairoHandler, type AkairoHandlerOptions } from "../AkairoHandler.js";
import { Listener } from "./Listener.js";

/**
 * Loads listeners and registers them with EventEmitters.
 */
export class ListenerHandler extends AkairoHandler<Listener, ListenerHandler, ListenerHandlerEvents> {
	/**
	 * Class to handle.
	 */
	public override classToHandle!: typeof Listener;

	/**
	 * EventEmitters for use, mapped by name to EventEmitter.
	 * By default, 'client' is set to the given client.
	 */
	public emitters: Collection<string, EventEmitter>;

	/**
	 * @param client - The Akairo client.
	 * @param options - Options.
	 */
	public constructor(client: AkairoClient, options: ListenerHandlerOptions) {
		const { directory, classToHandle = Listener, extensions = [".js", ".ts"], automateCategories, loadFilter } = options;

		if (!(classToHandle.prototype instanceof Listener || classToHandle === Listener)) {
			throw new AkairoError("INVALID_CLASS_TO_HANDLE", classToHandle.name, Listener.name);
		}

		super(client, { directory, classToHandle, extensions, automateCategories, loadFilter });

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

		const emitter = isEventEmitter(listener.emitter) ? listener.emitter : this.emitters.get(listener.emitter as string)!;
		if (!isEventEmitter(emitter)) throw new AkairoError("INVALID_TYPE", "emitter", "EventEmitter", true);

		emitter[listener.type ?? "on"](listener.event, listener.exec);
		return listener;
	}

	/**
	 * Deregisters a listener.
	 * @param listener - Listener to use.
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

		const emitter: EventEmitter = isEventEmitter(listener.emitter)
			? (listener.emitter as EventEmitter)
			: this.emitters.get(listener.emitter as string)!;
		if (!isEventEmitter(emitter)) throw new AkairoError("INVALID_TYPE", "emitter", "EventEmitter", true);

		emitter.removeListener(listener.event, listener.exec);
		return listener;
	}

	/**
	 * Sets custom emitters.
	 * @param emitters - Emitters to use. The key is the name and value is the emitter.
	 */
	public setEmitters(emitters: any): ListenerHandler {
		for (const [key, value] of Object.entries(emitters)) {
			if (!isEventEmitter(value)) throw new AkairoError("INVALID_TYPE", key, "EventEmitter", true);
			this.emitters.set(key, value);
		}

		return this;
	}
}

export type ListenerHandlerOptions = AkairoHandlerOptions<Listener, ListenerHandler, ListenerHandlerEvents>;
