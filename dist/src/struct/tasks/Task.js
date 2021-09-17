"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvdGFza3MvVGFzay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtFQUFrRTtBQUNsRSx5RUFBaUQ7QUFHakQsbUVBQW9FO0FBR3BFOzs7O0dBSUc7QUFDSCxNQUE4QixJQUFLLFNBQVEsc0JBQVk7SUFDdEQsWUFBbUIsRUFBVSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLEdBQUcsS0FBSyxFQUFlO1FBQ2xGLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRXhCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQzlCLENBQUM7SUFZRDs7T0FFRztJQUNJLEtBQUssQ0FBVTtJQVl0Qjs7T0FFRztJQUNJLFVBQVUsQ0FBVTtJQUUzQjs7O09BR0c7SUFDSSxJQUFJLENBQUMsR0FBRyxJQUFXO1FBQ3pCLE1BQU0sSUFBSSxxQkFBVyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU07UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFtQixDQUFDO0lBQ3hDLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU07UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFVLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ2EsUUFBUTtRQUN2QixPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN6QixDQUFDO0NBQ0Q7QUFsRUQsdUJBa0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgZnVuYy1uYW1lcywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzICovXG5pbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvTW9kdWxlLCB7IEFrYWlyb01vZHVsZU9wdGlvbnMgfSBmcm9tIFwiLi4vQWthaXJvTW9kdWxlXCI7XG5pbXBvcnQgVGFza0hhbmRsZXIgZnJvbSBcIi4vVGFza0hhbmRsZXJcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdGFzay5cbiAqIEBwYXJhbSBpZCAtIFRhc2sgSUQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSB0YXNrLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBUYXNrIGV4dGVuZHMgQWthaXJvTW9kdWxlIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHsgY2F0ZWdvcnksIGRlbGF5LCBydW5PblN0YXJ0ID0gZmFsc2UgfTogVGFza09wdGlvbnMpIHtcblx0XHRzdXBlcihpZCwgeyBjYXRlZ29yeSB9KTtcblxuXHRcdHRoaXMuZGVsYXkgPSBkZWxheTtcblx0XHR0aGlzLnJ1bk9uU3RhcnQgPSBydW5PblN0YXJ0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjYXRlZ29yeSBvZiB0aGlzIHRhc2suXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjYXRlZ29yeTogQ2F0ZWdvcnk8c3RyaW5nLCBUYXNrPjtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogVGhlIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGJldHdlZW4gZWFjaCB0aW1lIHRoZSB0YXNrIGlzIHJ1bi5cblx0ICovXG5cdHB1YmxpYyBkZWxheT86IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGZpbGVwYXRoLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZmlsZXBhdGg6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBoYW5kbGVyOiBUYXNrSGFuZGxlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gcnVuIHRoZSB0YXNrIG9uIHN0YXJ0LlxuXHQgKi9cblx0cHVibGljIHJ1bk9uU3RhcnQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEV4ZWN1dGVzIHRoZSB0YXNrLlxuXHQgKiBAcGFyYW0gYXJncyAtIEFyZ3VtZW50cy5cblx0ICovXG5cdHB1YmxpYyBleGVjKC4uLmFyZ3M6IGFueVtdKTogYW55IHtcblx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJOT1RfSU1QTEVNRU5URURcIiwgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBcImV4ZWNcIik7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyB0aGUgdGFzay5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoKTogUHJvbWlzZTxUYXNrPiB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZCgpIGFzIFByb21pc2U8VGFzaz47XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyB0aGUgdGFzay5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmUoKTogVGFzayB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZSgpIGFzIFRhc2s7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgSUQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gc3VwZXIudG9TdHJpbmcoKTtcblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbnMgdG8gdXNlIGZvciB0YXNrIGV4ZWN1dGlvbiBiZWhhdmlvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUYXNrT3B0aW9ucyBleHRlbmRzIEFrYWlyb01vZHVsZU9wdGlvbnMge1xuXHQvKipcblx0ICogVGhlIGFtb3VudCBvZiB0aW1lIGJldHdlZW4gdGhlIHRhc2sgYmVpbmcgZXhlY3V0ZWQuXG5cdCAqL1xuXHRkZWxheT86IG51bWJlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIHRhc2sgcnVucyBvbiBzdGFydC5cblx0ICovXG5cdHJ1bk9uU3RhcnQ/OiBib29sZWFuO1xufVxuIl19