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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXJIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9saXN0ZW5lcnMvTGlzdGVuZXJIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBQWlEO0FBR2pELHlFQUFpRDtBQUVqRCwyREFBbUM7QUFFbkMscUVBQXNGO0FBQ3RGLDBEQUFrQztBQUVsQzs7OztHQUlHO0FBQ0gsTUFBcUIsZUFBZ0IsU0FBUSx1QkFBYTtJQUN6RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxrQkFBUSxFQUN4QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEtBQ2UsRUFBRTtRQUU1QixJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxZQUFZLGtCQUFRLElBQUksYUFBYSxLQUFLLGtCQUFRLENBQUMsRUFBRTtZQUNqRixNQUFNLElBQUkscUJBQVcsQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLGtCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEY7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQXNCRDs7O09BR0c7SUFDSSxRQUFRLENBQW1DO0lBT2xEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxFQUFVO1FBQzdCLE1BQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxR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c0NvbnRlbnQiOlsiaW1wb3J0IHsgQXdhaXRlZCwgQ29sbGVjdGlvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcbmltcG9ydCB7IExpc3RlbmVySGFuZGxlckV2ZW50cyB9IGZyb20gXCIuLi8uLi90eXBpbmdzL2V2ZW50c1wiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uLy4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCBVdGlsIGZyb20gXCIuLi8uLi91dGlsL1V0aWxcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIsIHsgQWthaXJvSGFuZGxlck9wdGlvbnMsIExvYWRQcmVkaWNhdGUgfSBmcm9tIFwiLi4vQWthaXJvSGFuZGxlclwiO1xuaW1wb3J0IExpc3RlbmVyIGZyb20gXCIuL0xpc3RlbmVyXCI7XG5cbi8qKlxuICogTG9hZHMgbGlzdGVuZXJzIGFuZCByZWdpc3RlcnMgdGhlbSB3aXRoIEV2ZW50RW1pdHRlcnMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExpc3RlbmVySGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IExpc3RlbmVyLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi50c1wiXSxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9OiBBa2Fpcm9IYW5kbGVyT3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdGlmICghKGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgTGlzdGVuZXIgfHwgY2xhc3NUb0hhbmRsZSA9PT0gTGlzdGVuZXIpKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX0NMQVNTX1RPX0hBTkRMRVwiLCBjbGFzc1RvSGFuZGxlLm5hbWUsIExpc3RlbmVyLm5hbWUpO1xuXHRcdH1cblxuXHRcdHN1cGVyKGNsaWVudCwge1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSxcblx0XHRcdGV4dGVuc2lvbnMsXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fSk7XG5cblx0XHR0aGlzLmVtaXR0ZXJzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHR0aGlzLmVtaXR0ZXJzLnNldChcImNsaWVudFwiLCB0aGlzLmNsaWVudCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgTGlzdGVuZXI+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xhc3NUb0hhbmRsZTogdHlwZW9mIExpc3RlbmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudFxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIERpcmVjdG9yeSB0byBsaXN0ZW5lcnMuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnRFbWl0dGVycyBmb3IgdXNlLCBtYXBwZWQgYnkgbmFtZSB0byBFdmVudEVtaXR0ZXIuXG5cdCAqIEJ5IGRlZmF1bHQsICdjbGllbnQnIGlzIHNldCB0byB0aGUgZ2l2ZW4gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGVtaXR0ZXJzOiBDb2xsZWN0aW9uPHN0cmluZywgRXZlbnRFbWl0dGVyPjtcblxuXHQvKipcblx0ICogTGlzdGVuZXJzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIExpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIExpc3RlbmVyPjtcblxuXHQvKipcblx0ICogQWRkcyBhIGxpc3RlbmVyIHRvIHRoZSBFdmVudEVtaXR0ZXIuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyBhZGRUb0VtaXR0ZXIoaWQ6IHN0cmluZyk6IExpc3RlbmVyIHtcblx0XHRjb25zdCBsaXN0ZW5lcjogTGlzdGVuZXIgPSB0aGlzLm1vZHVsZXMuZ2V0KGlkLnRvU3RyaW5nKCkpO1xuXHRcdGlmICghbGlzdGVuZXIpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdC8qKlxuXHRcdCAqIEB0eXBlIHtBa2Fpcm9IYW5kbGVyfVxuXHRcdCAqL1xuXHRcdGNvbnN0IGVtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IFV0aWwuaXNFdmVudEVtaXR0ZXIobGlzdGVuZXIuZW1pdHRlcilcblx0XHRcdD8gKGxpc3RlbmVyLmVtaXR0ZXIgYXMgRXZlbnRFbWl0dGVyKVxuXHRcdFx0OiB0aGlzLmVtaXR0ZXJzLmdldChsaXN0ZW5lci5lbWl0dGVyIGFzIHN0cmluZyk7XG5cdFx0aWYgKCFVdGlsLmlzRXZlbnRFbWl0dGVyKGVtaXR0ZXIpKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX1RZUEVcIiwgXCJlbWl0dGVyXCIsIFwiRXZlbnRFbWl0dGVyXCIsIHRydWUpO1xuXG5cdFx0ZW1pdHRlcltsaXN0ZW5lci50eXBlID8/IFwib25cIl0obGlzdGVuZXIuZXZlbnQsIGxpc3RlbmVyLmV4ZWMpO1xuXHRcdHJldHVybiBsaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIG1vZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZGVyZWdpc3RlcihsaXN0ZW5lcjogTGlzdGVuZXIpOiB2b2lkIHtcblx0XHR0aGlzLnJlbW92ZUZyb21FbWl0dGVyKGxpc3RlbmVyLmlkKTtcblx0XHRzdXBlci5kZXJlZ2lzdGVyKGxpc3RlbmVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNhdGVnb3J5IGJ5IG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZmluZENhdGVnb3J5KG5hbWU6IHN0cmluZyk6IENhdGVnb3J5PHN0cmluZywgTGlzdGVuZXI+IHtcblx0XHRyZXR1cm4gc3VwZXIuZmluZENhdGVnb3J5KG5hbWUpIGFzIENhdGVnb3J5PHN0cmluZywgTGlzdGVuZXI+O1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGEgbW9kdWxlLCBjYW4gYmUgYSBtb2R1bGUgY2xhc3Mgb3IgYSBmaWxlcGF0aC5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIGNsYXNzIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKiBAcGFyYW0gaXNSZWxvYWQgLSBXaGV0aGVyIHRoaXMgaXMgYSByZWxvYWQgb3Igbm90LlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWQodGhpbmc6IHN0cmluZyB8IExpc3RlbmVyLCBpc1JlbG9hZD86IGJvb2xlYW4pOiBMaXN0ZW5lciB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWQodGhpbmcsIGlzUmVsb2FkKSBhcyBMaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgbGlzdGVuZXJzIGZyb20gdGhlIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkQWxsKGRpcmVjdG9yeT86IHN0cmluZywgZmlsdGVyPzogTG9hZFByZWRpY2F0ZSk6IExpc3RlbmVySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWRBbGwoZGlyZWN0b3J5LCBmaWx0ZXIpIGFzIExpc3RlbmVySGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWdpc3RlcihsaXN0ZW5lcjogTGlzdGVuZXIsIGZpbGVwYXRoPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0c3VwZXIucmVnaXN0ZXIobGlzdGVuZXIsIGZpbGVwYXRoKTtcblx0XHRsaXN0ZW5lci5leGVjID0gbGlzdGVuZXIuZXhlYy5iaW5kKGxpc3RlbmVyKTtcblx0XHR0aGlzLmFkZFRvRW1pdHRlcihsaXN0ZW5lci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIGxpc3RlbmVyLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkKGlkOiBzdHJpbmcpOiBMaXN0ZW5lciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZChpZCkgYXMgTGlzdGVuZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgbGlzdGVuZXJzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZEFsbCgpOiBMaXN0ZW5lckhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWRBbGwoKSBhcyBMaXN0ZW5lckhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGxpc3RlbmVyLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBMaXN0ZW5lciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZShpZCkgYXMgTGlzdGVuZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgbGlzdGVuZXJzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBMaXN0ZW5lckhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmVBbGwoKSBhcyBMaXN0ZW5lckhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGxpc3RlbmVyIGZyb20gdGhlIEV2ZW50RW1pdHRlci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZUZyb21FbWl0dGVyKGlkOiBzdHJpbmcpOiBMaXN0ZW5lciB7XG5cdFx0Y29uc3QgbGlzdGVuZXI6IExpc3RlbmVyID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIWxpc3RlbmVyKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJNT0RVTEVfTk9UX0ZPVU5EXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHRjb25zdCBlbWl0dGVyOiBFdmVudEVtaXR0ZXIgPSBVdGlsLmlzRXZlbnRFbWl0dGVyKGxpc3RlbmVyLmVtaXR0ZXIpXG5cdFx0XHQ/IChsaXN0ZW5lci5lbWl0dGVyIGFzIEV2ZW50RW1pdHRlcilcblx0XHRcdDogdGhpcy5lbWl0dGVycy5nZXQobGlzdGVuZXIuZW1pdHRlciBhcyBzdHJpbmcpO1xuXHRcdGlmICghVXRpbC5pc0V2ZW50RW1pdHRlcihlbWl0dGVyKSkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9UWVBFXCIsIFwiZW1pdHRlclwiLCBcIkV2ZW50RW1pdHRlclwiLCB0cnVlKTtcblxuXHRcdGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIuZXZlbnQsIGxpc3RlbmVyLmV4ZWMpO1xuXHRcdHJldHVybiBsaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGN1c3RvbSBlbWl0dGVycy5cblx0ICogQHBhcmFtIGVtaXR0ZXJzIC0gRW1pdHRlcnMgdG8gdXNlLiBUaGUga2V5IGlzIHRoZSBuYW1lIGFuZCB2YWx1ZSBpcyB0aGUgZW1pdHRlci5cblx0ICovXG5cdHNldEVtaXR0ZXJzKGVtaXR0ZXJzOiBhbnkpOiBMaXN0ZW5lckhhbmRsZXIge1xuXHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGVtaXR0ZXJzKSkge1xuXHRcdFx0aWYgKCFVdGlsLmlzRXZlbnRFbWl0dGVyKHZhbHVlKSkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9UWVBFXCIsIGtleSwgXCJFdmVudEVtaXR0ZXJcIiwgdHJ1ZSk7XG5cdFx0XHR0aGlzLmVtaXR0ZXJzLnNldChrZXksIHZhbHVlIGFzIGFueSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRwdWJsaWMgb3ZlcnJpZGUgb248SyBleHRlbmRzIGtleW9mIExpc3RlbmVySGFuZGxlckV2ZW50cz4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBMaXN0ZW5lckhhbmRsZXJFdmVudHNbS11bXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub24oZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxuXHRwdWJsaWMgb3ZlcnJpZGUgb25jZTxLIGV4dGVuZHMga2V5b2YgTGlzdGVuZXJIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IExpc3RlbmVySGFuZGxlckV2ZW50c1tLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbmNlKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==