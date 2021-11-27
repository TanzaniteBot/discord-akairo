export const ArgumentMatches = Object.freeze({
	PHRASE: "phrase",
	FLAG: "flag",
	OPTION: "option",
	REST: "rest",
	SEPARATE: "separate",
	TEXT: "text",
	CONTENT: "content",
	REST_CONTENT: "restContent",
	NONE: "none"
} as const);

export const ArgumentTypes = Object.freeze({
	STRING: "string",
	LOWERCASE: "lowercase",
	UPPERCASE: "uppercase",
	CHAR_CODES: "charCodes",
	NUMBER: "number",
	INTEGER: "integer",
	BIGINT: "bigint",
	EMOJINT: "emojint",
	URL: "url",
	DATE: "date",
	COLOR: "color",
	USER: "user",
	USERS: "users",
	MEMBER: "member",
	MEMBERS: "members",
	RELEVANT: "relevant",
	RELEVANTS: "relevants",
	CHANNEL: "channel",
	CHANNELS: "channels",
	TEXT_CHANNEL: "textChannel",
	TEXT_CHANNELS: "textChannels",
	VOICE_CHANNEL: "voiceChannel",
	VOICE_CHANNELS: "voiceChannels",
	CATEGORY_CHANNEL: "categoryChannel",
	CATEGORY_CHANNELS: "categoryChannels",
	NEWS_CHANNEL: "newsChannel",
	NEWS_CHANNELS: "newsChannels",
	STORE_CHANNEL: "storeChannel",
	STORE_CHANNELS: "storeChannels",
	STAGE_CHANNEL: "stageChannel",
	STAGE_CHANNELS: "stageChannels",
	THREAD_CHANNEL: "threadChannel",
	THREAD_CHANNELS: "threadChannels",
	ROLE: "role",
	ROLES: "roles",
	EMOJI: "emoji",
	EMOJIS: "emojis",
	GUILD: "guild",
	GUILDS: "guilds",
	MESSAGE: "message",
	GUILD_MESSAGE: "guildMessage",
	RELEVANT_MESSAGE: "relevantMessage",
	INVITE: "invite",
	USER_MENTION: "userMention",
	MEMBER_MENTION: "memberMention",
	CHANNEL_MENTION: "channelMention",
	ROLE_MENTION: "roleMention",
	EMOJI_MENTION: "emojiMention",
	COMMAND_ALIAS: "commandAlias",
	COMMAND: "command",
	INHIBITOR: "inhibitor",
	LISTENER: "listener",
	TASK: "task",
	CONTEXT_MENU_COMMAND: "contextMenuCommand"
} as const);

export const AkairoHandlerEvents = Object.freeze({
	LOAD: "load",
	REMOVE: "remove"
} as const);

export const CommandHandlerEvents = Object.freeze({
	COMMAND_BLOCKED: "commandBlocked",
	COMMAND_BREAKOUT: "commandBreakout",
	COMMAND_CANCELLED: "commandCancelled",
	COMMAND_FINISHED: "commandFinished",
	COMMAND_INVALID: "commandInvalid",
	COMMAND_LOCKED: "commandLocked",
	COMMAND_STARTED: "commandStarted",
	COOLDOWN: "cooldown",
	ERROR: "error",
	IN_PROMPT: "inPrompt",
	MESSAGE_BLOCKED: "messageBlocked",
	MESSAGE_INVALID: "messageInvalid",
	MISSING_PERMISSIONS: "missingPermissions",
	SLASH_BLOCKED: "slashBlocked",
	SLASH_ERROR: "slashError",
	SLASH_FINISHED: "slashFinished",
	SLASH_MISSING_PERMISSIONS: "slashMissingPermissions",
	SLASH_NOT_FOUND: "slashNotFound",
	SLASH_STARTED: "slashStarted",
	SLASH_ONLY: "slashOnly"
} as const);

export const ContextCommandHandlerEvents = Object.freeze({
	ERROR: "error",
	FINISHED: "finished",
	NOT_FOUND: "notFound",
	STARTED: "started",
	BLOCKED: "blocked"
} as const);

export const BuiltInReasons = Object.freeze({
	CLIENT: "client",
	BOT: "bot",
	OWNER: "owner",
	SUPER_USER: "superUser",
	GUILD: "guild",
	DM: "dm",
	AUTHOR_NOT_FOUND: "authorNotFound",
	NOT_NSFW: "notNsfw"
} as const);
