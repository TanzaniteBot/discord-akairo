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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52YWxpZE1lc3NhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2xpc3RlbmVycy9pbnZhbGlkTWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOztBQUUvQiwyQ0FBMkM7QUFFM0MsTUFBcUIsc0JBQXVCLFNBQVEsZ0JBQVE7SUFDM0Q7UUFDQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7WUFDdkIsT0FBTyxFQUFFLGdCQUFnQjtZQUN6QixLQUFLLEVBQUUsZ0JBQWdCO1lBQ3ZCLFFBQVEsRUFBRSxnQkFBZ0I7U0FDMUIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQyxHQUFHO1FBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLENBQUM7Q0FDRDtBQVpELHlDQVlDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBMaXN0ZW5lciB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW52YWxpZE1lc3NhZ2VMaXN0ZW5lciBleHRlbmRzIExpc3RlbmVyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJtZXNzYWdlSW52YWxpZFwiLCB7XG5cdFx0XHRlbWl0dGVyOiBcImNvbW1hbmRIYW5kbGVyXCIsXG5cdFx0XHRldmVudDogXCJtZXNzYWdlSW52YWxpZFwiLFxuXHRcdFx0Y2F0ZWdvcnk6IFwiY29tbWFuZEhhbmRsZXJcIlxuXHRcdH0pO1xuXHR9XG5cblx0ZXhlYyhtc2cpOiB2b2lkIHtcblx0XHRjb25zb2xlLmxvZyhtc2cudXRpbC5wYXJzZWQpO1xuXHR9XG59XG4iXX0=