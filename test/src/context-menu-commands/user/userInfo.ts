import { ContextMenuCommand } from "#discord-akairo";
import { ContextMenuInteraction, Formatters } from "discord.js";
import { inspect } from "util";

export default class UserInfo extends ContextMenuCommand {
	public constructor() {
		super("userInfo", {
			name: "User Info",
			type: "USER"
		});
	}

	public override exec(interaction: ContextMenuInteraction) {
		interaction.reply({ embeds: [{ description: Formatters.codeBlock("json", inspect(interaction.toJSON())) }] });
	}
}
