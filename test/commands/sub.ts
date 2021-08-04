/* eslint-disable no-console */

import { Command } from "../../src/index";
import util from "util";

export default class SubCommand extends Command {
	constructor() {
		super("sub", {
			args: [
				{
					id: "thing"
				}
			]
		});
	}

	override exec(message, args) {
		message.channel.send(util.inspect(args, { depth: 1 }), { code: "js" });
	}
}
