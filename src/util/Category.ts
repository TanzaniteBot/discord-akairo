import { Collection } from "discord.js";
import type { AkairoModule } from "../struct/AkairoModule.js";

/**
 * A group of modules.
 */
export class Category<K extends string, V extends AkairoModule<any, any, any>> extends Collection<K, V> {
	/**
	 * ID of the category.
	 */
	public id: string;

	/**
	 * @param id - ID of the category.
	 * @param iterable - Entries to set.
	 */
	public constructor(id: string, iterable?: Iterable<readonly [K, V]>) {
		super(iterable);
		this.id = id;
	}

	/**
	 * Calls `reload()` on all items in this category.
	 */
	public reloadAll(): this {
		for (const m of this.values()) {
			if (m.filepath) m.reload();
		}

		return this;
	}

	/**
	 * Calls `remove()` on all items in this category.
	 */
	public removeAll(): this {
		for (const m of this.values()) {
			if (m.filepath) m.remove();
		}

		return this;
	}

	/**
	 * Returns the ID.
	 */
	public override toString(): string {
		return this.id;
	}
}
