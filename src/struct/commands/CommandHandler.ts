import {
	ApplicationCommand,
	ApplicationCommandOptionType,
	ApplicationCommandSubCommandData,
	ApplicationCommandSubGroupData,
	ApplicationCommandType,
	Collection,
	DiscordAPIError,
	InteractionType,
	type ApplicationCommandData,
	type ApplicationCommandOptionData,
	type AutocompleteInteraction,
	type Awaitable,
	type ChatInputCommandInteraction,
	type CommandInteractionOption,
	type CommandInteractionOptionResolver,
	type Guild,
	type Message,
	type Snowflake,
	type TextBasedChannel,
	type User
} from "discord.js";
import { z } from "zod";
import type { CommandHandlerEvents as CommandHandlerEventsType } from "../../typings/events.js";
import { ArrayOrNot, MessageInstance, SyncOrAsync } from "../../typings/Util.js";
import { AkairoError } from "../../util/AkairoError.js";
import { AkairoMessage } from "../../util/AkairoMessage.js";
import { BuiltInReasons, CommandHandlerEvents } from "../../util/Constants.js";
import { deepAssign, deepEquals, intoArray, intoCallable, isPromise, prefixCompare } from "../../util/Util.js";
import { AkairoClient } from "../AkairoClient.js";
import { AkairoHandler, AkairoHandlerOptions, Extension } from "../AkairoHandler.js";
import { ContextMenuCommandHandler } from "../contextMenuCommands/ContextMenuCommandHandler.js";
import type { InhibitorHandler } from "../inhibitors/InhibitorHandler.js";
import type { ListenerHandler } from "../listeners/ListenerHandler.js";
import type { TaskHandler } from "../tasks/TaskHandler.js";
import { ArgumentDefaults, DefaultArgumentOptions } from "./arguments/Argument.js";
import { TypeResolver } from "./arguments/TypeResolver.js";
import { Command, CommandInstance, SlashNonSub, type KeySupplier } from "./Command.js";
import { CommandUtil } from "./CommandUtil.js";
import { Flag, FlagType } from "./Flag.js";

/**
 * Loads commands and handles messages.
 */
export class CommandHandler extends AkairoHandler<Command, CommandHandler> {
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
	public argumentDefaults: ArgumentDefaults;

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
	public commandUtils: Collection<string, CommandUtil<Message | AkairoMessage>>;

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
	 * Whether or not to require the use of execSlash for slash commands.
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
	public ignoreCooldown: Snowflake | Snowflake[] | OmitThisParameter<IgnoreCheckPredicate>;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 */
	public ignorePermissions: Snowflake | Snowflake[] | OmitThisParameter<IgnoreCheckPredicate>;

	/**
	 * Inhibitor handler to use.
	 */
	public inhibitorHandler: InhibitorHandler | null;

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
	public skipBuiltInPostInhibitors: boolean;

	/**
	 * @param client - The Akairo client.
	 * @param options - Options.
	 */
	public constructor(client: AkairoClient, options: CommandHandlerOptions) {
		z.instanceof(AkairoClient).parse(client);
		CommandHandlerOptions.parse(options);

		const {
			directory,
			classToHandle = Command,
			extensions = [".js", ".ts"] as Extension[],
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
			skipBuiltInPostInhibitors = false
		} = options;

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
		this.argumentDefaults = deepAssign(
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
		this.allowMention = typeof allowMention === "function" ? allowMention.bind(this) : allowMention;
		this.inhibitorHandler = null;
		this.autoDefer = autoDefer;
		this.execSlash = execSlash;
		this.skipBuiltInPostInhibitors = skipBuiltInPostInhibitors;
		this.setup();
	}

	/**
	 * Set up the command handler
	 */
	protected setup() {
		this.client.once("ready", () => {
			if (this.autoRegisterSlashCommands) this.registerInteractionCommands();

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
				if (i.isChatInputCommand()) this.handleSlash(i);
				if (i.type === InteractionType.ApplicationCommandAutocomplete) this.handleAutocomplete(i);
			});
		});

		if (this.commandUtil) {
			this.client.on("messageDelete", message => {
				if (message.inGuild()) {
					CommandUtil.deletedMessages.add(message.id);
				}
			});
		}
	}

	/**
	 * Registers interaction commands.
	 */
	protected async registerInteractionCommands() {
		this.client.emit("akairoDebug", `[registerInteractionCommands] Started registering interaction commands...`);

		type ParsedSlashCommand = ApplicationCommandData & { guilds: Snowflake[] };

		const parsedSlashCommands: ParsedSlashCommand[] = [];
		const guildSlashCommandsParsed: Collection<Snowflake, ApplicationCommandData[]> = new Collection();
		const parseDescriptionCommand = (description: { content: () => any }) => {
			if (typeof description === "object") {
				if (typeof description.content === "function") return description.content();
				if (typeof description.content === "string") return description.content;
			}
			return description;
		};

		// Parse all commands that have slash enabled
		for (const [, data] of this.modules) {
			if (!data.slash) continue;
			const obj = {
				name: data.aliases[0]?.toLocaleLowerCase() || data.id?.toLocaleLowerCase(),
				description: parseDescriptionCommand(data.description) || "No description provided.",
				options: data.slashOptions?.map(o => {
					const temp = { ...o, resolve: undefined };
					return temp as ApplicationCommandOptionData;
				}),
				guilds: data.slashGuilds ?? [],
				dmPermission: data.slashDmPermission,
				type: ApplicationCommandType.ChatInput,
				nameLocalizations: data.localization.nameLocalizations,
				descriptionLocalizations: data.localization.descriptionLocalizations
			} as ParsedSlashCommand;

			if ("slashDefaultMemberPermissions" in data) obj.defaultMemberPermissions = data.slashDefaultMemberPermissions;

			parsedSlashCommands.push(obj);
		}

		// find the context command handler on the client (if it exists)
		const contextCommandHandler: ContextMenuCommandHandler | undefined = Object.values(this.client).find(
			v => v instanceof ContextMenuCommandHandler
		);

		if (contextCommandHandler) {
			// parse all context commands
			for (const [, data] of contextCommandHandler.modules) {
				const obj = {
					name: data.name,
					guilds: data.guilds ?? [],
					dmPermission: data.dmPermission,
					type: data.type,
					nameLocalizations: data.nameLocalizations
				} as ParsedSlashCommand;

				if ("defaultMemberPermissions" in data) obj.defaultMemberPermissions = data.defaultMemberPermissions;

				parsedSlashCommands.push(obj);
			}
		}

		/* --------------------------- Global Interactions -------------------------- */
		const slashCommandsApp = parsedSlashCommands
			.filter(({ guilds }) => guilds.length === 0)
			.map(this.mapInteraction)
			.sort(this.sortInteraction);

		const currentGlobalCommands = (await this.client.application?.commands.fetch())!
			.map(this.mapInteraction)
			.sort(this.sortInteraction);

		if (!deepEquals(currentGlobalCommands, slashCommandsApp)) {
			this.client.emit("akairoDebug", "[registerInteractionCommands] Updating global interaction commands.", slashCommandsApp);
			await this.client.application?.commands.set(slashCommandsApp).catch(error => {
				if (error instanceof DiscordAPIError) throw new RegisterInteractionCommandError(error, "global", slashCommandsApp);
				else throw error;
			});
		} else {
			this.client.emit("akairoDebug", "[registerInteractionCommands] Global interaction commands are up to date.");
		}

		/* ----------------------- Guild Specific Interactions ---------------------- */
		for (const options of parsedSlashCommands) {
			for (const guildId of options.guilds) {
				guildSlashCommandsParsed.set(guildId, [...(guildSlashCommandsParsed.get(guildId) ?? []), this.mapInteraction(options)]);
			}
		}

		if (guildSlashCommandsParsed.size) {
			guildSlashCommandsParsed.each(async (value, key) => {
				const guild = this.client.guilds.cache.get(key);
				if (!guild) return;

				const sortedCommands = value.sort(this.sortInteraction);

				const currentGuildCommands = (await guild.commands.fetch()).map(this.mapInteraction).sort(this.sortInteraction);

				if (!deepEquals(currentGuildCommands, sortedCommands)) {
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

	private mapInteraction(interaction: ApplicationCommandData | ApplicationCommand): ApplicationCommandData {
		return {
			name: interaction.name,
			description: interaction.type === ApplicationCommandType.ChatInput ? interaction.description ?? "" : undefined!,
			options:
				interaction.type === ApplicationCommandType.ChatInput
					? // todo: check if this is okay
					  (interaction.options as ApplicationCommandOptionData[]) ?? []
					: undefined,
			defaultMemberPermissions: interaction.defaultMemberPermissions,
			dmPermission: interaction.dmPermission!,
			type: interaction.type,
			nameLocalizations: interaction.nameLocalizations!,
			descriptionLocalizations:
				interaction.type === ApplicationCommandType.ChatInput ? interaction.descriptionLocalizations! : undefined!
		};
	}

	private sortInteraction<T extends { name: string }>(a: T, b: T): number {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	}

	// #region fold

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
				this.prefixes = this.prefixes.sort((aVal, bVal, aKey, bKey) => prefixCompare(aKey, bKey));
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
	public async handleSlash(interaction: ChatInputCommandInteraction): Promise<boolean | null> {
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
				if (
					option.type === ApplicationCommandOptionType.Subcommand ||
					option.type === ApplicationCommandOptionType.SubcommandGroup
				)
					continue;
				const originalOption = commandModule.slashOptions?.find(o => o.name === option.name);

				const func = `get${
					// fuck u typescript
					originalOption && "resolve" in originalOption && originalOption.resolve
						? originalOption.resolve
						: (ApplicationCommandOptionType[option.type] as SlashResolveType)
				}` as const;

				// getMember and getChannel have incompatible signatures with the others
				convertedOptions[option.name] =
					func === "getMember"
						? interaction.options.getMember(option.name)
						: func === "getChannel"
						? interaction.options.getChannel(option.name, false)
						: interaction.options[func](option.name, false);
			}

			// Makes options that are not found to be null so that it matches the behavior normal commands.
			out: {
				type SubCommand = ApplicationCommandSubCommandData;
				type SubCommandGroup = ApplicationCommandSubGroupData;

				if (convertedOptions.subcommand || convertedOptions.subcommandGroup) {
					const usedSubcommandOrGroup = commandModule.slashOptions?.find(o => o.name === convertedOptions.subcommand);
					if (!usedSubcommandOrGroup) {
						this.client.emit("akairoDebug", "[handleSlash] Unable to find subcommand");
						break out;
					}
					if (usedSubcommandOrGroup.type === ApplicationCommandOptionType.Subcommand) {
						if (!(<SubCommand>usedSubcommandOrGroup).options) {
							this.client.emit("akairoDebug", "[handleSlash] Unable to find subcommand options");
							break out;
						}
						handleOptions((<SubCommand>usedSubcommandOrGroup).options!);
					} else if (usedSubcommandOrGroup.type === ApplicationCommandOptionType.SubcommandGroup) {
						const usedSubCommand = (<SubCommandGroup>usedSubcommandOrGroup).options?.find(
							subcommand => subcommand.name === convertedOptions.subcommand
						);
						if (!usedSubCommand) {
							this.client.emit("akairoDebug", "[handleSlash] Unable to find subcommand");
							break out;
						} else if (!usedSubCommand.options) {
							this.client.emit("akairoDebug", "[handleSlash] Unable to find subcommand options");
							break out;
						}

						handleOptions(usedSubCommand.options);
					} else {
						throw new AkairoError("UNEXPECTED_SLASH_COMMAND_TYPE", usedSubcommandOrGroup.type);
					}
				} else {
					handleOptions((commandModule.slashOptions ?? []) as SlashNonSub[]);
				}

				// eslint-disable-next-line no-inner-declarations
				function handleOptions(options: SlashNonSub[]) {
					for (const option of options) {
						switch (option.type) {
							case ApplicationCommandOptionType.Boolean:
								convertedOptions[option.name] ??= false;
								break;
							case ApplicationCommandOptionType.Channel:
							case ApplicationCommandOptionType.Integer:
							case ApplicationCommandOptionType.Mentionable:
							case ApplicationCommandOptionType.Number:
							case ApplicationCommandOptionType.Role:
							case ApplicationCommandOptionType.String:
							case ApplicationCommandOptionType.User:
							case ApplicationCommandOptionType.Attachment:
								convertedOptions[option.name] ??= null;
								break;
							default: {
								// eslint-disable-next-line @typescript-eslint/no-unused-vars
								const exhaustiveCheck: never = option;

								// @ts-expect-error
								convertedOptions[option.name] ??= null;
								break;
							}
						}
					}
				}
			}

			let key;
			try {
				if (commandModule.lock) key = commandModule.lock(message, convertedOptions);
				if (isPromise(key)) key = await key;
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
			if (isPromise(before)) await before;

			const args = await command.parse(message, content);
			if (Flag.is(args, FlagType.Cancel)) {
				this.emit(CommandHandlerEvents.COMMAND_CANCELLED, message, command);
				return true;
			} else if (Flag.is(args, FlagType.Timeout)) {
				this.emit(CommandHandlerEvents.COMMAND_TIMEOUT, message, command, args.time);
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
				if (isPromise(key)) key = await key;
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

			const matches: RegExpExecArray[] = [];

			if (entry.regex.global) {
				let matched: RegExpExecArray | null;

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
						if (isPromise(before)) await before;

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
					if (isPromise(cond)) cond = await cond;
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
						if (isPromise(before)) await before;
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
				if (isPromise(missing)) missing = await missing;

				if (missing != null) {
					this.emit(event, message, command, "client", missing);
					return true;
				}
			} else if (message.inGuild()) {
				if (!message.channel || message.channel.isDMBased()) return false;
				const missing = message.channel?.permissionsFor(message.guild.members.me!)?.missing(command.clientPermissions);
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
					if (isPromise(missing)) missing = await missing;

					if (missing != null) {
						this.emit(event, message, command, "user", missing);
						return true;
					}
				} else if (message.inGuild()) {
					if (!message.channel || message.channel.isDMBased()) return false;
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
			? // @ts-ignore
			  ignorer(message, command)
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
		const allowMention = await intoCallable(this.prefix)(message);
		let prefixes = intoArray(allowMention);
		if (allowMention) {
			const mentions = [`<@${this.client.user?.id}>`, `<@!${this.client.user?.id}>`];
			prefixes = [...mentions, ...prefixes];
		}

		prefixes.sort(prefixCompare);
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
			const prefixes = intoArray(await intoCallable(provider)(message));
			return prefixes.map(p => [p, cmds]);
		});

		const pairs = (await Promise.all(promises)).flatMap(x => x, 1);
		pairs.sort(([a]: any, [b]: any) => prefixCompare(a, b));
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
	public emitError(err: Error, message: Message | AkairoMessage, command?: Command): void {
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
// #endregion fold

type Events = CommandHandlerEventsType;

export interface CommandHandler extends AkairoHandler<Command, CommandHandler> {
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

/**
 * A function that returns whether mentions can be used as a prefix.
 * @param message - Message to option for.
 */
export type MentionPrefixPredicate = (message: Message) => SyncOrAsync<boolean>;
export const MentionPrefixPredicate = z.function().args(MessageInstance).returns(SyncOrAsync(z.boolean()));

/**
 * A function that returns whether this message should be ignored for a certain check.
 * @param message - Message to check.
 * @param command - Command to check.
 */
export type IgnoreCheckPredicate = (
	this: Command | CommandHandler,
	message: Message | AkairoMessage,
	command: Command
) => boolean;
export const IgnoreCheckPredicate = z
	.function()
	.args(z.union([MessageInstance, z.instanceof(AkairoMessage)]), CommandInstance)
	.returns(z.boolean());

/**
 * A function that returns the prefix(es) to use.
 * @param message - Message to get prefix for.
 */
export type PrefixSupplier = (this: Command | CommandHandler, message: Message) => SyncOrAsync<ArrayOrNot<string>>;
export const PrefixSupplier = z
	.function()
	.args(MessageInstance)
	.returns(SyncOrAsync(ArrayOrNot(z.string())));

export type CommandHandlerOptions = AkairoHandlerOptions<Command, CommandHandler> & {
	/**
	 * Regular expression to automatically make command aliases.
	 * For example, using `/-/g` would mean that aliases containing `-` would be valid with and without it.
	 * So, the alias `command-name` is valid as both `command-name` and `commandname`.
	 */
	aliasReplacement?: RegExp;

	/**
	 * Whether or not to allow mentions to the client user as a prefix.
	 * @default true
	 */
	allowMention?: boolean | MentionPrefixPredicate;

	/**
	 * Default argument options.
	 * @default {}
	 */
	argumentDefaults?: DefaultArgumentOptions;

	/**
	 * Automatically defer messages "BotName is thinking"
	 * @default false
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
	ignoreCooldown?: ArrayOrNot<Snowflake> | IgnoreCheckPredicate;

	/**
	 * ID of user(s) to ignore `userPermissions` checks or a function to ignore.
	 * @default []
	 */
	ignorePermissions?: ArrayOrNot<Snowflake> | IgnoreCheckPredicate;

	/**
	 * The prefix(es) for command parsing.
	 * @default "!"
	 */
	prefix?: ArrayOrNot<string> | PrefixSupplier;

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
};
export const CommandHandlerOptions = AkairoHandlerOptions.extend({
	aliasReplacement: z.instanceof(RegExp).optional(),
	allowMention: z.union([z.boolean(), MentionPrefixPredicate]).optional(),
	argumentDefaults: DefaultArgumentOptions.optional(),
	autoDefer: z.boolean().optional(),
	autoRegisterSlashCommands: z.boolean().optional(),
	blockBots: z.boolean().optional(),
	blockClient: z.boolean().optional(),
	commandUtil: z.boolean().optional(),
	commandUtilLifetime: z.number().optional(),
	commandUtilSweepInterval: z.number().optional(),
	defaultCooldown: z.number().optional(),
	fetchMembers: z.boolean().optional(),
	handleEdits: z.boolean().optional(),
	ignoreCooldown: z.union([ArrayOrNot(z.string()), IgnoreCheckPredicate]).optional(),
	ignorePermissions: z.union([ArrayOrNot(z.string()), IgnoreCheckPredicate]).optional(),
	prefix: z.union([ArrayOrNot(z.string()), PrefixSupplier]).optional(),
	storeMessages: z.boolean().optional(),
	typing: z.boolean().optional(),
	execSlash: z.boolean().optional(),
	skipBuiltInPostInhibitors: z.boolean().optional()
}).passthrough();

/**
 * Data for managing cooldowns.
 */
export type CooldownData = {
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
};

/**
 * Various parsed components of the message.
 */
export type ParsedComponentData = {
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
};

export type SlashResolveType =
	| "Attachment"
	| "Boolean"
	| "Channel"
	| "Integer"
	| "Member"
	| "Mentionable"
	| "Number"
	| "Role"
	| "String"
	| "User";

export const SlashResolveType = z.enum([
	"Attachment",
	"Boolean",
	"Channel",
	"Integer",
	"Member",
	"Mentionable",
	"Number",
	"Role",
	"String",
	"User"
]);

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
		| NonNullable<CommandInteractionOption["message"]>
		| NonNullable<CommandInteractionOption["attachment"]>;
};
