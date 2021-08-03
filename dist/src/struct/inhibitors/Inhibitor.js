"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoModule_1 = __importDefault(require("../AkairoModule"));
/**
 * Represents an inhibitor.
 * @param id - Inhibitor ID.
 * @param options - Options for the inhibitor.
 */
class Inhibitor extends AkairoModule_1.default {
    /**
     * The priority of the inhibitor.
     */
    priority;
    /**
     * Reason emitted when command is inhibited.
     */
    reason;
    /**
     * The type of the inhibitor for when it should run.
     */
    type;
    constructor(id, { category, reason = "", type = "post", priority = 0 } = {}) {
        super(id, { category });
        this.reason = reason;
        this.type = type;
        this.priority = priority;
    }
    // @ts-expect-error
    // eslint-disable-next-line func-names
    exec(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    message, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    command) {
        throw new AkairoError_1.default("NOT_IMPLEMENTED", this.constructor.name, "exec");
    }
    /**
     * Reloads the inhibitor.
     */
    reload() {
        return super.reload();
    }
    /**
     * Removes the inhibitor.
     */
    remove() {
        return super.remove();
    }
}
exports.default = Inhibitor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5oaWJpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9pbmhpYml0b3JzL0luaGliaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHlFQUFpRDtBQUlqRCxtRUFBb0U7QUFJcEU7Ozs7R0FJRztBQUNILE1BQThCLFNBQVUsU0FBUSxzQkFBWTtJQUMzRDs7T0FFRztJQUNJLFFBQVEsQ0FBUztJQTJCeEI7O09BRUc7SUFDSSxNQUFNLENBQVM7SUFFdEI7O09BRUc7SUFDSSxJQUFJLENBQVM7SUFFcEIsWUFDQyxFQUFVLEVBQ1YsRUFDQyxRQUFRLEVBQ1IsTUFBTSxHQUFHLEVBQUUsRUFDWCxJQUFJLEdBQUcsTUFBTSxFQUNiLFFBQVEsR0FBRyxDQUFDLEtBQ1MsRUFBRTtRQUV4QixLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixDQUFDO0lBYUQsbUJBQW1CO0lBQ25CLHNDQUFzQztJQUN0QixJQUFJO0lBQ25CLDZEQUE2RDtJQUM3RCxPQUFnQztJQUNoQyw2REFBNkQ7SUFDN0QsT0FBaUI7UUFFakIsTUFBTSxJQUFJLHFCQUFXLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVEOztPQUVHO0lBQ2EsTUFBTTtRQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQWUsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7O09BRUc7SUFDYSxNQUFNO1FBQ3JCLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBZSxDQUFDO0lBQ3BDLENBQUM7Q0FDRDtBQTlGRCw0QkE4RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IEFrYWlyb01lc3NhZ2UgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvTWVzc2FnZVwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUsIHsgQWthaXJvTW9kdWxlT3B0aW9ucyB9IGZyb20gXCIuLi9Ba2Fpcm9Nb2R1bGVcIjtcbmltcG9ydCBDb21tYW5kIGZyb20gXCIuLi9jb21tYW5kcy9Db21tYW5kXCI7XG5pbXBvcnQgSW5oaWJpdG9ySGFuZGxlciBmcm9tIFwiLi9JbmhpYml0b3JIYW5kbGVyXCI7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBpbmhpYml0b3IuXG4gKiBAcGFyYW0gaWQgLSBJbmhpYml0b3IgSUQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBpbmhpYml0b3IuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIEluaGliaXRvciBleHRlbmRzIEFrYWlyb01vZHVsZSB7XG5cdC8qKlxuXHQgKiBUaGUgcHJpb3JpdHkgb2YgdGhlIGluaGliaXRvci5cblx0ICovXG5cdHB1YmxpYyBwcmlvcml0eTogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgY2F0ZWdvcnkgdGhlIGluaGliaXRvciBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcnk6IENhdGVnb3J5PHN0cmluZywgSW5oaWJpdG9yPjtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogVGhlIGZpbGVwYXRoLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZmlsZXBhdGg6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGluaGliaXRvciBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgaGFuZGxlcjogSW5oaWJpdG9ySGFuZGxlcjtcblxuXHQvKipcblx0ICogVGhlIElEIG9mIHRoaXMgaW5oaWJpdG9yLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgaWQ6IHN0cmluZztcblxuXHQvKipcblx0ICogUmVhc29uIGVtaXR0ZWQgd2hlbiBjb21tYW5kIGlzIGluaGliaXRlZC5cblx0ICovXG5cdHB1YmxpYyByZWFzb246IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIHR5cGUgb2YgdGhlIGluaGliaXRvciBmb3Igd2hlbiBpdCBzaG91bGQgcnVuLlxuXHQgKi9cblx0cHVibGljIHR5cGU6IHN0cmluZztcblxuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0aWQ6IHN0cmluZyxcblx0XHR7XG5cdFx0XHRjYXRlZ29yeSxcblx0XHRcdHJlYXNvbiA9IFwiXCIsXG5cdFx0XHR0eXBlID0gXCJwb3N0XCIsXG5cdFx0XHRwcmlvcml0eSA9IDBcblx0XHR9OiBJbmhpYml0b3JPcHRpb25zID0ge31cblx0KSB7XG5cdFx0c3VwZXIoaWQsIHsgY2F0ZWdvcnkgfSk7XG5cblx0XHR0aGlzLnJlYXNvbiA9IHJlYXNvbjtcblxuXHRcdHRoaXMudHlwZSA9IHR5cGU7XG5cblx0XHR0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIG1lc3NhZ2Ugc2hvdWxkIGJlIGJsb2NrZWQuXG5cdCAqIEEgcmV0dXJuIHZhbHVlIG9mIHRydWUgd2lsbCBibG9jayB0aGUgbWVzc2FnZS5cblx0ICogSWYgcmV0dXJuaW5nIGEgUHJvbWlzZSwgYSByZXNvbHZlZCB2YWx1ZSBvZiB0cnVlIHdpbGwgYmxvY2sgdGhlIG1lc3NhZ2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSBiZWluZyBoYW5kbGVkLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgYWJzdHJhY3QgZXhlYyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdGNvbW1hbmQ/OiBDb21tYW5kXG5cdCk6IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+O1xuXHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5cdHB1YmxpYyBhYnN0cmFjdCBleGVjKFxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdFx0Y29tbWFuZD86IENvbW1hbmRcblx0KTogYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk5PVF9JTVBMRU1FTlRFRFwiLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIFwiZXhlY1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIHRoZSBpbmhpYml0b3IuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkKCk6IEluaGliaXRvciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZCgpIGFzIEluaGliaXRvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSBpbmhpYml0b3IuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKCk6IEluaGliaXRvciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZSgpIGFzIEluaGliaXRvcjtcblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbnMgdG8gdXNlIGZvciBpbmhpYml0b3IgZXhlY3V0aW9uIGJlaGF2aW9yLlxuICogQWxzbyBpbmNsdWRlcyBwcm9wZXJ0aWVzIGZyb20gQWthaXJvTW9kdWxlT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbmhpYml0b3JPcHRpb25zIGV4dGVuZHMgQWthaXJvTW9kdWxlT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBSZWFzb24gZW1pdHRlZCB3aGVuIGNvbW1hbmQgb3IgbWVzc2FnZSBpcyBibG9ja2VkLlxuXHQgKi9cblx0cmVhc29uPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBDYW4gYmUgJ2FsbCcgdG8gcnVuIG9uIGFsbCBtZXNzYWdlcywgJ3ByZScgdG8gcnVuIG9uIG1lc3NhZ2VzIG5vdCBibG9ja2VkIGJ5IHRoZSBidWlsdC1pbiBpbmhpYml0b3JzLCBvciAncG9zdCcgdG8gcnVuIG9uIG1lc3NhZ2VzIHRoYXQgYXJlIGNvbW1hbmRzLlxuXHQgKiBEZWZhdWx0cyB0byBgcG9zdGBcblx0ICovXG5cdHR5cGU/OiBcImFsbFwiIHwgXCJwcmVcIiB8IFwicG9zdFwiO1xuXG5cdC8qKlxuXHQgKiBQcmlvcml0eSBmb3IgdGhlIGluaGliaXRvciBmb3Igd2hlbiBtb3JlIHRoYW4gb25lIGluaGliaXRvcnMgYmxvY2sgYSBtZXNzYWdlLlxuXHQgKiBUaGUgaW5oaWJpdG9yIHdpdGggdGhlIGhpZ2hlc3QgcHJpb3JpdHkgaXMgdGhlIG9uZSB0aGF0IGlzIHVzZWQgZm9yIHRoZSBibG9jayByZWFzb24uXG5cdCAqIERlZmF1bHRzIHRvIGAwYFxuXHQgKi9cblx0cHJpb3JpdHk/OiBudW1iZXI7XG59XG4iXX0=