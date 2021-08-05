"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const Inhibitor_1 = __importDefault(require("./Inhibitor"));
const Util_1 = __importDefault(require("../../util/Util"));
/**
 * Loads inhibitors and checks messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
class InhibitorHandler extends AkairoHandler_1.default {
    constructor(client, { directory, classToHandle = Inhibitor_1.default, extensions = [".js", ".ts"], automateCategories, loadFilter } = {}) {
        if (!(classToHandle.prototype instanceof Inhibitor_1.default ||
            classToHandle === Inhibitor_1.default)) {
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
}
exports.default = InhibitorHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5oaWJpdG9ySGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvaW5oaWJpdG9ycy9JbmhpYml0b3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUVBQWlEO0FBQ2pELHFFQUcwQjtBQUMxQiw0REFBb0M7QUFDcEMsMkRBQW1DO0FBUW5DOzs7O0dBSUc7QUFDSCxNQUFxQixnQkFBaUIsU0FBUSx1QkFBYTtJQUMxRCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxtQkFBUyxFQUN6QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEtBQ2UsRUFBRTtRQUU1QixJQUNDLENBQUMsQ0FDQSxhQUFhLENBQUMsU0FBUyxZQUFZLG1CQUFTO1lBQzVDLGFBQWEsS0FBSyxtQkFBUyxDQUMzQixFQUNBO1lBQ0QsTUFBTSxJQUFJLHFCQUFXLENBQ3BCLHlCQUF5QixFQUN6QixhQUFhLENBQUMsSUFBSSxFQUNsQixtQkFBUyxDQUFDLElBQUksQ0FDZCxDQUFDO1NBQ0Y7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7SUFDSixDQUFDO0lBMkJEOzs7T0FHRztJQUNhLFVBQVUsQ0FBQyxTQUFvQjtRQUM5QyxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7T0FHRztJQUNhLFlBQVksQ0FBQyxJQUFZO1FBQ3hDLE9BQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQWdDLENBQUM7SUFDaEUsQ0FBQztJQUVEOzs7T0FHRztJQUNhLElBQUksQ0FBQyxLQUF5QjtRQUM3QyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFjLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDYSxPQUFPLENBQ3RCLFNBQWtCLEVBQ2xCLE1BQXNCO1FBRXRCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFxQixDQUFDO0lBQzdELENBQUM7SUFFRDs7OztPQUlHO0lBQ2EsUUFBUSxDQUFDLFNBQW9CLEVBQUUsUUFBaUI7UUFDL0QsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsTUFBTSxDQUFDLEVBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBYyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFzQixDQUFDO0lBQzlDLENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFjLENBQUM7SUFDdEMsQ0FBQztJQUVEOztPQUVHO0lBQ2EsU0FBUztRQUN4QixPQUFPLEtBQUssQ0FBQyxTQUFTLEVBQXNCLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLEtBQUssQ0FBQyxJQUFJLENBQ2hCLElBQTRCLEVBQzVCLE9BQWdDLEVBQ2hDLE9BQWlCO1FBRWpCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVwQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFbEMsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRXBCLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQzVDLFFBQVEsQ0FBQyxJQUFJLENBQ1osQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDWCxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDakQsSUFBSSxjQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztvQkFBRSxTQUFTLEdBQUcsTUFBTSxTQUFTLENBQUM7Z0JBQzNELElBQUksU0FBUztvQkFBRSxPQUFPLFNBQVMsQ0FBQztnQkFDaEMsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUMsRUFBRSxDQUNKLENBQUM7U0FDRjtRQUVELE1BQU0sbUJBQW1CLEdBQWdCLENBQ3hDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FDM0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRTdDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVELE9BQU8sbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3RDLENBQUM7SUFFZSxFQUFFLENBQ2pCLEtBQVEsRUFDUixRQUErRDtRQUUvRCxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRDtBQWxMRCxtQ0FrTEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7XG5cdEFrYWlyb0hhbmRsZXJPcHRpb25zLFxuXHRMb2FkUHJlZGljYXRlXG59IGZyb20gXCIuLi9Ba2Fpcm9IYW5kbGVyXCI7XG5pbXBvcnQgSW5oaWJpdG9yIGZyb20gXCIuL0luaGliaXRvclwiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IHsgQXdhaXRlZCwgQ29sbGVjdGlvbiwgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgQWthaXJvTWVzc2FnZSBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9NZXNzYWdlXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBDb21tYW5kIGZyb20gXCIuLi9jb21tYW5kcy9Db21tYW5kXCI7XG5pbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gXCIuLi8uLlwiO1xuaW1wb3J0IHsgSW5oaWJpdG9ySGFuZGxlckV2ZW50cyB9IGZyb20gXCIuLi8uLi90eXBpbmdzL2V2ZW50c1wiO1xuXG4vKipcbiAqIExvYWRzIGluaGliaXRvcnMgYW5kIGNoZWNrcyBtZXNzYWdlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5oaWJpdG9ySGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IEluaGliaXRvcixcblx0XHRcdGV4dGVuc2lvbnMgPSBbXCIuanNcIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fTogQWthaXJvSGFuZGxlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHRpZiAoXG5cdFx0XHQhKFxuXHRcdFx0XHRjbGFzc1RvSGFuZGxlLnByb3RvdHlwZSBpbnN0YW5jZW9mIEluaGliaXRvciB8fFxuXHRcdFx0XHRjbGFzc1RvSGFuZGxlID09PSBJbmhpYml0b3Jcblx0XHRcdClcblx0XHQpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcblx0XHRcdFx0XCJJTlZBTElEX0NMQVNTX1RPX0hBTkRMRVwiLFxuXHRcdFx0XHRjbGFzc1RvSGFuZGxlLm5hbWUsXG5cdFx0XHRcdEluaGliaXRvci5uYW1lXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHN1cGVyKGNsaWVudCwge1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSxcblx0XHRcdGV4dGVuc2lvbnMsXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgSW5oaWJpdG9yPj47XG5cblx0LyoqXG5cdCAqIENsYXNzIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBJbmhpYml0b3I7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIERpcmVjdG9yeSB0byBpbmhpYml0b3JzLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEluaGliaXRvcnMgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gSW5oaWJpdG9yLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIEluaGliaXRvcj47XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gaW5oaWJpdG9yIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBkZXJlZ2lzdGVyKGluaGliaXRvcjogSW5oaWJpdG9yKTogdm9pZCB7XG5cdFx0cmV0dXJuIHN1cGVyLmRlcmVnaXN0ZXIoaW5oaWJpdG9yKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNhdGVnb3J5IGJ5IG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZmluZENhdGVnb3J5KG5hbWU6IHN0cmluZyk6IENhdGVnb3J5PHN0cmluZywgSW5oaWJpdG9yPiB7XG5cdFx0cmV0dXJuIHN1cGVyLmZpbmRDYXRlZ29yeShuYW1lKSBhcyBDYXRlZ29yeTxzdHJpbmcsIEluaGliaXRvcj47XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYW4gaW5oaWJpdG9yLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBNb2R1bGUgb3IgcGF0aCB0byBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZCh0aGluZzogc3RyaW5nIHwgSW5oaWJpdG9yKTogSW5oaWJpdG9yIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZykgYXMgSW5oaWJpdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBpbmhpYml0b3JzIGZyb20gdGhlIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkQWxsKFxuXHRcdGRpcmVjdG9yeT86IHN0cmluZyxcblx0XHRmaWx0ZXI/OiBMb2FkUHJlZGljYXRlXG5cdCk6IEluaGliaXRvckhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5sb2FkQWxsKGRpcmVjdG9yeSwgZmlsdGVyKSBhcyBJbmhpYml0b3JIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGluaGliaXRvciAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWdpc3RlcihpbmhpYml0b3I6IEluaGliaXRvciwgZmlsZXBhdGg/OiBzdHJpbmcpOiB2b2lkIHtcblx0XHRyZXR1cm4gc3VwZXIucmVnaXN0ZXIoaW5oaWJpdG9yLCBmaWxlcGF0aCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbiBpbmhpYml0b3IuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBpbmhpYml0b3IuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkKGlkOiBzdHJpbmcpOiBJbmhpYml0b3Ige1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoaWQpIGFzIEluaGliaXRvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBpbmhpYml0b3JzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZEFsbCgpOiBJbmhpYml0b3JIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkQWxsKCkgYXMgSW5oaWJpdG9ySGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFuIGluaGliaXRvci5cblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gSUQgb2YgdGhlIGluaGliaXRvci5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmUoaWQ6IHN0cmluZyk6IEluaGliaXRvciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZShpZCkgYXMgSW5oaWJpdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIGluaGliaXRvcnMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlQWxsKCk6IEluaGliaXRvckhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmVBbGwoKSBhcyBJbmhpYml0b3JIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRlc3RzIGluaGliaXRvcnMgYWdhaW5zdCB0aGUgbWVzc2FnZS5cblx0ICogUmV0dXJucyB0aGUgcmVhc29uIGlmIGJsb2NrZWQuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVHlwZSBvZiBpbmhpYml0b3IsICdhbGwnLCAncHJlJywgb3IgJ3Bvc3QnLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gdGVzdC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyB0ZXN0KFxuXHRcdHR5cGU6IFwiYWxsXCIgfCBcInByZVwiIHwgXCJwb3N0XCIsXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsXG5cdFx0Y29tbWFuZD86IENvbW1hbmRcblx0KTogUHJvbWlzZTxzdHJpbmcgfCBudWxsIHwgdm9pZD4ge1xuXHRcdGlmICghdGhpcy5tb2R1bGVzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0Y29uc3QgaW5oaWJpdG9ycyA9IHRoaXMubW9kdWxlcy5maWx0ZXIoaSA9PiBpLnR5cGUgPT09IHR5cGUpO1xuXHRcdGlmICghaW5oaWJpdG9ycy5zaXplKSByZXR1cm4gbnVsbDtcblxuXHRcdGNvbnN0IHByb21pc2VzID0gW107XG5cblx0XHRmb3IgKGNvbnN0IGluaGliaXRvciBvZiBpbmhpYml0b3JzLnZhbHVlcygpKSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGxldCBpbmhpYml0ZWQgPSBpbmhpYml0b3IuZXhlYyhtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoaW5oaWJpdGVkKSkgaW5oaWJpdGVkID0gYXdhaXQgaW5oaWJpdGVkO1xuXHRcdFx0XHRcdGlmIChpbmhpYml0ZWQpIHJldHVybiBpbmhpYml0b3I7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5oaWJpdGVkSW5oaWJpdG9yczogSW5oaWJpdG9yW10gPSAoXG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcylcblx0XHQpLmZpbHRlcihyID0+IHIpO1xuXHRcdGlmICghaW5oaWJpdGVkSW5oaWJpdG9ycy5sZW5ndGgpIHJldHVybiBudWxsO1xuXG5cdFx0aW5oaWJpdGVkSW5oaWJpdG9ycy5zb3J0KChhLCBiKSA9PiBiLnByaW9yaXR5IC0gYS5wcmlvcml0eSk7XG5cdFx0cmV0dXJuIGluaGliaXRlZEluaGliaXRvcnNbMF0ucmVhc29uO1xuXHR9XG5cblx0cHVibGljIG92ZXJyaWRlIG9uPEsgZXh0ZW5kcyBrZXlvZiBJbmhpYml0b3JIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IEluaGliaXRvckhhbmRsZXJFdmVudHNbS10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==