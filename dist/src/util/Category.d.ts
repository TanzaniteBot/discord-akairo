import { Collection } from "discord.js";
import AkairoModule from "../struct/AkairoModule";
/**
 * A group of modules.
 * @param id - ID of the category.
 * @param iterable - Entries to set.
 */
export default class Category<K extends string, V extends AkairoModule> extends Collection<K, V> {
    constructor(id: string, iterable?: Iterable<readonly [K, V]>);
    /**
     * ID of the category.
     */
    id: string;
    /**
     * Calls `reload()` on all items in this category.
     */
    reloadAll(): this;
    /**
     * Calls `remove()` on all items in this category.
     */
    removeAll(): this;
    /**
     * Returns the ID.
     */
    toString(): string;
}
//# sourceMappingURL=Category.d.ts.map