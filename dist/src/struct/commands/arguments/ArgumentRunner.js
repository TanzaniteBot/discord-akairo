"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../../util/AkairoError"));
const Constants_1 = require("../../../util/Constants");
const Flag_1 = __importDefault(require("../Flag"));
const Argument_1 = __importDefault(require("./Argument"));
/**
 * Runs arguments.
 * @param command - Command to run for.
 */
class ArgumentRunner {
    constructor(command) {
        this.command = command;
    }
    /**
     * The command the arguments are being run for
     */
    command;
    /**
     * The Akairo client.
     */
    get client() {
        return this.command.client;
    }
    /**
     * The command handler.
     */
    get handler() {
        return this.command.handler;
    }
    /**
     * Runs the arguments.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param generator - Argument generator.
     */
    async run(message, parsed, generator) {
        const state = {
            usedIndices: new Set(),
            phraseIndex: 0,
            index: 0
        };
        const augmentRest = (val) => {
            if (Flag_1.default.is(val, "continue")) {
                val.rest = parsed.all
                    .slice(state.index)
                    .map(x => x.raw)
                    .join("");
            }
        };
        const iter = generator(message, parsed, state);
        let curr = await iter.next();
        while (!curr.done) {
            const value = curr.value;
            if (ArgumentRunner.isShortCircuit(value)) {
                augmentRest(value);
                return value;
            }
            const res = await this.runOne(message, parsed, state, new Argument_1.default(this.command, value));
            if (ArgumentRunner.isShortCircuit(res)) {
                augmentRest(res);
                return res;
            }
            curr = await iter.next(res);
        }
        augmentRest(curr.value);
        return curr.value;
    }
    /**
     * Runs one argument.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runOne(message, parsed, state, arg) {
        const cases = {
            [Constants_1.ArgumentMatches.PHRASE]: this.runPhrase,
            [Constants_1.ArgumentMatches.FLAG]: this.runFlag,
            [Constants_1.ArgumentMatches.OPTION]: this.runOption,
            [Constants_1.ArgumentMatches.REST]: this.runRest,
            [Constants_1.ArgumentMatches.SEPARATE]: this.runSeparate,
            [Constants_1.ArgumentMatches.TEXT]: this.runText,
            [Constants_1.ArgumentMatches.CONTENT]: this.runContent,
            [Constants_1.ArgumentMatches.REST_CONTENT]: this.runRestContent,
            [Constants_1.ArgumentMatches.NONE]: this.runNone
        };
        const runFn = cases[arg.match];
        if (runFn == null) {
            throw new AkairoError_1.default("UNKNOWN_MATCH_TYPE", arg.match);
        }
        return runFn.call(this, message, parsed, state, arg);
    }
    /**
     * Runs `phrase` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    async runPhrase(message, parsed, state, arg) {
        if (arg.unordered || arg.unordered === 0) {
            const indices = typeof arg.unordered === "number"
                ? Array.from(parsed.phrases.keys()).slice(arg.unordered)
                : Array.isArray(arg.unordered)
                    ? arg.unordered
                    : Array.from(parsed.phrases.keys());
            for (const i of indices) {
                if (state.usedIndices.has(i)) {
                    continue;
                }
                // @ts-expect-error
                const phrase = parsed.phrases[i] ? parsed.phrases[i].value : "";
                // `cast` is used instead of `process` since we do not want prompts.
                const res = await arg.cast(message, phrase);
                if (res != null) {
                    state.usedIndices.add(i);
                    return res;
                }
            }
            // No indices matched.
            return arg.process(message, "");
        }
        const index = arg.index == null ? state.phraseIndex : arg.index;
        const ret = arg.process(message, 
        // @ts-expect-error
        parsed.phrases[index] ? parsed.phrases[index].value : "");
        if (arg.index == null) {
            ArgumentRunner.increaseIndex(parsed, state);
        }
        return ret;
    }
    /**
     * Runs `rest` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    async runRest(message, parsed, state, arg) {
        const index = arg.index == null ? state.phraseIndex : arg.index;
        const rest = parsed.phrases
            .slice(index, index + arg.limit)
            .map(x => x.raw)
            .join("")
            .trim();
        const ret = await arg.process(message, rest);
        if (arg.index == null) {
            ArgumentRunner.increaseIndex(parsed, state);
        }
        return ret;
    }
    /**
     * Runs `separate` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    async runSeparate(message, parsed, state, arg) {
        const index = arg.index == null ? state.phraseIndex : arg.index;
        const phrases = parsed.phrases.slice(index, index + arg.limit);
        if (!phrases.length) {
            const ret = await arg.process(message, "");
            if (arg.index != null) {
                ArgumentRunner.increaseIndex(parsed, state);
            }
            return ret;
        }
        const res = [];
        for (const phrase of phrases) {
            // @ts-expect-error
            const response = await arg.process(message, phrase.value);
            if (Flag_1.default.is(response, "cancel")) {
                return response;
            }
            res.push(response);
        }
        if (arg.index != null) {
            ArgumentRunner.increaseIndex(parsed, state);
        }
        return res;
    }
    /**
     * Runs `flag` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runFlag(message, parsed, state, arg) {
        const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
        if (arg.multipleFlags) {
            const amount = parsed.flags.filter(flag => 
            // @ts-expect-error
            names.some(name => name.toLowerCase() === flag.key.toLowerCase())).length;
            // @ts-expect-error
            return amount;
        }
        const flagFound = parsed.flags.some(flag => 
        // @ts-expect-error
        names.some(name => name.toLowerCase() === flag.key.toLowerCase()));
        // @ts-expect-error
        return arg.default == null ? flagFound : !flagFound;
    }
    /**
     * Runs `option` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    async runOption(message, parsed, state, arg) {
        const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
        if (arg.multipleFlags) {
            const values = parsed.optionFlags
                .filter(flag => 
            // @ts-expect-error
            names.some(name => name.toLowerCase() === flag.key.toLowerCase()))
                // @ts-expect-error
                .map(x => x.value)
                .slice(0, arg.limit);
            const res = [];
            for (const value of values) {
                res.push(await arg.process(message, value));
            }
            return res;
        }
        const foundFlag = parsed.optionFlags.find(flag => 
        // @ts-expect-error
        names.some(name => name.toLowerCase() === flag.key.toLowerCase()));
        // @ts-expect-error
        return arg.process(message, foundFlag != null ? foundFlag.value : "");
    }
    /**
     * Runs `text` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runText(message, parsed, state, arg) {
        const index = arg.index == null ? 0 : arg.index;
        const text = parsed.phrases
            .slice(index, index + arg.limit)
            .map(x => x.raw)
            .join("")
            .trim();
        return arg.process(message, text);
    }
    /**
     * Runs `content` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runContent(message, parsed, state, arg) {
        const index = arg.index == null ? 0 : arg.index;
        const content = parsed.all
            .slice(index, index + arg.limit)
            .map(x => x.raw)
            .join("")
            .trim();
        return arg.process(message, content);
    }
    /**
     * Runs `restContent` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    async runRestContent(message, parsed, state, arg) {
        const index = arg.index == null ? state.index : arg.index;
        const rest = parsed.all
            .slice(index, index + arg.limit)
            .map(x => x.raw)
            .join("")
            .trim();
        const ret = await arg.process(message, rest);
        if (arg.index == null) {
            ArgumentRunner.increaseIndex(parsed, state);
        }
        return ret;
    }
    /**
     * Runs `none` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runNone(message, parsed, state, arg) {
        return arg.process(message, "");
    }
    /**
     * Modifies state by incrementing the indices.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param n - Number of indices to increase by.
     */
    static increaseIndex(parsed, state, n = 1) {
        state.phraseIndex += n;
        while (n > 0) {
            do {
                state.index++;
            } while (parsed.all[state.index] && parsed.all[state.index].type !== "Phrase");
            n--;
        }
    }
    /**
     * Checks if something is a flag that short circuits.
     * @param value - A value.
     */
    static isShortCircuit(value) {
        return Flag_1.default.is(value, "cancel") || Flag_1.default.is(value, "retry") || Flag_1.default.is(value, "continue");
    }
    /**
     * Creates an argument generator from argument options.
     * @param args - Argument options.
     */
    static fromArguments(args) {
        // @ts-expect-error
        return function* generate() {
            const res = {};
            // @ts-expect-error
            for (const [id, arg] of args) {
                res[id] = yield arg;
            }
            return res;
        };
    }
}
exports.default = ArgumentRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnRSdW5uZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudFJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLDRFQUFvRDtBQUNwRCx1REFBMEQ7QUFHMUQsbURBQTJCO0FBQzNCLDBEQUF1RDtBQUV2RDs7O0dBR0c7QUFDSCxNQUFxQixjQUFjO0lBQ2xDLFlBQW1CLE9BQWdCO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU8sQ0FBVTtJQUV4Qjs7T0FFRztJQUNILElBQVcsTUFBTTtRQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILElBQVcsT0FBTztRQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBZ0IsRUFBRSxNQUEyQixFQUFFLFNBQTRCO1FBQzNGLE1BQU0sS0FBSyxHQUFHO1lBQ2IsV0FBVyxFQUFFLElBQUksR0FBRyxFQUFVO1lBQzlCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsS0FBSyxFQUFFLENBQUM7U0FDUixDQUFDO1FBRUYsTUFBTSxXQUFXLEdBQUcsQ0FBQyxHQUEyQixFQUFFLEVBQUU7WUFDbkQsSUFBSSxjQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsRUFBRTtnQkFDNUIsR0FBVyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRztxQkFDNUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7cUJBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7cUJBQ2YsSUFB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QUNkLFFBQVEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUMvRSxDQUFDLEVBQUUsQ0FBQztTQUNKO0lBQ0YsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBVTtRQUN0QyxPQUFPLGNBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLGNBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJLGNBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQXVCO1FBQ2xELG1CQUFtQjtRQUNuQixPQUFPLFFBQVEsQ0FBQyxDQUFDLFFBQVE7WUFDeEIsTUFBTSxHQUFHLEdBQTJCLEVBQUUsQ0FBQztZQUN2QyxtQkFBbUI7WUFDbkIsS0FBSyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRTtnQkFDN0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDO2FBQ3BCO1lBRUQsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDLENBQUM7SUFDSCxDQUFDO0NBQ0Q7QUF6YUQsaUNBeWFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgQWthaXJvRXJyb3IgZnJvbSBcIi4uLy4uLy4uL3V0aWwvQWthaXJvRXJyb3JcIjtcbmltcG9ydCB7IEFyZ3VtZW50TWF0Y2hlcyB9IGZyb20gXCIuLi8uLi8uLi91dGlsL0NvbnN0YW50c1wiO1xuaW1wb3J0IENvbW1hbmQsIHsgQXJndW1lbnRHZW5lcmF0b3IgfSBmcm9tIFwiLi4vQ29tbWFuZFwiO1xuaW1wb3J0IHsgQ29udGVudFBhcnNlclJlc3VsdCB9IGZyb20gXCIuLi9Db250ZW50UGFyc2VyXCI7XG5pbXBvcnQgRmxhZyBmcm9tIFwiLi4vRmxhZ1wiO1xuaW1wb3J0IEFyZ3VtZW50LCB7IEFyZ3VtZW50T3B0aW9ucyB9IGZyb20gXCIuL0FyZ3VtZW50XCI7XG5cbi8qKlxuICogUnVucyBhcmd1bWVudHMuXG4gKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgdG8gcnVuIGZvci5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJndW1lbnRSdW5uZXIge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoY29tbWFuZDogQ29tbWFuZCkge1xuXHRcdHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgdGhlIGFyZ3VtZW50cyBhcmUgYmVpbmcgcnVuIGZvclxuXHQgKi9cblx0cHVibGljIGNvbW1hbmQ6IENvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBBa2Fpcm8gY2xpZW50LlxuXHQgKi9cblx0cHVibGljIGdldCBjbGllbnQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29tbWFuZC5jbGllbnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgaGFuZGxlci5cblx0ICovXG5cdHB1YmxpYyBnZXQgaGFuZGxlcigpIHtcblx0XHRyZXR1cm4gdGhpcy5jb21tYW5kLmhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyB0aGUgYXJndW1lbnRzLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSBnZW5lcmF0b3IgLSBBcmd1bWVudCBnZW5lcmF0b3IuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuKG1lc3NhZ2U6IE1lc3NhZ2UsIHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCwgZ2VuZXJhdG9yOiBBcmd1bWVudEdlbmVyYXRvcik6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IHN0YXRlID0ge1xuXHRcdFx0dXNlZEluZGljZXM6IG5ldyBTZXQ8bnVtYmVyPigpLFxuXHRcdFx0cGhyYXNlSW5kZXg6IDAsXG5cdFx0XHRpbmRleDogMFxuXHRcdH07XG5cblx0XHRjb25zdCBhdWdtZW50UmVzdCA9ICh2YWw6IEZsYWcgfCBBcmd1bWVudE9wdGlvbnMpID0+IHtcblx0XHRcdGlmIChGbGFnLmlzKHZhbCwgXCJjb250aW51ZVwiKSkge1xuXHRcdFx0XHQodmFsIGFzIGFueSkucmVzdCA9IHBhcnNlZC5hbGxcblx0XHRcdFx0XHQuc2xpY2Uoc3RhdGUuaW5kZXgpXG5cdFx0XHRcdFx0Lm1hcCh4ID0+IHgucmF3KVxuXHRcdFx0XHRcdC5qb2luKFwiXCIpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRjb25zdCBpdGVyID0gZ2VuZXJhdG9yKG1lc3NhZ2UsIHBhcnNlZCwgc3RhdGUpO1xuXHRcdGxldCBjdXJyID0gYXdhaXQgaXRlci5uZXh0KCk7XG5cdFx0d2hpbGUgKCFjdXJyLmRvbmUpIHtcblx0XHRcdGNvbnN0IHZhbHVlID0gY3Vyci52YWx1ZTtcblx0XHRcdGlmIChBcmd1bWVudFJ1bm5lci5pc1Nob3J0Q2lyY3VpdCh2YWx1ZSkpIHtcblx0XHRcdFx0YXVnbWVudFJlc3QodmFsdWUpO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMucnVuT25lKG1lc3NhZ2UsIHBhcnNlZCwgc3RhdGUsIG5ldyBBcmd1bWVudCh0aGlzLmNvbW1hbmQsIHZhbHVlKSk7XG5cdFx0XHRpZiAoQXJndW1lbnRSdW5uZXIuaXNTaG9ydENpcmN1aXQocmVzKSkge1xuXHRcdFx0XHRhdWdtZW50UmVzdChyZXMpO1xuXHRcdFx0XHRyZXR1cm4gcmVzO1xuXHRcdFx0fVxuXG5cdFx0XHRjdXJyID0gYXdhaXQgaXRlci5uZXh0KHJlcyk7XG5cdFx0fVxuXG5cdFx0YXVnbWVudFJlc3QoY3Vyci52YWx1ZSk7XG5cdFx0cmV0dXJuIGN1cnIudmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBvbmUgYXJndW1lbnQuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBhcnNlZCAtIFBhcnNlZCBkYXRhIGZyb20gQ29udGVudFBhcnNlci5cblx0ICogQHBhcmFtIHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSBhcmcgLSBDdXJyZW50IGFyZ3VtZW50LlxuXHQgKi9cblx0cHVibGljIHJ1bk9uZShcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IGNhc2VzID0ge1xuXHRcdFx0W0FyZ3VtZW50TWF0Y2hlcy5QSFJBU0VdOiB0aGlzLnJ1blBocmFzZSxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuRkxBR106IHRoaXMucnVuRmxhZyxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuT1BUSU9OXTogdGhpcy5ydW5PcHRpb24sXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLlJFU1RdOiB0aGlzLnJ1blJlc3QsXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLlNFUEFSQVRFXTogdGhpcy5ydW5TZXBhcmF0ZSxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuVEVYVF06IHRoaXMucnVuVGV4dCxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuQ09OVEVOVF06IHRoaXMucnVuQ29udGVudCxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuUkVTVF9DT05URU5UXTogdGhpcy5ydW5SZXN0Q29udGVudCxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuTk9ORV06IHRoaXMucnVuTm9uZVxuXHRcdH07XG5cblx0XHRjb25zdCBydW5GbiA9IGNhc2VzW2FyZy5tYXRjaF07XG5cdFx0aWYgKHJ1bkZuID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIlVOS05PV05fTUFUQ0hfVFlQRVwiLCBhcmcubWF0Y2gpO1xuXHRcdH1cblxuXHRcdHJldHVybiBydW5Gbi5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBhcnNlZCwgc3RhdGUsIGFyZyk7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgcGhyYXNlYCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUGhyYXNlKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdGFyZzogQXJndW1lbnRcblx0KTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0aWYgKGFyZy51bm9yZGVyZWQgfHwgYXJnLnVub3JkZXJlZCA9PT0gMCkge1xuXHRcdFx0Y29uc3QgaW5kaWNlcyA9XG5cdFx0XHRcdHR5cGVvZiBhcmcudW5vcmRlcmVkID09PSBcIm51bWJlclwiXG5cdFx0XHRcdFx0PyBBcnJheS5mcm9tKHBhcnNlZC5waHJhc2VzLmtleXMoKSkuc2xpY2UoYXJnLnVub3JkZXJlZClcblx0XHRcdFx0XHQ6IEFycmF5LmlzQXJyYXkoYXJnLnVub3JkZXJlZClcblx0XHRcdFx0XHQ/IGFyZy51bm9yZGVyZWRcblx0XHRcdFx0XHQ6IEFycmF5LmZyb20ocGFyc2VkLnBocmFzZXMua2V5cygpKTtcblxuXHRcdFx0Zm9yIChjb25zdCBpIG9mIGluZGljZXMpIHtcblx0XHRcdFx0aWYgKHN0YXRlLnVzZWRJbmRpY2VzLmhhcyhpKSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRjb25zdCBwaHJhc2UgPSBwYXJzZWQucGhyYXNlc1tpXSA/IHBhcnNlZC5waHJhc2VzW2ldLnZhbHVlIDogXCJcIjtcblx0XHRcdFx0Ly8gYGNhc3RgIGlzIHVzZWQgaW5zdGVhZCBvZiBgcHJvY2Vzc2Agc2luY2Ugd2UgZG8gbm90IHdhbnQgcHJvbXB0cy5cblx0XHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgYXJnLmNhc3QobWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdFx0aWYgKHJlcyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0c3RhdGUudXNlZEluZGljZXMuYWRkKGkpO1xuXHRcdFx0XHRcdHJldHVybiByZXM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gTm8gaW5kaWNlcyBtYXRjaGVkLlxuXHRcdFx0cmV0dXJuIGFyZy5wcm9jZXNzKG1lc3NhZ2UsIFwiXCIpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGluZGV4ID0gYXJnLmluZGV4ID09IG51bGwgPyBzdGF0ZS5waHJhc2VJbmRleCA6IGFyZy5pbmRleDtcblx0XHRjb25zdCByZXQgPSBhcmcucHJvY2Vzcyhcblx0XHRcdG1lc3NhZ2UsXG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRwYXJzZWQucGhyYXNlc1tpbmRleF0gPyBwYXJzZWQucGhyYXNlc1tpbmRleF0udmFsdWUgOiBcIlwiXG5cdFx0KTtcblx0XHRpZiAoYXJnLmluZGV4ID09IG51bGwpIHtcblx0XHRcdEFyZ3VtZW50UnVubmVyLmluY3JlYXNlSW5kZXgocGFyc2VkLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGByZXN0YCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUmVzdChcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IGluZGV4ID0gYXJnLmluZGV4ID09IG51bGwgPyBzdGF0ZS5waHJhc2VJbmRleCA6IGFyZy5pbmRleDtcblx0XHRjb25zdCByZXN0ID0gcGFyc2VkLnBocmFzZXNcblx0XHRcdC5zbGljZShpbmRleCwgaW5kZXggKyBhcmcubGltaXQpXG5cdFx0XHQubWFwKHggPT4geC5yYXcpXG5cdFx0XHQuam9pbihcIlwiKVxuXHRcdFx0LnRyaW0oKTtcblx0XHRjb25zdCByZXQgPSBhd2FpdCBhcmcucHJvY2VzcyhtZXNzYWdlLCByZXN0KTtcblx0XHRpZiAoYXJnLmluZGV4ID09IG51bGwpIHtcblx0XHRcdEFyZ3VtZW50UnVubmVyLmluY3JlYXNlSW5kZXgocGFyc2VkLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGBzZXBhcmF0ZWAgbWF0Y2guXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBhcnNlZCAtIFBhcnNlZCBkYXRhIGZyb20gQ29udGVudFBhcnNlci5cblx0ICogQHBhcmFtIHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSBhcmcgLSBDdXJyZW50IGFyZ3VtZW50LlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1blNlcGFyYXRlKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdGFyZzogQXJndW1lbnRcblx0KTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgaW5kZXggPSBhcmcuaW5kZXggPT0gbnVsbCA/IHN0YXRlLnBocmFzZUluZGV4IDogYXJnLmluZGV4O1xuXHRcdGNvbnN0IHBocmFzZXMgPSBwYXJzZWQucGhyYXNlcy5zbGljZShpbmRleCwgaW5kZXggKyBhcmcubGltaXQpO1xuXHRcdGlmICghcGhyYXNlcy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHJldCA9IGF3YWl0IGFyZy5wcm9jZXNzKG1lc3NhZ2UsIFwiXCIpO1xuXHRcdFx0aWYgKGFyZy5pbmRleCAhPSBudWxsKSB7XG5cdFx0XHRcdEFyZ3VtZW50UnVubmVyLmluY3JlYXNlSW5kZXgocGFyc2VkLCBzdGF0ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzID0gW107XG5cdFx0Zm9yIChjb25zdCBwaHJhc2Ugb2YgcGhyYXNlcykge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcmcucHJvY2VzcyhtZXNzYWdlLCBwaHJhc2UudmFsdWUpO1xuXG5cdFx0XHRpZiAoRmxhZy5pcyhyZXNwb25zZSwgXCJjYW5jZWxcIikpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXMucHVzaChyZXNwb25zZSk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZy5pbmRleCAhPSBudWxsKSB7XG5cdFx0XHRBcmd1bWVudFJ1bm5lci5pbmNyZWFzZUluZGV4KHBhcnNlZCwgc3RhdGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgZmxhZ2AgbWF0Y2guXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBhcnNlZCAtIFBhcnNlZCBkYXRhIGZyb20gQ29udGVudFBhcnNlci5cblx0ICogQHBhcmFtIHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSBhcmcgLSBDdXJyZW50IGFyZ3VtZW50LlxuXHQgKi9cblx0cHVibGljIHJ1bkZsYWcoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0c3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsXG5cdFx0YXJnOiBBcmd1bWVudFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBuYW1lcyA9IEFycmF5LmlzQXJyYXkoYXJnLmZsYWcpID8gYXJnLmZsYWcgOiBbYXJnLmZsYWddO1xuXHRcdGlmIChhcmcubXVsdGlwbGVGbGFncykge1xuXHRcdFx0Y29uc3QgYW1vdW50ID0gcGFyc2VkLmZsYWdzLmZpbHRlcihmbGFnID0+XG5cdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0bmFtZXMuc29tZShuYW1lID0+IG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gZmxhZy5rZXkudG9Mb3dlckNhc2UoKSlcblx0XHRcdCkubGVuZ3RoO1xuXG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRyZXR1cm4gYW1vdW50O1xuXHRcdH1cblxuXHRcdGNvbnN0IGZsYWdGb3VuZCA9IHBhcnNlZC5mbGFncy5zb21lKGZsYWcgPT5cblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5hbWVzLnNvbWUobmFtZSA9PiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09IGZsYWcua2V5LnRvTG93ZXJDYXNlKCkpXG5cdFx0KTtcblxuXHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRyZXR1cm4gYXJnLmRlZmF1bHQgPT0gbnVsbCA/IGZsYWdGb3VuZCA6ICFmbGFnRm91bmQ7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgb3B0aW9uYCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuT3B0aW9uKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdGFyZzogQXJndW1lbnRcblx0KTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgbmFtZXMgPSBBcnJheS5pc0FycmF5KGFyZy5mbGFnKSA/IGFyZy5mbGFnIDogW2FyZy5mbGFnXTtcblx0XHRpZiAoYXJnLm11bHRpcGxlRmxhZ3MpIHtcblx0XHRcdGNvbnN0IHZhbHVlcyA9IHBhcnNlZC5vcHRpb25GbGFnc1xuXHRcdFx0XHQuZmlsdGVyKGZsYWcgPT5cblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0bmFtZXMuc29tZShuYW1lID0+IG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gZmxhZy5rZXkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0KVxuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdC5tYXAoeCA9PiB4LnZhbHVlKVxuXHRcdFx0XHQuc2xpY2UoMCwgYXJnLmxpbWl0KTtcblxuXHRcdFx0Y29uc3QgcmVzID0gW107XG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuXHRcdFx0XHRyZXMucHVzaChhd2FpdCBhcmcucHJvY2VzcyhtZXNzYWdlLCB2YWx1ZSkpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZvdW5kRmxhZyA9IHBhcnNlZC5vcHRpb25GbGFncy5maW5kKGZsYWcgPT5cblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5hbWVzLnNvbWUobmFtZSA9PiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09IGZsYWcua2V5LnRvTG93ZXJDYXNlKCkpXG5cdFx0KTtcblxuXHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRyZXR1cm4gYXJnLnByb2Nlc3MobWVzc2FnZSwgZm91bmRGbGFnICE9IG51bGwgPyBmb3VuZEZsYWcudmFsdWUgOiBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGB0ZXh0YCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgcnVuVGV4dChcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IGluZGV4ID0gYXJnLmluZGV4ID09IG51bGwgPyAwIDogYXJnLmluZGV4O1xuXHRcdGNvbnN0IHRleHQgPSBwYXJzZWQucGhyYXNlc1xuXHRcdFx0LnNsaWNlKGluZGV4LCBpbmRleCArIGFyZy5saW1pdClcblx0XHRcdC5tYXAoeCA9PiB4LnJhdylcblx0XHRcdC5qb2luKFwiXCIpXG5cdFx0XHQudHJpbSgpO1xuXHRcdHJldHVybiBhcmcucHJvY2VzcyhtZXNzYWdlLCB0ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGBjb250ZW50YCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgcnVuQ29udGVudChcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IGluZGV4ID0gYXJnLmluZGV4ID09IG51bGwgPyAwIDogYXJnLmluZGV4O1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBwYXJzZWQuYWxsXG5cdFx0XHQuc2xpY2UoaW5kZXgsIGluZGV4ICsgYXJnLmxpbWl0KVxuXHRcdFx0Lm1hcCh4ID0+IHgucmF3KVxuXHRcdFx0LmpvaW4oXCJcIilcblx0XHRcdC50cmltKCk7XG5cdFx0cmV0dXJuIGFyZy5wcm9jZXNzKG1lc3NhZ2UsIGNvbnRlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYHJlc3RDb250ZW50YCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuUmVzdENvbnRlbnQoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0c3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsXG5cdFx0YXJnOiBBcmd1bWVudFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBpbmRleCA9IGFyZy5pbmRleCA9PSBudWxsID8gc3RhdGUuaW5kZXggOiBhcmcuaW5kZXg7XG5cdFx0Y29uc3QgcmVzdCA9IHBhcnNlZC5hbGxcblx0XHRcdC5zbGljZShpbmRleCwgaW5kZXggKyBhcmcubGltaXQpXG5cdFx0XHQubWFwKHggPT4geC5yYXcpXG5cdFx0XHQuam9pbihcIlwiKVxuXHRcdFx0LnRyaW0oKTtcblx0XHRjb25zdCByZXQgPSBhd2FpdCBhcmcucHJvY2VzcyhtZXNzYWdlLCByZXN0KTtcblx0XHRpZiAoYXJnLmluZGV4ID09IG51bGwpIHtcblx0XHRcdEFyZ3VtZW50UnVubmVyLmluY3JlYXNlSW5kZXgocGFyc2VkLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGBub25lYCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgcnVuTm9uZShcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdHJldHVybiBhcmcucHJvY2VzcyhtZXNzYWdlLCBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZmllcyBzdGF0ZSBieSBpbmNyZW1lbnRpbmcgdGhlIGluZGljZXMuXG5cdCAqIEBwYXJhbSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSBzdGF0ZSAtIEFyZ3VtZW50IGhhbmRsaW5nIHN0YXRlLlxuXHQgKiBAcGFyYW0gbiAtIE51bWJlciBvZiBpbmRpY2VzIHRvIGluY3JlYXNlIGJ5LlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpbmNyZWFzZUluZGV4KHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCwgc3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsIG4gPSAxKTogdm9pZCB7XG5cdFx0c3RhdGUucGhyYXNlSW5kZXggKz0gbjtcblx0XHR3aGlsZSAobiA+IDApIHtcblx0XHRcdGRvIHtcblx0XHRcdFx0c3RhdGUuaW5kZXgrKztcblx0XHRcdH0gd2hpbGUgKHBhcnNlZC5hbGxbc3RhdGUuaW5kZXhdICYmIHBhcnNlZC5hbGxbc3RhdGUuaW5kZXhdLnR5cGUgIT09IFwiUGhyYXNlXCIpO1xuXHRcdFx0bi0tO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgc29tZXRoaW5nIGlzIGEgZmxhZyB0aGF0IHNob3J0IGNpcmN1aXRzLlxuXHQgKiBAcGFyYW0gdmFsdWUgLSBBIHZhbHVlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBpc1Nob3J0Q2lyY3VpdCh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIEZsYWcuaXModmFsdWUsIFwiY2FuY2VsXCIpIHx8IEZsYWcuaXModmFsdWUsIFwicmV0cnlcIikgfHwgRmxhZy5pcyh2YWx1ZSwgXCJjb250aW51ZVwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuIGFyZ3VtZW50IGdlbmVyYXRvciBmcm9tIGFyZ3VtZW50IG9wdGlvbnMuXG5cdCAqIEBwYXJhbSBhcmdzIC0gQXJndW1lbnQgb3B0aW9ucy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgZnJvbUFyZ3VtZW50cyhhcmdzOiBBcmd1bWVudE9wdGlvbnNbXSk6IEdlbmVyYXRvckZ1bmN0aW9uIHtcblx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKiBnZW5lcmF0ZSgpIHtcblx0XHRcdGNvbnN0IHJlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0Zm9yIChjb25zdCBbaWQsIGFyZ10gb2YgYXJncykge1xuXHRcdFx0XHRyZXNbaWRdID0geWllbGQgYXJnO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH07XG5cdH1cbn1cblxuLyoqXG4gKiBTdGF0ZSBmb3IgdGhlIGFyZ3VtZW50IHJ1bm5lci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFJ1bm5lclN0YXRlIHtcblx0LyoqIEluZGV4IGluIHRlcm1zIG9mIHRoZSByYXcgc3RyaW5ncy4gKi9cblx0aW5kZXg6IG51bWJlcjtcblxuXHQvKiogSW5kZXggaW4gdGVybXMgb2YgcGhyYXNlcy4gKi9cblx0cGhyYXNlSW5kZXg6IG51bWJlcjtcblxuXHQvKiogSW5kaWNlcyBhbHJlYWR5IHVzZWQgZm9yIHVub3JkZXJlZCBtYXRjaC4gKi9cblx0dXNlZEluZGljZXM6IFNldDxudW1iZXI+O1xufVxuIl19