import type { Category } from "../util/Category.js";
import type { AkairoClient } from "./AkairoClient.js";
import type { AkairoHandler } from "./AkairoHandler.js";

/**
 * Base class for a module.
 */
export abstract class AkairoModule<Handler extends AkairoHandler<Module, Handler>, Module extends AkairoModule<Handler, Module>> {
	/**
	 * The category this module belongs to.
	 */
	public declare category: Category<string, this>;

	/**
	 * The ID of the category this module belongs to.
	 */
	public declare categoryID: string;

	/**
	 * The client thant instantiated this module.
	 */
	public declare client: AkairoClient;

	/**
	 * The filepath of this module.
	 */
	public declare filepath: string;

	/**
	 * The handler for this module.
	 */
	public declare handler: Handler;

	/**
	 * The ID of this module.
	 */
	public declare id: string;

	/**
	 * @param id The ID of module.
	 * @param options Additional options for this module.
	 */
	public constructor(id: string, options?: AkairoModuleOptions) {
		const { category = "default" } = options ?? {};

		if (typeof category !== "string") throw new TypeError("options.category must be a string.");

		this.id = id;
		this.categoryID = category;
		this.category = null!;
		this.filepath = null!;
		this.client = null!;
		this.handler = null!;
	}

	/**
	 * Reloads this module.
	 */
	public reload(): Promise<Module> {
		return this.handler?.reload(this.id) as Promise<Module>;
	}

	/**
	 * Removes this module.
	 */
	public remove(): Module {
		return this.handler?.remove(this.id) as Module;
	}

	/**
	 * Returns the ID of this module.
	 */
	public toString(): string {
		return this.id;
	}
}

export interface AkairoModuleOptions {
	/**
	 * Category ID for organization purposes.
	 * @default "default"
	 */
	category?: string;
}
