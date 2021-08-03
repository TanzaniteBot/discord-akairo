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
class TestCommand extends __1.Command {
	constructor() {
		super("test", {
			aliases: ["test", "test-a"],
			cooldown: 5000,
			prefix: ["$", "%"],
			args: [
				{
					id: "x",
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
exports.default = TestCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiw2QkFBMEM7QUFDMUMsZ0RBQXdCO0FBRXhCLE1BQXFCLFdBQVksU0FBUSxXQUFPO0lBQy9DO1FBQ0MsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNiLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7WUFDM0IsUUFBUSxFQUFFLElBQUk7WUFDZCxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ2xCLElBQUksRUFBRTtnQkFDTDtvQkFDQyxFQUFFLEVBQUUsR0FBRztvQkFDUCxLQUFLLEVBQUUsTUFBTTtvQkFDYixJQUFJLEVBQUUsWUFBUSxDQUFDLE9BQU8sQ0FDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFDOUIsWUFBUSxDQUFDLEtBQUssQ0FBQyxZQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQzNEO2lCQUNEO2FBQ0Q7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJO1FBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0Q7QUF0QkQsOEJBc0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBBcmd1bWVudCwgQ29tbWFuZCB9IGZyb20gXCIuLi8uLlwiO1xuaW1wb3J0IHV0aWwgZnJvbSBcInV0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVzdENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJ0ZXN0XCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcInRlc3RcIiwgXCJ0ZXN0LWFcIl0sXG5cdFx0XHRjb29sZG93bjogNTAwMCxcblx0XHRcdHByZWZpeDogW1wiJFwiLCBcIiVcIl0sXG5cdFx0XHRhcmdzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJ4XCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwicmVzdFwiLFxuXHRcdFx0XHRcdHR5cGU6IEFyZ3VtZW50LmNvbXBvc2UoXG5cdFx0XHRcdFx0XHQobSwgcykgPT4gcy5yZXBsYWNlKC9cXHMvZywgXCJcIiksXG5cdFx0XHRcdFx0XHRBcmd1bWVudC5yYW5nZShBcmd1bWVudC51bmlvbihcImludGVnZXJcIiwgXCJlbW9qaW50XCIpLCAwLCA1MClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcblx0fVxuXG5cdGV4ZWMobWVzc2FnZSwgYXJncykge1xuXHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHV0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pLCB7IGNvZGU6IFwianNcIiB9KTtcblx0fVxufVxuIl19
