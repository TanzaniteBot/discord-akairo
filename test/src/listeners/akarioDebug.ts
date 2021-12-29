/* eslint-disable no-console */

import { AkairoClientEvents, Listener } from "#discord-akairo";

export default class AkairoDebugListener extends Listener {
	public constructor() {
		super("akairoDebug", {
			emitter: "client",
			event: "akairoDebug"
		});
	}

	public override exec(...[message]: AkairoClientEvents["akairoDebug"]) {
		console.debug(`[akairoDebug] ${message}`);
	}
}
