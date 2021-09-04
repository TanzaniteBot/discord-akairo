import { Message } from "discord.js";
import { Command } from "../../src/index";
export default class SubCommand extends Command {
    constructor();
    exec(message: Message, args: {
        thing: string;
    }): void;
}
//# sourceMappingURL=sub.d.ts.map