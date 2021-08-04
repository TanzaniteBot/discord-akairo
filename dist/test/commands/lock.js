"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
const util_1 = require("util");
const sleep = util_1.promisify(setTimeout);
class LockCommand extends index_1.Command {
    constructor() {
        super("lock", {
            aliases: ["lock"],
            lock: "guild"
        });
    }
    exec(message) {
        return [0, 1, 2, 3, 4].reduce((promise, num) => 
        // @ts-expect-error
        promise.then(() => sleep(1000)).then(() => message.util.send(num)), Promise.resolve());
    }
}
exports.default = LockCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvbG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOztBQUUvQiwyQ0FBMEM7QUFDMUMsK0JBQWlDO0FBR2pDLE1BQU0sS0FBSyxHQUFHLGdCQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFcEMsTUFBcUIsV0FBWSxTQUFRLGVBQU87SUFDL0M7UUFDQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2pCLElBQUksRUFBRSxPQUFPO1NBQ2IsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFnQjtRQUM3QixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FDNUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDaEIsbUJBQW1CO1FBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQ25FLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FDakIsQ0FBQztJQUNILENBQUM7Q0FDRDtBQWhCRCw4QkFnQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5pbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tIFwidXRpbFwiO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5cbmNvbnN0IHNsZWVwID0gcHJvbWlzaWZ5KHNldFRpbWVvdXQpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NrQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcImxvY2tcIiwge1xuXHRcdFx0YWxpYXNlczogW1wibG9ja1wiXSxcblx0XHRcdGxvY2s6IFwiZ3VpbGRcIlxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdFx0cmV0dXJuIFswLCAxLCAyLCAzLCA0XS5yZWR1Y2UoXG5cdFx0XHQocHJvbWlzZSwgbnVtKSA9PlxuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdHByb21pc2UudGhlbigoKSA9PiBzbGVlcCgxMDAwKSkudGhlbigoKSA9PiBtZXNzYWdlLnV0aWwuc2VuZChudW0pKSxcblx0XHRcdFByb21pc2UucmVzb2x2ZSgpXG5cdFx0KTtcblx0fVxufVxuIl19