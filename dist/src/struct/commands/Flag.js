"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a special return value during command execution or argument parsing.
 * @param {string} type - Type of flag.
 * @param {any} [data={}] - Extra data.
 */
class Flag {
	/** The type of flag. */
	type;
	constructor(type, data = {}) {
		this.type = type;
		Object.assign(this, data);
	}
	/**
	 * Creates a flag that cancels the command.
	 * @returns {Flag}
	 */
	static cancel() {
		return new Flag("cancel");
	}
	/**
	 * Creates a flag that retries with another input.
	 * @param {Message} message - Message to handle.
	 * @returns {Flag}
	 */
	static retry(message) {
		return new Flag("retry", { message });
	}
	/**
	 * Creates a flag that acts as argument cast failure with extra data.
	 * @param {any} value - The extra data for the failure.
	 * @returns {Flag}
	 */
	static fail(value) {
		return new Flag("fail", { value });
	}
	/**
	 * Creates a flag that runs another command with the rest of the arguments.
	 * @param {string} command - Command ID.
	 * @param {boolean} [ignore=false] - Whether or not to ignore permission checks.
	 * @param {string|null} [rest] - The rest of the arguments.
	 * If this is not set, the argument handler will automatically use the rest of the content.
	 * @returns {Flag}
	 */
	static continue(command, ignore = false, rest = null) {
		return new Flag("continue", { command, ignore, rest });
	}
	/**
	 * Checks if a value is a flag and of some type.
	 * @param {any} value - Value to check.
	 * @param {string} type - Type of flag.
	 * @returns {boolean}
	 */
	static is(value, type) {
		return value instanceof Flag && value.type === type;
	}
}
exports.default = Flag;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvRmxhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOzs7O0dBSUc7QUFDSCxNQUFxQixJQUFJO0lBQ3hCLHdCQUF3QjtJQUNqQixJQUFJLENBQVM7SUFFcEIsWUFBWSxJQUFZLEVBQUUsT0FBWSxFQUFFO1FBQ3ZDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsTUFBTTtRQUNaLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQWdCO1FBQzVCLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBVTtRQUNyQixPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxNQUFNLENBQUMsUUFBUSxDQUNkLE9BQWUsRUFDZixNQUFNLEdBQUcsS0FBSyxFQUNkLE9BQXNCLElBQUk7UUFFMUIsT0FBTyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFVLEVBQUUsSUFBWTtRQUNqQyxPQUFPLEtBQUssWUFBWSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUM7SUFDckQsQ0FBQztDQUNEO0FBNURELHVCQTREQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzcGVjaWFsIHJldHVybiB2YWx1ZSBkdXJpbmcgY29tbWFuZCBleGVjdXRpb24gb3IgYXJndW1lbnQgcGFyc2luZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gVHlwZSBvZiBmbGFnLlxuICogQHBhcmFtIHthbnl9IFtkYXRhPXt9XSAtIEV4dHJhIGRhdGEuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZsYWcge1xuXHQvKiogVGhlIHR5cGUgb2YgZmxhZy4gKi9cblx0cHVibGljIHR5cGU6IHN0cmluZztcblxuXHRjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIGRhdGE6IGFueSA9IHt9KSB7XG5cdFx0dGhpcy50eXBlID0gdHlwZTtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMsIGRhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmbGFnIHRoYXQgY2FuY2VscyB0aGUgY29tbWFuZC5cblx0ICogQHJldHVybnMge0ZsYWd9XG5cdCAqL1xuXHRzdGF0aWMgY2FuY2VsKCk6IEZsYWcge1xuXHRcdHJldHVybiBuZXcgRmxhZyhcImNhbmNlbFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZmxhZyB0aGF0IHJldHJpZXMgd2l0aCBhbm90aGVyIGlucHV0LlxuXHQgKiBAcGFyYW0ge01lc3NhZ2V9IG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHJldHVybnMge0ZsYWd9XG5cdCAqL1xuXHRzdGF0aWMgcmV0cnkobWVzc2FnZTogTWVzc2FnZSk6IEZsYWcge1xuXHRcdHJldHVybiBuZXcgRmxhZyhcInJldHJ5XCIsIHsgbWVzc2FnZSB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZmxhZyB0aGF0IGFjdHMgYXMgYXJndW1lbnQgY2FzdCBmYWlsdXJlIHdpdGggZXh0cmEgZGF0YS5cblx0ICogQHBhcmFtIHthbnl9IHZhbHVlIC0gVGhlIGV4dHJhIGRhdGEgZm9yIHRoZSBmYWlsdXJlLlxuXHQgKiBAcmV0dXJucyB7RmxhZ31cblx0ICovXG5cdHN0YXRpYyBmYWlsKHZhbHVlOiBhbnkpOiBGbGFnIHtcblx0XHRyZXR1cm4gbmV3IEZsYWcoXCJmYWlsXCIsIHsgdmFsdWUgfSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZsYWcgdGhhdCBydW5zIGFub3RoZXIgY29tbWFuZCB3aXRoIHRoZSByZXN0IG9mIHRoZSBhcmd1bWVudHMuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBjb21tYW5kIC0gQ29tbWFuZCBJRC5cblx0ICogQHBhcmFtIHtib29sZWFufSBbaWdub3JlPWZhbHNlXSAtIFdoZXRoZXIgb3Igbm90IHRvIGlnbm9yZSBwZXJtaXNzaW9uIGNoZWNrcy5cblx0ICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gW3Jlc3RdIC0gVGhlIHJlc3Qgb2YgdGhlIGFyZ3VtZW50cy5cblx0ICogSWYgdGhpcyBpcyBub3Qgc2V0LCB0aGUgYXJndW1lbnQgaGFuZGxlciB3aWxsIGF1dG9tYXRpY2FsbHkgdXNlIHRoZSByZXN0IG9mIHRoZSBjb250ZW50LlxuXHQgKiBAcmV0dXJucyB7RmxhZ31cblx0ICovXG5cdHN0YXRpYyBjb250aW51ZShcblx0XHRjb21tYW5kOiBzdHJpbmcsXG5cdFx0aWdub3JlID0gZmFsc2UsXG5cdFx0cmVzdDogc3RyaW5nIHwgbnVsbCA9IG51bGxcblx0KTogRmxhZyB7XG5cdFx0cmV0dXJuIG5ldyBGbGFnKFwiY29udGludWVcIiwgeyBjb21tYW5kLCBpZ25vcmUsIHJlc3QgfSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYSBmbGFnIGFuZCBvZiBzb21lIHR5cGUuXG5cdCAqIEBwYXJhbSB7YW55fSB2YWx1ZSAtIFZhbHVlIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFR5cGUgb2YgZmxhZy5cblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRzdGF0aWMgaXModmFsdWU6IGFueSwgdHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRmxhZyAmJiB2YWx1ZS50eXBlID09PSB0eXBlO1xuXHR9XG59XG4iXX0=
