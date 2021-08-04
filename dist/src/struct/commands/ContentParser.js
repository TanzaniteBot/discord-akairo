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
    content;
    flagWords;
    optionFlagWords;
    quoted;
    separator;
    position;
    state;
    tokens;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGVudFBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvQ29udGVudFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUF1RDtBQUV2RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbURHO0FBRUgsTUFBTSxTQUFTO0lBQ2QsWUFDQyxPQUFPO0lBQ1AsbUJBQW1CO0lBQ25CLEVBQUUsU0FBUyxHQUFHLEVBQUUsRUFBRSxlQUFlLEdBQUcsRUFBRSxFQUFFLE1BQU0sR0FBRyxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRTtRQUV2RSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQiwyREFBMkQ7UUFDM0QsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRU0sT0FBTyxDQUFTO0lBQ2hCLFNBQVMsQ0FBVztJQUNwQixlQUFlLENBQVc7SUFDMUIsTUFBTSxDQUFVO0lBQ2hCLFNBQVMsQ0FBUztJQUNsQixRQUFRLENBQVM7SUFDakIsS0FBSyxDQUFTO0lBQ2QsTUFBTSxDQUFRO0lBRXJCLFVBQVUsQ0FBQyxHQUFHO1FBQ2IsT0FBTyxDQUNOLElBQUksQ0FBQyxPQUFPO2FBQ1YsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENB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QUFJO1FBQ25CLE1BQU0sR0FBRyxHQUFHO1lBQ1gsU0FBUyxFQUFFLEVBQUU7WUFDYixlQUFlLEVBQUUsRUFBRTtTQUNuQixDQUFDO1FBRUYsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7WUFDdkIsTUFBTSxHQUFHLEdBQ1IsR0FBRyxDQUNGLEdBQUcsQ0FBQyxLQUFLLEtBQUssMkJBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQ3BFLENBQUM7WUFDSCxJQUNDLEdBQUcsQ0FBQyxLQUFLLEtBQUssMkJBQWUsQ0FBQyxJQUFJO2dCQUNsQyxHQUFHLENBQUMsS0FBSyxLQUFLLDJCQUFlLENBQUMsTUFBTSxFQUNuQztnQkFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM1QixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0QjtxQkFBTTtvQkFDTixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbkI7YUFDRDtTQUNEO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0NBQ0Q7QUFwRUQsZ0NBb0VDO0FBdUVEOzs7Ozs7R0FNRyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFyZ3VtZW50TWF0Y2hlcyB9IGZyb20gXCIuLi8uLi91dGlsL0NvbnN0YW50c1wiO1xuXG4vKlxuICogR3JhbW1hcjpcbiAqXG4gKiBBcmd1bWVudHNcbiAqICA9IChBcmd1bWVudCAoV1M/IEFyZ3VtZW50KSopPyBFT0ZcbiAqXG4gKiBBcmd1bWVudFxuICogID0gRmxhZ1xuICogIHwgUGhyYXNlXG4gKlxuICogRmxhZ1xuICogID0gRmxhZ1dvcmRcbiAqICB8IE9wdGlvbkZsYWdXb3JkIFdTPyBQaHJhc2U/XG4gKlxuICogUGhyYXNlXG4gKiAgPSBRdW90ZSAoV29yZCB8IFdTKSogUXVvdGU/XG4gKiAgfCBPcGVuUXVvdGUgKFdvcmQgfCBPcGVuUXVvdGUgfCBRdW90ZSB8IFdTKSogRW5kUXVvdGU/XG4gKiAgfCBFbmRRdW90ZVxuICogIHwgV29yZFxuICpcbiAqIEZsYWdXb3JkID0gR2l2ZW5cbiAqIE9wdGlvbkZsYWdXb3JkID0gR2l2ZW5cbiAqIFF1b3RlID0gXCJcbiAqIE9wZW5RdW90ZSA9IOKAnFxuICogRW5kUXVvdGUgPSDigJ1cbiAqIFdvcmQgPSAvXlxcUysvIChhbmQgbm90IGluIEZsYWdXb3JkIG9yIE9wdGlvbkZsYWdXb3JkKVxuICogV1MgPSAvXlxccysvXG4gKiBFT0YgPSAvXiQvXG4gKlxuICogV2l0aCBhIHNlcGFyYXRvcjpcbiAqXG4gKiBBcmd1bWVudHNcbiAqICA9IChBcmd1bWVudCAoV1M/IFNlcGFyYXRvciBXUz8gQXJndW1lbnQpKik/IEVPRlxuICpcbiAqIEFyZ3VtZW50XG4gKiAgPSBGbGFnXG4gKiAgfCBQaHJhc2VcbiAqXG4gKiBGbGFnXG4gKiAgPSBGbGFnV29yZFxuICogIHwgT3B0aW9uRmxhZ1dvcmQgV1M/IFBocmFzZT9cbiAqXG4gKiBQaHJhc2VcbiAqICA9IFdvcmQgKFdTIFdvcmQpKlxuICpcbiAqIEZsYWdXb3JkID0gR2l2ZW5cbiAqIE9wdGlvbkZsYWdXb3JkID0gR2l2ZW5cbiAqIFNlcGFyYXRvciA9IEdpdmVuXG4gKiBXb3JkID0gL15cXFMrLyAoYW5kIG5vdCBpbiBGbGFnV29yZCBvciBPcHRpb25GbGFnV29yZCBvciBlcXVhbCB0byBTZXBhcmF0b3IpXG4gKiBXUyA9IC9eXFxzKy9cbiAqIEVPRiA9IC9eJC9cbiAqL1xuXG5jbGFzcyBUb2tlbml6ZXIge1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRjb250ZW50LFxuXHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHR7IGZsYWdXb3JkcyA9IFtdLCBvcHRpb25GbGFnV29yZHMgPSBbXSwgcXVvdGVkID0gdHJ1ZSwgc2VwYXJhdG9yIH0gPSB7fVxuXHQpIHtcblx0XHR0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuXHRcdHRoaXMuZmxhZ1dvcmRzID0gZmxhZ1dvcmRzO1xuXHRcdHRoaXMub3B0aW9uRmxhZ1dvcmRzID0gb3B0aW9uRmxhZ1dvcmRzO1xuXHRcdHRoaXMucXVvdGVkID0gcXVvdGVkO1xuXHRcdHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuXHRcdHRoaXMucG9zaXRpb24gPSAwO1xuXHRcdC8vIDAgLT4gRGVmYXVsdCwgMSAtPiBRdW90ZXMgKFwiXCIpLCAyIC0+IFNwZWNpYWwgUXVvdGVzICjigJzigJ0pXG5cdFx0dGhpcy5zdGF0ZSA9IDA7XG5cdFx0dGhpcy50b2tlbnMgPSBbXTtcblx0fVxuXG5cdHB1YmxpYyBjb250ZW50OiBzdHJpbmc7XG5cdHB1YmxpYyBmbGFnV29yZHM6IHN0cmluZ1tdO1xuXHRwdWJsaWMgb3B0aW9uRmxhZ1dvcmRzOiBzdHJpbmdbXTtcblx0cHVibGljIHF1b3RlZDogYm9vbGVhbjtcblx0cHVibGljIHNlcGFyYXRvcjogc3RyaW5nO1xuXHRwdWJsaWMgcG9zaXRpb246IG51bWJlcjtcblx0cHVibGljIHN0YXRlOiBudW1iZXI7XG5cdHB1YmxpYyB0b2tlbnM6IGFueVtdO1xuXG5cdHN0YXJ0c1dpdGgoc3RyKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHRoaXMuY29udGVudFxuXHRcdFx0XHQuc2xpY2UodGhpcy5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbiArIHN0ci5sZW5ndGgpXG5cdFx0XHRcdC50b0xvd2VyQ2FzZSgpID09PSBzdHIudG9Mb3dlckNhc2UoKVxuXHRcdCk7XG5cdH1cblxuXHRtYXRjaChyZWdleCkge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQuc2xpY2UodGhpcy5wb3NpdGlvbikubWF0Y2gocmVnZXgpO1xuXHR9XG5cblx0c2xpY2UoZnJvbSwgdG8pIHtcblx0XHRyZXR1cm4gdGhpcy5jb250ZW50LnNsaWNlKHRoaXMucG9zaXRpb24gKyBmcm9tLCB0aGlzLnBvc2l0aW9uICsgdG8pO1xuXHR9XG5cblx0YWRkVG9rZW4odHlwZSwgdmFsdWUpIHtcblx0XHR0aGlzLnRva2Vucy5wdXNoKHsgdHlwZSwgdmFsdWUgfSk7XG5cdH1cblxuXHRhZHZhbmNlKG4pIHtcblx0XHR0aGlzLnBvc2l0aW9uICs9IG47XG5cdH1cblxuXHRjaG9pY2UoLi4uYWN0aW9ucykge1xuXHRcdGZvciAoY29uc3QgYWN0aW9uIG9mIGFjdGlvbnMpIHtcblx0XHRcdGlmIChhY3Rpb24uY2FsbCh0aGlzKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0dG9rZW5pemUoKSB7XG5cdFx0d2hpbGUgKHRoaXMucG9zaXRpb24gPCB0aGlzLmNvbnRlbnQubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnJ1bk9uZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuYWRkVG9rZW4oXCJFT0ZcIiwgXCJcIik7XG5cdFx0cmV0dXJuIHRoaXMudG9rZW5zO1xuXHR9XG5cblx0cnVuT25lKCkge1xuXHRcdHRoaXMuY2hvaWNlKFxuXHRcdFx0dGhpcy5ydW5XaGl0ZXNwYWNlLFxuXHRcdFx0dGhpcy5ydW5GbGFncyxcblx0XHRcdHRoaXMucnVuT3B0aW9uRmxhZ3MsXG5cdFx0XHR0aGlzLnJ1blF1b3RlLFxuXHRcdFx0dGhpcy5ydW5PcGVuUXVvdGUsXG5cdFx0XHR0aGlzLnJ1bkVuZFF1b3RlLFxuXHRcdFx0dGhpcy5ydW5TZXBhcmF0b3IsXG5cdFx0XHR0aGlzLnJ1bldvcmRcblx0XHQpO1xuXHR9XG5cblx0cnVuRmxhZ3MoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdGZvciAoY29uc3Qgd29yZCBvZiB0aGlzLmZsYWdXb3Jkcykge1xuXHRcdFx0XHRpZiAodGhpcy5zdGFydHNXaXRoKHdvcmQpKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRUb2tlbihcIkZsYWdXb3JkXCIsIHRoaXMuc2xpY2UoMCwgd29yZC5sZW5ndGgpKTtcblx0XHRcdFx0XHR0aGlzLmFkdmFuY2Uod29yZC5sZW5ndGgpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cnVuT3B0aW9uRmxhZ3MoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdGZvciAoY29uc3Qgd29yZCBvZiB0aGlzLm9wdGlvbkZsYWdXb3Jkcykge1xuXHRcdFx0XHRpZiAodGhpcy5zdGFydHNXaXRoKHdvcmQpKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRUb2tlbihcIk9wdGlvbkZsYWdXb3JkXCIsIHRoaXMuc2xpY2UoMCwgd29yZC5sZW5ndGgpKTtcblx0XHRcdFx0XHR0aGlzLmFkdmFuY2Uod29yZC5sZW5ndGgpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cnVuUXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMuc2VwYXJhdG9yID09IG51bGwgJiYgdGhpcy5xdW90ZWQgJiYgdGhpcy5zdGFydHNXaXRoKCdcIicpKSB7XG5cdFx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gMSkge1xuXHRcdFx0XHR0aGlzLnN0YXRlID0gMDtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gMCkge1xuXHRcdFx0XHR0aGlzLnN0YXRlID0gMTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5hZGRUb2tlbihcIlF1b3RlXCIsICdcIicpO1xuXHRcdFx0dGhpcy5hZHZhbmNlKDEpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cnVuT3BlblF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnNlcGFyYXRvciA9PSBudWxsICYmIHRoaXMucXVvdGVkICYmIHRoaXMuc3RhcnRzV2l0aCgnXCInKSkge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IDI7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJPcGVuUXVvdGVcIiwgJ1wiJyk7XG5cdFx0XHR0aGlzLmFkdmFuY2UoMSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRydW5FbmRRdW90ZSgpIHtcblx0XHRpZiAodGhpcy5zZXBhcmF0b3IgPT0gbnVsbCAmJiB0aGlzLnF1b3RlZCAmJiB0aGlzLnN0YXJ0c1dpdGgoXCLigJ1cIikpIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlID09PSAyKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmFkZFRva2VuKFwiRW5kUXVvdGVcIiwgXCLigJ1cIik7XG5cdFx0XHR0aGlzLmFkdmFuY2UoMSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRydW5TZXBhcmF0b3IoKSB7XG5cdFx0aWYgKHRoaXMuc2VwYXJhdG9yICE9IG51bGwgJiYgdGhpcy5zdGFydHNXaXRoKHRoaXMuc2VwYXJhdG9yKSkge1xuXHRcdFx0dGhpcy5hZGRUb2tlbihcIlNlcGFyYXRvclwiLCB0aGlzLnNsaWNlKDAsIHRoaXMuc2VwYXJhdG9yLmxlbmd0aCkpO1xuXHRcdFx0dGhpcy5hZHZhbmNlKHRoaXMuc2VwYXJhdG9yLmxlbmd0aCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRydW5Xb3JkKCkge1xuXHRcdGNvbnN0IHdvcmRSZWdleCA9XG5cdFx0XHR0aGlzLnN0YXRlID09PSAwID8gL15cXFMrLyA6IHRoaXMuc3RhdGUgPT09IDEgPyAvXlteXFxzXCJdKy8gOiAvXlteXFxz4oCdXSsvO1xuXG5cdFx0Y29uc3Qgd29yZE1hdGNoID0gdGhpcy5tYXRjaCh3b3JkUmVnZXgpO1xuXHRcdGlmICh3b3JkTWF0Y2gpIHtcblx0XHRcdGlmICh0aGlzLnNlcGFyYXRvcikge1xuXHRcdFx0XHRpZiAod29yZE1hdGNoWzBdLnRvTG93ZXJDYXNlKCkgPT09IHRoaXMuc2VwYXJhdG9yLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBpbmRleCA9IHdvcmRNYXRjaFswXS5pbmRleE9mKHRoaXMuc2VwYXJhdG9yKTtcblx0XHRcdFx0aWYgKGluZGV4ID09PSAtMSkge1xuXHRcdFx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXb3JkXCIsIHdvcmRNYXRjaFswXSk7XG5cdFx0XHRcdFx0dGhpcy5hZHZhbmNlKHdvcmRNYXRjaFswXS5sZW5ndGgpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgYWN0dWFsID0gd29yZE1hdGNoWzBdLnNsaWNlKDAsIGluZGV4KTtcblx0XHRcdFx0dGhpcy5hZGRUb2tlbihcIldvcmRcIiwgYWN0dWFsKTtcblx0XHRcdFx0dGhpcy5hZHZhbmNlKGFjdHVhbC5sZW5ndGgpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5hZGRUb2tlbihcIldvcmRcIiwgd29yZE1hdGNoWzBdKTtcblx0XHRcdHRoaXMuYWR2YW5jZSh3b3JkTWF0Y2hbMF0ubGVuZ3RoKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHJ1bldoaXRlc3BhY2UoKSB7XG5cdFx0Y29uc3Qgd3NNYXRjaCA9IHRoaXMubWF0Y2goL15cXHMrLyk7XG5cdFx0aWYgKHdzTWF0Y2gpIHtcblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXU1wiLCB3c01hdGNoWzBdKTtcblx0XHRcdHRoaXMuYWR2YW5jZSh3c01hdGNoWzBdLmxlbmd0aCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuY2xhc3MgUGFyc2VyIHtcblx0dG9rZW5zOiBhbnk7XG5cdHNlcGFyYXRlZDogYW55O1xuXHRwb3NpdGlvbjogbnVtYmVyO1xuXHRyZXN1bHRzOiB7IGFsbDogYW55W107IHBocmFzZXM6IGFueVtdOyBmbGFnczogYW55W107IG9wdGlvbkZsYWdzOiBhbnlbXSB9O1xuXHRjb25zdHJ1Y3Rvcih0b2tlbnMsIHsgc2VwYXJhdGVkIH0pIHtcblx0XHR0aGlzLnRva2VucyA9IHRva2Vucztcblx0XHR0aGlzLnNlcGFyYXRlZCA9IHNlcGFyYXRlZDtcblx0XHR0aGlzLnBvc2l0aW9uID0gMDtcblx0XHQvKlxuXHRcdCAqIFBocmFzZXMgYXJlIGB7IHR5cGU6ICdQaHJhc2UnLCB2YWx1ZSwgcmF3IH1gLlxuXHRcdCAqIEZsYWdzIGFyZSBgeyB0eXBlOiAnRmxhZycsIGtleSwgcmF3IH1gLlxuXHRcdCAqIE9wdGlvbiBmbGFncyBhcmUgYHsgdHlwZTogJ09wdGlvbkZsYWcnLCBrZXksIHZhbHVlLCByYXcgfWAuXG5cdFx0ICogVGhlIGBhbGxgIHByb3BlcnR5IGlzIHBhcnRpdGlvbmVkIGludG8gYHBocmFzZXNgLCBgZmxhZ3NgLCBhbmQgYG9wdGlvbkZsYWdzYC5cblx0XHQgKi9cblx0XHR0aGlzLnJlc3VsdHMgPSB7XG5cdFx0XHRhbGw6IFtdLFxuXHRcdFx0cGhyYXNlczogW10sXG5cdFx0XHRmbGFnczogW10sXG5cdFx0XHRvcHRpb25GbGFnczogW11cblx0XHR9O1xuXHR9XG5cblx0bmV4dCgpIHtcblx0XHR0aGlzLnBvc2l0aW9uKys7XG5cdH1cblxuXHRsb29rYWhlYWROKG4sIC4uLnR5cGVzKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHRoaXMudG9rZW5zW3RoaXMucG9zaXRpb24gKyBuXSAhPSBudWxsICYmXG5cdFx0XHR0eXBlcy5pbmNsdWRlcyh0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uICsgbl0udHlwZSlcblx0XHQpO1xuXHR9XG5cblx0bG9va2FoZWFkKC4uLnR5cGVzKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9va2FoZWFkTigwLCAuLi50eXBlcyk7XG5cdH1cblxuXHRtYXRjaCguLi50eXBlcykge1xuXHRcdGlmICh0aGlzLmxvb2thaGVhZCguLi50eXBlcykpIHtcblx0XHRcdHRoaXMubmV4dCgpO1xuXHRcdFx0cmV0dXJuIHRoaXMudG9rZW5zW3RoaXMucG9zaXRpb24gLSAxXTtcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRgVW5leHBlY3RlZCB0b2tlbiAke3RoaXMudG9rZW5zW3RoaXMucG9zaXRpb25dLnZhbHVlfSBvZiB0eXBlICR7XG5cdFx0XHRcdHRoaXMudG9rZW5zW3RoaXMucG9zaXRpb25dLnR5cGVcblx0XHRcdH0gKHRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbilgXG5cdFx0KTtcblx0fVxuXG5cdHBhcnNlKCkge1xuXHRcdC8vIC0xIGZvciBFT0YuXG5cdFx0d2hpbGUgKHRoaXMucG9zaXRpb24gPCB0aGlzLnRva2Vucy5sZW5ndGggLSAxKSB7XG5cdFx0XHR0aGlzLnJ1bkFyZ3VtZW50KCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5tYXRjaChcIkVPRlwiKTtcblx0XHRyZXR1cm4gdGhpcy5yZXN1bHRzO1xuXHR9XG5cblx0cnVuQXJndW1lbnQoKSB7XG5cdFx0Y29uc3QgbGVhZGluZyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikudmFsdWUgOiBcIlwiO1xuXHRcdGlmICh0aGlzLmxvb2thaGVhZChcIkZsYWdXb3JkXCIsIFwiT3B0aW9uRmxhZ1dvcmRcIikpIHtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IHRoaXMucGFyc2VGbGFnKCk7XG5cdFx0XHRjb25zdCB0cmFpbGluZyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikudmFsdWUgOiBcIlwiO1xuXHRcdFx0Y29uc3Qgc2VwYXJhdG9yID0gdGhpcy5sb29rYWhlYWQoXCJTZXBhcmF0b3JcIilcblx0XHRcdFx0PyB0aGlzLm1hdGNoKFwiU2VwYXJhdG9yXCIpLnZhbHVlXG5cdFx0XHRcdDogXCJcIjtcblx0XHRcdHBhcnNlZC5yYXcgPSBgJHtsZWFkaW5nfSR7cGFyc2VkLnJhd30ke3RyYWlsaW5nfSR7c2VwYXJhdG9yfWA7XG5cdFx0XHR0aGlzLnJlc3VsdHMuYWxsLnB1c2gocGFyc2VkKTtcblx0XHRcdGlmIChwYXJzZWQudHlwZSA9PT0gXCJGbGFnXCIpIHtcblx0XHRcdFx0dGhpcy5yZXN1bHRzLmZsYWdzLnB1c2gocGFyc2VkKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5vcHRpb25GbGFncy5wdXNoKHBhcnNlZCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBwYXJzZWQgPSB0aGlzLnBhcnNlUGhyYXNlKCk7XG5cdFx0Y29uc3QgdHJhaWxpbmcgPSB0aGlzLmxvb2thaGVhZChcIldTXCIpID8gdGhpcy5tYXRjaChcIldTXCIpLnZhbHVlIDogXCJcIjtcblx0XHRjb25zdCBzZXBhcmF0b3IgPSB0aGlzLmxvb2thaGVhZChcIlNlcGFyYXRvclwiKVxuXHRcdFx0PyB0aGlzLm1hdGNoKFwiU2VwYXJhdG9yXCIpLnZhbHVlXG5cdFx0XHQ6IFwiXCI7XG5cdFx0cGFyc2VkLnJhdyA9IGAke2xlYWRpbmd9JHtwYXJzZWQucmF3fSR7dHJhaWxpbmd9JHtzZXBhcmF0b3J9YDtcblx0XHR0aGlzLnJlc3VsdHMuYWxsLnB1c2gocGFyc2VkKTtcblx0XHR0aGlzLnJlc3VsdHMucGhyYXNlcy5wdXNoKHBhcnNlZCk7XG5cdH1cblxuXHRwYXJzZUZsYWcoKSB7XG5cdFx0aWYgKHRoaXMubG9va2FoZWFkKFwiRmxhZ1dvcmRcIikpIHtcblx0XHRcdGNvbnN0IGZsYWcgPSB0aGlzLm1hdGNoKFwiRmxhZ1dvcmRcIik7XG5cdFx0XHRjb25zdCBwYXJzZWQgPSB7IHR5cGU6IFwiRmxhZ1wiLCBrZXk6IGZsYWcudmFsdWUsIHJhdzogZmxhZy52YWx1ZSB9O1xuXHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHR9XG5cblx0XHQvLyBPdGhlcndpc2UsIGB0aGlzLmxvb2thaGVhZCgnT3B0aW9uRmxhZ1dvcmQnKWAgc2hvdWxkIGJlIHRydWUuXG5cdFx0Y29uc3QgZmxhZyA9IHRoaXMubWF0Y2goXCJPcHRpb25GbGFnV29yZFwiKTtcblx0XHRjb25zdCBwYXJzZWQgPSB7XG5cdFx0XHR0eXBlOiBcIk9wdGlvbkZsYWdcIixcblx0XHRcdGtleTogZmxhZy52YWx1ZSxcblx0XHRcdHZhbHVlOiBcIlwiLFxuXHRcdFx0cmF3OiBmbGFnLnZhbHVlXG5cdFx0fTtcblx0XHRjb25zdCB3cyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikgOiBudWxsO1xuXHRcdGlmICh3cyAhPSBudWxsKSB7XG5cdFx0XHRwYXJzZWQucmF3ICs9IHdzLnZhbHVlO1xuXHRcdH1cblxuXHRcdGNvbnN0IHBocmFzZSA9IHRoaXMubG9va2FoZWFkKFwiUXVvdGVcIiwgXCJPcGVuUXVvdGVcIiwgXCJFbmRRdW90ZVwiLCBcIldvcmRcIilcblx0XHRcdD8gdGhpcy5wYXJzZVBocmFzZSgpXG5cdFx0XHQ6IG51bGw7XG5cblx0XHRpZiAocGhyYXNlICE9IG51bGwpIHtcblx0XHRcdHBhcnNlZC52YWx1ZSA9IHBocmFzZS52YWx1ZTtcblx0XHRcdHBhcnNlZC5yYXcgKz0gcGhyYXNlLnJhdztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG5cblx0cGFyc2VQaHJhc2UoKSB7XG5cdFx0aWYgKCF0aGlzLnNlcGFyYXRlZCkge1xuXHRcdFx0aWYgKHRoaXMubG9va2FoZWFkKFwiUXVvdGVcIikpIHtcblx0XHRcdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogXCJcIiwgcmF3OiBcIlwiIH07XG5cdFx0XHRcdGNvbnN0IG9wZW5RdW90ZSA9IHRoaXMubWF0Y2goXCJRdW90ZVwiKTtcblx0XHRcdFx0cGFyc2VkLnJhdyArPSBvcGVuUXVvdGUudmFsdWU7XG5cdFx0XHRcdHdoaWxlICh0aGlzLmxvb2thaGVhZChcIldvcmRcIiwgXCJXU1wiKSkge1xuXHRcdFx0XHRcdGNvbnN0IG1hdGNoID0gdGhpcy5tYXRjaChcIldvcmRcIiwgXCJXU1wiKTtcblx0XHRcdFx0XHRwYXJzZWQudmFsdWUgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdFx0cGFyc2VkLnJhdyArPSBtYXRjaC52YWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGVuZFF1b3RlID0gdGhpcy5sb29rYWhlYWQoXCJRdW90ZVwiKSA/IHRoaXMubWF0Y2goXCJRdW90ZVwiKSA6IG51bGw7XG5cdFx0XHRcdGlmIChlbmRRdW90ZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0cGFyc2VkLnJhdyArPSBlbmRRdW90ZS52YWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBwYXJzZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmxvb2thaGVhZChcIk9wZW5RdW90ZVwiKSkge1xuXHRcdFx0XHRjb25zdCBwYXJzZWQgPSB7IHR5cGU6IFwiUGhyYXNlXCIsIHZhbHVlOiBcIlwiLCByYXc6IFwiXCIgfTtcblx0XHRcdFx0Y29uc3Qgb3BlblF1b3RlID0gdGhpcy5tYXRjaChcIk9wZW5RdW90ZVwiKTtcblx0XHRcdFx0cGFyc2VkLnJhdyArPSBvcGVuUXVvdGUudmFsdWU7XG5cdFx0XHRcdHdoaWxlICh0aGlzLmxvb2thaGVhZChcIldvcmRcIiwgXCJXU1wiKSkge1xuXHRcdFx0XHRcdGNvbnN0IG1hdGNoID0gdGhpcy5tYXRjaChcIldvcmRcIiwgXCJXU1wiKTtcblx0XHRcdFx0XHRpZiAobWF0Y2gudHlwZSA9PT0gXCJXb3JkXCIpIHtcblx0XHRcdFx0XHRcdHBhcnNlZC52YWx1ZSArPSBtYXRjaC52YWx1ZTtcblx0XHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgZW5kUXVvdGUgPSB0aGlzLmxvb2thaGVhZChcIkVuZFF1b3RlXCIpXG5cdFx0XHRcdFx0PyB0aGlzLm1hdGNoKFwiRW5kUXVvdGVcIilcblx0XHRcdFx0XHQ6IG51bGw7XG5cdFx0XHRcdGlmIChlbmRRdW90ZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0cGFyc2VkLnJhdyArPSBlbmRRdW90ZS52YWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBwYXJzZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmxvb2thaGVhZChcIkVuZFF1b3RlXCIpKSB7XG5cdFx0XHRcdGNvbnN0IGVuZFF1b3RlID0gdGhpcy5tYXRjaChcIkVuZFF1b3RlXCIpO1xuXHRcdFx0XHRjb25zdCBwYXJzZWQgPSB7XG5cdFx0XHRcdFx0dHlwZTogXCJQaHJhc2VcIixcblx0XHRcdFx0XHR2YWx1ZTogZW5kUXVvdGUudmFsdWUsXG5cdFx0XHRcdFx0cmF3OiBlbmRRdW90ZS52YWx1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLnNlcGFyYXRlZCkge1xuXHRcdFx0Y29uc3QgaW5pdCA9IHRoaXMubWF0Y2goXCJXb3JkXCIpO1xuXHRcdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogaW5pdC52YWx1ZSwgcmF3OiBpbml0LnZhbHVlIH07XG5cdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXU1wiKSAmJiB0aGlzLmxvb2thaGVhZE4oMSwgXCJXb3JkXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHdzID0gdGhpcy5tYXRjaChcIldTXCIpO1xuXHRcdFx0XHRjb25zdCB3b3JkID0gdGhpcy5tYXRjaChcIldvcmRcIik7XG5cdFx0XHRcdHBhcnNlZC52YWx1ZSArPSB3cy52YWx1ZSArIHdvcmQudmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdHBhcnNlZC5yYXcgPSBwYXJzZWQudmFsdWU7XG5cdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdH1cblxuXHRcdGNvbnN0IHdvcmQgPSB0aGlzLm1hdGNoKFwiV29yZFwiKTtcblx0XHRjb25zdCBwYXJzZWQgPSB7IHR5cGU6IFwiUGhyYXNlXCIsIHZhbHVlOiB3b3JkLnZhbHVlLCByYXc6IHdvcmQudmFsdWUgfTtcblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG59XG5cbi8qKlxuICogUGFyc2VzIGNvbnRlbnQuXG4gKiBAcGFyYW0ge0NvbnRlbnRQYXJzZXJPcHRpb25zfSBvcHRpb25zIC0gT3B0aW9ucy5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRlbnRQYXJzZXIge1xuXHRmbGFnV29yZHM6IGFueVtdO1xuXHRvcHRpb25GbGFnV29yZHM6IGFueVtdO1xuXHRxdW90ZWQ6IGJvb2xlYW47XG5cdHNlcGFyYXRvcjogYW55O1xuXHRjb25zdHJ1Y3Rvcih7XG5cdFx0ZmxhZ1dvcmRzID0gW10sXG5cdFx0b3B0aW9uRmxhZ1dvcmRzID0gW10sXG5cdFx0cXVvdGVkID0gdHJ1ZSxcblx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0c2VwYXJhdG9yXG5cdH0gPSB7fSkge1xuXHRcdHRoaXMuZmxhZ1dvcmRzID0gZmxhZ1dvcmRzO1xuXHRcdHRoaXMuZmxhZ1dvcmRzLnNvcnQoKGEsIGIpID0+IGIubGVuZ3RoIC0gYS5sZW5ndGgpO1xuXG5cdFx0dGhpcy5vcHRpb25GbGFnV29yZHMgPSBvcHRpb25GbGFnV29yZHM7XG5cdFx0dGhpcy5vcHRpb25GbGFnV29yZHMuc29ydCgoYSwgYikgPT4gYi5sZW5ndGggLSBhLmxlbmd0aCk7XG5cblx0XHR0aGlzLnF1b3RlZCA9IEJvb2xlYW4ocXVvdGVkKTtcblx0XHR0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgY29udGVudC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgLSBDb250ZW50IHRvIHBhcnNlLlxuXHQgKiBAcmV0dXJucyB7Q29udGVudFBhcnNlclJlc3VsdH1cblx0ICovXG5cdHBhcnNlKGNvbnRlbnQpIHtcblx0XHRjb25zdCB0b2tlbnMgPSBuZXcgVG9rZW5pemVyKGNvbnRlbnQsIHtcblx0XHRcdGZsYWdXb3JkczogdGhpcy5mbGFnV29yZHMsXG5cdFx0XHRvcHRpb25GbGFnV29yZHM6IHRoaXMub3B0aW9uRmxhZ1dvcmRzLFxuXHRcdFx0cXVvdGVkOiB0aGlzLnF1b3RlZCxcblx0XHRcdHNlcGFyYXRvcjogdGhpcy5zZXBhcmF0b3Jcblx0XHR9KS50b2tlbml6ZSgpO1xuXG5cdFx0cmV0dXJuIG5ldyBQYXJzZXIodG9rZW5zLCB7IHNlcGFyYXRlZDogdGhpcy5zZXBhcmF0b3IgIT0gbnVsbCB9KS5wYXJzZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4dHJhY3RzIHRoZSBmbGFncyBmcm9tIGFyZ3VtZW50IG9wdGlvbnMuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRPcHRpb25zW119IGFyZ3MgLSBBcmd1bWVudCBvcHRpb25zLlxuXHQgKiBAcmV0dXJucyB7RXh0cmFjdGVkRmxhZ3N9XG5cdCAqL1xuXHRzdGF0aWMgZ2V0RmxhZ3MoYXJncykge1xuXHRcdGNvbnN0IHJlcyA9IHtcblx0XHRcdGZsYWdXb3JkczogW10sXG5cdFx0XHRvcHRpb25GbGFnV29yZHM6IFtdXG5cdFx0fTtcblxuXHRcdGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpIHtcblx0XHRcdGNvbnN0IGFyciA9XG5cdFx0XHRcdHJlc1tcblx0XHRcdFx0XHRhcmcubWF0Y2ggPT09IEFyZ3VtZW50TWF0Y2hlcy5GTEFHID8gXCJmbGFnV29yZHNcIiA6IFwib3B0aW9uRmxhZ1dvcmRzXCJcblx0XHRcdFx0XTtcblx0XHRcdGlmIChcblx0XHRcdFx0YXJnLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuRkxBRyB8fFxuXHRcdFx0XHRhcmcubWF0Y2ggPT09IEFyZ3VtZW50TWF0Y2hlcy5PUFRJT05cblx0XHRcdCkge1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShhcmcuZmxhZykpIHtcblx0XHRcdFx0XHRhcnIucHVzaCguLi5hcmcuZmxhZyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXJyLnB1c2goYXJnLmZsYWcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlcztcblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHRoZSBjb250ZW50IHBhcnNlci5cbiAqIEBwYXJhbSBmbGFnV29yZHMgLSBXb3JkcyBjb25zaWRlcmVkIGZsYWdzLlxuICogQHBhcmFtIG9wdGlvbkZsYWdXb3JkcyAtIFdvcmRzIGNvbnNpZGVyZWQgb3B0aW9uIGZsYWdzLlxuICogQHBhcmFtIHF1b3RlZCAtIFdoZXRoZXIgdG8gcGFyc2UgcXVvdGVzLiBEZWZhdWx0cyB0byBgdHJ1ZWAuXG4gKiBAcGFyYW0gc2VwYXJhdG9yIC0gV2hldGhlciB0byBwYXJzZSBhIHNlcGFyYXRvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZW50UGFyc2VyT3B0aW9ucyB7XG5cdGZsYWdXb3Jkcz86IHN0cmluZ1tdO1xuXHRvcHRpb25GbGFnV29yZHM/OiBzdHJpbmdbXTtcblx0cXVvdGVkPzogYm9vbGVhbjtcblx0c2VwYXJhdG9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlc3VsdCBvZiBwYXJzaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRlbnRQYXJzZXJSZXN1bHQge1xuXHQvKiogQWxsIHBocmFzZXMgYW5kIGZsYWdzLiAqL1xuXHRhbGw6IFN0cmluZ0RhdGFbXTtcblxuXHQvKiogUGhyYXNlcy4gKi9cblx0cGhyYXNlczogU3RyaW5nRGF0YVtdO1xuXG5cdC8qKiBGbGFncy4gKi9cblx0ZmxhZ3M6IFN0cmluZ0RhdGFbXTtcblxuXHQvKiogT3B0aW9uIGZsYWdzLiAqL1xuXHRvcHRpb25GbGFnczogU3RyaW5nRGF0YVtdO1xufVxuXG4vKipcbiAqIEEgc2luZ2xlIHBocmFzZSBvciBmbGFnLlxuICovXG5leHBvcnQgdHlwZSBTdHJpbmdEYXRhID1cblx0fCB7XG5cdFx0XHQvKiogT25lIG9mICdQaHJhc2UnLCAnRmxhZycsICdPcHRpb25GbGFnJy4gKi9cblx0XHRcdHR5cGU6IFwiUGhyYXNlXCI7XG5cblx0XHRcdC8qKiBUaGUgdmFsdWUgb2YgYSAnUGhyYXNlJyBvciAnT3B0aW9uRmxhZycuICovXG5cdFx0XHR2YWx1ZTogc3RyaW5nO1xuXG5cdFx0XHQvKiogVGhlIHJhdyBzdHJpbmcgd2l0aCB3aGl0ZXNwYWNlIGFuZC9vciBzZXBhcmF0b3IuICovXG5cdFx0XHRyYXc6IHN0cmluZztcblx0ICB9XG5cdHwge1xuXHRcdFx0LyoqIE9uZSBvZiAnUGhyYXNlJywgJ0ZsYWcnLCAnT3B0aW9uRmxhZycuICovXG5cdFx0XHR0eXBlOiBcIkZsYWdcIjtcblxuXHRcdFx0LyoqIFRoZSBrZXkgb2YgYSAnRmxhZycgb3IgJ09wdGlvbkZsYWcnLiAqL1xuXHRcdFx0a2V5OiBzdHJpbmc7XG5cblx0XHRcdC8qKiBUaGUgcmF3IHN0cmluZyB3aXRoIHdoaXRlc3BhY2UgYW5kL29yIHNlcGFyYXRvci4gKi9cblx0XHRcdHJhdzogc3RyaW5nO1xuXHQgIH1cblx0fCB7XG5cdFx0XHQvKiogT25lIG9mICdQaHJhc2UnLCAnRmxhZycsICdPcHRpb25GbGFnJy4gKi9cblx0XHRcdHR5cGU6IFwiT3B0aW9uRmxhZ1wiO1xuXG5cdFx0XHQvKiogVGhlIGtleSBvZiBhICdGbGFnJyBvciAnT3B0aW9uRmxhZycuICovXG5cdFx0XHRrZXk6IHN0cmluZztcblxuXHRcdFx0LyoqIFRoZSB2YWx1ZSBvZiBhICdQaHJhc2UnIG9yICdPcHRpb25GbGFnJy4gKi9cblx0XHRcdHZhbHVlOiBzdHJpbmc7XG5cblx0XHRcdC8qKiBUaGUgcmF3IHN0cmluZyB3aXRoIHdoaXRlc3BhY2UgYW5kL29yIHNlcGFyYXRvci4gKi9cblx0XHRcdHJhdzogc3RyaW5nO1xuXHQgIH07XG5cbi8qKlxuICogRmxhZ3MgZXh0cmFjdGVkIGZyb20gYW4gYXJndW1lbnQgbGlzdC5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IEV4dHJhY3RlZEZsYWdzXG4gKiBAcHJvcCB7c3RyaW5nW119IFtmbGFnV29yZHM9W11dIC0gV29yZHMgY29uc2lkZXJlZCBmbGFncy5cbiAqIEBwcm9wIHtzdHJpbmdbXX0gW29wdGlvbkZsYWdXb3Jkcz1bXV0gLSBXb3JkcyBjb25zaWRlcmVkIG9wdGlvbiBmbGFncy5cbiAqIEBwcml2YXRlXG4gKi9cbiJdfQ==