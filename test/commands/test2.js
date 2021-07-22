// @ts-check
"enable strict";
/* eslint-disable no-console */

import _ from "../../src/index.js";
const {
	Argument: { compose, range, union },
	Command
} = _;
import { inspect } from "util";

export default class Test2Command extends Command {
	constructor() {
		super("test2", {
			aliases: ["test2"],
			cooldown: 5000,
			prefix: () => ["/", ">"],
			args: [
				{
					id: "y",
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
