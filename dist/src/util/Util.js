"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Akairo Utilities.
 */
class Util {
    /**
     *
     * @param xs
     */
    static choice(...xs) {
        for (const x of xs) {
            if (x != null) {
                return x;
            }
        }
        return null;
    }
    /**
     *
     * @param o1
     * @param os
     */
    static deepAssign(o1, ...os) {
        for (const o of os) {
            for (const [k, v] of Object.entries(o)) {
                const vIsObject = v && typeof v === "object";
                const o1kIsObject = Object.prototype.hasOwnProperty.call(o1, k) && o1[k] && typeof o1[k] === "object";
                if (vIsObject && o1kIsObject) {
                    Util.deepAssign(o1[k], v);
                }
                else {
                    o1[k] = v;
                }
            }
        }
        return o1;
    }
    /**
     *
     * @param xs
     * @param f
     */
    static flatMap(xs, f) {
        const res = [];
        for (const x of xs) {
            res.push(...f(x));
        }
        return res;
    }
    /**
     * Converts the supplied value into an array if it is not already one.
     * @param x - Value to convert.
     */
    static intoArray(x) {
        if (Array.isArray(x)) {
            return x;
        }
        return [x];
    }
    /**
     * Converts something to become callable.
     * @param thing - What to turn into a callable.
     */
    static intoCallable(thing) {
        if (typeof thing === "function") {
            return thing;
        }
        return () => thing;
    }
    /**
     * Checks if the supplied value is an event emitter.
     * @param value - Value to check.
     */
    static isEventEmitter(value) {
        return value && typeof value.on === "function" && typeof value.emit === "function";
    }
    /**
     * Checks if the supplied value is a promise.
     * @param value - Value to check.
     */
    static isPromise(value) {
        return value && typeof value.then === "function" && typeof value.catch === "function";
    }
    /**
     * Compares two prefixes.
     * @param aKey - First prefix.
     * @param bKey - Second prefix.
     */
    static prefixCompare(aKey, bKey) {
        if (aKey === "" && bKey === "")
            return 0;
        if (aKey === "")
            return 1;
        if (bKey === "")
            return -1;
        if (typeof aKey === "function" && typeof bKey === "function")
            return 0;
        if (typeof aKey === "function")
            return 1;
        if (typeof bKey === "function")
            return -1;
        return aKey.length === bKey.length ? aKey.localeCompare(bKey) : bKey.length - aKey.length;
    }
}
exports.default = Util;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNILE1BQXFCLElBQUk7SUFDeEI7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQVM7UUFDaEMsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQU8sRUFBRSxHQUFHLEVBQU87UUFDM0MsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUM7Z0JBQzdDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQztnQkFDdEcsSUFBSSxTQUFTLElBQUksV0FBVyxFQUFFO29CQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDMUI7cUJBQU07b0JBQ04sRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDVjthQUNEO1NBQ0Q7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFPLEVBQUUsQ0FBTTtRQUNwQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDZixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEI7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsU0FBUyxDQUFJLENBQVU7UUFDcEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxDQUFDO1NBQ1Q7UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFVO1FBQ3BDLElBQUksT0FBTyxLQUFLLEtBQUssVUFBVSxFQUFFO1lBQ2hDLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxPQUFPLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFVO1FBQ3RDLE9BQU8sS0FBSyxJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUUsS0FBSyxVQUFVLElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQztJQUNwRixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFVO1FBQ2pDLE9BQU8sS0FBSyxJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksS0FBSyxVQUFVLElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQztJQUN2RixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxhQUFhLENBQzFCLElBQXdDLEVBQ3hDLElBQXdDO1FBRXhDLElBQUksSUFBSSxLQUFLLEVBQUUsSUFBSSxJQUFJLEtBQUssRUFBRTtZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLElBQUksSUFBSSxLQUFLLEVBQUU7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxQixJQUFJLElBQUksS0FBSyxFQUFFO1lBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVUsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkUsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVO1lBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzNGLENBQUM7Q0FDRDtBQTNHRCx1QkEyR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEFrYWlybyBVdGlsaXRpZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFV0aWwge1xuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHhzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGNob2ljZSguLi54czogYW55W10pOiBhbnkge1xuXHRcdGZvciAoY29uc3QgeCBvZiB4cykge1xuXHRcdFx0aWYgKHggIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4geDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gbzFcblx0ICogQHBhcmFtIG9zXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGRlZXBBc3NpZ24obzE6IGFueSwgLi4ub3M6IGFueSk6IGFueSB7XG5cdFx0Zm9yIChjb25zdCBvIG9mIG9zKSB7XG5cdFx0XHRmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhvKSkge1xuXHRcdFx0XHRjb25zdCB2SXNPYmplY3QgPSB2ICYmIHR5cGVvZiB2ID09PSBcIm9iamVjdFwiO1xuXHRcdFx0XHRjb25zdCBvMWtJc09iamVjdCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvMSwgaykgJiYgbzFba10gJiYgdHlwZW9mIG8xW2tdID09PSBcIm9iamVjdFwiO1xuXHRcdFx0XHRpZiAodklzT2JqZWN0ICYmIG8xa0lzT2JqZWN0KSB7XG5cdFx0XHRcdFx0VXRpbC5kZWVwQXNzaWduKG8xW2tdLCB2KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvMVtrXSA9IHY7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbzE7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHhzXG5cdCAqIEBwYXJhbSBmXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZsYXRNYXAoeHM6IGFueSwgZjogYW55KTogYW55IHtcblx0XHRjb25zdCByZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IHggb2YgeHMpIHtcblx0XHRcdHJlcy5wdXNoKC4uLmYoeCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgdGhlIHN1cHBsaWVkIHZhbHVlIGludG8gYW4gYXJyYXkgaWYgaXQgaXMgbm90IGFscmVhZHkgb25lLlxuXHQgKiBAcGFyYW0geCAtIFZhbHVlIHRvIGNvbnZlcnQuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGludG9BcnJheTxUPih4OiBUIHwgVFtdKTogVFtdIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh4KSkge1xuXHRcdFx0cmV0dXJuIHg7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFt4XTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBzb21ldGhpbmcgdG8gYmVjb21lIGNhbGxhYmxlLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBXaGF0IHRvIHR1cm4gaW50byBhIGNhbGxhYmxlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpbnRvQ2FsbGFibGUodGhpbmc6IGFueSk6IGFueSB7XG5cdFx0aWYgKHR5cGVvZiB0aGluZyA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRyZXR1cm4gdGhpbmc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICgpID0+IHRoaW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgc3VwcGxpZWQgdmFsdWUgaXMgYW4gZXZlbnQgZW1pdHRlci5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzRXZlbnRFbWl0dGVyKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLm9uID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbHVlLmVtaXQgPT09IFwiZnVuY3Rpb25cIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIHN1cHBsaWVkIHZhbHVlIGlzIGEgcHJvbWlzZS5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzUHJvbWlzZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbHVlLmNhdGNoID09PSBcImZ1bmN0aW9uXCI7XG5cdH1cblxuXHQvKipcblx0ICogQ29tcGFyZXMgdHdvIHByZWZpeGVzLlxuXHQgKiBAcGFyYW0gYUtleSAtIEZpcnN0IHByZWZpeC5cblx0ICogQHBhcmFtIGJLZXkgLSBTZWNvbmQgcHJlZml4LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBwcmVmaXhDb21wYXJlKFxuXHRcdGFLZXk6IHN0cmluZyB8ICgoLi4uYXJnczogYW55W10pID0+IGFueSksXG5cdFx0YktleTogc3RyaW5nIHwgKCguLi5hcmdzOiBhbnlbXSkgPT4gYW55KVxuXHQpOiBudW1iZXIge1xuXHRcdGlmIChhS2V5ID09PSBcIlwiICYmIGJLZXkgPT09IFwiXCIpIHJldHVybiAwO1xuXHRcdGlmIChhS2V5ID09PSBcIlwiKSByZXR1cm4gMTtcblx0XHRpZiAoYktleSA9PT0gXCJcIikgcmV0dXJuIC0xO1xuXHRcdGlmICh0eXBlb2YgYUtleSA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBiS2V5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiAwO1xuXHRcdGlmICh0eXBlb2YgYUtleSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gMTtcblx0XHRpZiAodHlwZW9mIGJLZXkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIC0xO1xuXHRcdHJldHVybiBhS2V5Lmxlbmd0aCA9PT0gYktleS5sZW5ndGggPyBhS2V5LmxvY2FsZUNvbXBhcmUoYktleSkgOiBiS2V5Lmxlbmd0aCAtIGFLZXkubGVuZ3RoO1xuXHR9XG59XG4iXX0=