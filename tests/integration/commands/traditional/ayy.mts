import type { Message } from "discord.js";
import { Command } from "../../../../src/index.js";

export default class AyyCommand extends Command {
	public constructor() {
		super("ayy", {
			regex: /^ayy+$/i
		});
	}

	public override exec(message: Message) {
		return message.reply("lmao");
	}
}
