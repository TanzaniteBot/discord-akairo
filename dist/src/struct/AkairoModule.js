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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9Nb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQTs7OztHQUlHO0FBQ0gsTUFBOEIsWUFBWTtJQUN6QyxZQUFtQixFQUFVLEVBQUUsRUFBRSxRQUFRLEdBQUcsU0FBUyxLQUEwQixFQUFFO1FBQ2hGLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBRWIsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFFM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFFckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFFbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksUUFBUSxDQUF3QztJQUV2RDs7T0FFRztJQUNJLFVBQVUsQ0FBUztJQUUxQjs7T0FFRztJQUNJLE1BQU0sQ0FBc0I7SUFFbkM7O09BRUc7SUFDSSxRQUFRLENBQWdCO0lBRS9COztPQUVHO0lBQ0ksT0FBTyxDQUF1QjtJQUVyQzs7T0FFRztJQUNJLEVBQUUsQ0FBUztJQUVsQjs7T0FFRztJQUNILE1BQU07UUFDTCxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQVMsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNO1FBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFTLENBQUM7SUFDOUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNQLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNoQixDQUFDO0NBQ0Q7QUFqRUQsK0JBaUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIgZnJvbSBcIi4vQWthaXJvSGFuZGxlclwiO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGEgbW9kdWxlLlxuICogQHBhcmFtIGlkIC0gSUQgb2YgbW9kdWxlLlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBBa2Fpcm9Nb2R1bGUge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgeyBjYXRlZ29yeSA9IFwiZGVmYXVsdFwiIH06IEFrYWlyb01vZHVsZU9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuaWQgPSBpZDtcblxuXHRcdHRoaXMuY2F0ZWdvcnlJRCA9IGNhdGVnb3J5O1xuXG5cdFx0dGhpcy5jYXRlZ29yeSA9IG51bGw7XG5cblx0XHR0aGlzLmZpbGVwYXRoID0gbnVsbDtcblxuXHRcdHRoaXMuY2xpZW50ID0gbnVsbDtcblxuXHRcdHRoaXMuaGFuZGxlciA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0ZWdvcnkgdGhpcyBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHVibGljIGNhdGVnb3J5OiBDYXRlZ29yeTxzdHJpbmcsIEFrYWlyb01vZHVsZT4gfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgY2F0ZWdvcnkgdGhpcyBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHVibGljIGNhdGVnb3J5SUQ6IHN0cmluZztcblxuXHQvKipcblx0ICogIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGNsaWVudDogQWthaXJvQ2xpZW50IHwgbnVsbDtcblxuXHQvKipcblx0ICogVGhlIGZpbGVwYXRoLlxuXHQgKi9cblx0cHVibGljIGZpbGVwYXRoOiBzdHJpbmcgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBoYW5kbGVyOiBBa2Fpcm9IYW5kbGVyIHwgbnVsbDtcblxuXHQvKipcblx0ICogSUQgb2YgdGhlIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBpZDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRyZWxvYWQoKTogQWthaXJvTW9kdWxlIHtcblx0XHRyZXR1cm4gdGhpcy5oYW5kbGVyPy5yZWxvYWQodGhpcy5pZCkgYXMgdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRyZW1vdmUoKTogQWthaXJvTW9kdWxlIHtcblx0XHRyZXR1cm4gdGhpcy5oYW5kbGVyPy5yZW1vdmUodGhpcy5pZCkgYXMgdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBJRC5cblx0ICovXG5cdHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuaWQ7XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBBa2Fpcm9Nb2R1bGVPcHRpb25zIHtcblx0LyoqXG5cdCAqIENhdGVnb3J5IElEIGZvciBvcmdhbml6YXRpb24gcHVycG9zZXMuXG5cdCAqIERlZmF1bHRzIHRvIGBkZWZhdWx0YC5cblx0ICovXG5cdGNhdGVnb3J5Pzogc3RyaW5nO1xufVxuIl19