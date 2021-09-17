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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGVudFBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdHJ1Y3QvY29tbWFuZHMvQ29udGVudFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUF1RDtBQUd2RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbURHO0FBRUgsTUFBTSxTQUFTO0lBQ2QsWUFDQyxPQUFlLEVBQ2YsRUFBRSxTQUFTLEdBQUcsRUFBRSxFQUFFLGVBQWUsR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLElBQUksRUFBRSxTQUFTLEtBQTJCLEVBQUU7UUFFN0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsMkRBQTJEO1FBQzNELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVNLE9BQU8sQ0FBUztJQUNoQixTQUFTLENBQVc7SUFDcEIsZUFBZSxDQUFXO0lBQzFCLE1BQU0sQ0FBVTtJQUNoQixTQUFTLENBQVU7SUFDbkIsUUFBUSxDQUFTO0lBQ2pCLEtBQUssQ0FBUztJQUNkLE1BQU0sQ0FBUTtJQUVkLFVBQVUsQ0FBQyxHQUFXO1FBQzVCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDMUcsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFhO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0sS0FBSyxDQUFDLElBQVksRUFBRSxFQUFVO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRU0sUUFBUSxDQUFDLElBQVksRUFBRSxLQUFhO1FBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVNLE9BQU8sQ0FBQyxDQUFTO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBRyxPQUEwQjtRQUMxQyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUM3QixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU87YUFDUDtTQUNEO0lBQ0YsQ0FBQztJQUVNLFFBQVE7UUFDZCxPQUFPLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDM0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2Q7UUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDcEIsQ0FBQztJQUVNLE1BQU07UUFDWixJQUFJLENBQUMsTUFBTSxDQUNWLElBQUksQ0FBQyxhQUFhLEVBQ2xCLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLGNBQWMsRUFDbkIsSUFBSSxDQUFDLFFBQVEsRUFDYixJQUFJLENBQUMsWUFBWSxFQUNqQixJQUFJLENBQUMsV0FBVyxFQUNoQixJQUFJLENBQUMsWUFBWSxFQUNqQixJQUFJLENBQUMsT0FBTyxDQUNaLENBQUM7SUFDSCxDQUFDO0lBRU0sUUFBUTtRQUNkLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDckIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNsQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDMUIsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtTQUNEO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRU0sY0FBYztRQUNwQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDeEMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMxQixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUM1RCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDMUIsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtTQUNEO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRU0sUUFBUTtRQUNkLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2xFLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2FBQ2Y7aUJBQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7YUFDZjtZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVNLFlBQVk7UUFDbEIsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDbEUsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7YUFDZjtZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVNLFdBQVc7UUFDakIsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDbEUsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7YUFDZjtZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVNLFlBQVk7UUFDbEIsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM5RCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFTSxPQUFPO1FBQ2IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1FBRXpGLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEMsSUFBSSxTQUFTLEVBQUU7WUFDZCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ2hFLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNsQyxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFFRCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM1QixPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQUVNLGFBQWE7UUFDbkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxJQUFJLE9BQU8sRUFBRTtZQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7Q0FDRDtBQUVELE1BQU0sTUFBTTtJQUNYLFlBQW1CLE1BQWEsRUFBRSxFQUFFLFNBQVMsRUFBMEI7UUFDdEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFbEIsSUFBSSxDQUFDLE9BQU8sR0FBRztZQUNkLEdBQUcsRUFBRSxFQUFFO1lBQ1AsT0FBTyxFQUFFLEVBQUU7WUFDWCxLQUFLLEVBQUUsRUFBRTtZQUNULFdBQVcsRUFBRSxFQUFFO1NBQ2YsQ0FBQztJQUNILENBQUM7SUFFTSxNQUFNLENBQU07SUFDWixTQUFTLENBQU07SUFDZixRQUFRLENBQVM7SUFFeEI7Ozs7O09BS0c7SUFDSSxPQUFPLENBS1o7SUFFSyxJQUFJO1FBQ1YsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFTSxVQUFVLENBQUMsQ0FBUyxFQUFFLEdBQUcsS0FBZTtRQUM5QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEcsQ0FBQztJQUVNLFNBQVMsQ0FBQyxHQUFHLEtBQWU7UUFDbEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxLQUFlO1FBQzlCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNaLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsTUFBTSxJQUFJLEtBQUssQ0FDZCxvQkFBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxZQUNuRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUM1Qiw2QkFBNkIsQ0FDN0IsQ0FBQztJQUNILENBQUM7SUFFTSxLQUFLO1FBQ1gsY0FBYztRQUNkLE9BQU8sSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDOUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ25CO1FBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDckIsQ0FBQztJQUVNLFdBQVc7UUFDakIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNuRSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLEVBQUU7WUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDcEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNuRixNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsUUFBUSxHQUFHLFNBQVMsRUFBRSxDQUFDO1lBQzlELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO2dCQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDaEM7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsT0FBTztTQUNQO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDcEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNuRixNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsUUFBUSxHQUFHLFNBQVMsRUFBRSxDQUFDO1FBQzlELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVNLFNBQVM7UUFDZixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwQyxNQUFNLE1BQU0sR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNsRSxPQUFPLE1BQU0sQ0FBQztTQUNkO1FBRUQsZ0VBQWdFO1FBQ2hFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMxQyxNQUFNLE1BQU0sR0FBRztZQUNkLElBQUksRUFBRSxZQUFZO1lBQ2xCLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSztZQUNmLEtBQUssRUFBRSxFQUFFO1lBQ1QsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ2YsQ0FBQztRQUNGLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxRCxJQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUU7WUFDZixNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7U0FDdkI7UUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUVwRyxJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7WUFDbkIsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQztTQUN6QjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVNLFdBQVc7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDcEIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM1QixNQUFNLE1BQU0sR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQztnQkFDOUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3ZDLE1BQU0sQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQztvQkFDNUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDO2lCQUMxQjtnQkFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RFLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtvQkFDckIsTUFBTSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDO2lCQUM3QjtnQkFFRCxPQUFPLE1BQU0sQ0FBQzthQUNkO1lBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLE1BQU0sR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzFDLE1BQU0sQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQztnQkFDOUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3ZDLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7d0JBQzFCLE1BQU0sQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQzt3QkFDNUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDO3FCQUMxQjt5QkFBTTt3QkFDTixNQUFNLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUM7cUJBQzFCO2lCQUNEO2dCQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDNUUsSUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO29CQUNyQixNQUFNLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUM7aUJBQzdCO2dCQUVELE9BQU8sTUFBTSxDQUFDO2FBQ2Q7WUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQy9CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sTUFBTSxHQUFHO29CQUNkLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSztvQkFDckIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxLQUFLO2lCQUNuQixDQUFDO2dCQUNGLE9BQU8sTUFBTSxDQUFDO2FBQ2Q7U0FDRDtRQUVELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sTUFBTSxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDMUQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEMsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7YUFDdEM7WUFFRCxNQUFNLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDMUIsT0FBTyxNQUFNLENBQUM7U0FDZDtRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEUsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBQ0Q7QUFFRDs7O0dBR0c7QUFDSCxNQUFxQixhQUFhO0lBQ2pDLFlBQW1CLEVBQUUsU0FBUyxHQUFHLEVBQUUsRUFBRSxlQUFlLEdBQUcsRUFBRSxFQUFFLE1BQU0sR0FBRyxJQUFJLEVBQUUsU0FBUyxLQUEyQixFQUFFO1FBQy9HLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbkQsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDdkMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7O09BRUc7SUFDSSxTQUFTLENBQVc7SUFFM0I7O09BRUc7SUFDSSxlQUFlLENBQVc7SUFFakM7O09BRUc7SUFDSSxNQUFNLENBQVU7SUFFdkI7O09BRUc7SUFDSSxTQUFTLENBQVU7SUFFMUI7OztPQUdHO0lBQ0ksS0FBSyxDQUFDLE9BQWU7UUFDM0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFO1lBQ3JDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWU7WUFDckMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztTQUN6QixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFZCxPQUFPLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDMUUsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBdUI7UUFDN0MsTUFBTSxHQUFHLEdBQUc7WUFDWCxTQUFTLEVBQUUsRUFBRTtZQUNiLGVBQWUsRUFBRSxFQUFFO1NBQ25CLENBQUM7UUFFRixLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtZQUN2QixNQUFNLEdBQUcsR0FBZ0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssMkJBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNuRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssMkJBQWUsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssS0FBSywyQkFBZSxDQUFDLE1BQU0sRUFBRTtnQkFDL0UsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdEI7cUJBQU07b0JBQ04sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ25CO2FBQ0Q7U0FDRDtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNEO0FBdEVELGdDQXNFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFyZ3VtZW50TWF0Y2hlcyB9IGZyb20gXCIuLi8uLi91dGlsL0NvbnN0YW50c1wiO1xuaW1wb3J0IHsgQXJndW1lbnRPcHRpb25zIH0gZnJvbSBcIi4vYXJndW1lbnRzL0FyZ3VtZW50XCI7XG5cbi8qXG4gKiBHcmFtbWFyOlxuICpcbiAqIEFyZ3VtZW50c1xuICogID0gKEFyZ3VtZW50IChXUz8gQXJndW1lbnQpKik/IEVPRlxuICpcbiAqIEFyZ3VtZW50XG4gKiAgPSBGbGFnXG4gKiAgfCBQaHJhc2VcbiAqXG4gKiBGbGFnXG4gKiAgPSBGbGFnV29yZFxuICogIHwgT3B0aW9uRmxhZ1dvcmQgV1M/IFBocmFzZT9cbiAqXG4gKiBQaHJhc2VcbiAqICA9IFF1b3RlIChXb3JkIHwgV1MpKiBRdW90ZT9cbiAqICB8IE9wZW5RdW90ZSAoV29yZCB8IE9wZW5RdW90ZSB8IFF1b3RlIHwgV1MpKiBFbmRRdW90ZT9cbiAqICB8IEVuZFF1b3RlXG4gKiAgfCBXb3JkXG4gKlxuICogRmxhZ1dvcmQgPSBHaXZlblxuICogT3B0aW9uRmxhZ1dvcmQgPSBHaXZlblxuICogUXVvdGUgPSBcIlxuICogT3BlblF1b3RlID0g4oCcXG4gKiBFbmRRdW90ZSA9IOKAnVxuICogV29yZCA9IC9eXFxTKy8gKGFuZCBub3QgaW4gRmxhZ1dvcmQgb3IgT3B0aW9uRmxhZ1dvcmQpXG4gKiBXUyA9IC9eXFxzKy9cbiAqIEVPRiA9IC9eJC9cbiAqXG4gKiBXaXRoIGEgc2VwYXJhdG9yOlxuICpcbiAqIEFyZ3VtZW50c1xuICogID0gKEFyZ3VtZW50IChXUz8gU2VwYXJhdG9yIFdTPyBBcmd1bWVudCkqKT8gRU9GXG4gKlxuICogQXJndW1lbnRcbiAqICA9IEZsYWdcbiAqICB8IFBocmFzZVxuICpcbiAqIEZsYWdcbiAqICA9IEZsYWdXb3JkXG4gKiAgfCBPcHRpb25GbGFnV29yZCBXUz8gUGhyYXNlP1xuICpcbiAqIFBocmFzZVxuICogID0gV29yZCAoV1MgV29yZCkqXG4gKlxuICogRmxhZ1dvcmQgPSBHaXZlblxuICogT3B0aW9uRmxhZ1dvcmQgPSBHaXZlblxuICogU2VwYXJhdG9yID0gR2l2ZW5cbiAqIFdvcmQgPSAvXlxcUysvIChhbmQgbm90IGluIEZsYWdXb3JkIG9yIE9wdGlvbkZsYWdXb3JkIG9yIGVxdWFsIHRvIFNlcGFyYXRvcilcbiAqIFdTID0gL15cXHMrL1xuICogRU9GID0gL14kL1xuICovXG5cbmNsYXNzIFRva2VuaXplciB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjb250ZW50OiBzdHJpbmcsXG5cdFx0eyBmbGFnV29yZHMgPSBbXSwgb3B0aW9uRmxhZ1dvcmRzID0gW10sIHF1b3RlZCA9IHRydWUsIHNlcGFyYXRvciB9OiBDb250ZW50UGFyc2VyT3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdHRoaXMuY29udGVudCA9IGNvbnRlbnQ7XG5cdFx0dGhpcy5mbGFnV29yZHMgPSBmbGFnV29yZHM7XG5cdFx0dGhpcy5vcHRpb25GbGFnV29yZHMgPSBvcHRpb25GbGFnV29yZHM7XG5cdFx0dGhpcy5xdW90ZWQgPSBxdW90ZWQ7XG5cdFx0dGhpcy5zZXBhcmF0b3IgPSBzZXBhcmF0b3I7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IDA7XG5cdFx0Ly8gMCAtPiBEZWZhdWx0LCAxIC0+IFF1b3RlcyAoXCJcIiksIDIgLT4gU3BlY2lhbCBRdW90ZXMgKOKAnOKAnSlcblx0XHR0aGlzLnN0YXRlID0gMDtcblx0XHR0aGlzLnRva2VucyA9IFtdO1xuXHR9XG5cblx0cHVibGljIGNvbnRlbnQ6IHN0cmluZztcblx0cHVibGljIGZsYWdXb3Jkczogc3RyaW5nW107XG5cdHB1YmxpYyBvcHRpb25GbGFnV29yZHM6IHN0cmluZ1tdO1xuXHRwdWJsaWMgcXVvdGVkOiBib29sZWFuO1xuXHRwdWJsaWMgc2VwYXJhdG9yPzogc3RyaW5nO1xuXHRwdWJsaWMgcG9zaXRpb246IG51bWJlcjtcblx0cHVibGljIHN0YXRlOiBudW1iZXI7XG5cdHB1YmxpYyB0b2tlbnM6IGFueVtdO1xuXG5cdHB1YmxpYyBzdGFydHNXaXRoKHN0cjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29udGVudC5zbGljZSh0aGlzLnBvc2l0aW9uLCB0aGlzLnBvc2l0aW9uICsgc3RyLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PT0gc3RyLnRvTG93ZXJDYXNlKCk7XG5cdH1cblxuXHRwdWJsaWMgbWF0Y2gocmVnZXg6IFJlZ0V4cCkge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQuc2xpY2UodGhpcy5wb3NpdGlvbikubWF0Y2gocmVnZXgpO1xuXHR9XG5cblx0cHVibGljIHNsaWNlKGZyb206IG51bWJlciwgdG86IG51bWJlcikge1xuXHRcdHJldHVybiB0aGlzLmNvbnRlbnQuc2xpY2UodGhpcy5wb3NpdGlvbiArIGZyb20sIHRoaXMucG9zaXRpb24gKyB0byk7XG5cdH1cblxuXHRwdWJsaWMgYWRkVG9rZW4odHlwZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG5cdFx0dGhpcy50b2tlbnMucHVzaCh7IHR5cGUsIHZhbHVlIH0pO1xuXHR9XG5cblx0cHVibGljIGFkdmFuY2UobjogbnVtYmVyKSB7XG5cdFx0dGhpcy5wb3NpdGlvbiArPSBuO1xuXHR9XG5cblx0cHVibGljIGNob2ljZSguLi5hY3Rpb25zOiB7ICgpOiBib29sZWFuIH1bXSkge1xuXHRcdGZvciAoY29uc3QgYWN0aW9uIG9mIGFjdGlvbnMpIHtcblx0XHRcdGlmIChhY3Rpb24uY2FsbCh0aGlzKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIHRva2VuaXplKCkge1xuXHRcdHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5jb250ZW50Lmxlbmd0aCkge1xuXHRcdFx0dGhpcy5ydW5PbmUoKTtcblx0XHR9XG5cblx0XHR0aGlzLmFkZFRva2VuKFwiRU9GXCIsIFwiXCIpO1xuXHRcdHJldHVybiB0aGlzLnRva2Vucztcblx0fVxuXG5cdHB1YmxpYyBydW5PbmUoKSB7XG5cdFx0dGhpcy5jaG9pY2UoXG5cdFx0XHR0aGlzLnJ1bldoaXRlc3BhY2UsXG5cdFx0XHR0aGlzLnJ1bkZsYWdzLFxuXHRcdFx0dGhpcy5ydW5PcHRpb25GbGFncyxcblx0XHRcdHRoaXMucnVuUXVvdGUsXG5cdFx0XHR0aGlzLnJ1bk9wZW5RdW90ZSxcblx0XHRcdHRoaXMucnVuRW5kUXVvdGUsXG5cdFx0XHR0aGlzLnJ1blNlcGFyYXRvcixcblx0XHRcdHRoaXMucnVuV29yZFxuXHRcdCk7XG5cdH1cblxuXHRwdWJsaWMgcnVuRmxhZ3MoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdGZvciAoY29uc3Qgd29yZCBvZiB0aGlzLmZsYWdXb3Jkcykge1xuXHRcdFx0XHRpZiAodGhpcy5zdGFydHNXaXRoKHdvcmQpKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRUb2tlbihcIkZsYWdXb3JkXCIsIHRoaXMuc2xpY2UoMCwgd29yZC5sZW5ndGgpKTtcblx0XHRcdFx0XHR0aGlzLmFkdmFuY2Uod29yZC5sZW5ndGgpO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cHVibGljIHJ1bk9wdGlvbkZsYWdzKCkge1xuXHRcdGlmICh0aGlzLnN0YXRlID09PSAwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHdvcmQgb2YgdGhpcy5vcHRpb25GbGFnV29yZHMpIHtcblx0XHRcdFx0aWYgKHRoaXMuc3RhcnRzV2l0aCh3b3JkKSkge1xuXHRcdFx0XHRcdHRoaXMuYWRkVG9rZW4oXCJPcHRpb25GbGFnV29yZFwiLCB0aGlzLnNsaWNlKDAsIHdvcmQubGVuZ3RoKSk7XG5cdFx0XHRcdFx0dGhpcy5hZHZhbmNlKHdvcmQubGVuZ3RoKTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBydW5RdW90ZSgpIHtcblx0XHRpZiAodGhpcy5zZXBhcmF0b3IgPT0gbnVsbCAmJiB0aGlzLnF1b3RlZCAmJiB0aGlzLnN0YXJ0c1dpdGgoJ1wiJykpIHtcblx0XHRcdGlmICh0aGlzLnN0YXRlID09PSAxKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSAwO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnN0YXRlID09PSAwKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUgPSAxO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmFkZFRva2VuKFwiUXVvdGVcIiwgJ1wiJyk7XG5cdFx0XHR0aGlzLmFkdmFuY2UoMSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuT3BlblF1b3RlKCkge1xuXHRcdGlmICh0aGlzLnNlcGFyYXRvciA9PSBudWxsICYmIHRoaXMucXVvdGVkICYmIHRoaXMuc3RhcnRzV2l0aCgnXCInKSkge1xuXHRcdFx0aWYgKHRoaXMuc3RhdGUgPT09IDApIHtcblx0XHRcdFx0dGhpcy5zdGF0ZSA9IDI7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJPcGVuUXVvdGVcIiwgJ1wiJyk7XG5cdFx0XHR0aGlzLmFkdmFuY2UoMSk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgcnVuRW5kUXVvdGUoKSB7XG5cdFx0aWYgKHRoaXMuc2VwYXJhdG9yID09IG51bGwgJiYgdGhpcy5xdW90ZWQgJiYgdGhpcy5zdGFydHNXaXRoKFwi4oCdXCIpKSB7XG5cdFx0XHRpZiAodGhpcy5zdGF0ZSA9PT0gMikge1xuXHRcdFx0XHR0aGlzLnN0YXRlID0gMDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5hZGRUb2tlbihcIkVuZFF1b3RlXCIsIFwi4oCdXCIpO1xuXHRcdFx0dGhpcy5hZHZhbmNlKDEpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cHVibGljIHJ1blNlcGFyYXRvcigpIHtcblx0XHRpZiAodGhpcy5zZXBhcmF0b3IgIT0gbnVsbCAmJiB0aGlzLnN0YXJ0c1dpdGgodGhpcy5zZXBhcmF0b3IpKSB7XG5cdFx0XHR0aGlzLmFkZFRva2VuKFwiU2VwYXJhdG9yXCIsIHRoaXMuc2xpY2UoMCwgdGhpcy5zZXBhcmF0b3IubGVuZ3RoKSk7XG5cdFx0XHR0aGlzLmFkdmFuY2UodGhpcy5zZXBhcmF0b3IubGVuZ3RoKTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBydW5Xb3JkKCkge1xuXHRcdGNvbnN0IHdvcmRSZWdleCA9IHRoaXMuc3RhdGUgPT09IDAgPyAvXlxcUysvIDogdGhpcy5zdGF0ZSA9PT0gMSA/IC9eW15cXHNcIl0rLyA6IC9eW15cXHPigJ1dKy87XG5cblx0XHRjb25zdCB3b3JkTWF0Y2ggPSB0aGlzLm1hdGNoKHdvcmRSZWdleCk7XG5cdFx0aWYgKHdvcmRNYXRjaCkge1xuXHRcdFx0aWYgKHRoaXMuc2VwYXJhdG9yKSB7XG5cdFx0XHRcdGlmICh3b3JkTWF0Y2hbMF0udG9Mb3dlckNhc2UoKSA9PT0gdGhpcy5zZXBhcmF0b3IudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGluZGV4ID0gd29yZE1hdGNoWzBdLmluZGV4T2YodGhpcy5zZXBhcmF0b3IpO1xuXHRcdFx0XHRpZiAoaW5kZXggPT09IC0xKSB7XG5cdFx0XHRcdFx0dGhpcy5hZGRUb2tlbihcIldvcmRcIiwgd29yZE1hdGNoWzBdKTtcblx0XHRcdFx0XHR0aGlzLmFkdmFuY2Uod29yZE1hdGNoWzBdLmxlbmd0aCk7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBhY3R1YWwgPSB3b3JkTWF0Y2hbMF0uc2xpY2UoMCwgaW5kZXgpO1xuXHRcdFx0XHR0aGlzLmFkZFRva2VuKFwiV29yZFwiLCBhY3R1YWwpO1xuXHRcdFx0XHR0aGlzLmFkdmFuY2UoYWN0dWFsLmxlbmd0aCk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmFkZFRva2VuKFwiV29yZFwiLCB3b3JkTWF0Y2hbMF0pO1xuXHRcdFx0dGhpcy5hZHZhbmNlKHdvcmRNYXRjaFswXS5sZW5ndGgpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cHVibGljIHJ1bldoaXRlc3BhY2UoKSB7XG5cdFx0Y29uc3Qgd3NNYXRjaCA9IHRoaXMubWF0Y2goL15cXHMrLyk7XG5cdFx0aWYgKHdzTWF0Y2gpIHtcblx0XHRcdHRoaXMuYWRkVG9rZW4oXCJXU1wiLCB3c01hdGNoWzBdKTtcblx0XHRcdHRoaXMuYWR2YW5jZSh3c01hdGNoWzBdLmxlbmd0aCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuY2xhc3MgUGFyc2VyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKHRva2VuczogYW55W10sIHsgc2VwYXJhdGVkIH06IHsgc2VwYXJhdGVkOiBib29sZWFuIH0pIHtcblx0XHR0aGlzLnRva2VucyA9IHRva2Vucztcblx0XHR0aGlzLnNlcGFyYXRlZCA9IHNlcGFyYXRlZDtcblx0XHR0aGlzLnBvc2l0aW9uID0gMDtcblxuXHRcdHRoaXMucmVzdWx0cyA9IHtcblx0XHRcdGFsbDogW10sXG5cdFx0XHRwaHJhc2VzOiBbXSxcblx0XHRcdGZsYWdzOiBbXSxcblx0XHRcdG9wdGlvbkZsYWdzOiBbXVxuXHRcdH07XG5cdH1cblxuXHRwdWJsaWMgdG9rZW5zOiBhbnk7XG5cdHB1YmxpYyBzZXBhcmF0ZWQ6IGFueTtcblx0cHVibGljIHBvc2l0aW9uOiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFBocmFzZXMgYXJlIGB7IHR5cGU6ICdQaHJhc2UnLCB2YWx1ZSwgcmF3IH1gLlxuXHQgKiBGbGFncyBhcmUgYHsgdHlwZTogJ0ZsYWcnLCBrZXksIHJhdyB9YC5cblx0ICogT3B0aW9uIGZsYWdzIGFyZSBgeyB0eXBlOiAnT3B0aW9uRmxhZycsIGtleSwgdmFsdWUsIHJhdyB9YC5cblx0ICogVGhlIGBhbGxgIHByb3BlcnR5IGlzIHBhcnRpdGlvbmVkIGludG8gYHBocmFzZXNgLCBgZmxhZ3NgLCBhbmQgYG9wdGlvbkZsYWdzYC5cblx0ICovXG5cdHB1YmxpYyByZXN1bHRzOiB7XG5cdFx0YWxsOiBhbnlbXTtcblx0XHRwaHJhc2VzOiBhbnlbXTtcblx0XHRmbGFnczogYW55W107XG5cdFx0b3B0aW9uRmxhZ3M6IGFueVtdO1xuXHR9O1xuXG5cdHB1YmxpYyBuZXh0KCkge1xuXHRcdHRoaXMucG9zaXRpb24rKztcblx0fVxuXG5cdHB1YmxpYyBsb29rYWhlYWROKG46IG51bWJlciwgLi4udHlwZXM6IHN0cmluZ1tdKSB7XG5cdFx0cmV0dXJuIHRoaXMudG9rZW5zW3RoaXMucG9zaXRpb24gKyBuXSAhPSBudWxsICYmIHR5cGVzLmluY2x1ZGVzKHRoaXMudG9rZW5zW3RoaXMucG9zaXRpb24gKyBuXS50eXBlKTtcblx0fVxuXG5cdHB1YmxpYyBsb29rYWhlYWQoLi4udHlwZXM6IHN0cmluZ1tdKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9va2FoZWFkTigwLCAuLi50eXBlcyk7XG5cdH1cblxuXHRwdWJsaWMgbWF0Y2goLi4udHlwZXM6IHN0cmluZ1tdKSB7XG5cdFx0aWYgKHRoaXMubG9va2FoZWFkKC4uLnR5cGVzKSkge1xuXHRcdFx0dGhpcy5uZXh0KCk7XG5cdFx0XHRyZXR1cm4gdGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbiAtIDFdO1xuXHRcdH1cblxuXHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdGBVbmV4cGVjdGVkIHRva2VuICR7dGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbl0udmFsdWV9IG9mIHR5cGUgJHtcblx0XHRcdFx0dGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbl0udHlwZVxuXHRcdFx0fSAodGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuKWBcblx0XHQpO1xuXHR9XG5cblx0cHVibGljIHBhcnNlKCkge1xuXHRcdC8vIC0xIGZvciBFT0YuXG5cdFx0d2hpbGUgKHRoaXMucG9zaXRpb24gPCB0aGlzLnRva2Vucy5sZW5ndGggLSAxKSB7XG5cdFx0XHR0aGlzLnJ1bkFyZ3VtZW50KCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5tYXRjaChcIkVPRlwiKTtcblx0XHRyZXR1cm4gdGhpcy5yZXN1bHRzO1xuXHR9XG5cblx0cHVibGljIHJ1bkFyZ3VtZW50KCkge1xuXHRcdGNvbnN0IGxlYWRpbmcgPSB0aGlzLmxvb2thaGVhZChcIldTXCIpID8gdGhpcy5tYXRjaChcIldTXCIpLnZhbHVlIDogXCJcIjtcblx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJGbGFnV29yZFwiLCBcIk9wdGlvbkZsYWdXb3JkXCIpKSB7XG5cdFx0XHRjb25zdCBwYXJzZWQgPSB0aGlzLnBhcnNlRmxhZygpO1xuXHRcdFx0Y29uc3QgdHJhaWxpbmcgPSB0aGlzLmxvb2thaGVhZChcIldTXCIpID8gdGhpcy5tYXRjaChcIldTXCIpLnZhbHVlIDogXCJcIjtcblx0XHRcdGNvbnN0IHNlcGFyYXRvciA9IHRoaXMubG9va2FoZWFkKFwiU2VwYXJhdG9yXCIpID8gdGhpcy5tYXRjaChcIlNlcGFyYXRvclwiKS52YWx1ZSA6IFwiXCI7XG5cdFx0XHRwYXJzZWQucmF3ID0gYCR7bGVhZGluZ30ke3BhcnNlZC5yYXd9JHt0cmFpbGluZ30ke3NlcGFyYXRvcn1gO1xuXHRcdFx0dGhpcy5yZXN1bHRzLmFsbC5wdXNoKHBhcnNlZCk7XG5cdFx0XHRpZiAocGFyc2VkLnR5cGUgPT09IFwiRmxhZ1wiKSB7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5mbGFncy5wdXNoKHBhcnNlZCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnJlc3VsdHMub3B0aW9uRmxhZ3MucHVzaChwYXJzZWQpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3QgcGFyc2VkID0gdGhpcy5wYXJzZVBocmFzZSgpO1xuXHRcdGNvbnN0IHRyYWlsaW5nID0gdGhpcy5sb29rYWhlYWQoXCJXU1wiKSA/IHRoaXMubWF0Y2goXCJXU1wiKS52YWx1ZSA6IFwiXCI7XG5cdFx0Y29uc3Qgc2VwYXJhdG9yID0gdGhpcy5sb29rYWhlYWQoXCJTZXBhcmF0b3JcIikgPyB0aGlzLm1hdGNoKFwiU2VwYXJhdG9yXCIpLnZhbHVlIDogXCJcIjtcblx0XHRwYXJzZWQucmF3ID0gYCR7bGVhZGluZ30ke3BhcnNlZC5yYXd9JHt0cmFpbGluZ30ke3NlcGFyYXRvcn1gO1xuXHRcdHRoaXMucmVzdWx0cy5hbGwucHVzaChwYXJzZWQpO1xuXHRcdHRoaXMucmVzdWx0cy5waHJhc2VzLnB1c2gocGFyc2VkKTtcblx0fVxuXG5cdHB1YmxpYyBwYXJzZUZsYWcoKSB7XG5cdFx0aWYgKHRoaXMubG9va2FoZWFkKFwiRmxhZ1dvcmRcIikpIHtcblx0XHRcdGNvbnN0IGZsYWcgPSB0aGlzLm1hdGNoKFwiRmxhZ1dvcmRcIik7XG5cdFx0XHRjb25zdCBwYXJzZWQgPSB7IHR5cGU6IFwiRmxhZ1wiLCBrZXk6IGZsYWcudmFsdWUsIHJhdzogZmxhZy52YWx1ZSB9O1xuXHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHR9XG5cblx0XHQvLyBPdGhlcndpc2UsIGB0aGlzLmxvb2thaGVhZCgnT3B0aW9uRmxhZ1dvcmQnKWAgc2hvdWxkIGJlIHRydWUuXG5cdFx0Y29uc3QgZmxhZyA9IHRoaXMubWF0Y2goXCJPcHRpb25GbGFnV29yZFwiKTtcblx0XHRjb25zdCBwYXJzZWQgPSB7XG5cdFx0XHR0eXBlOiBcIk9wdGlvbkZsYWdcIixcblx0XHRcdGtleTogZmxhZy52YWx1ZSxcblx0XHRcdHZhbHVlOiBcIlwiLFxuXHRcdFx0cmF3OiBmbGFnLnZhbHVlXG5cdFx0fTtcblx0XHRjb25zdCB3cyA9IHRoaXMubG9va2FoZWFkKFwiV1NcIikgPyB0aGlzLm1hdGNoKFwiV1NcIikgOiBudWxsO1xuXHRcdGlmICh3cyAhPSBudWxsKSB7XG5cdFx0XHRwYXJzZWQucmF3ICs9IHdzLnZhbHVlO1xuXHRcdH1cblxuXHRcdGNvbnN0IHBocmFzZSA9IHRoaXMubG9va2FoZWFkKFwiUXVvdGVcIiwgXCJPcGVuUXVvdGVcIiwgXCJFbmRRdW90ZVwiLCBcIldvcmRcIikgPyB0aGlzLnBhcnNlUGhyYXNlKCkgOiBudWxsO1xuXG5cdFx0aWYgKHBocmFzZSAhPSBudWxsKSB7XG5cdFx0XHRwYXJzZWQudmFsdWUgPSBwaHJhc2UudmFsdWU7XG5cdFx0XHRwYXJzZWQucmF3ICs9IHBocmFzZS5yYXc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhcnNlZDtcblx0fVxuXG5cdHB1YmxpYyBwYXJzZVBocmFzZSgpIHtcblx0XHRpZiAoIXRoaXMuc2VwYXJhdGVkKSB7XG5cdFx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJRdW90ZVwiKSkge1xuXHRcdFx0XHRjb25zdCBwYXJzZWQgPSB7IHR5cGU6IFwiUGhyYXNlXCIsIHZhbHVlOiBcIlwiLCByYXc6IFwiXCIgfTtcblx0XHRcdFx0Y29uc3Qgb3BlblF1b3RlID0gdGhpcy5tYXRjaChcIlF1b3RlXCIpO1xuXHRcdFx0XHRwYXJzZWQucmF3ICs9IG9wZW5RdW90ZS52YWx1ZTtcblx0XHRcdFx0d2hpbGUgKHRoaXMubG9va2FoZWFkKFwiV29yZFwiLCBcIldTXCIpKSB7XG5cdFx0XHRcdFx0Y29uc3QgbWF0Y2ggPSB0aGlzLm1hdGNoKFwiV29yZFwiLCBcIldTXCIpO1xuXHRcdFx0XHRcdHBhcnNlZC52YWx1ZSArPSBtYXRjaC52YWx1ZTtcblx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgZW5kUXVvdGUgPSB0aGlzLmxvb2thaGVhZChcIlF1b3RlXCIpID8gdGhpcy5tYXRjaChcIlF1b3RlXCIpIDogbnVsbDtcblx0XHRcdFx0aWYgKGVuZFF1b3RlICE9IG51bGwpIHtcblx0XHRcdFx0XHRwYXJzZWQucmF3ICs9IGVuZFF1b3RlLnZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMubG9va2FoZWFkKFwiT3BlblF1b3RlXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJQaHJhc2VcIiwgdmFsdWU6IFwiXCIsIHJhdzogXCJcIiB9O1xuXHRcdFx0XHRjb25zdCBvcGVuUXVvdGUgPSB0aGlzLm1hdGNoKFwiT3BlblF1b3RlXCIpO1xuXHRcdFx0XHRwYXJzZWQucmF3ICs9IG9wZW5RdW90ZS52YWx1ZTtcblx0XHRcdFx0d2hpbGUgKHRoaXMubG9va2FoZWFkKFwiV29yZFwiLCBcIldTXCIpKSB7XG5cdFx0XHRcdFx0Y29uc3QgbWF0Y2ggPSB0aGlzLm1hdGNoKFwiV29yZFwiLCBcIldTXCIpO1xuXHRcdFx0XHRcdGlmIChtYXRjaC50eXBlID09PSBcIldvcmRcIikge1xuXHRcdFx0XHRcdFx0cGFyc2VkLnZhbHVlICs9IG1hdGNoLnZhbHVlO1xuXHRcdFx0XHRcdFx0cGFyc2VkLnJhdyArPSBtYXRjaC52YWx1ZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cGFyc2VkLnJhdyArPSBtYXRjaC52YWx1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBlbmRRdW90ZSA9IHRoaXMubG9va2FoZWFkKFwiRW5kUXVvdGVcIikgPyB0aGlzLm1hdGNoKFwiRW5kUXVvdGVcIikgOiBudWxsO1xuXHRcdFx0XHRpZiAoZW5kUXVvdGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdHBhcnNlZC5yYXcgKz0gZW5kUXVvdGUudmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcGFyc2VkO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5sb29rYWhlYWQoXCJFbmRRdW90ZVwiKSkge1xuXHRcdFx0XHRjb25zdCBlbmRRdW90ZSA9IHRoaXMubWF0Y2goXCJFbmRRdW90ZVwiKTtcblx0XHRcdFx0Y29uc3QgcGFyc2VkID0ge1xuXHRcdFx0XHRcdHR5cGU6IFwiUGhyYXNlXCIsXG5cdFx0XHRcdFx0dmFsdWU6IGVuZFF1b3RlLnZhbHVlLFxuXHRcdFx0XHRcdHJhdzogZW5kUXVvdGUudmFsdWVcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5zZXBhcmF0ZWQpIHtcblx0XHRcdGNvbnN0IGluaXQgPSB0aGlzLm1hdGNoKFwiV29yZFwiKTtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IHsgdHlwZTogXCJQaHJhc2VcIiwgdmFsdWU6IGluaXQudmFsdWUsIHJhdzogaW5pdC52YWx1ZSB9O1xuXHRcdFx0d2hpbGUgKHRoaXMubG9va2FoZWFkKFwiV1NcIikgJiYgdGhpcy5sb29rYWhlYWROKDEsIFwiV29yZFwiKSkge1xuXHRcdFx0XHRjb25zdCB3cyA9IHRoaXMubWF0Y2goXCJXU1wiKTtcblx0XHRcdFx0Y29uc3Qgd29yZCA9IHRoaXMubWF0Y2goXCJXb3JkXCIpO1xuXHRcdFx0XHRwYXJzZWQudmFsdWUgKz0gd3MudmFsdWUgKyB3b3JkLnZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRwYXJzZWQucmF3ID0gcGFyc2VkLnZhbHVlO1xuXHRcdFx0cmV0dXJuIHBhcnNlZDtcblx0XHR9XG5cblx0XHRjb25zdCB3b3JkID0gdGhpcy5tYXRjaChcIldvcmRcIik7XG5cdFx0Y29uc3QgcGFyc2VkID0geyB0eXBlOiBcIlBocmFzZVwiLCB2YWx1ZTogd29yZC52YWx1ZSwgcmF3OiB3b3JkLnZhbHVlIH07XG5cdFx0cmV0dXJuIHBhcnNlZDtcblx0fVxufVxuXG4vKipcbiAqIFBhcnNlcyBjb250ZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250ZW50UGFyc2VyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKHsgZmxhZ1dvcmRzID0gW10sIG9wdGlvbkZsYWdXb3JkcyA9IFtdLCBxdW90ZWQgPSB0cnVlLCBzZXBhcmF0b3IgfTogQ29udGVudFBhcnNlck9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuZmxhZ1dvcmRzID0gZmxhZ1dvcmRzO1xuXHRcdHRoaXMuZmxhZ1dvcmRzLnNvcnQoKGEsIGIpID0+IGIubGVuZ3RoIC0gYS5sZW5ndGgpO1xuXG5cdFx0dGhpcy5vcHRpb25GbGFnV29yZHMgPSBvcHRpb25GbGFnV29yZHM7XG5cdFx0dGhpcy5vcHRpb25GbGFnV29yZHMuc29ydCgoYSwgYikgPT4gYi5sZW5ndGggLSBhLmxlbmd0aCk7XG5cblx0XHR0aGlzLnF1b3RlZCA9IEJvb2xlYW4ocXVvdGVkKTtcblx0XHR0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBXb3JkcyBjb25zaWRlcmVkIGZsYWdzLlxuXHQgKi9cblx0cHVibGljIGZsYWdXb3Jkczogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgb3B0aW9uIGZsYWdzLlxuXHQgKi9cblx0cHVibGljIG9wdGlvbkZsYWdXb3Jkczogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdG8gcGFyc2UgcXVvdGVzLiBEZWZhdWx0cyB0byBgdHJ1ZWAuXG5cdCAqL1xuXHRwdWJsaWMgcXVvdGVkOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRvIHBhcnNlIGEgc2VwYXJhdG9yLlxuXHQgKi9cblx0cHVibGljIHNlcGFyYXRvcj86IHN0cmluZztcblxuXHQvKipcblx0ICogUGFyc2VzIGNvbnRlbnQuXG5cdCAqIEBwYXJhbSBjb250ZW50IC0gQ29udGVudCB0byBwYXJzZS5cblx0ICovXG5cdHB1YmxpYyBwYXJzZShjb250ZW50OiBzdHJpbmcpOiBDb250ZW50UGFyc2VyUmVzdWx0IHtcblx0XHRjb25zdCB0b2tlbnMgPSBuZXcgVG9rZW5pemVyKGNvbnRlbnQsIHtcblx0XHRcdGZsYWdXb3JkczogdGhpcy5mbGFnV29yZHMsXG5cdFx0XHRvcHRpb25GbGFnV29yZHM6IHRoaXMub3B0aW9uRmxhZ1dvcmRzLFxuXHRcdFx0cXVvdGVkOiB0aGlzLnF1b3RlZCxcblx0XHRcdHNlcGFyYXRvcjogdGhpcy5zZXBhcmF0b3Jcblx0XHR9KS50b2tlbml6ZSgpO1xuXG5cdFx0cmV0dXJuIG5ldyBQYXJzZXIodG9rZW5zLCB7IHNlcGFyYXRlZDogdGhpcy5zZXBhcmF0b3IgIT0gbnVsbCB9KS5wYXJzZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4dHJhY3RzIHRoZSBmbGFncyBmcm9tIGFyZ3VtZW50IG9wdGlvbnMuXG5cdCAqIEBwYXJhbSBhcmdzIC0gQXJndW1lbnQgb3B0aW9ucy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZ2V0RmxhZ3MoYXJnczogQXJndW1lbnRPcHRpb25zW10pOiBFeHRyYWN0ZWRGbGFncyB7XG5cdFx0Y29uc3QgcmVzID0ge1xuXHRcdFx0ZmxhZ1dvcmRzOiBbXSxcblx0XHRcdG9wdGlvbkZsYWdXb3JkczogW11cblx0XHR9O1xuXG5cdFx0Zm9yIChjb25zdCBhcmcgb2YgYXJncykge1xuXHRcdFx0Y29uc3QgYXJyOiBhbnlbXSB8IGFueSA9IHJlc1thcmcubWF0Y2ggPT09IEFyZ3VtZW50TWF0Y2hlcy5GTEFHID8gXCJmbGFnV29yZHNcIiA6IFwib3B0aW9uRmxhZ1dvcmRzXCJdO1xuXHRcdFx0aWYgKGFyZy5tYXRjaCA9PT0gQXJndW1lbnRNYXRjaGVzLkZMQUcgfHwgYXJnLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuT1BUSU9OKSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGFyZy5mbGFnKSkge1xuXHRcdFx0XHRcdGFyci5wdXNoKC4uLmFyZy5mbGFnKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhcnIucHVzaChhcmcuZmxhZyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzO1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgdGhlIGNvbnRlbnQgcGFyc2VyLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRlbnRQYXJzZXJPcHRpb25zIHtcblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgZmxhZ3MuXG5cdCAqL1xuXHRmbGFnV29yZHM/OiBzdHJpbmdbXTtcblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgb3B0aW9uIGZsYWdzLlxuXHQgKi9cblx0b3B0aW9uRmxhZ1dvcmRzPzogc3RyaW5nW107XG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRvIHBhcnNlIHF1b3Rlcy4gRGVmYXVsdHMgdG8gYHRydWVgLlxuXHQgKi9cblx0cXVvdGVkPzogYm9vbGVhbjtcblx0LyoqXG5cdCAqIFdoZXRoZXIgdG8gcGFyc2UgYSBzZXBhcmF0b3IuXG5cdCAqL1xuXHRzZXBhcmF0b3I/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmVzdWx0IG9mIHBhcnNpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudFBhcnNlclJlc3VsdCB7XG5cdC8qKlxuXHQgKiBBbGwgcGhyYXNlcyBhbmQgZmxhZ3MuXG5cdCAqL1xuXHRhbGw6IFN0cmluZ0RhdGFbXTtcblxuXHQvKipcblx0ICogUGhyYXNlcy5cblx0ICovXG5cdHBocmFzZXM6IFN0cmluZ0RhdGFbXTtcblxuXHQvKipcblx0ICogRmxhZ3MuXG5cdCAqL1xuXHRmbGFnczogU3RyaW5nRGF0YVtdO1xuXG5cdC8qKlxuXHQgKiBPcHRpb24gZmxhZ3MuXG5cdCAqL1xuXHRvcHRpb25GbGFnczogU3RyaW5nRGF0YVtdO1xufVxuXG4vKipcbiAqIEEgc2luZ2xlIHBocmFzZSBvciBmbGFnLlxuICovXG5leHBvcnQgdHlwZSBTdHJpbmdEYXRhID0ge1xuXHQvKipcblx0ICogT25lIG9mICdQaHJhc2UnLCAnRmxhZycsICdPcHRpb25GbGFnJy5cblx0ICovXG5cdHR5cGU6IFwiUGhyYXNlXCIgfCBcIkZsYWdcIiB8IFwiT3B0aW9uRmxhZ1wiO1xuXG5cdC8qKlxuXHQgKiBUaGUga2V5IG9mIGEgJ0ZsYWcnIG9yICdPcHRpb25GbGFnJy5cblx0ICovXG5cdGtleTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgdmFsdWUgb2YgYSAnUGhyYXNlJyBvciAnT3B0aW9uRmxhZycuXG5cdCAqL1xuXHR2YWx1ZTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgcmF3IHN0cmluZyB3aXRoIHdoaXRlc3BhY2UgYW5kL29yIHNlcGFyYXRvci5cblx0ICovXG5cdHJhdzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBGbGFncyBleHRyYWN0ZWQgZnJvbSBhbiBhcmd1bWVudCBsaXN0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4dHJhY3RlZEZsYWdzIHtcblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgZmxhZ3MuXG5cdCAqL1xuXHRmbGFnV29yZHM/OiBzdHJpbmdbXTtcblx0LyoqXG5cdCAqIFdvcmRzIGNvbnNpZGVyZWQgb3B0aW9uIGZsYWdzLlxuXHQgKi9cblx0b3B0aW9uRmxhZ1dvcmRzPzogc3RyaW5nW107XG59XG4iXX0=