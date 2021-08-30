"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const index_1 = require("../../src/index");
const sleep = util_1.promisify(setTimeout);
class LockCommand extends index_1.Command {
    constructor() {
        super("lock", {
            aliases: ["lock"],
            lock: "guild"
        });
    }
    exec(message) {
        return [0, 1, 2, 3, 4].reduce((promise, num) => promise.then(() => sleep(1000)).then(() => message.util.send(`${num}`)), Promise.resolve());
    }
}
exports.default = LockCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvbG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOztBQUcvQiwrQkFBaUM7QUFDakMsMkNBQTBDO0FBRTFDLE1BQU0sS0FBSyxHQUFHLGdCQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFcEMsTUFBcUIsV0FBWSxTQUFRLGVBQU87SUFDL0M7UUFDQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2IsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2pCLElBQUksRUFBRSxPQUFPO1NBQ2IsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVRLElBQUksQ0FBQyxPQUFnQjtRQUM3QixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FDNUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFDekYsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUNqQixDQUFDO0lBQ0gsQ0FBQztDQUNEO0FBZEQsOEJBY0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcInV0aWxcIjtcbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5cbmNvbnN0IHNsZWVwID0gcHJvbWlzaWZ5KHNldFRpbWVvdXQpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NrQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcImxvY2tcIiwge1xuXHRcdFx0YWxpYXNlczogW1wibG9ja1wiXSxcblx0XHRcdGxvY2s6IFwiZ3VpbGRcIlxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdFx0cmV0dXJuIFswLCAxLCAyLCAzLCA0XS5yZWR1Y2UoXG5cdFx0XHQocHJvbWlzZSwgbnVtKSA9PiBwcm9taXNlLnRoZW4oKCkgPT4gc2xlZXAoMTAwMCkpLnRoZW4oKCkgPT4gbWVzc2FnZS51dGlsLnNlbmQoYCR7bnVtfWApKSxcblx0XHRcdFByb21pc2UucmVzb2x2ZSgpXG5cdFx0KTtcblx0fVxufVxuIl19