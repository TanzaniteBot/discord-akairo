"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
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
                // @ts-expect-error
                if (typeof o !== "string")
                    obj = util_1.default.inspect(obj, { depth: 1 });
                return obj.replace(tokenRegex, "[TOKEN]");
            });
            if (!evaled.output) {
                logs.push(...cleaned);
                return;
            }
            evaled.output += evaled.output.endsWith("\n")
                ? cleaned.join(" ")
                : `\n${cleaned.join(" ")}`;
            const title = evaled.errored ? "☠\u2000**Error**" : "📤\u2000**Output**";
            if (evaled.output.length + code.length > 1900)
                evaled.output = "Output too long.";
            evaled.message.edit([
                `📥\u2000**Input**${cb}js`,
                code,
                cb,
                `${title}${cb}js`,
                evaled.output,
                cb
            ]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvZXZhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJDQUEwQztBQUMxQyxnREFBd0I7QUFFeEIsTUFBcUIsV0FBWSxTQUFRLGVBQU87SUFDL0M7UUFDQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztZQUN0QixRQUFRLEVBQUUsT0FBTztZQUNqQixTQUFTLEVBQUUsSUFBSTtZQUNmLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFO2dCQUNMO29CQUNDLEVBQUUsRUFBRSxNQUFNO29CQUNWLEtBQUssRUFBRSxTQUFTO2lCQUNoQjthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFO1FBQ3BDLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRTFELE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztRQUN2QixNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7UUFFaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELE1BQU0s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QUFJLENBQUM7U0FDWjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlDQUFpQztZQUNyRCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUM7WUFFaEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6QixLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUN6QixJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FDN0MsRUFBRSxDQUFDO1lBQ0gsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3BDLG9CQUFvQixFQUFFLElBQUk7Z0JBQzFCLElBQUk7Z0JBQ0osRUFBRTtnQkFDRixtQkFBbUIsRUFBRSxJQUFJO2dCQUN6QixLQUFLO2dCQUNMLEVBQUU7YUFDRixDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN0QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN0QixNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUV0QixPQUFPLElBQUksQ0FBQztTQUNaO0lBQ0YsQ0FBQztDQUNEO0FBOUdELDhCQThHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5pbXBvcnQgdXRpbCBmcm9tIFwidXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmFsQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcImV2YWxcIiwge1xuXHRcdFx0YWxpYXNlczogW1wiZXZhbFwiLCBcImVcIl0sXG5cdFx0XHRjYXRlZ29yeTogXCJvd25lclwiLFxuXHRcdFx0b3duZXJPbmx5OiB0cnVlLFxuXHRcdFx0cXVvdGVkOiBmYWxzZSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImNvZGVcIixcblx0XHRcdFx0XHRtYXRjaDogXCJjb250ZW50XCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgYXN5bmMgZXhlYyhtZXNzYWdlLCB7IGNvZGUgfSkge1xuXHRcdGlmICghY29kZSkgcmV0dXJuIG1lc3NhZ2UudXRpbC5yZXBseShcIk5vIGNvZGUgcHJvdmlkZWQhXCIpO1xuXG5cdFx0Y29uc3QgZXZhbGVkOiBhbnkgPSB7fTtcblx0XHRjb25zdCBsb2dzID0gW107XG5cblx0XHRjb25zdCB0b2tlbiA9IHRoaXMuY2xpZW50LnRva2VuLnNwbGl0KFwiXCIpLmpvaW4oXCJbXl17MCwyfVwiKTtcblx0XHRjb25zdCByZXYgPSB0aGlzLmNsaWVudC50b2tlbi5zcGxpdChcIlwiKS5yZXZlcnNlKCkuam9pbihcIlteXXswLDJ9XCIpO1xuXHRcdGNvbnN0IHRva2VuUmVnZXggPSBuZXcgUmVnRXhwKGAke3Rva2VufXwke3Jldn1gLCBcImdcIik7XG5cdFx0Y29uc3QgY2IgPSBcImBgYFwiO1xuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRcdGNvbnN0IHByaW50ID0gKC4uLmEpID0+IHtcblx0XHRcdGNvbnN0IGNsZWFuZWQgPSBhLm1hcChvYmogPT4ge1xuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdGlmICh0eXBlb2YgbyAhPT0gXCJzdHJpbmdcIikgb2JqID0gdXRpbC5pbnNwZWN0KG9iaiwgeyBkZXB0aDogMSB9KTtcblx0XHRcdFx0cmV0dXJuIG9iai5yZXBsYWNlKHRva2VuUmVnZXgsIFwiW1RPS0VOXVwiKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoIWV2YWxlZC5vdXRwdXQpIHtcblx0XHRcdFx0bG9ncy5wdXNoKC4uLmNsZWFuZWQpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGV2YWxlZC5vdXRwdXQgKz0gZXZhbGVkLm91dHB1dC5lbmRzV2l0aChcIlxcblwiKVxuXHRcdFx0XHQ/IGNsZWFuZWQuam9pbihcIiBcIilcblx0XHRcdFx0OiBgXFxuJHtjbGVhbmVkLmpvaW4oXCIgXCIpfWA7XG5cdFx0XHRjb25zdCB0aXRsZSA9IGV2YWxlZC5lcnJvcmVkID8gXCLimKBcXHUyMDAwKipFcnJvcioqXCIgOiBcIvCfk6RcXHUyMDAwKipPdXRwdXQqKlwiO1xuXG5cdFx0XHRpZiAoZXZhbGVkLm91dHB1dC5sZW5ndGggKyBjb2RlLmxlbmd0aCA+IDE5MDApXG5cdFx0XHRcdGV2YWxlZC5vdXRwdXQgPSBcIk91dHB1dCB0b28gbG9uZy5cIjtcblx0XHRcdGV2YWxlZC5tZXNzYWdlLmVkaXQoW1xuXHRcdFx0XHRg8J+TpVxcdTIwMDAqKklucHV0Kioke2NifWpzYCxcblx0XHRcdFx0Y29kZSxcblx0XHRcdFx0Y2IsXG5cdFx0XHRcdGAke3RpdGxlfSR7Y2J9anNgLFxuXHRcdFx0XHRldmFsZWQub3V0cHV0LFxuXHRcdFx0XHRjYlxuXHRcdFx0XSk7XG5cdFx0fTtcblxuXHRcdHRyeSB7XG5cdFx0XHRsZXQgb3V0cHV0ID0gZXZhbChjb2RlKTtcblx0XHRcdGlmIChvdXRwdXQgJiYgdHlwZW9mIG91dHB1dC50aGVuID09PSBcImZ1bmN0aW9uXCIpIG91dHB1dCA9IGF3YWl0IG91dHB1dDtcblxuXHRcdFx0aWYgKHR5cGVvZiBvdXRwdXQgIT09IFwic3RyaW5nXCIpXG5cdFx0XHRcdG91dHB1dCA9IHV0aWwuaW5zcGVjdChvdXRwdXQsIHsgZGVwdGg6IDAgfSk7XG5cdFx0XHRvdXRwdXQgPSBgJHtsb2dzLmpvaW4oXCJcXG5cIil9XFxuJHtcblx0XHRcdFx0bG9ncy5sZW5ndGggJiYgb3V0cHV0ID09PSBcInVuZGVmaW5lZFwiID8gXCJcIiA6IG91dHB1dFxuXHRcdFx0fWA7XG5cdFx0XHRvdXRwdXQgPSBvdXRwdXQucmVwbGFjZSh0b2tlblJlZ2V4LCBcIltUT0tFTl1cIik7XG5cblx0XHRcdGlmIChvdXRwdXQubGVuZ3RoICsgY29kZS5sZW5ndGggPiAxOTAwKSBvdXRwdXQgPSBcIk91dHB1dCB0b28gbG9uZy5cIjtcblxuXHRcdFx0Y29uc3Qgc2VudCA9IGF3YWl0IG1lc3NhZ2UudXRpbC5zZW5kKFtcblx0XHRcdFx0YPCfk6VcXHUyMDAwKipJbnB1dCoqJHtjYn1qc2AsXG5cdFx0XHRcdGNvZGUsXG5cdFx0XHRcdGNiLFxuXHRcdFx0XHRg8J+TpFxcdTIwMDAqKk91dHB1dCoqJHtjYn1qc2AsXG5cdFx0XHRcdG91dHB1dCxcblx0XHRcdFx0Y2Jcblx0XHRcdF0pO1xuXG5cdFx0XHRldmFsZWQubWVzc2FnZSA9IHNlbnQ7XG5cdFx0XHRldmFsZWQuZXJyb3JlZCA9IGZhbHNlO1xuXHRcdFx0ZXZhbGVkLm91dHB1dCA9IG91dHB1dDtcblxuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuXHRcdFx0bGV0IGVycm9yID0gZXJyO1xuXG5cdFx0XHRlcnJvciA9IGVycm9yLnRvU3RyaW5nKCk7XG5cdFx0XHRlcnJvciA9IGAke2xvZ3Muam9pbihcIlxcblwiKX1cXG4ke1xuXHRcdFx0XHRsb2dzLmxlbmd0aCAmJiBlcnJvciA9PT0gXCJ1bmRlZmluZWRcIiA/IFwiXCIgOiBlcnJvclxuXHRcdFx0fWA7XG5cdFx0XHRlcnJvciA9IGVycm9yLnJlcGxhY2UodG9rZW5SZWdleCwgXCJbVE9LRU5dXCIpO1xuXG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgbWVzc2FnZS51dGlsLnNlbmQoW1xuXHRcdFx0XHRg8J+TpVxcdTIwMDAqKklucHV0Kioke2NifWpzYCxcblx0XHRcdFx0Y29kZSxcblx0XHRcdFx0Y2IsXG5cdFx0XHRcdGDimKBcXHUyMDAwKipFcnJvcioqJHtjYn1qc2AsXG5cdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRjYlxuXHRcdFx0XSk7XG5cblx0XHRcdGV2YWxlZC5tZXNzYWdlID0gc2VudDtcblx0XHRcdGV2YWxlZC5lcnJvcmVkID0gdHJ1ZTtcblx0XHRcdGV2YWxlZC5vdXRwdXQgPSBlcnJvcjtcblxuXHRcdFx0cmV0dXJuIHNlbnQ7XG5cdFx0fVxuXHR9XG59XG4iXX0=