import packageJSON from "../package.json";
import { CommandUtil } from "./struct/commands/CommandUtil";
import * as Constants from "./util/Constants";
export * from "./struct/AkairoClient";
export * from "./struct/AkairoHandler";
export * from "./struct/AkairoModule";
export * from "./struct/ClientUtil";
export * from "./struct/commands/arguments/Argument";
export * from "./struct/commands/arguments/ArgumentRunner";
export * from "./struct/commands/arguments/TypeResolver";
export * from "./struct/commands/Command";
export * from "./struct/commands/CommandHandler";
export * from "./struct/commands/CommandUtil";
export * from "./struct/commands/ContentParser";
export * from "./struct/commands/Flag";
export * from "./struct/contextMenuCommands/ContextMenuCommand";
export * from "./struct/contextMenuCommands/ContextMenuCommandHandler";
export * from "./struct/inhibitors/Inhibitor";
export * from "./struct/inhibitors/InhibitorHandler";
export * from "./struct/listeners/Listener";
export * from "./struct/listeners/ListenerHandler";
export * from "./struct/tasks/Task";
export * from "./struct/tasks/TaskHandler";
export * from "./typings/events";
export * from "./util/AkairoError";
export * from "./util/AkairoMessage";
export * from "./util/Category";
export * from "./util/Util";
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
