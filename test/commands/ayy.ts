import { Message } from "discord.js";
import { Command } from "../../src/index";

export default class AyyCommand extends Command {
	constructor() {
		super("ayy", {
			regex: /^ayy+$/i
		});
	}

	override exec(message: Message) {
		return message.reply("lmao");
	}
}
