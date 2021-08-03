"use strict";
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const util_1 = __importDefault(require("util"));
class EvalCommand extends __1.Command {
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
		if (!code) return message.util.reply("No code provided!");
		const evaled = {};
		const logs = [];
		const token = this.client.token.split("").join("[^]{0,2}");
		const rev = this.client.token.split("").reverse().join("[^]{0,2}");
		const tokenRegex = new RegExp(`${token}|${rev}`, "g");
		const cb = "```";
		// eslint-disable-next-line no-unused-vars
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
			if (output && typeof output.then === "function") output = await output;
			if (typeof output !== "string")
				output = util_1.default.inspect(output, { depth: 0 });
			output = `${logs.join("\n")}\n${
				logs.length && output === "undefined" ? "" : output
			}`;
			output = output.replace(tokenRegex, "[TOKEN]");
			if (output.length + code.length > 1900) output = "Output too long.";
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
		} catch (err) {
			console.error(err); // eslint-disable-line no-console
			let error = err;
			error = error.toString();
			error = `${logs.join("\n")}\n${
				logs.length && error === "undefined" ? "" : error
			}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvZXZhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZCQUFnQztBQUNoQyxnREFBd0I7QUFFeEIsTUFBcUIsV0FBWSxTQUFRLFdBQU87SUFDL0M7UUFDQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztZQUN0QixRQUFRLEVBQUUsT0FBTztZQUNqQixTQUFTLEVBQUUsSUFBSTtZQUNmLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFO2dCQUNMO29CQUNDLEVBQUUsRUFBRSxNQUFNO29CQUNWLEtBQUssRUFBRSxTQUFTO2lCQUNoQjthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFO1FBQzNCLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRTFELE1BQU0sTUFBTSxHQUFRLEVBQUUsQ0FBQztRQUN2QixNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7UUFFaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELE1B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TyxJQUFJLENBQUM7U0FDWjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlDQUFpQztZQUNyRCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUM7WUFFaEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6QixLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUN6QixJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FDN0MsRUFBRSxDQUFDO1lBQ0gsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3BDLG9CQUFvQixFQUFFLElBQUk7Z0JBQzFCLElBQUk7Z0JBQ0osRUFBRTtnQkFDRixtQkFBbUIsRUFBRSxJQUFJO2dCQUN6QixLQUFLO2dCQUNMLEVBQUU7YUFDRixDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN0QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUN0QixNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUV0QixPQUFPLElBQUksQ0FBQztTQUNaO0lBQ0YsQ0FBQztDQUNEO0FBOUdELDhCQThHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vLi5cIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2YWxDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwiZXZhbFwiLCB7XG5cdFx0XHRhbGlhc2VzOiBbXCJldmFsXCIsIFwiZVwiXSxcblx0XHRcdGNhdGVnb3J5OiBcIm93bmVyXCIsXG5cdFx0XHRvd25lck9ubHk6IHRydWUsXG5cdFx0XHRxdW90ZWQ6IGZhbHNlLFxuXHRcdFx0YXJnczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwiY29kZVwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcImNvbnRlbnRcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRhc3luYyBleGVjKG1lc3NhZ2UsIHsgY29kZSB9KSB7XG5cdFx0aWYgKCFjb2RlKSByZXR1cm4gbWVzc2FnZS51dGlsLnJlcGx5KFwiTm8gY29kZSBwcm92aWRlZCFcIik7XG5cblx0XHRjb25zdCBldmFsZWQ6IGFueSA9IHt9O1xuXHRcdGNvbnN0IGxvZ3MgPSBbXTtcblxuXHRcdGNvbnN0IHRva2VuID0gdGhpcy5jbGllbnQudG9rZW4uc3BsaXQoXCJcIikuam9pbihcIlteXXswLDJ9XCIpO1xuXHRcdGNvbnN0IHJldiA9IHRoaXMuY2xpZW50LnRva2VuLnNwbGl0KFwiXCIpLnJldmVyc2UoKS5qb2luKFwiW15dezAsMn1cIik7XG5cdFx0Y29uc3QgdG9rZW5SZWdleCA9IG5ldyBSZWdFeHAoYCR7dG9rZW59fCR7cmV2fWAsIFwiZ1wiKTtcblx0XHRjb25zdCBjYiA9IFwiYGBgXCI7XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcblx0XHRjb25zdCBwcmludCA9ICguLi5hKSA9PiB7XG5cdFx0XHRjb25zdCBjbGVhbmVkID0gYS5tYXAob2JqID0+IHtcblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRpZiAodHlwZW9mIG8gIT09IFwic3RyaW5nXCIpIG9iaiA9IHV0aWwuaW5zcGVjdChvYmosIHsgZGVwdGg6IDEgfSk7XG5cdFx0XHRcdHJldHVybiBvYmoucmVwbGFjZSh0b2tlblJlZ2V4LCBcIltUT0tFTl1cIik7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCFldmFsZWQub3V0cHV0KSB7XG5cdFx0XHRcdGxvZ3MucHVzaCguLi5jbGVhbmVkKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRldmFsZWQub3V0cHV0ICs9IGV2YWxlZC5vdXRwdXQuZW5kc1dpdGgoXCJcXG5cIilcblx0XHRcdFx0PyBjbGVhbmVkLmpvaW4oXCIgXCIpXG5cdFx0XHRcdDogYFxcbiR7Y2xlYW5lZC5qb2luKFwiIFwiKX1gO1xuXHRcdFx0Y29uc3QgdGl0bGUgPSBldmFsZWQuZXJyb3JlZCA/IFwi4pigXFx1MjAwMCoqRXJyb3IqKlwiIDogXCLwn5OkXFx1MjAwMCoqT3V0cHV0KipcIjtcblxuXHRcdFx0aWYgKGV2YWxlZC5vdXRwdXQubGVuZ3RoICsgY29kZS5sZW5ndGggPiAxOTAwKVxuXHRcdFx0XHRldmFsZWQub3V0cHV0ID0gXCJPdXRwdXQgdG9vIGxvbmcuXCI7XG5cdFx0XHRldmFsZWQubWVzc2FnZS5lZGl0KFtcblx0XHRcdFx0YPCfk6VcXHUyMDAwKipJbnB1dCoqJHtjYn1qc2AsXG5cdFx0XHRcdGNvZGUsXG5cdFx0XHRcdGNiLFxuXHRcdFx0XHRgJHt0aXRsZX0ke2NifWpzYCxcblx0XHRcdFx0ZXZhbGVkLm91dHB1dCxcblx0XHRcdFx0Y2Jcblx0XHRcdF0pO1xuXHRcdH07XG5cblx0XHR0cnkge1xuXHRcdFx0bGV0IG91dHB1dCA9IGV2YWwoY29kZSk7XG5cdFx0XHRpZiAob3V0cHV0ICYmIHR5cGVvZiBvdXRwdXQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSBvdXRwdXQgPSBhd2FpdCBvdXRwdXQ7XG5cblx0XHRcdGlmICh0eXBlb2Ygb3V0cHV0ICE9PSBcInN0cmluZ1wiKVxuXHRcdFx0XHRvdXRwdXQgPSB1dGlsLmluc3BlY3Qob3V0cHV0LCB7IGRlcHRoOiAwIH0pO1xuXHRcdFx0b3V0cHV0ID0gYCR7bG9ncy5qb2luKFwiXFxuXCIpfVxcbiR7XG5cdFx0XHRcdGxvZ3MubGVuZ3RoICYmIG91dHB1dCA9PT0gXCJ1bmRlZmluZWRcIiA/IFwiXCIgOiBvdXRwdXRcblx0XHRcdH1gO1xuXHRcdFx0b3V0cHV0ID0gb3V0cHV0LnJlcGxhY2UodG9rZW5SZWdleCwgXCJbVE9LRU5dXCIpO1xuXG5cdFx0XHRpZiAob3V0cHV0Lmxlbmd0aCArIGNvZGUubGVuZ3RoID4gMTkwMCkgb3V0cHV0ID0gXCJPdXRwdXQgdG9vIGxvbmcuXCI7XG5cblx0XHRcdGNvbnN0IHNlbnQgPSBhd2FpdCBtZXNzYWdlLnV0aWwuc2VuZChbXG5cdFx0XHRcdGDwn5OlXFx1MjAwMCoqSW5wdXQqKiR7Y2J9anNgLFxuXHRcdFx0XHRjb2RlLFxuXHRcdFx0XHRjYixcblx0XHRcdFx0YPCfk6RcXHUyMDAwKipPdXRwdXQqKiR7Y2J9anNgLFxuXHRcdFx0XHRvdXRwdXQsXG5cdFx0XHRcdGNiXG5cdFx0XHRdKTtcblxuXHRcdFx0ZXZhbGVkLm1lc3NhZ2UgPSBzZW50O1xuXHRcdFx0ZXZhbGVkLmVycm9yZWQgPSBmYWxzZTtcblx0XHRcdGV2YWxlZC5vdXRwdXQgPSBvdXRwdXQ7XG5cblx0XHRcdHJldHVybiBzZW50O1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0Y29uc29sZS5lcnJvcihlcnIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcblx0XHRcdGxldCBlcnJvciA9IGVycjtcblxuXHRcdFx0ZXJyb3IgPSBlcnJvci50b1N0cmluZygpO1xuXHRcdFx0ZXJyb3IgPSBgJHtsb2dzLmpvaW4oXCJcXG5cIil9XFxuJHtcblx0XHRcdFx0bG9ncy5sZW5ndGggJiYgZXJyb3IgPT09IFwidW5kZWZpbmVkXCIgPyBcIlwiIDogZXJyb3Jcblx0XHRcdH1gO1xuXHRcdFx0ZXJyb3IgPSBlcnJvci5yZXBsYWNlKHRva2VuUmVnZXgsIFwiW1RPS0VOXVwiKTtcblxuXHRcdFx0Y29uc3Qgc2VudCA9IGF3YWl0IG1lc3NhZ2UudXRpbC5zZW5kKFtcblx0XHRcdFx0YPCfk6VcXHUyMDAwKipJbnB1dCoqJHtjYn1qc2AsXG5cdFx0XHRcdGNvZGUsXG5cdFx0XHRcdGNiLFxuXHRcdFx0XHRg4pigXFx1MjAwMCoqRXJyb3IqKiR7Y2J9anNgLFxuXHRcdFx0XHRlcnJvcixcblx0XHRcdFx0Y2Jcblx0XHRcdF0pO1xuXG5cdFx0XHRldmFsZWQubWVzc2FnZSA9IHNlbnQ7XG5cdFx0XHRldmFsZWQuZXJyb3JlZCA9IHRydWU7XG5cdFx0XHRldmFsZWQub3V0cHV0ID0gZXJyb3I7XG5cblx0XHRcdHJldHVybiBzZW50O1xuXHRcdH1cblx0fVxufVxuIl19
