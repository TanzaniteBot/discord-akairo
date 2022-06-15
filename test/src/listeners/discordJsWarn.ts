import { Listener } from "#discord-akairo";
import type { ClientEvents } from "discord.js";
import logger from "../struct/Logger";

export default class DiscordJsWarnListener extends Listener {
	public constructor() {
		super("discordJsWarn", {
			emitter: "client",
			event: "warn"
		});
	}

	public override exec(...[message]: ClientEvents["warn"]) {
		logger.warn("DiscordJsWarn", message);
	}
}
