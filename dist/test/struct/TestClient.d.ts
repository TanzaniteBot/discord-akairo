import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from "../../src/index";
export default class TestClient extends AkairoClient {
    commandHandler: CommandHandler;
    inhibitorHandler: InhibitorHandler;
    listenerHandler: ListenerHandler;
    settings: any;
    constructor();
    setup(): void;
    start(token: any): Promise<void>;
}
//# sourceMappingURL=TestClient.d.ts.map