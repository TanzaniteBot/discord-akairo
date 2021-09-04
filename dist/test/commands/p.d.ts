import { Message } from "discord.js";
import { Command } from "../../src/index";
export default class PCommand extends Command {
    constructor();
    before(): void;
    exec(message: Message, args: {
        integer: BigInt;
    }): void;
}
//# sourceMappingURL=p.d.ts.map