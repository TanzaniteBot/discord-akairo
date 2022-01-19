import { ContextMenuCommand } from "#discord-akairo";
import { ContextMenuCommandInteraction, Formatters } from "discord.js";
import { inspect } from "util";

export default class MessageInfo extends ContextMenuCommand {
	public constructor() {
		super("messageInfo", {
			name: "Message Info",
			type: "Message"
		});
	}

	public override exec(interaction: ContextMenuCommandInteraction) {
		interaction.reply({ embeds: [{ description: Formatters.codeBlock("json", inspect(interaction.toJSON())) }] });
	}
}
