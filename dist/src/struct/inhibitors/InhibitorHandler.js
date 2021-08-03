"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const Inhibitor_1 = __importDefault(require("./Inhibitor"));
const Util_1 = __importDefault(require("../../util/Util"));
/**
 * Loads inhibitors and checks messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
class InhibitorHandler extends AkairoHandler_1.default {
	constructor(
		client,
		{
			directory,
			classToHandle = Inhibitor_1.default,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		} = {}
	) {
		if (
			!(
				classToHandle.prototype instanceof Inhibitor_1.default ||
				classToHandle === Inhibitor_1.default
			)
		) {
			throw new AkairoError_1.default(
				"INVALID_CLASS_TO_HANDLE",
				classToHandle.name,
				Inhibitor_1.default.name
			);
		}
		super(client, {
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		});
	}
	/**
	 * Deregisters a module.
	 * @param inhibitor - Module to use.
	 */
	deregister(inhibitor) {
		return super.deregister(inhibitor);
	}
	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	findCategory(name) {
		return super.findCategory(name);
	}
	/**
	 * Loads an inhibitor.
	 * @param thing - Module or path to module.
	 */
	// eslint-disable-next-line @typescript-eslint/ban-types
	load(thing) {
		return super.load(thing);
	}
	/**
	 * Reads all inhibitors from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	loadAll(directory, filter) {
		return super.loadAll(directory, filter);
	}
	/**
	 * Registers a module.
	 * @param inhibitor - Module to use.
	 * @param filepath - Filepath of module.
	 */
	register(inhibitor, filepath) {
		return super.register(inhibitor, filepath);
	}
	/**
	 * Reloads an inhibitor.
	 * @param id - ID of the inhibitor.
	 */
	reload(id) {
		return super.reload(id);
	}
	/**
	 * Reloads all inhibitors.
	 */
	reloadAll() {
		return super.reloadAll();
	}
	/**
	 * Removes an inhibitor.
	 * @param {string} id - ID of the inhibitor.
	 */
	remove(id) {
		return super.remove(id);
	}
	/**
	 * Removes all inhibitors.
	 */
	removeAll() {
		return super.removeAll();
	}
	/**
	 * Tests inhibitors against the message.
	 * Returns the reason if blocked.
	 * @param type - Type of inhibitor, 'all', 'pre', or 'post'.
	 * @param message - Message to test.
	 * @param command - Command to use.
	 */
	async test(type, message, command) {
		if (!this.modules.size) return null;
		const inhibitors = this.modules.filter(i => i.type === type);
		if (!inhibitors.size) return null;
		const promises = [];
		for (const inhibitor of inhibitors.values()) {
			promises.push(
				(async () => {
					// @ts-expect-error
					let inhibited = inhibitor.exec(message, command);
					if (Util_1.default.isPromise(inhibited)) inhibited = await inhibited;
					if (inhibited) return inhibitor;
					return null;
				})()
			);
		}
		const inhibitedInhibitors = (await Promise.all(promises)).filter(r => r);
		if (!inhibitedInhibitors.length) return null;
		inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
		return inhibitedInhibitors[0].reason;
	}
	on(event, listener) {
		return super.on(event, listener);
	}
}
exports.default = InhibitorHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5oaWJpdG9ySGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvaW5oaWJpdG9ycy9JbmhpYml0b3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUVBQWlEO0FBQ2pELHFFQUcwQjtBQUMxQiw0REFBb0M7QUFDcEMsMkRBQW1DO0FBUW5DOzs7O0dBSUc7QUFDSCxNQUFxQixnQkFBaUIsU0FBUSx1QkFBYTtJQTBCMUQsWUFDQyxNQUFvQixFQUNwQixFQUNDLFNBQVMsRUFDVCxhQUFhLEdBQUcsbUJBQVMsRUFDekIsVUFBVSxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUMzQixrQkFBa0IsRUFDbEIsVUFBVSxLQUNlLEVBQUU7UUFFNUIsSUFDQyxDQUFDLENBQ0EsYUFBYSxDQUFDLFNBQVMsWUFBWSxtQkFBUztZQUM1QyxhQUFhLEtBQUssbUJBQVMsQ0FDM0IsRUFDQTtZQUNELE1BQU0sSUFBSSxxQkFBVyxDQUNwQix5QkFBeUIsRUFDekIsYUFBYSxDQUFDLElBQUksRUFDbEIsbUJBQVMsQ0FBQyxJQUFJLENBQ2QsQ0FBQztTQUNGO1FBRUQsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNiLFNBQVM7WUFDVCxhQUFhO1lBQ2IsVUFBVTtZQUNWLGtCQUFrQjtZQUNsQixVQUFVO1NBQ1YsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7T0FHRztJQUNhLFVBQVUsQ0FBQyxTQUFvQjtRQUM5QyxPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7T0FHRztJQUNhLFlBQVksQ0FBQyxJQUFZO1FBQ3hDLE9BQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQWdDLENBQUM7SUFDaEUsQ0FBQztJQUVEOzs7T0FHRztJQUNILHdEQUF3RDtJQUN4QyxJQUFJLENBQUMsS0FBd0I7UUFDNUMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBYyxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7OztPQUlHO0lBQ2EsT0FBTyxDQUN0QixTQUFrQixFQUNsQixNQUFzQjtRQUV0QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBcUIsQ0FBQztJQUM3RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNhLFFBQVEsQ0FBQyxTQUFvQixFQUFFLFFBQWlCO1FBQy9ELE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVEOzs7T0FHRztJQUNhLE1BQU0sQ0FBQyxFQUFVO1FBQ2hDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQWMsQ0FBQztJQUN0QyxDQUFDO0lBRUQ7O09BRUc7SUFDYSxTQUFTO1FBQ3hCLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBc0IsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsTUFBTSxDQUFDLEVBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBYyxDQUFDO0lBQ3RDLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFzQixDQUFDO0lBQzlDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxLQUFLLENBQUMsSUFBSSxDQUNoQixJQUE0QixFQUM1QixPQUFnQyxFQUNoQyxPQUFpQjtRQUVqQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFcEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRWxDLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVwQixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUM1QyxRQUFRLENBQUMsSUFBSSxDQUNaLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ1gsbUJBQW1CO2dCQUNuQixJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDakQsSUFBSSxjQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztvQkFBRSxTQUFTLEdBQUcsTUFBTSxTQUFTLENBQUM7Z0JBQzNELElBQUksU0FBUztvQkFBRSxPQUFPLFNBQVMsQ0FBQztnQkFDaEMsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUMsRUFBRSxDQUNKLENBQUM7U0FDRjtRQUVELE1BQU0sbUJBQW1CLEdBQWdCLENBQ3hDLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FDM0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRTdDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVELE9BQU8sbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3RDLENBQUM7SUFFZSxFQUFFLENBQ2pCLEtBQVEsRUFDUixRQUErRDtRQUUvRCxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7Q0FDRDtBQXBMRCxtQ0FvTEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7XG5cdEFrYWlyb0hhbmRsZXJPcHRpb25zLFxuXHRMb2FkUHJlZGljYXRlXG59IGZyb20gXCIuLi9Ba2Fpcm9IYW5kbGVyXCI7XG5pbXBvcnQgSW5oaWJpdG9yIGZyb20gXCIuL0luaGliaXRvclwiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IHsgQXdhaXRlZCwgQ29sbGVjdGlvbiwgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgQWthaXJvTWVzc2FnZSBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9NZXNzYWdlXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBDb21tYW5kIGZyb20gXCIuLi9jb21tYW5kcy9Db21tYW5kXCI7XG5pbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gXCIuLi8uLlwiO1xuaW1wb3J0IHsgSW5oaWJpdG9ySGFuZGxlckV2ZW50cyB9IGZyb20gXCIuLi8uLi90eXBpbmdzL2V2ZW50c1wiO1xuXG4vKipcbiAqIExvYWRzIGluaGliaXRvcnMgYW5kIGNoZWNrcyBtZXNzYWdlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5oaWJpdG9ySGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgSW5oaWJpdG9yPj47XG5cblx0LyoqXG5cdCAqIENsYXNzIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBJbmhpYml0b3I7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIERpcmVjdG9yeSB0byBpbmhpYml0b3JzLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEluaGliaXRvcnMgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gSW5oaWJpdG9yLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIEluaGliaXRvcj47XG5cblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNsaWVudDogQWthaXJvQ2xpZW50LFxuXHRcdHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUgPSBJbmhpYml0b3IsXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH06IEFrYWlyb0hhbmRsZXJPcHRpb25zID0ge31cblx0KSB7XG5cdFx0aWYgKFxuXHRcdFx0IShcblx0XHRcdFx0Y2xhc3NUb0hhbmRsZS5wcm90b3R5cGUgaW5zdGFuY2VvZiBJbmhpYml0b3IgfHxcblx0XHRcdFx0Y2xhc3NUb0hhbmRsZSA9PT0gSW5oaWJpdG9yXG5cdFx0XHQpXG5cdFx0KSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXG5cdFx0XHRcdFwiSU5WQUxJRF9DTEFTU19UT19IQU5ETEVcIixcblx0XHRcdFx0Y2xhc3NUb0hhbmRsZS5uYW1lLFxuXHRcdFx0XHRJbmhpYml0b3IubmFtZVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRzdXBlcihjbGllbnQsIHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUsXG5cdFx0XHRleHRlbnNpb25zLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gaW5oaWJpdG9yIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBkZXJlZ2lzdGVyKGluaGliaXRvcjogSW5oaWJpdG9yKTogdm9pZCB7XG5cdFx0cmV0dXJuIHN1cGVyLmRlcmVnaXN0ZXIoaW5oaWJpdG9yKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNhdGVnb3J5IGJ5IG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZmluZENhdGVnb3J5KG5hbWU6IHN0cmluZyk6IENhdGVnb3J5PHN0cmluZywgSW5oaWJpdG9yPiB7XG5cdFx0cmV0dXJuIHN1cGVyLmZpbmRDYXRlZ29yeShuYW1lKSBhcyBDYXRlZ29yeTxzdHJpbmcsIEluaGliaXRvcj47XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYW4gaW5oaWJpdG9yLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBNb2R1bGUgb3IgcGF0aCB0byBtb2R1bGUuXG5cdCAqL1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10eXBlc1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZCh0aGluZzogc3RyaW5nIHwgRnVuY3Rpb24pOiBJbmhpYml0b3Ige1xuXHRcdHJldHVybiBzdXBlci5sb2FkKHRoaW5nKSBhcyBJbmhpYml0b3I7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIGluaGliaXRvcnMgZnJvbSB0aGUgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS4gRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWRBbGwoXG5cdFx0ZGlyZWN0b3J5Pzogc3RyaW5nLFxuXHRcdGZpbHRlcj86IExvYWRQcmVkaWNhdGVcblx0KTogSW5oaWJpdG9ySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWRBbGwoZGlyZWN0b3J5LCBmaWx0ZXIpIGFzIEluaGliaXRvckhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gaW5oaWJpdG9yIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlZ2lzdGVyKGluaGliaXRvcjogSW5oaWJpdG9yLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdHJldHVybiBzdXBlci5yZWdpc3RlcihpbmhpYml0b3IsIGZpbGVwYXRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFuIGluaGliaXRvci5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGluaGliaXRvci5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoaWQ6IHN0cmluZyk6IEluaGliaXRvciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZChpZCkgYXMgSW5oaWJpdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIGluaGliaXRvcnMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkQWxsKCk6IEluaGliaXRvckhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWRBbGwoKSBhcyBJbmhpYml0b3JIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYW4gaW5oaWJpdG9yLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBJRCBvZiB0aGUgaW5oaWJpdG9yLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZShpZDogc3RyaW5nKTogSW5oaWJpdG9yIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBJbmhpYml0b3I7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgaW5oaWJpdG9ycy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmVBbGwoKTogSW5oaWJpdG9ySGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIEluaGliaXRvckhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogVGVzdHMgaW5oaWJpdG9ycyBhZ2FpbnN0IHRoZSBtZXNzYWdlLlxuXHQgKiBSZXR1cm5zIHRoZSByZWFzb24gaWYgYmxvY2tlZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUeXBlIG9mIGluaGliaXRvciwgJ2FsbCcsICdwcmUnLCBvciAncG9zdCcuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byB0ZXN0LlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHRlc3QoXG5cdFx0dHlwZTogXCJhbGxcIiB8IFwicHJlXCIgfCBcInBvc3RcIixcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRjb21tYW5kPzogQ29tbWFuZFxuXHQpOiBQcm9taXNlPHN0cmluZyB8IG51bGwgfCB2b2lkPiB7XG5cdFx0aWYgKCF0aGlzLm1vZHVsZXMuc2l6ZSkgcmV0dXJuIG51bGw7XG5cblx0XHRjb25zdCBpbmhpYml0b3JzID0gdGhpcy5tb2R1bGVzLmZpbHRlcihpID0+IGkudHlwZSA9PT0gdHlwZSk7XG5cdFx0aWYgKCFpbmhpYml0b3JzLnNpemUpIHJldHVybiBudWxsO1xuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblxuXHRcdGZvciAoY29uc3QgaW5oaWJpdG9yIG9mIGluaGliaXRvcnMudmFsdWVzKCkpIHtcblx0XHRcdHByb21pc2VzLnB1c2goXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdGxldCBpbmhpYml0ZWQgPSBpbmhpYml0b3IuZXhlYyhtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoaW5oaWJpdGVkKSkgaW5oaWJpdGVkID0gYXdhaXQgaW5oaWJpdGVkO1xuXHRcdFx0XHRcdGlmIChpbmhpYml0ZWQpIHJldHVybiBpbmhpYml0b3I7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5oaWJpdGVkSW5oaWJpdG9yczogSW5oaWJpdG9yW10gPSAoXG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcylcblx0XHQpLmZpbHRlcihyID0+IHIpO1xuXHRcdGlmICghaW5oaWJpdGVkSW5oaWJpdG9ycy5sZW5ndGgpIHJldHVybiBudWxsO1xuXG5cdFx0aW5oaWJpdGVkSW5oaWJpdG9ycy5zb3J0KChhLCBiKSA9PiBiLnByaW9yaXR5IC0gYS5wcmlvcml0eSk7XG5cdFx0cmV0dXJuIGluaGliaXRlZEluaGliaXRvcnNbMF0ucmVhc29uO1xuXHR9XG5cblx0cHVibGljIG92ZXJyaWRlIG9uPEsgZXh0ZW5kcyBrZXlvZiBJbmhpYml0b3JIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IEluaGliaXRvckhhbmRsZXJFdmVudHNbS10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpc3tcblx0XHRyZXR1cm4gc3VwZXIub24oZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxufVxuIl19
