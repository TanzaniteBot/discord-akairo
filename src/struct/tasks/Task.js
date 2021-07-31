// @ts-check
"use strict";

/**
 * @typedef {import('../AkairoModule').AkairoModuleOptions} AkairoModuleOptions
 * @typedef {import('./TaskHandler')} TaskHandler
 */

const AkairoError = require("../../util/AkairoError");
const AkairoModule = require("../AkairoModule");

/**
 * Represents a task.
 * @param {string} id - Listener ID.
 * @param {TaskOptions} [options={}] - Options for the listener.
 * @extends {AkairoModule}
 */
class Task extends AkairoModule {
	/**
	 * @param {string} id - The ID of this task.
	 * @param {TaskHandler} handler - Options for the task
	 */
	// @ts-expect-error
	constructor(id, { category, delay, runOnStart = false } = {}) {
		super(id, { category });

		/**
		 * The amount of time between the task being executed.
		 * @type {number}
		 */
		this.delay = delay;

		/**
		 * Whether or not the task runs on start.
		 * @type {boolean}
		 */
		this.runOnStart = runOnStart;

		/**
		 * The ID of this task.
		 * @name Task#id
		 * @type {string}
		 */

		/**
		 * The task handler.
		 * @name Task#handler
		 * @type {TaskHandler}
		 */
	}

	/**
	 * Executes the task.
	 * @abstract
	 * @param {...any[]} [args] - Arguments.
	 * @returns {any}
	 */
	// @ts-expect-error
	// eslint-disable-next-line no-unused-vars
	exec(...args) {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}

	/**
	 * Reloads the task.
	 * @method
	 * @name Task#reload
	 * @returns {Task}
	 */

	/**
	 * Removes the task.
	 * @method
	 * @name Task#remove
	 * @returns {Task}
	 */
}

module.exports = Task;

/**
 * Options to use for task execution behavior.
 * Also includes properties from {@link AkairoModuleOptions}.
 * @typedef {AkairoModuleOptions} TaskOptions
 * @prop {number} delay The amount of time between the task being executed.
 * @prop {boolean} runOnStart Whether or not the task runs on start.
 * @prop {string} event - Event name to listen to.
 * @prop {string} [type='on'] - Type of listener, either 'on' or 'once'.
 */
