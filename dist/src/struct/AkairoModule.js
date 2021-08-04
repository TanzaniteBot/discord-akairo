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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9Nb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQTs7OztHQUlHO0FBQ0gsTUFBOEIsWUFBWTtJQUN6QyxZQUNDLEVBQVUsRUFDVixFQUFFLFFBQVEsR0FBRyxTQUFTLEtBQTBCLEVBQUU7UUFFbEQsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFFYixJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztRQUUzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUVyQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUVyQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUVuQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxRQUFRLENBQWlDO0lBRWhEOztPQUVHO0lBQ0ksVUFBVSxDQUFTO0lBRTFCOztPQUVHO0lBQ0ksTUFBTSxDQUFlO0lBRTVCOztPQUVHO0lBQ0ksUUFBUSxDQUFTO0lBRXhCOztPQUVHO0lBQ0ksT0FBTyxDQUFnQjtJQUU5Qjs7T0FFRztJQUNJLEVBQUUsQ0FBUztJQUVsQjs7T0FFRztJQUNILE1BQU07UUFDTCxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQVMsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNO1FBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFTLENBQUM7SUFDOUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNQLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNoQixDQUFDO0NBQ0Q7QUFwRUQsK0JBb0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIgZnJvbSBcIi4vQWthaXJvSGFuZGxlclwiO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGEgbW9kdWxlLlxuICogQHBhcmFtIGlkIC0gSUQgb2YgbW9kdWxlLlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBBa2Fpcm9Nb2R1bGUge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0aWQ6IHN0cmluZyxcblx0XHR7IGNhdGVnb3J5ID0gXCJkZWZhdWx0XCIgfTogQWthaXJvTW9kdWxlT3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdHRoaXMuaWQgPSBpZDtcblxuXHRcdHRoaXMuY2F0ZWdvcnlJRCA9IGNhdGVnb3J5O1xuXG5cdFx0dGhpcy5jYXRlZ29yeSA9IG51bGw7XG5cblx0XHR0aGlzLmZpbGVwYXRoID0gbnVsbDtcblxuXHRcdHRoaXMuY2xpZW50ID0gbnVsbDtcblxuXHRcdHRoaXMuaGFuZGxlciA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0ZWdvcnkgdGhpcyBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHVibGljIGNhdGVnb3J5OiBDYXRlZ29yeTxzdHJpbmcsIEFrYWlyb01vZHVsZT47XG5cblx0LyoqXG5cdCAqIElEIG9mIHRoZSBjYXRlZ29yeSB0aGlzIGJlbG9uZ3MgdG8uXG5cdCAqL1xuXHRwdWJsaWMgY2F0ZWdvcnlJRDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiAgVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSBmaWxlcGF0aC5cblx0ICovXG5cdHB1YmxpYyBmaWxlcGF0aDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBoYW5kbGVyOiBBa2Fpcm9IYW5kbGVyO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIGlkOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgdGhlIG1vZHVsZS5cblx0ICovXG5cdHJlbG9hZCgpOiBBa2Fpcm9Nb2R1bGUge1xuXHRcdHJldHVybiB0aGlzLmhhbmRsZXI/LnJlbG9hZCh0aGlzLmlkKSBhcyB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIG1vZHVsZS5cblx0ICovXG5cdHJlbW92ZSgpOiBBa2Fpcm9Nb2R1bGUge1xuXHRcdHJldHVybiB0aGlzLmhhbmRsZXI/LnJlbW92ZSh0aGlzLmlkKSBhcyB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIElELlxuXHQgKi9cblx0dG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5pZDtcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFrYWlyb01vZHVsZU9wdGlvbnMge1xuXHQvKipcblx0ICogQ2F0ZWdvcnkgSUQgZm9yIG9yZ2FuaXphdGlvbiBwdXJwb3Nlcy5cblx0ICogRGVmYXVsdHMgdG8gYGRlZmF1bHRgLlxuXHQgKi9cblx0Y2F0ZWdvcnk/OiBzdHJpbmc7XG59XG4iXX0=