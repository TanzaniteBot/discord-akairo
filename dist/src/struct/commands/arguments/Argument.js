"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("../../../util/Constants");
const Util_1 = __importDefault(require("../../../util/Util"));
const Flag_1 = __importDefault(require("../Flag"));
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
        this.default = typeof defaultValue === "function" ? defaultValue.bind(this) : defaultValue;
        this.otherwise = typeof otherwise === "function" ? otherwise.bind(this) : otherwise;
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
        const isInfinite = promptOptions.infinite || (this.match === Constants_1.ArgumentMatches.SEPARATE && !commandInput);
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
            if (isInfinite && input?.content.toLowerCase() === promptOptions.stopWord.toLowerCase()) {
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
        const optional = Util_1.default.choice(typeof this.prompt === "object" && this.prompt.optional, commandDefs.prompt && commandDefs.prompt.optional, handlerDefs.prompt && handlerDefs.prompt.optional);
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
            return this.default == null ? res : Util_1.default.intoCallable(this.default)(message, { phrase, failure: res });
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
            const o = typeof x === "number" || typeof x === "bigint" ? x : x.length != null ? x.length : x.size != null ? x.size : x;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHVEQUF5RTtBQUN6RSw4REFBc0M7QUFJdEMsbURBQTJCO0FBRzNCOzs7O0dBSUc7QUFDSCxNQUFxQixRQUFRO0lBQzVCLFlBQ0MsT0FBZ0IsRUFDaEIsRUFDQyxLQUFLLEdBQUcsMkJBQWUsQ0FBQyxNQUFNLEVBQzlCLElBQUksR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFDM0IsSUFBSSxHQUFHLElBQUksRUFDWCxhQUFhLEdBQUcsS0FBSyxFQUNyQixLQUFLLEdBQUcsSUFBSSxFQUNaLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLEtBQUssR0FBRyxRQUFRLEVBQ2hCLE1BQU0sR0FBRyxJQUFJLEVBQ2IsT0FBTyxFQUFFLFlBQVksR0FBRyxJQUFJLEVBQzVCLFNBQVMsR0FBRyxJQUFJLEVBQ2hCLGVBQWUsR0FBRyxJQUFJLEtBQ0YsRUFBRTtRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRWhFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBRW5DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxNQUFNLEdB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QUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzlFLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsT0FBTyxjQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQzthQUNoRDtZQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUN0QyxDQUFDLENBQUM7SUFDSCxDQUFDO0NBQ0Q7QUF6bEJELDJCQXlsQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXNzYWdlLCBNZXNzYWdlT3B0aW9ucywgTWVzc2FnZVBheWxvYWQgfSBmcm9tIFwiZGlzY29yZC5qc1wiO1xuaW1wb3J0IHsgQXJndW1lbnRNYXRjaGVzLCBBcmd1bWVudFR5cGVzIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgVXRpbCBmcm9tIFwiLi4vLi4vLi4vdXRpbC9VdGlsXCI7XG5pbXBvcnQgQWthaXJvQ2xpZW50IGZyb20gXCIuLi8uLi9Ba2Fpcm9DbGllbnRcIjtcbmltcG9ydCBDb21tYW5kIGZyb20gXCIuLi9Db21tYW5kXCI7XG5pbXBvcnQgQ29tbWFuZEhhbmRsZXIgZnJvbSBcIi4uL0NvbW1hbmRIYW5kbGVyXCI7XG5pbXBvcnQgRmxhZyBmcm9tIFwiLi4vRmxhZ1wiO1xuaW1wb3J0IFR5cGVSZXNvbHZlciBmcm9tIFwiLi9UeXBlUmVzb2x2ZXJcIjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGFyZ3VtZW50IGZvciBhIGNvbW1hbmQuXG4gKiBAcGFyYW0gY29tbWFuZCAtIENvbW1hbmQgb2YgdGhlIGFyZ3VtZW50LlxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIGZvciB0aGUgYXJndW1lbnQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFyZ3VtZW50IHtcblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdGNvbW1hbmQ6IENvbW1hbmQsXG5cdFx0e1xuXHRcdFx0bWF0Y2ggPSBBcmd1bWVudE1hdGNoZXMuUEhSQVNFLFxuXHRcdFx0dHlwZSA9IEFyZ3VtZW50VHlwZXMuU1RSSU5HLFxuXHRcdFx0ZmxhZyA9IG51bGwsXG5cdFx0XHRtdWx0aXBsZUZsYWdzID0gZmFsc2UsXG5cdFx0XHRpbmRleCA9IG51bGwsXG5cdFx0XHR1bm9yZGVyZWQgPSBmYWxzZSxcblx0XHRcdGxpbWl0ID0gSW5maW5pdHksXG5cdFx0XHRwcm9tcHQgPSBudWxsLFxuXHRcdFx0ZGVmYXVsdDogZGVmYXVsdFZhbHVlID0gbnVsbCxcblx0XHRcdG90aGVyd2lzZSA9IG51bGwsXG5cdFx0XHRtb2RpZnlPdGhlcndpc2UgPSBudWxsXG5cdFx0fTogQXJndW1lbnRPcHRpb25zID0ge31cblx0KSB7XG5cdFx0dGhpcy5jb21tYW5kID0gY29tbWFuZDtcblxuXHRcdHRoaXMubWF0Y2ggPSBtYXRjaDtcblxuXHRcdHRoaXMudHlwZSA9IHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIgPyB0eXBlLmJpbmQodGhpcykgOiB0eXBlO1xuXG5cdFx0dGhpcy5mbGFnID0gZmxhZztcblxuXHRcdHRoaXMubXVsdGlwbGVGbGFncyA9IG11bHRpcGxlRmxhZ3M7XG5cblx0XHR0aGlzLmluZGV4ID0gaW5kZXg7XG5cblx0XHR0aGlzLnVub3JkZXJlZCA9IHVub3JkZXJlZDtcblxuXHRcdHRoaXMubGltaXQgPSBsaW1pdDtcblxuXHRcdHRoaXMucHJvbXB0ID0gcHJvbXB0O1xuXG5cdFx0dGhpcy5kZWZhdWx0ID0gdHlwZW9mIGRlZmF1bHRWYWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gZGVmYXVsdFZhbHVlLmJpbmQodGhpcykgOiBkZWZhdWx0VmFsdWU7XG5cblx0XHR0aGlzLm90aGVyd2lzZSA9IHR5cGVvZiBvdGhlcndpc2UgPT09IFwiZnVuY3Rpb25cIiA/IG90aGVyd2lzZS5iaW5kKHRoaXMpIDogb3RoZXJ3aXNlO1xuXG5cdFx0dGhpcy5tb2RpZnlPdGhlcndpc2UgPSBtb2RpZnlPdGhlcndpc2U7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNsaWVudC5cblx0ICovXG5cdGdldCBjbGllbnQoKTogQWthaXJvQ2xpZW50IHtcblx0XHRyZXR1cm4gdGhpcy5jb21tYW5kLmNsaWVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCB0aGlzIGFyZ3VtZW50IGJlbG9uZ3MgdG8uXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZDogQ29tbWFuZDtcblxuXHQvKipcblx0ICogVGhlIGRlZmF1bHQgdmFsdWUgb2YgdGhlIGFyZ3VtZW50IG9yIGEgZnVuY3Rpb24gc3VwcGx5aW5nIHRoZSBkZWZhdWx0IHZhbHVlLlxuXHQgKi9cblx0cHVibGljIGRlZmF1bHQ6IERlZmF1bHRWYWx1ZVN1cHBsaWVyIHwgYW55O1xuXG5cdC8qKlxuXHQgKiAgRGVzY3JpcHRpb24gb2YgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVzY3JpcHRpb246IHN0cmluZyB8IGFueTtcblxuXHQvKipcblx0ICogVGhlIHN0cmluZyhzKSB0byB1c2UgZm9yIGZsYWcgb3Igb3B0aW9uIG1hdGNoLlxuXHQgKi9cblx0cHVibGljIGZsYWc/OiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgaGFuZGxlci5cblx0ICovXG5cdGdldCBoYW5kbGVyKCk6IENvbW1hbmRIYW5kbGVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb21tYW5kLmhhbmRsZXI7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGluZGV4IHRvIHN0YXJ0IGZyb20uXG5cdCAqL1xuXHRwdWJsaWMgaW5kZXg/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgb2YgcGhyYXNlcyB0byBtYXRjaCBmb3IgcmVzdCwgc2VwYXJhdGUsIGNvbnRlbnQsIG9yIHRleHQgbWF0Y2guXG5cdCAqL1xuXHRwdWJsaWMgbGltaXQ6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0byBtYXRjaCB0ZXh0LlxuXHQgKi9cblx0cHVibGljIG1hdGNoOiBBcmd1bWVudE1hdGNoO1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBtb2RpZnkgb3RoZXJ3aXNlIGNvbnRlbnQuXG5cdCAqL1xuXHRwdWJsaWMgbW9kaWZ5T3RoZXJ3aXNlOiBPdGhlcndpc2VDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgdG8gcHJvY2VzcyBtdWx0aXBsZSBvcHRpb24gZmxhZ3MgaW5zdGVhZCBvZiBqdXN0IHRoZSBmaXJzdC5cblx0ICovXG5cdHB1YmxpYyBtdWx0aXBsZUZsYWdzOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29udGVudCBvciBmdW5jdGlvbiBzdXBwbHlpbmcgdGhlIGNvbnRlbnQgc2VudCB3aGVuIGFyZ3VtZW50IHBhcnNpbmcgZmFpbHMuXG5cdCAqL1xuXHRwdWJsaWMgb3RoZXJ3aXNlPzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IE90aGVyd2lzZUNvbnRlbnRTdXBwbGllcjtcblxuXHQvKipcblx0ICogVGhlIHByb21wdCBvcHRpb25zLlxuXHQgKi9cblx0cHVibGljIHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucyB8IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSB0eXBlIHRvIGNhc3QgdG8gb3IgYSBmdW5jdGlvbiB0byB1c2UgdG8gY2FzdC5cblx0ICovXG5cdHB1YmxpYyB0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoZSBhcmd1bWVudCBpcyB1bm9yZGVyZWQuXG5cdCAqL1xuXHRwdWJsaWMgdW5vcmRlcmVkOiBib29sZWFuIHwgbnVtYmVyIHwgbnVtYmVyW107XG5cblx0LyoqXG5cdCAqIENhc3RzIGEgcGhyYXNlIHRvIHRoaXMgYXJndW1lbnQncyB0eXBlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwaHJhc2UgLSBQaHJhc2UgdG8gcHJvY2Vzcy5cblx0ICovXG5cdHB1YmxpYyBjYXN0KG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gQXJndW1lbnQuY2FzdCh0aGlzLnR5cGUsIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb2xsZWN0cyBpbnB1dCBmcm9tIHRoZSB1c2VyIGJ5IHByb21wdGluZy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHByb21wdC5cblx0ICogQHBhcmFtIGNvbW1hbmRJbnB1dCAtIFByZXZpb3VzIGlucHV0IGZyb20gY29tbWFuZCBpZiB0aGVyZSB3YXMgb25lLlxuXHQgKiBAcGFyYW0gcGFyc2VkSW5wdXQgLSBQcmV2aW91cyBwYXJzZWQgaW5wdXQgZnJvbSBjb21tYW5kIGlmIHRoZXJlIHdhcyBvbmUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgY29sbGVjdChtZXNzYWdlOiBNZXNzYWdlLCBjb21tYW5kSW5wdXQ6IHN0cmluZyA9IFwiXCIsIHBhcnNlZElucHV0OiBhbnkgPSBudWxsKTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgcHJvbXB0T3B0aW9uczogYW55ID0ge307XG5cdFx0T2JqZWN0LmFzc2lnbihwcm9tcHRPcHRpb25zLCB0aGlzLmhhbmRsZXIuYXJndW1lbnREZWZhdWx0cy5wcm9tcHQpO1xuXHRcdE9iamVjdC5hc3NpZ24ocHJvbXB0T3B0aW9ucywgdGhpcy5jb21tYW5kLmFyZ3VtZW50RGVmYXVsdHMucHJvbXB0KTtcblx0XHRPYmplY3QuYXNzaWduKHByb21wdE9wdGlvbnMsIHRoaXMucHJvbXB0IHx8IHt9KTtcblxuXHRcdGNvbnN0IGlzSW5maW5pdGUgPSBwcm9tcHRPcHRpb25zLmluZmluaXRlIHx8ICh0aGlzLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuU0VQQVJBVEUgJiYgIWNvbW1hbmRJbnB1dCk7XG5cdFx0Y29uc3QgYWRkaXRpb25hbFJldHJ5ID0gTnVtYmVyKEJvb2xlYW4oY29tbWFuZElucHV0KSk7XG5cdFx0Y29uc3QgdmFsdWVzID0gaXNJbmZpbml0ZSA/IFtdIDogbnVsbDtcblxuXHRcdGNvbnN0IGdldFRleHQgPSBhc3luYyAocHJvbXB0VHlwZSwgcHJvbXB0ZXIsIHJldHJ5Q291bnQsIGlucHV0TWVzc2FnZSwgaW5wdXRQaHJhc2UsIGlucHV0UGFyc2VkKSA9PiB7XG5cdFx0XHRsZXQgdGV4dCA9IGF3YWl0IFV0aWwuaW50b0NhbGxhYmxlKHByb21wdGVyKS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHtcblx0XHRcdFx0cmV0cmllczogcmV0cnlDb3VudCxcblx0XHRcdFx0aW5maW5pdGU6IGlzSW5maW5pdGUsXG5cdFx0XHRcdG1lc3NhZ2U6IGlucHV0TWVzc2FnZSxcblx0XHRcdFx0cGhyYXNlOiBpbnB1dFBocmFzZSxcblx0XHRcdFx0ZmFpbHVyZTogaW5wdXRQYXJzZWRcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0ZXh0KSkge1xuXHRcdFx0XHR0ZXh0ID0gdGV4dC5qb2luKFwiXFxuXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBtb2RpZmllciA9IHtcblx0XHRcdFx0c3RhcnQ6IHByb21wdE9wdGlvbnMubW9kaWZ5U3RhcnQsXG5cdFx0XHRcdHJldHJ5OiBwcm9tcHRPcHRpb25zLm1vZGlmeVJldHJ5LFxuXHRcdFx0XHR0aW1lb3V0OiBwcm9tcHRPcHRpb25zLm1vZGlmeVRpbWVvdXQsXG5cdFx0XHRcdGVuZGVkOiBwcm9tcHRPcHRpb25zLm1vZGlmeUVuZGVkLFxuXHRcdFx0XHRjYW5jZWw6IHByb21wdE9wdGlvbnMubW9kaWZ5Q2FuY2VsXG5cdFx0XHR9W3Byb21wdFR5cGVdO1xuXG5cdFx0XHRpZiAobW9kaWZpZXIpIHtcblx0XHRcdFx0dGV4dCA9IGF3YWl0IG1vZGlmaWVyLmNhbGwodGhpcywgbWVzc2FnZSwgdGV4dCwge1xuXHRcdFx0XHRcdHJldHJpZXM6IHJldHJ5Q291bnQsXG5cdFx0XHRcdFx0aW5maW5pdGU6IGlzSW5maW5pdGUsXG5cdFx0XHRcdFx0bWVzc2FnZTogaW5wdXRNZXNzYWdlLFxuXHRcdFx0XHRcdHBocmFzZTogaW5wdXRQaHJhc2UsXG5cdFx0XHRcdFx0ZmFpbHVyZTogaW5wdXRQYXJzZWRcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGV4dCkpIHtcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5qb2luKFwiXFxuXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdH07XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuXHRcdGNvbnN0IHByb21wdE9uZSA9IGFzeW5jIChwcmV2TWVzc2FnZSwgcHJldklucHV0LCBwcmV2UGFyc2VkLCByZXRyeUNvdW50KSA9PiB7XG5cdFx0XHRsZXQgc2VudFN0YXJ0O1xuXHRcdFx0Ly8gVGhpcyBpcyBlaXRoZXIgYSByZXRyeSBwcm9tcHQsIHRoZSBzdGFydCBvZiBhIG5vbi1pbmZpbml0ZSwgb3IgdGhlIHN0YXJ0IG9mIGFuIGluZmluaXRlLlxuXHRcdFx0aWYgKHJldHJ5Q291bnQgIT09IDEgfHwgIWlzSW5maW5pdGUgfHwgIXZhbHVlcz8ubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnN0IHByb21wdFR5cGUgPSByZXRyeUNvdW50ID09PSAxID8gXCJzdGFydFwiIDogXCJyZXRyeVwiO1xuXHRcdFx0XHRjb25zdCBwcm9tcHRlciA9IHJldHJ5Q291bnQgPT09IDEgPyBwcm9tcHRPcHRpb25zLnN0YXJ0IDogcHJvbXB0T3B0aW9ucy5yZXRyeTtcblx0XHRcdFx0Y29uc3Qgc3RhcnRUZXh0ID0gYXdhaXQgZ2V0VGV4dChwcm9tcHRUeXBlLCBwcm9tcHRlciwgcmV0cnlDb3VudCwgcHJldk1lc3NhZ2UsIHByZXZJbnB1dCwgcHJldlBhcnNlZCk7XG5cblx0XHRcdFx0aWYgKHN0YXJ0VGV4dCkge1xuXHRcdFx0XHRcdHNlbnRTdGFydCA9IGF3YWl0IChtZXNzYWdlLnV0aWwgfHwgbWVzc2FnZS5jaGFubmVsKS5zZW5kKHN0YXJ0VGV4dCk7XG5cdFx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCAmJiBzZW50U3RhcnQpIHtcblx0XHRcdFx0XHRcdG1lc3NhZ2UudXRpbC5zZXRFZGl0YWJsZShmYWxzZSk7XG5cdFx0XHRcdFx0XHRtZXNzYWdlLnV0aWwuc2V0TGFzdFJlc3BvbnNlKHNlbnRTdGFydCk7XG5cdFx0XHRcdFx0XHRtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50U3RhcnQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaW5wdXQ7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpbnB1dCA9IChcblx0XHRcdFx0XHRhd2FpdCBtZXNzYWdlLmNoYW5uZWwuYXdhaXRNZXNzYWdlcyh7XG5cdFx0XHRcdFx0XHRmaWx0ZXI6IG0gPT4gbS5hdXRob3IuaWQgPT09IG1lc3NhZ2UuYXV0aG9yLmlkLFxuXHRcdFx0XHRcdFx0bWF4OiAxLFxuXHRcdFx0XHRcdFx0dGltZTogcHJvbXB0T3B0aW9ucy50aW1lLFxuXHRcdFx0XHRcdFx0ZXJyb3JzOiBbXCJ0aW1lXCJdXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KS5maXJzdCgpO1xuXHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShpbnB1dCk7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0Y29uc3QgdGltZW91dFRleHQgPSBhd2FpdCBnZXRUZXh0KFwidGltZW91dFwiLCBwcm9tcHRPcHRpb25zLnRpbWVvdXQsIHJldHJ5Q291bnQsIHByZXZNZXNzYWdlLCBwcmV2SW5wdXQsIFwiXCIpO1xuXHRcdFx0XHRpZiAodGltZW91dFRleHQpIHtcblx0XHRcdFx0XHRjb25zdCBzZW50VGltZW91dCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHRpbWVvdXRUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50VGltZW91dCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gRmxhZy5jYW5jZWwoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHByb21wdE9wdGlvbnMuYnJlYWtvdXQpIHtcblx0XHRcdFx0Y29uc3QgbG9va3NMaWtlID0gYXdhaXQgdGhpcy5oYW5kbGVyLnBhcnNlQ29tbWFuZChpbnB1dCk7XG5cdFx0XHRcdGlmIChsb29rc0xpa2UgJiYgbG9va3NMaWtlLmNvbW1hbmQpIHJldHVybiBGbGFnLnJldHJ5KGlucHV0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGlucHV0Py5jb250ZW50LnRvTG93ZXJDYXNlKCkgPT09IHByb21wdE9wdGlvbnMuY2FuY2VsV29yZC50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdGNvbnN0IGNhbmNlbFRleHQgPSBhd2FpdCBnZXRUZXh0KFwiY2FuY2VsXCIsIHByb21wdE9wdGlvbnMuY2FuY2VsLCByZXRyeUNvdW50LCBpbnB1dCwgaW5wdXQ/LmNvbnRlbnQsIFwiY2FuY2VsXCIpO1xuXHRcdFx0XHRpZiAoY2FuY2VsVGV4dCkge1xuXHRcdFx0XHRcdGNvbnN0IHNlbnRDYW5jZWwgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZChjYW5jZWxUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50Q2FuY2VsKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaXNJbmZpbml0ZSAmJiBpbnB1dD8uY29udGVudC50b0xvd2VyQ2FzZSgpID09PSBwcm9tcHRPcHRpb25zLnN0b3BXb3JkLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0aWYgKCF2YWx1ZXM/Lmxlbmd0aCkgcmV0dXJuIHByb21wdE9uZShpbnB1dCwgaW5wdXQ/LmNvbnRlbnQsIG51bGwsIHJldHJ5Q291bnQgKyAxKTtcblx0XHRcdFx0cmV0dXJuIHZhbHVlcztcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcGFyc2VkVmFsdWUgPSBhd2FpdCB0aGlzLmNhc3QoaW5wdXQsIGlucHV0LmNvbnRlbnQpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShwYXJzZWRWYWx1ZSkpIHtcblx0XHRcdFx0aWYgKHJldHJ5Q291bnQgPD0gcHJvbXB0T3B0aW9ucy5yZXRyaWVzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHByb21wdE9uZShpbnB1dCwgaW5wdXQ/LmNvbnRlbnQsIHBhcnNlZFZhbHVlLCByZXRyeUNvdW50ICsgMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBlbmRlZFRleHQgPSBhd2FpdCBnZXRUZXh0KFwiZW5kZWRcIiwgcHJvbXB0T3B0aW9ucy5lbmRlZCwgcmV0cnlDb3VudCwgaW5wdXQsIGlucHV0Py5jb250ZW50LCBcInN0b3BcIik7XG5cdFx0XHRcdGlmIChlbmRlZFRleHQpIHtcblx0XHRcdFx0XHRjb25zdCBzZW50RW5kZWQgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZChlbmRlZFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRFbmRlZCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gRmxhZy5jYW5jZWwoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGlzSW5maW5pdGUpIHtcblx0XHRcdFx0dmFsdWVzLnB1c2gocGFyc2VkVmFsdWUpO1xuXHRcdFx0XHRjb25zdCBsaW1pdCA9IHByb21wdE9wdGlvbnMubGltaXQ7XG5cdFx0XHRcdGlmICh2YWx1ZXMubGVuZ3RoIDwgbGltaXQpIHJldHVybiBwcm9tcHRPbmUobWVzc2FnZSwgaW5wdXQuY29udGVudCwgcGFyc2VkVmFsdWUsIDEpO1xuXG5cdFx0XHRcdHJldHVybiB2YWx1ZXM7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBwYXJzZWRWYWx1ZTtcblx0XHR9O1xuXG5cdFx0dGhpcy5oYW5kbGVyLmFkZFByb21wdChtZXNzYWdlLmNoYW5uZWwsIG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRjb25zdCByZXR1cm5WYWx1ZSA9IGF3YWl0IHByb21wdE9uZShtZXNzYWdlLCBjb21tYW5kSW5wdXQsIHBhcnNlZElucHV0LCAxICsgYWRkaXRpb25hbFJldHJ5KTtcblx0XHRpZiAodGhpcy5oYW5kbGVyLmNvbW1hbmRVdGlsICYmIG1lc3NhZ2UudXRpbCkge1xuXHRcdFx0bWVzc2FnZS51dGlsLnNldEVkaXRhYmxlKGZhbHNlKTtcblx0XHR9XG5cblx0XHR0aGlzLmhhbmRsZXIucmVtb3ZlUHJvbXB0KG1lc3NhZ2UuY2hhbm5lbCwgbWVzc2FnZS5hdXRob3IpO1xuXHRcdHJldHVybiByZXR1cm5WYWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm9jZXNzZXMgdGhlIHR5cGUgY2FzdGluZyBhbmQgcHJvbXB0aW5nIG9mIHRoZSBhcmd1bWVudCBmb3IgYSBwaHJhc2UuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwaHJhc2UgLSBUaGUgcGhyYXNlIHRvIHByb2Nlc3MuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcHJvY2VzcyhtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZyk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IGNvbW1hbmREZWZzID0gdGhpcy5jb21tYW5kLmFyZ3VtZW50RGVmYXVsdHM7XG5cdFx0Y29uc3QgaGFuZGxlckRlZnMgPSB0aGlzLmhhbmRsZXIuYXJndW1lbnREZWZhdWx0cztcblx0XHRjb25zdCBvcHRpb25hbCA9IFV0aWwuY2hvaWNlKFxuXHRcdFx0dHlwZW9mIHRoaXMucHJvbXB0ID09PSBcIm9iamVjdFwiICYmIHRoaXMucHJvbXB0Lm9wdGlvbmFsLFxuXHRcdFx0Y29tbWFuZERlZnMucHJvbXB0ICYmIGNvbW1hbmREZWZzLnByb21wdC5vcHRpb25hbCxcblx0XHRcdGhhbmRsZXJEZWZzLnByb21wdCAmJiBoYW5kbGVyRGVmcy5wcm9tcHQub3B0aW9uYWxcblx0XHQpO1xuXG5cdFx0Y29uc3QgZG9PdGhlcndpc2UgPSBhc3luYyBmYWlsdXJlID0+IHtcblx0XHRcdGNvbnN0IG90aGVyd2lzZSA9IFV0aWwuY2hvaWNlKHRoaXMub3RoZXJ3aXNlLCBjb21tYW5kRGVmcy5vdGhlcndpc2UsIGhhbmRsZXJEZWZzLm90aGVyd2lzZSk7XG5cblx0XHRcdGNvbnN0IG1vZGlmeU90aGVyd2lzZSA9IFV0aWwuY2hvaWNlKFxuXHRcdFx0XHR0aGlzLm1vZGlmeU90aGVyd2lzZSxcblx0XHRcdFx0Y29tbWFuZERlZnMubW9kaWZ5T3RoZXJ3aXNlLFxuXHRcdFx0XHRoYW5kbGVyRGVmcy5tb2RpZnlPdGhlcndpc2Vcblx0XHRcdCk7XG5cblx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUob3RoZXJ3aXNlKS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHtcblx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlXG5cdFx0XHR9KTtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtb2RpZnlPdGhlcndpc2UpIHtcblx0XHRcdFx0dGV4dCA9IGF3YWl0IG1vZGlmeU90aGVyd2lzZS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHRleHQsIHtcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0ZmFpbHVyZVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGV4dCkpIHtcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5qb2luKFwiXFxuXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IHNlbnQgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZCh0ZXh0KTtcblx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdH07XG5cblx0XHRpZiAoIXBocmFzZSAmJiBvcHRpb25hbCkge1xuXHRcdFx0aWYgKHRoaXMub3RoZXJ3aXNlICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIGRvT3RoZXJ3aXNlKG51bGwpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5kZWZhdWx0KShtZXNzYWdlLCB7XG5cdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0ZmFpbHVyZTogbnVsbFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzID0gYXdhaXQgdGhpcy5jYXN0KG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRpZiAodGhpcy5vdGhlcndpc2UgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gZG9PdGhlcndpc2UocmVzKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMucHJvbXB0ICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY29sbGVjdChtZXNzYWdlLCBwaHJhc2UsIHJlcyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmRlZmF1bHQgPT0gbnVsbCA/IHJlcyA6IFV0aWwuaW50b0NhbGxhYmxlKHRoaXMuZGVmYXVsdCkobWVzc2FnZSwgeyBwaHJhc2UsIGZhaWx1cmU6IHJlcyB9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhc3RzIGEgcGhyYXNlIHRvIHRoaXMgYXJndW1lbnQncyB0eXBlLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIGNhc3QgdG8uXG5cdCAqIEBwYXJhbSByZXNvbHZlciAtIFRoZSB0eXBlIHJlc29sdmVyLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwaHJhc2UgLSBQaHJhc2UgdG8gcHJvY2Vzcy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgY2FzdChcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsXG5cdFx0cmVzb2x2ZXI6IFR5cGVSZXNvbHZlcixcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBocmFzZTogc3RyaW5nXG5cdCk6IFByb21pc2U8YW55PiB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodHlwZSkpIHtcblx0XHRcdGZvciAoY29uc3QgZW50cnkgb2YgdHlwZSkge1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShlbnRyeSkpIHtcblx0XHRcdFx0XHRpZiAoZW50cnkuc29tZSh0ID0+IHQudG9Mb3dlckNhc2UoKSA9PT0gcGhyYXNlLnRvTG93ZXJDYXNlKCkpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZW50cnlbMF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGVudHJ5LnRvTG93ZXJDYXNlKCkgPT09IHBocmFzZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVudHJ5O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRsZXQgcmVzID0gdHlwZShtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKHJlcykpIHJlcyA9IGF3YWl0IHJlcztcblx0XHRcdHJldHVybiByZXM7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdGNvbnN0IG1hdGNoID0gcGhyYXNlLm1hdGNoKHR5cGUpO1xuXHRcdFx0aWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG5cblx0XHRcdGNvbnN0IG1hdGNoZXMgPSBbXTtcblxuXHRcdFx0aWYgKHR5cGUuZ2xvYmFsKSB7XG5cdFx0XHRcdGxldCBtYXRjaGVkO1xuXG5cdFx0XHRcdHdoaWxlICgobWF0Y2hlZCA9IHR5cGUuZXhlYyhwaHJhc2UpKSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0bWF0Y2hlcy5wdXNoKG1hdGNoZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IG1hdGNoLCBtYXRjaGVzIH07XG5cdFx0fVxuXG5cdFx0aWYgKHJlc29sdmVyLnR5cGUodHlwZSkpIHtcblx0XHRcdGxldCByZXMgPSByZXNvbHZlci50eXBlKHR5cGUpPy5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UocmVzKSkgcmVzID0gYXdhaXQgcmVzO1xuXHRcdFx0cmV0dXJuIHJlcztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGhyYXNlIHx8IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBpcyB0aGUgbGVmdC10by1yaWdodCBjb21wb3NpdGlvbiBvZiB0aGUgZ2l2ZW4gdHlwZXMuXG5cdCAqIElmIGFueSBvZiB0aGUgdHlwZXMgZmFpbHMsIHRoZSBlbnRpcmUgY29tcG9zaXRpb24gZmFpbHMuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgY29tcG9zZSguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGxldCBhY2MgPSBwaHJhc2U7XG5cdFx0XHRmb3IgKGxldCBlbnRyeSBvZiB0eXBlcykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5ID09PSBcImZ1bmN0aW9uXCIpIGVudHJ5ID0gZW50cnkuYmluZCh0aGlzKTtcblx0XHRcdFx0YWNjID0gYXdhaXQgQXJndW1lbnQuY2FzdChlbnRyeSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBhY2MpO1xuXHRcdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKGFjYykpIHJldHVybiBhY2M7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhY2M7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IGlzIHRoZSBsZWZ0LXRvLXJpZ2h0IGNvbXBvc2l0aW9uIG9mIHRoZSBnaXZlbiB0eXBlcy5cblx0ICogSWYgYW55IG9mIHRoZSB0eXBlcyBmYWlscywgdGhlIGNvbXBvc2l0aW9uIHN0aWxsIGNvbnRpbnVlcyB3aXRoIHRoZSBmYWlsdXJlIHBhc3NlZCBvbi5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBjb21wb3NlV2l0aEZhaWx1cmUoLi4udHlwZXM6IChBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpW10pOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRsZXQgYWNjID0gcGhyYXNlO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGFjYyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgYWNjKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGFjYztcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBzb21ldGhpbmcgaXMgbnVsbCwgdW5kZWZpbmVkLCBvciBhIGZhaWwgZmxhZy5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzRmFpbHVyZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgbnVsbCB8IHVuZGVmaW5lZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pIHtcblx0XHRyZXR1cm4gdmFsdWUgPT0gbnVsbCB8fCBGbGFnLmlzKHZhbHVlLCBcImZhaWxcIik7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAocHJvZHVjdCB0eXBlKS5cblx0ICogT25seSBpbnB1dHMgd2hlcmUgZWFjaCB0eXBlIHJlc29sdmVzIHdpdGggYSBub24tdm9pZCB2YWx1ZSBhcmUgdmFsaWQuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcHJvZHVjdCguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGNvbnN0IHJlc3VsdHMgPSBbXTtcblx0XHRcdGZvciAobGV0IGVudHJ5IG9mIHR5cGVzKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZW50cnkgPT09IFwiZnVuY3Rpb25cIikgZW50cnkgPSBlbnRyeS5iaW5kKHRoaXMpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHJlcztcblx0XHRcdFx0cmVzdWx0cy5wdXNoKHJlcyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHRzO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgd2hlcmUgdGhlIHBhcnNlZCB2YWx1ZSBtdXN0IGJlIHdpdGhpbiBhIHJhbmdlLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIG1pbiAtIE1pbmltdW0gdmFsdWUuXG5cdCAqIEBwYXJhbSBtYXggLSBNYXhpbXVtIHZhbHVlLlxuXHQgKiBAcGFyYW0gaW5jbHVzaXZlIC0gV2hldGhlciBvciBub3QgdG8gYmUgaW5jbHVzaXZlIG9uIHRoZSB1cHBlciBib3VuZC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcmFuZ2UoXG5cdFx0dHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLFxuXHRcdG1pbjogbnVtYmVyLFxuXHRcdG1heDogbnVtYmVyLFxuXHRcdGluY2x1c2l2ZSA9IGZhbHNlXG5cdCk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIEFyZ3VtZW50LnZhbGlkYXRlKHR5cGUsIChtc2csIHAsIHgpID0+IHtcblx0XHRcdGNvbnN0IG8gPVxuXHRcdFx0XHR0eXBlb2YgeCA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgeCA9PT0gXCJiaWdpbnRcIiA/IHggOiB4Lmxlbmd0aCAhPSBudWxsID8geC5sZW5ndGggOiB4LnNpemUgIT0gbnVsbCA/IHguc2l6ZSA6IHg7XG5cblx0XHRcdHJldHVybiBvID49IG1pbiAmJiAoaW5jbHVzaXZlID8gbyA8PSBtYXggOiBvIDwgbWF4KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IHBhcnNlcyBhcyBub3JtYWwgYnV0IGFsc28gdGFncyBpdCB3aXRoIHNvbWUgZGF0YS5cblx0ICogUmVzdWx0IGlzIGluIGFuIG9iamVjdCBgeyB0YWcsIHZhbHVlIH1gIGFuZCB3cmFwcGVkIGluIGBGbGFnLmZhaWxgIHdoZW4gZmFpbGVkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHRhZyAtIFRhZyB0byBhZGQuIERlZmF1bHRzIHRvIHRoZSBgdHlwZWAgYXJndW1lbnQsIHNvIHVzZWZ1bCBpZiBpdCBpcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGFnZ2VkKHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlciwgdGFnOiBhbnkgPSB0eXBlKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHR5cGUgPSB0eXBlLmJpbmQodGhpcyk7XG5cdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KHR5cGUsIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkge1xuXHRcdFx0XHRyZXR1cm4gRmxhZy5mYWlsKHsgdGFnLCB2YWx1ZTogcmVzIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyB0YWcsIHZhbHVlOiByZXMgfTtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIGZyb20gbXVsdGlwbGUgdHlwZXMgKHVuaW9uIHR5cGUpLlxuXHQgKiBUaGUgZmlyc3QgdHlwZSB0aGF0IHJlc29sdmVzIHRvIGEgbm9uLXZvaWQgdmFsdWUgaXMgdXNlZC5cblx0ICogRWFjaCB0eXBlIHdpbGwgYWxzbyBiZSB0YWdnZWQgdXNpbmcgYHRhZ2dlZGAgd2l0aCB0aGVtc2VsdmVzLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHRhZ2dlZFVuaW9uKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0ZW50cnkgPSBBcmd1bWVudC50YWdnZWQoZW50cnkpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRcdGlmICghQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBwYXJzZXMgYXMgbm9ybWFsIGJ1dCBhbHNvIHRhZ3MgaXQgd2l0aCBzb21lIGRhdGEgYW5kIGNhcnJpZXMgdGhlIG9yaWdpbmFsIGlucHV0LlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IHRhZywgaW5wdXQsIHZhbHVlIH1gIGFuZCB3cmFwcGVkIGluIGBGbGFnLmZhaWxgIHdoZW4gZmFpbGVkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHRhZyAtIFRhZyB0byBhZGQuIERlZmF1bHRzIHRvIHRoZSBgdHlwZWAgYXJndW1lbnQsIHNvIHVzZWZ1bCBpZiBpdCBpcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGFnZ2VkV2l0aElucHV0KHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlciwgdGFnOiBhbnkgPSB0eXBlKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHR5cGUgPSB0eXBlLmJpbmQodGhpcyk7XG5cdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KHR5cGUsIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkge1xuXHRcdFx0XHRyZXR1cm4gRmxhZy5mYWlsKHsgdGFnLCBpbnB1dDogcGhyYXNlLCB2YWx1ZTogcmVzIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyB0YWcsIGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfTtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIGZyb20gbXVsdGlwbGUgdHlwZXMgKHVuaW9uIHR5cGUpLlxuXHQgKiBUaGUgZmlyc3QgdHlwZSB0aGF0IHJlc29sdmVzIHRvIGEgbm9uLXZvaWQgdmFsdWUgaXMgdXNlZC5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB1bmlvbiguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGZvciAobGV0IGVudHJ5IG9mIHR5cGVzKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZW50cnkgPT09IFwiZnVuY3Rpb25cIikgZW50cnkgPSBlbnRyeS5iaW5kKHRoaXMpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRcdGlmICghQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgd2l0aCBleHRyYSB2YWxpZGF0aW9uLlxuXHQgKiBJZiB0aGUgcHJlZGljYXRlIGlzIG5vdCB0cnVlLCB0aGUgdmFsdWUgaXMgY29uc2lkZXJlZCBpbnZhbGlkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHByZWRpY2F0ZSAtIFRoZSBwcmVkaWNhdGUgZnVuY3Rpb24uXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHZhbGlkYXRlKHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlciwgcHJlZGljYXRlOiBQYXJzZWRWYWx1ZVByZWRpY2F0ZSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdCh0eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHRpZiAoIXByZWRpY2F0ZS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBocmFzZSwgcmVzKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBwYXJzZXMgYXMgbm9ybWFsIGJ1dCBhbHNvIGNhcnJpZXMgdGhlIG9yaWdpbmFsIGlucHV0LlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IGlucHV0LCB2YWx1ZSB9YCBhbmQgd3JhcHBlZCBpbiBgRmxhZy5mYWlsYCB3aGVuIGZhaWxlZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHdpdGhJbnB1dCh0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikgdHlwZSA9IHR5cGUuYmluZCh0aGlzKTtcblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QodHlwZSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRcdHJldHVybiBGbGFnLmZhaWwoeyBpbnB1dDogcGhyYXNlLCB2YWx1ZTogcmVzIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyBpbnB1dDogcGhyYXNlLCB2YWx1ZTogcmVzIH07XG5cdFx0fTtcblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGhvdyBhbiBhcmd1bWVudCBwYXJzZXMgdGV4dC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudE9wdGlvbnMge1xuXHQvKipcblx0ICogRGVmYXVsdCB2YWx1ZSBpZiBubyBpbnB1dCBvciBkaWQgbm90IGNhc3QgY29ycmVjdGx5LlxuXHQgKiBJZiB1c2luZyBhIGZsYWcgbWF0Y2gsIHNldHRpbmcgdGhlIGRlZmF1bHQgdmFsdWUgdG8gYSBub24tdm9pZCB2YWx1ZSBpbnZlcnNlcyB0aGUgcmVzdWx0LlxuXHQgKi9cblx0ZGVmYXVsdD86IERlZmF1bHRWYWx1ZVN1cHBsaWVyIHwgYW55O1xuXG5cdC8qKiBUaGUgZGVzY3JpcHRpb24gb2YgdGhlIGFyZ3VtZW50ICovXG5cdGRlc2NyaXB0aW9uPzogc3RyaW5nIHwgYW55IHwgYW55W107XG5cblx0LyoqIFRoZSBzdHJpbmcocykgdG8gdXNlIGFzIHRoZSBmbGFnIGZvciBmbGFnIG9yIG9wdGlvbiBtYXRjaC4gKi9cblx0ZmxhZz86IHN0cmluZyB8IHN0cmluZ1tdO1xuXG5cdC8qKiAgSUQgb2YgdGhlIGFyZ3VtZW50IGZvciB1c2UgaW4gdGhlIGFyZ3Mgb2JqZWN0LiBUaGlzIGRvZXMgbm90aGluZyBpbnNpZGUgYW4gQXJndW1lbnRHZW5lcmF0b3IuICovXG5cdGlkPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBJbmRleCBvZiBwaHJhc2UgdG8gc3RhcnQgZnJvbS4gQXBwbGljYWJsZSB0byBwaHJhc2UsIHRleHQsIGNvbnRlbnQsIHJlc3QsIG9yIHNlcGFyYXRlIG1hdGNoIG9ubHkuXG5cdCAqIElnbm9yZWQgd2hlbiB1c2VkIHdpdGggdGhlIHVub3JkZXJlZCBvcHRpb24uXG5cdCAqL1xuXHRpbmRleD86IG51bWJlcjtcblxuXHQvKipcblx0ICogQW1vdW50IG9mIHBocmFzZXMgdG8gbWF0Y2ggd2hlbiBtYXRjaGluZyBtb3JlIHRoYW4gb25lLlxuXHQgKiBBcHBsaWNhYmxlIHRvIHRleHQsIGNvbnRlbnQsIHJlc3QsIG9yIHNlcGFyYXRlIG1hdGNoIG9ubHkuXG5cdCAqIERlZmF1bHRzIHRvIGluZmluaXR5LlxuXHQgKi9cblx0bGltaXQ/OiBudW1iZXI7XG5cblx0LyoqIE1ldGhvZCB0byBtYXRjaCB0ZXh0LiBEZWZhdWx0cyB0byAncGhyYXNlJy4gKi9cblx0bWF0Y2g/OiBBcmd1bWVudE1hdGNoO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgb3RoZXJ3aXNlIGNvbnRlbnQuICovXG5cdG1vZGlmeU90aGVyd2lzZT86IE90aGVyd2lzZUNvbnRlbnRNb2RpZmllcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gaGF2ZSBmbGFncyBwcm9jZXNzIG11bHRpcGxlIGlucHV0cy5cblx0ICogRm9yIG9wdGlvbiBmbGFncywgdGhpcyB3b3JrcyBsaWtlIHRoZSBzZXBhcmF0ZSBtYXRjaDsgdGhlIGxpbWl0IG9wdGlvbiB3aWxsIGFsc28gd29yayBoZXJlLlxuXHQgKiBGb3IgZmxhZ3MsIHRoaXMgd2lsbCBjb3VudCB0aGUgbnVtYmVyIG9mIG9jY3VycmVuY2VzLlxuXHQgKi9cblx0bXVsdGlwbGVGbGFncz86IGJvb2xlYW47XG5cblx0LyoqIFRleHQgc2VudCBpZiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLiBUaGlzIG92ZXJyaWRlcyB0aGUgYGRlZmF1bHRgIG9wdGlvbiBhbmQgYWxsIHByb21wdCBvcHRpb25zLiAqL1xuXHRvdGhlcndpc2U/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgT3RoZXJ3aXNlQ29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBQcm9tcHQgb3B0aW9ucyBmb3Igd2hlbiB1c2VyIGRvZXMgbm90IHByb3ZpZGUgaW5wdXQuICovXG5cdHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucyB8IGJvb2xlYW47XG5cblx0LyoqIFR5cGUgdG8gY2FzdCB0by4gKi9cblx0dHlwZT86IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcjtcblxuXHQvKipcblx0ICogTWFya3MgdGhlIGFyZ3VtZW50IGFzIHVub3JkZXJlZC5cblx0ICogRWFjaCBwaHJhc2UgaXMgZXZhbHVhdGVkIGluIG9yZGVyIHVudGlsIG9uZSBtYXRjaGVzIChubyBpbnB1dCBhdCBhbGwgbWVhbnMgbm8gZXZhbHVhdGlvbikuXG5cdCAqIFBhc3NpbmcgaW4gYSBudW1iZXIgZm9yY2VzIGV2YWx1YXRpb24gZnJvbSB0aGF0IGluZGV4IG9ud2FyZHMuXG5cdCAqIFBhc3NpbmcgaW4gYW4gYXJyYXkgb2YgbnVtYmVycyBmb3JjZXMgZXZhbHVhdGlvbiBvbiB0aG9zZSBpbmRpY2VzIG9ubHkuXG5cdCAqIElmIHRoZXJlIGlzIGEgbWF0Y2gsIHRoYXQgaW5kZXggaXMgY29uc2lkZXJlZCB1c2VkIGFuZCBmdXR1cmUgdW5vcmRlcmVkIGFyZ3Mgd2lsbCBub3QgY2hlY2sgdGhhdCBpbmRleCBhZ2Fpbi5cblx0ICogSWYgdGhlcmUgaXMgbm8gbWF0Y2gsIHRoZW4gdGhlIHByb21wdGluZyBvciBkZWZhdWx0IHZhbHVlIGlzIHVzZWQuXG5cdCAqIEFwcGxpY2FibGUgdG8gcGhyYXNlIG1hdGNoIG9ubHkuXG5cdCAqL1xuXHR1bm9yZGVyZWQ/OiBib29sZWFuIHwgbnVtYmVyIHwgbnVtYmVyW107XG59XG5cbi8qKlxuICogRGF0YSBwYXNzZWQgdG8gYXJndW1lbnQgcHJvbXB0IGZ1bmN0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFByb21wdERhdGEge1xuXHQvKiogV2hldGhlciB0aGUgcHJvbXB0IGlzIGluZmluaXRlIG9yIG5vdC4gKi9cblx0aW5maW5pdGU6IGJvb2xlYW47XG5cblx0LyoqIFRoZSBtZXNzYWdlIHRoYXQgY2F1c2VkIHRoZSBwcm9tcHQuICovXG5cdG1lc3NhZ2U6IE1lc3NhZ2U7XG5cblx0LyoqIEFtb3VudCBvZiByZXRyaWVzIHNvIGZhci4gKi9cblx0cmV0cmllczogbnVtYmVyO1xuXG5cdC8qKiBUaGUgaW5wdXQgcGhyYXNlIHRoYXQgY2F1c2VkIHRoZSBwcm9tcHQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZy4gKi9cblx0cGhyYXNlOiBzdHJpbmc7XG5cblx0LyoqIFRoZSB2YWx1ZSB0aGF0IGZhaWxlZCBpZiB0aGVyZSB3YXMgb25lLCBvdGhlcndpc2UgbnVsbC4gKi9cblx0ZmFpbHVyZTogdm9pZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pO1xufVxuXG4vKipcbiAqIEEgcHJvbXB0IHRvIHJ1biBpZiB0aGUgdXNlciBkaWQgbm90IGlucHV0IHRoZSBhcmd1bWVudCBjb3JyZWN0bHkuXG4gKiBDYW4gb25seSBiZSB1c2VkIGlmIHRoZXJlIGlzIG5vdCBhIGRlZmF1bHQgdmFsdWUgKHVubGVzcyBvcHRpb25hbCBpcyB0cnVlKS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFByb21wdE9wdGlvbnMge1xuXHQvKipcblx0ICogV2hlbmV2ZXIgYW4gaW5wdXQgbWF0Y2hlcyB0aGUgZm9ybWF0IG9mIGEgY29tbWFuZCwgdGhpcyBvcHRpb24gY29udHJvbHMgd2hldGhlciBvciBub3QgdG8gY2FuY2VsIHRoaXMgY29tbWFuZCBhbmQgcnVuIHRoYXQgY29tbWFuZC5cblx0ICogVGhlIGNvbW1hbmQgdG8gYmUgcnVuIG1heSBiZSB0aGUgc2FtZSBjb21tYW5kIG9yIHNvbWUgb3RoZXIgY29tbWFuZC5cblx0ICogRGVmYXVsdHMgdG8gdHJ1ZSxcblx0ICovXG5cdGJyZWFrb3V0PzogYm9vbGVhbjtcblxuXHQvKiogVGV4dCBzZW50IG9uIGNhbmNlbGxhdGlvbiBvZiBjb21tYW5kLiAqL1xuXHRjYW5jZWw/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBXb3JkIHRvIHVzZSBmb3IgY2FuY2VsbGluZyB0aGUgY29tbWFuZC4gRGVmYXVsdHMgdG8gJ2NhbmNlbCcuICovXG5cdGNhbmNlbFdvcmQ/OiBzdHJpbmc7XG5cblx0LyoqIFRleHQgc2VudCBvbiBhbW91bnQgb2YgdHJpZXMgcmVhY2hpbmcgdGhlIG1heC4gKi9cblx0ZW5kZWQ/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBQcm9tcHRzIGZvcmV2ZXIgdW50aWwgdGhlIHN0b3Agd29yZCwgY2FuY2VsIHdvcmQsIHRpbWUgbGltaXQsIG9yIHJldHJ5IGxpbWl0LlxuXHQgKiBOb3RlIHRoYXQgdGhlIHJldHJ5IGNvdW50IHJlc2V0cyBiYWNrIHRvIG9uZSBvbiBlYWNoIHZhbGlkIGVudHJ5LlxuXHQgKiBUaGUgZmluYWwgZXZhbHVhdGVkIGFyZ3VtZW50IHdpbGwgYmUgYW4gYXJyYXkgb2YgdGhlIGlucHV0cy5cblx0ICogRGVmYXVsdHMgdG8gZmFsc2UuXG5cdCAqL1xuXHRpbmZpbml0ZT86IGJvb2xlYW47XG5cblx0LyoqIEFtb3VudCBvZiBpbnB1dHMgYWxsb3dlZCBmb3IgYW4gaW5maW5pdGUgcHJvbXB0IGJlZm9yZSBmaW5pc2hpbmcuIERlZmF1bHRzIHRvIEluZmluaXR5LiAqL1xuXHRsaW1pdD86IG51bWJlcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IGNhbmNlbCBtZXNzYWdlcy4gKi9cblx0bW9kaWZ5Q2FuY2VsPzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgb3V0IG9mIHRyaWVzIG1lc3NhZ2VzLiAqL1xuXHRtb2RpZnlFbmRlZD86IFByb21wdENvbnRlbnRNb2RpZmllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IHJldHJ5IHByb21wdHMuICovXG5cdG1vZGlmeVJldHJ5PzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgc3RhcnQgcHJvbXB0cy4gKi9cblx0bW9kaWZ5U3RhcnQ/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSB0aW1lb3V0IG1lc3NhZ2VzLiAqL1xuXHRtb2RpZnlUaW1lb3V0PzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBQcm9tcHRzIG9ubHkgd2hlbiBhcmd1bWVudCBpcyBwcm92aWRlZCBidXQgd2FzIG5vdCBvZiB0aGUgcmlnaHQgdHlwZS4gRGVmYXVsdHMgdG8gZmFsc2UuICovXG5cdG9wdGlvbmFsPzogYm9vbGVhbjtcblxuXHQvKiogQW1vdW50IG9mIHJldHJpZXMgYWxsb3dlZC4gRGVmYXVsdHMgdG8gMS4gKi9cblx0cmV0cmllcz86IG51bWJlcjtcblxuXHQvKiogVGV4dCBzZW50IG9uIGEgcmV0cnkgKGZhaWx1cmUgdG8gY2FzdCB0eXBlKS4gKi9cblx0cmV0cnk/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBUZXh0IHNlbnQgb24gc3RhcnQgb2YgcHJvbXB0LiAqL1xuXHRzdGFydD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIFdvcmQgdG8gdXNlIGZvciBlbmRpbmcgaW5maW5pdGUgcHJvbXB0cy4gRGVmYXVsdHMgdG8gJ3N0b3AnLiAqL1xuXHRzdG9wV29yZD86IHN0cmluZztcblxuXHQvKiogVGltZSB0byB3YWl0IGZvciBpbnB1dC4gRGVmYXVsdHMgdG8gMzAwMDAuICovXG5cdHRpbWU/OiBudW1iZXI7XG5cblx0LyoqIFRleHQgc2VudCBvbiBjb2xsZWN0b3IgdGltZSBvdXQuICovXG5cdHRpbWVvdXQ/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xufVxuXG4vKipcbiAqIFRoZSBtZXRob2QgdG8gbWF0Y2ggYXJndW1lbnRzIGZyb20gdGV4dC5cbiAqIC0gYHBocmFzZWAgbWF0Y2hlcyBieSB0aGUgb3JkZXIgb2YgdGhlIHBocmFzZXMgaW5wdXR0ZWQuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIC0gYGZsYWdgIG1hdGNoZXMgcGhyYXNlcyB0aGF0IGFyZSB0aGUgc2FtZSBhcyBpdHMgZmxhZy5cbiAqIFRoZSBldmFsdWF0ZWQgYXJndW1lbnQgaXMgZWl0aGVyIHRydWUgb3IgZmFsc2UuXG4gKiAtIGBvcHRpb25gIG1hdGNoZXMgcGhyYXNlcyB0aGF0IHN0YXJ0cyB3aXRoIHRoZSBmbGFnLlxuICogVGhlIHBocmFzZSBhZnRlciB0aGUgZmxhZyBpcyB0aGUgZXZhbHVhdGVkIGFyZ3VtZW50LlxuICogLSBgcmVzdGAgbWF0Y2hlcyB0aGUgcmVzdCBvZiB0aGUgcGhyYXNlcy5cbiAqIEl0IGlnbm9yZXMgcGhyYXNlcyB0aGF0IG1hdGNoZXMgYSBmbGFnLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYHNlcGFyYXRlYCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSBwaHJhc2VzIGFuZCBwcm9jZXNzZXMgZWFjaCBpbmRpdmlkdWFsbHkuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIC0gYHRleHRgIG1hdGNoZXMgdGhlIGVudGlyZSB0ZXh0LCBleGNlcHQgZm9yIHRoZSBjb21tYW5kLlxuICogSXQgaWdub3JlcyBwaHJhc2VzIHRoYXQgbWF0Y2hlcyBhIGZsYWcuXG4gKiBJdCBwcmVzZXJ2ZXMgdGhlIG9yaWdpbmFsIHdoaXRlc3BhY2UgYmV0d2VlbiBwaHJhc2VzIGFuZCB0aGUgcXVvdGVzIGFyb3VuZCBwaHJhc2VzLlxuICogLSBgY29udGVudGAgbWF0Y2hlcyB0aGUgZW50aXJlIHRleHQgYXMgaXQgd2FzIGlucHV0dGVkLCBleGNlcHQgZm9yIHRoZSBjb21tYW5kLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYHJlc3RDb250ZW50YCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSB0ZXh0IGFzIGl0IHdhcyBpbnB1dHRlZC5cbiAqIEl0IHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgd2hpdGVzcGFjZSBiZXR3ZWVuIHBocmFzZXMgYW5kIHRoZSBxdW90ZXMgYXJvdW5kIHBocmFzZXMuXG4gKiAtIGBub25lYCBtYXRjaGVzIG5vdGhpbmcgYXQgYWxsIGFuZCBhbiBlbXB0eSBzdHJpbmcgd2lsbCBiZSB1c2VkIGZvciB0eXBlIG9wZXJhdGlvbnMuXG4gKi9cbmV4cG9ydCB0eXBlIEFyZ3VtZW50TWF0Y2ggPVxuXHR8IFwicGhyYXNlXCJcblx0fCBcImZsYWdcIlxuXHR8IFwib3B0aW9uXCJcblx0fCBcInJlc3RcIlxuXHR8IFwic2VwYXJhdGVcIlxuXHR8IFwidGV4dFwiXG5cdHwgXCJjb250ZW50XCJcblx0fCBcInJlc3RDb250ZW50XCJcblx0fCBcIm5vbmVcIjtcblxuLyoqXG4gKiBUaGUgdHlwZSB0aGF0IHRoZSBhcmd1bWVudCBzaG91bGQgYmUgY2FzdCB0by5cbiAqIC0gYHN0cmluZ2AgZG9lcyBub3QgY2FzdCB0byBhbnkgdHlwZS5cbiAqIC0gYGxvd2VyY2FzZWAgbWFrZXMgdGhlIGlucHV0IGxvd2VyY2FzZS5cbiAqIC0gYHVwcGVyY2FzZWAgbWFrZXMgdGhlIGlucHV0IHVwcGVyY2FzZS5cbiAqIC0gYGNoYXJDb2Rlc2AgdHJhbnNmb3JtcyB0aGUgaW5wdXQgdG8gYW4gYXJyYXkgb2YgY2hhciBjb2Rlcy5cbiAqIC0gYG51bWJlcmAgY2FzdHMgdG8gYSBudW1iZXIuXG4gKiAtIGBpbnRlZ2VyYCBjYXN0cyB0byBhbiBpbnRlZ2VyLlxuICogLSBgYmlnaW50YCBjYXN0cyB0byBhIGJpZyBpbnRlZ2VyLlxuICogLSBgdXJsYCBjYXN0cyB0byBhbiBgVVJMYCBvYmplY3QuXG4gKiAtIGBkYXRlYCBjYXN0cyB0byBhIGBEYXRlYCBvYmplY3QuXG4gKiAtIGBjb2xvcmAgY2FzdHMgYSBoZXggY29kZSB0byBhbiBpbnRlZ2VyLlxuICogLSBgY29tbWFuZEFsaWFzYCB0cmllcyB0byByZXNvbHZlIHRvIGEgY29tbWFuZCBmcm9tIGFuIGFsaWFzLlxuICogLSBgY29tbWFuZGAgbWF0Y2hlcyB0aGUgSUQgb2YgYSBjb21tYW5kLlxuICogLSBgaW5oaWJpdG9yYCBtYXRjaGVzIHRoZSBJRCBvZiBhbiBpbmhpYml0b3IuXG4gKiAtIGBsaXN0ZW5lcmAgbWF0Y2hlcyB0aGUgSUQgb2YgYSBsaXN0ZW5lci5cbiAqXG4gKiBQb3NzaWJsZSBEaXNjb3JkLXJlbGF0ZWQgdHlwZXMuXG4gKiBUaGVzZSB0eXBlcyBjYW4gYmUgcGx1cmFsIChhZGQgYW4gJ3MnIHRvIHRoZSBlbmQpIGFuZCBhIGNvbGxlY3Rpb24gb2YgbWF0Y2hpbmcgb2JqZWN0cyB3aWxsIGJlIHVzZWQuXG4gKiAtIGB1c2VyYCB0cmllcyB0byByZXNvbHZlIHRvIGEgdXNlci5cbiAqIC0gYG1lbWJlcmAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIG1lbWJlci5cbiAqIC0gYHJlbGV2YW50YCB0cmllcyB0byByZXNvbHZlIHRvIGEgcmVsZXZhbnQgdXNlciwgd29ya3MgaW4gYm90aCBndWlsZHMgYW5kIERNcy5cbiAqIC0gYGNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBjaGFubmVsLlxuICogLSBgdGV4dENoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB0ZXh0IGNoYW5uZWwuXG4gKiAtIGB2b2ljZUNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB2b2ljZSBjaGFubmVsLlxuICogLSBgc3RhZ2VDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIHRvIGEgc3RhZ2UgY2hhbm5lbC5cbiAqIC0gYHRocmVhZENoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgYSB0aHJlYWQgY2hhbm5lbC5cbiAqIC0gYHJvbGVgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSByb2xlLlxuICogLSBgZW1vamlgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBjdXN0b20gZW1vamkuXG4gKiAtIGBndWlsZGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIGd1aWxkLlxuICpcbiAqIE90aGVyIERpc2NvcmQtcmVsYXRlZCB0eXBlczpcbiAqIC0gYG1lc3NhZ2VgIHRyaWVzIHRvIGZldGNoIGEgbWVzc2FnZSBmcm9tIGFuIElEIHdpdGhpbiB0aGUgY2hhbm5lbC5cbiAqIC0gYGd1aWxkTWVzc2FnZWAgdHJpZXMgdG8gZmV0Y2ggYSBtZXNzYWdlIGZyb20gYW4gSUQgd2l0aGluIHRoZSBndWlsZC5cbiAqIC0gYHJlbGV2YW50TWVzc2FnZWAgaXMgYSBjb21iaW5hdGlvbiBvZiB0aGUgYWJvdmUsIHdvcmtzIGluIGJvdGggZ3VpbGRzIGFuZCBETXMuXG4gKiAtIGBpbnZpdGVgIHRyaWVzIHRvIGZldGNoIGFuIGludml0ZSBvYmplY3QgZnJvbSBhIGxpbmsuXG4gKiAtIGB1c2VyTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSB1c2VyLlxuICogLSBgbWVtYmVyTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSBndWlsZCBtZW1iZXIuXG4gKiAtIGBjaGFubmVsTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSBjaGFubmVsLlxuICogLSBgcm9sZU1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGEgcm9sZS5cbiAqIC0gYGVtb2ppTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYW4gZW1vamkuXG4gKlxuICogQW4gYXJyYXkgb2Ygc3RyaW5ncyBjYW4gYmUgdXNlZCB0byByZXN0cmljdCBpbnB1dCB0byBvbmx5IHRob3NlIHN0cmluZ3MsIGNhc2UgaW5zZW5zaXRpdmUuXG4gKiBUaGUgYXJyYXkgY2FuIGFsc28gY29udGFpbiBhbiBpbm5lciBhcnJheSBvZiBzdHJpbmdzLCBmb3IgYWxpYXNlcy5cbiAqIElmIHNvLCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5IHdpbGwgYmUgdXNlZCBhcyB0aGUgZmluYWwgYXJndW1lbnQuXG4gKlxuICogQSByZWd1bGFyIGV4cHJlc3Npb24gY2FuIGFsc28gYmUgdXNlZC5cbiAqIFRoZSBldmFsdWF0ZWQgYXJndW1lbnQgd2lsbCBiZSBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgYG1hdGNoYCBhbmQgYG1hdGNoZXNgIGlmIGdsb2JhbC5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRUeXBlID1cblx0fCBcInN0cmluZ1wiXG5cdHwgXCJsb3dlcmNhc2VcIlxuXHR8IFwidXBwZXJjYXNlXCJcblx0fCBcImNoYXJDb2Rlc1wiXG5cdHwgXCJudW1iZXJcIlxuXHR8IFwiaW50ZWdlclwiXG5cdHwgXCJiaWdpbnRcIlxuXHR8IFwiZW1vamludFwiXG5cdHwgXCJ1cmxcIlxuXHR8IFwiZGF0ZVwiXG5cdHwgXCJjb2xvclwiXG5cdHwgXCJ1c2VyXCJcblx0fCBcInVzZXJzXCJcblx0fCBcIm1lbWJlclwiXG5cdHwgXCJtZW1iZXJzXCJcblx0fCBcInJlbGV2YW50XCJcblx0fCBcInJlbGV2YW50c1wiXG5cdHwgXCJjaGFubmVsXCJcblx0fCBcImNoYW5uZWxzXCJcblx0fCBcInRleHRDaGFubmVsXCJcblx0fCBcInRleHRDaGFubmVsc1wiXG5cdHwgXCJ2b2ljZUNoYW5uZWxcIlxuXHR8IFwidm9pY2VDaGFubmVsc1wiXG5cdHwgXCJjYXRlZ29yeUNoYW5uZWxcIlxuXHR8IFwiY2F0ZWdvcnlDaGFubmVsc1wiXG5cdHwgXCJuZXdzQ2hhbm5lbFwiXG5cdHwgXCJuZXdzQ2hhbm5lbHNcIlxuXHR8IFwic3RvcmVDaGFubmVsXCJcblx0fCBcInN0b3JlQ2hhbm5lbHNcIlxuXHR8IFwic3RhZ2VDaGFubmVsXCJcblx0fCBcInN0YWdlQ2hhbm5lbHNcIlxuXHR8IFwidGhyZWFkQ2hhbm5lbFwiXG5cdHwgXCJ0aHJlYWRDaGFubmVsc1wiXG5cdHwgXCJyb2xlXCJcblx0fCBcInJvbGVzXCJcblx0fCBcImVtb2ppXCJcblx0fCBcImVtb2ppc1wiXG5cdHwgXCJndWlsZFwiXG5cdHwgXCJndWlsZHNcIlxuXHR8IFwibWVzc2FnZVwiXG5cdHwgXCJndWlsZE1lc3NhZ2VcIlxuXHR8IFwicmVsZXZhbnRNZXNzYWdlXCJcblx0fCBcImludml0ZVwiXG5cdHwgXCJ1c2VyTWVudGlvblwiXG5cdHwgXCJtZW1iZXJNZW50aW9uXCJcblx0fCBcImNoYW5uZWxNZW50aW9uXCJcblx0fCBcInJvbGVNZW50aW9uXCJcblx0fCBcImVtb2ppTWVudGlvblwiXG5cdHwgXCJjb21tYW5kQWxpYXNcIlxuXHR8IFwiY29tbWFuZFwiXG5cdHwgXCJpbmhpYml0b3JcIlxuXHR8IFwibGlzdGVuZXJcIlxuXHR8IChzdHJpbmcgfCBzdHJpbmdbXSlbXVxuXHR8IFJlZ0V4cFxuXHR8IHN0cmluZztcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGZvciBwcm9jZXNzaW5nIHVzZXIgaW5wdXQgdG8gdXNlIGFzIGFuIGFyZ3VtZW50LlxuICogQSB2b2lkIHJldHVybiB2YWx1ZSB3aWxsIHVzZSB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhlIGFyZ3VtZW50IG9yIHN0YXJ0IGEgcHJvbXB0LlxuICogQW55IG90aGVyIHRydXRoeSByZXR1cm4gdmFsdWUgd2lsbCBiZSB1c2VkIGFzIHRoZSBldmFsdWF0ZWQgYXJndW1lbnQuXG4gKiBJZiByZXR1cm5pbmcgYSBQcm9taXNlLCB0aGUgcmVzb2x2ZWQgdmFsdWUgd2lsbCBnbyB0aHJvdWdoIHRoZSBhYm92ZSBzdGVwcy5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBwaHJhc2UgLSBUaGUgdXNlciBpbnB1dC5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRUeXBlQ2FzdGVyID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiBhbnk7XG5cbi8qKlxuICogQSBmdW5jdGlvbiBmb3IgcHJvY2Vzc2luZyBzb21lIHZhbHVlIHRvIHVzZSBhcyBhbiBhcmd1bWVudC5cbiAqIFRoaXMgaXMgbWFpbmx5IHVzZWQgaW4gY29tcG9zaW5nIGFyZ3VtZW50IHR5cGVzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHZhbHVlIC0gU29tZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRUeXBlQ2FzdGVyXyA9IChtZXNzYWdlOiBNZXNzYWdlLCB2YWx1ZTogYW55KSA9PiBhbnk7XG5cbi8qKlxuICogRGF0YSBwYXNzZWQgdG8gZnVuY3Rpb25zIHRoYXQgcnVuIHdoZW4gdGhpbmdzIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWlsdXJlRGF0YSB7XG5cdC8qKiBUaGUgaW5wdXQgcGhyYXNlIHRoYXQgZmFpbGVkIGlmIHRoZXJlIHdhcyBvbmUsIG90aGVyd2lzZSBhbiBlbXB0eSBzdHJpbmcuICovXG5cdHBocmFzZTogc3RyaW5nO1xuXG5cdC8qKiBUaGUgdmFsdWUgdGhhdCBmYWlsZWQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIG51bGwuICovXG5cdGZhaWx1cmU6IHZvaWQgfCAoRmxhZyAmIHsgdmFsdWU6IGFueSB9KTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0cyBmb3IgYXJndW1lbnQgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWZhdWx0QXJndW1lbnRPcHRpb25zIHtcblx0LyoqIERlZmF1bHQgcHJvbXB0IG9wdGlvbnMuICovXG5cdHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucztcblxuXHQvKiogRGVmYXVsdCB0ZXh0IHNlbnQgaWYgYXJndW1lbnQgcGFyc2luZyBmYWlscy4gKi9cblx0b3RoZXJ3aXNlPzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IE90aGVyd2lzZUNvbnRlbnRTdXBwbGllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IG90aGVyd2lzZSBjb250ZW50LiAqL1xuXHRtb2RpZnlPdGhlcndpc2U/OiBPdGhlcndpc2VDb250ZW50TW9kaWZpZXI7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBhcmd1bWVudC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBEZWZhdWx0VmFsdWVTdXBwbGllciA9IChtZXNzYWdlOiBNZXNzYWdlLCBkYXRhOiBGYWlsdXJlRGF0YSkgPT4gYW55O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gZm9yIHZhbGlkYXRpbmcgcGFyc2VkIGFyZ3VtZW50cy5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBwaHJhc2UgLSBUaGUgdXNlciBpbnB1dC5cbiAqIEBwYXJhbSB2YWx1ZSAtIFRoZSBwYXJzZWQgdmFsdWUuXG4gKi9cbmV4cG9ydCB0eXBlIFBhcnNlZFZhbHVlUHJlZGljYXRlID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiBib29sZWFuO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gbW9kaWZ5aW5nIGEgcHJvbXB0IHRleHQuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIE90aGVyd2lzZUNvbnRlbnRNb2RpZmllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0dGV4dDogc3RyaW5nLFxuXHRkYXRhOiBGYWlsdXJlRGF0YVxuKSA9PiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHJldHVybmluZyB0aGUgY29udGVudCBpZiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIE90aGVyd2lzZUNvbnRlbnRTdXBwbGllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0ZGF0YTogRmFpbHVyZURhdGFcbikgPT4gc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21pc2U8c3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucz47XG5cbi8qKlxuICogQSBmdW5jdGlvbiBtb2RpZnlpbmcgYSBwcm9tcHQgdGV4dC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSB0ZXh0IC0gVGV4dCBmcm9tIHRoZSBwcm9tcHQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIFByb21wdENvbnRlbnRNb2RpZmllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0dGV4dDogc3RyaW5nLFxuXHRkYXRhOiBBcmd1bWVudFByb21wdERhdGFcbikgPT4gc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21pc2U8c3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucz47XG5cbi8qKlxuICogQSBmdW5jdGlvbiByZXR1cm5pbmcgdGV4dCBmb3IgdGhlIHByb21wdC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBQcm9tcHRDb250ZW50U3VwcGxpZXIgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdGRhdGE6IEFyZ3VtZW50UHJvbXB0RGF0YVxuKSA9PiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcbiJdfQ==