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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXJIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9saXN0ZW5lcnMvTGlzdGVuZXJIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBQWlEO0FBR2pELHlFQUFpRDtBQUVqRCwyREFBbUM7QUFFbkMscUVBQXNGO0FBQ3RGLDBEQUFrQztBQUVsQzs7OztHQUlHO0FBQ0gsTUFBcUIsZUFBZ0IsU0FBUSx1QkFBYTtJQUN6RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxrQkFBUSxFQUN4QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEtBQ2UsRUFBRTtRQUU1QixJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxZQUFZLGtCQUFRLElBQUksYUFBYSxLQUFLLGtCQUFRLENBQUMsRUFBRTtZQUNqRixNQUFNLElBQUkscUJBQVcsQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLGtCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEY7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQXNCRDs7O09BR0c7SUFDSSxRQUFRLENBQW1DO0lBT2xEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxFQUFVO1FBQzdCLE1BQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxR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Y2VzQ29udGVudCI6WyJpbXBvcnQgeyBBd2FpdGVkLCBDb2xsZWN0aW9uIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IHsgTGlzdGVuZXJIYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uLy4uL3R5cGluZ3MvZXZlbnRzXCI7XG5pbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvSGFuZGxlciwgeyBBa2Fpcm9IYW5kbGVyT3B0aW9ucywgTG9hZFByZWRpY2F0ZSB9IGZyb20gXCIuLi9Ba2Fpcm9IYW5kbGVyXCI7XG5pbXBvcnQgTGlzdGVuZXIgZnJvbSBcIi4vTGlzdGVuZXJcIjtcblxuLyoqXG4gKiBMb2FkcyBsaXN0ZW5lcnMgYW5kIHJlZ2lzdGVycyB0aGVtIHdpdGggRXZlbnRFbWl0dGVycy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGlzdGVuZXJIYW5kbGVyIGV4dGVuZHMgQWthaXJvSGFuZGxlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gTGlzdGVuZXIsXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zID0ge31cblx0KSB7XG5cdFx0aWYgKCEoY2xhc3NUb0hhbmRsZS5wcm90b3R5cGUgaW5zdGFuY2VvZiBMaXN0ZW5lciB8fCBjbGFzc1RvSGFuZGxlID09PSBMaXN0ZW5lcikpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsIGNsYXNzVG9IYW5kbGUubmFtZSwgTGlzdGVuZXIubmFtZSk7XG5cdFx0fVxuXG5cdFx0c3VwZXIoY2xpZW50LCB7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9KTtcblxuXHRcdHRoaXMuZW1pdHRlcnMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXHRcdHRoaXMuZW1pdHRlcnMuc2V0KFwiY2xpZW50XCIsIHRoaXMuY2xpZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYXRlZ29yaWVzLCBtYXBwZWQgYnkgSUQgdG8gQ2F0ZWdvcnkuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBMaXN0ZW5lcj4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgTGlzdGVuZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50XG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogRGlyZWN0b3J5IHRvIGxpc3RlbmVycy5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGRpcmVjdG9yeTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBFdmVudEVtaXR0ZXJzIGZvciB1c2UsIG1hcHBlZCBieSBuYW1lIHRvIEV2ZW50RW1pdHRlci5cblx0ICogQnkgZGVmYXVsdCwgJ2NsaWVudCcgaXMgc2V0IHRvIHRoZSBnaXZlbiBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgZW1pdHRlcnM6IENvbGxlY3Rpb248c3RyaW5nLCBFdmVudEVtaXR0ZXI+O1xuXG5cdC8qKlxuXHQgKiBMaXN0ZW5lcnMgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gTGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgTGlzdGVuZXI+O1xuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbGlzdGVuZXIgdG8gdGhlIEV2ZW50RW1pdHRlci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIGFkZFRvRW1pdHRlcihpZDogc3RyaW5nKTogTGlzdGVuZXIge1xuXHRcdGNvbnN0IGxpc3RlbmVyOiBMaXN0ZW5lciA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSkhO1xuXHRcdGlmICghbGlzdGVuZXIpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdC8qKlxuXHRcdCAqIEB0eXBlIHtBa2Fpcm9IYW5kbGVyfVxuXHRcdCAqL1xuXHRcdGNvbnN0IGVtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IFV0aWwuaXNFdmVudEVtaXR0ZXIobGlzdGVuZXIuZW1pdHRlcilcblx0XHRcdD8gKGxpc3RlbmVyLmVtaXR0ZXIgYXMgRXZlbnRFbWl0dGVyKVxuXHRcdFx0OiB0aGlzLmVtaXR0ZXJzLmdldChsaXN0ZW5lci5lbWl0dGVyIGFzIHN0cmluZykhO1xuXHRcdGlmICghVXRpbC5pc0V2ZW50RW1pdHRlcihlbWl0dGVyKSkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9UWVBFXCIsIFwiZW1pdHRlclwiLCBcIkV2ZW50RW1pdHRlclwiLCB0cnVlKTtcblxuXHRcdGVtaXR0ZXJbbGlzdGVuZXIudHlwZSA/PyBcIm9uXCJdKGxpc3RlbmVyLmV2ZW50LCBsaXN0ZW5lci5leGVjKTtcblx0XHRyZXR1cm4gbGlzdGVuZXI7XG5cdH1cblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBtb2QgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGRlcmVnaXN0ZXIobGlzdGVuZXI6IExpc3RlbmVyKTogdm9pZCB7XG5cdFx0dGhpcy5yZW1vdmVGcm9tRW1pdHRlcihsaXN0ZW5lci5pZCk7XG5cdFx0c3VwZXIuZGVyZWdpc3RlcihsaXN0ZW5lcik7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjYXRlZ29yeSBieSBuYW1lLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGZpbmRDYXRlZ29yeShuYW1lOiBzdHJpbmcpOiBDYXRlZ29yeTxzdHJpbmcsIExpc3RlbmVyPiB7XG5cdFx0cmV0dXJuIHN1cGVyLmZpbmRDYXRlZ29yeShuYW1lKSBhcyBDYXRlZ29yeTxzdHJpbmcsIExpc3RlbmVyPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIG1vZHVsZSwgY2FuIGJlIGEgbW9kdWxlIGNsYXNzIG9yIGEgZmlsZXBhdGguXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBjbGFzcyBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICogQHBhcmFtIGlzUmVsb2FkIC0gV2hldGhlciB0aGlzIGlzIGEgcmVsb2FkIG9yIG5vdC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkKHRoaW5nOiBzdHJpbmcgfCBMaXN0ZW5lciwgaXNSZWxvYWQ/OiBib29sZWFuKTogUHJvbWlzZTxMaXN0ZW5lcj4ge1xuXHRcdHJldHVybiBzdXBlci5sb2FkKHRoaW5nLCBpc1JlbG9hZCkgYXMgUHJvbWlzZTxMaXN0ZW5lcj47XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIGxpc3RlbmVycyBmcm9tIHRoZSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZEFsbChkaXJlY3Rvcnk/OiBzdHJpbmcsIGZpbHRlcj86IExvYWRQcmVkaWNhdGUpOiBQcm9taXNlPExpc3RlbmVySGFuZGxlcj4ge1xuXHRcdHJldHVybiBzdXBlci5sb2FkQWxsKGRpcmVjdG9yeSwgZmlsdGVyKSBhcyBQcm9taXNlPExpc3RlbmVySGFuZGxlcj47XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVnaXN0ZXIobGlzdGVuZXI6IExpc3RlbmVyLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdHN1cGVyLnJlZ2lzdGVyKGxpc3RlbmVyLCBmaWxlcGF0aCk7XG5cdFx0bGlzdGVuZXIuZXhlYyA9IGxpc3RlbmVyLmV4ZWMuYmluZChsaXN0ZW5lcik7XG5cdFx0dGhpcy5hZGRUb0VtaXR0ZXIobGlzdGVuZXIuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSBsaXN0ZW5lci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZChpZDogc3RyaW5nKTogUHJvbWlzZTxMaXN0ZW5lcj4ge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoaWQpIGFzIFByb21pc2U8TGlzdGVuZXI+O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIGxpc3RlbmVycy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWRBbGwoKTogUHJvbWlzZTxMaXN0ZW5lckhhbmRsZXI+IHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkQWxsKCkgYXMgUHJvbWlzZTxMaXN0ZW5lckhhbmRsZXI+O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZShpZDogc3RyaW5nKTogTGlzdGVuZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmUoaWQpIGFzIExpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmVBbGwoKTogTGlzdGVuZXJIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlQWxsKCkgYXMgTGlzdGVuZXJIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lciBmcm9tIHRoZSBFdmVudEVtaXR0ZXIuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVGcm9tRW1pdHRlcihpZDogc3RyaW5nKTogTGlzdGVuZXIge1xuXHRcdGNvbnN0IGxpc3RlbmVyOiBMaXN0ZW5lciA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSkhO1xuXHRcdGlmICghbGlzdGVuZXIpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdGNvbnN0IGVtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IFV0aWwuaXNFdmVudEVtaXR0ZXIobGlzdGVuZXIuZW1pdHRlcilcblx0XHRcdD8gKGxpc3RlbmVyLmVtaXR0ZXIgYXMgRXZlbnRFbWl0dGVyKVxuXHRcdFx0OiB0aGlzLmVtaXR0ZXJzLmdldChsaXN0ZW5lci5lbWl0dGVyIGFzIHN0cmluZykhO1xuXHRcdGlmICghVXRpbC5pc0V2ZW50RW1pdHRlcihlbWl0dGVyKSkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9UWVBFXCIsIFwiZW1pdHRlclwiLCBcIkV2ZW50RW1pdHRlclwiLCB0cnVlKTtcblxuXHRcdGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIuZXZlbnQsIGxpc3RlbmVyLmV4ZWMpO1xuXHRcdHJldHVybiBsaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGN1c3RvbSBlbWl0dGVycy5cblx0ICogQHBhcmFtIGVtaXR0ZXJzIC0gRW1pdHRlcnMgdG8gdXNlLiBUaGUga2V5IGlzIHRoZSBuYW1lIGFuZCB2YWx1ZSBpcyB0aGUgZW1pdHRlci5cblx0ICovXG5cdHNldEVtaXR0ZXJzKGVtaXR0ZXJzOiBhbnkpOiBMaXN0ZW5lckhhbmRsZXIge1xuXHRcdGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGVtaXR0ZXJzKSkge1xuXHRcdFx0aWYgKCFVdGlsLmlzRXZlbnRFbWl0dGVyKHZhbHVlKSkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9UWVBFXCIsIGtleSwgXCJFdmVudEVtaXR0ZXJcIiwgdHJ1ZSk7XG5cdFx0XHR0aGlzLmVtaXR0ZXJzLnNldChrZXksIHZhbHVlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHB1YmxpYyBvdmVycmlkZSBvbjxLIGV4dGVuZHMga2V5b2YgTGlzdGVuZXJIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IExpc3RlbmVySGFuZGxlckV2ZW50c1tLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbihldmVudCwgbGlzdGVuZXIpO1xuXHR9XG5cdHB1YmxpYyBvdmVycmlkZSBvbmNlPEsgZXh0ZW5kcyBrZXlvZiBMaXN0ZW5lckhhbmRsZXJFdmVudHM+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogTGlzdGVuZXJIYW5kbGVyRXZlbnRzW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uY2UoZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxufVxuIl19