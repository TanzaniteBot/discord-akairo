import { ApplicationCommandType, codeBlock, type ContextMenuCommandInteraction } from "discord.js";
import { inspect } from "node:util";
import { ContextMenuCommand } from "../../../../src/index.js";

export default class MessageInfo extends ContextMenuCommand {
	public constructor() {
		super("messageInfo", {
			name: "Message Info",
			type: ApplicationCommandType.Message
		});
	}

	public override exec(interaction: ContextMenuCommandInteraction) {
		interaction.reply({ embeds: [{ description: codeBlock("json", inspect(interaction.toJSON())) }] });
	}
}
