/* eslint-disable no-console */

import { Command } from "../../src";
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

	exec(message, args) {
		message.channel.send(util.inspect(args, { depth: 1 }), { code: "js" });
	}
}
