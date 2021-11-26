/* eslint-disable no-console */

import { AkairoMessage, Command } from "#discord-akairo";
import { Formatters, Message } from "discord.js";
import util from "util";

export default class UserCommand extends Command {
	public constructor() {
		super("user", {
			aliases: ["user"],
			slashOnly: true,
			slash: true,
			slashOptions: [
				{
					name: "user",
					description: "user aaaaaaa",
					type: "USER",
					required: true,
					resolve: "member"
				}
			],
			slashGuilds: ["786417336978112582"]
		});
	}

	public override exec(
		message: AkairoMessage | Message,
		args: {
			user: unknown;
		}
	) {
		message.util!.send({
			embeds: [{ description: Formatters.codeBlock("js", `${util.inspect(args, { depth: 2 }).slice(0, 4000)}`) }]
		});
	}
}
