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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQWthaXJvSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF3QztBQUN4QyxvREFBa0M7QUFDbEMsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4QixzRUFBOEM7QUFDOUMsZ0VBQXdDO0FBQ3hDLGlEQUF3RDtBQUV4RCxrRUFBMEM7QUFJMUM7Ozs7R0FJRztBQUNILE1BQXFCLGFBQWMsU0FBUSxnQkFBWTtJQUN0RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxzQkFBWSxFQUM1QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUNwQyxrQkFBa0IsR0FBRyxLQUFLLEVBQzFCLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQ0Q7UUFFdkIsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVUsQ0FBQztRQUU1QixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUVuQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUU3QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBRWhDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksa0JBQWtCLENBQVU7SUFFbkM7O09BRUc7SUFDSSxVQUFVLENBQXFEO0lBRXRFOztPQUVHO0lBQ0ks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RUFBRTtnQkFDekIsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRXRDLElBQUksWUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNmO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3RCO2FBQ0Q7UUFDRixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVkLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUNEO0FBalBELGdDQWlQQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCB7IEFrYWlyb0hhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvTW9kdWxlIGZyb20gXCIuL0FrYWlyb01vZHVsZVwiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWM8TT4gPSB7ICgpOiBNIH07XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgaGFuZGxpbmcgbW9kdWxlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgbW9kdWxlIGxvYWRpbmcgYW5kIGhhbmRsaW5nLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBa2Fpcm9IYW5kbGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNsaWVudDogQWthaXJvQ2xpZW50LFxuXHRcdHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUgPSBBa2Fpcm9Nb2R1bGUsXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLmpzb25cIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMgPSBmYWxzZSxcblx0XHRcdGxvYWRGaWx0ZXIgPSAoKSA9PiB0cnVlXG5cdFx0fTogQWthaXJvSGFuZGxlck9wdGlvbnNcblx0KSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuY2xpZW50ID0gY2xpZW50O1xuXG5cdFx0dGhpcy5kaXJlY3RvcnkgPSBkaXJlY3RvcnkhO1xuXG5cdFx0dGhpcy5jbGFzc1RvSGFuZGxlID0gY2xhc3NUb0hhbmRsZTtcblxuXHRcdHRoaXMuZXh0ZW5zaW9ucyA9IG5ldyBTZXQoZXh0ZW5zaW9ucyk7XG5cblx0XHR0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcyA9IEJvb2xlYW4oYXV0b21hdGVDYXRlZ29yaWVzKTtcblxuXHRcdHRoaXMubG9hZEZpbHRlciA9IGxvYWRGaWx0ZXI7XG5cblx0XHR0aGlzLm1vZHVsZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5jYXRlZ29yaWVzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhdXRvbWF0ZSBjYXRlZ29yeSBuYW1lcy5cblx0ICovXG5cdHB1YmxpYyBhdXRvbWF0ZUNhdGVnb3JpZXM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBBa2Fpcm9Nb2R1bGU7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBUaGUgbWFpbiBkaXJlY3RvcnkgdG8gbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogRmlsZSBleHRlbnNpb25zIHRvIGxvYWQuXG5cdCAqL1xuXHRwdWJsaWMgZXh0ZW5zaW9uczogU2V0PHN0cmluZz47XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRoYXQgZmlsdGVycyBmaWxlcyB3aGVuIGxvYWRpbmcuXG5cdCAqL1xuXHRwdWJsaWMgbG9hZEZpbHRlcjogTG9hZFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogTW9kdWxlcyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byBBa2Fpcm9Nb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIEFrYWlyb01vZHVsZT47XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbW9kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBkZXJlZ2lzdGVyKG1vZDogQWthaXJvTW9kdWxlKTogdm9pZCB7XG5cdFx0aWYgKG1vZC5maWxlcGF0aCkgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKG1vZC5maWxlcGF0aCldO1xuXHRcdHRoaXMubW9kdWxlcy5kZWxldGUobW9kLmlkKTtcblx0XHRtb2QuY2F0ZWdvcnkhLmRlbGV0ZShtb2QuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY2F0ZWdvcnkgYnkgbmFtZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBmaW5kQ2F0ZWdvcnkobmFtZTogc3RyaW5nKTogQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+IHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5jYXRlZ29yaWVzLmZpbmQoY2F0ZWdvcnkgPT4ge1xuXHRcdFx0cmV0dXJuIGNhdGVnb3J5LmlkLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIG1vZHVsZSwgY2FuIGJlIGEgbW9kdWxlIGNsYXNzIG9yIGEgZmlsZXBhdGguXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBjbGFzcyBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICogQHBhcmFtIGlzUmVsb2FkIC0gV2hldGhlciB0aGlzIGlzIGEgcmVsb2FkIG9yIG5vdC5cblx0ICovXG5cdHB1YmxpYyBsb2FkKHRoaW5nOiBzdHJpbmcgfCBBa2Fpcm9Nb2R1bGUsIGlzUmVsb2FkID0gZmFsc2UpOiBBa2Fpcm9Nb2R1bGUgfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IGlzQ2xhc3MgPSB0eXBlb2YgdGhpbmcgPT09IFwiZnVuY3Rpb25cIjtcblx0XHRpZiAoIWlzQ2xhc3MgJiYgIXRoaXMuZXh0ZW5zaW9ucy5oYXMocGF0aC5leHRuYW1lKHRoaW5nIGFzIHN0cmluZykpKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG1vZCA9IGlzQ2xhc3Ncblx0XHRcdD8gdGhpbmdcblx0XHRcdDogZnVuY3Rpb24gZmluZEV4cG9ydCh0aGlzOiBhbnksIG06IGFueSk6IGFueSB7XG5cdFx0XHRcdFx0aWYgKCFtKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0XHRpZiAobS5wcm90b3R5cGUgaW5zdGFuY2VvZiB0aGlzLmNsYXNzVG9IYW5kbGUpIHJldHVybiBtO1xuXHRcdFx0XHRcdHJldHVybiBtLmRlZmF1bHQgPyBmaW5kRXhwb3J0LmNhbGwodGhpcywgbS5kZWZhdWx0KSA6IG51bGw7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcblx0XHRcdCAgfS5jYWxsKHRoaXMsIHJlcXVpcmUodGhpbmcgYXMgc3RyaW5nKSk7XG5cblx0XHRpZiAobW9kICYmIG1vZC5wcm90b3R5cGUgaW5zdGFuY2VvZiB0aGlzLmNsYXNzVG9IYW5kbGUpIHtcblx0XHRcdG1vZCA9IG5ldyBtb2QodGhpcyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIWlzQ2xhc3MpIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZSh0aGluZyBhcyBzdHJpbmcpXTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMubW9kdWxlcy5oYXMobW9kLmlkKSkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiQUxSRUFEWV9MT0FERURcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIG1vZC5pZCk7XG5cdFx0dGhpcy5yZWdpc3Rlcihtb2QsIGlzQ2xhc3MgPyBudWxsISA6ICh0aGluZyBhcyBzdHJpbmcpKTtcblx0XHR0aGlzLmVtaXQoQWthaXJvSGFuZGxlckV2ZW50cy5MT0FELCBtb2QsIGlzUmVsb2FkKTtcblx0XHRyZXR1cm4gbW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBtb2R1bGVzIGZyb20gYSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLlxuXHQgKiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqIERlZmF1bHRzIHRvIHRoZSBmaWx0ZXIgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICovXG5cdHB1YmxpYyBsb2FkQWxsKFxuXHRcdGRpcmVjdG9yeTogc3RyaW5nID0gdGhpcy5kaXJlY3RvcnkhLFxuXHRcdGZpbHRlcjogTG9hZFByZWRpY2F0ZSA9IHRoaXMubG9hZEZpbHRlciB8fCAoKCkgPT4gdHJ1ZSlcblx0KTogQWthaXJvSGFuZGxlciB7XG5cdFx0Y29uc3QgZmlsZXBhdGhzID0gQWthaXJvSGFuZGxlci5yZWFkZGlyUmVjdXJzaXZlKGRpcmVjdG9yeSk7XG5cdFx0Zm9yIChsZXQgZmlsZXBhdGggb2YgZmlsZXBhdGhzKSB7XG5cdFx0XHRmaWxlcGF0aCA9IHBhdGgucmVzb2x2ZShmaWxlcGF0aCk7XG5cdFx0XHRpZiAoZmlsdGVyKGZpbGVwYXRoKSkgdGhpcy5sb2FkKGZpbGVwYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBtb2QgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgcmVnaXN0ZXIobW9kOiBBa2Fpcm9Nb2R1bGUsIGZpbGVwYXRoPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0bW9kLmZpbGVwYXRoID0gZmlsZXBhdGghO1xuXHRcdG1vZC5jbGllbnQgPSB0aGlzLmNsaWVudDtcblx0XHRtb2QuaGFuZGxlciA9IHRoaXM7XG5cdFx0dGhpcy5tb2R1bGVzLnNldChtb2QuaWQsIG1vZCk7XG5cblx0XHRpZiAobW9kLmNhdGVnb3J5SUQgPT09IFwiZGVmYXVsdFwiICYmIHRoaXMuYXV0b21hdGVDYXRlZ29yaWVzKSB7XG5cdFx0XHRjb25zdCBkaXJzID0gcGF0aC5kaXJuYW1lKGZpbGVwYXRoISkuc3BsaXQocGF0aC5zZXApO1xuXHRcdFx0bW9kLmNhdGVnb3J5SUQgPSBkaXJzW2RpcnMubGVuZ3RoIC0gMV07XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmNhdGVnb3JpZXMuaGFzKG1vZC5jYXRlZ29yeUlEKSkge1xuXHRcdFx0dGhpcy5jYXRlZ29yaWVzLnNldChtb2QuY2F0ZWdvcnlJRCwgbmV3IENhdGVnb3J5KG1vZC5jYXRlZ29yeUlEKSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgY2F0ZWdvcnkgPSB0aGlzLmNhdGVnb3JpZXMuZ2V0KG1vZC5jYXRlZ29yeUlEKSE7XG5cdFx0bW9kLmNhdGVnb3J5ID0gY2F0ZWdvcnk7XG5cdFx0Y2F0ZWdvcnkuc2V0KG1vZC5pZCwgbW9kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIHJlbG9hZChpZDogc3RyaW5nKTogQWthaXJvTW9kdWxlIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBtb2QgPSB0aGlzLm1vZHVsZXMuZ2V0KGlkLnRvU3RyaW5nKCkpO1xuXHRcdGlmICghbW9kKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJNT0RVTEVfTk9UX0ZPVU5EXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cdFx0aWYgKCFtb2QuZmlsZXBhdGgpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk5PVF9SRUxPQURBQkxFXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHR0aGlzLmRlcmVnaXN0ZXIobW9kKTtcblxuXHRcdGNvbnN0IGZpbGVwYXRoID0gbW9kLmZpbGVwYXRoO1xuXHRcdGNvbnN0IG5ld01vZCA9IHRoaXMubG9hZChmaWxlcGF0aCwgdHJ1ZSk7XG5cdFx0cmV0dXJuIG5ld01vZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBtb2R1bGVzLlxuXHQgKi9cblx0cHVibGljIHJlbG9hZEFsbCgpOiBBa2Fpcm9IYW5kbGVyIHtcblx0XHRmb3IgKGNvbnN0IG0gb2YgQXJyYXkuZnJvbSh0aGlzLm1vZHVsZXMudmFsdWVzKCkpKSB7XG5cdFx0XHRpZiAobS5maWxlcGF0aCkgdGhpcy5yZWxvYWQobS5pZCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmUoaWQ6IHN0cmluZyk6IEFrYWlyb01vZHVsZSB7XG5cdFx0Y29uc3QgbW9kID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIW1vZCkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTU9EVUxFX05PVF9GT1VORFwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgaWQpO1xuXG5cdFx0dGhpcy5kZXJlZ2lzdGVyKG1vZCk7XG5cblx0XHR0aGlzLmVtaXQoQWthaXJvSGFuZGxlckV2ZW50cy5SRU1PVkUsIG1vZCk7XG5cdFx0cmV0dXJuIG1vZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBtb2R1bGVzLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZUFsbCgpOiBBa2Fpcm9IYW5kbGVyIHtcblx0XHRmb3IgKGNvbnN0IG0gb2YgQXJyYXkuZnJvbSh0aGlzLm1vZHVsZXMudmFsdWVzKCkpKSB7XG5cdFx0XHRpZiAobS5maWxlcGF0aCkgdGhpcy5yZW1vdmUobS5pZCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgZmlsZXMgcmVjdXJzaXZlbHkgZnJvbSBhIGRpcmVjdG9yeS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byByZWFkLlxuXHQgKi9cblx0c3RhdGljIHJlYWRkaXJSZWN1cnNpdmUoZGlyZWN0b3J5OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0XHQoZnVuY3Rpb24gcmVhZChkaXIpIHtcblx0XHRcdGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZGlyKTtcblxuXHRcdFx0Zm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG5cdFx0XHRcdGNvbnN0IGZpbGVwYXRoID0gcGF0aC5qb2luKGRpciwgZmlsZSk7XG5cblx0XHRcdFx0aWYgKGZzLnN0YXRTeW5jKGZpbGVwYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG5cdFx0XHRcdFx0cmVhZChmaWxlcGF0aCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goZmlsZXBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkoZGlyZWN0b3J5KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGZpbGVzIHdoZW4gbG9hZGluZy5cbiAqIFRydWUgbWVhbnMgdGhlIGZpbGUgc2hvdWxkIGJlIGxvYWRlZC5cbiAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIGZpbGUuXG4gKi9cbmV4cG9ydCB0eXBlIExvYWRQcmVkaWNhdGUgPSAoZmlsZXBhdGg6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBPcHRpb25zIGZvciBtb2R1bGUgbG9hZGluZyBhbmQgaGFuZGxpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWthaXJvSGFuZGxlck9wdGlvbnMge1xuXHQvKiogV2hldGhlciBvciBub3QgdG8gc2V0IGVhY2ggbW9kdWxlJ3MgY2F0ZWdvcnkgdG8gaXRzIHBhcmVudCBkaXJlY3RvcnkgbmFtZS4gKi9cblx0YXV0b21hdGVDYXRlZ29yaWVzPzogYm9vbGVhbjtcblxuXHQvKiogT25seSBjbGFzc2VzIHRoYXQgZXh0ZW5kcyB0aGlzIGNsYXNzIGNhbiBiZSBoYW5kbGVkLiAqL1xuXHRjbGFzc1RvSGFuZGxlPzogdHlwZW9mIEFrYWlyb01vZHVsZTtcblxuXHQvKiogRGlyZWN0b3J5IHRvIG1vZHVsZXMuICovXG5cdGRpcmVjdG9yeT86IHN0cmluZztcblxuXHQvKipcblx0ICogRmlsZSBleHRlbnNpb25zIHRvIGxvYWQuXG5cdCAqIEJ5IGRlZmF1bHQgdGhpcyBpcyAuanMsIC5qc29uLCBhbmQgLnRzIGZpbGVzLlxuXHQgKi9cblx0ZXh0ZW5zaW9ucz86IHN0cmluZ1tdIHwgU2V0PHN0cmluZz47XG5cblx0LyoqXG5cdCAqIEZpbHRlciBmb3IgZmlsZXMgdG8gYmUgbG9hZGVkLlxuXHQgKiBDYW4gYmUgc2V0IGluZGl2aWR1YWxseSBmb3IgZWFjaCBoYW5kbGVyIGJ5IG92ZXJyaWRpbmcgdGhlIGBsb2FkQWxsYCBtZXRob2QuXG5cdCAqL1xuXHRsb2FkRmlsdGVyPzogTG9hZFByZWRpY2F0ZTtcbn1cbiJdfQ==