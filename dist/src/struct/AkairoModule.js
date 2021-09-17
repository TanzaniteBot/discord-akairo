"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base class for a module.
 * @param id - ID of module.
 * @param options - Options.
 */
class AkairoModule {
    constructor(id, { category = "default" } = {}) {
        this.id = id;
        this.categoryID = category;
        this.category = null;
        this.filepath = null;
        this.client = null;
        this.handler = null;
    }
    /**
     * Category this belongs to.
     */
    category;
    /**
     * ID of the category this belongs to.
     */
    categoryID;
    /**
     *  The Akairo client.
     */
    client;
    /**
     * The filepath.
     */
    filepath;
    /**
     * The handler.
     */
    handler;
    /**
     * ID of the module.
     */
    id;
    /**
     * Reloads the module.
     */
    reload() {
        return this.handler?.reload(this.id);
    }
    /**
     * Removes the module.
     */
    remove() {
        return this.handler?.remove(this.id);
    }
    /**
     * Returns the ID.
     */
    toString() {
        return this.id;
    }
}
exports.default = AkairoModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9Nb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQTs7OztHQUlHO0FBQ0gsTUFBOEIsWUFBWTtJQUN6QyxZQUFtQixFQUFVLEVBQUUsRUFBRSxRQUFRLEdBQUcsU0FBUyxLQUEwQixFQUFFO1FBQ2hGLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksUUFBUSxDQUFpQztJQUVoRDs7T0FFRztJQUNJLFVBQVUsQ0FBUztJQUUxQjs7T0FFRztJQUNJLE1BQU0sQ0FBZTtJQUU1Qjs7T0FFRztJQUNJLFFBQVEsQ0FBUztJQUV4Qjs7T0FFRztJQUNJLE9BQU8sQ0FBZ0I7SUFFOUI7O09BRUc7SUFDSSxFQUFFLENBQVM7SUFFbEI7O09BRUc7SUFDSCxNQUFNO1FBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFrQixDQUFDO0lBQ3ZELENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU07UUFDTCxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQVMsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ1AsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2hCLENBQUM7Q0FDRDtBQTVERCwrQkE0REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvSGFuZGxlciBmcm9tIFwiLi9Ba2Fpcm9IYW5kbGVyXCI7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYSBtb2R1bGUuXG4gKiBAcGFyYW0gaWQgLSBJRCBvZiBtb2R1bGUuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIEFrYWlyb01vZHVsZSB7XG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCB7IGNhdGVnb3J5ID0gXCJkZWZhdWx0XCIgfTogQWthaXJvTW9kdWxlT3B0aW9ucyA9IHt9KSB7XG5cdFx0dGhpcy5pZCA9IGlkO1xuXHRcdHRoaXMuY2F0ZWdvcnlJRCA9IGNhdGVnb3J5O1xuXHRcdHRoaXMuY2F0ZWdvcnkgPSBudWxsITtcblx0XHR0aGlzLmZpbGVwYXRoID0gbnVsbCE7XG5cdFx0dGhpcy5jbGllbnQgPSBudWxsITtcblx0XHR0aGlzLmhhbmRsZXIgPSBudWxsITtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYXRlZ29yeSB0aGlzIGJlbG9uZ3MgdG8uXG5cdCAqL1xuXHRwdWJsaWMgY2F0ZWdvcnk6IENhdGVnb3J5PHN0cmluZywgQWthaXJvTW9kdWxlPjtcblxuXHQvKipcblx0ICogSUQgb2YgdGhlIGNhdGVnb3J5IHRoaXMgYmVsb25ncyB0by5cblx0ICovXG5cdHB1YmxpYyBjYXRlZ29yeUlEOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqICBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogVGhlIGZpbGVwYXRoLlxuXHQgKi9cblx0cHVibGljIGZpbGVwYXRoOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGhhbmRsZXI6IEFrYWlyb0hhbmRsZXI7XG5cblx0LyoqXG5cdCAqIElEIG9mIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgaWQ6IHN0cmluZztcblxuXHQvKipcblx0ICogUmVsb2FkcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cmVsb2FkKCk6IFByb21pc2U8QWthaXJvTW9kdWxlPiB7XG5cdFx0cmV0dXJuIHRoaXMuaGFuZGxlcj8ucmVsb2FkKHRoaXMuaWQpIGFzIFByb21pc2U8dGhpcz47XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cmVtb3ZlKCk6IEFrYWlyb01vZHVsZSB7XG5cdFx0cmV0dXJuIHRoaXMuaGFuZGxlcj8ucmVtb3ZlKHRoaXMuaWQpIGFzIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgSUQuXG5cdCAqL1xuXHR0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLmlkO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWthaXJvTW9kdWxlT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBDYXRlZ29yeSBJRCBmb3Igb3JnYW5pemF0aW9uIHB1cnBvc2VzLlxuXHQgKiBEZWZhdWx0cyB0byBgZGVmYXVsdGAuXG5cdCAqL1xuXHRjYXRlZ29yeT86IHN0cmluZztcbn1cbiJdfQ==