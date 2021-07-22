// @ts-check
"use strict";

/**
 * @typedef {import("../AkairoModule").AkairoModuleOptions} AkairoModuleOptions
 * @typedef {import("./CommandHandler").DefaultArgumentOptions} DefaultArgumentOptions
 * @typedef {import("./CommandHandler").PrefixSupplier} PrefixSupplier
 * @typedef {import("./CommandHandler").IgnoreCheckPredicate} IgnoreCheckPredicate
 * @typedef {import("../../util/AkairoMessage").default} AkairoMessage
 * @typedef {import("./arguments/ArgumentRunner").ArgumentRunnerState} ArgumentRunnerState
 * @typedef {import("./ContentParser").ContentParserResult} ContentParserResult
 * @typedef {import("./Flag").default} Flag
 * @typedef {import("discord.js").PermissionResolvable} PermissionResolvable
 * @typedef {import("discord.js").Snowflake} Snowflake
 * @typedef {import("discord.js").ApplicationCommandOptionData} ApplicationCommandOptionData
 * @typedef {import("./CommandUtil").Message} Message
 */

import AkairoError from "../../util/AkairoError";
import AkairoModule from "../AkairoModule";
import Argument from "./arguments/Argument";
import ArgumentRunner from "./arguments/ArgumentRunner";
import ContentParser from "./ContentParser";

/**
 * Represents a command.
 * @param {string} id - Command ID.
 * @param {CommandOptions} [options={}] - Options for the command.
 * @extends {AkairoModule}
 */
export default class Command extends AkairoModule {
	/**
	 * @param {string} id - Command ID.
	 * @param {CommandOptions} options - Options for the command.
	 */
	constructor(id, options = {}) {
		super(id, { category: options.category });

		/** @type {CommandOptions}*/
		const {
			// @ts-expect-error
			onlyNsfw = false, // @ts-expect-error
			aliases = [], // @ts-expect-error
			args = this.args || [], // @ts-expect-error
			quoted = true, // @ts-expect-error
			separator, // @ts-expect-error
			channel = null, // @ts-expect-error
			ownerOnly = false, // @ts-expect-error
			superUserOnly = false, // @ts-expect-error
			editable = true, // @ts-expect-error
			typing = false, // @ts-expect-error
			cooldown = null, // @ts-expect-error
			ratelimit = 1, // @ts-expect-error
			argumentDefaults = {}, // @ts-expect-error
			description = "", // @ts-expect-error
			prefix = this.prefix, // @ts-expect-error
			clientPermissions = this.clientPermissions, // @ts-expect-error
			userPermissions = this.userPermissions, // @ts-expect-error
			regex = this.regex, // @ts-expect-error
			condition = this.condition || (() => false), // @ts-expect-error
			before = this.before || (() => undefined), // @ts-expect-error
			lock, // @ts-expect-error
			ignoreCooldown, // @ts-expect-error
			ignorePermissions, // @ts-expect-error
			flags = [], // @ts-expect-error
			optionFlags = [], // @ts-expect-error
			slash = false, // @ts-expect-error
			slashOptions, // @ts-expect-error
			slashEphemeral = false, // @ts-expect-error
			slashGuilds = []
		} = options;
		/**
		 * Command names.
		 * @type {string[]}
		 */
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
			? ArgumentRunner.fromArguments(
					// @ts-expect-error
					args.map(arg => [arg.id, new Argument(this, arg)])
			  )
			: args.bind(this);

		/**
		 * Usable only in this NSFW Channels.
		 * @type {boolean}
		 */
		this.onlyNsfw = Boolean(onlyNsfw);

		/**
		 * Usable only in this channel type.
		 * @type {?string}
		 */
		this.channel = channel;

		/**
		 * Usable only by the client owner.
		 * @type {boolean}
		 */
		this.ownerOnly = Boolean(ownerOnly);

		/**
		 * Usable only by the client owner.
		 * @type {boolean}
		 */
		this.superUserOnly = Boolean(superUserOnly);

		/**
		 * Whether or not this command can be ran by an edit.
		 * @type {boolean}
		 */
		this.editable = Boolean(editable);

		/**
		 * Whether or not to type during command execution.
		 * @type {boolean}
		 */
		this.typing = Boolean(typing);

		/**
		 * Cooldown in milliseconds.
		 * @type {?number}
		 */
		this.cooldown = cooldown;

		/**
		 * Uses allowed before cooldown.
		 * @type {number}
		 */
		this.ratelimit = ratelimit;

		/**
		 * Default prompt options.
		 * @type {DefaultArgumentOptions}
		 */
		this.argumentDefaults = argumentDefaults;

		/**
		 * Description of the command.
		 * @type {string|any}
		 */
		this.description = Array.isArray(description)
			? description.join("\n")
			: description;

		/**
		 * Command prefix overwrite.
		 * @type {?string|string[]|PrefixSupplier}
		 */
		this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;

		/**
		 * Permissions required to run command by the client.
		 * @type {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier}
		 */
		this.clientPermissions =
			typeof clientPermissions === "function"
				? clientPermissions.bind(this)
				: clientPermissions;

		/**
		 * Permissions required to run command by the user.
		 * @type {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier}
		 */
		this.userPermissions =
			typeof userPermissions === "function"
				? userPermissions.bind(this)
				: userPermissions;

		/**
		 * The regex trigger for this command.
		 * @type {RegExp|RegexSupplier}
		 */
		this.regex = typeof regex === "function" ? regex.bind(this) : regex;

		/**
		 * Checks if the command should be ran by using an arbitrary condition.
		 * @method
		 * @param {Message} message - Message being handled.
		 * @returns {boolean}
		 */
		this.condition = condition.bind(this);

		/**
		 * Runs before argument parsing and execution.
		 * @method
		 * @param {Message} message - Message being handled.
		 * @returns {any}
		 */
		this.before = before.bind(this);

		/**
		 * The key supplier for the locker.
		 * @type {?KeySupplier}
		 */
		this.lock = lock;

		if (typeof lock === "string") {
			this.lock = {
				guild: message => message.guild && message.guild.id,
				channel: message => message.channel.id,
				user: message => message.author.id
			}[lock];
		}

		if (this.lock) {
			/**
			 * Stores the current locks.
			 * @type {?Set<string>}
			 */
			this.locker = new Set();
		}

		/**
		 * ID of user(s) to ignore cooldown or a function to ignore.
		 * @type {?Snowflake|Snowflake[]|IgnoreCheckPredicate}
		 */
		this.ignoreCooldown =
			typeof ignoreCooldown === "function"
				? ignoreCooldown.bind(this)
				: ignoreCooldown;

		/**
		 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
		 * @type {?Snowflake|Snowflake[]|IgnoreCheckPredicate}
		 */
		this.ignorePermissions =
			typeof ignorePermissions === "function"
				? ignorePermissions.bind(this)
				: ignorePermissions;

		/**
		 * Option for using slash command
		 * @type {ApplicationCommandOptionData[]}
		 */
		this.slashOptions = slashOptions;

		/**
		 * Whether slash command responses for this command should be ephemeral or not.
		 * @type {boolean}
		 */
		this.slashEphemeral = slashEphemeral;

		/**
		 * Mark command as slash command and set information.
		 * @type {boolean}
		 */
		this.slash = slash;

		/**
		 * Assign slash commands to Specific guilds. This option will make the commands do not register globally, but only to the chosen servers.
		 * @type {string[]}
		 */
		this.slashGuilds = slashGuilds;

		/**
		 * The ID of this command.
		 * @name Command#id
		 * @type {string}
		 */

		/**
		 * The command handler.
		 * @name Command#handler
		 * @type {CommandHandler}
		 */
	}

	/**
	 * Executes the command.
	 * @abstract
	 * @param {Message|AkairoMessage} message - Message that triggered the command.
	 * @param {any} args - Evaluated arguments.
	 * @returns {any}
	 */
	// eslint-disable-next-line no-unused-vars
	exec(message, args) {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}

	/**
	 * Execute the slash command
	 * @param {AkairoMessage} message - Message for slash command
	 * @param {any} args - Slash command options
	 * @returns {any}
	 * Disabled cause it wouldn't work with the current design
	 */
	// execSlash() {
	// 	if (this.slash) {
	// 		throw new AkairoError(
	// 			"NOT_IMPLEMENTED",
	// 			this.constructor.name,
	// 			"execSlash"
	// 		);
	// 	}
	// }

	/**
	 * Parses content using the command's arguments.
	 * @param {Message} message - Message to use.
	 * @param {string} content - String to parse.
	 * @returns {Promise<Flag|any>}
	 */
	parse(message, content) {
		const parsed = this.contentParser.parse(content);
		return this.argumentRunner.run(message, parsed, this.argumentGenerator);
	}

	/**
	 * Reloads the command.
	 * @method
	 * @name Command#reload
	 * @returns {Command}
	 */

	/**
	 * Removes the command.
	 * @method
	 * @name Command#remove
	 * @returns {Command}
	 */
}

/**
 * Options to use for command execution behavior.
 * Also includes properties from AkairoModuleOptions.
 * @typedef {AkairoModuleOptions} CommandOptions
 * @prop {string[]} [aliases=[]] - Command names.
 * @prop {ArgumentOptions[]|ArgumentGenerator} [args=[]] - Argument options or generator.
 * @prop {boolean} [quoted=true] - Whether or not to consider quotes.
 * @prop {string} [separator] - Custom separator for argument input.
 * @prop {string[]} [flags=[]] - Flags to use when using an ArgumentGenerator.
 * @prop {string[]} [optionFlags=[]] - Option flags to use when using an ArgumentGenerator.
 * @prop {string} [channel] - Restricts channel to either 'guild" or "dm".
 * @prop {boolean} [ownerOnly=false] - Whether or not to allow client owner(s) only.
 * @prop {boolean} [superUserOnly=false] - Whether or not to allow client SuperUsers(s) only.
 * @prop {boolean} [typing=false] - Whether or not to type in channel during execution.
 * @prop {boolean} [onlyNsfw=false] - Whether or not to type in channel during execution.
 * @prop {boolean} [editable=true] - Whether or not message edits will run this command.
 * @prop {number} [cooldown] - The command cooldown in milliseconds.
 * @prop {number} [ratelimit=1] - Amount of command uses allowed until cooldown.
 * @prop {string|string[]|PrefixSupplier} [prefix] - The prefix(es) to overwrite the global one for this command.
 * @prop {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier} [userPermissions] - Permissions required by the user to run this command.
 * @prop {PermissionResolvable|PermissionResolvable[]|MissingPermissionSupplier} [clientPermissions] - Permissions required by the client to run this command.
 * @prop {RegExp|RegexSupplier} [regex] - A regex to match in messages that are not directly commands.
 * The args object will have `match` and `matches` properties.
 * @prop {ExecutionPredicate} [condition] - Whether or not to run on messages that are not directly commands.
 * @prop {BeforeAction} [before] - Function to run before argument parsing and execution.
 * @prop {KeySupplier|string} [lock] - The key type or key generator for the locker. If lock is a string, it's expected one of "guild", "channel", or "user".
 * @prop {Snowflake|Snowflake[]|IgnoreCheckPredicate} [ignoreCooldown] - ID of user(s) to ignore cooldown or a function to ignore.
 * @prop {Snowflake|Snowflake[]|IgnoreCheckPredicate} [ignorePermissions] - ID of user(s) to ignore `userPermissions` checks or a function to ignore.
 * @prop {DefaultArgumentOptions} [argumentDefaults] - The default argument options.
 * @prop {string} [description=""] - Description of the command.
 */

/**
 * A function to run before argument parsing and execution.
 * @typedef {Function} BeforeAction
 * @param {Message} message - Message that triggered the command.
 * @returns {any}
 */

/**
 * A function used to supply the key for the locker.
 * @typedef {Function} KeySupplier
 * @param {Message} message - Message that triggered the command.
 * @param {any} args - Evaluated arguments.
 * @returns {string}
 */

/**
 * A function used to check if the command should run arbitrarily.
 * @typedef {Function} ExecutionPredicate
 * @param {Message} message - Message to check.
 * @returns {boolean}
 */

/**
 * A function used to check if a message has permissions for the command.
 * A non-null return value signifies the reason for missing permissions.
 * @typedef {Function} MissingPermissionSupplier
 * @param {Message} message - Message that triggered the command.
 * @returns {any}
 */

/**
 * A function used to return a regular expression.
 * @typedef {Function} RegexSupplier
 * @param {Message} message - Message to get regex for.
 * @returns {RegExp}
 */

/**
 * Generator for arguments.
 * When yielding argument options, that argument is ran and the result of the processing is given.
 * The last value when the generator is done is the resulting `args` for the command's `exec`.
 * @typedef {GeneratorFunction} ArgumentGenerator
 * @param {Message} message - Message that triggered the command.
 * @param {ContentParserResult} parsed - Parsed content.
 * @param {ArgumentRunnerState} state - Argument processing state.
 * @returns {IterableIterator<ArgumentOptions|Flag>}
 */
