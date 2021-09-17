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
        const ret = arg.process(message, parsed.phrases[index] ? parsed.phrases[index].value : "");
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
            const amount = parsed.flags.filter(flag => names.some(name => name?.toLowerCase() === flag.key.toLowerCase())).length;
            return amount;
        }
        const flagFound = parsed.flags.some(flag => names.some(name => name?.toLowerCase() === flag.key.toLowerCase()));
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
                .filter(flag => names.some(name => name?.toLowerCase() === flag.key.toLowerCase()))
                .map(x => x.value)
                .slice(0, arg.limit);
            const res = [];
            for (const value of values) {
                res.push(await arg.process(message, value));
            }
            return res;
        }
        const foundFlag = parsed.optionFlags.find(flag => names.some(name => name?.toLowerCase() === flag.key.toLowerCase()));
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
        return function* generate() {
            const res = {};
            for (const [id, arg] of args) {
                res[id] = yield arg;
            }
            return res;
        };
    }
}
exports.default = ArgumentRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnRSdW5uZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudFJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLDRFQUFvRDtBQUNwRCx1REFBMEQ7QUFHMUQsbURBQTJCO0FBQzNCLDBEQUF1RDtBQUV2RDs7O0dBR0c7QUFDSCxNQUFxQixjQUFjO0lBQ2xDLFlBQW1CLE9BQWdCO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU8sQ0FBVTtJQUV4Qjs7T0FFRztJQUNILElBQVcsTUFBTTtRQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILElBQVcsT0FBTztRQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBZ0IsRUFBRSxNQUEyQixFQUFFLFNBQTRCO1FBQzNGLE1BQU0sS0FBSyxHQUFHO1lBQ2IsV0FBVyxFQUFFLElBQUksR0FBRyxFQUFVO1lBQzlCLFdBQVcsRUFBRSxDQUFDO1lBQ2QsS0FBSyxFQUFFLENBQUM7U0FDUixDQUFDO1FBRUYsTUFBTSxXQUFXLEdBQUcsQ0FBQyxHQUEyQixFQUFFLEVBQUU7WUFDbkQsSUFBSSxjQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsRUFBRTtnQkFDNUIsR0FBVyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsR0FBRztxQkFDNUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7cUJBQ2xCLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7cUJBQ2YsSUFB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Q0YsQ0FBQztJQUVEOzs7T0FHRztJQUNJLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBVTtRQUN0QyxPQUFPLGNBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLGNBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJLGNBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQXdDO1FBQ25FLE9BQU8sUUFBUSxDQUFDLENBQUMsUUFBUTtZQUN4QixNQUFNLEdBQUcsR0FBMkIsRUFBRSxDQUFDO1lBQ3ZDLEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUU7Z0JBQzdCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQzthQUNwQjtZQUVELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQyxDQUFDO0lBQ0gsQ0FBQztDQUNEO0FBclpELGlDQXFaQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgeyBBcmd1bWVudE1hdGNoZXMgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBDb21tYW5kLCB7IEFyZ3VtZW50R2VuZXJhdG9yIH0gZnJvbSBcIi4uL0NvbW1hbmRcIjtcbmltcG9ydCB7IENvbnRlbnRQYXJzZXJSZXN1bHQgfSBmcm9tIFwiLi4vQ29udGVudFBhcnNlclwiO1xuaW1wb3J0IEZsYWcgZnJvbSBcIi4uL0ZsYWdcIjtcbmltcG9ydCBBcmd1bWVudCwgeyBBcmd1bWVudE9wdGlvbnMgfSBmcm9tIFwiLi9Bcmd1bWVudFwiO1xuXG4vKipcbiAqIFJ1bnMgYXJndW1lbnRzLlxuICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIHRvIHJ1biBmb3IuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFyZ3VtZW50UnVubmVyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKGNvbW1hbmQ6IENvbW1hbmQpIHtcblx0XHR0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIHRoZSBhcmd1bWVudHMgYXJlIGJlaW5nIHJ1biBmb3Jcblx0ICovXG5cdHB1YmxpYyBjb21tYW5kOiBDb21tYW5kO1xuXG5cdC8qKlxuXHQgKiBUaGUgQWthaXJvIGNsaWVudC5cblx0ICovXG5cdHB1YmxpYyBnZXQgY2xpZW50KCkge1xuXHRcdHJldHVybiB0aGlzLmNvbW1hbmQuY2xpZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIGhhbmRsZXIuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGhhbmRsZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29tbWFuZC5oYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgdGhlIGFyZ3VtZW50cy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gZ2VuZXJhdG9yIC0gQXJndW1lbnQgZ2VuZXJhdG9yLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1bihtZXNzYWdlOiBNZXNzYWdlLCBwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsIGdlbmVyYXRvcjogQXJndW1lbnRHZW5lcmF0b3IpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBzdGF0ZSA9IHtcblx0XHRcdHVzZWRJbmRpY2VzOiBuZXcgU2V0PG51bWJlcj4oKSxcblx0XHRcdHBocmFzZUluZGV4OiAwLFxuXHRcdFx0aW5kZXg6IDBcblx0XHR9O1xuXG5cdFx0Y29uc3QgYXVnbWVudFJlc3QgPSAodmFsOiBGbGFnIHwgQXJndW1lbnRPcHRpb25zKSA9PiB7XG5cdFx0XHRpZiAoRmxhZy5pcyh2YWwsIFwiY29udGludWVcIikpIHtcblx0XHRcdFx0KHZhbCBhcyBhbnkpLnJlc3QgPSBwYXJzZWQuYWxsXG5cdFx0XHRcdFx0LnNsaWNlKHN0YXRlLmluZGV4KVxuXHRcdFx0XHRcdC5tYXAoeCA9PiB4LnJhdylcblx0XHRcdFx0XHQuam9pbihcIlwiKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3QgaXRlciA9IGdlbmVyYXRvcihtZXNzYWdlLCBwYXJzZWQsIHN0YXRlKTtcblx0XHRsZXQgY3VyciA9IGF3YWl0IGl0ZXIubmV4dCgpO1xuXHRcdHdoaWxlICghY3Vyci5kb25lKSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IGN1cnIudmFsdWU7XG5cdFx0XHRpZiAoQXJndW1lbnRSdW5uZXIuaXNTaG9ydENpcmN1aXQodmFsdWUpKSB7XG5cdFx0XHRcdGF1Z21lbnRSZXN0KHZhbHVlKTtcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCByZXMgPSBhd2FpdCB0aGlzLnJ1bk9uZShtZXNzYWdlLCBwYXJzZWQsIHN0YXRlLCBuZXcgQXJndW1lbnQodGhpcy5jb21tYW5kLCB2YWx1ZSkpO1xuXHRcdFx0aWYgKEFyZ3VtZW50UnVubmVyLmlzU2hvcnRDaXJjdWl0KHJlcykpIHtcblx0XHRcdFx0YXVnbWVudFJlc3QocmVzKTtcblx0XHRcdFx0cmV0dXJuIHJlcztcblx0XHRcdH1cblxuXHRcdFx0Y3VyciA9IGF3YWl0IGl0ZXIubmV4dChyZXMpO1xuXHRcdH1cblxuXHRcdGF1Z21lbnRSZXN0KGN1cnIudmFsdWUpO1xuXHRcdHJldHVybiBjdXJyLnZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgb25lIGFyZ3VtZW50LlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSBzdGF0ZSAtIEFyZ3VtZW50IGhhbmRsaW5nIHN0YXRlLlxuXHQgKiBAcGFyYW0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICovXG5cdHB1YmxpYyBydW5PbmUoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0c3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsXG5cdFx0YXJnOiBBcmd1bWVudFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBjYXNlcyA9IHtcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuUEhSQVNFXTogdGhpcy5ydW5QaHJhc2UsXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLkZMQUddOiB0aGlzLnJ1bkZsYWcsXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLk9QVElPTl06IHRoaXMucnVuT3B0aW9uLFxuXHRcdFx0W0FyZ3VtZW50TWF0Y2hlcy5SRVNUXTogdGhpcy5ydW5SZXN0LFxuXHRcdFx0W0FyZ3VtZW50TWF0Y2hlcy5TRVBBUkFURV06IHRoaXMucnVuU2VwYXJhdGUsXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLlRFWFRdOiB0aGlzLnJ1blRleHQsXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLkNPTlRFTlRdOiB0aGlzLnJ1bkNvbnRlbnQsXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLlJFU1RfQ09OVEVOVF06IHRoaXMucnVuUmVzdENvbnRlbnQsXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLk5PTkVdOiB0aGlzLnJ1bk5vbmVcblx0XHR9O1xuXG5cdFx0Y29uc3QgcnVuRm4gPSBjYXNlc1thcmcubWF0Y2hdO1xuXHRcdGlmIChydW5GbiA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgQWthaXJvRXJyb3IoXCJVTktOT1dOX01BVENIX1RZUEVcIiwgYXJnLm1hdGNoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcnVuRm4uY2FsbCh0aGlzLCBtZXNzYWdlLCBwYXJzZWQsIHN0YXRlLCBhcmcpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYHBocmFzZWAgbWF0Y2guXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBhcnNlZCAtIFBhcnNlZCBkYXRhIGZyb20gQ29udGVudFBhcnNlci5cblx0ICogQHBhcmFtIHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSBhcmcgLSBDdXJyZW50IGFyZ3VtZW50LlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1blBocmFzZShcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGlmIChhcmcudW5vcmRlcmVkIHx8IGFyZy51bm9yZGVyZWQgPT09IDApIHtcblx0XHRcdGNvbnN0IGluZGljZXMgPVxuXHRcdFx0XHR0eXBlb2YgYXJnLnVub3JkZXJlZCA9PT0gXCJudW1iZXJcIlxuXHRcdFx0XHRcdD8gQXJyYXkuZnJvbShwYXJzZWQucGhyYXNlcy5rZXlzKCkpLnNsaWNlKGFyZy51bm9yZGVyZWQpXG5cdFx0XHRcdFx0OiBBcnJheS5pc0FycmF5KGFyZy51bm9yZGVyZWQpXG5cdFx0XHRcdFx0PyBhcmcudW5vcmRlcmVkXG5cdFx0XHRcdFx0OiBBcnJheS5mcm9tKHBhcnNlZC5waHJhc2VzLmtleXMoKSk7XG5cblx0XHRcdGZvciAoY29uc3QgaSBvZiBpbmRpY2VzKSB7XG5cdFx0XHRcdGlmIChzdGF0ZS51c2VkSW5kaWNlcy5oYXMoaSkpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHBocmFzZSA9IHBhcnNlZC5waHJhc2VzW2ldID8gcGFyc2VkLnBocmFzZXNbaV0udmFsdWUgOiBcIlwiO1xuXHRcdFx0XHQvLyBgY2FzdGAgaXMgdXNlZCBpbnN0ZWFkIG9mIGBwcm9jZXNzYCBzaW5jZSB3ZSBkbyBub3Qgd2FudCBwcm9tcHRzLlxuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBhcmcuY2FzdChtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0XHRpZiAocmVzICE9IG51bGwpIHtcblx0XHRcdFx0XHRzdGF0ZS51c2VkSW5kaWNlcy5hZGQoaSk7XG5cdFx0XHRcdFx0cmV0dXJuIHJlcztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBObyBpbmRpY2VzIG1hdGNoZWQuXG5cdFx0XHRyZXR1cm4gYXJnLnByb2Nlc3MobWVzc2FnZSwgXCJcIik7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5kZXggPSBhcmcuaW5kZXggPT0gbnVsbCA/IHN0YXRlLnBocmFzZUluZGV4IDogYXJnLmluZGV4O1xuXHRcdGNvbnN0IHJldCA9IGFyZy5wcm9jZXNzKG1lc3NhZ2UsIHBhcnNlZC5waHJhc2VzW2luZGV4XSA/IHBhcnNlZC5waHJhc2VzW2luZGV4XS52YWx1ZSA6IFwiXCIpO1xuXHRcdGlmIChhcmcuaW5kZXggPT0gbnVsbCkge1xuXHRcdFx0QXJndW1lbnRSdW5uZXIuaW5jcmVhc2VJbmRleChwYXJzZWQsIHN0YXRlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYHJlc3RgIG1hdGNoLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSBzdGF0ZSAtIEFyZ3VtZW50IGhhbmRsaW5nIHN0YXRlLlxuXHQgKiBAcGFyYW0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW5SZXN0KFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdGFyZzogQXJndW1lbnRcblx0KTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgaW5kZXggPSBhcmcuaW5kZXggPT0gbnVsbCA/IHN0YXRlLnBocmFzZUluZGV4IDogYXJnLmluZGV4O1xuXHRcdGNvbnN0IHJlc3QgPSBwYXJzZWQucGhyYXNlc1xuXHRcdFx0LnNsaWNlKGluZGV4LCBpbmRleCArIGFyZy5saW1pdClcblx0XHRcdC5tYXAoeCA9PiB4LnJhdylcblx0XHRcdC5qb2luKFwiXCIpXG5cdFx0XHQudHJpbSgpO1xuXHRcdGNvbnN0IHJldCA9IGF3YWl0IGFyZy5wcm9jZXNzKG1lc3NhZ2UsIHJlc3QpO1xuXHRcdGlmIChhcmcuaW5kZXggPT0gbnVsbCkge1xuXHRcdFx0QXJndW1lbnRSdW5uZXIuaW5jcmVhc2VJbmRleChwYXJzZWQsIHN0YXRlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYHNlcGFyYXRlYCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuU2VwYXJhdGUoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0c3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsXG5cdFx0YXJnOiBBcmd1bWVudFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBpbmRleCA9IGFyZy5pbmRleCA9PSBudWxsID8gc3RhdGUucGhyYXNlSW5kZXggOiBhcmcuaW5kZXg7XG5cdFx0Y29uc3QgcGhyYXNlcyA9IHBhcnNlZC5waHJhc2VzLnNsaWNlKGluZGV4LCBpbmRleCArIGFyZy5saW1pdCk7XG5cdFx0aWYgKCFwaHJhc2VzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgcmV0ID0gYXdhaXQgYXJnLnByb2Nlc3MobWVzc2FnZSwgXCJcIik7XG5cdFx0XHRpZiAoYXJnLmluZGV4ICE9IG51bGwpIHtcblx0XHRcdFx0QXJndW1lbnRSdW5uZXIuaW5jcmVhc2VJbmRleChwYXJzZWQsIHN0YXRlKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9XG5cblx0XHRjb25zdCByZXMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IHBocmFzZSBvZiBwaHJhc2VzKSB7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFyZy5wcm9jZXNzKG1lc3NhZ2UsIHBocmFzZS52YWx1ZSk7XG5cblx0XHRcdGlmIChGbGFnLmlzKHJlc3BvbnNlLCBcImNhbmNlbFwiKSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2U7XG5cdFx0XHR9XG5cblx0XHRcdHJlcy5wdXNoKHJlc3BvbnNlKTtcblx0XHR9XG5cblx0XHRpZiAoYXJnLmluZGV4ICE9IG51bGwpIHtcblx0XHRcdEFyZ3VtZW50UnVubmVyLmluY3JlYXNlSW5kZXgocGFyc2VkLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGBmbGFnYCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgcnVuRmxhZyhcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZz4gfCBhbnkge1xuXHRcdGNvbnN0IG5hbWVzID0gQXJyYXkuaXNBcnJheShhcmcuZmxhZykgPyBhcmcuZmxhZyA6IFthcmcuZmxhZ107XG5cdFx0aWYgKGFyZy5tdWx0aXBsZUZsYWdzKSB7XG5cdFx0XHRjb25zdCBhbW91bnQgPSBwYXJzZWQuZmxhZ3MuZmlsdGVyKGZsYWcgPT5cblx0XHRcdFx0bmFtZXMuc29tZShuYW1lID0+IG5hbWU/LnRvTG93ZXJDYXNlKCkgPT09IGZsYWcua2V5LnRvTG93ZXJDYXNlKCkpXG5cdFx0XHQpLmxlbmd0aDtcblxuXHRcdFx0cmV0dXJuIGFtb3VudDtcblx0XHR9XG5cblx0XHRjb25zdCBmbGFnRm91bmQgPSBwYXJzZWQuZmxhZ3Muc29tZShmbGFnID0+IG5hbWVzLnNvbWUobmFtZSA9PiBuYW1lPy50b0xvd2VyQ2FzZSgpID09PSBmbGFnLmtleS50b0xvd2VyQ2FzZSgpKSk7XG5cblx0XHRyZXR1cm4gYXJnLmRlZmF1bHQgPT0gbnVsbCA/IGZsYWdGb3VuZCA6ICFmbGFnRm91bmQ7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgb3B0aW9uYCBtYXRjaC5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcnVuT3B0aW9uKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdGFyZzogQXJndW1lbnRcblx0KTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgbmFtZXMgPSBBcnJheS5pc0FycmF5KGFyZy5mbGFnKSA/IGFyZy5mbGFnIDogW2FyZy5mbGFnXTtcblx0XHRpZiAoYXJnLm11bHRpcGxlRmxhZ3MpIHtcblx0XHRcdGNvbnN0IHZhbHVlcyA9IHBhcnNlZC5vcHRpb25GbGFnc1xuXHRcdFx0XHQuZmlsdGVyKGZsYWcgPT4gbmFtZXMuc29tZShuYW1lID0+IG5hbWU/LnRvTG93ZXJDYXNlKCkgPT09IGZsYWcua2V5LnRvTG93ZXJDYXNlKCkpKVxuXHRcdFx0XHQubWFwKHggPT4geC52YWx1ZSlcblx0XHRcdFx0LnNsaWNlKDAsIGFyZy5saW1pdCk7XG5cblx0XHRcdGNvbnN0IHJlcyA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcblx0XHRcdFx0cmVzLnB1c2goYXdhaXQgYXJnLnByb2Nlc3MobWVzc2FnZSwgdmFsdWUpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlcztcblx0XHR9XG5cblx0XHRjb25zdCBmb3VuZEZsYWcgPSBwYXJzZWQub3B0aW9uRmxhZ3MuZmluZChmbGFnID0+XG5cdFx0XHRuYW1lcy5zb21lKG5hbWUgPT4gbmFtZT8udG9Mb3dlckNhc2UoKSA9PT0gZmxhZy5rZXkudG9Mb3dlckNhc2UoKSlcblx0XHQpO1xuXG5cdFx0cmV0dXJuIGFyZy5wcm9jZXNzKG1lc3NhZ2UsIGZvdW5kRmxhZyAhPSBudWxsID8gZm91bmRGbGFnLnZhbHVlIDogXCJcIik7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgdGV4dGAgbWF0Y2guXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBhcnNlZCAtIFBhcnNlZCBkYXRhIGZyb20gQ29udGVudFBhcnNlci5cblx0ICogQHBhcmFtIHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSBhcmcgLSBDdXJyZW50IGFyZ3VtZW50LlxuXHQgKi9cblx0cHVibGljIHJ1blRleHQoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0c3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsXG5cdFx0YXJnOiBBcmd1bWVudFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBpbmRleCA9IGFyZy5pbmRleCA9PSBudWxsID8gMCA6IGFyZy5pbmRleDtcblx0XHRjb25zdCB0ZXh0ID0gcGFyc2VkLnBocmFzZXNcblx0XHRcdC5zbGljZShpbmRleCwgaW5kZXggKyBhcmcubGltaXQpXG5cdFx0XHQubWFwKHggPT4geC5yYXcpXG5cdFx0XHQuam9pbihcIlwiKVxuXHRcdFx0LnRyaW0oKTtcblx0XHRyZXR1cm4gYXJnLnByb2Nlc3MobWVzc2FnZSwgdGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgY29udGVudGAgbWF0Y2guXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBhcnNlZCAtIFBhcnNlZCBkYXRhIGZyb20gQ29udGVudFBhcnNlci5cblx0ICogQHBhcmFtIHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSBhcmcgLSBDdXJyZW50IGFyZ3VtZW50LlxuXHQgKi9cblx0cHVibGljIHJ1bkNvbnRlbnQoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0c3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsXG5cdFx0YXJnOiBBcmd1bWVudFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBpbmRleCA9IGFyZy5pbmRleCA9PSBudWxsID8gMCA6IGFyZy5pbmRleDtcblx0XHRjb25zdCBjb250ZW50ID0gcGFyc2VkLmFsbFxuXHRcdFx0LnNsaWNlKGluZGV4LCBpbmRleCArIGFyZy5saW1pdClcblx0XHRcdC5tYXAoeCA9PiB4LnJhdylcblx0XHRcdC5qb2luKFwiXCIpXG5cdFx0XHQudHJpbSgpO1xuXHRcdHJldHVybiBhcmcucHJvY2VzcyhtZXNzYWdlLCBjb250ZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGByZXN0Q29udGVudGAgbWF0Y2guXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBhcnNlZCAtIFBhcnNlZCBkYXRhIGZyb20gQ29udGVudFBhcnNlci5cblx0ICogQHBhcmFtIHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSBhcmcgLSBDdXJyZW50IGFyZ3VtZW50LlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJ1blJlc3RDb250ZW50KFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdGFyZzogQXJndW1lbnRcblx0KTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgaW5kZXggPSBhcmcuaW5kZXggPT0gbnVsbCA/IHN0YXRlLmluZGV4IDogYXJnLmluZGV4O1xuXHRcdGNvbnN0IHJlc3QgPSBwYXJzZWQuYWxsXG5cdFx0XHQuc2xpY2UoaW5kZXgsIGluZGV4ICsgYXJnLmxpbWl0KVxuXHRcdFx0Lm1hcCh4ID0+IHgucmF3KVxuXHRcdFx0LmpvaW4oXCJcIilcblx0XHRcdC50cmltKCk7XG5cdFx0Y29uc3QgcmV0ID0gYXdhaXQgYXJnLnByb2Nlc3MobWVzc2FnZSwgcmVzdCk7XG5cdFx0aWYgKGFyZy5pbmRleCA9PSBudWxsKSB7XG5cdFx0XHRBcmd1bWVudFJ1bm5lci5pbmNyZWFzZUluZGV4KHBhcnNlZCwgc3RhdGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgbm9uZWAgbWF0Y2guXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBhcnNlZCAtIFBhcnNlZCBkYXRhIGZyb20gQ29udGVudFBhcnNlci5cblx0ICogQHBhcmFtIHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSBhcmcgLSBDdXJyZW50IGFyZ3VtZW50LlxuXHQgKi9cblx0cHVibGljIHJ1bk5vbmUoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0c3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsXG5cdFx0YXJnOiBBcmd1bWVudFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRyZXR1cm4gYXJnLnByb2Nlc3MobWVzc2FnZSwgXCJcIik7XG5cdH1cblxuXHQvKipcblx0ICogTW9kaWZpZXMgc3RhdGUgYnkgaW5jcmVtZW50aW5nIHRoZSBpbmRpY2VzLlxuXHQgKiBAcGFyYW0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIG4gLSBOdW1iZXIgb2YgaW5kaWNlcyB0byBpbmNyZWFzZSBieS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaW5jcmVhc2VJbmRleChwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsIHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLCBuID0gMSk6IHZvaWQge1xuXHRcdHN0YXRlLnBocmFzZUluZGV4ICs9IG47XG5cdFx0d2hpbGUgKG4gPiAwKSB7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdHN0YXRlLmluZGV4Kys7XG5cdFx0XHR9IHdoaWxlIChwYXJzZWQuYWxsW3N0YXRlLmluZGV4XSAmJiBwYXJzZWQuYWxsW3N0YXRlLmluZGV4XS50eXBlICE9PSBcIlBocmFzZVwiKTtcblx0XHRcdG4tLTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHNvbWV0aGluZyBpcyBhIGZsYWcgdGhhdCBzaG9ydCBjaXJjdWl0cy5cblx0ICogQHBhcmFtIHZhbHVlIC0gQSB2YWx1ZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaXNTaG9ydENpcmN1aXQodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBGbGFnLmlzKHZhbHVlLCBcImNhbmNlbFwiKSB8fCBGbGFnLmlzKHZhbHVlLCBcInJldHJ5XCIpIHx8IEZsYWcuaXModmFsdWUsIFwiY29udGludWVcIik7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcmd1bWVudCBnZW5lcmF0b3IgZnJvbSBhcmd1bWVudCBvcHRpb25zLlxuXHQgKiBAcGFyYW0gYXJncyAtIEFyZ3VtZW50IG9wdGlvbnMuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGZyb21Bcmd1bWVudHMoYXJnczogW2lkOiBzdHJpbmcsIGFyZ3VtZW50OiBBcmd1bWVudF1bXSkge1xuXHRcdHJldHVybiBmdW5jdGlvbiogZ2VuZXJhdGUoKTogR2VuZXJhdG9yPEFyZ3VtZW50LCB7IFt4OiBzdHJpbmddOiBhbnkgfSwgQXJndW1lbnQ+IHtcblx0XHRcdGNvbnN0IHJlczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuXHRcdFx0Zm9yIChjb25zdCBbaWQsIGFyZ10gb2YgYXJncykge1xuXHRcdFx0XHRyZXNbaWRdID0geWllbGQgYXJnO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH07XG5cdH1cbn1cblxuLyoqXG4gKiBTdGF0ZSBmb3IgdGhlIGFyZ3VtZW50IHJ1bm5lci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFJ1bm5lclN0YXRlIHtcblx0LyoqIEluZGV4IGluIHRlcm1zIG9mIHRoZSByYXcgc3RyaW5ncy4gKi9cblx0aW5kZXg6IG51bWJlcjtcblxuXHQvKiogSW5kZXggaW4gdGVybXMgb2YgcGhyYXNlcy4gKi9cblx0cGhyYXNlSW5kZXg6IG51bWJlcjtcblxuXHQvKiogSW5kaWNlcyBhbHJlYWR5IHVzZWQgZm9yIHVub3JkZXJlZCBtYXRjaC4gKi9cblx0dXNlZEluZGljZXM6IFNldDxudW1iZXI+O1xufVxuIl19