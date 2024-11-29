# Subcommands

If you need a command that accepts different arguments based upon the result of the
first argument(s), it is helpful to use subcommands. Subcommands can be used in both
text-based and slash commands. There are multiple methods to achieve this.

> Slash Command subcommands and subcommand groups will be added to the arg parameter
> of the `exec` or `execSlash` method with the keys of `subcommand` and `subcommandGroup` respectively.

## Separate Files

For some commands it might make sense to separate each sub command into its own
file and class. To demonstrate this, let's look at a 'list' command.

```ts
// list.ts

import { Command, Flag, type SlashCommandMessage, type ArgumentGeneratorReturn } from "@tanzanite/discord-akairo";
import { ApplicationCommandOptionType } from "discord.js";

export default class ListCommand extends Command {
  public constructor() {
    super("list", {
      aliases: ["list"],
      /* ... */
      slash: true,
      slashOptions: [
        {
          name: "members",
          type: ApplicationCommandOptionType.Subcommand,
          /* ... */
          options: [
            /* ... */
          ]
        },
        {
          name: "punishments",
          type: ApplicationCommandOptionType.SubcommandGroup,
          /* ... */
          options: [
            {
              name: "warns",
              type: ApplicationCommandOptionType.Subcommand
              /* ... */
            },
            {
              name: "mutes",
              type: ApplicationCommandOptionType.Subcommand,
              /* ... */
              options: [
                {
                  name: "only_active",
                  type: ApplicationCommandOptionType.Boolean
                  /* ... */
                }
              ]
            }
          ]
        }
      ]
    });
  }

  public override *args(): ArgumentGeneratorReturn {
    const subcommand: "members" | "punishments" = yield {
      type: ["members", "punishments"],
      prompt: {
        start: 'Would you like to list "members" or "punishments"?',
        retry: '❌ Choose to list "members" or "punishments".'
      }
      /* ... */
    };

    return Flag.continue(`list-${subcommand}`);
  }

  /* exec() is not needed since Flag.continue is used */

  public override async execSlash(
    message: SlashCommandMessage,
    args: {
      subcommand: string;
      subcommandGroup?: string;
    }
  ) {
    // Sometimes you want to use subcommand groups for only some of the subcommands, this will use the
    // subcommand group if present, otherwise it will use the subcommand.
    // In this example, "members" would be a subcommand, while "punishments" would be a subcommand group.
    const subcommand = this.handler.modules.get(`list-${args.subcommandGroup ?? args.subcommand}`)!;

    // manually call the subcommand's exec() method.
    // if you want separate logic for slash and text commands, call the subcommand's execSlash() method instead.
    return subcommand.exec(message, args);
  }
}
```

```ts
// list-members.ts

import { Command, type UnionMessage } from "@tanzanite/discord-akairo";

export default class ListMembersCommand extends Command {
  public constructor() {
    super("list-members", {
      aliases: [], // doesn't have an alias, can't use it directly
      /* ... */
      args: [
        /* you can add any remaining args here */
      ]
    });
  }

  public override async exec(
    message: UnionMessage,
    args: {
      /* ... */
    }
  ) {
    /* ... */
  }
}
```

```ts
// list-punishments

import { Command, type UnionMessage, type ArgumentGeneratorReturn } from "@tanzanite/discord-akairo";

export default class ListPunishmentsCommand extends Command {
  public constructor() {
    super("list-punishments", {
      aliases: [] // doesn't have an alias, can't use it directly
      /* ... */
    });
  }

  // you can also use another argument generator if you would like
  public override *args(): ArgumentGeneratorReturn {
    const punishment_type = yield {
      type: ["warns", "mutes"],
      prompt: {
        start: "...",
        retry: "..."
      }
      /* ... */
    };

    if (type === "warns") {
      return { subcommand, punishment_type };
    } else {
      const only_active = yield {
        type: ["true", "false"],
        prompt: {
          start: "...",
          retry: "..."
        }
      };

      return { subcommand, punishment_type, only_active: only_active === "true" };
    }
  }

  public override async exec(
    message: UnionMessage,
    args: {
      /* ... */
    }
  ) {
    const punishmentType = message.util.isSlash ? args.subcommand : args.punishment_type;

    /* ... */
  }
}
```

## Same File

In other cases you might want to handle subcommands in the same file, you can
do that as well. We will use the list command again.

```ts
// list.ts

import { Command, Flag, type UnionMessage, type ArgumentGeneratorReturn } from "@tanzanite/discord-akairo";
import { ApplicationCommandOptionType } from "discord.js";

export default class ListCommand extends Command {
  public constructor() {
    super("list", {
      aliases: ["list"],
      /* ... */
      slash: true,
      slashOptions: [
        {
          name: "members",
          type: ApplicationCommandOptionType.Subcommand,
          /* ... */
          options: [
            /* ... */
          ]
        },
        {
          name: "punishments",
          type: ApplicationCommandOptionType.SubcommandGroup,
          /* ... */
          options: [
            {
              name: "warns",
              type: ApplicationCommandOptionType.Subcommand
              /* ... */
            },
            {
              name: "mutes",
              type: ApplicationCommandOptionType.Subcommand,
              /* ... */
              options: [
                {
                  name: "only_active",
                  type: ApplicationCommandOptionType.Boolean
                  /* ... */
                }
              ]
            }
          ]
        }
      ]
    });
  }

  public override *args(): ArgumentGeneratorReturn {
    const subcommand: "members" | "punishments" = yield {
      type: ["members", "punishments"],
      prompt: {
        start: 'Would you like to list "members" or "punishments"?',
        retry: '❌ Choose to list "members" or "punishments".'
      }
      /* ... */
    };

    switch (subcommand) {
      case "members": {
        return { subcommand };
      }
      case "punishments": {
        const punishment_type = yield {
          type: ["warns", "mutes"],
          prompt: {
            start: "...",
            retry: "..."
          }
          /* ... */
        };

        if (type === "warns") {
          return { subcommand, punishment_type };
        } else {
          const only_active = yield {
            type: ["true", "false"],
            prompt: {
              start: "...",
              retry: "..."
            }
          };

          return { subcommand, punishment_type, only_active: only_active === "true" };
        }
      }
    }
  }

  public override async exec(
    message: UnionMessage,
    args: Record<string, any> // This could also be a union of all the possibilities
  ) {
    const whatToList: "members" | "punishments" = message.util.isSlash
      ? (args.subcommandGroup ?? args.subcommand)
      : args.subcommand;

    switch (whatToList) {
      case "members": {
        /* ... */
        break;
      }
      case "punishments": {
        const punishmentType = message.util.isSlash ? args.subcommand : args.punishment_type;

        if (punishmentType === "warns") {
          /* ... */
        } else {
          const onlyActive = args.only_active;
          /* ... */
        }
      }
    }
  }
}
```
