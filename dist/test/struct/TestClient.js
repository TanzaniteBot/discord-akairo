"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../src/index");
class TestClient extends index_1.AkairoClient {
    commandHandler;
    inhibitorHandler;
    listenerHandler;
    settings;
    constructor() {
        super({
            ownerID: "123992700587343872",
            intents: []
        });
        this.commandHandler = new index_1.CommandHandler(this, {
            directory: "./test/commands/",
            ignoreCooldown: ["132266422679240704"],
            aliasReplacement: /-/g,
            prefix: "!!",
            allowMention: true,
            commandUtil: true,
            commandUtilLifetime: 10000,
            commandUtilSweepInterval: 10000,
            storeMessages: true,
            handleEdits: true,
            argumentDefaults: {
                prompt: {
                    start: "What is thing?",
                    modifyStart: (msg, text) => `${msg.author}, ${text}\nType \`cancel\` to cancel this command.`,
                    retry: "What is thing, again?",
                    modifyRetry: (msg, text) => `${msg.author}, ${text}\nType \`cancel\` to cancel this command.`,
                    timeout: "Out of time.",
                    ended: "No more tries.",
                    cancel: "Cancelled.",
                    retries: 5
                },
                modifyOtherwise: (msg, text) => `${msg.author}, ${text}`
            }
        });
        this.inhibitorHandler = new index_1.InhibitorHandler(this, {
            directory: "./test/inhibitors/"
        });
        this.listenerHandler = new index_1.ListenerHandler(this, {
            directory: "./test/listeners/"
        });
        // const db = sqlite
        // 	.open("./test/db.sqlite")
        // 	.then(d =>
        // 		d
        // 			.run(
        // 				"CREATE TABLE IF NOT EXISTS guilds (id TEXT NOT NULL UNIQUE, settings TEXT)"
        // 			)
        // 			.then(() => d)
        // 	);
        // this.settings = new SQLiteProvider(db, "guilds", {
        // 	dataColumn: "settings"
        // });
        this.setup();
    }
    setup() {
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        });
        this.commandHandler.loadAll();
        this.inhibitorHandler.loadAll();
        this.listenerHandler.loadAll();
        const resolver = this.commandHandler.resolver;
        resolver.addType("1-10", (_, phrase) => {
            const num = resolver.type("integer")(_, phrase);
            if (num == null)
                return null;
            if (num < 1 || num > 10)
                return null;
            return num;
        });
    }
    async start(token) {
        await this.settings.init();
        await this.login(token);
        console.log("Ready!"); // eslint-disable-line no-console
    }
}
exports.default = TestClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdENsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3Qvc3RydWN0L1Rlc3RDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FLeUI7QUFFekIsTUFBcUIsVUFBVyxTQUFRLG9CQUFZO0lBQ25ELGNBQWMsQ0FBaUI7SUFDL0IsZ0JBQWdCLENBQW1CO0lBQ25DLGVBQWUsQ0FBa0I7SUFDakMsUUFBUSxDQUFNO0lBQ2Q7UUFDQyxLQUFLLENBQUM7WUFDTCxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSxFQUFFO1NBQ1gsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLHNCQUFjLENBQUMsSUFBSSxFQUFFO1lBQzlDLFNBQVMsRUFBRSxrQkFBa0I7WUFDN0IsY0FBYyxFQUFFLENBQUMsb0JBQW9CLENBQUM7WUFDdEMsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixNQUFNLEVBQUUsSUFBSTtZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLG1CQUFtQixFQUFFLEtBQUs7WUFDMUIsd0JBQXdCLEVBQUUsS0FBSztZQUMvQixhQUFhLEVBQUUsSUFBSTtZQUNuQixXQUFXLEVBQUUsSUFBSTtZQUNqQixnQkFBZ0IsRUFBRTtnQkFDakIsTUFBTSxFQUFFO29CQUNQLEtBQUssRUFBRSxnQkFBZ0I7b0JBQ3ZCLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUMxQixHQUFHLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSwyQ0FBMkM7b0JBQ2xFLEtBQUssRUFBRSx1QkFBdUI7b0JBQzlCLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUMxQixHQUFHLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSwyQ0FBMkM7b0JBQ2xFLE9BQU8sRUFBRSxjQUFjO29CQUN2QixLQUFLLEVBQUUsZ0JBQWdCO29CQUN2QixNQUFNLEVBQUUsWUFBWTtvQkFDcEIsT0FBTyxFQUFFLENBQUM7aUJBQ1Y7Z0JBQ0QsZUFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxLQUFLLElBQUksRUFBRTthQUN4RDtTQUNELENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHdCQUFnQixDQUFDLElBQUksRUFBRTtZQUNsRCxTQUFTLEVBQUUsb0JBQW9CO1NBQy9CLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSx1QkFBZSxDQUFDLElBQUksRUFBRTtZQUNoRCxTQUFTLEVBQUUsbUJBQW1CO1NBQzlCLENBQUMsQ0FBQztRQUVILG9CQUFvQjtRQUNwQiw2QkFBNkI7UUFDN0IsY0FBYztRQUNkLE1BQU07UUFDTixXQUFXO1FBQ1gsbUZBQW1GO1FBQ25GLE9BQU87UUFDUCxvQkFBb0I7UUFDcEIsTUFBTTtRQUNOLHFEQUFxRDtRQUNyRCwwQkFBMEI7UUFDMUIsTUFBTTtRQUVOLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRCxLQUFLO1FBQ0osSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUU3RCxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQztZQUNoQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtZQUN2QyxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7U0FDckMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUUvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztRQUM5QyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN0QyxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNoRCxJQUFJLEdBQUcsSUFBSSxJQUFJO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQzdCLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUNyQyxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSztRQUNoQixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDM0IsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxpQ0FBaUM7SUFDekQsQ0FBQztDQUNEO0FBM0ZELDZCQTJGQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEFrYWlyb0NsaWVudCxcblx0Q29tbWFuZEhhbmRsZXIsXG5cdEluaGliaXRvckhhbmRsZXIsXG5cdExpc3RlbmVySGFuZGxlclxufSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RDbGllbnQgZXh0ZW5kcyBBa2Fpcm9DbGllbnQge1xuXHRjb21tYW5kSGFuZGxlcjogQ29tbWFuZEhhbmRsZXI7XG5cdGluaGliaXRvckhhbmRsZXI6IEluaGliaXRvckhhbmRsZXI7XG5cdGxpc3RlbmVySGFuZGxlcjogTGlzdGVuZXJIYW5kbGVyO1xuXHRzZXR0aW5nczogYW55O1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcih7XG5cdFx0XHRvd25lcklEOiBcIjEyMzk5MjcwMDU4NzM0Mzg3MlwiLFxuXHRcdFx0aW50ZW50czogW11cblx0XHR9KTtcblxuXHRcdHRoaXMuY29tbWFuZEhhbmRsZXIgPSBuZXcgQ29tbWFuZEhhbmRsZXIodGhpcywge1xuXHRcdFx0ZGlyZWN0b3J5OiBcIi4vdGVzdC9jb21tYW5kcy9cIixcblx0XHRcdGlnbm9yZUNvb2xkb3duOiBbXCIxMzIyNjY0MjI2NzkyNDA3MDRcIl0sXG5cdFx0XHRhbGlhc1JlcGxhY2VtZW50OiAvLS9nLFxuXHRcdFx0cHJlZml4OiBcIiEhXCIsXG5cdFx0XHRhbGxvd01lbnRpb246IHRydWUsXG5cdFx0XHRjb21tYW5kVXRpbDogdHJ1ZSxcblx0XHRcdGNvbW1hbmRVdGlsTGlmZXRpbWU6IDEwMDAwLFxuXHRcdFx0Y29tbWFuZFV0aWxTd2VlcEludGVydmFsOiAxMDAwMCxcblx0XHRcdHN0b3JlTWVzc2FnZXM6IHRydWUsXG5cdFx0XHRoYW5kbGVFZGl0czogdHJ1ZSxcblx0XHRcdGFyZ3VtZW50RGVmYXVsdHM6IHtcblx0XHRcdFx0cHJvbXB0OiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiV2hhdCBpcyB0aGluZz9cIixcblx0XHRcdFx0XHRtb2RpZnlTdGFydDogKG1zZywgdGV4dCkgPT5cblx0XHRcdFx0XHRcdGAke21zZy5hdXRob3J9LCAke3RleHR9XFxuVHlwZSBcXGBjYW5jZWxcXGAgdG8gY2FuY2VsIHRoaXMgY29tbWFuZC5gLFxuXHRcdFx0XHRcdHJldHJ5OiBcIldoYXQgaXMgdGhpbmcsIGFnYWluP1wiLFxuXHRcdFx0XHRcdG1vZGlmeVJldHJ5OiAobXNnLCB0ZXh0KSA9PlxuXHRcdFx0XHRcdFx0YCR7bXNnLmF1dGhvcn0sICR7dGV4dH1cXG5UeXBlIFxcYGNhbmNlbFxcYCB0byBjYW5jZWwgdGhpcyBjb21tYW5kLmAsXG5cdFx0XHRcdFx0dGltZW91dDogXCJPdXQgb2YgdGltZS5cIixcblx0XHRcdFx0XHRlbmRlZDogXCJObyBtb3JlIHRyaWVzLlwiLFxuXHRcdFx0XHRcdGNhbmNlbDogXCJDYW5jZWxsZWQuXCIsXG5cdFx0XHRcdFx0cmV0cmllczogNVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtb2RpZnlPdGhlcndpc2U6IChtc2csIHRleHQpID0+IGAke21zZy5hdXRob3J9LCAke3RleHR9YFxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5pbmhpYml0b3JIYW5kbGVyID0gbmV3IEluaGliaXRvckhhbmRsZXIodGhpcywge1xuXHRcdFx0ZGlyZWN0b3J5OiBcIi4vdGVzdC9pbmhpYml0b3JzL1wiXG5cdFx0fSk7XG5cblx0XHR0aGlzLmxpc3RlbmVySGFuZGxlciA9IG5ldyBMaXN0ZW5lckhhbmRsZXIodGhpcywge1xuXHRcdFx0ZGlyZWN0b3J5OiBcIi4vdGVzdC9saXN0ZW5lcnMvXCJcblx0XHR9KTtcblxuXHRcdC8vIGNvbnN0IGRiID0gc3FsaXRlXG5cdFx0Ly8gXHQub3BlbihcIi4vdGVzdC9kYi5zcWxpdGVcIilcblx0XHQvLyBcdC50aGVuKGQgPT5cblx0XHQvLyBcdFx0ZFxuXHRcdC8vIFx0XHRcdC5ydW4oXG5cdFx0Ly8gXHRcdFx0XHRcIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIGd1aWxkcyAoaWQgVEVYVCBOT1QgTlVMTCBVTklRVUUsIHNldHRpbmdzIFRFWFQpXCJcblx0XHQvLyBcdFx0XHQpXG5cdFx0Ly8gXHRcdFx0LnRoZW4oKCkgPT4gZClcblx0XHQvLyBcdCk7XG5cdFx0Ly8gdGhpcy5zZXR0aW5ncyA9IG5ldyBTUUxpdGVQcm92aWRlcihkYiwgXCJndWlsZHNcIiwge1xuXHRcdC8vIFx0ZGF0YUNvbHVtbjogXCJzZXR0aW5nc1wiXG5cdFx0Ly8gfSk7XG5cblx0XHR0aGlzLnNldHVwKCk7XG5cdH1cblxuXHRzZXR1cCgpIHtcblx0XHR0aGlzLmNvbW1hbmRIYW5kbGVyLnVzZUluaGliaXRvckhhbmRsZXIodGhpcy5pbmhpYml0b3JIYW5kbGVyKTtcblx0XHR0aGlzLmNvbW1hbmRIYW5kbGVyLnVzZUxpc3RlbmVySGFuZGxlcih0aGlzLmxpc3RlbmVySGFuZGxlcik7XG5cblx0XHR0aGlzLmxpc3RlbmVySGFuZGxlci5zZXRFbWl0dGVycyh7XG5cdFx0XHRjb21tYW5kSGFuZGxlcjogdGhpcy5jb21tYW5kSGFuZGxlcixcblx0XHRcdGluaGliaXRvckhhbmRsZXI6IHRoaXMuaW5oaWJpdG9ySGFuZGxlcixcblx0XHRcdGxpc3RlbmVySGFuZGxlcjogdGhpcy5saXN0ZW5lckhhbmRsZXJcblx0XHR9KTtcblxuXHRcdHRoaXMuY29tbWFuZEhhbmRsZXIubG9hZEFsbCgpO1xuXHRcdHRoaXMuaW5oaWJpdG9ySGFuZGxlci5sb2FkQWxsKCk7XG5cdFx0dGhpcy5saXN0ZW5lckhhbmRsZXIubG9hZEFsbCgpO1xuXG5cdFx0Y29uc3QgcmVzb2x2ZXIgPSB0aGlzLmNvbW1hbmRIYW5kbGVyLnJlc29sdmVyO1xuXHRcdHJlc29sdmVyLmFkZFR5cGUoXCIxLTEwXCIsIChfLCBwaHJhc2UpID0+IHtcblx0XHRcdGNvbnN0IG51bSA9IHJlc29sdmVyLnR5cGUoXCJpbnRlZ2VyXCIpKF8sIHBocmFzZSk7XG5cdFx0XHRpZiAobnVtID09IG51bGwpIHJldHVybiBudWxsO1xuXHRcdFx0aWYgKG51bSA8IDEgfHwgbnVtID4gMTApIHJldHVybiBudWxsO1xuXHRcdFx0cmV0dXJuIG51bTtcblx0XHR9KTtcblx0fVxuXG5cdGFzeW5jIHN0YXJ0KHRva2VuKSB7XG5cdFx0YXdhaXQgdGhpcy5zZXR0aW5ncy5pbml0KCk7XG5cdFx0YXdhaXQgdGhpcy5sb2dpbih0b2tlbik7XG5cdFx0Y29uc29sZS5sb2coXCJSZWFkeSFcIik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuXHR9XG59XG4iXX0=