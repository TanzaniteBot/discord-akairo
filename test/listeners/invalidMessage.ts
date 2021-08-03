/* eslint-disable no-console */

import { Message } from "discord.js";
import { Listener } from "../..";

export default class InvalidMessageListener extends Listener {
	constructor() {
		super("messageInvalid", {
			emitter: "commandHandler",
			event: "messageInvalid",
			category: "commandHandler"
		});
	}

	exec(msg: Message): void {
		// @ts-expect-error
		console.log(msg.util.parsed);
	}
}
