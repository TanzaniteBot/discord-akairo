"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const Constants_1 = require("../../util/Constants");
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const ContextMenuCommand_1 = __importDefault(require("./ContextMenuCommand"));
/**
 * Loads context menu commands and handles them.
 * @param client - The Akairo client.
 * @param options - Options.
 */
class ContextMenuCommandHandler extends AkairoHandler_1.default {
    constructor(client, { directory, classToHandle = ContextMenuCommand_1.default, extensions = [".js", ".ts"], automateCategories, loadFilter } = {}) {
        if (!(classToHandle.prototype instanceof ContextMenuCommand_1.default || classToHandle === ContextMenuCommand_1.default)) {
            throw new AkairoError_1.default("INVALID_CLASS_TO_HANDLE", classToHandle.name, ContextMenuCommand_1.default.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });
        this.setup();
    }
    /**
     * Inhibitor handler to use.
     */
    inhibitorHandler;
    setup() {
        this.client.once("ready", () => {
            this.client.on("interactionCreate", i => {
                if (!i.isContextMenu())
                    return;
                this.handle(i);
            });
        });
    }
    async handle(interaction) {
        const command = this.modules.find(module => module.name === interaction.commandName);
        if (!command) {
            this.emit(Constants_1.ContextCommandHandlerEvents.NOT_FOUND, interaction);
            return false;
        }
        if (command.ownerOnly && !this.client.isOwner(interaction.user.id)) {
            this.emit(Constants_1.ContextCommandHandlerEvents.BLOCKED, interaction, command, Constants_1.BuiltInReasons.OWNER);
        }
        if (command.superUserOnly && !this.client.isSuperUser(interaction.user.id)) {
            this.emit(Constants_1.ContextCommandHandlerEvents.BLOCKED, interaction, command, Constants_1.BuiltInReasons.SUPER_USER);
        }
        try {
            this.emit(Constants_1.ContextCommandHandlerEvents.STARTED, interaction, command);
            const ret = await command.exec(interaction);
            this.emit(Constants_1.ContextCommandHandlerEvents.FINISHED, interaction, command, ret);
            return true;
        }
        catch (err) {
            this.emitError(err, interaction, command);
            return false;
        }
    }
    /**
     * Handles errors from the handling.
     * @param err - The error.
     * @param interaction - Interaction that called the command.
     * @param command - Command that errored.
     */
    emitError(err, interaction, command) {
        if (this.listenerCount(Constants_1.ContextCommandHandlerEvents.ERROR)) {
            this.emit(Constants_1.ContextCommandHandlerEvents.ERROR, err, interaction, command);
            return;
        }
        throw err;
    }
    /**
     * Deregisters a module.
     * @param contextMenuCommand - Module to use.
     */
    deregister(contextMenuCommand) {
        return super.deregister(contextMenuCommand);
    }
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name) {
        return super.findCategory(name);
    }
    /**
     * Loads an context menu command.
     * @param thing - Module or path to module.
     */
    load(thing) {
        return super.load(thing);
    }
    /**
     * Reads all context menu commands from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory, filter) {
        return super.loadAll(directory, filter);
    }
    /**
     * Registers a module.
     * @param contextMenuCommand - Module to use.
     * @param filepath - Filepath of module.
     */
    register(contextMenuCommand, filepath) {
        return super.register(contextMenuCommand, filepath);
    }
    /**
     * Reloads an context menu command.
     * @param id - ID of the context menu command.
     */
    reload(id) {
        return super.reload(id);
    }
    /**
     * Reloads all context menu commands.
     */
    reloadAll() {
        return super.reloadAll();
    }
    /**
     * Removes an context menu command.
     * @param {string} id - ID of the context menu command.
     */
    remove(id) {
        return super.remove(id);
    }
    /**
     * Removes all context menu commands.
     */
    removeAll() {
        return super.removeAll();
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
}
exports.default = ContextMenuCommandHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29udGV4dE1lbnVDb21tYW5kcy9Db250ZXh0TWVudUNvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EseUVBQWlEO0FBQ2pELG9EQUFtRjtBQUVuRixxRUFBc0Y7QUFHdEYsOEVBQXNEO0FBRXREOzs7O0dBSUc7QUFDSCxNQUFxQix5QkFBMEIsU0FBUSx1QkFBYTtJQUNuRSxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyw0QkFBa0IsRUFDbEMsVUFBVSxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUMzQixrQkFBa0IsRUFDbEIsVUFBVSxLQUNlLEVBQUU7UUFFNUIsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsWUFBWSw0QkFBa0IsSUFBSSxhQUFhLEtBQUssNEJBQWtCLENBQUMsRUFBRTtZQUNyRyxNQUFNLElBQUkscUJBQVcsQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLDRCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlGO1FBRUQsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNiLFNBQVM7WUFDVCxhQUFhO1lBQ2IsVUFBVTtZQUNWLGtCQUFrQjtZQUNsQixVQUFVO1NBQ1YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQXNCRDs7T0FFRztJQUNJLGdCQUFnQixDQUFvQjtJQU9qQyxLQUFLO1FBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUU7b0JBQUUsT0FBTztnQkFFL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVNLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBbUM7UUFDdEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVyRixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyx1Q0FBMkIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDOUQsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELElBQUksT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDbkUsSUFBSSxDQUFDLElBQUksQ0FBQyx1Q0FBMkIsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzNGO1FBQ0QsSUFBSSxPQUFPLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUMzRSxJQUFJLENBQUMsSUFBSSxDQUFDLHVDQUEyQixDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLDBCQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDaEc7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyx1Q0FBMkIsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sR0FBRyxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLHVDQUEyQixDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzNFLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNiLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMxQyxPQUFPLEtBQUssQ0FBQztTQUNiO0lBQ0YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksU0FBUyxDQUFDLEdBQVUsRUFBRSxXQUFtQyxFQUFFLE9BQTBDO1FBQzNHLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyx1Q0FBMkIsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLHVDQUEyQixDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3hFLE9BQU87U0FDUDtRQUVELE1BQU0sR0FBRyxDQUFDO0lBQ1gsQ0FBQztJQUVEOzs7T0FHRztJQUNhLFVBQVUsQ0FBQyxrQkFBc0M7UUFDaEUsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVEOzs7T0FHRztJQUNhLFlBQVksQ0FBQyxJQUFZO1FBQ3hDLE9BQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQXlDLENBQUM7SUFDekUsQ0FBQztJQUVEOzs7T0FHRztJQUNhLElBQUksQ0FBQyxLQUFrQztRQUN0RCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUF1QixDQUFDO0lBQ2hELENBQUM7SUFFRDs7OztPQUlHO0lBQ2EsT0FBTyxDQUFDLFNBQWtCLEVBQUUsTUFBc0I7UUFDakUsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQThCLENBQUM7SUFDdEUsQ0FBQztJQUVEOzs7O09BSUc7SUFDYSxRQUFRLENBQUMsa0JBQXNDLEVBQUUsUUFBaUI7UUFDakYsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUF1QixDQUFDO0lBQy9DLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUErQixDQUFDO0lBQ3ZELENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUF1QixDQUFDO0lBQy9DLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUErQixDQUFDO0lBQ3ZELENBQUM7SUFFZSxFQUFFLENBQ2pCLEtBQVEsRUFDUixRQUF3RTtRQUV4RSxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDZSxJQUFJLENBQ25CLEtBQVEsRUFDUixRQUF3RTtRQUV4RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDRDtBQS9MRCw0Q0ErTEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gXCJkaXNjb3JkLWFrYWlyb1wiO1xuaW1wb3J0IHsgQXdhaXRlZCwgQ29sbGVjdGlvbiwgQ29udGV4dE1lbnVJbnRlcmFjdGlvbiB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uLy4uL3R5cGluZ3MvZXZlbnRzXCI7XG5pbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCB7IEJ1aWx0SW5SZWFzb25zLCBDb250ZXh0Q29tbWFuZEhhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIsIHsgQWthaXJvSGFuZGxlck9wdGlvbnMsIExvYWRQcmVkaWNhdGUgfSBmcm9tIFwiLi4vQWthaXJvSGFuZGxlclwiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSBmcm9tIFwiLi4vQWthaXJvTW9kdWxlXCI7XG5pbXBvcnQgSW5oaWJpdG9ySGFuZGxlciBmcm9tIFwiLi4vaW5oaWJpdG9ycy9JbmhpYml0b3JIYW5kbGVyXCI7XG5pbXBvcnQgQ29udGV4dE1lbnVDb21tYW5kIGZyb20gXCIuL0NvbnRleHRNZW51Q29tbWFuZFwiO1xuXG4vKipcbiAqIExvYWRzIGNvbnRleHQgbWVudSBjb21tYW5kcyBhbmQgaGFuZGxlcyB0aGVtLlxuICogQHBhcmFtIGNsaWVudCAtIFRoZSBBa2Fpcm8gY2xpZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyIGV4dGVuZHMgQWthaXJvSGFuZGxlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQ29udGV4dE1lbnVDb21tYW5kLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi50c1wiXSxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9OiBBa2Fpcm9IYW5kbGVyT3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdGlmICghKGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgQ29udGV4dE1lbnVDb21tYW5kIHx8IGNsYXNzVG9IYW5kbGUgPT09IENvbnRleHRNZW51Q29tbWFuZCkpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsIGNsYXNzVG9IYW5kbGUubmFtZSwgQ29udGV4dE1lbnVDb21tYW5kLm5hbWUpO1xuXHRcdH1cblxuXHRcdHN1cGVyKGNsaWVudCwge1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSxcblx0XHRcdGV4dGVuc2lvbnMsXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fSk7XG5cblx0XHR0aGlzLnNldHVwKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgQ29udGV4dE1lbnVDb21tYW5kPj47XG5cblx0LyoqXG5cdCAqIENsYXNzIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBDb250ZXh0TWVudUNvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIERpcmVjdG9yeSB0byBjb250ZXh0IG1lbnUgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogSW5oaWJpdG9yIGhhbmRsZXIgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGluaGliaXRvckhhbmRsZXI/OiBJbmhpYml0b3JIYW5kbGVyO1xuXG5cdC8qKlxuXHQgKiBDb250ZXh0IG1lbnUgY29tbWFuZHMgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gY29udGV4dCBtZW51IGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ29udGV4dE1lbnVDb21tYW5kPjtcblxuXHRwcm90ZWN0ZWQgc2V0dXAoKSB7XG5cdFx0dGhpcy5jbGllbnQub25jZShcInJlYWR5XCIsICgpID0+IHtcblx0XHRcdHRoaXMuY2xpZW50Lm9uKFwiaW50ZXJhY3Rpb25DcmVhdGVcIiwgaSA9PiB7XG5cdFx0XHRcdGlmICghaS5pc0NvbnRleHRNZW51KCkpIHJldHVybjtcblxuXHRcdFx0XHR0aGlzLmhhbmRsZShpKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cHVibGljIGFzeW5jIGhhbmRsZShpbnRlcmFjdGlvbjogQ29udGV4dE1lbnVJbnRlcmFjdGlvbik6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcblx0XHRjb25zdCBjb21tYW5kID0gdGhpcy5tb2R1bGVzLmZpbmQobW9kdWxlID0+IG1vZHVsZS5uYW1lID09PSBpbnRlcmFjdGlvbi5jb21tYW5kTmFtZSk7XG5cblx0XHRpZiAoIWNvbW1hbmQpIHtcblx0XHRcdHRoaXMuZW1pdChDb250ZXh0Q29tbWFuZEhhbmRsZXJFdmVudHMuTk9UX0ZPVU5ELCBpbnRlcmFjdGlvbik7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKGNvbW1hbmQub3duZXJPbmx5ICYmICF0aGlzLmNsaWVudC5pc093bmVyKGludGVyYWN0aW9uLnVzZXIuaWQpKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzLkJMT0NLRUQsIGludGVyYWN0aW9uLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5PV05FUik7XG5cdFx0fVxuXHRcdGlmIChjb21tYW5kLnN1cGVyVXNlck9ubHkgJiYgIXRoaXMuY2xpZW50LmlzU3VwZXJVc2VyKGludGVyYWN0aW9uLnVzZXIuaWQpKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzLkJMT0NLRUQsIGludGVyYWN0aW9uLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5TVVBFUl9VU0VSKTtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0dGhpcy5lbWl0KENvbnRleHRDb21tYW5kSGFuZGxlckV2ZW50cy5TVEFSVEVELCBpbnRlcmFjdGlvbiwgY29tbWFuZCk7XG5cdFx0XHRjb25zdCByZXQgPSBhd2FpdCBjb21tYW5kLmV4ZWMoaW50ZXJhY3Rpb24pO1xuXHRcdFx0dGhpcy5lbWl0KENvbnRleHRDb21tYW5kSGFuZGxlckV2ZW50cy5GSU5JU0hFRCwgaW50ZXJhY3Rpb24sIGNvbW1hbmQsIHJldCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgaW50ZXJhY3Rpb24sIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGVycm9ycyBmcm9tIHRoZSBoYW5kbGluZy5cblx0ICogQHBhcmFtIGVyciAtIFRoZSBlcnJvci5cblx0ICogQHBhcmFtIGludGVyYWN0aW9uIC0gSW50ZXJhY3Rpb24gdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0aGF0IGVycm9yZWQuXG5cdCAqL1xuXHRwdWJsaWMgZW1pdEVycm9yKGVycjogRXJyb3IsIGludGVyYWN0aW9uOiBDb250ZXh0TWVudUludGVyYWN0aW9uLCBjb21tYW5kOiBDb250ZXh0TWVudUNvbW1hbmQgfCBBa2Fpcm9Nb2R1bGUpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5saXN0ZW5lckNvdW50KENvbnRleHRDb21tYW5kSGFuZGxlckV2ZW50cy5FUlJPUikpIHtcblx0XHRcdHRoaXMuZW1pdChDb250ZXh0Q29tbWFuZEhhbmRsZXJFdmVudHMuRVJST1IsIGVyciwgaW50ZXJhY3Rpb24sIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRocm93IGVycjtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGNvbnRleHRNZW51Q29tbWFuZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZGVyZWdpc3Rlcihjb250ZXh0TWVudUNvbW1hbmQ6IENvbnRleHRNZW51Q29tbWFuZCk6IHZvaWQge1xuXHRcdHJldHVybiBzdXBlci5kZXJlZ2lzdGVyKGNvbnRleHRNZW51Q29tbWFuZCk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjYXRlZ29yeSBieSBuYW1lLlxuXHQgKiBAcGFyYW0gbmFtZSAtIE5hbWUgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGZpbmRDYXRlZ29yeShuYW1lOiBzdHJpbmcpOiBDYXRlZ29yeTxzdHJpbmcsIENvbnRleHRNZW51Q29tbWFuZD4ge1xuXHRcdHJldHVybiBzdXBlci5maW5kQ2F0ZWdvcnkobmFtZSkgYXMgQ2F0ZWdvcnk8c3RyaW5nLCBDb250ZXh0TWVudUNvbW1hbmQ+O1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGFuIGNvbnRleHQgbWVudSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBNb2R1bGUgb3IgcGF0aCB0byBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZCh0aGluZzogc3RyaW5nIHwgQ29udGV4dE1lbnVDb21tYW5kKTogQ29udGV4dE1lbnVDb21tYW5kIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZykgYXMgQ29udGV4dE1lbnVDb21tYW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBjb250ZXh0IG1lbnUgY29tbWFuZHMgZnJvbSB0aGUgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS4gRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWRBbGwoZGlyZWN0b3J5Pzogc3RyaW5nLCBmaWx0ZXI/OiBMb2FkUHJlZGljYXRlKTogQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWRBbGwoZGlyZWN0b3J5LCBmaWx0ZXIpIGFzIENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gY29udGV4dE1lbnVDb21tYW5kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlZ2lzdGVyKGNvbnRleHRNZW51Q29tbWFuZDogQ29udGV4dE1lbnVDb21tYW5kLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdHJldHVybiBzdXBlci5yZWdpc3Rlcihjb250ZXh0TWVudUNvbW1hbmQsIGZpbGVwYXRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFuIGNvbnRleHQgbWVudSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgY29udGV4dCBtZW51IGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkKGlkOiBzdHJpbmcpOiBDb250ZXh0TWVudUNvbW1hbmQge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoaWQpIGFzIENvbnRleHRNZW51Q29tbWFuZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBjb250ZXh0IG1lbnUgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkQWxsKCk6IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWRBbGwoKSBhcyBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYW4gY29udGV4dCBtZW51IGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZCAtIElEIG9mIHRoZSBjb250ZXh0IG1lbnUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmUoaWQ6IHN0cmluZyk6IENvbnRleHRNZW51Q29tbWFuZCB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZShpZCkgYXMgQ29udGV4dE1lbnVDb21tYW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIGNvbnRleHQgbWVudSBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmVBbGwoKTogQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXI7XG5cdH1cblxuXHRwdWJsaWMgb3ZlcnJpZGUgb248SyBleHRlbmRzIGtleW9mIENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXJFdmVudHM+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlckV2ZW50c1tLXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub24oZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxuXHRwdWJsaWMgb3ZlcnJpZGUgb25jZTxLIGV4dGVuZHMga2V5b2YgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlckV2ZW50cz4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyRXZlbnRzW0tdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbmNlKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cbiJdfQ==