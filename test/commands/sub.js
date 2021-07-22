// @ts-check
"enable strict";
/* eslint-disable no-console */

import { Command } from "../../src/index.js";
import { inspect } from "util";

export default class SubCommand extends Command {
	constructor() {
		super("sub", {
			args: [
				{
					id: "thing"
				}
			]
		});
	}

	exec(message, args) {
		message.channel.send(inspect(args, { depth: 1 }), { code: "js" });
	}
}
