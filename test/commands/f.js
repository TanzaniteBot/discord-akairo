/* eslint-disable no-console */
// @ts-check
"enable strict";

import { Command, Flag } from "../../src/index.js";
import { inspect } from "util";

export default class FCommand extends Command {
	constructor() {
		super("f", {
			aliases: ["f"],
			args: [
				{
					id: "x",
					type: (msg, phrase) => {
						if (phrase.length > 10) {
							return Flag.fail(phrase);
						}

						return phrase;
					},
					default: (msg, value) => {
						console.log("failed", value);
						return 1;
					}
				}
			]
		});
	}

	exec(message, args) {
		message.channel.send(inspect(args, { depth: 1 }), { code: "js" });
	}
}
