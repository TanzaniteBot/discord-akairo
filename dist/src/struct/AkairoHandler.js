"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../util/AkairoError"));
const Constants_1 = require("../util/Constants");
const AkairoModule_1 = __importDefault(require("./AkairoModule"));
const Category_1 = __importDefault(require("../util/Category"));
const discord_js_1 = require("discord.js");
const events_1 = __importDefault(require("events"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Base class for handling modules.
 * @param client - The Akairo client.
 * @param options - Options for module loading and handling.
 */
class AkairoHandler extends events_1.default {
    /**
     * Whether or not to automate category names.
     */
    automateCategories;
    /**
     * Categories, mapped by ID to Category.
     */
    categories;
    /**
     * Class to handle.
     */
    classToHandle;
    /**
     * The Akairo client.
     */
    client;
    /**
     * The main directory to modules.
     */
    directory;
    /**
     * File extensions to load.
     */
    extensions;
    /**
     * Function that filters files when loading.
     */
    loadFilter;
    /**
     * Modules loaded, mapped by ID to AkairoModule.
     */
    modules;
    constructor(client, { directory, classToHandle = AkairoModule_1.default, extensions = [".js", ".json", ".ts"], automateCategories = false, loadFilter = () => true }) {
        super();
        this.client = client;
        this.directory = directory;
        this.classToHandle = classToHandle;
        this.extensions = new Set(extensions);
        this.automateCategories = Boolean(automateCategories);
        this.loadFilter = loadFilter;
        this.modules = new discord_js_1.Collection();
        this.categories = new discord_js_1.Collection();
    }
    /**
     * Deregisters a module.
     * @param mod - Module to use.
     */
    deregister(mod) {
        if (mod.filepath)
            delete require.cache[require.resolve(mod.filepath)];
        this.modules.delete(mod.id);
        mod.category.delete(mod.id);
    }
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name) {
        return this.categories.find(category => {
            return category.id.toLowerCase() === name.toLowerCase();
        });
    }
    /**
     * Loads a module, can be a module class or a filepath.
     * @param thing - Module class or path to module.
     * @param isReload - Whether this is a reload or not.
     */
    load(
    // eslint-disable-next-line @typescript-eslint/ban-types
    thing, isReload = false) {
        const isClass = typeof thing === "function";
        if (!isClass && !this.extensions.has(path_1.default.extname(thing)))
            return undefined;
        let mod = isClass
            ? thing
            : function findExport(m) {
                if (!m)
                    return null;
                if (m.prototype instanceof this.classToHandle)
                    return m;
                return m.default ? findExport.call(this, m.default) : null;
                // eslint-disable-next-line @typescript-eslint/no-var-requires
            }.call(this, require(thing));
        if (mod && mod.prototype instanceof this.classToHandle) {
            mod = new mod(this); // eslint-disable-line new-cap
        }
        else {
            if (!isClass)
                delete require.cache[require.resolve(thing)];
            return undefined;
        }
        if (this.modules.has(mod.id))
            throw new AkairoError_1.default("ALREADY_LOADED", this.classToHandle.name, mod.id);
        this.register(mod, isClass ? null : thing);
        this.emit(Constants_1.AkairoHandlerEvents.LOAD, mod, isReload);
        return mod;
    }
    /**
     * Reads all modules from a directory and loads them.
     * @param directory - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     * Defaults to the filter passed in the constructor.
     */
    loadAll(directory = this.directory, filter = this.loadFilter || (() => true)) {
        const filepaths = AkairoHandler.readdirRecursive(directory);
        for (let filepath of filepaths) {
            filepath = path_1.default.resolve(filepath);
            if (filter(filepath))
                this.load(filepath);
        }
        return this;
    }
    /**
     * Registers a module.
     * @param mod - Module to use.
     * @param filepath - Filepath of module.
     */
    register(mod, filepath) {
        mod.filepath = filepath;
        mod.client = this.client;
        mod.handler = this;
        this.modules.set(mod.id, mod);
        if (mod.categoryID === "default" && this.automateCategories) {
            const dirs = path_1.default.dirname(filepath).split(path_1.default.sep);
            mod.categoryID = dirs[dirs.length - 1];
        }
        if (!this.categories.has(mod.categoryID)) {
            // @ts-expect-error
            this.categories.set(mod.categoryID, new Category_1.default(mod.categoryID));
        }
        const category = this.categories.get(mod.categoryID);
        mod.category = category;
        category.set(mod.id, mod);
    }
    /**
     * Reloads a module.
     * @param id - ID of the module.
     */
    reload(id) {
        const mod = this.modules.get(id.toString());
        if (!mod)
            throw new AkairoError_1.default("MODULE_NOT_FOUND", this.classToHandle.name, id);
        if (!mod.filepath)
            throw new AkairoError_1.default("NOT_RELOADABLE", this.classToHandle.name, id);
        this.deregister(mod);
        const filepath = mod.filepath;
        const newMod = this.load(filepath, true);
        return newMod;
    }
    /**
     * Reloads all modules.
     */
    reloadAll() {
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath)
                this.reload(m.id);
        }
        return this;
    }
    /**
     * Removes a module.
     * @param id - ID of the module.
     */
    remove(id) {
        const mod = this.modules.get(id.toString());
        if (!mod)
            throw new AkairoError_1.default("MODULE_NOT_FOUND", this.classToHandle.name, id);
        this.deregister(mod);
        this.emit(Constants_1.AkairoHandlerEvents.REMOVE, mod);
        return mod;
    }
    /**
     * Removes all modules.
     */
    removeAll() {
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath)
                this.remove(m.id);
        }
        return this;
    }
    /**
     * Reads files recursively from a directory.
     * @param directory - Directory to read.
     */
    static readdirRecursive(directory) {
        const result = [];
        (function read(dir) {
            const files = fs_1.default.readdirSync(dir);
            for (const file of files) {
                const filepath = path_1.default.join(dir, file);
                if (fs_1.default.statSync(filepath).isDirectory()) {
                    read(filepath);
                }
                else {
                    result.push(filepath);
                }
            }
        })(directory);
        return result;
    }
}
exports.default = AkairoHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQWthaXJvSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNFQUE4QztBQUM5QyxpREFBd0Q7QUFDeEQsa0VBQTBDO0FBQzFDLGdFQUF3QztBQUN4QywyQ0FBd0M7QUFDeEMsb0RBQWtDO0FBQ2xDLDRDQUFvQjtBQUNwQixnREFBd0I7QUFLeEI7Ozs7R0FJRztBQUNILE1BQXFCLGFBQWMsU0FBUSxnQkFBWTtJQUN0RDs7T0FFRztJQUNJLGtCQUFrQixDQUFVO0lBRW5DOztPQUVHO0lBQ0ksVUFBVSxDQUFxRDtJQUV0RTs7T0FFRztJQUNJLGFBQWEsQ0FBc0I7SUFFMUM7O09BRUc7SUFDSSxNQUFNLENBQWU7SUFFNUI7O09BRUc7SUFDSSxTQUFTLENBQVM7SUFFekI7O09BRUc7SUFDSSxVQUFVLENBQWM7SUFFL0I7O09BRUc7SUFDSSxVQUFVLENBQWdCO0lBRWpDOztPQUVHO0lBQ0ksT0FBTyxDQUFtQztJQUVqRCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxzQkFBWSxFQUM1QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUNwQyxrQkFBa0IsR0FBRyxLQUFLLEVBQzFCLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQ0Q7UUFFdkIsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUUzQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUVuQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMs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QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRXRDLElBQUksWUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNmO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3RCO2FBQ0Q7UUFDRixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVkLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUNEO0FBM1BELGdDQTJQQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IHsgQWthaXJvSGFuZGxlckV2ZW50cyB9IGZyb20gXCIuLi91dGlsL0NvbnN0YW50c1wiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSBmcm9tIFwiLi9Ba2Fpcm9Nb2R1bGVcIjtcbmltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuL0FrYWlyb0NsaWVudFwiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWM8TT4gPSB7ICgpOiBNIH07XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgaGFuZGxpbmcgbW9kdWxlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgbW9kdWxlIGxvYWRpbmcgYW5kIGhhbmRsaW5nLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBa2Fpcm9IYW5kbGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGF1dG9tYXRlIGNhdGVnb3J5IG5hbWVzLlxuXHQgKi9cblx0cHVibGljIGF1dG9tYXRlQ2F0ZWdvcmllczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGNhdGVnb3JpZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDYXRlZ29yeTxzdHJpbmcsIEFrYWlyb01vZHVsZT4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1x0XG5cdHB1YmxpYyBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgQWthaXJvTW9kdWxlO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogVGhlIG1haW4gZGlyZWN0b3J5IHRvIG1vZHVsZXMuXG5cdCAqL1xuXHRwdWJsaWMgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEZpbGUgZXh0ZW5zaW9ucyB0byBsb2FkLlxuXHQgKi9cblx0cHVibGljIGV4dGVuc2lvbnM6IFNldDxzdHJpbmc+O1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0aGF0IGZpbHRlcnMgZmlsZXMgd2hlbiBsb2FkaW5nLlxuXHQgKi9cblx0cHVibGljIGxvYWRGaWx0ZXI6IExvYWRQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIE1vZHVsZXMgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gQWthaXJvTW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG1vZHVsZXM6IENvbGxlY3Rpb248c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+O1xuXG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQWthaXJvTW9kdWxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi5qc29uXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzID0gZmFsc2UsXG5cdFx0XHRsb2FkRmlsdGVyID0gKCkgPT4gdHJ1ZVxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zXG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmNsaWVudCA9IGNsaWVudDtcblxuXHRcdHRoaXMuZGlyZWN0b3J5ID0gZGlyZWN0b3J5O1xuXG5cdFx0dGhpcy5jbGFzc1RvSGFuZGxlID0gY2xhc3NUb0hhbmRsZTtcblxuXHRcdHRoaXMuZXh0ZW5zaW9ucyA9IG5ldyBTZXQoZXh0ZW5zaW9ucyk7XG5cblx0XHR0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcyA9IEJvb2xlYW4oYXV0b21hdGVDYXRlZ29yaWVzKTtcblxuXHRcdHRoaXMubG9hZEZpbHRlciA9IGxvYWRGaWx0ZXI7XG5cblx0XHR0aGlzLm1vZHVsZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5jYXRlZ29yaWVzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIG1vZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgZGVyZWdpc3Rlcihtb2Q6IEFrYWlyb01vZHVsZSk6IHZvaWQge1xuXHRcdGlmIChtb2QuZmlsZXBhdGgpIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZShtb2QuZmlsZXBhdGgpXTtcblx0XHR0aGlzLm1vZHVsZXMuZGVsZXRlKG1vZC5pZCk7XG5cdFx0bW9kLmNhdGVnb3J5LmRlbGV0ZShtb2QuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY2F0ZWdvcnkgYnkgbmFtZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBmaW5kQ2F0ZWdvcnkobmFtZTogc3RyaW5nKTogQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+IHtcblx0XHRyZXR1cm4gdGhpcy5jYXRlZ29yaWVzLmZpbmQoY2F0ZWdvcnkgPT4ge1xuXHRcdFx0cmV0dXJuIGNhdGVnb3J5LmlkLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIG1vZHVsZSwgY2FuIGJlIGEgbW9kdWxlIGNsYXNzIG9yIGEgZmlsZXBhdGguXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBjbGFzcyBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICogQHBhcmFtIGlzUmVsb2FkIC0gV2hldGhlciB0aGlzIGlzIGEgcmVsb2FkIG9yIG5vdC5cblx0ICovXG5cdHB1YmxpYyBsb2FkKFxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXR5cGVzXG5cdFx0dGhpbmc6IHN0cmluZyB8IEZ1bmN0aW9uLFxuXHRcdGlzUmVsb2FkID0gZmFsc2Vcblx0KTogQWthaXJvTW9kdWxlIHtcblx0XHRjb25zdCBpc0NsYXNzID0gdHlwZW9mIHRoaW5nID09PSBcImZ1bmN0aW9uXCI7XG5cdFx0aWYgKCFpc0NsYXNzICYmICF0aGlzLmV4dGVuc2lvbnMuaGFzKHBhdGguZXh0bmFtZSh0aGluZyBhcyBzdHJpbmcpKSlcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbW9kID0gaXNDbGFzc1xuXHRcdFx0PyB0aGluZ1xuXHRcdFx0OiBmdW5jdGlvbiBmaW5kRXhwb3J0KG0pIHtcblx0XHRcdFx0XHRpZiAoIW0pIHJldHVybiBudWxsO1xuXHRcdFx0XHRcdGlmIChtLnByb3RvdHlwZSBpbnN0YW5jZW9mIHRoaXMuY2xhc3NUb0hhbmRsZSkgcmV0dXJuIG07XG5cdFx0XHRcdFx0cmV0dXJuIG0uZGVmYXVsdCA/IGZpbmRFeHBvcnQuY2FsbCh0aGlzLCBtLmRlZmF1bHQpIDogbnVsbDtcblx0XHRcdCAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcblx0XHRcdCAgfS5jYWxsKHRoaXMsIHJlcXVpcmUodGhpbmcgYXMgc3RyaW5nKSk7XG5cblx0XHRpZiAobW9kICYmIG1vZC5wcm90b3R5cGUgaW5zdGFuY2VvZiB0aGlzLmNsYXNzVG9IYW5kbGUpIHtcblx0XHRcdG1vZCA9IG5ldyBtb2QodGhpcyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIWlzQ2xhc3MpIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZSh0aGluZyBhcyBzdHJpbmcpXTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMubW9kdWxlcy5oYXMobW9kLmlkKSlcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMUkVBRFlfTE9BREVEXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBtb2QuaWQpO1xuXHRcdHRoaXMucmVnaXN0ZXIobW9kLCBpc0NsYXNzID8gbnVsbCA6ICh0aGluZyBhcyBzdHJpbmcpKTtcblx0XHR0aGlzLmVtaXQoQWthaXJvSGFuZGxlckV2ZW50cy5MT0FELCBtb2QsIGlzUmVsb2FkKTtcblx0XHRyZXR1cm4gbW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBtb2R1bGVzIGZyb20gYSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLlxuXHQgKiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqIERlZmF1bHRzIHRvIHRoZSBmaWx0ZXIgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICovXG5cdHB1YmxpYyBsb2FkQWxsKFxuXHRcdGRpcmVjdG9yeTogc3RyaW5nID0gdGhpcy5kaXJlY3RvcnksXG5cdFx0ZmlsdGVyOiBMb2FkUHJlZGljYXRlID0gdGhpcy5sb2FkRmlsdGVyIHx8ICgoKSA9PiB0cnVlKVxuXHQpOiBBa2Fpcm9IYW5kbGVyIHtcblx0XHRjb25zdCBmaWxlcGF0aHMgPSBBa2Fpcm9IYW5kbGVyLnJlYWRkaXJSZWN1cnNpdmUoZGlyZWN0b3J5KTtcblx0XHRmb3IgKGxldCBmaWxlcGF0aCBvZiBmaWxlcGF0aHMpIHtcblx0XHRcdGZpbGVwYXRoID0gcGF0aC5yZXNvbHZlKGZpbGVwYXRoKTtcblx0XHRcdGlmIChmaWx0ZXIoZmlsZXBhdGgpKSB0aGlzLmxvYWQoZmlsZXBhdGgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIG1vZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZWdpc3Rlcihtb2Q6IEFrYWlyb01vZHVsZSwgZmlsZXBhdGg6IHN0cmluZyk6IHZvaWQge1xuXHRcdG1vZC5maWxlcGF0aCA9IGZpbGVwYXRoO1xuXHRcdG1vZC5jbGllbnQgPSB0aGlzLmNsaWVudDtcblx0XHRtb2QuaGFuZGxlciA9IHRoaXM7XG5cdFx0dGhpcy5tb2R1bGVzLnNldChtb2QuaWQsIG1vZCk7XG5cblx0XHRpZiAobW9kLmNhdGVnb3J5SUQgPT09IFwiZGVmYXVsdFwiICYmIHRoaXMuYXV0b21hdGVDYXRlZ29yaWVzKSB7XG5cdFx0XHRjb25zdCBkaXJzID0gcGF0aC5kaXJuYW1lKGZpbGVwYXRoKS5zcGxpdChwYXRoLnNlcCk7XG5cdFx0XHRtb2QuY2F0ZWdvcnlJRCA9IGRpcnNbZGlycy5sZW5ndGggLSAxXTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuY2F0ZWdvcmllcy5oYXMobW9kLmNhdGVnb3J5SUQpKSB7XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHR0aGlzLmNhdGVnb3JpZXMuc2V0KG1vZC5jYXRlZ29yeUlELCBuZXcgQ2F0ZWdvcnkobW9kLmNhdGVnb3J5SUQpKTtcblx0XHR9XG5cblx0XHRjb25zdCBjYXRlZ29yeSA9IHRoaXMuY2F0ZWdvcmllcy5nZXQobW9kLmNhdGVnb3J5SUQpO1xuXHRcdG1vZC5jYXRlZ29yeSA9IGNhdGVnb3J5O1xuXHRcdGNhdGVnb3J5LnNldChtb2QuaWQsIG1vZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZWxvYWQoaWQ6IHN0cmluZyk6IEFrYWlyb01vZHVsZSB7XG5cdFx0Y29uc3QgbW9kID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIW1vZClcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblx0XHRpZiAoIW1vZC5maWxlcGF0aClcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk5PVF9SRUxPQURBQkxFXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHR0aGlzLmRlcmVnaXN0ZXIobW9kKTtcblxuXHRcdGNvbnN0IGZpbGVwYXRoID0gbW9kLmZpbGVwYXRoO1xuXHRcdGNvbnN0IG5ld01vZCA9IHRoaXMubG9hZChmaWxlcGF0aCwgdHJ1ZSk7XG5cdFx0cmV0dXJuIG5ld01vZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBtb2R1bGVzLlxuXHQgKi9cblx0cHVibGljIHJlbG9hZEFsbCgpOiBBa2Fpcm9IYW5kbGVyIHtcblx0XHRmb3IgKGNvbnN0IG0gb2YgQXJyYXkuZnJvbSh0aGlzLm1vZHVsZXMudmFsdWVzKCkpKSB7XG5cdFx0XHRpZiAobS5maWxlcGF0aCkgdGhpcy5yZWxvYWQobS5pZCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmUoaWQ6IHN0cmluZyk6IEFrYWlyb01vZHVsZSB7XG5cdFx0Y29uc3QgbW9kID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIW1vZClcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdHRoaXMuZGVyZWdpc3Rlcihtb2QpO1xuXG5cdFx0dGhpcy5lbWl0KEFrYWlyb0hhbmRsZXJFdmVudHMuUkVNT1ZFLCBtb2QpO1xuXHRcdHJldHVybiBtb2Q7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVBbGwoKTogQWthaXJvSGFuZGxlciB7XG5cdFx0Zm9yIChjb25zdCBtIG9mIEFycmF5LmZyb20odGhpcy5tb2R1bGVzLnZhbHVlcygpKSkge1xuXHRcdFx0aWYgKG0uZmlsZXBhdGgpIHRoaXMucmVtb3ZlKG0uaWQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGZpbGVzIHJlY3Vyc2l2ZWx5IGZyb20gYSBkaXJlY3RvcnkuXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gcmVhZC5cblx0ICovXG5cdHN0YXRpYyByZWFkZGlyUmVjdXJzaXZlKGRpcmVjdG9yeTogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdFx0KGZ1bmN0aW9uIHJlYWQoZGlyKSB7XG5cdFx0XHRjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG5cblx0XHRcdGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuXHRcdFx0XHRjb25zdCBmaWxlcGF0aCA9IHBhdGguam9pbihkaXIsIGZpbGUpO1xuXG5cdFx0XHRcdGlmIChmcy5zdGF0U3luYyhmaWxlcGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuXHRcdFx0XHRcdHJlYWQoZmlsZXBhdGgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKGZpbGVwYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKGRpcmVjdG9yeSk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGZpbHRlcmluZyBmaWxlcyB3aGVuIGxvYWRpbmcuXG4gKiBUcnVlIG1lYW5zIHRoZSBmaWxlIHNob3VsZCBiZSBsb2FkZWQuXG4gKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBmaWxlLlxuICovXG5leHBvcnQgdHlwZSBMb2FkUHJlZGljYXRlID0gKGZpbGVwYXRoOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgbW9kdWxlIGxvYWRpbmcgYW5kIGhhbmRsaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFrYWlyb0hhbmRsZXJPcHRpb25zIHtcblx0LyoqIFdoZXRoZXIgb3Igbm90IHRvIHNldCBlYWNoIG1vZHVsZSdzIGNhdGVnb3J5IHRvIGl0cyBwYXJlbnQgZGlyZWN0b3J5IG5hbWUuICovXG5cdGF1dG9tYXRlQ2F0ZWdvcmllcz86IGJvb2xlYW47XG5cblx0LyoqIE9ubHkgY2xhc3NlcyB0aGF0IGV4dGVuZHMgdGhpcyBjbGFzcyBjYW4gYmUgaGFuZGxlZC4gKi9cblx0Y2xhc3NUb0hhbmRsZT86IHR5cGVvZiBBa2Fpcm9Nb2R1bGU7XG5cblx0LyoqIERpcmVjdG9yeSB0byBtb2R1bGVzLiAqL1xuXHRkaXJlY3Rvcnk/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEZpbGUgZXh0ZW5zaW9ucyB0byBsb2FkLlxuXHQgKiBCeSBkZWZhdWx0IHRoaXMgaXMgLmpzLCAuanNvbiwgYW5kIC50cyBmaWxlcy5cblx0ICovXG5cdGV4dGVuc2lvbnM/OiBzdHJpbmdbXSB8IFNldDxzdHJpbmc+O1xuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgZm9yIGZpbGVzIHRvIGJlIGxvYWRlZC5cblx0ICogQ2FuIGJlIHNldCBpbmRpdmlkdWFsbHkgZm9yIGVhY2ggaGFuZGxlciBieSBvdmVycmlkaW5nIHRoZSBgbG9hZEFsbGAgbWV0aG9kLlxuXHQgKi9cblx0bG9hZEZpbHRlcj86IExvYWRQcmVkaWNhdGU7XG59XG4iXX0=