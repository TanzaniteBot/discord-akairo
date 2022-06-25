import type { Message } from "discord.js";
import { Inhibitor, type AkairoMessage } from "../../../src/index.js";

export default class BlacklistInhibitor extends Inhibitor {
	public constructor() {
		super("blacklist", {
			reason: "blacklist"
		});
	}

	public override exec(message: Message | AkairoMessage): boolean {
		if (message.author.id === "1234567890123456789") return true;
		return false;
	}
}
