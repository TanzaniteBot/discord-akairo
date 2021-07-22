// @ts-check
"enable strict";
/* eslint-disable no-console */

import { Command } from "../../src/index.js";
import { inspect } from "util";

export default class UnorderedCommand extends Command {
	constructor() {
		super("unordered", {
			aliases: ["unordered", "un"],
			args: [
				{
					id: "integer1",
					unordered: true,
					type: "integer"
				},
				{
					id: "integer2",
					unordered: true,
					type: "integer"
				}
			]
		});
	}

	exec(message, args) {
		message.channel.send(inspect(args, { depth: 1 }), { code: "js" });
	}
}
