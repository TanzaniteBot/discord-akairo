"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
class TestCommand extends index_1.Command {
    constructor() {
        super("test", {
            aliases: ["test", "test-a"],
            cooldown: 5000,
            prefix: ["$", "%"],
            args: [
                {
                    id: "x",
                    match: "rest",
                    type: index_1.Argument.compose((m, s) => s.replace(/\s/g, ""), index_1.Argument.range(index_1.Argument.union("integer", "emojint"), 0, 50))
                }
            ]
        });
    }
    exec(message, args) {
        message.channel.send(discord_js_1.Formatters.codeBlock(`js${util_1.default.inspect(args, { depth: 1 })}`));
    }
}
exports.default = TestCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiwyQ0FBaUQ7QUFDakQsZ0RBQXdCO0FBQ3hCLDJDQUFvRDtBQUVwRCxNQUFxQixXQUFZLFNBQVEsZUFBTztJQUMvQztRQUNDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDYixPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO1lBQzNCLFFBQVEsRUFBRSxJQUFJO1lBQ2QsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUNsQixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLEdBQUc7b0JBQ1AsS0FBSyxFQUFFLE1BQU07b0JBQ2IsSUFBSSxFQUFFLGdCQUFRLENBQUMsT0FBTyxDQUNyQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUM5QixnQkFBUSxDQUFDLEtBQUssQ0FBQyxnQkFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUMzRDtpQkFDRDthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFnQixFQUFFLElBQW1CO1FBQ2xELE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0NBQ0Q7QUF0QkQsOEJBc0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBGb3JtYXR0ZXJzLCBNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBBcmd1bWVudCwgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVzdENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJ0ZXN0XCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcInRlc3RcIiwgXCJ0ZXN0LWFcIl0sXG5cdFx0XHRjb29sZG93bjogNTAwMCxcblx0XHRcdHByZWZpeDogW1wiJFwiLCBcIiVcIl0sXG5cdFx0XHRhcmdzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJ4XCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwicmVzdFwiLFxuXHRcdFx0XHRcdHR5cGU6IEFyZ3VtZW50LmNvbXBvc2UoXG5cdFx0XHRcdFx0XHQobSwgcykgPT4gcy5yZXBsYWNlKC9cXHMvZywgXCJcIiksXG5cdFx0XHRcdFx0XHRBcmd1bWVudC5yYW5nZShBcmd1bWVudC51bmlvbihcImludGVnZXJcIiwgXCJlbW9qaW50XCIpLCAwLCA1MClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobWVzc2FnZTogTWVzc2FnZSwgYXJnczogeyB4OiBudW1iZXIgfSkge1xuXHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kKEZvcm1hdHRlcnMuY29kZUJsb2NrKGBqcyR7dXRpbC5pbnNwZWN0KGFyZ3MsIHsgZGVwdGg6IDEgfSl9YCkpO1xuXHR9XG59XG4iXX0=