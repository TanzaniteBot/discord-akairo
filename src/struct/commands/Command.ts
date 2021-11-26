/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
import {
	ApplicationCommandAutocompleteOption,
	ApplicationCommandChannelOptionData,
	ApplicationCommandChoicesData,
	ApplicationCommandNonOptionsData,
	ApplicationCommandNumericOptionData,
	ApplicationCommandPermissionData,
	ApplicationCommandSubCommandData,
	ApplicationCommandSubGroupData,
	AutocompleteInteraction,
	Guild,
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
	 * Argument options or generator.
	 */
	public declare _args?: ArgumentOptions[] | ArgumentGenerator;

	/**
	 * Default prompt options.
	 */
	public declare argumentDefaults: DefaultArgumentOptions;

	/**
	 * The argument runner.
	 */
	public declare argumentRunner: ArgumentRunner;

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
	public declare cooldown: number | null;

	/**
	 * The content parser.
	 */
	public declare contentParser: ContentParser;

	/**
	 * Description of the command.
	 */
	public declare description: string | any | any[];

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
	 * The default permission to set when creating the slash command.
	 *
	 * **Note:** Requires the useSlashPermissions to be enabled in the command handler
	 */
	public declare slashDefaultPermission: boolean;

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
	 * The slash permissions to set in each guild for this command.
	 */
	public declare slashPermissions?: ApplicationCommandPermissionData[] | SlashPermissionsSupplier;

	/**
	 * Only allows this command to be executed as a slash command.
	 */
	public declare slashOnly: boolean;

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
			aliases = [],
			args = this._args || this.args || [],
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
			slashDefaultPermission = this.handler.useSlashPermissions ? !this.ownerOnly : true,
			slashEphemeral = false,
			slashGuilds = [],
			slashOnly = false,
			slashOptions,
			slashPermissions,
			superUserOnly = false,
			typing = false,
			userPermissions = this.userPermissions
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
		this.argumentDefaults = argumentDefaults;
		this.before = before.bind(this);
		this.channel = channel!;
		this.clientPermissions = typeof clientPermissions === "function" ? clientPermissions.bind(this) : clientPermissions;
		this.condition = condition.bind(this);
		this.cooldown = cooldown!;
		this.description = Array.isArray(description) ? description.join("\n") : description;
		this.editable = Boolean(editable);
		this.lock = lock;
		this.onlyNsfw = Boolean(onlyNsfw);
		this.ownerOnly = Boolean(ownerOnly);
		this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;
		this.ratelimit = ratelimit;
		this.regex = typeof regex === "function" ? regex.bind(this) : regex;
		this.superUserOnly = Boolean(superUserOnly);
		this.typing = Boolean(typing);
		this.userPermissions = typeof userPermissions === "function" ? userPermissions.bind(this) : userPermissions;
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
		this.slash = slash;
		this.slashDefaultPermission = slashDefaultPermission;
		this.slashEphemeral = slashEphemeral;
		this.slashGuilds = slashGuilds;
		this.slashOnly = slashOnly;
		this.slashOptions = slashOptions;
		this.slashPermissions = typeof slashPermissions === "function" ? slashPermissions.bind(this) : slashPermissions;
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
	 * Respond to autocomplete interactions for this command.
	 * @param interaction The autocomplete interaction
	 */
	public autocomplete(interaction: AutocompleteInteraction): any {}

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
	clientPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;

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
	 * The default permission to set when creating the slash command.
	 *
	 * **Note:** Requires `useSlashPermissions` to be enabled in the command handler
	 * @default this.handler.useSlashPermissions ? !this.ownerOnly : true
	 */
	slashDefaultPermission?: boolean;

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
	 * The slash permissions to set in each guild for this command.
	 */
	slashPermissions?: ApplicationCommandPermissionData[] | SlashPermissionsSupplier;

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
	userPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
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
 * A function used to create slash permissions depending on the guild.
 * @param guild The guild to create slash permissions for.
 */
export type SlashPermissionsSupplier = (guild: Guild) => ApplicationCommandPermissionData[];

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
