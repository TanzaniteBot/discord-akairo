<!-- markdownlint-disable MD041 MD033 MD001 MD026 -->
<div align="center">
  <br />
  <p>
    <a href="https://github.com/TanzaniteBot/discord-akairo/wiki"><img src="https://discord-akairo.github.io/static/logo.svg" width="546" alt="discord-akairo" /></a>
  </p>
  <br />
  <p>
    <a href="https://www.npmjs.com/package/@tanzanite/discord-akairo"><img src="https://img.shields.io/npm/v/@tanzanite/discord-akairo.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/@tanzanite/discord-akairo"><img src="https://img.shields.io/npm/dt/@tanzanite/discord-akairo.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://github.com/TanzaniteBot/discord-akairo/actions"><img src="https://img.shields.io/github/actions/workflow/status/TanzaniteBot/discord-akairo/checks.yml?branch=master&label=checks" alt="Checks" /></a>
  </p>
  <!-- <p>
    <a href="https://www.npmjs.com/package/@tanzanite/discord-akairo"><img src="https://nodeico.herokuapp.com/@tanzanite/discord-akairo.svg" alt="npm installnfo" /></a> -->
  </p>
</div>

### Changes in this fork of discord-akairo

Please see [this file](/guide/general/updates.md) for a list of changes in this fork vs normal akairo.
If you have any questions related to this fork please contact [ironm00n](https://discord.com/users/322862723090219008) in the akairo server or join my [bot's discord server](https://discord.gg/7FpsYp2c47).

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

##### Requires Node 16+ and Discord.js v14.

**discord-akairo**
If you do not want to have to update your imports you can install the library using the following:
`yarn add discord-akairo@npm:@tanzanite/discord-akairo@dev`<br />`npm i discord-akairo@npm:@tanzanite/discord-akairo`<br />

Otherwise you can install the package normally, just make sure to update your imports from `discord-akairo` to `@tanzanite/discord-akairo`:
`yarn add @tanzanite/discord-akairo@dev`<br />`npm i @tanzanite/discord-akairo`<br />

**discord.js fork**<br />_optional you can use regular discord.js instead if you want_<br />`yarn add discord.js@npm:@tanzanite/discord.js@dev`<br />`npm i discord.js@npm:@tanzanite/discord.js`<br />

## Links

- [Website](https://github.com/TanzaniteBot/discord-akairo/wiki)
- [Repository](https://github.com/TanzaniteBot/discord-akairo)
- [Discord](https://discord.gg/7FpsYp2c47)
<!-- - [Changelog](https://github.com/discord-akairo/discord-akairo/releases) -->

## Contributing

Open an issue or a pull request!  
Everyone is welcome to do so.  
Make sure to run `yarn test` before committing.
