import { ApplicationCommandType, codeBlock, type ContextMenuCommandInteraction } from "discord.js";
import { inspect } from "node:util";
import { ContextMenuCommand } from "../../../../src/index.js";

export default class UserInfo extends ContextMenuCommand {
	public constructor() {
		super("userInfo", {
			name: "User Info",
			type: ApplicationCommandType.User
		});
	}

	public override exec(interaction: ContextMenuCommandInteraction) {
		interaction.reply({ embeds: [{ description: codeBlock("json", inspect(interaction.toJSON())) }] });
	}
}
