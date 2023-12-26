import {
	ActivityType,
	AttachmentBuilder,
	Collection,
	EmbedBuilder,
	PermissionFlagsBits,
	type APIEmbed,
	type BufferResolvable,
	type EmbedData,
	type Emoji,
	type Guild,
	type GuildBasedChannel,
	type GuildMember,
	type PermissionsString,
	type Role,
	type Snowflake,
	type User
} from "discord.js";
import type { Stream } from "node:stream";

/**
 * Makes a Attachment.
 * @param file - The file.
 * @param name - The filename.
 * @param description - The description of the file.
 */
export function attachment(file: BufferResolvable | Stream, name?: string, description?: string): AttachmentBuilder {
	return new AttachmentBuilder(file, { name, description });
}

/**
 * Checks if a string could be referring to a channel.
 * @param text - Text to check.
 * @param channel - Channel to check.
 * @param caseSensitive - Makes checking by name case sensitive.
 * @param wholeWord - Makes checking by name match full word only.
 */
export function checkChannel<C extends GuildBasedChannel>(
	text: string,
	channel: C,
	caseSensitive = false,
	wholeWord = false
): boolean {
	if (channel.partial) return false;
	if (channel.id === text) return true;

	const reg = /<#(\d{17,19})>/;
	const match = text.match(reg);

	if (match && channel.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? channel.name : channel.name.toLowerCase();

	if (!wholeWord) {
		return name.includes(text) || name.includes(text.replace(/^#/, ""));
	}

	return name === text || name === text.replace(/^#/, "");
}

/**
 * Checks if a string could be referring to a emoji.
 * @param text - Text to check.
 * @param emoji - Emoji to check.
 * @param caseSensitive - Makes checking by name case sensitive.
 * @param wholeWord - Makes checking by name match full word only.
 */
export function checkEmoji(text: string, emoji: Emoji, caseSensitive = false, wholeWord = false): boolean {
	if (emoji.id === text) return true;

	const reg = /<a?:[a-zA-Z0-9_]+:(\d{17,19})>/;
	const match = text.match(reg);

	if (match && emoji.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? emoji.name : emoji.name?.toLowerCase();

	if (!wholeWord) {
		return Boolean(name?.includes(text) || name?.includes(text.replace(/:/, "")));
	}

	return name === text || name === text.replace(/:/, "");
}

/**
 * Checks if a string could be referring to a guild.
 * @param text - Text to check.
 * @param guild - Guild to check.
 * @param caseSensitive - Makes checking by name case sensitive.
 * @param wholeWord - Makes checking by name match full word only.
 */
export function checkGuild(text: string, guild: Guild, caseSensitive = false, wholeWord = false): boolean {
	if (guild.id === text) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? guild.name : guild.name.toLowerCase();

	if (!wholeWord) return name.includes(text);
	return name === text;
}

/**
 * Checks if a string could be referring to a member.
 * @param text - Text to check.
 * @param member - Member to check.
 * @param caseSensitive - Makes checking by name case sensitive.
 * @param wholeWord - Makes checking by name match full word only.
 */
export function checkMember(text: string, member: GuildMember, caseSensitive = false, wholeWord = false): boolean {
	if (member.partial) return false;
	if (member.id === text) return true;

	const reg = /<@!?(\d{17,19})>/;
	const match = text.match(reg);

	if (match && member.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const username = caseSensitive ? member.user.username : member.user.username.toLowerCase();
	const displayName = caseSensitive ? member.displayName : member.displayName.toLowerCase();
	const discrim = member.user.discriminator;

	if (!wholeWord) {
		return (
			displayName.includes(text) ||
			username.includes(text) ||
			((username.includes(text.split("#")[0]) || displayName.includes(text.split("#")[0])) &&
				discrim.includes(text.split("#")[1]))
		);
	}

	return (
		displayName === text ||
		username === text ||
		((username === text.split("#")[0] || displayName === text.split("#")[0]) && discrim === text.split("#")[1])
	);
}

/**
 * Checks if a string could be referring to a role.
 * @param text - Text to check.
 * @param role - Role to check.
 * @param caseSensitive - Makes checking by name case sensitive.
 * @param wholeWord - Makes checking by name match full word only.
 */
export function checkRole(text: string, role: Role, caseSensitive = false, wholeWord = false): boolean {
	if (role.id === text) return true;

	const reg = /<@&(\d{17,19})>/;
	const match = text.match(reg);

	if (match && role.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const name = caseSensitive ? role.name : role.name.toLowerCase();

	if (!wholeWord) {
		return name.includes(text) || name.includes(text.replace(/^@/, ""));
	}

	return name === text || name === text.replace(/^@/, "");
}

/**
 * Resolves a user from a string, such as an ID, a name, or a mention.
 * @param text - Text to resolve.
 * @param users - Collection of users to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function checkUser(text: string, user: User, caseSensitive = false, wholeWord = false): boolean {
	if (user.partial) return false;
	if (user.id === text) return true;

	const reg = /<@!?(\d{17,19})>/;
	const match = text.match(reg);

	if (match && user.id === match[1]) return true;

	text = caseSensitive ? text : text.toLowerCase();
	const username = caseSensitive ? user.username : user.username.toLowerCase();
	const discrim = user.discriminator;

	if (!wholeWord) {
		return username.includes(text) || (username.includes(text.split("#")[0]) && discrim.includes(text.split("#")[1]));
	}

	return username === text || (username === text.split("#")[0] && discrim === text.split("#")[1]);
}

/**
 * Makes a Collection.
 * @param iterable - Entries to fill with.
 */
export function collection<K, V>(iterable?: ReadonlyArray<readonly [K, V]> | null): Collection<K, V> {
	return new Collection(iterable);
}

/**
 * Compares two member objects presences and checks if they stopped or started a stream or not.
 * Returns `0`, `1`, or `2` for no change, stopped, or started.
 * @param oldMember - The old member.
 * @param newMember - The new member.
 */
export function compareStreaming(oldMember: GuildMember, newMember: GuildMember): 0 | 1 | 2 {
	const s1 = oldMember.presence?.activities.find(c => c.type === ActivityType.Streaming);
	const s2 = newMember.presence?.activities.find(c => c.type === ActivityType.Streaming);
	if (s1 === s2) return 0;
	if (s1) return 1;
	if (s2) return 2;
	return 0;
}

/**
 * Makes a Embed.
 * @param data - Embed data.
 */
export function embed(data?: EmbedData | APIEmbed): EmbedBuilder {
	return new EmbedBuilder(data);
}

/**
 * Combination of `<Client>.fetchUser()` and `<Guild>.fetchMember()`.
 * @param guild - Guild to fetch in.
 * @param id - ID of the user.
 * @param cache - Whether or not to add to cache.
 */
export async function fetchMember(guild: Guild, id: Snowflake, cache: boolean): Promise<GuildMember> {
	const user = await guild.client.users.fetch(id, { cache });
	return guild.members.fetch({ user, cache });
}

/**
 * Array of permission names.
 */
export function permissionNames(): PermissionsString[] {
	return Object.keys(PermissionFlagsBits) as PermissionsString[];
}

/**
 * Resolves a channel from a string, such as an ID, a name, or a mention.
 * @param text - Text to resolve.
 * @param channels - Collection of channels to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveChannel<C extends GuildBasedChannel>(
	text: string,
	channels: Collection<Snowflake, C>,
	caseSensitive = false,
	wholeWord = false
): C | null {
	return channels.get(text) ?? channels.find(channel => checkChannel(text, channel, caseSensitive, wholeWord)) ?? null;
}

/**
 * Resolves multiple channels from a string, such as an ID, a name, or a mention.
 * @param text - Text to resolve.
 * @param channels - Collection of channels to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveChannels<C extends GuildBasedChannel>(
	text: string,
	channels: Collection<Snowflake, C>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, C> {
	return channels.filter(channel => checkChannel(text, channel, caseSensitive, wholeWord));
}

/**
 * Resolves a custom emoji from a string, such as a name or a mention.
 * @param text - Text to resolve.
 * @param emojis - Collection of emojis to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveEmoji(
	text: string,
	emojis: Collection<Snowflake, Emoji>,
	caseSensitive = false,
	wholeWord = false
): Emoji | null {
	return emojis.get(text) ?? emojis.find(emoji => checkEmoji(text, emoji, caseSensitive, wholeWord)) ?? null;
}

/**
 * Resolves multiple custom emojis from a string, such as a name or a mention.
 * @param text - Text to resolve.
 * @param emojis - Collection of emojis to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveEmojis(
	text: string,
	emojis: Collection<Snowflake, Emoji>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, Emoji> {
	return emojis.filter(emoji => checkEmoji(text, emoji, caseSensitive, wholeWord));
}

/**
 * Resolves a guild from a string, such as an ID or a name.
 * @param text - Text to resolve.
 * @param guilds - Collection of guilds to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveGuild(
	text: string,
	guilds: Collection<Snowflake, Guild>,
	caseSensitive = false,
	wholeWord = false
): Guild | null {
	return guilds.get(text) ?? guilds.find(guild => checkGuild(text, guild, caseSensitive, wholeWord)) ?? null;
}

/**
 * Resolves multiple guilds from a string, such as an ID or a name.
 * @param text - Text to resolve.
 * @param guilds - Collection of guilds to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveGuilds(
	text: string,
	guilds: Collection<Snowflake, Guild>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, Guild> {
	return guilds.filter(guild => checkGuild(text, guild, caseSensitive, wholeWord));
}

/**
 * Resolves a member from a string, such as an ID, a name, or a mention.
 * @param text - Text to resolve.
 * @param members - Collection of members to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveMember(
	text: string,
	members: Collection<Snowflake, GuildMember>,
	caseSensitive = false,
	wholeWord = false
): GuildMember | null {
	return members.get(text) ?? members.find(member => checkMember(text, member, caseSensitive, wholeWord)) ?? null;
}

/**
 * Resolves multiple members from a string, such as an ID, a name, or a mention.
 * @param text - Text to resolve.
 * @param members - Collection of members to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveMembers(
	text: string,
	members: Collection<Snowflake, GuildMember>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, GuildMember> {
	return members.filter(member => checkMember(text, member, caseSensitive, wholeWord));
}

/**
 * Resolves a permission number and returns an array of permission names.
 * @param number - The permissions number.
 */
export function resolvePermissionNumber(number: number): string[] {
	const resolved = [];

	for (const key of Object.keys(PermissionFlagsBits)) {
		if (BigInt(number) & PermissionFlagsBits[key as PermissionsString]) resolved.push(key);
	}

	return resolved;
}

/**
 * Resolves a role from a string, such as an ID, a name, or a mention.
 * @param text - Text to resolve.
 * @param roles - Collection of roles to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveRole(
	text: string,
	roles: Collection<Snowflake, Role>,
	caseSensitive = false,
	wholeWord = false
): Role | null {
	return roles.get(text) ?? roles.find(role => checkRole(text, role, caseSensitive, wholeWord)) ?? null;
}

/**
 * Resolves multiple roles from a string, such as an ID, a name, or a mention.
 * @param text - Text to resolve.
 * @param roles - Collection of roles to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveRoles(
	text: string,
	roles: Collection<Snowflake, Role>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, Role> {
	return roles.filter(role => checkRole(text, role, caseSensitive, wholeWord));
}

/**
 * Resolves a user from a string, such as an ID, a name, or a mention.
 * @param text - Text to resolve.
 * @param users - Collection of users to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveUser(
	text: Snowflake | string,
	users: Collection<Snowflake, User>,
	caseSensitive = false,
	wholeWord = false
): User | null {
	return users.get(text) ?? users.find(user => checkUser(text, user, caseSensitive, wholeWord)) ?? null;
}

/**
 * Resolves multiple users from a string, such as an ID, a name, or a mention.
 * @param text - Text to resolve.
 * @param users - Collection of users to find in.
 * @param caseSensitive - Makes finding by name case sensitive.
 * @param wholeWord - Makes finding by name match full word only.
 */
export function resolveUsers(
	text: string,
	users: Collection<Snowflake, User>,
	caseSensitive = false,
	wholeWord = false
): Collection<Snowflake, User> {
	return users.filter(user => checkUser(text, user, caseSensitive, wholeWord));
}
