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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJndW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc3RydWN0L2NvbW1hbmRzL2FyZ3VtZW50cy9Bcmd1bWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLHVEQUF5RTtBQUN6RSw4REFBc0M7QUFJdEMsbURBQTJCO0FBRzNCOzs7O0dBSUc7QUFDSCxNQUFxQixRQUFRO0lBQzVCLFlBQ0MsT0FBZ0IsRUFDaEIsRUFDQyxLQUFLLEdBQUcsMkJBQWUsQ0FBQyxNQUFNLEVBQzlCLElBQUksR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFDM0IsSUFBSSxHQUFHLElBQUksRUFDWCxhQUFhLEdBQUcsS0FBSyxFQUNyQixLQUFLLEdBQUcsSUFBSSxFQUNaLFNBQVMsR0FBRyxLQUFLLEVBQ2pCLEtBQUssR0FBRyxRQUFRLEVBQ2hCLE1BQU0sR0FBRyxJQUFJLEVBQ2IsT0FBTyxFQUFFLFlBQVksR0FBRyxJQUFJLEVBQzVCLFNBQVMsR0FBRyxJQUFJLEVBQ2hCLGVBQWUsR0FBRyxJQUFJLEtBQ0YsRUFBRTtRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUV2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRWhFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBRW5DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBRTNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksQ0FBQyxNQUFNLEdB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Q0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM5RSxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLE9BQU8sY0FBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDaEQ7WUFFRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDdEMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztDQUNEO0FBdG1CRCwyQkFzbUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWVzc2FnZSwgTWVzc2FnZU9wdGlvbnMsIE1lc3NhZ2VQYXlsb2FkIH0gZnJvbSBcImRpc2NvcmQuanNcIjtcbmltcG9ydCB7IEFyZ3VtZW50TWF0Y2hlcywgQXJndW1lbnRUeXBlcyB9IGZyb20gXCIuLi8uLi8uLi91dGlsL0NvbnN0YW50c1wiO1xuaW1wb3J0IFV0aWwgZnJvbSBcIi4uLy4uLy4uL3V0aWwvVXRpbFwiO1xuaW1wb3J0IEFrYWlyb0NsaWVudCBmcm9tIFwiLi4vLi4vQWthaXJvQ2xpZW50XCI7XG5pbXBvcnQgQ29tbWFuZCBmcm9tIFwiLi4vQ29tbWFuZFwiO1xuaW1wb3J0IENvbW1hbmRIYW5kbGVyIGZyb20gXCIuLi9Db21tYW5kSGFuZGxlclwiO1xuaW1wb3J0IEZsYWcgZnJvbSBcIi4uL0ZsYWdcIjtcbmltcG9ydCBUeXBlUmVzb2x2ZXIgZnJvbSBcIi4vVHlwZVJlc29sdmVyXCI7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBhcmd1bWVudCBmb3IgYSBjb21tYW5kLlxuICogQHBhcmFtIGNvbW1hbmQgLSBDb21tYW5kIG9mIHRoZSBhcmd1bWVudC5cbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGFyZ3VtZW50LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmd1bWVudCB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRjb21tYW5kOiBDb21tYW5kLFxuXHRcdHtcblx0XHRcdG1hdGNoID0gQXJndW1lbnRNYXRjaGVzLlBIUkFTRSxcblx0XHRcdHR5cGUgPSBBcmd1bWVudFR5cGVzLlNUUklORyxcblx0XHRcdGZsYWcgPSBudWxsLFxuXHRcdFx0bXVsdGlwbGVGbGFncyA9IGZhbHNlLFxuXHRcdFx0aW5kZXggPSBudWxsLFxuXHRcdFx0dW5vcmRlcmVkID0gZmFsc2UsXG5cdFx0XHRsaW1pdCA9IEluZmluaXR5LFxuXHRcdFx0cHJvbXB0ID0gbnVsbCxcblx0XHRcdGRlZmF1bHQ6IGRlZmF1bHRWYWx1ZSA9IG51bGwsXG5cdFx0XHRvdGhlcndpc2UgPSBudWxsLFxuXHRcdFx0bW9kaWZ5T3RoZXJ3aXNlID0gbnVsbFxuXHRcdH06IEFyZ3VtZW50T3B0aW9ucyA9IHt9XG5cdCkge1xuXHRcdHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG5cblx0XHR0aGlzLm1hdGNoID0gbWF0Y2g7XG5cblx0XHR0aGlzLnR5cGUgPSB0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiID8gdHlwZS5iaW5kKHRoaXMpIDogdHlwZTtcblxuXHRcdHRoaXMuZmxhZyA9IGZsYWc7XG5cblx0XHR0aGlzLm11bHRpcGxlRmxhZ3MgPSBtdWx0aXBsZUZsYWdzO1xuXG5cdFx0dGhpcy5pbmRleCA9IGluZGV4O1xuXG5cdFx0dGhpcy51bm9yZGVyZWQgPSB1bm9yZGVyZWQ7XG5cblx0XHR0aGlzLmxpbWl0ID0gbGltaXQ7XG5cblx0XHR0aGlzLnByb21wdCA9IHByb21wdDtcblxuXHRcdHRoaXMuZGVmYXVsdCA9IHR5cGVvZiBkZWZhdWx0VmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGRlZmF1bHRWYWx1ZS5iaW5kKHRoaXMpIDogZGVmYXVsdFZhbHVlO1xuXG5cdFx0dGhpcy5vdGhlcndpc2UgPSB0eXBlb2Ygb3RoZXJ3aXNlID09PSBcImZ1bmN0aW9uXCIgPyBvdGhlcndpc2UuYmluZCh0aGlzKSA6IG90aGVyd2lzZTtcblxuXHRcdHRoaXMubW9kaWZ5T3RoZXJ3aXNlID0gbW9kaWZ5T3RoZXJ3aXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBjbGllbnQuXG5cdCAqL1xuXHRnZXQgY2xpZW50KCk6IEFrYWlyb0NsaWVudCB7XG5cdFx0cmV0dXJuIHRoaXMuY29tbWFuZC5jbGllbnQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGNvbW1hbmQgdGhpcyBhcmd1bWVudCBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHVibGljIGNvbW1hbmQ6IENvbW1hbmQ7XG5cblx0LyoqXG5cdCAqIFRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZSBhcmd1bWVudCBvciBhIGZ1bmN0aW9uIHN1cHBseWluZyB0aGUgZGVmYXVsdCB2YWx1ZS5cblx0ICovXG5cdHB1YmxpYyBkZWZhdWx0OiBEZWZhdWx0VmFsdWVTdXBwbGllciB8IGFueTtcblxuXHQvKipcblx0ICogIERlc2NyaXB0aW9uIG9mIHRoZSBjb21tYW5kLlxuXHQgKi9cblx0cHVibGljIGRlc2NyaXB0aW9uOiBzdHJpbmcgfCBhbnk7XG5cblx0LyoqXG5cdCAqIFRoZSBzdHJpbmcocykgdG8gdXNlIGZvciBmbGFnIG9yIG9wdGlvbiBtYXRjaC5cblx0ICovXG5cdHB1YmxpYyBmbGFnPzogc3RyaW5nIHwgc3RyaW5nW10gfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29tbWFuZCBoYW5kbGVyLlxuXHQgKi9cblx0Z2V0IGhhbmRsZXIoKTogQ29tbWFuZEhhbmRsZXIge1xuXHRcdHJldHVybiB0aGlzLmNvbW1hbmQuaGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgaW5kZXggdG8gc3RhcnQgZnJvbS5cblx0ICovXG5cdHB1YmxpYyBpbmRleD86IG51bWJlciB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSBhbW91bnQgb2YgcGhyYXNlcyB0byBtYXRjaCBmb3IgcmVzdCwgc2VwYXJhdGUsIGNvbnRlbnQsIG9yIHRleHQgbWF0Y2guXG5cdCAqL1xuXHRwdWJsaWMgbGltaXQ6IG51bWJlcjtcblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0byBtYXRjaCB0ZXh0LlxuXHQgKi9cblx0cHVibGljIG1hdGNoOiBBcmd1bWVudE1hdGNoO1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBtb2RpZnkgb3RoZXJ3aXNlIGNvbnRlbnQuXG5cdCAqL1xuXHRwdWJsaWMgbW9kaWZ5T3RoZXJ3aXNlOiBPdGhlcndpc2VDb250ZW50TW9kaWZpZXIgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIHRvIHByb2Nlc3MgbXVsdGlwbGUgb3B0aW9uIGZsYWdzIGluc3RlYWQgb2YganVzdCB0aGUgZmlyc3QuXG5cdCAqL1xuXHRwdWJsaWMgbXVsdGlwbGVGbGFnczogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIGNvbnRlbnQgb3IgZnVuY3Rpb24gc3VwcGx5aW5nIHRoZSBjb250ZW50IHNlbnQgd2hlbiBhcmd1bWVudCBwYXJzaW5nIGZhaWxzLlxuXHQgKi9cblx0cHVibGljIG90aGVyd2lzZT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBPdGhlcndpc2VDb250ZW50U3VwcGxpZXIgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgcHJvbXB0IG9wdGlvbnMuXG5cdCAqL1xuXHRwdWJsaWMgcHJvbXB0PzogQXJndW1lbnRQcm9tcHRPcHRpb25zIHwgYm9vbGVhbiB8IG51bGw7XG5cblx0LyoqXG5cdCAqIFRoZSB0eXBlIHRvIGNhc3QgdG8gb3IgYSBmdW5jdGlvbiB0byB1c2UgdG8gY2FzdC5cblx0ICovXG5cdHB1YmxpYyB0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXI7XG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgb3Igbm90IHRoZSBhcmd1bWVudCBpcyB1bm9yZGVyZWQuXG5cdCAqL1xuXHRwdWJsaWMgdW5vcmRlcmVkOiBib29sZWFuIHwgbnVtYmVyIHwgbnVtYmVyW107XG5cblx0LyoqXG5cdCAqIENhc3RzIGEgcGhyYXNlIHRvIHRoaXMgYXJndW1lbnQncyB0eXBlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCBjYWxsZWQgdGhlIGNvbW1hbmQuXG5cdCAqIEBwYXJhbSBwaHJhc2UgLSBQaHJhc2UgdG8gcHJvY2Vzcy5cblx0ICovXG5cdHB1YmxpYyBjYXN0KG1lc3NhZ2U6IE1lc3NhZ2UsIHBocmFzZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gQXJndW1lbnQuY2FzdCh0aGlzLnR5cGUsIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb2xsZWN0cyBpbnB1dCBmcm9tIHRoZSB1c2VyIGJ5IHByb21wdGluZy5cblx0ICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRvIHByb21wdC5cblx0ICogQHBhcmFtIGNvbW1hbmRJbnB1dCAtIFByZXZpb3VzIGlucHV0IGZyb20gY29tbWFuZCBpZiB0aGVyZSB3YXMgb25lLlxuXHQgKiBAcGFyYW0gcGFyc2VkSW5wdXQgLSBQcmV2aW91cyBwYXJzZWQgaW5wdXQgZnJvbSBjb21tYW5kIGlmIHRoZXJlIHdhcyBvbmUuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgY29sbGVjdChtZXNzYWdlOiBNZXNzYWdlLCBjb21tYW5kSW5wdXQ6IHN0cmluZyA9IFwiXCIsIHBhcnNlZElucHV0OiBhbnkgPSBudWxsKTogUHJvbWlzZTxGbGFnIHwgYW55PiB7XG5cdFx0Y29uc3QgcHJvbXB0T3B0aW9uczogYW55ID0ge307XG5cdFx0T2JqZWN0LmFzc2lnbihwcm9tcHRPcHRpb25zLCB0aGlzLmhhbmRsZXIuYXJndW1lbnREZWZhdWx0cy5wcm9tcHQpO1xuXHRcdE9iamVjdC5hc3NpZ24ocHJvbXB0T3B0aW9ucywgdGhpcy5jb21tYW5kLmFyZ3VtZW50RGVmYXVsdHMucHJvbXB0KTtcblx0XHRPYmplY3QuYXNzaWduKHByb21wdE9wdGlvbnMsIHRoaXMucHJvbXB0IHx8IHt9KTtcblxuXHRcdGNvbnN0IGlzSW5maW5pdGUgPSBwcm9tcHRPcHRpb25zLmluZmluaXRlIHx8ICh0aGlzLm1hdGNoID09PSBBcmd1bWVudE1hdGNoZXMuU0VQQVJBVEUgJiYgIWNvbW1hbmRJbnB1dCk7XG5cdFx0Y29uc3QgYWRkaXRpb25hbFJldHJ5ID0gTnVtYmVyKEJvb2xlYW4oY29tbWFuZElucHV0KSk7XG5cdFx0Y29uc3QgdmFsdWVzID0gaXNJbmZpbml0ZSA/IFtdIDogbnVsbDtcblxuXHRcdGNvbnN0IGdldFRleHQgPSBhc3luYyAoXG5cdFx0XHRwcm9tcHRUeXBlOiBzdHJpbmcsXG5cdFx0XHRwcm9tcHRlcjogYW55LFxuXHRcdFx0cmV0cnlDb3VudDogYW55LFxuXHRcdFx0aW5wdXRNZXNzYWdlOiBNZXNzYWdlIHwgdW5kZWZpbmVkLFxuXHRcdFx0aW5wdXRQaHJhc2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHRcdGlucHV0UGFyc2VkOiBzdHJpbmdcblx0XHQpID0+IHtcblx0XHRcdGxldCB0ZXh0ID0gYXdhaXQgVXRpbC5pbnRvQ2FsbGFibGUocHJvbXB0ZXIpLmNhbGwodGhpcywgbWVzc2FnZSwge1xuXHRcdFx0XHRyZXRyaWVzOiByZXRyeUNvdW50LFxuXHRcdFx0XHRpbmZpbml0ZTogaXNJbmZpbml0ZSxcblx0XHRcdFx0bWVzc2FnZTogaW5wdXRNZXNzYWdlLFxuXHRcdFx0XHRwaHJhc2U6IGlucHV0UGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlOiBpbnB1dFBhcnNlZFxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRleHQpKSB7XG5cdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG1vZGlmaWVyID0ge1xuXHRcdFx0XHRzdGFydDogcHJvbXB0T3B0aW9ucy5tb2RpZnlTdGFydCxcblx0XHRcdFx0cmV0cnk6IHByb21wdE9wdGlvbnMubW9kaWZ5UmV0cnksXG5cdFx0XHRcdHRpbWVvdXQ6IHByb21wdE9wdGlvbnMubW9kaWZ5VGltZW91dCxcblx0XHRcdFx0ZW5kZWQ6IHByb21wdE9wdGlvbnMubW9kaWZ5RW5kZWQsXG5cdFx0XHRcdGNhbmNlbDogcHJvbXB0T3B0aW9ucy5tb2RpZnlDYW5jZWxcblx0XHRcdH1bcHJvbXB0VHlwZV07XG5cblx0XHRcdGlmIChtb2RpZmllcikge1xuXHRcdFx0XHR0ZXh0ID0gYXdhaXQgbW9kaWZpZXIuY2FsbCh0aGlzLCBtZXNzYWdlLCB0ZXh0LCB7XG5cdFx0XHRcdFx0cmV0cmllczogcmV0cnlDb3VudCxcblx0XHRcdFx0XHRpbmZpbml0ZTogaXNJbmZpbml0ZSxcblx0XHRcdFx0XHRtZXNzYWdlOiBpbnB1dE1lc3NhZ2UsXG5cdFx0XHRcdFx0cGhyYXNlOiBpbnB1dFBocmFzZSxcblx0XHRcdFx0XHRmYWlsdXJlOiBpbnB1dFBhcnNlZFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0ZXh0KSkge1xuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fTtcblxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG5cdFx0Y29uc3QgcHJvbXB0T25lID0gYXN5bmMgKFxuXHRcdFx0cHJldk1lc3NhZ2U6IE1lc3NhZ2UgfCB1bmRlZmluZWQsXG5cdFx0XHRwcmV2SW5wdXQ6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHRcdHByZXZQYXJzZWQ6IGFueSxcblx0XHRcdHJldHJ5Q291bnQ6IG51bWJlclxuXHRcdCk6IFByb21pc2U8YW55PiA9PiB7XG5cdFx0XHRsZXQgc2VudFN0YXJ0O1xuXHRcdFx0Ly8gVGhpcyBpcyBlaXRoZXIgYSByZXRyeSBwcm9tcHQsIHRoZSBzdGFydCBvZiBhIG5vbi1pbmZpbml0ZSwgb3IgdGhlIHN0YXJ0IG9mIGFuIGluZmluaXRlLlxuXHRcdFx0aWYgKHJldHJ5Q291bnQgIT09IDEgfHwgIWlzSW5maW5pdGUgfHwgIXZhbHVlcz8ubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnN0IHByb21wdFR5cGUgPSByZXRyeUNvdW50ID09PSAxID8gXCJzdGFydFwiIDogXCJyZXRyeVwiO1xuXHRcdFx0XHRjb25zdCBwcm9tcHRlciA9IHJldHJ5Q291bnQgPT09IDEgPyBwcm9tcHRPcHRpb25zLnN0YXJ0IDogcHJvbXB0T3B0aW9ucy5yZXRyeTtcblx0XHRcdFx0Y29uc3Qgc3RhcnRUZXh0ID0gYXdhaXQgZ2V0VGV4dChwcm9tcHRUeXBlLCBwcm9tcHRlciwgcmV0cnlDb3VudCwgcHJldk1lc3NhZ2UsIHByZXZJbnB1dCwgcHJldlBhcnNlZCEpO1xuXG5cdFx0XHRcdGlmIChzdGFydFRleHQpIHtcblx0XHRcdFx0XHRzZW50U3RhcnQgPSBhd2FpdCAobWVzc2FnZS51dGlsIHx8IG1lc3NhZ2UuY2hhbm5lbCkuc2VuZChzdGFydFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwgJiYgc2VudFN0YXJ0KSB7XG5cdFx0XHRcdFx0XHRtZXNzYWdlLnV0aWwuc2V0RWRpdGFibGUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsLnNldExhc3RSZXNwb25zZShzZW50U3RhcnQpO1xuXHRcdFx0XHRcdFx0bWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudFN0YXJ0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGlucHV0OiBNZXNzYWdlO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aW5wdXQgPSAoXG5cdFx0XHRcdFx0YXdhaXQgbWVzc2FnZS5jaGFubmVsLmF3YWl0TWVzc2FnZXMoe1xuXHRcdFx0XHRcdFx0ZmlsdGVyOiBtID0+IG0uYXV0aG9yLmlkID09PSBtZXNzYWdlLmF1dGhvci5pZCxcblx0XHRcdFx0XHRcdG1heDogMSxcblx0XHRcdFx0XHRcdHRpbWU6IHByb21wdE9wdGlvbnMudGltZSxcblx0XHRcdFx0XHRcdGVycm9yczogW1widGltZVwiXVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCkuZmlyc3QoKSE7XG5cdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKGlucHV0KTtcblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRjb25zdCB0aW1lb3V0VGV4dCA9IGF3YWl0IGdldFRleHQoXCJ0aW1lb3V0XCIsIHByb21wdE9wdGlvbnMudGltZW91dCwgcmV0cnlDb3VudCwgcHJldk1lc3NhZ2UsIHByZXZJbnB1dCwgXCJcIik7XG5cdFx0XHRcdGlmICh0aW1lb3V0VGV4dCkge1xuXHRcdFx0XHRcdGNvbnN0IHNlbnRUaW1lb3V0ID0gYXdhaXQgbWVzc2FnZS5jaGFubmVsLnNlbmQodGltZW91dFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRUaW1lb3V0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAocHJvbXB0T3B0aW9ucy5icmVha291dCkge1xuXHRcdFx0XHRjb25zdCBsb29rc0xpa2UgPSBhd2FpdCB0aGlzLmhhbmRsZXIucGFyc2VDb21tYW5kKGlucHV0KTtcblx0XHRcdFx0aWYgKGxvb2tzTGlrZSAmJiBsb29rc0xpa2UuY29tbWFuZCkgcmV0dXJuIEZsYWcucmV0cnkoaW5wdXQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaW5wdXQ/LmNvbnRlbnQudG9Mb3dlckNhc2UoKSA9PT0gcHJvbXB0T3B0aW9ucy5jYW5jZWxXb3JkLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0Y29uc3QgY2FuY2VsVGV4dCA9IGF3YWl0IGdldFRleHQoXCJjYW5jZWxcIiwgcHJvbXB0T3B0aW9ucy5jYW5jZWwsIHJldHJ5Q291bnQsIGlucHV0LCBpbnB1dD8uY29udGVudCwgXCJjYW5jZWxcIik7XG5cdFx0XHRcdGlmIChjYW5jZWxUZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2VudENhbmNlbCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKGNhbmNlbFRleHQpO1xuXHRcdFx0XHRcdGlmIChtZXNzYWdlLnV0aWwpIG1lc3NhZ2UudXRpbC5hZGRNZXNzYWdlKHNlbnRDYW5jZWwpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc0luZmluaXRlICYmIGlucHV0Py5jb250ZW50LnRvTG93ZXJDYXNlKCkgPT09IHByb21wdE9wdGlvbnMuc3RvcFdvcmQudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRpZiAoIXZhbHVlcz8ubGVuZ3RoKSByZXR1cm4gcHJvbXB0T25lKGlucHV0LCBpbnB1dD8uY29udGVudCwgbnVsbCwgcmV0cnlDb3VudCArIDEpO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWVzO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBwYXJzZWRWYWx1ZSA9IGF3YWl0IHRoaXMuY2FzdChpbnB1dCwgaW5wdXQuY29udGVudCk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHBhcnNlZFZhbHVlKSkge1xuXHRcdFx0XHRpZiAocmV0cnlDb3VudCA8PSBwcm9tcHRPcHRpb25zLnJldHJpZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gcHJvbXB0T25lKGlucHV0LCBpbnB1dD8uY29udGVudCwgcGFyc2VkVmFsdWUsIHJldHJ5Q291bnQgKyAxKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGVuZGVkVGV4dCA9IGF3YWl0IGdldFRleHQoXCJlbmRlZFwiLCBwcm9tcHRPcHRpb25zLmVuZGVkLCByZXRyeUNvdW50LCBpbnB1dCwgaW5wdXQ/LmNvbnRlbnQsIFwic3RvcFwiKTtcblx0XHRcdFx0aWYgKGVuZGVkVGV4dCkge1xuXHRcdFx0XHRcdGNvbnN0IHNlbnRFbmRlZCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKGVuZGVkVGV4dCk7XG5cdFx0XHRcdFx0aWYgKG1lc3NhZ2UudXRpbCkgbWVzc2FnZS51dGlsLmFkZE1lc3NhZ2Uoc2VudEVuZGVkKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBGbGFnLmNhbmNlbCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaXNJbmZpbml0ZSkge1xuXHRcdFx0XHR2YWx1ZXMhLnB1c2gocGFyc2VkVmFsdWUgYXMgbmV2ZXIpO1xuXHRcdFx0XHRjb25zdCBsaW1pdCA9IHByb21wdE9wdGlvbnMubGltaXQ7XG5cdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0ZWQtb3B0aW9uYWwtY2hhaW5cblx0XHRcdFx0aWYgKHZhbHVlcz8ubGVuZ3RoISA8IGxpbWl0KSByZXR1cm4gcHJvbXB0T25lKG1lc3NhZ2UsIGlucHV0LmNvbnRlbnQsIHBhcnNlZFZhbHVlLCAxKTtcblxuXHRcdFx0XHRyZXR1cm4gdmFsdWVzO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcGFyc2VkVmFsdWU7XG5cdFx0fTtcblxuXHRcdHRoaXMuaGFuZGxlci5hZGRQcm9tcHQobWVzc2FnZS5jaGFubmVsLCBtZXNzYWdlLmF1dGhvcik7XG5cdFx0Y29uc3QgcmV0dXJuVmFsdWUgPSBhd2FpdCBwcm9tcHRPbmUobWVzc2FnZSwgY29tbWFuZElucHV0LCBwYXJzZWRJbnB1dCwgMSArIGFkZGl0aW9uYWxSZXRyeSk7XG5cdFx0aWYgKHRoaXMuaGFuZGxlci5jb21tYW5kVXRpbCAmJiBtZXNzYWdlLnV0aWwpIHtcblx0XHRcdG1lc3NhZ2UudXRpbC5zZXRFZGl0YWJsZShmYWxzZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5oYW5kbGVyLnJlbW92ZVByb21wdChtZXNzYWdlLmNoYW5uZWwsIG1lc3NhZ2UuYXV0aG9yKTtcblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH1cblxuXHQvKipcblx0ICogUHJvY2Vzc2VzIHRoZSB0eXBlIGNhc3RpbmcgYW5kIHByb21wdGluZyBvZiB0aGUgYXJndW1lbnQgZm9yIGEgcGhyYXNlLlxuXHQgKiBAcGFyYW0gbWVzc2FnZSAtIFRoZSBtZXNzYWdlIHRoYXQgY2FsbGVkIHRoZSBjb21tYW5kLlxuXHQgKiBAcGFyYW0gcGhyYXNlIC0gVGhlIHBocmFzZSB0byBwcm9jZXNzLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIHByb2Nlc3MobWVzc2FnZTogTWVzc2FnZSwgcGhyYXNlOiBzdHJpbmcpOiBQcm9taXNlPEZsYWcgfCBhbnk+IHtcblx0XHRjb25zdCBjb21tYW5kRGVmcyA9IHRoaXMuY29tbWFuZC5hcmd1bWVudERlZmF1bHRzO1xuXHRcdGNvbnN0IGhhbmRsZXJEZWZzID0gdGhpcy5oYW5kbGVyLmFyZ3VtZW50RGVmYXVsdHM7XG5cdFx0Y29uc3Qgb3B0aW9uYWwgPSBVdGlsLmNob2ljZShcblx0XHRcdHR5cGVvZiB0aGlzLnByb21wdCA9PT0gXCJvYmplY3RcIiAmJiB0aGlzLnByb21wdCAmJiB0aGlzLnByb21wdC5vcHRpb25hbCxcblx0XHRcdGNvbW1hbmREZWZzLnByb21wdCAmJiBjb21tYW5kRGVmcy5wcm9tcHQub3B0aW9uYWwsXG5cdFx0XHRoYW5kbGVyRGVmcy5wcm9tcHQgJiYgaGFuZGxlckRlZnMucHJvbXB0Lm9wdGlvbmFsXG5cdFx0KTtcblxuXHRcdGNvbnN0IGRvT3RoZXJ3aXNlID0gYXN5bmMgKGZhaWx1cmU6IChGbGFnICYgeyB2YWx1ZTogYW55IH0pIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuXHRcdFx0Y29uc3Qgb3RoZXJ3aXNlID0gVXRpbC5jaG9pY2UodGhpcy5vdGhlcndpc2UsIGNvbW1hbmREZWZzLm90aGVyd2lzZSwgaGFuZGxlckRlZnMub3RoZXJ3aXNlKTtcblxuXHRcdFx0Y29uc3QgbW9kaWZ5T3RoZXJ3aXNlID0gVXRpbC5jaG9pY2UoXG5cdFx0XHRcdHRoaXMubW9kaWZ5T3RoZXJ3aXNlLFxuXHRcdFx0XHRjb21tYW5kRGVmcy5tb2RpZnlPdGhlcndpc2UsXG5cdFx0XHRcdGhhbmRsZXJEZWZzLm1vZGlmeU90aGVyd2lzZVxuXHRcdFx0KTtcblxuXHRcdFx0bGV0IHRleHQgPSBhd2FpdCBVdGlsLmludG9DYWxsYWJsZShvdGhlcndpc2UpLmNhbGwodGhpcywgbWVzc2FnZSwge1xuXHRcdFx0XHRwaHJhc2UsXG5cdFx0XHRcdGZhaWx1cmVcblx0XHRcdH0pO1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGV4dCkpIHtcblx0XHRcdFx0dGV4dCA9IHRleHQuam9pbihcIlxcblwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1vZGlmeU90aGVyd2lzZSkge1xuXHRcdFx0XHR0ZXh0ID0gYXdhaXQgbW9kaWZ5T3RoZXJ3aXNlLmNhbGwodGhpcywgbWVzc2FnZSwgdGV4dCwge1xuXHRcdFx0XHRcdHBocmFzZSxcblx0XHRcdFx0XHRmYWlsdXJlXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0ZXh0KSkge1xuXHRcdFx0XHRcdHRleHQgPSB0ZXh0LmpvaW4oXCJcXG5cIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRleHQpIHtcblx0XHRcdFx0Y29uc3Qgc2VudCA9IGF3YWl0IG1lc3NhZ2UuY2hhbm5lbC5zZW5kKHRleHQpO1xuXHRcdFx0XHRpZiAobWVzc2FnZS51dGlsKSBtZXNzYWdlLnV0aWwuYWRkTWVzc2FnZShzZW50KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIEZsYWcuY2FuY2VsKCk7XG5cdFx0fTtcblxuXHRcdGlmICghcGhyYXNlICYmIG9wdGlvbmFsKSB7XG5cdFx0XHRpZiAodGhpcy5vdGhlcndpc2UgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gZG9PdGhlcndpc2UobnVsbCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBVdGlsLmludG9DYWxsYWJsZSh0aGlzLmRlZmF1bHQpKG1lc3NhZ2UsIHtcblx0XHRcdFx0cGhyYXNlLFxuXHRcdFx0XHRmYWlsdXJlOiBudWxsXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRjb25zdCByZXMgPSBhd2FpdCB0aGlzLmNhc3QobWVzc2FnZSwgcGhyYXNlKTtcblx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdGlmICh0aGlzLm90aGVyd2lzZSAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBkb090aGVyd2lzZShyZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5wcm9tcHQgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jb2xsZWN0KG1lc3NhZ2UsIHBocmFzZSwgcmVzKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuZGVmYXVsdCA9PSBudWxsID8gcmVzIDogVXRpbC5pbnRvQ2FsbGFibGUodGhpcy5kZWZhdWx0KShtZXNzYWdlLCB7IHBocmFzZSwgZmFpbHVyZTogcmVzIH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2FzdHMgYSBwaHJhc2UgdG8gdGhpcyBhcmd1bWVudCdzIHR5cGUuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gY2FzdCB0by5cblx0ICogQHBhcmFtIHJlc29sdmVyIC0gVGhlIHR5cGUgcmVzb2x2ZXIuXG5cdCAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IGNhbGxlZCB0aGUgY29tbWFuZC5cblx0ICogQHBhcmFtIHBocmFzZSAtIFBocmFzZSB0byBwcm9jZXNzLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBhc3luYyBjYXN0KFxuXHRcdHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3Rlcixcblx0XHRyZXNvbHZlcjogVHlwZVJlc29sdmVyLFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdFx0cGhyYXNlOiBzdHJpbmdcblx0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh0eXBlKSkge1xuXHRcdFx0Zm9yIChjb25zdCBlbnRyeSBvZiB0eXBlKSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGVudHJ5KSkge1xuXHRcdFx0XHRcdGlmIChlbnRyeS5zb21lKHQgPT4gdC50b0xvd2VyQ2FzZSgpID09PSBwaHJhc2UudG9Mb3dlckNhc2UoKSkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBlbnRyeVswXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAoZW50cnkudG9Mb3dlckNhc2UoKSA9PT0gcGhyYXNlLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZW50cnk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiB0eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGxldCByZXMgPSB0eXBlKG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoVXRpbC5pc1Byb21pc2UocmVzKSkgcmVzID0gYXdhaXQgcmVzO1xuXHRcdFx0cmV0dXJuIHJlcztcblx0XHR9XG5cblx0XHRpZiAodHlwZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSBwaHJhc2UubWF0Y2godHlwZSk7XG5cdFx0XHRpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcblxuXHRcdFx0Y29uc3QgbWF0Y2hlcyA9IFtdO1xuXG5cdFx0XHRpZiAodHlwZS5nbG9iYWwpIHtcblx0XHRcdFx0bGV0IG1hdGNoZWQ7XG5cblx0XHRcdFx0d2hpbGUgKChtYXRjaGVkID0gdHlwZS5leGVjKHBocmFzZSkpICE9IG51bGwpIHtcblx0XHRcdFx0XHRtYXRjaGVzLnB1c2gobWF0Y2hlZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHsgbWF0Y2gsIG1hdGNoZXMgfTtcblx0XHR9XG5cblx0XHRpZiAocmVzb2x2ZXIudHlwZSh0eXBlKSkge1xuXHRcdFx0bGV0IHJlcyA9IHJlc29sdmVyLnR5cGUodHlwZSk/LmNhbGwodGhpcywgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdGlmIChVdGlsLmlzUHJvbWlzZShyZXMpKSByZXMgPSBhd2FpdCByZXM7XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH1cblxuXHRcdHJldHVybiBwaHJhc2UgfHwgbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB0aGF0IGlzIHRoZSBsZWZ0LXRvLXJpZ2h0IGNvbXBvc2l0aW9uIG9mIHRoZSBnaXZlbiB0eXBlcy5cblx0ICogSWYgYW55IG9mIHRoZSB0eXBlcyBmYWlscywgdGhlIGVudGlyZSBjb21wb3NpdGlvbiBmYWlscy5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBjb21wb3NlKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKHRoaXM6IGFueSwgbWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRsZXQgYWNjID0gcGhyYXNlO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGFjYyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgYWNjKTtcblx0XHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShhY2MpKSByZXR1cm4gYWNjO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYWNjO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBpcyB0aGUgbGVmdC10by1yaWdodCBjb21wb3NpdGlvbiBvZiB0aGUgZ2l2ZW4gdHlwZXMuXG5cdCAqIElmIGFueSBvZiB0aGUgdHlwZXMgZmFpbHMsIHRoZSBjb21wb3NpdGlvbiBzdGlsbCBjb250aW51ZXMgd2l0aCB0aGUgZmFpbHVyZSBwYXNzZWQgb24uXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgY29tcG9zZVdpdGhGYWlsdXJlKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKHRoaXM6IGFueSwgbWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRsZXQgYWNjID0gcGhyYXNlO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGFjYyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgYWNjKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGFjYztcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBzb21ldGhpbmcgaXMgbnVsbCwgdW5kZWZpbmVkLCBvciBhIGZhaWwgZmxhZy5cblx0ICogQHBhcmFtIHZhbHVlIC0gVmFsdWUgdG8gY2hlY2suXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIGlzRmFpbHVyZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgbnVsbCB8IHVuZGVmaW5lZCB8IChGbGFnICYgeyB2YWx1ZTogYW55IH0pIHtcblx0XHRyZXR1cm4gdmFsdWUgPT0gbnVsbCB8fCBGbGFnLmlzKHZhbHVlLCBcImZhaWxcIik7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAocHJvZHVjdCB0eXBlKS5cblx0ICogT25seSBpbnB1dHMgd2hlcmUgZWFjaCB0eXBlIHJlc29sdmVzIHdpdGggYSBub24tdm9pZCB2YWx1ZSBhcmUgdmFsaWQuXG5cdCAqIEBwYXJhbSB0eXBlcyAtIFR5cGVzIHRvIHVzZS5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgcHJvZHVjdCguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbih0aGlzOiBhbnksIG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Y29uc3QgcmVzdWx0cyA9IFtdO1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gXCJmdW5jdGlvblwiKSBlbnRyeSA9IGVudHJ5LmJpbmQodGhpcyk7XG5cdFx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QoZW50cnksIHRoaXMuaGFuZGxlci5yZXNvbHZlciwgbWVzc2FnZSwgcGhyYXNlKTtcblx0XHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuXHRcdFx0XHRyZXN1bHRzLnB1c2gocmVzKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdHM7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSB3aGVyZSB0aGUgcGFyc2VkIHZhbHVlIG11c3QgYmUgd2l0aGluIGEgcmFuZ2UuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gbWluIC0gTWluaW11bSB2YWx1ZS5cblx0ICogQHBhcmFtIG1heCAtIE1heGltdW0gdmFsdWUuXG5cdCAqIEBwYXJhbSBpbmNsdXNpdmUgLSBXaGV0aGVyIG9yIG5vdCB0byBiZSBpbmNsdXNpdmUgb24gdGhlIHVwcGVyIGJvdW5kLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyByYW5nZShcblx0XHR0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsXG5cdFx0bWluOiBudW1iZXIsXG5cdFx0bWF4OiBudW1iZXIsXG5cdFx0aW5jbHVzaXZlID0gZmFsc2Vcblx0KTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gQXJndW1lbnQudmFsaWRhdGUodHlwZSwgKG1zZywgcCwgeCkgPT4ge1xuXHRcdFx0Y29uc3QgbyA9XG5cdFx0XHRcdHR5cGVvZiB4ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB4ID09PSBcImJpZ2ludFwiID8geCA6IHgubGVuZ3RoICE9IG51bGwgPyB4Lmxlbmd0aCA6IHguc2l6ZSAhPSBudWxsID8geC5zaXplIDogeDtcblxuXHRcdFx0cmV0dXJuIG8gPj0gbWluICYmIChpbmNsdXNpdmUgPyBvIDw9IG1heCA6IG8gPCBtYXgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHRoYXQgcGFyc2VzIGFzIG5vcm1hbCBidXQgYWxzbyB0YWdzIGl0IHdpdGggc29tZSBkYXRhLlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IHRhZywgdmFsdWUgfWAgYW5kIHdyYXBwZWQgaW4gYEZsYWcuZmFpbGAgd2hlbiBmYWlsZWQuXG5cdCAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgdG8gdXNlLlxuXHQgKiBAcGFyYW0gdGFnIC0gVGFnIHRvIGFkZC4gRGVmYXVsdHMgdG8gdGhlIGB0eXBlYCBhcmd1bWVudCwgc28gdXNlZnVsIGlmIGl0IGlzIGEgc3RyaW5nLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0YWdnZWQodHlwZTogQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyLCB0YWc6IGFueSA9IHR5cGUpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4odGhpczogYW55LCBtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdCh0eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdFx0cmV0dXJuIEZsYWcuZmFpbCh7IHRhZywgdmFsdWU6IHJlcyB9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHsgdGFnLCB2YWx1ZTogcmVzIH07XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdHlwZSBmcm9tIG11bHRpcGxlIHR5cGVzICh1bmlvbiB0eXBlKS5cblx0ICogVGhlIGZpcnN0IHR5cGUgdGhhdCByZXNvbHZlcyB0byBhIG5vbi12b2lkIHZhbHVlIGlzIHVzZWQuXG5cdCAqIEVhY2ggdHlwZSB3aWxsIGFsc28gYmUgdGFnZ2VkIHVzaW5nIGB0YWdnZWRgIHdpdGggdGhlbXNlbHZlcy5cblx0ICogQHBhcmFtIHR5cGVzIC0gVHlwZXMgdG8gdXNlLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB0YWdnZWRVbmlvbiguLi50eXBlczogKEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlcilbXSk6IEFyZ3VtZW50VHlwZUNhc3RlciB7XG5cdFx0cmV0dXJuIGFzeW5jIGZ1bmN0aW9uIHR5cGVGbih0aGlzOiBhbnksIG1lc3NhZ2UsIHBocmFzZSkge1xuXHRcdFx0Zm9yIChsZXQgZW50cnkgb2YgdHlwZXMpIHtcblx0XHRcdFx0ZW50cnkgPSBBcmd1bWVudC50YWdnZWQoZW50cnkpO1xuXHRcdFx0XHRjb25zdCByZXMgPSBhd2FpdCBBcmd1bWVudC5jYXN0KGVudHJ5LCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRcdGlmICghQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBwYXJzZXMgYXMgbm9ybWFsIGJ1dCBhbHNvIHRhZ3MgaXQgd2l0aCBzb21lIGRhdGEgYW5kIGNhcnJpZXMgdGhlIG9yaWdpbmFsIGlucHV0LlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IHRhZywgaW5wdXQsIHZhbHVlIH1gIGFuZCB3cmFwcGVkIGluIGBGbGFnLmZhaWxgIHdoZW4gZmFpbGVkLlxuXHQgKiBAcGFyYW0gdHlwZSAtIFRoZSB0eXBlIHRvIHVzZS5cblx0ICogQHBhcmFtIHRhZyAtIFRhZyB0byBhZGQuIERlZmF1bHRzIHRvIHRoZSBgdHlwZWAgYXJndW1lbnQsIHNvIHVzZWZ1bCBpZiBpdCBpcyBhIHN0cmluZy5cblx0ICovXG5cdHB1YmxpYyBzdGF0aWMgdGFnZ2VkV2l0aElucHV0KHR5cGU6IEFyZ3VtZW50VHlwZSB8IEFyZ3VtZW50VHlwZUNhc3RlciwgdGFnOiBhbnkgPSB0eXBlKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKHRoaXM6IGFueSwgbWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHR5cGUgPT09IFwiZnVuY3Rpb25cIikgdHlwZSA9IHR5cGUuYmluZCh0aGlzKTtcblx0XHRcdGNvbnN0IHJlcyA9IGF3YWl0IEFyZ3VtZW50LmNhc3QodHlwZSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0aWYgKEFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSB7XG5cdFx0XHRcdHJldHVybiBGbGFnLmZhaWwoeyB0YWcsIGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IHRhZywgaW5wdXQ6IHBocmFzZSwgdmFsdWU6IHJlcyB9O1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgZnJvbSBtdWx0aXBsZSB0eXBlcyAodW5pb24gdHlwZSkuXG5cdCAqIFRoZSBmaXJzdCB0eXBlIHRoYXQgcmVzb2x2ZXMgdG8gYSBub24tdm9pZCB2YWx1ZSBpcyB1c2VkLlxuXHQgKiBAcGFyYW0gdHlwZXMgLSBUeXBlcyB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHVuaW9uKC4uLnR5cGVzOiAoQXJndW1lbnRUeXBlIHwgQXJndW1lbnRUeXBlQ2FzdGVyKVtdKTogQXJndW1lbnRUeXBlQ2FzdGVyIHtcblx0XHRyZXR1cm4gYXN5bmMgZnVuY3Rpb24gdHlwZUZuKHRoaXM6IGFueSwgbWVzc2FnZSwgcGhyYXNlKSB7XG5cdFx0XHRmb3IgKGxldCBlbnRyeSBvZiB0eXBlcykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGVudHJ5ID09PSBcImZ1bmN0aW9uXCIpIGVudHJ5ID0gZW50cnkuYmluZCh0aGlzKTtcblx0XHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdChlbnRyeSwgdGhpcy5oYW5kbGVyLnJlc29sdmVyLCBtZXNzYWdlLCBwaHJhc2UpO1xuXHRcdFx0XHRpZiAoIUFyZ3VtZW50LmlzRmFpbHVyZShyZXMpKSByZXR1cm4gcmVzO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSB0eXBlIHdpdGggZXh0cmEgdmFsaWRhdGlvbi5cblx0ICogSWYgdGhlIHByZWRpY2F0ZSBpcyBub3QgdHJ1ZSwgdGhlIHZhbHVlIGlzIGNvbnNpZGVyZWQgaW52YWxpZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byB1c2UuXG5cdCAqIEBwYXJhbSBwcmVkaWNhdGUgLSBUaGUgcHJlZGljYXRlIGZ1bmN0aW9uLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyB2YWxpZGF0ZSh0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIsIHByZWRpY2F0ZTogUGFyc2VkVmFsdWVQcmVkaWNhdGUpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4odGhpczogYW55LCBtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdCh0eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHJldHVybiByZXM7XG5cdFx0XHRpZiAoIXByZWRpY2F0ZS5jYWxsKHRoaXMsIG1lc3NhZ2UsIHBocmFzZSwgcmVzKSkgcmV0dXJuIG51bGw7XG5cdFx0XHRyZXR1cm4gcmVzO1xuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHR5cGUgdGhhdCBwYXJzZXMgYXMgbm9ybWFsIGJ1dCBhbHNvIGNhcnJpZXMgdGhlIG9yaWdpbmFsIGlucHV0LlxuXHQgKiBSZXN1bHQgaXMgaW4gYW4gb2JqZWN0IGB7IGlucHV0LCB2YWx1ZSB9YCBhbmQgd3JhcHBlZCBpbiBgRmxhZy5mYWlsYCB3aGVuIGZhaWxlZC5cblx0ICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byB1c2UuXG5cdCAqL1xuXHRwdWJsaWMgc3RhdGljIHdpdGhJbnB1dCh0eXBlOiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXIpOiBBcmd1bWVudFR5cGVDYXN0ZXIge1xuXHRcdHJldHVybiBhc3luYyBmdW5jdGlvbiB0eXBlRm4odGhpczogYW55LCBtZXNzYWdlLCBwaHJhc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiKSB0eXBlID0gdHlwZS5iaW5kKHRoaXMpO1xuXHRcdFx0Y29uc3QgcmVzID0gYXdhaXQgQXJndW1lbnQuY2FzdCh0eXBlLCB0aGlzLmhhbmRsZXIucmVzb2x2ZXIsIG1lc3NhZ2UsIHBocmFzZSk7XG5cdFx0XHRpZiAoQXJndW1lbnQuaXNGYWlsdXJlKHJlcykpIHtcblx0XHRcdFx0cmV0dXJuIEZsYWcuZmFpbCh7IGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7IGlucHV0OiBwaHJhc2UsIHZhbHVlOiByZXMgfTtcblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgaG93IGFuIGFyZ3VtZW50IHBhcnNlcyB0ZXh0LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFyZ3VtZW50T3B0aW9ucyB7XG5cdC8qKlxuXHQgKiBEZWZhdWx0IHZhbHVlIGlmIG5vIGlucHV0IG9yIGRpZCBub3QgY2FzdCBjb3JyZWN0bHkuXG5cdCAqIElmIHVzaW5nIGEgZmxhZyBtYXRjaCwgc2V0dGluZyB0aGUgZGVmYXVsdCB2YWx1ZSB0byBhIG5vbi12b2lkIHZhbHVlIGludmVyc2VzIHRoZSByZXN1bHQuXG5cdCAqL1xuXHRkZWZhdWx0PzogRGVmYXVsdFZhbHVlU3VwcGxpZXIgfCBhbnk7XG5cblx0LyoqIFRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgYXJndW1lbnQgKi9cblx0ZGVzY3JpcHRpb24/OiBzdHJpbmcgfCBhbnkgfCBhbnlbXTtcblxuXHQvKiogVGhlIHN0cmluZyhzKSB0byB1c2UgYXMgdGhlIGZsYWcgZm9yIGZsYWcgb3Igb3B0aW9uIG1hdGNoLiAqL1xuXHRmbGFnPzogc3RyaW5nIHwgc3RyaW5nW10gfCBudWxsO1xuXG5cdC8qKiAgSUQgb2YgdGhlIGFyZ3VtZW50IGZvciB1c2UgaW4gdGhlIGFyZ3Mgb2JqZWN0LiBUaGlzIGRvZXMgbm90aGluZyBpbnNpZGUgYW4gQXJndW1lbnRHZW5lcmF0b3IuICovXG5cdGlkPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBJbmRleCBvZiBwaHJhc2UgdG8gc3RhcnQgZnJvbS4gQXBwbGljYWJsZSB0byBwaHJhc2UsIHRleHQsIGNvbnRlbnQsIHJlc3QsIG9yIHNlcGFyYXRlIG1hdGNoIG9ubHkuXG5cdCAqIElnbm9yZWQgd2hlbiB1c2VkIHdpdGggdGhlIHVub3JkZXJlZCBvcHRpb24uXG5cdCAqL1xuXHRpbmRleD86IG51bWJlciB8IG51bGw7XG5cblx0LyoqXG5cdCAqIEFtb3VudCBvZiBwaHJhc2VzIHRvIG1hdGNoIHdoZW4gbWF0Y2hpbmcgbW9yZSB0aGFuIG9uZS5cblx0ICogQXBwbGljYWJsZSB0byB0ZXh0LCBjb250ZW50LCByZXN0LCBvciBzZXBhcmF0ZSBtYXRjaCBvbmx5LlxuXHQgKiBEZWZhdWx0cyB0byBpbmZpbml0eS5cblx0ICovXG5cdGxpbWl0PzogbnVtYmVyO1xuXG5cdC8qKiBNZXRob2QgdG8gbWF0Y2ggdGV4dC4gRGVmYXVsdHMgdG8gJ3BocmFzZScuICovXG5cdG1hdGNoPzogQXJndW1lbnRNYXRjaDtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IG90aGVyd2lzZSBjb250ZW50LiAqL1xuXHRtb2RpZnlPdGhlcndpc2U/OiBPdGhlcndpc2VDb250ZW50TW9kaWZpZXIgfCBudWxsO1xuXG5cdC8qKlxuXHQgKiBXaGV0aGVyIG9yIG5vdCB0byBoYXZlIGZsYWdzIHByb2Nlc3MgbXVsdGlwbGUgaW5wdXRzLlxuXHQgKiBGb3Igb3B0aW9uIGZsYWdzLCB0aGlzIHdvcmtzIGxpa2UgdGhlIHNlcGFyYXRlIG1hdGNoOyB0aGUgbGltaXQgb3B0aW9uIHdpbGwgYWxzbyB3b3JrIGhlcmUuXG5cdCAqIEZvciBmbGFncywgdGhpcyB3aWxsIGNvdW50IHRoZSBudW1iZXIgb2Ygb2NjdXJyZW5jZXMuXG5cdCAqL1xuXHRtdWx0aXBsZUZsYWdzPzogYm9vbGVhbjtcblxuXHQvKiogVGV4dCBzZW50IGlmIGFyZ3VtZW50IHBhcnNpbmcgZmFpbHMuIFRoaXMgb3ZlcnJpZGVzIHRoZSBgZGVmYXVsdGAgb3B0aW9uIGFuZCBhbGwgcHJvbXB0IG9wdGlvbnMuICovXG5cdG90aGVyd2lzZT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBPdGhlcndpc2VDb250ZW50U3VwcGxpZXIgfCBudWxsO1xuXG5cdC8qKiBQcm9tcHQgb3B0aW9ucyBmb3Igd2hlbiB1c2VyIGRvZXMgbm90IHByb3ZpZGUgaW5wdXQuICovXG5cdHByb21wdD86IEFyZ3VtZW50UHJvbXB0T3B0aW9ucyB8IGJvb2xlYW4gfCBudWxsO1xuXG5cdC8qKiBUeXBlIHRvIGNhc3QgdG8uICovXG5cdHR5cGU/OiBBcmd1bWVudFR5cGUgfCBBcmd1bWVudFR5cGVDYXN0ZXI7XG5cblx0LyoqXG5cdCAqIE1hcmtzIHRoZSBhcmd1bWVudCBhcyB1bm9yZGVyZWQuXG5cdCAqIEVhY2ggcGhyYXNlIGlzIGV2YWx1YXRlZCBpbiBvcmRlciB1bnRpbCBvbmUgbWF0Y2hlcyAobm8gaW5wdXQgYXQgYWxsIG1lYW5zIG5vIGV2YWx1YXRpb24pLlxuXHQgKiBQYXNzaW5nIGluIGEgbnVtYmVyIGZvcmNlcyBldmFsdWF0aW9uIGZyb20gdGhhdCBpbmRleCBvbndhcmRzLlxuXHQgKiBQYXNzaW5nIGluIGFuIGFycmF5IG9mIG51bWJlcnMgZm9yY2VzIGV2YWx1YXRpb24gb24gdGhvc2UgaW5kaWNlcyBvbmx5LlxuXHQgKiBJZiB0aGVyZSBpcyBhIG1hdGNoLCB0aGF0IGluZGV4IGlzIGNvbnNpZGVyZWQgdXNlZCBhbmQgZnV0dXJlIHVub3JkZXJlZCBhcmdzIHdpbGwgbm90IGNoZWNrIHRoYXQgaW5kZXggYWdhaW4uXG5cdCAqIElmIHRoZXJlIGlzIG5vIG1hdGNoLCB0aGVuIHRoZSBwcm9tcHRpbmcgb3IgZGVmYXVsdCB2YWx1ZSBpcyB1c2VkLlxuXHQgKiBBcHBsaWNhYmxlIHRvIHBocmFzZSBtYXRjaCBvbmx5LlxuXHQgKi9cblx0dW5vcmRlcmVkPzogYm9vbGVhbiB8IG51bWJlciB8IG51bWJlcltdO1xufVxuXG4vKipcbiAqIERhdGEgcGFzc2VkIHRvIGFyZ3VtZW50IHByb21wdCBmdW5jdGlvbnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXJndW1lbnRQcm9tcHREYXRhIHtcblx0LyoqIFdoZXRoZXIgdGhlIHByb21wdCBpcyBpbmZpbml0ZSBvciBub3QuICovXG5cdGluZmluaXRlOiBib29sZWFuO1xuXG5cdC8qKiBUaGUgbWVzc2FnZSB0aGF0IGNhdXNlZCB0aGUgcHJvbXB0LiAqL1xuXHRtZXNzYWdlOiBNZXNzYWdlO1xuXG5cdC8qKiBBbW91bnQgb2YgcmV0cmllcyBzbyBmYXIuICovXG5cdHJldHJpZXM6IG51bWJlcjtcblxuXHQvKiogVGhlIGlucHV0IHBocmFzZSB0aGF0IGNhdXNlZCB0aGUgcHJvbXB0IGlmIHRoZXJlIHdhcyBvbmUsIG90aGVyd2lzZSBhbiBlbXB0eSBzdHJpbmcuICovXG5cdHBocmFzZTogc3RyaW5nO1xuXG5cdC8qKiBUaGUgdmFsdWUgdGhhdCBmYWlsZWQgaWYgdGhlcmUgd2FzIG9uZSwgb3RoZXJ3aXNlIG51bGwuICovXG5cdGZhaWx1cmU6IHZvaWQgfCAoRmxhZyAmIHsgdmFsdWU6IGFueSB9KTtcbn1cblxuLyoqXG4gKiBBIHByb21wdCB0byBydW4gaWYgdGhlIHVzZXIgZGlkIG5vdCBpbnB1dCB0aGUgYXJndW1lbnQgY29ycmVjdGx5LlxuICogQ2FuIG9ubHkgYmUgdXNlZCBpZiB0aGVyZSBpcyBub3QgYSBkZWZhdWx0IHZhbHVlICh1bmxlc3Mgb3B0aW9uYWwgaXMgdHJ1ZSkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXJndW1lbnRQcm9tcHRPcHRpb25zIHtcblx0LyoqXG5cdCAqIFdoZW5ldmVyIGFuIGlucHV0IG1hdGNoZXMgdGhlIGZvcm1hdCBvZiBhIGNvbW1hbmQsIHRoaXMgb3B0aW9uIGNvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRvIGNhbmNlbCB0aGlzIGNvbW1hbmQgYW5kIHJ1biB0aGF0IGNvbW1hbmQuXG5cdCAqIFRoZSBjb21tYW5kIHRvIGJlIHJ1biBtYXkgYmUgdGhlIHNhbWUgY29tbWFuZCBvciBzb21lIG90aGVyIGNvbW1hbmQuXG5cdCAqIERlZmF1bHRzIHRvIHRydWUsXG5cdCAqL1xuXHRicmVha291dD86IGJvb2xlYW47XG5cblx0LyoqIFRleHQgc2VudCBvbiBjYW5jZWxsYXRpb24gb2YgY29tbWFuZC4gKi9cblx0Y2FuY2VsPzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21wdENvbnRlbnRTdXBwbGllcjtcblxuXHQvKiogV29yZCB0byB1c2UgZm9yIGNhbmNlbGxpbmcgdGhlIGNvbW1hbmQuIERlZmF1bHRzIHRvICdjYW5jZWwnLiAqL1xuXHRjYW5jZWxXb3JkPzogc3RyaW5nO1xuXG5cdC8qKiBUZXh0IHNlbnQgb24gYW1vdW50IG9mIHRyaWVzIHJlYWNoaW5nIHRoZSBtYXguICovXG5cdGVuZGVkPzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21wdENvbnRlbnRTdXBwbGllcjtcblxuXHQvKipcblx0ICogUHJvbXB0cyBmb3JldmVyIHVudGlsIHRoZSBzdG9wIHdvcmQsIGNhbmNlbCB3b3JkLCB0aW1lIGxpbWl0LCBvciByZXRyeSBsaW1pdC5cblx0ICogTm90ZSB0aGF0IHRoZSByZXRyeSBjb3VudCByZXNldHMgYmFjayB0byBvbmUgb24gZWFjaCB2YWxpZCBlbnRyeS5cblx0ICogVGhlIGZpbmFsIGV2YWx1YXRlZCBhcmd1bWVudCB3aWxsIGJlIGFuIGFycmF5IG9mIHRoZSBpbnB1dHMuXG5cdCAqIERlZmF1bHRzIHRvIGZhbHNlLlxuXHQgKi9cblx0aW5maW5pdGU/OiBib29sZWFuO1xuXG5cdC8qKiBBbW91bnQgb2YgaW5wdXRzIGFsbG93ZWQgZm9yIGFuIGluZmluaXRlIHByb21wdCBiZWZvcmUgZmluaXNoaW5nLiBEZWZhdWx0cyB0byBJbmZpbml0eS4gKi9cblx0bGltaXQ/OiBudW1iZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSBjYW5jZWwgbWVzc2FnZXMuICovXG5cdG1vZGlmeUNhbmNlbD86IFByb21wdENvbnRlbnRNb2RpZmllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IG91dCBvZiB0cmllcyBtZXNzYWdlcy4gKi9cblx0bW9kaWZ5RW5kZWQ/OiBQcm9tcHRDb250ZW50TW9kaWZpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSByZXRyeSBwcm9tcHRzLiAqL1xuXHRtb2RpZnlSZXRyeT86IFByb21wdENvbnRlbnRNb2RpZmllcjtcblxuXHQvKiogRnVuY3Rpb24gdG8gbW9kaWZ5IHN0YXJ0IHByb21wdHMuICovXG5cdG1vZGlmeVN0YXJ0PzogUHJvbXB0Q29udGVudE1vZGlmaWVyO1xuXG5cdC8qKiBGdW5jdGlvbiB0byBtb2RpZnkgdGltZW91dCBtZXNzYWdlcy4gKi9cblx0bW9kaWZ5VGltZW91dD86IFByb21wdENvbnRlbnRNb2RpZmllcjtcblxuXHQvKiogUHJvbXB0cyBvbmx5IHdoZW4gYXJndW1lbnQgaXMgcHJvdmlkZWQgYnV0IHdhcyBub3Qgb2YgdGhlIHJpZ2h0IHR5cGUuIERlZmF1bHRzIHRvIGZhbHNlLiAqL1xuXHRvcHRpb25hbD86IGJvb2xlYW47XG5cblx0LyoqIEFtb3VudCBvZiByZXRyaWVzIGFsbG93ZWQuIERlZmF1bHRzIHRvIDEuICovXG5cdHJldHJpZXM/OiBudW1iZXI7XG5cblx0LyoqIFRleHQgc2VudCBvbiBhIHJldHJ5IChmYWlsdXJlIHRvIGNhc3QgdHlwZSkuICovXG5cdHJldHJ5Pzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21wdENvbnRlbnRTdXBwbGllcjtcblxuXHQvKiogVGV4dCBzZW50IG9uIHN0YXJ0IG9mIHByb21wdC4gKi9cblx0c3RhcnQ/OiBzdHJpbmcgfCBNZXNzYWdlUGF5bG9hZCB8IE1lc3NhZ2VPcHRpb25zIHwgUHJvbXB0Q29udGVudFN1cHBsaWVyO1xuXG5cdC8qKiBXb3JkIHRvIHVzZSBmb3IgZW5kaW5nIGluZmluaXRlIHByb21wdHMuIERlZmF1bHRzIHRvICdzdG9wJy4gKi9cblx0c3RvcFdvcmQ/OiBzdHJpbmc7XG5cblx0LyoqIFRpbWUgdG8gd2FpdCBmb3IgaW5wdXQuIERlZmF1bHRzIHRvIDMwMDAwLiAqL1xuXHR0aW1lPzogbnVtYmVyO1xuXG5cdC8qKiBUZXh0IHNlbnQgb24gY29sbGVjdG9yIHRpbWUgb3V0LiAqL1xuXHR0aW1lb3V0Pzogc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21wdENvbnRlbnRTdXBwbGllcjtcbn1cblxuLyoqXG4gKiBUaGUgbWV0aG9kIHRvIG1hdGNoIGFyZ3VtZW50cyBmcm9tIHRleHQuXG4gKiAtIGBwaHJhc2VgIG1hdGNoZXMgYnkgdGhlIG9yZGVyIG9mIHRoZSBwaHJhc2VzIGlucHV0dGVkLlxuICogSXQgaWdub3JlcyBwaHJhc2VzIHRoYXQgbWF0Y2hlcyBhIGZsYWcuXG4gKiAtIGBmbGFnYCBtYXRjaGVzIHBocmFzZXMgdGhhdCBhcmUgdGhlIHNhbWUgYXMgaXRzIGZsYWcuXG4gKiBUaGUgZXZhbHVhdGVkIGFyZ3VtZW50IGlzIGVpdGhlciB0cnVlIG9yIGZhbHNlLlxuICogLSBgb3B0aW9uYCBtYXRjaGVzIHBocmFzZXMgdGhhdCBzdGFydHMgd2l0aCB0aGUgZmxhZy5cbiAqIFRoZSBwaHJhc2UgYWZ0ZXIgdGhlIGZsYWcgaXMgdGhlIGV2YWx1YXRlZCBhcmd1bWVudC5cbiAqIC0gYHJlc3RgIG1hdGNoZXMgdGhlIHJlc3Qgb2YgdGhlIHBocmFzZXMuXG4gKiBJdCBpZ25vcmVzIHBocmFzZXMgdGhhdCBtYXRjaGVzIGEgZmxhZy5cbiAqIEl0IHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgd2hpdGVzcGFjZSBiZXR3ZWVuIHBocmFzZXMgYW5kIHRoZSBxdW90ZXMgYXJvdW5kIHBocmFzZXMuXG4gKiAtIGBzZXBhcmF0ZWAgbWF0Y2hlcyB0aGUgcmVzdCBvZiB0aGUgcGhyYXNlcyBhbmQgcHJvY2Vzc2VzIGVhY2ggaW5kaXZpZHVhbGx5LlxuICogSXQgaWdub3JlcyBwaHJhc2VzIHRoYXQgbWF0Y2hlcyBhIGZsYWcuXG4gKiAtIGB0ZXh0YCBtYXRjaGVzIHRoZSBlbnRpcmUgdGV4dCwgZXhjZXB0IGZvciB0aGUgY29tbWFuZC5cbiAqIEl0IGlnbm9yZXMgcGhyYXNlcyB0aGF0IG1hdGNoZXMgYSBmbGFnLlxuICogSXQgcHJlc2VydmVzIHRoZSBvcmlnaW5hbCB3aGl0ZXNwYWNlIGJldHdlZW4gcGhyYXNlcyBhbmQgdGhlIHF1b3RlcyBhcm91bmQgcGhyYXNlcy5cbiAqIC0gYGNvbnRlbnRgIG1hdGNoZXMgdGhlIGVudGlyZSB0ZXh0IGFzIGl0IHdhcyBpbnB1dHRlZCwgZXhjZXB0IGZvciB0aGUgY29tbWFuZC5cbiAqIEl0IHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgd2hpdGVzcGFjZSBiZXR3ZWVuIHBocmFzZXMgYW5kIHRoZSBxdW90ZXMgYXJvdW5kIHBocmFzZXMuXG4gKiAtIGByZXN0Q29udGVudGAgbWF0Y2hlcyB0aGUgcmVzdCBvZiB0aGUgdGV4dCBhcyBpdCB3YXMgaW5wdXR0ZWQuXG4gKiBJdCBwcmVzZXJ2ZXMgdGhlIG9yaWdpbmFsIHdoaXRlc3BhY2UgYmV0d2VlbiBwaHJhc2VzIGFuZCB0aGUgcXVvdGVzIGFyb3VuZCBwaHJhc2VzLlxuICogLSBgbm9uZWAgbWF0Y2hlcyBub3RoaW5nIGF0IGFsbCBhbmQgYW4gZW1wdHkgc3RyaW5nIHdpbGwgYmUgdXNlZCBmb3IgdHlwZSBvcGVyYXRpb25zLlxuICovXG5leHBvcnQgdHlwZSBBcmd1bWVudE1hdGNoID1cblx0fCBcInBocmFzZVwiXG5cdHwgXCJmbGFnXCJcblx0fCBcIm9wdGlvblwiXG5cdHwgXCJyZXN0XCJcblx0fCBcInNlcGFyYXRlXCJcblx0fCBcInRleHRcIlxuXHR8IFwiY29udGVudFwiXG5cdHwgXCJyZXN0Q29udGVudFwiXG5cdHwgXCJub25lXCI7XG5cbi8qKlxuICogVGhlIHR5cGUgdGhhdCB0aGUgYXJndW1lbnQgc2hvdWxkIGJlIGNhc3QgdG8uXG4gKiAtIGBzdHJpbmdgIGRvZXMgbm90IGNhc3QgdG8gYW55IHR5cGUuXG4gKiAtIGBsb3dlcmNhc2VgIG1ha2VzIHRoZSBpbnB1dCBsb3dlcmNhc2UuXG4gKiAtIGB1cHBlcmNhc2VgIG1ha2VzIHRoZSBpbnB1dCB1cHBlcmNhc2UuXG4gKiAtIGBjaGFyQ29kZXNgIHRyYW5zZm9ybXMgdGhlIGlucHV0IHRvIGFuIGFycmF5IG9mIGNoYXIgY29kZXMuXG4gKiAtIGBudW1iZXJgIGNhc3RzIHRvIGEgbnVtYmVyLlxuICogLSBgaW50ZWdlcmAgY2FzdHMgdG8gYW4gaW50ZWdlci5cbiAqIC0gYGJpZ2ludGAgY2FzdHMgdG8gYSBiaWcgaW50ZWdlci5cbiAqIC0gYHVybGAgY2FzdHMgdG8gYW4gYFVSTGAgb2JqZWN0LlxuICogLSBgZGF0ZWAgY2FzdHMgdG8gYSBgRGF0ZWAgb2JqZWN0LlxuICogLSBgY29sb3JgIGNhc3RzIGEgaGV4IGNvZGUgdG8gYW4gaW50ZWdlci5cbiAqIC0gYGNvbW1hbmRBbGlhc2AgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIGNvbW1hbmQgZnJvbSBhbiBhbGlhcy5cbiAqIC0gYGNvbW1hbmRgIG1hdGNoZXMgdGhlIElEIG9mIGEgY29tbWFuZC5cbiAqIC0gYGluaGliaXRvcmAgbWF0Y2hlcyB0aGUgSUQgb2YgYW4gaW5oaWJpdG9yLlxuICogLSBgbGlzdGVuZXJgIG1hdGNoZXMgdGhlIElEIG9mIGEgbGlzdGVuZXIuXG4gKlxuICogUG9zc2libGUgRGlzY29yZC1yZWxhdGVkIHR5cGVzLlxuICogVGhlc2UgdHlwZXMgY2FuIGJlIHBsdXJhbCAoYWRkIGFuICdzJyB0byB0aGUgZW5kKSBhbmQgYSBjb2xsZWN0aW9uIG9mIG1hdGNoaW5nIG9iamVjdHMgd2lsbCBiZSB1c2VkLlxuICogLSBgdXNlcmAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHVzZXIuXG4gKiAtIGBtZW1iZXJgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBtZW1iZXIuXG4gKiAtIGByZWxldmFudGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHJlbGV2YW50IHVzZXIsIHdvcmtzIGluIGJvdGggZ3VpbGRzIGFuZCBETXMuXG4gKiAtIGBjaGFubmVsYCB0cmllcyB0byByZXNvbHZlIHRvIGEgY2hhbm5lbC5cbiAqIC0gYHRleHRDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIHRvIGEgdGV4dCBjaGFubmVsLlxuICogLSBgdm9pY2VDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIHRvIGEgdm9pY2UgY2hhbm5lbC5cbiAqIC0gYHN0YWdlQ2hhbm5lbGAgdHJpZXMgdG8gcmVzb2x2ZSB0byBhIHN0YWdlIGNoYW5uZWwuXG4gKiAtIGB0aHJlYWRDaGFubmVsYCB0cmllcyB0byByZXNvbHZlIGEgdGhyZWFkIGNoYW5uZWwuXG4gKiAtIGByb2xlYCB0cmllcyB0byByZXNvbHZlIHRvIGEgcm9sZS5cbiAqIC0gYGVtb2ppYCB0cmllcyB0byByZXNvbHZlIHRvIGEgY3VzdG9tIGVtb2ppLlxuICogLSBgZ3VpbGRgIHRyaWVzIHRvIHJlc29sdmUgdG8gYSBndWlsZC5cbiAqXG4gKiBPdGhlciBEaXNjb3JkLXJlbGF0ZWQgdHlwZXM6XG4gKiAtIGBtZXNzYWdlYCB0cmllcyB0byBmZXRjaCBhIG1lc3NhZ2UgZnJvbSBhbiBJRCB3aXRoaW4gdGhlIGNoYW5uZWwuXG4gKiAtIGBndWlsZE1lc3NhZ2VgIHRyaWVzIHRvIGZldGNoIGEgbWVzc2FnZSBmcm9tIGFuIElEIHdpdGhpbiB0aGUgZ3VpbGQuXG4gKiAtIGByZWxldmFudE1lc3NhZ2VgIGlzIGEgY29tYmluYXRpb24gb2YgdGhlIGFib3ZlLCB3b3JrcyBpbiBib3RoIGd1aWxkcyBhbmQgRE1zLlxuICogLSBgaW52aXRlYCB0cmllcyB0byBmZXRjaCBhbiBpbnZpdGUgb2JqZWN0IGZyb20gYSBsaW5rLlxuICogLSBgdXNlck1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGEgdXNlci5cbiAqIC0gYG1lbWJlck1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGEgZ3VpbGQgbWVtYmVyLlxuICogLSBgY2hhbm5lbE1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGEgY2hhbm5lbC5cbiAqIC0gYHJvbGVNZW50aW9uYCBtYXRjaGVzIGEgbWVudGlvbiBvZiBhIHJvbGUuXG4gKiAtIGBlbW9qaU1lbnRpb25gIG1hdGNoZXMgYSBtZW50aW9uIG9mIGFuIGVtb2ppLlxuICpcbiAqIEFuIGFycmF5IG9mIHN0cmluZ3MgY2FuIGJlIHVzZWQgdG8gcmVzdHJpY3QgaW5wdXQgdG8gb25seSB0aG9zZSBzdHJpbmdzLCBjYXNlIGluc2Vuc2l0aXZlLlxuICogVGhlIGFycmF5IGNhbiBhbHNvIGNvbnRhaW4gYW4gaW5uZXIgYXJyYXkgb2Ygc3RyaW5ncywgZm9yIGFsaWFzZXMuXG4gKiBJZiBzbywgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheSB3aWxsIGJlIHVzZWQgYXMgdGhlIGZpbmFsIGFyZ3VtZW50LlxuICpcbiAqIEEgcmVndWxhciBleHByZXNzaW9uIGNhbiBhbHNvIGJlIHVzZWQuXG4gKiBUaGUgZXZhbHVhdGVkIGFyZ3VtZW50IHdpbGwgYmUgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGBtYXRjaGAgYW5kIGBtYXRjaGVzYCBpZiBnbG9iYWwuXG4gKi9cbmV4cG9ydCB0eXBlIEFyZ3VtZW50VHlwZSA9XG5cdHwgXCJzdHJpbmdcIlxuXHR8IFwibG93ZXJjYXNlXCJcblx0fCBcInVwcGVyY2FzZVwiXG5cdHwgXCJjaGFyQ29kZXNcIlxuXHR8IFwibnVtYmVyXCJcblx0fCBcImludGVnZXJcIlxuXHR8IFwiYmlnaW50XCJcblx0fCBcImVtb2ppbnRcIlxuXHR8IFwidXJsXCJcblx0fCBcImRhdGVcIlxuXHR8IFwiY29sb3JcIlxuXHR8IFwidXNlclwiXG5cdHwgXCJ1c2Vyc1wiXG5cdHwgXCJtZW1iZXJcIlxuXHR8IFwibWVtYmVyc1wiXG5cdHwgXCJyZWxldmFudFwiXG5cdHwgXCJyZWxldmFudHNcIlxuXHR8IFwiY2hhbm5lbFwiXG5cdHwgXCJjaGFubmVsc1wiXG5cdHwgXCJ0ZXh0Q2hhbm5lbFwiXG5cdHwgXCJ0ZXh0Q2hhbm5lbHNcIlxuXHR8IFwidm9pY2VDaGFubmVsXCJcblx0fCBcInZvaWNlQ2hhbm5lbHNcIlxuXHR8IFwiY2F0ZWdvcnlDaGFubmVsXCJcblx0fCBcImNhdGVnb3J5Q2hhbm5lbHNcIlxuXHR8IFwibmV3c0NoYW5uZWxcIlxuXHR8IFwibmV3c0NoYW5uZWxzXCJcblx0fCBcInN0b3JlQ2hhbm5lbFwiXG5cdHwgXCJzdG9yZUNoYW5uZWxzXCJcblx0fCBcInN0YWdlQ2hhbm5lbFwiXG5cdHwgXCJzdGFnZUNoYW5uZWxzXCJcblx0fCBcInRocmVhZENoYW5uZWxcIlxuXHR8IFwidGhyZWFkQ2hhbm5lbHNcIlxuXHR8IFwicm9sZVwiXG5cdHwgXCJyb2xlc1wiXG5cdHwgXCJlbW9qaVwiXG5cdHwgXCJlbW9qaXNcIlxuXHR8IFwiZ3VpbGRcIlxuXHR8IFwiZ3VpbGRzXCJcblx0fCBcIm1lc3NhZ2VcIlxuXHR8IFwiZ3VpbGRNZXNzYWdlXCJcblx0fCBcInJlbGV2YW50TWVzc2FnZVwiXG5cdHwgXCJpbnZpdGVcIlxuXHR8IFwidXNlck1lbnRpb25cIlxuXHR8IFwibWVtYmVyTWVudGlvblwiXG5cdHwgXCJjaGFubmVsTWVudGlvblwiXG5cdHwgXCJyb2xlTWVudGlvblwiXG5cdHwgXCJlbW9qaU1lbnRpb25cIlxuXHR8IFwiY29tbWFuZEFsaWFzXCJcblx0fCBcImNvbW1hbmRcIlxuXHR8IFwiaW5oaWJpdG9yXCJcblx0fCBcImxpc3RlbmVyXCJcblx0fCAoc3RyaW5nIHwgc3RyaW5nW10pW11cblx0fCBSZWdFeHBcblx0fCBzdHJpbmc7XG5cbi8qKlxuICogQSBmdW5jdGlvbiBmb3IgcHJvY2Vzc2luZyB1c2VyIGlucHV0IHRvIHVzZSBhcyBhbiBhcmd1bWVudC5cbiAqIEEgdm9pZCByZXR1cm4gdmFsdWUgd2lsbCB1c2UgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBhcmd1bWVudCBvciBzdGFydCBhIHByb21wdC5cbiAqIEFueSBvdGhlciB0cnV0aHkgcmV0dXJuIHZhbHVlIHdpbGwgYmUgdXNlZCBhcyB0aGUgZXZhbHVhdGVkIGFyZ3VtZW50LlxuICogSWYgcmV0dXJuaW5nIGEgUHJvbWlzZSwgdGhlIHJlc29sdmVkIHZhbHVlIHdpbGwgZ28gdGhyb3VnaCB0aGUgYWJvdmUgc3RlcHMuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gcGhyYXNlIC0gVGhlIHVzZXIgaW5wdXQuXG4gKi9cbmV4cG9ydCB0eXBlIEFyZ3VtZW50VHlwZUNhc3RlciA9IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZykgPT4gYW55O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gZm9yIHByb2Nlc3Npbmcgc29tZSB2YWx1ZSB0byB1c2UgYXMgYW4gYXJndW1lbnQuXG4gKiBUaGlzIGlzIG1haW5seSB1c2VkIGluIGNvbXBvc2luZyBhcmd1bWVudCB0eXBlcy5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSB2YWx1ZSAtIFNvbWUgdmFsdWUuXG4gKi9cbmV4cG9ydCB0eXBlIEFyZ3VtZW50VHlwZUNhc3Rlcl8gPSAobWVzc2FnZTogTWVzc2FnZSwgdmFsdWU6IGFueSkgPT4gYW55O1xuXG4vKipcbiAqIERhdGEgcGFzc2VkIHRvIGZ1bmN0aW9ucyB0aGF0IHJ1biB3aGVuIHRoaW5ncyBmYWlsZWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFpbHVyZURhdGEge1xuXHQvKiogVGhlIGlucHV0IHBocmFzZSB0aGF0IGZhaWxlZCBpZiB0aGVyZSB3YXMgb25lLCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nLiAqL1xuXHRwaHJhc2U6IHN0cmluZztcblxuXHQvKiogVGhlIHZhbHVlIHRoYXQgZmFpbGVkIGlmIHRoZXJlIHdhcyBvbmUsIG90aGVyd2lzZSBudWxsLiAqL1xuXHRmYWlsdXJlOiB2b2lkIHwgKEZsYWcgJiB7IHZhbHVlOiBhbnkgfSk7XG59XG5cbi8qKlxuICogRGVmYXVsdHMgZm9yIGFyZ3VtZW50IG9wdGlvbnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVmYXVsdEFyZ3VtZW50T3B0aW9ucyB7XG5cdC8qKiBEZWZhdWx0IHByb21wdCBvcHRpb25zLiAqL1xuXHRwcm9tcHQ/OiBBcmd1bWVudFByb21wdE9wdGlvbnM7XG5cblx0LyoqIERlZmF1bHQgdGV4dCBzZW50IGlmIGFyZ3VtZW50IHBhcnNpbmcgZmFpbHMuICovXG5cdG90aGVyd2lzZT86IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBPdGhlcndpc2VDb250ZW50U3VwcGxpZXI7XG5cblx0LyoqIEZ1bmN0aW9uIHRvIG1vZGlmeSBvdGhlcndpc2UgY29udGVudC4gKi9cblx0bW9kaWZ5T3RoZXJ3aXNlPzogT3RoZXJ3aXNlQ29udGVudE1vZGlmaWVyO1xufVxuXG4vKipcbiAqIEZ1bmN0aW9uIGdldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGUgYXJndW1lbnQuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgRGVmYXVsdFZhbHVlU3VwcGxpZXIgPSAobWVzc2FnZTogTWVzc2FnZSwgZGF0YTogRmFpbHVyZURhdGEpID0+IGFueTtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIGZvciB2YWxpZGF0aW5nIHBhcnNlZCBhcmd1bWVudHMuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gcGhyYXNlIC0gVGhlIHVzZXIgaW5wdXQuXG4gKiBAcGFyYW0gdmFsdWUgLSBUaGUgcGFyc2VkIHZhbHVlLlxuICovXG5leHBvcnQgdHlwZSBQYXJzZWRWYWx1ZVByZWRpY2F0ZSA9IChtZXNzYWdlOiBNZXNzYWdlLCBwaHJhc2U6IHN0cmluZywgdmFsdWU6IGFueSkgPT4gYm9vbGVhbjtcblxuLyoqXG4gKiBBIGZ1bmN0aW9uIG1vZGlmeWluZyBhIHByb21wdCB0ZXh0LlxuICogQHBhcmFtIG1lc3NhZ2UgLSBNZXNzYWdlIHRoYXQgdHJpZ2dlcmVkIHRoZSBjb21tYW5kLlxuICogQHBhcmFtIHRleHQgLSBUZXh0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBPdGhlcndpc2VDb250ZW50TW9kaWZpZXIgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdHRleHQ6IHN0cmluZyxcblx0ZGF0YTogRmFpbHVyZURhdGFcbikgPT4gc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21pc2U8c3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucz47XG5cbi8qKlxuICogQSBmdW5jdGlvbiByZXR1cm5pbmcgdGhlIGNvbnRlbnQgaWYgYXJndW1lbnQgcGFyc2luZyBmYWlscy5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gTWVzc2FnZSB0aGF0IHRyaWdnZXJlZCB0aGUgY29tbWFuZC5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBPdGhlcndpc2VDb250ZW50U3VwcGxpZXIgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdGRhdGE6IEZhaWx1cmVEYXRhXG4pID0+IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gbW9kaWZ5aW5nIGEgcHJvbXB0IHRleHQuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gdGV4dCAtIFRleHQgZnJvbSB0aGUgcHJvbXB0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSBkYXRhIC0gTWlzY2VsbGFuZW91cyBkYXRhLlxuICovXG5leHBvcnQgdHlwZSBQcm9tcHRDb250ZW50TW9kaWZpZXIgPSAoXG5cdG1lc3NhZ2U6IE1lc3NhZ2UsXG5cdHRleHQ6IHN0cmluZyxcblx0ZGF0YTogQXJndW1lbnRQcm9tcHREYXRhXG4pID0+IHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnMgfCBQcm9taXNlPHN0cmluZyB8IE1lc3NhZ2VQYXlsb2FkIHwgTWVzc2FnZU9wdGlvbnM+O1xuXG4vKipcbiAqIEEgZnVuY3Rpb24gcmV0dXJuaW5nIHRleHQgZm9yIHRoZSBwcm9tcHQuXG4gKiBAcGFyYW0gbWVzc2FnZSAtIE1lc3NhZ2UgdGhhdCB0cmlnZ2VyZWQgdGhlIGNvbW1hbmQuXG4gKiBAcGFyYW0gZGF0YSAtIE1pc2NlbGxhbmVvdXMgZGF0YS5cbiAqL1xuZXhwb3J0IHR5cGUgUHJvbXB0Q29udGVudFN1cHBsaWVyID0gKFxuXHRtZXNzYWdlOiBNZXNzYWdlLFxuXHRkYXRhOiBBcmd1bWVudFByb21wdERhdGFcbikgPT4gc3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucyB8IFByb21pc2U8c3RyaW5nIHwgTWVzc2FnZVBheWxvYWQgfCBNZXNzYWdlT3B0aW9ucz47XG4iXX0=