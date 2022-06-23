/* eslint-disable @typescript-eslint/no-unused-vars */
import { s } from "@sapphire/shapeshift";
import type { Message } from "discord.js";
import type { AkairoMessage } from "../../util/AkairoMessage.js";
import { patchAbstract } from "../../util/Util.js";
import { AkairoModule, AkairoModuleOptions, akairoModuleOptionsValidator } from "../AkairoModule.js";
import type { Command } from "../commands/Command.js";
import type { InhibitorHandler } from "./InhibitorHandler.js";

/**
 * Represents an inhibitor.
 */
export abstract class Inhibitor extends AkairoModule<InhibitorHandler, Inhibitor> {
	/**
	 * The priority of the inhibitor.
	 */
	public declare priority: number;

	/**
	 * Reason emitted when command is inhibited.
	 */
	public declare reason: string;

	/**
	 * The type of the inhibitor for when it should run.
	 */
	public declare type: string;

	/**
	 * @param id - Inhibitor ID.
	 * @param options - Options for the inhibitor.
	 */
	public constructor(id: string, options: InhibitorOptions = {}) {
		const { category, reason, type, priority } = inhibitorOptionsValidator.parse(options);

		super(id, { category });

		this.reason = reason;
		this.type = type;
		this.priority = priority;
	}

	/**
	 * Checks if message should be blocked.
	 * A return value of true will block the message.
	 * If returning a Promise, a resolved value of true will block the message.
	 * @param message - Message being handled.
	 * @param command - Command to check.
	 */
	public abstract exec(message: Message, command?: Command): boolean | Promise<boolean>;
	public abstract exec(message: Message | AkairoMessage, command?: Command): boolean | Promise<boolean>;
}

patchAbstract(Inhibitor, "exec");

/**
 * Options to use for inhibitor execution behavior.
 */
export interface InhibitorOptions extends AkairoModuleOptions {
	/**
	 * Reason emitted when command or message is blocked.
	 * @default ""
	 */
	reason?: string;

	/**
	 * Can be 'all' to run on all messages, 'pre' to run on messages not blocked by the built-in inhibitors, or 'post' to run on messages that are commands.
	 * @default "post"
	 */
	type?: "all" | "pre" | "post";

	/**
	 * Priority for the inhibitor for when more than one inhibitors block a message.
	 * The inhibitor with the highest priority is the one that is used for the block reason.
	 * @default 0
	 */
	priority?: number;
}

export const inhibitorOptionsValidator = akairoModuleOptionsValidator.extend({
	reason: s.string.default(""),
	type: s.enum("all", "pre", "post").default("post"),
	priority: s.number.default(0)
}).passthrough;
