"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQWthaXJvSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHNFQUE4QztBQUM5QyxpREFBd0Q7QUFDeEQsa0VBQTBDO0FBQzFDLGdFQUF3QztBQUN4QywyQ0FBd0M7QUFDeEMsb0RBQWtDO0FBQ2xDLDRDQUFvQjtBQUNwQixnREFBd0I7QUFLeEI7Ozs7R0FJRztBQUNILE1BQXFCLGFBQWMsU0FBUSxnQkFBWTtJQUN0RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxzQkFBWSxFQUM1QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUNwQyxrQkFBa0IsR0FBRyxLQUFLLEVBQzFCLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQ0Q7UUFFdkIsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUUzQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUVuQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUU3QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBRWhDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksa0JBQWtCLENBQVU7SUFFbkM7O09BRUc7SUFDSSxVQUFVLENBQXFEO0lBRXRFOztPQUVHO0lBQ0ks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QUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3pCLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLFlBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDZjtxQkFBTTtvQkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN0QjthQUNEO1FBQ0YsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFZCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7Q0FDRDtBQWxQRCxnQ0FrUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCB7IEFrYWlyb0hhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUgZnJvbSBcIi4vQWthaXJvTW9kdWxlXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi9Ba2Fpcm9DbGllbnRcIjtcblxuZXhwb3J0IHR5cGUgU3RhdGljPE0+ID0geyAoKTogTSB9O1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGhhbmRsaW5nIG1vZHVsZXMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIG1vZHVsZSBsb2FkaW5nIGFuZCBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvSGFuZGxlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQWthaXJvTW9kdWxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi5qc29uXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzID0gZmFsc2UsXG5cdFx0XHRsb2FkRmlsdGVyID0gKCkgPT4gdHJ1ZVxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zXG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmNsaWVudCA9IGNsaWVudDtcblxuXHRcdHRoaXMuZGlyZWN0b3J5ID0gZGlyZWN0b3J5O1xuXG5cdFx0dGhpcy5jbGFzc1RvSGFuZGxlID0gY2xhc3NUb0hhbmRsZTtcblxuXHRcdHRoaXMuZXh0ZW5zaW9ucyA9IG5ldyBTZXQoZXh0ZW5zaW9ucyk7XG5cblx0XHR0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcyA9IEJvb2xlYW4oYXV0b21hdGVDYXRlZ29yaWVzKTtcblxuXHRcdHRoaXMubG9hZEZpbHRlciA9IGxvYWRGaWx0ZXI7XG5cblx0XHR0aGlzLm1vZHVsZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5jYXRlZ29yaWVzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhdXRvbWF0ZSBjYXRlZ29yeSBuYW1lcy5cblx0ICovXG5cdHB1YmxpYyBhdXRvbWF0ZUNhdGVnb3JpZXM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBBa2Fpcm9Nb2R1bGU7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBUaGUgbWFpbiBkaXJlY3RvcnkgdG8gbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogRmlsZSBleHRlbnNpb25zIHRvIGxvYWQuXG5cdCAqL1xuXHRwdWJsaWMgZXh0ZW5zaW9uczogU2V0PHN0cmluZz47XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRoYXQgZmlsdGVycyBmaWxlcyB3aGVuIGxvYWRpbmcuXG5cdCAqL1xuXHRwdWJsaWMgbG9hZEZpbHRlcjogTG9hZFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogTW9kdWxlcyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byBBa2Fpcm9Nb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIEFrYWlyb01vZHVsZT47XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbW9kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBkZXJlZ2lzdGVyKG1vZDogQWthaXJvTW9kdWxlKTogdm9pZCB7XG5cdFx0aWYgKG1vZC5maWxlcGF0aCkgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKG1vZC5maWxlcGF0aCldO1xuXHRcdHRoaXMubW9kdWxlcy5kZWxldGUobW9kLmlkKTtcblx0XHRtb2QuY2F0ZWdvcnkuZGVsZXRlKG1vZC5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjYXRlZ29yeSBieSBuYW1lLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIGZpbmRDYXRlZ29yeShuYW1lOiBzdHJpbmcpOiBDYXRlZ29yeTxzdHJpbmcsIEFrYWlyb01vZHVsZT4ge1xuXHRcdHJldHVybiB0aGlzLmNhdGVnb3JpZXMuZmluZChjYXRlZ29yeSA9PiB7XG5cdFx0XHRyZXR1cm4gY2F0ZWdvcnkuaWQudG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGEgbW9kdWxlLCBjYW4gYmUgYSBtb2R1bGUgY2xhc3Mgb3IgYSBmaWxlcGF0aC5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIGNsYXNzIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKiBAcGFyYW0gaXNSZWxvYWQgLSBXaGV0aGVyIHRoaXMgaXMgYSByZWxvYWQgb3Igbm90LlxuXHQgKi9cblx0cHVibGljIGxvYWQodGhpbmc6IHN0cmluZyB8IEFrYWlyb01vZHVsZSwgaXNSZWxvYWQgPSBmYWxzZSk6IEFrYWlyb01vZHVsZSB7XG5cdFx0Y29uc3QgaXNDbGFzcyA9IHR5cGVvZiB0aGluZyA9PT0gXCJmdW5jdGlvblwiO1xuXHRcdGlmICghaXNDbGFzcyAmJiAhdGhpcy5leHRlbnNpb25zLmhhcyhwYXRoLmV4dG5hbWUodGhpbmcgYXMgc3RyaW5nKSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbW9kID0gaXNDbGFzc1xuXHRcdFx0PyB0aGluZ1xuXHRcdFx0OiBmdW5jdGlvbiBmaW5kRXhwb3J0KG0pIHtcblx0XHRcdFx0XHRpZiAoIW0pIHJldHVybiBudWxsO1xuXHRcdFx0XHRcdGlmIChtLnByb3RvdHlwZSBpbnN0YW5jZW9mIHRoaXMuY2xhc3NUb0hhbmRsZSkgcmV0dXJuIG07XG5cdFx0XHRcdFx0cmV0dXJuIG0uZGVmYXVsdCA/IGZpbmRFeHBvcnQuY2FsbCh0aGlzLCBtLmRlZmF1bHQpIDogbnVsbDtcblx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuXHRcdFx0ICB9LmNhbGwodGhpcywgcmVxdWlyZSh0aGluZyBhcyBzdHJpbmcpKTtcblxuXHRcdGlmIChtb2QgJiYgbW9kLnByb3RvdHlwZSBpbnN0YW5jZW9mIHRoaXMuY2xhc3NUb0hhbmRsZSkge1xuXHRcdFx0bW9kID0gbmV3IG1vZCh0aGlzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuZXctY2FwXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghaXNDbGFzcykgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKHRoaW5nIGFzIHN0cmluZyldO1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5tb2R1bGVzLmhhcyhtb2QuaWQpKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJBTFJFQURZX0xPQURFRFwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgbW9kLmlkKTtcblx0XHR0aGlzLnJlZ2lzdGVyKG1vZCwgaXNDbGFzcyA/IG51bGwgOiAodGhpbmcgYXMgc3RyaW5nKSk7XG5cdFx0dGhpcy5lbWl0KEFrYWlyb0hhbmRsZXJFdmVudHMuTE9BRCwgbW9kLCBpc1JlbG9hZCk7XG5cdFx0cmV0dXJuIG1vZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgbW9kdWxlcyBmcm9tIGEgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS5cblx0ICogRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKiBEZWZhdWx0cyB0byB0aGUgZmlsdGVyIHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqL1xuXHRwdWJsaWMgbG9hZEFsbChcblx0XHRkaXJlY3Rvcnk6IHN0cmluZyA9IHRoaXMuZGlyZWN0b3J5LFxuXHRcdGZpbHRlcjogTG9hZFByZWRpY2F0ZSA9IHRoaXMubG9hZEZpbHRlciB8fCAoKCkgPT4gdHJ1ZSlcblx0KTogQWthaXJvSGFuZGxlciB7XG5cdFx0Y29uc3QgZmlsZXBhdGhzID0gQWthaXJvSGFuZGxlci5yZWFkZGlyUmVjdXJzaXZlKGRpcmVjdG9yeSk7XG5cdFx0Zm9yIChsZXQgZmlsZXBhdGggb2YgZmlsZXBhdGhzKSB7XG5cdFx0XHRmaWxlcGF0aCA9IHBhdGgucmVzb2x2ZShmaWxlcGF0aCk7XG5cdFx0XHRpZiAoZmlsdGVyKGZpbGVwYXRoKSkgdGhpcy5sb2FkKGZpbGVwYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBtb2QgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgcmVnaXN0ZXIobW9kOiBBa2Fpcm9Nb2R1bGUsIGZpbGVwYXRoOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRtb2QuZmlsZXBhdGggPSBmaWxlcGF0aDtcblx0XHRtb2QuY2xpZW50ID0gdGhpcy5jbGllbnQ7XG5cdFx0bW9kLmhhbmRsZXIgPSB0aGlzO1xuXHRcdHRoaXMubW9kdWxlcy5zZXQobW9kLmlkLCBtb2QpO1xuXG5cdFx0aWYgKG1vZC5jYXRlZ29yeUlEID09PSBcImRlZmF1bHRcIiAmJiB0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcykge1xuXHRcdFx0Y29uc3QgZGlycyA9IHBhdGguZGlybmFtZShmaWxlcGF0aCkuc3BsaXQocGF0aC5zZXApO1xuXHRcdFx0bW9kLmNhdGVnb3J5SUQgPSBkaXJzW2RpcnMubGVuZ3RoIC0gMV07XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmNhdGVnb3JpZXMuaGFzKG1vZC5jYXRlZ29yeUlEKSkge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0dGhpcy5jYXRlZ29yaWVzLnNldChtb2QuY2F0ZWdvcnlJRCwgbmV3IENhdGVnb3J5KG1vZC5jYXRlZ29yeUlEKSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgY2F0ZWdvcnkgPSB0aGlzLmNhdGVnb3JpZXMuZ2V0KG1vZC5jYXRlZ29yeUlEKTtcblx0XHRtb2QuY2F0ZWdvcnkgPSBjYXRlZ29yeTtcblx0XHRjYXRlZ29yeS5zZXQobW9kLmlkLCBtb2QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgcmVsb2FkKGlkOiBzdHJpbmcpOiBBa2Fpcm9Nb2R1bGUge1xuXHRcdGNvbnN0IG1vZCA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSk7XG5cdFx0aWYgKCFtb2QpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblx0XHRpZiAoIW1vZC5maWxlcGF0aCkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTk9UX1JFTE9BREFCTEVcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdHRoaXMuZGVyZWdpc3Rlcihtb2QpO1xuXG5cdFx0Y29uc3QgZmlsZXBhdGggPSBtb2QuZmlsZXBhdGg7XG5cdFx0Y29uc3QgbmV3TW9kID0gdGhpcy5sb2FkKGZpbGVwYXRoLCB0cnVlKTtcblx0XHRyZXR1cm4gbmV3TW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIG1vZHVsZXMuXG5cdCAqL1xuXHRwdWJsaWMgcmVsb2FkQWxsKCk6IEFrYWlyb0hhbmRsZXIge1xuXHRcdGZvciAoY29uc3QgbSBvZiBBcnJheS5mcm9tKHRoaXMubW9kdWxlcy52YWx1ZXMoKSkpIHtcblx0XHRcdGlmIChtLmZpbGVwYXRoKSB0aGlzLnJlbG9hZChtLmlkKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZShpZDogc3RyaW5nKTogQWthaXJvTW9kdWxlIHtcblx0XHRjb25zdCBtb2QgPSB0aGlzLm1vZHVsZXMuZ2V0KGlkLnRvU3RyaW5nKCkpO1xuXHRcdGlmICghbW9kKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJNT0RVTEVfTk9UX0ZPVU5EXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHR0aGlzLmRlcmVnaXN0ZXIobW9kKTtcblxuXHRcdHRoaXMuZW1pdChBa2Fpcm9IYW5kbGVyRXZlbnRzLlJFTU9WRSwgbW9kKTtcblx0XHRyZXR1cm4gbW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIG1vZHVsZXMuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlQWxsKCk6IEFrYWlyb0hhbmRsZXIge1xuXHRcdGZvciAoY29uc3QgbSBvZiBBcnJheS5mcm9tKHRoaXMubW9kdWxlcy52YWx1ZXMoKSkpIHtcblx0XHRcdGlmIChtLmZpbGVwYXRoKSB0aGlzLnJlbW92ZShtLmlkKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBmaWxlcyByZWN1cnNpdmVseSBmcm9tIGEgZGlyZWN0b3J5LlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIHJlYWQuXG5cdCAqL1xuXHRzdGF0aWMgcmVhZGRpclJlY3Vyc2l2ZShkaXJlY3Rvcnk6IHN0cmluZyk6IHN0cmluZ1tdIHtcblx0XHRjb25zdCByZXN1bHQgPSBbXTtcblxuXHRcdChmdW5jdGlvbiByZWFkKGRpcikge1xuXHRcdFx0Y29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuXG5cdFx0XHRmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcblx0XHRcdFx0Y29uc3QgZmlsZXBhdGggPSBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcblxuXHRcdFx0XHRpZiAoZnMuc3RhdFN5bmMoZmlsZXBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcblx0XHRcdFx0XHRyZWFkKGZpbGVwYXRoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChmaWxlcGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KShkaXJlY3RvcnkpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgZmlsZXMgd2hlbiBsb2FkaW5nLlxuICogVHJ1ZSBtZWFucyB0aGUgZmlsZSBzaG91bGQgYmUgbG9hZGVkLlxuICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgZmlsZS5cbiAqL1xuZXhwb3J0IHR5cGUgTG9hZFByZWRpY2F0ZSA9IChmaWxlcGF0aDogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIG1vZHVsZSBsb2FkaW5nIGFuZCBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBa2Fpcm9IYW5kbGVyT3B0aW9ucyB7XG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byBzZXQgZWFjaCBtb2R1bGUncyBjYXRlZ29yeSB0byBpdHMgcGFyZW50IGRpcmVjdG9yeSBuYW1lLiAqL1xuXHRhdXRvbWF0ZUNhdGVnb3JpZXM/OiBib29sZWFuO1xuXG5cdC8qKiBPbmx5IGNsYXNzZXMgdGhhdCBleHRlbmRzIHRoaXMgY2xhc3MgY2FuIGJlIGhhbmRsZWQuICovXG5cdGNsYXNzVG9IYW5kbGU/OiB0eXBlb2YgQWthaXJvTW9kdWxlO1xuXG5cdC8qKiBEaXJlY3RvcnkgdG8gbW9kdWxlcy4gKi9cblx0ZGlyZWN0b3J5Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBGaWxlIGV4dGVuc2lvbnMgdG8gbG9hZC5cblx0ICogQnkgZGVmYXVsdCB0aGlzIGlzIC5qcywgLmpzb24sIGFuZCAudHMgZmlsZXMuXG5cdCAqL1xuXHRleHRlbnNpb25zPzogc3RyaW5nW10gfCBTZXQ8c3RyaW5nPjtcblxuXHQvKipcblx0ICogRmlsdGVyIGZvciBmaWxlcyB0byBiZSBsb2FkZWQuXG5cdCAqIENhbiBiZSBzZXQgaW5kaXZpZHVhbGx5IGZvciBlYWNoIGhhbmRsZXIgYnkgb3ZlcnJpZGluZyB0aGUgYGxvYWRBbGxgIG1ldGhvZC5cblx0ICovXG5cdGxvYWRGaWx0ZXI/OiBMb2FkUHJlZGljYXRlO1xufVxuIl19