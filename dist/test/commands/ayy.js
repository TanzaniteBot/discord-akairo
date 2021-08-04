"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
class AyyCommand extends index_1.Command {
    constructor() {
        super("ayy", {
            regex: /^ayy+$/i
        });
    }
    exec(message) {
        return message.reply("lmao");
    }
}
exports.default = AyyCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXl5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9jb21tYW5kcy9heXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FBMEM7QUFFMUMsTUFBcUIsVUFBVyxTQUFRLGVBQU87SUFDOUM7UUFDQyxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQ1osS0FBSyxFQUFFLFNBQVM7U0FDaEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFnQjtRQUM3QixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUIsQ0FBQztDQUNEO0FBVkQsNkJBVUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF5eUNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJheXlcIiwge1xuXHRcdFx0cmVnZXg6IC9eYXl5KyQvaVxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UucmVwbHkoXCJsbWFvXCIpO1xuXHR9XG59XG4iXX0=