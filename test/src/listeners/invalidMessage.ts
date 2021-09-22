/* eslint-disable no-console */

import { Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class InvalidMessageListener extends Listener {
	public constructor() {
		super("messageInvalid", {
			emitter: "commandHandler",
			event: "messageInvalid",
			category: "commandHandler"
		});
	}

	public override exec(msg: Message): void {
		console.log(msg.util!.parsed);
	}
}
