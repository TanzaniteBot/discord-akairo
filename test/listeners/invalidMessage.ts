/* eslint-disable no-console */

import { Message } from "discord.js";
import { Listener } from "../../src/index";

export default class InvalidMessageListener extends Listener {
	constructor() {
		super("messageInvalid", {
			emitter: "commandHandler",
			event: "messageInvalid",
			category: "commandHandler"
		});
	}

	override exec(msg: Message): void {
		console.log(msg.util!.parsed);
	}
}
