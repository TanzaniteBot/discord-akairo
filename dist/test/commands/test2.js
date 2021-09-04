"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
class Test2Command extends index_1.Command {
    constructor() {
        super("test2", {
            aliases: ["test2"],
            cooldown: 5000,
            prefix: () => ["/", ">"],
            args: [
                {
                    id: "y",
                    match: "rest",
                    type: index_1.Argument.compose((m, s) => s.replace(/\s/g, ""), index_1.Argument.range(index_1.Argument.union("integer", "emojint"), 0, 50))
                }
            ]
        });
    }
    exec(message, args) {
        message.channel.send(discord_js_1.Formatters.codeBlock(`js${util_1.default.inspect(args, { depth: 1 })}`));
    }
}
exports.default = Test2Command;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL3Rlc3QyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7Ozs7O0FBRS9CLDJDQUFpRDtBQUNqRCxnREFBd0I7QUFDeEIsMkNBQW9EO0FBRXBELE1BQXFCLFlBQWEsU0FBUSxlQUFPO0lBQ2hEO1FBQ0MsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNkLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNsQixRQUFRLEVBQUUsSUFBSTtZQUNkLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDeEIsSUFBSSxFQUFFO2dCQUNMO29CQUNDLEVBQUUsRUFBRSxHQUFHO29CQUNQLEtBQUssRUFBRSxNQUFNO29CQUNiLElBQUksRUFBRSxnQkFBUSxDQUFDLE9BQU8sQ0FDckIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFDOUIsZ0JBQVEsQ0FBQyxLQUFLLENBQUMsZ0JBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDM0Q7aUJBQ0Q7YUFDRDtTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFUSxJQUFJLENBQUMsT0FBZ0IsRUFBRSxJQUFtQjtRQUNsRCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckYsQ0FBQztDQUNEO0FBdEJELCtCQXNCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgRm9ybWF0dGVycywgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgdXRpbCBmcm9tIFwidXRpbFwiO1xuaW1wb3J0IHsgQXJndW1lbnQsIENvbW1hbmQgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3QyQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcInRlc3QyXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcInRlc3QyXCJdLFxuXHRcdFx0Y29vbGRvd246IDUwMDAsXG5cdFx0XHRwcmVmaXg6ICgpID0+IFtcIi9cIiwgXCI+XCJdLFxuXHRcdFx0YXJnczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwieVwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcInJlc3RcIixcblx0XHRcdFx0XHR0eXBlOiBBcmd1bWVudC5jb21wb3NlKFxuXHRcdFx0XHRcdFx0KG0sIHMpID0+IHMucmVwbGFjZSgvXFxzL2csIFwiXCIpLFxuXHRcdFx0XHRcdFx0QXJndW1lbnQucmFuZ2UoQXJndW1lbnQudW5pb24oXCJpbnRlZ2VyXCIsIFwiZW1vamludFwiKSwgMCwgNTApXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UsIGFyZ3M6IHsgeTogbnVtYmVyIH0pIHtcblx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZChGb3JtYXR0ZXJzLmNvZGVCbG9jayhganMke3V0aWwuaW5zcGVjdChhcmdzLCB7IGRlcHRoOiAxIH0pfWApKTtcblx0fVxufVxuIl19