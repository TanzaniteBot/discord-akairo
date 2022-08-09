import { Task } from "../../../src/index.js";
import logger from "../struct/Logger.mjs";

export default class CountTask extends Task {
	public constructor() {
		super("count", {
			delay: 300_000,
			runOnStart: true
		});
	}

	private number = 0;

	public override exec() {
		this.number++;
		logger.log("CountTask", `On number ${this.number}.`);
	}
}
