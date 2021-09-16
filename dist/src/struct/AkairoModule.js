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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9Nb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQTs7OztHQUlHO0FBQ0gsTUFBOEIsWUFBWTtJQUN6QyxZQUFtQixFQUFVLEVBQUUsRUFBRSxRQUFRLEdBQUcsU0FBUyxLQUEwQixFQUFFO1FBQ2hGLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBRWIsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFFM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFLLENBQUM7UUFFdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFLLENBQUM7UUFFdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFLLENBQUM7UUFFcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksUUFBUSxDQUFpQztJQUVoRDs7T0FFRztJQUNJLFVBQVUsQ0FBUztJQUUxQjs7T0FFRztJQUNJLE1BQU0sQ0FBZTtJQUU1Qjs7T0FFRztJQUNJLFFBQVEsQ0FBUztJQUV4Qjs7T0FFRztJQUNJLE9BQU8sQ0FBZ0I7SUFFOUI7O09BRUc7SUFDSSxFQUFFLENBQVM7SUFFbEI7O09BRUc7SUFDSCxNQUFNO1FBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFrQixDQUFDO0lBQ3ZELENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU07UUFDTCxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQVMsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ1AsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2hCLENBQUM7Q0FDRDtBQWpFRCwrQkFpRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvSGFuZGxlciBmcm9tIFwiLi9Ba2Fpcm9IYW5kbGVyXCI7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYSBtb2R1bGUuXG4gKiBAcGFyYW0gaWQgLSBJRCBvZiBtb2R1bGUuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIEFrYWlyb01vZHVsZSB7XG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCB7IGNhdGVnb3J5ID0gXCJkZWZhdWx0XCIgfTogQWthaXJvTW9kdWxlT3B0aW9ucyA9IHt9KSB7XG5cdFx0dGhpcy5pZCA9IGlkO1xuXG5cdFx0dGhpcy5jYXRlZ29yeUlEID0gY2F0ZWdvcnk7XG5cblx0XHR0aGlzLmNhdGVnb3J5ID0gbnVsbCE7XG5cblx0XHR0aGlzLmZpbGVwYXRoID0gbnVsbCE7XG5cblx0XHR0aGlzLmNsaWVudCA9IG51bGwhO1xuXG5cdFx0dGhpcy5oYW5kbGVyID0gbnVsbCE7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0ZWdvcnkgdGhpcyBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHVibGljIGNhdGVnb3J5OiBDYXRlZ29yeTxzdHJpbmcsIEFrYWlyb01vZHVsZT47XG5cblx0LyoqXG5cdCAqIElEIG9mIHRoZSBjYXRlZ29yeSB0aGlzIGJlbG9uZ3MgdG8uXG5cdCAqL1xuXHRwdWJsaWMgY2F0ZWdvcnlJRDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiAgVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSBmaWxlcGF0aC5cblx0ICovXG5cdHB1YmxpYyBmaWxlcGF0aDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBoYW5kbGVyOiBBa2Fpcm9IYW5kbGVyO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIGlkOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgdGhlIG1vZHVsZS5cblx0ICovXG5cdHJlbG9hZCgpOiBQcm9taXNlPEFrYWlyb01vZHVsZT4ge1xuXHRcdHJldHVybiB0aGlzLmhhbmRsZXI/LnJlbG9hZCh0aGlzLmlkKSBhcyBQcm9taXNlPHRoaXM+O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIG1vZHVsZS5cblx0ICovXG5cdHJlbW92ZSgpOiBBa2Fpcm9Nb2R1bGUge1xuXHRcdHJldHVybiB0aGlzLmhhbmRsZXI/LnJlbW92ZSh0aGlzLmlkKSBhcyB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIElELlxuXHQgKi9cblx0dG9TdHJpbmcoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5pZDtcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFrYWlyb01vZHVsZU9wdGlvbnMge1xuXHQvKipcblx0ICogQ2F0ZWdvcnkgSUQgZm9yIG9yZ2FuaXphdGlvbiBwdXJwb3Nlcy5cblx0ICogRGVmYXVsdHMgdG8gYGRlZmF1bHRgLlxuXHQgKi9cblx0Y2F0ZWdvcnk/OiBzdHJpbmc7XG59XG4iXX0=