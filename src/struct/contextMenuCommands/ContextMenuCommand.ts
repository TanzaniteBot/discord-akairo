/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	ApplicationCommandType,
	type ContextMenuCommandInteraction,
	type LocalizationMap,
	type PermissionResolvable,
	type Snowflake
} from "discord.js";
import { isArrayOf, patchAbstract } from "../../util/Util.js";
import { AkairoModule, type AkairoModuleOptions } from "../AkairoModule.js";
import type { ContextMenuCommandHandler } from "./ContextMenuCommandHandler.js";

/**
 * Represents a context menu command.
 */
export abstract class ContextMenuCommand extends AkairoModule<ContextMenuCommandHandler, ContextMenuCommand> {
	/**
	 * Assign context menu commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
	 */
	public declare guilds?: Snowflake[];

	/**
	 * The name of the context menu command.
	 */
	public declare name: string;

	/**
	 * Usable only by the client owner.
	 */
	public declare ownerOnly?: boolean;

	/**
	 * Whether or not to allow client superUsers(s) only.
	 */
	public declare superUserOnly?: boolean;

	/**
	 * The type of the context menu command.
	 */
	public declare type: ApplicationCommandType.User | ApplicationCommandType.Message;

	/**
	 * Name localization.
	 */
	public declare nameLocalizations?: LocalizationMap;

	/**
	 * The default bitfield used to determine whether this command be used in a guild
	 */
	public declare defaultMemberPermissions?: PermissionResolvable;

	/**
	 * Whether the command is enabled in DMs
	 *
	 * **Cannot be enabled for command that specify `guilds`**
	 */
	public declare dmPermission?: boolean;

	/**
	 * @param id - Listener ID.
	 * @param options - Options for the context menu command.
	 */
	public constructor(id: string, options: ContextMenuCommandOptions) {
		const {
			category,
			guilds = [],
			name,
			ownerOnly,
			superUserOnly,
			type,
			nameLocalizations,
			slashDefaultMemberPermissions,
			slashDmPermission
		} = options;

		if (category !== undefined && typeof category !== "string") throw new TypeError("options.category must be a string.");
		if (guilds !== undefined && !isArrayOf(guilds, "string")) throw new TypeError("options.guilds must be an array of strings.");
		if (name !== undefined && typeof name !== "string") throw new TypeError("options.name must be a string.");
		if (ownerOnly !== undefined && typeof ownerOnly !== "boolean") throw new TypeError("options.ownerOnly must be a boolean");
		if (type !== ApplicationCommandType.User && type !== ApplicationCommandType.Message)
			throw new TypeError("options.type must be either ApplicationCommandType.User or ApplicationCommandType.Message.");
		if (nameLocalizations !== undefined && typeof nameLocalizations !== "object")
			throw new TypeError("options.nameLocalizations must be a object.");
		if (slashDmPermission != null && typeof slashDmPermission !== "boolean")
			throw new TypeError("options.slashDmPermission must be a boolean.");
		if (slashDmPermission != null && guilds.length > 0)
			throw new TypeError("You cannot set `options.slashDmPermission` with commands configured with `options.slashGuilds`.");

		super(id, { category });

		this.guilds = guilds;
		this.name = name;
		this.ownerOnly = ownerOnly;
		this.superUserOnly = superUserOnly;
		this.type = type;
		this.nameLocalizations = nameLocalizations;
		this.defaultMemberPermissions = slashDefaultMemberPermissions;
		this.dmPermission = slashDmPermission;
	}

	/**
	 * Executes the context menu command.
	 * @param interaction - The context menu command interaction.
	 */
	public abstract exec(interaction: ContextMenuCommandInteraction): any;
}

patchAbstract(ContextMenuCommand, "exec");

/**
 * Options to use for context menu command execution behavior.
 */
export interface ContextMenuCommandOptions extends AkairoModuleOptions {
	/**
	 * Assign context menu commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
	 * @default []
	 */
	guilds?: Snowflake[];

	/**
	 * The name of the context menu command.
	 */
	name: string;

	/**
	 * Usable only by the client owner.
	 */
	ownerOnly?: boolean;

	/**
	 * Whether or not to allow client superUsers(s) only.
	 */
	superUserOnly?: boolean;

	/**
	 * The type of the context menu command.
	 */
	type: ApplicationCommandType.User | ApplicationCommandType.Message;

	/**
	 * Name localization.
	 */
	nameLocalizations?: LocalizationMap;

	/**
	 * The default bitfield used to determine whether this command be used in a guild
	 */
	slashDefaultMemberPermissions?: PermissionResolvable;

	/**
	 * Whether the command is enabled in DMs
	 *
	 * **Cannot be enabled for commands that specify `guilds`**
	 */
	slashDmPermission?: boolean;
}
