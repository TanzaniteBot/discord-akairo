"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
        this.client.once("ready", () => {
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
    once(event, listener) {
        return super.once(event, listener);
    }
}
exports.default = TaskHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza0hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L3Rhc2tzL1Rhc2tIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEseUVBQWlEO0FBR2pELHFFQUFzRjtBQUN0RixrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLFdBQVksU0FBUSx1QkFBYTtJQUNyRCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxjQUFJLEVBQ3BCLFVBQVUsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFDM0Isa0JBQWtCLEVBQ2xCLFVBQVUsRUFDWTtRQUV2QixJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxZQUFZLGNBQUksSUFBSSxhQUFhLEtBQUssY0FBSSxDQUFDLEVBQUU7WUFDekUsTUFBTSxJQUFJLHFCQUFXLENBQUMseUJBQXlCLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRSxjQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDaEY7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7SUFDSixDQUFDO0lBMkJEOzs7T0FHRztJQUNhLFVBQVUsQ0FBQyxJQUFVO1FBQ3BDLE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsWUFBWSxDQUFDLElBQVk7UUFDeEMsT0FBTyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBMkIsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsSUFBSSxDQUFDLEtBQW9CLEVBQUUsUUFBa0I7UUFDNUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQVMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNhLE9BQU8sQ0FBQyxTQUFrQixFQUFFLE1BQXNCO1FBQ2pFLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFnQixDQUFDO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ2EsUUFBUSxDQUFDLElBQVUsRUFBRSxRQUFpQjtRQUNyRCxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFTLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ2EsU0FBUztRQUN4QixPQUFPLEtBQUssQ0FBQyxTQUFTLEVBQWlCLENBQUM7SUFDekMsQ0FBQztJQUVEOzs7T0FHRztJQUNhLE1BQU0sQ0FBQyxFQUFVO1FBQ2hDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQVMsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7O09BRUc7SUFDYSxTQUFTO1FBQ3hCLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBaUIsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxRQUFRO1FBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLGNBQUksQ0FBQztvQkFBRSxPQUFPO2dCQUN0QyxJQUFJLE1BQU0sQ0FBQyxVQUFVO29CQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO29CQUNqQixXQUFXLENBQUMsR0FBRyxFQUFFO3dCQUNoQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2YsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDekI7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVlLEVBQUUsQ0FDakIsS0FBUSxFQUNSLFFBQTREO1FBRTVELE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNlLElBQUksQ0FDbkIsS0FBUSxFQUNSLFFBQTREO1FBRTVELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEMsQ0FBQztDQUNEO0FBdEpELDhCQXNKQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF3YWl0ZWQsIENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgVGFza0hhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdHlwaW5ncy9ldmVudHNcIjtcbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7IEFrYWlyb0hhbmRsZXJPcHRpb25zLCBMb2FkUHJlZGljYXRlIH0gZnJvbSBcIi4uL0FrYWlyb0hhbmRsZXJcIjtcbmltcG9ydCBUYXNrIGZyb20gXCIuL1Rhc2tcIjtcblxuLyoqXG4gKiBMb2FkcyB0YXNrcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFza0hhbmRsZXIgZXh0ZW5kcyBBa2Fpcm9IYW5kbGVyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNsaWVudDogQWthaXJvQ2xpZW50LFxuXHRcdHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUgPSBUYXNrLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi50c1wiXSxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9OiBBa2Fpcm9IYW5kbGVyT3B0aW9uc1xuXHQpIHtcblx0XHRpZiAoIShjbGFzc1RvSGFuZGxlLnByb3RvdHlwZSBpbnN0YW5jZW9mIFRhc2sgfHwgY2xhc3NUb0hhbmRsZSA9PT0gVGFzaykpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsIGNsYXNzVG9IYW5kbGUubmFtZSwgVGFzay5uYW1lKTtcblx0XHR9XG5cblx0XHRzdXBlcihjbGllbnQsIHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUsXG5cdFx0XHRleHRlbnNpb25zLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNhdGVnb3JpZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDYXRlZ29yeTxzdHJpbmcsIFRhc2s+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xhc3NUb0hhbmRsZTogdHlwZW9mIFRhc2s7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50XG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogRGlyZWN0b3J5IHRvIHRhc2tzLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRhc2tzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIHRhc2suXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgVGFzaz47XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gdGFzayAtIE1vZHVsZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZGVyZWdpc3Rlcih0YXNrOiBUYXNrKTogdm9pZCB7XG5cdFx0cmV0dXJuIHN1cGVyLmRlcmVnaXN0ZXIodGFzayk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjYXRlZ29yeSBieSBuYW1lLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGZpbmRDYXRlZ29yeShuYW1lOiBzdHJpbmcpOiBDYXRlZ29yeTxzdHJpbmcsIFRhc2s+IHtcblx0XHRyZXR1cm4gc3VwZXIuZmluZENhdGVnb3J5KG5hbWUpIGFzIENhdGVnb3J5PHN0cmluZywgVGFzaz47XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYSB0YXNrLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBNb2R1bGUgb3IgcGF0aCB0byBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZCh0aGluZzogc3RyaW5nIHwgVGFzaywgaXNSZWxvYWQ/OiBib29sZWFuKTogVGFzayB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWQodGhpbmcsIGlzUmVsb2FkKSBhcyBUYXNrO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCB0YXNrcyBmcm9tIHRoZSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZEFsbChkaXJlY3Rvcnk/OiBzdHJpbmcsIGZpbHRlcj86IExvYWRQcmVkaWNhdGUpOiBUYXNrSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWRBbGwoZGlyZWN0b3J5LCBmaWx0ZXIpIGFzIFRhc2tIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIHRhc2suXG5cdCAqIEBwYXJhbSB0YXNrIC0gVGFzayB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIHRhc2suXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVnaXN0ZXIodGFzazogVGFzaywgZmlsZXBhdGg/OiBzdHJpbmcpOiB2b2lkIHtcblx0XHRyZXR1cm4gc3VwZXIucmVnaXN0ZXIodGFzaywgZmlsZXBhdGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSB0YXNrLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgdGFzay5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoaWQ6IHN0cmluZyk6IFRhc2sge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoaWQpIGFzIFRhc2s7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgdGFza3MuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkQWxsKCk6IFRhc2tIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkQWxsKCkgYXMgVGFza0hhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIHRhc2suXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZShpZDogc3RyaW5nKTogVGFzayB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZShpZCkgYXMgVGFzaztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCB0YXNrcy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmVBbGwoKTogVGFza0hhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmVBbGwoKSBhcyBUYXNrSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdGFydCBhbGwgdGFza3MuXG5cdCAqL1xuXHRwdWJsaWMgc3RhcnRBbGwoKTogdm9pZCB7XG5cdFx0dGhpcy5jbGllbnQub25jZShcInJlYWR5XCIsICgpID0+IHtcblx0XHRcdHRoaXMubW9kdWxlcy5mb3JFYWNoKG1vZHVsZSA9PiB7XG5cdFx0XHRcdGlmICghKG1vZHVsZSBpbnN0YW5jZW9mIFRhc2spKSByZXR1cm47XG5cdFx0XHRcdGlmIChtb2R1bGUucnVuT25TdGFydCkgbW9kdWxlLmV4ZWMoKTtcblx0XHRcdFx0aWYgKG1vZHVsZS5kZWxheSkge1xuXHRcdFx0XHRcdHNldEludGVydmFsKCgpID0+IHtcblx0XHRcdFx0XHRcdG1vZHVsZS5leGVjKCk7XG5cdFx0XHRcdFx0fSwgTnVtYmVyKG1vZHVsZS5kZWxheSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHB1YmxpYyBvdmVycmlkZSBvbjxLIGV4dGVuZHMga2V5b2YgVGFza0hhbmRsZXJFdmVudHM+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogVGFza0hhbmRsZXJFdmVudHNbS11bXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub24oZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxuXHRwdWJsaWMgb3ZlcnJpZGUgb25jZTxLIGV4dGVuZHMga2V5b2YgVGFza0hhbmRsZXJFdmVudHM+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogVGFza0hhbmRsZXJFdmVudHNbS11bXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub25jZShldmVudCwgbGlzdGVuZXIpO1xuXHR9XG59XG4iXX0=