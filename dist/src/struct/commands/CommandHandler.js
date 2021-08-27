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
    async updateInteractionPermissions(owners /* superUsers: Snowflake | Snowflake[] */) {
        const mapCom = (value) => {
            const command = this.modules.find(mod => mod.aliases[0] === value.name);
            let allowedUsers = [];
            /* if (command.superUserOnly) allowedUsers.push(...Util.intoArray(superUsers)); */
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
            console.debug(promises);
            console.debug(globalCommands);
            console.debug(fullPermissions);
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
            const convertType = (val) => {
                if (typeof val === "string")
                    return val;
                switch (val) {
                    case 1 /* SUB_COMMAND */:
                        return "SUB_COMMAND";
                    case 2 /* SUB_COMMAND_GROUP */:
                        return "SUB_COMMAND_GROUP";
                    case 3 /* STRING */:
                        return "STRING";
                    case 4 /* INTEGER */:
                        return "INTEGER";
                    case 5 /* BOOLEAN */:
                        return "BOOLEAN";
                    case 6 /* USER */:
                        return "USER";
                    case 7 /* CHANNEL */:
                        return "CHANNEL";
                    case 8 /* ROLE */:
                        return "ROLE";
                    case 9 /* MENTIONABLE */:
                        return "MENTIONABLE";
                    case 10 /* NUMBER */:
                        return "NUMBER";
                    default:
                        return "";
                }
            };
            const convertedOptions = {};
            for (const option of command.slashOptions) {
                convertedOptions[option.name] =
                    interaction.options[lodash_1.default.camelCase(`GET_${convertType(option.type).replace("SUB_COMMAND", "SUBCOMMAND")}`)]();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBWW9CO0FBQ3BCLG9EQUF1QjtBQUV2Qix5RUFBaUQ7QUFDakQsNkVBQXFEO0FBRXJELG9EQUE0RTtBQUM1RSwyREFBbUM7QUFFbkMscUVBQXNGO0FBRXRGLGlIQUF5RjtBQUl6Riw0RUFBb0Q7QUFDcEQsd0RBQWlEO0FBQ2pELGdFQUF3QztBQUN4QyxrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLGNBQWUsU0FBUSx1QkFBYTtJQUN4RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxpQkFBTyxFQUN2QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEVBQ1YsV0FBVyxHQUFHLElBQUksRUFDbEIsU0FBUyxHQUFHLElBQUksRUFDaEIsWUFBWSxHQUFHLEtBQUssRUFDcEIsV0FBVyxHQUFHLEtBQUssRUFDbkIsYUFBYSxHQUFHLEtBQUssRUFDckIsV0FBVyxFQUNYLG1CQUFtQixHQUFHLEdBQUcsRUFDekIsd0JBQXdCLEdBQUcsR0FBRyxFQUM5QixlQUFlLEdBQUcsQ0FBQyxFQUNuQixjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFDL0IsaUJBQWlCLEdBQUcsRUFBRSxFQUN0QixnQkFBZ0IsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxHQUFHLEVBQ1osWUFBWSxHQUFHLElBQUksRUFDbkIsZ0JBQWdCLEVBQ2hCLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLEVBQ2QseUJBQXlCLEdBQUcsS0FBSyxFQUNqQyxTQUFTLEdBQUcsS0FBSyxFQUNqQix5QkFBeUIsR0FBRyxLQUFLLEtBQ1AsRUFBRTtRQUU3QixJ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QUFDO1FBRWhELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7T0FHRztJQUNhLElBQUksQ0FBQyxLQUF1QjtRQUMzQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFZLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7O09BSUc7SUFDYSxPQUFPLENBQUMsU0FBa0IsRUFBRSxNQUFzQjtRQUNqRSxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBbUIsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsTUFBTSxDQUFDLEVBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBWSxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7T0FFRztJQUNhLFNBQVM7UUFDeEIsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFvQixDQUFDO0lBQzVDLENBQUM7SUFFRDs7O09BR0c7SUFDYSxNQUFNLENBQUMsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFZLENBQUM7SUFDcEMsQ0FBQztJQUVEOztPQUVHO0lBQ2EsU0FBUztRQUN4QixPQUFPLEtBQUssQ0FBQyxTQUFTLEVBQW9CLENBQUM7SUFDNUMsQ0FBQztJQUVlLEVBQUUsQ0FDakIsS0FBUSxFQUNSLFFBQW1FO1FBRW5FLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNlLElBQUksQ0FDbkIsS0FBUSxFQUNSLFFBQW1FO1FBRW5FLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEMsQ0FBQztDQUNEO0FBLzdDRCxpQ0ErN0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0QXBwbGljYXRpb25Db21tYW5kLFxuXHRBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25EYXRhLFxuXHRBd2FpdGVkLFxuXHRDb2xsZWN0aW9uLFxuXHRDb21tYW5kSW50ZXJhY3Rpb24sXG5cdEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbkRhdGEsXG5cdEd1aWxkUmVzb2x2YWJsZSxcblx0TWVzc2FnZSxcblx0U25vd2ZsYWtlLFxuXHRUZXh0QmFzZWRDaGFubmVscyxcblx0VXNlclxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgQ29tbWFuZEhhbmRsZXJFdmVudHMgYXMgQ29tbWFuZEhhbmRsZXJFdmVudHNUeXBlIH0gZnJvbSBcIi4uLy4uL3R5cGluZ3MvZXZlbnRzXCI7XG5pbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCBBa2Fpcm9NZXNzYWdlIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb01lc3NhZ2VcIjtcbmltcG9ydCBDYXRlZ29yeSBmcm9tIFwiLi4vLi4vdXRpbC9DYXRlZ29yeVwiO1xuaW1wb3J0IHsgQnVpbHRJblJlYXNvbnMsIENvbW1hbmRIYW5kbGVyRXZlbnRzIH0gZnJvbSBcIi4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgVXRpbCBmcm9tIFwiLi4vLi4vdXRpbC9VdGlsXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9IYW5kbGVyLCB7IEFrYWlyb0hhbmRsZXJPcHRpb25zLCBMb2FkUHJlZGljYXRlIH0gZnJvbSBcIi4uL0FrYWlyb0hhbmRsZXJcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUgZnJvbSBcIi4uL0FrYWlyb01vZHVsZVwiO1xuaW1wb3J0IENvbnRleHRNZW51Q29tbWFuZEhhbmRsZXIgZnJvbSBcIi4uL2NvbnRleHRNZW51Q29tbWFuZHMvQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlclwiO1xuaW1wb3J0IEluaGliaXRvckhhbmRsZXIgZnJvbSBcIi4uL2luaGliaXRvcnMvSW5oaWJpdG9ySGFuZGxlclwiO1xuaW1wb3J0IExpc3RlbmVySGFuZGxlciBmcm9tIFwiLi4vbGlzdGVuZXJzL0xpc3RlbmVySGFuZGxlclwiO1xuaW1wb3J0IHsgRGVmYXVsdEFyZ3VtZW50T3B0aW9ucyB9IGZyb20gXCIuL2FyZ3VtZW50cy9Bcmd1bWVudFwiO1xuaW1wb3J0IFR5cGVSZXNvbHZlciBmcm9tIFwiLi9hcmd1bWVudHMvVHlwZVJlc29sdmVyXCI7XG5pbXBvcnQgQ29tbWFuZCwgeyBLZXlTdXBwbGllciB9IGZyb20gXCIuL0NvbW1hbmRcIjtcbmltcG9ydCBDb21tYW5kVXRpbCBmcm9tIFwiLi9Db21tYW5kVXRpbFwiO1xuaW1wb3J0IEZsYWcgZnJvbSBcIi4vRmxhZ1wiO1xuXG4vKipcbiAqIExvYWRzIGNvbW1hbmRzIGFuZCBoYW5kbGVzIG1lc3NhZ2VzLlxuICogQHBhcmFtIGNsaWVudCAtIFRoZSBBa2Fpcm8gY2xpZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kSGFuZGxlciBleHRlbmRzIEFrYWlyb0hhbmRsZXIge1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQ29tbWFuZCxcblx0XHRcdGV4dGVuc2lvbnMgPSBbXCIuanNcIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyLFxuXHRcdFx0YmxvY2tDbGllbnQgPSB0cnVlLFxuXHRcdFx0YmxvY2tCb3RzID0gdHJ1ZSxcblx0XHRcdGZldGNoTWVtYmVycyA9IGZhbHNlLFxuXHRcdFx0aGFuZGxlRWRpdHMgPSBmYWxzZSxcblx0XHRcdHN0b3JlTWVzc2FnZXMgPSBmYWxzZSxcblx0XHRcdGNvbW1hbmRVdGlsLFxuXHRcdFx0Y29tbWFuZFV0aWxMaWZldGltZSA9IDNlNSxcblx0XHRcdGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA9IDNlNSxcblx0XHRcdGRlZmF1bHRDb29sZG93biA9IDAsXG5cdFx0XHRpZ25vcmVDb29sZG93biA9IGNsaWVudC5vd25lcklELFxuXHRcdFx0aWdub3JlUGVybWlzc2lvbnMgPSBbXSxcblx0XHRcdGFyZ3VtZW50RGVmYXVsdHMgPSB7fSxcblx0XHRcdHByZWZpeCA9IFwiIVwiLFxuXHRcdFx0YWxsb3dNZW50aW9uID0gdHJ1ZSxcblx0XHRcdGFsaWFzUmVwbGFjZW1lbnQsXG5cdFx0XHRhdXRvRGVmZXIgPSBmYWxzZSxcblx0XHRcdHR5cGluZyA9IGZhbHNlLFxuXHRcdFx0YXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcyA9IGZhbHNlLFxuXHRcdFx0ZXhlY1NsYXNoID0gZmFsc2UsXG5cdFx0XHRza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzID0gZmFsc2Vcblx0XHR9OiBDb21tYW5kSGFuZGxlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHRpZiAoIShjbGFzc1RvSGFuZGxlLnByb3RvdHlwZSBpbnN0YW5jZW9mIENvbW1hbmQgfHwgY2xhc3NUb0hhbmRsZSA9PT0gQ29tbWFuZCkpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsIGNsYXNzVG9IYW5kbGUubmFtZSwgQ29tbWFuZC5uYW1lKTtcblx0XHR9XG5cblx0XHRzdXBlcihjbGllbnQsIHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUsXG5cdFx0XHRleHRlbnNpb25zLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzID0gYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcztcblxuXHRcdHRoaXMudHlwaW5nID0gdHlwaW5nO1xuXG5cdFx0dGhpcy5hdXRvRGVmZXIgPSBhdXRvRGVmZXI7XG5cblx0XHR0aGlzLnJlc29sdmVyID0gbmV3IFR5cGVSZXNvbHZlcih0aGlzKTtcblxuXHRcdHRoaXMuYWxpYXNlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmFsaWFzUmVwbGFjZW1lbnQgPSBhbGlhc1JlcGxhY2VtZW50O1xuXG5cdFx0dGhpcy5wcmVmaXhlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmJsb2NrQ2xpZW50ID0gISFibG9ja0NsaWVudDtcblxuXHRcdHRoaXMuYmxvY2tCb3RzID0gISFibG9ja0JvdHM7XG5cblx0XHR0aGlzLmZldGNoTWVtYmVycyA9ICEhZmV0Y2hNZW1iZXJzO1xuXG5cdFx0dGhpcy5oYW5kbGVFZGl0cyA9ICEhaGFuZGxlRWRpdHM7XG5cblx0XHR0aGlzLnN0b3JlTWVzc2FnZXMgPSAhIXN0b3JlTWVzc2FnZXM7XG5cblx0XHR0aGlzLmNvbW1hbmRVdGlsID0gISFjb21tYW5kVXRpbDtcblx0XHRpZiAoKHRoaXMuaGFuZGxlRWRpdHMgfHwgdGhpcy5zdG9yZU1lc3NhZ2VzKSAmJiAhdGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiQ09NTUFORF9VVElMX0VYUExJQ0lUXCIpO1xuXHRcdH1cblxuXHRcdHRoaXMuY29tbWFuZFV0aWxMaWZldGltZSA9IGNvbW1hbmRVdGlsTGlmZXRpbWU7XG5cblx0XHR0aGlzLmNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA9IGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbDtcblx0XHRpZiAodGhpcy5jb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWwgPiAwKSB7XG5cdFx0XHRzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLnN3ZWVwQ29tbWFuZFV0aWwoKSwgdGhpcy5jb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWwpLnVucmVmKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb21tYW5kVXRpbHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5jb29sZG93bnMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5kZWZhdWx0Q29vbGRvd24gPSBkZWZhdWx0Q29vbGRvd247XG5cblx0XHR0aGlzLmlnbm9yZUNvb2xkb3duID0gdHlwZW9mIGlnbm9yZUNvb2xkb3duID09PSBcImZ1bmN0aW9uXCIgPyBpZ25vcmVDb29sZG93bi5iaW5kKHRoaXMpIDogaWdub3JlQ29vbGRvd247XG5cblx0XHR0aGlzLmlnbm9yZVBlcm1pc3Npb25zID0gdHlwZW9mIGlnbm9yZVBlcm1pc3Npb25zID09PSBcImZ1bmN0aW9uXCIgPyBpZ25vcmVQZXJtaXNzaW9ucy5iaW5kKHRoaXMpIDogaWdub3JlUGVybWlzc2lvbnM7XG5cblx0XHR0aGlzLnByb21wdHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5hcmd1bWVudERlZmF1bHRzID0gVXRpbC5kZWVwQXNzaWduKFxuXHRcdFx0e1xuXHRcdFx0XHRwcm9tcHQ6IHtcblx0XHRcdFx0XHRzdGFydDogXCJcIixcblx0XHRcdFx0XHRyZXRyeTogXCJcIixcblx0XHRcdFx0XHR0aW1lb3V0OiBcIlwiLFxuXHRcdFx0XHRcdGVuZGVkOiBcIlwiLFxuXHRcdFx0XHRcdGNhbmNlbDogXCJcIixcblx0XHRcdFx0XHRyZXRyaWVzOiAxLFxuXHRcdFx0XHRcdHRpbWU6IDMwMDAwLFxuXHRcdFx0XHRcdGNhbmNlbFdvcmQ6IFwiY2FuY2VsXCIsXG5cdFx0XHRcdFx0c3RvcFdvcmQ6IFwic3RvcFwiLFxuXHRcdFx0XHRcdG9wdGlvbmFsOiBmYWxzZSxcblx0XHRcdFx0XHRpbmZpbml0ZTogZmFsc2UsXG5cdFx0XHRcdFx0bGltaXQ6IEluZmluaXR5LFxuXHRcdFx0XHRcdGJyZWFrb3V0OiB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRhcmd1bWVudERlZmF1bHRzXG5cdFx0KTtcblxuXHRcdHRoaXMucHJlZml4ID0gdHlwZW9mIHByZWZpeCA9PT0gXCJmdW5jdGlvblwiID8gcHJlZml4LmJpbmQodGhpcykgOiBwcmVmaXg7XG5cblx0XHR0aGlzLmFsbG93TWVudGlvbiA9IHR5cGVvZiBhbGxvd01lbnRpb24gPT09IFwiZnVuY3Rpb25cIiA/IGFsbG93TWVudGlvbi5iaW5kKHRoaXMpIDogISFhbGxvd01lbnRpb247XG5cblx0XHR0aGlzLmluaGliaXRvckhhbmRsZXIgPSBudWxsO1xuXG5cdFx0dGhpcy5hdXRvRGVmZXIgPSAhIWF1dG9EZWZlcjtcblxuXHRcdHRoaXMuZXhlY1NsYXNoID0gISFleGVjU2xhc2g7XG5cblx0XHR0aGlzLnNraXBCdWlsdEluUG9zdEluaGliaXRvcnMgPSAhIXNraXBCdWlsdEluUG9zdEluaGliaXRvcnM7XG5cblx0XHR0aGlzLnNldHVwKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBjb21tYW5kIGFsaWFzZXMuXG5cdCAqL1xuXHRwdWJsaWMgYWxpYXNlczogQ29sbGVjdGlvbjxzdHJpbmcsIHN0cmluZz47XG5cblx0LyoqXG5cdCAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBhdXRvbWF0aWNhbGx5IG1ha2UgY29tbWFuZCBhbGlhc2VzIGZvci5cblx0ICovXG5cdHB1YmxpYyBhbGlhc1JlcGxhY2VtZW50PzogUmVnRXhwO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBtZW50aW9ucyBhcmUgYWxsb3dlZCBmb3IgcHJlZml4aW5nLlxuXHQgKi9cblx0cHVibGljIGFsbG93TWVudGlvbjogYm9vbGVhbiB8IE1lbnRpb25QcmVmaXhQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgYXJndW1lbnQgb3B0aW9ucy5cblx0ICovXG5cdHB1YmxpYyBhcmd1bWVudERlZmF1bHRzOiBEZWZhdWx0QXJndW1lbnRPcHRpb25zO1xuXG5cdC8qKlxuXHQgKiBBdXRvbWF0aWNhbGx5IGRlZmVyIG1lc3NhZ2VzIFwiQm90TmFtZSBpcyB0aGlua2luZ1wiLlxuXHQgKi9cblx0cHVibGljIGF1dG9EZWZlcjogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU3BlY2lmeSB3aGV0aGVyIHRvIHJlZ2lzdGVyIGFsbCBzbGFzaCBjb21tYW5kcyB3aGVuIHN0YXJ0aW5nIHRoZSBjbGllbnRcblx0ICovXG5cdHB1YmxpYyBhdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBib3RzLlxuXHQgKi9cblx0cHVibGljIGJsb2NrQm90czogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYmxvY2sgc2VsZi5cblx0ICovXG5cdHB1YmxpYyBibG9ja0NsaWVudDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgQ29tbWFuZD4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGVcblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBDb21tYW5kO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBgbWVzc2FnZS51dGlsYCBpcyBhc3NpZ25lZC5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogTWlsbGlzZWNvbmRzIGEgbWVzc2FnZSBzaG91bGQgZXhpc3QgZm9yIGJlZm9yZSBpdHMgY29tbWFuZCB1dGlsIGluc3RhbmNlIGlzIG1hcmtlZCBmb3IgcmVtb3ZhbC5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbExpZmV0aW1lOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgQ29tbWFuZFV0aWxzLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmRVdGlsczogQ29sbGVjdGlvbjxzdHJpbmcsIENvbW1hbmRVdGlsPjtcblxuXHQvKipcblx0ICogVGltZSBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMgZm9yIHN3ZWVwaW5nIGNvbW1hbmQgdXRpbCBpbnN0YW5jZXMuXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZFV0aWxTd2VlcEludGVydmFsOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgY29vbGRvd25zLlxuXHQgKiA8aW5mbz5UaGUgZWxlbWVudHMgaW4gdGhlIGNvbGxlY3Rpb24gYXJlIG9iamVjdHMgd2l0aCB1c2VyIElEcyBhcyBrZXlzXG5cdCAqIGFuZCB7QGxpbmsgQ29vbGRvd25EYXRhfSBvYmplY3RzIGFzIHZhbHVlczwvaW5mbz5cblx0ICovXG5cdHB1YmxpYyBjb29sZG93bnM6IENvbGxlY3Rpb248c3RyaW5nLCB7IFtpZDogc3RyaW5nXTogQ29vbGRvd25EYXRhIH0+O1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IGNvb2xkb3duIGZvciBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBkZWZhdWx0Q29vbGRvd246IG51bWJlcjtcblxuXHQvKipcblx0ICogRGlyZWN0b3J5IHRvIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHVzZSBleGVjU2xhc2ggZm9yIHNsYXNoIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGV4ZWNTbGFzaDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgbWVtYmVycyBhcmUgZmV0Y2hlZCBvbiBlYWNoIG1lc3NhZ2UgYXV0aG9yIGZyb20gYSBndWlsZC5cblx0ICovXG5cdHB1YmxpYyBmZXRjaE1lbWJlcnM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IGVkaXRzIGFyZSBoYW5kbGVkLlxuXHQgKi9cblx0cHVibGljIGhhbmRsZUVkaXRzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBjb29sZG93biBvciBhIGZ1bmN0aW9uIHRvIGlnbm9yZS5cblx0ICovXG5cdHB1YmxpYyBpZ25vcmVDb29sZG93bjogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gfCBJZ25vcmVDaGVja1ByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgYHVzZXJQZXJtaXNzaW9uc2AgY2hlY2tzIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLlxuXHQgKi9cblx0cHVibGljIGlnbm9yZVBlcm1pc3Npb25zOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBJbmhpYml0b3IgaGFuZGxlciB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgaW5oaWJpdG9ySGFuZGxlcj86IEluaGliaXRvckhhbmRsZXI7XG5cblx0LyoqXG5cdCAqIENvbW1hbmRzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIENvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ29tbWFuZD47XG5cblx0LyoqXG5cdCAqIFRoZSBwcmVmaXgoZXMpIGZvciBjb21tYW5kIHBhcnNpbmcuXG5cdCAqL1xuXHRwdWJsaWMgcHJlZml4OiBzdHJpbmcgfCBzdHJpbmdbXSB8IFByZWZpeFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBDb2xsZWN0aW9uIG9mIHByZWZpeCBvdmVyd3JpdGVzIHRvIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIHByZWZpeGVzOiBDb2xsZWN0aW9uPHN0cmluZyB8IFByZWZpeFN1cHBsaWVyLCBTZXQ8c3RyaW5nPj47XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2Ygc2V0cyBvZiBvbmdvaW5nIGFyZ3VtZW50IHByb21wdHMuXG5cdCAqL1xuXHRwdWJsaWMgcHJvbXB0czogQ29sbGVjdGlvbjxzdHJpbmcsIFNldDxzdHJpbmc+PjtcblxuXHQvKipcblx0ICogVGhlIHR5cGUgcmVzb2x2ZXIuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZXI6IFR5cGVSZXNvbHZlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc3RvcmUgbWVzc2FnZXMgaW4gQ29tbWFuZFV0aWwuXG5cdCAqL1xuXHRwdWJsaWMgc3RvcmVNZXNzYWdlczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU2hvdyBcIkJvdE5hbWUgaXMgdHlwaW5nXCIgaW5mb3JtYXRpb24gbWVzc2FnZSBvbiB0aGUgdGV4dCBjaGFubmVscyB3aGVuIGEgY29tbWFuZCBpcyBydW5uaW5nLlxuXHQgKi9cblx0cHVibGljIHR5cGluZzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc2tpcCBidWlsdCBpbiByZWFzb25zIHBvc3QgdHlwZSBpbmhpYml0b3JzIHNvIHlvdSBjYW4gbWFrZSBjdXN0b20gb25lcy5cblx0ICovXG5cdHB1YmxpYyBza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzPzogYm9vbGVhbjtcblxuXHRwcm90ZWN0ZWQgc2V0dXAoKSB7XG5cdFx0dGhpcy5jbGllbnQub25jZShcInJlYWR5XCIsICgpID0+IHtcblx0XHRcdGlmICh0aGlzLmF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHMpXG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJJbnRlcmFjdGlvbkNvbW1hbmRzKCkudGhlbigoKSA9PlxuXHRcdFx0XHRcdHRoaXMudXBkYXRlSW50ZXJhY3Rpb25QZXJtaXNzaW9ucyh0aGlzLmNsaWVudC5vd25lcklEIC8qICB0aGlzLmNsaWVudC5zdXBlclVzZXJJRCAqLylcblx0XHRcdFx0KTtcblxuXHRcdFx0dGhpcy5jbGllbnQub24oXCJtZXNzYWdlQ3JlYXRlXCIsIGFzeW5jIG0gPT4ge1xuXHRcdFx0XHRpZiAobS5wYXJ0aWFsKSBhd2FpdCBtLmZldGNoKCk7XG5cblx0XHRcdFx0dGhpcy5oYW5kbGUobSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRWRpdHMpIHtcblx0XHRcdFx0dGhpcy5jbGllbnQub24oXCJtZXNzYWdlVXBkYXRlXCIsIGFzeW5jIChvLCBtKSA9PiB7XG5cdFx0XHRcdFx0aWYgKG8ucGFydGlhbCkgYXdhaXQgby5mZXRjaCgpO1xuXHRcdFx0XHRcdGlmIChtLnBhcnRpYWwpIGF3YWl0IG0uZmV0Y2goKTtcblx0XHRcdFx0XHRpZiAoby5jb250ZW50ID09PSBtLmNvbnRlbnQpIHJldHVybjtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVkaXRzKSB0aGlzLmhhbmRsZShtIGFzIE1lc3NhZ2UpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuY2xpZW50Lm9uKFwiaW50ZXJhY3Rpb25DcmVhdGVcIiwgaSA9PiB7XG5cdFx0XHRcdGlmICghaS5pc0NvbW1hbmQoKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLmhhbmRsZVNsYXNoKGkpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgYXN5bmMgcmVnaXN0ZXJJbnRlcmFjdGlvbkNvbW1hbmRzKCkge1xuXHRcdGNvbnN0IHBhcnNlZFNsYXNoQ29tbWFuZHM6IHtcblx0XHRcdG5hbWU6IHN0cmluZztcblx0XHRcdGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuXHRcdFx0b3B0aW9ucz86IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkRhdGFbXTtcblx0XHRcdGd1aWxkczogU25vd2ZsYWtlW107XG5cdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogYm9vbGVhbjtcblx0XHRcdHR5cGU6IFwiQ0hBVF9JTlBVVFwiIHwgXCJNRVNTQUdFXCIgfCBcIlVTRVJcIjtcblx0XHR9W10gPSBbXTtcblx0XHRjb25zdCBndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQ6IENvbGxlY3Rpb248XG5cdFx0XHRTbm93Zmxha2UsXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IHN0cmluZztcblx0XHRcdFx0ZGVzY3JpcHRpb246IHN0cmluZztcblx0XHRcdFx0b3B0aW9uczogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YVtdO1xuXHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogYm9vbGVhbjtcblx0XHRcdFx0dHlwZTogXCJDSEFUX0lOUFVUXCIgfCBcIk1FU1NBR0VcIiB8IFwiVVNFUlwiO1xuXHRcdFx0fVtdXG5cdFx0PiA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdFx0Y29uc3QgcGFyc2VEZXNjcmlwdGlvbkNvbW1hbmQgPSBkZXNjcmlwdGlvbiA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIGRlc2NyaXB0aW9uID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZGVzY3JpcHRpb24uY29udGVudCA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gZGVzY3JpcHRpb24uY29udGVudCgpO1xuXHRcdFx0XHRpZiAodHlwZW9mIGRlc2NyaXB0aW9uLmNvbnRlbnQgPT09IFwic3RyaW5nXCIpIHJldHVybiBkZXNjcmlwdGlvbi5jb250ZW50O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRlc2NyaXB0aW9uO1xuXHRcdH07XG5cblx0XHRmb3IgKGNvbnN0IFssIGRhdGFdIG9mIHRoaXMubW9kdWxlcykge1xuXHRcdFx0aWYgKCFkYXRhLnNsYXNoKSBjb250aW51ZTtcblx0XHRcdHBhcnNlZFNsYXNoQ29tbWFuZHMucHVzaCh7XG5cdFx0XHRcdG5hbWU6IGRhdGEuYWxpYXNlc1swXSxcblx0XHRcdFx0ZGVzY3JpcHRpb246IHBhcnNlRGVzY3JpcHRpb25Db21tYW5kKGRhdGEuZGVzY3JpcHRpb24pLFxuXHRcdFx0XHRvcHRpb25zOiBkYXRhLnNsYXNoT3B0aW9ucyxcblx0XHRcdFx0Z3VpbGRzOiBkYXRhLnNsYXNoR3VpbGRzID8/IFtdLFxuXHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogIShkYXRhLm93bmVyT25seSB8fCAvKiBkYXRhLnN1cGVyVXNlck9ubHkgfHwgKi8gZmFsc2UpLFxuXHRcdFx0XHR0eXBlOiBcIkNIQVRfSU5QVVRcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0bGV0IGNvbnRleHRDb21tYW5kSGFuZGxlcjogQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciB8IHVuZGVmaW5lZDtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmNsaWVudCkge1xuXHRcdFx0aWYgKHRoaXMuY2xpZW50W2tleV0gaW5zdGFuY2VvZiBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyKSB7XG5cdFx0XHRcdGNvbnRleHRDb21tYW5kSGFuZGxlciA9IHRoaXMuY2xpZW50W2tleV07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoY29udGV4dENvbW1hbmRIYW5kbGVyKSB7XG5cdFx0XHRmb3IgKGNvbnN0IFssIGRhdGFdIG9mIGNvbnRleHRDb21tYW5kSGFuZGxlci5tb2R1bGVzKSB7XG5cdFx0XHRcdHBhcnNlZFNsYXNoQ29tbWFuZHMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogZGF0YS5uYW1lLFxuXHRcdFx0XHRcdGd1aWxkczogZGF0YS5ndWlsZHMgPz8gW10sXG5cdFx0XHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246ICEoZGF0YS5vd25lck9ubHkgfHwgLyogZGF0YS5zdXBlclVzZXJPbmx5IHx8ICovIGZhbHNlKSxcblx0XHRcdFx0XHR0eXBlOiBkYXRhLnR5cGVcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyogR2xvYmFsICovXG5cdFx0Y29uc3Qgc2xhc2hDb21tYW5kc0FwcCA9IHBhcnNlZFNsYXNoQ29tbWFuZHNcblx0XHRcdC5maWx0ZXIoKHsgZ3VpbGRzIH0pID0+ICFndWlsZHMubGVuZ3RoKVxuXHRcdFx0Lm1hcCgoeyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZGVmYXVsdFBlcm1pc3Npb24sIHR5cGUgfSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4geyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZGVmYXVsdFBlcm1pc3Npb24sIHR5cGUgfTtcblx0XHRcdH0pO1xuXHRcdGNvbnN0IGN1cnJlbnRHbG9iYWxDb21tYW5kcyA9IChhd2FpdCB0aGlzLmNsaWVudC5hcHBsaWNhdGlvbj8uY29tbWFuZHMuZmV0Y2goKSkubWFwKHZhbHVlMSA9PiAoe1xuXHRcdFx0bmFtZTogdmFsdWUxLm5hbWUsXG5cdFx0XHRkZXNjcmlwdGlvbjogdmFsdWUxLmRlc2NyaXB0aW9uLFxuXHRcdFx0b3B0aW9uczogdmFsdWUxLm9wdGlvbnMsXG5cdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogdmFsdWUxLmRlZmF1bHRQZXJtaXNzaW9uLFxuXHRcdFx0dHlwZTogdmFsdWUxLnR5cGVcblx0XHR9KSk7XG5cblx0XHRpZiAoIV8uaXNFcXVhbChjdXJyZW50R2xvYmFsQ29tbWFuZHMsIHNsYXNoQ29tbWFuZHNBcHApKSB7XG5cdFx0XHRhd2FpdCB0aGlzLmNsaWVudC5hcHBsaWNhdGlvbj8uY29tbWFuZHMuc2V0KHNsYXNoQ29tbWFuZHNBcHApO1xuXHRcdH1cblxuXHRcdC8qIEd1aWxkcyAqL1xuXHRcdGZvciAoY29uc3QgeyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucywgZ3VpbGRzLCBkZWZhdWx0UGVybWlzc2lvbiwgdHlwZSB9IG9mIHBhcnNlZFNsYXNoQ29tbWFuZHMpIHtcblx0XHRcdGZvciAoY29uc3QgZ3VpbGRJZCBvZiBndWlsZHMpIHtcblx0XHRcdFx0Z3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkLnNldChndWlsZElkLCBbXG5cdFx0XHRcdFx0Li4uKGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZC5nZXQoZ3VpbGRJZCkgPz8gW10pLFxuXHRcdFx0XHRcdHsgbmFtZSwgZGVzY3JpcHRpb24sIG9wdGlvbnMsIGRlZmF1bHRQZXJtaXNzaW9uLCB0eXBlIH1cblx0XHRcdFx0XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQuc2l6ZSkge1xuXHRcdFx0Z3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkLmVhY2goYXN5bmMgKHZhbHVlLCBrZXkpID0+IHtcblx0XHRcdFx0Y29uc3QgZ3VpbGQgPSB0aGlzLmNsaWVudC5ndWlsZHMuY2FjaGUuZ2V0KGtleSk7XG5cdFx0XHRcdGlmICghZ3VpbGQpIHJldHVybjtcblxuXHRcdFx0XHRjb25zdCBjdXJyZW50R3VpbGRDb21tYW5kcyA9IChhd2FpdCBndWlsZC5jb21tYW5kcy5mZXRjaCgpKS5tYXAodmFsdWUxID0+ICh7XG5cdFx0XHRcdFx0bmFtZTogdmFsdWUxLm5hbWUsXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246IHZhbHVlMS5kZXNjcmlwdGlvbixcblx0XHRcdFx0XHRvcHRpb25zOiB2YWx1ZTEub3B0aW9ucyxcblx0XHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogdmFsdWUxLmRlZmF1bHRQZXJtaXNzaW9uLFxuXHRcdFx0XHRcdHR5cGU6IHZhbHVlMS50eXBlXG5cdFx0XHRcdH0pKTtcblxuXHRcdFx0XHRpZiAoIV8uaXNFcXVhbChjdXJyZW50R3VpbGRDb21tYW5kcywgdmFsdWUpKSB7XG5cdFx0XHRcdFx0YXdhaXQgZ3VpbGQuY29tbWFuZHMuc2V0KHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cHJvdGVjdGVkIGFzeW5jIHVwZGF0ZUludGVyYWN0aW9uUGVybWlzc2lvbnMoXG5cdFx0b3duZXJzOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSAvKiBzdXBlclVzZXJzOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSAqL1xuXHQpIHtcblx0XHRjb25zdCBtYXBDb20gPSAoXG5cdFx0XHR2YWx1ZTogQXBwbGljYXRpb25Db21tYW5kPHtcblx0XHRcdFx0Z3VpbGQ6IEd1aWxkUmVzb2x2YWJsZTtcblx0XHRcdH0+XG5cdFx0KTogeyBpZDogc3RyaW5nOyBwZXJtaXNzaW9uczogeyBpZDogc3RyaW5nOyB0eXBlOiBcIlVTRVJcIjsgcGVybWlzc2lvbjogYm9vbGVhbiB9W10gfSA9PiB7XG5cdFx0XHRjb25zdCBjb21tYW5kID0gdGhpcy5tb2R1bGVzLmZpbmQobW9kID0+IG1vZC5hbGlhc2VzWzBdID09PSB2YWx1ZS5uYW1lKTtcblx0XHRcdGxldCBhbGxvd2VkVXNlcnM6IHN0cmluZ1tdID0gW107XG5cdFx0XHQvKiBpZiAoY29tbWFuZC5zdXBlclVzZXJPbmx5KSBhbGxvd2VkVXNlcnMucHVzaCguLi5VdGlsLmludG9BcnJheShzdXBlclVzZXJzKSk7ICovXG5cdFx0XHRpZiAoY29tbWFuZC5vd25lck9ubHkpIGFsbG93ZWRVc2Vycy5wdXNoKC4uLlV0aWwuaW50b0FycmF5KG93bmVycykpO1xuXHRcdFx0YWxsb3dlZFVzZXJzID0gWy4uLm5ldyBTZXQoYWxsb3dlZFVzZXJzKV07IC8vIHJlbW92ZSBkdXBsaWNhdGVzXG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGlkOiB2YWx1ZS5pZCxcblx0XHRcdFx0cGVybWlzc2lvbnM6IGFsbG93ZWRVc2Vycy5tYXAodSA9PiAoe1xuXHRcdFx0XHRcdGlkOiB1LFxuXHRcdFx0XHRcdHR5cGU6IFwiVVNFUlwiLFxuXHRcdFx0XHRcdHBlcm1pc3Npb246IHRydWVcblx0XHRcdFx0fSkpXG5cdFx0XHR9O1xuXHRcdH07XG5cblx0XHRjb25zdCBnbG9iYWxDb21tYW5kcyA9IGF3YWl0IHRoaXMuY2xpZW50LmFwcGxpY2F0aW9uPy5jb21tYW5kcy5mZXRjaCgpO1xuXHRcdGNvbnN0IGZ1bGxQZXJtaXNzaW9uczogR3VpbGRBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uRGF0YVtdID0gZ2xvYmFsQ29tbWFuZHNcblx0XHRcdC5maWx0ZXIodmFsdWUgPT4gIXZhbHVlLmRlZmF1bHRQZXJtaXNzaW9uKVxuXHRcdFx0Lm1hcCh2YWx1ZSA9PiBtYXBDb20odmFsdWUpKTtcblxuXHRcdGNvbnN0IHByb21pc2VzID0gdGhpcy5jbGllbnQuZ3VpbGRzLmNhY2hlLm1hcChhc3luYyBndWlsZCA9PiB7XG5cdFx0XHRjb25zdCBwZXJtcyA9IG5ldyBBcnJheSguLi5mdWxsUGVybWlzc2lvbnMpO1xuXHRcdFx0YXdhaXQgZ3VpbGQuY29tbWFuZHMuZmV0Y2goKTtcblx0XHRcdGlmIChndWlsZC5jb21tYW5kcy5jYWNoZS5zaXplKVxuXHRcdFx0XHRwZXJtcy5wdXNoKC4uLmd1aWxkLmNvbW1hbmRzLmNhY2hlLmZpbHRlcih2YWx1ZSA9PiAhdmFsdWUuZGVmYXVsdFBlcm1pc3Npb24pLm1hcCh2YWx1ZSA9PiBtYXBDb20odmFsdWUpKSk7XG5cdFx0XHRpZiAoZ3VpbGQuYXZhaWxhYmxlKVxuXHRcdFx0XHRyZXR1cm4gZ3VpbGQuY29tbWFuZHMucGVybWlzc2lvbnMuc2V0KHtcblx0XHRcdFx0XHRmdWxsUGVybWlzc2lvbnM6IHBlcm1zXG5cdFx0XHRcdH0pO1xuXHRcdFx0Ly8gUmV0dXJuIGVtcHR5IHByb21pc2UgaWYgZ3VpbGQgaXMgdW5hdmFpbGFibGVcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9KTtcblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGNvbnNvbGUuZGVidWcocHJvbWlzZXMpO1xuXHRcdFx0Y29uc29sZS5kZWJ1ZyhnbG9iYWxDb21tYW5kcyk7XG5cdFx0XHRjb25zb2xlLmRlYnVnKGZ1bGxQZXJtaXNzaW9ucyk7XG5cdFx0XHR0aHJvdyBlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlZ2lzdGVyKGNvbW1hbmQ6IENvbW1hbmQsIGZpbGVwYXRoPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0c3VwZXIucmVnaXN0ZXIoY29tbWFuZCwgZmlsZXBhdGgpO1xuXG5cdFx0Zm9yIChsZXQgYWxpYXMgb2YgY29tbWFuZC5hbGlhc2VzKSB7XG5cdFx0XHRjb25zdCBjb25mbGljdCA9IHRoaXMuYWxpYXNlcy5nZXQoYWxpYXMudG9Mb3dlckNhc2UoKSk7XG5cdFx0XHRpZiAoY29uZmxpY3QpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMSUFTX0NPTkZMSUNUXCIsIGFsaWFzLCBjb21tYW5kLmlkLCBjb25mbGljdCk7XG5cblx0XHRcdGFsaWFzID0gYWxpYXMudG9Mb3dlckNhc2UoKTtcblx0XHRcdHRoaXMuYWxpYXNlcy5zZXQoYWxpYXMsIGNvbW1hbmQuaWQpO1xuXHRcdFx0aWYgKHRoaXMuYWxpYXNSZXBsYWNlbWVudCkge1xuXHRcdFx0XHRjb25zdCByZXBsYWNlbWVudCA9IGFsaWFzLnJlcGxhY2UodGhpcy5hbGlhc1JlcGxhY2VtZW50LCBcIlwiKTtcblxuXHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgIT09IGFsaWFzKSB7XG5cdFx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnRDb25mbGljdCA9IHRoaXMuYWxpYXNlcy5nZXQocmVwbGFjZW1lbnQpO1xuXHRcdFx0XHRcdGlmIChyZXBsYWNlbWVudENvbmZsaWN0KVxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiQUxJQVNfQ09ORkxJQ1RcIiwgcmVwbGFjZW1lbnQsIGNvbW1hbmQuaWQsIHJlcGxhY2VtZW50Q29uZmxpY3QpO1xuXHRcdFx0XHRcdHRoaXMuYWxpYXNlcy5zZXQocmVwbGFjZW1lbnQsIGNvbW1hbmQuaWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNvbW1hbmQucHJlZml4ICE9IG51bGwpIHtcblx0XHRcdGxldCBuZXdFbnRyeSA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjb21tYW5kLnByZWZpeCkpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBwcmVmaXggb2YgY29tbWFuZC5wcmVmaXgpIHtcblx0XHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KHByZWZpeCk7XG5cdFx0XHRcdFx0aWYgKHByZWZpeGVzKSB7XG5cdFx0XHRcdFx0XHRwcmVmaXhlcy5hZGQoY29tbWFuZC5pZCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuc2V0KHByZWZpeCwgbmV3IFNldChbY29tbWFuZC5pZF0pKTtcblx0XHRcdFx0XHRcdG5ld0VudHJ5ID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5nZXQoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHRpZiAocHJlZml4ZXMpIHtcblx0XHRcdFx0XHRwcmVmaXhlcy5hZGQoY29tbWFuZC5pZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5zZXQoY29tbWFuZC5wcmVmaXgsIG5ldyBTZXQoW2NvbW1hbmQuaWRdKSk7XG5cdFx0XHRcdFx0bmV3RW50cnkgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChuZXdFbnRyeSkge1xuXHRcdFx0XHR0aGlzLnByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5zb3J0KChhVmFsLCBiVmFsLCBhS2V5LCBiS2V5KSA9PiBVdGlsLnByZWZpeENvbXBhcmUoYUtleSwgYktleSkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGRlcmVnaXN0ZXIoY29tbWFuZDogQ29tbWFuZCk6IHZvaWQge1xuXHRcdGZvciAobGV0IGFsaWFzIG9mIGNvbW1hbmQuYWxpYXNlcykge1xuXHRcdFx0YWxpYXMgPSBhbGlhcy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0dGhpcy5hbGlhc2VzLmRlbGV0ZShhbGlhcyk7XG5cblx0XHRcdGlmICh0aGlzLmFsaWFzUmVwbGFjZW1lbnQpIHtcblx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnQgPSBhbGlhcy5yZXBsYWNlKHRoaXMuYWxpYXNSZXBsYWNlbWVudCwgXCJcIik7XG5cdFx0XHRcdGlmIChyZXBsYWNlbWVudCAhPT0gYWxpYXMpIHRoaXMuYWxpYXNlcy5kZWxldGUocmVwbGFjZW1lbnQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLnByZWZpeCAhPSBudWxsKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjb21tYW5kLnByZWZpeCkpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBwcmVmaXggb2YgY29tbWFuZC5wcmVmaXgpIHtcblx0XHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KHByZWZpeCk7XG5cdFx0XHRcdFx0aWYgKHByZWZpeGVzPy5zaXplID09PSAxKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnByZWZpeGVzLmRlbGV0ZShwcmVmaXgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwcmVmaXhlcz8uZGVsZXRlKHByZWZpeCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0aWYgKHByZWZpeGVzPy5zaXplID09PSAxKSB7XG5cdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5kZWxldGUoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRwcmVmaXhlcy5kZWxldGUoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c3VwZXIuZGVyZWdpc3Rlcihjb21tYW5kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGEgbWVzc2FnZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBoYW5kbGUobWVzc2FnZTogTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKHRoaXMuZmV0Y2hNZW1iZXJzICYmIG1lc3NhZ2UuZ3VpbGQgJiYgIW1lc3NhZ2UubWVtYmVyICYmICFtZXNzYWdlLndlYmhvb2tJZCkge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuZmV0Y2gobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5BbGxUeXBlSW5oaWJpdG9ycyhtZXNzYWdlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlscy5oYXMobWVzc2FnZS5pZCkpIHtcblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gdGhpcy5jb21tYW5kVXRpbHMuZ2V0KG1lc3NhZ2UuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSBuZXcgQ29tbWFuZFV0aWwodGhpcywgbWVzc2FnZSk7IC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHR0aGlzLmNvbW1hbmRVdGlscy5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZS51dGlsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5QcmVUeXBlSW5oaWJpdG9ycyhtZXNzYWdlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBwYXJzZWQgPSBhd2FpdCB0aGlzLnBhcnNlQ29tbWFuZChtZXNzYWdlKTtcblx0XHRcdGlmICghcGFyc2VkLmNvbW1hbmQpIHtcblx0XHRcdFx0Y29uc3Qgb3ZlclBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kT3ZlcndyaXR0ZW5QcmVmaXhlcyhtZXNzYWdlKTtcblx0XHRcdFx0aWYgKG92ZXJQYXJzZWQuY29tbWFuZCB8fCAocGFyc2VkLnByZWZpeCA9PSBudWxsICYmIG92ZXJQYXJzZWQucHJlZml4ICE9IG51bGwpKSB7XG5cdFx0XHRcdFx0cGFyc2VkID0gb3ZlclBhcnNlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdG1lc3NhZ2UudXRpbC5wYXJzZWQgPSBwYXJzZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGxldCByYW47XG5cdFx0XHRpZiAoIXBhcnNlZC5jb21tYW5kKSB7XG5cdFx0XHRcdHJhbiA9IGF3YWl0IHRoaXMuaGFuZGxlUmVnZXhBbmRDb25kaXRpb25hbENvbW1hbmRzKG1lc3NhZ2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmFuID0gYXdhaXQgdGhpcy5oYW5kbGVEaXJlY3RDb21tYW5kKG1lc3NhZ2UsIHBhcnNlZC5jb250ZW50LCBwYXJzZWQuY29tbWFuZCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChyYW4gPT09IGZhbHNlKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0lOVkFMSUQsIG1lc3NhZ2UpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByYW47XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKiBAcGFyYW0gaW50ZXJhY3Rpb24gLSBJbnRlcmFjdGlvbiB0byBoYW5kbGUuXG5cdCAqL1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuXHRwdWJsaWMgYXN5bmMgaGFuZGxlU2xhc2goaW50ZXJhY3Rpb246IENvbW1hbmRJbnRlcmFjdGlvbik6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcblx0XHRjb25zdCBjb21tYW5kID0gdGhpcy5maW5kQ29tbWFuZChpbnRlcmFjdGlvbi5jb21tYW5kTmFtZSk7XG5cblx0XHRpZiAoIWNvbW1hbmQpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9OT1RfRk9VTkQsIGludGVyYWN0aW9uKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBtZXNzYWdlID0gbmV3IEFrYWlyb01lc3NhZ2UodGhpcy5jbGllbnQsIGludGVyYWN0aW9uLCBjb21tYW5kKTtcblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAodGhpcy5mZXRjaE1lbWJlcnMgJiYgbWVzc2FnZS5ndWlsZCAmJiAhbWVzc2FnZS5tZW1iZXIpIHtcblx0XHRcdFx0YXdhaXQgbWVzc2FnZS5ndWlsZC5tZW1iZXJzLmZldGNoKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuQWxsVHlwZUluaGliaXRvcnMobWVzc2FnZSwgdHJ1ZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbHMuaGFzKG1lc3NhZ2UuaWQpKSB7XG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gdGhpcy5jb21tYW5kVXRpbHMuZ2V0KG1lc3NhZ2UuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lc3NhZ2UudXRpbCA9IG5ldyBDb21tYW5kVXRpbCh0aGlzLCBtZXNzYWdlKTtcblx0XHRcdFx0XHR0aGlzLmNvbW1hbmRVdGlscy5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZS51dGlsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5QcmVUeXBlSW5oaWJpdG9ycyhtZXNzYWdlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBwYXJzZWQgPSBhd2FpdCB0aGlzLnBhcnNlQ29tbWFuZChtZXNzYWdlKTtcblx0XHRcdGlmICghcGFyc2VkLmNvbW1hbmQpIHtcblx0XHRcdFx0Y29uc3Qgb3ZlclBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kT3ZlcndyaXR0ZW5QcmVmaXhlcyhtZXNzYWdlKTtcblx0XHRcdFx0aWYgKG92ZXJQYXJzZWQuY29tbWFuZCB8fCAocGFyc2VkLnByZWZpeCA9PSBudWxsICYmIG92ZXJQYXJzZWQucHJlZml4ICE9IG51bGwpKSB7XG5cdFx0XHRcdFx0cGFyc2VkID0gb3ZlclBhcnNlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHRtZXNzYWdlLnV0aWwucGFyc2VkID0gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgZW51bSBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlcyB7XG5cdFx0XHRcdFNVQl9DT01NQU5EID0gMSxcblx0XHRcdFx0U1VCX0NPTU1BTkRfR1JPVVAgPSAyLFxuXHRcdFx0XHRTVFJJTkcgPSAzLFxuXHRcdFx0XHRJTlRFR0VSID0gNCxcblx0XHRcdFx0Qk9PTEVBTiA9IDUsXG5cdFx0XHRcdFVTRVIgPSA2LFxuXHRcdFx0XHRDSEFOTkVMID0gNyxcblx0XHRcdFx0Uk9MRSA9IDgsXG5cdFx0XHRcdE1FTlRJT05BQkxFID0gOSxcblx0XHRcdFx0TlVNQkVSID0gMTBcblx0XHRcdH1cblx0XHRcdGNvbnN0IGNvbnZlcnRUeXBlID0gKHZhbDogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZXMgfCBrZXlvZiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlcykgPT4ge1xuXHRcdFx0XHRpZiAodHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHZhbDtcblx0XHRcdFx0c3dpdGNoICh2YWwpIHtcblx0XHRcdFx0XHRjYXNlIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGVzLlNVQl9DT01NQU5EOlxuXHRcdFx0XHRcdFx0cmV0dXJuIFwiU1VCX0NPTU1BTkRcIjtcblx0XHRcdFx0XHRjYXNlIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGVzLlNVQl9DT01NQU5EX0dST1VQOlxuXHRcdFx0XHRcdFx0cmV0dXJuIFwiU1VCX0NPTU1BTkRfR1JPVVBcIjtcblx0XHRcdFx0XHRjYXNlIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGVzLlNUUklORzpcblx0XHRcdFx0XHRcdHJldHVybiBcIlNUUklOR1wiO1xuXHRcdFx0XHRcdGNhc2UgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZXMuSU5URUdFUjpcblx0XHRcdFx0XHRcdHJldHVybiBcIklOVEVHRVJcIjtcblx0XHRcdFx0XHRjYXNlIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGVzLkJPT0xFQU46XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJCT09MRUFOXCI7XG5cdFx0XHRcdFx0Y2FzZSBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlcy5VU0VSOlxuXHRcdFx0XHRcdFx0cmV0dXJuIFwiVVNFUlwiO1xuXHRcdFx0XHRcdGNhc2UgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZXMuQ0hBTk5FTDpcblx0XHRcdFx0XHRcdHJldHVybiBcIkNIQU5ORUxcIjtcblx0XHRcdFx0XHRjYXNlIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGVzLlJPTEU6XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJST0xFXCI7XG5cdFx0XHRcdFx0Y2FzZSBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlcy5NRU5USU9OQUJMRTpcblx0XHRcdFx0XHRcdHJldHVybiBcIk1FTlRJT05BQkxFXCI7XG5cdFx0XHRcdFx0Y2FzZSBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlcy5OVU1CRVI6XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJOVU1CRVJcIjtcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRjb25zdCBjb252ZXJ0ZWRPcHRpb25zID0ge307XG5cdFx0XHRmb3IgKGNvbnN0IG9wdGlvbiBvZiBjb21tYW5kLnNsYXNoT3B0aW9ucykge1xuXHRcdFx0XHRjb252ZXJ0ZWRPcHRpb25zW29wdGlvbi5uYW1lXSA9XG5cdFx0XHRcdFx0aW50ZXJhY3Rpb24ub3B0aW9uc1tcblx0XHRcdFx0XHRcdF8uY2FtZWxDYXNlKFxuXHRcdFx0XHRcdFx0XHRgR0VUXyR7Y29udmVydFR5cGUoXG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uLnR5cGUgYXMgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZXMgfCBrZXlvZiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlc1xuXHRcdFx0XHRcdFx0XHQpLnJlcGxhY2UoXCJTVUJfQ09NTUFORFwiLCBcIlNVQkNPTU1BTkRcIil9YFxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdF0oKTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGtleTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0aWYgKGNvbW1hbmQubG9jaykga2V5ID0gY29tbWFuZC5sb2NrKG1lc3NhZ2UsIGNvbnZlcnRlZE9wdGlvbnMpO1xuXHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2Uoa2V5KSkga2V5ID0gYXdhaXQga2V5O1xuXHRcdFx0XHRpZiAoa2V5KSB7XG5cdFx0XHRcdFx0aWYgKGNvbW1hbmQubG9ja2VyPy5oYXMoa2V5KSkge1xuXHRcdFx0XHRcdFx0a2V5ID0gbnVsbDtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0xPQ0tFRCwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29tbWFuZC5sb2NrZXI/LmFkZChrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdGlmIChrZXkpIGNvbW1hbmQubG9ja2VyPy5kZWxldGUoa2V5KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuYXV0b0RlZmVyIHx8IGNvbW1hbmQuc2xhc2hFcGhlbWVyYWwpIHtcblx0XHRcdFx0YXdhaXQgaW50ZXJhY3Rpb24uZGVmZXJSZXBseSh7IGVwaGVtZXJhbDogY29tbWFuZC5zbGFzaEVwaGVtZXJhbCB9KTtcblx0XHRcdH1cblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX1NUQVJURUQsIG1lc3NhZ2UsIGNvbW1hbmQsIGNvbnZlcnRlZE9wdGlvbnMpO1xuXHRcdFx0XHRjb25zdCByZXQgPVxuXHRcdFx0XHRcdFJlZmxlY3Qub3duS2V5cyhjb21tYW5kKS5pbmNsdWRlcyhcImV4ZWNTbGFzaFwiKSB8fCB0aGlzLmV4ZWNTbGFzaFxuXHRcdFx0XHRcdFx0PyBhd2FpdCBjb21tYW5kLmV4ZWNTbGFzaChtZXNzYWdlLCBjb252ZXJ0ZWRPcHRpb25zKVxuXHRcdFx0XHRcdFx0OiBhd2FpdCBjb21tYW5kLmV4ZWMobWVzc2FnZSBhcyBhbnksIGNvbnZlcnRlZE9wdGlvbnMpO1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfRklOSVNIRUQsIG1lc3NhZ2UsIGNvbW1hbmQsIGNvbnZlcnRlZE9wdGlvbnMsIHJldCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9FUlJPUiwgZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogSGFuZGxlcyBub3JtYWwgY29tbWFuZHMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBjb250ZW50IC0gQ29udGVudCBvZiBtZXNzYWdlIHdpdGhvdXQgY29tbWFuZC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIGluc3RhbmNlLlxuXHQgKiBAcGFyYW0gaWdub3JlIC0gSWdub3JlIGluaGliaXRvcnMgYW5kIG90aGVyIGNoZWNrcy5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBoYW5kbGVEaXJlY3RDb21tYW5kKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0Y29udGVudDogc3RyaW5nLFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0aWdub3JlOiBib29sZWFuID0gZmFsc2Vcblx0KTogUHJvbWlzZTxib29sZWFuIHwgbnVsbD4ge1xuXHRcdGxldCBrZXk7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICghaWdub3JlKSB7XG5cdFx0XHRcdGlmIChtZXNzYWdlLmVkaXRlZFRpbWVzdGFtcCAmJiAhY29tbWFuZC5lZGl0YWJsZSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGJlZm9yZSA9IGNvbW1hbmQuYmVmb3JlKG1lc3NhZ2UpO1xuXHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGJlZm9yZSkpIGF3YWl0IGJlZm9yZTtcblxuXHRcdFx0Y29uc3QgYXJncyA9IGF3YWl0IGNvbW1hbmQucGFyc2UobWVzc2FnZSwgY29udGVudCk7XG5cdFx0XHRpZiAoRmxhZy5pcyhhcmdzLCBcImNhbmNlbFwiKSkge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9DQU5DRUxMRUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAoRmxhZy5pcyhhcmdzLCBcInJldHJ5XCIpKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0JSRUFLT1VULCBtZXNzYWdlLCBjb21tYW5kLCBhcmdzLm1lc3NhZ2UpO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5oYW5kbGUoYXJncy5tZXNzYWdlKTtcblx0XHRcdH0gZWxzZSBpZiAoRmxhZy5pcyhhcmdzLCBcImNvbnRpbnVlXCIpKSB7XG5cdFx0XHRcdGNvbnN0IGNvbnRpbnVlQ29tbWFuZCA9IHRoaXMubW9kdWxlcy5nZXQoYXJncy5jb21tYW5kKTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuaGFuZGxlRGlyZWN0Q29tbWFuZChtZXNzYWdlLCBhcmdzLnJlc3QsIGNvbnRpbnVlQ29tbWFuZCwgYXJncy5pZ25vcmUpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWlnbm9yZSkge1xuXHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrKSBrZXkgPSAoY29tbWFuZC5sb2NrIGFzIEtleVN1cHBsaWVyKShtZXNzYWdlLCBhcmdzKTtcblx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGtleSkpIGtleSA9IGF3YWl0IGtleTtcblx0XHRcdFx0aWYgKGtleSkge1xuXHRcdFx0XHRcdGlmIChjb21tYW5kLmxvY2tlcj8uaGFzKGtleSkpIHtcblx0XHRcdFx0XHRcdGtleSA9IG51bGw7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9MT0NLRUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29tbWFuZC5sb2NrZXI/LmFkZChrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IHRoaXMucnVuQ29tbWFuZChtZXNzYWdlLCBjb21tYW5kLCBhcmdzKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoa2V5KSBjb21tYW5kLmxvY2tlcj8uZGVsZXRlKGtleSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgcmVnZXggYW5kIGNvbmRpdGlvbmFsIGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZVJlZ2V4QW5kQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlOiBNZXNzYWdlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgcmFuMSA9IGF3YWl0IHRoaXMuaGFuZGxlUmVnZXhDb21tYW5kcyhtZXNzYWdlKTtcblx0XHRjb25zdCByYW4yID0gYXdhaXQgdGhpcy5oYW5kbGVDb25kaXRpb25hbENvbW1hbmRzKG1lc3NhZ2UpO1xuXHRcdHJldHVybiByYW4xIHx8IHJhbjI7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyByZWdleCBjb21tYW5kcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBoYW5kbGVSZWdleENvbW1hbmRzKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBoYXNSZWdleENvbW1hbmRzID0gW107XG5cdFx0Zm9yIChjb25zdCBjb21tYW5kIG9mIHRoaXMubW9kdWxlcy52YWx1ZXMoKSkge1xuXHRcdFx0aWYgKG1lc3NhZ2UuZWRpdGVkVGltZXN0YW1wID8gY29tbWFuZC5lZGl0YWJsZSA6IHRydWUpIHtcblx0XHRcdFx0Y29uc3QgcmVnZXggPSB0eXBlb2YgY29tbWFuZC5yZWdleCA9PT0gXCJmdW5jdGlvblwiID8gY29tbWFuZC5yZWdleChtZXNzYWdlKSA6IGNvbW1hbmQucmVnZXg7XG5cdFx0XHRcdGlmIChyZWdleCkgaGFzUmVnZXhDb21tYW5kcy5wdXNoKHsgY29tbWFuZCwgcmVnZXggfSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWF0Y2hlZENvbW1hbmRzID0gW107XG5cdFx0Zm9yIChjb25zdCBlbnRyeSBvZiBoYXNSZWdleENvbW1hbmRzKSB7XG5cdFx0XHRjb25zdCBtYXRjaCA9IG1lc3NhZ2UuY29udGVudC5tYXRjaChlbnRyeS5yZWdleCk7XG5cdFx0XHRpZiAoIW1hdGNoKSBjb250aW51ZTtcblxuXHRcdFx0Y29uc3QgbWF0Y2hlcyA9IFtdO1xuXG5cdFx0XHRpZiAoZW50cnkucmVnZXguZ2xvYmFsKSB7XG5cdFx0XHRcdGxldCBtYXRjaGVkO1xuXG5cdFx0XHRcdHdoaWxlICgobWF0Y2hlZCA9IGVudHJ5LnJlZ2V4LmV4ZWMobWVzc2FnZS5jb250ZW50KSkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdG1hdGNoZXMucHVzaChtYXRjaGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRtYXRjaGVkQ29tbWFuZHMucHVzaCh7IGNvbW1hbmQ6IGVudHJ5LmNvbW1hbmQsIG1hdGNoLCBtYXRjaGVzIH0pO1xuXHRcdH1cblxuXHRcdGlmICghbWF0Y2hlZENvbW1hbmRzLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGNvbnN0IHByb21pc2VzID0gW107XG5cdFx0Zm9yIChjb25zdCB7IGNvbW1hbmQsIG1hdGNoLCBtYXRjaGVzIH0gb2YgbWF0Y2hlZENvbW1hbmRzKSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHJldHVybjtcblxuXHRcdFx0XHRcdFx0Y29uc3QgYmVmb3JlID0gY29tbWFuZC5iZWZvcmUobWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoYmVmb3JlKSkgYXdhaXQgYmVmb3JlO1xuXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnJ1bkNvbW1hbmQobWVzc2FnZSwgY29tbWFuZCwgeyBtYXRjaCwgbWF0Y2hlcyB9KTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSgpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGNvbmRpdGlvbmFsIGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZUNvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZTogTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHRydWVDb21tYW5kcyA9IFtdO1xuXG5cdFx0Y29uc3QgZmlsdGVyUHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmQgb2YgdGhpcy5tb2R1bGVzLnZhbHVlcygpKSB7XG5cdFx0XHRpZiAobWVzc2FnZS5lZGl0ZWRUaW1lc3RhbXAgJiYgIWNvbW1hbmQuZWRpdGFibGUpIGNvbnRpbnVlO1xuXHRcdFx0ZmlsdGVyUHJvbWlzZXMucHVzaChcblx0XHRcdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRsZXQgY29uZCA9IGNvbW1hbmQuY29uZGl0aW9uKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShjb25kKSkgY29uZCA9IGF3YWl0IGNvbmQ7XG5cdFx0XHRcdFx0aWYgKGNvbmQpIHRydWVDb21tYW5kcy5wdXNoKGNvbW1hbmQpO1xuXHRcdFx0XHR9KSgpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGF3YWl0IFByb21pc2UuYWxsKGZpbHRlclByb21pc2VzKTtcblxuXHRcdGlmICghdHJ1ZUNvbW1hbmRzLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGNvbnN0IHByb21pc2VzID0gW107XG5cdFx0Zm9yIChjb25zdCBjb21tYW5kIG9mIHRydWVDb21tYW5kcykge1xuXHRcdFx0cHJvbWlzZXMucHVzaChcblx0XHRcdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUG9zdFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIGNvbW1hbmQpKSByZXR1cm47XG5cdFx0XHRcdFx0XHRjb25zdCBiZWZvcmUgPSBjb21tYW5kLmJlZm9yZShtZXNzYWdlKTtcblx0XHRcdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShiZWZvcmUpKSBhd2FpdCBiZWZvcmU7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnJ1bkNvbW1hbmQobWVzc2FnZSwgY29tbWFuZCwge30pO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgaW5oaWJpdG9ycyB3aXRoIHRoZSBhbGwgdHlwZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIHNsYXNoIC0gV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgc2hvdWxkIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW5BbGxUeXBlSW5oaWJpdG9ycyhtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSwgc2xhc2g6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHJlYXNvbiA9IHRoaXMuaW5oaWJpdG9ySGFuZGxlciA/IGF3YWl0IHRoaXMuaW5oaWJpdG9ySGFuZGxlci50ZXN0KFwiYWxsXCIsIG1lc3NhZ2UpIDogbnVsbDtcblxuXHRcdGlmIChyZWFzb24gIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCwgbWVzc2FnZSwgcmVhc29uKTtcblx0XHR9IGVsc2UgaWYgKCFtZXNzYWdlLmF1dGhvcikge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCwgbWVzc2FnZSwgQnVpbHRJblJlYXNvbnMuQVVUSE9SX05PVF9GT1VORCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLmJsb2NrQ2xpZW50ICYmIG1lc3NhZ2UuYXV0aG9yLmlkID09PSB0aGlzLmNsaWVudC51c2VyPy5pZCkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCwgbWVzc2FnZSwgQnVpbHRJblJlYXNvbnMuQ0xJRU5UKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuYmxvY2tCb3RzICYmIG1lc3NhZ2UuYXV0aG9yLmJvdCkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCwgbWVzc2FnZSwgQnVpbHRJblJlYXNvbnMuQk9UKTtcblx0XHR9IGVsc2UgaWYgKCFzbGFzaCAmJiB0aGlzLmhhc1Byb21wdChtZXNzYWdlLmNoYW5uZWwsIG1lc3NhZ2UuYXV0aG9yKSkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLklOX1BST01QVCwgbWVzc2FnZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGluaGliaXRvcnMgd2l0aCB0aGUgcHJlIHR5cGUuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUHJlVHlwZUluaGliaXRvcnMobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCByZWFzb24gPSB0aGlzLmluaGliaXRvckhhbmRsZXIgPyBhd2FpdCB0aGlzLmluaGliaXRvckhhbmRsZXIudGVzdChcInByZVwiLCBtZXNzYWdlKSA6IG51bGw7XG5cblx0XHRpZiAocmVhc29uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIHJlYXNvbik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGluaGliaXRvcnMgd2l0aCB0aGUgcG9zdCB0eXBlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gc2xhc2ggLSBXaGV0aGVyIG9yIG5vdCB0aGUgY29tbWFuZCBzaG91bGQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1blBvc3RUeXBlSW5oaWJpdG9ycyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdHNsYXNoOiBib29sZWFuID0gZmFsc2Vcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgZXZlbnQgPSBzbGFzaCA/IENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX0JMT0NLRUQgOiBDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0JMT0NLRUQ7XG5cblx0XHRpZiAoIXRoaXMuc2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycykge1xuXHRcdFx0aWYgKGNvbW1hbmQub3duZXJPbmx5KSB7XG5cdFx0XHRcdGNvbnN0IGlzT3duZXIgPSB0aGlzLmNsaWVudC5pc093bmVyKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdFx0aWYgKCFpc093bmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5PV05FUik7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbW1hbmQuc3VwZXJVc2VyT25seSkge1xuXHRcdFx0XHRjb25zdCBpc1N1cGVyVXNlciA9IHRoaXMuY2xpZW50LmlzU3VwZXJVc2VyKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdFx0aWYgKCFpc1N1cGVyVXNlcikge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuU1VQRVJfVVNFUik7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbW1hbmQuY2hhbm5lbCA9PT0gXCJndWlsZFwiICYmICFtZXNzYWdlLmd1aWxkKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuR1VJTEQpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbW1hbmQuY2hhbm5lbCA9PT0gXCJkbVwiICYmIG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5ETSk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5vbmx5TnNmdyAmJiAhbWVzc2FnZS5jaGFubmVsW1wibnNmd1wiXSkge1xuXHRcdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLk5PVF9OU0ZXKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnNraXBCdWlsdEluUG9zdEluaGliaXRvcnMpIHtcblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBlcm1pc3Npb25DaGVja3MobWVzc2FnZSwgY29tbWFuZCwgc2xhc2gpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHJlYXNvbiA9IHRoaXMuaW5oaWJpdG9ySGFuZGxlciA/IGF3YWl0IHRoaXMuaW5oaWJpdG9ySGFuZGxlci50ZXN0KFwicG9zdFwiLCBtZXNzYWdlLCBjb21tYW5kKSA6IG51bGw7XG5cblx0XHRpZiAodGhpcy5za2lwQnVpbHRJblBvc3RJbmhpYml0b3JzKSB7XG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5QZXJtaXNzaW9uQ2hlY2tzKG1lc3NhZ2UsIGNvbW1hbmQsIHNsYXNoKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAocmVhc29uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgcmVhc29uKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnJ1bkNvb2xkb3ducyhtZXNzYWdlLCBjb21tYW5kKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgcGVybWlzc2lvbiBjaGVja3MuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGNvb2xkb3duLlxuXHQgKiBAcGFyYW0gc2xhc2ggLSBXaGV0aGVyIG9yIG5vdCB0aGUgY29tbWFuZCBpcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUGVybWlzc2lvbkNoZWNrcyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdHNsYXNoOiBib29sZWFuID0gZmFsc2Vcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0aWYgKGNvbW1hbmQuY2xpZW50UGVybWlzc2lvbnMpIHtcblx0XHRcdGlmICh0eXBlb2YgY29tbWFuZC5jbGllbnRQZXJtaXNzaW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0bGV0IG1pc3NpbmcgPSBjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zKG1lc3NhZ2UpO1xuXHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UobWlzc2luZykpIG1pc3NpbmcgPSBhd2FpdCBtaXNzaW5nO1xuXG5cdFx0XHRcdGlmIChtaXNzaW5nICE9IG51bGwpIHtcblx0XHRcdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdFx0XHRzbGFzaCA/IENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX01JU1NJTkdfUEVSTUlTU0lPTlMgOiBDb21tYW5kSGFuZGxlckV2ZW50cy5NSVNTSU5HX1BFUk1JU1NJT05TLFxuXHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdFx0XHRcImNsaWVudFwiLFxuXHRcdFx0XHRcdFx0bWlzc2luZ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAobWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0XHRpZiAobWVzc2FnZS5jaGFubmVsPy50eXBlID09PSBcIkRNXCIpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0Y29uc3QgbWlzc2luZyA9IG1lc3NhZ2UuY2hhbm5lbD8ucGVybWlzc2lvbnNGb3IobWVzc2FnZS5ndWlsZC5tZSk/Lm1pc3NpbmcoY29tbWFuZC5jbGllbnRQZXJtaXNzaW9ucyk7XG5cdFx0XHRcdGlmIChtaXNzaW5nPy5sZW5ndGgpIHtcblx0XHRcdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdFx0XHRzbGFzaCA/IENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX01JU1NJTkdfUEVSTUlTU0lPTlMgOiBDb21tYW5kSGFuZGxlckV2ZW50cy5NSVNTSU5HX1BFUk1JU1NJT05TLFxuXHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdFx0XHRcImNsaWVudFwiLFxuXHRcdFx0XHRcdFx0bWlzc2luZ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY29tbWFuZC51c2VyUGVybWlzc2lvbnMpIHtcblx0XHRcdGNvbnN0IGlnbm9yZXIgPSBjb21tYW5kLmlnbm9yZVBlcm1pc3Npb25zIHx8IHRoaXMuaWdub3JlUGVybWlzc2lvbnM7XG5cdFx0XHRjb25zdCBpc0lnbm9yZWQgPSBBcnJheS5pc0FycmF5KGlnbm9yZXIpXG5cdFx0XHRcdD8gaWdub3Jlci5pbmNsdWRlcyhtZXNzYWdlLmF1dGhvci5pZClcblx0XHRcdFx0OiB0eXBlb2YgaWdub3JlciA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHRcdD8gaWdub3JlcihtZXNzYWdlLCBjb21tYW5kKVxuXHRcdFx0XHQ6IG1lc3NhZ2UuYXV0aG9yLmlkID09PSBpZ25vcmVyO1xuXG5cdFx0XHRpZiAoIWlzSWdub3JlZCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGNvbW1hbmQudXNlclBlcm1pc3Npb25zID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0bGV0IG1pc3NpbmcgPSBjb21tYW5kLnVzZXJQZXJtaXNzaW9ucyhtZXNzYWdlKTtcblx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UobWlzc2luZykpIG1pc3NpbmcgPSBhd2FpdCBtaXNzaW5nO1xuXG5cdFx0XHRcdFx0aWYgKG1pc3NpbmcgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KFxuXHRcdFx0XHRcdFx0XHRzbGFzaCA/IENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX01JU1NJTkdfUEVSTUlTU0lPTlMgOiBDb21tYW5kSGFuZGxlckV2ZW50cy5NSVNTSU5HX1BFUk1JU1NJT05TLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdFx0XHRcInVzZXJcIixcblx0XHRcdFx0XHRcdFx0bWlzc2luZ1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChtZXNzYWdlLmd1aWxkKSB7XG5cdFx0XHRcdFx0aWYgKG1lc3NhZ2UuY2hhbm5lbD8udHlwZSA9PT0gXCJETVwiKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0Y29uc3QgbWlzc2luZyA9IG1lc3NhZ2UuY2hhbm5lbD8ucGVybWlzc2lvbnNGb3IobWVzc2FnZS5hdXRob3IpPy5taXNzaW5nKGNvbW1hbmQudXNlclBlcm1pc3Npb25zKTtcblx0XHRcdFx0XHRpZiAobWlzc2luZz8ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdFx0XHRcdFwidXNlclwiLFxuXHRcdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgY29vbGRvd25zIGFuZCBjaGVja3MgaWYgYSB1c2VyIGlzIHVuZGVyIGNvb2xkb3duLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBjb29sZG93bi5cblx0ICovXG5cdHB1YmxpYyBydW5Db29sZG93bnMobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsIGNvbW1hbmQ6IENvbW1hbmQpOiBib29sZWFuIHtcblx0XHRjb25zdCBpZCA9IG1lc3NhZ2UuYXV0aG9yPy5pZDtcblx0XHRjb25zdCBpZ25vcmVyID0gY29tbWFuZC5pZ25vcmVDb29sZG93biB8fCB0aGlzLmlnbm9yZUNvb2xkb3duO1xuXHRcdGNvbnN0IGlzSWdub3JlZCA9IEFycmF5LmlzQXJyYXkoaWdub3Jlcilcblx0XHRcdD8gaWdub3Jlci5pbmNsdWRlcyhpZClcblx0XHRcdDogdHlwZW9mIGlnbm9yZXIgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0PyBpZ25vcmVyKG1lc3NhZ2UsIGNvbW1hbmQpXG5cdFx0XHQ6IGlkID09PSBpZ25vcmVyO1xuXG5cdFx0aWYgKGlzSWdub3JlZCkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Y29uc3QgdGltZSA9IGNvbW1hbmQuY29vbGRvd24gIT0gbnVsbCA/IGNvbW1hbmQuY29vbGRvd24gOiB0aGlzLmRlZmF1bHRDb29sZG93bjtcblx0XHRpZiAoIXRpbWUpIHJldHVybiBmYWxzZTtcblxuXHRcdGNvbnN0IGVuZFRpbWUgPSBtZXNzYWdlLmNyZWF0ZWRUaW1lc3RhbXAgKyB0aW1lO1xuXG5cdFx0aWYgKCF0aGlzLmNvb2xkb3ducy5oYXMoaWQpKSB0aGlzLmNvb2xkb3ducy5zZXQoaWQsIHt9KTtcblxuXHRcdGlmICghdGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXSkge1xuXHRcdFx0dGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXSA9IHtcblx0XHRcdFx0dGltZXI6IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdKSB7XG5cdFx0XHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXS50aW1lcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF0gPSBudWxsO1xuXG5cdFx0XHRcdFx0aWYgKCFPYmplY3Qua2V5cyh0aGlzLmNvb2xkb3ducy5nZXQoaWQpKS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHRoaXMuY29vbGRvd25zLmRlbGV0ZShpZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCB0aW1lKS51bnJlZigpLFxuXHRcdFx0XHRlbmQ6IGVuZFRpbWUsXG5cdFx0XHRcdHVzZXM6IDBcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Y29uc3QgZW50cnkgPSB0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdO1xuXG5cdFx0aWYgKGVudHJ5LnVzZXMgPj0gY29tbWFuZC5yYXRlbGltaXQpIHtcblx0XHRcdGNvbnN0IGVuZCA9IHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF0uZW5kO1xuXHRcdFx0Y29uc3QgZGlmZiA9IGVuZCAtIG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcDtcblxuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPT0xET1dOLCBtZXNzYWdlLCBjb21tYW5kLCBkaWZmKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGVudHJ5LnVzZXMrKztcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBhIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSBhcmdzIC0gQXJndW1lbnRzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW5Db21tYW5kKG1lc3NhZ2U6IE1lc3NhZ2UsIGNvbW1hbmQ6IENvbW1hbmQsIGFyZ3M6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICghY29tbWFuZCB8fCAhbWVzc2FnZSkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfSU5WQUxJRCwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChjb21tYW5kLnR5cGluZyB8fCB0aGlzLnR5cGluZykge1xuXHRcdFx0bWVzc2FnZS5jaGFubmVsLnNlbmRUeXBpbmcoKTtcblx0XHR9XG5cblx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9TVEFSVEVELCBtZXNzYWdlLCBjb21tYW5kLCBhcmdzKTtcblx0XHRjb25zdCByZXQgPSBhd2FpdCBjb21tYW5kLmV4ZWMobWVzc2FnZSwgYXJncyk7XG5cdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfRklOSVNIRUQsIG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MsIHJldCk7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBjb21tYW5kIGFuZCBpdHMgYXJndW1lbnQgbGlzdC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHBhcnNlQ29tbWFuZChtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSk6IFByb21pc2U8UGFyc2VkQ29tcG9uZW50RGF0YT4ge1xuXHRcdGNvbnN0IGFsbG93TWVudGlvbiA9IGF3YWl0IFV0aWwuaW50b0NhbGxhYmxlKHRoaXMucHJlZml4KShtZXNzYWdlKTtcblx0XHRsZXQgcHJlZml4ZXMgPSBVdGlsLmludG9BcnJheShhbGxvd01lbnRpb24pO1xuXHRcdGlmIChhbGxvd01lbnRpb24pIHtcblx0XHRcdGNvbnN0IG1lbnRpb25zID0gW2A8QCR7dGhpcy5jbGllbnQudXNlcj8uaWR9PmAsIGA8QCEke3RoaXMuY2xpZW50LnVzZXI/LmlkfT5gXTtcblx0XHRcdHByZWZpeGVzID0gWy4uLm1lbnRpb25zLCAuLi5wcmVmaXhlc107XG5cdFx0fVxuXG5cdFx0cHJlZml4ZXMuc29ydChVdGlsLnByZWZpeENvbXBhcmUpO1xuXHRcdHJldHVybiB0aGlzLnBhcnNlTXVsdGlwbGVQcmVmaXhlcyhcblx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRwcmVmaXhlcy5tYXAocCA9PiBbcCwgbnVsbF0pXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIGNvbW1hbmQgYW5kIGl0cyBhcmd1bWVudCBsaXN0IHVzaW5nIHByZWZpeCBvdmVyd3JpdGVzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcGFyc2VDb21tYW5kT3ZlcndyaXR0ZW5QcmVmaXhlcyhtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSk6IFByb21pc2U8UGFyc2VkQ29tcG9uZW50RGF0YT4ge1xuXHRcdGlmICghdGhpcy5wcmVmaXhlcy5zaXplKSB7XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSB0aGlzLnByZWZpeGVzLm1hcChhc3luYyAoY21kcywgcHJvdmlkZXIpID0+IHtcblx0XHRcdGNvbnN0IHByZWZpeGVzID0gVXRpbC5pbnRvQXJyYXkoYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUocHJvdmlkZXIpKG1lc3NhZ2UpKTtcblx0XHRcdHJldHVybiBwcmVmaXhlcy5tYXAocCA9PiBbcCwgY21kc10pO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgcGFpcnMgPSBVdGlsLmZsYXRNYXAoYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpLCB4ID0+IHgpO1xuXHRcdHBhaXJzLnNvcnQoKFthXSwgW2JdKSA9PiBVdGlsLnByZWZpeENvbXBhcmUoYSwgYikpO1xuXHRcdHJldHVybiB0aGlzLnBhcnNlTXVsdGlwbGVQcmVmaXhlcyhtZXNzYWdlLCBwYWlycyk7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBwYXJzZVdpdGhQcmVmaXggb24gbXVsdGlwbGUgcHJlZml4ZXMgYW5kIHJldHVybnMgdGhlIGJlc3QgcGFyc2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBwYXJzZS5cblx0ICogQHBhcmFtIHBhaXJzIC0gUGFpcnMgb2YgcHJlZml4IHRvIGFzc29jaWF0ZWQgY29tbWFuZHMuIFRoYXQgaXMsIGBbc3RyaW5nLCBTZXQ8c3RyaW5nPiB8IG51bGxdW11gLlxuXHQgKi9cblx0cHVibGljIHBhcnNlTXVsdGlwbGVQcmVmaXhlcyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRwYWlyczogW3N0cmluZywgU2V0PHN0cmluZz4gfCBudWxsXVtdXG5cdCk6IFBhcnNlZENvbXBvbmVudERhdGEge1xuXHRcdGNvbnN0IHBhcnNlcyA9IHBhaXJzLm1hcCgoW3ByZWZpeCwgY21kc10pID0+IHRoaXMucGFyc2VXaXRoUHJlZml4KG1lc3NhZ2UsIHByZWZpeCwgY21kcykpO1xuXHRcdGNvbnN0IHJlc3VsdCA9IHBhcnNlcy5maW5kKHBhcnNlZCA9PiBwYXJzZWQuY29tbWFuZCk7XG5cdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHRjb25zdCBndWVzcyA9IHBhcnNlcy5maW5kKHBhcnNlZCA9PiBwYXJzZWQucHJlZml4ICE9IG51bGwpO1xuXHRcdGlmIChndWVzcykge1xuXHRcdFx0cmV0dXJuIGd1ZXNzO1xuXHRcdH1cblxuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmllcyB0byBwYXJzZSBhIG1lc3NhZ2Ugd2l0aCB0aGUgZ2l2ZW4gcHJlZml4IGFuZCBhc3NvY2lhdGVkIGNvbW1hbmRzLlxuXHQgKiBBc3NvY2lhdGVkIGNvbW1hbmRzIHJlZmVyIHRvIHdoZW4gYSBwcmVmaXggaXMgdXNlZCBpbiBwcmVmaXggb3ZlcnJpZGVzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gcGFyc2UuXG5cdCAqIEBwYXJhbSBwcmVmaXggLSBQcmVmaXggdG8gdXNlLlxuXHQgKiBAcGFyYW0gYXNzb2NpYXRlZENvbW1hbmRzIC0gQXNzb2NpYXRlZCBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBwYXJzZVdpdGhQcmVmaXgoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsXG5cdFx0cHJlZml4OiBzdHJpbmcsXG5cdFx0YXNzb2NpYXRlZENvbW1hbmRzOiBTZXQ8c3RyaW5nPiB8IG51bGwgPSBudWxsXG5cdCk6IFBhcnNlZENvbXBvbmVudERhdGEge1xuXHRcdGNvbnN0IGxvd2VyQ29udGVudCA9IG1lc3NhZ2UuY29udGVudC50b0xvd2VyQ2FzZSgpO1xuXHRcdGlmICghbG93ZXJDb250ZW50LnN0YXJ0c1dpdGgocHJlZml4LnRvTG93ZXJDYXNlKCkpKSB7XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fVxuXG5cdFx0Y29uc3QgZW5kT2ZQcmVmaXggPSBsb3dlckNvbnRlbnQuaW5kZXhPZihwcmVmaXgudG9Mb3dlckNhc2UoKSkgKyBwcmVmaXgubGVuZ3RoO1xuXHRcdGNvbnN0IHN0YXJ0T2ZBcmdzID0gbWVzc2FnZS5jb250ZW50LnNsaWNlKGVuZE9mUHJlZml4KS5zZWFyY2goL1xcUy8pICsgcHJlZml4Lmxlbmd0aDtcblx0XHRjb25zdCBhbGlhcyA9IG1lc3NhZ2UuY29udGVudC5zbGljZShzdGFydE9mQXJncykuc3BsaXQoL1xcc3sxLH18XFxuezEsfS8pWzBdO1xuXHRcdGNvbnN0IGNvbW1hbmQgPSB0aGlzLmZpbmRDb21tYW5kKGFsaWFzKTtcblx0XHRjb25zdCBjb250ZW50ID0gbWVzc2FnZS5jb250ZW50LnNsaWNlKHN0YXJ0T2ZBcmdzICsgYWxpYXMubGVuZ3RoICsgMSkudHJpbSgpO1xuXHRcdGNvbnN0IGFmdGVyUHJlZml4ID0gbWVzc2FnZS5jb250ZW50LnNsaWNlKHByZWZpeC5sZW5ndGgpLnRyaW0oKTtcblxuXHRcdGlmICghY29tbWFuZCkge1xuXHRcdFx0cmV0dXJuIHsgcHJlZml4LCBhbGlhcywgY29udGVudCwgYWZ0ZXJQcmVmaXggfTtcblx0XHR9XG5cblx0XHRpZiAoYXNzb2NpYXRlZENvbW1hbmRzID09IG51bGwpIHtcblx0XHRcdGlmIChjb21tYW5kLnByZWZpeCAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiB7IHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghYXNzb2NpYXRlZENvbW1hbmRzLmhhcyhjb21tYW5kLmlkKSkge1xuXHRcdFx0cmV0dXJuIHsgcHJlZml4LCBhbGlhcywgY29udGVudCwgYWZ0ZXJQcmVmaXggfTtcblx0XHR9XG5cblx0XHRyZXR1cm4geyBjb21tYW5kLCBwcmVmaXgsIGFsaWFzLCBjb250ZW50LCBhZnRlclByZWZpeCB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgZXJyb3JzIGZyb20gdGhlIGhhbmRsaW5nLlxuXHQgKiBAcGFyYW0gZXJyIC0gVGhlIGVycm9yLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0aGF0IGVycm9yZWQuXG5cdCAqL1xuXHRwdWJsaWMgZW1pdEVycm9yKGVycjogRXJyb3IsIG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLCBjb21tYW5kPzogQ29tbWFuZCB8IEFrYWlyb01vZHVsZSk6IHZvaWQge1xuXHRcdGlmICh0aGlzLmxpc3RlbmVyQ291bnQoQ29tbWFuZEhhbmRsZXJFdmVudHMuRVJST1IpKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuRVJST1IsIGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhyb3cgZXJyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN3ZWVwIGNvbW1hbmQgdXRpbCBpbnN0YW5jZXMgZnJvbSBjYWNoZSBhbmQgcmV0dXJucyBhbW91bnQgc3dlZXBlZC5cblx0ICogQHBhcmFtIGxpZmV0aW1lIC0gTWVzc2FnZXMgb2xkZXIgdGhhbiB0aGlzIHdpbGwgaGF2ZSB0aGVpciBjb21tYW5kIHV0aWwgaW5zdGFuY2Ugc3dlZXBlZC4gVGhpcyBpcyBpbiBtaWxsaXNlY29uZHMgYW5kIGRlZmF1bHRzIHRvIHRoZSBgY29tbWFuZFV0aWxMaWZldGltZWAgb3B0aW9uLlxuXHQgKi9cblx0cHVibGljIHN3ZWVwQ29tbWFuZFV0aWwobGlmZXRpbWU6IG51bWJlciA9IHRoaXMuY29tbWFuZFV0aWxMaWZldGltZSk6IG51bWJlciB7XG5cdFx0bGV0IGNvdW50ID0gMDtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmRVdGlsIG9mIHRoaXMuY29tbWFuZFV0aWxzLnZhbHVlcygpKSB7XG5cdFx0XHRjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXHRcdFx0Y29uc3QgbWVzc2FnZSA9IGNvbW1hbmRVdGlsLm1lc3NhZ2U7XG5cdFx0XHRpZiAobm93IC0gKChtZXNzYWdlIGFzIE1lc3NhZ2UpLmVkaXRlZFRpbWVzdGFtcCB8fCBtZXNzYWdlLmNyZWF0ZWRUaW1lc3RhbXApID4gbGlmZXRpbWUpIHtcblx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0dGhpcy5jb21tYW5kVXRpbHMuZGVsZXRlKG1lc3NhZ2UuaWQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjb3VudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIG9uZ29pbmcgcHJvbXB0IGluIG9yZGVyIHRvIHByZXZlbnQgY29tbWFuZCB1c2FnZSBpbiB0aGUgY2hhbm5lbC5cblx0ICogQHBhcmFtIGNoYW5uZWwgLSBDaGFubmVsIHRvIGFkZCB0by5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIGFkZC5cblx0ICovXG5cdHB1YmxpYyBhZGRQcm9tcHQoY2hhbm5lbDogVGV4dEJhc2VkQ2hhbm5lbHMsIHVzZXI6IFVzZXIpOiB2b2lkIHtcblx0XHRsZXQgdXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdGlmICghdXNlcnMpIHRoaXMucHJvbXB0cy5zZXQoY2hhbm5lbC5pZCwgbmV3IFNldCgpKTtcblx0XHR1c2VycyA9IHRoaXMucHJvbXB0cy5nZXQoY2hhbm5lbC5pZCk7XG5cdFx0dXNlcnM/LmFkZCh1c2VyLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFuIG9uZ29pbmcgcHJvbXB0LlxuXHQgKiBAcGFyYW0gY2hhbm5lbCAtIENoYW5uZWwgdG8gcmVtb3ZlIGZyb20uXG5cdCAqIEBwYXJhbSB1c2VyIC0gVXNlciB0byByZW1vdmUuXG5cdCAqL1xuXHRwdWJsaWMgcmVtb3ZlUHJvbXB0KGNoYW5uZWw6IFRleHRCYXNlZENoYW5uZWxzLCB1c2VyOiBVc2VyKTogdm9pZCB7XG5cdFx0Y29uc3QgdXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdGlmICghdXNlcnMpIHJldHVybjtcblx0XHR1c2Vycy5kZWxldGUodXNlci5pZCk7XG5cdFx0aWYgKCF1c2Vycy5zaXplKSB0aGlzLnByb21wdHMuZGVsZXRlKHVzZXIuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGVyZSBpcyBhbiBvbmdvaW5nIHByb21wdC5cblx0ICogQHBhcmFtIGNoYW5uZWwgLSBDaGFubmVsIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0gdXNlciAtIFVzZXIgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgaGFzUHJvbXB0KGNoYW5uZWw6IFRleHRCYXNlZENoYW5uZWxzLCB1c2VyOiBVc2VyKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgdXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdGlmICghdXNlcnMpIHJldHVybiBmYWxzZTtcblx0XHRyZXR1cm4gdXNlcnMuaGFzKHVzZXIuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY29tbWFuZCBieSBhbGlhcy5cblx0ICogQHBhcmFtIG5hbWUgLSBBbGlhcyB0byBmaW5kIHdpdGguXG5cdCAqL1xuXHRwdWJsaWMgZmluZENvbW1hbmQobmFtZTogc3RyaW5nKTogQ29tbWFuZCB7XG5cdFx0cmV0dXJuIHRoaXMubW9kdWxlcy5nZXQodGhpcy5hbGlhc2VzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGluaGliaXRvciBoYW5kbGVyIHRvIHVzZS5cblx0ICogQHBhcmFtIGluaGliaXRvckhhbmRsZXIgLSBUaGUgaW5oaWJpdG9yIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgdXNlSW5oaWJpdG9ySGFuZGxlcihpbmhpYml0b3JIYW5kbGVyOiBJbmhpYml0b3JIYW5kbGVyKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHRoaXMuaW5oaWJpdG9ySGFuZGxlciA9IGluaGliaXRvckhhbmRsZXI7XG5cdFx0dGhpcy5yZXNvbHZlci5pbmhpYml0b3JIYW5kbGVyID0gaW5oaWJpdG9ySGFuZGxlcjtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgbGlzdGVuZXIgaGFuZGxlciB0byB1c2UuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lckhhbmRsZXIgLSBUaGUgbGlzdGVuZXIgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyB1c2VMaXN0ZW5lckhhbmRsZXIobGlzdGVuZXJIYW5kbGVyOiBMaXN0ZW5lckhhbmRsZXIpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0dGhpcy5yZXNvbHZlci5saXN0ZW5lckhhbmRsZXIgPSBsaXN0ZW5lckhhbmRsZXI7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkKHRoaW5nOiBzdHJpbmcgfCBDb21tYW5kKTogQ29tbWFuZCB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWQodGhpbmcpIGFzIENvbW1hbmQ7XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIGNvbW1hbmRzIGZyb20gdGhlIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkQWxsKGRpcmVjdG9yeT86IHN0cmluZywgZmlsdGVyPzogTG9hZFByZWRpY2F0ZSk6IENvbW1hbmRIYW5kbGVyIHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZEFsbChkaXJlY3RvcnksIGZpbHRlcikgYXMgQ29tbWFuZEhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZShpZDogc3RyaW5nKTogQ29tbWFuZCB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZShpZCkgYXMgQ29tbWFuZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmVBbGwoKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmVBbGwoKSBhcyBDb21tYW5kSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkKGlkOiBzdHJpbmcpOiBDb21tYW5kIHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkKGlkKSBhcyBDb21tYW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZEFsbCgpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZEFsbCgpIGFzIENvbW1hbmRIYW5kbGVyO1xuXHR9XG5cblx0cHVibGljIG92ZXJyaWRlIG9uPEsgZXh0ZW5kcyBrZXlvZiBDb21tYW5kSGFuZGxlckV2ZW50c1R5cGU+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogQ29tbWFuZEhhbmRsZXJFdmVudHNUeXBlW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cblx0cHVibGljIG92ZXJyaWRlIG9uY2U8SyBleHRlbmRzIGtleW9mIENvbW1hbmRIYW5kbGVyRXZlbnRzVHlwZT4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBDb21tYW5kSGFuZGxlckV2ZW50c1R5cGVbS11bXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub25jZShldmVudCwgbGlzdGVuZXIpO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWFuZEhhbmRsZXJPcHRpb25zIGV4dGVuZHMgQWthaXJvSGFuZGxlck9wdGlvbnMge1xuXHQvKipcblx0ICogUmVndWxhciBleHByZXNzaW9uIHRvIGF1dG9tYXRpY2FsbHkgbWFrZSBjb21tYW5kIGFsaWFzZXMuXG5cdCAqIEZvciBleGFtcGxlLCB1c2luZyBgLy0vZ2Agd291bGQgbWVhbiB0aGF0IGFsaWFzZXMgY29udGFpbmluZyBgLWAgd291bGQgYmUgdmFsaWQgd2l0aCBhbmQgd2l0aG91dCBpdC5cblx0ICogU28sIHRoZSBhbGlhcyBgY29tbWFuZC1uYW1lYCBpcyB2YWxpZCBhcyBib3RoIGBjb21tYW5kLW5hbWVgIGFuZCBgY29tbWFuZG5hbWVgLlxuXHQgKi9cblx0YWxpYXNSZXBsYWNlbWVudD86IFJlZ0V4cDtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYWxsb3cgbWVudGlvbnMgdG8gdGhlIGNsaWVudCB1c2VyIGFzIGEgcHJlZml4LlxuXHQgKi9cblx0YWxsb3dNZW50aW9uPzogYm9vbGVhbiB8IE1lbnRpb25QcmVmaXhQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgYXJndW1lbnQgb3B0aW9ucy5cblx0ICovXG5cdGFyZ3VtZW50RGVmYXVsdHM/OiBEZWZhdWx0QXJndW1lbnRPcHRpb25zO1xuXG5cdC8qKlxuXHQgKiBBdXRvbWF0aWNhbGx5IGRlZmVyIG1lc3NhZ2VzIFwiQm90TmFtZSBpcyB0aGlua2luZ1wiXG5cdCAqL1xuXHRhdXRvRGVmZXI/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZ5IHdoZXRoZXIgdG8gcmVnaXN0ZXIgYWxsIHNsYXNoIGNvbW1hbmRzIHdoZW4gc3RhcnRpbmcgdGhlIGNsaWVudC5cblx0ICovXG5cdGF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBib3RzLlxuXHQgKi9cblx0YmxvY2tCb3RzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYmxvY2sgc2VsZi5cblx0ICovXG5cdGJsb2NrQ2xpZW50PzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYXNzaWduIGBtZXNzYWdlLnV0aWxgLlxuXHQgKi9cblx0Y29tbWFuZFV0aWw/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBNaWxsaXNlY29uZHMgYSBtZXNzYWdlIHNob3VsZCBleGlzdCBmb3IgYmVmb3JlIGl0cyBjb21tYW5kIHV0aWwgaW5zdGFuY2UgaXMgbWFya2VkIGZvciByZW1vdmFsLlxuXHQgKiBJZiAwLCBDb21tYW5kVXRpbCBpbnN0YW5jZXMgd2lsbCBuZXZlciBiZSByZW1vdmVkIGFuZCB3aWxsIGNhdXNlIG1lbW9yeSB0byBpbmNyZWFzZSBpbmRlZmluaXRlbHkuXG5cdCAqL1xuXHRjb21tYW5kVXRpbExpZmV0aW1lPzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaW1lIGludGVydmFsIGluIG1pbGxpc2Vjb25kcyBmb3Igc3dlZXBpbmcgY29tbWFuZCB1dGlsIGluc3RhbmNlcy5cblx0ICogSWYgMCwgQ29tbWFuZFV0aWwgaW5zdGFuY2VzIHdpbGwgbmV2ZXIgYmUgcmVtb3ZlZCBhbmQgd2lsbCBjYXVzZSBtZW1vcnkgdG8gaW5jcmVhc2UgaW5kZWZpbml0ZWx5LlxuXHQgKi9cblx0Y29tbWFuZFV0aWxTd2VlcEludGVydmFsPzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IGNvb2xkb3duIGZvciBjb21tYW5kcy5cblx0ICovXG5cdGRlZmF1bHRDb29sZG93bj86IG51bWJlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgbWVtYmVycyBhcmUgZmV0Y2hlZCBvbiBlYWNoIG1lc3NhZ2UgYXV0aG9yIGZyb20gYSBndWlsZC5cblx0ICovXG5cdGZldGNoTWVtYmVycz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGhhbmRsZSBlZGl0ZWQgbWVzc2FnZXMgdXNpbmcgQ29tbWFuZFV0aWwuXG5cdCAqL1xuXHRoYW5kbGVFZGl0cz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGNvb2xkb3duIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLiBEZWZhdWx0cyB0byB0aGUgY2xpZW50IG93bmVyKHMpLlxuXHQgKi9cblx0aWdub3JlQ29vbGRvd24/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBgdXNlclBlcm1pc3Npb25zYCBjaGVja3Mgb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuXG5cdCAqL1xuXHRpZ25vcmVQZXJtaXNzaW9ucz86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIFRoZSBwcmVmaXgoZXMpIGZvciBjb21tYW5kIHBhcnNpbmcuXG5cdCAqL1xuXHRwcmVmaXg/OiBzdHJpbmcgfCBzdHJpbmdbXSB8IFByZWZpeFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBzdG9yZSBtZXNzYWdlcyBpbiBDb21tYW5kVXRpbC5cblx0ICovXG5cdHN0b3JlTWVzc2FnZXM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTaG93IFwiQm90TmFtZSBpcyB0eXBpbmdcIiBpbmZvcm1hdGlvbiBtZXNzYWdlIG9uIHRoZSB0ZXh0IGNoYW5uZWxzIHdoZW4gYSBjb21tYW5kIGlzIHJ1bm5pbmcuXG5cdCAqL1xuXHR0eXBpbmc/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byB1c2UgZXhlY1NsYXNoIGZvciBzbGFzaCBjb21tYW5kcy5cblx0ICovXG5cdGV4ZWNTbGFzaD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHNraXAgYnVpbHQgaW4gcmVhc29ucyBwb3N0IHR5cGUgaW5oaWJpdG9ycyBzbyB5b3UgY2FuIG1ha2UgY3VzdG9tIG9uZXMuXG5cdCAqL1xuXHRza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEYXRhIGZvciBtYW5hZ2luZyBjb29sZG93bnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29vbGRvd25EYXRhIHtcblx0LyoqXG5cdCAqIFdoZW4gdGhlIGNvb2xkb3duIGVuZHMuXG5cdCAqL1xuXHRlbmQ6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGltZW91dCBvYmplY3QuXG5cdCAqL1xuXHR0aW1lcjogTm9kZUpTLlRpbWVyO1xuXG5cdC8qKlxuXHQgKiBOdW1iZXIgb2YgdGltZXMgdGhlIGNvbW1hbmQgaGFzIGJlZW4gdXNlZC5cblx0ICovXG5cdHVzZXM6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBWYXJpb3VzIHBhcnNlZCBjb21wb25lbnRzIG9mIHRoZSBtZXNzYWdlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZENvbXBvbmVudERhdGEge1xuXHQvKipcblx0ICogVGhlIGNvbnRlbnQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBwcmVmaXguXG5cdCAqL1xuXHRhZnRlclByZWZpeD86IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGFsaWFzIHVzZWQuXG5cdCAqL1xuXHRhbGlhcz86IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgdXNlZC5cblx0ICovXG5cdGNvbW1hbmQ/OiBDb21tYW5kO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29udGVudCB0byB0aGUgcmlnaHQgb2YgdGhlIGFsaWFzLlxuXHQgKi9cblx0Y29udGVudD86IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIHByZWZpeCB1c2VkLlxuXHQgKi9cblx0cHJlZml4Pzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHdoZXRoZXIgdGhpcyBtZXNzYWdlIHNob3VsZCBiZSBpZ25vcmVkIGZvciBhIGNlcnRhaW4gY2hlY2suXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gY2hlY2suXG4gKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gY2hlY2suXG4gKi9cbmV4cG9ydCB0eXBlIElnbm9yZUNoZWNrUHJlZGljYXRlID0gKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLCBjb21tYW5kOiBDb21tYW5kKSA9PiBib29sZWFuO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHdoZXRoZXIgbWVudGlvbnMgY2FuIGJlIHVzZWQgYXMgYSBwcmVmaXguXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gb3B0aW9uIGZvci5cbiAqL1xuZXhwb3J0IHR5cGUgTWVudGlvblByZWZpeFByZWRpY2F0ZSA9IChtZXNzYWdlOiBNZXNzYWdlKSA9PiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgcHJlZml4KGVzKSB0byB1c2UuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gZ2V0IHByZWZpeCBmb3IuXG4gKi9cbmV4cG9ydCB0eXBlIFByZWZpeFN1cHBsaWVyID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IHN0cmluZyB8IHN0cmluZ1tdIHwgUHJvbWlzZTxzdHJpbmcgfCBzdHJpbmdbXT47XG4iXX0=