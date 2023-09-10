import { z } from "zod";
import { ArgumentMatches } from "../../util/Constants.js";
import type { ArgumentOptions } from "./arguments/Argument.js";

/*
 * Grammar:
 *
 * Arguments
 *  = (Argument (WS? Argument)*)? EOF
 *
 * Argument
 *  = Flag
 *  | Phrase
 *
 * Flag
 *  = FlagWord
 *  | OptionFlagWord WS? Phrase?
 *
 * Phrase
 *  = Quote (Word | WS)* Quote?
 *  | OpenQuote (Word | OpenQuote | Quote | WS)* EndQuote?
 *  | EndQuote
 *  | Word
 *
 * FlagWord = Given
 * OptionFlagWord = Given
 * Quote = "
 * OpenQuote = “
 * EndQuote = ”
 * Word = /^\S+/ (and not in FlagWord or OptionFlagWord)
 * WS = /^\s+/
 * EOF = /^$/
 *
 * With a separator:
 *
 * Arguments
 *  = (Argument (WS? Separator WS? Argument)*)? EOF
 *
 * Argument
 *  = Flag
 *  | Phrase
 *
 * Flag
 *  = FlagWord
 *  | OptionFlagWord WS? Phrase?
 *
 * Phrase
 *  = Word (WS Word)*
 *
 * FlagWord = Given
 * OptionFlagWord = Given
 * Separator = Given
 * Word = /^\S+/ (and not in FlagWord or OptionFlagWord or equal to Separator)
 * WS = /^\s+/
 * EOF = /^$/
 */

class Tokenizer {
	public content: string;
	public flagWords: string[];
	public optionFlagWords: string[];
	public quoted: boolean;
	public separator?: string;
	public position: number;
	public state: TokenizerState;
	public tokens: Token[];

	public constructor(content: string, options: ContentParserOptions = {}) {
		z.string().parse(content);
		ContentParserOptions.parse(options);

		const { flagWords = [], optionFlagWords = [], quoted = true, separator } = options;

		this.content = content;
		this.flagWords = flagWords;
		this.optionFlagWords = optionFlagWords;
		this.quoted = quoted;
		this.separator = separator;
		this.position = 0;
		this.state = TokenizerState.Default;
		this.tokens = [];
	}

	public startsWith(str: string): boolean {
		return this.content.slice(this.position, this.position + str.length).toLowerCase() === str.toLowerCase();
	}

	public match(regex: RegExp): RegExpMatchArray | null {
		return this.content.slice(this.position).match(regex);
	}

	public slice(from: number, to: number): string {
		return this.content.slice(this.position + from, this.position + to);
	}

	public addToken(type: TokenType, value: string): void {
		this.tokens.push({ type, value });
	}

	public advance(n: number): void {
		this.position += n;
	}

	public choice(...actions: { (): boolean }[]) {
		for (const action of actions) {
			if (action.call(this)) {
				return;
			}
		}
	}

	public tokenize(): Token[] {
		while (this.position < this.content.length) {
			this.runOne();
		}

		this.addToken("EOF", "");

		return this.tokens;
	}

	public runOne(): void {
		this.choice(
			this.runWhitespace,
			this.runFlags,
			this.runOptionFlags,
			this.runQuote,
			this.runOpenQuote,
			this.runEndQuote,
			this.runSeparator,
			this.runWord
		);
	}

	public runFlags(): boolean {
		if (this.state === TokenizerState.Default) {
			for (const word of this.flagWords) {
				if (this.startsWith(word)) {
					this.addToken("FlagWord", this.slice(0, word.length));
					this.advance(word.length);
					return true;
				}
			}
		}

		return false;
	}

	public runOptionFlags(): boolean {
		if (this.state === TokenizerState.Default) {
			for (const word of this.optionFlagWords) {
				if (this.startsWith(word)) {
					this.addToken("OptionFlagWord", this.slice(0, word.length));
					this.advance(word.length);
					return true;
				}
			}
		}

		return false;
	}

	public runQuote(): boolean {
		if (this.separator == null && this.quoted && this.startsWith('"')) {
			if (this.state === TokenizerState.Quotes) {
				this.state = TokenizerState.Default;
			} else if (this.state === TokenizerState.Default) {
				this.state = TokenizerState.Quotes;
			}

			this.addToken("Quote", '"');
			this.advance(1);
			return true;
		}

		return false;
	}

	public runOpenQuote(): boolean {
		if (this.separator == null && this.quoted && this.startsWith('"')) {
			if (this.state === TokenizerState.Default) {
				this.state = TokenizerState.SpecialQuotes;
			}

			this.addToken("OpenQuote", '"');
			this.advance(1);
			return true;
		}

		return false;
	}

	public runEndQuote(): boolean {
		if (this.separator == null && this.quoted && this.startsWith("”")) {
			if (this.state === TokenizerState.SpecialQuotes) {
				this.state = TokenizerState.Default;
			}

			this.addToken("EndQuote", "”");
			this.advance(1);
			return true;
		}

		return false;
	}

	public runSeparator(): boolean {
		if (this.separator != null && this.startsWith(this.separator)) {
			this.addToken("Separator", this.slice(0, this.separator.length));
			this.advance(this.separator.length);
			return true;
		}

		return false;
	}

	public runWord(): boolean {
		const wordRegex =
			this.state === TokenizerState.Default ? /^\S+/ : this.state === TokenizerState.Quotes ? /^[^\s"]+/ : /^[^\s”]+/;

		const wordMatch = this.match(wordRegex);
		if (wordMatch) {
			if (this.separator) {
				if (wordMatch[0].toLowerCase() === this.separator.toLowerCase()) {
					return false;
				}

				const index = wordMatch[0].indexOf(this.separator);
				if (index === -1) {
					this.addToken("Word", wordMatch[0]);
					this.advance(wordMatch[0].length);
					return true;
				}

				const actual = wordMatch[0].slice(0, index);
				this.addToken("Word", actual);
				this.advance(actual.length);
				return true;
			}

			this.addToken("Word", wordMatch[0]);
			this.advance(wordMatch[0].length);
			return true;
		}

		return false;
	}

	public runWhitespace(): boolean {
		const wsMatch = this.match(/^\s+/);
		if (wsMatch) {
			this.addToken("WS", wsMatch[0]);
			this.advance(wsMatch[0].length);
			return true;
		}

		return false;
	}
}

type TokenType = "FlagWord" | "OptionFlagWord" | "Quote" | "OpenQuote" | "EndQuote" | "Word" | "WS" | "EOF" | "Separator";
const TokenType = z.enum(["FlagWord", "OptionFlagWord", "Quote", "OpenQuote", "EndQuote", "Word", "WS", "EOF", "Separator"]);

type Token = {
	type: TokenType;
	value: string;
};
const Token = z
	.object({
		type: TokenType,
		value: z.string()
	})
	.passthrough();

const enum TokenizerState {
	Default = 0,
	/** ("") */
	Quotes = 1,
	/** (“”) */
	SpecialQuotes = 2
}

class Parser {
	public tokens: Token[];
	public separated: boolean;
	public position: number;

	/**
	 * Phrases are `{ type: 'Phrase', value, raw }`.
	 * Flags are `{ type: 'Flag', key, raw }`.
	 * Option flags are `{ type: 'OptionFlag', key, value, raw }`.
	 * The `all` property is partitioned into `phrases`, `flags`, and `optionFlags`.
	 */
	public results: ContentParserResult;

	public constructor(tokens: Token[], options: ParserOptions) {
		Token.array().parse(tokens);
		ParserOptions.parse(options);

		const { separated } = options;

		this.tokens = tokens;
		this.separated = separated;
		this.position = 0;

		this.results = {
			all: [],
			phrases: [],
			flags: [],
			optionFlags: []
		};
	}

	public next(): void {
		this.position++;
	}

	public lookaheadN(n: number, ...types: TokenType[]): boolean {
		return this.tokens[this.position + n] != null && types.includes(this.tokens[this.position + n].type);
	}

	public lookahead(...types: TokenType[]): boolean {
		return this.lookaheadN(0, ...types);
	}

	public match(...types: TokenType[]): Token {
		if (this.lookahead(...types)) {
			this.next();
			return this.tokens[this.position - 1];
		}

		throw new Error(
			`Unexpected token ${this.tokens[this.position].value} of type ${this.tokens[this.position].type} (this should never happen)`
		);
	}

	public parse(): ContentParserResult {
		// -1 for EOF.
		while (this.position < this.tokens.length - 1) {
			this.runArgument();
		}

		this.match("EOF");
		return this.results;
	}

	public runArgument(): void {
		const leading = this.lookahead("WS") ? this.match("WS").value : "";
		if (this.lookahead("FlagWord", "OptionFlagWord")) {
			const parsed = this.parseFlag();
			const trailing = this.lookahead("WS") ? this.match("WS").value : "";
			const separator = this.lookahead("Separator") ? this.match("Separator").value : "";
			parsed.raw = `${leading}${parsed.raw}${trailing}${separator}`;
			this.results.all.push(parsed);
			if (parsed.type === "Flag") {
				this.results.flags.push(parsed);
			} else {
				this.results.optionFlags.push(parsed);
			}

			return;
		}

		const parsed = this.parsePhrase();
		const trailing = this.lookahead("WS") ? this.match("WS").value : "";
		const separator = this.lookahead("Separator") ? this.match("Separator").value : "";
		parsed.raw = `${leading}${parsed.raw}${trailing}${separator}`;
		this.results.all.push(parsed);
		this.results.phrases.push(parsed);
	}

	public parseFlag(): ParsedFlag | ParsedOptionFlag {
		if (this.lookahead("FlagWord")) {
			const flag = this.match("FlagWord");
			const parsed = { type: "Flag", key: flag.value, raw: flag.value } satisfies ParsedFlag;
			return parsed;
		}

		// Otherwise, `this.lookahead('OptionFlagWord')` should be true.
		const flag = this.match("OptionFlagWord");
		const parsed = {
			type: "OptionFlag",
			key: flag.value,
			value: "",
			raw: flag.value
		} satisfies ParsedOptionFlag;
		const ws = this.lookahead("WS") ? this.match("WS") : null;
		if (ws != null) {
			parsed.raw += ws.value;
		}

		const phrase = this.lookahead("Quote", "OpenQuote", "EndQuote", "Word") ? this.parsePhrase() : null;

		if (phrase != null) {
			parsed.value = phrase.value;
			parsed.raw += phrase.raw;
		}

		return parsed;
	}

	public parsePhrase(): ParsedPhrase {
		if (!this.separated) {
			if (this.lookahead("Quote")) {
				const parsed = { type: "Phrase", value: "", raw: "" } satisfies ParsedPhrase;
				const openQuote = this.match("Quote");
				parsed.raw += openQuote.value;
				while (this.lookahead("Word", "WS")) {
					const match = this.match("Word", "WS");
					parsed.value += match.value;
					parsed.raw += match.value;
				}

				const endQuote = this.lookahead("Quote") ? this.match("Quote") : null;
				if (endQuote != null) {
					parsed.raw += endQuote.value;
				}

				return parsed;
			}

			if (this.lookahead("OpenQuote")) {
				const parsed = { type: "Phrase", value: "", raw: "" } satisfies ParsedPhrase;
				const openQuote = this.match("OpenQuote");
				parsed.raw += openQuote.value;
				while (this.lookahead("Word", "WS")) {
					const match = this.match("Word", "WS");
					if (match.type === "Word") {
						parsed.value += match.value;
						parsed.raw += match.value;
					} else {
						parsed.raw += match.value;
					}
				}

				const endQuote = this.lookahead("EndQuote") ? this.match("EndQuote") : null;
				if (endQuote != null) {
					parsed.raw += endQuote.value;
				}

				return parsed;
			}

			if (this.lookahead("EndQuote")) {
				const endQuote = this.match("EndQuote");
				const parsed = {
					type: "Phrase",
					value: endQuote.value,
					raw: endQuote.value
				} satisfies ParsedPhrase;
				return parsed;
			}
		}

		if (this.separated) {
			const init = this.match("Word");
			const parsed = { type: "Phrase", value: init.value, raw: init.value } satisfies ParsedPhrase;
			while (this.lookahead("WS") && this.lookaheadN(1, "Word")) {
				const ws = this.match("WS");
				const word = this.match("Word");
				parsed.value += ws.value + word.value;
			}

			parsed.raw = parsed.value;
			return parsed;
		}

		const word = this.match("Word");
		const parsed = { type: "Phrase", value: word.value, raw: word.value } satisfies ParsedPhrase;
		return parsed;
	}
}

export type ParserOptions = {
	separated: boolean;
};
export const ParserOptions = z
	.object({
		separated: z.boolean()
	})
	.passthrough();

/**
 * Parses content.
 */
export class ContentParser {
	/**
	 * Words considered flags.
	 */
	public flagWords: string[];

	/**
	 * Words considered option flags.
	 */
	public optionFlagWords: string[];

	/**
	 * Whether to parse quotes.
	 * @default true
	 */
	public quoted: boolean;

	/**
	 * Whether to parse a separator.
	 */
	public separator?: string;

	/**
	 * @param options - Options.
	 */
	public constructor(options: ContentParserOptions = {}) {
		ContentParserOptions.parse(options);

		const { flagWords = [], optionFlagWords = [], quoted = true, separator } = options;

		this.flagWords = flagWords.sort((a, b) => b.length - a.length);
		this.optionFlagWords = optionFlagWords.sort((a, b) => b.length - a.length);
		this.quoted = Boolean(quoted);
		this.separator = separator;
	}

	/**
	 * Parses content.
	 * @param content - Content to parse.
	 */
	public parse(content: string): ContentParserResult {
		const tokens = new Tokenizer(content, {
			flagWords: this.flagWords,
			optionFlagWords: this.optionFlagWords,
			quoted: this.quoted,
			separator: this.separator
		}).tokenize();

		return new Parser(tokens, { separated: this.separator != null }).parse();
	}

	/**
	 * Extracts the flags from argument options.
	 * @param args - Argument options.
	 */
	public static getFlags(args: ArgumentOptions[]): ExtractedFlags {
		const res = {
			flagWords: <string[]>[],
			optionFlagWords: <string[]>[]
		};

		for (const arg of args) {
			const arr = res[arg.match === ArgumentMatches.FLAG ? "flagWords" : "optionFlagWords"];
			if (arg.match === ArgumentMatches.FLAG || arg.match === ArgumentMatches.OPTION) {
				if (Array.isArray(arg.flag)) {
					arr.push(...arg.flag);
				} else {
					arr.push(arg.flag!);
				}
			}
		}

		return res;
	}
}

/**
 * Options for the content parser.
 */
export type ContentParserOptions = {
	/**
	 * Words considered flags.
	 * @default []
	 */
	flagWords?: string[];

	/**
	 * Words considered option flags.
	 * @default []
	 */
	optionFlagWords?: string[];

	/**
	 * Whether to parse quotes.
	 * @default true
	 */
	quoted?: boolean;

	/**
	 * Whether to parse a separator.
	 */
	separator?: string;
};
export const ContentParserOptions = z
	.object({
		flagWords: z.string().array().optional(),
		optionFlagWords: z.string().array().optional(),
		quoted: z.boolean().optional(),
		separator: z.string().optional()
	})
	.passthrough();

type BaseParsed = {
	/**
	 * The thing that was parsed.
	 */
	type: "Phrase" | "Flag" | "OptionFlag";

	/**
	 * The raw string with whitespace and/or separator.
	 */
	raw: string;
};
const BaseParsed = z
	.object({
		// type is implemented independently
		raw: z.string()
	})
	.passthrough();

/**
 * A parsed phrase.
 */
type ParsedPhrase = BaseParsed & {
	type: "Phrase";

	/**
	 * The value of the phrase.
	 */
	value: string;
};
const ParsedPhrase = BaseParsed.extend({
	type: z.literal("Phrase"),
	value: z.string()
}).passthrough();

/**
 * A parsed flag.
 */
type ParsedFlag = BaseParsed & {
	type: "Flag";

	/**
	 * The key of the flag.
	 */
	key: string;
};
const ParsedFlag = BaseParsed.extend({
	type: z.literal("Flag"),
	key: z.string()
}).passthrough();

/**
 * A parsed option flag.
 */
type ParsedOptionFlag = BaseParsed & {
	type: "OptionFlag";

	/**
	 * The key of the option flag.
	 */
	key: string;

	/**
	 * The value of the option flag.
	 */
	value: string;
};
const ParsedOptionFlag = BaseParsed.extend({
	type: z.literal("OptionFlag"),
	key: z.string(),
	value: z.string()
}).passthrough();

/**
 * Flags extracted from an argument list.
 */
export type ExtractedFlags = {
	/**
	 * Words considered flags.
	 */
	flagWords: string[];

	/**
	 * Words considered option flags.
	 */
	optionFlagWords: string[];
};
export const ExtractedFlags = z
	.object({
		flagWords: z.string().array(),
		optionFlagWords: z.string().array()
	})
	.passthrough();

/**
 * Result of parsing.
 */
export type ContentParserResult = {
	/**
	 * All phrases and flags.
	 */
	all: (ParsedPhrase | ParsedFlag | ParsedOptionFlag)[];

	/**
	 * Phrases.
	 */
	phrases: ParsedPhrase[];

	/**
	 * Flags.
	 */
	flags: ParsedFlag[];

	/**
	 * Option flags.
	 */
	optionFlags: ParsedOptionFlag[];
};
export const ContentParserResult = z
	.object({
		all: z.union([ParsedPhrase, ParsedFlag, ParsedOptionFlag]).array(),
		phrases: ParsedPhrase.array(),
		flags: ParsedFlag.array(),
		optionFlags: ParsedOptionFlag.array()
	})
	.passthrough();
