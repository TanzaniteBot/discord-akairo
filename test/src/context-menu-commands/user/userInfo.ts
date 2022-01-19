import { ContextMenuCommand } from "#discord-akairo";
import { ContextMenuCommandInteraction, Formatters } from "discord.js";
import { inspect } from "util";

export default class UserInfo extends ContextMenuCommand {
	public constructor() {
		super("userInfo", {
			name: "User Info",
			type: "User"
		});
	}

	public override exec(interaction: ContextMenuCommandInteraction) {
		interaction.reply({ embeds: [{ description: Formatters.codeBlock("json", inspect(interaction.toJSON())) }] });
	}
}
