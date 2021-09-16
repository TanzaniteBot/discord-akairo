"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const events_1 = __importDefault(require("events"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const import_1 = __importDefault(require("../../lib/import"));
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
            }.call(this, await (0, import_1.default)(thing));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQWthaXJvSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF3QztBQUN4QyxvREFBa0M7QUFDbEMsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4Qiw4REFBdUM7QUFDdkMsc0VBQThDO0FBQzlDLGdFQUF3QztBQUN4QyxpREFBd0Q7QUFFeEQsa0VBQTBDO0FBSTFDOzs7O0dBSUc7QUFDSCxNQUFxQixhQUFjLFNBQVEsZ0JBQVk7SUFDdEQsWUFDQyxNQUFvQixFQUNwQixFQUNDLFNBQVMsRUFDVCxhQUFhLEdBQUcsc0JBQVksRUFDNUIsVUFBVSxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFDcEMsa0JBQWtCLEdBQUcsS0FBSyxFQUMxQixVQUFVLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUNEO1FBRXZCLEtBQUssRUFBRSxDQUFDO1FBRVIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFVLENBQUM7UUFFNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFFbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFFN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUVoQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7T0FFRztJQUNJLGtCQUFrQixDQUFVO0lBRW5DOztPQUVHO0lBQ0ksVUFBVSxDQUFxRDtJQUV0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SUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbEM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBaUI7UUFDeEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRWxCLENBQUMsU0FBUyxJQUFJLENBQUMsR0FBRztZQUNqQixNQUFNLEtBQUssR0FBRyxZQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWxDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN6QixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxZQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdEI7YUFDRDtRQUNGLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBQ0Q7QUFyUEQsZ0NBcVBDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgaW1wb3J0MSBmcm9tIFwiLi4vLi4vbGliL2ltcG9ydFwiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCB7IEFrYWlyb0hhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvTW9kdWxlIGZyb20gXCIuL0FrYWlyb01vZHVsZVwiO1xuXG5leHBvcnQgdHlwZSBTdGF0aWM8TT4gPSB7ICgpOiBNIH07XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgaGFuZGxpbmcgbW9kdWxlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgbW9kdWxlIGxvYWRpbmcgYW5kIGhhbmRsaW5nLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBa2Fpcm9IYW5kbGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNsaWVudDogQWthaXJvQ2xpZW50LFxuXHRcdHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUgPSBBa2Fpcm9Nb2R1bGUsXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLmpzb25cIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMgPSBmYWxzZSxcblx0XHRcdGxvYWRGaWx0ZXIgPSAoKSA9PiB0cnVlXG5cdFx0fTogQWthaXJvSGFuZGxlck9wdGlvbnNcblx0KSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuY2xpZW50ID0gY2xpZW50O1xuXG5cdFx0dGhpcy5kaXJlY3RvcnkgPSBkaXJlY3RvcnkhO1xuXG5cdFx0dGhpcy5jbGFzc1RvSGFuZGxlID0gY2xhc3NUb0hhbmRsZTtcblxuXHRcdHRoaXMuZXh0ZW5zaW9ucyA9IG5ldyBTZXQoZXh0ZW5zaW9ucyk7XG5cblx0XHR0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcyA9IEJvb2xlYW4oYXV0b21hdGVDYXRlZ29yaWVzKTtcblxuXHRcdHRoaXMubG9hZEZpbHRlciA9IGxvYWRGaWx0ZXI7XG5cblx0XHR0aGlzLm1vZHVsZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5jYXRlZ29yaWVzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhdXRvbWF0ZSBjYXRlZ29yeSBuYW1lcy5cblx0ICovXG5cdHB1YmxpYyBhdXRvbWF0ZUNhdGVnb3JpZXM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBBa2Fpcm9Nb2R1bGU7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBUaGUgbWFpbiBkaXJlY3RvcnkgdG8gbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogRmlsZSBleHRlbnNpb25zIHRvIGxvYWQuXG5cdCAqL1xuXHRwdWJsaWMgZXh0ZW5zaW9uczogU2V0PHN0cmluZz47XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRoYXQgZmlsdGVycyBmaWxlcyB3aGVuIGxvYWRpbmcuXG5cdCAqL1xuXHRwdWJsaWMgbG9hZEZpbHRlcjogTG9hZFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogTW9kdWxlcyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byBBa2Fpcm9Nb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIEFrYWlyb01vZHVsZT47XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbW9kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBkZXJlZ2lzdGVyKG1vZDogQWthaXJvTW9kdWxlKTogdm9pZCB7XG5cdFx0aWYgKG1vZC5maWxlcGF0aCkgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKG1vZC5maWxlcGF0aCldO1xuXHRcdHRoaXMubW9kdWxlcy5kZWxldGUobW9kLmlkKTtcblx0XHRtb2QuY2F0ZWdvcnkhLmRlbGV0ZShtb2QuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY2F0ZWdvcnkgYnkgbmFtZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBmaW5kQ2F0ZWdvcnkobmFtZTogc3RyaW5nKTogQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+IHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5jYXRlZ29yaWVzLmZpbmQoY2F0ZWdvcnkgPT4ge1xuXHRcdFx0cmV0dXJuIGNhdGVnb3J5LmlkLnRvTG93ZXJDYXNlKCkgPT09IG5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIG1vZHVsZSwgY2FuIGJlIGEgbW9kdWxlIGNsYXNzIG9yIGEgZmlsZXBhdGguXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBjbGFzcyBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICogQHBhcmFtIGlzUmVsb2FkIC0gV2hldGhlciB0aGlzIGlzIGEgcmVsb2FkIG9yIG5vdC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBsb2FkKHRoaW5nOiBzdHJpbmcgfCBBa2Fpcm9Nb2R1bGUsIGlzUmVsb2FkID0gZmFsc2UpOiBQcm9taXNlPEFrYWlyb01vZHVsZSB8IHVuZGVmaW5lZD4ge1xuXHRcdGNvbnN0IGlzQ2xhc3MgPSB0eXBlb2YgdGhpbmcgPT09IFwiZnVuY3Rpb25cIjtcblx0XHRpZiAoIWlzQ2xhc3MgJiYgIXRoaXMuZXh0ZW5zaW9ucy5oYXMocGF0aC5leHRuYW1lKHRoaW5nIGFzIHN0cmluZykpKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IG1vZCA9IGlzQ2xhc3Ncblx0XHRcdD8gdGhpbmdcblx0XHRcdDogZnVuY3Rpb24gZmluZEV4cG9ydCh0aGlzOiBhbnksIG06IGFueSk6IGFueSB7XG5cdFx0XHRcdFx0aWYgKCFtKSByZXR1cm4gbnVsbDtcblx0XHRcdFx0XHRpZiAobS5wcm90b3R5cGUgaW5zdGFuY2VvZiB0aGlzLmNsYXNzVG9IYW5kbGUpIHJldHVybiBtO1xuXHRcdFx0XHRcdHJldHVybiBtLmRlZmF1bHQgPyBmaW5kRXhwb3J0LmNhbGwodGhpcywgbS5kZWZhdWx0KSA6IG51bGw7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcblx0XHRcdCAgfS5jYWxsKHRoaXMsIGF3YWl0IGltcG9ydDEodGhpbmcpKTtcblxuXHRcdGlmIChtb2QgJiYgbW9kLnByb3RvdHlwZSBpbnN0YW5jZW9mIHRoaXMuY2xhc3NUb0hhbmRsZSkge1xuXHRcdFx0bW9kID0gbmV3IG1vZCh0aGlzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuZXctY2FwXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghaXNDbGFzcykgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKHRoaW5nIGFzIHN0cmluZyldO1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5tb2R1bGVzLmhhcyhtb2QuaWQpKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJBTFJFQURZX0xPQURFRFwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgbW9kLmlkKTtcblx0XHR0aGlzLnJlZ2lzdGVyKG1vZCwgaXNDbGFzcyA/IG51bGwhIDogKHRoaW5nIGFzIHN0cmluZykpO1xuXHRcdHRoaXMuZW1pdChBa2Fpcm9IYW5kbGVyRXZlbnRzLkxPQUQsIG1vZCwgaXNSZWxvYWQpO1xuXHRcdHJldHVybiBtb2Q7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIG1vZHVsZXMgZnJvbSBhIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uXG5cdCAqIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICogRGVmYXVsdHMgdG8gdGhlIGZpbHRlciBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGxvYWRBbGwoXG5cdFx0ZGlyZWN0b3J5OiBzdHJpbmcgPSB0aGlzLmRpcmVjdG9yeSEsXG5cdFx0ZmlsdGVyOiBMb2FkUHJlZGljYXRlID0gdGhpcy5sb2FkRmlsdGVyIHx8ICgoKSA9PiB0cnVlKVxuXHQpOiBQcm9taXNlPEFrYWlyb0hhbmRsZXI+IHtcblx0XHRjb25zdCBmaWxlcGF0aHMgPSBBa2Fpcm9IYW5kbGVyLnJlYWRkaXJSZWN1cnNpdmUoZGlyZWN0b3J5KTtcblx0XHRjb25zdCBwcm9taXNlcyA9IFtdO1xuXHRcdGZvciAobGV0IGZpbGVwYXRoIG9mIGZpbGVwYXRocykge1xuXHRcdFx0ZmlsZXBhdGggPSBwYXRoLnJlc29sdmUoZmlsZXBhdGgpO1xuXHRcdFx0aWYgKGZpbHRlcihmaWxlcGF0aCkpIHByb21pc2VzLnB1c2godGhpcy5sb2FkKGZpbGVwYXRoKSk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIG1vZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZWdpc3Rlcihtb2Q6IEFrYWlyb01vZHVsZSwgZmlsZXBhdGg/OiBzdHJpbmcpOiB2b2lkIHtcblx0XHRtb2QuZmlsZXBhdGggPSBmaWxlcGF0aCE7XG5cdFx0bW9kLmNsaWVudCA9IHRoaXMuY2xpZW50O1xuXHRcdG1vZC5oYW5kbGVyID0gdGhpcztcblx0XHR0aGlzLm1vZHVsZXMuc2V0KG1vZC5pZCwgbW9kKTtcblxuXHRcdGlmIChtb2QuY2F0ZWdvcnlJRCA9PT0gXCJkZWZhdWx0XCIgJiYgdGhpcy5hdXRvbWF0ZUNhdGVnb3JpZXMpIHtcblx0XHRcdGNvbnN0IGRpcnMgPSBwYXRoLmRpcm5hbWUoZmlsZXBhdGghKS5zcGxpdChwYXRoLnNlcCk7XG5cdFx0XHRtb2QuY2F0ZWdvcnlJRCA9IGRpcnNbZGlycy5sZW5ndGggLSAxXTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuY2F0ZWdvcmllcy5oYXMobW9kLmNhdGVnb3J5SUQpKSB7XG5cdFx0XHR0aGlzLmNhdGVnb3JpZXMuc2V0KG1vZC5jYXRlZ29yeUlELCBuZXcgQ2F0ZWdvcnkobW9kLmNhdGVnb3J5SUQpKTtcblx0XHR9XG5cblx0XHRjb25zdCBjYXRlZ29yeSA9IHRoaXMuY2F0ZWdvcmllcy5nZXQobW9kLmNhdGVnb3J5SUQpITtcblx0XHRtb2QuY2F0ZWdvcnkgPSBjYXRlZ29yeTtcblx0XHRjYXRlZ29yeS5zZXQobW9kLmlkLCBtb2QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcmVsb2FkKGlkOiBzdHJpbmcpOiBQcm9taXNlPEFrYWlyb01vZHVsZSB8IHVuZGVmaW5lZD4ge1xuXHRcdGNvbnN0IG1vZCA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSk7XG5cdFx0aWYgKCFtb2QpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblx0XHRpZiAoIW1vZC5maWxlcGF0aCkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTk9UX1JFTE9BREFCTEVcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdHRoaXMuZGVyZWdpc3Rlcihtb2QpO1xuXG5cdFx0Y29uc3QgZmlsZXBhdGggPSBtb2QuZmlsZXBhdGg7XG5cdFx0Y29uc3QgbmV3TW9kID0gYXdhaXQgdGhpcy5sb2FkKGZpbGVwYXRoLCB0cnVlKTtcblx0XHRyZXR1cm4gbmV3TW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIG1vZHVsZXMuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcmVsb2FkQWxsKCk6IFByb21pc2U8QWthaXJvSGFuZGxlcj4ge1xuXHRcdGNvbnN0IHByb21pc2VzID0gW107XG5cdFx0Zm9yIChjb25zdCBtIG9mIEFycmF5LmZyb20odGhpcy5tb2R1bGVzLnZhbHVlcygpKSkge1xuXHRcdFx0aWYgKG0uZmlsZXBhdGgpIHByb21pc2VzLnB1c2godGhpcy5yZWxvYWQobS5pZCkpO1xuXHRcdH1cblxuXHRcdGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZShpZDogc3RyaW5nKTogQWthaXJvTW9kdWxlIHtcblx0XHRjb25zdCBtb2QgPSB0aGlzLm1vZHVsZXMuZ2V0KGlkLnRvU3RyaW5nKCkpO1xuXHRcdGlmICghbW9kKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJNT0RVTEVfTk9UX0ZPVU5EXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHR0aGlzLmRlcmVnaXN0ZXIobW9kKTtcblxuXHRcdHRoaXMuZW1pdChBa2Fpcm9IYW5kbGVyRXZlbnRzLlJFTU9WRSwgbW9kKTtcblx0XHRyZXR1cm4gbW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIG1vZHVsZXMuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlQWxsKCk6IEFrYWlyb0hhbmRsZXIge1xuXHRcdGZvciAoY29uc3QgbSBvZiBBcnJheS5mcm9tKHRoaXMubW9kdWxlcy52YWx1ZXMoKSkpIHtcblx0XHRcdGlmIChtLmZpbGVwYXRoKSB0aGlzLnJlbW92ZShtLmlkKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBmaWxlcyByZWN1cnNpdmVseSBmcm9tIGEgZGlyZWN0b3J5LlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIHJlYWQuXG5cdCAqL1xuXHRzdGF0aWMgcmVhZGRpclJlY3Vyc2l2ZShkaXJlY3Rvcnk6IHN0cmluZyk6IHN0cmluZ1tdIHtcblx0XHRjb25zdCByZXN1bHQgPSBbXTtcblxuXHRcdChmdW5jdGlvbiByZWFkKGRpcikge1xuXHRcdFx0Y29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXIpO1xuXG5cdFx0XHRmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcblx0XHRcdFx0Y29uc3QgZmlsZXBhdGggPSBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcblxuXHRcdFx0XHRpZiAoZnMuc3RhdFN5bmMoZmlsZXBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcblx0XHRcdFx0XHRyZWFkKGZpbGVwYXRoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChmaWxlcGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KShkaXJlY3RvcnkpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgZmlsZXMgd2hlbiBsb2FkaW5nLlxuICogVHJ1ZSBtZWFucyB0aGUgZmlsZSBzaG91bGQgYmUgbG9hZGVkLlxuICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgZmlsZS5cbiAqL1xuZXhwb3J0IHR5cGUgTG9hZFByZWRpY2F0ZSA9IChmaWxlcGF0aDogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIG1vZHVsZSBsb2FkaW5nIGFuZCBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBa2Fpcm9IYW5kbGVyT3B0aW9ucyB7XG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byBzZXQgZWFjaCBtb2R1bGUncyBjYXRlZ29yeSB0byBpdHMgcGFyZW50IGRpcmVjdG9yeSBuYW1lLiAqL1xuXHRhdXRvbWF0ZUNhdGVnb3JpZXM/OiBib29sZWFuO1xuXG5cdC8qKiBPbmx5IGNsYXNzZXMgdGhhdCBleHRlbmRzIHRoaXMgY2xhc3MgY2FuIGJlIGhhbmRsZWQuICovXG5cdGNsYXNzVG9IYW5kbGU/OiB0eXBlb2YgQWthaXJvTW9kdWxlO1xuXG5cdC8qKiBEaXJlY3RvcnkgdG8gbW9kdWxlcy4gKi9cblx0ZGlyZWN0b3J5Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBGaWxlIGV4dGVuc2lvbnMgdG8gbG9hZC5cblx0ICogQnkgZGVmYXVsdCB0aGlzIGlzIC5qcywgLmpzb24sIGFuZCAudHMgZmlsZXMuXG5cdCAqL1xuXHRleHRlbnNpb25zPzogc3RyaW5nW10gfCBTZXQ8c3RyaW5nPjtcblxuXHQvKipcblx0ICogRmlsdGVyIGZvciBmaWxlcyB0byBiZSBsb2FkZWQuXG5cdCAqIENhbiBiZSBzZXQgaW5kaXZpZHVhbGx5IGZvciBlYWNoIGhhbmRsZXIgYnkgb3ZlcnJpZGluZyB0aGUgYGxvYWRBbGxgIG1ldGhvZC5cblx0ICovXG5cdGxvYWRGaWx0ZXI/OiBMb2FkUHJlZGljYXRlO1xufVxuIl19