"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
class GenerateCommand extends index_1.Command {
    constructor() {
        super("generate", {
            aliases: ["generate", "g"]
        });
    }
    *args() {
        const x = yield {
            type: ["1", "2"],
            otherwise: "Type 1 or 2!"
        };
        if (x === "1") {
            return index_1.Flag.continue("sub");
        }
        return { x };
    }
    exec(message, args) {
        message.channel.send(discord_js_1.Formatters.codeBlock(`js${util_1.default.inspect(args, { depth: 1 })}`));
    }
}
exports.default = GenerateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL2dlbmVyYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7Ozs7O0FBRS9CLDJDQUFpRDtBQUNqRCxnREFBd0I7QUFDeEIsMkNBQWlFO0FBRWpFLE1BQXFCLGVBQWdCLFNBQVEsZUFBTztJQUNuRDtRQUNDLEtBQUssQ0FBQyxVQUFVLEVBQUU7WUFDakIsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQztTQUMxQixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsQ0FBQyxJQUFJO1FBQ0osTUFBTSxDQUFDLEdBQUcsTUFBTTtZQUNmLElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDaEIsU0FBUyxFQUFFLGNBQWM7U0FDekIsQ0FBQztRQUVGLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUNkLE9BQU8sWUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM1QjtRQUVELE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFUSxJQUFJLENBQUMsT0FBZ0IsRUFBRSxJQUFzQjtRQUNyRCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckYsQ0FBQztDQUNEO0FBdkJELGtDQXVCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgRm9ybWF0dGVycywgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgdXRpbCBmcm9tIFwidXRpbFwiO1xuaW1wb3J0IHsgQXJndW1lbnRPcHRpb25zLCBDb21tYW5kLCBGbGFnIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHZW5lcmF0ZUNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJnZW5lcmF0ZVwiLCB7XG5cdFx0XHRhbGlhc2VzOiBbXCJnZW5lcmF0ZVwiLCBcImdcIl1cblx0XHR9KTtcblx0fVxuXG5cdCphcmdzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8QXJndW1lbnRPcHRpb25zIHwgRmxhZz4ge1xuXHRcdGNvbnN0IHggPSB5aWVsZCB7XG5cdFx0XHR0eXBlOiBbXCIxXCIsIFwiMlwiXSxcblx0XHRcdG90aGVyd2lzZTogXCJUeXBlIDEgb3IgMiFcIlxuXHRcdH07XG5cblx0XHRpZiAoeCA9PT0gXCIxXCIpIHtcblx0XHRcdHJldHVybiBGbGFnLmNvbnRpbnVlKFwic3ViXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7IHggfTtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobWVzc2FnZTogTWVzc2FnZSwgYXJnczogeyB4OiBcIjFcIiB8IFwiMlwiIH0pIHtcblx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZChGb3JtYXR0ZXJzLmNvZGVCbG9jayhganMke3V0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pfWApKTtcblx0fVxufVxuIl19