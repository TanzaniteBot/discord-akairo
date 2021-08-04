"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
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
        message.channel.send(util_1.default.inspect(args, { depth: 1 }), { code: "js" });
    }
}
exports.default = Test2Command;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL3Rlc3QyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7O0FBRS9CLDJDQUFvRDtBQUNwRCxnREFBd0I7QUFFeEIsTUFBcUIsWUFBYSxTQUFRLGVBQU87SUFDaEQ7UUFDQyxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQ2QsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ2xCLFFBQVEsRUFBRSxJQUFJO1lBQ2QsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUN4QixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLEdBQUc7b0JBQ1AsS0FBSyxFQUFFLE1BQU07b0JBQ2IsSUFBSSxFQUFFLGdCQUFRLENBQUMsT0FBTyxDQUNyQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUM5QixnQkFBUSxDQUFDLEtBQUssQ0FBQyxnQkFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUMzRDtpQkFDRDthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSTtRQUMxQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNEO0FBdEJELCtCQXNCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgQXJndW1lbnQsIENvbW1hbmQgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5pbXBvcnQgdXRpbCBmcm9tIFwidXRpbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0MkNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJ0ZXN0MlwiLCB7XG5cdFx0XHRhbGlhc2VzOiBbXCJ0ZXN0MlwiXSxcblx0XHRcdGNvb2xkb3duOiA1MDAwLFxuXHRcdFx0cHJlZml4OiAoKSA9PiBbXCIvXCIsIFwiPlwiXSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcInlcIixcblx0XHRcdFx0XHRtYXRjaDogXCJyZXN0XCIsXG5cdFx0XHRcdFx0dHlwZTogQXJndW1lbnQuY29tcG9zZShcblx0XHRcdFx0XHRcdChtLCBzKSA9PiBzLnJlcGxhY2UoL1xccy9nLCBcIlwiKSxcblx0XHRcdFx0XHRcdEFyZ3VtZW50LnJhbmdlKEFyZ3VtZW50LnVuaW9uKFwiaW50ZWdlclwiLCBcImVtb2ppbnRcIiksIDAsIDUwKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlLCBhcmdzKSB7XG5cdFx0bWVzc2FnZS5jaGFubmVsLnNlbmQodXRpbC5pbnNwZWN0KGFyZ3MsIHsgZGVwdGg6IDEgfSksIHsgY29kZTogXCJqc1wiIH0pO1xuXHR9XG59XG4iXX0=