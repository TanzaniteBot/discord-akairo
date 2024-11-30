import {
	ApplicationCommandType,
	type ContextMenuCommandInteraction,
	type LocalizationMap,
	type PermissionResolvable,
	type Snowflake
} from "discord.js";
import { z } from "zod";
import { type ContextMenuCommandHandlerEvents } from "../../typings/events.js";
import { PermissionResolvableValidator } from "../../typings/Util.js";
import { patchAbstract } from "../../util/Util.js";
import { AkairoModule, AkairoModuleOptions } from "../AkairoModule.js";
import type { ContextMenuCommandHandler } from "./ContextMenuCommandHandler.js";

/**
 * Represents a context menu command.
 */
export abstract class ContextMenuCommand extends AkairoModule<
	ContextMenuCommandHandler,
	ContextMenuCommand,
	ContextMenuCommandHandlerEvents
> {
	/**
	 * Assign context menu commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
	 */
	public guilds?: Snowflake[];

	/**
	 * The name of the context menu command.
	 */
	public name: string;

	/**
	 * Usable only by the client owner.
	 */
	public ownerOnly: boolean;

	/**
	 * Whether or not to allow client superUsers(s) only.
	 */
	public superUserOnly: boolean;

	/**
	 * The type of the context menu command.
	 */
	public type: ApplicationCommandType.User | ApplicationCommandType.Message;

	/**
	 * Name localization.
	 */
	public nameLocalizations?: LocalizationMap;

	/**
	 * The default bitfield used to determine whether this command be used in a guild
	 */
	public defaultMemberPermissions?: PermissionResolvable | null;

	/**
	 * Whether the command is enabled in DMs
	 *
	 * **Cannot be enabled for command that specify `guilds`**
	 */
	public dmPermission?: boolean;

	/**
	 * @param id - Listener ID.
	 * @param options - Options for the context menu command.
	 */
	public constructor(id: string, options: ContextMenuCommandOptions) {
		ContextMenuCommandOptions.parse(options);

		const {
			category,
			guilds = [],
			name,
			ownerOnly = false,
			superUserOnly = false,
			type,
			nameLocalizations,
			defaultMemberPermissions
		} = options;
		let { dmPermission } = options;

		if (dmPermission != null && guilds.length > 0)
			throw new TypeError("You cannot set `options.dmPermission` with commands configured with `options.guilds`.");
		if (guilds.length === 0) dmPermission ??= true;

		super(id, { category });

		this.guilds = guilds;
		this.name = name;
		this.ownerOnly = ownerOnly;
		this.superUserOnly = superUserOnly;
		this.type = <(typeof this)["type"]>type;
		this.nameLocalizations = nameLocalizations;
		this.defaultMemberPermissions = <(typeof this)["defaultMemberPermissions"]>defaultMemberPermissions;
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
export type ContextMenuCommandOptions = AkairoModuleOptions & {
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
	defaultMemberPermissions?: PermissionResolvable | null;

	/**
	 * Whether the command is enabled in DMs
	 *
	 * **Cannot be enabled for commands that specify `guilds`**
	 * @default guilds.length > 0 ? undefined : true
	 */
	dmPermission?: boolean;
};

export const ContextMenuCommandOptions = AkairoModuleOptions.extend({
	guilds: z.string().array().optional(),
	name: z.string(),
	ownerOnly: z.boolean().optional(),
	superUserOnly: z.boolean().optional(),
	type: z.union([z.literal(ApplicationCommandType.User), z.literal(ApplicationCommandType.Message)]),
	nameLocalizations: z.record(z.string().nullish()).optional(),
	defaultMemberPermissions: PermissionResolvableValidator.nullish(),
	dmPermission: z.boolean().optional()
}).passthrough();
