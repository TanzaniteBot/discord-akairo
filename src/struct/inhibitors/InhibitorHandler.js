// @ts-check
"use strict";

/**
 * @typedef {import("discord.js").Collection} Collection
 * @typedef {import("../ClientUtil").AkairoClient} AkairoClient
 * @typedef {import("../AkairoHandler").AkairoHandlerOptions} AkairoHandlerOptions
 * @typedef {import("../commands/Command").default} Command
 * @typedef {import("../../util/AkairoMessage").default} AkairoMessage
 * @typedef {import("../commands/CommandUtil").Message} Message
 */

import AkairoError from "../../util/AkairoError.js";
import AkairoHandler from "../AkairoHandler.js";
import Inhibitor from "./Inhibitor.js";
import Util from "../../util/Util.js";

const name = Inhibitor.name;
/**
 * Loads inhibitors and checks messages.
 * @param {AkairoClient} client - The Akairo client.
 * @param {AkairoHandlerOptions} options - Options.
 * @extends {AkairoHandler}
 */
export default class InhibitorHandler extends AkairoHandler {
	/**
	 * @param {AkairoClient} client - The Akairo client.
	 * @param {AkairoHandlerOptions} options - Options.
	 */
	constructor(
		client,
		{
			directory,
			classToHandle = Inhibitor,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		} = {}
	) {
		if (
			!(
				classToHandle.prototype instanceof Inhibitor ||
				classToHandle === Inhibitor
			)
		) {
			throw new AkairoError(
				"INVALID_CLASS_TO_HANDLE",
				classToHandle.name,
				name
			);
		}

		super(client, {
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		});

		/**
		 * Directory to inhibitors.
		 * @name InhibitorHandler#directory
		 * @type {string}
		 */

		/**
		 * Inhibitors loaded, mapped by ID to Inhibitor.
		 * @name InhibitorHandler#modules
		 * @type {Collection<string, Inhibitor>}
		 */
	}

	/**
	 * Tests inhibitors against the message.
	 * Returns the reason if blocked.
	 * @param {string} type - Type of inhibitor, "all", "pre", or "post".
	 * @param {Message|AkairoMessage} message - Message to test.
	 * @param {Command} [command] - Command to use.
	 * @returns {Promise<string|void>}
	 */
	async test(type, message, command) {
		if (!this.modules.size) return null;

		// @ts-expect-error
		const inhibitors = this.modules.filter(i => i.type === type);
		if (!inhibitors.size) return null;

		const promises = [];

		for (const inhibitor of inhibitors.values()) {
			promises.push(
				(async () => {
					// @ts-expect-error
					let inhibited = inhibitor.exec(message, command);
					if (Util.isPromise(inhibited)) inhibited = await inhibited;
					if (inhibited) return inhibitor;
					return null;
				})()
			);
		}

		/**
		 * @type {Inhibitor[]}
		 */
		// @ts-expect-error
		const inhibitedInhibitors = (await Promise.all(promises)).filter(r => r);
		if (!inhibitedInhibitors.length) return null;

		inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
		return inhibitedInhibitors[0].reason;
	}

	/**
	 * Deregisters a module.
	 * @method
	 * @name InhibitorHandler#deregister
	 * @param {Inhibitor} inhibitor - Module to use.
	 * @returns {void}
	 */

	/**
	 * Registers a module.
	 * @method
	 * @name InhibitorHandler#register
	 * @param {Inhibitor} inhibitor - Module to use.
	 * @param {string} [filepath] - Filepath of module.
	 * @returns {void}
	 */

	/**
	 * Loads an inhibitor.
	 * @method
	 * @param {string|Inhibitor} thing - Module or path to module.
	 * @name InhibitorHandler#load
	 * @returns {Inhibitor}
	 */

	/**
	 * Reads all inhibitors from the directory and loads them.
	 * @method
	 * @name InhibitorHandler#loadAll
	 * @param {string} [directory] - Directory to load from.
	 * Defaults to the directory passed in the constructor.
	 * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
	 * @returns {InhibitorHandler}
	 */

	/**
	 * Removes an inhibitor.
	 * @method
	 * @name InhibitorHandler#remove
	 * @param {string} id - ID of the inhibitor.
	 * @returns {Inhibitor}
	 */

	/**
	 * Removes all inhibitors.
	 * @method
	 * @name InhibitorHandler#removeAll
	 * @returns {InhibitorHandler}
	 */

	/**
	 * Reloads an inhibitor.
	 * @method
	 * @name InhibitorHandler#reload
	 * @param {string} id - ID of the inhibitor.
	 * @returns {Inhibitor}
	 */

	/**
	 * Reloads all inhibitors.
	 * @method
	 * @name InhibitorHandler#reloadAll
	 * @returns {InhibitorHandler}
	 */
}

/**
 * Emitted when an inhibitor is loaded.
 * @event InhibitorHandler#load
 * @param {Inhibitor} inhibitor - Inhibitor loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when an inhibitor is removed.
 * @event InhibitorHandler#remove
 * @param {Inhibitor} inhibitor - Inhibitor removed.
 */
