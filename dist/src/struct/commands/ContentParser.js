"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("../../util/Constants");
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
    content;
    flagWords;
    optionFlagWords;
    quoted;
    separator;
    position;
    state;
    tokens;
    constructor(content, 
    // @ts-expect-error
    { flagWords = [], optionFlagWords = [], quoted = true, separator } = {}) {
        this.content = content;
        this.flagWords = flagWords;
        this.optionFlagWords = optionFlagWords;
        this.quoted = quoted;
        this.separator = separator;
        this.position = 0;
        // 0 -> Default, 1 -> Quotes (""), 2 -> Special Quotes (“”)
        this.state = 0;
        this.tokens = [];
    }
    startsWith(str) {
        return (this.content
            .slice(this.position, this.position + str.length)
            .toLowerCase() === str.toLowerCase());
    }
    match(regex) {
        return this.content.slice(this.position).match(regex);
    }
    slice(from, to) {
        return this.content.slice(this.position + from, this.position + to);
    }
    addToken(type, value) {
        this.tokens.push({ type, value });
    }
    advance(n) {
        this.position += n;
    }
    choice(...actions) {
        for (const action of actions) {
            if (action.call(this)) {
                return;
            }
        }
    }
    tokenize() {
        while (this.position < this.content.length) {
            this.runOne();
        }
        this.addToken("EOF", "");
        return this.tokens;
    }
    runOne() {
        this.choice(this.runWhitespace, this.runFlags, this.runOptionFlags, this.runQuote, this.runOpenQuote, this.runEndQuote, this.runSeparator, this.runWord);
    }
    runFlags() {
        if (this.state === 0) {
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
    runOptionFlags() {
        if (this.state === 0) {
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
    runQuote() {
        if (this.separator == null && this.quoted && this.startsWith('"')) {
            if (this.state === 1) {
                this.state = 0;
            }
            else if (this.state === 0) {
                this.state = 1;
            }
            this.addToken("Quote", '"');
            this.advance(1);
            return true;
        }
        return false;
    }
    runOpenQuote() {
        if (this.separator == null && this.quoted && this.startsWith('"')) {
            if (this.state === 0) {
                this.state = 2;
            }
            this.addToken("OpenQuote", '"');
            this.advance(1);
            return true;
        }
        return false;
    }
    runEndQuote() {
        if (this.separator == null && this.quoted && this.startsWith("”")) {
            if (this.state === 2) {
                this.state = 0;
            }
            this.addToken("EndQuote", "”");
            this.advance(1);
            return true;
        }
        return false;
    }
    runSeparator() {
        if (this.separator != null && this.startsWith(this.separator)) {
            this.addToken("Separator", this.slice(0, this.separator.length));
            this.advance(this.separator.length);
            return true;
        }
        return false;
    }
    runWord() {
        const wordRegex = this.state === 0 ? /^\S+/ : this.state === 1 ? /^[^\s"]+/ : /^[^\s”]+/;
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
    runWhitespace() {
        const wsMatch = this.match(/^\s+/);
        if (wsMatch) {
            this.addToken("WS", wsMatch[0]);
            this.advance(wsMatch[0].length);
            return true;
        }
        return false;
    }
}
class Parser {
    tokens;
    separated;
    position;
    results;
    constructor(tokens, { separated }) {
        this.tokens = tokens;
        this.separated = separated;
        this.position = 0;
        /*
         * Phrases are `{ type: 'Phrase', value, raw }`.
         * Flags are `{ type: 'Flag', key, raw }`.
         * Option flags are `{ type: 'OptionFlag', key, value, raw }`.
         * The `all` property is partitioned into `phrases`, `flags`, and `optionFlags`.
         */
        /**
         * @typedef {Object} results
         * @prop {any[]} all
         * @prop {any[]} phrases
         * @prop {any[]} flags
         * @prop {any[]} optionFlags
         */
        /** @type {results} */
        this.results = {
            all: [],
            phrases: [],
            flags: [],
            optionFlags: []
        };
    }
    next() {
        this.position++;
    }
    lookaheadN(n, ...types) {
        return (this.tokens[this.position + n] != null &&
            types.includes(this.tokens[this.position + n].type));
    }
    lookahead(...types) {
        return this.lookaheadN(0, ...types);
    }
    match(...types) {
        if (this.lookahead(...types)) {
            this.next();
            return this.tokens[this.position - 1];
        }
        throw new Error(`Unexpected token ${this.tokens[this.position].value} of type ${this.tokens[this.position].type} (this should never happen)`);
    }
    parse() {
        // -1 for EOF.
        while (this.position < this.tokens.length - 1) {
            this.runArgument();
        }
        this.match("EOF");
        return this.results;
    }
    runArgument() {
        const leading = this.lookahead("WS") ? this.match("WS").value : "";
        if (this.lookahead("FlagWord", "OptionFlagWord")) {
            const parsed = this.parseFlag();
            const trailing = this.lookahead("WS") ? this.match("WS").value : "";
            const separator = this.lookahead("Separator")
                ? this.match("Separator").value
                : "";
            parsed.raw = `${leading}${parsed.raw}${trailing}${separator}`;
            this.results.all.push(parsed);
            if (parsed.type === "Flag") {
                this.results.flags.push(parsed);
            }
            else {
                this.results.optionFlags.push(parsed);
            }
            return;
        }
        const parsed = this.parsePhrase();
        const trailing = this.lookahead("WS") ? this.match("WS").value : "";
        const separator = this.lookahead("Separator")
            ? this.match("Separator").value
            : "";
        parsed.raw = `${leading}${parsed.raw}${trailing}${separator}`;
        this.results.all.push(parsed);
        this.results.phrases.push(parsed);
    }
    parseFlag() {
        if (this.lookahead("FlagWord")) {
            const flag = this.match("FlagWord");
            const parsed = { type: "Flag", key: flag.value, raw: flag.value };
            return parsed;
        }
        // Otherwise, `this.lookahead('OptionFlagWord')` should be true.
        const flag = this.match("OptionFlagWord");
        const parsed = {
            type: "OptionFlag",
            key: flag.value,
            value: "",
            raw: flag.value
        };
        const ws = this.lookahead("WS") ? this.match("WS") : null;
        if (ws != null) {
            parsed.raw += ws.value;
        }
        const phrase = this.lookahead("Quote", "OpenQuote", "EndQuote", "Word")
            ? this.parsePhrase()
            : null;
        if (phrase != null) {
            parsed.value = phrase.value;
            parsed.raw += phrase.raw;
        }
        return parsed;
    }
    parsePhrase() {
        if (!this.separated) {
            if (this.lookahead("Quote")) {
                const parsed = { type: "Phrase", value: "", raw: "" };
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
                const parsed = { type: "Phrase", value: "", raw: "" };
                const openQuote = this.match("OpenQuote");
                parsed.raw += openQuote.value;
                while (this.lookahead("Word", "WS")) {
                    const match = this.match("Word", "WS");
                    if (match.type === "Word") {
                        parsed.value += match.value;
                        parsed.raw += match.value;
                    }
                    else {
                        parsed.raw += match.value;
                    }
                }
                const endQuote = this.lookahead("EndQuote")
                    ? this.match("EndQuote")
                    : null;
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
                };
                return parsed;
            }
        }
        if (this.separated) {
            const init = this.match("Word");
            const parsed = { type: "Phrase", value: init.value, raw: init.value };
            while (this.lookahead("WS") && this.lookaheadN(1, "Word")) {
                const ws = this.match("WS");
                const word = this.match("Word");
                parsed.value += ws.value + word.value;
            }
            parsed.raw = parsed.value;
            return parsed;
        }
        const word = this.match("Word");
        const parsed = { type: "Phrase", value: word.value, raw: word.value };
        return parsed;
    }
}
/**
 * Parses content.
 * @param {ContentParserOptions} options - Options.
 * @private
 */
class ContentParser {
    flagWords;
    optionFlagWords;
    quoted;
    separator;
    constructor({ flagWords = [], optionFlagWords = [], quoted = true, 
    // @ts-expect-error
    separator } = {}) {
        this.flagWords = flagWords;
        this.flagWords.sort((a, b) => b.length - a.length);
        this.optionFlagWords = optionFlagWords;
        this.optionFlagWords.sort((a, b) => b.length - a.length);
        this.quoted = Boolean(quoted);
        this.separator = separator;
    }
    /**
     * Parses content.
     * @param {string} content - Content to parse.
     * @returns {ContentParserResult}
     */
    parse(content) {
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
     * @param {ArgumentOptions[]} args - Argument options.
     * @returns {ExtractedFlags}
     */
    static getFlags(args) {
        const res = {
            flagWords: [],
            optionFlagWords: []
        };
        for (const arg of args) {
            const arr = res[arg.match === Constants_1.ArgumentMatches.FLAG ? "flagWords" : "optionFlagWords"];
            if (arg.match === Constants_1.ArgumentMatches.FLAG ||
                arg.match === Constants_1.ArgumentMatches.OPTION) {
                if (Array.isArray(arg.flag)) {
                    arr.push(...arg.flag);
                }
                else {
                    arr.push(arg.flag);
                }
            }
        }
        return res;
    }
}
exports.default = ContentParser;
/**
 * Flags extracted from an argument list.
 * @typedef {Object} ExtractedFlags
 * @prop {string[]} [flagWords=[]] - Words considered flags.
 * @prop {string[]} [optionFlagWords=[]] - Words considered option flags.
 * @private
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGVudFBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvQ29udGVudFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUF1RDtBQUV2RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbURHO0FBRUgsTUFBTSxTQUFTO0lBQ1AsT0FBTyxDQUFTO0lBQ2hCLFNBQVMsQ0FBVztJQUNwQixlQUFlLENBQVc7SUFDMUIsTUFBTSxDQUFVO0lBQ2hCLFNBQVMsQ0FBUztJQUNsQixRQUFRLENBQVM7SUFDakIsS0FBSyxDQUFTO0lBQ2QsTUFBTSxDQUFRO0lBRXJCLFlBQ0MsT0FBTztJQUNQLG1CQUFtQjtJQUNuQixFQUFFLFNBQVMsR0FBRyxFQUFFLEVBQUUsZUFBZSxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUU7UUFFdkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsMkRBQTJEO1FBQzNELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVELFVBQVUsQ0FBQyxHQUFHO1FBQ2IsT0FBTyxDQUNOLElBQUksQ0FBQyxPQUFPO2FBQ1YsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENB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RztJQUNILE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtRQUNuQixNQUFNLEdBQUcsR0FBRztZQUNYLFNBQVMsRUFBRSxFQUFFO1lBQ2IsZUFBZSxFQUFFLEVBQUU7U0FDbkIsQ0FBQztRQUVGLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ3ZCLE1BQU0sR0FBRyxHQUNSLEdBQUcsQ0FDRixHQUFHLENBQUMsS0FBSyxLQUFLLDJCQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUNwRSxDQUFDO1lBQ0gsSUFDQyxHQUFHLENBQUMsS0FBSyxLQUFLLDJCQUFlLENBQUMsSUFBSTtnQkFDbEMsR0FBRyxDQUFDLEtBQUssS0FBSywyQkFBZSxDQUFDLE1BQU0sRUFDbkM7Z0JBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdEI7cUJBQU07b0JBQ04sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ25CO2FBQ0Q7U0FDRDtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNEO0FBcEVELGdDQW9FQztBQXVFRDs7Ozs7O0dBTUciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcmd1bWVudE1hdGNoZXMgfSBmcm9tIFwiLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcblxuLypcbiAqIEdyYW1tYXI6XG4gKlxuICogQXJndW1lbnRzXG4gKiAgPSAoQXJndW1lbnQgKFdTPyBBcmd1bWVudCkqKT8gRU9GXG4gKlxuICogQXJndW1lbnRcbiAqICA9IEZsYWdcbiAqICB8IFBocmFzZVxuICpcbiAqIEZsYWdcbiAqICA9IEZsYWdXb3JkXG4gKiAgfCBPcHRpb25GbGFnV29yZCBXUz8gUGhyYXNlP1xuICpcbiAqIFBocmFzZVxuICogID0gUXVvdGUgKFdvcmQgfCBXUykqIFF1b3RlP1xuICogIHwgT3BlblF1b3RlIChXb3JkIHwgT3BlblF1b3RlIHwgUXVvdGUgfCBXUykqIEVuZFF1b3RlP1xuICogIHwgRW5kUXVvdGVcbiAqICB8IFdvcmRcbiAqXG4gKiBGbGFnV29yZCA9IEdpdmVuXG4gKiBPcHRpb25GbGFnV29yZCA9IEdpdmVuXG4gKiBRdW90ZSA9IFwiXG4gKiBPcGVuUXVvdGUgPSDigJxcbiAqIEVuZFF1b3RlID0g4oCdXG4gKiBXb3JkID0gL15cXFMrLyAoYW5kIG5vdCBpbiBGbGFnV29yZCBvciBPcHRpb25GbGFnV29yZClcbiAqIFdTID0gL15cXHMrL1xuICogRU9GID0gL14kL1xuICpcbiAqIFdpdGggYSBzZXBhcmF0b3I6XG4gKlxuICogQXJndW1lbnRzXG4gKiAgPSAoQXJndW1lbnQgKFdTPyBTZXBhcmF0b3IgV1M/IEFyZ3VtZW50KSopPyBFT0ZcbiAqXG4gKiBBcmd1bWVudFxuICogID0gRmxhZ1xuICogIHwgUGhyYXNlXG4gKlxuICogRmxhZ1xuICogID0gRmxhZ1dvcmRcbiAqICB8IE9wdGlvbkZsYWdXb3JkIFdTPyBQaHJhc2U/XG4gKlxuICogUGhyYXNlXG4gKiAgPSBXb3JkIChXUyBXb3JkKSpcbiAqXG4gKiBGbGFnV29yZCA9IEdpdmVuXG4gKiBPcHRpb25GbGFnV29yZCA9IEdpdmVuXG4gKiBTZXBhcmF0b3IgPSBHaXZlblxuICogV29yZCA9IC9eXFxTKy8gKGFuZCBub3QgaW4gRmxhZ1dvcmQgb3IgT3B0aW9uRmxhZ1dvcmQgb3IgZXF1YWwgdG8gU2VwYXJhdG9yKVxuICogV1MgPSAvXlxccysvXG4gKiBFT0YgPSAvXiQvXG4gKi9cblxuY2xhc3MgVG9rZW5pemVyIHtcblx0cHVibGljIGNvbnRlbnQ6IHN0cmluZztcblx0cHVibGljIGZsYWdXb3Jkczogc3RyaW5nW107XG5cdHB1YmxpYyBvcHRpb25GbGFnV29yZHM6IHN0cmluZ1tdO1xuXHRwdWJsaWMgcXVvdGVkOiBib29sZWFuO1xuXHRwdWJsaWMgc2VwYXJhdG9yOiBzdHJpbmc7XG5cdHB1YmxpYyBwb3NpdGlvbjogbnVtYmVyO1xuXHRwdWJsaWMgc3RhdGU6IG51bWJlcjtcblx0cHVibGljIHRva2VuczogYW55W107XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0Y29udGVudCxcblx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0eyBmbGFnV29yZHMgPSBbXSwgb3B0aW9uRmxhZ1dvcmRzID0gW10sIHF1b3RlZCA9IHRydWUsIHNlcGFyYXRvciB9ID0ge31cblx0KSB7XG5cdFx0dGhpcy5jb250ZW50ID0gY29udGVudDtcblx0XHR0aGlzLmZsYWdXb3JkcyA9IGZsYWdXb3Jkcztcblx0XHR0aGlzLm9wdGlvbkZsYWdXb3JkcyA9IG9wdGlvbkZsYWdXb3Jkcztcblx0XHR0aGlzLnF1b3RlZCA9IHF1b3RlZDtcblx0XHR0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcblx0XHR0aGlzLnBvc2l0aW9uID0gMDtcblx0XHQvLyAwIC0+IERlZmF1bHQsIDEgLT4gUXVvdGVzIChcIlwiKSwgMiAtPiBTcGVjaWFsIFF1b3RlcyAo4oCc4oCdKVxuXHRcdHRoaXMuc3RhdGUgPSAwO1xuXHRcdHRoaXMudG9rZW5zID0gW107XG5cdH1cblxuXHRzdGFydHNXaXRoKHN0cikge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0aGlzLmNvbnRlbnRcblx0XHRcdFx0LnNsaWNlKHRoaXMucG9zaXRpb24sIHRoaXMucG9zaXRpb24gKyBzdHIubGVuZ3RoKVxuXHRcdFx0XHQudG9Mb3dlckNhc2UoKSA9PT0gc3RyLnRvTG93ZXJDYXNlKClcblx0XHQpO1xuXHR9XG5cblx0bWF0Y2gocmVnZXgpIHtcblx0XHRyZXR1cm4gdGhpcy5jb250ZW50LnNsaWNlKHRoaXMucG9zaXRpb24pLm1hdGNoKHJlZ2V4KTtcblx0fVxuXG5cdHNsaWNlKGZyb20sIHRvKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29udGVudC5zbGljZSh0aGlzLnBvc2l0aW9uICsgZnJvbSwgdGhpcy5wb3NpdGlvbiArIHRvKTtcblx0fVxuXG5cdGFkZFRva2VuKHR5cGUsIHZhbHVlKSB7XG5cdFx0dGhpcy50b2tlbnMucHVzaCh7IHR5cGUsIHZhbHVlIH0pO1xuXHR9XG5cblx0YWR2YW5jZShuKSB7XG5cdFx0dGhpcy5wb3NpdGlvbiArPSBuO1xuXHR9XG5cblx0Y2hvaWNlKC4uLmFjdGlvbnMpIHtcblx0XHRmb3IgKGNvbnN0IGFjdGlvbiBvZiBhY3Rpb25zKSB7XG5cdFx0XHRpZiAoYWN0aW9uLmNhbGwodGhpcykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHRva2VuaXplKCkge1xuXHRcdHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5jb250ZW50Lmxlbmd0aCkge1xuXHRcdFx0dGhpcy5ydW5PbmUoKTtcblx0XHR9XG5cblx0XHR0aGlzLmFkZFRva2VuKFwiRU9GXCIsIFwiXCIpO1xuXHRcdHJldHVybiB0aGlzLnRva2Vucztcblx0fVxuXG5cdHJ1bk9uZSgpIHtcblx0XHR0aGlzLmNob2ljZShcblx0XHRcdHRoaXMucnVuV2hpdGVzcGFjZSxcblx0XHRcdHRoaXMucnVuRmxhZ3MsXG5cdFx0XHR0aGlzLnJ1bk9wdGlvbkZsYWdzLFxuXHRcdFx0dGhpcy5ydW5RdW90ZSxcblx0XHRcdHRoaXMucnVuT3BlblF1b3RlLFxuXHRcdFx0dGhpcy5ydW5FbmRRdW90ZSxcblx0XHRcdHRoaXMucnVuU2VwYXJhdG9yLFxuXHRcdFx0dGhpcy5ydW5Xb3JkXG5cdFx0KTtcblx0fVxuXG5cdHJ1bkZsYWdzKCkge1xuXHRcdGlmICh0aGlzLnN0YXRlID09PSAwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHdvcmQgb2YgdGhpcy5mbGFnV29yZHMpIHtcblx0XHRcdFx0aWYgKHRoaXMuc3RhcnRzV2l0aCh3b3JkKSkge1xuXHRcdFx0XHRcdHRoaXMuYWRkVG9rZW4oXCJGbGFnV29yZFwiLCB0aGlzLnNsaWNlKDAsIHdvcmQubGVuZ3RoKSk7XG5cdFx0XHRcdFx0dGhpcy5hZHZhbmNlKHdvcmQubGVuZ3RoKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJ1bk9wdGlvbkZsYWdzKCkge1xuXHRcdGlmICh0aGlzLnN0YXRlID09PSAwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHdvcmQgb2YgdGhpcy5vcHRpb25GbGFnV29yZHMpIHtcblx0XHRcdFx0aWYgKHRoaXMuc3RhcnRzV2l0aCh3b3JkKSkge1xuXHRcdFx0XHRcdHRoaXMuYWRkVG9rZW4oXCJPcHRpb25GbGFnV29yZFwiLCB0aGlzLnNsaWNlKDAsIHdvcmQubGVuZ3RoKSk7XG5cdFx0XHRcdFx0dGhpcy5hZHZhbmNlKHdvcmQubGVuZ3RoKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJ1blF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnNlcGFyYXRvciA9PSBudWxsICYmIHRoaXMucXVvdGVkICYmIHRoaXMuc3RhcnRzV2l0aCgnXCInKSkge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUgPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IDA7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IDE7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJRdW90ZVwiLCAnXCInKTtcblx0XHRcdHRoaXMuYWR2YW5jZSgxKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJ1bk9wZW5RdW90ZSgpIHtcblx0XHRpZiAodGhpcy5zZXBhcmF0b3IgPT0gbnVsbCAmJiB0aGlzLnF1b3RlZCAmJiB0aGlzLnN0YXJ0c1dpdGgoJ1wiJykpIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlID09PSAwKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSAyO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmFkZFRva2VuKFwiT3BlblF1b3RlXCIsICdcIicpO1xuXHRcdFx0dGhpcy5hZHZhbmNlKDEpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cnVuRW5kUXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMuc2VwYXJhdG9yID09IG51bGwgJiYgdGhpcy5xdW90ZWQgJiYgdGhpcy5zdGFydHNXaXRoKFwi4oCdXCIpKSB7XG5cdFx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gMikge1xuXHRcdFx0XHR0aGlzLnN0YXRlID0gMDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5hZGRUb2tlbihcIkVuZFF1b3RlXCIsIFwi4oCdXCIpO1xuXHRcdFx0dGhpcy5hZHZhbmNlKDEpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cnVuU2VwYXJhdG9yKCkge1xuXHRcdGlmICh0aGlzLnNlcGFyYXRvciAhPSBudWxsICYmIHRoaXMuc3RhcnRzV2l0aCh0aGlzLnNlcGFyYXRvcikpIHtcblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJTZXBhcmF0b3JcIiwgdGhpcy5zbGljZSgwLCB0aGlzLnNlcGFyYXRvci5sZW5ndGgpKTtcblx0XHRcdHRoaXMuYWR2YW5jZSh0aGlzLnNlcGFyYXRvci5sZW5ndGgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cnVuV29yZCgpIHtcblx0XHRjb25zdCB3b3JkUmVnZXggPVxuXHRcdFx0dGhpcy5zdGF0ZSA9PT0gMCA/IC9eXFxTKy8gOiB0aGlzLnN0YXRlID09PSAxID8gL15bXlxcc1wiXSsvIDogL15bXlxcc+KAnV0rLztcblxuXHRcdGNvbnN0IHdvcmRNYXRjaCA9IHRoaXMubWF0Y2god29yZFJlZ2V4KTtcblx0XHRpZiAod29yZE1hdGNoKSB7XG5cdFx0XHRpZiAodGhpcy5zZXBhcmF0b3IpIHtcblx0XHRcdFx0aWYgKHdvcmRNYXRjaFswXS50b0xvd2VyQ2FzZSgpID09PSB0aGlzLnNlcGFyYXRvci50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgaW5kZXggPSB3b3JkTWF0Y2hbMF0uaW5kZXhPZih0aGlzLnNlcGFyYXRvcik7XG5cdFx0XHRcdGlmIChpbmRleCA9PT0gLTEpIHtcblx0XHRcdFx0XHR0aGlzLmFkZFRva2VuKFwiV29yZFwiLCB3b3JkTWF0Y2hbMF0pO1xuXHRcdFx0XHRcdHRoaXMuYWR2YW5jZSh3b3JkTWF0Y2hbMF0ubGVuZ3RoKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGFjdHVhbCA9IHdvcmRNYXRjaFswXS5zbGljZSgwLCBpbmRleCk7XG5cdFx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXb3JkXCIsIGFjdHVhbCk7XG5cdFx0XHRcdHRoaXMuYWR2YW5jZShhY3R1YWwubGVuZ3RoKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXb3JkXCIsIHdvcmRNYXRjaFswXSk7XG5cdFx0XHR0aGlzLmFkdmFuY2Uod29yZE1hdGNoWzBdLmxlbmd0aCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRydW5XaGl0ZXNwYWNlKCkge1xuXHRcdGNvbnN0IHdzTWF0Y2ggPSB0aGlzLm1hdGNoKC9eXFxzKy8pO1xuXHRcdGlmICh3c01hdGNoKSB7XG5cdFx0XHR0aGlzLmFkZFRva2VuKFwiV1NcIiwgd3NNYXRjaFswXSk7XG5cdFx0XHR0aGlzLmFkdmFuY2Uod3NNYXRjaFswXS5sZW5ndGgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbmNsYXNzIFBhcnNlciB7XG5cdHRva2VuczogYW55O1xuXHRzZXBhcmF0ZWQ6IGFueTtcblx0cG9zaXRpb246IG51bWJlcjtcblx0cmVzdWx0czogeyBhbGw6IGFueVtdOyBwaHJhc2VzOiBhbnlbXTsgZmxhZ3M6IGFueVtdOyBvcHRpb25GbGFnczogYW55W10gfTtcblx0Y29uc3RydWN0b3IodG9rZW5zLCB7IHNlcGFyYXRlZCB9KSB7XG5cdFx0dGhpcy50b2tlbnMgPSB0b2tlbnM7XG5cdFx0dGhpcy5zZXBhcmF0ZWQgPSBzZXBhcmF0ZWQ7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IDA7XG5cdFx0Lypcblx0XHQgKiBQaHJhc2VzIGFyZSBgeyB0eXBlOiAnUGhyYXNlJywgdmFsdWUsIHJhdyB9YC5cblx0XHQgKiBGbGFncyBhcmUgYHsgdHlwZTogJ0ZsYWcnLCBrZXksIHJhdyB9YC5cblx0XHQgKiBPcHRpb24gZmxhZ3MgYXJlIGB7IHR5cGU6ICdPcHRpb25GbGFnJywga2V5LCB2YWx1ZSwgcmF3IH1gLlxuXHRcdCAqIFRoZSBgYWxsYCBwcm9wZXJ0eSBpcyBwYXJ0aXRpb25lZCBpbnRvIGBwaHJhc2VzYCwgYGZsYWdzYCwgYW5kIGBvcHRpb25GbGFnc2AuXG5cdFx0ICovXG5cdFx0LyoqXG5cdFx0ICogQHR5cGVkZWYge09iamVjdH0gcmVzdWx0c1xuXHRcdCAqIEBwcm9wIHthbnlbXX0gYWxsXG5cdFx0ICogQHByb3Age2FueVtdfSBwaHJhc2VzXG5cdFx0ICogQHByb3Age2FueVtdfSBmbGFnc1xuXHRcdCAqIEBwcm9wIHthbnlbXX0gb3B0aW9uRmxhZ3Ncblx0XHQgKi9cblx0XHQvKiogQHR5cGUge3Jlc3VsdHN9ICovXG5cdFx0dGhpcy5yZXN1bHRzID0ge1xuXHRcdFx0YWxsOiBbXSxcblx0XHRcdHBocmFzZXM6IFtdLFxuXHRcdFx0ZmxhZ3M6IFtdLFxuXHRcdFx0b3B0aW9uRmxhZ3M6IFtdXG5cdFx0fTtcblx0fVxuXG5cdG5leHQoKSB7XG5cdFx0dGhpcy5wb3NpdGlvbisrO1xuXHR9XG5cblx0bG9va2FoZWFkTihuLCAuLi50eXBlcykge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uICsgbl0gIT0gbnVsbCAmJlxuXHRcdFx0dHlwZXMuaW5jbHVkZXModGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbiArIG5dLnR5cGUpXG5cdFx0KTtcblx0fVxuXG5cdGxvb2thaGVhZCguLi50eXBlcykge1xuXHRcdHJldHVybiB0aGlzLmxvb2thaGVhZE4oMCwgLi4udHlwZXMpO1xuXHR9XG5cblx0bWF0Y2goLi4udHlwZXMpIHtcblx0XHRpZiAodGhpcy5sb29rYWhlYWQoLi4udHlwZXMpKSB7XG5cdFx0XHR0aGlzLm5leHQoKTtcblx0XHRcdHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uIC0gMV07XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0YFVuZXhwZWN0ZWQgdG9rZW4gJHt0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uXS52YWx1ZX0gb2YgdHlwZSAke1xuXHRcdFx0XHR0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uXS50eXBlXG5cdFx0XHR9ICh0aGlzIHNob3VsZCBuZXZlciBoYXBwZW4pYFxuXHRcdCk7XG5cdH1cblxuXHRwYXJzZSgpIHtcblx0XHQvLyAtMSBmb3IgRU9GLlxuXHRcdHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy50b2tlbnMubGVuZ3RoIC0gMSkge1xuXHRcdFx0dGhpcy5ydW5Bcmd1bWVudCgpO1xuXHRcdH1cblxuXHRcdHRoaXMubWF0Y2goXCJFT0ZcIik7XG5cdFx0cmV0dXJuIHRoaXMucmVzdWx0cztcblx0fVxuXG5cdHJ1bkFyZ3VtZW50KCkge1xuXHRcdGNvbnN0IGxlYWRpbmcgPSB0aGlzLmxvb2thaGVhZChcIldTXCIpID8gdGhpcy5tYXRjaChcIldTXCIpLnZhbHVlIDogXCJcIjtcblx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJGbGFnV29yZFwiLCBcIk9wdGlvbkZsYWdXb3JkXCIpKSB7XG5cdFx0XHRjb25zdCBwYXJzZWQgPSB0aGlzLnBhcnNlRmxhZygpO1xuXHRcdFx0Y29uc3QgdHJhaWxpbmcgPSB0aGlzLmxvb2thaGVhZChcIldTXCIpID8gdGhpcy5tYXRjaChcIldTXCIpLnZhbHVlIDogXCJcIjtcblx0XHRcdGNvbnN0IHNlcGFyYXRvciA9IHRoaXMubG9va2FoZWFkKFwiU2VwYXJhdG9yXCIpXG5cdFx0XHRcdD8gdGhpcy5tYXRjaChcIlNlcGFyYXRvclwiKS52YWx1ZVxuXHRcdFx0XHQ6IFwiXCI7XG5cdFx0XHRwYXJzZWQucmF3ID0gYCR7bGVhZGluZ30ke3BhcnNlZC5yYXd9JHt0cmFpbGluZ30ke3NlcGFyYXRvcn1gO1xuXHRcdFx0dGhpcy5yZXN1bHRzLmFsbC5wdXNoKHBhcnNlZCk7XG5cdFx0XHRpZiAocGFyc2VkLnR5cGUgPT09IFwiRmxhZ1wiKSB7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5mbGFncy5wdXNoKHBhcnNlZCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnJlc3VsdHMub3B0aW9uRmxhZ3MucHVzaChwYXJzZWQpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgcGFyc2VkID0gdGhpcy5wYXJzZVBocmFzZSgpO1xuXHRcdGNvbnN0IHRyYWlsaW5nID0gdGhpcy5sb29rYWhlYWQoXCJXU1wiKSA/IHRoaXMubWF0Y2goXCJXU1wiKS52YWx1ZSA6IFwiXCI7XG5cdFx0Y29uc3Qgc2VwYXJhdG9yID0gdGhpcy5sb29rYWhlYWQoXCJTZXBhcmF0b3JcIilcblx0XHRcdD8gdGhpcy5tYXRjaChcIlNlcGFyYXRvclwiKS52YWx1ZVxuXHRcdFx0OiBcIlwiO1xuXHRcdHBhcnNlZC5yYXcgPSBgJHtsZWFkaW5nfSR7cGFyc2VkLnJhd30ke3RyYWlsaW5nfSR7c2VwYXJhdG9yfWA7XG5cdFx0dGhpcy5yZXN1bHRzLmFsbC5wdXNoKHBhcnNlZCk7XG5cdFx0dGhpcy5yZXN1bHRzLnBocmFzZXMucHVzaChwYXJzZWQpO1xuXHR9XG5cblx0cGFyc2VGbGFnKCkge1xuXHRcdGlmICh0aGlzLmxvb2thaGVhZChcIkZsYWdXb3JkXCIpKSB7XG5cdFx0XHRjb25zdCBmbGFnID0gdGhpcy5tYXRjaChcIkZsYWdXb3JkXCIpO1xuXHRcdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIkZsYWdcIiwga2V5OiBmbGFnLnZhbHVlLCByYXc6IGZsYWcudmFsdWUgfTtcblx0XHRcdHJldHVybiBwYXJzZWQ7XG5cdFx0fVxuXG5cdFx0Ly8gT3RoZXJ3aXNlLCBgdGhpcy5sb29rYWhlYWQoJ09wdGlvbkZsYWdXb3JkJylgIHNob3VsZCBiZSB0cnVlLlxuXHRcdGNvbnN0IGZsYWcgPSB0aGlzLm1hdGNoKFwiT3B0aW9uRmxhZ1dvcmRcIik7XG5cdFx0Y29uc3QgcGFyc2VkID0ge1xuXHRcdFx0dHlwZTogXCJPcHRpb25GbGFnXCIsXG5cdFx0XHRrZXk6IGZsYWcudmFsdWUsXG5cdFx0XHR2YWx1ZTogXCJcIixcblx0XHRcdHJhdzogZmxhZy52YWx1ZVxuXHRcdH07XG5cdFx0Y29uc3Qgd3MgPSB0aGlzLmxvb2thaGVhZChcIldTXCIpID8gdGhpcy5tYXRjaChcIldTXCIpIDogbnVsbDtcblx0XHRpZiAod3MgIT0gbnVsbCkge1xuXHRcdFx0cGFyc2VkLnJhdyArPSB3cy52YWx1ZTtcblx0XHR9XG5cblx0XHRjb25zdCBwaHJhc2UgPSB0aGlzLmxvb2thaGVhZChcIlF1b3RlXCIsIFwiT3BlblF1b3RlXCIsIFwiRW5kUXVvdGVcIiwgXCJXb3JkXCIpXG5cdFx0XHQ/IHRoaXMucGFyc2VQaHJhc2UoKVxuXHRcdFx0OiBudWxsO1xuXG5cdFx0aWYgKHBocmFzZSAhPSBudWxsKSB7XG5cdFx0XHRwYXJzZWQudmFsdWUgPSBwaHJhc2UudmFsdWU7XG5cdFx0XHRwYXJzZWQucmF3ICs9IHBocmFzZS5yYXc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhcnNlZDtcblx0fVxuXG5cdHBhcnNlUGhyYXNlKCkge1xuXHRcdGlmICghdGhpcy5zZXBhcmF0ZWQpIHtcblx0XHRcdGlmICh0aGlzLmxvb2thaGVhZChcIlF1b3RlXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJQaHJhc2VcIiwgdmFsdWU6IFwiXCIsIHJhdzogXCJcIiB9O1xuXHRcdFx0XHRjb25zdCBvcGVuUXVvdGUgPSB0aGlzLm1hdGNoKFwiUXVvdGVcIik7XG5cdFx0XHRcdHBhcnNlZC5yYXcgKz0gb3BlblF1b3RlLnZhbHVlO1xuXHRcdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXb3JkXCIsIFwiV1NcIikpIHtcblx0XHRcdFx0XHRjb25zdCBtYXRjaCA9IHRoaXMubWF0Y2goXCJXb3JkXCIsIFwiV1NcIik7XG5cdFx0XHRcdFx0cGFyc2VkLnZhbHVlICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBlbmRRdW90ZSA9IHRoaXMubG9va2FoZWFkKFwiUXVvdGVcIikgPyB0aGlzLm1hdGNoKFwiUXVvdGVcIikgOiBudWxsO1xuXHRcdFx0XHRpZiAoZW5kUXVvdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gZW5kUXVvdGUudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJPcGVuUXVvdGVcIikpIHtcblx0XHRcdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogXCJcIiwgcmF3OiBcIlwiIH07XG5cdFx0XHRcdGNvbnN0IG9wZW5RdW90ZSA9IHRoaXMubWF0Y2goXCJPcGVuUXVvdGVcIik7XG5cdFx0XHRcdHBhcnNlZC5yYXcgKz0gb3BlblF1b3RlLnZhbHVlO1xuXHRcdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXb3JkXCIsIFwiV1NcIikpIHtcblx0XHRcdFx0XHRjb25zdCBtYXRjaCA9IHRoaXMubWF0Y2goXCJXb3JkXCIsIFwiV1NcIik7XG5cdFx0XHRcdFx0aWYgKG1hdGNoLnR5cGUgPT09IFwiV29yZFwiKSB7XG5cdFx0XHRcdFx0XHRwYXJzZWQudmFsdWUgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGVuZFF1b3RlID0gdGhpcy5sb29rYWhlYWQoXCJFbmRRdW90ZVwiKVxuXHRcdFx0XHRcdD8gdGhpcy5tYXRjaChcIkVuZFF1b3RlXCIpXG5cdFx0XHRcdFx0OiBudWxsO1xuXHRcdFx0XHRpZiAoZW5kUXVvdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gZW5kUXVvdGUudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJFbmRRdW90ZVwiKSkge1xuXHRcdFx0XHRjb25zdCBlbmRRdW90ZSA9IHRoaXMubWF0Y2goXCJFbmRRdW90ZVwiKTtcblx0XHRcdFx0Y29uc3QgcGFyc2VkID0ge1xuXHRcdFx0XHRcdHR5cGU6IFwiUGhyYXNlXCIsXG5cdFx0XHRcdFx0dmFsdWU6IGVuZFF1b3RlLnZhbHVlLFxuXHRcdFx0XHRcdHJhdzogZW5kUXVvdGUudmFsdWVcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5zZXBhcmF0ZWQpIHtcblx0XHRcdGNvbnN0IGluaXQgPSB0aGlzLm1hdGNoKFwiV29yZFwiKTtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJQaHJhc2VcIiwgdmFsdWU6IGluaXQudmFsdWUsIHJhdzogaW5pdC52YWx1ZSB9O1xuXHRcdFx0d2hpbGUgKHRoaXMubG9va2FoZWFkKFwiV1NcIikgJiYgdGhpcy5sb29rYWhlYWROKDEsIFwiV29yZFwiKSkge1xuXHRcdFx0XHRjb25zdCB3cyA9IHRoaXMubWF0Y2goXCJXU1wiKTtcblx0XHRcdFx0Y29uc3Qgd29yZCA9IHRoaXMubWF0Y2goXCJXb3JkXCIpO1xuXHRcdFx0XHRwYXJzZWQudmFsdWUgKz0gd3MudmFsdWUgKyB3b3JkLnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRwYXJzZWQucmF3ID0gcGFyc2VkLnZhbHVlO1xuXHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHR9XG5cblx0XHRjb25zdCB3b3JkID0gdGhpcy5tYXRjaChcIldvcmRcIik7XG5cdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogd29yZC52YWx1ZSwgcmF3OiB3b3JkLnZhbHVlIH07XG5cdFx0cmV0dXJuIHBhcnNlZDtcblx0fVxufVxuXG4vKipcbiAqIFBhcnNlcyBjb250ZW50LlxuICogQHBhcmFtIHtDb250ZW50UGFyc2VyT3B0aW9uc30gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250ZW50UGFyc2VyIHtcblx0ZmxhZ1dvcmRzOiBhbnlbXTtcblx0b3B0aW9uRmxhZ1dvcmRzOiBhbnlbXTtcblx0cXVvdGVkOiBib29sZWFuO1xuXHRzZXBhcmF0b3I6IGFueTtcblx0Y29uc3RydWN0b3Ioe1xuXHRcdGZsYWdXb3JkcyA9IFtdLFxuXHRcdG9wdGlvbkZsYWdXb3JkcyA9IFtdLFxuXHRcdHF1b3RlZCA9IHRydWUsXG5cdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdHNlcGFyYXRvclxuXHR9ID0ge30pIHtcblx0XHR0aGlzLmZsYWdXb3JkcyA9IGZsYWdXb3Jkcztcblx0XHR0aGlzLmZsYWdXb3Jkcy5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKTtcblxuXHRcdHRoaXMub3B0aW9uRmxhZ1dvcmRzID0gb3B0aW9uRmxhZ1dvcmRzO1xuXHRcdHRoaXMub3B0aW9uRmxhZ1dvcmRzLnNvcnQoKGEsIGIpID0+IGIubGVuZ3RoIC0gYS5sZW5ndGgpO1xuXG5cdFx0dGhpcy5xdW90ZWQgPSBCb29sZWFuKHF1b3RlZCk7XG5cdFx0dGhpcy5zZXBhcmF0b3IgPSBzZXBhcmF0b3I7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2VzIGNvbnRlbnQuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IC0gQ29udGVudCB0byBwYXJzZS5cblx0ICogQHJldHVybnMge0NvbnRlbnRQYXJzZXJSZXN1bHR9XG5cdCAqL1xuXHRwYXJzZShjb250ZW50KSB7XG5cdFx0Y29uc3QgdG9rZW5zID0gbmV3IFRva2VuaXplcihjb250ZW50LCB7XG5cdFx0XHRmbGFnV29yZHM6IHRoaXMuZmxhZ1dvcmRzLFxuXHRcdFx0b3B0aW9uRmxhZ1dvcmRzOiB0aGlzLm9wdGlvbkZsYWdXb3Jkcyxcblx0XHRcdHF1b3RlZDogdGhpcy5xdW90ZWQsXG5cdFx0XHRzZXBhcmF0b3I6IHRoaXMuc2VwYXJhdG9yXG5cdFx0fSkudG9rZW5pemUoKTtcblxuXHRcdHJldHVybiBuZXcgUGFyc2VyKHRva2VucywgeyBzZXBhcmF0ZWQ6IHRoaXMuc2VwYXJhdG9yICE9IG51bGwgfSkucGFyc2UoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFeHRyYWN0cyB0aGUgZmxhZ3MgZnJvbSBhcmd1bWVudCBvcHRpb25zLlxuXHQgKiBAcGFyYW0ge0FyZ3VtZW50T3B0aW9uc1tdfSBhcmdzIC0gQXJndW1lbnQgb3B0aW9ucy5cblx0ICogQHJldHVybnMge0V4dHJhY3RlZEZsYWdzfVxuXHQgKi9cblx0c3RhdGljIGdldEZsYWdzKGFyZ3MpIHtcblx0XHRjb25zdCByZXMgPSB7XG5cdFx0XHRmbGFnV29yZHM6IFtdLFxuXHRcdFx0b3B0aW9uRmxhZ1dvcmRzOiBbXVxuXHRcdH07XG5cblx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKSB7XG5cdFx0XHRjb25zdCBhcnIgPVxuXHRcdFx0XHRyZXNbXG5cdFx0XHRcdFx0YXJnLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuRkxBRyA/IFwiZmxhZ1dvcmRzXCIgOiBcIm9wdGlvbkZsYWdXb3Jkc1wiXG5cdFx0XHRcdF07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGFyZy5tYXRjaCA9PT0gQXJndW1lbnRNYXRjaGVzLkZMQUcgfHxcblx0XHRcdFx0YXJnLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuT1BUSU9OXG5cdFx0XHQpIHtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoYXJnLmZsYWcpKSB7XG5cdFx0XHRcdFx0YXJyLnB1c2goLi4uYXJnLmZsYWcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFyci5wdXNoKGFyZy5mbGFnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciB0aGUgY29udGVudCBwYXJzZXIuXG4gKiBAcGFyYW0gZmxhZ1dvcmRzIC0gV29yZHMgY29uc2lkZXJlZCBmbGFncy5cbiAqIEBwYXJhbSBvcHRpb25GbGFnV29yZHMgLSBXb3JkcyBjb25zaWRlcmVkIG9wdGlvbiBmbGFncy5cbiAqIEBwYXJhbSBxdW90ZWQgLSBXaGV0aGVyIHRvIHBhcnNlIHF1b3Rlcy4gRGVmYXVsdHMgdG8gYHRydWVgLlxuICogQHBhcmFtIHNlcGFyYXRvciAtIFdoZXRoZXIgdG8gcGFyc2UgYSBzZXBhcmF0b3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudFBhcnNlck9wdGlvbnMge1xuXHRmbGFnV29yZHM/OiBzdHJpbmdbXTtcblx0b3B0aW9uRmxhZ1dvcmRzPzogc3RyaW5nW107XG5cdHF1b3RlZD86IGJvb2xlYW47XG5cdHNlcGFyYXRvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZXN1bHQgb2YgcGFyc2luZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZW50UGFyc2VyUmVzdWx0IHtcblx0LyoqIEFsbCBwaHJhc2VzIGFuZCBmbGFncy4gKi9cblx0YWxsOiBTdHJpbmdEYXRhW107XG5cblx0LyoqIFBocmFzZXMuICovXG5cdHBocmFzZXM6IFN0cmluZ0RhdGFbXTtcblxuXHQvKiogRmxhZ3MuICovXG5cdGZsYWdzOiBTdHJpbmdEYXRhW107XG5cblx0LyoqIE9wdGlvbiBmbGFncy4gKi9cblx0b3B0aW9uRmxhZ3M6IFN0cmluZ0RhdGFbXTtcbn1cblxuLyoqXG4gKiBBIHNpbmdsZSBwaHJhc2Ugb3IgZmxhZy5cbiAqL1xuZXhwb3J0IHR5cGUgU3RyaW5nRGF0YSA9XG5cdHwge1xuXHRcdFx0LyoqIE9uZSBvZiAnUGhyYXNlJywgJ0ZsYWcnLCAnT3B0aW9uRmxhZycuICovXG5cdFx0XHR0eXBlOiBcIlBocmFzZVwiO1xuXG5cdFx0XHQvKiogVGhlIHZhbHVlIG9mIGEgJ1BocmFzZScgb3IgJ09wdGlvbkZsYWcnLiAqL1xuXHRcdFx0dmFsdWU6IHN0cmluZztcblxuXHRcdFx0LyoqIFRoZSByYXcgc3RyaW5nIHdpdGggd2hpdGVzcGFjZSBhbmQvb3Igc2VwYXJhdG9yLiAqL1xuXHRcdFx0cmF3OiBzdHJpbmc7XG5cdCAgfVxuXHR8IHtcblx0XHRcdC8qKiBPbmUgb2YgJ1BocmFzZScsICdGbGFnJywgJ09wdGlvbkZsYWcnLiAqL1xuXHRcdFx0dHlwZTogXCJGbGFnXCI7XG5cblx0XHRcdC8qKiBUaGUga2V5IG9mIGEgJ0ZsYWcnIG9yICdPcHRpb25GbGFnJy4gKi9cblx0XHRcdGtleTogc3RyaW5nO1xuXG5cdFx0XHQvKiogVGhlIHJhdyBzdHJpbmcgd2l0aCB3aGl0ZXNwYWNlIGFuZC9vciBzZXBhcmF0b3IuICovXG5cdFx0XHRyYXc6IHN0cmluZztcblx0ICB9XG5cdHwge1xuXHRcdFx0LyoqIE9uZSBvZiAnUGhyYXNlJywgJ0ZsYWcnLCAnT3B0aW9uRmxhZycuICovXG5cdFx0XHR0eXBlOiBcIk9wdGlvbkZsYWdcIjtcblxuXHRcdFx0LyoqIFRoZSBrZXkgb2YgYSAnRmxhZycgb3IgJ09wdGlvbkZsYWcnLiAqL1xuXHRcdFx0a2V5OiBzdHJpbmc7XG5cblx0XHRcdC8qKiBUaGUgdmFsdWUgb2YgYSAnUGhyYXNlJyBvciAnT3B0aW9uRmxhZycuICovXG5cdFx0XHR2YWx1ZTogc3RyaW5nO1xuXG5cdFx0XHQvKiogVGhlIHJhdyBzdHJpbmcgd2l0aCB3aGl0ZXNwYWNlIGFuZC9vciBzZXBhcmF0b3IuICovXG5cdFx0XHRyYXc6IHN0cmluZztcblx0ICB9O1xuXG4vKipcbiAqIEZsYWdzIGV4dHJhY3RlZCBmcm9tIGFuIGFyZ3VtZW50IGxpc3QuXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBFeHRyYWN0ZWRGbGFnc1xuICogQHByb3Age3N0cmluZ1tdfSBbZmxhZ1dvcmRzPVtdXSAtIFdvcmRzIGNvbnNpZGVyZWQgZmxhZ3MuXG4gKiBAcHJvcCB7c3RyaW5nW119IFtvcHRpb25GbGFnV29yZHM9W11dIC0gV29yZHMgY29uc2lkZXJlZCBvcHRpb24gZmxhZ3MuXG4gKiBAcHJpdmF0ZVxuICovXG4iXX0=