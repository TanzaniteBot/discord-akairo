/* eslint-disable no-console */

import { ArgumentOptions, Command, Flag } from "discord-akairo";
import { Formatters, Message } from "discord.js";
import util from "util";

export default class GenerateCommand extends Command {
	public constructor() {
		super("generate", {
			aliases: ["generate", "g"]
		});
	}

	public override *args(): IterableIterator<ArgumentOptions | Flag> {
		const x = yield {
			type: ["1", "2"],
			otherwise: "Type 1 or 2!"
		};

		if (x === "1") {
			return Flag.continue("sub");
		}

		return { x };
	}

	public override exec(message: Message, args: { x: "1" | "2" }) {
		message.channel.send(Formatters.codeBlock("js", `${util.inspect(args, { depth: 1 })}`));
	}
}
