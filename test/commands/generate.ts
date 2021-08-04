/* eslint-disable no-console */

import { Command, Flag } from "../../src/index";
import util from "util";

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

	override exec(message, args) {
		message.channel.send(util.inspect(args, { depth: 1 }), { code: "js" });
	}
}
