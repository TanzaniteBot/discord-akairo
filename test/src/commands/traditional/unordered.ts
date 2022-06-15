import { Command } from "#discord-akairo";
import { Formatters, type Message } from "discord.js";
import { inspect } from "node:util";

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

	public override exec(message: Message, args: { integer1: number; integer2: number }) {
		message.channel.send(Formatters.codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
