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
}
exports.default = CommandHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBV29CO0FBQ3BCLG9EQUF1QjtBQUN2Qix5RUFBaUQ7QUFDakQsNkVBQXFEO0FBRXJELG9EQUE0RTtBQUM1RSwyREFBbUM7QUFFbkMscUVBQXNGO0FBRXRGLGlIQUF5RjtBQUl6Riw0RUFBb0Q7QUFDcEQsd0RBQWlEO0FBQ2pELGdFQUF3QztBQUN4QyxrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLGNBQWUsU0FBUSx1QkFBYTtJQUN4RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxpQkFBTyxFQUN2QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEVBQ1YsV0FBVyxHQUFHLElBQUksRUFDbEIsU0FBUyxHQUFHLElBQUksRUFDaEIsWUFBWSxHQUFHLEtBQUssRUFDcEIsV0FBVyxHQUFHLEtBQUssRUFDbkIsYUFBYSxHQUFHLEtBQUssRUFDckIsV0FBVyxFQUNYLG1CQUFtQixHQUFHLEdBQUcsRUFDekIsd0JBQXdCLEdBQUcsR0FBRyxFQUM5QixlQUFlLEdBQUcsQ0FBQyxFQUNuQixjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFDL0IsaUJBQWlCLEdBQUcsRUFBRSxFQUN0QixnQkFBZ0IsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxHQUFHLEVBQ1osWUFBWSxHQUFHLElBQUksRUFDbkIsZ0JBQWdCLEVBQ2hCLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLEVBQ2QseUJBQXlCLEdBQUcsS0FBSyxFQUNqQyxTQUFTLEdBQUcsS0FBSyxFQUNqQix5QkFBeUIsR0FBRyxLQUFLLEtBQ1AsRUFBRTtRQUU3QixJ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blx0QXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YSxcblx0Q29sbGVjdGlvbixcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25EYXRhLFxuXHRHdWlsZFJlc29sdmFibGUsXG5cdE1lc3NhZ2UsXG5cdFNub3dmbGFrZSxcblx0VGV4dEJhc2VkQ2hhbm5lbHMsXG5cdFVzZXJcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IEFrYWlyb01lc3NhZ2UgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvTWVzc2FnZVwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgeyBCdWlsdEluUmVhc29ucywgQ29tbWFuZEhhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBVdGlsIGZyb20gXCIuLi8uLi91dGlsL1V0aWxcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIsIHsgQWthaXJvSGFuZGxlck9wdGlvbnMsIExvYWRQcmVkaWNhdGUgfSBmcm9tIFwiLi4vQWthaXJvSGFuZGxlclwiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSBmcm9tIFwiLi4vQWthaXJvTW9kdWxlXCI7XG5pbXBvcnQgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciBmcm9tIFwiLi4vY29udGV4dE1lbnVDb21tYW5kcy9Db250ZXh0TWVudUNvbW1hbmRIYW5kbGVyXCI7XG5pbXBvcnQgSW5oaWJpdG9ySGFuZGxlciBmcm9tIFwiLi4vaW5oaWJpdG9ycy9JbmhpYml0b3JIYW5kbGVyXCI7XG5pbXBvcnQgTGlzdGVuZXJIYW5kbGVyIGZyb20gXCIuLi9saXN0ZW5lcnMvTGlzdGVuZXJIYW5kbGVyXCI7XG5pbXBvcnQgeyBEZWZhdWx0QXJndW1lbnRPcHRpb25zIH0gZnJvbSBcIi4vYXJndW1lbnRzL0FyZ3VtZW50XCI7XG5pbXBvcnQgVHlwZVJlc29sdmVyIGZyb20gXCIuL2FyZ3VtZW50cy9UeXBlUmVzb2x2ZXJcIjtcbmltcG9ydCBDb21tYW5kLCB7IEtleVN1cHBsaWVyIH0gZnJvbSBcIi4vQ29tbWFuZFwiO1xuaW1wb3J0IENvbW1hbmRVdGlsIGZyb20gXCIuL0NvbW1hbmRVdGlsXCI7XG5pbXBvcnQgRmxhZyBmcm9tIFwiLi9GbGFnXCI7XG5cbi8qKlxuICogTG9hZHMgY29tbWFuZHMgYW5kIGhhbmRsZXMgbWVzc2FnZXMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRIYW5kbGVyIGV4dGVuZHMgQWthaXJvSGFuZGxlciB7XG5cdGNvbnN0cnVjdG9yKFxuXHRcdGNsaWVudDogQWthaXJvQ2xpZW50LFxuXHRcdHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUgPSBDb21tYW5kLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi50c1wiXSxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXIsXG5cdFx0XHRibG9ja0NsaWVudCA9IHRydWUsXG5cdFx0XHRibG9ja0JvdHMgPSB0cnVlLFxuXHRcdFx0ZmV0Y2hNZW1iZXJzID0gZmFsc2UsXG5cdFx0XHRoYW5kbGVFZGl0cyA9IGZhbHNlLFxuXHRcdFx0c3RvcmVNZXNzYWdlcyA9IGZhbHNlLFxuXHRcdFx0Y29tbWFuZFV0aWwsXG5cdFx0XHRjb21tYW5kVXRpbExpZmV0aW1lID0gM2U1LFxuXHRcdFx0Y29tbWFuZFV0aWxTd2VlcEludGVydmFsID0gM2U1LFxuXHRcdFx0ZGVmYXVsdENvb2xkb3duID0gMCxcblx0XHRcdGlnbm9yZUNvb2xkb3duID0gY2xpZW50Lm93bmVySUQsXG5cdFx0XHRpZ25vcmVQZXJtaXNzaW9ucyA9IFtdLFxuXHRcdFx0YXJndW1lbnREZWZhdWx0cyA9IHt9LFxuXHRcdFx0cHJlZml4ID0gXCIhXCIsXG5cdFx0XHRhbGxvd01lbnRpb24gPSB0cnVlLFxuXHRcdFx0YWxpYXNSZXBsYWNlbWVudCxcblx0XHRcdGF1dG9EZWZlciA9IGZhbHNlLFxuXHRcdFx0dHlwaW5nID0gZmFsc2UsXG5cdFx0XHRhdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzID0gZmFsc2UsXG5cdFx0XHRleGVjU2xhc2ggPSBmYWxzZSxcblx0XHRcdHNraXBCdWlsdEluUG9zdEluaGliaXRvcnMgPSBmYWxzZVxuXHRcdH06IENvbW1hbmRIYW5kbGVyT3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdGlmICghKGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgQ29tbWFuZCB8fCBjbGFzc1RvSGFuZGxlID09PSBDb21tYW5kKSkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9DTEFTU19UT19IQU5ETEVcIiwgY2xhc3NUb0hhbmRsZS5uYW1lLCBDb21tYW5kLm5hbWUpO1xuXHRcdH1cblxuXHRcdHN1cGVyKGNsaWVudCwge1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSxcblx0XHRcdGV4dGVuc2lvbnMsXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fSk7XG5cblx0XHR0aGlzLmF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHMgPSBhdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzO1xuXG5cdFx0dGhpcy50eXBpbmcgPSB0eXBpbmc7XG5cblx0XHR0aGlzLmF1dG9EZWZlciA9IGF1dG9EZWZlcjtcblxuXHRcdHRoaXMucmVzb2x2ZXIgPSBuZXcgVHlwZVJlc29sdmVyKHRoaXMpO1xuXG5cdFx0dGhpcy5hbGlhc2VzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdHRoaXMuYWxpYXNSZXBsYWNlbWVudCA9IGFsaWFzUmVwbGFjZW1lbnQ7XG5cblx0XHR0aGlzLnByZWZpeGVzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdHRoaXMuYmxvY2tDbGllbnQgPSAhIWJsb2NrQ2xpZW50O1xuXG5cdFx0dGhpcy5ibG9ja0JvdHMgPSAhIWJsb2NrQm90cztcblxuXHRcdHRoaXMuZmV0Y2hNZW1iZXJzID0gISFmZXRjaE1lbWJlcnM7XG5cblx0XHR0aGlzLmhhbmRsZUVkaXRzID0gISFoYW5kbGVFZGl0cztcblxuXHRcdHRoaXMuc3RvcmVNZXNzYWdlcyA9ICEhc3RvcmVNZXNzYWdlcztcblxuXHRcdHRoaXMuY29tbWFuZFV0aWwgPSAhIWNvbW1hbmRVdGlsO1xuXHRcdGlmICgodGhpcy5oYW5kbGVFZGl0cyB8fCB0aGlzLnN0b3JlTWVzc2FnZXMpICYmICF0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJDT01NQU5EX1VUSUxfRVhQTElDSVRcIik7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb21tYW5kVXRpbExpZmV0aW1lID0gY29tbWFuZFV0aWxMaWZldGltZTtcblxuXHRcdHRoaXMuY29tbWFuZFV0aWxTd2VlcEludGVydmFsID0gY29tbWFuZFV0aWxTd2VlcEludGVydmFsO1xuXHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA+IDApIHtcblx0XHRcdHNldEludGVydmFsKCgpID0+IHRoaXMuc3dlZXBDb21tYW5kVXRpbCgpLCB0aGlzLmNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCkudW5yZWYoKTtcblx0XHR9XG5cblx0XHR0aGlzLmNvbW1hbmRVdGlscyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmNvb2xkb3ducyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmRlZmF1bHRDb29sZG93biA9IGRlZmF1bHRDb29sZG93bjtcblxuXHRcdHRoaXMuaWdub3JlQ29vbGRvd24gPSB0eXBlb2YgaWdub3JlQ29vbGRvd24gPT09IFwiZnVuY3Rpb25cIiA/IGlnbm9yZUNvb2xkb3duLmJpbmQodGhpcykgOiBpZ25vcmVDb29sZG93bjtcblxuXHRcdHRoaXMuaWdub3JlUGVybWlzc2lvbnMgPSB0eXBlb2YgaWdub3JlUGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIiA/IGlnbm9yZVBlcm1pc3Npb25zLmJpbmQodGhpcykgOiBpZ25vcmVQZXJtaXNzaW9ucztcblxuXHRcdHRoaXMucHJvbXB0cyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmFyZ3VtZW50RGVmYXVsdHMgPSBVdGlsLmRlZXBBc3NpZ24oXG5cdFx0XHR7XG5cdFx0XHRcdHByb21wdDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcIlwiLFxuXHRcdFx0XHRcdHJldHJ5OiBcIlwiLFxuXHRcdFx0XHRcdHRpbWVvdXQ6IFwiXCIsXG5cdFx0XHRcdFx0ZW5kZWQ6IFwiXCIsXG5cdFx0XHRcdFx0Y2FuY2VsOiBcIlwiLFxuXHRcdFx0XHRcdHJldHJpZXM6IDEsXG5cdFx0XHRcdFx0dGltZTogMzAwMDAsXG5cdFx0XHRcdFx0Y2FuY2VsV29yZDogXCJjYW5jZWxcIixcblx0XHRcdFx0XHRzdG9wV29yZDogXCJzdG9wXCIsXG5cdFx0XHRcdFx0b3B0aW9uYWw6IGZhbHNlLFxuXHRcdFx0XHRcdGluZmluaXRlOiBmYWxzZSxcblx0XHRcdFx0XHRsaW1pdDogSW5maW5pdHksXG5cdFx0XHRcdFx0YnJlYWtvdXQ6IHRydWVcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGFyZ3VtZW50RGVmYXVsdHNcblx0XHQpO1xuXG5cdFx0dGhpcy5wcmVmaXggPSB0eXBlb2YgcHJlZml4ID09PSBcImZ1bmN0aW9uXCIgPyBwcmVmaXguYmluZCh0aGlzKSA6IHByZWZpeDtcblxuXHRcdHRoaXMuYWxsb3dNZW50aW9uID0gdHlwZW9mIGFsbG93TWVudGlvbiA9PT0gXCJmdW5jdGlvblwiID8gYWxsb3dNZW50aW9uLmJpbmQodGhpcykgOiAhIWFsbG93TWVudGlvbjtcblxuXHRcdHRoaXMuaW5oaWJpdG9ySGFuZGxlciA9IG51bGw7XG5cblx0XHR0aGlzLmF1dG9EZWZlciA9ICEhYXV0b0RlZmVyO1xuXG5cdFx0dGhpcy5leGVjU2xhc2ggPSAhIWV4ZWNTbGFzaDtcblxuXHRcdHRoaXMuc2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycyA9ICEhc2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycztcblxuXHRcdHRoaXMuc2V0dXAoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb2xsZWN0aW9uIG9mIGNvbW1hbmQgYWxpYXNlcy5cblx0ICovXG5cdHB1YmxpYyBhbGlhc2VzOiBDb2xsZWN0aW9uPHN0cmluZywgc3RyaW5nPjtcblxuXHQvKipcblx0ICogUmVndWxhciBleHByZXNzaW9uIHRvIGF1dG9tYXRpY2FsbHkgbWFrZSBjb21tYW5kIGFsaWFzZXMgZm9yLlxuXHQgKi9cblx0cHVibGljIGFsaWFzUmVwbGFjZW1lbnQ/OiBSZWdFeHA7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IG1lbnRpb25zIGFyZSBhbGxvd2VkIGZvciBwcmVmaXhpbmcuXG5cdCAqL1xuXHRwdWJsaWMgYWxsb3dNZW50aW9uOiBib29sZWFuIHwgTWVudGlvblByZWZpeFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogRGVmYXVsdCBhcmd1bWVudCBvcHRpb25zLlxuXHQgKi9cblx0cHVibGljIGFyZ3VtZW50RGVmYXVsdHM6IERlZmF1bHRBcmd1bWVudE9wdGlvbnM7XG5cblx0LyoqXG5cdCAqIEF1dG9tYXRpY2FsbHkgZGVmZXIgbWVzc2FnZXMgXCJCb3ROYW1lIGlzIHRoaW5raW5nXCIuXG5cdCAqL1xuXHRwdWJsaWMgYXV0b0RlZmVyOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZ5IHdoZXRoZXIgdG8gcmVnaXN0ZXIgYWxsIHNsYXNoIGNvbW1hbmRzIHdoZW4gc3RhcnRpbmcgdGhlIGNsaWVudFxuXHQgKi9cblx0cHVibGljIGF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGJsb2NrIGJvdHMuXG5cdCAqL1xuXHRwdWJsaWMgYmxvY2tCb3RzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBzZWxmLlxuXHQgKi9cblx0cHVibGljIGJsb2NrQ2xpZW50OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDYXRlZ29yaWVzLCBtYXBwZWQgYnkgSUQgdG8gQ2F0ZWdvcnkuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBDb21tYW5kPj47XG5cblx0LyoqXG5cdCAqIENsYXNzIHRvIGhhbmRsZVxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xhc3NUb0hhbmRsZTogdHlwZW9mIENvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IGBtZXNzYWdlLnV0aWxgIGlzIGFzc2lnbmVkLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmRVdGlsOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBNaWxsaXNlY29uZHMgYSBtZXNzYWdlIHNob3VsZCBleGlzdCBmb3IgYmVmb3JlIGl0cyBjb21tYW5kIHV0aWwgaW5zdGFuY2UgaXMgbWFya2VkIGZvciByZW1vdmFsLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmRVdGlsTGlmZXRpbWU6IG51bWJlcjtcblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBDb21tYW5kVXRpbHMuXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZFV0aWxzOiBDb2xsZWN0aW9uPHN0cmluZywgQ29tbWFuZFV0aWw+O1xuXG5cdC8qKlxuXHQgKiBUaW1lIGludGVydmFsIGluIG1pbGxpc2Vjb25kcyBmb3Igc3dlZXBpbmcgY29tbWFuZCB1dGlsIGluc3RhbmNlcy5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWw6IG51bWJlcjtcblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBjb29sZG93bnMuXG5cdCAqIDxpbmZvPlRoZSBlbGVtZW50cyBpbiB0aGUgY29sbGVjdGlvbiBhcmUgb2JqZWN0cyB3aXRoIHVzZXIgSURzIGFzIGtleXNcblx0ICogYW5kIHtAbGluayBDb29sZG93bkRhdGF9IG9iamVjdHMgYXMgdmFsdWVzPC9pbmZvPlxuXHQgKi9cblx0cHVibGljIGNvb2xkb3duczogQ29sbGVjdGlvbjxzdHJpbmcsIHsgW2lkOiBzdHJpbmddOiBDb29sZG93bkRhdGEgfT47XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgY29vbGRvd24gZm9yIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGRlZmF1bHRDb29sZG93bjogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBEaXJlY3RvcnkgdG8gY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gdXNlIGV4ZWNTbGFzaCBmb3Igc2xhc2ggY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgZXhlY1NsYXNoOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBtZW1iZXJzIGFyZSBmZXRjaGVkIG9uIGVhY2ggbWVzc2FnZSBhdXRob3IgZnJvbSBhIGd1aWxkLlxuXHQgKi9cblx0cHVibGljIGZldGNoTWVtYmVyczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgZWRpdHMgYXJlIGhhbmRsZWQuXG5cdCAqL1xuXHRwdWJsaWMgaGFuZGxlRWRpdHM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGNvb2xkb3duIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLlxuXHQgKi9cblx0cHVibGljIGlnbm9yZUNvb2xkb3duOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBgdXNlclBlcm1pc3Npb25zYCBjaGVja3Mgb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuXG5cdCAqL1xuXHRwdWJsaWMgaWdub3JlUGVybWlzc2lvbnM6IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIEluaGliaXRvciBoYW5kbGVyIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBpbmhpYml0b3JIYW5kbGVyPzogSW5oaWJpdG9ySGFuZGxlcjtcblxuXHQvKipcblx0ICogQ29tbWFuZHMgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gQ29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIG1vZHVsZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDb21tYW5kPjtcblxuXHQvKipcblx0ICogVGhlIHByZWZpeChlcykgZm9yIGNvbW1hbmQgcGFyc2luZy5cblx0ICovXG5cdHB1YmxpYyBwcmVmaXg6IHN0cmluZyB8IHN0cmluZ1tdIHwgUHJlZml4U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgcHJlZml4IG92ZXJ3cml0ZXMgdG8gY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgcHJlZml4ZXM6IENvbGxlY3Rpb248c3RyaW5nIHwgUHJlZml4U3VwcGxpZXIsIFNldDxzdHJpbmc+PjtcblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBzZXRzIG9mIG9uZ29pbmcgYXJndW1lbnQgcHJvbXB0cy5cblx0ICovXG5cdHB1YmxpYyBwcm9tcHRzOiBDb2xsZWN0aW9uPHN0cmluZywgU2V0PHN0cmluZz4+O1xuXG5cdC8qKlxuXHQgKiBUaGUgdHlwZSByZXNvbHZlci5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlcjogVHlwZVJlc29sdmVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBzdG9yZSBtZXNzYWdlcyBpbiBDb21tYW5kVXRpbC5cblx0ICovXG5cdHB1YmxpYyBzdG9yZU1lc3NhZ2VzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTaG93IFwiQm90TmFtZSBpcyB0eXBpbmdcIiBpbmZvcm1hdGlvbiBtZXNzYWdlIG9uIHRoZSB0ZXh0IGNoYW5uZWxzIHdoZW4gYSBjb21tYW5kIGlzIHJ1bm5pbmcuXG5cdCAqL1xuXHRwdWJsaWMgdHlwaW5nOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBza2lwIGJ1aWx0IGluIHJlYXNvbnMgcG9zdCB0eXBlIGluaGliaXRvcnMgc28geW91IGNhbiBtYWtlIGN1c3RvbSBvbmVzLlxuXHQgKi9cblx0cHVibGljIHNraXBCdWlsdEluUG9zdEluaGliaXRvcnM/OiBib29sZWFuO1xuXG5cdHByb3RlY3RlZCBzZXR1cCgpIHtcblx0XHR0aGlzLmNsaWVudC5vbmNlKFwicmVhZHlcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcylcblx0XHRcdFx0dGhpcy5yZWdpc3RlckludGVyYWN0aW9uQ29tbWFuZHMoKS50aGVuKCgpID0+XG5cdFx0XHRcdFx0dGhpcy51cGRhdGVJbnRlcmFjdGlvblBlcm1pc3Npb25zKHRoaXMuY2xpZW50Lm93bmVySUQsIHRoaXMuY2xpZW50LnN1cGVyVXNlcklEKVxuXHRcdFx0XHQpO1xuXG5cdFx0XHR0aGlzLmNsaWVudC5vbihcIm1lc3NhZ2VDcmVhdGVcIiwgYXN5bmMgbSA9PiB7XG5cdFx0XHRcdGlmIChtLnBhcnRpYWwpIGF3YWl0IG0uZmV0Y2goKTtcblxuXHRcdFx0XHR0aGlzLmhhbmRsZShtKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFZGl0cykge1xuXHRcdFx0XHR0aGlzLmNsaWVudC5vbihcIm1lc3NhZ2VVcGRhdGVcIiwgYXN5bmMgKG8sIG0pID0+IHtcblx0XHRcdFx0XHRpZiAoby5wYXJ0aWFsKSBhd2FpdCBvLmZldGNoKCk7XG5cdFx0XHRcdFx0aWYgKG0ucGFydGlhbCkgYXdhaXQgbS5mZXRjaCgpO1xuXHRcdFx0XHRcdGlmIChvLmNvbnRlbnQgPT09IG0uY29udGVudCkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRWRpdHMpIHRoaXMuaGFuZGxlKG0gYXMgTWVzc2FnZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5jbGllbnQub24oXCJpbnRlcmFjdGlvbkNyZWF0ZVwiLCBpID0+IHtcblx0XHRcdFx0aWYgKCFpLmlzQ29tbWFuZCgpKSByZXR1cm47XG5cdFx0XHRcdHRoaXMuaGFuZGxlU2xhc2goaSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHByb3RlY3RlZCBhc3luYyByZWdpc3RlckludGVyYWN0aW9uQ29tbWFuZHMoKSB7XG5cdFx0Y29uc3QgcGFyc2VkU2xhc2hDb21tYW5kczoge1xuXHRcdFx0bmFtZTogc3RyaW5nO1xuXHRcdFx0ZGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cdFx0XHRvcHRpb25zPzogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YVtdO1xuXHRcdFx0Z3VpbGRzOiBTbm93Zmxha2VbXTtcblx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiBib29sZWFuO1xuXHRcdFx0dHlwZTogXCJDSEFUX0lOUFVUXCIgfCBcIk1FU1NBR0VcIiB8IFwiVVNFUlwiO1xuXHRcdH1bXSA9IFtdO1xuXHRcdGNvbnN0IGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZDogQ29sbGVjdGlvbjxcblx0XHRcdFNub3dmbGFrZSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogc3RyaW5nO1xuXHRcdFx0XHRkZXNjcmlwdGlvbjogc3RyaW5nO1xuXHRcdFx0XHRvcHRpb25zOiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25EYXRhW107XG5cdFx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiBib29sZWFuO1xuXHRcdFx0XHR0eXBlOiBcIkNIQVRfSU5QVVRcIiB8IFwiTUVTU0FHRVwiIHwgXCJVU0VSXCI7XG5cdFx0XHR9W11cblx0XHQ+ID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHRjb25zdCBwYXJzZURlc2NyaXB0aW9uQ29tbWFuZCA9IGRlc2NyaXB0aW9uID0+IHtcblx0XHRcdGlmICh0eXBlb2YgZGVzY3JpcHRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBkZXNjcmlwdGlvbi5jb250ZW50ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBkZXNjcmlwdGlvbi5jb250ZW50KCk7XG5cdFx0XHRcdGlmICh0eXBlb2YgZGVzY3JpcHRpb24uY29udGVudCA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIGRlc2NyaXB0aW9uLmNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZGVzY3JpcHRpb247XG5cdFx0fTtcblxuXHRcdGZvciAoY29uc3QgWywgZGF0YV0gb2YgdGhpcy5tb2R1bGVzKSB7XG5cdFx0XHRpZiAoIWRhdGEuc2xhc2gpIGNvbnRpbnVlO1xuXHRcdFx0cGFyc2VkU2xhc2hDb21tYW5kcy5wdXNoKHtcblx0XHRcdFx0bmFtZTogZGF0YS5hbGlhc2VzWzBdLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogcGFyc2VEZXNjcmlwdGlvbkNvbW1hbmQoZGF0YS5kZXNjcmlwdGlvbiksXG5cdFx0XHRcdG9wdGlvbnM6IGRhdGEuc2xhc2hPcHRpb25zLFxuXHRcdFx0XHRndWlsZHM6IGRhdGEuc2xhc2hHdWlsZHMgPz8gW10sXG5cdFx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiAhKGRhdGEub3duZXJPbmx5IHx8IGRhdGEuc3VwZXJVc2VyT25seSB8fCBmYWxzZSksXG5cdFx0XHRcdHR5cGU6IFwiQ0hBVF9JTlBVVFwiXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRsZXQgY29udGV4dENvbW1hbmRIYW5kbGVyOiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyIHwgdW5kZWZpbmVkO1xuXHRcdGZvciAoY29uc3Qga2V5IGluIHRoaXMuY2xpZW50KSB7XG5cdFx0XHRpZiAodGhpcy5jbGllbnRba2V5XSBpbnN0YW5jZW9mIENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXIpIHtcblx0XHRcdFx0Y29udGV4dENvbW1hbmRIYW5kbGVyID0gdGhpcy5jbGllbnRba2V5XTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChjb250ZXh0Q29tbWFuZEhhbmRsZXIpIHtcblx0XHRcdGZvciAoY29uc3QgWywgZGF0YV0gb2YgY29udGV4dENvbW1hbmRIYW5kbGVyLm1vZHVsZXMpIHtcblx0XHRcdFx0cGFyc2VkU2xhc2hDb21tYW5kcy5wdXNoKHtcblx0XHRcdFx0XHRuYW1lOiBkYXRhLm5hbWUsXG5cdFx0XHRcdFx0Z3VpbGRzOiBkYXRhLmd1aWxkcyA/PyBbXSxcblx0XHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogIShkYXRhLm93bmVyT25seSB8fCBkYXRhLnN1cGVyVXNlck9ubHkgfHwgZmFsc2UpLFxuXHRcdFx0XHRcdHR5cGU6IGRhdGEudHlwZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKiBHbG9iYWwgKi9cblx0XHRjb25zdCBzbGFzaENvbW1hbmRzQXBwID0gcGFyc2VkU2xhc2hDb21tYW5kc1xuXHRcdFx0LmZpbHRlcigoeyBndWlsZHMgfSkgPT4gIWd1aWxkcy5sZW5ndGgpXG5cdFx0XHQubWFwKCh7IG5hbWUsIGRlc2NyaXB0aW9uLCBvcHRpb25zLCBkZWZhdWx0UGVybWlzc2lvbiwgdHlwZSB9KSA9PiB7XG5cdFx0XHRcdHJldHVybiB7IG5hbWUsIGRlc2NyaXB0aW9uLCBvcHRpb25zLCBkZWZhdWx0UGVybWlzc2lvbiwgdHlwZSB9O1xuXHRcdFx0fSk7XG5cdFx0Y29uc3QgY3VycmVudEdsb2JhbENvbW1hbmRzID0gKGF3YWl0IHRoaXMuY2xpZW50LmFwcGxpY2F0aW9uPy5jb21tYW5kcy5mZXRjaCgpKS5tYXAodmFsdWUxID0+ICh7XG5cdFx0XHRuYW1lOiB2YWx1ZTEubmFtZSxcblx0XHRcdGRlc2NyaXB0aW9uOiB2YWx1ZTEuZGVzY3JpcHRpb24sXG5cdFx0XHRvcHRpb25zOiB2YWx1ZTEub3B0aW9ucyxcblx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiB2YWx1ZTEuZGVmYXVsdFBlcm1pc3Npb24sXG5cdFx0XHR0eXBlOiB2YWx1ZTEudHlwZVxuXHRcdH0pKTtcblxuXHRcdGlmICghXy5pc0VxdWFsKGN1cnJlbnRHbG9iYWxDb21tYW5kcywgc2xhc2hDb21tYW5kc0FwcCkpIHtcblx0XHRcdGF3YWl0IHRoaXMuY2xpZW50LmFwcGxpY2F0aW9uPy5jb21tYW5kcy5zZXQoc2xhc2hDb21tYW5kc0FwcCk7XG5cdFx0fVxuXG5cdFx0LyogR3VpbGRzICovXG5cdFx0Zm9yIChjb25zdCB7IG5hbWUsIGRlc2NyaXB0aW9uLCBvcHRpb25zLCBndWlsZHMsIGRlZmF1bHRQZXJtaXNzaW9uLCB0eXBlIH0gb2YgcGFyc2VkU2xhc2hDb21tYW5kcykge1xuXHRcdFx0Zm9yIChjb25zdCBndWlsZElkIG9mIGd1aWxkcykge1xuXHRcdFx0XHRndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQuc2V0KGd1aWxkSWQsIFtcblx0XHRcdFx0XHQuLi4oZ3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkLmdldChndWlsZElkKSA/PyBbXSksXG5cdFx0XHRcdFx0eyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZGVmYXVsdFBlcm1pc3Npb24sIHR5cGUgfVxuXHRcdFx0XHRdKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZC5zaXplKSB7XG5cdFx0XHRndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQuZWFjaChhc3luYyAodmFsdWUsIGtleSkgPT4ge1xuXHRcdFx0XHRjb25zdCBndWlsZCA9IHRoaXMuY2xpZW50Lmd1aWxkcy5jYWNoZS5nZXQoa2V5KTtcblx0XHRcdFx0aWYgKCFndWlsZCkgcmV0dXJuO1xuXG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRHdWlsZENvbW1hbmRzID0gKGF3YWl0IGd1aWxkLmNvbW1hbmRzLmZldGNoKCkpLm1hcCh2YWx1ZTEgPT4gKHtcblx0XHRcdFx0XHRuYW1lOiB2YWx1ZTEubmFtZSxcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogdmFsdWUxLmRlc2NyaXB0aW9uLFxuXHRcdFx0XHRcdG9wdGlvbnM6IHZhbHVlMS5vcHRpb25zLFxuXHRcdFx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiB2YWx1ZTEuZGVmYXVsdFBlcm1pc3Npb24sXG5cdFx0XHRcdFx0dHlwZTogdmFsdWUxLnR5cGVcblx0XHRcdFx0fSkpO1xuXG5cdFx0XHRcdGlmICghXy5pc0VxdWFsKGN1cnJlbnRHdWlsZENvbW1hbmRzLCB2YWx1ZSkpIHtcblx0XHRcdFx0XHRhd2FpdCBndWlsZC5jb21tYW5kcy5zZXQodmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlSW50ZXJhY3Rpb25QZXJtaXNzaW9ucyhvd25lcnM6IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdLCBzdXBlclVzZXJzOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSkge1xuXHRcdGNvbnN0IG1hcENvbSA9IChcblx0XHRcdHZhbHVlOiBBcHBsaWNhdGlvbkNvbW1hbmQ8e1xuXHRcdFx0XHRndWlsZDogR3VpbGRSZXNvbHZhYmxlO1xuXHRcdFx0fT5cblx0XHQpOiB7IGlkOiBzdHJpbmc7IHBlcm1pc3Npb25zOiB7IGlkOiBzdHJpbmc7IHR5cGU6IFwiVVNFUlwiOyBwZXJtaXNzaW9uOiBib29sZWFuIH1bXSB9ID0+IHtcblx0XHRcdGNvbnN0IGNvbW1hbmQgPSB0aGlzLm1vZHVsZXMuZmluZChtb2QgPT4gbW9kLmFsaWFzZXNbMF0gPT09IHZhbHVlLm5hbWUpO1xuXHRcdFx0bGV0IGFsbG93ZWRVc2Vyczogc3RyaW5nW10gPSBbXTtcblx0XHRcdGlmIChjb21tYW5kLnN1cGVyVXNlck9ubHkpIGFsbG93ZWRVc2Vycy5wdXNoKC4uLlV0aWwuaW50b0FycmF5KHN1cGVyVXNlcnMpKTtcblx0XHRcdGlmIChjb21tYW5kLm93bmVyT25seSkgYWxsb3dlZFVzZXJzLnB1c2goLi4uVXRpbC5pbnRvQXJyYXkob3duZXJzKSk7XG5cdFx0XHRhbGxvd2VkVXNlcnMgPSBbLi4ubmV3IFNldChhbGxvd2VkVXNlcnMpXTsgLy8gcmVtb3ZlIGR1cGxpY2F0ZXNcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aWQ6IHZhbHVlLmlkLFxuXHRcdFx0XHRwZXJtaXNzaW9uczogYWxsb3dlZFVzZXJzLm1hcCh1ID0+ICh7XG5cdFx0XHRcdFx0aWQ6IHUsXG5cdFx0XHRcdFx0dHlwZTogXCJVU0VSXCIsXG5cdFx0XHRcdFx0cGVybWlzc2lvbjogdHJ1ZVxuXHRcdFx0XHR9KSlcblx0XHRcdH07XG5cdFx0fTtcblxuXHRcdGNvbnN0IGdsb2JhbENvbW1hbmRzID0gYXdhaXQgdGhpcy5jbGllbnQuYXBwbGljYXRpb24/LmNvbW1hbmRzLmZldGNoKCk7XG5cdFx0Y29uc3QgZnVsbFBlcm1pc3Npb25zOiBHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25EYXRhW10gPSBnbG9iYWxDb21tYW5kc1xuXHRcdFx0LmZpbHRlcih2YWx1ZSA9PiAhdmFsdWUuZGVmYXVsdFBlcm1pc3Npb24pXG5cdFx0XHQubWFwKHZhbHVlID0+IG1hcENvbSh2YWx1ZSkpO1xuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSB0aGlzLmNsaWVudC5ndWlsZHMuY2FjaGUubWFwKGd1aWxkID0+IHtcblx0XHRcdGNvbnN0IHBlcm1zID0gZnVsbFBlcm1pc3Npb25zO1xuXHRcdFx0aWYgKGd1aWxkLmNvbW1hbmRzLmNhY2hlLnNpemUpXG5cdFx0XHRcdHBlcm1zLnB1c2goLi4uZ3VpbGQuY29tbWFuZHMuY2FjaGUuZmlsdGVyKHZhbHVlID0+ICF2YWx1ZS5kZWZhdWx0UGVybWlzc2lvbikubWFwKHZhbHVlID0+IG1hcENvbSh2YWx1ZSkpKTtcblx0XHRcdGlmIChndWlsZC5hdmFpbGFibGUpXG5cdFx0XHRcdHJldHVybiBndWlsZC5jb21tYW5kcy5wZXJtaXNzaW9ucy5zZXQoe1xuXHRcdFx0XHRcdGZ1bGxQZXJtaXNzaW9uczogcGVybXNcblx0XHRcdFx0fSk7XG5cdFx0XHQvLyBSZXR1cm4gZW1wdHkgcHJvbWlzZSBpZiBndWlsZCBpcyB1bmF2YWlsYWJsZVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH0pO1xuXHRcdC8vIEB0cy1leHBlY3QtZXJyb3I6IGl0IHN0aWxsIHdvcmtzIHNodXNoXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gZmlsZXBhdGggLSBGaWxlcGF0aCBvZiBtb2R1bGUuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVnaXN0ZXIoY29tbWFuZDogQ29tbWFuZCwgZmlsZXBhdGg/OiBzdHJpbmcpOiB2b2lkIHtcblx0XHRzdXBlci5yZWdpc3Rlcihjb21tYW5kLCBmaWxlcGF0aCk7XG5cblx0XHRmb3IgKGxldCBhbGlhcyBvZiBjb21tYW5kLmFsaWFzZXMpIHtcblx0XHRcdGNvbnN0IGNvbmZsaWN0ID0gdGhpcy5hbGlhc2VzLmdldChhbGlhcy50b0xvd2VyQ2FzZSgpKTtcblx0XHRcdGlmIChjb25mbGljdCkgdGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiQUxJQVNfQ09ORkxJQ1RcIiwgYWxpYXMsIGNvbW1hbmQuaWQsIGNvbmZsaWN0KTtcblxuXHRcdFx0YWxpYXMgPSBhbGlhcy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0dGhpcy5hbGlhc2VzLnNldChhbGlhcywgY29tbWFuZC5pZCk7XG5cdFx0XHRpZiAodGhpcy5hbGlhc1JlcGxhY2VtZW50KSB7XG5cdFx0XHRcdGNvbnN0IHJlcGxhY2VtZW50ID0gYWxpYXMucmVwbGFjZSh0aGlzLmFsaWFzUmVwbGFjZW1lbnQsIFwiXCIpO1xuXG5cdFx0XHRcdGlmIChyZXBsYWNlbWVudCAhPT0gYWxpYXMpIHtcblx0XHRcdFx0XHRjb25zdCByZXBsYWNlbWVudENvbmZsaWN0ID0gdGhpcy5hbGlhc2VzLmdldChyZXBsYWNlbWVudCk7XG5cdFx0XHRcdFx0aWYgKHJlcGxhY2VtZW50Q29uZmxpY3QpXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJBTElBU19DT05GTElDVFwiLCByZXBsYWNlbWVudCwgY29tbWFuZC5pZCwgcmVwbGFjZW1lbnRDb25mbGljdCk7XG5cdFx0XHRcdFx0dGhpcy5hbGlhc2VzLnNldChyZXBsYWNlbWVudCwgY29tbWFuZC5pZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY29tbWFuZC5wcmVmaXggIT0gbnVsbCkge1xuXHRcdFx0bGV0IG5ld0VudHJ5ID0gZmFsc2U7XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KGNvbW1hbmQucHJlZml4KSkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IHByZWZpeCBvZiBjb21tYW5kLnByZWZpeCkge1xuXHRcdFx0XHRcdGNvbnN0IHByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5nZXQocHJlZml4KTtcblx0XHRcdFx0XHRpZiAocHJlZml4ZXMpIHtcblx0XHRcdFx0XHRcdHByZWZpeGVzLmFkZChjb21tYW5kLmlkKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5zZXQocHJlZml4LCBuZXcgU2V0KFtjb21tYW5kLmlkXSkpO1xuXHRcdFx0XHRcdFx0bmV3RW50cnkgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgcHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLmdldChjb21tYW5kLnByZWZpeCk7XG5cdFx0XHRcdGlmIChwcmVmaXhlcykge1xuXHRcdFx0XHRcdHByZWZpeGVzLmFkZChjb21tYW5kLmlkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnByZWZpeGVzLnNldChjb21tYW5kLnByZWZpeCwgbmV3IFNldChbY29tbWFuZC5pZF0pKTtcblx0XHRcdFx0XHRuZXdFbnRyeSA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKG5ld0VudHJ5KSB7XG5cdFx0XHRcdHRoaXMucHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLnNvcnQoKGFWYWwsIGJWYWwsIGFLZXksIGJLZXkpID0+IFV0aWwucHJlZml4Q29tcGFyZShhS2V5LCBiS2V5KSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERlcmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgZGVyZWdpc3Rlcihjb21tYW5kOiBDb21tYW5kKTogdm9pZCB7XG5cdFx0Zm9yIChsZXQgYWxpYXMgb2YgY29tbWFuZC5hbGlhc2VzKSB7XG5cdFx0XHRhbGlhcyA9IGFsaWFzLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR0aGlzLmFsaWFzZXMuZGVsZXRlKGFsaWFzKTtcblxuXHRcdFx0aWYgKHRoaXMuYWxpYXNSZXBsYWNlbWVudCkge1xuXHRcdFx0XHRjb25zdCByZXBsYWNlbWVudCA9IGFsaWFzLnJlcGxhY2UodGhpcy5hbGlhc1JlcGxhY2VtZW50LCBcIlwiKTtcblx0XHRcdFx0aWYgKHJlcGxhY2VtZW50ICE9PSBhbGlhcykgdGhpcy5hbGlhc2VzLmRlbGV0ZShyZXBsYWNlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNvbW1hbmQucHJlZml4ICE9IG51bGwpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KGNvbW1hbmQucHJlZml4KSkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IHByZWZpeCBvZiBjb21tYW5kLnByZWZpeCkge1xuXHRcdFx0XHRcdGNvbnN0IHByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5nZXQocHJlZml4KTtcblx0XHRcdFx0XHRpZiAocHJlZml4ZXM/LnNpemUgPT09IDEpIHtcblx0XHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuZGVsZXRlKHByZWZpeCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHByZWZpeGVzPy5kZWxldGUocHJlZml4KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5nZXQoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHRpZiAocHJlZml4ZXM/LnNpemUgPT09IDEpIHtcblx0XHRcdFx0XHR0aGlzLnByZWZpeGVzLmRlbGV0ZShjb21tYW5kLnByZWZpeCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdHByZWZpeGVzLmRlbGV0ZShjb21tYW5kLnByZWZpeCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRzdXBlci5kZXJlZ2lzdGVyKGNvbW1hbmQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgYSBtZXNzYWdlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZShtZXNzYWdlOiBNZXNzYWdlKTogUHJvbWlzZTxib29sZWFuIHwgbnVsbD4ge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy5mZXRjaE1lbWJlcnMgJiYgbWVzc2FnZS5ndWlsZCAmJiAhbWVzc2FnZS5tZW1iZXIgJiYgIW1lc3NhZ2Uud2ViaG9va0lkKSB7XG5cdFx0XHRcdGF3YWl0IG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5mZXRjaChtZXNzYWdlLmF1dGhvcik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1bkFsbFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWwpIHtcblx0XHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWxzLmhhcyhtZXNzYWdlLmlkKSkge1xuXHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSB0aGlzLmNvbW1hbmRVdGlscy5nZXQobWVzc2FnZS5pZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdG1lc3NhZ2UudXRpbCA9IG5ldyBDb21tYW5kVXRpbCh0aGlzLCBtZXNzYWdlKTsgLy8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdHRoaXMuY29tbWFuZFV0aWxzLnNldChtZXNzYWdlLmlkLCBtZXNzYWdlLnV0aWwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blByZVR5cGVJbmhpYml0b3JzKG1lc3NhZ2UpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kKG1lc3NhZ2UpO1xuXHRcdFx0aWYgKCFwYXJzZWQuY29tbWFuZCkge1xuXHRcdFx0XHRjb25zdCBvdmVyUGFyc2VkID0gYXdhaXQgdGhpcy5wYXJzZUNvbW1hbmRPdmVyd3JpdHRlblByZWZpeGVzKG1lc3NhZ2UpO1xuXHRcdFx0XHRpZiAob3ZlclBhcnNlZC5jb21tYW5kIHx8IChwYXJzZWQucHJlZml4ID09IG51bGwgJiYgb3ZlclBhcnNlZC5wcmVmaXggIT0gbnVsbCkpIHtcblx0XHRcdFx0XHRwYXJzZWQgPSBvdmVyUGFyc2VkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0bWVzc2FnZS51dGlsLnBhcnNlZCA9IHBhcnNlZDtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHJhbjtcblx0XHRcdGlmICghcGFyc2VkLmNvbW1hbmQpIHtcblx0XHRcdFx0cmFuID0gYXdhaXQgdGhpcy5oYW5kbGVSZWdleEFuZENvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyYW4gPSBhd2FpdCB0aGlzLmhhbmRsZURpcmVjdENvbW1hbmQobWVzc2FnZSwgcGFyc2VkLmNvbnRlbnQsIHBhcnNlZC5jb21tYW5kKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHJhbiA9PT0gZmFsc2UpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfSU5WQUxJRCwgbWVzc2FnZSk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJhbjtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBpbnRlcmFjdGlvbiAtIEludGVyYWN0aW9uIHRvIGhhbmRsZS5cblx0ICovXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG5cdHB1YmxpYyBhc3luYyBoYW5kbGVTbGFzaChpbnRlcmFjdGlvbjogQ29tbWFuZEludGVyYWN0aW9uKTogUHJvbWlzZTxib29sZWFuIHwgbnVsbD4ge1xuXHRcdGNvbnN0IGNvbW1hbmQgPSB0aGlzLmZpbmRDb21tYW5kKGludGVyYWN0aW9uLmNvbW1hbmROYW1lKTtcblxuXHRcdGlmICghY29tbWFuZCkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX05PVF9GT1VORCwgaW50ZXJhY3Rpb24pO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1lc3NhZ2UgPSBuZXcgQWthaXJvTWVzc2FnZSh0aGlzLmNsaWVudCwgaW50ZXJhY3Rpb24sIGNvbW1hbmQpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLmZldGNoTWVtYmVycyAmJiBtZXNzYWdlLmd1aWxkICYmICFtZXNzYWdlLm1lbWJlcikge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuZmV0Y2gobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5BbGxUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCB0cnVlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlscy5oYXMobWVzc2FnZS5pZCkpIHtcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSB0aGlzLmNvbW1hbmRVdGlscy5nZXQobWVzc2FnZS5pZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gbmV3IENvbW1hbmRVdGlsKHRoaXMsIG1lc3NhZ2UpO1xuXHRcdFx0XHRcdHRoaXMuY29tbWFuZFV0aWxzLnNldChtZXNzYWdlLmlkLCBtZXNzYWdlLnV0aWwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blByZVR5cGVJbmhpYml0b3JzKG1lc3NhZ2UpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kKG1lc3NhZ2UpO1xuXHRcdFx0aWYgKCFwYXJzZWQuY29tbWFuZCkge1xuXHRcdFx0XHRjb25zdCBvdmVyUGFyc2VkID0gYXdhaXQgdGhpcy5wYXJzZUNvbW1hbmRPdmVyd3JpdHRlblByZWZpeGVzKG1lc3NhZ2UpO1xuXHRcdFx0XHRpZiAob3ZlclBhcnNlZC5jb21tYW5kIHx8IChwYXJzZWQucHJlZml4ID09IG51bGwgJiYgb3ZlclBhcnNlZC5wcmVmaXggIT0gbnVsbCkpIHtcblx0XHRcdFx0XHRwYXJzZWQgPSBvdmVyUGFyc2VkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdG1lc3NhZ2UudXRpbC5wYXJzZWQgPSBwYXJzZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGNvbnZlcnRlZE9wdGlvbnMgPSB7fTtcblx0XHRcdGZvciAoY29uc3Qgb3B0aW9uIG9mIGNvbW1hbmQuc2xhc2hPcHRpb25zKSB7XG5cdFx0XHRcdGNvbnZlcnRlZE9wdGlvbnNbb3B0aW9uLm5hbWVdID0gaW50ZXJhY3Rpb24ub3B0aW9ucy5nZXQob3B0aW9uLm5hbWUsIG9wdGlvbi5yZXF1aXJlZCB8fCBmYWxzZSk/LnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQga2V5O1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrKSBrZXkgPSBjb21tYW5kLmxvY2sobWVzc2FnZSwgY29udmVydGVkT3B0aW9ucyk7XG5cdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShrZXkpKSBrZXkgPSBhd2FpdCBrZXk7XG5cdFx0XHRcdGlmIChrZXkpIHtcblx0XHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrZXI/LmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0XHRrZXkgPSBudWxsO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfTE9DS0VELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb21tYW5kLmxvY2tlcj8uYWRkKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0aWYgKGtleSkgY29tbWFuZC5sb2NrZXI/LmRlbGV0ZShrZXkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5hdXRvRGVmZXIgfHwgY29tbWFuZC5zbGFzaEVwaGVtZXJhbCkge1xuXHRcdFx0XHRhd2FpdCBpbnRlcmFjdGlvbi5kZWZlclJlcGx5KHsgZXBoZW1lcmFsOiBjb21tYW5kLnNsYXNoRXBoZW1lcmFsIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfU1RBUlRFRCwgbWVzc2FnZSwgY29tbWFuZCwgY29udmVydGVkT3B0aW9ucyk7XG5cdFx0XHRcdGNvbnN0IHJldCA9XG5cdFx0XHRcdFx0UmVmbGVjdC5vd25LZXlzKGNvbW1hbmQpLmluY2x1ZGVzKFwiZXhlY1NsYXNoXCIpIHx8IHRoaXMuZXhlY1NsYXNoXG5cdFx0XHRcdFx0XHQ/IGF3YWl0IGNvbW1hbmQuZXhlY1NsYXNoKG1lc3NhZ2UsIGNvbnZlcnRlZE9wdGlvbnMpXG5cdFx0XHRcdFx0XHQ6IGF3YWl0IGNvbW1hbmQuZXhlYyhtZXNzYWdlIGFzIGFueSwgY29udmVydGVkT3B0aW9ucyk7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9GSU5JU0hFRCwgbWVzc2FnZSwgY29tbWFuZCwgY29udmVydGVkT3B0aW9ucywgcmV0KTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX0VSUk9SLCBlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdC8qKlxuXHQgKiBIYW5kbGVzIG5vcm1hbCBjb21tYW5kcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGNvbnRlbnQgLSBDb250ZW50IG9mIG1lc3NhZ2Ugd2l0aG91dCBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgaW5zdGFuY2UuXG5cdCAqIEBwYXJhbSBpZ25vcmUgLSBJZ25vcmUgaW5oaWJpdG9ycyBhbmQgb3RoZXIgY2hlY2tzLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZURpcmVjdENvbW1hbmQoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRjb250ZW50OiBzdHJpbmcsXG5cdFx0Y29tbWFuZDogQ29tbWFuZCxcblx0XHRpZ25vcmU6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0bGV0IGtleTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKCFpZ25vcmUpIHtcblx0XHRcdFx0aWYgKG1lc3NhZ2UuZWRpdGVkVGltZXN0YW1wICYmICFjb21tYW5kLmVkaXRhYmxlKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYmVmb3JlID0gY29tbWFuZC5iZWZvcmUobWVzc2FnZSk7XG5cdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoYmVmb3JlKSkgYXdhaXQgYmVmb3JlO1xuXG5cdFx0XHRjb25zdCBhcmdzID0gYXdhaXQgY29tbWFuZC5wYXJzZShtZXNzYWdlLCBjb250ZW50KTtcblx0XHRcdGlmIChGbGFnLmlzKGFyZ3MsIFwiY2FuY2VsXCIpKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0NBTkNFTExFRCwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmIChGbGFnLmlzKGFyZ3MsIFwicmV0cnlcIikpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfQlJFQUtPVVQsIG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MubWVzc2FnZSk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmhhbmRsZShhcmdzLm1lc3NhZ2UpO1xuXHRcdFx0fSBlbHNlIGlmIChGbGFnLmlzKGFyZ3MsIFwiY29udGludWVcIikpIHtcblx0XHRcdFx0Y29uc3QgY29udGludWVDb21tYW5kID0gdGhpcy5tb2R1bGVzLmdldChhcmdzLmNvbW1hbmQpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5oYW5kbGVEaXJlY3RDb21tYW5kKG1lc3NhZ2UsIGFyZ3MucmVzdCwgY29udGludWVDb21tYW5kLCBhcmdzLmlnbm9yZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghaWdub3JlKSB7XG5cdFx0XHRcdGlmIChjb21tYW5kLmxvY2spIGtleSA9IChjb21tYW5kLmxvY2sgYXMgS2V5U3VwcGxpZXIpKG1lc3NhZ2UsIGFyZ3MpO1xuXHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2Uoa2V5KSkga2V5ID0gYXdhaXQga2V5O1xuXHRcdFx0XHRpZiAoa2V5KSB7XG5cdFx0XHRcdFx0aWYgKGNvbW1hbmQubG9ja2VyPy5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdFx0a2V5ID0gbnVsbDtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0xPQ0tFRCwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb21tYW5kLmxvY2tlcj8uYWRkKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0YXdhaXQgdGhpcy5ydW5Db21tYW5kKG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGlmIChrZXkpIGNvbW1hbmQubG9ja2VyPy5kZWxldGUoa2V5KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyByZWdleCBhbmQgY29uZGl0aW9uYWwgY29tbWFuZHMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlUmVnZXhBbmRDb25kaXRpb25hbENvbW1hbmRzKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCByYW4xID0gYXdhaXQgdGhpcy5oYW5kbGVSZWdleENvbW1hbmRzKG1lc3NhZ2UpO1xuXHRcdGNvbnN0IHJhbjIgPSBhd2FpdCB0aGlzLmhhbmRsZUNvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZSk7XG5cdFx0cmV0dXJuIHJhbjEgfHwgcmFuMjtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHJlZ2V4IGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZVJlZ2V4Q29tbWFuZHMobWVzc2FnZTogTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IGhhc1JlZ2V4Q29tbWFuZHMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmQgb2YgdGhpcy5tb2R1bGVzLnZhbHVlcygpKSB7XG5cdFx0XHRpZiAobWVzc2FnZS5lZGl0ZWRUaW1lc3RhbXAgPyBjb21tYW5kLmVkaXRhYmxlIDogdHJ1ZSkge1xuXHRcdFx0XHRjb25zdCByZWdleCA9IHR5cGVvZiBjb21tYW5kLnJlZ2V4ID09PSBcImZ1bmN0aW9uXCIgPyBjb21tYW5kLnJlZ2V4KG1lc3NhZ2UpIDogY29tbWFuZC5yZWdleDtcblx0XHRcdFx0aWYgKHJlZ2V4KSBoYXNSZWdleENvbW1hbmRzLnB1c2goeyBjb21tYW5kLCByZWdleCB9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBtYXRjaGVkQ29tbWFuZHMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIGhhc1JlZ2V4Q29tbWFuZHMpIHtcblx0XHRcdGNvbnN0IG1hdGNoID0gbWVzc2FnZS5jb250ZW50Lm1hdGNoKGVudHJ5LnJlZ2V4KTtcblx0XHRcdGlmICghbWF0Y2gpIGNvbnRpbnVlO1xuXG5cdFx0XHRjb25zdCBtYXRjaGVzID0gW107XG5cblx0XHRcdGlmIChlbnRyeS5yZWdleC5nbG9iYWwpIHtcblx0XHRcdFx0bGV0IG1hdGNoZWQ7XG5cblx0XHRcdFx0d2hpbGUgKChtYXRjaGVkID0gZW50cnkucmVnZXguZXhlYyhtZXNzYWdlLmNvbnRlbnQpKSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0bWF0Y2hlcy5wdXNoKG1hdGNoZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG1hdGNoZWRDb21tYW5kcy5wdXNoKHsgY29tbWFuZDogZW50cnkuY29tbWFuZCwgbWF0Y2gsIG1hdGNoZXMgfSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFtYXRjaGVkQ29tbWFuZHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IHsgY29tbWFuZCwgbWF0Y2gsIG1hdGNoZXMgfSBvZiBtYXRjaGVkQ29tbWFuZHMpIHtcblx0XHRcdHByb21pc2VzLnB1c2goXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBiZWZvcmUgPSBjb21tYW5kLmJlZm9yZShtZXNzYWdlKTtcblx0XHRcdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShiZWZvcmUpKSBhd2FpdCBiZWZvcmU7XG5cblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucnVuQ29tbWFuZChtZXNzYWdlLCBjb21tYW5kLCB7IG1hdGNoLCBtYXRjaGVzIH0pO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgY29uZGl0aW9uYWwgY29tbWFuZHMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlOiBNZXNzYWdlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgdHJ1ZUNvbW1hbmRzID0gW107XG5cblx0XHRjb25zdCBmaWx0ZXJQcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgY29tbWFuZCBvZiB0aGlzLm1vZHVsZXMudmFsdWVzKCkpIHtcblx0XHRcdGlmIChtZXNzYWdlLmVkaXRlZFRpbWVzdGFtcCAmJiAhY29tbWFuZC5lZGl0YWJsZSkgY29udGludWU7XG5cdFx0XHRmaWx0ZXJQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGxldCBjb25kID0gY29tbWFuZC5jb25kaXRpb24obWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGNvbmQpKSBjb25kID0gYXdhaXQgY29uZDtcblx0XHRcdFx0XHRpZiAoY29uZCkgdHJ1ZUNvbW1hbmRzLnB1c2goY29tbWFuZCk7XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwoZmlsdGVyUHJvbWlzZXMpO1xuXG5cdFx0aWYgKCF0cnVlQ29tbWFuZHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmQgb2YgdHJ1ZUNvbW1hbmRzKSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHJldHVybjtcblx0XHRcdFx0XHRcdGNvbnN0IGJlZm9yZSA9IGNvbW1hbmQuYmVmb3JlKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGJlZm9yZSkpIGF3YWl0IGJlZm9yZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucnVuQ29tbWFuZChtZXNzYWdlLCBjb21tYW5kLCB7fSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBpbmhpYml0b3JzIHdpdGggdGhlIGFsbCB0eXBlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gc2xhc2ggLSBXaGV0aGVyIG9yIG5vdCB0aGUgY29tbWFuZCBzaG91bGQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1bkFsbFR5cGVJbmhpYml0b3JzKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLCBzbGFzaDogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgcmVhc29uID0gdGhpcy5pbmhpYml0b3JIYW5kbGVyID8gYXdhaXQgdGhpcy5pbmhpYml0b3JIYW5kbGVyLnRlc3QoXCJhbGxcIiwgbWVzc2FnZSkgOiBudWxsO1xuXG5cdFx0aWYgKHJlYXNvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCByZWFzb24pO1xuXHRcdH0gZWxzZSBpZiAoIW1lc3NhZ2UuYXV0aG9yKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCBCdWlsdEluUmVhc29ucy5BVVRIT1JfTk9UX0ZPVU5EKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuYmxvY2tDbGllbnQgJiYgbWVzc2FnZS5hdXRob3IuaWQgPT09IHRoaXMuY2xpZW50LnVzZXI/LmlkKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCBCdWlsdEluUmVhc29ucy5DTElFTlQpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5ibG9ja0JvdHMgJiYgbWVzc2FnZS5hdXRob3IuYm90KSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCBCdWlsdEluUmVhc29ucy5CT1QpO1xuXHRcdH0gZWxzZSBpZiAoIXNsYXNoICYmIHRoaXMuaGFzUHJvbXB0KG1lc3NhZ2UuY2hhbm5lbCwgbWVzc2FnZS5hdXRob3IpKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuSU5fUFJPTVBULCBtZXNzYWdlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgaW5oaWJpdG9ycyB3aXRoIHRoZSBwcmUgdHlwZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW5QcmVUeXBlSW5oaWJpdG9ycyhtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHJlYXNvbiA9IHRoaXMuaW5oaWJpdG9ySGFuZGxlciA/IGF3YWl0IHRoaXMuaW5oaWJpdG9ySGFuZGxlci50ZXN0KFwicHJlXCIsIG1lc3NhZ2UpIDogbnVsbDtcblxuXHRcdGlmIChyZWFzb24gIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCwgbWVzc2FnZSwgcmVhc29uKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgaW5oaWJpdG9ycyB3aXRoIHRoZSBwb3N0IHR5cGUuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBzbGFzaCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIHNob3VsZCBpcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUG9zdFR5cGVJbmhpYml0b3JzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0c2xhc2g6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBldmVudCA9IHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfQkxPQ0tFRCA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfQkxPQ0tFRDtcblxuXHRcdGlmICghdGhpcy5za2lwQnVpbHRJblBvc3RJbmhpYml0b3JzKSB7XG5cdFx0XHRpZiAoY29tbWFuZC5vd25lck9ubHkpIHtcblx0XHRcdFx0Y29uc3QgaXNPd25lciA9IHRoaXMuY2xpZW50LmlzT3duZXIobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0XHRpZiAoIWlzT3duZXIpIHtcblx0XHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLk9XTkVSKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5zdXBlclVzZXJPbmx5KSB7XG5cdFx0XHRcdGNvbnN0IGlzU3VwZXJVc2VyID0gdGhpcy5jbGllbnQuaXNTdXBlclVzZXIobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0XHRpZiAoIWlzU3VwZXJVc2VyKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5TVVBFUl9VU0VSKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5jaGFubmVsID09PSBcImd1aWxkXCIgJiYgIW1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5HVUlMRCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5jaGFubmVsID09PSBcImRtXCIgJiYgbWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLkRNKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb21tYW5kLm9ubHlOc2Z3ICYmICFtZXNzYWdlLmNoYW5uZWxbXCJuc2Z3XCJdKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuTk9UX05TRlcpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuc2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycykge1xuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUGVybWlzc2lvbkNoZWNrcyhtZXNzYWdlLCBjb21tYW5kLCBzbGFzaCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVhc29uID0gdGhpcy5pbmhpYml0b3JIYW5kbGVyID8gYXdhaXQgdGhpcy5pbmhpYml0b3JIYW5kbGVyLnRlc3QoXCJwb3N0XCIsIG1lc3NhZ2UsIGNvbW1hbmQpIDogbnVsbDtcblxuXHRcdGlmICh0aGlzLnNraXBCdWlsdEluUG9zdEluaGliaXRvcnMpIHtcblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBlcm1pc3Npb25DaGVja3MobWVzc2FnZSwgY29tbWFuZCwgc2xhc2gpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChyZWFzb24gIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCByZWFzb24pO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucnVuQ29vbGRvd25zKG1lc3NhZ2UsIGNvbW1hbmQpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBwZXJtaXNzaW9uIGNoZWNrcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gY29vbGRvd24uXG5cdCAqIEBwYXJhbSBzbGFzaCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW5QZXJtaXNzaW9uQ2hlY2tzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0c2xhc2g6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRpZiAoY29tbWFuZC5jbGllbnRQZXJtaXNzaW9ucykge1xuXHRcdFx0aWYgKHR5cGVvZiBjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRsZXQgbWlzc2luZyA9IGNvbW1hbmQuY2xpZW50UGVybWlzc2lvbnMobWVzc2FnZSk7XG5cdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShtaXNzaW5nKSkgbWlzc2luZyA9IGF3YWl0IG1pc3Npbmc7XG5cblx0XHRcdFx0aWYgKG1pc3NpbmcgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFwiY2xpZW50XCIsXG5cdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChtZXNzYWdlLmd1aWxkKSB7XG5cdFx0XHRcdGlmIChtZXNzYWdlLmNoYW5uZWw/LnR5cGUgPT09IFwiRE1cIikgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRjb25zdCBtaXNzaW5nID0gbWVzc2FnZS5jaGFubmVsPy5wZXJtaXNzaW9uc0ZvcihtZXNzYWdlLmd1aWxkLm1lKT8ubWlzc2luZyhjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zKTtcblx0XHRcdFx0aWYgKG1pc3Npbmc/Lmxlbmd0aCkge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFwiY2xpZW50XCIsXG5cdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLnVzZXJQZXJtaXNzaW9ucykge1xuXHRcdFx0Y29uc3QgaWdub3JlciA9IGNvbW1hbmQuaWdub3JlUGVybWlzc2lvbnMgfHwgdGhpcy5pZ25vcmVQZXJtaXNzaW9ucztcblx0XHRcdGNvbnN0IGlzSWdub3JlZCA9IEFycmF5LmlzQXJyYXkoaWdub3Jlcilcblx0XHRcdFx0PyBpZ25vcmVyLmluY2x1ZGVzKG1lc3NhZ2UuYXV0aG9yLmlkKVxuXHRcdFx0XHQ6IHR5cGVvZiBpZ25vcmVyID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdFx0PyBpZ25vcmVyKG1lc3NhZ2UsIGNvbW1hbmQpXG5cdFx0XHRcdDogbWVzc2FnZS5hdXRob3IuaWQgPT09IGlnbm9yZXI7XG5cblx0XHRcdGlmICghaXNJZ25vcmVkKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgY29tbWFuZC51c2VyUGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRsZXQgbWlzc2luZyA9IGNvbW1hbmQudXNlclBlcm1pc3Npb25zKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShtaXNzaW5nKSkgbWlzc2luZyA9IGF3YWl0IG1pc3Npbmc7XG5cblx0XHRcdFx0XHRpZiAobWlzc2luZyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdFx0XHRcdFwidXNlclwiLFxuXHRcdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS5jaGFubmVsPy50eXBlID09PSBcIkRNXCIpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRjb25zdCBtaXNzaW5nID0gbWVzc2FnZS5jaGFubmVsPy5wZXJtaXNzaW9uc0ZvcihtZXNzYWdlLmF1dGhvcik/Lm1pc3NpbmcoY29tbWFuZC51c2VyUGVybWlzc2lvbnMpO1xuXHRcdFx0XHRcdGlmIChtaXNzaW5nPy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdFx0c2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFx0XCJ1c2VyXCIsXG5cdFx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBjb29sZG93bnMgYW5kIGNoZWNrcyBpZiBhIHVzZXIgaXMgdW5kZXIgY29vbGRvd24uXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGNvb2xkb3duLlxuXHQgKi9cblx0cHVibGljIHJ1bkNvb2xkb3ducyhtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSwgY29tbWFuZDogQ29tbWFuZCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGlkID0gbWVzc2FnZS5hdXRob3I/LmlkO1xuXHRcdGNvbnN0IGlnbm9yZXIgPSBjb21tYW5kLmlnbm9yZUNvb2xkb3duIHx8IHRoaXMuaWdub3JlQ29vbGRvd247XG5cdFx0Y29uc3QgaXNJZ25vcmVkID0gQXJyYXkuaXNBcnJheShpZ25vcmVyKVxuXHRcdFx0PyBpZ25vcmVyLmluY2x1ZGVzKGlkKVxuXHRcdFx0OiB0eXBlb2YgaWdub3JlciA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHQ/IGlnbm9yZXIobWVzc2FnZSwgY29tbWFuZClcblx0XHRcdDogaWQgPT09IGlnbm9yZXI7XG5cblx0XHRpZiAoaXNJZ25vcmVkKSByZXR1cm4gZmFsc2U7XG5cblx0XHRjb25zdCB0aW1lID0gY29tbWFuZC5jb29sZG93biAhPSBudWxsID8gY29tbWFuZC5jb29sZG93biA6IHRoaXMuZGVmYXVsdENvb2xkb3duO1xuXHRcdGlmICghdGltZSkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Y29uc3QgZW5kVGltZSA9IG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcCArIHRpbWU7XG5cblx0XHRpZiAoIXRoaXMuY29vbGRvd25zLmhhcyhpZCkpIHRoaXMuY29vbGRvd25zLnNldChpZCwge30pO1xuXG5cdFx0aWYgKCF0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdKSB7XG5cdFx0XHR0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdID0ge1xuXHRcdFx0XHR0aW1lcjogc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF0pIHtcblx0XHRcdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdLnRpbWVyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXSA9IG51bGw7XG5cblx0XHRcdFx0XHRpZiAoIU9iamVjdC5rZXlzKHRoaXMuY29vbGRvd25zLmdldChpZCkpLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jb29sZG93bnMuZGVsZXRlKGlkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHRpbWUpLnVucmVmKCksXG5cdFx0XHRcdGVuZDogZW5kVGltZSxcblx0XHRcdFx0dXNlczogMFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRjb25zdCBlbnRyeSA9IHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF07XG5cblx0XHRpZiAoZW50cnkudXNlcyA+PSBjb21tYW5kLnJhdGVsaW1pdCkge1xuXHRcdFx0Y29uc3QgZW5kID0gdGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXS5lbmQ7XG5cdFx0XHRjb25zdCBkaWZmID0gZW5kIC0gbWVzc2FnZS5jcmVhdGVkVGltZXN0YW1wO1xuXG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09PTERPV04sIG1lc3NhZ2UsIGNvbW1hbmQsIGRpZmYpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0ZW50cnkudXNlcysrO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGFyZ3MgLSBBcmd1bWVudHMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1bkNvbW1hbmQobWVzc2FnZTogTWVzc2FnZSwgY29tbWFuZDogQ29tbWFuZCwgYXJnczogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKCFjb21tYW5kIHx8ICFtZXNzYWdlKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9JTlZBTElELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKGNvbW1hbmQudHlwaW5nIHx8IHRoaXMudHlwaW5nKSB7XG5cdFx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZFR5cGluZygpO1xuXHRcdH1cblxuXHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX1NUQVJURUQsIG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MpO1xuXHRcdGNvbnN0IHJldCA9IGF3YWl0IGNvbW1hbmQuZXhlYyhtZXNzYWdlLCBhcmdzKTtcblx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9GSU5JU0hFRCwgbWVzc2FnZSwgY29tbWFuZCwgYXJncywgcmV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIGNvbW1hbmQgYW5kIGl0cyBhcmd1bWVudCBsaXN0LlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcGFyc2VDb21tYW5kKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlKTogUHJvbWlzZTxQYXJzZWRDb21wb25lbnREYXRhPiB7XG5cdFx0Y29uc3QgYWxsb3dNZW50aW9uID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5wcmVmaXgpKG1lc3NhZ2UpO1xuXHRcdGxldCBwcmVmaXhlcyA9IFV0aWwuaW50b0FycmF5KGFsbG93TWVudGlvbik7XG5cdFx0aWYgKGFsbG93TWVudGlvbikge1xuXHRcdFx0Y29uc3QgbWVudGlvbnMgPSBbYDxAJHt0aGlzLmNsaWVudC51c2VyPy5pZH0+YCwgYDxAISR7dGhpcy5jbGllbnQudXNlcj8uaWR9PmBdO1xuXHRcdFx0cHJlZml4ZXMgPSBbLi4ubWVudGlvbnMsIC4uLnByZWZpeGVzXTtcblx0XHR9XG5cblx0XHRwcmVmaXhlcy5zb3J0KFV0aWwucHJlZml4Q29tcGFyZSk7XG5cdFx0cmV0dXJuIHRoaXMucGFyc2VNdWx0aXBsZVByZWZpeGVzKFxuXHRcdFx0bWVzc2FnZSxcblx0XHRcdHByZWZpeGVzLm1hcChwID0+IFtwLCBudWxsXSlcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgY29tbWFuZCBhbmQgaXRzIGFyZ3VtZW50IGxpc3QgdXNpbmcgcHJlZml4IG92ZXJ3cml0ZXMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBwYXJzZUNvbW1hbmRPdmVyd3JpdHRlblByZWZpeGVzKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlKTogUHJvbWlzZTxQYXJzZWRDb21wb25lbnREYXRhPiB7XG5cdFx0aWYgKCF0aGlzLnByZWZpeGVzLnNpemUpIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cblx0XHRjb25zdCBwcm9taXNlcyA9IHRoaXMucHJlZml4ZXMubWFwKGFzeW5jIChjbWRzLCBwcm92aWRlcikgPT4ge1xuXHRcdFx0Y29uc3QgcHJlZml4ZXMgPSBVdGlsLmludG9BcnJheShhd2FpdCBVdGlsLmludG9DYWxsYWJsZShwcm92aWRlcikobWVzc2FnZSkpO1xuXHRcdFx0cmV0dXJuIHByZWZpeGVzLm1hcChwID0+IFtwLCBjbWRzXSk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBwYWlycyA9IFV0aWwuZmxhdE1hcChhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyksIHggPT4geCk7XG5cdFx0cGFpcnMuc29ydCgoW2FdLCBbYl0pID0+IFV0aWwucHJlZml4Q29tcGFyZShhLCBiKSk7XG5cdFx0cmV0dXJuIHRoaXMucGFyc2VNdWx0aXBsZVByZWZpeGVzKG1lc3NhZ2UsIHBhaXJzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIHBhcnNlV2l0aFByZWZpeCBvbiBtdWx0aXBsZSBwcmVmaXhlcyBhbmQgcmV0dXJucyB0aGUgYmVzdCBwYXJzZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHBhcnNlLlxuXHQgKiBAcGFyYW0gcGFpcnMgLSBQYWlycyBvZiBwcmVmaXggdG8gYXNzb2NpYXRlZCBjb21tYW5kcy4gVGhhdCBpcywgYFtzdHJpbmcsIFNldDxzdHJpbmc+IHwgbnVsbF1bXWAuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VNdWx0aXBsZVByZWZpeGVzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdHBhaXJzOiBbc3RyaW5nLCBTZXQ8c3RyaW5nPiB8IG51bGxdW11cblx0KTogUGFyc2VkQ29tcG9uZW50RGF0YSB7XG5cdFx0Y29uc3QgcGFyc2VzID0gcGFpcnMubWFwKChbcHJlZml4LCBjbWRzXSkgPT4gdGhpcy5wYXJzZVdpdGhQcmVmaXgobWVzc2FnZSwgcHJlZml4LCBjbWRzKSk7XG5cdFx0Y29uc3QgcmVzdWx0ID0gcGFyc2VzLmZpbmQocGFyc2VkID0+IHBhcnNlZC5jb21tYW5kKTtcblx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGNvbnN0IGd1ZXNzID0gcGFyc2VzLmZpbmQocGFyc2VkID0+IHBhcnNlZC5wcmVmaXggIT0gbnVsbCk7XG5cdFx0aWYgKGd1ZXNzKSB7XG5cdFx0XHRyZXR1cm4gZ3Vlc3M7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWVzIHRvIHBhcnNlIGEgbWVzc2FnZSB3aXRoIHRoZSBnaXZlbiBwcmVmaXggYW5kIGFzc29jaWF0ZWQgY29tbWFuZHMuXG5cdCAqIEFzc29jaWF0ZWQgY29tbWFuZHMgcmVmZXIgdG8gd2hlbiBhIHByZWZpeCBpcyB1c2VkIGluIHByZWZpeCBvdmVycmlkZXMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBwYXJzZS5cblx0ICogQHBhcmFtIHByZWZpeCAtIFByZWZpeCB0byB1c2UuXG5cdCAqIEBwYXJhbSBhc3NvY2lhdGVkQ29tbWFuZHMgLSBBc3NvY2lhdGVkIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIHBhcnNlV2l0aFByZWZpeChcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRwcmVmaXg6IHN0cmluZyxcblx0XHRhc3NvY2lhdGVkQ29tbWFuZHM6IFNldDxzdHJpbmc+IHwgbnVsbCA9IG51bGxcblx0KTogUGFyc2VkQ29tcG9uZW50RGF0YSB7XG5cdFx0Y29uc3QgbG93ZXJDb250ZW50ID0gbWVzc2FnZS5jb250ZW50LnRvTG93ZXJDYXNlKCk7XG5cdFx0aWYgKCFsb3dlckNvbnRlbnQuc3RhcnRzV2l0aChwcmVmaXgudG9Mb3dlckNhc2UoKSkpIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cblx0XHRjb25zdCBlbmRPZlByZWZpeCA9IGxvd2VyQ29udGVudC5pbmRleE9mKHByZWZpeC50b0xvd2VyQ2FzZSgpKSArIHByZWZpeC5sZW5ndGg7XG5cdFx0Y29uc3Qgc3RhcnRPZkFyZ3MgPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2UoZW5kT2ZQcmVmaXgpLnNlYXJjaCgvXFxTLykgKyBwcmVmaXgubGVuZ3RoO1xuXHRcdGNvbnN0IGFsaWFzID0gbWVzc2FnZS5jb250ZW50LnNsaWNlKHN0YXJ0T2ZBcmdzKS5zcGxpdCgvXFxzezEsfXxcXG57MSx9LylbMF07XG5cdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMuZmluZENvbW1hbmQoYWxpYXMpO1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2Uoc3RhcnRPZkFyZ3MgKyBhbGlhcy5sZW5ndGggKyAxKS50cmltKCk7XG5cdFx0Y29uc3QgYWZ0ZXJQcmVmaXggPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2UocHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuXG5cdFx0aWYgKCFjb21tYW5kKSB7XG5cdFx0XHRyZXR1cm4geyBwcmVmaXgsIGFsaWFzLCBjb250ZW50LCBhZnRlclByZWZpeCB9O1xuXHRcdH1cblxuXHRcdGlmIChhc3NvY2lhdGVkQ29tbWFuZHMgPT0gbnVsbCkge1xuXHRcdFx0aWYgKGNvbW1hbmQucHJlZml4ICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHsgcHJlZml4LCBhbGlhcywgY29udGVudCwgYWZ0ZXJQcmVmaXggfTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFhc3NvY2lhdGVkQ29tbWFuZHMuaGFzKGNvbW1hbmQuaWQpKSB7XG5cdFx0XHRyZXR1cm4geyBwcmVmaXgsIGFsaWFzLCBjb250ZW50LCBhZnRlclByZWZpeCB9O1xuXHRcdH1cblxuXHRcdHJldHVybiB7IGNvbW1hbmQsIHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBlcnJvcnMgZnJvbSB0aGUgaGFuZGxpbmcuXG5cdCAqIEBwYXJhbSBlcnIgLSBUaGUgZXJyb3IuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRoYXQgZXJyb3JlZC5cblx0ICovXG5cdHB1YmxpYyBlbWl0RXJyb3IoZXJyOiBFcnJvciwgbWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsIGNvbW1hbmQ/OiBDb21tYW5kIHwgQWthaXJvTW9kdWxlKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMubGlzdGVuZXJDb3VudChDb21tYW5kSGFuZGxlckV2ZW50cy5FUlJPUikpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5FUlJPUiwgZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aHJvdyBlcnI7XG5cdH1cblxuXHQvKipcblx0ICogU3dlZXAgY29tbWFuZCB1dGlsIGluc3RhbmNlcyBmcm9tIGNhY2hlIGFuZCByZXR1cm5zIGFtb3VudCBzd2VlcGVkLlxuXHQgKiBAcGFyYW0gbGlmZXRpbWUgLSBNZXNzYWdlcyBvbGRlciB0aGFuIHRoaXMgd2lsbCBoYXZlIHRoZWlyIGNvbW1hbmQgdXRpbCBpbnN0YW5jZSBzd2VlcGVkLiBUaGlzIGlzIGluIG1pbGxpc2Vjb25kcyBhbmQgZGVmYXVsdHMgdG8gdGhlIGBjb21tYW5kVXRpbExpZmV0aW1lYCBvcHRpb24uXG5cdCAqL1xuXHRwdWJsaWMgc3dlZXBDb21tYW5kVXRpbChsaWZldGltZTogbnVtYmVyID0gdGhpcy5jb21tYW5kVXRpbExpZmV0aW1lKTogbnVtYmVyIHtcblx0XHRsZXQgY291bnQgPSAwO1xuXHRcdGZvciAoY29uc3QgY29tbWFuZFV0aWwgb2YgdGhpcy5jb21tYW5kVXRpbHMudmFsdWVzKCkpIHtcblx0XHRcdGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG5cdFx0XHRjb25zdCBtZXNzYWdlID0gY29tbWFuZFV0aWwubWVzc2FnZTtcblx0XHRcdGlmIChub3cgLSAoKG1lc3NhZ2UgYXMgTWVzc2FnZSkuZWRpdGVkVGltZXN0YW1wIHx8IG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcCkgPiBsaWZldGltZSkge1xuXHRcdFx0XHRjb3VudCsrO1xuXHRcdFx0XHR0aGlzLmNvbW1hbmRVdGlscy5kZWxldGUobWVzc2FnZS5pZCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvdW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYW4gb25nb2luZyBwcm9tcHQgaW4gb3JkZXIgdG8gcHJldmVudCBjb21tYW5kIHVzYWdlIGluIHRoZSBjaGFubmVsLlxuXHQgKiBAcGFyYW0gY2hhbm5lbCAtIENoYW5uZWwgdG8gYWRkIHRvLlxuXHQgKiBAcGFyYW0gdXNlciAtIFVzZXIgdG8gYWRkLlxuXHQgKi9cblx0cHVibGljIGFkZFByb21wdChjaGFubmVsOiBUZXh0QmFzZWRDaGFubmVscywgdXNlcjogVXNlcik6IHZvaWQge1xuXHRcdGxldCB1c2VycyA9IHRoaXMucHJvbXB0cy5nZXQoY2hhbm5lbC5pZCk7XG5cdFx0aWYgKCF1c2VycykgdGhpcy5wcm9tcHRzLnNldChjaGFubmVsLmlkLCBuZXcgU2V0KCkpO1xuXHRcdHVzZXJzID0gdGhpcy5wcm9tcHRzLmdldChjaGFubmVsLmlkKTtcblx0XHR1c2Vycz8uYWRkKHVzZXIuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYW4gb25nb2luZyBwcm9tcHQuXG5cdCAqIEBwYXJhbSBjaGFubmVsIC0gQ2hhbm5lbCB0byByZW1vdmUgZnJvbS5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIHJlbW92ZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVQcm9tcHQoY2hhbm5lbDogVGV4dEJhc2VkQ2hhbm5lbHMsIHVzZXI6IFVzZXIpOiB2b2lkIHtcblx0XHRjb25zdCB1c2VycyA9IHRoaXMucHJvbXB0cy5nZXQoY2hhbm5lbC5pZCk7XG5cdFx0aWYgKCF1c2VycykgcmV0dXJuO1xuXHRcdHVzZXJzLmRlbGV0ZSh1c2VyLmlkKTtcblx0XHRpZiAoIXVzZXJzLnNpemUpIHRoaXMucHJvbXB0cy5kZWxldGUodXNlci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZXJlIGlzIGFuIG9uZ29pbmcgcHJvbXB0LlxuXHQgKiBAcGFyYW0gY2hhbm5lbCAtIENoYW5uZWwgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSB1c2VyIC0gVXNlciB0byBjaGVjay5cblx0ICovXG5cdHB1YmxpYyBoYXNQcm9tcHQoY2hhbm5lbDogVGV4dEJhc2VkQ2hhbm5lbHMsIHVzZXI6IFVzZXIpOiBib29sZWFuIHtcblx0XHRjb25zdCB1c2VycyA9IHRoaXMucHJvbXB0cy5nZXQoY2hhbm5lbC5pZCk7XG5cdFx0aWYgKCF1c2VycykgcmV0dXJuIGZhbHNlO1xuXHRcdHJldHVybiB1c2Vycy5oYXModXNlci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjb21tYW5kIGJ5IGFsaWFzLlxuXHQgKiBAcGFyYW0gbmFtZSAtIEFsaWFzIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBmaW5kQ29tbWFuZChuYW1lOiBzdHJpbmcpOiBDb21tYW5kIHtcblx0XHRyZXR1cm4gdGhpcy5tb2R1bGVzLmdldCh0aGlzLmFsaWFzZXMuZ2V0KG5hbWUudG9Mb3dlckNhc2UoKSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgaW5oaWJpdG9yIGhhbmRsZXIgdG8gdXNlLlxuXHQgKiBAcGFyYW0gaW5oaWJpdG9ySGFuZGxlciAtIFRoZSBpbmhpYml0b3IgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyB1c2VJbmhpYml0b3JIYW5kbGVyKGluaGliaXRvckhhbmRsZXI6IEluaGliaXRvckhhbmRsZXIpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0dGhpcy5pbmhpYml0b3JIYW5kbGVyID0gaW5oaWJpdG9ySGFuZGxlcjtcblx0XHR0aGlzLnJlc29sdmVyLmluaGliaXRvckhhbmRsZXIgPSBpbmhpYml0b3JIYW5kbGVyO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBsaXN0ZW5lciBoYW5kbGVyIHRvIHVzZS5cblx0ICogQHBhcmFtIGxpc3RlbmVySGFuZGxlciAtIFRoZSBsaXN0ZW5lciBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIHVzZUxpc3RlbmVySGFuZGxlcihsaXN0ZW5lckhhbmRsZXI6IExpc3RlbmVySGFuZGxlcik6IENvbW1hbmRIYW5kbGVyIHtcblx0XHR0aGlzLnJlc29sdmVyLmxpc3RlbmVySGFuZGxlciA9IGxpc3RlbmVySGFuZGxlcjtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWQodGhpbmc6IHN0cmluZyB8IENvbW1hbmQpOiBDb21tYW5kIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZykgYXMgQ29tbWFuZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgY29tbWFuZHMgZnJvbSB0aGUgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS4gRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWRBbGwoZGlyZWN0b3J5Pzogc3RyaW5nLCBmaWx0ZXI/OiBMb2FkUHJlZGljYXRlKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5sb2FkQWxsKGRpcmVjdG9yeSwgZmlsdGVyKSBhcyBDb21tYW5kSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBDb21tYW5kIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBDb21tYW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIENvbW1hbmRIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoaWQ6IHN0cmluZyk6IENvbW1hbmQge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoaWQpIGFzIENvbW1hbmQ7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkQWxsKCk6IENvbW1hbmRIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkQWxsKCkgYXMgQ29tbWFuZEhhbmRsZXI7XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kSGFuZGxlck9wdGlvbnMgZXh0ZW5kcyBBa2Fpcm9IYW5kbGVyT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBSZWd1bGFyIGV4cHJlc3Npb24gdG8gYXV0b21hdGljYWxseSBtYWtlIGNvbW1hbmQgYWxpYXNlcy5cblx0ICogRm9yIGV4YW1wbGUsIHVzaW5nIGAvLS9nYCB3b3VsZCBtZWFuIHRoYXQgYWxpYXNlcyBjb250YWluaW5nIGAtYCB3b3VsZCBiZSB2YWxpZCB3aXRoIGFuZCB3aXRob3V0IGl0LlxuXHQgKiBTbywgdGhlIGFsaWFzIGBjb21tYW5kLW5hbWVgIGlzIHZhbGlkIGFzIGJvdGggYGNvbW1hbmQtbmFtZWAgYW5kIGBjb21tYW5kbmFtZWAuXG5cdCAqL1xuXHRhbGlhc1JlcGxhY2VtZW50PzogUmVnRXhwO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhbGxvdyBtZW50aW9ucyB0byB0aGUgY2xpZW50IHVzZXIgYXMgYSBwcmVmaXguXG5cdCAqL1xuXHRhbGxvd01lbnRpb24/OiBib29sZWFuIHwgTWVudGlvblByZWZpeFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogRGVmYXVsdCBhcmd1bWVudCBvcHRpb25zLlxuXHQgKi9cblx0YXJndW1lbnREZWZhdWx0cz86IERlZmF1bHRBcmd1bWVudE9wdGlvbnM7XG5cblx0LyoqXG5cdCAqIEF1dG9tYXRpY2FsbHkgZGVmZXIgbWVzc2FnZXMgXCJCb3ROYW1lIGlzIHRoaW5raW5nXCJcblx0ICovXG5cdGF1dG9EZWZlcj86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNwZWNpZnkgd2hldGhlciB0byByZWdpc3RlciBhbGwgc2xhc2ggY29tbWFuZHMgd2hlbiBzdGFydGluZyB0aGUgY2xpZW50LlxuXHQgKi9cblx0YXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGJsb2NrIGJvdHMuXG5cdCAqL1xuXHRibG9ja0JvdHM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBzZWxmLlxuXHQgKi9cblx0YmxvY2tDbGllbnQ/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhc3NpZ24gYG1lc3NhZ2UudXRpbGAuXG5cdCAqL1xuXHRjb21tYW5kVXRpbD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIE1pbGxpc2Vjb25kcyBhIG1lc3NhZ2Ugc2hvdWxkIGV4aXN0IGZvciBiZWZvcmUgaXRzIGNvbW1hbmQgdXRpbCBpbnN0YW5jZSBpcyBtYXJrZWQgZm9yIHJlbW92YWwuXG5cdCAqIElmIDAsIENvbW1hbmRVdGlsIGluc3RhbmNlcyB3aWxsIG5ldmVyIGJlIHJlbW92ZWQgYW5kIHdpbGwgY2F1c2UgbWVtb3J5IHRvIGluY3JlYXNlIGluZGVmaW5pdGVseS5cblx0ICovXG5cdGNvbW1hbmRVdGlsTGlmZXRpbWU/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRpbWUgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzIGZvciBzd2VlcGluZyBjb21tYW5kIHV0aWwgaW5zdGFuY2VzLlxuXHQgKiBJZiAwLCBDb21tYW5kVXRpbCBpbnN0YW5jZXMgd2lsbCBuZXZlciBiZSByZW1vdmVkIGFuZCB3aWxsIGNhdXNlIG1lbW9yeSB0byBpbmNyZWFzZSBpbmRlZmluaXRlbHkuXG5cdCAqL1xuXHRjb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWw/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgY29vbGRvd24gZm9yIGNvbW1hbmRzLlxuXHQgKi9cblx0ZGVmYXVsdENvb2xkb3duPzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBtZW1iZXJzIGFyZSBmZXRjaGVkIG9uIGVhY2ggbWVzc2FnZSBhdXRob3IgZnJvbSBhIGd1aWxkLlxuXHQgKi9cblx0ZmV0Y2hNZW1iZXJzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gaGFuZGxlIGVkaXRlZCBtZXNzYWdlcyB1c2luZyBDb21tYW5kVXRpbC5cblx0ICovXG5cdGhhbmRsZUVkaXRzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgY29vbGRvd24gb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuIERlZmF1bHRzIHRvIHRoZSBjbGllbnQgb3duZXIocykuXG5cdCAqL1xuXHRpZ25vcmVDb29sZG93bj86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGB1c2VyUGVybWlzc2lvbnNgIGNoZWNrcyBvciBhIGZ1bmN0aW9uIHRvIGlnbm9yZS5cblx0ICovXG5cdGlnbm9yZVBlcm1pc3Npb25zPzogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gfCBJZ25vcmVDaGVja1ByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogVGhlIHByZWZpeChlcykgZm9yIGNvbW1hbmQgcGFyc2luZy5cblx0ICovXG5cdHByZWZpeD86IHN0cmluZyB8IHN0cmluZ1tdIHwgUHJlZml4U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHN0b3JlIG1lc3NhZ2VzIGluIENvbW1hbmRVdGlsLlxuXHQgKi9cblx0c3RvcmVNZXNzYWdlcz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNob3cgXCJCb3ROYW1lIGlzIHR5cGluZ1wiIGluZm9ybWF0aW9uIG1lc3NhZ2Ugb24gdGhlIHRleHQgY2hhbm5lbHMgd2hlbiBhIGNvbW1hbmQgaXMgcnVubmluZy5cblx0ICovXG5cdHR5cGluZz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHVzZSBleGVjU2xhc2ggZm9yIHNsYXNoIGNvbW1hbmRzLlxuXHQgKi9cblx0ZXhlY1NsYXNoPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc2tpcCBidWlsdCBpbiByZWFzb25zIHBvc3QgdHlwZSBpbmhpYml0b3JzIHNvIHlvdSBjYW4gbWFrZSBjdXN0b20gb25lcy5cblx0ICovXG5cdHNraXBCdWlsdEluUG9zdEluaGliaXRvcnM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERhdGEgZm9yIG1hbmFnaW5nIGNvb2xkb3ducy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb29sZG93bkRhdGEge1xuXHQvKipcblx0ICogV2hlbiB0aGUgY29vbGRvd24gZW5kcy5cblx0ICovXG5cdGVuZDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaW1lb3V0IG9iamVjdC5cblx0ICovXG5cdHRpbWVyOiBOb2RlSlMuVGltZXI7XG5cblx0LyoqXG5cdCAqIE51bWJlciBvZiB0aW1lcyB0aGUgY29tbWFuZCBoYXMgYmVlbiB1c2VkLlxuXHQgKi9cblx0dXNlczogbnVtYmVyO1xufVxuXG4vKipcbiAqIFZhcmlvdXMgcGFyc2VkIGNvbXBvbmVudHMgb2YgdGhlIG1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQ29tcG9uZW50RGF0YSB7XG5cdC8qKlxuXHQgKiBUaGUgY29udGVudCB0byB0aGUgcmlnaHQgb2YgdGhlIHByZWZpeC5cblx0ICovXG5cdGFmdGVyUHJlZml4Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgYWxpYXMgdXNlZC5cblx0ICovXG5cdGFsaWFzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCB1c2VkLlxuXHQgKi9cblx0Y29tbWFuZD86IENvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBjb250ZW50IHRvIHRoZSByaWdodCBvZiB0aGUgYWxpYXMuXG5cdCAqL1xuXHRjb250ZW50Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgcHJlZml4IHVzZWQuXG5cdCAqL1xuXHRwcmVmaXg/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgd2hldGhlciB0aGlzIG1lc3NhZ2Ugc2hvdWxkIGJlIGlnbm9yZWQgZm9yIGEgY2VydGFpbiBjaGVjay5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBjaGVjay5cbiAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBjaGVjay5cbiAqL1xuZXhwb3J0IHR5cGUgSWdub3JlQ2hlY2tQcmVkaWNhdGUgPSAobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsIGNvbW1hbmQ6IENvbW1hbmQpID0+IGJvb2xlYW47XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgd2hldGhlciBtZW50aW9ucyBjYW4gYmUgdXNlZCBhcyBhIHByZWZpeC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBvcHRpb24gZm9yLlxuICovXG5leHBvcnQgdHlwZSBNZW50aW9uUHJlZml4UHJlZGljYXRlID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBwcmVmaXgoZXMpIHRvIHVzZS5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBnZXQgcHJlZml4IGZvci5cbiAqL1xuZXhwb3J0IHR5cGUgUHJlZml4U3VwcGxpZXIgPSAobWVzc2FnZTogTWVzc2FnZSkgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCBQcm9taXNlPHN0cmluZyB8IHN0cmluZ1tdPjtcbiJdfQ==