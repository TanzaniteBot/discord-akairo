/* eslint-disable no-console */

import { Formatters, Message } from "discord.js";
import util from "util";
import { Command, Flag } from "../../src/index";

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
					default: (msg: Message, value: string) => {
						console.log("failed", value);
						return 1;
					}
				}
			]
		});
	}

	override exec(message: Message, args: { x: unknown }) {
		message.channel.send(Formatters.codeBlock(`js${util.inspect(args, { depth: 1 })}`));
	}
}
