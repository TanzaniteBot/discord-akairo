// @ts-check
"use strict";

/**
 * @typedef {import("../AkairoModule").AkairoModuleOptions} AkairoModuleOptions
 * @typedef {import("./ListenerHandler").default} ListenerHandler
 */

import { EventEmitter } from "events";
import AkairoError from "../../util/AkairoError";
import AkairoModule from "../AkairoModule";

/**
 * Represents a listener.
 * @param {string} id - Listener ID.
 * @param {ListenerOptions} [options={}] - Options for the listener.
 * @extends {AkairoModule}
 */
export default class Listener extends AkairoModule {
	/**
	 * @param {string} id - The ID of this listener.
	 * @param {ListenerHandler} handler - Options for the listener
	 */
	// @ts-expect-error
	constructor(id, { category, emitter, event, type = "on" } = {}) {
		super(id, { category });

		/**
		 * The event emitter.
		 * @type {string|EventEmitter}
		 */
		this.emitter = emitter;

		/**
		 * The event name listened to.
		 * @type {string}
		 */
		this.event = event;

		/**
		 * Type of listener.
		 * @type {string}
		 */
		this.type = type;

		/**
		 * The ID of this listener.
		 * @name Listener#id
		 * @type {string}
		 */

		/**
		 * The listener handler.
		 * @name Listener#handler
		 * @type {ListenerHandler}
		 */
	}

	/**
	 * Executes the listener.
	 * @abstract
	 * @param {...any} [args] - Arguments.
	 * @returns {any}
	 */
	// eslint-disable-next-line no-unused-vars
	exec(...args) {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}

	/**
	 * Reloads the listener.
	 * @method
	 * @name Listener#reload
	 * @returns {Listener}
	 */

	/**
	 * Removes the listener.
	 * @method
	 * @name Listener#remove
	 * @returns {Listener}
	 */
}


/**
 * Options to use for listener execution behavior.
 * Also includes properties from {@link AkairoModuleOptions}.
 * @typedef {AkairoModuleOptions} ListenerOptions
 * @prop {string|EventEmitter} emitter - The event emitter, either a key from `ListenerHandler#emitters` or an EventEmitter.
 * @prop {string} event - Event name to listen to.
 * @prop {string} [type="on"] - Type of listener, either "on" or "once".
 */
