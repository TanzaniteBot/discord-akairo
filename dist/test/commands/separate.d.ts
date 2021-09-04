import { Message } from "discord.js";
import { Command } from "../../src/index";
export default class SeparateCommand extends Command {
    constructor();
    exec(message: Message, args: {
        integers: number[];
    }): void;
}
//# sourceMappingURL=separate.d.ts.map