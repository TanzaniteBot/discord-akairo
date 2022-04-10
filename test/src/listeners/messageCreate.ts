import { Listener } from "#discord-akairo";
import { Message } from "discord.js";
import logger from "../struct/Logger";

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
