/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
import { s } from "@sapphire/shapeshift";
import EventEmitter from "node:events";
import { patchAbstract } from "../../util/Util.js";
import { AkairoModule, akairoModuleOptionsValidator, type AkairoModuleOptions } from "../AkairoModule.js";
import type { ListenerHandler } from "./ListenerHandler.js";

/**
 * Represents a listener.
 */
export abstract class Listener extends AkairoModule<ListenerHandler, Listener> {
	/**
	 * The event emitter.
	 */
	public declare emitter: string | EventEmitter;

	/**
	 * The event name listened to.
	 */
	public declare event: string;

	/**
	 * Type of listener.
	 */
	public declare type: ListenerType;

	/**
	 * @param id - Listener ID.
	 * @param options - Options for the listener.
	 */
	public constructor(id: string, options: ListenerOptions) {
		const { category, emitter, event, type } = listenerOptionsValidator.parse(options);
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

const listenerOptionsValidator = akairoModuleOptionsValidator.extend(
	s.object({
		emitter: s.union(s.string, s.instance(EventEmitter)),
		event: s.string,
		type: s.enum(...listenersTypes).default("on")
	})
);
