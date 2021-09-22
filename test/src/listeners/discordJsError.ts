/* eslint-disable no-console */

import { Listener } from "discord-akairo";
import { ClientEvents } from "discord.js";

export default class DiscordJsErrorListener extends Listener {
	public constructor() {
		super("discord.js-error", {
			emitter: "client",
			event: "error"
		});
	}

	public override exec(...[message]: ClientEvents["error"]) {
		console.info(`[discord.js-error] ${message}`);
	}
}
