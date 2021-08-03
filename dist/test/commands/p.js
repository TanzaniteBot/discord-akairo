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
class PCommand extends __1.Command {
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
		message.channel.send(util_1.default.inspect(args, { depth: 1 }), {
			code: "js"
		});
	}
}
exports.default = PCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiw2QkFBZ0M7QUFDaEMsZ0RBQXdCO0FBRXhCLE1BQXFCLFFBQVMsU0FBUSxXQUFPO0lBQzVDO1FBQ0MsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNkLElBQUksRUFBRTtnQkFDTDtvQkFDQyxFQUFFLEVBQUUsU0FBUztvQkFDYixJQUFJLEVBQUUsUUFBUTtvQkFDZCxNQUFNLEVBQUU7d0JBQ1AsS0FBSyxFQUFFLEtBQUssSUFBSSxFQUFFOzRCQUNqQixNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3pCLE9BQU8scUJBQXFCLENBQUM7d0JBQzlCLENBQUM7d0JBQ0QsS0FBSyxFQUFFLG1DQUFtQzt3QkFDMUMsUUFBUSxFQUFFLEtBQUs7cUJBQ2Y7aUJBQ0Q7YUFDRDtTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNO1FBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJO1FBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0Q7QUE1QkQsMkJBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uLy4uXCI7XG5pbXBvcnQgdXRpbCBmcm9tIFwidXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcInBcIiwge1xuXHRcdFx0YWxpYXNlczogW1wicFwiXSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImludGVnZXJcIixcblx0XHRcdFx0XHR0eXBlOiBcImJpZ2ludFwiLFxuXHRcdFx0XHRcdHByb21wdDoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgUHJvbWlzZS5yZXNvbHZlKDEpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gXCJHaXZlIG1lIGFuIGludGVnZXIhXCI7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0cmV0cnk6IFwiVGhhdCdzIG5vdCBhbiBpbnRlZ2VyLCB0cnkgYWdhaW4hXCIsXG5cdFx0XHRcdFx0XHRvcHRpb25hbDogZmFsc2Vcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcblx0fVxuXG5cdGJlZm9yZSgpIHtcblx0XHRjb25zb2xlLmxvZygxKTtcblx0fVxuXG5cdGV4ZWMobWVzc2FnZSwgYXJncykge1xuXHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHV0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pLCB7IGNvZGU6IFwianNcIiB9KTtcblx0fVxufVxuIl19
