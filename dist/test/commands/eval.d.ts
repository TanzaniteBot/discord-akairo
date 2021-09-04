import { Message } from "discord.js";
import { Command } from "../../src/index";
export default class EvalCommand extends Command {
    constructor();
    exec(message: Message, { code }: {
        code: string;
    }): Promise<Message>;
}
//# sourceMappingURL=eval.d.ts.map