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
class SeparateCommand extends __1.Command {
	constructor() {
		super("separate", {
			aliases: ["separate", "sep"],
			args: [
				{
					id: "integers",
					match: "separate",
					type: "integer",
					prompt: {
						start: "Give me some integers!",
						retry: (msg, { phrase }) =>
							`"${phrase}" is not an integer, try again!`
					}
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
exports.default = SeparateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VwYXJhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL3NlcGFyYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7Ozs7O0FBRS9CLDZCQUFnQztBQUNoQyxnREFBd0I7QUFFeEIsTUFBcUIsZUFBZ0IsU0FBUSxXQUFPO0lBQ25EO1FBQ0MsS0FBSyxDQUFDLFVBQVUsRUFBRTtZQUNqQixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO1lBQzVCLElBQUksRUFBRTtnQkFDTDtvQkFDQyxFQUFFLEVBQUUsVUFBVTtvQkFDZCxLQUFLLEVBQUUsVUFBVTtvQkFDakIsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsTUFBTSxFQUFFO3dCQUNQLEtBQUssRUFBRSx3QkFBd0I7d0JBQy9CLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FDMUIsSUFBSSxNQUFNLGlDQUFpQztxQkFDNUM7aUJBQ0Q7YUFDRDtTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUk7UUFDakIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7Q0FDRDtBQXRCRCxrQ0FzQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vLi5cIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcGFyYXRlQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcInNlcGFyYXRlXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcInNlcGFyYXRlXCIsIFwic2VwXCJdLFxuXHRcdFx0YXJnczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwiaW50ZWdlcnNcIixcblx0XHRcdFx0XHRtYXRjaDogXCJzZXBhcmF0ZVwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiaW50ZWdlclwiLFxuXHRcdFx0XHRcdHByb21wdDoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IFwiR2l2ZSBtZSBzb21lIGludGVnZXJzIVwiLFxuXHRcdFx0XHRcdFx0cmV0cnk6IChtc2csIHsgcGhyYXNlIH0pID0+XG5cdFx0XHRcdFx0XHRcdGBcIiR7cGhyYXNlfVwiIGlzIG5vdCBhbiBpbnRlZ2VyLCB0cnkgYWdhaW4hYFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0ZXhlYyhtZXNzYWdlLCBhcmdzKSB7XG5cdFx0bWVzc2FnZS5jaGFubmVsLnNlbmQodXRpbC5pbnNwZWN0KGFyZ3MsIHsgZGVwdGg6IDEgfSksIHsgY29kZTogXCJqc1wiIH0pO1xuXHR9XG59XG4iXX0=
