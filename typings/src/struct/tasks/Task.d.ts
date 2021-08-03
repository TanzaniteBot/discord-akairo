import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule";
import TaskHandler from "./TaskHandler";
/**
 * Represents a task.
 * @param id - Task ID.
 * @param options - Options for the task.
 */
export default abstract class Task extends AkairoModule {
	/**
	 * The category of this task.
	 */
	category: Category<string, Task>;
	/**
	 * The Akairo client.
	 */
	client: AkairoClient;
	/**
	 * The time in milliseconds between each time the task is run.
	 */
	delay: number;
	/**
	 * The filepath.
	 */
	filepath: string;
	/**
	 * The handler.
	 */
	handler: TaskHandler;
	/**
	 * Whether or not to run the task on start.
	 */
	runOnStart: boolean;
	constructor(id: string, { category, delay, runOnStart }: TaskOptions);
	/**
	 * Executes the task.
	 * @param args - Arguments.
	 */
	abstract exec(...args: any[]): any;
	/**
	 * Reloads the task.
	 */
	reload(): Task;
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
	 */
	runOnStart?: boolean;
}
//# sourceMappingURL=Task.d.ts.map
