"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
        return Array.isArray(this.ownerID) ? this.ownerID.includes(id) : id === this.ownerID;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FBOEU7QUFDOUUsOERBQXNDO0FBRXRDOzs7O0dBSUc7QUFDSCxNQUFxQixZQUE4QyxTQUFRLG1CQUFhO0lBQ3ZGLFlBQW1CLE9BQXVDLEVBQUUsYUFBNkI7UUFDeEYsS0FBSyxDQUFDLGFBQWEsSUFBSSxPQUFRLENBQUMsQ0FBQztRQUVqQyxNQUFNLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxHQUFHLE9BQVEsQ0FBQztRQUVsQyxNQUFNLEVBQUUsV0FBVyxHQUFHLEVBQUUsRUFBRSxHQUFHLE9BQVEsQ0FBQztRQUV0QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUUvQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPLENBQTBCO0lBRXhDOztPQUVHO0lBQ0ksV0FBVyxDQUEwQjtJQUU1Qzs7T0FFRztJQUNJLElBQUksQ0FBYTtJQUV4Qjs7O09BR0c7SUFDSSxPQUFPLENBQUMsSUFBb0I7UUFDbEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN0QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEYsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFdBQVcsQ0FBQyxJQUFvQjtRQUN0QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3RCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDNUQsQ0FBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ25ELENBQUM7Q0FDRDtBQW5ERCwrQkFtREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbGllbnQsIENsaWVudE9wdGlvbnMsIFNub3dmbGFrZSwgVXNlclJlc29sdmFibGUgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IENsaWVudFV0aWwgZnJvbSBcIi4vQ2xpZW50VXRpbFwiO1xuXG4vKipcbiAqIFRoZSBBa2Fpcm8gZnJhbWV3b3JrIGNsaWVudC4gQ3JlYXRlcyB0aGUgaGFuZGxlcnMgYW5kIHNldHMgdGhlbSB1cC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGNsaWVudC5cbiAqIEBwYXJhbSBjbGllbnRPcHRpb25zIC0gT3B0aW9ucyBmb3IgRGlzY29yZCBKUyBjbGllbnQuSWYgbm90IHNwZWNpZmllZCwgdGhlIHByZXZpb3VzIG9wdGlvbnMgcGFyYW1ldGVyIGlzIHVzZWQgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvQ2xpZW50PFJlYWR5IGV4dGVuZHMgYm9vbGVhbiA9IGJvb2xlYW4+IGV4dGVuZHMgQ2xpZW50PFJlYWR5PiB7XG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zPzogQWthaXJvT3B0aW9ucyAmIENsaWVudE9wdGlvbnMsIGNsaWVudE9wdGlvbnM/OiBDbGllbnRPcHRpb25zKSB7XG5cdFx0c3VwZXIoY2xpZW50T3B0aW9ucyB8fCBvcHRpb25zISk7XG5cblx0XHRjb25zdCB7IG93bmVySUQgPSBcIlwiIH0gPSBvcHRpb25zITtcblxuXHRcdGNvbnN0IHsgc3VwZXJVc2VySUQgPSBcIlwiIH0gPSBvcHRpb25zITtcblxuXHRcdHRoaXMub3duZXJJRCA9IG93bmVySUQ7XG5cblx0XHR0aGlzLnN1cGVyVXNlcklEID0gc3VwZXJVc2VySUQ7XG5cblx0XHR0aGlzLnV0aWwgPSBuZXcgQ2xpZW50VXRpbCh0aGlzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgSUQgb2YgdGhlIG93bmVyKHMpLlxuXHQgKi9cblx0cHVibGljIG93bmVySUQ6IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdO1xuXG5cdC8qKlxuXHQgKiBUaGUgSUQgb2YgdGhlIHN1cGVyVXNlcihzKS5cblx0ICovXG5cdHB1YmxpYyBzdXBlclVzZXJJRDogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW107XG5cblx0LyoqXG5cdCAqIFV0aWxpdHkgbWV0aG9kcy5cblx0ICovXG5cdHB1YmxpYyB1dGlsOiBDbGllbnRVdGlsO1xuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSB1c2VyIGlzIHRoZSBvd25lciBvZiB0aGlzIGJvdC5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIGNoZWNrLlxuXHQgKi9cblx0cHVibGljIGlzT3duZXIodXNlcjogVXNlclJlc29sdmFibGUpOiBib29sZWFuIHtcblx0XHRjb25zdCBpZCA9IHRoaXMudXNlcnMucmVzb2x2ZUlkKHVzZXIpO1xuXHRcdGlmICghaWQpIHJldHVybiBmYWxzZTtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheSh0aGlzLm93bmVySUQpID8gdGhpcy5vd25lcklELmluY2x1ZGVzKGlkKSA6IGlkID09PSB0aGlzLm93bmVySUQ7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgdXNlciBpcyBhIHN1cGVyIHVzZXIgb2YgdGhpcyBib3QuXG5cdCAqIEBwYXJhbSB1c2VyIC0gVXNlciB0byBjaGVjay5cblx0ICovXG5cdHB1YmxpYyBpc1N1cGVyVXNlcih1c2VyOiBVc2VyUmVzb2x2YWJsZSk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGlkID0gdGhpcy51c2Vycy5yZXNvbHZlSWQodXNlcik7XG5cdFx0aWYgKCFpZCkgcmV0dXJuIGZhbHNlO1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMuc3VwZXJVc2VySUQpXG5cdFx0XHQ/IHRoaXMuc3VwZXJVc2VySUQuaW5jbHVkZXMoaWQpIHx8IHRoaXMub3duZXJJRC5pbmNsdWRlcyhpZClcblx0XHRcdDogaWQgPT09IHRoaXMuc3VwZXJVc2VySUQgfHwgaWQgPT09IHRoaXMub3duZXJJRDtcblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHRoZSBjbGllbnQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWthaXJvT3B0aW9ucyB7XG5cdC8qKiBEaXNjb3JkIElEIG9mIHRoZSBjbGllbnQgb3duZXIocykuICovXG5cdG93bmVySUQ/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXTtcblxuXHQvKiogRGlzY29yZCBJRCBvZiB0aGUgY2xpZW50IHN1cGVyVXNlcnMocykuICovXG5cdHN1cGVyVXNlcklEPzogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW107XG59XG4iXX0=