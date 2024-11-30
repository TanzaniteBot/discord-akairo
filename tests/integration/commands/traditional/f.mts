import { codeBlock, type Message } from "discord.js";
import { inspect } from "node:util";
import { Command, Flag, type TextCommandMessage } from "../../../../src/index.js";

import logger from "../../struct/Logger.mjs";

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

	public override exec(message: TextCommandMessage, args: { x: unknown }) {
		message.channel.send(codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
