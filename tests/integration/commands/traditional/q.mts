import { Command, type TextCommandMessage } from "../../../../src/index.js";

export default class QCommand extends Command {
	public constructor() {
		super("q", {
			aliases: ["q"]
		});
	}

	public override exec(message: TextCommandMessage) {
		const command = this.handler.modules.get("p")!;
		return this.handler.handleDirectCommand(message, "", command);
	}
}
