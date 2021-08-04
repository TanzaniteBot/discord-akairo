/* eslint-disable no-console */

import { Command } from "../../src/index";
import util from "util";

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

	override before() {
		console.log(1);
	}

	override exec(message, args) {
		message.channel.send(util.inspect(args, { depth: 1 }), { code: "js" });
	}
}
