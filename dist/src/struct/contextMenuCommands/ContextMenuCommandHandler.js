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
}
exports.default = ContextMenuCommandHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29udGV4dE1lbnVDb21tYW5kcy9Db250ZXh0TWVudUNvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0EseUVBQWlEO0FBQ2pELG9EQUFtRTtBQUVuRSxxRUFBc0Y7QUFHdEYsOEVBQXNEO0FBRXREOzs7O0dBSUc7QUFDSCxNQUFxQix5QkFBMEIsU0FBUSx1QkFBYTtJQUNuRSxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyw0QkFBa0IsRUFDbEMsVUFBVSxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUMzQixrQkFBa0IsRUFDbEIsVUFBVSxLQUNlLEVBQUU7UUFFNUIsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsWUFBWSw0QkFBa0IsSUFBSSxhQUFhLEtBQUssNEJBQWtCLENBQUMsRUFBRTtZQUNyRyxNQUFNLElBQUkscUJBQVcsQ0FBQyx5QkFBeUIsRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFFLDRCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlGO1FBRUQsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNiLFNBQVM7WUFDVCxhQUFhO1lBQ2IsVUFBVTtZQUNWLGtCQUFrQjtZQUNsQixVQUFVO1NBQ1YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQXNCRDs7T0FFRztJQUNJLGdCQUFnQixDQUFvQjtJQU9qQyxLQUFLO1FBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtZQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFh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QztJQUVlLEVBQUUsQ0FDakIsS0FBUSxFQUNSLFFBQXdFO1FBRXhFLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNEO0FBbExELDRDQWtMQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhdGVnb3J5IH0gZnJvbSBcImRpc2NvcmQtYWthaXJvXCI7XG5pbXBvcnQgeyBBd2FpdGVkLCBDb2xsZWN0aW9uLCBDb250ZXh0TWVudUludGVyYWN0aW9uIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdHlwaW5ncy9ldmVudHNcIjtcbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IHsgQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7IEFrYWlyb0hhbmRsZXJPcHRpb25zLCBMb2FkUHJlZGljYXRlIH0gZnJvbSBcIi4uL0FrYWlyb0hhbmRsZXJcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUgZnJvbSBcIi4uL0FrYWlyb01vZHVsZVwiO1xuaW1wb3J0IEluaGliaXRvckhhbmRsZXIgZnJvbSBcIi4uL2luaGliaXRvcnMvSW5oaWJpdG9ySGFuZGxlclwiO1xuaW1wb3J0IENvbnRleHRNZW51Q29tbWFuZCBmcm9tIFwiLi9Db250ZXh0TWVudUNvbW1hbmRcIjtcblxuLyoqXG4gKiBMb2FkcyBjb250ZXh0IG1lbnUgY29tbWFuZHMgYW5kIGhhbmRsZXMgdGhlbS5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IENvbnRleHRNZW51Q29tbWFuZCxcblx0XHRcdGV4dGVuc2lvbnMgPSBbXCIuanNcIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fTogQWthaXJvSGFuZGxlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHRpZiAoIShjbGFzc1RvSGFuZGxlLnByb3RvdHlwZSBpbnN0YW5jZW9mIENvbnRleHRNZW51Q29tbWFuZCB8fCBjbGFzc1RvSGFuZGxlID09PSBDb250ZXh0TWVudUNvbW1hbmQpKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX0NMQVNTX1RPX0hBTkRMRVwiLCBjbGFzc1RvSGFuZGxlLm5hbWUsIENvbnRleHRNZW51Q29tbWFuZC5uYW1lKTtcblx0XHR9XG5cblx0XHRzdXBlcihjbGllbnQsIHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUsXG5cdFx0XHRleHRlbnNpb25zLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH0pO1xuXG5cdFx0dGhpcy5zZXR1cCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNhdGVnb3JpZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDYXRlZ29yeTxzdHJpbmcsIENvbnRleHRNZW51Q29tbWFuZD4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgQ29udGV4dE1lbnVDb21tYW5kO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBEaXJlY3RvcnkgdG8gY29udGV4dCBtZW51IGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEluaGliaXRvciBoYW5kbGVyIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBpbmhpYml0b3JIYW5kbGVyPzogSW5oaWJpdG9ySGFuZGxlcjtcblxuXHQvKipcblx0ICogQ29udGV4dCBtZW51IGNvbW1hbmRzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIGNvbnRleHQgbWVudSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIENvbnRleHRNZW51Q29tbWFuZD47XG5cblx0cHJvdGVjdGVkIHNldHVwKCkge1xuXHRcdHRoaXMuY2xpZW50Lm9uY2UoXCJyZWFkeVwiLCAoKSA9PiB7XG5cdFx0XHR0aGlzLmNsaWVudC5vbihcImludGVyYWN0aW9uQ3JlYXRlXCIsIGkgPT4ge1xuXHRcdFx0XHRpZiAoIWkuaXNDb250ZXh0TWVudSgpKSByZXR1cm47XG5cblx0XHRcdFx0dGhpcy5oYW5kbGUoaSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHB1YmxpYyBhc3luYyBoYW5kbGUoaW50ZXJhY3Rpb246IENvbnRleHRNZW51SW50ZXJhY3Rpb24pOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMubW9kdWxlcy5maW5kKG1vZHVsZSA9PiBtb2R1bGUubmFtZSA9PT0gaW50ZXJhY3Rpb24uY29tbWFuZE5hbWUpO1xuXG5cdFx0aWYgKCFjb21tYW5kKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzLk5PVF9GT1VORCwgaW50ZXJhY3Rpb24pO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzLlNUQVJURUQsIGludGVyYWN0aW9uLCBjb21tYW5kKTtcblx0XHRcdGNvbnN0IHJldCA9IGF3YWl0IGNvbW1hbmQuZXhlYyhpbnRlcmFjdGlvbik7XG5cdFx0XHR0aGlzLmVtaXQoQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzLkZJTklTSEVELCBpbnRlcmFjdGlvbiwgY29tbWFuZCwgcmV0KTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBpbnRlcmFjdGlvbiwgY29tbWFuZCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZXJyb3JzIGZyb20gdGhlIGhhbmRsaW5nLlxuXHQgKiBAcGFyYW0gZXJyIC0gVGhlIGVycm9yLlxuXHQgKiBAcGFyYW0gaW50ZXJhY3Rpb24gLSBJbnRlcmFjdGlvbiB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRoYXQgZXJyb3JlZC5cblx0ICovXG5cdHB1YmxpYyBlbWl0RXJyb3IoZXJyOiBFcnJvciwgaW50ZXJhY3Rpb246IENvbnRleHRNZW51SW50ZXJhY3Rpb24sIGNvbW1hbmQ6IENvbnRleHRNZW51Q29tbWFuZCB8IEFrYWlyb01vZHVsZSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLmxpc3RlbmVyQ291bnQoQ29udGV4dENvbW1hbmRIYW5kbGVyRXZlbnRzLkVSUk9SKSkge1xuXHRcdFx0dGhpcy5lbWl0KENvbnRleHRDb21tYW5kSGFuZGxlckV2ZW50cy5FUlJPUiwgZXJyLCBpbnRlcmFjdGlvbiwgY29tbWFuZCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhyb3cgZXJyO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gY29udGV4dE1lbnVDb21tYW5kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBkZXJlZ2lzdGVyKGNvbnRleHRNZW51Q29tbWFuZDogQ29udGV4dE1lbnVDb21tYW5kKTogdm9pZCB7XG5cdFx0cmV0dXJuIHN1cGVyLmRlcmVnaXN0ZXIoY29udGV4dE1lbnVDb21tYW5kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNhdGVnb3J5IGJ5IG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lIC0gTmFtZSB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZmluZENhdGVnb3J5KG5hbWU6IHN0cmluZyk6IENhdGVnb3J5PHN0cmluZywgQ29udGV4dE1lbnVDb21tYW5kPiB7XG5cdFx0cmV0dXJuIHN1cGVyLmZpbmRDYXRlZ29yeShuYW1lKSBhcyBDYXRlZ29yeTxzdHJpbmcsIENvbnRleHRNZW51Q29tbWFuZD47XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYW4gY29udGV4dCBtZW51IGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkKHRoaW5nOiBzdHJpbmcgfCBDb250ZXh0TWVudUNvbW1hbmQpOiBDb250ZXh0TWVudUNvbW1hbmQge1xuXHRcdHJldHVybiBzdXBlci5sb2FkKHRoaW5nKSBhcyBDb250ZXh0TWVudUNvbW1hbmQ7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIGNvbnRleHQgbWVudSBjb21tYW5kcyBmcm9tIHRoZSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZEFsbChkaXJlY3Rvcnk/OiBzdHJpbmcsIGZpbHRlcj86IExvYWRQcmVkaWNhdGUpOiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZEFsbChkaXJlY3RvcnksIGZpbHRlcikgYXMgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBjb250ZXh0TWVudUNvbW1hbmQgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVnaXN0ZXIoY29udGV4dE1lbnVDb21tYW5kOiBDb250ZXh0TWVudUNvbW1hbmQsIGZpbGVwYXRoPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlZ2lzdGVyKGNvbnRleHRNZW51Q29tbWFuZCwgZmlsZXBhdGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYW4gY29udGV4dCBtZW51IGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBjb250ZXh0IG1lbnUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoaWQ6IHN0cmluZyk6IENvbnRleHRNZW51Q29tbWFuZCB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZChpZCkgYXMgQ29udGV4dE1lbnVDb21tYW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIGNvbnRleHQgbWVudSBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWRBbGwoKTogQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZEFsbCgpIGFzIENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbiBjb250ZXh0IG1lbnUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gSUQgb2YgdGhlIGNvbnRleHQgbWVudSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZShpZDogc3RyaW5nKTogQ29udGV4dE1lbnVDb21tYW5kIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBDb250ZXh0TWVudUNvbW1hbmQ7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgY29udGV4dCBtZW51IGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlQWxsKCkgYXMgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlcjtcblx0fVxuXG5cdHB1YmxpYyBvdmVycmlkZSBvbjxLIGV4dGVuZHMga2V5b2YgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlckV2ZW50cz4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyRXZlbnRzW0tdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbihldmVudCwgbGlzdGVuZXIpO1xuXHR9XG59XG4iXX0=