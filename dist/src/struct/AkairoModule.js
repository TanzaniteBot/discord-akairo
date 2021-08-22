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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9Nb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQTs7OztHQUlHO0FBQ0gsTUFBOEIsWUFBWTtJQUN6QyxZQUFtQixFQUFVLEVBQUUsRUFBRSxRQUFRLEdBQUcsU0FBUyxLQUEwQixFQUFFO1FBQ2hGLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBRWIsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFFM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFFbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksUUFBUSxDQUFpQztJQUVoRDs7T0FFRztJQUNJLFVBQVUsQ0FBUztJQUUxQjs7T0FFRztJQUNJLE1BQU0sQ0FBZTtJQUU1Qjs7T0FFRztJQUNJLFFBQVEsQ0FBUztJQUV4Qjs7T0FFRztJQUNJLE9BQU8sQ0FBZ0I7SUFFOUI7O09BRUc7SUFDSSxFQUFFLENBQVM7SUFFbEI7O09BRUc7SUFDSCxNQUFNO1FBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFTLENBQUM7SUFDOUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTTtRQUNMLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBUyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDUCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDaEIsQ0FBQztDQUNEO0FBakVELCtCQWlFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyIGZyb20gXCIuL0FrYWlyb0hhbmRsZXJcIjtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhIG1vZHVsZS5cbiAqIEBwYXJhbSBpZCAtIElEIG9mIG1vZHVsZS5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgQWthaXJvTW9kdWxlIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHsgY2F0ZWdvcnkgPSBcImRlZmF1bHRcIiB9OiBBa2Fpcm9Nb2R1bGVPcHRpb25zID0ge30pIHtcblx0XHR0aGlzLmlkID0gaWQ7XG5cblx0XHR0aGlzLmNhdGVnb3J5SUQgPSBjYXRlZ29yeTtcblxuXHRcdHRoaXMuY2F0ZWdvcnkgPSBudWxsO1xuXG5cdFx0dGhpcy5maWxlcGF0aCA9IG51bGw7XG5cblx0XHR0aGlzLmNsaWVudCA9IG51bGw7XG5cblx0XHR0aGlzLmhhbmRsZXIgPSBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhdGVnb3J5IHRoaXMgYmVsb25ncyB0by5cblx0ICovXG5cdHB1YmxpYyBjYXRlZ29yeTogQ2F0ZWdvcnk8c3RyaW5nLCBBa2Fpcm9Nb2R1bGU+O1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgY2F0ZWdvcnkgdGhpcyBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHVibGljIGNhdGVnb3J5SUQ6IHN0cmluZztcblxuXHQvKipcblx0ICogIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBUaGUgZmlsZXBhdGguXG5cdCAqL1xuXHRwdWJsaWMgZmlsZXBhdGg6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgaGFuZGxlcjogQWthaXJvSGFuZGxlcjtcblxuXHQvKipcblx0ICogSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBpZDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRyZWxvYWQoKTogQWthaXJvTW9kdWxlIHtcblx0XHRyZXR1cm4gdGhpcy5oYW5kbGVyPy5yZWxvYWQodGhpcy5pZCkgYXMgdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRyZW1vdmUoKTogQWthaXJvTW9kdWxlIHtcblx0XHRyZXR1cm4gdGhpcy5oYW5kbGVyPy5yZW1vdmUodGhpcy5pZCkgYXMgdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBJRC5cblx0ICovXG5cdHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuaWQ7XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBBa2Fpcm9Nb2R1bGVPcHRpb25zIHtcblx0LyoqXG5cdCAqIENhdGVnb3J5IElEIGZvciBvcmdhbml6YXRpb24gcHVycG9zZXMuXG5cdCAqIERlZmF1bHRzIHRvIGBkZWZhdWx0YC5cblx0ICovXG5cdGNhdGVnb3J5Pzogc3RyaW5nO1xufVxuIl19