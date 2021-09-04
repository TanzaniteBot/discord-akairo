import { Message } from "discord.js";
import { Command } from "../dist/../../src/index";
export default class ConditionalPromiseCommand extends Command {
    constructor();
    condition(message: Message): Promise<boolean>;
    exec(message: Message): Promise<Message>;
}
//# sourceMappingURL=condition.promise.d.ts.map