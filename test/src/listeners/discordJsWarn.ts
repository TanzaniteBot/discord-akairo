/* eslint-disable no-console */

import { Listener } from "discord-akairo";
import { ClientEvents } from "discord.js";

export default class DiscordJsWarnListener extends Listener {
	public constructor() {
		super("discord.js-warn", {
			emitter: "client",
			event: "warn"
		});
	}

	public override exec(...[message]: ClientEvents["warn"]) {
		console.warn(`[discord.js-warn] ${message}`);
	}
}
