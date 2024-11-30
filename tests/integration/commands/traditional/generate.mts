import { codeBlock } from "discord.js";
import { inspect } from "node:util";
import { type ArgumentGeneratorReturn, Command, Flag, type TextCommandMessage } from "../../../../src/index.js";

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

	public override exec(message: TextCommandMessage, args: { x: "2" }) {
		message.channel.send(codeBlock("js", `${inspect(args, { depth: 1 })}`));
	}
}
