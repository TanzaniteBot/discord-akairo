import { APIInteractionGuildMember, APIMessage } from "discord-api-types/v9";
import { CommandInteraction, Guild, GuildMember, InteractionReplyOptions, Message, MessagePayload, Snowflake, TextBasedChannels, User } from "discord.js";
import AkairoClient from "../struct/AkairoClient";
import Command from "../struct/commands/Command";
import CommandUtil from "../struct/commands/CommandUtil";
/**
 * A command interaction represented as a message.
 * @param client - AkairoClient
 * @param interaction - CommandInteraction
 * @param command - The command of the interaction
 */
export default class AkairoMessage {
    constructor(client: AkairoClient, interaction: CommandInteraction, command: Command);
    /**
     * The author of the interaction.
     */
    author: User;
    /**
     * The channel that the interaction was sent in.
     */
    channel?: TextBasedChannels;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The command name and arguments represented as a string.
     */
    content: string;
    /**
     * The time the interaction was sent.
     */
    createdAt: Date;
    /**
     * The timestamp the interaction was sent at.
     */
    createdTimestamp: number;
    /**
     * The guild the interaction was sent in (if in a guild channel).
     */
    guild?: Guild | null;
    /**
     * The ID of the interaction.
     */
    id: Snowflake;
    /**
     * The command interaction.
     */
    interaction: CommandInteraction;
    /**
     * Represents the author of the interaction as a guild member.
     * Only available if the interaction comes from a guild where the author is still a member.
     */
    member: GuildMember | APIInteractionGuildMember;
    /**
     * Utilities for command responding.
     */
    util: CommandUtil;
    /**
     * The url to jump to this message
     */
    get url(): string | null;
    /**
     * Deletes the reply to the command.
     */
    delete(): Promise<void>;
    /**
     * Replies or edits the reply of the slash command.
     * @param options The options to edit the reply.
     */
    reply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | APIMessage>;
}
//# sourceMappingURL=AkairoMessage.d.ts.map