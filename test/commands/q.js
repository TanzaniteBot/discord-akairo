// @ts-check
"enable strict";
/* eslint-disable no-console */

import { Command } from "../../src/index.js";

export default class QCommand extends Command {
	constructor() {
		super("q", {
			aliases: ["q"]
		});
	}

	exec(message) {
		const command = this.handler.modules.get("p");
		return this.handler.handleDirectCommand(message, "", command);
	}
}
