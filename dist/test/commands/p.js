"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
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
        message.channel.send(util_1.default.inspect(args, { depth: 1 }), { code: "js" });
    }
}
exports.default = PCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiwyQ0FBMEM7QUFDMUMsZ0RBQXdCO0FBRXhCLE1BQXFCLFFBQVMsU0FBUSxlQUFPO0lBQzVDO1FBQ0MsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNkLElBQUksRUFBRTtnQkFDTDtvQkFDQyxFQUFFLEVBQUUsU0FBUztvQkFDYixJQUFJLEVBQUUsUUFBUTtvQkFDZCxNQUFNLEVBQUU7d0JBQ1AsS0FBSyxFQUFFLEtBQUssSUFBSSxFQUFFOzRCQUNqQixNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3pCLE9BQU8scUJBQXFCLENBQUM7d0JBQzlCLENBQUM7d0JBQ0QsS0FBSyxFQUFFLG1DQUFtQzt3QkFDMUMsUUFBUSxFQUFFLEtBQUs7cUJBQ2Y7aUJBQ0Q7YUFDRDtTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFUSxNQUFNO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBRVEsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJO1FBQzFCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0Q7QUE1QkQsMkJBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuaW1wb3J0IHV0aWwgZnJvbSBcInV0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJwXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcInBcIl0sXG5cdFx0XHRhcmdzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJpbnRlZ2VyXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJiaWdpbnRcIixcblx0XHRcdFx0XHRwcm9tcHQ6IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IFByb21pc2UucmVzb2x2ZSgxKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFwiR2l2ZSBtZSBhbiBpbnRlZ2VyIVwiO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHJldHJ5OiBcIlRoYXQncyBub3QgYW4gaW50ZWdlciwgdHJ5IGFnYWluIVwiLFxuXHRcdFx0XHRcdFx0b3B0aW9uYWw6IGZhbHNlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRvdmVycmlkZSBiZWZvcmUoKSB7XG5cdFx0Y29uc29sZS5sb2coMSk7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2UsIGFyZ3MpIHtcblx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZCh1dGlsLmluc3BlY3QoYXJncywgeyBkZXB0aDogMSB9KSwgeyBjb2RlOiBcImpzXCIgfSk7XG5cdH1cbn1cbiJdfQ==