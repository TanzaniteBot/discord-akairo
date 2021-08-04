"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
class MessageListener extends index_1.Listener {
    constructor() {
        super("message", {
            emitter: "client",
            event: "message",
            category: "client"
        });
    }
    exec(msg) {
        console.log(msg.content);
    }
}
exports.default = MessageListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvbGlzdGVuZXJzL21lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtCQUErQjs7QUFFL0IsMkNBQTJDO0FBRTNDLE1BQXFCLGVBQWdCLFNBQVEsZ0JBQVE7SUFDcEQ7UUFDQyxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ2hCLE9BQU8sRUFBRSxRQUFRO1lBQ2pCLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFFBQVEsRUFBRSxRQUFRO1NBQ2xCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFJLENBQUMsR0FBRztRQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFCLENBQUM7Q0FDRDtBQVpELGtDQVlDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5pbXBvcnQgeyBMaXN0ZW5lciB9IGZyb20gXCIuLi8uLi9zcmMvaW5kZXhcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzc2FnZUxpc3RlbmVyIGV4dGVuZHMgTGlzdGVuZXIge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcIm1lc3NhZ2VcIiwge1xuXHRcdFx0ZW1pdHRlcjogXCJjbGllbnRcIixcblx0XHRcdGV2ZW50OiBcIm1lc3NhZ2VcIixcblx0XHRcdGNhdGVnb3J5OiBcImNsaWVudFwiXG5cdFx0fSk7XG5cdH1cblxuXHRleGVjKG1zZykge1xuXHRcdGNvbnNvbGUubG9nKG1zZy5jb250ZW50KTtcblx0fVxufVxuIl19