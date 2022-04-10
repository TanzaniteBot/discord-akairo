import { Listener } from "#discord-akairo";
import { ClientEvents } from "discord.js";
import logger from "../struct/Logger";

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
