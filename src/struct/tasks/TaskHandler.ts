import type { TaskHandlerEvents } from "../../typings/events.js";
import { AkairoError } from "../../util/AkairoError.js";
import type { AkairoClient } from "../AkairoClient.js";
import { AkairoHandler, type AkairoHandlerOptions } from "../AkairoHandler.js";
import { Task } from "./Task.js";

/**
 * Loads tasks.
 */
export class TaskHandler extends AkairoHandler<Task, TaskHandler, TaskHandlerEvents> {
	/**
	 * @param client - The Akairo client.
	 * @param options - Options.
	 */
	public constructor(client: AkairoClient, options: AkairoHandlerOptions<Task, TaskHandler, TaskHandlerEvents>) {
		const { directory, classToHandle = Task, extensions = [".js", ".ts"], automateCategories, loadFilter } = options;

		if (!(classToHandle.prototype instanceof Task || classToHandle === Task)) {
			throw new AkairoError("INVALID_CLASS_TO_HANDLE", classToHandle.name, Task.name);
		}

		super(client, { directory, classToHandle, extensions, automateCategories, loadFilter });
	}

	/**
	 * Start all tasks.
	 */
	public startAll(): void {
		this.client.once("clientReady", () => {
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
