/// <reference types="node" />
import AkairoHandler, { AkairoHandlerOptions } from "../AkairoHandler";
import {
	Channel,
	Collection,
	CommandInteraction,
	Message,
	Snowflake,
	User
} from "discord.js";
import Command from "./Command";
import CommandUtil from "./CommandUtil";
import AkairoMessage from "../../util/AkairoMessage";
import TypeResolver from "./arguments/TypeResolver";
import AkairoClient from "../AkairoClient";
import AkairoModule from "../AkairoModule";
import InhibitorHandler from "../inhibitors/InhibitorHandler";
import ListenerHandler from "../listeners/ListenerHandler";
import Category from "../../util/Category";
import { DefaultArgumentOptions } from "./arguments/Argument";
/**
 * Loads commands and handles messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export default class CommandHandler extends AkairoHandler {
	/** Collection of command aliases. */
	aliases: Collection<string, string>;
	/** Regular expression to automatically make command aliases for. */
	aliasReplacement?: RegExp;
	/** Whether or not mentions are allowed for prefixing. */
	allowMention: boolean | MentionPrefixPredicate;
	/** Default argument options. */
	argumentDefaults: DefaultArgumentOptions;
	/** Automatically defer messages "BotName is thinking". */
	autoDefer: boolean;
	/**  Specify whether to register all slash commands when starting the client */
	autoRegisterSlashCommands: boolean;
	/** Whether or not to block bots. */
	blockBots: boolean;
	/** Whether or not to block self. */
	blockClient: boolean;
	/** Categories, mapped by ID to Category. */
	categories: Collection<string, Category<string, Command>>;
	/** Class to handle */
	classToHandle: typeof Command;
	/** The Akairo client. */
	client: AkairoClient;
	/** Whether or not `message.util` is assigned. */
	commandUtil: boolean;
	/** Milliseconds a message should exist for before its command util instance is marked for removal. */
	commandUtilLifetime: number;
	/** Collection of CommandUtils. */
	commandUtils: Collection<string, CommandUtil>;
	/** Time interval in milliseconds for sweeping command util instances. */
	commandUtilSweepInterval: number;
	/**
	 * Collection of cooldowns.
	 * <info>The elements in the collection are objects with user IDs as keys
	 * and {@link CooldownData} objects as values</info>
	 */
	cooldowns: Collection<
		string,
		{
			[id: string]: CooldownData;
		}
	>;
	/** Default cooldown for commands. */
	defaultCooldown: number;
	/** Directory to commands. */
	directory: string;
	/** Whether or not to use execSlash for slash commands. */
	execSlash: boolean;
	/** Whether or not members are fetched on each message author from a guild. */
	fetchMembers: boolean;
	/** Whether or not edits are handled. */
	handleEdits: boolean;
	/** ID of user(s) to ignore cooldown or a function to ignore. */
	ignoreCooldown: Snowflake | Snowflake[] | IgnoreCheckPredicate;
	/** ID of user(s) to ignore `userPermissions` checks or a function to ignore. */
	ignorePermissions: Snowflake | Snowflake[] | IgnoreCheckPredicate;
	/** Inhibitor handler to use. */
	inhibitorHandler?: InhibitorHandler;
	/** Commands loaded, mapped by ID to Command. */
	modules: Collection<string, Command>;
	/** The prefix(es) for command parsing. */
	prefix: string | string[] | PrefixSupplier;
	/** Collection of prefix overwrites to commands. */
	prefixes: Collection<string | PrefixSupplier, Set<string>>;
	/** Collection of sets of ongoing argument prompts. */
	prompts: Collection<string, Set<string>>;
	/** The type resolver. */
	resolver: TypeResolver;
	/** Whether or not to store messages in CommandUtil. */
	storeMessages: boolean;
	/** Show "BotName is typing" information message on the text channels when a command is running. */
	typing: boolean;
	constructor(
		client: AkairoClient,
		{
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter,
			blockClient,
			blockBots,
			fetchMembers,
			handleEdits,
			storeMessages,
			commandUtil,
			commandUtilLifetime,
			commandUtilSweepInterval,
			defaultCooldown,
			ignoreCooldown,
			ignorePermissions,
			argumentDefaults,
			prefix,
			allowMention,
			aliasReplacement,
			autoDefer,
			typing,
			autoRegisterSlashCommands,
			execSlash
		}?: CommandHandlerOptions
	);
	setup(): void;
	registerSlashCommands(): void;
	/**
	 * Registers a module.
	 * @param {Command} command - Module to use.
	 * @param {string} [filepath] - Filepath of module.
	 * @returns {void}
	 */
	register(command: Command, filepath: string): void;
	/**
	 * Deregisters a module.
	 * @param {Command} command - Module to use.
	 * @returns {void}
	 */
	deregister(command: Command): void;
	/**
	 * Handles a message.
	 * @param {Message} message - Message to handle.
	 * @returns {Promise<?boolean>}
	 */
	handle(message: Message): Promise<boolean | null>;
	/**
	 * Handles a slash command.
	 * @param {CommandInteraction} interaction - Interaction to handle.
	 * @returns {Promise<?boolean>}
	 */
	handleSlash(interaction: CommandInteraction): Promise<boolean | null>;
	/**
	 * Handles normal commands.
	 * @param {Message} message - Message to handle.
	 * @param {string} content - Content of message without command.
	 * @param {Command} command - Command instance.
	 * @param {boolean} [ignore=false] - Ignore inhibitors and other checks.
	 * @returns {Promise<?boolean>}
	 */
	handleDirectCommand(
		message: Message,
		content: string,
		command: Command,
		ignore?: boolean
	): Promise<boolean | null>;
	/**
	 * Handles regex and conditional commands.
	 * @param {Message} message - Message to handle.
	 * @returns {Promise<boolean>}
	 */
	handleRegexAndConditionalCommands(message: Message): Promise<boolean>;
	/**
	 * Handles regex commands.
	 * @param {Message} message - Message to handle.
	 * @returns {Promise<boolean>}
	 */
	handleRegexCommands(message: Message): Promise<boolean>;
	/**
	 * Handles conditional commands.
	 * @param {Message} message - Message to handle.
	 * @returns {Promise<boolean>}
	 */
	handleConditionalCommands(message: Message): Promise<boolean>;
	/**
	 * Runs inhibitors with the all type.
	 * @param {Message|AkairoMessage} message - Message to handle.
	 * @param {boolean} slash - Whether or not the command should is a slash command.
	 * @returns {Promise<boolean>}
	 */
	runAllTypeInhibitors(
		message: Message | AkairoMessage,
		slash?: boolean
	): Promise<boolean>;
	/**
	 * Runs inhibitors with the pre type.
	 * @param {Message|AkairoMessage} message - Message to handle.
	 * @returns {Promise<boolean>}
	 */
	runPreTypeInhibitors(message: Message | AkairoMessage): Promise<boolean>;
	/**
	 * Runs inhibitors with the post type.
	 * @param {Message|AkairoMessage} message - Message to handle.
	 * @param {Command} command - Command to handle.
	 * @param {boolean} slash - Whether or not the command should is a slash command.
	 * @returns {Promise<boolean>}
	 */
	runPostTypeInhibitors(
		message: Message | AkairoMessage,
		command: Command,
		slash?: boolean
	): Promise<boolean>;
	/**
	 * Runs permission checks.
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @param {Command} command - Command to cooldown.
	 * @param {boolean} slash - Whether or not the command is a slash command.
	 * @returns {Promise<boolean>}
	 */
	runPermissionChecks(
		message: Message | AkairoMessage,
		command: Command,
		slash?: boolean
	): Promise<boolean>;
	/**
	 * Runs cooldowns and checks if a user is under cooldown.
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @param {Command} command - Command to cooldown.
	 * @returns {boolean}
	 */
	runCooldowns(message: Message | AkairoMessage, command: Command): boolean;
	/**
	 * Runs a command.
	 * @param {Message} message - Message to handle.
	 * @param {Command} command - Command to handle.
	 * @param {any} args - Arguments to use.
	 * @returns {Promise<void>}
	 */
	runCommand(message: Message, command: Command, args: any): Promise<void>;
	/**
	 * Parses the command and its argument list.
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @returns {Promise<ParsedComponentData>}
	 */
	parseCommand(message: Message | AkairoMessage): Promise<ParsedComponentData>;
	/**
	 * Parses the command and its argument list using prefix overwrites.
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @returns {Promise<ParsedComponentData>}
	 */
	parseCommandOverwrittenPrefixes(
		message: Message | AkairoMessage
	): Promise<ParsedComponentData>;
	/**
	 * Runs parseWithPrefix on multiple prefixes and returns the best parse.
	 * @param {Message|AkairoMessage} message - Message to parse.
	 * @param {any[]} pairs - Pairs of prefix to associated commands.
	 * That is, `[string, Set<string> | null][]`.
	 * @returns {ParsedComponentData}
	 */
	parseMultiplePrefixes(
		message: Message | AkairoMessage,
		pairs: any[]
	): ParsedComponentData;
	/**
	 * Tries to parse a message with the given prefix and associated commands.
	 * Associated commands refer to when a prefix is used in prefix overrides.
	 * @param {Message|AkairoMessage} message - Message to parse.
	 * @param {string} prefix - Prefix to use.
	 * @param {Set<string>|null} [associatedCommands=null] - Associated commands.
	 * @returns {ParsedComponentData}
	 */
	parseWithPrefix(
		message: Message | AkairoMessage,
		prefix: string,
		associatedCommands?: Set<string> | null
	): ParsedComponentData;
	/**
	 * Handles errors from the handling.
	 * @param {Error} err - The error.
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @param {Command|AkairoModule} [command] - Command that errored.
	 * @returns {void}
	 */
	emitError(
		err: Error,
		message: Message | AkairoMessage,
		command: Command | AkairoModule
	): void;
	/**
	 * Sweep command util instances from cache and returns amount sweeped.
	 * @param {number} lifetime - Messages older than this will have their command util instance sweeped.
	 * This is in milliseconds and defaults to the `commandUtilLifetime` option.
	 * @returns {number}
	 */
	sweepCommandUtil(lifetime?: number): number;
	/**
	 * Adds an ongoing prompt in order to prevent command usage in the channel.
	 * @param {Channel} channel - Channel to add to.
	 * @param {User} user - User to add.
	 * @returns {void}
	 */
	addPrompt(channel: Channel, user: User): void;
	/**
	 * Removes an ongoing prompt.
	 * @param {Channel} channel - Channel to remove from.
	 * @param {User} user - User to remove.
	 * @returns {void}
	 */
	removePrompt(channel: Channel, user: User): void;
	/**
	 * Checks if there is an ongoing prompt.
	 * @param {Channel} channel - Channel to check.
	 * @param {User} user - User to check.
	 * @returns {boolean}
	 */
	hasPrompt(channel: Channel, user: User): boolean;
	/**
	 * Finds a command by alias.
	 * @param {string} name - Alias to find with.
	 * @returns {Command}
	 */
	findCommand(name: string): Command;
	/**
	 * Set the inhibitor handler to use.
	 * @param {InhibitorHandler} inhibitorHandler - The inhibitor handler.
	 * @returns {CommandHandler}
	 */
	useInhibitorHandler(inhibitorHandler: InhibitorHandler): CommandHandler;
	/**
	 * Set the listener handler to use.
	 * @param {ListenerHandler} listenerHandler - The listener handler.
	 * @returns {CommandHandler}
	 */
	useListenerHandler(listenerHandler: ListenerHandler): CommandHandler;
}
export interface CommandHandlerOptions extends AkairoHandlerOptions {
	/**
	 * Regular expression to automatically make command aliases.
	 * For example, using `/-/g` would mean that aliases containing `-` would be valid with and without it.
	 * So, the alias `command-name` is valid as both `command-name` and `commandname`.
	 */
	aliasReplacement?: RegExp;
	/** Whether or not to allow mentions to the client user as a prefix. */
	allowMention?: boolean | MentionPrefixPredicate;
	/**  Default argument options. */
	argumentDefaults?: DefaultArgumentOptions;
	/** Automatically defer messages "BotName is thinking" */
	autoDefer?: boolean;
	/** Specify whether to register all slash commands when starting the client. */
	autoRegisterSlashCommands?: boolean;
	/** Whether or not to block bots. */
	blockBots?: boolean;
	/**  Whether or not to block self. */
	blockClient?: boolean;
	/** Whether or not to assign `message.util`. */
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
	/** Default cooldown for commands. */
	defaultCooldown?: number;
	/** Whether or not members are fetched on each message author from a guild. */
	fetchMembers?: boolean;
	/** Whether or not to handle edited messages using CommandUtil. */
	handleEdits?: boolean;
	/** ID of user(s) to ignore cooldown or a function to ignore. Defaults to the client owner(s). */
	ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
	/** ID of user(s) to ignore `userPermissions` checks or a function to ignore. */
	ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
	/** The prefix(es) for command parsing. */
	prefix?: string | string[] | PrefixSupplier;
	/** Whether or not to store messages in CommandUtil. */
	storeMessages?: boolean;
	/** Show "BotName is typing" information message on the text channels when a command is running. */
	typing?: boolean;
	/** Whether or not to use execSlash for slash commands. */
	execSlash?: boolean;
}
/**
 * Data for managing cooldowns.
 */
export interface CooldownData {
	/** When the cooldown ends. */
	end: number;
	/** Timeout object. */
	timer: NodeJS.Timer;
	/** Number of times the command has been used. */
	uses: number;
}
/**
 * Various parsed components of the message.
 */
export interface ParsedComponentData {
	/** The content to the right of the prefix. */
	afterPrefix?: string;
	/** The alias used. */
	alias?: string;
	/** The command used. */
	command?: Command;
	/** The content to the right of the alias. */
	content?: string;
	/** The prefix used. */
	prefix?: string;
}
/**
 * A function that returns whether this message should be ignored for a certain check.
 * @param message - Message to check.
 * @param command - Command to check.
 */
export declare type IgnoreCheckPredicate = (
	message: Message | AkairoMessage,
	command: Command
) => boolean;
/**
 * A function that returns whether mentions can be used as a prefix.
 * @param message - Message to option for.
 */
export declare type MentionPrefixPredicate = (
	message: Message
) => boolean | Promise<boolean>;
/**
 * A function that returns the prefix(es) to use.
 * @param message - Message to get prefix for.
 */
export declare type PrefixSupplier = (
	message: Message
) => string | string[] | Promise<string | string[]>;
//# sourceMappingURL=CommandHandler.d.ts.map
