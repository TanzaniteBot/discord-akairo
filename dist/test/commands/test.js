"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
class TestCommand extends index_1.Command {
    constructor() {
        super("test", {
            aliases: ["test", "test-a"],
            cooldown: 5000,
            prefix: ["$", "%"],
            args: [
                {
                    id: "x",
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
exports.default = TestCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOztBQUUvQiwyQ0FBb0Q7QUFDcEQsZ0RBQXdCO0FBRXhCLE1BQXFCLFdBQVksU0FBUSxlQUFPO0lBQy9DO1FBQ0MsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNiLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7WUFDM0IsUUFBUSxFQUFFLElBQUk7WUFDZCxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQ2xCLElBQUksRUFBRTtnQkFDTDtvQkFDQyxFQUFFLEVBQUUsR0FBRztvQkFDUCxLQUFLLEVBQUUsTUFBTTtvQkFDYixJQUFJLEVBQUUsZ0JBQVEsQ0FBQyxPQUFPLENBQ3JCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQzlCLGdCQUFRLENBQUMsS0FBSyxDQUFDLGdCQUFRLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQzNEO2lCQUNEO2FBQ0Q7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRVEsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJO1FBQzFCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0Q7QUF0QkQsOEJBc0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBBcmd1bWVudCwgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwidGVzdFwiLCB7XG5cdFx0XHRhbGlhc2VzOiBbXCJ0ZXN0XCIsIFwidGVzdC1hXCJdLFxuXHRcdFx0Y29vbGRvd246IDUwMDAsXG5cdFx0XHRwcmVmaXg6IFtcIiRcIiwgXCIlXCJdLFxuXHRcdFx0YXJnczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwieFwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcInJlc3RcIixcblx0XHRcdFx0XHR0eXBlOiBBcmd1bWVudC5jb21wb3NlKFxuXHRcdFx0XHRcdFx0KG0sIHMpID0+IHMucmVwbGFjZSgvXFxzL2csIFwiXCIpLFxuXHRcdFx0XHRcdFx0QXJndW1lbnQucmFuZ2UoQXJndW1lbnQudW5pb24oXCJpbnRlZ2VyXCIsIFwiZW1vamludFwiKSwgMCwgNTApXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2UsIGFyZ3MpIHtcblx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZCh1dGlsLmluc3BlY3QoYXJncywgeyBkZXB0aDogMSB9KSwgeyBjb2RlOiBcImpzXCIgfSk7XG5cdH1cbn1cbiJdfQ==