/* eslint-disable no-console */

import { Formatters, Message } from "discord.js";
import util from "util";
import { ArgumentOptions, Command, Flag } from "../../src/index";

export default class GenerateCommand extends Command {
	constructor() {
		super("generate", {
			aliases: ["generate", "g"]
		});
	}

	*args(): IterableIterator<ArgumentOptions | Flag> {
		const x = yield {
			type: ["1", "2"],
			otherwise: "Type 1 or 2!"
		};

		if (x === "1") {
			return Flag.continue("sub");
		}

		return { x };
	}

	override exec(message: Message, args: { x: "1" | "2" }) {
		message.channel.send(Formatters.codeBlock(`js${util.inspect(args, { depth: 1 })}`));
	}
}
