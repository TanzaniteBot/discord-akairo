// @ts-check
"use strict";

/**
 * @typedef {import("../AkairoModule").AkairoModuleOptions} AkairoModuleOptions
 * @typedef {import("./InhibitorHandler").Command} Command
 */
/**
 * @typedef {Object} TempMessage
 * @property {import("../commands/CommandUtil").default} [util] - command util
 * @typedef {import("discord.js").Message & TempMessage} Message
 */

import AkairoError from "../../util/AkairoError.js";
import AkairoModule from "../AkairoModule.js";

/**
 * Represents an inhibitor.
 * @param {string} id - Inhibitor ID.
 * @param {InhibitorOptions} [options={reason = "", type = "post",priority = 0 }] - Options for the inhibitor.
 * @extends {AkairoModule}
 */
export default class Inhibitor extends AkairoModule {
	/**
	 * @param {string} id - Inhibitor ID.
	 * @param {InhibitorOptions} [options={reason = "", type = "post",priority = 0}] - Options for the inhibitor.
	 */
	// @ts-expect-error
	constructor(id, { category, reason = "", type = "post", priority = 0 } = {}) {
		super(id, { category });

		/**
		 * Reason emitted when command is inhibited.
		 * @type {string}
		 */
		this.reason = reason;

		/**
		 * The type of the inhibitor for when it should run.
		 * @type {string}
		 */
		this.type = type;

		/**
		 * The priority of the inhibitor.
		 * @type {number}
		 */
		this.priority = priority;

		/**
		 * The ID of this inhibitor.
		 * @name Inhibitor#id
		 * @type {string}
		 */

		/**
		 * The inhibitor handler.
		 * @name Inhibitor#handler
		 * @type {InhibitorHandler}
		 */
	}

	/**
	 * Checks if message should be blocked.
	 * A return value of true will block the message.
	 * If returning a Promise, a resolved value of true will block the message.
	 * @abstract
	 * @param {Message} message - Message being handled.
	 * @param {Command} [command] - Command to check.
	 * @returns {boolean|Promise<boolean>}
	 */
	// eslint-disable-next-line no-unused-vars
	exec(message, command) {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}

	/**
	 * Reloads the inhibitor.
	 * @method
	 * @name Inhibitor#reload
	 * @returns {Inhibitor}
	 */

	/**
	 * Removes the inhibitor.
	 * @method
	 * @name Inhibitor#remove
	 * @returns {Inhibitor}
	 */
}

/**
 * Options to use for inhibitor execution behavior.
 * Also includes properties from AkairoModuleOptions.
 * @typedef {AkairoModuleOptions}  InhibitorOptions
 * @prop {string} [reason=""] - Reason emitted when command or message is blocked.
 * @prop {string} [type="post"] - Can be "all" to run on all messages, "pre" to run on messages not blocked by the built-in inhibitors, or "post" to run on messages that are commands.
 * @prop {number} [priority=0] - Priority for the inhibitor for when more than one inhibitors block a message.
 * The inhibitor with the highest priority is the one that is used for the block reason.
 */
