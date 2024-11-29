import type { CommandUtil } from "./struct/commands/CommandUtil.js";

declare module "discord.js" {
	export interface Message<InGuild extends boolean = boolean> extends Base {
		/**
		 * Extra properties applied to the Discord.js message object.
		 * Utilities for command responding.
		 * Available on all messages after `'all'` inhibitors and built-in inhibitors (bot, client).
		 * Not all properties of the util are available, depending on the input.
		 * */
		util?: CommandUtil<OmitPartialGroupDMChannel<Message<InGuild>>>;
	}
}

export * from "./struct/AkairoClient.js";
export * from "./struct/AkairoHandler.js";
export * from "./struct/AkairoModule.js";
export * as ClientUtil from "./struct/ClientUtil.js";
export * from "./struct/commands/arguments/Argument.js";
export * from "./struct/commands/arguments/ArgumentRunner.js";
export * from "./struct/commands/arguments/TypeResolver.js";
export * from "./struct/commands/Command.js";
export * from "./struct/commands/CommandHandler.js";
export * from "./struct/commands/CommandUtil.js";
export * from "./struct/commands/ContentParser.js";
export * from "./struct/commands/Flag.js";
export * from "./struct/contextMenuCommands/ContextMenuCommand.js";
export * from "./struct/contextMenuCommands/ContextMenuCommandHandler.js";
export * from "./struct/inhibitors/Inhibitor.js";
export * from "./struct/inhibitors/InhibitorHandler.js";
export * from "./struct/listeners/Listener.js";
export * from "./struct/listeners/ListenerHandler.js";
export * from "./struct/tasks/Task.js";
export * from "./struct/tasks/TaskHandler.js";
export * from "./typings/events.js";
export type { MessageUnion, SlashCommandMessage, TextCommandMessage } from "./typings/Util.js";
export * from "./util/AkairoError.js";
export * from "./util/AkairoMessage.js";
export * from "./util/Category.js";
export * as Constants from "./util/Constants.js";
export * as Util from "./util/Util.js";

import packageJSON from "../package.json";

/**
 * The version of the library.
 */
export const version = packageJSON.version;
