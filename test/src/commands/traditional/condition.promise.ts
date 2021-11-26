import { Command } from "#discord-akairo";
import { Message } from "discord.js";

export default class ConditionalPromiseCommand extends Command {
	public constructor() {
		super("condition.promise");
	}

	public override condition(message: Message) {
		return Promise.resolve(message.content === "make me promise condition");
	}

	public override exec(message: Message) {
		return message.util!.reply("made you promise condition");
	}
}
