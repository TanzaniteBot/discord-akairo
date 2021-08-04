"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoModule_1 = __importDefault(require("../AkairoModule"));
/**
 * Represents a task.
 * @param id - Task ID.
 * @param options - Options for the task.
 */
class Task extends AkairoModule_1.default {
    constructor(id, { category, delay, runOnStart = false }) {
        super(id, { category });
        this.delay = delay;
        this.runOnStart = runOnStart;
    }
    /**
     * The time in milliseconds between each time the task is run.
     */
    delay;
    /**
     * Whether or not to run the task on start.
     */
    runOnStart;
    /**
     * Executes the task.
     * @param args - Arguments.
     */
    // eslint-disable-next-line func-names, @typescript-eslint/no-unused-vars
    exec(...args) {
        throw new AkairoError_1.default("NOT_IMPLEMENTED", this.constructor.name, "exec");
    }
    /**
     * Reloads the task.
     */
    reload() {
        return super.reload();
    }
    /**
     * Removes the task.
     */
    remove() {
        return super.remove();
    }
    /**
     * Returns the ID.
     */
    toString() {
        return super.toString();
    }
}
exports.default = Task;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvdGFza3MvVGFzay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlFQUFpRDtBQUdqRCxtRUFBb0U7QUFHcEU7Ozs7R0FJRztBQUNILE1BQThCLElBQUssU0FBUSxzQkFBWTtJQUN0RCxZQUNDLEVBQVUsRUFDVixFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsVUFBVSxHQUFHLEtBQUssRUFBZTtRQUVwRCxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUM5QixDQUFDO0lBWUQ7O09BRUc7SUFDSSxLQUFLLENBQVM7SUFZckI7O09BRUc7SUFDSSxVQUFVLENBQVU7SUFFM0I7OztPQUdHO0lBQ0gseUVBQXlFO0lBQ2xFLElBQUksQ0FBQyxHQUFHLElBQVc7UUFDekIsTUFBTSxJQUFJLHFCQUFXLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVEOztPQUVHO0lBQ2EsTUFBTTtRQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQVUsQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDYSxNQUFNO1FBQ3JCLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBVSxDQUFDO0lBQy9CLENBQUM7SUFFRDs7T0FFRztJQUNhLFFBQVE7UUFDdkIsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekIsQ0FBQztDQUNEO0FBdkVELHVCQXVFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUsIHsgQWthaXJvTW9kdWxlT3B0aW9ucyB9IGZyb20gXCIuLi9Ba2Fpcm9Nb2R1bGVcIjtcbmltcG9ydCBUYXNrSGFuZGxlciBmcm9tIFwiLi9UYXNrSGFuZGxlclwiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0YXNrLlxuICogQHBhcmFtIGlkIC0gVGFzayBJRC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIHRhc2suXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIFRhc2sgZXh0ZW5kcyBBa2Fpcm9Nb2R1bGUge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0aWQ6IHN0cmluZyxcblx0XHR7IGNhdGVnb3J5LCBkZWxheSwgcnVuT25TdGFydCA9IGZhbHNlIH06IFRhc2tPcHRpb25zXG5cdCkge1xuXHRcdHN1cGVyKGlkLCB7IGNhdGVnb3J5IH0pO1xuXG5cdFx0dGhpcy5kZWxheSA9IGRlbGF5O1xuXG5cdFx0dGhpcy5ydW5PblN0YXJ0ID0gcnVuT25TdGFydDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY2F0ZWdvcnkgb2YgdGhpcyB0YXNrLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcnk6IENhdGVnb3J5PHN0cmluZywgVGFzaz47XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lIGluIG1pbGxpc2Vjb25kcyBiZXR3ZWVuIGVhY2ggdGltZSB0aGUgdGFzayBpcyBydW4uXG5cdCAqL1xuXHRwdWJsaWMgZGVsYXk6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGZpbGVwYXRoLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZmlsZXBhdGg6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBoYW5kbGVyOiBUYXNrSGFuZGxlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gcnVuIHRoZSB0YXNrIG9uIHN0YXJ0LlxuXHQgKi9cblx0cHVibGljIHJ1bk9uU3RhcnQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEV4ZWN1dGVzIHRoZSB0YXNrLlxuXHQgKiBAcGFyYW0gYXJncyAtIEFyZ3VtZW50cy5cblx0ICovXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0cHVibGljIGV4ZWMoLi4uYXJnczogYW55W10pOiBhbnkge1xuXHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk5PVF9JTVBMRU1FTlRFRFwiLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIFwiZXhlY1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZCgpOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkKCkgYXMgVGFzaztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZSgpOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKCkgYXMgVGFzaztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBJRC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiBzdXBlci50b1N0cmluZygpO1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyB0byB1c2UgZm9yIHRhc2sgZXhlY3V0aW9uIGJlaGF2aW9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tPcHRpb25zIGV4dGVuZHMgQWthaXJvTW9kdWxlT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHRpbWUgYmV0d2VlbiB0aGUgdGFzayBiZWluZyBleGVjdXRlZC5cblx0ICovXG5cdGRlbGF5PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgdGFzayBydW5zIG9uIHN0YXJ0LlxuXHQgKi9cblx0cnVuT25TdGFydD86IGJvb2xlYW47XG59XG4iXX0=