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
class GenerateCommand extends __1.Command {
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
			return __1.Flag.continue("sub");
		}
		return { x };
	}
	exec(message, args) {
		message.channel.send(util_1.default.inspect(args, { depth: 1 }), {
			code: "js"
		});
	}
}
exports.default = GenerateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL2dlbmVyYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7Ozs7O0FBRS9CLDZCQUFzQztBQUN0QyxnREFBd0I7QUFFeEIsTUFBcUIsZUFBZ0IsU0FBUSxXQUFPO0lBQ25EO1FBQ0MsS0FBSyxDQUFDLFVBQVUsRUFBRTtZQUNqQixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDO1NBQzFCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxDQUFDLElBQUk7UUFDSixNQUFNLENBQUMsR0FBRyxNQUFNO1lBQ2YsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUNoQixTQUFTLEVBQUUsY0FBYztTQUN6QixDQUFDO1FBRUYsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2QsT0FBTyxRQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzVCO1FBRUQsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSTtRQUNqQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNEO0FBdkJELGtDQXVCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgQ29tbWFuZCwgRmxhZyB9IGZyb20gXCIuLi8uLlwiO1xuaW1wb3J0IHV0aWwgZnJvbSBcInV0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2VuZXJhdGVDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwiZ2VuZXJhdGVcIiwge1xuXHRcdFx0YWxpYXNlczogW1wiZ2VuZXJhdGVcIiwgXCJnXCJdXG5cdFx0fSk7XG5cdH1cblxuXHQqYXJncygpIHtcblx0XHRjb25zdCB4ID0geWllbGQge1xuXHRcdFx0dHlwZTogW1wiMVwiLCBcIjJcIl0sXG5cdFx0XHRvdGhlcndpc2U6IFwiVHlwZSAxIG9yIDIhXCJcblx0XHR9O1xuXG5cdFx0aWYgKHggPT09IFwiMVwiKSB7XG5cdFx0XHRyZXR1cm4gRmxhZy5jb250aW51ZShcInN1YlwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4geyB4IH07XG5cdH1cblxuXHRleGVjKG1lc3NhZ2UsIGFyZ3MpIHtcblx0XHRtZXNzYWdlLmNoYW5uZWwuc2VuZCh1dGlsLmluc3BlY3QoYXJncywgeyBkZXB0aDogMSB9KSwgeyBjb2RlOiBcImpzXCIgfSk7XG5cdH1cbn1cbiJdfQ==
