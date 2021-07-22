/* eslint-disable no-console */
// @ts-check
"enable strict";

import { Command } from "../../src/index.js";
import { inspect } from "util";

export default class PCommand extends Command {
	constructor() {
		super("p", {
			aliases: ["p"],
			args: [
				{
					id: "integer",
					type: "bigint",
					prompt: {
						start: async () => {
							await Promise.resolve(1);
							return "Give me an integer!";
						},
						retry: "That's not an integer, try again!",
						optional: false
					}
				}
			]
		});
	}

	before() {
		console.log(1);
	}

	exec(message, args) {
		message.channel.send(inspect(args, { depth: 1 }), { code: "js" });
	}
}
