"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Akairo Utilities.
 */
class Util {
    /**
     * Choose the first non-null element in an array
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7R0FFRztBQUNILE1BQXFCLElBQUk7SUFDeEI7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBSSxHQUFHLEVBQU87UUFDakMsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQU8sRUFBRSxHQUFHLEVBQU87UUFDM0MsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUM7Z0JBQzdDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQztnQkFDdEcsSUFBSSxTQUFTLElBQUksV0FBVyxFQUFFO29CQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDMUI7cUJBQU07b0JBQ04sRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDVjthQUNEO1NBQ0Q7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFPLEVBQUUsQ0FBTTtRQUNwQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDZixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbEI7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsU0FBUyxDQUFJLENBQVU7UUFDcEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxDQUFDO1NBQ1Q7UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDWixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFlBQVksQ0FBSSxLQUFrQztRQUMvRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsRUFBRTtZQUNoQyxPQUFPLEtBQWdCLENBQUM7U0FDeEI7UUFFRCxPQUFPLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFVO1FBQ3RDLE9BQU8sS0FBSyxJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUUsS0FBSyxVQUFVLElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQztJQUNwRixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFVO1FBQ2pDLE9BQU8sS0FBSyxJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksS0FBSyxVQUFVLElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FBQztJQUN2RixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxhQUFhLENBQzFCLElBQXdDLEVBQ3hDLElBQXdDO1FBRXhDLElBQUksSUFBSSxLQUFLLEVBQUUsSUFBSSxJQUFJLEtBQUssRUFBRTtZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLElBQUksSUFBSSxLQUFLLEVBQUU7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxQixJQUFJLElBQUksS0FBSyxFQUFFO1lBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVUsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkUsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVO1lBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMxQyxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzNGLENBQUM7Q0FDRDtBQTNHRCx1QkEyR0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcblxuLyoqXG4gKiBBa2Fpcm8gVXRpbGl0aWVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVdGlsIHtcblx0LyoqXG5cdCAqIENob29zZSB0aGUgZmlyc3Qgbm9uLW51bGwgZWxlbWVudCBpbiBhbiBhcnJheVxuXHQgKiBAcGFyYW0geHNcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgY2hvaWNlPFQ+KC4uLnhzOiBUW10pOiBUIHwgbnVsbCB7XG5cdFx0Zm9yIChjb25zdCB4IG9mIHhzKSB7XG5cdFx0XHRpZiAoeCAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiB4O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBvMVxuXHQgKiBAcGFyYW0gb3Ncblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZGVlcEFzc2lnbihvMTogYW55LCAuLi5vczogYW55KTogYW55IHtcblx0XHRmb3IgKGNvbnN0IG8gb2Ygb3MpIHtcblx0XHRcdGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKG8pKSB7XG5cdFx0XHRcdGNvbnN0IHZJc09iamVjdCA9IHYgJiYgdHlwZW9mIHYgPT09IFwib2JqZWN0XCI7XG5cdFx0XHRcdGNvbnN0IG8xa0lzT2JqZWN0ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8xLCBrKSAmJiBvMVtrXSAmJiB0eXBlb2YgbzFba10gPT09IFwib2JqZWN0XCI7XG5cdFx0XHRcdGlmICh2SXNPYmplY3QgJiYgbzFrSXNPYmplY3QpIHtcblx0XHRcdFx0XHRVdGlsLmRlZXBBc3NpZ24obzFba10sIHYpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG8xW2tdID0gdjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvMTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0geHNcblx0ICogQHBhcmFtIGZcblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZmxhdE1hcCh4czogYW55LCBmOiBhbnkpOiBhbnkge1xuXHRcdGNvbnN0IHJlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgeCBvZiB4cykge1xuXHRcdFx0cmVzLnB1c2goLi4uZih4KSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyB0aGUgc3VwcGxpZWQgdmFsdWUgaW50byBhbiBhcnJheSBpZiBpdCBpcyBub3QgYWxyZWFkeSBvbmUuXG5cdCAqIEBwYXJhbSB4IC0gVmFsdWUgdG8gY29udmVydC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaW50b0FycmF5PFQ+KHg6IFQgfCBUW10pOiBUW10ge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHgpKSB7XG5cdFx0XHRyZXR1cm4geDtcblx0XHR9XG5cblx0XHRyZXR1cm4gW3hdO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIHNvbWV0aGluZyB0byBiZWNvbWUgY2FsbGFibGUuXG5cdCAqIEBwYXJhbSB0aGluZyAtIFdoYXQgdG8gdHVybiBpbnRvIGEgY2FsbGFibGUuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGludG9DYWxsYWJsZTxUPih0aGluZzogVCB8ICgoLi4uYXJnczogYW55W10pID0+IFQpKTogKC4uLmFyZ3M6IGFueVtdKSA9PiBUIHtcblx0XHRpZiAodHlwZW9mIHRoaW5nID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHJldHVybiB0aGluZyBhcyAoKSA9PiBUO1xuXHRcdH1cblxuXHRcdHJldHVybiAoKSA9PiB0aGluZztcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIHN1cHBsaWVkIHZhbHVlIGlzIGFuIGV2ZW50IGVtaXR0ZXIuXG5cdCAqIEBwYXJhbSB2YWx1ZSAtIFZhbHVlIHRvIGNoZWNrLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpc0V2ZW50RW1pdHRlcih2YWx1ZTogYW55KTogdmFsdWUgaXMgRXZlbnRFbWl0dGVyIHtcblx0XHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLm9uID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbHVlLmVtaXQgPT09IFwiZnVuY3Rpb25cIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIHN1cHBsaWVkIHZhbHVlIGlzIGEgcHJvbWlzZS5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzUHJvbWlzZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsdWUuY2F0Y2ggPT09IFwiZnVuY3Rpb25cIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb21wYXJlcyB0d28gcHJlZml4ZXMuXG5cdCAqIEBwYXJhbSBhS2V5IC0gRmlyc3QgcHJlZml4LlxuXHQgKiBAcGFyYW0gYktleSAtIFNlY29uZCBwcmVmaXguXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHByZWZpeENvbXBhcmUoXG5cdFx0YUtleTogc3RyaW5nIHwgKCguLi5hcmdzOiBhbnlbXSkgPT4gYW55KSxcblx0XHRiS2V5OiBzdHJpbmcgfCAoKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpXG5cdCk6IG51bWJlciB7XG5cdFx0aWYgKGFLZXkgPT09IFwiXCIgJiYgYktleSA9PT0gXCJcIikgcmV0dXJuIDA7XG5cdFx0aWYgKGFLZXkgPT09IFwiXCIpIHJldHVybiAxO1xuXHRcdGlmIChiS2V5ID09PSBcIlwiKSByZXR1cm4gLTE7XG5cdFx0aWYgKHR5cGVvZiBhS2V5ID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGJLZXkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIDA7XG5cdFx0aWYgKHR5cGVvZiBhS2V5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiAxO1xuXHRcdGlmICh0eXBlb2YgYktleSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gLTE7XG5cdFx0cmV0dXJuIGFLZXkubGVuZ3RoID09PSBiS2V5Lmxlbmd0aCA/IGFLZXkubG9jYWxlQ29tcGFyZShiS2V5KSA6IGJLZXkubGVuZ3RoIC0gYUtleS5sZW5ndGg7XG5cdH1cbn1cbiJdfQ==