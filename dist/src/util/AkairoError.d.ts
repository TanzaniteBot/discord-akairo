declare const Messages: {
    FILE_NOT_FOUND: (filename: any) => string;
    MODULE_NOT_FOUND: (constructor: any, id: any) => string;
    ALREADY_LOADED: (constructor: any, id: any) => string;
    NOT_RELOADABLE: (constructor: any, id: any) => string;
    INVALID_CLASS_TO_HANDLE: (given: any, expected: any) => string;
    ALIAS_CONFLICT: (alias: any, id: any, conflict: any) => string;
    COMMAND_UTIL_EXPLICIT: string;
    UNKNOWN_MATCH_TYPE: (match: any) => string;
    NOT_INSTANTIABLE: (constructor: any) => string;
    NOT_IMPLEMENTED: (constructor: any, method: any) => string;
    INVALID_TYPE: (name: any, expected: any, vowel?: boolean) => string;
};
/**
 * Represents an error for Akairo.
 * @param key - Error key.
 * @param args - Arguments.
 */
export default class AkairoError extends Error {
    constructor(key: keyof typeof Messages, ...args: (string | boolean)[]);
    /**
     * The error code.
     */
    code: string;
    /**
     * The error name.
     */
    get name(): string;
}
export {};
//# sourceMappingURL=AkairoError.d.ts.map