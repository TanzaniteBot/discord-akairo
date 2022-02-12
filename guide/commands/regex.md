<!-- markdownlint-disable MD001 -->

# Regex Commands

### Memes

Regex or regular expressions, is basically a way to match characters in a string.  
Regex commands are commands that run if the following conditions are true:

- The command was not invoked normally.
- The command's `regex` matches the message.

Multiple regex commands/conditional commands can be triggered from one message.

```ts
import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class AyyCommand extends Command {
  public constructor() {
    super("ayy", {
      regex: /^ayy$/i
    });
  }

  public override exec(message: Message): Promise<Message> {
    return message.reply("lmao");
  }
}
```

This command will trigger on any message with the content `ayy`, case-insensitive.  
In `args`, the `match` property will be the result from `message.content.match(/^ayy$/i)`.  
The `matches` property will be the matches, if using a global regex.

### As a Function

The `regex` option can also be a function.

```ts
import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class AyyCommand extends Command {
  public constructor() {
    super("ayy", {
      category: "random"
    });
  }

  public override regex(message: Message) {
    // Do some code...
    return /^ayy$/i;
  }

  public override exec(message: Message): Promise<Message> {
    return message.reply("lmao");
  }
}
```
