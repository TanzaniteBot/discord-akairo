import { APIInteractionGuildMember, APIMessage } from "discord-api-types/v9";
import {
	Base,
	CommandInteraction,
	Guild,
	GuildMember,
	InteractionReplyOptions,
	Message,
	MessagePayload,
	Snowflake,
	TextBasedChannels,
	User,
	Util
} from "discord.js";
import AkairoClient from "../struct/AkairoClient";
import CommandUtil from "../struct/commands/CommandUtil";

/**
 * A command interaction represented as a message.
 * @param client - AkairoClient
 * @param interaction - CommandInteraction
 * @param command - The command of the interaction
 */
export default class AkairoMessage extends Base {
	public constructor(client: AkairoClient, interaction: CommandInteraction) {
		super(client);

		this.author = interaction.user;
		this.applicationId = interaction.applicationId;
		this.channelId = interaction.channelId;
		this.content = `${!interaction.command || interaction.command.type === "CHAT_INPUT" ? "/" : ""}${
			interaction.commandName
		}`;
		this.createdTimestamp = interaction.createdTimestamp;
		this.guildId = interaction.guildId;
		this.id = interaction.id;
		this.interaction = interaction;
		this.member = interaction.member;
		this.partial = false;

		if (interaction.command?.type === "CHAT_INPUT") {
			if (interaction.options["_group"]) this.content += `group: ${interaction.options["_group"]}`;
			if (interaction.options["_subcommand"]) this.content += `subcommand: ${interaction.options["_subcommand"]}`;
			for (const option of interaction.options["_hoistedOptions"]) {
				if (["SUB_COMMAND", "SUB_COMMAND_GROUP"].includes(option.type)) continue;
				this.content += ` ${option.name}: ${interaction.options.get(option.name, false)?.value}`;
			}
		} else if (interaction.command?.type === "MESSAGE") {
			this.content += ` message: ${interaction.options.getMessage("message")!.id}`;
		} else if (interaction.command?.type === "USER") {
			this.content += ` message: ${interaction.options.getUser("user")!.id}`;
		}
	}

	/**
	 * The author of the interaction.
	 */
	public author: User;

	/**
	 * The application's id
	 */
	public applicationId: Snowflake;

	/**
	 * The channel that the interaction was sent in.
	 */
	public get channel(): TextBasedChannels | null {
		return this.interaction.channel;
	}

	/**
	 * The id of the channel this interaction was sent in
	 */
	public channelId: Snowflake | null;

	/**
	 * The message contents with all mentions replaced by the equivalent text.
	 * If mentions cannot be resolved to a name, the relevant mention in the message content will not be converted.
	 */
	public get cleanContent(): string | null {
		return this.content != null ? Util.cleanContent(this.content, this.channel!) : null;
	}

	/**
	 * The command name and arguments represented as a string.
	 */
	public content: string;

	/**
	 * The time the message was sent at
	 */
	public get createdAt(): Date {
		return this.interaction.createdAt;
	}

	/**
	 * The timestamp the interaction was sent at.
	 */
	public createdTimestamp: number;

	/**
	 * The guild the interaction was sent in (if in a guild channel).
	 */
	public get guild(): Guild | null {
		return this.interaction.guild;
	}

	public guildId: Snowflake | null;

	/**
	 * The ID of the interaction.
	 */
	public id: Snowflake;

	/**
	 * The command interaction.
	 */
	public interaction: CommandInteraction;

	/**
	 * Represents the author of the interaction as a guild member.
	 * Only available if the interaction comes from a guild where the author is still a member.
	 */
	public member: GuildMember | APIInteractionGuildMember | null;

	/**
	 * Whether or not this message is a partial
	 */
	public readonly partial: false;

	/**
	 * Utilities for command responding.
	 */
	public util!: CommandUtil;

	/**
	 * The url to jump to this message
	 */
	public get url(): string | null {
		return this.interaction.ephemeral
			? null
			: `https://discord.com/channels/${this.guild ? this.guild.id : "@me"}/${this.channel?.id}/${this.id}`;
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
	public reply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | APIMessage> {
		return this.util.reply(options);
	}
}
