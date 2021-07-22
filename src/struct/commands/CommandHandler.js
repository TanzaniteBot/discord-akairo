// @ts-check
"use strict";

/**
 * @typedef {import("discord.js").Snowflake} Snowflake
 * @typedef {import("discord.js").Channel} Channel
 * @typedef {import("discord.js").User} User
 * @typedef {import("discord.js").CommandInteraction} CommandInteraction
 * @typedef {import("discord.js").PartialMessage} PartialMessage
 * @typedef {import("../AkairoHandler").AkairoHandlerOptions} AkairoHandlerOptions
 * @typedef {import("../AkairoClient").default} AkairoClient
 * @typedef {import("./arguments/Argument").DefaultArgumentOptions} DefaultArgumentOptions
 * @typedef {import("../inhibitors/InhibitorHandler").default} InhibitorHandler
 * @typedef {import("../listeners/ListenerHandler").default} ListenerHandler
 * @typedef {import("../AkairoModule").default} AkairoModule
 * @typedef {import("./CommandUtil").Message} Message
 */

import AkairoError from "../../util/AkairoError";
import AkairoHandler from "../AkairoHandler";
import { BuiltInReasons } from "../../util/Constants";
import { CommandHandlerEvents } from "../../util/Constants";
import { Collection } from "discord.js";
import Command from "./Command";
import CommandUtil from "./CommandUtil";
import Flag from "./Flag";
import Util from "../../util/Util";
import AkairoMessage from "../../util/AkairoMessage";
import TypeResolver from "./arguments/TypeResolver";

/**
 * Loads commands and handles messages.
 * @param {AkairoClient} client - The Akairo client.
 * @param {CommandHandlerOptions} options - Options.
 * @extends {AkairoHandler}
 */
export default class CommandHandler extends AkairoHandler {
	constructor(
		client,
		{
			// @ts-expect-error
			directory,
			classToHandle = Command,
			extensions = [".js", ".ts"],
			// @ts-expect-error
			automateCategories,
			// @ts-expect-error
			loadFilter,
			blockClient = true,
			blockBots = true,
			fetchMembers = false,
			handleEdits = false,
			storeMessages = false,
			// @ts-expect-error
			commandUtil,
			commandUtilLifetime = 3e5,
			commandUtilSweepInterval = 3e5,
			defaultCooldown = 0,
			ignoreCooldown = client.ownerID,
			ignorePermissions = [],
			argumentDefaults = {},
			prefix = "!",
			allowMention = true,
			// @ts-expect-error
			aliasReplacement,
			autoDefer = false,
			typing = false,
			autoRegisterSlashCommands = false,
			execSlash = false
		} = {}
	) {
		if (
			!(classToHandle.prototype instanceof Command || classToHandle === Command)
		) {
			throw new AkairoError(
				"INVALID_CLASS_TO_HANDLE",
				classToHandle.name,
				Flag.name
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
		this.resolver = new TypeResolver(this);

		/**
		 * Collection of command aliases.
		 * @type {Collection<string, string>}
		 */
		this.aliases = new Collection();

		/**
		 * Regular expression to automatically make command aliases for.
		 * @type {?RegExp}
		 */
		this.aliasReplacement = aliasReplacement;

		/**
		 * Collection of prefix overwrites to commands.
		 * @type {Collection<string|PrefixSupplier, Set<string>>}
		 */
		this.prefixes = new Collection();

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
			throw new AkairoError("COMMAND_UTIL_EXPLICIT");
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
		this.commandUtils = new Collection();

		/**
		 * Collection of cooldowns.
		 * <info>The elements in the collection are objects with user IDs as keys
		 * and {@link CooldownData} objects as values</info>
		 * @type {Collection<string, Object>}
		 */
		this.cooldowns = new Collection();

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
				? // @ts-expect-error
				  ignorePermissions.bind(this)
				: ignorePermissions;

		/**
		 * Collection of sets of ongoing argument prompts.
		 * @type {Collection<string, Set<string>>}
		 */
		this.prompts = new Collection();

		/**
		 * Default argument options.
		 * @type {DefaultArgumentOptions}
		 */
		this.argumentDefaults = Util.deepAssign(
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
		// @ts-expect-error
		this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;

		/**
		 * Whether or not mentions are allowed for prefixing.
		 * @type {boolean|MentionPrefixPredicate}
		 */
		this.allowMention =
			typeof allowMention === "function"
				? // @ts-expect-error
				  allowMention.bind(this)
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
					// @ts-expect-error
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
			// @ts-expect-error
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
					// @ts-expect-error
					name: data.aliases[0],
					// @ts-expect-error
					description: parseDescriptionCommand(data.description),
					// @ts-expect-error
					options: data.slashOptions,
					// @ts-expect-error
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

		this.client.application.commands.set(slashCommandsApp);
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
				throw new AkairoError("ALIAS_CONFLICT", alias, command.id, conflict);

			alias = alias.toLowerCase();
			this.aliases.set(alias, command.id);
			if (this.aliasReplacement) {
				const replacement = alias.replace(this.aliasReplacement, "");

				if (replacement !== alias) {
					const replacementConflict = this.aliases.get(replacement);
					if (replacementConflict)
						throw new AkairoError(
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
					Util.prefixCompare(aKey, bKey)
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
					if (prefixes.size === 1) {
						this.prefixes.delete(prefix);
					} else {
						prefixes.delete(prefix);
					}
				}
			} else {
				const prefixes = this.prefixes.get(command.prefix);
				if (prefixes.size === 1) {
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
					message.util = this.commandUtils.get(message.id);
				} else {
					message.util = new CommandUtil(this, message);
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
				this.emit(CommandHandlerEvents.MESSAGE_INVALID, message);
				return false;
			}

			return ran;
		} catch (err) {
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
			this.emit(CommandHandlerEvents.SLASH_NOT_FOUND, interaction);
			return false;
		}

		const message = new AkairoMessage(this.client, interaction, {
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
					message.util = new CommandUtil(this, message);
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
			for (const option of command.slashOptions){
				convertedOptions[option.name] = interaction.options.get(option.name, option.required||false)
			}
			// for (const option of interaction.options.values()) {
			// 	if (option.member) convertedOptions[option.name] = option.member;
			// 	else if (option.channel) convertedOptions[option.name] = option.channel;
			// 	else if (option.role) convertedOptions[option.name] = option.role;
			// 	else convertedOptions[option.name] = option.value;
			// }

			let key;
			try {
				if (command.lock) key = command.lock(message, convertedOptions);
				if (Util.isPromise(key)) key = await key;
				if (key) {
					if (command.locker.has(key)) {
						key = null;
						this.emit(CommandHandlerEvents.COMMAND_LOCKED, message, command);
						return true;
					}
					command.locker.add(key);
				}
			} catch (err) {
				this.emitError(err, message, command);
			} finally {
				if (key) command.locker.delete(key);
			}

			if (this.autoDefer || command.slashEphemeral) {
				await interaction.defer({ ephemeral: command.slashEphemeral });
			}

			try {
				this.emit(
					CommandHandlerEvents.SLASH_STARTED,
					message,
					command,
					convertedOptions
				);
				const ret =
					// @ts-expect-error
					command.execSlash || this.execSlash
						? // @ts-expect-error
						  await command.execSlash(message, convertedOptions)
						: await command.exec(message, convertedOptions);
				this.emit(
					CommandHandlerEvents.SLASH_FINISHED,
					message,
					command,
					convertedOptions,
					ret
				);
				return true;
			} catch (err) {
				this.emit(CommandHandlerEvents.SLASH_ERROR, err, message, command);
				return false;
			}
		} catch (err) {
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
			if (Util.isPromise(before)) await before;

			const args = await command.parse(message, content);
			if (Flag.is(args, "cancel")) {
				this.emit(CommandHandlerEvents.COMMAND_CANCELLED, message, command);
				return true;
			} else if (Flag.is(args, "retry")) {
				this.emit(
					CommandHandlerEvents.COMMAND_BREAKOUT,
					message,
					command,
					args.message
				);
				return this.handle(args.message);
			} else if (Flag.is(args, "continue")) {
				const continueCommand = this.modules.get(args.command);
				return this.handleDirectCommand(
					message,
					args.rest,
					// @ts-expect-error
					continueCommand,
					args.ignore
				);
			}

			if (!ignore) {
				if (command.lock) key = command.lock(message, args);
				if (Util.isPromise(key)) key = await key;
				if (key) {
					if (command.locker.has(key)) {
						key = null;
						this.emit(CommandHandlerEvents.COMMAND_LOCKED, message, command);
						return true;
					}

					command.locker.add(key);
				}
			}

			await this.runCommand(message, command, args);
			return true;
		} catch (err) {
			this.emitError(err, message, command);
			return null;
		} finally {
			if (key) command.locker.delete(key);
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
			if (
				message.editedTimestamp
					? // @ts-expect-error
					  command.editable
					: true
			) {
				const regex =
					// @ts-expect-error
					typeof command.regex === "function"
						? // @ts-expect-error
						  command.regex(message)
						: // @ts-expect-error
						  command.regex;
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
						// @ts-expect-error
						if (await this.runPostTypeInhibitors(message, command)) return;
						// @ts-expect-error
						const before = command.before(message);
						if (Util.isPromise(before)) await before;
						// @ts-expect-error
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
			if (
				message.editedTimestamp &&
				// @ts-expect-error
				!command.editable
			)
				continue;
			filterPromises.push(
				(async () => {
					// @ts-expect-error
					let cond = command.condition(message);
					if (Util.isPromise(cond)) cond = await cond;
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
						if (Util.isPromise(before)) await before;
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
			this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
		} else if (!message.author) {
			this.emit(
				CommandHandlerEvents.MESSAGE_BLOCKED,
				message,
				BuiltInReasons.AUTHOR_NOT_FOUND
			);
		} else if (this.blockClient && message.author.id === this.client.user.id) {
			this.emit(
				CommandHandlerEvents.MESSAGE_BLOCKED,
				message,
				BuiltInReasons.CLIENT
			);
		} else if (this.blockBots && message.author.bot) {
			this.emit(
				CommandHandlerEvents.MESSAGE_BLOCKED,
				message,
				BuiltInReasons.BOT
			);
			// @ts-expect-error
		} else if (!slash && this.hasPrompt(message.channel, message.author)) {
			this.emit(CommandHandlerEvents.IN_PROMPT, message);
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
			this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
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
			? CommandHandlerEvents.SLASH_BLOCKED
			: CommandHandlerEvents.COMMAND_BLOCKED;

		if (command.ownerOnly) {
			const isOwner = this.client.isOwner(message.author);
			if (!isOwner) {
				this.emit(event, message, command, BuiltInReasons.OWNER);
				return true;
			}
		}

		if (command.superUserOnly) {
			const isSuperUser = this.client.isSuperUser(message.author);
			if (!isSuperUser) {
				this.emit(event, message, command, BuiltInReasons.OWNER);
				return true;
			}
		}

		if (command.channel === "guild" && !message.guild) {
			this.emit(event, message, command, BuiltInReasons.GUILD);
			return true;
		}

		if (command.channel === "dm" && message.guild) {
			this.emit(event, message, command, BuiltInReasons.DM);
			return true;
		}

		// @ts-expect-error
		if (command.onlyNsfw && !message.channel.nsfw) {
			this.emit(event, message, command, BuiltInReasons.NOT_NSFW);
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
				let missing = command.clientPermissions(message);
				if (Util.isPromise(missing)) missing = await missing;

				if (missing != null) {
					this.emit(
						slash
							? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS
							: CommandHandlerEvents.MISSING_PERMISSIONS,
						message,
						command,
						"client",
						missing
					);
					return true;
				}
			} else if (message.guild) {
				if (message.channel.type === "DM") return false;
				const missing = message.channel
					.permissionsFor(this.client.user)
					?.missing(command.clientPermissions);
				if (missing?.length) {
					this.emit(
						slash
							? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS
							: CommandHandlerEvents.MISSING_PERMISSIONS,
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
					let missing = command.userPermissions(message);
					if (Util.isPromise(missing)) missing = await missing;

					if (missing != null) {
						this.emit(
							slash
								? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS
								: CommandHandlerEvents.MISSING_PERMISSIONS,
							message,
							command,
							"user",
							missing
						);
						return true;
					}
				} else if (message.guild) {
					if (message.channel.type === "DM") return false;
					const missing = message.channel
						.permissionsFor(message.author)
						?.missing(command.userPermissions);
					if (missing?.length) {
						this.emit(
							slash
								? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS
								: CommandHandlerEvents.MISSING_PERMISSIONS,
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

			this.emit(CommandHandlerEvents.COOLDOWN, message, command, diff);
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
			this.emit(CommandHandlerEvents.COMMAND_INVALID, message, command);
			return;
		}
		if (command.typing || this.typing) {
			message.channel.sendTyping();
		}

		this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command, args);
		const ret = await command.exec(message, args);
		this.emit(
			CommandHandlerEvents.COMMAND_FINISHED,
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
		const allowMention = await Util.intoCallable(this.prefix)(message);
		let prefixes = Util.intoArray(allowMention);
		if (allowMention) {
			const mentions = [
				`<@${this.client.user.id}>`,
				`<@!${this.client.user.id}>`
			];
			prefixes = [...mentions, ...prefixes];
		}

		prefixes.sort(Util.prefixCompare);
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
			// @ts-expect-error
			return {};
		}

		const promises = this.prefixes.map(async (cmds, provider) => {
			const prefixes = Util.intoArray(
				await Util.intoCallable(provider)(message)
			);
			return prefixes.map(p => [p, cmds]);
		});

		const pairs = Util.flatMap(await Promise.all(promises), x => x);
		pairs.sort(([a], [b]) => Util.prefixCompare(a, b));
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

		// @ts-expect-error
		return {};
	}

	/**
	 * Tries to parse a message with the given prefix and associated commands.
	 * Associated commands refer to when a prefix is used in prefix overrides.
	 * @param {Message|AkairoMessage} message - Message to parse.
	 * @param {string} prefix - Prefix to use.
	 * @param {Set<string>} [associatedCommands=null] - Associated commands.
	 * @returns {ParsedComponentData}
	 */
	parseWithPrefix(message, prefix, associatedCommands = null) {
		const lowerContent = message.content.toLowerCase();
		if (!lowerContent.startsWith(prefix.toLowerCase())) {
			// @ts-expect-error
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
			// @ts-expect-error
			return { prefix, alias, content, afterPrefix };
		}

		if (associatedCommands == null) {
			if (command.prefix != null) {
				// @ts-expect-error
				return { prefix, alias, content, afterPrefix };
			}
		} else if (!associatedCommands.has(command.id)) {
			// @ts-expect-error
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
		if (this.listenerCount(CommandHandlerEvents.ERROR)) {
			this.emit(CommandHandlerEvents.ERROR, err, message, command);
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
				// @ts-expect-error
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
		users.add(user.id);
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
		// @ts-expect-error
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

	/**
	 * Loads a command.
	 * @method
	 * @name CommandHandler#load
	 * @param {string|Command} thing - Module or path to module.
	 * @returns {Command}
	 */

	/**
	 * Reads all commands from the directory and loads them.
	 * @method
	 * @name CommandHandler#loadAll
	 * @param {string} [directory] - Directory to load from.
	 * Defaults to the directory passed in the constructor.
	 * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
	 * @returns {CommandHandler}
	 */

	/**
	 * Removes a command.
	 * @method
	 * @name CommandHandler#remove
	 * @param {string} id - ID of the command.
	 * @returns {Command}
	 */

	/**
	 * Removes all commands.
	 * @method
	 * @name CommandHandler#removeAll
	 * @returns {CommandHandler}
	 */

	/**
	 * Reloads a command.
	 * @method
	 * @name CommandHandler#reload
	 * @param {string} id - ID of the command.
	 * @returns {Command}
	 */

	/**
	 * Reloads all commands.
	 * @method
	 * @name CommandHandler#reloadAll
	 * @returns {CommandHandler}
	 */
}

/**
 * Emitted when a message is blocked by a pre-message inhibitor.
 * The built-in inhibitors are "client" and "bot".
 * @event CommandHandler#messageBlocked
 * @param {Message} message - Message sent.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when a message does not start with the prefix or match a command.
 * @event CommandHandler#messageInvalid
 * @param {Message} message - Message sent.
 */

/**
 * Emitted when a command is found disabled.
 * @event CommandHandler#commandDisabled
 * @param {Message} message - Message sent.
 * @param {Command} command - Command found.
 */

/**
 * Emitted when a command is blocked by a post-message inhibitor.
 * The built-in inhibitors are "owner", "guild", and "dm".
 * @event CommandHandler#commandBlocked
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {string} reason - Reason for the block.
 */

/**
 * Emitted when a command starts execution.
 * @event CommandHandler#commandStarted
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {any} args - The args passed to the command.
 */

/**
 * Emitted when a command finishes execution.
 * @event CommandHandler#commandFinished
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {any} args - The args passed to the command.
 * @param {any} returnValue - The command's return value.
 */

/**
 * Emitted when a command is cancelled via prompt or argument cancel.
 * @event CommandHandler#commandCancelled
 * @param {Message} message - Message sent.
 * @param {Command} command - Command executed.
 * @param {?Message} retryMessage - Message to retry with.
 * This is passed when a prompt was broken out of with a message that looks like a command.
 */

/**
 * Emitted when a command is found on cooldown.
 * @event CommandHandler#cooldown
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {number} remaining - Remaining time in milliseconds for cooldown.
 */

/**
 * Emitted when a user is in a command argument prompt.
 * Used to prevent usage of commands during a prompt.
 * @event CommandHandler#inPrompt
 * @param {Message} message - Message sent.
 */

/**
 * Emitted when a permissions check is failed.
 * @event CommandHandler#missingPermissions
 * @param {Message} message - Message sent.
 * @param {Command} command - Command blocked.
 * @param {string} type - Either "client" or "user".
 * @param {any} missing - The missing permissions.
 */

/**
 * Emitted when a command or inhibitor errors.
 * @event CommandHandler#error
 * @param {Error} error - The error.
 * @param {Message} message - Message sent.
 * @param {?Command} command - Command executed.
 */

/**
 * Emitted when a command is loaded.
 * @event CommandHandler#load
 * @param {Command} command - Module loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a command is removed.
 * @event CommandHandler#remove
 * @param {Command} command - Command removed.
 */

/**
 * Also includes properties from AkairoHandlerOptions.
 * @typedef {AkairoHandlerOptions} CommandHandlerOptions
 * @prop {boolean} [blockClient=true] - Whether or not to block self.
 * @prop {boolean} [blockBots=true] - Whether or not to block bots.
 * @prop {string|string[]|PrefixSupplier} [prefix="!"] - Default command prefix(es).
 * @prop {boolean|MentionPrefixPredicate} [allowMention=true] - Whether or not to allow mentions to the client user as a prefix.
 * @prop {RegExp} [aliasReplacement] - Regular expression to automatically make command aliases.
 * For example, using `/-/g` would mean that aliases containing `-` would be valid with and without it.
 * So, the alias `command-name` is valid as both `command-name` and `commandname`.
 * @prop {boolean} [handleEdits=false] - Whether or not to handle edited messages using CommandUtil.
 * @prop {boolean} [storeMessages=false] - Whether or not to have CommandUtil store all prompts and their replies.
 * @prop {boolean} [commandUtil=false] - Whether or not to assign `message.util`.
 * @prop {number} [commandUtilLifetime=3e5] - Milliseconds a message should exist for before its command util instance is marked for removal.
 * If 0, CommandUtil instances will never be removed and will cause memory to increase indefinitely.
 * @prop {number} [commandUtilSweepInterval=3e5] - Time interval in milliseconds for sweeping command util instances.
 * If 0, CommandUtil instances will never be removed and will cause memory to increase indefinitely.
 * @prop {boolean} [fetchMembers=false] - Whether or not to fetch member on each message from a guild.
 * @prop {number} [defaultCooldown=0] - The default cooldown for commands.
 * @prop {Snowflake|Snowflake[]|IgnoreCheckPredicate} [ignoreCooldown] - ID of user(s) to ignore cooldown or a function to ignore.
 * Defaults to the client owner(s).
 * @prop {Snowflake|Snowflake[]|IgnoreCheckPredicate} [ignorePermissions=[]] - ID of user(s) to ignore `userPermissions` checks or a function to ignore.
 * @prop {DefaultArgumentOptions} [argumentDefaults] - The default argument options.
 */

/**
 * Data for managing cooldowns.
 * @typedef {Object} CooldownData
 * @prop {NodeJS.Timer} timer - Timeout object.
 * @prop {number} end - When the cooldown ends.
 * @prop {number} uses - Number of times the command has been used.
 */

/**
 * Various parsed components of the message.
 * @typedef {Object} ParsedComponentData
 * @prop {?Command} command - The command used.
 * @prop {?string} prefix - The prefix used.
 * @prop {?string} alias - The alias used.
 * @prop {?string} content - The content to the right of the alias.
 * @prop {?string} afterPrefix - The content to the right of the prefix.
 */

/**
 * A function that returns whether this message should be ignored for a certain check.
 * @typedef {Function} IgnoreCheckPredicate
 * @param {Message} message - Message to check.
 * @param {Command} command - Command to check.
 * @returns {boolean}
 */

/**
 * A function that returns whether mentions can be used as a prefix.
 * @typedef {Function} MentionPrefixPredicate
 * @param {Message} message - Message to option for.
 * @returns {boolean}
 */

/**
 * A function that returns the prefix(es) to use.
 * @typedef {Function} PrefixSupplier
 * @param {Message} message - Message to get prefix for.
 * @returns {string|string[]}
 */
