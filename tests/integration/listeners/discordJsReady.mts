import type { ClientEvents } from "discord.js";
import { Listener } from "../../../src/index.js";
import logger from "../struct/Logger.mjs";

export default class DiscordJsDebugListener extends Listener {
	public constructor() {
		super("discordJsReady", {
			emitter: "client",
			event: "ready"
		});
	}

	public override exec(...[client]: ClientEvents["ready"]) {
		// eslint-disable-next-line deprecation/deprecation
		logger.log("DiscordJsReady", `logged into ${client.user.tag} (${client.user.id})`);
	}
}
