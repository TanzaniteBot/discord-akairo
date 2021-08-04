/* eslint-disable no-console */

import { Command } from "../../src/index";
import util from "util";

export default class ArgsCommand extends Command {
	constructor() {
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

	override exec(message, args) {
		message.channel.send(util.inspect(args, { depth: 1 }), { code: "js" });
	}
}
