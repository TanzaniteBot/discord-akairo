import type { Message } from "discord.js";
import { Listener } from "../../../src/index.js";
import logger from "../struct/Logger.js";

export default class InvalidMessageListener extends Listener {
	public constructor() {
		super("messageInvalid", {
			emitter: "commandHandler",
			event: "messageInvalid",
			category: "commandHandler"
		});
	}

	public override exec(msg: Message): void {
		logger.log("MessageInvalid", msg.util!.parsed);
	}
}
