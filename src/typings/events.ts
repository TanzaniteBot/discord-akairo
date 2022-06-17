/* eslint-disable @typescript-eslint/no-empty-interface */
import type { ChatInputCommandInteraction, ClientEvents, ContextMenuCommandInteraction, Message } from "discord.js";
import type { AkairoHandler } from "../struct/AkairoHandler.js";
import type { AkairoModule } from "../struct/AkairoModule.js";
import type { Command } from "../struct/commands/Command.js";
import type { CommandHandler } from "../struct/commands/CommandHandler.js";
import type { ContextMenuCommand } from "../struct/contextMenuCommands/ContextMenuCommand.js";
import type { ContextMenuCommandHandler } from "../struct/contextMenuCommands/ContextMenuCommandHandler.js";
import type { Inhibitor } from "../struct/inhibitors/Inhibitor.js";
import type { InhibitorHandler } from "../struct/inhibitors/InhibitorHandler.js";
import type { Listener } from "../struct/listeners/Listener.js";
import type { ListenerHandler } from "../struct/listeners/ListenerHandler.js";
import type { Task } from "../struct/tasks/Task.js";
import type { TaskHandler } from "../struct/tasks/TaskHandler.js";
import type { AkairoMessage } from "../util/AkairoMessage.js";
import type { BuiltInReasons } from "../util/Constants.js";

export interface AkairoHandlerEvents<
	Module extends AkairoModule<Handler, Module>,
	Handler extends AkairoHandler<Module, Handler>
> {
	/**
	 * Emitted when a module is loaded.
	 * @param mod - Module loaded.
	 * @param isReload - Whether or not this was a reload.
	 */
	load: [mod: Module, isReload: boolean];

	/**
	 * Emitted when a module is removed.
	 * @param mod - Module removed.
	 */
	remove: [mod: Module];
}

export interface CommandHandlerEvents extends AkairoHandlerEvents<Command, CommandHandler> {
	/**
	 * Emitted when a command is blocked by a post-message inhibitor. The built-in inhibitors are `owner`, `superUser`, `guild`, and `dm`.
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 * @param reason - Reason for the block.
	 */
	commandBlocked: [message: Message, command: Command, reason: typeof BuiltInReasons | string];

	/**
	 * Emitted when a command breaks out with a retry prompt.
	 * @param message - Message sent.
	 * @param command - Command being broken out.
	 * @param breakMessage - Breakout message.
	 */
	commandBreakout: [message: Message, command: Command, breakMessage: Message];

	/**
	 * Emitted when a command is cancelled via prompt or argument cancel.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param retryMessage - Message to retry with. This is passed when a prompt was broken out of with a message that looks like a command.
	 */
	commandCancelled: [message: Message, command: Command, retryMessage?: Message];

	/**
	 * Emitted when a command is cancelled because of a timeout.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param time - Timeout in milliseconds.
	 */
	commandTimeout: [message: Message, command: Command, time: number];

	/**
	 * Emitted when a command finishes execution.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 * @param returnValue - The command's return value.
	 */
	commandFinished: [message: Message, command: Command, args: any, returnValue: any];

	/**
	 * Emitted when a command is invalid
	 * @param message - Message sent.
	 * @param command - Command executed.
	 */
	commandInvalid: [message: Message, command: Command];

	/**
	 * Emitted when a command is locked
	 * @param message - Message sent.
	 * @param command - Command executed.
	 */
	commandLocked: [message: Message, command: Command];

	/**
	 * Emitted when a command starts execution.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 */
	commandStarted: [message: Message, command: Command, args: any];

	/**
	 * Emitted when a command or slash command is found on cooldown.
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 * @param remaining - Remaining time in milliseconds for cooldown.
	 */
	cooldown: [message: Message | AkairoMessage, command: Command, remaining: number];

	/**
	 * Emitted when a command or inhibitor errors.
	 * @param error - The error.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 */
	error: [error: Error, message: Message, command?: Command];

	/**
	 * Emitted when a user is in a command argument prompt.
	 * Used to prevent usage of commands during a prompt.
	 * @param message - Message sent.
	 */
	inPrompt: [message: Message];

	/**
	 * Emitted when a message is blocked by a pre-message inhibitor. The built-in inhibitors are 'client' and 'bot'.
	 * @param message - Message sent.
	 * @param reason - Reason for the block.
	 */
	messageBlocked: [message: Message | AkairoMessage, reason: string];

	/**
	 * Emitted when a message does not start with the prefix or match a command.
	 * @param message - Message sent.
	 */
	messageInvalid: [message: Message];

	/**
	 * Emitted when a command permissions check is failed.
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 * @param type - Either 'client' or 'user'.
	 * @param missing - The missing permissions.
	 */
	missingPermissions: [message: Message, command: Command, type: "client" | "user", missing?: any];

	/**
	 * Emitted when a slash command is blocked by a post-message inhibitor. The built-in inhibitors are `owner`, `superUser`, `guild`, and `dm`.
	 * @param message - The slash message.
	 * @param command - Command blocked.
	 * @param reason - Reason for the block.
	 */
	slashBlocked: [message: AkairoMessage, command: Command, reason: string];

	/**
	 * Emitted when a slash command errors.
	 * @param error - The error.
	 * @param message - The slash message.
	 * @param command - Command executed.
	 */
	slashError: [error: Error, message: AkairoMessage, command: Command];

	/**
	 * Emitted when a slash command finishes execution.
	 * @param message - The slash message.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 * @param returnValue - The command's return value.
	 */
	slashFinished: [message: AkairoMessage, command: Command, args: any, returnValue: any];

	/**
	 * Emitted when a slash command permissions check is failed.
	 * @param message - The slash message.
	 * @param command - Command blocked.
	 * @param type - Either 'client' or 'user'.
	 * @param missing - The missing permissions.
	 */
	slashMissingPermissions: [message: AkairoMessage, command: Command, type: "user" | "client", missing?: any];

	/**
	 * Emitted when a an incoming interaction command cannot be matched with a command.
	 * @param interaction - The incoming interaction.
	 */
	slashNotFound: [interaction: ChatInputCommandInteraction];

	/**
	 * Emitted when a slash command starts execution.
	 * @param message - The slash message.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 */
	slashStarted: [message: AkairoMessage, command: Command, args: any];

	/**
	 * Emitted when a normal command is blocked because the command is configured to be `slashOnly`
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 */
	slashOnly: [message: Message, command: Command];
}

export interface InhibitorHandlerEvents extends AkairoHandlerEvents<Inhibitor, InhibitorHandler> {}

export interface ListenerHandlerEvents extends AkairoHandlerEvents<Listener, ListenerHandler> {}

export interface TaskHandlerEvents extends AkairoHandlerEvents<Task, TaskHandler> {}

export interface ContextMenuCommandHandlerEvents extends AkairoHandlerEvents<ContextMenuCommand, ContextMenuCommandHandler> {
	/**
	 * Emitted when a context menu command errors.
	 * @param error - The error.
	 * @param interaction - The interaction.
	 * @param command - Command executed.
	 */
	error: [error: Error, interaction: ContextMenuCommandInteraction, command: ContextMenuCommand];

	/**
	 * Emitted when a context menu command finishes execution.
	 * @param interaction - The interaction.
	 * @param command - Command executed.
	 * @param returnValue - The command's return value.
	 */
	finished: [interaction: ContextMenuCommandInteraction, command: ContextMenuCommand, returnValue: any];

	/**
	 * Emitted when a an incoming interaction command cannot be matched with a command.
	 * @param interaction - The incoming interaction.
	 */
	notFound: [interaction: ContextMenuCommandInteraction];

	/**
	 * Emitted when a command starts execution.
	 * @param interaction - The interaction.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 */
	started: [interaction: ContextMenuCommandInteraction, command: ContextMenuCommand];

	/**
	 * Emitted when a command is blocked.
	 * @param interaction - The interaction.
	 * @param command - Command blocked.
	 * @param reason - Reason for the block.
	 */
	blocked: [
		interaction: ContextMenuCommandInteraction,
		command: Command,
		reason: typeof BuiltInReasons.OWNER | typeof BuiltInReasons.SUPER_USER
	];
}

export interface AkairoClientEvents extends ClientEvents {
	/**
	 * Emitted for akairo debugging information.
	 */
	akairoDebug: [message: string, ...other: any[]];
}
