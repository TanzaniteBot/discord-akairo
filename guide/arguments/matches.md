<!-- markdownlint-disable MD001 -->

# Matching Input

### Entire Content

Let's say you have a command that picks from a list inputted.  
Obviously, you won't know how many things there are.  
So, we need a different way of matching input instead of phrase by phrase.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class PickCommand extends Command {
  public constructor() {
    super("pick", {
      aliases: ["pick"],
      args: [
        {
          // Only takes one phrase!
          id: "items"
        }
      ]
    });
  }

  public override exec(message: TextCommandMessage, args: { items: string }): Promise<Message> {
    const picked = args.items; // ???
    return message.reply(`I picked ${picked}`);
  }
}
```

To remedy this, we will use the `match` option.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class PickCommand extends Command {
  public constructor() {
    super("pick", {
      aliases: ["pick"],
      args: [
        {
          id: "items",
          match: "content"
        }
      ]
    });
  }

  public override exec(message: TextCommandMessage, args: { items: string }): Promise<Message> {
    const items = args.items.split("|");
    const picked = items[Math.floor(Math.random() * items.length)];
    return message.reply(`I picked ${picked.trim()}!`);
  }
}
```

Now, the entire content, excluding the prefix and command of course, is matched.

### Flags

If you had a command with lots of argument that can be true or false, you may forget the order.  
This is where `flag` match comes in handy.

Here is a command where the user can change the output with a flag:

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";
import exampleAPI from "example-api";

export default class StatsCommand extends Command {
  public constructor() {
    super("stats", {
      aliases: ["stats"],
      args: [
        {
          id: "username"
        },
        {
          id: "advanced",
          match: "flag",
          flag: "--advanced"
        }
      ]
    });
  }

  public override exec(message: TextCommandMessage, args: { username: string; advanced: boolean }): Promise<Message> {
    const user = exampleAPI.getUser(args.username);

    if (args.advanced) {
      return message.reply(user.advancedInfo);
    }

    return message.reply(user.basicInfo);
  }
}
```

Now, if a user does `?stats 1Computer` they will get the `basicInfo`, but if they do `?stats 1Computer --advanced`, they will get the `advancedInfo`.  
It can be out of order too, so `?stats --advanced 1Computer` will work.

### Option Flag

The above example shows `flag`, which does only a boolean value, there or not there.  
Here, we will use `option` for unordered input.

Similar to the above example, but this time, we have many different possibilities.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";
import exampleAPI from "example-api";

export default class StatsCommand extends Command {
  public constructor() {
    super("stats", {
      aliases: ["stats"],
      args: [
        {
          id: "username"
        },
        {
          id: "color",
          match: "option",
          flag: "color:",
          default: "red"
        }
      ]
    });
  }

  public override exec(message: TextCommandMessage, args: { username: string; color: string }): Promise<Message> {
    const team = exampleAPI.getTeam(args.color);
    const user = team.getUser(args.username);

    return message.reply(user.info);
  }
}
```

So now, all of these inputs can be valid:

- `?stats 1Computer`
- `?stats 1Computer color:blue`
- `?stats color:green 1Computer`

It's also whitespace insensitive between the flag and the input:

- `?stats 1Computer color: blue`
- `?stats color: green 1Computer`

If you would like to use multiple flags, you can use an array.  
So, if you did `prefix: ['color:', 'colour:']`, both will be valid for the user.

Note that for both flag match type, you can have flags with whitespace or using an empty string.  
It will work, but will be extremely weird for the end users, so don't do it!

### Separate

Let's say that we want our pick command to only work on numbers.  
This would mean having to deal with splitting then casting the types within the args!  
We can do this with a custom separator using `separator` option alongside the `separate` match.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type Message } from "discord.js";

export default class PickCommand extends Command {
  public constructor() {
    super("pick", {
      aliases: ["pick"],
      separator: "|",
      args: [
        {
          id: "items",
          match: "separate",
          type: "number"
        }
      ]
    });
  }

  public override exec(message: TextCommandMessage, args: { items: number[] }): Promise<Message> {
    const picked = args.items[Math.floor(Math.random() * args.items.length)];
    return message.reply(`I picked ${picked} which is ${picked % 2 === 0 ? "even" : "odd"}!`);
  }
}
```

The `separate` match matches the phrases individually into an array where each element is type casted one by one.  
The `separator` option simply makes it so that all the input is separated via a certain character rather than by whitespace.

Note that with the `separator` option, quotes will not work.  
Flags will also have to be contained individually:

- `!foo a, --flag, c` recognizes `--flag`
- `!foo a, x --flag y, c` does not
- `!foo a, --option y, c` recognizes `--option`
- `!foo a, x --option y, c` does not

### Summary

Here are all the match types available in Akairo.

- `phrase` (default) matches one by one (where a phrase is either a word or something in quotes).
- `rest` matches the rest of the content, minus things matched by `flag` and `option`.
- `separate` matches the same way as `rest`, but works on each phrase separately.
- `flag` matches a flag.
- `option` matches a flag with additional input.
- `content` matches the content.
- `text` matches the content, minus things matched by `flag` and `option`.
- `none` matches nothing at all.

The different match types have the following behavior with border whitespaces, quotes, and separators:

- `phrase`, `separate`, and `option` do not preserve any of the three.
- `rest`, `content`, `text` do preserve all three.
