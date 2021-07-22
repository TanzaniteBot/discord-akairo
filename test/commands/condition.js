// @ts-check
"enable strict";
import { Command } from "../../src/index.js";

export default class ConditionalCommand extends Command {
	constructor() {
		super("condition");
	}

	condition(message) {
		return message.content === "make me condition";
	}

	exec(message) {
		return message.util.reply("made you condition");
	}
}
