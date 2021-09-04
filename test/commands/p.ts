/* eslint-disable no-console */

import { Formatters, Message } from "discord.js";
import util from "util";
import { Command } from "../../src/index";

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

	override exec(message: Message, args: { integer: BigInt }) {
		message.channel.send(Formatters.codeBlock(`js${util.inspect(args, { depth: 1 })}`));
	}
}
