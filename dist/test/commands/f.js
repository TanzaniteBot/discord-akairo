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
class FCommand extends __1.Command {
	constructor() {
		super("f", {
			aliases: ["f"],
			args: [
				{
					id: "x",
					type: (msg, phrase) => {
						if (phrase.length > 10) {
							return __1.Flag.fail(phrase);
						}
						return phrase;
					},
					default: (msg, value) => {
						console.log("failed", value);
						return 1;
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
exports.default = FCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiw2QkFBc0M7QUFDdEMsZ0RBQXdCO0FBRXhCLE1BQXFCLFFBQVMsU0FBUSxXQUFPO0lBQzVDO1FBQ0MsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNkLElBQUksRUFBRTtnQkFDTDtvQkFDQyxFQUFFLEVBQUUsR0FBRztvQkFDUCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQ3JCLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7NEJBQ3ZCLE9BQU8sUUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzt5QkFDekI7d0JBRUQsT0FBTyxNQUFNLENBQUM7b0JBQ2YsQ0FBQztvQkFDRCxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7d0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUM3QixPQUFPLENBQUMsQ0FBQztvQkFDVixDQUFDO2lCQUNEO2FBQ0Q7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJO1FBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0Q7QUExQkQsMkJBMEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBDb21tYW5kLCBGbGFnIH0gZnJvbSBcIi4uLy4uXCI7XG5pbXBvcnQgdXRpbCBmcm9tIFwidXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcImZcIiwge1xuXHRcdFx0YWxpYXNlczogW1wiZlwiXSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcInhcIixcblx0XHRcdFx0XHR0eXBlOiAobXNnLCBwaHJhc2UpID0+IHtcblx0XHRcdFx0XHRcdGlmIChwaHJhc2UubGVuZ3RoID4gMTApIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIEZsYWcuZmFpbChwaHJhc2UpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcGhyYXNlO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZGVmYXVsdDogKG1zZywgdmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiZmFpbGVkXCIsIHZhbHVlKTtcblx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0ZXhlYyhtZXNzYWdlLCBhcmdzKSB7XG5cdFx0bWVzc2FnZS5jaGFubmVsLnNlbmQodXRpbC5pbnNwZWN0KGFyZ3MsIHsgZGVwdGg6IDEgfSksIHsgY29kZTogXCJqc1wiIH0pO1xuXHR9XG59XG4iXX0=
