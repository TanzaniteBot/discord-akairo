import CommandUtil from "./struct/commands/CommandUtil";
export * from "./struct/AkairoClient";
export { default as AkairoClient } from "./struct/AkairoClient";
export * from "./struct/AkairoHandler";
export { default as AkairoHandler } from "./struct/AkairoHandler";
export * from "./struct/AkairoModule";
export { default as AkairoModule } from "./struct/AkairoModule";
export * from "./struct/ClientUtil";
export { default as ClientUtil } from "./struct/ClientUtil";
export * from "./struct/commands/arguments/Argument";
export { default as Argument } from "./struct/commands/arguments/Argument";
export * from "./struct/commands/arguments/TypeResolver";
export { default as TypeResolver } from "./struct/commands/arguments/TypeResolver";
export * from "./struct/commands/Command";
export { default as Command } from "./struct/commands/Command";
export * from "./struct/commands/CommandHandler";
export { default as CommandHandler } from "./struct/commands/CommandHandler";
export * from "./struct/commands/CommandUtil";
export { default as CommandUtil } from "./struct/commands/CommandUtil";
export * from "./struct/commands/Flag";
export { default as Flag } from "./struct/commands/Flag";
export * from "./struct/inhibitors/Inhibitor";
export { default as Inhibitor } from "./struct/inhibitors/Inhibitor";
export * from "./struct/inhibitors/InhibitorHandler";
export { default as InhibitorHandler } from "./struct/inhibitors/InhibitorHandler";
export * from "./struct/listeners/Listener";
export { default as Listener } from "./struct/listeners/Listener";
export * from "./struct/listeners/ListenerHandler";
export { default as ListenerHandler } from "./struct/listeners/ListenerHandler";
export * from "./struct/tasks/Task";
export { default as Task } from "./struct/tasks/Task";
export * from "./struct/tasks/TaskHandler";
export { default as TaskHandler } from "./struct/tasks/TaskHandler";
export * from "./typings/events";
export * from "./typings/guildTextBasedChannels";
export * from "./typings/message";
export * from "./util/AkairoError";
export { default as AkairoError } from "./util/AkairoError";
export * from "./util/AkairoMessage";
export { default as AkairoMessage } from "./util/AkairoMessage";
export * from "./util/Category";
export { default as Category } from "./util/Category";
export * as Constants from "./util/Constants";
export * from "./util/Util";
export { default as Util } from "./util/Util";
export declare const version: string;
export declare module discordAkairo {
    module discord.js {
        interface Message {
            /**
             * Extra properties applied to the Discord.js message object.
             * Utilities for command responding.
             * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client).
             * Not all properties of the util are available, depending on the input.
             * */
            util?: CommandUtil;
        }
    }
}
//# sourceMappingURL=index.d.ts.map