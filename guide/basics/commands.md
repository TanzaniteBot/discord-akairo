<!-- markdownlint-disable MD001 -->

# Basic Commands

### The Command Handler

In Akairo, the hierarchy is that there are handlers which contains modules.  
The handlers deals with loading modules and executing them.  
For commands, we will import and instantiate the `CommandHandler`.

```ts
import { AkairoClient, CommandHandler } from "@tanzanite/discord-akairo";

class MyClient extends AkairoClient {
  public commandHandler: CommandHandler;
  public constructor() {
    super({
      intents: [
        /* choose intents based on what you need your bot needs to do */
      ],
      ownerID: "123992700587343872", // or ['123992700587343872', '86890631690977280']
      allowedMentions: { parse: ["users"] }
    });

    this.commandHandler = new CommandHandler(this, {
      // Options for the command handler goes here.
    });
  }
}

const client = new MyClient();
client.login("TOKEN");
```

Now, for some options.  
The `directory` option tells the handler where the main set of commands modules are at.  
The `prefix` option is simply the prefixes you want to use, you can have multiple too!

```ts
this.commandHandler = new CommandHandler(this, {
  directory: "./commands/",
  prefix: "?" // or ['?', '!']
});
```

And now that the command handler has been setup, we simply have to tell it to load the modules.

```ts
this.commandHandler.loadAll();
```

### Ping Command

Our first order of business is to make a ping command.  
No bot is complete without one!

We specified that the `directory` is in `./commands/`.  
So, go there, make a new file, and import Akairo.

```ts
import { Command } from "@tanzanite/discord-akairo";
```

Here is a basic ping command:

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class PingCommand extends Command {
  public constructor() {
    super("ping", {
      aliases: ["ping"]
    });
  }

  public override exec(message: TextCommandMessage): Promise<Message> {
    return message.reply("Pong!");
  }
}
```

The first parameter of `super` is the unique ID of the command.  
It is not seen nor used by users, but you should keep it the same as one of the aliases.

The second parameter is the options.  
The only option there right now are the aliases, which are the names of the command for the users to call.  
Note that the ID of the command is not an alias!

The exec method is the execution function, ran when the command is called.  
You should try to always return a value such as a Promise with it, so that the framework can tell when a command finishes.

If everything was done correctly, your command should now work!  
Because there are a lot of things that can be changed for commands, they will be explained further in other tutorials.
