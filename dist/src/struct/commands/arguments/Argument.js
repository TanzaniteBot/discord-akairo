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
        const optional = Util_1.default.choice(typeof this.prompt === "object" && this.prompt && this.prompt.optional, commandDefs.prompt && commandDefs.prompt.optional, handlerDefs.prompt && handlerDefs.prompt.optional);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHVEQUF5RTtBQUN6RSw4REFBc0M7QUFJdEMsbURBQTJCO0FBRzNCOzs7O0dBSUc7QUFDSCxNQUFxQixRQUFRO0lBQzVCLFlBQ0MsT0FBZ0IsRUFDaEIsRUFDQyxLQUFLLEdBQUcsMkJBQWUsQ0FBQyxNQUFNLEVBQzlCLElBQUksR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFDM0IsSUFBSSxHQUFHLElBQUksRUFDWCxhQUFhLEdBQUcsS0FBSyxFQUNyQixLQUFLLEdBQUcsSUFBSSxFQUNaLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLEtBQUssR0FBRyxRQUFRLEVBQ2hCLE1BQU0sR0FBRyxJQUFJLEVBQ2IsT0FBTyxFQUFFLFlBQVksR0FBRyxJQUFJLEVBQzVCLFNBQVMsR0FBRyxJQUFJLEVBQ2hCLGVBQWUsR0FBRyxJQUFJLEtBQ0YsRUFBRTtRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRWhFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBRW5DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxNQUFNLEdB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QUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDOUUsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM1QixPQUFPLGNBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ2hEO1lBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3RDLENBQUMsQ0FBQztJQUNILENBQUM7Q0FDRDtBQXpsQkQsMkJBeWxCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lc3NhZ2UsIE1lc3NhZ2VPcHRpb25zLCBNZXNzYWdlUGF5bG9hZCB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgeyBBcmd1bWVudE1hdGNoZXMsIEFyZ3VtZW50VHlwZXMgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbC9Db25zdGFudHNcIjtcbmltcG9ydCBVdGlsIGZyb20gXCIuLi8uLi8uLi91dGlsL1V0aWxcIjtcbmltcG9ydCBBa2Fpcm9DbGllbnQgZnJvbSBcIi4uLy4uL0FrYWlyb0NsaWVudFwiO1xuaW1wb3J0IENvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRcIjtcbmltcG9ydCBDb21tYW5kSGFuZGxlciBmcm9tIFwiLi4vQ29tbWFuZEhhbmRsZXJcIjtcbmltcG9ydCBGbGFnIGZyb20gXCIuLi9GbGFnXCI7XG5pbXBvcnQgVHlwZVJlc29sdmVyIGZyb20gXCIuL1R5cGVSZXNvbHZlclwiO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gYXJndW1lbnQgZm9yIGEgY29tbWFuZC5cbiAqIEBwYXJhbSBjb21tYW5kIC0gQ29tbWFuZCBvZiB0aGUgYXJndW1lbnQuXG4gKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHRoZSBhcmd1bWVudC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJndW1lbnQge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoXG5cdFx0Y29tbWFuZDogQ29tbWFuZCxcblx0XHR7XG5cdFx0XHRtYXRjaCA9IEFyZ3VtZW50TWF0Y2hlcy5QSFJBU0UsXG5cdFx0XHR0eXBlID0gQXJndW1lbnRUeXBlcy5TVFJJTkcsXG5cdFx0XHRmbGFnID0gbnVsbCxcblx0XHRcdG11bHRpcGxlRmxhZ3MgPSBmYWxzZSxcblx0XHRcdGluZGV4ID0gbnVsbCxcblx0XHRcdHVub3JkZXJlZCA9IGZhbHNlLFxuXHRcdFx0bGltaXQgPSBJbmZpbml0eSxcblx0XHRcdHByb21wdCA9IG51bGwsXG5cdFx0XHRkZWZhdWx0OiBkZWZhdWx0VmFsdWUgPSBudWxsLFxuXHRcdFx0b3RoZXJ3aXNlID0gbnVsbCxcblx0XHRcdG1vZGlmeU90aGVyd2lzZSA9IG51bGxcblx0XHR9OiBBcmd1bWVudE9wdGlvbnMgPSB7fVxuXHQpIHtcblx0XHR0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xuXG5cdFx0dGhpcy5tYXRjaCA9IG1hdGNoO1xuXG5cdFx0dGhpcy50eXBlID0gdHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIiA/IHR5cGUuYmluZCh0aGlzKSA6IHR5cGU7XG5cblx0XHR0aGlzLmZsYWcgPSBmbGFnO1xuXG5cdFx0dGhpcy5tdWx0aXBsZUZsYWdzID0gbXVsdGlwbGVGbGFncztcblxuXHRcdHRoaXMuaW5kZXggPSBpbmRleDtcblxuXHRcdHRoaXMudW5vcmRlcmVkID0gdW5vcmRlcmVkO1xuXG5cdFx0dGhpcy5saW1pdCA9IGxpbWl0O1xuXG5cdFx0dGhpcy5wcm9tcHQgPSBwcm9tcHQ7XG5cblx0XHR0aGlzLmRlZmF1bHQgPSB0eXBlb2YgZGVmYXVsdFZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBkZWZhdWx0VmFsdWUuYmluZCh0aGlzKSA6IGRlZmF1bHRWYWx1ZTtcblxuXHRcdHRoaXMub3RoZXJ3aXNlID0gdHlwZW9mIG90aGVyd2lzZSA9PT0gXCJmdW5jdGlvblwiID8gb3RoZXJ3aXNlLmJpbmQodGhpcykgOiBvdGhlcndpc2U7XG5cblx0XHR0aGlzLm1vZGlmeU90aGVyd2lzZSA9IG1vZGlmeU90aGVyd2lzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY2xpZW50LlxuXHQgKi9cblx0Z2V0IGNsaWVudCgpOiBBa2Fpcm9DbGllbnQge1xuXHRcdHJldHVybiB0aGlzLmNvbW1hbmQuY2xpZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIHRoaXMgYXJndW1lbnQgYmVsb25ncyB0by5cblx0ICovXG5cdHB1YmxpYyBjb21tYW5kOiBDb21tYW5kO1xuXG5cdC8qKlxuXHQgKiBUaGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGUgYXJndW1lbnQgb3IgYSBmdW5jdGlvbiBzdXBwbHlpbmcgdGhlIGRlZmF1bHQgdmFsdWUuXG5cdCAqL1xuXHRwdWJsaWMgZGVmYXVsdDogRGVmYXVsdFZhbHVlU3VwcGxpZXIgfCBhbnk7XG5cblx0LyoqXG5cdCAqICBEZXNjcmlwdGlvbiBvZiB0aGUgY29tbWFuZC5cblx0ICovXG5cdHB1YmxpYyBkZXNjcmlwdGlvbjogc3RyaW5nIHwgYW55O1xuXG5cdC8qKlxuXHQgKiBUaGUgc3RyaW5nKHMpIHRvIHVzZSBmb3IgZmxhZyBvciBvcHRpb24gbWF0Y2guXG5cdCAqL1xuXHRwdWJsaWMgZmxhZz86IHN0cmluZyB8IHN0cmluZ1tdO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBoYW5kbGVyLlxuXHQgKi9cblx0Z2V0IGhhbmRsZXIoKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbW1hbmQuaGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaW5kZXggdG8gc3RhcnQgZnJvbS5cblx0ICovXG5cdHB1YmxpYyBpbmRleD86IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIGFtb3VudCBvZiBwaHJhc2VzIHRvIG1hdGNoIGZvciByZXN0LCBzZXBhcmF0ZSwgY29udGVudCwgb3IgdGV4dCBtYXRjaC5cblx0ICovXG5cdHB1YmxpYyBsaW1pdDogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRvIG1hdGNoIHRleHQuXG5cdCAqL1xuXHRwdWJsaWMgbWF0Y2g6IEFyZ3VtZW50TWF0Y2g7XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdGhlcndpc2UgY29udGVudC5cblx0ICovXG5cdHB1YmxpYyBtb2RpZnlPdGhlcndpc2U6IE90aGVyd2lzZUNvbnRlbnRNb2RpZmllcjtcblxuXHQvKipcblx0ICogV2hldGhlciB0byBwcm9jZXNzIG11bHRpcGxlIG9wdGlvbiBmbGFncyBpbnN0ZWFkIG9mIGp1c3QgdGhlIGZpcnN0LlxuXHQgKi9cblx0cHVibGljIG11bHRpcGxlRmxhZ3M6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBjb250ZW50IG9yIGZ1bmN0aW9uIHN1cHBseWluZyB0aGUgY29udGVudCBzZW50IHdoZW4gYXJndW1lbnQgcGFyc2luZyBmYWlscy5cblx0ICovXG5cdHB1YmxpYyBvdGhlcndpc2U/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgT3RoZXJ3aXNlQ29udGVudFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgcHJvbXB0IG9wdGlvbnMuXG5cdCAqL1xuXHRwdWJsaWMgcHJvbXB0PzogQXJndW1lbnRQcm9tcHRPcHRpb25zIHwgYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIHR5cGUgdG8gY2FzdCB0byBvciBhIGZ1bmN0aW9uIHRvIHVzZSB0byBjYXN0LlxuXHQgKi9cblx0cHVibGljIHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdGhlIGFyZ3VtZW50IGlzIHVub3JkZXJlZC5cblx0ICovXG5cdHB1YmxpYyB1bm9yZGVyZWQ6IGJvb2xlYW4gfCBudW1iZXIgfCBudW1iZXJbXTtcblxuXHQvKipcblx0ICogQ2FzdHMgYSBwaHJhc2UgdG8gdGhpcyBhcmd1bWVudCdzIHR5cGUuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBocmFzZSAtIFBocmFzZSB0byBwcm9jZXNzLlxuXHQgKi9cblx0cHVibGljIGNhc3QobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuXHRcdHJldHVybiBBcmd1bWVudC5jYXN0KHRoaXMudHlwZSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbGxlY3RzIGlucHV0IGZyb20gdGhlIHVzZXIgYnkgcHJvbXB0aW5nLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdG8gcHJvbXB0LlxuXHQgKiBAcGFyYW0gY29tbWFuZElucHV0IC0gUHJldmlvdXMgaW5wdXQgZnJvbSBjb21tYW5kIGlmIHRoZXJlIHdhcyBvbmUuXG5cdCAqIEBwYXJhbSBwYXJzZWRJbnB1dCAtIFByZXZpb3VzIHBhcnNlZCBpbnB1dCBmcm9tIGNvbW1hbmQgaWYgdGhlcmUgd2FzIG9uZS5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBjb2xsZWN0KG1lc3NhZ2U6IE1lc3NhZ2UsIGNvbW1hbmRJbnB1dDogc3RyaW5nID0gXCJcIiwgcGFyc2VkSW5wdXQ6IGFueSA9IG51bGwpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBwcm9tcHRPcHRpb25zOiBhbnkgPSB7fTtcblx0XHRPYmplY3QuYXNzaWduKHByb21wdE9wdGlvbnMsIHRoaXMuaGFuZGxlci5hcmd1bWVudERlZmF1bHRzLnByb21wdCk7XG5cdFx0T2JqZWN0LmFzc2lnbihwcm9tcHRPcHRpb25zLCB0aGlzLmNvbW1hbmQuYXJndW1lbnREZWZhdWx0cy5wcm9tcHQpO1xuXHRcdE9iamVjdC5hc3NpZ24ocHJvbXB0T3B0aW9ucywgdGhpcy5wcm9tcHQgfHwge30pO1xuXG5cdFx0Y29uc3QgaXNJbmZpbml0ZSA9IHByb21wdE9wdGlvbnMuaW5maW5pdGUgfHwgKHRoaXMubWF0Y2ggPT09IEFyZ3VtZW50TWF0Y2hlcy5TRVBBUkFURSAmJiAhY29tbWFuZElucHV0KTtcblx0XHRjb25zdCBhZGRpdGlvbmFsUmV0cnkgPSBOdW1iZXIoQm9vbGVhbihjb21tYW5kSW5wdXQpKTtcblx0XHRjb25zdCB2YWx1ZXMgPSBpc0luZmluaXRlID8gW10gOiBudWxsO1xuXG5cdFx0Y29uc3QgZ2V0VGV4dCA9IGFzeW5jIChwcm9tcHRUeXBlLCBwcm9tcHRlciwgcmV0cnlDb3VudCwgaW5wdXRNZXNzYWdlLCBpbnB1dFBocmFzZSwgaW5wdXRQYXJzZWQpID0+IHtcblx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUocHJvbXB0ZXIpLmNhbGwodGhpcywgbWVzc2FnZSwge1xuXHRcdFx0XHRyZXRyaWVzOiByZXRyeUNvdW50LFxuXHRcdFx0XHRpbmZpbml0ZTogaXNJbmZpbml0ZSxcblx0XHRcdFx0bWVzc2FnZTogaW5wdXRNZXNzYWdlLFxuXHRcdFx0XHRwaHJhc2U6IGlucHV0UGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlOiBpbnB1dFBhcnNlZFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG1vZGlmaWVyID0ge1xuXHRcdFx0XHRzdGFydDogcHJvbXB0T3B0aW9ucy5tb2RpZnlTdGFydCxcblx0XHRcdFx0cmV0cnk6IHByb21wdE9wdGlvbnMubW9kaWZ5UmV0cnksXG5cdFx0XHRcdHRpbWVvdXQ6IHByb21wdE9wdGlvbnMubW9kaWZ5VGltZW91dCxcblx0XHRcdFx0ZW5kZWQ6IHByb21wdE9wdGlvbnMubW9kaWZ5RW5kZWQsXG5cdFx0XHRcdGNhbmNlbDogcHJvbXB0T3B0aW9ucy5tb2RpZnlDYW5jZWxcblx0XHRcdH1bcHJvbXB0VHlwZV07XG5cblx0XHRcdGlmIChtb2RpZmllcikge1xuXHRcdFx0XHR0ZXh0ID0gYXdhaXQgbW9kaWZpZXIuY2FsbCh0aGlzLCBtZXNzYWdlLCB0ZXh0LCB7XG5cdFx0XHRcdFx0cmV0cmllczogcmV0cnlDb3VudCxcblx0XHRcdFx0XHRpbmZpbml0ZTogaXNJbmZpbml0ZSxcblx0XHRcdFx0XHRtZXNzYWdlOiBpbnB1dE1lc3NhZ2UsXG5cdFx0XHRcdFx0cGhyYXNlOiBpbnB1dFBocmFzZSxcblx0XHRcdFx0XHRmYWlsdXJlOiBpbnB1dFBhcnNlZFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0ZXh0KSkge1xuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fTtcblxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG5cdFx0Y29uc3QgcHJvbXB0T25lID0gYXN5bmMgKHByZXZNZXNzYWdlLCBwcmV2SW5wdXQsIHByZXZQYXJzZWQsIHJldHJ5Q291bnQpID0+IHtcblx0XHRcdGxldCBzZW50U3RhcnQ7XG5cdFx0XHQvLyBUaGlzIGlzIGVpdGhlciBhIHJldHJ5IHByb21wdCwgdGhlIHN0YXJ0IG9mIGEgbm9uLWluZmluaXRlLCBvciB0aGUgc3RhcnQgb2YgYW4gaW5maW5pdGUuXG5cdFx0XHRpZiAocmV0cnlDb3VudCAhPT0gMSB8fCAhaXNJbmZpbml0ZSB8fCAhdmFsdWVzPy5sZW5ndGgpIHtcblx0XHRcdFx0Y29uc3QgcHJvbXB0VHlwZSA9IHJldHJ5Q291bnQgPT09IDEgPyBcInN0YXJ0XCIgOiBcInJldHJ5XCI7XG5cdFx0XHRcdGNvbnN0IHByb21wdGVyID0gcmV0cnlDb3VudCA9PT0gMSA/IHByb21wdE9wdGlvbnMuc3RhcnQgOiBwcm9tcHRPcHRpb25zLnJldHJ5O1xuXHRcdFx0XHRjb25zdCBzdGFydFRleHQgPSBhd2FpdCBnZXRUZXh0KHByb21wdFR5cGUsIHByb21wdGVyLCByZXRyeUNvdW50LCBwcmV2TWVzc2FnZSwgcHJldklucHV0LCBwcmV2UGFyc2VkKTtcblxuXHRcdFx0XHRpZiAoc3RhcnRUZXh0KSB7XG5cdFx0XHRcdFx0c2VudFN0YXJ0ID0gYXdhaXQgKG1lc3NhZ2UudXRpbCB8fCBtZXNzYWdlLmNoYW5uZWwpLnNlbmQoc3RhcnRUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsICYmIHNlbnRTdGFydCkge1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsLnNldEVkaXRhYmxlKGZhbHNlKTtcblx0XHRcdFx0XHRcdG1lc3NhZ2UudXRpbC5zZXRMYXN0UmVzcG9uc2Uoc2VudFN0YXJ0KTtcblx0XHRcdFx0XHRcdG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRTdGFydCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBpbnB1dDtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlucHV0ID0gKFxuXHRcdFx0XHRcdGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5hd2FpdE1lc3NhZ2VzKHtcblx0XHRcdFx0XHRcdGZpbHRlcjogbSA9PiBtLmF1dGhvci5pZCA9PT0gbWVzc2FnZS5hdXRob3IuaWQsXG5cdFx0XHRcdFx0XHRtYXg6IDEsXG5cdFx0XHRcdFx0XHR0aW1lOiBwcm9tcHRPcHRpb25zLnRpbWUsXG5cdFx0XHRcdFx0XHRlcnJvcnM6IFtcInRpbWVcIl1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpLmZpcnN0KCk7XG5cdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKGlucHV0KTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRjb25zdCB0aW1lb3V0VGV4dCA9IGF3YWl0IGdldFRleHQoXCJ0aW1lb3V0XCIsIHByb21wdE9wdGlvbnMudGltZW91dCwgcmV0cnlDb3VudCwgcHJldk1lc3NhZ2UsIHByZXZJbnB1dCwgXCJcIik7XG5cdFx0XHRcdGlmICh0aW1lb3V0VGV4dCkge1xuXHRcdFx0XHRcdGNvbnN0IHNlbnRUaW1lb3V0ID0gYXdhaXQgbWVzc2FnZS5jaGFubmVsLnNlbmQodGltZW91dFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRUaW1lb3V0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocHJvbXB0T3B0aW9ucy5icmVha291dCkge1xuXHRcdFx0XHRjb25zdCBsb29rc0xpa2UgPSBhd2FpdCB0aGlzLmhhbmRsZXIucGFyc2VDb21tYW5kKGlucHV0KTtcblx0XHRcdFx0aWYgKGxvb2tzTGlrZSAmJiBsb29rc0xpa2UuY29tbWFuZCkgcmV0dXJuIEZsYWcucmV0cnkoaW5wdXQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaW5wdXQ/LmNvbnRlbnQudG9Mb3dlckNhc2UoKSA9PT0gcHJvbXB0T3B0aW9ucy5jYW5jZWxXb3JkLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0Y29uc3QgY2FuY2VsVGV4dCA9IGF3YWl0IGdldFRleHQoXCJjYW5jZWxcIiwgcHJvbXB0T3B0aW9ucy5jYW5jZWwsIHJldHJ5Q291bnQsIGlucHV0LCBpbnB1dD8uY29udGVudCwgXCJjYW5jZWxcIik7XG5cdFx0XHRcdGlmIChjYW5jZWxUZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2VudENhbmNlbCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKGNhbmNlbFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRDYW5jZWwpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc0luZmluaXRlICYmIGlucHV0Py5jb250ZW50LnRvTG93ZXJDYXNlKCkgPT09IHByb21wdE9wdGlvbnMuc3RvcFdvcmQudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRpZiAoIXZhbHVlcz8ubGVuZ3RoKSByZXR1cm4gcHJvbXB0T25lKGlucHV0LCBpbnB1dD8uY29udGVudCwgbnVsbCwgcmV0cnlDb3VudCArIDEpO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWVzO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBwYXJzZWRWYWx1ZSA9IGF3YWl0IHRoaXMuY2FzdChpbnB1dCwgaW5wdXQuY29udGVudCk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHBhcnNlZFZhbHVlKSkge1xuXHRcdFx0XHRpZiAocmV0cnlDb3VudCA8PSBwcm9tcHRPcHRpb25zLnJldHJpZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gcHJvbXB0T25lKGlucHV0LCBpbnB1dD8uY29udGVudCwgcGFyc2VkVmFsdWUsIHJldHJ5Q291bnQgKyAxKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGVuZGVkVGV4dCA9IGF3YWl0IGdldFRleHQoXCJlbmRlZFwiLCBwcm9tcHRPcHRpb25zLmVuZGVkLCByZXRyeUNvdW50LCBpbnB1dCwgaW5wdXQ/LmNvbnRlbnQsIFwic3RvcFwiKTtcblx0XHRcdFx0aWYgKGVuZGVkVGV4dCkge1xuXHRcdFx0XHRcdGNvbnN0IHNlbnRFbmRlZCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKGVuZGVkVGV4dCk7XG5cdFx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudEVuZGVkKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaXNJbmZpbml0ZSkge1xuXHRcdFx0XHR2YWx1ZXMucHVzaChwYXJzZWRWYWx1ZSk7XG5cdFx0XHRcdGNvbnN0IGxpbWl0ID0gcHJvbXB0T3B0aW9ucy5saW1pdDtcblx0XHRcdFx0aWYgKHZhbHVlcy5sZW5ndGggPCBsaW1pdCkgcmV0dXJuIHByb21wdE9uZShtZXNzYWdlLCBpbnB1dC5jb250ZW50LCBwYXJzZWRWYWx1ZSwgMSk7XG5cblx0XHRcdFx0cmV0dXJuIHZhbHVlcztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHBhcnNlZFZhbHVlO1xuXHRcdH07XG5cblx0XHR0aGlzLmhhbmRsZXIuYWRkUHJvbXB0KG1lc3NhZ2UuY2hhbm5lbCwgbWVzc2FnZS5hdXRob3IpO1xuXHRcdGNvbnN0IHJldHVyblZhbHVlID0gYXdhaXQgcHJvbXB0T25lKG1lc3NhZ2UsIGNvbW1hbmRJbnB1dCwgcGFyc2VkSW5wdXQsIDEgKyBhZGRpdGlvbmFsUmV0cnkpO1xuXHRcdGlmICh0aGlzLmhhbmRsZXIuY29tbWFuZFV0aWwgJiYgbWVzc2FnZS51dGlsKSB7XG5cdFx0XHRtZXNzYWdlLnV0aWwuc2V0RWRpdGFibGUoZmFsc2UpO1xuXHRcdH1cblxuXHRcdHRoaXMuaGFuZGxlci5yZW1vdmVQcm9tcHQobWVzc2FnZS5jaGFubmVsLCBtZXNzYWdlLmF1dGhvcik7XG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb2Nlc3NlcyB0aGUgdHlwZSBjYXN0aW5nIGFuZCBwcm9tcHRpbmcgb2YgdGhlIGFyZ3VtZW50IGZvciBhIHBocmFzZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBocmFzZSAtIFRoZSBwaHJhc2UgdG8gcHJvY2Vzcy5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBwcm9jZXNzKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgY29tbWFuZERlZnMgPSB0aGlzLmNvbW1hbmQuYXJndW1lbnREZWZhdWx0cztcblx0XHRjb25zdCBoYW5kbGVyRGVmcyA9IHRoaXMuaGFuZGxlci5hcmd1bWVudERlZmF1bHRzO1xuXHRcdGNvbnN0IG9wdGlvbmFsID0gVXRpbC5jaG9pY2UoXG5cdFx0XHR0eXBlb2YgdGhpcy5wcm9tcHQgPT09IFwib2JqZWN0XCIgJiYgdGhpcy5wcm9tcHQgJiYgdGhpcy5wcm9tcHQub3B0aW9uYWwsXG5cdFx0XHRjb21tYW5kRGVmcy5wcm9tcHQgJiYgY29tbWFuZERlZnMucHJvbXB0Lm9wdGlvbmFsLFxuXHRcdFx0aGFuZGxlckRlZnMucHJvbXB0ICYmIGhhbmRsZXJEZWZzLnByb21wdC5vcHRpb25hbFxuXHRcdCk7XG5cblx0XHRjb25zdCBkb090aGVyd2lzZSA9IGFzeW5jIGZhaWx1cmUgPT4ge1xuXHRcdFx0Y29uc3Qgb3RoZXJ3aXNlID0gVXRpbC5jaG9pY2UodGhpcy5vdGhlcndpc2UsIGNvbW1hbmREZWZzLm90aGVyd2lzZSwgaGFuZGxlckRlZnMub3RoZXJ3aXNlKTtcblxuXHRcdFx0Y29uc3QgbW9kaWZ5T3RoZXJ3aXNlID0gVXRpbC5jaG9pY2UoXG5cdFx0XHRcdHRoaXMubW9kaWZ5T3RoZXJ3aXNlLFxuXHRcdFx0XHRjb21tYW5kRGVmcy5tb2RpZnlPdGhlcndpc2UsXG5cdFx0XHRcdGhhbmRsZXJEZWZzLm1vZGlmeU90aGVyd2lzZVxuXHRcdFx0KTtcblxuXHRcdFx0bGV0IHRleHQgPSBhd2FpdCBVdGlsLmludG9DYWxsYWJsZShvdGhlcndpc2UpLmNhbGwodGhpcywgbWVzc2FnZSwge1xuXHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdGZhaWx1cmVcblx0XHRcdH0pO1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGV4dCkpIHtcblx0XHRcdFx0dGV4dCA9IHRleHQuam9pbihcIlxcblwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1vZGlmeU90aGVyd2lzZSkge1xuXHRcdFx0XHR0ZXh0ID0gYXdhaXQgbW9kaWZ5T3RoZXJ3aXNlLmNhbGwodGhpcywgbWVzc2FnZSwgdGV4dCwge1xuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRmYWlsdXJlXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0ZXh0KSkge1xuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRleHQpIHtcblx0XHRcdFx0Y29uc3Qgc2VudCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHRleHQpO1xuXHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0fTtcblxuXHRcdGlmICghcGhyYXNlICYmIG9wdGlvbmFsKSB7XG5cdFx0XHRpZiAodGhpcy5vdGhlcndpc2UgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gZG9PdGhlcndpc2UobnVsbCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBVdGlsLmludG9DYWxsYWJsZSh0aGlzLmRlZmF1bHQpKG1lc3NhZ2UsIHtcblx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlOiBudWxsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRjb25zdCByZXMgPSBhd2FpdCB0aGlzLmNhc3QobWVzc2FnZSwgcGhyYXNlKTtcblx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdGlmICh0aGlzLm90aGVyd2lzZSAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBkb090aGVyd2lzZShyZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5wcm9tcHQgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jb2xsZWN0KG1lc3NhZ2UsIHBocmFzZSwgcmVzKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuZGVmYXVsdCA9PSBudWxsID8gcmVzIDogVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5kZWZhdWx0KShtZXNzYWdlLCB7IHBocmFzZSwgZmFpbHVyZTogcmVzIH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2FzdHMgYSBwaHJhc2UgdG8gdGhpcyBhcmd1bWVudCdzIHR5cGUuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gY2FzdCB0by5cblx0ICogQHBhcmFtIHJlc29sdmVyIC0gVGhlIHR5cGUgcmVzb2x2ZXIuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBocmFzZSAtIFBocmFzZSB0byBwcm9jZXNzLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBhc3luYyBjYXN0KFxuXHRcdHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3Rlcixcblx0XHRyZXNvbHZlcjogVHlwZVJlc29sdmVyLFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGhyYXNlOiBzdHJpbmdcblx0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh0eXBlKSkge1xuXHRcdFx0Zm9yIChjb25zdCBlbnRyeSBvZiB0eXBlKSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGVudHJ5KSkge1xuXHRcdFx0XHRcdGlmIChlbnRyeS5zb21lKHQgPT4gdC50b0xvd2VyQ2FzZSgpID09PSBwaHJhc2UudG9Mb3dlckNhc2UoKSkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlbnRyeVswXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoZW50cnkudG9Mb3dlckNhc2UoKSA9PT0gcGhyYXNlLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZW50cnk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGxldCByZXMgPSB0eXBlKG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UocmVzKSkgcmVzID0gYXdhaXQgcmVzO1xuXHRcdFx0cmV0dXJuIHJlcztcblx0XHR9XG5cblx0XHRpZiAodHlwZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSBwaHJhc2UubWF0Y2godHlwZSk7XG5cdFx0XHRpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0Y29uc3QgbWF0Y2hlcyA9IFtdO1xuXG5cdFx0XHRpZiAodHlwZS5nbG9iYWwpIHtcblx0XHRcdFx0bGV0IG1hdGNoZWQ7XG5cblx0XHRcdFx0d2hpbGUgKChtYXRjaGVkID0gdHlwZS5leGVjKHBocmFzZSkpICE9IG51bGwpIHtcblx0XHRcdFx0XHRtYXRjaGVzLnB1c2gobWF0Y2hlZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHsgbWF0Y2gsIG1hdGNoZXMgfTtcblx0XHR9XG5cblx0XHRpZiAocmVzb2x2ZXIudHlwZSh0eXBlKSkge1xuXHRcdFx0bGV0IHJlcyA9IHJlc29sdmVyLnR5cGUodHlwZSk/LmNhbGwodGhpcywgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShyZXMpKSByZXMgPSBhd2FpdCByZXM7XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH1cblxuXHRcdHJldHVybiBwaHJhc2UgfHwgbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IGlzIHRoZSBsZWZ0LXRvLXJpZ2h0IGNvbXBvc2l0aW9uIG9mIHRoZSBnaXZlbiB0eXBlcy5cblx0ICogSWYgYW55IG9mIHRoZSB0eXBlcyBmYWlscywgdGhlIGVudGlyZSBjb21wb3NpdGlvbiBmYWlscy5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBjb21wb3NlKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0bGV0IGFjYyA9IHBocmFzZTtcblx0XHRcdGZvciAobGV0IGVudHJ5IG9mIHR5cGVzKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZW50cnkgPT09IFwiZnVuY3Rpb25cIikgZW50cnkgPSBlbnRyeS5iaW5kKHRoaXMpO1xuXHRcdFx0XHRhY2MgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIGFjYyk7XG5cdFx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUoYWNjKSkgcmV0dXJuIGFjYztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGFjYztcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHRoYXQgaXMgdGhlIGxlZnQtdG8tcmlnaHQgY29tcG9zaXRpb24gb2YgdGhlIGdpdmVuIHR5cGVzLlxuXHQgKiBJZiBhbnkgb2YgdGhlIHR5cGVzIGZhaWxzLCB0aGUgY29tcG9zaXRpb24gc3RpbGwgY29udGludWVzIHdpdGggdGhlIGZhaWx1cmUgcGFzc2VkIG9uLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGNvbXBvc2VXaXRoRmFpbHVyZSguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGxldCBhY2MgPSBwaHJhc2U7XG5cdFx0XHRmb3IgKGxldCBlbnRyeSBvZiB0eXBlcykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5ID09PSBcImZ1bmN0aW9uXCIpIGVudHJ5ID0gZW50cnkuYmluZCh0aGlzKTtcblx0XHRcdFx0YWNjID0gYXdhaXQgQXJndW1lbnQuY2FzdChlbnRyeSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBhY2MpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYWNjO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHNvbWV0aGluZyBpcyBudWxsLCB1bmRlZmluZWQsIG9yIGEgZmFpbCBmbGFnLlxuXHQgKiBAcGFyYW0gdmFsdWUgLSBWYWx1ZSB0byBjaGVjay5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgaXNGYWlsdXJlKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBudWxsIHwgdW5kZWZpbmVkIHwgKEZsYWcgJiB7IHZhbHVlOiBhbnkgfSkge1xuXHRcdHJldHVybiB2YWx1ZSA9PSBudWxsIHx8IEZsYWcuaXModmFsdWUsIFwiZmFpbFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSBmcm9tIG11bHRpcGxlIHR5cGVzIChwcm9kdWN0IHR5cGUpLlxuXHQgKiBPbmx5IGlucHV0cyB3aGVyZSBlYWNoIHR5cGUgcmVzb2x2ZXMgd2l0aCBhIG5vbi12b2lkIHZhbHVlIGFyZSB2YWxpZC5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBwcm9kdWN0KC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IFtdO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuXHRcdFx0XHRyZXN1bHRzLnB1c2gocmVzKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdHM7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB3aGVyZSB0aGUgcGFyc2VkIHZhbHVlIG11c3QgYmUgd2l0aGluIGEgcmFuZ2UuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gbWluIC0gTWluaW11bSB2YWx1ZS5cblx0ICogQHBhcmFtIG1heCAtIE1heGltdW0gdmFsdWUuXG5cdCAqIEBwYXJhbSBpbmNsdXNpdmUgLSBXaGV0aGVyIG9yIG5vdCB0byBiZSBpbmNsdXNpdmUgb24gdGhlIHVwcGVyIGJvdW5kLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyByYW5nZShcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsXG5cdFx0bWluOiBudW1iZXIsXG5cdFx0bWF4OiBudW1iZXIsXG5cdFx0aW5jbHVzaXZlID0gZmFsc2Vcblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gQXJndW1lbnQudmFsaWRhdGUodHlwZSwgKG1zZywgcCwgeCkgPT4ge1xuXHRcdFx0Y29uc3QgbyA9XG5cdFx0XHRcdHR5cGVvZiB4ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB4ID09PSBcImJpZ2ludFwiID8geCA6IHgubGVuZ3RoICE9IG51bGwgPyB4Lmxlbmd0aCA6IHguc2l6ZSAhPSBudWxsID8geC5zaXplIDogeDtcblxuXHRcdFx0cmV0dXJuIG8gPj0gbWluICYmIChpbmNsdXNpdmUgPyBvIDw9IG1heCA6IG8gPCBtYXgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHRoYXQgcGFyc2VzIGFzIG5vcm1hbCBidXQgYWxzbyB0YWdzIGl0IHdpdGggc29tZSBkYXRhLlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IHRhZywgdmFsdWUgfWAgYW5kIHdyYXBwZWQgaW4gYEZsYWcuZmFpbGAgd2hlbiBmYWlsZWQuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gdGFnIC0gVGFnIHRvIGFkZC4gRGVmYXVsdHMgdG8gdGhlIGB0eXBlYCBhcmd1bWVudCwgc28gdXNlZnVsIGlmIGl0IGlzIGEgc3RyaW5nLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0YWdnZWQodHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLCB0YWc6IGFueSA9IHR5cGUpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikgdHlwZSA9IHR5cGUuYmluZCh0aGlzKTtcblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QodHlwZSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRcdHJldHVybiBGbGFnLmZhaWwoeyB0YWcsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IHRhZywgdmFsdWU6IHJlcyB9O1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAodW5pb24gdHlwZSkuXG5cdCAqIFRoZSBmaXJzdCB0eXBlIHRoYXQgcmVzb2x2ZXMgdG8gYSBub24tdm9pZCB2YWx1ZSBpcyB1c2VkLlxuXHQgKiBFYWNoIHR5cGUgd2lsbCBhbHNvIGJlIHRhZ2dlZCB1c2luZyBgdGFnZ2VkYCB3aXRoIHRoZW1zZWx2ZXMuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGFnZ2VkVW5pb24oLi4udHlwZXM6IChBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpW10pOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRmb3IgKGxldCBlbnRyeSBvZiB0eXBlcykge1xuXHRcdFx0XHRlbnRyeSA9IEFyZ3VtZW50LnRhZ2dlZChlbnRyeSk7XG5cdFx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdFx0aWYgKCFBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHJlcztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IHBhcnNlcyBhcyBub3JtYWwgYnV0IGFsc28gdGFncyBpdCB3aXRoIHNvbWUgZGF0YSBhbmQgY2FycmllcyB0aGUgb3JpZ2luYWwgaW5wdXQuXG5cdCAqIFJlc3VsdCBpcyBpbiBhbiBvYmplY3QgYHsgdGFnLCBpbnB1dCwgdmFsdWUgfWAgYW5kIHdyYXBwZWQgaW4gYEZsYWcuZmFpbGAgd2hlbiBmYWlsZWQuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gdGFnIC0gVGFnIHRvIGFkZC4gRGVmYXVsdHMgdG8gdGhlIGB0eXBlYCBhcmd1bWVudCwgc28gdXNlZnVsIGlmIGl0IGlzIGEgc3RyaW5nLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0YWdnZWRXaXRoSW5wdXQodHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLCB0YWc6IGFueSA9IHR5cGUpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikgdHlwZSA9IHR5cGUuYmluZCh0aGlzKTtcblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QodHlwZSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRcdHJldHVybiBGbGFnLmZhaWwoeyB0YWcsIGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IHRhZywgaW5wdXQ6IHBocmFzZSwgdmFsdWU6IHJlcyB9O1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAodW5pb24gdHlwZSkuXG5cdCAqIFRoZSBmaXJzdCB0eXBlIHRoYXQgcmVzb2x2ZXMgdG8gYSBub24tdm9pZCB2YWx1ZSBpcyB1c2VkLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHVuaW9uKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdFx0aWYgKCFBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHJlcztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB3aXRoIGV4dHJhIHZhbGlkYXRpb24uXG5cdCAqIElmIHRoZSBwcmVkaWNhdGUgaXMgbm90IHRydWUsIHRoZSB2YWx1ZSBpcyBjb25zaWRlcmVkIGludmFsaWQuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gcHJlZGljYXRlIC0gVGhlIHByZWRpY2F0ZSBmdW5jdGlvbi5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdmFsaWRhdGUodHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLCBwcmVkaWNhdGU6IFBhcnNlZFZhbHVlUHJlZGljYXRlKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHR5cGUgPSB0eXBlLmJpbmQodGhpcyk7XG5cdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KHR5cGUsIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHJlcztcblx0XHRcdGlmICghcHJlZGljYXRlLmNhbGwodGhpcywgbWVzc2FnZSwgcGhyYXNlLCByZXMpKSByZXR1cm4gbnVsbDtcblx0XHRcdHJldHVybiByZXM7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IHBhcnNlcyBhcyBub3JtYWwgYnV0IGFsc28gY2FycmllcyB0aGUgb3JpZ2luYWwgaW5wdXQuXG5cdCAqIFJlc3VsdCBpcyBpbiBhbiBvYmplY3QgYHsgaW5wdXQsIHZhbHVlIH1gIGFuZCB3cmFwcGVkIGluIGBGbGFnLmZhaWxgIHdoZW4gZmFpbGVkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgd2l0aElucHV0KHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3Rlcik6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdCh0eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdFx0cmV0dXJuIEZsYWcuZmFpbCh7IGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfTtcblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgaG93IGFuIGFyZ3VtZW50IHBhcnNlcyB0ZXh0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50T3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBEZWZhdWx0IHZhbHVlIGlmIG5vIGlucHV0IG9yIGRpZCBub3QgY2FzdCBjb3JyZWN0bHkuXG5cdCAqIElmIHVzaW5nIGEgZmxhZyBtYXRjaCwgc2V0dGluZyB0aGUgZGVmYXVsdCB2YWx1ZSB0byBhIG5vbi12b2lkIHZhbHVlIGludmVyc2VzIHRoZSByZXN1bHQuXG5cdCAqL1xuXHRkZWZhdWx0PzogRGVmYXVsdFZhbHVlU3VwcGxpZXIgfCBhbnk7XG5cblx0LyoqIFRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgYXJndW1lbnQgKi9cblx0ZGVzY3JpcHRpb24/OiBzdHJpbmcgfCBhbnkgfCBhbnlbXTtcblxuXHQvKiogVGhlIHN0cmluZyhzKSB0byB1c2UgYXMgdGhlIGZsYWcgZm9yIGZsYWcgb3Igb3B0aW9uIG1hdGNoLiAqL1xuXHRmbGFnPzogc3RyaW5nIHwgc3RyaW5nW107XG5cblx0LyoqICBJRCBvZiB0aGUgYXJndW1lbnQgZm9yIHVzZSBpbiB0aGUgYXJncyBvYmplY3QuIFRoaXMgZG9lcyBub3RoaW5nIGluc2lkZSBhbiBBcmd1bWVudEdlbmVyYXRvci4gKi9cblx0aWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEluZGV4IG9mIHBocmFzZSB0byBzdGFydCBmcm9tLiBBcHBsaWNhYmxlIHRvIHBocmFzZSwgdGV4dCwgY29udGVudCwgcmVzdCwgb3Igc2VwYXJhdGUgbWF0Y2ggb25seS5cblx0ICogSWdub3JlZCB3aGVuIHVzZWQgd2l0aCB0aGUgdW5vcmRlcmVkIG9wdGlvbi5cblx0ICovXG5cdGluZGV4PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBBbW91bnQgb2YgcGhyYXNlcyB0byBtYXRjaCB3aGVuIG1hdGNoaW5nIG1vcmUgdGhhbiBvbmUuXG5cdCAqIEFwcGxpY2FibGUgdG8gdGV4dCwgY29udGVudCwgcmVzdCwgb3Igc2VwYXJhdGUgbWF0Y2ggb25seS5cblx0ICogRGVmYXVsdHMgdG8gaW5maW5pdHkuXG5cdCAqL1xuXHRsaW1pdD86IG51bWJlcjtcblxuXHQvKiogTWV0aG9kIHRvIG1hdGNoIHRleHQuIERlZmF1bHRzIHRvICdwaHJhc2UnLiAqL1xuXHRtYXRjaD86IEFyZ3VtZW50TWF0Y2g7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdGhlcndpc2UgY29udGVudC4gKi9cblx0bW9kaWZ5T3RoZXJ3aXNlPzogT3RoZXJ3aXNlQ29udGVudE1vZGlmaWVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBoYXZlIGZsYWdzIHByb2Nlc3MgbXVsdGlwbGUgaW5wdXRzLlxuXHQgKiBGb3Igb3B0aW9uIGZsYWdzLCB0aGlzIHdvcmtzIGxpa2UgdGhlIHNlcGFyYXRlIG1hdGNoOyB0aGUgbGltaXQgb3B0aW9uIHdpbGwgYWxzbyB3b3JrIGhlcmUuXG5cdCAqIEZvciBmbGFncywgdGhpcyB3aWxsIGNvdW50IHRoZSBudW1iZXIgb2Ygb2NjdXJyZW5jZXMuXG5cdCAqL1xuXHRtdWx0aXBsZUZsYWdzPzogYm9vbGVhbjtcblxuXHQvKiogVGV4dCBzZW50IGlmIGFyZ3VtZW50IHBhcnNpbmcgZmFpbHMuIFRoaXMgb3ZlcnJpZGVzIHRoZSBgZGVmYXVsdGAgb3B0aW9uIGFuZCBhbGwgcHJvbXB0IG9wdGlvbnMuICovXG5cdG90aGVyd2lzZT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBPdGhlcndpc2VDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIFByb21wdCBvcHRpb25zIGZvciB3aGVuIHVzZXIgZG9lcyBub3QgcHJvdmlkZSBpbnB1dC4gKi9cblx0cHJvbXB0PzogQXJndW1lbnRQcm9tcHRPcHRpb25zIHwgYm9vbGVhbjtcblxuXHQvKiogVHlwZSB0byBjYXN0IHRvLiAqL1xuXHR0eXBlPzogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyO1xuXG5cdC8qKlxuXHQgKiBNYXJrcyB0aGUgYXJndW1lbnQgYXMgdW5vcmRlcmVkLlxuXHQgKiBFYWNoIHBocmFzZSBpcyBldmFsdWF0ZWQgaW4gb3JkZXIgdW50aWwgb25lIG1hdGNoZXMgKG5vIGlucHV0IGF0IGFsbCBtZWFucyBubyBldmFsdWF0aW9uKS5cblx0ICogUGFzc2luZyBpbiBhIG51bWJlciBmb3JjZXMgZXZhbHVhdGlvbiBmcm9tIHRoYXQgaW5kZXggb253YXJkcy5cblx0ICogUGFzc2luZyBpbiBhbiBhcnJheSBvZiBudW1iZXJzIGZvcmNlcyBldmFsdWF0aW9uIG9uIHRob3NlIGluZGljZXMgb25seS5cblx0ICogSWYgdGhlcmUgaXMgYSBtYXRjaCwgdGhhdCBpbmRleCBpcyBjb25zaWRlcmVkIHVzZWQgYW5kIGZ1dHVyZSB1bm9yZGVyZWQgYXJncyB3aWxsIG5vdCBjaGVjayB0aGF0IGluZGV4IGFnYWluLlxuXHQgKiBJZiB0aGVyZSBpcyBubyBtYXRjaCwgdGhlbiB0aGUgcHJvbXB0aW5nIG9yIGRlZmF1bHQgdmFsdWUgaXMgdXNlZC5cblx0ICogQXBwbGljYWJsZSB0byBwaHJhc2UgbWF0Y2ggb25seS5cblx0ICovXG5cdHVub3JkZXJlZD86IGJvb2xlYW4gfCBudW1iZXIgfCBudW1iZXJbXTtcbn1cblxuLyoqXG4gKiBEYXRhIHBhc3NlZCB0byBhcmd1bWVudCBwcm9tcHQgZnVuY3Rpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50UHJvbXB0RGF0YSB7XG5cdC8qKiBXaGV0aGVyIHRoZSBwcm9tcHQgaXMgaW5maW5pdGUgb3Igbm90LiAqL1xuXHRpbmZpbml0ZTogYm9vbGVhbjtcblxuXHQvKiogVGhlIG1lc3NhZ2UgdGhhdCBjYXVzZWQgdGhlIHByb21wdC4gKi9cblx0bWVzc2FnZTogTWVzc2FnZTtcblxuXHQvKiogQW1vdW50IG9mIHJldHJpZXMgc28gZmFyLiAqL1xuXHRyZXRyaWVzOiBudW1iZXI7XG5cblx0LyoqIFRoZSBpbnB1dCBwaHJhc2UgdGhhdCBjYXVzZWQgdGhlIHByb21wdCBpZiB0aGVyZSB3YXMgb25lLCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nLiAqL1xuXHRwaHJhc2U6IHN0cmluZztcblxuXHQvKiogVGhlIHZhbHVlIHRoYXQgZmFpbGVkIGlmIHRoZXJlIHdhcyBvbmUsIG90aGVyd2lzZSBudWxsLiAqL1xuXHRmYWlsdXJlOiB2b2lkIHwgKEZsYWcgJiB7IHZhbHVlOiBhbnkgfSk7XG59XG5cbi8qKlxuICogQSBwcm9tcHQgdG8gcnVuIGlmIHRoZSB1c2VyIGRpZCBub3QgaW5wdXQgdGhlIGFyZ3VtZW50IGNvcnJlY3RseS5cbiAqIENhbiBvbmx5IGJlIHVzZWQgaWYgdGhlcmUgaXMgbm90IGEgZGVmYXVsdCB2YWx1ZSAodW5sZXNzIG9wdGlvbmFsIGlzIHRydWUpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50UHJvbXB0T3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBXaGVuZXZlciBhbiBpbnB1dCBtYXRjaGVzIHRoZSBmb3JtYXQgb2YgYSBjb21tYW5kLCB0aGlzIG9wdGlvbiBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0byBjYW5jZWwgdGhpcyBjb21tYW5kIGFuZCBydW4gdGhhdCBjb21tYW5kLlxuXHQgKiBUaGUgY29tbWFuZCB0byBiZSBydW4gbWF5IGJlIHRoZSBzYW1lIGNvbW1hbmQgb3Igc29tZSBvdGhlciBjb21tYW5kLlxuXHQgKiBEZWZhdWx0cyB0byB0cnVlLFxuXHQgKi9cblx0YnJlYWtvdXQ/OiBib29sZWFuO1xuXG5cdC8qKiBUZXh0IHNlbnQgb24gY2FuY2VsbGF0aW9uIG9mIGNvbW1hbmQuICovXG5cdGNhbmNlbD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIFdvcmQgdG8gdXNlIGZvciBjYW5jZWxsaW5nIHRoZSBjb21tYW5kLiBEZWZhdWx0cyB0byAnY2FuY2VsJy4gKi9cblx0Y2FuY2VsV29yZD86IHN0cmluZztcblxuXHQvKiogVGV4dCBzZW50IG9uIGFtb3VudCBvZiB0cmllcyByZWFjaGluZyB0aGUgbWF4LiAqL1xuXHRlbmRlZD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFByb21wdHMgZm9yZXZlciB1bnRpbCB0aGUgc3RvcCB3b3JkLCBjYW5jZWwgd29yZCwgdGltZSBsaW1pdCwgb3IgcmV0cnkgbGltaXQuXG5cdCAqIE5vdGUgdGhhdCB0aGUgcmV0cnkgY291bnQgcmVzZXRzIGJhY2sgdG8gb25lIG9uIGVhY2ggdmFsaWQgZW50cnkuXG5cdCAqIFRoZSBmaW5hbCBldmFsdWF0ZWQgYXJndW1lbnQgd2lsbCBiZSBhbiBhcnJheSBvZiB0aGUgaW5wdXRzLlxuXHQgKiBEZWZhdWx0cyB0byBmYWxzZS5cblx0ICovXG5cdGluZmluaXRlPzogYm9vbGVhbjtcblxuXHQvKiogQW1vdW50IG9mIGlucHV0cyBhbGxvd2VkIGZvciBhbiBpbmZpbml0ZSBwcm9tcHQgYmVmb3JlIGZpbmlzaGluZy4gRGVmYXVsdHMgdG8gSW5maW5pdHkuICovXG5cdGxpbWl0PzogbnVtYmVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgY2FuY2VsIG1lc3NhZ2VzLiAqL1xuXHRtb2RpZnlDYW5jZWw/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdXQgb2YgdHJpZXMgbWVzc2FnZXMuICovXG5cdG1vZGlmeUVuZGVkPzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgcmV0cnkgcHJvbXB0cy4gKi9cblx0bW9kaWZ5UmV0cnk/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSBzdGFydCBwcm9tcHRzLiAqL1xuXHRtb2RpZnlTdGFydD86IFByb21wdENvbnRlbnRNb2RpZmllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IHRpbWVvdXQgbWVzc2FnZXMuICovXG5cdG1vZGlmeVRpbWVvdXQ/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIFByb21wdHMgb25seSB3aGVuIGFyZ3VtZW50IGlzIHByb3ZpZGVkIGJ1dCB3YXMgbm90IG9mIHRoZSByaWdodCB0eXBlLiBEZWZhdWx0cyB0byBmYWxzZS4gKi9cblx0b3B0aW9uYWw/OiBib29sZWFuO1xuXG5cdC8qKiBBbW91bnQgb2YgcmV0cmllcyBhbGxvd2VkLiBEZWZhdWx0cyB0byAxLiAqL1xuXHRyZXRyaWVzPzogbnVtYmVyO1xuXG5cdC8qKiBUZXh0IHNlbnQgb24gYSByZXRyeSAoZmFpbHVyZSB0byBjYXN0IHR5cGUpLiAqL1xuXHRyZXRyeT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIFRleHQgc2VudCBvbiBzdGFydCBvZiBwcm9tcHQuICovXG5cdHN0YXJ0Pzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21wdENvbnRlbnRTdXBwbGllcjtcblxuXHQvKiogV29yZCB0byB1c2UgZm9yIGVuZGluZyBpbmZpbml0ZSBwcm9tcHRzLiBEZWZhdWx0cyB0byAnc3RvcCcuICovXG5cdHN0b3BXb3JkPzogc3RyaW5nO1xuXG5cdC8qKiBUaW1lIHRvIHdhaXQgZm9yIGlucHV0LiBEZWZhdWx0cyB0byAzMDAwMC4gKi9cblx0dGltZT86IG51bWJlcjtcblxuXHQvKiogVGV4dCBzZW50IG9uIGNvbGxlY3RvciB0aW1lIG91dC4gKi9cblx0dGltZW91dD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG59XG5cbi8qKlxuICogVGhlIG1ldGhvZCB0byBtYXRjaCBhcmd1bWVudHMgZnJvbSB0ZXh0LlxuICogLSBgcGhyYXNlYCBtYXRjaGVzIGJ5IHRoZSBvcmRlciBvZiB0aGUgcGhyYXNlcyBpbnB1dHRlZC5cbiAqIEl0IGlnbm9yZXMgcGhyYXNlcyB0aGF0IG1hdGNoZXMgYSBmbGFnLlxuICogLSBgZmxhZ2AgbWF0Y2hlcyBwaHJhc2VzIHRoYXQgYXJlIHRoZSBzYW1lIGFzIGl0cyBmbGFnLlxuICogVGhlIGV2YWx1YXRlZCBhcmd1bWVudCBpcyBlaXRoZXIgdHJ1ZSBvciBmYWxzZS5cbiAqIC0gYG9wdGlvbmAgbWF0Y2hlcyBwaHJhc2VzIHRoYXQgc3RhcnRzIHdpdGggdGhlIGZsYWcuXG4gKiBUaGUgcGhyYXNlIGFmdGVyIHRoZSBmbGFnIGlzIHRoZSBldmFsdWF0ZWQgYXJndW1lbnQuXG4gKiAtIGByZXN0YCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSBwaHJhc2VzLlxuICogSXQgaWdub3JlcyBwaHJhc2VzIHRoYXQgbWF0Y2hlcyBhIGZsYWcuXG4gKiBJdCBwcmVzZXJ2ZXMgdGhlIG9yaWdpbmFsIHdoaXRlc3BhY2UgYmV0d2VlbiBwaHJhc2VzIGFuZCB0aGUgcXVvdGVzIGFyb3VuZCBwaHJhc2VzLlxuICogLSBgc2VwYXJhdGVgIG1hdGNoZXMgdGhlIHJlc3Qgb2YgdGhlIHBocmFzZXMgYW5kIHByb2Nlc3NlcyBlYWNoIGluZGl2aWR1YWxseS5cbiAqIEl0IGlnbm9yZXMgcGhyYXNlcyB0aGF0IG1hdGNoZXMgYSBmbGFnLlxuICogLSBgdGV4dGAgbWF0Y2hlcyB0aGUgZW50aXJlIHRleHQsIGV4Y2VwdCBmb3IgdGhlIGNvbW1hbmQuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIEl0IHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgd2hpdGVzcGFjZSBiZXR3ZWVuIHBocmFzZXMgYW5kIHRoZSBxdW90ZXMgYXJvdW5kIHBocmFzZXMuXG4gKiAtIGBjb250ZW50YCBtYXRjaGVzIHRoZSBlbnRpcmUgdGV4dCBhcyBpdCB3YXMgaW5wdXR0ZWQsIGV4Y2VwdCBmb3IgdGhlIGNvbW1hbmQuXG4gKiBJdCBwcmVzZXJ2ZXMgdGhlIG9yaWdpbmFsIHdoaXRlc3BhY2UgYmV0d2VlbiBwaHJhc2VzIGFuZCB0aGUgcXVvdGVzIGFyb3VuZCBwaHJhc2VzLlxuICogLSBgcmVzdENvbnRlbnRgIG1hdGNoZXMgdGhlIHJlc3Qgb2YgdGhlIHRleHQgYXMgaXQgd2FzIGlucHV0dGVkLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYG5vbmVgIG1hdGNoZXMgbm90aGluZyBhdCBhbGwgYW5kIGFuIGVtcHR5IHN0cmluZyB3aWxsIGJlIHVzZWQgZm9yIHR5cGUgb3BlcmF0aW9ucy5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRNYXRjaCA9XG5cdHwgXCJwaHJhc2VcIlxuXHR8IFwiZmxhZ1wiXG5cdHwgXCJvcHRpb25cIlxuXHR8IFwicmVzdFwiXG5cdHwgXCJzZXBhcmF0ZVwiXG5cdHwgXCJ0ZXh0XCJcblx0fCBcImNvbnRlbnRcIlxuXHR8IFwicmVzdENvbnRlbnRcIlxuXHR8IFwibm9uZVwiO1xuXG4vKipcbiAqIFRoZSB0eXBlIHRoYXQgdGhlIGFyZ3VtZW50IHNob3VsZCBiZSBjYXN0IHRvLlxuICogLSBgc3RyaW5nYCBkb2VzIG5vdCBjYXN0IHRvIGFueSB0eXBlLlxuICogLSBgbG93ZXJjYXNlYCBtYWtlcyB0aGUgaW5wdXQgbG93ZXJjYXNlLlxuICogLSBgdXBwZXJjYXNlYCBtYWtlcyB0aGUgaW5wdXQgdXBwZXJjYXNlLlxuICogLSBgY2hhckNvZGVzYCB0cmFuc2Zvcm1zIHRoZSBpbnB1dCB0byBhbiBhcnJheSBvZiBjaGFyIGNvZGVzLlxuICogLSBgbnVtYmVyYCBjYXN0cyB0byBhIG51bWJlci5cbiAqIC0gYGludGVnZXJgIGNhc3RzIHRvIGFuIGludGVnZXIuXG4gKiAtIGBiaWdpbnRgIGNhc3RzIHRvIGEgYmlnIGludGVnZXIuXG4gKiAtIGB1cmxgIGNhc3RzIHRvIGFuIGBVUkxgIG9iamVjdC5cbiAqIC0gYGRhdGVgIGNhc3RzIHRvIGEgYERhdGVgIG9iamVjdC5cbiAqIC0gYGNvbG9yYCBjYXN0cyBhIGhleCBjb2RlIHRvIGFuIGludGVnZXIuXG4gKiAtIGBjb21tYW5kQWxpYXNgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBjb21tYW5kIGZyb20gYW4gYWxpYXMuXG4gKiAtIGBjb21tYW5kYCBtYXRjaGVzIHRoZSBJRCBvZiBhIGNvbW1hbmQuXG4gKiAtIGBpbmhpYml0b3JgIG1hdGNoZXMgdGhlIElEIG9mIGFuIGluaGliaXRvci5cbiAqIC0gYGxpc3RlbmVyYCBtYXRjaGVzIHRoZSBJRCBvZiBhIGxpc3RlbmVyLlxuICpcbiAqIFBvc3NpYmxlIERpc2NvcmQtcmVsYXRlZCB0eXBlcy5cbiAqIFRoZXNlIHR5cGVzIGNhbiBiZSBwbHVyYWwgKGFkZCBhbiAncycgdG8gdGhlIGVuZCkgYW5kIGEgY29sbGVjdGlvbiBvZiBtYXRjaGluZyBvYmplY3RzIHdpbGwgYmUgdXNlZC5cbiAqIC0gYHVzZXJgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB1c2VyLlxuICogLSBgbWVtYmVyYCB0cmllcyB0byByZXNvbHZlIHRvIGEgbWVtYmVyLlxuICogLSBgcmVsZXZhbnRgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSByZWxldmFudCB1c2VyLCB3b3JrcyBpbiBib3RoIGd1aWxkcyBhbmQgRE1zLlxuICogLSBgY2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIGNoYW5uZWwuXG4gKiAtIGB0ZXh0Q2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHRleHQgY2hhbm5lbC5cbiAqIC0gYHZvaWNlQ2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHZvaWNlIGNoYW5uZWwuXG4gKiAtIGBzdGFnZUNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBzdGFnZSBjaGFubmVsLlxuICogLSBgdGhyZWFkQ2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSBhIHRocmVhZCBjaGFubmVsLlxuICogLSBgcm9sZWAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHJvbGUuXG4gKiAtIGBlbW9qaWAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIGN1c3RvbSBlbW9qaS5cbiAqIC0gYGd1aWxkYCB0cmllcyB0byByZXNvbHZlIHRvIGEgZ3VpbGQuXG4gKlxuICogT3RoZXIgRGlzY29yZC1yZWxhdGVkIHR5cGVzOlxuICogLSBgbWVzc2FnZWAgdHJpZXMgdG8gZmV0Y2ggYSBtZXNzYWdlIGZyb20gYW4gSUQgd2l0aGluIHRoZSBjaGFubmVsLlxuICogLSBgZ3VpbGRNZXNzYWdlYCB0cmllcyB0byBmZXRjaCBhIG1lc3NhZ2UgZnJvbSBhbiBJRCB3aXRoaW4gdGhlIGd1aWxkLlxuICogLSBgcmVsZXZhbnRNZXNzYWdlYCBpcyBhIGNvbWJpbmF0aW9uIG9mIHRoZSBhYm92ZSwgd29ya3MgaW4gYm90aCBndWlsZHMgYW5kIERNcy5cbiAqIC0gYGludml0ZWAgdHJpZXMgdG8gZmV0Y2ggYW4gaW52aXRlIG9iamVjdCBmcm9tIGEgbGluay5cbiAqIC0gYHVzZXJNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhIHVzZXIuXG4gKiAtIGBtZW1iZXJNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhIGd1aWxkIG1lbWJlci5cbiAqIC0gYGNoYW5uZWxNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhIGNoYW5uZWwuXG4gKiAtIGByb2xlTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSByb2xlLlxuICogLSBgZW1vamlNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhbiBlbW9qaS5cbiAqXG4gKiBBbiBhcnJheSBvZiBzdHJpbmdzIGNhbiBiZSB1c2VkIHRvIHJlc3RyaWN0IGlucHV0IHRvIG9ubHkgdGhvc2Ugc3RyaW5ncywgY2FzZSBpbnNlbnNpdGl2ZS5cbiAqIFRoZSBhcnJheSBjYW4gYWxzbyBjb250YWluIGFuIGlubmVyIGFycmF5IG9mIHN0cmluZ3MsIGZvciBhbGlhc2VzLlxuICogSWYgc28sIHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkgd2lsbCBiZSB1c2VkIGFzIHRoZSBmaW5hbCBhcmd1bWVudC5cbiAqXG4gKiBBIHJlZ3VsYXIgZXhwcmVzc2lvbiBjYW4gYWxzbyBiZSB1c2VkLlxuICogVGhlIGV2YWx1YXRlZCBhcmd1bWVudCB3aWxsIGJlIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBgbWF0Y2hgIGFuZCBgbWF0Y2hlc2AgaWYgZ2xvYmFsLlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudFR5cGUgPVxuXHR8IFwic3RyaW5nXCJcblx0fCBcImxvd2VyY2FzZVwiXG5cdHwgXCJ1cHBlcmNhc2VcIlxuXHR8IFwiY2hhckNvZGVzXCJcblx0fCBcIm51bWJlclwiXG5cdHwgXCJpbnRlZ2VyXCJcblx0fCBcImJpZ2ludFwiXG5cdHwgXCJlbW9qaW50XCJcblx0fCBcInVybFwiXG5cdHwgXCJkYXRlXCJcblx0fCBcImNvbG9yXCJcblx0fCBcInVzZXJcIlxuXHR8IFwidXNlcnNcIlxuXHR8IFwibWVtYmVyXCJcblx0fCBcIm1lbWJlcnNcIlxuXHR8IFwicmVsZXZhbnRcIlxuXHR8IFwicmVsZXZhbnRzXCJcblx0fCBcImNoYW5uZWxcIlxuXHR8IFwiY2hhbm5lbHNcIlxuXHR8IFwidGV4dENoYW5uZWxcIlxuXHR8IFwidGV4dENoYW5uZWxzXCJcblx0fCBcInZvaWNlQ2hhbm5lbFwiXG5cdHwgXCJ2b2ljZUNoYW5uZWxzXCJcblx0fCBcImNhdGVnb3J5Q2hhbm5lbFwiXG5cdHwgXCJjYXRlZ29yeUNoYW5uZWxzXCJcblx0fCBcIm5ld3NDaGFubmVsXCJcblx0fCBcIm5ld3NDaGFubmVsc1wiXG5cdHwgXCJzdG9yZUNoYW5uZWxcIlxuXHR8IFwic3RvcmVDaGFubmVsc1wiXG5cdHwgXCJzdGFnZUNoYW5uZWxcIlxuXHR8IFwic3RhZ2VDaGFubmVsc1wiXG5cdHwgXCJ0aHJlYWRDaGFubmVsXCJcblx0fCBcInRocmVhZENoYW5uZWxzXCJcblx0fCBcInJvbGVcIlxuXHR8IFwicm9sZXNcIlxuXHR8IFwiZW1vamlcIlxuXHR8IFwiZW1vamlzXCJcblx0fCBcImd1aWxkXCJcblx0fCBcImd1aWxkc1wiXG5cdHwgXCJtZXNzYWdlXCJcblx0fCBcImd1aWxkTWVzc2FnZVwiXG5cdHwgXCJyZWxldmFudE1lc3NhZ2VcIlxuXHR8IFwiaW52aXRlXCJcblx0fCBcInVzZXJNZW50aW9uXCJcblx0fCBcIm1lbWJlck1lbnRpb25cIlxuXHR8IFwiY2hhbm5lbE1lbnRpb25cIlxuXHR8IFwicm9sZU1lbnRpb25cIlxuXHR8IFwiZW1vamlNZW50aW9uXCJcblx0fCBcImNvbW1hbmRBbGlhc1wiXG5cdHwgXCJjb21tYW5kXCJcblx0fCBcImluaGliaXRvclwiXG5cdHwgXCJsaXN0ZW5lclwiXG5cdHwgKHN0cmluZyB8IHN0cmluZ1tdKVtdXG5cdHwgUmVnRXhwXG5cdHwgc3RyaW5nO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gZm9yIHByb2Nlc3NpbmcgdXNlciBpbnB1dCB0byB1c2UgYXMgYW4gYXJndW1lbnQuXG4gKiBBIHZvaWQgcmV0dXJuIHZhbHVlIHdpbGwgdXNlIHRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGUgYXJndW1lbnQgb3Igc3RhcnQgYSBwcm9tcHQuXG4gKiBBbnkgb3RoZXIgdHJ1dGh5IHJldHVybiB2YWx1ZSB3aWxsIGJlIHVzZWQgYXMgdGhlIGV2YWx1YXRlZCBhcmd1bWVudC5cbiAqIElmIHJldHVybmluZyBhIFByb21pc2UsIHRoZSByZXNvbHZlZCB2YWx1ZSB3aWxsIGdvIHRocm91Z2ggdGhlIGFib3ZlIHN0ZXBzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHBocmFzZSAtIFRoZSB1c2VyIGlucHV0LlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudFR5cGVDYXN0ZXIgPSAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IGFueTtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGZvciBwcm9jZXNzaW5nIHNvbWUgdmFsdWUgdG8gdXNlIGFzIGFuIGFyZ3VtZW50LlxuICogVGhpcyBpcyBtYWlubHkgdXNlZCBpbiBjb21wb3NpbmcgYXJndW1lbnQgdHlwZXMuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gdmFsdWUgLSBTb21lIHZhbHVlLlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudFR5cGVDYXN0ZXJfID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIHZhbHVlOiBhbnkpID0+IGFueTtcblxuLyoqXG4gKiBEYXRhIHBhc3NlZCB0byBmdW5jdGlvbnMgdGhhdCBydW4gd2hlbiB0aGluZ3MgZmFpbGVkLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZhaWx1cmVEYXRhIHtcblx0LyoqIFRoZSBpbnB1dCBwaHJhc2UgdGhhdCBmYWlsZWQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZy4gKi9cblx0cGhyYXNlOiBzdHJpbmc7XG5cblx0LyoqIFRoZSB2YWx1ZSB0aGF0IGZhaWxlZCBpZiB0aGVyZSB3YXMgb25lLCBvdGhlcndpc2UgbnVsbC4gKi9cblx0ZmFpbHVyZTogdm9pZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pO1xufVxuXG4vKipcbiAqIERlZmF1bHRzIGZvciBhcmd1bWVudCBvcHRpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRBcmd1bWVudE9wdGlvbnMge1xuXHQvKiogRGVmYXVsdCBwcm9tcHQgb3B0aW9ucy4gKi9cblx0cHJvbXB0PzogQXJndW1lbnRQcm9tcHRPcHRpb25zO1xuXG5cdC8qKiBEZWZhdWx0IHRleHQgc2VudCBpZiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLiAqL1xuXHRvdGhlcndpc2U/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgT3RoZXJ3aXNlQ29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgb3RoZXJ3aXNlIGNvbnRlbnQuICovXG5cdG1vZGlmeU90aGVyd2lzZT86IE90aGVyd2lzZUNvbnRlbnRNb2RpZmllcjtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBnZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgdGhlIGFyZ3VtZW50LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIERlZmF1bHRWYWx1ZVN1cHBsaWVyID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIGRhdGE6IEZhaWx1cmVEYXRhKSA9PiBhbnk7XG5cbi8qKlxuICogQSBmdW5jdGlvbiBmb3IgdmFsaWRhdGluZyBwYXJzZWQgYXJndW1lbnRzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHBocmFzZSAtIFRoZSB1c2VyIGlucHV0LlxuICogQHBhcmFtIHZhbHVlIC0gVGhlIHBhcnNlZCB2YWx1ZS5cbiAqL1xuZXhwb3J0IHR5cGUgUGFyc2VkVmFsdWVQcmVkaWNhdGUgPSAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IGJvb2xlYW47XG5cbi8qKlxuICogQSBmdW5jdGlvbiBtb2RpZnlpbmcgYSBwcm9tcHQgdGV4dC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBtb2RpZnkuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgT3RoZXJ3aXNlQ29udGVudE1vZGlmaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHR0ZXh0OiBzdHJpbmcsXG5cdGRhdGE6IEZhaWx1cmVEYXRhXG4pID0+IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRoZSBjb250ZW50IGlmIGFyZ3VtZW50IHBhcnNpbmcgZmFpbHMuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgT3RoZXJ3aXNlQ29udGVudFN1cHBsaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRkYXRhOiBGYWlsdXJlRGF0YVxuKSA9PiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIG1vZGlmeWluZyBhIHByb21wdCB0ZXh0LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHRleHQgLSBUZXh0IGZyb20gdGhlIHByb21wdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgUHJvbXB0Q29udGVudE1vZGlmaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHR0ZXh0OiBzdHJpbmcsXG5cdGRhdGE6IEFyZ3VtZW50UHJvbXB0RGF0YVxuKSA9PiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHJldHVybmluZyB0ZXh0IGZvciB0aGUgcHJvbXB0LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIFByb21wdENvbnRlbnRTdXBwbGllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0ZGF0YTogQXJndW1lbnRQcm9tcHREYXRhXG4pID0+IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuIl19