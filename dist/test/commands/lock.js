"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const index_1 = require("../../src/index");
const sleep = (0, util_1.promisify)(setTimeout);
class LockCommand extends index_1.Command {
    constructor() {
        super("lock", {
            aliases: ["lock"],
            lock: "guild"
        });
    }
    exec(message) {
        return [0, 1, 2, 3, 4].reduce((promise, num) => promise
            .then(() => sleep(1000))
            .then(() => {
            message.util.send(`${num}`);
        }), Promise.resolve());
    }
}
exports.default = LockCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvY29tbWFuZHMvbG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0JBQStCOztBQUcvQiwrQkFBaUM7QUFDakMsMkNBQTBDO0FBRTFDLE1BQU0sS0FBSyxHQUFHLElBQUEsZ0JBQVMsRUFBQyxVQUFVLENBQUMsQ0FBQztBQUVwQyxNQUFxQixXQUFZLFNBQVEsZUFBTztJQUMvQztRQUNDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDYixPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDakIsSUFBSSxFQUFFLE9BQU87U0FDYixDQUFDLENBQUM7SUFDSixDQUFDO0lBRVEsSUFBSSxDQUFDLE9BQWdCO1FBQzdCLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUM1QixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUNoQixPQUFPO2FBQ0wsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QixJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1YsT0FBTyxDQUFDLElBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxFQUNKLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FDakIsQ0FBQztJQUNILENBQUM7Q0FDRDtBQW5CRCw4QkFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSBcInV0aWxcIjtcbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5cbmNvbnN0IHNsZWVwID0gcHJvbWlzaWZ5KHNldFRpbWVvdXQpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2NrQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcihcImxvY2tcIiwge1xuXHRcdFx0YWxpYXNlczogW1wibG9ja1wiXSxcblx0XHRcdGxvY2s6IFwiZ3VpbGRcIlxuXHRcdH0pO1xuXHR9XG5cblx0b3ZlcnJpZGUgZXhlYyhtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdFx0cmV0dXJuIFswLCAxLCAyLCAzLCA0XS5yZWR1Y2UoXG5cdFx0XHQocHJvbWlzZSwgbnVtKSA9PlxuXHRcdFx0XHRwcm9taXNlXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT4gc2xlZXAoMTAwMCkpXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsIS5zZW5kKGAke251bX1gKTtcblx0XHRcdFx0XHR9KSxcblx0XHRcdFByb21pc2UucmVzb2x2ZSgpXG5cdFx0KTtcblx0fVxufVxuIl19