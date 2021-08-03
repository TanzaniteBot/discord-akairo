"use strict";
/* eslint-disable no-console */
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const util_1 = __importDefault(require("util"));
class Test2Command extends __1.Command {
	constructor() {
		super("test2", {
			aliases: ["test2"],
			cooldown: 5000,
			prefix: () => ["/", ">"],
			args: [
				{
					id: "y",
					match: "rest",
					type: __1.Argument.compose(
						(m, s) => s.replace(/\s/g, ""),
						__1.Argument.range(__1.Argument.union("integer", "emojint"), 0, 50)
					)
				}
			]
		});
	}
	exec(message, args) {
		message.channel.send(util_1.default.inspect(args, { depth: 1 }), {
			code: "js"
		});
	}
}
exports.default = Test2Command;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL3Rlc3QyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7Ozs7O0FBRS9CLDZCQUEwQztBQUMxQyxnREFBd0I7QUFFeEIsTUFBcUIsWUFBYSxTQUFRLFdBQU87SUFDaEQ7UUFDQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ2QsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ2xCLFFBQVEsRUFBRSxJQUFJO1lBQ2QsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUN4QixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLEdBQUc7b0JBQ1AsS0FBSyxFQUFFLE1BQU07b0JBQ2IsSUFBSSxFQUFFLFlBQVEsQ0FBQyxPQUFPLENBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQzlCLFlBQVEsQ0FBQyxLQUFLLENBQUMsWUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUMzRDtpQkFDRDthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSTtRQUNqQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNEO0FBdEJELCtCQXNCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgQXJndW1lbnQsIENvbW1hbmQgfSBmcm9tIFwiLi4vLi5cIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3QyQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcInRlc3QyXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcInRlc3QyXCJdLFxuXHRcdFx0Y29vbGRvd246IDUwMDAsXG5cdFx0XHRwcmVmaXg6ICgpID0+IFtcIi9cIiwgXCI+XCJdLFxuXHRcdFx0YXJnczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwieVwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcInJlc3RcIixcblx0XHRcdFx0XHR0eXBlOiBBcmd1bWVudC5jb21wb3NlKFxuXHRcdFx0XHRcdFx0KG0sIHMpID0+IHMucmVwbGFjZSgvXFxzL2csIFwiXCIpLFxuXHRcdFx0XHRcdFx0QXJndW1lbnQucmFuZ2UoQXJndW1lbnQudW5pb24oXCJpbnRlZ2VyXCIsIFwiZW1vamludFwiKSwgMCwgNTApXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRleGVjKG1lc3NhZ2UsIGFyZ3MpIHtcblx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZCh1dGlsLmluc3BlY3QoYXJncywgeyBkZXB0aDogMSB9KSwgeyBjb2RlOiBcImpzXCIgfSk7XG5cdH1cbn1cbiJdfQ==
