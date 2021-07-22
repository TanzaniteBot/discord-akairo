// @ts-check
"enable strict";

import { Command } from "../../src/index.js";

export default class ConditionalPromiseCommand extends Command {
	constructor() {
		super("condition.promise");
	}

	// @ts-expect-error
	condition(message) {
		return Promise.resolve(message.content === "make me promise condition");
	}

	exec(message) {
		return message.util.reply("made you promise condition");
	}
}
