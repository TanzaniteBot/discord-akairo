"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
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
        message.channel.send(util_1.default.inspect(args, { depth: 1 }), { code: "js" });
    }
}
exports.default = FCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOzs7OztBQUUvQiwyQ0FBZ0Q7QUFDaEQsZ0RBQXdCO0FBRXhCLE1BQXFCLFFBQVMsU0FBUSxlQUFPO0lBQzVDO1FBQ0MsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNkLElBQUksRUFBRTtnQkFDTDtvQkFDQyxFQUFFLEVBQUUsR0FBRztvQkFDUCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQ3JCLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUU7NEJBQ3ZCLE9BQU8sWUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzt5QkFDekI7d0JBRUQsT0FBTyxNQUFNLENBQUM7b0JBQ2YsQ0FBQztvQkFDRCxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7d0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUM3QixPQUFPLENBQUMsQ0FBQztvQkFDVixDQUFDO2lCQUNEO2FBQ0Q7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRVEsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJO1FBQzFCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0Q7QUExQkQsMkJBMEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBDb21tYW5kLCBGbGFnIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuaW1wb3J0IHV0aWwgZnJvbSBcInV0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRkNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJmXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcImZcIl0sXG5cdFx0XHRhcmdzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJ4XCIsXG5cdFx0XHRcdFx0dHlwZTogKG1zZywgcGhyYXNlKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAocGhyYXNlLmxlbmd0aCA+IDEwKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBGbGFnLmZhaWwocGhyYXNlKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIHBocmFzZTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGRlZmF1bHQ6IChtc2csIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcImZhaWxlZFwiLCB2YWx1ZSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobWVzc2FnZSwgYXJncykge1xuXHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHV0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pLCB7IGNvZGU6IFwianNcIiB9KTtcblx0fVxufVxuIl19