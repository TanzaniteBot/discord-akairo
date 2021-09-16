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
    async load(thing, isReload = false) {
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
            }.call(this, await eval(`import(${JSON.stringify(thing)})`));
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
    async loadAll(directory = this.directory, filter = this.loadFilter || (() => true)) {
        const filepaths = AkairoHandler.readdirRecursive(directory);
        const promises = [];
        for (let filepath of filepaths) {
            filepath = path_1.default.resolve(filepath);
            if (filter(filepath))
                promises.push(this.load(filepath));
        }
        await Promise.all(promises);
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
    async reload(id) {
        const mod = this.modules.get(id.toString());
        if (!mod)
            throw new AkairoError_1.default("MODULE_NOT_FOUND", this.classToHandle.name, id);
        if (!mod.filepath)
            throw new AkairoError_1.default("NOT_RELOADABLE", this.classToHandle.name, id);
        this.deregister(mod);
        const filepath = mod.filepath;
        const newMod = await this.load(filepath, true);
        return newMod;
    }
    /**
     * Reloads all modules.
     */
    async reloadAll() {
        const promises = [];
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath)
                promises.push(this.reload(m.id));
        }
        await Promise.all(promises);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQWthaXJvSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF3QztBQUN4QyxvREFBa0M7QUFDbEMsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4QixzRUFBOEM7QUFDOUMsZ0VBQXdDO0FBQ3hDLGlEQUF3RDtBQUV4RCxrRUFBMEM7QUFJMUM7Ozs7R0FJRztBQUNILE1BQXFCLGFBQWMsU0FBUSxnQkFBWTtJQUN0RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxzQkFBWSxFQUM1QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUNwQyxrQkFBa0IsR0FBRyxLQUFLLEVBQzFCLFVBQVUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQ0Q7UUFFdkIsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVUsQ0FBQztRQUU1QixJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUVuQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUU3QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1FBRWhDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksa0JBQWtCLENBQVU7SUFFbkM7O09BRUc7SUFDSSxVQUFVLENBQXFEO0lBRXRFOztPQUVHO0lBQ0ks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Q0FBQyxRQUFRO2dCQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQWlCO1FBQ3hDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUVsQixDQUFDLFNBQVMsSUFBSSxDQUFDLEdBQUc7WUFDakIsTUFBTSxLQUFLLEdBQUcsWUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVsQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsTUFBTSxRQUFRLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRXRDLElBQUksWUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNmO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3RCO2FBQ0Q7UUFDRixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVkLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztDQUNEO0FBclBELGdDQXFQQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCB7IEFrYWlyb0hhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvTW9kdWxlIGZyb20gXCIuL0FrYWlyb01vZHVsZVwiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWM8TT4gPSB7ICgpOiBNIH07XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgaGFuZGxpbmcgbW9kdWxlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgbW9kdWxlIGxvYWRpbmcgYW5kIGhhbmRsaW5nLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBa2Fpcm9IYW5kbGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNsaWVudDogQWthaXJvQ2xpZW50LFxuXHRcdHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUgPSBBa2Fpcm9Nb2R1bGUsXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLmpzb25cIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMgPSBmYWxzZSxcblx0XHRcdGxvYWRGaWx0ZXIgPSAoKSA9PiB0cnVlXG5cdFx0fTogQWthaXJvSGFuZGxlck9wdGlvbnNcblx0KSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuY2xpZW50ID0gY2xpZW50O1xuXG5cdFx0dGhpcy5kaXJlY3RvcnkgPSBkaXJlY3RvcnkhO1xuXG5cdFx0dGhpcy5jbGFzc1RvSGFuZGxlID0gY2xhc3NUb0hhbmRsZTtcblxuXHRcdHRoaXMuZXh0ZW5zaW9ucyA9IG5ldyBTZXQoZXh0ZW5zaW9ucyk7XG5cblx0XHR0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcyA9IEJvb2xlYW4oYXV0b21hdGVDYXRlZ29yaWVzKTtcblxuXHRcdHRoaXMubG9hZEZpbHRlciA9IGxvYWRGaWx0ZXI7XG5cblx0XHR0aGlzLm1vZHVsZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5jYXRlZ29yaWVzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhdXRvbWF0ZSBjYXRlZ29yeSBuYW1lcy5cblx0ICovXG5cdHB1YmxpYyBhdXRvbWF0ZUNhdGVnb3JpZXM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBBa2Fpcm9Nb2R1bGU7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBUaGUgbWFpbiBkaXJlY3RvcnkgdG8gbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogRmlsZSBleHRlbnNpb25zIHRvIGxvYWQuXG5cdCAqL1xuXHRwdWJsaWMgZXh0ZW5zaW9uczogU2V0PHN0cmluZz47XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRoYXQgZmlsdGVycyBmaWxlcyB3aGVuIGxvYWRpbmcuXG5cdCAqL1xuXHRwdWJsaWMgbG9hZEZpbHRlcjogTG9hZFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogTW9kdWxlcyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byBBa2Fpcm9Nb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIEFrYWlyb01vZHVsZT47XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbW9kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBkZXJlZ2lzdGVyKG1vZDogQWthaXJvTW9kdWxlKTogdm9pZCB7XG5cdFx0aWYgKG1vZC5maWxlcGF0aCkgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKG1vZC5maWxlcGF0aCldO1xuXHRcdHRoaXMubW9kdWxlcy5kZWxldGUobW9kLmlkKTtcblx0XHRtb2QuY2F0ZWdvcnkhLmRlbGV0ZShtb2QuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY2F0ZWdvcnkgYnkgbmFtZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBmaW5kQ2F0ZWdvcnkobmFtZTogc3RyaW5nKTogQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+IHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5jYXRlZ29yaWVzLmZpbmQoY2F0ZWdvcnkgPT4ge1xuXHRcdFx0cmV0dXJuIGNhdGVnb3J5LmlkLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIG1vZHVsZSwgY2FuIGJlIGEgbW9kdWxlIGNsYXNzIG9yIGEgZmlsZXBhdGguXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBjbGFzcyBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICogQHBhcmFtIGlzUmVsb2FkIC0gV2hldGhlciB0aGlzIGlzIGEgcmVsb2FkIG9yIG5vdC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBsb2FkKHRoaW5nOiBzdHJpbmcgfCBBa2Fpcm9Nb2R1bGUsIGlzUmVsb2FkID0gZmFsc2UpOiBQcm9taXNlPEFrYWlyb01vZHVsZSB8IHVuZGVmaW5lZD4ge1xuXHRcdGNvbnN0IGlzQ2xhc3MgPSB0eXBlb2YgdGhpbmcgPT09IFwiZnVuY3Rpb25cIjtcblx0XHRpZiAoIWlzQ2xhc3MgJiYgIXRoaXMuZXh0ZW5zaW9ucy5oYXMocGF0aC5leHRuYW1lKHRoaW5nIGFzIHN0cmluZykpKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG1vZCA9IGlzQ2xhc3Ncblx0XHRcdD8gdGhpbmdcblx0XHRcdDogZnVuY3Rpb24gZmluZEV4cG9ydCh0aGlzOiBhbnksIG06IGFueSk6IGFueSB7XG5cdFx0XHRcdFx0aWYgKCFtKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0XHRpZiAobS5wcm90b3R5cGUgaW5zdGFuY2VvZiB0aGlzLmNsYXNzVG9IYW5kbGUpIHJldHVybiBtO1xuXHRcdFx0XHRcdHJldHVybiBtLmRlZmF1bHQgPyBmaW5kRXhwb3J0LmNhbGwodGhpcywgbS5kZWZhdWx0KSA6IG51bGw7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcblx0XHRcdCAgfS5jYWxsKHRoaXMsIGF3YWl0IGV2YWwoYGltcG9ydCgke0pTT04uc3RyaW5naWZ5KHRoaW5nKX0pYCkpO1xuXG5cdFx0aWYgKG1vZCAmJiBtb2QucHJvdG90eXBlIGluc3RhbmNlb2YgdGhpcy5jbGFzc1RvSGFuZGxlKSB7XG5cdFx0XHRtb2QgPSBuZXcgbW9kKHRoaXMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5ldy1jYXBcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFpc0NsYXNzKSBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUodGhpbmcgYXMgc3RyaW5nKV07XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLm1vZHVsZXMuaGFzKG1vZC5pZCkpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMUkVBRFlfTE9BREVEXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBtb2QuaWQpO1xuXHRcdHRoaXMucmVnaXN0ZXIobW9kLCBpc0NsYXNzID8gbnVsbCEgOiAodGhpbmcgYXMgc3RyaW5nKSk7XG5cdFx0dGhpcy5lbWl0KEFrYWlyb0hhbmRsZXJFdmVudHMuTE9BRCwgbW9kLCBpc1JlbG9hZCk7XG5cdFx0cmV0dXJuIG1vZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgbW9kdWxlcyBmcm9tIGEgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS5cblx0ICogRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKiBEZWZhdWx0cyB0byB0aGUgZmlsdGVyIHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgbG9hZEFsbChcblx0XHRkaXJlY3Rvcnk6IHN0cmluZyA9IHRoaXMuZGlyZWN0b3J5ISxcblx0XHRmaWx0ZXI6IExvYWRQcmVkaWNhdGUgPSB0aGlzLmxvYWRGaWx0ZXIgfHwgKCgpID0+IHRydWUpXG5cdCk6IFByb21pc2U8QWthaXJvSGFuZGxlcj4ge1xuXHRcdGNvbnN0IGZpbGVwYXRocyA9IEFrYWlyb0hhbmRsZXIucmVhZGRpclJlY3Vyc2l2ZShkaXJlY3RvcnkpO1xuXHRcdGNvbnN0IHByb21pc2VzID0gW107XG5cdFx0Zm9yIChsZXQgZmlsZXBhdGggb2YgZmlsZXBhdGhzKSB7XG5cdFx0XHRmaWxlcGF0aCA9IHBhdGgucmVzb2x2ZShmaWxlcGF0aCk7XG5cdFx0XHRpZiAoZmlsdGVyKGZpbGVwYXRoKSkgcHJvbWlzZXMucHVzaCh0aGlzLmxvYWQoZmlsZXBhdGgpKTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbW9kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIHJlZ2lzdGVyKG1vZDogQWthaXJvTW9kdWxlLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdG1vZC5maWxlcGF0aCA9IGZpbGVwYXRoITtcblx0XHRtb2QuY2xpZW50ID0gdGhpcy5jbGllbnQ7XG5cdFx0bW9kLmhhbmRsZXIgPSB0aGlzO1xuXHRcdHRoaXMubW9kdWxlcy5zZXQobW9kLmlkLCBtb2QpO1xuXG5cdFx0aWYgKG1vZC5jYXRlZ29yeUlEID09PSBcImRlZmF1bHRcIiAmJiB0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcykge1xuXHRcdFx0Y29uc3QgZGlycyA9IHBhdGguZGlybmFtZShmaWxlcGF0aCEpLnNwbGl0KHBhdGguc2VwKTtcblx0XHRcdG1vZC5jYXRlZ29yeUlEID0gZGlyc1tkaXJzLmxlbmd0aCAtIDFdO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5jYXRlZ29yaWVzLmhhcyhtb2QuY2F0ZWdvcnlJRCkpIHtcblx0XHRcdHRoaXMuY2F0ZWdvcmllcy5zZXQobW9kLmNhdGVnb3J5SUQsIG5ldyBDYXRlZ29yeShtb2QuY2F0ZWdvcnlJRCkpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGNhdGVnb3J5ID0gdGhpcy5jYXRlZ29yaWVzLmdldChtb2QuY2F0ZWdvcnlJRCkhO1xuXHRcdG1vZC5jYXRlZ29yeSA9IGNhdGVnb3J5O1xuXHRcdGNhdGVnb3J5LnNldChtb2QuaWQsIG1vZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyByZWxvYWQoaWQ6IHN0cmluZyk6IFByb21pc2U8QWthaXJvTW9kdWxlIHwgdW5kZWZpbmVkPiB7XG5cdFx0Y29uc3QgbW9kID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIW1vZCkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTU9EVUxFX05PVF9GT1VORFwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgaWQpO1xuXHRcdGlmICghbW9kLmZpbGVwYXRoKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJOT1RfUkVMT0FEQUJMRVwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgaWQpO1xuXG5cdFx0dGhpcy5kZXJlZ2lzdGVyKG1vZCk7XG5cblx0XHRjb25zdCBmaWxlcGF0aCA9IG1vZC5maWxlcGF0aDtcblx0XHRjb25zdCBuZXdNb2QgPSBhd2FpdCB0aGlzLmxvYWQoZmlsZXBhdGgsIHRydWUpO1xuXHRcdHJldHVybiBuZXdNb2Q7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyBhc3luYyByZWxvYWRBbGwoKTogUHJvbWlzZTxBa2Fpcm9IYW5kbGVyPiB7XG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IG0gb2YgQXJyYXkuZnJvbSh0aGlzLm1vZHVsZXMudmFsdWVzKCkpKSB7XG5cdFx0XHRpZiAobS5maWxlcGF0aCkgcHJvbWlzZXMucHVzaCh0aGlzLnJlbG9hZChtLmlkKSk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlKGlkOiBzdHJpbmcpOiBBa2Fpcm9Nb2R1bGUge1xuXHRcdGNvbnN0IG1vZCA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSk7XG5cdFx0aWYgKCFtb2QpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdHRoaXMuZGVyZWdpc3Rlcihtb2QpO1xuXG5cdFx0dGhpcy5lbWl0KEFrYWlyb0hhbmRsZXJFdmVudHMuUkVNT1ZFLCBtb2QpO1xuXHRcdHJldHVybiBtb2Q7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVBbGwoKTogQWthaXJvSGFuZGxlciB7XG5cdFx0Zm9yIChjb25zdCBtIG9mIEFycmF5LmZyb20odGhpcy5tb2R1bGVzLnZhbHVlcygpKSkge1xuXHRcdFx0aWYgKG0uZmlsZXBhdGgpIHRoaXMucmVtb3ZlKG0uaWQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGZpbGVzIHJlY3Vyc2l2ZWx5IGZyb20gYSBkaXJlY3RvcnkuXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gcmVhZC5cblx0ICovXG5cdHN0YXRpYyByZWFkZGlyUmVjdXJzaXZlKGRpcmVjdG9yeTogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdFx0KGZ1bmN0aW9uIHJlYWQoZGlyKSB7XG5cdFx0XHRjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG5cblx0XHRcdGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuXHRcdFx0XHRjb25zdCBmaWxlcGF0aCA9IHBhdGguam9pbihkaXIsIGZpbGUpO1xuXG5cdFx0XHRcdGlmIChmcy5zdGF0U3luYyhmaWxlcGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuXHRcdFx0XHRcdHJlYWQoZmlsZXBhdGgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKGZpbGVwYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKGRpcmVjdG9yeSk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGZpbHRlcmluZyBmaWxlcyB3aGVuIGxvYWRpbmcuXG4gKiBUcnVlIG1lYW5zIHRoZSBmaWxlIHNob3VsZCBiZSBsb2FkZWQuXG4gKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBmaWxlLlxuICovXG5leHBvcnQgdHlwZSBMb2FkUHJlZGljYXRlID0gKGZpbGVwYXRoOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgbW9kdWxlIGxvYWRpbmcgYW5kIGhhbmRsaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFrYWlyb0hhbmRsZXJPcHRpb25zIHtcblx0LyoqIFdoZXRoZXIgb3Igbm90IHRvIHNldCBlYWNoIG1vZHVsZSdzIGNhdGVnb3J5IHRvIGl0cyBwYXJlbnQgZGlyZWN0b3J5IG5hbWUuICovXG5cdGF1dG9tYXRlQ2F0ZWdvcmllcz86IGJvb2xlYW47XG5cblx0LyoqIE9ubHkgY2xhc3NlcyB0aGF0IGV4dGVuZHMgdGhpcyBjbGFzcyBjYW4gYmUgaGFuZGxlZC4gKi9cblx0Y2xhc3NUb0hhbmRsZT86IHR5cGVvZiBBa2Fpcm9Nb2R1bGU7XG5cblx0LyoqIERpcmVjdG9yeSB0byBtb2R1bGVzLiAqL1xuXHRkaXJlY3Rvcnk/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEZpbGUgZXh0ZW5zaW9ucyB0byBsb2FkLlxuXHQgKiBCeSBkZWZhdWx0IHRoaXMgaXMgLmpzLCAuanNvbiwgYW5kIC50cyBmaWxlcy5cblx0ICovXG5cdGV4dGVuc2lvbnM/OiBzdHJpbmdbXSB8IFNldDxzdHJpbmc+O1xuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgZm9yIGZpbGVzIHRvIGJlIGxvYWRlZC5cblx0ICogQ2FuIGJlIHNldCBpbmRpdmlkdWFsbHkgZm9yIGVhY2ggaGFuZGxlciBieSBvdmVycmlkaW5nIHRoZSBgbG9hZEFsbGAgbWV0aG9kLlxuXHQgKi9cblx0bG9hZEZpbHRlcj86IExvYWRQcmVkaWNhdGU7XG59XG4iXX0=