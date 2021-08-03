import { Message } from "discord.js";
import { Command } from "../../src";

export default class AyyCommand extends Command {
	constructor() {
		super("ayy", {
			regex: /^ayy+$/i
		});
	}

	exec(message: Message) {
		return message.reply("lmao");
	}
}
