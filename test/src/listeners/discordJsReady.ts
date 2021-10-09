/* eslint-disable no-console */

import { Listener } from "discord-akairo";
import { ClientEvents } from "discord.js";

export default class DiscordJsDebugListener extends Listener {
	public constructor() {
		super("discord.js-ready", {
			emitter: "client",
			event: "ready"
		});
	}

	public override exec(...[client]: ClientEvents["ready"]) {
		console.debug(`[discord.js-ready] logged into ${client.user.tag} (${client.user.id})`);
	}
}
