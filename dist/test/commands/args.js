"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
class ArgsCommand extends index_1.Command {
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
        message.channel.send(discord_js_1.Formatters.codeBlock(`js${util_1.default.inspect(args, { depth: 1 })}`));
    }
}
exports.default = ArgsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvYXJncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiwyQ0FBaUQ7QUFDakQsZ0RBQXdCO0FBQ3hCLDJDQUEwQztBQUUxQyxNQUFxQixXQUFZLFNBQVEsZUFBTztJQUMvQztRQUNDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDYixPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDakIsSUFBSSxFQUFFO2dCQUNMO29CQUNDLEVBQUUsRUFBRSxNQUFNO29CQUNWLEtBQUssRUFBRSxNQUFNO2lCQUNiO2dCQUNEO29CQUNDLEVBQUUsRUFBRSxTQUFTO29CQUNiLEtBQUssRUFBRSxTQUFTO2lCQUNoQjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsUUFBUTtvQkFDWixLQUFLLEVBQUUsUUFBUTtvQkFDZixTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSztpQkFDdEI7Z0JBQ0Q7b0JBQ0MsRUFBRSxFQUFFLE1BQU07b0JBQ1YsS0FBSyxFQUFFLE1BQU07aUJBQ2I7Z0JBQ0Q7b0JBQ0MsRUFBRSxFQUFFLGFBQWE7b0JBQ2pCLEtBQUssRUFBRSxhQUFhO2lCQUNwQjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsVUFBVTtvQkFDZCxLQUFLLEVBQUUsVUFBVTtpQkFDakI7Z0JBQ0Q7b0JBQ0MsRUFBRSxFQUFFLE1BQU07b0JBQ1YsS0FBSyxFQUFFLE1BQU07b0JBQ2IsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztpQkFDdEI7Z0JBQ0Q7b0JBQ0MsRUFBRSxFQUFFLFFBQVE7b0JBQ1osS0FBSyxFQUFFLFFBQVE7b0JBQ2YsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQztpQkFDeEI7YUFDRDtTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFUSxJQUFJLENBQ1osT0FBZ0IsRUFDaEIsSUFTQztRQUVELE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0NBQ0Q7QUEzREQsOEJBMkRDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBGb3JtYXR0ZXJzLCBNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmdzQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcImFyZ3NcIiwge1xuXHRcdFx0YWxpYXNlczogW1wiYXJnc1wiXSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcInRleHRcIixcblx0XHRcdFx0XHRtYXRjaDogXCJ0ZXh0XCJcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImNvbnRlbnRcIixcblx0XHRcdFx0XHRtYXRjaDogXCJjb250ZW50XCJcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcInBocmFzZVwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcInBocmFzZVwiLFxuXHRcdFx0XHRcdG90aGVyd2lzZTogKCkgPT4gXCJubyFcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwicmVzdFwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcInJlc3RcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwicmVzdENvbnRlbnRcIixcblx0XHRcdFx0XHRtYXRjaDogXCJyZXN0Q29udGVudFwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJzZXBhcmF0ZVwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcInNlcGFyYXRlXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImZsYWdcIixcblx0XHRcdFx0XHRtYXRjaDogXCJmbGFnXCIsXG5cdFx0XHRcdFx0ZmxhZzogW1wiLWZcIiwgXCItLWZsYWdcIl1cblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcIm9wdGlvblwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcIm9wdGlvblwiLFxuXHRcdFx0XHRcdGZsYWc6IFtcIi1vXCIsIFwiLS1vcHRpb25cIl1cblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdGFyZ3M6IHtcblx0XHRcdHRleHQ6IHN0cmluZztcblx0XHRcdGNvbnRlbnQ6IHN0cmluZztcblx0XHRcdHBocmFzZTogc3RyaW5nO1xuXHRcdFx0cmVzdDogc3RyaW5nO1xuXHRcdFx0cmVzdENvbnRlbnQ6IHN0cmluZztcblx0XHRcdHNlcGFyYXRlOiBzdHJpbmdbXTtcblx0XHRcdGZsYWc/OiBib29sZWFuO1xuXHRcdFx0b3B0aW9uOiBzdHJpbmc7XG5cdFx0fVxuXHQpIHtcblx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZChGb3JtYXR0ZXJzLmNvZGVCbG9jayhganMke3V0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pfWApKTtcblx0fVxufVxuIl19