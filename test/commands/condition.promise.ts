import { Message } from "discord.js";

const { Command } = require("../../src");

export default class ConditionalPromiseCommand extends Command {
	constructor() {
		super("condition.promise");
	}

	condition(message: Message) {
		return Promise.resolve(message.content === "make me promise condition");
	}

	exec(message: Message) {
		return message.util.reply("made you promise condition");
	}
}
