/* eslint-disable no-console */

import { Command } from "../../src/index";

export default class QCommand extends Command {
	constructor() {
		super("q", {
			aliases: ["q"]
		});
	}

	override exec(message) {
		const command = this.handler.modules.get("p");
		return this.handler.handleDirectCommand(message, "", command);
	}
}
