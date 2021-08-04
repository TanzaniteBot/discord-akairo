import AkairoError from "../../util/AkairoError";
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
	public constructor(
		id: string,
		{ category, delay, runOnStart = false }: TaskOptions
	) {
		super(id, { category });

		this.delay = delay;

		this.runOnStart = runOnStart;
	}

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
	public delay: number;

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
	public runOnStart: boolean;

	/**
	 * Executes the task.
	 * @param args - Arguments.
	 */
	// @ts-expect-error
	// eslint-disable-next-line func-names, @typescript-eslint/no-unused-vars
	public abstract exec(...args: any[]): any {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}

	/**
	 * Reloads the task.
	 */
	public override reload(): Task {
		return super.reload() as Task;
	}

	/**
	 * Removes the task.
	 */
	public override remove(): Task {
		return super.remove() as Task;
	}

	/**
	 * Returns the ID.
	 */
	public override toString(): string {
		return super.toString();
	}
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
