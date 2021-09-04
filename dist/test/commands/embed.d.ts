import { Message } from "discord.js";
import { Command } from "../../src/index";
export default class EmbedCommand extends Command {
    constructor();
    exec(message: Message, args: {
        emptyContent?: boolean;
        emptyEmbed?: boolean;
        phrase?: string;
    }): Promise<Message>;
}
//# sourceMappingURL=embed.d.ts.map