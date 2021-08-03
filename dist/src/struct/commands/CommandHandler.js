"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../util/AkairoError"));
const AkairoHandler_1 = __importDefault(require("../AkairoHandler"));
const Constants_1 = require("../../util/Constants");
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("./Command"));
const CommandUtil_1 = __importDefault(require("./CommandUtil"));
const Flag_1 = __importDefault(require("./Flag"));
const AkairoMessage_1 = __importDefault(require("../../util/AkairoMessage"));
const TypeResolver_1 = __importDefault(require("./arguments/TypeResolver"));
const Util_1 = __importDefault(require("../../util/Util"));
/**
 * Loads commands and handles messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
class CommandHandler extends AkairoHandler_1.default {
	/** Collection of command aliases. */
	aliases;
	/** Regular expression to automatically make command aliases for. */
	aliasReplacement;
	/** Whether or not mentions are allowed for prefixing. */
	allowMention;
	/** Default argument options. */
	argumentDefaults;
	/** Automatically defer messages "BotName is thinking". */
	autoDefer;
	/**  Specify whether to register all slash commands when starting the client */
	autoRegisterSlashCommands;
	/** Whether or not to block bots. */
	blockBots;
	/** Whether or not to block self. */
	blockClient;
	/** Whether or not `message.util` is assigned. */
	commandUtil;
	/** Milliseconds a message should exist for before its command util instance is marked for removal. */
	commandUtilLifetime;
	/** Collection of CommandUtils. */
	commandUtils;
	/** Time interval in milliseconds for sweeping command util instances. */
	commandUtilSweepInterval;
	/**
	 * Collection of cooldowns.
	 * <info>The elements in the collection are objects with user IDs as keys
	 * and {@link CooldownData} objects as values</info>
	 */
	cooldowns;
	/** Default cooldown for commands. */
	defaultCooldown;
	/** Whether or not to use execSlash for slash commands. */
	execSlash;
	/** Whether or not members are fetched on each message author from a guild. */
	fetchMembers;
	/** Whether or not edits are handled. */
	handleEdits;
	/** ID of user(s) to ignore cooldown or a function to ignore. */
	ignoreCooldown;
	/** ID of user(s) to ignore `userPermissions` checks or a function to ignore. */
	ignorePermissions;
	/** Inhibitor handler to use. */
	inhibitorHandler;
	/** The prefix(es) for command parsing. */
	prefix;
	/** Collection of prefix overwrites to commands. */
	prefixes;
	/** Collection of sets of ongoing argument prompts. */
	prompts;
	/** The type resolver. */
	resolver;
	/** Whether or not to store messages in CommandUtil. */
	storeMessages;
	/** Show "BotName is typing" information message on the text channels when a command is running. */
	typing;
	constructor(
		client,
		{
			directory,
			classToHandle = Command_1.default,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter,
			blockClient = true,
			blockBots = true,
			fetchMembers = false,
			handleEdits = false,
			storeMessages = false,
			commandUtil,
			commandUtilLifetime = 3e5,
			commandUtilSweepInterval = 3e5,
			defaultCooldown = 0,
			ignoreCooldown = client.ownerID,
			ignorePermissions = [],
			argumentDefaults = {},
			prefix = "!",
			allowMention = true,
			aliasReplacement,
			autoDefer = false,
			typing = false,
			autoRegisterSlashCommands = false,
			execSlash = false
		} = {}
	) {
		if (
			!(
				classToHandle.prototype instanceof Command_1.default ||
				classToHandle === Command_1.default
			)
		) {
			throw new AkairoError_1.default(
				"INVALID_CLASS_TO_HANDLE",
				classToHandle.name,
				Command_1.default.name
			);
		}
		super(client, {
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		});
		/**
		 * Specify whether to register all slash commands when starting the client.
		 * Defaults to false.
		 */
		this.autoRegisterSlashCommands = autoRegisterSlashCommands;
		/**
		 * Show "BotName is typing" information message on the text channels when a command is running.
		 * Defaults to false.
		 */
		this.typing = typing;
		/**
		 * Automatically defer messages "BotName is thinking"
		 * Defaults to true.
		 */
		this.autoDefer = autoDefer;
		/**
		 * The type resolver.
		 * @type {TypeResolver}
		 */
		this.resolver = new TypeResolver_1.default(this);
		/**
		 * Collection of command aliases.
		 * @type {Collection<string, string>}
		 */
		this.aliases = new discord_js_1.Collection();
		/**
		 * Regular expression to automatically make command aliases for.
		 * @type {?RegExp}
		 */
		this.aliasReplacement = aliasReplacement;
		/**
		 * Collection of prefix overwrites to commands.
		 * @type {Collection<string|PrefixSupplier, Set<string>>}
		 */
		this.prefixes = new discord_js_1.Collection();
		/**
		 * Whether or not to block self.
		 * @type {boolean}
		 */
		this.blockClient = Boolean(blockClient);
		/**
		 * Whether or not to block bots.
		 * @type {boolean}
		 */
		this.blockBots = Boolean(blockBots);
		/**
		 * Whether or not members are fetched on each message author from a guild.
		 * @type {boolean}
		 */
		this.fetchMembers = Boolean(fetchMembers);
		/**
		 * Whether or not edits are handled.
		 * @type {boolean}
		 */
		this.handleEdits = Boolean(handleEdits);
		/**
		 * Whether or not to store messages in CommandUtil.
		 * @type {boolean}
		 */
		this.storeMessages = Boolean(storeMessages);
		/**
		 * Whether or not `message.util` is assigned.
		 * @type {boolean}
		 */
		this.commandUtil = Boolean(commandUtil);
		if ((this.handleEdits || this.storeMessages) && !this.commandUtil) {
			throw new AkairoError_1.default("COMMAND_UTIL_EXPLICIT");
		}
		/**
		 * Milliseconds a message should exist for before its command util instance is marked for removal.
		 * @type {number}
		 */
		this.commandUtilLifetime = commandUtilLifetime;
		/**
		 * Time interval in milliseconds for sweeping command util instances.
		 * @type {number}
		 */
		this.commandUtilSweepInterval = commandUtilSweepInterval;
		if (this.commandUtilSweepInterval > 0) {
			setInterval(
				() => this.sweepCommandUtil(),
				this.commandUtilSweepInterval
			).unref();
		}
		/**
		 * Collection of CommandUtils.
		 * @type {Collection<string, CommandUtil>}
		 */
		this.commandUtils = new discord_js_1.Collection();
		/**
		 * Collection of cooldowns.
		 * <info>The elements in the collection are objects with user IDs as keys
		 * and {@link CooldownData} objects as values</info>
		 * @type {Collection<string, Object>}
		 */
		this.cooldowns = new discord_js_1.Collection();
		/**
		 * Default cooldown for commands.
		 * @type {number}
		 */
		this.defaultCooldown = defaultCooldown;
		/**
		 * ID of user(s) to ignore cooldown or a function to ignore.
		 * @type {Snowflake|Snowflake[]|IgnoreCheckPredicate}
		 */
		this.ignoreCooldown =
			typeof ignoreCooldown === "function"
				? ignoreCooldown.bind(this)
				: ignoreCooldown;
		/**
		 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
		 * @type {Snowflake|Snowflake[]|IgnoreCheckPredicate}
		 */
		this.ignorePermissions =
			typeof ignorePermissions === "function"
				? ignorePermissions.bind(this)
				: ignorePermissions;
		/**
		 * Collection of sets of ongoing argument prompts.
		 * @type {Collection<string, Set<string>>}
		 */
		this.prompts = new discord_js_1.Collection();
		/**
		 * Default argument options.
		 * @type {DefaultArgumentOptions}
		 */
		this.argumentDefaults = Util_1.default.deepAssign(
			{
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
			},
			argumentDefaults
		);
		/**
		 * The prefix(es) for command parsing.
		 * @type {string|string[]|PrefixSupplier}
		 */
		this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;
		/**
		 * Whether or not mentions are allowed for prefixing.
		 * @type {boolean|MentionPrefixPredicate}
		 */
		this.allowMention =
			typeof allowMention === "function"
				? allowMention.bind(this)
				: Boolean(allowMention);
		/**
		 * Inhibitor handler to use.
		 * @type {?InhibitorHandler}
		 */
		this.inhibitorHandler = null;
		this.autoDefer = Boolean(autoDefer);
		this.execSlash = Boolean(execSlash);
		/**
		 * Directory to commands.
		 * @name CommandHandler#directory
		 * @type {string}
		 */
		/**
		 * Commands loaded, mapped by ID to Command.
		 * @name CommandHandler#modules
		 * @type {Collection<string, Command>}
		 */
		this.setup();
	}
	setup() {
		this.client.once("ready", () => {
			if (this.autoRegisterSlashCommands) this.registerSlashCommands();
			this.client.on("messageCreate", async m => {
				if (m.partial) await m.fetch();
				this.handle(m);
			});
			if (this.handleEdits) {
				this.client.on("messageUpdate", async (o, m) => {
					if (o.partial) await o.fetch();
					if (m.partial) await m.fetch();
					if (o.content === m.content) return;
					if (this.handleEdits) this.handle(m);
				});
			}
			this.client.on("interactionCreate", i => {
				if (!i.isCommand()) return;
				this.handleSlash(i);
			});
		});
	}
	registerSlashCommands() {
		const slashCommandsParsed = [];
		for (const [, data] of this.modules) {
			if (data.slash) {
				const parseDescriptionCommand = description => {
					if (typeof description === "object") {
						if (typeof description.content === "function")
							return description.content();
						if (typeof description.content === "string")
							return description.content;
					}
					return description;
				};
				slashCommandsParsed.push({
					name: data.aliases[0],
					description: parseDescriptionCommand(data.description),
					options: data.slashOptions,
					guilds: data.slashGuilds
				});
			}
		}
		for (const { name, description, options, guilds } of slashCommandsParsed) {
			for (const guildId of guilds) {
				const guild = this.client.guilds.cache.get(guildId);
				if (!guild) continue;
				guild.commands.create({
					name,
					description,
					options
				});
			}
		}
		const slashCommandsApp = slashCommandsParsed
			.filter(({ guilds }) => !guilds.length)
			.map(({ name, description, options }) => {
				return { name, description, options };
			});
		this.client.application?.commands.set(slashCommandsApp);
	}
	/**
	 * Registers a module.
	 * @param {Command} command - Module to use.
	 * @param {string} [filepath] - Filepath of module.
	 * @returns {void}
	 */
	register(command, filepath) {
		super.register(command, filepath);
		for (let alias of command.aliases) {
			const conflict = this.aliases.get(alias.toLowerCase());
			if (conflict)
				throw new AkairoError_1.default(
					"ALIAS_CONFLICT",
					alias,
					command.id,
					conflict
				);
			alias = alias.toLowerCase();
			this.aliases.set(alias, command.id);
			if (this.aliasReplacement) {
				const replacement = alias.replace(this.aliasReplacement, "");
				if (replacement !== alias) {
					const replacementConflict = this.aliases.get(replacement);
					if (replacementConflict)
						throw new AkairoError_1.default(
							"ALIAS_CONFLICT",
							replacement,
							command.id,
							replacementConflict
						);
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
					} else {
						this.prefixes.set(prefix, new Set([command.id]));
						newEntry = true;
					}
				}
			} else {
				const prefixes = this.prefixes.get(command.prefix);
				if (prefixes) {
					prefixes.add(command.id);
				} else {
					this.prefixes.set(command.prefix, new Set([command.id]));
					newEntry = true;
				}
			}
			if (newEntry) {
				this.prefixes = this.prefixes.sort((aVal, bVal, aKey, bKey) =>
					Util_1.default.prefixCompare(aKey, bKey)
				);
			}
		}
	}
	/**
	 * Deregisters a module.
	 * @param {Command} command - Module to use.
	 * @returns {void}
	 */
	deregister(command) {
		for (let alias of command.aliases) {
			alias = alias.toLowerCase();
			this.aliases.delete(alias);
			if (this.aliasReplacement) {
				const replacement = alias.replace(this.aliasReplacement, "");
				if (replacement !== alias) this.aliases.delete(replacement);
			}
		}
		if (command.prefix != null) {
			if (Array.isArray(command.prefix)) {
				for (const prefix of command.prefix) {
					const prefixes = this.prefixes.get(prefix);
					if (prefixes?.size === 1) {
						this.prefixes.delete(prefix);
					} else {
						prefixes?.delete(prefix);
					}
				}
			} else {
				const prefixes = this.prefixes.get(command.prefix);
				if (prefixes?.size === 1) {
					this.prefixes.delete(command.prefix);
				} else {
					// @ts-expect-error
					prefixes.delete(command.prefix);
				}
			}
		}
		super.deregister(command);
	}
	/**
	 * Handles a message.
	 * @param {Message} message - Message to handle.
	 * @returns {Promise<?boolean>}
	 */
	async handle(message) {
		try {
			if (
				this.fetchMembers &&
				message.guild &&
				!message.member &&
				!message.webhookId
			) {
				await message.guild.members.fetch(message.author);
			}
			if (await this.runAllTypeInhibitors(message)) {
				return false;
			}
			if (this.commandUtil) {
				if (this.commandUtils.has(message.id)) {
					// @ts-expect-error
					message.util = this.commandUtils.get(message.id);
				} else {
					// @ts-expect-error
					message.util = new CommandUtil_1.default(this, message);
					// @ts-expect-error
					this.commandUtils.set(message.id, message.util);
				}
			}
			if (await this.runPreTypeInhibitors(message)) {
				return false;
			}
			let parsed = await this.parseCommand(message);
			if (!parsed.command) {
				const overParsed = await this.parseCommandOverwrittenPrefixes(message);
				if (
					overParsed.command ||
					(parsed.prefix == null && overParsed.prefix != null)
				) {
					parsed = overParsed;
				}
			}
			if (this.commandUtil) {
				// @ts-expect-error
				message.util.parsed = parsed;
			}
			let ran;
			if (!parsed.command) {
				ran = await this.handleRegexAndConditionalCommands(message);
			} else {
				ran = await this.handleDirectCommand(
					message,
					parsed.content,
					parsed.command
				);
			}
			if (ran === false) {
				this.emit(Constants_1.CommandHandlerEvents.MESSAGE_INVALID, message);
				return false;
			}
			return ran;
		} catch (err) {
			// @ts-expect-error
			this.emitError(err, message);
			return null;
		}
	}
	/**
	 * Handles a slash command.
	 * @param {CommandInteraction} interaction - Interaction to handle.
	 * @returns {Promise<?boolean>}
	 */
	// eslint-disable-next-line complexity
	async handleSlash(interaction) {
		const command = this.findCommand(interaction.commandName);
		if (!command) {
			this.emit(Constants_1.CommandHandlerEvents.SLASH_NOT_FOUND, interaction);
			return false;
		}
		const message = new AkairoMessage_1.default(this.client, interaction, {
			slash: true,
			replied: this.autoDefer || command.slashEphemeral,
			command
		});
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
				} else {
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
				if (
					overParsed.command ||
					(parsed.prefix == null && overParsed.prefix != null)
				) {
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
			for (const option of command.slashOptions) {
				convertedOptions[option.name] = interaction.options.get(
					option.name,
					option.required || false
				)?.value;
			}
			let key;
			try {
				// @ts-expect-error
				if (command.lock) key = command.lock(message, convertedOptions);
				if (Util_1.default.isPromise(key)) key = await key;
				if (key) {
					if (command.locker?.has(key)) {
						key = null;
						this.emit(
							Constants_1.CommandHandlerEvents.COMMAND_LOCKED,
							message,
							command
						);
						return true;
					}
					command.locker?.add(key);
				}
			} catch (err) {
				this.emitError(err, message, command);
			} finally {
				if (key) command.locker?.delete(key);
			}
			if (this.autoDefer || command.slashEphemeral) {
				await interaction.defer({ ephemeral: command.slashEphemeral });
			}
			try {
				this.emit(
					Constants_1.CommandHandlerEvents.SLASH_STARTED,
					message,
					command,
					convertedOptions
				);
				const ret = // @ts-expect-error
					command.execSlash || this.execSlash // @ts-expect-error
						? await command.execSlash(message, convertedOptions)
						: await command.exec(message, convertedOptions);
				this.emit(
					Constants_1.CommandHandlerEvents.SLASH_FINISHED,
					message,
					command,
					convertedOptions,
					ret
				);
				return true;
			} catch (err) {
				this.emit(
					Constants_1.CommandHandlerEvents.SLASH_ERROR,
					err,
					message,
					command
				);
				return false;
			}
		} catch (err) {
			// @ts-expect-error
			this.emitError(err, message);
			return null;
		}
	}
	/**
	 * Handles normal commands.
	 * @param {Message} message - Message to handle.
	 * @param {string} content - Content of message without command.
	 * @param {Command} command - Command instance.
	 * @param {boolean} [ignore=false] - Ignore inhibitors and other checks.
	 * @returns {Promise<?boolean>}
	 */
	async handleDirectCommand(message, content, command, ignore = false) {
		let key;
		try {
			if (!ignore) {
				if (message.editedTimestamp && !command.editable) return false;
				if (await this.runPostTypeInhibitors(message, command)) return false;
			}
			const before = command.before(message);
			if (Util_1.default.isPromise(before)) await before;
			const args = await command.parse(message, content);
			if (Flag_1.default.is(args, "cancel")) {
				this.emit(
					Constants_1.CommandHandlerEvents.COMMAND_CANCELLED,
					message,
					command
				);
				return true;
			} else if (Flag_1.default.is(args, "retry")) {
				this.emit(
					Constants_1.CommandHandlerEvents.COMMAND_BREAKOUT,
					message,
					command,
					args.message
				);
				return this.handle(args.message);
			} else if (Flag_1.default.is(args, "continue")) {
				const continueCommand = this.modules.get(args.command);
				return this.handleDirectCommand(
					message,
					args.rest,
					continueCommand,
					args.ignore
				);
			}
			if (!ignore) {
				if (command.lock) key = command.lock(message, args);
				if (Util_1.default.isPromise(key)) key = await key;
				if (key) {
					if (command.locker?.has(key)) {
						key = null;
						this.emit(
							Constants_1.CommandHandlerEvents.COMMAND_LOCKED,
							message,
							command
						);
						return true;
					}
					command.locker?.add(key);
				}
			}
			await this.runCommand(message, command, args);
			return true;
		} catch (err) {
			this.emitError(err, message, command);
			return null;
		} finally {
			if (key) command.locker?.delete(key);
		}
	}
	/**
	 * Handles regex and conditional commands.
	 * @param {Message} message - Message to handle.
	 * @returns {Promise<boolean>}
	 */
	async handleRegexAndConditionalCommands(message) {
		const ran1 = await this.handleRegexCommands(message);
		const ran2 = await this.handleConditionalCommands(message);
		return ran1 || ran2;
	}
	/**
	 * Handles regex commands.
	 * @param {Message} message - Message to handle.
	 * @returns {Promise<boolean>}
	 */
	async handleRegexCommands(message) {
		const hasRegexCommands = [];
		for (const command of this.modules.values()) {
			if (message.editedTimestamp ? command.editable : true) {
				const regex =
					typeof command.regex === "function"
						? command.regex(message)
						: command.regex;
				if (regex) hasRegexCommands.push({ command, regex });
			}
		}
		const matchedCommands = [];
		for (const entry of hasRegexCommands) {
			const match = message.content.match(entry.regex);
			if (!match) continue;
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
			promises.push(
				(async () => {
					try {
						if (await this.runPostTypeInhibitors(message, command)) return;
						const before = command.before(message);
						if (Util_1.default.isPromise(before)) await before;
						await this.runCommand(message, command, { match, matches });
					} catch (err) {
						this.emitError(err, message, command);
					}
				})()
			);
		}
		await Promise.all(promises);
		return true;
	}
	/**
	 * Handles conditional commands.
	 * @param {Message} message - Message to handle.
	 * @returns {Promise<boolean>}
	 */
	async handleConditionalCommands(message) {
		const trueCommands = [];
		const filterPromises = [];
		for (const command of this.modules.values()) {
			if (message.editedTimestamp && !command.editable) continue;
			filterPromises.push(
				(async () => {
					let cond = command.condition(message);
					if (Util_1.default.isPromise(cond)) cond = await cond;
					if (cond) trueCommands.push(command);
				})()
			);
		}
		await Promise.all(filterPromises);
		if (!trueCommands.length) {
			return false;
		}
		const promises = [];
		for (const command of trueCommands) {
			promises.push(
				(async () => {
					try {
						if (await this.runPostTypeInhibitors(message, command)) return;
						const before = command.before(message);
						if (Util_1.default.isPromise(before)) await before;
						await this.runCommand(message, command, {});
					} catch (err) {
						this.emitError(err, message, command);
					}
				})()
			);
		}
		await Promise.all(promises);
		return true;
	}
	/**
	 * Runs inhibitors with the all type.
	 * @param {Message|AkairoMessage} message - Message to handle.
	 * @param {boolean} slash - Whether or not the command should is a slash command.
	 * @returns {Promise<boolean>}
	 */
	async runAllTypeInhibitors(message, slash = false) {
		const reason = this.inhibitorHandler
			? await this.inhibitorHandler.test("all", message)
			: null;
		if (reason != null) {
			this.emit(
				Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED,
				message,
				reason
			);
		} else if (!message.author) {
			this.emit(
				Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED,
				message,
				Constants_1.BuiltInReasons.AUTHOR_NOT_FOUND
			);
		} else if (this.blockClient && message.author.id === this.client.user?.id) {
			this.emit(
				Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED,
				message,
				Constants_1.BuiltInReasons.CLIENT
			);
		} else if (this.blockBots && message.author.bot) {
			this.emit(
				Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED,
				message,
				Constants_1.BuiltInReasons.BOT
			); // @ts-expect-error
		} else if (!slash && this.hasPrompt(message.channel, message.author)) {
			this.emit(Constants_1.CommandHandlerEvents.IN_PROMPT, message);
		} else {
			return false;
		}
		return true;
	}
	/**
	 * Runs inhibitors with the pre type.
	 * @param {Message|AkairoMessage} message - Message to handle.
	 * @returns {Promise<boolean>}
	 */
	async runPreTypeInhibitors(message) {
		const reason = this.inhibitorHandler
			? await this.inhibitorHandler.test("pre", message)
			: null;
		if (reason != null) {
			this.emit(
				Constants_1.CommandHandlerEvents.MESSAGE_BLOCKED,
				message,
				reason
			);
		} else {
			return false;
		}
		return true;
	}
	/**
	 * Runs inhibitors with the post type.
	 * @param {Message|AkairoMessage} message - Message to handle.
	 * @param {Command} command - Command to handle.
	 * @param {boolean} slash - Whether or not the command should is a slash command.
	 * @returns {Promise<boolean>}
	 */
	async runPostTypeInhibitors(message, command, slash = false) {
		const event = slash
			? Constants_1.CommandHandlerEvents.SLASH_BLOCKED
			: Constants_1.CommandHandlerEvents.COMMAND_BLOCKED;
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
				this.emit(event, message, command, Constants_1.BuiltInReasons.OWNER);
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
		// @ts-expect-error
		if (command.onlyNsfw && !message.channel.nsfw) {
			this.emit(event, message, command, Constants_1.BuiltInReasons.NOT_NSFW);
			return true;
		}
		if (await this.runPermissionChecks(message, command, slash)) {
			return true;
		}
		const reason = this.inhibitorHandler
			? await this.inhibitorHandler.test("post", message, command)
			: null;
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
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @param {Command} command - Command to cooldown.
	 * @param {boolean} slash - Whether or not the command is a slash command.
	 * @returns {Promise<boolean>}
	 */
	async runPermissionChecks(message, command, slash = false) {
		if (command.clientPermissions) {
			if (typeof command.clientPermissions === "function") {
				// @ts-expect-error
				let missing = command.clientPermissions(message);
				if (Util_1.default.isPromise(missing)) missing = await missing;
				if (missing != null) {
					this.emit(
						slash
							? Constants_1.CommandHandlerEvents.SLASH_MISSING_PERMISSIONS
							: Constants_1.CommandHandlerEvents.MISSING_PERMISSIONS,
						message,
						command,
						"client",
						missing
					);
					return true;
				}
			} else if (message.guild) {
				if (message.channel?.type === "DM") return false;
				const missing = message.channel
					?.permissionsFor(message.guild.me)
					?.missing(command.clientPermissions);
				if (missing?.length) {
					this.emit(
						slash
							? Constants_1.CommandHandlerEvents.SLASH_MISSING_PERMISSIONS
							: Constants_1.CommandHandlerEvents.MISSING_PERMISSIONS,
						message,
						command,
						"client",
						missing
					);
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
					if (Util_1.default.isPromise(missing)) missing = await missing;
					if (missing != null) {
						this.emit(
							slash
								? Constants_1.CommandHandlerEvents.SLASH_MISSING_PERMISSIONS
								: Constants_1.CommandHandlerEvents.MISSING_PERMISSIONS,
							message,
							command,
							"user",
							missing
						);
						return true;
					}
				} else if (message.guild) {
					if (message.channel?.type === "DM") return false;
					const missing = message.channel
						?.permissionsFor(message.author)
						?.missing(command.userPermissions);
					if (missing?.length) {
						this.emit(
							slash
								? Constants_1.CommandHandlerEvents.SLASH_MISSING_PERMISSIONS
								: Constants_1.CommandHandlerEvents.MISSING_PERMISSIONS,
							message,
							command,
							"user",
							missing
						);
						return true;
					}
				}
			}
		}
		return false;
	}
	/**
	 * Runs cooldowns and checks if a user is under cooldown.
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @param {Command} command - Command to cooldown.
	 * @returns {boolean}
	 */
	runCooldowns(message, command) {
		const id = message.author?.id;
		const ignorer = command.ignoreCooldown || this.ignoreCooldown;
		const isIgnored = Array.isArray(ignorer)
			? ignorer.includes(id)
			: typeof ignorer === "function"
			? ignorer(message, command)
			: id === ignorer;
		if (isIgnored) return false;
		const time =
			command.cooldown != null ? command.cooldown : this.defaultCooldown;
		if (!time) return false;
		const endTime = message.createdTimestamp + time;
		if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});
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
			this.emit(
				Constants_1.CommandHandlerEvents.COOLDOWN,
				message,
				command,
				diff
			);
			return true;
		}
		entry.uses++;
		return false;
	}
	/**
	 * Runs a command.
	 * @param {Message} message - Message to handle.
	 * @param {Command} command - Command to handle.
	 * @param {any} args - Arguments to use.
	 * @returns {Promise<void>}
	 */
	async runCommand(message, command, args) {
		if (!command || !message) {
			this.emit(
				Constants_1.CommandHandlerEvents.COMMAND_INVALID,
				message,
				command
			);
			return;
		}
		if (command.typing || this.typing) {
			message.channel.sendTyping();
		}
		this.emit(
			Constants_1.CommandHandlerEvents.COMMAND_STARTED,
			message,
			command,
			args
		);
		const ret = await command.exec(message, args);
		this.emit(
			Constants_1.CommandHandlerEvents.COMMAND_FINISHED,
			message,
			command,
			args,
			ret
		);
	}
	/**
	 * Parses the command and its argument list.
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @returns {Promise<ParsedComponentData>}
	 */
	async parseCommand(message) {
		const allowMention = await Util_1.default.intoCallable(this.prefix)(
			message
		);
		let prefixes = Util_1.default.intoArray(allowMention);
		if (allowMention) {
			const mentions = [
				`<@${this.client.user?.id}>`,
				`<@!${this.client.user?.id}>`
			];
			prefixes = [...mentions, ...prefixes];
		}
		prefixes.sort(Util_1.default.prefixCompare);
		return this.parseMultiplePrefixes(
			message,
			prefixes.map(p => [p, null])
		);
	}
	/**
	 * Parses the command and its argument list using prefix overwrites.
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @returns {Promise<ParsedComponentData>}
	 */
	async parseCommandOverwrittenPrefixes(message) {
		if (!this.prefixes.size) {
			return {};
		}
		const promises = this.prefixes.map(async (cmds, provider) => {
			const prefixes = Util_1.default.intoArray(
				await Util_1.default.intoCallable(provider)(message)
			);
			return prefixes.map(p => [p, cmds]);
		});
		const pairs = Util_1.default.flatMap(await Promise.all(promises), x => x);
		pairs.sort(([a], [b]) => Util_1.default.prefixCompare(a, b));
		return this.parseMultiplePrefixes(message, pairs);
	}
	/**
	 * Runs parseWithPrefix on multiple prefixes and returns the best parse.
	 * @param {Message|AkairoMessage} message - Message to parse.
	 * @param {any[]} pairs - Pairs of prefix to associated commands.
	 * That is, `[string, Set<string> | null][]`.
	 * @returns {ParsedComponentData}
	 */
	parseMultiplePrefixes(message, pairs) {
		const parses = pairs.map(([prefix, cmds]) =>
			this.parseWithPrefix(message, prefix, cmds)
		);
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
	 * @param {Message|AkairoMessage} message - Message to parse.
	 * @param {string} prefix - Prefix to use.
	 * @param {Set<string>|null} [associatedCommands=null] - Associated commands.
	 * @returns {ParsedComponentData}
	 */
	parseWithPrefix(message, prefix, associatedCommands = null) {
		const lowerContent = message.content.toLowerCase();
		if (!lowerContent.startsWith(prefix.toLowerCase())) {
			return {};
		}
		const endOfPrefix =
			lowerContent.indexOf(prefix.toLowerCase()) + prefix.length;
		const startOfArgs =
			message.content.slice(endOfPrefix).search(/\S/) + prefix.length;
		const alias = message.content.slice(startOfArgs).split(/\s{1,}|\n{1,}/)[0];
		const command = this.findCommand(alias);
		const content = message.content
			.slice(startOfArgs + alias.length + 1)
			.trim();
		const afterPrefix = message.content.slice(prefix.length).trim();
		if (!command) {
			return { prefix, alias, content, afterPrefix };
		}
		if (associatedCommands == null) {
			if (command.prefix != null) {
				return { prefix, alias, content, afterPrefix };
			}
		} else if (!associatedCommands.has(command.id)) {
			return { prefix, alias, content, afterPrefix };
		}
		return { command, prefix, alias, content, afterPrefix };
	}
	/**
	 * Handles errors from the handling.
	 * @param {Error} err - The error.
	 * @param {Message|AkairoMessage} message - Message that called the command.
	 * @param {Command|AkairoModule} [command] - Command that errored.
	 * @returns {void}
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
	 * @param {number} lifetime - Messages older than this will have their command util instance sweeped.
	 * This is in milliseconds and defaults to the `commandUtilLifetime` option.
	 * @returns {number}
	 */
	sweepCommandUtil(lifetime = this.commandUtilLifetime) {
		let count = 0;
		for (const commandUtil of this.commandUtils.values()) {
			const now = Date.now();
			const message = commandUtil.message;
			if (
				now - (message.editedTimestamp || message.createdTimestamp) >
				lifetime
			) {
				count++;
				this.commandUtils.delete(message.id);
			}
		}
		return count;
	}
	/**
	 * Adds an ongoing prompt in order to prevent command usage in the channel.
	 * @param {Channel} channel - Channel to add to.
	 * @param {User} user - User to add.
	 * @returns {void}
	 */
	addPrompt(channel, user) {
		let users = this.prompts.get(channel.id);
		if (!users) this.prompts.set(channel.id, new Set());
		users = this.prompts.get(channel.id);
		users?.add(user.id);
	}
	/**
	 * Removes an ongoing prompt.
	 * @param {Channel} channel - Channel to remove from.
	 * @param {User} user - User to remove.
	 * @returns {void}
	 */
	removePrompt(channel, user) {
		const users = this.prompts.get(channel.id);
		if (!users) return;
		users.delete(user.id);
		if (!users.size) this.prompts.delete(user.id);
	}
	/**
	 * Checks if there is an ongoing prompt.
	 * @param {Channel} channel - Channel to check.
	 * @param {User} user - User to check.
	 * @returns {boolean}
	 */
	hasPrompt(channel, user) {
		const users = this.prompts.get(channel.id);
		if (!users) return false;
		return users.has(user.id);
	}
	/**
	 * Finds a command by alias.
	 * @param {string} name - Alias to find with.
	 * @returns {Command}
	 */
	findCommand(name) {
		return this.modules.get(this.aliases.get(name.toLowerCase()));
	}
	/**
	 * Set the inhibitor handler to use.
	 * @param {InhibitorHandler} inhibitorHandler - The inhibitor handler.
	 * @returns {CommandHandler}
	 */
	useInhibitorHandler(inhibitorHandler) {
		this.inhibitorHandler = inhibitorHandler;
		this.resolver.inhibitorHandler = inhibitorHandler;
		return this;
	}
	/**
	 * Set the listener handler to use.
	 * @param {ListenerHandler} listenerHandler - The listener handler.
	 * @returns {CommandHandler}
	 */
	useListenerHandler(listenerHandler) {
		this.resolver.listenerHandler = listenerHandler;
		return this;
	}
}
exports.default = CommandHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tbWFuZEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL0NvbW1hbmRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUVBQWlEO0FBQ2pELHFFQUF1RTtBQUN2RSxvREFBNEU7QUFDNUUsMkNBT29CO0FBQ3BCLHdEQUFpRDtBQUNqRCxnRUFBd0M7QUFDeEMsa0RBQTBCO0FBQzFCLDZFQUFxRDtBQUNyRCw0RUFBb0Q7QUFPcEQsMkRBQW1DO0FBRW5DOzs7O0dBSUc7QUFDSCxNQUFxQixjQUFlLFNBQVEsdUJBQWE7SUFDeEQscUNBQXFDO0lBQzlCLE9BQU8sQ0FBNkI7SUFFM0Msb0VBQW9FO0lBQzdELGdCQUFnQixDQUFVO0lBRWpDLHlEQUF5RDtJQUNsRCxZQUFZLENBQW1DO0lBRXRELGdDQUFnQztJQUN6QixnQkFBZ0IsQ0FBeUI7SUFFaEQsMERBQTBEO0lBQ25ELFNBQVMsQ0FBVTtJQUUxQiwrRUFBK0U7SUFDeEUseUJBQXlCLENBQVU7SUFFMUMsb0NBQW9DO0lBQzdCLFNBQVMsQ0FBVTtJQUUxQixvQ0FBb0M7SUFDN0IsV0FBVyxDQUFVO0lBVzVCLGlEQUFpRDtJQUMxQyxXQUFXLENBQVU7SUFFNUIsc0dBQXNHO0lBQy9GLG1CQUFtQixDQUFTO0lBRW5DLGtDQUFrQztJQUMzQixZQUFZLENBQWtDO0lBRXJELHlFQUF5RTtJQUNsRSx3QkFBd0IsQ0FBUztJQUV4Qzs7OztPQUlHO0lBQ0ksU0FBUyxDQUFxRDtJQUVyRSxxQ0FBcUM7SUFDOUIsZUFBZSxDQUFTO0lBSy9CLDBEQUEwRDtJQUNuRCxTQUFTLENBQVU7SUFFMUIsOEVBQThFO0lBQ3ZFLFlBQVksQ0FBVTtJQUU3Qix3Q0FBd0M7SUFDakMsV0FBVyxDQUFVO0lBRTVCLGdFQUFnRTtJQUN6RCxjQUFjLENBQWlEO0lBRXRFLGdGQUFnRjtJQUN6RSxpQkFBaUIsQ0FBaUQ7SUFFekUsZ0NBQWdDO0lB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QUk7WUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBUyxDQUFDLE9BQWdCLEVBQUUsSUFBVTtRQUNyQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUN6QixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsV0FBVyxDQUFDLElBQVk7UUFDdkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsbUJBQW1CLENBQUMsZ0JBQWtDO1FBQ3JELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBRWxELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxrQkFBa0IsQ0FBQyxlQUFnQztRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFFaEQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0NBaUREO0FBOStDRCxpQ0E4K0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQWthaXJvSGFuZGxlciwgeyBBa2Fpcm9IYW5kbGVyT3B0aW9ucyB9IGZyb20gXCIuLi9Ba2Fpcm9IYW5kbGVyXCI7XG5pbXBvcnQgeyBCdWlsdEluUmVhc29ucywgQ29tbWFuZEhhbmRsZXJFdmVudHMgfSBmcm9tIFwiLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCB7XG5cdENoYW5uZWwsXG5cdENvbGxlY3Rpb24sXG5cdENvbW1hbmRJbnRlcmFjdGlvbixcblx0TWVzc2FnZSxcblx0U25vd2ZsYWtlLFxuXHRVc2VyXG59IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgQ29tbWFuZCwgeyBLZXlTdXBwbGllciB9IGZyb20gXCIuL0NvbW1hbmRcIjtcbmltcG9ydCBDb21tYW5kVXRpbCBmcm9tIFwiLi9Db21tYW5kVXRpbFwiO1xuaW1wb3J0IEZsYWcgZnJvbSBcIi4vRmxhZ1wiO1xuaW1wb3J0IEFrYWlyb01lc3NhZ2UgZnJvbSBcIi4uLy4uL3V0aWwvQWthaXJvTWVzc2FnZVwiO1xuaW1wb3J0IFR5cGVSZXNvbHZlciBmcm9tIFwiLi9hcmd1bWVudHMvVHlwZVJlc29sdmVyXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBBa2Fpcm9Nb2R1bGUgZnJvbSBcIi4uL0FrYWlyb01vZHVsZVwiO1xuaW1wb3J0IEluaGliaXRvckhhbmRsZXIgZnJvbSBcIi4uL2luaGliaXRvcnMvSW5oaWJpdG9ySGFuZGxlclwiO1xuaW1wb3J0IExpc3RlbmVySGFuZGxlciBmcm9tIFwiLi4vbGlzdGVuZXJzL0xpc3RlbmVySGFuZGxlclwiO1xuaW1wb3J0IENhdGVnb3J5IGZyb20gXCIuLi8uLi91dGlsL0NhdGVnb3J5XCI7XG5pbXBvcnQgeyBEZWZhdWx0QXJndW1lbnRPcHRpb25zIH0gZnJvbSBcIi4vYXJndW1lbnRzL0FyZ3VtZW50XCI7XG5pbXBvcnQgVXRpbCBmcm9tIFwiLi4vLi4vdXRpbC9VdGlsXCI7XG5cbi8qKlxuICogTG9hZHMgY29tbWFuZHMgYW5kIGhhbmRsZXMgbWVzc2FnZXMuXG4gKiBAcGFyYW0gY2xpZW50IC0gVGhlIEFrYWlybyBjbGllbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRIYW5kbGVyIGV4dGVuZHMgQWthaXJvSGFuZGxlciB7XG5cdC8qKiBDb2xsZWN0aW9uIG9mIGNvbW1hbmQgYWxpYXNlcy4gKi9cblx0cHVibGljIGFsaWFzZXM6IENvbGxlY3Rpb248c3RyaW5nLCBzdHJpbmc+O1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb24gdG8gYXV0b21hdGljYWxseSBtYWtlIGNvbW1hbmQgYWxpYXNlcyBmb3IuICovXG5cdHB1YmxpYyBhbGlhc1JlcGxhY2VtZW50PzogUmVnRXhwO1xuXG5cdC8qKiBXaGV0aGVyIG9yIG5vdCBtZW50aW9ucyBhcmUgYWxsb3dlZCBmb3IgcHJlZml4aW5nLiAqL1xuXHRwdWJsaWMgYWxsb3dNZW50aW9uOiBib29sZWFuIHwgTWVudGlvblByZWZpeFByZWRpY2F0ZTtcblxuXHQvKiogRGVmYXVsdCBhcmd1bWVudCBvcHRpb25zLiAqL1xuXHRwdWJsaWMgYXJndW1lbnREZWZhdWx0czogRGVmYXVsdEFyZ3VtZW50T3B0aW9ucztcblxuXHQvKiogQXV0b21hdGljYWxseSBkZWZlciBtZXNzYWdlcyBcIkJvdE5hbWUgaXMgdGhpbmtpbmdcIi4gKi9cblx0cHVibGljIGF1dG9EZWZlcjogYm9vbGVhbjtcblxuXHQvKiogIFNwZWNpZnkgd2hldGhlciB0byByZWdpc3RlciBhbGwgc2xhc2ggY29tbWFuZHMgd2hlbiBzdGFydGluZyB0aGUgY2xpZW50ICovXG5cdHB1YmxpYyBhdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzOiBib29sZWFuO1xuXG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBib3RzLiAqL1xuXHRwdWJsaWMgYmxvY2tCb3RzOiBib29sZWFuO1xuXG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBzZWxmLiAqL1xuXHRwdWJsaWMgYmxvY2tDbGllbnQ6IGJvb2xlYW47XG5cblx0LyoqIENhdGVnb3JpZXMsIG1hcHBlZCBieSBJRCB0byBDYXRlZ29yeS4gKi9cblx0cHVibGljIGRlY2xhcmUgY2F0ZWdvcmllczogQ29sbGVjdGlvbjxzdHJpbmcsIENhdGVnb3J5PHN0cmluZywgQ29tbWFuZD4+O1xuXG5cdC8qKiBDbGFzcyB0byBoYW5kbGUgKi9cblx0cHVibGljIGRlY2xhcmUgY2xhc3NUb0hhbmRsZTogdHlwZW9mIENvbW1hbmQ7XG5cblx0LyoqIFRoZSBBa2Fpcm8gY2xpZW50LiAqL1xuXHRwdWJsaWMgZGVjbGFyZSBjbGllbnQ6IEFrYWlyb0NsaWVudDtcblxuXHQvKiogV2hldGhlciBvciBub3QgYG1lc3NhZ2UudXRpbGAgaXMgYXNzaWduZWQuICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbDogYm9vbGVhbjtcblxuXHQvKiogTWlsbGlzZWNvbmRzIGEgbWVzc2FnZSBzaG91bGQgZXhpc3QgZm9yIGJlZm9yZSBpdHMgY29tbWFuZCB1dGlsIGluc3RhbmNlIGlzIG1hcmtlZCBmb3IgcmVtb3ZhbC4gKi9cblx0cHVibGljIGNvbW1hbmRVdGlsTGlmZXRpbWU6IG51bWJlcjtcblxuXHQvKiogQ29sbGVjdGlvbiBvZiBDb21tYW5kVXRpbHMuICovXG5cdHB1YmxpYyBjb21tYW5kVXRpbHM6IENvbGxlY3Rpb248c3RyaW5nLCBDb21tYW5kVXRpbD47XG5cblx0LyoqIFRpbWUgaW50ZXJ2YWwgaW4gbWlsbGlzZWNvbmRzIGZvciBzd2VlcGluZyBjb21tYW5kIHV0aWwgaW5zdGFuY2VzLiAqL1xuXHRwdWJsaWMgY29tbWFuZFV0aWxTd2VlcEludGVydmFsOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbGxlY3Rpb24gb2YgY29vbGRvd25zLlxuXHQgKiA8aW5mbz5UaGUgZWxlbWVudHMgaW4gdGhlIGNvbGxlY3Rpb24gYXJlIG9iamVjdHMgd2l0aCB1c2VyIElEcyBhcyBrZXlzXG5cdCAqIGFuZCB7QGxpbmsgQ29vbGRvd25EYXRhfSBvYmplY3RzIGFzIHZhbHVlczwvaW5mbz5cblx0ICovXG5cdHB1YmxpYyBjb29sZG93bnM6IENvbGxlY3Rpb248c3RyaW5nLCB7IFtpZDogc3RyaW5nXTogQ29vbGRvd25EYXRhIH0+O1xuXG5cdC8qKiBEZWZhdWx0IGNvb2xkb3duIGZvciBjb21tYW5kcy4gKi9cblx0cHVibGljIGRlZmF1bHRDb29sZG93bjogbnVtYmVyO1xuXG5cdC8qKiBEaXJlY3RvcnkgdG8gY29tbWFuZHMuICovXG5cdHB1YmxpYyBkZWNsYXJlIGRpcmVjdG9yeTogc3RyaW5nO1xuXG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byB1c2UgZXhlY1NsYXNoIGZvciBzbGFzaCBjb21tYW5kcy4gKi9cblx0cHVibGljIGV4ZWNTbGFzaDogYm9vbGVhbjtcblxuXHQvKiogV2hldGhlciBvciBub3QgbWVtYmVycyBhcmUgZmV0Y2hlZCBvbiBlYWNoIG1lc3NhZ2UgYXV0aG9yIGZyb20gYSBndWlsZC4gKi9cblx0cHVibGljIGZldGNoTWVtYmVyczogYm9vbGVhbjtcblxuXHQvKiogV2hldGhlciBvciBub3QgZWRpdHMgYXJlIGhhbmRsZWQuICovXG5cdHB1YmxpYyBoYW5kbGVFZGl0czogYm9vbGVhbjtcblxuXHQvKiogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgY29vbGRvd24gb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuICovXG5cdHB1YmxpYyBpZ25vcmVDb29sZG93bjogU25vd2ZsYWtlIHwgU25vd2ZsYWtlW10gfCBJZ25vcmVDaGVja1ByZWRpY2F0ZTtcblxuXHQvKiogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgYHVzZXJQZXJtaXNzaW9uc2AgY2hlY2tzIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLiAqL1xuXHRwdWJsaWMgaWdub3JlUGVybWlzc2lvbnM6IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqIEluaGliaXRvciBoYW5kbGVyIHRvIHVzZS4gKi9cblx0cHVibGljIGluaGliaXRvckhhbmRsZXI/OiBJbmhpYml0b3JIYW5kbGVyO1xuXG5cdC8qKiBDb21tYW5kcyBsb2FkZWQsIG1hcHBlZCBieSBJRCB0byBDb21tYW5kLiAqL1xuXHRwdWJsaWMgZGVjbGFyZSBtb2R1bGVzOiBDb2xsZWN0aW9uPHN0cmluZywgQ29tbWFuZD47XG5cblx0LyoqIFRoZSBwcmVmaXgoZXMpIGZvciBjb21tYW5kIHBhcnNpbmcuICovXG5cdHB1YmxpYyBwcmVmaXg6IHN0cmluZyB8IHN0cmluZ1tdIHwgUHJlZml4U3VwcGxpZXI7XG5cblx0LyoqIENvbGxlY3Rpb24gb2YgcHJlZml4IG92ZXJ3cml0ZXMgdG8gY29tbWFuZHMuICovXG5cdHB1YmxpYyBwcmVmaXhlczogQ29sbGVjdGlvbjxzdHJpbmcgfCBQcmVmaXhTdXBwbGllciwgU2V0PHN0cmluZz4+O1xuXG5cdC8qKiBDb2xsZWN0aW9uIG9mIHNldHMgb2Ygb25nb2luZyBhcmd1bWVudCBwcm9tcHRzLiAqL1xuXHRwdWJsaWMgcHJvbXB0czogQ29sbGVjdGlvbjxzdHJpbmcsIFNldDxzdHJpbmc+PjtcblxuXHQvKiogVGhlIHR5cGUgcmVzb2x2ZXIuICovXG5cdHB1YmxpYyByZXNvbHZlcjogVHlwZVJlc29sdmVyO1xuXG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byBzdG9yZSBtZXNzYWdlcyBpbiBDb21tYW5kVXRpbC4gKi9cblx0cHVibGljIHN0b3JlTWVzc2FnZXM6IGJvb2xlYW47XG5cblx0LyoqIFNob3cgXCJCb3ROYW1lIGlzIHR5cGluZ1wiIGluZm9ybWF0aW9uIG1lc3NhZ2Ugb24gdGhlIHRleHQgY2hhbm5lbHMgd2hlbiBhIGNvbW1hbmQgaXMgcnVubmluZy4gKi9cblx0cHVibGljIHR5cGluZzogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRjbGllbnQ6IEFrYWlyb0NsaWVudCxcblx0XHR7XG5cdFx0XHRkaXJlY3RvcnksXG5cdFx0XHRjbGFzc1RvSGFuZGxlID0gQ29tbWFuZCxcblx0XHRcdGV4dGVuc2lvbnMgPSBbXCIuanNcIiwgXCIudHNcIl0sXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyLFxuXHRcdFx0YmxvY2tDbGllbnQgPSB0cnVlLFxuXHRcdFx0YmxvY2tCb3RzID0gdHJ1ZSxcblx0XHRcdGZldGNoTWVtYmVycyA9IGZhbHNlLFxuXHRcdFx0aGFuZGxlRWRpdHMgPSBmYWxzZSxcblx0XHRcdHN0b3JlTWVzc2FnZXMgPSBmYWxzZSxcblx0XHRcdGNvbW1hbmRVdGlsLFxuXHRcdFx0Y29tbWFuZFV0aWxMaWZldGltZSA9IDNlNSxcblx0XHRcdGNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA9IDNlNSxcblx0XHRcdGRlZmF1bHRDb29sZG93biA9IDAsXG5cdFx0XHRpZ25vcmVDb29sZG93biA9IGNsaWVudC5vd25lcklELFxuXHRcdFx0aWdub3JlUGVybWlzc2lvbnMgPSBbXSxcblx0XHRcdGFyZ3VtZW50RGVmYXVsdHMgPSB7fSxcblx0XHRcdHByZWZpeCA9IFwiIVwiLFxuXHRcdFx0YWxsb3dNZW50aW9uID0gdHJ1ZSxcblx0XHRcdGFsaWFzUmVwbGFjZW1lbnQsXG5cdFx0XHRhdXRvRGVmZXIgPSBmYWxzZSxcblx0XHRcdHR5cGluZyA9IGZhbHNlLFxuXHRcdFx0YXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcyA9IGZhbHNlLFxuXHRcdFx0ZXhlY1NsYXNoID0gZmFsc2Vcblx0XHR9OiBDb21tYW5kSGFuZGxlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHRpZiAoXG5cdFx0XHQhKGNsYXNzVG9IYW5kbGUucHJvdG90eXBlIGluc3RhbmNlb2YgQ29tbWFuZCB8fCBjbGFzc1RvSGFuZGxlID09PSBDb21tYW5kKVxuXHRcdCkge1xuXHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFxuXHRcdFx0XHRcIklOVkFMSURfQ0xBU1NfVE9fSEFORExFXCIsXG5cdFx0XHRcdGNsYXNzVG9IYW5kbGUubmFtZSxcblx0XHRcdFx0Q29tbWFuZC5uYW1lXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHN1cGVyKGNsaWVudCwge1xuXHRcdFx0ZGlyZWN0b3J5LFxuXHRcdFx0Y2xhc3NUb0hhbmRsZSxcblx0XHRcdGV4dGVuc2lvbnMsXG5cdFx0XHRhdXRvbWF0ZUNhdGVnb3JpZXMsXG5cdFx0XHRsb2FkRmlsdGVyXG5cdFx0fSk7XG5cdFx0LyoqXG5cdFx0ICogU3BlY2lmeSB3aGV0aGVyIHRvIHJlZ2lzdGVyIGFsbCBzbGFzaCBjb21tYW5kcyB3aGVuIHN0YXJ0aW5nIHRoZSBjbGllbnQuXG5cdFx0ICogRGVmYXVsdHMgdG8gZmFsc2UuXG5cdFx0ICovXG5cdFx0dGhpcy5hdXRvUmVnaXN0ZXJTbGFzaENvbW1hbmRzID0gYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcztcblxuXHRcdC8qKlxuXHRcdCAqIFNob3cgXCJCb3ROYW1lIGlzIHR5cGluZ1wiIGluZm9ybWF0aW9uIG1lc3NhZ2Ugb24gdGhlIHRleHQgY2hhbm5lbHMgd2hlbiBhIGNvbW1hbmQgaXMgcnVubmluZy5cblx0XHQgKiBEZWZhdWx0cyB0byBmYWxzZS5cblx0XHQgKi9cblx0XHR0aGlzLnR5cGluZyA9IHR5cGluZztcblxuXHRcdC8qKlxuXHRcdCAqIEF1dG9tYXRpY2FsbHkgZGVmZXIgbWVzc2FnZXMgXCJCb3ROYW1lIGlzIHRoaW5raW5nXCJcblx0XHQgKiBEZWZhdWx0cyB0byB0cnVlLlxuXHRcdCAqL1xuXHRcdHRoaXMuYXV0b0RlZmVyID0gYXV0b0RlZmVyO1xuXHRcdC8qKlxuXHRcdCAqIFRoZSB0eXBlIHJlc29sdmVyLlxuXHRcdCAqIEB0eXBlIHtUeXBlUmVzb2x2ZXJ9XG5cdFx0ICovXG5cdFx0dGhpcy5yZXNvbHZlciA9IG5ldyBUeXBlUmVzb2x2ZXIodGhpcyk7XG5cblx0XHQvKipcblx0XHQgKiBDb2xsZWN0aW9uIG9mIGNvbW1hbmQgYWxpYXNlcy5cblx0XHQgKiBAdHlwZSB7Q29sbGVjdGlvbjxzdHJpbmcsIHN0cmluZz59XG5cdFx0ICovXG5cdFx0dGhpcy5hbGlhc2VzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBhdXRvbWF0aWNhbGx5IG1ha2UgY29tbWFuZCBhbGlhc2VzIGZvci5cblx0XHQgKiBAdHlwZSB7P1JlZ0V4cH1cblx0XHQgKi9cblx0XHR0aGlzLmFsaWFzUmVwbGFjZW1lbnQgPSBhbGlhc1JlcGxhY2VtZW50O1xuXG5cdFx0LyoqXG5cdFx0ICogQ29sbGVjdGlvbiBvZiBwcmVmaXggb3ZlcndyaXRlcyB0byBjb21tYW5kcy5cblx0XHQgKiBAdHlwZSB7Q29sbGVjdGlvbjxzdHJpbmd8UHJlZml4U3VwcGxpZXIsIFNldDxzdHJpbmc+Pn1cblx0XHQgKi9cblx0XHR0aGlzLnByZWZpeGVzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdC8qKlxuXHRcdCAqIFdoZXRoZXIgb3Igbm90IHRvIGJsb2NrIHNlbGYuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5ibG9ja0NsaWVudCA9IEJvb2xlYW4oYmxvY2tDbGllbnQpO1xuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBvciBub3QgdG8gYmxvY2sgYm90cy5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLmJsb2NrQm90cyA9IEJvb2xlYW4oYmxvY2tCb3RzKTtcblxuXHRcdC8qKlxuXHRcdCAqIFdoZXRoZXIgb3Igbm90IG1lbWJlcnMgYXJlIGZldGNoZWQgb24gZWFjaCBtZXNzYWdlIGF1dGhvciBmcm9tIGEgZ3VpbGQuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5mZXRjaE1lbWJlcnMgPSBCb29sZWFuKGZldGNoTWVtYmVycyk7XG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIG9yIG5vdCBlZGl0cyBhcmUgaGFuZGxlZC5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLmhhbmRsZUVkaXRzID0gQm9vbGVhbihoYW5kbGVFZGl0cyk7XG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIG9yIG5vdCB0byBzdG9yZSBtZXNzYWdlcyBpbiBDb21tYW5kVXRpbC5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLnN0b3JlTWVzc2FnZXMgPSBCb29sZWFuKHN0b3JlTWVzc2FnZXMpO1xuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBvciBub3QgYG1lc3NhZ2UudXRpbGAgaXMgYXNzaWduZWQuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5jb21tYW5kVXRpbCA9IEJvb2xlYW4oY29tbWFuZFV0aWwpO1xuXHRcdGlmICgodGhpcy5oYW5kbGVFZGl0cyB8fCB0aGlzLnN0b3JlTWVzc2FnZXMpICYmICF0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJDT01NQU5EX1VUSUxfRVhQTElDSVRcIik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogTWlsbGlzZWNvbmRzIGEgbWVzc2FnZSBzaG91bGQgZXhpc3QgZm9yIGJlZm9yZSBpdHMgY29tbWFuZCB1dGlsIGluc3RhbmNlIGlzIG1hcmtlZCBmb3IgcmVtb3ZhbC5cblx0XHQgKiBAdHlwZSB7bnVtYmVyfVxuXHRcdCAqL1xuXHRcdHRoaXMuY29tbWFuZFV0aWxMaWZldGltZSA9IGNvbW1hbmRVdGlsTGlmZXRpbWU7XG5cblx0XHQvKipcblx0XHQgKiBUaW1lIGludGVydmFsIGluIG1pbGxpc2Vjb25kcyBmb3Igc3dlZXBpbmcgY29tbWFuZCB1dGlsIGluc3RhbmNlcy5cblx0XHQgKiBAdHlwZSB7bnVtYmVyfVxuXHRcdCAqL1xuXHRcdHRoaXMuY29tbWFuZFV0aWxTd2VlcEludGVydmFsID0gY29tbWFuZFV0aWxTd2VlcEludGVydmFsO1xuXHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsU3dlZXBJbnRlcnZhbCA+IDApIHtcblx0XHRcdHNldEludGVydmFsKFxuXHRcdFx0XHQoKSA9PiB0aGlzLnN3ZWVwQ29tbWFuZFV0aWwoKSxcblx0XHRcdFx0dGhpcy5jb21tYW5kVXRpbFN3ZWVwSW50ZXJ2YWxcblx0XHRcdCkudW5yZWYoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDb2xsZWN0aW9uIG9mIENvbW1hbmRVdGlscy5cblx0XHQgKiBAdHlwZSB7Q29sbGVjdGlvbjxzdHJpbmcsIENvbW1hbmRVdGlsPn1cblx0XHQgKi9cblx0XHR0aGlzLmNvbW1hbmRVdGlscyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHQvKipcblx0XHQgKiBDb2xsZWN0aW9uIG9mIGNvb2xkb3ducy5cblx0XHQgKiA8aW5mbz5UaGUgZWxlbWVudHMgaW4gdGhlIGNvbGxlY3Rpb24gYXJlIG9iamVjdHMgd2l0aCB1c2VyIElEcyBhcyBrZXlzXG5cdFx0ICogYW5kIHtAbGluayBDb29sZG93bkRhdGF9IG9iamVjdHMgYXMgdmFsdWVzPC9pbmZvPlxuXHRcdCAqIEB0eXBlIHtDb2xsZWN0aW9uPHN0cmluZywgT2JqZWN0Pn1cblx0XHQgKi9cblx0XHR0aGlzLmNvb2xkb3ducyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cblx0XHQvKipcblx0XHQgKiBEZWZhdWx0IGNvb2xkb3duIGZvciBjb21tYW5kcy5cblx0XHQgKiBAdHlwZSB7bnVtYmVyfVxuXHRcdCAqL1xuXHRcdHRoaXMuZGVmYXVsdENvb2xkb3duID0gZGVmYXVsdENvb2xkb3duO1xuXG5cdFx0LyoqXG5cdFx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgY29vbGRvd24gb3IgYSBmdW5jdGlvbiB0byBpZ25vcmUuXG5cdFx0ICogQHR5cGUge1Nub3dmbGFrZXxTbm93Zmxha2VbXXxJZ25vcmVDaGVja1ByZWRpY2F0ZX1cblx0XHQgKi9cblx0XHR0aGlzLmlnbm9yZUNvb2xkb3duID1cblx0XHRcdHR5cGVvZiBpZ25vcmVDb29sZG93biA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHRcdD8gaWdub3JlQ29vbGRvd24uYmluZCh0aGlzKVxuXHRcdFx0XHQ6IGlnbm9yZUNvb2xkb3duO1xuXG5cdFx0LyoqXG5cdFx0ICogSUQgb2YgdXNlcihzKSB0byBpZ25vcmUgYHVzZXJQZXJtaXNzaW9uc2AgY2hlY2tzIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLlxuXHRcdCAqIEB0eXBlIHtTbm93Zmxha2V8U25vd2ZsYWtlW118SWdub3JlQ2hlY2tQcmVkaWNhdGV9XG5cdFx0ICovXG5cdFx0dGhpcy5pZ25vcmVQZXJtaXNzaW9ucyA9XG5cdFx0XHR0eXBlb2YgaWdub3JlUGVybWlzc2lvbnMgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0XHQ/IGlnbm9yZVBlcm1pc3Npb25zLmJpbmQodGhpcylcblx0XHRcdFx0OiBpZ25vcmVQZXJtaXNzaW9ucztcblxuXHRcdC8qKlxuXHRcdCAqIENvbGxlY3Rpb24gb2Ygc2V0cyBvZiBvbmdvaW5nIGFyZ3VtZW50IHByb21wdHMuXG5cdFx0ICogQHR5cGUge0NvbGxlY3Rpb248c3RyaW5nLCBTZXQ8c3RyaW5nPj59XG5cdFx0ICovXG5cdFx0dGhpcy5wcm9tcHRzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuXHRcdC8qKlxuXHRcdCAqIERlZmF1bHQgYXJndW1lbnQgb3B0aW9ucy5cblx0XHQgKiBAdHlwZSB7RGVmYXVsdEFyZ3VtZW50T3B0aW9uc31cblx0XHQgKi9cblx0XHR0aGlzLmFyZ3VtZW50RGVmYXVsdHMgPSBVdGlsLmRlZXBBc3NpZ24oXG5cdFx0XHR7XG5cdFx0XHRcdHByb21wdDoge1xuXHRcdFx0XHRcdHN0YXJ0OiBcIlwiLFxuXHRcdFx0XHRcdHJldHJ5OiBcIlwiLFxuXHRcdFx0XHRcdHRpbWVvdXQ6IFwiXCIsXG5cdFx0XHRcdFx0ZW5kZWQ6IFwiXCIsXG5cdFx0XHRcdFx0Y2FuY2VsOiBcIlwiLFxuXHRcdFx0XHRcdHJldHJpZXM6IDEsXG5cdFx0XHRcdFx0dGltZTogMzAwMDAsXG5cdFx0XHRcdFx0Y2FuY2VsV29yZDogXCJjYW5jZWxcIixcblx0XHRcdFx0XHRzdG9wV29yZDogXCJzdG9wXCIsXG5cdFx0XHRcdFx0b3B0aW9uYWw6IGZhbHNlLFxuXHRcdFx0XHRcdGluZmluaXRlOiBmYWxzZSxcblx0XHRcdFx0XHRsaW1pdDogSW5maW5pdHksXG5cdFx0XHRcdFx0YnJlYWtvdXQ6IHRydWVcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGFyZ3VtZW50RGVmYXVsdHNcblx0XHQpO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIHByZWZpeChlcykgZm9yIGNvbW1hbmQgcGFyc2luZy5cblx0XHQgKiBAdHlwZSB7c3RyaW5nfHN0cmluZ1tdfFByZWZpeFN1cHBsaWVyfVxuXHRcdCAqL1xuXG5cdFx0dGhpcy5wcmVmaXggPSB0eXBlb2YgcHJlZml4ID09PSBcImZ1bmN0aW9uXCIgPyBwcmVmaXguYmluZCh0aGlzKSA6IHByZWZpeDtcblxuXHRcdC8qKlxuXHRcdCAqIFdoZXRoZXIgb3Igbm90IG1lbnRpb25zIGFyZSBhbGxvd2VkIGZvciBwcmVmaXhpbmcuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW58TWVudGlvblByZWZpeFByZWRpY2F0ZX1cblx0XHQgKi9cblx0XHR0aGlzLmFsbG93TWVudGlvbiA9XG5cdFx0XHR0eXBlb2YgYWxsb3dNZW50aW9uID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdFx0PyBhbGxvd01lbnRpb24uYmluZCh0aGlzKVxuXHRcdFx0XHQ6IEJvb2xlYW4oYWxsb3dNZW50aW9uKTtcblxuXHRcdC8qKlxuXHRcdCAqIEluaGliaXRvciBoYW5kbGVyIHRvIHVzZS5cblx0XHQgKiBAdHlwZSB7P0luaGliaXRvckhhbmRsZXJ9XG5cdFx0ICovXG5cdFx0dGhpcy5pbmhpYml0b3JIYW5kbGVyID0gbnVsbDtcblxuXHRcdHRoaXMuYXV0b0RlZmVyID0gQm9vbGVhbihhdXRvRGVmZXIpO1xuXG5cdFx0dGhpcy5leGVjU2xhc2ggPSBCb29sZWFuKGV4ZWNTbGFzaCk7XG5cblx0XHQvKipcblx0XHQgKiBEaXJlY3RvcnkgdG8gY29tbWFuZHMuXG5cdFx0ICogQG5hbWUgQ29tbWFuZEhhbmRsZXIjZGlyZWN0b3J5XG5cdFx0ICogQHR5cGUge3N0cmluZ31cblx0XHQgKi9cblxuXHRcdC8qKlxuXHRcdCAqIENvbW1hbmRzIGxvYWRlZCwgbWFwcGVkIGJ5IElEIHRvIENvbW1hbmQuXG5cdFx0ICogQG5hbWUgQ29tbWFuZEhhbmRsZXIjbW9kdWxlc1xuXHRcdCAqIEB0eXBlIHtDb2xsZWN0aW9uPHN0cmluZywgQ29tbWFuZD59XG5cdFx0ICovXG5cblx0XHR0aGlzLnNldHVwKCk7XG5cdH1cblxuXHRzZXR1cCgpIHtcblx0XHR0aGlzLmNsaWVudC5vbmNlKFwicmVhZHlcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuYXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcykgdGhpcy5yZWdpc3RlclNsYXNoQ29tbWFuZHMoKTtcblxuXHRcdFx0dGhpcy5jbGllbnQub24oXCJtZXNzYWdlQ3JlYXRlXCIsIGFzeW5jIG0gPT4ge1xuXHRcdFx0XHRpZiAobS5wYXJ0aWFsKSBhd2FpdCBtLmZldGNoKCk7XG5cblx0XHRcdFx0dGhpcy5oYW5kbGUobSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKHRoaXMuaGFuZGxlRWRpdHMpIHtcblx0XHRcdFx0dGhpcy5jbGllbnQub24oXCJtZXNzYWdlVXBkYXRlXCIsIGFzeW5jIChvLCBtKSA9PiB7XG5cdFx0XHRcdFx0aWYgKG8ucGFydGlhbCkgYXdhaXQgby5mZXRjaCgpO1xuXHRcdFx0XHRcdGlmIChtLnBhcnRpYWwpIGF3YWl0IG0uZmV0Y2goKTtcblx0XHRcdFx0XHRpZiAoby5jb250ZW50ID09PSBtLmNvbnRlbnQpIHJldHVybjtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmhhbmRsZUVkaXRzKSB0aGlzLmhhbmRsZShtIGFzIE1lc3NhZ2UpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHRoaXMuY2xpZW50Lm9uKFwiaW50ZXJhY3Rpb25DcmVhdGVcIiwgaSA9PiB7XG5cdFx0XHRcdGlmICghaS5pc0NvbW1hbmQoKSkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLmhhbmRsZVNsYXNoKGkpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZWdpc3RlclNsYXNoQ29tbWFuZHMoKSB7XG5cdFx0Y29uc3Qgc2xhc2hDb21tYW5kc1BhcnNlZCA9IFtdO1xuXHRcdGZvciAoY29uc3QgWywgZGF0YV0gb2YgdGhpcy5tb2R1bGVzKSB7XG5cdFx0XHRpZiAoZGF0YS5zbGFzaCkge1xuXHRcdFx0XHRjb25zdCBwYXJzZURlc2NyaXB0aW9uQ29tbWFuZCA9IGRlc2NyaXB0aW9uID0+IHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIGRlc2NyaXB0aW9uID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGRlc2NyaXB0aW9uLmNvbnRlbnQgPT09IFwiZnVuY3Rpb25cIilcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGRlc2NyaXB0aW9uLmNvbnRlbnQoKTtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgZGVzY3JpcHRpb24uY29udGVudCA9PT0gXCJzdHJpbmdcIilcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGRlc2NyaXB0aW9uLmNvbnRlbnQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGRlc2NyaXB0aW9uO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHNsYXNoQ29tbWFuZHNQYXJzZWQucHVzaCh7XG5cdFx0XHRcdFx0bmFtZTogZGF0YS5hbGlhc2VzWzBdLFxuXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246IHBhcnNlRGVzY3JpcHRpb25Db21tYW5kKGRhdGEuZGVzY3JpcHRpb24pLFxuXG5cdFx0XHRcdFx0b3B0aW9uczogZGF0YS5zbGFzaE9wdGlvbnMsXG5cblx0XHRcdFx0XHRndWlsZHM6IGRhdGEuc2xhc2hHdWlsZHNcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCB7IG5hbWUsIGRlc2NyaXB0aW9uLCBvcHRpb25zLCBndWlsZHMgfSBvZiBzbGFzaENvbW1hbmRzUGFyc2VkKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGd1aWxkSWQgb2YgZ3VpbGRzKSB7XG5cdFx0XHRcdGNvbnN0IGd1aWxkID0gdGhpcy5jbGllbnQuZ3VpbGRzLmNhY2hlLmdldChndWlsZElkKTtcblx0XHRcdFx0aWYgKCFndWlsZCkgY29udGludWU7XG5cblx0XHRcdFx0Z3VpbGQuY29tbWFuZHMuY3JlYXRlKHtcblx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uLFxuXHRcdFx0XHRcdG9wdGlvbnNcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2xhc2hDb21tYW5kc0FwcCA9IHNsYXNoQ29tbWFuZHNQYXJzZWRcblx0XHRcdC5maWx0ZXIoKHsgZ3VpbGRzIH0pID0+ICFndWlsZHMubGVuZ3RoKVxuXHRcdFx0Lm1hcCgoeyBuYW1lLCBkZXNjcmlwdGlvbiwgb3B0aW9ucyB9KSA9PiB7XG5cdFx0XHRcdHJldHVybiB7IG5hbWUsIGRlc2NyaXB0aW9uLCBvcHRpb25zIH07XG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuY2xpZW50LmFwcGxpY2F0aW9uPy5jb21tYW5kcy5zZXQoc2xhc2hDb21tYW5kc0FwcCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgbW9kdWxlLlxuXHQgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBNb2R1bGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW2ZpbGVwYXRoXSAtIEZpbGVwYXRoIG9mIG1vZHVsZS5cblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqL1xuXHRvdmVycmlkZSByZWdpc3Rlcihjb21tYW5kOiBDb21tYW5kLCBmaWxlcGF0aDogc3RyaW5nKTogdm9pZCB7XG5cdFx0c3VwZXIucmVnaXN0ZXIoY29tbWFuZCwgZmlsZXBhdGgpO1xuXG5cdFx0Zm9yIChsZXQgYWxpYXMgb2YgY29tbWFuZC5hbGlhc2VzKSB7XG5cdFx0XHRjb25zdCBjb25mbGljdCA9IHRoaXMuYWxpYXNlcy5nZXQoYWxpYXMudG9Mb3dlckNhc2UoKSk7XG5cdFx0XHRpZiAoY29uZmxpY3QpXG5cdFx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIkFMSUFTX0NPTkZMSUNUXCIsIGFsaWFzLCBjb21tYW5kLmlkLCBjb25mbGljdCk7XG5cblx0XHRcdGFsaWFzID0gYWxpYXMudG9Mb3dlckNhc2UoKTtcblx0XHRcdHRoaXMuYWxpYXNlcy5zZXQoYWxpYXMsIGNvbW1hbmQuaWQpO1xuXHRcdFx0aWYgKHRoaXMuYWxpYXNSZXBsYWNlbWVudCkge1xuXHRcdFx0XHRjb25zdCByZXBsYWNlbWVudCA9IGFsaWFzLnJlcGxhY2UodGhpcy5hbGlhc1JlcGxhY2VtZW50LCBcIlwiKTtcblxuXHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgIT09IGFsaWFzKSB7XG5cdFx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnRDb25mbGljdCA9IHRoaXMuYWxpYXNlcy5nZXQocmVwbGFjZW1lbnQpO1xuXHRcdFx0XHRcdGlmIChyZXBsYWNlbWVudENvbmZsaWN0KVxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEFrYWlyb0Vycm9yKFxuXHRcdFx0XHRcdFx0XHRcIkFMSUFTX0NPTkZMSUNUXCIsXG5cdFx0XHRcdFx0XHRcdHJlcGxhY2VtZW50LFxuXHRcdFx0XHRcdFx0XHRjb21tYW5kLmlkLFxuXHRcdFx0XHRcdFx0XHRyZXBsYWNlbWVudENvbmZsaWN0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHRoaXMuYWxpYXNlcy5zZXQocmVwbGFjZW1lbnQsIGNvbW1hbmQuaWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNvbW1hbmQucHJlZml4ICE9IG51bGwpIHtcblx0XHRcdGxldCBuZXdFbnRyeSA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShjb21tYW5kLnByZWZpeCkpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBwcmVmaXggb2YgY29tbWFuZC5wcmVmaXgpIHtcblx0XHRcdFx0XHRjb25zdCBwcmVmaXhlcyA9IHRoaXMucHJlZml4ZXMuZ2V0KHByZWZpeCk7XG5cdFx0XHRcdFx0aWYgKHByZWZpeGVzKSB7XG5cdFx0XHRcdFx0XHRwcmVmaXhlcy5hZGQoY29tbWFuZC5pZCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuc2V0KHByZWZpeCwgbmV3IFNldChbY29tbWFuZC5pZF0pKTtcblx0XHRcdFx0XHRcdG5ld0VudHJ5ID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5nZXQoY29tbWFuZC5wcmVmaXgpO1xuXHRcdFx0XHRpZiAocHJlZml4ZXMpIHtcblx0XHRcdFx0XHRwcmVmaXhlcy5hZGQoY29tbWFuZC5pZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5zZXQoY29tbWFuZC5wcmVmaXgsIG5ldyBTZXQoW2NvbW1hbmQuaWRdKSk7XG5cdFx0XHRcdFx0bmV3RW50cnkgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChuZXdFbnRyeSkge1xuXHRcdFx0XHR0aGlzLnByZWZpeGVzID0gdGhpcy5wcmVmaXhlcy5zb3J0KChhVmFsLCBiVmFsLCBhS2V5LCBiS2V5KSA9PlxuXHRcdFx0XHRcdFV0aWwucHJlZml4Q29tcGFyZShhS2V5LCBiS2V5KVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXJlZ2lzdGVycyBhIG1vZHVsZS5cblx0ICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gTW9kdWxlIHRvIHVzZS5cblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqL1xuXHRvdmVycmlkZSBkZXJlZ2lzdGVyKGNvbW1hbmQ6IENvbW1hbmQpOiB2b2lkIHtcblx0XHRmb3IgKGxldCBhbGlhcyBvZiBjb21tYW5kLmFsaWFzZXMpIHtcblx0XHRcdGFsaWFzID0gYWxpYXMudG9Mb3dlckNhc2UoKTtcblx0XHRcdHRoaXMuYWxpYXNlcy5kZWxldGUoYWxpYXMpO1xuXG5cdFx0XHRpZiAodGhpcy5hbGlhc1JlcGxhY2VtZW50KSB7XG5cdFx0XHRcdGNvbnN0IHJlcGxhY2VtZW50ID0gYWxpYXMucmVwbGFjZSh0aGlzLmFsaWFzUmVwbGFjZW1lbnQsIFwiXCIpO1xuXHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgIT09IGFsaWFzKSB0aGlzLmFsaWFzZXMuZGVsZXRlKHJlcGxhY2VtZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY29tbWFuZC5wcmVmaXggIT0gbnVsbCkge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoY29tbWFuZC5wcmVmaXgpKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgcHJlZml4IG9mIGNvbW1hbmQucHJlZml4KSB7XG5cdFx0XHRcdFx0Y29uc3QgcHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLmdldChwcmVmaXgpO1xuXHRcdFx0XHRcdGlmIChwcmVmaXhlcz8uc2l6ZSA9PT0gMSkge1xuXHRcdFx0XHRcdFx0dGhpcy5wcmVmaXhlcy5kZWxldGUocHJlZml4KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cHJlZml4ZXM/LmRlbGV0ZShwcmVmaXgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgcHJlZml4ZXMgPSB0aGlzLnByZWZpeGVzLmdldChjb21tYW5kLnByZWZpeCk7XG5cdFx0XHRcdGlmIChwcmVmaXhlcz8uc2l6ZSA9PT0gMSkge1xuXHRcdFx0XHRcdHRoaXMucHJlZml4ZXMuZGVsZXRlKGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0cHJlZml4ZXMuZGVsZXRlKGNvbW1hbmQucHJlZml4KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHN1cGVyLmRlcmVnaXN0ZXIoY29tbWFuZCk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBhIG1lc3NhZ2UuXG5cdCAqIEBwYXJhbSB7TWVzc2FnZX0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTw/Ym9vbGVhbj59XG5cdCAqL1xuXHRhc3luYyBoYW5kbGUobWVzc2FnZTogTWVzc2FnZSk6IFByb21pc2U8Ym9vbGVhbiB8IG51bGw+IHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR0aGlzLmZldGNoTWVtYmVycyAmJlxuXHRcdFx0XHRtZXNzYWdlLmd1aWxkICYmXG5cdFx0XHRcdCFtZXNzYWdlLm1lbWJlciAmJlxuXHRcdFx0XHQhbWVzc2FnZS53ZWJob29rSWRcblx0XHRcdCkge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuZmV0Y2gobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5BbGxUeXBlSW5oaWJpdG9ycyhtZXNzYWdlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlscy5oYXMobWVzc2FnZS5pZCkpIHtcblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gdGhpcy5jb21tYW5kVXRpbHMuZ2V0KG1lc3NhZ2UuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSBuZXcgQ29tbWFuZFV0aWwodGhpcywgbWVzc2FnZSk7XG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdHRoaXMuY29tbWFuZFV0aWxzLnNldChtZXNzYWdlLmlkLCBtZXNzYWdlLnV0aWwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blByZVR5cGVJbmhpYml0b3JzKG1lc3NhZ2UpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kKG1lc3NhZ2UpO1xuXHRcdFx0aWYgKCFwYXJzZWQuY29tbWFuZCkge1xuXHRcdFx0XHRjb25zdCBvdmVyUGFyc2VkID0gYXdhaXQgdGhpcy5wYXJzZUNvbW1hbmRPdmVyd3JpdHRlblByZWZpeGVzKG1lc3NhZ2UpO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0b3ZlclBhcnNlZC5jb21tYW5kIHx8XG5cdFx0XHRcdFx0KHBhcnNlZC5wcmVmaXggPT0gbnVsbCAmJiBvdmVyUGFyc2VkLnByZWZpeCAhPSBudWxsKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRwYXJzZWQgPSBvdmVyUGFyc2VkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0bWVzc2FnZS51dGlsLnBhcnNlZCA9IHBhcnNlZDtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHJhbjtcblx0XHRcdGlmICghcGFyc2VkLmNvbW1hbmQpIHtcblx0XHRcdFx0cmFuID0gYXdhaXQgdGhpcy5oYW5kbGVSZWdleEFuZENvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyYW4gPSBhd2FpdCB0aGlzLmhhbmRsZURpcmVjdENvbW1hbmQoXG5cdFx0XHRcdFx0bWVzc2FnZSxcblxuXHRcdFx0XHRcdHBhcnNlZC5jb250ZW50LFxuXHRcdFx0XHRcdHBhcnNlZC5jb21tYW5kXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChyYW4gPT09IGZhbHNlKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5NRVNTQUdFX0lOVkFMSUQsIG1lc3NhZ2UpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByYW47XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKiBAcGFyYW0ge0NvbW1hbmRJbnRlcmFjdGlvbn0gaW50ZXJhY3Rpb24gLSBJbnRlcmFjdGlvbiB0byBoYW5kbGUuXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPD9ib29sZWFuPn1cblx0ICovXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG5cdGFzeW5jIGhhbmRsZVNsYXNoKGludGVyYWN0aW9uOiBDb21tYW5kSW50ZXJhY3Rpb24pOiBQcm9taXNlPGJvb2xlYW4gfCBudWxsPiB7XG5cdFx0Y29uc3QgY29tbWFuZCA9IHRoaXMuZmluZENvbW1hbmQoaW50ZXJhY3Rpb24uY29tbWFuZE5hbWUpO1xuXG5cdFx0aWYgKCFjb21tYW5kKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTk9UX0ZPVU5ELCBpbnRlcmFjdGlvbik7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbWVzc2FnZSA9IG5ldyBBa2Fpcm9NZXNzYWdlKHRoaXMuY2xpZW50LCBpbnRlcmFjdGlvbiwge1xuXHRcdFx0c2xhc2g6IHRydWUsXG5cdFx0XHRyZXBsaWVkOiB0aGlzLmF1dG9EZWZlciB8fCBjb21tYW5kLnNsYXNoRXBoZW1lcmFsLFxuXHRcdFx0Y29tbWFuZFxuXHRcdH0pO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLmZldGNoTWVtYmVycyAmJiBtZXNzYWdlLmd1aWxkICYmICFtZXNzYWdlLm1lbWJlcikge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlLmd1aWxkLm1lbWJlcnMuZmV0Y2gobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5BbGxUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCB0cnVlKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlscy5oYXMobWVzc2FnZS5pZCkpIHtcblx0XHRcdFx0XHRtZXNzYWdlLnV0aWwgPSB0aGlzLmNvbW1hbmRVdGlscy5nZXQobWVzc2FnZS5pZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWVzc2FnZS51dGlsID0gbmV3IENvbW1hbmRVdGlsKHRoaXMsIG1lc3NhZ2UpO1xuXHRcdFx0XHRcdHRoaXMuY29tbWFuZFV0aWxzLnNldChtZXNzYWdlLmlkLCBtZXNzYWdlLnV0aWwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blByZVR5cGVJbmhpYml0b3JzKG1lc3NhZ2UpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IHBhcnNlZCA9IGF3YWl0IHRoaXMucGFyc2VDb21tYW5kKG1lc3NhZ2UpO1xuXHRcdFx0aWYgKCFwYXJzZWQuY29tbWFuZCkge1xuXHRcdFx0XHRjb25zdCBvdmVyUGFyc2VkID0gYXdhaXQgdGhpcy5wYXJzZUNvbW1hbmRPdmVyd3JpdHRlblByZWZpeGVzKG1lc3NhZ2UpO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0b3ZlclBhcnNlZC5jb21tYW5kIHx8XG5cdFx0XHRcdFx0KHBhcnNlZC5wcmVmaXggPT0gbnVsbCAmJiBvdmVyUGFyc2VkLnByZWZpeCAhPSBudWxsKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRwYXJzZWQgPSBvdmVyUGFyc2VkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmNvbW1hbmRVdGlsKSB7XG5cdFx0XHRcdG1lc3NhZ2UudXRpbC5wYXJzZWQgPSBwYXJzZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhd2FpdCB0aGlzLnJ1blBvc3RUeXBlSW5oaWJpdG9ycyhtZXNzYWdlLCBjb21tYW5kKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IGNvbnZlcnRlZE9wdGlvbnMgPSB7fTtcblx0XHRcdGZvciAoY29uc3Qgb3B0aW9uIG9mIGNvbW1hbmQuc2xhc2hPcHRpb25zKSB7XG5cdFx0XHRcdGNvbnZlcnRlZE9wdGlvbnNbb3B0aW9uLm5hbWVdID0gaW50ZXJhY3Rpb24ub3B0aW9ucy5nZXQoXG5cdFx0XHRcdFx0b3B0aW9uLm5hbWUsXG5cdFx0XHRcdFx0b3B0aW9uLnJlcXVpcmVkIHx8IGZhbHNlXG5cdFx0XHRcdCk/LnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQga2V5O1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrKSBrZXkgPSBjb21tYW5kLmxvY2sobWVzc2FnZSwgY29udmVydGVkT3B0aW9ucyk7XG5cdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShrZXkpKSBrZXkgPSBhd2FpdCBrZXk7XG5cdFx0XHRcdGlmIChrZXkpIHtcblx0XHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrZXI/LmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0XHRrZXkgPSBudWxsO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfTE9DS0VELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb21tYW5kLmxvY2tlcj8uYWRkKGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0aWYgKGtleSkgY29tbWFuZC5sb2NrZXI/LmRlbGV0ZShrZXkpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5hdXRvRGVmZXIgfHwgY29tbWFuZC5zbGFzaEVwaGVtZXJhbCkge1xuXHRcdFx0XHRhd2FpdCBpbnRlcmFjdGlvbi5kZWZlcih7IGVwaGVtZXJhbDogY29tbWFuZC5zbGFzaEVwaGVtZXJhbCB9KTtcblx0XHRcdH1cblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhpcy5lbWl0KFxuXHRcdFx0XHRcdENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX1NUQVJURUQsXG5cdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdGNvbnZlcnRlZE9wdGlvbnNcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29uc3QgcmV0ID0gLy8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdGNvbW1hbmQuZXhlY1NsYXNoIHx8IHRoaXMuZXhlY1NsYXNoIC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0XHRcdD8gYXdhaXQgY29tbWFuZC5leGVjU2xhc2gobWVzc2FnZSwgY29udmVydGVkT3B0aW9ucylcblx0XHRcdFx0XHRcdDogYXdhaXQgY29tbWFuZC5leGVjKG1lc3NhZ2UsIGNvbnZlcnRlZE9wdGlvbnMpO1xuXHRcdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdFx0Q29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfRklOSVNIRUQsXG5cdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdGNvbnZlcnRlZE9wdGlvbnMsXG5cdFx0XHRcdFx0cmV0XG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9FUlJPUiwgZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0dGhpcy5lbWl0RXJyb3IoZXJyLCBtZXNzYWdlKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogSGFuZGxlcyBub3JtYWwgY29tbWFuZHMuXG5cdCAqIEBwYXJhbSB7TWVzc2FnZX0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCAtIENvbnRlbnQgb2YgbWVzc2FnZSB3aXRob3V0IGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB7Q29tbWFuZH0gY29tbWFuZCAtIENvbW1hbmQgaW5zdGFuY2UuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lnbm9yZT1mYWxzZV0gLSBJZ25vcmUgaW5oaWJpdG9ycyBhbmQgb3RoZXIgY2hlY2tzLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTw/Ym9vbGVhbj59XG5cdCAqL1xuXHRhc3luYyBoYW5kbGVEaXJlY3RDb21tYW5kKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0Y29udGVudDogc3RyaW5nLFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0aWdub3JlID0gZmFsc2Vcblx0KTogUHJvbWlzZTxib29sZWFuIHwgbnVsbD4ge1xuXHRcdGxldCBrZXk7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICghaWdub3JlKSB7XG5cdFx0XHRcdGlmIChtZXNzYWdlLmVkaXRlZFRpbWVzdGFtcCAmJiAhY29tbWFuZC5lZGl0YWJsZSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGJlZm9yZSA9IGNvbW1hbmQuYmVmb3JlKG1lc3NhZ2UpO1xuXHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGJlZm9yZSkpIGF3YWl0IGJlZm9yZTtcblxuXHRcdFx0Y29uc3QgYXJncyA9IGF3YWl0IGNvbW1hbmQucGFyc2UobWVzc2FnZSwgY29udGVudCk7XG5cdFx0XHRpZiAoRmxhZy5pcyhhcmdzLCBcImNhbmNlbFwiKSkge1xuXHRcdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuQ09NTUFORF9DQU5DRUxMRUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAoRmxhZy5pcyhhcmdzLCBcInJldHJ5XCIpKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0JSRUFLT1VULFxuXHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRhcmdzLm1lc3NhZ2Vcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuaGFuZGxlKGFyZ3MubWVzc2FnZSk7XG5cdFx0XHR9IGVsc2UgaWYgKEZsYWcuaXMoYXJncywgXCJjb250aW51ZVwiKSkge1xuXHRcdFx0XHRjb25zdCBjb250aW51ZUNvbW1hbmQgPSB0aGlzLm1vZHVsZXMuZ2V0KGFyZ3MuY29tbWFuZCk7XG5cdFx0XHRcdHJldHVybiB0aGlzLmhhbmRsZURpcmVjdENvbW1hbmQoXG5cdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRhcmdzLnJlc3QsXG5cblx0XHRcdFx0XHRjb250aW51ZUNvbW1hbmQsXG5cdFx0XHRcdFx0YXJncy5pZ25vcmVcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFpZ25vcmUpIHtcblx0XHRcdFx0aWYgKGNvbW1hbmQubG9jaykga2V5ID0gKGNvbW1hbmQubG9jayBhcyBLZXlTdXBwbGllcikobWVzc2FnZSwgYXJncyk7XG5cdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShrZXkpKSBrZXkgPSBhd2FpdCBrZXk7XG5cdFx0XHRcdGlmIChrZXkpIHtcblx0XHRcdFx0XHRpZiAoY29tbWFuZC5sb2NrZXI/LmhhcyhrZXkpKSB7XG5cdFx0XHRcdFx0XHRrZXkgPSBudWxsO1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfTE9DS0VELCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbW1hbmQubG9ja2VyPy5hZGQoa2V5KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCB0aGlzLnJ1bkNvbW1hbmQobWVzc2FnZSwgY29tbWFuZCwgYXJncyk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHRoaXMuZW1pdEVycm9yKGVyciwgbWVzc2FnZSwgY29tbWFuZCk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aWYgKGtleSkgY29tbWFuZC5sb2NrZXI/LmRlbGV0ZShrZXkpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHJlZ2V4IGFuZCBjb25kaXRpb25hbCBjb21tYW5kcy5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxuXHQgKi9cblx0YXN5bmMgaGFuZGxlUmVnZXhBbmRDb25kaXRpb25hbENvbW1hbmRzKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCByYW4xID0gYXdhaXQgdGhpcy5oYW5kbGVSZWdleENvbW1hbmRzKG1lc3NhZ2UpO1xuXHRcdGNvbnN0IHJhbjIgPSBhd2FpdCB0aGlzLmhhbmRsZUNvbmRpdGlvbmFsQ29tbWFuZHMobWVzc2FnZSk7XG5cdFx0cmV0dXJuIHJhbjEgfHwgcmFuMjtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHJlZ2V4IGNvbW1hbmRzLlxuXHQgKiBAcGFyYW0ge01lc3NhZ2V9IG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XG5cdCAqL1xuXHRhc3luYyBoYW5kbGVSZWdleENvbW1hbmRzKG1lc3NhZ2U6IE1lc3NhZ2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBoYXNSZWdleENvbW1hbmRzID0gW107XG5cdFx0Zm9yIChjb25zdCBjb21tYW5kIG9mIHRoaXMubW9kdWxlcy52YWx1ZXMoKSkge1xuXHRcdFx0aWYgKG1lc3NhZ2UuZWRpdGVkVGltZXN0YW1wID8gY29tbWFuZC5lZGl0YWJsZSA6IHRydWUpIHtcblx0XHRcdFx0Y29uc3QgcmVnZXggPVxuXHRcdFx0XHRcdHR5cGVvZiBjb21tYW5kLnJlZ2V4ID09PSBcImZ1bmN0aW9uXCJcblx0XHRcdFx0XHRcdD8gY29tbWFuZC5yZWdleChtZXNzYWdlKVxuXHRcdFx0XHRcdFx0OiBjb21tYW5kLnJlZ2V4O1xuXHRcdFx0XHRpZiAocmVnZXgpIGhhc1JlZ2V4Q29tbWFuZHMucHVzaCh7IGNvbW1hbmQsIHJlZ2V4IH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IG1hdGNoZWRDb21tYW5kcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgZW50cnkgb2YgaGFzUmVnZXhDb21tYW5kcykge1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSBtZXNzYWdlLmNvbnRlbnQubWF0Y2goZW50cnkucmVnZXgpO1xuXHRcdFx0aWYgKCFtYXRjaCkgY29udGludWU7XG5cblx0XHRcdGNvbnN0IG1hdGNoZXMgPSBbXTtcblxuXHRcdFx0aWYgKGVudHJ5LnJlZ2V4Lmdsb2JhbCkge1xuXHRcdFx0XHRsZXQgbWF0Y2hlZDtcblxuXHRcdFx0XHR3aGlsZSAoKG1hdGNoZWQgPSBlbnRyeS5yZWdleC5leGVjKG1lc3NhZ2UuY29udGVudCkpICE9IG51bGwpIHtcblx0XHRcdFx0XHRtYXRjaGVzLnB1c2gobWF0Y2hlZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bWF0Y2hlZENvbW1hbmRzLnB1c2goeyBjb21tYW5kOiBlbnRyeS5jb21tYW5kLCBtYXRjaCwgbWF0Y2hlcyB9KTtcblx0XHR9XG5cblx0XHRpZiAoIW1hdGNoZWRDb21tYW5kcy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBwcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgeyBjb21tYW5kLCBtYXRjaCwgbWF0Y2hlcyB9IG9mIG1hdGNoZWRDb21tYW5kcykge1xuXHRcdFx0cHJvbWlzZXMucHVzaChcblx0XHRcdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0aWYgKGF3YWl0IHRoaXMucnVuUG9zdFR5cGVJbmhpYml0b3JzKG1lc3NhZ2UsIGNvbW1hbmQpKSByZXR1cm47XG5cblx0XHRcdFx0XHRcdGNvbnN0IGJlZm9yZSA9IGNvbW1hbmQuYmVmb3JlKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGJlZm9yZSkpIGF3YWl0IGJlZm9yZTtcblxuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5ydW5Db21tYW5kKG1lc3NhZ2UsIGNvbW1hbmQsIHsgbWF0Y2gsIG1hdGNoZXMgfSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBjb25kaXRpb25hbCBjb21tYW5kcy5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBoYW5kbGUuXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fVxuXHQgKi9cblx0YXN5bmMgaGFuZGxlQ29uZGl0aW9uYWxDb21tYW5kcyhtZXNzYWdlOiBNZXNzYWdlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgdHJ1ZUNvbW1hbmRzID0gW107XG5cblx0XHRjb25zdCBmaWx0ZXJQcm9taXNlcyA9IFtdO1xuXHRcdGZvciAoY29uc3QgY29tbWFuZCBvZiB0aGlzLm1vZHVsZXMudmFsdWVzKCkpIHtcblx0XHRcdGlmIChtZXNzYWdlLmVkaXRlZFRpbWVzdGFtcCAmJiAhY29tbWFuZC5lZGl0YWJsZSkgY29udGludWU7XG5cdFx0XHRmaWx0ZXJQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGxldCBjb25kID0gY29tbWFuZC5jb25kaXRpb24obWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGNvbmQpKSBjb25kID0gYXdhaXQgY29uZDtcblx0XHRcdFx0XHRpZiAoY29uZCkgdHJ1ZUNvbW1hbmRzLnB1c2goY29tbWFuZCk7XG5cdFx0XHRcdH0pKClcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwoZmlsdGVyUHJvbWlzZXMpO1xuXG5cdFx0aWYgKCF0cnVlQ29tbWFuZHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGNvbW1hbmQgb2YgdHJ1ZUNvbW1hbmRzKSB7XG5cdFx0XHRwcm9taXNlcy5wdXNoKFxuXHRcdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRpZiAoYXdhaXQgdGhpcy5ydW5Qb3N0VHlwZUluaGliaXRvcnMobWVzc2FnZSwgY29tbWFuZCkpIHJldHVybjtcblx0XHRcdFx0XHRcdGNvbnN0IGJlZm9yZSA9IGNvbW1hbmQuYmVmb3JlKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKGJlZm9yZSkpIGF3YWl0IGJlZm9yZTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMucnVuQ29tbWFuZChtZXNzYWdlLCBjb21tYW5kLCB7fSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXRFcnJvcihlcnIsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBpbmhpYml0b3JzIHdpdGggdGhlIGFsbCB0eXBlLlxuXHQgKiBAcGFyYW0ge01lc3NhZ2V8QWthaXJvTWVzc2FnZX0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHNsYXNoIC0gV2hldGhlciBvciBub3QgdGhlIGNvbW1hbmQgc2hvdWxkIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XG5cdCAqL1xuXHRhc3luYyBydW5BbGxUeXBlSW5oaWJpdG9ycyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRzbGFzaCA9IGZhbHNlXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHJlYXNvbiA9IHRoaXMuaW5oaWJpdG9ySGFuZGxlclxuXHRcdFx0PyBhd2FpdCB0aGlzLmluaGliaXRvckhhbmRsZXIudGVzdChcImFsbFwiLCBtZXNzYWdlKVxuXHRcdFx0OiBudWxsO1xuXG5cdFx0aWYgKHJlYXNvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCByZWFzb24pO1xuXHRcdH0gZWxzZSBpZiAoIW1lc3NhZ2UuYXV0aG9yKSB7XG5cdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCxcblx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0QnVpbHRJblJlYXNvbnMuQVVUSE9SX05PVF9GT1VORFxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuYmxvY2tDbGllbnQgJiYgbWVzc2FnZS5hdXRob3IuaWQgPT09IHRoaXMuY2xpZW50LnVzZXI/LmlkKSB7XG5cdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCxcblx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0QnVpbHRJblJlYXNvbnMuQ0xJRU5UXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5ibG9ja0JvdHMgJiYgbWVzc2FnZS5hdXRob3IuYm90KSB7XG5cdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdENvbW1hbmRIYW5kbGVyRXZlbnRzLk1FU1NBR0VfQkxPQ0tFRCxcblx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0QnVpbHRJblJlYXNvbnMuQk9UXG5cdFx0XHQpOyAvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0fSBlbHNlIGlmICghc2xhc2ggJiYgdGhpcy5oYXNQcm9tcHQobWVzc2FnZS5jaGFubmVsLCBtZXNzYWdlLmF1dGhvcikpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5JTl9QUk9NUFQsIG1lc3NhZ2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBpbmhpYml0b3JzIHdpdGggdGhlIHByZSB0eXBlLlxuXHQgKiBAcGFyYW0ge01lc3NhZ2V8QWthaXJvTWVzc2FnZX0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn1cblx0ICovXG5cdGFzeW5jIHJ1blByZVR5cGVJbmhpYml0b3JzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHJlYXNvbiA9IHRoaXMuaW5oaWJpdG9ySGFuZGxlclxuXHRcdFx0PyBhd2FpdCB0aGlzLmluaGliaXRvckhhbmRsZXIudGVzdChcInByZVwiLCBtZXNzYWdlKVxuXHRcdFx0OiBudWxsO1xuXG5cdFx0aWYgKHJlYXNvbiAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmVtaXQoQ29tbWFuZEhhbmRsZXJFdmVudHMuTUVTU0FHRV9CTE9DS0VELCBtZXNzYWdlLCByZWFzb24pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBpbmhpYml0b3JzIHdpdGggdGhlIHBvc3QgdHlwZS5cblx0ICogQHBhcmFtIHtNZXNzYWdlfEFrYWlyb01lc3NhZ2V9IG1lc3NhZ2UgLSBNZXNzYWdlIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZCB0byBoYW5kbGUuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gc2xhc2ggLSBXaGV0aGVyIG9yIG5vdCB0aGUgY29tbWFuZCBzaG91bGQgaXMgYSBzbGFzaCBjb21tYW5kLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn1cblx0ICovXG5cdGFzeW5jIHJ1blBvc3RUeXBlSW5oaWJpdG9ycyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSxcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdHNsYXNoID0gZmFsc2Vcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgZXZlbnQgPSBzbGFzaFxuXHRcdFx0PyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9CTE9DS0VEXG5cdFx0XHQ6IENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfQkxPQ0tFRDtcblxuXHRcdGlmIChjb21tYW5kLm93bmVyT25seSkge1xuXHRcdFx0Y29uc3QgaXNPd25lciA9IHRoaXMuY2xpZW50LmlzT3duZXIobWVzc2FnZS5hdXRob3IpO1xuXHRcdFx0aWYgKCFpc093bmVyKSB7XG5cdFx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgQnVpbHRJblJlYXNvbnMuT1dORVIpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY29tbWFuZC5zdXBlclVzZXJPbmx5KSB7XG5cdFx0XHRjb25zdCBpc1N1cGVyVXNlciA9IHRoaXMuY2xpZW50LmlzU3VwZXJVc2VyKG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRcdGlmICghaXNTdXBlclVzZXIpIHtcblx0XHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5PV05FUik7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21tYW5kLmNoYW5uZWwgPT09IFwiZ3VpbGRcIiAmJiAhbWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5HVUlMRCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoY29tbWFuZC5jaGFubmVsID09PSBcImRtXCIgJiYgbWVzc2FnZS5ndWlsZCkge1xuXHRcdFx0dGhpcy5lbWl0KGV2ZW50LCBtZXNzYWdlLCBjb21tYW5kLCBCdWlsdEluUmVhc29ucy5ETSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0aWYgKGNvbW1hbmQub25seU5zZncgJiYgIW1lc3NhZ2UuY2hhbm5lbC5uc2Z3KSB7XG5cdFx0XHR0aGlzLmVtaXQoZXZlbnQsIG1lc3NhZ2UsIGNvbW1hbmQsIEJ1aWx0SW5SZWFzb25zLk5PVF9OU0ZXKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGlmIChhd2FpdCB0aGlzLnJ1blBlcm1pc3Npb25DaGVja3MobWVzc2FnZSwgY29tbWFuZCwgc2xhc2gpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRjb25zdCByZWFzb24gPSB0aGlzLmluaGliaXRvckhhbmRsZXJcblx0XHRcdD8gYXdhaXQgdGhpcy5pbmhpYml0b3JIYW5kbGVyLnRlc3QoXCJwb3N0XCIsIG1lc3NhZ2UsIGNvbW1hbmQpXG5cdFx0XHQ6IG51bGw7XG5cblx0XHRpZiAocmVhc29uICE9IG51bGwpIHtcblx0XHRcdHRoaXMuZW1pdChldmVudCwgbWVzc2FnZSwgY29tbWFuZCwgcmVhc29uKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLnJ1bkNvb2xkb3ducyhtZXNzYWdlLCBjb21tYW5kKSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgcGVybWlzc2lvbiBjaGVja3MuXG5cdCAqIEBwYXJhbSB7TWVzc2FnZXxBa2Fpcm9NZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtDb21tYW5kfSBjb21tYW5kIC0gQ29tbWFuZCB0byBjb29sZG93bi5cblx0ICogQHBhcmFtIHtib29sZWFufSBzbGFzaCAtIFdoZXRoZXIgb3Igbm90IHRoZSBjb21tYW5kIGlzIGEgc2xhc2ggY29tbWFuZC5cblx0ICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XG5cdCAqL1xuXHRhc3luYyBydW5QZXJtaXNzaW9uQ2hlY2tzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0c2xhc2ggPSBmYWxzZVxuXHQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRpZiAoY29tbWFuZC5jbGllbnRQZXJtaXNzaW9ucykge1xuXHRcdFx0aWYgKHR5cGVvZiBjb21tYW5kLmNsaWVudFBlcm1pc3Npb25zID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRsZXQgbWlzc2luZyA9IGNvbW1hbmQuY2xpZW50UGVybWlzc2lvbnMobWVzc2FnZSk7XG5cdFx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShtaXNzaW5nKSkgbWlzc2luZyA9IGF3YWl0IG1pc3Npbmc7XG5cblx0XHRcdFx0aWYgKG1pc3NpbmcgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdHNsYXNoXG5cdFx0XHRcdFx0XHRcdD8gQ29tbWFuZEhhbmRsZXJFdmVudHMuU0xBU0hfTUlTU0lOR19QRVJNSVNTSU9OU1xuXHRcdFx0XHRcdFx0XHQ6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0XHRcdFwiY2xpZW50XCIsXG5cdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChtZXNzYWdlLmd1aWxkKSB7XG5cdFx0XHRcdGlmIChtZXNzYWdlLmNoYW5uZWw/LnR5cGUgPT09IFwiRE1cIikgcmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRjb25zdCBtaXNzaW5nID0gbWVzc2FnZS5jaGFubmVsXG5cblx0XHRcdFx0XHQ/LnBlcm1pc3Npb25zRm9yKG1lc3NhZ2UuZ3VpbGQubWUpXG5cdFx0XHRcdFx0Py5taXNzaW5nKGNvbW1hbmQuY2xpZW50UGVybWlzc2lvbnMpO1xuXHRcdFx0XHRpZiAobWlzc2luZz8ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0dGhpcy5lbWl0KFxuXHRcdFx0XHRcdFx0c2xhc2hcblx0XHRcdFx0XHRcdFx0PyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TXG5cdFx0XHRcdFx0XHRcdDogQ29tbWFuZEhhbmRsZXJFdmVudHMuTUlTU0lOR19QRVJNSVNTSU9OUyxcblx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdFx0XCJjbGllbnRcIixcblx0XHRcdFx0XHRcdG1pc3Npbmdcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNvbW1hbmQudXNlclBlcm1pc3Npb25zKSB7XG5cdFx0XHRjb25zdCBpZ25vcmVyID0gY29tbWFuZC5pZ25vcmVQZXJtaXNzaW9ucyB8fCB0aGlzLmlnbm9yZVBlcm1pc3Npb25zO1xuXHRcdFx0Y29uc3QgaXNJZ25vcmVkID0gQXJyYXkuaXNBcnJheShpZ25vcmVyKVxuXHRcdFx0XHQ/IGlnbm9yZXIuaW5jbHVkZXMobWVzc2FnZS5hdXRob3IuaWQpXG5cdFx0XHRcdDogdHlwZW9mIGlnbm9yZXIgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0XHQ/IGlnbm9yZXIobWVzc2FnZSwgY29tbWFuZClcblx0XHRcdFx0OiBtZXNzYWdlLmF1dGhvci5pZCA9PT0gaWdub3JlcjtcblxuXHRcdFx0aWYgKCFpc0lnbm9yZWQpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBjb21tYW5kLnVzZXJQZXJtaXNzaW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRcdGxldCBtaXNzaW5nID0gY29tbWFuZC51c2VyUGVybWlzc2lvbnMobWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKG1pc3NpbmcpKSBtaXNzaW5nID0gYXdhaXQgbWlzc2luZztcblxuXHRcdFx0XHRcdGlmIChtaXNzaW5nICE9IG51bGwpIHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcblx0XHRcdFx0XHRcdFx0c2xhc2hcblx0XHRcdFx0XHRcdFx0XHQ/IENvbW1hbmRIYW5kbGVyRXZlbnRzLlNMQVNIX01JU1NJTkdfUEVSTUlTU0lPTlNcblx0XHRcdFx0XHRcdFx0XHQ6IENvbW1hbmRIYW5kbGVyRXZlbnRzLk1JU1NJTkdfUEVSTUlTU0lPTlMsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdFx0XHRcdFwidXNlclwiLFxuXHRcdFx0XHRcdFx0XHRtaXNzaW5nXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKG1lc3NhZ2UuZ3VpbGQpIHtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS5jaGFubmVsPy50eXBlID09PSBcIkRNXCIpIHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRjb25zdCBtaXNzaW5nID0gbWVzc2FnZS5jaGFubmVsXG5cdFx0XHRcdFx0XHQ/LnBlcm1pc3Npb25zRm9yKG1lc3NhZ2UuYXV0aG9yKVxuXHRcdFx0XHRcdFx0Py5taXNzaW5nKGNvbW1hbmQudXNlclBlcm1pc3Npb25zKTtcblx0XHRcdFx0XHRpZiAobWlzc2luZz8ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXG5cdFx0XHRcdFx0XHRcdHNsYXNoXG5cdFx0XHRcdFx0XHRcdFx0PyBDb21tYW5kSGFuZGxlckV2ZW50cy5TTEFTSF9NSVNTSU5HX1BFUk1JU1NJT05TXG5cdFx0XHRcdFx0XHRcdFx0OiBDb21tYW5kSGFuZGxlckV2ZW50cy5NSVNTSU5HX1BFUk1JU1NJT05TLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRcdFx0XHRcInVzZXJcIixcblx0XHRcdFx0XHRcdFx0bWlzc2luZ1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGNvb2xkb3ducyBhbmQgY2hlY2tzIGlmIGEgdXNlciBpcyB1bmRlciBjb29sZG93bi5cblx0ICogQHBhcmFtIHtNZXNzYWdlfEFrYWlyb01lc3NhZ2V9IG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kIHRvIGNvb2xkb3duLlxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdHJ1bkNvb2xkb3ducyhtZXNzYWdlOiBNZXNzYWdlIHwgQWthaXJvTWVzc2FnZSwgY29tbWFuZDogQ29tbWFuZCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGlkID0gbWVzc2FnZS5hdXRob3I/LmlkO1xuXHRcdGNvbnN0IGlnbm9yZXIgPSBjb21tYW5kLmlnbm9yZUNvb2xkb3duIHx8IHRoaXMuaWdub3JlQ29vbGRvd247XG5cdFx0Y29uc3QgaXNJZ25vcmVkID0gQXJyYXkuaXNBcnJheShpZ25vcmVyKVxuXHRcdFx0PyBpZ25vcmVyLmluY2x1ZGVzKGlkKVxuXHRcdFx0OiB0eXBlb2YgaWdub3JlciA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHQ/IGlnbm9yZXIobWVzc2FnZSwgY29tbWFuZClcblx0XHRcdDogaWQgPT09IGlnbm9yZXI7XG5cblx0XHRpZiAoaXNJZ25vcmVkKSByZXR1cm4gZmFsc2U7XG5cblx0XHRjb25zdCB0aW1lID1cblx0XHRcdGNvbW1hbmQuY29vbGRvd24gIT0gbnVsbCA/IGNvbW1hbmQuY29vbGRvd24gOiB0aGlzLmRlZmF1bHRDb29sZG93bjtcblx0XHRpZiAoIXRpbWUpIHJldHVybiBmYWxzZTtcblxuXHRcdGNvbnN0IGVuZFRpbWUgPSBtZXNzYWdlLmNyZWF0ZWRUaW1lc3RhbXAgKyB0aW1lO1xuXG5cdFx0aWYgKCF0aGlzLmNvb2xkb3ducy5oYXMoaWQpKSB0aGlzLmNvb2xkb3ducy5zZXQoaWQsIHt9KTtcblxuXHRcdGlmICghdGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXSkge1xuXHRcdFx0dGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXSA9IHtcblx0XHRcdFx0dGltZXI6IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdKSB7XG5cdFx0XHRcdFx0XHRjbGVhclRpbWVvdXQodGhpcy5jb29sZG93bnMuZ2V0KGlkKVtjb21tYW5kLmlkXS50aW1lcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF0gPSBudWxsO1xuXG5cdFx0XHRcdFx0aWYgKCFPYmplY3Qua2V5cyh0aGlzLmNvb2xkb3ducy5nZXQoaWQpKS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHRoaXMuY29vbGRvd25zLmRlbGV0ZShpZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCB0aW1lKS51bnJlZigpLFxuXHRcdFx0XHRlbmQ6IGVuZFRpbWUsXG5cdFx0XHRcdHVzZXM6IDBcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Y29uc3QgZW50cnkgPSB0aGlzLmNvb2xkb3ducy5nZXQoaWQpW2NvbW1hbmQuaWRdO1xuXG5cdFx0aWYgKGVudHJ5LnVzZXMgPj0gY29tbWFuZC5yYXRlbGltaXQpIHtcblx0XHRcdGNvbnN0IGVuZCA9IHRoaXMuY29vbGRvd25zLmdldChpZClbY29tbWFuZC5pZF0uZW5kO1xuXHRcdFx0Y29uc3QgZGlmZiA9IGVuZCAtIG1lc3NhZ2UuY3JlYXRlZFRpbWVzdGFtcDtcblxuXHRcdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPT0xET1dOLCBtZXNzYWdlLCBjb21tYW5kLCBkaWZmKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGVudHJ5LnVzZXMrKztcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBhIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB7TWVzc2FnZX0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gaGFuZGxlLlxuXHQgKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kIHRvIGhhbmRsZS5cblx0ICogQHBhcmFtIHthbnl9IGFyZ3MgLSBBcmd1bWVudHMgdG8gdXNlLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cblx0ICovXG5cdGFzeW5jIHJ1bkNvbW1hbmQoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdGFyZ3M6IGFueVxuXHQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIWNvbW1hbmQgfHwgIW1lc3NhZ2UpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5DT01NQU5EX0lOVkFMSUQsIG1lc3NhZ2UsIGNvbW1hbmQpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoY29tbWFuZC50eXBpbmcgfHwgdGhpcy50eXBpbmcpIHtcblx0XHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kVHlwaW5nKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5lbWl0KENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfU1RBUlRFRCwgbWVzc2FnZSwgY29tbWFuZCwgYXJncyk7XG5cdFx0Y29uc3QgcmV0ID0gYXdhaXQgY29tbWFuZC5leGVjKG1lc3NhZ2UsIGFyZ3MpO1xuXHRcdHRoaXMuZW1pdChcblx0XHRcdENvbW1hbmRIYW5kbGVyRXZlbnRzLkNPTU1BTkRfRklOSVNIRUQsXG5cdFx0XHRtZXNzYWdlLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGFyZ3MsXG5cdFx0XHRyZXRcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgY29tbWFuZCBhbmQgaXRzIGFyZ3VtZW50IGxpc3QuXG5cdCAqIEBwYXJhbSB7TWVzc2FnZXxBa2Fpcm9NZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHJldHVybnMge1Byb21pc2U8UGFyc2VkQ29tcG9uZW50RGF0YT59XG5cdCAqL1xuXHRhc3luYyBwYXJzZUNvbW1hbmQoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSB8IEFrYWlyb01lc3NhZ2Vcblx0KTogUHJvbWlzZTxQYXJzZWRDb21wb25lbnREYXRhPiB7XG5cdFx0Y29uc3QgYWxsb3dNZW50aW9uID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5wcmVmaXgpKG1lc3NhZ2UpO1xuXHRcdGxldCBwcmVmaXhlcyA9IFV0aWwuaW50b0FycmF5KGFsbG93TWVudGlvbik7XG5cdFx0aWYgKGFsbG93TWVudGlvbikge1xuXHRcdFx0Y29uc3QgbWVudGlvbnMgPSBbXG5cdFx0XHRcdGA8QCR7dGhpcy5jbGllbnQudXNlcj8uaWR9PmAsXG5cdFx0XHRcdGA8QCEke3RoaXMuY2xpZW50LnVzZXI/LmlkfT5gXG5cdFx0XHRdO1xuXHRcdFx0cHJlZml4ZXMgPSBbLi4ubWVudGlvbnMsIC4uLnByZWZpeGVzXTtcblx0XHR9XG5cblx0XHRwcmVmaXhlcy5zb3J0KFV0aWwucHJlZml4Q29tcGFyZSk7XG5cdFx0cmV0dXJuIHRoaXMucGFyc2VNdWx0aXBsZVByZWZpeGVzKFxuXHRcdFx0bWVzc2FnZSxcblx0XHRcdHByZWZpeGVzLm1hcChwID0+IFtwLCBudWxsXSlcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgY29tbWFuZCBhbmQgaXRzIGFyZ3VtZW50IGxpc3QgdXNpbmcgcHJlZml4IG92ZXJ3cml0ZXMuXG5cdCAqIEBwYXJhbSB7TWVzc2FnZXxBa2Fpcm9NZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHJldHVybnMge1Byb21pc2U8UGFyc2VkQ29tcG9uZW50RGF0YT59XG5cdCAqL1xuXHRhc3luYyBwYXJzZUNvbW1hbmRPdmVyd3JpdHRlblByZWZpeGVzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlXG5cdCk6IFByb21pc2U8UGFyc2VkQ29tcG9uZW50RGF0YT4ge1xuXHRcdGlmICghdGhpcy5wcmVmaXhlcy5zaXplKSB7XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fVxuXG5cdFx0Y29uc3QgcHJvbWlzZXMgPSB0aGlzLnByZWZpeGVzLm1hcChhc3luYyAoY21kcywgcHJvdmlkZXIpID0+IHtcblx0XHRcdGNvbnN0IHByZWZpeGVzID0gVXRpbC5pbnRvQXJyYXkoXG5cdFx0XHRcdGF3YWl0IFV0aWwuaW50b0NhbGxhYmxlKHByb3ZpZGVyKShtZXNzYWdlKVxuXHRcdFx0KTtcblx0XHRcdHJldHVybiBwcmVmaXhlcy5tYXAocCA9PiBbcCwgY21kc10pO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgcGFpcnMgPSBVdGlsLmZsYXRNYXAoYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpLCB4ID0+IHgpO1xuXHRcdHBhaXJzLnNvcnQoKFthXSwgW2JdKSA9PiBVdGlsLnByZWZpeENvbXBhcmUoYSwgYikpO1xuXHRcdHJldHVybiB0aGlzLnBhcnNlTXVsdGlwbGVQcmVmaXhlcyhtZXNzYWdlLCBwYWlycyk7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBwYXJzZVdpdGhQcmVmaXggb24gbXVsdGlwbGUgcHJlZml4ZXMgYW5kIHJldHVybnMgdGhlIGJlc3QgcGFyc2UuXG5cdCAqIEBwYXJhbSB7TWVzc2FnZXxBa2Fpcm9NZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBwYXJzZS5cblx0ICogQHBhcmFtIHthbnlbXX0gcGFpcnMgLSBQYWlycyBvZiBwcmVmaXggdG8gYXNzb2NpYXRlZCBjb21tYW5kcy5cblx0ICogVGhhdCBpcywgYFtzdHJpbmcsIFNldDxzdHJpbmc+IHwgbnVsbF1bXWAuXG5cdCAqIEByZXR1cm5zIHtQYXJzZWRDb21wb25lbnREYXRhfVxuXHQgKi9cblx0cGFyc2VNdWx0aXBsZVByZWZpeGVzKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdHBhaXJzOiBhbnlbXVxuXHQpOiBQYXJzZWRDb21wb25lbnREYXRhIHtcblx0XHRjb25zdCBwYXJzZXMgPSBwYWlycy5tYXAoKFtwcmVmaXgsIGNtZHNdKSA9PlxuXHRcdFx0dGhpcy5wYXJzZVdpdGhQcmVmaXgobWVzc2FnZSwgcHJlZml4LCBjbWRzKVxuXHRcdCk7XG5cdFx0Y29uc3QgcmVzdWx0ID0gcGFyc2VzLmZpbmQocGFyc2VkID0+IHBhcnNlZC5jb21tYW5kKTtcblx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGNvbnN0IGd1ZXNzID0gcGFyc2VzLmZpbmQocGFyc2VkID0+IHBhcnNlZC5wcmVmaXggIT0gbnVsbCk7XG5cdFx0aWYgKGd1ZXNzKSB7XG5cdFx0XHRyZXR1cm4gZ3Vlc3M7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWVzIHRvIHBhcnNlIGEgbWVzc2FnZSB3aXRoIHRoZSBnaXZlbiBwcmVmaXggYW5kIGFzc29jaWF0ZWQgY29tbWFuZHMuXG5cdCAqIEFzc29jaWF0ZWQgY29tbWFuZHMgcmVmZXIgdG8gd2hlbiBhIHByZWZpeCBpcyB1c2VkIGluIHByZWZpeCBvdmVycmlkZXMuXG5cdCAqIEBwYXJhbSB7TWVzc2FnZXxBa2Fpcm9NZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0byBwYXJzZS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCAtIFByZWZpeCB0byB1c2UuXG5cdCAqIEBwYXJhbSB7U2V0PHN0cmluZz58bnVsbH0gW2Fzc29jaWF0ZWRDb21tYW5kcz1udWxsXSAtIEFzc29jaWF0ZWQgY29tbWFuZHMuXG5cdCAqIEByZXR1cm5zIHtQYXJzZWRDb21wb25lbnREYXRhfVxuXHQgKi9cblx0cGFyc2VXaXRoUHJlZml4KFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdHByZWZpeDogc3RyaW5nLFxuXHRcdGFzc29jaWF0ZWRDb21tYW5kczogU2V0PHN0cmluZz4gfCBudWxsID0gbnVsbFxuXHQpOiBQYXJzZWRDb21wb25lbnREYXRhIHtcblx0XHRjb25zdCBsb3dlckNvbnRlbnQgPSBtZXNzYWdlLmNvbnRlbnQudG9Mb3dlckNhc2UoKTtcblx0XHRpZiAoIWxvd2VyQ29udGVudC5zdGFydHNXaXRoKHByZWZpeC50b0xvd2VyQ2FzZSgpKSkge1xuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH1cblxuXHRcdGNvbnN0IGVuZE9mUHJlZml4ID1cblx0XHRcdGxvd2VyQ29udGVudC5pbmRleE9mKHByZWZpeC50b0xvd2VyQ2FzZSgpKSArIHByZWZpeC5sZW5ndGg7XG5cdFx0Y29uc3Qgc3RhcnRPZkFyZ3MgPVxuXHRcdFx0bWVzc2FnZS5jb250ZW50LnNsaWNlKGVuZE9mUHJlZml4KS5zZWFyY2goL1xcUy8pICsgcHJlZml4Lmxlbmd0aDtcblx0XHRjb25zdCBhbGlhcyA9IG1lc3NhZ2UuY29udGVudC5zbGljZShzdGFydE9mQXJncykuc3BsaXQoL1xcc3sxLH18XFxuezEsfS8pWzBdO1xuXHRcdGNvbnN0IGNvbW1hbmQgPSB0aGlzLmZpbmRDb21tYW5kKGFsaWFzKTtcblx0XHRjb25zdCBjb250ZW50ID0gbWVzc2FnZS5jb250ZW50XG5cdFx0XHQuc2xpY2Uoc3RhcnRPZkFyZ3MgKyBhbGlhcy5sZW5ndGggKyAxKVxuXHRcdFx0LnRyaW0oKTtcblx0XHRjb25zdCBhZnRlclByZWZpeCA9IG1lc3NhZ2UuY29udGVudC5zbGljZShwcmVmaXgubGVuZ3RoKS50cmltKCk7XG5cblx0XHRpZiAoIWNvbW1hbmQpIHtcblx0XHRcdHJldHVybiB7IHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdFx0fVxuXG5cdFx0aWYgKGFzc29jaWF0ZWRDb21tYW5kcyA9PSBudWxsKSB7XG5cdFx0XHRpZiAoY29tbWFuZC5wcmVmaXggIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4geyBwcmVmaXgsIGFsaWFzLCBjb250ZW50LCBhZnRlclByZWZpeCB9O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIWFzc29jaWF0ZWRDb21tYW5kcy5oYXMoY29tbWFuZC5pZCkpIHtcblx0XHRcdHJldHVybiB7IHByZWZpeCwgYWxpYXMsIGNvbnRlbnQsIGFmdGVyUHJlZml4IH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgY29tbWFuZCwgcHJlZml4LCBhbGlhcywgY29udGVudCwgYWZ0ZXJQcmVmaXggfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIGVycm9ycyBmcm9tIHRoZSBoYW5kbGluZy5cblx0ICogQHBhcmFtIHtFcnJvcn0gZXJyIC0gVGhlIGVycm9yLlxuXHQgKiBAcGFyYW0ge01lc3NhZ2V8QWthaXJvTWVzc2FnZX0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB7Q29tbWFuZHxBa2Fpcm9Nb2R1bGV9IFtjb21tYW5kXSAtIENvbW1hbmQgdGhhdCBlcnJvcmVkLlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdGVtaXRFcnJvcihcblx0XHRlcnI6IEVycm9yLFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQgfCBBa2Fpcm9Nb2R1bGVcblx0KTogdm9pZCB7XG5cdFx0aWYgKHRoaXMubGlzdGVuZXJDb3VudChDb21tYW5kSGFuZGxlckV2ZW50cy5FUlJPUikpIHtcblx0XHRcdHRoaXMuZW1pdChDb21tYW5kSGFuZGxlckV2ZW50cy5FUlJPUiwgZXJyLCBtZXNzYWdlLCBjb21tYW5kKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aHJvdyBlcnI7XG5cdH1cblxuXHQvKipcblx0ICogU3dlZXAgY29tbWFuZCB1dGlsIGluc3RhbmNlcyBmcm9tIGNhY2hlIGFuZCByZXR1cm5zIGFtb3VudCBzd2VlcGVkLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gbGlmZXRpbWUgLSBNZXNzYWdlcyBvbGRlciB0aGFuIHRoaXMgd2lsbCBoYXZlIHRoZWlyIGNvbW1hbmQgdXRpbCBpbnN0YW5jZSBzd2VlcGVkLlxuXHQgKiBUaGlzIGlzIGluIG1pbGxpc2Vjb25kcyBhbmQgZGVmYXVsdHMgdG8gdGhlIGBjb21tYW5kVXRpbExpZmV0aW1lYCBvcHRpb24uXG5cdCAqIEByZXR1cm5zIHtudW1iZXJ9XG5cdCAqL1xuXHRzd2VlcENvbW1hbmRVdGlsKGxpZmV0aW1lOiBudW1iZXIgPSB0aGlzLmNvbW1hbmRVdGlsTGlmZXRpbWUpOiBudW1iZXIge1xuXHRcdGxldCBjb3VudCA9IDA7XG5cdFx0Zm9yIChjb25zdCBjb21tYW5kVXRpbCBvZiB0aGlzLmNvbW1hbmRVdGlscy52YWx1ZXMoKSkge1xuXHRcdFx0Y29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBjb21tYW5kVXRpbC5tZXNzYWdlO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRub3cgLVxuXHRcdFx0XHRcdCgobWVzc2FnZSBhcyBNZXNzYWdlKS5lZGl0ZWRUaW1lc3RhbXAgfHwgbWVzc2FnZS5jcmVhdGVkVGltZXN0YW1wKSA+XG5cdFx0XHRcdGxpZmV0aW1lXG5cdFx0XHQpIHtcblx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0dGhpcy5jb21tYW5kVXRpbHMuZGVsZXRlKG1lc3NhZ2UuaWQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjb3VudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIG9uZ29pbmcgcHJvbXB0IGluIG9yZGVyIHRvIHByZXZlbnQgY29tbWFuZCB1c2FnZSBpbiB0aGUgY2hhbm5lbC5cblx0ICogQHBhcmFtIHtDaGFubmVsfSBjaGFubmVsIC0gQ2hhbm5lbCB0byBhZGQgdG8uXG5cdCAqIEBwYXJhbSB7VXNlcn0gdXNlciAtIFVzZXIgdG8gYWRkLlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdGFkZFByb21wdChjaGFubmVsOiBDaGFubmVsLCB1c2VyOiBVc2VyKTogdm9pZCB7XG5cdFx0bGV0IHVzZXJzID0gdGhpcy5wcm9tcHRzLmdldChjaGFubmVsLmlkKTtcblx0XHRpZiAoIXVzZXJzKSB0aGlzLnByb21wdHMuc2V0KGNoYW5uZWwuaWQsIG5ldyBTZXQoKSk7XG5cdFx0dXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdHVzZXJzPy5hZGQodXNlci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbiBvbmdvaW5nIHByb21wdC5cblx0ICogQHBhcmFtIHtDaGFubmVsfSBjaGFubmVsIC0gQ2hhbm5lbCB0byByZW1vdmUgZnJvbS5cblx0ICogQHBhcmFtIHtVc2VyfSB1c2VyIC0gVXNlciB0byByZW1vdmUuXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKi9cblx0cmVtb3ZlUHJvbXB0KGNoYW5uZWw6IENoYW5uZWwsIHVzZXI6IFVzZXIpOiB2b2lkIHtcblx0XHRjb25zdCB1c2VycyA9IHRoaXMucHJvbXB0cy5nZXQoY2hhbm5lbC5pZCk7XG5cdFx0aWYgKCF1c2VycykgcmV0dXJuO1xuXHRcdHVzZXJzLmRlbGV0ZSh1c2VyLmlkKTtcblx0XHRpZiAoIXVzZXJzLnNpemUpIHRoaXMucHJvbXB0cy5kZWxldGUodXNlci5pZCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZXJlIGlzIGFuIG9uZ29pbmcgcHJvbXB0LlxuXHQgKiBAcGFyYW0ge0NoYW5uZWx9IGNoYW5uZWwgLSBDaGFubmVsIHRvIGNoZWNrLlxuXHQgKiBAcGFyYW0ge1VzZXJ9IHVzZXIgLSBVc2VyIHRvIGNoZWNrLlxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdGhhc1Byb21wdChjaGFubmVsOiBDaGFubmVsLCB1c2VyOiBVc2VyKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgdXNlcnMgPSB0aGlzLnByb21wdHMuZ2V0KGNoYW5uZWwuaWQpO1xuXHRcdGlmICghdXNlcnMpIHJldHVybiBmYWxzZTtcblx0XHRyZXR1cm4gdXNlcnMuaGFzKHVzZXIuaWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmRzIGEgY29tbWFuZCBieSBhbGlhcy5cblx0ICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBBbGlhcyB0byBmaW5kIHdpdGguXG5cdCAqIEByZXR1cm5zIHtDb21tYW5kfVxuXHQgKi9cblx0ZmluZENvbW1hbmQobmFtZTogc3RyaW5nKTogQ29tbWFuZCB7XG5cdFx0cmV0dXJuIHRoaXMubW9kdWxlcy5nZXQodGhpcy5hbGlhc2VzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGluaGliaXRvciBoYW5kbGVyIHRvIHVzZS5cblx0ICogQHBhcmFtIHtJbmhpYml0b3JIYW5kbGVyfSBpbmhpYml0b3JIYW5kbGVyIC0gVGhlIGluaGliaXRvciBoYW5kbGVyLlxuXHQgKiBAcmV0dXJucyB7Q29tbWFuZEhhbmRsZXJ9XG5cdCAqL1xuXHR1c2VJbmhpYml0b3JIYW5kbGVyKGluaGliaXRvckhhbmRsZXI6IEluaGliaXRvckhhbmRsZXIpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0dGhpcy5pbmhpYml0b3JIYW5kbGVyID0gaW5oaWJpdG9ySGFuZGxlcjtcblx0XHR0aGlzLnJlc29sdmVyLmluaGliaXRvckhhbmRsZXIgPSBpbmhpYml0b3JIYW5kbGVyO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBsaXN0ZW5lciBoYW5kbGVyIHRvIHVzZS5cblx0ICogQHBhcmFtIHtMaXN0ZW5lckhhbmRsZXJ9IGxpc3RlbmVySGFuZGxlciAtIFRoZSBsaXN0ZW5lciBoYW5kbGVyLlxuXHQgKiBAcmV0dXJucyB7Q29tbWFuZEhhbmRsZXJ9XG5cdCAqL1xuXHR1c2VMaXN0ZW5lckhhbmRsZXIobGlzdGVuZXJIYW5kbGVyOiBMaXN0ZW5lckhhbmRsZXIpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0dGhpcy5yZXNvbHZlci5saXN0ZW5lckhhbmRsZXIgPSBsaXN0ZW5lckhhbmRsZXI7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhIGNvbW1hbmQuXG5cdCAqIEBtZXRob2Rcblx0ICogQG5hbWUgQ29tbWFuZEhhbmRsZXIjbG9hZFxuXHQgKiBAcGFyYW0ge3N0cmluZ3xDb21tYW5kfSB0aGluZyAtIE1vZHVsZSBvciBwYXRoIHRvIG1vZHVsZS5cblx0ICogQHJldHVybnMge0NvbW1hbmR9XG5cdCAqL1xuXG5cdC8qKlxuXHQgKiBSZWFkcyBhbGwgY29tbWFuZHMgZnJvbSB0aGUgZGlyZWN0b3J5IGFuZCBsb2FkcyB0aGVtLlxuXHQgKiBAbWV0aG9kXG5cdCAqIEBuYW1lIENvbW1hbmRIYW5kbGVyI2xvYWRBbGxcblx0ICogQHBhcmFtIHtzdHJpbmd9IFtkaXJlY3RvcnldIC0gRGlyZWN0b3J5IHRvIGxvYWQgZnJvbS5cblx0ICogRGVmYXVsdHMgdG8gdGhlIGRpcmVjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxuXHQgKiBAcGFyYW0ge0xvYWRQcmVkaWNhdGV9IFtmaWx0ZXJdIC0gRmlsdGVyIGZvciBmaWxlcywgd2hlcmUgdHJ1ZSBtZWFucyBpdCBzaG91bGQgYmUgbG9hZGVkLlxuXHQgKiBAcmV0dXJucyB7Q29tbWFuZEhhbmRsZXJ9XG5cdCAqL1xuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgY29tbWFuZC5cblx0ICogQG1ldGhvZFxuXHQgKiBAbmFtZSBDb21tYW5kSGFuZGxlciNyZW1vdmVcblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkIC0gSUQgb2YgdGhlIGNvbW1hbmQuXG5cdCAqIEByZXR1cm5zIHtDb21tYW5kfVxuXHQgKi9cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhbGwgY29tbWFuZHMuXG5cdCAqIEBtZXRob2Rcblx0ICogQG5hbWUgQ29tbWFuZEhhbmRsZXIjcmVtb3ZlQWxsXG5cdCAqIEByZXR1cm5zIHtDb21tYW5kSGFuZGxlcn1cblx0ICovXG5cblx0LyoqXG5cdCAqIFJlbG9hZHMgYSBjb21tYW5kLlxuXHQgKiBAbWV0aG9kXG5cdCAqIEBuYW1lIENvbW1hbmRIYW5kbGVyI3JlbG9hZFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBJRCBvZiB0aGUgY29tbWFuZC5cblx0ICogQHJldHVybnMge0NvbW1hbmR9XG5cdCAqL1xuXG5cdC8qKlxuXHQgKiBSZWxvYWRzIGFsbCBjb21tYW5kcy5cblx0ICogQG1ldGhvZFxuXHQgKiBAbmFtZSBDb21tYW5kSGFuZGxlciNyZWxvYWRBbGxcblx0ICogQHJldHVybnMge0NvbW1hbmRIYW5kbGVyfVxuXHQgKi9cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kSGFuZGxlck9wdGlvbnMgZXh0ZW5kcyBBa2Fpcm9IYW5kbGVyT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBSZWd1bGFyIGV4cHJlc3Npb24gdG8gYXV0b21hdGljYWxseSBtYWtlIGNvbW1hbmQgYWxpYXNlcy5cblx0ICogRm9yIGV4YW1wbGUsIHVzaW5nIGAvLS9nYCB3b3VsZCBtZWFuIHRoYXQgYWxpYXNlcyBjb250YWluaW5nIGAtYCB3b3VsZCBiZSB2YWxpZCB3aXRoIGFuZCB3aXRob3V0IGl0LlxuXHQgKiBTbywgdGhlIGFsaWFzIGBjb21tYW5kLW5hbWVgIGlzIHZhbGlkIGFzIGJvdGggYGNvbW1hbmQtbmFtZWAgYW5kIGBjb21tYW5kbmFtZWAuXG5cdCAqL1xuXHRhbGlhc1JlcGxhY2VtZW50PzogUmVnRXhwO1xuXG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byBhbGxvdyBtZW50aW9ucyB0byB0aGUgY2xpZW50IHVzZXIgYXMgYSBwcmVmaXguICovXG5cdGFsbG93TWVudGlvbj86IGJvb2xlYW4gfCBNZW50aW9uUHJlZml4UHJlZGljYXRlO1xuXG5cdC8qKiAgRGVmYXVsdCBhcmd1bWVudCBvcHRpb25zLiAqL1xuXHRhcmd1bWVudERlZmF1bHRzPzogRGVmYXVsdEFyZ3VtZW50T3B0aW9ucztcblxuXHQvKiogQXV0b21hdGljYWxseSBkZWZlciBtZXNzYWdlcyBcIkJvdE5hbWUgaXMgdGhpbmtpbmdcIiAqL1xuXHRhdXRvRGVmZXI/OiBib29sZWFuO1xuXG5cdC8qKiBTcGVjaWZ5IHdoZXRoZXIgdG8gcmVnaXN0ZXIgYWxsIHNsYXNoIGNvbW1hbmRzIHdoZW4gc3RhcnRpbmcgdGhlIGNsaWVudC4gKi9cblx0YXV0b1JlZ2lzdGVyU2xhc2hDb21tYW5kcz86IGJvb2xlYW47XG5cblx0LyoqIFdoZXRoZXIgb3Igbm90IHRvIGJsb2NrIGJvdHMuICovXG5cdGJsb2NrQm90cz86IGJvb2xlYW47XG5cblx0LyoqICBXaGV0aGVyIG9yIG5vdCB0byBibG9jayBzZWxmLiAqL1xuXHRibG9ja0NsaWVudD86IGJvb2xlYW47XG5cblx0LyoqIFdoZXRoZXIgb3Igbm90IHRvIGFzc2lnbiBgbWVzc2FnZS51dGlsYC4gKi9cblx0Y29tbWFuZFV0aWw/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBNaWxsaXNlY29uZHMgYSBtZXNzYWdlIHNob3VsZCBleGlzdCBmb3IgYmVmb3JlIGl0cyBjb21tYW5kIHV0aWwgaW5zdGFuY2UgaXMgbWFya2VkIGZvciByZW1vdmFsLlxuXHQgKiBJZiAwLCBDb21tYW5kVXRpbCBpbnN0YW5jZXMgd2lsbCBuZXZlciBiZSByZW1vdmVkIGFuZCB3aWxsIGNhdXNlIG1lbW9yeSB0byBpbmNyZWFzZSBpbmRlZmluaXRlbHkuXG5cdCAqL1xuXHRjb21tYW5kVXRpbExpZmV0aW1lPzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaW1lIGludGVydmFsIGluIG1pbGxpc2Vjb25kcyBmb3Igc3dlZXBpbmcgY29tbWFuZCB1dGlsIGluc3RhbmNlcy5cblx0ICogSWYgMCwgQ29tbWFuZFV0aWwgaW5zdGFuY2VzIHdpbGwgbmV2ZXIgYmUgcmVtb3ZlZCBhbmQgd2lsbCBjYXVzZSBtZW1vcnkgdG8gaW5jcmVhc2UgaW5kZWZpbml0ZWx5LlxuXHQgKi9cblx0Y29tbWFuZFV0aWxTd2VlcEludGVydmFsPzogbnVtYmVyO1xuXG5cdC8qKiBEZWZhdWx0IGNvb2xkb3duIGZvciBjb21tYW5kcy4gKi9cblx0ZGVmYXVsdENvb2xkb3duPzogbnVtYmVyO1xuXG5cdC8qKiBXaGV0aGVyIG9yIG5vdCBtZW1iZXJzIGFyZSBmZXRjaGVkIG9uIGVhY2ggbWVzc2FnZSBhdXRob3IgZnJvbSBhIGd1aWxkLiAqL1xuXHRmZXRjaE1lbWJlcnM/OiBib29sZWFuO1xuXG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byBoYW5kbGUgZWRpdGVkIG1lc3NhZ2VzIHVzaW5nIENvbW1hbmRVdGlsLiAqL1xuXHRoYW5kbGVFZGl0cz86IGJvb2xlYW47XG5cblx0LyoqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGNvb2xkb3duIG9yIGEgZnVuY3Rpb24gdG8gaWdub3JlLiBEZWZhdWx0cyB0byB0aGUgY2xpZW50IG93bmVyKHMpLiAqL1xuXHRpZ25vcmVDb29sZG93bj86IFNub3dmbGFrZSB8IFNub3dmbGFrZVtdIHwgSWdub3JlQ2hlY2tQcmVkaWNhdGU7XG5cblx0LyoqIElEIG9mIHVzZXIocykgdG8gaWdub3JlIGB1c2VyUGVybWlzc2lvbnNgIGNoZWNrcyBvciBhIGZ1bmN0aW9uIHRvIGlnbm9yZS4gKi9cblx0aWdub3JlUGVybWlzc2lvbnM/OiBTbm93Zmxha2UgfCBTbm93Zmxha2VbXSB8IElnbm9yZUNoZWNrUHJlZGljYXRlO1xuXG5cdC8qKiBUaGUgcHJlZml4KGVzKSBmb3IgY29tbWFuZCBwYXJzaW5nLiAqL1xuXHRwcmVmaXg/OiBzdHJpbmcgfCBzdHJpbmdbXSB8IFByZWZpeFN1cHBsaWVyO1xuXG5cdC8qKiBXaGV0aGVyIG9yIG5vdCB0byBzdG9yZSBtZXNzYWdlcyBpbiBDb21tYW5kVXRpbC4gKi9cblx0c3RvcmVNZXNzYWdlcz86IGJvb2xlYW47XG5cblx0LyoqIFNob3cgXCJCb3ROYW1lIGlzIHR5cGluZ1wiIGluZm9ybWF0aW9uIG1lc3NhZ2Ugb24gdGhlIHRleHQgY2hhbm5lbHMgd2hlbiBhIGNvbW1hbmQgaXMgcnVubmluZy4gKi9cblx0dHlwaW5nPzogYm9vbGVhbjtcblxuXHQvKiogV2hldGhlciBvciBub3QgdG8gdXNlIGV4ZWNTbGFzaCBmb3Igc2xhc2ggY29tbWFuZHMuICovXG5cdGV4ZWNTbGFzaD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGF0YSBmb3IgbWFuYWdpbmcgY29vbGRvd25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvb2xkb3duRGF0YSB7XG5cdC8qKiBXaGVuIHRoZSBjb29sZG93biBlbmRzLiAqL1xuXHRlbmQ6IG51bWJlcjtcblxuXHQvKiogVGltZW91dCBvYmplY3QuICovXG5cdHRpbWVyOiBOb2RlSlMuVGltZXI7XG5cblx0LyoqIE51bWJlciBvZiB0aW1lcyB0aGUgY29tbWFuZCBoYXMgYmVlbiB1c2VkLiAqL1xuXHR1c2VzOiBudW1iZXI7XG59XG5cbi8qKlxuICogVmFyaW91cyBwYXJzZWQgY29tcG9uZW50cyBvZiB0aGUgbWVzc2FnZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRDb21wb25lbnREYXRhIHtcblx0LyoqIFRoZSBjb250ZW50IHRvIHRoZSByaWdodCBvZiB0aGUgcHJlZml4LiAqL1xuXHRhZnRlclByZWZpeD86IHN0cmluZztcblxuXHQvKiogVGhlIGFsaWFzIHVzZWQuICovXG5cdGFsaWFzPzogc3RyaW5nO1xuXG5cdC8qKiBUaGUgY29tbWFuZCB1c2VkLiAqL1xuXHRjb21tYW5kPzogQ29tbWFuZDtcblxuXHQvKiogVGhlIGNvbnRlbnQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBhbGlhcy4gKi9cblx0Y29udGVudD86IHN0cmluZztcblxuXHQvKiogVGhlIHByZWZpeCB1c2VkLiAqL1xuXHRwcmVmaXg/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgd2hldGhlciB0aGlzIG1lc3NhZ2Ugc2hvdWxkIGJlIGlnbm9yZWQgZm9yIGEgY2VydGFpbiBjaGVjay5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBjaGVjay5cbiAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCB0byBjaGVjay5cbiAqL1xuZXhwb3J0IHR5cGUgSWdub3JlQ2hlY2tQcmVkaWNhdGUgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2UgfCBBa2Fpcm9NZXNzYWdlLFxuXHRjb21tYW5kOiBDb21tYW5kXG4pID0+IGJvb2xlYW47XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgd2hldGhlciBtZW50aW9ucyBjYW4gYmUgdXNlZCBhcyBhIHByZWZpeC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBvcHRpb24gZm9yLlxuICovXG5leHBvcnQgdHlwZSBNZW50aW9uUHJlZml4UHJlZGljYXRlID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlXG4pID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBwcmVmaXgoZXMpIHRvIHVzZS5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBnZXQgcHJlZml4IGZvci5cbiAqL1xuZXhwb3J0IHR5cGUgUHJlZml4U3VwcGxpZXIgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2VcbikgPT4gc3RyaW5nIHwgc3RyaW5nW10gfCBQcm9taXNlPHN0cmluZyB8IHN0cmluZ1tdPjtcbiJdfQ==
