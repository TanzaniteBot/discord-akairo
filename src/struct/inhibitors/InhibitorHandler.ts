import type { Awaitable, Message } from "discord.js";
import type { InhibitorHandlerEvents } from "../../typings/events.js";
import { AkairoError } from "../../util/AkairoError.js";
import type { AkairoMessage } from "../../util/AkairoMessage.js";
import { isPromise } from "../../util/Util.js";
import type { AkairoClient } from "../AkairoClient.js";
import { AkairoHandler, type AkairoHandlerOptions } from "../AkairoHandler.js";
import type { Command } from "../commands/Command.js";
import { Inhibitor } from "./Inhibitor.js";

/**
 * Loads inhibitors and checks messages.
 */
export class InhibitorHandler extends AkairoHandler<Inhibitor, InhibitorHandler> {
	/**
	 * @param client - The Akairo client.
	 * @param options - Options.
	 */
	public constructor(client: AkairoClient, options: InhibitorHandlerOptions) {
		const { directory, classToHandle = Inhibitor, extensions = [".js", ".ts"], automateCategories, loadFilter } = options;

		if (!(classToHandle.prototype instanceof Inhibitor || classToHandle === Inhibitor)) {
			throw new AkairoError("INVALID_CLASS_TO_HANDLE", classToHandle.name, Inhibitor.name);
		}

		super(client, { directory, classToHandle, extensions, automateCategories, loadFilter });
	}

	/**
	 * Tests inhibitors against the message.
	 * Returns the reason if blocked.
	 * @param type - Type of inhibitor, 'all', 'pre', or 'post'.
	 * @param message - Message to test.
	 * @param command - Command to use.
	 */
	public async test(
		type: "all" | "pre" | "post",
		message: Message | AkairoMessage,
		command?: Command
	): Promise<string | null | void> {
		if (!this.modules.size) return null;

		const inhibitors = this.modules.filter(i => i.type === type);
		if (!inhibitors.size) return null;

		const promises = [];

		for (const inhibitor of inhibitors.values()) {
			promises.push(
				(async () => {
					let inhibited = inhibitor.exec(message, command);
					if (isPromise(inhibited)) inhibited = await inhibited;
					if (inhibited) return inhibitor;
					return null;
				})()
			);
		}

		const inhibitedInhibitors = (await Promise.all(promises)).filter(r => r) as Inhibitor[];
		if (!inhibitedInhibitors.length) return null;

		inhibitedInhibitors.sort((a, b) => b.priority - a.priority);
		return inhibitedInhibitors[0].reason;
	}
}

type Events = InhibitorHandlerEvents;

export interface InhibitorHandler extends AkairoHandler<Inhibitor, InhibitorHandler> {
	on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
	once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this;
}

export type InhibitorHandlerOptions = AkairoHandlerOptions<Inhibitor, InhibitorHandler>;
