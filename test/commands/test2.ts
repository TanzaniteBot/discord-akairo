/* eslint-disable no-console */

import { Argument, Command } from "../../src/index";
import util from "util";

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
					type: Argument.compose(
						(m, s) => s.replace(/\s/g, ""),
						Argument.range(Argument.union("integer", "emojint"), 0, 50)
					)
				}
			]
		});
	}

	override exec(message, args) {
		message.channel.send(util.inspect(args, { depth: 1 }), { code: "js" });
	}
}
