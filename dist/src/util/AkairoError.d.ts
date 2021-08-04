/**
 * Represents an error for Akairo.
 * @param key - Error key.
 * @param args - Arguments.
 */
export default class AkairoError extends Error {
    constructor(key: string, ...args: (string | boolean)[]);
    /**
     * The error code.
     */
    code: string;
    /**
     * The error name.
     */
    get name(): string;
}
//# sourceMappingURL=AkairoError.d.ts.map