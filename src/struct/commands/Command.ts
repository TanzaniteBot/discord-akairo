/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
import {
	ApplicationCommandAutocompleteOption,
	ApplicationCommandChannelOptionData,
	ApplicationCommandChoicesData,
	ApplicationCommandNonOptionsData,
	ApplicationCommandNumericOptionData,
	ApplicationCommandSubCommandData,
	ApplicationCommandSubGroupData,
	Message,
	PermissionResolvable,
	Snowflake
} from "discord.js";
import AkairoError from "../../util/AkairoError.js";
import type AkairoMessage from "../../util/AkairoMessage.js";
import type Category from "../../util/Category.js";
import type AkairoClient from "../AkairoClient.js";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule.js";
import Argument, { ArgumentOptions, DefaultArgumentOptions } from "./arguments/Argument.js";
import ArgumentRunner, { ArgumentRunnerState } from "./arguments/ArgumentRunner.js";
import CommandHandler, { IgnoreCheckPredicate, PrefixSupplier, SlashResolveTypes } from "./CommandHandler.js";
import ContentParser, { ContentParserResult } from "./ContentParser.js";
import type Flag from "./Flag.js";

/**
 * Represents a command.
 */
export default abstract class Command extends AkairoModule {
	/**
	 * Command names.
	 */
	public declare aliases: string[];

	/**
	 * Default prompt options.
	 */
	public declare argumentDefaults: DefaultArgumentOptions;

	/**
	 * Category the command belongs to.
	 */
	public declare category: Category<string, Command>;

	/**
	 * Usable only in this channel type.
	 */
	public declare channel?: string;

	/**
	 * The Akairo client.
	 */
	public declare client: AkairoClient;

	/**
	 * Permissions required to run command by the client.
	 */
	public declare clientPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;

	/**
	 * Cooldown in milliseconds.
	 */
	public declare cooldown?: number;

	/**
	 * Description of the command.
	 */
	public declare description: any;

	/**
	 * Whether or not this command can be ran by an edit.
	 */
	public declare editable: boolean;

	/**
	 * The filepath.
	 */
	public declare filepath: string;

	/**
	 * The handler.
	 */
	public declare handler: CommandHandler;

	/**
	 * The ID of the command.
	 */
	public declare id: string;

	/**
	 * ID of user(s) to ignore cooldown or a function to ignore.
	 */
	public declare ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 */
	public declare ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * The key supplier for the locker.
	 */
	public declare lock?: KeySupplier | "channel" | "guild" | "user";

	/**
	 * Stores the current locks.
	 */
	public declare locker?: Set<string>;

	/**
	 * Whether or not the command can only be run in  NSFW channels.
	 */
	public declare onlyNsfw: boolean;

	/**
	 * Usable only by the client owner.
	 */
	public declare ownerOnly: boolean;

	/**
	 * Command prefix overwrite.
	 */
	public declare prefix?: string | string[] | PrefixSupplier;

	/**
	 * Whether or not to consider quotes.
	 */
	public declare quoted: boolean;

	/**
	 * Uses allowed before cooldown.
	 */
	public declare ratelimit: number;

	/**
	 * The regex trigger for this command.
	 */
	public declare regex?: RegExp | RegexSupplier;

	/**
	 * Mark command as slash command and set information.
	 */
	public declare slash?: boolean;

	/**
	 * Whether slash command responses for this command should be ephemeral or not.
	 */
	public declare slashEphemeral?: boolean;

	/**
	 * Assign slash commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
	 */
	public declare slashGuilds?: Snowflake[];

	/**
	 * Options for using the slash command.
	 */
	public declare slashOptions?: SlashOption[];

	/**
	 * Whether or not to allow client superUsers(s) only.
	 */
	public declare superUserOnly: boolean;

	/**
	 * Whether or not to type during command execution.
	 */
	public declare typing: boolean;

	/**
	 * Permissions required to run command by the user.
	 */
	public declare userPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;

	/**
	 * Argument options or generator.
	 */
	public declare _args?: ArgumentOptions[] | ArgumentGenerator;

	/**
	 * The content parser.
	 */
	public declare contentParser: ContentParser;

	/**
	 * The argument runner.
	 */
	public declare argumentRunner: ArgumentRunner;

	/**
	 * Only allows this command to be executed as a slash command.
	 */
	public declare slashOnly: boolean;

	/**
	 * Generator for arguments.
	 */
	public declare argumentGenerator: ArgumentGenerator;

	/**
	 * @param id - Command ID.
	 * @param options - Options for the command.
	 */
	constructor(id: string, options: CommandOptions = {}) {
		super(id, { category: options?.category });

		const {
			onlyNsfw = false,
			aliases = [],
			args = this._args || this.args || [],
			quoted = true,
			separator,
			channel = null!,
			ownerOnly = false,
			superUserOnly = false,
			editable = true,
			typing = false,
			cooldown = null!,
			ratelimit = 1,
			argumentDefaults = {},
			description = "",
			prefix = this.prefix,
			clientPermissions = this.clientPermissions,
			userPermissions = this.userPermissions,
			regex = this.regex,
			condition = this.condition || (() => false),
			before = this.before || (() => undefined),
			lock,
			ignoreCooldown,
			ignorePermissions,
			flags = [],
			optionFlags = [],
			slash = false,
			slashOptions,
			slashEphemeral = false,
			slashGuilds = [],
			slashOnly = false
		} = options;
		this.aliases = aliases;
		const { flagWords, optionFlagWords } = Array.isArray(args)
			? ContentParser.getFlags(args)
			: { flagWords: flags, optionFlagWords: optionFlags };
		this.contentParser = new ContentParser({
			flagWords,
			optionFlagWords,
			quoted,
			separator
		});
		this.argumentRunner = new ArgumentRunner(this);
		this.argumentGenerator = (
			Array.isArray(args)
				? ArgumentRunner.fromArguments(args.map(arg => [arg.id!, new Argument(this, arg)]))
				: args.bind(this)
		) as ArgumentGenerator;
		this.onlyNsfw = Boolean(onlyNsfw);
		this.channel = channel!;
		this.ownerOnly = Boolean(ownerOnly);
		this.superUserOnly = Boolean(superUserOnly);
		this.editable = Boolean(editable);
		this.typing = Boolean(typing);
		this.cooldown = cooldown!;
		this.ratelimit = ratelimit;
		this.argumentDefaults = argumentDefaults;
		this.description = Array.isArray(description) ? description.join("\n") : description;
		this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;
		this.clientPermissions = typeof clientPermissions === "function" ? clientPermissions.bind(this) : clientPermissions;
		this.userPermissions = typeof userPermissions === "function" ? userPermissions.bind(this) : userPermissions;
		this.regex = typeof regex === "function" ? regex.bind(this) : regex;
		this.condition = condition.bind(this);
		this.before = before.bind(this);
		this.lock = lock;
		if (typeof lock === "string") {
			this.lock = {
				guild: (message: Message | AkairoMessage): string => message.guild! && message.guild.id!,
				channel: (message: Message | AkairoMessage): string => message.channel!.id,
				user: (message: Message | AkairoMessage): string => message.author.id
			}[lock];
		}
		if (this.lock) this.locker = new Set();
		this.ignoreCooldown = typeof ignoreCooldown === "function" ? ignoreCooldown.bind(this) : ignoreCooldown;
		this.ignorePermissions = typeof ignorePermissions === "function" ? ignorePermissions.bind(this) : ignorePermissions;
		this.slashOptions = slashOptions;
		this.slashEphemeral = slashEphemeral;
		this.slash = slash;
		this.slashGuilds = slashGuilds;
		this.slashOnly = slashOnly;
	}

	/**
	 * Generator for arguments.
	 * When yielding argument options, that argument is ran and the result of the processing is given.
	 * The last value when the generator is done is the resulting `args` for the command's `exec`.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed content.
	 * @param state - Argument processing state.
	 */
	public *args(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState
	): IterableIterator<ArgumentOptions | Flag> {}

	/**
	 * Runs before argument parsing and execution.
	 * @param message - Message being handled.
	 */
	public before(message: Message): any {}

	/**
	 * Checks if the command should be ran by using an arbitrary condition.
	 * @param message - Message being handled.
	 */
	public condition(message: Message): boolean | Promise<boolean> {
		return false;
	}

	/**
	 * Executes the command.
	 * @param message - Message that triggered the command.
	 * @param args - Evaluated arguments.
	 */
	public exec(message: Message, args: any): any;
	public exec(message: Message | AkairoMessage, args: any): any;
	public exec(message: Message | AkairoMessage, args: any): any {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}

	/**
	 * Execute the slash command
	 * @param message - Message for slash command
	 * @param args - Slash command options
	 */
	public execSlash(message: AkairoMessage, ...args: any[]): any {
		if (this.slash) {
			throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "execSlash");
		}
	}

	/**
	 * Parses content using the command's arguments.
	 * @param message - Message to use.
	 * @param content - String to parse.
	 */
	public parse(message: Message, content: string): Promise<Flag | any> {
		const parsed = this.contentParser.parse(content);
		return this.argumentRunner.run(message, parsed, this.argumentGenerator);
	}
}

export default interface Command {
	/**
	 * Reloads the command.
	 */
	reload(): Promise<Command>;

	/**
	 * Removes the command.
	 */
	remove(): Command;
}

/**
 * Options to use for command execution behavior.
 */
export interface CommandOptions extends AkairoModuleOptions {
	/**
	 * Command names.
	 */
	aliases?: string[];

	/**
	 * Argument options or generator.
	 */
	args?: ArgumentOptions[] | ArgumentGenerator;

	/**
	 * The default argument options.
	 */
	argumentDefaults?: DefaultArgumentOptions;

	/**
	 * Function to run before argument parsing and execution.
	 */
	before?: BeforeAction;

	/**
	 * Restricts channel to either 'guild' or 'dm'.
	 */
	channel?: "guild" | "dm";

	/**
	 * Permissions required by the client to run this command.
	 */
	clientPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;

	/**
	 * Whether or not to run on messages that are not directly commands.
	 */
	condition?: ExecutionPredicate;

	/**
	 * The command cooldown in milliseconds.
	 */
	cooldown?: number;

	/**
	 * Description of the command.
	 */
	description?: string | any | any[];

	/**
	 * Whether or not message edits will run this command.
	 */
	editable?: boolean;

	/**
	 * Flags to use when using an ArgumentGenerator
	 */
	flags?: string[];

	/**
	 * ID of user(s) to ignore cooldown or a function to ignore.
	 */
	ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 */
	ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * The key type or key generator for the locker. If lock is a string, it's expected one of 'guild', 'channel', or 'user'
	 */
	lock?: KeySupplier | "guild" | "channel" | "user";

	/**
	 * Whether or not to only allow the command to be run in NSFW channels.
	 */
	onlyNsfw?: boolean;

	/**
	 * Option flags to use when using an ArgumentGenerator.
	 */
	optionFlags?: string[];

	/**
	 * Whether or not to allow client owner(s) only.
	 */
	ownerOnly?: boolean;

	/**
	 * The prefix(es) to overwrite the global one for this command.
	 */
	prefix?: string | string[] | PrefixSupplier;

	/**
	 * Whether or not to consider quotes.
	 */
	quoted?: boolean;

	/**
	 * Amount of command uses allowed until cooldown.
	 */
	ratelimit?: number;

	/**
	 * A regex to match in messages that are not directly commands. The args object will have `match` and `matches` properties.
	 */
	regex?: RegExp | RegexSupplier;

	/**
	 * Custom separator for argument input.
	 */
	separator?: string;

	/**
	 * Mark command as slash command and set information.
	 */
	slash?: boolean;

	/**
	 * Whether slash command responses for this command should be ephemeral or not.
	 */
	slashEphemeral?: boolean;

	/**
	 * Assign slash commands to Specific guilds. This option will make the commands not register globally, but only to the chosen servers.
	 */
	slashGuilds?: string[];

	/**
	 * Options for using the slash command.
	 */
	slashOptions?: SlashOption[];

	/**
	 * Whether or not to allow client superUsers(s) only.
	 */
	superUserOnly?: boolean;

	/**
	 * Whether or not to type in channel during execution.
	 */
	typing?: boolean;

	/**
	 * Permissions required by the user to run this command.
	 */
	userPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;

	/**
	 * Only allow this command to be used as a slash command. Also makes `slash` `true`
	 */
	slashOnly?: boolean;
}

/**
 * A function to run before argument parsing and execution.
 * @param message - Message that triggered the command.
 */
export type BeforeAction = (message: Message) => any;

/**
 * A function used to supply the key for the locker.
 * @param message - Message that triggered the command.
 * @param args - Evaluated arguments.
 */
export type KeySupplier = (message: Message | AkairoMessage, args: any) => string;

/**
 * A function used to check if the command should run arbitrarily.
 * @param message - Message to check.
 */
export type ExecutionPredicate = (message: Message) => boolean | Promise<boolean>;

/**
 * A function used to check if a message has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @param message - Message that triggered the command.
 */
export type MissingPermissionSupplier = (message: Message | AkairoMessage) => Promise<any> | any;

/**
 * A function used to return a regular expression.
 * @param message - Message to get regex for.
 */
export type RegexSupplier = (message: Message) => RegExp;

/**
 * Generator for arguments.
 * When yielding argument options, that argument is ran and the result of the processing is given.
 * The last value when the generator is done is the resulting `args` for the command's `exec`.
 * @param message - Message that triggered the command.
 * @param parsed - Parsed content.
 * @param state - Argument processing state.
 */
export type ArgumentGenerator = (
	message: Message,
	parsed: ContentParserResult,
	state: ArgumentRunnerState
) => IterableIterator<ArgumentOptions | Flag>;

export interface AkairoApplicationCommandSubGroupData extends ApplicationCommandSubGroupData {
	options?: AkairoApplicationCommandSubCommandData[];
}

export interface AkairoApplicationCommandSubCommandData extends ApplicationCommandSubCommandData {
	options?: (
		| AkairoApplicationCommandChoicesData
		| AkairoApplicationCommandNonOptionsData
		| AkairoApplicationCommandChannelOptionData
	)[];
}

export interface AkairoApplicationCommandChoicesData extends ApplicationCommandChoicesData {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is `USER`
	 */
	resolve?: SlashResolveTypes;
}

export interface AkairoApplicationCommandAutocompleteOption extends ApplicationCommandAutocompleteOption {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is `USER`
	 */
	resolve?: SlashResolveTypes;
}

export interface AkairoApplicationCommandNumericOptionData extends ApplicationCommandNumericOptionData {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is `USER`
	 */
	resolve?: SlashResolveTypes;
}

export interface AkairoApplicationCommandNonOptionsData extends ApplicationCommandNonOptionsData {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is `USER`
	 */
	resolve?: SlashResolveTypes;
}

export interface AkairoApplicationCommandChannelOptionData extends ApplicationCommandChannelOptionData {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is `USER`
	 */
	resolve?: SlashResolveTypes;
}

export type AkairoApplicationCommandOptionData =
	| AkairoApplicationCommandSubGroupData
	| AkairoApplicationCommandNonOptionsData
	| AkairoApplicationCommandChannelOptionData
	| AkairoApplicationCommandChoicesData
	| AkairoApplicationCommandAutocompleteOption
	| AkairoApplicationCommandNumericOptionData
	| AkairoApplicationCommandSubCommandData;

export type SlashOption = AkairoApplicationCommandOptionData & {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is `USER`
	 */
	resolve?: SlashResolveTypes;
};
