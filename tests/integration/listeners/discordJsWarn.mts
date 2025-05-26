import type { ClientEventTypes } from "discord.js";
import { Listener } from "../../../src/index.js";
import logger from "../struct/Logger.mjs";

export default class DiscordJsWarnListener extends Listener {
	public constructor() {
		super("discordJsWarn", {
			emitter: "client",
			event: "warn"
		});
	}

	public override exec(...[message]: ClientEventTypes["warn"]) {
		logger.warn("DiscordJsWarn", message);
	}
}
