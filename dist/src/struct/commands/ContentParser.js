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
        return this.content.slice(this.position, this.position + str.length).toLowerCase() === str.toLowerCase();
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
        return this.tokens[this.position + n] != null && types.includes(this.tokens[this.position + n].type);
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
            const separator = this.lookahead("Separator") ? this.match("Separator").value : "";
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
        const separator = this.lookahead("Separator") ? this.match("Separator").value : "";
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
        const phrase = this.lookahead("Quote", "OpenQuote", "EndQuote", "Word") ? this.parsePhrase() : null;
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
            if (arg.match === Constants_1.ArgumentMatches.FLAG || arg.match === Constants_1.ArgumentMatches.OPTION) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGVudFBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvQ29udGVudFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUF1RDtBQUd2RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbURHO0FBRUgsTUFBTSxTQUFTO0lBQ2QsWUFDQyxPQUFlLEVBQ2YsRUFBRSxTQUFTLEdBQUcsRUFBRSxFQUFFLGVBQWUsR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLElBQUksRUFBRSxTQUFTLEtBQTJCLEVBQUU7UUFFN0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsMkRBQTJEO1FBQzNELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVNLE9BQU8sQ0FBUztJQUNoQixTQUFTLENBQVc7SUFDcEIsZUFBZSxDQUFXO0lBQzFCLE1BQU0sQ0FBVTtJQUNoQixTQUFTLENBQVU7SUFDbkIsUUFBUSxDQUFTO0lBQ2pCLEtBQUssQ0FBUztJQUNkLE1BQU0sQ0FBUTtJQUVkLFVBQVUsQ0FBQyxHQUFXO1FBQzVCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFX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LE1BQU0sR0FBRyxHQUFHO1lBQ1gsU0FBUyxFQUFFLEVBQUU7WUFDYixlQUFlLEVBQUUsRUFBRTtTQUNuQixDQUFDO1FBRUYsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7WUFDdkIsTUFBTSxHQUFHLEdBQWdCLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLDJCQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDbkcsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLDJCQUFlLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssMkJBQWUsQ0FBQyxNQUFNLEVBQUU7Z0JBQy9FLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzVCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3RCO3FCQUFNO29CQUNOLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuQjthQUNEO1NBQ0Q7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FDRDtBQXRFRCxnQ0FzRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcmd1bWVudE1hdGNoZXMgfSBmcm9tIFwiLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCB7IEFyZ3VtZW50T3B0aW9ucyB9IGZyb20gXCIuL2FyZ3VtZW50cy9Bcmd1bWVudFwiO1xuXG4vKlxuICogR3JhbW1hcjpcbiAqXG4gKiBBcmd1bWVudHNcbiAqICA9IChBcmd1bWVudCAoV1M/IEFyZ3VtZW50KSopPyBFT0ZcbiAqXG4gKiBBcmd1bWVudFxuICogID0gRmxhZ1xuICogIHwgUGhyYXNlXG4gKlxuICogRmxhZ1xuICogID0gRmxhZ1dvcmRcbiAqICB8IE9wdGlvbkZsYWdXb3JkIFdTPyBQaHJhc2U/XG4gKlxuICogUGhyYXNlXG4gKiAgPSBRdW90ZSAoV29yZCB8IFdTKSogUXVvdGU/XG4gKiAgfCBPcGVuUXVvdGUgKFdvcmQgfCBPcGVuUXVvdGUgfCBRdW90ZSB8IFdTKSogRW5kUXVvdGU/XG4gKiAgfCBFbmRRdW90ZVxuICogIHwgV29yZFxuICpcbiAqIEZsYWdXb3JkID0gR2l2ZW5cbiAqIE9wdGlvbkZsYWdXb3JkID0gR2l2ZW5cbiAqIFF1b3RlID0gXCJcbiAqIE9wZW5RdW90ZSA9IOKAnFxuICogRW5kUXVvdGUgPSDigJ1cbiAqIFdvcmQgPSAvXlxcUysvIChhbmQgbm90IGluIEZsYWdXb3JkIG9yIE9wdGlvbkZsYWdXb3JkKVxuICogV1MgPSAvXlxccysvXG4gKiBFT0YgPSAvXiQvXG4gKlxuICogV2l0aCBhIHNlcGFyYXRvcjpcbiAqXG4gKiBBcmd1bWVudHNcbiAqICA9IChBcmd1bWVudCAoV1M/IFNlcGFyYXRvciBXUz8gQXJndW1lbnQpKik/IEVPRlxuICpcbiAqIEFyZ3VtZW50XG4gKiAgPSBGbGFnXG4gKiAgfCBQaHJhc2VcbiAqXG4gKiBGbGFnXG4gKiAgPSBGbGFnV29yZFxuICogIHwgT3B0aW9uRmxhZ1dvcmQgV1M/IFBocmFzZT9cbiAqXG4gKiBQaHJhc2VcbiAqICA9IFdvcmQgKFdTIFdvcmQpKlxuICpcbiAqIEZsYWdXb3JkID0gR2l2ZW5cbiAqIE9wdGlvbkZsYWdXb3JkID0gR2l2ZW5cbiAqIFNlcGFyYXRvciA9IEdpdmVuXG4gKiBXb3JkID0gL15cXFMrLyAoYW5kIG5vdCBpbiBGbGFnV29yZCBvciBPcHRpb25GbGFnV29yZCBvciBlcXVhbCB0byBTZXBhcmF0b3IpXG4gKiBXUyA9IC9eXFxzKy9cbiAqIEVPRiA9IC9eJC9cbiAqL1xuXG5jbGFzcyBUb2tlbml6ZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y29udGVudDogc3RyaW5nLFxuXHRcdHsgZmxhZ1dvcmRzID0gW10sIG9wdGlvbkZsYWdXb3JkcyA9IFtdLCBxdW90ZWQgPSB0cnVlLCBzZXBhcmF0b3IgfTogQ29udGVudFBhcnNlck9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHR0aGlzLmNvbnRlbnQgPSBjb250ZW50O1xuXHRcdHRoaXMuZmxhZ1dvcmRzID0gZmxhZ1dvcmRzO1xuXHRcdHRoaXMub3B0aW9uRmxhZ1dvcmRzID0gb3B0aW9uRmxhZ1dvcmRzO1xuXHRcdHRoaXMucXVvdGVkID0gcXVvdGVkO1xuXHRcdHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuXHRcdHRoaXMucG9zaXRpb24gPSAwO1xuXHRcdC8vIDAgLT4gRGVmYXVsdCwgMSAtPiBRdW90ZXMgKFwiXCIpLCAyIC0+IFNwZWNpYWwgUXVvdGVzICjigJzigJ0pXG5cdFx0dGhpcy5zdGF0ZSA9IDA7XG5cdFx0dGhpcy50b2tlbnMgPSBbXTtcblx0fVxuXG5cdHB1YmxpYyBjb250ZW50OiBzdHJpbmc7XG5cdHB1YmxpYyBmbGFnV29yZHM6IHN0cmluZ1tdO1xuXHRwdWJsaWMgb3B0aW9uRmxhZ1dvcmRzOiBzdHJpbmdbXTtcblx0cHVibGljIHF1b3RlZDogYm9vbGVhbjtcblx0cHVibGljIHNlcGFyYXRvcj86IHN0cmluZztcblx0cHVibGljIHBvc2l0aW9uOiBudW1iZXI7XG5cdHB1YmxpYyBzdGF0ZTogbnVtYmVyO1xuXHRwdWJsaWMgdG9rZW5zOiBhbnlbXTtcblxuXHRwdWJsaWMgc3RhcnRzV2l0aChzdHI6IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQuc2xpY2UodGhpcy5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbiArIHN0ci5sZW5ndGgpLnRvTG93ZXJDYXNlKCkgPT09IHN0ci50b0xvd2VyQ2FzZSgpO1xuXHR9XG5cblx0cHVibGljIG1hdGNoKHJlZ2V4OiBSZWdFeHApIHtcblx0XHRyZXR1cm4gdGhpcy5jb250ZW50LnNsaWNlKHRoaXMucG9zaXRpb24pLm1hdGNoKHJlZ2V4KTtcblx0fVxuXG5cdHB1YmxpYyBzbGljZShmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIpIHtcblx0XHRyZXR1cm4gdGhpcy5jb250ZW50LnNsaWNlKHRoaXMucG9zaXRpb24gKyBmcm9tLCB0aGlzLnBvc2l0aW9uICsgdG8pO1xuXHR9XG5cblx0cHVibGljIGFkZFRva2VuKHR5cGU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuXHRcdHRoaXMudG9rZW5zLnB1c2goeyB0eXBlLCB2YWx1ZSB9KTtcblx0fVxuXG5cdHB1YmxpYyBhZHZhbmNlKG46IG51bWJlcikge1xuXHRcdHRoaXMucG9zaXRpb24gKz0gbjtcblx0fVxuXG5cdHB1YmxpYyBjaG9pY2UoXG5cdFx0Li4uYWN0aW9uczoge1xuXHRcdFx0KCk6IGJvb2xlYW47XG5cdFx0XHQoKTogYm9vbGVhbjtcblx0XHRcdCgpOiBib29sZWFuO1xuXHRcdFx0KCk6IGJvb2xlYW47XG5cdFx0XHQoKTogYm9vbGVhbjtcblx0XHRcdCgpOiBib29sZWFuO1xuXHRcdFx0KCk6IGJvb2xlYW47XG5cdFx0XHQoKTogYm9vbGVhbjtcblx0XHR9W11cblx0KSB7XG5cdFx0Zm9yIChjb25zdCBhY3Rpb24gb2YgYWN0aW9ucykge1xuXHRcdFx0aWYgKGFjdGlvbi5jYWxsKHRoaXMpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgdG9rZW5pemUoKSB7XG5cdFx0d2hpbGUgKHRoaXMucG9zaXRpb24gPCB0aGlzLmNvbnRlbnQubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnJ1bk9uZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuYWRkVG9rZW4oXCJFT0ZcIiwgXCJcIik7XG5cdFx0cmV0dXJuIHRoaXMudG9rZW5zO1xuXHR9XG5cblx0cHVibGljIHJ1bk9uZSgpIHtcblx0XHR0aGlzLmNob2ljZShcblx0XHRcdHRoaXMucnVuV2hpdGVzcGFjZSxcblx0XHRcdHRoaXMucnVuRmxhZ3MsXG5cdFx0XHR0aGlzLnJ1bk9wdGlvbkZsYWdzLFxuXHRcdFx0dGhpcy5ydW5RdW90ZSxcblx0XHRcdHRoaXMucnVuT3BlblF1b3RlLFxuXHRcdFx0dGhpcy5ydW5FbmRRdW90ZSxcblx0XHRcdHRoaXMucnVuU2VwYXJhdG9yLFxuXHRcdFx0dGhpcy5ydW5Xb3JkXG5cdFx0KTtcblx0fVxuXG5cdHB1YmxpYyBydW5GbGFncygpIHtcblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gMCkge1xuXHRcdFx0Zm9yIChjb25zdCB3b3JkIG9mIHRoaXMuZmxhZ1dvcmRzKSB7XG5cdFx0XHRcdGlmICh0aGlzLnN0YXJ0c1dpdGgod29yZCkpIHtcblx0XHRcdFx0XHR0aGlzLmFkZFRva2VuKFwiRmxhZ1dvcmRcIiwgdGhpcy5zbGljZSgwLCB3b3JkLmxlbmd0aCkpO1xuXHRcdFx0XHRcdHRoaXMuYWR2YW5jZSh3b3JkLmxlbmd0aCk7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuT3B0aW9uRmxhZ3MoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdGZvciAoY29uc3Qgd29yZCBvZiB0aGlzLm9wdGlvbkZsYWdXb3Jkcykge1xuXHRcdFx0XHRpZiAodGhpcy5zdGFydHNXaXRoKHdvcmQpKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRUb2tlbihcIk9wdGlvbkZsYWdXb3JkXCIsIHRoaXMuc2xpY2UoMCwgd29yZC5sZW5ndGgpKTtcblx0XHRcdFx0XHR0aGlzLmFkdmFuY2Uod29yZC5sZW5ndGgpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cHVibGljIHJ1blF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnNlcGFyYXRvciA9PSBudWxsICYmIHRoaXMucXVvdGVkICYmIHRoaXMuc3RhcnRzV2l0aCgnXCInKSkge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUgPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IDA7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IDE7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJRdW90ZVwiLCAnXCInKTtcblx0XHRcdHRoaXMuYWR2YW5jZSgxKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBydW5PcGVuUXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMuc2VwYXJhdG9yID09IG51bGwgJiYgdGhpcy5xdW90ZWQgJiYgdGhpcy5zdGFydHNXaXRoKCdcIicpKSB7XG5cdFx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gMCkge1xuXHRcdFx0XHR0aGlzLnN0YXRlID0gMjtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5hZGRUb2tlbihcIk9wZW5RdW90ZVwiLCAnXCInKTtcblx0XHRcdHRoaXMuYWR2YW5jZSgxKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBydW5FbmRRdW90ZSgpIHtcblx0XHRpZiAodGhpcy5zZXBhcmF0b3IgPT0gbnVsbCAmJiB0aGlzLnF1b3RlZCAmJiB0aGlzLnN0YXJ0c1dpdGgoXCLigJ1cIikpIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlID09PSAyKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmFkZFRva2VuKFwiRW5kUXVvdGVcIiwgXCLigJ1cIik7XG5cdFx0XHR0aGlzLmFkdmFuY2UoMSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuU2VwYXJhdG9yKCkge1xuXHRcdGlmICh0aGlzLnNlcGFyYXRvciAhPSBudWxsICYmIHRoaXMuc3RhcnRzV2l0aCh0aGlzLnNlcGFyYXRvcikpIHtcblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJTZXBhcmF0b3JcIiwgdGhpcy5zbGljZSgwLCB0aGlzLnNlcGFyYXRvci5sZW5ndGgpKTtcblx0XHRcdHRoaXMuYWR2YW5jZSh0aGlzLnNlcGFyYXRvci5sZW5ndGgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cHVibGljIHJ1bldvcmQoKSB7XG5cdFx0Y29uc3Qgd29yZFJlZ2V4ID0gdGhpcy5zdGF0ZSA9PT0gMCA/IC9eXFxTKy8gOiB0aGlzLnN0YXRlID09PSAxID8gL15bXlxcc1wiXSsvIDogL15bXlxcc+KAnV0rLztcblxuXHRcdGNvbnN0IHdvcmRNYXRjaCA9IHRoaXMubWF0Y2god29yZFJlZ2V4KTtcblx0XHRpZiAod29yZE1hdGNoKSB7XG5cdFx0XHRpZiAodGhpcy5zZXBhcmF0b3IpIHtcblx0XHRcdFx0aWYgKHdvcmRNYXRjaFswXS50b0xvd2VyQ2FzZSgpID09PSB0aGlzLnNlcGFyYXRvci50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgaW5kZXggPSB3b3JkTWF0Y2hbMF0uaW5kZXhPZih0aGlzLnNlcGFyYXRvcik7XG5cdFx0XHRcdGlmIChpbmRleCA9PT0gLTEpIHtcblx0XHRcdFx0XHR0aGlzLmFkZFRva2VuKFwiV29yZFwiLCB3b3JkTWF0Y2hbMF0pO1xuXHRcdFx0XHRcdHRoaXMuYWR2YW5jZSh3b3JkTWF0Y2hbMF0ubGVuZ3RoKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGFjdHVhbCA9IHdvcmRNYXRjaFswXS5zbGljZSgwLCBpbmRleCk7XG5cdFx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXb3JkXCIsIGFjdHVhbCk7XG5cdFx0XHRcdHRoaXMuYWR2YW5jZShhY3R1YWwubGVuZ3RoKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXb3JkXCIsIHdvcmRNYXRjaFswXSk7XG5cdFx0XHR0aGlzLmFkdmFuY2Uod29yZE1hdGNoWzBdLmxlbmd0aCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuV2hpdGVzcGFjZSgpIHtcblx0XHRjb25zdCB3c01hdGNoID0gdGhpcy5tYXRjaCgvXlxccysvKTtcblx0XHRpZiAod3NNYXRjaCkge1xuXHRcdFx0dGhpcy5hZGRUb2tlbihcIldTXCIsIHdzTWF0Y2hbMF0pO1xuXHRcdFx0dGhpcy5hZHZhbmNlKHdzTWF0Y2hbMF0ubGVuZ3RoKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5jbGFzcyBQYXJzZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IodG9rZW5zOiBhbnlbXSwgeyBzZXBhcmF0ZWQgfTogeyBzZXBhcmF0ZWQ6IGJvb2xlYW4gfSkge1xuXHRcdHRoaXMudG9rZW5zID0gdG9rZW5zO1xuXHRcdHRoaXMuc2VwYXJhdGVkID0gc2VwYXJhdGVkO1xuXHRcdHRoaXMucG9zaXRpb24gPSAwO1xuXG5cdFx0dGhpcy5yZXN1bHRzID0ge1xuXHRcdFx0YWxsOiBbXSxcblx0XHRcdHBocmFzZXM6IFtdLFxuXHRcdFx0ZmxhZ3M6IFtdLFxuXHRcdFx0b3B0aW9uRmxhZ3M6IFtdXG5cdFx0fTtcblx0fVxuXG5cdHB1YmxpYyB0b2tlbnM6IGFueTtcblx0cHVibGljIHNlcGFyYXRlZDogYW55O1xuXHRwdWJsaWMgcG9zaXRpb246IG51bWJlcjtcblxuXHQvKipcblx0ICogUGhyYXNlcyBhcmUgYHsgdHlwZTogJ1BocmFzZScsIHZhbHVlLCByYXcgfWAuXG5cdCAqIEZsYWdzIGFyZSBgeyB0eXBlOiAnRmxhZycsIGtleSwgcmF3IH1gLlxuXHQgKiBPcHRpb24gZmxhZ3MgYXJlIGB7IHR5cGU6ICdPcHRpb25GbGFnJywga2V5LCB2YWx1ZSwgcmF3IH1gLlxuXHQgKiBUaGUgYGFsbGAgcHJvcGVydHkgaXMgcGFydGl0aW9uZWQgaW50byBgcGhyYXNlc2AsIGBmbGFnc2AsIGFuZCBgb3B0aW9uRmxhZ3NgLlxuXHQgKi9cblx0cHVibGljIHJlc3VsdHM6IHtcblx0XHRhbGw6IGFueVtdO1xuXHRcdHBocmFzZXM6IGFueVtdO1xuXHRcdGZsYWdzOiBhbnlbXTtcblx0XHRvcHRpb25GbGFnczogYW55W107XG5cdH07XG5cblx0cHVibGljIG5leHQoKSB7XG5cdFx0dGhpcy5wb3NpdGlvbisrO1xuXHR9XG5cblx0cHVibGljIGxvb2thaGVhZE4objogbnVtYmVyLCAuLi50eXBlczogc3RyaW5nW10pIHtcblx0XHRyZXR1cm4gdGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbiArIG5dICE9IG51bGwgJiYgdHlwZXMuaW5jbHVkZXModGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbiArIG5dLnR5cGUpO1xuXHR9XG5cblx0cHVibGljIGxvb2thaGVhZCguLi50eXBlczogc3RyaW5nW10pIHtcblx0XHRyZXR1cm4gdGhpcy5sb29rYWhlYWROKDAsIC4uLnR5cGVzKTtcblx0fVxuXG5cdHB1YmxpYyBtYXRjaCguLi50eXBlczogc3RyaW5nW10pIHtcblx0XHRpZiAodGhpcy5sb29rYWhlYWQoLi4udHlwZXMpKSB7XG5cdFx0XHR0aGlzLm5leHQoKTtcblx0XHRcdHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uIC0gMV07XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0YFVuZXhwZWN0ZWQgdG9rZW4gJHt0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uXS52YWx1ZX0gb2YgdHlwZSAke1xuXHRcdFx0XHR0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uXS50eXBlXG5cdFx0XHR9ICh0aGlzIHNob3VsZCBuZXZlciBoYXBwZW4pYFxuXHRcdCk7XG5cdH1cblxuXHRwdWJsaWMgcGFyc2UoKSB7XG5cdFx0Ly8gLTEgZm9yIEVPRi5cblx0XHR3aGlsZSAodGhpcy5wb3NpdGlvbiA8IHRoaXMudG9rZW5zLmxlbmd0aCAtIDEpIHtcblx0XHRcdHRoaXMucnVuQXJndW1lbnQoKTtcblx0XHR9XG5cblx0XHR0aGlzLm1hdGNoKFwiRU9GXCIpO1xuXHRcdHJldHVybiB0aGlzLnJlc3VsdHM7XG5cdH1cblxuXHRwdWJsaWMgcnVuQXJndW1lbnQoKSB7XG5cdFx0Y29uc3QgbGVhZGluZyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikudmFsdWUgOiBcIlwiO1xuXHRcdGlmICh0aGlzLmxvb2thaGVhZChcIkZsYWdXb3JkXCIsIFwiT3B0aW9uRmxhZ1dvcmRcIikpIHtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IHRoaXMucGFyc2VGbGFnKCk7XG5cdFx0XHRjb25zdCB0cmFpbGluZyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikudmFsdWUgOiBcIlwiO1xuXHRcdFx0Y29uc3Qgc2VwYXJhdG9yID0gdGhpcy5sb29rYWhlYWQoXCJTZXBhcmF0b3JcIikgPyB0aGlzLm1hdGNoKFwiU2VwYXJhdG9yXCIpLnZhbHVlIDogXCJcIjtcblx0XHRcdHBhcnNlZC5yYXcgPSBgJHtsZWFkaW5nfSR7cGFyc2VkLnJhd30ke3RyYWlsaW5nfSR7c2VwYXJhdG9yfWA7XG5cdFx0XHR0aGlzLnJlc3VsdHMuYWxsLnB1c2gocGFyc2VkKTtcblx0XHRcdGlmIChwYXJzZWQudHlwZSA9PT0gXCJGbGFnXCIpIHtcblx0XHRcdFx0dGhpcy5yZXN1bHRzLmZsYWdzLnB1c2gocGFyc2VkKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5vcHRpb25GbGFncy5wdXNoKHBhcnNlZCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBwYXJzZWQgPSB0aGlzLnBhcnNlUGhyYXNlKCk7XG5cdFx0Y29uc3QgdHJhaWxpbmcgPSB0aGlzLmxvb2thaGVhZChcIldTXCIpID8gdGhpcy5tYXRjaChcIldTXCIpLnZhbHVlIDogXCJcIjtcblx0XHRjb25zdCBzZXBhcmF0b3IgPSB0aGlzLmxvb2thaGVhZChcIlNlcGFyYXRvclwiKSA/IHRoaXMubWF0Y2goXCJTZXBhcmF0b3JcIikudmFsdWUgOiBcIlwiO1xuXHRcdHBhcnNlZC5yYXcgPSBgJHtsZWFkaW5nfSR7cGFyc2VkLnJhd30ke3RyYWlsaW5nfSR7c2VwYXJhdG9yfWA7XG5cdFx0dGhpcy5yZXN1bHRzLmFsbC5wdXNoKHBhcnNlZCk7XG5cdFx0dGhpcy5yZXN1bHRzLnBocmFzZXMucHVzaChwYXJzZWQpO1xuXHR9XG5cblx0cHVibGljIHBhcnNlRmxhZygpIHtcblx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJGbGFnV29yZFwiKSkge1xuXHRcdFx0Y29uc3QgZmxhZyA9IHRoaXMubWF0Y2goXCJGbGFnV29yZFwiKTtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJGbGFnXCIsIGtleTogZmxhZy52YWx1ZSwgcmF3OiBmbGFnLnZhbHVlIH07XG5cdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdH1cblxuXHRcdC8vIE90aGVyd2lzZSwgYHRoaXMubG9va2FoZWFkKCdPcHRpb25GbGFnV29yZCcpYCBzaG91bGQgYmUgdHJ1ZS5cblx0XHRjb25zdCBmbGFnID0gdGhpcy5tYXRjaChcIk9wdGlvbkZsYWdXb3JkXCIpO1xuXHRcdGNvbnN0IHBhcnNlZCA9IHtcblx0XHRcdHR5cGU6IFwiT3B0aW9uRmxhZ1wiLFxuXHRcdFx0a2V5OiBmbGFnLnZhbHVlLFxuXHRcdFx0dmFsdWU6IFwiXCIsXG5cdFx0XHRyYXc6IGZsYWcudmFsdWVcblx0XHR9O1xuXHRcdGNvbnN0IHdzID0gdGhpcy5sb29rYWhlYWQoXCJXU1wiKSA/IHRoaXMubWF0Y2goXCJXU1wiKSA6IG51bGw7XG5cdFx0aWYgKHdzICE9IG51bGwpIHtcblx0XHRcdHBhcnNlZC5yYXcgKz0gd3MudmFsdWU7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcGhyYXNlID0gdGhpcy5sb29rYWhlYWQoXCJRdW90ZVwiLCBcIk9wZW5RdW90ZVwiLCBcIkVuZFF1b3RlXCIsIFwiV29yZFwiKSA/IHRoaXMucGFyc2VQaHJhc2UoKSA6IG51bGw7XG5cblx0XHRpZiAocGhyYXNlICE9IG51bGwpIHtcblx0XHRcdHBhcnNlZC52YWx1ZSA9IHBocmFzZS52YWx1ZTtcblx0XHRcdHBhcnNlZC5yYXcgKz0gcGhyYXNlLnJhdztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG5cblx0cHVibGljIHBhcnNlUGhyYXNlKCkge1xuXHRcdGlmICghdGhpcy5zZXBhcmF0ZWQpIHtcblx0XHRcdGlmICh0aGlzLmxvb2thaGVhZChcIlF1b3RlXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJQaHJhc2VcIiwgdmFsdWU6IFwiXCIsIHJhdzogXCJcIiB9O1xuXHRcdFx0XHRjb25zdCBvcGVuUXVvdGUgPSB0aGlzLm1hdGNoKFwiUXVvdGVcIik7XG5cdFx0XHRcdHBhcnNlZC5yYXcgKz0gb3BlblF1b3RlLnZhbHVlO1xuXHRcdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXb3JkXCIsIFwiV1NcIikpIHtcblx0XHRcdFx0XHRjb25zdCBtYXRjaCA9IHRoaXMubWF0Y2goXCJXb3JkXCIsIFwiV1NcIik7XG5cdFx0XHRcdFx0cGFyc2VkLnZhbHVlICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBlbmRRdW90ZSA9IHRoaXMubG9va2FoZWFkKFwiUXVvdGVcIikgPyB0aGlzLm1hdGNoKFwiUXVvdGVcIikgOiBudWxsO1xuXHRcdFx0XHRpZiAoZW5kUXVvdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gZW5kUXVvdGUudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJPcGVuUXVvdGVcIikpIHtcblx0XHRcdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogXCJcIiwgcmF3OiBcIlwiIH07XG5cdFx0XHRcdGNvbnN0IG9wZW5RdW90ZSA9IHRoaXMubWF0Y2goXCJPcGVuUXVvdGVcIik7XG5cdFx0XHRcdHBhcnNlZC5yYXcgKz0gb3BlblF1b3RlLnZhbHVlO1xuXHRcdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXb3JkXCIsIFwiV1NcIikpIHtcblx0XHRcdFx0XHRjb25zdCBtYXRjaCA9IHRoaXMubWF0Y2goXCJXb3JkXCIsIFwiV1NcIik7XG5cdFx0XHRcdFx0aWYgKG1hdGNoLnR5cGUgPT09IFwiV29yZFwiKSB7XG5cdFx0XHRcdFx0XHRwYXJzZWQudmFsdWUgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGVuZFF1b3RlID0gdGhpcy5sb29rYWhlYWQoXCJFbmRRdW90ZVwiKSA/IHRoaXMubWF0Y2goXCJFbmRRdW90ZVwiKSA6IG51bGw7XG5cdFx0XHRcdGlmIChlbmRRdW90ZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0cGFyc2VkLnJhdyArPSBlbmRRdW90ZS52YWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBwYXJzZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmxvb2thaGVhZChcIkVuZFF1b3RlXCIpKSB7XG5cdFx0XHRcdGNvbnN0IGVuZFF1b3RlID0gdGhpcy5tYXRjaChcIkVuZFF1b3RlXCIpO1xuXHRcdFx0XHRjb25zdCBwYXJzZWQgPSB7XG5cdFx0XHRcdFx0dHlwZTogXCJQaHJhc2VcIixcblx0XHRcdFx0XHR2YWx1ZTogZW5kUXVvdGUudmFsdWUsXG5cdFx0XHRcdFx0cmF3OiBlbmRRdW90ZS52YWx1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLnNlcGFyYXRlZCkge1xuXHRcdFx0Y29uc3QgaW5pdCA9IHRoaXMubWF0Y2goXCJXb3JkXCIpO1xuXHRcdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogaW5pdC52YWx1ZSwgcmF3OiBpbml0LnZhbHVlIH07XG5cdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXU1wiKSAmJiB0aGlzLmxvb2thaGVhZE4oMSwgXCJXb3JkXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHdzID0gdGhpcy5tYXRjaChcIldTXCIpO1xuXHRcdFx0XHRjb25zdCB3b3JkID0gdGhpcy5tYXRjaChcIldvcmRcIik7XG5cdFx0XHRcdHBhcnNlZC52YWx1ZSArPSB3cy52YWx1ZSArIHdvcmQudmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdHBhcnNlZC5yYXcgPSBwYXJzZWQudmFsdWU7XG5cdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdH1cblxuXHRcdGNvbnN0IHdvcmQgPSB0aGlzLm1hdGNoKFwiV29yZFwiKTtcblx0XHRjb25zdCBwYXJzZWQgPSB7IHR5cGU6IFwiUGhyYXNlXCIsIHZhbHVlOiB3b3JkLnZhbHVlLCByYXc6IHdvcmQudmFsdWUgfTtcblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG59XG5cbi8qKlxuICogUGFyc2VzIGNvbnRlbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRlbnRQYXJzZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoeyBmbGFnV29yZHMgPSBbXSwgb3B0aW9uRmxhZ1dvcmRzID0gW10sIHF1b3RlZCA9IHRydWUsIHNlcGFyYXRvciB9OiBDb250ZW50UGFyc2VyT3B0aW9ucyA9IHt9KSB7XG5cdFx0dGhpcy5mbGFnV29yZHMgPSBmbGFnV29yZHM7XG5cdFx0dGhpcy5mbGFnV29yZHMuc29ydCgoYSwgYikgPT4gYi5sZW5ndGggLSBhLmxlbmd0aCk7XG5cblx0XHR0aGlzLm9wdGlvbkZsYWdXb3JkcyA9IG9wdGlvbkZsYWdXb3Jkcztcblx0XHR0aGlzLm9wdGlvbkZsYWdXb3Jkcy5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKTtcblxuXHRcdHRoaXMucXVvdGVkID0gQm9vbGVhbihxdW90ZWQpO1xuXHRcdHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgZmxhZ3MuXG5cdCAqL1xuXHRwdWJsaWMgZmxhZ1dvcmRzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogV29yZHMgY29uc2lkZXJlZCBvcHRpb24gZmxhZ3MuXG5cdCAqL1xuXHRwdWJsaWMgb3B0aW9uRmxhZ1dvcmRzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogV2hldGhlciB0byBwYXJzZSBxdW90ZXMuIERlZmF1bHRzIHRvIGB0cnVlYC5cblx0ICovXG5cdHB1YmxpYyBxdW90ZWQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdG8gcGFyc2UgYSBzZXBhcmF0b3IuXG5cdCAqL1xuXHRwdWJsaWMgc2VwYXJhdG9yPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBQYXJzZXMgY29udGVudC5cblx0ICogQHBhcmFtIGNvbnRlbnQgLSBDb250ZW50IHRvIHBhcnNlLlxuXHQgKi9cblx0cHVibGljIHBhcnNlKGNvbnRlbnQ6IHN0cmluZyk6IENvbnRlbnRQYXJzZXJSZXN1bHQge1xuXHRcdGNvbnN0IHRva2VucyA9IG5ldyBUb2tlbml6ZXIoY29udGVudCwge1xuXHRcdFx0ZmxhZ1dvcmRzOiB0aGlzLmZsYWdXb3Jkcyxcblx0XHRcdG9wdGlvbkZsYWdXb3JkczogdGhpcy5vcHRpb25GbGFnV29yZHMsXG5cdFx0XHRxdW90ZWQ6IHRoaXMucXVvdGVkLFxuXHRcdFx0c2VwYXJhdG9yOiB0aGlzLnNlcGFyYXRvclxuXHRcdH0pLnRva2VuaXplKCk7XG5cblx0XHRyZXR1cm4gbmV3IFBhcnNlcih0b2tlbnMsIHsgc2VwYXJhdGVkOiB0aGlzLnNlcGFyYXRvciAhPSBudWxsIH0pLnBhcnNlKCk7XG5cdH1cblxuXHQvKipcblx0ICogRXh0cmFjdHMgdGhlIGZsYWdzIGZyb20gYXJndW1lbnQgb3B0aW9ucy5cblx0ICogQHBhcmFtIGFyZ3MgLSBBcmd1bWVudCBvcHRpb25zLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBnZXRGbGFncyhhcmdzOiBBcmd1bWVudE9wdGlvbnNbXSk6IEV4dHJhY3RlZEZsYWdzIHtcblx0XHRjb25zdCByZXMgPSB7XG5cdFx0XHRmbGFnV29yZHM6IFtdLFxuXHRcdFx0b3B0aW9uRmxhZ1dvcmRzOiBbXVxuXHRcdH07XG5cblx0XHRmb3IgKGNvbnN0IGFyZyBvZiBhcmdzKSB7XG5cdFx0XHRjb25zdCBhcnI6IGFueVtdIHwgYW55ID0gcmVzW2FyZy5tYXRjaCA9PT0gQXJndW1lbnRNYXRjaGVzLkZMQUcgPyBcImZsYWdXb3Jkc1wiIDogXCJvcHRpb25GbGFnV29yZHNcIl07XG5cdFx0XHRpZiAoYXJnLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuRkxBRyB8fCBhcmcubWF0Y2ggPT09IEFyZ3VtZW50TWF0Y2hlcy5PUFRJT04pIHtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoYXJnLmZsYWcpKSB7XG5cdFx0XHRcdFx0YXJyLnB1c2goLi4uYXJnLmZsYWcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFyci5wdXNoKGFyZy5mbGFnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciB0aGUgY29udGVudCBwYXJzZXIuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudFBhcnNlck9wdGlvbnMge1xuXHQvKipcblx0ICogV29yZHMgY29uc2lkZXJlZCBmbGFncy5cblx0ICovXG5cdGZsYWdXb3Jkcz86IHN0cmluZ1tdO1xuXHQvKipcblx0ICogV29yZHMgY29uc2lkZXJlZCBvcHRpb24gZmxhZ3MuXG5cdCAqL1xuXHRvcHRpb25GbGFnV29yZHM/OiBzdHJpbmdbXTtcblx0LyoqXG5cdCAqIFdoZXRoZXIgdG8gcGFyc2UgcXVvdGVzLiBEZWZhdWx0cyB0byBgdHJ1ZWAuXG5cdCAqL1xuXHRxdW90ZWQ/OiBib29sZWFuO1xuXHQvKipcblx0ICogV2hldGhlciB0byBwYXJzZSBhIHNlcGFyYXRvci5cblx0ICovXG5cdHNlcGFyYXRvcj86IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZXN1bHQgb2YgcGFyc2luZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZW50UGFyc2VyUmVzdWx0IHtcblx0LyoqXG5cdCAqIEFsbCBwaHJhc2VzIGFuZCBmbGFncy5cblx0ICovXG5cdGFsbDogU3RyaW5nRGF0YVtdO1xuXG5cdC8qKlxuXHQgKiBQaHJhc2VzLlxuXHQgKi9cblx0cGhyYXNlczogU3RyaW5nRGF0YVtdO1xuXG5cdC8qKlxuXHQgKiBGbGFncy5cblx0ICovXG5cdGZsYWdzOiBTdHJpbmdEYXRhW107XG5cblx0LyoqXG5cdCAqIE9wdGlvbiBmbGFncy5cblx0ICovXG5cdG9wdGlvbkZsYWdzOiBTdHJpbmdEYXRhW107XG59XG5cbi8qKlxuICogQSBzaW5nbGUgcGhyYXNlIG9yIGZsYWcuXG4gKi9cbmV4cG9ydCB0eXBlIFN0cmluZ0RhdGEgPVxuXHR8IHtcblx0XHRcdC8qKlxuXHRcdFx0ICogT25lIG9mICdQaHJhc2UnLCAnRmxhZycsICdPcHRpb25GbGFnJy5cblx0XHRcdCAqL1xuXHRcdFx0dHlwZTogXCJQaHJhc2VcIjtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgdmFsdWUgb2YgYSAnUGhyYXNlJyBvciAnT3B0aW9uRmxhZycuXG5cdFx0XHQgKi9cblx0XHRcdHZhbHVlOiBzdHJpbmc7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIHJhdyBzdHJpbmcgd2l0aCB3aGl0ZXNwYWNlIGFuZC9vciBzZXBhcmF0b3IuXG5cdFx0XHQgKi9cblx0XHRcdHJhdzogc3RyaW5nO1xuXHQgIH1cblx0fCB7XG5cdFx0XHQvKipcblx0XHRcdCAqIE9uZSBvZiAnUGhyYXNlJywgJ0ZsYWcnLCAnT3B0aW9uRmxhZycuXG5cdFx0XHQgKi9cblx0XHRcdHR5cGU6IFwiRmxhZ1wiO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSBrZXkgb2YgYSAnRmxhZycgb3IgJ09wdGlvbkZsYWcnLlxuXHRcdFx0ICovXG5cdFx0XHRrZXk6IHN0cmluZztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgcmF3IHN0cmluZyB3aXRoIHdoaXRlc3BhY2UgYW5kL29yIHNlcGFyYXRvci5cblx0XHRcdCAqL1xuXHRcdFx0cmF3OiBzdHJpbmc7XG5cdCAgfVxuXHR8IHtcblx0XHRcdC8qKlxuXHRcdFx0ICogT25lIG9mICdQaHJhc2UnLCAnRmxhZycsICdPcHRpb25GbGFnJy5cblx0XHRcdCAqL1xuXHRcdFx0dHlwZTogXCJPcHRpb25GbGFnXCI7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIGtleSBvZiBhICdGbGFnJyBvciAnT3B0aW9uRmxhZycuXG5cdFx0XHQgKi9cblx0XHRcdGtleTogc3RyaW5nO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSB2YWx1ZSBvZiBhICdQaHJhc2UnIG9yICdPcHRpb25GbGFnJy5cblx0XHRcdCAqL1xuXHRcdFx0dmFsdWU6IHN0cmluZztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgcmF3IHN0cmluZyB3aXRoIHdoaXRlc3BhY2UgYW5kL29yIHNlcGFyYXRvci5cblx0XHRcdCAqL1xuXHRcdFx0cmF3OiBzdHJpbmc7XG5cdCAgfTtcblxuLyoqXG4gKiBGbGFncyBleHRyYWN0ZWQgZnJvbSBhbiBhcmd1bWVudCBsaXN0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4dHJhY3RlZEZsYWdzIHtcblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgZmxhZ3MuXG5cdCAqL1xuXHRmbGFnV29yZHM/OiBzdHJpbmdbXTtcblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgb3B0aW9uIGZsYWdzLlxuXHQgKi9cblx0b3B0aW9uRmxhZ1dvcmRzPzogc3RyaW5nW107XG59XG4iXX0=