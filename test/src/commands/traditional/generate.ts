import { ArgumentGeneratorReturn, Command, Flag } from "#discord-akairo";
import { Formatters, type Message } from "discord.js";
import { inspect } from "node:util";

export default class GenerateCommand extends Command {
	public constructor() {
		super("generate", {
			aliases: ["generate", "g"]
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		const x = yield {
			type: ["1", "2"],
			otherwise: "Type 1 or 2!"
		};

		if (x === "1") {
			return Flag.continue("sub");
		}

		return { x };
	}

	public override exec(message: Message, args: { x: "2" }) {
		message.channel.send(Formatters.codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
