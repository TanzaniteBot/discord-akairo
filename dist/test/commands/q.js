"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
class QCommand extends index_1.Command {
    constructor() {
        super("q", {
            aliases: ["q"]
        });
    }
    exec(message) {
        const command = this.handler.modules.get("p");
        return this.handler.handleDirectCommand(message, "", command);
    }
}
exports.default = QCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvcS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOztBQUcvQiwyQ0FBMEM7QUFFMUMsTUFBcUIsUUFBUyxTQUFRLGVBQU87SUFDNUM7UUFDQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFnQjtRQUM3QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUM7UUFDL0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDL0QsQ0FBQztDQUNEO0FBWEQsMkJBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUUNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJxXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcInFcIl1cblx0XHR9KTtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobWVzc2FnZTogTWVzc2FnZSkge1xuXHRcdGNvbnN0IGNvbW1hbmQgPSB0aGlzLmhhbmRsZXIubW9kdWxlcy5nZXQoXCJwXCIpITtcblx0XHRyZXR1cm4gdGhpcy5oYW5kbGVyLmhhbmRsZURpcmVjdENvbW1hbmQobWVzc2FnZSwgXCJcIiwgY29tbWFuZCk7XG5cdH1cbn1cbiJdfQ==