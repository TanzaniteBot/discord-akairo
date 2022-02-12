<!-- markdownlint-disable MD001 MD033 MD040 -->

# Setting Up

### Installation

Before even doing anything else, you of course have to install the Discord.js and Akairo.

> Yarn 2.0+ needs to have the version specified due to this [issue](https://github.com/yarnpkg/berry/issues/1816). If you are using yarn 2.0 use the second command.

**discord-akairo**<br />`yarn add discord-akairo@npm:@notenoughupdates/discord-akairo@dev`<br />`npm i discord-akairo@npm:@notenoughupdates/discord-akairo`<br />

**discord.js fork**<br />_optional you can use regular discord.js instead if you want_<br />`yarn add discord.js@npm:@notenoughupdates/discord.js@dev`<br />`npm i discord.js@npm:@notenoughupdates/discord.js`<br />

Once everything has been installed, your working directory should look something like this:

```
mybot
|____ node_modules
      bot.js
```

### Main File

Inside `bot.ts`, import `discord-akairo` and extend the `AkairoClient` class to customize your client.  
As your bot gets more complicated, you may want to separate this client class from your main file.

```ts
import { AkairoClient } from "discord-akairo";

class MyClient extends AkairoClient {
  public constructor() {
    super({
      // Options for Akairo and discord.js go here.
    });
  }
}

const client = new MyClient();
client.login("TOKEN");
```

There are some options you may want to setup first, for example, the owner of the bot.
If you would like to have multiple owners simply add those with an array.  
We want to use Discord.js's `allowedMentions` option too.

```ts
import { AkairoClient } from "discord-akairo";

class MyClient extends AkairoClient {
  public constructor() {
    super({
      intents: [
        /* choose intents based on what you need your bot needs to do */
      ],
      ownerID: "123992700587343872", // or ['123992700587343872', '86890631690977280']
      allowedMentions: { parse: ["users"] }
    });
  }
}

const client = new MyClient();
client.login("TOKEN");
```

Your bot should now login, and you are ready to make commands.
