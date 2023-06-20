import { Inhibitor, type MessageUnion } from "../../../src/index.js";

export default class BlacklistInhibitor extends Inhibitor {
	public constructor() {
		super("blacklist", {
			reason: "blacklist"
		});
	}

	public override exec(message: MessageUnion): boolean {
		if (message.author.id === "1234567890123456789") return true;
		return false;
	}
}
