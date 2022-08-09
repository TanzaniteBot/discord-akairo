import type { ClientEvents } from "discord.js";
import { Listener } from "../../../src/index.js";
import logger from "../struct/Logger.mjs";

export default class DiscordJsErrorListener extends Listener {
	public constructor() {
		super("discordJsError", {
			emitter: "client",
			event: "error"
		});
	}

	public override exec(...[message]: ClientEvents["error"]) {
		logger.log("DiscordJsError", message);
	}
}
