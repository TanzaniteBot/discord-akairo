# Ping Command

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class PingCommand extends Command {
  public constructor() {
    super("ping", {
      aliases: ["ping", "hello"]
    });
  }

  public override async exec(message: TextCommandMessage): Promise<Message> {
    const sent = await message.util.reply("Pong!");
    const timeDiff = (sent.editedAt || sent.createdAt) - (message.editedAt || message.createdAt);
    return message.util.reply(["Pong!", `🔂 **RTT**: ${timeDiff} ms`, `💟 **Heartbeat**: ${Math.round(this.client.ws.ping)} ms`]);
  }
}
```
