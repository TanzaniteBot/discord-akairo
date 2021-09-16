"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const Util_1 = __importDefault(require("../../util/Util"));
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const Inhibitor_1 = __importDefault(require("./Inhibitor"));
/**
 * Loads inhibitors and checks messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
class InhibitorHandler extends AkairoHandler_1.default {
    constructor(client, { directory, classToHandle = Inhibitor_1.default, extensions = [".js", ".ts"], automateCategories, loadFilter } = {}) {
        if (!(classToHandle.prototype instanceof Inhibitor_1.default || classToHandle === Inhibitor_1.default)) {
            throw new AkairoError_1.default("INVALID_CLASS_TO_HANDLE", classToHandle.name, Inhibitor_1.default.name);
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
     * @param inhibitor - Module to use.
     */
    deregister(inhibitor) {
        return super.deregister(inhibitor);
    }
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name) {
        return super.findCategory(name);
    }
    /**
     * Loads an inhibitor.
     * @param thing - Module or path to module.
     */
    load(thing) {
        return super.load(thing);
    }
    /**
     * Reads all inhibitors from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory, filter) {
        return super.loadAll(directory, filter);
    }
    /**
     * Registers a module.
     * @param inhibitor - Module to use.
     * @param filepath - Filepath of module.
     */
    register(inhibitor, filepath) {
        return super.register(inhibitor, filepath);
    }
    /**
     * Reloads an inhibitor.
     * @param id - ID of the inhibitor.
     */
    reload(id) {
        return super.reload(id);
    }
    /**
     * Reloads all inhibitors.
     */
    reloadAll() {
        return super.reloadAll();
    }
    /**
     * Removes an inhibitor.
     * @param {string} id - ID of the inhibitor.
     */
    remove(id) {
        return super.remove(id);
    }
    /**
     * Removes all inhibitors.
     */
    removeAll() {
        return super.removeAll();
    }
    /**
     * Tests inhibitors against the message.
     * Returns the reason if blocked.
     * @param type - Type of inhibitor, 'all', 'pre', or 'post'.
     * @param message - Message to test.
     * @param command - Command to use.
     */
    async test(type, message, command) {
        if (!this.modules.size)
            return null;
        const inhibitors = this.modules.filter(i => i.type === type);
        if (!inhibitors.size)
            return null;
        const promises = [];
        for (const inhibitor of inhibitors.values()) {
            promises.push((async () => {
                let inhibited = inhibitor.exec(message, command);
                if (Util_1.default.isPromise(inhibited))
                    inhibited = await inhibited;
                if (inhibited)
                    return inhibitor;
                return null;
            })());
        }
        const inhibitedInhibitors = (await Promise.all(promises)).filter(r => r);
        if (!inhibitedInhibitors.length)
            return null;
        inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
        return inhibitedInhibitors[0].reason;
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
}
exports.default = InhibitorHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5oaWJpdG9ySGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvaW5oaWJpdG9ycy9JbmhpYml0b3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EseUVBQWlEO0FBRWpELDJEQUFtQztBQUVuQyxxRUFBc0Y7QUFFdEYsNERBQW9DO0FBRXBDOzs7O0dBSUc7QUFDSCxNQUFxQixnQkFBaUIsU0FBUSx1QkFBYTtJQUMxRCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxtQkFBUyxFQUN6QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEtBQ2UsRUFBRTtRQUU1QixJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxZQUFZLG1CQUFTLElBQUksYUFBYSxLQUFLLG1CQUFTLENBQUMsRUFBRTtZQUNuRixNQUFNLElBQUkscUJBQVcsQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLG1CQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckY7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7SUFDSixDQUFDO0lBMkJEOzs7T0FHRztJQUNhLFVBQVUsQ0FBQyxTQUFvQjtRQUM5QyxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7T0FHRztJQUNhLFlBQVksQ0FBQyxJQUFZO1FBQ3hDLE9BQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQWdDLENBQUM7SUFDaEUsQ0FBQztJQUVEOzs7T0FHRztJQUNhLElBQUksQ0FBQyxLQUF5QjtRQUM3QyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxD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aXRlZCwgQ29sbGVjdGlvbiwgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gXCIuLi8uLlwiO1xuaW1wb3J0IHsgSW5oaWJpdG9ySGFuZGxlckV2ZW50cyB9IGZyb20gXCIuLi8uLi90eXBpbmdzL2V2ZW50c1wiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQWthaXJvTWVzc2FnZSBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9NZXNzYWdlXCI7XG5pbXBvcnQgVXRpbCBmcm9tIFwiLi4vLi4vdXRpbC9VdGlsXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7IEFrYWlyb0hhbmRsZXJPcHRpb25zLCBMb2FkUHJlZGljYXRlIH0gZnJvbSBcIi4uL0FrYWlyb0hhbmRsZXJcIjtcbmltcG9ydCBDb21tYW5kIGZyb20gXCIuLi9jb21tYW5kcy9Db21tYW5kXCI7XG5pbXBvcnQgSW5oaWJpdG9yIGZyb20gXCIuL0luaGliaXRvclwiO1xuXG4vKipcbiAqIExvYWRzIGluaGliaXRvcnMgYW5kIGNoZWNrcyBtZXNzYWdlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5oaWJpdG9ySGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IEluaGliaXRvcixcblx0XHRcdGV4dGVuc2lvbnMgPSBbXCIuanNcIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fTogQWthaXJvSGFuZGxlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHRpZiAoIShjbGFzc1RvSGFuZGxlLnByb3RvdHlwZSBpbnN0YW5jZW9mIEluaGliaXRvciB8fCBjbGFzc1RvSGFuZGxlID09PSBJbmhpYml0b3IpKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX0NMQVNTX1RPX0hBTkRMRVwiLCBjbGFzc1RvSGFuZGxlLm5hbWUsIEluaGliaXRvci5uYW1lKTtcblx0XHR9XG5cblx0XHRzdXBlcihjbGllbnQsIHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUsXG5cdFx0XHRleHRlbnNpb25zLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNhdGVnb3JpZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDYXRlZ29yeTxzdHJpbmcsIEluaGliaXRvcj4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgSW5oaWJpdG9yO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBEaXJlY3RvcnkgdG8gaW5oaWJpdG9ycy5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGRpcmVjdG9yeTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBJbmhpYml0b3JzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIEluaGliaXRvci5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIG1vZHVsZXM6IENvbGxlY3Rpb248c3RyaW5nLCBJbmhpYml0b3I+O1xuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGluaGliaXRvciAtIE1vZHVsZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZGVyZWdpc3RlcihpbmhpYml0b3I6IEluaGliaXRvcik6IHZvaWQge1xuXHRcdHJldHVybiBzdXBlci5kZXJlZ2lzdGVyKGluaGliaXRvcik7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjYXRlZ29yeSBieSBuYW1lLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGZpbmRDYXRlZ29yeShuYW1lOiBzdHJpbmcpOiBDYXRlZ29yeTxzdHJpbmcsIEluaGliaXRvcj4ge1xuXHRcdHJldHVybiBzdXBlci5maW5kQ2F0ZWdvcnkobmFtZSkgYXMgQ2F0ZWdvcnk8c3RyaW5nLCBJbmhpYml0b3I+O1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGFuIGluaGliaXRvci5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWQodGhpbmc6IHN0cmluZyB8IEluaGliaXRvcik6IFByb21pc2U8SW5oaWJpdG9yPiB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWQodGhpbmcpIGFzIFByb21pc2U8SW5oaWJpdG9yPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgaW5oaWJpdG9ycyBmcm9tIHRoZSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZEFsbChkaXJlY3Rvcnk/OiBzdHJpbmcsIGZpbHRlcj86IExvYWRQcmVkaWNhdGUpOiBQcm9taXNlPEluaGliaXRvckhhbmRsZXI+IHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZEFsbChkaXJlY3RvcnksIGZpbHRlcikgYXMgUHJvbWlzZTxJbmhpYml0b3JIYW5kbGVyPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpbmhpYml0b3IgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVnaXN0ZXIoaW5oaWJpdG9yOiBJbmhpYml0b3IsIGZpbGVwYXRoPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlZ2lzdGVyKGluaGliaXRvciwgZmlsZXBhdGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYW4gaW5oaWJpdG9yLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgaW5oaWJpdG9yLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZChpZDogc3RyaW5nKTogUHJvbWlzZTxJbmhpYml0b3I+IHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkKGlkKSBhcyBQcm9taXNlPEluaGliaXRvcj47XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgaW5oaWJpdG9ycy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWRBbGwoKTogUHJvbWlzZTxJbmhpYml0b3JIYW5kbGVyPiB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZEFsbCgpIGFzIFByb21pc2U8SW5oaWJpdG9ySGFuZGxlcj47XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbiBpbmhpYml0b3IuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIElEIG9mIHRoZSBpbmhpYml0b3IuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBJbmhpYml0b3Ige1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmUoaWQpIGFzIEluaGliaXRvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBpbmhpYml0b3JzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBJbmhpYml0b3JIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlQWxsKCkgYXMgSW5oaWJpdG9ySGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUZXN0cyBpbmhpYml0b3JzIGFnYWluc3QgdGhlIG1lc3NhZ2UuXG5cdCAqIFJldHVybnMgdGhlIHJlYXNvbiBpZiBibG9ja2VkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFR5cGUgb2YgaW5oaWJpdG9yLCAnYWxsJywgJ3ByZScsIG9yICdwb3N0Jy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHRlc3QuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgdGVzdChcblx0XHR0eXBlOiBcImFsbFwiIHwgXCJwcmVcIiB8IFwicG9zdFwiLFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdGNvbW1hbmQ/OiBDb21tYW5kXG5cdCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbCB8IHZvaWQ+IHtcblx0XHRpZiAoIXRoaXMubW9kdWxlcy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdGNvbnN0IGluaGliaXRvcnMgPSB0aGlzLm1vZHVsZXMuZmlsdGVyKGkgPT4gaS50eXBlID09PSB0eXBlKTtcblx0XHRpZiAoIWluaGliaXRvcnMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRjb25zdCBwcm9taXNlcyA9IFtdO1xuXG5cdFx0Zm9yIChjb25zdCBpbmhpYml0b3Igb2YgaW5oaWJpdG9ycy52YWx1ZXMoKSkge1xuXHRcdFx0cHJvbWlzZXMucHVzaChcblx0XHRcdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRsZXQgaW5oaWJpdGVkID0gaW5oaWJpdG9yLmV4ZWMobWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGluaGliaXRlZCkpIGluaGliaXRlZCA9IGF3YWl0IGluaGliaXRlZDtcblx0XHRcdFx0XHRpZiAoaW5oaWJpdGVkKSByZXR1cm4gaW5oaWJpdG9yO1xuXHRcdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0XHR9KSgpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGluaGliaXRlZEluaGliaXRvcnMgPSAoYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpKS5maWx0ZXIociA9PiByKSBhcyBJbmhpYml0b3JbXTtcblx0XHRpZiAoIWluaGliaXRlZEluaGliaXRvcnMubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuXHRcdGluaGliaXRlZEluaGliaXRvcnMuc29ydCgoYSwgYikgPT4gYi5wcmlvcml0eSAtIGEucHJpb3JpdHkpO1xuXHRcdHJldHVybiBpbmhpYml0ZWRJbmhpYml0b3JzWzBdLnJlYXNvbjtcblx0fVxuXG5cdHB1YmxpYyBvdmVycmlkZSBvbjxLIGV4dGVuZHMga2V5b2YgSW5oaWJpdG9ySGFuZGxlckV2ZW50cz4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBJbmhpYml0b3JIYW5kbGVyRXZlbnRzW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cblx0cHVibGljIG92ZXJyaWRlIG9uY2U8SyBleHRlbmRzIGtleW9mIEluaGliaXRvckhhbmRsZXJFdmVudHM+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogSW5oaWJpdG9ySGFuZGxlckV2ZW50c1tLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbmNlKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==