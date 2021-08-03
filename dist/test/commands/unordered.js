"use strict";
/* eslint-disable no-console */
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const util_1 = __importDefault(require("util"));
class UnorderedCommand extends __1.Command {
	constructor() {
		super("unordered", {
			aliases: ["unordered", "un"],
			args: [
				{
					id: "integer1",
					unordered: true,
					type: "integer"
				},
				{
					id: "integer2",
					unordered: true,
					type: "integer"
				}
			]
		});
	}
	exec(message, args) {
		message.channel.send(util_1.default.inspect(args, { depth: 1 }), {
			code: "js"
		});
	}
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5vcmRlcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9jb21tYW5kcy91bm9yZGVyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtCQUErQjs7Ozs7QUFFL0IsNkJBQWdDO0FBQ2hDLGdEQUF3QjtBQUV4QixNQUFNLGdCQUFpQixTQUFRLFdBQU87SUFDckM7UUFDQyxLQUFLLENBQUMsV0FBVyxFQUFFO1lBQ2xCLE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUM7WUFDNUIsSUFBSSxFQUFFO2dCQUNMO29CQUNDLEVBQUUsRUFBRSxVQUFVO29CQUNkLFNBQVMsRUFBRSxJQUFJO29CQUNmLElBQUksRUFBRSxTQUFTO2lCQUNmO2dCQUNEO29CQUNDLEVBQUUsRUFBRSxVQUFVO29CQUNkLFNBQVMsRUFBRSxJQUFJO29CQUNmLElBQUksRUFBRSxTQUFTO2lCQUNmO2FBQ0Q7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJO1FBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vLi5cIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmNsYXNzIFVub3JkZXJlZENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJ1bm9yZGVyZWRcIiwge1xuXHRcdFx0YWxpYXNlczogW1widW5vcmRlcmVkXCIsIFwidW5cIl0sXG5cdFx0XHRhcmdzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJpbnRlZ2VyMVwiLFxuXHRcdFx0XHRcdHVub3JkZXJlZDogdHJ1ZSxcblx0XHRcdFx0XHR0eXBlOiBcImludGVnZXJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWQ6IFwiaW50ZWdlcjJcIixcblx0XHRcdFx0XHR1bm9yZGVyZWQ6IHRydWUsXG5cdFx0XHRcdFx0dHlwZTogXCJpbnRlZ2VyXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0ZXhlYyhtZXNzYWdlLCBhcmdzKSB7XG5cdFx0bWVzc2FnZS5jaGFubmVsLnNlbmQodXRpbC5pbnNwZWN0KGFyZ3MsIHsgZGVwdGg6IDEgfSksIHsgY29kZTogXCJqc1wiIH0pO1xuXHR9XG59XG4iXX0=
