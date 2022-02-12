import packageJSON from "../package.json";
import { CommandUtil } from "./struct/commands/CommandUtil";
import * as Constants from "./util/Constants";
export { AkairoClient, type AkairoOptions } from "./struct/AkairoClient";
export { AkairoHandler, type AkairoHandlerOptions, type LoadPredicate } from "./struct/AkairoHandler";
export { AkairoModule, AkairoModuleOptions } from "./struct/AkairoModule";
export { ClientUtil } from "./struct/ClientUtil";
export {
	Argument,
	type ArgumentMatch,
	type ArgumentOptions,
	type ArgumentPromptData,
	type ArgumentPromptOptions,
	type ArgumentType,
	type ArgumentTypeCaster,
	type BaseArgumentType,
	type DefaultArgumentOptions,
	type DefaultValueSupplier,
	type FailureData,
	type OtherwiseContentModifier,
	type OtherwiseContentSupplier,
	type ParsedValuePredicate,
	type PromptContentModifier,
	type PromptContentSupplier
} from "./struct/commands/arguments/Argument";
export { ArgumentRunner, type ArgumentRunnerState } from "./struct/commands/arguments/ArgumentRunner";
export { TypeResolver } from "./struct/commands/arguments/TypeResolver";
export {
	Command,
	type AkairoApplicationCommandAutocompleteOption,
	type AkairoApplicationCommandChannelOptionData,
	type AkairoApplicationCommandChoicesData,
	type AkairoApplicationCommandNonOptionsData,
	type AkairoApplicationCommandNumericOptionData,
	type AkairoApplicationCommandOptionData,
	type AkairoApplicationCommandSubCommandData,
	type AkairoApplicationCommandSubGroupData,
	type ArgumentGenerator,
	type ArgumentGeneratorReturn,
	type BeforeAction,
	type CommandOptions,
	type ExecutionPredicate,
	type KeySupplier,
	type MissingPermissionSupplier,
	type RegexSupplier,
	type SlashOption,
	type SlashPermissionsSupplier
} from "./struct/commands/Command";
export {
	CommandHandler,
	type CommandHandlerOptions,
	type CooldownData,
	type IgnoreCheckPredicate,
	type MentionPrefixPredicate,
	type ParsedComponentData,
	type PrefixSupplier,
	type RegisterInteractionCommandError,
	type SlashResolveType
} from "./struct/commands/CommandHandler";
export { CommandUtil } from "./struct/commands/CommandUtil";
export {
	ContentParser,
	type ContentParserOptions,
	type ContentParserResult,
	type ExtractedFlags,
	type StringData
} from "./struct/commands/ContentParser";
export { Flag } from "./struct/commands/Flag";
export { ContextMenuCommand, type ContextMenuCommandOptions } from "./struct/contextMenuCommands/ContextMenuCommand";
export { ContextMenuCommandHandler } from "./struct/contextMenuCommands/ContextMenuCommandHandler";
export { Inhibitor, type InhibitorOptions } from "./struct/inhibitors/Inhibitor";
export { InhibitorHandler } from "./struct/inhibitors/InhibitorHandler";
export { Listener, type ListenerOptions, type ListenerType } from "./struct/listeners/Listener";
export { ListenerHandler } from "./struct/listeners/ListenerHandler";
export { Task, type TaskOptions } from "./struct/tasks/Task";
export { TaskHandler } from "./struct/tasks/TaskHandler";
export type {
	AkairoClientEvents,
	AkairoHandlerEvents,
	CommandHandlerEvents,
	ContextMenuCommandHandlerEvents,
	InhibitorHandlerEvents,
	ListenerHandlerEvents,
	TaskHandlerEvents
} from "./typings/events";
export { AkairoError } from "./util/AkairoError";
export { AkairoMessage } from "./util/AkairoMessage";
export { Category } from "./util/Category";
export { Util } from "./util/Util";
export { Constants };
export const { version } = packageJSON;

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
