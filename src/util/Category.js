// @ts-check
"use strict";

const { Collection } = require("discord.js");

/**
 * A group of modules.
 * @template K
 * @template V
 * @param {string} id - ID of the category.
 * @param {Iterable<[K, V][]>} [iterable] - Entries to set.
 * @extends {Collection<K, V>}
 */
class Category extends Collection {
	/**
	 * @param {string} id - ID of the category.
	 * @param {Readonly<Readonly<[any, any]>>[]} [iterable] - Entries to set.
	 */
	constructor(id, iterable) {
		super(iterable);

		/**
		 * ID of the category.
		 * @type {string}
		 */
		this.id = id;
	}

	/**
	 * Calls `reload()` on all items in this category.
	 * @returns {this}
	 */
	reloadAll() {
		for (const m of Array.from(this.values())) {
			// @ts-expect-error
			if (m.filepath) m.reload();
		}

		return this;
	}

	/**
	 * Calls `remove()` on all items in this category.
	 * @returns {this}
	 */
	removeAll() {
		for (const m of Array.from(this.values())) {
			// @ts-expect-error
			if (m.filepath) m.remove();
		}

		return this;
	}

	/**
	 * Returns the ID.
	 * @returns {string}
	 */
	toString() {
		return this.id;
	}
}

module.exports = Category;
