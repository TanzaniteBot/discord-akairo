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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza0hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L3Rhc2tzL1Rhc2tIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEseUVBQWlEO0FBR2pELHFFQUFzRjtBQUN0RixrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLFdBQVksU0FBUSx1QkFBYTtJQUNyRCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxjQUFJLEVBQ3BCLFVBQVUsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFDM0Isa0JBQWtCLEVBQ2xCLFVBQVUsRUFDWTtRQUV2QixJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxZQUFZLGNBQUksSUFBSSxhQUFhLEtBQUssY0FBSSxDQUFDLEVBQUU7WUFDekUsTUFBTSxJQUFJLHFCQUFXLENBQUMseUJBQXlCLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRSxjQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDaEY7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7SUFDSixDQUFDO0lBMkJEOzs7T0FHRztJQUNhLFVBQVUsQ0FBQyxJQUFVO1FBQ3BDLE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsWUFBWSxDQUFDLElBQVk7UUFDeEMsT0FBTyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBMkIsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsSUFBSSxDQUFDLEtBQW9CLEVBQUUsUUFBa0I7UUFDNUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQWtCLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7O09BSUc7SUFDYSxPQUFPLENBQUMsU0FBa0IsRUFBRSxNQUFzQjtRQUNqRSxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBeUIsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNhLFFBQVEsQ0FBQyxJQUFVLEVBQUUsUUFBaUI7UUFDckQsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsTUFBTSxDQUFDLEVBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBa0IsQ0FBQztJQUMxQyxDQUFDO0lBRUQ7O09BRUc7SUFDYSxTQUFTO1FBQ3hCLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBMEIsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsTUFBTSxDQUFDLEVBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBUyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFpQixDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNJLFFBQVE7UUFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM3QixJQUFJLENBQUMsQ0FBQyxNQUFNLFlBQVksY0FBSSxDQUFDO29CQUFFLE9BQU87Z0JBQ3RDLElBQUksTUFBTSxDQUFDLFVBQVU7b0JBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNyQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7b0JBQ2pCLFdBQVcsQ0FBQyxHQUFHLEVBQUU7d0JBQ2hCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDZixDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRWUsRUFBRSxDQUNqQixLQUFRLEVBQ1IsUUFBNEQ7UUFFNUQsT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQ2UsSUFBSSxDQUNuQixLQUFRLEVBQ1IsUUFBNEQ7UUFFNUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQ0Q7QUF0SkQsOEJBc0pDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXdhaXRlZCwgQ29sbGVjdGlvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBUYXNrSGFuZGxlckV2ZW50cyB9IGZyb20gXCIuLi8uLi90eXBpbmdzL2V2ZW50c1wiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uLy4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIsIHsgQWthaXJvSGFuZGxlck9wdGlvbnMsIExvYWRQcmVkaWNhdGUgfSBmcm9tIFwiLi4vQWthaXJvSGFuZGxlclwiO1xuaW1wb3J0IFRhc2sgZnJvbSBcIi4vVGFza1wiO1xuXG4vKipcbiAqIExvYWRzIHRhc2tzLlxuICogQHBhcmFtIGNsaWVudCAtIFRoZSBBa2Fpcm8gY2xpZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYXNrSGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IFRhc2ssXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zXG5cdCkge1xuXHRcdGlmICghKGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgVGFzayB8fCBjbGFzc1RvSGFuZGxlID09PSBUYXNrKSkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9DTEFTU19UT19IQU5ETEVcIiwgY2xhc3NUb0hhbmRsZS5uYW1lLCBUYXNrLm5hbWUpO1xuXHRcdH1cblxuXHRcdHN1cGVyKGNsaWVudCwge1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSxcblx0XHRcdGV4dGVuc2lvbnMsXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgVGFzaz4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgVGFzaztcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnRcblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBEaXJlY3RvcnkgdG8gdGFza3MuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogVGFza3MgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gdGFzay5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIG1vZHVsZXM6IENvbGxlY3Rpb248c3RyaW5nLCBUYXNrPjtcblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSB0YXNrIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBkZXJlZ2lzdGVyKHRhc2s6IFRhc2spOiB2b2lkIHtcblx0XHRyZXR1cm4gc3VwZXIuZGVyZWdpc3Rlcih0YXNrKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNhdGVnb3J5IGJ5IG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZmluZENhdGVnb3J5KG5hbWU6IHN0cmluZyk6IENhdGVnb3J5PHN0cmluZywgVGFzaz4ge1xuXHRcdHJldHVybiBzdXBlci5maW5kQ2F0ZWdvcnkobmFtZSkgYXMgQ2F0ZWdvcnk8c3RyaW5nLCBUYXNrPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIHRhc2suXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkKHRoaW5nOiBzdHJpbmcgfCBUYXNrLCBpc1JlbG9hZD86IGJvb2xlYW4pOiBQcm9taXNlPFRhc2s+IHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZywgaXNSZWxvYWQpIGFzIFByb21pc2U8VGFzaz47XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIHRhc2tzIGZyb20gdGhlIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkQWxsKGRpcmVjdG9yeT86IHN0cmluZywgZmlsdGVyPzogTG9hZFByZWRpY2F0ZSk6IFByb21pc2U8VGFza0hhbmRsZXI+IHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZEFsbChkaXJlY3RvcnksIGZpbHRlcikgYXMgUHJvbWlzZTxUYXNrSGFuZGxlcj47XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgdGFzay5cblx0ICogQHBhcmFtIHRhc2sgLSBUYXNrIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgdGFzay5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWdpc3Rlcih0YXNrOiBUYXNrLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdHJldHVybiBzdXBlci5yZWdpc3Rlcih0YXNrLCBmaWxlcGF0aCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIHRhc2suXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSB0YXNrLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZChpZDogc3RyaW5nKTogUHJvbWlzZTxUYXNrPiB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZChpZCkgYXMgUHJvbWlzZTxUYXNrPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCB0YXNrcy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWRBbGwoKTogUHJvbWlzZTxUYXNrSGFuZGxlcj4ge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWRBbGwoKSBhcyBQcm9taXNlPFRhc2tIYW5kbGVyPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgdGFzay5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIHRhc2suXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBUYXNrIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBUYXNrO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIHRhc2tzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBUYXNrSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIFRhc2tIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0YXJ0IGFsbCB0YXNrcy5cblx0ICovXG5cdHB1YmxpYyBzdGFydEFsbCgpOiB2b2lkIHtcblx0XHR0aGlzLmNsaWVudC5vbmNlKFwicmVhZHlcIiwgKCkgPT4ge1xuXHRcdFx0dGhpcy5tb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IHtcblx0XHRcdFx0aWYgKCEobW9kdWxlIGluc3RhbmNlb2YgVGFzaykpIHJldHVybjtcblx0XHRcdFx0aWYgKG1vZHVsZS5ydW5PblN0YXJ0KSBtb2R1bGUuZXhlYygpO1xuXHRcdFx0XHRpZiAobW9kdWxlLmRlbGF5KSB7XG5cdFx0XHRcdFx0c2V0SW50ZXJ2YWwoKCkgPT4ge1xuXHRcdFx0XHRcdFx0bW9kdWxlLmV4ZWMoKTtcblx0XHRcdFx0XHR9LCBOdW1iZXIobW9kdWxlLmRlbGF5KSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cHVibGljIG92ZXJyaWRlIG9uPEsgZXh0ZW5kcyBrZXlvZiBUYXNrSGFuZGxlckV2ZW50cz4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBUYXNrSGFuZGxlckV2ZW50c1tLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbihldmVudCwgbGlzdGVuZXIpO1xuXHR9XG5cdHB1YmxpYyBvdmVycmlkZSBvbmNlPEsgZXh0ZW5kcyBrZXlvZiBUYXNrSGFuZGxlckV2ZW50cz4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBUYXNrSGFuZGxlckV2ZW50c1tLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbmNlKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==