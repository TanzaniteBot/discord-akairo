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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvcS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOztBQUUvQiwyQ0FBMEM7QUFFMUMsTUFBcUIsUUFBUyxTQUFRLGVBQU87SUFDNUM7UUFDQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFPO1FBQ3BCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0Q7QUFYRCwyQkFXQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUUNvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJxXCIsIHtcblx0XHRcdGFsaWFzZXM6IFtcInFcIl1cblx0XHR9KTtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobWVzc2FnZSkge1xuXHRcdGNvbnN0IGNvbW1hbmQgPSB0aGlzLmhhbmRsZXIubW9kdWxlcy5nZXQoXCJwXCIpO1xuXHRcdHJldHVybiB0aGlzLmhhbmRsZXIuaGFuZGxlRGlyZWN0Q29tbWFuZChtZXNzYWdlLCBcIlwiLCBjb21tYW5kKTtcblx0fVxufVxuIl19