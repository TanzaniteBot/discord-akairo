<!-- markdownlint-disable MD001 -->

# Custom Handlers

### And Custom Modules

Internally, Akairo's handlers all extends AkairoHandler, and all modules extends AkairoModule.  
So, you can create your own handlers and module types!  
Create a new class for your module.

```ts
import { AkairoModule } from "discord-akairo";

export default class CustomModule extends AkairoModule {
  public color: string;

  public constructor(id, options = {}) {
    super(id, options);

    this.color = options.color || "red";
  }

  public override exec() {
    throw new Error("Not implemented!");
  }
}
```

Note that the `exec` method you see in Command, Inhibitor, and Listener are not native to AkairoModule.  
They require you to actually create them within the module type, such as above.  
We throw an error there just in case you forget to implement it.

Then, create a new class for your handler:

```ts
import { AkairoHandler } from "discord-akairo";
import CustomModule from "./CustomModule";

export default class CustomHandler extends AkairoHandler {
  customOption: string;
  constructor(client, options = {}) {
    super(client, {
      directory: options.directory,
      classToHandle: CustomModule
    });

    this.customOption = options.customOption || "something";
  }
}
```

For the handler, the `super()` takes the client, the directory for the handler, and the class of the module type we want to handle.  
Now we can add it to our client if we so desire:

```ts
import { AkairoClient } from "discord-akairo";
import CustomHandler from "./CustomHandler";

export default class MyClient extends AkairoClient {
  public customHandler: CustomHandler;
  constructor() {
    super({
      intents: [
        /* choose intents based on what you need your bot needs to do */
      ],
      ownerID: "123992700587343872", // or ['123992700587343872', '86890631690977280']
      allowedMentions: { parse: ["users"] }
    });

    this.customHandler = new CustomHandler(this, {
      directory: "./customs/"
    });

    this.customHandler.loadAll();
  }
}
```

And the module:

```ts
import CustomModule from "../CustomModule";

export default class CustomCustom extends CustomModule {
  constructor() {
    super("custom", {
      color: "blue"
    });
  }

  exec(): void {
    console.log("I did something!");
  }
}
```

Custom handlers and modules are can get much more complicated than this.  
However, it would be out of the scope of this tutorial, so if you want to go there, check out the source code on Github.
