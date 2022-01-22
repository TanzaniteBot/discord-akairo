/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
import type { ApplicationCommandType, ContextMenuCommandInteraction, Snowflake } from "discord.js";
import AkairoError from "../../util/AkairoError.js";
import type Category from "../../util/Category.js";
import type AkairoClient from "../AkairoClient.js";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule.js";
import type ContextMenuCommandHandler from "./ContextMenuCommandHandler.js";

/**
 * Represents a context menu command.
 */
export default abstract class ContextMenuCommand extends AkairoModule {
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
	 * The category of this context menu command.
	 */
	public declare category: Category<string, ContextMenuCommand>;

	/**
	 * The Akairo client.
	 */
	public declare client: AkairoClient;

	/**
	 * The filepath.
	 */
	public declare filepath: string;

	/**
	 * The handler.
	 */
	public declare handler: ContextMenuCommandHandler;

	/**
	 * @param id - Listener ID.
	 * @param options - Options for the context menu command.
	 */
	public constructor(id: string, options: ContextMenuCommandOptions) {
		const { category, guilds, name, ownerOnly, superUserOnly, type } = options;

		super(id, { category });
		this.guilds = guilds;
		this.name = name;
		this.ownerOnly = ownerOnly;
		this.superUserOnly = superUserOnly;
		this.type = type;
	}

	/**
	 * Executes the context menu command.
	 * @param interaction - The context menu command interaction.
	 */
	public exec(interaction: ContextMenuCommandInteraction): any {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}
}

export default interface ContextMenuCommand extends AkairoModule {
	/**
	 * Reloads the context menu command.
	 */
	reload(): Promise<ContextMenuCommand>;

	/**
	 * Removes the context menu command.
	 */
	remove(): ContextMenuCommand;
}

/**
 * Options to use for context menu command execution behavior.
 */
export interface ContextMenuCommandOptions extends AkairoModuleOptions {
	/**
	 * Assign context menu commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
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
}
