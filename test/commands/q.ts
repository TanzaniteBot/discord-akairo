/* eslint-disable no-console */

import { Message } from "discord.js";
import { Command } from "../../src/index";

export default class QCommand extends Command {
	constructor() {
		super("q", {
			aliases: ["q"]
		});
	}

	override exec(message: Message) {
		const command = this.handler.modules.get("p")!;
		return this.handler.handleDirectCommand(message, "", command);
	}
}
