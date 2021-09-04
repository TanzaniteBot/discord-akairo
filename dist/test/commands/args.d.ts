import { Message } from "discord.js";
import { Command } from "../../src/index";
export default class ArgsCommand extends Command {
    constructor();
    exec(message: Message, args: {
        text: string;
        content: string;
        phrase: string;
        rest: string;
        restContent: string;
        separate: string[];
        flag?: boolean;
        option: string;
    }): void;
}
//# sourceMappingURL=args.d.ts.map