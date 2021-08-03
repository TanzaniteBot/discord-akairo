/**
 * Represents an error for Akairo.
 * @param key - Error key.
 * @param args - Arguments.
 */
export default class AkairoError extends Error {
	code: string;
	get name(): string;
	constructor(key: string, ...args: (string | boolean)[]);
}
//# sourceMappingURL=AkairoError.d.ts.map
