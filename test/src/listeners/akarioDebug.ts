import { AkairoClientEvents, Listener } from "#discord-akairo";
import logger from "../struct/Logger";

export default class AkairoDebugListener extends Listener {
	public constructor() {
		super("akairoDebug", {
			emitter: "client",
			event: "akairoDebug"
		});
	}

	public override exec(...[message]: AkairoClientEvents["akairoDebug"]) {
		logger.debug("AkairoDebug", message);
	}
}
