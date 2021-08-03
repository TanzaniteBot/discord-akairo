"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AkairoError_1 = __importDefault(require("../../../util/AkairoError"));
const Argument_1 = __importDefault(require("./Argument"));
const Constants_1 = require("../../../util/Constants");
const Flag_1 = __importDefault(require("../Flag"));
/**
 * Runs arguments.
 * @param {Command} command - Command to run for.
 * @private
 */
class ArgumentRunner {
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
    constructor(command) {
        this.command = command;
    }
    /**
     * Runs the arguments.
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentGenerator} generator - Argument generator.
     * @returns {Promise<Flag|any>}
     */
    async run(message, parsed, generator) {
        const state = {
            usedIndices: new Set(),
            phraseIndex: 0,
            index: 0
        };
        const augmentRest = val => {
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
     * @param {Message} message - Message that triggered the command.
     * @param {ContentParserResult} parsed - Parsed data from ContentParser.
     * @param {ArgumentRunnerState} state - Argument handling state.
     * @param {Argument} arg - Current argument.
     * @returns {Promise<Flag|any>}
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
            } while (parsed.all[state.index] &&
                parsed.all[state.index].type !== "Phrase");
            n--;
        }
    }
    /**
     * Checks if something is a flag that short circuits.
     * @param {any} value - A value.
     * @returns {boolean}
     */
    static isShortCircuit(value) {
        return (Flag_1.default.is(value, "cancel") ||
            Flag_1.default.is(value, "retry") ||
            Flag_1.default.is(value, "continue"));
    }
    /**
     * Creates an argument generator from argument options.
     * @param {ArgumentOptions[]} args - Argument options.
     * @returns {GeneratorFunction}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnRSdW5uZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudFJ1bm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRFQUFvRDtBQUNwRCwwREFBdUQ7QUFDdkQsdURBQTBEO0FBQzFELG1EQUEyQjtBQUszQjs7OztHQUlHO0FBQ0gsTUFBcUIsY0FBYztJQUNsQzs7T0FFRztJQUNJLE9BQU8sQ0FBVTtJQUV4Qjs7T0FFRztJQUNILElBQVcsTUFBTTtRQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILElBQVcsT0FBTztRQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQzdCLENBQUM7SUFFRCxZQUFtQixPQUFnQjtRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksS0FBSyxDQUFDLEdBQUcsQ0FDZixPQUFnQixFQUNoQixNQUEyQixFQUMzQixTQUE0QjtRQUU1QixNQUFNLEtBQUssR0FBRztZQUNiLFdBQVcsRUFBRSxJQUFJLEdBQUcsRUFBVTtZQUM5QixXQUFXLEVBQUUsQ0FBQztZQUNkLEtBQUssRUFBRSxDQUFDO1NBQ1IsQ0FBQztRQUVGLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ3pCLElBQUksY0FBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEVBQUU7Z0JBQzdCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUc7cUJBQ25CLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO3FCQUNsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO3FCQUNmLElBQUksQ0FB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QUM7YUFDZCxRQUNBLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFDdkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFDeEM7WUFDRixDQUFDLEVBQUUsQ0FBQztTQUNKO0lBQ0YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQVU7UUFDL0IsT0FBTyxDQUNOLGNBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztZQUN4QixjQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUM7WUFDdkIsY0FBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQzFCLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBdUI7UUFDM0MsbUJBQW1CO1FBQ25CLE9BQU8sUUFBUSxDQUFDLENBQUMsUUFBUTtZQUN4QixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDZixtQkFBbUI7WUFDbkIsS0FBSyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRTtnQkFDN0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDO2FBQ3BCO1lBRUQsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDLENBQUM7SUFDSCxDQUFDO0NBQ0Q7QUExY0QsaUNBMGNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFrYWlyb0Vycm9yIGZyb20gXCIuLi8uLi8uLi91dGlsL0FrYWlyb0Vycm9yXCI7XG5pbXBvcnQgQXJndW1lbnQsIHsgQXJndW1lbnRPcHRpb25zIH0gZnJvbSBcIi4vQXJndW1lbnRcIjtcbmltcG9ydCB7IEFyZ3VtZW50TWF0Y2hlcyB9IGZyb20gXCIuLi8uLi8uLi91dGlsL0NvbnN0YW50c1wiO1xuaW1wb3J0IEZsYWcgZnJvbSBcIi4uL0ZsYWdcIjtcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IENvbW1hbmQsIHsgQXJndW1lbnRHZW5lcmF0b3IgfSBmcm9tIFwiLi4vQ29tbWFuZFwiO1xuaW1wb3J0IHsgQ29udGVudFBhcnNlclJlc3VsdCB9IGZyb20gXCIuLi9Db250ZW50UGFyc2VyXCI7XG5cbi8qKlxuICogUnVucyBhcmd1bWVudHMuXG4gKiBAcGFyYW0ge0NvbW1hbmR9IGNvbW1hbmQgLSBDb21tYW5kIHRvIHJ1biBmb3IuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmd1bWVudFJ1bm5lciB7XG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCB0aGUgYXJndW1lbnRzIGFyZSBiZWluZyBydW4gZm9yXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZDogQ29tbWFuZDtcblxuXHQvKipcblx0ICogVGhlIEFrYWlybyBjbGllbnQuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IGNsaWVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy5jb21tYW5kLmNsaWVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBoYW5kbGVyLlxuXHQgKi9cblx0cHVibGljIGdldCBoYW5kbGVyKCkge1xuXHRcdHJldHVybiB0aGlzLmNvbW1hbmQuaGFuZGxlcjtcblx0fVxuXG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihjb21tYW5kOiBDb21tYW5kKSB7XG5cdFx0dGhpcy5jb21tYW5kID0gY29tbWFuZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIHRoZSBhcmd1bWVudHMuXG5cdCAqIEBwYXJhbSB7TWVzc2FnZX0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB7Q29udGVudFBhcnNlclJlc3VsdH0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0ge0FyZ3VtZW50R2VuZXJhdG9yfSBnZW5lcmF0b3IgLSBBcmd1bWVudCBnZW5lcmF0b3IuXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPEZsYWd8YW55Pn1cblx0ICovXG5cdHB1YmxpYyBhc3luYyBydW4oXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0Z2VuZXJhdG9yOiBBcmd1bWVudEdlbmVyYXRvclxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBzdGF0ZSA9IHtcblx0XHRcdHVzZWRJbmRpY2VzOiBuZXcgU2V0PG51bWJlcj4oKSxcblx0XHRcdHBocmFzZUluZGV4OiAwLFxuXHRcdFx0aW5kZXg6IDBcblx0XHR9O1xuXG5cdFx0Y29uc3QgYXVnbWVudFJlc3QgPSB2YWwgPT4ge1xuXHRcdFx0aWYgKEZsYWcuaXModmFsLCBcImNvbnRpbnVlXCIpKSB7XG5cdFx0XHRcdHZhbC5yZXN0ID0gcGFyc2VkLmFsbFxuXHRcdFx0XHRcdC5zbGljZShzdGF0ZS5pbmRleClcblx0XHRcdFx0XHQubWFwKHggPT4geC5yYXcpXG5cdFx0XHRcdFx0LmpvaW4oXCJcIik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGNvbnN0IGl0ZXIgPSBnZW5lcmF0b3IobWVzc2FnZSwgcGFyc2VkLCBzdGF0ZSk7XG5cdFx0bGV0IGN1cnIgPSBhd2FpdCBpdGVyLm5leHQoKTtcblx0XHR3aGlsZSAoIWN1cnIuZG9uZSkge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBjdXJyLnZhbHVlO1xuXHRcdFx0aWYgKEFyZ3VtZW50UnVubmVyLmlzU2hvcnRDaXJjdWl0KHZhbHVlKSkge1xuXHRcdFx0XHRhdWdtZW50UmVzdCh2YWx1ZSk7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgdGhpcy5ydW5PbmUoXG5cdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdHBhcnNlZCxcblx0XHRcdFx0c3RhdGUsXG5cdFx0XHRcdG5ldyBBcmd1bWVudCh0aGlzLmNvbW1hbmQsIHZhbHVlKVxuXHRcdFx0KTtcblx0XHRcdGlmIChBcmd1bWVudFJ1bm5lci5pc1Nob3J0Q2lyY3VpdChyZXMpKSB7XG5cdFx0XHRcdGF1Z21lbnRSZXN0KHJlcyk7XG5cdFx0XHRcdHJldHVybiByZXM7XG5cdFx0XHR9XG5cblx0XHRcdGN1cnIgPSBhd2FpdCBpdGVyLm5leHQocmVzKTtcblx0XHR9XG5cblx0XHRhdWdtZW50UmVzdChjdXJyLnZhbHVlKTtcblx0XHRyZXR1cm4gY3Vyci52YWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIG9uZSBhcmd1bWVudC5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtDb250ZW50UGFyc2VyUmVzdWx0fSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRSdW5uZXJTdGF0ZX0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIHtBcmd1bWVudH0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICogQHJldHVybnMge1Byb21pc2U8RmxhZ3xhbnk+fVxuXHQgKi9cblx0cHVibGljIHJ1bk9uZShcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IGNhc2VzID0ge1xuXHRcdFx0W0FyZ3VtZW50TWF0Y2hlcy5QSFJBU0VdOiB0aGlzLnJ1blBocmFzZSxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuRkxBR106IHRoaXMucnVuRmxhZyxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuT1BUSU9OXTogdGhpcy5ydW5PcHRpb24sXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLlJFU1RdOiB0aGlzLnJ1blJlc3QsXG5cdFx0XHRbQXJndW1lbnRNYXRjaGVzLlNFUEFSQVRFXTogdGhpcy5ydW5TZXBhcmF0ZSxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuVEVYVF06IHRoaXMucnVuVGV4dCxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuQ09OVEVOVF06IHRoaXMucnVuQ29udGVudCxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuUkVTVF9DT05URU5UXTogdGhpcy5ydW5SZXN0Q29udGVudCxcblx0XHRcdFtBcmd1bWVudE1hdGNoZXMuTk9ORV06IHRoaXMucnVuTm9uZVxuXHRcdH07XG5cblx0XHRjb25zdCBydW5GbiA9IGNhc2VzW2FyZy5tYXRjaF07XG5cdFx0aWYgKHJ1bkZuID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBBa2Fpcm9FcnJvcihcIlVOS05PV05fTUFUQ0hfVFlQRVwiLCBhcmcubWF0Y2gpO1xuXHRcdH1cblxuXHRcdHJldHVybiBydW5Gbi5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBhcnNlZCwgc3RhdGUsIGFyZyk7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgcGhyYXNlYCBtYXRjaC5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtDb250ZW50UGFyc2VyUmVzdWx0fSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRSdW5uZXJTdGF0ZX0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIHtBcmd1bWVudH0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICogQHJldHVybnMge1Byb21pc2U8RmxhZ3xhbnk+fVxuXHQgKi9cblx0YXN5bmMgcnVuUGhyYXNlKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdGFyZzogQXJndW1lbnRcblx0KTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0aWYgKGFyZy51bm9yZGVyZWQgfHwgYXJnLnVub3JkZXJlZCA9PT0gMCkge1xuXHRcdFx0Y29uc3QgaW5kaWNlcyA9XG5cdFx0XHRcdHR5cGVvZiBhcmcudW5vcmRlcmVkID09PSBcIm51bWJlclwiXG5cdFx0XHRcdFx0PyBBcnJheS5mcm9tKHBhcnNlZC5waHJhc2VzLmtleXMoKSkuc2xpY2UoYXJnLnVub3JkZXJlZClcblx0XHRcdFx0XHQ6IEFycmF5LmlzQXJyYXkoYXJnLnVub3JkZXJlZClcblx0XHRcdFx0XHQ/IGFyZy51bm9yZGVyZWRcblx0XHRcdFx0XHQ6IEFycmF5LmZyb20ocGFyc2VkLnBocmFzZXMua2V5cygpKTtcblxuXHRcdFx0Zm9yIChjb25zdCBpIG9mIGluZGljZXMpIHtcblx0XHRcdFx0aWYgKHN0YXRlLnVzZWRJbmRpY2VzLmhhcyhpKSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0XHRjb25zdCBwaHJhc2UgPSBwYXJzZWQucGhyYXNlc1tpXSA/IHBhcnNlZC5waHJhc2VzW2ldLnZhbHVlIDogXCJcIjtcblx0XHRcdFx0Ly8gYGNhc3RgIGlzIHVzZWQgaW5zdGVhZCBvZiBgcHJvY2Vzc2Agc2luY2Ugd2UgZG8gbm90IHdhbnQgcHJvbXB0cy5cblx0XHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgYXJnLmNhc3QobWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdFx0aWYgKHJlcyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0c3RhdGUudXNlZEluZGljZXMuYWRkKGkpO1xuXHRcdFx0XHRcdHJldHVybiByZXM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gTm8gaW5kaWNlcyBtYXRjaGVkLlxuXHRcdFx0cmV0dXJuIGFyZy5wcm9jZXNzKG1lc3NhZ2UsIFwiXCIpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGluZGV4ID0gYXJnLmluZGV4ID09IG51bGwgPyBzdGF0ZS5waHJhc2VJbmRleCA6IGFyZy5pbmRleDtcblx0XHRjb25zdCByZXQgPSBhcmcucHJvY2Vzcyhcblx0XHRcdG1lc3NhZ2UsXG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRwYXJzZWQucGhyYXNlc1tpbmRleF0gPyBwYXJzZWQucGhyYXNlc1tpbmRleF0udmFsdWUgOiBcIlwiXG5cdFx0KTtcblx0XHRpZiAoYXJnLmluZGV4ID09IG51bGwpIHtcblx0XHRcdEFyZ3VtZW50UnVubmVyLmluY3JlYXNlSW5kZXgocGFyc2VkLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGByZXN0YCBtYXRjaC5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtDb250ZW50UGFyc2VyUmVzdWx0fSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRSdW5uZXJTdGF0ZX0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIHtBcmd1bWVudH0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICogQHJldHVybnMge1Byb21pc2U8RmxhZ3xhbnk+fVxuXHQgKi9cblx0YXN5bmMgcnVuUmVzdChcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IGluZGV4ID0gYXJnLmluZGV4ID09IG51bGwgPyBzdGF0ZS5waHJhc2VJbmRleCA6IGFyZy5pbmRleDtcblx0XHRjb25zdCByZXN0ID0gcGFyc2VkLnBocmFzZXNcblx0XHRcdC5zbGljZShpbmRleCwgaW5kZXggKyBhcmcubGltaXQpXG5cdFx0XHQubWFwKHggPT4geC5yYXcpXG5cdFx0XHQuam9pbihcIlwiKVxuXHRcdFx0LnRyaW0oKTtcblx0XHRjb25zdCByZXQgPSBhd2FpdCBhcmcucHJvY2VzcyhtZXNzYWdlLCByZXN0KTtcblx0XHRpZiAoYXJnLmluZGV4ID09IG51bGwpIHtcblx0XHRcdEFyZ3VtZW50UnVubmVyLmluY3JlYXNlSW5kZXgocGFyc2VkLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGBzZXBhcmF0ZWAgbWF0Y2guXG5cdCAqIEBwYXJhbSB7TWVzc2FnZX0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB7Q29udGVudFBhcnNlclJlc3VsdH0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0ge0FyZ3VtZW50UnVubmVyU3RhdGV9IHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnR9IGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPEZsYWd8YW55Pn1cblx0ICovXG5cdGFzeW5jIHJ1blNlcGFyYXRlKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdGFyZzogQXJndW1lbnRcblx0KTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgaW5kZXggPSBhcmcuaW5kZXggPT0gbnVsbCA/IHN0YXRlLnBocmFzZUluZGV4IDogYXJnLmluZGV4O1xuXHRcdGNvbnN0IHBocmFzZXMgPSBwYXJzZWQucGhyYXNlcy5zbGljZShpbmRleCwgaW5kZXggKyBhcmcubGltaXQpO1xuXHRcdGlmICghcGhyYXNlcy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHJldCA9IGF3YWl0IGFyZy5wcm9jZXNzKG1lc3NhZ2UsIFwiXCIpO1xuXHRcdFx0aWYgKGFyZy5pbmRleCAhPSBudWxsKSB7XG5cdFx0XHRcdEFyZ3VtZW50UnVubmVyLmluY3JlYXNlSW5kZXgocGFyc2VkLCBzdGF0ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzID0gW107XG5cdFx0Zm9yIChjb25zdCBwaHJhc2Ugb2YgcGhyYXNlcykge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcmcucHJvY2VzcyhtZXNzYWdlLCBwaHJhc2UudmFsdWUpO1xuXG5cdFx0XHRpZiAoRmxhZy5pcyhyZXNwb25zZSwgXCJjYW5jZWxcIikpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXMucHVzaChyZXNwb25zZSk7XG5cdFx0fVxuXG5cdFx0aWYgKGFyZy5pbmRleCAhPSBudWxsKSB7XG5cdFx0XHRBcmd1bWVudFJ1bm5lci5pbmNyZWFzZUluZGV4KHBhcnNlZCwgc3RhdGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgZmxhZ2AgbWF0Y2guXG5cdCAqIEBwYXJhbSB7TWVzc2FnZX0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSB7Q29udGVudFBhcnNlclJlc3VsdH0gcGFyc2VkIC0gUGFyc2VkIGRhdGEgZnJvbSBDb250ZW50UGFyc2VyLlxuXHQgKiBAcGFyYW0ge0FyZ3VtZW50UnVubmVyU3RhdGV9IHN0YXRlIC0gQXJndW1lbnQgaGFuZGxpbmcgc3RhdGUuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnR9IGFyZyAtIEN1cnJlbnQgYXJndW1lbnQuXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPEZsYWd8YW55Pn1cblx0ICovXG5cdHJ1bkZsYWcoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0c3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsXG5cdFx0YXJnOiBBcmd1bWVudFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBuYW1lcyA9IEFycmF5LmlzQXJyYXkoYXJnLmZsYWcpID8gYXJnLmZsYWcgOiBbYXJnLmZsYWddO1xuXHRcdGlmIChhcmcubXVsdGlwbGVGbGFncykge1xuXHRcdFx0Y29uc3QgYW1vdW50ID0gcGFyc2VkLmZsYWdzLmZpbHRlcihmbGFnID0+XG5cdFx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdFx0bmFtZXMuc29tZShuYW1lID0+IG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gZmxhZy5rZXkudG9Mb3dlckNhc2UoKSlcblx0XHRcdCkubGVuZ3RoO1xuXG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRyZXR1cm4gYW1vdW50O1xuXHRcdH1cblxuXHRcdGNvbnN0IGZsYWdGb3VuZCA9IHBhcnNlZC5mbGFncy5zb21lKGZsYWcgPT5cblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5hbWVzLnNvbWUobmFtZSA9PiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09IGZsYWcua2V5LnRvTG93ZXJDYXNlKCkpXG5cdFx0KTtcblxuXHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRyZXR1cm4gYXJnLmRlZmF1bHQgPT0gbnVsbCA/IGZsYWdGb3VuZCA6ICFmbGFnRm91bmQ7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBgb3B0aW9uYCBtYXRjaC5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtDb250ZW50UGFyc2VyUmVzdWx0fSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRSdW5uZXJTdGF0ZX0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIHtBcmd1bWVudH0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICogQHJldHVybnMge1Byb21pc2U8RmxhZ3xhbnk+fVxuXHQgKi9cblx0YXN5bmMgcnVuT3B0aW9uKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdGFyZzogQXJndW1lbnRcblx0KTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgbmFtZXMgPSBBcnJheS5pc0FycmF5KGFyZy5mbGFnKSA/IGFyZy5mbGFnIDogW2FyZy5mbGFnXTtcblx0XHRpZiAoYXJnLm11bHRpcGxlRmxhZ3MpIHtcblx0XHRcdGNvbnN0IHZhbHVlcyA9IHBhcnNlZC5vcHRpb25GbGFnc1xuXHRcdFx0XHQuZmlsdGVyKGZsYWcgPT5cblx0XHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdFx0bmFtZXMuc29tZShuYW1lID0+IG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gZmxhZy5rZXkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0KVxuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHRcdC5tYXAoeCA9PiB4LnZhbHVlKVxuXHRcdFx0XHQuc2xpY2UoMCwgYXJnLmxpbWl0KTtcblxuXHRcdFx0Y29uc3QgcmVzID0gW107XG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuXHRcdFx0XHRyZXMucHVzaChhd2FpdCBhcmcucHJvY2VzcyhtZXNzYWdlLCB2YWx1ZSkpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZvdW5kRmxhZyA9IHBhcnNlZC5vcHRpb25GbGFncy5maW5kKGZsYWcgPT5cblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdG5hbWVzLnNvbWUobmFtZSA9PiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09IGZsYWcua2V5LnRvTG93ZXJDYXNlKCkpXG5cdFx0KTtcblxuXHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRyZXR1cm4gYXJnLnByb2Nlc3MobWVzc2FnZSwgZm91bmRGbGFnICE9IG51bGwgPyBmb3VuZEZsYWcudmFsdWUgOiBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGB0ZXh0YCBtYXRjaC5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtDb250ZW50UGFyc2VyUmVzdWx0fSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRSdW5uZXJTdGF0ZX0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIHtBcmd1bWVudH0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICogQHJldHVybnMge1Byb21pc2U8RmxhZ3xhbnk+fVxuXHQgKi9cblx0cnVuVGV4dChcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IGluZGV4ID0gYXJnLmluZGV4ID09IG51bGwgPyAwIDogYXJnLmluZGV4O1xuXHRcdGNvbnN0IHRleHQgPSBwYXJzZWQucGhyYXNlc1xuXHRcdFx0LnNsaWNlKGluZGV4LCBpbmRleCArIGFyZy5saW1pdClcblx0XHRcdC5tYXAoeCA9PiB4LnJhdylcblx0XHRcdC5qb2luKFwiXCIpXG5cdFx0XHQudHJpbSgpO1xuXHRcdHJldHVybiBhcmcucHJvY2VzcyhtZXNzYWdlLCB0ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGBjb250ZW50YCBtYXRjaC5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtDb250ZW50UGFyc2VyUmVzdWx0fSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRSdW5uZXJTdGF0ZX0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIHtBcmd1bWVudH0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICogQHJldHVybnMge1Byb21pc2U8RmxhZ3xhbnk+fVxuXHQgKi9cblx0cnVuQ29udGVudChcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IGluZGV4ID0gYXJnLmluZGV4ID09IG51bGwgPyAwIDogYXJnLmluZGV4O1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBwYXJzZWQuYWxsXG5cdFx0XHQuc2xpY2UoaW5kZXgsIGluZGV4ICsgYXJnLmxpbWl0KVxuXHRcdFx0Lm1hcCh4ID0+IHgucmF3KVxuXHRcdFx0LmpvaW4oXCJcIilcblx0XHRcdC50cmltKCk7XG5cdFx0cmV0dXJuIGFyZy5wcm9jZXNzKG1lc3NhZ2UsIGNvbnRlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYHJlc3RDb250ZW50YCBtYXRjaC5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtDb250ZW50UGFyc2VyUmVzdWx0fSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRSdW5uZXJTdGF0ZX0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIHtBcmd1bWVudH0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICogQHJldHVybnMge1Byb21pc2U8RmxhZ3xhbnk+fVxuXHQgKi9cblx0YXN5bmMgcnVuUmVzdENvbnRlbnQoXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwYXJzZWQ6IENvbnRlbnRQYXJzZXJSZXN1bHQsXG5cdFx0c3RhdGU6IEFyZ3VtZW50UnVubmVyU3RhdGUsXG5cdFx0YXJnOiBBcmd1bWVudFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBpbmRleCA9IGFyZy5pbmRleCA9PSBudWxsID8gc3RhdGUuaW5kZXggOiBhcmcuaW5kZXg7XG5cdFx0Y29uc3QgcmVzdCA9IHBhcnNlZC5hbGxcblx0XHRcdC5zbGljZShpbmRleCwgaW5kZXggKyBhcmcubGltaXQpXG5cdFx0XHQubWFwKHggPT4geC5yYXcpXG5cdFx0XHQuam9pbihcIlwiKVxuXHRcdFx0LnRyaW0oKTtcblx0XHRjb25zdCByZXQgPSBhd2FpdCBhcmcucHJvY2VzcyhtZXNzYWdlLCByZXN0KTtcblx0XHRpZiAoYXJnLmluZGV4ID09IG51bGwpIHtcblx0XHRcdEFyZ3VtZW50UnVubmVyLmluY3JlYXNlSW5kZXgocGFyc2VkLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGBub25lYCBtYXRjaC5cblx0ICogQHBhcmFtIHtNZXNzYWdlfSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHtDb250ZW50UGFyc2VyUmVzdWx0fSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSB7QXJndW1lbnRSdW5uZXJTdGF0ZX0gc3RhdGUgLSBBcmd1bWVudCBoYW5kbGluZyBzdGF0ZS5cblx0ICogQHBhcmFtIHtBcmd1bWVudH0gYXJnIC0gQ3VycmVudCBhcmd1bWVudC5cblx0ICogQHJldHVybnMge1Byb21pc2U8RmxhZ3xhbnk+fVxuXHQgKi9cblx0cnVuTm9uZShcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBhcnNlZDogQ29udGVudFBhcnNlclJlc3VsdCxcblx0XHRzdGF0ZTogQXJndW1lbnRSdW5uZXJTdGF0ZSxcblx0XHRhcmc6IEFyZ3VtZW50XG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdHJldHVybiBhcmcucHJvY2VzcyhtZXNzYWdlLCBcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb2RpZmllcyBzdGF0ZSBieSBpbmNyZW1lbnRpbmcgdGhlIGluZGljZXMuXG5cdCAqIEBwYXJhbSBwYXJzZWQgLSBQYXJzZWQgZGF0YSBmcm9tIENvbnRlbnRQYXJzZXIuXG5cdCAqIEBwYXJhbSBzdGF0ZSAtIEFyZ3VtZW50IGhhbmRsaW5nIHN0YXRlLlxuXHQgKiBAcGFyYW0gbiAtIE51bWJlciBvZiBpbmRpY2VzIHRvIGluY3JlYXNlIGJ5LlxuXHQgKi9cblx0c3RhdGljIGluY3JlYXNlSW5kZXgoXG5cdFx0cGFyc2VkOiBDb250ZW50UGFyc2VyUmVzdWx0LFxuXHRcdHN0YXRlOiBBcmd1bWVudFJ1bm5lclN0YXRlLFxuXHRcdG4gPSAxXG5cdCk6IHZvaWQge1xuXHRcdHN0YXRlLnBocmFzZUluZGV4ICs9IG47XG5cdFx0d2hpbGUgKG4gPiAwKSB7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdHN0YXRlLmluZGV4Kys7XG5cdFx0XHR9IHdoaWxlIChcblx0XHRcdFx0cGFyc2VkLmFsbFtzdGF0ZS5pbmRleF0gJiZcblx0XHRcdFx0cGFyc2VkLmFsbFtzdGF0ZS5pbmRleF0udHlwZSAhPT0gXCJQaHJhc2VcIlxuXHRcdFx0KTtcblx0XHRcdG4tLTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHNvbWV0aGluZyBpcyBhIGZsYWcgdGhhdCBzaG9ydCBjaXJjdWl0cy5cblx0ICogQHBhcmFtIHthbnl9IHZhbHVlIC0gQSB2YWx1ZS5cblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRzdGF0aWMgaXNTaG9ydENpcmN1aXQodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAoXG5cdFx0XHRGbGFnLmlzKHZhbHVlLCBcImNhbmNlbFwiKSB8fFxuXHRcdFx0RmxhZy5pcyh2YWx1ZSwgXCJyZXRyeVwiKSB8fFxuXHRcdFx0RmxhZy5pcyh2YWx1ZSwgXCJjb250aW51ZVwiKVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcmd1bWVudCBnZW5lcmF0b3IgZnJvbSBhcmd1bWVudCBvcHRpb25zLlxuXHQgKiBAcGFyYW0ge0FyZ3VtZW50T3B0aW9uc1tdfSBhcmdzIC0gQXJndW1lbnQgb3B0aW9ucy5cblx0ICogQHJldHVybnMge0dlbmVyYXRvckZ1bmN0aW9ufVxuXHQgKi9cblx0c3RhdGljIGZyb21Bcmd1bWVudHMoYXJnczogQXJndW1lbnRPcHRpb25zW10pOiBHZW5lcmF0b3JGdW5jdGlvbiB7XG5cdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdHJldHVybiBmdW5jdGlvbiogZ2VuZXJhdGUoKSB7XG5cdFx0XHRjb25zdCByZXMgPSB7fTtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdGZvciAoY29uc3QgW2lkLCBhcmddIG9mIGFyZ3MpIHtcblx0XHRcdFx0cmVzW2lkXSA9IHlpZWxkIGFyZztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlcztcblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogU3RhdGUgZm9yIHRoZSBhcmd1bWVudCBydW5uZXIuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXJndW1lbnRSdW5uZXJTdGF0ZSB7XG5cdC8qKiBJbmRleCBpbiB0ZXJtcyBvZiB0aGUgcmF3IHN0cmluZ3MuICovXG5cdGluZGV4OiBudW1iZXI7XG5cblx0LyoqIEluZGV4IGluIHRlcm1zIG9mIHBocmFzZXMuICovXG5cdHBocmFzZUluZGV4OiBudW1iZXI7XG5cblx0LyoqIEluZGljZXMgYWxyZWFkeSB1c2VkIGZvciB1bm9yZGVyZWQgbWF0Y2guICovXG5cdHVzZWRJbmRpY2VzOiBTZXQ8bnVtYmVyPjtcbn1cbiJdfQ==