import { Message } from "discord.js";
import AkairoError from "../../util/AkairoError";
import AkairoMessage from "../../util/AkairoMessage";
import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule";
import Command from "../commands/Command";
import InhibitorHandler from "./InhibitorHandler";

/**
 * Represents an inhibitor.
 * @param id - Inhibitor ID.
 * @param options - Options for the inhibitor.
 */
export default abstract class Inhibitor extends AkairoModule {
	public constructor(
		id: string,
		{
			category,
			reason = "",
			type = "post",
			priority = 0
		}: InhibitorOptions = {}
	) {
		super(id, { category });

		this.reason = reason;

		this.type = type;

		this.priority = priority;
	}

	/**
	 * The priority of the inhibitor.
	 */
	public priority: number;

	/**
	 * The category the inhibitor belongs to.
	 */
	public declare category: Category<string, Inhibitor>;

	/**
	 * The Akairo client.
	 */
	public declare client: AkairoClient;

	/**
	 * The filepath.
	 */
	public declare filepath: string;

	/**
	 * The inhibitor handler.
	 */
	public declare handler: InhibitorHandler;

	/**
	 * The ID of this inhibitor.
	 */
	public declare id: string;

	/**
	 * Reason emitted when command is inhibited.
	 */
	public reason: string;

	/**
	 * The type of the inhibitor for when it should run.
	 */
	public type: string;

	/**
	 * Checks if message should be blocked.
	 * A return value of true will block the message.
	 * If returning a Promise, a resolved value of true will block the message.
	 * @param message - Message being handled.
	 * @param command - Command to check.
	 */
	/* eslint-disable func-names, @typescript-eslint/no-unused-vars */
	/* public exec(message: Message, command?: Command): boolean | Promise<boolean>; */
	public exec(
		message: Message | AkairoMessage,
		command?: Command
	): boolean | Promise<boolean> {
		throw new AkairoError("NOT_IMPLEMENTED", this.constructor.name, "exec");
	}
	/* eslint-enable func-names, @typescript-eslint/no-unused-vars */

	/**
	 * Reloads the inhibitor.
	 */
	public override reload(): Inhibitor {
		return super.reload() as Inhibitor;
	}

	/**
	 * Removes the inhibitor.
	 */
	public override remove(): Inhibitor {
		return super.remove() as Inhibitor;
	}
}

/**
 * Options to use for inhibitor execution behavior.
 * Also includes properties from AkairoModuleOptions.
 */
export interface InhibitorOptions extends AkairoModuleOptions {
	/**
	 * Reason emitted when command or message is blocked.
	 */
	reason?: string;

	/**
	 * Can be 'all' to run on all messages, 'pre' to run on messages not blocked by the built-in inhibitors, or 'post' to run on messages that are commands.
	 * Defaults to `post`
	 */
	type?: "all" | "pre" | "post";

	/**
	 * Priority for the inhibitor for when more than one inhibitors block a message.
	 * The inhibitor with the highest priority is the one that is used for the block reason.
	 * Defaults to `0`
	 */
	priority?: number;
}
