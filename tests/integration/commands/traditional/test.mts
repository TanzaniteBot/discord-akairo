import { codeBlock } from "discord.js";
import { inspect } from "node:util";
import { Argument, Command, type TextCommandMessage } from "../../../../src/index.js";
const { compose, range, union } = Argument;

export default class TestCommand extends Command {
	public constructor() {
		super("test", {
			aliases: ["test", "test-a"],
			cooldown: 5000,
			prefix: ["$", "%"],
			args: [
				{
					id: "x",
					match: "rest",
					type: compose(((m, s) => s.replace(/\s/g, ""))!, range(union("integer", "emojint")!, 0, 50)!)!
				}
			]
		});
	}

	public override exec(message: TextCommandMessage, args: { x: number }) {
		message.channel.send(codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
