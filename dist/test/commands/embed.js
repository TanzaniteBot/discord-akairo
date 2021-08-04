"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
class EmbedCommand extends index_1.Command {
    constructor() {
        super("embed", {
            aliases: ["embed"],
            args: [
                {
                    id: "emptyContent",
                    match: "flag",
                    flag: "-c"
                },
                {
                    id: "emptyEmbed",
                    match: "flag",
                    flag: "-e"
                },
                {
                    id: "phrase",
                    match: "phrase"
                }
            ]
        });
    }
    exec(message, args) {
        if (args.emptyContent) {
            return message.util.send(null, { embed: { description: args.phrase } });
        }
        if (args.emptyEmbed) {
            return message.util.send(args.phrase, { embed: null });
        }
        return message.util.send(args.phrase, {
            embed: { description: args.phrase }
        });
    }
}
exports.default = EmbedCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1iZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL2VtYmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQTBDO0FBRTFDLE1BQXFCLFlBQWEsU0FBUSxlQUFPO0lBQ2hEO1FBQ0MsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNkLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNsQixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLGNBQWM7b0JBQ2xCLEtBQUssRUFBRSxNQUFNO29CQUNiLElBQUksRUFBRSxJQUFJO2lCQUNWO2dCQUNEO29CQUNDLEVBQUUsRUFBRSxZQUFZO29CQUNoQixLQUFLLEVBQUUsTUFBTTtvQkFDYixJQUFJLEVBQUUsSUFBSTtpQkFDVjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsUUFBUTtvQkFDWixLQUFLLEVBQUUsUUFBUTtpQkFDZjthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSTtRQUMxQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDdEIsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN4RTtRQUVELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUN2RDtRQUVELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNyQyxLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRTtTQUNuQyxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0Q7QUFwQ0QsK0JBb0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW1iZWRDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwiZW1iZWRcIiwge1xuXHRcdFx0YWxpYXNlczogW1wiZW1iZWRcIl0sXG5cdFx0XHRhcmdzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJlbXB0eUNvbnRlbnRcIixcblx0XHRcdFx0XHRtYXRjaDogXCJmbGFnXCIsXG5cdFx0XHRcdFx0ZmxhZzogXCItY1wiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJlbXB0eUVtYmVkXCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwiZmxhZ1wiLFxuXHRcdFx0XHRcdGZsYWc6IFwiLWVcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwicGhyYXNlXCIsXG5cdFx0XHRcdFx0bWF0Y2g6IFwicGhyYXNlXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlLCBhcmdzKSB7XG5cdFx0aWYgKGFyZ3MuZW1wdHlDb250ZW50KSB7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZS51dGlsLnNlbmQobnVsbCwgeyBlbWJlZDogeyBkZXNjcmlwdGlvbjogYXJncy5waHJhc2UgfSB9KTtcblx0XHR9XG5cblx0XHRpZiAoYXJncy5lbXB0eUVtYmVkKSB7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZS51dGlsLnNlbmQoYXJncy5waHJhc2UsIHsgZW1iZWQ6IG51bGwgfSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1lc3NhZ2UudXRpbC5zZW5kKGFyZ3MucGhyYXNlLCB7XG5cdFx0XHRlbWJlZDogeyBkZXNjcmlwdGlvbjogYXJncy5waHJhc2UgfVxuXHRcdH0pO1xuXHR9XG59XG4iXX0=