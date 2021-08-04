"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
class ConditionalCommand extends index_1.Command {
    constructor() {
        // @ts-expect-error
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9jb21tYW5kcy9jb25kaXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FBMEM7QUFFMUMsTUFBcUIsa0JBQW1CLFNBQVEsZUFBTztJQUN0RDtRQUNDLG1CQUFtQjtRQUNuQixLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVRLFNBQVMsQ0FBQyxPQUFnQjtRQUNsQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLEtBQUssbUJBQW1CLENBQUM7SUFDaEQsQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFPO1FBQ3BCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNqRCxDQUFDO0NBQ0Q7QUFiRCxxQ0FhQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZGl0aW9uYWxDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRzdXBlcihcImNvbmRpdGlvblwiKTtcblx0fVxuXG5cdG92ZXJyaWRlIGNvbmRpdGlvbihtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UuY29udGVudCA9PT0gXCJtYWtlIG1lIGNvbmRpdGlvblwiO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlKSB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UudXRpbC5yZXBseShcIm1hZGUgeW91IGNvbmRpdGlvblwiKTtcblx0fVxufVxuIl19