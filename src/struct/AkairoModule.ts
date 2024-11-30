import { z } from "zod";
import type { Category } from "../util/Category.js";
import type { AkairoClient } from "./AkairoClient.js";
import type { AkairoHandler } from "./AkairoHandler.js";

/**
 * Base class for a module.
 */
export abstract class AkairoModule<
	Handler extends AkairoHandler<Module, Handler, Events>,
	Module extends AkairoModule<Handler, Module, Events>,
	Events extends Record<keyof Events, any[]>
> {
	/**
	 * The category this module belongs to.
	 */
	public category: Category<string, this>;

	/**
	 * The ID of the category this module belongs to.
	 */
	public categoryID: string;

	/**
	 * The client thant instantiated this module.
	 */
	public client: AkairoClient;

	/**
	 * The filepath of this module.
	 */
	public filepath: string;

	/**
	 * The handler for this module.
	 */
	public handler: Handler;

	/**
	 * The ID of this module.
	 */
	public id: string;

	/**
	 * @param id The ID of module.
	 * @param options Additional options for this module.
	 */
	public constructor(id: string, options: AkairoModuleOptions = {}) {
		z.string().parse(id);
		AkairoModuleOptions.parse(options);

		const { category = "default" } = options;

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
		return this.handler.reload(this.id) as Promise<Module>;
	}

	/**
	 * Removes this module.
	 */
	public remove(): Module {
		return this.handler.remove(this.id);
	}

	/**
	 * Returns the ID of this module.
	 */
	public toString(): string {
		return this.id;
	}
}

/**
 * Options for module
 */
export type AkairoModuleOptions = {
	/**
	 * Category ID for organization purposes.
	 * @default "default"
	 */
	category?: string;
};

export const AkairoModuleOptions = z
	.object({
		category: z.string().optional()
	})
	.passthrough();
