import "source-map-support/register";
import packageJSON from "../package.json";
import AkairoClient, { AkairoOptions } from "./struct/AkairoClient";
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from "./struct/AkairoHandler";
import AkairoModule, { AkairoModuleOptions } from "./struct/AkairoModule";
import ClientUtil from "./struct/ClientUtil";
import Argument, {
	ArgumentMatch,
	ArgumentOptions,
	ArgumentPromptData,
	ArgumentPromptOptions,
	ArgumentType,
	ArgumentTypeCaster,
	ArgumentTypeCaster_,
	BaseArgumentType,
	DefaultArgumentOptions,
	DefaultValueSupplier,
	FailureData,
	OtherwiseContentModifier,
	OtherwiseContentSupplier,
	ParsedValuePredicate,
	PromptContentModifier,
	PromptContentSupplier
} from "./struct/commands/arguments/Argument";
import ArgumentRunner, { ArgumentRunnerState } from "./struct/commands/arguments/ArgumentRunner";
import TypeResolver from "./struct/commands/arguments/TypeResolver";
import Command, {
	AkairoApplicationCommandAutocompleteOption,
	AkairoApplicationCommandChannelOptionData,
	AkairoApplicationCommandChoicesData,
	AkairoApplicationCommandNonOptionsData,
	AkairoApplicationCommandNumericOptionData,
	AkairoApplicationCommandOptionData,
	AkairoApplicationCommandSubCommandData,
	AkairoApplicationCommandSubGroupData,
	ArgumentGenerator,
	BeforeAction,
	CommandOptions,
	ExecutionPredicate,
	KeySupplier,
	MissingPermissionSupplier,
	RegexSupplier,
	SlashOption,
	SlashPermissionsSupplier
} from "./struct/commands/Command";
import CommandHandler, {
	CommandHandlerOptions,
	CooldownData,
	IgnoreCheckPredicate,
	MentionPrefixPredicate,
	ParsedComponentData,
	PrefixSupplier,
	SlashResolveTypes
} from "./struct/commands/CommandHandler";
import CommandUtil from "./struct/commands/CommandUtil";
import ContentParser, {
	ContentParserOptions,
	ContentParserResult,
	ExtractedFlags,
	StringData
} from "./struct/commands/ContentParser";
import Flag from "./struct/commands/Flag";
import ContextMenuCommand, { ContextMenuCommandOptions } from "./struct/contextMenuCommands/ContextMenuCommand";
import ContextMenuCommandHandler from "./struct/contextMenuCommands/ContextMenuCommandHandler";
import Inhibitor, { InhibitorOptions } from "./struct/inhibitors/Inhibitor";
import InhibitorHandler from "./struct/inhibitors/InhibitorHandler";
import Listener, { ListenerOptions, ListenerType } from "./struct/listeners/Listener";
import ListenerHandler from "./struct/listeners/ListenerHandler";
import Task, { TaskOptions } from "./struct/tasks/Task";
import TaskHandler from "./struct/tasks/TaskHandler";
import type {
	AkairoClientEvents,
	AkairoHandlerEvents,
	CommandHandlerEvents,
	ContextMenuCommandHandlerEvents,
	InhibitorHandlerEvents,
	ListenerHandlerEvents,
	TaskHandlerEvents
} from "./typings/events";
import type { GuildTextBasedChannels } from "./typings/guildTextBasedChannels";
import AkairoError from "./util/AkairoError";
import AkairoMessage from "./util/AkairoMessage";
import Category from "./util/Category";
import * as Constants from "./util/Constants";
import Util from "./util/Util";

const version = packageJSON.version;

declare module "discord.js" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export interface Message<Cached extends boolean = boolean> extends Base {
		/**
		 * Extra properties applied to the Discord.js message object.
		 * Utilities for command responding.
		 * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client).
		 * Not all properties of the util are available, depending on the input.
		 * */
		util?: CommandUtil<Message>;
	}
}

export {
	AkairoClient,
	AkairoError,
	AkairoHandler,
	AkairoMessage,
	AkairoModule,
	Argument,
	ArgumentRunner,
	ArgumentRunnerState,
	Category,
	ClientUtil,
	Command,
	CommandHandler,
	CommandUtil,
	Constants,
	ContentParser,
	ContentParserResult,
	ContextMenuCommand,
	ContextMenuCommandHandler,
	Flag,
	Inhibitor,
	InhibitorHandler,
	Listener,
	ListenerHandler,
	PromptContentModifier,
	Task,
	TaskHandler,
	TypeResolver,
	Util,
	version
};
export type {
	AkairoApplicationCommandAutocompleteOption,
	AkairoApplicationCommandChannelOptionData,
	AkairoApplicationCommandChoicesData,
	AkairoApplicationCommandNonOptionsData,
	AkairoApplicationCommandNumericOptionData,
	AkairoApplicationCommandOptionData,
	AkairoApplicationCommandSubCommandData,
	AkairoApplicationCommandSubGroupData,
	AkairoClientEvents,
	AkairoHandlerEvents,
	AkairoHandlerOptions,
	AkairoModuleOptions,
	AkairoOptions,
	ArgumentGenerator,
	ArgumentMatch,
	ArgumentOptions,
	ArgumentPromptData,
	ArgumentPromptOptions,
	ArgumentType,
	ArgumentTypeCaster_,
	ArgumentTypeCaster,
	BaseArgumentType,
	BeforeAction,
	CommandHandlerEvents,
	CommandHandlerOptions,
	CommandOptions,
	ContentParserOptions,
	ContextMenuCommandHandlerEvents,
	ContextMenuCommandOptions,
	CooldownData,
	DefaultArgumentOptions,
	DefaultValueSupplier,
	ExecutionPredicate,
	ExtractedFlags,
	FailureData,
	GuildTextBasedChannels,
	IgnoreCheckPredicate,
	InhibitorHandlerEvents,
	InhibitorOptions,
	KeySupplier,
	ListenerHandlerEvents,
	ListenerOptions,
	ListenerType,
	LoadPredicate,
	MentionPrefixPredicate,
	MissingPermissionSupplier,
	OtherwiseContentModifier,
	OtherwiseContentSupplier,
	ParsedComponentData,
	ParsedValuePredicate,
	PrefixSupplier,
	PromptContentSupplier,
	RegexSupplier,
	SlashOption,
	SlashPermissionsSupplier,
	SlashResolveTypes,
	StringData,
	TaskHandlerEvents,
	TaskOptions
};
