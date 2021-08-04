import Category from "../util/Category";
import AkairoClient from "./AkairoClient";
import AkairoHandler from "./AkairoHandler";

/**
 * Base class for a module.
 * @param id - ID of module.
 * @param options - Options.
 */
export default abstract class AkairoModule {
	public constructor(
		id: string,
		{ category = "default" }: AkairoModuleOptions = {}
	) {
		this.id = id;

		this.categoryID = category;

		this.category = null;

		this.filepath = null;

		this.client = null;

		this.handler = null;
	}

	/**
	 * Category this belongs to.
	 */
	public category: Category<string, AkairoModule>;

	/**
	 * ID of the category this belongs to.
	 */
	public categoryID: string;

	/**
	 *  The Akairo client.
	 */
	public client: AkairoClient;

	/**
	 * The filepath.
	 */
	public filepath: string;

	/**
	 * The handler.
	 */
	public handler: AkairoHandler;

	/**
	 * ID of the module.
	 */
	public id: string;

	/**
	 * Reloads the module.
	 */
	reload(): AkairoModule {
		return this.handler?.reload(this.id) as this;
	}

	/**
	 * Removes the module.
	 */
	remove(): AkairoModule {
		return this.handler?.remove(this.id) as this;
	}

	/**
	 * Returns the ID.
	 */
	toString(): string {
		return this.id;
	}
}

export interface AkairoModuleOptions {
	/**
	 * Category ID for organization purposes.
	 * Defaults to `default`.
	 */
	category?: string;
}
