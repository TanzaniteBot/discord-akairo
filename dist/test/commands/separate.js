"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
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
        message.channel.send(discord_js_1.Formatters.codeBlock(`js${util_1.default.inspect(args, { depth: 1 })}`));
    }
}
exports.default = SeparateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VwYXJhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL3NlcGFyYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7Ozs7O0FBRS9CLDJDQUFpRDtBQUNqRCxnREFBd0I7QUFDeEIsMkNBQTBDO0FBRTFDLE1BQXFCLGVBQWdCLFNBQVEsZUFBTztJQUNuRDtRQUNDLEtBQUssQ0FBQyxVQUFVLEVBQUU7WUFDakIsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQztZQUM1QixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLFVBQVU7b0JBQ2QsS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLElBQUksRUFBRSxTQUFTO29CQUNmLE1BQU0sRUFBRTt3QkFDUCxLQUFLLEVBQUUsd0JBQXdCO3dCQUMvQixLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxNQUFNLGlDQUFpQztxQkFDdkU7aUJBQ0Q7YUFDRDtTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFUSxJQUFJLENBQUMsT0FBZ0IsRUFBRSxJQUE0QjtRQUMzRCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckYsQ0FBQztDQUNEO0FBckJELGtDQXFCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgRm9ybWF0dGVycywgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgdXRpbCBmcm9tIFwidXRpbFwiO1xuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VwYXJhdGVDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwic2VwYXJhdGVcIiwge1xuXHRcdFx0YWxpYXNlczogW1wic2VwYXJhdGVcIiwgXCJzZXBcIl0sXG5cdFx0XHRhcmdzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJpbnRlZ2Vyc1wiLFxuXHRcdFx0XHRcdG1hdGNoOiBcInNlcGFyYXRlXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJpbnRlZ2VyXCIsXG5cdFx0XHRcdFx0cHJvbXB0OiB7XG5cdFx0XHRcdFx0XHRzdGFydDogXCJHaXZlIG1lIHNvbWUgaW50ZWdlcnMhXCIsXG5cdFx0XHRcdFx0XHRyZXRyeTogKG1zZywgeyBwaHJhc2UgfSkgPT4gYFwiJHtwaHJhc2V9XCIgaXMgbm90IGFuIGludGVnZXIsIHRyeSBhZ2FpbiFgXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UsIGFyZ3M6IHsgaW50ZWdlcnM6IG51bWJlcltdIH0pIHtcblx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZChGb3JtYXR0ZXJzLmNvZGVCbG9jayhganMke3V0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pfWApKTtcblx0fVxufVxuIl19