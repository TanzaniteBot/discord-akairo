import EventEmitter from "node:events";
import { z } from "zod";
import { type ListenerHandlerEvents } from "../../typings/events.js";
import { patchAbstract } from "../../util/Util.js";
import { AkairoModule, AkairoModuleOptions } from "../AkairoModule.js";
import type { ListenerHandler } from "./ListenerHandler.js";

/**
 * Represents a listener.
 */
export abstract class Listener extends AkairoModule<ListenerHandler, Listener, ListenerHandlerEvents> {
	/**
	 * The event emitter.
	 */
	public emitter: string | EventEmitter;

	/**
	 * The event name listened to.
	 */
	public event: string;

	/**
	 * Type of listener.
	 */
	public type: ListenerType;

	/**
	 * @param id - Listener ID.
	 * @param options - Options for the listener.
	 */
	public constructor(id: string, options: ListenerOptions) {
		ListenerOptions.parse(options);

		const { category, emitter, event, type = "on" } = options;
		super(id, { category });

		this.emitter = emitter;
		this.event = event;
		this.type = type;
	}

	/**
	 * Executes the listener.
	 * @param args - Arguments.
	 */
	public abstract exec(...args: any[]): any;
}

patchAbstract(Listener, "exec");

export type ListenerType = "on" | "once" | "prependListener" | "prependOnceListener";
export const ListenerType = z.enum(["on", "once", "prependListener", "prependOnceListener"]);

/**
 * Options to use for listener execution behavior.
 */
export type ListenerOptions = AkairoModuleOptions & {
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
};
export const ListenerOptions = AkairoModuleOptions.extend({
	emitter: z.union([z.string(), z.instanceof(EventEmitter)]),
	event: z.string(),
	type: ListenerType.optional()
}).passthrough();
