<!-- markdownlint-disable MD001 -->

# Conditional Commands

### Run Whenever

Conditional commands are commands that run if the following conditions are true:

- The command was not invoked normally.
- The command's `condition` option is true.

Multiple conditional commands/regex commands can be triggered on one message.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class ComplimentCommand extends Command {
  public constructor() {
    super("compliment", {
      category: "random"
    });
  }

  public override condition(message: TextCommandMessage): boolean {
    return message.author.id === "126485019500871680";
  }

  public override exec(message: TextCommandMessage): Promise<Message> {
    return message.reply("You are a great person!");
  }
}
```

This command, whenever a certain person sends any message, will execute.
