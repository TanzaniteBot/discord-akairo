import { Command, type TextCommandMessage } from "../../../../src/index.js";

export default class ConditionalCommand extends Command {
	public constructor() {
		super("condition");
	}

	public override condition(message: TextCommandMessage) {
		return message.content === "make me condition";
	}

	public override exec(message: TextCommandMessage) {
		return message.util!.reply("made you condition");
	}
}
