<!-- markdownlint-disable MD001 -->

# Permissions

### Permission Flags

Some commands should only be used by someone with certain permissions.  
There are options to help you do this.  
The two options to use are `clientPermissions` and `userPermissions`.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type GuildMember, type Message } from "discord.js";

export default class BanCommand extends Command {
  public constructor() {
    super("ban", {
      aliases: ["ban"],
      args: [
        {
          id: "member",
          type: "member"
        }
      ],
      clientPermissions: ["BanMembers"],
      userPermissions: ["BanMembers"],
      channel: "guild"
    });
  }

  public override async exec(message: TextCommandMessage, args: { member: GuildMember }): Promise<Message> {
    if (!args.member) {
      return message.reply("No member found with that name.");
    }

    await args.member.ban();
    return message.reply(`${args.member} was banned!`);
  }
}
```

This now checks for the required permissions for the client, then the user.  
When blocked, it emits `missingPermissions` on the command handler.  
It will pass the message, command, either `client` or `user`, then the missing permissions.

### Dynamic Permissions

Sometimes, you may want to check for a role instead of permission flags.  
This means you can use a function instead of an array!  
A function can be used on both `clientPermissions` and `userPermissions`.

The return value is the `missing` parameter that is sent to the `missingPermissions` event.  
If the return value is null, then that means they're not missing anything.

```ts
import { Command, type TextCommandMessage } from "@tanzanite/discord-akairo";
import { type GuildMember, type Message } from "discord.js";

export default class BanCommand extends Command {
  constructor() {
    super("ban", {
      aliases: ["ban"],
      args: [
        {
          id: "member",
          type: "member"
        }
      ],
      clientPermissions: ["BanMembers"],
      channel: "guild"
    });
  }

  userPermissions(message: TextCommandMessage) {
    if (!message.member.roles.cache.some(role => role.name === "Moderator")) {
      return "Moderator";
    }

    return null;
  }

  async exec(message: TextCommandMessage, args: { member: GuildMember }): Promise<Message> {
    if (!args.member) {
      return message.reply("No member found with that name.");
    }

    await args.member.ban();
    return message.reply(`${args.member} was banned!`);
  }
}
```
