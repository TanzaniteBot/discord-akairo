"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
class FCommand extends index_1.Command {
    constructor() {
        super("f", {
            aliases: ["f"],
            args: [
                {
                    id: "x",
                    type: (msg, phrase) => {
                        if (phrase.length > 10) {
                            return index_1.Flag.fail(phrase);
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
        message.channel.send(discord_js_1.Formatters.codeBlock(`js${util_1.default.inspect(args, { depth: 1 })}`));
    }
}
exports.default = FCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiwyQ0FBaUQ7QUFDakQsZ0RBQXdCO0FBQ3hCLDJDQUFnRDtBQUVoRCxNQUFxQixRQUFTLFNBQVEsZUFBTztJQUM1QztRQUNDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDZCxJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLEdBQUc7b0JBQ1AsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUNyQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFOzRCQUN2QixPQUFPLFlBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7eUJBQ3pCO3dCQUVELE9BQU8sTUFBTSxDQUFDO29CQUNmLENBQUM7b0JBQ0QsT0FBTyxFQUFFLENBQUMsR0FBWSxFQUFFLEtBQWEsRUFBRSxFQUFFO3dCQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDN0IsT0FBTyxDQUFDLENBQUM7b0JBQ1YsQ0FBQztpQkFDRDthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFnQixFQUFFLElBQW9CO1FBQ25ELE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0NBQ0Q7QUExQkQsMkJBMEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBGb3JtYXR0ZXJzLCBNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBDb21tYW5kLCBGbGFnIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcImZcIiwge1xuXHRcdFx0YWxpYXNlczogW1wiZlwiXSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcInhcIixcblx0XHRcdFx0XHR0eXBlOiAobXNnLCBwaHJhc2UpID0+IHtcblx0XHRcdFx0XHRcdGlmIChwaHJhc2UubGVuZ3RoID4gMTApIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIEZsYWcuZmFpbChwaHJhc2UpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gcGhyYXNlO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZGVmYXVsdDogKG1zZzogTWVzc2FnZSwgdmFsdWU6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJmYWlsZWRcIiwgdmFsdWUpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UsIGFyZ3M6IHsgeDogdW5rbm93biB9KSB7XG5cdFx0bWVzc2FnZS5jaGFubmVsLnNlbmQoRm9ybWF0dGVycy5jb2RlQmxvY2soYGpzJHt1dGlsLmluc3BlY3QoYXJncywgeyBkZXB0aDogMSB9KX1gKSk7XG5cdH1cbn1cbiJdfQ==