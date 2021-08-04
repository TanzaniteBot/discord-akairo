import { Message } from "discord.js";
import { Command } from "../dist/../../src/index";

export default class ConditionalPromiseCommand extends Command {
	constructor() {
		// @ts-expect-error
		super("condition.promise");
	}

	override condition(message: Message) {
		return Promise.resolve(message.content === "make me promise condition");
	}

	override exec(message: Message) {
		return message.util.reply("made you promise condition");
	}
}
