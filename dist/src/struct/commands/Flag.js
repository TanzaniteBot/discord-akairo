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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvRmxhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOzs7O0dBSUc7QUFDSCxNQUFxQixJQUFJO0lBQ3hCLFlBQVksSUFBWSxFQUFFLE9BQVksRUFBRTtRQUN2QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxJQUFJLENBQVM7SUFFcEI7O09BRUc7SUFDSSxNQUFNLENBQUMsTUFBTTtRQUNuQixPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQWdCO1FBQ25DLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFVO1FBQzVCLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQWUsRUFBRSxTQUFrQixLQUFLLEVBQUUsT0FBc0IsSUFBSTtRQUMxRixPQUFPLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBVSxFQUFFLElBQVk7UUFDeEMsT0FBTyxLQUFLLFlBQVksSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDO0lBQ3JELENBQUM7Q0FDRDtBQXBERCx1QkFvREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc3BlY2lhbCByZXR1cm4gdmFsdWUgZHVyaW5nIGNvbW1hbmQgZXhlY3V0aW9uIG9yIGFyZ3VtZW50IHBhcnNpbmcuXG4gKiBAcGFyYW0gdHlwZSAtIFR5cGUgb2YgZmxhZy5cbiAqIEBwYXJhbSBkYXRhIC0gRXh0cmEgZGF0YS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmxhZyB7XG5cdGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgZGF0YTogYW55ID0ge30pIHtcblx0XHR0aGlzLnR5cGUgPSB0eXBlO1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcywgZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIHR5cGUgb2YgZmxhZy5cblx0ICovXG5cdHB1YmxpYyB0eXBlOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmbGFnIHRoYXQgY2FuY2VscyB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgY2FuY2VsKCk6IEZsYWcge1xuXHRcdHJldHVybiBuZXcgRmxhZyhcImNhbmNlbFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZmxhZyB0aGF0IHJldHJpZXMgd2l0aCBhbm90aGVyIGlucHV0LlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyByZXRyeShtZXNzYWdlOiBNZXNzYWdlKTogRmxhZyB7XG5cdFx0cmV0dXJuIG5ldyBGbGFnKFwicmV0cnlcIiwgeyBtZXNzYWdlIH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmbGFnIHRoYXQgYWN0cyBhcyBhcmd1bWVudCBjYXN0IGZhaWx1cmUgd2l0aCBleHRyYSBkYXRhLlxuXHQgKiBAcGFyYW0gdmFsdWUgLSBUaGUgZXh0cmEgZGF0YSBmb3IgdGhlIGZhaWx1cmUuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZhaWwodmFsdWU6IGFueSk6IEZsYWcge1xuXHRcdHJldHVybiBuZXcgRmxhZyhcImZhaWxcIiwgeyB2YWx1ZSB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZmxhZyB0aGF0IHJ1bnMgYW5vdGhlciBjb21tYW5kIHdpdGggdGhlIHJlc3Qgb2YgdGhlIGFyZ3VtZW50cy5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIElELlxuXHQgKiBAcGFyYW0gaWdub3JlIC0gV2hldGhlciBvciBub3QgdG8gaWdub3JlIHBlcm1pc3Npb24gY2hlY2tzLlxuXHQgKiBAcGFyYW0gcmVzdCAtIFRoZSByZXN0IG9mIHRoZSBhcmd1bWVudHMuIElmIHRoaXMgaXMgbm90IHNldCwgdGhlIGFyZ3VtZW50IGhhbmRsZXIgd2lsbCBhdXRvbWF0aWNhbGx5IHVzZSB0aGUgcmVzdCBvZiB0aGUgY29udGVudC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgY29udGludWUoY29tbWFuZDogc3RyaW5nLCBpZ25vcmU6IGJvb2xlYW4gPSBmYWxzZSwgcmVzdDogc3RyaW5nIHwgbnVsbCA9IG51bGwpOiBGbGFnIHtcblx0XHRyZXR1cm4gbmV3IEZsYWcoXCJjb250aW51ZVwiLCB7IGNvbW1hbmQsIGlnbm9yZSwgcmVzdCB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhIGZsYWcgYW5kIG9mIHNvbWUgdHlwZS5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSB0eXBlIC0gVHlwZSBvZiBmbGFnLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpcyh2YWx1ZTogYW55LCB0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBGbGFnICYmIHZhbHVlLnR5cGUgPT09IHR5cGU7XG5cdH1cbn1cbiJdfQ==