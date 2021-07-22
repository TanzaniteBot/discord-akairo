/* eslint-disable no-console */

import { Listener } from "../../src/index.js";

export default class InvalidMessageListener extends Listener {
	constructor() {
		super("messageInvalid", {
			emitter: "commandHandler",
			event: "messageInvalid",
			category: "commandHandler"
		});
	}

	exec(msg) {
		console.log(msg.util.parsed);
	}
}
