import { ContextMenuCommand } from "#discord-akairo";
import { ApplicationCommandType, ContextMenuCommandInteraction, Formatters } from "discord.js";
import { inspect } from "util";

export default class UserInfo extends ContextMenuCommand {
	public constructor() {
		super("userInfo", {
			name: "User Info",
			type: ApplicationCommandType.User
		});
	}

	public override exec(interaction: ContextMenuCommandInteraction) {
		interaction.reply({ embeds: [{ description: Formatters.codeBlock("json", inspect(interaction.toJSON())) }] });
	}
}
