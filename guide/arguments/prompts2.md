<!-- markdownlint-disable MD001 -->

# More Prompting

### Optional Prompts

Optional prompts are prompts that run if there was input, but the type casting failed.  
If there was no input, it would go on as normal.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type GuildMember, type Message } from "discord.js";

export default class HighestRoleCommand extends Command {
  public constructor() {
    super("highestRole", {
      aliases: ["highestRole"],
      args: [
        {
          id: "member",
          type: "member",
          prompt: {
            start: "Who would you like to get the highest role of?",
            retry: "That's not a valid member! Try again.",
            optional: true
          },
          default: (message: TextCommandMessage) => message.member
        }
      ],
      channel: "guild"
    });
  }

  public override exec(message: TextCommandMessage, args: { member: GuildMember }): Promise<Message> {
    return message.reply(args.member.roles.highest.name);
  }
}
```

With it, `default` is now used again.

- `?highestRole` would give the name for the message author.
- `?highestRole 1Computer` would give the name for 1Computer.
- `?highestRole someone-non-existant` would start up the prompts.

### Infinite Prompts

Infinite prompts are prompts that go on and on until the user says stop.  
(You can customize the input, but by default it is `stop`.)

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";

export default class PickCommand extends Command {
  public constructor() {
    super("pick", {
      aliases: ["pick"],
      args: [
        {
          id: "items",
          match: "none",
          prompt: {
            start: [
              "What items would you like to pick from?",
              "Type them in separate messages.",
              "Type `stop` when you are done."
            ],
            infinite: true
          }
        }
      ]
    });
  }

  public override exec(message: TextCommandMessage, args: { items }) {
    const picked = args.items[Math.floor(Math.random() * args.items.length)];
    return message.reply(`I picked ${picked.trim()}!`);
  }
}
```

And with that, `args.items` is now an array of responses from the user.  
Note that the `none` match is used, meaning nothing is matched in the original message.  
Because this is an infinite prompt that goes across multiple messages, we don't want it to take input from the original message.  
If you wish to allow a hybrid of matching and prompting multiple phrases, try using `separate` match with infinite prompts.
