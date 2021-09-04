"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
/**
 * A group of modules.
 * @param id - ID of the category.
 * @param iterable - Entries to set.
 */
class Category extends discord_js_1.Collection {
    constructor(id, iterable) {
        super(iterable);
        this.id = id;
    }
    /**
     * ID of the category.
     */
    id;
    /**
     * Calls `reload()` on all items in this category.
     */
    reloadAll() {
        for (const m of this.values()) {
            if (m.filepath)
                m.reload();
        }
        return this;
    }
    /**
     * Calls `remove()` on all items in this category.
     */
    removeAll() {
        for (const m of Array.from(this.values())) {
            if (m.filepath)
                m.remove();
        }
        return this;
    }
    /**
     * Returns the ID.
     */
    toString() {
        return this.id;
    }
}
exports.default = Category;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2F0ZWdvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbC9DYXRlZ29yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUF3QztBQUd4Qzs7OztHQUlHO0FBQ0gsTUFBcUIsUUFBbUQsU0FBUSx1QkFBZ0I7SUFDL0YsWUFBbUIsRUFBVSxFQUFFLFFBQW9DO1FBQ2xFLEtBQUssQ0FBQyxRQUFTLENBQUMsQ0FBQztRQUVqQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRDs7T0FFRztJQUNJLEVBQUUsQ0FBUztJQUVsQjs7T0FFRztJQUNJLFNBQVM7UUFDZixLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUM5QixJQUFJLENBQUMsQ0FBQyxRQUFRO2dCQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMzQjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0ksU0FBUztRQUNmLEtBQUssTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtZQUMxQyxJQUFJLENBQUMsQ0FBQyxRQUFRO2dCQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMzQjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ2EsUUFBUTtRQUN2QixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDaEIsQ0FBQztDQUNEO0FBeENELDJCQXdDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSBmcm9tIFwiLi4vc3RydWN0L0FrYWlyb01vZHVsZVwiO1xuXG4vKipcbiAqIEEgZ3JvdXAgb2YgbW9kdWxlcy5cbiAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBjYXRlZ29yeS5cbiAqIEBwYXJhbSBpdGVyYWJsZSAtIEVudHJpZXMgdG8gc2V0LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYXRlZ29yeTxLIGV4dGVuZHMgc3RyaW5nLCBWIGV4dGVuZHMgQWthaXJvTW9kdWxlPiBleHRlbmRzIENvbGxlY3Rpb248SywgVj4ge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgaXRlcmFibGU/OiBJdGVyYWJsZTxyZWFkb25seSBbSywgVl0+KSB7XG5cdFx0c3VwZXIoaXRlcmFibGUhKTtcblxuXHRcdHRoaXMuaWQgPSBpZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgY2F0ZWdvcnkuXG5cdCAqL1xuXHRwdWJsaWMgaWQ6IHN0cmluZztcblxuXHQvKipcblx0ICogQ2FsbHMgYHJlbG9hZCgpYCBvbiBhbGwgaXRlbXMgaW4gdGhpcyBjYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyByZWxvYWRBbGwoKTogdGhpcyB7XG5cdFx0Zm9yIChjb25zdCBtIG9mIHRoaXMudmFsdWVzKCkpIHtcblx0XHRcdGlmIChtLmZpbGVwYXRoKSBtLnJlbG9hZCgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxzIGByZW1vdmUoKWAgb24gYWxsIGl0ZW1zIGluIHRoaXMgY2F0ZWdvcnkuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlQWxsKCk6IHRoaXMge1xuXHRcdGZvciAoY29uc3QgbSBvZiBBcnJheS5mcm9tKHRoaXMudmFsdWVzKCkpKSB7XG5cdFx0XHRpZiAobS5maWxlcGF0aCkgbS5yZW1vdmUoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBJRC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLmlkO1xuXHR9XG59XG4iXX0=