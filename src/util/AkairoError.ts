import type { SlashOption } from "../struct/commands/Command.js";

const Messages = {
	// Module-related
	FILE_NOT_FOUND: (filename: string) => `File '${filename}' not found`,
	MODULE_NOT_FOUND: (constructor: string, id: string) => `${constructor} '${id}' does not exist`,
	ALREADY_LOADED: (constructor: string, id: string) => `${constructor} '${id}' is already loaded`,
	NOT_RELOADABLE: (constructor: string, id: string) => `${constructor} '${id}' is not reloadable`,
	INVALID_CLASS_TO_HANDLE: (given: string, expected: string) => `Class to handle ${given} is not a subclass of ${expected}`,

	// Command-related
	ALIAS_CONFLICT: (alias: string, id: string, conflict: string) => `Alias '${alias}' of '${id}' already exists on '${conflict}'`,
	UNEXPECTED_SLASH_COMMAND_TYPE: (type: SlashOption["type"]) =>
		`Unexpected slash command type '${type}', where there is a subcommand and or subcommandGroup.`,

	// Options-related
	COMMAND_UTIL_EXPLICIT:
		"The command handler options `handleEdits` and `storeMessages` require the `commandUtil` option to be true",
	UNKNOWN_MATCH_TYPE: (match: string) => `Unknown match type '${match}'`,

	// Generic errors
	NOT_INSTANTIABLE: (constructor: string) => `${constructor} is not instantiable`,
	NOT_IMPLEMENTED: (constructor: string, method: string) => `${constructor}#${method} has not been implemented`,
	INVALID_TYPE: (name: string, expected: string, vowel = false) => `Value of '${name}' was not ${vowel ? "an" : "a"} ${expected}`
};

interface MessageArgs {
	FILE_NOT_FOUND: [filename: string];
	MODULE_NOT_FOUND: [constructor: string, id: string];
	ALREADY_LOADED: [constructor: string, id: string];
	NOT_RELOADABLE: [constructor: string, id: string];
	INVALID_CLASS_TO_HANDLE: [given: string, expected: string];
	ALIAS_CONFLICT: [alias: string, id: string, conflict: string];
	UNEXPECTED_SLASH_COMMAND_TYPE: [type: SlashOption["type"]];
	COMMAND_UTIL_EXPLICIT: [];
	UNKNOWN_MATCH_TYPE: [match: string];
	NOT_INSTANTIABLE: [constructor: string];
	NOT_IMPLEMENTED: [constructor: string, method: string];
	INVALID_TYPE: [name: string, expected: string, vowel: boolean];
}

/**
 * Represents an error for Akairo.
 */
export class AkairoError<K extends keyof typeof Messages> extends Error {
	/**
	 * The error code.
	 */
	public code: string;

	/**
	 * @param key - Error key.
	 * @param args - Arguments.
	 */
	public constructor(key: K, ...args: MessageArgs[K]) {
		if (Messages[key] == null) throw new TypeError(`Error key '${key}' does not exist`);
		const message = typeof Messages[key] === "function" ? (Messages[key] as (...a: any[]) => any)(...args) : Messages[key];

		super(message);
		this.code = key;
	}

	/**
	 * The error name.
	 */
	public override get name() {
		return `AkairoError [${this.code}]`;
	}
}
