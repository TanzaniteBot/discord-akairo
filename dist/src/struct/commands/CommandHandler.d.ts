/// <reference types="node" />
import { Awaited, Collection, CommandInteraction, Message, Snowflake, TextBasedChannels, User } from "discord.js";
import { CommandHandlerEvents as CommandHandlerEventsType } from "../../typings/events";
import AkairoMessage from "../../util/AkairoMessage";
import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from "../AkairoHandler";
import AkairoModule from "../AkairoModule";
import InhibitorHandler from "../inhibitors/InhibitorHandler";
import ListenerHandler from "../listeners/ListenerHandler";
import { DefaultArgumentOptions } from "./arguments/Argument";
import TypeResolver from "./arguments/TypeResolver";
import Command from "./Command";
import CommandUtil from "./CommandUtil";
/**
 * Loads commands and handles messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export default class CommandHandler extends AkairoHandler {
    constructor(client: AkairoClient, { directory, classToHandle, extensions, automateCategories, loadFilter, blockClient, blockBots, fetchMembers, handleEdits, storeMessages, commandUtil, commandUtilLifetime, commandUtilSweepInterval, defaultCooldown, ignoreCooldown, ignorePermissions, argumentDefaults, prefix, allowMention, aliasReplacement, autoDefer, typing, autoRegisterSlashCommands, execSlash, skipBuiltInPostInhibitors }?: CommandHandlerOptions);
    /**
     * Collection of command aliases.
     */
    aliases: Collection<string, string>;
    /**
     * Regular expression to automatically make command aliases for.
     */
    aliasReplacement?: RegExp;
    /**
     * Whether or not mentions are allowed for prefixing.
     */
    allowMention: boolean | MentionPrefixPredicate;
    /**
     * Default argument options.
     */
    argumentDefaults: DefaultArgumentOptions;
    /**
     * Automatically defer messages "BotName is thinking".
     */
    autoDefer: boolean;
    /**
     * Specify whether to register all slash commands when starting the client
     */
    autoRegisterSlashCommands: boolean;
    /**
     * Whether or not to block bots.
     */
    blockBots: boolean;
    /**
     * Whether or not to block self.
     */
    blockClient: boolean;
    /**
     * Categories, mapped by ID to Category.
     */
    categories: Collection<string, Category<string, Command>>;
    /**
     * Class to handle
     */
    classToHandle: typeof Command;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * Whether or not `message.util` is assigned.
     */
    commandUtil: boolean;
    /**
     * Milliseconds a message should exist for before its command util instance is marked for removal.
     */
    commandUtilLifetime: number;
    /**
     * Collection of CommandUtils.
     */
    commandUtils: Collection<string, CommandUtil>;
    /**
     * Time interval in milliseconds for sweeping command util instances.
     */
    commandUtilSweepInterval: number;
    /**
     * Collection of cooldowns.
     * <info>The elements in the collection are objects with user IDs as keys
     * and {@link CooldownData} objects as values</info>
     */
    cooldowns: Collection<string, {
        [id: string]: CooldownData;
    }>;
    /**
     * Default cooldown for commands.
     */
    defaultCooldown: number;
    /**
     * Directory to commands.
     */
    directory: string;
    /**
     * Whether or not to use execSlash for slash commands.
     */
    execSlash: boolean;
    /**
     * Whether or not members are fetched on each message author from a guild.
     */
    fetchMembers: boolean;
    /**
     * Whether or not edits are handled.
     */
    handleEdits: boolean;
    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    ignoreCooldown: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    ignorePermissions: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * Inhibitor handler to use.
     */
    inhibitorHandler?: InhibitorHandler;
    /**
     * Commands loaded, mapped by ID to Command.
     */
    modules: Collection<string, Command>;
    /**
     * The prefix(es) for command parsing.
     */
    prefix: string | string[] | PrefixSupplier;
    /**
     * Collection of prefix overwrites to commands.
     */
    prefixes: Collection<string | PrefixSupplier, Set<string>>;
    /**
     * Collection of sets of ongoing argument prompts.
     */
    prompts: Collection<string, Set<string>>;
    /**
     * The type resolver.
     */
    resolver: TypeResolver;
    /**
     * Whether or not to store messages in CommandUtil.
     */
    storeMessages: boolean;
    /**
     * Show "BotName is typing" information message on the text channels when a command is running.
     */
    typing: boolean;
    /**
     * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
     */
    skipBuiltInPostInhibitors?: boolean;
    protected setup(): void;
    protected registerInteractionCommands(): Promise<void>;
    protected updateInteractionPermissions(owners: Snowflake | Snowflake[], superUsers: Snowflake | Snowflake[]): Promise<void>;
    /**
     * Registers a module.
     * @param command - Module to use.
     * @param filepath - Filepath of module.
     */
    register(command: Command, filepath?: string): void;
    /**
     * Deregisters a module.
     * @param command - Module to use.
     */
    deregister(command: Command): void;
    /**
     * Handles a message.
     * @param message - Message to handle.
     */
    handle(message: Message): Promise<boolean | null>;
    /**
     * Handles a slash command.
     * @param interaction - Interaction to handle.
     */
    handleSlash(interaction: CommandInteraction): Promise<boolean | null>;
    /**
     * Handles normal commands.
     * @param message - Message to handle.
     * @param content - Content of message without command.
     * @param command - Command instance.
     * @param ignore - Ignore inhibitors and other checks.
     */
    handleDirectCommand(message: Message, content: string, command: Command, ignore?: boolean): Promise<boolean | null>;
    /**
     * Handles regex and conditional commands.
     * @param message - Message to handle.
     */
    handleRegexAndConditionalCommands(message: Message): Promise<boolean>;
    /**
     * Handles regex commands.
     * @param message - Message to handle.
     */
    handleRegexCommands(message: Message): Promise<boolean>;
    /**
     * Handles conditional commands.
     * @param message - Message to handle.
     */
    handleConditionalCommands(message: Message): Promise<boolean>;
    /**
     * Runs inhibitors with the all type.
     * @param message - Message to handle.
     * @param slash - Whether or not the command should is a slash command.
     */
    runAllTypeInhibitors(message: Message | AkairoMessage, slash?: boolean): Promise<boolean>;
    /**
     * Runs inhibitors with the pre type.
     * @param message - Message to handle.
     */
    runPreTypeInhibitors(message: Message | AkairoMessage): Promise<boolean>;
    /**
     * Runs inhibitors with the post type.
     * @param message - Message to handle.
     * @param command - Command to handle.
     * @param slash - Whether or not the command should is a slash command.
     */
    runPostTypeInhibitors(message: Message | AkairoMessage, command: Command, slash?: boolean): Promise<boolean>;
    /**
     * Runs permission checks.
     * @param message - Message that called the command.
     * @param command - Command to cooldown.
     * @param slash - Whether or not the command is a slash command.
     */
    runPermissionChecks(message: Message | AkairoMessage, command: Command, slash?: boolean): Promise<boolean>;
    /**
     * Runs cooldowns and checks if a user is under cooldown.
     * @param message - Message that called the command.
     * @param command - Command to cooldown.
     */
    runCooldowns(message: Message | AkairoMessage, command: Command): boolean;
    /**
     * Runs a command.
     * @param message - Message to handle.
     * @param command - Command to handle.
     * @param args - Arguments to use.
     */
    runCommand(message: Message, command: Command, args: any): Promise<void>;
    /**
     * Parses the command and its argument list.
     * @param message - Message that called the command.
     */
    parseCommand(message: Message | AkairoMessage): Promise<ParsedComponentData>;
    /**
     * Parses the command and its argument list using prefix overwrites.
     * @param message - Message that called the command.
     */
    parseCommandOverwrittenPrefixes(message: Message | AkairoMessage): Promise<ParsedComponentData>;
    /**
     * Runs parseWithPrefix on multiple prefixes and returns the best parse.
     * @param message - Message to parse.
     * @param pairs - Pairs of prefix to associated commands. That is, `[string, Set<string> | null][]`.
     */
    parseMultiplePrefixes(message: Message | AkairoMessage, pairs: [string, Set<string> | null][]): ParsedComponentData;
    /**
     * Tries to parse a message with the given prefix and associated commands.
     * Associated commands refer to when a prefix is used in prefix overrides.
     * @param message - Message to parse.
     * @param prefix - Prefix to use.
     * @param associatedCommands - Associated commands.
     */
    parseWithPrefix(message: Message | AkairoMessage, prefix: string, associatedCommands?: Set<string> | null): ParsedComponentData;
    /**
     * Handles errors from the handling.
     * @param err - The error.
     * @param message - Message that called the command.
     * @param command - Command that errored.
     */
    emitError(err: Error, message: Message | AkairoMessage, command?: Command | AkairoModule): void;
    /**
     * Sweep command util instances from cache and returns amount sweeped.
     * @param lifetime - Messages older than this will have their command util instance sweeped. This is in milliseconds and defaults to the `commandUtilLifetime` option.
     */
    sweepCommandUtil(lifetime?: number): number;
    /**
     * Adds an ongoing prompt in order to prevent command usage in the channel.
     * @param channel - Channel to add to.
     * @param user - User to add.
     */
    addPrompt(channel: TextBasedChannels, user: User): void;
    /**
     * Removes an ongoing prompt.
     * @param channel - Channel to remove from.
     * @param user - User to remove.
     */
    removePrompt(channel: TextBasedChannels, user: User): void;
    /**
     * Checks if there is an ongoing prompt.
     * @param channel - Channel to check.
     * @param user - User to check.
     */
    hasPrompt(channel: TextBasedChannels, user: User): boolean;
    /**
     * Finds a command by alias.
     * @param name - Alias to find with.
     */
    findCommand(name: string): Command;
    /**
     * Set the inhibitor handler to use.
     * @param inhibitorHandler - The inhibitor handler.
     */
    useInhibitorHandler(inhibitorHandler: InhibitorHandler): CommandHandler;
    /**
     * Set the listener handler to use.
     * @param listenerHandler - The listener handler.
     */
    useListenerHandler(listenerHandler: ListenerHandler): CommandHandler;
    /**
     * Loads a command.
     * @param thing - Module or path to module.
     */
    load(thing: string | Command): Command;
    /**
     * Reads all commands from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory?: string, filter?: LoadPredicate): CommandHandler;
    /**
     * Removes a command.
     * @param id - ID of the command.
     */
    remove(id: string): Command;
    /**
     * Removes all commands.
     */
    removeAll(): CommandHandler;
    /**
     * Reloads a command.
     * @param id - ID of the command.
     */
    reload(id: string): Command;
    /**
     * Reloads all commands.
     */
    reloadAll(): CommandHandler;
    on<K extends keyof CommandHandlerEventsType>(event: K, listener: (...args: CommandHandlerEventsType[K][]) => Awaited<void>): this;
    once<K extends keyof CommandHandlerEventsType>(event: K, listener: (...args: CommandHandlerEventsType[K][]) => Awaited<void>): this;
}
export interface CommandHandlerOptions extends AkairoHandlerOptions {
    /**
     * Regular expression to automatically make command aliases.
     * For example, using `/-/g` would mean that aliases containing `-` would be valid with and without it.
     * So, the alias `command-name` is valid as both `command-name` and `commandname`.
     */
    aliasReplacement?: RegExp;
    /**
     * Whether or not to allow mentions to the client user as a prefix.
     */
    allowMention?: boolean | MentionPrefixPredicate;
    /**
     * Default argument options.
     */
    argumentDefaults?: DefaultArgumentOptions;
    /**
     * Automatically defer messages "BotName is thinking"
     */
    autoDefer?: boolean;
    /**
     * Specify whether to register all slash commands when starting the client.
     */
    autoRegisterSlashCommands?: boolean;
    /**
     * Whether or not to block bots.
     */
    blockBots?: boolean;
    /**
     * Whether or not to block self.
     */
    blockClient?: boolean;
    /**
     * Whether or not to assign `message.util`.
     */
    commandUtil?: boolean;
    /**
     * Milliseconds a message should exist for before its command util instance is marked for removal.
     * If 0, CommandUtil instances will never be removed and will cause memory to increase indefinitely.
     */
    commandUtilLifetime?: number;
    /**
     * Time interval in milliseconds for sweeping command util instances.
     * If 0, CommandUtil instances will never be removed and will cause memory to increase indefinitely.
     */
    commandUtilSweepInterval?: number;
    /**
     * Default cooldown for commands.
     */
    defaultCooldown?: number;
    /**
     * Whether or not members are fetched on each message author from a guild.
     */
    fetchMembers?: boolean;
    /**
     * Whether or not to handle edited messages using CommandUtil.
     */
    handleEdits?: boolean;
    /**
     * ID of user(s) to ignore cooldown or a function to ignore. Defaults to the client owner(s).
     */
    ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * The prefix(es) for command parsing.
     */
    prefix?: string | string[] | PrefixSupplier;
    /**
     * Whether or not to store messages in CommandUtil.
     */
    storeMessages?: boolean;
    /**
     * Show "BotName is typing" information message on the text channels when a command is running.
     */
    typing?: boolean;
    /**
     * Whether or not to use execSlash for slash commands.
     */
    execSlash?: boolean;
    /**
     * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
     */
    skipBuiltInPostInhibitors?: boolean;
}
/**
 * Data for managing cooldowns.
 */
export interface CooldownData {
    /**
     * When the cooldown ends.
     */
    end: number;
    /**
     * Timeout object.
     */
    timer: NodeJS.Timer;
    /**
     * Number of times the command has been used.
     */
    uses: number;
}
/**
 * Various parsed components of the message.
 */
export interface ParsedComponentData {
    /**
     * The content to the right of the prefix.
     */
    afterPrefix?: string;
    /**
     * The alias used.
     */
    alias?: string;
    /**
     * The command used.
     */
    command?: Command;
    /**
     * The content to the right of the alias.
     */
    content?: string;
    /**
     * The prefix used.
     */
    prefix?: string;
}
/**
 * A function that returns whether this message should be ignored for a certain check.
 * @param message - Message to check.
 * @param command - Command to check.
 */
export declare type IgnoreCheckPredicate = (message: Message | AkairoMessage, command: Command) => boolean;
/**
 * A function that returns whether mentions can be used as a prefix.
 * @param message - Message to option for.
 */
export declare type MentionPrefixPredicate = (message: Message) => boolean | Promise<boolean>;
/**
 * A function that returns the prefix(es) to use.
 * @param message - Message to get prefix for.
 */
export declare type PrefixSupplier = (message: Message) => string | string[] | Promise<string | string[]>;
//# sourceMappingURL=CommandHandler.d.ts.map