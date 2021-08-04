/* eslint-disable no-console */

import { Listener } from "../../src/index";

export default class InvalidMessageListener extends Listener {
	constructor() {
		super("messageInvalid", {
			emitter: "commandHandler",
			event: "messageInvalid",
			category: "commandHandler"
		});
	}

	override exec(msg): void {
		console.log(msg.util.parsed);
	}
}
