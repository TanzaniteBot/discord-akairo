import type { Category } from "../util/Category.js";
import type { AkairoClient } from "./AkairoClient.js";
import type { AkairoHandler } from "./AkairoHandler.js";

/**
 * Base class for a module.
 */
export abstract class AkairoModule {
	/**
	 * Category this belongs to.
	 */
	public declare category: Category<string, AkairoModule>;

	/**
	 * ID of the category this belongs to.
	 */
	public declare categoryID: string;

	/**
	 * The Akairo client.
	 */
	public declare client: AkairoClient;

	/**
	 * The filepath.
	 */
	public declare filepath: string;

	/**
	 * The handler.
	 */
	public declare handler: AkairoHandler;

	/**
	 * ID of the module.
	 */
	public declare id: string;

	/**
	 * @param id - ID of module.
	 * @param options - Options.
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
	 * Reloads the module.
	 */
	public reload(): Promise<AkairoModule> {
		return this.handler?.reload(this.id) as Promise<this>;
	}

	/**
	 * Removes the module.
	 */
	public remove(): AkairoModule {
		return this.handler?.remove(this.id) as this;
	}

	/**
	 * Returns the ID.
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
