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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXJIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0cnVjdC9saXN0ZW5lcnMvTGlzdGVuZXJIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUVBQWlEO0FBQ2pELHFFQUFzRjtBQUN0RiwyQ0FBaUQ7QUFDakQsMkRBQW1DO0FBQ25DLDBEQUFrQztBQU1sQzs7OztHQUlHO0FBQ0gsTUFBcUIsZUFBZ0IsU0FBUSx1QkFBYTtJQUN6RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxrQkFBUSxFQUN4QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEtBQ2UsRUFBRTtRQUU1QixJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxZQUFZLGtCQUFRLElBQUksYUFBYSxLQUFLLGtCQUFRLENBQUMsRUFBRTtZQUNqRixNQUFNLElBQUkscUJBQVcsQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLGtCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEY7UUFFRCxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsU0FBUztZQUNULGFBQWE7WUFDYixVQUFVO1lBQ1Ysa0JBQWtCO1lBQ2xCLFVBQVU7U0FDVixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQXNCRDs7O09BR0c7SUFDSSxRQUFRLENBQW1DO0lBT2xEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxFQUFVO1FBQzdCLE1BQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxRQUFRO1lBQUUsTUFBTSxJQUFJLHFCQUFXLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFdEY7O1dBRUc7UUFDSCxNQUFNLE9BQU8sR0FBaUIsY0FBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ2xFLENBQUMsQ0FBRSxRQUFRLENBQUMsT0FBd0I7WUFDcEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFpQixDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLGNBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO1lBQUUsTUFBTSxJQUFJLHFCQUFXLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUcsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtZQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLE9BQU8sUUFBUSxDQUFDO1NBQ2hCO1FBRUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBWSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsVUFBVSxDQUFDLFFBQWtCO1FBQzVDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsWUFBWSxDQUFDLElBQVk7UUFDeEMsT0FBTyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBK0IsQ0FBQztJQUMvRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNhLElBQUksQ0FBQyxLQUF3QixFQUFFLFFBQWtCO1FBQ2hFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFhLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDYSxPQUFPLENBQUMsU0FBa0IsRUFBRSxNQUFzQjtRQUNqRSxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBb0IsQ0FBQztJQUM1RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNhLFFBQVEsQ0FBQyxRQUFrQixFQUFFLFFBQWdCO1FBQzVELEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVEOzs7T0FHRztJQUNhLE1BQU0sQ0FBQyxFQUFVO1FBQ2hDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQWEsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7O09BRUc7SUFDYSxTQUFTO1FBQ3hCLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBcUIsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsTUFBTSxDQUFDLEVBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBYSxDQUFDO0lBQ3JDLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFxQixDQUFDO0lBQzdDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxpQkFBaUIsQ0FBQyxFQUFVO1FBQ2xDLE1BQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxRQUFRO1lBQUUsTUFBTSxJQUFJLHFCQUFXLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFdEYsTUFBTSxPQUFPLEdBQWlCLGNBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUNsRSxDQUFDLENBQUUsUUFBUSxDQUFDLE9BQXdCO1lBQ3BDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBaUIsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxjQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQztZQUFFLE1BQU0sSUFBSSxxQkFBVyxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsT0FBTyxRQUFRLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7T0FHRztJQUNILFdBQVcsQ0FBQyxRQUFhO1FBQ3hCLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3BELElBQUksQ0FBQyxjQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztnQkFBRSxNQUFNLElBQUkscUJBQVcsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBWSxDQUFDLENBQUM7U0FDckM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFZSxFQUFFLENBQ2pCLEtBQVEsRUFDUixRQUFnRTtRQUVoRSxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRDtBQW5NRCxrQ0FtTUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7IEFrYWlyb0hhbmRsZXJPcHRpb25zLCBMb2FkUHJlZGljYXRlIH0gZnJvbSBcIi4uL0FrYWlyb0hhbmRsZXJcIjtcbmltcG9ydCB7IEF3YWl0ZWQsIENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IExpc3RlbmVyIGZyb20gXCIuL0xpc3RlbmVyXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgeyBMaXN0ZW5lckhhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdHlwaW5ncy9ldmVudHNcIjtcblxuLyoqXG4gKiBMb2FkcyBsaXN0ZW5lcnMgYW5kIHJlZ2lzdGVycyB0aGVtIHdpdGggRXZlbnRFbWl0dGVycy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGlzdGVuZXJIYW5kbGVyIGV4dGVuZHMgQWthaXJvSGFuZGxlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gTGlzdGVuZXIsXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zID0ge31cblx0KSB7XG5cdFx0aWYgKCEoY2xhc3NUb0hhbmRsZS5wcm90b3R5cGUgaW5zdGFuY2VvZiBMaXN0ZW5lciB8fCBjbGFzc1RvSGFuZGxlID09PSBMaXN0ZW5lcikpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsIGNsYXNzVG9IYW5kbGUubmFtZSwgTGlzdGVuZXIubmFtZSk7XG5cdFx0fVxuXG5cdFx0c3VwZXIoY2xpZW50LCB7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9KTtcblxuXHRcdHRoaXMuZW1pdHRlcnMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXHRcdHRoaXMuZW1pdHRlcnMuc2V0KFwiY2xpZW50XCIsIHRoaXMuY2xpZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYXRlZ29yaWVzLCBtYXBwZWQgYnkgSUQgdG8gQ2F0ZWdvcnkuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBMaXN0ZW5lcj4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgTGlzdGVuZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50XG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogRGlyZWN0b3J5IHRvIGxpc3RlbmVycy5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGRpcmVjdG9yeTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBFdmVudEVtaXR0ZXJzIGZvciB1c2UsIG1hcHBlZCBieSBuYW1lIHRvIEV2ZW50RW1pdHRlci5cblx0ICogQnkgZGVmYXVsdCwgJ2NsaWVudCcgaXMgc2V0IHRvIHRoZSBnaXZlbiBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgZW1pdHRlcnM6IENvbGxlY3Rpb248c3RyaW5nLCBFdmVudEVtaXR0ZXI+O1xuXG5cdC8qKlxuXHQgKiBMaXN0ZW5lcnMgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gTGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgTGlzdGVuZXI+O1xuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbGlzdGVuZXIgdG8gdGhlIEV2ZW50RW1pdHRlci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIGFkZFRvRW1pdHRlcihpZDogc3RyaW5nKTogTGlzdGVuZXIge1xuXHRcdGNvbnN0IGxpc3RlbmVyOiBMaXN0ZW5lciA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSk7XG5cdFx0aWYgKCFsaXN0ZW5lcikgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTU9EVUxFX05PVF9GT1VORFwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgaWQpO1xuXG5cdFx0LyoqXG5cdFx0ICogQHR5cGUge0FrYWlyb0hhbmRsZXJ9XG5cdFx0ICovXG5cdFx0Y29uc3QgZW1pdHRlcjogRXZlbnRFbWl0dGVyID0gVXRpbC5pc0V2ZW50RW1pdHRlcihsaXN0ZW5lci5lbWl0dGVyKVxuXHRcdFx0PyAobGlzdGVuZXIuZW1pdHRlciBhcyBFdmVudEVtaXR0ZXIpXG5cdFx0XHQ6IHRoaXMuZW1pdHRlcnMuZ2V0KGxpc3RlbmVyLmVtaXR0ZXIgYXMgc3RyaW5nKTtcblx0XHRpZiAoIVV0aWwuaXNFdmVudEVtaXR0ZXIoZW1pdHRlcikpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfVFlQRVwiLCBcImVtaXR0ZXJcIiwgXCJFdmVudEVtaXR0ZXJcIiwgdHJ1ZSk7XG5cblx0XHRpZiAobGlzdGVuZXIudHlwZSA9PT0gXCJvbmNlXCIpIHtcblx0XHRcdGVtaXR0ZXIub25jZShsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIuZXhlYyk7XG5cdFx0XHRyZXR1cm4gbGlzdGVuZXI7XG5cdFx0fVxuXG5cdFx0ZW1pdHRlci5vbihsaXN0ZW5lci5ldmVudCBhcyBhbnksIGxpc3RlbmVyLmV4ZWMpO1xuXHRcdHJldHVybiBsaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIG1vZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZGVyZWdpc3RlcihsaXN0ZW5lcjogTGlzdGVuZXIpOiB2b2lkIHtcblx0XHR0aGlzLnJlbW92ZUZyb21FbWl0dGVyKGxpc3RlbmVyLmlkKTtcblx0XHRzdXBlci5kZXJlZ2lzdGVyKGxpc3RlbmVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNhdGVnb3J5IGJ5IG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZmluZENhdGVnb3J5KG5hbWU6IHN0cmluZyk6IENhdGVnb3J5PHN0cmluZywgTGlzdGVuZXI+IHtcblx0XHRyZXR1cm4gc3VwZXIuZmluZENhdGVnb3J5KG5hbWUpIGFzIENhdGVnb3J5PHN0cmluZywgTGlzdGVuZXI+O1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGEgbW9kdWxlLCBjYW4gYmUgYSBtb2R1bGUgY2xhc3Mgb3IgYSBmaWxlcGF0aC5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIGNsYXNzIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKiBAcGFyYW0gaXNSZWxvYWQgLSBXaGV0aGVyIHRoaXMgaXMgYSByZWxvYWQgb3Igbm90LlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWQodGhpbmc6IHN0cmluZyB8IExpc3RlbmVyLCBpc1JlbG9hZD86IGJvb2xlYW4pOiBMaXN0ZW5lciB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWQodGhpbmcsIGlzUmVsb2FkKSBhcyBMaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgbGlzdGVuZXJzIGZyb20gdGhlIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkQWxsKGRpcmVjdG9yeT86IHN0cmluZywgZmlsdGVyPzogTG9hZFByZWRpY2F0ZSk6IExpc3RlbmVySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWRBbGwoZGlyZWN0b3J5LCBmaWx0ZXIpIGFzIExpc3RlbmVySGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lciAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWdpc3RlcihsaXN0ZW5lcjogTGlzdGVuZXIsIGZpbGVwYXRoOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRzdXBlci5yZWdpc3RlcihsaXN0ZW5lciwgZmlsZXBhdGgpO1xuXHRcdGxpc3RlbmVyLmV4ZWMgPSBsaXN0ZW5lci5leGVjLmJpbmQobGlzdGVuZXIpO1xuXHRcdHRoaXMuYWRkVG9FbWl0dGVyKGxpc3RlbmVyLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGEgbGlzdGVuZXIuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoaWQ6IHN0cmluZyk6IExpc3RlbmVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkKGlkKSBhcyBMaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBsaXN0ZW5lcnMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkQWxsKCk6IExpc3RlbmVySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZEFsbCgpIGFzIExpc3RlbmVySGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbGlzdGVuZXIuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmUoaWQ6IHN0cmluZyk6IExpc3RlbmVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBMaXN0ZW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBsaXN0ZW5lcnMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlQWxsKCk6IExpc3RlbmVySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIExpc3RlbmVySGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbGlzdGVuZXIgZnJvbSB0aGUgRXZlbnRFbWl0dGVyLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlRnJvbUVtaXR0ZXIoaWQ6IHN0cmluZyk6IExpc3RlbmVyIHtcblx0XHRjb25zdCBsaXN0ZW5lcjogTGlzdGVuZXIgPSB0aGlzLm1vZHVsZXMuZ2V0KGlkLnRvU3RyaW5nKCkpO1xuXHRcdGlmICghbGlzdGVuZXIpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdGNvbnN0IGVtaXR0ZXI6IEV2ZW50RW1pdHRlciA9IFV0aWwuaXNFdmVudEVtaXR0ZXIobGlzdGVuZXIuZW1pdHRlcilcblx0XHRcdD8gKGxpc3RlbmVyLmVtaXR0ZXIgYXMgRXZlbnRFbWl0dGVyKVxuXHRcdFx0OiB0aGlzLmVtaXR0ZXJzLmdldChsaXN0ZW5lci5lbWl0dGVyIGFzIHN0cmluZyk7XG5cdFx0aWYgKCFVdGlsLmlzRXZlbnRFbWl0dGVyKGVtaXR0ZXIpKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX1RZUEVcIiwgXCJlbWl0dGVyXCIsIFwiRXZlbnRFbWl0dGVyXCIsIHRydWUpO1xuXG5cdFx0ZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lci5ldmVudCwgbGlzdGVuZXIuZXhlYyk7XG5cdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgY3VzdG9tIGVtaXR0ZXJzLlxuXHQgKiBAcGFyYW0gZW1pdHRlcnMgLSBFbWl0dGVycyB0byB1c2UuIFRoZSBrZXkgaXMgdGhlIG5hbWUgYW5kIHZhbHVlIGlzIHRoZSBlbWl0dGVyLlxuXHQgKi9cblx0c2V0RW1pdHRlcnMoZW1pdHRlcnM6IGFueSk6IExpc3RlbmVySGFuZGxlciB7XG5cdFx0Zm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZW1pdHRlcnMpKSB7XG5cdFx0XHRpZiAoIVV0aWwuaXNFdmVudEVtaXR0ZXIodmFsdWUpKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX1RZUEVcIiwga2V5LCBcIkV2ZW50RW1pdHRlclwiLCB0cnVlKTtcblx0XHRcdHRoaXMuZW1pdHRlcnMuc2V0KGtleSwgdmFsdWUgYXMgYW55KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHB1YmxpYyBvdmVycmlkZSBvbjxLIGV4dGVuZHMga2V5b2YgTGlzdGVuZXJIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IExpc3RlbmVySGFuZGxlckV2ZW50c1tLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbihldmVudCwgbGlzdGVuZXIpO1xuXHR9XG59XG4iXX0=