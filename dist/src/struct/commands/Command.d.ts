import { ApplicationCommandOptionData, Message, PermissionResolvable, Snowflake } from "discord.js";
import AkairoMessage from "../../util/AkairoMessage";
import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule";
import { ArgumentOptions, DefaultArgumentOptions } from "./arguments/Argument";
import ArgumentRunner, { ArgumentRunnerState } from "./arguments/ArgumentRunner";
import CommandHandler, { IgnoreCheckPredicate, PrefixSupplier } from "./CommandHandler";
import ContentParser, { ContentParserResult } from "./ContentParser";
import Flag from "./Flag";
/**
 * Represents a command.
 * @param id - Command ID.
 * @param options - Options for the command.
 */
export default abstract class Command extends AkairoModule {
    constructor(id: string, options: CommandOptions);
    /**
     * Command names.
     */
    aliases: string[];
    /**
     * Default prompt options.
     */
    argumentDefaults: DefaultArgumentOptions;
    /**
     * Category the command belongs to.
     */
    category: Category<string, Command>;
    /**
     * Usable only in this channel type.
     */
    channel?: string;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * Permissions required to run command by the client.
     */
    clientPermissions: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
    /**
     * Cooldown in milliseconds.
     */
    cooldown?: number;
    /**
     * Description of the command.
     */
    description: any;
    /**
     * Whether or not this command can be ran by an edit.
     */
    editable: boolean;
    /**
     * The filepath.
     */
    filepath: string;
    /**
     * The handler.
     */
    handler: CommandHandler;
    /**
     * The ID of the command.
     */
    id: string;
    /**
     * ID of user(s) to ignore cooldown or a function to ignore.
     */
    ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
     */
    ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
    /**
     * The key supplier for the locker.
     */
    lock?: KeySupplier | "channel" | "guild" | "user";
    /**
     * Stores the current locks.
     */
    locker?: Set<string>;
    /**
     * Whether or not the command can only be run in  NSFW channels.
     */
    onlyNsfw: boolean;
    /**
     * Usable only by the client owner.
     */
    ownerOnly: boolean;
    /**
     * Command prefix overwrite.
     */
    prefix?: string | string[] | PrefixSupplier;
    /**
     * Whether or not to consider quotes.
     */
    quoted: boolean;
    /**
     * Uses allowed before cooldown.
     */
    ratelimit: number;
    /**
     * The regex trigger for this command.
     */
    regex: RegExp | RegexSupplier;
    /**
     * Mark command as slash command and set information.
     */
    slash?: boolean;
    /**
     * Whether slash command responses for this command should be ephemeral or not.
     */
    slashEphemeral?: boolean;
    /**
     * Assign slash commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
     */
    slashGuilds?: Snowflake[];
    /**
     * Options for using the slash command.
     */
    slashOptions?: ApplicationCommandOptionData[];
    /**
     * Whether or not to allow client superUsers(s) only.
     */
    superUserOnly: boolean;
    /**
     * Whether or not to type during command execution.
     */
    typing: boolean;
    /**
     * Permissions required to run command by the user.
     */
    userPermissions: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
    /**
     * Argument options or generator.
     */
    _args: ArgumentOptions[] | ArgumentGenerator;
    /**
     * The content parser.
     */
    contentParser: ContentParser;
    /**
     * The argument runner.
     */
    argumentRunner: ArgumentRunner;
    /**
     * Generator for arguments.
     */
    argumentGenerator: ArgumentGenerator;
    /**
     * Executes the command.
     * @param message - Message that triggered the command.
     * @param args - Evaluated arguments.
     */
    exec(message: Message | AkairoMessage, args: any): any;
    /**
     * Runs before argument parsing and execution.
     * @param message - Message being handled.
     */
    before(message: Message): any;
    /**
     * Checks if the command should be ran by using an arbitrary condition.
     * @param message - Message being handled.
     */
    condition(message: Message): boolean | Promise<boolean>;
    /**
     * Execute the slash command
     * @param message - Message for slash command
     * @param args - Slash command options
     */
    execSlash(message: AkairoMessage, ...args: any[]): any;
    /**
     * Parses content using the command's arguments.
     * @param message - Message to use.
     * @param content - String to parse.
     */
    parse(message: Message, content: string): Promise<Flag | any>;
    /**
     * Reloads the command.
     */
    reload(): Command;
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
     * Assign slash commands to Specific guilds. This option will make the commands do not register globally, but only to the chosen servers.
     */
    slashGuilds?: string[];
    /**
     * Options for using the slash command.
     */
    slashOptions?: ApplicationCommandOptionData[];
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
}
/**
 * A function to run before argument parsing and execution.
 * @param message - Message that triggered the command.
 */
export declare type BeforeAction = (message: Message) => any;
/**
 * A function used to supply the key for the locker.
 * @param message - Message that triggered the command.
 * @param args - Evaluated arguments.
 */
export declare type KeySupplier = (message: Message, args: any) => string;
/**
 * A function used to check if the command should run arbitrarily.
 * @param message - Message to check.
 */
export declare type ExecutionPredicate = (message: Message) => boolean;
/**
 * A function used to check if a message has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @param message - Message that triggered the command.
 */
export declare type MissingPermissionSupplier = (message: Message) => Promise<any> | any;
/**
 * A function used to return a regular expression.
 * @param message - Message to get regex for.
 */
export declare type RegexSupplier = (message: Message) => RegExp;
/**
 * Generator for arguments.
 * When yielding argument options, that argument is ran and the result of the processing is given.
 * The last value when the generator is done is the resulting `args` for the command's `exec`.
 * @param message - Message that triggered the command.
 * @param parsed - Parsed content.
 * @param state - Argument processing state.
 */
export declare type ArgumentGenerator = (message: Message, parsed: ContentParserResult, state: ArgumentRunnerState) => IterableIterator<ArgumentOptions | Flag>;
//# sourceMappingURL=Command.d.ts.map