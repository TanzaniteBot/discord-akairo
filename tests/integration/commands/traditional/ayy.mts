import { Command, type TextCommandMessage } from "../../../../src/index.js";

export default class AyyCommand extends Command {
	public constructor() {
		super("ayy", {
			regex: /^ayy+$/i
		});
	}

	public override exec(message: TextCommandMessage) {
		return message.reply("lmao");
	}
}
