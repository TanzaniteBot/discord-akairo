import { Command, type TextCommandMessage } from "../../../../src/index.js";

export default class ConditionalPromiseCommand extends Command {
	public constructor() {
		super("condition.promise");
	}

	public override condition(message: TextCommandMessage) {
		return Promise.resolve(message.content === "make me promise condition");
	}

	public override exec(message: TextCommandMessage) {
		return message.util!.reply("made you promise condition");
	}
}
