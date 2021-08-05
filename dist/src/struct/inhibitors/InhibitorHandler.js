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
                // @ts-expect-error
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5oaWJpdG9ySGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvaW5oaWJpdG9ycy9JbmhpYml0b3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUVBQWlEO0FBQ2pELHFFQUcwQjtBQUMxQiw0REFBb0M7QUFDcEMsMkRBQW1DO0FBUW5DOzs7O0dBSUc7QUFDSCxNQUFxQixnQkFBaUIsU0FBUSx1QkFBYTtJQUMxRCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxtQkFBUyxFQUN6QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEtBQ2UsRUFBRTtRQUU1QixJQUNDLENBQUMsQ0FDQSxhQUFhLENBQUMsU0FBUyxZQUFZLG1CQUFTO1lBQzVDLGFBQWEsS0FBSyxtQkFBUyxDQUMzQixFQUNBO1lBQ0QsTUFBTSxJQUFJLHFCQUFXLENBQ3BCLHlCQUF5QixFQUN6QixhQUFhLENBQUMsSUFBSSxFQUNsQixtQkFBUyxDQUFDLElBQUksQ0FDZCxDQUFDO1NBQ0Y7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7SUFDSixDQUFDO0lBMkJEOzs7T0FHRztJQUNhLFVBQVUsQ0FBQyxTQUFvQjtRQUM5QyxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7T0FHRztJQUNhLFlBQVksQ0FBQyxJQUFZO1FBQ3hDLE9BQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQWdDLENBQUM7SUFDaEUsQ0FBQztJQUVEOzs7T0FHRztJQUNhLElBQUksQ0FBQyxLQUF5QjtRQUM3QyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFjLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDYSxPQUFPLENBQ3RCLFNBQWtCLEVBQ2xCLE1BQXNCO1FBRXRCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFxQixDQUFDO0lBQzdELENBQUM7SUFFRDs7OztPQUlHO0lBQ2EsUUFBUSxDQUFDLFNBQW9CLEVBQUUsUUFBaUI7UUFDL0QsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsTUFBTSxDQUFDLEVBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBYyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFzQixDQUFDO0lBQzlDLENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFjLENBQUM7SUFDdEMsQ0FBQztJQUVEOztPQUVHO0lBQ2EsU0FBUztRQUN4QixPQUFPLEtBQUssQ0FBQyxTQUFTLEVBQXNCLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLEtBQUssQ0FBQyxJQUFJLENBQ2hCLElBQTRCLEVBQzVCLE9BQWdDLEVBQ2hDLE9BQWlCO1FBRWpCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVwQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFbEMsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRXBCLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQzVDLFFBQVEsQ0FBQyxJQUFJLENBQ1osQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDWCxtQkFBbUI7Z0JBQ25CLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLGNBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO29CQUFFLFNBQVMsR0FBRyxNQUFNLFNBQVMsQ0FBQztnQkFDM0QsSUFBSSxTQUFTO29CQUFFLE9BQU8sU0FBUyxDQUFDO2dCQUNoQyxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsQ0FBQyxFQUFFLENBQ0osQ0FBQztTQUNGO1FBRUQsTUFBTSxtQkFBbUIsR0FBZ0IsQ0FDeEMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUMzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFN0MsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUQsT0FBTyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDdEMsQ0FBQztJQUVlLEVBQUUsQ0FDakIsS0FBUSxFQUNSLFFBQStEO1FBRS9ELE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNEO0FBbkxELG1DQW1MQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIsIHtcblx0QWthaXJvSGFuZGxlck9wdGlvbnMsXG5cdExvYWRQcmVkaWNhdGVcbn0gZnJvbSBcIi4uL0FrYWlyb0hhbmRsZXJcIjtcbmltcG9ydCBJbmhpYml0b3IgZnJvbSBcIi4vSW5oaWJpdG9yXCI7XG5pbXBvcnQgVXRpbCBmcm9tIFwiLi4vLi4vdXRpbC9VdGlsXCI7XG5pbXBvcnQgeyBBd2FpdGVkLCBDb2xsZWN0aW9uLCBNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBBa2Fpcm9NZXNzYWdlIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb01lc3NhZ2VcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IENvbW1hbmQgZnJvbSBcIi4uL2NvbW1hbmRzL0NvbW1hbmRcIjtcbmltcG9ydCB7IENhdGVnb3J5IH0gZnJvbSBcIi4uLy4uXCI7XG5pbXBvcnQgeyBJbmhpYml0b3JIYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uLy4uL3R5cGluZ3MvZXZlbnRzXCI7XG5cbi8qKlxuICogTG9hZHMgaW5oaWJpdG9ycyBhbmQgY2hlY2tzIG1lc3NhZ2VzLlxuICogQHBhcmFtIGNsaWVudCAtIFRoZSBBa2Fpcm8gY2xpZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmhpYml0b3JIYW5kbGVyIGV4dGVuZHMgQWthaXJvSGFuZGxlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gSW5oaWJpdG9yLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi50c1wiXSxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9OiBBa2Fpcm9IYW5kbGVyT3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdGlmIChcblx0XHRcdCEoXG5cdFx0XHRcdGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgSW5oaWJpdG9yIHx8XG5cdFx0XHRcdGNsYXNzVG9IYW5kbGUgPT09IEluaGliaXRvclxuXHRcdFx0KVxuXHRcdCkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFxuXHRcdFx0XHRcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsXG5cdFx0XHRcdGNsYXNzVG9IYW5kbGUubmFtZSxcblx0XHRcdFx0SW5oaWJpdG9yLm5hbWVcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0c3VwZXIoY2xpZW50LCB7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYXRlZ29yaWVzLCBtYXBwZWQgYnkgSUQgdG8gQ2F0ZWdvcnkuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBJbmhpYml0b3I+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xhc3NUb0hhbmRsZTogdHlwZW9mIEluaGliaXRvcjtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogRGlyZWN0b3J5IHRvIGluaGliaXRvcnMuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogSW5oaWJpdG9ycyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byBJbmhpYml0b3IuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgSW5oaWJpdG9yPjtcblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpbmhpYml0b3IgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGRlcmVnaXN0ZXIoaW5oaWJpdG9yOiBJbmhpYml0b3IpOiB2b2lkIHtcblx0XHRyZXR1cm4gc3VwZXIuZGVyZWdpc3RlcihpbmhpYml0b3IpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY2F0ZWdvcnkgYnkgbmFtZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBmaW5kQ2F0ZWdvcnkobmFtZTogc3RyaW5nKTogQ2F0ZWdvcnk8c3RyaW5nLCBJbmhpYml0b3I+IHtcblx0XHRyZXR1cm4gc3VwZXIuZmluZENhdGVnb3J5KG5hbWUpIGFzIENhdGVnb3J5PHN0cmluZywgSW5oaWJpdG9yPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhbiBpbmhpYml0b3IuXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkKHRoaW5nOiBzdHJpbmcgfCBJbmhpYml0b3IpOiBJbmhpYml0b3Ige1xuXHRcdHJldHVybiBzdXBlci5sb2FkKHRoaW5nKSBhcyBJbmhpYml0b3I7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIGluaGliaXRvcnMgZnJvbSB0aGUgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS4gRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWRBbGwoXG5cdFx0ZGlyZWN0b3J5Pzogc3RyaW5nLFxuXHRcdGZpbHRlcj86IExvYWRQcmVkaWNhdGVcblx0KTogSW5oaWJpdG9ySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWRBbGwoZGlyZWN0b3J5LCBmaWx0ZXIpIGFzIEluaGliaXRvckhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gaW5oaWJpdG9yIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlZ2lzdGVyKGluaGliaXRvcjogSW5oaWJpdG9yLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdHJldHVybiBzdXBlci5yZWdpc3RlcihpbmhpYml0b3IsIGZpbGVwYXRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFuIGluaGliaXRvci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGluaGliaXRvci5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoaWQ6IHN0cmluZyk6IEluaGliaXRvciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZChpZCkgYXMgSW5oaWJpdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIGluaGliaXRvcnMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkQWxsKCk6IEluaGliaXRvckhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWRBbGwoKSBhcyBJbmhpYml0b3JIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYW4gaW5oaWJpdG9yLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBJRCBvZiB0aGUgaW5oaWJpdG9yLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZShpZDogc3RyaW5nKTogSW5oaWJpdG9yIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBJbmhpYml0b3I7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgaW5oaWJpdG9ycy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmVBbGwoKTogSW5oaWJpdG9ySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIEluaGliaXRvckhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogVGVzdHMgaW5oaWJpdG9ycyBhZ2FpbnN0IHRoZSBtZXNzYWdlLlxuXHQgKiBSZXR1cm5zIHRoZSByZWFzb24gaWYgYmxvY2tlZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUeXBlIG9mIGluaGliaXRvciwgJ2FsbCcsICdwcmUnLCBvciAncG9zdCcuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byB0ZXN0LlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHRlc3QoXG5cdFx0dHlwZTogXCJhbGxcIiB8IFwicHJlXCIgfCBcInBvc3RcIixcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRjb21tYW5kPzogQ29tbWFuZFxuXHQpOiBQcm9taXNlPHN0cmluZyB8IG51bGwgfCB2b2lkPiB7XG5cdFx0aWYgKCF0aGlzLm1vZHVsZXMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRjb25zdCBpbmhpYml0b3JzID0gdGhpcy5tb2R1bGVzLmZpbHRlcihpID0+IGkudHlwZSA9PT0gdHlwZSk7XG5cdFx0aWYgKCFpbmhpYml0b3JzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblxuXHRcdGZvciAoY29uc3QgaW5oaWJpdG9yIG9mIGluaGliaXRvcnMudmFsdWVzKCkpIHtcblx0XHRcdHByb21pc2VzLnB1c2goXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdGxldCBpbmhpYml0ZWQgPSBpbmhpYml0b3IuZXhlYyhtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoaW5oaWJpdGVkKSkgaW5oaWJpdGVkID0gYXdhaXQgaW5oaWJpdGVkO1xuXHRcdFx0XHRcdGlmIChpbmhpYml0ZWQpIHJldHVybiBpbmhpYml0b3I7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5oaWJpdGVkSW5oaWJpdG9yczogSW5oaWJpdG9yW10gPSAoXG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcylcblx0XHQpLmZpbHRlcihyID0+IHIpO1xuXHRcdGlmICghaW5oaWJpdGVkSW5oaWJpdG9ycy5sZW5ndGgpIHJldHVybiBudWxsO1xuXG5cdFx0aW5oaWJpdGVkSW5oaWJpdG9ycy5zb3J0KChhLCBiKSA9PiBiLnByaW9yaXR5IC0gYS5wcmlvcml0eSk7XG5cdFx0cmV0dXJuIGluaGliaXRlZEluaGliaXRvcnNbMF0ucmVhc29uO1xuXHR9XG5cblx0cHVibGljIG92ZXJyaWRlIG9uPEsgZXh0ZW5kcyBrZXlvZiBJbmhpYml0b3JIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IEluaGliaXRvckhhbmRsZXJFdmVudHNbS10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==