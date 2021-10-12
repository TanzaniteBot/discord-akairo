/* eslint-disable no-console */

import { Command } from "discord-akairo";
import { Formatters, Message } from "discord.js";
import util from "util";

export default class ArgsCommand extends Command {
	public constructor() {
		super("args", {
			aliases: ["args"],
			args: [
				{
					id: "text",
					match: "text"
				},
				{
					id: "content",
					match: "content"
				},
				{
					id: "phrase",
					match: "phrase",
					otherwise: () => "no!"
				},
				{
					id: "rest",
					match: "rest"
				},
				{
					id: "restContent",
					match: "restContent"
				},
				{
					id: "separate",
					match: "separate"
				},
				{
					id: "flag",
					match: "flag",
					flag: ["-f", "--flag"]
				},
				{
					id: "option",
					match: "option",
					flag: ["-o", "--option"]
				}
			]
		});
	}

	public override exec(
		message: Message,
		args: {
			text: string;
			content: string;
			phrase: string;
			rest: string;
			restContent: string;
			separate: string[];
			flag?: boolean;
			option: string;
		}
	) {
		message.channel.send(Formatters.codeBlock("js", `${util.inspect(args, { depth: 1 })}`));
	}
}
