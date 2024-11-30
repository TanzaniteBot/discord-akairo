import type { ContextMenuCommandInteraction } from "discord.js";
import type { ContextMenuCommandHandlerEvents } from "../../typings/events.js";
import { AkairoError } from "../../util/AkairoError.js";
import { BuiltInReason, ContextCommandHandlerEvent } from "../../util/Constants.js";
import type { AkairoClient } from "../AkairoClient.js";
import { AkairoHandler, type AkairoHandlerOptions } from "../AkairoHandler.js";
import type { InhibitorHandler } from "../inhibitors/InhibitorHandler.js";
import { ContextMenuCommand } from "./ContextMenuCommand.js";

/**
 * Loads context menu commands and handles them.
 */
export class ContextMenuCommandHandler extends AkairoHandler<
	ContextMenuCommand,
	ContextMenuCommandHandler,
	ContextMenuCommandHandlerEvents
> {
	/**
	 * Inhibitor handler to use.
	 */
	public inhibitorHandler?: InhibitorHandler;

	/**
	 * @param client - The Akairo client.
	 * @param options - Options.
	 */
	public constructor(client: AkairoClient, options: ContextMenuCommandHandlerOptions) {
		const {
			directory,
			classToHandle = ContextMenuCommand,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		} = options;

		if (!(classToHandle.prototype instanceof ContextMenuCommand || classToHandle === ContextMenuCommand)) {
			throw new AkairoError("INVALID_CLASS_TO_HANDLE", classToHandle.name, ContextMenuCommand.name);
		}

		super(client, { directory, classToHandle, extensions, automateCategories, loadFilter });

		this.setup();
	}

	/**
	 * Set up the context menu command handler
	 */
	protected setup() {
		this.client.once("clientReady", () => {
			this.client.on("interactionCreate", i => {
				if (i.isUserContextMenuCommand() || i.isMessageContextMenuCommand()) this.handle(i);
			});
		});
	}

	/**
	 * Handles an interaction.
	 * @param interaction - Interaction to handle.
	 */
	public async handle(interaction: ContextMenuCommandInteraction): Promise<boolean | null> {
		const command = this.modules.find(module => module.name === interaction.commandName);

		if (!command) {
			this.emit(ContextCommandHandlerEvent.NOT_FOUND, interaction);
			return false;
		}

		if (command.ownerOnly && !this.client.isOwner(interaction.user.id)) {
			this.emit(ContextCommandHandlerEvent.BLOCKED, interaction, command, BuiltInReason.OWNER);
		}
		if (command.superUserOnly && !this.client.isSuperUser(interaction.user.id)) {
			this.emit(ContextCommandHandlerEvent.BLOCKED, interaction, command, BuiltInReason.SUPER_USER);
		}

		try {
			this.emit(ContextCommandHandlerEvent.STARTED, interaction, command);
			const ret = await command.exec(interaction);
			this.emit(ContextCommandHandlerEvent.FINISHED, interaction, command, ret);
			return true;
		} catch (err) {
			this.emitError(err, interaction, command);
			return false;
		}
	}

	/**
	 * Handles errors from the handling.
	 * @param err - The error.
	 * @param interaction - Interaction that called the command.
	 * @param command - Command that errored.
	 */
	public emitError(err: Error, interaction: ContextMenuCommandInteraction, command: ContextMenuCommand): void {
		if (this.listenerCount(ContextCommandHandlerEvent.ERROR)) {
			this.emit(ContextCommandHandlerEvent.ERROR, err, interaction, command);
			return;
		}

		throw err;
	}
}

export type ContextMenuCommandHandlerOptions = AkairoHandlerOptions<
	ContextMenuCommand,
	ContextMenuCommandHandler,
	ContextMenuCommandHandlerEvents
>;
