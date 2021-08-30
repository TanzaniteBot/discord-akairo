"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
class EvalCommand extends index_1.Command {
    constructor() {
        super("eval", {
            aliases: ["eval", "e"],
            category: "owner",
            ownerOnly: true,
            quoted: false,
            args: [
                {
                    id: "code",
                    match: "content"
                }
            ]
        });
    }
    async exec(message, { code }) {
        if (!code)
            return message.util.reply("No code provided!");
        const evaled = {};
        const logs = [];
        const token = this.client.token.split("").join("[^]{0,2}");
        const rev = this.client.token.split("").reverse().join("[^]{0,2}");
        const tokenRegex = new RegExp(`${token}|${rev}`, "g");
        const cb = "```";
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const print = (...a) => {
            const cleaned = a.map(obj => {
                if (typeof a !== "string")
                    obj = util_1.default.inspect(obj, { depth: 1 });
                return obj.replace(tokenRegex, "[TOKEN]");
            });
            if (!evaled.output) {
                logs.push(...cleaned);
                return;
            }
            evaled.output += evaled.output.endsWith("\n") ? cleaned.join(" ") : `\n${cleaned.join(" ")}`;
            const title = evaled.errored ? "☠\u2000**Error**" : "📤\u2000**Output**";
            if (evaled.output.length + code.length > 1900)
                evaled.output = "Output too long.";
            evaled.message.edit([`📥\u2000**Input**${cb}js`, code, cb, `${title}${cb}js`, evaled.output, cb]);
        };
        try {
            let output = eval(code);
            if (output && typeof output.then === "function")
                output = await output;
            if (typeof output !== "string")
                output = util_1.default.inspect(output, { depth: 0 });
            output = `${logs.join("\n")}\n${logs.length && output === "undefined" ? "" : output}`;
            output = output.replace(tokenRegex, "[TOKEN]");
            if (output.length + code.length > 1900)
                output = "Output too long.";
            const sent = await message.util.send([
                `📥\u2000**Input**${cb}js`,
                code,
                cb,
                `📤\u2000**Output**${cb}js`,
                output,
                cb
            ]);
            evaled.message = sent;
            evaled.errored = false;
            evaled.output = output;
            return sent;
        }
        catch (err) {
            console.error(err); // eslint-disable-line no-console
            let error = err;
            error = error.toString();
            error = `${logs.join("\n")}\n${logs.length && error === "undefined" ? "" : error}`;
            error = error.replace(tokenRegex, "[TOKEN]");
            const sent = await message.util.send([
                `📥\u2000**Input**${cb}js`,
                code,
                cb,
                `☠\u2000**Error**${cb}js`,
                error,
                cb
            ]);
            evaled.message = sent;
            evaled.errored = true;
            evaled.output = error;
            return sent;
        }
    }
}
exports.default = EvalCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvZXZhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdEQUF3QjtBQUN4QiwyQ0FBMEM7QUFFMUMsTUFBcUIsV0FBWSxTQUFRLGVBQU87SUFDL0M7UUFDQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztZQUN0QixRQUFRLEVBQUUsT0FBTztZQUNqQixTQUFTLEVBQUUsSUFBSTtZQUNmLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFO2dCQUNMO29CQUNDLEVBQUUsRUFBRSxNQUFNO29CQUNWLEtBQUssRUFBRSxTQUFTO2lCQUNoQjthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFO1FBQ3BDLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRTFELE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztRQUN2QixNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7UUFFaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELE1B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QUcsRUFBRTtZQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxpQ0FBaUM7WUFDckQsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDO1lBRWhCLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDekIsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkYsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3BDLG9CQUFvQixFQUFFLElBQUk7Z0JBQzFCLElBQUk7Z0JBQ0osRUFBRTtnQkFDRixtQkFBbUIsRUFBRSxJQUFJO2dCQUN6QixLQUFLO2dCQUNMLEVBQUU7YUFDRixDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN0QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN0QixNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUV0QixPQUFPLElBQUksQ0FBQztTQUNaO0lBQ0YsQ0FBQztDQUNEO0FBOUZELDhCQThGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmFsQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcImV2YWxcIiwge1xuXHRcdFx0YWxpYXNlczogW1wiZXZhbFwiLCBcImVcIl0sXG5cdFx0XHRjYXRlZ29yeTogXCJvd25lclwiLFxuXHRcdFx0b3duZXJPbmx5OiB0cnVlLFxuXHRcdFx0cXVvdGVkOiBmYWxzZSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImNvZGVcIixcblx0XHRcdFx0XHRtYXRjaDogXCJjb250ZW50XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgYXN5bmMgZXhlYyhtZXNzYWdlLCB7IGNvZGUgfSkge1xuXHRcdGlmICghY29kZSkgcmV0dXJuIG1lc3NhZ2UudXRpbC5yZXBseShcIk5vIGNvZGUgcHJvdmlkZWQhXCIpO1xuXG5cdFx0Y29uc3QgZXZhbGVkOiBhbnkgPSB7fTtcblx0XHRjb25zdCBsb2dzID0gW107XG5cblx0XHRjb25zdCB0b2tlbiA9IHRoaXMuY2xpZW50LnRva2VuLnNwbGl0KFwiXCIpLmpvaW4oXCJbXl17MCwyfVwiKTtcblx0XHRjb25zdCByZXYgPSB0aGlzLmNsaWVudC50b2tlbi5zcGxpdChcIlwiKS5yZXZlcnNlKCkuam9pbihcIlteXXswLDJ9XCIpO1xuXHRcdGNvbnN0IHRva2VuUmVnZXggPSBuZXcgUmVnRXhwKGAke3Rva2VufXwke3Jldn1gLCBcImdcIik7XG5cdFx0Y29uc3QgY2IgPSBcImBgYFwiO1xuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRcdGNvbnN0IHByaW50ID0gKC4uLmEpID0+IHtcblx0XHRcdGNvbnN0IGNsZWFuZWQgPSBhLm1hcChvYmogPT4ge1xuXHRcdFx0XHRpZiAodHlwZW9mIGEgIT09IFwic3RyaW5nXCIpIG9iaiA9IHV0aWwuaW5zcGVjdChvYmosIHsgZGVwdGg6IDEgfSk7XG5cdFx0XHRcdHJldHVybiBvYmoucmVwbGFjZSh0b2tlblJlZ2V4LCBcIltUT0tFTl1cIik7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCFldmFsZWQub3V0cHV0KSB7XG5cdFx0XHRcdGxvZ3MucHVzaCguLi5jbGVhbmVkKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRldmFsZWQub3V0cHV0ICs9IGV2YWxlZC5vdXRwdXQuZW5kc1dpdGgoXCJcXG5cIikgPyBjbGVhbmVkLmpvaW4oXCIgXCIpIDogYFxcbiR7Y2xlYW5lZC5qb2luKFwiIFwiKX1gO1xuXHRcdFx0Y29uc3QgdGl0bGUgPSBldmFsZWQuZXJyb3JlZCA/IFwi4pigXFx1MjAwMCoqRXJyb3IqKlwiIDogXCLwn5OkXFx1MjAwMCoqT3V0cHV0KipcIjtcblxuXHRcdFx0aWYgKGV2YWxlZC5vdXRwdXQubGVuZ3RoICsgY29kZS5sZW5ndGggPiAxOTAwKSBldmFsZWQub3V0cHV0ID0gXCJPdXRwdXQgdG9vIGxvbmcuXCI7XG5cdFx0XHRldmFsZWQubWVzc2FnZS5lZGl0KFtg8J+TpVxcdTIwMDAqKklucHV0Kioke2NifWpzYCwgY29kZSwgY2IsIGAke3RpdGxlfSR7Y2J9anNgLCBldmFsZWQub3V0cHV0LCBjYl0pO1xuXHRcdH07XG5cblx0XHR0cnkge1xuXHRcdFx0bGV0IG91dHB1dCA9IGV2YWwoY29kZSk7XG5cdFx0XHRpZiAob3V0cHV0ICYmIHR5cGVvZiBvdXRwdXQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSBvdXRwdXQgPSBhd2FpdCBvdXRwdXQ7XG5cblx0XHRcdGlmICh0eXBlb2Ygb3V0cHV0ICE9PSBcInN0cmluZ1wiKSBvdXRwdXQgPSB1dGlsLmluc3BlY3Qob3V0cHV0LCB7IGRlcHRoOiAwIH0pO1xuXHRcdFx0b3V0cHV0ID0gYCR7bG9ncy5qb2luKFwiXFxuXCIpfVxcbiR7bG9ncy5sZW5ndGggJiYgb3V0cHV0ID09PSBcInVuZGVmaW5lZFwiID8gXCJcIiA6IG91dHB1dH1gO1xuXHRcdFx0b3V0cHV0ID0gb3V0cHV0LnJlcGxhY2UodG9rZW5SZWdleCwgXCJbVE9LRU5dXCIpO1xuXG5cdFx0XHRpZiAob3V0cHV0Lmxlbmd0aCArIGNvZGUubGVuZ3RoID4gMTkwMCkgb3V0cHV0ID0gXCJPdXRwdXQgdG9vIGxvbmcuXCI7XG5cblx0XHRcdGNvbnN0IHNlbnQgPSBhd2FpdCBtZXNzYWdlLnV0aWwuc2VuZChbXG5cdFx0XHRcdGDwn5OlXFx1MjAwMCoqSW5wdXQqKiR7Y2J9anNgLFxuXHRcdFx0XHRjb2RlLFxuXHRcdFx0XHRjYixcblx0XHRcdFx0YPCfk6RcXHUyMDAwKipPdXRwdXQqKiR7Y2J9anNgLFxuXHRcdFx0XHRvdXRwdXQsXG5cdFx0XHRcdGNiXG5cdFx0XHRdKTtcblxuXHRcdFx0ZXZhbGVkLm1lc3NhZ2UgPSBzZW50O1xuXHRcdFx0ZXZhbGVkLmVycm9yZWQgPSBmYWxzZTtcblx0XHRcdGV2YWxlZC5vdXRwdXQgPSBvdXRwdXQ7XG5cblx0XHRcdHJldHVybiBzZW50O1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0Y29uc29sZS5lcnJvcihlcnIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcblx0XHRcdGxldCBlcnJvciA9IGVycjtcblxuXHRcdFx0ZXJyb3IgPSBlcnJvci50b1N0cmluZygpO1xuXHRcdFx0ZXJyb3IgPSBgJHtsb2dzLmpvaW4oXCJcXG5cIil9XFxuJHtsb2dzLmxlbmd0aCAmJiBlcnJvciA9PT0gXCJ1bmRlZmluZWRcIiA/IFwiXCIgOiBlcnJvcn1gO1xuXHRcdFx0ZXJyb3IgPSBlcnJvci5yZXBsYWNlKHRva2VuUmVnZXgsIFwiW1RPS0VOXVwiKTtcblxuXHRcdFx0Y29uc3Qgc2VudCA9IGF3YWl0IG1lc3NhZ2UudXRpbC5zZW5kKFtcblx0XHRcdFx0YPCfk6VcXHUyMDAwKipJbnB1dCoqJHtjYn1qc2AsXG5cdFx0XHRcdGNvZGUsXG5cdFx0XHRcdGNiLFxuXHRcdFx0XHRg4pigXFx1MjAwMCoqRXJyb3IqKiR7Y2J9anNgLFxuXHRcdFx0XHRlcnJvcixcblx0XHRcdFx0Y2Jcblx0XHRcdF0pO1xuXG5cdFx0XHRldmFsZWQubWVzc2FnZSA9IHNlbnQ7XG5cdFx0XHRldmFsZWQuZXJyb3JlZCA9IHRydWU7XG5cdFx0XHRldmFsZWQub3V0cHV0ID0gZXJyb3I7XG5cblx0XHRcdHJldHVybiBzZW50O1xuXHRcdH1cblx0fVxufVxuIl19