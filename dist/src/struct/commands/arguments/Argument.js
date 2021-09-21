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
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                if (values?.length < limit)
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
                    failure: failure
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHVEQUF5RTtBQUN6RSw4REFBc0M7QUFJdEMsbURBQTJCO0FBRzNCOzs7O0dBSUc7QUFDSCxNQUFxQixRQUFRO0lBQzVCLFlBQ0MsT0FBZ0IsRUFDaEIsRUFDQyxLQUFLLEdBQUcsMkJBQWUsQ0FBQyxNQUFNLEVBQzlCLElBQUksR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFDM0IsSUFBSSxHQUFHLElBQUssRUFDWixhQUFhLEdBQUcsS0FBSyxFQUNyQixLQUFLLEdBQUcsSUFBSyxFQUNiLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLEtBQUssR0FBRyxRQUFRLEVBQ2hCLE1BQU0sR0FBRyxJQUFLLEVBQ2QsT0FBTyxFQUFFLFlBQVksR0FBRyxJQUFJLEVBQzVCLFNBQVMsR0FBRyxJQUFLLEVBQ2pCLGVBQWUsR0FBRyxJQUFLLEtBQ0gsRUFBRTtRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2hFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBTSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxZQUFZLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFDM0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLFNBQVMsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVUsQ0FBQztRQUNyRixJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWdCLENBQUM7SUFDekMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBSSxNQUFNO1FBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPLENBQVU7SUFFeEI7O09BRUc7SUFDSSxPQUFPLENBQTZCO0lBRTNDOztPQUVHO0lBQ0ksV0FBVyxDQUFlO0lBRWpDOztPQUVHO0lBQ0ksSUFBSSxDQUE0QjtJQUV2Qzs7T0FFRztJQUNILElBQUksT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDN0IsQ0FBQztJQUVEOztPQUVHO0lBQ0ksS0FBSyxDQUFVO0lBRXRCOztPQUVHO0lBQ0ksS0FBSyxDQUFTO0lBRXJCOztPQUVHO0lBQ0ksS0FBSyxDQUFnQjtJQUU1Qjs7T0FFRztJQUNJLGVBQWUsQ0FBMkI7SUFFakQ7O09BRUc7SUFDSSxhQUFhLENBQVU7SUFFOUI7O09BRUc7SUFDSSxTQUFTLENBQXVFO0lBRXZGOztPQUVHO0lBQ0ksTUFBTSxDQUFtQztJQUVoRDs7T0FFRztJQUNJLElBQUksQ0FBb0M7SUFFL0M7O09BRUc7SUFDSSxTQUFTLENBQThCO0lBRTlDOzs7O09BSUc7SUFDSSxJQUFJLENBQUMsT0FBZ0IsRUFBRSxNQUFjO1FBQzNDLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCLEVBQUUsZUFBdUIsRUFBRSxFQUFFLGNBQW1CLElBQUk7UUFDeEYsTUFBTSxhQUFhLEdBQVEsRUFBRSxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRSxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRWhELE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLDJCQUFlLENBQUMsUUFBUSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDeEcsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFdEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUNwQixVQUFrQixFQUNsQixRQUFhLEVBQ2IsVUFBZSxFQUNmLFlBQWlDLEVBQ2pDLFdBQStCLEVBQy9CLFdBQW1CLEVBQ2xCLEVBQUU7WUFDSCxJQUFJLElBQUksR0FBRyxNQUFNLGNBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7Z0JBQ2hFLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixRQUFRLEVBQUUsVUFBVTtnQkFDcEIsT0FBTyxFQUFFLFlBQVk7Z0JBQ3JCLE1BQU0sRUFBRSxXQUFXO2dCQUNuQixPQUFPLEVBQUUsV0FBVzthQUNwQixDQUFDLENBQUM7WUFFSCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZCO1lBRUQsTUFBTSxRQUFRLEdBQUc7Z0JBQ2hCLEtBQUssRUFBRSxhQUFhLENBQUMsV0FBVztnQkFDaEMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxXQUFXO2dCQUNoQyxPQUFPLEVBQUUsYUFBYSxDQUFDLGFBQWE7Z0JBQ3BDLEtBQUssRUFBRSxhQUFhLENBQUMsV0FBVztnQkFDaEMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxZQUFZO2FBQ2xDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFZCxJQUFJLFFBQVEsRUFBRTtnQkFDYixJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO29CQUMvQyxPQUFPLEVBQUUsVUFBVTtvQkFDbkIsUUFBUSxFQUFFLFVBQVU7b0JBQ3BCLE9BQU8sRUFBRSxZQUFZO29CQUNyQixNQUFNLEVBQUUsV0FBVztvQkFDbkIsT0FBTyxFQUFFLFdBQVc7aUJBQ3BCLENBQUMsQ0FBQztnQkFFSCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN2QjthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUM7UUFFRixzQ0FBc0M7UUFDdEMsTUFBTSxTQUFTLEdBQUcsS0FBSyxFQUN0QixXQUFnQyxFQUNoQyxTQUE2QixFQUM3QixVQUFlLEVBQ2YsVUFBa0IsRUFDSCxFQUFFO1lBQ2pCLElBQUksU0FBUyxDQUFDO1lBQ2QsMkZBQTJGO1lBQzNGLElBQUksVUFBVSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUU7Z0JBQ3ZELE1BQU0sVUFBVSxHQUFHLFVBQVUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO2dCQUN4RCxNQUFNLFFBQVEsR0FBRyxVQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO2dCQUM5RSxNQUFNLFNBQVMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVcsQ0FBQyxDQUFDO2dCQUV2RyxJQUFJLFNBQVMsRUFBRTtvQkFDZCxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDcEUsSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLFNBQVMsRUFBRTt3QkFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDbkM7aUJBQ0Q7YUFDRDtZQUVELElBQUksS0FBYyxDQUFDO1lBQ25CLElBQUk7Z0JBQ0gsS0FBSyxHQUFHLENBQ1AsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztvQkFDbkMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM5QyxHQUFHLEVBQUUsQ0FBQztvQkFDTixJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUk7b0JBQ3hCLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztpQkFDaEIsQ0FBQyxDQUNGLENBQUMsS0FBSyxFQUFHLENBQUM7Z0JBQ1gsSUFBSSxPQUFPLENBQUMsSUFBSTtvQkFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqRDtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLE1BQU0sV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUM1RyxJQUFJLFdBQVcsRUFBRTtvQkFDaEIsTUFBTSxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDNUQsSUFBSSxPQUFPLENBQUMsSUFBSTt3QkFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDdkQ7Z0JBRUQsT0FBTyxjQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDckI7WUFFRCxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUU7Z0JBQzNCLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pELElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxPQUFPO29CQUFFLE9BQU8sY0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM3RDtZQUVELElBQUksS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxhQUFhLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUM1RSxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzlHLElBQUksVUFBVSxFQUFFO29CQUNmLE1BQU0sVUFBVSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzFELElBQUksT0FBTyxDQUFDLElBQUk7d0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ3REO2dCQUVELE9BQU8sY0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3JCO1lBRUQsSUFBSSxVQUFVLElBQUksS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxhQUFhLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUN4RixJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU07b0JBQUUsT0FBTyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbkYsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFELElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDcEMsSUFBSSxVQUFVLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtvQkFDeEMsT0FBTyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDckU7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN6RyxJQUFJLFNBQVMsRUFBRTtvQkFDZCxNQUFNLFNBQVMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN4RCxJQUFJLE9BQU8sQ0FBQyxJQUFJO3dCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUNyRDtnQkFFRCxPQUFPLGNBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNyQjtZQUVELElBQUksVUFBVSxFQUFFO2dCQUNmLE1BQU8sQ0FBQyxJQUFJLENBQUMsV0FBb0IsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDO2dCQUNsQyxrRkFBa0Y7Z0JBQ2xGLElBQUksTUFBTSxFQUFFLE1BQU8sR0FBRyxLQUFLO29CQUFFLE9BQU8sU0FBUyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFdEYsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUVELE9BQU8sV0FBVyxDQUFDO1FBQ3BCLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELE1BQU0sV0FBVyxHQUFHLE1BQU0sU0FBUyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQztRQUM3RixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDaEM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzRCxPQUFPLFdBQVcsQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0IsRUFBRSxNQUFjO1FBQ3BELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7UUFDbEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztRQUNsRCxNQUFNLFFBQVEsR0FBRyxjQUFJLENBQUMsTUFBTSxDQUMzQixPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ3RFLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQ2pELFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQ2pELENBQUM7UUFFRixNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsT0FBbUQsRUFBRSxFQUFFO1lBQ2pGLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUU1RixNQUFNLGVBQWUsR0FBRyxjQUFJLENBQUMsTUFBTSxDQUNsQyxJQUFJLENBQUMsZUFBZSxFQUNwQixXQUFXLENBQUMsZUFBZSxFQUMzQixXQUFXLENBQUMsZUFBZSxDQUMzQixDQUFDO1lBRUYsSUFBSSxJQUFJLEdBQUcsTUFBTSxjQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO2dCQUNqRSxNQUFNO2dCQUNOLE9BQU87YUFDUCxDQUFDLENBQUM7WUFDSCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZCO1lBRUQsSUFBSSxlQUFlLEVBQUU7Z0JBQ3BCLElBQUksR0FBRyxNQUFNLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFjLEVBQUU7b0JBQ2hFLE1BQU07b0JBQ04sT0FBTyxFQUFFLE9BQWdDO2lCQUN6QyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUN4QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdkI7YUFDRDtZQUVELElBQUksSUFBSSxFQUFFO2dCQUNULE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlDLElBQUksT0FBTyxDQUFDLElBQUk7b0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEQ7WUFFRCxPQUFPLGNBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QixDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsTUFBTSxJQUFJLFFBQVEsRUFBRTtZQUN4QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFO2dCQUMzQixPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN6QjtZQUVELE9BQU8sY0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUMvQyxNQUFNO2dCQUNOLE9BQU8sRUFBRSxJQUFJO2FBQ2IsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM1QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFO2dCQUMzQixPQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN4QjtZQUVELElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUU7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzFDO1lBRUQsT0FBTyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxjQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDdkc7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FDdkIsSUFBdUMsRUFDdkMsUUFBc0IsRUFDdEIsT0FBZ0IsRUFDaEIsTUFBYztRQUVkLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN4QixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksRUFBRTtnQkFDekIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUN6QixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7d0JBQzlELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNoQjtpQkFDRDtxQkFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ3hELE9BQU8sS0FBSyxDQUFDO2lCQUNiO2FBQ0Q7WUFFRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDL0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNoQyxJQUFJLGNBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO2dCQUFFLEdBQUcsR0FBRyxNQUFNLEdBQUcsQ0FBQztZQUN6QyxPQUFPLEdBQUcsQ0FBQztTQUNYO1FBRUQsSUFBSSxJQUFJLFlBQVksTUFBTSxFQUFFO1lBQzNCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFFeEIsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBRW5CLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsSUFBSSxPQUFPLENBQUM7Z0JBRVosT0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFO29CQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN0QjthQUNEO1lBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQztTQUMxQjtRQUVELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN4QixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzNELElBQUksY0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7Z0JBQUUsR0FBRyxHQUFHLE1BQU0sR0FBRyxDQUFDO1lBQ3pDLE9BQU8sR0FBRyxDQUFDO1NBQ1g7UUFFRCxPQUFPLE1BQU0sSUFBSSxJQUFJLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBNEM7UUFDcEUsT0FBTyxLQUFLLFVBQVUsTUFBTSxDQUFZLE9BQU8sRUFBRSxNQUFNO1lBQ3RELElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQztZQUNqQixLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssRUFBRTtnQkFDeEIsSUFBSSxPQUFPLEtBQUssS0FBSyxVQUFVO29CQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxRCxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3RFLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7b0JBQUUsT0FBTyxHQUFHLENBQUM7YUFDeEM7WUFFRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsS0FBNEM7UUFDL0UsT0FBTyxLQUFLLFVBQVUsTUFBTSxDQUFZLE9BQU8sRUFBRSxNQUFNO1lBQ3RELElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQztZQUNqQixLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssRUFBRTtnQkFDeEIsSUFBSSxPQUFPLEtBQUssS0FBSyxVQUFVO29CQUFFLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMxRCxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDdEU7WUFFRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQVU7UUFDakMsT0FBTyxLQUFLLElBQUksSUFBSSxJQUFJLGNBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQTRDO1FBQ3BFLE9BQU8sS0FBSyxVQUFVLE1BQU0sQ0FBWSxPQUFPLEVBQUUsTUFBTTtZQUN0RCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDbkIsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEVBQUU7Z0JBQ3hCLElBQUksT0FBTyxLQUFLLEtBQUssVUFBVTtvQkFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9FLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7b0JBQUUsT0FBTyxHQUFHLENBQUM7Z0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDbEI7WUFFRCxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FDbEIsSUFBdUMsRUFDdkMsR0FBVyxFQUNYLEdBQVcsRUFDWCxTQUFTLEdBQUcsS0FBSztRQUVqQixPQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxNQUFNLENBQUMsR0FDTixPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWhILE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUF1QyxFQUFFLE1BQVcsSUFBSTtRQUM1RSxPQUFPLEtBQUssVUFBVSxNQUFNLENBQVksT0FBTyxFQUFFLE1BQU07WUFDdEQsSUFBSSxPQUFPLElBQUksS0FBSyxVQUFVO2dCQUFFLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzlFLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsT0FBTyxjQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEtBQTRDO1FBQ3hFLE9BQU8sS0FBSyxVQUFVLE1BQU0sQ0FBWSxPQUFPLEVBQUUsTUFBTTtZQUN0RCxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssRUFBRTtnQkFDeEIsS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9CLE1BQU0sR0FBRyxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7b0JBQUUsT0FBTyxHQUFHLENBQUM7YUFDekM7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBdUMsRUFBRSxNQUFXLElBQUk7UUFDckYsT0FBTyxLQUFLLFVBQVUsTUFBTSxDQUFZLE9BQU8sRUFBRSxNQUFNO1lBQ3RELElBQUksT0FBTyxJQUFJLEtBQUssVUFBVTtnQkFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2RCxNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RSxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLE9BQU8sY0FBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ3JEO1lBRUQsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUMzQyxDQUFDLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUE0QztRQUNsRSxPQUFPLEtBQUssVUFBVSxNQUFNLENBQVksT0FBTyxFQUFFLE1BQU07WUFDdEQsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEVBQUU7Z0JBQ3hCLElBQUksT0FBTyxLQUFLLEtBQUssVUFBVTtvQkFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztvQkFBRSxPQUFPLEdBQUcsQ0FBQzthQUN6QztZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUF1QyxFQUFFLFNBQStCO1FBQzlGLE9BQU8sS0FBSyxVQUFVLE1BQU0sQ0FBWSxPQUFPLEVBQUUsTUFBTTtZQUN0RCxJQUFJLE9BQU8sSUFBSSxLQUFLLFVBQVU7Z0JBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkQsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDOUUsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztnQkFBRSxPQUFPLEdBQUcsQ0FBQztZQUN4QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDN0QsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBdUM7UUFDOUQsT0FBTyxLQUFLLFVBQVUsTUFBTSxDQUFZLE9BQU8sRUFBRSxNQUFNO1lBQ3RELElBQUksT0FBTyxJQUFJLEtBQUssVUFBVTtnQkFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2RCxNQUFNLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RSxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLE9BQU8sY0FBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDaEQ7WUFFRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDdEMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztDQUNEO0FBM2xCRCwyQkEybEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWVzc2FnZSwgTWVzc2FnZU9wdGlvbnMsIE1lc3NhZ2VQYXlsb2FkIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IEFyZ3VtZW50TWF0Y2hlcywgQXJndW1lbnRUeXBlcyB9IGZyb20gXCIuLi8uLi8uLi91dGlsL0NvbnN0YW50c1wiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFwiO1xuaW1wb3J0IENvbW1hbmRIYW5kbGVyIGZyb20gXCIuLi9Db21tYW5kSGFuZGxlclwiO1xuaW1wb3J0IEZsYWcgZnJvbSBcIi4uL0ZsYWdcIjtcbmltcG9ydCBUeXBlUmVzb2x2ZXIgZnJvbSBcIi4vVHlwZVJlc29sdmVyXCI7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBhcmd1bWVudCBmb3IgYSBjb21tYW5kLlxuICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIG9mIHRoZSBhcmd1bWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGFyZ3VtZW50LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmd1bWVudCB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdHtcblx0XHRcdG1hdGNoID0gQXJndW1lbnRNYXRjaGVzLlBIUkFTRSxcblx0XHRcdHR5cGUgPSBBcmd1bWVudFR5cGVzLlNUUklORyxcblx0XHRcdGZsYWcgPSBudWxsISxcblx0XHRcdG11bHRpcGxlRmxhZ3MgPSBmYWxzZSxcblx0XHRcdGluZGV4ID0gbnVsbCEsXG5cdFx0XHR1bm9yZGVyZWQgPSBmYWxzZSxcblx0XHRcdGxpbWl0ID0gSW5maW5pdHksXG5cdFx0XHRwcm9tcHQgPSBudWxsISxcblx0XHRcdGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZSA9IG51bGwsXG5cdFx0XHRvdGhlcndpc2UgPSBudWxsISxcblx0XHRcdG1vZGlmeU90aGVyd2lzZSA9IG51bGwhXG5cdFx0fTogQXJndW1lbnRPcHRpb25zID0ge31cblx0KSB7XG5cdFx0dGhpcy5jb21tYW5kID0gY29tbWFuZDtcblx0XHR0aGlzLm1hdGNoID0gbWF0Y2g7XG5cdFx0dGhpcy50eXBlID0gdHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIiA/IHR5cGUuYmluZCh0aGlzKSA6IHR5cGU7XG5cdFx0dGhpcy5mbGFnID0gZmxhZztcblx0XHR0aGlzLm11bHRpcGxlRmxhZ3MgPSBtdWx0aXBsZUZsYWdzO1xuXHRcdHRoaXMuaW5kZXggPSBpbmRleCE7XG5cdFx0dGhpcy51bm9yZGVyZWQgPSB1bm9yZGVyZWQ7XG5cdFx0dGhpcy5saW1pdCA9IGxpbWl0O1xuXHRcdHRoaXMucHJvbXB0ID0gcHJvbXB0ITtcblx0XHR0aGlzLmRlZmF1bHQgPSB0eXBlb2YgZGVmYXVsdFZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBkZWZhdWx0VmFsdWUuYmluZCh0aGlzKSA6IGRlZmF1bHRWYWx1ZTtcblx0XHR0aGlzLm90aGVyd2lzZSA9IHR5cGVvZiBvdGhlcndpc2UgPT09IFwiZnVuY3Rpb25cIiA/IG90aGVyd2lzZS5iaW5kKHRoaXMpIDogb3RoZXJ3aXNlITtcblx0XHR0aGlzLm1vZGlmeU90aGVyd2lzZSA9IG1vZGlmeU90aGVyd2lzZSE7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNsaWVudC5cblx0ICovXG5cdGdldCBjbGllbnQoKTogQWthaXJvQ2xpZW50IHtcblx0XHRyZXR1cm4gdGhpcy5jb21tYW5kLmNsaWVudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCB0aGlzIGFyZ3VtZW50IGJlbG9uZ3MgdG8uXG5cdCAqL1xuXHRwdWJsaWMgY29tbWFuZDogQ29tbWFuZDtcblxuXHQvKipcblx0ICogVGhlIGRlZmF1bHQgdmFsdWUgb2YgdGhlIGFyZ3VtZW50IG9yIGEgZnVuY3Rpb24gc3VwcGx5aW5nIHRoZSBkZWZhdWx0IHZhbHVlLlxuXHQgKi9cblx0cHVibGljIGRlZmF1bHQ6IERlZmF1bHRWYWx1ZVN1cHBsaWVyIHwgYW55O1xuXG5cdC8qKlxuXHQgKiAgRGVzY3JpcHRpb24gb2YgdGhlIGNvbW1hbmQuXG5cdCAqL1xuXHRwdWJsaWMgZGVzY3JpcHRpb246IHN0cmluZyB8IGFueTtcblxuXHQvKipcblx0ICogVGhlIHN0cmluZyhzKSB0byB1c2UgZm9yIGZsYWcgb3Igb3B0aW9uIG1hdGNoLlxuXHQgKi9cblx0cHVibGljIGZsYWc/OiBzdHJpbmcgfCBzdHJpbmdbXSB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIGhhbmRsZXIuXG5cdCAqL1xuXHRnZXQgaGFuZGxlcigpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tbWFuZC5oYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpbmRleCB0byBzdGFydCBmcm9tLlxuXHQgKi9cblx0cHVibGljIGluZGV4PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHBocmFzZXMgdG8gbWF0Y2ggZm9yIHJlc3QsIHNlcGFyYXRlLCBjb250ZW50LCBvciB0ZXh0IG1hdGNoLlxuXHQgKi9cblx0cHVibGljIGxpbWl0OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdG8gbWF0Y2ggdGV4dC5cblx0ICovXG5cdHB1YmxpYyBtYXRjaDogQXJndW1lbnRNYXRjaDtcblxuXHQvKipcblx0ICogRnVuY3Rpb24gdG8gbW9kaWZ5IG90aGVyd2lzZSBjb250ZW50LlxuXHQgKi9cblx0cHVibGljIG1vZGlmeU90aGVyd2lzZTogT3RoZXJ3aXNlQ29udGVudE1vZGlmaWVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRvIHByb2Nlc3MgbXVsdGlwbGUgb3B0aW9uIGZsYWdzIGluc3RlYWQgb2YganVzdCB0aGUgZmlyc3QuXG5cdCAqL1xuXHRwdWJsaWMgbXVsdGlwbGVGbGFnczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIGNvbnRlbnQgb3IgZnVuY3Rpb24gc3VwcGx5aW5nIHRoZSBjb250ZW50IHNlbnQgd2hlbiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLlxuXHQgKi9cblx0cHVibGljIG90aGVyd2lzZT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBPdGhlcndpc2VDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBwcm9tcHQgb3B0aW9ucy5cblx0ICovXG5cdHB1YmxpYyBwcm9tcHQ/OiBBcmd1bWVudFByb21wdE9wdGlvbnMgfCBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgdHlwZSB0byBjYXN0IHRvIG9yIGEgZnVuY3Rpb24gdG8gdXNlIHRvIGNhc3QuXG5cdCAqL1xuXHRwdWJsaWMgdHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgYXJndW1lbnQgaXMgdW5vcmRlcmVkLlxuXHQgKi9cblx0cHVibGljIHVub3JkZXJlZDogYm9vbGVhbiB8IG51bWJlciB8IG51bWJlcltdO1xuXG5cdC8qKlxuXHQgKiBDYXN0cyBhIHBocmFzZSB0byB0aGlzIGFyZ3VtZW50J3MgdHlwZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGhyYXNlIC0gUGhyYXNlIHRvIHByb2Nlc3MuXG5cdCAqL1xuXHRwdWJsaWMgY2FzdChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG5cdFx0cmV0dXJuIEFyZ3VtZW50LmNhc3QodGhpcy50eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29sbGVjdHMgaW5wdXQgZnJvbSB0aGUgdXNlciBieSBwcm9tcHRpbmcuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBwcm9tcHQuXG5cdCAqIEBwYXJhbSBjb21tYW5kSW5wdXQgLSBQcmV2aW91cyBpbnB1dCBmcm9tIGNvbW1hbmQgaWYgdGhlcmUgd2FzIG9uZS5cblx0ICogQHBhcmFtIHBhcnNlZElucHV0IC0gUHJldmlvdXMgcGFyc2VkIGlucHV0IGZyb20gY29tbWFuZCBpZiB0aGVyZSB3YXMgb25lLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGNvbGxlY3QobWVzc2FnZTogTWVzc2FnZSwgY29tbWFuZElucHV0OiBzdHJpbmcgPSBcIlwiLCBwYXJzZWRJbnB1dDogYW55ID0gbnVsbCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IHByb21wdE9wdGlvbnM6IGFueSA9IHt9O1xuXHRcdE9iamVjdC5hc3NpZ24ocHJvbXB0T3B0aW9ucywgdGhpcy5oYW5kbGVyLmFyZ3VtZW50RGVmYXVsdHMucHJvbXB0KTtcblx0XHRPYmplY3QuYXNzaWduKHByb21wdE9wdGlvbnMsIHRoaXMuY29tbWFuZC5hcmd1bWVudERlZmF1bHRzLnByb21wdCk7XG5cdFx0T2JqZWN0LmFzc2lnbihwcm9tcHRPcHRpb25zLCB0aGlzLnByb21wdCB8fCB7fSk7XG5cblx0XHRjb25zdCBpc0luZmluaXRlID0gcHJvbXB0T3B0aW9ucy5pbmZpbml0ZSB8fCAodGhpcy5tYXRjaCA9PT0gQXJndW1lbnRNYXRjaGVzLlNFUEFSQVRFICYmICFjb21tYW5kSW5wdXQpO1xuXHRcdGNvbnN0IGFkZGl0aW9uYWxSZXRyeSA9IE51bWJlcihCb29sZWFuKGNvbW1hbmRJbnB1dCkpO1xuXHRcdGNvbnN0IHZhbHVlcyA9IGlzSW5maW5pdGUgPyBbXSA6IG51bGw7XG5cblx0XHRjb25zdCBnZXRUZXh0ID0gYXN5bmMgKFxuXHRcdFx0cHJvbXB0VHlwZTogc3RyaW5nLFxuXHRcdFx0cHJvbXB0ZXI6IGFueSxcblx0XHRcdHJldHJ5Q291bnQ6IGFueSxcblx0XHRcdGlucHV0TWVzc2FnZTogTWVzc2FnZSB8IHVuZGVmaW5lZCxcblx0XHRcdGlucHV0UGhyYXNlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0XHRpbnB1dFBhcnNlZDogc3RyaW5nXG5cdFx0KSA9PiB7XG5cdFx0XHRsZXQgdGV4dCA9IGF3YWl0IFV0aWwuaW50b0NhbGxhYmxlKHByb21wdGVyKS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHtcblx0XHRcdFx0cmV0cmllczogcmV0cnlDb3VudCxcblx0XHRcdFx0aW5maW5pdGU6IGlzSW5maW5pdGUsXG5cdFx0XHRcdG1lc3NhZ2U6IGlucHV0TWVzc2FnZSxcblx0XHRcdFx0cGhyYXNlOiBpbnB1dFBocmFzZSxcblx0XHRcdFx0ZmFpbHVyZTogaW5wdXRQYXJzZWRcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0ZXh0KSkge1xuXHRcdFx0XHR0ZXh0ID0gdGV4dC5qb2luKFwiXFxuXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBtb2RpZmllciA9IHtcblx0XHRcdFx0c3RhcnQ6IHByb21wdE9wdGlvbnMubW9kaWZ5U3RhcnQsXG5cdFx0XHRcdHJldHJ5OiBwcm9tcHRPcHRpb25zLm1vZGlmeVJldHJ5LFxuXHRcdFx0XHR0aW1lb3V0OiBwcm9tcHRPcHRpb25zLm1vZGlmeVRpbWVvdXQsXG5cdFx0XHRcdGVuZGVkOiBwcm9tcHRPcHRpb25zLm1vZGlmeUVuZGVkLFxuXHRcdFx0XHRjYW5jZWw6IHByb21wdE9wdGlvbnMubW9kaWZ5Q2FuY2VsXG5cdFx0XHR9W3Byb21wdFR5cGVdO1xuXG5cdFx0XHRpZiAobW9kaWZpZXIpIHtcblx0XHRcdFx0dGV4dCA9IGF3YWl0IG1vZGlmaWVyLmNhbGwodGhpcywgbWVzc2FnZSwgdGV4dCwge1xuXHRcdFx0XHRcdHJldHJpZXM6IHJldHJ5Q291bnQsXG5cdFx0XHRcdFx0aW5maW5pdGU6IGlzSW5maW5pdGUsXG5cdFx0XHRcdFx0bWVzc2FnZTogaW5wdXRNZXNzYWdlLFxuXHRcdFx0XHRcdHBocmFzZTogaW5wdXRQaHJhc2UsXG5cdFx0XHRcdFx0ZmFpbHVyZTogaW5wdXRQYXJzZWRcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGV4dCkpIHtcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5qb2luKFwiXFxuXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdH07XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuXHRcdGNvbnN0IHByb21wdE9uZSA9IGFzeW5jIChcblx0XHRcdHByZXZNZXNzYWdlOiBNZXNzYWdlIHwgdW5kZWZpbmVkLFxuXHRcdFx0cHJldklucHV0OiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0XHRwcmV2UGFyc2VkOiBhbnksXG5cdFx0XHRyZXRyeUNvdW50OiBudW1iZXJcblx0XHQpOiBQcm9taXNlPGFueT4gPT4ge1xuXHRcdFx0bGV0IHNlbnRTdGFydDtcblx0XHRcdC8vIFRoaXMgaXMgZWl0aGVyIGEgcmV0cnkgcHJvbXB0LCB0aGUgc3RhcnQgb2YgYSBub24taW5maW5pdGUsIG9yIHRoZSBzdGFydCBvZiBhbiBpbmZpbml0ZS5cblx0XHRcdGlmIChyZXRyeUNvdW50ICE9PSAxIHx8ICFpc0luZmluaXRlIHx8ICF2YWx1ZXM/Lmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCBwcm9tcHRUeXBlID0gcmV0cnlDb3VudCA9PT0gMSA/IFwic3RhcnRcIiA6IFwicmV0cnlcIjtcblx0XHRcdFx0Y29uc3QgcHJvbXB0ZXIgPSByZXRyeUNvdW50ID09PSAxID8gcHJvbXB0T3B0aW9ucy5zdGFydCA6IHByb21wdE9wdGlvbnMucmV0cnk7XG5cdFx0XHRcdGNvbnN0IHN0YXJ0VGV4dCA9IGF3YWl0IGdldFRleHQocHJvbXB0VHlwZSwgcHJvbXB0ZXIsIHJldHJ5Q291bnQsIHByZXZNZXNzYWdlLCBwcmV2SW5wdXQsIHByZXZQYXJzZWQhKTtcblxuXHRcdFx0XHRpZiAoc3RhcnRUZXh0KSB7XG5cdFx0XHRcdFx0c2VudFN0YXJ0ID0gYXdhaXQgKG1lc3NhZ2UudXRpbCB8fCBtZXNzYWdlLmNoYW5uZWwpLnNlbmQoc3RhcnRUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsICYmIHNlbnRTdGFydCkge1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsLnNldEVkaXRhYmxlKGZhbHNlKTtcblx0XHRcdFx0XHRcdG1lc3NhZ2UudXRpbC5zZXRMYXN0UmVzcG9uc2Uoc2VudFN0YXJ0KTtcblx0XHRcdFx0XHRcdG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRTdGFydCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBpbnB1dDogTWVzc2FnZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlucHV0ID0gKFxuXHRcdFx0XHRcdGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5hd2FpdE1lc3NhZ2VzKHtcblx0XHRcdFx0XHRcdGZpbHRlcjogbSA9PiBtLmF1dGhvci5pZCA9PT0gbWVzc2FnZS5hdXRob3IuaWQsXG5cdFx0XHRcdFx0XHRtYXg6IDEsXG5cdFx0XHRcdFx0XHR0aW1lOiBwcm9tcHRPcHRpb25zLnRpbWUsXG5cdFx0XHRcdFx0XHRlcnJvcnM6IFtcInRpbWVcIl1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpLmZpcnN0KCkhO1xuXHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShpbnB1dCk7XG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0Y29uc3QgdGltZW91dFRleHQgPSBhd2FpdCBnZXRUZXh0KFwidGltZW91dFwiLCBwcm9tcHRPcHRpb25zLnRpbWVvdXQsIHJldHJ5Q291bnQsIHByZXZNZXNzYWdlLCBwcmV2SW5wdXQsIFwiXCIpO1xuXHRcdFx0XHRpZiAodGltZW91dFRleHQpIHtcblx0XHRcdFx0XHRjb25zdCBzZW50VGltZW91dCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHRpbWVvdXRUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50VGltZW91dCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gRmxhZy5jYW5jZWwoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHByb21wdE9wdGlvbnMuYnJlYWtvdXQpIHtcblx0XHRcdFx0Y29uc3QgbG9va3NMaWtlID0gYXdhaXQgdGhpcy5oYW5kbGVyLnBhcnNlQ29tbWFuZChpbnB1dCk7XG5cdFx0XHRcdGlmIChsb29rc0xpa2UgJiYgbG9va3NMaWtlLmNvbW1hbmQpIHJldHVybiBGbGFnLnJldHJ5KGlucHV0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGlucHV0Py5jb250ZW50LnRvTG93ZXJDYXNlKCkgPT09IHByb21wdE9wdGlvbnMuY2FuY2VsV29yZC50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdGNvbnN0IGNhbmNlbFRleHQgPSBhd2FpdCBnZXRUZXh0KFwiY2FuY2VsXCIsIHByb21wdE9wdGlvbnMuY2FuY2VsLCByZXRyeUNvdW50LCBpbnB1dCwgaW5wdXQ/LmNvbnRlbnQsIFwiY2FuY2VsXCIpO1xuXHRcdFx0XHRpZiAoY2FuY2VsVGV4dCkge1xuXHRcdFx0XHRcdGNvbnN0IHNlbnRDYW5jZWwgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZChjYW5jZWxUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50Q2FuY2VsKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaXNJbmZpbml0ZSAmJiBpbnB1dD8uY29udGVudC50b0xvd2VyQ2FzZSgpID09PSBwcm9tcHRPcHRpb25zLnN0b3BXb3JkLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0aWYgKCF2YWx1ZXM/Lmxlbmd0aCkgcmV0dXJuIHByb21wdE9uZShpbnB1dCwgaW5wdXQ/LmNvbnRlbnQsIG51bGwsIHJldHJ5Q291bnQgKyAxKTtcblx0XHRcdFx0cmV0dXJuIHZhbHVlcztcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcGFyc2VkVmFsdWUgPSBhd2FpdCB0aGlzLmNhc3QoaW5wdXQsIGlucHV0LmNvbnRlbnQpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShwYXJzZWRWYWx1ZSkpIHtcblx0XHRcdFx0aWYgKHJldHJ5Q291bnQgPD0gcHJvbXB0T3B0aW9ucy5yZXRyaWVzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHByb21wdE9uZShpbnB1dCwgaW5wdXQ/LmNvbnRlbnQsIHBhcnNlZFZhbHVlLCByZXRyeUNvdW50ICsgMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBlbmRlZFRleHQgPSBhd2FpdCBnZXRUZXh0KFwiZW5kZWRcIiwgcHJvbXB0T3B0aW9ucy5lbmRlZCwgcmV0cnlDb3VudCwgaW5wdXQsIGlucHV0Py5jb250ZW50LCBcInN0b3BcIik7XG5cdFx0XHRcdGlmIChlbmRlZFRleHQpIHtcblx0XHRcdFx0XHRjb25zdCBzZW50RW5kZWQgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZChlbmRlZFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRFbmRlZCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gRmxhZy5jYW5jZWwoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGlzSW5maW5pdGUpIHtcblx0XHRcdFx0dmFsdWVzIS5wdXNoKHBhcnNlZFZhbHVlIGFzIG5ldmVyKTtcblx0XHRcdFx0Y29uc3QgbGltaXQgPSBwcm9tcHRPcHRpb25zLmxpbWl0O1xuXHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGVkLW9wdGlvbmFsLWNoYWluXG5cdFx0XHRcdGlmICh2YWx1ZXM/Lmxlbmd0aCEgPCBsaW1pdCkgcmV0dXJuIHByb21wdE9uZShtZXNzYWdlLCBpbnB1dC5jb250ZW50LCBwYXJzZWRWYWx1ZSwgMSk7XG5cblx0XHRcdFx0cmV0dXJuIHZhbHVlcztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHBhcnNlZFZhbHVlO1xuXHRcdH07XG5cblx0XHR0aGlzLmhhbmRsZXIuYWRkUHJvbXB0KG1lc3NhZ2UuY2hhbm5lbCwgbWVzc2FnZS5hdXRob3IpO1xuXHRcdGNvbnN0IHJldHVyblZhbHVlID0gYXdhaXQgcHJvbXB0T25lKG1lc3NhZ2UsIGNvbW1hbmRJbnB1dCwgcGFyc2VkSW5wdXQsIDEgKyBhZGRpdGlvbmFsUmV0cnkpO1xuXHRcdGlmICh0aGlzLmhhbmRsZXIuY29tbWFuZFV0aWwgJiYgbWVzc2FnZS51dGlsKSB7XG5cdFx0XHRtZXNzYWdlLnV0aWwuc2V0RWRpdGFibGUoZmFsc2UpO1xuXHRcdH1cblxuXHRcdHRoaXMuaGFuZGxlci5yZW1vdmVQcm9tcHQobWVzc2FnZS5jaGFubmVsLCBtZXNzYWdlLmF1dGhvcik7XG5cdFx0cmV0dXJuIHJldHVyblZhbHVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb2Nlc3NlcyB0aGUgdHlwZSBjYXN0aW5nIGFuZCBwcm9tcHRpbmcgb2YgdGhlIGFyZ3VtZW50IGZvciBhIHBocmFzZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBocmFzZSAtIFRoZSBwaHJhc2UgdG8gcHJvY2Vzcy5cblx0ICovXG5cdHB1YmxpYyBhc3luYyBwcm9jZXNzKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgY29tbWFuZERlZnMgPSB0aGlzLmNvbW1hbmQuYXJndW1lbnREZWZhdWx0cztcblx0XHRjb25zdCBoYW5kbGVyRGVmcyA9IHRoaXMuaGFuZGxlci5hcmd1bWVudERlZmF1bHRzO1xuXHRcdGNvbnN0IG9wdGlvbmFsID0gVXRpbC5jaG9pY2UoXG5cdFx0XHR0eXBlb2YgdGhpcy5wcm9tcHQgPT09IFwib2JqZWN0XCIgJiYgdGhpcy5wcm9tcHQgJiYgdGhpcy5wcm9tcHQub3B0aW9uYWwsXG5cdFx0XHRjb21tYW5kRGVmcy5wcm9tcHQgJiYgY29tbWFuZERlZnMucHJvbXB0Lm9wdGlvbmFsLFxuXHRcdFx0aGFuZGxlckRlZnMucHJvbXB0ICYmIGhhbmRsZXJEZWZzLnByb21wdC5vcHRpb25hbFxuXHRcdCk7XG5cblx0XHRjb25zdCBkb090aGVyd2lzZSA9IGFzeW5jIChmYWlsdXJlOiAoRmxhZyAmIHsgdmFsdWU6IGFueSB9KSB8IG51bGwgfCB1bmRlZmluZWQpID0+IHtcblx0XHRcdGNvbnN0IG90aGVyd2lzZSA9IFV0aWwuY2hvaWNlKHRoaXMub3RoZXJ3aXNlLCBjb21tYW5kRGVmcy5vdGhlcndpc2UsIGhhbmRsZXJEZWZzLm90aGVyd2lzZSk7XG5cblx0XHRcdGNvbnN0IG1vZGlmeU90aGVyd2lzZSA9IFV0aWwuY2hvaWNlKFxuXHRcdFx0XHR0aGlzLm1vZGlmeU90aGVyd2lzZSxcblx0XHRcdFx0Y29tbWFuZERlZnMubW9kaWZ5T3RoZXJ3aXNlLFxuXHRcdFx0XHRoYW5kbGVyRGVmcy5tb2RpZnlPdGhlcndpc2Vcblx0XHRcdCk7XG5cblx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUob3RoZXJ3aXNlKS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHtcblx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlXG5cdFx0XHR9KTtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtb2RpZnlPdGhlcndpc2UpIHtcblx0XHRcdFx0dGV4dCA9IGF3YWl0IG1vZGlmeU90aGVyd2lzZS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHRleHQgYXMgc3RyaW5nLCB7XG5cdFx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRcdGZhaWx1cmU6IGZhaWx1cmUgYXMgRmxhZyAmIHsgdmFsdWU6IGFueSB9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0ZXh0KSkge1xuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRleHQpIHtcblx0XHRcdFx0Y29uc3Qgc2VudCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHRleHQpO1xuXHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0fTtcblxuXHRcdGlmICghcGhyYXNlICYmIG9wdGlvbmFsKSB7XG5cdFx0XHRpZiAodGhpcy5vdGhlcndpc2UgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gZG9PdGhlcndpc2UobnVsbCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBVdGlsLmludG9DYWxsYWJsZSh0aGlzLmRlZmF1bHQpKG1lc3NhZ2UsIHtcblx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlOiBudWxsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRjb25zdCByZXMgPSBhd2FpdCB0aGlzLmNhc3QobWVzc2FnZSwgcGhyYXNlKTtcblx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdGlmICh0aGlzLm90aGVyd2lzZSAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBkb090aGVyd2lzZShyZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5wcm9tcHQgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jb2xsZWN0KG1lc3NhZ2UsIHBocmFzZSwgcmVzKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuZGVmYXVsdCA9PSBudWxsID8gcmVzIDogVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5kZWZhdWx0KShtZXNzYWdlLCB7IHBocmFzZSwgZmFpbHVyZTogcmVzIH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2FzdHMgYSBwaHJhc2UgdG8gdGhpcyBhcmd1bWVudCdzIHR5cGUuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gY2FzdCB0by5cblx0ICogQHBhcmFtIHJlc29sdmVyIC0gVGhlIHR5cGUgcmVzb2x2ZXIuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBocmFzZSAtIFBocmFzZSB0byBwcm9jZXNzLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBhc3luYyBjYXN0KFxuXHRcdHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3Rlcixcblx0XHRyZXNvbHZlcjogVHlwZVJlc29sdmVyLFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGhyYXNlOiBzdHJpbmdcblx0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh0eXBlKSkge1xuXHRcdFx0Zm9yIChjb25zdCBlbnRyeSBvZiB0eXBlKSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGVudHJ5KSkge1xuXHRcdFx0XHRcdGlmIChlbnRyeS5zb21lKHQgPT4gdC50b0xvd2VyQ2FzZSgpID09PSBwaHJhc2UudG9Mb3dlckNhc2UoKSkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlbnRyeVswXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoZW50cnkudG9Mb3dlckNhc2UoKSA9PT0gcGhyYXNlLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZW50cnk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGxldCByZXMgPSB0eXBlKG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UocmVzKSkgcmVzID0gYXdhaXQgcmVzO1xuXHRcdFx0cmV0dXJuIHJlcztcblx0XHR9XG5cblx0XHRpZiAodHlwZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSBwaHJhc2UubWF0Y2godHlwZSk7XG5cdFx0XHRpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0Y29uc3QgbWF0Y2hlcyA9IFtdO1xuXG5cdFx0XHRpZiAodHlwZS5nbG9iYWwpIHtcblx0XHRcdFx0bGV0IG1hdGNoZWQ7XG5cblx0XHRcdFx0d2hpbGUgKChtYXRjaGVkID0gdHlwZS5leGVjKHBocmFzZSkpICE9IG51bGwpIHtcblx0XHRcdFx0XHRtYXRjaGVzLnB1c2gobWF0Y2hlZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHsgbWF0Y2gsIG1hdGNoZXMgfTtcblx0XHR9XG5cblx0XHRpZiAocmVzb2x2ZXIudHlwZSh0eXBlKSkge1xuXHRcdFx0bGV0IHJlcyA9IHJlc29sdmVyLnR5cGUodHlwZSk/LmNhbGwodGhpcywgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShyZXMpKSByZXMgPSBhd2FpdCByZXM7XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH1cblxuXHRcdHJldHVybiBwaHJhc2UgfHwgbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IGlzIHRoZSBsZWZ0LXRvLXJpZ2h0IGNvbXBvc2l0aW9uIG9mIHRoZSBnaXZlbiB0eXBlcy5cblx0ICogSWYgYW55IG9mIHRoZSB0eXBlcyBmYWlscywgdGhlIGVudGlyZSBjb21wb3NpdGlvbiBmYWlscy5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBjb21wb3NlKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKHRoaXM6IGFueSwgbWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRsZXQgYWNjID0gcGhyYXNlO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGFjYyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgYWNjKTtcblx0XHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShhY2MpKSByZXR1cm4gYWNjO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYWNjO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBpcyB0aGUgbGVmdC10by1yaWdodCBjb21wb3NpdGlvbiBvZiB0aGUgZ2l2ZW4gdHlwZXMuXG5cdCAqIElmIGFueSBvZiB0aGUgdHlwZXMgZmFpbHMsIHRoZSBjb21wb3NpdGlvbiBzdGlsbCBjb250aW51ZXMgd2l0aCB0aGUgZmFpbHVyZSBwYXNzZWQgb24uXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgY29tcG9zZVdpdGhGYWlsdXJlKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKHRoaXM6IGFueSwgbWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRsZXQgYWNjID0gcGhyYXNlO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGFjYyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgYWNjKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGFjYztcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBzb21ldGhpbmcgaXMgbnVsbCwgdW5kZWZpbmVkLCBvciBhIGZhaWwgZmxhZy5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzRmFpbHVyZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgbnVsbCB8IHVuZGVmaW5lZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pIHtcblx0XHRyZXR1cm4gdmFsdWUgPT0gbnVsbCB8fCBGbGFnLmlzKHZhbHVlLCBcImZhaWxcIik7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAocHJvZHVjdCB0eXBlKS5cblx0ICogT25seSBpbnB1dHMgd2hlcmUgZWFjaCB0eXBlIHJlc29sdmVzIHdpdGggYSBub24tdm9pZCB2YWx1ZSBhcmUgdmFsaWQuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcHJvZHVjdCguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbih0aGlzOiBhbnksIG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IFtdO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuXHRcdFx0XHRyZXN1bHRzLnB1c2gocmVzKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdHM7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB3aGVyZSB0aGUgcGFyc2VkIHZhbHVlIG11c3QgYmUgd2l0aGluIGEgcmFuZ2UuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gbWluIC0gTWluaW11bSB2YWx1ZS5cblx0ICogQHBhcmFtIG1heCAtIE1heGltdW0gdmFsdWUuXG5cdCAqIEBwYXJhbSBpbmNsdXNpdmUgLSBXaGV0aGVyIG9yIG5vdCB0byBiZSBpbmNsdXNpdmUgb24gdGhlIHVwcGVyIGJvdW5kLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyByYW5nZShcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsXG5cdFx0bWluOiBudW1iZXIsXG5cdFx0bWF4OiBudW1iZXIsXG5cdFx0aW5jbHVzaXZlID0gZmFsc2Vcblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gQXJndW1lbnQudmFsaWRhdGUodHlwZSwgKG1zZywgcCwgeCkgPT4ge1xuXHRcdFx0Y29uc3QgbyA9XG5cdFx0XHRcdHR5cGVvZiB4ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB4ID09PSBcImJpZ2ludFwiID8geCA6IHgubGVuZ3RoICE9IG51bGwgPyB4Lmxlbmd0aCA6IHguc2l6ZSAhPSBudWxsID8geC5zaXplIDogeDtcblxuXHRcdFx0cmV0dXJuIG8gPj0gbWluICYmIChpbmNsdXNpdmUgPyBvIDw9IG1heCA6IG8gPCBtYXgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHRoYXQgcGFyc2VzIGFzIG5vcm1hbCBidXQgYWxzbyB0YWdzIGl0IHdpdGggc29tZSBkYXRhLlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IHRhZywgdmFsdWUgfWAgYW5kIHdyYXBwZWQgaW4gYEZsYWcuZmFpbGAgd2hlbiBmYWlsZWQuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gdGFnIC0gVGFnIHRvIGFkZC4gRGVmYXVsdHMgdG8gdGhlIGB0eXBlYCBhcmd1bWVudCwgc28gdXNlZnVsIGlmIGl0IGlzIGEgc3RyaW5nLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0YWdnZWQodHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLCB0YWc6IGFueSA9IHR5cGUpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4odGhpczogYW55LCBtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdCh0eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdFx0cmV0dXJuIEZsYWcuZmFpbCh7IHRhZywgdmFsdWU6IHJlcyB9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHsgdGFnLCB2YWx1ZTogcmVzIH07XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSBmcm9tIG11bHRpcGxlIHR5cGVzICh1bmlvbiB0eXBlKS5cblx0ICogVGhlIGZpcnN0IHR5cGUgdGhhdCByZXNvbHZlcyB0byBhIG5vbi12b2lkIHZhbHVlIGlzIHVzZWQuXG5cdCAqIEVhY2ggdHlwZSB3aWxsIGFsc28gYmUgdGFnZ2VkIHVzaW5nIGB0YWdnZWRgIHdpdGggdGhlbXNlbHZlcy5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0YWdnZWRVbmlvbiguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbih0aGlzOiBhbnksIG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0ZW50cnkgPSBBcmd1bWVudC50YWdnZWQoZW50cnkpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRcdGlmICghQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBwYXJzZXMgYXMgbm9ybWFsIGJ1dCBhbHNvIHRhZ3MgaXQgd2l0aCBzb21lIGRhdGEgYW5kIGNhcnJpZXMgdGhlIG9yaWdpbmFsIGlucHV0LlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IHRhZywgaW5wdXQsIHZhbHVlIH1gIGFuZCB3cmFwcGVkIGluIGBGbGFnLmZhaWxgIHdoZW4gZmFpbGVkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHRhZyAtIFRhZyB0byBhZGQuIERlZmF1bHRzIHRvIHRoZSBgdHlwZWAgYXJndW1lbnQsIHNvIHVzZWZ1bCBpZiBpdCBpcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGFnZ2VkV2l0aElucHV0KHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlciwgdGFnOiBhbnkgPSB0eXBlKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKHRoaXM6IGFueSwgbWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikgdHlwZSA9IHR5cGUuYmluZCh0aGlzKTtcblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QodHlwZSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRcdHJldHVybiBGbGFnLmZhaWwoeyB0YWcsIGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IHRhZywgaW5wdXQ6IHBocmFzZSwgdmFsdWU6IHJlcyB9O1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAodW5pb24gdHlwZSkuXG5cdCAqIFRoZSBmaXJzdCB0eXBlIHRoYXQgcmVzb2x2ZXMgdG8gYSBub24tdm9pZCB2YWx1ZSBpcyB1c2VkLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHVuaW9uKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKHRoaXM6IGFueSwgbWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRmb3IgKGxldCBlbnRyeSBvZiB0eXBlcykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5ID09PSBcImZ1bmN0aW9uXCIpIGVudHJ5ID0gZW50cnkuYmluZCh0aGlzKTtcblx0XHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdChlbnRyeSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0XHRpZiAoIUFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHdpdGggZXh0cmEgdmFsaWRhdGlvbi5cblx0ICogSWYgdGhlIHByZWRpY2F0ZSBpcyBub3QgdHJ1ZSwgdGhlIHZhbHVlIGlzIGNvbnNpZGVyZWQgaW52YWxpZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBwcmVkaWNhdGUgLSBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB2YWxpZGF0ZSh0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsIHByZWRpY2F0ZTogUGFyc2VkVmFsdWVQcmVkaWNhdGUpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4odGhpczogYW55LCBtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdCh0eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHRpZiAoIXByZWRpY2F0ZS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBocmFzZSwgcmVzKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBwYXJzZXMgYXMgbm9ybWFsIGJ1dCBhbHNvIGNhcnJpZXMgdGhlIG9yaWdpbmFsIGlucHV0LlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IGlucHV0LCB2YWx1ZSB9YCBhbmQgd3JhcHBlZCBpbiBgRmxhZy5mYWlsYCB3aGVuIGZhaWxlZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHdpdGhJbnB1dCh0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4odGhpczogYW55LCBtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdCh0eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdFx0cmV0dXJuIEZsYWcuZmFpbCh7IGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfTtcblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgaG93IGFuIGFyZ3VtZW50IHBhcnNlcyB0ZXh0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50T3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBEZWZhdWx0IHZhbHVlIGlmIG5vIGlucHV0IG9yIGRpZCBub3QgY2FzdCBjb3JyZWN0bHkuXG5cdCAqIElmIHVzaW5nIGEgZmxhZyBtYXRjaCwgc2V0dGluZyB0aGUgZGVmYXVsdCB2YWx1ZSB0byBhIG5vbi12b2lkIHZhbHVlIGludmVyc2VzIHRoZSByZXN1bHQuXG5cdCAqL1xuXHRkZWZhdWx0PzogRGVmYXVsdFZhbHVlU3VwcGxpZXIgfCBhbnk7XG5cblx0LyoqXG5cdCAqIFRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgYXJndW1lbnRcblx0ICovXG5cdGRlc2NyaXB0aW9uPzogc3RyaW5nIHwgYW55IHwgYW55W107XG5cblx0LyoqXG5cdCAqIFRoZSBzdHJpbmcocykgdG8gdXNlIGFzIHRoZSBmbGFnIGZvciBmbGFnIG9yIG9wdGlvbiBtYXRjaC5cblx0ICovXG5cdGZsYWc/OiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuXHQvKipcblx0ICogSUQgb2YgdGhlIGFyZ3VtZW50IGZvciB1c2UgaW4gdGhlIGFyZ3Mgb2JqZWN0LiBUaGlzIGRvZXMgbm90aGluZyBpbnNpZGUgYW4gQXJndW1lbnRHZW5lcmF0b3IuXG5cdCAqL1xuXHRpZD86IHN0cmluZztcblxuXHQvKipcblx0ICogSW5kZXggb2YgcGhyYXNlIHRvIHN0YXJ0IGZyb20uIEFwcGxpY2FibGUgdG8gcGhyYXNlLCB0ZXh0LCBjb250ZW50LCByZXN0LCBvciBzZXBhcmF0ZSBtYXRjaCBvbmx5LlxuXHQgKiBJZ25vcmVkIHdoZW4gdXNlZCB3aXRoIHRoZSB1bm9yZGVyZWQgb3B0aW9uLlxuXHQgKi9cblx0aW5kZXg/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIEFtb3VudCBvZiBwaHJhc2VzIHRvIG1hdGNoIHdoZW4gbWF0Y2hpbmcgbW9yZSB0aGFuIG9uZS5cblx0ICogQXBwbGljYWJsZSB0byB0ZXh0LCBjb250ZW50LCByZXN0LCBvciBzZXBhcmF0ZSBtYXRjaCBvbmx5LlxuXHQgKiBEZWZhdWx0cyB0byBpbmZpbml0eS5cblx0ICovXG5cdGxpbWl0PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gbWF0Y2ggdGV4dC4gRGVmYXVsdHMgdG8gJ3BocmFzZScuXG5cdCAqL1xuXHRtYXRjaD86IEFyZ3VtZW50TWF0Y2g7XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdGhlcndpc2UgY29udGVudC5cblx0ICovXG5cdG1vZGlmeU90aGVyd2lzZT86IE90aGVyd2lzZUNvbnRlbnRNb2RpZmllcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gaGF2ZSBmbGFncyBwcm9jZXNzIG11bHRpcGxlIGlucHV0cy5cblx0ICogRm9yIG9wdGlvbiBmbGFncywgdGhpcyB3b3JrcyBsaWtlIHRoZSBzZXBhcmF0ZSBtYXRjaDsgdGhlIGxpbWl0IG9wdGlvbiB3aWxsIGFsc28gd29yayBoZXJlLlxuXHQgKiBGb3IgZmxhZ3MsIHRoaXMgd2lsbCBjb3VudCB0aGUgbnVtYmVyIG9mIG9jY3VycmVuY2VzLlxuXHQgKi9cblx0bXVsdGlwbGVGbGFncz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRleHQgc2VudCBpZiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLiBUaGlzIG92ZXJyaWRlcyB0aGUgYGRlZmF1bHRgIG9wdGlvbiBhbmQgYWxsIHByb21wdCBvcHRpb25zLlxuXHQgKi9cblx0b3RoZXJ3aXNlPzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IE90aGVyd2lzZUNvbnRlbnRTdXBwbGllcjtcblxuXHQvKipcblx0ICogUHJvbXB0IG9wdGlvbnMgZm9yIHdoZW4gdXNlciBkb2VzIG5vdCBwcm92aWRlIGlucHV0LlxuXHQgKi9cblx0cHJvbXB0PzogQXJndW1lbnRQcm9tcHRPcHRpb25zIHwgYm9vbGVhbjtcblxuXHQvKipcblx0ICogVHlwZSB0byBjYXN0IHRvLlxuXHQgKi9cblx0dHlwZT86IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcjtcblxuXHQvKipcblx0ICogTWFya3MgdGhlIGFyZ3VtZW50IGFzIHVub3JkZXJlZC5cblx0ICogRWFjaCBwaHJhc2UgaXMgZXZhbHVhdGVkIGluIG9yZGVyIHVudGlsIG9uZSBtYXRjaGVzIChubyBpbnB1dCBhdCBhbGwgbWVhbnMgbm8gZXZhbHVhdGlvbikuXG5cdCAqIFBhc3NpbmcgaW4gYSBudW1iZXIgZm9yY2VzIGV2YWx1YXRpb24gZnJvbSB0aGF0IGluZGV4IG9ud2FyZHMuXG5cdCAqIFBhc3NpbmcgaW4gYW4gYXJyYXkgb2YgbnVtYmVycyBmb3JjZXMgZXZhbHVhdGlvbiBvbiB0aG9zZSBpbmRpY2VzIG9ubHkuXG5cdCAqIElmIHRoZXJlIGlzIGEgbWF0Y2gsIHRoYXQgaW5kZXggaXMgY29uc2lkZXJlZCB1c2VkIGFuZCBmdXR1cmUgdW5vcmRlcmVkIGFyZ3Mgd2lsbCBub3QgY2hlY2sgdGhhdCBpbmRleCBhZ2Fpbi5cblx0ICogSWYgdGhlcmUgaXMgbm8gbWF0Y2gsIHRoZW4gdGhlIHByb21wdGluZyBvciBkZWZhdWx0IHZhbHVlIGlzIHVzZWQuXG5cdCAqIEFwcGxpY2FibGUgdG8gcGhyYXNlIG1hdGNoIG9ubHkuXG5cdCAqL1xuXHR1bm9yZGVyZWQ/OiBib29sZWFuIHwgbnVtYmVyIHwgbnVtYmVyW107XG59XG5cbi8qKlxuICogRGF0YSBwYXNzZWQgdG8gYXJndW1lbnQgcHJvbXB0IGZ1bmN0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFByb21wdERhdGEge1xuXHQvKipcblx0ICogV2hldGhlciB0aGUgcHJvbXB0IGlzIGluZmluaXRlIG9yIG5vdC5cblx0ICovXG5cdGluZmluaXRlOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgbWVzc2FnZSB0aGF0IGNhdXNlZCB0aGUgcHJvbXB0LlxuXHQgKi9cblx0bWVzc2FnZTogTWVzc2FnZTtcblxuXHQvKipcblx0ICogQW1vdW50IG9mIHJldHJpZXMgc28gZmFyLlxuXHQgKi9cblx0cmV0cmllczogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgaW5wdXQgcGhyYXNlIHRoYXQgY2F1c2VkIHRoZSBwcm9tcHQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZy5cblx0ICovXG5cdHBocmFzZTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgdmFsdWUgdGhhdCBmYWlsZWQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIG51bGwuXG5cdCAqL1xuXHRmYWlsdXJlOiB2b2lkIHwgKEZsYWcgJiB7IHZhbHVlOiBhbnkgfSk7XG59XG5cbi8qKlxuICogQSBwcm9tcHQgdG8gcnVuIGlmIHRoZSB1c2VyIGRpZCBub3QgaW5wdXQgdGhlIGFyZ3VtZW50IGNvcnJlY3RseS5cbiAqIENhbiBvbmx5IGJlIHVzZWQgaWYgdGhlcmUgaXMgbm90IGEgZGVmYXVsdCB2YWx1ZSAodW5sZXNzIG9wdGlvbmFsIGlzIHRydWUpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50UHJvbXB0T3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBXaGVuZXZlciBhbiBpbnB1dCBtYXRjaGVzIHRoZSBmb3JtYXQgb2YgYSBjb21tYW5kLCB0aGlzIG9wdGlvbiBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0byBjYW5jZWwgdGhpcyBjb21tYW5kIGFuZCBydW4gdGhhdCBjb21tYW5kLlxuXHQgKiBUaGUgY29tbWFuZCB0byBiZSBydW4gbWF5IGJlIHRoZSBzYW1lIGNvbW1hbmQgb3Igc29tZSBvdGhlciBjb21tYW5kLlxuXHQgKiBEZWZhdWx0cyB0byB0cnVlLFxuXHQgKi9cblx0YnJlYWtvdXQ/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUZXh0IHNlbnQgb24gY2FuY2VsbGF0aW9uIG9mIGNvbW1hbmQuXG5cdCAqL1xuXHRjYW5jZWw/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBXb3JkIHRvIHVzZSBmb3IgY2FuY2VsbGluZyB0aGUgY29tbWFuZC4gRGVmYXVsdHMgdG8gJ2NhbmNlbCcuXG5cdCAqL1xuXHRjYW5jZWxXb3JkPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUZXh0IHNlbnQgb24gYW1vdW50IG9mIHRyaWVzIHJlYWNoaW5nIHRoZSBtYXguXG5cdCAqL1xuXHRlbmRlZD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFByb21wdHMgZm9yZXZlciB1bnRpbCB0aGUgc3RvcCB3b3JkLCBjYW5jZWwgd29yZCwgdGltZSBsaW1pdCwgb3IgcmV0cnkgbGltaXQuXG5cdCAqIE5vdGUgdGhhdCB0aGUgcmV0cnkgY291bnQgcmVzZXRzIGJhY2sgdG8gb25lIG9uIGVhY2ggdmFsaWQgZW50cnkuXG5cdCAqIFRoZSBmaW5hbCBldmFsdWF0ZWQgYXJndW1lbnQgd2lsbCBiZSBhbiBhcnJheSBvZiB0aGUgaW5wdXRzLlxuXHQgKiBEZWZhdWx0cyB0byBmYWxzZS5cblx0ICovXG5cdGluZmluaXRlPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQW1vdW50IG9mIGlucHV0cyBhbGxvd2VkIGZvciBhbiBpbmZpbml0ZSBwcm9tcHQgYmVmb3JlIGZpbmlzaGluZy4gRGVmYXVsdHMgdG8gSW5maW5pdHkuXG5cdCAqL1xuXHRsaW1pdD86IG51bWJlcjtcblxuXHQvKipcblx0ICogRnVuY3Rpb24gdG8gbW9kaWZ5IGNhbmNlbCBtZXNzYWdlcy5cblx0ICovXG5cdG1vZGlmeUNhbmNlbD86IFByb21wdENvbnRlbnRNb2RpZmllcjtcblxuXHQvKipcblx0ICogRnVuY3Rpb24gdG8gbW9kaWZ5IG91dCBvZiB0cmllcyBtZXNzYWdlcy5cblx0ICovXG5cdG1vZGlmeUVuZGVkPzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBtb2RpZnkgcmV0cnkgcHJvbXB0cy5cblx0ICovXG5cdG1vZGlmeVJldHJ5PzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBtb2RpZnkgc3RhcnQgcHJvbXB0cy5cblx0ICovXG5cdG1vZGlmeVN0YXJ0PzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBtb2RpZnkgdGltZW91dCBtZXNzYWdlcy5cblx0ICovXG5cdG1vZGlmeVRpbWVvdXQ/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqXG5cdCAqIFByb21wdHMgb25seSB3aGVuIGFyZ3VtZW50IGlzIHByb3ZpZGVkIGJ1dCB3YXMgbm90IG9mIHRoZSByaWdodCB0eXBlLiBEZWZhdWx0cyB0byBmYWxzZS5cblx0ICovXG5cdG9wdGlvbmFsPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQW1vdW50IG9mIHJldHJpZXMgYWxsb3dlZC4gRGVmYXVsdHMgdG8gMS5cblx0ICovXG5cdHJldHJpZXM/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRleHQgc2VudCBvbiBhIHJldHJ5IChmYWlsdXJlIHRvIGNhc3QgdHlwZSkuXG5cdCAqL1xuXHRyZXRyeT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFRleHQgc2VudCBvbiBzdGFydCBvZiBwcm9tcHQuXG5cdCAqL1xuXHRzdGFydD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFdvcmQgdG8gdXNlIGZvciBlbmRpbmcgaW5maW5pdGUgcHJvbXB0cy4gRGVmYXVsdHMgdG8gJ3N0b3AnLlxuXHQgKi9cblx0c3RvcFdvcmQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRpbWUgdG8gd2FpdCBmb3IgaW5wdXQuIERlZmF1bHRzIHRvIDMwMDAwLlxuXHQgKi9cblx0dGltZT86IG51bWJlcjtcblxuXHQvKipcblx0ICogVGV4dCBzZW50IG9uIGNvbGxlY3RvciB0aW1lIG91dC5cblx0ICovXG5cdHRpbWVvdXQ/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xufVxuXG4vKipcbiAqIFRoZSBtZXRob2QgdG8gbWF0Y2ggYXJndW1lbnRzIGZyb20gdGV4dC5cbiAqIC0gYHBocmFzZWAgbWF0Y2hlcyBieSB0aGUgb3JkZXIgb2YgdGhlIHBocmFzZXMgaW5wdXR0ZWQuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIC0gYGZsYWdgIG1hdGNoZXMgcGhyYXNlcyB0aGF0IGFyZSB0aGUgc2FtZSBhcyBpdHMgZmxhZy5cbiAqIFRoZSBldmFsdWF0ZWQgYXJndW1lbnQgaXMgZWl0aGVyIHRydWUgb3IgZmFsc2UuXG4gKiAtIGBvcHRpb25gIG1hdGNoZXMgcGhyYXNlcyB0aGF0IHN0YXJ0cyB3aXRoIHRoZSBmbGFnLlxuICogVGhlIHBocmFzZSBhZnRlciB0aGUgZmxhZyBpcyB0aGUgZXZhbHVhdGVkIGFyZ3VtZW50LlxuICogLSBgcmVzdGAgbWF0Y2hlcyB0aGUgcmVzdCBvZiB0aGUgcGhyYXNlcy5cbiAqIEl0IGlnbm9yZXMgcGhyYXNlcyB0aGF0IG1hdGNoZXMgYSBmbGFnLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYHNlcGFyYXRlYCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSBwaHJhc2VzIGFuZCBwcm9jZXNzZXMgZWFjaCBpbmRpdmlkdWFsbHkuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIC0gYHRleHRgIG1hdGNoZXMgdGhlIGVudGlyZSB0ZXh0LCBleGNlcHQgZm9yIHRoZSBjb21tYW5kLlxuICogSXQgaWdub3JlcyBwaHJhc2VzIHRoYXQgbWF0Y2hlcyBhIGZsYWcuXG4gKiBJdCBwcmVzZXJ2ZXMgdGhlIG9yaWdpbmFsIHdoaXRlc3BhY2UgYmV0d2VlbiBwaHJhc2VzIGFuZCB0aGUgcXVvdGVzIGFyb3VuZCBwaHJhc2VzLlxuICogLSBgY29udGVudGAgbWF0Y2hlcyB0aGUgZW50aXJlIHRleHQgYXMgaXQgd2FzIGlucHV0dGVkLCBleGNlcHQgZm9yIHRoZSBjb21tYW5kLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYHJlc3RDb250ZW50YCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSB0ZXh0IGFzIGl0IHdhcyBpbnB1dHRlZC5cbiAqIEl0IHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgd2hpdGVzcGFjZSBiZXR3ZWVuIHBocmFzZXMgYW5kIHRoZSBxdW90ZXMgYXJvdW5kIHBocmFzZXMuXG4gKiAtIGBub25lYCBtYXRjaGVzIG5vdGhpbmcgYXQgYWxsIGFuZCBhbiBlbXB0eSBzdHJpbmcgd2lsbCBiZSB1c2VkIGZvciB0eXBlIG9wZXJhdGlvbnMuXG4gKi9cbmV4cG9ydCB0eXBlIEFyZ3VtZW50TWF0Y2ggPVxuXHR8IFwicGhyYXNlXCJcblx0fCBcImZsYWdcIlxuXHR8IFwib3B0aW9uXCJcblx0fCBcInJlc3RcIlxuXHR8IFwic2VwYXJhdGVcIlxuXHR8IFwidGV4dFwiXG5cdHwgXCJjb250ZW50XCJcblx0fCBcInJlc3RDb250ZW50XCJcblx0fCBcIm5vbmVcIjtcblxuLyoqXG4gKiBUaGUgdHlwZSB0aGF0IHRoZSBhcmd1bWVudCBzaG91bGQgYmUgY2FzdCB0by5cbiAqIC0gYHN0cmluZ2AgZG9lcyBub3QgY2FzdCB0byBhbnkgdHlwZS5cbiAqIC0gYGxvd2VyY2FzZWAgbWFrZXMgdGhlIGlucHV0IGxvd2VyY2FzZS5cbiAqIC0gYHVwcGVyY2FzZWAgbWFrZXMgdGhlIGlucHV0IHVwcGVyY2FzZS5cbiAqIC0gYGNoYXJDb2Rlc2AgdHJhbnNmb3JtcyB0aGUgaW5wdXQgdG8gYW4gYXJyYXkgb2YgY2hhciBjb2Rlcy5cbiAqIC0gYG51bWJlcmAgY2FzdHMgdG8gYSBudW1iZXIuXG4gKiAtIGBpbnRlZ2VyYCBjYXN0cyB0byBhbiBpbnRlZ2VyLlxuICogLSBgYmlnaW50YCBjYXN0cyB0byBhIGJpZyBpbnRlZ2VyLlxuICogLSBgdXJsYCBjYXN0cyB0byBhbiBgVVJMYCBvYmplY3QuXG4gKiAtIGBkYXRlYCBjYXN0cyB0byBhIGBEYXRlYCBvYmplY3QuXG4gKiAtIGBjb2xvcmAgY2FzdHMgYSBoZXggY29kZSB0byBhbiBpbnRlZ2VyLlxuICogLSBgY29tbWFuZEFsaWFzYCB0cmllcyB0byByZXNvbHZlIHRvIGEgY29tbWFuZCBmcm9tIGFuIGFsaWFzLlxuICogLSBgY29tbWFuZGAgbWF0Y2hlcyB0aGUgSUQgb2YgYSBjb21tYW5kLlxuICogLSBgaW5oaWJpdG9yYCBtYXRjaGVzIHRoZSBJRCBvZiBhbiBpbmhpYml0b3IuXG4gKiAtIGBsaXN0ZW5lcmAgbWF0Y2hlcyB0aGUgSUQgb2YgYSBsaXN0ZW5lci5cbiAqIC0gYHRhc2tgIG1hdGNoZXMgdGhlIElEIG9mIGEgdGFzay5cbiAqIC0gYGNvbnRleHRNZW51Q29tbWFuZGAgbWF0Y2hlcyB0aGUgSUQgb2YgYSBjb250ZXh0IG1lbnUgY29tbWFuZC5cbiAqXG4gKiBQb3NzaWJsZSBEaXNjb3JkLXJlbGF0ZWQgdHlwZXMuXG4gKiBUaGVzZSB0eXBlcyBjYW4gYmUgcGx1cmFsIChhZGQgYW4gJ3MnIHRvIHRoZSBlbmQpIGFuZCBhIGNvbGxlY3Rpb24gb2YgbWF0Y2hpbmcgb2JqZWN0cyB3aWxsIGJlIHVzZWQuXG4gKiAtIGB1c2VyYCB0cmllcyB0byByZXNvbHZlIHRvIGEgdXNlci5cbiAqIC0gYG1lbWJlcmAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIG1lbWJlci5cbiAqIC0gYHJlbGV2YW50YCB0cmllcyB0byByZXNvbHZlIHRvIGEgcmVsZXZhbnQgdXNlciwgd29ya3MgaW4gYm90aCBndWlsZHMgYW5kIERNcy5cbiAqIC0gYGNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBjaGFubmVsLlxuICogLSBgdGV4dENoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB0ZXh0IGNoYW5uZWwuXG4gKiAtIGB2b2ljZUNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB2b2ljZSBjaGFubmVsLlxuICogLSBgY2F0ZWdvcnlDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIHRvIGEgY2F0ZWdvcnkgY2hhbm5lbC5cbiAqIC0gYG5ld3NDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIHRvIGEgbmV3cyBjaGFubmVsLlxuICogLSBgc3RvcmVDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIHRvIGEgc3RvcmUgY2hhbm5lbC5cbiAqIC0gYHN0YWdlQ2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHN0YWdlIGNoYW5uZWwuXG4gKiAtIGB0aHJlYWRDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIGEgdGhyZWFkIGNoYW5uZWwuXG4gKiAtIGByb2xlYCB0cmllcyB0byByZXNvbHZlIHRvIGEgcm9sZS5cbiAqIC0gYGVtb2ppYCB0cmllcyB0byByZXNvbHZlIHRvIGEgY3VzdG9tIGVtb2ppLlxuICogLSBgZ3VpbGRgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBndWlsZC5cbiAqXG4gKiBPdGhlciBEaXNjb3JkLXJlbGF0ZWQgdHlwZXM6XG4gKiAtIGBtZXNzYWdlYCB0cmllcyB0byBmZXRjaCBhIG1lc3NhZ2UgZnJvbSBhbiBJRCB3aXRoaW4gdGhlIGNoYW5uZWwuXG4gKiAtIGBndWlsZE1lc3NhZ2VgIHRyaWVzIHRvIGZldGNoIGEgbWVzc2FnZSBmcm9tIGFuIElEIHdpdGhpbiB0aGUgZ3VpbGQuXG4gKiAtIGByZWxldmFudE1lc3NhZ2VgIGlzIGEgY29tYmluYXRpb24gb2YgdGhlIGFib3ZlLCB3b3JrcyBpbiBib3RoIGd1aWxkcyBhbmQgRE1zLlxuICogLSBgaW52aXRlYCB0cmllcyB0byBmZXRjaCBhbiBpbnZpdGUgb2JqZWN0IGZyb20gYSBsaW5rLlxuICogLSBgdXNlck1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGEgdXNlci5cbiAqIC0gYG1lbWJlck1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGEgZ3VpbGQgbWVtYmVyLlxuICogLSBgY2hhbm5lbE1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGEgY2hhbm5lbC5cbiAqIC0gYHJvbGVNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhIHJvbGUuXG4gKiAtIGBlbW9qaU1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGFuIGVtb2ppLlxuICpcbiAqIEFuIGFycmF5IG9mIHN0cmluZ3MgY2FuIGJlIHVzZWQgdG8gcmVzdHJpY3QgaW5wdXQgdG8gb25seSB0aG9zZSBzdHJpbmdzLCBjYXNlIGluc2Vuc2l0aXZlLlxuICogVGhlIGFycmF5IGNhbiBhbHNvIGNvbnRhaW4gYW4gaW5uZXIgYXJyYXkgb2Ygc3RyaW5ncywgZm9yIGFsaWFzZXMuXG4gKiBJZiBzbywgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheSB3aWxsIGJlIHVzZWQgYXMgdGhlIGZpbmFsIGFyZ3VtZW50LlxuICpcbiAqIEEgcmVndWxhciBleHByZXNzaW9uIGNhbiBhbHNvIGJlIHVzZWQuXG4gKiBUaGUgZXZhbHVhdGVkIGFyZ3VtZW50IHdpbGwgYmUgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGBtYXRjaGAgYW5kIGBtYXRjaGVzYCBpZiBnbG9iYWwuXG4gKi9cbmV4cG9ydCB0eXBlIEJhc2VBcmd1bWVudFR5cGUgPVxuXHR8IFwic3RyaW5nXCJcblx0fCBcImxvd2VyY2FzZVwiXG5cdHwgXCJ1cHBlcmNhc2VcIlxuXHR8IFwiY2hhckNvZGVzXCJcblx0fCBcIm51bWJlclwiXG5cdHwgXCJpbnRlZ2VyXCJcblx0fCBcImJpZ2ludFwiXG5cdHwgXCJlbW9qaW50XCJcblx0fCBcInVybFwiXG5cdHwgXCJkYXRlXCJcblx0fCBcImNvbG9yXCJcblx0fCBcInVzZXJcIlxuXHR8IFwidXNlcnNcIlxuXHR8IFwibWVtYmVyXCJcblx0fCBcIm1lbWJlcnNcIlxuXHR8IFwicmVsZXZhbnRcIlxuXHR8IFwicmVsZXZhbnRzXCJcblx0fCBcImNoYW5uZWxcIlxuXHR8IFwiY2hhbm5lbHNcIlxuXHR8IFwidGV4dENoYW5uZWxcIlxuXHR8IFwidGV4dENoYW5uZWxzXCJcblx0fCBcInZvaWNlQ2hhbm5lbFwiXG5cdHwgXCJ2b2ljZUNoYW5uZWxzXCJcblx0fCBcImNhdGVnb3J5Q2hhbm5lbFwiXG5cdHwgXCJjYXRlZ29yeUNoYW5uZWxzXCJcblx0fCBcIm5ld3NDaGFubmVsXCJcblx0fCBcIm5ld3NDaGFubmVsc1wiXG5cdHwgXCJzdG9yZUNoYW5uZWxcIlxuXHR8IFwic3RvcmVDaGFubmVsc1wiXG5cdHwgXCJzdGFnZUNoYW5uZWxcIlxuXHR8IFwic3RhZ2VDaGFubmVsc1wiXG5cdHwgXCJ0aHJlYWRDaGFubmVsXCJcblx0fCBcInRocmVhZENoYW5uZWxzXCJcblx0fCBcInJvbGVcIlxuXHR8IFwicm9sZXNcIlxuXHR8IFwiZW1vamlcIlxuXHR8IFwiZW1vamlzXCJcblx0fCBcImd1aWxkXCJcblx0fCBcImd1aWxkc1wiXG5cdHwgXCJtZXNzYWdlXCJcblx0fCBcImd1aWxkTWVzc2FnZVwiXG5cdHwgXCJyZWxldmFudE1lc3NhZ2VcIlxuXHR8IFwiaW52aXRlXCJcblx0fCBcInVzZXJNZW50aW9uXCJcblx0fCBcIm1lbWJlck1lbnRpb25cIlxuXHR8IFwiY2hhbm5lbE1lbnRpb25cIlxuXHR8IFwicm9sZU1lbnRpb25cIlxuXHR8IFwiZW1vamlNZW50aW9uXCJcblx0fCBcImNvbW1hbmRBbGlhc1wiXG5cdHwgXCJjb21tYW5kXCJcblx0fCBcImluaGliaXRvclwiXG5cdHwgXCJsaXN0ZW5lclwiXG5cdHwgXCJ0YXNrXCJcblx0fCBcImNvbnRleHRNZW51Q29tbWFuZFwiO1xuXG5leHBvcnQgdHlwZSBBcmd1bWVudFR5cGUgPSBCYXNlQXJndW1lbnRUeXBlIHwgKHN0cmluZyB8IHN0cmluZ1tdKVtdIHwgUmVnRXhwIHwgc3RyaW5nO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gZm9yIHByb2Nlc3NpbmcgdXNlciBpbnB1dCB0byB1c2UgYXMgYW4gYXJndW1lbnQuXG4gKiBBIHZvaWQgcmV0dXJuIHZhbHVlIHdpbGwgdXNlIHRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGUgYXJndW1lbnQgb3Igc3RhcnQgYSBwcm9tcHQuXG4gKiBBbnkgb3RoZXIgdHJ1dGh5IHJldHVybiB2YWx1ZSB3aWxsIGJlIHVzZWQgYXMgdGhlIGV2YWx1YXRlZCBhcmd1bWVudC5cbiAqIElmIHJldHVybmluZyBhIFByb21pc2UsIHRoZSByZXNvbHZlZCB2YWx1ZSB3aWxsIGdvIHRocm91Z2ggdGhlIGFib3ZlIHN0ZXBzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHBocmFzZSAtIFRoZSB1c2VyIGlucHV0LlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudFR5cGVDYXN0ZXIgPSAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpID0+IGFueTtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGZvciBwcm9jZXNzaW5nIHNvbWUgdmFsdWUgdG8gdXNlIGFzIGFuIGFyZ3VtZW50LlxuICogVGhpcyBpcyBtYWlubHkgdXNlZCBpbiBjb21wb3NpbmcgYXJndW1lbnQgdHlwZXMuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gdmFsdWUgLSBTb21lIHZhbHVlLlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudFR5cGVDYXN0ZXJfID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIHZhbHVlOiBhbnkpID0+IGFueTtcblxuLyoqXG4gKiBEYXRhIHBhc3NlZCB0byBmdW5jdGlvbnMgdGhhdCBydW4gd2hlbiB0aGluZ3MgZmFpbGVkLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZhaWx1cmVEYXRhIHtcblx0LyoqIFRoZSBpbnB1dCBwaHJhc2UgdGhhdCBmYWlsZWQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZy4gKi9cblx0cGhyYXNlOiBzdHJpbmc7XG5cblx0LyoqIFRoZSB2YWx1ZSB0aGF0IGZhaWxlZCBpZiB0aGVyZSB3YXMgb25lLCBvdGhlcndpc2UgbnVsbC4gKi9cblx0ZmFpbHVyZTogdm9pZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pO1xufVxuXG4vKipcbiAqIERlZmF1bHRzIGZvciBhcmd1bWVudCBvcHRpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRBcmd1bWVudE9wdGlvbnMge1xuXHQvKipcblx0ICogRGVmYXVsdCBwcm9tcHQgb3B0aW9ucy5cblx0ICovXG5cdHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucztcblxuXHQvKipcblx0ICogRGVmYXVsdCB0ZXh0IHNlbnQgaWYgYXJndW1lbnQgcGFyc2luZyBmYWlscy5cblx0ICovXG5cdG90aGVyd2lzZT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBPdGhlcndpc2VDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdGhlcndpc2UgY29udGVudC5cblx0ICovXG5cdG1vZGlmeU90aGVyd2lzZT86IE90aGVyd2lzZUNvbnRlbnRNb2RpZmllcjtcbn1cblxuLyoqXG4gKiBGdW5jdGlvbiBnZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgdGhlIGFyZ3VtZW50LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIERlZmF1bHRWYWx1ZVN1cHBsaWVyID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIGRhdGE6IEZhaWx1cmVEYXRhKSA9PiBhbnk7XG5cbi8qKlxuICogQSBmdW5jdGlvbiBmb3IgdmFsaWRhdGluZyBwYXJzZWQgYXJndW1lbnRzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHBocmFzZSAtIFRoZSB1c2VyIGlucHV0LlxuICogQHBhcmFtIHZhbHVlIC0gVGhlIHBhcnNlZCB2YWx1ZS5cbiAqL1xuZXhwb3J0IHR5cGUgUGFyc2VkVmFsdWVQcmVkaWNhdGUgPSAobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IGJvb2xlYW47XG5cbi8qKlxuICogQSBmdW5jdGlvbiBtb2RpZnlpbmcgYSBwcm9tcHQgdGV4dC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSB0ZXh0IC0gVGV4dCB0byBtb2RpZnkuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgT3RoZXJ3aXNlQ29udGVudE1vZGlmaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHR0ZXh0OiBzdHJpbmcsXG5cdGRhdGE6IEZhaWx1cmVEYXRhXG4pID0+IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRoZSBjb250ZW50IGlmIGFyZ3VtZW50IHBhcnNpbmcgZmFpbHMuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgT3RoZXJ3aXNlQ29udGVudFN1cHBsaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRkYXRhOiBGYWlsdXJlRGF0YVxuKSA9PiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIG1vZGlmeWluZyBhIHByb21wdCB0ZXh0LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHRleHQgLSBUZXh0IGZyb20gdGhlIHByb21wdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgUHJvbXB0Q29udGVudE1vZGlmaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHR0ZXh0OiBzdHJpbmcsXG5cdGRhdGE6IEFyZ3VtZW50UHJvbXB0RGF0YVxuKSA9PiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHJldHVybmluZyB0ZXh0IGZvciB0aGUgcHJvbXB0LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIFByb21wdENvbnRlbnRTdXBwbGllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0ZGF0YTogQXJndW1lbnRQcm9tcHREYXRhXG4pID0+IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuIl19