import { Listener } from "#discord-akairo";
import { Message } from "discord.js";
import logger from "../struct/Logger";

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
