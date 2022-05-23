<!-- markdownlint-disable MD041 MD033 MD001 MD026 -->
<div align="center">
  <br />
  <p>
    <a href="https://github.com/NotEnoughUpdates/discord-akairo/wiki"><img src="https://discord-akairo.github.io/static/logo.svg" width="546" alt="discord-akairo" /></a>
  </p>
  <br />
  <p>
    <a href="https://www.npmjs.com/package/@notenoughupdates/discord-akairo"><img src="https://img.shields.io/npm/v/@notenoughupdates/discord-akairo.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/@notenoughupdates/discord-akairo"><img src="https://img.shields.io/npm/dt/@notenoughupdates/discord-akairo.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://github.com/NotEnoughUpdates/discord-akairo/actions"><img src="https://img.shields.io/github/workflow/status/NotEnoughUpdates/discord-akairo/Test/master" alt="Build status" /></a>
  </p>
  <p>
    <a href="https://www.npmjs.com/package/@notenoughupdates/discord-akairo"><img src="https://nodeico.herokuapp.com/@notenoughupdates/discord-akairo.svg" alt="npm installnfo" /></a>
  </p>
</div>

### Changes in this fork of akairo

Please see [this file](/guide/general/updates.md) for a list of changes in this fork vs normal akairo.
If you have any questions related to this fork please contact `IRONM00N#0001` in the akairo server or join my [bot's discord](https://discord.gg/7FpsYp2c47).

## Features

#### Completely modular commands, inhibitors, and listeners.

- Reading files recursively from directories.
- Adding, removing, and reloading modules.
- Creating your own handlers and module types.

#### Flexible command handling and creation.

- Command aliases.
- Command throttling and cooldowns.
- Client and user permission checks.
- Running commands on edits and editing previous responses.
- Multiple prefixes and mention prefixes.
- Regular expression and conditional triggers.

#### Complex and highly customizable arguments.

- Support for quoted arguments.
- Arguments based on previous arguments.
- Several ways to match arguments, such as flag arguments.
- Casting input into certain types.
  - Simple types such as string, integer, float, url, date, etc.
  - Discord-related types such as user, member, message, etc.
  - Types that you can add yourself.
  - Asynchronous type casting.
- Prompting for input for arguments.
  - Customizable prompts with embeds, files, etc.
  - Easily include dynamic data such as the incorrect input.
  - Infinite argument prompting.

#### Blocking and monitoring messages with inhibitors.

- Run at various stages of command handling.
  - On all messages.
  - On messages that are from valid users.
  - On messages before commands.

#### Helpful events and modular listeners.

- Events for handlers, such as loading modules.
- Events for various stages of command handling.
- Reloadable listeners to easily separate your event handling.

#### Useful utilities.

- Resolvers for members, users, and others that can filter by name.
- Shortcut methods for making embeds and collections.

## Installation

##### Requires Node 16+ and Discord.js v13.

**discord-akairo**<br />`yarn add discord-akairo@npm:@notenoughupdates/discord-akairo@dev`<br />`npm i discord-akairo@npm:@notenoughupdates/discord-akairo`<br />

**discord.js fork**<br />_optional you can use regular discord.js instead if you want_<br />`yarn add discord.js@npm:@notenoughupdates/discord.js@dev`<br />`npm i discord.js@npm:@notenoughupdates/discord.js`<br />

## Links

- [Website](https://github.com/NotEnoughUpdates/discord-akairo/wiki)
- [Repository](https://github.com/NotEnoughUpdates/discord-akairo)
- [Discord](https://discord.gg/7FpsYp2c47)
<!-- - [Changelog](https://github.com/discord-akairo/discord-akairo/releases) -->

## Contributing

Open an issue or a pull request!  
Everyone is welcome to do so.  
Make sure to run `yarn test` before committing.
