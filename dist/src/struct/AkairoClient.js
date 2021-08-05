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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWthaXJvQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0cnVjdC9Ba2Fpcm9DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FBOEU7QUFDOUUsOERBQXNDO0FBRXRDOzs7O0dBSUc7QUFDSCxNQUFxQixZQUVuQixTQUFRLG1CQUFhO0lBQ3RCLFlBQ0MsT0FBdUMsRUFDdkMsYUFBNkI7UUFFN0IsS0FBSyxDQUFDLGFBQWEsSUFBSSxPQUFPLENBQUMsQ0FBQztRQUVoQyxNQUFNLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUVqQyxNQUFNLEVBQUUsV0FBVyxHQUFHLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUVyQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUUvQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPLENBQTBCO0lBRXhDOztPQUVHO0lBQ0ksV0FBVyxDQUEwQjtJQUU1Qzs7T0FFRztJQUNJLElBQUksQ0FBYTtJQUV4Qjs7O09BR0c7SUFDSSxPQUFPLENBQUMsSUFBb0I7UUFDbEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN0QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNqQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQzNCLENBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksV0FBVyxDQUFDLElBQW9CO1FBQ3RDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDdEIsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7WUFDckMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUM1RCxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxXQUFXLElBQUksRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDbkQsQ0FBQztDQUNEO0FBMURELCtCQTBEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENsaWVudCwgQ2xpZW50T3B0aW9ucywgU25vd2ZsYWtlLCBVc2VyUmVzb2x2YWJsZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgQ2xpZW50VXRpbCBmcm9tIFwiLi9DbGllbnRVdGlsXCI7XG5cbi8qKlxuICogVGhlIEFrYWlybyBmcmFtZXdvcmsgY2xpZW50LiBDcmVhdGVzIHRoZSBoYW5kbGVycyBhbmQgc2V0cyB0aGVtIHVwLlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIGZvciB0aGUgY2xpZW50LlxuICogQHBhcmFtIGNsaWVudE9wdGlvbnMgLSBPcHRpb25zIGZvciBEaXNjb3JkIEpTIGNsaWVudC5JZiBub3Qgc3BlY2lmaWVkLCB0aGUgcHJldmlvdXMgb3B0aW9ucyBwYXJhbWV0ZXIgaXMgdXNlZCBpbnN0ZWFkLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBa2Fpcm9DbGllbnQ8XG5cdFJlYWR5IGV4dGVuZHMgYm9vbGVhbiA9IGJvb2xlYW5cbj4gZXh0ZW5kcyBDbGllbnQ8UmVhZHk+IHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdG9wdGlvbnM/OiBBa2Fpcm9PcHRpb25zICYgQ2xpZW50T3B0aW9ucyxcblx0XHRjbGllbnRPcHRpb25zPzogQ2xpZW50T3B0aW9uc1xuXHQpIHtcblx0XHRzdXBlcihjbGllbnRPcHRpb25zIHx8IG9wdGlvbnMpO1xuXG5cdFx0Y29uc3QgeyBvd25lcklEID0gXCJcIiB9ID0gb3B0aW9ucztcblxuXHRcdGNvbnN0IHsgc3VwZXJVc2VySUQgPSBcIlwiIH0gPSBvcHRpb25zO1xuXG5cdFx0dGhpcy5vd25lcklEID0gb3duZXJJRDtcblxuXHRcdHRoaXMuc3VwZXJVc2VySUQgPSBzdXBlclVzZXJJRDtcblxuXHRcdHRoaXMudXRpbCA9IG5ldyBDbGllbnRVdGlsKHRoaXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBJRCBvZiB0aGUgb3duZXIocykuXG5cdCAqL1xuXHRwdWJsaWMgb3duZXJJRDogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW107XG5cblx0LyoqXG5cdCAqIFRoZSBJRCBvZiB0aGUgc3VwZXJVc2VyKHMpLlxuXHQgKi9cblx0cHVibGljIHN1cGVyVXNlcklEOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXTtcblxuXHQvKipcblx0ICogVXRpbGl0eSBtZXRob2RzLlxuXHQgKi9cblx0cHVibGljIHV0aWw6IENsaWVudFV0aWw7XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHVzZXIgaXMgdGhlIG93bmVyIG9mIHRoaXMgYm90LlxuXHQgKiBAcGFyYW0gdXNlciAtIFVzZXIgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgaXNPd25lcih1c2VyOiBVc2VyUmVzb2x2YWJsZSk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGlkID0gdGhpcy51c2Vycy5yZXNvbHZlSWQodXNlcik7XG5cdFx0aWYgKCFpZCkgcmV0dXJuIGZhbHNlO1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMub3duZXJJRClcblx0XHRcdD8gdGhpcy5vd25lcklELmluY2x1ZGVzKGlkKVxuXHRcdFx0OiBpZCA9PT0gdGhpcy5vd25lcklEO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHVzZXIgaXMgYSBzdXBlciB1c2VyIG9mIHRoaXMgYm90LlxuXHQgKiBAcGFyYW0gdXNlciAtIFVzZXIgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgaXNTdXBlclVzZXIodXNlcjogVXNlclJlc29sdmFibGUpOiBib29sZWFuIHtcblx0XHRjb25zdCBpZCA9IHRoaXMudXNlcnMucmVzb2x2ZUlkKHVzZXIpO1xuXHRcdGlmICghaWQpIHJldHVybiBmYWxzZTtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheSh0aGlzLnN1cGVyVXNlcklEKVxuXHRcdFx0PyB0aGlzLnN1cGVyVXNlcklELmluY2x1ZGVzKGlkKSB8fCB0aGlzLm93bmVySUQuaW5jbHVkZXMoaWQpXG5cdFx0XHQ6IGlkID09PSB0aGlzLnN1cGVyVXNlcklEIHx8IGlkID09PSB0aGlzLm93bmVySUQ7XG5cdH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciB0aGUgY2xpZW50LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFrYWlyb09wdGlvbnMge1xuXHQvKiogRGlzY29yZCBJRCBvZiB0aGUgY2xpZW50IG93bmVyKHMpLiAqL1xuXHRvd25lcklEPzogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW107XG5cblx0LyoqIERpc2NvcmQgSUQgb2YgdGhlIGNsaWVudCBzdXBlclVzZXJzKHMpLiAqL1xuXHRzdXBlclVzZXJJRD86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdO1xufVxuIl19