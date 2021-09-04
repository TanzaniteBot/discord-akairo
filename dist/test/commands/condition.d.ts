import { Message } from "discord.js";
import { Command } from "../../src/index";
export default class ConditionalCommand extends Command {
    constructor();
    condition(message: Message): boolean;
    exec(message: Message): Promise<Message>;
}
//# sourceMappingURL=condition.d.ts.map