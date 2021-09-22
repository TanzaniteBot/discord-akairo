import { ContextMenuCommand } from "discord-akairo";
import { ContextMenuInteraction, Formatters } from "discord.js";
import { inspect } from "util";

export default class MessageInfo extends ContextMenuCommand {
	public constructor() {
		super("messageInfo", {
			name: "Message Info",
			type: "MESSAGE"
		});
	}

	public override exec(interaction: ContextMenuInteraction) {
		interaction.reply({ embeds: [{ description: Formatters.codeBlock("json", inspect(interaction.toJSON())) }] });
	}
}
