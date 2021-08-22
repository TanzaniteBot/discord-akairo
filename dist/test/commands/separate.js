"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
class SeparateCommand extends index_1.Command {
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
                        retry: (msg, { phrase }) => `"${phrase}" is not an integer, try again!`
                    }
                }
            ]
        });
    }
    exec(message, args) {
        message.channel.send(util_1.default.inspect(args, { depth: 1 }), { code: "js" });
    }
}
exports.default = SeparateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VwYXJhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL3NlcGFyYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7Ozs7O0FBRS9CLDJDQUEwQztBQUMxQyxnREFBd0I7QUFFeEIsTUFBcUIsZUFBZ0IsU0FBUSxlQUFPO0lBQ25EO1FBQ0MsS0FBSyxDQUFDLFVBQVUsRUFBRTtZQUNqQixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO1lBQzVCLElBQUksRUFBRTtnQkFDTDtvQkFDQyxFQUFFLEVBQUUsVUFBVTtvQkFDZCxLQUFLLEVBQUUsVUFBVTtvQkFDakIsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsTUFBTSxFQUFFO3dCQUNQLEtBQUssRUFBRSx3QkFBd0I7d0JBQy9CLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLE1BQU0saUNBQWlDO3FCQUN2RTtpQkFDRDthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSTtRQUMxQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNEO0FBckJELGtDQXFCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcGFyYXRlQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcInNlcGFyYXRlXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcInNlcGFyYXRlXCIsIFwic2VwXCJdLFxuXHRcdFx0YXJnczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwiaW50ZWdlcnNcIixcblx0XHRcdFx0XHRtYXRjaDogXCJzZXBhcmF0ZVwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiaW50ZWdlclwiLFxuXHRcdFx0XHRcdHByb21wdDoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IFwiR2l2ZSBtZSBzb21lIGludGVnZXJzIVwiLFxuXHRcdFx0XHRcdFx0cmV0cnk6IChtc2csIHsgcGhyYXNlIH0pID0+IGBcIiR7cGhyYXNlfVwiIGlzIG5vdCBhbiBpbnRlZ2VyLCB0cnkgYWdhaW4hYFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlLCBhcmdzKSB7XG5cdFx0bWVzc2FnZS5jaGFubmVsLnNlbmQodXRpbC5pbnNwZWN0KGFyZ3MsIHsgZGVwdGg6IDEgfSksIHsgY29kZTogXCJqc1wiIH0pO1xuXHR9XG59XG4iXX0=