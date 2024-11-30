/* eslint-disable @typescript-eslint/no-empty-object-type */
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	ClientEvents,
	ContextMenuCommandInteraction,
	Message
} from "discord.js";
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
import type {
	AkairoClientEvent,
	AkairoHandlerEvent,
	BuiltInReason,
	CommandHandlerEvent,
	CommandPermissionMissing,
	ContextCommandHandlerEvent
} from "../util/Constants.js";
import type { MessageUnion, SlashCommandMessage, TextCommandMessage } from "./Util.js";

export interface AkairoHandlerEvents<
	Module extends AkairoModule<Handler, Module, any>,
	Handler extends AkairoHandler<Module, Handler, any>
> {
	/**
	 * Emitted when a module is loaded.
	 * @param mod - Module loaded.
	 * @param isReload - Whether or not this was a reload.
	 */
	[AkairoHandlerEvent.LOAD]: [mod: Module, isReload: boolean];

	/**
	 * Emitted when a module is removed.
	 * @param mod - Module removed.
	 */
	[AkairoHandlerEvent.REMOVE]: [mod: Module];
}

interface CommandHandlerEventsEnum extends AkairoHandlerEvents<Command, CommandHandler> {
	/**
	 * Emitted when a command is blocked by a post-message inhibitor. The built-in inhibitors are `owner`, `superUser`, `guild`, and `dm`.
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 * @param reason - Reason for the block.
	 */
	[CommandHandlerEvent.COMMAND_BLOCKED]: [message: TextCommandMessage, command: Command, reason: `${BuiltInReason}` | string];

	/**
	 * Emitted when a command breaks out with a retry prompt.
	 * @param message - Message sent.
	 * @param command - Command being broken out.
	 * @param breakMessage - Breakout message.
	 */
	[CommandHandlerEvent.COMMAND_BREAKOUT]: [message: TextCommandMessage, command: Command, breakMessage: Message];

	/**
	 * Emitted when a command is cancelled via prompt or argument cancel.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param retryMessage - Message to retry with. This is passed when a prompt was broken out of with a message that looks like a command.
	 */
	[CommandHandlerEvent.COMMAND_CANCELLED]: [message: TextCommandMessage, command: Command, retryMessage?: Message];

	/**
	 * Emitted when a command is cancelled because of a timeout.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param time - Timeout in milliseconds.
	 */
	[CommandHandlerEvent.COMMAND_TIMEOUT]: [message: TextCommandMessage, command: Command, time: number];

	/**
	 * Emitted when a command finishes execution.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 * @param returnValue - The command's return value.
	 */
	[CommandHandlerEvent.COMMAND_FINISHED]: [message: TextCommandMessage, command: Command, args: any, returnValue: any];

	/**
	 * Emitted when a command is invalid
	 * @param message - Message sent.
	 * @param command - Command executed.
	 */
	[CommandHandlerEvent.COMMAND_INVALID]: [message: TextCommandMessage, command: Command];

	/**
	 * Emitted when a command is locked
	 * @param message - Message sent.
	 * @param command - Command executed.
	 */
	[CommandHandlerEvent.COMMAND_LOCKED]: [message: MessageUnion, command: Command];

	/**
	 * Emitted when a command starts execution.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 */
	[CommandHandlerEvent.COMMAND_STARTED]: [message: TextCommandMessage, command: Command, args: any];

	/**
	 * Emitted when a command or slash command is found on cooldown.
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 * @param remaining - Remaining time in milliseconds for cooldown.
	 */
	[CommandHandlerEvent.COOLDOWN]: [message: MessageUnion, command: Command, remaining: number];

	/**
	 * Emitted when a command or inhibitor errors.
	 * @param error - The error.
	 * @param message - Message sent.
	 * @param command - Command executed.
	 */
	[CommandHandlerEvent.ERROR]: [error: Error, message: MessageUnion, command?: Command];

	/**
	 * Emitted when a user is in a command argument prompt.
	 * Used to prevent usage of commands during a prompt.
	 * @param message - Message sent.
	 */
	[CommandHandlerEvent.IN_PROMPT]: [message: TextCommandMessage];

	/**
	 * Emitted when a message is blocked by a pre-message inhibitor. The built-in inhibitors are 'client' and 'bot'.
	 * @param message - Message sent.
	 * @param reason - Reason for the block.
	 */
	[CommandHandlerEvent.MESSAGE_BLOCKED]: [message: MessageUnion, reason: string];

	/**
	 * Emitted when a message does not start with the prefix or match a command.
	 * @param message - Message sent.
	 */
	[CommandHandlerEvent.MESSAGE_INVALID]: [message: TextCommandMessage];

	/**
	 * Emitted when a command permissions check is failed.
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 * @param type - Either 'client' or 'user'.
	 * @param missing - The missing permissions.
	 */
	[CommandHandlerEvent.MISSING_PERMISSIONS]: [
		message: TextCommandMessage,
		command: Command,
		type: `${CommandPermissionMissing}`,
		missing?: any
	];

	/**
	 * Emitted when a slash command is blocked by a post-message inhibitor. The built-in inhibitors are `owner`, `superUser`, `guild`, and `dm`.
	 * @param message - The slash message.
	 * @param command - Command blocked.
	 * @param reason - Reason for the block.
	 */
	[CommandHandlerEvent.SLASH_BLOCKED]: [message: SlashCommandMessage, command: Command, reason: string];

	/**
	 * Emitted when a slash command errors.
	 * @param error - The error.
	 * @param message - The slash message.
	 * @param command - Command executed.
	 */
	[CommandHandlerEvent.SLASH_ERROR]: [error: Error, message: SlashCommandMessage, command: Command];

	/**
	 * Emitted when a slash command finishes execution.
	 * @param message - The slash message.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 * @param returnValue - The command's return value.
	 */
	[CommandHandlerEvent.SLASH_FINISHED]: [message: SlashCommandMessage, command: Command, args: any, returnValue: any];

	/**
	 * Emitted when a slash command permissions check is failed.
	 * @param message - The slash message.
	 * @param command - Command blocked.
	 * @param type - Either 'client' or 'user'.
	 * @param missing - The missing permissions.
	 */
	[CommandHandlerEvent.SLASH_MISSING_PERMISSIONS]: [
		message: SlashCommandMessage,
		command: Command,
		type: `${CommandPermissionMissing}`,
		missing?: any
	];

	/**
	 * Emitted when a an incoming interaction command cannot be matched with a command.
	 * @param interaction - The incoming interaction.
	 */
	[CommandHandlerEvent.SLASH_NOT_FOUND]: [interaction: ChatInputCommandInteraction | AutocompleteInteraction];

	/**
	 * Emitted when a slash command starts execution.
	 * @param message - The slash message.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 */
	[CommandHandlerEvent.SLASH_STARTED]: [message: SlashCommandMessage, command: Command, args: any];

	/**
	 * Emitted when a normal command is blocked because the command is configured to be `slashOnly`
	 * @param message - Message sent.
	 * @param command - Command blocked.
	 */
	[CommandHandlerEvent.SLASH_ONLY]: [message: Message, command: Command];
}

export type CommandHandlerEvents = { [K in keyof CommandHandlerEventsEnum as `${K}`]: CommandHandlerEventsEnum[K] };

interface InhibitorHandlerEventsEnum extends AkairoHandlerEvents<Inhibitor, InhibitorHandler> {}

export type InhibitorHandlerEvents = { [K in keyof InhibitorHandlerEventsEnum as `${K}`]: InhibitorHandlerEventsEnum[K] };

interface ListenerHandlerEventsEnum extends AkairoHandlerEvents<Listener, ListenerHandler> {}

export type ListenerHandlerEvents = { [K in keyof ListenerHandlerEventsEnum as `${K}`]: ListenerHandlerEventsEnum[K] };

interface TaskHandlerEventsEnum extends AkairoHandlerEvents<Task, TaskHandler> {}

export type TaskHandlerEvents = { [K in keyof TaskHandlerEventsEnum as `${K}`]: TaskHandlerEventsEnum[K] };

interface ContextMenuCommandHandlerEventsEnum extends AkairoHandlerEvents<ContextMenuCommand, ContextMenuCommandHandler> {
	/**
	 * Emitted when a context menu command errors.
	 * @param error - The error.
	 * @param interaction - The interaction.
	 * @param command - Command executed.
	 */
	[ContextCommandHandlerEvent.ERROR]: [error: Error, interaction: ContextMenuCommandInteraction, command: ContextMenuCommand];

	/**
	 * Emitted when a context menu command finishes execution.
	 * @param interaction - The interaction.
	 * @param command - Command executed.
	 * @param returnValue - The command's return value.
	 */
	[ContextCommandHandlerEvent.FINISHED]: [
		interaction: ContextMenuCommandInteraction,
		command: ContextMenuCommand,
		returnValue: any
	];

	/**
	 * Emitted when a an incoming interaction command cannot be matched with a command.
	 * @param interaction - The incoming interaction.
	 */
	[ContextCommandHandlerEvent.NOT_FOUND]: [interaction: ContextMenuCommandInteraction];

	/**
	 * Emitted when a command starts execution.
	 * @param interaction - The interaction.
	 * @param command - Command executed.
	 * @param args - The args passed to the command.
	 */
	[ContextCommandHandlerEvent.STARTED]: [interaction: ContextMenuCommandInteraction, command: ContextMenuCommand];

	/**
	 * Emitted when a command is blocked.
	 * @param interaction - The interaction.
	 * @param command - Command blocked.
	 * @param reason - Reason for the block.
	 */
	[ContextCommandHandlerEvent.BLOCKED]: [
		interaction: ContextMenuCommandInteraction,
		command: ContextMenuCommand,
		reason: `${BuiltInReason.OWNER | BuiltInReason.SUPER_USER}`
	];
}

export type ContextMenuCommandHandlerEvents = {
	[K in keyof ContextMenuCommandHandlerEventsEnum as `${K}`]: ContextMenuCommandHandlerEventsEnum[K];
};

interface AkairoClientEventsEnum extends ClientEvents {
	/**
	 * Emitted for akairo debugging information.
	 */
	[AkairoClientEvent.AKAIRO_DEBUG]: [message: string, ...other: any[]];
}

export type AkairoClientEvents = { [K in keyof AkairoClientEventsEnum as `${K}`]: AkairoClientEventsEnum[K] };
