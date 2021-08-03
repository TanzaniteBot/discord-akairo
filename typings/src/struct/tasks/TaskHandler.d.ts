import { Awaited, Collection } from "discord.js";
import { TaskHandlerEvents } from "../../typings/events";
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
	categories: Collection<string, Category<string, Task>>;
	/**
	 * Class to handle.
	 */
	classToHandle: typeof Task;
	/**
	 * The Akairo client
	 */
	client: AkairoClient;
	/**
	 * Directory to tasks.
	 */
	directory: string;
	/**
	 * Tasks loaded, mapped by ID to task.
	 */
	modules: Collection<string, Task>;
	constructor(
		client: AkairoClient,
		{
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		}: AkairoHandlerOptions
	);
	/**
	 * Deregisters a module.
	 * @param task - Module to use.
	 */
	deregister(task: Task): void;
	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	findCategory(name: string): Category<string, Task>;
	/**
	 * Loads a task.
	 * @param thing - Module or path to module.
	 */
	load(thing: string | Function, isReload?: boolean): Task;
	/**
	 * Reads all tasks from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	loadAll(directory?: string, filter?: LoadPredicate): TaskHandler;
	/**
	 * Registers a task.
	 * @param task - Task to use.
	 * @param filepath - Filepath of task.
	 */
	register(task: Task, filepath?: string): void;
	/**
	 * Reloads a task.
	 * @param id - ID of the task.
	 */
	reload(id: string): Task;
	/**
	 * Reloads all tasks.
	 */
	reloadAll(): TaskHandler;
	/**
	 * Removes a task.
	 * @param id - ID of the task.
	 */
	remove(id: string): Task;
	/**
	 * Removes all tasks.
	 */
	removeAll(): TaskHandler;
	/**
	 * Start all tasks.
	 */
	startAll?(): void;
	on<K extends keyof TaskHandlerEvents>(
		event: K,
		listener: (...args: TaskHandlerEvents[K][]) => Awaited<void>
	): this;
}
//# sourceMappingURL=TaskHandler.d.ts.map
