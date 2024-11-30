import { codeBlock } from "discord.js";
import { inspect } from "node:util";
import { Command, type TextCommandMessage } from "../../../../src/index.js";

export default class UnorderedCommand extends Command {
	public constructor() {
		super("unordered", {
			aliases: ["unordered", "un"],
			args: [
				{
					id: "integer1",
					unordered: true,
					type: "integer"
				},
				{
					id: "integer2",
					unordered: true,
					type: "integer"
				}
			]
		});
	}

	public override exec(message: TextCommandMessage, args: { integer1: number; integer2: number }) {
		message.channel.send(codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
