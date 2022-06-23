/* eslint-disable @typescript-eslint/no-unused-vars */
import { s } from "@sapphire/shapeshift";
import {
	ApplicationCommandType,
	BitField,
	type ContextMenuCommandInteraction,
	type LocalizationMap,
	type PermissionResolvable,
	type Snowflake
} from "discord.js";
import { patchAbstract } from "../../util/Util.js";
import { AkairoModule, akairoModuleOptionsValidator, type AkairoModuleOptions } from "../AkairoModule.js";
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
	public declare ownerOnly: boolean;

	/**
	 * Whether or not to allow client superUsers(s) only.
	 */
	public declare superUserOnly: boolean;

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
		// eslint-disable-next-line prefer-const
		let { category, guilds, name, ownerOnly, superUserOnly, type, nameLocalizations, defaultMemberPermissions, dmPermission } =
			contextMenuCommandOptionsValidator.parse(options);

		if (dmPermission != null && guilds.length > 0)
			throw new TypeError("You cannot set `options.dmPermission` with commands configured with `options.guilds`.");
		if (guilds.length === 0) dmPermission ??= true;

		super(id, { category });

		this.guilds = guilds;
		this.name = name;
		this.ownerOnly = ownerOnly;
		this.superUserOnly = superUserOnly;
		this.type = <typeof this["type"]>type;
		this.nameLocalizations = nameLocalizations;
		this.defaultMemberPermissions = <typeof this["defaultMemberPermissions"]>defaultMemberPermissions;
		this.dmPermission = dmPermission;
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
	 * @default false
	 */
	ownerOnly?: boolean;

	/**
	 * Whether or not to allow client superUsers(s) only.
	 * @default false
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
	defaultMemberPermissions?: PermissionResolvable;

	/**
	 * Whether the command is enabled in DMs
	 *
	 * **Cannot be enabled for commands that specify `guilds`**
	 * @default guilds.length > 0 ? undefined : true
	 */
	dmPermission?: boolean;
}

export const contextMenuCommandOptionsValidator = akairoModuleOptionsValidator.extend({
	guilds: s.string.array.default([]),
	name: s.string,
	ownerOnly: s.boolean.default(false),
	superUserOnly: s.boolean.default(false),
	type: s.enum(ApplicationCommandType.User, ApplicationCommandType.Message),
	nameLocalizations: s.record(s.string.nullish).optional,
	defaultMemberPermissions: s.union(
		s.bigint,
		s.string,
		s.instance(BitField),
		s.bigint.array,
		s.string.array,
		s.instance(BitField).array
	).optional,
	dmPermission: s.boolean.optional
}).passthrough;
