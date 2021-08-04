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
    // @ts-expect-error
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvdGFza3MvVGFzay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlFQUFpRDtBQUdqRCxtRUFBb0U7QUFHcEU7Ozs7R0FJRztBQUNILE1BQThCLElBQUssU0FBUSxzQkFBWTtJQUN0RCxZQUNDLEVBQVUsRUFDVixFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsVUFBVSxHQUFHLEtBQUssRUFBZTtRQUVwRCxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUM5QixDQUFDO0lBWUQ7O09BRUc7SUFDSSxLQUFLLENBQVM7SUFZckI7O09BRUc7SUFDSSxVQUFVLENBQVU7SUFFM0I7OztPQUdHO0lBQ0gsbUJBQW1CO0lBQ25CLHlFQUF5RTtJQUN6RCxJQUFJLENBQUMsR0FBRyxJQUFXO1FBQ2xDLE1BQU0sSUFBSSxxQkFBVyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU07UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFVLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ2EsTUFBTTtRQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQVUsQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDYSxRQUFRO1FBQ3ZCLE9BQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7Q0FDRDtBQXhFRCx1QkF3RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvTW9kdWxlLCB7IEFrYWlyb01vZHVsZU9wdGlvbnMgfSBmcm9tIFwiLi4vQWthaXJvTW9kdWxlXCI7XG5pbXBvcnQgVGFza0hhbmRsZXIgZnJvbSBcIi4vVGFza0hhbmRsZXJcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdGFzay5cbiAqIEBwYXJhbSBpZCAtIFRhc2sgSUQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSB0YXNrLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBUYXNrIGV4dGVuZHMgQWthaXJvTW9kdWxlIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0eyBjYXRlZ29yeSwgZGVsYXksIHJ1bk9uU3RhcnQgPSBmYWxzZSB9OiBUYXNrT3B0aW9uc1xuXHQpIHtcblx0XHRzdXBlcihpZCwgeyBjYXRlZ29yeSB9KTtcblxuXHRcdHRoaXMuZGVsYXkgPSBkZWxheTtcblxuXHRcdHRoaXMucnVuT25TdGFydCA9IHJ1bk9uU3RhcnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNhdGVnb3J5IG9mIHRoaXMgdGFzay5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNhdGVnb3J5OiBDYXRlZ29yeTxzdHJpbmcsIFRhc2s+O1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBUaGUgdGltZSBpbiBtaWxsaXNlY29uZHMgYmV0d2VlbiBlYWNoIHRpbWUgdGhlIHRhc2sgaXMgcnVuLlxuXHQgKi9cblx0cHVibGljIGRlbGF5OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBmaWxlcGF0aC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGZpbGVwYXRoOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgaGFuZGxlcjogVGFza0hhbmRsZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHJ1biB0aGUgdGFzayBvbiBzdGFydC5cblx0ICovXG5cdHB1YmxpYyBydW5PblN0YXJ0OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyB0aGUgdGFzay5cblx0ICogQHBhcmFtIGFyZ3MgLSBBcmd1bWVudHMuXG5cdCAqL1xuXHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0cHVibGljIGFic3RyYWN0IGV4ZWMoLi4uYXJnczogYW55W10pOiBhbnkge1xuXHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk5PVF9JTVBMRU1FTlRFRFwiLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIFwiZXhlY1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZCgpOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkKCkgYXMgVGFzaztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZSgpOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKCkgYXMgVGFzaztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBJRC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiBzdXBlci50b1N0cmluZygpO1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyB0byB1c2UgZm9yIHRhc2sgZXhlY3V0aW9uIGJlaGF2aW9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tPcHRpb25zIGV4dGVuZHMgQWthaXJvTW9kdWxlT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHRpbWUgYmV0d2VlbiB0aGUgdGFzayBiZWluZyBleGVjdXRlZC5cblx0ICovXG5cdGRlbGF5PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgdGFzayBydW5zIG9uIHN0YXJ0LlxuXHQgKi9cblx0cnVuT25TdGFydD86IGJvb2xlYW47XG59XG4iXX0=