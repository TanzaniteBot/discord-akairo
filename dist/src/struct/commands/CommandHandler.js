"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lodash_1 = __importDefault(require("lodash"));
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoMessage_1 = __importDefault(require("../../util/AkairoMessage"));
const Constants_1 = require("../../util/Constants");
const Util_1 = __importDefault(require("../../util/Util"));
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const ContextMenuCommandHandler_1 = __importDefault(require("../contextMenuCommands/ContextMenuCommandHandler"));
const TypeResolver_1 = __importDefault(require("./arguments/TypeResolver"));
const Command_1 = __importDefault(require("./Command"));
const CommandUtil_1 = __importDefault(require("./CommandUtil"));
const Flag_1 = __importDefault(require("./Flag"));
/**
 * Loads commands and handles messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
class CommandHandler extends AkairoHandler_1.default {
    constructor(client, { directory, classToHandle = Command_1.default, extensions = [".js", ".ts"], automateCategories, loadFilter, blockClient = true, blockBots = true, fetchMembers = false, handleEdits = false, storeMessages = false, commandUtil, commandUtilLifetime = 3e5, commandUtilSweepInterval = 3e5, defaultCooldown = 0, ignoreCooldown = client.ownerID, ignorePermissions = [], argumentDefaults = {}, prefix = "!", allowMention = true, aliasReplacement, autoDefer = false, typing = false, autoRegisterSlashCommands = false, execSlash = false, skipBuiltInPostInhibitors = false } = {}) {
        if (!(classToHandle.prototype instanceof Command_1.default || classToHandle === Command_1.default)) {
            throw new AkairoError_1.default("INVALID_CLASS_TO_HANDLE", classToHandle.name, Command_1.default.name);
        }
        super(client, {
            directory,
            classToHandle,
            extensions,
            automateCategories,
            loadFilter
        });
        this.autoRegisterSlashCommands = autoRegisterSlashCommands;
        this.typing = typing;
        this.autoDefer = autoDefer;
        this.resolver = new TypeResolver_1.default(this);
        this.aliases = new discord_js_1.Collection();
        this.aliasReplacement = aliasReplacement;
        this.prefixes = new discord_js_1.Collection();
        this.blockClient = !!blockClient;
        this.blockBots = !!blockBots;
        this.fetchMembers = !!fetchMembers;
        this.handleEdits = !!handleEdits;
        this.storeMessages = !!storeMessages;
        this.commandUtil = !!commandUtil;
        if ((this.handleEdits || this.storeMessages) && !this.commandUtil) {
            throw new AkairoError_1.default("COMMAND_UTIL_EXPLICIT");
        }
        this.commandUtilLifetime = commandUtilLifetime;
        this.commandUtilSweepInterval = commandUtilSweepInterval;
        if (this.commandUtilSweepInterval > 0) {
            setInterval(() => this.sweepCommandUtil(), this.commandUtilSweepInterval).unref();
        }
        this.commandUtils = new discord_js_1.Collection();
        this.cooldowns = new discord_js_1.Collection();
        this.defaultCooldown = defaultCooldown;
        this.ignoreCooldown = typeof ignoreCooldown === "function" ? ignoreCooldown.bind(this) : ignoreCooldown;
        this.ignorePermissions = typeof ignorePermissions === "function" ? ignorePermissions.bind(this) : ignorePermissions;
        this.prompts = new discord_js_1.Collection();
        this.argumentDefaults = Util_1.default.deepAssign({
            prompt: {
                start: "",
                retry: "",
                timeout: "",
                ended: "",
                cancel: "",
                retries: 1,
                time: 30000,
                cancelWord: "cancel",
                stopWord: "stop",
                optional: false,
                infinite: false,
                limit: Infinity,
                breakout: true
            }
        }, argumentDefaults);
        this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;
        this.allowMention = typeof allowMention === "function" ? allowMention.bind(this) : !!allowMention;
        this.inhibitorHandler = null;
        this.autoDefer = !!autoDefer;
        this.execSlash = !!execSlash;
        this.skipBuiltInPostInhibitors = !!skipBuiltInPostInhibitors;
        this.setup();
    }
    /**
     * Collection of command aliases.
     */
    aliases;
    /**
     * Regular expression to automatically make command aliases for.
     */
    aliasReplacement;
    /**
     * Whether or not mentions are allowed for prefixing.
     */
    allowMention;
    /**
     * Default argument options.
     */
    argumentDefaults;
    /**
     * Automatically defer messages "BotName is thinking".
     */
    autoDefer;
    /**
     * Specify whether to register all slash commands when starting the client
     */
    autoRegisterSlashCommands;
    /**
     * Whether or not to block bots.
     */
    blockBots;
    /**
     * Whether or not to block self.
     */
    blockClient;
    /**
     * Whether or not `message.util` is assigned.
     */
    commandUtil;
    /**
     * Milliseconds a message should exist for before its command util instance is marked for removal.
     */
    commandUtilLifetime;
    /**
     * Collection of CommandUtils.
     */
    commandUtils;
    /**
     * Time interval in milliseconds for sweeping command util instances.
     */
    commandUtilSweepInterval;
    /**
     * Collection of cooldowns.
     * <info>The elements in the collection are objects with user IDs as keys
     * and {@link CooldownData} objects as values</info>
     */
    cooldowns;
    /**
     * Default cooldown for commands.
     */
    defaultCooldown;
    /**
     * Whether or not to use execSlash for slash commands.
     */
    execSlash;
    /**
     * Whether or not members are fetched on each message author from a guild.
     */
    fetchMembers;
    /**
     * Whether or not edits are handled.
     */
    handleEdits;
    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    ignoreCooldown;
    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    ignorePermissions;
    /**
     * Inhibitor handler to use.
     */
    inhibitorHandler;
    /**
     * The prefix(es) for command parsing.
     */
    prefix;
    /**
     * Collection of prefix overwrites to commands.
     */
    prefixes;
    /**
     * Collection of sets of ongoing argument prompts.
     */
    prompts;
    /**
     * The type resolver.
     */
    resolver;
    /**
     * Whether or not to store messages in CommandUtil.
     */
    storeMessages;
    /**
     * Show "BotName is typing" information message on the text channels when a command is running.
     */
    typing;
    /**
     * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
     */
    skipBuiltInPostInhibitors;
    setup() {
        this.client.once("ready", () => {
            if (this.autoRegisterSlashCommands)
                this.registerInteractionCommands().then(() => this.updateInteractionPermissions(this.client.ownerID, this.client.superUserID));
            this.client.on("messageCreate", async (m) => {
                if (m.partial)
                    await m.fetch();
                this.handle(m);
            });
            if (this.handleEdits) {
                this.client.on("messageUpdate", async (o, m) => {
                    if (o.partial)
                        await o.fetch();
                    if (m.partial)
                        await m.fetch();
                    if (o.content === m.content)
                        return;
                    if (this.handleEdits)
                        this.handle(m);
                });
            }
            this.client.on("interactionCreate", i => {
                if (!i.isCommand())
                    return;
                this.handleSlash(i);
            });
        });
    }
    async registerInteractionCommands() {
        const parsedSlashCommands = [];
        const guildSlashCommandsParsed = new discord_js_1.Collection();
        const parseDescriptionCommand = description => {
            if (typeof description === "object") {
                if (typeof description.content === "function")
                    return description.content();
                if (typeof description.content === "string")
                    return description.content;
            }
            return description;
        };
        for (const [, data] of this.modules) {
            if (!data.slash)
                continue;
            parsedSlashCommands.push({
                name: data.aliases[0],
                description: parseDescriptionCommand(data.description),
                options: data.slashOptions,
                guilds: data.slashGuilds ?? [],
                defaultPermission: !(data.ownerOnly || data.superUserOnly || false),
                type: "CHAT_INPUT"
            });
        }
        let contextCommandHandler;
        for (const key in this.client) {
            if (this.client[key] instanceof ContextMenuCommandHandler_1.default) {
                contextCommandHandler = this.client[key];
                break;
            }
        }
        if (contextCommandHandler) {
            for (const [, data] of contextCommandHandler.modules) {
                parsedSlashCommands.push({
                    name: data.name,
                    guilds: data.guilds ?? [],
                    defaultPermission: !(data.ownerOnly || data.superUserOnly || false),
                    type: data.type
                });
            }
        }
        /* Global */
        const slashCommandsApp = parsedSlashCommands
            .filter(({ guilds }) => !guilds.length)
            .map(({ name, description, options, defaultPermission, type }) => {
            return { name, description, options, defaultPermission, type };
        });
        const currentGlobalCommands = (await this.client.application?.commands.fetch()).map(value1 => ({
            name: value1.name,
            description: value1.description,
            options: value1.options,
            defaultPermission: value1.defaultPermission,
            type: value1.type
        }));
        if (!lodash_1.default.isEqual(currentGlobalCommands, slashCommandsApp)) {
            await this.client.application?.commands.set(slashCommandsApp);
        }
        /* Guilds */
        for (const { name, description, options, guilds, defaultPermission, type } of parsedSlashCommands) {
            for (const guildId of guilds) {
                guildSlashCommandsParsed.set(guildId, [
                    ...(guildSlashCommandsParsed.get(guildId) ?? []),
                    { name, description, options, defaultPermission, type }
                ]);
            }
        }
        if (guildSlashCommandsParsed.size) {
            guildSlashCommandsParsed.each(async (value, key) => {
                const guild = this.client.guilds.cache.get(key);
                if (!guild)
                    return;
                const currentGuildCommands = (await guild.commands.fetch()).map(value1 => ({
                    name: value1.name,
                    description: value1.description,
                    options: value1.options,
                    defaultPermission: value1.defaultPermission,
                    type: value1.type
                }));
                if (!lodash_1.default.isEqual(currentGuildCommands, value)) {
                    await guild.commands.set(value);
                }
            });
        }
    }
    async updateInteractionPermissions(owners, superUsers) {
        const mapCom = (value) => {
            const command = this.modules.find(mod => mod.aliases[0] === value.name);
            let allowedUsers = [];
            if (command.superUserOnly)
                allowedUsers.push(...Util_1.default.intoArray(superUsers));
            if (command.ownerOnly)
                allowedUsers.push(...Util_1.default.intoArray(owners));
            allowedUsers = [...new Set(allowedUsers)]; // remove duplicates
            return {
                id: value.id,
                permissions: allowedUsers.map(u => ({
                    id: u,
                    type: "USER",
                    permission: true
                }))
            };
        };
        const globalCommands = await this.client.application?.commands.fetch();
        const fullPermissions = globalCommands
            .filter(value => !value.defaultPermission)
            .map(value => mapCom(value));
        const promises = this.client.guilds.cache.map(guild => {
            const perms = fullPermissions;
            if (guild.commands.cache.size)
                perms.push(...guild.commands.cache.filter(value => !value.defaultPermission).map(value => mapCom(value)));
            if (guild.available)
                return guild.commands.permissions.set({
                    fullPermissions: perms
                });
            // Return empty promise if guild is unavailable
            return Promise.resolve();
        });
        // @ts-expect-error: it still works shush
        await Promise.all(promises);
    }
    /**
     * Registers a module.
     * @param command - Module to use.
     * @param filepath - Filepath of module.
     */
    register(command, filepath) {
        super.register(command, filepath);
        for (let alias of command.aliases) {
            const conflict = this.aliases.get(alias.toLowerCase());
            if (conflict)
                throw new AkairoError_1.default("ALIAS_CONFLICT", alias, command.id, conflict);
            alias = alias.toLowerCase();
            this.aliases.set(alias, command.id);
            if (this.aliasReplacement) {
                const replacement = alias.replace(this.aliasReplacement, "");
                if (replacement !== alias) {
                    const replacementConflict = this.aliases.get(replacement);
                    if (replacementConflict)
                        throw new AkairoError_1.default("ALIAS_CONFLICT", replacement, command.id, replacementConflict);
                    this.aliases.set(replacement, command.id);
                }
            }
        }
        if (command.prefix != null) {
            let newEntry = false;
            if (Array.isArray(command.prefix)) {
                for (const prefix of command.prefix) {
                    const prefixes = this.prefixes.get(prefix);
                    if (prefixes) {
                        prefixes.add(command.id);
                    }
                    else {
                        this.prefixes.set(prefix, new Set([command.id]));
                        newEntry = true;
                    }
                }
            }
            else {
                const prefixes = this.prefixes.get(command.prefix);
                if (prefixes) {
                    prefixes.add(command.id);
                }
                else {
                    this.prefixes.set(command.prefix, new Set([command.id]));
                    newEntry = true;
                }
            }
            if (newEntry) {
                this.prefixes = this.prefixes.sort((aVal, bVal, aKey, bKey) => Util_1.default.prefixCompare(aKey, bKey));
            }
        }
    }
    /**
     * Deregisters a module.
     * @param command - Module to use.
     */
    deregister(command) {
        for (let alias of command.aliases) {
            alias = alias.toLowerCase();
            this.aliases.delete(alias);
            if (this.aliasReplacement) {
                const replacement = alias.replace(this.aliasReplacement, "");
                if (replacement !== alias)
                    this.aliases.delete(replacement);
            }
        }
        if (command.prefix != null) {
            if (Array.isArray(command.prefix)) {
                for (const prefix of command.prefix) {
                    const prefixes = this.prefixes.get(prefix);
                    if (prefixes?.size === 1) {
                        this.prefixes.delete(prefix);
                    }
                    else {
                        prefixes?.delete(prefix);
                    }
                }
            }
            else {
                const prefixes = this.prefixes.get(command.prefix);
                if (prefixes?.size === 1) {
                    this.prefixes.delete(command.prefix);
                }
                else {
                    // @ts-expect-error
                    prefixes.delete(command.prefix);
                }
            }
        }
        super.deregister(command);
    }
    /**
     * Handles a message.
     * @param message - Message to handle.
     */
    async handle(message) {
        try {
            if (this.fetchMembers && message.guild && !message.member && !message.webhookId) {
                await message.guild.members.fetch(message.author);
            }
            if (await this.runAllTypeInhibitors(message)) {
                return false;
            }
            if (this.commandUtil) {
                if (this.commandUtils.has(message.id)) {
                    // @ts-expect-error
                    message.util = this.commandUtils.get(message.id);
                }
                else {
                    // @ts-expect-error
                    message.util = new CommandUtil_1.default(this, message); // @ts-expect-error
                    this.commandUtils.set(message.id, message.util);
                }
            }
            if (await this.runPreTypeInhibitors(message)) {
                return false;
            }
            let parsed = await this.parseCommand(message);
            if (!parsed.command) {
                const overParsed = await this.parseCommandOverwrittenPrefixes(message);
                if (overParsed.command || (parsed.prefix == null && overParsed.prefix != null)) {
                    parsed = overParsed;
                }
            }
            if (this.commandUtil) {
                // @ts-expect-error
                message.util.parsed = parsed;
            }
            let ran;
            if (!parsed.command) {
                ran = await this.handleRegexAndConditionalCommands(message);
            }
            else {
                ran = await this.handleDirectCommand(message, parsed.content, parsed.command);
            }
            if (ran === false) {
                this.emit(Constants_1.CommandHandlerEvents.MESSAGE_INVALID, message);
                return false;
            }
            return ran;
        }
        catch (err) {
            this.emitError(err, message);
            return null;
        }
    }
    /**
     * Handles a slash command.
     * @param interaction - Interaction to handle.
     */
    // eslint-disable-next-line complexity
    async handleSlash(interaction) {
        const command = this.findCommand(interaction.commandName);
        if (!command) {
            this.emit(Constants_1.CommandHandlerEvents.SLASH_NOT_FOUND, interaction);
            return false;
        }
        const message = new AkairoMessage_1.default(this.client, interaction, command);
        try {
            if (this.fetchMembers && message.guild && !message.member) {
                await message.guild.members.fetch(message.author);
            }
            if (await this.runAllTypeInhibitors(message, true)) {
                return false;
            }
            if (this.commandUtil) {
                if (this.commandUtils.has(message.id)) {
                    message.util = this.commandUtils.get(message.id);
                }
                else {
                    message.util = new CommandUtil_1.default(this, message);
                    this.commandUtils.set(message.id, message.util);
                }
            }
            if (await this.runPreTypeInhibitors(message)) {
                return false;
            }
            let parsed = await this.parseCommand(message);
            if (!parsed.command) {
                const overParsed = await this.parseCommandOverwrittenPrefixes(message);
                if (overParsed.command || (parsed.prefix == null && overParsed.prefix != null)) {
                    parsed = overParsed;
                }
            }
            if (this.commandUtil) {
                message.util.parsed = parsed;
            }
            if (await this.runPostTypeInhibitors(message, command)) {
                return false;
            }
            const convertedOptions = {};
            for (const option of command.slashOptions) {
                convertedOptions[option.name] = interaction.options.get(option.name, option.required || false)?.value;
            }
            let key;
            try {
                // @ts-expect-error
                if (command.lock)
                    key = command.lock(message, convertedOptions);
                if (Util_1.default.isPromise(key))
                    key = await key;
                if (key) {
                    if (command.locker?.has(key)) {
                        key = null;
                        this.emit(Constants_1.CommandHandlerEvents.COMMAND_LOCKED, message, command);
                        return true;
                    }
                    command.locker?.add(key);
                }
            }
            catch (err) {
                this.emitError(err, message, command);
            }
            finally {
                if (key)
                    command.locker?.delete(key);
            }
            if (this.autoDefer || command.slashEphemeral) {
                await interaction.deferReply({ ephemeral: command.slashEphemeral });
            }
            try {
                this.emit(Constants_1.CommandHandlerEvents.SLASH_STARTED, message, command, convertedOptions);
                const ret = Reflect.ownKeys(command).includes("execSlash") || this.execSlash
                    ? await command.execSlash(message, convertedOptions)
                    : await command.exec(message, convertedOptions);
                this.emit(Constants_1.CommandHandlerEvents.SLASH_FINISHED, message, command, convertedOptions, ret);
                return true;
            }
            catch (err) {
                this.emit(Constants_1.CommandHandlerEvents.SLASH_ERROR, err, message, command);
                return false;
            }
        }
        catch (err) {
            this.emitError(err, message, command);
            return null;
        }
    }
    /**
     * Handles normal commands.
     * @param message - Message to handle.
     * @param content - Content of message without command.
     * @param command - Command instance.
     * @param ignore - Ignore inhibitors and other checks.
     */
    async handleDirectCommand(message, content, command, ignore = false) {
        let key;
        try {
            if (!ignore) {
                if (message.editedTimestamp && !command.editable)
                    return false;
                if (await this.runPostTypeInhibitors(message, command))
                    return false;
            }
            const before = command.before(message);
            if (Util_1.default.isPromise(before))
                await before;
            const args = await command.parse(message, content);
            if (Flag_1.default.is(args, "cancel")) {
                this.emit(Constants_1.CommandHandlerEvents.COMMAND_CANCELLED, message, command);
                return true;
            }
            else if (Flag_1.default.is(args, "retry")) {
                this.emit(Constants_1.CommandHandlerEvents.COMMAND_BREAKOUT, message, command, args.message);
                return this.handle(args.message);
            }
            else if (Flag_1.default.is(args, "continue")) {
                const continueCommand = this.modules.get(args.command);
                return this.handleDirectCommand(message, args.rest, continueCommand, args.ignore);
            }
            if (!ignore) {
                if (command.lock)
                    key = command.lock(message, args);
                if (Util_1.default.isPromise(key))
                    key = await key;
                if (key) {
                    if (command.locker?.has(key)) {
                        key = null;
                        this.emit(Constants_1.CommandHandlerEvents.COMMAND_LOCKED, message, command);
                        return true;
                    }
                    command.locker?.add(key);
                }
            }
            await this.runCommand(message, command, args);
            return true;
        }
        catch (err) {
            this.emitError(err, message, command);
            return null;
        }
        finally {
            if (key)
                command.locker?.delete(key);
        }
    }
    /**
     * Handles regex and conditional commands.
     * @param message - Message to handle.
     */
    async handleRegexAndConditionalCommands(message) {
        const ran1 = await this.handleRegexCommands(message);
        const ran2 = await this.handleConditionalCommands(message);
        return ran1 || ran2;
    }
    /**
     * Handles regex commands.
     * @param message - Message to handle.
     */
    async handleRegexCommands(message) {
        const hasRegexCommands = [];
        for (const command of this.modules.values()) {
            if (message.editedTimestamp ? command.editable : true) {
                const regex = typeof command.regex === "function" ? command.regex(message) : command.regex;
                if (regex)
                    hasRegexCommands.push({ command, regex });
            }
        }
        const matchedCommands = [];
        for (const entry of hasRegexCommands) {
            const match = message.content.match(entry.regex);
            if (!match)
                continue;
            const matches = [];
            if (entry.regex.global) {
                let matched;
                while ((matched = entry.regex.exec(message.content)) != null) {
                    matches.push(matched);
                }
            }
            matchedCommands.push({ command: entry.command, match, matches });
        }
        if (!matchedCommands.length) {
            return false;
        }
        const promises = [];
        for (const { command, match, matches } of matchedCommands) {
            promises.push((async () => {
                try {
                    if (await this.runPostTypeInhibitors(message, command))
                        return;
                    const before = command.before(message);
                    if (Util_1.default.isPromise(before))
                        await before;
                    await this.runCommand(message, command, { match, matches });
                }
                catch (err) {
                    this.emitError(err, message, command);
                }
            })());
        }
        await Promise.all(promises);
        return true;
    }
    /**
     * Handles conditional commands.
     * @param message - Message to handle.
     */
    async handleConditionalCommands(message) {
        const trueCommands = [];
        const filterPromises = [];
        for (const command of this.modules.values()) {
            if (message.editedTimestamp && !command.editable)
                continue;
            filterPromises.push((async () => {
                let cond = command.condition(message);
                if (Util_1.default.isPromise(cond))
                    cond = await cond;
                if (cond)
                    trueCommands.push(command);
            })());
        }
        await Promise.all(filterPromises);
        if (!trueCommands.length) {
            return false;
        }
        const promises = [];
        for (const command of trueCommands) {
            promises.push((async () => {
                try {
                    if (await this.runPostTypeInhibitors(message, command))
                        return;
                    const before = command.before(message);
                    if (Util_1.default.isPromise(before))
                        await before;
                    await this.runCommand(message, command, {});
                }
                catch (err) {
                    this.emitError(err, message, command);
                }
            })());
        }
        await Promise.all(promises);
        return true;
    }
    /**
     * Runs inhibitors with the all type.
     * @param message - Message to handle.
     * @param slash - Whether or not the command should is a slash command.
     */
    async runAllTypeInhibitors(message, slash = false) {
        const reason = this.inhibitorHandler ? await this.inhibitorHandler.test("all", message) : null;
        if (reason != null) {
            this.emit(Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        }
        else if (!message.author) {
            this.emit(Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED, message, Constants_1.BuiltInReasons.AUTHOR_NOT_FOUND);
        }
        else if (this.blockClient && message.author.id === this.client.user?.id) {
            this.emit(Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED, message, Constants_1.BuiltInReasons.CLIENT);
        }
        else if (this.blockBots && message.author.bot) {
            this.emit(Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED, message, Constants_1.BuiltInReasons.BOT);
        }
        else if (!slash && this.hasPrompt(message.channel, message.author)) {
            this.emit(Constants_1.CommandHandlerEvents.IN_PROMPT, message);
        }
        else {
            return false;
        }
        return true;
    }
    /**
     * Runs inhibitors with the pre type.
     * @param message - Message to handle.
     */
    async runPreTypeInhibitors(message) {
        const reason = this.inhibitorHandler ? await this.inhibitorHandler.test("pre", message) : null;
        if (reason != null) {
            this.emit(Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
        }
        else {
            return false;
        }
        return true;
    }
    /**
     * Runs inhibitors with the post type.
     * @param message - Message to handle.
     * @param command - Command to handle.
     * @param slash - Whether or not the command should is a slash command.
     */
    async runPostTypeInhibitors(message, command, slash = false) {
        const event = slash ? Constants_1.CommandHandlerEvents.SLASH_BLOCKED : Constants_1.CommandHandlerEvents.COMMAND_BLOCKED;
        if (!this.skipBuiltInPostInhibitors) {
            if (command.ownerOnly) {
                const isOwner = this.client.isOwner(message.author);
                if (!isOwner) {
                    this.emit(event, message, command, Constants_1.BuiltInReasons.OWNER);
                    return true;
                }
            }
            if (command.superUserOnly) {
                const isSuperUser = this.client.isSuperUser(message.author);
                if (!isSuperUser) {
                    this.emit(event, message, command, Constants_1.BuiltInReasons.SUPER_USER);
                    return true;
                }
            }
            if (command.channel === "guild" && !message.guild) {
                this.emit(event, message, command, Constants_1.BuiltInReasons.GUILD);
                return true;
            }
            if (command.channel === "dm" && message.guild) {
                this.emit(event, message, command, Constants_1.BuiltInReasons.DM);
                return true;
            }
            if (command.onlyNsfw && !message.channel["nsfw"]) {
                this.emit(event, message, command, Constants_1.BuiltInReasons.NOT_NSFW);
                return true;
            }
        }
        if (!this.skipBuiltInPostInhibitors) {
            if (await this.runPermissionChecks(message, command, slash)) {
                return true;
            }
        }
        const reason = this.inhibitorHandler ? await this.inhibitorHandler.test("post", message, command) : null;
        if (this.skipBuiltInPostInhibitors) {
            if (await this.runPermissionChecks(message, command, slash)) {
                return true;
            }
        }
        if (reason != null) {
            this.emit(event, message, command, reason);
            return true;
        }
        if (this.runCooldowns(message, command)) {
            return true;
        }
        return false;
    }
    /**
     * Runs permission checks.
     * @param message - Message that called the command.
     * @param command - Command to cooldown.
     * @param slash - Whether or not the command is a slash command.
     */
    async runPermissionChecks(message, command, slash = false) {
        if (command.clientPermissions) {
            if (typeof command.clientPermissions === "function") {
                // @ts-expect-error
                let missing = command.clientPermissions(message);
                if (Util_1.default.isPromise(missing))
                    missing = await missing;
                if (missing != null) {
                    this.emit(slash ? Constants_1.CommandHandlerEvents.SLASH_MISSING_PERMISSIONS : Constants_1.CommandHandlerEvents.MISSING_PERMISSIONS, message, command, "client", missing);
                    return true;
                }
            }
            else if (message.guild) {
                if (message.channel?.type === "DM")
                    return false;
                const missing = message.channel?.permissionsFor(message.guild.me)?.missing(command.clientPermissions);
                if (missing?.length) {
                    this.emit(slash ? Constants_1.CommandHandlerEvents.SLASH_MISSING_PERMISSIONS : Constants_1.CommandHandlerEvents.MISSING_PERMISSIONS, message, command, "client", missing);
                    return true;
                }
            }
        }
        if (command.userPermissions) {
            const ignorer = command.ignorePermissions || this.ignorePermissions;
            const isIgnored = Array.isArray(ignorer)
                ? ignorer.includes(message.author.id)
                : typeof ignorer === "function"
                    ? ignorer(message, command)
                    : message.author.id === ignorer;
            if (!isIgnored) {
                if (typeof command.userPermissions === "function") {
                    // @ts-expect-error
                    let missing = command.userPermissions(message);
                    if (Util_1.default.isPromise(missing))
                        missing = await missing;
                    if (missing != null) {
                        this.emit(slash ? Constants_1.CommandHandlerEvents.SLASH_MISSING_PERMISSIONS : Constants_1.CommandHandlerEvents.MISSING_PERMISSIONS, message, command, "user", missing);
                        return true;
                    }
                }
                else if (message.guild) {
                    if (message.channel?.type === "DM")
                        return false;
                    const missing = message.channel?.permissionsFor(message.author)?.missing(command.userPermissions);
                    if (missing?.length) {
                        this.emit(slash ? Constants_1.CommandHandlerEvents.SLASH_MISSING_PERMISSIONS : Constants_1.CommandHandlerEvents.MISSING_PERMISSIONS, message, command, "user", missing);
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
     * Runs cooldowns and checks if a user is under cooldown.
     * @param message - Message that called the command.
     * @param command - Command to cooldown.
     */
    runCooldowns(message, command) {
        const id = message.author?.id;
        const ignorer = command.ignoreCooldown || this.ignoreCooldown;
        const isIgnored = Array.isArray(ignorer)
            ? ignorer.includes(id)
            : typeof ignorer === "function"
                ? ignorer(message, command)
                : id === ignorer;
        if (isIgnored)
            return false;
        const time = command.cooldown != null ? command.cooldown : this.defaultCooldown;
        if (!time)
            return false;
        const endTime = message.createdTimestamp + time;
        if (!this.cooldowns.has(id))
            this.cooldowns.set(id, {});
        if (!this.cooldowns.get(id)[command.id]) {
            this.cooldowns.get(id)[command.id] = {
                timer: setTimeout(() => {
                    if (this.cooldowns.get(id)[command.id]) {
                        clearTimeout(this.cooldowns.get(id)[command.id].timer);
                    }
                    this.cooldowns.get(id)[command.id] = null;
                    if (!Object.keys(this.cooldowns.get(id)).length) {
                        this.cooldowns.delete(id);
                    }
                }, time).unref(),
                end: endTime,
                uses: 0
            };
        }
        const entry = this.cooldowns.get(id)[command.id];
        if (entry.uses >= command.ratelimit) {
            const end = this.cooldowns.get(id)[command.id].end;
            const diff = end - message.createdTimestamp;
            this.emit(Constants_1.CommandHandlerEvents.COOLDOWN, message, command, diff);
            return true;
        }
        entry.uses++;
        return false;
    }
    /**
     * Runs a command.
     * @param message - Message to handle.
     * @param command - Command to handle.
     * @param args - Arguments to use.
     */
    async runCommand(message, command, args) {
        if (!command || !message) {
            this.emit(Constants_1.CommandHandlerEvents.COMMAND_INVALID, message, command);
            return;
        }
        if (command.typing || this.typing) {
            message.channel.sendTyping();
        }
        this.emit(Constants_1.CommandHandlerEvents.COMMAND_STARTED, message, command, args);
        const ret = await command.exec(message, args);
        this.emit(Constants_1.CommandHandlerEvents.COMMAND_FINISHED, message, command, args, ret);
    }
    /**
     * Parses the command and its argument list.
     * @param message - Message that called the command.
     */
    async parseCommand(message) {
        const allowMention = await Util_1.default.intoCallable(this.prefix)(message);
        let prefixes = Util_1.default.intoArray(allowMention);
        if (allowMention) {
            const mentions = [`<@${this.client.user?.id}>`, `<@!${this.client.user?.id}>`];
            prefixes = [...mentions, ...prefixes];
        }
        prefixes.sort(Util_1.default.prefixCompare);
        return this.parseMultiplePrefixes(message, prefixes.map(p => [p, null]));
    }
    /**
     * Parses the command and its argument list using prefix overwrites.
     * @param message - Message that called the command.
     */
    async parseCommandOverwrittenPrefixes(message) {
        if (!this.prefixes.size) {
            return {};
        }
        const promises = this.prefixes.map(async (cmds, provider) => {
            const prefixes = Util_1.default.intoArray(await Util_1.default.intoCallable(provider)(message));
            return prefixes.map(p => [p, cmds]);
        });
        const pairs = Util_1.default.flatMap(await Promise.all(promises), x => x);
        pairs.sort(([a], [b]) => Util_1.default.prefixCompare(a, b));
        return this.parseMultiplePrefixes(message, pairs);
    }
    /**
     * Runs parseWithPrefix on multiple prefixes and returns the best parse.
     * @param message - Message to parse.
     * @param pairs - Pairs of prefix to associated commands. That is, `[string, Set<string> | null][]`.
     */
    parseMultiplePrefixes(message, pairs) {
        const parses = pairs.map(([prefix, cmds]) => this.parseWithPrefix(message, prefix, cmds));
        const result = parses.find(parsed => parsed.command);
        if (result) {
            return result;
        }
        const guess = parses.find(parsed => parsed.prefix != null);
        if (guess) {
            return guess;
        }
        return {};
    }
    /**
     * Tries to parse a message with the given prefix and associated commands.
     * Associated commands refer to when a prefix is used in prefix overrides.
     * @param message - Message to parse.
     * @param prefix - Prefix to use.
     * @param associatedCommands - Associated commands.
     */
    parseWithPrefix(message, prefix, associatedCommands = null) {
        const lowerContent = message.content.toLowerCase();
        if (!lowerContent.startsWith(prefix.toLowerCase())) {
            return {};
        }
        const endOfPrefix = lowerContent.indexOf(prefix.toLowerCase()) + prefix.length;
        const startOfArgs = message.content.slice(endOfPrefix).search(/\S/) + prefix.length;
        const alias = message.content.slice(startOfArgs).split(/\s{1,}|\n{1,}/)[0];
        const command = this.findCommand(alias);
        const content = message.content.slice(startOfArgs + alias.length + 1).trim();
        const afterPrefix = message.content.slice(prefix.length).trim();
        if (!command) {
            return { prefix, alias, content, afterPrefix };
        }
        if (associatedCommands == null) {
            if (command.prefix != null) {
                return { prefix, alias, content, afterPrefix };
            }
        }
        else if (!associatedCommands.has(command.id)) {
            return { prefix, alias, content, afterPrefix };
        }
        return { command, prefix, alias, content, afterPrefix };
    }
    /**
     * Handles errors from the handling.
     * @param err - The error.
     * @param message - Message that called the command.
     * @param command - Command that errored.
     */
    emitError(err, message, command) {
        if (this.listenerCount(Constants_1.CommandHandlerEvents.ERROR)) {
            this.emit(Constants_1.CommandHandlerEvents.ERROR, err, message, command);
            return;
        }
        throw err;
    }
    /**
     * Sweep command util instances from cache and returns amount sweeped.
     * @param lifetime - Messages older than this will have their command util instance sweeped. This is in milliseconds and defaults to the `commandUtilLifetime` option.
     */
    sweepCommandUtil(lifetime = this.commandUtilLifetime) {
        let count = 0;
        for (const commandUtil of this.commandUtils.values()) {
            const now = Date.now();
            const message = commandUtil.message;
            if (now - (message.editedTimestamp || message.createdTimestamp) > lifetime) {
                count++;
                this.commandUtils.delete(message.id);
            }
        }
        return count;
    }
    /**
     * Adds an ongoing prompt in order to prevent command usage in the channel.
     * @param channel - Channel to add to.
     * @param user - User to add.
     */
    addPrompt(channel, user) {
        let users = this.prompts.get(channel.id);
        if (!users)
            this.prompts.set(channel.id, new Set());
        users = this.prompts.get(channel.id);
        users?.add(user.id);
    }
    /**
     * Removes an ongoing prompt.
     * @param channel - Channel to remove from.
     * @param user - User to remove.
     */
    removePrompt(channel, user) {
        const users = this.prompts.get(channel.id);
        if (!users)
            return;
        users.delete(user.id);
        if (!users.size)
            this.prompts.delete(user.id);
    }
    /**
     * Checks if there is an ongoing prompt.
     * @param channel - Channel to check.
     * @param user - User to check.
     */
    hasPrompt(channel, user) {
        const users = this.prompts.get(channel.id);
        if (!users)
            return false;
        return users.has(user.id);
    }
    /**
     * Finds a command by alias.
     * @param name - Alias to find with.
     */
    findCommand(name) {
        return this.modules.get(this.aliases.get(name.toLowerCase()));
    }
    /**
     * Set the inhibitor handler to use.
     * @param inhibitorHandler - The inhibitor handler.
     */
    useInhibitorHandler(inhibitorHandler) {
        this.inhibitorHandler = inhibitorHandler;
        this.resolver.inhibitorHandler = inhibitorHandler;
        return this;
    }
    /**
     * Set the listener handler to use.
     * @param listenerHandler - The listener handler.
     */
    useListenerHandler(listenerHandler) {
        this.resolver.listenerHandler = listenerHandler;
        return this;
    }
    /**
     * Loads a command.
     * @param thing - Module or path to module.
     */
    load(thing) {
        return super.load(thing);
    }
    /**
     * Reads all commands from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory, filter) {
        return super.loadAll(directory, filter);
    }
    /**
     * Removes a command.
     * @param id - ID of the command.
     */
    remove(id) {
        return super.remove(id);
    }
    /**
     * Removes all commands.
     */
    removeAll() {
        return super.removeAll();
    }
    /**
     * Reloads a command.
     * @param id - ID of the command.
     */
    reload(id) {
        return super.reload(id);
    }
    /**
     * Reloads all commands.
     */
    reloadAll() {
        return super.reloadAll();
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
}
exports.default = CommandHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBWW9CO0FBQ3BCLG9EQUF1QjtBQUV2Qix5RUFBaUQ7QUFDakQsNkVBQXFEO0FBRXJELG9EQUE0RTtBQUM1RSwyREFBbUM7QUFFbkMscUVBQXNGO0FBRXRGLGlIQUF5RjtBQUl6Riw0RUFBb0Q7QUFDcEQsd0RBQWlEO0FBQ2pELGdFQUF3QztBQUN4QyxrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLGNBQWUsU0FBUSx1QkFBYTtJQUN4RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxpQkFBTyxFQUN2QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEVBQ1YsV0FBVyxHQUFHLElBQUksRUFDbEIsU0FBUyxHQUFHLElBQUksRUFDaEIsWUFBWSxHQUFHLEtBQUssRUFDcEIsV0FBVyxHQUFHLEtBQUssRUFDbkIsYUFBYSxHQUFHLEtBQUssRUFDckIsV0FBVyxFQUNYLG1CQUFtQixHQUFHLEdBQUcsRUFDekIsd0JBQXdCLEdBQUcsR0FBRyxFQUM5QixlQUFlLEdBQUcsQ0FBQyxFQUNuQixjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFDL0IsaUJBQWlCLEdBQUcsRUFBRSxFQUN0QixnQkFBZ0IsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxHQUFHLEVBQ1osWUFBWSxHQUFHLElBQUksRUFDbkIsZ0JBQWdCLEVBQ2hCLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLEVBQ2QseUJBQXlCLEdBQUcsS0FBSyxFQUNqQyxTQUFTLEdBQUcsS0FBSyxFQUNqQix5QkFBeUIsR0FBRyxLQUFLLEtBQ1AsRUFBRTtRQUU3QixJ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LFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDZSxJQUFJLENBQ25CLEtBQVEsRUFDUixRQUFtRTtRQUVuRSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDRDtBQXo0Q0QsaUNBeTRDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEFwcGxpY2F0aW9uQ29tbWFuZCxcblx0QXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YSxcblx0QXdhaXRlZCxcblx0Q29sbGVjdGlvbixcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25EYXRhLFxuXHRHdWlsZFJlc29sdmFibGUsXG5cdE1lc3NhZ2UsXG5cdFNub3dmbGFrZSxcblx0VGV4dEJhc2VkQ2hhbm5lbHMsXG5cdFVzZXJcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IENvbW1hbmRIYW5kbGVyRXZlbnRzIGFzIENvbW1hbmRIYW5kbGVyRXZlbnRzVHlwZSB9IGZyb20gXCIuLi8uLi90eXBpbmdzL2V2ZW50c1wiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQWthaXJvTWVzc2FnZSBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9NZXNzYWdlXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uLy4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCB7IEJ1aWx0SW5SZWFzb25zLCBDb21tYW5kSGFuZGxlckV2ZW50cyB9IGZyb20gXCIuLi8uLi91dGlsL0NvbnN0YW50c1wiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvSGFuZGxlciwgeyBBa2Fpcm9IYW5kbGVyT3B0aW9ucywgTG9hZFByZWRpY2F0ZSB9IGZyb20gXCIuLi9Ba2Fpcm9IYW5kbGVyXCI7XG5pbXBvcnQgQWthaXJvTW9kdWxlIGZyb20gXCIuLi9Ba2Fpcm9Nb2R1bGVcIjtcbmltcG9ydCBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyIGZyb20gXCIuLi9jb250ZXh0TWVudUNvbW1hbmRzL0NvbnRleHRNZW51Q29tbWFuZEhhbmRsZXJcIjtcbmltcG9ydCBJbmhpYml0b3JIYW5kbGVyIGZyb20gXCIuLi9pbmhpYml0b3JzL0luaGliaXRvckhhbmRsZXJcIjtcbmltcG9ydCBMaXN0ZW5lckhhbmRsZXIgZnJvbSBcIi4uL2xpc3RlbmVycy9MaXN0ZW5lckhhbmRsZXJcIjtcbmltcG9ydCB7IERlZmF1bHRBcmd1bWVudE9wdGlvbnMgfSBmcm9tIFwiLi9hcmd1bWVudHMvQXJndW1lbnRcIjtcbmltcG9ydCBUeXBlUmVzb2x2ZXIgZnJvbSBcIi4vYXJndW1lbnRzL1R5cGVSZXNvbHZlclwiO1xuaW1wb3J0IENvbW1hbmQsIHsgS2V5U3VwcGxpZXIgfSBmcm9tIFwiLi9Db21tYW5kXCI7XG5pbXBvcnQgQ29tbWFuZFV0aWwgZnJvbSBcIi4vQ29tbWFuZFV0aWxcIjtcbmltcG9ydCBGbGFnIGZyb20gXCIuL0ZsYWdcIjtcblxuLyoqXG4gKiBMb2FkcyBjb21tYW5kcyBhbmQgaGFuZGxlcyBtZXNzYWdlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZEhhbmRsZXIgZXh0ZW5kcyBBa2Fpcm9IYW5kbGVyIHtcblx0Y29uc3RydWN0b3IoXG5cdFx0Y2xpZW50OiBBa2Fpcm9DbGllbnQsXG5cdFx0e1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSA9IENvbW1hbmQsXG5cdFx0XHRleHRlbnNpb25zID0gW1wiLmpzXCIsIFwiLnRzXCJdLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlcixcblx0XHRcdGJsb2NrQ2xpZW50ID0gdHJ1ZSxcblx0XHRcdGJsb2NrQm90cyA9IHRydWUsXG5cdFx0XHRmZXRjaE1lbWJlcnMgPSBmYWxzZSxcblx0XHRcdGhhbmRsZUVkaXRzID0gZmFsc2UsXG5cdFx0XHRzdG9yZU1lc3NhZ2VzID0gZmFsc2UsXG5cdFx0XHRjb21tYW5kVXRpbCxcblx0XHRcdGNvbW1hbmRVdGlsTGlmZXRpbWUgPSAzZTUsXG5cdFx0XHRjb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWwgPSAzZTUsXG5cdFx0XHRkZWZhdWx0Q29vbGRvd24gPSAwLFxuXHRcdFx0aWdub3JlQ29vbGRvd24gPSBjbGllbnQub3duZXJJRCxcblx0XHRcdGlnbm9yZVBlcm1pc3Npb25zID0gW10sXG5cdFx0XHRhcmd1bWVudERlZmF1bHRzID0ge30sXG5cdFx0XHRwcmVmaXggPSBcIiFcIixcblx0XHRcdGFsbG93TWVudGlvbiA9IHRydWUsXG5cdFx0XHRhbGlhc1JlcGxhY2VtZW50LFxuXHRcdFx0YXV0b0RlZmVyID0gZmFsc2UsXG5cdFx0XHR0eXBpbmcgPSBmYWxzZSxcblx0XHRcdGF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHMgPSBmYWxzZSxcblx0XHRcdGV4ZWNTbGFzaCA9IGZhbHNlLFxuXHRcdFx0c2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycyA9IGZhbHNlXG5cdFx0fTogQ29tbWFuZEhhbmRsZXJPcHRpb25zID0ge31cblx0KSB7XG5cdFx0aWYgKCEoY2xhc3NUb0hhbmRsZS5wcm90b3R5cGUgaW5zdGFuY2VvZiBDb21tYW5kIHx8IGNsYXNzVG9IYW5kbGUgPT09IENvbW1hbmQpKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJJTlZBTElEX0NMQVNTX1RPX0hBTkRMRVwiLCBjbGFzc1RvSGFuZGxlLm5hbWUsIENvbW1hbmQubmFtZSk7XG5cdFx0fVxuXG5cdFx0c3VwZXIoY2xpZW50LCB7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlLFxuXHRcdFx0ZXh0ZW5zaW9ucyxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXJcblx0XHR9KTtcblxuXHRcdHRoaXMuYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcyA9IGF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHM7XG5cblx0XHR0aGlzLnR5cGluZyA9IHR5cGluZztcblxuXHRcdHRoaXMuYXV0b0RlZmVyID0gYXV0b0RlZmVyO1xuXG5cdFx0dGhpcy5yZXNvbHZlciA9IG5ldyBUeXBlUmVzb2x2ZXIodGhpcyk7XG5cblx0XHR0aGlzLmFsaWFzZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5hbGlhc1JlcGxhY2VtZW50ID0gYWxpYXNSZXBsYWNlbWVudDtcblxuXHRcdHRoaXMucHJlZml4ZXMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5ibG9ja0NsaWVudCA9ICEhYmxvY2tDbGllbnQ7XG5cblx0XHR0aGlzLmJsb2NrQm90cyA9ICEhYmxvY2tCb3RzO1xuXG5cdFx0dGhpcy5mZXRjaE1lbWJlcnMgPSAhIWZldGNoTWVtYmVycztcblxuXHRcdHRoaXMuaGFuZGxlRWRpdHMgPSAhIWhhbmRsZUVkaXRzO1xuXG5cdFx0dGhpcy5zdG9yZU1lc3NhZ2VzID0gISFzdG9yZU1lc3NhZ2VzO1xuXG5cdFx0dGhpcy5jb21tYW5kVXRpbCA9ICEhY29tbWFuZFV0aWw7XG5cdFx0aWYgKCh0aGlzLmhhbmRsZUVkaXRzIHx8IHRoaXMuc3RvcmVNZXNzYWdlcykgJiYgIXRoaXMuY29tbWFuZFV0aWwpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkNPTU1BTkRfVVRJTF9FWFBMSUNJVFwiKTtcblx0XHR9XG5cblx0XHR0aGlzLmNvbW1hbmRVdGlsTGlmZXRpbWUgPSBjb21tYW5kVXRpbExpZmV0aW1lO1xuXG5cdFx0dGhpcy5jb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWwgPSBjb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWw7XG5cdFx0aWYgKHRoaXMuY29tbWFuZFV0aWxTd2VlcEludGVydmFsID4gMCkge1xuXHRcdFx0c2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5zd2VlcENvbW1hbmRVdGlsKCksIHRoaXMuY29tbWFuZFV0aWxTd2VlcEludGVydmFsKS51bnJlZigpO1xuXHRcdH1cblxuXHRcdHRoaXMuY29tbWFuZFV0aWxzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdHRoaXMuY29vbGRvd25zID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdHRoaXMuZGVmYXVsdENvb2xkb3duID0gZGVmYXVsdENvb2xkb3duO1xuXG5cdFx0dGhpcy5pZ25vcmVDb29sZG93biA9IHR5cGVvZiBpZ25vcmVDb29sZG93biA9PT0gXCJmdW5jdGlvblwiID8gaWdub3JlQ29vbGRvd24uYmluZCh0aGlzKSA6IGlnbm9yZUNvb2xkb3duO1xuXG5cdFx0dGhpcy5pZ25vcmVQZXJtaXNzaW9ucyA9IHR5cGVvZiBpZ25vcmVQZXJtaXNzaW9ucyA9PT0gXCJmdW5jdGlvblwiID8gaWdub3JlUGVybWlzc2lvbnMuYmluZCh0aGlzKSA6IGlnbm9yZVBlcm1pc3Npb25zO1xuXG5cdFx0dGhpcy5wcm9tcHRzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdHRoaXMuYXJndW1lbnREZWZhdWx0cyA9IFV0aWwuZGVlcEFzc2lnbihcblx0XHRcdHtcblx0XHRcdFx0cHJvbXB0OiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiXCIsXG5cdFx0XHRcdFx0cmV0cnk6IFwiXCIsXG5cdFx0XHRcdFx0dGltZW91dDogXCJcIixcblx0XHRcdFx0XHRlbmRlZDogXCJcIixcblx0XHRcdFx0XHRjYW5jZWw6IFwiXCIsXG5cdFx0XHRcdFx0cmV0cmllczogMSxcblx0XHRcdFx0XHR0aW1lOiAzMDAwMCxcblx0XHRcdFx0XHRjYW5jZWxXb3JkOiBcImNhbmNlbFwiLFxuXHRcdFx0XHRcdHN0b3BXb3JkOiBcInN0b3BcIixcblx0XHRcdFx0XHRvcHRpb25hbDogZmFsc2UsXG5cdFx0XHRcdFx0aW5maW5pdGU6IGZhbHNlLFxuXHRcdFx0XHRcdGxpbWl0OiBJbmZpbml0eSxcblx0XHRcdFx0XHRicmVha291dDogdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0YXJndW1lbnREZWZhdWx0c1xuXHRcdCk7XG5cblx0XHR0aGlzLnByZWZpeCA9IHR5cGVvZiBwcmVmaXggPT09IFwiZnVuY3Rpb25cIiA/IHByZWZpeC5iaW5kKHRoaXMpIDogcHJlZml4O1xuXG5cdFx0dGhpcy5hbGxvd01lbnRpb24gPSB0eXBlb2YgYWxsb3dNZW50aW9uID09PSBcImZ1bmN0aW9uXCIgPyBhbGxvd01lbnRpb24uYmluZCh0aGlzKSA6ICEhYWxsb3dNZW50aW9uO1xuXG5cdFx0dGhpcy5pbmhpYml0b3JIYW5kbGVyID0gbnVsbDtcblxuXHRcdHRoaXMuYXV0b0RlZmVyID0gISFhdXRvRGVmZXI7XG5cblx0XHR0aGlzLmV4ZWNTbGFzaCA9ICEhZXhlY1NsYXNoO1xuXG5cdFx0dGhpcy5za2lwQnVpbHRJblBvc3RJbmhpYml0b3JzID0gISFza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzO1xuXG5cdFx0dGhpcy5zZXR1cCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgY29tbWFuZCBhbGlhc2VzLlxuXHQgKi9cblx0cHVibGljIGFsaWFzZXM6IENvbGxlY3Rpb248c3RyaW5nLCBzdHJpbmc+O1xuXG5cdC8qKlxuXHQgKiBSZWd1bGFyIGV4cHJlc3Npb24gdG8gYXV0b21hdGljYWxseSBtYWtlIGNvbW1hbmQgYWxpYXNlcyBmb3IuXG5cdCAqL1xuXHRwdWJsaWMgYWxpYXNSZXBsYWNlbWVudD86IFJlZ0V4cDtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgbWVudGlvbnMgYXJlIGFsbG93ZWQgZm9yIHByZWZpeGluZy5cblx0ICovXG5cdHB1YmxpYyBhbGxvd01lbnRpb246IGJvb2xlYW4gfCBNZW50aW9uUHJlZml4UHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IGFyZ3VtZW50IG9wdGlvbnMuXG5cdCAqL1xuXHRwdWJsaWMgYXJndW1lbnREZWZhdWx0czogRGVmYXVsdEFyZ3VtZW50T3B0aW9ucztcblxuXHQvKipcblx0ICogQXV0b21hdGljYWxseSBkZWZlciBtZXNzYWdlcyBcIkJvdE5hbWUgaXMgdGhpbmtpbmdcIi5cblx0ICovXG5cdHB1YmxpYyBhdXRvRGVmZXI6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNwZWNpZnkgd2hldGhlciB0byByZWdpc3RlciBhbGwgc2xhc2ggY29tbWFuZHMgd2hlbiBzdGFydGluZyB0aGUgY2xpZW50XG5cdCAqL1xuXHRwdWJsaWMgYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYmxvY2sgYm90cy5cblx0ICovXG5cdHB1YmxpYyBibG9ja0JvdHM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGJsb2NrIHNlbGYuXG5cdCAqL1xuXHRwdWJsaWMgYmxvY2tDbGllbnQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNhdGVnb3JpZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDYXRlZ29yeTxzdHJpbmcsIENvbW1hbmQ+PjtcblxuXHQvKipcblx0ICogQ2xhc3MgdG8gaGFuZGxlXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGFzc1RvSGFuZGxlOiB0eXBlb2YgQ29tbWFuZDtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgYG1lc3NhZ2UudXRpbGAgaXMgYXNzaWduZWQuXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZFV0aWw6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIE1pbGxpc2Vjb25kcyBhIG1lc3NhZ2Ugc2hvdWxkIGV4aXN0IGZvciBiZWZvcmUgaXRzIGNvbW1hbmQgdXRpbCBpbnN0YW5jZSBpcyBtYXJrZWQgZm9yIHJlbW92YWwuXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZFV0aWxMaWZldGltZTogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBDb2xsZWN0aW9uIG9mIENvbW1hbmRVdGlscy5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbHM6IENvbGxlY3Rpb248c3RyaW5nLCBDb21tYW5kVXRpbD47XG5cblx0LyoqXG5cdCAqIFRpbWUgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzIGZvciBzd2VlcGluZyBjb21tYW5kIHV0aWwgaW5zdGFuY2VzLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBDb2xsZWN0aW9uIG9mIGNvb2xkb3ducy5cblx0ICogPGluZm8+VGhlIGVsZW1lbnRzIGluIHRoZSBjb2xsZWN0aW9uIGFyZSBvYmplY3RzIHdpdGggdXNlciBJRHMgYXMga2V5c1xuXHQgKiBhbmQge0BsaW5rIENvb2xkb3duRGF0YX0gb2JqZWN0cyBhcyB2YWx1ZXM8L2luZm8+XG5cdCAqL1xuXHRwdWJsaWMgY29vbGRvd25zOiBDb2xsZWN0aW9uPHN0cmluZywgeyBbaWQ6IHN0cmluZ106IENvb2xkb3duRGF0YSB9PjtcblxuXHQvKipcblx0ICogRGVmYXVsdCBjb29sZG93biBmb3IgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgZGVmYXVsdENvb2xkb3duOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIERpcmVjdG9yeSB0byBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGRpcmVjdG9yeTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byB1c2UgZXhlY1NsYXNoIGZvciBzbGFzaCBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBleGVjU2xhc2g6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IG1lbWJlcnMgYXJlIGZldGNoZWQgb24gZWFjaCBtZXNzYWdlIGF1dGhvciBmcm9tIGEgZ3VpbGQuXG5cdCAqL1xuXHRwdWJsaWMgZmV0Y2hNZW1iZXJzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBlZGl0cyBhcmUgaGFuZGxlZC5cblx0ICovXG5cdHB1YmxpYyBoYW5kbGVFZGl0czogYm9vbGVhbjtcblxuXHQvKipcblx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgY29vbGRvd24gb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuXG5cdCAqL1xuXHRwdWJsaWMgaWdub3JlQ29vbGRvd246IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGB1c2VyUGVybWlzc2lvbnNgIGNoZWNrcyBvciBhIGZ1bmN0aW9uIHRvIGlnbm9yZS5cblx0ICovXG5cdHB1YmxpYyBpZ25vcmVQZXJtaXNzaW9uczogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gfCBJZ25vcmVDaGVja1ByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogSW5oaWJpdG9yIGhhbmRsZXIgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGluaGliaXRvckhhbmRsZXI/OiBJbmhpYml0b3JIYW5kbGVyO1xuXG5cdC8qKlxuXHQgKiBDb21tYW5kcyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byBDb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgbW9kdWxlczogQ29sbGVjdGlvbjxzdHJpbmcsIENvbW1hbmQ+O1xuXG5cdC8qKlxuXHQgKiBUaGUgcHJlZml4KGVzKSBmb3IgY29tbWFuZCBwYXJzaW5nLlxuXHQgKi9cblx0cHVibGljIHByZWZpeDogc3RyaW5nIHwgc3RyaW5nW10gfCBQcmVmaXhTdXBwbGllcjtcblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBwcmVmaXggb3ZlcndyaXRlcyB0byBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBwcmVmaXhlczogQ29sbGVjdGlvbjxzdHJpbmcgfCBQcmVmaXhTdXBwbGllciwgU2V0PHN0cmluZz4+O1xuXG5cdC8qKlxuXHQgKiBDb2xsZWN0aW9uIG9mIHNldHMgb2Ygb25nb2luZyBhcmd1bWVudCBwcm9tcHRzLlxuXHQgKi9cblx0cHVibGljIHByb21wdHM6IENvbGxlY3Rpb248c3RyaW5nLCBTZXQ8c3RyaW5nPj47XG5cblx0LyoqXG5cdCAqIFRoZSB0eXBlIHJlc29sdmVyLlxuXHQgKi9cblx0cHVibGljIHJlc29sdmVyOiBUeXBlUmVzb2x2ZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHN0b3JlIG1lc3NhZ2VzIGluIENvbW1hbmRVdGlsLlxuXHQgKi9cblx0cHVibGljIHN0b3JlTWVzc2FnZXM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNob3cgXCJCb3ROYW1lIGlzIHR5cGluZ1wiIGluZm9ybWF0aW9uIG1lc3NhZ2Ugb24gdGhlIHRleHQgY2hhbm5lbHMgd2hlbiBhIGNvbW1hbmQgaXMgcnVubmluZy5cblx0ICovXG5cdHB1YmxpYyB0eXBpbmc6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHNraXAgYnVpbHQgaW4gcmVhc29ucyBwb3N0IHR5cGUgaW5oaWJpdG9ycyBzbyB5b3UgY2FuIG1ha2UgY3VzdG9tIG9uZXMuXG5cdCAqL1xuXHRwdWJsaWMgc2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycz86IGJvb2xlYW47XG5cblx0cHJvdGVjdGVkIHNldHVwKCkge1xuXHRcdHRoaXMuY2xpZW50Lm9uY2UoXCJyZWFkeVwiLCAoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5hdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzKVxuXHRcdFx0XHR0aGlzLnJlZ2lzdGVySW50ZXJhY3Rpb25Db21tYW5kcygpLnRoZW4oKCkgPT5cblx0XHRcdFx0XHR0aGlzLnVwZGF0ZUludGVyYWN0aW9uUGVybWlzc2lvbnModGhpcy5jbGllbnQub3duZXJJRCwgdGhpcy5jbGllbnQuc3VwZXJVc2VySUQpXG5cdFx0XHRcdCk7XG5cblx0XHRcdHRoaXMuY2xpZW50Lm9uKFwibWVzc2FnZUNyZWF0ZVwiLCBhc3luYyBtID0+IHtcblx0XHRcdFx0aWYgKG0ucGFydGlhbCkgYXdhaXQgbS5mZXRjaCgpO1xuXG5cdFx0XHRcdHRoaXMuaGFuZGxlKG0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICh0aGlzLmhhbmRsZUVkaXRzKSB7XG5cdFx0XHRcdHRoaXMuY2xpZW50Lm9uKFwibWVzc2FnZVVwZGF0ZVwiLCBhc3luYyAobywgbSkgPT4ge1xuXHRcdFx0XHRcdGlmIChvLnBhcnRpYWwpIGF3YWl0IG8uZmV0Y2goKTtcblx0XHRcdFx0XHRpZiAobS5wYXJ0aWFsKSBhd2FpdCBtLmZldGNoKCk7XG5cdFx0XHRcdFx0aWYgKG8uY29udGVudCA9PT0gbS5jb250ZW50KSByZXR1cm47XG5cblx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFZGl0cykgdGhpcy5oYW5kbGUobSBhcyBNZXNzYWdlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmNsaWVudC5vbihcImludGVyYWN0aW9uQ3JlYXRlXCIsIGkgPT4ge1xuXHRcdFx0XHRpZiAoIWkuaXNDb21tYW5kKCkpIHJldHVybjtcblx0XHRcdFx0dGhpcy5oYW5kbGVTbGFzaChpKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIHJlZ2lzdGVySW50ZXJhY3Rpb25Db21tYW5kcygpIHtcblx0XHRjb25zdCBwYXJzZWRTbGFzaENvbW1hbmRzOiB7XG5cdFx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0XHRkZXNjcmlwdGlvbj86IHN0cmluZztcblx0XHRcdG9wdGlvbnM/OiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25EYXRhW107XG5cdFx0XHRndWlsZHM6IFNub3dmbGFrZVtdO1xuXHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246IGJvb2xlYW47XG5cdFx0XHR0eXBlOiBcIkNIQVRfSU5QVVRcIiB8IFwiTUVTU0FHRVwiIHwgXCJVU0VSXCI7XG5cdFx0fVtdID0gW107XG5cdFx0Y29uc3QgZ3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkOiBDb2xsZWN0aW9uPFxuXHRcdFx0U25vd2ZsYWtlLFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBzdHJpbmc7XG5cdFx0XHRcdG9wdGlvbnM6IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkRhdGFbXTtcblx0XHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246IGJvb2xlYW47XG5cdFx0XHRcdHR5cGU6IFwiQ0hBVF9JTlBVVFwiIHwgXCJNRVNTQUdFXCIgfCBcIlVTRVJcIjtcblx0XHRcdH1bXVxuXHRcdD4gPSBuZXcgQ29sbGVjdGlvbigpO1xuXHRcdGNvbnN0IHBhcnNlRGVzY3JpcHRpb25Db21tYW5kID0gZGVzY3JpcHRpb24gPT4ge1xuXHRcdFx0aWYgKHR5cGVvZiBkZXNjcmlwdGlvbiA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRpZiAodHlwZW9mIGRlc2NyaXB0aW9uLmNvbnRlbnQgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIGRlc2NyaXB0aW9uLmNvbnRlbnQoKTtcblx0XHRcdFx0aWYgKHR5cGVvZiBkZXNjcmlwdGlvbi5jb250ZW50ID09PSBcInN0cmluZ1wiKSByZXR1cm4gZGVzY3JpcHRpb24uY29udGVudDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBkZXNjcmlwdGlvbjtcblx0XHR9O1xuXG5cdFx0Zm9yIChjb25zdCBbLCBkYXRhXSBvZiB0aGlzLm1vZHVsZXMpIHtcblx0XHRcdGlmICghZGF0YS5zbGFzaCkgY29udGludWU7XG5cdFx0XHRwYXJzZWRTbGFzaENvbW1hbmRzLnB1c2goe1xuXHRcdFx0XHRuYW1lOiBkYXRhLmFsaWFzZXNbMF0sXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBwYXJzZURlc2NyaXB0aW9uQ29tbWFuZChkYXRhLmRlc2NyaXB0aW9uKSxcblx0XHRcdFx0b3B0aW9uczogZGF0YS5zbGFzaE9wdGlvbnMsXG5cdFx0XHRcdGd1aWxkczogZGF0YS5zbGFzaEd1aWxkcyA/PyBbXSxcblx0XHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246ICEoZGF0YS5vd25lck9ubHkgfHwgZGF0YS5zdXBlclVzZXJPbmx5IHx8IGZhbHNlKSxcblx0XHRcdFx0dHlwZTogXCJDSEFUX0lOUFVUXCJcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGxldCBjb250ZXh0Q29tbWFuZEhhbmRsZXI6IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXIgfCB1bmRlZmluZWQ7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gdGhpcy5jbGllbnQpIHtcblx0XHRcdGlmICh0aGlzLmNsaWVudFtrZXldIGluc3RhbmNlb2YgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlcikge1xuXHRcdFx0XHRjb250ZXh0Q29tbWFuZEhhbmRsZXIgPSB0aGlzLmNsaWVudFtrZXldO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGNvbnRleHRDb21tYW5kSGFuZGxlcikge1xuXHRcdFx0Zm9yIChjb25zdCBbLCBkYXRhXSBvZiBjb250ZXh0Q29tbWFuZEhhbmRsZXIubW9kdWxlcykge1xuXHRcdFx0XHRwYXJzZWRTbGFzaENvbW1hbmRzLnB1c2goe1xuXHRcdFx0XHRcdG5hbWU6IGRhdGEubmFtZSxcblx0XHRcdFx0XHRndWlsZHM6IGRhdGEuZ3VpbGRzID8/IFtdLFxuXHRcdFx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiAhKGRhdGEub3duZXJPbmx5IHx8IGRhdGEuc3VwZXJVc2VyT25seSB8fCBmYWxzZSksXG5cdFx0XHRcdFx0dHlwZTogZGF0YS50eXBlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qIEdsb2JhbCAqL1xuXHRcdGNvbnN0IHNsYXNoQ29tbWFuZHNBcHAgPSBwYXJzZWRTbGFzaENvbW1hbmRzXG5cdFx0XHQuZmlsdGVyKCh7IGd1aWxkcyB9KSA9PiAhZ3VpbGRzLmxlbmd0aClcblx0XHRcdC5tYXAoKHsgbmFtZSwgZGVzY3JpcHRpb24sIG9wdGlvbnMsIGRlZmF1bHRQZXJtaXNzaW9uLCB0eXBlIH0pID0+IHtcblx0XHRcdFx0cmV0dXJuIHsgbmFtZSwgZGVzY3JpcHRpb24sIG9wdGlvbnMsIGRlZmF1bHRQZXJtaXNzaW9uLCB0eXBlIH07XG5cdFx0XHR9KTtcblx0XHRjb25zdCBjdXJyZW50R2xvYmFsQ29tbWFuZHMgPSAoYXdhaXQgdGhpcy5jbGllbnQuYXBwbGljYXRpb24/LmNvbW1hbmRzLmZldGNoKCkpLm1hcCh2YWx1ZTEgPT4gKHtcblx0XHRcdG5hbWU6IHZhbHVlMS5uYW1lLFxuXHRcdFx0ZGVzY3JpcHRpb246IHZhbHVlMS5kZXNjcmlwdGlvbixcblx0XHRcdG9wdGlvbnM6IHZhbHVlMS5vcHRpb25zLFxuXHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246IHZhbHVlMS5kZWZhdWx0UGVybWlzc2lvbixcblx0XHRcdHR5cGU6IHZhbHVlMS50eXBlXG5cdFx0fSkpO1xuXG5cdFx0aWYgKCFfLmlzRXF1YWwoY3VycmVudEdsb2JhbENvbW1hbmRzLCBzbGFzaENvbW1hbmRzQXBwKSkge1xuXHRcdFx0YXdhaXQgdGhpcy5jbGllbnQuYXBwbGljYXRpb24/LmNvbW1hbmRzLnNldChzbGFzaENvbW1hbmRzQXBwKTtcblx0XHR9XG5cblx0XHQvKiBHdWlsZHMgKi9cblx0XHRmb3IgKGNvbnN0IHsgbmFtZSwgZGVzY3JpcHRpb24sIG9wdGlvbnMsIGd1aWxkcywgZGVmYXVsdFBlcm1pc3Npb24sIHR5cGUgfSBvZiBwYXJzZWRTbGFzaENvbW1hbmRzKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGd1aWxkSWQgb2YgZ3VpbGRzKSB7XG5cdFx0XHRcdGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZC5zZXQoZ3VpbGRJZCwgW1xuXHRcdFx0XHRcdC4uLihndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQuZ2V0KGd1aWxkSWQpID8/IFtdKSxcblx0XHRcdFx0XHR7IG5hbWUsIGRlc2NyaXB0aW9uLCBvcHRpb25zLCBkZWZhdWx0UGVybWlzc2lvbiwgdHlwZSB9XG5cdFx0XHRcdF0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoZ3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkLnNpemUpIHtcblx0XHRcdGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZC5lYWNoKGFzeW5jICh2YWx1ZSwga2V5KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGd1aWxkID0gdGhpcy5jbGllbnQuZ3VpbGRzLmNhY2hlLmdldChrZXkpO1xuXHRcdFx0XHRpZiAoIWd1aWxkKSByZXR1cm47XG5cblx0XHRcdFx0Y29uc3QgY3VycmVudEd1aWxkQ29tbWFuZHMgPSAoYXdhaXQgZ3VpbGQuY29tbWFuZHMuZmV0Y2goKSkubWFwKHZhbHVlMSA9PiAoe1xuXHRcdFx0XHRcdG5hbWU6IHZhbHVlMS5uYW1lLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiB2YWx1ZTEuZGVzY3JpcHRpb24sXG5cdFx0XHRcdFx0b3B0aW9uczogdmFsdWUxLm9wdGlvbnMsXG5cdFx0XHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246IHZhbHVlMS5kZWZhdWx0UGVybWlzc2lvbixcblx0XHRcdFx0XHR0eXBlOiB2YWx1ZTEudHlwZVxuXHRcdFx0XHR9KSk7XG5cblx0XHRcdFx0aWYgKCFfLmlzRXF1YWwoY3VycmVudEd1aWxkQ29tbWFuZHMsIHZhbHVlKSkge1xuXHRcdFx0XHRcdGF3YWl0IGd1aWxkLmNvbW1hbmRzLnNldCh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyB1cGRhdGVJbnRlcmFjdGlvblBlcm1pc3Npb25zKG93bmVyczogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10sIHN1cGVyVXNlcnM6IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdKSB7XG5cdFx0Y29uc3QgbWFwQ29tID0gKFxuXHRcdFx0dmFsdWU6IEFwcGxpY2F0aW9uQ29tbWFuZDx7XG5cdFx0XHRcdGd1aWxkOiBHdWlsZFJlc29sdmFibGU7XG5cdFx0XHR9PlxuXHRcdCk6IHsgaWQ6IHN0cmluZzsgcGVybWlzc2lvbnM6IHsgaWQ6IHN0cmluZzsgdHlwZTogXCJVU0VSXCI7IHBlcm1pc3Npb246IGJvb2xlYW4gfVtdIH0gPT4ge1xuXHRcdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMubW9kdWxlcy5maW5kKG1vZCA9PiBtb2QuYWxpYXNlc1swXSA9PT0gdmFsdWUubmFtZSk7XG5cdFx0XHRsZXQgYWxsb3dlZFVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0aWYgKGNvbW1hbmQuc3VwZXJVc2VyT25seSkgYWxsb3dlZFVzZXJzLnB1c2goLi4uVXRpbC5pbnRvQXJyYXkoc3VwZXJVc2VycykpO1xuXHRcdFx0aWYgKGNvbW1hbmQub3duZXJPbmx5KSBhbGxvd2VkVXNlcnMucHVzaCguLi5VdGlsLmludG9BcnJheShvd25lcnMpKTtcblx0XHRcdGFsbG93ZWRVc2VycyA9IFsuLi5uZXcgU2V0KGFsbG93ZWRVc2VycyldOyAvLyByZW1vdmUgZHVwbGljYXRlc1xuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRpZDogdmFsdWUuaWQsXG5cdFx0XHRcdHBlcm1pc3Npb25zOiBhbGxvd2VkVXNlcnMubWFwKHUgPT4gKHtcblx0XHRcdFx0XHRpZDogdSxcblx0XHRcdFx0XHR0eXBlOiBcIlVTRVJcIixcblx0XHRcdFx0XHRwZXJtaXNzaW9uOiB0cnVlXG5cdFx0XHRcdH0pKVxuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgZ2xvYmFsQ29tbWFuZHMgPSBhd2FpdCB0aGlzLmNsaWVudC5hcHBsaWNhdGlvbj8uY29tbWFuZHMuZmV0Y2goKTtcblx0XHRjb25zdCBmdWxsUGVybWlzc2lvbnM6IEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbkRhdGFbXSA9IGdsb2JhbENvbW1hbmRzXG5cdFx0XHQuZmlsdGVyKHZhbHVlID0+ICF2YWx1ZS5kZWZhdWx0UGVybWlzc2lvbilcblx0XHRcdC5tYXAodmFsdWUgPT4gbWFwQ29tKHZhbHVlKSk7XG5cblx0XHRjb25zdCBwcm9taXNlcyA9IHRoaXMuY2xpZW50Lmd1aWxkcy5jYWNoZS5tYXAoZ3VpbGQgPT4ge1xuXHRcdFx0Y29uc3QgcGVybXMgPSBmdWxsUGVybWlzc2lvbnM7XG5cdFx0XHRpZiAoZ3VpbGQuY29tbWFuZHMuY2FjaGUuc2l6ZSlcblx0XHRcdFx0cGVybXMucHVzaCguLi5ndWlsZC5jb21tYW5kcy5jYWNoZS5maWx0ZXIodmFsdWUgPT4gIXZhbHVlLmRlZmF1bHRQZXJtaXNzaW9uKS5tYXAodmFsdWUgPT4gbWFwQ29tKHZhbHVlKSkpO1xuXHRcdFx0aWYgKGd1aWxkLmF2YWlsYWJsZSlcblx0XHRcdFx0cmV0dXJuIGd1aWxkLmNvbW1hbmRzLnBlcm1pc3Npb25zLnNldCh7XG5cdFx0XHRcdFx0ZnVsbFBlcm1pc3Npb25zOiBwZXJtc1xuXHRcdFx0XHR9KTtcblx0XHRcdC8vIFJldHVybiBlbXB0eSBwcm9taXNlIGlmIGd1aWxkIGlzIHVuYXZhaWxhYmxlXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fSk7XG5cdFx0Ly8gQHRzLWV4cGVjdC1lcnJvcjogaXQgc3RpbGwgd29ya3Mgc2h1c2hcblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWdpc3Rlcihjb21tYW5kOiBDb21tYW5kLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdHN1cGVyLnJlZ2lzdGVyKGNvbW1hbmQsIGZpbGVwYXRoKTtcblxuXHRcdGZvciAobGV0IGFsaWFzIG9mIGNvbW1hbmQuYWxpYXNlcykge1xuXHRcdFx0Y29uc3QgY29uZmxpY3QgPSB0aGlzLmFsaWFzZXMuZ2V0KGFsaWFzLnRvTG93ZXJDYXNlKCkpO1xuXHRcdFx0aWYgKGNvbmZsaWN0KSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJBTElBU19DT05GTElDVFwiLCBhbGlhcywgY29tbWFuZC5pZCwgY29uZmxpY3QpO1xuXG5cdFx0XHRhbGlhcyA9IGFsaWFzLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR0aGlzLmFsaWFzZXMuc2V0KGFsaWFzLCBjb21tYW5kLmlkKTtcblx0XHRcdGlmICh0aGlzLmFsaWFzUmVwbGFjZW1lbnQpIHtcblx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnQgPSBhbGlhcy5yZXBsYWNlKHRoaXMuYWxpYXNSZXBsYWNlbWVudCwgXCJcIik7XG5cblx0XHRcdFx0aWYgKHJlcGxhY2VtZW50ICE9PSBhbGlhcykge1xuXHRcdFx0XHRcdGNvbnN0IHJlcGxhY2VtZW50Q29uZmxpY3QgPSB0aGlzLmFsaWFzZXMuZ2V0KHJlcGxhY2VtZW50KTtcblx0XHRcdFx0XHRpZiAocmVwbGFjZW1lbnRDb25mbGljdClcblx0XHRcdFx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMSUFTX0NPTkZMSUNUXCIsIHJlcGxhY2VtZW50LCBjb21tYW5kLmlkLCByZXBsYWNlbWVudENvbmZsaWN0KTtcblx0XHRcdFx0XHR0aGlzLmFsaWFzZXMuc2V0KHJlcGxhY2VtZW50LCBjb21tYW5kLmlkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLnByZWZpeCAhPSBudWxsKSB7XG5cdFx0XHRsZXQgbmV3RW50cnkgPSBmYWxzZTtcblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY29tbWFuZC5wcmVmaXgpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgcHJlZml4IG9mIGNvbW1hbmQucHJlZml4KSB7XG5cdFx0XHRcdFx0Y29uc3QgcHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLmdldChwcmVmaXgpO1xuXHRcdFx0XHRcdGlmIChwcmVmaXhlcykge1xuXHRcdFx0XHRcdFx0cHJlZml4ZXMuYWRkKGNvbW1hbmQuaWQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLnByZWZpeGVzLnNldChwcmVmaXgsIG5ldyBTZXQoW2NvbW1hbmQuaWRdKSk7XG5cdFx0XHRcdFx0XHRuZXdFbnRyeSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0aWYgKHByZWZpeGVzKSB7XG5cdFx0XHRcdFx0cHJlZml4ZXMuYWRkKGNvbW1hbmQuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuc2V0KGNvbW1hbmQucHJlZml4LCBuZXcgU2V0KFtjb21tYW5kLmlkXSkpO1xuXHRcdFx0XHRcdG5ld0VudHJ5ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAobmV3RW50cnkpIHtcblx0XHRcdFx0dGhpcy5wcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuc29ydCgoYVZhbCwgYlZhbCwgYUtleSwgYktleSkgPT4gVXRpbC5wcmVmaXhDb21wYXJlKGFLZXksIGJLZXkpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBkZXJlZ2lzdGVyKGNvbW1hbmQ6IENvbW1hbmQpOiB2b2lkIHtcblx0XHRmb3IgKGxldCBhbGlhcyBvZiBjb21tYW5kLmFsaWFzZXMpIHtcblx0XHRcdGFsaWFzID0gYWxpYXMudG9Mb3dlckNhc2UoKTtcblx0XHRcdHRoaXMuYWxpYXNlcy5kZWxldGUoYWxpYXMpO1xuXG5cdFx0XHRpZiAodGhpcy5hbGlhc1JlcGxhY2VtZW50KSB7XG5cdFx0XHRcdGNvbnN0IHJlcGxhY2VtZW50ID0gYWxpYXMucmVwbGFjZSh0aGlzLmFsaWFzUmVwbGFjZW1lbnQsIFwiXCIpO1xuXHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgIT09IGFsaWFzKSB0aGlzLmFsaWFzZXMuZGVsZXRlKHJlcGxhY2VtZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY29tbWFuZC5wcmVmaXggIT0gbnVsbCkge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY29tbWFuZC5wcmVmaXgpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgcHJlZml4IG9mIGNvbW1hbmQucHJlZml4KSB7XG5cdFx0XHRcdFx0Y29uc3QgcHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLmdldChwcmVmaXgpO1xuXHRcdFx0XHRcdGlmIChwcmVmaXhlcz8uc2l6ZSA9PT0gMSkge1xuXHRcdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5kZWxldGUocHJlZml4KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cHJlZml4ZXM/LmRlbGV0ZShwcmVmaXgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgcHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLmdldChjb21tYW5kLnByZWZpeCk7XG5cdFx0XHRcdGlmIChwcmVmaXhlcz8uc2l6ZSA9PT0gMSkge1xuXHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuZGVsZXRlKGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0cHJlZml4ZXMuZGVsZXRlKGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHN1cGVyLmRlcmVnaXN0ZXIoY29tbWFuZCk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBhIG1lc3NhZ2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLmZldGNoTWVtYmVycyAmJiBtZXNzYWdlLmd1aWxkICYmICFtZXNzYWdlLm1lbWJlciAmJiAhbWVzc2FnZS53ZWJob29rSWQpIHtcblx0XHRcdFx0YXdhaXQgbWVzc2FnZS5ndWlsZC5tZW1iZXJzLmZldGNoKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuQWxsVHlwZUluaGliaXRvcnMobWVzc2FnZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbHMuaGFzKG1lc3NhZ2UuaWQpKSB7XG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdG1lc3NhZ2UudXRpbCA9IHRoaXMuY29tbWFuZFV0aWxzLmdldChtZXNzYWdlLmlkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gbmV3IENvbW1hbmRVdGlsKHRoaXMsIG1lc3NhZ2UpOyAvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0dGhpcy5jb21tYW5kVXRpbHMuc2V0KG1lc3NhZ2UuaWQsIG1lc3NhZ2UudXRpbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUHJlVHlwZUluaGliaXRvcnMobWVzc2FnZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcGFyc2VkID0gYXdhaXQgdGhpcy5wYXJzZUNvbW1hbmQobWVzc2FnZSk7XG5cdFx0XHRpZiAoIXBhcnNlZC5jb21tYW5kKSB7XG5cdFx0XHRcdGNvbnN0IG92ZXJQYXJzZWQgPSBhd2FpdCB0aGlzLnBhcnNlQ29tbWFuZE92ZXJ3cml0dGVuUHJlZml4ZXMobWVzc2FnZSk7XG5cdFx0XHRcdGlmIChvdmVyUGFyc2VkLmNvbW1hbmQgfHwgKHBhcnNlZC5wcmVmaXggPT0gbnVsbCAmJiBvdmVyUGFyc2VkLnByZWZpeCAhPSBudWxsKSkge1xuXHRcdFx0XHRcdHBhcnNlZCA9IG92ZXJQYXJzZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWwpIHtcblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRtZXNzYWdlLnV0aWwucGFyc2VkID0gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcmFuO1xuXHRcdFx0aWYgKCFwYXJzZWQuY29tbWFuZCkge1xuXHRcdFx0XHRyYW4gPSBhd2FpdCB0aGlzLmhhbmRsZVJlZ2V4QW5kQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJhbiA9IGF3YWl0IHRoaXMuaGFuZGxlRGlyZWN0Q29tbWFuZChtZXNzYWdlLCBwYXJzZWQuY29udGVudCwgcGFyc2VkLmNvbW1hbmQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocmFuID09PSBmYWxzZSkge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9JTlZBTElELCBtZXNzYWdlKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmFuO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGEgc2xhc2ggY29tbWFuZC5cblx0ICogQHBhcmFtIGludGVyYWN0aW9uIC0gSW50ZXJhY3Rpb24gdG8gaGFuZGxlLlxuXHQgKi9cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblx0cHVibGljIGFzeW5jIGhhbmRsZVNsYXNoKGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb24pOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMuZmluZENvbW1hbmQoaW50ZXJhY3Rpb24uY29tbWFuZE5hbWUpO1xuXG5cdFx0aWYgKCFjb21tYW5kKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTk9UX0ZPVU5ELCBpbnRlcmFjdGlvbik7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWVzc2FnZSA9IG5ldyBBa2Fpcm9NZXNzYWdlKHRoaXMuY2xpZW50LCBpbnRlcmFjdGlvbiwgY29tbWFuZCk7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKHRoaXMuZmV0Y2hNZW1iZXJzICYmIG1lc3NhZ2UuZ3VpbGQgJiYgIW1lc3NhZ2UubWVtYmVyKSB7XG5cdFx0XHRcdGF3YWl0IG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5mZXRjaChtZXNzYWdlLmF1dGhvcik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1bkFsbFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIHRydWUpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWwpIHtcblx0XHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWxzLmhhcyhtZXNzYWdlLmlkKSkge1xuXHRcdFx0XHRcdG1lc3NhZ2UudXRpbCA9IHRoaXMuY29tbWFuZFV0aWxzLmdldChtZXNzYWdlLmlkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSBuZXcgQ29tbWFuZFV0aWwodGhpcywgbWVzc2FnZSk7XG5cdFx0XHRcdFx0dGhpcy5jb21tYW5kVXRpbHMuc2V0KG1lc3NhZ2UuaWQsIG1lc3NhZ2UudXRpbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUHJlVHlwZUluaGliaXRvcnMobWVzc2FnZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcGFyc2VkID0gYXdhaXQgdGhpcy5wYXJzZUNvbW1hbmQobWVzc2FnZSk7XG5cdFx0XHRpZiAoIXBhcnNlZC5jb21tYW5kKSB7XG5cdFx0XHRcdGNvbnN0IG92ZXJQYXJzZWQgPSBhd2FpdCB0aGlzLnBhcnNlQ29tbWFuZE92ZXJ3cml0dGVuUHJlZml4ZXMobWVzc2FnZSk7XG5cdFx0XHRcdGlmIChvdmVyUGFyc2VkLmNvbW1hbmQgfHwgKHBhcnNlZC5wcmVmaXggPT0gbnVsbCAmJiBvdmVyUGFyc2VkLnByZWZpeCAhPSBudWxsKSkge1xuXHRcdFx0XHRcdHBhcnNlZCA9IG92ZXJQYXJzZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWwpIHtcblx0XHRcdFx0bWVzc2FnZS51dGlsLnBhcnNlZCA9IHBhcnNlZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUG9zdFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIGNvbW1hbmQpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgY29udmVydGVkT3B0aW9ucyA9IHt9O1xuXHRcdFx0Zm9yIChjb25zdCBvcHRpb24gb2YgY29tbWFuZC5zbGFzaE9wdGlvbnMpIHtcblx0XHRcdFx0Y29udmVydGVkT3B0aW9uc1tvcHRpb24ubmFtZV0gPSBpbnRlcmFjdGlvbi5vcHRpb25zLmdldChvcHRpb24ubmFtZSwgb3B0aW9uLnJlcXVpcmVkIHx8IGZhbHNlKT8udmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBrZXk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdGlmIChjb21tYW5kLmxvY2spIGtleSA9IGNvbW1hbmQubG9jayhtZXNzYWdlLCBjb252ZXJ0ZWRPcHRpb25zKTtcblx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGtleSkpIGtleSA9IGF3YWl0IGtleTtcblx0XHRcdFx0aWYgKGtleSkge1xuXHRcdFx0XHRcdGlmIChjb21tYW5kLmxvY2tlcj8uaGFzKGtleSkpIHtcblx0XHRcdFx0XHRcdGtleSA9IG51bGw7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9MT0NLRUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbW1hbmQubG9ja2VyPy5hZGQoa2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRpZiAoa2V5KSBjb21tYW5kLmxvY2tlcj8uZGVsZXRlKGtleSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmF1dG9EZWZlciB8fCBjb21tYW5kLnNsYXNoRXBoZW1lcmFsKSB7XG5cdFx0XHRcdGF3YWl0IGludGVyYWN0aW9uLmRlZmVyUmVwbHkoeyBlcGhlbWVyYWw6IGNvbW1hbmQuc2xhc2hFcGhlbWVyYWwgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9TVEFSVEVELCBtZXNzYWdlLCBjb21tYW5kLCBjb252ZXJ0ZWRPcHRpb25zKTtcblx0XHRcdFx0Y29uc3QgcmV0ID1cblx0XHRcdFx0XHRSZWZsZWN0Lm93bktleXMoY29tbWFuZCkuaW5jbHVkZXMoXCJleGVjU2xhc2hcIikgfHwgdGhpcy5leGVjU2xhc2hcblx0XHRcdFx0XHRcdD8gYXdhaXQgY29tbWFuZC5leGVjU2xhc2gobWVzc2FnZSwgY29udmVydGVkT3B0aW9ucylcblx0XHRcdFx0XHRcdDogYXdhaXQgY29tbWFuZC5leGVjKG1lc3NhZ2UgYXMgYW55LCBjb252ZXJ0ZWRPcHRpb25zKTtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX0ZJTklTSEVELCBtZXNzYWdlLCBjb21tYW5kLCBjb252ZXJ0ZWRPcHRpb25zLCByZXQpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfRVJST1IsIGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIEhhbmRsZXMgbm9ybWFsIGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gY29udGVudCAtIENvbnRlbnQgb2YgbWVzc2FnZSB3aXRob3V0IGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCBpbnN0YW5jZS5cblx0ICogQHBhcmFtIGlnbm9yZSAtIElnbm9yZSBpbmhpYml0b3JzIGFuZCBvdGhlciBjaGVja3MuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlRGlyZWN0Q29tbWFuZChcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdGNvbnRlbnQ6IHN0cmluZyxcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdGlnbm9yZTogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcblx0XHRsZXQga2V5O1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoIWlnbm9yZSkge1xuXHRcdFx0XHRpZiAobWVzc2FnZS5lZGl0ZWRUaW1lc3RhbXAgJiYgIWNvbW1hbmQuZWRpdGFibGUpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUG9zdFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIGNvbW1hbmQpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBiZWZvcmUgPSBjb21tYW5kLmJlZm9yZShtZXNzYWdlKTtcblx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShiZWZvcmUpKSBhd2FpdCBiZWZvcmU7XG5cblx0XHRcdGNvbnN0IGFyZ3MgPSBhd2FpdCBjb21tYW5kLnBhcnNlKG1lc3NhZ2UsIGNvbnRlbnQpO1xuXHRcdFx0aWYgKEZsYWcuaXMoYXJncywgXCJjYW5jZWxcIikpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfQ0FOQ0VMTEVELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKEZsYWcuaXMoYXJncywgXCJyZXRyeVwiKSkge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9CUkVBS09VVCwgbWVzc2FnZSwgY29tbWFuZCwgYXJncy5tZXNzYWdlKTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuaGFuZGxlKGFyZ3MubWVzc2FnZSk7XG5cdFx0XHR9IGVsc2UgaWYgKEZsYWcuaXMoYXJncywgXCJjb250aW51ZVwiKSkge1xuXHRcdFx0XHRjb25zdCBjb250aW51ZUNvbW1hbmQgPSB0aGlzLm1vZHVsZXMuZ2V0KGFyZ3MuY29tbWFuZCk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmhhbmRsZURpcmVjdENvbW1hbmQobWVzc2FnZSwgYXJncy5yZXN0LCBjb250aW51ZUNvbW1hbmQsIGFyZ3MuaWdub3JlKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFpZ25vcmUpIHtcblx0XHRcdFx0aWYgKGNvbW1hbmQubG9jaykga2V5ID0gKGNvbW1hbmQubG9jayBhcyBLZXlTdXBwbGllcikobWVzc2FnZSwgYXJncyk7XG5cdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShrZXkpKSBrZXkgPSBhd2FpdCBrZXk7XG5cdFx0XHRcdGlmIChrZXkpIHtcblx0XHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrZXI/LmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0XHRrZXkgPSBudWxsO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfTE9DS0VELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbW1hbmQubG9ja2VyPy5hZGQoa2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCB0aGlzLnJ1bkNvbW1hbmQobWVzc2FnZSwgY29tbWFuZCwgYXJncyk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aWYgKGtleSkgY29tbWFuZC5sb2NrZXI/LmRlbGV0ZShrZXkpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHJlZ2V4IGFuZCBjb25kaXRpb25hbCBjb21tYW5kcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBoYW5kbGVSZWdleEFuZENvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZTogTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHJhbjEgPSBhd2FpdCB0aGlzLmhhbmRsZVJlZ2V4Q29tbWFuZHMobWVzc2FnZSk7XG5cdFx0Y29uc3QgcmFuMiA9IGF3YWl0IHRoaXMuaGFuZGxlQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlKTtcblx0XHRyZXR1cm4gcmFuMSB8fCByYW4yO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgcmVnZXggY29tbWFuZHMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlUmVnZXhDb21tYW5kcyhtZXNzYWdlOiBNZXNzYWdlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgaGFzUmVnZXhDb21tYW5kcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgY29tbWFuZCBvZiB0aGlzLm1vZHVsZXMudmFsdWVzKCkpIHtcblx0XHRcdGlmIChtZXNzYWdlLmVkaXRlZFRpbWVzdGFtcCA/IGNvbW1hbmQuZWRpdGFibGUgOiB0cnVlKSB7XG5cdFx0XHRcdGNvbnN0IHJlZ2V4ID0gdHlwZW9mIGNvbW1hbmQucmVnZXggPT09IFwiZnVuY3Rpb25cIiA/IGNvbW1hbmQucmVnZXgobWVzc2FnZSkgOiBjb21tYW5kLnJlZ2V4O1xuXHRcdFx0XHRpZiAocmVnZXgpIGhhc1JlZ2V4Q29tbWFuZHMucHVzaCh7IGNvbW1hbmQsIHJlZ2V4IH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IG1hdGNoZWRDb21tYW5kcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgaGFzUmVnZXhDb21tYW5kcykge1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSBtZXNzYWdlLmNvbnRlbnQubWF0Y2goZW50cnkucmVnZXgpO1xuXHRcdFx0aWYgKCFtYXRjaCkgY29udGludWU7XG5cblx0XHRcdGNvbnN0IG1hdGNoZXMgPSBbXTtcblxuXHRcdFx0aWYgKGVudHJ5LnJlZ2V4Lmdsb2JhbCkge1xuXHRcdFx0XHRsZXQgbWF0Y2hlZDtcblxuXHRcdFx0XHR3aGlsZSAoKG1hdGNoZWQgPSBlbnRyeS5yZWdleC5leGVjKG1lc3NhZ2UuY29udGVudCkpICE9IG51bGwpIHtcblx0XHRcdFx0XHRtYXRjaGVzLnB1c2gobWF0Y2hlZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bWF0Y2hlZENvbW1hbmRzLnB1c2goeyBjb21tYW5kOiBlbnRyeS5jb21tYW5kLCBtYXRjaCwgbWF0Y2hlcyB9KTtcblx0XHR9XG5cblx0XHRpZiAoIW1hdGNoZWRDb21tYW5kcy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBwcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgeyBjb21tYW5kLCBtYXRjaCwgbWF0Y2hlcyB9IG9mIG1hdGNoZWRDb21tYW5kcykge1xuXHRcdFx0cHJvbWlzZXMucHVzaChcblx0XHRcdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUG9zdFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIGNvbW1hbmQpKSByZXR1cm47XG5cblx0XHRcdFx0XHRcdGNvbnN0IGJlZm9yZSA9IGNvbW1hbmQuYmVmb3JlKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGJlZm9yZSkpIGF3YWl0IGJlZm9yZTtcblxuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5ydW5Db21tYW5kKG1lc3NhZ2UsIGNvbW1hbmQsIHsgbWF0Y2gsIG1hdGNoZXMgfSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBjb25kaXRpb25hbCBjb21tYW5kcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBoYW5kbGVDb25kaXRpb25hbENvbW1hbmRzKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCB0cnVlQ29tbWFuZHMgPSBbXTtcblxuXHRcdGNvbnN0IGZpbHRlclByb21pc2VzID0gW107XG5cdFx0Zm9yIChjb25zdCBjb21tYW5kIG9mIHRoaXMubW9kdWxlcy52YWx1ZXMoKSkge1xuXHRcdFx0aWYgKG1lc3NhZ2UuZWRpdGVkVGltZXN0YW1wICYmICFjb21tYW5kLmVkaXRhYmxlKSBjb250aW51ZTtcblx0XHRcdGZpbHRlclByb21pc2VzLnB1c2goXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0bGV0IGNvbmQgPSBjb21tYW5kLmNvbmRpdGlvbihtZXNzYWdlKTtcblx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoY29uZCkpIGNvbmQgPSBhd2FpdCBjb25kO1xuXHRcdFx0XHRcdGlmIChjb25kKSB0cnVlQ29tbWFuZHMucHVzaChjb21tYW5kKTtcblx0XHRcdFx0fSkoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChmaWx0ZXJQcm9taXNlcyk7XG5cblx0XHRpZiAoIXRydWVDb21tYW5kcy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBwcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgY29tbWFuZCBvZiB0cnVlQ29tbWFuZHMpIHtcblx0XHRcdHByb21pc2VzLnB1c2goXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkgcmV0dXJuO1xuXHRcdFx0XHRcdFx0Y29uc3QgYmVmb3JlID0gY29tbWFuZC5iZWZvcmUobWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoYmVmb3JlKSkgYXdhaXQgYmVmb3JlO1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5ydW5Db21tYW5kKG1lc3NhZ2UsIGNvbW1hbmQsIHt9KTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSgpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGluaGliaXRvcnMgd2l0aCB0aGUgYWxsIHR5cGUuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBzbGFzaCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIHNob3VsZCBpcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuQWxsVHlwZUluaGliaXRvcnMobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsIHNsYXNoOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCByZWFzb24gPSB0aGlzLmluaGliaXRvckhhbmRsZXIgPyBhd2FpdCB0aGlzLmluaGliaXRvckhhbmRsZXIudGVzdChcImFsbFwiLCBtZXNzYWdlKSA6IG51bGw7XG5cblx0XHRpZiAocmVhc29uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIHJlYXNvbik7XG5cdFx0fSBlbHNlIGlmICghbWVzc2FnZS5hdXRob3IpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIEJ1aWx0SW5SZWFzb25zLkFVVEhPUl9OT1RfRk9VTkQpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5ibG9ja0NsaWVudCAmJiBtZXNzYWdlLmF1dGhvci5pZCA9PT0gdGhpcy5jbGllbnQudXNlcj8uaWQpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIEJ1aWx0SW5SZWFzb25zLkNMSUVOVCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLmJsb2NrQm90cyAmJiBtZXNzYWdlLmF1dGhvci5ib3QpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIEJ1aWx0SW5SZWFzb25zLkJPVCk7XG5cdFx0fSBlbHNlIGlmICghc2xhc2ggJiYgdGhpcy5oYXNQcm9tcHQobWVzc2FnZS5jaGFubmVsLCBtZXNzYWdlLmF1dGhvcikpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5JTl9QUk9NUFQsIG1lc3NhZ2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBpbmhpYml0b3JzIHdpdGggdGhlIHByZSB0eXBlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1blByZVR5cGVJbmhpYml0b3JzKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgcmVhc29uID0gdGhpcy5pbmhpYml0b3JIYW5kbGVyID8gYXdhaXQgdGhpcy5pbmhpYml0b3JIYW5kbGVyLnRlc3QoXCJwcmVcIiwgbWVzc2FnZSkgOiBudWxsO1xuXG5cdFx0aWYgKHJlYXNvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCByZWFzb24pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBpbmhpYml0b3JzIHdpdGggdGhlIHBvc3QgdHlwZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIHNsYXNoIC0gV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgc2hvdWxkIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW5Qb3N0VHlwZUluaGliaXRvcnMoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsXG5cdFx0Y29tbWFuZDogQ29tbWFuZCxcblx0XHRzbGFzaDogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IGV2ZW50ID0gc2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9CTE9DS0VEIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9CTE9DS0VEO1xuXG5cdFx0aWYgKCF0aGlzLnNraXBCdWlsdEluUG9zdEluaGliaXRvcnMpIHtcblx0XHRcdGlmIChjb21tYW5kLm93bmVyT25seSkge1xuXHRcdFx0XHRjb25zdCBpc093bmVyID0gdGhpcy5jbGllbnQuaXNPd25lcihtZXNzYWdlLmF1dGhvcik7XG5cdFx0XHRcdGlmICghaXNPd25lcikge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuT1dORVIpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb21tYW5kLnN1cGVyVXNlck9ubHkpIHtcblx0XHRcdFx0Y29uc3QgaXNTdXBlclVzZXIgPSB0aGlzLmNsaWVudC5pc1N1cGVyVXNlcihtZXNzYWdlLmF1dGhvcik7XG5cdFx0XHRcdGlmICghaXNTdXBlclVzZXIpIHtcblx0XHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLlNVUEVSX1VTRVIpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb21tYW5kLmNoYW5uZWwgPT09IFwiZ3VpbGRcIiAmJiAhbWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLkdVSUxEKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb21tYW5kLmNoYW5uZWwgPT09IFwiZG1cIiAmJiBtZXNzYWdlLmd1aWxkKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuRE0pO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbW1hbmQub25seU5zZncgJiYgIW1lc3NhZ2UuY2hhbm5lbFtcIm5zZndcIl0pIHtcblx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5OT1RfTlNGVyk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5za2lwQnVpbHRJblBvc3RJbmhpYml0b3JzKSB7XG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5QZXJtaXNzaW9uQ2hlY2tzKG1lc3NhZ2UsIGNvbW1hbmQsIHNsYXNoKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCByZWFzb24gPSB0aGlzLmluaGliaXRvckhhbmRsZXIgPyBhd2FpdCB0aGlzLmluaGliaXRvckhhbmRsZXIudGVzdChcInBvc3RcIiwgbWVzc2FnZSwgY29tbWFuZCkgOiBudWxsO1xuXG5cdFx0aWYgKHRoaXMuc2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycykge1xuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUGVybWlzc2lvbkNoZWNrcyhtZXNzYWdlLCBjb21tYW5kLCBzbGFzaCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHJlYXNvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIHJlYXNvbik7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5ydW5Db29sZG93bnMobWVzc2FnZSwgY29tbWFuZCkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIHBlcm1pc3Npb24gY2hlY2tzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBjb29sZG93bi5cblx0ICogQHBhcmFtIHNsYXNoIC0gV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1blBlcm1pc3Npb25DaGVja3MoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsXG5cdFx0Y29tbWFuZDogQ29tbWFuZCxcblx0XHRzbGFzaDogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGlmIChjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNvbW1hbmQuY2xpZW50UGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdGxldCBtaXNzaW5nID0gY29tbWFuZC5jbGllbnRQZXJtaXNzaW9ucyhtZXNzYWdlKTtcblx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKG1pc3NpbmcpKSBtaXNzaW5nID0gYXdhaXQgbWlzc2luZztcblxuXHRcdFx0XHRpZiAobWlzc2luZyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KFxuXHRcdFx0XHRcdFx0c2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdFx0XCJjbGllbnRcIixcblx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0aWYgKG1lc3NhZ2UuY2hhbm5lbD8udHlwZSA9PT0gXCJETVwiKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGNvbnN0IG1pc3NpbmcgPSBtZXNzYWdlLmNoYW5uZWw/LnBlcm1pc3Npb25zRm9yKG1lc3NhZ2UuZ3VpbGQubWUpPy5taXNzaW5nKGNvbW1hbmQuY2xpZW50UGVybWlzc2lvbnMpO1xuXHRcdFx0XHRpZiAobWlzc2luZz8ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KFxuXHRcdFx0XHRcdFx0c2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdFx0XCJjbGllbnRcIixcblx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNvbW1hbmQudXNlclBlcm1pc3Npb25zKSB7XG5cdFx0XHRjb25zdCBpZ25vcmVyID0gY29tbWFuZC5pZ25vcmVQZXJtaXNzaW9ucyB8fCB0aGlzLmlnbm9yZVBlcm1pc3Npb25zO1xuXHRcdFx0Y29uc3QgaXNJZ25vcmVkID0gQXJyYXkuaXNBcnJheShpZ25vcmVyKVxuXHRcdFx0XHQ/IGlnbm9yZXIuaW5jbHVkZXMobWVzc2FnZS5hdXRob3IuaWQpXG5cdFx0XHRcdDogdHlwZW9mIGlnbm9yZXIgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0XHQ/IGlnbm9yZXIobWVzc2FnZSwgY29tbWFuZClcblx0XHRcdFx0OiBtZXNzYWdlLmF1dGhvci5pZCA9PT0gaWdub3JlcjtcblxuXHRcdFx0aWYgKCFpc0lnbm9yZWQpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBjb21tYW5kLnVzZXJQZXJtaXNzaW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdGxldCBtaXNzaW5nID0gY29tbWFuZC51c2VyUGVybWlzc2lvbnMobWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKG1pc3NpbmcpKSBtaXNzaW5nID0gYXdhaXQgbWlzc2luZztcblxuXHRcdFx0XHRcdGlmIChtaXNzaW5nICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdFx0c2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFx0XCJ1c2VyXCIsXG5cdFx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAobWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLmNoYW5uZWw/LnR5cGUgPT09IFwiRE1cIikgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdGNvbnN0IG1pc3NpbmcgPSBtZXNzYWdlLmNoYW5uZWw/LnBlcm1pc3Npb25zRm9yKG1lc3NhZ2UuYXV0aG9yKT8ubWlzc2luZyhjb21tYW5kLnVzZXJQZXJtaXNzaW9ucyk7XG5cdFx0XHRcdFx0aWYgKG1pc3Npbmc/Lmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFxuXHRcdFx0XHRcdFx0XHRzbGFzaCA/IENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX01JU1NJTkdfUEVSTUlTU0lPTlMgOiBDb21tYW5kSGFuZGxlckV2ZW50cy5NSVNTSU5HX1BFUk1JU1NJT05TLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdFx0XHRcInVzZXJcIixcblx0XHRcdFx0XHRcdFx0bWlzc2luZ1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGNvb2xkb3ducyBhbmQgY2hlY2tzIGlmIGEgdXNlciBpcyB1bmRlciBjb29sZG93bi5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gY29vbGRvd24uXG5cdCAqL1xuXHRwdWJsaWMgcnVuQ29vbGRvd25zKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLCBjb21tYW5kOiBDb21tYW5kKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgaWQgPSBtZXNzYWdlLmF1dGhvcj8uaWQ7XG5cdFx0Y29uc3QgaWdub3JlciA9IGNvbW1hbmQuaWdub3JlQ29vbGRvd24gfHwgdGhpcy5pZ25vcmVDb29sZG93bjtcblx0XHRjb25zdCBpc0lnbm9yZWQgPSBBcnJheS5pc0FycmF5KGlnbm9yZXIpXG5cdFx0XHQ/IGlnbm9yZXIuaW5jbHVkZXMoaWQpXG5cdFx0XHQ6IHR5cGVvZiBpZ25vcmVyID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdD8gaWdub3JlcihtZXNzYWdlLCBjb21tYW5kKVxuXHRcdFx0OiBpZCA9PT0gaWdub3JlcjtcblxuXHRcdGlmIChpc0lnbm9yZWQpIHJldHVybiBmYWxzZTtcblxuXHRcdGNvbnN0IHRpbWUgPSBjb21tYW5kLmNvb2xkb3duICE9IG51bGwgPyBjb21tYW5kLmNvb2xkb3duIDogdGhpcy5kZWZhdWx0Q29vbGRvd247XG5cdFx0aWYgKCF0aW1lKSByZXR1cm4gZmFsc2U7XG5cblx0XHRjb25zdCBlbmRUaW1lID0gbWVzc2FnZS5jcmVhdGVkVGltZXN0YW1wICsgdGltZTtcblxuXHRcdGlmICghdGhpcy5jb29sZG93bnMuaGFzKGlkKSkgdGhpcy5jb29sZG93bnMuc2V0KGlkLCB7fSk7XG5cblx0XHRpZiAoIXRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF0pIHtcblx0XHRcdHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF0gPSB7XG5cdFx0XHRcdHRpbWVyOiBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXSkge1xuXHRcdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF0udGltZXIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdID0gbnVsbDtcblxuXHRcdFx0XHRcdGlmICghT2JqZWN0LmtleXModGhpcy5jb29sZG93bnMuZ2V0KGlkKSkubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmNvb2xkb3ducy5kZWxldGUoaWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgdGltZSkudW5yZWYoKSxcblx0XHRcdFx0ZW5kOiBlbmRUaW1lLFxuXHRcdFx0XHR1c2VzOiAwXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGNvbnN0IGVudHJ5ID0gdGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXTtcblxuXHRcdGlmIChlbnRyeS51c2VzID49IGNvbW1hbmQucmF0ZWxpbWl0KSB7XG5cdFx0XHRjb25zdCBlbmQgPSB0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdLmVuZDtcblx0XHRcdGNvbnN0IGRpZmYgPSBlbmQgLSBtZXNzYWdlLmNyZWF0ZWRUaW1lc3RhbXA7XG5cblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT09MRE9XTiwgbWVzc2FnZSwgY29tbWFuZCwgZGlmZik7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRlbnRyeS51c2VzKys7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gYXJncyAtIEFyZ3VtZW50cyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuQ29tbWFuZChtZXNzYWdlOiBNZXNzYWdlLCBjb21tYW5kOiBDb21tYW5kLCBhcmdzOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIWNvbW1hbmQgfHwgIW1lc3NhZ2UpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0lOVkFMSUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoY29tbWFuZC50eXBpbmcgfHwgdGhpcy50eXBpbmcpIHtcblx0XHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kVHlwaW5nKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfU1RBUlRFRCwgbWVzc2FnZSwgY29tbWFuZCwgYXJncyk7XG5cdFx0Y29uc3QgcmV0ID0gYXdhaXQgY29tbWFuZC5leGVjKG1lc3NhZ2UsIGFyZ3MpO1xuXHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0ZJTklTSEVELCBtZXNzYWdlLCBjb21tYW5kLCBhcmdzLCByZXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgY29tbWFuZCBhbmQgaXRzIGFyZ3VtZW50IGxpc3QuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBwYXJzZUNvbW1hbmQobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UpOiBQcm9taXNlPFBhcnNlZENvbXBvbmVudERhdGE+IHtcblx0XHRjb25zdCBhbGxvd01lbnRpb24gPSBhd2FpdCBVdGlsLmludG9DYWxsYWJsZSh0aGlzLnByZWZpeCkobWVzc2FnZSk7XG5cdFx0bGV0IHByZWZpeGVzID0gVXRpbC5pbnRvQXJyYXkoYWxsb3dNZW50aW9uKTtcblx0XHRpZiAoYWxsb3dNZW50aW9uKSB7XG5cdFx0XHRjb25zdCBtZW50aW9ucyA9IFtgPEAke3RoaXMuY2xpZW50LnVzZXI/LmlkfT5gLCBgPEAhJHt0aGlzLmNsaWVudC51c2VyPy5pZH0+YF07XG5cdFx0XHRwcmVmaXhlcyA9IFsuLi5tZW50aW9ucywgLi4ucHJlZml4ZXNdO1xuXHRcdH1cblxuXHRcdHByZWZpeGVzLnNvcnQoVXRpbC5wcmVmaXhDb21wYXJlKTtcblx0XHRyZXR1cm4gdGhpcy5wYXJzZU11bHRpcGxlUHJlZml4ZXMoXG5cdFx0XHRtZXNzYWdlLFxuXHRcdFx0cHJlZml4ZXMubWFwKHAgPT4gW3AsIG51bGxdKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBjb21tYW5kIGFuZCBpdHMgYXJndW1lbnQgbGlzdCB1c2luZyBwcmVmaXggb3ZlcndyaXRlcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHBhcnNlQ29tbWFuZE92ZXJ3cml0dGVuUHJlZml4ZXMobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UpOiBQcm9taXNlPFBhcnNlZENvbXBvbmVudERhdGE+IHtcblx0XHRpZiAoIXRoaXMucHJlZml4ZXMuc2l6ZSkge1xuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblxuXHRcdGNvbnN0IHByb21pc2VzID0gdGhpcy5wcmVmaXhlcy5tYXAoYXN5bmMgKGNtZHMsIHByb3ZpZGVyKSA9PiB7XG5cdFx0XHRjb25zdCBwcmVmaXhlcyA9IFV0aWwuaW50b0FycmF5KGF3YWl0IFV0aWwuaW50b0NhbGxhYmxlKHByb3ZpZGVyKShtZXNzYWdlKSk7XG5cdFx0XHRyZXR1cm4gcHJlZml4ZXMubWFwKHAgPT4gW3AsIGNtZHNdKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IHBhaXJzID0gVXRpbC5mbGF0TWFwKGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKSwgeCA9PiB4KTtcblx0XHRwYWlycy5zb3J0KChbYV0sIFtiXSkgPT4gVXRpbC5wcmVmaXhDb21wYXJlKGEsIGIpKTtcblx0XHRyZXR1cm4gdGhpcy5wYXJzZU11bHRpcGxlUHJlZml4ZXMobWVzc2FnZSwgcGFpcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgcGFyc2VXaXRoUHJlZml4IG9uIG11bHRpcGxlIHByZWZpeGVzIGFuZCByZXR1cm5zIHRoZSBiZXN0IHBhcnNlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gcGFyc2UuXG5cdCAqIEBwYXJhbSBwYWlycyAtIFBhaXJzIG9mIHByZWZpeCB0byBhc3NvY2lhdGVkIGNvbW1hbmRzLiBUaGF0IGlzLCBgW3N0cmluZywgU2V0PHN0cmluZz4gfCBudWxsXVtdYC5cblx0ICovXG5cdHB1YmxpYyBwYXJzZU11bHRpcGxlUHJlZml4ZXMoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsXG5cdFx0cGFpcnM6IFtzdHJpbmcsIFNldDxzdHJpbmc+IHwgbnVsbF1bXVxuXHQpOiBQYXJzZWRDb21wb25lbnREYXRhIHtcblx0XHRjb25zdCBwYXJzZXMgPSBwYWlycy5tYXAoKFtwcmVmaXgsIGNtZHNdKSA9PiB0aGlzLnBhcnNlV2l0aFByZWZpeChtZXNzYWdlLCBwcmVmaXgsIGNtZHMpKTtcblx0XHRjb25zdCByZXN1bHQgPSBwYXJzZXMuZmluZChwYXJzZWQgPT4gcGFyc2VkLmNvbW1hbmQpO1xuXHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZ3Vlc3MgPSBwYXJzZXMuZmluZChwYXJzZWQgPT4gcGFyc2VkLnByZWZpeCAhPSBudWxsKTtcblx0XHRpZiAoZ3Vlc3MpIHtcblx0XHRcdHJldHVybiBndWVzcztcblx0XHR9XG5cblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHQvKipcblx0ICogVHJpZXMgdG8gcGFyc2UgYSBtZXNzYWdlIHdpdGggdGhlIGdpdmVuIHByZWZpeCBhbmQgYXNzb2NpYXRlZCBjb21tYW5kcy5cblx0ICogQXNzb2NpYXRlZCBjb21tYW5kcyByZWZlciB0byB3aGVuIGEgcHJlZml4IGlzIHVzZWQgaW4gcHJlZml4IG92ZXJyaWRlcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHBhcnNlLlxuXHQgKiBAcGFyYW0gcHJlZml4IC0gUHJlZml4IHRvIHVzZS5cblx0ICogQHBhcmFtIGFzc29jaWF0ZWRDb21tYW5kcyAtIEFzc29jaWF0ZWQgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VXaXRoUHJlZml4KFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdHByZWZpeDogc3RyaW5nLFxuXHRcdGFzc29jaWF0ZWRDb21tYW5kczogU2V0PHN0cmluZz4gfCBudWxsID0gbnVsbFxuXHQpOiBQYXJzZWRDb21wb25lbnREYXRhIHtcblx0XHRjb25zdCBsb3dlckNvbnRlbnQgPSBtZXNzYWdlLmNvbnRlbnQudG9Mb3dlckNhc2UoKTtcblx0XHRpZiAoIWxvd2VyQ29udGVudC5zdGFydHNXaXRoKHByZWZpeC50b0xvd2VyQ2FzZSgpKSkge1xuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblxuXHRcdGNvbnN0IGVuZE9mUHJlZml4ID0gbG93ZXJDb250ZW50LmluZGV4T2YocHJlZml4LnRvTG93ZXJDYXNlKCkpICsgcHJlZml4Lmxlbmd0aDtcblx0XHRjb25zdCBzdGFydE9mQXJncyA9IG1lc3NhZ2UuY29udGVudC5zbGljZShlbmRPZlByZWZpeCkuc2VhcmNoKC9cXFMvKSArIHByZWZpeC5sZW5ndGg7XG5cdFx0Y29uc3QgYWxpYXMgPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2Uoc3RhcnRPZkFyZ3MpLnNwbGl0KC9cXHN7MSx9fFxcbnsxLH0vKVswXTtcblx0XHRjb25zdCBjb21tYW5kID0gdGhpcy5maW5kQ29tbWFuZChhbGlhcyk7XG5cdFx0Y29uc3QgY29udGVudCA9IG1lc3NhZ2UuY29udGVudC5zbGljZShzdGFydE9mQXJncyArIGFsaWFzLmxlbmd0aCArIDEpLnRyaW0oKTtcblx0XHRjb25zdCBhZnRlclByZWZpeCA9IG1lc3NhZ2UuY29udGVudC5zbGljZShwcmVmaXgubGVuZ3RoKS50cmltKCk7XG5cblx0XHRpZiAoIWNvbW1hbmQpIHtcblx0XHRcdHJldHVybiB7IHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdFx0fVxuXG5cdFx0aWYgKGFzc29jaWF0ZWRDb21tYW5kcyA9PSBudWxsKSB7XG5cdFx0XHRpZiAoY29tbWFuZC5wcmVmaXggIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4geyBwcmVmaXgsIGFsaWFzLCBjb250ZW50LCBhZnRlclByZWZpeCB9O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIWFzc29jaWF0ZWRDb21tYW5kcy5oYXMoY29tbWFuZC5pZCkpIHtcblx0XHRcdHJldHVybiB7IHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgY29tbWFuZCwgcHJlZml4LCBhbGlhcywgY29udGVudCwgYWZ0ZXJQcmVmaXggfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGVycm9ycyBmcm9tIHRoZSBoYW5kbGluZy5cblx0ICogQHBhcmFtIGVyciAtIFRoZSBlcnJvci5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdGhhdCBlcnJvcmVkLlxuXHQgKi9cblx0cHVibGljIGVtaXRFcnJvcihlcnI6IEVycm9yLCBtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSwgY29tbWFuZD86IENvbW1hbmQgfCBBa2Fpcm9Nb2R1bGUpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5saXN0ZW5lckNvdW50KENvbW1hbmRIYW5kbGVyRXZlbnRzLkVSUk9SKSkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkVSUk9SLCBlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRocm93IGVycjtcblx0fVxuXG5cdC8qKlxuXHQgKiBTd2VlcCBjb21tYW5kIHV0aWwgaW5zdGFuY2VzIGZyb20gY2FjaGUgYW5kIHJldHVybnMgYW1vdW50IHN3ZWVwZWQuXG5cdCAqIEBwYXJhbSBsaWZldGltZSAtIE1lc3NhZ2VzIG9sZGVyIHRoYW4gdGhpcyB3aWxsIGhhdmUgdGhlaXIgY29tbWFuZCB1dGlsIGluc3RhbmNlIHN3ZWVwZWQuIFRoaXMgaXMgaW4gbWlsbGlzZWNvbmRzIGFuZCBkZWZhdWx0cyB0byB0aGUgYGNvbW1hbmRVdGlsTGlmZXRpbWVgIG9wdGlvbi5cblx0ICovXG5cdHB1YmxpYyBzd2VlcENvbW1hbmRVdGlsKGxpZmV0aW1lOiBudW1iZXIgPSB0aGlzLmNvbW1hbmRVdGlsTGlmZXRpbWUpOiBudW1iZXIge1xuXHRcdGxldCBjb3VudCA9IDA7XG5cdFx0Zm9yIChjb25zdCBjb21tYW5kVXRpbCBvZiB0aGlzLmNvbW1hbmRVdGlscy52YWx1ZXMoKSkge1xuXHRcdFx0Y29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBjb21tYW5kVXRpbC5tZXNzYWdlO1xuXHRcdFx0aWYgKG5vdyAtICgobWVzc2FnZSBhcyBNZXNzYWdlKS5lZGl0ZWRUaW1lc3RhbXAgfHwgbWVzc2FnZS5jcmVhdGVkVGltZXN0YW1wKSA+IGxpZmV0aW1lKSB7XG5cdFx0XHRcdGNvdW50Kys7XG5cdFx0XHRcdHRoaXMuY29tbWFuZFV0aWxzLmRlbGV0ZShtZXNzYWdlLmlkKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gY291bnQ7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhbiBvbmdvaW5nIHByb21wdCBpbiBvcmRlciB0byBwcmV2ZW50IGNvbW1hbmQgdXNhZ2UgaW4gdGhlIGNoYW5uZWwuXG5cdCAqIEBwYXJhbSBjaGFubmVsIC0gQ2hhbm5lbCB0byBhZGQgdG8uXG5cdCAqIEBwYXJhbSB1c2VyIC0gVXNlciB0byBhZGQuXG5cdCAqL1xuXHRwdWJsaWMgYWRkUHJvbXB0KGNoYW5uZWw6IFRleHRCYXNlZENoYW5uZWxzLCB1c2VyOiBVc2VyKTogdm9pZCB7XG5cdFx0bGV0IHVzZXJzID0gdGhpcy5wcm9tcHRzLmdldChjaGFubmVsLmlkKTtcblx0XHRpZiAoIXVzZXJzKSB0aGlzLnByb21wdHMuc2V0KGNoYW5uZWwuaWQsIG5ldyBTZXQoKSk7XG5cdFx0dXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdHVzZXJzPy5hZGQodXNlci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbiBvbmdvaW5nIHByb21wdC5cblx0ICogQHBhcmFtIGNoYW5uZWwgLSBDaGFubmVsIHRvIHJlbW92ZSBmcm9tLlxuXHQgKiBAcGFyYW0gdXNlciAtIFVzZXIgdG8gcmVtb3ZlLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZVByb21wdChjaGFubmVsOiBUZXh0QmFzZWRDaGFubmVscywgdXNlcjogVXNlcik6IHZvaWQge1xuXHRcdGNvbnN0IHVzZXJzID0gdGhpcy5wcm9tcHRzLmdldChjaGFubmVsLmlkKTtcblx0XHRpZiAoIXVzZXJzKSByZXR1cm47XG5cdFx0dXNlcnMuZGVsZXRlKHVzZXIuaWQpO1xuXHRcdGlmICghdXNlcnMuc2l6ZSkgdGhpcy5wcm9tcHRzLmRlbGV0ZSh1c2VyLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlcmUgaXMgYW4gb25nb2luZyBwcm9tcHQuXG5cdCAqIEBwYXJhbSBjaGFubmVsIC0gQ2hhbm5lbCB0byBjaGVjay5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIGNoZWNrLlxuXHQgKi9cblx0cHVibGljIGhhc1Byb21wdChjaGFubmVsOiBUZXh0QmFzZWRDaGFubmVscywgdXNlcjogVXNlcik6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHVzZXJzID0gdGhpcy5wcm9tcHRzLmdldChjaGFubmVsLmlkKTtcblx0XHRpZiAoIXVzZXJzKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIHVzZXJzLmhhcyh1c2VyLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNvbW1hbmQgYnkgYWxpYXMuXG5cdCAqIEBwYXJhbSBuYW1lIC0gQWxpYXMgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIGZpbmRDb21tYW5kKG5hbWU6IHN0cmluZyk6IENvbW1hbmQge1xuXHRcdHJldHVybiB0aGlzLm1vZHVsZXMuZ2V0KHRoaXMuYWxpYXNlcy5nZXQobmFtZS50b0xvd2VyQ2FzZSgpKSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBpbmhpYml0b3IgaGFuZGxlciB0byB1c2UuXG5cdCAqIEBwYXJhbSBpbmhpYml0b3JIYW5kbGVyIC0gVGhlIGluaGliaXRvciBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIHVzZUluaGliaXRvckhhbmRsZXIoaW5oaWJpdG9ySGFuZGxlcjogSW5oaWJpdG9ySGFuZGxlcik6IENvbW1hbmRIYW5kbGVyIHtcblx0XHR0aGlzLmluaGliaXRvckhhbmRsZXIgPSBpbmhpYml0b3JIYW5kbGVyO1xuXHRcdHRoaXMucmVzb2x2ZXIuaW5oaWJpdG9ySGFuZGxlciA9IGluaGliaXRvckhhbmRsZXI7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGxpc3RlbmVyIGhhbmRsZXIgdG8gdXNlLlxuXHQgKiBAcGFyYW0gbGlzdGVuZXJIYW5kbGVyIC0gVGhlIGxpc3RlbmVyIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgdXNlTGlzdGVuZXJIYW5kbGVyKGxpc3RlbmVySGFuZGxlcjogTGlzdGVuZXJIYW5kbGVyKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHRoaXMucmVzb2x2ZXIubGlzdGVuZXJIYW5kbGVyID0gbGlzdGVuZXJIYW5kbGVyO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gdGhpbmcgLSBNb2R1bGUgb3IgcGF0aCB0byBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZCh0aGluZzogc3RyaW5nIHwgQ29tbWFuZCk6IENvbW1hbmQge1xuXHRcdHJldHVybiBzdXBlci5sb2FkKHRoaW5nKSBhcyBDb21tYW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlYWRzIGFsbCBjb21tYW5kcyBmcm9tIHRoZSBkaXJlY3RvcnkgYW5kIGxvYWRzIHRoZW0uXG5cdCAqIEBwYXJhbSBkaXJlY3RvcnkgLSBEaXJlY3RvcnkgdG8gbG9hZCBmcm9tLiBEZWZhdWx0cyB0byB0aGUgZGlyZWN0b3J5IHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqIEBwYXJhbSBmaWx0ZXIgLSBGaWx0ZXIgZm9yIGZpbGVzLCB3aGVyZSB0cnVlIG1lYW5zIGl0IHNob3VsZCBiZSBsb2FkZWQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgbG9hZEFsbChkaXJlY3Rvcnk/OiBzdHJpbmcsIGZpbHRlcj86IExvYWRQcmVkaWNhdGUpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWRBbGwoZGlyZWN0b3J5LCBmaWx0ZXIpIGFzIENvbW1hbmRIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmUoaWQ6IHN0cmluZyk6IENvbW1hbmQge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmUoaWQpIGFzIENvbW1hbmQ7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlQWxsKCk6IENvbW1hbmRIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlQWxsKCkgYXMgQ29tbWFuZEhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZChpZDogc3RyaW5nKTogQ29tbWFuZCB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZChpZCkgYXMgQ29tbWFuZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWRBbGwoKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWRBbGwoKSBhcyBDb21tYW5kSGFuZGxlcjtcblx0fVxuXG5cdHB1YmxpYyBvdmVycmlkZSBvbjxLIGV4dGVuZHMga2V5b2YgQ29tbWFuZEhhbmRsZXJFdmVudHNUeXBlPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IENvbW1hbmRIYW5kbGVyRXZlbnRzVHlwZVtLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbihldmVudCwgbGlzdGVuZXIpO1xuXHR9XG5cdHB1YmxpYyBvdmVycmlkZSBvbmNlPEsgZXh0ZW5kcyBrZXlvZiBDb21tYW5kSGFuZGxlckV2ZW50c1R5cGU+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogQ29tbWFuZEhhbmRsZXJFdmVudHNUeXBlW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uY2UoZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRIYW5kbGVyT3B0aW9ucyBleHRlbmRzIEFrYWlyb0hhbmRsZXJPcHRpb25zIHtcblx0LyoqXG5cdCAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBhdXRvbWF0aWNhbGx5IG1ha2UgY29tbWFuZCBhbGlhc2VzLlxuXHQgKiBGb3IgZXhhbXBsZSwgdXNpbmcgYC8tL2dgIHdvdWxkIG1lYW4gdGhhdCBhbGlhc2VzIGNvbnRhaW5pbmcgYC1gIHdvdWxkIGJlIHZhbGlkIHdpdGggYW5kIHdpdGhvdXQgaXQuXG5cdCAqIFNvLCB0aGUgYWxpYXMgYGNvbW1hbmQtbmFtZWAgaXMgdmFsaWQgYXMgYm90aCBgY29tbWFuZC1uYW1lYCBhbmQgYGNvbW1hbmRuYW1lYC5cblx0ICovXG5cdGFsaWFzUmVwbGFjZW1lbnQ/OiBSZWdFeHA7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGFsbG93IG1lbnRpb25zIHRvIHRoZSBjbGllbnQgdXNlciBhcyBhIHByZWZpeC5cblx0ICovXG5cdGFsbG93TWVudGlvbj86IGJvb2xlYW4gfCBNZW50aW9uUHJlZml4UHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IGFyZ3VtZW50IG9wdGlvbnMuXG5cdCAqL1xuXHRhcmd1bWVudERlZmF1bHRzPzogRGVmYXVsdEFyZ3VtZW50T3B0aW9ucztcblxuXHQvKipcblx0ICogQXV0b21hdGljYWxseSBkZWZlciBtZXNzYWdlcyBcIkJvdE5hbWUgaXMgdGhpbmtpbmdcIlxuXHQgKi9cblx0YXV0b0RlZmVyPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU3BlY2lmeSB3aGV0aGVyIHRvIHJlZ2lzdGVyIGFsbCBzbGFzaCBjb21tYW5kcyB3aGVuIHN0YXJ0aW5nIHRoZSBjbGllbnQuXG5cdCAqL1xuXHRhdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYmxvY2sgYm90cy5cblx0ICovXG5cdGJsb2NrQm90cz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGJsb2NrIHNlbGYuXG5cdCAqL1xuXHRibG9ja0NsaWVudD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGFzc2lnbiBgbWVzc2FnZS51dGlsYC5cblx0ICovXG5cdGNvbW1hbmRVdGlsPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogTWlsbGlzZWNvbmRzIGEgbWVzc2FnZSBzaG91bGQgZXhpc3QgZm9yIGJlZm9yZSBpdHMgY29tbWFuZCB1dGlsIGluc3RhbmNlIGlzIG1hcmtlZCBmb3IgcmVtb3ZhbC5cblx0ICogSWYgMCwgQ29tbWFuZFV0aWwgaW5zdGFuY2VzIHdpbGwgbmV2ZXIgYmUgcmVtb3ZlZCBhbmQgd2lsbCBjYXVzZSBtZW1vcnkgdG8gaW5jcmVhc2UgaW5kZWZpbml0ZWx5LlxuXHQgKi9cblx0Y29tbWFuZFV0aWxMaWZldGltZT86IG51bWJlcjtcblxuXHQvKipcblx0ICogVGltZSBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMgZm9yIHN3ZWVwaW5nIGNvbW1hbmQgdXRpbCBpbnN0YW5jZXMuXG5cdCAqIElmIDAsIENvbW1hbmRVdGlsIGluc3RhbmNlcyB3aWxsIG5ldmVyIGJlIHJlbW92ZWQgYW5kIHdpbGwgY2F1c2UgbWVtb3J5IHRvIGluY3JlYXNlIGluZGVmaW5pdGVseS5cblx0ICovXG5cdGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbD86IG51bWJlcjtcblxuXHQvKipcblx0ICogRGVmYXVsdCBjb29sZG93biBmb3IgY29tbWFuZHMuXG5cdCAqL1xuXHRkZWZhdWx0Q29vbGRvd24/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IG1lbWJlcnMgYXJlIGZldGNoZWQgb24gZWFjaCBtZXNzYWdlIGF1dGhvciBmcm9tIGEgZ3VpbGQuXG5cdCAqL1xuXHRmZXRjaE1lbWJlcnM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBoYW5kbGUgZWRpdGVkIG1lc3NhZ2VzIHVzaW5nIENvbW1hbmRVdGlsLlxuXHQgKi9cblx0aGFuZGxlRWRpdHM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBjb29sZG93biBvciBhIGZ1bmN0aW9uIHRvIGlnbm9yZS4gRGVmYXVsdHMgdG8gdGhlIGNsaWVudCBvd25lcihzKS5cblx0ICovXG5cdGlnbm9yZUNvb2xkb3duPzogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gfCBJZ25vcmVDaGVja1ByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgYHVzZXJQZXJtaXNzaW9uc2AgY2hlY2tzIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLlxuXHQgKi9cblx0aWdub3JlUGVybWlzc2lvbnM/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBUaGUgcHJlZml4KGVzKSBmb3IgY29tbWFuZCBwYXJzaW5nLlxuXHQgKi9cblx0cHJlZml4Pzogc3RyaW5nIHwgc3RyaW5nW10gfCBQcmVmaXhTdXBwbGllcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc3RvcmUgbWVzc2FnZXMgaW4gQ29tbWFuZFV0aWwuXG5cdCAqL1xuXHRzdG9yZU1lc3NhZ2VzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU2hvdyBcIkJvdE5hbWUgaXMgdHlwaW5nXCIgaW5mb3JtYXRpb24gbWVzc2FnZSBvbiB0aGUgdGV4dCBjaGFubmVscyB3aGVuIGEgY29tbWFuZCBpcyBydW5uaW5nLlxuXHQgKi9cblx0dHlwaW5nPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gdXNlIGV4ZWNTbGFzaCBmb3Igc2xhc2ggY29tbWFuZHMuXG5cdCAqL1xuXHRleGVjU2xhc2g/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBza2lwIGJ1aWx0IGluIHJlYXNvbnMgcG9zdCB0eXBlIGluaGliaXRvcnMgc28geW91IGNhbiBtYWtlIGN1c3RvbSBvbmVzLlxuXHQgKi9cblx0c2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGF0YSBmb3IgbWFuYWdpbmcgY29vbGRvd25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvb2xkb3duRGF0YSB7XG5cdC8qKlxuXHQgKiBXaGVuIHRoZSBjb29sZG93biBlbmRzLlxuXHQgKi9cblx0ZW5kOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRpbWVvdXQgb2JqZWN0LlxuXHQgKi9cblx0dGltZXI6IE5vZGVKUy5UaW1lcjtcblxuXHQvKipcblx0ICogTnVtYmVyIG9mIHRpbWVzIHRoZSBjb21tYW5kIGhhcyBiZWVuIHVzZWQuXG5cdCAqL1xuXHR1c2VzOiBudW1iZXI7XG59XG5cbi8qKlxuICogVmFyaW91cyBwYXJzZWQgY29tcG9uZW50cyBvZiB0aGUgbWVzc2FnZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRDb21wb25lbnREYXRhIHtcblx0LyoqXG5cdCAqIFRoZSBjb250ZW50IHRvIHRoZSByaWdodCBvZiB0aGUgcHJlZml4LlxuXHQgKi9cblx0YWZ0ZXJQcmVmaXg/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBhbGlhcyB1c2VkLlxuXHQgKi9cblx0YWxpYXM/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIHVzZWQuXG5cdCAqL1xuXHRjb21tYW5kPzogQ29tbWFuZDtcblxuXHQvKipcblx0ICogVGhlIGNvbnRlbnQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBhbGlhcy5cblx0ICovXG5cdGNvbnRlbnQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBwcmVmaXggdXNlZC5cblx0ICovXG5cdHByZWZpeD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB3aGV0aGVyIHRoaXMgbWVzc2FnZSBzaG91bGQgYmUgaWdub3JlZCBmb3IgYSBjZXJ0YWluIGNoZWNrLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGNoZWNrLlxuICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGNoZWNrLlxuICovXG5leHBvcnQgdHlwZSBJZ25vcmVDaGVja1ByZWRpY2F0ZSA9IChtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSwgY29tbWFuZDogQ29tbWFuZCkgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB3aGV0aGVyIG1lbnRpb25zIGNhbiBiZSB1c2VkIGFzIGEgcHJlZml4LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIG9wdGlvbiBmb3IuXG4gKi9cbmV4cG9ydCB0eXBlIE1lbnRpb25QcmVmaXhQcmVkaWNhdGUgPSAobWVzc2FnZTogTWVzc2FnZSkgPT4gYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj47XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHByZWZpeChlcykgdG8gdXNlLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGdldCBwcmVmaXggZm9yLlxuICovXG5leHBvcnQgdHlwZSBQcmVmaXhTdXBwbGllciA9IChtZXNzYWdlOiBNZXNzYWdlKSA9PiBzdHJpbmcgfCBzdHJpbmdbXSB8IFByb21pc2U8c3RyaW5nIHwgc3RyaW5nW10+O1xuIl19