import { Listener } from "#discord-akairo";
import { ClientEvents } from "discord.js";
import logger from "../struct/Logger";

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
