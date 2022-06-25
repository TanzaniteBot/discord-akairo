import type { ClientEvents } from "discord.js";
import { Listener } from "../../../src/index.js";
import logger from "../struct/Logger.js";

export default class DiscordJsDebugListener extends Listener {
	public constructor() {
		super("discordJsReady", {
			emitter: "client",
			event: "ready"
		});
	}

	public override exec(...[client]: ClientEvents["ready"]) {
		logger.log("DiscordJsReady", `logged into ${client.user.tag} (${client.user.id})`);
	}
}
