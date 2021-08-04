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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvbGlzdGVuZXJzL21lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtCQUErQjs7QUFFL0IsMkNBQTJDO0FBRTNDLE1BQXFCLGVBQWdCLFNBQVEsZ0JBQVE7SUFDcEQ7UUFDQyxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ2hCLE9BQU8sRUFBRSxRQUFRO1lBQ2pCLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFFBQVEsRUFBRSxRQUFRO1NBQ2xCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFUSxJQUFJLENBQUMsR0FBRztRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQixDQUFDO0NBQ0Q7QUFaRCxrQ0FZQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cblxuaW1wb3J0IHsgTGlzdGVuZXIgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lc3NhZ2VMaXN0ZW5lciBleHRlbmRzIExpc3RlbmVyIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoXCJtZXNzYWdlXCIsIHtcblx0XHRcdGVtaXR0ZXI6IFwiY2xpZW50XCIsXG5cdFx0XHRldmVudDogXCJtZXNzYWdlXCIsXG5cdFx0XHRjYXRlZ29yeTogXCJjbGllbnRcIlxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtc2cpIHtcblx0XHRjb25zb2xlLmxvZyhtc2cuY29udGVudCk7XG5cdH1cbn1cbiJdfQ==