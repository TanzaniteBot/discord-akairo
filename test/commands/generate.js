/* eslint-disable no-console */
// @ts-check
"enable strict";

import { Command, Flag } from "../../src/index.js";
import { inspect } from "util";

export default class GenerateCommand extends Command {
	constructor() {
		super("generate", {
			aliases: ["generate", "g"]
		});
	}

	*args() {
		const x = yield {
			type: ["1", "2"],
			otherwise: "Type 1 or 2!"
		};

		if (x === "1") {
			return Flag.continue("sub");
		}

		return { x };
	}

	exec(message, args) {
		message.channel.send(inspect(args, { depth: 1 }), { code: "js" });
	}
}
