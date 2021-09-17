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
     * Deep assign properties to an object.
     * @param target
     * @param os
     */
    static deepAssign(target, ...os) {
        for (const o of os) {
            for (const [key, value] of Object.entries(o)) {
                const valueIsObject = value && typeof value === "object";
                const targetKeyIsObject = Object.prototype.hasOwnProperty.call(target, key) &&
                    target[key] &&
                    typeof target[key] === "object";
                if (valueIsObject && targetKeyIsObject) {
                    Util.deepAssign(target[key], value);
                }
                else {
                    target[key] = value;
                }
            }
        }
        return target;
    }
    /**
     * Map an iterable object and then flatten it it into an array
     * @param iterable - the object to map and flatten
     * @param filter - the filter to map with
     */
    static flatMap(iterable, filter) {
        const result = [];
        for (const x of iterable) {
            result.push(...filter(x));
        }
        return result;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL1V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7R0FFRztBQUNILE1BQXFCLElBQUk7SUFDeEI7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBSSxHQUFHLEVBQU87UUFDakMsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsVUFBVSxDQUFPLE1BQVMsRUFBRSxHQUFHLEVBQU87UUFDbkQsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkIsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdDLE1BQU0sYUFBYSxHQUFHLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUM7Z0JBQ3pELE1BQU0saUJBQWlCLEdBQ3RCLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO29CQUNqRCxNQUFNLENBQUMsR0FBMEIsQ0FBQztvQkFDbEMsT0FBTyxNQUFNLENBQUMsR0FBMEIsQ0FBQyxLQUFLLFFBQVEsQ0FBQztnQkFDeEQsSUFBSSxhQUFhLElBQUksaUJBQWlCLEVBQUU7b0JBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQTBCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDM0Q7cUJBQU07b0JBQ04sTUFBTSxDQUFDLEdBQTBCLENBQUMsR0FBRyxLQUFLLENBQUM7aUJBQzNDO2FBQ0Q7U0FDRDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsT0FBTyxDQUluQixRQUF3QixFQUFFLE1BQVk7UUFDdkMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLEtBQUssTUFBTSxDQUFDLElBQUksUUFBUSxFQUFFO1lBQ3pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQjtRQUVELE9BQU8sTUFBeUIsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBSSxDQUFVO1FBQ3BDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNyQixPQUFPLENBQUMsQ0FBQztTQUNUO1FBRUQsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUksS0FBa0M7UUFDL0QsSUFBSSxPQUFPLEtBQUssS0FBSyxVQUFVLEVBQUU7WUFDaEMsT0FBTyxLQUFnQixDQUFDO1NBQ3hCO1FBRUQsT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBVTtRQUN0QyxPQUFPLEtBQUssSUFBSSxPQUFPLEtBQUssQ0FBQyxFQUFFLEtBQUssVUFBVSxJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksS0FBSyxVQUFVLENBQUM7SUFDcEYsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBVTtRQUNqQyxPQUFPLEtBQUssSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLEtBQUssVUFBVSxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssS0FBSyxVQUFVLENBQUM7SUFDdkYsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsYUFBYSxDQUMxQixJQUF3QyxFQUN4QyxJQUF3QztRQUV4QyxJQUFJLElBQUksS0FBSyxFQUFFLElBQUksSUFBSSxLQUFLLEVBQUU7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxJQUFJLElBQUksS0FBSyxFQUFFO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDMUIsSUFBSSxJQUFJLEtBQUssRUFBRTtZQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDM0IsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVLElBQUksT0FBTyxJQUFJLEtBQUssVUFBVTtZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLElBQUksT0FBTyxJQUFJLEtBQUssVUFBVTtZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLElBQUksT0FBTyxJQUFJLEtBQUssVUFBVTtZQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDMUMsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUMzRixDQUFDO0NBQ0Q7QUFsSEQsdUJBa0hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5cbi8qKlxuICogQWthaXJvIFV0aWxpdGllcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXRpbCB7XG5cdC8qKlxuXHQgKiBDaG9vc2UgdGhlIGZpcnN0IG5vbi1udWxsIGVsZW1lbnQgaW4gYW4gYXJyYXlcblx0ICogQHBhcmFtIHhzXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGNob2ljZTxUPiguLi54czogVFtdKTogVCB8IG51bGwge1xuXHRcdGZvciAoY29uc3QgeCBvZiB4cykge1xuXHRcdFx0aWYgKHggIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4geDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWVwIGFzc2lnbiBwcm9wZXJ0aWVzIHRvIGFuIG9iamVjdC5cblx0ICogQHBhcmFtIHRhcmdldFxuXHQgKiBAcGFyYW0gb3Ncblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZGVlcEFzc2lnbjxBLCBCPih0YXJnZXQ6IEEsIC4uLm9zOiBCW10pIHtcblx0XHRmb3IgKGNvbnN0IG8gb2Ygb3MpIHtcblx0XHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKG8pKSB7XG5cdFx0XHRcdGNvbnN0IHZhbHVlSXNPYmplY3QgPSB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCI7XG5cdFx0XHRcdGNvbnN0IHRhcmdldEtleUlzT2JqZWN0ID1cblx0XHRcdFx0XHRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpICYmXG5cdFx0XHRcdFx0dGFyZ2V0W2tleSBhcyBrZXlvZiB0eXBlb2YgdGFyZ2V0XSAmJlxuXHRcdFx0XHRcdHR5cGVvZiB0YXJnZXRba2V5IGFzIGtleW9mIHR5cGVvZiB0YXJnZXRdID09PSBcIm9iamVjdFwiO1xuXHRcdFx0XHRpZiAodmFsdWVJc09iamVjdCAmJiB0YXJnZXRLZXlJc09iamVjdCkge1xuXHRcdFx0XHRcdFV0aWwuZGVlcEFzc2lnbih0YXJnZXRba2V5IGFzIGtleW9mIHR5cGVvZiB0YXJnZXRdLCB2YWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGFyZ2V0W2tleSBhcyBrZXlvZiB0eXBlb2YgdGFyZ2V0XSA9IHZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRhcmdldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBNYXAgYW4gaXRlcmFibGUgb2JqZWN0IGFuZCB0aGVuIGZsYXR0ZW4gaXQgaXQgaW50byBhbiBhcnJheVxuXHQgKiBAcGFyYW0gaXRlcmFibGUgLSB0aGUgb2JqZWN0IHRvIG1hcCBhbmQgZmxhdHRlblxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gdGhlIGZpbHRlciB0byBtYXAgd2l0aFxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBmbGF0TWFwPFxuXHRcdFR5cGUsXG5cdFx0UmV0IGV4dGVuZHMgeyBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYXRvcjx1bmtub3duPiB9LFxuXHRcdEZ1bmMgZXh0ZW5kcyAoLi4uYXJnczogYW55W10pID0+IFJldFxuXHQ+KGl0ZXJhYmxlOiBJdGVyYWJsZTxUeXBlPiwgZmlsdGVyOiBGdW5jKTogVHlwZSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cdFx0Zm9yIChjb25zdCB4IG9mIGl0ZXJhYmxlKSB7XG5cdFx0XHRyZXN1bHQucHVzaCguLi5maWx0ZXIoeCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQgYXMgdW5rbm93biBhcyBUeXBlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIHRoZSBzdXBwbGllZCB2YWx1ZSBpbnRvIGFuIGFycmF5IGlmIGl0IGlzIG5vdCBhbHJlYWR5IG9uZS5cblx0ICogQHBhcmFtIHggLSBWYWx1ZSB0byBjb252ZXJ0LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpbnRvQXJyYXk8VD4oeDogVCB8IFRbXSk6IFRbXSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoeCkpIHtcblx0XHRcdHJldHVybiB4O1xuXHRcdH1cblxuXHRcdHJldHVybiBbeF07XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgc29tZXRoaW5nIHRvIGJlY29tZSBjYWxsYWJsZS5cblx0ICogQHBhcmFtIHRoaW5nIC0gV2hhdCB0byB0dXJuIGludG8gYSBjYWxsYWJsZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaW50b0NhbGxhYmxlPFQ+KHRoaW5nOiBUIHwgKCguLi5hcmdzOiBhbnlbXSkgPT4gVCkpOiAoLi4uYXJnczogYW55W10pID0+IFQge1xuXHRcdGlmICh0eXBlb2YgdGhpbmcgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0cmV0dXJuIHRoaW5nIGFzICgpID0+IFQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICgpID0+IHRoaW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgc3VwcGxpZWQgdmFsdWUgaXMgYW4gZXZlbnQgZW1pdHRlci5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzRXZlbnRFbWl0dGVyKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBFdmVudEVtaXR0ZXIge1xuXHRcdHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUub24gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsdWUuZW1pdCA9PT0gXCJmdW5jdGlvblwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgc3VwcGxpZWQgdmFsdWUgaXMgYSBwcm9taXNlLlxuXHQgKiBAcGFyYW0gdmFsdWUgLSBWYWx1ZSB0byBjaGVjay5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaXNQcm9taXNlKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBQcm9taXNlPGFueT4ge1xuXHRcdHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWx1ZS5jYXRjaCA9PT0gXCJmdW5jdGlvblwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbXBhcmVzIHR3byBwcmVmaXhlcy5cblx0ICogQHBhcmFtIGFLZXkgLSBGaXJzdCBwcmVmaXguXG5cdCAqIEBwYXJhbSBiS2V5IC0gU2Vjb25kIHByZWZpeC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcHJlZml4Q29tcGFyZShcblx0XHRhS2V5OiBzdHJpbmcgfCAoKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpLFxuXHRcdGJLZXk6IHN0cmluZyB8ICgoLi4uYXJnczogYW55W10pID0+IGFueSlcblx0KTogbnVtYmVyIHtcblx0XHRpZiAoYUtleSA9PT0gXCJcIiAmJiBiS2V5ID09PSBcIlwiKSByZXR1cm4gMDtcblx0XHRpZiAoYUtleSA9PT0gXCJcIikgcmV0dXJuIDE7XG5cdFx0aWYgKGJLZXkgPT09IFwiXCIpIHJldHVybiAtMTtcblx0XHRpZiAodHlwZW9mIGFLZXkgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgYktleSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gMDtcblx0XHRpZiAodHlwZW9mIGFLZXkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIDE7XG5cdFx0aWYgKHR5cGVvZiBiS2V5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiAtMTtcblx0XHRyZXR1cm4gYUtleS5sZW5ndGggPT09IGJLZXkubGVuZ3RoID8gYUtleS5sb2NhbGVDb21wYXJlKGJLZXkpIDogYktleS5sZW5ndGggLSBhS2V5Lmxlbmd0aDtcblx0fVxufVxuIl19