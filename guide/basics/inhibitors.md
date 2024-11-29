<!-- markdownlint-disable MD001 -->

# Basic Inhibitors

### Setup

Inhibitors are a way to monitor or block messages coming into the command handler.  
Because inhibitors are another kind of module, we need another kind of handler.  
To set it up, simply import and instantiate the `InhibitorHandler`, just like with the command handler.

```ts
import { AkairoClient, CommandHandler, InhibitorHandler } from "@tanzanite/discord-akairo";

class MyClient extends AkairoClient {
  public commandHandler: CommandHandler;
  public inhibitorHandler: InhibitorHandler;
  public constructor() {
    super({
      intents: [
        /* choose intents based on what you need your bot needs to do */
      ],
      ownerID: "123992700587343872",
      allowedMentions: { parse: ["users"] }
    });

    this.commandHandler = new CommandHandler(this, {
      directory: "./commands/",
      prefix: "?"
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      directory: "./inhibitors/"
    });
  }
}

const client = new MyClient();
client.login("TOKEN");
```

Then, tell it to load all the modules.  
But, since inhibitors are a part of the command handling process, the command handler has to know about the inhibitor handler, so:

```ts
this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
this.inhibitorHandler.loadAll();
```

### Blacklist

Create a folder named `inhibitors`, then a file there to make one.

```ts
import { Inhibitor, type TextCommandMessage } from "@tanzanite/discord-akairo";

export default class BlacklistInhibitor extends Inhibitor {
  public constructor() {
    super("blacklist", {
      reason: "blacklist"
    });
  }

  public override exec(message: TextCommandMessage): boolean {
    // He's a meanie!
    const blacklist = ["81440962496172032"];
    return blacklist.includes(message.author.id);
  }
}
```

The first parameter in `super` is the unique ID of the inhibitor.

The second parameter are the options.  
The option `reason` is what will get emitted to an event, but we can worry about that later.

The exec method is ran on testing.  
It should return `true` in order to block the message.  
Promise are awaited and the resolved value will be checked.
