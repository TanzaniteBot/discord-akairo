/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
import EventEmitter from "events";
import { AkairoError } from "../../util/AkairoError.js";
import type { Category } from "../../util/Category.js";
import type { AkairoClient } from "../AkairoClient.js";
import { AkairoModule, AkairoModuleOptions } from "../AkairoModule.js";
import type { ListenerHandler } from "./ListenerHandler.js";

/**
 * Represents a listener.
 */
export abstract class Listener extends AkairoModule {
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
	public declare emitter: string | EventEmitter;

	/**
	 * The event name listened to.
	 */
	public declare event: string;

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
	public declare type: ListenerType;

	/**
	 * @param id - Listener ID.
	 * @param options - Options for the listener.
	 */
	public constructor(id: string, options: ListenerOptions) {
		const { category, emitter, event, type = "on" } = options;

		if (typeof emitter !== "string" && !(emitter instanceof EventEmitter))
			throw new TypeError("options.emitter must be a string or an EventEmitter.");
		if (typeof event !== "string") throw new TypeError("options.event must be a string.");
		if (!listenersTypes.includes(type))
			throw new TypeError(`options.type must be one of ${listenersTypes.map(v => `"${v}"`).join(", ")}.`);

		super(id, { category });
		this.emitter = emitter;
		this.event = event;
		this.type = type;
	}

	/**
	 * Executes the listener.
	 * @param args - Arguments.
	 */
	public exec(...args: any[]): any {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}
}

export interface Listener extends AkairoModule {
	/**
	 * Reloads the listener.
	 */
	reload(): Promise<Listener>;

	/**
	 * Removes the listener.
	 */
	remove(): Listener;
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
	 * @default "on"
	 */
	type?: ListenerType;
}

const listenersTypes = ["on", "once", "prependListener", "prependOnceListener"] as const;
export type ListenerType = typeof listenersTypes[number];
