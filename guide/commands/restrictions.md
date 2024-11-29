<!-- markdownlint-disable MD001 -->

# Restrictions

### Channel Restrictions

If a command requires a guild to be used correctly, you can restrict it to a guild with one option.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class NicknameCommand extends Command {
  public constructor() {
    super("nickname", {
      aliases: ["nickname"]
    });
  }

  public override exec(message: TextCommandMessage): Promise<Message> {
    return message.reply(`Your nickname is ${message.member.nickname}.`);
  }
}
```

The above breaks in a DM, so let's add the `channel` option.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class NicknameCommand extends Command {
  public constructor() {
    super("nickname", {
      aliases: ["nickname"],
      channel: "guild"
    });
  }

  public override exec(message: TextCommandMessage): Promise<Message> {
    return message.reply(`Your nickname is ${message.member.nickname}.`);
  }
}
```

Everything is fixed and you can go on your way!  
As a bonus, this will emit `commandBlocked` on the command handler with the reason `guild` if someone tries to use it in a DM.

### Owner Only

Remember the `ownerID` option in your client?  
Your commands can be owner-only, restricting them to be used by the owner(s).  
Simply add `ownerOnly`.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class TokenCommand extends Command {
  public constructor() {
    super("token", {
      aliases: ["token"],
      ownerOnly: true,
      channel: "dm"
    });
  }

  public override exec(message: TextCommandMessage): Promise<Message> {
    // Don't actually do this.
    return message.reply(this.client.token);
  }
}
```

This will emit `commandBlocked` with the reason `owner` if someone else uses it.
