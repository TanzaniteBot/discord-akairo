"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
            const o = typeof x === "number" || typeof x === "bigint"
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVEQUF5RTtBQUN6RSxtREFBMkI7QUFDM0IsOERBQXNDO0FBT3RDOzs7O0dBSUc7QUFDSCxNQUFxQixRQUFRO0lBQzVCLFlBQ0MsT0FBZ0IsRUFDaEIsRUFDQyxLQUFLLEdBQUcsMkJBQWUsQ0FBQyxNQUFNLEVBQzlCLElBQUksR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFDM0IsSUFBSSxHQUFHLElBQUksRUFDWCxhQUFhLEdBQUcsS0FBSyxFQUNyQixLQUFLLEdBQUcsSUFBSSxFQUNaLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLEtBQUssR0FBRyxRQUFRLEVBQ2hCLE1BQU0sR0FBRyxJQUFJLEVBQ2IsT0FBTyxFQUFFLFlBQVksR0FBRyxJQUFJLEVBQzVCLFNBQVMsR0FBRyxJQUFJLEVBQ2hCLGVBQWUsR0FBRyxJQUFJLEtBQ0YsRUFBRTtRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRWhFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBRW5DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxNQUFNLEdB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QUM5QixJQUFJLEVBQ0osSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQ3JCLE9BQU8sRUFDUCxNQUFNLENBQ04sQ0FBQztZQUNGLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsT0FBTyxjQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQzthQUNoRDtZQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUN0QyxDQUFDLENBQUM7SUFDSCxDQUFDO0NBQ0Q7QUFudUJELDJCQW11QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcmd1bWVudE1hdGNoZXMsIEFyZ3VtZW50VHlwZXMgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBGbGFnIGZyb20gXCIuLi9GbGFnXCI7XG5pbXBvcnQgVXRpbCBmcm9tIFwiLi4vLi4vLi4vdXRpbC9VdGlsXCI7XG5pbXBvcnQgQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFwiO1xuaW1wb3J0IHsgTWVzc2FnZSwgTWVzc2FnZVBheWxvYWQsIE1lc3NhZ2VPcHRpb25zIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCBUeXBlUmVzb2x2ZXIgZnJvbSBcIi4vVHlwZVJlc29sdmVyXCI7XG5pbXBvcnQgQ29tbWFuZEhhbmRsZXIgZnJvbSBcIi4uL0NvbW1hbmRIYW5kbGVyXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi8uLi9Ba2Fpcm9DbGllbnRcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGFyZ3VtZW50IGZvciBhIGNvbW1hbmQuXG4gKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgb2YgdGhlIGFyZ3VtZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIGZvciB0aGUgYXJndW1lbnQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFyZ3VtZW50IHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0e1xuXHRcdFx0bWF0Y2ggPSBBcmd1bWVudE1hdGNoZXMuUEhSQVNFLFxuXHRcdFx0dHlwZSA9IEFyZ3VtZW50VHlwZXMuU1RSSU5HLFxuXHRcdFx0ZmxhZyA9IG51bGwsXG5cdFx0XHRtdWx0aXBsZUZsYWdzID0gZmFsc2UsXG5cdFx0XHRpbmRleCA9IG51bGwsXG5cdFx0XHR1bm9yZGVyZWQgPSBmYWxzZSxcblx0XHRcdGxpbWl0ID0gSW5maW5pdHksXG5cdFx0XHRwcm9tcHQgPSBudWxsLFxuXHRcdFx0ZGVmYXVsdDogZGVmYXVsdFZhbHVlID0gbnVsbCxcblx0XHRcdG90aGVyd2lzZSA9IG51bGwsXG5cdFx0XHRtb2RpZnlPdGhlcndpc2UgPSBudWxsXG5cdFx0fTogQXJndW1lbnRPcHRpb25zID0ge31cblx0KSB7XG5cdFx0dGhpcy5jb21tYW5kID0gY29tbWFuZDtcblxuXHRcdHRoaXMubWF0Y2ggPSBtYXRjaDtcblxuXHRcdHRoaXMudHlwZSA9IHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIgPyB0eXBlLmJpbmQodGhpcykgOiB0eXBlO1xuXG5cdFx0dGhpcy5mbGFnID0gZmxhZztcblxuXHRcdHRoaXMubXVsdGlwbGVGbGFncyA9IG11bHRpcGxlRmxhZ3M7XG5cblx0XHR0aGlzLmluZGV4ID0gaW5kZXg7XG5cblx0XHR0aGlzLnVub3JkZXJlZCA9IHVub3JkZXJlZDtcblxuXHRcdHRoaXMubGltaXQgPSBsaW1pdDtcblxuXHRcdHRoaXMucHJvbXB0ID0gcHJvbXB0O1xuXG5cdFx0dGhpcy5kZWZhdWx0ID1cblx0XHRcdHR5cGVvZiBkZWZhdWx0VmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuXHRcdFx0XHQ/IGRlZmF1bHRWYWx1ZS5iaW5kKHRoaXMpXG5cdFx0XHRcdDogZGVmYXVsdFZhbHVlO1xuXG5cdFx0dGhpcy5vdGhlcndpc2UgPVxuXHRcdFx0dHlwZW9mIG90aGVyd2lzZSA9PT0gXCJmdW5jdGlvblwiID8gb3RoZXJ3aXNlLmJpbmQodGhpcykgOiBvdGhlcndpc2U7XG5cblx0XHR0aGlzLm1vZGlmeU90aGVyd2lzZSA9IG1vZGlmeU90aGVyd2lzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY2xpZW50LlxuXHQgKi9cblx0Z2V0IGNsaWVudCgpOiBBa2Fpcm9DbGllbnQge1xuXHRcdHJldHVybiB0aGlzLmNvbW1hbmQuY2xpZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIHRoaXMgYXJndW1lbnQgYmVsb25ncyB0by5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kOiBDb21tYW5kO1xuXG5cdC8qKlxuXHQgKiBUaGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGUgYXJndW1lbnQgb3IgYSBmdW5jdGlvbiBzdXBwbHlpbmcgdGhlIGRlZmF1bHQgdmFsdWUuXG5cdCAqL1xuXHRwdWJsaWMgZGVmYXVsdDogRGVmYXVsdFZhbHVlU3VwcGxpZXIgfCBhbnk7XG5cblx0LyoqXG5cdCAqICBEZXNjcmlwdGlvbiBvZiB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBkZXNjcmlwdGlvbjogc3RyaW5nIHwgYW55O1xuXG5cdC8qKlxuXHQgKiBUaGUgc3RyaW5nKHMpIHRvIHVzZSBmb3IgZmxhZyBvciBvcHRpb24gbWF0Y2guXG5cdCAqL1xuXHRwdWJsaWMgZmxhZz86IHN0cmluZyB8IHN0cmluZ1tdO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBoYW5kbGVyLlxuXHQgKi9cblx0Z2V0IGhhbmRsZXIoKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbW1hbmQuaGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaW5kZXggdG8gc3RhcnQgZnJvbS5cblx0ICovXG5cdHB1YmxpYyBpbmRleD86IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGFtb3VudCBvZiBwaHJhc2VzIHRvIG1hdGNoIGZvciByZXN0LCBzZXBhcmF0ZSwgY29udGVudCwgb3IgdGV4dCBtYXRjaC5cblx0ICovXG5cdHB1YmxpYyBsaW1pdDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRvIG1hdGNoIHRleHQuXG5cdCAqL1xuXHRwdWJsaWMgbWF0Y2g6IEFyZ3VtZW50TWF0Y2g7XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdGhlcndpc2UgY29udGVudC5cblx0ICovXG5cdHB1YmxpYyBtb2RpZnlPdGhlcndpc2U6IE90aGVyd2lzZUNvbnRlbnRNb2RpZmllcjtcblxuXHQvKipcblx0ICogV2hldGhlciB0byBwcm9jZXNzIG11bHRpcGxlIG9wdGlvbiBmbGFncyBpbnN0ZWFkIG9mIGp1c3QgdGhlIGZpcnN0LlxuXHQgKi9cblx0cHVibGljIG11bHRpcGxlRmxhZ3M6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBjb250ZW50IG9yIGZ1bmN0aW9uIHN1cHBseWluZyB0aGUgY29udGVudCBzZW50IHdoZW4gYXJndW1lbnQgcGFyc2luZyBmYWlscy5cblx0ICovXG5cdHB1YmxpYyBvdGhlcndpc2U/OlxuXHRcdHwgc3RyaW5nXG5cdFx0fCBNZXNzYWdlUGF5bG9hZFxuXHRcdHwgTWVzc2FnZU9wdGlvbnNcblx0XHR8IE90aGVyd2lzZUNvbnRlbnRTdXBwbGllcjtcblxuXHQvKipcblx0ICogVGhlIHByb21wdCBvcHRpb25zLlxuXHQgKi9cblx0cHVibGljIHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucyB8IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSB0eXBlIHRvIGNhc3QgdG8gb3IgYSBmdW5jdGlvbiB0byB1c2UgdG8gY2FzdC5cblx0ICovXG5cdHB1YmxpYyB0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoZSBhcmd1bWVudCBpcyB1bm9yZGVyZWQuXG5cdCAqL1xuXHRwdWJsaWMgdW5vcmRlcmVkOiBib29sZWFuIHwgbnVtYmVyIHwgbnVtYmVyW107XG5cblx0LyoqXG5cdCAqIENhc3RzIGEgcGhyYXNlIHRvIHRoaXMgYXJndW1lbnQncyB0eXBlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwaHJhc2UgLSBQaHJhc2UgdG8gcHJvY2Vzcy5cblx0ICovXG5cdHB1YmxpYyBjYXN0KG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gQXJndW1lbnQuY2FzdCh0aGlzLnR5cGUsIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb2xsZWN0cyBpbnB1dCBmcm9tIHRoZSB1c2VyIGJ5IHByb21wdGluZy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHByb21wdC5cblx0ICogQHBhcmFtIGNvbW1hbmRJbnB1dCAtIFByZXZpb3VzIGlucHV0IGZyb20gY29tbWFuZCBpZiB0aGVyZSB3YXMgb25lLlxuXHQgKiBAcGFyYW0gcGFyc2VkSW5wdXQgLSBQcmV2aW91cyBwYXJzZWQgaW5wdXQgZnJvbSBjb21tYW5kIGlmIHRoZXJlIHdhcyBvbmUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgY29sbGVjdChcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdGNvbW1hbmRJbnB1dDogc3RyaW5nID0gXCJcIixcblx0XHRwYXJzZWRJbnB1dDogYW55ID0gbnVsbFxuXHQpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBwcm9tcHRPcHRpb25zOiBhbnkgPSB7fTtcblx0XHRPYmplY3QuYXNzaWduKHByb21wdE9wdGlvbnMsIHRoaXMuaGFuZGxlci5hcmd1bWVudERlZmF1bHRzLnByb21wdCk7XG5cdFx0T2JqZWN0LmFzc2lnbihwcm9tcHRPcHRpb25zLCB0aGlzLmNvbW1hbmQuYXJndW1lbnREZWZhdWx0cy5wcm9tcHQpO1xuXHRcdE9iamVjdC5hc3NpZ24ocHJvbXB0T3B0aW9ucywgdGhpcy5wcm9tcHQgfHwge30pO1xuXG5cdFx0Y29uc3QgaXNJbmZpbml0ZSA9XG5cdFx0XHRwcm9tcHRPcHRpb25zLmluZmluaXRlIHx8XG5cdFx0XHQodGhpcy5tYXRjaCA9PT0gQXJndW1lbnRNYXRjaGVzLlNFUEFSQVRFICYmICFjb21tYW5kSW5wdXQpO1xuXHRcdGNvbnN0IGFkZGl0aW9uYWxSZXRyeSA9IE51bWJlcihCb29sZWFuKGNvbW1hbmRJbnB1dCkpO1xuXHRcdGNvbnN0IHZhbHVlcyA9IGlzSW5maW5pdGUgPyBbXSA6IG51bGw7XG5cblx0XHRjb25zdCBnZXRUZXh0ID0gYXN5bmMgKFxuXHRcdFx0cHJvbXB0VHlwZSxcblx0XHRcdHByb21wdGVyLFxuXHRcdFx0cmV0cnlDb3VudCxcblx0XHRcdGlucHV0TWVzc2FnZSxcblx0XHRcdGlucHV0UGhyYXNlLFxuXHRcdFx0aW5wdXRQYXJzZWRcblx0XHQpID0+IHtcblx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUocHJvbXB0ZXIpLmNhbGwodGhpcywgbWVzc2FnZSwge1xuXHRcdFx0XHRyZXRyaWVzOiByZXRyeUNvdW50LFxuXHRcdFx0XHRpbmZpbml0ZTogaXNJbmZpbml0ZSxcblx0XHRcdFx0bWVzc2FnZTogaW5wdXRNZXNzYWdlLFxuXHRcdFx0XHRwaHJhc2U6IGlucHV0UGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlOiBpbnB1dFBhcnNlZFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG1vZGlmaWVyID0ge1xuXHRcdFx0XHRzdGFydDogcHJvbXB0T3B0aW9ucy5tb2RpZnlTdGFydCxcblx0XHRcdFx0cmV0cnk6IHByb21wdE9wdGlvbnMubW9kaWZ5UmV0cnksXG5cdFx0XHRcdHRpbWVvdXQ6IHByb21wdE9wdGlvbnMubW9kaWZ5VGltZW91dCxcblx0XHRcdFx0ZW5kZWQ6IHByb21wdE9wdGlvbnMubW9kaWZ5RW5kZWQsXG5cdFx0XHRcdGNhbmNlbDogcHJvbXB0T3B0aW9ucy5tb2RpZnlDYW5jZWxcblx0XHRcdH1bcHJvbXB0VHlwZV07XG5cblx0XHRcdGlmIChtb2RpZmllcikge1xuXHRcdFx0XHR0ZXh0ID0gYXdhaXQgbW9kaWZpZXIuY2FsbCh0aGlzLCBtZXNzYWdlLCB0ZXh0LCB7XG5cdFx0XHRcdFx0cmV0cmllczogcmV0cnlDb3VudCxcblx0XHRcdFx0XHRpbmZpbml0ZTogaXNJbmZpbml0ZSxcblx0XHRcdFx0XHRtZXNzYWdlOiBpbnB1dE1lc3NhZ2UsXG5cdFx0XHRcdFx0cGhyYXNlOiBpbnB1dFBocmFzZSxcblx0XHRcdFx0XHRmYWlsdXJlOiBpbnB1dFBhcnNlZFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0ZXh0KSkge1xuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fTtcblxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG5cdFx0Y29uc3QgcHJvbXB0T25lID0gYXN5bmMgKFxuXHRcdFx0cHJldk1lc3NhZ2UsXG5cdFx0XHRwcmV2SW5wdXQsXG5cdFx0XHRwcmV2UGFyc2VkLFxuXHRcdFx0cmV0cnlDb3VudFxuXHRcdCkgPT4ge1xuXHRcdFx0bGV0IHNlbnRTdGFydDtcblx0XHRcdC8vIFRoaXMgaXMgZWl0aGVyIGEgcmV0cnkgcHJvbXB0LCB0aGUgc3RhcnQgb2YgYSBub24taW5maW5pdGUsIG9yIHRoZSBzdGFydCBvZiBhbiBpbmZpbml0ZS5cblx0XHRcdGlmIChyZXRyeUNvdW50ICE9PSAxIHx8ICFpc0luZmluaXRlIHx8ICF2YWx1ZXM/Lmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCBwcm9tcHRUeXBlID0gcmV0cnlDb3VudCA9PT0gMSA/IFwic3RhcnRcIiA6IFwicmV0cnlcIjtcblx0XHRcdFx0Y29uc3QgcHJvbXB0ZXIgPVxuXHRcdFx0XHRcdHJldHJ5Q291bnQgPT09IDEgPyBwcm9tcHRPcHRpb25zLnN0YXJ0IDogcHJvbXB0T3B0aW9ucy5yZXRyeTtcblx0XHRcdFx0Y29uc3Qgc3RhcnRUZXh0ID0gYXdhaXQgZ2V0VGV4dChcblx0XHRcdFx0XHRwcm9tcHRUeXBlLFxuXHRcdFx0XHRcdHByb21wdGVyLFxuXHRcdFx0XHRcdHJldHJ5Q291bnQsXG5cdFx0XHRcdFx0cHJldk1lc3NhZ2UsXG5cdFx0XHRcdFx0cHJldklucHV0LFxuXHRcdFx0XHRcdHByZXZQYXJzZWRcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRpZiAoc3RhcnRUZXh0KSB7XG5cdFx0XHRcdFx0c2VudFN0YXJ0ID0gYXdhaXQgKG1lc3NhZ2UudXRpbCB8fCBtZXNzYWdlLmNoYW5uZWwpLnNlbmQoc3RhcnRUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsICYmIHNlbnRTdGFydCkge1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsLnNldEVkaXRhYmxlKGZhbHNlKTtcblx0XHRcdFx0XHRcdG1lc3NhZ2UudXRpbC5zZXRMYXN0UmVzcG9uc2Uoc2VudFN0YXJ0KTtcblx0XHRcdFx0XHRcdG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRTdGFydCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBpbnB1dDtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlucHV0ID0gKFxuXHRcdFx0XHRcdGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5hd2FpdE1lc3NhZ2VzKHtcblx0XHRcdFx0XHRcdGZpbHRlcjogbSA9PiBtLmF1dGhvci5pZCA9PT0gbWVzc2FnZS5hdXRob3IuaWQsXG5cdFx0XHRcdFx0XHRtYXg6IDEsXG5cdFx0XHRcdFx0XHR0aW1lOiBwcm9tcHRPcHRpb25zLnRpbWUsXG5cdFx0XHRcdFx0XHRlcnJvcnM6IFtcInRpbWVcIl1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpLmZpcnN0KCk7XG5cdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKGlucHV0KTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRjb25zdCB0aW1lb3V0VGV4dCA9IGF3YWl0IGdldFRleHQoXG5cdFx0XHRcdFx0XCJ0aW1lb3V0XCIsXG5cdFx0XHRcdFx0cHJvbXB0T3B0aW9ucy50aW1lb3V0LFxuXHRcdFx0XHRcdHJldHJ5Q291bnQsXG5cdFx0XHRcdFx0cHJldk1lc3NhZ2UsXG5cdFx0XHRcdFx0cHJldklucHV0LFxuXHRcdFx0XHRcdFwiXCJcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKHRpbWVvdXRUZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2VudFRpbWVvdXQgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZCh0aW1lb3V0VGV4dCk7XG5cdFx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudFRpbWVvdXQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwcm9tcHRPcHRpb25zLmJyZWFrb3V0KSB7XG5cdFx0XHRcdGNvbnN0IGxvb2tzTGlrZSA9IGF3YWl0IHRoaXMuaGFuZGxlci5wYXJzZUNvbW1hbmQoaW5wdXQpO1xuXHRcdFx0XHRpZiAobG9va3NMaWtlICYmIGxvb2tzTGlrZS5jb21tYW5kKSByZXR1cm4gRmxhZy5yZXRyeShpbnB1dCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChcblx0XHRcdFx0aW5wdXQ/LmNvbnRlbnQudG9Mb3dlckNhc2UoKSA9PT0gcHJvbXB0T3B0aW9ucy5jYW5jZWxXb3JkLnRvTG93ZXJDYXNlKClcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBjYW5jZWxUZXh0ID0gYXdhaXQgZ2V0VGV4dChcblx0XHRcdFx0XHRcImNhbmNlbFwiLFxuXHRcdFx0XHRcdHByb21wdE9wdGlvbnMuY2FuY2VsLFxuXHRcdFx0XHRcdHJldHJ5Q291bnQsXG5cdFx0XHRcdFx0aW5wdXQsXG5cdFx0XHRcdFx0aW5wdXQ/LmNvbnRlbnQsXG5cdFx0XHRcdFx0XCJjYW5jZWxcIlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoY2FuY2VsVGV4dCkge1xuXHRcdFx0XHRcdGNvbnN0IHNlbnRDYW5jZWwgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZChjYW5jZWxUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50Q2FuY2VsKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGlzSW5maW5pdGUgJiZcblx0XHRcdFx0aW5wdXQ/LmNvbnRlbnQudG9Mb3dlckNhc2UoKSA9PT0gcHJvbXB0T3B0aW9ucy5zdG9wV29yZC50b0xvd2VyQ2FzZSgpXG5cdFx0XHQpIHtcblx0XHRcdFx0aWYgKCF2YWx1ZXM/Lmxlbmd0aClcblx0XHRcdFx0XHRyZXR1cm4gcHJvbXB0T25lKGlucHV0LCBpbnB1dD8uY29udGVudCwgbnVsbCwgcmV0cnlDb3VudCArIDEpO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWVzO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBwYXJzZWRWYWx1ZSA9IGF3YWl0IHRoaXMuY2FzdChpbnB1dCwgaW5wdXQuY29udGVudCk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHBhcnNlZFZhbHVlKSkge1xuXHRcdFx0XHRpZiAocmV0cnlDb3VudCA8PSBwcm9tcHRPcHRpb25zLnJldHJpZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gcHJvbXB0T25lKGlucHV0LCBpbnB1dD8uY29udGVudCwgcGFyc2VkVmFsdWUsIHJldHJ5Q291bnQgKyAxKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGVuZGVkVGV4dCA9IGF3YWl0IGdldFRleHQoXG5cdFx0XHRcdFx0XCJlbmRlZFwiLFxuXHRcdFx0XHRcdHByb21wdE9wdGlvbnMuZW5kZWQsXG5cdFx0XHRcdFx0cmV0cnlDb3VudCxcblx0XHRcdFx0XHRpbnB1dCxcblx0XHRcdFx0XHRpbnB1dD8uY29udGVudCxcblx0XHRcdFx0XHRcInN0b3BcIlxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoZW5kZWRUZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2VudEVuZGVkID0gYXdhaXQgbWVzc2FnZS5jaGFubmVsLnNlbmQoZW5kZWRUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50RW5kZWQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc0luZmluaXRlKSB7XG5cdFx0XHRcdHZhbHVlcy5wdXNoKHBhcnNlZFZhbHVlKTtcblx0XHRcdFx0Y29uc3QgbGltaXQgPSBwcm9tcHRPcHRpb25zLmxpbWl0O1xuXHRcdFx0XHRpZiAodmFsdWVzLmxlbmd0aCA8IGxpbWl0KVxuXHRcdFx0XHRcdHJldHVybiBwcm9tcHRPbmUobWVzc2FnZSwgaW5wdXQuY29udGVudCwgcGFyc2VkVmFsdWUsIDEpO1xuXG5cdFx0XHRcdHJldHVybiB2YWx1ZXM7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBwYXJzZWRWYWx1ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5oYW5kbGVyLmFkZFByb21wdChtZXNzYWdlLmNoYW5uZWwsIG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRjb25zdCByZXR1cm5WYWx1ZSA9IGF3YWl0IHByb21wdE9uZShcblx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRjb21tYW5kSW5wdXQsXG5cdFx0XHRwYXJzZWRJbnB1dCxcblx0XHRcdDEgKyBhZGRpdGlvbmFsUmV0cnlcblx0XHQpO1xuXHRcdGlmICh0aGlzLmhhbmRsZXIuY29tbWFuZFV0aWwgJiYgbWVzc2FnZS51dGlsKSB7XG5cdFx0XHRtZXNzYWdlLnV0aWwuc2V0RWRpdGFibGUoZmFsc2UpO1xuXHRcdH1cblxuXHRcdHRoaXMuaGFuZGxlci5yZW1vdmVQcm9tcHQobWVzc2FnZS5jaGFubmVsLCBtZXNzYWdlLmF1dGhvcik7XG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb2Nlc3NlcyB0aGUgdHlwZSBjYXN0aW5nIGFuZCBwcm9tcHRpbmcgb2YgdGhlIGFyZ3VtZW50IGZvciBhIHBocmFzZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBocmFzZSAtIFRoZSBwaHJhc2UgdG8gcHJvY2Vzcy5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBwcm9jZXNzKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgY29tbWFuZERlZnMgPSB0aGlzLmNvbW1hbmQuYXJndW1lbnREZWZhdWx0cztcblx0XHRjb25zdCBoYW5kbGVyRGVmcyA9IHRoaXMuaGFuZGxlci5hcmd1bWVudERlZmF1bHRzO1xuXHRcdGNvbnN0IG9wdGlvbmFsID0gVXRpbC5jaG9pY2UoXG5cdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yXG5cdFx0XHR0aGlzLnByb21wdCAmJiB0aGlzLnByb21wdC5vcHRpb25hbCxcblx0XHRcdGNvbW1hbmREZWZzLnByb21wdCAmJiBjb21tYW5kRGVmcy5wcm9tcHQub3B0aW9uYWwsXG5cdFx0XHRoYW5kbGVyRGVmcy5wcm9tcHQgJiYgaGFuZGxlckRlZnMucHJvbXB0Lm9wdGlvbmFsXG5cdFx0KTtcblxuXHRcdGNvbnN0IGRvT3RoZXJ3aXNlID0gYXN5bmMgZmFpbHVyZSA9PiB7XG5cdFx0XHRjb25zdCBvdGhlcndpc2UgPSBVdGlsLmNob2ljZShcblx0XHRcdFx0dGhpcy5vdGhlcndpc2UsXG5cdFx0XHRcdGNvbW1hbmREZWZzLm90aGVyd2lzZSxcblx0XHRcdFx0aGFuZGxlckRlZnMub3RoZXJ3aXNlXG5cdFx0XHQpO1xuXG5cdFx0XHRjb25zdCBtb2RpZnlPdGhlcndpc2UgPSBVdGlsLmNob2ljZShcblx0XHRcdFx0dGhpcy5tb2RpZnlPdGhlcndpc2UsXG5cdFx0XHRcdGNvbW1hbmREZWZzLm1vZGlmeU90aGVyd2lzZSxcblx0XHRcdFx0aGFuZGxlckRlZnMubW9kaWZ5T3RoZXJ3aXNlXG5cdFx0XHQpO1xuXG5cdFx0XHRsZXQgdGV4dCA9IGF3YWl0IFV0aWwuaW50b0NhbGxhYmxlKG90aGVyd2lzZSkuY2FsbCh0aGlzLCBtZXNzYWdlLCB7XG5cdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0ZmFpbHVyZVxuXHRcdFx0fSk7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0ZXh0KSkge1xuXHRcdFx0XHR0ZXh0ID0gdGV4dC5qb2luKFwiXFxuXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobW9kaWZ5T3RoZXJ3aXNlKSB7XG5cdFx0XHRcdHRleHQgPSBhd2FpdCBtb2RpZnlPdGhlcndpc2UuY2FsbCh0aGlzLCBtZXNzYWdlLCB0ZXh0LCB7XG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdGZhaWx1cmVcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdFx0dGV4dCA9IHRleHQuam9pbihcIlxcblwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGV4dCkge1xuXHRcdFx0XHRjb25zdCBzZW50ID0gYXdhaXQgbWVzc2FnZS5jaGFubmVsLnNlbmQodGV4dCk7XG5cdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnQpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gRmxhZy5jYW5jZWwoKTtcblx0XHR9O1xuXG5cdFx0aWYgKCFwaHJhc2UgJiYgb3B0aW9uYWwpIHtcblx0XHRcdGlmICh0aGlzLm90aGVyd2lzZSAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBkb090aGVyd2lzZShudWxsKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFV0aWwuaW50b0NhbGxhYmxlKHRoaXMuZGVmYXVsdCkobWVzc2FnZSwge1xuXHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdGZhaWx1cmU6IG51bGxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuY2FzdChtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkge1xuXHRcdFx0aWYgKHRoaXMub3RoZXJ3aXNlICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIGRvT3RoZXJ3aXNlKHJlcyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0aGlzLnByb21wdCAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNvbGxlY3QobWVzc2FnZSwgcGhyYXNlLCByZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcy5kZWZhdWx0ID09IG51bGxcblx0XHRcdFx0PyByZXNcblx0XHRcdFx0OiBVdGlsLmludG9DYWxsYWJsZSh0aGlzLmRlZmF1bHQpKG1lc3NhZ2UsIHsgcGhyYXNlLCBmYWlsdXJlOiByZXMgfSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDYXN0cyBhIHBocmFzZSB0byB0aGlzIGFyZ3VtZW50J3MgdHlwZS5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byBjYXN0IHRvLlxuXHQgKiBAcGFyYW0gcmVzb2x2ZXIgLSBUaGUgdHlwZSByZXNvbHZlci5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGhyYXNlIC0gUGhyYXNlIHRvIHByb2Nlc3MuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGNhc3QoXG5cdFx0dHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLFxuXHRcdHJlc29sdmVyOiBUeXBlUmVzb2x2ZXIsXG5cdFx0bWVzc2FnZTogTWVzc2FnZSxcblx0XHRwaHJhc2U6IHN0cmluZ1xuXHQpOiBQcm9taXNlPGFueT4ge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHR5cGUpKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIHR5cGUpIHtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoZW50cnkpKSB7XG5cdFx0XHRcdFx0aWYgKGVudHJ5LnNvbWUodCA9PiB0LnRvTG93ZXJDYXNlKCkgPT09IHBocmFzZS50b0xvd2VyQ2FzZSgpKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVudHJ5WzBdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChlbnRyeS50b0xvd2VyQ2FzZSgpID09PSBwaHJhc2UudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRcdHJldHVybiBlbnRyeTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0bGV0IHJlcyA9IHR5cGUobWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShyZXMpKSByZXMgPSBhd2FpdCByZXM7XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRjb25zdCBtYXRjaCA9IHBocmFzZS5tYXRjaCh0eXBlKTtcblx0XHRcdGlmICghbWF0Y2gpIHJldHVybiBudWxsO1xuXG5cdFx0XHRjb25zdCBtYXRjaGVzID0gW107XG5cblx0XHRcdGlmICh0eXBlLmdsb2JhbCkge1xuXHRcdFx0XHRsZXQgbWF0Y2hlZDtcblxuXHRcdFx0XHR3aGlsZSAoKG1hdGNoZWQgPSB0eXBlLmV4ZWMocGhyYXNlKSkgIT0gbnVsbCkge1xuXHRcdFx0XHRcdG1hdGNoZXMucHVzaChtYXRjaGVkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyBtYXRjaCwgbWF0Y2hlcyB9O1xuXHRcdH1cblxuXHRcdGlmIChyZXNvbHZlci50eXBlKHR5cGUpKSB7XG5cdFx0XHRsZXQgcmVzID0gcmVzb2x2ZXIudHlwZSh0eXBlKT8uY2FsbCh0aGlzLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKHJlcykpIHJlcyA9IGF3YWl0IHJlcztcblx0XHRcdHJldHVybiByZXM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBocmFzZSB8fCBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHRoYXQgaXMgdGhlIGxlZnQtdG8tcmlnaHQgY29tcG9zaXRpb24gb2YgdGhlIGdpdmVuIHR5cGVzLlxuXHQgKiBJZiBhbnkgb2YgdGhlIHR5cGVzIGZhaWxzLCB0aGUgZW50aXJlIGNvbXBvc2l0aW9uIGZhaWxzLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGNvbXBvc2UoXG5cdFx0Li4udHlwZXM6IChBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpW11cblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0bGV0IGFjYyA9IHBocmFzZTtcblx0XHRcdGZvciAobGV0IGVudHJ5IG9mIHR5cGVzKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZW50cnkgPT09IFwiZnVuY3Rpb25cIikgZW50cnkgPSBlbnRyeS5iaW5kKHRoaXMpO1xuXHRcdFx0XHRhY2MgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIGFjYyk7XG5cdFx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUoYWNjKSkgcmV0dXJuIGFjYztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGFjYztcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHRoYXQgaXMgdGhlIGxlZnQtdG8tcmlnaHQgY29tcG9zaXRpb24gb2YgdGhlIGdpdmVuIHR5cGVzLlxuXHQgKiBJZiBhbnkgb2YgdGhlIHR5cGVzIGZhaWxzLCB0aGUgY29tcG9zaXRpb24gc3RpbGwgY29udGludWVzIHdpdGggdGhlIGZhaWx1cmUgcGFzc2VkIG9uLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGNvbXBvc2VXaXRoRmFpbHVyZShcblx0XHQuLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXVxuXHQpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRsZXQgYWNjID0gcGhyYXNlO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGFjYyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgYWNjKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGFjYztcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBzb21ldGhpbmcgaXMgbnVsbCwgdW5kZWZpbmVkLCBvciBhIGZhaWwgZmxhZy5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzRmFpbHVyZShcblx0XHR2YWx1ZTogYW55XG5cdCk6IHZhbHVlIGlzIG51bGwgfCB1bmRlZmluZWQgfCAoRmxhZyAmIHsgdmFsdWU6IGFueSB9KSB7XG5cdFx0cmV0dXJuIHZhbHVlID09IG51bGwgfHwgRmxhZy5pcyh2YWx1ZSwgXCJmYWlsXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIGZyb20gbXVsdGlwbGUgdHlwZXMgKHByb2R1Y3QgdHlwZSkuXG5cdCAqIE9ubHkgaW5wdXRzIHdoZXJlIGVhY2ggdHlwZSByZXNvbHZlcyB3aXRoIGEgbm9uLXZvaWQgdmFsdWUgYXJlIHZhbGlkLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHByb2R1Y3QoXG5cdFx0Li4udHlwZXM6IChBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpW11cblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IFtdO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoXG5cdFx0XHRcdFx0ZW50cnksXG5cdFx0XHRcdFx0dGhpcy5oYW5kbGVyLnJlc29sdmVyLFxuXHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0cGhyYXNlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHJlcztcblx0XHRcdFx0cmVzdWx0cy5wdXNoKHJlcyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHRzO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgd2hlcmUgdGhlIHBhcnNlZCB2YWx1ZSBtdXN0IGJlIHdpdGhpbiBhIHJhbmdlLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIG1pbiAtIE1pbmltdW0gdmFsdWUuXG5cdCAqIEBwYXJhbSBtYXggLSBNYXhpbXVtIHZhbHVlLlxuXHQgKiBAcGFyYW0gaW5jbHVzaXZlIC0gV2hldGhlciBvciBub3QgdG8gYmUgaW5jbHVzaXZlIG9uIHRoZSB1cHBlciBib3VuZC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcmFuZ2UoXG5cdFx0dHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLFxuXHRcdG1pbjogbnVtYmVyLFxuXHRcdG1heDogbnVtYmVyLFxuXHRcdGluY2x1c2l2ZSA9IGZhbHNlXG5cdCk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIEFyZ3VtZW50LnZhbGlkYXRlKHR5cGUsIChtc2csIHAsIHgpID0+IHtcblx0XHRcdGNvbnN0IG8gPVxuXHRcdFx0XHR0eXBlb2YgeCA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgeCA9PT0gXCJiaWdpbnRcIlxuXHRcdFx0XHRcdD8geFxuXHRcdFx0XHRcdDogeC5sZW5ndGggIT0gbnVsbFxuXHRcdFx0XHRcdD8geC5sZW5ndGhcblx0XHRcdFx0XHQ6IHguc2l6ZSAhPSBudWxsXG5cdFx0XHRcdFx0PyB4LnNpemVcblx0XHRcdFx0XHQ6IHg7XG5cblx0XHRcdHJldHVybiBvID49IG1pbiAmJiAoaW5jbHVzaXZlID8gbyA8PSBtYXggOiBvIDwgbWF4KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IHBhcnNlcyBhcyBub3JtYWwgYnV0IGFsc28gdGFncyBpdCB3aXRoIHNvbWUgZGF0YS5cblx0ICogUmVzdWx0IGlzIGluIGFuIG9iamVjdCBgeyB0YWcsIHZhbHVlIH1gIGFuZCB3cmFwcGVkIGluIGBGbGFnLmZhaWxgIHdoZW4gZmFpbGVkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHRhZyAtIFRhZyB0byBhZGQuIERlZmF1bHRzIHRvIHRoZSBgdHlwZWAgYXJndW1lbnQsIHNvIHVzZWZ1bCBpZiBpdCBpcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGFnZ2VkKFxuXHRcdHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3Rlcixcblx0XHR0YWc6IGFueSA9IHR5cGVcblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHR5cGUgPSB0eXBlLmJpbmQodGhpcyk7XG5cdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KFxuXHRcdFx0XHR0eXBlLFxuXHRcdFx0XHR0aGlzLmhhbmRsZXIucmVzb2x2ZXIsXG5cdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdHBocmFzZVxuXHRcdFx0KTtcblx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkge1xuXHRcdFx0XHRyZXR1cm4gRmxhZy5mYWlsKHsgdGFnLCB2YWx1ZTogcmVzIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyB0YWcsIHZhbHVlOiByZXMgfTtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIGZyb20gbXVsdGlwbGUgdHlwZXMgKHVuaW9uIHR5cGUpLlxuXHQgKiBUaGUgZmlyc3QgdHlwZSB0aGF0IHJlc29sdmVzIHRvIGEgbm9uLXZvaWQgdmFsdWUgaXMgdXNlZC5cblx0ICogRWFjaCB0eXBlIHdpbGwgYWxzbyBiZSB0YWdnZWQgdXNpbmcgYHRhZ2dlZGAgd2l0aCB0aGVtc2VsdmVzLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHRhZ2dlZFVuaW9uKFxuXHRcdC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdXG5cdCk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGZvciAobGV0IGVudHJ5IG9mIHR5cGVzKSB7XG5cdFx0XHRcdGVudHJ5ID0gQXJndW1lbnQudGFnZ2VkKGVudHJ5KTtcblx0XHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdChcblx0XHRcdFx0XHRlbnRyeSxcblx0XHRcdFx0XHR0aGlzLmhhbmRsZXIucmVzb2x2ZXIsXG5cdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRwaHJhc2Vcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKCFBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHJlcztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IHBhcnNlcyBhcyBub3JtYWwgYnV0IGFsc28gdGFncyBpdCB3aXRoIHNvbWUgZGF0YSBhbmQgY2FycmllcyB0aGUgb3JpZ2luYWwgaW5wdXQuXG5cdCAqIFJlc3VsdCBpcyBpbiBhbiBvYmplY3QgYHsgdGFnLCBpbnB1dCwgdmFsdWUgfWAgYW5kIHdyYXBwZWQgaW4gYEZsYWcuZmFpbGAgd2hlbiBmYWlsZWQuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gdGFnIC0gVGFnIHRvIGFkZC4gRGVmYXVsdHMgdG8gdGhlIGB0eXBlYCBhcmd1bWVudCwgc28gdXNlZnVsIGlmIGl0IGlzIGEgc3RyaW5nLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0YWdnZWRXaXRoSW5wdXQoXG5cdFx0dHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLFxuXHRcdHRhZzogYW55ID0gdHlwZVxuXHQpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikgdHlwZSA9IHR5cGUuYmluZCh0aGlzKTtcblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoXG5cdFx0XHRcdHR5cGUsXG5cdFx0XHRcdHRoaXMuaGFuZGxlci5yZXNvbHZlcixcblx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0cGhyYXNlXG5cdFx0XHQpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRcdHJldHVybiBGbGFnLmZhaWwoeyB0YWcsIGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IHRhZywgaW5wdXQ6IHBocmFzZSwgdmFsdWU6IHJlcyB9O1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAodW5pb24gdHlwZSkuXG5cdCAqIFRoZSBmaXJzdCB0eXBlIHRoYXQgcmVzb2x2ZXMgdG8gYSBub24tdm9pZCB2YWx1ZSBpcyB1c2VkLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHVuaW9uKFxuXHRcdC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdXG5cdCk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGZvciAobGV0IGVudHJ5IG9mIHR5cGVzKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZW50cnkgPT09IFwiZnVuY3Rpb25cIikgZW50cnkgPSBlbnRyeS5iaW5kKHRoaXMpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KFxuXHRcdFx0XHRcdGVudHJ5LFxuXHRcdFx0XHRcdHRoaXMuaGFuZGxlci5yZXNvbHZlcixcblx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdHBocmFzZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoIUFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHdpdGggZXh0cmEgdmFsaWRhdGlvbi5cblx0ICogSWYgdGhlIHByZWRpY2F0ZSBpcyBub3QgdHJ1ZSwgdGhlIHZhbHVlIGlzIGNvbnNpZGVyZWQgaW52YWxpZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBwcmVkaWNhdGUgLSBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB2YWxpZGF0ZShcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsXG5cdFx0cHJlZGljYXRlOiBQYXJzZWRWYWx1ZVByZWRpY2F0ZVxuXHQpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikgdHlwZSA9IHR5cGUuYmluZCh0aGlzKTtcblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoXG5cdFx0XHRcdHR5cGUsXG5cdFx0XHRcdHRoaXMuaGFuZGxlci5yZXNvbHZlcixcblx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0cGhyYXNlXG5cdFx0XHQpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuXHRcdFx0aWYgKCFwcmVkaWNhdGUuY2FsbCh0aGlzLCBtZXNzYWdlLCBwaHJhc2UsIHJlcykpIHJldHVybiBudWxsO1xuXHRcdFx0cmV0dXJuIHJlcztcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHRoYXQgcGFyc2VzIGFzIG5vcm1hbCBidXQgYWxzbyBjYXJyaWVzIHRoZSBvcmlnaW5hbCBpbnB1dC5cblx0ICogUmVzdWx0IGlzIGluIGFuIG9iamVjdCBgeyBpbnB1dCwgdmFsdWUgfWAgYW5kIHdyYXBwZWQgaW4gYEZsYWcuZmFpbGAgd2hlbiBmYWlsZWQuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB3aXRoSW5wdXQoXG5cdFx0dHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyXG5cdCk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdChcblx0XHRcdFx0dHlwZSxcblx0XHRcdFx0dGhpcy5oYW5kbGVyLnJlc29sdmVyLFxuXHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRwaHJhc2Vcblx0XHRcdCk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdFx0cmV0dXJuIEZsYWcuZmFpbCh7IGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfTtcblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgaG93IGFuIGFyZ3VtZW50IHBhcnNlcyB0ZXh0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50T3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBEZWZhdWx0IHZhbHVlIGlmIG5vIGlucHV0IG9yIGRpZCBub3QgY2FzdCBjb3JyZWN0bHkuXG5cdCAqIElmIHVzaW5nIGEgZmxhZyBtYXRjaCwgc2V0dGluZyB0aGUgZGVmYXVsdCB2YWx1ZSB0byBhIG5vbi12b2lkIHZhbHVlIGludmVyc2VzIHRoZSByZXN1bHQuXG5cdCAqL1xuXHRkZWZhdWx0PzogRGVmYXVsdFZhbHVlU3VwcGxpZXIgfCBhbnk7XG5cblx0LyoqIFRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgYXJndW1lbnQgKi9cblx0ZGVzY3JpcHRpb24/OiBzdHJpbmcgfCBhbnkgfCBhbnlbXTtcblxuXHQvKiogVGhlIHN0cmluZyhzKSB0byB1c2UgYXMgdGhlIGZsYWcgZm9yIGZsYWcgb3Igb3B0aW9uIG1hdGNoLiAqL1xuXHRmbGFnPzogc3RyaW5nIHwgc3RyaW5nW107XG5cblx0LyoqICBJRCBvZiB0aGUgYXJndW1lbnQgZm9yIHVzZSBpbiB0aGUgYXJncyBvYmplY3QuIFRoaXMgZG9lcyBub3RoaW5nIGluc2lkZSBhbiBBcmd1bWVudEdlbmVyYXRvci4gKi9cblx0aWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEluZGV4IG9mIHBocmFzZSB0byBzdGFydCBmcm9tLiBBcHBsaWNhYmxlIHRvIHBocmFzZSwgdGV4dCwgY29udGVudCwgcmVzdCwgb3Igc2VwYXJhdGUgbWF0Y2ggb25seS5cblx0ICogSWdub3JlZCB3aGVuIHVzZWQgd2l0aCB0aGUgdW5vcmRlcmVkIG9wdGlvbi5cblx0ICovXG5cdGluZGV4PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBBbW91bnQgb2YgcGhyYXNlcyB0byBtYXRjaCB3aGVuIG1hdGNoaW5nIG1vcmUgdGhhbiBvbmUuXG5cdCAqIEFwcGxpY2FibGUgdG8gdGV4dCwgY29udGVudCwgcmVzdCwgb3Igc2VwYXJhdGUgbWF0Y2ggb25seS5cblx0ICogRGVmYXVsdHMgdG8gaW5maW5pdHkuXG5cdCAqL1xuXHRsaW1pdD86IG51bWJlcjtcblxuXHQvKiogTWV0aG9kIHRvIG1hdGNoIHRleHQuIERlZmF1bHRzIHRvICdwaHJhc2UnLiAqL1xuXHRtYXRjaD86IEFyZ3VtZW50TWF0Y2g7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdGhlcndpc2UgY29udGVudC4gKi9cblx0bW9kaWZ5T3RoZXJ3aXNlPzogT3RoZXJ3aXNlQ29udGVudE1vZGlmaWVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBoYXZlIGZsYWdzIHByb2Nlc3MgbXVsdGlwbGUgaW5wdXRzLlxuXHQgKiBGb3Igb3B0aW9uIGZsYWdzLCB0aGlzIHdvcmtzIGxpa2UgdGhlIHNlcGFyYXRlIG1hdGNoOyB0aGUgbGltaXQgb3B0aW9uIHdpbGwgYWxzbyB3b3JrIGhlcmUuXG5cdCAqIEZvciBmbGFncywgdGhpcyB3aWxsIGNvdW50IHRoZSBudW1iZXIgb2Ygb2NjdXJyZW5jZXMuXG5cdCAqL1xuXHRtdWx0aXBsZUZsYWdzPzogYm9vbGVhbjtcblxuXHQvKiogVGV4dCBzZW50IGlmIGFyZ3VtZW50IHBhcnNpbmcgZmFpbHMuIFRoaXMgb3ZlcnJpZGVzIHRoZSBgZGVmYXVsdGAgb3B0aW9uIGFuZCBhbGwgcHJvbXB0IG9wdGlvbnMuICovXG5cdG90aGVyd2lzZT86XG5cdFx0fCBzdHJpbmdcblx0XHR8IE1lc3NhZ2VQYXlsb2FkXG5cdFx0fCBNZXNzYWdlT3B0aW9uc1xuXHRcdHwgT3RoZXJ3aXNlQ29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBQcm9tcHQgb3B0aW9ucyBmb3Igd2hlbiB1c2VyIGRvZXMgbm90IHByb3ZpZGUgaW5wdXQuICovXG5cdHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucyB8IGJvb2xlYW47XG5cblx0LyoqIFR5cGUgdG8gY2FzdCB0by4gKi9cblx0dHlwZT86IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcjtcblxuXHQvKipcblx0ICogTWFya3MgdGhlIGFyZ3VtZW50IGFzIHVub3JkZXJlZC5cblx0ICogRWFjaCBwaHJhc2UgaXMgZXZhbHVhdGVkIGluIG9yZGVyIHVudGlsIG9uZSBtYXRjaGVzIChubyBpbnB1dCBhdCBhbGwgbWVhbnMgbm8gZXZhbHVhdGlvbikuXG5cdCAqIFBhc3NpbmcgaW4gYSBudW1iZXIgZm9yY2VzIGV2YWx1YXRpb24gZnJvbSB0aGF0IGluZGV4IG9ud2FyZHMuXG5cdCAqIFBhc3NpbmcgaW4gYW4gYXJyYXkgb2YgbnVtYmVycyBmb3JjZXMgZXZhbHVhdGlvbiBvbiB0aG9zZSBpbmRpY2VzIG9ubHkuXG5cdCAqIElmIHRoZXJlIGlzIGEgbWF0Y2gsIHRoYXQgaW5kZXggaXMgY29uc2lkZXJlZCB1c2VkIGFuZCBmdXR1cmUgdW5vcmRlcmVkIGFyZ3Mgd2lsbCBub3QgY2hlY2sgdGhhdCBpbmRleCBhZ2Fpbi5cblx0ICogSWYgdGhlcmUgaXMgbm8gbWF0Y2gsIHRoZW4gdGhlIHByb21wdGluZyBvciBkZWZhdWx0IHZhbHVlIGlzIHVzZWQuXG5cdCAqIEFwcGxpY2FibGUgdG8gcGhyYXNlIG1hdGNoIG9ubHkuXG5cdCAqL1xuXHR1bm9yZGVyZWQ/OiBib29sZWFuIHwgbnVtYmVyIHwgbnVtYmVyW107XG59XG5cbi8qKlxuICogRGF0YSBwYXNzZWQgdG8gYXJndW1lbnQgcHJvbXB0IGZ1bmN0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFByb21wdERhdGEge1xuXHQvKiogV2hldGhlciB0aGUgcHJvbXB0IGlzIGluZmluaXRlIG9yIG5vdC4gKi9cblx0aW5maW5pdGU6IGJvb2xlYW47XG5cblx0LyoqIFRoZSBtZXNzYWdlIHRoYXQgY2F1c2VkIHRoZSBwcm9tcHQuICovXG5cdG1lc3NhZ2U6IE1lc3NhZ2U7XG5cblx0LyoqIEFtb3VudCBvZiByZXRyaWVzIHNvIGZhci4gKi9cblx0cmV0cmllczogbnVtYmVyO1xuXG5cdC8qKiBUaGUgaW5wdXQgcGhyYXNlIHRoYXQgY2F1c2VkIHRoZSBwcm9tcHQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZy4gKi9cblx0cGhyYXNlOiBzdHJpbmc7XG5cblx0LyoqIFRoZSB2YWx1ZSB0aGF0IGZhaWxlZCBpZiB0aGVyZSB3YXMgb25lLCBvdGhlcndpc2UgbnVsbC4gKi9cblx0ZmFpbHVyZTogdm9pZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pO1xufVxuXG4vKipcbiAqIEEgcHJvbXB0IHRvIHJ1biBpZiB0aGUgdXNlciBkaWQgbm90IGlucHV0IHRoZSBhcmd1bWVudCBjb3JyZWN0bHkuXG4gKiBDYW4gb25seSBiZSB1c2VkIGlmIHRoZXJlIGlzIG5vdCBhIGRlZmF1bHQgdmFsdWUgKHVubGVzcyBvcHRpb25hbCBpcyB0cnVlKS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFByb21wdE9wdGlvbnMge1xuXHQvKipcblx0ICogV2hlbmV2ZXIgYW4gaW5wdXQgbWF0Y2hlcyB0aGUgZm9ybWF0IG9mIGEgY29tbWFuZCwgdGhpcyBvcHRpb24gY29udHJvbHMgd2hldGhlciBvciBub3QgdG8gY2FuY2VsIHRoaXMgY29tbWFuZCBhbmQgcnVuIHRoYXQgY29tbWFuZC5cblx0ICogVGhlIGNvbW1hbmQgdG8gYmUgcnVuIG1heSBiZSB0aGUgc2FtZSBjb21tYW5kIG9yIHNvbWUgb3RoZXIgY29tbWFuZC5cblx0ICogRGVmYXVsdHMgdG8gdHJ1ZSxcblx0ICovXG5cdGJyZWFrb3V0PzogYm9vbGVhbjtcblxuXHQvKiogVGV4dCBzZW50IG9uIGNhbmNlbGxhdGlvbiBvZiBjb21tYW5kLiAqL1xuXHRjYW5jZWw/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBXb3JkIHRvIHVzZSBmb3IgY2FuY2VsbGluZyB0aGUgY29tbWFuZC4gRGVmYXVsdHMgdG8gJ2NhbmNlbCcuICovXG5cdGNhbmNlbFdvcmQ/OiBzdHJpbmc7XG5cblx0LyoqIFRleHQgc2VudCBvbiBhbW91bnQgb2YgdHJpZXMgcmVhY2hpbmcgdGhlIG1heC4gKi9cblx0ZW5kZWQ/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBQcm9tcHRzIGZvcmV2ZXIgdW50aWwgdGhlIHN0b3Agd29yZCwgY2FuY2VsIHdvcmQsIHRpbWUgbGltaXQsIG9yIHJldHJ5IGxpbWl0LlxuXHQgKiBOb3RlIHRoYXQgdGhlIHJldHJ5IGNvdW50IHJlc2V0cyBiYWNrIHRvIG9uZSBvbiBlYWNoIHZhbGlkIGVudHJ5LlxuXHQgKiBUaGUgZmluYWwgZXZhbHVhdGVkIGFyZ3VtZW50IHdpbGwgYmUgYW4gYXJyYXkgb2YgdGhlIGlucHV0cy5cblx0ICogRGVmYXVsdHMgdG8gZmFsc2UuXG5cdCAqL1xuXHRpbmZpbml0ZT86IGJvb2xlYW47XG5cblx0LyoqIEFtb3VudCBvZiBpbnB1dHMgYWxsb3dlZCBmb3IgYW4gaW5maW5pdGUgcHJvbXB0IGJlZm9yZSBmaW5pc2hpbmcuIERlZmF1bHRzIHRvIEluZmluaXR5LiAqL1xuXHRsaW1pdD86IG51bWJlcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IGNhbmNlbCBtZXNzYWdlcy4gKi9cblx0bW9kaWZ5Q2FuY2VsPzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgb3V0IG9mIHRyaWVzIG1lc3NhZ2VzLiAqL1xuXHRtb2RpZnlFbmRlZD86IFByb21wdENvbnRlbnRNb2RpZmllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IHJldHJ5IHByb21wdHMuICovXG5cdG1vZGlmeVJldHJ5PzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgc3RhcnQgcHJvbXB0cy4gKi9cblx0bW9kaWZ5U3RhcnQ/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSB0aW1lb3V0IG1lc3NhZ2VzLiAqL1xuXHRtb2RpZnlUaW1lb3V0PzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBQcm9tcHRzIG9ubHkgd2hlbiBhcmd1bWVudCBpcyBwcm92aWRlZCBidXQgd2FzIG5vdCBvZiB0aGUgcmlnaHQgdHlwZS4gRGVmYXVsdHMgdG8gZmFsc2UuICovXG5cdG9wdGlvbmFsPzogYm9vbGVhbjtcblxuXHQvKiogQW1vdW50IG9mIHJldHJpZXMgYWxsb3dlZC4gRGVmYXVsdHMgdG8gMS4gKi9cblx0cmV0cmllcz86IG51bWJlcjtcblxuXHQvKiogVGV4dCBzZW50IG9uIGEgcmV0cnkgKGZhaWx1cmUgdG8gY2FzdCB0eXBlKS4gKi9cblx0cmV0cnk/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBUZXh0IHNlbnQgb24gc3RhcnQgb2YgcHJvbXB0LiAqL1xuXHRzdGFydD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIFdvcmQgdG8gdXNlIGZvciBlbmRpbmcgaW5maW5pdGUgcHJvbXB0cy4gRGVmYXVsdHMgdG8gJ3N0b3AnLiAqL1xuXHRzdG9wV29yZD86IHN0cmluZztcblxuXHQvKiogVGltZSB0byB3YWl0IGZvciBpbnB1dC4gRGVmYXVsdHMgdG8gMzAwMDAuICovXG5cdHRpbWU/OiBudW1iZXI7XG5cblx0LyoqIFRleHQgc2VudCBvbiBjb2xsZWN0b3IgdGltZSBvdXQuICovXG5cdHRpbWVvdXQ/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xufVxuXG4vKipcbiAqIFRoZSBtZXRob2QgdG8gbWF0Y2ggYXJndW1lbnRzIGZyb20gdGV4dC5cbiAqIC0gYHBocmFzZWAgbWF0Y2hlcyBieSB0aGUgb3JkZXIgb2YgdGhlIHBocmFzZXMgaW5wdXR0ZWQuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIC0gYGZsYWdgIG1hdGNoZXMgcGhyYXNlcyB0aGF0IGFyZSB0aGUgc2FtZSBhcyBpdHMgZmxhZy5cbiAqIFRoZSBldmFsdWF0ZWQgYXJndW1lbnQgaXMgZWl0aGVyIHRydWUgb3IgZmFsc2UuXG4gKiAtIGBvcHRpb25gIG1hdGNoZXMgcGhyYXNlcyB0aGF0IHN0YXJ0cyB3aXRoIHRoZSBmbGFnLlxuICogVGhlIHBocmFzZSBhZnRlciB0aGUgZmxhZyBpcyB0aGUgZXZhbHVhdGVkIGFyZ3VtZW50LlxuICogLSBgcmVzdGAgbWF0Y2hlcyB0aGUgcmVzdCBvZiB0aGUgcGhyYXNlcy5cbiAqIEl0IGlnbm9yZXMgcGhyYXNlcyB0aGF0IG1hdGNoZXMgYSBmbGFnLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYHNlcGFyYXRlYCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSBwaHJhc2VzIGFuZCBwcm9jZXNzZXMgZWFjaCBpbmRpdmlkdWFsbHkuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIC0gYHRleHRgIG1hdGNoZXMgdGhlIGVudGlyZSB0ZXh0LCBleGNlcHQgZm9yIHRoZSBjb21tYW5kLlxuICogSXQgaWdub3JlcyBwaHJhc2VzIHRoYXQgbWF0Y2hlcyBhIGZsYWcuXG4gKiBJdCBwcmVzZXJ2ZXMgdGhlIG9yaWdpbmFsIHdoaXRlc3BhY2UgYmV0d2VlbiBwaHJhc2VzIGFuZCB0aGUgcXVvdGVzIGFyb3VuZCBwaHJhc2VzLlxuICogLSBgY29udGVudGAgbWF0Y2hlcyB0aGUgZW50aXJlIHRleHQgYXMgaXQgd2FzIGlucHV0dGVkLCBleGNlcHQgZm9yIHRoZSBjb21tYW5kLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYHJlc3RDb250ZW50YCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSB0ZXh0IGFzIGl0IHdhcyBpbnB1dHRlZC5cbiAqIEl0IHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgd2hpdGVzcGFjZSBiZXR3ZWVuIHBocmFzZXMgYW5kIHRoZSBxdW90ZXMgYXJvdW5kIHBocmFzZXMuXG4gKiAtIGBub25lYCBtYXRjaGVzIG5vdGhpbmcgYXQgYWxsIGFuZCBhbiBlbXB0eSBzdHJpbmcgd2lsbCBiZSB1c2VkIGZvciB0eXBlIG9wZXJhdGlvbnMuXG4gKi9cbmV4cG9ydCB0eXBlIEFyZ3VtZW50TWF0Y2ggPVxuXHR8IFwicGhyYXNlXCJcblx0fCBcImZsYWdcIlxuXHR8IFwib3B0aW9uXCJcblx0fCBcInJlc3RcIlxuXHR8IFwic2VwYXJhdGVcIlxuXHR8IFwidGV4dFwiXG5cdHwgXCJjb250ZW50XCJcblx0fCBcInJlc3RDb250ZW50XCJcblx0fCBcIm5vbmVcIjtcblxuLyoqXG4gKiBUaGUgdHlwZSB0aGF0IHRoZSBhcmd1bWVudCBzaG91bGQgYmUgY2FzdCB0by5cbiAqIC0gYHN0cmluZ2AgZG9lcyBub3QgY2FzdCB0byBhbnkgdHlwZS5cbiAqIC0gYGxvd2VyY2FzZWAgbWFrZXMgdGhlIGlucHV0IGxvd2VyY2FzZS5cbiAqIC0gYHVwcGVyY2FzZWAgbWFrZXMgdGhlIGlucHV0IHVwcGVyY2FzZS5cbiAqIC0gYGNoYXJDb2Rlc2AgdHJhbnNmb3JtcyB0aGUgaW5wdXQgdG8gYW4gYXJyYXkgb2YgY2hhciBjb2Rlcy5cbiAqIC0gYG51bWJlcmAgY2FzdHMgdG8gYSBudW1iZXIuXG4gKiAtIGBpbnRlZ2VyYCBjYXN0cyB0byBhbiBpbnRlZ2VyLlxuICogLSBgYmlnaW50YCBjYXN0cyB0byBhIGJpZyBpbnRlZ2VyLlxuICogLSBgdXJsYCBjYXN0cyB0byBhbiBgVVJMYCBvYmplY3QuXG4gKiAtIGBkYXRlYCBjYXN0cyB0byBhIGBEYXRlYCBvYmplY3QuXG4gKiAtIGBjb2xvcmAgY2FzdHMgYSBoZXggY29kZSB0byBhbiBpbnRlZ2VyLlxuICogLSBgY29tbWFuZEFsaWFzYCB0cmllcyB0byByZXNvbHZlIHRvIGEgY29tbWFuZCBmcm9tIGFuIGFsaWFzLlxuICogLSBgY29tbWFuZGAgbWF0Y2hlcyB0aGUgSUQgb2YgYSBjb21tYW5kLlxuICogLSBgaW5oaWJpdG9yYCBtYXRjaGVzIHRoZSBJRCBvZiBhbiBpbmhpYml0b3IuXG4gKiAtIGBsaXN0ZW5lcmAgbWF0Y2hlcyB0aGUgSUQgb2YgYSBsaXN0ZW5lci5cbiAqXG4gKiBQb3NzaWJsZSBEaXNjb3JkLXJlbGF0ZWQgdHlwZXMuXG4gKiBUaGVzZSB0eXBlcyBjYW4gYmUgcGx1cmFsIChhZGQgYW4gJ3MnIHRvIHRoZSBlbmQpIGFuZCBhIGNvbGxlY3Rpb24gb2YgbWF0Y2hpbmcgb2JqZWN0cyB3aWxsIGJlIHVzZWQuXG4gKiAtIGB1c2VyYCB0cmllcyB0byByZXNvbHZlIHRvIGEgdXNlci5cbiAqIC0gYG1lbWJlcmAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIG1lbWJlci5cbiAqIC0gYHJlbGV2YW50YCB0cmllcyB0byByZXNvbHZlIHRvIGEgcmVsZXZhbnQgdXNlciwgd29ya3MgaW4gYm90aCBndWlsZHMgYW5kIERNcy5cbiAqIC0gYGNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBjaGFubmVsLlxuICogLSBgdGV4dENoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB0ZXh0IGNoYW5uZWwuXG4gKiAtIGB2b2ljZUNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB2b2ljZSBjaGFubmVsLlxuICogLSBgc3RhZ2VDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIHRvIGEgc3RhZ2UgY2hhbm5lbC5cbiAqIC0gYHRocmVhZENoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgYSB0aHJlYWQgY2hhbm5lbC5cbiAqIC0gYHJvbGVgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSByb2xlLlxuICogLSBgZW1vamlgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBjdXN0b20gZW1vamkuXG4gKiAtIGBndWlsZGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIGd1aWxkLlxuICpcbiAqIE90aGVyIERpc2NvcmQtcmVsYXRlZCB0eXBlczpcbiAqIC0gYG1lc3NhZ2VgIHRyaWVzIHRvIGZldGNoIGEgbWVzc2FnZSBmcm9tIGFuIElEIHdpdGhpbiB0aGUgY2hhbm5lbC5cbiAqIC0gYGd1aWxkTWVzc2FnZWAgdHJpZXMgdG8gZmV0Y2ggYSBtZXNzYWdlIGZyb20gYW4gSUQgd2l0aGluIHRoZSBndWlsZC5cbiAqIC0gYHJlbGV2YW50TWVzc2FnZWAgaXMgYSBjb21iaW5hdGlvbiBvZiB0aGUgYWJvdmUsIHdvcmtzIGluIGJvdGggZ3VpbGRzIGFuZCBETXMuXG4gKiAtIGBpbnZpdGVgIHRyaWVzIHRvIGZldGNoIGFuIGludml0ZSBvYmplY3QgZnJvbSBhIGxpbmsuXG4gKiAtIGB1c2VyTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSB1c2VyLlxuICogLSBgbWVtYmVyTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSBndWlsZCBtZW1iZXIuXG4gKiAtIGBjaGFubmVsTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSBjaGFubmVsLlxuICogLSBgcm9sZU1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGEgcm9sZS5cbiAqIC0gYGVtb2ppTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYW4gZW1vamkuXG4gKlxuICogQW4gYXJyYXkgb2Ygc3RyaW5ncyBjYW4gYmUgdXNlZCB0byByZXN0cmljdCBpbnB1dCB0byBvbmx5IHRob3NlIHN0cmluZ3MsIGNhc2UgaW5zZW5zaXRpdmUuXG4gKiBUaGUgYXJyYXkgY2FuIGFsc28gY29udGFpbiBhbiBpbm5lciBhcnJheSBvZiBzdHJpbmdzLCBmb3IgYWxpYXNlcy5cbiAqIElmIHNvLCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5IHdpbGwgYmUgdXNlZCBhcyB0aGUgZmluYWwgYXJndW1lbnQuXG4gKlxuICogQSByZWd1bGFyIGV4cHJlc3Npb24gY2FuIGFsc28gYmUgdXNlZC5cbiAqIFRoZSBldmFsdWF0ZWQgYXJndW1lbnQgd2lsbCBiZSBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgYG1hdGNoYCBhbmQgYG1hdGNoZXNgIGlmIGdsb2JhbC5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRUeXBlID1cblx0fCBcInN0cmluZ1wiXG5cdHwgXCJsb3dlcmNhc2VcIlxuXHR8IFwidXBwZXJjYXNlXCJcblx0fCBcImNoYXJDb2Rlc1wiXG5cdHwgXCJudW1iZXJcIlxuXHR8IFwiaW50ZWdlclwiXG5cdHwgXCJiaWdpbnRcIlxuXHR8IFwiZW1vamludFwiXG5cdHwgXCJ1cmxcIlxuXHR8IFwiZGF0ZVwiXG5cdHwgXCJjb2xvclwiXG5cdHwgXCJ1c2VyXCJcblx0fCBcInVzZXJzXCJcblx0fCBcIm1lbWJlclwiXG5cdHwgXCJtZW1iZXJzXCJcblx0fCBcInJlbGV2YW50XCJcblx0fCBcInJlbGV2YW50c1wiXG5cdHwgXCJjaGFubmVsXCJcblx0fCBcImNoYW5uZWxzXCJcblx0fCBcInRleHRDaGFubmVsXCJcblx0fCBcInRleHRDaGFubmVsc1wiXG5cdHwgXCJ2b2ljZUNoYW5uZWxcIlxuXHR8IFwidm9pY2VDaGFubmVsc1wiXG5cdHwgXCJjYXRlZ29yeUNoYW5uZWxcIlxuXHR8IFwiY2F0ZWdvcnlDaGFubmVsc1wiXG5cdHwgXCJuZXdzQ2hhbm5lbFwiXG5cdHwgXCJuZXdzQ2hhbm5lbHNcIlxuXHR8IFwic3RvcmVDaGFubmVsXCJcblx0fCBcInN0b3JlQ2hhbm5lbHNcIlxuXHR8IFwic3RhZ2VDaGFubmVsXCJcblx0fCBcInN0YWdlQ2hhbm5lbHNcIlxuXHR8IFwidGhyZWFkQ2hhbm5lbFwiXG5cdHwgXCJ0aHJlYWRDaGFubmVsc1wiXG5cdHwgXCJyb2xlXCJcblx0fCBcInJvbGVzXCJcblx0fCBcImVtb2ppXCJcblx0fCBcImVtb2ppc1wiXG5cdHwgXCJndWlsZFwiXG5cdHwgXCJndWlsZHNcIlxuXHR8IFwibWVzc2FnZVwiXG5cdHwgXCJndWlsZE1lc3NhZ2VcIlxuXHR8IFwicmVsZXZhbnRNZXNzYWdlXCJcblx0fCBcImludml0ZVwiXG5cdHwgXCJ1c2VyTWVudGlvblwiXG5cdHwgXCJtZW1iZXJNZW50aW9uXCJcblx0fCBcImNoYW5uZWxNZW50aW9uXCJcblx0fCBcInJvbGVNZW50aW9uXCJcblx0fCBcImVtb2ppTWVudGlvblwiXG5cdHwgXCJjb21tYW5kQWxpYXNcIlxuXHR8IFwiY29tbWFuZFwiXG5cdHwgXCJpbmhpYml0b3JcIlxuXHR8IFwibGlzdGVuZXJcIlxuXHR8IChzdHJpbmcgfCBzdHJpbmdbXSlbXVxuXHR8IFJlZ0V4cFxuXHR8IHN0cmluZztcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGZvciBwcm9jZXNzaW5nIHVzZXIgaW5wdXQgdG8gdXNlIGFzIGFuIGFyZ3VtZW50LlxuICogQSB2b2lkIHJldHVybiB2YWx1ZSB3aWxsIHVzZSB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhlIGFyZ3VtZW50IG9yIHN0YXJ0IGEgcHJvbXB0LlxuICogQW55IG90aGVyIHRydXRoeSByZXR1cm4gdmFsdWUgd2lsbCBiZSB1c2VkIGFzIHRoZSBldmFsdWF0ZWQgYXJndW1lbnQuXG4gKiBJZiByZXR1cm5pbmcgYSBQcm9taXNlLCB0aGUgcmVzb2x2ZWQgdmFsdWUgd2lsbCBnbyB0aHJvdWdoIHRoZSBhYm92ZSBzdGVwcy5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBwaHJhc2UgLSBUaGUgdXNlciBpbnB1dC5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRUeXBlQ2FzdGVyID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiBhbnk7XG5cbi8qKlxuICogQSBmdW5jdGlvbiBmb3IgcHJvY2Vzc2luZyBzb21lIHZhbHVlIHRvIHVzZSBhcyBhbiBhcmd1bWVudC5cbiAqIFRoaXMgaXMgbWFpbmx5IHVzZWQgaW4gY29tcG9zaW5nIGFyZ3VtZW50IHR5cGVzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHZhbHVlIC0gU29tZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRUeXBlQ2FzdGVyXyA9IChtZXNzYWdlOiBNZXNzYWdlLCB2YWx1ZTogYW55KSA9PiBhbnk7XG5cbi8qKlxuICogRGF0YSBwYXNzZWQgdG8gZnVuY3Rpb25zIHRoYXQgcnVuIHdoZW4gdGhpbmdzIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWlsdXJlRGF0YSB7XG5cdC8qKiBUaGUgaW5wdXQgcGhyYXNlIHRoYXQgZmFpbGVkIGlmIHRoZXJlIHdhcyBvbmUsIG90aGVyd2lzZSBhbiBlbXB0eSBzdHJpbmcuICovXG5cdHBocmFzZTogc3RyaW5nO1xuXG5cdC8qKiBUaGUgdmFsdWUgdGhhdCBmYWlsZWQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIG51bGwuICovXG5cdGZhaWx1cmU6IHZvaWQgfCAoRmxhZyAmIHsgdmFsdWU6IGFueSB9KTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0cyBmb3IgYXJndW1lbnQgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWZhdWx0QXJndW1lbnRPcHRpb25zIHtcblx0LyoqIERlZmF1bHQgcHJvbXB0IG9wdGlvbnMuICovXG5cdHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucztcblxuXHQvKiogRGVmYXVsdCB0ZXh0IHNlbnQgaWYgYXJndW1lbnQgcGFyc2luZyBmYWlscy4gKi9cblx0b3RoZXJ3aXNlPzpcblx0XHR8IHN0cmluZ1xuXHRcdHwgTWVzc2FnZVBheWxvYWRcblx0XHR8IE1lc3NhZ2VPcHRpb25zXG5cdFx0fCBPdGhlcndpc2VDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdGhlcndpc2UgY29udGVudC4gKi9cblx0bW9kaWZ5T3RoZXJ3aXNlPzogT3RoZXJ3aXNlQ29udGVudE1vZGlmaWVyO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIGdldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGUgYXJndW1lbnQuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgRGVmYXVsdFZhbHVlU3VwcGxpZXIgPSAobWVzc2FnZTogTWVzc2FnZSwgZGF0YTogRmFpbHVyZURhdGEpID0+IGFueTtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGZvciB2YWxpZGF0aW5nIHBhcnNlZCBhcmd1bWVudHMuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gcGhyYXNlIC0gVGhlIHVzZXIgaW5wdXQuXG4gKiBAcGFyYW0gdmFsdWUgLSBUaGUgcGFyc2VkIHZhbHVlLlxuICovXG5leHBvcnQgdHlwZSBQYXJzZWRWYWx1ZVByZWRpY2F0ZSA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0cGhyYXNlOiBzdHJpbmcsXG5cdHZhbHVlOiBhbnlcbikgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIG1vZGlmeWluZyBhIHByb21wdCB0ZXh0LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBPdGhlcndpc2VDb250ZW50TW9kaWZpZXIgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdHRleHQ6IHN0cmluZyxcblx0ZGF0YTogRmFpbHVyZURhdGFcbikgPT5cblx0fCBzdHJpbmdcblx0fCBNZXNzYWdlUGF5bG9hZFxuXHR8IE1lc3NhZ2VPcHRpb25zXG5cdHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHJldHVybmluZyB0aGUgY29udGVudCBpZiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIE90aGVyd2lzZUNvbnRlbnRTdXBwbGllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0ZGF0YTogRmFpbHVyZURhdGFcbikgPT5cblx0fCBzdHJpbmdcblx0fCBNZXNzYWdlUGF5bG9hZFxuXHR8IE1lc3NhZ2VPcHRpb25zXG5cdHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIG1vZGlmeWluZyBhIHByb21wdCB0ZXh0LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHRleHQgLSBUZXh0IGZyb20gdGhlIHByb21wdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgUHJvbXB0Q29udGVudE1vZGlmaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHR0ZXh0OiBzdHJpbmcsXG5cdGRhdGE6IEFyZ3VtZW50UHJvbXB0RGF0YVxuKSA9PlxuXHR8IHN0cmluZ1xuXHR8IE1lc3NhZ2VQYXlsb2FkXG5cdHwgTWVzc2FnZU9wdGlvbnNcblx0fCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRleHQgZm9yIHRoZSBwcm9tcHQuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgUHJvbXB0Q29udGVudFN1cHBsaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRkYXRhOiBBcmd1bWVudFByb21wdERhdGFcbikgPT5cblx0fCBzdHJpbmdcblx0fCBNZXNzYWdlUGF5bG9hZFxuXHR8IE1lc3NhZ2VPcHRpb25zXG5cdHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcbiJdfQ==