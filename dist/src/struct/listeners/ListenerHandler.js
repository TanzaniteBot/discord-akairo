"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const Util_1 = __importDefault(require("../../util/Util"));
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const Listener_1 = __importDefault(require("./Listener"));
/**
 * Loads listeners and registers them with EventEmitters.
 * @param client - The Akairo client.
 * @param options - Options.
 */
class ListenerHandler extends AkairoHandler_1.default {
    constructor(client, { directory, classToHandle = Listener_1.default, extensions = [".js", ".ts"], automateCategories, loadFilter } = {}) {
        if (!(classToHandle.prototype instanceof Listener_1.default || classToHandle === Listener_1.default)) {
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
     * EventEmitters for use, mapped by name to EventEmitter.
     * By default, 'client' is set to the given client.
     */
    emitters;
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
        emitter[listener.type ?? "on"](listener.event, listener.exec);
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
    once(event, listener) {
        return super.once(event, listener);
    }
}
exports.default = ListenerHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXJIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9saXN0ZW5lcnMvTGlzdGVuZXJIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBQWlEO0FBR2pELHlFQUFpRDtBQUVqRCwyREFBbUM7QUFFbkMscUVBQXNGO0FBQ3RGLDBEQUFrQztBQUVsQzs7OztHQUlHO0FBQ0gsTUFBcUIsZUFBZ0IsU0FBUSx1QkFBYTtJQUN6RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxrQkFBUSxFQUN4QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEtBQ2UsRUFBRTtRQUU1QixJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxZQUFZLGtCQUFRLElBQUksYUFBYSxLQUFLLGtCQUFRLENBQUMsRUFBRTtZQUNqRixNQUFNLElBQUkscUJBQVcsQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLGtCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEY7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQXNCRDs7O09BR0c7SUFDSSxRQUFRLENBQW1DO0lBT2xEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxFQUFVO1FBQzdCLE1BQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxR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c0NvbnRlbnQiOlsiaW1wb3J0IHsgQXdhaXRlZCwgQ29sbGVjdGlvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcbmltcG9ydCB7IExpc3RlbmVySGFuZGxlckV2ZW50cyB9IGZyb20gXCIuLi8uLi90eXBpbmdzL2V2ZW50c1wiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uLy4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCBVdGlsIGZyb20gXCIuLi8uLi91dGlsL1V0aWxcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIsIHsgQWthaXJvSGFuZGxlck9wdGlvbnMsIExvYWRQcmVkaWNhdGUgfSBmcm9tIFwiLi4vQWthaXJvSGFuZGxlclwiO1xuaW1wb3J0IExpc3RlbmVyIGZyb20gXCIuL0xpc3RlbmVyXCI7XG5cbi8qKlxuICogTG9hZHMgbGlzdGVuZXJzIGFuZCByZWdpc3RlcnMgdGhlbSB3aXRoIEV2ZW50RW1pdHRlcnMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpc3RlbmVySGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IExpc3RlbmVyLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi50c1wiXSxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9OiBBa2Fpcm9IYW5kbGVyT3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdGlmICghKGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgTGlzdGVuZXIgfHwgY2xhc3NUb0hhbmRsZSA9PT0gTGlzdGVuZXIpKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX0NMQVNTX1RPX0hBTkRMRVwiLCBjbGFzc1RvSGFuZGxlLm5hbWUsIExpc3RlbmVyLm5hbWUpO1xuXHRcdH1cblxuXHRcdHN1cGVyKGNsaWVudCwge1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSxcblx0XHRcdGV4dGVuc2lvbnMsXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fSk7XG5cblx0XHR0aGlzLmVtaXR0ZXJzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHR0aGlzLmVtaXR0ZXJzLnNldChcImNsaWVudFwiLCB0aGlzLmNsaWVudCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgTGlzdGVuZXI+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xhc3NUb0hhbmRsZTogdHlwZW9mIExpc3RlbmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudFxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIERpcmVjdG9yeSB0byBsaXN0ZW5lcnMuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnRFbWl0dGVycyBmb3IgdXNlLCBtYXBwZWQgYnkgbmFtZSB0byBFdmVudEVtaXR0ZXIuXG5cdCAqIEJ5IGRlZmF1bHQsICdjbGllbnQnIGlzIHNldCB0byB0aGUgZ2l2ZW4gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGVtaXR0ZXJzOiBDb2xsZWN0aW9uPHN0cmluZywgRXZlbnRFbWl0dGVyPjtcblxuXHQvKipcblx0ICogTGlzdGVuZXJzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIExpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIExpc3RlbmVyPjtcblxuXHQvKipcblx0ICogQWRkcyBhIGxpc3RlbmVyIHRvIHRoZSBFdmVudEVtaXR0ZXIuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyBhZGRUb0VtaXR0ZXIoaWQ6IHN0cmluZyk6IExpc3RlbmVyIHtcblx0XHRjb25zdCBsaXN0ZW5lcjogTGlzdGVuZXIgPSB0aGlzLm1vZHVsZXMuZ2V0KGlkLnRvU3RyaW5nKCkpITtcblx0XHRpZiAoIWxpc3RlbmVyKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJNT0RVTEVfTk9UX0ZPVU5EXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHQvKipcblx0XHQgKiBAdHlwZSB7QWthaXJvSGFuZGxlcn1cblx0XHQgKi9cblx0XHRjb25zdCBlbWl0dGVyOiBFdmVudEVtaXR0ZXIgPSBVdGlsLmlzRXZlbnRFbWl0dGVyKGxpc3RlbmVyLmVtaXR0ZXIpXG5cdFx0XHQ/IChsaXN0ZW5lci5lbWl0dGVyIGFzIEV2ZW50RW1pdHRlcilcblx0XHRcdDogdGhpcy5lbWl0dGVycy5nZXQobGlzdGVuZXIuZW1pdHRlciBhcyBzdHJpbmcpITtcblx0XHRpZiAoIVV0aWwuaXNFdmVudEVtaXR0ZXIoZW1pdHRlcikpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfVFlQRVwiLCBcImVtaXR0ZXJcIiwgXCJFdmVudEVtaXR0ZXJcIiwgdHJ1ZSk7XG5cblx0XHRlbWl0dGVyW2xpc3RlbmVyLnR5cGUgPz8gXCJvblwiXShsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIuZXhlYyk7XG5cdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbW9kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBkZXJlZ2lzdGVyKGxpc3RlbmVyOiBMaXN0ZW5lcik6IHZvaWQge1xuXHRcdHRoaXMucmVtb3ZlRnJvbUVtaXR0ZXIobGlzdGVuZXIuaWQpO1xuXHRcdHN1cGVyLmRlcmVnaXN0ZXIobGlzdGVuZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY2F0ZWdvcnkgYnkgbmFtZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBmaW5kQ2F0ZWdvcnkobmFtZTogc3RyaW5nKTogQ2F0ZWdvcnk8c3RyaW5nLCBMaXN0ZW5lcj4ge1xuXHRcdHJldHVybiBzdXBlci5maW5kQ2F0ZWdvcnkobmFtZSkgYXMgQ2F0ZWdvcnk8c3RyaW5nLCBMaXN0ZW5lcj47XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYSBtb2R1bGUsIGNhbiBiZSBhIG1vZHVsZSBjbGFzcyBvciBhIGZpbGVwYXRoLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBNb2R1bGUgY2xhc3Mgb3IgcGF0aCB0byBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpc1JlbG9hZCAtIFdoZXRoZXIgdGhpcyBpcyBhIHJlbG9hZCBvciBub3QuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZCh0aGluZzogc3RyaW5nIHwgTGlzdGVuZXIsIGlzUmVsb2FkPzogYm9vbGVhbik6IExpc3RlbmVyIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZywgaXNSZWxvYWQpIGFzIExpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBsaXN0ZW5lcnMgZnJvbSB0aGUgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS4gRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWRBbGwoZGlyZWN0b3J5Pzogc3RyaW5nLCBmaWx0ZXI/OiBMb2FkUHJlZGljYXRlKTogTGlzdGVuZXJIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZEFsbChkaXJlY3RvcnksIGZpbHRlcikgYXMgTGlzdGVuZXJIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGxpc3RlbmVyIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlZ2lzdGVyKGxpc3RlbmVyOiBMaXN0ZW5lciwgZmlsZXBhdGg/OiBzdHJpbmcpOiB2b2lkIHtcblx0XHRzdXBlci5yZWdpc3RlcihsaXN0ZW5lciwgZmlsZXBhdGgpO1xuXHRcdGxpc3RlbmVyLmV4ZWMgPSBsaXN0ZW5lci5leGVjLmJpbmQobGlzdGVuZXIpO1xuXHRcdHRoaXMuYWRkVG9FbWl0dGVyKGxpc3RlbmVyLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGEgbGlzdGVuZXIuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoaWQ6IHN0cmluZyk6IExpc3RlbmVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkKGlkKSBhcyBMaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBsaXN0ZW5lcnMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkQWxsKCk6IExpc3RlbmVySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZEFsbCgpIGFzIExpc3RlbmVySGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbGlzdGVuZXIuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmUoaWQ6IHN0cmluZyk6IExpc3RlbmVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBMaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBsaXN0ZW5lcnMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlQWxsKCk6IExpc3RlbmVySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIExpc3RlbmVySGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnJvbSB0aGUgRXZlbnRFbWl0dGVyLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlRnJvbUVtaXR0ZXIoaWQ6IHN0cmluZyk6IExpc3RlbmVyIHtcblx0XHRjb25zdCBsaXN0ZW5lcjogTGlzdGVuZXIgPSB0aGlzLm1vZHVsZXMuZ2V0KGlkLnRvU3RyaW5nKCkpITtcblx0XHRpZiAoIWxpc3RlbmVyKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJNT0RVTEVfTk9UX0ZPVU5EXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHRjb25zdCBlbWl0dGVyOiBFdmVudEVtaXR0ZXIgPSBVdGlsLmlzRXZlbnRFbWl0dGVyKGxpc3RlbmVyLmVtaXR0ZXIpXG5cdFx0XHQ/IChsaXN0ZW5lci5lbWl0dGVyIGFzIEV2ZW50RW1pdHRlcilcblx0XHRcdDogdGhpcy5lbWl0dGVycy5nZXQobGlzdGVuZXIuZW1pdHRlciBhcyBzdHJpbmcpITtcblx0XHRpZiAoIVV0aWwuaXNFdmVudEVtaXR0ZXIoZW1pdHRlcikpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfVFlQRVwiLCBcImVtaXR0ZXJcIiwgXCJFdmVudEVtaXR0ZXJcIiwgdHJ1ZSk7XG5cblx0XHRlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyLmV2ZW50LCBsaXN0ZW5lci5leGVjKTtcblx0XHRyZXR1cm4gbGlzdGVuZXI7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBjdXN0b20gZW1pdHRlcnMuXG5cdCAqIEBwYXJhbSBlbWl0dGVycyAtIEVtaXR0ZXJzIHRvIHVzZS4gVGhlIGtleSBpcyB0aGUgbmFtZSBhbmQgdmFsdWUgaXMgdGhlIGVtaXR0ZXIuXG5cdCAqL1xuXHRzZXRFbWl0dGVycyhlbWl0dGVyczogYW55KTogTGlzdGVuZXJIYW5kbGVyIHtcblx0XHRmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhlbWl0dGVycykpIHtcblx0XHRcdGlmICghVXRpbC5pc0V2ZW50RW1pdHRlcih2YWx1ZSkpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfVFlQRVwiLCBrZXksIFwiRXZlbnRFbWl0dGVyXCIsIHRydWUpO1xuXHRcdFx0dGhpcy5lbWl0dGVycy5zZXQoa2V5LCB2YWx1ZSBhcyBhbnkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cHVibGljIG92ZXJyaWRlIG9uPEsgZXh0ZW5kcyBrZXlvZiBMaXN0ZW5lckhhbmRsZXJFdmVudHM+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogTGlzdGVuZXJIYW5kbGVyRXZlbnRzW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cblx0cHVibGljIG92ZXJyaWRlIG9uY2U8SyBleHRlbmRzIGtleW9mIExpc3RlbmVySGFuZGxlckV2ZW50cz4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBMaXN0ZW5lckhhbmRsZXJFdmVudHNbS11bXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub25jZShldmVudCwgbGlzdGVuZXIpO1xuXHR9XG59XG4iXX0=