import { Collection } from "discord.js";
import AkairoModule from "../struct/AkairoModule";

/**
 * A group of modules.
 * @param id - ID of the category.
 * @param iterable - Entries to set.
 */
export default class Category<K extends string, V extends AkairoModule> extends Collection<K, V> {
	public constructor(id: string, iterable: Iterable<readonly [K, V]>) {
		super(iterable);

		this.id = id;
	}

	/**
	 * ID of the category.
	 */
	public id: string;

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
		for (const m of Array.from(this.values())) {
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
