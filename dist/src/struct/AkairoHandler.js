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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdHJ1Y3QvQWthaXJvSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF3QztBQUN4QyxvREFBa0M7QUFDbEMsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4Qiw4Q0FBc0I7QUFDdEIsc0VBQThDO0FBQzlDLGdFQUF3QztBQUN4QyxpREFBd0Q7QUFFeEQsa0VBQTBDO0FBSTFDOzs7O0dBSUc7QUFDSCxNQUFxQixhQUFjLFNBQVEsZ0JBQVk7SUFDdEQsWUFDQyxNQUFvQixFQUNwQixFQUNDLFNBQVMsRUFDVCxhQUFhLEdBQUcsc0JBQVksRUFDNUIsVUFBVSxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFDcEMsa0JBQWtCLEdBQUcsS0FBSyxFQUMxQixVQUFVLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUNEO1FBRXZCLEtBQUssRUFBRSxDQUFDO1FBRVIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFVLENBQUM7UUFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7T0FFRztJQUNJLGtCQUFrQixDQUFVO0lBRW5DOztPQUVHO0lBQ0ksVUFBVSxDQUFxRDtJQUV0RTs7T0FFRztJQUNJLGFBQWEsQ0FBc0I7SUFFMUM7O09BRUc7SUFDSSxNQUFNLENBQWU7SUFFNUI7O09BRUc7SUFDSSxTQUFTLENBQVM7SUFFekI7O09BRUc7SUFDSSxVQUFVLENBQWM7SUFFL0I7O09BRUc7SUFDSSxVQUFVLENBQWdCO0lBRWpDOztPQUVHO0lBQ0ksT0FBTyxDQUFtQztJQUVqRDs7O09BR0c7SUFDSSxVQUFVLENBQUMsR0FBaUI7UUFDbEMsSUFBSSxHQUFHLENBQUMsUUFBUTtZQUFFLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QixHQUFHLENBQUMsUUFBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFlBQVksQ0FBQyxJQUFZO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDdEMsT0FBTyxRQUFRLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUE0QixFQUFFLFFBQVEsR0FBRyxLQUFLO1FBQy9ELE1BQU0sT0FBTyxHQUFHLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFlLENBQUMsQ0FBQztZQUFFLE9BQU8sU0FBUyxDQUFDO1FBRXRGLElBQUksR0FBRyxHQUFHLE9BQU87WUFDaEIsQ0FBQyxDQUFDLEtBQUs7WUFDUCxDQUFDLENBQUMsU0FBUyxVQUFVLENBQVksQ0FBTTtnQkFDckMsSUFBSSxDQUFDLENBQUM7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxDQUFDLFNBQVMsWUFBWSxJQUFJLENBQUMsYUFBYTtvQkFBRSxPQUFPLENBQUMsQ0FBQztnQkFDeEQsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDM0QsOERBQThEO1lBQzlELENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFHLENBQUMsYUFBYSxDQUFDLEtBQWUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFeEcsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsWUFBWSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3ZELEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDhCQUE4QjtTQUNuRDthQUFNO1lBQ04sSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBZSxDQUFDLENBQUMsQ0FBQztZQUNyRSxPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUFFLE1BQU0sSUFBSSxxQkFBVyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2RyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUssQ0FBQyxDQUFDLENBQUUsS0FBZ0IsQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxJQUFJLENBQUMsK0JBQW1CLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsT0FBTyxDQUNuQixZQUFvQixJQUFJLENBQUMsU0FBVSxFQUNuQyxTQUF3QixJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO1FBRXZELE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1RCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDcEIsS0FBSyxJQUFJLFFBQVEsSUFBSSxTQUFTLEVBQUU7WUFDL0IsUUFBUSxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxRQUFRLENBQUMsR0FBaUIsRUFBRSxRQUFpQjtRQUNuRCxHQUFHLENBQUMsUUFBUSxHQUFHLFFBQVMsQ0FBQztRQUN6QixHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDekIsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUU5QixJQUFJLEdBQUcsQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUM1RCxNQUFNLElBQUksR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLFFBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckQsR0FBRyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN2QztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLGtCQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDbEU7UUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFFLENBQUM7UUFDdEQsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDeEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQVU7UUFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLEdBQUc7WUFBRSxNQUFNLElBQUkscUJBQVcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVE7WUFBRSxNQUFNLElBQUkscUJBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV4RixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDOUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvQyxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxTQUFTO1FBQ3JCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNwQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO1lBQ2xELElBQUksQ0FBQyxDQUFDLFFBQVE7Z0JBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pEO1FBRUQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxFQUFVO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxHQUFHO1lBQUUsTUFBTSxJQUFJLHFCQUFXLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVyQixJQUFJLENBQUMsSUFBSSxDQUFDLCtCQUFtQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzQyxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7T0FFRztJQUNJLFNBQVM7UUFDZixLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO1lBQ2xELElBQUksQ0FBQyxDQUFDLFFBQVE7Z0JBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbEM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBaUI7UUFDeEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRWxCLENBQUMsU0FBUyxJQUFJLENBQUMsR0FBRztZQUNqQixNQUFNLEtBQUssR0FBRyxZQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWxDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN6QixNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFdEMsSUFBSSxZQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdEI7YUFDRDtRQUNGLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBQ0Q7QUE5T0QsZ0NBOE9DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgdXJsIGZyb20gXCJ1cmxcIjtcbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgeyBBa2Fpcm9IYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSBmcm9tIFwiLi9Ba2Fpcm9Nb2R1bGVcIjtcblxuZXhwb3J0IHR5cGUgU3RhdGljPE0+ID0geyAoKTogTSB9O1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGhhbmRsaW5nIG1vZHVsZXMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIG1vZHVsZSBsb2FkaW5nIGFuZCBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvSGFuZGxlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQWthaXJvTW9kdWxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi5qc29uXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzID0gZmFsc2UsXG5cdFx0XHRsb2FkRmlsdGVyID0gKCkgPT4gdHJ1ZVxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zXG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmNsaWVudCA9IGNsaWVudDtcblx0XHR0aGlzLmRpcmVjdG9yeSA9IGRpcmVjdG9yeSE7XG5cdFx0dGhpcy5jbGFzc1RvSGFuZGxlID0gY2xhc3NUb0hhbmRsZTtcblx0XHR0aGlzLmV4dGVuc2lvbnMgPSBuZXcgU2V0KGV4dGVuc2lvbnMpO1xuXHRcdHRoaXMuYXV0b21hdGVDYXRlZ29yaWVzID0gQm9vbGVhbihhdXRvbWF0ZUNhdGVnb3JpZXMpO1xuXHRcdHRoaXMubG9hZEZpbHRlciA9IGxvYWRGaWx0ZXI7XG5cdFx0dGhpcy5tb2R1bGVzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHR0aGlzLmNhdGVnb3JpZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGF1dG9tYXRlIGNhdGVnb3J5IG5hbWVzLlxuXHQgKi9cblx0cHVibGljIGF1dG9tYXRlQ2F0ZWdvcmllczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGNhdGVnb3JpZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDYXRlZ29yeTxzdHJpbmcsIEFrYWlyb01vZHVsZT4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgY2xhc3NUb0hhbmRsZTogdHlwZW9mIEFrYWlyb01vZHVsZTtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSBtYWluIGRpcmVjdG9yeSB0byBtb2R1bGVzLlxuXHQgKi9cblx0cHVibGljIGRpcmVjdG9yeTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBGaWxlIGV4dGVuc2lvbnMgdG8gbG9hZC5cblx0ICovXG5cdHB1YmxpYyBleHRlbnNpb25zOiBTZXQ8c3RyaW5nPjtcblxuXHQvKipcblx0ICogRnVuY3Rpb24gdGhhdCBmaWx0ZXJzIGZpbGVzIHdoZW4gbG9hZGluZy5cblx0ICovXG5cdHB1YmxpYyBsb2FkRmlsdGVyOiBMb2FkUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBNb2R1bGVzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIEFrYWlyb01vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgQWthaXJvTW9kdWxlPjtcblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBtb2QgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGRlcmVnaXN0ZXIobW9kOiBBa2Fpcm9Nb2R1bGUpOiB2b2lkIHtcblx0XHRpZiAobW9kLmZpbGVwYXRoKSBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUobW9kLmZpbGVwYXRoKV07XG5cdFx0dGhpcy5tb2R1bGVzLmRlbGV0ZShtb2QuaWQpO1xuXHRcdG1vZC5jYXRlZ29yeSEuZGVsZXRlKG1vZC5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjYXRlZ29yeSBieSBuYW1lLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIGZpbmRDYXRlZ29yeShuYW1lOiBzdHJpbmcpOiBDYXRlZ29yeTxzdHJpbmcsIEFrYWlyb01vZHVsZT4gfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLmNhdGVnb3JpZXMuZmluZChjYXRlZ29yeSA9PiB7XG5cdFx0XHRyZXR1cm4gY2F0ZWdvcnkuaWQudG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGEgbW9kdWxlLCBjYW4gYmUgYSBtb2R1bGUgY2xhc3Mgb3IgYSBmaWxlcGF0aC5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIGNsYXNzIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKiBAcGFyYW0gaXNSZWxvYWQgLSBXaGV0aGVyIHRoaXMgaXMgYSByZWxvYWQgb3Igbm90LlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGxvYWQodGhpbmc6IHN0cmluZyB8IEFrYWlyb01vZHVsZSwgaXNSZWxvYWQgPSBmYWxzZSk6IFByb21pc2U8QWthaXJvTW9kdWxlIHwgdW5kZWZpbmVkPiB7XG5cdFx0Y29uc3QgaXNDbGFzcyA9IHR5cGVvZiB0aGluZyA9PT0gXCJmdW5jdGlvblwiO1xuXHRcdGlmICghaXNDbGFzcyAmJiAhdGhpcy5leHRlbnNpb25zLmhhcyhwYXRoLmV4dG5hbWUodGhpbmcgYXMgc3RyaW5nKSkpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHRsZXQgbW9kID0gaXNDbGFzc1xuXHRcdFx0PyB0aGluZ1xuXHRcdFx0OiBmdW5jdGlvbiBmaW5kRXhwb3J0KHRoaXM6IGFueSwgbTogYW55KTogYW55IHtcblx0XHRcdFx0XHRpZiAoIW0pIHJldHVybiBudWxsO1xuXHRcdFx0XHRcdGlmIChtLnByb3RvdHlwZSBpbnN0YW5jZW9mIHRoaXMuY2xhc3NUb0hhbmRsZSkgcmV0dXJuIG07XG5cdFx0XHRcdFx0cmV0dXJuIG0uZGVmYXVsdCA/IGZpbmRFeHBvcnQuY2FsbCh0aGlzLCBtLmRlZmF1bHQpIDogbnVsbDtcblx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuXHRcdFx0ICB9LmNhbGwodGhpcywgYXdhaXQgZXZhbChgaW1wb3J0KCR7SlNPTi5zdHJpbmdpZnkodXJsLnBhdGhUb0ZpbGVVUkwodGhpbmcgYXMgc3RyaW5nKS50b1N0cmluZygpKX0pYCkpO1xuXG5cdFx0aWYgKG1vZCAmJiBtb2QucHJvdG90eXBlIGluc3RhbmNlb2YgdGhpcy5jbGFzc1RvSGFuZGxlKSB7XG5cdFx0XHRtb2QgPSBuZXcgbW9kKHRoaXMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5ldy1jYXBcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFpc0NsYXNzKSBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUodGhpbmcgYXMgc3RyaW5nKV07XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLm1vZHVsZXMuaGFzKG1vZC5pZCkpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMUkVBRFlfTE9BREVEXCIsIHRoaXMuY2xhc3NUb0hhbmRsZS5uYW1lLCBtb2QuaWQpO1xuXHRcdHRoaXMucmVnaXN0ZXIobW9kLCBpc0NsYXNzID8gbnVsbCEgOiAodGhpbmcgYXMgc3RyaW5nKSk7XG5cdFx0dGhpcy5lbWl0KEFrYWlyb0hhbmRsZXJFdmVudHMuTE9BRCwgbW9kLCBpc1JlbG9hZCk7XG5cdFx0cmV0dXJuIG1vZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgbW9kdWxlcyBmcm9tIGEgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS5cblx0ICogRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKiBEZWZhdWx0cyB0byB0aGUgZmlsdGVyIHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgbG9hZEFsbChcblx0XHRkaXJlY3Rvcnk6IHN0cmluZyA9IHRoaXMuZGlyZWN0b3J5ISxcblx0XHRmaWx0ZXI6IExvYWRQcmVkaWNhdGUgPSB0aGlzLmxvYWRGaWx0ZXIgfHwgKCgpID0+IHRydWUpXG5cdCk6IFByb21pc2U8QWthaXJvSGFuZGxlcj4ge1xuXHRcdGNvbnN0IGZpbGVwYXRocyA9IEFrYWlyb0hhbmRsZXIucmVhZGRpclJlY3Vyc2l2ZShkaXJlY3RvcnkpO1xuXHRcdGNvbnN0IHByb21pc2VzID0gW107XG5cdFx0Zm9yIChsZXQgZmlsZXBhdGggb2YgZmlsZXBhdGhzKSB7XG5cdFx0XHRmaWxlcGF0aCA9IHBhdGgucmVzb2x2ZShmaWxlcGF0aCk7XG5cdFx0XHRpZiAoZmlsdGVyKGZpbGVwYXRoKSkgcHJvbWlzZXMucHVzaCh0aGlzLmxvYWQoZmlsZXBhdGgpKTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gbW9kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIHJlZ2lzdGVyKG1vZDogQWthaXJvTW9kdWxlLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdG1vZC5maWxlcGF0aCA9IGZpbGVwYXRoITtcblx0XHRtb2QuY2xpZW50ID0gdGhpcy5jbGllbnQ7XG5cdFx0bW9kLmhhbmRsZXIgPSB0aGlzO1xuXHRcdHRoaXMubW9kdWxlcy5zZXQobW9kLmlkLCBtb2QpO1xuXG5cdFx0aWYgKG1vZC5jYXRlZ29yeUlEID09PSBcImRlZmF1bHRcIiAmJiB0aGlzLmF1dG9tYXRlQ2F0ZWdvcmllcykge1xuXHRcdFx0Y29uc3QgZGlycyA9IHBhdGguZGlybmFtZShmaWxlcGF0aCEpLnNwbGl0KHBhdGguc2VwKTtcblx0XHRcdG1vZC5jYXRlZ29yeUlEID0gZGlyc1tkaXJzLmxlbmd0aCAtIDFdO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5jYXRlZ29yaWVzLmhhcyhtb2QuY2F0ZWdvcnlJRCkpIHtcblx0XHRcdHRoaXMuY2F0ZWdvcmllcy5zZXQobW9kLmNhdGVnb3J5SUQsIG5ldyBDYXRlZ29yeShtb2QuY2F0ZWdvcnlJRCkpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGNhdGVnb3J5ID0gdGhpcy5jYXRlZ29yaWVzLmdldChtb2QuY2F0ZWdvcnlJRCkhO1xuXHRcdG1vZC5jYXRlZ29yeSA9IGNhdGVnb3J5O1xuXHRcdGNhdGVnb3J5LnNldChtb2QuaWQsIG1vZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyByZWxvYWQoaWQ6IHN0cmluZyk6IFByb21pc2U8QWthaXJvTW9kdWxlIHwgdW5kZWZpbmVkPiB7XG5cdFx0Y29uc3QgbW9kID0gdGhpcy5tb2R1bGVzLmdldChpZC50b1N0cmluZygpKTtcblx0XHRpZiAoIW1vZCkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTU9EVUxFX05PVF9GT1VORFwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgaWQpO1xuXHRcdGlmICghbW9kLmZpbGVwYXRoKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJOT1RfUkVMT0FEQUJMRVwiLCB0aGlzLmNsYXNzVG9IYW5kbGUubmFtZSwgaWQpO1xuXG5cdFx0dGhpcy5kZXJlZ2lzdGVyKG1vZCk7XG5cblx0XHRjb25zdCBmaWxlcGF0aCA9IG1vZC5maWxlcGF0aDtcblx0XHRjb25zdCBuZXdNb2QgPSBhd2FpdCB0aGlzLmxvYWQoZmlsZXBhdGgsIHRydWUpO1xuXHRcdHJldHVybiBuZXdNb2Q7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyBhc3luYyByZWxvYWRBbGwoKTogUHJvbWlzZTxBa2Fpcm9IYW5kbGVyPiB7XG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IG0gb2YgQXJyYXkuZnJvbSh0aGlzLm1vZHVsZXMudmFsdWVzKCkpKSB7XG5cdFx0XHRpZiAobS5maWxlcGF0aCkgcHJvbWlzZXMucHVzaCh0aGlzLnJlbG9hZChtLmlkKSk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlKGlkOiBzdHJpbmcpOiBBa2Fpcm9Nb2R1bGUge1xuXHRcdGNvbnN0IG1vZCA9IHRoaXMubW9kdWxlcy5nZXQoaWQudG9TdHJpbmcoKSk7XG5cdFx0aWYgKCFtb2QpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk1PRFVMRV9OT1RfRk9VTkRcIiwgdGhpcy5jbGFzc1RvSGFuZGxlLm5hbWUsIGlkKTtcblxuXHRcdHRoaXMuZGVyZWdpc3Rlcihtb2QpO1xuXG5cdFx0dGhpcy5lbWl0KEFrYWlyb0hhbmRsZXJFdmVudHMuUkVNT1ZFLCBtb2QpO1xuXHRcdHJldHVybiBtb2Q7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgbW9kdWxlcy5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVBbGwoKTogQWthaXJvSGFuZGxlciB7XG5cdFx0Zm9yIChjb25zdCBtIG9mIEFycmF5LmZyb20odGhpcy5tb2R1bGVzLnZhbHVlcygpKSkge1xuXHRcdFx0aWYgKG0uZmlsZXBhdGgpIHRoaXMucmVtb3ZlKG0uaWQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGZpbGVzIHJlY3Vyc2l2ZWx5IGZyb20gYSBkaXJlY3RvcnkuXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gcmVhZC5cblx0ICovXG5cdHN0YXRpYyByZWFkZGlyUmVjdXJzaXZlKGRpcmVjdG9yeTogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdFx0KGZ1bmN0aW9uIHJlYWQoZGlyKSB7XG5cdFx0XHRjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGRpcik7XG5cblx0XHRcdGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuXHRcdFx0XHRjb25zdCBmaWxlcGF0aCA9IHBhdGguam9pbihkaXIsIGZpbGUpO1xuXG5cdFx0XHRcdGlmIChmcy5zdGF0U3luYyhmaWxlcGF0aCkuaXNEaXJlY3RvcnkoKSkge1xuXHRcdFx0XHRcdHJlYWQoZmlsZXBhdGgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKGZpbGVwYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pKGRpcmVjdG9yeSk7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59XG5cbi8qKlxuICogRnVuY3Rpb24gZm9yIGZpbHRlcmluZyBmaWxlcyB3aGVuIGxvYWRpbmcuXG4gKiBUcnVlIG1lYW5zIHRoZSBmaWxlIHNob3VsZCBiZSBsb2FkZWQuXG4gKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBmaWxlLlxuICovXG5leHBvcnQgdHlwZSBMb2FkUHJlZGljYXRlID0gKGZpbGVwYXRoOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgbW9kdWxlIGxvYWRpbmcgYW5kIGhhbmRsaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFrYWlyb0hhbmRsZXJPcHRpb25zIHtcblx0LyoqIFdoZXRoZXIgb3Igbm90IHRvIHNldCBlYWNoIG1vZHVsZSdzIGNhdGVnb3J5IHRvIGl0cyBwYXJlbnQgZGlyZWN0b3J5IG5hbWUuICovXG5cdGF1dG9tYXRlQ2F0ZWdvcmllcz86IGJvb2xlYW47XG5cblx0LyoqIE9ubHkgY2xhc3NlcyB0aGF0IGV4dGVuZHMgdGhpcyBjbGFzcyBjYW4gYmUgaGFuZGxlZC4gKi9cblx0Y2xhc3NUb0hhbmRsZT86IHR5cGVvZiBBa2Fpcm9Nb2R1bGU7XG5cblx0LyoqIERpcmVjdG9yeSB0byBtb2R1bGVzLiAqL1xuXHRkaXJlY3Rvcnk/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEZpbGUgZXh0ZW5zaW9ucyB0byBsb2FkLlxuXHQgKiBCeSBkZWZhdWx0IHRoaXMgaXMgLmpzLCAuanNvbiwgYW5kIC50cyBmaWxlcy5cblx0ICovXG5cdGV4dGVuc2lvbnM/OiBzdHJpbmdbXSB8IFNldDxzdHJpbmc+O1xuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgZm9yIGZpbGVzIHRvIGJlIGxvYWRlZC5cblx0ICogQ2FuIGJlIHNldCBpbmRpdmlkdWFsbHkgZm9yIGVhY2ggaGFuZGxlciBieSBvdmVycmlkaW5nIHRoZSBgbG9hZEFsbGAgbWV0aG9kLlxuXHQgKi9cblx0bG9hZEZpbHRlcj86IExvYWRQcmVkaWNhdGU7XG59XG4iXX0=