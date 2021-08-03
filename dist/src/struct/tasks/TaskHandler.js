"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const Task_1 = __importDefault(require("./Task"));
/**
 * Loads tasks.
 * @param client - The Akairo client.
 * @param options - Options.
 */
class TaskHandler extends AkairoHandler_1.default {
    constructor(client, { directory, classToHandle = Task_1.default, extensions = [".js", ".ts"], automateCategories, loadFilter }) {
        if (!(classToHandle.prototype instanceof Task_1.default || classToHandle === Task_1.default)) {
            throw new AkairoError_1.default("INVALID_CLASS_TO_HANDLE", classToHandle.name, Task_1.default.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });
    }
    /**
     * Deregisters a module.
     * @param task - Module to use.
     */
    deregister(task) {
        return super.deregister(task);
    }
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name) {
        return super.findCategory(name);
    }
    /**
     * Loads a task.
     * @param thing - Module or path to module.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    load(thing, isReload) {
        return super.load(thing, isReload);
    }
    /**
     * Reads all tasks from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory, filter) {
        return super.loadAll(directory, filter);
    }
    /**
     * Registers a task.
     * @param task - Task to use.
     * @param filepath - Filepath of task.
     */
    register(task, filepath) {
        return super.register(task, filepath);
    }
    /**
     * Reloads a task.
     * @param id - ID of the task.
     */
    reload(id) {
        return super.reload(id);
    }
    /**
     * Reloads all tasks.
     */
    reloadAll() {
        return super.reloadAll();
    }
    /**
     * Removes a task.
     * @param id - ID of the task.
     */
    remove(id) {
        return super.remove(id);
    }
    /**
     * Removes all tasks.
     */
    removeAll() {
        return super.removeAll();
    }
    /**
     * Start all tasks.
     */
    startAll() {
        this.client.on("ready", () => {
            this.modules.forEach(module => {
                if (!(module instanceof Task_1.default))
                    return;
                if (module.runOnStart)
                    module.exec();
                if (module.delay) {
                    setInterval(() => {
                        module.exec();
                    }, Number(module.delay));
                }
            });
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
}
exports.default = TaskHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza0hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L3Rhc2tzL1Rhc2tIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEseUVBQWlEO0FBR2pELHFFQUcwQjtBQUMxQixrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLFdBQVksU0FBUSx1QkFBYTtJQTBCckQsWUFDQyxNQUFvQixFQUNwQixFQUNDLFNBQVMsRUFDVCxhQUFhLEdBQUcsY0FBSSxFQUNwQixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEVBQ1k7UUFFdkIsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsWUFBWSxjQUFJLElBQUksYUFBYSxLQUFLLGNBQUksQ0FBQyxFQUFFO1lBQ3pFLE1BQU0sSUFBSSxxQkFBVyxDQUNwQix5QkFBeUIsRUFDekIsYUFBYSxDQUFDLElBQUksRUFDbEIsY0FBSSxDQUFDLElBQUksQ0FDVCxDQUFDO1NBQ0Y7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsVUFBVSxDQUFDLElBQVU7UUFDcEMsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7O09BR0c7SUFDYSxZQUFZLENBQUMsSUFBWTtRQUN4QyxPQUFPLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUEyQixDQUFDO0lBQzNELENBQUM7SUFFRDs7O09BR0c7SUFDSCx3REFBd0Q7SUFDeEMsSUFBSSxDQUFDLEtBQXdCLEVBQUUsUUFBa0I7UUFDaEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQVMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNhLE9BQU8sQ0FBQyxTQUFrQixFQUFFLE1BQXNCO1FBQ2pFLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFnQixDQUFDO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ2EsUUFBUSxDQUFDLElBQVUsRUFBRSxRQUFpQjtRQUNyRCxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFTLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ2EsU0FBUztRQUN4QixPQUFPLEtBQUssQ0FBQyxTQUFTLEVBQWlCLENBQUM7SUFDekMsQ0FBQztJQUVEOzs7T0FHRztJQUNhLE1BQU0sQ0FBQyxFQUFVO1FBQ2hDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQVMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7O09BRUc7SUFDYSxTQUFTO1FBQ3hCLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBaUIsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxRQUFRO1FBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLGNBQUksQ0FBQztvQkFBRSxPQUFPO2dCQUN0QyxJQUFJLE1BQU0sQ0FBQyxVQUFVO29CQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO29CQUNqQixXQUFXLENBQUMsR0FBRyxFQUFFO3dCQUNoQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2YsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDekI7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVlLEVBQUUsQ0FDakIsS0FBUSxFQUNSLFFBQTREO1FBRTVELE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNEO0FBckpELDhCQXFKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF3YWl0ZWQsIENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgVGFza0hhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdHlwaW5ncy9ldmVudHNcIjtcbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7XG5cdEFrYWlyb0hhbmRsZXJPcHRpb25zLFxuXHRMb2FkUHJlZGljYXRlXG59IGZyb20gXCIuLi9Ba2Fpcm9IYW5kbGVyXCI7XG5pbXBvcnQgVGFzayBmcm9tIFwiLi9UYXNrXCI7XG5cbi8qKlxuICogTG9hZHMgdGFza3MuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhc2tIYW5kbGVyIGV4dGVuZHMgQWthaXJvSGFuZGxlciB7XG5cdC8qKlxuXHQgKiBDYXRlZ29yaWVzLCBtYXBwZWQgYnkgSUQgdG8gQ2F0ZWdvcnkuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBUYXNrPj47XG5cblx0LyoqXG5cdCAqIENsYXNzIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBUYXNrO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudFxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIERpcmVjdG9yeSB0byB0YXNrcy5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGRpcmVjdG9yeTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUYXNrcyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byB0YXNrLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIFRhc2s+O1xuXG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gVGFzayxcblx0XHRcdGV4dGVuc2lvbnMgPSBbXCIuanNcIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fTogQWthaXJvSGFuZGxlck9wdGlvbnNcblx0KSB7XG5cdFx0aWYgKCEoY2xhc3NUb0hhbmRsZS5wcm90b3R5cGUgaW5zdGFuY2VvZiBUYXNrIHx8IGNsYXNzVG9IYW5kbGUgPT09IFRhc2spKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXG5cdFx0XHRcdFwiSU5WQUxJRF9DTEFTU19UT19IQU5ETEVcIixcblx0XHRcdFx0Y2xhc3NUb0hhbmRsZS5uYW1lLFxuXHRcdFx0XHRUYXNrLm5hbWVcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0c3VwZXIoY2xpZW50LCB7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIHRhc2sgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGRlcmVnaXN0ZXIodGFzazogVGFzayk6IHZvaWQge1xuXHRcdHJldHVybiBzdXBlci5kZXJlZ2lzdGVyKHRhc2spO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY2F0ZWdvcnkgYnkgbmFtZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBmaW5kQ2F0ZWdvcnkobmFtZTogc3RyaW5nKTogQ2F0ZWdvcnk8c3RyaW5nLCBUYXNrPiB7XG5cdFx0cmV0dXJuIHN1cGVyLmZpbmRDYXRlZ29yeShuYW1lKSBhcyBDYXRlZ29yeTxzdHJpbmcsIFRhc2s+O1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGEgdGFzay5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKi9cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHlwZXNcblx0cHVibGljIG92ZXJyaWRlIGxvYWQodGhpbmc6IHN0cmluZyB8IEZ1bmN0aW9uLCBpc1JlbG9hZD86IGJvb2xlYW4pOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZywgaXNSZWxvYWQpIGFzIFRhc2s7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIHRhc2tzIGZyb20gdGhlIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkQWxsKGRpcmVjdG9yeT86IHN0cmluZywgZmlsdGVyPzogTG9hZFByZWRpY2F0ZSk6IFRhc2tIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZEFsbChkaXJlY3RvcnksIGZpbHRlcikgYXMgVGFza0hhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgdGFzay5cblx0ICogQHBhcmFtIHRhc2sgLSBUYXNrIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgdGFzay5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWdpc3Rlcih0YXNrOiBUYXNrLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdHJldHVybiBzdXBlci5yZWdpc3Rlcih0YXNrLCBmaWxlcGF0aCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIHRhc2suXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZChpZDogc3RyaW5nKTogVGFzayB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZChpZCkgYXMgVGFzaztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCB0YXNrcy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWRBbGwoKTogVGFza0hhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWRBbGwoKSBhcyBUYXNrSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgdGFzay5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIHRhc2suXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBUYXNrO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIHRhc2tzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBUYXNrSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIFRhc2tIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0YXJ0IGFsbCB0YXNrcy5cblx0ICovXG5cdHB1YmxpYyBzdGFydEFsbD8oKTogdm9pZCB7XG5cdFx0dGhpcy5jbGllbnQub24oXCJyZWFkeVwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLm1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuXHRcdFx0XHRpZiAoIShtb2R1bGUgaW5zdGFuY2VvZiBUYXNrKSkgcmV0dXJuO1xuXHRcdFx0XHRpZiAobW9kdWxlLnJ1bk9uU3RhcnQpIG1vZHVsZS5leGVjKCk7XG5cdFx0XHRcdGlmIChtb2R1bGUuZGVsYXkpIHtcblx0XHRcdFx0XHRzZXRJbnRlcnZhbCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRtb2R1bGUuZXhlYygpO1xuXHRcdFx0XHRcdH0sIE51bWJlcihtb2R1bGUuZGVsYXkpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRwdWJsaWMgb3ZlcnJpZGUgb248SyBleHRlbmRzIGtleW9mIFRhc2tIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IFRhc2tIYW5kbGVyRXZlbnRzW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==