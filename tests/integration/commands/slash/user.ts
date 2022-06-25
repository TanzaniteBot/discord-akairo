import { ApplicationCommandOptionType, Formatters, type Message } from "discord.js";
import { inspect } from "node:util";
import { Command, type AkairoMessage } from "../../../../src/index.js";

export default class UserCommand extends Command {
	public constructor() {
		super("user", {
			aliases: ["user"],
			slashOnly: true,
			slash: true,
			slashOptions: [
				{
					name: "user",
					description: "user",
					type: ApplicationCommandOptionType.User,
					required: true,
					resolve: "Member"
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
			embeds: [{ description: Formatters.codeBlock("js", `${inspect(args, { depth: 2 }).slice(0, 4000)}`) }]
		});
	}
}
