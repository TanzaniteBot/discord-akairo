import {
	ApplicationCommandOptionData,
	Collection,
	CommandInteraction,
	Message,
	Snowflake,
	TextBasedChannels,
	User
} from "discord.js";
import _ from "lodash";
import AkairoError from "../../util/AkairoError";
import AkairoMessage from "../../util/AkairoMessage";
import Category from "../../util/Category";
import { BuiltInReasons, CommandHandlerEvents } from "../../util/Constants";
import Util from "../../util/Util";
import AkairoClient from "../AkairoClient";
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from "../AkairoHandler";
import AkairoModule from "../AkairoModule";
import InhibitorHandler from "../inhibitors/InhibitorHandler";
import ListenerHandler from "../listeners/ListenerHandler";
import { DefaultArgumentOptions } from "./arguments/Argument";
import TypeResolver from "./arguments/TypeResolver";
import Command, { KeySupplier } from "./Command";
import CommandUtil from "./CommandUtil";
import Flag from "./Flag";

/**
 * Loads commands and handles messages.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export default class CommandHandler extends AkairoHandler {
	constructor(
		client: AkairoClient,
		{
			directory,
			classToHandle = Command,
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
			execSlash = false,
			skipBuiltInPostInhibitors = false
		}: CommandHandlerOptions = {}
	) {
		if (!(classToHandle.prototype instanceof Command || classToHandle === Command)) {
			throw new AkairoError("INVALID_CLASS_TO_HANDLE", classToHandle.name, Command.name);
		}

		super(client, {
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		});

		this.autoRegisterSlashCommands = autoRegisterSlashCommands;

		this.typing = typing;

		this.autoDefer = autoDefer;

		this.resolver = new TypeResolver(this);

		this.aliases = new Collection();

		this.aliasReplacement = aliasReplacement;

		this.prefixes = new Collection();

		this.blockClient = !!blockClient;

		this.blockBots = !!blockBots;

		this.fetchMembers = !!fetchMembers;

		this.handleEdits = !!handleEdits;

		this.storeMessages = !!storeMessages;

		this.commandUtil = !!commandUtil;
		if ((this.handleEdits || this.storeMessages) && !this.commandUtil) {
			throw new AkairoError("COMMAND_UTIL_EXPLICIT");
		}

		this.commandUtilLifetime = commandUtilLifetime;

		this.commandUtilSweepInterval = commandUtilSweepInterval;
		if (this.commandUtilSweepInterval > 0) {
			setInterval(() => this.sweepCommandUtil(), this.commandUtilSweepInterval).unref();
		}

		this.commandUtils = new Collection();

		this.cooldowns = new Collection();

		this.defaultCooldown = defaultCooldown;

		this.ignoreCooldown = typeof ignoreCooldown === "function" ? ignoreCooldown.bind(this) : ignoreCooldown;

		this.ignorePermissions = typeof ignorePermissions === "function" ? ignorePermissions.bind(this) : ignorePermissions;

		this.prompts = new Collection();

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

		this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;

		this.allowMention = typeof allowMention === "function" ? allowMention.bind(this) : !!allowMention;

		this.inhibitorHandler = null;

		this.autoDefer = !!autoDefer;

		this.execSlash = !!execSlash;

		this.skipBuiltInPostInhibitors = !!skipBuiltInPostInhibitors;

		this.setup();
	}

	/**
	 * Collection of command aliases.
	 */
	public aliases: Collection<string, string>;

	/**
	 * Regular expression to automatically make command aliases for.
	 */
	public aliasReplacement?: RegExp;

	/**
	 * Whether or not mentions are allowed for prefixing.
	 */
	public allowMention: boolean | MentionPrefixPredicate;

	/**
	 * Default argument options.
	 */
	public argumentDefaults: DefaultArgumentOptions;

	/**
	 * Automatically defer messages "BotName is thinking".
	 */
	public autoDefer: boolean;

	/**
	 * Specify whether to register all slash commands when starting the client
	 */
	public autoRegisterSlashCommands: boolean;

	/**
	 * Whether or not to block bots.
	 */
	public blockBots: boolean;

	/**
	 * Whether or not to block self.
	 */
	public blockClient: boolean;

	/**
	 * Categories, mapped by ID to Category.
	 */
	public declare categories: Collection<string, Category<string, Command>>;

	/**
	 * Class to handle
	 */
	public declare classToHandle: typeof Command;

	/**
	 * The Akairo client.
	 */
	public declare client: AkairoClient;

	/**
	 * Whether or not `message.util` is assigned.
	 */
	public commandUtil: boolean;

	/**
	 * Milliseconds a message should exist for before its command util instance is marked for removal.
	 */
	public commandUtilLifetime: number;

	/**
	 * Collection of CommandUtils.
	 */
	public commandUtils: Collection<string, CommandUtil>;

	/**
	 * Time interval in milliseconds for sweeping command util instances.
	 */
	public commandUtilSweepInterval: number;

	/**
	 * Collection of cooldowns.
	 * <info>The elements in the collection are objects with user IDs as keys
	 * and {@link CooldownData} objects as values</info>
	 */
	public cooldowns: Collection<string, { [id: string]: CooldownData }>;

	/**
	 * Default cooldown for commands.
	 */
	public defaultCooldown: number;

	/**
	 * Directory to commands.
	 */
	public declare directory: string;

	/**
	 * Whether or not to use execSlash for slash commands.
	 */
	public execSlash: boolean;

	/**
	 * Whether or not members are fetched on each message author from a guild.
	 */
	public fetchMembers: boolean;

	/**
	 * Whether or not edits are handled.
	 */
	public handleEdits: boolean;

	/**
	 * ID of user(s) to ignore cooldown or a function to ignore.
	 */
	public ignoreCooldown: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 */
	public ignorePermissions: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * Inhibitor handler to use.
	 */
	public inhibitorHandler?: InhibitorHandler;

	/**
	 * Commands loaded, mapped by ID to Command.
	 */
	public declare modules: Collection<string, Command>;

	/**
	 * The prefix(es) for command parsing.
	 */
	public prefix: string | string[] | PrefixSupplier;

	/**
	 * Collection of prefix overwrites to commands.
	 */
	public prefixes: Collection<string | PrefixSupplier, Set<string>>;

	/**
	 * Collection of sets of ongoing argument prompts.
	 */
	public prompts: Collection<string, Set<string>>;

	/**
	 * The type resolver.
	 */
	public resolver: TypeResolver;

	/**
	 * Whether or not to store messages in CommandUtil.
	 */
	public storeMessages: boolean;

	/**
	 * Show "BotName is typing" information message on the text channels when a command is running.
	 */
	public typing: boolean;

	/**
	 * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
	 */
	public skipBuiltInPostInhibitors?: boolean;

	protected setup() {
		this.client.once("ready", () => {
			if (this.autoRegisterSlashCommands) this.registerInteractionCommands();

			this.client.on("messageCreate", async m => {
				if (m.partial) await m.fetch();

				this.handle(m);
			});

			if (this.handleEdits) {
				this.client.on("messageUpdate", async (o, m) => {
					if (o.partial) await o.fetch();
					if (m.partial) await m.fetch();
					if (o.content === m.content) return;

					if (this.handleEdits) this.handle(m as Message);
				});
			}
			this.client.on("interactionCreate", i => {
				if (!i.isCommand()) return;
				this.handleSlash(i);
			});
		});
	}

	protected async registerInteractionCommands() {
		const globalSlashCommandsParsed: {
			name: string;
			description: string;
			options: ApplicationCommandOptionData[];
			guilds: Snowflake[];
			defaultPermission: boolean;
		}[] = [];
		const guildSlashCommandsParsed: Collection<
			Snowflake,
			{
				name: string;
				description: string;
				options: ApplicationCommandOptionData[];
				defaultPermission: boolean;
			}[]
		> = new Collection();
		const parseDescriptionCommand = description => {
			if (typeof description === "object") {
				if (typeof description.content === "function") return description.content();
				if (typeof description.content === "string") return description.content;
			}
			return description;
		};
		for (const [, data] of this.modules) {
			if (!data.slash) continue;
			globalSlashCommandsParsed.push({
				name: data.aliases[0],
				description: parseDescriptionCommand(data.description),
				options: data.slashOptions,
				guilds: data.slashGuilds,
				defaultPermission: data.ownerOnly || data.superUserOnly || false
			});
		}

		for (const { name, description, options, guilds, defaultPermission } of globalSlashCommandsParsed) {
			for (const guildId of guilds) {
				guildSlashCommandsParsed.set(guildId, [
					...(guildSlashCommandsParsed.get(guildId) ?? []),
					{ name, description, options, defaultPermission }
				]);
			}
		}
		if (guildSlashCommandsParsed.size) {
			guildSlashCommandsParsed.each(async (value, key) => {
				const guild = this.client.guilds.cache.get(key);
				if (!guild) return;

				const currentCommands = (await guild.commands.fetch()).map(value1 => ({
					name: value1.name,
					description: value1.description,
					options: value1.options,
					defaultPermission: value1.defaultPermission
				}));

				if (!_.isEqual(currentCommands, value)) {
					await guild.commands.set(value);
				}
			});
		}

		const slashCommandsApp = globalSlashCommandsParsed
			.filter(({ guilds }) => !guilds.length)
			.map(({ name, description, options, defaultPermission }) => {
				return { name, description, options, defaultPermission };
			});
		const currentCommands = (await this.client.application?.commands.fetch()).map(value1 => ({
			name: value1.name,
			description: value1.description,
			options: value1.options,
			defaultPermission: value1.defaultPermission
		}));

		if (!_.isEqual(currentCommands, slashCommandsApp)) {
			await this.client.application?.commands.set(slashCommandsApp);
		}
	}

	/**
	 * Registers a module.
	 * @param command - Module to use.
	 * @param filepath - Filepath of module.
	 */
	public override register(command: Command, filepath?: string): void {
		super.register(command, filepath);

		for (let alias of command.aliases) {
			const conflict = this.aliases.get(alias.toLowerCase());
			if (conflict) throw new AkairoError("ALIAS_CONFLICT", alias, command.id, conflict);

			alias = alias.toLowerCase();
			this.aliases.set(alias, command.id);
			if (this.aliasReplacement) {
				const replacement = alias.replace(this.aliasReplacement, "");

				if (replacement !== alias) {
					const replacementConflict = this.aliases.get(replacement);
					if (replacementConflict)
						throw new AkairoError("ALIAS_CONFLICT", replacement, command.id, replacementConflict);
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
				this.prefixes = this.prefixes.sort((aVal, bVal, aKey, bKey) => Util.prefixCompare(aKey, bKey));
			}
		}
	}

	/**
	 * Deregisters a module.
	 * @param command - Module to use.
	 */
	public override deregister(command: Command): void {
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
	 * @param message - Message to handle.
	 */
	public async handle(message: Message): Promise<boolean | null> {
		try {
			if (this.fetchMembers && message.guild && !message.member && !message.webhookId) {
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
					message.util = new CommandUtil(this, message); // @ts-expect-error
					this.commandUtils.set(message.id, message.util);
				}
			}

			if (await this.runPreTypeInhibitors(message)) {
				return false;
			}

			let parsed = await this.parseCommand(message);
			if (!parsed.command) {
				const overParsed = await this.parseCommandOverwrittenPrefixes(message);
				if (overParsed.command || (parsed.prefix == null && overParsed.prefix != null)) {
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
				ran = await this.handleDirectCommand(message, parsed.content, parsed.command);
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
	 * @param interaction - Interaction to handle.
	 */
	// eslint-disable-next-line complexity
	public async handleSlash(interaction: CommandInteraction): Promise<boolean | null> {
		const command = this.findCommand(interaction.commandName);

		if (!command) {
			this.emit(CommandHandlerEvents.SLASH_NOT_FOUND, interaction);
			return false;
		}

		const message = new AkairoMessage(this.client, interaction, command);

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
				if (overParsed.command || (parsed.prefix == null && overParsed.prefix != null)) {
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
				convertedOptions[option.name] = interaction.options.get(option.name, option.required || false)?.value;
			}

			let key;
			try {
				// @ts-expect-error
				if (command.lock) key = command.lock(message, convertedOptions);
				if (Util.isPromise(key)) key = await key;
				if (key) {
					if (command.locker?.has(key)) {
						key = null;
						this.emit(CommandHandlerEvents.COMMAND_LOCKED, message, command);
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
				await interaction.deferReply({ ephemeral: command.slashEphemeral });
			}

			try {
				this.emit(CommandHandlerEvents.SLASH_STARTED, message, command, convertedOptions);
				const ret =
					Reflect.ownKeys(command).includes("execSlash") || this.execSlash
						? await command.execSlash(message, convertedOptions)
						: await command.exec(message as any, convertedOptions);
				this.emit(CommandHandlerEvents.SLASH_FINISHED, message, command, convertedOptions, ret);
				return true;
			} catch (err) {
				this.emit(CommandHandlerEvents.SLASH_ERROR, err, message, command);
				return false;
			}
		} catch (err) {
			this.emitError(err, message, command);
			return null;
		}
	}
	/**
	 * Handles normal commands.
	 * @param message - Message to handle.
	 * @param content - Content of message without command.
	 * @param command - Command instance.
	 * @param ignore - Ignore inhibitors and other checks.
	 */
	public async handleDirectCommand(
		message: Message,
		content: string,
		command: Command,
		ignore: boolean = false
	): Promise<boolean | null> {
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
				this.emit(CommandHandlerEvents.COMMAND_BREAKOUT, message, command, args.message);
				return this.handle(args.message);
			} else if (Flag.is(args, "continue")) {
				const continueCommand = this.modules.get(args.command);
				return this.handleDirectCommand(message, args.rest, continueCommand, args.ignore);
			}

			if (!ignore) {
				if (command.lock) key = (command.lock as KeySupplier)(message, args);
				if (Util.isPromise(key)) key = await key;
				if (key) {
					if (command.locker?.has(key)) {
						key = null;
						this.emit(CommandHandlerEvents.COMMAND_LOCKED, message, command);
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
	 * @param message - Message to handle.
	 */
	public async handleRegexAndConditionalCommands(message: Message): Promise<boolean> {
		const ran1 = await this.handleRegexCommands(message);
		const ran2 = await this.handleConditionalCommands(message);
		return ran1 || ran2;
	}

	/**
	 * Handles regex commands.
	 * @param message - Message to handle.
	 */
	public async handleRegexCommands(message: Message): Promise<boolean> {
		const hasRegexCommands = [];
		for (const command of this.modules.values()) {
			if (message.editedTimestamp ? command.editable : true) {
				const regex = typeof command.regex === "function" ? command.regex(message) : command.regex;
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
						if (Util.isPromise(before)) await before;

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
	 * @param message - Message to handle.
	 */
	public async handleConditionalCommands(message: Message): Promise<boolean> {
		const trueCommands = [];

		const filterPromises = [];
		for (const command of this.modules.values()) {
			if (message.editedTimestamp && !command.editable) continue;
			filterPromises.push(
				(async () => {
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
	 * @param message - Message to handle.
	 * @param slash - Whether or not the command should is a slash command.
	 */
	public async runAllTypeInhibitors(message: Message | AkairoMessage, slash: boolean = false): Promise<boolean> {
		const reason = this.inhibitorHandler ? await this.inhibitorHandler.test("all", message) : null;

		if (reason != null) {
			this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
		} else if (!message.author) {
			this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.AUTHOR_NOT_FOUND);
		} else if (this.blockClient && message.author.id === this.client.user?.id) {
			this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.CLIENT);
		} else if (this.blockBots && message.author.bot) {
			this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, BuiltInReasons.BOT);
		} else if (!slash && this.hasPrompt(message.channel, message.author)) {
			this.emit(CommandHandlerEvents.IN_PROMPT, message);
		} else {
			return false;
		}

		return true;
	}

	/**
	 * Runs inhibitors with the pre type.
	 * @param message - Message to handle.
	 */
	public async runPreTypeInhibitors(message: Message | AkairoMessage): Promise<boolean> {
		const reason = this.inhibitorHandler ? await this.inhibitorHandler.test("pre", message) : null;

		if (reason != null) {
			this.emit(CommandHandlerEvents.MESSAGE_BLOCKED, message, reason);
		} else {
			return false;
		}

		return true;
	}

	/**
	 * Runs inhibitors with the post type.
	 * @param message - Message to handle.
	 * @param command - Command to handle.
	 * @param slash - Whether or not the command should is a slash command.
	 */
	public async runPostTypeInhibitors(
		message: Message | AkairoMessage,
		command: Command,
		slash: boolean = false
	): Promise<boolean> {
		const event = slash ? CommandHandlerEvents.SLASH_BLOCKED : CommandHandlerEvents.COMMAND_BLOCKED;

		if (!this.skipBuiltInPostInhibitors) {
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
					this.emit(event, message, command, BuiltInReasons.SUPER_USER);
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

			if (command.onlyNsfw && !message.channel["nsfw"]) {
				this.emit(event, message, command, BuiltInReasons.NOT_NSFW);
				return true;
			}
		}

		if (!this.skipBuiltInPostInhibitors) {
			if (await this.runPermissionChecks(message, command, slash)) {
				return true;
			}
		}

		const reason = this.inhibitorHandler ? await this.inhibitorHandler.test("post", message, command) : null;

		if (this.skipBuiltInPostInhibitors) {
			if (await this.runPermissionChecks(message, command, slash)) {
				return true;
			}
		}

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
	 * @param message - Message that called the command.
	 * @param command - Command to cooldown.
	 * @param slash - Whether or not the command is a slash command.
	 */
	public async runPermissionChecks(
		message: Message | AkairoMessage,
		command: Command,
		slash: boolean = false
	): Promise<boolean> {
		if (command.clientPermissions) {
			if (typeof command.clientPermissions === "function") {
				// @ts-expect-error
				let missing = command.clientPermissions(message);
				if (Util.isPromise(missing)) missing = await missing;

				if (missing != null) {
					this.emit(
						slash ? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS : CommandHandlerEvents.MISSING_PERMISSIONS,
						message,
						command,
						"client",
						missing
					);
					return true;
				}
			} else if (message.guild) {
				if (message.channel?.type === "DM") return false;
				const missing = message.channel?.permissionsFor(message.guild.me)?.missing(command.clientPermissions);
				if (missing?.length) {
					this.emit(
						slash ? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS : CommandHandlerEvents.MISSING_PERMISSIONS,
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
					if (Util.isPromise(missing)) missing = await missing;

					if (missing != null) {
						this.emit(
							slash ? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS : CommandHandlerEvents.MISSING_PERMISSIONS,
							message,
							command,
							"user",
							missing
						);
						return true;
					}
				} else if (message.guild) {
					if (message.channel?.type === "DM") return false;
					const missing = message.channel?.permissionsFor(message.author)?.missing(command.userPermissions);
					if (missing?.length) {
						this.emit(
							slash ? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS : CommandHandlerEvents.MISSING_PERMISSIONS,
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
	 * @param message - Message that called the command.
	 * @param command - Command to cooldown.
	 */
	public runCooldowns(message: Message | AkairoMessage, command: Command): boolean {
		const id = message.author?.id;
		const ignorer = command.ignoreCooldown || this.ignoreCooldown;
		const isIgnored = Array.isArray(ignorer)
			? ignorer.includes(id)
			: typeof ignorer === "function"
			? ignorer(message, command)
			: id === ignorer;

		if (isIgnored) return false;

		const time = command.cooldown != null ? command.cooldown : this.defaultCooldown;
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
	 * @param message - Message to handle.
	 * @param command - Command to handle.
	 * @param args - Arguments to use.
	 */
	public async runCommand(message: Message, command: Command, args: any): Promise<void> {
		if (!command || !message) {
			this.emit(CommandHandlerEvents.COMMAND_INVALID, message, command);
			return;
		}
		if (command.typing || this.typing) {
			message.channel.sendTyping();
		}

		this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command, args);
		const ret = await command.exec(message, args);
		this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command, args, ret);
	}

	/**
	 * Parses the command and its argument list.
	 * @param message - Message that called the command.
	 */
	public async parseCommand(message: Message | AkairoMessage): Promise<ParsedComponentData> {
		const allowMention = await Util.intoCallable(this.prefix)(message);
		let prefixes = Util.intoArray(allowMention);
		if (allowMention) {
			const mentions = [`<@${this.client.user?.id}>`, `<@!${this.client.user?.id}>`];
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
	 * @param message - Message that called the command.
	 */
	public async parseCommandOverwrittenPrefixes(message: Message | AkairoMessage): Promise<ParsedComponentData> {
		if (!this.prefixes.size) {
			return {};
		}

		const promises = this.prefixes.map(async (cmds, provider) => {
			const prefixes = Util.intoArray(await Util.intoCallable(provider)(message));
			return prefixes.map(p => [p, cmds]);
		});

		const pairs = Util.flatMap(await Promise.all(promises), x => x);
		pairs.sort(([a], [b]) => Util.prefixCompare(a, b));
		return this.parseMultiplePrefixes(message, pairs);
	}

	/**
	 * Runs parseWithPrefix on multiple prefixes and returns the best parse.
	 * @param message - Message to parse.
	 * @param pairs - Pairs of prefix to associated commands. That is, `[string, Set<string> | null][]`.
	 */
	public parseMultiplePrefixes(
		message: Message | AkairoMessage,
		pairs: [string, Set<string> | null][]
	): ParsedComponentData {
		const parses = pairs.map(([prefix, cmds]) => this.parseWithPrefix(message, prefix, cmds));
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
	 * @param message - Message to parse.
	 * @param prefix - Prefix to use.
	 * @param associatedCommands - Associated commands.
	 */
	public parseWithPrefix(
		message: Message | AkairoMessage,
		prefix: string,
		associatedCommands: Set<string> | null = null
	): ParsedComponentData {
		const lowerContent = message.content.toLowerCase();
		if (!lowerContent.startsWith(prefix.toLowerCase())) {
			return {};
		}

		const endOfPrefix = lowerContent.indexOf(prefix.toLowerCase()) + prefix.length;
		const startOfArgs = message.content.slice(endOfPrefix).search(/\S/) + prefix.length;
		const alias = message.content.slice(startOfArgs).split(/\s{1,}|\n{1,}/)[0];
		const command = this.findCommand(alias);
		const content = message.content.slice(startOfArgs + alias.length + 1).trim();
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
	 * @param err - The error.
	 * @param message - Message that called the command.
	 * @param command - Command that errored.
	 */
	public emitError(err: Error, message: Message | AkairoMessage, command?: Command | AkairoModule): void {
		if (this.listenerCount(CommandHandlerEvents.ERROR)) {
			this.emit(CommandHandlerEvents.ERROR, err, message, command);
			return;
		}

		throw err;
	}

	/**
	 * Sweep command util instances from cache and returns amount sweeped.
	 * @param lifetime - Messages older than this will have their command util instance sweeped. This is in milliseconds and defaults to the `commandUtilLifetime` option.
	 */
	public sweepCommandUtil(lifetime: number = this.commandUtilLifetime): number {
		let count = 0;
		for (const commandUtil of this.commandUtils.values()) {
			const now = Date.now();
			const message = commandUtil.message;
			if (now - ((message as Message).editedTimestamp || message.createdTimestamp) > lifetime) {
				count++;
				this.commandUtils.delete(message.id);
			}
		}

		return count;
	}

	/**
	 * Adds an ongoing prompt in order to prevent command usage in the channel.
	 * @param channel - Channel to add to.
	 * @param user - User to add.
	 */
	public addPrompt(channel: TextBasedChannels, user: User): void {
		let users = this.prompts.get(channel.id);
		if (!users) this.prompts.set(channel.id, new Set());
		users = this.prompts.get(channel.id);
		users?.add(user.id);
	}

	/**
	 * Removes an ongoing prompt.
	 * @param channel - Channel to remove from.
	 * @param user - User to remove.
	 */
	public removePrompt(channel: TextBasedChannels, user: User): void {
		const users = this.prompts.get(channel.id);
		if (!users) return;
		users.delete(user.id);
		if (!users.size) this.prompts.delete(user.id);
	}

	/**
	 * Checks if there is an ongoing prompt.
	 * @param channel - Channel to check.
	 * @param user - User to check.
	 */
	public hasPrompt(channel: TextBasedChannels, user: User): boolean {
		const users = this.prompts.get(channel.id);
		if (!users) return false;
		return users.has(user.id);
	}

	/**
	 * Finds a command by alias.
	 * @param name - Alias to find with.
	 */
	public findCommand(name: string): Command {
		return this.modules.get(this.aliases.get(name.toLowerCase()));
	}

	/**
	 * Set the inhibitor handler to use.
	 * @param inhibitorHandler - The inhibitor handler.
	 */
	public useInhibitorHandler(inhibitorHandler: InhibitorHandler): CommandHandler {
		this.inhibitorHandler = inhibitorHandler;
		this.resolver.inhibitorHandler = inhibitorHandler;

		return this;
	}

	/**
	 * Set the listener handler to use.
	 * @param listenerHandler - The listener handler.
	 */
	public useListenerHandler(listenerHandler: ListenerHandler): CommandHandler {
		this.resolver.listenerHandler = listenerHandler;

		return this;
	}

	/**
	 * Loads a command.
	 * @param thing - Module or path to module.
	 */
	public override load(thing: string | Command): Command {
		return super.load(thing) as Command;
	}

	/**
	 * Reads all commands from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	public override loadAll(directory?: string, filter?: LoadPredicate): CommandHandler {
		return super.loadAll(directory, filter) as CommandHandler;
	}

	/**
	 * Removes a command.
	 * @param id - ID of the command.
	 */
	public override remove(id: string): Command {
		return super.remove(id) as Command;
	}

	/**
	 * Removes all commands.
	 */
	public override removeAll(): CommandHandler {
		return super.removeAll() as CommandHandler;
	}

	/**
	 * Reloads a command.
	 * @param id - ID of the command.
	 */
	public override reload(id: string): Command {
		return super.reload(id) as Command;
	}

	/**
	 * Reloads all commands.
	 */
	public override reloadAll(): CommandHandler {
		return super.reloadAll() as CommandHandler;
	}
}

export interface CommandHandlerOptions extends AkairoHandlerOptions {
	/**
	 * Regular expression to automatically make command aliases.
	 * For example, using `/-/g` would mean that aliases containing `-` would be valid with and without it.
	 * So, the alias `command-name` is valid as both `command-name` and `commandname`.
	 */
	aliasReplacement?: RegExp;

	/**
	 * Whether or not to allow mentions to the client user as a prefix.
	 */
	allowMention?: boolean | MentionPrefixPredicate;

	/**
	 * Default argument options.
	 */
	argumentDefaults?: DefaultArgumentOptions;

	/**
	 * Automatically defer messages "BotName is thinking"
	 */
	autoDefer?: boolean;

	/**
	 * Specify whether to register all slash commands when starting the client.
	 */
	autoRegisterSlashCommands?: boolean;

	/**
	 * Whether or not to block bots.
	 */
	blockBots?: boolean;

	/**
	 * Whether or not to block self.
	 */
	blockClient?: boolean;

	/**
	 * Whether or not to assign `message.util`.
	 */
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

	/**
	 * Default cooldown for commands.
	 */
	defaultCooldown?: number;

	/**
	 * Whether or not members are fetched on each message author from a guild.
	 */
	fetchMembers?: boolean;

	/**
	 * Whether or not to handle edited messages using CommandUtil.
	 */
	handleEdits?: boolean;

	/**
	 * ID of user(s) to ignore cooldown or a function to ignore. Defaults to the client owner(s).
	 */
	ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 */
	ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * The prefix(es) for command parsing.
	 */
	prefix?: string | string[] | PrefixSupplier;

	/**
	 * Whether or not to store messages in CommandUtil.
	 */
	storeMessages?: boolean;

	/**
	 * Show "BotName is typing" information message on the text channels when a command is running.
	 */
	typing?: boolean;

	/**
	 * Whether or not to use execSlash for slash commands.
	 */
	execSlash?: boolean;

	/**
	 * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
	 */
	skipBuiltInPostInhibitors?: boolean;
}

/**
 * Data for managing cooldowns.
 */
export interface CooldownData {
	/**
	 * When the cooldown ends.
	 */
	end: number;

	/**
	 * Timeout object.
	 */
	timer: NodeJS.Timer;

	/**
	 * Number of times the command has been used.
	 */
	uses: number;
}

/**
 * Various parsed components of the message.
 */
export interface ParsedComponentData {
	/**
	 * The content to the right of the prefix.
	 */
	afterPrefix?: string;

	/**
	 * The alias used.
	 */
	alias?: string;

	/**
	 * The command used.
	 */
	command?: Command;

	/**
	 * The content to the right of the alias.
	 */
	content?: string;

	/**
	 * The prefix used.
	 */
	prefix?: string;
}

/**
 * A function that returns whether this message should be ignored for a certain check.
 * @param message - Message to check.
 * @param command - Command to check.
 */
export type IgnoreCheckPredicate = (message: Message | AkairoMessage, command: Command) => boolean;

/**
 * A function that returns whether mentions can be used as a prefix.
 * @param message - Message to option for.
 */
export type MentionPrefixPredicate = (message: Message) => boolean | Promise<boolean>;

/**
 * A function that returns the prefix(es) to use.
 * @param message - Message to get prefix for.
 */
export type PrefixSupplier = (message: Message) => string | string[] | Promise<string | string[]>;
