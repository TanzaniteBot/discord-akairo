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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQWthaXJvSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNFQUE4QztBQUM5QyxpREFBd0Q7QUFDeEQsa0VBQTBDO0FBQzFDLGdFQUF3QztBQUN4QywyQ0FBd0M7QUFDeEMsb0RBQWtDO0FBQ2xDLDRDQUFvQjtBQUNwQixnREFBd0I7QUFLeEI7Ozs7R0FJRztBQUNILE1BQXFCLGFBQWMsU0FBUSxnQkFBWTtJQUN0RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxzQkFBWSxFQUM1QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUNwQyxrQkFBa0IsR0FBRyxLQUFLLEVBQzFCLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQ0Q7UUFFdkIsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUUzQixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUVuQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUU3QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBRWhDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksa0JBQWtCLENBQVU7SUFFbkM7O09BRUc7SUFDSSxVQUFVLENBQXFEO0lBRXRFOztPQUVHO0lBQ0ksYUFB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QUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3pCLE1BQU0sUUFBUSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUV0QyxJQUFJLFlBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ3hDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDZjtxQkFBTTtvQkFDTixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN0QjthQUNEO1FBQ0YsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFZCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7Q0FDRDtBQXZQRCxnQ0F1UEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCB7IEFrYWlyb0hhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUgZnJvbSBcIi4vQWthaXJvTW9kdWxlXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi9Ba2Fpcm9DbGllbnRcIjtcblxuZXhwb3J0IHR5cGUgU3RhdGljPE0+ID0geyAoKTogTSB9O1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGhhbmRsaW5nIG1vZHVsZXMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIG1vZHVsZSBsb2FkaW5nIGFuZCBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvSGFuZGxlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQWthaXJvTW9kdWxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi5qc29uXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzID0gZmFsc2UsXG5cdFx0XHRsb2FkRmlsdGVyID0gKCkgPT4gdHJ1ZVxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zXG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmNsaWVudCA9IGNsaWVudDtcblxuXHRcdHRoaXMuZGlyZWN0b3J5ID0gZGlyZWN0b3J5O1xuXG5cdFx0dGhpcy5jbGFzc1RvSGFuZGxlID0gY2xhc3NUb0hhbmRsZTtcblxuXHRcdHRoaXMuZXh0ZW5zaW9ucyA9IG5ldyBTZXQoZXh0ZW5zaW9ucyk7XG5cblx0XHR0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcyA9IEJvb2xlYW4oYXV0b21hdGVDYXRlZ29yaWVzKTtcblxuXHRcdHRoaXMubG9hZEZpbHRlciA9IGxvYWRGaWx0ZXI7XG5cblx0XHR0aGlzLm1vZHVsZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5jYXRlZ29yaWVzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhdXRvbWF0ZSBjYXRlZ29yeSBuYW1lcy5cblx0ICovXG5cdHB1YmxpYyBhdXRvbWF0ZUNhdGVnb3JpZXM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBBa2Fpcm9Nb2R1bGU7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBUaGUgbWFpbiBkaXJlY3RvcnkgdG8gbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogRmlsZSBleHRlbnNpb25zIHRvIGxvYWQuXG5cdCAqL1xuXHRwdWJsaWMgZXh0ZW5zaW9uczogU2V0PHN0cmluZz47XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRoYXQgZmlsdGVycyBmaWxlcyB3aGVuIGxvYWRpbmcuXG5cdCAqL1xuXHRwdWJsaWMgbG9hZEZpbHRlcjogTG9hZFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogTW9kdWxlcyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byBBa2Fpcm9Nb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIEFrYWlyb01vZHVsZT47XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbW9kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBkZXJlZ2lzdGVyKG1vZDogQWthaXJvTW9kdWxlKTogdm9pZCB7XG5cdFx0aWYgKG1vZC5maWxlcGF0aCkgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKG1vZC5maWxlcGF0aCldO1xuXHRcdHRoaXMubW9kdWxlcy5kZWxldGUobW9kLmlkKTtcblx0XHRtb2QuY2F0ZWdvcnkuZGVsZXRlKG1vZC5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjYXRlZ29yeSBieSBuYW1lLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIGZpbmRDYXRlZ29yeShuYW1lOiBzdHJpbmcpOiBDYXRlZ29yeTxzdHJpbmcsIEFrYWlyb01vZHVsZT4ge1xuXHRcdHJldHVybiB0aGlzLmNhdGVnb3JpZXMuZmluZChjYXRlZ29yeSA9PiB7XG5cdFx0XHRyZXR1cm4gY2F0ZWdvcnkuaWQudG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGEgbW9kdWxlLCBjYW4gYmUgYSBtb2R1bGUgY2xhc3Mgb3IgYSBmaWxlcGF0aC5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIGNsYXNzIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKiBAcGFyYW0gaXNSZWxvYWQgLSBXaGV0aGVyIHRoaXMgaXMgYSByZWxvYWQgb3Igbm90LlxuXHQgKi9cblx0cHVibGljIGxvYWQodGhpbmc6IHN0cmluZyB8IEFrYWlyb01vZHVsZSwgaXNSZWxvYWQgPSBmYWxzZSk6IEFrYWlyb01vZHVsZSB7XG5cdFx0Y29uc3QgaXNDbGFzcyA9IHR5cGVvZiB0aGluZyA9PT0gXCJmdW5jdGlvblwiO1xuXHRcdGlmICghaXNDbGFzcyAmJiAhdGhpcy5leHRlbnNpb25zLmhhcyhwYXRoLmV4dG5hbWUodGhpbmcgYXMgc3RyaW5nKSkpXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG1vZCA9IGlzQ2xhc3Ncblx0XHRcdD8gdGhpbmdcblx0XHRcdDogZnVuY3Rpb24gZmluZEV4cG9ydChtKSB7XG5cdFx0XHRcdFx0aWYgKCFtKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0XHRpZiAobS5wcm90b3R5cGUgaW5zdGFuY2VvZiB0aGlzLmNsYXNzVG9IYW5kbGUpIHJldHVybiBtO1xuXHRcdFx0XHRcdHJldHVybiBtLmRlZmF1bHQgPyBmaW5kRXhwb3J0LmNhbGwodGhpcywgbS5kZWZhdWx0KSA6IG51bGw7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcblx0XHRcdCAgfS5jYWxsKHRoaXMsIHJlcXVpcmUodGhpbmcgYXMgc3RyaW5nKSk7XG5cblx0XHRpZiAobW9kICYmIG1vZC5wcm90b3R5cGUgaW5zdGFuY2VvZiB0aGlzLmNsYXNzVG9IYW5kbGUpIHtcblx0XHRcdG1vZCA9IG5ldyBtb2QodGhpcyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIWlzQ2xhc3MpIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZSh0aGluZyBhcyBzdHJpbmcpXTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMubW9kdWxlcy5oYXMobW9kLmlkKSlcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMUkVBRFlfTE9BREVEXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBtb2QuaWQpO1xuXHRcdHRoaXMucmVnaXN0ZXIobW9kLCBpc0NsYXNzID8gbnVsbCA6ICh0aGluZyBhcyBzdHJpbmcpKTtcblx0XHR0aGlzLmVtaXQoQWthaXJvSGFuZGxlckV2ZW50cy5MT0FELCBtb2QsIGlzUmVsb2FkKTtcblx0XHRyZXR1cm4gbW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBtb2R1bGVzIGZyb20gYSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLlxuXHQgKiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqIERlZmF1bHRzIHRvIHRoZSBmaWx0ZXIgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICovXG5cdHB1YmxpYyBsb2FkQWxsKFxuXHRcdGRpcmVjdG9yeTogc3RyaW5nID0gdGhpcy5kaXJlY3RvcnksXG5cdFx0ZmlsdGVyOiBMb2FkUHJlZGljYXRlID0gdGhpcy5sb2FkRmlsdGVyIHx8ICgoKSA9PiB0cnVlKVxuXHQpOiBBa2Fpcm9IYW5kbGVyIHtcblx0XHRjb25zdCBmaWxlcGF0aHMgPSBBa2Fpcm9IYW5kbGVyLnJlYWRkaXJSZWN1cnNpdmUoZGlyZWN0b3J5KTtcblx0XHRmb3IgKGxldCBmaWxlcGF0aCBvZiBmaWxlcGF0aHMpIHtcblx0XHRcdGZpbGVwYXRoID0gcGF0aC5yZXNvbHZlKGZpbGVwYXRoKTtcblx0XHRcdGlmIChmaWx0ZXIoZmlsZXBhdGgpKSB0aGlzLmxvYWQoZmlsZXBhdGgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIG1vZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZWdpc3Rlcihtb2Q6IEFrYWlyb01vZHVsZSwgZmlsZXBhdGg6IHN0cmluZyk6IHZvaWQge1xuXHRcdG1vZC5maWxlcGF0aCA9IGZpbGVwYXRoO1xuXHRcdG1vZC5jbGllbnQgPSB0aGlzLmNsaWVudDtcblx0XHRtb2QuaGFuZGxlciA9IHRoaXM7XG5cdFx0dGhpcy5tb2R1bGVzLnNldChtb2QuaWQsIG1vZCk7XG5cblx0XHRpZiAobW9kLmNhdGVnb3J5SUQgPT09IFwiZGVmYXVsdFwiICYmIHRoaXMuYXV0b21hdGVDYXRlZ29yaWVzKSB7XG5cdFx0XHRjb25zdCBkaXJzID0gcGF0aC5kaXJuYW1lKGZpbGVwYXRoKS5zcGxpdChwYXRoLnNlcCk7XG5cdFx0XHRtb2QuY2F0ZWdvcnlJRCA9IGRpcnNbZGlycy5sZW5ndGggLSAxXTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuY2F0ZWdvcmllcy5oYXMobW9kLmNhdGVnb3J5SUQpKSB7XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHR0aGlzLmNhdGVnb3JpZXMuc2V0KG1vZC5jYXRlZ29yeUlELCBuZXcgQ2F0ZWdvcnkobW9kLmNhdGVnb3J5SUQpKTtcblx0XHR9XG5cblx0XHRjb25zdCBjYXRlZ29yeSA9IHRoaXMuY2F0ZWdvcmllcy5nZXQobW9kLmNhdGVnb3J5SUQpO1xuXHRcdG1vZC5jYXRlZ29yeSA9IGNhdGVnb3J5O1xuXHRcdGNhdGVnb3J5LnNldChtb2QuaWQsIG1vZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZWxvYWQoaWQ6IHN0cmluZyk6IEFrYWlyb01vZHVsZSB7XG5cdFx0Y29uc3QgbW9kID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIW1vZClcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblx0XHRpZiAoIW1vZC5maWxlcGF0aClcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk5PVF9SRUxPQURBQkxFXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHR0aGlzLmRlcmVnaXN0ZXIobW9kKTtcblxuXHRcdGNvbnN0IGZpbGVwYXRoID0gbW9kLmZpbGVwYXRoO1xuXHRcdGNvbnN0IG5ld01vZCA9IHRoaXMubG9hZChmaWxlcGF0aCwgdHJ1ZSk7XG5cdFx0cmV0dXJuIG5ld01vZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBtb2R1bGVzLlxuXHQgKi9cblx0cHVibGljIHJlbG9hZEFsbCgpOiBBa2Fpcm9IYW5kbGVyIHtcblx0XHRmb3IgKGNvbnN0IG0gb2YgQXJyYXkuZnJvbSh0aGlzLm1vZHVsZXMudmFsdWVzKCkpKSB7XG5cdFx0XHRpZiAobS5maWxlcGF0aCkgdGhpcy5yZWxvYWQobS5pZCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmUoaWQ6IHN0cmluZyk6IEFrYWlyb01vZHVsZSB7XG5cdFx0Y29uc3QgbW9kID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIW1vZClcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdHRoaXMuZGVyZWdpc3Rlcihtb2QpO1xuXG5cdFx0dGhpcy5lbWl0KEFrYWlyb0hhbmRsZXJFdmVudHMuUkVNT1ZFLCBtb2QpO1xuXHRcdHJldHVybiBtb2Q7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVBbGwoKTogQWthaXJvSGFuZGxlciB7XG5cdFx0Zm9yIChjb25zdCBtIG9mIEFycmF5LmZyb20odGhpcy5tb2R1bGVzLnZhbHVlcygpKSkge1xuXHRcdFx0aWYgKG0uZmlsZXBhdGgpIHRoaXMucmVtb3ZlKG0uaWQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGZpbGVzIHJlY3Vyc2l2ZWx5IGZyb20gYSBkaXJlY3RvcnkuXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gcmVhZC5cblx0ICovXG5cdHN0YXRpYyByZWFkZGlyUmVjdXJzaXZlKGRpcmVjdG9yeTogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdFx0KGZ1bmN0aW9uIHJlYWQoZGlyKSB7XG5cdFx0XHRjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG5cblx0XHRcdGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuXHRcdFx0XHRjb25zdCBmaWxlcGF0aCA9IHBhdGguam9pbihkaXIsIGZpbGUpO1xuXG5cdFx0XHRcdGlmIChmcy5zdGF0U3luYyhmaWxlcGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuXHRcdFx0XHRcdHJlYWQoZmlsZXBhdGgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKGZpbGVwYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKGRpcmVjdG9yeSk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGZpbHRlcmluZyBmaWxlcyB3aGVuIGxvYWRpbmcuXG4gKiBUcnVlIG1lYW5zIHRoZSBmaWxlIHNob3VsZCBiZSBsb2FkZWQuXG4gKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBmaWxlLlxuICovXG5leHBvcnQgdHlwZSBMb2FkUHJlZGljYXRlID0gKGZpbGVwYXRoOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgbW9kdWxlIGxvYWRpbmcgYW5kIGhhbmRsaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFrYWlyb0hhbmRsZXJPcHRpb25zIHtcblx0LyoqIFdoZXRoZXIgb3Igbm90IHRvIHNldCBlYWNoIG1vZHVsZSdzIGNhdGVnb3J5IHRvIGl0cyBwYXJlbnQgZGlyZWN0b3J5IG5hbWUuICovXG5cdGF1dG9tYXRlQ2F0ZWdvcmllcz86IGJvb2xlYW47XG5cblx0LyoqIE9ubHkgY2xhc3NlcyB0aGF0IGV4dGVuZHMgdGhpcyBjbGFzcyBjYW4gYmUgaGFuZGxlZC4gKi9cblx0Y2xhc3NUb0hhbmRsZT86IHR5cGVvZiBBa2Fpcm9Nb2R1bGU7XG5cblx0LyoqIERpcmVjdG9yeSB0byBtb2R1bGVzLiAqL1xuXHRkaXJlY3Rvcnk/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEZpbGUgZXh0ZW5zaW9ucyB0byBsb2FkLlxuXHQgKiBCeSBkZWZhdWx0IHRoaXMgaXMgLmpzLCAuanNvbiwgYW5kIC50cyBmaWxlcy5cblx0ICovXG5cdGV4dGVuc2lvbnM/OiBzdHJpbmdbXSB8IFNldDxzdHJpbmc+O1xuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgZm9yIGZpbGVzIHRvIGJlIGxvYWRlZC5cblx0ICogQ2FuIGJlIHNldCBpbmRpdmlkdWFsbHkgZm9yIGVhY2ggaGFuZGxlciBieSBvdmVycmlkaW5nIHRoZSBgbG9hZEFsbGAgbWV0aG9kLlxuXHQgKi9cblx0bG9hZEZpbHRlcj86IExvYWRQcmVkaWNhdGU7XG59XG4iXX0=