import type { ClientEvents } from "discord.js";
import { Listener } from "../../../src/index.js";
import logger from "../struct/Logger.mjs";

export default class DiscordJsDebugListener extends Listener {
	public constructor() {
		super("discordJsReady", {
			emitter: "client",
			event: "clientReady"
		});
	}

	public override exec(...[client]: ClientEvents["clientReady"]) {
		logger.log("DiscordJsReady", `logged into ${client.user.tag} (${client.user.id})`);
	}
}
