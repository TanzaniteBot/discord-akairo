import type { DMChannel, PartialDMChannel, TextBasedChannels } from "discord.js";

export type GuildTextBasedChannels = Exclude<TextBasedChannels, PartialDMChannel | DMChannel>;
