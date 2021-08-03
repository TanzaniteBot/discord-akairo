/**
 * Parses content.
 * @param {ContentParserOptions} options - Options.
 * @private
 */
export default class ContentParser {
    flagWords: any[];
    optionFlagWords: any[];
    quoted: boolean;
    separator: any;
    constructor({ flagWords, optionFlagWords, quoted, separator }?: {
        flagWords?: any[];
        optionFlagWords?: any[];
        quoted?: boolean;
        separator: any;
    });
    /**
     * Parses content.
     * @param {string} content - Content to parse.
     * @returns {ContentParserResult}
     */
    parse(content: any): {
        all: any[];
        phrases: any[];
        flags: any[];
        optionFlags: any[];
    };
    /**
     * Extracts the flags from argument options.
     * @param {ArgumentOptions[]} args - Argument options.
     * @returns {ExtractedFlags}
     */
    static getFlags(args: any): {
        flagWords: any[];
        optionFlagWords: any[];
    };
}
/**
 * Options for the content parser.
 * @param flagWords - Words considered flags.
 * @param optionFlagWords - Words considered option flags.
 * @param quoted - Whether to parse quotes. Defaults to `true`.
 * @param separator - Whether to parse a separator.
 */
export interface ContentParserOptions {
    flagWords?: string[];
    optionFlagWords?: string[];
    quoted?: boolean;
    separator?: string;
}
/**
 * Result of parsing.
 */
export interface ContentParserResult {
    /** All phrases and flags. */
    all: StringData[];
    /** Phrases. */
    phrases: StringData[];
    /** Flags. */
    flags: StringData[];
    /** Option flags. */
    optionFlags: StringData[];
}
/**
 * A single phrase or flag.
 */
export declare type StringData = {
    /** One of 'Phrase', 'Flag', 'OptionFlag'. */
    type: "Phrase";
    /** The value of a 'Phrase' or 'OptionFlag'. */
    value: string;
    /** The raw string with whitespace and/or separator. */
    raw: string;
} | {
    /** One of 'Phrase', 'Flag', 'OptionFlag'. */
    type: "Flag";
    /** The key of a 'Flag' or 'OptionFlag'. */
    key: string;
    /** The raw string with whitespace and/or separator. */
    raw: string;
} | {
    /** One of 'Phrase', 'Flag', 'OptionFlag'. */
    type: "OptionFlag";
    /** The key of a 'Flag' or 'OptionFlag'. */
    key: string;
    /** The value of a 'Phrase' or 'OptionFlag'. */
    value: string;
    /** The raw string with whitespace and/or separator. */
    raw: string;
};
/**
 * Flags extracted from an argument list.
 * @typedef {Object} ExtractedFlags
 * @prop {string[]} [flagWords=[]] - Words considered flags.
 * @prop {string[]} [optionFlagWords=[]] - Words considered option flags.
 * @private
 */
//# sourceMappingURL=ContentParser.d.ts.map