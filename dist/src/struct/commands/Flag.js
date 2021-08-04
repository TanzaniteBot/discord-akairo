"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a special return value during command execution or argument parsing.
 * @param type - Type of flag.
 * @param data - Extra data.
 */
class Flag {
    constructor(type, data = {}) {
        this.type = type;
        Object.assign(this, data);
    }
    /**
     * The type of flag.
     */
    type;
    /**
     * Creates a flag that cancels the command.
     */
    static cancel() {
        return new Flag("cancel");
    }
    /**
     * Creates a flag that retries with another input.
     * @param message - Message to handle.
     */
    static retry(message) {
        return new Flag("retry", { message });
    }
    /**
     * Creates a flag that acts as argument cast failure with extra data.
     * @param value - The extra data for the failure.
     */
    static fail(value) {
        return new Flag("fail", { value });
    }
    /**
     * Creates a flag that runs another command with the rest of the arguments.
     * @param command - Command ID.
     * @param ignore - Whether or not to ignore permission checks.
     * @param rest - The rest of the arguments. If this is not set, the argument handler will automatically use the rest of the content.
     */
    static continue(command, ignore = false, rest = null) {
        return new Flag("continue", { command, ignore, rest });
    }
    /**
     * Checks if a value is a flag and of some type.
     * @param value - Value to check.
     * @param type - Type of flag.
     */
    static is(value, type) {
        return value instanceof Flag && value.type === type;
    }
}
exports.default = Flag;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvRmxhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOzs7O0dBSUc7QUFDSCxNQUFxQixJQUFJO0lBQ3hCLFlBQVksSUFBWSxFQUFFLE9BQVksRUFBRTtRQUN2QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxJQUFJLENBQVM7SUFFcEI7O09BRUc7SUFDSSxNQUFNLENBQUMsTUFBTTtRQUNuQixPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQWdCO1FBQ25DLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFVO1FBQzVCLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsUUFBUSxDQUNyQixPQUFlLEVBQ2YsU0FBa0IsS0FBSyxFQUN2QixPQUFzQixJQUFJO1FBRTFCLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFVLEVBQUUsSUFBWTtRQUN4QyxPQUFPLEtBQUssWUFBWSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUM7SUFDckQsQ0FBQztDQUNEO0FBeERELHVCQXdEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzcGVjaWFsIHJldHVybiB2YWx1ZSBkdXJpbmcgY29tbWFuZCBleGVjdXRpb24gb3IgYXJndW1lbnQgcGFyc2luZy5cbiAqIEBwYXJhbSB0eXBlIC0gVHlwZSBvZiBmbGFnLlxuICogQHBhcmFtIGRhdGEgLSBFeHRyYSBkYXRhLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGbGFnIHtcblx0Y29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBkYXRhOiBhbnkgPSB7fSkge1xuXHRcdHRoaXMudHlwZSA9IHR5cGU7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLCBkYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgdHlwZSBvZiBmbGFnLlxuXHQgKi9cblx0cHVibGljIHR5cGU6IHN0cmluZztcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZsYWcgdGhhdCBjYW5jZWxzIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBjYW5jZWwoKTogRmxhZyB7XG5cdFx0cmV0dXJuIG5ldyBGbGFnKFwiY2FuY2VsXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmbGFnIHRoYXQgcmV0cmllcyB3aXRoIGFub3RoZXIgaW5wdXQuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHJldHJ5KG1lc3NhZ2U6IE1lc3NhZ2UpOiBGbGFnIHtcblx0XHRyZXR1cm4gbmV3IEZsYWcoXCJyZXRyeVwiLCB7IG1lc3NhZ2UgfSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZsYWcgdGhhdCBhY3RzIGFzIGFyZ3VtZW50IGNhc3QgZmFpbHVyZSB3aXRoIGV4dHJhIGRhdGEuXG5cdCAqIEBwYXJhbSB2YWx1ZSAtIFRoZSBleHRyYSBkYXRhIGZvciB0aGUgZmFpbHVyZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZmFpbCh2YWx1ZTogYW55KTogRmxhZyB7XG5cdFx0cmV0dXJuIG5ldyBGbGFnKFwiZmFpbFwiLCB7IHZhbHVlIH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmbGFnIHRoYXQgcnVucyBhbm90aGVyIGNvbW1hbmQgd2l0aCB0aGUgcmVzdCBvZiB0aGUgYXJndW1lbnRzLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgSUQuXG5cdCAqIEBwYXJhbSBpZ25vcmUgLSBXaGV0aGVyIG9yIG5vdCB0byBpZ25vcmUgcGVybWlzc2lvbiBjaGVja3MuXG5cdCAqIEBwYXJhbSByZXN0IC0gVGhlIHJlc3Qgb2YgdGhlIGFyZ3VtZW50cy4gSWYgdGhpcyBpcyBub3Qgc2V0LCB0aGUgYXJndW1lbnQgaGFuZGxlciB3aWxsIGF1dG9tYXRpY2FsbHkgdXNlIHRoZSByZXN0IG9mIHRoZSBjb250ZW50LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBjb250aW51ZShcblx0XHRjb21tYW5kOiBzdHJpbmcsXG5cdFx0aWdub3JlOiBib29sZWFuID0gZmFsc2UsXG5cdFx0cmVzdDogc3RyaW5nIHwgbnVsbCA9IG51bGxcblx0KTogRmxhZyB7XG5cdFx0cmV0dXJuIG5ldyBGbGFnKFwiY29udGludWVcIiwgeyBjb21tYW5kLCBpZ25vcmUsIHJlc3QgfSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYSBmbGFnIGFuZCBvZiBzb21lIHR5cGUuXG5cdCAqIEBwYXJhbSB2YWx1ZSAtIFZhbHVlIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFR5cGUgb2YgZmxhZy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaXModmFsdWU6IGFueSwgdHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRmxhZyAmJiB2YWx1ZS50eXBlID09PSB0eXBlO1xuXHR9XG59XG4iXX0=