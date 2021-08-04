"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
class InvalidMessageListener extends index_1.Listener {
    constructor() {
        super("messageInvalid", {
            emitter: "commandHandler",
            event: "messageInvalid",
            category: "commandHandler"
        });
    }
    exec(msg) {
        console.log(msg.util.parsed);
    }
}
exports.default = InvalidMessageListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52YWxpZE1lc3NhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2xpc3RlbmVycy9pbnZhbGlkTWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOztBQUUvQiwyQ0FBMkM7QUFFM0MsTUFBcUIsc0JBQXVCLFNBQVEsZ0JBQVE7SUFDM0Q7UUFDQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7WUFDdkIsT0FBTyxFQUFFLGdCQUFnQjtZQUN6QixLQUFLLEVBQUUsZ0JBQWdCO1lBQ3ZCLFFBQVEsRUFBRSxnQkFBZ0I7U0FDMUIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxHQUFHO1FBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5QixDQUFDO0NBQ0Q7QUFaRCx5Q0FZQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgTGlzdGVuZXIgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludmFsaWRNZXNzYWdlTGlzdGVuZXIgZXh0ZW5kcyBMaXN0ZW5lciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKFwibWVzc2FnZUludmFsaWRcIiwge1xuXHRcdFx0ZW1pdHRlcjogXCJjb21tYW5kSGFuZGxlclwiLFxuXHRcdFx0ZXZlbnQ6IFwibWVzc2FnZUludmFsaWRcIixcblx0XHRcdGNhdGVnb3J5OiBcImNvbW1hbmRIYW5kbGVyXCJcblx0XHR9KTtcblx0fVxuXG5cdG92ZXJyaWRlIGV4ZWMobXNnKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2cobXNnLnV0aWwucGFyc2VkKTtcblx0fVxufVxuIl19