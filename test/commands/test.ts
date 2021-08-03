/* eslint-disable no-console */

import { Argument, Command } from "../..";
import util from "util";

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
					type: Argument.compose(
						(m, s) => s.replace(/\s/g, ""),
						Argument.range(Argument.union("integer", "emojint"), 0, 50)
					)
				}
			]
		});
	}

	exec(message, args) {
		message.channel.send(util.inspect(args, { depth: 1 }), { code: "js" });
	}
}
