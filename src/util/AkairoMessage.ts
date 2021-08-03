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
import CommandUtil from "../struct/commands/CommandUtil";
import { APIInteractionGuildMember, APIMessage } from "discord-api-types/v9";

/**
 * A command interaction represented as a message.
 * @param client - AkairoClient
 * @param interaction - CommandInteraction
 * @param additionalInfo - Other information
 */
export default class AkairoMessage {
	public constructor(
		client: AkairoClient,
		interaction: CommandInteraction,
		{
			slash,
			replied,
			command
		}: { slash: boolean; replied: boolean; command: Command }
	) {
		this.author = interaction.user;

		this.channel = interaction.channel;

		this.client = client;

		this.content = `/${interaction.commandName}`;

		this.createdAt = interaction.createdAt;

		this.createdTimestamp = interaction.createdTimestamp;

		this.guild = interaction.guild;

		this.id = interaction.id;

		this.interaction = interaction;

		this.member = interaction.member;

		this.replied = replied;

		// @ts-expect-error
		this.util = { parsed: { slash } };
		for (const option of command.slashOptions) {
			this.content += ` ${option.name}: ${
				interaction.options.get(option.name, option.required || false)?.value
			}`;
		}
	}

	/**
	 * The author of the interaction.
	 */
	public author: User;

	/**
	 * The channel that the interaction was sent in.
	 */
	public channel?:
		| TextChannel
		| DMChannel
		| NewsChannel
		| ThreadChannel
		| PartialDMChannel;

	/**
	 * The Akairo client.
	 */
	public client: AkairoClient;

	/**
	 * The command name and arguments represented as a string.
	 */
	public content: string;

	/**
	 * The time the interaction was sent.
	 */
	public createdAt: Date;

	/**
	 * The timestamp the interaction was sent at.
	 */
	public createdTimestamp: number;

	/**
	 * The guild the interaction was sent in (if in a guild channel).
	 */
	public guild?: Guild | null;

	/**
	 * The ID of the interaction.
	 */
	public id: Snowflake;

	/** The command interaction. */
	public interaction: CommandInteraction;

	/**
	 * Represents the author of the interaction as a guild member.
	 * Only available if the interaction comes from a guild where the author is still a member.
	 */
	public member: GuildMember | APIInteractionGuildMember;

	/** Whether or not the interaction has been replied to. */
	public replied: boolean;

	/** Utilities for command responding. */
	public util: CommandUtil;

	/**
	 * The url to jump to this message
	 * @type {string|null}
	 * @readonly
	 */
	public get url() {
		return this.interaction.ephemeral
			? null
			: `https://discord.com/channels/${this.guild ? this.guild.id : "@me"}/${
					this.channel?.id
			  }/${this.id}`;
	}

	/**
	 * Deletes the reply to the command.
	 */
	public delete(): Promise<void> {
		return this.interaction.deleteReply();
	}
	/**
	 * Replies or edits the reply of the slash command.
	 * @param options The options to edit the reply.
	 */
	public reply(
		options: string | MessagePayload | InteractionReplyOptions
	): Promise<Message | APIMessage> {
		return this.util.reply(options);
	}
}
