"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoModule_1 = __importDefault(require("../AkairoModule"));
/**
 * Represents a task.
 * @param id - Task ID.
 * @param options - Options for the task.
 */
class Task extends AkairoModule_1.default {
    constructor(id, { category, delay, runOnStart = false }) {
        super(id, { category });
        this.delay = delay;
        this.runOnStart = runOnStart;
    }
    /**
     * The time in milliseconds between each time the task is run.
     */
    delay;
    /**
     * Whether or not to run the task on start.
     */
    runOnStart;
    /**
     * Executes the task.
     * @param args - Arguments.
     */
    exec(...args) {
        throw new AkairoError_1.default("NOT_IMPLEMENTED", this.constructor.name, "exec");
    }
    /**
     * Reloads the task.
     */
    reload() {
        return super.reload();
    }
    /**
     * Removes the task.
     */
    remove() {
        return super.remove();
    }
    /**
     * Returns the ID.
     */
    toString() {
        return super.toString();
    }
}
exports.default = Task;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvdGFza3MvVGFzay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGtFQUFrRTtBQUNsRSx5RUFBaUQ7QUFHakQsbUVBQW9FO0FBR3BFOzs7O0dBSUc7QUFDSCxNQUE4QixJQUFLLFNBQVEsc0JBQVk7SUFDdEQsWUFBbUIsRUFBVSxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLEdBQUcsS0FBSyxFQUFlO1FBQ2xGLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRXhCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQzlCLENBQUM7SUFZRDs7T0FFRztJQUNJLEtBQUssQ0FBVTtJQVl0Qjs7T0FFRztJQUNJLFVBQVUsQ0FBVTtJQUUzQjs7O09BR0c7SUFDSSxJQUFJLENBQUMsR0FBRyxJQUFXO1FBQ3pCLE1BQU0sSUFBSSxxQkFBVyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7T0FFRztJQUNhLE1BQU07UUFDckIsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFVLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ2EsTUFBTTtRQUNyQixPQUFPLEtBQUssQ0FBQyxNQUFNLEVBQVUsQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDYSxRQUFRO1FBQ3ZCLE9BQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7Q0FDRDtBQW5FRCx1QkFtRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBmdW5jLW5hbWVzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUsIHsgQWthaXJvTW9kdWxlT3B0aW9ucyB9IGZyb20gXCIuLi9Ba2Fpcm9Nb2R1bGVcIjtcbmltcG9ydCBUYXNrSGFuZGxlciBmcm9tIFwiLi9UYXNrSGFuZGxlclwiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0YXNrLlxuICogQHBhcmFtIGlkIC0gVGFzayBJRC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIHRhc2suXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIFRhc2sgZXh0ZW5kcyBBa2Fpcm9Nb2R1bGUge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgeyBjYXRlZ29yeSwgZGVsYXksIHJ1bk9uU3RhcnQgPSBmYWxzZSB9OiBUYXNrT3B0aW9ucykge1xuXHRcdHN1cGVyKGlkLCB7IGNhdGVnb3J5IH0pO1xuXG5cdFx0dGhpcy5kZWxheSA9IGRlbGF5O1xuXG5cdFx0dGhpcy5ydW5PblN0YXJ0ID0gcnVuT25TdGFydDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY2F0ZWdvcnkgb2YgdGhpcyB0YXNrLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcnk6IENhdGVnb3J5PHN0cmluZywgVGFzaz47XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFRoZSB0aW1lIGluIG1pbGxpc2Vjb25kcyBiZXR3ZWVuIGVhY2ggdGltZSB0aGUgdGFzayBpcyBydW4uXG5cdCAqL1xuXHRwdWJsaWMgZGVsYXk/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBmaWxlcGF0aC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGZpbGVwYXRoOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgaGFuZGxlcjogVGFza0hhbmRsZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHJ1biB0aGUgdGFzayBvbiBzdGFydC5cblx0ICovXG5cdHB1YmxpYyBydW5PblN0YXJ0OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyB0aGUgdGFzay5cblx0ICogQHBhcmFtIGFyZ3MgLSBBcmd1bWVudHMuXG5cdCAqL1xuXHRwdWJsaWMgZXhlYyguLi5hcmdzOiBhbnlbXSk6IGFueSB7XG5cdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTk9UX0lNUExFTUVOVEVEXCIsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgXCJleGVjXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgdGhlIHRhc2suXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkKCk6IFRhc2sge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoKSBhcyBUYXNrO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIHRhc2suXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKCk6IFRhc2sge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmUoKSBhcyBUYXNrO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIElELlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHN1cGVyLnRvU3RyaW5nKCk7XG5cdH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIHRvIHVzZSBmb3IgdGFzayBleGVjdXRpb24gYmVoYXZpb3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGFza09wdGlvbnMgZXh0ZW5kcyBBa2Fpcm9Nb2R1bGVPcHRpb25zIHtcblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgb2YgdGltZSBiZXR3ZWVuIHRoZSB0YXNrIGJlaW5nIGV4ZWN1dGVkLlxuXHQgKi9cblx0ZGVsYXk/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoZSB0YXNrIHJ1bnMgb24gc3RhcnQuXG5cdCAqL1xuXHRydW5PblN0YXJ0PzogYm9vbGVhbjtcbn1cbiJdfQ==