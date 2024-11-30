import { z } from "zod";
import { type InhibitorHandlerEvents } from "../../typings/events.js";
import { type MessageUnion, type SyncOrAsync, type TextCommandMessage } from "../../typings/Util.js";
import { patchAbstract } from "../../util/Util.js";
import { AkairoModule, AkairoModuleOptions } from "../AkairoModule.js";
import type { Command } from "../commands/Command.js";
import type { InhibitorHandler } from "./InhibitorHandler.js";

/**
 * Represents an inhibitor.
 */
export abstract class Inhibitor extends AkairoModule<InhibitorHandler, Inhibitor, InhibitorHandlerEvents> {
	/**
	 * The priority of the inhibitor.
	 */
	public priority: number;

	/**
	 * Reason emitted when command is inhibited.
	 */
	public reason: string;

	/**
	 * The type of the inhibitor for when it should run.
	 */
	public type: InhibitorTypeString;

	/**
	 * @param id - Inhibitor ID.
	 * @param options - Options for the inhibitor.
	 */
	public constructor(id: string, options: InhibitorOptions = {}) {
		InhibitorOptions.parse(options);

		const { category, reason = "", type = InhibitorType.Post, priority = 0 } = options;

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
	public abstract exec(message: TextCommandMessage, command?: Command): SyncOrAsync<boolean>;
	public abstract exec(message: MessageUnion, command?: Command): SyncOrAsync<boolean>;
}

patchAbstract(Inhibitor, "exec");

export enum InhibitorType {
	/**
	 * Runs on all messages.
	 */
	All = "all",

	/**
	 * Runs on messages not blocked by the built-in inhibitors.
	 */
	Pre = "pre",

	/**
	 * Runs on messages that are commands.
	 */
	Post = "post"
}

export type InhibitorTypeString = `${InhibitorType}`;

/**
 * Options to use for inhibitor execution behavior.
 */
export type InhibitorOptions = AkairoModuleOptions & {
	/**
	 * Reason emitted when command or message is blocked.
	 * @default ""
	 */
	reason?: string;

	/**
	 * Can be 'all' to run on all messages, 'pre' to run on messages not blocked by the built-in inhibitors, or 'post' to run on messages that are commands.
	 * @default "post"
	 */
	type?: InhibitorTypeString;

	/**
	 * Priority for the inhibitor for when more than one inhibitors block a message.
	 * The inhibitor with the highest priority is the one that is used for the block reason.
	 * @default 0
	 */
	priority?: number;
};

export const InhibitorOptions = AkairoModuleOptions.extend({
	reason: z.string().optional(),
	type: z.nativeEnum(InhibitorType).optional(),
	priority: z.number().optional()
}).passthrough();
