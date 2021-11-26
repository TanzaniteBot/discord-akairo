const Messages = {
	// Module-related
	FILE_NOT_FOUND: (filename: any) => `File '${filename}' not found`,
	MODULE_NOT_FOUND: (constructor: any, id: any) => `${constructor} '${id}' does not exist`,
	ALREADY_LOADED: (constructor: any, id: any) => `${constructor} '${id}' is already loaded`,
	NOT_RELOADABLE: (constructor: any, id: any) => `${constructor} '${id}' is not reloadable`,
	INVALID_CLASS_TO_HANDLE: (given: any, expected: any) => `Class to handle ${given} is not a subclass of ${expected}`,

	// Command-related
	ALIAS_CONFLICT: (alias: any, id: any, conflict: any) => `Alias '${alias}' of '${id}' already exists on '${conflict}'`,

	// Options-related
	COMMAND_UTIL_EXPLICIT:
		"The command handler options `handleEdits` and `storeMessages` require the `commandUtil` option to be true",
	UNKNOWN_MATCH_TYPE: (match: any) => `Unknown match type '${match}'`,

	// Generic errors
	NOT_INSTANTIABLE: (constructor: any) => `${constructor} is not instantiable`,
	NOT_IMPLEMENTED: (constructor: any, method: any) => `${constructor}#${method} has not been implemented`,
	INVALID_TYPE: (name: any, expected: any, vowel = false) =>
		`Value of '${name}' was not ${vowel ? "an" : "a"} ${expected}`
};

/**
 * Represents an error for Akairo.
 */
export default class AkairoError extends Error {
	/**
	 * The error code.
	 */
	public declare code: string;

	/**
	 * @param key - Error key.
	 * @param args - Arguments.
	 */
	public constructor(key: keyof typeof Messages, ...args: (string | boolean)[]) {
		if (Messages[key] == null) throw new TypeError(`Error key '${key}' does not exist`);
		const message =
			typeof Messages[key] === "function" ? (Messages[key] as (...a: any[]) => any)(...args) : Messages[key];

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
