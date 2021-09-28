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
    constructor(client, { directory, classToHandle = Command_1.default, extensions = [".js", ".ts"], automateCategories, loadFilter, blockClient = true, blockBots = true, fetchMembers = false, handleEdits = false, storeMessages = false, commandUtil, commandUtilLifetime = 3e5, commandUtilSweepInterval = 3e5, defaultCooldown = 0, ignoreCooldown = client.ownerID, ignorePermissions = [], argumentDefaults = {}, prefix = "!", allowMention = true, aliasReplacement, autoDefer = false, typing = false, autoRegisterSlashCommands = false, execSlash = false, skipBuiltInPostInhibitors = false, useSlashPermissions = false } = {}) {
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
        this.blockClient = Boolean(blockClient);
        this.blockBots = Boolean(blockBots);
        this.fetchMembers = Boolean(fetchMembers);
        this.handleEdits = Boolean(handleEdits);
        this.storeMessages = Boolean(storeMessages);
        this.commandUtil = Boolean(commandUtil);
        if ((this.handleEdits || this.storeMessages) && !this.commandUtil)
            throw new AkairoError_1.default("COMMAND_UTIL_EXPLICIT");
        this.commandUtilLifetime = commandUtilLifetime;
        this.commandUtilSweepInterval = commandUtilSweepInterval;
        if (this.commandUtilSweepInterval > 0)
            setInterval(() => this.sweepCommandUtil(), this.commandUtilSweepInterval).unref();
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
        this.allowMention = typeof allowMention === "function" ? allowMention.bind(this) : Boolean(allowMention);
        this.inhibitorHandler = null;
        this.autoDefer = Boolean(autoDefer);
        this.execSlash = Boolean(execSlash);
        this.skipBuiltInPostInhibitors = Boolean(skipBuiltInPostInhibitors);
        this.useSlashPermissions = Boolean(useSlashPermissions);
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
    /**
     * Use slash command permissions for owner only commands
     * Warning: this is experimental
     */
    useSlashPermissions;
    /**
     * Set up the command handler
     */
    setup() {
        this.client.once("ready", () => {
            if (this.autoRegisterSlashCommands)
                this.registerInteractionCommands().then(() => {
                    if (this.useSlashPermissions)
                        this.updateInteractionPermissions(this.client.ownerID /*  this.client.superUserID */);
                });
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
    /**
     * Registers interaction commands.
     */
    async registerInteractionCommands() {
        const parsedSlashCommands = [];
        const guildSlashCommandsParsed = new discord_js_1.Collection();
        const parseDescriptionCommand = (description) => {
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
                name: data.aliases[0]?.toLowerCase() || data.id?.toLowerCase(),
                description: parseDescriptionCommand(data.description) || "No description provided.",
                options: data.slashOptions,
                guilds: data.slashGuilds ?? [],
                defaultPermission: !(data.ownerOnly || /* data.superUserOnly || */ false),
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
                    defaultPermission: this.useSlashPermissions ? !(data.ownerOnly || /* data.superUserOnly || */ false) : true,
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
                    { name, description: description, options: options, defaultPermission, type }
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
    /**
     * updates interaction permissions
     */
    async updateInteractionPermissions(owners /* superUsers: Snowflake | Snowflake[] */) {
        const mapCom = (value) => {
            const command = this.modules.find(mod => mod.aliases[0] === value.name);
            let allowedUsers = [];
            /* if (command.superUserOnly) allowedUsers.push(...Util.intoArray(superUsers)); */
            if (command?.ownerOnly)
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
        const globalCommands = (await this.client.application?.commands.fetch())?.filter(value => Boolean(this.modules.find(mod => mod.aliases[0] === value.name)));
        const fullPermissions = globalCommands
            ?.filter(value => !value.defaultPermission)
            .filter(value => Boolean(this.modules.find(mod => mod.aliases[0] === value.name)))
            .map(value => mapCom(value));
        const promises = this.client.guilds.cache.map(async (guild) => {
            const perms = new Array(...(fullPermissions ?? []));
            await guild.commands.fetch();
            if (guild.commands.cache.size)
                perms.push(...guild.commands.cache.filter(value => !value.defaultPermission).map(value => mapCom(value)));
            if (guild.available)
                return guild.commands.permissions.set({
                    fullPermissions: perms
                });
            // Return empty promise if guild is unavailable
            return Promise.resolve();
        });
        try {
            await Promise.all(promises);
        }
        catch (e) {
            /* eslint-disable no-console */
            console.debug(promises);
            console.debug(globalCommands);
            console.debug(fullPermissions);
            /* eslint-enable no-console */
            throw e;
        }
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
                    prefixes?.delete(command.prefix);
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
        const message = new AkairoMessage_1.default(this.client, interaction);
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
            interaction.options.data.forEach(option => {
                switch (option.type) {
                    case "STRING":
                        convertedOptions[option.name] = option.value;
                        break;
                    case "INTEGER":
                        convertedOptions[option.name] = option.value;
                        break;
                    case "BOOLEAN":
                        convertedOptions[option.name] = option.value;
                        break;
                    case "NUMBER":
                        convertedOptions[option.name] = option.value;
                        break;
                    case "USER": {
                        const thing = { user: option.user, member: option.member };
                        convertedOptions[option.name] = thing;
                        break;
                    }
                    case "CHANNEL":
                        convertedOptions[option.name] = option.channel;
                        break;
                    case "ROLE":
                        convertedOptions[option.name] = option.role;
                        break;
                    case "MENTIONABLE":
                        convertedOptions[option.name] = option.role ? option.role : { user: option.user, member: option.member };
                }
                // convertedOptions[option.name] = option
            });
            let key;
            try {
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
                const ret = Object.getOwnPropertyNames(Object.getPrototypeOf(command)).includes("execSlash") || this.execSlash
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
            if (command.onlyNsfw && !message.channel?.["nsfw"]) {
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
        const pairs = Util_1.default.flatMap(await Promise.all(promises), (x) => x);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBYW9CO0FBQ3BCLG9EQUF1QjtBQUV2Qix5RUFBaUQ7QUFDakQsNkVBQXFEO0FBRXJELG9EQUE0RTtBQUM1RSwyREFBbUM7QUFFbkMscUVBQXNGO0FBRXRGLGlIQUF5RjtBQUl6Riw0RUFBb0Q7QUFDcEQsd0RBQWlEO0FBQ2pELGdFQUF3QztBQUN4QyxrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLGNBQWUsU0FBUSx1QkFBYTtJQUN4RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxpQkFBTyxFQUN2QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEVBQ1YsV0FBVyxHQUFHLElBQUksRUFDbEIsU0FBUyxHQUFHLElBQUksRUFDaEIsWUFBWSxHQUFHLEtBQUssRUFDcEIsV0FBVyxHQUFHLEtBQUssRUFDbkIsYUFBYSxHQUFHLEtBQUssRUFDckIsV0FBVyxFQUNYLG1CQUFtQixHQUFHLEdBQUcsRUFDekIsd0JBQXdCLEdBQUcsR0FBRyxFQUM5QixlQUFlLEdBQUcsQ0FBQyxFQUNuQixjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFDL0IsaUJBQWlCLEdBQUcsRUFBRSxFQUN0QixnQkFBZ0IsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxHQUFHLEVBQ1osWUFBWSxHQUFHLElBQUksRUFDbkIsZ0JBQWdCLEVBQ2hCLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLEVBQ2QseUJBQXlCLEdBQUcsS0FBSyxFQUNqQyxTQUFTLEdBQUcsS0FBSyxFQUNqQix5QkFBeUIsR0FBRyxLQUFLLEVBQ2pDLG1CQUFtQixHQUFH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djZDRCxpQ0F1NkNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0QXBwbGljYXRpb25Db21tYW5kLFxuXHRBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25EYXRhLFxuXHRBd2FpdGVkLFxuXHRDb2xsZWN0aW9uLFxuXHRDb21tYW5kSW50ZXJhY3Rpb24sXG5cdEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbkRhdGEsXG5cdEd1aWxkUmVzb2x2YWJsZSxcblx0TWVzc2FnZSxcblx0U25vd2ZsYWtlLFxuXHRUZXh0QmFzZWRDaGFubmVscyxcblx0VGV4dENoYW5uZWwsXG5cdFVzZXJcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IENvbW1hbmRIYW5kbGVyRXZlbnRzIGFzIENvbW1hbmRIYW5kbGVyRXZlbnRzVHlwZSB9IGZyb20gXCIuLi8uLi90eXBpbmdzL2V2ZW50c1wiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQWthaXJvTWVzc2FnZSBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9NZXNzYWdlXCI7XG5pbXBvcnQgQ2F0ZWdvcnkgZnJvbSBcIi4uLy4uL3V0aWwvQ2F0ZWdvcnlcIjtcbmltcG9ydCB7IEJ1aWx0SW5SZWFzb25zLCBDb21tYW5kSGFuZGxlckV2ZW50cyB9IGZyb20gXCIuLi8uLi91dGlsL0NvbnN0YW50c1wiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQWthaXJvSGFuZGxlciwgeyBBa2Fpcm9IYW5kbGVyT3B0aW9ucywgTG9hZFByZWRpY2F0ZSB9IGZyb20gXCIuLi9Ba2Fpcm9IYW5kbGVyXCI7XG5pbXBvcnQgQWthaXJvTW9kdWxlIGZyb20gXCIuLi9Ba2Fpcm9Nb2R1bGVcIjtcbmltcG9ydCBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyIGZyb20gXCIuLi9jb250ZXh0TWVudUNvbW1hbmRzL0NvbnRleHRNZW51Q29tbWFuZEhhbmRsZXJcIjtcbmltcG9ydCBJbmhpYml0b3JIYW5kbGVyIGZyb20gXCIuLi9pbmhpYml0b3JzL0luaGliaXRvckhhbmRsZXJcIjtcbmltcG9ydCBMaXN0ZW5lckhhbmRsZXIgZnJvbSBcIi4uL2xpc3RlbmVycy9MaXN0ZW5lckhhbmRsZXJcIjtcbmltcG9ydCB7IERlZmF1bHRBcmd1bWVudE9wdGlvbnMgfSBmcm9tIFwiLi9hcmd1bWVudHMvQXJndW1lbnRcIjtcbmltcG9ydCBUeXBlUmVzb2x2ZXIgZnJvbSBcIi4vYXJndW1lbnRzL1R5cGVSZXNvbHZlclwiO1xuaW1wb3J0IENvbW1hbmQsIHsgS2V5U3VwcGxpZXIgfSBmcm9tIFwiLi9Db21tYW5kXCI7XG5pbXBvcnQgQ29tbWFuZFV0aWwgZnJvbSBcIi4vQ29tbWFuZFV0aWxcIjtcbmltcG9ydCBGbGFnIGZyb20gXCIuL0ZsYWdcIjtcblxuLyoqXG4gKiBMb2FkcyBjb21tYW5kcyBhbmQgaGFuZGxlcyBtZXNzYWdlcy5cbiAqIEBwYXJhbSBjbGllbnQgLSBUaGUgQWthaXJvIGNsaWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tbWFuZEhhbmRsZXIgZXh0ZW5kcyBBa2Fpcm9IYW5kbGVyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNsaWVudDogQWthaXJvQ2xpZW50LFxuXHRcdHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUgPSBDb21tYW5kLFxuXHRcdFx0ZXh0ZW5zaW9ucyA9IFtcIi5qc1wiLCBcIi50c1wiXSxcblx0XHRcdGF1dG9tYXRlQ2F0ZWdvcmllcyxcblx0XHRcdGxvYWRGaWx0ZXIsXG5cdFx0XHRibG9ja0NsaWVudCA9IHRydWUsXG5cdFx0XHRibG9ja0JvdHMgPSB0cnVlLFxuXHRcdFx0ZmV0Y2hNZW1iZXJzID0gZmFsc2UsXG5cdFx0XHRoYW5kbGVFZGl0cyA9IGZhbHNlLFxuXHRcdFx0c3RvcmVNZXNzYWdlcyA9IGZhbHNlLFxuXHRcdFx0Y29tbWFuZFV0aWwsXG5cdFx0XHRjb21tYW5kVXRpbExpZmV0aW1lID0gM2U1LFxuXHRcdFx0Y29tbWFuZFV0aWxTd2VlcEludGVydmFsID0gM2U1LFxuXHRcdFx0ZGVmYXVsdENvb2xkb3duID0gMCxcblx0XHRcdGlnbm9yZUNvb2xkb3duID0gY2xpZW50Lm93bmVySUQsXG5cdFx0XHRpZ25vcmVQZXJtaXNzaW9ucyA9IFtdLFxuXHRcdFx0YXJndW1lbnREZWZhdWx0cyA9IHt9LFxuXHRcdFx0cHJlZml4ID0gXCIhXCIsXG5cdFx0XHRhbGxvd01lbnRpb24gPSB0cnVlLFxuXHRcdFx0YWxpYXNSZXBsYWNlbWVudCxcblx0XHRcdGF1dG9EZWZlciA9IGZhbHNlLFxuXHRcdFx0dHlwaW5nID0gZmFsc2UsXG5cdFx0XHRhdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzID0gZmFsc2UsXG5cdFx0XHRleGVjU2xhc2ggPSBmYWxzZSxcblx0XHRcdHNraXBCdWlsdEluUG9zdEluaGliaXRvcnMgPSBmYWxzZSxcblx0XHRcdHVzZVNsYXNoUGVybWlzc2lvbnMgPSBmYWxzZVxuXHRcdH06IENvbW1hbmRIYW5kbGVyT3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdGlmICghKGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgQ29tbWFuZCB8fCBjbGFzc1RvSGFuZGxlID09PSBDb21tYW5kKSkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiSU5WQUxJRF9DTEFTU19UT19IQU5ETEVcIiwgY2xhc3NUb0hhbmRsZS5uYW1lLCBDb21tYW5kLm5hbWUpO1xuXHRcdH1cblxuXHRcdHN1cGVyKGNsaWVudCwge1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSxcblx0XHRcdGV4dGVuc2lvbnMsXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fSk7XG5cblx0XHR0aGlzLmF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHMgPSBhdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzO1xuXHRcdHRoaXMudHlwaW5nID0gdHlwaW5nO1xuXHRcdHRoaXMuYXV0b0RlZmVyID0gYXV0b0RlZmVyO1xuXHRcdHRoaXMucmVzb2x2ZXIgPSBuZXcgVHlwZVJlc29sdmVyKHRoaXMpO1xuXHRcdHRoaXMuYWxpYXNlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdFx0dGhpcy5hbGlhc1JlcGxhY2VtZW50ID0gYWxpYXNSZXBsYWNlbWVudDtcblx0XHR0aGlzLnByZWZpeGVzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHR0aGlzLmJsb2NrQ2xpZW50ID0gQm9vbGVhbihibG9ja0NsaWVudCk7XG5cdFx0dGhpcy5ibG9ja0JvdHMgPSBCb29sZWFuKGJsb2NrQm90cyk7XG5cdFx0dGhpcy5mZXRjaE1lbWJlcnMgPSBCb29sZWFuKGZldGNoTWVtYmVycyk7XG5cdFx0dGhpcy5oYW5kbGVFZGl0cyA9IEJvb2xlYW4oaGFuZGxlRWRpdHMpO1xuXHRcdHRoaXMuc3RvcmVNZXNzYWdlcyA9IEJvb2xlYW4oc3RvcmVNZXNzYWdlcyk7XG5cdFx0dGhpcy5jb21tYW5kVXRpbCA9IEJvb2xlYW4oY29tbWFuZFV0aWwpO1xuXHRcdGlmICgodGhpcy5oYW5kbGVFZGl0cyB8fCB0aGlzLnN0b3JlTWVzc2FnZXMpICYmICF0aGlzLmNvbW1hbmRVdGlsKSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJDT01NQU5EX1VUSUxfRVhQTElDSVRcIik7XG5cdFx0dGhpcy5jb21tYW5kVXRpbExpZmV0aW1lID0gY29tbWFuZFV0aWxMaWZldGltZTtcblx0XHR0aGlzLmNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA9IGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbDtcblx0XHRpZiAodGhpcy5jb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWwgPiAwKVxuXHRcdFx0c2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5zd2VlcENvbW1hbmRVdGlsKCksIHRoaXMuY29tbWFuZFV0aWxTd2VlcEludGVydmFsKS51bnJlZigpO1xuXHRcdHRoaXMuY29tbWFuZFV0aWxzID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHR0aGlzLmNvb2xkb3ducyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdFx0dGhpcy5kZWZhdWx0Q29vbGRvd24gPSBkZWZhdWx0Q29vbGRvd247XG5cdFx0dGhpcy5pZ25vcmVDb29sZG93biA9IHR5cGVvZiBpZ25vcmVDb29sZG93biA9PT0gXCJmdW5jdGlvblwiID8gaWdub3JlQ29vbGRvd24uYmluZCh0aGlzKSA6IGlnbm9yZUNvb2xkb3duO1xuXHRcdHRoaXMuaWdub3JlUGVybWlzc2lvbnMgPSB0eXBlb2YgaWdub3JlUGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIiA/IGlnbm9yZVBlcm1pc3Npb25zLmJpbmQodGhpcykgOiBpZ25vcmVQZXJtaXNzaW9ucztcblx0XHR0aGlzLnByb21wdHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXHRcdHRoaXMuYXJndW1lbnREZWZhdWx0cyA9IFV0aWwuZGVlcEFzc2lnbihcblx0XHRcdHtcblx0XHRcdFx0cHJvbXB0OiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiXCIsXG5cdFx0XHRcdFx0cmV0cnk6IFwiXCIsXG5cdFx0XHRcdFx0dGltZW91dDogXCJcIixcblx0XHRcdFx0XHRlbmRlZDogXCJcIixcblx0XHRcdFx0XHRjYW5jZWw6IFwiXCIsXG5cdFx0XHRcdFx0cmV0cmllczogMSxcblx0XHRcdFx0XHR0aW1lOiAzMDAwMCxcblx0XHRcdFx0XHRjYW5jZWxXb3JkOiBcImNhbmNlbFwiLFxuXHRcdFx0XHRcdHN0b3BXb3JkOiBcInN0b3BcIixcblx0XHRcdFx0XHRvcHRpb25hbDogZmFsc2UsXG5cdFx0XHRcdFx0aW5maW5pdGU6IGZhbHNlLFxuXHRcdFx0XHRcdGxpbWl0OiBJbmZpbml0eSxcblx0XHRcdFx0XHRicmVha291dDogdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0YXJndW1lbnREZWZhdWx0c1xuXHRcdCk7XG5cdFx0dGhpcy5wcmVmaXggPSB0eXBlb2YgcHJlZml4ID09PSBcImZ1bmN0aW9uXCIgPyBwcmVmaXguYmluZCh0aGlzKSA6IHByZWZpeDtcblx0XHR0aGlzLmFsbG93TWVudGlvbiA9IHR5cGVvZiBhbGxvd01lbnRpb24gPT09IFwiZnVuY3Rpb25cIiA/IGFsbG93TWVudGlvbi5iaW5kKHRoaXMpIDogQm9vbGVhbihhbGxvd01lbnRpb24pO1xuXHRcdHRoaXMuaW5oaWJpdG9ySGFuZGxlciA9IG51bGw7XG5cdFx0dGhpcy5hdXRvRGVmZXIgPSBCb29sZWFuKGF1dG9EZWZlcik7XG5cdFx0dGhpcy5leGVjU2xhc2ggPSBCb29sZWFuKGV4ZWNTbGFzaCk7XG5cdFx0dGhpcy5za2lwQnVpbHRJblBvc3RJbmhpYml0b3JzID0gQm9vbGVhbihza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzKTtcblx0XHR0aGlzLnVzZVNsYXNoUGVybWlzc2lvbnMgPSBCb29sZWFuKHVzZVNsYXNoUGVybWlzc2lvbnMpO1xuXHRcdHRoaXMuc2V0dXAoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb2xsZWN0aW9uIG9mIGNvbW1hbmQgYWxpYXNlcy5cblx0ICovXG5cdHB1YmxpYyBhbGlhc2VzOiBDb2xsZWN0aW9uPHN0cmluZywgc3RyaW5nPjtcblxuXHQvKipcblx0ICogUmVndWxhciBleHByZXNzaW9uIHRvIGF1dG9tYXRpY2FsbHkgbWFrZSBjb21tYW5kIGFsaWFzZXMgZm9yLlxuXHQgKi9cblx0cHVibGljIGFsaWFzUmVwbGFjZW1lbnQ/OiBSZWdFeHA7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IG1lbnRpb25zIGFyZSBhbGxvd2VkIGZvciBwcmVmaXhpbmcuXG5cdCAqL1xuXHRwdWJsaWMgYWxsb3dNZW50aW9uOiBib29sZWFuIHwgTWVudGlvblByZWZpeFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogRGVmYXVsdCBhcmd1bWVudCBvcHRpb25zLlxuXHQgKi9cblx0cHVibGljIGFyZ3VtZW50RGVmYXVsdHM6IERlZmF1bHRBcmd1bWVudE9wdGlvbnM7XG5cblx0LyoqXG5cdCAqIEF1dG9tYXRpY2FsbHkgZGVmZXIgbWVzc2FnZXMgXCJCb3ROYW1lIGlzIHRoaW5raW5nXCIuXG5cdCAqL1xuXHRwdWJsaWMgYXV0b0RlZmVyOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZ5IHdoZXRoZXIgdG8gcmVnaXN0ZXIgYWxsIHNsYXNoIGNvbW1hbmRzIHdoZW4gc3RhcnRpbmcgdGhlIGNsaWVudFxuXHQgKi9cblx0cHVibGljIGF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGJsb2NrIGJvdHMuXG5cdCAqL1xuXHRwdWJsaWMgYmxvY2tCb3RzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBzZWxmLlxuXHQgKi9cblx0cHVibGljIGJsb2NrQ2xpZW50OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDYXRlZ29yaWVzLCBtYXBwZWQgYnkgSUQgdG8gQ2F0ZWdvcnkuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjYXRlZ29yaWVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ2F0ZWdvcnk8c3RyaW5nLCBDb21tYW5kPj47XG5cblx0LyoqXG5cdCAqIENsYXNzIHRvIGhhbmRsZVxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xhc3NUb0hhbmRsZTogdHlwZW9mIENvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2xpZW50OiBBa2Fpcm9DbGllbnQ7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IGBtZXNzYWdlLnV0aWxgIGlzIGFzc2lnbmVkLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmRVdGlsOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBNaWxsaXNlY29uZHMgYSBtZXNzYWdlIHNob3VsZCBleGlzdCBmb3IgYmVmb3JlIGl0cyBjb21tYW5kIHV0aWwgaW5zdGFuY2UgaXMgbWFya2VkIGZvciByZW1vdmFsLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmRVdGlsTGlmZXRpbWU6IG51bWJlcjtcblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBDb21tYW5kVXRpbHMuXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZFV0aWxzOiBDb2xsZWN0aW9uPHN0cmluZywgQ29tbWFuZFV0aWw+O1xuXG5cdC8qKlxuXHQgKiBUaW1lIGludGVydmFsIGluIG1pbGxpc2Vjb25kcyBmb3Igc3dlZXBpbmcgY29tbWFuZCB1dGlsIGluc3RhbmNlcy5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWw6IG51bWJlcjtcblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBjb29sZG93bnMuXG5cdCAqIDxpbmZvPlRoZSBlbGVtZW50cyBpbiB0aGUgY29sbGVjdGlvbiBhcmUgb2JqZWN0cyB3aXRoIHVzZXIgSURzIGFzIGtleXNcblx0ICogYW5kIHtAbGluayBDb29sZG93bkRhdGF9IG9iamVjdHMgYXMgdmFsdWVzPC9pbmZvPlxuXHQgKi9cblx0cHVibGljIGNvb2xkb3duczogQ29sbGVjdGlvbjxzdHJpbmcsIHsgW2lkOiBzdHJpbmddOiBDb29sZG93bkRhdGEgfT47XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgY29vbGRvd24gZm9yIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGRlZmF1bHRDb29sZG93bjogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBEaXJlY3RvcnkgdG8gY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBkaXJlY3Rvcnk6IHN0cmluZztcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gdXNlIGV4ZWNTbGFzaCBmb3Igc2xhc2ggY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgZXhlY1NsYXNoOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBtZW1iZXJzIGFyZSBmZXRjaGVkIG9uIGVhY2ggbWVzc2FnZSBhdXRob3IgZnJvbSBhIGd1aWxkLlxuXHQgKi9cblx0cHVibGljIGZldGNoTWVtYmVyczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgZWRpdHMgYXJlIGhhbmRsZWQuXG5cdCAqL1xuXHRwdWJsaWMgaGFuZGxlRWRpdHM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGNvb2xkb3duIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLlxuXHQgKi9cblx0cHVibGljIGlnbm9yZUNvb2xkb3duOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBgdXNlclBlcm1pc3Npb25zYCBjaGVja3Mgb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuXG5cdCAqL1xuXHRwdWJsaWMgaWdub3JlUGVybWlzc2lvbnM6IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIEluaGliaXRvciBoYW5kbGVyIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBpbmhpYml0b3JIYW5kbGVyOiBJbmhpYml0b3JIYW5kbGVyIHwgbnVsbDtcblxuXHQvKipcblx0ICogQ29tbWFuZHMgbG9hZGVkLCBtYXBwZWQgYnkgSUQgdG8gQ29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIG1vZHVsZXM6IENvbGxlY3Rpb248c3RyaW5nLCBDb21tYW5kPjtcblxuXHQvKipcblx0ICogVGhlIHByZWZpeChlcykgZm9yIGNvbW1hbmQgcGFyc2luZy5cblx0ICovXG5cdHB1YmxpYyBwcmVmaXg6IHN0cmluZyB8IHN0cmluZ1tdIHwgUHJlZml4U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgcHJlZml4IG92ZXJ3cml0ZXMgdG8gY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgcHJlZml4ZXM6IENvbGxlY3Rpb248c3RyaW5nIHwgUHJlZml4U3VwcGxpZXIsIFNldDxzdHJpbmc+PjtcblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBzZXRzIG9mIG9uZ29pbmcgYXJndW1lbnQgcHJvbXB0cy5cblx0ICovXG5cdHB1YmxpYyBwcm9tcHRzOiBDb2xsZWN0aW9uPHN0cmluZywgU2V0PHN0cmluZz4+O1xuXG5cdC8qKlxuXHQgKiBUaGUgdHlwZSByZXNvbHZlci5cblx0ICovXG5cdHB1YmxpYyByZXNvbHZlcjogVHlwZVJlc29sdmVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBzdG9yZSBtZXNzYWdlcyBpbiBDb21tYW5kVXRpbC5cblx0ICovXG5cdHB1YmxpYyBzdG9yZU1lc3NhZ2VzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTaG93IFwiQm90TmFtZSBpcyB0eXBpbmdcIiBpbmZvcm1hdGlvbiBtZXNzYWdlIG9uIHRoZSB0ZXh0IGNoYW5uZWxzIHdoZW4gYSBjb21tYW5kIGlzIHJ1bm5pbmcuXG5cdCAqL1xuXHRwdWJsaWMgdHlwaW5nOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBza2lwIGJ1aWx0IGluIHJlYXNvbnMgcG9zdCB0eXBlIGluaGliaXRvcnMgc28geW91IGNhbiBtYWtlIGN1c3RvbSBvbmVzLlxuXHQgKi9cblx0cHVibGljIHNraXBCdWlsdEluUG9zdEluaGliaXRvcnM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFVzZSBzbGFzaCBjb21tYW5kIHBlcm1pc3Npb25zIGZvciBvd25lciBvbmx5IGNvbW1hbmRzXG5cdCAqIFdhcm5pbmc6IHRoaXMgaXMgZXhwZXJpbWVudGFsXG5cdCAqL1xuXHRwdWJsaWMgdXNlU2xhc2hQZXJtaXNzaW9uczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU2V0IHVwIHRoZSBjb21tYW5kIGhhbmRsZXJcblx0ICovXG5cdHByb3RlY3RlZCBzZXR1cCgpIHtcblx0XHR0aGlzLmNsaWVudC5vbmNlKFwicmVhZHlcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcylcblx0XHRcdFx0dGhpcy5yZWdpc3RlckludGVyYWN0aW9uQ29tbWFuZHMoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy51c2VTbGFzaFBlcm1pc3Npb25zKVxuXHRcdFx0XHRcdFx0dGhpcy51cGRhdGVJbnRlcmFjdGlvblBlcm1pc3Npb25zKHRoaXMuY2xpZW50Lm93bmVySUQgLyogIHRoaXMuY2xpZW50LnN1cGVyVXNlcklEICovKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuY2xpZW50Lm9uKFwibWVzc2FnZUNyZWF0ZVwiLCBhc3luYyBtID0+IHtcblx0XHRcdFx0aWYgKG0ucGFydGlhbCkgYXdhaXQgbS5mZXRjaCgpO1xuXG5cdFx0XHRcdHRoaXMuaGFuZGxlKG0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICh0aGlzLmhhbmRsZUVkaXRzKSB7XG5cdFx0XHRcdHRoaXMuY2xpZW50Lm9uKFwibWVzc2FnZVVwZGF0ZVwiLCBhc3luYyAobywgbSkgPT4ge1xuXHRcdFx0XHRcdGlmIChvLnBhcnRpYWwpIGF3YWl0IG8uZmV0Y2goKTtcblx0XHRcdFx0XHRpZiAobS5wYXJ0aWFsKSBhd2FpdCBtLmZldGNoKCk7XG5cdFx0XHRcdFx0aWYgKG8uY29udGVudCA9PT0gbS5jb250ZW50KSByZXR1cm47XG5cblx0XHRcdFx0XHRpZiAodGhpcy5oYW5kbGVFZGl0cykgdGhpcy5oYW5kbGUobSBhcyBNZXNzYWdlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmNsaWVudC5vbihcImludGVyYWN0aW9uQ3JlYXRlXCIsIGkgPT4ge1xuXHRcdFx0XHRpZiAoIWkuaXNDb21tYW5kKCkpIHJldHVybjtcblx0XHRcdFx0dGhpcy5oYW5kbGVTbGFzaChpKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBpbnRlcmFjdGlvbiBjb21tYW5kcy5cblx0ICovXG5cdHByb3RlY3RlZCBhc3luYyByZWdpc3RlckludGVyYWN0aW9uQ29tbWFuZHMoKSB7XG5cdFx0Y29uc3QgcGFyc2VkU2xhc2hDb21tYW5kczoge1xuXHRcdFx0bmFtZTogc3RyaW5nO1xuXHRcdFx0ZGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cdFx0XHRvcHRpb25zPzogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YVtdO1xuXHRcdFx0Z3VpbGRzOiBTbm93Zmxha2VbXTtcblx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiBib29sZWFuO1xuXHRcdFx0dHlwZTogXCJDSEFUX0lOUFVUXCIgfCBcIk1FU1NBR0VcIiB8IFwiVVNFUlwiO1xuXHRcdH1bXSA9IFtdO1xuXHRcdGNvbnN0IGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZDogQ29sbGVjdGlvbjxcblx0XHRcdFNub3dmbGFrZSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogc3RyaW5nO1xuXHRcdFx0XHRkZXNjcmlwdGlvbjogc3RyaW5nO1xuXHRcdFx0XHRvcHRpb25zOiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25EYXRhW107XG5cdFx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiBib29sZWFuO1xuXHRcdFx0XHR0eXBlOiBcIkNIQVRfSU5QVVRcIiB8IFwiTUVTU0FHRVwiIHwgXCJVU0VSXCI7XG5cdFx0XHR9W11cblx0XHQ+ID0gbmV3IENvbGxlY3Rpb24oKTtcblx0XHRjb25zdCBwYXJzZURlc2NyaXB0aW9uQ29tbWFuZCA9IChkZXNjcmlwdGlvbjogeyBjb250ZW50OiAoKSA9PiBhbnkgfSkgPT4ge1xuXHRcdFx0aWYgKHR5cGVvZiBkZXNjcmlwdGlvbiA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRpZiAodHlwZW9mIGRlc2NyaXB0aW9uLmNvbnRlbnQgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIGRlc2NyaXB0aW9uLmNvbnRlbnQoKTtcblx0XHRcdFx0aWYgKHR5cGVvZiBkZXNjcmlwdGlvbi5jb250ZW50ID09PSBcInN0cmluZ1wiKSByZXR1cm4gZGVzY3JpcHRpb24uY29udGVudDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBkZXNjcmlwdGlvbjtcblx0XHR9O1xuXG5cdFx0Zm9yIChjb25zdCBbLCBkYXRhXSBvZiB0aGlzLm1vZHVsZXMpIHtcblx0XHRcdGlmICghZGF0YS5zbGFzaCkgY29udGludWU7XG5cdFx0XHRwYXJzZWRTbGFzaENvbW1hbmRzLnB1c2goe1xuXHRcdFx0XHRuYW1lOiBkYXRhLmFsaWFzZXNbMF0/LnRvTG93ZXJDYXNlKCkgfHwgZGF0YS5pZD8udG9Mb3dlckNhc2UoKSxcblx0XHRcdFx0ZGVzY3JpcHRpb246IHBhcnNlRGVzY3JpcHRpb25Db21tYW5kKGRhdGEuZGVzY3JpcHRpb24pIHx8IFwiTm8gZGVzY3JpcHRpb24gcHJvdmlkZWQuXCIsXG5cdFx0XHRcdG9wdGlvbnM6IGRhdGEuc2xhc2hPcHRpb25zLFxuXHRcdFx0XHRndWlsZHM6IGRhdGEuc2xhc2hHdWlsZHMgPz8gW10sXG5cdFx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiAhKGRhdGEub3duZXJPbmx5IHx8IC8qIGRhdGEuc3VwZXJVc2VyT25seSB8fCAqLyBmYWxzZSksXG5cdFx0XHRcdHR5cGU6IFwiQ0hBVF9JTlBVVFwiXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRsZXQgY29udGV4dENvbW1hbmRIYW5kbGVyOiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyIHwgdW5kZWZpbmVkO1xuXHRcdGZvciAoY29uc3Qga2V5IGluIHRoaXMuY2xpZW50KSB7XG5cdFx0XHRpZiAodGhpcy5jbGllbnRba2V5IGFzIGtleW9mIEFrYWlyb0NsaWVudF0gaW5zdGFuY2VvZiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyKSB7XG5cdFx0XHRcdGNvbnRleHRDb21tYW5kSGFuZGxlciA9IHRoaXMuY2xpZW50W2tleSBhcyBrZXlvZiBBa2Fpcm9DbGllbnRdIGFzIHVua25vd24gYXNcblx0XHRcdFx0XHR8IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXJcblx0XHRcdFx0XHR8IHVuZGVmaW5lZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChjb250ZXh0Q29tbWFuZEhhbmRsZXIpIHtcblx0XHRcdGZvciAoY29uc3QgWywgZGF0YV0gb2YgY29udGV4dENvbW1hbmRIYW5kbGVyLm1vZHVsZXMpIHtcblx0XHRcdFx0cGFyc2VkU2xhc2hDb21tYW5kcy5wdXNoKHtcblx0XHRcdFx0XHRuYW1lOiBkYXRhLm5hbWUsXG5cdFx0XHRcdFx0Z3VpbGRzOiBkYXRhLmd1aWxkcyA/PyBbXSxcblx0XHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogdGhpcy51c2VTbGFzaFBlcm1pc3Npb25zID8gIShkYXRhLm93bmVyT25seSB8fCAvKiBkYXRhLnN1cGVyVXNlck9ubHkgfHwgKi8gZmFsc2UpIDogdHJ1ZSxcblx0XHRcdFx0XHR0eXBlOiBkYXRhLnR5cGVcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyogR2xvYmFsICovXG5cdFx0Y29uc3Qgc2xhc2hDb21tYW5kc0FwcCA9IHBhcnNlZFNsYXNoQ29tbWFuZHNcblx0XHRcdC5maWx0ZXIoKHsgZ3VpbGRzIH0pID0+ICFndWlsZHMubGVuZ3RoKVxuXHRcdFx0Lm1hcCgoeyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZGVmYXVsdFBlcm1pc3Npb24sIHR5cGUgfSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4geyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZGVmYXVsdFBlcm1pc3Npb24sIHR5cGUgfTtcblx0XHRcdH0pO1xuXHRcdGNvbnN0IGN1cnJlbnRHbG9iYWxDb21tYW5kcyA9IChhd2FpdCB0aGlzLmNsaWVudC5hcHBsaWNhdGlvbj8uY29tbWFuZHMuZmV0Y2goKSkhLm1hcCh2YWx1ZTEgPT4gKHtcblx0XHRcdG5hbWU6IHZhbHVlMS5uYW1lLFxuXHRcdFx0ZGVzY3JpcHRpb246IHZhbHVlMS5kZXNjcmlwdGlvbixcblx0XHRcdG9wdGlvbnM6IHZhbHVlMS5vcHRpb25zLFxuXHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246IHZhbHVlMS5kZWZhdWx0UGVybWlzc2lvbixcblx0XHRcdHR5cGU6IHZhbHVlMS50eXBlXG5cdFx0fSkpO1xuXG5cdFx0aWYgKCFfLmlzRXF1YWwoY3VycmVudEdsb2JhbENvbW1hbmRzLCBzbGFzaENvbW1hbmRzQXBwKSkge1xuXHRcdFx0YXdhaXQgdGhpcy5jbGllbnQuYXBwbGljYXRpb24/LmNvbW1hbmRzLnNldChcblx0XHRcdFx0c2xhc2hDb21tYW5kc0FwcCBhcyB7XG5cdFx0XHRcdFx0bmFtZTogc3RyaW5nO1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzdHJpbmc7XG5cdFx0XHRcdFx0b3B0aW9uczogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YVtdIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiBib29sZWFuO1xuXHRcdFx0XHRcdHR5cGU6IFwiQ0hBVF9JTlBVVFwiIHwgXCJNRVNTQUdFXCIgfCBcIlVTRVJcIjtcblx0XHRcdFx0fVtdXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdC8qIEd1aWxkcyAqL1xuXHRcdGZvciAoY29uc3QgeyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZ3VpbGRzLCBkZWZhdWx0UGVybWlzc2lvbiwgdHlwZSB9IG9mIHBhcnNlZFNsYXNoQ29tbWFuZHMpIHtcblx0XHRcdGZvciAoY29uc3QgZ3VpbGRJZCBvZiBndWlsZHMpIHtcblx0XHRcdFx0Z3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkLnNldChndWlsZElkLCBbXG5cdFx0XHRcdFx0Li4uKGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZC5nZXQoZ3VpbGRJZCkgPz8gW10pLFxuXHRcdFx0XHRcdHsgbmFtZSwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uISwgb3B0aW9uczogb3B0aW9ucyEsIGRlZmF1bHRQZXJtaXNzaW9uLCB0eXBlIH1cblx0XHRcdFx0XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQuc2l6ZSkge1xuXHRcdFx0Z3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkLmVhY2goYXN5bmMgKHZhbHVlLCBrZXkpID0+IHtcblx0XHRcdFx0Y29uc3QgZ3VpbGQgPSB0aGlzLmNsaWVudC5ndWlsZHMuY2FjaGUuZ2V0KGtleSk7XG5cdFx0XHRcdGlmICghZ3VpbGQpIHJldHVybjtcblxuXHRcdFx0XHRjb25zdCBjdXJyZW50R3VpbGRDb21tYW5kcyA9IChhd2FpdCBndWlsZC5jb21tYW5kcy5mZXRjaCgpKS5tYXAodmFsdWUxID0+ICh7XG5cdFx0XHRcdFx0bmFtZTogdmFsdWUxLm5hbWUsXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246IHZhbHVlMS5kZXNjcmlwdGlvbixcblx0XHRcdFx0XHRvcHRpb25zOiB2YWx1ZTEub3B0aW9ucyxcblx0XHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogdmFsdWUxLmRlZmF1bHRQZXJtaXNzaW9uLFxuXHRcdFx0XHRcdHR5cGU6IHZhbHVlMS50eXBlXG5cdFx0XHRcdH0pKTtcblxuXHRcdFx0XHRpZiAoIV8uaXNFcXVhbChjdXJyZW50R3VpbGRDb21tYW5kcywgdmFsdWUpKSB7XG5cdFx0XHRcdFx0YXdhaXQgZ3VpbGQuY29tbWFuZHMuc2V0KHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIHVwZGF0ZXMgaW50ZXJhY3Rpb24gcGVybWlzc2lvbnNcblx0ICovXG5cdHByb3RlY3RlZCBhc3luYyB1cGRhdGVJbnRlcmFjdGlvblBlcm1pc3Npb25zKFxuXHRcdG93bmVyczogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gLyogc3VwZXJVc2VyczogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gKi9cblx0KSB7XG5cdFx0Y29uc3QgbWFwQ29tID0gKFxuXHRcdFx0dmFsdWU6IEFwcGxpY2F0aW9uQ29tbWFuZDx7XG5cdFx0XHRcdGd1aWxkOiBHdWlsZFJlc29sdmFibGU7XG5cdFx0XHR9PlxuXHRcdCk6IHsgaWQ6IHN0cmluZzsgcGVybWlzc2lvbnM6IHsgaWQ6IHN0cmluZzsgdHlwZTogXCJVU0VSXCI7IHBlcm1pc3Npb246IGJvb2xlYW4gfVtdIH0gPT4ge1xuXHRcdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMubW9kdWxlcy5maW5kKG1vZCA9PiBtb2QuYWxpYXNlc1swXSA9PT0gdmFsdWUubmFtZSk7XG5cdFx0XHRsZXQgYWxsb3dlZFVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0LyogaWYgKGNvbW1hbmQuc3VwZXJVc2VyT25seSkgYWxsb3dlZFVzZXJzLnB1c2goLi4uVXRpbC5pbnRvQXJyYXkoc3VwZXJVc2VycykpOyAqL1xuXHRcdFx0aWYgKGNvbW1hbmQ/Lm93bmVyT25seSkgYWxsb3dlZFVzZXJzLnB1c2goLi4uVXRpbC5pbnRvQXJyYXkob3duZXJzKSk7XG5cdFx0XHRhbGxvd2VkVXNlcnMgPSBbLi4ubmV3IFNldChhbGxvd2VkVXNlcnMpXTsgLy8gcmVtb3ZlIGR1cGxpY2F0ZXNcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aWQ6IHZhbHVlLmlkLFxuXHRcdFx0XHRwZXJtaXNzaW9uczogYWxsb3dlZFVzZXJzLm1hcCh1ID0+ICh7XG5cdFx0XHRcdFx0aWQ6IHUsXG5cdFx0XHRcdFx0dHlwZTogXCJVU0VSXCIsXG5cdFx0XHRcdFx0cGVybWlzc2lvbjogdHJ1ZVxuXHRcdFx0XHR9KSlcblx0XHRcdH07XG5cdFx0fTtcblxuXHRcdGNvbnN0IGdsb2JhbENvbW1hbmRzID0gKGF3YWl0IHRoaXMuY2xpZW50LmFwcGxpY2F0aW9uPy5jb21tYW5kcy5mZXRjaCgpKT8uZmlsdGVyKHZhbHVlID0+XG5cdFx0XHRCb29sZWFuKHRoaXMubW9kdWxlcy5maW5kKG1vZCA9PiBtb2QuYWxpYXNlc1swXSA9PT0gdmFsdWUubmFtZSkpXG5cdFx0KTtcblx0XHRjb25zdCBmdWxsUGVybWlzc2lvbnM6IEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbkRhdGFbXSB8IHVuZGVmaW5lZCA9IGdsb2JhbENvbW1hbmRzXG5cdFx0XHQ/LmZpbHRlcih2YWx1ZSA9PiAhdmFsdWUuZGVmYXVsdFBlcm1pc3Npb24pXG5cdFx0XHQuZmlsdGVyKHZhbHVlID0+IEJvb2xlYW4odGhpcy5tb2R1bGVzLmZpbmQobW9kID0+IG1vZC5hbGlhc2VzWzBdID09PSB2YWx1ZS5uYW1lKSkpXG5cdFx0XHQubWFwKHZhbHVlID0+IG1hcENvbSh2YWx1ZSkpO1xuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSB0aGlzLmNsaWVudC5ndWlsZHMuY2FjaGUubWFwKGFzeW5jIGd1aWxkID0+IHtcblx0XHRcdGNvbnN0IHBlcm1zID0gbmV3IEFycmF5KC4uLihmdWxsUGVybWlzc2lvbnMgPz8gW10pKTtcblx0XHRcdGF3YWl0IGd1aWxkLmNvbW1hbmRzLmZldGNoKCk7XG5cdFx0XHRpZiAoZ3VpbGQuY29tbWFuZHMuY2FjaGUuc2l6ZSlcblx0XHRcdFx0cGVybXMucHVzaCguLi5ndWlsZC5jb21tYW5kcy5jYWNoZS5maWx0ZXIodmFsdWUgPT4gIXZhbHVlLmRlZmF1bHRQZXJtaXNzaW9uKS5tYXAodmFsdWUgPT4gbWFwQ29tKHZhbHVlKSkpO1xuXHRcdFx0aWYgKGd1aWxkLmF2YWlsYWJsZSlcblx0XHRcdFx0cmV0dXJuIGd1aWxkLmNvbW1hbmRzLnBlcm1pc3Npb25zLnNldCh7XG5cdFx0XHRcdFx0ZnVsbFBlcm1pc3Npb25zOiBwZXJtc1xuXHRcdFx0XHR9KTtcblx0XHRcdC8vIFJldHVybiBlbXB0eSBwcm9taXNlIGlmIGd1aWxkIGlzIHVuYXZhaWxhYmxlXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fSk7XG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cdFx0XHRjb25zb2xlLmRlYnVnKHByb21pc2VzKTtcblx0XHRcdGNvbnNvbGUuZGVidWcoZ2xvYmFsQ29tbWFuZHMpO1xuXHRcdFx0Y29uc29sZS5kZWJ1ZyhmdWxsUGVybWlzc2lvbnMpO1xuXHRcdFx0LyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cdFx0XHR0aHJvdyBlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlZ2lzdGVyKGNvbW1hbmQ6IENvbW1hbmQsIGZpbGVwYXRoPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0c3VwZXIucmVnaXN0ZXIoY29tbWFuZCwgZmlsZXBhdGgpO1xuXG5cdFx0Zm9yIChsZXQgYWxpYXMgb2YgY29tbWFuZC5hbGlhc2VzKSB7XG5cdFx0XHRjb25zdCBjb25mbGljdCA9IHRoaXMuYWxpYXNlcy5nZXQoYWxpYXMudG9Mb3dlckNhc2UoKSk7XG5cdFx0XHRpZiAoY29uZmxpY3QpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMSUFTX0NPTkZMSUNUXCIsIGFsaWFzLCBjb21tYW5kLmlkLCBjb25mbGljdCk7XG5cblx0XHRcdGFsaWFzID0gYWxpYXMudG9Mb3dlckNhc2UoKTtcblx0XHRcdHRoaXMuYWxpYXNlcy5zZXQoYWxpYXMsIGNvbW1hbmQuaWQpO1xuXHRcdFx0aWYgKHRoaXMuYWxpYXNSZXBsYWNlbWVudCkge1xuXHRcdFx0XHRjb25zdCByZXBsYWNlbWVudCA9IGFsaWFzLnJlcGxhY2UodGhpcy5hbGlhc1JlcGxhY2VtZW50LCBcIlwiKTtcblxuXHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgIT09IGFsaWFzKSB7XG5cdFx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnRDb25mbGljdCA9IHRoaXMuYWxpYXNlcy5nZXQocmVwbGFjZW1lbnQpO1xuXHRcdFx0XHRcdGlmIChyZXBsYWNlbWVudENvbmZsaWN0KVxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiQUxJQVNfQ09ORkxJQ1RcIiwgcmVwbGFjZW1lbnQsIGNvbW1hbmQuaWQsIHJlcGxhY2VtZW50Q29uZmxpY3QpO1xuXHRcdFx0XHRcdHRoaXMuYWxpYXNlcy5zZXQocmVwbGFjZW1lbnQsIGNvbW1hbmQuaWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNvbW1hbmQucHJlZml4ICE9IG51bGwpIHtcblx0XHRcdGxldCBuZXdFbnRyeSA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjb21tYW5kLnByZWZpeCkpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBwcmVmaXggb2YgY29tbWFuZC5wcmVmaXgpIHtcblx0XHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KHByZWZpeCk7XG5cdFx0XHRcdFx0aWYgKHByZWZpeGVzKSB7XG5cdFx0XHRcdFx0XHRwcmVmaXhlcy5hZGQoY29tbWFuZC5pZCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuc2V0KHByZWZpeCwgbmV3IFNldChbY29tbWFuZC5pZF0pKTtcblx0XHRcdFx0XHRcdG5ld0VudHJ5ID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5nZXQoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHRpZiAocHJlZml4ZXMpIHtcblx0XHRcdFx0XHRwcmVmaXhlcy5hZGQoY29tbWFuZC5pZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5zZXQoY29tbWFuZC5wcmVmaXgsIG5ldyBTZXQoW2NvbW1hbmQuaWRdKSk7XG5cdFx0XHRcdFx0bmV3RW50cnkgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChuZXdFbnRyeSkge1xuXHRcdFx0XHR0aGlzLnByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5zb3J0KChhVmFsLCBiVmFsLCBhS2V5LCBiS2V5KSA9PiBVdGlsLnByZWZpeENvbXBhcmUoYUtleSwgYktleSkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGRlcmVnaXN0ZXIoY29tbWFuZDogQ29tbWFuZCk6IHZvaWQge1xuXHRcdGZvciAobGV0IGFsaWFzIG9mIGNvbW1hbmQuYWxpYXNlcykge1xuXHRcdFx0YWxpYXMgPSBhbGlhcy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0dGhpcy5hbGlhc2VzLmRlbGV0ZShhbGlhcyk7XG5cblx0XHRcdGlmICh0aGlzLmFsaWFzUmVwbGFjZW1lbnQpIHtcblx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnQgPSBhbGlhcy5yZXBsYWNlKHRoaXMuYWxpYXNSZXBsYWNlbWVudCwgXCJcIik7XG5cdFx0XHRcdGlmIChyZXBsYWNlbWVudCAhPT0gYWxpYXMpIHRoaXMuYWxpYXNlcy5kZWxldGUocmVwbGFjZW1lbnQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLnByZWZpeCAhPSBudWxsKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjb21tYW5kLnByZWZpeCkpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBwcmVmaXggb2YgY29tbWFuZC5wcmVmaXgpIHtcblx0XHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KHByZWZpeCk7XG5cdFx0XHRcdFx0aWYgKHByZWZpeGVzPy5zaXplID09PSAxKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnByZWZpeGVzLmRlbGV0ZShwcmVmaXgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwcmVmaXhlcz8uZGVsZXRlKHByZWZpeCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0aWYgKHByZWZpeGVzPy5zaXplID09PSAxKSB7XG5cdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5kZWxldGUoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHByZWZpeGVzPy5kZWxldGUoY29tbWFuZC5wcmVmaXggYXMgc3RyaW5nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHN1cGVyLmRlcmVnaXN0ZXIoY29tbWFuZCk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBhIG1lc3NhZ2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLmZldGNoTWVtYmVycyAmJiBtZXNzYWdlLmd1aWxkICYmICFtZXNzYWdlLm1lbWJlciAmJiAhbWVzc2FnZS53ZWJob29rSWQpIHtcblx0XHRcdFx0YXdhaXQgbWVzc2FnZS5ndWlsZC5tZW1iZXJzLmZldGNoKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuQWxsVHlwZUluaGliaXRvcnMobWVzc2FnZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbHMuaGFzKG1lc3NhZ2UuaWQpKSB7XG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gdGhpcy5jb21tYW5kVXRpbHMuZ2V0KG1lc3NhZ2UuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lc3NhZ2UudXRpbCA9IG5ldyBDb21tYW5kVXRpbCh0aGlzLCBtZXNzYWdlKTtcblx0XHRcdFx0XHR0aGlzLmNvbW1hbmRVdGlscy5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZS51dGlsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5QcmVUeXBlSW5oaWJpdG9ycyhtZXNzYWdlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBwYXJzZWQgPSBhd2FpdCB0aGlzLnBhcnNlQ29tbWFuZChtZXNzYWdlKTtcblx0XHRcdGlmICghcGFyc2VkLmNvbW1hbmQpIHtcblx0XHRcdFx0Y29uc3Qgb3ZlclBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kT3ZlcndyaXR0ZW5QcmVmaXhlcyhtZXNzYWdlKTtcblx0XHRcdFx0aWYgKG92ZXJQYXJzZWQuY29tbWFuZCB8fCAocGFyc2VkLnByZWZpeCA9PSBudWxsICYmIG92ZXJQYXJzZWQucHJlZml4ICE9IG51bGwpKSB7XG5cdFx0XHRcdFx0cGFyc2VkID0gb3ZlclBhcnNlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHRtZXNzYWdlLnV0aWwhLnBhcnNlZCA9IHBhcnNlZDtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHJhbjtcblx0XHRcdGlmICghcGFyc2VkLmNvbW1hbmQpIHtcblx0XHRcdFx0cmFuID0gYXdhaXQgdGhpcy5oYW5kbGVSZWdleEFuZENvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyYW4gPSBhd2FpdCB0aGlzLmhhbmRsZURpcmVjdENvbW1hbmQobWVzc2FnZSwgcGFyc2VkLmNvbnRlbnQhLCBwYXJzZWQuY29tbWFuZCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChyYW4gPT09IGZhbHNlKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0lOVkFMSUQsIG1lc3NhZ2UpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByYW47XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKiBAcGFyYW0gaW50ZXJhY3Rpb24gLSBJbnRlcmFjdGlvbiB0byBoYW5kbGUuXG5cdCAqL1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuXHRwdWJsaWMgYXN5bmMgaGFuZGxlU2xhc2goaW50ZXJhY3Rpb246IENvbW1hbmRJbnRlcmFjdGlvbik6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcblx0XHRjb25zdCBjb21tYW5kID0gdGhpcy5maW5kQ29tbWFuZChpbnRlcmFjdGlvbi5jb21tYW5kTmFtZSk7XG5cblx0XHRpZiAoIWNvbW1hbmQpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9OT1RfRk9VTkQsIGludGVyYWN0aW9uKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBtZXNzYWdlID0gbmV3IEFrYWlyb01lc3NhZ2UodGhpcy5jbGllbnQsIGludGVyYWN0aW9uKTtcblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy5mZXRjaE1lbWJlcnMgJiYgbWVzc2FnZS5ndWlsZCAmJiAhbWVzc2FnZS5tZW1iZXIpIHtcblx0XHRcdFx0YXdhaXQgbWVzc2FnZS5ndWlsZC5tZW1iZXJzLmZldGNoKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuQWxsVHlwZUluaGliaXRvcnMobWVzc2FnZSwgdHJ1ZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbHMuaGFzKG1lc3NhZ2UuaWQpKSB7XG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gdGhpcy5jb21tYW5kVXRpbHMuZ2V0KG1lc3NhZ2UuaWQpITtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSBuZXcgQ29tbWFuZFV0aWwodGhpcywgbWVzc2FnZSk7XG5cdFx0XHRcdFx0dGhpcy5jb21tYW5kVXRpbHMuc2V0KG1lc3NhZ2UuaWQsIG1lc3NhZ2UudXRpbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUHJlVHlwZUluaGliaXRvcnMobWVzc2FnZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcGFyc2VkID0gYXdhaXQgdGhpcy5wYXJzZUNvbW1hbmQobWVzc2FnZSk7XG5cdFx0XHRpZiAoIXBhcnNlZC5jb21tYW5kKSB7XG5cdFx0XHRcdGNvbnN0IG92ZXJQYXJzZWQgPSBhd2FpdCB0aGlzLnBhcnNlQ29tbWFuZE92ZXJ3cml0dGVuUHJlZml4ZXMobWVzc2FnZSk7XG5cdFx0XHRcdGlmIChvdmVyUGFyc2VkLmNvbW1hbmQgfHwgKHBhcnNlZC5wcmVmaXggPT0gbnVsbCAmJiBvdmVyUGFyc2VkLnByZWZpeCAhPSBudWxsKSkge1xuXHRcdFx0XHRcdHBhcnNlZCA9IG92ZXJQYXJzZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWwpIHtcblx0XHRcdFx0bWVzc2FnZS51dGlsLnBhcnNlZCA9IHBhcnNlZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUG9zdFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIGNvbW1hbmQpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGNvbnZlcnRlZE9wdGlvbnM6IGFueSA9IHt9O1xuXHRcdFx0aW50ZXJhY3Rpb24ub3B0aW9ucy5kYXRhLmZvckVhY2gob3B0aW9uID0+IHtcblx0XHRcdFx0c3dpdGNoIChvcHRpb24udHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgXCJTVFJJTkdcIjpcblx0XHRcdFx0XHRcdGNvbnZlcnRlZE9wdGlvbnNbb3B0aW9uLm5hbWVdID0gb3B0aW9uLnZhbHVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIklOVEVHRVJcIjpcblx0XHRcdFx0XHRcdGNvbnZlcnRlZE9wdGlvbnNbb3B0aW9uLm5hbWVdID0gb3B0aW9uLnZhbHVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIkJPT0xFQU5cIjpcblx0XHRcdFx0XHRcdGNvbnZlcnRlZE9wdGlvbnNbb3B0aW9uLm5hbWVdID0gb3B0aW9uLnZhbHVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIk5VTUJFUlwiOlxuXHRcdFx0XHRcdFx0Y29udmVydGVkT3B0aW9uc1tvcHRpb24ubmFtZV0gPSBvcHRpb24udmFsdWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiVVNFUlwiOiB7XG5cdFx0XHRcdFx0XHRjb25zdCB0aGluZyA9IHsgdXNlcjogb3B0aW9uLnVzZXIsIG1lbWJlcjogb3B0aW9uLm1lbWJlciB9O1xuXHRcdFx0XHRcdFx0Y29udmVydGVkT3B0aW9uc1tvcHRpb24ubmFtZV0gPSB0aGluZztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXNlIFwiQ0hBTk5FTFwiOlxuXHRcdFx0XHRcdFx0Y29udmVydGVkT3B0aW9uc1tvcHRpb24ubmFtZV0gPSBvcHRpb24uY2hhbm5lbDtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJST0xFXCI6XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZWRPcHRpb25zW29wdGlvbi5uYW1lXSA9IG9wdGlvbi5yb2xlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIk1FTlRJT05BQkxFXCI6XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZWRPcHRpb25zW29wdGlvbi5uYW1lXSA9IG9wdGlvbi5yb2xlID8gb3B0aW9uLnJvbGUgOiB7IHVzZXI6IG9wdGlvbi51c2VyLCBtZW1iZXI6IG9wdGlvbi5tZW1iZXIgfTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBjb252ZXJ0ZWRPcHRpb25zW29wdGlvbi5uYW1lXSA9IG9wdGlvblxuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBrZXk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrKSBrZXkgPSAoY29tbWFuZC5sb2NrIGFzIEtleVN1cHBsaWVyKShtZXNzYWdlLCBjb252ZXJ0ZWRPcHRpb25zKTtcblx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGtleSkpIGtleSA9IGF3YWl0IGtleTtcblx0XHRcdFx0aWYgKGtleSkge1xuXHRcdFx0XHRcdGlmIChjb21tYW5kLmxvY2tlcj8uaGFzKGtleSkpIHtcblx0XHRcdFx0XHRcdGtleSA9IG51bGw7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9MT0NLRUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbW1hbmQubG9ja2VyPy5hZGQoa2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRpZiAoa2V5KSBjb21tYW5kLmxvY2tlcj8uZGVsZXRlKGtleSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmF1dG9EZWZlciB8fCBjb21tYW5kLnNsYXNoRXBoZW1lcmFsKSB7XG5cdFx0XHRcdGF3YWl0IGludGVyYWN0aW9uLmRlZmVyUmVwbHkoeyBlcGhlbWVyYWw6IGNvbW1hbmQuc2xhc2hFcGhlbWVyYWwgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9TVEFSVEVELCBtZXNzYWdlLCBjb21tYW5kLCBjb252ZXJ0ZWRPcHRpb25zKTtcblx0XHRcdFx0Y29uc3QgcmV0ID1cblx0XHRcdFx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPYmplY3QuZ2V0UHJvdG90eXBlT2YoY29tbWFuZCkpLmluY2x1ZGVzKFwiZXhlY1NsYXNoXCIpIHx8IHRoaXMuZXhlY1NsYXNoXG5cdFx0XHRcdFx0XHQ/IGF3YWl0IGNvbW1hbmQuZXhlY1NsYXNoKG1lc3NhZ2UsIGNvbnZlcnRlZE9wdGlvbnMpXG5cdFx0XHRcdFx0XHQ6IGF3YWl0IGNvbW1hbmQuZXhlYyhtZXNzYWdlLCBjb252ZXJ0ZWRPcHRpb25zKTtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX0ZJTklTSEVELCBtZXNzYWdlLCBjb21tYW5kLCBjb252ZXJ0ZWRPcHRpb25zLCByZXQpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfRVJST1IsIGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIEhhbmRsZXMgbm9ybWFsIGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gY29udGVudCAtIENvbnRlbnQgb2YgbWVzc2FnZSB3aXRob3V0IGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCBpbnN0YW5jZS5cblx0ICogQHBhcmFtIGlnbm9yZSAtIElnbm9yZSBpbmhpYml0b3JzIGFuZCBvdGhlciBjaGVja3MuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlRGlyZWN0Q29tbWFuZChcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdGNvbnRlbnQ6IHN0cmluZyxcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdGlnbm9yZTogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcblx0XHRsZXQga2V5O1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoIWlnbm9yZSkge1xuXHRcdFx0XHRpZiAobWVzc2FnZS5lZGl0ZWRUaW1lc3RhbXAgJiYgIWNvbW1hbmQuZWRpdGFibGUpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUG9zdFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIGNvbW1hbmQpKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBiZWZvcmUgPSBjb21tYW5kLmJlZm9yZShtZXNzYWdlKTtcblx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShiZWZvcmUpKSBhd2FpdCBiZWZvcmU7XG5cblx0XHRcdGNvbnN0IGFyZ3MgPSBhd2FpdCBjb21tYW5kLnBhcnNlKG1lc3NhZ2UsIGNvbnRlbnQpO1xuXHRcdFx0aWYgKEZsYWcuaXMoYXJncywgXCJjYW5jZWxcIikpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfQ0FOQ0VMTEVELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKEZsYWcuaXMoYXJncywgXCJyZXRyeVwiKSkge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9CUkVBS09VVCwgbWVzc2FnZSwgY29tbWFuZCwgYXJncy5tZXNzYWdlKTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuaGFuZGxlKGFyZ3MubWVzc2FnZSk7XG5cdFx0XHR9IGVsc2UgaWYgKEZsYWcuaXMoYXJncywgXCJjb250aW51ZVwiKSkge1xuXHRcdFx0XHRjb25zdCBjb250aW51ZUNvbW1hbmQgPSB0aGlzLm1vZHVsZXMuZ2V0KGFyZ3MuY29tbWFuZCkhO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5oYW5kbGVEaXJlY3RDb21tYW5kKG1lc3NhZ2UsIGFyZ3MucmVzdCwgY29udGludWVDb21tYW5kLCBhcmdzLmlnbm9yZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghaWdub3JlKSB7XG5cdFx0XHRcdGlmIChjb21tYW5kLmxvY2spIGtleSA9IChjb21tYW5kLmxvY2sgYXMgS2V5U3VwcGxpZXIpKG1lc3NhZ2UsIGFyZ3MpO1xuXHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2Uoa2V5KSkga2V5ID0gYXdhaXQga2V5O1xuXHRcdFx0XHRpZiAoa2V5KSB7XG5cdFx0XHRcdFx0aWYgKGNvbW1hbmQubG9ja2VyPy5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdFx0a2V5ID0gbnVsbDtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0xPQ0tFRCwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb21tYW5kLmxvY2tlcj8uYWRkKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0YXdhaXQgdGhpcy5ydW5Db21tYW5kKG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGlmIChrZXkpIGNvbW1hbmQubG9ja2VyPy5kZWxldGUoa2V5KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyByZWdleCBhbmQgY29uZGl0aW9uYWwgY29tbWFuZHMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlUmVnZXhBbmRDb25kaXRpb25hbENvbW1hbmRzKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCByYW4xID0gYXdhaXQgdGhpcy5oYW5kbGVSZWdleENvbW1hbmRzKG1lc3NhZ2UpO1xuXHRcdGNvbnN0IHJhbjIgPSBhd2FpdCB0aGlzLmhhbmRsZUNvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZSk7XG5cdFx0cmV0dXJuIHJhbjEgfHwgcmFuMjtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHJlZ2V4IGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZVJlZ2V4Q29tbWFuZHMobWVzc2FnZTogTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IGhhc1JlZ2V4Q29tbWFuZHMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmQgb2YgdGhpcy5tb2R1bGVzLnZhbHVlcygpKSB7XG5cdFx0XHRpZiAobWVzc2FnZS5lZGl0ZWRUaW1lc3RhbXAgPyBjb21tYW5kLmVkaXRhYmxlIDogdHJ1ZSkge1xuXHRcdFx0XHRjb25zdCByZWdleCA9IHR5cGVvZiBjb21tYW5kLnJlZ2V4ID09PSBcImZ1bmN0aW9uXCIgPyBjb21tYW5kLnJlZ2V4KG1lc3NhZ2UpIDogY29tbWFuZC5yZWdleDtcblx0XHRcdFx0aWYgKHJlZ2V4KSBoYXNSZWdleENvbW1hbmRzLnB1c2goeyBjb21tYW5kLCByZWdleCB9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBtYXRjaGVkQ29tbWFuZHMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIGhhc1JlZ2V4Q29tbWFuZHMpIHtcblx0XHRcdGNvbnN0IG1hdGNoID0gbWVzc2FnZS5jb250ZW50Lm1hdGNoKGVudHJ5LnJlZ2V4KTtcblx0XHRcdGlmICghbWF0Y2gpIGNvbnRpbnVlO1xuXG5cdFx0XHRjb25zdCBtYXRjaGVzID0gW107XG5cblx0XHRcdGlmIChlbnRyeS5yZWdleC5nbG9iYWwpIHtcblx0XHRcdFx0bGV0IG1hdGNoZWQ7XG5cblx0XHRcdFx0d2hpbGUgKChtYXRjaGVkID0gZW50cnkucmVnZXguZXhlYyhtZXNzYWdlLmNvbnRlbnQpKSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0bWF0Y2hlcy5wdXNoKG1hdGNoZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG1hdGNoZWRDb21tYW5kcy5wdXNoKHsgY29tbWFuZDogZW50cnkuY29tbWFuZCwgbWF0Y2gsIG1hdGNoZXMgfSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFtYXRjaGVkQ29tbWFuZHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IHsgY29tbWFuZCwgbWF0Y2gsIG1hdGNoZXMgfSBvZiBtYXRjaGVkQ29tbWFuZHMpIHtcblx0XHRcdHByb21pc2VzLnB1c2goXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBiZWZvcmUgPSBjb21tYW5kLmJlZm9yZShtZXNzYWdlKTtcblx0XHRcdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShiZWZvcmUpKSBhd2FpdCBiZWZvcmU7XG5cblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucnVuQ29tbWFuZChtZXNzYWdlLCBjb21tYW5kLCB7IG1hdGNoLCBtYXRjaGVzIH0pO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgY29uZGl0aW9uYWwgY29tbWFuZHMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlOiBNZXNzYWdlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgdHJ1ZUNvbW1hbmRzOiBDb21tYW5kW10gPSBbXTtcblxuXHRcdGNvbnN0IGZpbHRlclByb21pc2VzID0gW107XG5cdFx0Zm9yIChjb25zdCBjb21tYW5kIG9mIHRoaXMubW9kdWxlcy52YWx1ZXMoKSkge1xuXHRcdFx0aWYgKG1lc3NhZ2UuZWRpdGVkVGltZXN0YW1wICYmICFjb21tYW5kLmVkaXRhYmxlKSBjb250aW51ZTtcblx0XHRcdGZpbHRlclByb21pc2VzLnB1c2goXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0bGV0IGNvbmQgPSBjb21tYW5kLmNvbmRpdGlvbihtZXNzYWdlKTtcblx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoY29uZCkpIGNvbmQgPSBhd2FpdCBjb25kO1xuXHRcdFx0XHRcdGlmIChjb25kKSB0cnVlQ29tbWFuZHMucHVzaChjb21tYW5kKTtcblx0XHRcdFx0fSkoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChmaWx0ZXJQcm9taXNlcyk7XG5cblx0XHRpZiAoIXRydWVDb21tYW5kcy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBwcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgY29tbWFuZCBvZiB0cnVlQ29tbWFuZHMpIHtcblx0XHRcdHByb21pc2VzLnB1c2goXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkgcmV0dXJuO1xuXHRcdFx0XHRcdFx0Y29uc3QgYmVmb3JlID0gY29tbWFuZC5iZWZvcmUobWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoYmVmb3JlKSkgYXdhaXQgYmVmb3JlO1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5ydW5Db21tYW5kKG1lc3NhZ2UsIGNvbW1hbmQsIHt9KTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSgpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGluaGliaXRvcnMgd2l0aCB0aGUgYWxsIHR5cGUuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBzbGFzaCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIHNob3VsZCBpcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuQWxsVHlwZUluaGliaXRvcnMobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsIHNsYXNoOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCByZWFzb24gPSB0aGlzLmluaGliaXRvckhhbmRsZXIgPyBhd2FpdCB0aGlzLmluaGliaXRvckhhbmRsZXIudGVzdChcImFsbFwiLCBtZXNzYWdlKSA6IG51bGw7XG5cblx0XHRpZiAocmVhc29uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIHJlYXNvbik7XG5cdFx0fSBlbHNlIGlmICghbWVzc2FnZS5hdXRob3IpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIEJ1aWx0SW5SZWFzb25zLkFVVEhPUl9OT1RfRk9VTkQpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5ibG9ja0NsaWVudCAmJiBtZXNzYWdlLmF1dGhvci5pZCA9PT0gdGhpcy5jbGllbnQudXNlcj8uaWQpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIEJ1aWx0SW5SZWFzb25zLkNMSUVOVCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLmJsb2NrQm90cyAmJiBtZXNzYWdlLmF1dGhvci5ib3QpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIEJ1aWx0SW5SZWFzb25zLkJPVCk7XG5cdFx0fSBlbHNlIGlmICghc2xhc2ggJiYgdGhpcy5oYXNQcm9tcHQobWVzc2FnZS5jaGFubmVsISwgbWVzc2FnZS5hdXRob3IpKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuSU5fUFJPTVBULCBtZXNzYWdlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgaW5oaWJpdG9ycyB3aXRoIHRoZSBwcmUgdHlwZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW5QcmVUeXBlSW5oaWJpdG9ycyhtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHJlYXNvbiA9IHRoaXMuaW5oaWJpdG9ySGFuZGxlciA/IGF3YWl0IHRoaXMuaW5oaWJpdG9ySGFuZGxlci50ZXN0KFwicHJlXCIsIG1lc3NhZ2UpIDogbnVsbDtcblxuXHRcdGlmIChyZWFzb24gIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCwgbWVzc2FnZSwgcmVhc29uKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgaW5oaWJpdG9ycyB3aXRoIHRoZSBwb3N0IHR5cGUuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBzbGFzaCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIHNob3VsZCBpcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUG9zdFR5cGVJbmhpYml0b3JzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0c2xhc2g6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBldmVudCA9IHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfQkxPQ0tFRCA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfQkxPQ0tFRDtcblxuXHRcdGlmICghdGhpcy5za2lwQnVpbHRJblBvc3RJbmhpYml0b3JzKSB7XG5cdFx0XHRpZiAoY29tbWFuZC5vd25lck9ubHkpIHtcblx0XHRcdFx0Y29uc3QgaXNPd25lciA9IHRoaXMuY2xpZW50LmlzT3duZXIobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0XHRpZiAoIWlzT3duZXIpIHtcblx0XHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLk9XTkVSKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5zdXBlclVzZXJPbmx5KSB7XG5cdFx0XHRcdGNvbnN0IGlzU3VwZXJVc2VyID0gdGhpcy5jbGllbnQuaXNTdXBlclVzZXIobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0XHRpZiAoIWlzU3VwZXJVc2VyKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5TVVBFUl9VU0VSKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5jaGFubmVsID09PSBcImd1aWxkXCIgJiYgIW1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5HVUlMRCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5jaGFubmVsID09PSBcImRtXCIgJiYgbWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLkRNKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb21tYW5kLm9ubHlOc2Z3ICYmICEobWVzc2FnZS5jaGFubmVsIGFzIFRleHRDaGFubmVsKT8uW1wibnNmd1wiXSkge1xuXHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLk5PVF9OU0ZXKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnNraXBCdWlsdEluUG9zdEluaGliaXRvcnMpIHtcblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBlcm1pc3Npb25DaGVja3MobWVzc2FnZSwgY29tbWFuZCwgc2xhc2gpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHJlYXNvbiA9IHRoaXMuaW5oaWJpdG9ySGFuZGxlciA/IGF3YWl0IHRoaXMuaW5oaWJpdG9ySGFuZGxlci50ZXN0KFwicG9zdFwiLCBtZXNzYWdlLCBjb21tYW5kKSA6IG51bGw7XG5cblx0XHRpZiAodGhpcy5za2lwQnVpbHRJblBvc3RJbmhpYml0b3JzKSB7XG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5QZXJtaXNzaW9uQ2hlY2tzKG1lc3NhZ2UsIGNvbW1hbmQsIHNsYXNoKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAocmVhc29uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgcmVhc29uKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnJ1bkNvb2xkb3ducyhtZXNzYWdlLCBjb21tYW5kKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgcGVybWlzc2lvbiBjaGVja3MuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGNvb2xkb3duLlxuXHQgKiBAcGFyYW0gc2xhc2ggLSBXaGV0aGVyIG9yIG5vdCB0aGUgY29tbWFuZCBpcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUGVybWlzc2lvbkNoZWNrcyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdHNsYXNoOiBib29sZWFuID0gZmFsc2Vcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0aWYgKGNvbW1hbmQuY2xpZW50UGVybWlzc2lvbnMpIHtcblx0XHRcdGlmICh0eXBlb2YgY29tbWFuZC5jbGllbnRQZXJtaXNzaW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdGxldCBtaXNzaW5nID0gY29tbWFuZC5jbGllbnRQZXJtaXNzaW9ucyhtZXNzYWdlKTtcblx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKG1pc3NpbmcpKSBtaXNzaW5nID0gYXdhaXQgbWlzc2luZztcblxuXHRcdFx0XHRpZiAobWlzc2luZyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KFxuXHRcdFx0XHRcdFx0c2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdFx0XCJjbGllbnRcIixcblx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0aWYgKG1lc3NhZ2UuY2hhbm5lbD8udHlwZSA9PT0gXCJETVwiKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGNvbnN0IG1pc3NpbmcgPSBtZXNzYWdlLmNoYW5uZWw/LnBlcm1pc3Npb25zRm9yKG1lc3NhZ2UuZ3VpbGQubWUhKT8ubWlzc2luZyhjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zKTtcblx0XHRcdFx0aWYgKG1pc3Npbmc/Lmxlbmd0aCkge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFwiY2xpZW50XCIsXG5cdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLnVzZXJQZXJtaXNzaW9ucykge1xuXHRcdFx0Y29uc3QgaWdub3JlciA9IGNvbW1hbmQuaWdub3JlUGVybWlzc2lvbnMgfHwgdGhpcy5pZ25vcmVQZXJtaXNzaW9ucztcblx0XHRcdGNvbnN0IGlzSWdub3JlZCA9IEFycmF5LmlzQXJyYXkoaWdub3Jlcilcblx0XHRcdFx0PyBpZ25vcmVyLmluY2x1ZGVzKG1lc3NhZ2UuYXV0aG9yLmlkKVxuXHRcdFx0XHQ6IHR5cGVvZiBpZ25vcmVyID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdFx0PyBpZ25vcmVyKG1lc3NhZ2UsIGNvbW1hbmQpXG5cdFx0XHRcdDogbWVzc2FnZS5hdXRob3IuaWQgPT09IGlnbm9yZXI7XG5cblx0XHRcdGlmICghaXNJZ25vcmVkKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgY29tbWFuZC51c2VyUGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdGxldCBtaXNzaW5nID0gY29tbWFuZC51c2VyUGVybWlzc2lvbnMobWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKG1pc3NpbmcpKSBtaXNzaW5nID0gYXdhaXQgbWlzc2luZztcblxuXHRcdFx0XHRcdGlmIChtaXNzaW5nICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdFx0c2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFx0XCJ1c2VyXCIsXG5cdFx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAobWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLmNoYW5uZWw/LnR5cGUgPT09IFwiRE1cIikgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdGNvbnN0IG1pc3NpbmcgPSBtZXNzYWdlLmNoYW5uZWw/LnBlcm1pc3Npb25zRm9yKG1lc3NhZ2UuYXV0aG9yKT8ubWlzc2luZyhjb21tYW5kLnVzZXJQZXJtaXNzaW9ucyk7XG5cdFx0XHRcdFx0aWYgKG1pc3Npbmc/Lmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFxuXHRcdFx0XHRcdFx0XHRzbGFzaCA/IENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX01JU1NJTkdfUEVSTUlTU0lPTlMgOiBDb21tYW5kSGFuZGxlckV2ZW50cy5NSVNTSU5HX1BFUk1JU1NJT05TLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdFx0XHRcInVzZXJcIixcblx0XHRcdFx0XHRcdFx0bWlzc2luZ1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGNvb2xkb3ducyBhbmQgY2hlY2tzIGlmIGEgdXNlciBpcyB1bmRlciBjb29sZG93bi5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gY29vbGRvd24uXG5cdCAqL1xuXHRwdWJsaWMgcnVuQ29vbGRvd25zKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLCBjb21tYW5kOiBDb21tYW5kKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgaWQgPSBtZXNzYWdlLmF1dGhvcj8uaWQ7XG5cdFx0Y29uc3QgaWdub3JlciA9IGNvbW1hbmQuaWdub3JlQ29vbGRvd24gfHwgdGhpcy5pZ25vcmVDb29sZG93bjtcblx0XHRjb25zdCBpc0lnbm9yZWQgPSBBcnJheS5pc0FycmF5KGlnbm9yZXIpXG5cdFx0XHQ/IGlnbm9yZXIuaW5jbHVkZXMoaWQpXG5cdFx0XHQ6IHR5cGVvZiBpZ25vcmVyID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdD8gaWdub3JlcihtZXNzYWdlLCBjb21tYW5kKVxuXHRcdFx0OiBpZCA9PT0gaWdub3JlcjtcblxuXHRcdGlmIChpc0lnbm9yZWQpIHJldHVybiBmYWxzZTtcblxuXHRcdGNvbnN0IHRpbWUgPSBjb21tYW5kLmNvb2xkb3duICE9IG51bGwgPyBjb21tYW5kLmNvb2xkb3duIDogdGhpcy5kZWZhdWx0Q29vbGRvd247XG5cdFx0aWYgKCF0aW1lKSByZXR1cm4gZmFsc2U7XG5cblx0XHRjb25zdCBlbmRUaW1lID0gbWVzc2FnZS5jcmVhdGVkVGltZXN0YW1wICsgdGltZTtcblxuXHRcdGlmICghdGhpcy5jb29sZG93bnMuaGFzKGlkKSkgdGhpcy5jb29sZG93bnMuc2V0KGlkLCB7fSk7XG5cblx0XHRpZiAoIXRoaXMuY29vbGRvd25zLmdldChpZCkhW2NvbW1hbmQuaWRdKSB7XG5cdFx0XHR0aGlzLmNvb2xkb3ducy5nZXQoaWQpIVtjb21tYW5kLmlkXSA9IHtcblx0XHRcdFx0dGltZXI6IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLmNvb2xkb3ducy5nZXQoaWQpIVtjb21tYW5kLmlkXSkge1xuXHRcdFx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuY29vbGRvd25zLmdldChpZCkhW2NvbW1hbmQuaWRdLnRpbWVyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5jb29sZG93bnMuZ2V0KGlkKSFbY29tbWFuZC5pZF0gPSBudWxsITtcblxuXHRcdFx0XHRcdGlmICghT2JqZWN0LmtleXModGhpcy5jb29sZG93bnMuZ2V0KGlkKSEpLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jb29sZG93bnMuZGVsZXRlKGlkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHRpbWUpLnVucmVmKCksXG5cdFx0XHRcdGVuZDogZW5kVGltZSxcblx0XHRcdFx0dXNlczogMFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRjb25zdCBlbnRyeSA9IHRoaXMuY29vbGRvd25zLmdldChpZCkhW2NvbW1hbmQuaWRdO1xuXG5cdFx0aWYgKGVudHJ5LnVzZXMgPj0gY29tbWFuZC5yYXRlbGltaXQpIHtcblx0XHRcdGNvbnN0IGVuZCA9IHRoaXMuY29vbGRvd25zLmdldChpZCkhW2NvbW1hbmQuaWRdLmVuZDtcblx0XHRcdGNvbnN0IGRpZmYgPSBlbmQgLSBtZXNzYWdlLmNyZWF0ZWRUaW1lc3RhbXA7XG5cblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT09MRE9XTiwgbWVzc2FnZSwgY29tbWFuZCwgZGlmZik7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRlbnRyeS51c2VzKys7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gYXJncyAtIEFyZ3VtZW50cyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuQ29tbWFuZChtZXNzYWdlOiBNZXNzYWdlLCBjb21tYW5kOiBDb21tYW5kLCBhcmdzOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIWNvbW1hbmQgfHwgIW1lc3NhZ2UpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0lOVkFMSUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoY29tbWFuZC50eXBpbmcgfHwgdGhpcy50eXBpbmcpIHtcblx0XHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kVHlwaW5nKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfU1RBUlRFRCwgbWVzc2FnZSwgY29tbWFuZCwgYXJncyk7XG5cdFx0Y29uc3QgcmV0ID0gYXdhaXQgY29tbWFuZC5leGVjKG1lc3NhZ2UsIGFyZ3MpO1xuXHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0ZJTklTSEVELCBtZXNzYWdlLCBjb21tYW5kLCBhcmdzLCByZXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgY29tbWFuZCBhbmQgaXRzIGFyZ3VtZW50IGxpc3QuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBwYXJzZUNvbW1hbmQobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UpOiBQcm9taXNlPFBhcnNlZENvbXBvbmVudERhdGE+IHtcblx0XHRjb25zdCBhbGxvd01lbnRpb24gPSBhd2FpdCBVdGlsLmludG9DYWxsYWJsZSh0aGlzLnByZWZpeCkobWVzc2FnZSk7XG5cdFx0bGV0IHByZWZpeGVzID0gVXRpbC5pbnRvQXJyYXkoYWxsb3dNZW50aW9uKTtcblx0XHRpZiAoYWxsb3dNZW50aW9uKSB7XG5cdFx0XHRjb25zdCBtZW50aW9ucyA9IFtgPEAke3RoaXMuY2xpZW50LnVzZXI/LmlkfT5gLCBgPEAhJHt0aGlzLmNsaWVudC51c2VyPy5pZH0+YF07XG5cdFx0XHRwcmVmaXhlcyA9IFsuLi5tZW50aW9ucywgLi4ucHJlZml4ZXNdO1xuXHRcdH1cblxuXHRcdHByZWZpeGVzLnNvcnQoVXRpbC5wcmVmaXhDb21wYXJlKTtcblx0XHRyZXR1cm4gdGhpcy5wYXJzZU11bHRpcGxlUHJlZml4ZXMoXG5cdFx0XHRtZXNzYWdlLFxuXHRcdFx0cHJlZml4ZXMubWFwKHAgPT4gW3AsIG51bGxdKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBjb21tYW5kIGFuZCBpdHMgYXJndW1lbnQgbGlzdCB1c2luZyBwcmVmaXggb3ZlcndyaXRlcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHBhcnNlQ29tbWFuZE92ZXJ3cml0dGVuUHJlZml4ZXMobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UpOiBQcm9taXNlPFBhcnNlZENvbXBvbmVudERhdGE+IHtcblx0XHRpZiAoIXRoaXMucHJlZml4ZXMuc2l6ZSkge1xuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblxuXHRcdGNvbnN0IHByb21pc2VzID0gdGhpcy5wcmVmaXhlcy5tYXAoYXN5bmMgKGNtZHMsIHByb3ZpZGVyKSA9PiB7XG5cdFx0XHRjb25zdCBwcmVmaXhlcyA9IFV0aWwuaW50b0FycmF5KGF3YWl0IFV0aWwuaW50b0NhbGxhYmxlKHByb3ZpZGVyKShtZXNzYWdlKSk7XG5cdFx0XHRyZXR1cm4gcHJlZml4ZXMubWFwKHAgPT4gW3AsIGNtZHNdKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IHBhaXJzID0gVXRpbC5mbGF0TWFwKGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKSwgKHg6IGFueSkgPT4geCk7XG5cdFx0cGFpcnMuc29ydCgoW2FdOiBhbnksIFtiXTogYW55KSA9PiBVdGlsLnByZWZpeENvbXBhcmUoYSwgYikpO1xuXHRcdHJldHVybiB0aGlzLnBhcnNlTXVsdGlwbGVQcmVmaXhlcyhtZXNzYWdlLCBwYWlycyBhcyBbc3RyaW5nLCBTZXQ8c3RyaW5nPl1bXSk7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBwYXJzZVdpdGhQcmVmaXggb24gbXVsdGlwbGUgcHJlZml4ZXMgYW5kIHJldHVybnMgdGhlIGJlc3QgcGFyc2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBwYXJzZS5cblx0ICogQHBhcmFtIHBhaXJzIC0gUGFpcnMgb2YgcHJlZml4IHRvIGFzc29jaWF0ZWQgY29tbWFuZHMuIFRoYXQgaXMsIGBbc3RyaW5nLCBTZXQ8c3RyaW5nPiB8IG51bGxdW11gLlxuXHQgKi9cblx0cHVibGljIHBhcnNlTXVsdGlwbGVQcmVmaXhlcyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRwYWlyczogW3N0cmluZywgU2V0PHN0cmluZz4gfCBudWxsXVtdXG5cdCk6IFBhcnNlZENvbXBvbmVudERhdGEge1xuXHRcdGNvbnN0IHBhcnNlcyA9IHBhaXJzLm1hcCgoW3ByZWZpeCwgY21kc10pID0+IHRoaXMucGFyc2VXaXRoUHJlZml4KG1lc3NhZ2UsIHByZWZpeCwgY21kcykpO1xuXHRcdGNvbnN0IHJlc3VsdCA9IHBhcnNlcy5maW5kKHBhcnNlZCA9PiBwYXJzZWQuY29tbWFuZCk7XG5cdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHRjb25zdCBndWVzcyA9IHBhcnNlcy5maW5kKHBhcnNlZCA9PiBwYXJzZWQucHJlZml4ICE9IG51bGwpO1xuXHRcdGlmIChndWVzcykge1xuXHRcdFx0cmV0dXJuIGd1ZXNzO1xuXHRcdH1cblxuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmllcyB0byBwYXJzZSBhIG1lc3NhZ2Ugd2l0aCB0aGUgZ2l2ZW4gcHJlZml4IGFuZCBhc3NvY2lhdGVkIGNvbW1hbmRzLlxuXHQgKiBBc3NvY2lhdGVkIGNvbW1hbmRzIHJlZmVyIHRvIHdoZW4gYSBwcmVmaXggaXMgdXNlZCBpbiBwcmVmaXggb3ZlcnJpZGVzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gcGFyc2UuXG5cdCAqIEBwYXJhbSBwcmVmaXggLSBQcmVmaXggdG8gdXNlLlxuXHQgKiBAcGFyYW0gYXNzb2NpYXRlZENvbW1hbmRzIC0gQXNzb2NpYXRlZCBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZVdpdGhQcmVmaXgoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsXG5cdFx0cHJlZml4OiBzdHJpbmcsXG5cdFx0YXNzb2NpYXRlZENvbW1hbmRzOiBTZXQ8c3RyaW5nPiB8IG51bGwgPSBudWxsXG5cdCk6IFBhcnNlZENvbXBvbmVudERhdGEge1xuXHRcdGNvbnN0IGxvd2VyQ29udGVudCA9IG1lc3NhZ2UuY29udGVudC50b0xvd2VyQ2FzZSgpO1xuXHRcdGlmICghbG93ZXJDb250ZW50LnN0YXJ0c1dpdGgocHJlZml4LnRvTG93ZXJDYXNlKCkpKSB7XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fVxuXG5cdFx0Y29uc3QgZW5kT2ZQcmVmaXggPSBsb3dlckNvbnRlbnQuaW5kZXhPZihwcmVmaXgudG9Mb3dlckNhc2UoKSkgKyBwcmVmaXgubGVuZ3RoO1xuXHRcdGNvbnN0IHN0YXJ0T2ZBcmdzID0gbWVzc2FnZS5jb250ZW50LnNsaWNlKGVuZE9mUHJlZml4KS5zZWFyY2goL1xcUy8pICsgcHJlZml4Lmxlbmd0aDtcblx0XHRjb25zdCBhbGlhcyA9IG1lc3NhZ2UuY29udGVudC5zbGljZShzdGFydE9mQXJncykuc3BsaXQoL1xcc3sxLH18XFxuezEsfS8pWzBdO1xuXHRcdGNvbnN0IGNvbW1hbmQgPSB0aGlzLmZpbmRDb21tYW5kKGFsaWFzKTtcblx0XHRjb25zdCBjb250ZW50ID0gbWVzc2FnZS5jb250ZW50LnNsaWNlKHN0YXJ0T2ZBcmdzICsgYWxpYXMubGVuZ3RoICsgMSkudHJpbSgpO1xuXHRcdGNvbnN0IGFmdGVyUHJlZml4ID0gbWVzc2FnZS5jb250ZW50LnNsaWNlKHByZWZpeC5sZW5ndGgpLnRyaW0oKTtcblxuXHRcdGlmICghY29tbWFuZCkge1xuXHRcdFx0cmV0dXJuIHsgcHJlZml4LCBhbGlhcywgY29udGVudCwgYWZ0ZXJQcmVmaXggfTtcblx0XHR9XG5cblx0XHRpZiAoYXNzb2NpYXRlZENvbW1hbmRzID09IG51bGwpIHtcblx0XHRcdGlmIChjb21tYW5kLnByZWZpeCAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiB7IHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghYXNzb2NpYXRlZENvbW1hbmRzLmhhcyhjb21tYW5kLmlkKSkge1xuXHRcdFx0cmV0dXJuIHsgcHJlZml4LCBhbGlhcywgY29udGVudCwgYWZ0ZXJQcmVmaXggfTtcblx0XHR9XG5cblx0XHRyZXR1cm4geyBjb21tYW5kLCBwcmVmaXgsIGFsaWFzLCBjb250ZW50LCBhZnRlclByZWZpeCB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZXJyb3JzIGZyb20gdGhlIGhhbmRsaW5nLlxuXHQgKiBAcGFyYW0gZXJyIC0gVGhlIGVycm9yLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0aGF0IGVycm9yZWQuXG5cdCAqL1xuXHRwdWJsaWMgZW1pdEVycm9yKGVycjogRXJyb3IsIG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLCBjb21tYW5kPzogQ29tbWFuZCB8IEFrYWlyb01vZHVsZSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLmxpc3RlbmVyQ291bnQoQ29tbWFuZEhhbmRsZXJFdmVudHMuRVJST1IpKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuRVJST1IsIGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhyb3cgZXJyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN3ZWVwIGNvbW1hbmQgdXRpbCBpbnN0YW5jZXMgZnJvbSBjYWNoZSBhbmQgcmV0dXJucyBhbW91bnQgc3dlZXBlZC5cblx0ICogQHBhcmFtIGxpZmV0aW1lIC0gTWVzc2FnZXMgb2xkZXIgdGhhbiB0aGlzIHdpbGwgaGF2ZSB0aGVpciBjb21tYW5kIHV0aWwgaW5zdGFuY2Ugc3dlZXBlZC4gVGhpcyBpcyBpbiBtaWxsaXNlY29uZHMgYW5kIGRlZmF1bHRzIHRvIHRoZSBgY29tbWFuZFV0aWxMaWZldGltZWAgb3B0aW9uLlxuXHQgKi9cblx0cHVibGljIHN3ZWVwQ29tbWFuZFV0aWwobGlmZXRpbWU6IG51bWJlciA9IHRoaXMuY29tbWFuZFV0aWxMaWZldGltZSk6IG51bWJlciB7XG5cdFx0bGV0IGNvdW50ID0gMDtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmRVdGlsIG9mIHRoaXMuY29tbWFuZFV0aWxzLnZhbHVlcygpKSB7XG5cdFx0XHRjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXHRcdFx0Y29uc3QgbWVzc2FnZSA9IGNvbW1hbmRVdGlsLm1lc3NhZ2U7XG5cdFx0XHRpZiAobm93IC0gKChtZXNzYWdlIGFzIE1lc3NhZ2UpLmVkaXRlZFRpbWVzdGFtcCB8fCBtZXNzYWdlLmNyZWF0ZWRUaW1lc3RhbXApID4gbGlmZXRpbWUpIHtcblx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0dGhpcy5jb21tYW5kVXRpbHMuZGVsZXRlKG1lc3NhZ2UuaWQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjb3VudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIG9uZ29pbmcgcHJvbXB0IGluIG9yZGVyIHRvIHByZXZlbnQgY29tbWFuZCB1c2FnZSBpbiB0aGUgY2hhbm5lbC5cblx0ICogQHBhcmFtIGNoYW5uZWwgLSBDaGFubmVsIHRvIGFkZCB0by5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIGFkZC5cblx0ICovXG5cdHB1YmxpYyBhZGRQcm9tcHQoY2hhbm5lbDogVGV4dEJhc2VkQ2hhbm5lbHMsIHVzZXI6IFVzZXIpOiB2b2lkIHtcblx0XHRsZXQgdXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdGlmICghdXNlcnMpIHRoaXMucHJvbXB0cy5zZXQoY2hhbm5lbC5pZCwgbmV3IFNldCgpKTtcblx0XHR1c2VycyA9IHRoaXMucHJvbXB0cy5nZXQoY2hhbm5lbC5pZCk7XG5cdFx0dXNlcnM/LmFkZCh1c2VyLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFuIG9uZ29pbmcgcHJvbXB0LlxuXHQgKiBAcGFyYW0gY2hhbm5lbCAtIENoYW5uZWwgdG8gcmVtb3ZlIGZyb20uXG5cdCAqIEBwYXJhbSB1c2VyIC0gVXNlciB0byByZW1vdmUuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlUHJvbXB0KGNoYW5uZWw6IFRleHRCYXNlZENoYW5uZWxzLCB1c2VyOiBVc2VyKTogdm9pZCB7XG5cdFx0Y29uc3QgdXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdGlmICghdXNlcnMpIHJldHVybjtcblx0XHR1c2Vycy5kZWxldGUodXNlci5pZCk7XG5cdFx0aWYgKCF1c2Vycy5zaXplKSB0aGlzLnByb21wdHMuZGVsZXRlKHVzZXIuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGVyZSBpcyBhbiBvbmdvaW5nIHByb21wdC5cblx0ICogQHBhcmFtIGNoYW5uZWwgLSBDaGFubmVsIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gdXNlciAtIFVzZXIgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgaGFzUHJvbXB0KGNoYW5uZWw6IFRleHRCYXNlZENoYW5uZWxzLCB1c2VyOiBVc2VyKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgdXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdGlmICghdXNlcnMpIHJldHVybiBmYWxzZTtcblx0XHRyZXR1cm4gdXNlcnMuaGFzKHVzZXIuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY29tbWFuZCBieSBhbGlhcy5cblx0ICogQHBhcmFtIG5hbWUgLSBBbGlhcyB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgZmluZENvbW1hbmQobmFtZTogc3RyaW5nKTogQ29tbWFuZCB7XG5cdFx0cmV0dXJuIHRoaXMubW9kdWxlcy5nZXQodGhpcy5hbGlhc2VzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpISkhO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgaW5oaWJpdG9yIGhhbmRsZXIgdG8gdXNlLlxuXHQgKiBAcGFyYW0gaW5oaWJpdG9ySGFuZGxlciAtIFRoZSBpbmhpYml0b3IgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyB1c2VJbmhpYml0b3JIYW5kbGVyKGluaGliaXRvckhhbmRsZXI6IEluaGliaXRvckhhbmRsZXIpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0dGhpcy5pbmhpYml0b3JIYW5kbGVyID0gaW5oaWJpdG9ySGFuZGxlcjtcblx0XHR0aGlzLnJlc29sdmVyLmluaGliaXRvckhhbmRsZXIgPSBpbmhpYml0b3JIYW5kbGVyO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBsaXN0ZW5lciBoYW5kbGVyIHRvIHVzZS5cblx0ICogQHBhcmFtIGxpc3RlbmVySGFuZGxlciAtIFRoZSBsaXN0ZW5lciBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIHVzZUxpc3RlbmVySGFuZGxlcihsaXN0ZW5lckhhbmRsZXI6IExpc3RlbmVySGFuZGxlcik6IENvbW1hbmRIYW5kbGVyIHtcblx0XHR0aGlzLnJlc29sdmVyLmxpc3RlbmVySGFuZGxlciA9IGxpc3RlbmVySGFuZGxlcjtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWQodGhpbmc6IHN0cmluZyB8IENvbW1hbmQpOiBQcm9taXNlPENvbW1hbmQ+IHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZykgYXMgUHJvbWlzZTxDb21tYW5kPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgY29tbWFuZHMgZnJvbSB0aGUgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS4gRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWRBbGwoZGlyZWN0b3J5Pzogc3RyaW5nLCBmaWx0ZXI/OiBMb2FkUHJlZGljYXRlKTogUHJvbWlzZTxDb21tYW5kSGFuZGxlcj4ge1xuXHRcdHJldHVybiBzdXBlci5sb2FkQWxsKGRpcmVjdG9yeSwgZmlsdGVyKSBhcyBQcm9taXNlPENvbW1hbmRIYW5kbGVyPjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBDb21tYW5kIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBDb21tYW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIENvbW1hbmRIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoaWQ6IHN0cmluZyk6IFByb21pc2U8Q29tbWFuZD4ge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoaWQpIGFzIFByb21pc2U8Q29tbWFuZD47XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkQWxsKCk6IFByb21pc2U8Q29tbWFuZEhhbmRsZXI+IHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkQWxsKCkgYXMgUHJvbWlzZTxDb21tYW5kSGFuZGxlcj47XG5cdH1cblxuXHRwdWJsaWMgb3ZlcnJpZGUgb248SyBleHRlbmRzIGtleW9mIENvbW1hbmRIYW5kbGVyRXZlbnRzVHlwZT4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBDb21tYW5kSGFuZGxlckV2ZW50c1R5cGVbS11bXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub24oZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxuXHRwdWJsaWMgb3ZlcnJpZGUgb25jZTxLIGV4dGVuZHMga2V5b2YgQ29tbWFuZEhhbmRsZXJFdmVudHNUeXBlPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IENvbW1hbmRIYW5kbGVyRXZlbnRzVHlwZVtLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbmNlKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kSGFuZGxlck9wdGlvbnMgZXh0ZW5kcyBBa2Fpcm9IYW5kbGVyT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBSZWd1bGFyIGV4cHJlc3Npb24gdG8gYXV0b21hdGljYWxseSBtYWtlIGNvbW1hbmQgYWxpYXNlcy5cblx0ICogRm9yIGV4YW1wbGUsIHVzaW5nIGAvLS9nYCB3b3VsZCBtZWFuIHRoYXQgYWxpYXNlcyBjb250YWluaW5nIGAtYCB3b3VsZCBiZSB2YWxpZCB3aXRoIGFuZCB3aXRob3V0IGl0LlxuXHQgKiBTbywgdGhlIGFsaWFzIGBjb21tYW5kLW5hbWVgIGlzIHZhbGlkIGFzIGJvdGggYGNvbW1hbmQtbmFtZWAgYW5kIGBjb21tYW5kbmFtZWAuXG5cdCAqL1xuXHRhbGlhc1JlcGxhY2VtZW50PzogUmVnRXhwO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhbGxvdyBtZW50aW9ucyB0byB0aGUgY2xpZW50IHVzZXIgYXMgYSBwcmVmaXguXG5cdCAqL1xuXHRhbGxvd01lbnRpb24/OiBib29sZWFuIHwgTWVudGlvblByZWZpeFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogRGVmYXVsdCBhcmd1bWVudCBvcHRpb25zLlxuXHQgKi9cblx0YXJndW1lbnREZWZhdWx0cz86IERlZmF1bHRBcmd1bWVudE9wdGlvbnM7XG5cblx0LyoqXG5cdCAqIEF1dG9tYXRpY2FsbHkgZGVmZXIgbWVzc2FnZXMgXCJCb3ROYW1lIGlzIHRoaW5raW5nXCJcblx0ICovXG5cdGF1dG9EZWZlcj86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNwZWNpZnkgd2hldGhlciB0byByZWdpc3RlciBhbGwgc2xhc2ggY29tbWFuZHMgd2hlbiBzdGFydGluZyB0aGUgY2xpZW50LlxuXHQgKi9cblx0YXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGJsb2NrIGJvdHMuXG5cdCAqL1xuXHRibG9ja0JvdHM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBzZWxmLlxuXHQgKi9cblx0YmxvY2tDbGllbnQ/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhc3NpZ24gYG1lc3NhZ2UudXRpbGAuXG5cdCAqL1xuXHRjb21tYW5kVXRpbD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIE1pbGxpc2Vjb25kcyBhIG1lc3NhZ2Ugc2hvdWxkIGV4aXN0IGZvciBiZWZvcmUgaXRzIGNvbW1hbmQgdXRpbCBpbnN0YW5jZSBpcyBtYXJrZWQgZm9yIHJlbW92YWwuXG5cdCAqIElmIDAsIENvbW1hbmRVdGlsIGluc3RhbmNlcyB3aWxsIG5ldmVyIGJlIHJlbW92ZWQgYW5kIHdpbGwgY2F1c2UgbWVtb3J5IHRvIGluY3JlYXNlIGluZGVmaW5pdGVseS5cblx0ICovXG5cdGNvbW1hbmRVdGlsTGlmZXRpbWU/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRpbWUgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzIGZvciBzd2VlcGluZyBjb21tYW5kIHV0aWwgaW5zdGFuY2VzLlxuXHQgKiBJZiAwLCBDb21tYW5kVXRpbCBpbnN0YW5jZXMgd2lsbCBuZXZlciBiZSByZW1vdmVkIGFuZCB3aWxsIGNhdXNlIG1lbW9yeSB0byBpbmNyZWFzZSBpbmRlZmluaXRlbHkuXG5cdCAqL1xuXHRjb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWw/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgY29vbGRvd24gZm9yIGNvbW1hbmRzLlxuXHQgKi9cblx0ZGVmYXVsdENvb2xkb3duPzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBtZW1iZXJzIGFyZSBmZXRjaGVkIG9uIGVhY2ggbWVzc2FnZSBhdXRob3IgZnJvbSBhIGd1aWxkLlxuXHQgKi9cblx0ZmV0Y2hNZW1iZXJzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gaGFuZGxlIGVkaXRlZCBtZXNzYWdlcyB1c2luZyBDb21tYW5kVXRpbC5cblx0ICovXG5cdGhhbmRsZUVkaXRzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgY29vbGRvd24gb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuIERlZmF1bHRzIHRvIHRoZSBjbGllbnQgb3duZXIocykuXG5cdCAqL1xuXHRpZ25vcmVDb29sZG93bj86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGB1c2VyUGVybWlzc2lvbnNgIGNoZWNrcyBvciBhIGZ1bmN0aW9uIHRvIGlnbm9yZS5cblx0ICovXG5cdGlnbm9yZVBlcm1pc3Npb25zPzogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gfCBJZ25vcmVDaGVja1ByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogVGhlIHByZWZpeChlcykgZm9yIGNvbW1hbmQgcGFyc2luZy5cblx0ICovXG5cdHByZWZpeD86IHN0cmluZyB8IHN0cmluZ1tdIHwgUHJlZml4U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHN0b3JlIG1lc3NhZ2VzIGluIENvbW1hbmRVdGlsLlxuXHQgKi9cblx0c3RvcmVNZXNzYWdlcz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNob3cgXCJCb3ROYW1lIGlzIHR5cGluZ1wiIGluZm9ybWF0aW9uIG1lc3NhZ2Ugb24gdGhlIHRleHQgY2hhbm5lbHMgd2hlbiBhIGNvbW1hbmQgaXMgcnVubmluZy5cblx0ICovXG5cdHR5cGluZz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHVzZSBleGVjU2xhc2ggZm9yIHNsYXNoIGNvbW1hbmRzLlxuXHQgKi9cblx0ZXhlY1NsYXNoPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc2tpcCBidWlsdCBpbiByZWFzb25zIHBvc3QgdHlwZSBpbmhpYml0b3JzIHNvIHlvdSBjYW4gbWFrZSBjdXN0b20gb25lcy5cblx0ICovXG5cdHNraXBCdWlsdEluUG9zdEluaGliaXRvcnM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBVc2Ugc2xhc2ggY29tbWFuZCBwZXJtaXNzaW9ucyBmb3Igb3duZXIgb25seSBjb21tYW5kc1xuXHQgKiBXYXJuaW5nOiB0aGlzIGlzIGV4cGVyaW1lbnRhbFxuXHQgKi9cblx0dXNlU2xhc2hQZXJtaXNzaW9ucz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGF0YSBmb3IgbWFuYWdpbmcgY29vbGRvd25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvb2xkb3duRGF0YSB7XG5cdC8qKlxuXHQgKiBXaGVuIHRoZSBjb29sZG93biBlbmRzLlxuXHQgKi9cblx0ZW5kOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRpbWVvdXQgb2JqZWN0LlxuXHQgKi9cblx0dGltZXI6IE5vZGVKUy5UaW1lcjtcblxuXHQvKipcblx0ICogTnVtYmVyIG9mIHRpbWVzIHRoZSBjb21tYW5kIGhhcyBiZWVuIHVzZWQuXG5cdCAqL1xuXHR1c2VzOiBudW1iZXI7XG59XG5cbi8qKlxuICogVmFyaW91cyBwYXJzZWQgY29tcG9uZW50cyBvZiB0aGUgbWVzc2FnZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRDb21wb25lbnREYXRhIHtcblx0LyoqXG5cdCAqIFRoZSBjb250ZW50IHRvIHRoZSByaWdodCBvZiB0aGUgcHJlZml4LlxuXHQgKi9cblx0YWZ0ZXJQcmVmaXg/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBhbGlhcyB1c2VkLlxuXHQgKi9cblx0YWxpYXM/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIHVzZWQuXG5cdCAqL1xuXHRjb21tYW5kPzogQ29tbWFuZDtcblxuXHQvKipcblx0ICogVGhlIGNvbnRlbnQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBhbGlhcy5cblx0ICovXG5cdGNvbnRlbnQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBwcmVmaXggdXNlZC5cblx0ICovXG5cdHByZWZpeD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB3aGV0aGVyIHRoaXMgbWVzc2FnZSBzaG91bGQgYmUgaWdub3JlZCBmb3IgYSBjZXJ0YWluIGNoZWNrLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGNoZWNrLlxuICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGNoZWNrLlxuICovXG5leHBvcnQgdHlwZSBJZ25vcmVDaGVja1ByZWRpY2F0ZSA9IChtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSwgY29tbWFuZDogQ29tbWFuZCkgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB3aGV0aGVyIG1lbnRpb25zIGNhbiBiZSB1c2VkIGFzIGEgcHJlZml4LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIG9wdGlvbiBmb3IuXG4gKi9cbmV4cG9ydCB0eXBlIE1lbnRpb25QcmVmaXhQcmVkaWNhdGUgPSAobWVzc2FnZTogTWVzc2FnZSkgPT4gYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj47XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHByZWZpeChlcykgdG8gdXNlLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGdldCBwcmVmaXggZm9yLlxuICovXG5leHBvcnQgdHlwZSBQcmVmaXhTdXBwbGllciA9IChtZXNzYWdlOiBNZXNzYWdlKSA9PiBzdHJpbmcgfCBzdHJpbmdbXSB8IFByb21pc2U8c3RyaW5nIHwgc3RyaW5nW10+O1xuIl19