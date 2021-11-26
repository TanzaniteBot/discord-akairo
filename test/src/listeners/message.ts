/* eslint-disable no-console */

import { Listener } from "#discord-akairo";
import { Message } from "discord.js";

export default class MessageListener extends Listener {
	public constructor() {
		super("messageCreate", {
			emitter: "client",
			event: "messageCreate",
			category: "client"
		});
	}

	public override exec(msg: Message) {
		console.log(msg.content);
	}
}
