/* eslint-disable no-console */

import { Formatters, Message } from "discord.js";
import util from "util";
import { Command } from "../../src/index";

export default class SeparateCommand extends Command {
	constructor() {
		super("separate", {
			aliases: ["separate", "sep"],
			args: [
				{
					id: "integers",
					match: "separate",
					type: "integer",
					prompt: {
						start: "Give me some integers!",
						retry: (msg, { phrase }) => `"${phrase}" is not an integer, try again!`
					}
				}
			]
		});
	}

	override exec(message: Message, args: { integers: number[] }) {
		message.channel.send(Formatters.codeBlock(`js${util.inspect(args, { depth: 1 })}`));
	}
}
