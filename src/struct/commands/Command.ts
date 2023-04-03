/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
	ApplicationCommandOptionData,
	ApplicationCommandOptionType,
	ApplicationCommandSubCommandData,
	ApplicationCommandSubGroupData,
	AutocompleteInteraction,
	LocalizationMap,
	Message,
	PermissionResolvable,
	Snowflake
} from "discord.js";
import { z } from "zod";
import { ArrayOrNot, MessageInstance, PermissionResolvableValidator, SyncOrAsync } from "../../typings/Util.js";
import { AkairoMessage } from "../../util/AkairoMessage.js";
import { patchAbstract } from "../../util/Util.js";
import { AkairoModule, AkairoModuleOptions } from "../AkairoModule.js";
import { Argument, ArgumentOptions, DefaultArgumentOptions, type ArgumentTypeCasterReturn } from "./arguments/Argument.js";
import { ArgumentRunner, ArgumentRunnerState } from "./arguments/ArgumentRunner.js";
import { CommandHandler, IgnoreCheckPredicate, PrefixSupplier, SlashResolveType } from "./CommandHandler.js";
import { ContentParser, ContentParserResult } from "./ContentParser.js";
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
	public channel: string | null;

	/**
	 * Usable only by the client owner.
	 */
	public ownerOnly: boolean;

	/**
	 * Permissions required to run command by the client.
	 */
	public clientPermissions!: PermissionResolvable | MissingPermissionSupplier;

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
	public slashDefaultMemberPermissions?: PermissionResolvable | null;

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
	public constructor(id: string, options: CommandOptions = {}) {
		super(id, { category: options?.category });

		CommandOptions.parse(options);

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
			userPermissions = this.userPermissions,
			slashDefaultMemberPermissions
		} = options;

		let { slashDmPermission } = options;

		if (slashGuilds.length === 0) slashDmPermission ??= channel === null || channel === "dm";

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
		this.channel = channel;
		this.clientPermissions = typeof clientPermissions === "function" ? clientPermissions.bind(this) : clientPermissions;
		this.condition = condition.bind(this);
		this.cooldown = cooldown;
		this.description = Array.isArray(description) ? description.join("\n") : description;
		this.editable = editable;
		this.localization = localization;
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
	 * Parses content using the command's arguments.
	 * @param message - Message to use.
	 * @param content - String to parse.
	 */
	public parse(message: Message, content: string): Promise<Flag | any> {
		const parsed = this.contentParser.parse(content);
		return this.argumentRunner.run(message, parsed, this.argumentGenerator);
	}
}

export interface Command {
	/**
	 * Generator for arguments.
	 * When yielding argument options, that argument is ran and the result of the processing is given.
	 * The last value when the generator is done is the resulting `args` for the command's `exec`.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed content.
	 * @param state - Argument processing state.
	 * @abstract
	 *
	 * @example
	 * public override *args(): ArgumentGeneratorReturn {
	 * 	const x = yield {
	 * 		type: "integer",
	 * 	};
	 *
	 * 	return { x };
	 * }
	 */
	args(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState): ArgumentGeneratorReturn;

	/**
	 * Runs before argument parsing and execution.
	 * @param message - Message being handled.
	 * @abstract
	 */
	before(message: Message): any;

	/**
	 * Checks if the command should be ran by using an arbitrary condition.
	 * @param message - Message being handled.
	 * @abstract
	 */
	condition(message: Message): SyncOrAsync<boolean>;

	/**
	 * Executes the command.
	 * @param message - Message that triggered the command.
	 * @param args - Evaluated arguments.
	 * @abstract
	 */
	exec(message: Message, args: CommandArguments): any;
	exec(message: Message | AkairoMessage, args: CommandArguments): any;

	/**
	 * Execute the slash command
	 * @param message - Message for slash command
	 * @param args - Slash command options
	 * @abstract
	 */
	execSlash(message: AkairoMessage, args: CommandArguments): any;

	/**
	 * Respond to autocomplete interactions for this command.
	 * @param interaction The autocomplete interaction
	 * @abstract
	 */
	autocomplete(interaction: AutocompleteInteraction): any;
}

patchAbstract(Command, "exec");
patchAbstract(Command, "execSlash");
patchAbstract(Command, "autocomplete");

/**
 * Command arguments mapped by their id
 */
export type CommandArguments = {
	[key: string]: any;
};
export const CommandArguments = z.record(z.any());

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
export const ArgumentGenerator = z.function().args(MessageInstance, ContentParserResult, ArgumentRunnerState).returns(z.any());

export type ArgumentGeneratorReturn = Generator<
	ArgumentOptions | Argument | Flag,
	{ [args: string]: ArgumentTypeCasterReturn<unknown> } | Flag,
	Flag | any
>;

/**
 * A function to run before argument parsing and execution.
 * @param message - Message that triggered the command.
 */
export type BeforeAction = (this: Command, message: Message) => any;
export const BeforeAction = z.function().args(MessageInstance).returns(z.any());

/**
 * A function used to check if a message has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @param message - Message that triggered the command.
 */
export type MissingPermissionSupplier = (message: Message | AkairoMessage) => SyncOrAsync<any>;
export const MissingPermissionSupplier = z
	.function()
	.args(z.union([MessageInstance, z.instanceof(AkairoMessage)]))
	.returns(SyncOrAsync(z.any()));

/**
 * A function used to check if the command should run arbitrarily.
 * @param message - Message to check.
 */
export type ExecutionPredicate = (this: Command, message: Message) => SyncOrAsync<boolean>;
export const ExecutionPredicate = z.function().args(MessageInstance).returns(SyncOrAsync(z.boolean()));

/**
 * A function used to supply the key for the locker.
 * @param message - Message that triggered the command.
 * @param args - Evaluated arguments.
 */
export type KeySupplier = (message: Message | AkairoMessage, args: CommandArguments) => string;
export const KeySupplier = z
	.function()
	.args(z.union([MessageInstance, z.instanceof(AkairoMessage)]), CommandArguments)
	.returns(z.string());

/**
 * A function used to return a regular expression.
 * @param message - Message to get regex for.
 */
export type RegexSupplier = (message: Message) => RegExp;
export const RegexSupplier = z.function().args(MessageInstance).returns(z.instanceof(RegExp));

/**
 * Options to use for command execution behavior.
 */
export type CommandOptions = AkairoModuleOptions & {
	/**
	 * Command names.
	 * @default []
	 */
	aliases?: string[];

	/**
	 * Argument options or generator.
	 * @default this.args || []
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
	channel?: "guild" | "dm" | null;

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
	cooldown?: number | null;

	/**
	 * Description of the command.
	 * @default ""
	 */
	description?: string | ArrayOrNot<any>;

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
	ignoreCooldown?: ArrayOrNot<Snowflake> | IgnoreCheckPredicate;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 */
	ignorePermissions?: ArrayOrNot<Snowflake> | IgnoreCheckPredicate;

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
	prefix?: ArrayOrNot<string> | PrefixSupplier;

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
	slashDefaultMemberPermissions?: PermissionResolvable | null;

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
	 * @default false
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
};
export const CommandOptions = AkairoModuleOptions.extend({
	aliases: z.string().array().optional(),
	args: z.union([ArgumentOptions.array(), ArgumentGenerator]).optional(),
	argumentDefaults: DefaultArgumentOptions.optional(),
	before: BeforeAction.optional(),
	channel: z.enum(["guild", "dm"]).nullish(),
	clientPermissions: z.union([PermissionResolvableValidator, MissingPermissionSupplier]).optional(),
	condition: ExecutionPredicate.optional(),
	cooldown: z.number().nullish(),
	description: z.union([z.string(), ArrayOrNot(z.any())]).optional(),
	editable: z.boolean().optional(),
	flags: z.string().array().optional(),
	ignoreCooldown: z.union([ArrayOrNot(z.string()), IgnoreCheckPredicate]).optional(),
	ignorePermissions: z.union([ArrayOrNot(z.string()), IgnoreCheckPredicate]).optional(),
	localization: z.record(z.any()).optional(),
	lock: z.union([KeySupplier, z.enum(["guild", "channel", "user"])]).optional(),
	onlyNsfw: z.boolean().optional(),
	optionFlags: z.string().array().optional(),
	ownerOnly: z.boolean().optional(),
	prefix: z.union([ArrayOrNot(z.string()), PrefixSupplier]).optional(),
	quoted: z.boolean().optional(),
	ratelimit: z.number().optional(),
	regex: z.union([z.instanceof(RegExp), RegexSupplier]).optional(),
	separator: z.string().optional(),
	slash: z.boolean().optional(),
	slashDefaultMemberPermissions: PermissionResolvableValidator.nullish(),
	slashDmPermission: z.boolean().optional(),
	slashEphemeral: z.boolean().optional(),
	slashGuilds: z.string().array().optional(),
	slashOptions: z.any().array().optional(),
	slashOnly: z.boolean().optional(),
	superUserOnly: z.boolean().optional(),
	typing: z.boolean().optional(),
	userPermissions: z.union([PermissionResolvableValidator, MissingPermissionSupplier]).optional()
}).passthrough();

export interface SlashExt {
	/**
	 * Allows you to get a discord resolved object
	 *
	 * ex. get the resolved member object when the type is {@link ApplicationCommandOptionType.User}
	 */
	resolve?: SlashResolveType;
}

type Sub = Pick<ApplicationCommandSubGroupData, "options"> | Pick<ApplicationCommandSubCommandData, "options">;

type GetNonSub<T> = T extends Sub ? never : T & SlashExt;

export type SlashNonSub = GetNonSub<ApplicationCommandOptionData>;

export interface ExtGroup extends ApplicationCommandSubGroupData {
	options: ExtSub[];
}

export interface ExtSub extends ApplicationCommandSubCommandData {
	options?: SlashNonSub[];
}

export type SlashSub = ExtGroup | ExtSub;

export type SlashOption = SlashNonSub | SlashSub;

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
export type CommandLocalization = Partial<Record<"nameLocalizations" | "descriptionLocalizations", LocalizationMap>>;

export const CommandInstance = z.instanceof(Command as new (...args: any[]) => Command);
