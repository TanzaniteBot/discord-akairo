"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ClientUtil_1 = __importDefault(require("./ClientUtil"));
/**
 * The Akairo framework client. Creates the handlers and sets them up.
 * @param options - Options for the client.
 * @param clientOptions - Options for Discord JS client.If not specified, the previous options parameter is used instead.
 */
class AkairoClient extends discord_js_1.Client {
    constructor(options, clientOptions) {
        super(clientOptions || options);
        const { ownerID = "" } = options;
        const { superUserID = "" } = options;
        this.ownerID = ownerID;
        this.superUserID = superUserID;
        this.util = new ClientUtil_1.default(this);
    }
    /**
     * The ID of the owner(s).
     */
    ownerID;
    /**
     * The ID of the superUser(s).
     */
    superUserID;
    /**
     * Utility methods.
     */
    util;
    /**
     * Checks if a user is the owner of this bot.
     * @param user - User to check.
     */
    isOwner(user) {
        const id = this.users.resolveId(user);
        if (!id)
            return false;
        return Array.isArray(this.ownerID)
            ? this.ownerID.includes(id)
            : id === this.ownerID;
    }
    /**
     * Checks if a user is a super user of this bot.
     * @param user - User to check.
     */
    isSuperUser(user) {
        const id = this.users.resolveId(user);
        if (!id)
            return false;
        return Array.isArray(this.superUserID)
            ? this.superUserID.includes(id) || this.ownerID.includes(id)
            : id === this.superUserID || id === this.ownerID;
    }
}
exports.default = AkairoClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBOEU7QUFDOUUsOERBQXNDO0FBRXRDOzs7O0dBSUc7QUFDSCxNQUFxQixZQUFhLFNBQVEsbUJBQU07SUFDL0MsWUFDQyxPQUF1QyxFQUN2QyxhQUE2QjtRQUU3QixLQUFLLENBQUMsYUFBYSxJQUFJLE9BQU8sQ0FBQyxDQUFDO1FBRWhDLE1BQU0sRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRWpDLE1BQU0sRUFBRSxXQUFXLEdBQUcsRUFBRSxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBRXJDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBRS9CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU8sQ0FBMEI7SUFFeEM7O09BRUc7SUFDSSxXQUFXLENBQTBCO0lBRTVDOztPQUVHO0lBQ0ksSUFBSSxDQUFhO0lBRXhCOzs7T0FHRztJQUNJLE9BQU8sQ0FBQyxJQUFvQjtRQUNsQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3RCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDM0IsQ0FBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7O09BR0c7SUFDSSxXQUFXLENBQUMsSUFBb0I7UUFDdEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN0QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNyQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQzVELENBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNuRCxDQUFDO0NBQ0Q7QUF4REQsK0JBd0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2xpZW50LCBDbGllbnRPcHRpb25zLCBTbm93Zmxha2UsIFVzZXJSZXNvbHZhYmxlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBDbGllbnRVdGlsIGZyb20gXCIuL0NsaWVudFV0aWxcIjtcblxuLyoqXG4gKiBUaGUgQWthaXJvIGZyYW1ld29yayBjbGllbnQuIENyZWF0ZXMgdGhlIGhhbmRsZXJzIGFuZCBzZXRzIHRoZW0gdXAuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBjbGllbnQuXG4gKiBAcGFyYW0gY2xpZW50T3B0aW9ucyAtIE9wdGlvbnMgZm9yIERpc2NvcmQgSlMgY2xpZW50LklmIG5vdCBzcGVjaWZpZWQsIHRoZSBwcmV2aW91cyBvcHRpb25zIHBhcmFtZXRlciBpcyB1c2VkIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFrYWlyb0NsaWVudCBleHRlbmRzIENsaWVudCB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRvcHRpb25zPzogQWthaXJvT3B0aW9ucyAmIENsaWVudE9wdGlvbnMsXG5cdFx0Y2xpZW50T3B0aW9ucz86IENsaWVudE9wdGlvbnNcblx0KSB7XG5cdFx0c3VwZXIoY2xpZW50T3B0aW9ucyB8fCBvcHRpb25zKTtcblxuXHRcdGNvbnN0IHsgb3duZXJJRCA9IFwiXCIgfSA9IG9wdGlvbnM7XG5cblx0XHRjb25zdCB7IHN1cGVyVXNlcklEID0gXCJcIiB9ID0gb3B0aW9ucztcblxuXHRcdHRoaXMub3duZXJJRCA9IG93bmVySUQ7XG5cblx0XHR0aGlzLnN1cGVyVXNlcklEID0gc3VwZXJVc2VySUQ7XG5cblx0XHR0aGlzLnV0aWwgPSBuZXcgQ2xpZW50VXRpbCh0aGlzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgSUQgb2YgdGhlIG93bmVyKHMpLlxuXHQgKi9cblx0cHVibGljIG93bmVySUQ6IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdO1xuXG5cdC8qKlxuXHQgKiBUaGUgSUQgb2YgdGhlIHN1cGVyVXNlcihzKS5cblx0ICovXG5cdHB1YmxpYyBzdXBlclVzZXJJRDogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW107XG5cblx0LyoqXG5cdCAqIFV0aWxpdHkgbWV0aG9kcy5cblx0ICovXG5cdHB1YmxpYyB1dGlsOiBDbGllbnRVdGlsO1xuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSB1c2VyIGlzIHRoZSBvd25lciBvZiB0aGlzIGJvdC5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIGNoZWNrLlxuXHQgKi9cblx0cHVibGljIGlzT3duZXIodXNlcjogVXNlclJlc29sdmFibGUpOiBib29sZWFuIHtcblx0XHRjb25zdCBpZCA9IHRoaXMudXNlcnMucmVzb2x2ZUlkKHVzZXIpO1xuXHRcdGlmICghaWQpIHJldHVybiBmYWxzZTtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheSh0aGlzLm93bmVySUQpXG5cdFx0XHQ/IHRoaXMub3duZXJJRC5pbmNsdWRlcyhpZClcblx0XHRcdDogaWQgPT09IHRoaXMub3duZXJJRDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSB1c2VyIGlzIGEgc3VwZXIgdXNlciBvZiB0aGlzIGJvdC5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIGNoZWNrLlxuXHQgKi9cblx0cHVibGljIGlzU3VwZXJVc2VyKHVzZXI6IFVzZXJSZXNvbHZhYmxlKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgaWQgPSB0aGlzLnVzZXJzLnJlc29sdmVJZCh1c2VyKTtcblx0XHRpZiAoIWlkKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkodGhpcy5zdXBlclVzZXJJRClcblx0XHRcdD8gdGhpcy5zdXBlclVzZXJJRC5pbmNsdWRlcyhpZCkgfHwgdGhpcy5vd25lcklELmluY2x1ZGVzKGlkKVxuXHRcdFx0OiBpZCA9PT0gdGhpcy5zdXBlclVzZXJJRCB8fCBpZCA9PT0gdGhpcy5vd25lcklEO1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgdGhlIGNsaWVudC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBa2Fpcm9PcHRpb25zIHtcblx0LyoqIERpc2NvcmQgSUQgb2YgdGhlIGNsaWVudCBvd25lcihzKS4gKi9cblx0b3duZXJJRD86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdO1xuXG5cdC8qKiBEaXNjb3JkIElEIG9mIHRoZSBjbGllbnQgc3VwZXJVc2VycyhzKS4gKi9cblx0c3VwZXJVc2VySUQ/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXTtcbn1cbiJdfQ==
