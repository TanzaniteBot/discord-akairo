"use strict";
/* eslint-disable no-console */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = __importDefault(require("util"));
const index_1 = require("../../src/index");
class SubCommand extends index_1.Command {
    constructor() {
        super("sub", {
            args: [
                {
                    id: "thing"
                }
            ]
        });
    }
    exec(message, args) {
        message.channel.send(discord_js_1.Formatters.codeBlock(`js${util_1.default.inspect(args, { depth: 1 })}`));
    }
}
exports.default = SubCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9jb21tYW5kcy9zdWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtCQUErQjs7Ozs7QUFFL0IsMkNBQWlEO0FBQ2pELGdEQUF3QjtBQUN4QiwyQ0FBMEM7QUFFMUMsTUFBcUIsVUFBVyxTQUFRLGVBQU87SUFDOUM7UUFDQyxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ1osSUFBSSxFQUFFO2dCQUNMO29CQUNDLEVBQUUsRUFBRSxPQUFPO2lCQUNYO2FBQ0Q7U0FDRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRVEsSUFBSSxDQUFDLE9BQWdCLEVBQUUsSUFBdUI7UUFDdEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxjQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7Q0FDRDtBQWRELDZCQWNDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBGb3JtYXR0ZXJzLCBNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdWJDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwic3ViXCIsIHtcblx0XHRcdGFyZ3M6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkOiBcInRoaW5nXCJcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlOiBNZXNzYWdlLCBhcmdzOiB7IHRoaW5nOiBzdHJpbmcgfSkge1xuXHRcdG1lc3NhZ2UuY2hhbm5lbC5zZW5kKEZvcm1hdHRlcnMuY29kZUJsb2NrKGBqcyR7dXRpbC5pbnNwZWN0KGFyZ3MsIHsgZGVwdGg6IDEgfSl9YCkpO1xuXHR9XG59XG4iXX0=