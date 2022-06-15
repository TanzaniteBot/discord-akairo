import { Command } from "#discord-akairo";
import { Formatters, type Message } from "discord.js";
import { inspect } from "node:util";
import logger from "../../struct/Logger.js";

export default class PCommand extends Command {
	public constructor() {
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

	public override before() {
		logger.log("PCommand", 1);
	}

	public override exec(message: Message, args: { integer: bigint }) {
		message.channel.send(Formatters.codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
