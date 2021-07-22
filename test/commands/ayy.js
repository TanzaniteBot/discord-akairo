import { Command } from "../../src/index.js";

export default class AyyCommand extends Command {
	constructor() {
		super("ayy", {
			regex: /^ayy+$/i
		});
	}

	exec(message) {
		return message.reply("lmao");
	}
}
