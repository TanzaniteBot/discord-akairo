"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoModule_1 = __importDefault(require("../AkairoModule"));
const Argument_1 = __importDefault(require("./arguments/Argument"));
const ArgumentRunner_1 = __importDefault(require("./arguments/ArgumentRunner"));
const ContentParser_1 = __importDefault(require("./ContentParser"));
/**
 * Represents a command.
 * @param id - Command ID.
 * @param options - Options for the command.
 */
class Command extends AkairoModule_1.default {
    /**
     * Command names.
     */
    aliases;
    /**
     * Default prompt options.
     */
    argumentDefaults;
    /**
     * Usable only in this channel type.
     */
    channel;
    /**
     * Permissions required to run command by the client.
     */
    clientPermissions;
    /**
     * Cooldown in milliseconds.
     */
    cooldown;
    /**
     * Description of the command.
     */
    description;
    /**
     * Whether or not this command can be ran by an edit.
     */
    editable;
    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    ignoreCooldown;
    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    ignorePermissions;
    /**
     * The key supplier for the locker.
     */
    lock;
    /**
     * Stores the current locks.
     */
    locker;
    /**
     * Whether or not the command can only be run in  NSFW channels.
     */
    onlyNsfw;
    /**
     * Usable only by the client owner.
     */
    ownerOnly;
    /**
     * Command prefix overwrite.
     */
    prefix;
    /**
     * Whether or not to consider quotes.
     */
    quoted;
    /**
     * Uses allowed before cooldown.
     */
    ratelimit;
    /**
     * The regex trigger for this command.
     */
    regex;
    /**
     * Mark command as slash command and set information.
     */
    slash;
    /**
     * Whether slash command responses for this command should be ephemeral or not.
     */
    slashEphemeral;
    /**
     * Assign slash commands to Specific guilds. This option will make the commands do not register globally, but only to the chosen servers.
     */
    slashGuilds;
    /**
     * Options for using the slash command.
     */
    slashOptions;
    /**
     * Whether or not to allow client superUsers(s) only.
     */
    superUserOnly;
    /**
     * Whether or not to type during command execution.
     */
    typing;
    /**
     * Permissions required to run command by the user.
     */
    userPermissions;
    /**
     * Argument options or generator.
     */
    args;
    /**
     * Checks if the command should be ran by using an arbitrary condition.
     */
    condition;
    /**
     * Runs before argument parsing and execution.
     */
    before;
    /**
     * The content parser.
     */
    contentParser;
    /**
     * The argument runner.
     */
    argumentRunner;
    /**
     * Generator for arguments.
     */
    argumentGenerator;
    constructor(id, options) {
        super(id, { category: options.category });
        const { onlyNsfw = false, aliases = [], args = this.args || [], quoted = true, separator, channel = null, ownerOnly = false, superUserOnly = false, editable = true, typing = false, cooldown = null, ratelimit = 1, argumentDefaults = {}, description = "", prefix = this.prefix, clientPermissions = this.clientPermissions, userPermissions = this.userPermissions, regex = this.regex, condition = this.condition || (() => false), before = this.before || (() => undefined), lock, ignoreCooldown, ignorePermissions, flags = [], optionFlags = [], slash = false, slashOptions, slashEphemeral = false, slashGuilds = [] } = options;
        this.aliases = aliases;
        const { flagWords, optionFlagWords } = Array.isArray(args)
            ? ContentParser_1.default.getFlags(args)
            : { flagWords: flags, optionFlagWords: optionFlags };
        this.contentParser = new ContentParser_1.default({
            flagWords,
            optionFlagWords,
            quoted,
            separator
        });
        this.argumentRunner = new ArgumentRunner_1.default(this);
        this.argumentGenerator = Array.isArray(args)
            ? ArgumentRunner_1.default.fromArguments(
            // @ts-expect-error
            args.map(arg => [arg.id, new Argument_1.default(this, arg)]))
            : args.bind(this);
        this.onlyNsfw = Boolean(onlyNsfw);
        this.channel = channel;
        this.ownerOnly = Boolean(ownerOnly);
        this.superUserOnly = Boolean(superUserOnly);
        this.editable = Boolean(editable);
        this.typing = Boolean(typing);
        this.cooldown = cooldown;
        this.ratelimit = ratelimit;
        this.argumentDefaults = argumentDefaults;
        this.description = Array.isArray(description)
            ? description.join("\n")
            : description;
        this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;
        this.clientPermissions =
            typeof clientPermissions === "function"
                ? clientPermissions.bind(this)
                : clientPermissions;
        this.userPermissions =
            typeof userPermissions === "function"
                ? userPermissions.bind(this)
                : userPermissions;
        this.regex = typeof regex === "function" ? regex.bind(this) : regex;
        this.condition = condition.bind(this);
        this.before = before.bind(this);
        this.lock = lock;
        if (typeof lock === "string") {
            this.lock = {
                guild: (message) => message.guild && message.guild.id,
                channel: (message) => message.channel.id,
                user: (message) => message.author.id
            }[lock];
        }
        if (this.lock) {
            this.locker = new Set();
        }
        this.ignoreCooldown =
            typeof ignoreCooldown === "function"
                ? ignoreCooldown.bind(this)
                : ignoreCooldown;
        this.ignorePermissions =
            typeof ignorePermissions === "function"
                ? ignorePermissions.bind(this)
                : ignorePermissions;
        this.slashOptions = slashOptions;
        this.slashEphemeral = slashEphemeral;
        this.slash = slash;
        this.slashGuilds = slashGuilds;
    }
    /**
     * Executes the command.
     * @param message - Message that triggered the command.
     * @param args - Evaluated arguments.
     */
    // @ts-expect-error
    // eslint-disable-next-line func-names, @typescript-eslint/no-unused-vars
    exec(message, args) {
        throw new AkairoError_1.default("NOT_IMPLEMENTED", this.constructor.name, "exec");
    }
    /**
     * Execute the slash command
     * @param {AkairoMessage} message - Message for slash command
     * @param {any} args - Slash command options
     * @returns {any}
     */
    /* Disabled cause it wouldn't work with the current design */
    // execSlash() {
    // 	if (this.slash) {
    // 		throw new AkairoError(
    // 			"NOT_IMPLEMENTED",
    // 			this.constructor.name,
    // 			"execSlash"
    // 		);
    // 	}
    // }
    /**
     * Parses content using the command's arguments.
     * @param {Message} message - Message to use.
     * @param {string} content - String to parse.
     * @returns {Promise<Flag|any>}
     */
    parse(message, content) {
        const parsed = this.contentParser.parse(content);
        return this.argumentRunner.run(message, parsed, this.argumentGenerator);
    }
}
exports.default = Command;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvQ29tbWFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLHlFQUFpRDtBQUlqRCxtRUFBb0U7QUFDcEUsb0VBRzhCO0FBQzlCLGdGQUVvQztBQUtwQyxvRUFBcUU7QUFHckU7Ozs7R0FJRztBQUNILE1BQThCLE9BQVEsU0FBUSxzQkFBWTtJQUN6RDs7T0FFRztJQUNJLE9BQU8sQ0FBVztJQUV6Qjs7T0FFRztJQUNJLGdCQUFnQixDQUF5QjtJQU9oRDs7T0FFRztJQUNJLE9BQU8sQ0FBVTtJQU94Qjs7T0FFRztJQUNJLGlCQUFpQixDQUdLO0lBRTdCOztPQUVHO0lBQ0ksUUFBUSxDQUFVO0lBRXpCOztPQUVHO0lBQ0ksV0FBVyxDQUFNO0lBRXhCOztPQUVHO0lBQ0ksUUFBUSxDQUFVO0lBaUJ6Qjs7T0FFRztJQUNJLGNBQWMsQ0FBa0Q7SUFFdkU7O09BRUc7SUFDSSxpQkFBaUIsQ0FBa0Q7SUFFMUU7O09BRUc7SUFDSSxJQUFJLENBQThDO0lBRXpEOztPQUVHO0lBQ0ksTUFBTSxDQUFlO0lBRTVCOztPQUVHO0lBQ0ksUUFBUSxDQUFVO0lBRXpCOztPQUVHO0lBQ0ksU0FBUyxDQUFVO0lBRTFCOztPQUVHO0lBQ0ksTUFBTSxDQUFzQztJQUVuRDs7T0FFRztJQUNJLE1BQU0sQ0FBVTtJQUV2Qjs7T0FFRztJQUNJLFNBQVMsQ0FBUztJQUV6Qjs7T0FFRztJQUNJLEtBQUssQ0FBeUI7SUFFckM7O09BRUc7SUFDSSxLQUFLLENBQVc7SUFFdkI7O09BRUc7SUFDSSxjQUFjLENBQVc7SUFFaEM7O09BRUc7SUFDSSxXQUFXLENBQVk7SUFFOUI7O09BRUc7SUFDSSxZQUFZLENBQWtDO0lBRXJEOztPQUVHO0lBQ0ksYUFBYSxDQUFVO0lBRTlCOztPQUVHO0lBQ0ksTUFBTSxDQUFVO0lBRXZCOztPQUVHO0lBQ0ksZUFBZSxDQUdPO0lB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LFdBQVcsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILG1CQUFtQjtJQUNuQix5RUFBeUU7SUFDekQsSUFBSSxDQUFDLE9BQWdDLEVBQUUsSUFBUztRQUMvRCxNQUFNLElBQUkscUJBQVcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCw2REFBNkQ7SUFDN0QsZ0JBQWdCO0lBQ2hCLHFCQUFxQjtJQUNyQiwyQkFBMkI7SUFDM0Isd0JBQXdCO0lBQ3hCLDRCQUE0QjtJQUM1QixpQkFBaUI7SUFDakIsT0FBTztJQUNQLEtBQUs7SUFDTCxJQUFJO0lBRUo7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsT0FBZ0IsRUFBRSxPQUFlO1FBQ3RDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN6RSxDQUFDO0NBZUQ7QUEzV0QsMEJBMldDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0TWVzc2FnZSxcblx0UGVybWlzc2lvblJlc29sdmFibGUsXG5cdFNub3dmbGFrZSxcblx0QXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YVxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQWthaXJvTWVzc2FnZSBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9NZXNzYWdlXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uLy4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSwgeyBBa2Fpcm9Nb2R1bGVPcHRpb25zIH0gZnJvbSBcIi4uL0FrYWlyb01vZHVsZVwiO1xuaW1wb3J0IEFyZ3VtZW50LCB7XG5cdEFyZ3VtZW50T3B0aW9ucyxcblx0RGVmYXVsdEFyZ3VtZW50T3B0aW9uc1xufSBmcm9tIFwiLi9hcmd1bWVudHMvQXJndW1lbnRcIjtcbmltcG9ydCBBcmd1bWVudFJ1bm5lciwge1xuXHRBcmd1bWVudFJ1bm5lclN0YXRlXG59IGZyb20gXCIuL2FyZ3VtZW50cy9Bcmd1bWVudFJ1bm5lclwiO1xuaW1wb3J0IENvbW1hbmRIYW5kbGVyLCB7XG5cdElnbm9yZUNoZWNrUHJlZGljYXRlLFxuXHRQcmVmaXhTdXBwbGllclxufSBmcm9tIFwiLi9Db21tYW5kSGFuZGxlclwiO1xuaW1wb3J0IENvbnRlbnRQYXJzZXIsIHsgQ29udGVudFBhcnNlclJlc3VsdCB9IGZyb20gXCIuL0NvbnRlbnRQYXJzZXJcIjtcbmltcG9ydCBGbGFnIGZyb20gXCIuL0ZsYWdcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgY29tbWFuZC5cbiAqIEBwYXJhbSBpZCAtIENvbW1hbmQgSUQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBjb21tYW5kLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBDb21tYW5kIGV4dGVuZHMgQWthaXJvTW9kdWxlIHtcblx0LyoqXG5cdCAqIENvbW1hbmQgbmFtZXMuXG5cdCAqL1xuXHRwdWJsaWMgYWxpYXNlczogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgcHJvbXB0IG9wdGlvbnMuXG5cdCAqL1xuXHRwdWJsaWMgYXJndW1lbnREZWZhdWx0czogRGVmYXVsdEFyZ3VtZW50T3B0aW9ucztcblxuXHQvKipcblx0ICogQ2F0ZWdvcnkgdGhlIGNvbW1hbmQgYmVsb25ncyB0by5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNhdGVnb3J5OiBDYXRlZ29yeTxzdHJpbmcsIENvbW1hbmQ+O1xuXG5cdC8qKlxuXHQgKiBVc2FibGUgb25seSBpbiB0aGlzIGNoYW5uZWwgdHlwZS5cblx0ICovXG5cdHB1YmxpYyBjaGFubmVsPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBQZXJtaXNzaW9ucyByZXF1aXJlZCB0byBydW4gY29tbWFuZCBieSB0aGUgY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGNsaWVudFBlcm1pc3Npb25zOlxuXHRcdHwgUGVybWlzc2lvblJlc29sdmFibGVcblx0XHR8IFBlcm1pc3Npb25SZXNvbHZhYmxlW11cblx0XHR8IE1pc3NpbmdQZXJtaXNzaW9uU3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIENvb2xkb3duIGluIG1pbGxpc2Vjb25kcy5cblx0ICovXG5cdHB1YmxpYyBjb29sZG93bj86IG51bWJlcjtcblxuXHQvKipcblx0ICogRGVzY3JpcHRpb24gb2YgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVzY3JpcHRpb246IGFueTtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhpcyBjb21tYW5kIGNhbiBiZSByYW4gYnkgYW4gZWRpdC5cblx0ICovXG5cdHB1YmxpYyBlZGl0YWJsZTogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIGZpbGVwYXRoLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZmlsZXBhdGg6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBoYW5kbGVyOiBDb21tYW5kSGFuZGxlcjtcblxuXHQvKipcblx0ICogVGhlIElEIG9mIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgaWQ6IHN0cmluZztcblxuXHQvKipcblx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgY29vbGRvd24gb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuXG5cdCAqL1xuXHRwdWJsaWMgaWdub3JlQ29vbGRvd24/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBgdXNlclBlcm1pc3Npb25zYCBjaGVja3Mgb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuXG5cdCAqL1xuXHRwdWJsaWMgaWdub3JlUGVybWlzc2lvbnM/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBUaGUga2V5IHN1cHBsaWVyIGZvciB0aGUgbG9ja2VyLlxuXHQgKi9cblx0cHVibGljIGxvY2s/OiBLZXlTdXBwbGllciB8IFwiY2hhbm5lbFwiIHwgXCJndWlsZFwiIHwgXCJ1c2VyXCI7XG5cblx0LyoqXG5cdCAqIFN0b3JlcyB0aGUgY3VycmVudCBsb2Nrcy5cblx0ICovXG5cdHB1YmxpYyBsb2NrZXI/OiBTZXQ8c3RyaW5nPjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgY2FuIG9ubHkgYmUgcnVuIGluICBOU0ZXIGNoYW5uZWxzLlxuXHQgKi9cblx0cHVibGljIG9ubHlOc2Z3OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBVc2FibGUgb25seSBieSB0aGUgY2xpZW50IG93bmVyLlxuXHQgKi9cblx0cHVibGljIG93bmVyT25seTogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ29tbWFuZCBwcmVmaXggb3ZlcndyaXRlLlxuXHQgKi9cblx0cHVibGljIHByZWZpeD86IHN0cmluZyB8IHN0cmluZ1tdIHwgUHJlZml4U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGNvbnNpZGVyIHF1b3Rlcy5cblx0ICovXG5cdHB1YmxpYyBxdW90ZWQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFVzZXMgYWxsb3dlZCBiZWZvcmUgY29vbGRvd24uXG5cdCAqL1xuXHRwdWJsaWMgcmF0ZWxpbWl0OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSByZWdleCB0cmlnZ2VyIGZvciB0aGlzIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgcmVnZXg6IFJlZ0V4cCB8IFJlZ2V4U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIE1hcmsgY29tbWFuZCBhcyBzbGFzaCBjb21tYW5kIGFuZCBzZXQgaW5mb3JtYXRpb24uXG5cdCAqL1xuXHRwdWJsaWMgc2xhc2g/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHNsYXNoIGNvbW1hbmQgcmVzcG9uc2VzIGZvciB0aGlzIGNvbW1hbmQgc2hvdWxkIGJlIGVwaGVtZXJhbCBvciBub3QuXG5cdCAqL1xuXHRwdWJsaWMgc2xhc2hFcGhlbWVyYWw/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBBc3NpZ24gc2xhc2ggY29tbWFuZHMgdG8gU3BlY2lmaWMgZ3VpbGRzLiBUaGlzIG9wdGlvbiB3aWxsIG1ha2UgdGhlIGNvbW1hbmRzIGRvIG5vdCByZWdpc3RlciBnbG9iYWxseSwgYnV0IG9ubHkgdG8gdGhlIGNob3NlbiBzZXJ2ZXJzLlxuXHQgKi9cblx0cHVibGljIHNsYXNoR3VpbGRzPzogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIE9wdGlvbnMgZm9yIHVzaW5nIHRoZSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIHNsYXNoT3B0aW9ucz86IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkRhdGFbXTtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYWxsb3cgY2xpZW50IHN1cGVyVXNlcnMocykgb25seS5cblx0ICovXG5cdHB1YmxpYyBzdXBlclVzZXJPbmx5OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byB0eXBlIGR1cmluZyBjb21tYW5kIGV4ZWN1dGlvbi5cblx0ICovXG5cdHB1YmxpYyB0eXBpbmc6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFBlcm1pc3Npb25zIHJlcXVpcmVkIHRvIHJ1biBjb21tYW5kIGJ5IHRoZSB1c2VyLlxuXHQgKi9cblx0cHVibGljIHVzZXJQZXJtaXNzaW9uczpcblx0XHR8IFBlcm1pc3Npb25SZXNvbHZhYmxlXG5cdFx0fCBQZXJtaXNzaW9uUmVzb2x2YWJsZVtdXG5cdFx0fCBNaXNzaW5nUGVybWlzc2lvblN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBBcmd1bWVudCBvcHRpb25zIG9yIGdlbmVyYXRvci5cblx0ICovXG5cdCBwdWJsaWMgYXJnczogQXJndW1lbnRPcHRpb25zW10gfCBBcmd1bWVudEdlbmVyYXRvcjtcblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBjb21tYW5kIHNob3VsZCBiZSByYW4gYnkgdXNpbmcgYW4gYXJiaXRyYXJ5IGNvbmRpdGlvbi5cblx0ICovXG5cdCBwdWJsaWMgY29uZGl0aW9uOiBFeGVjdXRpb25QcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIFJ1bnMgYmVmb3JlIGFyZ3VtZW50IHBhcnNpbmcgYW5kIGV4ZWN1dGlvbi5cblx0ICovXG5cdCBwdWJsaWMgYmVmb3JlOiBCZWZvcmVBY3Rpb247XG5cblx0LyoqXG5cdCAqIFRoZSBjb250ZW50IHBhcnNlci5cblx0ICovXG5cdCBwdWJsaWMgY29udGVudFBhcnNlcjogQ29udGVudFBhcnNlcjtcblxuXHQvKipcblx0ICogVGhlIGFyZ3VtZW50IHJ1bm5lci5cblx0ICovXG5cdCBwdWJsaWMgYXJndW1lbnRSdW5uZXI6IEFyZ3VtZW50UnVubmVyO1xuXG5cdC8qKlxuXHQgKiBHZW5lcmF0b3IgZm9yIGFyZ3VtZW50cy5cblx0ICovXG5cdCBwdWJsaWMgYXJndW1lbnRHZW5lcmF0b3I6IEFyZ3VtZW50R2VuZXJhdG9yO1xuXG5cdGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIG9wdGlvbnM6IENvbW1hbmRPcHRpb25zKSB7XG5cdFx0c3VwZXIoaWQsIHsgY2F0ZWdvcnk6IG9wdGlvbnMuY2F0ZWdvcnkgfSk7XG5cblx0XHRjb25zdCB7XG5cdFx0XHRvbmx5TnNmdyA9IGZhbHNlLFxuXHRcdFx0YWxpYXNlcyA9IFtdLFxuXHRcdFx0YXJncyA9IHRoaXMuYXJncyB8fCBbXSxcblx0XHRcdHF1b3RlZCA9IHRydWUsXG5cdFx0XHRzZXBhcmF0b3IsXG5cdFx0XHRjaGFubmVsID0gbnVsbCxcblx0XHRcdG93bmVyT25seSA9IGZhbHNlLFxuXHRcdFx0c3VwZXJVc2VyT25seSA9IGZhbHNlLFxuXHRcdFx0ZWRpdGFibGUgPSB0cnVlLFxuXHRcdFx0dHlwaW5nID0gZmFsc2UsXG5cdFx0XHRjb29sZG93biA9IG51bGwsXG5cdFx0XHRyYXRlbGltaXQgPSAxLFxuXHRcdFx0YXJndW1lbnREZWZhdWx0cyA9IHt9LFxuXHRcdFx0ZGVzY3JpcHRpb24gPSBcIlwiLFxuXHRcdFx0cHJlZml4ID0gdGhpcy5wcmVmaXgsXG5cdFx0XHRjbGllbnRQZXJtaXNzaW9ucyA9IHRoaXMuY2xpZW50UGVybWlzc2lvbnMsXG5cdFx0XHR1c2VyUGVybWlzc2lvbnMgPSB0aGlzLnVzZXJQZXJtaXNzaW9ucyxcblx0XHRcdHJlZ2V4ID0gdGhpcy5yZWdleCxcblx0XHRcdGNvbmRpdGlvbiA9IHRoaXMuY29uZGl0aW9uIHx8ICgoKSA9PiBmYWxzZSksXG5cdFx0XHRiZWZvcmUgPSB0aGlzLmJlZm9yZSB8fCAoKCkgPT4gdW5kZWZpbmVkKSxcblx0XHRcdGxvY2ssXG5cdFx0XHRpZ25vcmVDb29sZG93bixcblx0XHRcdGlnbm9yZVBlcm1pc3Npb25zLFxuXHRcdFx0ZmxhZ3MgPSBbXSxcblx0XHRcdG9wdGlvbkZsYWdzID0gW10sXG5cdFx0XHRzbGFzaCA9IGZhbHNlLFxuXHRcdFx0c2xhc2hPcHRpb25zLFxuXHRcdFx0c2xhc2hFcGhlbWVyYWwgPSBmYWxzZSxcblx0XHRcdHNsYXNoR3VpbGRzID0gW11cblx0XHR9OiBDb21tYW5kT3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0XHR0aGlzLmFsaWFzZXMgPSBhbGlhc2VzO1xuXG5cdFx0Y29uc3QgeyBmbGFnV29yZHMsIG9wdGlvbkZsYWdXb3JkcyB9ID0gQXJyYXkuaXNBcnJheShhcmdzKVxuXHRcdFx0PyBDb250ZW50UGFyc2VyLmdldEZsYWdzKGFyZ3MpXG5cdFx0XHQ6IHsgZmxhZ1dvcmRzOiBmbGFncywgb3B0aW9uRmxhZ1dvcmRzOiBvcHRpb25GbGFncyB9O1xuXG5cdFx0dGhpcy5jb250ZW50UGFyc2VyID0gbmV3IENvbnRlbnRQYXJzZXIoe1xuXHRcdFx0ZmxhZ1dvcmRzLFxuXHRcdFx0b3B0aW9uRmxhZ1dvcmRzLFxuXHRcdFx0cXVvdGVkLFxuXHRcdFx0c2VwYXJhdG9yXG5cdFx0fSk7XG5cblx0XHR0aGlzLmFyZ3VtZW50UnVubmVyID0gbmV3IEFyZ3VtZW50UnVubmVyKHRoaXMpO1xuXHRcdHRoaXMuYXJndW1lbnRHZW5lcmF0b3IgPSBBcnJheS5pc0FycmF5KGFyZ3MpXG5cdFx0XHQ/IEFyZ3VtZW50UnVubmVyLmZyb21Bcmd1bWVudHMoXG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdGFyZ3MubWFwKGFyZyA9PiBbYXJnLmlkLCBuZXcgQXJndW1lbnQodGhpcywgYXJnKV0pXG5cdFx0XHQgIClcblx0XHRcdDogYXJncy5iaW5kKHRoaXMpO1xuXG5cdFx0dGhpcy5vbmx5TnNmdyA9IEJvb2xlYW4ob25seU5zZncpO1xuXG5cdFx0dGhpcy5jaGFubmVsID0gY2hhbm5lbDtcblxuXHRcdHRoaXMub3duZXJPbmx5ID0gQm9vbGVhbihvd25lck9ubHkpO1xuXG5cdFx0dGhpcy5zdXBlclVzZXJPbmx5ID0gQm9vbGVhbihzdXBlclVzZXJPbmx5KTtcblxuXHRcdHRoaXMuZWRpdGFibGUgPSBCb29sZWFuKGVkaXRhYmxlKTtcblxuXHRcdHRoaXMudHlwaW5nID0gQm9vbGVhbih0eXBpbmcpO1xuXG5cdFx0dGhpcy5jb29sZG93biA9IGNvb2xkb3duO1xuXG5cdFx0dGhpcy5yYXRlbGltaXQgPSByYXRlbGltaXQ7XG5cblx0XHR0aGlzLmFyZ3VtZW50RGVmYXVsdHMgPSBhcmd1bWVudERlZmF1bHRzO1xuXG5cdFx0dGhpcy5kZXNjcmlwdGlvbiA9IEFycmF5LmlzQXJyYXkoZGVzY3JpcHRpb24pXG5cdFx0XHQ/IGRlc2NyaXB0aW9uLmpvaW4oXCJcXG5cIilcblx0XHRcdDogZGVzY3JpcHRpb247XG5cblx0XHR0aGlzLnByZWZpeCA9IHR5cGVvZiBwcmVmaXggPT09IFwiZnVuY3Rpb25cIiA/IHByZWZpeC5iaW5kKHRoaXMpIDogcHJlZml4O1xuXG5cdFx0dGhpcy5jbGllbnRQZXJtaXNzaW9ucyA9XG5cdFx0XHR0eXBlb2YgY2xpZW50UGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0XHQ/IGNsaWVudFBlcm1pc3Npb25zLmJpbmQodGhpcylcblx0XHRcdFx0OiBjbGllbnRQZXJtaXNzaW9ucztcblxuXHRcdHRoaXMudXNlclBlcm1pc3Npb25zID1cblx0XHRcdHR5cGVvZiB1c2VyUGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0XHQ/IHVzZXJQZXJtaXNzaW9ucy5iaW5kKHRoaXMpXG5cdFx0XHRcdDogdXNlclBlcm1pc3Npb25zO1xuXG5cdFx0dGhpcy5yZWdleCA9IHR5cGVvZiByZWdleCA9PT0gXCJmdW5jdGlvblwiID8gcmVnZXguYmluZCh0aGlzKSA6IHJlZ2V4O1xuXG5cdFx0dGhpcy5jb25kaXRpb24gPSBjb25kaXRpb24uYmluZCh0aGlzKTtcblxuXHRcdHRoaXMuYmVmb3JlID0gYmVmb3JlLmJpbmQodGhpcyk7XG5cblx0XHR0aGlzLmxvY2sgPSBsb2NrO1xuXG5cdFx0aWYgKHR5cGVvZiBsb2NrID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHR0aGlzLmxvY2sgPSB7XG5cdFx0XHRcdGd1aWxkOiAobWVzc2FnZTogTWVzc2FnZSkgPT4gbWVzc2FnZS5ndWlsZCAmJiBtZXNzYWdlLmd1aWxkLmlkLFxuXHRcdFx0XHRjaGFubmVsOiAobWVzc2FnZTogTWVzc2FnZSkgPT4gbWVzc2FnZS5jaGFubmVsLmlkLFxuXHRcdFx0XHR1c2VyOiAobWVzc2FnZTogTWVzc2FnZSkgPT4gbWVzc2FnZS5hdXRob3IuaWRcblx0XHRcdH1bbG9ja107XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMubG9jaykge1xuXHRcdFx0dGhpcy5sb2NrZXIgPSBuZXcgU2V0KCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5pZ25vcmVDb29sZG93biA9XG5cdFx0XHR0eXBlb2YgaWdub3JlQ29vbGRvd24gPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0XHQ/IGlnbm9yZUNvb2xkb3duLmJpbmQodGhpcylcblx0XHRcdFx0OiBpZ25vcmVDb29sZG93bjtcblxuXHRcdHRoaXMuaWdub3JlUGVybWlzc2lvbnMgPVxuXHRcdFx0dHlwZW9mIGlnbm9yZVBlcm1pc3Npb25zID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdFx0PyBpZ25vcmVQZXJtaXNzaW9ucy5iaW5kKHRoaXMpXG5cdFx0XHRcdDogaWdub3JlUGVybWlzc2lvbnM7XG5cblx0XHR0aGlzLnNsYXNoT3B0aW9ucyA9IHNsYXNoT3B0aW9ucztcblxuXHRcdHRoaXMuc2xhc2hFcGhlbWVyYWwgPSBzbGFzaEVwaGVtZXJhbDtcblxuXHRcdHRoaXMuc2xhc2ggPSBzbGFzaDtcblxuXHRcdHRoaXMuc2xhc2hHdWlsZHMgPSBzbGFzaEd1aWxkcztcblx0fVxuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gYXJncyAtIEV2YWx1YXRlZCBhcmd1bWVudHMuXG5cdCAqL1xuXHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0cHVibGljIGFic3RyYWN0IGV4ZWMobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsIGFyZ3M6IGFueSk6IGFueSB7XG5cdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiTk9UX0lNUExFTUVOVEVEXCIsIHRoaXMuY29uc3RydWN0b3IubmFtZSwgXCJleGVjXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4ZWN1dGUgdGhlIHNsYXNoIGNvbW1hbmRcblx0ICogQHBhcmFtIHtBa2Fpcm9NZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSBmb3Igc2xhc2ggY29tbWFuZFxuXHQgKiBAcGFyYW0ge2FueX0gYXJncyAtIFNsYXNoIGNvbW1hbmQgb3B0aW9uc1xuXHQgKiBAcmV0dXJucyB7YW55fVxuXHQgKi9cblx0LyogRGlzYWJsZWQgY2F1c2UgaXQgd291bGRuJ3Qgd29yayB3aXRoIHRoZSBjdXJyZW50IGRlc2lnbiAqL1xuXHQvLyBleGVjU2xhc2goKSB7XG5cdC8vIFx0aWYgKHRoaXMuc2xhc2gpIHtcblx0Ly8gXHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcblx0Ly8gXHRcdFx0XCJOT1RfSU1QTEVNRU5URURcIixcblx0Ly8gXHRcdFx0dGhpcy5jb25zdHJ1Y3Rvci5uYW1lLFxuXHQvLyBcdFx0XHRcImV4ZWNTbGFzaFwiXG5cdC8vIFx0XHQpO1xuXHQvLyBcdH1cblx0Ly8gfVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgY29udGVudCB1c2luZyB0aGUgY29tbWFuZCdzIGFyZ3VtZW50cy5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0byB1c2UuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IC0gU3RyaW5nIHRvIHBhcnNlLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTxGbGFnfGFueT59XG5cdCAqL1xuXHRwYXJzZShtZXNzYWdlOiBNZXNzYWdlLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBwYXJzZWQgPSB0aGlzLmNvbnRlbnRQYXJzZXIucGFyc2UoY29udGVudCk7XG5cdFx0cmV0dXJuIHRoaXMuYXJndW1lbnRSdW5uZXIucnVuKG1lc3NhZ2UsIHBhcnNlZCwgdGhpcy5hcmd1bWVudEdlbmVyYXRvcik7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyB0aGUgY29tbWFuZC5cblx0ICogQG1ldGhvZFxuXHQgKiBAbmFtZSBDb21tYW5kI3JlbG9hZFxuXHQgKiBAcmV0dXJucyB7Q29tbWFuZH1cblx0ICovXG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIGNvbW1hbmQuXG5cdCAqIEBtZXRob2Rcblx0ICogQG5hbWUgQ29tbWFuZCNyZW1vdmVcblx0ICogQHJldHVybnMge0NvbW1hbmR9XG5cdCAqL1xufVxuXG4vKipcbiAqIE9wdGlvbnMgdG8gdXNlIGZvciBjb21tYW5kIGV4ZWN1dGlvbiBiZWhhdmlvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kT3B0aW9ucyBleHRlbmRzIEFrYWlyb01vZHVsZU9wdGlvbnMge1xuXHQvKipcblx0ICogQ29tbWFuZCBuYW1lcy5cblx0ICovXG5cdGFsaWFzZXM/OiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogQXJndW1lbnQgb3B0aW9ucyBvciBnZW5lcmF0b3IuXG5cdCAqL1xuXHRhcmdzPzogQXJndW1lbnRPcHRpb25zW10gfCBBcmd1bWVudEdlbmVyYXRvcjtcblxuXHQvKipcblx0ICogVGhlIGRlZmF1bHQgYXJndW1lbnQgb3B0aW9ucy5cblx0ICovXG5cdGFyZ3VtZW50RGVmYXVsdHM/OiBEZWZhdWx0QXJndW1lbnRPcHRpb25zO1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBydW4gYmVmb3JlIGFyZ3VtZW50IHBhcnNpbmcgYW5kIGV4ZWN1dGlvbi5cblx0ICovXG5cdGJlZm9yZT86IEJlZm9yZUFjdGlvbjtcblxuXHQvKipcblx0ICogUmVzdHJpY3RzIGNoYW5uZWwgdG8gZWl0aGVyICdndWlsZCcgb3IgJ2RtJy5cblx0ICovXG5cdGNoYW5uZWw/OiBcImd1aWxkXCIgfCBcImRtXCI7XG5cblx0LyoqXG5cdCAqIFBlcm1pc3Npb25zIHJlcXVpcmVkIGJ5IHRoZSBjbGllbnQgdG8gcnVuIHRoaXMgY29tbWFuZC5cblx0ICovXG5cdGNsaWVudFBlcm1pc3Npb25zPzpcblx0XHR8IFBlcm1pc3Npb25SZXNvbHZhYmxlXG5cdFx0fCBQZXJtaXNzaW9uUmVzb2x2YWJsZVtdXG5cdFx0fCBNaXNzaW5nUGVybWlzc2lvblN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBydW4gb24gbWVzc2FnZXMgdGhhdCBhcmUgbm90IGRpcmVjdGx5IGNvbW1hbmRzLlxuXHQgKi9cblx0Y29uZGl0aW9uPzogRXhlY3V0aW9uUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBjb29sZG93biBpbiBtaWxsaXNlY29uZHMuXG5cdCAqL1xuXHRjb29sZG93bj86IG51bWJlcjtcblxuXHQvKipcblx0ICogRGVzY3JpcHRpb24gb2YgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRkZXNjcmlwdGlvbj86IHN0cmluZyB8IGFueSB8IGFueVtdO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBtZXNzYWdlIGVkaXRzIHdpbGwgcnVuIHRoaXMgY29tbWFuZC5cblx0ICovXG5cdGVkaXRhYmxlPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogRmxhZ3MgdG8gdXNlIHdoZW4gdXNpbmcgYW4gQXJndW1lbnRHZW5lcmF0b3Jcblx0ICovXG5cdGZsYWdzPzogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGNvb2xkb3duIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLlxuXHQgKi9cblx0aWdub3JlQ29vbGRvd24/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBgdXNlclBlcm1pc3Npb25zYCBjaGVja3Mgb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuXG5cdCAqL1xuXHRpZ25vcmVQZXJtaXNzaW9ucz86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIFRoZSBrZXkgdHlwZSBvciBrZXkgZ2VuZXJhdG9yIGZvciB0aGUgbG9ja2VyLiBJZiBsb2NrIGlzIGEgc3RyaW5nLCBpdCdzIGV4cGVjdGVkIG9uZSBvZiAnZ3VpbGQnLCAnY2hhbm5lbCcsIG9yICd1c2VyJ1xuXHQgKi9cblx0bG9jaz86IEtleVN1cHBsaWVyIHwgXCJndWlsZFwiIHwgXCJjaGFubmVsXCIgfCBcInVzZXJcIjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gb25seSBhbGxvdyB0aGUgY29tbWFuZCB0byBiZSBydW4gaW4gTlNGVyBjaGFubmVscy5cblx0ICovXG5cdG9ubHlOc2Z3PzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogT3B0aW9uIGZsYWdzIHRvIHVzZSB3aGVuIHVzaW5nIGFuIEFyZ3VtZW50R2VuZXJhdG9yLlxuXHQgKi9cblx0b3B0aW9uRmxhZ3M/OiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYWxsb3cgY2xpZW50IG93bmVyKHMpIG9ubHkuXG5cdCAqL1xuXHRvd25lck9ubHk/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgcHJlZml4KGVzKSB0byBvdmVyd3JpdGUgdGhlIGdsb2JhbCBvbmUgZm9yIHRoaXMgY29tbWFuZC5cblx0ICovXG5cdHByZWZpeD86IHN0cmluZyB8IHN0cmluZ1tdIHwgUHJlZml4U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGNvbnNpZGVyIHF1b3Rlcy5cblx0ICovXG5cdHF1b3RlZD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFtb3VudCBvZiBjb21tYW5kIHVzZXMgYWxsb3dlZCB1bnRpbCBjb29sZG93bi5cblx0ICovXG5cdHJhdGVsaW1pdD86IG51bWJlcjtcblxuXHQvKipcblx0ICogQSByZWdleCB0byBtYXRjaCBpbiBtZXNzYWdlcyB0aGF0IGFyZSBub3QgZGlyZWN0bHkgY29tbWFuZHMuIFRoZSBhcmdzIG9iamVjdCB3aWxsIGhhdmUgYG1hdGNoYCBhbmQgYG1hdGNoZXNgIHByb3BlcnRpZXMuXG5cdCAqL1xuXHRyZWdleD86IFJlZ0V4cCB8IFJlZ2V4U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIEN1c3RvbSBzZXBhcmF0b3IgZm9yIGFyZ3VtZW50IGlucHV0LlxuXHQgKi9cblx0c2VwYXJhdG9yPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBNYXJrIGNvbW1hbmQgYXMgc2xhc2ggY29tbWFuZCBhbmQgc2V0IGluZm9ybWF0aW9uLlxuXHQgKi9cblx0c2xhc2g/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHNsYXNoIGNvbW1hbmQgcmVzcG9uc2VzIGZvciB0aGlzIGNvbW1hbmQgc2hvdWxkIGJlIGVwaGVtZXJhbCBvciBub3QuXG5cdCAqL1xuXHRzbGFzaEVwaGVtZXJhbD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFzc2lnbiBzbGFzaCBjb21tYW5kcyB0byBTcGVjaWZpYyBndWlsZHMuIFRoaXMgb3B0aW9uIHdpbGwgbWFrZSB0aGUgY29tbWFuZHMgZG8gbm90IHJlZ2lzdGVyIGdsb2JhbGx5LCBidXQgb25seSB0byB0aGUgY2hvc2VuIHNlcnZlcnMuXG5cdCAqL1xuXHRzbGFzaEd1aWxkcz86IHN0cmluZ1tdO1xuXG5cdC8qKlxuXHQgKiBPcHRpb25zIGZvciB1c2luZyB0aGUgc2xhc2ggY29tbWFuZC5cblx0ICovXG5cdHNsYXNoT3B0aW9ucz86IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkRhdGFbXTtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYWxsb3cgY2xpZW50IHN1cGVyVXNlcnMocykgb25seS5cblx0ICovXG5cdHN1cGVyVXNlck9ubHk/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byB0eXBlIGluIGNoYW5uZWwgZHVyaW5nIGV4ZWN1dGlvbi5cblx0ICovXG5cdHR5cGluZz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFBlcm1pc3Npb25zIHJlcXVpcmVkIGJ5IHRoZSB1c2VyIHRvIHJ1biB0aGlzIGNvbW1hbmQuXG5cdCAqL1xuXHR1c2VyUGVybWlzc2lvbnM/OlxuXHRcdHwgUGVybWlzc2lvblJlc29sdmFibGVcblx0XHR8IFBlcm1pc3Npb25SZXNvbHZhYmxlW11cblx0XHR8IE1pc3NpbmdQZXJtaXNzaW9uU3VwcGxpZXI7XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0byBydW4gYmVmb3JlIGFyZ3VtZW50IHBhcnNpbmcgYW5kIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqL1xuZXhwb3J0IHR5cGUgQmVmb3JlQWN0aW9uID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IGFueTtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHVzZWQgdG8gc3VwcGx5IHRoZSBrZXkgZm9yIHRoZSBsb2NrZXIuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gYXJncyAtIEV2YWx1YXRlZCBhcmd1bWVudHMuXG4gKi9cbmV4cG9ydCB0eXBlIEtleVN1cHBsaWVyID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIGFyZ3M6IGFueSkgPT4gc3RyaW5nO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdXNlZCB0byBjaGVjayBpZiB0aGUgY29tbWFuZCBzaG91bGQgcnVuIGFyYml0cmFyaWx5LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGNoZWNrLlxuICovXG5leHBvcnQgdHlwZSBFeGVjdXRpb25QcmVkaWNhdGUgPSAobWVzc2FnZTogTWVzc2FnZSkgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHVzZWQgdG8gY2hlY2sgaWYgYSBtZXNzYWdlIGhhcyBwZXJtaXNzaW9ucyBmb3IgdGhlIGNvbW1hbmQuXG4gKiBBIG5vbi1udWxsIHJldHVybiB2YWx1ZSBzaWduaWZpZXMgdGhlIHJlYXNvbiBmb3IgbWlzc2luZyBwZXJtaXNzaW9ucy5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqL1xuZXhwb3J0IHR5cGUgTWlzc2luZ1Blcm1pc3Npb25TdXBwbGllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZVxuKSA9PiBQcm9taXNlPGFueT4gfCBhbnk7XG5cbi8qKlxuICogQSBmdW5jdGlvbiB1c2VkIHRvIHJldHVybiBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBnZXQgcmVnZXggZm9yLlxuICovXG5leHBvcnQgdHlwZSBSZWdleFN1cHBsaWVyID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IFJlZ0V4cDtcblxuLyoqXG4gKiBHZW5lcmF0b3IgZm9yIGFyZ3VtZW50cy5cbiAqIFdoZW4geWllbGRpbmcgYXJndW1lbnQgb3B0aW9ucywgdGhhdCBhcmd1bWVudCBpcyByYW4gYW5kIHRoZSByZXN1bHQgb2YgdGhlIHByb2Nlc3NpbmcgaXMgZ2l2ZW4uXG4gKiBUaGUgbGFzdCB2YWx1ZSB3aGVuIHRoZSBnZW5lcmF0b3IgaXMgZG9uZSBpcyB0aGUgcmVzdWx0aW5nIGBhcmdzYCBmb3IgdGhlIGNvbW1hbmQncyBgZXhlY2AuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGNvbnRlbnQuXG4gKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBwcm9jZXNzaW5nIHN0YXRlLlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudEdlbmVyYXRvciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZVxuKSA9PiBJdGVyYWJsZUl0ZXJhdG9yPEFyZ3VtZW50T3B0aW9ucyB8IEZsYWc+O1xuIl19