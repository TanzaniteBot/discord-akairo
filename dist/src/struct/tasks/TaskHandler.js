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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza0hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L3Rhc2tzL1Rhc2tIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEseUVBQWlEO0FBR2pELHFFQUcwQjtBQUMxQixrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLFdBQVksU0FBUSx1QkFBYTtJQUNyRCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxjQUFJLEVBQ3BCLFVBQVUsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFDM0Isa0JBQWtCLEVBQ2xCLFVBQVUsRUFDWTtRQUV2QixJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxZQUFZLGNBQUksSUFBSSxhQUFhLEtBQUssY0FBSSxDQUFDLEVBQUU7WUFDekUsTUFBTSxJQUFJLHFCQUFXLENBQ3BCLHlCQUF5QixFQUN6QixhQUFhLENBQUMsSUFBSSxFQUNsQixjQUFJLENBQUMsSUFBSSxDQUNULENBQUM7U0FDRjtRQUVELEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDYixTQUFTO1lBQ1QsYUFBYTtZQUNiLFVBQVU7WUFDVixrQkFBa0I7WUFDbEIsVUFBVTtTQUNWLENBQUMsQ0FBQztJQUNKLENBQUM7SUEyQkQ7OztPQUdHO0lBQ2EsVUFBVSxDQUFDLElBQVU7UUFDcEMsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7O09BR0c7SUFDYSxZQUFZLENBQUMsSUFBWTtRQUN4QyxPQUFPLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUEyQixDQUFDO0lBQzNELENBQUM7SUFFRDs7O09BR0c7SUFDYSxJQUFJLENBQUMsS0FBb0IsRUFBRSxRQUFrQjtRQUM1RCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBUyxDQUFDO0lBQzVDLENBQUM7SUFFRDs7OztPQUlHO0lBQ2EsT0FBTyxDQUN0QixTQUFrQixFQUNsQixNQUFzQjtRQUV0QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBZ0IsQ0FBQztJQUN4RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNhLFFBQVEsQ0FBQyxJQUFVLEVBQUUsUUFBaUI7UUFDckQsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsTUFBTSxDQUFDLEVBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBUyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFpQixDQUFDO0lBQ3pDLENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFTLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ2EsU0FBUztRQUN4QixPQUFPLEtBQUssQ0FBQyxTQUFTLEVBQWlCLENBQUM7SUFDekMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksUUFBUTtRQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxDQUFDLE1BQU0sWUFBWSxjQUFJLENBQUM7b0JBQUUsT0FBTztnQkFDdEMsSUFBSSxNQUFNLENBQUMsVUFBVTtvQkFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JDLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtvQkFDakIsV0FBVyxDQUFDLEdBQUcsRUFBRTt3QkFDaEIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNmLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQ3pCO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFZSxFQUFFLENBQ2pCLEtBQVEsRUFDUixRQUE0RDtRQUU1RCxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRDtBQXZKRCw4QkF1SkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBd2FpdGVkLCBDb2xsZWN0aW9uIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IFRhc2tIYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uLy4uL3R5cGluZ3MvZXZlbnRzXCI7XG5pbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvSGFuZGxlciwge1xuXHRBa2Fpcm9IYW5kbGVyT3B0aW9ucyxcblx0TG9hZFByZWRpY2F0ZVxufSBmcm9tIFwiLi4vQWthaXJvSGFuZGxlclwiO1xuaW1wb3J0IFRhc2sgZnJvbSBcIi4vVGFza1wiO1xuXG4vKipcbiAqIExvYWRzIHRhc2tzLlxuICogQHBhcmFtIGNsaWVudCAtIFRoZSBBa2Fpcm8gY2xpZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYXNrSGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IFRhc2ssXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zXG5cdCkge1xuXHRcdGlmICghKGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgVGFzayB8fCBjbGFzc1RvSGFuZGxlID09PSBUYXNrKSkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFxuXHRcdFx0XHRcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsXG5cdFx0XHRcdGNsYXNzVG9IYW5kbGUubmFtZSxcblx0XHRcdFx0VGFzay5uYW1lXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHN1cGVyKGNsaWVudCwge1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSxcblx0XHRcdGV4dGVuc2lvbnMsXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgVGFzaz4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgVGFzaztcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnRcblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBEaXJlY3RvcnkgdG8gdGFza3MuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogVGFza3MgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gdGFzay5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIG1vZHVsZXM6IENvbGxlY3Rpb248c3RyaW5nLCBUYXNrPjtcblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSB0YXNrIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBkZXJlZ2lzdGVyKHRhc2s6IFRhc2spOiB2b2lkIHtcblx0XHRyZXR1cm4gc3VwZXIuZGVyZWdpc3Rlcih0YXNrKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNhdGVnb3J5IGJ5IG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZmluZENhdGVnb3J5KG5hbWU6IHN0cmluZyk6IENhdGVnb3J5PHN0cmluZywgVGFzaz4ge1xuXHRcdHJldHVybiBzdXBlci5maW5kQ2F0ZWdvcnkobmFtZSkgYXMgQ2F0ZWdvcnk8c3RyaW5nLCBUYXNrPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIHRhc2suXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkKHRoaW5nOiBzdHJpbmcgfCBUYXNrLCBpc1JlbG9hZD86IGJvb2xlYW4pOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZywgaXNSZWxvYWQpIGFzIFRhc2s7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIHRhc2tzIGZyb20gdGhlIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkQWxsKFxuXHRcdGRpcmVjdG9yeT86IHN0cmluZyxcblx0XHRmaWx0ZXI/OiBMb2FkUHJlZGljYXRlXG5cdCk6IFRhc2tIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZEFsbChkaXJlY3RvcnksIGZpbHRlcikgYXMgVGFza0hhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgdGFzay5cblx0ICogQHBhcmFtIHRhc2sgLSBUYXNrIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgdGFzay5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWdpc3Rlcih0YXNrOiBUYXNrLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdHJldHVybiBzdXBlci5yZWdpc3Rlcih0YXNrLCBmaWxlcGF0aCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIHRhc2suXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZChpZDogc3RyaW5nKTogVGFzayB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZChpZCkgYXMgVGFzaztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCB0YXNrcy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWRBbGwoKTogVGFza0hhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWRBbGwoKSBhcyBUYXNrSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgdGFzay5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIHRhc2suXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBUYXNrO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIHRhc2tzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBUYXNrSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIFRhc2tIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0YXJ0IGFsbCB0YXNrcy5cblx0ICovXG5cdHB1YmxpYyBzdGFydEFsbD8oKTogdm9pZCB7XG5cdFx0dGhpcy5jbGllbnQub24oXCJyZWFkeVwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLm1vZHVsZXMuZm9yRWFjaChtb2R1bGUgPT4ge1xuXHRcdFx0XHRpZiAoIShtb2R1bGUgaW5zdGFuY2VvZiBUYXNrKSkgcmV0dXJuO1xuXHRcdFx0XHRpZiAobW9kdWxlLnJ1bk9uU3RhcnQpIG1vZHVsZS5leGVjKCk7XG5cdFx0XHRcdGlmIChtb2R1bGUuZGVsYXkpIHtcblx0XHRcdFx0XHRzZXRJbnRlcnZhbCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRtb2R1bGUuZXhlYygpO1xuXHRcdFx0XHRcdH0sIE51bWJlcihtb2R1bGUuZGVsYXkpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRwdWJsaWMgb3ZlcnJpZGUgb248SyBleHRlbmRzIGtleW9mIFRhc2tIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IFRhc2tIYW5kbGVyRXZlbnRzW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==