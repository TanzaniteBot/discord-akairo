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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdENsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3Qvc3RydWN0L1Rlc3RDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBa0c7QUFFbEcsTUFBcUIsVUFBVyxTQUFRLG9CQUFZO0lBQ25ELGNBQWMsQ0FBaUI7SUFDL0IsZ0JBQWdCLENBQW1CO0lBQ25DLGVBQWUsQ0FBa0I7SUFDakMsUUFBUSxDQUFNO0lBQ2Q7UUFDQyxLQUFLLENBQUM7WUFDTCxPQUFPLEVBQUUsb0JBQW9CO1lBQzdCLE9BQU8sRUFBRSxFQUFFO1NBQ1gsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLHNCQUFjLENBQUMsSUFBSSxFQUFFO1lBQzlDLFNBQVMsRUFBRSxrQkFBa0I7WUFDN0IsY0FBYyxFQUFFLENBQUMsb0JBQW9CLENBQUM7WUFDdEMsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QixNQUFNLEVBQUUsSUFBSTtZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLG1CQUFtQixFQUFFLEtBQUs7WUFDMUIsd0JBQXdCLEVBQUUsS0FBSztZQUMvQixhQUFhLEVBQUUsSUFBSTtZQUNuQixXQUFXLEVBQUUsSUFBSTtZQUNqQixnQkFBZ0IsRUFBRTtnQkFDakIsTUFBTSxFQUFFO29CQUNQLEtBQUssRUFBRSxnQkFBZ0I7b0JBQ3ZCLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sS0FBSyxJQUFJLDJDQUEyQztvQkFDN0YsS0FBSyxFQUFFLHVCQUF1QjtvQkFDOUIsV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxLQUFLLElBQUksMkNBQTJDO29CQUM3RixPQUFPLEVBQUUsY0FBYztvQkFDdkIsS0FBSyxFQUFFLGdCQUFnQjtvQkFDdkIsTUFBTSxFQUFFLFlBQVk7b0JBQ3BCLE9BQU8sRUFBRSxDQUFDO2lCQUNWO2dCQUNELGVBQWUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sS0FBSyxJQUFJLEVBQUU7YUFDeEQ7U0FDRCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSx3QkFBZ0IsQ0FBQyxJQUFJLEVBQUU7WUFDbEQsU0FBUyxFQUFFLG9CQUFvQjtTQUMvQixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksdUJBQWUsQ0FBQyxJQUFJLEVBQUU7WUFDaEQsU0FBUyxFQUFFLG1CQUFtQjtTQUM5QixDQUFDLENBQUM7UUFFSCxvQkFBb0I7UUFDcEIsNkJBQTZCO1FBQzdCLGNBQWM7UUFDZCxNQUFNO1FBQ04sV0FBVztRQUNYLG1GQUFtRjtRQUNuRixPQUFPO1FBQ1Asb0JBQW9CO1FBQ3BCLE1BQU07UUFDTixxREFBcUQ7UUFDckQsMEJBQTBCO1FBQzFCLE1BQU07UUFFTixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSztRQUNKLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFN0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUM7WUFDaEMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjO1lBQ25DLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7WUFDdkMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO1NBQ3JDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7UUFDOUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDdEMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakQsSUFBSSxHQUFHLElBQUksSUFBSTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUM3QixJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUU7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDckMsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQWE7UUFDeEIsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNCLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsaUNBQWlDO0lBQ3pELENBQUM7Q0FDRDtBQXpGRCw2QkF5RkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBa2Fpcm9DbGllbnQsIENvbW1hbmRIYW5kbGVyLCBJbmhpYml0b3JIYW5kbGVyLCBMaXN0ZW5lckhhbmRsZXIgfSBmcm9tIFwiLi4vLi4vc3JjL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RDbGllbnQgZXh0ZW5kcyBBa2Fpcm9DbGllbnQge1xuXHRjb21tYW5kSGFuZGxlcjogQ29tbWFuZEhhbmRsZXI7XG5cdGluaGliaXRvckhhbmRsZXI6IEluaGliaXRvckhhbmRsZXI7XG5cdGxpc3RlbmVySGFuZGxlcjogTGlzdGVuZXJIYW5kbGVyO1xuXHRzZXR0aW5nczogYW55O1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcih7XG5cdFx0XHRvd25lcklEOiBcIjEyMzk5MjcwMDU4NzM0Mzg3MlwiLFxuXHRcdFx0aW50ZW50czogW11cblx0XHR9KTtcblxuXHRcdHRoaXMuY29tbWFuZEhhbmRsZXIgPSBuZXcgQ29tbWFuZEhhbmRsZXIodGhpcywge1xuXHRcdFx0ZGlyZWN0b3J5OiBcIi4vdGVzdC9jb21tYW5kcy9cIixcblx0XHRcdGlnbm9yZUNvb2xkb3duOiBbXCIxMzIyNjY0MjI2NzkyNDA3MDRcIl0sXG5cdFx0XHRhbGlhc1JlcGxhY2VtZW50OiAvLS9nLFxuXHRcdFx0cHJlZml4OiBcIiEhXCIsXG5cdFx0XHRhbGxvd01lbnRpb246IHRydWUsXG5cdFx0XHRjb21tYW5kVXRpbDogdHJ1ZSxcblx0XHRcdGNvbW1hbmRVdGlsTGlmZXRpbWU6IDEwMDAwLFxuXHRcdFx0Y29tbWFuZFV0aWxTd2VlcEludGVydmFsOiAxMDAwMCxcblx0XHRcdHN0b3JlTWVzc2FnZXM6IHRydWUsXG5cdFx0XHRoYW5kbGVFZGl0czogdHJ1ZSxcblx0XHRcdGFyZ3VtZW50RGVmYXVsdHM6IHtcblx0XHRcdFx0cHJvbXB0OiB7XG5cdFx0XHRcdFx0c3RhcnQ6IFwiV2hhdCBpcyB0aGluZz9cIixcblx0XHRcdFx0XHRtb2RpZnlTdGFydDogKG1zZywgdGV4dCkgPT4gYCR7bXNnLmF1dGhvcn0sICR7dGV4dH1cXG5UeXBlIFxcYGNhbmNlbFxcYCB0byBjYW5jZWwgdGhpcyBjb21tYW5kLmAsXG5cdFx0XHRcdFx0cmV0cnk6IFwiV2hhdCBpcyB0aGluZywgYWdhaW4/XCIsXG5cdFx0XHRcdFx0bW9kaWZ5UmV0cnk6IChtc2csIHRleHQpID0+IGAke21zZy5hdXRob3J9LCAke3RleHR9XFxuVHlwZSBcXGBjYW5jZWxcXGAgdG8gY2FuY2VsIHRoaXMgY29tbWFuZC5gLFxuXHRcdFx0XHRcdHRpbWVvdXQ6IFwiT3V0IG9mIHRpbWUuXCIsXG5cdFx0XHRcdFx0ZW5kZWQ6IFwiTm8gbW9yZSB0cmllcy5cIixcblx0XHRcdFx0XHRjYW5jZWw6IFwiQ2FuY2VsbGVkLlwiLFxuXHRcdFx0XHRcdHJldHJpZXM6IDVcblx0XHRcdFx0fSxcblx0XHRcdFx0bW9kaWZ5T3RoZXJ3aXNlOiAobXNnLCB0ZXh0KSA9PiBgJHttc2cuYXV0aG9yfSwgJHt0ZXh0fWBcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuaW5oaWJpdG9ySGFuZGxlciA9IG5ldyBJbmhpYml0b3JIYW5kbGVyKHRoaXMsIHtcblx0XHRcdGRpcmVjdG9yeTogXCIuL3Rlc3QvaW5oaWJpdG9ycy9cIlxuXHRcdH0pO1xuXG5cdFx0dGhpcy5saXN0ZW5lckhhbmRsZXIgPSBuZXcgTGlzdGVuZXJIYW5kbGVyKHRoaXMsIHtcblx0XHRcdGRpcmVjdG9yeTogXCIuL3Rlc3QvbGlzdGVuZXJzL1wiXG5cdFx0fSk7XG5cblx0XHQvLyBjb25zdCBkYiA9IHNxbGl0ZVxuXHRcdC8vIFx0Lm9wZW4oXCIuL3Rlc3QvZGIuc3FsaXRlXCIpXG5cdFx0Ly8gXHQudGhlbihkID0+XG5cdFx0Ly8gXHRcdGRcblx0XHQvLyBcdFx0XHQucnVuKFxuXHRcdC8vIFx0XHRcdFx0XCJDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBndWlsZHMgKGlkIFRFWFQgTk9UIE5VTEwgVU5JUVVFLCBzZXR0aW5ncyBURVhUKVwiXG5cdFx0Ly8gXHRcdFx0KVxuXHRcdC8vIFx0XHRcdC50aGVuKCgpID0+IGQpXG5cdFx0Ly8gXHQpO1xuXHRcdC8vIHRoaXMuc2V0dGluZ3MgPSBuZXcgU1FMaXRlUHJvdmlkZXIoZGIsIFwiZ3VpbGRzXCIsIHtcblx0XHQvLyBcdGRhdGFDb2x1bW46IFwic2V0dGluZ3NcIlxuXHRcdC8vIH0pO1xuXG5cdFx0dGhpcy5zZXR1cCgpO1xuXHR9XG5cblx0c2V0dXAoKSB7XG5cdFx0dGhpcy5jb21tYW5kSGFuZGxlci51c2VJbmhpYml0b3JIYW5kbGVyKHRoaXMuaW5oaWJpdG9ySGFuZGxlcik7XG5cdFx0dGhpcy5jb21tYW5kSGFuZGxlci51c2VMaXN0ZW5lckhhbmRsZXIodGhpcy5saXN0ZW5lckhhbmRsZXIpO1xuXG5cdFx0dGhpcy5saXN0ZW5lckhhbmRsZXIuc2V0RW1pdHRlcnMoe1xuXHRcdFx0Y29tbWFuZEhhbmRsZXI6IHRoaXMuY29tbWFuZEhhbmRsZXIsXG5cdFx0XHRpbmhpYml0b3JIYW5kbGVyOiB0aGlzLmluaGliaXRvckhhbmRsZXIsXG5cdFx0XHRsaXN0ZW5lckhhbmRsZXI6IHRoaXMubGlzdGVuZXJIYW5kbGVyXG5cdFx0fSk7XG5cblx0XHR0aGlzLmNvbW1hbmRIYW5kbGVyLmxvYWRBbGwoKTtcblx0XHR0aGlzLmluaGliaXRvckhhbmRsZXIubG9hZEFsbCgpO1xuXHRcdHRoaXMubGlzdGVuZXJIYW5kbGVyLmxvYWRBbGwoKTtcblxuXHRcdGNvbnN0IHJlc29sdmVyID0gdGhpcy5jb21tYW5kSGFuZGxlci5yZXNvbHZlcjtcblx0XHRyZXNvbHZlci5hZGRUeXBlKFwiMS0xMFwiLCAoXywgcGhyYXNlKSA9PiB7XG5cdFx0XHRjb25zdCBudW0gPSByZXNvbHZlci50eXBlKFwiaW50ZWdlclwiKSEoXywgcGhyYXNlKTtcblx0XHRcdGlmIChudW0gPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cdFx0XHRpZiAobnVtIDwgMSB8fCBudW0gPiAxMCkgcmV0dXJuIG51bGw7XG5cdFx0XHRyZXR1cm4gbnVtO1xuXHRcdH0pO1xuXHR9XG5cblx0YXN5bmMgc3RhcnQodG9rZW46IHN0cmluZykge1xuXHRcdGF3YWl0IHRoaXMuc2V0dGluZ3MuaW5pdCgpO1xuXHRcdGF3YWl0IHRoaXMubG9naW4odG9rZW4pO1xuXHRcdGNvbnNvbGUubG9nKFwiUmVhZHkhXCIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcblx0fVxufVxuIl19