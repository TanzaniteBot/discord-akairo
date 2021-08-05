"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = __importDefault(require("util"));
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
        message.channel.send(util_1.default.inspect(args, { depth: 1 }), { code: "js" });
    }
}
exports.default = GenerateCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL2dlbmVyYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0I7Ozs7O0FBRS9CLDJDQUFnRDtBQUNoRCxnREFBd0I7QUFFeEIsTUFBcUIsZUFBZ0IsU0FBUSxlQUFPO0lBQ25EO1FBQ0MsS0FBSyxDQUFDLFVBQVUsRUFBRTtZQUNqQixPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDO1NBQzFCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxDQUFDLElBQUk7UUFDSixNQUFNLENBQUMsR0FBRyxNQUFNO1lBQ2YsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUNoQixTQUFTLEVBQUUsY0FBYztTQUN6QixDQUFDO1FBRUYsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2QsT0FBTyxZQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzVCO1FBRUQsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSTtRQUMxQixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEUsQ0FBQztDQUNEO0FBdkJELGtDQXVCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgQ29tbWFuZCwgRmxhZyB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdlbmVyYXRlQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcImdlbmVyYXRlXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcImdlbmVyYXRlXCIsIFwiZ1wiXVxuXHRcdH0pO1xuXHR9XG5cblx0KmFyZ3MoKSB7XG5cdFx0Y29uc3QgeCA9IHlpZWxkIHtcblx0XHRcdHR5cGU6IFtcIjFcIiwgXCIyXCJdLFxuXHRcdFx0b3RoZXJ3aXNlOiBcIlR5cGUgMSBvciAyIVwiXG5cdFx0fTtcblxuXHRcdGlmICh4ID09PSBcIjFcIikge1xuXHRcdFx0cmV0dXJuIEZsYWcuY29udGludWUoXCJzdWJcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgeCB9O1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlLCBhcmdzKSB7XG5cdFx0bWVzc2FnZS5jaGFubmVsLnNlbmQodXRpbC5pbnNwZWN0KGFyZ3MsIHsgZGVwdGg6IDEgfSksIHsgY29kZTogXCJqc1wiIH0pO1xuXHR9XG59XG4iXX0=