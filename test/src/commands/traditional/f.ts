/* eslint-disable no-console */

import { Command, Flag } from "#discord-akairo";
import { Formatters, Message } from "discord.js";
import util from "util";

export default class FCommand extends Command {
	public constructor() {
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

	public override exec(message: Message, args: { x: unknown }) {
		message.channel.send(Formatters.codeBlock("js", `${util.inspect(args, { depth: 1 })}`));
	}
}
