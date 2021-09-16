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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29udGV4dE1lbnVDb21tYW5kcy9Db250ZXh0TWVudUNvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBRUEseUVBQWlEO0FBRWpELG9EQUFtRjtBQUVuRixxRUFBc0Y7QUFHdEYsOEVBQXNEO0FBRXREOzs7O0dBSUc7QUFDSCxNQUFxQix5QkFBMEIsU0FBUSx1QkFBYTtJQUNuRSxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyw0QkFBa0IsRUFDbEMsVUFBVSxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUMzQixrQkFBa0IsRUFDbEIsVUFBVSxLQUNlLEVBQUU7UUFFNUIsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsWUFBWSw0QkFBa0IsSUFBSSxhQUFhLEtBQUssNEJBQWtCLENBQUMsRUFBRTtZQUNyRyxNQUFNLElBQUkscUJBQVcsQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLDRCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlGO1FBRUQsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNiLFNBQVM7WUFDVCxhQUFhO1lBQ2IsVUFBVTtZQUNWLGtCQUFrQjtZQUNsQixVQUFVO1NBQ1YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQXNCRDs7T0FFRztJQUNJLGdCQUFnQixDQUFvQjtJQU9qQyxLQUFLO1FBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFh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QXNDLEVBQUUsUUFBaUI7UUFDakYsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFnQyxDQUFDO0lBQ3hELENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUF3QyxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUF1QixDQUFDO0lBQy9DLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUErQixDQUFDO0lBQ3ZELENBQUM7SUFFZSxFQUFFLENBQ2pCLEtBQVEsRUFDUixRQUEwRTtRQUUxRSxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDZSxJQUFJLENBQ25CLEtBQVEsRUFDUixRQUEwRTtRQUUxRSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDRDtBQS9MRCw0Q0ErTEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBd2FpdGVkLCBDb2xsZWN0aW9uLCBDb250ZXh0TWVudUludGVyYWN0aW9uIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdHlwaW5ncy9ldmVudHNcIjtcbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgeyBCdWlsdEluUmVhc29ucywgQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7IEFrYWlyb0hhbmRsZXJPcHRpb25zLCBMb2FkUHJlZGljYXRlIH0gZnJvbSBcIi4uL0FrYWlyb0hhbmRsZXJcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUgZnJvbSBcIi4uL0FrYWlyb01vZHVsZVwiO1xuaW1wb3J0IEluaGliaXRvckhhbmRsZXIgZnJvbSBcIi4uL2luaGliaXRvcnMvSW5oaWJpdG9ySGFuZGxlclwiO1xuaW1wb3J0IENvbnRleHRNZW51Q29tbWFuZCBmcm9tIFwiLi9Db250ZXh0TWVudUNvbW1hbmRcIjtcblxuLyoqXG4gKiBMb2FkcyBjb250ZXh0IG1lbnUgY29tbWFuZHMgYW5kIGhhbmRsZXMgdGhlbS5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IENvbnRleHRNZW51Q29tbWFuZCxcblx0XHRcdGV4dGVuc2lvbnMgPSBbXCIuanNcIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fTogQWthaXJvSGFuZGxlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHRpZiAoIShjbGFzc1RvSGFuZGxlLnByb3RvdHlwZSBpbnN0YW5jZW9mIENvbnRleHRNZW51Q29tbWFuZCB8fCBjbGFzc1RvSGFuZGxlID09PSBDb250ZXh0TWVudUNvbW1hbmQpKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX0NMQVNTX1RPX0hBTkRMRVwiLCBjbGFzc1RvSGFuZGxlLm5hbWUsIENvbnRleHRNZW51Q29tbWFuZC5uYW1lKTtcblx0XHR9XG5cblx0XHRzdXBlcihjbGllbnQsIHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUsXG5cdFx0XHRleHRlbnNpb25zLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH0pO1xuXG5cdFx0dGhpcy5zZXR1cCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNhdGVnb3JpZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDYXRlZ29yeTxzdHJpbmcsIENvbnRleHRNZW51Q29tbWFuZD4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgQ29udGV4dE1lbnVDb21tYW5kO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBEaXJlY3RvcnkgdG8gY29udGV4dCBtZW51IGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEluaGliaXRvciBoYW5kbGVyIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBpbmhpYml0b3JIYW5kbGVyPzogSW5oaWJpdG9ySGFuZGxlcjtcblxuXHQvKipcblx0ICogQ29udGV4dCBtZW51IGNvbW1hbmRzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIGNvbnRleHQgbWVudSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIENvbnRleHRNZW51Q29tbWFuZD47XG5cblx0cHJvdGVjdGVkIHNldHVwKCkge1xuXHRcdHRoaXMuY2xpZW50Lm9uY2UoXCJyZWFkeVwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmNsaWVudC5vbihcImludGVyYWN0aW9uQ3JlYXRlXCIsIGkgPT4ge1xuXHRcdFx0XHRpZiAoIWkuaXNDb250ZXh0TWVudSgpKSByZXR1cm47XG5cblx0XHRcdFx0dGhpcy5oYW5kbGUoaSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHB1YmxpYyBhc3luYyBoYW5kbGUoaW50ZXJhY3Rpb246IENvbnRleHRNZW51SW50ZXJhY3Rpb24pOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMubW9kdWxlcy5maW5kKG1vZHVsZSA9PiBtb2R1bGUubmFtZSA9PT0gaW50ZXJhY3Rpb24uY29tbWFuZE5hbWUpO1xuXG5cdFx0aWYgKCFjb21tYW5kKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzLk5PVF9GT1VORCwgaW50ZXJhY3Rpb24pO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLm93bmVyT25seSAmJiAhdGhpcy5jbGllbnQuaXNPd25lcihpbnRlcmFjdGlvbi51c2VyLmlkKSkge1xuXHRcdFx0dGhpcy5lbWl0KENvbnRleHRDb21tYW5kSGFuZGxlckV2ZW50cy5CTE9DS0VELCBpbnRlcmFjdGlvbiwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuT1dORVIpO1xuXHRcdH1cblx0XHRpZiAoY29tbWFuZC5zdXBlclVzZXJPbmx5ICYmICF0aGlzLmNsaWVudC5pc1N1cGVyVXNlcihpbnRlcmFjdGlvbi51c2VyLmlkKSkge1xuXHRcdFx0dGhpcy5lbWl0KENvbnRleHRDb21tYW5kSGFuZGxlckV2ZW50cy5CTE9DS0VELCBpbnRlcmFjdGlvbiwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuU1VQRVJfVVNFUik7XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdHRoaXMuZW1pdChDb250ZXh0Q29tbWFuZEhhbmRsZXJFdmVudHMuU1RBUlRFRCwgaW50ZXJhY3Rpb24sIGNvbW1hbmQpO1xuXHRcdFx0Y29uc3QgcmV0ID0gYXdhaXQgY29tbWFuZC5leGVjKGludGVyYWN0aW9uKTtcblx0XHRcdHRoaXMuZW1pdChDb250ZXh0Q29tbWFuZEhhbmRsZXJFdmVudHMuRklOSVNIRUQsIGludGVyYWN0aW9uLCBjb21tYW5kLCByZXQpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIGludGVyYWN0aW9uLCBjb21tYW5kKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBlcnJvcnMgZnJvbSB0aGUgaGFuZGxpbmcuXG5cdCAqIEBwYXJhbSBlcnIgLSBUaGUgZXJyb3IuXG5cdCAqIEBwYXJhbSBpbnRlcmFjdGlvbiAtIEludGVyYWN0aW9uIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdGhhdCBlcnJvcmVkLlxuXHQgKi9cblx0cHVibGljIGVtaXRFcnJvcihlcnI6IEVycm9yLCBpbnRlcmFjdGlvbjogQ29udGV4dE1lbnVJbnRlcmFjdGlvbiwgY29tbWFuZDogQ29udGV4dE1lbnVDb21tYW5kIHwgQWthaXJvTW9kdWxlKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMubGlzdGVuZXJDb3VudChDb250ZXh0Q29tbWFuZEhhbmRsZXJFdmVudHMuRVJST1IpKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzLkVSUk9SLCBlcnIsIGludGVyYWN0aW9uLCBjb21tYW5kKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aHJvdyBlcnI7XG5cdH1cblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBjb250ZXh0TWVudUNvbW1hbmQgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGRlcmVnaXN0ZXIoY29udGV4dE1lbnVDb21tYW5kOiBDb250ZXh0TWVudUNvbW1hbmQpOiB2b2lkIHtcblx0XHRyZXR1cm4gc3VwZXIuZGVyZWdpc3Rlcihjb250ZXh0TWVudUNvbW1hbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY2F0ZWdvcnkgYnkgbmFtZS5cblx0ICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBmaW5kQ2F0ZWdvcnkobmFtZTogc3RyaW5nKTogQ2F0ZWdvcnk8c3RyaW5nLCBDb250ZXh0TWVudUNvbW1hbmQ+IHtcblx0XHRyZXR1cm4gc3VwZXIuZmluZENhdGVnb3J5KG5hbWUpIGFzIENhdGVnb3J5PHN0cmluZywgQ29udGV4dE1lbnVDb21tYW5kPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhbiBjb250ZXh0IG1lbnUgY29tbWFuZC5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWQodGhpbmc6IHN0cmluZyB8IENvbnRleHRNZW51Q29tbWFuZCk6IFByb21pc2U8Q29udGV4dE1lbnVDb21tYW5kPiB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWQodGhpbmcpIGFzIFByb21pc2U8Q29udGV4dE1lbnVDb21tYW5kPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgY29udGV4dCBtZW51IGNvbW1hbmRzIGZyb20gdGhlIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkQWxsKGRpcmVjdG9yeT86IHN0cmluZywgZmlsdGVyPzogTG9hZFByZWRpY2F0ZSk6IFByb21pc2U8Q29udGV4dE1lbnVDb21tYW5kSGFuZGxlcj4ge1xuXHRcdHJldHVybiBzdXBlci5sb2FkQWxsKGRpcmVjdG9yeSwgZmlsdGVyKSBhcyBQcm9taXNlPENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXI+O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGNvbnRleHRNZW51Q29tbWFuZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWdpc3Rlcihjb250ZXh0TWVudUNvbW1hbmQ6IENvbnRleHRNZW51Q29tbWFuZCwgZmlsZXBhdGg/OiBzdHJpbmcpOiB2b2lkIHtcblx0XHRyZXR1cm4gc3VwZXIucmVnaXN0ZXIoY29udGV4dE1lbnVDb21tYW5kLCBmaWxlcGF0aCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbiBjb250ZXh0IG1lbnUgY29tbWFuZC5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGNvbnRleHQgbWVudSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZChpZDogc3RyaW5nKTogUHJvbWlzZTxDb250ZXh0TWVudUNvbW1hbmQ+IHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkKGlkKSBhcyBQcm9taXNlPENvbnRleHRNZW51Q29tbWFuZD47XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgY29udGV4dCBtZW51IGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZEFsbCgpOiBQcm9taXNlPENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXI+IHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkQWxsKCkgYXMgUHJvbWlzZTxDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFuIGNvbnRleHQgbWVudSBjb21tYW5kLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBJRCBvZiB0aGUgY29udGV4dCBtZW51IGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBDb250ZXh0TWVudUNvbW1hbmQge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmUoaWQpIGFzIENvbnRleHRNZW51Q29tbWFuZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBjb250ZXh0IG1lbnUgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlQWxsKCk6IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmVBbGwoKSBhcyBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyO1xuXHR9XG5cblx0cHVibGljIG92ZXJyaWRlIG9uPEsgZXh0ZW5kcyBrZXlvZiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyRXZlbnRzPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXJFdmVudHNbS11bXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub24oZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxuXHRwdWJsaWMgb3ZlcnJpZGUgb25jZTxLIGV4dGVuZHMga2V5b2YgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlckV2ZW50cz4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyRXZlbnRzW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uY2UoZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxufVxuIl19