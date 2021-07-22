/* eslint-disable no-console */
// @ts-check
"enable strict";

import { Command } from "../../src/index.js";
const sleep = require("util").promisify(setTimeout);

export default class LockCommand extends Command {
	constructor() {
		super("lock", {
			aliases: ["lock"],
			lock: "guild"
		});
	}

	exec(message) {
		return [0, 1, 2, 3, 4].reduce(
			(promise, num) =>
				promise.then(() => sleep(1000)).then(() => message.util.send(num)),
			Promise.resolve()
		);
	}
}
