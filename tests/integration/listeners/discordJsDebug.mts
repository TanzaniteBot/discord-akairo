import type { ClientEventTypes } from "discord.js";
import { Listener } from "../../../src/index.js";
import logger from "../struct/Logger.mjs";

export default class DiscordJsDebugListener extends Listener {
	public constructor() {
		super("discordJsDebug", {
			emitter: "client",
			event: "debug"
		});
	}

	public override exec(...[message]: ClientEventTypes["debug"]) {
		logger.debug("DiscordJsDebug", message);
	}
}
