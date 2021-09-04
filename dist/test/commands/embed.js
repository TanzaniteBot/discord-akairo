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
            return message.util.send({ embeds: [{ description: args.phrase }] });
        }
        if (args.emptyEmbed) {
            return message.util.send({ content: args.phrase, embeds: [] });
        }
        return message.util.send({
            content: args.phrase,
            embeds: [{ description: args.phrase }]
        });
    }
}
exports.default = EmbedCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1iZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL2VtYmVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMkNBQTBDO0FBRTFDLE1BQXFCLFlBQWEsU0FBUSxlQUFPO0lBQ2hEO1FBQ0MsS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNkLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNsQixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLGNBQWM7b0JBQ2xCLEtBQUssRUFBRSxNQUFNO29CQUNiLElBQUksRUFBRSxJQUFJO2lCQUNWO2dCQUNEO29CQUNDLEVBQUUsRUFBRSxZQUFZO29CQUNoQixLQUFLLEVBQUUsTUFBTTtvQkFDYixJQUFJLEVBQUUsSUFBSTtpQkFDVjtnQkFDRDtvQkFDQyxFQUFFLEVBQUUsUUFBUTtvQkFDWixLQUFLLEVBQUUsUUFBUTtpQkFDZjthQUNEO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFnQixFQUFFLElBQXVFO1FBQ3RHLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUN0QixPQUFPLE9BQU8sQ0FBQyxJQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RFO1FBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLE9BQU8sT0FBTyxDQUFDLElBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNoRTtRQUVELE9BQU8sT0FBTyxDQUFDLElBQUssQ0FBQyxJQUFJLENBQUM7WUFDekIsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ3BCLE1BQU0sRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUN0QyxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0Q7QUFyQ0QsK0JBcUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbWJlZENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJlbWJlZFwiLCB7XG5cdFx0XHRhbGlhc2VzOiBbXCJlbWJlZFwiXSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImVtcHR5Q29udGVudFwiLFxuXHRcdFx0XHRcdG1hdGNoOiBcImZsYWdcIixcblx0XHRcdFx0XHRmbGFnOiBcIi1jXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImVtcHR5RW1iZWRcIixcblx0XHRcdFx0XHRtYXRjaDogXCJmbGFnXCIsXG5cdFx0XHRcdFx0ZmxhZzogXCItZVwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJwaHJhc2VcIixcblx0XHRcdFx0XHRtYXRjaDogXCJwaHJhc2VcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UsIGFyZ3M6IHsgZW1wdHlDb250ZW50PzogYm9vbGVhbjsgZW1wdHlFbWJlZD86IGJvb2xlYW47IHBocmFzZT86IHN0cmluZyB9KSB7XG5cdFx0aWYgKGFyZ3MuZW1wdHlDb250ZW50KSB7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZS51dGlsIS5zZW5kKHsgZW1iZWRzOiBbeyBkZXNjcmlwdGlvbjogYXJncy5waHJhc2UgfV0gfSk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZ3MuZW1wdHlFbWJlZCkge1xuXHRcdFx0cmV0dXJuIG1lc3NhZ2UudXRpbCEuc2VuZCh7IGNvbnRlbnQ6IGFyZ3MucGhyYXNlLCBlbWJlZHM6IFtdIH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBtZXNzYWdlLnV0aWwhLnNlbmQoe1xuXHRcdFx0Y29udGVudDogYXJncy5waHJhc2UsXG5cdFx0XHRlbWJlZHM6IFt7IGRlc2NyaXB0aW9uOiBhcmdzLnBocmFzZSB9XVxuXHRcdH0pO1xuXHR9XG59XG4iXX0=