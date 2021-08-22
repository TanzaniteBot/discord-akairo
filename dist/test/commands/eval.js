"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvZXZhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUEwQztBQUMxQyxnREFBd0I7QUFFeEIsTUFBcUIsV0FBWSxTQUFRLGVBQU87SUFDL0M7UUFDQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztZQUN0QixRQUFRLEVBQUUsT0FBTztZQUNqQixTQUFTLEVBQUUsSUFBSTtZQUNmLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFO2dCQUNMO29CQUNDLEVBQUUsRUFBRSxNQUFNO29CQUNWLEtBQUssRUFBRSxTQUFTO2lCQUNoQjthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFO1FBQ3BDLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRTFELE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztRQUN2QixNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7UUFFaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELE1B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WjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlDQUFpQztZQUNyRCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUM7WUFFaEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6QixLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLElBQUksS0FBSyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuRixLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFN0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDcEMsb0JBQW9CLEVBQUUsSUFBSTtnQkFDMUIsSUFBSTtnQkFDSixFQUFFO2dCQUNGLG1CQUFtQixFQUFFLElBQUk7Z0JBQ3pCLEtBQUs7Z0JBQ0wsRUFBRTthQUNGLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBRXRCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7SUFDRixDQUFDO0NBQ0Q7QUEvRkQsOEJBK0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2YWxDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwiZXZhbFwiLCB7XG5cdFx0XHRhbGlhc2VzOiBbXCJldmFsXCIsIFwiZVwiXSxcblx0XHRcdGNhdGVnb3J5OiBcIm93bmVyXCIsXG5cdFx0XHRvd25lck9ubHk6IHRydWUsXG5cdFx0XHRxdW90ZWQ6IGZhbHNlLFxuXHRcdFx0YXJnczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwiY29kZVwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcImNvbnRlbnRcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRvdmVycmlkZSBhc3luYyBleGVjKG1lc3NhZ2UsIHsgY29kZSB9KSB7XG5cdFx0aWYgKCFjb2RlKSByZXR1cm4gbWVzc2FnZS51dGlsLnJlcGx5KFwiTm8gY29kZSBwcm92aWRlZCFcIik7XG5cblx0XHRjb25zdCBldmFsZWQ6IGFueSA9IHt9O1xuXHRcdGNvbnN0IGxvZ3MgPSBbXTtcblxuXHRcdGNvbnN0IHRva2VuID0gdGhpcy5jbGllbnQudG9rZW4uc3BsaXQoXCJcIikuam9pbihcIlteXXswLDJ9XCIpO1xuXHRcdGNvbnN0IHJldiA9IHRoaXMuY2xpZW50LnRva2VuLnNwbGl0KFwiXCIpLnJldmVyc2UoKS5qb2luKFwiW15dezAsMn1cIik7XG5cdFx0Y29uc3QgdG9rZW5SZWdleCA9IG5ldyBSZWdFeHAoYCR7dG9rZW59fCR7cmV2fWAsIFwiZ1wiKTtcblx0XHRjb25zdCBjYiA9IFwiYGBgXCI7XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdFx0Y29uc3QgcHJpbnQgPSAoLi4uYSkgPT4ge1xuXHRcdFx0Y29uc3QgY2xlYW5lZCA9IGEubWFwKG9iaiA9PiB7XG5cdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0aWYgKHR5cGVvZiBvICE9PSBcInN0cmluZ1wiKSBvYmogPSB1dGlsLmluc3BlY3Qob2JqLCB7IGRlcHRoOiAxIH0pO1xuXHRcdFx0XHRyZXR1cm4gb2JqLnJlcGxhY2UodG9rZW5SZWdleCwgXCJbVE9LRU5dXCIpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghZXZhbGVkLm91dHB1dCkge1xuXHRcdFx0XHRsb2dzLnB1c2goLi4uY2xlYW5lZCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZXZhbGVkLm91dHB1dCArPSBldmFsZWQub3V0cHV0LmVuZHNXaXRoKFwiXFxuXCIpID8gY2xlYW5lZC5qb2luKFwiIFwiKSA6IGBcXG4ke2NsZWFuZWQuam9pbihcIiBcIil9YDtcblx0XHRcdGNvbnN0IHRpdGxlID0gZXZhbGVkLmVycm9yZWQgPyBcIuKYoFxcdTIwMDAqKkVycm9yKipcIiA6IFwi8J+TpFxcdTIwMDAqKk91dHB1dCoqXCI7XG5cblx0XHRcdGlmIChldmFsZWQub3V0cHV0Lmxlbmd0aCArIGNvZGUubGVuZ3RoID4gMTkwMCkgZXZhbGVkLm91dHB1dCA9IFwiT3V0cHV0IHRvbyBsb25nLlwiO1xuXHRcdFx0ZXZhbGVkLm1lc3NhZ2UuZWRpdChbYPCfk6VcXHUyMDAwKipJbnB1dCoqJHtjYn1qc2AsIGNvZGUsIGNiLCBgJHt0aXRsZX0ke2NifWpzYCwgZXZhbGVkLm91dHB1dCwgY2JdKTtcblx0XHR9O1xuXG5cdFx0dHJ5IHtcblx0XHRcdGxldCBvdXRwdXQgPSBldmFsKGNvZGUpO1xuXHRcdFx0aWYgKG91dHB1dCAmJiB0eXBlb2Ygb3V0cHV0LnRoZW4gPT09IFwiZnVuY3Rpb25cIikgb3V0cHV0ID0gYXdhaXQgb3V0cHV0O1xuXG5cdFx0XHRpZiAodHlwZW9mIG91dHB1dCAhPT0gXCJzdHJpbmdcIikgb3V0cHV0ID0gdXRpbC5pbnNwZWN0KG91dHB1dCwgeyBkZXB0aDogMCB9KTtcblx0XHRcdG91dHB1dCA9IGAke2xvZ3Muam9pbihcIlxcblwiKX1cXG4ke2xvZ3MubGVuZ3RoICYmIG91dHB1dCA9PT0gXCJ1bmRlZmluZWRcIiA/IFwiXCIgOiBvdXRwdXR9YDtcblx0XHRcdG91dHB1dCA9IG91dHB1dC5yZXBsYWNlKHRva2VuUmVnZXgsIFwiW1RPS0VOXVwiKTtcblxuXHRcdFx0aWYgKG91dHB1dC5sZW5ndGggKyBjb2RlLmxlbmd0aCA+IDE5MDApIG91dHB1dCA9IFwiT3V0cHV0IHRvbyBsb25nLlwiO1xuXG5cdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgbWVzc2FnZS51dGlsLnNlbmQoW1xuXHRcdFx0XHRg8J+TpVxcdTIwMDAqKklucHV0Kioke2NifWpzYCxcblx0XHRcdFx0Y29kZSxcblx0XHRcdFx0Y2IsXG5cdFx0XHRcdGDwn5OkXFx1MjAwMCoqT3V0cHV0Kioke2NifWpzYCxcblx0XHRcdFx0b3V0cHV0LFxuXHRcdFx0XHRjYlxuXHRcdFx0XSk7XG5cblx0XHRcdGV2YWxlZC5tZXNzYWdlID0gc2VudDtcblx0XHRcdGV2YWxlZC5lcnJvcmVkID0gZmFsc2U7XG5cdFx0XHRldmFsZWQub3V0cHV0ID0gb3V0cHV0O1xuXG5cdFx0XHRyZXR1cm4gc2VudDtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG5cdFx0XHRsZXQgZXJyb3IgPSBlcnI7XG5cblx0XHRcdGVycm9yID0gZXJyb3IudG9TdHJpbmcoKTtcblx0XHRcdGVycm9yID0gYCR7bG9ncy5qb2luKFwiXFxuXCIpfVxcbiR7bG9ncy5sZW5ndGggJiYgZXJyb3IgPT09IFwidW5kZWZpbmVkXCIgPyBcIlwiIDogZXJyb3J9YDtcblx0XHRcdGVycm9yID0gZXJyb3IucmVwbGFjZSh0b2tlblJlZ2V4LCBcIltUT0tFTl1cIik7XG5cblx0XHRcdGNvbnN0IHNlbnQgPSBhd2FpdCBtZXNzYWdlLnV0aWwuc2VuZChbXG5cdFx0XHRcdGDwn5OlXFx1MjAwMCoqSW5wdXQqKiR7Y2J9anNgLFxuXHRcdFx0XHRjb2RlLFxuXHRcdFx0XHRjYixcblx0XHRcdFx0YOKYoFxcdTIwMDAqKkVycm9yKioke2NifWpzYCxcblx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdGNiXG5cdFx0XHRdKTtcblxuXHRcdFx0ZXZhbGVkLm1lc3NhZ2UgPSBzZW50O1xuXHRcdFx0ZXZhbGVkLmVycm9yZWQgPSB0cnVlO1xuXHRcdFx0ZXZhbGVkLm91dHB1dCA9IGVycm9yO1xuXG5cdFx0XHRyZXR1cm4gc2VudDtcblx0XHR9XG5cdH1cbn1cbiJdfQ==