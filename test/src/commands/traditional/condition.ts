import { Command } from "#discord-akairo";
import type { Message } from "discord.js";

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
