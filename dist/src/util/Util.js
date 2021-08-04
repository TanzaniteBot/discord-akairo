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
        return aKey.length === bKey.length
            ? aKey.localeCompare(bKey)
            : bKey.length - aKey.length;
    }
}
exports.default = Util;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNILE1BQXFCLElBQUk7SUFDeEI7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQVM7UUFDaEMsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQU8sRUFBRSxHQUFHLEVBQU87UUFDM0MsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUM7Z0JBQzdDLE1BQU0sV0FBVyxHQUNoQixNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDM0MsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDTCxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUM7Z0JBQzNCLElBQUksU0FBUyxJQUFJLFdBQVcsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzFCO3FCQUFNO29CQUNOLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ1Y7YUFDRDtTQUNEO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBTyxFQUFFLENBQU07UUFDcEMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2YsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBSSxDQUFVO1FBQ3BDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNyQixPQUFPLENBQUMsQ0FBQztTQUNUO1FBRUQsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBVTtRQUNwQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFVBQVUsRUFBRTtZQUNoQyxPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBVTtRQUN0QyxPQUFPLENBQ04sS0FBSztZQUNMLE9BQU8sS0FBSyxDQUFDLEVBQUUsS0FBSyxVQUFVO1lBQzlCLE9BQU8sS0FBSyxDQUFDLElBQUksS0FBSyxVQUFVLENBQ2hDLENBQUM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFVO1FBQ2pDLE9BQU8sQ0FDTixLQUFLO1lBQ0wsT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFVBQVU7WUFDaEMsT0FBTyxLQUFLLENBQUMsS0FBSyxLQUFLLFVBQVUsQ0FDakMsQ0FBQztJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLGFBQWEsQ0FDMUIsSUFBd0MsRUFDeEMsSUFBd0M7UUFFeEMsSUFBSSxJQUFJLEtBQUssRUFBRSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDekMsSUFBSSxJQUFJLEtBQUssRUFBRTtZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLElBQUksSUFBSSxLQUFLLEVBQUU7WUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksT0FBTyxJQUFJLEtBQUssVUFBVSxJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVU7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RSxJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVU7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVU7WUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTTtZQUNqQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM5QixDQUFDO0NBQ0Q7QUF4SEQsdUJBd0hDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBa2Fpcm8gVXRpbGl0aWVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVdGlsIHtcblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSB4c1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBjaG9pY2UoLi4ueHM6IGFueVtdKTogYW55IHtcblx0XHRmb3IgKGNvbnN0IHggb2YgeHMpIHtcblx0XHRcdGlmICh4ICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIG8xXG5cdCAqIEBwYXJhbSBvc1xuXHQgKi9cblx0cHVibGljIHN0YXRpYyBkZWVwQXNzaWduKG8xOiBhbnksIC4uLm9zOiBhbnkpOiBhbnkge1xuXHRcdGZvciAoY29uc3QgbyBvZiBvcykge1xuXHRcdFx0Zm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMobykpIHtcblx0XHRcdFx0Y29uc3QgdklzT2JqZWN0ID0gdiAmJiB0eXBlb2YgdiA9PT0gXCJvYmplY3RcIjtcblx0XHRcdFx0Y29uc3QgbzFrSXNPYmplY3QgPVxuXHRcdFx0XHRcdE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvMSwgaykgJiZcblx0XHRcdFx0XHRvMVtrXSAmJlxuXHRcdFx0XHRcdHR5cGVvZiBvMVtrXSA9PT0gXCJvYmplY3RcIjtcblx0XHRcdFx0aWYgKHZJc09iamVjdCAmJiBvMWtJc09iamVjdCkge1xuXHRcdFx0XHRcdFV0aWwuZGVlcEFzc2lnbihvMVtrXSwgdik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bzFba10gPSB2O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG8xO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSB4c1xuXHQgKiBAcGFyYW0gZlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBmbGF0TWFwKHhzOiBhbnksIGY6IGFueSk6IGFueSB7XG5cdFx0Y29uc3QgcmVzID0gW107XG5cdFx0Zm9yIChjb25zdCB4IG9mIHhzKSB7XG5cdFx0XHRyZXMucHVzaCguLi5mKHgpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIHRoZSBzdXBwbGllZCB2YWx1ZSBpbnRvIGFuIGFycmF5IGlmIGl0IGlzIG5vdCBhbHJlYWR5IG9uZS5cblx0ICogQHBhcmFtIHggLSBWYWx1ZSB0byBjb252ZXJ0LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpbnRvQXJyYXk8VD4oeDogVCB8IFRbXSk6IFRbXSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoeCkpIHtcblx0XHRcdHJldHVybiB4O1xuXHRcdH1cblxuXHRcdHJldHVybiBbeF07XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgc29tZXRoaW5nIHRvIGJlY29tZSBjYWxsYWJsZS5cblx0ICogQHBhcmFtIHRoaW5nIC0gV2hhdCB0byB0dXJuIGludG8gYSBjYWxsYWJsZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaW50b0NhbGxhYmxlKHRoaW5nOiBhbnkpOiBhbnkge1xuXHRcdGlmICh0eXBlb2YgdGhpbmcgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cmV0dXJuIHRoaW5nO1xuXHRcdH1cblxuXHRcdHJldHVybiAoKSA9PiB0aGluZztcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIHN1cHBsaWVkIHZhbHVlIGlzIGFuIGV2ZW50IGVtaXR0ZXIuXG5cdCAqIEBwYXJhbSB2YWx1ZSAtIFZhbHVlIHRvIGNoZWNrLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpc0V2ZW50RW1pdHRlcih2YWx1ZTogYW55KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHZhbHVlICYmXG5cdFx0XHR0eXBlb2YgdmFsdWUub24gPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdFx0dHlwZW9mIHZhbHVlLmVtaXQgPT09IFwiZnVuY3Rpb25cIlxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBzdXBwbGllZCB2YWx1ZSBpcyBhIHByb21pc2UuXG5cdCAqIEBwYXJhbSB2YWx1ZSAtIFZhbHVlIHRvIGNoZWNrLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpc1Byb21pc2UodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAoXG5cdFx0XHR2YWx1ZSAmJlxuXHRcdFx0dHlwZW9mIHZhbHVlLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJlxuXHRcdFx0dHlwZW9mIHZhbHVlLmNhdGNoID09PSBcImZ1bmN0aW9uXCJcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbXBhcmVzIHR3byBwcmVmaXhlcy5cblx0ICogQHBhcmFtIGFLZXkgLSBGaXJzdCBwcmVmaXguXG5cdCAqIEBwYXJhbSBiS2V5IC0gU2Vjb25kIHByZWZpeC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcHJlZml4Q29tcGFyZShcblx0XHRhS2V5OiBzdHJpbmcgfCAoKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpLFxuXHRcdGJLZXk6IHN0cmluZyB8ICgoLi4uYXJnczogYW55W10pID0+IGFueSlcblx0KTogbnVtYmVyIHtcblx0XHRpZiAoYUtleSA9PT0gXCJcIiAmJiBiS2V5ID09PSBcIlwiKSByZXR1cm4gMDtcblx0XHRpZiAoYUtleSA9PT0gXCJcIikgcmV0dXJuIDE7XG5cdFx0aWYgKGJLZXkgPT09IFwiXCIpIHJldHVybiAtMTtcblx0XHRpZiAodHlwZW9mIGFLZXkgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgYktleSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gMDtcblx0XHRpZiAodHlwZW9mIGFLZXkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIDE7XG5cdFx0aWYgKHR5cGVvZiBiS2V5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiAtMTtcblx0XHRyZXR1cm4gYUtleS5sZW5ndGggPT09IGJLZXkubGVuZ3RoXG5cdFx0XHQ/IGFLZXkubG9jYWxlQ29tcGFyZShiS2V5KVxuXHRcdFx0OiBiS2V5Lmxlbmd0aCAtIGFLZXkubGVuZ3RoO1xuXHR9XG59XG4iXX0=
