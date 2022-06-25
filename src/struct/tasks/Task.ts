/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
import { s } from "@sapphire/shapeshift";
import { patchAbstract } from "../../util/Util.js";
import { AkairoModule, akairoModuleOptionsValidator, type AkairoModuleOptions } from "../AkairoModule.js";
import type { TaskHandler } from "./TaskHandler.js";

/**
 * Represents a task.
 */
export abstract class Task extends AkairoModule<TaskHandler, Task> {
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
		const { category, delay, runOnStart } = taskOptionsValidator.parse(options);

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

export const taskOptionsValidator = akairoModuleOptionsValidator.extend({
	delay: s.number.optional,
	runOnStart: s.boolean.default(false)
}).passthrough;
