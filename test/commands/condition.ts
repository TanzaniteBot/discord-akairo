import { Message } from "discord.js";

const { Command } = require("../../src");

export default class ConditionalCommand extends Command {
	constructor() {
		super("condition");
	}

	condition(message: Message) {
		return message.content === "make me condition";
	}

	exec(message) {
		return message.util.reply("made you condition");
	}
}
