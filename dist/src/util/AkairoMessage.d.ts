import {
	CommandInteraction,
	MessagePayload,
	InteractionReplyOptions,
	Message,
	DMChannel,
	Guild,
	GuildMember,
	NewsChannel,
	PartialDMChannel,
	Snowflake,
	TextChannel,
	ThreadChannel,
	User
} from "discord.js";
import AkairoClient from "../struct/AkairoClient";
import Command from "../struct/commands/Command";
import { APIInteractionGuildMember, APIMessage } from "discord-api-types/v9";
import CommandUtil from "../struct/commands/CommandUtil";
/**
 * A command interaction represented as a message.
 * @param client - AkairoClient
 * @param interaction - CommandInteraction
 * @param additionalInfo - Other information
 */
export default class AkairoMessage {
	constructor(
		client: AkairoClient,
		interaction: CommandInteraction,
		{
			slash,
			replied,
			command
		}: {
			slash: boolean;
			replied: boolean;
			command: Command;
		}
	);
	/**
	 * The author of the interaction.
	 */
	author: User;
	/**
	 * The channel that the interaction was sent in.
	 */
	channel?:
		| TextChannel
		| DMChannel
		| NewsChannel
		| ThreadChannel
		| PartialDMChannel;
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
	/** The command interaction. */
	interaction: CommandInteraction;
	/**
	 * Represents the author of the interaction as a guild member.
	 * Only available if the interaction comes from a guild where the author is still a member.
	 */
	member: GuildMember | APIInteractionGuildMember;
	/** Whether or not the interaction has been replied to. */
	replied: boolean;
	/** Utilities for command responding. */
	util: CommandUtil;
	/**
	 * The url to jump to this message
	 * @type {string|null}
	 * @readonly
	 */
	get url(): string;
	/**
	 * Deletes the reply to the command.
	 */
	delete(): Promise<void>;
	/**
	 * Replies or edits the reply of the slash command.
	 * @param options The options to edit the reply.
	 */
	reply(
		options: string | MessagePayload | InteractionReplyOptions
	): Promise<Message | APIMessage>;
}
//# sourceMappingURL=AkairoMessage.d.ts.map
