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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9jb21tYW5kcy9jb25kaXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQ0FBMEM7QUFFMUMsTUFBcUIsa0JBQW1CLFNBQVEsZUFBTztJQUN0RDtRQUNDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBRVEsU0FBUyxDQUFDLE9BQWdCO1FBQ2xDLE9BQU8sT0FBTyxDQUFDLE9BQU8sS0FBSyxtQkFBbUIsQ0FBQztJQUNoRCxDQUFDO0lBRVEsSUFBSSxDQUFDLE9BQWdCO1FBQzdCLE9BQU8sT0FBTyxDQUFDLElBQUssQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNsRCxDQUFDO0NBQ0Q7QUFaRCxxQ0FZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uZGl0aW9uYWxDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwiY29uZGl0aW9uXCIpO1xuXHR9XG5cblx0b3ZlcnJpZGUgY29uZGl0aW9uKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcblx0XHRyZXR1cm4gbWVzc2FnZS5jb250ZW50ID09PSBcIm1ha2UgbWUgY29uZGl0aW9uXCI7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcblx0XHRyZXR1cm4gbWVzc2FnZS51dGlsIS5yZXBseShcIm1hZGUgeW91IGNvbmRpdGlvblwiKTtcblx0fVxufVxuIl19