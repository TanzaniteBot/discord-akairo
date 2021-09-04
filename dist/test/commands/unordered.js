"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
class UnorderedCommand extends index_1.Command {
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
        message.channel.send(discord_js_1.Formatters.codeBlock(`js${util_1.default.inspect(args, { depth: 1 })}`));
    }
}
exports.default = UnorderedCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5vcmRlcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9jb21tYW5kcy91bm9yZGVyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtCQUErQjs7Ozs7QUFFL0IsMkNBQWlEO0FBQ2pELGdEQUF3QjtBQUN4QiwyQ0FBMEM7QUFFMUMsTUFBcUIsZ0JBQWlCLFNBQVEsZUFBTztJQUNwRDtRQUNDLEtBQUssQ0FBQyxXQUFXLEVBQUU7WUFDbEIsT0FBTyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQztZQUM1QixJQUFJLEVBQUU7Z0JBQ0w7b0JBQ0MsRUFBRSxFQUFFLFVBQVU7b0JBQ2QsU0FBUyxFQUFFLElBQUk7b0JBQ2YsSUFBSSxFQUFFLFNBQVM7aUJBQ2Y7Z0JBQ0Q7b0JBQ0MsRUFBRSxFQUFFLFVBQVU7b0JBQ2QsU0FBUyxFQUFFLElBQUk7b0JBQ2YsSUFBSSxFQUFFLFNBQVM7aUJBQ2Y7YUFDRDtTQUNELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFUSxJQUFJLENBQUMsT0FBZ0IsRUFBRSxJQUE0QztRQUMzRSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLGNBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckYsQ0FBQztDQUNEO0FBdEJELG1DQXNCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgRm9ybWF0dGVycywgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgdXRpbCBmcm9tIFwidXRpbFwiO1xuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVW5vcmRlcmVkQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcInVub3JkZXJlZFwiLCB7XG5cdFx0XHRhbGlhc2VzOiBbXCJ1bm9yZGVyZWRcIiwgXCJ1blwiXSxcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcImludGVnZXIxXCIsXG5cdFx0XHRcdFx0dW5vcmRlcmVkOiB0cnVlLFxuXHRcdFx0XHRcdHR5cGU6IFwiaW50ZWdlclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZDogXCJpbnRlZ2VyMlwiLFxuXHRcdFx0XHRcdHVub3JkZXJlZDogdHJ1ZSxcblx0XHRcdFx0XHR0eXBlOiBcImludGVnZXJcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UsIGFyZ3M6IHsgaW50ZWdlcjE6IG51bWJlcjsgaW50ZWdlcjI6IG51bWJlciB9KSB7XG5cdFx0bWVzc2FnZS5jaGFubmVsLnNlbmQoRm9ybWF0dGVycy5jb2RlQmxvY2soYGpzJHt1dGlsLmluc3BlY3QoYXJncywgeyBkZXB0aDogMSB9KX1gKSk7XG5cdH1cbn1cbiJdfQ==