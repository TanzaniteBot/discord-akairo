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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGVudFBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvQ29udGVudFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUF1RDtBQUd2RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbURHO0FBRUgsTUFBTSxTQUFTO0lBQ2QsWUFDQyxPQUFlLEVBQ2YsRUFBRSxTQUFTLEdBQUcsRUFBRSxFQUFFLGVBQWUsR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLElBQUksRUFBRSxTQUFTLEtBQTJCLEVBQUU7UUFFN0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsMkRBQTJEO1FBQzNELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVNLE9BQU8sQ0FBUztJQUNoQixTQUFTLENBQVc7SUFDcEIsZUFBZSxDQUFXO0lBQzFCLE1BQU0sQ0FBVTtJQUNoQixTQUFTLENBQVM7SUFDbEIsUUFBUSxDQUFTO0lBQ2pCLEtBQUssQ0FBUztJQUNkLE1BQU0sQ0FBUTtJQUVkLFVBQVUsQ0FBQyxHQUFXO1FBQzVCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFX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TUFBTSxHQUFHLEdBQUc7WUFDWCxTQUFTLEVBQUUsRUFBRTtZQUNiLGVBQWUsRUFBRSxFQUFFO1NBQ25CLENBQUM7UUFFRixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtZQUN2QixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSywyQkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3RGLElBQUksR0FBRyxDQUFDLEtBQUssS0FBSywyQkFBZSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLDJCQUFlLENBQUMsTUFBTSxFQUFFO2dCQUMvRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM1QixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0QjtxQkFBTTtvQkFDTixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbkI7YUFDRDtTQUNEO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0NBQ0Q7QUF0RUQsZ0NBc0VDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXJndW1lbnRNYXRjaGVzIH0gZnJvbSBcIi4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgeyBBcmd1bWVudE9wdGlvbnMgfSBmcm9tIFwiLi9hcmd1bWVudHMvQXJndW1lbnRcIjtcblxuLypcbiAqIEdyYW1tYXI6XG4gKlxuICogQXJndW1lbnRzXG4gKiAgPSAoQXJndW1lbnQgKFdTPyBBcmd1bWVudCkqKT8gRU9GXG4gKlxuICogQXJndW1lbnRcbiAqICA9IEZsYWdcbiAqICB8IFBocmFzZVxuICpcbiAqIEZsYWdcbiAqICA9IEZsYWdXb3JkXG4gKiAgfCBPcHRpb25GbGFnV29yZCBXUz8gUGhyYXNlP1xuICpcbiAqIFBocmFzZVxuICogID0gUXVvdGUgKFdvcmQgfCBXUykqIFF1b3RlP1xuICogIHwgT3BlblF1b3RlIChXb3JkIHwgT3BlblF1b3RlIHwgUXVvdGUgfCBXUykqIEVuZFF1b3RlP1xuICogIHwgRW5kUXVvdGVcbiAqICB8IFdvcmRcbiAqXG4gKiBGbGFnV29yZCA9IEdpdmVuXG4gKiBPcHRpb25GbGFnV29yZCA9IEdpdmVuXG4gKiBRdW90ZSA9IFwiXG4gKiBPcGVuUXVvdGUgPSDigJxcbiAqIEVuZFF1b3RlID0g4oCdXG4gKiBXb3JkID0gL15cXFMrLyAoYW5kIG5vdCBpbiBGbGFnV29yZCBvciBPcHRpb25GbGFnV29yZClcbiAqIFdTID0gL15cXHMrL1xuICogRU9GID0gL14kL1xuICpcbiAqIFdpdGggYSBzZXBhcmF0b3I6XG4gKlxuICogQXJndW1lbnRzXG4gKiAgPSAoQXJndW1lbnQgKFdTPyBTZXBhcmF0b3IgV1M/IEFyZ3VtZW50KSopPyBFT0ZcbiAqXG4gKiBBcmd1bWVudFxuICogID0gRmxhZ1xuICogIHwgUGhyYXNlXG4gKlxuICogRmxhZ1xuICogID0gRmxhZ1dvcmRcbiAqICB8IE9wdGlvbkZsYWdXb3JkIFdTPyBQaHJhc2U/XG4gKlxuICogUGhyYXNlXG4gKiAgPSBXb3JkIChXUyBXb3JkKSpcbiAqXG4gKiBGbGFnV29yZCA9IEdpdmVuXG4gKiBPcHRpb25GbGFnV29yZCA9IEdpdmVuXG4gKiBTZXBhcmF0b3IgPSBHaXZlblxuICogV29yZCA9IC9eXFxTKy8gKGFuZCBub3QgaW4gRmxhZ1dvcmQgb3IgT3B0aW9uRmxhZ1dvcmQgb3IgZXF1YWwgdG8gU2VwYXJhdG9yKVxuICogV1MgPSAvXlxccysvXG4gKiBFT0YgPSAvXiQvXG4gKi9cblxuY2xhc3MgVG9rZW5pemVyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNvbnRlbnQ6IHN0cmluZyxcblx0XHR7IGZsYWdXb3JkcyA9IFtdLCBvcHRpb25GbGFnV29yZHMgPSBbXSwgcXVvdGVkID0gdHJ1ZSwgc2VwYXJhdG9yIH06IENvbnRlbnRQYXJzZXJPcHRpb25zID0ge31cblx0KSB7XG5cdFx0dGhpcy5jb250ZW50ID0gY29udGVudDtcblx0XHR0aGlzLmZsYWdXb3JkcyA9IGZsYWdXb3Jkcztcblx0XHR0aGlzLm9wdGlvbkZsYWdXb3JkcyA9IG9wdGlvbkZsYWdXb3Jkcztcblx0XHR0aGlzLnF1b3RlZCA9IHF1b3RlZDtcblx0XHR0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcblx0XHR0aGlzLnBvc2l0aW9uID0gMDtcblx0XHQvLyAwIC0+IERlZmF1bHQsIDEgLT4gUXVvdGVzIChcIlwiKSwgMiAtPiBTcGVjaWFsIFF1b3RlcyAo4oCc4oCdKVxuXHRcdHRoaXMuc3RhdGUgPSAwO1xuXHRcdHRoaXMudG9rZW5zID0gW107XG5cdH1cblxuXHRwdWJsaWMgY29udGVudDogc3RyaW5nO1xuXHRwdWJsaWMgZmxhZ1dvcmRzOiBzdHJpbmdbXTtcblx0cHVibGljIG9wdGlvbkZsYWdXb3Jkczogc3RyaW5nW107XG5cdHB1YmxpYyBxdW90ZWQ6IGJvb2xlYW47XG5cdHB1YmxpYyBzZXBhcmF0b3I6IHN0cmluZztcblx0cHVibGljIHBvc2l0aW9uOiBudW1iZXI7XG5cdHB1YmxpYyBzdGF0ZTogbnVtYmVyO1xuXHRwdWJsaWMgdG9rZW5zOiBhbnlbXTtcblxuXHRwdWJsaWMgc3RhcnRzV2l0aChzdHI6IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQuc2xpY2UodGhpcy5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbiArIHN0ci5sZW5ndGgpLnRvTG93ZXJDYXNlKCkgPT09IHN0ci50b0xvd2VyQ2FzZSgpO1xuXHR9XG5cblx0cHVibGljIG1hdGNoKHJlZ2V4OiBSZWdFeHApIHtcblx0XHRyZXR1cm4gdGhpcy5jb250ZW50LnNsaWNlKHRoaXMucG9zaXRpb24pLm1hdGNoKHJlZ2V4KTtcblx0fVxuXG5cdHB1YmxpYyBzbGljZShmcm9tLCB0bykge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQuc2xpY2UodGhpcy5wb3NpdGlvbiArIGZyb20sIHRoaXMucG9zaXRpb24gKyB0byk7XG5cdH1cblxuXHRwdWJsaWMgYWRkVG9rZW4odHlwZSwgdmFsdWUpIHtcblx0XHR0aGlzLnRva2Vucy5wdXNoKHsgdHlwZSwgdmFsdWUgfSk7XG5cdH1cblxuXHRwdWJsaWMgYWR2YW5jZShuKSB7XG5cdFx0dGhpcy5wb3NpdGlvbiArPSBuO1xuXHR9XG5cblx0cHVibGljIGNob2ljZSguLi5hY3Rpb25zKSB7XG5cdFx0Zm9yIChjb25zdCBhY3Rpb24gb2YgYWN0aW9ucykge1xuXHRcdFx0aWYgKGFjdGlvbi5jYWxsKHRoaXMpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgdG9rZW5pemUoKSB7XG5cdFx0d2hpbGUgKHRoaXMucG9zaXRpb24gPCB0aGlzLmNvbnRlbnQubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnJ1bk9uZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuYWRkVG9rZW4oXCJFT0ZcIiwgXCJcIik7XG5cdFx0cmV0dXJuIHRoaXMudG9rZW5zO1xuXHR9XG5cblx0cHVibGljIHJ1bk9uZSgpIHtcblx0XHR0aGlzLmNob2ljZShcblx0XHRcdHRoaXMucnVuV2hpdGVzcGFjZSxcblx0XHRcdHRoaXMucnVuRmxhZ3MsXG5cdFx0XHR0aGlzLnJ1bk9wdGlvbkZsYWdzLFxuXHRcdFx0dGhpcy5ydW5RdW90ZSxcblx0XHRcdHRoaXMucnVuT3BlblF1b3RlLFxuXHRcdFx0dGhpcy5ydW5FbmRRdW90ZSxcblx0XHRcdHRoaXMucnVuU2VwYXJhdG9yLFxuXHRcdFx0dGhpcy5ydW5Xb3JkXG5cdFx0KTtcblx0fVxuXG5cdHB1YmxpYyBydW5GbGFncygpIHtcblx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gMCkge1xuXHRcdFx0Zm9yIChjb25zdCB3b3JkIG9mIHRoaXMuZmxhZ1dvcmRzKSB7XG5cdFx0XHRcdGlmICh0aGlzLnN0YXJ0c1dpdGgod29yZCkpIHtcblx0XHRcdFx0XHR0aGlzLmFkZFRva2VuKFwiRmxhZ1dvcmRcIiwgdGhpcy5zbGljZSgwLCB3b3JkLmxlbmd0aCkpO1xuXHRcdFx0XHRcdHRoaXMuYWR2YW5jZSh3b3JkLmxlbmd0aCk7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuT3B0aW9uRmxhZ3MoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdGZvciAoY29uc3Qgd29yZCBvZiB0aGlzLm9wdGlvbkZsYWdXb3Jkcykge1xuXHRcdFx0XHRpZiAodGhpcy5zdGFydHNXaXRoKHdvcmQpKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRUb2tlbihcIk9wdGlvbkZsYWdXb3JkXCIsIHRoaXMuc2xpY2UoMCwgd29yZC5sZW5ndGgpKTtcblx0XHRcdFx0XHR0aGlzLmFkdmFuY2Uod29yZC5sZW5ndGgpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cHVibGljIHJ1blF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnNlcGFyYXRvciA9PSBudWxsICYmIHRoaXMucXVvdGVkICYmIHRoaXMuc3RhcnRzV2l0aCgnXCInKSkge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUgPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IDA7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IDE7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJRdW90ZVwiLCAnXCInKTtcblx0XHRcdHRoaXMuYWR2YW5jZSgxKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBydW5PcGVuUXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMuc2VwYXJhdG9yID09IG51bGwgJiYgdGhpcy5xdW90ZWQgJiYgdGhpcy5zdGFydHNXaXRoKCdcIicpKSB7XG5cdFx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gMCkge1xuXHRcdFx0XHR0aGlzLnN0YXRlID0gMjtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5hZGRUb2tlbihcIk9wZW5RdW90ZVwiLCAnXCInKTtcblx0XHRcdHRoaXMuYWR2YW5jZSgxKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBydW5FbmRRdW90ZSgpIHtcblx0XHRpZiAodGhpcy5zZXBhcmF0b3IgPT0gbnVsbCAmJiB0aGlzLnF1b3RlZCAmJiB0aGlzLnN0YXJ0c1dpdGgoXCLigJ1cIikpIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlID09PSAyKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmFkZFRva2VuKFwiRW5kUXVvdGVcIiwgXCLigJ1cIik7XG5cdFx0XHR0aGlzLmFkdmFuY2UoMSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuU2VwYXJhdG9yKCkge1xuXHRcdGlmICh0aGlzLnNlcGFyYXRvciAhPSBudWxsICYmIHRoaXMuc3RhcnRzV2l0aCh0aGlzLnNlcGFyYXRvcikpIHtcblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJTZXBhcmF0b3JcIiwgdGhpcy5zbGljZSgwLCB0aGlzLnNlcGFyYXRvci5sZW5ndGgpKTtcblx0XHRcdHRoaXMuYWR2YW5jZSh0aGlzLnNlcGFyYXRvci5sZW5ndGgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cHVibGljIHJ1bldvcmQoKSB7XG5cdFx0Y29uc3Qgd29yZFJlZ2V4ID0gdGhpcy5zdGF0ZSA9PT0gMCA/IC9eXFxTKy8gOiB0aGlzLnN0YXRlID09PSAxID8gL15bXlxcc1wiXSsvIDogL15bXlxcc+KAnV0rLztcblxuXHRcdGNvbnN0IHdvcmRNYXRjaCA9IHRoaXMubWF0Y2god29yZFJlZ2V4KTtcblx0XHRpZiAod29yZE1hdGNoKSB7XG5cdFx0XHRpZiAodGhpcy5zZXBhcmF0b3IpIHtcblx0XHRcdFx0aWYgKHdvcmRNYXRjaFswXS50b0xvd2VyQ2FzZSgpID09PSB0aGlzLnNlcGFyYXRvci50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgaW5kZXggPSB3b3JkTWF0Y2hbMF0uaW5kZXhPZih0aGlzLnNlcGFyYXRvcik7XG5cdFx0XHRcdGlmIChpbmRleCA9PT0gLTEpIHtcblx0XHRcdFx0XHR0aGlzLmFkZFRva2VuKFwiV29yZFwiLCB3b3JkTWF0Y2hbMF0pO1xuXHRcdFx0XHRcdHRoaXMuYWR2YW5jZSh3b3JkTWF0Y2hbMF0ubGVuZ3RoKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGFjdHVhbCA9IHdvcmRNYXRjaFswXS5zbGljZSgwLCBpbmRleCk7XG5cdFx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXb3JkXCIsIGFjdHVhbCk7XG5cdFx0XHRcdHRoaXMuYWR2YW5jZShhY3R1YWwubGVuZ3RoKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXb3JkXCIsIHdvcmRNYXRjaFswXSk7XG5cdFx0XHR0aGlzLmFkdmFuY2Uod29yZE1hdGNoWzBdLmxlbmd0aCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuV2hpdGVzcGFjZSgpIHtcblx0XHRjb25zdCB3c01hdGNoID0gdGhpcy5tYXRjaCgvXlxccysvKTtcblx0XHRpZiAod3NNYXRjaCkge1xuXHRcdFx0dGhpcy5hZGRUb2tlbihcIldTXCIsIHdzTWF0Y2hbMF0pO1xuXHRcdFx0dGhpcy5hZHZhbmNlKHdzTWF0Y2hbMF0ubGVuZ3RoKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5jbGFzcyBQYXJzZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IodG9rZW5zLCB7IHNlcGFyYXRlZCB9KSB7XG5cdFx0dGhpcy50b2tlbnMgPSB0b2tlbnM7XG5cdFx0dGhpcy5zZXBhcmF0ZWQgPSBzZXBhcmF0ZWQ7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IDA7XG5cblx0XHR0aGlzLnJlc3VsdHMgPSB7XG5cdFx0XHRhbGw6IFtdLFxuXHRcdFx0cGhyYXNlczogW10sXG5cdFx0XHRmbGFnczogW10sXG5cdFx0XHRvcHRpb25GbGFnczogW11cblx0XHR9O1xuXHR9XG5cblx0cHVibGljIHRva2VuczogYW55O1xuXHRwdWJsaWMgc2VwYXJhdGVkOiBhbnk7XG5cdHB1YmxpYyBwb3NpdGlvbjogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBQaHJhc2VzIGFyZSBgeyB0eXBlOiAnUGhyYXNlJywgdmFsdWUsIHJhdyB9YC5cblx0ICogRmxhZ3MgYXJlIGB7IHR5cGU6ICdGbGFnJywga2V5LCByYXcgfWAuXG5cdCAqIE9wdGlvbiBmbGFncyBhcmUgYHsgdHlwZTogJ09wdGlvbkZsYWcnLCBrZXksIHZhbHVlLCByYXcgfWAuXG5cdCAqIFRoZSBgYWxsYCBwcm9wZXJ0eSBpcyBwYXJ0aXRpb25lZCBpbnRvIGBwaHJhc2VzYCwgYGZsYWdzYCwgYW5kIGBvcHRpb25GbGFnc2AuXG5cdCAqL1xuXHRwdWJsaWMgcmVzdWx0czoge1xuXHRcdGFsbDogYW55W107XG5cdFx0cGhyYXNlczogYW55W107XG5cdFx0ZmxhZ3M6IGFueVtdO1xuXHRcdG9wdGlvbkZsYWdzOiBhbnlbXTtcblx0fTtcblxuXHRwdWJsaWMgbmV4dCgpIHtcblx0XHR0aGlzLnBvc2l0aW9uKys7XG5cdH1cblxuXHRwdWJsaWMgbG9va2FoZWFkTihuLCAuLi50eXBlcykge1xuXHRcdHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uICsgbl0gIT0gbnVsbCAmJiB0eXBlcy5pbmNsdWRlcyh0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uICsgbl0udHlwZSk7XG5cdH1cblxuXHRwdWJsaWMgbG9va2FoZWFkKC4uLnR5cGVzKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9va2FoZWFkTigwLCAuLi50eXBlcyk7XG5cdH1cblxuXHRwdWJsaWMgbWF0Y2goLi4udHlwZXMpIHtcblx0XHRpZiAodGhpcy5sb29rYWhlYWQoLi4udHlwZXMpKSB7XG5cdFx0XHR0aGlzLm5leHQoKTtcblx0XHRcdHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uIC0gMV07XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0YFVuZXhwZWN0ZWQgdG9rZW4gJHt0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uXS52YWx1ZX0gb2YgdHlwZSAke1xuXHRcdFx0XHR0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uXS50eXBlXG5cdFx0XHR9ICh0aGlzIHNob3VsZCBuZXZlciBoYXBwZW4pYFxuXHRcdCk7XG5cdH1cblxuXHRwdWJsaWMgcGFyc2UoKSB7XG5cdFx0Ly8gLTEgZm9yIEVPRi5cblx0XHR3aGlsZSAodGhpcy5wb3NpdGlvbiA8IHRoaXMudG9rZW5zLmxlbmd0aCAtIDEpIHtcblx0XHRcdHRoaXMucnVuQXJndW1lbnQoKTtcblx0XHR9XG5cblx0XHR0aGlzLm1hdGNoKFwiRU9GXCIpO1xuXHRcdHJldHVybiB0aGlzLnJlc3VsdHM7XG5cdH1cblxuXHRwdWJsaWMgcnVuQXJndW1lbnQoKSB7XG5cdFx0Y29uc3QgbGVhZGluZyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikudmFsdWUgOiBcIlwiO1xuXHRcdGlmICh0aGlzLmxvb2thaGVhZChcIkZsYWdXb3JkXCIsIFwiT3B0aW9uRmxhZ1dvcmRcIikpIHtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IHRoaXMucGFyc2VGbGFnKCk7XG5cdFx0XHRjb25zdCB0cmFpbGluZyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikudmFsdWUgOiBcIlwiO1xuXHRcdFx0Y29uc3Qgc2VwYXJhdG9yID0gdGhpcy5sb29rYWhlYWQoXCJTZXBhcmF0b3JcIikgPyB0aGlzLm1hdGNoKFwiU2VwYXJhdG9yXCIpLnZhbHVlIDogXCJcIjtcblx0XHRcdHBhcnNlZC5yYXcgPSBgJHtsZWFkaW5nfSR7cGFyc2VkLnJhd30ke3RyYWlsaW5nfSR7c2VwYXJhdG9yfWA7XG5cdFx0XHR0aGlzLnJlc3VsdHMuYWxsLnB1c2gocGFyc2VkKTtcblx0XHRcdGlmIChwYXJzZWQudHlwZSA9PT0gXCJGbGFnXCIpIHtcblx0XHRcdFx0dGhpcy5yZXN1bHRzLmZsYWdzLnB1c2gocGFyc2VkKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5vcHRpb25GbGFncy5wdXNoKHBhcnNlZCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBwYXJzZWQgPSB0aGlzLnBhcnNlUGhyYXNlKCk7XG5cdFx0Y29uc3QgdHJhaWxpbmcgPSB0aGlzLmxvb2thaGVhZChcIldTXCIpID8gdGhpcy5tYXRjaChcIldTXCIpLnZhbHVlIDogXCJcIjtcblx0XHRjb25zdCBzZXBhcmF0b3IgPSB0aGlzLmxvb2thaGVhZChcIlNlcGFyYXRvclwiKSA/IHRoaXMubWF0Y2goXCJTZXBhcmF0b3JcIikudmFsdWUgOiBcIlwiO1xuXHRcdHBhcnNlZC5yYXcgPSBgJHtsZWFkaW5nfSR7cGFyc2VkLnJhd30ke3RyYWlsaW5nfSR7c2VwYXJhdG9yfWA7XG5cdFx0dGhpcy5yZXN1bHRzLmFsbC5wdXNoKHBhcnNlZCk7XG5cdFx0dGhpcy5yZXN1bHRzLnBocmFzZXMucHVzaChwYXJzZWQpO1xuXHR9XG5cblx0cHVibGljIHBhcnNlRmxhZygpIHtcblx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJGbGFnV29yZFwiKSkge1xuXHRcdFx0Y29uc3QgZmxhZyA9IHRoaXMubWF0Y2goXCJGbGFnV29yZFwiKTtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJGbGFnXCIsIGtleTogZmxhZy52YWx1ZSwgcmF3OiBmbGFnLnZhbHVlIH07XG5cdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdH1cblxuXHRcdC8vIE90aGVyd2lzZSwgYHRoaXMubG9va2FoZWFkKCdPcHRpb25GbGFnV29yZCcpYCBzaG91bGQgYmUgdHJ1ZS5cblx0XHRjb25zdCBmbGFnID0gdGhpcy5tYXRjaChcIk9wdGlvbkZsYWdXb3JkXCIpO1xuXHRcdGNvbnN0IHBhcnNlZCA9IHtcblx0XHRcdHR5cGU6IFwiT3B0aW9uRmxhZ1wiLFxuXHRcdFx0a2V5OiBmbGFnLnZhbHVlLFxuXHRcdFx0dmFsdWU6IFwiXCIsXG5cdFx0XHRyYXc6IGZsYWcudmFsdWVcblx0XHR9O1xuXHRcdGNvbnN0IHdzID0gdGhpcy5sb29rYWhlYWQoXCJXU1wiKSA/IHRoaXMubWF0Y2goXCJXU1wiKSA6IG51bGw7XG5cdFx0aWYgKHdzICE9IG51bGwpIHtcblx0XHRcdHBhcnNlZC5yYXcgKz0gd3MudmFsdWU7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcGhyYXNlID0gdGhpcy5sb29rYWhlYWQoXCJRdW90ZVwiLCBcIk9wZW5RdW90ZVwiLCBcIkVuZFF1b3RlXCIsIFwiV29yZFwiKSA/IHRoaXMucGFyc2VQaHJhc2UoKSA6IG51bGw7XG5cblx0XHRpZiAocGhyYXNlICE9IG51bGwpIHtcblx0XHRcdHBhcnNlZC52YWx1ZSA9IHBocmFzZS52YWx1ZTtcblx0XHRcdHBhcnNlZC5yYXcgKz0gcGhyYXNlLnJhdztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG5cblx0cHVibGljIHBhcnNlUGhyYXNlKCkge1xuXHRcdGlmICghdGhpcy5zZXBhcmF0ZWQpIHtcblx0XHRcdGlmICh0aGlzLmxvb2thaGVhZChcIlF1b3RlXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJQaHJhc2VcIiwgdmFsdWU6IFwiXCIsIHJhdzogXCJcIiB9O1xuXHRcdFx0XHRjb25zdCBvcGVuUXVvdGUgPSB0aGlzLm1hdGNoKFwiUXVvdGVcIik7XG5cdFx0XHRcdHBhcnNlZC5yYXcgKz0gb3BlblF1b3RlLnZhbHVlO1xuXHRcdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXb3JkXCIsIFwiV1NcIikpIHtcblx0XHRcdFx0XHRjb25zdCBtYXRjaCA9IHRoaXMubWF0Y2goXCJXb3JkXCIsIFwiV1NcIik7XG5cdFx0XHRcdFx0cGFyc2VkLnZhbHVlICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBlbmRRdW90ZSA9IHRoaXMubG9va2FoZWFkKFwiUXVvdGVcIikgPyB0aGlzLm1hdGNoKFwiUXVvdGVcIikgOiBudWxsO1xuXHRcdFx0XHRpZiAoZW5kUXVvdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gZW5kUXVvdGUudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJPcGVuUXVvdGVcIikpIHtcblx0XHRcdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogXCJcIiwgcmF3OiBcIlwiIH07XG5cdFx0XHRcdGNvbnN0IG9wZW5RdW90ZSA9IHRoaXMubWF0Y2goXCJPcGVuUXVvdGVcIik7XG5cdFx0XHRcdHBhcnNlZC5yYXcgKz0gb3BlblF1b3RlLnZhbHVlO1xuXHRcdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXb3JkXCIsIFwiV1NcIikpIHtcblx0XHRcdFx0XHRjb25zdCBtYXRjaCA9IHRoaXMubWF0Y2goXCJXb3JkXCIsIFwiV1NcIik7XG5cdFx0XHRcdFx0aWYgKG1hdGNoLnR5cGUgPT09IFwiV29yZFwiKSB7XG5cdFx0XHRcdFx0XHRwYXJzZWQudmFsdWUgKz0gbWF0Y2gudmFsdWU7XG5cdFx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGVuZFF1b3RlID0gdGhpcy5sb29rYWhlYWQoXCJFbmRRdW90ZVwiKSA/IHRoaXMubWF0Y2goXCJFbmRRdW90ZVwiKSA6IG51bGw7XG5cdFx0XHRcdGlmIChlbmRRdW90ZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0cGFyc2VkLnJhdyArPSBlbmRRdW90ZS52YWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBwYXJzZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLmxvb2thaGVhZChcIkVuZFF1b3RlXCIpKSB7XG5cdFx0XHRcdGNvbnN0IGVuZFF1b3RlID0gdGhpcy5tYXRjaChcIkVuZFF1b3RlXCIpO1xuXHRcdFx0XHRjb25zdCBwYXJzZWQgPSB7XG5cdFx0XHRcdFx0dHlwZTogXCJQaHJhc2VcIixcblx0XHRcdFx0XHR2YWx1ZTogZW5kUXVvdGUudmFsdWUsXG5cdFx0XHRcdFx0cmF3OiBlbmRRdW90ZS52YWx1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLnNlcGFyYXRlZCkge1xuXHRcdFx0Y29uc3QgaW5pdCA9IHRoaXMubWF0Y2goXCJXb3JkXCIpO1xuXHRcdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogaW5pdC52YWx1ZSwgcmF3OiBpbml0LnZhbHVlIH07XG5cdFx0XHR3aGlsZSAodGhpcy5sb29rYWhlYWQoXCJXU1wiKSAmJiB0aGlzLmxvb2thaGVhZE4oMSwgXCJXb3JkXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHdzID0gdGhpcy5tYXRjaChcIldTXCIpO1xuXHRcdFx0XHRjb25zdCB3b3JkID0gdGhpcy5tYXRjaChcIldvcmRcIik7XG5cdFx0XHRcdHBhcnNlZC52YWx1ZSArPSB3cy52YWx1ZSArIHdvcmQudmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdHBhcnNlZC5yYXcgPSBwYXJzZWQudmFsdWU7XG5cdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdH1cblxuXHRcdGNvbnN0IHdvcmQgPSB0aGlzLm1hdGNoKFwiV29yZFwiKTtcblx0XHRjb25zdCBwYXJzZWQgPSB7IHR5cGU6IFwiUGhyYXNlXCIsIHZhbHVlOiB3b3JkLnZhbHVlLCByYXc6IHdvcmQudmFsdWUgfTtcblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG59XG5cbi8qKlxuICogUGFyc2VzIGNvbnRlbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRlbnRQYXJzZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoeyBmbGFnV29yZHMgPSBbXSwgb3B0aW9uRmxhZ1dvcmRzID0gW10sIHF1b3RlZCA9IHRydWUsIHNlcGFyYXRvciB9OiBDb250ZW50UGFyc2VyT3B0aW9ucyA9IHt9KSB7XG5cdFx0dGhpcy5mbGFnV29yZHMgPSBmbGFnV29yZHM7XG5cdFx0dGhpcy5mbGFnV29yZHMuc29ydCgoYSwgYikgPT4gYi5sZW5ndGggLSBhLmxlbmd0aCk7XG5cblx0XHR0aGlzLm9wdGlvbkZsYWdXb3JkcyA9IG9wdGlvbkZsYWdXb3Jkcztcblx0XHR0aGlzLm9wdGlvbkZsYWdXb3Jkcy5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKTtcblxuXHRcdHRoaXMucXVvdGVkID0gQm9vbGVhbihxdW90ZWQpO1xuXHRcdHRoaXMuc2VwYXJhdG9yID0gc2VwYXJhdG9yO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgZmxhZ3MuXG5cdCAqL1xuXHRwdWJsaWMgZmxhZ1dvcmRzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogV29yZHMgY29uc2lkZXJlZCBvcHRpb24gZmxhZ3MuXG5cdCAqL1xuXHRwdWJsaWMgb3B0aW9uRmxhZ1dvcmRzOiBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogV2hldGhlciB0byBwYXJzZSBxdW90ZXMuIERlZmF1bHRzIHRvIGB0cnVlYC5cblx0ICovXG5cdHB1YmxpYyBxdW90ZWQ6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdG8gcGFyc2UgYSBzZXBhcmF0b3IuXG5cdCAqL1xuXHRwdWJsaWMgc2VwYXJhdG9yOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFBhcnNlcyBjb250ZW50LlxuXHQgKiBAcGFyYW0gY29udGVudCAtIENvbnRlbnQgdG8gcGFyc2UuXG5cdCAqL1xuXHRwdWJsaWMgcGFyc2UoY29udGVudDogc3RyaW5nKTogQ29udGVudFBhcnNlclJlc3VsdCB7XG5cdFx0Y29uc3QgdG9rZW5zID0gbmV3IFRva2VuaXplcihjb250ZW50LCB7XG5cdFx0XHRmbGFnV29yZHM6IHRoaXMuZmxhZ1dvcmRzLFxuXHRcdFx0b3B0aW9uRmxhZ1dvcmRzOiB0aGlzLm9wdGlvbkZsYWdXb3Jkcyxcblx0XHRcdHF1b3RlZDogdGhpcy5xdW90ZWQsXG5cdFx0XHRzZXBhcmF0b3I6IHRoaXMuc2VwYXJhdG9yXG5cdFx0fSkudG9rZW5pemUoKTtcblxuXHRcdHJldHVybiBuZXcgUGFyc2VyKHRva2VucywgeyBzZXBhcmF0ZWQ6IHRoaXMuc2VwYXJhdG9yICE9IG51bGwgfSkucGFyc2UoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFeHRyYWN0cyB0aGUgZmxhZ3MgZnJvbSBhcmd1bWVudCBvcHRpb25zLlxuXHQgKiBAcGFyYW0gYXJncyAtIEFyZ3VtZW50IG9wdGlvbnMuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGdldEZsYWdzKGFyZ3M6IEFyZ3VtZW50T3B0aW9uc1tdKTogRXh0cmFjdGVkRmxhZ3Mge1xuXHRcdGNvbnN0IHJlcyA9IHtcblx0XHRcdGZsYWdXb3JkczogW10sXG5cdFx0XHRvcHRpb25GbGFnV29yZHM6IFtdXG5cdFx0fTtcblxuXHRcdGZvciAoY29uc3QgYXJnIG9mIGFyZ3MpIHtcblx0XHRcdGNvbnN0IGFyciA9IHJlc1thcmcubWF0Y2ggPT09IEFyZ3VtZW50TWF0Y2hlcy5GTEFHID8gXCJmbGFnV29yZHNcIiA6IFwib3B0aW9uRmxhZ1dvcmRzXCJdO1xuXHRcdFx0aWYgKGFyZy5tYXRjaCA9PT0gQXJndW1lbnRNYXRjaGVzLkZMQUcgfHwgYXJnLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuT1BUSU9OKSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGFyZy5mbGFnKSkge1xuXHRcdFx0XHRcdGFyci5wdXNoKC4uLmFyZy5mbGFnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhcnIucHVzaChhcmcuZmxhZyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzO1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgdGhlIGNvbnRlbnQgcGFyc2VyLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRlbnRQYXJzZXJPcHRpb25zIHtcblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgZmxhZ3MuXG5cdCAqL1xuXHRmbGFnV29yZHM/OiBzdHJpbmdbXTtcblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgb3B0aW9uIGZsYWdzLlxuXHQgKi9cblx0b3B0aW9uRmxhZ1dvcmRzPzogc3RyaW5nW107XG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRvIHBhcnNlIHF1b3Rlcy4gRGVmYXVsdHMgdG8gYHRydWVgLlxuXHQgKi9cblx0cXVvdGVkPzogYm9vbGVhbjtcblx0LyoqXG5cdCAqIFdoZXRoZXIgdG8gcGFyc2UgYSBzZXBhcmF0b3IuXG5cdCAqL1xuXHRzZXBhcmF0b3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmVzdWx0IG9mIHBhcnNpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudFBhcnNlclJlc3VsdCB7XG5cdC8qKlxuXHQgKiBBbGwgcGhyYXNlcyBhbmQgZmxhZ3MuXG5cdCAqL1xuXHRhbGw6IFN0cmluZ0RhdGFbXTtcblxuXHQvKipcblx0ICogUGhyYXNlcy5cblx0ICovXG5cdHBocmFzZXM6IFN0cmluZ0RhdGFbXTtcblxuXHQvKipcblx0ICogRmxhZ3MuXG5cdCAqL1xuXHRmbGFnczogU3RyaW5nRGF0YVtdO1xuXG5cdC8qKlxuXHQgKiBPcHRpb24gZmxhZ3MuXG5cdCAqL1xuXHRvcHRpb25GbGFnczogU3RyaW5nRGF0YVtdO1xufVxuXG4vKipcbiAqIEEgc2luZ2xlIHBocmFzZSBvciBmbGFnLlxuICovXG5leHBvcnQgdHlwZSBTdHJpbmdEYXRhID1cblx0fCB7XG5cdFx0XHQvKipcblx0XHRcdCAqIE9uZSBvZiAnUGhyYXNlJywgJ0ZsYWcnLCAnT3B0aW9uRmxhZycuXG5cdFx0XHQgKi9cblx0XHRcdHR5cGU6IFwiUGhyYXNlXCI7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIHZhbHVlIG9mIGEgJ1BocmFzZScgb3IgJ09wdGlvbkZsYWcnLlxuXHRcdFx0ICovXG5cdFx0XHR2YWx1ZTogc3RyaW5nO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSByYXcgc3RyaW5nIHdpdGggd2hpdGVzcGFjZSBhbmQvb3Igc2VwYXJhdG9yLlxuXHRcdFx0ICovXG5cdFx0XHRyYXc6IHN0cmluZztcblx0ICB9XG5cdHwge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbmUgb2YgJ1BocmFzZScsICdGbGFnJywgJ09wdGlvbkZsYWcnLlxuXHRcdFx0ICovXG5cdFx0XHR0eXBlOiBcIkZsYWdcIjtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUga2V5IG9mIGEgJ0ZsYWcnIG9yICdPcHRpb25GbGFnJy5cblx0XHRcdCAqL1xuXHRcdFx0a2V5OiBzdHJpbmc7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIHJhdyBzdHJpbmcgd2l0aCB3aGl0ZXNwYWNlIGFuZC9vciBzZXBhcmF0b3IuXG5cdFx0XHQgKi9cblx0XHRcdHJhdzogc3RyaW5nO1xuXHQgIH1cblx0fCB7XG5cdFx0XHQvKipcblx0XHRcdCAqIE9uZSBvZiAnUGhyYXNlJywgJ0ZsYWcnLCAnT3B0aW9uRmxhZycuXG5cdFx0XHQgKi9cblx0XHRcdHR5cGU6IFwiT3B0aW9uRmxhZ1wiO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSBrZXkgb2YgYSAnRmxhZycgb3IgJ09wdGlvbkZsYWcnLlxuXHRcdFx0ICovXG5cdFx0XHRrZXk6IHN0cmluZztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgdmFsdWUgb2YgYSAnUGhyYXNlJyBvciAnT3B0aW9uRmxhZycuXG5cdFx0XHQgKi9cblx0XHRcdHZhbHVlOiBzdHJpbmc7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIHJhdyBzdHJpbmcgd2l0aCB3aGl0ZXNwYWNlIGFuZC9vciBzZXBhcmF0b3IuXG5cdFx0XHQgKi9cblx0XHRcdHJhdzogc3RyaW5nO1xuXHQgIH07XG5cbi8qKlxuICogRmxhZ3MgZXh0cmFjdGVkIGZyb20gYW4gYXJndW1lbnQgbGlzdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFeHRyYWN0ZWRGbGFncyB7XG5cdC8qKlxuXHQgKiBXb3JkcyBjb25zaWRlcmVkIGZsYWdzLlxuXHQgKi9cblx0ZmxhZ1dvcmRzPzogc3RyaW5nW107XG5cdC8qKlxuXHQgKiBXb3JkcyBjb25zaWRlcmVkIG9wdGlvbiBmbGFncy5cblx0ICovXG5cdG9wdGlvbkZsYWdXb3Jkcz86IHN0cmluZ1tdO1xufVxuIl19