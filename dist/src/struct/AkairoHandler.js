"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const events_1 = __importDefault(require("events"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = __importDefault(require("url"));
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
            }.call(this, await eval(`import(${JSON.stringify(url_1.default.pathToFileURL(thing).toString())})`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQWthaXJvSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF3QztBQUN4QyxvREFBa0M7QUFDbEMsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4Qiw4Q0FBc0I7QUFDdEIsc0VBQThDO0FBQzlDLGdFQUF3QztBQUN4QyxpREFBd0Q7QUFFeEQsa0VBQTBDO0FBSTFDOzs7O0dBSUc7QUFDSCxNQUFxQixhQUFjLFNBQVEsZ0JBQVk7SUFDdEQsWUFDQyxNQUFvQixFQUNwQixFQUNDLFNBQVMsRUFDVCxhQUFhLEdBQUcsc0JBQVksRUFDNUIsVUFBVSxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFDcEMsa0JBQWtCLEdBQUcsS0FBSyxFQUMxQixVQUFVLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUNEO1FBRXZCLEtBQUssRUFBRSxDQUFDO1FBRVIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFVLENBQUM7UUFFNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFFbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFFN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUVoQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7T0FFRztJQUNJLGtCQUFrQixDQUFVO0lBRW5DOztPQUVHO0lBQ0ksVUFBVSxDQUFxRDtJQUV0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SSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO1lBQ2xELElBQUksQ0FBQyxDQUFDLFFBQVE7Z0JBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbEM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBaUI7UUFDeEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRWxCLENBQUMsU0FBUyxJQUFJLENBQUMsR0FBRztZQUNqQixNQUFNLEtBQUssR0FBRyxZQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWxDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN6QixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxZQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdEI7YUFDRDtRQUNGLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBQ0Q7QUFyUEQsZ0NBcVBDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgdXJsIGZyb20gXCJ1cmxcIjtcbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgeyBBa2Fpcm9IYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSBmcm9tIFwiLi9Ba2Fpcm9Nb2R1bGVcIjtcblxuZXhwb3J0IHR5cGUgU3RhdGljPE0+ID0geyAoKTogTSB9O1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGhhbmRsaW5nIG1vZHVsZXMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIG1vZHVsZSBsb2FkaW5nIGFuZCBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvSGFuZGxlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQWthaXJvTW9kdWxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi5qc29uXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzID0gZmFsc2UsXG5cdFx0XHRsb2FkRmlsdGVyID0gKCkgPT4gdHJ1ZVxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zXG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmNsaWVudCA9IGNsaWVudDtcblxuXHRcdHRoaXMuZGlyZWN0b3J5ID0gZGlyZWN0b3J5ITtcblxuXHRcdHRoaXMuY2xhc3NUb0hhbmRsZSA9IGNsYXNzVG9IYW5kbGU7XG5cblx0XHR0aGlzLmV4dGVuc2lvbnMgPSBuZXcgU2V0KGV4dGVuc2lvbnMpO1xuXG5cdFx0dGhpcy5hdXRvbWF0ZUNhdGVnb3JpZXMgPSBCb29sZWFuKGF1dG9tYXRlQ2F0ZWdvcmllcyk7XG5cblx0XHR0aGlzLmxvYWRGaWx0ZXIgPSBsb2FkRmlsdGVyO1xuXG5cdFx0dGhpcy5tb2R1bGVzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdHRoaXMuY2F0ZWdvcmllcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdH1cblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYXV0b21hdGUgY2F0ZWdvcnkgbmFtZXMuXG5cdCAqL1xuXHRwdWJsaWMgYXV0b21hdGVDYXRlZ29yaWVzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDYXRlZ29yaWVzLCBtYXBwZWQgYnkgSUQgdG8gQ2F0ZWdvcnkuXG5cdCAqL1xuXHRwdWJsaWMgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgQWthaXJvTW9kdWxlPj47XG5cblx0LyoqXG5cdCAqIENsYXNzIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgQWthaXJvTW9kdWxlO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogVGhlIG1haW4gZGlyZWN0b3J5IHRvIG1vZHVsZXMuXG5cdCAqL1xuXHRwdWJsaWMgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEZpbGUgZXh0ZW5zaW9ucyB0byBsb2FkLlxuXHQgKi9cblx0cHVibGljIGV4dGVuc2lvbnM6IFNldDxzdHJpbmc+O1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0aGF0IGZpbHRlcnMgZmlsZXMgd2hlbiBsb2FkaW5nLlxuXHQgKi9cblx0cHVibGljIGxvYWRGaWx0ZXI6IExvYWRQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIE1vZHVsZXMgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gQWthaXJvTW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG1vZHVsZXM6IENvbGxlY3Rpb248c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+O1xuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIG1vZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgZGVyZWdpc3Rlcihtb2Q6IEFrYWlyb01vZHVsZSk6IHZvaWQge1xuXHRcdGlmIChtb2QuZmlsZXBhdGgpIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZShtb2QuZmlsZXBhdGgpXTtcblx0XHR0aGlzLm1vZHVsZXMuZGVsZXRlKG1vZC5pZCk7XG5cdFx0bW9kLmNhdGVnb3J5IS5kZWxldGUobW9kLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNhdGVnb3J5IGJ5IG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgZmluZENhdGVnb3J5KG5hbWU6IHN0cmluZyk6IENhdGVnb3J5PHN0cmluZywgQWthaXJvTW9kdWxlPiB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuY2F0ZWdvcmllcy5maW5kKGNhdGVnb3J5ID0+IHtcblx0XHRcdHJldHVybiBjYXRlZ29yeS5pZC50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYSBtb2R1bGUsIGNhbiBiZSBhIG1vZHVsZSBjbGFzcyBvciBhIGZpbGVwYXRoLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBNb2R1bGUgY2xhc3Mgb3IgcGF0aCB0byBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpc1JlbG9hZCAtIFdoZXRoZXIgdGhpcyBpcyBhIHJlbG9hZCBvciBub3QuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgbG9hZCh0aGluZzogc3RyaW5nIHwgQWthaXJvTW9kdWxlLCBpc1JlbG9hZCA9IGZhbHNlKTogUHJvbWlzZTxBa2Fpcm9Nb2R1bGUgfCB1bmRlZmluZWQ+IHtcblx0XHRjb25zdCBpc0NsYXNzID0gdHlwZW9mIHRoaW5nID09PSBcImZ1bmN0aW9uXCI7XG5cdFx0aWYgKCFpc0NsYXNzICYmICF0aGlzLmV4dGVuc2lvbnMuaGFzKHBhdGguZXh0bmFtZSh0aGluZyBhcyBzdHJpbmcpKSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuXHRcdGxldCBtb2QgPSBpc0NsYXNzXG5cdFx0XHQ/IHRoaW5nXG5cdFx0XHQ6IGZ1bmN0aW9uIGZpbmRFeHBvcnQodGhpczogYW55LCBtOiBhbnkpOiBhbnkge1xuXHRcdFx0XHRcdGlmICghbSkgcmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0aWYgKG0ucHJvdG90eXBlIGluc3RhbmNlb2YgdGhpcy5jbGFzc1RvSGFuZGxlKSByZXR1cm4gbTtcblx0XHRcdFx0XHRyZXR1cm4gbS5kZWZhdWx0ID8gZmluZEV4cG9ydC5jYWxsKHRoaXMsIG0uZGVmYXVsdCkgOiBudWxsO1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG5cdFx0XHQgIH0uY2FsbCh0aGlzLCBhd2FpdCBldmFsKGBpbXBvcnQoJHtKU09OLnN0cmluZ2lmeSh1cmwucGF0aFRvRmlsZVVSTCh0aGluZyBhcyBzdHJpbmcpLnRvU3RyaW5nKCkpfSlgKSk7XG5cblx0XHRpZiAobW9kICYmIG1vZC5wcm90b3R5cGUgaW5zdGFuY2VvZiB0aGlzLmNsYXNzVG9IYW5kbGUpIHtcblx0XHRcdG1vZCA9IG5ldyBtb2QodGhpcyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIWlzQ2xhc3MpIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZSh0aGluZyBhcyBzdHJpbmcpXTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMubW9kdWxlcy5oYXMobW9kLmlkKSkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiQUxSRUFEWV9MT0FERURcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIG1vZC5pZCk7XG5cdFx0dGhpcy5yZWdpc3Rlcihtb2QsIGlzQ2xhc3MgPyBudWxsISA6ICh0aGluZyBhcyBzdHJpbmcpKTtcblx0XHR0aGlzLmVtaXQoQWthaXJvSGFuZGxlckV2ZW50cy5MT0FELCBtb2QsIGlzUmVsb2FkKTtcblx0XHRyZXR1cm4gbW9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBtb2R1bGVzIGZyb20gYSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLlxuXHQgKiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqIERlZmF1bHRzIHRvIHRoZSBmaWx0ZXIgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBsb2FkQWxsKFxuXHRcdGRpcmVjdG9yeTogc3RyaW5nID0gdGhpcy5kaXJlY3RvcnkhLFxuXHRcdGZpbHRlcjogTG9hZFByZWRpY2F0ZSA9IHRoaXMubG9hZEZpbHRlciB8fCAoKCkgPT4gdHJ1ZSlcblx0KTogUHJvbWlzZTxBa2Fpcm9IYW5kbGVyPiB7XG5cdFx0Y29uc3QgZmlsZXBhdGhzID0gQWthaXJvSGFuZGxlci5yZWFkZGlyUmVjdXJzaXZlKGRpcmVjdG9yeSk7XG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGxldCBmaWxlcGF0aCBvZiBmaWxlcGF0aHMpIHtcblx0XHRcdGZpbGVwYXRoID0gcGF0aC5yZXNvbHZlKGZpbGVwYXRoKTtcblx0XHRcdGlmIChmaWx0ZXIoZmlsZXBhdGgpKSBwcm9taXNlcy5wdXNoKHRoaXMubG9hZChmaWxlcGF0aCkpO1xuXHRcdH1cblxuXHRcdGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBtb2QgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgcmVnaXN0ZXIobW9kOiBBa2Fpcm9Nb2R1bGUsIGZpbGVwYXRoPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0bW9kLmZpbGVwYXRoID0gZmlsZXBhdGghO1xuXHRcdG1vZC5jbGllbnQgPSB0aGlzLmNsaWVudDtcblx0XHRtb2QuaGFuZGxlciA9IHRoaXM7XG5cdFx0dGhpcy5tb2R1bGVzLnNldChtb2QuaWQsIG1vZCk7XG5cblx0XHRpZiAobW9kLmNhdGVnb3J5SUQgPT09IFwiZGVmYXVsdFwiICYmIHRoaXMuYXV0b21hdGVDYXRlZ29yaWVzKSB7XG5cdFx0XHRjb25zdCBkaXJzID0gcGF0aC5kaXJuYW1lKGZpbGVwYXRoISkuc3BsaXQocGF0aC5zZXApO1xuXHRcdFx0bW9kLmNhdGVnb3J5SUQgPSBkaXJzW2RpcnMubGVuZ3RoIC0gMV07XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmNhdGVnb3JpZXMuaGFzKG1vZC5jYXRlZ29yeUlEKSkge1xuXHRcdFx0dGhpcy5jYXRlZ29yaWVzLnNldChtb2QuY2F0ZWdvcnlJRCwgbmV3IENhdGVnb3J5KG1vZC5jYXRlZ29yeUlEKSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgY2F0ZWdvcnkgPSB0aGlzLmNhdGVnb3JpZXMuZ2V0KG1vZC5jYXRlZ29yeUlEKSE7XG5cdFx0bW9kLmNhdGVnb3J5ID0gY2F0ZWdvcnk7XG5cdFx0Y2F0ZWdvcnkuc2V0KG1vZC5pZCwgbW9kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJlbG9hZChpZDogc3RyaW5nKTogUHJvbWlzZTxBa2Fpcm9Nb2R1bGUgfCB1bmRlZmluZWQ+IHtcblx0XHRjb25zdCBtb2QgPSB0aGlzLm1vZHVsZXMuZ2V0KGlkLnRvU3RyaW5nKCkpO1xuXHRcdGlmICghbW9kKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJNT0RVTEVfTk9UX0ZPVU5EXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cdFx0aWYgKCFtb2QuZmlsZXBhdGgpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk5PVF9SRUxPQURBQkxFXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBpZCk7XG5cblx0XHR0aGlzLmRlcmVnaXN0ZXIobW9kKTtcblxuXHRcdGNvbnN0IGZpbGVwYXRoID0gbW9kLmZpbGVwYXRoO1xuXHRcdGNvbnN0IG5ld01vZCA9IGF3YWl0IHRoaXMubG9hZChmaWxlcGF0aCwgdHJ1ZSk7XG5cdFx0cmV0dXJuIG5ld01vZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBtb2R1bGVzLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJlbG9hZEFsbCgpOiBQcm9taXNlPEFrYWlyb0hhbmRsZXI+IHtcblx0XHRjb25zdCBwcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgbSBvZiBBcnJheS5mcm9tKHRoaXMubW9kdWxlcy52YWx1ZXMoKSkpIHtcblx0XHRcdGlmIChtLmZpbGVwYXRoKSBwcm9taXNlcy5wdXNoKHRoaXMucmVsb2FkKG0uaWQpKTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmUoaWQ6IHN0cmluZyk6IEFrYWlyb01vZHVsZSB7XG5cdFx0Y29uc3QgbW9kID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIW1vZCkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTU9EVUxFX05PVF9GT1VORFwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgaWQpO1xuXG5cdFx0dGhpcy5kZXJlZ2lzdGVyKG1vZCk7XG5cblx0XHR0aGlzLmVtaXQoQWthaXJvSGFuZGxlckV2ZW50cy5SRU1PVkUsIG1vZCk7XG5cdFx0cmV0dXJuIG1vZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBtb2R1bGVzLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZUFsbCgpOiBBa2Fpcm9IYW5kbGVyIHtcblx0XHRmb3IgKGNvbnN0IG0gb2YgQXJyYXkuZnJvbSh0aGlzLm1vZHVsZXMudmFsdWVzKCkpKSB7XG5cdFx0XHRpZiAobS5maWxlcGF0aCkgdGhpcy5yZW1vdmUobS5pZCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgZmlsZXMgcmVjdXJzaXZlbHkgZnJvbSBhIGRpcmVjdG9yeS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byByZWFkLlxuXHQgKi9cblx0c3RhdGljIHJlYWRkaXJSZWN1cnNpdmUoZGlyZWN0b3J5OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0XHQoZnVuY3Rpb24gcmVhZChkaXIpIHtcblx0XHRcdGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZGlyKTtcblxuXHRcdFx0Zm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG5cdFx0XHRcdGNvbnN0IGZpbGVwYXRoID0gcGF0aC5qb2luKGRpciwgZmlsZSk7XG5cblx0XHRcdFx0aWYgKGZzLnN0YXRTeW5jKGZpbGVwYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG5cdFx0XHRcdFx0cmVhZChmaWxlcGF0aCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVzdWx0LnB1c2goZmlsZXBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSkoZGlyZWN0b3J5KTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBmb3IgZmlsdGVyaW5nIGZpbGVzIHdoZW4gbG9hZGluZy5cbiAqIFRydWUgbWVhbnMgdGhlIGZpbGUgc2hvdWxkIGJlIGxvYWRlZC5cbiAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIGZpbGUuXG4gKi9cbmV4cG9ydCB0eXBlIExvYWRQcmVkaWNhdGUgPSAoZmlsZXBhdGg6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBPcHRpb25zIGZvciBtb2R1bGUgbG9hZGluZyBhbmQgaGFuZGxpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWthaXJvSGFuZGxlck9wdGlvbnMge1xuXHQvKiogV2hldGhlciBvciBub3QgdG8gc2V0IGVhY2ggbW9kdWxlJ3MgY2F0ZWdvcnkgdG8gaXRzIHBhcmVudCBkaXJlY3RvcnkgbmFtZS4gKi9cblx0YXV0b21hdGVDYXRlZ29yaWVzPzogYm9vbGVhbjtcblxuXHQvKiogT25seSBjbGFzc2VzIHRoYXQgZXh0ZW5kcyB0aGlzIGNsYXNzIGNhbiBiZSBoYW5kbGVkLiAqL1xuXHRjbGFzc1RvSGFuZGxlPzogdHlwZW9mIEFrYWlyb01vZHVsZTtcblxuXHQvKiogRGlyZWN0b3J5IHRvIG1vZHVsZXMuICovXG5cdGRpcmVjdG9yeT86IHN0cmluZztcblxuXHQvKipcblx0ICogRmlsZSBleHRlbnNpb25zIHRvIGxvYWQuXG5cdCAqIEJ5IGRlZmF1bHQgdGhpcyBpcyAuanMsIC5qc29uLCBhbmQgLnRzIGZpbGVzLlxuXHQgKi9cblx0ZXh0ZW5zaW9ucz86IHN0cmluZ1tdIHwgU2V0PHN0cmluZz47XG5cblx0LyoqXG5cdCAqIEZpbHRlciBmb3IgZmlsZXMgdG8gYmUgbG9hZGVkLlxuXHQgKiBDYW4gYmUgc2V0IGluZGl2aWR1YWxseSBmb3IgZWFjaCBoYW5kbGVyIGJ5IG92ZXJyaWRpbmcgdGhlIGBsb2FkQWxsYCBtZXRob2QuXG5cdCAqL1xuXHRsb2FkRmlsdGVyPzogTG9hZFByZWRpY2F0ZTtcbn1cbiJdfQ==