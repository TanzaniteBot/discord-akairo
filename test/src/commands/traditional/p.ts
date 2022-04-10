import { Command } from "#discord-akairo";
import { Formatters, Message } from "discord.js";
import util from "util";
import logger from "../../struct/Logger";

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

	public override exec(message: Message, args: { integer: BigInt }) {
		message.channel.send(Formatters.codeBlock("js", `${util.inspect(args, { depth: 1 })}`));
	}
}
