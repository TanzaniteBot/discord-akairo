import { Message } from "discord.js";
import { Command } from "../../src/index";
export default class UnorderedCommand extends Command {
    constructor();
    exec(message: Message, args: {
        integer1: number;
        integer2: number;
    }): void;
}
//# sourceMappingURL=unordered.d.ts.map