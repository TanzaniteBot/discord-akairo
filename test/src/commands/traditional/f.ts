import { Command, Flag } from "#discord-akairo";
import { Formatters, type Message } from "discord.js";
import { inspect } from "node:util";
import logger from "../../struct/Logger.js";

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
						logger.log("FCommand", "failed", value);
						return 1;
					}
				}
			]
		});
	}

	public override exec(message: Message, args: { x: unknown }) {
		message.channel.send(Formatters.codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
