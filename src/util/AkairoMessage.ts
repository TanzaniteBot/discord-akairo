import {
	Base,
	cleanContent,
	type CacheType,
	type ChatInputCommandInteraction,
	type Client,
	type InteractionReplyOptions,
	type Message,
	type MessagePayload
} from "discord.js";
import type { AkairoClient } from "../struct/AkairoClient.js";
import type { CommandUtil } from "../struct/commands/CommandUtil.js";

/**
 * A command interaction represented as a message.
 */
export class AkairoMessage<Cached extends CacheType = CacheType> extends Base {
	/**
	 * The author of the interaction.
	 */
	public author: ChatInputCommandInteraction<Cached>["user"];

	/**
	 * The application's id
	 */
	public applicationId: ChatInputCommandInteraction<Cached>["applicationId"];

	/**
	 * The id of the channel this interaction was sent in
	 */
	public channelId: ChatInputCommandInteraction<Cached>["channelId"];

	/**
	 * The command name and arguments represented as a string.
	 */
	public content: string;

	/**
	 * The timestamp the interaction was sent at.
	 */
	public createdTimestamp: ChatInputCommandInteraction<Cached>["createdTimestamp"];

	/**
	 * The id of the guild this interaction was sent in
	 */
	public guildId: ChatInputCommandInteraction<Cached>["guildId"];

	/**
	 * The ID of the interaction.
	 */
	public id: ChatInputCommandInteraction<Cached>["id"];

	/**
	 * The command interaction.
	 */
	public interaction: ChatInputCommandInteraction<Cached>;

	/**
	 * Represents the author of the interaction as a guild member.
	 * Only available if the interaction comes from a guild where the author is still a member.
	 */
	public member: ChatInputCommandInteraction<Cached>["member"];

	/**
	 * Whether or not this message is a partial
	 */
	public partial: false;

	/**
	 * Utilities for command responding.
	 */
	public util!: CommandUtil<AkairoMessage>;

	/**
	 * @param client - AkairoClient
	 * @param interaction - CommandInteraction
	 */
	public constructor(client: AkairoClient<true>, interaction: ChatInputCommandInteraction<Cached>) {
		super(client as Client<true>);

		this.author = interaction.user;
		this.applicationId = interaction.applicationId;
		this.channelId = interaction.channelId;
		this.content = interaction.toString();
		this.createdTimestamp = interaction.createdTimestamp;
		this.guildId = interaction.guildId;
		this.id = interaction.id;
		this.interaction = interaction;
		this.member = interaction.member;
		this.partial = false;
	}

	/**
	 * The channel that the interaction was sent in.
	 */
	public get channel(): ChatInputCommandInteraction<Cached>["channel"] {
		return this.interaction.channel;
	}

	/**
	 * The message contents with all mentions replaced by the equivalent text.
	 * If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted.
	 */
	public get cleanContent(): string | null {
		return this.content != null ? cleanContent(this.content, this.channel!) : null;
	}

	/**
	 * The guild the interaction was sent in (if in a guild channel).
	 */
	public get guild(): ChatInputCommandInteraction<Cached>["guild"] {
		return this.interaction.guild;
	}

	/**
	 * The time the message was sent at
	 */
	public get createdAt(): ChatInputCommandInteraction<Cached>["createdAt"] {
		return this.interaction.createdAt;
	}

	/**
	 * The url to jump to this message
	 */
	public get url(): string | null {
		return this.interaction.ephemeral
			? null
			: `https://discord.com/channels/${this.guild ? this.guild.id : "@me"}/${this.channel?.id}/${this.id}`;
	}

	/**
	 * Indicates whether this interaction is received from a guild.
	 */
	public inGuild(): this is AkairoMessage<"cached"> {
		return this.interaction.inCachedGuild();
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
	public reply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message> {
		return this.util.reply(options);
	}
}
