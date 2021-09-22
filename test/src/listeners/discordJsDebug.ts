/* eslint-disable no-console */

import { Listener } from "discord-akairo";
import { ClientEvents } from "discord.js";

export default class DiscordJsDebugListener extends Listener {
	public constructor() {
		super("discord.js-debug", {
			emitter: "client",
			event: "debug"
		});
	}

	public override exec(...[message]: ClientEvents["debug"]) {
		console.debug(`[discord.js-debug] ${message}`);
	}
}
