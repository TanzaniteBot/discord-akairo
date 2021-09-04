/* eslint-disable no-console */

import { Message } from "discord.js";
import { Listener } from "../../src/index";

export default class MessageListener extends Listener {
	constructor() {
		super("message", {
			emitter: "client",
			event: "message",
			category: "client"
		});
	}

	override exec(msg: Message) {
		console.log(msg.content);
	}
}
