import type { ClientEvents } from "discord.js";
import { Listener } from "../../../src/index.js";
import logger from "../struct/Logger.js";

export default class DiscordJsDebugListener extends Listener {
	public constructor() {
		super("discordJsDebug", {
			emitter: "client",
			event: "debug"
		});
	}

	public override exec(...[message]: ClientEvents["debug"]) {
		logger.debug("DiscordJsDebug", message);
	}
}
