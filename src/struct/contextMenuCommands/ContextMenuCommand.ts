/* eslint-disable spaced-comment */
import { ContextMenuInteraction, Snowflake } from "discord.js";
import AkairoError from "../../util/AkairoError";
import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule";
import ContextMenuCommandHandler from "./ContextMenuCommandHandler";

/**
 * Represents a context menu command.
 * @param id - Listener ID.
 * @param options - Options for the context menu command.
 */
export default abstract class ContextMenuCommand extends AkairoModule {
	public constructor(id: string, { category, guilds, name, type }: ContextMenuCommandOptions) {
		super(id, { category });
		this.guilds = guilds;
		this.name = name;
		this.type = type;
	}

	/**
	 * Assign context menu commands to Specific guilds. This option will make the commands not register globally, but only in the chosen servers.
	 */
	public guilds: Snowflake[];

	/**
	 * The name of the context menu command.
	 */
	public name: string;

	/**
	 * The type of the context menu command.
	 */
	public type: "USER" | "MESSAGE";

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
	 * Executes the context menu command.
	 * @param interaction - The context menu command interaction.
	 */
	// eslint-disable-next-line func-names, @typescript-eslint/no-unused-vars
	public exec(interaction: ContextMenuInteraction): any {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}

	/**
	 * Reloads the context menu command.
	 */
	public override reload(): ContextMenuCommand {
		return super.reload() as ContextMenuCommand;
	}

	/**
	 * Removes the context menu command.
	 */
	public override remove(): ContextMenuCommand {
		return super.remove() as ContextMenuCommand;
	}
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
	 * The type of the context menu command.
	 */
	type: "USER" | "MESSAGE";
}
