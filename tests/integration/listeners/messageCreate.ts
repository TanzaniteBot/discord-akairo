import type { Message } from "discord.js";
import { Listener } from "../../../src/index.js";
import logger from "../struct/Logger.js";

export default class MessageListener extends Listener {
	public constructor() {
		super("messageCreate", {
			emitter: "client",
			event: "messageCreate",
			category: "client"
		});
	}

	public override exec(msg: Message) {
		logger.log("MessageCreate", msg.content);
	}
}
