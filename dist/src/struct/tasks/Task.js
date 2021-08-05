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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvdGFza3MvVGFzay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtFQUFrRTtBQUNsRSx5RUFBaUQ7QUFHakQsbUVBQW9FO0FBR3BFOzs7O0dBSUc7QUFDSCxNQUE4QixJQUFLLFNBQVEsc0JBQVk7SUFDdEQsWUFDQyxFQUFVLEVBQ1YsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsR0FBRyxLQUFLLEVBQWU7UUFFcEQsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDOUIsQ0FBQztJQVlEOztPQUVHO0lBQ0ksS0FBSyxDQUFTO0lBWXJCOztPQUVHO0lBQ0ksVUFBVSxDQUFVO0lBRTNCOzs7T0FHRztJQUNJLElBQUksQ0FBQyxHQUFHLElBQVc7UUFDekIsTUFBTSxJQUFJLHFCQUFXLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVEOztPQUVHO0lBQ2EsTUFBTTtRQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQVUsQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDYSxNQUFNO1FBQ3JCLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBVSxDQUFDO0lBQy9CLENBQUM7SUFFRDs7T0FFRztJQUNhLFFBQVE7UUFDdkIsT0FBTyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekIsQ0FBQztDQUNEO0FBdEVELHVCQXNFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIGZ1bmMtbmFtZXMsIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uLy4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSwgeyBBa2Fpcm9Nb2R1bGVPcHRpb25zIH0gZnJvbSBcIi4uL0FrYWlyb01vZHVsZVwiO1xuaW1wb3J0IFRhc2tIYW5kbGVyIGZyb20gXCIuL1Rhc2tIYW5kbGVyXCI7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRhc2suXG4gKiBAcGFyYW0gaWQgLSBUYXNrIElELlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIGZvciB0aGUgdGFzay5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgVGFzayBleHRlbmRzIEFrYWlyb01vZHVsZSB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRpZDogc3RyaW5nLFxuXHRcdHsgY2F0ZWdvcnksIGRlbGF5LCBydW5PblN0YXJ0ID0gZmFsc2UgfTogVGFza09wdGlvbnNcblx0KSB7XG5cdFx0c3VwZXIoaWQsIHsgY2F0ZWdvcnkgfSk7XG5cblx0XHR0aGlzLmRlbGF5ID0gZGVsYXk7XG5cblx0XHR0aGlzLnJ1bk9uU3RhcnQgPSBydW5PblN0YXJ0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjYXRlZ29yeSBvZiB0aGlzIHRhc2suXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjYXRlZ29yeTogQ2F0ZWdvcnk8c3RyaW5nLCBUYXNrPjtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogVGhlIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGJldHdlZW4gZWFjaCB0aW1lIHRoZSB0YXNrIGlzIHJ1bi5cblx0ICovXG5cdHB1YmxpYyBkZWxheTogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgZmlsZXBhdGguXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBmaWxlcGF0aDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGhhbmRsZXI6IFRhc2tIYW5kbGVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBydW4gdGhlIHRhc2sgb24gc3RhcnQuXG5cdCAqL1xuXHRwdWJsaWMgcnVuT25TdGFydDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogRXhlY3V0ZXMgdGhlIHRhc2suXG5cdCAqIEBwYXJhbSBhcmdzIC0gQXJndW1lbnRzLlxuXHQgKi9cblx0cHVibGljIGV4ZWMoLi4uYXJnczogYW55W10pOiBhbnkge1xuXHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk5PVF9JTVBMRU1FTlRFRFwiLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIFwiZXhlY1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZCgpOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkKCkgYXMgVGFzaztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZSgpOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKCkgYXMgVGFzaztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBJRC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiBzdXBlci50b1N0cmluZygpO1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyB0byB1c2UgZm9yIHRhc2sgZXhlY3V0aW9uIGJlaGF2aW9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRhc2tPcHRpb25zIGV4dGVuZHMgQWthaXJvTW9kdWxlT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHRpbWUgYmV0d2VlbiB0aGUgdGFzayBiZWluZyBleGVjdXRlZC5cblx0ICovXG5cdGRlbGF5PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgdGFzayBydW5zIG9uIHN0YXJ0LlxuXHQgKi9cblx0cnVuT25TdGFydD86IGJvb2xlYW47XG59XG4iXX0=