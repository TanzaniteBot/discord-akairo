/* eslint-disable no-console */
import { Task } from "#discord-akairo";

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
		console.log(`[countTask] On number ${this.number}.`);
	}
}
