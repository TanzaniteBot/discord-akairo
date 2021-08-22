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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVEQUF5RTtBQUN6RSxtREFBMkI7QUFDM0IsOERBQXNDO0FBT3RDOzs7O0dBSUc7QUFDSCxNQUFxQixRQUFRO0lBQzVCLFlBQ0MsT0FBZ0IsRUFDaEIsRUFDQyxLQUFLLEdBQUcsMkJBQWUsQ0FBQyxNQUFNLEVBQzlCLElBQUksR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFDM0IsSUFBSSxHQUFHLElBQUksRUFDWCxhQUFhLEdBQUcsS0FBSyxFQUNyQixLQUFLLEdBQUcsSUFBSSxFQUNaLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLEtBQUssR0FBRyxRQUFRLEVBQ2hCLE1BQU0sR0FBRyxJQUFJLEVBQ2IsT0FBTyxFQUFFLFlBQVksR0FBRyxJQUFJLEVBQzVCLFNBQVMsR0FBRyxJQUFJLEVBQ2hCLGVBQWUsR0FBRyxJQUFJLEtBQ0YsRUFBRTtRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRWhFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBRW5DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxNQUFNLEdB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LE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RSxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLE9BQU8sY0FBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDaEQ7WUFFRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDdEMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztDQUNEO0FBMWxCRCwyQkEwbEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXJndW1lbnRNYXRjaGVzLCBBcmd1bWVudFR5cGVzIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWwvQ29uc3RhbnRzXCI7XG5pbXBvcnQgRmxhZyBmcm9tIFwiLi4vRmxhZ1wiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IENvbW1hbmQgZnJvbSBcIi4uL0NvbW1hbmRcIjtcbmltcG9ydCB7IE1lc3NhZ2UsIE1lc3NhZ2VQYXlsb2FkLCBNZXNzYWdlT3B0aW9ucyB9IGZyb20gXCJkaXNjb3JkLmpzXCI7XG5pbXBvcnQgVHlwZVJlc29sdmVyIGZyb20gXCIuL1R5cGVSZXNvbHZlclwiO1xuaW1wb3J0IENvbW1hbmRIYW5kbGVyIGZyb20gXCIuLi9Db21tYW5kSGFuZGxlclwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vLi4vQWthaXJvQ2xpZW50XCI7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBhcmd1bWVudCBmb3IgYSBjb21tYW5kLlxuICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIG9mIHRoZSBhcmd1bWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGFyZ3VtZW50LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmd1bWVudCB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdHtcblx0XHRcdG1hdGNoID0gQXJndW1lbnRNYXRjaGVzLlBIUkFTRSxcblx0XHRcdHR5cGUgPSBBcmd1bWVudFR5cGVzLlNUUklORyxcblx0XHRcdGZsYWcgPSBudWxsLFxuXHRcdFx0bXVsdGlwbGVGbGFncyA9IGZhbHNlLFxuXHRcdFx0aW5kZXggPSBudWxsLFxuXHRcdFx0dW5vcmRlcmVkID0gZmFsc2UsXG5cdFx0XHRsaW1pdCA9IEluZmluaXR5LFxuXHRcdFx0cHJvbXB0ID0gbnVsbCxcblx0XHRcdGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZSA9IG51bGwsXG5cdFx0XHRvdGhlcndpc2UgPSBudWxsLFxuXHRcdFx0bW9kaWZ5T3RoZXJ3aXNlID0gbnVsbFxuXHRcdH06IEFyZ3VtZW50T3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG5cblx0XHR0aGlzLm1hdGNoID0gbWF0Y2g7XG5cblx0XHR0aGlzLnR5cGUgPSB0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiID8gdHlwZS5iaW5kKHRoaXMpIDogdHlwZTtcblxuXHRcdHRoaXMuZmxhZyA9IGZsYWc7XG5cblx0XHR0aGlzLm11bHRpcGxlRmxhZ3MgPSBtdWx0aXBsZUZsYWdzO1xuXG5cdFx0dGhpcy5pbmRleCA9IGluZGV4O1xuXG5cdFx0dGhpcy51bm9yZGVyZWQgPSB1bm9yZGVyZWQ7XG5cblx0XHR0aGlzLmxpbWl0ID0gbGltaXQ7XG5cblx0XHR0aGlzLnByb21wdCA9IHByb21wdDtcblxuXHRcdHRoaXMuZGVmYXVsdCA9IHR5cGVvZiBkZWZhdWx0VmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGRlZmF1bHRWYWx1ZS5iaW5kKHRoaXMpIDogZGVmYXVsdFZhbHVlO1xuXG5cdFx0dGhpcy5vdGhlcndpc2UgPSB0eXBlb2Ygb3RoZXJ3aXNlID09PSBcImZ1bmN0aW9uXCIgPyBvdGhlcndpc2UuYmluZCh0aGlzKSA6IG90aGVyd2lzZTtcblxuXHRcdHRoaXMubW9kaWZ5T3RoZXJ3aXNlID0gbW9kaWZ5T3RoZXJ3aXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjbGllbnQuXG5cdCAqL1xuXHRnZXQgY2xpZW50KCk6IEFrYWlyb0NsaWVudCB7XG5cdFx0cmV0dXJuIHRoaXMuY29tbWFuZC5jbGllbnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgdGhpcyBhcmd1bWVudCBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmQ6IENvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBhcmd1bWVudCBvciBhIGZ1bmN0aW9uIHN1cHBseWluZyB0aGUgZGVmYXVsdCB2YWx1ZS5cblx0ICovXG5cdHB1YmxpYyBkZWZhdWx0OiBEZWZhdWx0VmFsdWVTdXBwbGllciB8IGFueTtcblxuXHQvKipcblx0ICogIERlc2NyaXB0aW9uIG9mIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGRlc2NyaXB0aW9uOiBzdHJpbmcgfCBhbnk7XG5cblx0LyoqXG5cdCAqIFRoZSBzdHJpbmcocykgdG8gdXNlIGZvciBmbGFnIG9yIG9wdGlvbiBtYXRjaC5cblx0ICovXG5cdHB1YmxpYyBmbGFnPzogc3RyaW5nIHwgc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIFRoZSBjb21tYW5kIGhhbmRsZXIuXG5cdCAqL1xuXHRnZXQgaGFuZGxlcigpOiBDb21tYW5kSGFuZGxlciB7XG5cdFx0cmV0dXJuIHRoaXMuY29tbWFuZC5oYW5kbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBpbmRleCB0byBzdGFydCBmcm9tLlxuXHQgKi9cblx0cHVibGljIGluZGV4PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBUaGUgYW1vdW50IG9mIHBocmFzZXMgdG8gbWF0Y2ggZm9yIHJlc3QsIHNlcGFyYXRlLCBjb250ZW50LCBvciB0ZXh0IG1hdGNoLlxuXHQgKi9cblx0cHVibGljIGxpbWl0OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdG8gbWF0Y2ggdGV4dC5cblx0ICovXG5cdHB1YmxpYyBtYXRjaDogQXJndW1lbnRNYXRjaDtcblxuXHQvKipcblx0ICogRnVuY3Rpb24gdG8gbW9kaWZ5IG90aGVyd2lzZSBjb250ZW50LlxuXHQgKi9cblx0cHVibGljIG1vZGlmeU90aGVyd2lzZTogT3RoZXJ3aXNlQ29udGVudE1vZGlmaWVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRvIHByb2Nlc3MgbXVsdGlwbGUgb3B0aW9uIGZsYWdzIGluc3RlYWQgb2YganVzdCB0aGUgZmlyc3QuXG5cdCAqL1xuXHRwdWJsaWMgbXVsdGlwbGVGbGFnczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIGNvbnRlbnQgb3IgZnVuY3Rpb24gc3VwcGx5aW5nIHRoZSBjb250ZW50IHNlbnQgd2hlbiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLlxuXHQgKi9cblx0cHVibGljIG90aGVyd2lzZT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBPdGhlcndpc2VDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqXG5cdCAqIFRoZSBwcm9tcHQgb3B0aW9ucy5cblx0ICovXG5cdHB1YmxpYyBwcm9tcHQ/OiBBcmd1bWVudFByb21wdE9wdGlvbnMgfCBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgdHlwZSB0byBjYXN0IHRvIG9yIGEgZnVuY3Rpb24gdG8gdXNlIHRvIGNhc3QuXG5cdCAqL1xuXHRwdWJsaWMgdHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0aGUgYXJndW1lbnQgaXMgdW5vcmRlcmVkLlxuXHQgKi9cblx0cHVibGljIHVub3JkZXJlZDogYm9vbGVhbiB8IG51bWJlciB8IG51bWJlcltdO1xuXG5cdC8qKlxuXHQgKiBDYXN0cyBhIHBocmFzZSB0byB0aGlzIGFyZ3VtZW50J3MgdHlwZS5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGhyYXNlIC0gUGhyYXNlIHRvIHByb2Nlc3MuXG5cdCAqL1xuXHRwdWJsaWMgY2FzdChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG5cdFx0cmV0dXJuIEFyZ3VtZW50LmNhc3QodGhpcy50eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29sbGVjdHMgaW5wdXQgZnJvbSB0aGUgdXNlciBieSBwcm9tcHRpbmcuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0byBwcm9tcHQuXG5cdCAqIEBwYXJhbSBjb21tYW5kSW5wdXQgLSBQcmV2aW91cyBpbnB1dCBmcm9tIGNvbW1hbmQgaWYgdGhlcmUgd2FzIG9uZS5cblx0ICogQHBhcmFtIHBhcnNlZElucHV0IC0gUHJldmlvdXMgcGFyc2VkIGlucHV0IGZyb20gY29tbWFuZCBpZiB0aGVyZSB3YXMgb25lLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGNvbGxlY3QobWVzc2FnZTogTWVzc2FnZSwgY29tbWFuZElucHV0OiBzdHJpbmcgPSBcIlwiLCBwYXJzZWRJbnB1dDogYW55ID0gbnVsbCk6IFByb21pc2U8RmxhZyB8IGFueT4ge1xuXHRcdGNvbnN0IHByb21wdE9wdGlvbnM6IGFueSA9IHt9O1xuXHRcdE9iamVjdC5hc3NpZ24ocHJvbXB0T3B0aW9ucywgdGhpcy5oYW5kbGVyLmFyZ3VtZW50RGVmYXVsdHMucHJvbXB0KTtcblx0XHRPYmplY3QuYXNzaWduKHByb21wdE9wdGlvbnMsIHRoaXMuY29tbWFuZC5hcmd1bWVudERlZmF1bHRzLnByb21wdCk7XG5cdFx0T2JqZWN0LmFzc2lnbihwcm9tcHRPcHRpb25zLCB0aGlzLnByb21wdCB8fCB7fSk7XG5cblx0XHRjb25zdCBpc0luZmluaXRlID0gcHJvbXB0T3B0aW9ucy5pbmZpbml0ZSB8fCAodGhpcy5tYXRjaCA9PT0gQXJndW1lbnRNYXRjaGVzLlNFUEFSQVRFICYmICFjb21tYW5kSW5wdXQpO1xuXHRcdGNvbnN0IGFkZGl0aW9uYWxSZXRyeSA9IE51bWJlcihCb29sZWFuKGNvbW1hbmRJbnB1dCkpO1xuXHRcdGNvbnN0IHZhbHVlcyA9IGlzSW5maW5pdGUgPyBbXSA6IG51bGw7XG5cblx0XHRjb25zdCBnZXRUZXh0ID0gYXN5bmMgKHByb21wdFR5cGUsIHByb21wdGVyLCByZXRyeUNvdW50LCBpbnB1dE1lc3NhZ2UsIGlucHV0UGhyYXNlLCBpbnB1dFBhcnNlZCkgPT4ge1xuXHRcdFx0bGV0IHRleHQgPSBhd2FpdCBVdGlsLmludG9DYWxsYWJsZShwcm9tcHRlcikuY2FsbCh0aGlzLCBtZXNzYWdlLCB7XG5cdFx0XHRcdHJldHJpZXM6IHJldHJ5Q291bnQsXG5cdFx0XHRcdGluZmluaXRlOiBpc0luZmluaXRlLFxuXHRcdFx0XHRtZXNzYWdlOiBpbnB1dE1lc3NhZ2UsXG5cdFx0XHRcdHBocmFzZTogaW5wdXRQaHJhc2UsXG5cdFx0XHRcdGZhaWx1cmU6IGlucHV0UGFyc2VkXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGV4dCkpIHtcblx0XHRcdFx0dGV4dCA9IHRleHQuam9pbihcIlxcblwiKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgbW9kaWZpZXIgPSB7XG5cdFx0XHRcdHN0YXJ0OiBwcm9tcHRPcHRpb25zLm1vZGlmeVN0YXJ0LFxuXHRcdFx0XHRyZXRyeTogcHJvbXB0T3B0aW9ucy5tb2RpZnlSZXRyeSxcblx0XHRcdFx0dGltZW91dDogcHJvbXB0T3B0aW9ucy5tb2RpZnlUaW1lb3V0LFxuXHRcdFx0XHRlbmRlZDogcHJvbXB0T3B0aW9ucy5tb2RpZnlFbmRlZCxcblx0XHRcdFx0Y2FuY2VsOiBwcm9tcHRPcHRpb25zLm1vZGlmeUNhbmNlbFxuXHRcdFx0fVtwcm9tcHRUeXBlXTtcblxuXHRcdFx0aWYgKG1vZGlmaWVyKSB7XG5cdFx0XHRcdHRleHQgPSBhd2FpdCBtb2RpZmllci5jYWxsKHRoaXMsIG1lc3NhZ2UsIHRleHQsIHtcblx0XHRcdFx0XHRyZXRyaWVzOiByZXRyeUNvdW50LFxuXHRcdFx0XHRcdGluZmluaXRlOiBpc0luZmluaXRlLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGlucHV0TWVzc2FnZSxcblx0XHRcdFx0XHRwaHJhc2U6IGlucHV0UGhyYXNlLFxuXHRcdFx0XHRcdGZhaWx1cmU6IGlucHV0UGFyc2VkXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdFx0dGV4dCA9IHRleHQuam9pbihcIlxcblwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGV4dDtcblx0XHR9O1xuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbXBsZXhpdHlcblx0XHRjb25zdCBwcm9tcHRPbmUgPSBhc3luYyAocHJldk1lc3NhZ2UsIHByZXZJbnB1dCwgcHJldlBhcnNlZCwgcmV0cnlDb3VudCkgPT4ge1xuXHRcdFx0bGV0IHNlbnRTdGFydDtcblx0XHRcdC8vIFRoaXMgaXMgZWl0aGVyIGEgcmV0cnkgcHJvbXB0LCB0aGUgc3RhcnQgb2YgYSBub24taW5maW5pdGUsIG9yIHRoZSBzdGFydCBvZiBhbiBpbmZpbml0ZS5cblx0XHRcdGlmIChyZXRyeUNvdW50ICE9PSAxIHx8ICFpc0luZmluaXRlIHx8ICF2YWx1ZXM/Lmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCBwcm9tcHRUeXBlID0gcmV0cnlDb3VudCA9PT0gMSA/IFwic3RhcnRcIiA6IFwicmV0cnlcIjtcblx0XHRcdFx0Y29uc3QgcHJvbXB0ZXIgPSByZXRyeUNvdW50ID09PSAxID8gcHJvbXB0T3B0aW9ucy5zdGFydCA6IHByb21wdE9wdGlvbnMucmV0cnk7XG5cdFx0XHRcdGNvbnN0IHN0YXJ0VGV4dCA9IGF3YWl0IGdldFRleHQocHJvbXB0VHlwZSwgcHJvbXB0ZXIsIHJldHJ5Q291bnQsIHByZXZNZXNzYWdlLCBwcmV2SW5wdXQsIHByZXZQYXJzZWQpO1xuXG5cdFx0XHRcdGlmIChzdGFydFRleHQpIHtcblx0XHRcdFx0XHRzZW50U3RhcnQgPSBhd2FpdCAobWVzc2FnZS51dGlsIHx8IG1lc3NhZ2UuY2hhbm5lbCkuc2VuZChzdGFydFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwgJiYgc2VudFN0YXJ0KSB7XG5cdFx0XHRcdFx0XHRtZXNzYWdlLnV0aWwuc2V0RWRpdGFibGUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsLnNldExhc3RSZXNwb25zZShzZW50U3RhcnQpO1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudFN0YXJ0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGlucHV0O1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aW5wdXQgPSAoXG5cdFx0XHRcdFx0YXdhaXQgbWVzc2FnZS5jaGFubmVsLmF3YWl0TWVzc2FnZXMoe1xuXHRcdFx0XHRcdFx0ZmlsdGVyOiBtID0+IG0uYXV0aG9yLmlkID09PSBtZXNzYWdlLmF1dGhvci5pZCxcblx0XHRcdFx0XHRcdG1heDogMSxcblx0XHRcdFx0XHRcdHRpbWU6IHByb21wdE9wdGlvbnMudGltZSxcblx0XHRcdFx0XHRcdGVycm9yczogW1widGltZVwiXVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCkuZmlyc3QoKTtcblx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2UoaW5wdXQpO1xuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdGNvbnN0IHRpbWVvdXRUZXh0ID0gYXdhaXQgZ2V0VGV4dChcInRpbWVvdXRcIiwgcHJvbXB0T3B0aW9ucy50aW1lb3V0LCByZXRyeUNvdW50LCBwcmV2TWVzc2FnZSwgcHJldklucHV0LCBcIlwiKTtcblx0XHRcdFx0aWYgKHRpbWVvdXRUZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2VudFRpbWVvdXQgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZCh0aW1lb3V0VGV4dCk7XG5cdFx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudFRpbWVvdXQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChwcm9tcHRPcHRpb25zLmJyZWFrb3V0KSB7XG5cdFx0XHRcdGNvbnN0IGxvb2tzTGlrZSA9IGF3YWl0IHRoaXMuaGFuZGxlci5wYXJzZUNvbW1hbmQoaW5wdXQpO1xuXHRcdFx0XHRpZiAobG9va3NMaWtlICYmIGxvb2tzTGlrZS5jb21tYW5kKSByZXR1cm4gRmxhZy5yZXRyeShpbnB1dCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpbnB1dD8uY29udGVudC50b0xvd2VyQ2FzZSgpID09PSBwcm9tcHRPcHRpb25zLmNhbmNlbFdvcmQudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRjb25zdCBjYW5jZWxUZXh0ID0gYXdhaXQgZ2V0VGV4dChcImNhbmNlbFwiLCBwcm9tcHRPcHRpb25zLmNhbmNlbCwgcmV0cnlDb3VudCwgaW5wdXQsIGlucHV0Py5jb250ZW50LCBcImNhbmNlbFwiKTtcblx0XHRcdFx0aWYgKGNhbmNlbFRleHQpIHtcblx0XHRcdFx0XHRjb25zdCBzZW50Q2FuY2VsID0gYXdhaXQgbWVzc2FnZS5jaGFubmVsLnNlbmQoY2FuY2VsVGV4dCk7XG5cdFx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudENhbmNlbCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gRmxhZy5jYW5jZWwoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGlzSW5maW5pdGUgJiYgaW5wdXQ/LmNvbnRlbnQudG9Mb3dlckNhc2UoKSA9PT0gcHJvbXB0T3B0aW9ucy5zdG9wV29yZC50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdGlmICghdmFsdWVzPy5sZW5ndGgpIHJldHVybiBwcm9tcHRPbmUoaW5wdXQsIGlucHV0Py5jb250ZW50LCBudWxsLCByZXRyeUNvdW50ICsgMSk7XG5cdFx0XHRcdHJldHVybiB2YWx1ZXM7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHBhcnNlZFZhbHVlID0gYXdhaXQgdGhpcy5jYXN0KGlucHV0LCBpbnB1dC5jb250ZW50KTtcblx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocGFyc2VkVmFsdWUpKSB7XG5cdFx0XHRcdGlmIChyZXRyeUNvdW50IDw9IHByb21wdE9wdGlvbnMucmV0cmllcykge1xuXHRcdFx0XHRcdHJldHVybiBwcm9tcHRPbmUoaW5wdXQsIGlucHV0Py5jb250ZW50LCBwYXJzZWRWYWx1ZSwgcmV0cnlDb3VudCArIDEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgZW5kZWRUZXh0ID0gYXdhaXQgZ2V0VGV4dChcImVuZGVkXCIsIHByb21wdE9wdGlvbnMuZW5kZWQsIHJldHJ5Q291bnQsIGlucHV0LCBpbnB1dD8uY29udGVudCwgXCJzdG9wXCIpO1xuXHRcdFx0XHRpZiAoZW5kZWRUZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2VudEVuZGVkID0gYXdhaXQgbWVzc2FnZS5jaGFubmVsLnNlbmQoZW5kZWRUZXh0KTtcblx0XHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50RW5kZWQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc0luZmluaXRlKSB7XG5cdFx0XHRcdHZhbHVlcy5wdXNoKHBhcnNlZFZhbHVlKTtcblx0XHRcdFx0Y29uc3QgbGltaXQgPSBwcm9tcHRPcHRpb25zLmxpbWl0O1xuXHRcdFx0XHRpZiAodmFsdWVzLmxlbmd0aCA8IGxpbWl0KSByZXR1cm4gcHJvbXB0T25lKG1lc3NhZ2UsIGlucHV0LmNvbnRlbnQsIHBhcnNlZFZhbHVlLCAxKTtcblxuXHRcdFx0XHRyZXR1cm4gdmFsdWVzO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcGFyc2VkVmFsdWU7XG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlci5hZGRQcm9tcHQobWVzc2FnZS5jaGFubmVsLCBtZXNzYWdlLmF1dGhvcik7XG5cdFx0Y29uc3QgcmV0dXJuVmFsdWUgPSBhd2FpdCBwcm9tcHRPbmUobWVzc2FnZSwgY29tbWFuZElucHV0LCBwYXJzZWRJbnB1dCwgMSArIGFkZGl0aW9uYWxSZXRyeSk7XG5cdFx0aWYgKHRoaXMuaGFuZGxlci5jb21tYW5kVXRpbCAmJiBtZXNzYWdlLnV0aWwpIHtcblx0XHRcdG1lc3NhZ2UudXRpbC5zZXRFZGl0YWJsZShmYWxzZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5oYW5kbGVyLnJlbW92ZVByb21wdChtZXNzYWdlLmNoYW5uZWwsIG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogUHJvY2Vzc2VzIHRoZSB0eXBlIGNhc3RpbmcgYW5kIHByb21wdGluZyBvZiB0aGUgYXJndW1lbnQgZm9yIGEgcGhyYXNlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGhyYXNlIC0gVGhlIHBocmFzZSB0byBwcm9jZXNzLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHByb2Nlc3MobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBjb21tYW5kRGVmcyA9IHRoaXMuY29tbWFuZC5hcmd1bWVudERlZmF1bHRzO1xuXHRcdGNvbnN0IGhhbmRsZXJEZWZzID0gdGhpcy5oYW5kbGVyLmFyZ3VtZW50RGVmYXVsdHM7XG5cdFx0Y29uc3Qgb3B0aW9uYWwgPSBVdGlsLmNob2ljZShcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3Jcblx0XHRcdHRoaXMucHJvbXB0ICYmIHRoaXMucHJvbXB0Lm9wdGlvbmFsLFxuXHRcdFx0Y29tbWFuZERlZnMucHJvbXB0ICYmIGNvbW1hbmREZWZzLnByb21wdC5vcHRpb25hbCxcblx0XHRcdGhhbmRsZXJEZWZzLnByb21wdCAmJiBoYW5kbGVyRGVmcy5wcm9tcHQub3B0aW9uYWxcblx0XHQpO1xuXG5cdFx0Y29uc3QgZG9PdGhlcndpc2UgPSBhc3luYyBmYWlsdXJlID0+IHtcblx0XHRcdGNvbnN0IG90aGVyd2lzZSA9IFV0aWwuY2hvaWNlKHRoaXMub3RoZXJ3aXNlLCBjb21tYW5kRGVmcy5vdGhlcndpc2UsIGhhbmRsZXJEZWZzLm90aGVyd2lzZSk7XG5cblx0XHRcdGNvbnN0IG1vZGlmeU90aGVyd2lzZSA9IFV0aWwuY2hvaWNlKFxuXHRcdFx0XHR0aGlzLm1vZGlmeU90aGVyd2lzZSxcblx0XHRcdFx0Y29tbWFuZERlZnMubW9kaWZ5T3RoZXJ3aXNlLFxuXHRcdFx0XHRoYW5kbGVyRGVmcy5tb2RpZnlPdGhlcndpc2Vcblx0XHRcdCk7XG5cblx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUob3RoZXJ3aXNlKS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHtcblx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlXG5cdFx0XHR9KTtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtb2RpZnlPdGhlcndpc2UpIHtcblx0XHRcdFx0dGV4dCA9IGF3YWl0IG1vZGlmeU90aGVyd2lzZS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHRleHQsIHtcblx0XHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdFx0ZmFpbHVyZVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGV4dCkpIHtcblx0XHRcdFx0XHR0ZXh0ID0gdGV4dC5qb2luKFwiXFxuXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IHNlbnQgPSBhd2FpdCBtZXNzYWdlLmNoYW5uZWwuc2VuZCh0ZXh0KTtcblx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdH07XG5cblx0XHRpZiAoIXBocmFzZSAmJiBvcHRpb25hbCkge1xuXHRcdFx0aWYgKHRoaXMub3RoZXJ3aXNlICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIGRvT3RoZXJ3aXNlKG51bGwpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5kZWZhdWx0KShtZXNzYWdlLCB7XG5cdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0ZmFpbHVyZTogbnVsbFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzID0gYXdhaXQgdGhpcy5jYXN0KG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRpZiAodGhpcy5vdGhlcndpc2UgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gZG9PdGhlcndpc2UocmVzKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMucHJvbXB0ICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY29sbGVjdChtZXNzYWdlLCBwaHJhc2UsIHJlcyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmRlZmF1bHQgPT0gbnVsbCA/IHJlcyA6IFV0aWwuaW50b0NhbGxhYmxlKHRoaXMuZGVmYXVsdCkobWVzc2FnZSwgeyBwaHJhc2UsIGZhaWx1cmU6IHJlcyB9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhc3RzIGEgcGhyYXNlIHRvIHRoaXMgYXJndW1lbnQncyB0eXBlLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIGNhc3QgdG8uXG5cdCAqIEBwYXJhbSByZXNvbHZlciAtIFRoZSB0eXBlIHJlc29sdmVyLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwaHJhc2UgLSBQaHJhc2UgdG8gcHJvY2Vzcy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgY2FzdChcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsXG5cdFx0cmVzb2x2ZXI6IFR5cGVSZXNvbHZlcixcblx0XHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRcdHBocmFzZTogc3RyaW5nXG5cdCk6IFByb21pc2U8YW55PiB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodHlwZSkpIHtcblx0XHRcdGZvciAoY29uc3QgZW50cnkgb2YgdHlwZSkge1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShlbnRyeSkpIHtcblx0XHRcdFx0XHRpZiAoZW50cnkuc29tZSh0ID0+IHQudG9Mb3dlckNhc2UoKSA9PT0gcGhyYXNlLnRvTG93ZXJDYXNlKCkpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZW50cnlbMF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKGVudHJ5LnRvTG93ZXJDYXNlKCkgPT09IHBocmFzZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVudHJ5O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRsZXQgcmVzID0gdHlwZShtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKFV0aWwuaXNQcm9taXNlKHJlcykpIHJlcyA9IGF3YWl0IHJlcztcblx0XHRcdHJldHVybiByZXM7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdGNvbnN0IG1hdGNoID0gcGhyYXNlLm1hdGNoKHR5cGUpO1xuXHRcdFx0aWYgKCFtYXRjaCkgcmV0dXJuIG51bGw7XG5cblx0XHRcdGNvbnN0IG1hdGNoZXMgPSBbXTtcblxuXHRcdFx0aWYgKHR5cGUuZ2xvYmFsKSB7XG5cdFx0XHRcdGxldCBtYXRjaGVkO1xuXG5cdFx0XHRcdHdoaWxlICgobWF0Y2hlZCA9IHR5cGUuZXhlYyhwaHJhc2UpKSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0bWF0Y2hlcy5wdXNoKG1hdGNoZWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IG1hdGNoLCBtYXRjaGVzIH07XG5cdFx0fVxuXG5cdFx0aWYgKHJlc29sdmVyLnR5cGUodHlwZSkpIHtcblx0XHRcdGxldCByZXMgPSByZXNvbHZlci50eXBlKHR5cGUpPy5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UocmVzKSkgcmVzID0gYXdhaXQgcmVzO1xuXHRcdFx0cmV0dXJuIHJlcztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGhyYXNlIHx8IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBpcyB0aGUgbGVmdC10by1yaWdodCBjb21wb3NpdGlvbiBvZiB0aGUgZ2l2ZW4gdHlwZXMuXG5cdCAqIElmIGFueSBvZiB0aGUgdHlwZXMgZmFpbHMsIHRoZSBlbnRpcmUgY29tcG9zaXRpb24gZmFpbHMuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgY29tcG9zZSguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGxldCBhY2MgPSBwaHJhc2U7XG5cdFx0XHRmb3IgKGxldCBlbnRyeSBvZiB0eXBlcykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5ID09PSBcImZ1bmN0aW9uXCIpIGVudHJ5ID0gZW50cnkuYmluZCh0aGlzKTtcblx0XHRcdFx0YWNjID0gYXdhaXQgQXJndW1lbnQuY2FzdChlbnRyeSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBhY2MpO1xuXHRcdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKGFjYykpIHJldHVybiBhY2M7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhY2M7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IGlzIHRoZSBsZWZ0LXRvLXJpZ2h0IGNvbXBvc2l0aW9uIG9mIHRoZSBnaXZlbiB0eXBlcy5cblx0ICogSWYgYW55IG9mIHRoZSB0eXBlcyBmYWlscywgdGhlIGNvbXBvc2l0aW9uIHN0aWxsIGNvbnRpbnVlcyB3aXRoIHRoZSBmYWlsdXJlIHBhc3NlZCBvbi5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBjb21wb3NlV2l0aEZhaWx1cmUoLi4udHlwZXM6IChBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpW10pOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRsZXQgYWNjID0gcGhyYXNlO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGFjYyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgYWNjKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGFjYztcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBzb21ldGhpbmcgaXMgbnVsbCwgdW5kZWZpbmVkLCBvciBhIGZhaWwgZmxhZy5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzRmFpbHVyZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgbnVsbCB8IHVuZGVmaW5lZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pIHtcblx0XHRyZXR1cm4gdmFsdWUgPT0gbnVsbCB8fCBGbGFnLmlzKHZhbHVlLCBcImZhaWxcIik7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAocHJvZHVjdCB0eXBlKS5cblx0ICogT25seSBpbnB1dHMgd2hlcmUgZWFjaCB0eXBlIHJlc29sdmVzIHdpdGggYSBub24tdm9pZCB2YWx1ZSBhcmUgdmFsaWQuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcHJvZHVjdCguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGNvbnN0IHJlc3VsdHMgPSBbXTtcblx0XHRcdGZvciAobGV0IGVudHJ5IG9mIHR5cGVzKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZW50cnkgPT09IFwiZnVuY3Rpb25cIikgZW50cnkgPSBlbnRyeS5iaW5kKHRoaXMpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkgcmV0dXJuIHJlcztcblx0XHRcdFx0cmVzdWx0cy5wdXNoKHJlcyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHRzO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgd2hlcmUgdGhlIHBhcnNlZCB2YWx1ZSBtdXN0IGJlIHdpdGhpbiBhIHJhbmdlLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIG1pbiAtIE1pbmltdW0gdmFsdWUuXG5cdCAqIEBwYXJhbSBtYXggLSBNYXhpbXVtIHZhbHVlLlxuXHQgKiBAcGFyYW0gaW5jbHVzaXZlIC0gV2hldGhlciBvciBub3QgdG8gYmUgaW5jbHVzaXZlIG9uIHRoZSB1cHBlciBib3VuZC5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcmFuZ2UoXG5cdFx0dHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLFxuXHRcdG1pbjogbnVtYmVyLFxuXHRcdG1heDogbnVtYmVyLFxuXHRcdGluY2x1c2l2ZSA9IGZhbHNlXG5cdCk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIEFyZ3VtZW50LnZhbGlkYXRlKHR5cGUsIChtc2csIHAsIHgpID0+IHtcblx0XHRcdGNvbnN0IG8gPVxuXHRcdFx0XHR0eXBlb2YgeCA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgeCA9PT0gXCJiaWdpbnRcIiA/IHggOiB4Lmxlbmd0aCAhPSBudWxsID8geC5sZW5ndGggOiB4LnNpemUgIT0gbnVsbCA/IHguc2l6ZSA6IHg7XG5cblx0XHRcdHJldHVybiBvID49IG1pbiAmJiAoaW5jbHVzaXZlID8gbyA8PSBtYXggOiBvIDwgbWF4KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IHBhcnNlcyBhcyBub3JtYWwgYnV0IGFsc28gdGFncyBpdCB3aXRoIHNvbWUgZGF0YS5cblx0ICogUmVzdWx0IGlzIGluIGFuIG9iamVjdCBgeyB0YWcsIHZhbHVlIH1gIGFuZCB3cmFwcGVkIGluIGBGbGFnLmZhaWxgIHdoZW4gZmFpbGVkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHRhZyAtIFRhZyB0byBhZGQuIERlZmF1bHRzIHRvIHRoZSBgdHlwZWAgYXJndW1lbnQsIHNvIHVzZWZ1bCBpZiBpdCBpcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGFnZ2VkKHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlciwgdGFnOiBhbnkgPSB0eXBlKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHR5cGUgPSB0eXBlLmJpbmQodGhpcyk7XG5cdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KHR5cGUsIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkge1xuXHRcdFx0XHRyZXR1cm4gRmxhZy5mYWlsKHsgdGFnLCB2YWx1ZTogcmVzIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyB0YWcsIHZhbHVlOiByZXMgfTtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIGZyb20gbXVsdGlwbGUgdHlwZXMgKHVuaW9uIHR5cGUpLlxuXHQgKiBUaGUgZmlyc3QgdHlwZSB0aGF0IHJlc29sdmVzIHRvIGEgbm9uLXZvaWQgdmFsdWUgaXMgdXNlZC5cblx0ICogRWFjaCB0eXBlIHdpbGwgYWxzbyBiZSB0YWdnZWQgdXNpbmcgYHRhZ2dlZGAgd2l0aCB0aGVtc2VsdmVzLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHRhZ2dlZFVuaW9uKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0ZW50cnkgPSBBcmd1bWVudC50YWdnZWQoZW50cnkpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRcdGlmICghQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBwYXJzZXMgYXMgbm9ybWFsIGJ1dCBhbHNvIHRhZ3MgaXQgd2l0aCBzb21lIGRhdGEgYW5kIGNhcnJpZXMgdGhlIG9yaWdpbmFsIGlucHV0LlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IHRhZywgaW5wdXQsIHZhbHVlIH1gIGFuZCB3cmFwcGVkIGluIGBGbGFnLmZhaWxgIHdoZW4gZmFpbGVkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHRhZyAtIFRhZyB0byBhZGQuIERlZmF1bHRzIHRvIHRoZSBgdHlwZWAgYXJndW1lbnQsIHNvIHVzZWZ1bCBpZiBpdCBpcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGFnZ2VkV2l0aElucHV0KHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlciwgdGFnOiBhbnkgPSB0eXBlKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHR5cGUgPSB0eXBlLmJpbmQodGhpcyk7XG5cdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KHR5cGUsIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdGlmIChBcmd1bWVudC5pc0ZhaWx1cmUocmVzKSkge1xuXHRcdFx0XHRyZXR1cm4gRmxhZy5mYWlsKHsgdGFnLCBpbnB1dDogcGhyYXNlLCB2YWx1ZTogcmVzIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyB0YWcsIGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfTtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIGZyb20gbXVsdGlwbGUgdHlwZXMgKHVuaW9uIHR5cGUpLlxuXHQgKiBUaGUgZmlyc3QgdHlwZSB0aGF0IHJlc29sdmVzIHRvIGEgbm9uLXZvaWQgdmFsdWUgaXMgdXNlZC5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB1bmlvbiguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGZvciAobGV0IGVudHJ5IG9mIHR5cGVzKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZW50cnkgPT09IFwiZnVuY3Rpb25cIikgZW50cnkgPSBlbnRyeS5iaW5kKHRoaXMpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRcdGlmICghQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgd2l0aCBleHRyYSB2YWxpZGF0aW9uLlxuXHQgKiBJZiB0aGUgcHJlZGljYXRlIGlzIG5vdCB0cnVlLCB0aGUgdmFsdWUgaXMgY29uc2lkZXJlZCBpbnZhbGlkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHByZWRpY2F0ZSAtIFRoZSBwcmVkaWNhdGUgZnVuY3Rpb24uXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHZhbGlkYXRlKHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlciwgcHJlZGljYXRlOiBQYXJzZWRWYWx1ZVByZWRpY2F0ZSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbihtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdCh0eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHRpZiAoIXByZWRpY2F0ZS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBocmFzZSwgcmVzKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBwYXJzZXMgYXMgbm9ybWFsIGJ1dCBhbHNvIGNhcnJpZXMgdGhlIG9yaWdpbmFsIGlucHV0LlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IGlucHV0LCB2YWx1ZSB9YCBhbmQgd3JhcHBlZCBpbiBgRmxhZy5mYWlsYCB3aGVuIGZhaWxlZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHdpdGhJbnB1dCh0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4obWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikgdHlwZSA9IHR5cGUuYmluZCh0aGlzKTtcblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QodHlwZSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRcdHJldHVybiBGbGFnLmZhaWwoeyBpbnB1dDogcGhyYXNlLCB2YWx1ZTogcmVzIH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4geyBpbnB1dDogcGhyYXNlLCB2YWx1ZTogcmVzIH07XG5cdFx0fTtcblx0fVxufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGhvdyBhbiBhcmd1bWVudCBwYXJzZXMgdGV4dC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudE9wdGlvbnMge1xuXHQvKipcblx0ICogRGVmYXVsdCB2YWx1ZSBpZiBubyBpbnB1dCBvciBkaWQgbm90IGNhc3QgY29ycmVjdGx5LlxuXHQgKiBJZiB1c2luZyBhIGZsYWcgbWF0Y2gsIHNldHRpbmcgdGhlIGRlZmF1bHQgdmFsdWUgdG8gYSBub24tdm9pZCB2YWx1ZSBpbnZlcnNlcyB0aGUgcmVzdWx0LlxuXHQgKi9cblx0ZGVmYXVsdD86IERlZmF1bHRWYWx1ZVN1cHBsaWVyIHwgYW55O1xuXG5cdC8qKiBUaGUgZGVzY3JpcHRpb24gb2YgdGhlIGFyZ3VtZW50ICovXG5cdGRlc2NyaXB0aW9uPzogc3RyaW5nIHwgYW55IHwgYW55W107XG5cblx0LyoqIFRoZSBzdHJpbmcocykgdG8gdXNlIGFzIHRoZSBmbGFnIGZvciBmbGFnIG9yIG9wdGlvbiBtYXRjaC4gKi9cblx0ZmxhZz86IHN0cmluZyB8IHN0cmluZ1tdO1xuXG5cdC8qKiAgSUQgb2YgdGhlIGFyZ3VtZW50IGZvciB1c2UgaW4gdGhlIGFyZ3Mgb2JqZWN0LiBUaGlzIGRvZXMgbm90aGluZyBpbnNpZGUgYW4gQXJndW1lbnRHZW5lcmF0b3IuICovXG5cdGlkPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBJbmRleCBvZiBwaHJhc2UgdG8gc3RhcnQgZnJvbS4gQXBwbGljYWJsZSB0byBwaHJhc2UsIHRleHQsIGNvbnRlbnQsIHJlc3QsIG9yIHNlcGFyYXRlIG1hdGNoIG9ubHkuXG5cdCAqIElnbm9yZWQgd2hlbiB1c2VkIHdpdGggdGhlIHVub3JkZXJlZCBvcHRpb24uXG5cdCAqL1xuXHRpbmRleD86IG51bWJlcjtcblxuXHQvKipcblx0ICogQW1vdW50IG9mIHBocmFzZXMgdG8gbWF0Y2ggd2hlbiBtYXRjaGluZyBtb3JlIHRoYW4gb25lLlxuXHQgKiBBcHBsaWNhYmxlIHRvIHRleHQsIGNvbnRlbnQsIHJlc3QsIG9yIHNlcGFyYXRlIG1hdGNoIG9ubHkuXG5cdCAqIERlZmF1bHRzIHRvIGluZmluaXR5LlxuXHQgKi9cblx0bGltaXQ/OiBudW1iZXI7XG5cblx0LyoqIE1ldGhvZCB0byBtYXRjaCB0ZXh0LiBEZWZhdWx0cyB0byAncGhyYXNlJy4gKi9cblx0bWF0Y2g/OiBBcmd1bWVudE1hdGNoO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgb3RoZXJ3aXNlIGNvbnRlbnQuICovXG5cdG1vZGlmeU90aGVyd2lzZT86IE90aGVyd2lzZUNvbnRlbnRNb2RpZmllcjtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgdG8gaGF2ZSBmbGFncyBwcm9jZXNzIG11bHRpcGxlIGlucHV0cy5cblx0ICogRm9yIG9wdGlvbiBmbGFncywgdGhpcyB3b3JrcyBsaWtlIHRoZSBzZXBhcmF0ZSBtYXRjaDsgdGhlIGxpbWl0IG9wdGlvbiB3aWxsIGFsc28gd29yayBoZXJlLlxuXHQgKiBGb3IgZmxhZ3MsIHRoaXMgd2lsbCBjb3VudCB0aGUgbnVtYmVyIG9mIG9jY3VycmVuY2VzLlxuXHQgKi9cblx0bXVsdGlwbGVGbGFncz86IGJvb2xlYW47XG5cblx0LyoqIFRleHQgc2VudCBpZiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLiBUaGlzIG92ZXJyaWRlcyB0aGUgYGRlZmF1bHRgIG9wdGlvbiBhbmQgYWxsIHByb21wdCBvcHRpb25zLiAqL1xuXHRvdGhlcndpc2U/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgT3RoZXJ3aXNlQ29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBQcm9tcHQgb3B0aW9ucyBmb3Igd2hlbiB1c2VyIGRvZXMgbm90IHByb3ZpZGUgaW5wdXQuICovXG5cdHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucyB8IGJvb2xlYW47XG5cblx0LyoqIFR5cGUgdG8gY2FzdCB0by4gKi9cblx0dHlwZT86IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcjtcblxuXHQvKipcblx0ICogTWFya3MgdGhlIGFyZ3VtZW50IGFzIHVub3JkZXJlZC5cblx0ICogRWFjaCBwaHJhc2UgaXMgZXZhbHVhdGVkIGluIG9yZGVyIHVudGlsIG9uZSBtYXRjaGVzIChubyBpbnB1dCBhdCBhbGwgbWVhbnMgbm8gZXZhbHVhdGlvbikuXG5cdCAqIFBhc3NpbmcgaW4gYSBudW1iZXIgZm9yY2VzIGV2YWx1YXRpb24gZnJvbSB0aGF0IGluZGV4IG9ud2FyZHMuXG5cdCAqIFBhc3NpbmcgaW4gYW4gYXJyYXkgb2YgbnVtYmVycyBmb3JjZXMgZXZhbHVhdGlvbiBvbiB0aG9zZSBpbmRpY2VzIG9ubHkuXG5cdCAqIElmIHRoZXJlIGlzIGEgbWF0Y2gsIHRoYXQgaW5kZXggaXMgY29uc2lkZXJlZCB1c2VkIGFuZCBmdXR1cmUgdW5vcmRlcmVkIGFyZ3Mgd2lsbCBub3QgY2hlY2sgdGhhdCBpbmRleCBhZ2Fpbi5cblx0ICogSWYgdGhlcmUgaXMgbm8gbWF0Y2gsIHRoZW4gdGhlIHByb21wdGluZyBvciBkZWZhdWx0IHZhbHVlIGlzIHVzZWQuXG5cdCAqIEFwcGxpY2FibGUgdG8gcGhyYXNlIG1hdGNoIG9ubHkuXG5cdCAqL1xuXHR1bm9yZGVyZWQ/OiBib29sZWFuIHwgbnVtYmVyIHwgbnVtYmVyW107XG59XG5cbi8qKlxuICogRGF0YSBwYXNzZWQgdG8gYXJndW1lbnQgcHJvbXB0IGZ1bmN0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFByb21wdERhdGEge1xuXHQvKiogV2hldGhlciB0aGUgcHJvbXB0IGlzIGluZmluaXRlIG9yIG5vdC4gKi9cblx0aW5maW5pdGU6IGJvb2xlYW47XG5cblx0LyoqIFRoZSBtZXNzYWdlIHRoYXQgY2F1c2VkIHRoZSBwcm9tcHQuICovXG5cdG1lc3NhZ2U6IE1lc3NhZ2U7XG5cblx0LyoqIEFtb3VudCBvZiByZXRyaWVzIHNvIGZhci4gKi9cblx0cmV0cmllczogbnVtYmVyO1xuXG5cdC8qKiBUaGUgaW5wdXQgcGhyYXNlIHRoYXQgY2F1c2VkIHRoZSBwcm9tcHQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZy4gKi9cblx0cGhyYXNlOiBzdHJpbmc7XG5cblx0LyoqIFRoZSB2YWx1ZSB0aGF0IGZhaWxlZCBpZiB0aGVyZSB3YXMgb25lLCBvdGhlcndpc2UgbnVsbC4gKi9cblx0ZmFpbHVyZTogdm9pZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pO1xufVxuXG4vKipcbiAqIEEgcHJvbXB0IHRvIHJ1biBpZiB0aGUgdXNlciBkaWQgbm90IGlucHV0IHRoZSBhcmd1bWVudCBjb3JyZWN0bHkuXG4gKiBDYW4gb25seSBiZSB1c2VkIGlmIHRoZXJlIGlzIG5vdCBhIGRlZmF1bHQgdmFsdWUgKHVubGVzcyBvcHRpb25hbCBpcyB0cnVlKS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBcmd1bWVudFByb21wdE9wdGlvbnMge1xuXHQvKipcblx0ICogV2hlbmV2ZXIgYW4gaW5wdXQgbWF0Y2hlcyB0aGUgZm9ybWF0IG9mIGEgY29tbWFuZCwgdGhpcyBvcHRpb24gY29udHJvbHMgd2hldGhlciBvciBub3QgdG8gY2FuY2VsIHRoaXMgY29tbWFuZCBhbmQgcnVuIHRoYXQgY29tbWFuZC5cblx0ICogVGhlIGNvbW1hbmQgdG8gYmUgcnVuIG1heSBiZSB0aGUgc2FtZSBjb21tYW5kIG9yIHNvbWUgb3RoZXIgY29tbWFuZC5cblx0ICogRGVmYXVsdHMgdG8gdHJ1ZSxcblx0ICovXG5cdGJyZWFrb3V0PzogYm9vbGVhbjtcblxuXHQvKiogVGV4dCBzZW50IG9uIGNhbmNlbGxhdGlvbiBvZiBjb21tYW5kLiAqL1xuXHRjYW5jZWw/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBXb3JkIHRvIHVzZSBmb3IgY2FuY2VsbGluZyB0aGUgY29tbWFuZC4gRGVmYXVsdHMgdG8gJ2NhbmNlbCcuICovXG5cdGNhbmNlbFdvcmQ/OiBzdHJpbmc7XG5cblx0LyoqIFRleHQgc2VudCBvbiBhbW91bnQgb2YgdHJpZXMgcmVhY2hpbmcgdGhlIG1heC4gKi9cblx0ZW5kZWQ/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKlxuXHQgKiBQcm9tcHRzIGZvcmV2ZXIgdW50aWwgdGhlIHN0b3Agd29yZCwgY2FuY2VsIHdvcmQsIHRpbWUgbGltaXQsIG9yIHJldHJ5IGxpbWl0LlxuXHQgKiBOb3RlIHRoYXQgdGhlIHJldHJ5IGNvdW50IHJlc2V0cyBiYWNrIHRvIG9uZSBvbiBlYWNoIHZhbGlkIGVudHJ5LlxuXHQgKiBUaGUgZmluYWwgZXZhbHVhdGVkIGFyZ3VtZW50IHdpbGwgYmUgYW4gYXJyYXkgb2YgdGhlIGlucHV0cy5cblx0ICogRGVmYXVsdHMgdG8gZmFsc2UuXG5cdCAqL1xuXHRpbmZpbml0ZT86IGJvb2xlYW47XG5cblx0LyoqIEFtb3VudCBvZiBpbnB1dHMgYWxsb3dlZCBmb3IgYW4gaW5maW5pdGUgcHJvbXB0IGJlZm9yZSBmaW5pc2hpbmcuIERlZmF1bHRzIHRvIEluZmluaXR5LiAqL1xuXHRsaW1pdD86IG51bWJlcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IGNhbmNlbCBtZXNzYWdlcy4gKi9cblx0bW9kaWZ5Q2FuY2VsPzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgb3V0IG9mIHRyaWVzIG1lc3NhZ2VzLiAqL1xuXHRtb2RpZnlFbmRlZD86IFByb21wdENvbnRlbnRNb2RpZmllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IHJldHJ5IHByb21wdHMuICovXG5cdG1vZGlmeVJldHJ5PzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgc3RhcnQgcHJvbXB0cy4gKi9cblx0bW9kaWZ5U3RhcnQ/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSB0aW1lb3V0IG1lc3NhZ2VzLiAqL1xuXHRtb2RpZnlUaW1lb3V0PzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBQcm9tcHRzIG9ubHkgd2hlbiBhcmd1bWVudCBpcyBwcm92aWRlZCBidXQgd2FzIG5vdCBvZiB0aGUgcmlnaHQgdHlwZS4gRGVmYXVsdHMgdG8gZmFsc2UuICovXG5cdG9wdGlvbmFsPzogYm9vbGVhbjtcblxuXHQvKiogQW1vdW50IG9mIHJldHJpZXMgYWxsb3dlZC4gRGVmYXVsdHMgdG8gMS4gKi9cblx0cmV0cmllcz86IG51bWJlcjtcblxuXHQvKiogVGV4dCBzZW50IG9uIGEgcmV0cnkgKGZhaWx1cmUgdG8gY2FzdCB0eXBlKS4gKi9cblx0cmV0cnk/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBUZXh0IHNlbnQgb24gc3RhcnQgb2YgcHJvbXB0LiAqL1xuXHRzdGFydD86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9tcHRDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIFdvcmQgdG8gdXNlIGZvciBlbmRpbmcgaW5maW5pdGUgcHJvbXB0cy4gRGVmYXVsdHMgdG8gJ3N0b3AnLiAqL1xuXHRzdG9wV29yZD86IHN0cmluZztcblxuXHQvKiogVGltZSB0byB3YWl0IGZvciBpbnB1dC4gRGVmYXVsdHMgdG8gMzAwMDAuICovXG5cdHRpbWU/OiBudW1iZXI7XG5cblx0LyoqIFRleHQgc2VudCBvbiBjb2xsZWN0b3IgdGltZSBvdXQuICovXG5cdHRpbWVvdXQ/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xufVxuXG4vKipcbiAqIFRoZSBtZXRob2QgdG8gbWF0Y2ggYXJndW1lbnRzIGZyb20gdGV4dC5cbiAqIC0gYHBocmFzZWAgbWF0Y2hlcyBieSB0aGUgb3JkZXIgb2YgdGhlIHBocmFzZXMgaW5wdXR0ZWQuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIC0gYGZsYWdgIG1hdGNoZXMgcGhyYXNlcyB0aGF0IGFyZSB0aGUgc2FtZSBhcyBpdHMgZmxhZy5cbiAqIFRoZSBldmFsdWF0ZWQgYXJndW1lbnQgaXMgZWl0aGVyIHRydWUgb3IgZmFsc2UuXG4gKiAtIGBvcHRpb25gIG1hdGNoZXMgcGhyYXNlcyB0aGF0IHN0YXJ0cyB3aXRoIHRoZSBmbGFnLlxuICogVGhlIHBocmFzZSBhZnRlciB0aGUgZmxhZyBpcyB0aGUgZXZhbHVhdGVkIGFyZ3VtZW50LlxuICogLSBgcmVzdGAgbWF0Y2hlcyB0aGUgcmVzdCBvZiB0aGUgcGhyYXNlcy5cbiAqIEl0IGlnbm9yZXMgcGhyYXNlcyB0aGF0IG1hdGNoZXMgYSBmbGFnLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYHNlcGFyYXRlYCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSBwaHJhc2VzIGFuZCBwcm9jZXNzZXMgZWFjaCBpbmRpdmlkdWFsbHkuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIC0gYHRleHRgIG1hdGNoZXMgdGhlIGVudGlyZSB0ZXh0LCBleGNlcHQgZm9yIHRoZSBjb21tYW5kLlxuICogSXQgaWdub3JlcyBwaHJhc2VzIHRoYXQgbWF0Y2hlcyBhIGZsYWcuXG4gKiBJdCBwcmVzZXJ2ZXMgdGhlIG9yaWdpbmFsIHdoaXRlc3BhY2UgYmV0d2VlbiBwaHJhc2VzIGFuZCB0aGUgcXVvdGVzIGFyb3VuZCBwaHJhc2VzLlxuICogLSBgY29udGVudGAgbWF0Y2hlcyB0aGUgZW50aXJlIHRleHQgYXMgaXQgd2FzIGlucHV0dGVkLCBleGNlcHQgZm9yIHRoZSBjb21tYW5kLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYHJlc3RDb250ZW50YCBtYXRjaGVzIHRoZSByZXN0IG9mIHRoZSB0ZXh0IGFzIGl0IHdhcyBpbnB1dHRlZC5cbiAqIEl0IHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgd2hpdGVzcGFjZSBiZXR3ZWVuIHBocmFzZXMgYW5kIHRoZSBxdW90ZXMgYXJvdW5kIHBocmFzZXMuXG4gKiAtIGBub25lYCBtYXRjaGVzIG5vdGhpbmcgYXQgYWxsIGFuZCBhbiBlbXB0eSBzdHJpbmcgd2lsbCBiZSB1c2VkIGZvciB0eXBlIG9wZXJhdGlvbnMuXG4gKi9cbmV4cG9ydCB0eXBlIEFyZ3VtZW50TWF0Y2ggPVxuXHR8IFwicGhyYXNlXCJcblx0fCBcImZsYWdcIlxuXHR8IFwib3B0aW9uXCJcblx0fCBcInJlc3RcIlxuXHR8IFwic2VwYXJhdGVcIlxuXHR8IFwidGV4dFwiXG5cdHwgXCJjb250ZW50XCJcblx0fCBcInJlc3RDb250ZW50XCJcblx0fCBcIm5vbmVcIjtcblxuLyoqXG4gKiBUaGUgdHlwZSB0aGF0IHRoZSBhcmd1bWVudCBzaG91bGQgYmUgY2FzdCB0by5cbiAqIC0gYHN0cmluZ2AgZG9lcyBub3QgY2FzdCB0byBhbnkgdHlwZS5cbiAqIC0gYGxvd2VyY2FzZWAgbWFrZXMgdGhlIGlucHV0IGxvd2VyY2FzZS5cbiAqIC0gYHVwcGVyY2FzZWAgbWFrZXMgdGhlIGlucHV0IHVwcGVyY2FzZS5cbiAqIC0gYGNoYXJDb2Rlc2AgdHJhbnNmb3JtcyB0aGUgaW5wdXQgdG8gYW4gYXJyYXkgb2YgY2hhciBjb2Rlcy5cbiAqIC0gYG51bWJlcmAgY2FzdHMgdG8gYSBudW1iZXIuXG4gKiAtIGBpbnRlZ2VyYCBjYXN0cyB0byBhbiBpbnRlZ2VyLlxuICogLSBgYmlnaW50YCBjYXN0cyB0byBhIGJpZyBpbnRlZ2VyLlxuICogLSBgdXJsYCBjYXN0cyB0byBhbiBgVVJMYCBvYmplY3QuXG4gKiAtIGBkYXRlYCBjYXN0cyB0byBhIGBEYXRlYCBvYmplY3QuXG4gKiAtIGBjb2xvcmAgY2FzdHMgYSBoZXggY29kZSB0byBhbiBpbnRlZ2VyLlxuICogLSBgY29tbWFuZEFsaWFzYCB0cmllcyB0byByZXNvbHZlIHRvIGEgY29tbWFuZCBmcm9tIGFuIGFsaWFzLlxuICogLSBgY29tbWFuZGAgbWF0Y2hlcyB0aGUgSUQgb2YgYSBjb21tYW5kLlxuICogLSBgaW5oaWJpdG9yYCBtYXRjaGVzIHRoZSBJRCBvZiBhbiBpbmhpYml0b3IuXG4gKiAtIGBsaXN0ZW5lcmAgbWF0Y2hlcyB0aGUgSUQgb2YgYSBsaXN0ZW5lci5cbiAqXG4gKiBQb3NzaWJsZSBEaXNjb3JkLXJlbGF0ZWQgdHlwZXMuXG4gKiBUaGVzZSB0eXBlcyBjYW4gYmUgcGx1cmFsIChhZGQgYW4gJ3MnIHRvIHRoZSBlbmQpIGFuZCBhIGNvbGxlY3Rpb24gb2YgbWF0Y2hpbmcgb2JqZWN0cyB3aWxsIGJlIHVzZWQuXG4gKiAtIGB1c2VyYCB0cmllcyB0byByZXNvbHZlIHRvIGEgdXNlci5cbiAqIC0gYG1lbWJlcmAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIG1lbWJlci5cbiAqIC0gYHJlbGV2YW50YCB0cmllcyB0byByZXNvbHZlIHRvIGEgcmVsZXZhbnQgdXNlciwgd29ya3MgaW4gYm90aCBndWlsZHMgYW5kIERNcy5cbiAqIC0gYGNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBjaGFubmVsLlxuICogLSBgdGV4dENoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB0ZXh0IGNoYW5uZWwuXG4gKiAtIGB2b2ljZUNoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSB2b2ljZSBjaGFubmVsLlxuICogLSBgc3RhZ2VDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIHRvIGEgc3RhZ2UgY2hhbm5lbC5cbiAqIC0gYHRocmVhZENoYW5uZWxgIHRyaWVzIHRvIHJlc29sdmUgYSB0aHJlYWQgY2hhbm5lbC5cbiAqIC0gYHJvbGVgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSByb2xlLlxuICogLSBgZW1vamlgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBjdXN0b20gZW1vamkuXG4gKiAtIGBndWlsZGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIGd1aWxkLlxuICpcbiAqIE90aGVyIERpc2NvcmQtcmVsYXRlZCB0eXBlczpcbiAqIC0gYG1lc3NhZ2VgIHRyaWVzIHRvIGZldGNoIGEgbWVzc2FnZSBmcm9tIGFuIElEIHdpdGhpbiB0aGUgY2hhbm5lbC5cbiAqIC0gYGd1aWxkTWVzc2FnZWAgdHJpZXMgdG8gZmV0Y2ggYSBtZXNzYWdlIGZyb20gYW4gSUQgd2l0aGluIHRoZSBndWlsZC5cbiAqIC0gYHJlbGV2YW50TWVzc2FnZWAgaXMgYSBjb21iaW5hdGlvbiBvZiB0aGUgYWJvdmUsIHdvcmtzIGluIGJvdGggZ3VpbGRzIGFuZCBETXMuXG4gKiAtIGBpbnZpdGVgIHRyaWVzIHRvIGZldGNoIGFuIGludml0ZSBvYmplY3QgZnJvbSBhIGxpbmsuXG4gKiAtIGB1c2VyTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSB1c2VyLlxuICogLSBgbWVtYmVyTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSBndWlsZCBtZW1iZXIuXG4gKiAtIGBjaGFubmVsTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYSBjaGFubmVsLlxuICogLSBgcm9sZU1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGEgcm9sZS5cbiAqIC0gYGVtb2ppTWVudGlvbmAgbWF0Y2hlcyBhIG1lbnRpb24gb2YgYW4gZW1vamkuXG4gKlxuICogQW4gYXJyYXkgb2Ygc3RyaW5ncyBjYW4gYmUgdXNlZCB0byByZXN0cmljdCBpbnB1dCB0byBvbmx5IHRob3NlIHN0cmluZ3MsIGNhc2UgaW5zZW5zaXRpdmUuXG4gKiBUaGUgYXJyYXkgY2FuIGFsc28gY29udGFpbiBhbiBpbm5lciBhcnJheSBvZiBzdHJpbmdzLCBmb3IgYWxpYXNlcy5cbiAqIElmIHNvLCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5IHdpbGwgYmUgdXNlZCBhcyB0aGUgZmluYWwgYXJndW1lbnQuXG4gKlxuICogQSByZWd1bGFyIGV4cHJlc3Npb24gY2FuIGFsc28gYmUgdXNlZC5cbiAqIFRoZSBldmFsdWF0ZWQgYXJndW1lbnQgd2lsbCBiZSBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgYG1hdGNoYCBhbmQgYG1hdGNoZXNgIGlmIGdsb2JhbC5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRUeXBlID1cblx0fCBcInN0cmluZ1wiXG5cdHwgXCJsb3dlcmNhc2VcIlxuXHR8IFwidXBwZXJjYXNlXCJcblx0fCBcImNoYXJDb2Rlc1wiXG5cdHwgXCJudW1iZXJcIlxuXHR8IFwiaW50ZWdlclwiXG5cdHwgXCJiaWdpbnRcIlxuXHR8IFwiZW1vamludFwiXG5cdHwgXCJ1cmxcIlxuXHR8IFwiZGF0ZVwiXG5cdHwgXCJjb2xvclwiXG5cdHwgXCJ1c2VyXCJcblx0fCBcInVzZXJzXCJcblx0fCBcIm1lbWJlclwiXG5cdHwgXCJtZW1iZXJzXCJcblx0fCBcInJlbGV2YW50XCJcblx0fCBcInJlbGV2YW50c1wiXG5cdHwgXCJjaGFubmVsXCJcblx0fCBcImNoYW5uZWxzXCJcblx0fCBcInRleHRDaGFubmVsXCJcblx0fCBcInRleHRDaGFubmVsc1wiXG5cdHwgXCJ2b2ljZUNoYW5uZWxcIlxuXHR8IFwidm9pY2VDaGFubmVsc1wiXG5cdHwgXCJjYXRlZ29yeUNoYW5uZWxcIlxuXHR8IFwiY2F0ZWdvcnlDaGFubmVsc1wiXG5cdHwgXCJuZXdzQ2hhbm5lbFwiXG5cdHwgXCJuZXdzQ2hhbm5lbHNcIlxuXHR8IFwic3RvcmVDaGFubmVsXCJcblx0fCBcInN0b3JlQ2hhbm5lbHNcIlxuXHR8IFwic3RhZ2VDaGFubmVsXCJcblx0fCBcInN0YWdlQ2hhbm5lbHNcIlxuXHR8IFwidGhyZWFkQ2hhbm5lbFwiXG5cdHwgXCJ0aHJlYWRDaGFubmVsc1wiXG5cdHwgXCJyb2xlXCJcblx0fCBcInJvbGVzXCJcblx0fCBcImVtb2ppXCJcblx0fCBcImVtb2ppc1wiXG5cdHwgXCJndWlsZFwiXG5cdHwgXCJndWlsZHNcIlxuXHR8IFwibWVzc2FnZVwiXG5cdHwgXCJndWlsZE1lc3NhZ2VcIlxuXHR8IFwicmVsZXZhbnRNZXNzYWdlXCJcblx0fCBcImludml0ZVwiXG5cdHwgXCJ1c2VyTWVudGlvblwiXG5cdHwgXCJtZW1iZXJNZW50aW9uXCJcblx0fCBcImNoYW5uZWxNZW50aW9uXCJcblx0fCBcInJvbGVNZW50aW9uXCJcblx0fCBcImVtb2ppTWVudGlvblwiXG5cdHwgXCJjb21tYW5kQWxpYXNcIlxuXHR8IFwiY29tbWFuZFwiXG5cdHwgXCJpbmhpYml0b3JcIlxuXHR8IFwibGlzdGVuZXJcIlxuXHR8IChzdHJpbmcgfCBzdHJpbmdbXSlbXVxuXHR8IFJlZ0V4cFxuXHR8IHN0cmluZztcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGZvciBwcm9jZXNzaW5nIHVzZXIgaW5wdXQgdG8gdXNlIGFzIGFuIGFyZ3VtZW50LlxuICogQSB2b2lkIHJldHVybiB2YWx1ZSB3aWxsIHVzZSB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhlIGFyZ3VtZW50IG9yIHN0YXJ0IGEgcHJvbXB0LlxuICogQW55IG90aGVyIHRydXRoeSByZXR1cm4gdmFsdWUgd2lsbCBiZSB1c2VkIGFzIHRoZSBldmFsdWF0ZWQgYXJndW1lbnQuXG4gKiBJZiByZXR1cm5pbmcgYSBQcm9taXNlLCB0aGUgcmVzb2x2ZWQgdmFsdWUgd2lsbCBnbyB0aHJvdWdoIHRoZSBhYm92ZSBzdGVwcy5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBwaHJhc2UgLSBUaGUgdXNlciBpbnB1dC5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRUeXBlQ2FzdGVyID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKSA9PiBhbnk7XG5cbi8qKlxuICogQSBmdW5jdGlvbiBmb3IgcHJvY2Vzc2luZyBzb21lIHZhbHVlIHRvIHVzZSBhcyBhbiBhcmd1bWVudC5cbiAqIFRoaXMgaXMgbWFpbmx5IHVzZWQgaW4gY29tcG9zaW5nIGFyZ3VtZW50IHR5cGVzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHZhbHVlIC0gU29tZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IHR5cGUgQXJndW1lbnRUeXBlQ2FzdGVyXyA9IChtZXNzYWdlOiBNZXNzYWdlLCB2YWx1ZTogYW55KSA9PiBhbnk7XG5cbi8qKlxuICogRGF0YSBwYXNzZWQgdG8gZnVuY3Rpb25zIHRoYXQgcnVuIHdoZW4gdGhpbmdzIGZhaWxlZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWlsdXJlRGF0YSB7XG5cdC8qKiBUaGUgaW5wdXQgcGhyYXNlIHRoYXQgZmFpbGVkIGlmIHRoZXJlIHdhcyBvbmUsIG90aGVyd2lzZSBhbiBlbXB0eSBzdHJpbmcuICovXG5cdHBocmFzZTogc3RyaW5nO1xuXG5cdC8qKiBUaGUgdmFsdWUgdGhhdCBmYWlsZWQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIG51bGwuICovXG5cdGZhaWx1cmU6IHZvaWQgfCAoRmxhZyAmIHsgdmFsdWU6IGFueSB9KTtcbn1cblxuLyoqXG4gKiBEZWZhdWx0cyBmb3IgYXJndW1lbnQgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWZhdWx0QXJndW1lbnRPcHRpb25zIHtcblx0LyoqIERlZmF1bHQgcHJvbXB0IG9wdGlvbnMuICovXG5cdHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucztcblxuXHQvKiogRGVmYXVsdCB0ZXh0IHNlbnQgaWYgYXJndW1lbnQgcGFyc2luZyBmYWlscy4gKi9cblx0b3RoZXJ3aXNlPzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IE90aGVyd2lzZUNvbnRlbnRTdXBwbGllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IG90aGVyd2lzZSBjb250ZW50LiAqL1xuXHRtb2RpZnlPdGhlcndpc2U/OiBPdGhlcndpc2VDb250ZW50TW9kaWZpZXI7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gZ2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBhcmd1bWVudC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBEZWZhdWx0VmFsdWVTdXBwbGllciA9IChtZXNzYWdlOiBNZXNzYWdlLCBkYXRhOiBGYWlsdXJlRGF0YSkgPT4gYW55O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gZm9yIHZhbGlkYXRpbmcgcGFyc2VkIGFyZ3VtZW50cy5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBwaHJhc2UgLSBUaGUgdXNlciBpbnB1dC5cbiAqIEBwYXJhbSB2YWx1ZSAtIFRoZSBwYXJzZWQgdmFsdWUuXG4gKi9cbmV4cG9ydCB0eXBlIFBhcnNlZFZhbHVlUHJlZGljYXRlID0gKG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiBib29sZWFuO1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gbW9kaWZ5aW5nIGEgcHJvbXB0IHRleHQuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gdGV4dCAtIFRleHQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIE90aGVyd2lzZUNvbnRlbnRNb2RpZmllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0dGV4dDogc3RyaW5nLFxuXHRkYXRhOiBGYWlsdXJlRGF0YVxuKSA9PiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHJldHVybmluZyB0aGUgY29udGVudCBpZiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIE90aGVyd2lzZUNvbnRlbnRTdXBwbGllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0ZGF0YTogRmFpbHVyZURhdGFcbikgPT4gc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21pc2U8c3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucz47XG5cbi8qKlxuICogQSBmdW5jdGlvbiBtb2RpZnlpbmcgYSBwcm9tcHQgdGV4dC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSB0ZXh0IC0gVGV4dCBmcm9tIHRoZSBwcm9tcHQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIGRhdGEgLSBNaXNjZWxsYW5lb3VzIGRhdGEuXG4gKi9cbmV4cG9ydCB0eXBlIFByb21wdENvbnRlbnRNb2RpZmllciA9IChcblx0bWVzc2FnZTogTWVzc2FnZSxcblx0dGV4dDogc3RyaW5nLFxuXHRkYXRhOiBBcmd1bWVudFByb21wdERhdGFcbikgPT4gc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21pc2U8c3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucz47XG5cbi8qKlxuICogQSBmdW5jdGlvbiByZXR1cm5pbmcgdGV4dCBmb3IgdGhlIHByb21wdC5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBQcm9tcHRDb250ZW50U3VwcGxpZXIgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdGRhdGE6IEFyZ3VtZW50UHJvbXB0RGF0YVxuKSA9PiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbWlzZTxzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zPjtcbiJdfQ==