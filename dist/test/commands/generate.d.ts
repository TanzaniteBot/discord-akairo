import { Command, Flag } from "../../src/index";
export default class GenerateCommand extends Command {
    constructor();
    args(): Generator<{
        type: string[];
        otherwise: string;
    }, Flag | {
        x: any;
    }, unknown>;
    exec(message: any, args: any): void;
}
//# sourceMappingURL=generate.d.ts.map