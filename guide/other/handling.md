<!-- markdownlint-disable MD001 -->

# Handling Modules

### Categorizing

You can categorize a module with the `category` option.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class PingCommand extends Command {
  public constructor() {
    super("ping", {
      aliases: ["ping"],
      category: "stuff"
    });
  }

  public override exec(message: TextCommandMessage): Promise<Message> {
    return message.reply("Pong!");
  }
}
```

A new category will be created on the handler with the ID of `stuff`.  
By default, all modules are in the `default` category.

### Reloading

Everything in Akairo is a module, and all modules are loaded by handlers.  
With that said, this means you can add, remove, or reload modules while the bot is running!

Here is a basic command that reloads the inputted ID:

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class ReloadCommand extends Command {
  public constructor() {
    super("reload", {
      aliases: ["reload"],
      args: [
        {
          id: "commandID"
        }
      ],
      ownerOnly: true,
      category: "owner"
    });
  }

  public override exec(message: TextCommandMessage, args: { commandID: string }) {
    // `this` refers to the command object.
    this.handler.reload(args.commandID);
    return message.reply(`Reloaded command ${args.commandID}!`);
  }
}
```

Ways you can reload a module includes:

- Individually:
  - `<AkairoHandler>.reload(moduleID)`
  - `<AkairoModule>.reload()`
- Many at once:
  - `<AkairoHandler>.reloadAll()`
  - `<Category>.reloadAll()`

### Removing and Adding

For removing, simply change all those `reload` to `remove`.  
To add a new module, you can use the `load` method.  
With `load`, you will need to specify a full filepath or a module class.  
If you load with a class, note that those cannot be reloaded.
