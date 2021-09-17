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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FBOEU7QUFDOUUsOERBQXNDO0FBRXRDOzs7O0dBSUc7QUFDSCxNQUFxQixZQUE4QyxTQUFRLG1CQUFhO0lBQ3ZGLFlBQW1CLE9BQXVDLEVBQUUsYUFBNkI7UUFDeEYsS0FBSyxDQUFDLGFBQWEsSUFBSSxPQUFRLENBQUMsQ0FBQztRQUNqQyxNQUFNLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxHQUFHLE9BQVEsQ0FBQztRQUNsQyxNQUFNLEVBQUUsV0FBVyxHQUFHLEVBQUUsRUFBRSxHQUFHLE9BQVEsQ0FBQztRQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPLENBQTBCO0lBRXhDOztPQUVHO0lBQ0ksV0FBVyxDQUEwQjtJQUU1Qzs7T0FFRztJQUNJLElBQUksQ0FBYTtJQUV4Qjs7O09BR0c7SUFDSSxPQUFPLENBQUMsSUFBb0I7UUFDbEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN0QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEYsQ0FBQztJQUVEOzs7T0FHRztJQUNJLFdBQVcsQ0FBQyxJQUFvQjtRQUN0QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3RCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDNUQsQ0FBQyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsV0FBVyxJQUFJLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ25ELENBQUM7Q0FDRDtBQTlDRCwrQkE4Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDbGllbnQsIENsaWVudE9wdGlvbnMsIFNub3dmbGFrZSwgVXNlclJlc29sdmFibGUgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IENsaWVudFV0aWwgZnJvbSBcIi4vQ2xpZW50VXRpbFwiO1xuXG4vKipcbiAqIFRoZSBBa2Fpcm8gZnJhbWV3b3JrIGNsaWVudC4gQ3JlYXRlcyB0aGUgaGFuZGxlcnMgYW5kIHNldHMgdGhlbSB1cC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGNsaWVudC5cbiAqIEBwYXJhbSBjbGllbnRPcHRpb25zIC0gT3B0aW9ucyBmb3IgRGlzY29yZCBKUyBjbGllbnQuSWYgbm90IHNwZWNpZmllZCwgdGhlIHByZXZpb3VzIG9wdGlvbnMgcGFyYW1ldGVyIGlzIHVzZWQgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWthaXJvQ2xpZW50PFJlYWR5IGV4dGVuZHMgYm9vbGVhbiA9IGJvb2xlYW4+IGV4dGVuZHMgQ2xpZW50PFJlYWR5PiB7XG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb25zPzogQWthaXJvT3B0aW9ucyAmIENsaWVudE9wdGlvbnMsIGNsaWVudE9wdGlvbnM/OiBDbGllbnRPcHRpb25zKSB7XG5cdFx0c3VwZXIoY2xpZW50T3B0aW9ucyB8fCBvcHRpb25zISk7XG5cdFx0Y29uc3QgeyBvd25lcklEID0gXCJcIiB9ID0gb3B0aW9ucyE7XG5cdFx0Y29uc3QgeyBzdXBlclVzZXJJRCA9IFwiXCIgfSA9IG9wdGlvbnMhO1xuXHRcdHRoaXMub3duZXJJRCA9IG93bmVySUQ7XG5cdFx0dGhpcy5zdXBlclVzZXJJRCA9IHN1cGVyVXNlcklEO1xuXHRcdHRoaXMudXRpbCA9IG5ldyBDbGllbnRVdGlsKHRoaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBJRCBvZiB0aGUgb3duZXIocykuXG5cdCAqL1xuXHRwdWJsaWMgb3duZXJJRDogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW107XG5cblx0LyoqXG5cdCAqIFRoZSBJRCBvZiB0aGUgc3VwZXJVc2VyKHMpLlxuXHQgKi9cblx0cHVibGljIHN1cGVyVXNlcklEOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXTtcblxuXHQvKipcblx0ICogVXRpbGl0eSBtZXRob2RzLlxuXHQgKi9cblx0cHVibGljIHV0aWw6IENsaWVudFV0aWw7XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHVzZXIgaXMgdGhlIG93bmVyIG9mIHRoaXMgYm90LlxuXHQgKiBAcGFyYW0gdXNlciAtIFVzZXIgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgaXNPd25lcih1c2VyOiBVc2VyUmVzb2x2YWJsZSk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGlkID0gdGhpcy51c2Vycy5yZXNvbHZlSWQodXNlcik7XG5cdFx0aWYgKCFpZCkgcmV0dXJuIGZhbHNlO1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMub3duZXJJRCkgPyB0aGlzLm93bmVySUQuaW5jbHVkZXMoaWQpIDogaWQgPT09IHRoaXMub3duZXJJRDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSB1c2VyIGlzIGEgc3VwZXIgdXNlciBvZiB0aGlzIGJvdC5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIGNoZWNrLlxuXHQgKi9cblx0cHVibGljIGlzU3VwZXJVc2VyKHVzZXI6IFVzZXJSZXNvbHZhYmxlKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgaWQgPSB0aGlzLnVzZXJzLnJlc29sdmVJZCh1c2VyKTtcblx0XHRpZiAoIWlkKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkodGhpcy5zdXBlclVzZXJJRClcblx0XHRcdD8gdGhpcy5zdXBlclVzZXJJRC5pbmNsdWRlcyhpZCkgfHwgdGhpcy5vd25lcklELmluY2x1ZGVzKGlkKVxuXHRcdFx0OiBpZCA9PT0gdGhpcy5zdXBlclVzZXJJRCB8fCBpZCA9PT0gdGhpcy5vd25lcklEO1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgdGhlIGNsaWVudC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBa2Fpcm9PcHRpb25zIHtcblx0LyoqIERpc2NvcmQgSUQgb2YgdGhlIGNsaWVudCBvd25lcihzKS4gKi9cblx0b3duZXJJRD86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdO1xuXG5cdC8qKiBEaXNjb3JkIElEIG9mIHRoZSBjbGllbnQgc3VwZXJVc2VycyhzKS4gKi9cblx0c3VwZXJVc2VySUQ/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXTtcbn1cbiJdfQ==