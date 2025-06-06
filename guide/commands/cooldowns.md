<!-- markdownlint-disable MD001 MD026 -->

# Cooldowns

### No Spam!

Cooldowns are how you make sure that troublemakers don't spam your bot.  
Akairo allows you to set cooldowns in uses per milliseconds.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";
import exampleAPI from "example-api";

export default class RequestCommand extends Command {
  public constructor() {
    super("request", {
      aliases: ["request"],
      cooldown: 10000,
      ratelimit: 2
    });
  }

  public override async exec(message: TextCommandMessage): Promise<Message> {
    const info = await exampleAPI.fetchInfo();
    return message.reply(info);
  }
}
```

`cooldown` is the amount of time a user would be in cooldown for.  
`ratelimit` is the amount of uses a user can do before they are denied usage.

In simple terms, this means 2 uses every 10000 milliseconds.

If you wish to set a default cooldown for all commands, the `defaultCooldown` option is available:

```ts
this.commandHandler = new CommandHandler(this, {
  directory: "./commands/",
  prefix: "?",
  defaultCooldown: 1000
});
```

When someone uses a command while in cooldown, the event `cooldown` will be emitted on the command handler with the remaining time in milliseconds.

### Ignoring Cooldown

By default, cooldowns are ignored by the client owners.  
This is actually done through the option `ignoreCooldown`.  
To change this, simply pass in an ID or an array of IDs:

```ts
this.commandHandler = new CommandHandler(this, {
  directory: "./commands/",
  prefix: "?",
  defaultCooldown: 1000,
  ignoreCooldown: ["123992700587343872", "130175406673231873"]
});
```

Note that you should pass the owner ID in as well, since it overrides the default.  
That is, unless you actually want to be ratelimited yourself.  
Also, a function could also be used to check who should be ignored.
