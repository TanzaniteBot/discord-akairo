/* eslint-disable no-console */

import { Command } from "../../src/index";
import { promisify } from "util";
import { Message } from "discord.js";

const sleep = promisify(setTimeout);

export default class LockCommand extends Command {
	constructor() {
		super("lock", {
			aliases: ["lock"],
			lock: "guild"
		});
	}

	override exec(message: Message) {
		return [0, 1, 2, 3, 4].reduce(
			(promise, num) =>
				// @ts-expect-error
				promise.then(() => sleep(1000)).then(() => message.util.send(num)),
			Promise.resolve()
		);
	}
}
