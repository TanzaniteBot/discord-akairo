/* eslint-disable no-console */

import { Listener } from "../../src/index";

export default class MessageListener extends Listener {
	constructor() {
		super("message", {
			emitter: "client",
			event: "message",
			category: "client"
		});
	}

	override exec(msg) {
		console.log(msg.content);
	}
}
