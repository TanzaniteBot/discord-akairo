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
    /**
     * Set up the command handler
     */
    setup() {
        this.client.once("ready", () => {
            if (this.autoRegisterSlashCommands)
                this.registerInteractionCommands().then(() => this.updateInteractionPermissions(this.client.ownerID /*  this.client.superUserID */));
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
                    defaultPermission: !(data.ownerOnly || /* data.superUserOnly || */ false),
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
        const globalCommands = (await this.client.application?.commands.fetch()).filter(value => !!this.modules.find(mod => mod.aliases[0] === value.name));
        const fullPermissions = globalCommands
            .filter(value => !value.defaultPermission)
            .filter(value => !!this.modules.find(mod => mod.aliases[0] === value.name))
            .map(value => mapCom(value));
        const promises = this.client.guilds.cache.map(async (guild) => {
            const perms = new Array(...fullPermissions);
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
            if (interaction.options["_group"])
                convertedOptions["subcommandGroup"] = interaction.options["_group"];
            if (interaction.options["_subcommand"])
                convertedOptions["subcommand"] = interaction.options["_subcommand"];
            for (const option of interaction.options["_hoistedOptions"]) {
                if (["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(option.type))
                    continue;
                convertedOptions[option.name] = interaction.options[lodash_1.default.camelCase(`GET_${option.type}`)](option.name, false);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBWW9CO0FBRXBCLG9EQUF1QjtBQUV2Qix5RUFBaUQ7QUFDakQsNkVBQXFEO0FBRXJELG9EQUE0RTtBQUM1RSwyREFBbUM7QUFFbkMscUVBQXNGO0FBRXRGLGlIQUF5RjtBQUl6Riw0RUFBb0Q7QUFDcEQsd0RBQWlEO0FBQ2pELGdFQUF3QztBQUN4QyxrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLGNBQWUsU0FBUSx1QkFBYTtJQUN4RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxpQkFBTyxFQUN2QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEVBQ1YsV0FBVyxHQUFHLElBQUksRUFDbEIsU0FBUyxHQUFHLElBQUksRUFDaEIsWUFBWSxHQUFHLEtBQUssRUFDcEIsV0FBVyxHQUFHLEtBQUssRUFDbkIsYUFBYSxHQUFHLEtBQUssRUFDckIsV0FBVyxFQUNYLG1CQUFtQixHQUFHLEdBQUcsRUFDekIsd0JBQXdCLEdBQUcsR0FBRyxFQUM5QixlQUFlLEdBQUcsQ0FBQyxFQUNuQixjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFDL0IsaUJBQWlCLEdBQUcsRUFBRSxFQUN0QixnQkFBZ0IsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxHQUFHLEVBQ1osWUFBWSxHQUFHLElBQUksRUFDbkIsZ0JBQWdCLEVBQ2hCLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLEVBQ2QseUJBQXlCLEdBQUcsS0FBSyxFQUNqQyxTQUFTLEdBQUcsS0FBSyxFQUNqQix5QkFBeUIsR0FBRyxLQUFLLEtBQ1AsRUFBRTtRQUU3QixJ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QyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDRDtBQWg2Q0QsaUNBZzZDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEFwcGxpY2F0aW9uQ29tbWFuZCxcblx0QXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YSxcblx0QXdhaXRlZCxcblx0Q29sbGVjdGlvbixcblx0Q29tbWFuZEludGVyYWN0aW9uLFxuXHRHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25EYXRhLFxuXHRHdWlsZFJlc29sdmFibGUsXG5cdE1lc3NhZ2UsXG5cdFNub3dmbGFrZSxcblx0VGV4dEJhc2VkQ2hhbm5lbHMsXG5cdFVzZXJcbn0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGVzIH0gZnJvbSBcImRpc2NvcmQuanMvdHlwaW5ncy9lbnVtc1wiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgQ29tbWFuZEhhbmRsZXJFdmVudHMgYXMgQ29tbWFuZEhhbmRsZXJFdmVudHNUeXBlIH0gZnJvbSBcIi4uLy4uL3R5cGluZ3MvZXZlbnRzXCI7XG5pbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBBa2Fpcm9NZXNzYWdlIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb01lc3NhZ2VcIjtcbmltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IHsgQnVpbHRJblJlYXNvbnMsIENvbW1hbmRIYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgVXRpbCBmcm9tIFwiLi4vLi4vdXRpbC9VdGlsXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7IEFrYWlyb0hhbmRsZXJPcHRpb25zLCBMb2FkUHJlZGljYXRlIH0gZnJvbSBcIi4uL0FrYWlyb0hhbmRsZXJcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUgZnJvbSBcIi4uL0FrYWlyb01vZHVsZVwiO1xuaW1wb3J0IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXIgZnJvbSBcIi4uL2NvbnRleHRNZW51Q29tbWFuZHMvQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlclwiO1xuaW1wb3J0IEluaGliaXRvckhhbmRsZXIgZnJvbSBcIi4uL2luaGliaXRvcnMvSW5oaWJpdG9ySGFuZGxlclwiO1xuaW1wb3J0IExpc3RlbmVySGFuZGxlciBmcm9tIFwiLi4vbGlzdGVuZXJzL0xpc3RlbmVySGFuZGxlclwiO1xuaW1wb3J0IHsgRGVmYXVsdEFyZ3VtZW50T3B0aW9ucyB9IGZyb20gXCIuL2FyZ3VtZW50cy9Bcmd1bWVudFwiO1xuaW1wb3J0IFR5cGVSZXNvbHZlciBmcm9tIFwiLi9hcmd1bWVudHMvVHlwZVJlc29sdmVyXCI7XG5pbXBvcnQgQ29tbWFuZCwgeyBLZXlTdXBwbGllciB9IGZyb20gXCIuL0NvbW1hbmRcIjtcbmltcG9ydCBDb21tYW5kVXRpbCBmcm9tIFwiLi9Db21tYW5kVXRpbFwiO1xuaW1wb3J0IEZsYWcgZnJvbSBcIi4vRmxhZ1wiO1xuXG4vKipcbiAqIExvYWRzIGNvbW1hbmRzIGFuZCBoYW5kbGVzIG1lc3NhZ2VzLlxuICogQHBhcmFtIGNsaWVudCAtIFRoZSBBa2Fpcm8gY2xpZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kSGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQ29tbWFuZCxcblx0XHRcdGV4dGVuc2lvbnMgPSBbXCIuanNcIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyLFxuXHRcdFx0YmxvY2tDbGllbnQgPSB0cnVlLFxuXHRcdFx0YmxvY2tCb3RzID0gdHJ1ZSxcblx0XHRcdGZldGNoTWVtYmVycyA9IGZhbHNlLFxuXHRcdFx0aGFuZGxlRWRpdHMgPSBmYWxzZSxcblx0XHRcdHN0b3JlTWVzc2FnZXMgPSBmYWxzZSxcblx0XHRcdGNvbW1hbmRVdGlsLFxuXHRcdFx0Y29tbWFuZFV0aWxMaWZldGltZSA9IDNlNSxcblx0XHRcdGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA9IDNlNSxcblx0XHRcdGRlZmF1bHRDb29sZG93biA9IDAsXG5cdFx0XHRpZ25vcmVDb29sZG93biA9IGNsaWVudC5vd25lcklELFxuXHRcdFx0aWdub3JlUGVybWlzc2lvbnMgPSBbXSxcblx0XHRcdGFyZ3VtZW50RGVmYXVsdHMgPSB7fSxcblx0XHRcdHByZWZpeCA9IFwiIVwiLFxuXHRcdFx0YWxsb3dNZW50aW9uID0gdHJ1ZSxcblx0XHRcdGFsaWFzUmVwbGFjZW1lbnQsXG5cdFx0XHRhdXRvRGVmZXIgPSBmYWxzZSxcblx0XHRcdHR5cGluZyA9IGZhbHNlLFxuXHRcdFx0YXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcyA9IGZhbHNlLFxuXHRcdFx0ZXhlY1NsYXNoID0gZmFsc2UsXG5cdFx0XHRza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzID0gZmFsc2Vcblx0XHR9OiBDb21tYW5kSGFuZGxlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHRpZiAoIShjbGFzc1RvSGFuZGxlLnByb3RvdHlwZSBpbnN0YW5jZW9mIENvbW1hbmQgfHwgY2xhc3NUb0hhbmRsZSA9PT0gQ29tbWFuZCkpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsIGNsYXNzVG9IYW5kbGUubmFtZSwgQ29tbWFuZC5uYW1lKTtcblx0XHR9XG5cblx0XHRzdXBlcihjbGllbnQsIHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUsXG5cdFx0XHRleHRlbnNpb25zLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzID0gYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcztcblxuXHRcdHRoaXMudHlwaW5nID0gdHlwaW5nO1xuXG5cdFx0dGhpcy5hdXRvRGVmZXIgPSBhdXRvRGVmZXI7XG5cblx0XHR0aGlzLnJlc29sdmVyID0gbmV3IFR5cGVSZXNvbHZlcih0aGlzKTtcblxuXHRcdHRoaXMuYWxpYXNlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmFsaWFzUmVwbGFjZW1lbnQgPSBhbGlhc1JlcGxhY2VtZW50O1xuXG5cdFx0dGhpcy5wcmVmaXhlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmJsb2NrQ2xpZW50ID0gISFibG9ja0NsaWVudDtcblxuXHRcdHRoaXMuYmxvY2tCb3RzID0gISFibG9ja0JvdHM7XG5cblx0XHR0aGlzLmZldGNoTWVtYmVycyA9ICEhZmV0Y2hNZW1iZXJzO1xuXG5cdFx0dGhpcy5oYW5kbGVFZGl0cyA9ICEhaGFuZGxlRWRpdHM7XG5cblx0XHR0aGlzLnN0b3JlTWVzc2FnZXMgPSAhIXN0b3JlTWVzc2FnZXM7XG5cblx0XHR0aGlzLmNvbW1hbmRVdGlsID0gISFjb21tYW5kVXRpbDtcblx0XHRpZiAoKHRoaXMuaGFuZGxlRWRpdHMgfHwgdGhpcy5zdG9yZU1lc3NhZ2VzKSAmJiAhdGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiQ09NTUFORF9VVElMX0VYUExJQ0lUXCIpO1xuXHRcdH1cblxuXHRcdHRoaXMuY29tbWFuZFV0aWxMaWZldGltZSA9IGNvbW1hbmRVdGlsTGlmZXRpbWU7XG5cblx0XHR0aGlzLmNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA9IGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbDtcblx0XHRpZiAodGhpcy5jb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWwgPiAwKSB7XG5cdFx0XHRzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLnN3ZWVwQ29tbWFuZFV0aWwoKSwgdGhpcy5jb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWwpLnVucmVmKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb21tYW5kVXRpbHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5jb29sZG93bnMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5kZWZhdWx0Q29vbGRvd24gPSBkZWZhdWx0Q29vbGRvd247XG5cblx0XHR0aGlzLmlnbm9yZUNvb2xkb3duID0gdHlwZW9mIGlnbm9yZUNvb2xkb3duID09PSBcImZ1bmN0aW9uXCIgPyBpZ25vcmVDb29sZG93bi5iaW5kKHRoaXMpIDogaWdub3JlQ29vbGRvd247XG5cblx0XHR0aGlzLmlnbm9yZVBlcm1pc3Npb25zID0gdHlwZW9mIGlnbm9yZVBlcm1pc3Npb25zID09PSBcImZ1bmN0aW9uXCIgPyBpZ25vcmVQZXJtaXNzaW9ucy5iaW5kKHRoaXMpIDogaWdub3JlUGVybWlzc2lvbnM7XG5cblx0XHR0aGlzLnByb21wdHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5hcmd1bWVudERlZmF1bHRzID0gVXRpbC5kZWVwQXNzaWduKFxuXHRcdFx0e1xuXHRcdFx0XHRwcm9tcHQ6IHtcblx0XHRcdFx0XHRzdGFydDogXCJcIixcblx0XHRcdFx0XHRyZXRyeTogXCJcIixcblx0XHRcdFx0XHR0aW1lb3V0OiBcIlwiLFxuXHRcdFx0XHRcdGVuZGVkOiBcIlwiLFxuXHRcdFx0XHRcdGNhbmNlbDogXCJcIixcblx0XHRcdFx0XHRyZXRyaWVzOiAxLFxuXHRcdFx0XHRcdHRpbWU6IDMwMDAwLFxuXHRcdFx0XHRcdGNhbmNlbFdvcmQ6IFwiY2FuY2VsXCIsXG5cdFx0XHRcdFx0c3RvcFdvcmQ6IFwic3RvcFwiLFxuXHRcdFx0XHRcdG9wdGlvbmFsOiBmYWxzZSxcblx0XHRcdFx0XHRpbmZpbml0ZTogZmFsc2UsXG5cdFx0XHRcdFx0bGltaXQ6IEluZmluaXR5LFxuXHRcdFx0XHRcdGJyZWFrb3V0OiB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRhcmd1bWVudERlZmF1bHRzXG5cdFx0KTtcblxuXHRcdHRoaXMucHJlZml4ID0gdHlwZW9mIHByZWZpeCA9PT0gXCJmdW5jdGlvblwiID8gcHJlZml4LmJpbmQodGhpcykgOiBwcmVmaXg7XG5cblx0XHR0aGlzLmFsbG93TWVudGlvbiA9IHR5cGVvZiBhbGxvd01lbnRpb24gPT09IFwiZnVuY3Rpb25cIiA/IGFsbG93TWVudGlvbi5iaW5kKHRoaXMpIDogISFhbGxvd01lbnRpb247XG5cblx0XHR0aGlzLmluaGliaXRvckhhbmRsZXIgPSBudWxsO1xuXG5cdFx0dGhpcy5hdXRvRGVmZXIgPSAhIWF1dG9EZWZlcjtcblxuXHRcdHRoaXMuZXhlY1NsYXNoID0gISFleGVjU2xhc2g7XG5cblx0XHR0aGlzLnNraXBCdWlsdEluUG9zdEluaGliaXRvcnMgPSAhIXNraXBCdWlsdEluUG9zdEluaGliaXRvcnM7XG5cblx0XHR0aGlzLnNldHVwKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBjb21tYW5kIGFsaWFzZXMuXG5cdCAqL1xuXHRwdWJsaWMgYWxpYXNlczogQ29sbGVjdGlvbjxzdHJpbmcsIHN0cmluZz47XG5cblx0LyoqXG5cdCAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBhdXRvbWF0aWNhbGx5IG1ha2UgY29tbWFuZCBhbGlhc2VzIGZvci5cblx0ICovXG5cdHB1YmxpYyBhbGlhc1JlcGxhY2VtZW50PzogUmVnRXhwO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBtZW50aW9ucyBhcmUgYWxsb3dlZCBmb3IgcHJlZml4aW5nLlxuXHQgKi9cblx0cHVibGljIGFsbG93TWVudGlvbjogYm9vbGVhbiB8IE1lbnRpb25QcmVmaXhQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgYXJndW1lbnQgb3B0aW9ucy5cblx0ICovXG5cdHB1YmxpYyBhcmd1bWVudERlZmF1bHRzOiBEZWZhdWx0QXJndW1lbnRPcHRpb25zO1xuXG5cdC8qKlxuXHQgKiBBdXRvbWF0aWNhbGx5IGRlZmVyIG1lc3NhZ2VzIFwiQm90TmFtZSBpcyB0aGlua2luZ1wiLlxuXHQgKi9cblx0cHVibGljIGF1dG9EZWZlcjogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU3BlY2lmeSB3aGV0aGVyIHRvIHJlZ2lzdGVyIGFsbCBzbGFzaCBjb21tYW5kcyB3aGVuIHN0YXJ0aW5nIHRoZSBjbGllbnRcblx0ICovXG5cdHB1YmxpYyBhdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBib3RzLlxuXHQgKi9cblx0cHVibGljIGJsb2NrQm90czogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYmxvY2sgc2VsZi5cblx0ICovXG5cdHB1YmxpYyBibG9ja0NsaWVudDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgQ29tbWFuZD4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGVcblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBDb21tYW5kO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBgbWVzc2FnZS51dGlsYCBpcyBhc3NpZ25lZC5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogTWlsbGlzZWNvbmRzIGEgbWVzc2FnZSBzaG91bGQgZXhpc3QgZm9yIGJlZm9yZSBpdHMgY29tbWFuZCB1dGlsIGluc3RhbmNlIGlzIG1hcmtlZCBmb3IgcmVtb3ZhbC5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbExpZmV0aW1lOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgQ29tbWFuZFV0aWxzLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmRVdGlsczogQ29sbGVjdGlvbjxzdHJpbmcsIENvbW1hbmRVdGlsPjtcblxuXHQvKipcblx0ICogVGltZSBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMgZm9yIHN3ZWVwaW5nIGNvbW1hbmQgdXRpbCBpbnN0YW5jZXMuXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZFV0aWxTd2VlcEludGVydmFsOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgY29vbGRvd25zLlxuXHQgKiA8aW5mbz5UaGUgZWxlbWVudHMgaW4gdGhlIGNvbGxlY3Rpb24gYXJlIG9iamVjdHMgd2l0aCB1c2VyIElEcyBhcyBrZXlzXG5cdCAqIGFuZCB7QGxpbmsgQ29vbGRvd25EYXRhfSBvYmplY3RzIGFzIHZhbHVlczwvaW5mbz5cblx0ICovXG5cdHB1YmxpYyBjb29sZG93bnM6IENvbGxlY3Rpb248c3RyaW5nLCB7IFtpZDogc3RyaW5nXTogQ29vbGRvd25EYXRhIH0+O1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IGNvb2xkb3duIGZvciBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBkZWZhdWx0Q29vbGRvd246IG51bWJlcjtcblxuXHQvKipcblx0ICogRGlyZWN0b3J5IHRvIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHVzZSBleGVjU2xhc2ggZm9yIHNsYXNoIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGV4ZWNTbGFzaDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgbWVtYmVycyBhcmUgZmV0Y2hlZCBvbiBlYWNoIG1lc3NhZ2UgYXV0aG9yIGZyb20gYSBndWlsZC5cblx0ICovXG5cdHB1YmxpYyBmZXRjaE1lbWJlcnM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IGVkaXRzIGFyZSBoYW5kbGVkLlxuXHQgKi9cblx0cHVibGljIGhhbmRsZUVkaXRzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBjb29sZG93biBvciBhIGZ1bmN0aW9uIHRvIGlnbm9yZS5cblx0ICovXG5cdHB1YmxpYyBpZ25vcmVDb29sZG93bjogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gfCBJZ25vcmVDaGVja1ByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgYHVzZXJQZXJtaXNzaW9uc2AgY2hlY2tzIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLlxuXHQgKi9cblx0cHVibGljIGlnbm9yZVBlcm1pc3Npb25zOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBJbmhpYml0b3IgaGFuZGxlciB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgaW5oaWJpdG9ySGFuZGxlcj86IEluaGliaXRvckhhbmRsZXI7XG5cblx0LyoqXG5cdCAqIENvbW1hbmRzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIENvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ29tbWFuZD47XG5cblx0LyoqXG5cdCAqIFRoZSBwcmVmaXgoZXMpIGZvciBjb21tYW5kIHBhcnNpbmcuXG5cdCAqL1xuXHRwdWJsaWMgcHJlZml4OiBzdHJpbmcgfCBzdHJpbmdbXSB8IFByZWZpeFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBDb2xsZWN0aW9uIG9mIHByZWZpeCBvdmVyd3JpdGVzIHRvIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIHByZWZpeGVzOiBDb2xsZWN0aW9uPHN0cmluZyB8IFByZWZpeFN1cHBsaWVyLCBTZXQ8c3RyaW5nPj47XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2Ygc2V0cyBvZiBvbmdvaW5nIGFyZ3VtZW50IHByb21wdHMuXG5cdCAqL1xuXHRwdWJsaWMgcHJvbXB0czogQ29sbGVjdGlvbjxzdHJpbmcsIFNldDxzdHJpbmc+PjtcblxuXHQvKipcblx0ICogVGhlIHR5cGUgcmVzb2x2ZXIuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZXI6IFR5cGVSZXNvbHZlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc3RvcmUgbWVzc2FnZXMgaW4gQ29tbWFuZFV0aWwuXG5cdCAqL1xuXHRwdWJsaWMgc3RvcmVNZXNzYWdlczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU2hvdyBcIkJvdE5hbWUgaXMgdHlwaW5nXCIgaW5mb3JtYXRpb24gbWVzc2FnZSBvbiB0aGUgdGV4dCBjaGFubmVscyB3aGVuIGEgY29tbWFuZCBpcyBydW5uaW5nLlxuXHQgKi9cblx0cHVibGljIHR5cGluZzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc2tpcCBidWlsdCBpbiByZWFzb25zIHBvc3QgdHlwZSBpbmhpYml0b3JzIHNvIHlvdSBjYW4gbWFrZSBjdXN0b20gb25lcy5cblx0ICovXG5cdHB1YmxpYyBza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU2V0IHVwIHRoZSBjb21tYW5kIGhhbmRsZXJcblx0ICovXG5cdHByb3RlY3RlZCBzZXR1cCgpIHtcblx0XHR0aGlzLmNsaWVudC5vbmNlKFwicmVhZHlcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcylcblx0XHRcdFx0dGhpcy5yZWdpc3RlckludGVyYWN0aW9uQ29tbWFuZHMoKS50aGVuKCgpID0+XG5cdFx0XHRcdFx0dGhpcy51cGRhdGVJbnRlcmFjdGlvblBlcm1pc3Npb25zKHRoaXMuY2xpZW50Lm93bmVySUQgLyogIHRoaXMuY2xpZW50LnN1cGVyVXNlcklEICovKVxuXHRcdFx0XHQpO1xuXG5cdFx0XHR0aGlzLmNsaWVudC5vbihcIm1lc3NhZ2VDcmVhdGVcIiwgYXN5bmMgbSA9PiB7XG5cdFx0XHRcdGlmIChtLnBhcnRpYWwpIGF3YWl0IG0uZmV0Y2goKTtcblxuXHRcdFx0XHR0aGlzLmhhbmRsZShtKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFZGl0cykge1xuXHRcdFx0XHR0aGlzLmNsaWVudC5vbihcIm1lc3NhZ2VVcGRhdGVcIiwgYXN5bmMgKG8sIG0pID0+IHtcblx0XHRcdFx0XHRpZiAoby5wYXJ0aWFsKSBhd2FpdCBvLmZldGNoKCk7XG5cdFx0XHRcdFx0aWYgKG0ucGFydGlhbCkgYXdhaXQgbS5mZXRjaCgpO1xuXHRcdFx0XHRcdGlmIChvLmNvbnRlbnQgPT09IG0uY29udGVudCkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRWRpdHMpIHRoaXMuaGFuZGxlKG0gYXMgTWVzc2FnZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5jbGllbnQub24oXCJpbnRlcmFjdGlvbkNyZWF0ZVwiLCBpID0+IHtcblx0XHRcdFx0aWYgKCFpLmlzQ29tbWFuZCgpKSByZXR1cm47XG5cdFx0XHRcdHRoaXMuaGFuZGxlU2xhc2goaSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgaW50ZXJhY3Rpb24gY29tbWFuZHMuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgYXN5bmMgcmVnaXN0ZXJJbnRlcmFjdGlvbkNvbW1hbmRzKCkge1xuXHRcdGNvbnN0IHBhcnNlZFNsYXNoQ29tbWFuZHM6IHtcblx0XHRcdG5hbWU6IHN0cmluZztcblx0XHRcdGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuXHRcdFx0b3B0aW9ucz86IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkRhdGFbXTtcblx0XHRcdGd1aWxkczogU25vd2ZsYWtlW107XG5cdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogYm9vbGVhbjtcblx0XHRcdHR5cGU6IFwiQ0hBVF9JTlBVVFwiIHwgXCJNRVNTQUdFXCIgfCBcIlVTRVJcIjtcblx0XHR9W10gPSBbXTtcblx0XHRjb25zdCBndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQ6IENvbGxlY3Rpb248XG5cdFx0XHRTbm93Zmxha2UsXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IHN0cmluZztcblx0XHRcdFx0ZGVzY3JpcHRpb246IHN0cmluZztcblx0XHRcdFx0b3B0aW9uczogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YVtdO1xuXHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogYm9vbGVhbjtcblx0XHRcdFx0dHlwZTogXCJDSEFUX0lOUFVUXCIgfCBcIk1FU1NBR0VcIiB8IFwiVVNFUlwiO1xuXHRcdFx0fVtdXG5cdFx0PiA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdFx0Y29uc3QgcGFyc2VEZXNjcmlwdGlvbkNvbW1hbmQgPSBkZXNjcmlwdGlvbiA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIGRlc2NyaXB0aW9uID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZGVzY3JpcHRpb24uY29udGVudCA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gZGVzY3JpcHRpb24uY29udGVudCgpO1xuXHRcdFx0XHRpZiAodHlwZW9mIGRlc2NyaXB0aW9uLmNvbnRlbnQgPT09IFwic3RyaW5nXCIpIHJldHVybiBkZXNjcmlwdGlvbi5jb250ZW50O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRlc2NyaXB0aW9uO1xuXHRcdH07XG5cblx0XHRmb3IgKGNvbnN0IFssIGRhdGFdIG9mIHRoaXMubW9kdWxlcykge1xuXHRcdFx0aWYgKCFkYXRhLnNsYXNoKSBjb250aW51ZTtcblx0XHRcdHBhcnNlZFNsYXNoQ29tbWFuZHMucHVzaCh7XG5cdFx0XHRcdG5hbWU6IGRhdGEuYWxpYXNlc1swXSxcblx0XHRcdFx0ZGVzY3JpcHRpb246IHBhcnNlRGVzY3JpcHRpb25Db21tYW5kKGRhdGEuZGVzY3JpcHRpb24pLFxuXHRcdFx0XHRvcHRpb25zOiBkYXRhLnNsYXNoT3B0aW9ucyxcblx0XHRcdFx0Z3VpbGRzOiBkYXRhLnNsYXNoR3VpbGRzID8/IFtdLFxuXHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogIShkYXRhLm93bmVyT25seSB8fCAvKiBkYXRhLnN1cGVyVXNlck9ubHkgfHwgKi8gZmFsc2UpLFxuXHRcdFx0XHR0eXBlOiBcIkNIQVRfSU5QVVRcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0bGV0IGNvbnRleHRDb21tYW5kSGFuZGxlcjogQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciB8IHVuZGVmaW5lZDtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmNsaWVudCkge1xuXHRcdFx0aWYgKHRoaXMuY2xpZW50W2tleV0gaW5zdGFuY2VvZiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyKSB7XG5cdFx0XHRcdGNvbnRleHRDb21tYW5kSGFuZGxlciA9IHRoaXMuY2xpZW50W2tleV07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoY29udGV4dENvbW1hbmRIYW5kbGVyKSB7XG5cdFx0XHRmb3IgKGNvbnN0IFssIGRhdGFdIG9mIGNvbnRleHRDb21tYW5kSGFuZGxlci5tb2R1bGVzKSB7XG5cdFx0XHRcdHBhcnNlZFNsYXNoQ29tbWFuZHMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogZGF0YS5uYW1lLFxuXHRcdFx0XHRcdGd1aWxkczogZGF0YS5ndWlsZHMgPz8gW10sXG5cdFx0XHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246ICEoZGF0YS5vd25lck9ubHkgfHwgLyogZGF0YS5zdXBlclVzZXJPbmx5IHx8ICovIGZhbHNlKSxcblx0XHRcdFx0XHR0eXBlOiBkYXRhLnR5cGVcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyogR2xvYmFsICovXG5cdFx0Y29uc3Qgc2xhc2hDb21tYW5kc0FwcCA9IHBhcnNlZFNsYXNoQ29tbWFuZHNcblx0XHRcdC5maWx0ZXIoKHsgZ3VpbGRzIH0pID0+ICFndWlsZHMubGVuZ3RoKVxuXHRcdFx0Lm1hcCgoeyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZGVmYXVsdFBlcm1pc3Npb24sIHR5cGUgfSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4geyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZGVmYXVsdFBlcm1pc3Npb24sIHR5cGUgfTtcblx0XHRcdH0pO1xuXHRcdGNvbnN0IGN1cnJlbnRHbG9iYWxDb21tYW5kcyA9IChhd2FpdCB0aGlzLmNsaWVudC5hcHBsaWNhdGlvbj8uY29tbWFuZHMuZmV0Y2goKSkubWFwKHZhbHVlMSA9PiAoe1xuXHRcdFx0bmFtZTogdmFsdWUxLm5hbWUsXG5cdFx0XHRkZXNjcmlwdGlvbjogdmFsdWUxLmRlc2NyaXB0aW9uLFxuXHRcdFx0b3B0aW9uczogdmFsdWUxLm9wdGlvbnMsXG5cdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogdmFsdWUxLmRlZmF1bHRQZXJtaXNzaW9uLFxuXHRcdFx0dHlwZTogdmFsdWUxLnR5cGVcblx0XHR9KSk7XG5cblx0XHRpZiAoIV8uaXNFcXVhbChjdXJyZW50R2xvYmFsQ29tbWFuZHMsIHNsYXNoQ29tbWFuZHNBcHApKSB7XG5cdFx0XHRhd2FpdCB0aGlzLmNsaWVudC5hcHBsaWNhdGlvbj8uY29tbWFuZHMuc2V0KHNsYXNoQ29tbWFuZHNBcHApO1xuXHRcdH1cblxuXHRcdC8qIEd1aWxkcyAqL1xuXHRcdGZvciAoY29uc3QgeyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZ3VpbGRzLCBkZWZhdWx0UGVybWlzc2lvbiwgdHlwZSB9IG9mIHBhcnNlZFNsYXNoQ29tbWFuZHMpIHtcblx0XHRcdGZvciAoY29uc3QgZ3VpbGRJZCBvZiBndWlsZHMpIHtcblx0XHRcdFx0Z3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkLnNldChndWlsZElkLCBbXG5cdFx0XHRcdFx0Li4uKGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZC5nZXQoZ3VpbGRJZCkgPz8gW10pLFxuXHRcdFx0XHRcdHsgbmFtZSwgZGVzY3JpcHRpb24sIG9wdGlvbnMsIGRlZmF1bHRQZXJtaXNzaW9uLCB0eXBlIH1cblx0XHRcdFx0XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQuc2l6ZSkge1xuXHRcdFx0Z3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkLmVhY2goYXN5bmMgKHZhbHVlLCBrZXkpID0+IHtcblx0XHRcdFx0Y29uc3QgZ3VpbGQgPSB0aGlzLmNsaWVudC5ndWlsZHMuY2FjaGUuZ2V0KGtleSk7XG5cdFx0XHRcdGlmICghZ3VpbGQpIHJldHVybjtcblxuXHRcdFx0XHRjb25zdCBjdXJyZW50R3VpbGRDb21tYW5kcyA9IChhd2FpdCBndWlsZC5jb21tYW5kcy5mZXRjaCgpKS5tYXAodmFsdWUxID0+ICh7XG5cdFx0XHRcdFx0bmFtZTogdmFsdWUxLm5hbWUsXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246IHZhbHVlMS5kZXNjcmlwdGlvbixcblx0XHRcdFx0XHRvcHRpb25zOiB2YWx1ZTEub3B0aW9ucyxcblx0XHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogdmFsdWUxLmRlZmF1bHRQZXJtaXNzaW9uLFxuXHRcdFx0XHRcdHR5cGU6IHZhbHVlMS50eXBlXG5cdFx0XHRcdH0pKTtcblxuXHRcdFx0XHRpZiAoIV8uaXNFcXVhbChjdXJyZW50R3VpbGRDb21tYW5kcywgdmFsdWUpKSB7XG5cdFx0XHRcdFx0YXdhaXQgZ3VpbGQuY29tbWFuZHMuc2V0KHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIHVwZGF0ZXMgaW50ZXJhY3Rpb24gcGVybWlzc2lvbnNcblx0ICovXG5cdHByb3RlY3RlZCBhc3luYyB1cGRhdGVJbnRlcmFjdGlvblBlcm1pc3Npb25zKFxuXHRcdG93bmVyczogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gLyogc3VwZXJVc2VyczogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gKi9cblx0KSB7XG5cdFx0Y29uc3QgbWFwQ29tID0gKFxuXHRcdFx0dmFsdWU6IEFwcGxpY2F0aW9uQ29tbWFuZDx7XG5cdFx0XHRcdGd1aWxkOiBHdWlsZFJlc29sdmFibGU7XG5cdFx0XHR9PlxuXHRcdCk6IHsgaWQ6IHN0cmluZzsgcGVybWlzc2lvbnM6IHsgaWQ6IHN0cmluZzsgdHlwZTogXCJVU0VSXCI7IHBlcm1pc3Npb246IGJvb2xlYW4gfVtdIH0gPT4ge1xuXHRcdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMubW9kdWxlcy5maW5kKG1vZCA9PiBtb2QuYWxpYXNlc1swXSA9PT0gdmFsdWUubmFtZSk7XG5cdFx0XHRsZXQgYWxsb3dlZFVzZXJzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0LyogaWYgKGNvbW1hbmQuc3VwZXJVc2VyT25seSkgYWxsb3dlZFVzZXJzLnB1c2goLi4uVXRpbC5pbnRvQXJyYXkoc3VwZXJVc2VycykpOyAqL1xuXHRcdFx0aWYgKGNvbW1hbmQ/Lm93bmVyT25seSkgYWxsb3dlZFVzZXJzLnB1c2goLi4uVXRpbC5pbnRvQXJyYXkob3duZXJzKSk7XG5cdFx0XHRhbGxvd2VkVXNlcnMgPSBbLi4ubmV3IFNldChhbGxvd2VkVXNlcnMpXTsgLy8gcmVtb3ZlIGR1cGxpY2F0ZXNcblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aWQ6IHZhbHVlLmlkLFxuXHRcdFx0XHRwZXJtaXNzaW9uczogYWxsb3dlZFVzZXJzLm1hcCh1ID0+ICh7XG5cdFx0XHRcdFx0aWQ6IHUsXG5cdFx0XHRcdFx0dHlwZTogXCJVU0VSXCIsXG5cdFx0XHRcdFx0cGVybWlzc2lvbjogdHJ1ZVxuXHRcdFx0XHR9KSlcblx0XHRcdH07XG5cdFx0fTtcblxuXHRcdGNvbnN0IGdsb2JhbENvbW1hbmRzID0gKGF3YWl0IHRoaXMuY2xpZW50LmFwcGxpY2F0aW9uPy5jb21tYW5kcy5mZXRjaCgpKS5maWx0ZXIoXG5cdFx0XHR2YWx1ZSA9PiAhIXRoaXMubW9kdWxlcy5maW5kKG1vZCA9PiBtb2QuYWxpYXNlc1swXSA9PT0gdmFsdWUubmFtZSlcblx0XHQpO1xuXHRcdGNvbnN0IGZ1bGxQZXJtaXNzaW9uczogR3VpbGRBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uRGF0YVtdID0gZ2xvYmFsQ29tbWFuZHNcblx0XHRcdC5maWx0ZXIodmFsdWUgPT4gIXZhbHVlLmRlZmF1bHRQZXJtaXNzaW9uKVxuXHRcdFx0LmZpbHRlcih2YWx1ZSA9PiAhIXRoaXMubW9kdWxlcy5maW5kKG1vZCA9PiBtb2QuYWxpYXNlc1swXSA9PT0gdmFsdWUubmFtZSkpXG5cdFx0XHQubWFwKHZhbHVlID0+IG1hcENvbSh2YWx1ZSkpO1xuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSB0aGlzLmNsaWVudC5ndWlsZHMuY2FjaGUubWFwKGFzeW5jIGd1aWxkID0+IHtcblx0XHRcdGNvbnN0IHBlcm1zID0gbmV3IEFycmF5KC4uLmZ1bGxQZXJtaXNzaW9ucyk7XG5cdFx0XHRhd2FpdCBndWlsZC5jb21tYW5kcy5mZXRjaCgpO1xuXHRcdFx0aWYgKGd1aWxkLmNvbW1hbmRzLmNhY2hlLnNpemUpXG5cdFx0XHRcdHBlcm1zLnB1c2goLi4uZ3VpbGQuY29tbWFuZHMuY2FjaGUuZmlsdGVyKHZhbHVlID0+ICF2YWx1ZS5kZWZhdWx0UGVybWlzc2lvbikubWFwKHZhbHVlID0+IG1hcENvbSh2YWx1ZSkpKTtcblx0XHRcdGlmIChndWlsZC5hdmFpbGFibGUpXG5cdFx0XHRcdHJldHVybiBndWlsZC5jb21tYW5kcy5wZXJtaXNzaW9ucy5zZXQoe1xuXHRcdFx0XHRcdGZ1bGxQZXJtaXNzaW9uczogcGVybXNcblx0XHRcdFx0fSk7XG5cdFx0XHQvLyBSZXR1cm4gZW1wdHkgcHJvbWlzZSBpZiBndWlsZCBpcyB1bmF2YWlsYWJsZVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH0pO1xuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0LyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXHRcdFx0Y29uc29sZS5kZWJ1Zyhwcm9taXNlcyk7XG5cdFx0XHRjb25zb2xlLmRlYnVnKGdsb2JhbENvbW1hbmRzKTtcblx0XHRcdGNvbnNvbGUuZGVidWcoZnVsbFBlcm1pc3Npb25zKTtcblx0XHRcdC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIE1vZHVsZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBmaWxlcGF0aCAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWdpc3Rlcihjb21tYW5kOiBDb21tYW5kLCBmaWxlcGF0aD86IHN0cmluZyk6IHZvaWQge1xuXHRcdHN1cGVyLnJlZ2lzdGVyKGNvbW1hbmQsIGZpbGVwYXRoKTtcblxuXHRcdGZvciAobGV0IGFsaWFzIG9mIGNvbW1hbmQuYWxpYXNlcykge1xuXHRcdFx0Y29uc3QgY29uZmxpY3QgPSB0aGlzLmFsaWFzZXMuZ2V0KGFsaWFzLnRvTG93ZXJDYXNlKCkpO1xuXHRcdFx0aWYgKGNvbmZsaWN0KSB0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJBTElBU19DT05GTElDVFwiLCBhbGlhcywgY29tbWFuZC5pZCwgY29uZmxpY3QpO1xuXG5cdFx0XHRhbGlhcyA9IGFsaWFzLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR0aGlzLmFsaWFzZXMuc2V0KGFsaWFzLCBjb21tYW5kLmlkKTtcblx0XHRcdGlmICh0aGlzLmFsaWFzUmVwbGFjZW1lbnQpIHtcblx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnQgPSBhbGlhcy5yZXBsYWNlKHRoaXMuYWxpYXNSZXBsYWNlbWVudCwgXCJcIik7XG5cblx0XHRcdFx0aWYgKHJlcGxhY2VtZW50ICE9PSBhbGlhcykge1xuXHRcdFx0XHRcdGNvbnN0IHJlcGxhY2VtZW50Q29uZmxpY3QgPSB0aGlzLmFsaWFzZXMuZ2V0KHJlcGxhY2VtZW50KTtcblx0XHRcdFx0XHRpZiAocmVwbGFjZW1lbnRDb25mbGljdClcblx0XHRcdFx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMSUFTX0NPTkZMSUNUXCIsIHJlcGxhY2VtZW50LCBjb21tYW5kLmlkLCByZXBsYWNlbWVudENvbmZsaWN0KTtcblx0XHRcdFx0XHR0aGlzLmFsaWFzZXMuc2V0KHJlcGxhY2VtZW50LCBjb21tYW5kLmlkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLnByZWZpeCAhPSBudWxsKSB7XG5cdFx0XHRsZXQgbmV3RW50cnkgPSBmYWxzZTtcblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY29tbWFuZC5wcmVmaXgpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgcHJlZml4IG9mIGNvbW1hbmQucHJlZml4KSB7XG5cdFx0XHRcdFx0Y29uc3QgcHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLmdldChwcmVmaXgpO1xuXHRcdFx0XHRcdGlmIChwcmVmaXhlcykge1xuXHRcdFx0XHRcdFx0cHJlZml4ZXMuYWRkKGNvbW1hbmQuaWQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLnByZWZpeGVzLnNldChwcmVmaXgsIG5ldyBTZXQoW2NvbW1hbmQuaWRdKSk7XG5cdFx0XHRcdFx0XHRuZXdFbnRyeSA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0aWYgKHByZWZpeGVzKSB7XG5cdFx0XHRcdFx0cHJlZml4ZXMuYWRkKGNvbW1hbmQuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuc2V0KGNvbW1hbmQucHJlZml4LCBuZXcgU2V0KFtjb21tYW5kLmlkXSkpO1xuXHRcdFx0XHRcdG5ld0VudHJ5ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAobmV3RW50cnkpIHtcblx0XHRcdFx0dGhpcy5wcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuc29ydCgoYVZhbCwgYlZhbCwgYUtleSwgYktleSkgPT4gVXRpbC5wcmVmaXhDb21wYXJlKGFLZXksIGJLZXkpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVyZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBkZXJlZ2lzdGVyKGNvbW1hbmQ6IENvbW1hbmQpOiB2b2lkIHtcblx0XHRmb3IgKGxldCBhbGlhcyBvZiBjb21tYW5kLmFsaWFzZXMpIHtcblx0XHRcdGFsaWFzID0gYWxpYXMudG9Mb3dlckNhc2UoKTtcblx0XHRcdHRoaXMuYWxpYXNlcy5kZWxldGUoYWxpYXMpO1xuXG5cdFx0XHRpZiAodGhpcy5hbGlhc1JlcGxhY2VtZW50KSB7XG5cdFx0XHRcdGNvbnN0IHJlcGxhY2VtZW50ID0gYWxpYXMucmVwbGFjZSh0aGlzLmFsaWFzUmVwbGFjZW1lbnQsIFwiXCIpO1xuXHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgIT09IGFsaWFzKSB0aGlzLmFsaWFzZXMuZGVsZXRlKHJlcGxhY2VtZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY29tbWFuZC5wcmVmaXggIT0gbnVsbCkge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY29tbWFuZC5wcmVmaXgpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgcHJlZml4IG9mIGNvbW1hbmQucHJlZml4KSB7XG5cdFx0XHRcdFx0Y29uc3QgcHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLmdldChwcmVmaXgpO1xuXHRcdFx0XHRcdGlmIChwcmVmaXhlcz8uc2l6ZSA9PT0gMSkge1xuXHRcdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5kZWxldGUocHJlZml4KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cHJlZml4ZXM/LmRlbGV0ZShwcmVmaXgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgcHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLmdldChjb21tYW5kLnByZWZpeCk7XG5cdFx0XHRcdGlmIChwcmVmaXhlcz8uc2l6ZSA9PT0gMSkge1xuXHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuZGVsZXRlKGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0cHJlZml4ZXMuZGVsZXRlKGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHN1cGVyLmRlcmVnaXN0ZXIoY29tbWFuZCk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBhIG1lc3NhZ2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLmZldGNoTWVtYmVycyAmJiBtZXNzYWdlLmd1aWxkICYmICFtZXNzYWdlLm1lbWJlciAmJiAhbWVzc2FnZS53ZWJob29rSWQpIHtcblx0XHRcdFx0YXdhaXQgbWVzc2FnZS5ndWlsZC5tZW1iZXJzLmZldGNoKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuQWxsVHlwZUluaGliaXRvcnMobWVzc2FnZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbHMuaGFzKG1lc3NhZ2UuaWQpKSB7XG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gdGhpcy5jb21tYW5kVXRpbHMuZ2V0KG1lc3NhZ2UuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lc3NhZ2UudXRpbCA9IG5ldyBDb21tYW5kVXRpbCh0aGlzLCBtZXNzYWdlKTtcblx0XHRcdFx0XHR0aGlzLmNvbW1hbmRVdGlscy5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZS51dGlsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5QcmVUeXBlSW5oaWJpdG9ycyhtZXNzYWdlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBwYXJzZWQgPSBhd2FpdCB0aGlzLnBhcnNlQ29tbWFuZChtZXNzYWdlKTtcblx0XHRcdGlmICghcGFyc2VkLmNvbW1hbmQpIHtcblx0XHRcdFx0Y29uc3Qgb3ZlclBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kT3ZlcndyaXR0ZW5QcmVmaXhlcyhtZXNzYWdlKTtcblx0XHRcdFx0aWYgKG92ZXJQYXJzZWQuY29tbWFuZCB8fCAocGFyc2VkLnByZWZpeCA9PSBudWxsICYmIG92ZXJQYXJzZWQucHJlZml4ICE9IG51bGwpKSB7XG5cdFx0XHRcdFx0cGFyc2VkID0gb3ZlclBhcnNlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHRtZXNzYWdlLnV0aWwucGFyc2VkID0gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcmFuO1xuXHRcdFx0aWYgKCFwYXJzZWQuY29tbWFuZCkge1xuXHRcdFx0XHRyYW4gPSBhd2FpdCB0aGlzLmhhbmRsZVJlZ2V4QW5kQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJhbiA9IGF3YWl0IHRoaXMuaGFuZGxlRGlyZWN0Q29tbWFuZChtZXNzYWdlLCBwYXJzZWQuY29udGVudCwgcGFyc2VkLmNvbW1hbmQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocmFuID09PSBmYWxzZSkge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9JTlZBTElELCBtZXNzYWdlKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmFuO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGEgc2xhc2ggY29tbWFuZC5cblx0ICogQHBhcmFtIGludGVyYWN0aW9uIC0gSW50ZXJhY3Rpb24gdG8gaGFuZGxlLlxuXHQgKi9cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblx0cHVibGljIGFzeW5jIGhhbmRsZVNsYXNoKGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb24pOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMuZmluZENvbW1hbmQoaW50ZXJhY3Rpb24uY29tbWFuZE5hbWUpO1xuXG5cdFx0aWYgKCFjb21tYW5kKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTk9UX0ZPVU5ELCBpbnRlcmFjdGlvbik7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWVzc2FnZSA9IG5ldyBBa2Fpcm9NZXNzYWdlKHRoaXMuY2xpZW50LCBpbnRlcmFjdGlvbiwgY29tbWFuZCk7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKHRoaXMuZmV0Y2hNZW1iZXJzICYmIG1lc3NhZ2UuZ3VpbGQgJiYgIW1lc3NhZ2UubWVtYmVyKSB7XG5cdFx0XHRcdGF3YWl0IG1lc3NhZ2UuZ3VpbGQubWVtYmVycy5mZXRjaChtZXNzYWdlLmF1dGhvcik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1bkFsbFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIHRydWUpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWwpIHtcblx0XHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWxzLmhhcyhtZXNzYWdlLmlkKSkge1xuXHRcdFx0XHRcdG1lc3NhZ2UudXRpbCA9IHRoaXMuY29tbWFuZFV0aWxzLmdldChtZXNzYWdlLmlkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSBuZXcgQ29tbWFuZFV0aWwodGhpcywgbWVzc2FnZSk7XG5cdFx0XHRcdFx0dGhpcy5jb21tYW5kVXRpbHMuc2V0KG1lc3NhZ2UuaWQsIG1lc3NhZ2UudXRpbCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUHJlVHlwZUluaGliaXRvcnMobWVzc2FnZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcGFyc2VkID0gYXdhaXQgdGhpcy5wYXJzZUNvbW1hbmQobWVzc2FnZSk7XG5cdFx0XHRpZiAoIXBhcnNlZC5jb21tYW5kKSB7XG5cdFx0XHRcdGNvbnN0IG92ZXJQYXJzZWQgPSBhd2FpdCB0aGlzLnBhcnNlQ29tbWFuZE92ZXJ3cml0dGVuUHJlZml4ZXMobWVzc2FnZSk7XG5cdFx0XHRcdGlmIChvdmVyUGFyc2VkLmNvbW1hbmQgfHwgKHBhcnNlZC5wcmVmaXggPT0gbnVsbCAmJiBvdmVyUGFyc2VkLnByZWZpeCAhPSBudWxsKSkge1xuXHRcdFx0XHRcdHBhcnNlZCA9IG92ZXJQYXJzZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuY29tbWFuZFV0aWwpIHtcblx0XHRcdFx0bWVzc2FnZS51dGlsLnBhcnNlZCA9IHBhcnNlZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUG9zdFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIGNvbW1hbmQpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGNvbnZlcnRlZE9wdGlvbnMgPSB7fTtcblx0XHRcdGlmIChpbnRlcmFjdGlvbi5vcHRpb25zW1wiX2dyb3VwXCJdKSBjb252ZXJ0ZWRPcHRpb25zW1wic3ViY29tbWFuZEdyb3VwXCJdID0gaW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9ncm91cFwiXTtcblx0XHRcdGlmIChpbnRlcmFjdGlvbi5vcHRpb25zW1wiX3N1YmNvbW1hbmRcIl0pIGNvbnZlcnRlZE9wdGlvbnNbXCJzdWJjb21tYW5kXCJdID0gaW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9zdWJjb21tYW5kXCJdO1xuXHRcdFx0Zm9yIChjb25zdCBvcHRpb24gb2YgaW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9ob2lzdGVkT3B0aW9uc1wiXSkge1xuXHRcdFx0XHRpZiAoW1wiU1VCX0NPTU1BTkRcIiwgXCJTVUJfQ09NTUFORF9HUk9VUFwiXS5pbmNsdWRlcyhvcHRpb24udHlwZSBhcyBhbnkpKSBjb250aW51ZTtcblx0XHRcdFx0Y29udmVydGVkT3B0aW9uc1tvcHRpb24ubmFtZV0gPSBpbnRlcmFjdGlvbi5vcHRpb25zW1xuXHRcdFx0XHRcdF8uY2FtZWxDYXNlKGBHRVRfJHtvcHRpb24udHlwZSBhcyBrZXlvZiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlc31gKVxuXHRcdFx0XHRdKG9wdGlvbi5uYW1lLCBmYWxzZSk7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBrZXk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrKSBrZXkgPSAoY29tbWFuZC5sb2NrIGFzIEtleVN1cHBsaWVyKShtZXNzYWdlLCBjb252ZXJ0ZWRPcHRpb25zKTtcblx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGtleSkpIGtleSA9IGF3YWl0IGtleTtcblx0XHRcdFx0aWYgKGtleSkge1xuXHRcdFx0XHRcdGlmIChjb21tYW5kLmxvY2tlcj8uaGFzKGtleSkpIHtcblx0XHRcdFx0XHRcdGtleSA9IG51bGw7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9MT0NLRUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbW1hbmQubG9ja2VyPy5hZGQoa2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRpZiAoa2V5KSBjb21tYW5kLmxvY2tlcj8uZGVsZXRlKGtleSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmF1dG9EZWZlciB8fCBjb21tYW5kLnNsYXNoRXBoZW1lcmFsKSB7XG5cdFx0XHRcdGF3YWl0IGludGVyYWN0aW9uLmRlZmVyUmVwbHkoeyBlcGhlbWVyYWw6IGNvbW1hbmQuc2xhc2hFcGhlbWVyYWwgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9TVEFSVEVELCBtZXNzYWdlLCBjb21tYW5kLCBjb252ZXJ0ZWRPcHRpb25zKTtcblx0XHRcdFx0Y29uc3QgcmV0ID1cblx0XHRcdFx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPYmplY3QuZ2V0UHJvdG90eXBlT2YoY29tbWFuZCkpLmluY2x1ZGVzKFwiZXhlY1NsYXNoXCIpIHx8IHRoaXMuZXhlY1NsYXNoXG5cdFx0XHRcdFx0XHQ/IGF3YWl0IGNvbW1hbmQuZXhlY1NsYXNoKG1lc3NhZ2UsIGNvbnZlcnRlZE9wdGlvbnMpXG5cdFx0XHRcdFx0XHQ6IGF3YWl0IGNvbW1hbmQuZXhlYyhtZXNzYWdlIGFzIGFueSwgY29udmVydGVkT3B0aW9ucyk7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9GSU5JU0hFRCwgbWVzc2FnZSwgY29tbWFuZCwgY29udmVydGVkT3B0aW9ucywgcmV0KTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX0VSUk9SLCBlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdC8qKlxuXHQgKiBIYW5kbGVzIG5vcm1hbCBjb21tYW5kcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGNvbnRlbnQgLSBDb250ZW50IG9mIG1lc3NhZ2Ugd2l0aG91dCBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgaW5zdGFuY2UuXG5cdCAqIEBwYXJhbSBpZ25vcmUgLSBJZ25vcmUgaW5oaWJpdG9ycyBhbmQgb3RoZXIgY2hlY2tzLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZURpcmVjdENvbW1hbmQoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRjb250ZW50OiBzdHJpbmcsXG5cdFx0Y29tbWFuZDogQ29tbWFuZCxcblx0XHRpZ25vcmU6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0bGV0IGtleTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKCFpZ25vcmUpIHtcblx0XHRcdFx0aWYgKG1lc3NhZ2UuZWRpdGVkVGltZXN0YW1wICYmICFjb21tYW5kLmVkaXRhYmxlKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYmVmb3JlID0gY29tbWFuZC5iZWZvcmUobWVzc2FnZSk7XG5cdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoYmVmb3JlKSkgYXdhaXQgYmVmb3JlO1xuXG5cdFx0XHRjb25zdCBhcmdzID0gYXdhaXQgY29tbWFuZC5wYXJzZShtZXNzYWdlLCBjb250ZW50KTtcblx0XHRcdGlmIChGbGFnLmlzKGFyZ3MsIFwiY2FuY2VsXCIpKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0NBTkNFTExFRCwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmIChGbGFnLmlzKGFyZ3MsIFwicmV0cnlcIikpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfQlJFQUtPVVQsIG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MubWVzc2FnZSk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmhhbmRsZShhcmdzLm1lc3NhZ2UpO1xuXHRcdFx0fSBlbHNlIGlmIChGbGFnLmlzKGFyZ3MsIFwiY29udGludWVcIikpIHtcblx0XHRcdFx0Y29uc3QgY29udGludWVDb21tYW5kID0gdGhpcy5tb2R1bGVzLmdldChhcmdzLmNvbW1hbmQpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5oYW5kbGVEaXJlY3RDb21tYW5kKG1lc3NhZ2UsIGFyZ3MucmVzdCwgY29udGludWVDb21tYW5kLCBhcmdzLmlnbm9yZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghaWdub3JlKSB7XG5cdFx0XHRcdGlmIChjb21tYW5kLmxvY2spIGtleSA9IChjb21tYW5kLmxvY2sgYXMgS2V5U3VwcGxpZXIpKG1lc3NhZ2UsIGFyZ3MpO1xuXHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2Uoa2V5KSkga2V5ID0gYXdhaXQga2V5O1xuXHRcdFx0XHRpZiAoa2V5KSB7XG5cdFx0XHRcdFx0aWYgKGNvbW1hbmQubG9ja2VyPy5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdFx0a2V5ID0gbnVsbDtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0xPQ0tFRCwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb21tYW5kLmxvY2tlcj8uYWRkKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0YXdhaXQgdGhpcy5ydW5Db21tYW5kKG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGlmIChrZXkpIGNvbW1hbmQubG9ja2VyPy5kZWxldGUoa2V5KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyByZWdleCBhbmQgY29uZGl0aW9uYWwgY29tbWFuZHMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlUmVnZXhBbmRDb25kaXRpb25hbENvbW1hbmRzKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCByYW4xID0gYXdhaXQgdGhpcy5oYW5kbGVSZWdleENvbW1hbmRzKG1lc3NhZ2UpO1xuXHRcdGNvbnN0IHJhbjIgPSBhd2FpdCB0aGlzLmhhbmRsZUNvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZSk7XG5cdFx0cmV0dXJuIHJhbjEgfHwgcmFuMjtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHJlZ2V4IGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZVJlZ2V4Q29tbWFuZHMobWVzc2FnZTogTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IGhhc1JlZ2V4Q29tbWFuZHMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmQgb2YgdGhpcy5tb2R1bGVzLnZhbHVlcygpKSB7XG5cdFx0XHRpZiAobWVzc2FnZS5lZGl0ZWRUaW1lc3RhbXAgPyBjb21tYW5kLmVkaXRhYmxlIDogdHJ1ZSkge1xuXHRcdFx0XHRjb25zdCByZWdleCA9IHR5cGVvZiBjb21tYW5kLnJlZ2V4ID09PSBcImZ1bmN0aW9uXCIgPyBjb21tYW5kLnJlZ2V4KG1lc3NhZ2UpIDogY29tbWFuZC5yZWdleDtcblx0XHRcdFx0aWYgKHJlZ2V4KSBoYXNSZWdleENvbW1hbmRzLnB1c2goeyBjb21tYW5kLCByZWdleCB9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBtYXRjaGVkQ29tbWFuZHMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIGhhc1JlZ2V4Q29tbWFuZHMpIHtcblx0XHRcdGNvbnN0IG1hdGNoID0gbWVzc2FnZS5jb250ZW50Lm1hdGNoKGVudHJ5LnJlZ2V4KTtcblx0XHRcdGlmICghbWF0Y2gpIGNvbnRpbnVlO1xuXG5cdFx0XHRjb25zdCBtYXRjaGVzID0gW107XG5cblx0XHRcdGlmIChlbnRyeS5yZWdleC5nbG9iYWwpIHtcblx0XHRcdFx0bGV0IG1hdGNoZWQ7XG5cblx0XHRcdFx0d2hpbGUgKChtYXRjaGVkID0gZW50cnkucmVnZXguZXhlYyhtZXNzYWdlLmNvbnRlbnQpKSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0bWF0Y2hlcy5wdXNoKG1hdGNoZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG1hdGNoZWRDb21tYW5kcy5wdXNoKHsgY29tbWFuZDogZW50cnkuY29tbWFuZCwgbWF0Y2gsIG1hdGNoZXMgfSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFtYXRjaGVkQ29tbWFuZHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IHsgY29tbWFuZCwgbWF0Y2gsIG1hdGNoZXMgfSBvZiBtYXRjaGVkQ29tbWFuZHMpIHtcblx0XHRcdHByb21pc2VzLnB1c2goXG5cdFx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBiZWZvcmUgPSBjb21tYW5kLmJlZm9yZShtZXNzYWdlKTtcblx0XHRcdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShiZWZvcmUpKSBhd2FpdCBiZWZvcmU7XG5cblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucnVuQ29tbWFuZChtZXNzYWdlLCBjb21tYW5kLCB7IG1hdGNoLCBtYXRjaGVzIH0pO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgY29uZGl0aW9uYWwgY29tbWFuZHMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaGFuZGxlQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlOiBNZXNzYWdlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgdHJ1ZUNvbW1hbmRzID0gW107XG5cblx0XHRjb25zdCBmaWx0ZXJQcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgY29tbWFuZCBvZiB0aGlzLm1vZHVsZXMudmFsdWVzKCkpIHtcblx0XHRcdGlmIChtZXNzYWdlLmVkaXRlZFRpbWVzdGFtcCAmJiAhY29tbWFuZC5lZGl0YWJsZSkgY29udGludWU7XG5cdFx0XHRmaWx0ZXJQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGxldCBjb25kID0gY29tbWFuZC5jb25kaXRpb24obWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGNvbmQpKSBjb25kID0gYXdhaXQgY29uZDtcblx0XHRcdFx0XHRpZiAoY29uZCkgdHJ1ZUNvbW1hbmRzLnB1c2goY29tbWFuZCk7XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwoZmlsdGVyUHJvbWlzZXMpO1xuXG5cdFx0aWYgKCF0cnVlQ29tbWFuZHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmQgb2YgdHJ1ZUNvbW1hbmRzKSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHJldHVybjtcblx0XHRcdFx0XHRcdGNvbnN0IGJlZm9yZSA9IGNvbW1hbmQuYmVmb3JlKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGJlZm9yZSkpIGF3YWl0IGJlZm9yZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucnVuQ29tbWFuZChtZXNzYWdlLCBjb21tYW5kLCB7fSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBpbmhpYml0b3JzIHdpdGggdGhlIGFsbCB0eXBlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gc2xhc2ggLSBXaGV0aGVyIG9yIG5vdCB0aGUgY29tbWFuZCBzaG91bGQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1bkFsbFR5cGVJbmhpYml0b3JzKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLCBzbGFzaDogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgcmVhc29uID0gdGhpcy5pbmhpYml0b3JIYW5kbGVyID8gYXdhaXQgdGhpcy5pbmhpYml0b3JIYW5kbGVyLnRlc3QoXCJhbGxcIiwgbWVzc2FnZSkgOiBudWxsO1xuXG5cdFx0aWYgKHJlYXNvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCByZWFzb24pO1xuXHRcdH0gZWxzZSBpZiAoIW1lc3NhZ2UuYXV0aG9yKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCBCdWlsdEluUmVhc29ucy5BVVRIT1JfTk9UX0ZPVU5EKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuYmxvY2tDbGllbnQgJiYgbWVzc2FnZS5hdXRob3IuaWQgPT09IHRoaXMuY2xpZW50LnVzZXI/LmlkKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCBCdWlsdEluUmVhc29ucy5DTElFTlQpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5ibG9ja0JvdHMgJiYgbWVzc2FnZS5hdXRob3IuYm90KSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCBCdWlsdEluUmVhc29ucy5CT1QpO1xuXHRcdH0gZWxzZSBpZiAoIXNsYXNoICYmIHRoaXMuaGFzUHJvbXB0KG1lc3NhZ2UuY2hhbm5lbCwgbWVzc2FnZS5hdXRob3IpKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuSU5fUFJPTVBULCBtZXNzYWdlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgaW5oaWJpdG9ycyB3aXRoIHRoZSBwcmUgdHlwZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW5QcmVUeXBlSW5oaWJpdG9ycyhtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHJlYXNvbiA9IHRoaXMuaW5oaWJpdG9ySGFuZGxlciA/IGF3YWl0IHRoaXMuaW5oaWJpdG9ySGFuZGxlci50ZXN0KFwicHJlXCIsIG1lc3NhZ2UpIDogbnVsbDtcblxuXHRcdGlmIChyZWFzb24gIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCwgbWVzc2FnZSwgcmVhc29uKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgaW5oaWJpdG9ycyB3aXRoIHRoZSBwb3N0IHR5cGUuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBzbGFzaCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIHNob3VsZCBpcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUG9zdFR5cGVJbmhpYml0b3JzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0c2xhc2g6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBldmVudCA9IHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfQkxPQ0tFRCA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfQkxPQ0tFRDtcblxuXHRcdGlmICghdGhpcy5za2lwQnVpbHRJblBvc3RJbmhpYml0b3JzKSB7XG5cdFx0XHRpZiAoY29tbWFuZC5vd25lck9ubHkpIHtcblx0XHRcdFx0Y29uc3QgaXNPd25lciA9IHRoaXMuY2xpZW50LmlzT3duZXIobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0XHRpZiAoIWlzT3duZXIpIHtcblx0XHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLk9XTkVSKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5zdXBlclVzZXJPbmx5KSB7XG5cdFx0XHRcdGNvbnN0IGlzU3VwZXJVc2VyID0gdGhpcy5jbGllbnQuaXNTdXBlclVzZXIobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0XHRpZiAoIWlzU3VwZXJVc2VyKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5TVVBFUl9VU0VSKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5jaGFubmVsID09PSBcImd1aWxkXCIgJiYgIW1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5HVUlMRCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5jaGFubmVsID09PSBcImRtXCIgJiYgbWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLkRNKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb21tYW5kLm9ubHlOc2Z3ICYmICFtZXNzYWdlLmNoYW5uZWxbXCJuc2Z3XCJdKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuTk9UX05TRlcpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuc2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycykge1xuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUGVybWlzc2lvbkNoZWNrcyhtZXNzYWdlLCBjb21tYW5kLCBzbGFzaCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVhc29uID0gdGhpcy5pbmhpYml0b3JIYW5kbGVyID8gYXdhaXQgdGhpcy5pbmhpYml0b3JIYW5kbGVyLnRlc3QoXCJwb3N0XCIsIG1lc3NhZ2UsIGNvbW1hbmQpIDogbnVsbDtcblxuXHRcdGlmICh0aGlzLnNraXBCdWlsdEluUG9zdEluaGliaXRvcnMpIHtcblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBlcm1pc3Npb25DaGVja3MobWVzc2FnZSwgY29tbWFuZCwgc2xhc2gpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChyZWFzb24gIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCByZWFzb24pO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMucnVuQ29vbGRvd25zKG1lc3NhZ2UsIGNvbW1hbmQpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBwZXJtaXNzaW9uIGNoZWNrcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gY29vbGRvd24uXG5cdCAqIEBwYXJhbSBzbGFzaCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW5QZXJtaXNzaW9uQ2hlY2tzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0c2xhc2g6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRpZiAoY29tbWFuZC5jbGllbnRQZXJtaXNzaW9ucykge1xuXHRcdFx0aWYgKHR5cGVvZiBjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRsZXQgbWlzc2luZyA9IGNvbW1hbmQuY2xpZW50UGVybWlzc2lvbnMobWVzc2FnZSk7XG5cdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShtaXNzaW5nKSkgbWlzc2luZyA9IGF3YWl0IG1pc3Npbmc7XG5cblx0XHRcdFx0aWYgKG1pc3NpbmcgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFwiY2xpZW50XCIsXG5cdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChtZXNzYWdlLmd1aWxkKSB7XG5cdFx0XHRcdGlmIChtZXNzYWdlLmNoYW5uZWw/LnR5cGUgPT09IFwiRE1cIikgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRjb25zdCBtaXNzaW5nID0gbWVzc2FnZS5jaGFubmVsPy5wZXJtaXNzaW9uc0ZvcihtZXNzYWdlLmd1aWxkLm1lKT8ubWlzc2luZyhjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zKTtcblx0XHRcdFx0aWYgKG1pc3Npbmc/Lmxlbmd0aCkge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFwiY2xpZW50XCIsXG5cdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLnVzZXJQZXJtaXNzaW9ucykge1xuXHRcdFx0Y29uc3QgaWdub3JlciA9IGNvbW1hbmQuaWdub3JlUGVybWlzc2lvbnMgfHwgdGhpcy5pZ25vcmVQZXJtaXNzaW9ucztcblx0XHRcdGNvbnN0IGlzSWdub3JlZCA9IEFycmF5LmlzQXJyYXkoaWdub3Jlcilcblx0XHRcdFx0PyBpZ25vcmVyLmluY2x1ZGVzKG1lc3NhZ2UuYXV0aG9yLmlkKVxuXHRcdFx0XHQ6IHR5cGVvZiBpZ25vcmVyID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdFx0PyBpZ25vcmVyKG1lc3NhZ2UsIGNvbW1hbmQpXG5cdFx0XHRcdDogbWVzc2FnZS5hdXRob3IuaWQgPT09IGlnbm9yZXI7XG5cblx0XHRcdGlmICghaXNJZ25vcmVkKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgY29tbWFuZC51c2VyUGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRsZXQgbWlzc2luZyA9IGNvbW1hbmQudXNlclBlcm1pc3Npb25zKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShtaXNzaW5nKSkgbWlzc2luZyA9IGF3YWl0IG1pc3Npbmc7XG5cblx0XHRcdFx0XHRpZiAobWlzc2luZyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdFx0XHRcdFwidXNlclwiLFxuXHRcdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS5jaGFubmVsPy50eXBlID09PSBcIkRNXCIpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRjb25zdCBtaXNzaW5nID0gbWVzc2FnZS5jaGFubmVsPy5wZXJtaXNzaW9uc0ZvcihtZXNzYWdlLmF1dGhvcik/Lm1pc3NpbmcoY29tbWFuZC51c2VyUGVybWlzc2lvbnMpO1xuXHRcdFx0XHRcdGlmIChtaXNzaW5nPy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdFx0c2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFx0XCJ1c2VyXCIsXG5cdFx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBjb29sZG93bnMgYW5kIGNoZWNrcyBpZiBhIHVzZXIgaXMgdW5kZXIgY29vbGRvd24uXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGNvb2xkb3duLlxuXHQgKi9cblx0cHVibGljIHJ1bkNvb2xkb3ducyhtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSwgY29tbWFuZDogQ29tbWFuZCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGlkID0gbWVzc2FnZS5hdXRob3I/LmlkO1xuXHRcdGNvbnN0IGlnbm9yZXIgPSBjb21tYW5kLmlnbm9yZUNvb2xkb3duIHx8IHRoaXMuaWdub3JlQ29vbGRvd247XG5cdFx0Y29uc3QgaXNJZ25vcmVkID0gQXJyYXkuaXNBcnJheShpZ25vcmVyKVxuXHRcdFx0PyBpZ25vcmVyLmluY2x1ZGVzKGlkKVxuXHRcdFx0OiB0eXBlb2YgaWdub3JlciA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHQ/IGlnbm9yZXIobWVzc2FnZSwgY29tbWFuZClcblx0XHRcdDogaWQgPT09IGlnbm9yZXI7XG5cblx0XHRpZiAoaXNJZ25vcmVkKSByZXR1cm4gZmFsc2U7XG5cblx0XHRjb25zdCB0aW1lID0gY29tbWFuZC5jb29sZG93biAhPSBudWxsID8gY29tbWFuZC5jb29sZG93biA6IHRoaXMuZGVmYXVsdENvb2xkb3duO1xuXHRcdGlmICghdGltZSkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Y29uc3QgZW5kVGltZSA9IG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcCArIHRpbWU7XG5cblx0XHRpZiAoIXRoaXMuY29vbGRvd25zLmhhcyhpZCkpIHRoaXMuY29vbGRvd25zLnNldChpZCwge30pO1xuXG5cdFx0aWYgKCF0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdKSB7XG5cdFx0XHR0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdID0ge1xuXHRcdFx0XHR0aW1lcjogc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF0pIHtcblx0XHRcdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdLnRpbWVyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXSA9IG51bGw7XG5cblx0XHRcdFx0XHRpZiAoIU9iamVjdC5rZXlzKHRoaXMuY29vbGRvd25zLmdldChpZCkpLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0dGhpcy5jb29sZG93bnMuZGVsZXRlKGlkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHRpbWUpLnVucmVmKCksXG5cdFx0XHRcdGVuZDogZW5kVGltZSxcblx0XHRcdFx0dXNlczogMFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRjb25zdCBlbnRyeSA9IHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF07XG5cblx0XHRpZiAoZW50cnkudXNlcyA+PSBjb21tYW5kLnJhdGVsaW1pdCkge1xuXHRcdFx0Y29uc3QgZW5kID0gdGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXS5lbmQ7XG5cdFx0XHRjb25zdCBkaWZmID0gZW5kIC0gbWVzc2FnZS5jcmVhdGVkVGltZXN0YW1wO1xuXG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09PTERPV04sIG1lc3NhZ2UsIGNvbW1hbmQsIGRpZmYpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0ZW50cnkudXNlcysrO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGFyZ3MgLSBBcmd1bWVudHMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1bkNvbW1hbmQobWVzc2FnZTogTWVzc2FnZSwgY29tbWFuZDogQ29tbWFuZCwgYXJnczogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKCFjb21tYW5kIHx8ICFtZXNzYWdlKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9JTlZBTElELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKGNvbW1hbmQudHlwaW5nIHx8IHRoaXMudHlwaW5nKSB7XG5cdFx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZFR5cGluZygpO1xuXHRcdH1cblxuXHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX1NUQVJURUQsIG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MpO1xuXHRcdGNvbnN0IHJldCA9IGF3YWl0IGNvbW1hbmQuZXhlYyhtZXNzYWdlLCBhcmdzKTtcblx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9GSU5JU0hFRCwgbWVzc2FnZSwgY29tbWFuZCwgYXJncywgcmV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIGNvbW1hbmQgYW5kIGl0cyBhcmd1bWVudCBsaXN0LlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcGFyc2VDb21tYW5kKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlKTogUHJvbWlzZTxQYXJzZWRDb21wb25lbnREYXRhPiB7XG5cdFx0Y29uc3QgYWxsb3dNZW50aW9uID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5wcmVmaXgpKG1lc3NhZ2UpO1xuXHRcdGxldCBwcmVmaXhlcyA9IFV0aWwuaW50b0FycmF5KGFsbG93TWVudGlvbik7XG5cdFx0aWYgKGFsbG93TWVudGlvbikge1xuXHRcdFx0Y29uc3QgbWVudGlvbnMgPSBbYDxAJHt0aGlzLmNsaWVudC51c2VyPy5pZH0+YCwgYDxAISR7dGhpcy5jbGllbnQudXNlcj8uaWR9PmBdO1xuXHRcdFx0cHJlZml4ZXMgPSBbLi4ubWVudGlvbnMsIC4uLnByZWZpeGVzXTtcblx0XHR9XG5cblx0XHRwcmVmaXhlcy5zb3J0KFV0aWwucHJlZml4Q29tcGFyZSk7XG5cdFx0cmV0dXJuIHRoaXMucGFyc2VNdWx0aXBsZVByZWZpeGVzKFxuXHRcdFx0bWVzc2FnZSxcblx0XHRcdHByZWZpeGVzLm1hcChwID0+IFtwLCBudWxsXSlcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgY29tbWFuZCBhbmQgaXRzIGFyZ3VtZW50IGxpc3QgdXNpbmcgcHJlZml4IG92ZXJ3cml0ZXMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBwYXJzZUNvbW1hbmRPdmVyd3JpdHRlblByZWZpeGVzKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlKTogUHJvbWlzZTxQYXJzZWRDb21wb25lbnREYXRhPiB7XG5cdFx0aWYgKCF0aGlzLnByZWZpeGVzLnNpemUpIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cblx0XHRjb25zdCBwcm9taXNlcyA9IHRoaXMucHJlZml4ZXMubWFwKGFzeW5jIChjbWRzLCBwcm92aWRlcikgPT4ge1xuXHRcdFx0Y29uc3QgcHJlZml4ZXMgPSBVdGlsLmludG9BcnJheShhd2FpdCBVdGlsLmludG9DYWxsYWJsZShwcm92aWRlcikobWVzc2FnZSkpO1xuXHRcdFx0cmV0dXJuIHByZWZpeGVzLm1hcChwID0+IFtwLCBjbWRzXSk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBwYWlycyA9IFV0aWwuZmxhdE1hcChhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyksIHggPT4geCk7XG5cdFx0cGFpcnMuc29ydCgoW2FdLCBbYl0pID0+IFV0aWwucHJlZml4Q29tcGFyZShhLCBiKSk7XG5cdFx0cmV0dXJuIHRoaXMucGFyc2VNdWx0aXBsZVByZWZpeGVzKG1lc3NhZ2UsIHBhaXJzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIHBhcnNlV2l0aFByZWZpeCBvbiBtdWx0aXBsZSBwcmVmaXhlcyBhbmQgcmV0dXJucyB0aGUgYmVzdCBwYXJzZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHBhcnNlLlxuXHQgKiBAcGFyYW0gcGFpcnMgLSBQYWlycyBvZiBwcmVmaXggdG8gYXNzb2NpYXRlZCBjb21tYW5kcy4gVGhhdCBpcywgYFtzdHJpbmcsIFNldDxzdHJpbmc+IHwgbnVsbF1bXWAuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VNdWx0aXBsZVByZWZpeGVzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdHBhaXJzOiBbc3RyaW5nLCBTZXQ8c3RyaW5nPiB8IG51bGxdW11cblx0KTogUGFyc2VkQ29tcG9uZW50RGF0YSB7XG5cdFx0Y29uc3QgcGFyc2VzID0gcGFpcnMubWFwKChbcHJlZml4LCBjbWRzXSkgPT4gdGhpcy5wYXJzZVdpdGhQcmVmaXgobWVzc2FnZSwgcHJlZml4LCBjbWRzKSk7XG5cdFx0Y29uc3QgcmVzdWx0ID0gcGFyc2VzLmZpbmQocGFyc2VkID0+IHBhcnNlZC5jb21tYW5kKTtcblx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGNvbnN0IGd1ZXNzID0gcGFyc2VzLmZpbmQocGFyc2VkID0+IHBhcnNlZC5wcmVmaXggIT0gbnVsbCk7XG5cdFx0aWYgKGd1ZXNzKSB7XG5cdFx0XHRyZXR1cm4gZ3Vlc3M7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWVzIHRvIHBhcnNlIGEgbWVzc2FnZSB3aXRoIHRoZSBnaXZlbiBwcmVmaXggYW5kIGFzc29jaWF0ZWQgY29tbWFuZHMuXG5cdCAqIEFzc29jaWF0ZWQgY29tbWFuZHMgcmVmZXIgdG8gd2hlbiBhIHByZWZpeCBpcyB1c2VkIGluIHByZWZpeCBvdmVycmlkZXMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBwYXJzZS5cblx0ICogQHBhcmFtIHByZWZpeCAtIFByZWZpeCB0byB1c2UuXG5cdCAqIEBwYXJhbSBhc3NvY2lhdGVkQ29tbWFuZHMgLSBBc3NvY2lhdGVkIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIHBhcnNlV2l0aFByZWZpeChcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRwcmVmaXg6IHN0cmluZyxcblx0XHRhc3NvY2lhdGVkQ29tbWFuZHM6IFNldDxzdHJpbmc+IHwgbnVsbCA9IG51bGxcblx0KTogUGFyc2VkQ29tcG9uZW50RGF0YSB7XG5cdFx0Y29uc3QgbG93ZXJDb250ZW50ID0gbWVzc2FnZS5jb250ZW50LnRvTG93ZXJDYXNlKCk7XG5cdFx0aWYgKCFsb3dlckNvbnRlbnQuc3RhcnRzV2l0aChwcmVmaXgudG9Mb3dlckNhc2UoKSkpIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cblx0XHRjb25zdCBlbmRPZlByZWZpeCA9IGxvd2VyQ29udGVudC5pbmRleE9mKHByZWZpeC50b0xvd2VyQ2FzZSgpKSArIHByZWZpeC5sZW5ndGg7XG5cdFx0Y29uc3Qgc3RhcnRPZkFyZ3MgPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2UoZW5kT2ZQcmVmaXgpLnNlYXJjaCgvXFxTLykgKyBwcmVmaXgubGVuZ3RoO1xuXHRcdGNvbnN0IGFsaWFzID0gbWVzc2FnZS5jb250ZW50LnNsaWNlKHN0YXJ0T2ZBcmdzKS5zcGxpdCgvXFxzezEsfXxcXG57MSx9LylbMF07XG5cdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMuZmluZENvbW1hbmQoYWxpYXMpO1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2Uoc3RhcnRPZkFyZ3MgKyBhbGlhcy5sZW5ndGggKyAxKS50cmltKCk7XG5cdFx0Y29uc3QgYWZ0ZXJQcmVmaXggPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2UocHJlZml4Lmxlbmd0aCkudHJpbSgpO1xuXG5cdFx0aWYgKCFjb21tYW5kKSB7XG5cdFx0XHRyZXR1cm4geyBwcmVmaXgsIGFsaWFzLCBjb250ZW50LCBhZnRlclByZWZpeCB9O1xuXHRcdH1cblxuXHRcdGlmIChhc3NvY2lhdGVkQ29tbWFuZHMgPT0gbnVsbCkge1xuXHRcdFx0aWYgKGNvbW1hbmQucHJlZml4ICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHsgcHJlZml4LCBhbGlhcywgY29udGVudCwgYWZ0ZXJQcmVmaXggfTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFhc3NvY2lhdGVkQ29tbWFuZHMuaGFzKGNvbW1hbmQuaWQpKSB7XG5cdFx0XHRyZXR1cm4geyBwcmVmaXgsIGFsaWFzLCBjb250ZW50LCBhZnRlclByZWZpeCB9O1xuXHRcdH1cblxuXHRcdHJldHVybiB7IGNvbW1hbmQsIHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBlcnJvcnMgZnJvbSB0aGUgaGFuZGxpbmcuXG5cdCAqIEBwYXJhbSBlcnIgLSBUaGUgZXJyb3IuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRoYXQgZXJyb3JlZC5cblx0ICovXG5cdHB1YmxpYyBlbWl0RXJyb3IoZXJyOiBFcnJvciwgbWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsIGNvbW1hbmQ/OiBDb21tYW5kIHwgQWthaXJvTW9kdWxlKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMubGlzdGVuZXJDb3VudChDb21tYW5kSGFuZGxlckV2ZW50cy5FUlJPUikpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5FUlJPUiwgZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aHJvdyBlcnI7XG5cdH1cblxuXHQvKipcblx0ICogU3dlZXAgY29tbWFuZCB1dGlsIGluc3RhbmNlcyBmcm9tIGNhY2hlIGFuZCByZXR1cm5zIGFtb3VudCBzd2VlcGVkLlxuXHQgKiBAcGFyYW0gbGlmZXRpbWUgLSBNZXNzYWdlcyBvbGRlciB0aGFuIHRoaXMgd2lsbCBoYXZlIHRoZWlyIGNvbW1hbmQgdXRpbCBpbnN0YW5jZSBzd2VlcGVkLiBUaGlzIGlzIGluIG1pbGxpc2Vjb25kcyBhbmQgZGVmYXVsdHMgdG8gdGhlIGBjb21tYW5kVXRpbExpZmV0aW1lYCBvcHRpb24uXG5cdCAqL1xuXHRwdWJsaWMgc3dlZXBDb21tYW5kVXRpbChsaWZldGltZTogbnVtYmVyID0gdGhpcy5jb21tYW5kVXRpbExpZmV0aW1lKTogbnVtYmVyIHtcblx0XHRsZXQgY291bnQgPSAwO1xuXHRcdGZvciAoY29uc3QgY29tbWFuZFV0aWwgb2YgdGhpcy5jb21tYW5kVXRpbHMudmFsdWVzKCkpIHtcblx0XHRcdGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG5cdFx0XHRjb25zdCBtZXNzYWdlID0gY29tbWFuZFV0aWwubWVzc2FnZTtcblx0XHRcdGlmIChub3cgLSAoKG1lc3NhZ2UgYXMgTWVzc2FnZSkuZWRpdGVkVGltZXN0YW1wIHx8IG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcCkgPiBsaWZldGltZSkge1xuXHRcdFx0XHRjb3VudCsrO1xuXHRcdFx0XHR0aGlzLmNvbW1hbmRVdGlscy5kZWxldGUobWVzc2FnZS5pZCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvdW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYW4gb25nb2luZyBwcm9tcHQgaW4gb3JkZXIgdG8gcHJldmVudCBjb21tYW5kIHVzYWdlIGluIHRoZSBjaGFubmVsLlxuXHQgKiBAcGFyYW0gY2hhbm5lbCAtIENoYW5uZWwgdG8gYWRkIHRvLlxuXHQgKiBAcGFyYW0gdXNlciAtIFVzZXIgdG8gYWRkLlxuXHQgKi9cblx0cHVibGljIGFkZFByb21wdChjaGFubmVsOiBUZXh0QmFzZWRDaGFubmVscywgdXNlcjogVXNlcik6IHZvaWQge1xuXHRcdGxldCB1c2VycyA9IHRoaXMucHJvbXB0cy5nZXQoY2hhbm5lbC5pZCk7XG5cdFx0aWYgKCF1c2VycykgdGhpcy5wcm9tcHRzLnNldChjaGFubmVsLmlkLCBuZXcgU2V0KCkpO1xuXHRcdHVzZXJzID0gdGhpcy5wcm9tcHRzLmdldChjaGFubmVsLmlkKTtcblx0XHR1c2Vycz8uYWRkKHVzZXIuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYW4gb25nb2luZyBwcm9tcHQuXG5cdCAqIEBwYXJhbSBjaGFubmVsIC0gQ2hhbm5lbCB0byByZW1vdmUgZnJvbS5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIHJlbW92ZS5cblx0ICovXG5cdHB1YmxpYyByZW1vdmVQcm9tcHQoY2hhbm5lbDogVGV4dEJhc2VkQ2hhbm5lbHMsIHVzZXI6IFVzZXIpOiB2b2lkIHtcblx0XHRjb25zdCB1c2VycyA9IHRoaXMucHJvbXB0cy5nZXQoY2hhbm5lbC5pZCk7XG5cdFx0aWYgKCF1c2VycykgcmV0dXJuO1xuXHRcdHVzZXJzLmRlbGV0ZSh1c2VyLmlkKTtcblx0XHRpZiAoIXVzZXJzLnNpemUpIHRoaXMucHJvbXB0cy5kZWxldGUodXNlci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZXJlIGlzIGFuIG9uZ29pbmcgcHJvbXB0LlxuXHQgKiBAcGFyYW0gY2hhbm5lbCAtIENoYW5uZWwgdG8gY2hlY2suXG5cdCAqIEBwYXJhbSB1c2VyIC0gVXNlciB0byBjaGVjay5cblx0ICovXG5cdHB1YmxpYyBoYXNQcm9tcHQoY2hhbm5lbDogVGV4dEJhc2VkQ2hhbm5lbHMsIHVzZXI6IFVzZXIpOiBib29sZWFuIHtcblx0XHRjb25zdCB1c2VycyA9IHRoaXMucHJvbXB0cy5nZXQoY2hhbm5lbC5pZCk7XG5cdFx0aWYgKCF1c2VycykgcmV0dXJuIGZhbHNlO1xuXHRcdHJldHVybiB1c2Vycy5oYXModXNlci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgYSBjb21tYW5kIGJ5IGFsaWFzLlxuXHQgKiBAcGFyYW0gbmFtZSAtIEFsaWFzIHRvIGZpbmQgd2l0aC5cblx0ICovXG5cdHB1YmxpYyBmaW5kQ29tbWFuZChuYW1lOiBzdHJpbmcpOiBDb21tYW5kIHtcblx0XHRyZXR1cm4gdGhpcy5tb2R1bGVzLmdldCh0aGlzLmFsaWFzZXMuZ2V0KG5hbWUudG9Mb3dlckNhc2UoKSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgaW5oaWJpdG9yIGhhbmRsZXIgdG8gdXNlLlxuXHQgKiBAcGFyYW0gaW5oaWJpdG9ySGFuZGxlciAtIFRoZSBpbmhpYml0b3IgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyB1c2VJbmhpYml0b3JIYW5kbGVyKGluaGliaXRvckhhbmRsZXI6IEluaGliaXRvckhhbmRsZXIpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0dGhpcy5pbmhpYml0b3JIYW5kbGVyID0gaW5oaWJpdG9ySGFuZGxlcjtcblx0XHR0aGlzLnJlc29sdmVyLmluaGliaXRvckhhbmRsZXIgPSBpbmhpYml0b3JIYW5kbGVyO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBsaXN0ZW5lciBoYW5kbGVyIHRvIHVzZS5cblx0ICogQHBhcmFtIGxpc3RlbmVySGFuZGxlciAtIFRoZSBsaXN0ZW5lciBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIHVzZUxpc3RlbmVySGFuZGxlcihsaXN0ZW5lckhhbmRsZXI6IExpc3RlbmVySGFuZGxlcik6IENvbW1hbmRIYW5kbGVyIHtcblx0XHR0aGlzLnJlc29sdmVyLmxpc3RlbmVySGFuZGxlciA9IGxpc3RlbmVySGFuZGxlcjtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWRzIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIHRoaW5nIC0gTW9kdWxlIG9yIHBhdGggdG8gbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWQodGhpbmc6IHN0cmluZyB8IENvbW1hbmQpOiBDb21tYW5kIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZCh0aGluZykgYXMgQ29tbWFuZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgY29tbWFuZHMgZnJvbSB0aGUgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAcGFyYW0gZGlyZWN0b3J5IC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS4gRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0gZmlsdGVyIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGxvYWRBbGwoZGlyZWN0b3J5Pzogc3RyaW5nLCBmaWx0ZXI/OiBMb2FkUHJlZGljYXRlKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5sb2FkQWxsKGRpcmVjdG9yeSwgZmlsdGVyKSBhcyBDb21tYW5kSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVtb3ZlKGlkOiBzdHJpbmcpOiBDb21tYW5kIHtcblx0XHRyZXR1cm4gc3VwZXIucmVtb3ZlKGlkKSBhcyBDb21tYW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYWxsIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZUFsbCgpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZUFsbCgpIGFzIENvbW1hbmRIYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZWxvYWQoaWQ6IHN0cmluZyk6IENvbW1hbmQge1xuXHRcdHJldHVybiBzdXBlci5yZWxvYWQoaWQpIGFzIENvbW1hbmQ7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkcyBhbGwgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkQWxsKCk6IENvbW1hbmRIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkQWxsKCkgYXMgQ29tbWFuZEhhbmRsZXI7XG5cdH1cblxuXHRwdWJsaWMgb3ZlcnJpZGUgb248SyBleHRlbmRzIGtleW9mIENvbW1hbmRIYW5kbGVyRXZlbnRzVHlwZT4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBDb21tYW5kSGFuZGxlckV2ZW50c1R5cGVbS11bXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub24oZXZlbnQsIGxpc3RlbmVyKTtcblx0fVxuXHRwdWJsaWMgb3ZlcnJpZGUgb25jZTxLIGV4dGVuZHMga2V5b2YgQ29tbWFuZEhhbmRsZXJFdmVudHNUeXBlPihcblx0XHRldmVudDogSyxcblx0XHRsaXN0ZW5lcjogKC4uLmFyZ3M6IENvbW1hbmRIYW5kbGVyRXZlbnRzVHlwZVtLXVtdKSA9PiBBd2FpdGVkPHZvaWQ+XG5cdCk6IHRoaXMge1xuXHRcdHJldHVybiBzdXBlci5vbmNlKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kSGFuZGxlck9wdGlvbnMgZXh0ZW5kcyBBa2Fpcm9IYW5kbGVyT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBSZWd1bGFyIGV4cHJlc3Npb24gdG8gYXV0b21hdGljYWxseSBtYWtlIGNvbW1hbmQgYWxpYXNlcy5cblx0ICogRm9yIGV4YW1wbGUsIHVzaW5nIGAvLS9nYCB3b3VsZCBtZWFuIHRoYXQgYWxpYXNlcyBjb250YWluaW5nIGAtYCB3b3VsZCBiZSB2YWxpZCB3aXRoIGFuZCB3aXRob3V0IGl0LlxuXHQgKiBTbywgdGhlIGFsaWFzIGBjb21tYW5kLW5hbWVgIGlzIHZhbGlkIGFzIGJvdGggYGNvbW1hbmQtbmFtZWAgYW5kIGBjb21tYW5kbmFtZWAuXG5cdCAqL1xuXHRhbGlhc1JlcGxhY2VtZW50PzogUmVnRXhwO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhbGxvdyBtZW50aW9ucyB0byB0aGUgY2xpZW50IHVzZXIgYXMgYSBwcmVmaXguXG5cdCAqL1xuXHRhbGxvd01lbnRpb24/OiBib29sZWFuIHwgTWVudGlvblByZWZpeFByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogRGVmYXVsdCBhcmd1bWVudCBvcHRpb25zLlxuXHQgKi9cblx0YXJndW1lbnREZWZhdWx0cz86IERlZmF1bHRBcmd1bWVudE9wdGlvbnM7XG5cblx0LyoqXG5cdCAqIEF1dG9tYXRpY2FsbHkgZGVmZXIgbWVzc2FnZXMgXCJCb3ROYW1lIGlzIHRoaW5raW5nXCJcblx0ICovXG5cdGF1dG9EZWZlcj86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNwZWNpZnkgd2hldGhlciB0byByZWdpc3RlciBhbGwgc2xhc2ggY29tbWFuZHMgd2hlbiBzdGFydGluZyB0aGUgY2xpZW50LlxuXHQgKi9cblx0YXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGJsb2NrIGJvdHMuXG5cdCAqL1xuXHRibG9ja0JvdHM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBzZWxmLlxuXHQgKi9cblx0YmxvY2tDbGllbnQ/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBhc3NpZ24gYG1lc3NhZ2UudXRpbGAuXG5cdCAqL1xuXHRjb21tYW5kVXRpbD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIE1pbGxpc2Vjb25kcyBhIG1lc3NhZ2Ugc2hvdWxkIGV4aXN0IGZvciBiZWZvcmUgaXRzIGNvbW1hbmQgdXRpbCBpbnN0YW5jZSBpcyBtYXJrZWQgZm9yIHJlbW92YWwuXG5cdCAqIElmIDAsIENvbW1hbmRVdGlsIGluc3RhbmNlcyB3aWxsIG5ldmVyIGJlIHJlbW92ZWQgYW5kIHdpbGwgY2F1c2UgbWVtb3J5IHRvIGluY3JlYXNlIGluZGVmaW5pdGVseS5cblx0ICovXG5cdGNvbW1hbmRVdGlsTGlmZXRpbWU/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRpbWUgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzIGZvciBzd2VlcGluZyBjb21tYW5kIHV0aWwgaW5zdGFuY2VzLlxuXHQgKiBJZiAwLCBDb21tYW5kVXRpbCBpbnN0YW5jZXMgd2lsbCBuZXZlciBiZSByZW1vdmVkIGFuZCB3aWxsIGNhdXNlIG1lbW9yeSB0byBpbmNyZWFzZSBpbmRlZmluaXRlbHkuXG5cdCAqL1xuXHRjb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWw/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgY29vbGRvd24gZm9yIGNvbW1hbmRzLlxuXHQgKi9cblx0ZGVmYXVsdENvb2xkb3duPzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBtZW1iZXJzIGFyZSBmZXRjaGVkIG9uIGVhY2ggbWVzc2FnZSBhdXRob3IgZnJvbSBhIGd1aWxkLlxuXHQgKi9cblx0ZmV0Y2hNZW1iZXJzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gaGFuZGxlIGVkaXRlZCBtZXNzYWdlcyB1c2luZyBDb21tYW5kVXRpbC5cblx0ICovXG5cdGhhbmRsZUVkaXRzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgY29vbGRvd24gb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuIERlZmF1bHRzIHRvIHRoZSBjbGllbnQgb3duZXIocykuXG5cdCAqL1xuXHRpZ25vcmVDb29sZG93bj86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGB1c2VyUGVybWlzc2lvbnNgIGNoZWNrcyBvciBhIGZ1bmN0aW9uIHRvIGlnbm9yZS5cblx0ICovXG5cdGlnbm9yZVBlcm1pc3Npb25zPzogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gfCBJZ25vcmVDaGVja1ByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogVGhlIHByZWZpeChlcykgZm9yIGNvbW1hbmQgcGFyc2luZy5cblx0ICovXG5cdHByZWZpeD86IHN0cmluZyB8IHN0cmluZ1tdIHwgUHJlZml4U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHN0b3JlIG1lc3NhZ2VzIGluIENvbW1hbmRVdGlsLlxuXHQgKi9cblx0c3RvcmVNZXNzYWdlcz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNob3cgXCJCb3ROYW1lIGlzIHR5cGluZ1wiIGluZm9ybWF0aW9uIG1lc3NhZ2Ugb24gdGhlIHRleHQgY2hhbm5lbHMgd2hlbiBhIGNvbW1hbmQgaXMgcnVubmluZy5cblx0ICovXG5cdHR5cGluZz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHVzZSBleGVjU2xhc2ggZm9yIHNsYXNoIGNvbW1hbmRzLlxuXHQgKi9cblx0ZXhlY1NsYXNoPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc2tpcCBidWlsdCBpbiByZWFzb25zIHBvc3QgdHlwZSBpbmhpYml0b3JzIHNvIHlvdSBjYW4gbWFrZSBjdXN0b20gb25lcy5cblx0ICovXG5cdHNraXBCdWlsdEluUG9zdEluaGliaXRvcnM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERhdGEgZm9yIG1hbmFnaW5nIGNvb2xkb3ducy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb29sZG93bkRhdGEge1xuXHQvKipcblx0ICogV2hlbiB0aGUgY29vbGRvd24gZW5kcy5cblx0ICovXG5cdGVuZDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaW1lb3V0IG9iamVjdC5cblx0ICovXG5cdHRpbWVyOiBOb2RlSlMuVGltZXI7XG5cblx0LyoqXG5cdCAqIE51bWJlciBvZiB0aW1lcyB0aGUgY29tbWFuZCBoYXMgYmVlbiB1c2VkLlxuXHQgKi9cblx0dXNlczogbnVtYmVyO1xufVxuXG4vKipcbiAqIFZhcmlvdXMgcGFyc2VkIGNvbXBvbmVudHMgb2YgdGhlIG1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQ29tcG9uZW50RGF0YSB7XG5cdC8qKlxuXHQgKiBUaGUgY29udGVudCB0byB0aGUgcmlnaHQgb2YgdGhlIHByZWZpeC5cblx0ICovXG5cdGFmdGVyUHJlZml4Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgYWxpYXMgdXNlZC5cblx0ICovXG5cdGFsaWFzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCB1c2VkLlxuXHQgKi9cblx0Y29tbWFuZD86IENvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBjb250ZW50IHRvIHRoZSByaWdodCBvZiB0aGUgYWxpYXMuXG5cdCAqL1xuXHRjb250ZW50Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgcHJlZml4IHVzZWQuXG5cdCAqL1xuXHRwcmVmaXg/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgd2hldGhlciB0aGlzIG1lc3NhZ2Ugc2hvdWxkIGJlIGlnbm9yZWQgZm9yIGEgY2VydGFpbiBjaGVjay5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBjaGVjay5cbiAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBjaGVjay5cbiAqL1xuZXhwb3J0IHR5cGUgSWdub3JlQ2hlY2tQcmVkaWNhdGUgPSAobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsIGNvbW1hbmQ6IENvbW1hbmQpID0+IGJvb2xlYW47XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgd2hldGhlciBtZW50aW9ucyBjYW4gYmUgdXNlZCBhcyBhIHByZWZpeC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBvcHRpb24gZm9yLlxuICovXG5leHBvcnQgdHlwZSBNZW50aW9uUHJlZml4UHJlZGljYXRlID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBwcmVmaXgoZXMpIHRvIHVzZS5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBnZXQgcHJlZml4IGZvci5cbiAqL1xuZXhwb3J0IHR5cGUgUHJlZml4U3VwcGxpZXIgPSAobWVzc2FnZTogTWVzc2FnZSkgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCBQcm9taXNlPHN0cmluZyB8IHN0cmluZ1tdPjtcbiJdfQ==