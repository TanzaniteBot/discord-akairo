import { AkairoMessage, Inhibitor } from "discord-akairo";
import { Message } from "discord.js";

export default class BlacklistInhibitor extends Inhibitor {
	public constructor() {
		super("blacklist", {
			reason: "blacklist"
		});
	}

	override exec(message: Message | AkairoMessage): boolean {
		if (message.author.id === "1234567890123456789") return true;
		return false;
	}
}
