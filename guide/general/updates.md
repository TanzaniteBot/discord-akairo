# Changes in this fork of akairo

## TypeScript

Everything has been rewritten in TypeScript - this means that typings will match exactly with the code itself.

## Slash commands

New slash command related events:

> these are all emitted by the command handler

- `slashBlocked`
- `slashError`
- `slashFinished`
- `slashMissingPermissions`
- `slashNotFound`
- `slashStarted`

Additionally `slashBlocked`/`commandBlocked` can have a reason of `notNsfw`

> Cooldown event will also run on slash commands

To see more information about each event look in the [this file](../../src/typings/events.ts)

Slash command example:

> Slash commands are turned into [message-like objects](../../src/util/AkairoMessage.ts) to make interacting with them easier the original infraction is maintained though at `message.interaction`, if you do not enable `autoRegisterSlashCommands` you will need to register the slash commands yourself with the name of the command.

```ts
import { UnionMessage, TextCommandMessage, SlashCommandMessage, Command } from "@tanzanite/discord-akairo";
import { ApplicationCommandOptionType, GuildMember } from "discord.js";

export default class GreetCommand extends Command {
  public constructor() {
    super("greet", {
      aliases: ["greet"],
      // Text Command Arguments
      args: [
        {
          id: "member",
          type: "member",
          match: "rest"
        }
      ],
      // Enable slash for this command
      slash: true,
      // Currently you have to specify the options you want the command to be generated with (assuming you have
      // autoRegisterSlashCommands enabled)
      // In the future you will be able to choose to have them created from your existing arguments
      slashOptions: [
        {
          name: "member",
          description: "The member you want to greet",
          type: ApplicationCommandOptionType.User,
          resolve: "Member", // resolve the user to a GuildMember object
          required: true
        }
      ]
    });
  }

  /* Using exec and execSlash*/

  public override exec(message: TextCommandMessage, { member }: { member: GuildMember }) {
    message.reply(`Hello ${member}!`);
  }

  // By default it will use the normal exec method but if you specify execSlash it will run and not the exec
  // If you want it to always run execSlash you will have to add the execSlash option to your command handler
  // and it will only use the execSlash and throw a error if you aren't using it
  public override execSlash(message: SlashCommandMessage, { member }: { member: GuildMember }) {
    message.reply(`Hello ${member}!`);
  }

  /* Using just exec */

  public override exec(message: UnionMessage, { member }: { member: GuildMember }) {
    message.util.reply(`Hello ${member}!`); // message.util can reply to both regular messages and slash commands
  }
}
```

Note that this example assumes either:

1. You have enabled `autoRegisterSlashCommands` in the CommandHandler options or
2. You already have a registered slash command called `greet`
   - The registered command has one option named `user`, and
   - The type is `USER`
   - Required is `false`

You can use the `message.util` methods to reply to both regular and slash commands. Additionally you can use `message.util.isSlash` to know if the message is a slash command or not or `message.util.isSlashMessage(message) for type guarding.

### Ephemeral responses

If you are unaware, an ephemeral response is what causes the "Only you can see this" response with slash commands. You can cause the command to do this with the `slashEphemeral` command option. Just add `slashEphemeral: true` and it will respond privately.

> This is for slash commands and not normal commands

Alternately you can add `ephemeral: true` to the `message.util.reply` options and it will be automatically removed if the command is not a slash command.

## Tasks

Yes this fork has tasks!

Example:

```ts
// bot.ts
import { TaskHandler } from "@tanzanite/discord-akairo";
/* ... */
taskHandler: TaskHandler = new TaskHandler(this, {
  directory: join(__dirname, "..", "tasks")
});
/* ... */
this.taskHandler.loadAll();
this.taskHandler.startAll();
/* ... */
```

```ts
// tasks/task.ts
import { Task } from "@tanzanite/discord-akairo";
export default class extends Task {
  public constructor() {
    super("hello", {
      delay: 200,
      runOnStart: false
    });
  }

  public override async exec() {
    console.log("hello from", this.client.user.username);
  }
}
```

## Context Menu Commands

The ContextMenuCommandHandler exists so you don't have to manually create context menu commands and handle them.

```ts
// bot.ts

contextMenuCommandHandler = new ContextMenuCommandHandler(this, {
  directory: path.join(__dirname, "..", "context-menu-commands")
});
```

```ts
import { ContextMenuCommand } from "@tanzanite/discord-akairo";
import { ApplicationCommandType, ContextMenuInteraction } from "discord.js";

export default class ViewRawContextMenuCommand extends ContextMenuCommand {
  public constructor() {
    super("pin", {
      name: "pin",
      type: ApplicationCommandType.Message
    });
  }

  public override async exec(interaction: ContextMenuInteraction): Promise<void> {
    const message = interaction.options.getMessage("message");
    await message.pin();
    await interaction.reply({ content: "Pinned Message", ephemeral: true });
  }
}
```

## Superusers

SuperUsers example:

```ts
// bot.ts
/* ... */
public constructor(config: Option) {
  super({
    ownerID: config.owners,
    superUserID: config.superUsers,
  });
}
/* ... */
```

```ts
// bot.ts
/* ... */
public constructor(config: Option) {
  super({
    ownerID: config.owners,
    // Owners aren't automatically added as superuser
    superUserID: [...config.owners, ...config.superUsers],
  });
}
/* ... */
```

## Auto defer

Auto defer automatically defers a message aka "BotName is thinking".

```ts
commandHandler = new CommandHandler(this, {
  directory: join(__dirname, "..", "Commands"),
  prefix: "!",
  //To disable it
  autoDefer: false
});
```

You can also do this manually

```ts
// command
/* ... */
public override exec(message: MessageUnion) {
  if (message.util.isSlashMessage(message)) await message.interaction.deferReply()
  /* ... */
}
/* ... */
```

## onlyNsfw

Makes a command usable ONLY in NSFW channels

If a user tries to use a command with `onlyNsfw: true` in a channel that is not NSFW the CommandHandler will emit the `notNsfw` event that can be listened for in order to act in different ways.

Example

```ts
import { Command } from "@tanzanite/discord-akairo";

export default class NsfwCommand extends Command {
  public constructor() {
    super("nsfw", {
      aliases: ["nsfw"],
      category: "NSFW 🔞",
      onlyNsfw: true,
      description: {
        content: "Random nsfw example",
        usage: "nsfw",
        examples: ["nsfw"]
      }
    });
  }

  /* ... */
}
```

## Removed features

- Providers
  - mongo
  - sequelize
  - sqlite

If you want a good database, we recommend using an ORM like sequelize. Databases aren't hard to set up by themselves, and are much more convenient when used without being limited by providers.

> For support regarding this fork, you can ping [@ironm00n](https://discord.com/users/322862723090219008) in the Akairo discord server or preferably join [my bots discord](https://discord.gg/7FpsYp2c47) and ask there.
