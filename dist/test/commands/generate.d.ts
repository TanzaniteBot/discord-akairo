import { Message } from "discord.js";
import { ArgumentOptions, Command, Flag } from "../../src/index";
export default class GenerateCommand extends Command {
    constructor();
    args(): IterableIterator<ArgumentOptions | Flag>;
    exec(message: Message, args: {
        x: "1" | "2";
    }): void;
}
//# sourceMappingURL=generate.d.ts.map