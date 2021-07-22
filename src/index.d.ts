import { APIInteractionGuildMember, APIMessage } from "discord-api-types/v8";
import {
	ApplicationCommandOptionData,
	ApplicationCommandOptionType,
	Awaited,
	BufferResolvable,
	Channel,
	Client,
	ClientOptions,
	Collection,
	CommandInteraction,
	DMChannel,
	Emoji,
	Guild,
	GuildChannel,
	GuildMember,
	InteractionReplyOptions,
	Message,
	MessageAttachment,
	MessageEditOptions,
	MessageEmbed,
	MessageEmbedOptions,
	MessageOptions,
	MessagePayload,
	NewsChannel,
	PartialDMChannel,
	PermissionResolvable,
	ReplyMessageOptions,
	Role,
	Snowflake,
	TextChannel,
	ThreadChannel,
	User,
	UserResolvable,
	WebhookEditMessageOptions
} from "discord.js";
import { EventEmitter } from "events";
import { Stream } from "stream";

declare module "discord.js" {
	export interface Message {
		/**
		 * Extra properties applied to the Discord.js message object.
		 * Utilities for command responding.
		 * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client).
		 * Not all properties of the util are available, depending on the input.
		 * */
		util?: CommandUtil;
	}
}

//#region classes
/**
 * Represents an error for Akairo.
 * @param key - Error key.
 * @param args - Arguments.
 */
export class AkairoError extends Error {
	public constructor(key: string, ...args: any);
	public code: string;
	public readonly name: string;
}

/**
 * The Akairo framework client. Creates the handlers and sets them up.
 * @param options - Options for the client.
 * @param clientOptions - Options for Discord JS client.If not specified, the previous options parameter is used instead.
 */
export class AkairoClient extends Client {
	public constructor(
		options?: AkairoOptions & ClientOptions,
		clientOptions?: ClientOptions
	);

	/** The ID of the owner(s). */
	public ownerID: Snowflake | Snowflake[];

	/** The ID of the superUser(s). */
	public superUserID: Snowflake | Snowflake[];

	/** Utility methods. */
	public util: ClientUtil;

	/**
	 * Checks if a user is the owner of this bot.
	 * @param user - User to check.
	 */
	public isOwner(user: UserResolvable): boolean;

	/**
	 * Checks if a user is the owner of this bot.
	 * @param user - User to check.
	 */
	public isSuperUser(user: UserResolvable): boolean;
}

/**
 * Base class for handling modules.
 * @param client - The Akairo client.
 * @param options - Options for module loading and handling.
 */
export class AkairoHandler extends EventEmitter {
	public constructor(client: AkairoClient, options: AkairoHandlerOptions);

	/** Whether or not to automate category names. */
	public automateCategories: boolean;

	/** Categories, mapped by ID to Category. */
	public categories: Collection<string, Category<string, AkairoModule>>;

	/** Class to handle. */
	public classToHandle: Function;

	/** The Akairo client. */
	public client: AkairoClient;

	/** The main directory to modules. */
	public directory: string;

	/** File extensions to load. */
	public extensions: Set<string>;

	/** Function that filters files when loading. */
	public loadFilter: LoadPredicate;

	/** Modules loaded, mapped by ID to AkairoModule. */
	public modules: Collection<string, AkairoModule>;

	/**
	 * Deregisters a module.
	 * @param mod - Module to use.
	 */
	public deregister(mod: AkairoModule): void;

	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	public findCategory(name: string): Category<string, AkairoModule>;

	/**
	 * Loads a module, can be a module class or a filepath.
	 * @param thing - Module class or path to module.
	 * @param isReload - Whether this is a reload or not.
	 */
	public load(thing: string | Function, isReload?: boolean): AkairoModule;

	/**
	 * Reads all modules from a directory and loads them.
	 * @param directory - Directory to load from.
	 * Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 * Defaults to the filter passed in the constructor.
	 */
	public loadAll(directory?: string, filter?: LoadPredicate): this;

	/**
	 * Registers a module.
	 * @param mod - Module to use.
	 * @param filepath - Filepath of module.
	 */
	public register(mod: AkairoModule, filepath?: string): void;

	/**
	 * Reloads a module.
	 * @param id - ID of the module.
	 */
	public reload(id: string): AkairoModule;

	/**
	 * Reloads all modules.
	 */
	public reloadAll(): this;

	/**
	 * Removes a module.
	 * @param id - ID of the module.
	 */
	public remove(id: string): AkairoModule;

	/**
	 * Removes all modules.
	 */
	public removeAll(): this;

	public on<K extends keyof AkairoHandlerEvents>(
		event: K,
		listener: (...args: AkairoHandlerEvents[K]) => Awaited<void>
	): this;

	/**
	 * Reads files recursively from a directory.
	 * @param directory - Directory to read.
	 */
	public static readdirRecursive(directory: string): string[];
}

/**
 * Base class for a module.
 * @param id - ID of module.
 * @param options - Options.
 */
export class AkairoModule {
	public constructor(id: string, options?: AkairoModuleOptions);

	/** Category this belongs to. */
	public category: Category<string, AkairoModule>;

	/** ID of the category this belongs to. */
	public categoryID: string;

	/** The Akairo client. */
	public client: AkairoClient;

	/** The filepath. */
	public filepath: string;

	/** The handler. */
	public handler: AkairoHandler;

	/** ID of the module. */
	public id: string;

	/** Reloads the module. */
	public reload(): this;

	/** Removes the module. */
	public remove(): this;

	/** Returns the ID. */
	public toString(): string;
}

/**
 * Represents an argument for a command.
 * @param command - Command of the argument.
 * @param options - Options for the argument.
 */
export class Argument {
	public constructor(command: Command, options: ArgumentOptions);

	/** The client. */
	public readonly client: AkairoClient;

	/** The command this argument belongs to. */
	public command: Command;

	/** The default value of the argument or a function supplying the default value. */
	public default: DefaultValueSupplier | any;

	public description: string | any;

	/** The string(s) to use for flag or option match. */
	public flag?: string | string[];

	/** The command handler. */
	public readonly handler: CommandHandler;

	/** The index to start from. */
	public index?: number;

	/** The amount of phrases to match for rest, separate, content, or text match. */
	public limit: number;

	/** The method to match text. */
	public match: ArgumentMatch;

	/** Whether to process multiple option flags instead of just the first. */
	public multipleFlags: boolean;

	/** The content or function supplying the content sent when argument parsing fails. */
	public otherwise?:
		| string
		| MessagePayload
		| MessageOptions
		| OtherwiseContentSupplier;

	/** The prompt options. */
	public prompt?: ArgumentPromptOptions | boolean;

	/** The type to cast to or a function to use to cast. */
	public type: ArgumentType | ArgumentTypeCaster;

	/** Whether or not the argument is unordered. */
	public unordered: boolean | number | number[];

	/**
	 * Casts a phrase to this argument's type.
	 * @param type - The type to cast to.
	 * @param resolver - The type resolver.
	 * @param message - Message that called the command.
	 * @param phrase - Phrase to process.
	 */
	public cast(message: Message, phrase: string): Promise<any>;

	/**
	 * Collects input from the user by prompting.
	 * @param message - Message to prompt.
	 * @param commandInput - Previous input from command if there was one.
	 * @param parsedInput - Previous parsed input from command if there was one.
	 */
	public collect(message: Message, commandInput?: string): Promise<Flag | any>;

	/**
	 * Processes the type casting and prompting of the argument for a phrase.
	 * @param message - The message that called the command.
	 * @param phrase - The phrase to process.
	 */
	public process(message: Message, phrase: string): Promise<any>;

	/**
	 * Casts a phrase to this argument's type.
	 * @param message - Message that called the command.
	 * @param phrase - Phrase to process.
	 */
	public static cast(
		type: ArgumentType | ArgumentTypeCaster,
		resolver: TypeResolver,
		message: Message,
		phrase: string
	): Promise<any>;

	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the entire composition fails.
	 * @param types - Types to use.
	 */
	public static compose(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;

	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the composition still continues with the failure passed on.
	 * @param types - Types to use.
	 */
	public static composeWithFailure(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;

	/**
	 * Checks if something is null, undefined, or a fail flag.
	 * @param value - Value to check.
	 */
	public static isFailure(
		value: any
	): value is null | undefined | (Flag & { value: any });

	/**
	 * Creates a type from multiple types (product type).
	 * Only inputs where each type resolves with a non-void value are valid.
	 * @param types - Types to use.
	 */
	public static product(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;

	/**
	 * Creates a type where the parsed value must be within a range.
	 * @param type - The type to use.
	 * @param min - Minimum value.
	 * @param max - Maximum value.
	 * @param inclusive - Whether or not to be inclusive on the upper bound.
	 */
	public static range(
		type: ArgumentType | ArgumentTypeCaster,
		min: number,
		max: number,
		inclusive?: boolean
	): ArgumentTypeCaster;

	/**
	 * Creates a type that parses as normal but also tags it with some data.
	 * Result is in an object `{ tag, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
	 */
	public static tagged(
		type: ArgumentType | ArgumentTypeCaster,
		tag?: any
	): ArgumentTypeCaster;

	/**
	 * Creates a type from multiple types (union type).
	 * The first type that resolves to a non-void value is used.
	 * Each type will also be tagged using `tagged` with themselves.
	 * @param types - Types to use.
	 */
	public static taggedUnion(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;

	/**
	 * Creates a type that parses as normal but also tags it with some data and carries the original input.
	 * Result is in an object `{ tag, input, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
	 */
	public static taggedWithInput(
		type: ArgumentType | ArgumentTypeCaster,
		tag?: any
	): ArgumentTypeCaster;

	/**
	 * Creates a type from multiple types (union type).
	 * The first type that resolves to a non-void value is used.
	 * @param types - Types to use.
	 */
	public static union(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;

	/**
	 * Creates a type with extra validation.
	 * If the predicate is not true, the value is considered invalid.
	 * @param type - The type to use.
	 * @param predicate - The predicate function.
	 */
	public static validate(
		type: ArgumentType | ArgumentTypeCaster,
		predicate: ParsedValuePredicate
	): ArgumentTypeCaster;

	/**
	 * Creates a type that parses as normal but also carries the original input.
	 * Result is in an object `{ input, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 */
	public static withInput(
		type: ArgumentType | ArgumentTypeCaster
	): ArgumentTypeCaster;
}

/**
 * A group of modules.
 * @param id - ID of the category.
 * @param iterable - Entries to set.
 */
export class Category<K, V> extends Collection<K, V> {
	public constructor(id: string, iterable?: Iterable<[K, V][]>);

	/** ID of the category. */
	public id: string;

	/** Calls `reload()` on all items in this category. */
	public reloadAll(): this;

	/** Calls `remove()` on all items in this category. */
	public removeAll(): this;

	/** Returns the ID. */
	public toString(): string;
}

/**
 * Client utilities to help with common tasks.
 * @param client - The client.
 */
export class ClientUtil {
	public constructor(client: AkairoClient);

	/** The Akairo client. */
	public readonly client: AkairoClient;

	/**
	 * Makes a MessageAttachment.
	 * @param file - The file.
	 * @param name - The filename.
	 */
	public attachment(
		file: BufferResolvable | Stream,
		name?: string
	): MessageAttachment;

	/**
	 * Checks if a string could be referring to a channel.
	 * @param text - Text to check.
	 * @param channel - Channel to check.
	 * @param caseSensitive - Makes checking by name case sensitive.
	 * @param wholeWord - Makes checking by name match full word only.
	 */
	public checkChannel(
		text: string,
		channel: GuildChannel | ThreadChannel,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): boolean;

	/**
	 * Checks if a string could be referring to a emoji.
	 * @param text - Text to check.
	 * @param emoji - Emoji to check.
	 * @param caseSensitive - Makes checking by name case sensitive.
	 * @param wholeWord - Makes checking by name match full word only.
	 */
	public checkEmoji(
		text: string,
		emoji: Emoji,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): boolean;

	/**
	 * Checks if a string could be referring to a guild.
	 * @param text - Text to check.
	 * @param guild - Guild to check.
	 * @param caseSensitive - Makes checking by name case sensitive.
	 * @param wholeWord - Makes checking by name match full word only.
	 */
	public checkGuild(
		text: string,
		guild: Guild,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): boolean;

	/**
	 * Checks if a string could be referring to a member.
	 * @param text - Text to check.
	 * @param member - Member to check.
	 * @param caseSensitive - Makes checking by name case sensitive.
	 * @param wholeWord - Makes checking by name match full word only.
	 */
	public checkMember(
		text: string,
		member: GuildMember,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): boolean;

	/**
	 * Checks if a string could be referring to a role.
	 * @param text - Text to check.
	 * @param role - Role to check.
	 * @param caseSensitive - Makes checking by name case sensitive.
	 * @param wholeWord - Makes checking by name match full word only.
	 */
	public checkRole(
		text: string,
		role: Role,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): boolean;

	/**
	 * Resolves a user from a string, such as an ID, a name, or a mention.
	 * @param text - Text to resolve.
	 * @param users - Collection of users to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public checkUser(
		text: string,
		user: User,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): boolean;

	/**
	 * Makes a Collection.
	 * @param iterable - Entries to fill with.
	 */
	public collection<K, V>(
		iterable?: ReadonlyArray<readonly [K, V]> | null
	): Collection<K, V>;

	/**
	 * Compares two member objects presences and checks if they stopped or started a stream or not.
	 * Returns `0`, `1`, or `2` for no change, stopped, or started.
	 * @param oldMember - The old member.
	 * @param newMember - The new member.
	 */
	public compareStreaming(
		oldMember: GuildMember,
		newMember: GuildMember
	): number;

	/**
	 * Makes a MessageEmbed.
	 * @param data - Embed data.
	 */
	public embed(data?: MessageEmbed | MessageEmbedOptions): MessageEmbed;

	/**
	 * Combination of `<Client>.fetchUser()` and `<Guild>.fetchMember()`.
	 * @param guild - Guild to fetch in.
	 * @param id - ID of the user.
	 * @param cache - Whether or not to add to cache.
	 */
	public fetchMember(
		guild: Guild,
		id: Snowflake,
		cache?: boolean
	): Promise<GuildMember>;

	/**
	 * Array of permission names.
	 */
	public permissionNames(): string[];

	/**
	 * Resolves a channel from a string, such as an ID, a name, or a mention.
	 * @param text - Text to resolve.
	 * @param channels - Collection of channels to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveChannel(
		text: string,
		channels: Collection<Snowflake, GuildChannel | ThreadChannel>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): GuildChannel | ThreadChannel;

	/**
	 * Resolves multiple channels from a string, such as an ID, a name, or a mention.
	 * @param text - Text to resolve.
	 * @param channels - Collection of channels to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveChannels(
		text: string,
		channels: Collection<Snowflake, GuildChannel>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): Collection<Snowflake, GuildChannel>;

	/**
	 * Resolves a custom emoji from a string, such as a name or a mention.
	 * @param text - Text to resolve.
	 * @param emojis - Collection of emojis to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveEmoji(
		text: string,
		emojis: Collection<Snowflake, Emoji>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): Emoji;

	/**
	 * Resolves multiple custom emojis from a string, such as a name or a mention.
	 * @param text - Text to resolve.
	 * @param emojis - Collection of emojis to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveEmojis(
		text: string,
		emojis: Collection<Snowflake, Emoji>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): Collection<Snowflake, Emoji>;

	/**
	 * Resolves a guild from a string, such as an ID or a name.
	 * @param text - Text to resolve.
	 * @param guilds - Collection of guilds to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveGuild(
		text: string,
		guilds: Collection<Snowflake, Guild>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): Guild;

	/**
	 * Resolves multiple guilds from a string, such as an ID or a name.
	 * @param text - Text to resolve.
	 * @param guilds - Collection of guilds to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveGuilds(
		text: string,
		guilds: Collection<Snowflake, Guild>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): Collection<Snowflake, Guild>;

	/**
	 * Resolves a member from a string, such as an ID, a name, or a mention.
	 * @param text - Text to resolve.
	 * @param members - Collection of members to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveMember(
		text: string,
		members: Collection<Snowflake, GuildMember>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): GuildMember;

	/**
	 * Resolves multiple members from a string, such as an ID, a name, or a mention.
	 * @param text - Text to resolve.
	 * @param members - Collection of members to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveMembers(
		text: string,
		members: Collection<Snowflake, GuildMember>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): Collection<Snowflake, GuildMember>;

	/**
	 * Resolves a permission number and returns an array of permission names.
	 * @param number - The permissions number.
	 */
	public resolvePermissionNumber(number: number): string[];

	/**
	 * Resolves a role from a string, such as an ID, a name, or a mention.
	 * @param text - Text to resolve.
	 * @param roles - Collection of roles to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveRole(
		text: string,
		roles: Collection<Snowflake, Role>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): Role;

	/**
	 * Resolves multiple roles from a string, such as an ID, a name, or a mention.
	 * @param text - Text to resolve.
	 * @param roles - Collection of roles to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveRoles(
		text: string,
		roles: Collection<Snowflake, Role>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): Collection<Snowflake, Role>;

	/**
	 * Resolves a user from a string, such as an ID, a name, or a mention.
	 * @param text - Text to resolve.
	 * @param users - Collection of users to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveUser(
		text: Snowflake | string,
		users: Collection<Snowflake, User>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): User;

	/**
	 * Resolves multiple users from a string, such as an ID, a name, or a mention.
	 * @param text - Text to resolve.
	 * @param users - Collection of users to find in.
	 * @param caseSensitive - Makes finding by name case sensitive.
	 * @param wholeWord - Makes finding by name match full word only.
	 */
	public resolveUsers(
		text: string,
		users: Collection<Snowflake, User>,
		caseSensitive?: boolean,
		wholeWord?: boolean
	): Collection<Snowflake, User>;
}

/**
 * A command interaction represented as a message.
 * @param client - AkairoClient
 * @param interaction - CommandInteraction
 * @param additionalInfo - Other information
 */
export class AkairoMessage {
	public constructor(
		client: AkairoClient,
		interaction: CommandInteraction,
		{ slash, replied }: { slash?: boolean; replied?: boolean }
	);

	/** The author of the interaction. */
	public author: User;

	/** The channel that the interaction was sent in. */
	public channel?:
		| TextChannel
		| DMChannel
		| NewsChannel
		| ThreadChannel
		| PartialDMChannel;

	/** The Akairo client. */
	public client: AkairoClient;

	/** The command name and arguments represented as a string. */
	public content: string;

	/** The time the interaction was sent. */
	public createdAt: Date;

	/** The timestamp the interaction was sent at. */
	public createdTimestamp: number;

	/** The guild the interaction was sent in (if in a guild channel). */
	public guild?: Guild;

	/** The ID of the interaction. */
	public id: Snowflake;

	/** The command interaction. */
	public interaction: CommandInteraction;

	/**
	 * Represents the author of the interaction as a guild member.
	 * Only available if the interaction comes from a guild where the author is still a member.
	 */
	public member: GuildMember | APIInteractionGuildMember;

	/** Whether or not the interaction has been replied to. */
	public replied: boolean;

	/** Utilities for command responding. */
	public util: CommandUtil;

	/**
	 * Deletes the reply to the command.
	 */
	public delete(): Promise<void>;

	/**
	 * Replies or edits the reply of the slash command.
	 * @param options The options to edit the reply.
	 */
	public reply(
		options: string | MessagePayload | InteractionReplyOptions
	): Promise<Message | APIMessage>;
}

/**
 * Represents a command.
 * @param id - Command ID.
 * @param options - Options for the command.
 */
export class Command extends AkairoModule {
	public constructor(id: string, options?: CommandOptions);

	/** Command names. */
	public aliases: string[];

	/** Default prompt options. */
	public argumentDefaults: DefaultArgumentOptions;

	/** Category the command belongs to. */
	public category: Category<string, Command>;

	/** Usable only in this channel type. */
	public channel?: string;

	/** The Akairo client. */
	public client: AkairoClient;

	/** Permissions required to run command by the client. */
	public clientPermissions:
		| PermissionResolvable
		| PermissionResolvable[]
		| MissingPermissionSupplier;

	/** Cooldown in milliseconds. */
	public cooldown?: number;

	/** Description of the command. */
	public description: any;

	/** Whether or not this command can be ran by an edit. */
	public editable: boolean;

	/** The filepath. */
	public filepath: string;

	/** The handler. */
	public handler: CommandHandler;

	/** The ID of the command. */
	public id: string;

	/** ID of user(s) to ignore cooldown or a function to ignore. */
	public ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/** ID of user(s) to ignore `userPermissions` checks or a function to ignore. */
	public ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/** The key supplier for the locker. */
	public lock?: KeySupplier;

	/** Stores the current locks. */
	public locker?: Set<string>;

	/** Whether or not the command can only be run in  NSFW channels. */
	public onlyNsfw: boolean;

	/** Usable only by the client owner. */
	public ownerOnly: boolean;

	/** Command prefix overwrite. */
	public prefix?: string | string[] | PrefixSupplier;

	/** Whether or not to consider quotes. */
	public quoted: boolean;

	/** Uses allowed before cooldown. */
	public ratelimit: number;

	/** The regex trigger for this command. */
	public regex: RegExp | RegexSupplier;

	/** Mark command as slash command and set information. */
	public slash?: boolean;

	/** Whether slash command responses for this command should be ephemeral or not. */
	public slashEphemeral?: boolean;

	/** Assign slash commands to Specific guilds. This option will make the commands do not register globally, but only to the chosen servers. */
	public slashGuilds?: string[];

	/** Options for using the slash command. */
	public slashOptions?: ApplicationCommandOptionData[];

	/** Whether or not to allow client superUsers(s) only. */
	public superUserOnly: boolean;

	/** Whether or not to type during command execution. */
	public typing: boolean;

	/** Permissions required to run command by the user. */
	public userPermissions:
		| PermissionResolvable
		| PermissionResolvable[]
		| MissingPermissionSupplier;

	/**
	 * Runs before argument parsing and execution.
	 * @param message - Message being handled.
	 */
	public before(message: Message): any;

	/**
	 * Checks if the command should be ran by using an arbitrary condition.
	 * @param message - Message being handled.
	 */
	public condition(message: Message): boolean;

	/**
	 * Executes the command.
	 * @param message - Message that triggered the command.
	 * @param args - Evaluated arguments.
	 */
	public exec(message: Message, args: any): any;
	public exec(message: Message | AkairoMessage, args: any): any;

	/**
	 * Execute the slash command
	 * @param message - Message for slash command
	 * @param args - Slash command options
	 */
	public execSlash(message: AkairoMessage, args: any): any;

	/**
	 * Parses content using the command's arguments.
	 * @param message - Message to use.
	 * @param content - String to parse.
	 */
	public parse(message: Message, content: string): Promise<Flag | any>;

	/** Reloads the command. */
	public reload(): this;

	/** Removes the command. */
	public remove(): this;
}

/**
 * Loads commands and handles messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export class CommandHandler extends AkairoHandler {
	public constructor(client: AkairoClient, options: CommandHandlerOptions);

	/** Collection of command aliases. */
	public aliases: Collection<string, string>;

	/** Regular expression to automatically make command aliases for. */
	public aliasReplacement?: RegExp;

	/** Whether or not mentions are allowed for prefixing. */
	public allowMention: boolean | MentionPrefixPredicate;

	/** Default argument options. */
	public argumentDefaults: DefaultArgumentOptions;

	/** Automatically defer messages "BotName is thinking". */
	public autoDefer: boolean;

	/**  Specify whether to register all slash commands when starting the client */
	public autoRegisterSlashCommands: boolean;

	/** Whether or not to block bots. */
	public blockBots: boolean;

	/** Whether or not to block self. */
	public blockClient: boolean;

	/** Categories, mapped by ID to Category. */
	public categories: Collection<string, Category<string, Command>>;

	/** Class to handle */
	public classToHandle: typeof Command;

	/** The Akairo client. */
	public client: AkairoClient;

	/** Whether or not `message.util` is assigned. */
	public commandUtil: boolean;

	/** Milliseconds a message should exist for before its command util instance is marked for removal. */
	public commandUtilLifetime: number;

	/** Collection of CommandUtils. */
	public commandUtils: Collection<string, CommandUtil>;

	/** Time interval in milliseconds for sweeping command util instances. */
	public commandUtilSweepInterval: number;

	/**
	 * Collection of cooldowns.
	 * <info>The elements in the collection are objects with user IDs as keys
	 * and {@link CooldownData} objects as values</info>
	 */
	public cooldowns: Collection<string, { [id: string]: CooldownData }>;

	/** Default cooldown for commands. */
	public defaultCooldown: number;

	/** Directory to commands. */
	public directory: string;

	/** Whether or not to use execSlash for slash commands. */
	public execSlash: boolean;

	/** Whether or not members are fetched on each message author from a guild. */
	public fetchMembers: boolean;

	/** Whether or not edits are handled. */
	public handleEdits: boolean;

	/** ID of user(s) to ignore cooldown or a function to ignore. */
	public ignoreCooldown: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/** ID of user(s) to ignore `userPermissions` checks or a function to ignore. */
	public ignorePermissions: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/** Inhibitor handler to use. */
	public inhibitorHandler?: InhibitorHandler;

	/** Commands loaded, mapped by ID to Command. */
	public modules: Collection<string, Command>;

	/** The prefix(es) for command parsing. */
	public prefix: string | string[] | PrefixSupplier;

	/** Collection of prefix overwrites to commands. */
	public prefixes: Collection<string | PrefixSupplier, Set<string>>;

	/** Collection of sets of ongoing argument prompts. */
	public prompts: Collection<string, Set<string>>;

	/** The type resolver. */
	public resolver: TypeResolver;

	/** Whether or not to store messages in CommandUtil. */
	public storeMessages: boolean;

	/** Show "BotName is typing" information message on the text channels when a command is running. */
	public typing: boolean;

	/**
	 * Adds an ongoing prompt in order to prevent command usage in the channel.
	 * @param channel - Channel to add to.
	 * @param user - User to add.
	 */
	public addPrompt(channel: Channel, user: User): void;

	/**
	 * Deregisters a module.
	 * @param command - Module to use.
	 */
	public deregister(command: Command): void;

	/**
	 * Handles errors from the handling.
	 * @param err - The error.
	 * @param message - Message that called the command.
	 * @param command - Command that errored.
	 */
	public emitError(
		err: Error,
		message: Message | AkairoMessage,
		command?: Command
	): void;

	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	public findCategory(name: string): Category<string, Command>;

	/**
	 * Finds a command by alias.
	 * @param name - Alias to find with.
	 */
	public findCommand(name: string): Command;

	/**
	 * Handles a message.
	 * @param message - Message to handle.
	 */
	public handle(message: Message): Promise<boolean | null>;

	/**
	 * Handles conditional commands.
	 * @param message - Message to handle.
	 */
	public handleConditionalCommands(message: Message): Promise<boolean>;

	/**
	 * Handles normal commands.
	 * @param message - Message to handle.
	 * @param content - Content of message without command.
	 * @param command - Command instance.
	 * @param ignore - Ignore inhibitors and other checks.
	 */
	public handleDirectCommand(
		message: Message,
		content: string,
		command: Command,
		ignore?: boolean
	): Promise<boolean | null>;

	/**
	 * Handles regex and conditional commands.
	 * @param message - Message to handle.
	 */
	public handleRegexAndConditionalCommands(message: Message): Promise<boolean>;

	/**
	 * Handles regex commands.
	 * @param message - Message to handle.
	 */
	public handleRegexCommands(message: Message): Promise<boolean>;

	/**
	 * Handles a slash command.
	 * @param interaction - Interaction to handle.
	 */
	public handleSlash(interaction: CommandInteraction): Promise<boolean | null>;

	/**
	 * Checks if there is an ongoing prompt.
	 * @param channel - Channel to check.
	 * @param user - User to check.
	 */
	public hasPrompt(channel: Channel, user: User): boolean;

	/**
	 * Loads a command.
	 * @param thing - Module or path to module.
	 */
	public load(thing: string | Function, isReload?: boolean): Command;

	/**
	 * Reads all commands from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	public loadAll(directory?: string, filter?: LoadPredicate): this;

	/**
	 * Parses the command and its argument list.
	 * @param message - Message that called the command.
	 */
	public parseCommand(message: Message): Promise<ParsedComponentData>;

	/**
	 * Parses the command and its argument list using prefix overwrites.
	 * @param message - Message that called the command.
	 */
	public parseCommandOverwrittenPrefixes(
		message: Message
	): Promise<ParsedComponentData>;

	/**
	 * Runs parseWithPrefix on multiple prefixes and returns the best parse.
	 * @param message - Message to parse.
	 * @param pairs - Pairs of prefix to associated commands.
	 */
	public parseMultiplePrefixes(
		message: Message,
		prefixes: [string, Set<string> | null]
	): ParsedComponentData;

	/**
	 * Tries to parse a message with the given prefix and associated commands.
	 * Associated commands refer to when a prefix is used in prefix overrides.
	 * @param message - Message to parse.
	 * @param prefix - Prefix to use.
	 * @param associatedCommands - Associated commands.
	 */
	public parseWithPrefix(
		message: Message,
		prefix: string,
		associatedCommands?: Set<string>
	): ParsedComponentData;

	/**
	 * Registers a module.
	 * @param command - Module to use.
	 * @param filepath - Filepath of module.
	 */
	public register(command: Command, filepath?: string): void;

	/**
	 * Registers slash commands.
	 */
	public registerSlashCommands(): void;

	/**
	 * Reloads a command.
	 * @param id - ID of the command.
	 */
	public reload(id: string): Command;

	/**
	 * Reloads all commands.
	 */
	public reloadAll(): this;

	/**
	 * Removes a command.
	 * @param id - ID of the command.
	 */
	public remove(id: string): Command;

	/**
	 * Removes all commands.
	 */
	public removeAll(): this;

	/**
	 * Removes an ongoing prompt.
	 * @param channel - Channel to remove from.
	 * @param user - User to remove.
	 */
	public removePrompt(channel: Channel, user: User): void;

	/**
	 * Runs inhibitors with the all type.
	 * @param message - Message to handle.
	 * @param slash - Whether or not the command should is a slash command.
	 */
	public runAllTypeInhibitors(
		message: Message,
		slash?: boolean
	): Promise<boolean>;
	public runAllTypeInhibitors(
		message: Message | AkairoMessage,
		slash?: boolean
	): Promise<boolean>;

	/**
	 * Runs a command.
	 * @param message - Message to handle.
	 * @param command - Command to handle.
	 * @param args - Arguments to use.
	 */
	public runCommand(
		message: Message,
		command: Command,
		args: any
	): Promise<void>;

	/**
	 * Runs cooldowns and checks if a user is under cooldown.
	 * @param message - Message that called the command.
	 * @param command - Command to cooldown.
	 */
	public runCooldowns(message: Message, command: Command): boolean;
	public runCooldowns(
		message: Message | AkairoMessage,
		command: Command
	): boolean;

	/**
	 * Runs permission checks.
	 * @param message - Message that called the command.
	 * @param command - Command to cooldown.
	 * @param slash - Whether or not the command is a slash command.
	 */
	public runPermissionChecks(
		message: Message,
		command: Command,
		slash?: boolean
	): Promise<boolean>;
	public runPermissionChecks(
		message: Message | AkairoMessage,
		command: Command,
		slash?: boolean
	): Promise<boolean>;

	/**
	 * Runs inhibitors with the post type.
	 * @param message - Message to handle.
	 * @param command - Command to handle.
	 * @param slash - Whether or not the command should is a slash command.
	 */
	public runPostTypeInhibitors(
		message: Message,
		command: Command
	): Promise<boolean>;
	public runPostTypeInhibitors(
		message: Message | AkairoMessage,
		command: Command
	): Promise<boolean>;

	/**
	 * Runs inhibitors with the pre type.
	 * @param message - Message to handle.
	 */
	public runPreTypeInhibitors(message: Message): Promise<boolean>;
	public runPreTypeInhibitors(
		message: Message | AkairoMessage
	): Promise<boolean>;

	/**
	 * Set up the command handler
	 */
	public setup(): void;

	/**
	 * Sweep command util instances from cache and returns amount sweeped.
	 * @param lifetime - Messages older than this will have their command util instance sweeped. This is in milliseconds and defaults to the `commandUtilLifetime` option.
	 */
	public sweepCommandUtil(lifetime: number): number;

	/**
	 * Set the inhibitor handler to use.
	 * @param inhibitorHandler - The inhibitor handler.
	 */
	public useInhibitorHandler(inhibitorHandler: InhibitorHandler): this;

	/**
	 * Set the listener handler to use.
	 * @param listenerHandler - The listener handler.
	 */
	public useListenerHandler(ListenerHandler: ListenerHandler): this;

	public on(
		event: "commandBlocked",
		listener: (
			message: Message,
			command: Command,
			reason: typeof Constants["BuiltInReasons"] | string
		) => any
	): this;

	/**
	 * Emitted when a command breaks out with a retry prompt.
	 * @param message - Message sent.
	 * @param command - Command being broken out.
	 * @param breakMessage - Breakout message.
	 */
	public on(
		event: "commandBreakout",
		listener: (message: Message, command: Command, breakMessage: Message) => any
	): this;

	/**
	 * Emitted when a command is cancelled via prompt or argument cancel.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param retryMessage - Message to retry with. This is passed when a prompt was broken out of with a message that looks like a command.
	 */
	public on(
		event: "commandCancelled",
		listener: (
			message: Message,
			command: Command,
			retryMessage?: Message
		) => any
	): this;

	/**
	 * Emitted when a command finishes execution.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 * @param returnValue - The command's return value.
	 */
	public on(
		event: "commandFinished",
		listener: (
			message: Message,
			command: Command,
			args: any,
			returnValue: any
		) => any
	): this;
	public on(
		event: "commandInvalid",
		listener: (message: Message, command: Command) => any
	): this;
	public on(
		event: "commandLocked",
		listener: (message: Message, command: Command) => any
	): this;

	/**
	 * Emitted when a command starts execution.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 */
	public on(
		event: "commandStarted",
		listener: (message: Message, command: Command, args: any) => any
	): this;

	/**
	 * Emitted when a command or slash command is found on cooldown.
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 * @param remaining - Remaining time in milliseconds for cooldown.
	 */
	public on(
		event: "cooldown",
		listener: (message: Message, command: Command, remaining: number) => any
	): this;

	/**
	 * Emitted when a command or inhibitor errors.
	 * @param error - The error.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 */
	public on(
		event: "error",
		listener: (error: Error, message: Message, command?: Command) => any
	): this;

	/**
	 * Emitted when a user is in a command argument prompt.
	 * Used to prevent usage of commands during a prompt.
	 * @param message - Message sent.
	 */
	public on(event: "inPrompt", listener: (message: Message) => any): this;

	/**
	 * Emitted when a command is loaded.
	 * @param command - Module loaded.
	 * @param isReload - Whether or not this was a reload.
	 */
	public on(
		event: "load",
		listener: (command: Command, isReload: boolean) => any
	): this;

	/**
	 * Emitted when a message is blocked by a pre-message inhibitor. The built-in inhibitors are 'client' and 'bot'.
	 * @param message - Message sent.
	 * @param reason - Reason for the block.
	 */
	public on(
		event: "messageBlocked",
		listener: (message: Message, reason: string) => any
	): this;
	public on(
		event: "messageBlocked",
		listener: (message: Message | AkairoMessage, reason: string) => any
	): this;

	/**
	 * Emitted when a message does not start with the prefix or match a command.
	 * @param message - Message sent.
	 */
	public on(event: "messageInvalid", listener: (message: Message) => any): this;

	/**
	 * Emitted when a command permissions check is failed.
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 * @param type - Either 'client' or 'user'.
	 * @param missing - The missing permissions.
	 */
	public on(
		event: "missingPermissions",
		listener: (
			message: Message,
			command: Command,
			type: "client" | "user",
			missing?: any
		) => any
	): this;

	/**
	 * Emitted when a command is removed.
	 * @param command - Command removed.
	 */
	public on(event: "remove", listener: (command: Command) => any): this;

	/**
	 * Emitted when a slash command is blocked by a post-message inhibitor. The built-in inhibitors are `owner`, `superUser`, `guild`, and `dm`.
	 * @param message - The slash message.
	 * @param command - Command blocked.
	 * @param reason - Reason for the block.
	 */
	public on(
		event: "slashBlocked",
		listener: (message: AkairoMessage, command: Command, reason: string) => any
	): this;

	/**
	 * Emitted when a slash command errors.
	 * @param error - The error.
	 * @param message - The slash message.
	 * @param command - Command executed.
	 */
	public on(
		event: "slashError",
		listener: (error: Error, message: AkairoMessage, command: Command) => any
	): this;

	/**
	 * Emitted when a slash command finishes execution.
	 * @param message - The slash message.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 * @param returnValue - The command's return value.
	 */
	public on(
		event: "slashFinished",
		listener: (
			message: AkairoMessage,
			command: Command,
			args: any,
			returnValue: any
		) => any
	): this;

	/**
	 * Emitted when a slash command permissions check is failed.
	 * @param message - The slash message.
	 * @param command - Command blocked.
	 * @param type - Either 'client' or 'user'.
	 * @param missing - The missing permissions.
	 */
	public on(
		event: "slashMissingPermissions",
		listener: (
			message: AkairoMessage,
			command: Command,
			type: "user" | "client",
			missing?: any
		) => any
	): this;

	/**
	 * Emitted when a an incoming interaction command cannot be matched with a command.
	 * @param interaction - The incoming interaction.
	 */
	public on(
		event: "slashNotFound",
		listener: (interaction: AkairoMessage) => any
	): this;

	/**
	 * Emitted when a slash command starts execution.
	 * @param message - The slash message.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 */
	public on(
		event: "slashStarted",
		listener: (message: AkairoMessage, command: Command, args: any) => any
	): this;
}

/**
 * Command utilities.
 * @param handler - The command handler.
 * @param message - Message that triggered the command.
 */
export class CommandUtil {
	public constructor(handler: CommandHandler, message: Message | AkairoMessage);

	/**  The command handler. */
	public handler: CommandHandler;

	/** Whether or not the command is a slash command. */
	public isSlash: boolean;

	/** The last response sent. */
	public lastResponse?: Message;

	/** Message that triggered the command. */
	public message: Message | AkairoMessage;

	/** Messages stored from prompts and prompt replies. */
	public messages?: Collection<Snowflake, Message>;

	/** The parsed components. */
	public parsed?: ParsedComponentData;

	/** Whether or not the last response should be edited. */
	public shouldEdit: boolean;

	/**
	 * Adds client prompt or user reply to messages.
	 * @param message - Message to add.
	 */
	public addMessage(message: Message | Message[]): Message | Message[];

	/**
	 * Edits the last response.
	 * If the message is a slash command, edits the slash response.
	 * @param options - Options to use.
	 */
	public edit(
		content:
			| string
			| MessageEditOptions
			| WebhookEditMessageOptions
			| MessagePayload
	): Promise<Message>;

	/**
	 * Send an inline reply or respond to a slash command.
	 * If the message is a slash command, it replies or edits the last reply.
	 * @param options - Options to use.
	 */
	public reply(
		options: string | MessagePayload | ReplyMessageOptions
	): Promise<Message>;
	public reply(
		options: string | MessagePayload | InteractionReplyOptions
	): Promise<Message | APIMessage>;

	/**
	 * Sends a response or edits an old response if available.
	 * @param options - Options to use.
	 */
	public send(
		options: string | MessagePayload | MessageOptions
	): Promise<Message>;
	public send(
		options: string | MessagePayload | InteractionReplyOptions
	): Promise<Message | APIMessage>;

	/**
	 * Sends a response, overwriting the last response.
	 * @param options - Options to use.
	 */
	public sendNew(
		options: string | MessagePayload | MessageOptions
	): Promise<Message>;
	public sendNew(
		options: string | MessagePayload | InteractionReplyOptions
	): Promise<Message | APIMessage>;

	/**
	 * Changes if the message should be edited.
	 * @param state - Change to editable or not.
	 */
	public setEditable(state: boolean): this;

	/**
	 * Sets the last response.
	 * @param message - Message to set.
	 */
	public setLastResponse(message: Message): Message;

	/**
	 * Deletes the last response.
	 */
	public delete(): Promise<Message | void>;
}

/**
 * Represents a special return value during command execution or argument parsing.
 * @param type - Type of flag.
 * @param data - Extra data.
 */
export class Flag {
	public constructor(type: string, data: object);

	/** The type of flag. */
	public type: string;

	/**
	 * Creates a flag that cancels the command.
	 */
	public static cancel(): Flag;

	/**
	 * Creates a flag that runs another command with the rest of the arguments.
	 * @param command - Command ID.
	 * @param ignore - Whether or not to ignore permission checks.
	 * @param rest - The rest of the arguments. If this is not set, the argument handler will automatically use the rest of the content.
	 */
	public static continue(
		command: string,
		ignore?: boolean,
		rest?: string
	): Flag & { command: string; ignore: boolean; rest: string };

	/**
	 * Creates a flag that acts as argument cast failure with extra data.
	 * @param value - The extra data for the failure.
	 */
	public static fail(value: any): Flag & { value: any };

	/**
	 * Creates a flag that retries with another input.
	 * @param message - Message to handle.
	 */
	public static retry(message: Message): Flag & { message: Message };

	/**
	 * Checks if a value is a flag and of some type.
	 * @param value - Value to check.
	 * @param type - Type of flag.
	 */
	public static is(value: any, type: "cancel"): value is Flag;
	public static is(
		value: any,
		type: "continue"
	): value is Flag & { command: string; ignore: boolean; rest: string };
	public static is(value: any, type: "fail"): value is Flag & { value: any };
	public static is(
		value: any,
		type: "retry"
	): value is Flag & { message: Message };
	public static is(value: any, type: string): value is Flag;
}

/**
 * Represents an inhibitor.
 * @param id - Inhibitor ID.
 * @param options - Options for the inhibitor.
 */
export class Inhibitor extends AkairoModule {
	public constructor(id: string, options?: InhibitorOptions);

	/** The category the inhibitor belongs to. */
	public category: Category<string, Inhibitor>;

	/** The Akairo client. */
	public client: AkairoClient;

	/** The filepath. */
	public filepath: string;

	/** The inhibitor handler. */
	public handler: InhibitorHandler;

	/** The ID of this inhibitor. */
	public id: string;

	/** Reason emitted when command is inhibited. */
	public reason: string;

	/** The type of the inhibitor for when it should run. */
	public type: string;

	/**
	 * Checks if message should be blocked.
	 * A return value of true will block the message.
	 * If returning a Promise, a resolved value of true will block the message.
	 * @param message - Message being handled.
	 * @param command - Command to check.
	 */
	public exec(message: Message, command?: Command): boolean | Promise<boolean>;
	public exec(
		message: Message | AkairoMessage,
		command?: Command
	): boolean | Promise<boolean>;

	/**
	 * Reloads the inhibitor.
	 */
	public reload(): this;

	/**
	 * Removes the inhibitor.
	 */
	public remove(): this;
}

/**
 * Loads inhibitors and checks messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export class InhibitorHandler extends AkairoHandler {
	public constructor(client: AkairoClient, options: AkairoHandlerOptions);

	/** Categories, mapped by ID to Category. */
	public categories: Collection<string, Category<string, Inhibitor>>;

	/** Class to handle. */
	public classToHandle: typeof Inhibitor;

	/** The Akairo client. */
	public client: AkairoClient;

	/** Directory to inhibitors. */
	public directory: string;

	/** Inhibitors loaded, mapped by ID to Inhibitor. */
	public modules: Collection<string, Inhibitor>;

	/**
	 * Deregisters a module.
	 * @param inhibitor - Module to use.
	 */
	public deregister(inhibitor: Inhibitor): void;

	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	public findCategory(name: string): Category<string, Inhibitor>;

	/**
	 * Loads an inhibitor.
	 * @param thing - Module or path to module.
	 */
	public load(thing: string | Function): Inhibitor;

	/**
	 * Reads all inhibitors from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	public loadAll(directory?: string, filter?: LoadPredicate): this;

	/**
	 * Registers a module.
	 * @param inhibitor - Module to use.
	 * @param filepath - Filepath of module.
	 */
	public register(inhibitor: Inhibitor, filepath?: string): void;

	/**
	 * Reloads an inhibitor.
	 * @param id - ID of the inhibitor.
	 */
	public reload(id: string): Inhibitor;

	/**
	 * Reloads all inhibitors.
	 */
	public reloadAll(): this;

	/**
	 * Removes an inhibitor.
	 * @param {string} id - ID of the inhibitor.
	 */
	public remove(id: string): Inhibitor;

	/**
	 * Removes all inhibitors.
	 */
	public removeAll(): this;

	/**
	 * Tests inhibitors against the message.
	 * Returns the reason if blocked.
	 * @param type - Type of inhibitor, 'all', 'pre', or 'post'.
	 * @param message - Message to test.
	 * @param command - Command to use.
	 */
	public test(
		type: "all" | "pre" | "post",
		message: Message | AkairoMessage,
		command?: Command
	): Promise<string | void>;

	/**
	 * Emitted when an inhibitor is removed.
	 * @param inhibitor - Inhibitor removed.
	 */
	public on(event: "remove", listener: (inhibitor: Inhibitor) => any): this;

	/**
	 * Emitted when an inhibitor is loaded.
	 * @param inhibitor - Inhibitor loaded.
	 * @param isReload - Whether or not this was a reload.
	 */
	public on(
		event: "load",
		listener: (inhibitor: Inhibitor, isReload: boolean) => any
	): this;
}

/**
 * Represents a listener.
 * @param id - Listener ID.
 * @param options - Options for the listener.
 */
export class Listener extends AkairoModule {
	public constructor(id: string, options?: ListenerOptions);

	/** The category of this listener. */
	public category: Category<string, Listener>;

	/** The Akairo client. */
	public client: AkairoClient;

	/** The event emitter. */
	public emitter: string | EventEmitter;

	/** The event name listened to. */
	public event: string;

	/** The filepath. */
	public filepath: string;

	/** The handler. */
	public handler: ListenerHandler;

	/** Type of listener. */
	public type: string;

	/**
	 * Executes the listener.
	 * @param args - Arguments.
	 */
	public exec(...args: any[]): any;

	/**
	 * Reloads the listener.
	 */
	public reload(): this;

	/**
	 * Removes the listener.
	 */
	public remove(): this;
}

/**
 * Loads listeners and registers them with EventEmitters.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export class ListenerHandler extends AkairoHandler {
	public constructor(client: AkairoClient, options: AkairoHandlerOptions);

	/** Categories, mapped by ID to Category. */
	public categories: Collection<string, Category<string, Listener>>;

	/** Class to handle. */
	public classToHandle: typeof Listener;

	/** The Akairo client */
	public client: AkairoClient;

	/** Directory to listeners. */
	public directory: string;

	/** EventEmitters for use, mapped by name to EventEmitter. By default, 'client' is set to the given client. */
	public emitters: Collection<string, EventEmitter>;

	/** Listeners loaded, mapped by ID to Listener. */
	public modules: Collection<string, Listener>;

	/**
	 * Adds a listener to the EventEmitter.
	 * @param id - ID of the listener.
	 */
	public addToEmitter(id: string): Listener;

	/**
	 * Deregisters a module.
	 * @param listener - Module to use.
	 */
	public deregister(listener: Listener): void;

	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	public findCategory(name: string): Category<string, Listener>;

	/**
	 * Loads a listener.
	 * @param thing - Module or path to module.
	 */
	public load(thing: string | Function): Listener;

	/**
	 * Reads all listeners from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	public loadAll(directory?: string, filter?: LoadPredicate): this;

	/**
	 * Registers a module.
	 * @param listener - Module to use.
	 * @param filepath - Filepath of module.
	 */
	public register(listener: Listener, filepath?: string): void;

	/**
	 * Reloads a listener.
	 * @param id - ID of the listener.
	 */
	public reload(id: string): Listener;

	/**
	 * Reloads all listeners.
	 */
	public reloadAll(): this;

	/**
	 * Removes a listener.
	 * @param id - ID of the listener.
	 */
	public remove(id: string): Listener;

	/**
	 * Removes all listeners.
	 */
	public removeAll(): this;

	/**
	 * Removes a listener from the EventEmitter.
	 * @param id - ID of the listener.
	 */
	public removeFromEmitter(id: string): Listener;

	/**
	 * Sets custom emitters.
	 * @param emitters - Emitters to use. The key is the name and value is the emitter.
	 */
	public setEmitters(emitters: { [x: string]: EventEmitter }): void;

	/**
	 * Emitted when a listener is removed.
	 * @param listener - Listener removed.
	 */
	public on(event: "remove", listener: (listener: Listener) => any): this;

	/**
	 * Emitted when a listener is loaded.
	 * @param listener - Listener loaded.
	 * @param isReload - Whether or not this was a reload.
	 */
	public on(
		event: "load",
		listener: (listener: Listener, isReload: boolean) => any
	): this;
}

/**
 * Represents a task.
 * @param id - Task ID.
 * @param options - Options for the task.
 */
export class Task extends AkairoModule {
	public constructor(id: string, options?: TaskOptions);

	/** The category of this task. */
	public category: Category<string, Task>;

	/** The Akairo client.*/
	public client: AkairoClient;

	/** The time in milliseconds between each time the task is run. */
	public delay: number;

	/** The filepath. */
	public filepath: string;

	/** The handler. */
	public handler: TaskHandler;

	/** Whether or not to run the task on start. */
	public runOnStart: boolean;

	/**
	 * Executes the task.
	 * @param args - Arguments.
	 */
	public exec(...args: any[]): any;

	/**
	 * Reloads the task.
	 */
	public reload(): this;

	/**
	 * Removes the task.
	 */
	public remove(): this;
}

/**
 * Loads tasks.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export class TaskHandler extends AkairoHandler {
	public constructor(client: AkairoClient, options: AkairoHandlerOptions);

	/** Categories, mapped by ID to Category. */
	public categories: Collection<string, Category<string, Task>>;

	/** Class to handle. */
	public classToHandle: typeof Task;

	/** The Akairo client */
	public client: AkairoClient;

	/** Directory to tasks. */
	public directory: string;

	/** Tasks loaded, mapped by ID to task. */
	public modules: Collection<string, Task>;

	/**
	 * Deregisters a module.
	 * @param task - Module to use.
	 */
	public deregister(task: Task): void;

	/**
	 * Finds a category by name.
	 * @param name - Name to find with.
	 */
	public findCategory(name: string): Category<string, Task>;

	/**
	 * Loads a task.
	 * @param thing - Module or path to module.
	 */
	public load(thing: string | Function): Task;

	/**
	 * Reads all tasks from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	public loadAll(directory?: string, filter?: LoadPredicate): this;

	/**
	 * Registers a task.
	 * @param task - Task to use.
	 * @param filepath - Filepath of task.
	 */
	public register(task: Task, filepath?: string): void;

	/**
	 * Reloads a task.
	 * @param id - ID of the task.
	 */
	public reload(id: string): Task;

	/**
	 * Reloads all tasks.
	 */
	public reloadAll(): this;

	/**
	 * Removes a task.
	 * @param id - ID of the task.
	 */
	public remove(id: string): Task;

	/**
	 * Removes all tasks.
	 */
	public removeAll(): this;

	/**
	 * Start all tasks.
	 */
	public startAll(): void;

	/**
	 * Emitted when a task is loaded.
	 * @param task - Task loaded.
	 * @param isReload - Whether or not this was a reload.
	 */
	public on(event: "load", task: (task: Task, isReload: boolean) => any): this;

	/**
	 * Emitted when a task is removed.
	 * @param task - Task removed.
	 */
	public on(event: "remove", task: (task: Task) => any): this;
}

/**
 * Type resolver for command arguments.
 * The types are documented under ArgumentType.
 * @param handler - The command handler.
 */
export class TypeResolver {
	public constructor(handler: CommandHandler);

	/** The Akairo client. */
	public client: AkairoClient;

	/** The command handler. */
	public commandHandler: CommandHandler;

	/** The inhibitor handler. */
	public inhibitorHandler?: InhibitorHandler;

	/** The listener handler. */
	public listenerHandler?: ListenerHandler;

	/** Collection of types. */
	public types: Collection<string, ArgumentTypeCaster>;

	/**
	 * Adds built-in types.
	 */
	public addBuiltInTypes(): void;

	/**
	 * Adds a new type.
	 * @param name - Name of the type.
	 * @param fn - Function that casts the type.
	 */
	public addType(name: string, fn: ArgumentTypeCaster): this;

	/**
	 * Adds multiple new types.
	 * @param types  - Object with keys as the type name and values as the cast function.
	 */
	public addTypes(types: { [x: string]: ArgumentTypeCaster }): this;

	/**
	 * Gets the resolver function for a type.
	 * @param name - Name of type.
	 */
	public type(name: string): ArgumentTypeCaster;
}

/**
 * Akairo Utilities.
 */
export class Util {
	/**
	 * Checks if the supplied value is an event emitter.
	 * @param value - Value to check.
	 */
	public static isEventEmitter(value: any): boolean;

	/**
	 * Checks if the supplied value is a promise.
	 * @param value - Value to check.
	 */
	public static isPromise(value: any): boolean;

	/**
	 * Compares two prefixes.
	 * @param aKey - First prefix.
	 * @param bKey - Second prefix.
	 */
	public static prefixCompare(aKey: any, bKey: any): any;

	/**
	 * Converts the supplied value into an array if it is not already one.
	 * @param x - Value to convert.
	 */
	public static intoArray(x: any): any;

	/**
	 * Converts something to become callable.
	 * @param thing - What to turn into a callable.
	 */
	public static intoCallable(thing: any): any;

	/**
	 *
	 * @param xs
	 * @param f
	 */
	public static flatMap(xs: any, f: any): any;

	/**
	 *
	 * @param o1
	 * @param os
	 */
	public static deepAssign(o1: any, ...os: any[]): any;

	/**
	 *
	 * @param xs
	 */
	public static choice(...xs: any[]): any;
}

//#endregion

//#region interfaces

/**
 * Options for module loading and handling.
 */
export interface AkairoHandlerOptions {
	/** Whether or not to set each module's category to its parent directory name. */
	automateCategories?: boolean;

	/** Only classes that extends this class can be handled. */
	classToHandle?: Function;

	/** Directory to modules. */
	directory?: string;

	/**
	 * File extensions to load.
	 * By default this is .js, .json, and .ts files.
	 */
	extensions?: string[] | Set<string>;

	/**
	 * Filter for files to be loaded.
	 * Can be set individually for each handler by overriding the `loadAll` method.
	 */
	loadFilter?: LoadPredicate;
}

export interface AkairoModuleOptions {
	/**
	 * Category ID for organization purposes.
	 * Defaults to `default`.
	 */
	category?: string;
}

/** Options for the client. */
export interface AkairoOptions {
	/** Discord ID of the client owner(s). */
	ownerID?: Snowflake | Snowflake[];

	/** Discord ID of the client superUsers(s). */
	superUserID?: Snowflake | Snowflake[];
}

/**
 * Defaults for argument options.
 */
export interface DefaultArgumentOptions {
	/** Default prompt options. */
	prompt?: ArgumentPromptOptions;

	/** Default text sent if argument parsing fails. */
	otherwise?:
		| string
		| MessagePayload
		| MessageOptions
		| OtherwiseContentSupplier;

	/** Function to modify otherwise content. */
	modifyOtherwise?: OtherwiseContentModifier;
}

/**
 * Options for how an argument parses text.
 */
export interface ArgumentOptions {
	/**
	 * Default value if no input or did not cast correctly.
	 * If using a flag match, setting the default value to a non-void value inverses the result.
	 */
	default?: DefaultValueSupplier | any;

	/** The description of the argument */
	description?: string | any | any[];

	/** The string(s) to use as the flag for flag or option match. */
	flag?: string | string[];

	/**  ID of the argument for use in the args object. This does nothing inside an ArgumentGenerator. */
	id?: string;

	/**
	 * Index of phrase to start from. Applicable to phrase, text, content, rest, or separate match only.
	 * Ignored when used with the unordered option.
	 */
	index?: number;

	/**
	 * Amount of phrases to match when matching more than one.
	 * Applicable to text, content, rest, or separate match only.
	 * Defaults to infinity.
	 */
	limit?: number;

	/** Method to match text. Defaults to 'phrase'. */
	match?: ArgumentMatch;

	/** Function to modify otherwise content. */
	modifyOtherwise?: OtherwiseContentModifier;

	/**
	 * Whether or not to have flags process multiple inputs.
	 * For option flags, this works like the separate match; the limit option will also work here.
	 * For flags, this will count the number of occurrences.
	 */
	multipleFlags?: boolean;

	/** Text sent if argument parsing fails. This overrides the `default` option and all prompt options. */
	otherwise?:
		| string
		| MessagePayload
		| MessageOptions
		| OtherwiseContentSupplier;

	/** Prompt options for when user does not provide input. */
	prompt?: ArgumentPromptOptions | boolean;

	/** Type to cast to. */
	type?: ArgumentType | ArgumentTypeCaster;

	/**
	 * Marks the argument as unordered.
	 * Each phrase is evaluated in order until one matches (no input at all means no evaluation).
	 * Passing in a number forces evaluation from that index onwards.
	 * Passing in an array of numbers forces evaluation on those indices only.
	 * If there is a match, that index is considered used and future unordered args will not check that index again.
	 * If there is no match, then the prompting or default value is used.
	 * Applicable to phrase match only.
	 */
	unordered?: boolean | number | number[];
}

/**
 * Data passed to argument prompt functions.
 */
export interface ArgumentPromptData {
	/** Whether the prompt is infinite or not. */
	infinite: boolean;

	/** The message that caused the prompt. */
	message: Message;

	/** Amount of retries so far. */
	retries: number;

	/** The input phrase that caused the prompt if there was one, otherwise an empty string. */
	phrase: string;

	/** The value that failed if there was one, otherwise null. */
	failure: void | (Flag & { value: any });
}

/**
 * A prompt to run if the user did not input the argument correctly.
 * Can only be used if there is not a default value (unless optional is true).
 */
export interface ArgumentPromptOptions {
	/**
	 * Whenever an input matches the format of a command, this option controls whether or not to cancel this command and run that command.
	 * The command to be run may be the same command or some other command.
	 * Defaults to true,
	 */
	breakout?: boolean;

	/** Text sent on cancellation of command. */
	cancel?: string | MessagePayload | MessageOptions | PromptContentSupplier;

	/** Word to use for cancelling the command. Defaults to 'cancel'. */
	cancelWord?: string;

	/** Text sent on amount of tries reaching the max. */
	ended?: string | MessagePayload | MessageOptions | PromptContentSupplier;

	/**
	 * Prompts forever until the stop word, cancel word, time limit, or retry limit.
	 * Note that the retry count resets back to one on each valid entry.
	 * The final evaluated argument will be an array of the inputs.
	 * Defaults to false.
	 */
	infinite?: boolean;

	/** Amount of inputs allowed for an infinite prompt before finishing. Defaults to Infinity. */
	limit?: number;

	/** Function to modify cancel messages. */
	modifyCancel?: PromptContentModifier;

	/** Function to modify out of tries messages. */
	modifyEnded?: PromptContentModifier;

	/** Function to modify retry prompts. */
	modifyRetry?: PromptContentModifier;

	/** Function to modify start prompts. */
	modifyStart?: PromptContentModifier;

	/** Function to modify timeout messages. */
	modifyTimeout?: PromptContentModifier;

	/** Prompts only when argument is provided but was not of the right type. Defaults to false. */
	optional?: boolean;

	/** Amount of retries allowed. Defaults to 1. */
	retries?: number;

	/** Text sent on a retry (failure to cast type). */
	retry?: string | MessagePayload | MessageOptions | PromptContentSupplier;

	/** Text sent on start of prompt. */
	start?: string | MessagePayload | MessageOptions | PromptContentSupplier;

	/** Word to use for ending infinite prompts. Defaults to 'stop'. */
	stopWord?: string;

	/** Time to wait for input. Defaults to 30000. */
	time?: number;

	/** Text sent on collector time out. */
	timeout?: string | MessagePayload | MessageOptions | PromptContentSupplier;
}

/**
 * State for the argument runner.
 */
export interface ArgumentRunnerState {
	/** Index in terms of the raw strings. */
	index: number;

	/** Index in terms of phrases. */
	phraseIndex: number;

	/** Indices already used for unordered match. */
	usedIndices: Set<number>;
}

/**
 * Choices for a slash command option.
 */
export interface SlashCommandsChoicesOptions {
	/** The name of the choice. */
	name: string;

	/** The value of the choice. */
	value: string | number;
}

/**
 * Options to define the arguments of a slash command.
 */
export interface SlashCommandOptions {
	/** The choices of the argument. */
	choices?: SlashCommandsChoicesOptions[];

	/** The description of the argument. */
	description: string;

	/** The name of the argument. */
	name: string;

	/** Itself. */
	options?: SlashCommandOptions[];

	/** Whether or not the argument is required. */
	required?: boolean;

	/** The type of the argument. */
	type: ApplicationCommandOptionType;
}

/**
 * Options to use for command execution behavior.
 */
export interface CommandOptions extends AkairoModuleOptions {
	/** Command names. */
	aliases?: string[];

	/** Argument options or generator. */
	args?: ArgumentOptions[] | ArgumentGenerator;

	/** The default argument options. */
	argumentDefaults?: DefaultArgumentOptions;

	/** Function to run before argument parsing and execution. */
	before?: BeforeAction;

	/** Restricts channel to either 'guild' or 'dm'. */
	channel?: "guild" | "dm";

	/** Permissions required by the client to run this command. */
	clientPermissions?:
		| PermissionResolvable
		| PermissionResolvable[]
		| MissingPermissionSupplier;

	/** Whether or not to run on messages that are not directly commands. */
	condition?: ExecutionPredicate;

	/** The command cooldown in milliseconds. */
	cooldown?: number;

	/** Description of the command. */
	description?: string | any | any[];

	/** Whether or not message edits will run this command. */
	editable?: boolean;

	/** Flags to use when using an ArgumentGenerator */
	flags?: string[];

	/** ID of user(s) to ignore cooldown or a function to ignore. */
	ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/** ID of user(s) to ignore `userPermissions` checks or a function to ignore. */
	ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/** The key type or key generator for the locker. If lock is a string, it's expected one of 'guild', 'channel', or 'user' */
	lock?: KeySupplier | "guild" | "channel" | "user";

	/** Whether or not to only allow the command to be run in NSFW channels. */
	onlyNsfw?: boolean;

	/** Option flags to use when using an ArgumentGenerator. */
	optionFlags?: string[];

	/** Whether or not to allow client owner(s) only. */
	ownerOnly?: boolean;

	/** The prefix(es) to overwrite the global one for this command. */
	prefix?: string | string[] | PrefixSupplier;

	/** Whether or not to consider quotes. */
	quoted?: boolean;

	/** Amount of command uses allowed until cooldown. */
	ratelimit?: number;

	/** A regex to match in messages that are not directly commands. The args object will have `match` and `matches` properties. */
	regex?: RegExp | RegexSupplier;

	/** Custom separator for argument input. */
	separator?: string;

	/** Mark command as slash command and set information. */
	slash?: boolean;

	/** Whether slash command responses for this command should be ephemeral or not. */
	slashEphemeral?: boolean;

	/** Assign slash commands to Specific guilds. This option will make the commands do not register globally, but only to the chosen servers. */
	slashGuilds?: string[];

	/** Options for using the slash command. */
	slashOptions?: ApplicationCommandOptionData[];

	/** Whether or not to allow client superUsers(s) only. */
	superUserOnly?: boolean;

	/**  Whether or not to type in channel during execution. */
	typing?: boolean;

	/** Permissions required by the user to run this command. */
	userPermissions?:
		| PermissionResolvable
		| PermissionResolvable[]
		| MissingPermissionSupplier;
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
}

/**
 * Result of parsing.
 */
export interface ContentParserResult {
	/** All phrases and flags. */
	all: StringData[];

	/** Phrases. */
	phrases: StringData[];

	/** Flags. */
	flags: StringData[];

	/** Option flags. */
	optionFlags: StringData[];
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
 * Data passed to functions that run when things failed.
 */
export interface FailureData {
	/** The input phrase that failed if there was one, otherwise an empty string. */
	phrase: string;

	/** The value that failed if there was one, otherwise null. */
	failure: void | (Flag & { value: any });
}

/**
 * Options to use for inhibitor execution behavior.
 * Also includes properties from AkairoModuleOptions.
 */
export interface InhibitorOptions extends AkairoModuleOptions {
	/**
	 * Reason emitted when command or message is blocked.
	 */
	reason?: string;

	/**
	 * Can be 'all' to run on all messages, 'pre' to run on messages not blocked by the built-in inhibitors, or 'post' to run on messages that are commands.
	 * Defaults to `post`
	 */
	type?: "all" | "pre" | "post";

	/**
	 * Priority for the inhibitor for when more than one inhibitors block a message.
	 * The inhibitor with the highest priority is the one that is used for the block reason.
	 * Defaults to `0`
	 */
	priority?: number;
}

/**
 * Options to use for listener execution behavior.
 * Also includes properties from AkairoModuleOptions.
 */
export interface ListenerOptions extends AkairoModuleOptions {
	/**
	 * The event emitter, either a key from `ListenerHandler#emitters` or an EventEmitter.
	 */
	emitter: string | EventEmitter;

	/**
	 * Event name to listen to.
	 */
	event: string;

	/**
	 * Type of listener, either 'on' or 'once'.
	 * Defaults to `on`
	 */
	type?: string;
}

/**
 * Options to use for task execution behavior.
 */
export interface TaskOptions extends AkairoModuleOptions {
	/** The amount of time between the task being executed. */
	delay: number;

	/** Whether or not the task runs on start. */
	runOnStart?: boolean;
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

//#endregion

//#region types

/**
 * A single phrase or flag.
 */
export type StringData =
	| {
			/** One of 'Phrase', 'Flag', 'OptionFlag'. */
			type: "Phrase";

			/** The value of a 'Phrase' or 'OptionFlag'. */
			value: string;

			/** The raw string with whitespace and/or separator. */
			raw: string;
	  }
	| {
			/** One of 'Phrase', 'Flag', 'OptionFlag'. */
			type: "Flag";

			/** The key of a 'Flag' or 'OptionFlag'. */
			key: string;

			/** The raw string with whitespace and/or separator. */
			raw: string;
	  }
	| {
			/** One of 'Phrase', 'Flag', 'OptionFlag'. */
			type: "OptionFlag";

			/** The key of a 'Flag' or 'OptionFlag'. */
			key: string;

			/** The value of a 'Phrase' or 'OptionFlag'. */
			value: string;

			/** The raw string with whitespace and/or separator. */
			raw: string;
	  };

/**
 * The method to match arguments from text.
 * - `phrase` matches by the order of the phrases inputted.
 * It ignores phrases that matches a flag.
 * - `flag` matches phrases that are the same as its flag.
 * The evaluated argument is either true or false.
 * - `option` matches phrases that starts with the flag.
 * The phrase after the flag is the evaluated argument.
 * - `rest` matches the rest of the phrases.
 * It ignores phrases that matches a flag.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `separate` matches the rest of the phrases and processes each individually.
 * It ignores phrases that matches a flag.
 * - `text` matches the entire text, except for the command.
 * It ignores phrases that matches a flag.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `content` matches the entire text as it was inputted, except for the command.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `restContent` matches the rest of the text as it was inputted.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `none` matches nothing at all and an empty string will be used for type operations.
 */
export type ArgumentMatch =
	| "phrase"
	| "flag"
	| "option"
	| "rest"
	| "separate"
	| "text"
	| "content"
	| "restContent"
	| "none";

/**
 * The type that the argument should be cast to.
 * - `string` does not cast to any type.
 * - `lowercase` makes the input lowercase.
 * - `uppercase` makes the input uppercase.
 * - `charCodes` transforms the input to an array of char codes.
 * - `number` casts to a number.
 * - `integer` casts to an integer.
 * - `bigint` casts to a big integer.
 * - `url` casts to an `URL` object.
 * - `date` casts to a `Date` object.
 * - `color` casts a hex code to an integer.
 * - `commandAlias` tries to resolve to a command from an alias.
 * - `command` matches the ID of a command.
 * - `inhibitor` matches the ID of an inhibitor.
 * - `listener` matches the ID of a listener.
 *
 * Possible Discord-related types.
 * These types can be plural (add an 's' to the end) and a collection of matching objects will be used.
 * - `user` tries to resolve to a user.
 * - `member` tries to resolve to a member.
 * - `relevant` tries to resolve to a relevant user, works in both guilds and DMs.
 * - `channel` tries to resolve to a channel.
 * - `textChannel` tries to resolve to a text channel.
 * - `voiceChannel` tries to resolve to a voice channel.
 * - `role` tries to resolve to a role.
 * - `emoji` tries to resolve to a custom emoji.
 * - `guild` tries to resolve to a guild.
 *
 * Other Discord-related types:
 * - `message` tries to fetch a message from an ID within the channel.
 * - `guildMessage` tries to fetch a message from an ID within the guild.
 * - `relevantMessage` is a combination of the above, works in both guilds and DMs.
 * - `invite` tries to fetch an invite object from a link.
 * - `userMention` matches a mention of a user.
 * - `memberMention` matches a mention of a guild member.
 * - `channelMention` matches a mention of a channel.
 * - `roleMention` matches a mention of a role.
 * - `emojiMention` matches a mention of an emoji.
 *
 * An array of strings can be used to restrict input to only those strings, case insensitive.
 * The array can also contain an inner array of strings, for aliases.
 * If so, the first entry of the array will be used as the final argument.
 *
 * A regular expression can also be used.
 * The evaluated argument will be an object containing the `match` and `matches` if global.
 */
export type ArgumentType =
	| "string"
	| "lowercase"
	| "uppercase"
	| "charCodes"
	| "number"
	| "integer"
	| "bigint"
	| "emojint"
	| "url"
	| "date"
	| "color"
	| "user"
	| "users"
	| "member"
	| "members"
	| "relevant"
	| "relevants"
	| "channel"
	| "channels"
	| "textChannel"
	| "textChannels"
	| "voiceChannel"
	| "voiceChannels"
	| "categoryChannel"
	| "categoryChannels"
	| "newsChannel"
	| "newsChannels"
	| "storeChannel"
	| "storeChannels"
	| "role"
	| "roles"
	| "emoji"
	| "emojis"
	| "guild"
	| "guilds"
	| "message"
	| "guildMessage"
	| "relevantMessage"
	| "invite"
	| "userMention"
	| "memberMention"
	| "channelMention"
	| "roleMention"
	| "emojiMention"
	| "commandAlias"
	| "command"
	| "inhibitor"
	| "listener"
	| (string | string[])[]
	| RegExp
	| string;

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

/**
 * A function for processing user input to use as an argument.
 * A void return value will use the default value for the argument or start a prompt.
 * Any other truthy return value will be used as the evaluated argument.
 * If returning a Promise, the resolved value will go through the above steps.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 */
export type ArgumentTypeCaster = (message: Message, phrase: string) => any;

/**
 * A function to run before argument parsing and execution.
 * @param message - Message that triggered the command.
 */
export type BeforeAction = (message: Message) => any;

/**
 * Function get the default value of the argument.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export type DefaultValueSupplier = (message: Message, data: FailureData) => any;

/**
 * A function used to check if the command should run arbitrarily.
 * @param message - Message to check.
 */
export type ExecutionPredicate = (message: Message) => boolean;

/**
 * A function that returns whether this message should be ignored for a certain check.
 * @param message - Message to check.
 * @param command - Command to check.
 */
export type IgnoreCheckPredicate = (
	message: Message,
	command: Command
) => boolean;

/**
 * A function used to supply the key for the locker.
 * @param message - Message that triggered the command.
 * @param args - Evaluated arguments.
 */
export type KeySupplier = (message: Message, args: any) => string;

/**
 * Function for filtering files when loading.
 * True means the file should be loaded.
 * @param filepath - Filepath of file.
 */
export type LoadPredicate = (filepath: string) => boolean;

/**
 * A function that returns whether mentions can be used as a prefix.
 * @param message - Message to option for.
 */
export type MentionPrefixPredicate = (
	message: Message
) => boolean | Promise<boolean>;

/**
 * A function used to check if a message has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @param message - Message that triggered the command.
 */
export type MissingPermissionSupplier = (
	message: Message
) => Promise<any> | any;

/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text to modify.
 * @param data - Miscellaneous data.
 */
export type OtherwiseContentModifier = (
	message: Message,
	text: string,
	data: FailureData
) =>
	| string
	| MessagePayload
	| MessageOptions
	| Promise<string | MessagePayload | MessageOptions>;

/**
 * A function returning the content if argument parsing fails.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export type OtherwiseContentSupplier = (
	message: Message,
	data: FailureData
) =>
	| string
	| MessagePayload
	| MessageOptions
	| Promise<string | MessagePayload | MessageOptions>;

/**
 * A function for validating parsed arguments.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 * @param value - The parsed value.
 */
export type ParsedValuePredicate = (
	message: Message,
	phrase: string,
	value: any
) => boolean;

/**
 * A function that returns the prefix(es) to use.
 * @param message - Message to get prefix for.
 */
export type PrefixSupplier = (
	message: Message
) => string | string[] | Promise<string | string[]>;

/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text from the prompt to modify.
 * @param data - Miscellaneous data.
 */
export type PromptContentModifier = (
	message: Message,
	text: string,
	data: ArgumentPromptData
) =>
	| string
	| MessagePayload
	| MessageOptions
	| Promise<string | MessagePayload | MessageOptions>;

/**
 * A function returning text for the prompt.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export type PromptContentSupplier = (
	message: Message,
	data: ArgumentPromptData
) =>
	| string
	| MessagePayload
	| MessageOptions
	| Promise<string | MessagePayload | MessageOptions>;

/**
 * A function used to return a regular expression.
 * @param message - Message to get regex for.
 */
export type RegexSupplier = (message: Message) => RegExp;

export interface AkairoHandlerEvents {
	/**
	 * Emitted when a module is loaded.
	 * @param mod - Module loaded.
	 * @param isReload - Whether or not this was a reload.
	 */
	load: [mod: AkairoModule, isReload: boolean];
	/**
	 * Emitted when a module is removed.
	 * @param mod - Module removed.
	 */
	remove: [mod: AkairoModule];
}

export interface CommandHandlerEvents extends AkairoHandlerEvents {
	/**
	 * Emitted when a command is blocked by a post-message inhibitor. The built-in inhibitors are `owner`, `superUser`, `guild`, and `dm`.
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 * @param reason - Reason for the block.
	 */
	commandBlocked: [
		message: Message,
		command: Command,
		reason: typeof Constants["BuiltInReasons"]
	];
	/**
	 * Emitted when a command breaks out with a retry prompt.
	 * @param message - Message sent.
	 * @param command - Command being broken out.
	 * @param breakMessage - Breakout message.
	 */
	commandBreakout: [message: Message, command: Command, breakMessage: Message];
	/**
	 * Emitted when a command is cancelled via prompt or argument cancel.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param retryMessage - Message to retry with. This is passed when a prompt was broken out of with a message that looks like a command.
	 */
	commandCancelled: [
		message: Message,
		command: Command,
		retryMessage?: Message
	];

	/**
	 * E
	 */
	commandInvalid: [message: Message, command: Command];
}

//#endregion

/**
 * Constants used throughout Discord-Akairo.
 */
export const Constants: {
	ArgumentMatches: {
		PHRASE: "phrase";
		FLAG: "flag";
		OPTION: "option";
		REST: "rest";
		SEPARATE: "separate";
		TEXT: "text";
		CONTENT: "content";
		REST_CONTENT: "restContent";
		NONE: "none";
	};
	ArgumentTypes: {
		STRING: "string";
		LOWERCASE: "lowercase";
		UPPERCASE: "uppercase";
		CHAR_CODES: "charCodes";
		NUMBER: "number";
		INTEGER: "integer";
		BIGINT: "bigint";
		EMOJINT: "emojint";
		URL: "url";
		DATE: "date";
		COLOR: "color";
		USER: "user";
		USERS: "users";
		MEMBER: "member";
		MEMBERS: "members";
		RELEVANT: "relevant";
		RELEVANTS: "relevants";
		CHANNEL: "channel";
		CHANNELS: "channels";
		TEXT_CHANNEL: "textChannel";
		TEXT_CHANNELS: "textChannels";
		VOICE_CHANNEL: "voiceChannel";
		VOICE_CHANNELS: "voiceChannels";
		CATEGORY_CHANNEL: "categoryChannel";
		CATEGORY_CHANNELS: "categoryChannels";
		NEWS_CHANNEL: "newsChannel";
		NEWS_CHANNELS: "newsChannels";
		STORE_CHANNEL: "storeChannel";
		STORE_CHANNELS: "storeChannels";
		ROLE: "role";
		ROLES: "roles";
		EMOJI: "emoji";
		EMOJIS: "emojis";
		GUILD: "guild";
		GUILDS: "guilds";
		MESSAGE: "message";
		GUILD_MESSAGE: "guildMessage";
		RELEVANT_MESSAGE: "relevantMessage";
		INVITE: "invite";
		MEMBER_MENTION: "memberMention";
		CHANNEL_MENTION: "channelMention";
		ROLE_MENTION: "roleMention";
		EMOJI_MENTION: "emojiMention";
		COMMAND_ALIAS: "commandAlias";
		COMMAND: "command";
		INHIBITOR: "inhibitor";
		LISTENER: "listener";
	};
	AkairoHandlerEvents: {
		LOAD: "load";
		REMOVE: "remove";
	};
	CommandHandlerEvents: {
		COMMAND_BLOCKED: "commandBlocked";
		COMMAND_BREAKOUT: "commandBreakout";
		COMMAND_CANCELLED: "commandCancelled";
		COMMAND_FINISHED: "commandFinished";
		COMMAND_INVALID: "commandInvalid";
		COMMAND_LOCKED: "commandLocked";
		COMMAND_STARTED: "commandStarted";
		COOLDOWN: "cooldown";
		ERROR: "error";
		IN_PROMPT: "inPrompt";
		MESSAGE_BLOCKED: "messageBlocked";
		MESSAGE_INVALID: "messageInvalid";
		MISSING_PERMISSIONS: "missingPermissions";
		SLASH_BLOCKED: "slashBlocked";
		SLASH_ERROR: "slashError";
		SLASH_FINISHED: "slashFinished";
		SLASH_MISSING_PERMISSIONS: "slashMissingPermissions";
		SLASH_NOT_FOUND: "slashNotFound";
		SLASH_STARTED: "slashStarted";
	};
	BuiltInReasons: {
		CLIENT: "client";
		BOT: "bot";
		OWNER: "owner";
		SUPER_USER: "superUser";
		GUILD: "guild";
		DM: "dm";
		AUTHOR_NOT_FOUND: "authorNotFound";
		NOT_NSFW: "notNsfw";
	};
};

/**
 * The version of Discord-Akairo.
 */
export const version: string;
