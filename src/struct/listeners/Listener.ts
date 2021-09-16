import EventEmitter from "events";
import AkairoError from "../../util/AkairoError";
import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule";
import ListenerHandler from "./ListenerHandler";

/**
 * Represents a listener.
 * @param id - Listener ID.
 * @param options - Options for the listener.
 */
export default abstract class Listener extends AkairoModule {
	public constructor(id: string, { category, emitter, event, type = "on" }: ListenerOptions) {
		super(id, { category });

		this.emitter = emitter;

		this.event = event;

		this.type = type;
	}

	/**
	 * The category of this listener.
	 */
	public declare category: Category<string, Listener>;

	/**
	 * The Akairo client.
	 */
	public declare client: AkairoClient;

	/**
	 * The event emitter.
	 */
	public emitter: string | EventEmitter;

	/**
	 * The event name listened to.
	 */
	public event: string;

	/**
	 * The filepath.
	 */
	public declare filepath: string;

	/**
	 * The handler.
	 */
	public declare handler: ListenerHandler;

	/**
	 * Type of listener.
	 */
	public type: ListenerType;

	/**
	 * Executes the listener.
	 * @param args - Arguments.
	 */
	// eslint-disable-next-line func-names, @typescript-eslint/no-unused-vars
	public exec(...args: any[]): any {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}

	/**
	 * Reloads the listener.
	 */
	public override reload(): Promise<Listener> {
		return super.reload() as Promise<Listener>;
	}

	/**
	 * Removes the listener.
	 */
	public override remove(): Listener {
		return super.remove() as Listener;
	}
}

/**
 * Options to use for listener execution behavior.
 */
export interface ListenerOptions extends AkairoModuleOptions {
	/**
	 * The event emitter, either a key from `ListenerHandler#emitters` or an EventEmitter.
	 */
	emitter: string | EventEmitter;

	/**
	 * Event name to listen to.
	 */
	event: string;

	/**
	 * Type of listener, either 'on' or 'once'.
	 * Defaults to `on`
	 */
	type?: ListenerType;
}

export type ListenerType = "on" | "once" | "prependListener" | "prependOnceListener";
