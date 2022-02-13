import {
	ApplicationCommand,
	ApplicationCommandData,
	ApplicationCommandOptionData,
	AutocompleteInteraction,
	Awaitable,
	Collection,
	CommandInteraction,
	CommandInteractionOption,
	CommandInteractionOptionResolver,
	DiscordAPIError,
	Guild,
	GuildApplicationCommandPermissionData,
	GuildResolvable,
	Message,
	Snowflake,
	TextBasedChannel,
	User
} from "discord.js";
import { ApplicationCommandOptionTypes, ApplicationCommandTypes } from "discord.js/typings/enums";
import type { CommandHandlerEvents as CommandHandlerEventsType } from "../../typings/events";
import { AkairoError } from "../../util/AkairoError.js";
import { AkairoMessage } from "../../util/AkairoMessage.js";
import type { Category } from "../../util/Category.js";
import { BuiltInReasons, CommandHandlerEvents } from "../../util/Constants.js";
import { isStringArrayStringOrFunc, Util } from "../../util/Util.js";
import { AkairoClient } from "../AkairoClient.js";
import { AkairoHandler, AkairoHandlerOptions, LoadPredicate } from "../AkairoHandler.js";
import type { AkairoModule } from "../AkairoModule.js";
import { ContextMenuCommandHandler } from "../contextMenuCommands/ContextMenuCommandHandler.js";
import type { InhibitorHandler } from "../inhibitors/InhibitorHandler.js";
import type { ListenerHandler } from "../listeners/ListenerHandler.js";
import type { TaskHandler } from "../tasks/TaskHandler.js";
import type { DefaultArgumentOptions } from "./arguments/Argument.js";
import { TypeResolver } from "./arguments/TypeResolver.js";
import {
	AkairoApplicationCommandChannelOptionData,
	AkairoApplicationCommandChoicesData,
	AkairoApplicationCommandNonOptionsData,
	AkairoApplicationCommandSubCommandData,
	AkairoApplicationCommandSubGroupData,
	Command,
	KeySupplier
} from "./Command";
import { CommandUtil } from "./CommandUtil.js";
import { Flag, FlagType } from "./Flag.js";

/**
 * Loads commands and handles messages.
 */
export class CommandHandler extends AkairoHandler {
	/**
	 * Collection of command aliases.
	 */
	public declare aliases: Collection<string, string>;

	/**
	 * Regular expression to automatically make command aliases for.
	 */
	public declare aliasReplacement?: RegExp;

	/**
	 * Whether or not mentions are allowed for prefixing.
	 */
	public declare allowMention: boolean | MentionPrefixPredicate;

	/**
	 * Default argument options.
	 */
	public declare argumentDefaults: DefaultArgumentOptions;

	/**
	 * Automatically defer messages "BotName is thinking".
	 */
	public declare autoDefer: boolean;

	/**
	 * Specify whether to register all slash commands when starting the client
	 */
	public declare autoRegisterSlashCommands: boolean;

	/**
	 * Whether or not to block bots.
	 */
	public declare blockBots: boolean;

	/**
	 * Whether or not to block self.
	 */
	public declare blockClient: boolean;

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
	public declare commandUtil: boolean;

	/**
	 * Milliseconds a message should exist for before its command util instance is marked for removal.
	 */
	public declare commandUtilLifetime: number;

	/**
	 * Collection of CommandUtils.
	 */
	public declare commandUtils: Collection<string, CommandUtil<Message | AkairoMessage>>;

	/**
	 * Time interval in milliseconds for sweeping command util instances.
	 */
	public declare commandUtilSweepInterval: number;

	/**
	 * Collection of cooldowns.
	 * <info>The elements in the collection are objects with user IDs as keys
	 * and {@link CooldownData} objects as values</info>
	 */
	public declare cooldowns: Collection<string, { [id: string]: CooldownData }>;

	/**
	 * Default cooldown for commands.
	 */
	public declare defaultCooldown: number;

	/**
	 * Directory to commands.
	 */
	public declare directory: string;

	/**
	 * Whether or not to require the use of execSlash for slash commands.
	 */
	public declare execSlash: boolean;

	/**
	 * Whether or not members are fetched on each message author from a guild.
	 */
	public declare fetchMembers: boolean;

	/**
	 * Whether or not edits are handled.
	 */
	public declare handleEdits: boolean;

	/**
	 * ID of user(s) to ignore cooldown or a function to ignore.
	 */
	public declare ignoreCooldown: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 */
	public declare ignorePermissions: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * Inhibitor handler to use.
	 */
	public declare inhibitorHandler: InhibitorHandler | null;

	/**
	 * Commands loaded, mapped by ID to Command.
	 */
	public declare modules: Collection<string, Command>;

	/**
	 * The prefix(es) for command parsing.
	 */
	public declare prefix: string | string[] | PrefixSupplier;

	/**
	 * Collection of prefix overwrites to commands.
	 */
	public declare prefixes: Collection<string | PrefixSupplier, Set<string>>;

	/**
	 * Collection of sets of ongoing argument prompts.
	 */
	public declare prompts: Collection<string, Set<string>>;

	/**
	 * The type resolver.
	 */
	public declare resolver: TypeResolver;

	/**
	 * Whether or not to store messages in CommandUtil.
	 */
	public declare storeMessages: boolean;

	/**
	 * Show "BotName is typing" information message on the text channels when a command is running.
	 */
	public declare typing: boolean;

	/**
	 * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
	 */
	public declare skipBuiltInPostInhibitors: boolean;

	/**
	 * Use slash command permissions for owner only commands
	 *
	 * Warning: this is experimental
	 */
	public declare useSlashPermissions: boolean;

	/**
	 * @param client - The Akairo client.
	 * @param options - Options.
	 */
	// eslint-disable-next-line complexity
	public constructor(client: AkairoClient, options: CommandHandlerOptions) {
		const {
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
			commandUtil = false,
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
			skipBuiltInPostInhibitors = false,
			useSlashPermissions = false
		} = options ?? {};

		if (!(classToHandle.prototype instanceof Command || classToHandle === Command)) {
			throw new AkairoError("INVALID_CLASS_TO_HANDLE", classToHandle.name, Command.name);
		}
		if (typeof blockClient !== "boolean") throw new TypeError("options.blockClient must be a boolean.");
		if (typeof blockBots !== "boolean") throw new TypeError("options.blockBots must be a boolean.");
		if (typeof fetchMembers !== "boolean") throw new TypeError("options.fetchMembers must be a boolean.");
		if (typeof handleEdits !== "boolean") throw new TypeError("options.handleEdits must be a boolean.");
		if (typeof storeMessages !== "boolean") throw new TypeError("options.storeMessages must be a boolean.");
		if (typeof commandUtil !== "boolean") throw new TypeError("options.commandUtil must be a boolean.");
		if (typeof commandUtilLifetime !== "number") throw new TypeError("options.commandUtilLifetime must be a number.");
		if (typeof commandUtilSweepInterval !== "number") throw new TypeError("options.commandUtilSweepInterval must be a number.");
		if (typeof defaultCooldown !== "number") throw new TypeError("options.defaultCooldown must be a number.");
		if (!isStringArrayStringOrFunc(ignoreCooldown))
			throw new TypeError("options.ignoreCooldown must be a string, an array of strings, or a function.");
		if (!isStringArrayStringOrFunc(ignorePermissions))
			throw new TypeError("options.ignorePermissions must be a string, an array of strings, or a function.");
		if (typeof argumentDefaults !== "object") throw new TypeError("options.argumentDefaults must be an object.");
		if (!isStringArrayStringOrFunc(prefix))
			throw new TypeError("options.prefix must be a string, an array of strings, or a function.");
		if (typeof allowMention !== "boolean" && typeof allowMention !== "function")
			throw new TypeError("options.allowMention must be a boolean.");
		if (aliasReplacement !== undefined && !(aliasReplacement instanceof RegExp))
			throw new TypeError("options.aliasReplacement must be a RegExp.");
		if (typeof autoDefer !== "boolean") throw new TypeError("options.autoDefer must be a boolean.");
		if (typeof typing !== "boolean") throw new TypeError("options.typing must be a boolean.");
		if (typeof autoRegisterSlashCommands !== "boolean")
			throw new TypeError("options.autoRegisterSlashCommands must be a boolean.");
		if (typeof execSlash !== "boolean") throw new TypeError("options.execSlash must be a boolean.");
		if (typeof skipBuiltInPostInhibitors !== "boolean")
			throw new TypeError("options.skipBuiltInPostInhibitors must be a boolean.");
		if (typeof useSlashPermissions !== "boolean") throw new TypeError("options.useSlashPermissions must be a boolean.");

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
		this.blockClient = blockClient;
		this.blockBots = blockBots;
		this.fetchMembers = fetchMembers;
		this.handleEdits = handleEdits;
		this.storeMessages = storeMessages;
		this.commandUtil = commandUtil;
		if ((this.handleEdits || this.storeMessages) && !this.commandUtil) throw new AkairoError("COMMAND_UTIL_EXPLICIT");
		this.commandUtilLifetime = commandUtilLifetime;
		this.commandUtilSweepInterval = commandUtilSweepInterval;
		if (this.commandUtilSweepInterval > 0) setInterval(() => this.sweepCommandUtil(), this.commandUtilSweepInterval).unref();
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
		this.allowMention = typeof allowMention === "function" ? allowMention.bind(this) : Boolean(allowMention);
		this.inhibitorHandler = null;
		this.autoDefer = Boolean(autoDefer);
		this.execSlash = Boolean(execSlash);
		this.skipBuiltInPostInhibitors = Boolean(skipBuiltInPostInhibitors);
		this.useSlashPermissions = Boolean(useSlashPermissions);
		this.setup();
	}

	/**
	 * Set up the command handler
	 */
	protected setup() {
		this.client.once("ready", () => {
			if (this.autoRegisterSlashCommands)
				this.registerInteractionCommands().then(() => {
					if (this.useSlashPermissions) this.updateInteractionPermissions(this.client.ownerID /*  this.client.superUserID */);
				});

			this.client.on("messageCreate", async m => {
				const message = m.partial ? await m.fetch().catch(() => null) : m;
				if (!message) return;

				this.handle(m);
			});

			if (this.handleEdits) {
				this.client.on("messageUpdate", async (o, m) => {
					const message = m.partial ? await m.fetch().catch(() => null) : m;
					if (!message) return;
					const original = o.partial ? await o.fetch().catch(() => null) : o;
					if (!original) return;
					if (original.content === message.content) return;

					if (this.handleEdits) this.handle(message as Message);
				});
			}
			this.client.on("interactionCreate", i => {
				if (i.isCommand()) this.handleSlash(i);
				if (i.isAutocomplete()) this.handleAutocomplete(i);
			});
		});

		if (this.commandUtil)
			this.client.on("messageDelete", message => {
				if (message.inGuild()) {
					CommandUtil.deletedMessages.add(message.id);
				}
			});
	}

	/**
	 * Registers interaction commands.
	 */
	protected async registerInteractionCommands() {
		this.client.emit("akairoDebug", `[registerInteractionCommands] Started registering interaction commands...`);
		const parsedSlashCommands: (ApplicationCommandData & { guilds: Snowflake[] })[] = [];
		const guildSlashCommandsParsed: Collection<Snowflake, ApplicationCommandData[]> = new Collection();
		const parseDescriptionCommand = (description: { content: () => any }) => {
			if (typeof description === "object") {
				if (typeof description.content === "function") return description.content();
				if (typeof description.content === "string") return description.content;
			}
			return description;
		};

		for (const [, data] of this.modules) {
			if (!data.slash) continue;
			parsedSlashCommands.push({
				name: data.aliases[0]?.toLowerCase() || data.id?.toLowerCase(),
				description: parseDescriptionCommand(data.description) || "No description provided.",
				options: data.slashOptions?.map(o => {
					const temp = { ...o };
					delete temp.resolve;
					return temp as ApplicationCommandOptionData;
				}),
				guilds: data.slashGuilds ?? [],
				defaultPermission: data.slashDefaultPermission,
				type: ApplicationCommandTypes.CHAT_INPUT
			});
		}

		let contextCommandHandler: ContextMenuCommandHandler | undefined;
		for (const key in this.client) {
			if (this.client[key as keyof AkairoClient] instanceof ContextMenuCommandHandler) {
				contextCommandHandler = this.client[key as keyof AkairoClient] as unknown as ContextMenuCommandHandler | undefined;
				break;
			}
		}
		if (contextCommandHandler) {
			for (const [, data] of contextCommandHandler.modules) {
				parsedSlashCommands.push({
					name: data.name,
					guilds: data.guilds ?? [],
					defaultPermission: this.useSlashPermissions ? !(data.ownerOnly || /* data.superUserOnly || */ false) : true,
					type: data.type
				});
			}
		}

		/* Global */
		const slashCommandsApp = parsedSlashCommands
			.filter(({ guilds }) => !guilds.length)
			.map(options => ({
				name: options.name,
				description:
					options.type === ApplicationCommandTypes.CHAT_INPUT || options.type === "CHAT_INPUT"
						? options.description ?? ""
						: undefined,
				options:
					options.type === ApplicationCommandTypes.CHAT_INPUT || options.type === "CHAT_INPUT"
						? options.options ?? []
						: undefined,
				defaultPermission: options.defaultPermission,
				type: options.type
			}))
			.sort((a, b) => {
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			}) as ApplicationCommandData[];
		const currentGlobalCommands = (await this.client.application?.commands.fetch())!
			.map(value1 => ({
				name: value1.name,
				description: value1.description,
				options: value1.options,
				defaultPermission: value1.defaultPermission,
				type: value1.type
			}))
			.sort((a, b) => {
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			}) as ApplicationCommandData[];

		if (!Util.deepEquals(currentGlobalCommands, slashCommandsApp)) {
			this.client.emit("akairoDebug", "[registerInteractionCommands] Updating global interaction commands.", slashCommandsApp);
			await this.client.application?.commands.set(slashCommandsApp).catch(error => {
				if (error instanceof DiscordAPIError) throw new RegisterInteractionCommandError(error, "global", slashCommandsApp);
				else throw error;
			});
		} else {
			this.client.emit("akairoDebug", "[registerInteractionCommands] Global interaction commands are up to date.");
		}

		/* Guilds */
		for (const options of parsedSlashCommands) {
			for (const guildId of options.guilds) {
				guildSlashCommandsParsed.set(guildId, [
					...(guildSlashCommandsParsed.get(guildId) ?? []),
					{
						name: options.name,
						description:
							options.type === ApplicationCommandTypes.CHAT_INPUT || options.type === "CHAT_INPUT"
								? options.description ?? ""
								: undefined,
						options:
							options.type === ApplicationCommandTypes.CHAT_INPUT || options.type === "CHAT_INPUT"
								? options.options ?? []
								: undefined,
						defaultPermission: options.defaultPermission,
						type: options.type
					} as ApplicationCommandData
				]);
			}
		}

		if (guildSlashCommandsParsed.size) {
			guildSlashCommandsParsed.each(async (value, key) => {
				const guild = this.client.guilds.cache.get(key);
				if (!guild) return;

				const sortedCommands = value.sort((a, b) => {
					if (a.name < b.name) return -1;
					if (a.name > b.name) return 1;
					return 0;
				});

				const currentGuildCommands = (await guild.commands.fetch())
					.map(value1 => ({
						name: value1.name,
						description: value1.description,
						options: value1.options,
						defaultPermission: value1.defaultPermission,
						type: value1.type
					}))
					.sort((a, b) => {
						if (a.name < b.name) return -1;
						if (a.name > b.name) return 1;
						return 0;
					});

				if (!Util.deepEquals(currentGuildCommands, sortedCommands)) {
					this.client.emit(
						"akairoDebug",
						`[registerInteractionCommands] Updating guild commands for ${guild.name}.`,
						sortedCommands
					);
					await guild.commands.set(sortedCommands).catch(error => {
						if (error instanceof DiscordAPIError)
							throw new RegisterInteractionCommandError(error, "guild", sortedCommands, guild);
						else throw error;
					});
				} else {
					this.client.emit("akairoDebug", `[registerInteractionCommands] No changes needed for ${guild.name}.`);
				}
			});
		}
	}

	/**
	 * updates interaction permissions
	 */
	protected async updateInteractionPermissions(owners: Snowflake | Snowflake[] /* superUsers: Snowflake | Snowflake[] */) {
		const mapCom = (
			value: ApplicationCommand<{ guild: GuildResolvable }>,
			guild: Guild
		): GuildApplicationCommandPermissionData => {
			const command = this.modules.find(mod => mod.aliases[0] === value.name);

			if (!command?.slashPermissions) {
				let allowedUsers: string[] = [];
				/* if (command.superUserOnly) allowedUsers.push(...Util.intoArray(superUsers)); */
				if (command?.ownerOnly) allowedUsers.push(...Util.intoArray(owners));
				allowedUsers = [...new Set(allowedUsers)]; // remove duplicates

				return {
					id: value.id,
					permissions: allowedUsers.map(u => ({
						id: u,
						type: "USER",
						permission: true
					}))
				};
			} else {
				return {
					id: value.id,
					permissions: typeof command.slashPermissions === "function" ? command.slashPermissions(guild) : command.slashPermissions
				};
			}
		};

		const globalCommands = (await this.client.application?.commands.fetch())?.filter(value =>
			Boolean(this.modules.find(mod => mod.aliases[0] === value.name))
		);
		const fullPermissions = globalCommands
			?.filter(value => !value.defaultPermission)
			.filter(value => Boolean(this.modules.find(mod => mod.aliases[0] === value.name)));

		const promises = this.client.guilds.cache.map(
			/* async */ guild => {
				const perms = new Array(...((fullPermissions ?? new Collection()).map(value => mapCom(value, guild)) ?? []));
				// await guild.commands.fetch();
				if (guild.commands.cache.size)
					perms.push(...guild.commands.cache.filter(value => !value.defaultPermission).map(value => mapCom(value, guild)));
				if (guild.available)
					return guild.commands.permissions.set({
						fullPermissions: perms
					});
				// Return empty promise if guild is unavailable
				return Promise.resolve();
			}
		);
		try {
			await Promise.all(promises);
		} catch (e) {
			this.client.emit(
				"akairoDebug",
				"[updateInteractionPermissions] Error updating interaction permissions, here are the promises, globalCommands, and fullPermissions",
				promises,
				globalCommands,
				fullPermissions
			);
			throw e;
		}
	}

	/**
	 * Registers a module.
	 * @param command - Module to use.
	 * @param filepath - Filepath of module.
	 */
	public override register(command: Command, filepath?: string): void {
		super.register(command, filepath);

		if (command.slashDefaultPermission === undefined)
			command.slashDefaultPermission = this.useSlashPermissions ? !command.ownerOnly : true;

		for (let alias of command.aliases) {
			const conflict = this.aliases.get(alias.toLowerCase());
			if (conflict) throw new AkairoError("ALIAS_CONFLICT", alias, command.id, conflict);

			alias = alias.toLowerCase();
			this.aliases.set(alias, command.id);
			if (this.aliasReplacement) {
				const replacement = alias.replace(this.aliasReplacement, "");

				if (replacement !== alias) {
					const replacementConflict = this.aliases.get(replacement);
					if (replacementConflict) throw new AkairoError("ALIAS_CONFLICT", replacement, command.id, replacementConflict);
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
					prefixes?.delete(command.prefix as string);
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
					message.util = this.commandUtils.get(message.id) as CommandUtil<Message>;
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
				message.util!.parsed = parsed;
			}

			if (parsed.command?.slashOnly) {
				this.emit(CommandHandlerEvents.SLASH_ONLY, message, parsed.command);
				return false;
			}

			let ran;
			if (!parsed.command) {
				ran = await this.handleRegexAndConditionalCommands(message);
			} else {
				ran = await this.handleDirectCommand(message, parsed.content!, parsed.command);
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
		const commandModule = this.findCommand(interaction.commandName);

		if (!commandModule) {
			this.emit(CommandHandlerEvents.SLASH_NOT_FOUND, interaction);
			return false;
		}

		const message = new AkairoMessage(this.client, interaction);

		try {
			if (this.fetchMembers && message.guild && !message.member) {
				await message.guild.members.fetch(message.author);
			}

			if (await this.runAllTypeInhibitors(message, true)) {
				return false;
			}

			if (this.commandUtil) {
				if (this.commandUtils.has(message.id)) {
					message.util = this.commandUtils.get(message.id) as CommandUtil<AkairoMessage>;
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

			if (await this.runPostTypeInhibitors(message, commandModule)) {
				return false;
			}
			const convertedOptions: ConvertedOptionsType = {};

			if ((interaction.options as CommandInteractionOptionResolver)["_group"])
				convertedOptions["subcommandGroup"] = (interaction.options as CommandInteractionOptionResolver)["_group"];
			if ((interaction.options as CommandInteractionOptionResolver)["_subcommand"])
				convertedOptions["subcommand"] = (interaction.options as CommandInteractionOptionResolver)["_subcommand"];
			for (const option of (interaction.options as CommandInteractionOptionResolver)["_hoistedOptions"]) {
				if (option.type === "SUB_COMMAND" || option.type === "SUB_COMMAND_GROUP") continue;
				const originalOption = commandModule.slashOptions?.find(o => o.name === option.name);

				const func = `get${
					originalOption?.resolve ?? [option.type.charAt(0) + Util.snakeToCamelCase(option.type.substring(1))]
				}` as GetFunction;
				if (
					!(
						[
							"getBoolean",
							"getChannel",
							"getString",
							"getInteger",
							"getNumber",
							"getUser",
							"getMember",
							"getRole",
							"getMentionable"
						] as const
					).includes(func)
				)
					throw new Error(`${func} is not a valid get function.`);
				convertedOptions[option.name] = interaction.options[func](option.name, false);
			}

			// Makes options that are not found to be null so that it matches the behavior normal commands.
			(() => {
				type SubCommand = AkairoApplicationCommandSubCommandData;
				type SubCommandGroup = AkairoApplicationCommandSubGroupData;
				type NonSubSlashOptions =
					| AkairoApplicationCommandChoicesData
					| AkairoApplicationCommandNonOptionsData
					| AkairoApplicationCommandChannelOptionData;

				if (convertedOptions.subcommand || convertedOptions.subcommandGroup) {
					const usedSubcommandOrGroup = commandModule.slashOptions?.find(o => o.name === convertedOptions.subcommand);
					if (!usedSubcommandOrGroup) {
						this.client.emit("akairoDebug", "[handleSlash] Unable to find subcommand");
						return;
					}
					if (
						usedSubcommandOrGroup.type === "SUB_COMMAND" ||
						usedSubcommandOrGroup.type === ApplicationCommandOptionTypes.SUB_COMMAND
					) {
						if (!(<SubCommand>usedSubcommandOrGroup).options) {
							this.client.emit("akairoDebug", "[handleSlash] Unable to find subcommand options");
							return;
						}
						handleOptions((<SubCommand>usedSubcommandOrGroup).options!);
					} else if (
						usedSubcommandOrGroup.type === "SUB_COMMAND_GROUP" ||
						usedSubcommandOrGroup.type === ApplicationCommandOptionTypes.SUB_COMMAND_GROUP
					) {
						const usedSubCommand = (<SubCommandGroup>usedSubcommandOrGroup).options?.find(
							subcommand => subcommand.name === convertedOptions.subcommand
						);
						if (!usedSubCommand) {
							this.client.emit("akairoDebug", "[handleSlash] Unable to find subcommand");
							return;
						} else if (!usedSubCommand.options) {
							this.client.emit("akairoDebug", "[handleSlash] Unable to find subcommand options");
							return;
						}

						handleOptions(usedSubCommand.options);
					} else {
						throw new AkairoError("UNEXPECTED_SLASH_COMMAND_TYPE", usedSubcommandOrGroup.type);
					}
				} else {
					handleOptions((commandModule.slashOptions ?? []) as NonSubSlashOptions[]);
				}

				function handleOptions(options: NonSubSlashOptions[]) {
					for (const option of options) {
						switch (option.type) {
							case ApplicationCommandOptionTypes.BOOLEAN:
							case "BOOLEAN":
								convertedOptions[option.name] ??= false;
								break;
							case ApplicationCommandOptionTypes.CHANNEL:
							case "CHANNEL":
							case ApplicationCommandOptionTypes.INTEGER:
							case "INTEGER":
							case ApplicationCommandOptionTypes.MENTIONABLE:
							case "MENTIONABLE":
							case ApplicationCommandOptionTypes.NUMBER:
							case "NUMBER":
							case ApplicationCommandOptionTypes.ROLE:
							case "ROLE":
							case ApplicationCommandOptionTypes.STRING:
							case "STRING":
							case ApplicationCommandOptionTypes.USER:
							case "USER":
							default:
								convertedOptions[option.name] ??= null;
								break;
						}
					}
				}
			})();

			let key;
			try {
				if (commandModule.lock) key = (commandModule.lock as KeySupplier)(message, convertedOptions);
				if (Util.isPromise(key)) key = await key;
				if (key) {
					if (commandModule.locker?.has(key)) {
						key = null;
						this.emit(CommandHandlerEvents.COMMAND_LOCKED, message, commandModule);
						return true;
					}
					commandModule.locker?.add(key);
				}
			} catch (err) {
				this.emitError(err, message, commandModule);
			} finally {
				if (key) commandModule.locker?.delete(key);
			}

			if (this.autoDefer || commandModule.slashEphemeral) {
				await message.interaction.deferReply({ ephemeral: commandModule.slashEphemeral });
			}

			try {
				this.emit(CommandHandlerEvents.SLASH_STARTED, message, commandModule, convertedOptions);
				const ret =
					Object.getOwnPropertyNames(Object.getPrototypeOf(commandModule)).includes("execSlash") || this.execSlash
						? await commandModule.execSlash(message, convertedOptions)
						: await commandModule.exec(message, convertedOptions);
				this.emit(CommandHandlerEvents.SLASH_FINISHED, message, commandModule, convertedOptions, ret);
				return true;
			} catch (err) {
				this.emit(CommandHandlerEvents.SLASH_ERROR, err, message, commandModule);
				return false;
			}
		} catch (err) {
			this.emitError(err, message, commandModule);
			return null;
		}
	}

	/**
	 * Handles autocomplete interactions.
	 * @param interaction The interaction to handle.
	 */
	public handleAutocomplete(interaction: AutocompleteInteraction): void {
		const commandModule = this.findCommand(interaction.commandName);

		if (!commandModule) {
			this.emit(CommandHandlerEvents.SLASH_NOT_FOUND, interaction);
			return;
		}

		this.client.emit("akairoDebug", `[handleAutocomplete] Autocomplete started for ${interaction.commandName}`);
		commandModule.autocomplete(interaction);
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
			if (Flag.is(args, FlagType.Cancel)) {
				this.emit(CommandHandlerEvents.COMMAND_CANCELLED, message, command);
				return true;
			} else if (Flag.is(args, FlagType.Retry)) {
				this.emit(CommandHandlerEvents.COMMAND_BREAKOUT, message, command, args.message);
				return this.handle(args.message);
			} else if (Flag.is(args, FlagType.Continue)) {
				const continueCommand = this.modules.get(args.command)!;
				return this.handleDirectCommand(message, args.rest!, continueCommand, args.ignore);
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
		const trueCommands: Command[] = [];

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
		} else if (!slash && this.hasPrompt(message.channel!, message.author)) {
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

			if (command.channel === "guild" && !message.inGuild()) {
				this.emit(event, message, command, BuiltInReasons.GUILD);
				return true;
			}

			if (command.channel === "dm" && message.inGuild()) {
				this.emit(event, message, command, BuiltInReasons.DM);
				return true;
			}

			if (command.onlyNsfw && !("nsfw" in (message.channel ?? {}))) {
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

		if (this.skipBuiltInPostInhibitors && reason == null) {
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
	public async runPermissionChecks(message: Message | AkairoMessage, command: Command, slash: boolean = false): Promise<boolean> {
		const event = slash ? CommandHandlerEvents.SLASH_MISSING_PERMISSIONS : CommandHandlerEvents.MISSING_PERMISSIONS;
		if (command.clientPermissions) {
			if (typeof command.clientPermissions === "function") {
				let missing = command.clientPermissions(message);
				if (Util.isPromise(missing)) missing = await missing;

				if (missing != null) {
					this.emit(event, message, command, "client", missing);
					return true;
				}
			} else if (message.guild) {
				if (message.channel?.type === "DM") return false;
				const missing = message.channel?.permissionsFor(message.guild.me!)?.missing(command.clientPermissions);
				if (missing?.length) {
					this.emit(event, message, command, "client", missing);
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
						this.emit(event, message, command, "user", missing);
						return true;
					}
				} else if (message.guild) {
					if (message.channel?.type === "DM") return false;
					const missing = message.channel?.permissionsFor(message.author)?.missing(command.userPermissions);
					if (missing?.length) {
						this.emit(event, message, command, "user", missing);
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

		if (!this.cooldowns.get(id)![command.id]) {
			this.cooldowns.get(id)![command.id] = {
				timer: setTimeout(() => {
					if (this.cooldowns.get(id)![command.id]) {
						clearTimeout(this.cooldowns.get(id)![command.id].timer);
					}
					this.cooldowns.get(id)![command.id] = null!;

					if (!Object.keys(this.cooldowns.get(id)!).length) {
						this.cooldowns.delete(id);
					}
				}, time).unref(),
				end: endTime,
				uses: 0
			};
		}

		const entry = this.cooldowns.get(id)![command.id];

		if (entry.uses >= command.ratelimit) {
			const end = this.cooldowns.get(id)![command.id].end;
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
		const typing =
			command.typing || this.typing
				? setInterval(() => {
						if (command.typing || this.typing) message.channel.sendTyping();
				  }, 9000)
				: undefined;

		try {
			this.emit(CommandHandlerEvents.COMMAND_STARTED, message, command, args);
			const ret = await command.exec(message, args);
			this.emit(CommandHandlerEvents.COMMAND_FINISHED, message, command, args, ret);
		} finally {
			if (typing) clearInterval(typing);
		}
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

		const pairs = (await Promise.all(promises)).flatMap(x => x, 1);
		pairs.sort(([a]: any, [b]: any) => Util.prefixCompare(a, b));
		return this.parseMultiplePrefixes(message, pairs as [string, Set<string>][]);
	}

	/**
	 * Runs parseWithPrefix on multiple prefixes and returns the best parse.
	 * @param message - Message to parse.
	 * @param pairs - Pairs of prefix to associated commands. That is, `[string, Set<string> | null][]`.
	 */
	public parseMultiplePrefixes(message: Message | AkairoMessage, pairs: [string, Set<string> | null][]): ParsedComponentData {
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
	public addPrompt(channel: TextBasedChannel, user: User): void {
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
	public removePrompt(channel: TextBasedChannel, user: User): void {
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
	public hasPrompt(channel: TextBasedChannel, user: User): boolean {
		const users = this.prompts.get(channel.id);
		if (!users) return false;
		return users.has(user.id);
	}

	/**
	 * Finds a command by alias.
	 * @param name - Alias to find with.
	 */
	public findCommand(name: string): Command {
		return this.modules.get(this.aliases.get(name.toLowerCase())!)!;
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
	 * Set the task handler to use.
	 * @param taskHandler - The task handler.
	 */
	public useTaskHandler(taskHandler: TaskHandler): CommandHandler {
		this.resolver.taskHandler = taskHandler;

		return this;
	}

	/**
	 * Set the context menu command handler to use.
	 * @param contextMenuCommandHandler - The context menu command handler.
	 */
	public useContextMenuCommandHandler(contextMenuCommandHandler: ContextMenuCommandHandler): CommandHandler {
		this.resolver.contextMenuCommandHandler = contextMenuCommandHandler;

		return this;
	}
}

type Events = CommandHandlerEventsType;

export interface CommandHandler extends AkairoHandler {
	/**
	 * Loads a command.
	 * @param thing - Module or path to module.
	 */
	load(thing: string | Command): Promise<Command>;

	/**
	 * Reads all commands from the directory and loads them.
	 * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
	 * @param filter - Filter for files, where true means it should be loaded.
	 */
	loadAll(directory?: string, filter?: LoadPredicate): Promise<CommandHandler>;

	/**
	 * Removes a command.
	 * @param id - ID of the command.
	 */
	remove(id: string): Command;

	/**
	 * Removes all commands.
	 */
	removeAll(): CommandHandler;

	/**
	 * Reloads a command.
	 * @param id - ID of the command.
	 */
	reload(id: string): Promise<Command>;

	/**
	 * Reloads all commands.
	 */
	reloadAll(): Promise<CommandHandler>;

	on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
	once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
}

export class RegisterInteractionCommandError extends Error {
	public original: DiscordAPIError;
	public type: "guild" | "global";
	public data: ApplicationCommandData[];
	public guild: Guild | null;

	public constructor(
		original: DiscordAPIError,
		type: "guild" | "global",
		data: ApplicationCommandData[],
		guild: Guild | null = null
	) {
		super("Failed to register interaction commands.");
		this.original = original;
		this.type = type;
		this.data = data;
		this.guild = guild;
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
	 * @default {}
	 */
	argumentDefaults?: DefaultArgumentOptions;

	/**
	 * Automatically defer messages "BotName is thinking"
	 */
	autoDefer?: boolean;

	/**
	 * Specify whether to register all slash commands when starting the client.
	 * @default false
	 */
	autoRegisterSlashCommands?: boolean;

	/**
	 * Whether or not to block bots.
	 * @default true
	 */
	blockBots?: boolean;

	/**
	 * Whether or not to block self.
	 * @default true
	 */
	blockClient?: boolean;

	/**
	 * Whether or not to assign `message.util`.
	 * @default false
	 */
	commandUtil?: boolean;

	/**
	 * Milliseconds a message should exist for before its command util instance is marked for removal.
	 * If `0`, CommandUtil instances will never be removed and will cause memory to increase indefinitely.
	 * @default 300_000 // 5 minutes
	 */
	commandUtilLifetime?: number;

	/**
	 * Time interval in milliseconds for sweeping command util instances.
	 * If `0`, CommandUtil instances will never be removed and will cause memory to increase indefinitely.
	 * @default 300_000 // 5 minutes
	 */
	commandUtilSweepInterval?: number;

	/**
	 * Default cooldown for commands.
	 * @default 0
	 */
	defaultCooldown?: number;

	/**
	 * Whether or not members are fetched on each message author from a guild.
	 * @default false
	 */
	fetchMembers?: boolean;

	/**
	 * Whether or not to handle edited messages using CommandUtil.
	 * @default false
	 */
	handleEdits?: boolean;

	/**
	 * ID of user(s) to ignore cooldown or a function to ignore. Defaults to the client owner(s).
	 * @default client.ownerID
	 */
	ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 * @default []
	 */
	ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;

	/**
	 * The prefix(es) for command parsing.
	 * @default "!"
	 */
	prefix?: string | string[] | PrefixSupplier;

	/**
	 * Whether or not to store messages in CommandUtil.
	 * @default false
	 */
	storeMessages?: boolean;

	/**
	 * Show "BotName is typing" information message on the text channels when a command is running.
	 * @default false
	 */
	typing?: boolean;

	/**
	 * Whether or not to require the use of execSlash for slash commands.
	 * @default false
	 */
	execSlash?: boolean;

	/**
	 * Whether or not to skip built in reasons post type inhibitors so you can make custom ones.
	 * @default false
	 */
	skipBuiltInPostInhibitors?: boolean;

	/**
	 * Use slash command permissions for owner only commands
	 *
	 * Warning: this is experimental
	 * @default false
	 */
	useSlashPermissions?: boolean;
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

const slashResolvable = ["Boolean", "Channel", "String", "Integer", "Number", "User", "Member", "Role", "Mentionable"] as const;
export type SlashResolveType = typeof slashResolvable[number];

/**
 * Calls the corresponding get function on the {@link CommandInteractionOptionResolver}
 */
type GetFunction = `get${SlashResolveType}`;

type ConvertedOptionsType = {
	[key: string]:
		| string
		| boolean
		| number
		| null
		| NonNullable<CommandInteractionOption["channel"]>
		| NonNullable<CommandInteractionOption["user"]>
		| NonNullable<CommandInteractionOption["member"]>
		| NonNullable<CommandInteractionOption["role"]>
		| NonNullable<CommandInteractionOption["member" | "role" | "user"]>
		| NonNullable<CommandInteractionOption["message"]>;
};

/**
 * @typedef {CommandInteractionOptionResolver} VSCodePleaseStopRemovingMyImports
 * @internal
 */
