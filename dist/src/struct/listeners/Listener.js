"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoModule_1 = __importDefault(require("../AkairoModule"));
/**
 * Represents a listener.
 * @param id - Listener ID.
 * @param options - Options for the listener.
 */
class Listener extends AkairoModule_1.default {
    constructor(id, { category, emitter, event, type = "on" }) {
        super(id, { category });
        this.emitter = emitter;
        this.event = event;
        this.type = type;
    }
    /**
     * The event emitter.
     */
    emitter;
    /**
     * The event name listened to.
     */
    event;
    /**
     * Type of listener.
     */
    type;
    /**
     * Executes the listener.
     * @param args - Arguments.
     */
    // eslint-disable-next-line func-names, @typescript-eslint/no-unused-vars
    exec(...args) {
        throw new AkairoError_1.default("NOT_IMPLEMENTED", this.constructor.name, "exec");
    }
    /**
     * Reloads the listener.
     */
    reload() {
        return super.reload();
    }
    /**
     * Removes the listener.
     */
    remove() {
        return super.remove();
    }
}
exports.default = Listener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2xpc3RlbmVycy9MaXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHlFQUFpRDtBQUdqRCxtRUFBb0U7QUFHcEU7Ozs7R0FJRztBQUNILE1BQThCLFFBQVMsU0FBUSxzQkFBWTtJQUMxRCxZQUFtQixFQUFVLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFtQjtRQUN4RixLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNsQixDQUFDO0lBWUQ7O09BRUc7SUFDSSxPQUFPLENBQXdCO0lBRXRDOztPQUVHO0lBQ0ksS0FBSyxDQUFTO0lBWXJCOztPQUVHO0lBQ0ksSUFBSSxDQUFTO0lBRXBCOzs7T0FHRztJQUNILHlFQUF5RTtJQUNsRSxJQUFJLENBQUMsR0FBRyxJQUFXO1FBQ3pCLE1BQU0sSUFBSSxxQkFBVyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU07UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFjLENBQUM7SUFDbkMsQ0FBQztJQUVEOztPQUVHO0lBQ2EsTUFBTTtRQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQWMsQ0FBQztJQUNuQyxDQUFDO0NBQ0Q7QUFwRUQsMkJBb0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvTW9kdWxlLCB7IEFrYWlyb01vZHVsZU9wdGlvbnMgfSBmcm9tIFwiLi4vQWthaXJvTW9kdWxlXCI7XG5pbXBvcnQgTGlzdGVuZXJIYW5kbGVyIGZyb20gXCIuL0xpc3RlbmVySGFuZGxlclwiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBsaXN0ZW5lci5cbiAqIEBwYXJhbSBpZCAtIExpc3RlbmVyIElELlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIGZvciB0aGUgbGlzdGVuZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIExpc3RlbmVyIGV4dGVuZHMgQWthaXJvTW9kdWxlIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHsgY2F0ZWdvcnksIGVtaXR0ZXIsIGV2ZW50LCB0eXBlID0gXCJvblwiIH06IExpc3RlbmVyT3B0aW9ucykge1xuXHRcdHN1cGVyKGlkLCB7IGNhdGVnb3J5IH0pO1xuXG5cdFx0dGhpcy5lbWl0dGVyID0gZW1pdHRlcjtcblxuXHRcdHRoaXMuZXZlbnQgPSBldmVudDtcblxuXHRcdHRoaXMudHlwZSA9IHR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNhdGVnb3J5IG9mIHRoaXMgbGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjYXRlZ29yeTogQ2F0ZWdvcnk8c3RyaW5nLCBMaXN0ZW5lcj47XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSBldmVudCBlbWl0dGVyLlxuXHQgKi9cblx0cHVibGljIGVtaXR0ZXI6IHN0cmluZyB8IEV2ZW50RW1pdHRlcjtcblxuXHQvKipcblx0ICogVGhlIGV2ZW50IG5hbWUgbGlzdGVuZWQgdG8uXG5cdCAqL1xuXHRwdWJsaWMgZXZlbnQ6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGZpbGVwYXRoLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZmlsZXBhdGg6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBoYW5kbGVyOiBMaXN0ZW5lckhhbmRsZXI7XG5cblx0LyoqXG5cdCAqIFR5cGUgb2YgbGlzdGVuZXIuXG5cdCAqL1xuXHRwdWJsaWMgdHlwZTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyB0aGUgbGlzdGVuZXIuXG5cdCAqIEBwYXJhbSBhcmdzIC0gQXJndW1lbnRzLlxuXHQgKi9cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXMsIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRwdWJsaWMgZXhlYyguLi5hcmdzOiBhbnlbXSk6IGFueSB7XG5cdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTk9UX0lNUExFTUVOVEVEXCIsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgXCJleGVjXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZCgpOiBMaXN0ZW5lciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZCgpIGFzIExpc3RlbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZSgpOiBMaXN0ZW5lciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZSgpIGFzIExpc3RlbmVyO1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyB0byB1c2UgZm9yIGxpc3RlbmVyIGV4ZWN1dGlvbiBiZWhhdmlvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMaXN0ZW5lck9wdGlvbnMgZXh0ZW5kcyBBa2Fpcm9Nb2R1bGVPcHRpb25zIHtcblx0LyoqXG5cdCAqIFRoZSBldmVudCBlbWl0dGVyLCBlaXRoZXIgYSBrZXkgZnJvbSBgTGlzdGVuZXJIYW5kbGVyI2VtaXR0ZXJzYCBvciBhbiBFdmVudEVtaXR0ZXIuXG5cdCAqL1xuXHRlbWl0dGVyOiBzdHJpbmcgfCBFdmVudEVtaXR0ZXI7XG5cblx0LyoqXG5cdCAqIEV2ZW50IG5hbWUgdG8gbGlzdGVuIHRvLlxuXHQgKi9cblx0ZXZlbnQ6IHN0cmluZztcblxuXHQvKipcblx0ICogVHlwZSBvZiBsaXN0ZW5lciwgZWl0aGVyICdvbicgb3IgJ29uY2UnLlxuXHQgKiBEZWZhdWx0cyB0byBgb25gXG5cdCAqL1xuXHR0eXBlPzogc3RyaW5nO1xufVxuIl19