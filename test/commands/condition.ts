import { Message } from "discord.js";
import { Command } from "../../src/index";

export default class ConditionalCommand extends Command {
	constructor() {
		// @ts-expect-error
		super("condition");
	}

	override condition(message: Message) {
		return message.content === "make me condition";
	}

	override exec(message) {
		return message.util.reply("made you condition");
	}
}
