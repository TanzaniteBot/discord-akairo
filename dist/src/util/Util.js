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
                const o1kIsObject = Object.prototype.hasOwnProperty.call(o1, k) &&
                    o1[k] &&
                    typeof o1[k] === "object";
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
        return (value &&
            typeof value.on === "function" &&
            typeof value.emit === "function");
    }
    /**
     * Checks if the supplied value is a promise.
     * @param value - Value to check.
     */
    static isPromise(value) {
        return (value &&
            typeof value.then === "function" &&
            typeof value.catch === "function");
    }
    /**
     * Compares two prefixes.
     * @param aKey - First prefix.
     * @param bKey - Second prefix.
     */
    static prefixCompare(
    // eslint-disable-next-line @typescript-eslint/ban-types
    aKey, 
    // eslint-disable-next-line @typescript-eslint/ban-types
    bKey) {
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
        return aKey.length === bKey.length
            ? aKey.localeCompare(bKey)
            : bKey.length - aKey.length;
    }
}
exports.default = Util;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNILE1BQXFCLElBQUk7SUFDeEI7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQVM7UUFDaEMsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQU8sRUFBRSxHQUFHLEVBQU87UUFDM0MsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUM7Z0JBQzdDLE1BQU0sV0FBVyxHQUNoQixNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDM0MsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDTCxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUM7Z0JBQzNCLElBQUksU0FBUyxJQUFJLFdBQVcsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzFCO3FCQUFNO29CQUNOLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ1Y7YUFDRDtTQUNEO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBTyxFQUFFLENBQU07UUFDcEMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBSSxDQUFVO1FBQ3BDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNyQixPQUFPLENBQUMsQ0FBQztTQUNUO1FBRUQsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBVTtRQUNwQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsRUFBRTtZQUNoQyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBVTtRQUN0QyxPQUFPLENBQ04sS0FBSztZQUNMLE9BQU8sS0FBSyxDQUFDLEVBQUUsS0FBSyxVQUFVO1lBQzlCLE9BQU8sS0FBSyxDQUFDLElBQUksS0FBSyxVQUFVLENBQ2hDLENBQUM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFVO1FBQ2pDLE9BQU8sQ0FDTixLQUFLO1lBQ0wsT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFVBQVU7WUFDaEMsT0FBTyxLQUFLLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FDakMsQ0FBQztJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLGFBQWE7SUFDMUIsd0RBQXdEO0lBQ3hELElBQXVCO0lBQ3ZCLHdEQUF3RDtJQUN4RCxJQUF1QjtRQUV2QixJQUFJLElBQUksS0FBSyxFQUFFLElBQUksSUFBSSxLQUFLLEVBQUU7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxJQUFJLElBQUksS0FBSyxFQUFFO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUIsSUFBSSxJQUFJLEtBQUssRUFBRTtZQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDM0IsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVLElBQUksT0FBTyxJQUFJLEtBQUssVUFBVTtZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLElBQUksT0FBTyxJQUFJLEtBQUssVUFBVTtZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLElBQUksT0FBTyxJQUFJLEtBQUssVUFBVTtZQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDMUMsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNO1lBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztZQUMxQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzlCLENBQUM7Q0FDRDtBQTFIRCx1QkEwSEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEFrYWlybyBVdGlsaXRpZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFV0aWwge1xuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHhzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGNob2ljZSguLi54czogYW55W10pOiBhbnkge1xuXHRcdGZvciAoY29uc3QgeCBvZiB4cykge1xuXHRcdFx0aWYgKHggIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4geDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gbzFcblx0ICogQHBhcmFtIG9zXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGRlZXBBc3NpZ24obzE6IGFueSwgLi4ub3M6IGFueSk6IGFueSB7XG5cdFx0Zm9yIChjb25zdCBvIG9mIG9zKSB7XG5cdFx0XHRmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhvKSkge1xuXHRcdFx0XHRjb25zdCB2SXNPYmplY3QgPSB2ICYmIHR5cGVvZiB2ID09PSBcIm9iamVjdFwiO1xuXHRcdFx0XHRjb25zdCBvMWtJc09iamVjdCA9XG5cdFx0XHRcdFx0T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8xLCBrKSAmJlxuXHRcdFx0XHRcdG8xW2tdICYmXG5cdFx0XHRcdFx0dHlwZW9mIG8xW2tdID09PSBcIm9iamVjdFwiO1xuXHRcdFx0XHRpZiAodklzT2JqZWN0ICYmIG8xa0lzT2JqZWN0KSB7XG5cdFx0XHRcdFx0VXRpbC5kZWVwQXNzaWduKG8xW2tdLCB2KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvMVtrXSA9IHY7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbzE7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHhzXG5cdCAqIEBwYXJhbSBmXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZsYXRNYXAoeHM6IGFueSwgZjogYW55KTogYW55IHtcblx0XHRjb25zdCByZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IHggb2YgeHMpIHtcblx0XHRcdHJlcy5wdXNoKC4uLmYoeCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgdGhlIHN1cHBsaWVkIHZhbHVlIGludG8gYW4gYXJyYXkgaWYgaXQgaXMgbm90IGFscmVhZHkgb25lLlxuXHQgKiBAcGFyYW0geCAtIFZhbHVlIHRvIGNvbnZlcnQuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGludG9BcnJheTxUPih4OiBUIHwgVFtdKTogVFtdIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh4KSkge1xuXHRcdFx0cmV0dXJuIHg7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFt4XTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBzb21ldGhpbmcgdG8gYmVjb21lIGNhbGxhYmxlLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBXaGF0IHRvIHR1cm4gaW50byBhIGNhbGxhYmxlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpbnRvQ2FsbGFibGUodGhpbmc6IGFueSk6IGFueSB7XG5cdFx0aWYgKHR5cGVvZiB0aGluZyA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRyZXR1cm4gdGhpbmc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICgpID0+IHRoaW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgc3VwcGxpZWQgdmFsdWUgaXMgYW4gZXZlbnQgZW1pdHRlci5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzRXZlbnRFbWl0dGVyKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0dmFsdWUgJiZcblx0XHRcdHR5cGVvZiB2YWx1ZS5vbiA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0XHR0eXBlb2YgdmFsdWUuZW1pdCA9PT0gXCJmdW5jdGlvblwiXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIHN1cHBsaWVkIHZhbHVlIGlzIGEgcHJvbWlzZS5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzUHJvbWlzZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHZhbHVlICYmXG5cdFx0XHR0eXBlb2YgdmFsdWUudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmXG5cdFx0XHR0eXBlb2YgdmFsdWUuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIlxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29tcGFyZXMgdHdvIHByZWZpeGVzLlxuXHQgKiBAcGFyYW0gYUtleSAtIEZpcnN0IHByZWZpeC5cblx0ICogQHBhcmFtIGJLZXkgLSBTZWNvbmQgcHJlZml4LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBwcmVmaXhDb21wYXJlKFxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXR5cGVzXG5cdFx0YUtleTogc3RyaW5nIHwgRnVuY3Rpb24sXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHlwZXNcblx0XHRiS2V5OiBzdHJpbmcgfCBGdW5jdGlvblxuXHQpOiBudW1iZXIge1xuXHRcdGlmIChhS2V5ID09PSBcIlwiICYmIGJLZXkgPT09IFwiXCIpIHJldHVybiAwO1xuXHRcdGlmIChhS2V5ID09PSBcIlwiKSByZXR1cm4gMTtcblx0XHRpZiAoYktleSA9PT0gXCJcIikgcmV0dXJuIC0xO1xuXHRcdGlmICh0eXBlb2YgYUtleSA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBiS2V5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiAwO1xuXHRcdGlmICh0eXBlb2YgYUtleSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gMTtcblx0XHRpZiAodHlwZW9mIGJLZXkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIC0xO1xuXHRcdHJldHVybiBhS2V5Lmxlbmd0aCA9PT0gYktleS5sZW5ndGhcblx0XHRcdD8gYUtleS5sb2NhbGVDb21wYXJlKGJLZXkpXG5cdFx0XHQ6IGJLZXkubGVuZ3RoIC0gYUtleS5sZW5ndGg7XG5cdH1cbn1cbiJdfQ==