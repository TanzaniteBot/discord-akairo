"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const events_1 = __importDefault(require("events"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const AkairoError_1 = __importDefault(require("../util/AkairoError"));
const Category_1 = __importDefault(require("../util/Category"));
const Constants_1 = require("../util/Constants");
const AkairoModule_1 = __importDefault(require("./AkairoModule"));
/**
 * Base class for handling modules.
 * @param client - The Akairo client.
 * @param options - Options for module loading and handling.
 */
class AkairoHandler extends events_1.default {
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
    load(thing, isReload = false) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQWthaXJvSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF3QztBQUN4QyxvREFBa0M7QUFDbEMsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4QixzRUFBOEM7QUFDOUMsZ0VBQXdDO0FBQ3hDLGlEQUF3RDtBQUV4RCxrRUFBMEM7QUFJMUM7Ozs7R0FJRztBQUNILE1BQXFCLGFBQWMsU0FBUSxnQkFBWTtJQUN0RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxzQkFBWSxFQUM1QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUNwQyxrQkFBa0IsR0FBRyxLQUFLLEVBQzFCLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQ0Q7UUFFdkIsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUUzQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUVuQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUU3QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBRWhDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksa0JBQWtCLENBQVU7SUFFbkM7O09BRUc7SUFDSSxVQUFVLENBQXFEO0lBRXRFOztPQUVHO0lBQ0ks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RUFBRTtnQkFDekIsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRXRDLElBQUksWUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNmO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3RCO2FBQ0Q7UUFDRixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVkLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUNEO0FBalBELGdDQWlQQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCB7IEFrYWlyb0hhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvTW9kdWxlIGZyb20gXCIuL0FrYWlyb01vZHVsZVwiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWM8TT4gPSB7ICgpOiBNIH07XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgaGFuZGxpbmcgbW9kdWxlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgbW9kdWxlIGxvYWRpbmcgYW5kIGhhbmRsaW5nLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBa2Fpcm9IYW5kbGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNsaWVudDogQWthaXJvQ2xpZW50LFxuXHRcdHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUgPSBBa2Fpcm9Nb2R1bGUsXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLmpzb25cIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMgPSBmYWxzZSxcblx0XHRcdGxvYWRGaWx0ZXIgPSAoKSA9PiB0cnVlXG5cdFx0fTogQWthaXJvSGFuZGxlck9wdGlvbnNcblx0KSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuY2xpZW50ID0gY2xpZW50O1xuXG5cdFx0dGhpcy5kaXJlY3RvcnkgPSBkaXJlY3Rvcnk7XG5cblx0XHR0aGlzLmNsYXNzVG9IYW5kbGUgPSBjbGFzc1RvSGFuZGxlO1xuXG5cdFx0dGhpcy5leHRlbnNpb25zID0gbmV3IFNldChleHRlbnNpb25zKTtcblxuXHRcdHRoaXMuYXV0b21hdGVDYXRlZ29yaWVzID0gQm9vbGVhbihhdXRvbWF0ZUNhdGVnb3JpZXMpO1xuXG5cdFx0dGhpcy5sb2FkRmlsdGVyID0gbG9hZEZpbHRlcjtcblxuXHRcdHRoaXMubW9kdWxlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmNhdGVnb3JpZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGF1dG9tYXRlIGNhdGVnb3J5IG5hbWVzLlxuXHQgKi9cblx0cHVibGljIGF1dG9tYXRlQ2F0ZWdvcmllczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGNhdGVnb3JpZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDYXRlZ29yeTxzdHJpbmcsIEFrYWlyb01vZHVsZT4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgY2xhc3NUb0hhbmRsZTogdHlwZW9mIEFrYWlyb01vZHVsZTtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSBtYWluIGRpcmVjdG9yeSB0byBtb2R1bGVzLlxuXHQgKi9cblx0cHVibGljIGRpcmVjdG9yeTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBGaWxlIGV4dGVuc2lvbnMgdG8gbG9hZC5cblx0ICovXG5cdHB1YmxpYyBleHRlbnNpb25zOiBTZXQ8c3RyaW5nPjtcblxuXHQvKipcblx0ICogRnVuY3Rpb24gdGhhdCBmaWx0ZXJzIGZpbGVzIHdoZW4gbG9hZGluZy5cblx0ICovXG5cdHB1YmxpYyBsb2FkRmlsdGVyOiBMb2FkUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBNb2R1bGVzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIEFrYWlyb01vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgQWthaXJvTW9kdWxlPjtcblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBtb2QgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGRlcmVnaXN0ZXIobW9kOiBBa2Fpcm9Nb2R1bGUpOiB2b2lkIHtcblx0XHRpZiAobW9kLmZpbGVwYXRoKSBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUobW9kLmZpbGVwYXRoKV07XG5cdFx0dGhpcy5tb2R1bGVzLmRlbGV0ZShtb2QuaWQpO1xuXHRcdG1vZC5jYXRlZ29yeS5kZWxldGUobW9kLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNhdGVnb3J5IGJ5IG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgZmluZENhdGVnb3J5KG5hbWU6IHN0cmluZyk6IENhdGVnb3J5PHN0cmluZywgQWthaXJvTW9kdWxlPiB7XG5cdFx0cmV0dXJuIHRoaXMuY2F0ZWdvcmllcy5maW5kKGNhdGVnb3J5ID0+IHtcblx0XHRcdHJldHVybiBjYXRlZ29yeS5pZC50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYSBtb2R1bGUsIGNhbiBiZSBhIG1vZHVsZSBjbGFzcyBvciBhIGZpbGVwYXRoLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBNb2R1bGUgY2xhc3Mgb3IgcGF0aCB0byBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpc1JlbG9hZCAtIFdoZXRoZXIgdGhpcyBpcyBhIHJlbG9hZCBvciBub3QuXG5cdCAqL1xuXHRwdWJsaWMgbG9hZCh0aGluZzogc3RyaW5nIHwgQWthaXJvTW9kdWxlLCBpc1JlbG9hZCA9IGZhbHNlKTogQWthaXJvTW9kdWxlIHtcblx0XHRjb25zdCBpc0NsYXNzID0gdHlwZW9mIHRoaW5nID09PSBcImZ1bmN0aW9uXCI7XG5cdFx0aWYgKCFpc0NsYXNzICYmICF0aGlzLmV4dGVuc2lvbnMuaGFzKHBhdGguZXh0bmFtZSh0aGluZyBhcyBzdHJpbmcpKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBtb2QgPSBpc0NsYXNzXG5cdFx0XHQ/IHRoaW5nXG5cdFx0XHQ6IGZ1bmN0aW9uIGZpbmRFeHBvcnQobSkge1xuXHRcdFx0XHRcdGlmICghbSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0aWYgKG0ucHJvdG90eXBlIGluc3RhbmNlb2YgdGhpcy5jbGFzc1RvSGFuZGxlKSByZXR1cm4gbTtcblx0XHRcdFx0XHRyZXR1cm4gbS5kZWZhdWx0ID8gZmluZEV4cG9ydC5jYWxsKHRoaXMsIG0uZGVmYXVsdCkgOiBudWxsO1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG5cdFx0XHQgIH0uY2FsbCh0aGlzLCByZXF1aXJlKHRoaW5nIGFzIHN0cmluZykpO1xuXG5cdFx0aWYgKG1vZCAmJiBtb2QucHJvdG90eXBlIGluc3RhbmNlb2YgdGhpcy5jbGFzc1RvSGFuZGxlKSB7XG5cdFx0XHRtb2QgPSBuZXcgbW9kKHRoaXMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5ldy1jYXBcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFpc0NsYXNzKSBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUodGhpbmcgYXMgc3RyaW5nKV07XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLm1vZHVsZXMuaGFzKG1vZC5pZCkpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMUkVBRFlfTE9BREVEXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBtb2QuaWQpO1xuXHRcdHRoaXMucmVnaXN0ZXIobW9kLCBpc0NsYXNzID8gbnVsbCA6ICh0aGluZyBhcyBzdHJpbmcpKTtcblx0XHR0aGlzLmVtaXQoQWthaXJvSGFuZGxlckV2ZW50cy5MT0FELCBtb2QsIGlzUmVsb2FkKTtcblx0XHRyZXR1cm4gbW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBtb2R1bGVzIGZyb20gYSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLlxuXHQgKiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqIERlZmF1bHRzIHRvIHRoZSBmaWx0ZXIgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICovXG5cdHB1YmxpYyBsb2FkQWxsKFxuXHRcdGRpcmVjdG9yeTogc3RyaW5nID0gdGhpcy5kaXJlY3RvcnksXG5cdFx0ZmlsdGVyOiBMb2FkUHJlZGljYXRlID0gdGhpcy5sb2FkRmlsdGVyIHx8ICgoKSA9PiB0cnVlKVxuXHQpOiBBa2Fpcm9IYW5kbGVyIHtcblx0XHRjb25zdCBmaWxlcGF0aHMgPSBBa2Fpcm9IYW5kbGVyLnJlYWRkaXJSZWN1cnNpdmUoZGlyZWN0b3J5KTtcblx0XHRmb3IgKGxldCBmaWxlcGF0aCBvZiBmaWxlcGF0aHMpIHtcblx0XHRcdGZpbGVwYXRoID0gcGF0aC5yZXNvbHZlKGZpbGVwYXRoKTtcblx0XHRcdGlmIChmaWx0ZXIoZmlsZXBhdGgpKSB0aGlzLmxvYWQoZmlsZXBhdGgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIG1vZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZWdpc3Rlcihtb2Q6IEFrYWlyb01vZHVsZSwgZmlsZXBhdGg/OiBzdHJpbmcpOiB2b2lkIHtcblx0XHRtb2QuZmlsZXBhdGggPSBmaWxlcGF0aDtcblx0XHRtb2QuY2xpZW50ID0gdGhpcy5jbGllbnQ7XG5cdFx0bW9kLmhhbmRsZXIgPSB0aGlzO1xuXHRcdHRoaXMubW9kdWxlcy5zZXQobW9kLmlkLCBtb2QpO1xuXG5cdFx0aWYgKG1vZC5jYXRlZ29yeUlEID09PSBcImRlZmF1bHRcIiAmJiB0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcykge1xuXHRcdFx0Y29uc3QgZGlycyA9IHBhdGguZGlybmFtZShmaWxlcGF0aCkuc3BsaXQocGF0aC5zZXApO1xuXHRcdFx0bW9kLmNhdGVnb3J5SUQgPSBkaXJzW2RpcnMubGVuZ3RoIC0gMV07XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmNhdGVnb3JpZXMuaGFzKG1vZC5jYXRlZ29yeUlEKSkge1xuXHRcdFx0dGhpcy5jYXRlZ29yaWVzLnNldChtb2QuY2F0ZWdvcnlJRCwgbmV3IENhdGVnb3J5KG1vZC5jYXRlZ29yeUlEKSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgY2F0ZWdvcnkgPSB0aGlzLmNhdGVnb3JpZXMuZ2V0KG1vZC5jYXRlZ29yeUlEKTtcblx0XHRtb2QuY2F0ZWdvcnkgPSBjYXRlZ29yeTtcblx0XHRjYXRlZ29yeS5zZXQobW9kLmlkLCBtb2QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgcmVsb2FkKGlkOiBzdHJpbmcpOiBBa2Fpcm9Nb2R1bGUge1xuXHRcdGNvbnN0IG1vZCA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSk7XG5cdFx0aWYgKCFtb2QpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblx0XHRpZiAoIW1vZC5maWxlcGF0aCkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTk9UX1JFTE9BREFCTEVcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdHRoaXMuZGVyZWdpc3Rlcihtb2QpO1xuXG5cdFx0Y29uc3QgZmlsZXBhdGggPSBtb2QuZmlsZXBhdGg7XG5cdFx0Y29uc3QgbmV3TW9kID0gdGhpcy5sb2FkKGZpbGVwYXRoLCB0cnVlKTtcblx0XHRyZXR1cm4gbmV3TW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIG1vZHVsZXMuXG5cdCAqL1xuXHRwdWJsaWMgcmVsb2FkQWxsKCk6IEFrYWlyb0hhbmRsZXIge1xuXHRcdGZvciAoY29uc3QgbSBvZiBBcnJheS5mcm9tKHRoaXMubW9kdWxlcy52YWx1ZXMoKSkpIHtcblx0XHRcdGlmIChtLmZpbGVwYXRoKSB0aGlzLnJlbG9hZChtLmlkKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZShpZDogc3RyaW5nKTogQWthaXJvTW9kdWxlIHtcblx0XHRjb25zdCBtb2QgPSB0aGlzLm1vZHVsZXMuZ2V0KGlkLnRvU3RyaW5nKCkpO1xuXHRcdGlmICghbW9kKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJNT0RVTEVfTk9UX0ZPVU5EXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHR0aGlzLmRlcmVnaXN0ZXIobW9kKTtcblxuXHRcdHRoaXMuZW1pdChBa2Fpcm9IYW5kbGVyRXZlbnRzLlJFTU9WRSwgbW9kKTtcblx0XHRyZXR1cm4gbW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIG1vZHVsZXMuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlQWxsKCk6IEFrYWlyb0hhbmRsZXIge1xuXHRcdGZvciAoY29uc3QgbSBvZiBBcnJheS5mcm9tKHRoaXMubW9kdWxlcy52YWx1ZXMoKSkpIHtcblx0XHRcdGlmIChtLmZpbGVwYXRoKSB0aGlzLnJlbW92ZShtLmlkKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBmaWxlcyByZWN1cnNpdmVseSBmcm9tIGEgZGlyZWN0b3J5LlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIHJlYWQuXG5cdCAqL1xuXHRzdGF0aWMgcmVhZGRpclJlY3Vyc2l2ZShkaXJlY3Rvcnk6IHN0cmluZyk6IHN0cmluZ1tdIHtcblx0XHRjb25zdCByZXN1bHQgPSBbXTtcblxuXHRcdChmdW5jdGlvbiByZWFkKGRpcikge1xuXHRcdFx0Y29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuXG5cdFx0XHRmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcblx0XHRcdFx0Y29uc3QgZmlsZXBhdGggPSBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcblxuXHRcdFx0XHRpZiAoZnMuc3RhdFN5bmMoZmlsZXBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcblx0XHRcdFx0XHRyZWFkKGZpbGVwYXRoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChmaWxlcGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KShkaXJlY3RvcnkpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgZmlsZXMgd2hlbiBsb2FkaW5nLlxuICogVHJ1ZSBtZWFucyB0aGUgZmlsZSBzaG91bGQgYmUgbG9hZGVkLlxuICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgZmlsZS5cbiAqL1xuZXhwb3J0IHR5cGUgTG9hZFByZWRpY2F0ZSA9IChmaWxlcGF0aDogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIG1vZHVsZSBsb2FkaW5nIGFuZCBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBa2Fpcm9IYW5kbGVyT3B0aW9ucyB7XG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byBzZXQgZWFjaCBtb2R1bGUncyBjYXRlZ29yeSB0byBpdHMgcGFyZW50IGRpcmVjdG9yeSBuYW1lLiAqL1xuXHRhdXRvbWF0ZUNhdGVnb3JpZXM/OiBib29sZWFuO1xuXG5cdC8qKiBPbmx5IGNsYXNzZXMgdGhhdCBleHRlbmRzIHRoaXMgY2xhc3MgY2FuIGJlIGhhbmRsZWQuICovXG5cdGNsYXNzVG9IYW5kbGU/OiB0eXBlb2YgQWthaXJvTW9kdWxlO1xuXG5cdC8qKiBEaXJlY3RvcnkgdG8gbW9kdWxlcy4gKi9cblx0ZGlyZWN0b3J5Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBGaWxlIGV4dGVuc2lvbnMgdG8gbG9hZC5cblx0ICogQnkgZGVmYXVsdCB0aGlzIGlzIC5qcywgLmpzb24sIGFuZCAudHMgZmlsZXMuXG5cdCAqL1xuXHRleHRlbnNpb25zPzogc3RyaW5nW10gfCBTZXQ8c3RyaW5nPjtcblxuXHQvKipcblx0ICogRmlsdGVyIGZvciBmaWxlcyB0byBiZSBsb2FkZWQuXG5cdCAqIENhbiBiZSBzZXQgaW5kaXZpZHVhbGx5IGZvciBlYWNoIGhhbmRsZXIgYnkgb3ZlcnJpZGluZyB0aGUgYGxvYWRBbGxgIG1ldGhvZC5cblx0ICovXG5cdGxvYWRGaWx0ZXI/OiBMb2FkUHJlZGljYXRlO1xufVxuIl19