"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
class ArgsCommand extends index_1.Command {
    constructor() {
        super("args", {
            aliases: ["args"],
            args: [
                {
                    id: "text",
                    match: "text"
                },
                {
                    id: "content",
                    match: "content"
                },
                {
                    id: "phrase",
                    match: "phrase",
                    otherwise: () => "no!"
                },
                {
                    id: "rest",
                    match: "rest"
                },
                {
                    id: "restContent",
                    match: "restContent"
                },
                {
                    id: "separate",
                    match: "separate"
                },
                {
                    id: "flag",
                    match: "flag",
                    flag: ["-f", "--flag"]
                },
                {
                    id: "option",
                    match: "option",
                    flag: ["-o", "--option"]
                }
            ]
        });
    }
    exec(message, args) {
        message.channel.send(util_1.default.inspect(args, { depth: 1 }), { code: "js" });
    }
}
exports.default = ArgsCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvYXJncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOztBQUUvQiwyQ0FBMEM7QUFDMUMsZ0RBQXdCO0FBRXhCLE1BQXFCLFdBQVksU0FBUSxlQUFPO0lBQy9DO1FBQ0MsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNiLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNqQixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLE1BQU07b0JBQ1YsS0FBSyxFQUFFLE1BQU07aUJBQ2I7Z0JBQ0Q7b0JBQ0MsRUFBRSxFQUFFLFNBQVM7b0JBQ2IsS0FBSyxFQUFFLFNBQVM7aUJBQ2hCO2dCQUNEO29CQUNDLEVBQUUsRUFBRSxRQUFRO29CQUNaLEtBQUssRUFBRSxRQUFRO29CQUNmLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO2lCQUN0QjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsTUFBTTtvQkFDVixLQUFLLEVBQUUsTUFBTTtpQkFDYjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsYUFBYTtvQkFDakIsS0FBSyxFQUFFLGFBQWE7aUJBQ3BCO2dCQUNEO29CQUNDLEVBQUUsRUFBRSxVQUFVO29CQUNkLEtBQUssRUFBRSxVQUFVO2lCQUNqQjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsTUFBTTtvQkFDVixLQUFLLEVBQUUsTUFBTTtvQkFDYixJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO2lCQUN0QjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsUUFBUTtvQkFDWixLQUFLLEVBQUUsUUFBUTtvQkFDZixJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDO2lCQUN4QjthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSTtRQUMxQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNEO0FBL0NELDhCQStDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFyZ3NDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwiYXJnc1wiLCB7XG5cdFx0XHRhbGlhc2VzOiBbXCJhcmdzXCJdLFxuXHRcdFx0YXJnczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwidGV4dFwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcInRleHRcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwiY29udGVudFwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcImNvbnRlbnRcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwicGhyYXNlXCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwicGhyYXNlXCIsXG5cdFx0XHRcdFx0b3RoZXJ3aXNlOiAoKSA9PiBcIm5vIVwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJyZXN0XCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwicmVzdFwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJyZXN0Q29udGVudFwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcInJlc3RDb250ZW50XCJcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcInNlcGFyYXRlXCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwic2VwYXJhdGVcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwiZmxhZ1wiLFxuXHRcdFx0XHRcdG1hdGNoOiBcImZsYWdcIixcblx0XHRcdFx0XHRmbGFnOiBbXCItZlwiLCBcIi0tZmxhZ1wiXVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwib3B0aW9uXCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwib3B0aW9uXCIsXG5cdFx0XHRcdFx0ZmxhZzogW1wiLW9cIiwgXCItLW9wdGlvblwiXVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2UsIGFyZ3MpIHtcblx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZCh1dGlsLmluc3BlY3QoYXJncywgeyBkZXB0aDogMSB9KSwgeyBjb2RlOiBcImpzXCIgfSk7XG5cdH1cbn1cbiJdfQ==