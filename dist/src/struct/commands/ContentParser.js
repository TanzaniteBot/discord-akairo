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
    constructor(content, { flagWords = [], optionFlagWords = [], quoted = true, separator } = {}) {
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
    constructor(tokens, { separated }) {
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
    tokens;
    separated;
    position;
    /**
     * Phrases are `{ type: 'Phrase', value, raw }`.
     * Flags are `{ type: 'Flag', key, raw }`.
     * Option flags are `{ type: 'OptionFlag', key, value, raw }`.
     * The `all` property is partitioned into `phrases`, `flags`, and `optionFlags`.
     */
    results;
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
 * @param options - Options.
 */
class ContentParser {
    constructor({ flagWords = [], optionFlagWords = [], quoted = true, separator } = {}) {
        this.flagWords = flagWords;
        this.flagWords.sort((a, b) => b.length - a.length);
        this.optionFlagWords = optionFlagWords;
        this.optionFlagWords.sort((a, b) => b.length - a.length);
        this.quoted = Boolean(quoted);
        this.separator = separator;
    }
    /**
     * Words considered flags.
     */
    flagWords;
    /**
     * Words considered option flags.
     */
    optionFlagWords;
    /**
     * Whether to parse quotes. Defaults to `true`.
     */
    quoted;
    /**
     * Whether to parse a separator.
     */
    separator;
    /**
     * Parses content.
     * @param content - Content to parse.
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
     * @param args - Argument options.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGVudFBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvQ29udGVudFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUF1RDtBQUd2RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbURHO0FBRUgsTUFBTSxTQUFTO0lBQ2QsWUFDQyxPQUFlLEVBQ2YsRUFDQyxTQUFTLEdBQUcsRUFBRSxFQUNkLGVBQWUsR0FBRyxFQUFFLEVBQ3BCLE1BQU0sR0FBRyxJQUFJLEVBQ2IsU0FBUyxLQUNnQixFQUFFO1FBRTVCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLDJEQUEyRDtRQUMzRCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFTSxPQUFPLENBQVM7SUFDaEIsU0FBUyxDQUFXO0lBQ3BCLGVBQWUsQ0FBVztJQUMxQixNQUFNLENBQVU7SUFDaEIsU0FBUyxDQUFTO0lBQ2xCLFFBQVEsQ0FBUztJQUNqQixLQUFLLENBQVM7SUFDZCxNQUFNLENBQVE7SUFFZCxVQUFVLENBQUMsR0FBVztRQUM1QixPQUFPLENBQ04sSUFBSSxDQUFDLE9BQU87YUFDVixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7YUFD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LE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBdUI7UUFDN0MsTUFBTSxHQUFHLEdBQUc7WUFDWCxTQUFTLEVBQUUsRUFBRTtZQUNiLGVBQWUsRUFBRSxFQUFFO1NBQ25CLENBQUM7UUFFRixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtZQUN2QixNQUFNLEdBQUcsR0FDUixHQUFHLENBQ0YsR0FBRyxDQUFDLEtBQUssS0FBSywyQkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FDcEUsQ0FBQztZQUNILElBQ0MsR0FBRyxDQUFDLEtBQUssS0FBSywyQkFBZSxDQUFDLElBQUk7Z0JBQ2xDLEdBQUcsQ0FBQyxLQUFLLEtBQUssMkJBQWUsQ0FBQyxNQUFNLEVBQ25DO2dCQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzVCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3RCO3FCQUFNO29CQUNOLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuQjthQUNEO1NBQ0Q7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FDRDtBQWpGRCxnQ0FpRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcmd1bWVudE1hdGNoZXMgfSBmcm9tIFwiLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCB7IEFyZ3VtZW50T3B0aW9ucyB9IGZyb20gXCIuL2FyZ3VtZW50cy9Bcmd1bWVudFwiO1xuXG4vKlxuICogR3JhbW1hcjpcbiAqXG4gKiBBcmd1bWVudHNcbiAqICA9IChBcmd1bWVudCAoV1M/IEFyZ3VtZW50KSopPyBFT0ZcbiAqXG4gKiBBcmd1bWVudFxuICogID0gRmxhZ1xuICogIHwgUGhyYXNlXG4gKlxuICogRmxhZ1xuICogID0gRmxhZ1dvcmRcbiAqICB8IE9wdGlvbkZsYWdXb3JkIFdTPyBQaHJhc2U/XG4gKlxuICogUGhyYXNlXG4gKiAgPSBRdW90ZSAoV29yZCB8IFdTKSogUXVvdGU/XG4gKiAgfCBPcGVuUXVvdGUgKFdvcmQgfCBPcGVuUXVvdGUgfCBRdW90ZSB8IFdTKSogRW5kUXVvdGU/XG4gKiAgfCBFbmRRdW90ZVxuICogIHwgV29yZFxuICpcbiAqIEZsYWdXb3JkID0gR2l2ZW5cbiAqIE9wdGlvbkZsYWdXb3JkID0gR2l2ZW5cbiAqIFF1b3RlID0gXCJcbiAqIE9wZW5RdW90ZSA9IOKAnFxuICogRW5kUXVvdGUgPSDigJ1cbiAqIFdvcmQgPSAvXlxcUysvIChhbmQgbm90IGluIEZsYWdXb3JkIG9yIE9wdGlvbkZsYWdXb3JkKVxuICogV1MgPSAvXlxccysvXG4gKiBFT0YgPSAvXiQvXG4gKlxuICogV2l0aCBhIHNlcGFyYXRvcjpcbiAqXG4gKiBBcmd1bWVudHNcbiAqICA9IChBcmd1bWVudCAoV1M/IFNlcGFyYXRvciBXUz8gQXJndW1lbnQpKik/IEVPRlxuICpcbiAqIEFyZ3VtZW50XG4gKiAgPSBGbGFnXG4gKiAgfCBQaHJhc2VcbiAqXG4gKiBGbGFnXG4gKiAgPSBGbGFnV29yZFxuICogIHwgT3B0aW9uRmxhZ1dvcmQgV1M/IFBocmFzZT9cbiAqXG4gKiBQaHJhc2VcbiAqICA9IFdvcmQgKFdTIFdvcmQpKlxuICpcbiAqIEZsYWdXb3JkID0gR2l2ZW5cbiAqIE9wdGlvbkZsYWdXb3JkID0gR2l2ZW5cbiAqIFNlcGFyYXRvciA9IEdpdmVuXG4gKiBXb3JkID0gL15cXFMrLyAoYW5kIG5vdCBpbiBGbGFnV29yZCBvciBPcHRpb25GbGFnV29yZCBvciBlcXVhbCB0byBTZXBhcmF0b3IpXG4gKiBXUyA9IC9eXFxzKy9cbiAqIEVPRiA9IC9eJC9cbiAqL1xuXG5jbGFzcyBUb2tlbml6ZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y29udGVudDogc3RyaW5nLFxuXHRcdHtcblx0XHRcdGZsYWdXb3JkcyA9IFtdLFxuXHRcdFx0b3B0aW9uRmxhZ1dvcmRzID0gW10sXG5cdFx0XHRxdW90ZWQgPSB0cnVlLFxuXHRcdFx0c2VwYXJhdG9yXG5cdFx0fTogQ29udGVudFBhcnNlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHR0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuXHRcdHRoaXMuZmxhZ1dvcmRzID0gZmxhZ1dvcmRzO1xuXHRcdHRoaXMub3B0aW9uRmxhZ1dvcmRzID0gb3B0aW9uRmxhZ1dvcmRzO1xuXHRcdHRoaXMucXVvdGVkID0gcXVvdGVkO1xuXHRcdHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuXHRcdHRoaXMucG9zaXRpb24gPSAwO1xuXHRcdC8vIDAgLT4gRGVmYXVsdCwgMSAtPiBRdW90ZXMgKFwiXCIpLCAyIC0+IFNwZWNpYWwgUXVvdGVzICjigJzigJ0pXG5cdFx0dGhpcy5zdGF0ZSA9IDA7XG5cdFx0dGhpcy50b2tlbnMgPSBbXTtcblx0fVxuXG5cdHB1YmxpYyBjb250ZW50OiBzdHJpbmc7XG5cdHB1YmxpYyBmbGFnV29yZHM6IHN0cmluZ1tdO1xuXHRwdWJsaWMgb3B0aW9uRmxhZ1dvcmRzOiBzdHJpbmdbXTtcblx0cHVibGljIHF1b3RlZDogYm9vbGVhbjtcblx0cHVibGljIHNlcGFyYXRvcjogc3RyaW5nO1xuXHRwdWJsaWMgcG9zaXRpb246IG51bWJlcjtcblx0cHVibGljIHN0YXRlOiBudW1iZXI7XG5cdHB1YmxpYyB0b2tlbnM6IGFueVtdO1xuXG5cdHB1YmxpYyBzdGFydHNXaXRoKHN0cjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHRoaXMuY29udGVudFxuXHRcdFx0XHQuc2xpY2UodGhpcy5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbiArIHN0ci5sZW5ndGgpXG5cdFx0XHRcdC50b0xvd2VyQ2FzZSgpID09PSBzdHIudG9Mb3dlckNhc2UoKVxuXHRcdCk7XG5cdH1cblxuXHRwdWJsaWMgbWF0Y2gocmVnZXg6IFJlZ0V4cCkge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQuc2xpY2UodGhpcy5wb3NpdGlvbikubWF0Y2gocmVnZXgpO1xuXHR9XG5cblx0cHVibGljIHNsaWNlKGZyb20sIHRvKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29udGVudC5zbGljZSh0aGlzLnBvc2l0aW9uICsgZnJvbSwgdGhpcy5wb3NpdGlvbiArIHRvKTtcblx0fVxuXG5cdHB1YmxpYyBhZGRUb2tlbih0eXBlLCB2YWx1ZSkge1xuXHRcdHRoaXMudG9rZW5zLnB1c2goeyB0eXBlLCB2YWx1ZSB9KTtcblx0fVxuXG5cdHB1YmxpYyBhZHZhbmNlKG4pIHtcblx0XHR0aGlzLnBvc2l0aW9uICs9IG47XG5cdH1cblxuXHRwdWJsaWMgY2hvaWNlKC4uLmFjdGlvbnMpIHtcblx0XHRmb3IgKGNvbnN0IGFjdGlvbiBvZiBhY3Rpb25zKSB7XG5cdFx0XHRpZiAoYWN0aW9uLmNhbGwodGhpcykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyB0b2tlbml6ZSgpIHtcblx0XHR3aGlsZSAodGhpcy5wb3NpdGlvbiA8IHRoaXMuY29udGVudC5sZW5ndGgpIHtcblx0XHRcdHRoaXMucnVuT25lKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5hZGRUb2tlbihcIkVPRlwiLCBcIlwiKTtcblx0XHRyZXR1cm4gdGhpcy50b2tlbnM7XG5cdH1cblxuXHRwdWJsaWMgcnVuT25lKCkge1xuXHRcdHRoaXMuY2hvaWNlKFxuXHRcdFx0dGhpcy5ydW5XaGl0ZXNwYWNlLFxuXHRcdFx0dGhpcy5ydW5GbGFncyxcblx0XHRcdHRoaXMucnVuT3B0aW9uRmxhZ3MsXG5cdFx0XHR0aGlzLnJ1blF1b3RlLFxuXHRcdFx0dGhpcy5ydW5PcGVuUXVvdGUsXG5cdFx0XHR0aGlzLnJ1bkVuZFF1b3RlLFxuXHRcdFx0dGhpcy5ydW5TZXBhcmF0b3IsXG5cdFx0XHR0aGlzLnJ1bldvcmRcblx0XHQpO1xuXHR9XG5cblx0cHVibGljIHJ1bkZsYWdzKCkge1xuXHRcdGlmICh0aGlzLnN0YXRlID09PSAwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHdvcmQgb2YgdGhpcy5mbGFnV29yZHMpIHtcblx0XHRcdFx0aWYgKHRoaXMuc3RhcnRzV2l0aCh3b3JkKSkge1xuXHRcdFx0XHRcdHRoaXMuYWRkVG9rZW4oXCJGbGFnV29yZFwiLCB0aGlzLnNsaWNlKDAsIHdvcmQubGVuZ3RoKSk7XG5cdFx0XHRcdFx0dGhpcy5hZHZhbmNlKHdvcmQubGVuZ3RoKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBydW5PcHRpb25GbGFncygpIHtcblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gMCkge1xuXHRcdFx0Zm9yIChjb25zdCB3b3JkIG9mIHRoaXMub3B0aW9uRmxhZ1dvcmRzKSB7XG5cdFx0XHRcdGlmICh0aGlzLnN0YXJ0c1dpdGgod29yZCkpIHtcblx0XHRcdFx0XHR0aGlzLmFkZFRva2VuKFwiT3B0aW9uRmxhZ1dvcmRcIiwgdGhpcy5zbGljZSgwLCB3b3JkLmxlbmd0aCkpO1xuXHRcdFx0XHRcdHRoaXMuYWR2YW5jZSh3b3JkLmxlbmd0aCk7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuUXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMuc2VwYXJhdG9yID09IG51bGwgJiYgdGhpcy5xdW90ZWQgJiYgdGhpcy5zdGFydHNXaXRoKCdcIicpKSB7XG5cdFx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gMSkge1xuXHRcdFx0XHR0aGlzLnN0YXRlID0gMDtcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZSA9PT0gMCkge1xuXHRcdFx0XHR0aGlzLnN0YXRlID0gMTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5hZGRUb2tlbihcIlF1b3RlXCIsICdcIicpO1xuXHRcdFx0dGhpcy5hZHZhbmNlKDEpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cHVibGljIHJ1bk9wZW5RdW90ZSgpIHtcblx0XHRpZiAodGhpcy5zZXBhcmF0b3IgPT0gbnVsbCAmJiB0aGlzLnF1b3RlZCAmJiB0aGlzLnN0YXJ0c1dpdGgoJ1wiJykpIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlID09PSAwKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSAyO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmFkZFRva2VuKFwiT3BlblF1b3RlXCIsICdcIicpO1xuXHRcdFx0dGhpcy5hZHZhbmNlKDEpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cHVibGljIHJ1bkVuZFF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnNlcGFyYXRvciA9PSBudWxsICYmIHRoaXMucXVvdGVkICYmIHRoaXMuc3RhcnRzV2l0aChcIuKAnVwiKSkge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUgPT09IDIpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IDA7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJFbmRRdW90ZVwiLCBcIuKAnVwiKTtcblx0XHRcdHRoaXMuYWR2YW5jZSgxKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBydW5TZXBhcmF0b3IoKSB7XG5cdFx0aWYgKHRoaXMuc2VwYXJhdG9yICE9IG51bGwgJiYgdGhpcy5zdGFydHNXaXRoKHRoaXMuc2VwYXJhdG9yKSkge1xuXHRcdFx0dGhpcy5hZGRUb2tlbihcIlNlcGFyYXRvclwiLCB0aGlzLnNsaWNlKDAsIHRoaXMuc2VwYXJhdG9yLmxlbmd0aCkpO1xuXHRcdFx0dGhpcy5hZHZhbmNlKHRoaXMuc2VwYXJhdG9yLmxlbmd0aCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuV29yZCgpIHtcblx0XHRjb25zdCB3b3JkUmVnZXggPVxuXHRcdFx0dGhpcy5zdGF0ZSA9PT0gMCA/IC9eXFxTKy8gOiB0aGlzLnN0YXRlID09PSAxID8gL15bXlxcc1wiXSsvIDogL15bXlxcc+KAnV0rLztcblxuXHRcdGNvbnN0IHdvcmRNYXRjaCA9IHRoaXMubWF0Y2god29yZFJlZ2V4KTtcblx0XHRpZiAod29yZE1hdGNoKSB7XG5cdFx0XHRpZiAodGhpcy5zZXBhcmF0b3IpIHtcblx0XHRcdFx0aWYgKHdvcmRNYXRjaFswXS50b0xvd2VyQ2FzZSgpID09PSB0aGlzLnNlcGFyYXRvci50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgaW5kZXggPSB3b3JkTWF0Y2hbMF0uaW5kZXhPZih0aGlzLnNlcGFyYXRvcik7XG5cdFx0XHRcdGlmIChpbmRleCA9PT0gLTEpIHtcblx0XHRcdFx0XHR0aGlzLmFkZFRva2VuKFwiV29yZFwiLCB3b3JkTWF0Y2hbMF0pO1xuXHRcdFx0XHRcdHRoaXMuYWR2YW5jZSh3b3JkTWF0Y2hbMF0ubGVuZ3RoKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGFjdHVhbCA9IHdvcmRNYXRjaFswXS5zbGljZSgwLCBpbmRleCk7XG5cdFx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXb3JkXCIsIGFjdHVhbCk7XG5cdFx0XHRcdHRoaXMuYWR2YW5jZShhY3R1YWwubGVuZ3RoKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXb3JkXCIsIHdvcmRNYXRjaFswXSk7XG5cdFx0XHR0aGlzLmFkdmFuY2Uod29yZE1hdGNoWzBdLmxlbmd0aCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuV2hpdGVzcGFjZSgpIHtcblx0XHRjb25zdCB3c01hdGNoID0gdGhpcy5tYXRjaCgvXlxccysvKTtcblx0XHRpZiAod3NNYXRjaCkge1xuXHRcdFx0dGhpcy5hZGRUb2tlbihcIldTXCIsIHdzTWF0Y2hbMF0pO1xuXHRcdFx0dGhpcy5hZHZhbmNlKHdzTWF0Y2hbMF0ubGVuZ3RoKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5jbGFzcyBQYXJzZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IodG9rZW5zLCB7IHNlcGFyYXRlZCB9KSB7XG5cdFx0dGhpcy50b2tlbnMgPSB0b2tlbnM7XG5cdFx0dGhpcy5zZXBhcmF0ZWQgPSBzZXBhcmF0ZWQ7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IDA7XG5cblx0XHR0aGlzLnJlc3VsdHMgPSB7XG5cdFx0XHRhbGw6IFtdLFxuXHRcdFx0cGhyYXNlczogW10sXG5cdFx0XHRmbGFnczogW10sXG5cdFx0XHRvcHRpb25GbGFnczogW11cblx0XHR9O1xuXHR9XG5cblx0cHVibGljIHRva2VuczogYW55O1xuXHRwdWJsaWMgc2VwYXJhdGVkOiBhbnk7XG5cdHB1YmxpYyBwb3NpdGlvbjogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBQaHJhc2VzIGFyZSBgeyB0eXBlOiAnUGhyYXNlJywgdmFsdWUsIHJhdyB9YC5cblx0ICogRmxhZ3MgYXJlIGB7IHR5cGU6ICdGbGFnJywga2V5LCByYXcgfWAuXG5cdCAqIE9wdGlvbiBmbGFncyBhcmUgYHsgdHlwZTogJ09wdGlvbkZsYWcnLCBrZXksIHZhbHVlLCByYXcgfWAuXG5cdCAqIFRoZSBgYWxsYCBwcm9wZXJ0eSBpcyBwYXJ0aXRpb25lZCBpbnRvIGBwaHJhc2VzYCwgYGZsYWdzYCwgYW5kIGBvcHRpb25GbGFnc2AuXG5cdCAqL1xuXHRwdWJsaWMgcmVzdWx0czoge1xuXHRcdGFsbDogYW55W107XG5cdFx0cGhyYXNlczogYW55W107XG5cdFx0ZmxhZ3M6IGFueVtdO1xuXHRcdG9wdGlvbkZsYWdzOiBhbnlbXTtcblx0fTtcblxuXHRwdWJsaWMgbmV4dCgpIHtcblx0XHR0aGlzLnBvc2l0aW9uKys7XG5cdH1cblxuXHRwdWJsaWMgbG9va2FoZWFkTihuLCAuLi50eXBlcykge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uICsgbl0gIT0gbnVsbCAmJlxuXHRcdFx0dHlwZXMuaW5jbHVkZXModGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbiArIG5dLnR5cGUpXG5cdFx0KTtcblx0fVxuXG5cdHB1YmxpYyBsb29rYWhlYWQoLi4udHlwZXMpIHtcblx0XHRyZXR1cm4gdGhpcy5sb29rYWhlYWROKDAsIC4uLnR5cGVzKTtcblx0fVxuXG5cdHB1YmxpYyBtYXRjaCguLi50eXBlcykge1xuXHRcdGlmICh0aGlzLmxvb2thaGVhZCguLi50eXBlcykpIHtcblx0XHRcdHRoaXMubmV4dCgpO1xuXHRcdFx0cmV0dXJuIHRoaXMudG9rZW5zW3RoaXMucG9zaXRpb24gLSAxXTtcblx0XHR9XG5cblx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRgVW5leHBlY3RlZCB0b2tlbiAke3RoaXMudG9rZW5zW3RoaXMucG9zaXRpb25dLnZhbHVlfSBvZiB0eXBlICR7XG5cdFx0XHRcdHRoaXMudG9rZW5zW3RoaXMucG9zaXRpb25dLnR5cGVcblx0XHRcdH0gKHRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbilgXG5cdFx0KTtcblx0fVxuXG5cdHB1YmxpYyBwYXJzZSgpIHtcblx0XHQvLyAtMSBmb3IgRU9GLlxuXHRcdHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy50b2tlbnMubGVuZ3RoIC0gMSkge1xuXHRcdFx0dGhpcy5ydW5Bcmd1bWVudCgpO1xuXHRcdH1cblxuXHRcdHRoaXMubWF0Y2goXCJFT0ZcIik7XG5cdFx0cmV0dXJuIHRoaXMucmVzdWx0cztcblx0fVxuXG5cdHB1YmxpYyBydW5Bcmd1bWVudCgpIHtcblx0XHRjb25zdCBsZWFkaW5nID0gdGhpcy5sb29rYWhlYWQoXCJXU1wiKSA/IHRoaXMubWF0Y2goXCJXU1wiKS52YWx1ZSA6IFwiXCI7XG5cdFx0aWYgKHRoaXMubG9va2FoZWFkKFwiRmxhZ1dvcmRcIiwgXCJPcHRpb25GbGFnV29yZFwiKSkge1xuXHRcdFx0Y29uc3QgcGFyc2VkID0gdGhpcy5wYXJzZUZsYWcoKTtcblx0XHRcdGNvbnN0IHRyYWlsaW5nID0gdGhpcy5sb29rYWhlYWQoXCJXU1wiKSA/IHRoaXMubWF0Y2goXCJXU1wiKS52YWx1ZSA6IFwiXCI7XG5cdFx0XHRjb25zdCBzZXBhcmF0b3IgPSB0aGlzLmxvb2thaGVhZChcIlNlcGFyYXRvclwiKVxuXHRcdFx0XHQ/IHRoaXMubWF0Y2goXCJTZXBhcmF0b3JcIikudmFsdWVcblx0XHRcdFx0OiBcIlwiO1xuXHRcdFx0cGFyc2VkLnJhdyA9IGAke2xlYWRpbmd9JHtwYXJzZWQucmF3fSR7dHJhaWxpbmd9JHtzZXBhcmF0b3J9YDtcblx0XHRcdHRoaXMucmVzdWx0cy5hbGwucHVzaChwYXJzZWQpO1xuXHRcdFx0aWYgKHBhcnNlZC50eXBlID09PSBcIkZsYWdcIikge1xuXHRcdFx0XHR0aGlzLnJlc3VsdHMuZmxhZ3MucHVzaChwYXJzZWQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5yZXN1bHRzLm9wdGlvbkZsYWdzLnB1c2gocGFyc2VkKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHBhcnNlZCA9IHRoaXMucGFyc2VQaHJhc2UoKTtcblx0XHRjb25zdCB0cmFpbGluZyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikudmFsdWUgOiBcIlwiO1xuXHRcdGNvbnN0IHNlcGFyYXRvciA9IHRoaXMubG9va2FoZWFkKFwiU2VwYXJhdG9yXCIpXG5cdFx0XHQ/IHRoaXMubWF0Y2goXCJTZXBhcmF0b3JcIikudmFsdWVcblx0XHRcdDogXCJcIjtcblx0XHRwYXJzZWQucmF3ID0gYCR7bGVhZGluZ30ke3BhcnNlZC5yYXd9JHt0cmFpbGluZ30ke3NlcGFyYXRvcn1gO1xuXHRcdHRoaXMucmVzdWx0cy5hbGwucHVzaChwYXJzZWQpO1xuXHRcdHRoaXMucmVzdWx0cy5waHJhc2VzLnB1c2gocGFyc2VkKTtcblx0fVxuXG5cdHB1YmxpYyBwYXJzZUZsYWcoKSB7XG5cdFx0aWYgKHRoaXMubG9va2FoZWFkKFwiRmxhZ1dvcmRcIikpIHtcblx0XHRcdGNvbnN0IGZsYWcgPSB0aGlzLm1hdGNoKFwiRmxhZ1dvcmRcIik7XG5cdFx0XHRjb25zdCBwYXJzZWQgPSB7IHR5cGU6IFwiRmxhZ1wiLCBrZXk6IGZsYWcudmFsdWUsIHJhdzogZmxhZy52YWx1ZSB9O1xuXHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHR9XG5cblx0XHQvLyBPdGhlcndpc2UsIGB0aGlzLmxvb2thaGVhZCgnT3B0aW9uRmxhZ1dvcmQnKWAgc2hvdWxkIGJlIHRydWUuXG5cdFx0Y29uc3QgZmxhZyA9IHRoaXMubWF0Y2goXCJPcHRpb25GbGFnV29yZFwiKTtcblx0XHRjb25zdCBwYXJzZWQgPSB7XG5cdFx0XHR0eXBlOiBcIk9wdGlvbkZsYWdcIixcblx0XHRcdGtleTogZmxhZy52YWx1ZSxcblx0XHRcdHZhbHVlOiBcIlwiLFxuXHRcdFx0cmF3OiBmbGFnLnZhbHVlXG5cdFx0fTtcblx0XHRjb25zdCB3cyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikgOiBudWxsO1xuXHRcdGlmICh3cyAhPSBudWxsKSB7XG5cdFx0XHRwYXJzZWQucmF3ICs9IHdzLnZhbHVlO1xuXHRcdH1cblxuXHRcdGNvbnN0IHBocmFzZSA9IHRoaXMubG9va2FoZWFkKFwiUXVvdGVcIiwgXCJPcGVuUXVvdGVcIiwgXCJFbmRRdW90ZVwiLCBcIldvcmRcIilcblx0XHRcdD8gdGhpcy5wYXJzZVBocmFzZSgpXG5cdFx0XHQ6IG51bGw7XG5cblx0XHRpZiAocGhyYXNlICE9IG51bGwpIHtcblx0XHRcdHBhcnNlZC52YWx1ZSA9IHBocmFzZS52YWx1ZTtcblx0XHRcdHBhcnNlZC5yYXcgKz0gcGhyYXNlLnJhdztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG5cblx0cHVibGljIHBhcnNlUGhyYXNlKCkge1xuXHRcdGlmICghdGhpcy5zZXBhcmF0ZWQpIHtcblx0XHRcdGlmICh0aGlzLmxvb2thaGVhZChcIlF1b3RlXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJQaHJhc2VcIiwgdmFsdWU6IFwiXCIsIHJhdzogXCJcIiB9O1xuXHRcdFx0XHRjb25zdCBvcGVuUXVvdGUgPSB0aGlzLm1hdGNoKFwiUXVvdGVcIik7XG5cdFx0XHRcdHBhcnNlZC5yYXcgKz0gb3BlblF1b3RlLnZhbHVlO1xuXHRcdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXb3JkXCIsIFwiV1NcIikpIHtcblx0XHRcdFx0XHRjb25zdCBtYXRjaCA9IHRoaXMubWF0Y2goXCJXb3JkXCIsIFwiV1NcIik7XG5cdFx0XHRcdFx0cGFyc2VkLnZhbHVlICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBlbmRRdW90ZSA9IHRoaXMubG9va2FoZWFkKFwiUXVvdGVcIikgPyB0aGlzLm1hdGNoKFwiUXVvdGVcIikgOiBudWxsO1xuXHRcdFx0XHRpZiAoZW5kUXVvdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gZW5kUXVvdGUudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJPcGVuUXVvdGVcIikpIHtcblx0XHRcdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogXCJcIiwgcmF3OiBcIlwiIH07XG5cdFx0XHRcdGNvbnN0IG9wZW5RdW90ZSA9IHRoaXMubWF0Y2goXCJPcGVuUXVvdGVcIik7XG5cdFx0XHRcdHBhcnNlZC5yYXcgKz0gb3BlblF1b3RlLnZhbHVlO1xuXHRcdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXb3JkXCIsIFwiV1NcIikpIHtcblx0XHRcdFx0XHRjb25zdCBtYXRjaCA9IHRoaXMubWF0Y2goXCJXb3JkXCIsIFwiV1NcIik7XG5cdFx0XHRcdFx0aWYgKG1hdGNoLnR5cGUgPT09IFwiV29yZFwiKSB7XG5cdFx0XHRcdFx0XHRwYXJzZWQudmFsdWUgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGVuZFF1b3RlID0gdGhpcy5sb29rYWhlYWQoXCJFbmRRdW90ZVwiKVxuXHRcdFx0XHRcdD8gdGhpcy5tYXRjaChcIkVuZFF1b3RlXCIpXG5cdFx0XHRcdFx0OiBudWxsO1xuXHRcdFx0XHRpZiAoZW5kUXVvdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gZW5kUXVvdGUudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJFbmRRdW90ZVwiKSkge1xuXHRcdFx0XHRjb25zdCBlbmRRdW90ZSA9IHRoaXMubWF0Y2goXCJFbmRRdW90ZVwiKTtcblx0XHRcdFx0Y29uc3QgcGFyc2VkID0ge1xuXHRcdFx0XHRcdHR5cGU6IFwiUGhyYXNlXCIsXG5cdFx0XHRcdFx0dmFsdWU6IGVuZFF1b3RlLnZhbHVlLFxuXHRcdFx0XHRcdHJhdzogZW5kUXVvdGUudmFsdWVcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5zZXBhcmF0ZWQpIHtcblx0XHRcdGNvbnN0IGluaXQgPSB0aGlzLm1hdGNoKFwiV29yZFwiKTtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJQaHJhc2VcIiwgdmFsdWU6IGluaXQudmFsdWUsIHJhdzogaW5pdC52YWx1ZSB9O1xuXHRcdFx0d2hpbGUgKHRoaXMubG9va2FoZWFkKFwiV1NcIikgJiYgdGhpcy5sb29rYWhlYWROKDEsIFwiV29yZFwiKSkge1xuXHRcdFx0XHRjb25zdCB3cyA9IHRoaXMubWF0Y2goXCJXU1wiKTtcblx0XHRcdFx0Y29uc3Qgd29yZCA9IHRoaXMubWF0Y2goXCJXb3JkXCIpO1xuXHRcdFx0XHRwYXJzZWQudmFsdWUgKz0gd3MudmFsdWUgKyB3b3JkLnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRwYXJzZWQucmF3ID0gcGFyc2VkLnZhbHVlO1xuXHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHR9XG5cblx0XHRjb25zdCB3b3JkID0gdGhpcy5tYXRjaChcIldvcmRcIik7XG5cdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogd29yZC52YWx1ZSwgcmF3OiB3b3JkLnZhbHVlIH07XG5cdFx0cmV0dXJuIHBhcnNlZDtcblx0fVxufVxuXG4vKipcbiAqIFBhcnNlcyBjb250ZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250ZW50UGFyc2VyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKHtcblx0XHRmbGFnV29yZHMgPSBbXSxcblx0XHRvcHRpb25GbGFnV29yZHMgPSBbXSxcblx0XHRxdW90ZWQgPSB0cnVlLFxuXHRcdHNlcGFyYXRvclxuXHR9OiBDb250ZW50UGFyc2VyT3B0aW9ucyA9IHt9KSB7XG5cdFx0dGhpcy5mbGFnV29yZHMgPSBmbGFnV29yZHM7XG5cdFx0dGhpcy5mbGFnV29yZHMuc29ydCgoYSwgYikgPT4gYi5sZW5ndGggLSBhLmxlbmd0aCk7XG5cblx0XHR0aGlzLm9wdGlvbkZsYWdXb3JkcyA9IG9wdGlvbkZsYWdXb3Jkcztcblx0XHR0aGlzLm9wdGlvbkZsYWdXb3Jkcy5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKTtcblxuXHRcdHRoaXMucXVvdGVkID0gQm9vbGVhbihxdW90ZWQpO1xuXHRcdHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgZmxhZ3MuXG5cdCAqL1xuXHRwdWJsaWMgZmxhZ1dvcmRzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogV29yZHMgY29uc2lkZXJlZCBvcHRpb24gZmxhZ3MuXG5cdCAqL1xuXHRwdWJsaWMgb3B0aW9uRmxhZ1dvcmRzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogV2hldGhlciB0byBwYXJzZSBxdW90ZXMuIERlZmF1bHRzIHRvIGB0cnVlYC5cblx0ICovXG5cdHB1YmxpYyBxdW90ZWQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdG8gcGFyc2UgYSBzZXBhcmF0b3IuXG5cdCAqL1xuXHRwdWJsaWMgc2VwYXJhdG9yOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFBhcnNlcyBjb250ZW50LlxuXHQgKiBAcGFyYW0gY29udGVudCAtIENvbnRlbnQgdG8gcGFyc2UuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2UoY29udGVudDogc3RyaW5nKTogQ29udGVudFBhcnNlclJlc3VsdCB7XG5cdFx0Y29uc3QgdG9rZW5zID0gbmV3IFRva2VuaXplcihjb250ZW50LCB7XG5cdFx0XHRmbGFnV29yZHM6IHRoaXMuZmxhZ1dvcmRzLFxuXHRcdFx0b3B0aW9uRmxhZ1dvcmRzOiB0aGlzLm9wdGlvbkZsYWdXb3Jkcyxcblx0XHRcdHF1b3RlZDogdGhpcy5xdW90ZWQsXG5cdFx0XHRzZXBhcmF0b3I6IHRoaXMuc2VwYXJhdG9yXG5cdFx0fSkudG9rZW5pemUoKTtcblxuXHRcdHJldHVybiBuZXcgUGFyc2VyKHRva2VucywgeyBzZXBhcmF0ZWQ6IHRoaXMuc2VwYXJhdG9yICE9IG51bGwgfSkucGFyc2UoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFeHRyYWN0cyB0aGUgZmxhZ3MgZnJvbSBhcmd1bWVudCBvcHRpb25zLlxuXHQgKiBAcGFyYW0gYXJncyAtIEFyZ3VtZW50IG9wdGlvbnMuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGdldEZsYWdzKGFyZ3M6IEFyZ3VtZW50T3B0aW9uc1tdKTogRXh0cmFjdGVkRmxhZ3Mge1xuXHRcdGNvbnN0IHJlcyA9IHtcblx0XHRcdGZsYWdXb3JkczogW10sXG5cdFx0XHRvcHRpb25GbGFnV29yZHM6IFtdXG5cdFx0fTtcblxuXHRcdGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpIHtcblx0XHRcdGNvbnN0IGFyciA9XG5cdFx0XHRcdHJlc1tcblx0XHRcdFx0XHRhcmcubWF0Y2ggPT09IEFyZ3VtZW50TWF0Y2hlcy5GTEFHID8gXCJmbGFnV29yZHNcIiA6IFwib3B0aW9uRmxhZ1dvcmRzXCJcblx0XHRcdFx0XTtcblx0XHRcdGlmIChcblx0XHRcdFx0YXJnLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuRkxBRyB8fFxuXHRcdFx0XHRhcmcubWF0Y2ggPT09IEFyZ3VtZW50TWF0Y2hlcy5PUFRJT05cblx0XHRcdCkge1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShhcmcuZmxhZykpIHtcblx0XHRcdFx0XHRhcnIucHVzaCguLi5hcmcuZmxhZyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXJyLnB1c2goYXJnLmZsYWcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlcztcblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHRoZSBjb250ZW50IHBhcnNlci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZW50UGFyc2VyT3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBXb3JkcyBjb25zaWRlcmVkIGZsYWdzLlxuXHQgKi9cblx0ZmxhZ1dvcmRzPzogc3RyaW5nW107XG5cdC8qKlxuXHQgKiBXb3JkcyBjb25zaWRlcmVkIG9wdGlvbiBmbGFncy5cblx0ICovXG5cdG9wdGlvbkZsYWdXb3Jkcz86IHN0cmluZ1tdO1xuXHQvKipcblx0ICogV2hldGhlciB0byBwYXJzZSBxdW90ZXMuIERlZmF1bHRzIHRvIGB0cnVlYC5cblx0ICovXG5cdHF1b3RlZD86IGJvb2xlYW47XG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRvIHBhcnNlIGEgc2VwYXJhdG9yLlxuXHQgKi9cblx0c2VwYXJhdG9yPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlc3VsdCBvZiBwYXJzaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRlbnRQYXJzZXJSZXN1bHQge1xuXHQvKipcblx0ICogQWxsIHBocmFzZXMgYW5kIGZsYWdzLlxuXHQgKi9cblx0YWxsOiBTdHJpbmdEYXRhW107XG5cblx0LyoqXG5cdCAqIFBocmFzZXMuXG5cdCAqL1xuXHRwaHJhc2VzOiBTdHJpbmdEYXRhW107XG5cblx0LyoqXG5cdCAqIEZsYWdzLlxuXHQgKi9cblx0ZmxhZ3M6IFN0cmluZ0RhdGFbXTtcblxuXHQvKipcblx0ICogT3B0aW9uIGZsYWdzLlxuXHQgKi9cblx0b3B0aW9uRmxhZ3M6IFN0cmluZ0RhdGFbXTtcbn1cblxuLyoqXG4gKiBBIHNpbmdsZSBwaHJhc2Ugb3IgZmxhZy5cbiAqL1xuZXhwb3J0IHR5cGUgU3RyaW5nRGF0YSA9XG5cdHwge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbmUgb2YgJ1BocmFzZScsICdGbGFnJywgJ09wdGlvbkZsYWcnLlxuXHRcdFx0ICovXG5cdFx0XHR0eXBlOiBcIlBocmFzZVwiO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSB2YWx1ZSBvZiBhICdQaHJhc2UnIG9yICdPcHRpb25GbGFnJy5cblx0XHRcdCAqL1xuXHRcdFx0dmFsdWU6IHN0cmluZztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgcmF3IHN0cmluZyB3aXRoIHdoaXRlc3BhY2UgYW5kL29yIHNlcGFyYXRvci5cblx0XHRcdCAqL1xuXHRcdFx0cmF3OiBzdHJpbmc7XG5cdCAgfVxuXHR8IHtcblx0XHRcdC8qKlxuXHRcdFx0ICogT25lIG9mICdQaHJhc2UnLCAnRmxhZycsICdPcHRpb25GbGFnJy5cblx0XHRcdCAqL1xuXHRcdFx0dHlwZTogXCJGbGFnXCI7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIGtleSBvZiBhICdGbGFnJyBvciAnT3B0aW9uRmxhZycuXG5cdFx0XHQgKi9cblx0XHRcdGtleTogc3RyaW5nO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSByYXcgc3RyaW5nIHdpdGggd2hpdGVzcGFjZSBhbmQvb3Igc2VwYXJhdG9yLlxuXHRcdFx0ICovXG5cdFx0XHRyYXc6IHN0cmluZztcblx0ICB9XG5cdHwge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbmUgb2YgJ1BocmFzZScsICdGbGFnJywgJ09wdGlvbkZsYWcnLlxuXHRcdFx0ICovXG5cdFx0XHR0eXBlOiBcIk9wdGlvbkZsYWdcIjtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUga2V5IG9mIGEgJ0ZsYWcnIG9yICdPcHRpb25GbGFnJy5cblx0XHRcdCAqL1xuXHRcdFx0a2V5OiBzdHJpbmc7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIHZhbHVlIG9mIGEgJ1BocmFzZScgb3IgJ09wdGlvbkZsYWcnLlxuXHRcdFx0ICovXG5cdFx0XHR2YWx1ZTogc3RyaW5nO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSByYXcgc3RyaW5nIHdpdGggd2hpdGVzcGFjZSBhbmQvb3Igc2VwYXJhdG9yLlxuXHRcdFx0ICovXG5cdFx0XHRyYXc6IHN0cmluZztcblx0ICB9O1xuXG4vKipcbiAqIEZsYWdzIGV4dHJhY3RlZCBmcm9tIGFuIGFyZ3VtZW50IGxpc3QuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXh0cmFjdGVkRmxhZ3Mge1xuXHQvKipcblx0ICogV29yZHMgY29uc2lkZXJlZCBmbGFncy5cblx0ICovXG5cdGZsYWdXb3Jkcz86IHN0cmluZ1tdO1xuXHQvKipcblx0ICogV29yZHMgY29uc2lkZXJlZCBvcHRpb24gZmxhZ3MuXG5cdCAqL1xuXHRvcHRpb25GbGFnV29yZHM/OiBzdHJpbmdbXTtcbn1cbiJdfQ==