"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
class SubCommand extends index_1.Command {
    constructor() {
        super("sub", {
            args: [
                {
                    id: "thing"
                }
            ]
        });
    }
    exec(message, args) {
        message.channel.send(util_1.default.inspect(args, { depth: 1 }), { code: "js" });
    }
}
exports.default = SubCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9jb21tYW5kcy9zdWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtCQUErQjs7QUFFL0IsMkNBQTBDO0FBQzFDLGdEQUF3QjtBQUV4QixNQUFxQixVQUFXLFNBQVEsZUFBTztJQUM5QztRQUNDLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDWixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLE9BQU87aUJBQ1g7YUFDRDtTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFUSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUk7UUFDMUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7Q0FDRDtBQWRELDZCQWNDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuaW1wb3J0IHV0aWwgZnJvbSBcInV0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3ViQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcInN1YlwiLCB7XG5cdFx0XHRhcmdzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJ0aGluZ1wiXG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobWVzc2FnZSwgYXJncykge1xuXHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHV0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pLCB7IGNvZGU6IFwianNcIiB9KTtcblx0fVxufVxuIl19