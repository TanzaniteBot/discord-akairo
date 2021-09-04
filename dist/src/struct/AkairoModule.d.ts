import Category from "../util/Category";
import AkairoClient from "./AkairoClient";
import AkairoHandler from "./AkairoHandler";
/**
 * Base class for a module.
 * @param id - ID of module.
 * @param options - Options.
 */
export default abstract class AkairoModule {
    constructor(id: string, { category }?: AkairoModuleOptions);
    /**
     * Category this belongs to.
     */
    category: Category<string, AkairoModule> | null;
    /**
     * ID of the category this belongs to.
     */
    categoryID: string;
    /**
     *  The Akairo client.
     */
    client: AkairoClient | null;
    /**
     * The filepath.
     */
    filepath: string | null;
    /**
     * The handler.
     */
    handler: AkairoHandler | null;
    /**
     * ID of the module.
     */
    id: string;
    /**
     * Reloads the module.
     */
    reload(): AkairoModule;
    /**
     * Removes the module.
     */
    remove(): AkairoModule;
    /**
     * Returns the ID.
     */
    toString(): string;
}
export interface AkairoModuleOptions {
    /**
     * Category ID for organization purposes.
     * Defaults to `default`.
     */
    category?: string;
}
//# sourceMappingURL=AkairoModule.d.ts.map