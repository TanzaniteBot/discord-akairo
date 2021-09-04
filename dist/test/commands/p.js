"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
class PCommand extends index_1.Command {
    constructor() {
        super("p", {
            aliases: ["p"],
            args: [
                {
                    id: "integer",
                    type: "bigint",
                    prompt: {
                        start: async () => {
                            await Promise.resolve(1);
                            return "Give me an integer!";
                        },
                        retry: "That's not an integer, try again!",
                        optional: false
                    }
                }
            ]
        });
    }
    before() {
        console.log(1);
    }
    exec(message, args) {
        message.channel.send(discord_js_1.Formatters.codeBlock(`js${util_1.default.inspect(args, { depth: 1 })}`));
    }
}
exports.default = PCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiwyQ0FBaUQ7QUFDakQsZ0RBQXdCO0FBQ3hCLDJDQUEwQztBQUUxQyxNQUFxQixRQUFTLFNBQVEsZUFBTztJQUM1QztRQUNDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDZCxJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLFNBQVM7b0JBQ2IsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsTUFBTSxFQUFFO3dCQUNQLEtBQUssRUFBRSxLQUFLLElBQUksRUFBRTs0QkFDakIsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN6QixPQUFPLHFCQUFxQixDQUFDO3dCQUM5QixDQUFDO3dCQUNELEtBQUssRUFBRSxtQ0FBbUM7d0JBQzFDLFFBQVEsRUFBRSxLQUFLO3FCQUNmO2lCQUNEO2FBQ0Q7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRVEsTUFBTTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEIsQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFnQixFQUFFLElBQXlCO1FBQ3hELE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0NBQ0Q7QUE1QkQsMkJBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBGb3JtYXR0ZXJzLCBNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcInBcIiwge1xuXHRcdFx0YWxpYXNlczogW1wicFwiXSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImludGVnZXJcIixcblx0XHRcdFx0XHR0eXBlOiBcImJpZ2ludFwiLFxuXHRcdFx0XHRcdHByb21wdDoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgUHJvbWlzZS5yZXNvbHZlKDEpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gXCJHaXZlIG1lIGFuIGludGVnZXIhXCI7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0cmV0cnk6IFwiVGhhdCdzIG5vdCBhbiBpbnRlZ2VyLCB0cnkgYWdhaW4hXCIsXG5cdFx0XHRcdFx0XHRvcHRpb25hbDogZmFsc2Vcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcblx0fVxuXG5cdG92ZXJyaWRlIGJlZm9yZSgpIHtcblx0XHRjb25zb2xlLmxvZygxKTtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobWVzc2FnZTogTWVzc2FnZSwgYXJnczogeyBpbnRlZ2VyOiBCaWdJbnQgfSkge1xuXHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kKEZvcm1hdHRlcnMuY29kZUJsb2NrKGBqcyR7dXRpbC5pbnNwZWN0KGFyZ3MsIHsgZGVwdGg6IDEgfSl9YCkpO1xuXHR9XG59XG4iXX0=