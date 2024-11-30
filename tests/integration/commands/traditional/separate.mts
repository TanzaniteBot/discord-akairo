import { codeBlock } from "discord.js";
import { inspect } from "node:util";
import { Command, type TextCommandMessage } from "../../../../src/index.js";

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

	public override exec(message: TextCommandMessage, args: { integers: number[] }) {
		message.channel.send(codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
