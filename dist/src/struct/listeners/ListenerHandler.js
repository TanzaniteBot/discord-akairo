"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const discord_js_1 = require("discord.js");
const Util_1 = __importDefault(require("../../util/Util"));
const Listener_1 = __importDefault(require("./Listener"));
/**
 * Loads listeners and registers them with EventEmitters.
 * @param client - The Akairo client.
 * @param options - Options.
 */
class ListenerHandler extends AkairoHandler_1.default {
    /**
     * EventEmitters for use, mapped by name to EventEmitter.
     * By default, 'client' is set to the given client.
     */
    emitters;
    constructor(client, { directory, classToHandle = Listener_1.default, extensions = [".js", ".ts"], automateCategories, loadFilter } = {}) {
        if (!(classToHandle.prototype instanceof Listener_1.default ||
            classToHandle === Listener_1.default)) {
            throw new AkairoError_1.default("INVALID_CLASS_TO_HANDLE", classToHandle.name, Listener_1.default.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });
        this.emitters = new discord_js_1.Collection();
        this.emitters.set("client", this.client);
    }
    /**
     * Adds a listener to the EventEmitter.
     * @param id - ID of the listener.
     */
    addToEmitter(id) {
        const listener = this.modules.get(id.toString());
        if (!listener)
            throw new AkairoError_1.default("MODULE_NOT_FOUND", this.classToHandle.name, id);
        /**
         * @type {AkairoHandler}
         */
        const emitter = Util_1.default.isEventEmitter(listener.emitter)
            ? listener.emitter
            : this.emitters.get(listener.emitter);
        if (!Util_1.default.isEventEmitter(emitter))
            throw new AkairoError_1.default("INVALID_TYPE", "emitter", "EventEmitter", true);
        if (listener.type === "once") {
            emitter.once(listener.event, listener.exec);
            return listener;
        }
        emitter.on(listener.event, listener.exec);
        return listener;
    }
    /**
     * Deregisters a module.
     * @param mod - Module to use.
     */
    deregister(listener) {
        this.removeFromEmitter(listener.id);
        super.deregister(listener);
    }
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name) {
        return super.findCategory(name);
    }
    /**
     * Loads a module, can be a module class or a filepath.
     * @param thing - Module class or path to module.
     * @param isReload - Whether this is a reload or not.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    load(thing, isReload) {
        return super.load(thing, isReload);
    }
    /**
     * Reads all listeners from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory, filter) {
        return super.loadAll(directory, filter);
    }
    /**
     * Registers a module.
     * @param listener - Module to use.
     * @param filepath - Filepath of module.
     */
    register(listener, filepath) {
        super.register(listener, filepath);
        listener.exec = listener.exec.bind(listener);
        this.addToEmitter(listener.id);
    }
    /**
     * Reloads a listener.
     * @param id - ID of the listener.
     */
    reload(id) {
        return super.reload(id);
    }
    /**
     * Reloads all listeners.
     */
    reloadAll() {
        return super.reloadAll();
    }
    /**
     * Removes a listener.
     * @param id - ID of the listener.
     */
    remove(id) {
        return super.remove(id);
    }
    /**
     * Removes all listeners.
     */
    removeAll() {
        return super.removeAll();
    }
    /**
     * Removes a listener from the EventEmitter.
     * @param id - ID of the listener.
     */
    removeFromEmitter(id) {
        const listener = this.modules.get(id.toString());
        if (!listener)
            throw new AkairoError_1.default("MODULE_NOT_FOUND", this.classToHandle.name, id);
        const emitter = Util_1.default.isEventEmitter(listener.emitter)
            ? listener.emitter
            : this.emitters.get(listener.emitter);
        if (!Util_1.default.isEventEmitter(emitter))
            throw new AkairoError_1.default("INVALID_TYPE", "emitter", "EventEmitter", true);
        emitter.removeListener(listener.event, listener.exec);
        return listener;
    }
    /**
     * Sets custom emitters.
     * @param emitters - Emitters to use. The key is the name and value is the emitter.
     */
    setEmitters(emitters) {
        for (const [key, value] of Object.entries(emitters)) {
            if (!Util_1.default.isEventEmitter(value))
                throw new AkairoError_1.default("INVALID_TYPE", key, "EventEmitter", true);
            this.emitters.set(key, value);
        }
        return this;
    }
    on(event, listener) {
        return super.on(event, listener);
    }
}
exports.default = ListenerHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXJIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9saXN0ZW5lcnMvTGlzdGVuZXJIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUVBQWlEO0FBQ2pELHFFQUcwQjtBQUMxQiwyQ0FBaUQ7QUFDakQsMkRBQW1DO0FBQ25DLDBEQUFrQztBQU1sQzs7OztHQUlHO0FBQ0gsTUFBcUIsZUFBZ0IsU0FBUSx1QkFBYTtJQXFCekQ7OztPQUdHO0lBQ0ksUUFBUSxDQUFtQztJQU9sRCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxrQkFBUSxFQUN4QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEtBQ2UsRUFBRTtRQUU1QixJQUNDLENBQUMsQ0FDQSxhQUFhLENBQUMsU0FBUyxZQUFZLGtCQUFRO1lBQzNDLGFBQWEsS0FBSyxrQkFBUSxDQUMxQixFQUNBO1lBQ0QsTUFBTSxJQUFJLHFCQUFXLENBQ3BCLHlCQUF5QixFQUN6QixhQUFhLENBQUMsSUFBSSxFQUNsQixrQkFBUSxDQUFDLElBQUksQ0FDYixDQUFDO1NBQ0Y7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxFQUFVO1FBQzdCLE1BQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxR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LENBQUM7Q0FDRDtBQXJORCxrQ0FxTkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7XG5cdEFrYWlyb0hhbmRsZXJPcHRpb25zLFxuXHRMb2FkUHJlZGljYXRlXG59IGZyb20gXCIuLi9Ba2Fpcm9IYW5kbGVyXCI7XG5pbXBvcnQgeyBBd2FpdGVkLCBDb2xsZWN0aW9uIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBVdGlsIGZyb20gXCIuLi8uLi91dGlsL1V0aWxcIjtcbmltcG9ydCBMaXN0ZW5lciBmcm9tIFwiLi9MaXN0ZW5lclwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcbmltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IHsgTGlzdGVuZXJIYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uLy4uL3R5cGluZ3MvZXZlbnRzXCI7XG5cbi8qKlxuICogTG9hZHMgbGlzdGVuZXJzIGFuZCByZWdpc3RlcnMgdGhlbSB3aXRoIEV2ZW50RW1pdHRlcnMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpc3RlbmVySGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgTGlzdGVuZXI+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xhc3NUb0hhbmRsZTogdHlwZW9mIExpc3RlbmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudFxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIERpcmVjdG9yeSB0byBsaXN0ZW5lcnMuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnRFbWl0dGVycyBmb3IgdXNlLCBtYXBwZWQgYnkgbmFtZSB0byBFdmVudEVtaXR0ZXIuXG5cdCAqIEJ5IGRlZmF1bHQsICdjbGllbnQnIGlzIHNldCB0byB0aGUgZ2l2ZW4gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGVtaXR0ZXJzOiBDb2xsZWN0aW9uPHN0cmluZywgRXZlbnRFbWl0dGVyPjtcblxuXHQvKipcblx0ICogTGlzdGVuZXJzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIExpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIExpc3RlbmVyPjtcblxuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IExpc3RlbmVyLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi50c1wiXSxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9OiBBa2Fpcm9IYW5kbGVyT3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdGlmIChcblx0XHRcdCEoXG5cdFx0XHRcdGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgTGlzdGVuZXIgfHxcblx0XHRcdFx0Y2xhc3NUb0hhbmRsZSA9PT0gTGlzdGVuZXJcblx0XHRcdClcblx0XHQpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcblx0XHRcdFx0XCJJTlZBTElEX0NMQVNTX1RPX0hBTkRMRVwiLFxuXHRcdFx0XHRjbGFzc1RvSGFuZGxlLm5hbWUsXG5cdFx0XHRcdExpc3RlbmVyLm5hbWVcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0c3VwZXIoY2xpZW50LCB7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9KTtcblxuXHRcdHRoaXMuZW1pdHRlcnMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXHRcdHRoaXMuZW1pdHRlcnMuc2V0KFwiY2xpZW50XCIsIHRoaXMuY2xpZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbGlzdGVuZXIgdG8gdGhlIEV2ZW50RW1pdHRlci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIGFkZFRvRW1pdHRlcihpZDogc3RyaW5nKTogTGlzdGVuZXIge1xuXHRcdGNvbnN0IGxpc3RlbmVyOiBMaXN0ZW5lciA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSk7XG5cdFx0aWYgKCFsaXN0ZW5lcilcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdC8qKlxuXHRcdCAqIEB0eXBlIHtBa2Fpcm9IYW5kbGVyfVxuXHRcdCAqL1xuXHRcdGNvbnN0IGVtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IFV0aWwuaXNFdmVudEVtaXR0ZXIobGlzdGVuZXIuZW1pdHRlcilcblx0XHRcdD8gKGxpc3RlbmVyLmVtaXR0ZXIgYXMgRXZlbnRFbWl0dGVyKVxuXHRcdFx0OiB0aGlzLmVtaXR0ZXJzLmdldChsaXN0ZW5lci5lbWl0dGVyIGFzIHN0cmluZyk7XG5cdFx0aWYgKCFVdGlsLmlzRXZlbnRFbWl0dGVyKGVtaXR0ZXIpKVxuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9UWVBFXCIsIFwiZW1pdHRlclwiLCBcIkV2ZW50RW1pdHRlclwiLCB0cnVlKTtcblxuXHRcdGlmIChsaXN0ZW5lci50eXBlID09PSBcIm9uY2VcIikge1xuXHRcdFx0ZW1pdHRlci5vbmNlKGxpc3RlbmVyLmV2ZW50LCBsaXN0ZW5lci5leGVjKTtcblx0XHRcdHJldHVybiBsaXN0ZW5lcjtcblx0XHR9XG5cblx0XHRlbWl0dGVyLm9uKGxpc3RlbmVyLmV2ZW50IGFzIGFueSwgbGlzdGVuZXIuZXhlYyk7XG5cdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbW9kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBkZXJlZ2lzdGVyKGxpc3RlbmVyOiBMaXN0ZW5lcik6IHZvaWQge1xuXHRcdHRoaXMucmVtb3ZlRnJvbUVtaXR0ZXIobGlzdGVuZXIuaWQpO1xuXHRcdHN1cGVyLmRlcmVnaXN0ZXIobGlzdGVuZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY2F0ZWdvcnkgYnkgbmFtZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBmaW5kQ2F0ZWdvcnkobmFtZTogc3RyaW5nKTogQ2F0ZWdvcnk8c3RyaW5nLCBMaXN0ZW5lcj4ge1xuXHRcdHJldHVybiBzdXBlci5maW5kQ2F0ZWdvcnkobmFtZSkgYXMgQ2F0ZWdvcnk8c3RyaW5nLCBMaXN0ZW5lcj47XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYSBtb2R1bGUsIGNhbiBiZSBhIG1vZHVsZSBjbGFzcyBvciBhIGZpbGVwYXRoLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBNb2R1bGUgY2xhc3Mgb3IgcGF0aCB0byBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpc1JlbG9hZCAtIFdoZXRoZXIgdGhpcyBpcyBhIHJlbG9hZCBvciBub3QuXG5cdCAqL1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10eXBlc1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZCh0aGluZzogc3RyaW5nIHwgRnVuY3Rpb24sIGlzUmVsb2FkPzogYm9vbGVhbik6IExpc3RlbmVyIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZywgaXNSZWxvYWQpIGFzIExpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBsaXN0ZW5lcnMgZnJvbSB0aGUgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS4gRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWRBbGwoXG5cdFx0ZGlyZWN0b3J5Pzogc3RyaW5nLFxuXHRcdGZpbHRlcj86IExvYWRQcmVkaWNhdGVcblx0KTogTGlzdGVuZXJIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZEFsbChkaXJlY3RvcnksIGZpbHRlcikgYXMgTGlzdGVuZXJIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGxpc3RlbmVyIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlZ2lzdGVyKGxpc3RlbmVyOiBMaXN0ZW5lciwgZmlsZXBhdGg6IHN0cmluZyk6IHZvaWQge1xuXHRcdHN1cGVyLnJlZ2lzdGVyKGxpc3RlbmVyLCBmaWxlcGF0aCk7XG5cdFx0bGlzdGVuZXIuZXhlYyA9IGxpc3RlbmVyLmV4ZWMuYmluZChsaXN0ZW5lcik7XG5cdFx0dGhpcy5hZGRUb0VtaXR0ZXIobGlzdGVuZXIuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSBsaXN0ZW5lci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZChpZDogc3RyaW5nKTogTGlzdGVuZXIge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoaWQpIGFzIExpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIGxpc3RlbmVycy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWRBbGwoKTogTGlzdGVuZXJIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkQWxsKCkgYXMgTGlzdGVuZXJIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZShpZDogc3RyaW5nKTogTGlzdGVuZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmUoaWQpIGFzIExpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmVBbGwoKTogTGlzdGVuZXJIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlQWxsKCkgYXMgTGlzdGVuZXJIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lciBmcm9tIHRoZSBFdmVudEVtaXR0ZXIuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVGcm9tRW1pdHRlcihpZDogc3RyaW5nKTogTGlzdGVuZXIge1xuXHRcdGNvbnN0IGxpc3RlbmVyOiBMaXN0ZW5lciA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSk7XG5cdFx0aWYgKCFsaXN0ZW5lcilcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdGNvbnN0IGVtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IFV0aWwuaXNFdmVudEVtaXR0ZXIobGlzdGVuZXIuZW1pdHRlcilcblx0XHRcdD8gKGxpc3RlbmVyLmVtaXR0ZXIgYXMgRXZlbnRFbWl0dGVyKVxuXHRcdFx0OiB0aGlzLmVtaXR0ZXJzLmdldChsaXN0ZW5lci5lbWl0dGVyIGFzIHN0cmluZyk7XG5cdFx0aWYgKCFVdGlsLmlzRXZlbnRFbWl0dGVyKGVtaXR0ZXIpKVxuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9UWVBFXCIsIFwiZW1pdHRlclwiLCBcIkV2ZW50RW1pdHRlclwiLCB0cnVlKTtcblxuXHRcdGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIuZXZlbnQsIGxpc3RlbmVyLmV4ZWMpO1xuXHRcdHJldHVybiBsaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGN1c3RvbSBlbWl0dGVycy5cblx0ICogQHBhcmFtIGVtaXR0ZXJzIC0gRW1pdHRlcnMgdG8gdXNlLiBUaGUga2V5IGlzIHRoZSBuYW1lIGFuZCB2YWx1ZSBpcyB0aGUgZW1pdHRlci5cblx0ICovXG5cdHNldEVtaXR0ZXJzKGVtaXR0ZXJzOiBhbnkpOiBMaXN0ZW5lckhhbmRsZXIge1xuXHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGVtaXR0ZXJzKSkge1xuXHRcdFx0aWYgKCFVdGlsLmlzRXZlbnRFbWl0dGVyKHZhbHVlKSlcblx0XHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9UWVBFXCIsIGtleSwgXCJFdmVudEVtaXR0ZXJcIiwgdHJ1ZSk7XG5cdFx0XHR0aGlzLmVtaXR0ZXJzLnNldChrZXksIHZhbHVlIGFzICBhbnkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cHVibGljIG92ZXJyaWRlIG9uPEsgZXh0ZW5kcyBrZXlvZiBMaXN0ZW5lckhhbmRsZXJFdmVudHM+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogTGlzdGVuZXJIYW5kbGVyRXZlbnRzW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==