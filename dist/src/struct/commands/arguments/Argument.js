"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("../../../util/Constants");
const Flag_1 = __importDefault(require("../Flag"));
const Util_1 = __importDefault(require("../../../util/Util"));
/**
 * Represents an argument for a command.
 * @param command - Command of the argument.
 * @param options - Options for the argument.
 */
class Argument {
    constructor(command, { match = Constants_1.ArgumentMatches.PHRASE, type = Constants_1.ArgumentTypes.STRING, flag = null, multipleFlags = false, index = null, unordered = false, limit = Infinity, prompt = null, default: defaultValue = null, otherwise = null, modifyOtherwise = null } = {}) {
        this.command = command;
        this.match = match;
        this.type = typeof type === "function" ? type.bind(this) : type;
        this.flag = flag;
        this.multipleFlags = multipleFlags;
        this.index = index;
        this.unordered = unordered;
        this.limit = limit;
        this.prompt = prompt;
        this.default =
            typeof defaultValue === "function"
                ? defaultValue.bind(this)
                : defaultValue;
        this.otherwise =
            typeof otherwise === "function" ? otherwise.bind(this) : otherwise;
        this.modifyOtherwise = modifyOtherwise;
    }
    /**
     * The client.
     */
    get client() {
        return this.command.client;
    }
    /**
     * The command this argument belongs to.
     */
    command;
    /**
     * The default value of the argument or a function supplying the default value.
     */
    default;
    /**
     *  Description of the command.
     */
    description;
    /**
     * The string(s) to use for flag or option match.
     */
    flag;
    /**
     * The command handler.
     */
    get handler() {
        return this.command.handler;
    }
    /**
     * The index to start from.
     */
    index;
    /**
     * The amount of phrases to match for rest, separate, content, or text match.
     */
    limit;
    /**
     * The method to match text.
     */
    match;
    /**
     * Function to modify otherwise content.
     */
    modifyOtherwise;
    /**
     * Whether to process multiple option flags instead of just the first.
     */
    multipleFlags;
    /**
     * The content or function supplying the content sent when argument parsing fails.
     */
    otherwise;
    /**
     * The prompt options.
     */
    prompt;
    /**
     * The type to cast to or a function to use to cast.
     */
    type;
    /**
     * Whether or not the argument is unordered.
     */
    unordered;
    /**
     * Casts a phrase to this argument's type.
     * @param message - Message that called the command.
     * @param phrase - Phrase to process.
     */
    cast(message, phrase) {
        return Argument.cast(this.type, this.handler.resolver, message, phrase);
    }
    /**
     * Collects input from the user by prompting.
     * @param message - Message to prompt.
     * @param commandInput - Previous input from command if there was one.
     * @param parsedInput - Previous parsed input from command if there was one.
     */
    async collect(message, commandInput = "", parsedInput = null) {
        const promptOptions = {};
        Object.assign(promptOptions, this.handler.argumentDefaults.prompt);
        Object.assign(promptOptions, this.command.argumentDefaults.prompt);
        Object.assign(promptOptions, this.prompt || {});
        const isInfinite = promptOptions.infinite ||
            (this.match === Constants_1.ArgumentMatches.SEPARATE && !commandInput);
        const additionalRetry = Number(Boolean(commandInput));
        const values = isInfinite ? [] : null;
        const getText = async (promptType, prompter, retryCount, inputMessage, inputPhrase, inputParsed) => {
            let text = await Util_1.default.intoCallable(prompter).call(this, message, {
                retries: retryCount,
                infinite: isInfinite,
                message: inputMessage,
                phrase: inputPhrase,
                failure: inputParsed
            });
            if (Array.isArray(text)) {
                text = text.join("\n");
            }
            const modifier = {
                start: promptOptions.modifyStart,
                retry: promptOptions.modifyRetry,
                timeout: promptOptions.modifyTimeout,
                ended: promptOptions.modifyEnded,
                cancel: promptOptions.modifyCancel
            }[promptType];
            if (modifier) {
                text = await modifier.call(this, message, text, {
                    retries: retryCount,
                    infinite: isInfinite,
                    message: inputMessage,
                    phrase: inputPhrase,
                    failure: inputParsed
                });
                if (Array.isArray(text)) {
                    text = text.join("\n");
                }
            }
            return text;
        };
        // eslint-disable-next-line complexity
        const promptOne = async (prevMessage, prevInput, prevParsed, retryCount) => {
            let sentStart;
            // This is either a retry prompt, the start of a non-infinite, or the start of an infinite.
            if (retryCount !== 1 || !isInfinite || !values?.length) {
                const promptType = retryCount === 1 ? "start" : "retry";
                const prompter = retryCount === 1 ? promptOptions.start : promptOptions.retry;
                const startText = await getText(promptType, prompter, retryCount, prevMessage, prevInput, prevParsed);
                if (startText) {
                    sentStart = await (message.util || message.channel).send(startText);
                    if (message.util && sentStart) {
                        message.util.setEditable(false);
                        message.util.setLastResponse(sentStart);
                        message.util.addMessage(sentStart);
                    }
                }
            }
            let input;
            try {
                input = (await message.channel.awaitMessages({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: promptOptions.time,
                    errors: ["time"]
                })).first();
                if (message.util)
                    message.util.addMessage(input);
            }
            catch (err) {
                const timeoutText = await getText("timeout", promptOptions.timeout, retryCount, prevMessage, prevInput, "");
                if (timeoutText) {
                    const sentTimeout = await message.channel.send(timeoutText);
                    if (message.util)
                        message.util.addMessage(sentTimeout);
                }
                return Flag_1.default.cancel();
            }
            if (promptOptions.breakout) {
                const looksLike = await this.handler.parseCommand(input);
                if (looksLike && looksLike.command)
                    return Flag_1.default.retry(input);
            }
            if (input?.content.toLowerCase() === promptOptions.cancelWord.toLowerCase()) {
                const cancelText = await getText("cancel", promptOptions.cancel, retryCount, input, input?.content, "cancel");
                if (cancelText) {
                    const sentCancel = await message.channel.send(cancelText);
                    if (message.util)
                        message.util.addMessage(sentCancel);
                }
                return Flag_1.default.cancel();
            }
            if (isInfinite &&
                input?.content.toLowerCase() === promptOptions.stopWord.toLowerCase()) {
                if (!values?.length)
                    return promptOne(input, input?.content, null, retryCount + 1);
                return values;
            }
            const parsedValue = await this.cast(input, input.content);
            if (Argument.isFailure(parsedValue)) {
                if (retryCount <= promptOptions.retries) {
                    return promptOne(input, input?.content, parsedValue, retryCount + 1);
                }
                const endedText = await getText("ended", promptOptions.ended, retryCount, input, input?.content, "stop");
                if (endedText) {
                    const sentEnded = await message.channel.send(endedText);
                    if (message.util)
                        message.util.addMessage(sentEnded);
                }
                return Flag_1.default.cancel();
            }
            if (isInfinite) {
                values.push(parsedValue);
                const limit = promptOptions.limit;
                if (values.length < limit)
                    return promptOne(message, input.content, parsedValue, 1);
                return values;
            }
            return parsedValue;
        };
        this.handler.addPrompt(message.channel, message.author);
        const returnValue = await promptOne(message, commandInput, parsedInput, 1 + additionalRetry);
        if (this.handler.commandUtil && message.util) {
            message.util.setEditable(false);
        }
        this.handler.removePrompt(message.channel, message.author);
        return returnValue;
    }
    /**
     * Processes the type casting and prompting of the argument for a phrase.
     * @param message - The message that called the command.
     * @param phrase - The phrase to process.
     */
    async process(message, phrase) {
        const commandDefs = this.command.argumentDefaults;
        const handlerDefs = this.handler.argumentDefaults;
        const optional = Util_1.default.choice(
        // @ts-expect-error
        this.prompt && this.prompt.optional, commandDefs.prompt && commandDefs.prompt.optional, handlerDefs.prompt && handlerDefs.prompt.optional);
        const doOtherwise = async (failure) => {
            const otherwise = Util_1.default.choice(this.otherwise, commandDefs.otherwise, handlerDefs.otherwise);
            const modifyOtherwise = Util_1.default.choice(this.modifyOtherwise, commandDefs.modifyOtherwise, handlerDefs.modifyOtherwise);
            let text = await Util_1.default.intoCallable(otherwise).call(this, message, {
                phrase,
                failure
            });
            if (Array.isArray(text)) {
                text = text.join("\n");
            }
            if (modifyOtherwise) {
                text = await modifyOtherwise.call(this, message, text, {
                    phrase,
                    failure
                });
                if (Array.isArray(text)) {
                    text = text.join("\n");
                }
            }
            if (text) {
                const sent = await message.channel.send(text);
                if (message.util)
                    message.util.addMessage(sent);
            }
            return Flag_1.default.cancel();
        };
        if (!phrase && optional) {
            if (this.otherwise != null) {
                return doOtherwise(null);
            }
            return Util_1.default.intoCallable(this.default)(message, {
                phrase,
                failure: null
            });
        }
        const res = await this.cast(message, phrase);
        if (Argument.isFailure(res)) {
            if (this.otherwise != null) {
                return doOtherwise(res);
            }
            if (this.prompt != null) {
                return this.collect(message, phrase, res);
            }
            return this.default == null
                ? res
                : Util_1.default.intoCallable(this.default)(message, { phrase, failure: res });
        }
        return res;
    }
    /**
     * Casts a phrase to this argument's type.
     * @param type - The type to cast to.
     * @param resolver - The type resolver.
     * @param message - Message that called the command.
     * @param phrase - Phrase to process.
     */
    static async cast(type, resolver, message, phrase) {
        if (Array.isArray(type)) {
            for (const entry of type) {
                if (Array.isArray(entry)) {
                    if (entry.some(t => t.toLowerCase() === phrase.toLowerCase())) {
                        return entry[0];
                    }
                }
                else if (entry.toLowerCase() === phrase.toLowerCase()) {
                    return entry;
                }
            }
            return null;
        }
        if (typeof type === "function") {
            let res = type(message, phrase);
            if (Util_1.default.isPromise(res))
                res = await res;
            return res;
        }
        if (type instanceof RegExp) {
            const match = phrase.match(type);
            if (!match)
                return null;
            const matches = [];
            if (type.global) {
                let matched;
                while ((matched = type.exec(phrase)) != null) {
                    matches.push(matched);
                }
            }
            return { match, matches };
        }
        if (resolver.type(type)) {
            let res = resolver.type(type)?.call(this, message, phrase);
            if (Util_1.default.isPromise(res))
                res = await res;
            return res;
        }
        return phrase || null;
    }
    /**
     * Creates a type that is the left-to-right composition of the given types.
     * If any of the types fails, the entire composition fails.
     * @param types - Types to use.
     */
    static compose(...types) {
        return async function typeFn(message, phrase) {
            let acc = phrase;
            for (let entry of types) {
                if (typeof entry === "function")
                    entry = entry.bind(this);
                acc = await Argument.cast(entry, this.handler.resolver, message, acc);
                if (Argument.isFailure(acc))
                    return acc;
            }
            return acc;
        };
    }
    /**
     * Creates a type that is the left-to-right composition of the given types.
     * If any of the types fails, the composition still continues with the failure passed on.
     * @param types - Types to use.
     */
    static composeWithFailure(...types) {
        return async function typeFn(message, phrase) {
            let acc = phrase;
            for (let entry of types) {
                if (typeof entry === "function")
                    entry = entry.bind(this);
                acc = await Argument.cast(entry, this.handler.resolver, message, acc);
            }
            return acc;
        };
    }
    /**
     * Checks if something is null, undefined, or a fail flag.
     * @param value - Value to check.
     */
    static isFailure(value) {
        return value == null || Flag_1.default.is(value, "fail");
    }
    /**
     * Creates a type from multiple types (product type).
     * Only inputs where each type resolves with a non-void value are valid.
     * @param types - Types to use.
     */
    static product(...types) {
        return async function typeFn(message, phrase) {
            const results = [];
            for (let entry of types) {
                if (typeof entry === "function")
                    entry = entry.bind(this);
                const res = await Argument.cast(entry, this.handler.resolver, message, phrase);
                if (Argument.isFailure(res))
                    return res;
                results.push(res);
            }
            return results;
        };
    }
    /**
     * Creates a type where the parsed value must be within a range.
     * @param type - The type to use.
     * @param min - Minimum value.
     * @param max - Maximum value.
     * @param inclusive - Whether or not to be inclusive on the upper bound.
     */
    static range(type, min, max, inclusive = false) {
        return Argument.validate(type, (msg, p, x) => {
            /* eslint-disable-next-line valid-typeof */
            const o = 
            // See src/struct/ClientUtil.js:345:4
            // eslint-disable-next-line
            typeof x === "number" || typeof x === "bigint"
                ? x
                : x.length != null
                    ? x.length
                    : x.size != null
                        ? x.size
                        : x;
            return o >= min && (inclusive ? o <= max : o < max);
        });
    }
    /**
     * Creates a type that parses as normal but also tags it with some data.
     * Result is in an object `{ tag, value }` and wrapped in `Flag.fail` when failed.
     * @param type - The type to use.
     * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
     */
    static tagged(type, tag = type) {
        return async function typeFn(message, phrase) {
            if (typeof type === "function")
                type = type.bind(this);
            const res = await Argument.cast(type, this.handler.resolver, message, phrase);
            if (Argument.isFailure(res)) {
                return Flag_1.default.fail({ tag, value: res });
            }
            return { tag, value: res };
        };
    }
    /**
     * Creates a type from multiple types (union type).
     * The first type that resolves to a non-void value is used.
     * Each type will also be tagged using `tagged` with themselves.
     * @param types - Types to use.
     */
    static taggedUnion(...types) {
        return async function typeFn(message, phrase) {
            for (let entry of types) {
                entry = Argument.tagged(entry);
                const res = await Argument.cast(entry, this.handler.resolver, message, phrase);
                if (!Argument.isFailure(res))
                    return res;
            }
            return null;
        };
    }
    /**
     * Creates a type that parses as normal but also tags it with some data and carries the original input.
     * Result is in an object `{ tag, input, value }` and wrapped in `Flag.fail` when failed.
     * @param type - The type to use.
     * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
     */
    static taggedWithInput(type, tag = type) {
        return async function typeFn(message, phrase) {
            if (typeof type === "function")
                type = type.bind(this);
            const res = await Argument.cast(type, this.handler.resolver, message, phrase);
            if (Argument.isFailure(res)) {
                return Flag_1.default.fail({ tag, input: phrase, value: res });
            }
            return { tag, input: phrase, value: res };
        };
    }
    /**
     * Creates a type from multiple types (union type).
     * The first type that resolves to a non-void value is used.
     * @param types - Types to use.
     */
    static union(...types) {
        return async function typeFn(message, phrase) {
            for (let entry of types) {
                if (typeof entry === "function")
                    entry = entry.bind(this);
                const res = await Argument.cast(entry, this.handler.resolver, message, phrase);
                if (!Argument.isFailure(res))
                    return res;
            }
            return null;
        };
    }
    /**
     * Creates a type with extra validation.
     * If the predicate is not true, the value is considered invalid.
     * @param type - The type to use.
     * @param predicate - The predicate function.
     */
    static validate(type, predicate) {
        return async function typeFn(message, phrase) {
            if (typeof type === "function")
                type = type.bind(this);
            const res = await Argument.cast(type, this.handler.resolver, message, phrase);
            if (Argument.isFailure(res))
                return res;
            if (!predicate.call(this, message, phrase, res))
                return null;
            return res;
        };
    }
    /**
     * Creates a type that parses as normal but also carries the original input.
     * Result is in an object `{ input, value }` and wrapped in `Flag.fail` when failed.
     * @param type - The type to use.
     */
    static withInput(type) {
        return async function typeFn(message, phrase) {
            if (typeof type === "function")
                type = type.bind(this);
            const res = await Argument.cast(type, this.handler.resolver, message, phrase);
            if (Argument.isFailure(res)) {
                return Flag_1.default.fail({ input: phrase, value: res });
            }
            return { input: phrase, value: res };
        };
    }
}
exports.default = Argument;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUF5RTtBQUN6RSxtREFBMkI7QUFDM0IsOERBQXNDO0FBUXRDOzs7O0dBSUc7QUFDSCxNQUFxQixRQUFRO0lBQzVCLFlBQ0MsT0FBZ0IsRUFDaEIsRUFDQyxLQUFLLEdBQUcsMkJBQWUsQ0FBQyxNQUFNLEVBQzlCLElBQUksR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFDM0IsSUFBSSxHQUFHLElBQUksRUFDWCxhQUFhLEdBQUcsS0FBSyxFQUNyQixLQUFLLEdBQUcsSUFBSSxFQUNaLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLEtBQUssR0FBRyxRQUFRLEVBQ2hCLE1BQU0sR0FBRyxJQUFJLEVBQ2IsT0FBTyxFQUFFLFlBQVksR0FBRyxJQUFJLEVBQzVCLFNBQVMsR0FBRyxJQUFJLEVBQ2hCLGVBQWUsR0FBRyxJQUFJLEtBQ0YsRUFBRTtRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRWhFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBRW5DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxNQUFNLEdBQUcs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TUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUM5QixJQUFJLEVBQ0osSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQ3JCLE9BQU8sRUFDUCxNQUFNLENBQ04sQ0FBQztZQUNGLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsT0FBTyxjQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQzthQUNoRDtZQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUN0QyxDQUFDLENBQUM7SUFDSCxDQUFDO0NBQ0Q7QUF0dUJELDJCQXN1QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcmd1bWVudE1hdGNoZXMsIEFyZ3VtZW50VHlwZXMgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBGbGFnIGZyb20gXCIuLi9GbGFnXCI7XG5pbXBvcnQgVXRpbCBmcm9tIFwiLi4vLi4vLi4vdXRpbC9VdGlsXCI7XG5pbXBvcnQgQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFwiO1xuaW1wb3J0IHsgTWVzc2FnZU9wdGlvbnMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0IHsgTWVzc2FnZSwgTWVzc2FnZVBheWxvYWQgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IFR5cGVSZXNvbHZlciBmcm9tIFwiLi9UeXBlUmVzb2x2ZXJcIjtcbmltcG9ydCBDb21tYW5kSGFuZGxlciBmcm9tIFwiLi4vQ29tbWFuZEhhbmRsZXJcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uLy4uL0FrYWlyb0NsaWVudFwiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gYXJndW1lbnQgZm9yIGEgY29tbWFuZC5cbiAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCBvZiB0aGUgYXJndW1lbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBhcmd1bWVudC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJndW1lbnQge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y29tbWFuZDogQ29tbWFuZCxcblx0XHR7XG5cdFx0XHRtYXRjaCA9IEFyZ3VtZW50TWF0Y2hlcy5QSFJBU0UsXG5cdFx0XHR0eXBlID0gQXJndW1lbnRUeXBlcy5TVFJJTkcsXG5cdFx0XHRmbGFnID0gbnVsbCxcblx0XHRcdG11bHRpcGxlRmxhZ3MgPSBmYWxzZSxcblx0XHRcdGluZGV4ID0gbnVsbCxcblx0XHRcdHVub3JkZXJlZCA9IGZhbHNlLFxuXHRcdFx0bGltaXQgPSBJbmZpbml0eSxcblx0XHRcdHByb21wdCA9IG51bGwsXG5cdFx0XHRkZWZhdWx0OiBkZWZhdWx0VmFsdWUgPSBudWxsLFxuXHRcdFx0b3RoZXJ3aXNlID0gbnVsbCxcblx0XHRcdG1vZGlmeU90aGVyd2lzZSA9IG51bGxcblx0XHR9OiBBcmd1bWVudE9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHR0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuXG5cdFx0dGhpcy5tYXRjaCA9IG1hdGNoO1xuXG5cdFx0dGhpcy50eXBlID0gdHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIiA/IHR5cGUuYmluZCh0aGlzKSA6IHR5cGU7XG5cblx0XHR0aGlzLmZsYWcgPSBmbGFnO1xuXG5cdFx0dGhpcy5tdWx0aXBsZUZsYWdzID0gbXVsdGlwbGVGbGFncztcblxuXHRcdHRoaXMuaW5kZXggPSBpbmRleDtcblxuXHRcdHRoaXMudW5vcmRlcmVkID0gdW5vcmRlcmVkO1xuXG5cdFx0dGhpcy5saW1pdCA9IGxpbWl0O1xuXG5cdFx0dGhpcy5wcm9tcHQgPSBwcm9tcHQ7XG5cblx0XHR0aGlzLmRlZmF1bHQgPVxuXHRcdFx0dHlwZW9mIGRlZmF1bHRWYWx1ZSA9PT0gXCJmdW5jdGlvblwiXG5cdFx0XHRcdD8gZGVmYXVsdFZhbHVlLmJpbmQodGhpcylcblx0XHRcdFx0OiBkZWZhdWx0VmFsdWU7XG5cblx0XHR0aGlzLm90aGVyd2lzZSA9XG5cdFx0XHR0eXBlb2Ygb3RoZXJ3aXNlID09PSBcImZ1bmN0aW9uXCIgPyBvdGhlcndpc2UuYmluZCh0aGlzKSA6IG90aGVyd2lzZTtcblxuXHRcdHRoaXMubW9kaWZ5T3RoZXJ3aXNlID0gbW9kaWZ5T3RoZXJ3aXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjbGllbnQuXG5cdCAqL1xuXHRnZXQgY2xpZW50KCk6IEFrYWlyb0NsaWVudCB7XG5cdFx0cmV0dXJuIHRoaXMuY29tbWFuZC5jbGllbnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgdGhpcyBhcmd1bWVudCBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmQ6IENvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBhcmd1bWVudCBvciBhIGZ1bmN0aW9uIHN1cHBseWluZyB0aGUgZGVmYXVsdCB2YWx1ZS5cblx0ICovXG5cdHB1YmxpYyBkZWZhdWx0OiBEZWZhdWx0VmFsdWVTdXBwbGllciB8IGFueTtcblxuXHQvKipcblx0ICogIERlc2NyaXB0aW9uIG9mIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGRlc2NyaXB0aW9uOiBzdHJpbmcgfCBhbnk7XG5cblx0LyoqXG5cdCAqIFRoZSBzdHJpbmcocykgdG8gdXNlIGZvciBmbGFnIG9yIG9wdGlvbiBtYXRjaC5cblx0ICovXG5cdHB1YmxpYyBmbGFnPzogc3RyaW5nIHwgc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIGhhbmRsZXIuXG5cdCAqL1xuXHRnZXQgaGFuZGxlcigpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tbWFuZC5oYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpbmRleCB0byBzdGFydCBmcm9tLlxuXHQgKi9cblx0cHVibGljIGluZGV4PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHBocmFzZXMgdG8gbWF0Y2ggZm9yIHJlc3QsIHNlcGFyYXRlLCBjb250ZW50LCBvciB0ZXh0IG1hdGNoLlxuXHQgKi9cblx0cHVibGljIGxpbWl0OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdG8gbWF0Y2ggdGV4dC5cblx0ICovXG5cdHB1YmxpYyBtYXRjaDogQXJndW1lbnRNYXRjaDtcblxuXHQvKipcblx0ICogRnVuY3Rpb24gdG8gbW9kaWZ5IG90aGVyd2lzZSBjb250ZW50LlxuXHQgKi9cblx0cHVibGljIG1vZGlmeU90aGVyd2lzZTogT3RoZXJ3aXNlQ29udGVudE1vZGlmaWVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRvIHByb2Nlc3MgbXVsdGlwbGUgb3B0aW9uIGZsYWdzIGluc3RlYWQgb2YganVzdCB0aGUgZmlyc3QuXG5cdCAqL1xuXHRwdWJsaWMgbXVsdGlwbGVGbGFnczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIGNvbnRlbnQgb3IgZnVuY3Rpb24gc3VwcGx5aW5nIHRoZSBjb250ZW50IHNlbnQgd2hlbiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLlxuXHQgKi9cblx0cHVibGljIG90aGVyd2lzZT86XG5cdFx0fCBzdHJpbmdcblx0XHR8IE1lc3NhZ2VQYXlsb2FkXG5cdFx0fCBNZXNzYWdlT3B0aW9uc1xuXHRcdHwgT3RoZXJ3aXNlQ29udGVudFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgcHJvbXB0IG9wdGlvbnMuXG5cdCAqL1xuXHRwdWJsaWMgcHJvbXB0PzogQXJndW1lbnRQcm9tcHRPcHRpb25zIHwgYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIHR5cGUgdG8gY2FzdCB0byBvciBhIGZ1bmN0aW9uIHRvIHVzZSB0byBjYXN0LlxuXHQgKi9cblx0cHVibGljIHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGFyZ3VtZW50IGlzIHVub3JkZXJlZC5cblx0ICovXG5cdHB1YmxpYyB1bm9yZGVyZWQ6IGJvb2xlYW4gfCBudW1iZXIgfCBudW1iZXJbXTtcblxuXHQvKipcblx0ICogQ2FzdHMgYSBwaHJhc2UgdG8gdGhpcyBhcmd1bWVudCdzIHR5cGUuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBocmFzZSAtIFBocmFzZSB0byBwcm9jZXNzLlxuXHQgKi9cblx0cHVibGljIGNhc3QobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuXHRcdHJldHVybiBBcmd1bWVudC5jYXN0KHRoaXMudHlwZSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbGxlY3RzIGlucHV0IGZyb20gdGhlIHVzZXIgYnkgcHJvbXB0aW5nLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gcHJvbXB0LlxuXHQgKiBAcGFyYW0gY29tbWFuZElucHV0IC0gUHJldmlvdXMgaW5wdXQgZnJvbSBjb21tYW5kIGlmIHRoZXJlIHdhcyBvbmUuXG5cdCAqIEBwYXJhbSBwYXJzZWRJbnB1dCAtIFByZXZpb3VzIHBhcnNlZCBpbnB1dCBmcm9tIGNvbW1hbmQgaWYgdGhlcmUgd2FzIG9uZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBjb2xsZWN0KFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0Y29tbWFuZElucHV0OiBzdHJpbmcgPSBcIlwiLFxuXHRcdHBhcnNlZElucHV0OiBhbnkgPSBudWxsXG5cdCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IHByb21wdE9wdGlvbnM6IGFueSA9IHt9O1xuXHRcdE9iamVjdC5hc3NpZ24ocHJvbXB0T3B0aW9ucywgdGhpcy5oYW5kbGVyLmFyZ3VtZW50RGVmYXVsdHMucHJvbXB0KTtcblx0XHRPYmplY3QuYXNzaWduKHByb21wdE9wdGlvbnMsIHRoaXMuY29tbWFuZC5hcmd1bWVudERlZmF1bHRzLnByb21wdCk7XG5cdFx0T2JqZWN0LmFzc2lnbihwcm9tcHRPcHRpb25zLCB0aGlzLnByb21wdCB8fCB7fSk7XG5cblx0XHRjb25zdCBpc0luZmluaXRlID1cblx0XHRcdHByb21wdE9wdGlvbnMuaW5maW5pdGUgfHxcblx0XHRcdCh0aGlzLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuU0VQQVJBVEUgJiYgIWNvbW1hbmRJbnB1dCk7XG5cdFx0Y29uc3QgYWRkaXRpb25hbFJldHJ5ID0gTnVtYmVyKEJvb2xlYW4oY29tbWFuZElucHV0KSk7XG5cdFx0Y29uc3QgdmFsdWVzID0gaXNJbmZpbml0ZSA/IFtdIDogbnVsbDtcblxuXHRcdGNvbnN0IGdldFRleHQgPSBhc3luYyAoXG5cdFx0XHRwcm9tcHRUeXBlLFxuXHRcdFx0cHJvbXB0ZXIsXG5cdFx0XHRyZXRyeUNvdW50LFxuXHRcdFx0aW5wdXRNZXNzYWdlLFxuXHRcdFx0aW5wdXRQaHJhc2UsXG5cdFx0XHRpbnB1dFBhcnNlZFxuXHRcdCkgPT4ge1xuXHRcdFx0bGV0IHRleHQgPSBhd2FpdCBVdGlsLmludG9DYWxsYWJsZShwcm9tcHRlcikuY2FsbCh0aGlzLCBtZXNzYWdlLCB7XG5cdFx0XHRcdHJldHJpZXM6IHJldHJ5Q291bnQsXG5cdFx0XHRcdGluZmluaXRlOiBpc0luZmluaXRlLFxuXHRcdFx0XHRtZXNzYWdlOiBpbnB1dE1lc3NhZ2UsXG5cdFx0XHRcdHBocmFzZTogaW5wdXRQaHJhc2UsXG5cdFx0XHRcdGZhaWx1cmU6IGlucHV0UGFyc2VkXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGV4dCkpIHtcblx0XHRcdFx0dGV4dCA9IHRleHQuam9pbihcIlxcblwiKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgbW9kaWZpZXIgPSB7XG5cdFx0XHRcdHN0YXJ0OiBwcm9tcHRPcHRpb25zLm1vZGlmeVN0YXJ0LFxuXHRcdFx0XHRyZXRyeTogcHJvbXB0T3B0aW9ucy5tb2RpZnlSZXRyeSxcblx0XHRcdFx0dGltZW91dDogcHJvbXB0T3B0aW9ucy5tb2RpZnlUaW1lb3V0LFxuXHRcdFx0XHRlbmRlZDogcHJvbXB0T3B0aW9ucy5tb2RpZnlFbmRlZCxcblx0XHRcdFx0Y2FuY2VsOiBwcm9tcHRPcHRpb25zLm1vZGlmeUNhbmNlbFxuXHRcdFx0fVtwcm9tcHRUeXBlXTtcblxuXHRcdFx0aWYgKG1vZGlmaWVyKSB7XG5cdFx0XHRcdHRleHQgPSBhd2FpdCBtb2RpZmllci5jYWxsKHRoaXMsIG1lc3NhZ2UsIHRleHQsIHtcblx0XHRcdFx0XHRyZXRyaWVzOiByZXRyeUNvdW50LFxuXHRcdFx0XHRcdGluZmluaXRlOiBpc0luZmluaXRlLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGlucHV0TWVzc2FnZSxcblx0XHRcdFx0XHRwaHJhc2U6IGlucHV0UGhyYXNlLFxuXHRcdFx0XHRcdGZhaWx1cmU6IGlucHV0UGFyc2VkXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdFx0dGV4dCA9IHRleHQuam9pbihcIlxcblwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGV4dDtcblx0XHR9O1xuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblx0XHRjb25zdCBwcm9tcHRPbmUgPSBhc3luYyAoXG5cdFx0XHRwcmV2TWVzc2FnZSxcblx0XHRcdHByZXZJbnB1dCxcblx0XHRcdHByZXZQYXJzZWQsXG5cdFx0XHRyZXRyeUNvdW50XG5cdFx0KSA9PiB7XG5cdFx0XHRsZXQgc2VudFN0YXJ0O1xuXHRcdFx0Ly8gVGhpcyBpcyBlaXRoZXIgYSByZXRyeSBwcm9tcHQsIHRoZSBzdGFydCBvZiBhIG5vbi1pbmZpbml0ZSwgb3IgdGhlIHN0YXJ0IG9mIGFuIGluZmluaXRlLlxuXHRcdFx0aWYgKHJldHJ5Q291bnQgIT09IDEgfHwgIWlzSW5maW5pdGUgfHwgIXZhbHVlcz8ubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnN0IHByb21wdFR5cGUgPSByZXRyeUNvdW50ID09PSAxID8gXCJzdGFydFwiIDogXCJyZXRyeVwiO1xuXHRcdFx0XHRjb25zdCBwcm9tcHRlciA9XG5cdFx0XHRcdFx0cmV0cnlDb3VudCA9PT0gMSA/IHByb21wdE9wdGlvbnMuc3RhcnQgOiBwcm9tcHRPcHRpb25zLnJldHJ5O1xuXHRcdFx0XHRjb25zdCBzdGFydFRleHQgPSBhd2FpdCBnZXRUZXh0KFxuXHRcdFx0XHRcdHByb21wdFR5cGUsXG5cdFx0XHRcdFx0cHJvbXB0ZXIsXG5cdFx0XHRcdFx0cmV0cnlDb3VudCxcblx0XHRcdFx0XHRwcmV2TWVzc2FnZSxcblx0XHRcdFx0XHRwcmV2SW5wdXQsXG5cdFx0XHRcdFx0cHJldlBhcnNlZFxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGlmIChzdGFydFRleHQpIHtcblx0XHRcdFx0XHRzZW50U3RhcnQgPSBhd2FpdCAobWVzc2FnZS51dGlsIHx8IG1lc3NhZ2UuY2hhbm5lbCkuc2VuZChzdGFydFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwgJiYgc2VudFN0YXJ0KSB7XG5cdFx0XHRcdFx0XHRtZXNzYWdlLnV0aWwuc2V0RWRpdGFibGUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsLnNldExhc3RSZXNwb25zZShzZW50U3RhcnQpO1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudFN0YXJ0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGlucHV0O1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aW5wdXQgPSAoXG5cdFx0XHRcdFx0YXdhaXQgbWVzc2FnZS5jaGFubmVsLmF3YWl0TWVzc2FnZXMoe1xuXHRcdFx0XHRcdFx0ZmlsdGVyOiBtID0+IG0uYXV0aG9yLmlkID09PSBtZXNzYWdlLmF1dGhvci5pZCxcblx0XHRcdFx0XHRcdG1heDogMSxcblx0XHRcdFx0XHRcdHRpbWU6IHByb21wdE9wdGlvbnMudGltZSxcblx0XHRcdFx0XHRcdGVycm9yczogW1widGltZVwiXVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCkuZmlyc3QoKTtcblx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2UoaW5wdXQpO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGNvbnN0IHRpbWVvdXRUZXh0ID0gYXdhaXQgZ2V0VGV4dChcblx0XHRcdFx0XHRcInRpbWVvdXRcIixcblx0XHRcdFx0XHRwcm9tcHRPcHRpb25zLnRpbWVvdXQsXG5cdFx0XHRcdFx0cmV0cnlDb3VudCxcblx0XHRcdFx0XHRwcmV2TWVzc2FnZSxcblx0XHRcdFx0XHRwcmV2SW5wdXQsXG5cdFx0XHRcdFx0XCJcIlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAodGltZW91dFRleHQpIHtcblx0XHRcdFx0XHRjb25zdCBzZW50VGltZW91dCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHRpbWVvdXRUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50VGltZW91dCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gRmxhZy5jYW5jZWwoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHByb21wdE9wdGlvbnMuYnJlYWtvdXQpIHtcblx0XHRcdFx0Y29uc3QgbG9va3NMaWtlID0gYXdhaXQgdGhpcy5oYW5kbGVyLnBhcnNlQ29tbWFuZChpbnB1dCk7XG5cdFx0XHRcdGlmIChsb29rc0xpa2UgJiYgbG9va3NMaWtlLmNvbW1hbmQpIHJldHVybiBGbGFnLnJldHJ5KGlucHV0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKFxuXHRcdFx0XHRpbnB1dD8uY29udGVudC50b0xvd2VyQ2FzZSgpID09PSBwcm9tcHRPcHRpb25zLmNhbmNlbFdvcmQudG9Mb3dlckNhc2UoKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGNhbmNlbFRleHQgPSBhd2FpdCBnZXRUZXh0KFxuXHRcdFx0XHRcdFwiY2FuY2VsXCIsXG5cdFx0XHRcdFx0cHJvbXB0T3B0aW9ucy5jYW5jZWwsXG5cdFx0XHRcdFx0cmV0cnlDb3VudCxcblx0XHRcdFx0XHRpbnB1dCxcblx0XHRcdFx0XHRpbnB1dD8uY29udGVudCxcblx0XHRcdFx0XHRcImNhbmNlbFwiXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChjYW5jZWxUZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2VudENhbmNlbCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKGNhbmNlbFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRDYW5jZWwpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChcblx0XHRcdFx0aXNJbmZpbml0ZSAmJlxuXHRcdFx0XHRpbnB1dD8uY29udGVudC50b0xvd2VyQ2FzZSgpID09PSBwcm9tcHRPcHRpb25zLnN0b3BXb3JkLnRvTG93ZXJDYXNlKClcblx0XHRcdCkge1xuXHRcdFx0XHRpZiAoIXZhbHVlcz8ubGVuZ3RoKVxuXHRcdFx0XHRcdHJldHVybiBwcm9tcHRPbmUoaW5wdXQsIGlucHV0Py5jb250ZW50LCBudWxsLCByZXRyeUNvdW50ICsgMSk7XG5cdFx0XHRcdHJldHVybiB2YWx1ZXM7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHBhcnNlZFZhbHVlID0gYXdhaXQgdGhpcy5jYXN0KGlucHV0LCBpbnB1dC5jb250ZW50KTtcblx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocGFyc2VkVmFsdWUpKSB7XG5cdFx0XHRcdGlmIChyZXRyeUNvdW50IDw9IHByb21wdE9wdGlvbnMucmV0cmllcykge1xuXHRcdFx0XHRcdHJldHVybiBwcm9tcHRPbmUoaW5wdXQsIGlucHV0Py5jb250ZW50LCBwYXJzZWRWYWx1ZSwgcmV0cnlDb3VudCArIDEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgZW5kZWRUZXh0ID0gYXdhaXQgZ2V0VGV4dChcblx0XHRcdFx0XHRcImVuZGVkXCIsXG5cdFx0XHRcdFx0cHJvbXB0T3B0aW9ucy5lbmRlZCxcblx0XHRcdFx0XHRyZXRyeUNvdW50LFxuXHRcdFx0XHRcdGlucHV0LFxuXHRcdFx0XHRcdGlucHV0Py5jb250ZW50LFxuXHRcdFx0XHRcdFwic3RvcFwiXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChlbmRlZFRleHQpIHtcblx0XHRcdFx0XHRjb25zdCBzZW50RW5kZWQgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZChlbmRlZFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRFbmRlZCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gRmxhZy5jYW5jZWwoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGlzSW5maW5pdGUpIHtcblx0XHRcdFx0dmFsdWVzLnB1c2gocGFyc2VkVmFsdWUpO1xuXHRcdFx0XHRjb25zdCBsaW1pdCA9IHByb21wdE9wdGlvbnMubGltaXQ7XG5cdFx0XHRcdGlmICh2YWx1ZXMubGVuZ3RoIDwgbGltaXQpXG5cdFx0XHRcdFx0cmV0dXJuIHByb21wdE9uZShtZXNzYWdlLCBpbnB1dC5jb250ZW50LCBwYXJzZWRWYWx1ZSwgMSk7XG5cblx0XHRcdFx0cmV0dXJuIHZhbHVlcztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHBhcnNlZFZhbHVlO1xuXHRcdH07XG5cblx0XHR0aGlzLmhhbmRsZXIuYWRkUHJvbXB0KG1lc3NhZ2UuY2hhbm5lbCwgbWVzc2FnZS5hdXRob3IpO1xuXHRcdGNvbnN0IHJldHVyblZhbHVlID0gYXdhaXQgcHJvbXB0T25lKFxuXHRcdFx0bWVzc2FnZSxcblx0XHRcdGNvbW1hbmRJbnB1dCxcblx0XHRcdHBhcnNlZElucHV0LFxuXHRcdFx0MSArIGFkZGl0aW9uYWxSZXRyeVxuXHRcdCk7XG5cdFx0aWYgKHRoaXMuaGFuZGxlci5jb21tYW5kVXRpbCAmJiBtZXNzYWdlLnV0aWwpIHtcblx0XHRcdG1lc3NhZ2UudXRpbC5zZXRFZGl0YWJsZShmYWxzZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5oYW5kbGVyLnJlbW92ZVByb21wdChtZXNzYWdlLmNoYW5uZWwsIG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogUHJvY2Vzc2VzIHRoZSB0eXBlIGNhc3RpbmcgYW5kIHByb21wdGluZyBvZiB0aGUgYXJndW1lbnQgZm9yIGEgcGhyYXNlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGhyYXNlIC0gVGhlIHBocmFzZSB0byBwcm9jZXNzLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHByb2Nlc3MobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBjb21tYW5kRGVmcyA9IHRoaXMuY29tbWFuZC5hcmd1bWVudERlZmF1bHRzO1xuXHRcdGNvbnN0IGhhbmRsZXJEZWZzID0gdGhpcy5oYW5kbGVyLmFyZ3VtZW50RGVmYXVsdHM7XG5cdFx0Y29uc3Qgb3B0aW9uYWwgPSBVdGlsLmNob2ljZShcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdHRoaXMucHJvbXB0ICYmIHRoaXMucHJvbXB0Lm9wdGlvbmFsLFxuXHRcdFx0Y29tbWFuZERlZnMucHJvbXB0ICYmIGNvbW1hbmREZWZzLnByb21wdC5vcHRpb25hbCxcblx0XHRcdGhhbmRsZXJEZWZzLnByb21wdCAmJiBoYW5kbGVyRGVmcy5wcm9tcHQub3B0aW9uYWxcblx0XHQpO1xuXG5cdFx0Y29uc3QgZG9PdGhlcndpc2UgPSBhc3luYyBmYWlsdXJlID0+IHtcblx0XHRcdGNvbnN0IG90aGVyd2lzZSA9IFV0aWwuY2hvaWNlKFxuXHRcdFx0XHR0aGlzLm90aGVyd2lzZSxcblx0XHRcdFx0Y29tbWFuZERlZnMub3RoZXJ3aXNlLFxuXHRcdFx0XHRoYW5kbGVyRGVmcy5vdGhlcndpc2Vcblx0XHRcdCk7XG5cblx0XHRcdGNvbnN0IG1vZGlmeU90aGVyd2lzZSA9IFV0aWwuY2hvaWNlKFxuXHRcdFx0XHR0aGlzLm1vZGlmeU90aGVyd2lzZSxcblx0XHRcdFx0Y29tbWFuZERlZnMubW9kaWZ5T3RoZXJ3aXNlLFxuXHRcdFx0XHRoYW5kbGVyRGVmcy5tb2RpZnlPdGhlcndpc2Vcblx0XHRcdCk7XG5cblx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUob3RoZXJ3aXNlKS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHtcblx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlXG5cdFx0XHR9KTtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtb2RpZnlPdGhlcndpc2UpIHtcblx0XHRcdFx0dGV4dCA9IGF3YWl0IG1vZGlmeU90aGVyd2lzZS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHRleHQsIHtcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0ZmFpbHVyZVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGV4dCkpIHtcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5qb2luKFwiXFxuXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IHNlbnQgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZCh0ZXh0KTtcblx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdH07XG5cblx0XHRpZiAoIXBocmFzZSAmJiBvcHRpb25hbCkge1xuXHRcdFx0aWYgKHRoaXMub3RoZXJ3aXNlICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIGRvT3RoZXJ3aXNlKG51bGwpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5kZWZhdWx0KShtZXNzYWdlLCB7XG5cdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0ZmFpbHVyZTogbnVsbFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzID0gYXdhaXQgdGhpcy5jYXN0KG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRpZiAodGhpcy5vdGhlcndpc2UgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gZG9PdGhlcndpc2UocmVzKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMucHJvbXB0ICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY29sbGVjdChtZXNzYWdlLCBwaHJhc2UsIHJlcyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmRlZmF1bHQgPT0gbnVsbFxuXHRcdFx0XHQ/IHJlc1xuXHRcdFx0XHQ6IFV0aWwuaW50b0NhbGxhYmxlKHRoaXMuZGVmYXVsdCkobWVzc2FnZSwgeyBwaHJhc2UsIGZhaWx1cmU6IHJlcyB9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhc3RzIGEgcGhyYXNlIHRvIHRoaXMgYXJndW1lbnQncyB0eXBlLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIGNhc3QgdG8uXG5cdCAqIEBwYXJhbSByZXNvbHZlciAtIFRoZSB0eXBlIHJlc29sdmVyLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwaHJhc2UgLSBQaHJhc2UgdG8gcHJvY2Vzcy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgY2FzdChcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsXG5cdFx0cmVzb2x2ZXI6IFR5cGVSZXNvbHZlcixcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBocmFzZTogc3RyaW5nXG5cdCk6IFByb21pc2U8YW55PiB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodHlwZSkpIHtcblx0XHRcdGZvciAoY29uc3QgZW50cnkgb2YgdHlwZSkge1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShlbnRyeSkpIHtcblx0XHRcdFx0XHRpZiAoZW50cnkuc29tZSh0ID0+IHQudG9Mb3dlckNhc2UoKSA9PT0gcGhyYXNlLnRvTG93ZXJDYXNlKCkpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZW50cnlbMF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGVudHJ5LnRvTG93ZXJDYXNlKCkgPT09IHBocmFzZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVudHJ5O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRsZXQgcmVzID0gdHlwZShtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKHJlcykpIHJlcyA9IGF3YWl0IHJlcztcblx0XHRcdHJldHVybiByZXM7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdGNvbnN0IG1hdGNoID0gcGhyYXNlLm1hdGNoKHR5cGUpO1xuXHRcdFx0aWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG5cblx0XHRcdGNvbnN0IG1hdGNoZXMgPSBbXTtcblxuXHRcdFx0aWYgKHR5cGUuZ2xvYmFsKSB7XG5cdFx0XHRcdGxldCBtYXRjaGVkO1xuXG5cdFx0XHRcdHdoaWxlICgobWF0Y2hlZCA9IHR5cGUuZXhlYyhwaHJhc2UpKSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0bWF0Y2hlcy5wdXNoKG1hdGNoZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IG1hdGNoLCBtYXRjaGVzIH07XG5cdFx0fVxuXG5cdFx0aWYgKHJlc29sdmVyLnR5cGUodHlwZSkpIHtcblx0XHRcdGxldCByZXMgPSByZXNvbHZlci50eXBlKHR5cGUpPy5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UocmVzKSkgcmVzID0gYXdhaXQgcmVzO1xuXHRcdFx0cmV0dXJuIHJlcztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGhyYXNlIHx8IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBpcyB0aGUgbGVmdC10by1yaWdodCBjb21wb3NpdGlvbiBvZiB0aGUgZ2l2ZW4gdHlwZXMuXG5cdCAqIElmIGFueSBvZiB0aGUgdHlwZXMgZmFpbHMsIHRoZSBlbnRpcmUgY29tcG9zaXRpb24gZmFpbHMuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgY29tcG9zZShcblx0XHQuLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXVxuXHQpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRsZXQgYWNjID0gcGhyYXNlO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGFjYyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgYWNjKTtcblx0XHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShhY2MpKSByZXR1cm4gYWNjO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYWNjO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBpcyB0aGUgbGVmdC10by1yaWdodCBjb21wb3NpdGlvbiBvZiB0aGUgZ2l2ZW4gdHlwZXMuXG5cdCAqIElmIGFueSBvZiB0aGUgdHlwZXMgZmFpbHMsIHRoZSBjb21wb3NpdGlvbiBzdGlsbCBjb250aW51ZXMgd2l0aCB0aGUgZmFpbHVyZSBwYXNzZWQgb24uXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgY29tcG9zZVdpdGhGYWlsdXJlKFxuXHRcdC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdXG5cdCk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGxldCBhY2MgPSBwaHJhc2U7XG5cdFx0XHRmb3IgKGxldCBlbnRyeSBvZiB0eXBlcykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5ID09PSBcImZ1bmN0aW9uXCIpIGVudHJ5ID0gZW50cnkuYmluZCh0aGlzKTtcblx0XHRcdFx0YWNjID0gYXdhaXQgQXJndW1lbnQuY2FzdChlbnRyeSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBhY2MpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYWNjO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHNvbWV0aGluZyBpcyBudWxsLCB1bmRlZmluZWQsIG9yIGEgZmFpbCBmbGFnLlxuXHQgKiBAcGFyYW0gdmFsdWUgLSBWYWx1ZSB0byBjaGVjay5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaXNGYWlsdXJlKFxuXHRcdHZhbHVlOiBhbnlcblx0KTogdmFsdWUgaXMgbnVsbCB8IHVuZGVmaW5lZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pIHtcblx0XHRyZXR1cm4gdmFsdWUgPT0gbnVsbCB8fCBGbGFnLmlzKHZhbHVlLCBcImZhaWxcIik7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAocHJvZHVjdCB0eXBlKS5cblx0ICogT25seSBpbnB1dHMgd2hlcmUgZWFjaCB0eXBlIHJlc29sdmVzIHdpdGggYSBub24tdm9pZCB2YWx1ZSBhcmUgdmFsaWQuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcHJvZHVjdChcblx0XHQuLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXVxuXHQpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRjb25zdCByZXN1bHRzID0gW107XG5cdFx0XHRmb3IgKGxldCBlbnRyeSBvZiB0eXBlcykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5ID09PSBcImZ1bmN0aW9uXCIpIGVudHJ5ID0gZW50cnkuYmluZCh0aGlzKTtcblx0XHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdChcblx0XHRcdFx0XHRlbnRyeSxcblx0XHRcdFx0XHR0aGlzLmhhbmRsZXIucmVzb2x2ZXIsXG5cdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRwaHJhc2Vcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuXHRcdFx0XHRyZXN1bHRzLnB1c2gocmVzKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdHM7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB3aGVyZSB0aGUgcGFyc2VkIHZhbHVlIG11c3QgYmUgd2l0aGluIGEgcmFuZ2UuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gbWluIC0gTWluaW11bSB2YWx1ZS5cblx0ICogQHBhcmFtIG1heCAtIE1heGltdW0gdmFsdWUuXG5cdCAqIEBwYXJhbSBpbmNsdXNpdmUgLSBXaGV0aGVyIG9yIG5vdCB0byBiZSBpbmNsdXNpdmUgb24gdGhlIHVwcGVyIGJvdW5kLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyByYW5nZShcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsXG5cdFx0bWluOiBudW1iZXIsXG5cdFx0bWF4OiBudW1iZXIsXG5cdFx0aW5jbHVzaXZlID0gZmFsc2Vcblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gQXJndW1lbnQudmFsaWRhdGUodHlwZSwgKG1zZywgcCwgeCkgPT4ge1xuXHRcdFx0LyogZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHZhbGlkLXR5cGVvZiAqL1xuXHRcdFx0Y29uc3QgbyA9XG5cdFx0XHRcdC8vIFNlZSBzcmMvc3RydWN0L0NsaWVudFV0aWwuanM6MzQ1OjRcblx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5cdFx0XHRcdHR5cGVvZiB4ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB4ID09PSBcImJpZ2ludFwiXG5cdFx0XHRcdFx0PyB4XG5cdFx0XHRcdFx0OiB4Lmxlbmd0aCAhPSBudWxsXG5cdFx0XHRcdFx0PyB4Lmxlbmd0aFxuXHRcdFx0XHRcdDogeC5zaXplICE9IG51bGxcblx0XHRcdFx0XHQ/IHguc2l6ZVxuXHRcdFx0XHRcdDogeDtcblxuXHRcdFx0cmV0dXJuIG8gPj0gbWluICYmIChpbmNsdXNpdmUgPyBvIDw9IG1heCA6IG8gPCBtYXgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHRoYXQgcGFyc2VzIGFzIG5vcm1hbCBidXQgYWxzbyB0YWdzIGl0IHdpdGggc29tZSBkYXRhLlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IHRhZywgdmFsdWUgfWAgYW5kIHdyYXBwZWQgaW4gYEZsYWcuZmFpbGAgd2hlbiBmYWlsZWQuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gdGFnIC0gVGFnIHRvIGFkZC4gRGVmYXVsdHMgdG8gdGhlIGB0eXBlYCBhcmd1bWVudCwgc28gdXNlZnVsIGlmIGl0IGlzIGEgc3RyaW5nLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0YWdnZWQoXG5cdFx0dHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLFxuXHRcdHRhZzogYW55ID0gdHlwZVxuXHQpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikgdHlwZSA9IHR5cGUuYmluZCh0aGlzKTtcblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoXG5cdFx0XHRcdHR5cGUsXG5cdFx0XHRcdHRoaXMuaGFuZGxlci5yZXNvbHZlcixcblx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0cGhyYXNlXG5cdFx0XHQpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRcdHJldHVybiBGbGFnLmZhaWwoeyB0YWcsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IHRhZywgdmFsdWU6IHJlcyB9O1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAodW5pb24gdHlwZSkuXG5cdCAqIFRoZSBmaXJzdCB0eXBlIHRoYXQgcmVzb2x2ZXMgdG8gYSBub24tdm9pZCB2YWx1ZSBpcyB1c2VkLlxuXHQgKiBFYWNoIHR5cGUgd2lsbCBhbHNvIGJlIHRhZ2dlZCB1c2luZyBgdGFnZ2VkYCB3aXRoIHRoZW1zZWx2ZXMuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGFnZ2VkVW5pb24oXG5cdFx0Li4udHlwZXM6IChBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpW11cblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0ZW50cnkgPSBBcmd1bWVudC50YWdnZWQoZW50cnkpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KFxuXHRcdFx0XHRcdGVudHJ5LFxuXHRcdFx0XHRcdHRoaXMuaGFuZGxlci5yZXNvbHZlcixcblx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdHBocmFzZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIUFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHRoYXQgcGFyc2VzIGFzIG5vcm1hbCBidXQgYWxzbyB0YWdzIGl0IHdpdGggc29tZSBkYXRhIGFuZCBjYXJyaWVzIHRoZSBvcmlnaW5hbCBpbnB1dC5cblx0ICogUmVzdWx0IGlzIGluIGFuIG9iamVjdCBgeyB0YWcsIGlucHV0LCB2YWx1ZSB9YCBhbmQgd3JhcHBlZCBpbiBgRmxhZy5mYWlsYCB3aGVuIGZhaWxlZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byB1c2UuXG5cdCAqIEBwYXJhbSB0YWcgLSBUYWcgdG8gYWRkLiBEZWZhdWx0cyB0byB0aGUgYHR5cGVgIGFyZ3VtZW50LCBzbyB1c2VmdWwgaWYgaXQgaXMgYSBzdHJpbmcuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHRhZ2dlZFdpdGhJbnB1dChcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsXG5cdFx0dGFnOiBhbnkgPSB0eXBlXG5cdCk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdChcblx0XHRcdFx0dHlwZSxcblx0XHRcdFx0dGhpcy5oYW5kbGVyLnJlc29sdmVyLFxuXHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRwaHJhc2Vcblx0XHRcdCk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdFx0cmV0dXJuIEZsYWcuZmFpbCh7IHRhZywgaW5wdXQ6IHBocmFzZSwgdmFsdWU6IHJlcyB9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHsgdGFnLCBpbnB1dDogcGhyYXNlLCB2YWx1ZTogcmVzIH07XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSBmcm9tIG11bHRpcGxlIHR5cGVzICh1bmlvbiB0eXBlKS5cblx0ICogVGhlIGZpcnN0IHR5cGUgdGhhdCByZXNvbHZlcyB0byBhIG5vbi12b2lkIHZhbHVlIGlzIHVzZWQuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdW5pb24oXG5cdFx0Li4udHlwZXM6IChBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpW11cblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoXG5cdFx0XHRcdFx0ZW50cnksXG5cdFx0XHRcdFx0dGhpcy5oYW5kbGVyLnJlc29sdmVyLFxuXHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0cGhyYXNlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgd2l0aCBleHRyYSB2YWxpZGF0aW9uLlxuXHQgKiBJZiB0aGUgcHJlZGljYXRlIGlzIG5vdCB0cnVlLCB0aGUgdmFsdWUgaXMgY29uc2lkZXJlZCBpbnZhbGlkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHByZWRpY2F0ZSAtIFRoZSBwcmVkaWNhdGUgZnVuY3Rpb24uXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHZhbGlkYXRlKFxuXHRcdHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3Rlcixcblx0XHRwcmVkaWNhdGU6IFBhcnNlZFZhbHVlUHJlZGljYXRlXG5cdCk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdChcblx0XHRcdFx0dHlwZSxcblx0XHRcdFx0dGhpcy5oYW5kbGVyLnJlc29sdmVyLFxuXHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRwaHJhc2Vcblx0XHRcdCk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHRpZiAoIXByZWRpY2F0ZS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBocmFzZSwgcmVzKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBwYXJzZXMgYXMgbm9ybWFsIGJ1dCBhbHNvIGNhcnJpZXMgdGhlIG9yaWdpbmFsIGlucHV0LlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IGlucHV0LCB2YWx1ZSB9YCBhbmQgd3JhcHBlZCBpbiBgRmxhZy5mYWlsYCB3aGVuIGZhaWxlZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHdpdGhJbnB1dChcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXJcblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHR5cGUgPSB0eXBlLmJpbmQodGhpcyk7XG5cdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KFxuXHRcdFx0XHR0eXBlLFxuXHRcdFx0XHR0aGlzLmhhbmRsZXIucmVzb2x2ZXIsXG5cdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdHBocmFzZVxuXHRcdFx0KTtcblx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkge1xuXHRcdFx0XHRyZXR1cm4gRmxhZy5mYWlsKHsgaW5wdXQ6IHBocmFzZSwgdmFsdWU6IHJlcyB9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHsgaW5wdXQ6IHBocmFzZSwgdmFsdWU6IHJlcyB9O1xuXHRcdH07XG5cdH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciBob3cgYW4gYXJndW1lbnQgcGFyc2VzIHRleHQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXJndW1lbnRPcHRpb25zIHtcblx0LyoqXG5cdCAqIERlZmF1bHQgdmFsdWUgaWYgbm8gaW5wdXQgb3IgZGlkIG5vdCBjYXN0IGNvcnJlY3RseS5cblx0ICogSWYgdXNpbmcgYSBmbGFnIG1hdGNoLCBzZXR0aW5nIHRoZSBkZWZhdWx0IHZhbHVlIHRvIGEgbm9uLXZvaWQgdmFsdWUgaW52ZXJzZXMgdGhlIHJlc3VsdC5cblx0ICovXG5cdGRlZmF1bHQ/OiBEZWZhdWx0VmFsdWVTdXBwbGllciB8IGFueTtcblxuXHQvKiogVGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBhcmd1bWVudCAqL1xuXHRkZXNjcmlwdGlvbj86IHN0cmluZyB8IGFueSB8IGFueVtdO1xuXG5cdC8qKiBUaGUgc3RyaW5nKHMpIHRvIHVzZSBhcyB0aGUgZmxhZyBmb3IgZmxhZyBvciBvcHRpb24gbWF0Y2guICovXG5cdGZsYWc/OiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuXHQvKiogIElEIG9mIHRoZSBhcmd1bWVudCBmb3IgdXNlIGluIHRoZSBhcmdzIG9iamVjdC4gVGhpcyBkb2VzIG5vdGhpbmcgaW5zaWRlIGFuIEFyZ3VtZW50R2VuZXJhdG9yLiAqL1xuXHRpZD86IHN0cmluZztcblxuXHQvKipcblx0ICogSW5kZXggb2YgcGhyYXNlIHRvIHN0YXJ0IGZyb20uIEFwcGxpY2FibGUgdG8gcGhyYXNlLCB0ZXh0LCBjb250ZW50LCByZXN0LCBvciBzZXBhcmF0ZSBtYXRjaCBvbmx5LlxuXHQgKiBJZ25vcmVkIHdoZW4gdXNlZCB3aXRoIHRoZSB1bm9yZGVyZWQgb3B0aW9uLlxuXHQgKi9cblx0aW5kZXg/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIEFtb3VudCBvZiBwaHJhc2VzIHRvIG1hdGNoIHdoZW4gbWF0Y2hpbmcgbW9yZSB0aGFuIG9uZS5cblx0ICogQXBwbGljYWJsZSB0byB0ZXh0LCBjb250ZW50LCByZXN0LCBvciBzZXBhcmF0ZSBtYXRjaCBvbmx5LlxuXHQgKiBEZWZhdWx0cyB0byBpbmZpbml0eS5cblx0ICovXG5cdGxpbWl0PzogbnVtYmVyO1xuXG5cdC8qKiBNZXRob2QgdG8gbWF0Y2ggdGV4dC4gRGVmYXVsdHMgdG8gJ3BocmFzZScuICovXG5cdG1hdGNoPzogQXJndW1lbnRNYXRjaDtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IG90aGVyd2lzZSBjb250ZW50LiAqL1xuXHRtb2RpZnlPdGhlcndpc2U/OiBPdGhlcndpc2VDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRvIGhhdmUgZmxhZ3MgcHJvY2VzcyBtdWx0aXBsZSBpbnB1dHMuXG5cdCAqIEZvciBvcHRpb24gZmxhZ3MsIHRoaXMgd29ya3MgbGlrZSB0aGUgc2VwYXJhdGUgbWF0Y2g7IHRoZSBsaW1pdCBvcHRpb24gd2lsbCBhbHNvIHdvcmsgaGVyZS5cblx0ICogRm9yIGZsYWdzLCB0aGlzIHdpbGwgY291bnQgdGhlIG51bWJlciBvZiBvY2N1cnJlbmNlcy5cblx0ICovXG5cdG11bHRpcGxlRmxhZ3M/OiBib29sZWFuO1xuXG5cdC8qKiBUZXh0IHNlbnQgaWYgYXJndW1lbnQgcGFyc2luZyBmYWlscy4gVGhpcyBvdmVycmlkZXMgdGhlIGBkZWZhdWx0YCBvcHRpb24gYW5kIGFsbCBwcm9tcHQgb3B0aW9ucy4gKi9cblx0b3RoZXJ3aXNlPzpcblx0XHR8IHN0cmluZ1xuXHRcdHwgTWVzc2FnZVBheWxvYWRcblx0XHR8IE1lc3NhZ2VPcHRpb25zXG5cdFx0fCBPdGhlcndpc2VDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIFByb21wdCBvcHRpb25zIGZvciB3aGVuIHVzZXIgZG9lcyBub3QgcHJvdmlkZSBpbnB1dC4gKi9cblx0cHJvbXB0PzogQXJndW1lbnRQcm9tcHRPcHRpb25zIHwgYm9vbGVhbjtcblxuXHQvKiogVHlwZSB0byBjYXN0IHRvLiAqL1xuXHR0eXBlPzogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyO1xuXG5cdC8qKlxuXHQgKiBNYXJrcyB0aGUgYXJndW1lbnQgYXMgdW5vcmRlcmVkLlxuXHQgKiBFYWNoIHBocmFzZSBpcyBldmFsdWF0ZWQgaW4gb3JkZXIgdW50aWwgb25lIG1hdGNoZXMgKG5vIGlucHV0IGF0IGFsbCBtZWFucyBubyBldmFsdWF0aW9uKS5cblx0ICogUGFzc2luZyBpbiBhIG51bWJlciBmb3JjZXMgZXZhbHVhdGlvbiBmcm9tIHRoYXQgaW5kZXggb253YXJkcy5cblx0ICogUGFzc2luZyBpbiBhbiBhcnJheSBvZiBudW1iZXJzIGZvcmNlcyBldmFsdWF0aW9uIG9uIHRob3NlIGluZGljZXMgb25seS5cblx0ICogSWYgdGhlcmUgaXMgYSBtYXRjaCwgdGhhdCBpbmRleCBpcyBjb25zaWRlcmVkIHVzZWQgYW5kIGZ1dHVyZSB1bm9yZGVyZWQgYXJncyB3aWxsIG5vdCBjaGVjayB0aGF0IGluZGV4IGFnYWluLlxuXHQgKiBJZiB0aGVyZSBpcyBubyBtYXRjaCwgdGhlbiB0aGUgcHJvbXB0aW5nIG9yIGRlZmF1bHQgdmFsdWUgaXMgdXNlZC5cblx0ICogQXBwbGljYWJsZSB0byBwaHJhc2UgbWF0Y2ggb25seS5cblx0ICovXG5cdHVub3JkZXJlZD86IGJvb2xlYW4gfCBudW1iZXIgfCBudW1iZXJbXTtcbn1cblxuLyoqXG4gKiBEYXRhIHBhc3NlZCB0byBhcmd1bWVudCBwcm9tcHQgZnVuY3Rpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50UHJvbXB0RGF0YSB7XG5cdC8qKiBXaGV0aGVyIHRoZSBwcm9tcHQgaXMgaW5maW5pdGUgb3Igbm90LiAqL1xuXHRpbmZpbml0ZTogYm9vbGVhbjtcblxuXHQvKiogVGhlIG1lc3NhZ2UgdGhhdCBjYXVzZWQgdGhlIHByb21wdC4gKi9cblx0bWVzc2FnZTogTWVzc2FnZTtcblxuXHQvKiogQW1vdW50IG9mIHJldHJpZXMgc28gZmFyLiAqL1xuXHRyZXRyaWVzOiBudW1iZXI7XG5cblx0LyoqIFRoZSBpbnB1dCBwaHJhc2UgdGhhdCBjYXVzZWQgdGhlIHByb21wdCBpZiB0aGVyZSB3YXMgb25lLCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nLiAqL1xuXHRwaHJhc2U6IHN0cmluZztcblxuXHQvKiogVGhlIHZhbHVlIHRoYXQgZmFpbGVkIGlmIHRoZXJlIHdhcyBvbmUsIG90aGVyd2lzZSBudWxsLiAqL1xuXHRmYWlsdXJlOiB2b2lkIHwgKEZsYWcgJiB7IHZhbHVlOiBhbnkgfSk7XG59XG5cbi8qKlxuICogQSBwcm9tcHQgdG8gcnVuIGlmIHRoZSB1c2VyIGRpZCBub3QgaW5wdXQgdGhlIGFyZ3VtZW50IGNvcnJlY3RseS5cbiAqIENhbiBvbmx5IGJlIHVzZWQgaWYgdGhlcmUgaXMgbm90IGEgZGVmYXVsdCB2YWx1ZSAodW5sZXNzIG9wdGlvbmFsIGlzIHRydWUpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50UHJvbXB0T3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBXaGVuZXZlciBhbiBpbnB1dCBtYXRjaGVzIHRoZSBmb3JtYXQgb2YgYSBjb21tYW5kLCB0aGlzIG9wdGlvbiBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0byBjYW5jZWwgdGhpcyBjb21tYW5kIGFuZCBydW4gdGhhdCBjb21tYW5kLlxuXHQgKiBUaGUgY29tbWFuZCB0byBiZSBydW4gbWF5IGJlIHRoZSBzYW1lIGNvbW1hbmQgb3Igc29tZSBvdGhlciBjb21tYW5kLlxuXHQgKiBEZWZhdWx0cyB0byB0cnVlLFxuXHQgKi9cblx0YnJlYWtvdXQ/OiBib29sZWFuO1xuXG5cdC8qKiBUZXh0IHNlbnQgb24gY2FuY2VsbGF0aW9uIG9mIGNvbW1hbmQuICovXG5cdGNhbmNlbD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIFdvcmQgdG8gdXNlIGZvciBjYW5jZWxsaW5nIHRoZSBjb21tYW5kLiBEZWZhdWx0cyB0byAnY2FuY2VsJy4gKi9cblx0Y2FuY2VsV29yZD86IHN0cmluZztcblxuXHQvKiogVGV4dCBzZW50IG9uIGFtb3VudCBvZiB0cmllcyByZWFjaGluZyB0aGUgbWF4LiAqL1xuXHRlbmRlZD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFByb21wdHMgZm9yZXZlciB1bnRpbCB0aGUgc3RvcCB3b3JkLCBjYW5jZWwgd29yZCwgdGltZSBsaW1pdCwgb3IgcmV0cnkgbGltaXQuXG5cdCAqIE5vdGUgdGhhdCB0aGUgcmV0cnkgY291bnQgcmVzZXRzIGJhY2sgdG8gb25lIG9uIGVhY2ggdmFsaWQgZW50cnkuXG5cdCAqIFRoZSBmaW5hbCBldmFsdWF0ZWQgYXJndW1lbnQgd2lsbCBiZSBhbiBhcnJheSBvZiB0aGUgaW5wdXRzLlxuXHQgKiBEZWZhdWx0cyB0byBmYWxzZS5cblx0ICovXG5cdGluZmluaXRlPzogYm9vbGVhbjtcblxuXHQvKiogQW1vdW50IG9mIGlucHV0cyBhbGxvd2VkIGZvciBhbiBpbmZpbml0ZSBwcm9tcHQgYmVmb3JlIGZpbmlzaGluZy4gRGVmYXVsdHMgdG8gSW5maW5pdHkuICovXG5cdGxpbWl0PzogbnVtYmVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgY2FuY2VsIG1lc3NhZ2VzLiAqL1xuXHRtb2RpZnlDYW5jZWw/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdXQgb2YgdHJpZXMgbWVzc2FnZXMuICovXG5cdG1vZGlmeUVuZGVkPzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgcmV0cnkgcHJvbXB0cy4gKi9cblx0bW9kaWZ5UmV0cnk/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSBzdGFydCBwcm9tcHRzLiAqL1xuXHRtb2RpZnlTdGFydD86IFByb21wdENvbnRlbnRNb2RpZmllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IHRpbWVvdXQgbWVzc2FnZXMuICovXG5cdG1vZGlmeVRpbWVvdXQ/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIFByb21wdHMgb25seSB3aGVuIGFyZ3VtZW50IGlzIHByb3ZpZGVkIGJ1dCB3YXMgbm90IG9mIHRoZSByaWdodCB0eXBlLiBEZWZhdWx0cyB0byBmYWxzZS4gKi9cblx0b3B0aW9uYWw/OiBib29sZWFuO1xuXG5cdC8qKiBBbW91bnQgb2YgcmV0cmllcyBhbGxvd2VkLiBEZWZhdWx0cyB0byAxLiAqL1xuXHRyZXRyaWVzPzogbnVtYmVyO1xuXG5cdC8qKiBUZXh0IHNlbnQgb24gYSByZXRyeSAoZmFpbHVyZSB0byBjYXN0IHR5cGUpLiAqL1xuXHRyZXRyeT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIFRleHQgc2VudCBvbiBzdGFydCBvZiBwcm9tcHQuICovXG5cdHN0YXJ0Pzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21wdENvbnRlbnRTdXBwbGllcjtcblxuXHQvKiogV29yZCB0byB1c2UgZm9yIGVuZGluZyBpbmZpbml0ZSBwcm9tcHRzLiBEZWZhdWx0cyB0byAnc3RvcCcuICovXG5cdHN0b3BXb3JkPzogc3RyaW5nO1xuXG5cdC8qKiBUaW1lIHRvIHdhaXQgZm9yIGlucHV0LiBEZWZhdWx0cyB0byAzMDAwMC4gKi9cblx0dGltZT86IG51bWJlcjtcblxuXHQvKiogVGV4dCBzZW50IG9uIGNvbGxlY3RvciB0aW1lIG91dC4gKi9cblx0dGltZW91dD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG59XG5cbi8qKlxuICogVGhlIG1ldGhvZCB0byBtYXRjaCBhcmd1bWVudHMgZnJvbSB0ZXh0LlxuICogLSBgcGhyYXNlYCBtYXRjaGVzIGJ5IHRoZSBvcmRlciBvZiB0aGUgcGhyYXNlcyBpbnB1dHRlZC5cbiAqIEl0IGlnbm9yZXMgcGhyYXNlcyB0aGF0IG1hdGNoZXMgYSBmbGFnLlxuICogLSBgZmxhZ2AgbWF0Y2hlcyBwaHJhc2VzIHRoYXQgYXJlIHRoZSBzYW1lIGFzIGl0cyBmbGFnLlxuICogVGhlIGV2YWx1YXRlZCBhcmd1bWVudCBpcyBlaXRoZXIgdHJ1ZSBvciBmYWxzZS5cbiAqIC0gYG9wdGlvbmAgbWF0Y2hlcyBwaHJhc2VzIHRoYXQgc3RhcnRzIHdpdGggdGhlIGZsYWcuXG4gKiBUaGUgcGhyYXNlIGFmdGVyIHRoZSBmbGFnIGlzIHRoZSBldmFsdWF0ZWQgYXJndW1lbnQuXG4gKiAtIGByZXN0YCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSBwaHJhc2VzLlxuICogSXQgaWdub3JlcyBwaHJhc2VzIHRoYXQgbWF0Y2hlcyBhIGZsYWcuXG4gKiBJdCBwcmVzZXJ2ZXMgdGhlIG9yaWdpbmFsIHdoaXRlc3BhY2UgYmV0d2VlbiBwaHJhc2VzIGFuZCB0aGUgcXVvdGVzIGFyb3VuZCBwaHJhc2VzLlxuICogLSBgc2VwYXJhdGVgIG1hdGNoZXMgdGhlIHJlc3Qgb2YgdGhlIHBocmFzZXMgYW5kIHByb2Nlc3NlcyBlYWNoIGluZGl2aWR1YWxseS5cbiAqIEl0IGlnbm9yZXMgcGhyYXNlcyB0aGF0IG1hdGNoZXMgYSBmbGFnLlxuICogLSBgdGV4dGAgbWF0Y2hlcyB0aGUgZW50aXJlIHRleHQsIGV4Y2VwdCBmb3IgdGhlIGNvbW1hbmQuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIEl0IHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgd2hpdGVzcGFjZSBiZXR3ZWVuIHBocmFzZXMgYW5kIHRoZSBxdW90ZXMgYXJvdW5kIHBocmFzZXMuXG4gKiAtIGBjb250ZW50YCBtYXRjaGVzIHRoZSBlbnRpcmUgdGV4dCBhcyBpdCB3YXMgaW5wdXR0ZWQsIGV4Y2VwdCBmb3IgdGhlIGNvbW1hbmQuXG4gKiBJdCBwcmVzZXJ2ZXMgdGhlIG9yaWdpbmFsIHdoaXRlc3BhY2UgYmV0d2VlbiBwaHJhc2VzIGFuZCB0aGUgcXVvdGVzIGFyb3VuZCBwaHJhc2VzLlxuICogLSBgcmVzdENvbnRlbnRgIG1hdGNoZXMgdGhlIHJlc3Qgb2YgdGhlIHRleHQgYXMgaXQgd2FzIGlucHV0dGVkLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYG5vbmVgIG1hdGNoZXMgbm90aGluZyBhdCBhbGwgYW5kIGFuIGVtcHR5IHN0cmluZyB3aWxsIGJlIHVzZWQgZm9yIHR5cGUgb3BlcmF0aW9ucy5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRNYXRjaCA9XG5cdHwgXCJwaHJhc2VcIlxuXHR8IFwiZmxhZ1wiXG5cdHwgXCJvcHRpb25cIlxuXHR8IFwicmVzdFwiXG5cdHwgXCJzZXBhcmF0ZVwiXG5cdHwgXCJ0ZXh0XCJcblx0fCBcImNvbnRlbnRcIlxuXHR8IFwicmVzdENvbnRlbnRcIlxuXHR8IFwibm9uZVwiO1xuXG4vKipcbiAqIFRoZSB0eXBlIHRoYXQgdGhlIGFyZ3VtZW50IHNob3VsZCBiZSBjYXN0IHRvLlxuICogLSBgc3RyaW5nYCBkb2VzIG5vdCBjYXN0IHRvIGFueSB0eXBlLlxuICogLSBgbG93ZXJjYXNlYCBtYWtlcyB0aGUgaW5wdXQgbG93ZXJjYXNlLlxuICogLSBgdXBwZXJjYXNlYCBtYWtlcyB0aGUgaW5wdXQgdXBwZXJjYXNlLlxuICogLSBgY2hhckNvZGVzYCB0cmFuc2Zvcm1zIHRoZSBpbnB1dCB0byBhbiBhcnJheSBvZiBjaGFyIGNvZGVzLlxuICogLSBgbnVtYmVyYCBjYXN0cyB0byBhIG51bWJlci5cbiAqIC0gYGludGVnZXJgIGNhc3RzIHRvIGFuIGludGVnZXIuXG4gKiAtIGBiaWdpbnRgIGNhc3RzIHRvIGEgYmlnIGludGVnZXIuXG4gKiAtIGB1cmxgIGNhc3RzIHRvIGFuIGBVUkxgIG9iamVjdC5cbiAqIC0gYGRhdGVgIGNhc3RzIHRvIGEgYERhdGVgIG9iamVjdC5cbiAqIC0gYGNvbG9yYCBjYXN0cyBhIGhleCBjb2RlIHRvIGFuIGludGVnZXIuXG4gKiAtIGBjb21tYW5kQWxpYXNgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBjb21tYW5kIGZyb20gYW4gYWxpYXMuXG4gKiAtIGBjb21tYW5kYCBtYXRjaGVzIHRoZSBJRCBvZiBhIGNvbW1hbmQuXG4gKiAtIGBpbmhpYml0b3JgIG1hdGNoZXMgdGhlIElEIG9mIGFuIGluaGliaXRvci5cbiAqIC0gYGxpc3RlbmVyYCBtYXRjaGVzIHRoZSBJRCBvZiBhIGxpc3RlbmVyLlxuICpcbiAqIFBvc3NpYmxlIERpc2NvcmQtcmVsYXRlZCB0eXBlcy5cbiAqIFRoZXNlIHR5cGVzIGNhbiBiZSBwbHVyYWwgKGFkZCBhbiAncycgdG8gdGhlIGVuZCkgYW5kIGEgY29sbGVjdGlvbiBvZiBtYXRjaGluZyBvYmplY3RzIHdpbGwgYmUgdXNlZC5cbiAqIC0gYHVzZXJgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB1c2VyLlxuICogLSBgbWVtYmVyYCB0cmllcyB0byByZXNvbHZlIHRvIGEgbWVtYmVyLlxuICogLSBgcmVsZXZhbnRgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSByZWxldmFudCB1c2VyLCB3b3JrcyBpbiBib3RoIGd1aWxkcyBhbmQgRE1zLlxuICogLSBgY2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIGNoYW5uZWwuXG4gKiAtIGB0ZXh0Q2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHRleHQgY2hhbm5lbC5cbiAqIC0gYHZvaWNlQ2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHZvaWNlIGNoYW5uZWwuXG4gKiAtIGBzdGFnZUNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBzdGFnZSBjaGFubmVsLlxuICogLSBgdGhyZWFkQ2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSBhIHRocmVhZCBjaGFubmVsLlxuICogLSBgcm9sZWAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHJvbGUuXG4gKiAtIGBlbW9qaWAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIGN1c3RvbSBlbW9qaS5cbiAqIC0gYGd1aWxkYCB0cmllcyB0byByZXNvbHZlIHRvIGEgZ3VpbGQuXG4gKlxuICogT3RoZXIgRGlzY29yZC1yZWxhdGVkIHR5cGVzOlxuICogLSBgbWVzc2FnZWAgdHJpZXMgdG8gZmV0Y2ggYSBtZXNzYWdlIGZyb20gYW4gSUQgd2l0aGluIHRoZSBjaGFubmVsLlxuICogLSBgZ3VpbGRNZXNzYWdlYCB0cmllcyB0byBmZXRjaCBhIG1lc3NhZ2UgZnJvbSBhbiBJRCB3aXRoaW4gdGhlIGd1aWxkLlxuICogLSBgcmVsZXZhbnRNZXNzYWdlYCBpcyBhIGNvbWJpbmF0aW9uIG9mIHRoZSBhYm92ZSwgd29ya3MgaW4gYm90aCBndWlsZHMgYW5kIERNcy5cbiAqIC0gYGludml0ZWAgdHJpZXMgdG8gZmV0Y2ggYW4gaW52aXRlIG9iamVjdCBmcm9tIGEgbGluay5cbiAqIC0gYHVzZXJNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhIHVzZXIuXG4gKiAtIGBtZW1iZXJNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhIGd1aWxkIG1lbWJlci5cbiAqIC0gYGNoYW5uZWxNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhIGNoYW5uZWwuXG4gKiAtIGByb2xlTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSByb2xlLlxuICogLSBgZW1vamlNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhbiBlbW9qaS5cbiAqXG4gKiBBbiBhcnJheSBvZiBzdHJpbmdzIGNhbiBiZSB1c2VkIHRvIHJlc3RyaWN0IGlucHV0IHRvIG9ubHkgdGhvc2Ugc3RyaW5ncywgY2FzZSBpbnNlbnNpdGl2ZS5cbiAqIFRoZSBhcnJheSBjYW4gYWxzbyBjb250YWluIGFuIGlubmVyIGFycmF5IG9mIHN0cmluZ3MsIGZvciBhbGlhc2VzLlxuICogSWYgc28sIHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkgd2lsbCBiZSB1c2VkIGFzIHRoZSBmaW5hbCBhcmd1bWVudC5cbiAqXG4gKiBBIHJlZ3VsYXIgZXhwcmVzc2lvbiBjYW4gYWxzbyBiZSB1c2VkLlxuICogVGhlIGV2YWx1YXRlZCBhcmd1bWVudCB3aWxsIGJlIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBgbWF0Y2hgIGFuZCBgbWF0Y2hlc2AgaWYgZ2xvYmFsLlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudFR5cGUgPVxuXHR8IFwic3RyaW5nXCJcblx0fCBcImxvd2VyY2FzZVwiXG5cdHwgXCJ1cHBlcmNhc2VcIlxuXHR8IFwiY2hhckNvZGVzXCJcblx0fCBcIm51bWJlclwiXG5cdHwgXCJpbnRlZ2VyXCJcblx0fCBcImJpZ2ludFwiXG5cdHwgXCJlbW9qaW50XCJcblx0fCBcInVybFwiXG5cdHwgXCJkYXRlXCJcblx0fCBcImNvbG9yXCJcblx0fCBcInVzZXJcIlxuXHR8IFwidXNlcnNcIlxuXHR8IFwibWVtYmVyXCJcblx0fCBcIm1lbWJlcnNcIlxuXHR8IFwicmVsZXZhbnRcIlxuXHR8IFwicmVsZXZhbnRzXCJcblx0fCBcImNoYW5uZWxcIlxuXHR8IFwiY2hhbm5lbHNcIlxuXHR8IFwidGV4dENoYW5uZWxcIlxuXHR8IFwidGV4dENoYW5uZWxzXCJcblx0fCBcInZvaWNlQ2hhbm5lbFwiXG5cdHwgXCJ2b2ljZUNoYW5uZWxzXCJcblx0fCBcImNhdGVnb3J5Q2hhbm5lbFwiXG5cdHwgXCJjYXRlZ29yeUNoYW5uZWxzXCJcblx0fCBcIm5ld3NDaGFubmVsXCJcblx0fCBcIm5ld3NDaGFubmVsc1wiXG5cdHwgXCJzdG9yZUNoYW5uZWxcIlxuXHR8IFwic3RvcmVDaGFubmVsc1wiXG5cdHwgXCJzdGFnZUNoYW5uZWxcIlxuXHR8IFwic3RhZ2VDaGFubmVsc1wiXG5cdHwgXCJ0aHJlYWRDaGFubmVsXCJcblx0fCBcInRocmVhZENoYW5uZWxzXCJcblx0fCBcInJvbGVcIlxuXHR8IFwicm9sZXNcIlxuXHR8IFwiZW1vamlcIlxuXHR8IFwiZW1vamlzXCJcblx0fCBcImd1aWxkXCJcblx0fCBcImd1aWxkc1wiXG5cdHwgXCJtZXNzYWdlXCJcblx0fCBcImd1aWxkTWVzc2FnZVwiXG5cdHwgXCJyZWxldmFudE1lc3NhZ2VcIlxuXHR8IFwiaW52aXRlXCJcblx0fCBcInVzZXJNZW50aW9uXCJcblx0fCBcIm1lbWJlck1lbnRpb25cIlxuXHR8IFwiY2hhbm5lbE1lbnRpb25cIlxuXHR8IFwicm9sZU1lbnRpb25cIlxuXHR8IFwiZW1vamlNZW50aW9uXCJcblx0fCBcImNvbW1hbmRBbGlhc1wiXG5cdHwgXCJjb21tYW5kXCJcblx0fCBcImluaGliaXRvclwiXG5cdHwgXCJsaXN0ZW5lclwiXG5cdHwgKHN0cmluZyB8IHN0cmluZ1tdKVtdXG5cdHwgUmVnRXhwXG5cdHwgc3RyaW5nO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gZm9yIHByb2Nlc3NpbmcgdXNlciBpbnB1dCB0byB1c2UgYXMgYW4gYXJndW1lbnQuXG4gKiBBIHZvaWQgcmV0dXJuIHZhbHVlIHdpbGwgdXNlIHRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGUgYXJndW1lbnQgb3Igc3RhcnQgYSBwcm9tcHQuXG4gKiBBbnkgb3RoZXIgdHJ1dGh5IHJldHVybiB2YWx1ZSB3aWxsIGJlIHVzZWQgYXMgdGhlIGV2YWx1YXRlZCBhcmd1bWVudC5cbiAqIElmIHJldHVybmluZyBhIFByb21pc2UsIHRoZSByZXNvbHZlZCB2YWx1ZSB3aWxsIGdvIHRocm91Z2ggdGhlIGFib3ZlIHN0ZXBzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHBocmFzZSAtIFRoZSB1c2VyIGlucHV0LlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudFR5cGVDYXN0ZXIgPSAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IGFueTtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGZvciBwcm9jZXNzaW5nIHNvbWUgdmFsdWUgdG8gdXNlIGFzIGFuIGFyZ3VtZW50LlxuICogVGhpcyBpcyBtYWlubHkgdXNlZCBpbiBjb21wb3NpbmcgYXJndW1lbnQgdHlwZXMuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gdmFsdWUgLSBTb21lIHZhbHVlLlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudFR5cGVDYXN0ZXJfID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIHZhbHVlOiBhbnkpID0+IGFueTtcblxuLyoqXG4gKiBEYXRhIHBhc3NlZCB0byBmdW5jdGlvbnMgdGhhdCBydW4gd2hlbiB0aGluZ3MgZmFpbGVkLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZhaWx1cmVEYXRhIHtcblx0LyoqIFRoZSBpbnB1dCBwaHJhc2UgdGhhdCBmYWlsZWQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZy4gKi9cblx0cGhyYXNlOiBzdHJpbmc7XG5cblx0LyoqIFRoZSB2YWx1ZSB0aGF0IGZhaWxlZCBpZiB0aGVyZSB3YXMgb25lLCBvdGhlcndpc2UgbnVsbC4gKi9cblx0ZmFpbHVyZTogdm9pZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pO1xufVxuXG4vKipcbiAqIERlZmF1bHRzIGZvciBhcmd1bWVudCBvcHRpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRBcmd1bWVudE9wdGlvbnMge1xuXHQvKiogRGVmYXVsdCBwcm9tcHQgb3B0aW9ucy4gKi9cblx0cHJvbXB0PzogQXJndW1lbnRQcm9tcHRPcHRpb25zO1xuXG5cdC8qKiBEZWZhdWx0IHRleHQgc2VudCBpZiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLiAqL1xuXHRvdGhlcndpc2U/OlxuXHRcdHwgc3RyaW5nXG5cdFx0fCBNZXNzYWdlUGF5bG9hZFxuXHRcdHwgTWVzc2FnZU9wdGlvbnNcblx0XHR8IE90aGVyd2lzZUNvbnRlbnRTdXBwbGllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IG90aGVyd2lzZSBjb250ZW50LiAqL1xuXHRtb2RpZnlPdGhlcndpc2U/OiBPdGhlcndpc2VDb250ZW50TW9kaWZpZXI7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBhcmd1bWVudC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBEZWZhdWx0VmFsdWVTdXBwbGllciA9IChtZXNzYWdlOiBNZXNzYWdlLCBkYXRhOiBGYWlsdXJlRGF0YSkgPT4gYW55O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gZm9yIHZhbGlkYXRpbmcgcGFyc2VkIGFyZ3VtZW50cy5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBwaHJhc2UgLSBUaGUgdXNlciBpbnB1dC5cbiAqIEBwYXJhbSB2YWx1ZSAtIFRoZSBwYXJzZWQgdmFsdWUuXG4gKi9cbmV4cG9ydCB0eXBlIFBhcnNlZFZhbHVlUHJlZGljYXRlID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRwaHJhc2U6IHN0cmluZyxcblx0dmFsdWU6IGFueVxuKSA9PiBib29sZWFuO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gbW9kaWZ5aW5nIGEgcHJvbXB0IHRleHQuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIE90aGVyd2lzZUNvbnRlbnRNb2RpZmllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0dGV4dDogc3RyaW5nLFxuXHRkYXRhOiBGYWlsdXJlRGF0YVxuKSA9PlxuXHR8IHN0cmluZ1xuXHR8IE1lc3NhZ2VQYXlsb2FkXG5cdHwgTWVzc2FnZU9wdGlvbnNcblx0fCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRoZSBjb250ZW50IGlmIGFyZ3VtZW50IHBhcnNpbmcgZmFpbHMuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgT3RoZXJ3aXNlQ29udGVudFN1cHBsaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRkYXRhOiBGYWlsdXJlRGF0YVxuKSA9PlxuXHR8IHN0cmluZ1xuXHR8IE1lc3NhZ2VQYXlsb2FkXG5cdHwgTWVzc2FnZU9wdGlvbnNcblx0fCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gbW9kaWZ5aW5nIGEgcHJvbXB0IHRleHQuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gdGV4dCAtIFRleHQgZnJvbSB0aGUgcHJvbXB0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBQcm9tcHRDb250ZW50TW9kaWZpZXIgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdHRleHQ6IHN0cmluZyxcblx0ZGF0YTogQXJndW1lbnRQcm9tcHREYXRhXG4pID0+XG5cdHwgc3RyaW5nXG5cdHwgTWVzc2FnZVBheWxvYWRcblx0fCBNZXNzYWdlT3B0aW9uc1xuXHR8IFByb21pc2U8c3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucz47XG5cbi8qKlxuICogQSBmdW5jdGlvbiByZXR1cm5pbmcgdGV4dCBmb3IgdGhlIHByb21wdC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBQcm9tcHRDb250ZW50U3VwcGxpZXIgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdGRhdGE6IEFyZ3VtZW50UHJvbXB0RGF0YVxuKSA9PlxuXHR8IHN0cmluZ1xuXHR8IE1lc3NhZ2VQYXlsb2FkXG5cdHwgTWVzc2FnZU9wdGlvbnNcblx0fCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuIl19
