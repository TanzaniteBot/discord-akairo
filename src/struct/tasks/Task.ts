/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
import { AkairoError } from "../../util/AkairoError.js";
import type { Category } from "../../util/Category.js";
import type { AkairoClient } from "../AkairoClient.js";
import { AkairoModule, AkairoModuleOptions } from "../AkairoModule.js";
import type { TaskHandler } from "./TaskHandler.js";

/**
 * Represents a task.
 */
export abstract class Task extends AkairoModule {
	/**
	 * The category of this task.
	 */
	public declare category: Category<string, Task>;

	/**
	 * The Akairo client.
	 */
	public declare client: AkairoClient;

	/**
	 * The time in milliseconds between each time the task is run.
	 */
	public declare delay?: number;

	/**
	 * The filepath.
	 */
	public declare filepath: string;

	/**
	 * The handler.
	 */
	public declare handler: TaskHandler;

	/**
	 * Whether or not to run the task on start.
	 */
	public declare runOnStart: boolean;

	/**
	 * @param id - Task ID.
	 * @param options - Options for the task.
	 */
	public constructor(id: string, options: TaskOptions = {}) {
		const { category, delay, runOnStart = false } = options;

		if (delay !== undefined && typeof delay !== "number") throw new TypeError("options.delay must be a number.");
		if (typeof runOnStart !== "boolean") throw new TypeError("options.runOnStart must be a boolean.");

		super(id, { category });
		this.delay = delay;
		this.runOnStart = runOnStart;
	}

	/**
	 * Executes the task.
	 * @param args - Arguments.
	 */
	public exec(...args: any[]): any {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}
}

export interface Task extends AkairoModule {
	/**
	 * Reloads the task.
	 */
	reload(): Promise<Task>;

	/**
	 * Removes the task.
	 */
	remove(): Task;

	/**
	 * Returns the ID.
	 */
	toString(): string;
}

/**
 * Options to use for task execution behavior.
 */
export interface TaskOptions extends AkairoModuleOptions {
	/**
	 * The amount of time between the task being executed.
	 */
	delay?: number;

	/**
	 * Whether or not the task runs on start.
	 * @default false
	 */
	runOnStart?: boolean;
}
