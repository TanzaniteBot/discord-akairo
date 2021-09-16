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
        this.useSlashPermissions = !!useSlashPermissions;
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
        const globalCommands = (await this.client.application?.commands.fetch())?.filter(value => !!this.modules.find(mod => mod.aliases[0] === value.name));
        const fullPermissions = globalCommands
            ?.filter(value => !value.defaultPermission)
            .filter(value => !!this.modules.find(mod => mod.aliases[0] === value.name))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBYW9CO0FBRXBCLG9EQUF1QjtBQUV2Qix5RUFBaUQ7QUFDakQsNkVBQXFEO0FBRXJELG9EQUE0RTtBQUM1RSwyREFBbUM7QUFFbkMscUVBQXNGO0FBRXRGLGlIQUF5RjtBQUl6Riw0RUFBb0Q7QUFDcEQsd0RBQWlEO0FBQ2pELGdFQUF3QztBQUN4QyxrREFBMEI7QUFFMUI7Ozs7R0FJRztBQUNILE1BQXFCLGNBQWUsU0FBUSx1QkFBYTtJQUN4RCxZQUNDLE1BQW9CLEVBQ3BCLEVBQ0MsU0FBUyxFQUNULGFBQWEsR0FBRyxpQkFBTyxFQUN2QixVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQzNCLGtCQUFrQixFQUNsQixVQUFVLEVBQ1YsV0FBVyxHQUFHLElBQUksRUFDbEIsU0FBUyxHQUFHLElBQUksRUFDaEIsWUFBWSxHQUFHLEtBQUssRUFDcEIsV0FBVyxHQUFHLEtBQUssRUFDbkIsYUFBYSxHQUFHLEtBQUssRUFDckIsV0FBVyxFQUNYLG1CQUFtQixHQUFHLEdBQUcsRUFDekIsd0JBQXdCLEdBQUcsR0FBRyxFQUM5QixlQUFlLEdBQUcsQ0FBQyxFQUNuQixjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFDL0IsaUJBQWlCLEdBQUcsRUFBRSxFQUN0QixnQkFBZ0IsR0FBRyxFQUFFLEVBQ3JCLE1BQU0sR0FBRyxHQUFHLEVBQ1osWUFBWSxHQUFHLElBQUksRUFDbkIsZ0JBQWdCLEVBQ2hCLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLE1BQU0sR0FBRyxLQUFLLEVBQ2QseUJBQXlCLEdBQUcsS0FBSyxFQUNqQyxTQUFTLEdBQUcsS0FBSyxFQUNqQix5QkFBeUIsR0FBRyxLQUFLLEVBQ2pDLG1CQUFtQixHQUFH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b0IsQ0FBQztJQUM1QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ2EsTUFBTSxDQUFDLEVBQVU7UUFDaEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBcUIsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7O09BRUc7SUFDYSxTQUFTO1FBQ3hCLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBNkIsQ0FBQztJQUNyRCxDQUFDO0lBRWUsRUFBRSxDQUNqQixLQUFRLEVBQ1IsUUFBbUU7UUFFbkUsT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQ2UsSUFBSSxDQUNuQixLQUFRLEVBQ1IsUUFBbUU7UUFFbkUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQ0Q7QUE5N0NELGlDQTg3Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRBcHBsaWNhdGlvbkNvbW1hbmQsXG5cdEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkRhdGEsXG5cdEF3YWl0ZWQsXG5cdENvbGxlY3Rpb24sXG5cdENvbW1hbmRJbnRlcmFjdGlvbixcblx0R3VpbGRBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uRGF0YSxcblx0R3VpbGRSZXNvbHZhYmxlLFxuXHRNZXNzYWdlLFxuXHRTbm93Zmxha2UsXG5cdFRleHRCYXNlZENoYW5uZWxzLFxuXHRUZXh0Q2hhbm5lbCxcblx0VXNlclxufSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZXMgfSBmcm9tIFwiZGlzY29yZC5qcy90eXBpbmdzL2VudW1zXCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBDb21tYW5kSGFuZGxlckV2ZW50cyBhcyBDb21tYW5kSGFuZGxlckV2ZW50c1R5cGUgfSBmcm9tIFwiLi4vLi4vdHlwaW5ncy9ldmVudHNcIjtcbmltcG9ydCBBa2Fpcm9FcnJvciBmcm9tIFwiLi4vLi4vdXRpbC9Ba2Fpcm9FcnJvclwiO1xuaW1wb3J0IEFrYWlyb01lc3NhZ2UgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvTWVzc2FnZVwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgeyBCdWlsdEluUmVhc29ucywgQ29tbWFuZEhhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBVdGlsIGZyb20gXCIuLi8uLi91dGlsL1V0aWxcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IEFrYWlyb0hhbmRsZXIsIHsgQWthaXJvSGFuZGxlck9wdGlvbnMsIExvYWRQcmVkaWNhdGUgfSBmcm9tIFwiLi4vQWthaXJvSGFuZGxlclwiO1xuaW1wb3J0IEFrYWlyb01vZHVsZSBmcm9tIFwiLi4vQWthaXJvTW9kdWxlXCI7XG5pbXBvcnQgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciBmcm9tIFwiLi4vY29udGV4dE1lbnVDb21tYW5kcy9Db250ZXh0TWVudUNvbW1hbmRIYW5kbGVyXCI7XG5pbXBvcnQgSW5oaWJpdG9ySGFuZGxlciBmcm9tIFwiLi4vaW5oaWJpdG9ycy9JbmhpYml0b3JIYW5kbGVyXCI7XG5pbXBvcnQgTGlzdGVuZXJIYW5kbGVyIGZyb20gXCIuLi9saXN0ZW5lcnMvTGlzdGVuZXJIYW5kbGVyXCI7XG5pbXBvcnQgeyBEZWZhdWx0QXJndW1lbnRPcHRpb25zIH0gZnJvbSBcIi4vYXJndW1lbnRzL0FyZ3VtZW50XCI7XG5pbXBvcnQgVHlwZVJlc29sdmVyIGZyb20gXCIuL2FyZ3VtZW50cy9UeXBlUmVzb2x2ZXJcIjtcbmltcG9ydCBDb21tYW5kLCB7IEtleVN1cHBsaWVyIH0gZnJvbSBcIi4vQ29tbWFuZFwiO1xuaW1wb3J0IENvbW1hbmRVdGlsIGZyb20gXCIuL0NvbW1hbmRVdGlsXCI7XG5pbXBvcnQgRmxhZyBmcm9tIFwiLi9GbGFnXCI7XG5cbi8qKlxuICogTG9hZHMgY29tbWFuZHMgYW5kIGhhbmRsZXMgbWVzc2FnZXMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRIYW5kbGVyIGV4dGVuZHMgQWthaXJvSGFuZGxlciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQ29tbWFuZCxcblx0XHRcdGV4dGVuc2lvbnMgPSBbXCIuanNcIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyLFxuXHRcdFx0YmxvY2tDbGllbnQgPSB0cnVlLFxuXHRcdFx0YmxvY2tCb3RzID0gdHJ1ZSxcblx0XHRcdGZldGNoTWVtYmVycyA9IGZhbHNlLFxuXHRcdFx0aGFuZGxlRWRpdHMgPSBmYWxzZSxcblx0XHRcdHN0b3JlTWVzc2FnZXMgPSBmYWxzZSxcblx0XHRcdGNvbW1hbmRVdGlsLFxuXHRcdFx0Y29tbWFuZFV0aWxMaWZldGltZSA9IDNlNSxcblx0XHRcdGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA9IDNlNSxcblx0XHRcdGRlZmF1bHRDb29sZG93biA9IDAsXG5cdFx0XHRpZ25vcmVDb29sZG93biA9IGNsaWVudC5vd25lcklELFxuXHRcdFx0aWdub3JlUGVybWlzc2lvbnMgPSBbXSxcblx0XHRcdGFyZ3VtZW50RGVmYXVsdHMgPSB7fSxcblx0XHRcdHByZWZpeCA9IFwiIVwiLFxuXHRcdFx0YWxsb3dNZW50aW9uID0gdHJ1ZSxcblx0XHRcdGFsaWFzUmVwbGFjZW1lbnQsXG5cdFx0XHRhdXRvRGVmZXIgPSBmYWxzZSxcblx0XHRcdHR5cGluZyA9IGZhbHNlLFxuXHRcdFx0YXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcyA9IGZhbHNlLFxuXHRcdFx0ZXhlY1NsYXNoID0gZmFsc2UsXG5cdFx0XHRza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzID0gZmFsc2UsXG5cdFx0XHR1c2VTbGFzaFBlcm1pc3Npb25zID0gZmFsc2Vcblx0XHR9OiBDb21tYW5kSGFuZGxlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHRpZiAoIShjbGFzc1RvSGFuZGxlLnByb3RvdHlwZSBpbnN0YW5jZW9mIENvbW1hbmQgfHwgY2xhc3NUb0hhbmRsZSA9PT0gQ29tbWFuZCkpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsIGNsYXNzVG9IYW5kbGUubmFtZSwgQ29tbWFuZC5uYW1lKTtcblx0XHR9XG5cblx0XHRzdXBlcihjbGllbnQsIHtcblx0XHRcdGRpcmVjdG9yeSxcblx0XHRcdGNsYXNzVG9IYW5kbGUsXG5cdFx0XHRleHRlbnNpb25zLFxuXHRcdFx0YXV0b21hdGVDYXRlZ29yaWVzLFxuXHRcdFx0bG9hZEZpbHRlclxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzID0gYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcztcblxuXHRcdHRoaXMudHlwaW5nID0gdHlwaW5nO1xuXG5cdFx0dGhpcy5hdXRvRGVmZXIgPSBhdXRvRGVmZXI7XG5cblx0XHR0aGlzLnJlc29sdmVyID0gbmV3IFR5cGVSZXNvbHZlcih0aGlzKTtcblxuXHRcdHRoaXMuYWxpYXNlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmFsaWFzUmVwbGFjZW1lbnQgPSBhbGlhc1JlcGxhY2VtZW50O1xuXG5cdFx0dGhpcy5wcmVmaXhlcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmJsb2NrQ2xpZW50ID0gISFibG9ja0NsaWVudDtcblxuXHRcdHRoaXMuYmxvY2tCb3RzID0gISFibG9ja0JvdHM7XG5cblx0XHR0aGlzLmZldGNoTWVtYmVycyA9ICEhZmV0Y2hNZW1iZXJzO1xuXG5cdFx0dGhpcy5oYW5kbGVFZGl0cyA9ICEhaGFuZGxlRWRpdHM7XG5cblx0XHR0aGlzLnN0b3JlTWVzc2FnZXMgPSAhIXN0b3JlTWVzc2FnZXM7XG5cblx0XHR0aGlzLmNvbW1hbmRVdGlsID0gISFjb21tYW5kVXRpbDtcblx0XHRpZiAoKHRoaXMuaGFuZGxlRWRpdHMgfHwgdGhpcy5zdG9yZU1lc3NhZ2VzKSAmJiAhdGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiQ09NTUFORF9VVElMX0VYUExJQ0lUXCIpO1xuXHRcdH1cblxuXHRcdHRoaXMuY29tbWFuZFV0aWxMaWZldGltZSA9IGNvbW1hbmRVdGlsTGlmZXRpbWU7XG5cblx0XHR0aGlzLmNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA9IGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbDtcblx0XHRpZiAodGhpcy5jb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWwgPiAwKSB7XG5cdFx0XHRzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLnN3ZWVwQ29tbWFuZFV0aWwoKSwgdGhpcy5jb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWwpLnVucmVmKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb21tYW5kVXRpbHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5jb29sZG93bnMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5kZWZhdWx0Q29vbGRvd24gPSBkZWZhdWx0Q29vbGRvd247XG5cblx0XHR0aGlzLmlnbm9yZUNvb2xkb3duID0gdHlwZW9mIGlnbm9yZUNvb2xkb3duID09PSBcImZ1bmN0aW9uXCIgPyBpZ25vcmVDb29sZG93bi5iaW5kKHRoaXMpIDogaWdub3JlQ29vbGRvd247XG5cblx0XHR0aGlzLmlnbm9yZVBlcm1pc3Npb25zID0gdHlwZW9mIGlnbm9yZVBlcm1pc3Npb25zID09PSBcImZ1bmN0aW9uXCIgPyBpZ25vcmVQZXJtaXNzaW9ucy5iaW5kKHRoaXMpIDogaWdub3JlUGVybWlzc2lvbnM7XG5cblx0XHR0aGlzLnByb21wdHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG5cdFx0dGhpcy5hcmd1bWVudERlZmF1bHRzID0gVXRpbC5kZWVwQXNzaWduKFxuXHRcdFx0e1xuXHRcdFx0XHRwcm9tcHQ6IHtcblx0XHRcdFx0XHRzdGFydDogXCJcIixcblx0XHRcdFx0XHRyZXRyeTogXCJcIixcblx0XHRcdFx0XHR0aW1lb3V0OiBcIlwiLFxuXHRcdFx0XHRcdGVuZGVkOiBcIlwiLFxuXHRcdFx0XHRcdGNhbmNlbDogXCJcIixcblx0XHRcdFx0XHRyZXRyaWVzOiAxLFxuXHRcdFx0XHRcdHRpbWU6IDMwMDAwLFxuXHRcdFx0XHRcdGNhbmNlbFdvcmQ6IFwiY2FuY2VsXCIsXG5cdFx0XHRcdFx0c3RvcFdvcmQ6IFwic3RvcFwiLFxuXHRcdFx0XHRcdG9wdGlvbmFsOiBmYWxzZSxcblx0XHRcdFx0XHRpbmZpbml0ZTogZmFsc2UsXG5cdFx0XHRcdFx0bGltaXQ6IEluZmluaXR5LFxuXHRcdFx0XHRcdGJyZWFrb3V0OiB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRhcmd1bWVudERlZmF1bHRzXG5cdFx0KTtcblxuXHRcdHRoaXMucHJlZml4ID0gdHlwZW9mIHByZWZpeCA9PT0gXCJmdW5jdGlvblwiID8gcHJlZml4LmJpbmQodGhpcykgOiBwcmVmaXg7XG5cblx0XHR0aGlzLmFsbG93TWVudGlvbiA9IHR5cGVvZiBhbGxvd01lbnRpb24gPT09IFwiZnVuY3Rpb25cIiA/IGFsbG93TWVudGlvbi5iaW5kKHRoaXMpIDogISFhbGxvd01lbnRpb247XG5cblx0XHR0aGlzLmluaGliaXRvckhhbmRsZXIgPSBudWxsO1xuXG5cdFx0dGhpcy5hdXRvRGVmZXIgPSAhIWF1dG9EZWZlcjtcblxuXHRcdHRoaXMuZXhlY1NsYXNoID0gISFleGVjU2xhc2g7XG5cblx0XHR0aGlzLnNraXBCdWlsdEluUG9zdEluaGliaXRvcnMgPSAhIXNraXBCdWlsdEluUG9zdEluaGliaXRvcnM7XG5cblx0XHR0aGlzLnVzZVNsYXNoUGVybWlzc2lvbnMgPSAhIXVzZVNsYXNoUGVybWlzc2lvbnM7XG5cblx0XHR0aGlzLnNldHVwKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ29sbGVjdGlvbiBvZiBjb21tYW5kIGFsaWFzZXMuXG5cdCAqL1xuXHRwdWJsaWMgYWxpYXNlczogQ29sbGVjdGlvbjxzdHJpbmcsIHN0cmluZz47XG5cblx0LyoqXG5cdCAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBhdXRvbWF0aWNhbGx5IG1ha2UgY29tbWFuZCBhbGlhc2VzIGZvci5cblx0ICovXG5cdHB1YmxpYyBhbGlhc1JlcGxhY2VtZW50PzogUmVnRXhwO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBtZW50aW9ucyBhcmUgYWxsb3dlZCBmb3IgcHJlZml4aW5nLlxuXHQgKi9cblx0cHVibGljIGFsbG93TWVudGlvbjogYm9vbGVhbiB8IE1lbnRpb25QcmVmaXhQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgYXJndW1lbnQgb3B0aW9ucy5cblx0ICovXG5cdHB1YmxpYyBhcmd1bWVudERlZmF1bHRzOiBEZWZhdWx0QXJndW1lbnRPcHRpb25zO1xuXG5cdC8qKlxuXHQgKiBBdXRvbWF0aWNhbGx5IGRlZmVyIG1lc3NhZ2VzIFwiQm90TmFtZSBpcyB0aGlua2luZ1wiLlxuXHQgKi9cblx0cHVibGljIGF1dG9EZWZlcjogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU3BlY2lmeSB3aGV0aGVyIHRvIHJlZ2lzdGVyIGFsbCBzbGFzaCBjb21tYW5kcyB3aGVuIHN0YXJ0aW5nIHRoZSBjbGllbnRcblx0ICovXG5cdHB1YmxpYyBhdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBib3RzLlxuXHQgKi9cblx0cHVibGljIGJsb2NrQm90czogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYmxvY2sgc2VsZi5cblx0ICovXG5cdHB1YmxpYyBibG9ja0NsaWVudDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ2F0ZWdvcmllcywgbWFwcGVkIGJ5IElEIHRvIENhdGVnb3J5LlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgQ29tbWFuZD4+O1xuXG5cdC8qKlxuXHQgKiBDbGFzcyB0byBoYW5kbGVcblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsYXNzVG9IYW5kbGU6IHR5cGVvZiBDb21tYW5kO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBkZWNsYXJlIGNsaWVudDogQWthaXJvQ2xpZW50O1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCBgbWVzc2FnZS51dGlsYCBpcyBhc3NpZ25lZC5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogTWlsbGlzZWNvbmRzIGEgbWVzc2FnZSBzaG91bGQgZXhpc3QgZm9yIGJlZm9yZSBpdHMgY29tbWFuZCB1dGlsIGluc3RhbmNlIGlzIG1hcmtlZCBmb3IgcmVtb3ZhbC5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbExpZmV0aW1lOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgQ29tbWFuZFV0aWxzLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmRVdGlsczogQ29sbGVjdGlvbjxzdHJpbmcsIENvbW1hbmRVdGlsPjtcblxuXHQvKipcblx0ICogVGltZSBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMgZm9yIHN3ZWVwaW5nIGNvbW1hbmQgdXRpbCBpbnN0YW5jZXMuXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZFV0aWxTd2VlcEludGVydmFsOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgY29vbGRvd25zLlxuXHQgKiA8aW5mbz5UaGUgZWxlbWVudHMgaW4gdGhlIGNvbGxlY3Rpb24gYXJlIG9iamVjdHMgd2l0aCB1c2VyIElEcyBhcyBrZXlzXG5cdCAqIGFuZCB7QGxpbmsgQ29vbGRvd25EYXRhfSBvYmplY3RzIGFzIHZhbHVlczwvaW5mbz5cblx0ICovXG5cdHB1YmxpYyBjb29sZG93bnM6IENvbGxlY3Rpb248c3RyaW5nLCB7IFtpZDogc3RyaW5nXTogQ29vbGRvd25EYXRhIH0+O1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IGNvb2xkb3duIGZvciBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBkZWZhdWx0Q29vbGRvd246IG51bWJlcjtcblxuXHQvKipcblx0ICogRGlyZWN0b3J5IHRvIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGRlY2xhcmUgZGlyZWN0b3J5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHVzZSBleGVjU2xhc2ggZm9yIHNsYXNoIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIGV4ZWNTbGFzaDogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgbWVtYmVycyBhcmUgZmV0Y2hlZCBvbiBlYWNoIG1lc3NhZ2UgYXV0aG9yIGZyb20gYSBndWlsZC5cblx0ICovXG5cdHB1YmxpYyBmZXRjaE1lbWJlcnM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IGVkaXRzIGFyZSBoYW5kbGVkLlxuXHQgKi9cblx0cHVibGljIGhhbmRsZUVkaXRzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBjb29sZG93biBvciBhIGZ1bmN0aW9uIHRvIGlnbm9yZS5cblx0ICovXG5cdHB1YmxpYyBpZ25vcmVDb29sZG93bjogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gfCBJZ25vcmVDaGVja1ByZWRpY2F0ZTtcblxuXHQvKipcblx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgYHVzZXJQZXJtaXNzaW9uc2AgY2hlY2tzIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLlxuXHQgKi9cblx0cHVibGljIGlnbm9yZVBlcm1pc3Npb25zOiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBJbmhpYml0b3IgaGFuZGxlciB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgaW5oaWJpdG9ySGFuZGxlcjogSW5oaWJpdG9ySGFuZGxlciB8IG51bGw7XG5cblx0LyoqXG5cdCAqIENvbW1hbmRzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIENvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVjbGFyZSBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ29tbWFuZD47XG5cblx0LyoqXG5cdCAqIFRoZSBwcmVmaXgoZXMpIGZvciBjb21tYW5kIHBhcnNpbmcuXG5cdCAqL1xuXHRwdWJsaWMgcHJlZml4OiBzdHJpbmcgfCBzdHJpbmdbXSB8IFByZWZpeFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBDb2xsZWN0aW9uIG9mIHByZWZpeCBvdmVyd3JpdGVzIHRvIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIHByZWZpeGVzOiBDb2xsZWN0aW9uPHN0cmluZyB8IFByZWZpeFN1cHBsaWVyLCBTZXQ8c3RyaW5nPj47XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2Ygc2V0cyBvZiBvbmdvaW5nIGFyZ3VtZW50IHByb21wdHMuXG5cdCAqL1xuXHRwdWJsaWMgcHJvbXB0czogQ29sbGVjdGlvbjxzdHJpbmcsIFNldDxzdHJpbmc+PjtcblxuXHQvKipcblx0ICogVGhlIHR5cGUgcmVzb2x2ZXIuXG5cdCAqL1xuXHRwdWJsaWMgcmVzb2x2ZXI6IFR5cGVSZXNvbHZlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc3RvcmUgbWVzc2FnZXMgaW4gQ29tbWFuZFV0aWwuXG5cdCAqL1xuXHRwdWJsaWMgc3RvcmVNZXNzYWdlczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU2hvdyBcIkJvdE5hbWUgaXMgdHlwaW5nXCIgaW5mb3JtYXRpb24gbWVzc2FnZSBvbiB0aGUgdGV4dCBjaGFubmVscyB3aGVuIGEgY29tbWFuZCBpcyBydW5uaW5nLlxuXHQgKi9cblx0cHVibGljIHR5cGluZzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gc2tpcCBidWlsdCBpbiByZWFzb25zIHBvc3QgdHlwZSBpbmhpYml0b3JzIHNvIHlvdSBjYW4gbWFrZSBjdXN0b20gb25lcy5cblx0ICovXG5cdHB1YmxpYyBza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBVc2Ugc2xhc2ggY29tbWFuZCBwZXJtaXNzaW9ucyBmb3Igb3duZXIgb25seSBjb21tYW5kc1xuXHQgKiBXYXJuaW5nOiB0aGlzIGlzIGV4cGVyaW1lbnRhbFxuXHQgKi9cblx0cHVibGljIHVzZVNsYXNoUGVybWlzc2lvbnM6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNldCB1cCB0aGUgY29tbWFuZCBoYW5kbGVyXG5cdCAqL1xuXHRwcm90ZWN0ZWQgc2V0dXAoKSB7XG5cdFx0dGhpcy5jbGllbnQub25jZShcInJlYWR5XCIsICgpID0+IHtcblx0XHRcdGlmICh0aGlzLmF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHMpXG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJJbnRlcmFjdGlvbkNvbW1hbmRzKCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMudXNlU2xhc2hQZXJtaXNzaW9ucylcblx0XHRcdFx0XHRcdHRoaXMudXBkYXRlSW50ZXJhY3Rpb25QZXJtaXNzaW9ucyh0aGlzLmNsaWVudC5vd25lcklEIC8qICB0aGlzLmNsaWVudC5zdXBlclVzZXJJRCAqLyk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLmNsaWVudC5vbihcIm1lc3NhZ2VDcmVhdGVcIiwgYXN5bmMgbSA9PiB7XG5cdFx0XHRcdGlmIChtLnBhcnRpYWwpIGF3YWl0IG0uZmV0Y2goKTtcblxuXHRcdFx0XHR0aGlzLmhhbmRsZShtKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAodGhpcy5oYW5kbGVFZGl0cykge1xuXHRcdFx0XHR0aGlzLmNsaWVudC5vbihcIm1lc3NhZ2VVcGRhdGVcIiwgYXN5bmMgKG8sIG0pID0+IHtcblx0XHRcdFx0XHRpZiAoby5wYXJ0aWFsKSBhd2FpdCBvLmZldGNoKCk7XG5cdFx0XHRcdFx0aWYgKG0ucGFydGlhbCkgYXdhaXQgbS5mZXRjaCgpO1xuXHRcdFx0XHRcdGlmIChvLmNvbnRlbnQgPT09IG0uY29udGVudCkgcmV0dXJuO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuaGFuZGxlRWRpdHMpIHRoaXMuaGFuZGxlKG0gYXMgTWVzc2FnZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5jbGllbnQub24oXCJpbnRlcmFjdGlvbkNyZWF0ZVwiLCBpID0+IHtcblx0XHRcdFx0aWYgKCFpLmlzQ29tbWFuZCgpKSByZXR1cm47XG5cdFx0XHRcdHRoaXMuaGFuZGxlU2xhc2goaSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgaW50ZXJhY3Rpb24gY29tbWFuZHMuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgYXN5bmMgcmVnaXN0ZXJJbnRlcmFjdGlvbkNvbW1hbmRzKCkge1xuXHRcdGNvbnN0IHBhcnNlZFNsYXNoQ29tbWFuZHM6IHtcblx0XHRcdG5hbWU6IHN0cmluZztcblx0XHRcdGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuXHRcdFx0b3B0aW9ucz86IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkRhdGFbXTtcblx0XHRcdGd1aWxkczogU25vd2ZsYWtlW107XG5cdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogYm9vbGVhbjtcblx0XHRcdHR5cGU6IFwiQ0hBVF9JTlBVVFwiIHwgXCJNRVNTQUdFXCIgfCBcIlVTRVJcIjtcblx0XHR9W10gPSBbXTtcblx0XHRjb25zdCBndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQ6IENvbGxlY3Rpb248XG5cdFx0XHRTbm93Zmxha2UsXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IHN0cmluZztcblx0XHRcdFx0ZGVzY3JpcHRpb246IHN0cmluZztcblx0XHRcdFx0b3B0aW9uczogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uRGF0YVtdO1xuXHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogYm9vbGVhbjtcblx0XHRcdFx0dHlwZTogXCJDSEFUX0lOUFVUXCIgfCBcIk1FU1NBR0VcIiB8IFwiVVNFUlwiO1xuXHRcdFx0fVtdXG5cdFx0PiA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cdFx0Y29uc3QgcGFyc2VEZXNjcmlwdGlvbkNvbW1hbmQgPSAoZGVzY3JpcHRpb246IHsgY29udGVudDogKCkgPT4gYW55IH0pID0+IHtcblx0XHRcdGlmICh0eXBlb2YgZGVzY3JpcHRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBkZXNjcmlwdGlvbi5jb250ZW50ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBkZXNjcmlwdGlvbi5jb250ZW50KCk7XG5cdFx0XHRcdGlmICh0eXBlb2YgZGVzY3JpcHRpb24uY29udGVudCA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIGRlc2NyaXB0aW9uLmNvbnRlbnQ7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZGVzY3JpcHRpb247XG5cdFx0fTtcblxuXHRcdGZvciAoY29uc3QgWywgZGF0YV0gb2YgdGhpcy5tb2R1bGVzKSB7XG5cdFx0XHRpZiAoIWRhdGEuc2xhc2gpIGNvbnRpbnVlO1xuXHRcdFx0cGFyc2VkU2xhc2hDb21tYW5kcy5wdXNoKHtcblx0XHRcdFx0bmFtZTogZGF0YS5hbGlhc2VzWzBdPy50b0xvd2VyQ2FzZSgpIHx8IGRhdGEuaWQ/LnRvTG93ZXJDYXNlKCksXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBwYXJzZURlc2NyaXB0aW9uQ29tbWFuZChkYXRhLmRlc2NyaXB0aW9uKSB8fCBcIk5vIGRlc2NyaXB0aW9uIHByb3ZpZGVkLlwiLFxuXHRcdFx0XHRvcHRpb25zOiBkYXRhLnNsYXNoT3B0aW9ucyxcblx0XHRcdFx0Z3VpbGRzOiBkYXRhLnNsYXNoR3VpbGRzID8/IFtdLFxuXHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogIShkYXRhLm93bmVyT25seSB8fCAvKiBkYXRhLnN1cGVyVXNlck9ubHkgfHwgKi8gZmFsc2UpLFxuXHRcdFx0XHR0eXBlOiBcIkNIQVRfSU5QVVRcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0bGV0IGNvbnRleHRDb21tYW5kSGFuZGxlcjogQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlciB8IHVuZGVmaW5lZDtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiB0aGlzLmNsaWVudCkge1xuXHRcdFx0aWYgKHRoaXMuY2xpZW50W2tleSBhcyBrZXlvZiBBa2Fpcm9DbGllbnRdIGluc3RhbmNlb2YgQ29udGV4dE1lbnVDb21tYW5kSGFuZGxlcikge1xuXHRcdFx0XHRjb250ZXh0Q29tbWFuZEhhbmRsZXIgPSB0aGlzLmNsaWVudFtrZXkgYXMga2V5b2YgQWthaXJvQ2xpZW50XSBhcyB1bmtub3duIGFzXG5cdFx0XHRcdFx0fCBDb250ZXh0TWVudUNvbW1hbmRIYW5kbGVyXG5cdFx0XHRcdFx0fCB1bmRlZmluZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoY29udGV4dENvbW1hbmRIYW5kbGVyKSB7XG5cdFx0XHRmb3IgKGNvbnN0IFssIGRhdGFdIG9mIGNvbnRleHRDb21tYW5kSGFuZGxlci5tb2R1bGVzKSB7XG5cdFx0XHRcdHBhcnNlZFNsYXNoQ29tbWFuZHMucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogZGF0YS5uYW1lLFxuXHRcdFx0XHRcdGd1aWxkczogZGF0YS5ndWlsZHMgPz8gW10sXG5cdFx0XHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246IHRoaXMudXNlU2xhc2hQZXJtaXNzaW9ucyA/ICEoZGF0YS5vd25lck9ubHkgfHwgLyogZGF0YS5zdXBlclVzZXJPbmx5IHx8ICovIGZhbHNlKSA6IHRydWUsXG5cdFx0XHRcdFx0dHlwZTogZGF0YS50eXBlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qIEdsb2JhbCAqL1xuXHRcdGNvbnN0IHNsYXNoQ29tbWFuZHNBcHAgPSBwYXJzZWRTbGFzaENvbW1hbmRzXG5cdFx0XHQuZmlsdGVyKCh7IGd1aWxkcyB9KSA9PiAhZ3VpbGRzLmxlbmd0aClcblx0XHRcdC5tYXAoKHsgbmFtZSwgZGVzY3JpcHRpb24sIG9wdGlvbnMsIGRlZmF1bHRQZXJtaXNzaW9uLCB0eXBlIH0pID0+IHtcblx0XHRcdFx0cmV0dXJuIHsgbmFtZSwgZGVzY3JpcHRpb24sIG9wdGlvbnMsIGRlZmF1bHRQZXJtaXNzaW9uLCB0eXBlIH07XG5cdFx0XHR9KTtcblx0XHRjb25zdCBjdXJyZW50R2xvYmFsQ29tbWFuZHMgPSAoYXdhaXQgdGhpcy5jbGllbnQuYXBwbGljYXRpb24/LmNvbW1hbmRzLmZldGNoKCkpIS5tYXAodmFsdWUxID0+ICh7XG5cdFx0XHRuYW1lOiB2YWx1ZTEubmFtZSxcblx0XHRcdGRlc2NyaXB0aW9uOiB2YWx1ZTEuZGVzY3JpcHRpb24sXG5cdFx0XHRvcHRpb25zOiB2YWx1ZTEub3B0aW9ucyxcblx0XHRcdGRlZmF1bHRQZXJtaXNzaW9uOiB2YWx1ZTEuZGVmYXVsdFBlcm1pc3Npb24sXG5cdFx0XHR0eXBlOiB2YWx1ZTEudHlwZVxuXHRcdH0pKTtcblxuXHRcdGlmICghXy5pc0VxdWFsKGN1cnJlbnRHbG9iYWxDb21tYW5kcywgc2xhc2hDb21tYW5kc0FwcCkpIHtcblx0XHRcdGF3YWl0IHRoaXMuY2xpZW50LmFwcGxpY2F0aW9uPy5jb21tYW5kcy5zZXQoXG5cdFx0XHRcdHNsYXNoQ29tbWFuZHNBcHAgYXMge1xuXHRcdFx0XHRcdG5hbWU6IHN0cmluZztcblx0XHRcdFx0XHRkZXNjcmlwdGlvbjogc3RyaW5nO1xuXHRcdFx0XHRcdG9wdGlvbnM6IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkRhdGFbXSB8IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRkZWZhdWx0UGVybWlzc2lvbjogYm9vbGVhbjtcblx0XHRcdFx0XHR0eXBlOiBcIkNIQVRfSU5QVVRcIiB8IFwiTUVTU0FHRVwiIHwgXCJVU0VSXCI7XG5cdFx0XHRcdH1bXVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvKiBHdWlsZHMgKi9cblx0XHRmb3IgKGNvbnN0IHsgbmFtZSwgZGVzY3JpcHRpb24sIG9wdGlvbnMsIGd1aWxkcywgZGVmYXVsdFBlcm1pc3Npb24sIHR5cGUgfSBvZiBwYXJzZWRTbGFzaENvbW1hbmRzKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGd1aWxkSWQgb2YgZ3VpbGRzKSB7XG5cdFx0XHRcdGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZC5zZXQoZ3VpbGRJZCwgW1xuXHRcdFx0XHRcdC4uLihndWlsZFNsYXNoQ29tbWFuZHNQYXJzZWQuZ2V0KGd1aWxkSWQpID8/IFtdKSxcblx0XHRcdFx0XHR7IG5hbWUsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiEsIG9wdGlvbnM6IG9wdGlvbnMhLCBkZWZhdWx0UGVybWlzc2lvbiwgdHlwZSB9XG5cdFx0XHRcdF0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoZ3VpbGRTbGFzaENvbW1hbmRzUGFyc2VkLnNpemUpIHtcblx0XHRcdGd1aWxkU2xhc2hDb21tYW5kc1BhcnNlZC5lYWNoKGFzeW5jICh2YWx1ZSwga2V5KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGd1aWxkID0gdGhpcy5jbGllbnQuZ3VpbGRzLmNhY2hlLmdldChrZXkpO1xuXHRcdFx0XHRpZiAoIWd1aWxkKSByZXR1cm47XG5cblx0XHRcdFx0Y29uc3QgY3VycmVudEd1aWxkQ29tbWFuZHMgPSAoYXdhaXQgZ3VpbGQuY29tbWFuZHMuZmV0Y2goKSkubWFwKHZhbHVlMSA9PiAoe1xuXHRcdFx0XHRcdG5hbWU6IHZhbHVlMS5uYW1lLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiB2YWx1ZTEuZGVzY3JpcHRpb24sXG5cdFx0XHRcdFx0b3B0aW9uczogdmFsdWUxLm9wdGlvbnMsXG5cdFx0XHRcdFx0ZGVmYXVsdFBlcm1pc3Npb246IHZhbHVlMS5kZWZhdWx0UGVybWlzc2lvbixcblx0XHRcdFx0XHR0eXBlOiB2YWx1ZTEudHlwZVxuXHRcdFx0XHR9KSk7XG5cblx0XHRcdFx0aWYgKCFfLmlzRXF1YWwoY3VycmVudEd1aWxkQ29tbWFuZHMsIHZhbHVlKSkge1xuXHRcdFx0XHRcdGF3YWl0IGd1aWxkLmNvbW1hbmRzLnNldCh2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiB1cGRhdGVzIGludGVyYWN0aW9uIHBlcm1pc3Npb25zXG5cdCAqL1xuXHRwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlSW50ZXJhY3Rpb25QZXJtaXNzaW9ucyhcblx0XHRvd25lcnM6IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIC8qIHN1cGVyVXNlcnM6IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdICovXG5cdCkge1xuXHRcdGNvbnN0IG1hcENvbSA9IChcblx0XHRcdHZhbHVlOiBBcHBsaWNhdGlvbkNvbW1hbmQ8e1xuXHRcdFx0XHRndWlsZDogR3VpbGRSZXNvbHZhYmxlO1xuXHRcdFx0fT5cblx0XHQpOiB7IGlkOiBzdHJpbmc7IHBlcm1pc3Npb25zOiB7IGlkOiBzdHJpbmc7IHR5cGU6IFwiVVNFUlwiOyBwZXJtaXNzaW9uOiBib29sZWFuIH1bXSB9ID0+IHtcblx0XHRcdGNvbnN0IGNvbW1hbmQgPSB0aGlzLm1vZHVsZXMuZmluZChtb2QgPT4gbW9kLmFsaWFzZXNbMF0gPT09IHZhbHVlLm5hbWUpO1xuXHRcdFx0bGV0IGFsbG93ZWRVc2Vyczogc3RyaW5nW10gPSBbXTtcblx0XHRcdC8qIGlmIChjb21tYW5kLnN1cGVyVXNlck9ubHkpIGFsbG93ZWRVc2Vycy5wdXNoKC4uLlV0aWwuaW50b0FycmF5KHN1cGVyVXNlcnMpKTsgKi9cblx0XHRcdGlmIChjb21tYW5kPy5vd25lck9ubHkpIGFsbG93ZWRVc2Vycy5wdXNoKC4uLlV0aWwuaW50b0FycmF5KG93bmVycykpO1xuXHRcdFx0YWxsb3dlZFVzZXJzID0gWy4uLm5ldyBTZXQoYWxsb3dlZFVzZXJzKV07IC8vIHJlbW92ZSBkdXBsaWNhdGVzXG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGlkOiB2YWx1ZS5pZCxcblx0XHRcdFx0cGVybWlzc2lvbnM6IGFsbG93ZWRVc2Vycy5tYXAodSA9PiAoe1xuXHRcdFx0XHRcdGlkOiB1LFxuXHRcdFx0XHRcdHR5cGU6IFwiVVNFUlwiLFxuXHRcdFx0XHRcdHBlcm1pc3Npb246IHRydWVcblx0XHRcdFx0fSkpXG5cdFx0XHR9O1xuXHRcdH07XG5cblx0XHRjb25zdCBnbG9iYWxDb21tYW5kcyA9IChhd2FpdCB0aGlzLmNsaWVudC5hcHBsaWNhdGlvbj8uY29tbWFuZHMuZmV0Y2goKSk/LmZpbHRlcihcblx0XHRcdHZhbHVlID0+ICEhdGhpcy5tb2R1bGVzLmZpbmQobW9kID0+IG1vZC5hbGlhc2VzWzBdID09PSB2YWx1ZS5uYW1lKVxuXHRcdCk7XG5cdFx0Y29uc3QgZnVsbFBlcm1pc3Npb25zOiBHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25EYXRhW10gfCB1bmRlZmluZWQgPSBnbG9iYWxDb21tYW5kc1xuXHRcdFx0Py5maWx0ZXIodmFsdWUgPT4gIXZhbHVlLmRlZmF1bHRQZXJtaXNzaW9uKVxuXHRcdFx0LmZpbHRlcih2YWx1ZSA9PiAhIXRoaXMubW9kdWxlcy5maW5kKG1vZCA9PiBtb2QuYWxpYXNlc1swXSA9PT0gdmFsdWUubmFtZSkpXG5cdFx0XHQubWFwKHZhbHVlID0+IG1hcENvbSh2YWx1ZSkpO1xuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSB0aGlzLmNsaWVudC5ndWlsZHMuY2FjaGUubWFwKGFzeW5jIGd1aWxkID0+IHtcblx0XHRcdGNvbnN0IHBlcm1zID0gbmV3IEFycmF5KC4uLihmdWxsUGVybWlzc2lvbnMgPz8gW10pKTtcblx0XHRcdGF3YWl0IGd1aWxkLmNvbW1hbmRzLmZldGNoKCk7XG5cdFx0XHRpZiAoZ3VpbGQuY29tbWFuZHMuY2FjaGUuc2l6ZSlcblx0XHRcdFx0cGVybXMucHVzaCguLi5ndWlsZC5jb21tYW5kcy5jYWNoZS5maWx0ZXIodmFsdWUgPT4gIXZhbHVlLmRlZmF1bHRQZXJtaXNzaW9uKS5tYXAodmFsdWUgPT4gbWFwQ29tKHZhbHVlKSkpO1xuXHRcdFx0aWYgKGd1aWxkLmF2YWlsYWJsZSlcblx0XHRcdFx0cmV0dXJuIGd1aWxkLmNvbW1hbmRzLnBlcm1pc3Npb25zLnNldCh7XG5cdFx0XHRcdFx0ZnVsbFBlcm1pc3Npb25zOiBwZXJtc1xuXHRcdFx0XHR9KTtcblx0XHRcdC8vIFJldHVybiBlbXB0eSBwcm9taXNlIGlmIGd1aWxkIGlzIHVuYXZhaWxhYmxlXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fSk7XG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHQvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cdFx0XHRjb25zb2xlLmRlYnVnKHByb21pc2VzKTtcblx0XHRcdGNvbnNvbGUuZGVidWcoZ2xvYmFsQ29tbWFuZHMpO1xuXHRcdFx0Y29uc29sZS5kZWJ1ZyhmdWxsUGVybWlzc2lvbnMpO1xuXHRcdFx0LyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cdFx0XHR0aHJvdyBlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBtb2R1bGUuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHBhcmFtIGZpbGVwYXRoIC0gRmlsZXBhdGggb2YgbW9kdWxlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlZ2lzdGVyKGNvbW1hbmQ6IENvbW1hbmQsIGZpbGVwYXRoPzogc3RyaW5nKTogdm9pZCB7XG5cdFx0c3VwZXIucmVnaXN0ZXIoY29tbWFuZCwgZmlsZXBhdGgpO1xuXG5cdFx0Zm9yIChsZXQgYWxpYXMgb2YgY29tbWFuZC5hbGlhc2VzKSB7XG5cdFx0XHRjb25zdCBjb25mbGljdCA9IHRoaXMuYWxpYXNlcy5nZXQoYWxpYXMudG9Mb3dlckNhc2UoKSk7XG5cdFx0XHRpZiAoY29uZmxpY3QpIHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMSUFTX0NPTkZMSUNUXCIsIGFsaWFzLCBjb21tYW5kLmlkLCBjb25mbGljdCk7XG5cblx0XHRcdGFsaWFzID0gYWxpYXMudG9Mb3dlckNhc2UoKTtcblx0XHRcdHRoaXMuYWxpYXNlcy5zZXQoYWxpYXMsIGNvbW1hbmQuaWQpO1xuXHRcdFx0aWYgKHRoaXMuYWxpYXNSZXBsYWNlbWVudCkge1xuXHRcdFx0XHRjb25zdCByZXBsYWNlbWVudCA9IGFsaWFzLnJlcGxhY2UodGhpcy5hbGlhc1JlcGxhY2VtZW50LCBcIlwiKTtcblxuXHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgIT09IGFsaWFzKSB7XG5cdFx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnRDb25mbGljdCA9IHRoaXMuYWxpYXNlcy5nZXQocmVwbGFjZW1lbnQpO1xuXHRcdFx0XHRcdGlmIChyZXBsYWNlbWVudENvbmZsaWN0KVxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFwiQUxJQVNfQ09ORkxJQ1RcIiwgcmVwbGFjZW1lbnQsIGNvbW1hbmQuaWQsIHJlcGxhY2VtZW50Q29uZmxpY3QpO1xuXHRcdFx0XHRcdHRoaXMuYWxpYXNlcy5zZXQocmVwbGFjZW1lbnQsIGNvbW1hbmQuaWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNvbW1hbmQucHJlZml4ICE9IG51bGwpIHtcblx0XHRcdGxldCBuZXdFbnRyeSA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjb21tYW5kLnByZWZpeCkpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBwcmVmaXggb2YgY29tbWFuZC5wcmVmaXgpIHtcblx0XHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KHByZWZpeCk7XG5cdFx0XHRcdFx0aWYgKHByZWZpeGVzKSB7XG5cdFx0XHRcdFx0XHRwcmVmaXhlcy5hZGQoY29tbWFuZC5pZCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuc2V0KHByZWZpeCwgbmV3IFNldChbY29tbWFuZC5pZF0pKTtcblx0XHRcdFx0XHRcdG5ld0VudHJ5ID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5nZXQoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHRpZiAocHJlZml4ZXMpIHtcblx0XHRcdFx0XHRwcmVmaXhlcy5hZGQoY29tbWFuZC5pZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5zZXQoY29tbWFuZC5wcmVmaXgsIG5ldyBTZXQoW2NvbW1hbmQuaWRdKSk7XG5cdFx0XHRcdFx0bmV3RW50cnkgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChuZXdFbnRyeSkge1xuXHRcdFx0XHR0aGlzLnByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5zb3J0KChhVmFsLCBiVmFsLCBhS2V5LCBiS2V5KSA9PiBVdGlsLnByZWZpeENvbXBhcmUoYUtleSwgYktleSkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIGRlcmVnaXN0ZXIoY29tbWFuZDogQ29tbWFuZCk6IHZvaWQge1xuXHRcdGZvciAobGV0IGFsaWFzIG9mIGNvbW1hbmQuYWxpYXNlcykge1xuXHRcdFx0YWxpYXMgPSBhbGlhcy50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0dGhpcy5hbGlhc2VzLmRlbGV0ZShhbGlhcyk7XG5cblx0XHRcdGlmICh0aGlzLmFsaWFzUmVwbGFjZW1lbnQpIHtcblx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnQgPSBhbGlhcy5yZXBsYWNlKHRoaXMuYWxpYXNSZXBsYWNlbWVudCwgXCJcIik7XG5cdFx0XHRcdGlmIChyZXBsYWNlbWVudCAhPT0gYWxpYXMpIHRoaXMuYWxpYXNlcy5kZWxldGUocmVwbGFjZW1lbnQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLnByZWZpeCAhPSBudWxsKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjb21tYW5kLnByZWZpeCkpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBwcmVmaXggb2YgY29tbWFuZC5wcmVmaXgpIHtcblx0XHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KHByZWZpeCk7XG5cdFx0XHRcdFx0aWYgKHByZWZpeGVzPy5zaXplID09PSAxKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnByZWZpeGVzLmRlbGV0ZShwcmVmaXgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwcmVmaXhlcz8uZGVsZXRlKHByZWZpeCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0aWYgKHByZWZpeGVzPy5zaXplID09PSAxKSB7XG5cdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5kZWxldGUoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRwcmVmaXhlcy5kZWxldGUoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c3VwZXIuZGVyZWdpc3Rlcihjb21tYW5kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGEgbWVzc2FnZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBoYW5kbGUobWVzc2FnZTogTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKHRoaXMuZmV0Y2hNZW1iZXJzICYmIG1lc3NhZ2UuZ3VpbGQgJiYgIW1lc3NhZ2UubWVtYmVyICYmICFtZXNzYWdlLndlYmhvb2tJZCkge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuZmV0Y2gobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5BbGxUeXBlSW5oaWJpdG9ycyhtZXNzYWdlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlscy5oYXMobWVzc2FnZS5pZCkpIHtcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSB0aGlzLmNvbW1hbmRVdGlscy5nZXQobWVzc2FnZS5pZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gbmV3IENvbW1hbmRVdGlsKHRoaXMsIG1lc3NhZ2UpO1xuXHRcdFx0XHRcdHRoaXMuY29tbWFuZFV0aWxzLnNldChtZXNzYWdlLmlkLCBtZXNzYWdlLnV0aWwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blByZVR5cGVJbmhpYml0b3JzKG1lc3NhZ2UpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kKG1lc3NhZ2UpO1xuXHRcdFx0aWYgKCFwYXJzZWQuY29tbWFuZCkge1xuXHRcdFx0XHRjb25zdCBvdmVyUGFyc2VkID0gYXdhaXQgdGhpcy5wYXJzZUNvbW1hbmRPdmVyd3JpdHRlblByZWZpeGVzKG1lc3NhZ2UpO1xuXHRcdFx0XHRpZiAob3ZlclBhcnNlZC5jb21tYW5kIHx8IChwYXJzZWQucHJlZml4ID09IG51bGwgJiYgb3ZlclBhcnNlZC5wcmVmaXggIT0gbnVsbCkpIHtcblx0XHRcdFx0XHRwYXJzZWQgPSBvdmVyUGFyc2VkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdG1lc3NhZ2UudXRpbCEucGFyc2VkID0gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcmFuO1xuXHRcdFx0aWYgKCFwYXJzZWQuY29tbWFuZCkge1xuXHRcdFx0XHRyYW4gPSBhd2FpdCB0aGlzLmhhbmRsZVJlZ2V4QW5kQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJhbiA9IGF3YWl0IHRoaXMuaGFuZGxlRGlyZWN0Q29tbWFuZChtZXNzYWdlLCBwYXJzZWQuY29udGVudCEsIHBhcnNlZC5jb21tYW5kKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHJhbiA9PT0gZmFsc2UpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfSU5WQUxJRCwgbWVzc2FnZSk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJhbjtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBhIHNsYXNoIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBpbnRlcmFjdGlvbiAtIEludGVyYWN0aW9uIHRvIGhhbmRsZS5cblx0ICovXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG5cdHB1YmxpYyBhc3luYyBoYW5kbGVTbGFzaChpbnRlcmFjdGlvbjogQ29tbWFuZEludGVyYWN0aW9uKTogUHJvbWlzZTxib29sZWFuIHwgbnVsbD4ge1xuXHRcdGNvbnN0IGNvbW1hbmQgPSB0aGlzLmZpbmRDb21tYW5kKGludGVyYWN0aW9uLmNvbW1hbmROYW1lKTtcblxuXHRcdGlmICghY29tbWFuZCkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX05PVF9GT1VORCwgaW50ZXJhY3Rpb24pO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGNvbnN0IG1lc3NhZ2UgPSBuZXcgQWthaXJvTWVzc2FnZSh0aGlzLmNsaWVudCwgaW50ZXJhY3Rpb24sIGNvbW1hbmQpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLmZldGNoTWVtYmVycyAmJiBtZXNzYWdlLmd1aWxkICYmICFtZXNzYWdlLm1lbWJlcikge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuZmV0Y2gobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5BbGxUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCB0cnVlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlscy5oYXMobWVzc2FnZS5pZCkpIHtcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSB0aGlzLmNvbW1hbmRVdGlscy5nZXQobWVzc2FnZS5pZCkhO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lc3NhZ2UudXRpbCA9IG5ldyBDb21tYW5kVXRpbCh0aGlzLCBtZXNzYWdlKTtcblx0XHRcdFx0XHR0aGlzLmNvbW1hbmRVdGlscy5zZXQobWVzc2FnZS5pZCwgbWVzc2FnZS51dGlsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5QcmVUeXBlSW5oaWJpdG9ycyhtZXNzYWdlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBwYXJzZWQgPSBhd2FpdCB0aGlzLnBhcnNlQ29tbWFuZChtZXNzYWdlKTtcblx0XHRcdGlmICghcGFyc2VkLmNvbW1hbmQpIHtcblx0XHRcdFx0Y29uc3Qgb3ZlclBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kT3ZlcndyaXR0ZW5QcmVmaXhlcyhtZXNzYWdlKTtcblx0XHRcdFx0aWYgKG92ZXJQYXJzZWQuY29tbWFuZCB8fCAocGFyc2VkLnByZWZpeCA9PSBudWxsICYmIG92ZXJQYXJzZWQucHJlZml4ICE9IG51bGwpKSB7XG5cdFx0XHRcdFx0cGFyc2VkID0gb3ZlclBhcnNlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5jb21tYW5kVXRpbCkge1xuXHRcdFx0XHRtZXNzYWdlLnV0aWwucGFyc2VkID0gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgY29udmVydGVkT3B0aW9uczogYW55ID0ge307XG5cdFx0XHRpZiAoaW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9ncm91cFwiXSkgY29udmVydGVkT3B0aW9uc1tcInN1YmNvbW1hbmRHcm91cFwiXSA9IGludGVyYWN0aW9uLm9wdGlvbnNbXCJfZ3JvdXBcIl07XG5cdFx0XHRpZiAoaW50ZXJhY3Rpb24ub3B0aW9uc1tcIl9zdWJjb21tYW5kXCJdKSBjb252ZXJ0ZWRPcHRpb25zW1wic3ViY29tbWFuZFwiXSA9IGludGVyYWN0aW9uLm9wdGlvbnNbXCJfc3ViY29tbWFuZFwiXTtcblx0XHRcdGZvciAoY29uc3Qgb3B0aW9uIG9mIGludGVyYWN0aW9uLm9wdGlvbnNbXCJfaG9pc3RlZE9wdGlvbnNcIl0pIHtcblx0XHRcdFx0aWYgKFtcIlNVQl9DT01NQU5EXCIsIFwiU1VCX0NPTU1BTkRfR1JPVVBcIl0uaW5jbHVkZXMob3B0aW9uLnR5cGUpKSBjb250aW51ZTtcblx0XHRcdFx0Y29udmVydGVkT3B0aW9uc1tvcHRpb24ubmFtZV0gPSBpbnRlcmFjdGlvbi5vcHRpb25zW1xuXHRcdFx0XHRcdF8uY2FtZWxDYXNlKGBHRVRfJHtvcHRpb24udHlwZSBhcyBrZXlvZiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlc31gKSBhc1xuXHRcdFx0XHRcdFx0fCBcImdldEJvb2xlYW5cIlxuXHRcdFx0XHRcdFx0fCBcImdldENoYW5uZWxcIlxuXHRcdFx0XHRcdFx0fCBcImdldFN0cmluZ1wiXG5cdFx0XHRcdFx0XHR8IFwiZ2V0SW50ZWdlclwiXG5cdFx0XHRcdFx0XHR8IFwiZ2V0TnVtYmVyXCJcblx0XHRcdFx0XHRcdHwgXCJnZXRVc2VyXCJcblx0XHRcdFx0XHRcdHwgXCJnZXRNZW1iZXJcIlxuXHRcdFx0XHRcdFx0fCBcImdldFJvbGVcIlxuXHRcdFx0XHRcdFx0fCBcImdldE1lbnRpb25hYmxlXCJcblx0XHRcdFx0XHRcdHwgXCJnZXRNZXNzYWdlXCJcblx0XHRcdFx0XShvcHRpb24ubmFtZSwgZmFsc2UpO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQga2V5O1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbW1hbmQubG9jaykga2V5ID0gKGNvbW1hbmQubG9jayBhcyBLZXlTdXBwbGllcikobWVzc2FnZSwgY29udmVydGVkT3B0aW9ucyk7XG5cdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShrZXkpKSBrZXkgPSBhd2FpdCBrZXk7XG5cdFx0XHRcdGlmIChrZXkpIHtcblx0XHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrZXI/LmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0XHRrZXkgPSBudWxsO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfTE9DS0VELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb21tYW5kLmxvY2tlcj8uYWRkKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0aWYgKGtleSkgY29tbWFuZC5sb2NrZXI/LmRlbGV0ZShrZXkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5hdXRvRGVmZXIgfHwgY29tbWFuZC5zbGFzaEVwaGVtZXJhbCkge1xuXHRcdFx0XHRhd2FpdCBpbnRlcmFjdGlvbi5kZWZlclJlcGx5KHsgZXBoZW1lcmFsOiBjb21tYW5kLnNsYXNoRXBoZW1lcmFsIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfU1RBUlRFRCwgbWVzc2FnZSwgY29tbWFuZCwgY29udmVydGVkT3B0aW9ucyk7XG5cdFx0XHRcdGNvbnN0IHJldCA9XG5cdFx0XHRcdFx0T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoT2JqZWN0LmdldFByb3RvdHlwZU9mKGNvbW1hbmQpKS5pbmNsdWRlcyhcImV4ZWNTbGFzaFwiKSB8fCB0aGlzLmV4ZWNTbGFzaFxuXHRcdFx0XHRcdFx0PyBhd2FpdCBjb21tYW5kLmV4ZWNTbGFzaChtZXNzYWdlLCBjb252ZXJ0ZWRPcHRpb25zKVxuXHRcdFx0XHRcdFx0OiBhd2FpdCBjb21tYW5kLmV4ZWMobWVzc2FnZSwgY29udmVydGVkT3B0aW9ucyk7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9GSU5JU0hFRCwgbWVzc2FnZSwgY29tbWFuZCwgY29udmVydGVkT3B0aW9ucywgcmV0KTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX0VSUk9SLCBlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cdC8qKlxuXHQgKiBIYW5kbGVzIG5vcm1hbCBjb21tYW5kcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGNvbnRlbnQgLSBDb250ZW50IG9mIG1lc3NhZ2Ugd2l0aG91dCBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgaW5zdGFuY2UuXG5cdCAqIEBwYXJhbSBpZ25vcmUgLSBJZ25vcmUgaW5oaWJpdG9ycyBhbmQgb3RoZXIgY2hlY2tzLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZURpcmVjdENvbW1hbmQoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRjb250ZW50OiBzdHJpbmcsXG5cdFx0Y29tbWFuZDogQ29tbWFuZCxcblx0XHRpZ25vcmU6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0bGV0IGtleTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKCFpZ25vcmUpIHtcblx0XHRcdFx0aWYgKG1lc3NhZ2UuZWRpdGVkVGltZXN0YW1wICYmICFjb21tYW5kLmVkaXRhYmxlKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYmVmb3JlID0gY29tbWFuZC5iZWZvcmUobWVzc2FnZSk7XG5cdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoYmVmb3JlKSkgYXdhaXQgYmVmb3JlO1xuXG5cdFx0XHRjb25zdCBhcmdzID0gYXdhaXQgY29tbWFuZC5wYXJzZShtZXNzYWdlLCBjb250ZW50KTtcblx0XHRcdGlmIChGbGFnLmlzKGFyZ3MsIFwiY2FuY2VsXCIpKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0NBTkNFTExFRCwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmIChGbGFnLmlzKGFyZ3MsIFwicmV0cnlcIikpIHtcblx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfQlJFQUtPVVQsIG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MubWVzc2FnZSk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmhhbmRsZShhcmdzLm1lc3NhZ2UpO1xuXHRcdFx0fSBlbHNlIGlmIChGbGFnLmlzKGFyZ3MsIFwiY29udGludWVcIikpIHtcblx0XHRcdFx0Y29uc3QgY29udGludWVDb21tYW5kID0gdGhpcy5tb2R1bGVzLmdldChhcmdzLmNvbW1hbmQpITtcblx0XHRcdFx0cmV0dXJuIHRoaXMuaGFuZGxlRGlyZWN0Q29tbWFuZChtZXNzYWdlLCBhcmdzLnJlc3QsIGNvbnRpbnVlQ29tbWFuZCwgYXJncy5pZ25vcmUpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWlnbm9yZSkge1xuXHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrKSBrZXkgPSAoY29tbWFuZC5sb2NrIGFzIEtleVN1cHBsaWVyKShtZXNzYWdlLCBhcmdzKTtcblx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGtleSkpIGtleSA9IGF3YWl0IGtleTtcblx0XHRcdFx0aWYgKGtleSkge1xuXHRcdFx0XHRcdGlmIChjb21tYW5kLmxvY2tlcj8uaGFzKGtleSkpIHtcblx0XHRcdFx0XHRcdGtleSA9IG51bGw7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9MT0NLRUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29tbWFuZC5sb2NrZXI/LmFkZChrZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IHRoaXMucnVuQ29tbWFuZChtZXNzYWdlLCBjb21tYW5kLCBhcmdzKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoa2V5KSBjb21tYW5kLmxvY2tlcj8uZGVsZXRlKGtleSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgcmVnZXggYW5kIGNvbmRpdGlvbmFsIGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZVJlZ2V4QW5kQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlOiBNZXNzYWdlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgcmFuMSA9IGF3YWl0IHRoaXMuaGFuZGxlUmVnZXhDb21tYW5kcyhtZXNzYWdlKTtcblx0XHRjb25zdCByYW4yID0gYXdhaXQgdGhpcy5oYW5kbGVDb25kaXRpb25hbENvbW1hbmRzKG1lc3NhZ2UpO1xuXHRcdHJldHVybiByYW4xIHx8IHJhbjI7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyByZWdleCBjb21tYW5kcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBoYW5kbGVSZWdleENvbW1hbmRzKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBoYXNSZWdleENvbW1hbmRzID0gW107XG5cdFx0Zm9yIChjb25zdCBjb21tYW5kIG9mIHRoaXMubW9kdWxlcy52YWx1ZXMoKSkge1xuXHRcdFx0aWYgKG1lc3NhZ2UuZWRpdGVkVGltZXN0YW1wID8gY29tbWFuZC5lZGl0YWJsZSA6IHRydWUpIHtcblx0XHRcdFx0Y29uc3QgcmVnZXggPSB0eXBlb2YgY29tbWFuZC5yZWdleCA9PT0gXCJmdW5jdGlvblwiID8gY29tbWFuZC5yZWdleChtZXNzYWdlKSA6IGNvbW1hbmQucmVnZXg7XG5cdFx0XHRcdGlmIChyZWdleCkgaGFzUmVnZXhDb21tYW5kcy5wdXNoKHsgY29tbWFuZCwgcmVnZXggfSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWF0Y2hlZENvbW1hbmRzID0gW107XG5cdFx0Zm9yIChjb25zdCBlbnRyeSBvZiBoYXNSZWdleENvbW1hbmRzKSB7XG5cdFx0XHRjb25zdCBtYXRjaCA9IG1lc3NhZ2UuY29udGVudC5tYXRjaChlbnRyeS5yZWdleCk7XG5cdFx0XHRpZiAoIW1hdGNoKSBjb250aW51ZTtcblxuXHRcdFx0Y29uc3QgbWF0Y2hlcyA9IFtdO1xuXG5cdFx0XHRpZiAoZW50cnkucmVnZXguZ2xvYmFsKSB7XG5cdFx0XHRcdGxldCBtYXRjaGVkO1xuXG5cdFx0XHRcdHdoaWxlICgobWF0Y2hlZCA9IGVudHJ5LnJlZ2V4LmV4ZWMobWVzc2FnZS5jb250ZW50KSkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdG1hdGNoZXMucHVzaChtYXRjaGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRtYXRjaGVkQ29tbWFuZHMucHVzaCh7IGNvbW1hbmQ6IGVudHJ5LmNvbW1hbmQsIG1hdGNoLCBtYXRjaGVzIH0pO1xuXHRcdH1cblxuXHRcdGlmICghbWF0Y2hlZENvbW1hbmRzLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGNvbnN0IHByb21pc2VzID0gW107XG5cdFx0Zm9yIChjb25zdCB7IGNvbW1hbmQsIG1hdGNoLCBtYXRjaGVzIH0gb2YgbWF0Y2hlZENvbW1hbmRzKSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHJldHVybjtcblxuXHRcdFx0XHRcdFx0Y29uc3QgYmVmb3JlID0gY29tbWFuZC5iZWZvcmUobWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UoYmVmb3JlKSkgYXdhaXQgYmVmb3JlO1xuXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnJ1bkNvbW1hbmQobWVzc2FnZSwgY29tbWFuZCwgeyBtYXRjaCwgbWF0Y2hlcyB9KTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSgpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGNvbmRpdGlvbmFsIGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGhhbmRsZUNvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZTogTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHRydWVDb21tYW5kczogQ29tbWFuZFtdID0gW107XG5cblx0XHRjb25zdCBmaWx0ZXJQcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgY29tbWFuZCBvZiB0aGlzLm1vZHVsZXMudmFsdWVzKCkpIHtcblx0XHRcdGlmIChtZXNzYWdlLmVkaXRlZFRpbWVzdGFtcCAmJiAhY29tbWFuZC5lZGl0YWJsZSkgY29udGludWU7XG5cdFx0XHRmaWx0ZXJQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGxldCBjb25kID0gY29tbWFuZC5jb25kaXRpb24obWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGNvbmQpKSBjb25kID0gYXdhaXQgY29uZDtcblx0XHRcdFx0XHRpZiAoY29uZCkgdHJ1ZUNvbW1hbmRzLnB1c2goY29tbWFuZCk7XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwoZmlsdGVyUHJvbWlzZXMpO1xuXG5cdFx0aWYgKCF0cnVlQ29tbWFuZHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmQgb2YgdHJ1ZUNvbW1hbmRzKSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHJldHVybjtcblx0XHRcdFx0XHRcdGNvbnN0IGJlZm9yZSA9IGNvbW1hbmQuYmVmb3JlKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGJlZm9yZSkpIGF3YWl0IGJlZm9yZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucnVuQ29tbWFuZChtZXNzYWdlLCBjb21tYW5kLCB7fSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBpbmhpYml0b3JzIHdpdGggdGhlIGFsbCB0eXBlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gc2xhc2ggLSBXaGV0aGVyIG9yIG5vdCB0aGUgY29tbWFuZCBzaG91bGQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1bkFsbFR5cGVJbmhpYml0b3JzKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLCBzbGFzaDogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgcmVhc29uID0gdGhpcy5pbmhpYml0b3JIYW5kbGVyID8gYXdhaXQgdGhpcy5pbmhpYml0b3JIYW5kbGVyLnRlc3QoXCJhbGxcIiwgbWVzc2FnZSkgOiBudWxsO1xuXG5cdFx0aWYgKHJlYXNvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCByZWFzb24pO1xuXHRcdH0gZWxzZSBpZiAoIW1lc3NhZ2UuYXV0aG9yKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCBCdWlsdEluUmVhc29ucy5BVVRIT1JfTk9UX0ZPVU5EKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuYmxvY2tDbGllbnQgJiYgbWVzc2FnZS5hdXRob3IuaWQgPT09IHRoaXMuY2xpZW50LnVzZXI/LmlkKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCBCdWlsdEluUmVhc29ucy5DTElFTlQpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5ibG9ja0JvdHMgJiYgbWVzc2FnZS5hdXRob3IuYm90KSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCBCdWlsdEluUmVhc29ucy5CT1QpO1xuXHRcdH0gZWxzZSBpZiAoIXNsYXNoICYmIHRoaXMuaGFzUHJvbXB0KG1lc3NhZ2UuY2hhbm5lbCEsIG1lc3NhZ2UuYXV0aG9yKSkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLklOX1BST01QVCwgbWVzc2FnZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGluaGliaXRvcnMgd2l0aCB0aGUgcHJlIHR5cGUuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUHJlVHlwZUluaGliaXRvcnMobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCByZWFzb24gPSB0aGlzLmluaGliaXRvckhhbmRsZXIgPyBhd2FpdCB0aGlzLmluaGliaXRvckhhbmRsZXIudGVzdChcInByZVwiLCBtZXNzYWdlKSA6IG51bGw7XG5cblx0XHRpZiAocmVhc29uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0JMT0NLRUQsIG1lc3NhZ2UsIHJlYXNvbik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGluaGliaXRvcnMgd2l0aCB0aGUgcG9zdCB0eXBlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0gc2xhc2ggLSBXaGV0aGVyIG9yIG5vdCB0aGUgY29tbWFuZCBzaG91bGQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1blBvc3RUeXBlSW5oaWJpdG9ycyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdHNsYXNoOiBib29sZWFuID0gZmFsc2Vcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgZXZlbnQgPSBzbGFzaCA/IENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX0JMT0NLRUQgOiBDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0JMT0NLRUQ7XG5cblx0XHRpZiAoIXRoaXMuc2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycykge1xuXHRcdFx0aWYgKGNvbW1hbmQub3duZXJPbmx5KSB7XG5cdFx0XHRcdGNvbnN0IGlzT3duZXIgPSB0aGlzLmNsaWVudC5pc093bmVyKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdFx0aWYgKCFpc093bmVyKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5PV05FUik7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbW1hbmQuc3VwZXJVc2VyT25seSkge1xuXHRcdFx0XHRjb25zdCBpc1N1cGVyVXNlciA9IHRoaXMuY2xpZW50LmlzU3VwZXJVc2VyKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdFx0aWYgKCFpc1N1cGVyVXNlcikge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuU1VQRVJfVVNFUik7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbW1hbmQuY2hhbm5lbCA9PT0gXCJndWlsZFwiICYmICFtZXNzYWdlLmd1aWxkKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuR1VJTEQpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbW1hbmQuY2hhbm5lbCA9PT0gXCJkbVwiICYmIG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5ETSk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29tbWFuZC5vbmx5TnNmdyAmJiAhKG1lc3NhZ2UuY2hhbm5lbCBhcyBUZXh0Q2hhbm5lbCk/LltcIm5zZndcIl0pIHtcblx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5OT1RfTlNGVyk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5za2lwQnVpbHRJblBvc3RJbmhpYml0b3JzKSB7XG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5QZXJtaXNzaW9uQ2hlY2tzKG1lc3NhZ2UsIGNvbW1hbmQsIHNsYXNoKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCByZWFzb24gPSB0aGlzLmluaGliaXRvckhhbmRsZXIgPyBhd2FpdCB0aGlzLmluaGliaXRvckhhbmRsZXIudGVzdChcInBvc3RcIiwgbWVzc2FnZSwgY29tbWFuZCkgOiBudWxsO1xuXG5cdFx0aWYgKHRoaXMuc2tpcEJ1aWx0SW5Qb3N0SW5oaWJpdG9ycykge1xuXHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUGVybWlzc2lvbkNoZWNrcyhtZXNzYWdlLCBjb21tYW5kLCBzbGFzaCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHJlYXNvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIHJlYXNvbik7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5ydW5Db29sZG93bnMobWVzc2FnZSwgY29tbWFuZCkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIHBlcm1pc3Npb24gY2hlY2tzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBjb29sZG93bi5cblx0ICogQHBhcmFtIHNsYXNoIC0gV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1blBlcm1pc3Npb25DaGVja3MoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsXG5cdFx0Y29tbWFuZDogQ29tbWFuZCxcblx0XHRzbGFzaDogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGlmIChjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNvbW1hbmQuY2xpZW50UGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdGxldCBtaXNzaW5nID0gY29tbWFuZC5jbGllbnRQZXJtaXNzaW9ucyhtZXNzYWdlKTtcblx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKG1pc3NpbmcpKSBtaXNzaW5nID0gYXdhaXQgbWlzc2luZztcblxuXHRcdFx0XHRpZiAobWlzc2luZyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KFxuXHRcdFx0XHRcdFx0c2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdFx0XCJjbGllbnRcIixcblx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0aWYgKG1lc3NhZ2UuY2hhbm5lbD8udHlwZSA9PT0gXCJETVwiKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRcdGNvbnN0IG1pc3NpbmcgPSBtZXNzYWdlLmNoYW5uZWw/LnBlcm1pc3Npb25zRm9yKG1lc3NhZ2UuZ3VpbGQubWUhKT8ubWlzc2luZyhjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zKTtcblx0XHRcdFx0aWYgKG1pc3Npbmc/Lmxlbmd0aCkge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFwiY2xpZW50XCIsXG5cdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLnVzZXJQZXJtaXNzaW9ucykge1xuXHRcdFx0Y29uc3QgaWdub3JlciA9IGNvbW1hbmQuaWdub3JlUGVybWlzc2lvbnMgfHwgdGhpcy5pZ25vcmVQZXJtaXNzaW9ucztcblx0XHRcdGNvbnN0IGlzSWdub3JlZCA9IEFycmF5LmlzQXJyYXkoaWdub3Jlcilcblx0XHRcdFx0PyBpZ25vcmVyLmluY2x1ZGVzKG1lc3NhZ2UuYXV0aG9yLmlkKVxuXHRcdFx0XHQ6IHR5cGVvZiBpZ25vcmVyID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdFx0PyBpZ25vcmVyKG1lc3NhZ2UsIGNvbW1hbmQpXG5cdFx0XHRcdDogbWVzc2FnZS5hdXRob3IuaWQgPT09IGlnbm9yZXI7XG5cblx0XHRcdGlmICghaXNJZ25vcmVkKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgY29tbWFuZC51c2VyUGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRsZXQgbWlzc2luZyA9IGNvbW1hbmQudXNlclBlcm1pc3Npb25zKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShtaXNzaW5nKSkgbWlzc2luZyA9IGF3YWl0IG1pc3Npbmc7XG5cblx0XHRcdFx0XHRpZiAobWlzc2luZyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdFx0XHRcdHNsYXNoID8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OUyA6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdFx0XHRcdFwidXNlclwiLFxuXHRcdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS5jaGFubmVsPy50eXBlID09PSBcIkRNXCIpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRjb25zdCBtaXNzaW5nID0gbWVzc2FnZS5jaGFubmVsPy5wZXJtaXNzaW9uc0ZvcihtZXNzYWdlLmF1dGhvcik/Lm1pc3NpbmcoY29tbWFuZC51c2VyUGVybWlzc2lvbnMpO1xuXHRcdFx0XHRcdGlmIChtaXNzaW5nPy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdFx0c2xhc2ggPyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TIDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFx0XCJ1c2VyXCIsXG5cdFx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBjb29sZG93bnMgYW5kIGNoZWNrcyBpZiBhIHVzZXIgaXMgdW5kZXIgY29vbGRvd24uXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGNvb2xkb3duLlxuXHQgKi9cblx0cHVibGljIHJ1bkNvb2xkb3ducyhtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSwgY29tbWFuZDogQ29tbWFuZCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGlkID0gbWVzc2FnZS5hdXRob3I/LmlkO1xuXHRcdGNvbnN0IGlnbm9yZXIgPSBjb21tYW5kLmlnbm9yZUNvb2xkb3duIHx8IHRoaXMuaWdub3JlQ29vbGRvd247XG5cdFx0Y29uc3QgaXNJZ25vcmVkID0gQXJyYXkuaXNBcnJheShpZ25vcmVyKVxuXHRcdFx0PyBpZ25vcmVyLmluY2x1ZGVzKGlkKVxuXHRcdFx0OiB0eXBlb2YgaWdub3JlciA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHQ/IGlnbm9yZXIobWVzc2FnZSwgY29tbWFuZClcblx0XHRcdDogaWQgPT09IGlnbm9yZXI7XG5cblx0XHRpZiAoaXNJZ25vcmVkKSByZXR1cm4gZmFsc2U7XG5cblx0XHRjb25zdCB0aW1lID0gY29tbWFuZC5jb29sZG93biAhPSBudWxsID8gY29tbWFuZC5jb29sZG93biA6IHRoaXMuZGVmYXVsdENvb2xkb3duO1xuXHRcdGlmICghdGltZSkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Y29uc3QgZW5kVGltZSA9IG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcCArIHRpbWU7XG5cblx0XHRpZiAoIXRoaXMuY29vbGRvd25zLmhhcyhpZCkpIHRoaXMuY29vbGRvd25zLnNldChpZCwge30pO1xuXG5cdFx0aWYgKCF0aGlzLmNvb2xkb3ducy5nZXQoaWQpIVtjb21tYW5kLmlkXSkge1xuXHRcdFx0dGhpcy5jb29sZG93bnMuZ2V0KGlkKSFbY29tbWFuZC5pZF0gPSB7XG5cdFx0XHRcdHRpbWVyOiBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5jb29sZG93bnMuZ2V0KGlkKSFbY29tbWFuZC5pZF0pIHtcblx0XHRcdFx0XHRcdGNsZWFyVGltZW91dCh0aGlzLmNvb2xkb3ducy5nZXQoaWQpIVtjb21tYW5kLmlkXS50aW1lcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuY29vbGRvd25zLmdldChpZCkhW2NvbW1hbmQuaWRdID0gbnVsbCE7XG5cblx0XHRcdFx0XHRpZiAoIU9iamVjdC5rZXlzKHRoaXMuY29vbGRvd25zLmdldChpZCkhKS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHRoaXMuY29vbGRvd25zLmRlbGV0ZShpZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCB0aW1lKS51bnJlZigpLFxuXHRcdFx0XHRlbmQ6IGVuZFRpbWUsXG5cdFx0XHRcdHVzZXM6IDBcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Y29uc3QgZW50cnkgPSB0aGlzLmNvb2xkb3ducy5nZXQoaWQpIVtjb21tYW5kLmlkXTtcblxuXHRcdGlmIChlbnRyeS51c2VzID49IGNvbW1hbmQucmF0ZWxpbWl0KSB7XG5cdFx0XHRjb25zdCBlbmQgPSB0aGlzLmNvb2xkb3ducy5nZXQoaWQpIVtjb21tYW5kLmlkXS5lbmQ7XG5cdFx0XHRjb25zdCBkaWZmID0gZW5kIC0gbWVzc2FnZS5jcmVhdGVkVGltZXN0YW1wO1xuXG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09PTERPV04sIG1lc3NhZ2UsIGNvbW1hbmQsIGRpZmYpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0ZW50cnkudXNlcysrO1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIGFyZ3MgLSBBcmd1bWVudHMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1bkNvbW1hbmQobWVzc2FnZTogTWVzc2FnZSwgY29tbWFuZDogQ29tbWFuZCwgYXJnczogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKCFjb21tYW5kIHx8ICFtZXNzYWdlKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9JTlZBTElELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKGNvbW1hbmQudHlwaW5nIHx8IHRoaXMudHlwaW5nKSB7XG5cdFx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZFR5cGluZygpO1xuXHRcdH1cblxuXHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX1NUQVJURUQsIG1lc3NhZ2UsIGNvbW1hbmQsIGFyZ3MpO1xuXHRcdGNvbnN0IHJldCA9IGF3YWl0IGNvbW1hbmQuZXhlYyhtZXNzYWdlLCBhcmdzKTtcblx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9GSU5JU0hFRCwgbWVzc2FnZSwgY29tbWFuZCwgYXJncywgcmV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIGNvbW1hbmQgYW5kIGl0cyBhcmd1bWVudCBsaXN0LlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcGFyc2VDb21tYW5kKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlKTogUHJvbWlzZTxQYXJzZWRDb21wb25lbnREYXRhPiB7XG5cdFx0Y29uc3QgYWxsb3dNZW50aW9uID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5wcmVmaXgpKG1lc3NhZ2UpO1xuXHRcdGxldCBwcmVmaXhlcyA9IFV0aWwuaW50b0FycmF5KGFsbG93TWVudGlvbik7XG5cdFx0aWYgKGFsbG93TWVudGlvbikge1xuXHRcdFx0Y29uc3QgbWVudGlvbnMgPSBbYDxAJHt0aGlzLmNsaWVudC51c2VyPy5pZH0+YCwgYDxAISR7dGhpcy5jbGllbnQudXNlcj8uaWR9PmBdO1xuXHRcdFx0cHJlZml4ZXMgPSBbLi4ubWVudGlvbnMsIC4uLnByZWZpeGVzXTtcblx0XHR9XG5cblx0XHRwcmVmaXhlcy5zb3J0KFV0aWwucHJlZml4Q29tcGFyZSk7XG5cdFx0cmV0dXJuIHRoaXMucGFyc2VNdWx0aXBsZVByZWZpeGVzKFxuXHRcdFx0bWVzc2FnZSxcblx0XHRcdHByZWZpeGVzLm1hcChwID0+IFtwLCBudWxsXSlcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgY29tbWFuZCBhbmQgaXRzIGFyZ3VtZW50IGxpc3QgdXNpbmcgcHJlZml4IG92ZXJ3cml0ZXMuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBwYXJzZUNvbW1hbmRPdmVyd3JpdHRlblByZWZpeGVzKG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlKTogUHJvbWlzZTxQYXJzZWRDb21wb25lbnREYXRhPiB7XG5cdFx0aWYgKCF0aGlzLnByZWZpeGVzLnNpemUpIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cblx0XHRjb25zdCBwcm9taXNlcyA9IHRoaXMucHJlZml4ZXMubWFwKGFzeW5jIChjbWRzLCBwcm92aWRlcikgPT4ge1xuXHRcdFx0Y29uc3QgcHJlZml4ZXMgPSBVdGlsLmludG9BcnJheShhd2FpdCBVdGlsLmludG9DYWxsYWJsZShwcm92aWRlcikobWVzc2FnZSkpO1xuXHRcdFx0cmV0dXJuIHByZWZpeGVzLm1hcChwID0+IFtwLCBjbWRzXSk7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBwYWlycyA9IFV0aWwuZmxhdE1hcChhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyksICh4OiBhbnkpID0+IHgpO1xuXHRcdHBhaXJzLnNvcnQoKFthXTogYW55LCBbYl06IGFueSkgPT4gVXRpbC5wcmVmaXhDb21wYXJlKGEsIGIpKTtcblx0XHRyZXR1cm4gdGhpcy5wYXJzZU11bHRpcGxlUHJlZml4ZXMobWVzc2FnZSwgcGFpcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgcGFyc2VXaXRoUHJlZml4IG9uIG11bHRpcGxlIHByZWZpeGVzIGFuZCByZXR1cm5zIHRoZSBiZXN0IHBhcnNlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gcGFyc2UuXG5cdCAqIEBwYXJhbSBwYWlycyAtIFBhaXJzIG9mIHByZWZpeCB0byBhc3NvY2lhdGVkIGNvbW1hbmRzLiBUaGF0IGlzLCBgW3N0cmluZywgU2V0PHN0cmluZz4gfCBudWxsXVtdYC5cblx0ICovXG5cdHB1YmxpYyBwYXJzZU11bHRpcGxlUHJlZml4ZXMoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsXG5cdFx0cGFpcnM6IFtzdHJpbmcsIFNldDxzdHJpbmc+IHwgbnVsbF1bXVxuXHQpOiBQYXJzZWRDb21wb25lbnREYXRhIHtcblx0XHRjb25zdCBwYXJzZXMgPSBwYWlycy5tYXAoKFtwcmVmaXgsIGNtZHNdKSA9PiB0aGlzLnBhcnNlV2l0aFByZWZpeChtZXNzYWdlLCBwcmVmaXgsIGNtZHMpKTtcblx0XHRjb25zdCByZXN1bHQgPSBwYXJzZXMuZmluZChwYXJzZWQgPT4gcGFyc2VkLmNvbW1hbmQpO1xuXHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZ3Vlc3MgPSBwYXJzZXMuZmluZChwYXJzZWQgPT4gcGFyc2VkLnByZWZpeCAhPSBudWxsKTtcblx0XHRpZiAoZ3Vlc3MpIHtcblx0XHRcdHJldHVybiBndWVzcztcblx0XHR9XG5cblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHQvKipcblx0ICogVHJpZXMgdG8gcGFyc2UgYSBtZXNzYWdlIHdpdGggdGhlIGdpdmVuIHByZWZpeCBhbmQgYXNzb2NpYXRlZCBjb21tYW5kcy5cblx0ICogQXNzb2NpYXRlZCBjb21tYW5kcyByZWZlciB0byB3aGVuIGEgcHJlZml4IGlzIHVzZWQgaW4gcHJlZml4IG92ZXJyaWRlcy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHBhcnNlLlxuXHQgKiBAcGFyYW0gcHJlZml4IC0gUHJlZml4IHRvIHVzZS5cblx0ICogQHBhcmFtIGFzc29jaWF0ZWRDb21tYW5kcyAtIEFzc29jaWF0ZWQgY29tbWFuZHMuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2VXaXRoUHJlZml4KFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdHByZWZpeDogc3RyaW5nLFxuXHRcdGFzc29jaWF0ZWRDb21tYW5kczogU2V0PHN0cmluZz4gfCBudWxsID0gbnVsbFxuXHQpOiBQYXJzZWRDb21wb25lbnREYXRhIHtcblx0XHRjb25zdCBsb3dlckNvbnRlbnQgPSBtZXNzYWdlLmNvbnRlbnQudG9Mb3dlckNhc2UoKTtcblx0XHRpZiAoIWxvd2VyQ29udGVudC5zdGFydHNXaXRoKHByZWZpeC50b0xvd2VyQ2FzZSgpKSkge1xuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblxuXHRcdGNvbnN0IGVuZE9mUHJlZml4ID0gbG93ZXJDb250ZW50LmluZGV4T2YocHJlZml4LnRvTG93ZXJDYXNlKCkpICsgcHJlZml4Lmxlbmd0aDtcblx0XHRjb25zdCBzdGFydE9mQXJncyA9IG1lc3NhZ2UuY29udGVudC5zbGljZShlbmRPZlByZWZpeCkuc2VhcmNoKC9cXFMvKSArIHByZWZpeC5sZW5ndGg7XG5cdFx0Y29uc3QgYWxpYXMgPSBtZXNzYWdlLmNvbnRlbnQuc2xpY2Uoc3RhcnRPZkFyZ3MpLnNwbGl0KC9cXHN7MSx9fFxcbnsxLH0vKVswXTtcblx0XHRjb25zdCBjb21tYW5kID0gdGhpcy5maW5kQ29tbWFuZChhbGlhcyk7XG5cdFx0Y29uc3QgY29udGVudCA9IG1lc3NhZ2UuY29udGVudC5zbGljZShzdGFydE9mQXJncyArIGFsaWFzLmxlbmd0aCArIDEpLnRyaW0oKTtcblx0XHRjb25zdCBhZnRlclByZWZpeCA9IG1lc3NhZ2UuY29udGVudC5zbGljZShwcmVmaXgubGVuZ3RoKS50cmltKCk7XG5cblx0XHRpZiAoIWNvbW1hbmQpIHtcblx0XHRcdHJldHVybiB7IHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdFx0fVxuXG5cdFx0aWYgKGFzc29jaWF0ZWRDb21tYW5kcyA9PSBudWxsKSB7XG5cdFx0XHRpZiAoY29tbWFuZC5wcmVmaXggIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4geyBwcmVmaXgsIGFsaWFzLCBjb250ZW50LCBhZnRlclByZWZpeCB9O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIWFzc29jaWF0ZWRDb21tYW5kcy5oYXMoY29tbWFuZC5pZCkpIHtcblx0XHRcdHJldHVybiB7IHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgY29tbWFuZCwgcHJlZml4LCBhbGlhcywgY29udGVudCwgYWZ0ZXJQcmVmaXggfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGVycm9ycyBmcm9tIHRoZSBoYW5kbGluZy5cblx0ICogQHBhcmFtIGVyciAtIFRoZSBlcnJvci5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdGhhdCBlcnJvcmVkLlxuXHQgKi9cblx0cHVibGljIGVtaXRFcnJvcihlcnI6IEVycm9yLCBtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSwgY29tbWFuZD86IENvbW1hbmQgfCBBa2Fpcm9Nb2R1bGUpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5saXN0ZW5lckNvdW50KENvbW1hbmRIYW5kbGVyRXZlbnRzLkVSUk9SKSkge1xuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkVSUk9SLCBlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRocm93IGVycjtcblx0fVxuXG5cdC8qKlxuXHQgKiBTd2VlcCBjb21tYW5kIHV0aWwgaW5zdGFuY2VzIGZyb20gY2FjaGUgYW5kIHJldHVybnMgYW1vdW50IHN3ZWVwZWQuXG5cdCAqIEBwYXJhbSBsaWZldGltZSAtIE1lc3NhZ2VzIG9sZGVyIHRoYW4gdGhpcyB3aWxsIGhhdmUgdGhlaXIgY29tbWFuZCB1dGlsIGluc3RhbmNlIHN3ZWVwZWQuIFRoaXMgaXMgaW4gbWlsbGlzZWNvbmRzIGFuZCBkZWZhdWx0cyB0byB0aGUgYGNvbW1hbmRVdGlsTGlmZXRpbWVgIG9wdGlvbi5cblx0ICovXG5cdHB1YmxpYyBzd2VlcENvbW1hbmRVdGlsKGxpZmV0aW1lOiBudW1iZXIgPSB0aGlzLmNvbW1hbmRVdGlsTGlmZXRpbWUpOiBudW1iZXIge1xuXHRcdGxldCBjb3VudCA9IDA7XG5cdFx0Zm9yIChjb25zdCBjb21tYW5kVXRpbCBvZiB0aGlzLmNvbW1hbmRVdGlscy52YWx1ZXMoKSkge1xuXHRcdFx0Y29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBjb21tYW5kVXRpbC5tZXNzYWdlO1xuXHRcdFx0aWYgKG5vdyAtICgobWVzc2FnZSBhcyBNZXNzYWdlKS5lZGl0ZWRUaW1lc3RhbXAgfHwgbWVzc2FnZS5jcmVhdGVkVGltZXN0YW1wKSA+IGxpZmV0aW1lKSB7XG5cdFx0XHRcdGNvdW50Kys7XG5cdFx0XHRcdHRoaXMuY29tbWFuZFV0aWxzLmRlbGV0ZShtZXNzYWdlLmlkKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gY291bnQ7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhbiBvbmdvaW5nIHByb21wdCBpbiBvcmRlciB0byBwcmV2ZW50IGNvbW1hbmQgdXNhZ2UgaW4gdGhlIGNoYW5uZWwuXG5cdCAqIEBwYXJhbSBjaGFubmVsIC0gQ2hhbm5lbCB0byBhZGQgdG8uXG5cdCAqIEBwYXJhbSB1c2VyIC0gVXNlciB0byBhZGQuXG5cdCAqL1xuXHRwdWJsaWMgYWRkUHJvbXB0KGNoYW5uZWw6IFRleHRCYXNlZENoYW5uZWxzLCB1c2VyOiBVc2VyKTogdm9pZCB7XG5cdFx0bGV0IHVzZXJzID0gdGhpcy5wcm9tcHRzLmdldChjaGFubmVsLmlkKTtcblx0XHRpZiAoIXVzZXJzKSB0aGlzLnByb21wdHMuc2V0KGNoYW5uZWwuaWQsIG5ldyBTZXQoKSk7XG5cdFx0dXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdHVzZXJzPy5hZGQodXNlci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbiBvbmdvaW5nIHByb21wdC5cblx0ICogQHBhcmFtIGNoYW5uZWwgLSBDaGFubmVsIHRvIHJlbW92ZSBmcm9tLlxuXHQgKiBAcGFyYW0gdXNlciAtIFVzZXIgdG8gcmVtb3ZlLlxuXHQgKi9cblx0cHVibGljIHJlbW92ZVByb21wdChjaGFubmVsOiBUZXh0QmFzZWRDaGFubmVscywgdXNlcjogVXNlcik6IHZvaWQge1xuXHRcdGNvbnN0IHVzZXJzID0gdGhpcy5wcm9tcHRzLmdldChjaGFubmVsLmlkKTtcblx0XHRpZiAoIXVzZXJzKSByZXR1cm47XG5cdFx0dXNlcnMuZGVsZXRlKHVzZXIuaWQpO1xuXHRcdGlmICghdXNlcnMuc2l6ZSkgdGhpcy5wcm9tcHRzLmRlbGV0ZSh1c2VyLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlcmUgaXMgYW4gb25nb2luZyBwcm9tcHQuXG5cdCAqIEBwYXJhbSBjaGFubmVsIC0gQ2hhbm5lbCB0byBjaGVjay5cblx0ICogQHBhcmFtIHVzZXIgLSBVc2VyIHRvIGNoZWNrLlxuXHQgKi9cblx0cHVibGljIGhhc1Byb21wdChjaGFubmVsOiBUZXh0QmFzZWRDaGFubmVscywgdXNlcjogVXNlcik6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IHVzZXJzID0gdGhpcy5wcm9tcHRzLmdldChjaGFubmVsLmlkKTtcblx0XHRpZiAoIXVzZXJzKSByZXR1cm4gZmFsc2U7XG5cdFx0cmV0dXJuIHVzZXJzLmhhcyh1c2VyLmlkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGaW5kcyBhIGNvbW1hbmQgYnkgYWxpYXMuXG5cdCAqIEBwYXJhbSBuYW1lIC0gQWxpYXMgdG8gZmluZCB3aXRoLlxuXHQgKi9cblx0cHVibGljIGZpbmRDb21tYW5kKG5hbWU6IHN0cmluZyk6IENvbW1hbmQge1xuXHRcdHJldHVybiB0aGlzLm1vZHVsZXMuZ2V0KHRoaXMuYWxpYXNlcy5nZXQobmFtZS50b0xvd2VyQ2FzZSgpKSEpITtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGluaGliaXRvciBoYW5kbGVyIHRvIHVzZS5cblx0ICogQHBhcmFtIGluaGliaXRvckhhbmRsZXIgLSBUaGUgaW5oaWJpdG9yIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgdXNlSW5oaWJpdG9ySGFuZGxlcihpbmhpYml0b3JIYW5kbGVyOiBJbmhpYml0b3JIYW5kbGVyKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHRoaXMuaW5oaWJpdG9ySGFuZGxlciA9IGluaGliaXRvckhhbmRsZXI7XG5cdFx0dGhpcy5yZXNvbHZlci5pbmhpYml0b3JIYW5kbGVyID0gaW5oaWJpdG9ySGFuZGxlcjtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgbGlzdGVuZXIgaGFuZGxlciB0byB1c2UuXG5cdCAqIEBwYXJhbSBsaXN0ZW5lckhhbmRsZXIgLSBUaGUgbGlzdGVuZXIgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyB1c2VMaXN0ZW5lckhhbmRsZXIobGlzdGVuZXJIYW5kbGVyOiBMaXN0ZW5lckhhbmRsZXIpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0dGhpcy5yZXNvbHZlci5saXN0ZW5lckhhbmRsZXIgPSBsaXN0ZW5lckhhbmRsZXI7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB0aGluZyAtIE1vZHVsZSBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkKHRoaW5nOiBzdHJpbmcgfCBDb21tYW5kKTogUHJvbWlzZTxDb21tYW5kPiB7XG5cdFx0cmV0dXJuIHN1cGVyLmxvYWQodGhpbmcpIGFzIFByb21pc2U8Q29tbWFuZD47XG5cdH1cblxuXHQvKipcblx0ICogUmVhZHMgYWxsIGNvbW1hbmRzIGZyb20gdGhlIGRpcmVjdG9yeSBhbmQgbG9hZHMgdGhlbS5cblx0ICogQHBhcmFtIGRpcmVjdG9yeSAtIERpcmVjdG9yeSB0byBsb2FkIGZyb20uIERlZmF1bHRzIHRvIHRoZSBkaXJlY3RvcnkgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICogQHBhcmFtIGZpbHRlciAtIEZpbHRlciBmb3IgZmlsZXMsIHdoZXJlIHRydWUgbWVhbnMgaXQgc2hvdWxkIGJlIGxvYWRlZC5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSBsb2FkQWxsKGRpcmVjdG9yeT86IHN0cmluZywgZmlsdGVyPzogTG9hZFByZWRpY2F0ZSk6IFByb21pc2U8Q29tbWFuZEhhbmRsZXI+IHtcblx0XHRyZXR1cm4gc3VwZXIubG9hZEFsbChkaXJlY3RvcnksIGZpbHRlcikgYXMgUHJvbWlzZTxDb21tYW5kSGFuZGxlcj47XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBpZCAtIElEIG9mIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbW92ZShpZDogc3RyaW5nKTogQ29tbWFuZCB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbW92ZShpZCkgYXMgQ29tbWFuZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBjb21tYW5kcy5cblx0ICovXG5cdHB1YmxpYyBvdmVycmlkZSByZW1vdmVBbGwoKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiBzdXBlci5yZW1vdmVBbGwoKSBhcyBDb21tYW5kSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGEgY29tbWFuZC5cblx0ICogQHBhcmFtIGlkIC0gSUQgb2YgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgb3ZlcnJpZGUgcmVsb2FkKGlkOiBzdHJpbmcpOiBQcm9taXNlPENvbW1hbmQ+IHtcblx0XHRyZXR1cm4gc3VwZXIucmVsb2FkKGlkKSBhcyBQcm9taXNlPENvbW1hbmQ+O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYWxsIGNvbW1hbmRzLlxuXHQgKi9cblx0cHVibGljIG92ZXJyaWRlIHJlbG9hZEFsbCgpOiBQcm9taXNlPENvbW1hbmRIYW5kbGVyPiB7XG5cdFx0cmV0dXJuIHN1cGVyLnJlbG9hZEFsbCgpIGFzIFByb21pc2U8Q29tbWFuZEhhbmRsZXI+O1xuXHR9XG5cblx0cHVibGljIG92ZXJyaWRlIG9uPEsgZXh0ZW5kcyBrZXlvZiBDb21tYW5kSGFuZGxlckV2ZW50c1R5cGU+KFxuXHRcdGV2ZW50OiBLLFxuXHRcdGxpc3RlbmVyOiAoLi4uYXJnczogQ29tbWFuZEhhbmRsZXJFdmVudHNUeXBlW0tdW10pID0+IEF3YWl0ZWQ8dm9pZD5cblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHN1cGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG5cdH1cblx0cHVibGljIG92ZXJyaWRlIG9uY2U8SyBleHRlbmRzIGtleW9mIENvbW1hbmRIYW5kbGVyRXZlbnRzVHlwZT4oXG5cdFx0ZXZlbnQ6IEssXG5cdFx0bGlzdGVuZXI6ICguLi5hcmdzOiBDb21tYW5kSGFuZGxlckV2ZW50c1R5cGVbS11bXSkgPT4gQXdhaXRlZDx2b2lkPlxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gc3VwZXIub25jZShldmVudCwgbGlzdGVuZXIpO1xuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWFuZEhhbmRsZXJPcHRpb25zIGV4dGVuZHMgQWthaXJvSGFuZGxlck9wdGlvbnMge1xuXHQvKipcblx0ICogUmVndWxhciBleHByZXNzaW9uIHRvIGF1dG9tYXRpY2FsbHkgbWFrZSBjb21tYW5kIGFsaWFzZXMuXG5cdCAqIEZvciBleGFtcGxlLCB1c2luZyBgLy0vZ2Agd291bGQgbWVhbiB0aGF0IGFsaWFzZXMgY29udGFpbmluZyBgLWAgd291bGQgYmUgdmFsaWQgd2l0aCBhbmQgd2l0aG91dCBpdC5cblx0ICogU28sIHRoZSBhbGlhcyBgY29tbWFuZC1uYW1lYCBpcyB2YWxpZCBhcyBib3RoIGBjb21tYW5kLW5hbWVgIGFuZCBgY29tbWFuZG5hbWVgLlxuXHQgKi9cblx0YWxpYXNSZXBsYWNlbWVudD86IFJlZ0V4cDtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYWxsb3cgbWVudGlvbnMgdG8gdGhlIGNsaWVudCB1c2VyIGFzIGEgcHJlZml4LlxuXHQgKi9cblx0YWxsb3dNZW50aW9uPzogYm9vbGVhbiB8IE1lbnRpb25QcmVmaXhQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIERlZmF1bHQgYXJndW1lbnQgb3B0aW9ucy5cblx0ICovXG5cdGFyZ3VtZW50RGVmYXVsdHM/OiBEZWZhdWx0QXJndW1lbnRPcHRpb25zO1xuXG5cdC8qKlxuXHQgKiBBdXRvbWF0aWNhbGx5IGRlZmVyIG1lc3NhZ2VzIFwiQm90TmFtZSBpcyB0aGlua2luZ1wiXG5cdCAqL1xuXHRhdXRvRGVmZXI/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZ5IHdoZXRoZXIgdG8gcmVnaXN0ZXIgYWxsIHNsYXNoIGNvbW1hbmRzIHdoZW4gc3RhcnRpbmcgdGhlIGNsaWVudC5cblx0ICovXG5cdGF1dG9SZWdpc3RlclNsYXNoQ29tbWFuZHM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBib3RzLlxuXHQgKi9cblx0YmxvY2tCb3RzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYmxvY2sgc2VsZi5cblx0ICovXG5cdGJsb2NrQ2xpZW50PzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gYXNzaWduIGBtZXNzYWdlLnV0aWxgLlxuXHQgKi9cblx0Y29tbWFuZFV0aWw/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBNaWxsaXNlY29uZHMgYSBtZXNzYWdlIHNob3VsZCBleGlzdCBmb3IgYmVmb3JlIGl0cyBjb21tYW5kIHV0aWwgaW5zdGFuY2UgaXMgbWFya2VkIGZvciByZW1vdmFsLlxuXHQgKiBJZiAwLCBDb21tYW5kVXRpbCBpbnN0YW5jZXMgd2lsbCBuZXZlciBiZSByZW1vdmVkIGFuZCB3aWxsIGNhdXNlIG1lbW9yeSB0byBpbmNyZWFzZSBpbmRlZmluaXRlbHkuXG5cdCAqL1xuXHRjb21tYW5kVXRpbExpZmV0aW1lPzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaW1lIGludGVydmFsIGluIG1pbGxpc2Vjb25kcyBmb3Igc3dlZXBpbmcgY29tbWFuZCB1dGlsIGluc3RhbmNlcy5cblx0ICogSWYgMCwgQ29tbWFuZFV0aWwgaW5zdGFuY2VzIHdpbGwgbmV2ZXIgYmUgcmVtb3ZlZCBhbmQgd2lsbCBjYXVzZSBtZW1vcnkgdG8gaW5jcmVhc2UgaW5kZWZpbml0ZWx5LlxuXHQgKi9cblx0Y29tbWFuZFV0aWxTd2VlcEludGVydmFsPzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBEZWZhdWx0IGNvb2xkb3duIGZvciBjb21tYW5kcy5cblx0ICovXG5cdGRlZmF1bHRDb29sZG93bj86IG51bWJlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgbWVtYmVycyBhcmUgZmV0Y2hlZCBvbiBlYWNoIG1lc3NhZ2UgYXV0aG9yIGZyb20gYSBndWlsZC5cblx0ICovXG5cdGZldGNoTWVtYmVycz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGhhbmRsZSBlZGl0ZWQgbWVzc2FnZXMgdXNpbmcgQ29tbWFuZFV0aWwuXG5cdCAqL1xuXHRoYW5kbGVFZGl0cz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGNvb2xkb3duIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLiBEZWZhdWx0cyB0byB0aGUgY2xpZW50IG93bmVyKHMpLlxuXHQgKi9cblx0aWdub3JlQ29vbGRvd24/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB1c2VyKHMpIHRvIGlnbm9yZSBgdXNlclBlcm1pc3Npb25zYCBjaGVja3Mgb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuXG5cdCAqL1xuXHRpZ25vcmVQZXJtaXNzaW9ucz86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqXG5cdCAqIFRoZSBwcmVmaXgoZXMpIGZvciBjb21tYW5kIHBhcnNpbmcuXG5cdCAqL1xuXHRwcmVmaXg/OiBzdHJpbmcgfCBzdHJpbmdbXSB8IFByZWZpeFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBzdG9yZSBtZXNzYWdlcyBpbiBDb21tYW5kVXRpbC5cblx0ICovXG5cdHN0b3JlTWVzc2FnZXM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTaG93IFwiQm90TmFtZSBpcyB0eXBpbmdcIiBpbmZvcm1hdGlvbiBtZXNzYWdlIG9uIHRoZSB0ZXh0IGNoYW5uZWxzIHdoZW4gYSBjb21tYW5kIGlzIHJ1bm5pbmcuXG5cdCAqL1xuXHR0eXBpbmc/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byB1c2UgZXhlY1NsYXNoIGZvciBzbGFzaCBjb21tYW5kcy5cblx0ICovXG5cdGV4ZWNTbGFzaD86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIHNraXAgYnVpbHQgaW4gcmVhc29ucyBwb3N0IHR5cGUgaW5oaWJpdG9ycyBzbyB5b3UgY2FuIG1ha2UgY3VzdG9tIG9uZXMuXG5cdCAqL1xuXHRza2lwQnVpbHRJblBvc3RJbmhpYml0b3JzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVXNlIHNsYXNoIGNvbW1hbmQgcGVybWlzc2lvbnMgZm9yIG93bmVyIG9ubHkgY29tbWFuZHNcblx0ICogV2FybmluZzogdGhpcyBpcyBleHBlcmltZW50YWxcblx0ICovXG5cdHVzZVNsYXNoUGVybWlzc2lvbnM/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIERhdGEgZm9yIG1hbmFnaW5nIGNvb2xkb3ducy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb29sZG93bkRhdGEge1xuXHQvKipcblx0ICogV2hlbiB0aGUgY29vbGRvd24gZW5kcy5cblx0ICovXG5cdGVuZDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaW1lb3V0IG9iamVjdC5cblx0ICovXG5cdHRpbWVyOiBOb2RlSlMuVGltZXI7XG5cblx0LyoqXG5cdCAqIE51bWJlciBvZiB0aW1lcyB0aGUgY29tbWFuZCBoYXMgYmVlbiB1c2VkLlxuXHQgKi9cblx0dXNlczogbnVtYmVyO1xufVxuXG4vKipcbiAqIFZhcmlvdXMgcGFyc2VkIGNvbXBvbmVudHMgb2YgdGhlIG1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQ29tcG9uZW50RGF0YSB7XG5cdC8qKlxuXHQgKiBUaGUgY29udGVudCB0byB0aGUgcmlnaHQgb2YgdGhlIHByZWZpeC5cblx0ICovXG5cdGFmdGVyUHJlZml4Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgYWxpYXMgdXNlZC5cblx0ICovXG5cdGFsaWFzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCB1c2VkLlxuXHQgKi9cblx0Y29tbWFuZD86IENvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBjb250ZW50IHRvIHRoZSByaWdodCBvZiB0aGUgYWxpYXMuXG5cdCAqL1xuXHRjb250ZW50Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgcHJlZml4IHVzZWQuXG5cdCAqL1xuXHRwcmVmaXg/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgd2hldGhlciB0aGlzIG1lc3NhZ2Ugc2hvdWxkIGJlIGlnbm9yZWQgZm9yIGEgY2VydGFpbiBjaGVjay5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBjaGVjay5cbiAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBjaGVjay5cbiAqL1xuZXhwb3J0IHR5cGUgSWdub3JlQ2hlY2tQcmVkaWNhdGUgPSAobWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2UsIGNvbW1hbmQ6IENvbW1hbmQpID0+IGJvb2xlYW47XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgd2hldGhlciBtZW50aW9ucyBjYW4gYmUgdXNlZCBhcyBhIHByZWZpeC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBvcHRpb24gZm9yLlxuICovXG5leHBvcnQgdHlwZSBNZW50aW9uUHJlZml4UHJlZGljYXRlID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBwcmVmaXgoZXMpIHRvIHVzZS5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBnZXQgcHJlZml4IGZvci5cbiAqL1xuZXhwb3J0IHR5cGUgUHJlZml4U3VwcGxpZXIgPSAobWVzc2FnZTogTWVzc2FnZSkgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCBQcm9taXNlPHN0cmluZyB8IHN0cmluZ1tdPjtcbiJdfQ==