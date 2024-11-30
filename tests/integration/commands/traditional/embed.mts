import { Command, type TextCommandMessage } from "../../../../src/index.js";

export default class EmbedCommand extends Command {
	public constructor() {
		super("embed", {
			aliases: ["embed"],
			args: [
				{
					id: "emptyContent",
					match: "flag",
					flag: "-c"
				},
				{
					id: "emptyEmbed",
					match: "flag",
					flag: "-e"
				},
				{
					id: "phrase",
					match: "phrase"
				}
			]
		});
	}

	public override exec(message: TextCommandMessage, args: { emptyContent: boolean; emptyEmbed: boolean; phrase: string }) {
		if (args.emptyContent) {
			return message.util!.send({ embeds: [{ description: args.phrase }] });
		}

		if (args.emptyEmbed) {
			return message.util!.send({ content: args.phrase, embeds: [] });
		}

		return message.util!.send({
			content: args.phrase,
			embeds: [{ description: args.phrase }]
		});
	}
}
