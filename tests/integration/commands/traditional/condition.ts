import type { Message } from "discord.js";
import { Command } from "../../../../src/index.js";

export default class ConditionalCommand extends Command {
	public constructor() {
		super("condition");
	}

	public override condition(message: Message) {
		return message.content === "make me condition";
	}

	public override exec(message: Message) {
		return message.util!.reply("made you condition");
	}
}
