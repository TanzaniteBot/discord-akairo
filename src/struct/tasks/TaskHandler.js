// @ts-check
"use strict";

/**
 * @typedef {import("../AkairoClient").default} AkairoClient
 * @typedef {import("../AkairoHandler").AkairoHandlerOptions} AkairoHandlerOptions
 */

import AkairoError from "../../util/AkairoError.js";
import AkairoHandler from "../AkairoHandler.js";
import Task from "./Task.js";

const name = Task.name;

/**
 * Loads tasks.
 * @param {AkairoClient} client - The Akairo client.
 * @param {AkairoHandlerOptions} options - Options.
 * @extends {AkairoHandler}
 */
export default class TaskHandler extends AkairoHandler {
	/**
	 * @param {AkairoClient} client - The Akairo client.
	 * @param {AkairoHandlerOptions} options - Options.
	 */
	constructor(
		client,
		{
			directory,
			classToHandle = Task,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		} = {}
	) {
		if (!(classToHandle.prototype instanceof Task || classToHandle === Task)) {
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
	}

	startAll() {
		this.client.on("ready", () => {
			this.modules.forEach(module => {
				if (!(module instanceof Task)) return;
				if (module.runOnStart) module.exec();
				if (module.delay) {
					setInterval(() => {
						module.exec();
					}, Number(module.delay));
				}
			});
		});
	}
}
