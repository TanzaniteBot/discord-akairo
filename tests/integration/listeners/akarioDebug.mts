import { Listener, type AkairoClientEvents } from "../../../src/index.js";
import logger from "../struct/Logger.mjs";

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
