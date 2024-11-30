import { z } from "zod";
import { type TaskHandlerEvents } from "../../typings/events.js";
import { patchAbstract } from "../../util/Util.js";
import { AkairoModule, AkairoModuleOptions } from "../AkairoModule.js";
import type { TaskHandler } from "./TaskHandler.js";

/**
 * Represents a task.
 */
export abstract class Task extends AkairoModule<TaskHandler, Task, TaskHandlerEvents> {
	/**
	 * The time in milliseconds between each time the task is run.
	 */
	public delay?: number;

	/**
	 * Whether or not to run the task on start.
	 */
	public runOnStart: boolean;

	/**
	 * @param id - Task ID.
	 * @param options - Options for the task.
	 */
	public constructor(id: string, options: TaskOptions = {}) {
		TaskOptions.parse(options);

		const { category, delay, runOnStart = false } = options;

		super(id, { category });
		this.delay = delay;
		this.runOnStart = runOnStart;
	}

	/**
	 * Executes the task.
	 * @param args - Arguments.
	 */
	public abstract exec(...args: any[]): any;
}

patchAbstract(Task, "exec");

/**
 * Options to use for task execution behavior.
 */
export type TaskOptions = AkairoModuleOptions & {
	/**
	 * The amount of time between the task being executed.
	 */
	delay?: number;

	/**
	 * Whether or not the task runs on start.
	 * @default false
	 */
	runOnStart?: boolean;
};

export const TaskOptions = AkairoModuleOptions.extend({
	delay: z.number().optional(),
	runOnStart: z.boolean().optional()
}).passthrough();
