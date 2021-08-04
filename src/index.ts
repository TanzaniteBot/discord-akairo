import { CommandUtil } from "discord-akairo";
import packageJSON from "../package.json";

export { default as AkairoClient } from "./struct/AkairoClient";
export { default as AkairoHandler } from "./struct/AkairoHandler";
export { default as AkairoModule } from "./struct/AkairoModule";
export { default as ClientUtil } from "./struct/ClientUtil";
export { default as Command } from "./struct/commands/Command";
export { default as CommandHandler } from "./struct/commands/CommandHandler";
export { default as CommandUtil } from "./struct/commands/CommandUtil";
export { default as Flag } from "./struct/commands/Flag";
export { default as Argument } from "./struct/commands/arguments/Argument";
export { default as TypeResolver } from "./struct/commands/arguments/TypeResolver";
export { default as Inhibitor } from "./struct/inhibitors/Inhibitor";
export { default as InhibitorHandler } from "./struct/inhibitors/InhibitorHandler";
export { default as Listener } from "./struct/listeners/Listener";
export { default as ListenerHandler } from "./struct/listeners/ListenerHandler";
export { default as Task } from "./struct/tasks/Task";
export { default as TaskHandler } from "./struct/tasks/TaskHandler";
export { default as AkairoError } from "./util/AkairoError";
export { default as AkairoMessage } from "./util/AkairoMessage";
export { default as Category } from "./util/Category";
export * as Constants from "./util/Constants";
export { default as Util } from "./util/Util";
export const version = packageJSON.version;

export module discord.js {
	export interface Message {
		/**
		 * Extra properties applied to the Discord.js message object.
		 * Utilities for command responding.
		 * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client).
		 * Not all properties of the util are available, depending on the input.
		 * */
		util?: CommandUtil;
	}
}
