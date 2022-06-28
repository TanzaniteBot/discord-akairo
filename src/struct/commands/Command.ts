/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
	ApplicationCommandAutocompleteOption,
	ApplicationCommandChannelOptionData,
	ApplicationCommandChoicesData,
	ApplicationCommandNonOptionsData,
	ApplicationCommandNumericOptionData,
	ApplicationCommandOptionType,
	ApplicationCommandSubCommandData,
	ApplicationCommandSubGroupData,
	AutocompleteInteraction,
	LocalizationMap,
	Message,
	PermissionResolvable,
	Snowflake
} from "discord.js";
import { SyncOrAsync } from "../../typings/Util.js";
import type { AkairoMessage } from "../../util/AkairoMessage.js";
import { isArrayOf, isStringArrayStringOrFunc, patchAbstract } from "../../util/Util.js";
import { AkairoModule, type AkairoModuleOptions } from "../AkairoModule.js";
import {
	Argument,
	type ArgumentOptions,
	type ArgumentTypeCasterReturn,
	type DefaultArgumentOptions
} from "./arguments/Argument.js";
import { ArgumentRunner, type ArgumentRunnerState } from "./arguments/ArgumentRunner.js";
import type { CommandHandler, IgnoreCheckPredicate, PrefixSupplier, SlashResolveType } from "./CommandHandler.js";
import { ContentParser, type ContentParserResult } from "./ContentParser.js";
import type { Flag } from "./Flag.js";

/**
 * Represents a command.
 */
export abstract class Command extends AkairoModule<CommandHandler, Command> {
	/**
	 * Command names.
	 */
	public aliases: string[];

	/**
	 * The content parser.
	 */
	private contentParser: ContentParser;

	/**
	 * The argument runner.
	 */
	private argumentRunner: ArgumentRunner;

	/**
	 * Default prompt options.
	 */
	public argumentDefaults: DefaultArgumentOptions;

	/**
	 * Generator for arguments.
	 */
	private argumentGenerator: ArgumentGenerator;

	/**
	 * Usable only in this channel type.
	 */
	public channel?: string;

	/**
	 * Usable only by the client owner.
	 */
	public ownerOnly: boolean;

	/**
	 * Permissions required to run command by the client.
	 */
	public clientPermissions?: PermissionResolvable | MissingPermissionSupplier;

	/**
	 * Cooldown in milliseconds.
	 */
	public cooldown: number | null;

	/**
	 * Description of the command.
	 */
	public description: string | any;

	/**
	 * Whether or not this command can be ran by an edit.
	 */
	public editable: boolean;

	/**
	 * ID of user(s) to ignore cooldown or a function to ignore.
	 */
	public ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 */
	public ignorePermissions?: Snowflake | Snowflake[] | OmitThisParameter<IgnoreCheckPredicate>;

	/**
	 * The slash command localizations.
	 */
	public localization: CommandLocalization;

	/**
	 * The key supplier for the locker.
	 */
	public lock?: KeySupplier;

	/**
	 * Stores the current locks.
	 */
	public locker?: Set<string>;

	/**
	 * Whether or not the command can only be run in  NSFW channels.
	 */
	public onlyNsfw: boolean;

	/**
	 * Whether or not to allow client superUsers(s) only.
	 */
	public superUserOnly: boolean;

	/**
	 * Command prefix overwrite.
	 */
	public prefix?: string | string[] | PrefixSupplier;

	/**
	 * Uses allowed before cooldown.
	 */
	public ratelimit: number;

	/**
	 * The regex trigger for this command.
	 */
	public regex?: RegExp | RegexSupplier;

	/**
	 * Mark command as slash command and set information.
	 */
	public slash?: boolean;

	/**
	 * The default bitfield used to determine whether this command be used in a guild
	 */
	public slashDefaultMemberPermissions?: PermissionResolvable;

	/**
	 * Whether the command is enabled in DMs
	 *
	 * **Cannot be enabled for commands that specify `slashGuilds`**
	 */
	public slashDmPermission?: boolean;

	/**
	 * Whether slash command responses for this command should be ephemeral or not.
	 */
	public slashEphemeral?: boolean;

	/**
	 * Assign slash commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
	 */
	public slashGuilds?: Snowflake[];

	/**
	 * Options for using the slash command.
	 */
	public slashOptions?: SlashOption[];

	/**
	 * Only allows this command to be executed as a slash command.
	 */
	public slashOnly: boolean;

	/**
	 * Whether or not to type during command execution.
	 */
	public typing: boolean;

	/**
	 * Permissions required to run command by the user.
	 */
	public userPermissions?: PermissionResolvable | MissingPermissionSupplier;

	/**
	 * @param id - Command ID.
	 * @param options - Options for the command.
	 */
	// eslint-disable-next-line complexity
	public constructor(id: string, options?: CommandOptions) {
		super(id, { category: options?.category });

		const {
			aliases = [],
			args = this.args || [],
			argumentDefaults = {},
			before = this.before || (() => undefined),
			channel = null,
			clientPermissions = this.clientPermissions,
			condition = this.condition || (() => false),
			cooldown = null,
			description = "",
			editable = true,
			flags = [],
			ignoreCooldown,
			ignorePermissions,
			localization = {},
			lock,
			onlyNsfw = false,
			optionFlags = [],
			ownerOnly = false,
			prefix = this.prefix,
			quoted = true,
			ratelimit = 1,
			regex = this.regex,
			separator,
			slash = false,
			slashEphemeral = false,
			slashGuilds = [],
			slashOnly = false,
			slashOptions,
			superUserOnly = false,
			typing = false,
			userPermissions = this.userPermissions
		} = options ?? {};

		// ts doesn't like it when I reference other properties when using destructuring syntax
		const {
			slashDefaultMemberPermissions = userPermissions && typeof userPermissions !== "function" ? userPermissions : undefined,
			slashDmPermission = slashGuilds.length > 0 ? channel === null || channel === "dm" : undefined
		} = options ?? {};

		if (!isArrayOf(aliases, "string")) throw new TypeError("options.aliases must be an array of strings.");
		if (typeof args !== "function" && !isArrayOf(args, "object"))
			throw new TypeError("options.args must be an array of argument objects or a function.");
		if (typeof argumentDefaults !== "object") throw new TypeError("options.argumentDefaults must be an object.");
		if (typeof before !== "function") throw new TypeError("options.before must be a function.");
		if (!(["guild", "dm", null] as const).includes(channel))
			throw new TypeError('options.channel must be either "guild" or "dm" or null.');
		if (typeof condition !== "function") throw new TypeError("options.condition must be a function.");
		if (typeof cooldown !== "number" && cooldown !== null) throw new TypeError("options.cooldown must be a number or null.");
		if (typeof editable !== "boolean") throw new TypeError("options.editable must be a boolean.");
		if (!isArrayOf(flags, "string")) throw new TypeError("options.flags must be an array of strings.");
		if (ignoreCooldown !== undefined && !isStringArrayStringOrFunc(ignoreCooldown))
			throw new TypeError("options.ignoreCooldown must be a string, function, or array of strings.");
		if (ignorePermissions !== undefined && !isStringArrayStringOrFunc(ignorePermissions))
			throw new TypeError("options.ignorePermissions must be a string, function, or array of strings.");
		if (typeof localization !== "object") throw new TypeError("options.localization must be an object.");
		if (lock !== undefined && typeof lock !== "function" && !(["channel", "guild", "user"] as const).includes(lock))
			throw new TypeError("options.lock must be a function or a string with a value of 'channel', 'guild', or 'user'.");
		if (typeof onlyNsfw !== "boolean") throw new TypeError("options.onlyNsfw must be a boolean.");
		if (!isArrayOf(optionFlags, "string")) throw new TypeError("options.optionFlags must be an array of strings.");
		if (typeof ownerOnly !== "boolean") throw new TypeError("options.ownerOnly must be a boolean.");
		if (prefix !== undefined && !isStringArrayStringOrFunc(prefix))
			throw new TypeError("options.prefix must be a string, function, or array of strings.");
		if (typeof quoted !== "boolean") throw new TypeError("options.quoted must be a boolean.");
		if (typeof ratelimit !== "number") throw new TypeError("options.ratelimit must be a number.");
		if (regex !== undefined && typeof regex !== "function" && !(regex instanceof RegExp))
			throw new TypeError("options.regex must be a function or a RegExp.");
		if (separator !== undefined && typeof separator !== "string") throw new TypeError("options.separator must be a string.");
		if (typeof slash !== "boolean") throw new TypeError("options.slash must be a boolean.");
		if (slashDmPermission !== undefined && typeof slashDmPermission !== "boolean")
			throw new TypeError("options.slashDmPermission must be a boolean.");
		if (typeof slashDmPermission !== "boolean" && slashGuilds.length > 0)
			throw new TypeError("You cannot set `options.slashDmPermission` with commands configured with `options.slashGuilds`.");
		if (typeof slashEphemeral !== "boolean") throw new TypeError("options.slashEphemeral must be a boolean.");
		if (!isArrayOf(slashGuilds, "string")) throw new TypeError("options.slashGuilds must be an array of strings.");
		if (typeof slashOnly !== "boolean") throw new TypeError("options.slashOnly must be a boolean.");
		if (slashOptions !== undefined && !isArrayOf(slashOptions, "object"))
			throw new TypeError("options.slashOptions must be an array of objects.");
		if (typeof superUserOnly !== "boolean") throw new TypeError("options.superUserOnly must be a boolean.");
		if (typeof typing !== "boolean") throw new TypeError("options.typing must be a boolean.");

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
		this.argumentGenerator = Array.isArray(args)
			? ArgumentRunner.fromArguments(args.map(arg => [arg.id!, new Argument(this, arg)]))
			: args.bind(this);
		this.argumentDefaults = argumentDefaults;
		this.before = before.bind(this);
		this.channel = channel!;
		this.clientPermissions = typeof clientPermissions === "function" ? clientPermissions.bind(this) : clientPermissions;
		this.condition = condition.bind(this);
		this.cooldown = cooldown!;
		this.description = Array.isArray(description) ? description.join("\n") : description;
		this.editable = Boolean(editable);
		this.localization = <CommandLocalization>localization;
		this.onlyNsfw = Boolean(onlyNsfw);
		this.ownerOnly = Boolean(ownerOnly);
		this.superUserOnly = Boolean(superUserOnly);
		this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;
		this.ratelimit = ratelimit;
		this.regex = typeof regex === "function" ? regex.bind(this) : regex;
		this.typing = Boolean(typing);
		this.userPermissions = typeof userPermissions === "function" ? userPermissions.bind(this) : userPermissions;
		this.lock =
			typeof lock === "string"
				? {
						guild: (message: Message | AkairoMessage): string => message.guild! && message.guild.id!,
						channel: (message: Message | AkairoMessage): string => message.channel!.id,
						user: (message: Message | AkairoMessage): string => message.author.id
				  }[lock]
				: lock;
		if (this.lock) this.locker = new Set();
		this.ignoreCooldown = typeof ignoreCooldown === "function" ? ignoreCooldown.bind(this) : ignoreCooldown;
		this.ignorePermissions = typeof ignorePermissions === "function" ? ignorePermissions.bind(this) : ignorePermissions;
		this.slash = slash;
		this.slashDefaultMemberPermissions = slashDefaultMemberPermissions;
		this.slashDmPermission = slashDmPermission;
		this.slashEphemeral = slashEphemeral;
		this.slashGuilds = slashGuilds;
		this.slashOnly = slashOnly;
		this.slashOptions = slashOptions;
	}

	/**
	 * Generator for arguments.
	 * When yielding argument options, that argument is ran and the result of the processing is given.
	 * The last value when the generator is done is the resulting `args` for the command's `exec`.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed content.
	 * @param state - Argument processing state.
	 * @abstract
	 */
	public args?(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState): ArgumentGeneratorReturn;

	/**
	 * Runs before argument parsing and execution.
	 * @param message - Message being handled.
	 * @abstract
	 */
	public before?(message: Message): any;

	/**
	 * Checks if the command should be ran by using an arbitrary condition.
	 * @param message - Message being handled.
	 * @abstract
	 */
	public condition?(message: Message): SyncOrAsync<boolean>;

	/**
	 * Executes the command.
	 * @param message - Message that triggered the command.
	 * @param args - Evaluated arguments.
	 * @abstract
	 */
	public exec?(message: Message, args: any): any;
	public exec?(message: Message | AkairoMessage, args: any): any;

	/**
	 * Execute the slash command
	 * @param message - Message for slash command
	 * @param args - Slash command options
	 * @abstract
	 */
	public execSlash?(message: AkairoMessage, ...args: any[]): any;

	/**
	 * Respond to autocomplete interactions for this command.
	 * @param interaction The autocomplete interaction
	 * @abstract
	 */
	public autocomplete?(interaction: AutocompleteInteraction): any;

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

patchAbstract(Command, "exec");
patchAbstract(Command, "execSlash");
patchAbstract(Command, "autocomplete");

/**
 * Options to use for command execution behavior.
 */
export interface CommandOptions extends AkairoModuleOptions {
	/**
	 * Command names.
	 * @default []
	 */
	aliases?: string[];

	/**
	 * Argument options or generator.
	 * @default this._args || this.args || []
	 */
	args?: ArgumentOptions[] | ArgumentGenerator;

	/**
	 * The default argument options.
	 * @default {}
	 */
	argumentDefaults?: DefaultArgumentOptions;

	/**
	 * Function to run before argument parsing and execution.
	 * @default this.before || (() => undefined)
	 */
	before?: BeforeAction;

	/**
	 * Restricts channel to either 'guild' or 'dm'.
	 * @default null
	 */
	channel?: "guild" | "dm";

	/**
	 * Permissions required by the client to run this command.
	 * @default this.clientPermissions
	 */
	clientPermissions?: PermissionResolvable | MissingPermissionSupplier;

	/**
	 * Whether or not to run on messages that are not directly commands.
	 * @default this.condition || (() => false)
	 */
	condition?: ExecutionPredicate;

	/**
	 * The command cooldown in milliseconds.
	 * @default null
	 */
	cooldown?: number;

	/**
	 * Description of the command.
	 * @default ""
	 */
	description?: string | any | any[];

	/**
	 * Whether or not message edits will run this command.
	 * @default true
	 */
	editable?: boolean;

	/**
	 * Flags to use when using an ArgumentGenerator
	 * @default []
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
	 * The slash command localizations.
	 */
	localization?: CommandLocalization;

	/**
	 * The key type or key generator for the locker. If lock is a string, it's expected one of 'guild', 'channel', or 'user'
	 */
	lock?: KeySupplier | "guild" | "channel" | "user";

	/**
	 * Whether or not to only allow the command to be run in NSFW channels.
	 * @default false
	 */
	onlyNsfw?: boolean;

	/**
	 * Option flags to use when using an ArgumentGenerator.
	 * @default []
	 */
	optionFlags?: string[];

	/**
	 * Whether or not to allow client owner(s) only.
	 * @default false
	 */
	ownerOnly?: boolean;

	/**
	 * The prefix(es) to overwrite the global one for this command.
	 * @default this.prefix
	 */
	prefix?: string | string[] | PrefixSupplier;

	/**
	 * Whether or not to consider quotes.
	 * @default true
	 */
	quoted?: boolean;

	/**
	 * Amount of command uses allowed until cooldown.
	 * @default 1
	 */
	ratelimit?: number;

	/**
	 * A regex to match in messages that are not directly commands. The args object will have `match` and `matches` properties.
	 * @default this.regex
	 */
	regex?: RegExp | RegexSupplier;

	/**
	 * Custom separator for argument input.
	 */
	separator?: string;

	/**
	 * Mark command as slash command and set information.
	 * @default false
	 */
	slash?: boolean;

	/**
	 * The default bitfield used to determine whether this command be used in a guild
	 * @default typeof this.userPermissions !== "function" ? this.userPermissions : undefined
	 */
	slashDefaultMemberPermissions?: PermissionResolvable;

	/**
	 * Whether the command is enabled in DMs
	 *
	 * **Cannot be enabled for commands that specify `slashGuilds`**
	 *
	 * @default this.channel === 'dm'
	 */
	slashDmPermission?: boolean;

	/**
	 * Whether slash command responses for this command should be ephemeral or not.
	 * @default false
	 */
	slashEphemeral?: boolean;

	/**
	 * Assign slash commands to Specific guilds. This option will make the commands not register globally, but only to the chosen servers.
	 * @default []
	 */
	slashGuilds?: string[];

	/**
	 * Options for using the slash command.
	 */
	slashOptions?: SlashOption[];

	/**
	 * Only allow this command to be used as a slash command. Also makes `slash` `true`
	 */
	slashOnly?: boolean;

	/**
	 * Whether or not to allow client superUsers(s) only.
	 * @default false
	 */
	superUserOnly?: boolean;

	/**
	 * Whether or not to type in channel during execution.
	 * @default false
	 */
	typing?: boolean;

	/**
	 * Permissions required by the user to run this command.
	 * @default this.userPermissions
	 */
	userPermissions?: PermissionResolvable | MissingPermissionSupplier;
}

/**
 * A function to run before argument parsing and execution.
 * @param message - Message that triggered the command.
 */
export type BeforeAction = (this: Command, message: Message) => any;

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
export type ExecutionPredicate = (this: Command, message: Message) => SyncOrAsync<boolean>;

/**
 * A function used to check if a message has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @param message - Message that triggered the command.
 */
export type MissingPermissionSupplier = (message: Message | AkairoMessage) => SyncOrAsync<any>;

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
) => ArgumentGeneratorReturn;

export type ArgumentGeneratorReturn = Generator<
	ArgumentOptions | Argument | Flag,
	{ [args: string]: ArgumentTypeCasterReturn<unknown> } | Flag,
	Flag | any
>;

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
	 * ex. get the resolved member object when the type is {@link ApplicationCommandOptionType.User}
	 */
	resolve?: SlashResolveType;
}

export interface AkairoApplicationCommandAutocompleteOption extends ApplicationCommandAutocompleteOption {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is {@link ApplicationCommandOptionType.User}
	 */
	resolve?: SlashResolveType;
}

export interface AkairoApplicationCommandNumericOptionData extends ApplicationCommandNumericOptionData {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is {@link ApplicationCommandOptionType.User}
	 */
	resolve?: SlashResolveType;
}

export interface AkairoApplicationCommandNonOptionsData extends ApplicationCommandNonOptionsData {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is {@link ApplicationCommandOptionType.User}
	 */
	resolve?: SlashResolveType;
}

export interface AkairoApplicationCommandChannelOptionData extends ApplicationCommandChannelOptionData {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is {@link ApplicationCommandOptionType.User}
	 */
	resolve?: SlashResolveType;
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
	 * ex. get the resolved member object when the type is {@link ApplicationCommandOptionType.User}
	 */
	resolve?: SlashResolveType;
};

/**
 * The localization for slash commands.
 *
 * @example
 * const localization = {
 *     nameLocalizations: {
 *  	     ["en-US"]: "command name",
 *     },
 *     descriptionLocalizations: {
 *         ["en-US"]: "command description",
 *     },
 * }
 */
export type CommandLocalization = Record<"nameLocalizations" | "descriptionLocalizations", LocalizationMap>;

/**
 * @typedef {ApplicationCommandOptionType} VSCodePleaseStopRemovingMyImports
 * @internal
 */
