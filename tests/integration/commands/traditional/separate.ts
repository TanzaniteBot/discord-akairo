import { Formatters, type Message } from "discord.js";
import { inspect } from "node:util";
import { Command } from "../../../../src/index.js";

export default class SeparateCommand extends Command {
	public constructor() {
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

	public override exec(message: Message, args: { integers: number[] }) {
		message.channel.send(Formatters.codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
