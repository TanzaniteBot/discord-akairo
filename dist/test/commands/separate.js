"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
class SeparateCommand extends index_1.Command {
    constructor() {
        super("separate", {
            aliases: ["separate", "sep"],
            args: [
                {
                    id: "integers",
                    match: "separate",
                    type: "integer",
                    prompt: {
                        start: "Give me some integers!",
                        retry: (msg, { phrase }) => `"${phrase}" is not an integer, try again!`
                    }
                }
            ]
        });
    }
    exec(message, args) {
        message.channel.send(util_1.default.inspect(args, { depth: 1 }), { code: "js" });
    }
}
exports.default = SeparateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VwYXJhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL3NlcGFyYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7Ozs7O0FBRS9CLDJDQUEwQztBQUMxQyxnREFBd0I7QUFFeEIsTUFBcUIsZUFBZ0IsU0FBUSxlQUFPO0lBQ25EO1FBQ0MsS0FBSyxDQUFDLFVBQVUsRUFBRTtZQUNqQixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO1lBQzVCLElBQUksRUFBRTtnQkFDTDtvQkFDQyxFQUFFLEVBQUUsVUFBVTtvQkFDZCxLQUFLLEVBQUUsVUFBVTtvQkFDakIsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsTUFBTSxFQUFFO3dCQUNQLEtBQUssRUFBRSx3QkFBd0I7d0JBQy9CLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FDMUIsSUFBSSxNQUFNLGlDQUFpQztxQkFDNUM7aUJBQ0Q7YUFDRDtTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFUSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUk7UUFDMUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7Q0FDRDtBQXRCRCxrQ0FzQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5pbXBvcnQgdXRpbCBmcm9tIFwidXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXBhcmF0ZUNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJzZXBhcmF0ZVwiLCB7XG5cdFx0XHRhbGlhc2VzOiBbXCJzZXBhcmF0ZVwiLCBcInNlcFwiXSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImludGVnZXJzXCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwic2VwYXJhdGVcIixcblx0XHRcdFx0XHR0eXBlOiBcImludGVnZXJcIixcblx0XHRcdFx0XHRwcm9tcHQ6IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiBcIkdpdmUgbWUgc29tZSBpbnRlZ2VycyFcIixcblx0XHRcdFx0XHRcdHJldHJ5OiAobXNnLCB7IHBocmFzZSB9KSA9PlxuXHRcdFx0XHRcdFx0XHRgXCIke3BocmFzZX1cIiBpcyBub3QgYW4gaW50ZWdlciwgdHJ5IGFnYWluIWBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdF1cblx0XHR9KTtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobWVzc2FnZSwgYXJncykge1xuXHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHV0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pLCB7IGNvZGU6IFwianNcIiB9KTtcblx0fVxufVxuIl19