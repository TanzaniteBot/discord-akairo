"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXJIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9saXN0ZW5lcnMvTGlzdGVuZXJIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUVBQWlEO0FBQ2pELHFFQUcwQjtBQUMxQiwyQ0FBaUQ7QUFDakQsMkRBQW1DO0FBQ25DLDBEQUFrQztBQU1sQzs7OztHQUlHO0FBQ0gsTUFBcUIsZUFBZ0IsU0FBUSx1QkFBYTtJQUN6RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxrQkFBUSxFQUN4QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEtBQ2UsRUFBRTtRQUU1QixJQUNDLENBQUMsQ0FDQSxhQUFhLENBQUMsU0FBUyxZQUFZLGtCQUFRO1lBQzNDLGFBQWEsS0FBSyxrQkFBUSxDQUMxQixFQUNBO1lBQ0QsTUFBTSxJQUFJLHFCQUFXLENBQ3BCLHlCQUF5QixFQUN6QixhQUFhLENBQUMsSUFBSSxFQUNsQixrQkFBUSxDQUFDLElBQUksQ0FDYixDQUFDO1NBQ0Y7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQXNCRDs7O09BR0c7SUFDSSxRQUFRLENBQW1DO0lBT2xEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxFQUFVO1FBQzdCLE1BQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FB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O0FBcE5ELGtDQW9OQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIsIHtcblx0QWthaXJvSGFuZGxlck9wdGlvbnMsXG5cdExvYWRQcmVkaWNhdGVcbn0gZnJvbSBcIi4uL0FrYWlyb0hhbmRsZXJcIjtcbmltcG9ydCB7IEF3YWl0ZWQsIENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IExpc3RlbmVyIGZyb20gXCIuL0xpc3RlbmVyXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgeyBMaXN0ZW5lckhhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdHlwaW5ncy9ldmVudHNcIjtcblxuLyoqXG4gKiBMb2FkcyBsaXN0ZW5lcnMgYW5kIHJlZ2lzdGVycyB0aGVtIHdpdGggRXZlbnRFbWl0dGVycy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGlzdGVuZXJIYW5kbGVyIGV4dGVuZHMgQWthaXJvSGFuZGxlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gTGlzdGVuZXIsXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zID0ge31cblx0KSB7XG5cdFx0aWYgKFxuXHRcdFx0IShcblx0XHRcdFx0Y2xhc3NUb0hhbmRsZS5wcm90b3R5cGUgaW5zdGFuY2VvZiBMaXN0ZW5lciB8fFxuXHRcdFx0XHRjbGFzc1RvSGFuZGxlID09PSBMaXN0ZW5lclxuXHRcdFx0KVxuXHRcdCkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFxuXHRcdFx0XHRcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsXG5cdFx0XHRcdGNsYXNzVG9IYW5kbGUubmFtZSxcblx0XHRcdFx0TGlzdGVuZXIubmFtZVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRzdXBlcihjbGllbnQsIHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUsXG5cdFx0XHRleHRlbnNpb25zLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH0pO1xuXG5cdFx0dGhpcy5lbWl0dGVycyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdFx0dGhpcy5lbWl0dGVycy5zZXQoXCJjbGllbnRcIiwgdGhpcy5jbGllbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNhdGVnb3JpZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDYXRlZ29yeTxzdHJpbmcsIExpc3RlbmVyPj47XG5cblx0LyoqXG5cdCAqIENsYXNzIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBMaXN0ZW5lcjtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnRcblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBEaXJlY3RvcnkgdG8gbGlzdGVuZXJzLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50RW1pdHRlcnMgZm9yIHVzZSwgbWFwcGVkIGJ5IG5hbWUgdG8gRXZlbnRFbWl0dGVyLlxuXHQgKiBCeSBkZWZhdWx0LCAnY2xpZW50JyBpcyBzZXQgdG8gdGhlIGdpdmVuIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBlbWl0dGVyczogQ29sbGVjdGlvbjxzdHJpbmcsIEV2ZW50RW1pdHRlcj47XG5cblx0LyoqXG5cdCAqIExpc3RlbmVycyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byBMaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIG1vZHVsZXM6IENvbGxlY3Rpb248c3RyaW5nLCBMaXN0ZW5lcj47XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBsaXN0ZW5lciB0byB0aGUgRXZlbnRFbWl0dGVyLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgYWRkVG9FbWl0dGVyKGlkOiBzdHJpbmcpOiBMaXN0ZW5lciB7XG5cdFx0Y29uc3QgbGlzdGVuZXI6IExpc3RlbmVyID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIWxpc3RlbmVyKVxuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTU9EVUxFX05PVF9GT1VORFwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgaWQpO1xuXG5cdFx0LyoqXG5cdFx0ICogQHR5cGUge0FrYWlyb0hhbmRsZXJ9XG5cdFx0ICovXG5cdFx0Y29uc3QgZW1pdHRlcjogRXZlbnRFbWl0dGVyID0gVXRpbC5pc0V2ZW50RW1pdHRlcihsaXN0ZW5lci5lbWl0dGVyKVxuXHRcdFx0PyAobGlzdGVuZXIuZW1pdHRlciBhcyBFdmVudEVtaXR0ZXIpXG5cdFx0XHQ6IHRoaXMuZW1pdHRlcnMuZ2V0KGxpc3RlbmVyLmVtaXR0ZXIgYXMgc3RyaW5nKTtcblx0XHRpZiAoIVV0aWwuaXNFdmVudEVtaXR0ZXIoZW1pdHRlcikpXG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX1RZUEVcIiwgXCJlbWl0dGVyXCIsIFwiRXZlbnRFbWl0dGVyXCIsIHRydWUpO1xuXG5cdFx0aWYgKGxpc3RlbmVyLnR5cGUgPT09IFwib25jZVwiKSB7XG5cdFx0XHRlbWl0dGVyLm9uY2UobGlzdGVuZXIuZXZlbnQsIGxpc3RlbmVyLmV4ZWMpO1xuXHRcdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHRcdH1cblxuXHRcdGVtaXR0ZXIub24obGlzdGVuZXIuZXZlbnQgYXMgYW55LCBsaXN0ZW5lci5leGVjKTtcblx0XHRyZXR1cm4gbGlzdGVuZXI7XG5cdH1cblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBtb2QgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGRlcmVnaXN0ZXIobGlzdGVuZXI6IExpc3RlbmVyKTogdm9pZCB7XG5cdFx0dGhpcy5yZW1vdmVGcm9tRW1pdHRlcihsaXN0ZW5lci5pZCk7XG5cdFx0c3VwZXIuZGVyZWdpc3RlcihsaXN0ZW5lcik7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjYXRlZ29yeSBieSBuYW1lLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGZpbmRDYXRlZ29yeShuYW1lOiBzdHJpbmcpOiBDYXRlZ29yeTxzdHJpbmcsIExpc3RlbmVyPiB7XG5cdFx0cmV0dXJuIHN1cGVyLmZpbmRDYXRlZ29yeShuYW1lKSBhcyBDYXRlZ29yeTxzdHJpbmcsIExpc3RlbmVyPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIG1vZHVsZSwgY2FuIGJlIGEgbW9kdWxlIGNsYXNzIG9yIGEgZmlsZXBhdGguXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBjbGFzcyBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICogQHBhcmFtIGlzUmVsb2FkIC0gV2hldGhlciB0aGlzIGlzIGEgcmVsb2FkIG9yIG5vdC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkKHRoaW5nOiBzdHJpbmcgfCBMaXN0ZW5lciwgaXNSZWxvYWQ/OiBib29sZWFuKTogTGlzdGVuZXIge1xuXHRcdHJldHVybiBzdXBlci5sb2FkKHRoaW5nLCBpc1JlbG9hZCkgYXMgTGlzdGVuZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIGxpc3RlbmVycyBmcm9tIHRoZSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZEFsbChcblx0XHRkaXJlY3Rvcnk/OiBzdHJpbmcsXG5cdFx0ZmlsdGVyPzogTG9hZFByZWRpY2F0ZVxuXHQpOiBMaXN0ZW5lckhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5sb2FkQWxsKGRpcmVjdG9yeSwgZmlsdGVyKSBhcyBMaXN0ZW5lckhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbGlzdGVuZXIgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVnaXN0ZXIobGlzdGVuZXI6IExpc3RlbmVyLCBmaWxlcGF0aDogc3RyaW5nKTogdm9pZCB7XG5cdFx0c3VwZXIucmVnaXN0ZXIobGlzdGVuZXIsIGZpbGVwYXRoKTtcblx0XHRsaXN0ZW5lci5leGVjID0gbGlzdGVuZXIuZXhlYy5iaW5kKGxpc3RlbmVyKTtcblx0XHR0aGlzLmFkZFRvRW1pdHRlcihsaXN0ZW5lci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIGxpc3RlbmVyLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkKGlkOiBzdHJpbmcpOiBMaXN0ZW5lciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZChpZCkgYXMgTGlzdGVuZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgbGlzdGVuZXJzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZEFsbCgpOiBMaXN0ZW5lckhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWRBbGwoKSBhcyBMaXN0ZW5lckhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGxpc3RlbmVyLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBMaXN0ZW5lciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZShpZCkgYXMgTGlzdGVuZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgbGlzdGVuZXJzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBMaXN0ZW5lckhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmVBbGwoKSBhcyBMaXN0ZW5lckhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGxpc3RlbmVyIGZyb20gdGhlIEV2ZW50RW1pdHRlci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZUZyb21FbWl0dGVyKGlkOiBzdHJpbmcpOiBMaXN0ZW5lciB7XG5cdFx0Y29uc3QgbGlzdGVuZXI6IExpc3RlbmVyID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIWxpc3RlbmVyKVxuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTU9EVUxFX05PVF9GT1VORFwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgaWQpO1xuXG5cdFx0Y29uc3QgZW1pdHRlcjogRXZlbnRFbWl0dGVyID0gVXRpbC5pc0V2ZW50RW1pdHRlcihsaXN0ZW5lci5lbWl0dGVyKVxuXHRcdFx0PyAobGlzdGVuZXIuZW1pdHRlciBhcyBFdmVudEVtaXR0ZXIpXG5cdFx0XHQ6IHRoaXMuZW1pdHRlcnMuZ2V0KGxpc3RlbmVyLmVtaXR0ZXIgYXMgc3RyaW5nKTtcblx0XHRpZiAoIVV0aWwuaXNFdmVudEVtaXR0ZXIoZW1pdHRlcikpXG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX1RZUEVcIiwgXCJlbWl0dGVyXCIsIFwiRXZlbnRFbWl0dGVyXCIsIHRydWUpO1xuXG5cdFx0ZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIuZXhlYyk7XG5cdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgY3VzdG9tIGVtaXR0ZXJzLlxuXHQgKiBAcGFyYW0gZW1pdHRlcnMgLSBFbWl0dGVycyB0byB1c2UuIFRoZSBrZXkgaXMgdGhlIG5hbWUgYW5kIHZhbHVlIGlzIHRoZSBlbWl0dGVyLlxuXHQgKi9cblx0c2V0RW1pdHRlcnMoZW1pdHRlcnM6IGFueSk6IExpc3RlbmVySGFuZGxlciB7XG5cdFx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZW1pdHRlcnMpKSB7XG5cdFx0XHRpZiAoIVV0aWwuaXNFdmVudEVtaXR0ZXIodmFsdWUpKVxuXHRcdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX1RZUEVcIiwga2V5LCBcIkV2ZW50RW1pdHRlclwiLCB0cnVlKTtcblx0XHRcdHRoaXMuZW1pdHRlcnMuc2V0KGtleSwgdmFsdWUgYXMgYW55KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHB1YmxpYyBvdmVycmlkZSBvbjxLIGV4dGVuZHMga2V5b2YgTGlzdGVuZXJIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IExpc3RlbmVySGFuZGxlckV2ZW50c1tLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbihldmVudCwgbGlzdGVuZXIpO1xuXHR9XG59XG4iXX0=