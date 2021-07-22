// @ts-check
"enable strict";
/* eslint-disable no-console */

import _ from "../../src/index.js";
const {
	Argument: { compose, range, union },
	Command
} = _;
import { inspect } from "util";

export default class TestCommand extends Command {
	constructor() {
		super("test", {
			aliases: ["test", "test-a"],
			cooldown: 5000,
			prefix: ["$", "%"],
			args: [
				{
					id: "x",
					match: "rest",
					type: compose(
						(m, s) => s.replace(/\s/g, ""),
						range(union("integer", "emojint"), 0, 50)
					)
				}
			]
		});
	}

	exec(message, args) {
		message.channel.send(inspect(args, { depth: 1 }), { code: "js" });
	}
}
