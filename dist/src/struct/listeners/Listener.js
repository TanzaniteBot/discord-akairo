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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2xpc3RlbmVycy9MaXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHlFQUFpRDtBQUdqRCxtRUFBb0U7QUFHcEU7Ozs7R0FJRztBQUNILE1BQThCLFFBQVMsU0FBUSxzQkFBWTtJQUMxRCxZQUFtQixFQUFVLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFtQjtRQUN4RixLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNsQixDQUFDO0lBWUQ7O09BRUc7SUFDSSxPQUFPLENBQXdCO0lBRXRDOztPQUVHO0lBQ0ksS0FBSyxDQUFTO0lBWXJCOztPQUVHO0lBQ0ksSUFBSSxDQUFlO0lBRTFCOzs7T0FHRztJQUNILHlFQUF5RTtJQUNsRSxJQUFJLENBQUMsR0FBRyxJQUFXO1FBQ3pCLE1BQU0sSUFBSSxxQkFBVyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU07UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUF1QixDQUFDO0lBQzVDLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU07UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFjLENBQUM7SUFDbkMsQ0FBQztDQUNEO0FBakVELDJCQWlFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uLy4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSwgeyBBa2Fpcm9Nb2R1bGVPcHRpb25zIH0gZnJvbSBcIi4uL0FrYWlyb01vZHVsZVwiO1xuaW1wb3J0IExpc3RlbmVySGFuZGxlciBmcm9tIFwiLi9MaXN0ZW5lckhhbmRsZXJcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgbGlzdGVuZXIuXG4gKiBAcGFyYW0gaWQgLSBMaXN0ZW5lciBJRC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGxpc3RlbmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBMaXN0ZW5lciBleHRlbmRzIEFrYWlyb01vZHVsZSB7XG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihpZDogc3RyaW5nLCB7IGNhdGVnb3J5LCBlbWl0dGVyLCBldmVudCwgdHlwZSA9IFwib25cIiB9OiBMaXN0ZW5lck9wdGlvbnMpIHtcblx0XHRzdXBlcihpZCwgeyBjYXRlZ29yeSB9KTtcblx0XHR0aGlzLmVtaXR0ZXIgPSBlbWl0dGVyO1xuXHRcdHRoaXMuZXZlbnQgPSBldmVudDtcblx0XHR0aGlzLnR5cGUgPSB0eXBlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjYXRlZ29yeSBvZiB0aGlzIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcnk6IENhdGVnb3J5PHN0cmluZywgTGlzdGVuZXI+O1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBUaGUgZXZlbnQgZW1pdHRlci5cblx0ICovXG5cdHB1YmxpYyBlbWl0dGVyOiBzdHJpbmcgfCBFdmVudEVtaXR0ZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBldmVudCBuYW1lIGxpc3RlbmVkIHRvLlxuXHQgKi9cblx0cHVibGljIGV2ZW50OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBmaWxlcGF0aC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGZpbGVwYXRoOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgaGFuZGxlcjogTGlzdGVuZXJIYW5kbGVyO1xuXG5cdC8qKlxuXHQgKiBUeXBlIG9mIGxpc3RlbmVyLlxuXHQgKi9cblx0cHVibGljIHR5cGU6IExpc3RlbmVyVHlwZTtcblxuXHQvKipcblx0ICogRXhlY3V0ZXMgdGhlIGxpc3RlbmVyLlxuXHQgKiBAcGFyYW0gYXJncyAtIEFyZ3VtZW50cy5cblx0ICovXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0cHVibGljIGV4ZWMoLi4uYXJnczogYW55W10pOiBhbnkge1xuXHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIk5PVF9JTVBMRU1FTlRFRFwiLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUsIFwiZXhlY1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoKTogUHJvbWlzZTxMaXN0ZW5lcj4ge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoKSBhcyBQcm9taXNlPExpc3RlbmVyPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSBsaXN0ZW5lci5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmUoKTogTGlzdGVuZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmUoKSBhcyBMaXN0ZW5lcjtcblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbnMgdG8gdXNlIGZvciBsaXN0ZW5lciBleGVjdXRpb24gYmVoYXZpb3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTGlzdGVuZXJPcHRpb25zIGV4dGVuZHMgQWthaXJvTW9kdWxlT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBUaGUgZXZlbnQgZW1pdHRlciwgZWl0aGVyIGEga2V5IGZyb20gYExpc3RlbmVySGFuZGxlciNlbWl0dGVyc2Agb3IgYW4gRXZlbnRFbWl0dGVyLlxuXHQgKi9cblx0ZW1pdHRlcjogc3RyaW5nIHwgRXZlbnRFbWl0dGVyO1xuXG5cdC8qKlxuXHQgKiBFdmVudCBuYW1lIHRvIGxpc3RlbiB0by5cblx0ICovXG5cdGV2ZW50OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFR5cGUgb2YgbGlzdGVuZXIsIGVpdGhlciAnb24nIG9yICdvbmNlJy5cblx0ICogRGVmYXVsdHMgdG8gYG9uYFxuXHQgKi9cblx0dHlwZT86IExpc3RlbmVyVHlwZTtcbn1cblxuZXhwb3J0IHR5cGUgTGlzdGVuZXJUeXBlID0gXCJvblwiIHwgXCJvbmNlXCIgfCBcInByZXBlbmRMaXN0ZW5lclwiIHwgXCJwcmVwZW5kT25jZUxpc3RlbmVyXCI7XG4iXX0=