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
class ArgsCommand extends __1.Command {
	constructor() {
		super("args", {
			aliases: ["args"],
			args: [
				{
					id: "text",
					match: "text"
				},
				{
					id: "content",
					match: "content"
				},
				{
					id: "phrase",
					match: "phrase",
					otherwise: () => "no!"
				},
				{
					id: "rest",
					match: "rest"
				},
				{
					id: "restContent",
					match: "restContent"
				},
				{
					id: "separate",
					match: "separate"
				},
				{
					id: "flag",
					match: "flag",
					flag: ["-f", "--flag"]
				},
				{
					id: "option",
					match: "option",
					flag: ["-o", "--option"]
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
exports.default = ArgsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvYXJncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiw2QkFBZ0M7QUFDaEMsZ0RBQXdCO0FBRXhCLE1BQXFCLFdBQVksU0FBUSxXQUFPO0lBQy9DO1FBQ0MsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNiLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNqQixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLE1BQU07b0JBQ1YsS0FBSyxFQUFFLE1BQU07aUJBQ2I7Z0JBQ0Q7b0JBQ0MsRUFBRSxFQUFFLFNBQVM7b0JBQ2IsS0FBSyxFQUFFLFNBQVM7aUJBQ2hCO2dCQUNEO29CQUNDLEVBQUUsRUFBRSxRQUFRO29CQUNaLEtBQUssRUFBRSxRQUFRO29CQUNmLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO2lCQUN0QjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsTUFBTTtvQkFDVixLQUFLLEVBQUUsTUFBTTtpQkFDYjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsYUFBYTtvQkFDakIsS0FBSyxFQUFFLGFBQWE7aUJBQ3BCO2dCQUNEO29CQUNDLEVBQUUsRUFBRSxVQUFVO29CQUNkLEtBQUssRUFBRSxVQUFVO2lCQUNqQjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsTUFBTTtvQkFDVixLQUFLLEVBQUUsTUFBTTtvQkFDYixJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO2lCQUN0QjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsUUFBUTtvQkFDWixLQUFLLEVBQUUsUUFBUTtvQkFDZixJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDO2lCQUN4QjthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSTtRQUNqQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNEO0FBL0NELDhCQStDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLlwiO1xuaW1wb3J0IHV0aWwgZnJvbSBcInV0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJnc0NvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJhcmdzXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcImFyZ3NcIl0sXG5cdFx0XHRhcmdzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJ0ZXh0XCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwidGV4dFwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJjb250ZW50XCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwiY29udGVudFwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJwaHJhc2VcIixcblx0XHRcdFx0XHRtYXRjaDogXCJwaHJhc2VcIixcblx0XHRcdFx0XHRvdGhlcndpc2U6ICgpID0+IFwibm8hXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcInJlc3RcIixcblx0XHRcdFx0XHRtYXRjaDogXCJyZXN0XCJcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcInJlc3RDb250ZW50XCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwicmVzdENvbnRlbnRcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwic2VwYXJhdGVcIixcblx0XHRcdFx0XHRtYXRjaDogXCJzZXBhcmF0ZVwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJmbGFnXCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwiZmxhZ1wiLFxuXHRcdFx0XHRcdGZsYWc6IFtcIi1mXCIsIFwiLS1mbGFnXCJdXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJvcHRpb25cIixcblx0XHRcdFx0XHRtYXRjaDogXCJvcHRpb25cIixcblx0XHRcdFx0XHRmbGFnOiBbXCItb1wiLCBcIi0tb3B0aW9uXCJdXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcblx0fVxuXG5cdGV4ZWMobWVzc2FnZSwgYXJncykge1xuXHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHV0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pLCB7IGNvZGU6IFwianNcIiB9KTtcblx0fVxufVxuIl19
