"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
class ConditionalCommand extends index_1.Command {
    constructor() {
        super("condition");
    }
    condition(message) {
        return message.content === "make me condition";
    }
    exec(message) {
        return message.util.reply("made you condition");
    }
}
exports.default = ConditionalCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9jb21tYW5kcy9jb25kaXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FBMEM7QUFFMUMsTUFBcUIsa0JBQW1CLFNBQVEsZUFBTztJQUN0RDtRQUNDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBRVEsU0FBUyxDQUFDLE9BQWdCO1FBQ2xDLE9BQU8sT0FBTyxDQUFDLE9BQU8sS0FBSyxtQkFBbUIsQ0FBQztJQUNoRCxDQUFDO0lBRVEsSUFBSSxDQUFDLE9BQU87UUFDcEIsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDRDtBQVpELHFDQVlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uLy4uL3NyYy9pbmRleFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25kaXRpb25hbENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJjb25kaXRpb25cIik7XG5cdH1cblxuXHRvdmVycmlkZSBjb25kaXRpb24obWVzc2FnZTogTWVzc2FnZSkge1xuXHRcdHJldHVybiBtZXNzYWdlLmNvbnRlbnQgPT09IFwibWFrZSBtZSBjb25kaXRpb25cIjtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobWVzc2FnZSkge1xuXHRcdHJldHVybiBtZXNzYWdlLnV0aWwucmVwbHkoXCJtYWRlIHlvdSBjb25kaXRpb25cIik7XG5cdH1cbn1cbiJdfQ==