"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../dist/../../src/index");
class ConditionalPromiseCommand extends index_1.Command {
    constructor() {
        // @ts-expect-error
        super("condition.promise");
    }
    condition(message) {
        return Promise.resolve(message.content === "make me promise condition");
    }
    exec(message) {
        return message.util.reply("made you promise condition");
    }
}
exports.default = ConditionalPromiseCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uLnByb21pc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2NvbW1hbmRzL2NvbmRpdGlvbi5wcm9taXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbURBQWtEO0FBRWxELE1BQXFCLHlCQUEwQixTQUFRLGVBQU87SUFDN0Q7UUFDQyxtQkFBbUI7UUFDbkIsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVRLFNBQVMsQ0FBQyxPQUFnQjtRQUNsQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sS0FBSywyQkFBMkIsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFUSxJQUFJLENBQUMsT0FBZ0I7UUFDN0IsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3pELENBQUM7Q0FDRDtBQWJELDRDQWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcIi4uL2Rpc3QvLi4vLi4vc3JjL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbmRpdGlvbmFsUHJvbWlzZUNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdHN1cGVyKFwiY29uZGl0aW9uLnByb21pc2VcIik7XG5cdH1cblxuXHRvdmVycmlkZSBjb25kaXRpb24obWVzc2FnZTogTWVzc2FnZSkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobWVzc2FnZS5jb250ZW50ID09PSBcIm1ha2UgbWUgcHJvbWlzZSBjb25kaXRpb25cIik7XG5cdH1cblxuXHRvdmVycmlkZSBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcblx0XHRyZXR1cm4gbWVzc2FnZS51dGlsLnJlcGx5KFwibWFkZSB5b3UgcHJvbWlzZSBjb25kaXRpb25cIik7XG5cdH1cbn1cbiJdfQ==