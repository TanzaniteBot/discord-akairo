import { Awaited, Collection } from "discord.js";
import { TaskHandlerEvents } from "../../typings/events";
import AkairoError from "../../util/AkairoError";
import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoHandler, {
	AkairoHandlerOptions,
	LoadPredicate
} from "../AkairoHandler";
import Task from "./Task";

/**
 * Loads tasks.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export default class TaskHandler extends AkairoHandler {
	/**
	 * Categories, mapped by ID to Category.
	 */
	public declare categories: Collection<string, Category<string, Task>>;

	/**
	 * Class to handle.
	 */
	public declare classToHandle: typeof Task;

	/**
	 * The Akairo client
	 */
	public declare client: AkairoClient;

	/**
	 * Directory to tasks.
	 */
	public declare directory: string;

	/**
	 * Tasks loaded, mapped by ID to task.
	 */
	public declare modules: Collection<string, Task>;

	public constructor(
		client: AkairoClient,
		{
			directory,
			classToHandle = Task,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		}: AkairoHandlerOptions
	) {
		if (!(classToHandle.prototype instanceof Task || classToHandle === Task)) {
			throw new AkairoError(
				"INVALID_CLASS_TO_HANDLE",
				classToHandle.name,
				Task.name
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

	/**
	 * Deregisters a module.
	 * @param task - Module to use.
	 */
	public override deregister(task: Task): void {
		return super.deregister(task);
	}

	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	public override findCategory(name: string): Category<string, Task> {
		return super.findCategory(name) as Category<string, Task>;
	}

	/**
	 * Loads a task.
	 * @param thing - Module or path to module.
	 */
	// eslint-disable-next-line @typescript-eslint/ban-types
	public override load(thing: string | Function, isReload?: boolean): Task {
		return super.load(thing, isReload) as Task;
	}

	/**
	 * Reads all tasks from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	public override loadAll(directory?: string, filter?: LoadPredicate): TaskHandler {
		return super.loadAll(directory, filter) as TaskHandler;
	}

	/**
	 * Registers a task.
	 * @param task - Task to use.
	 * @param filepath - Filepath of task.
	 */
	public override register(task: Task, filepath?: string): void {
		return super.register(task, filepath);
	}

	/**
	 * Reloads a task.
	 * @param id - ID of the task.
	 */
	public override reload(id: string): Task {
		return super.reload(id) as Task;
	}

	/**
	 * Reloads all tasks.
	 */
	public override reloadAll(): TaskHandler {
		return super.reloadAll() as TaskHandler;
	}

	/**
	 * Removes a task.
	 * @param id - ID of the task.
	 */
	public override remove(id: string): Task {
		return super.remove(id) as Task;
	}

	/**
	 * Removes all tasks.
	 */
	public override removeAll(): TaskHandler {
		return super.removeAll() as TaskHandler;
	}

	/**
	 * Start all tasks.
	 */
	public startAll?(): void {
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

	public override on<K extends keyof TaskHandlerEvents>(
		event: K,
		listener: (...args: TaskHandlerEvents[K][]) => Awaited<void>
	): this {
		return super.on(event, listener);
	}
}
