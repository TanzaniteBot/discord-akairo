import { ContextMenuCommand } from "#discord-akairo";
import { ApplicationCommandType, Formatters, type ContextMenuCommandInteraction } from "discord.js";
import { inspect } from "node:util";

export default class MessageInfo extends ContextMenuCommand {
	public constructor() {
		super("messageInfo", {
			name: "Message Info",
			type: ApplicationCommandType.Message
		});
	}

	public override exec(interaction: ContextMenuCommandInteraction) {
		interaction.reply({ embeds: [{ description: Formatters.codeBlock("json", inspect(interaction.toJSON())) }] });
	}
}
