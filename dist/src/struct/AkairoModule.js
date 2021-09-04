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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9Nb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQTs7OztHQUlHO0FBQ0gsTUFBOEIsWUFBWTtJQUN6QyxZQUFtQixFQUFVLEVBQUUsRUFBRSxRQUFRLEdBQUcsU0FBUyxLQUEwQixFQUFFO1FBQ2hGLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBRWIsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFFM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFLLENBQUM7UUFFdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFLLENBQUM7UUFFdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFLLENBQUM7UUFFcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksUUFBUSxDQUFpQztJQUVoRDs7T0FFRztJQUNJLFVBQVUsQ0FBUztJQUUxQjs7T0FFRztJQUNJLE1BQU0sQ0FBZTtJQUU1Qjs7T0FFRztJQUNJLFFBQVEsQ0FBUztJQUV4Qjs7T0FFRztJQUNJLE9BQU8sQ0FBZ0I7SUFFOUI7O09BRUc7SUFDSSxFQUFFLENBQVM7SUFFbEI7O09BRUc7SUFDSCxNQUFNO1FBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFTLENBQUM7SUFDOUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTTtRQUNMLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBUyxDQUFDO0lBQzlDLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDUCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDaEIsQ0FBQztDQUNEO0FBakVELCtCQWlFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyIGZyb20gXCIuL0FrYWlyb0hhbmRsZXJcIjtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhIG1vZHVsZS5cbiAqIEBwYXJhbSBpZCAtIElEIG9mIG1vZHVsZS5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgQWthaXJvTW9kdWxlIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHsgY2F0ZWdvcnkgPSBcImRlZmF1bHRcIiB9OiBBa2Fpcm9Nb2R1bGVPcHRpb25zID0ge30pIHtcblx0XHR0aGlzLmlkID0gaWQ7XG5cblx0XHR0aGlzLmNhdGVnb3J5SUQgPSBjYXRlZ29yeTtcblxuXHRcdHRoaXMuY2F0ZWdvcnkgPSBudWxsITtcblxuXHRcdHRoaXMuZmlsZXBhdGggPSBudWxsITtcblxuXHRcdHRoaXMuY2xpZW50ID0gbnVsbCE7XG5cblx0XHR0aGlzLmhhbmRsZXIgPSBudWxsITtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYXRlZ29yeSB0aGlzIGJlbG9uZ3MgdG8uXG5cdCAqL1xuXHRwdWJsaWMgY2F0ZWdvcnk6IENhdGVnb3J5PHN0cmluZywgQWthaXJvTW9kdWxlPjtcblxuXHQvKipcblx0ICogSUQgb2YgdGhlIGNhdGVnb3J5IHRoaXMgYmVsb25ncyB0by5cblx0ICovXG5cdHB1YmxpYyBjYXRlZ29yeUlEOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqICBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogVGhlIGZpbGVwYXRoLlxuXHQgKi9cblx0cHVibGljIGZpbGVwYXRoOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGhhbmRsZXI6IEFrYWlyb0hhbmRsZXI7XG5cblx0LyoqXG5cdCAqIElEIG9mIHRoZSBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgaWQ6IHN0cmluZztcblxuXHQvKipcblx0ICogUmVsb2FkcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cmVsb2FkKCk6IEFrYWlyb01vZHVsZSB7XG5cdFx0cmV0dXJuIHRoaXMuaGFuZGxlcj8ucmVsb2FkKHRoaXMuaWQpIGFzIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyB0aGUgbW9kdWxlLlxuXHQgKi9cblx0cmVtb3ZlKCk6IEFrYWlyb01vZHVsZSB7XG5cdFx0cmV0dXJuIHRoaXMuaGFuZGxlcj8ucmVtb3ZlKHRoaXMuaWQpIGFzIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgSUQuXG5cdCAqL1xuXHR0b1N0cmluZygpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLmlkO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWthaXJvTW9kdWxlT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBDYXRlZ29yeSBJRCBmb3Igb3JnYW5pemF0aW9uIHB1cnBvc2VzLlxuXHQgKiBEZWZhdWx0cyB0byBgZGVmYXVsdGAuXG5cdCAqL1xuXHRjYXRlZ29yeT86IHN0cmluZztcbn1cbiJdfQ==