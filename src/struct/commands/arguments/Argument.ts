import type { Message, MessageOptions, MessagePayload } from "discord.js";
import { ArgumentMatches, ArgumentTypes } from "../../../util/Constants.js";
import Util from "../../../util/Util.js";
import type AkairoClient from "../../AkairoClient.js";
import type Command from "../Command.js";
import type CommandHandler from "../CommandHandler.js";
import Flag from "../Flag.js";
import type TypeResolver from "./TypeResolver.js";

/**
 * Represents an argument for a command.
 */
export default class Argument {
	/**
	 * The command this argument belongs to.
	 */
	public declare command: Command;

	/**
	 * The default value of the argument or a function supplying the default value.
	 */
	public declare default: DefaultValueSupplier | any;

	/**
	 *  Description of the command.
	 */
	public declare description: string | any;

	/**
	 * The string(s) to use for flag or option match.
	 */
	public declare flag?: string | string[] | null;

	/**
	 * The index to start from.
	 */
	public declare index?: number;

	/**
	 * The amount of phrases to match for rest, separate, content, or text match.
	 */
	public declare limit: number;

	/**
	 * The method to match text.
	 */
	public declare match: ArgumentMatch;

	/**
	 * Function to modify otherwise content.
	 */
	public declare modifyOtherwise: OtherwiseContentModifier;

	/**
	 * Whether to process multiple option flags instead of just the first.
	 */
	public declare multipleFlags: boolean;

	/**
	 * The content or function supplying the content sent when argument parsing fails.
	 */
	public declare otherwise?: string | MessagePayload | MessageOptions | OtherwiseContentSupplier;

	/**
	 * The prompt options.
	 */
	public declare prompt?: ArgumentPromptOptions | boolean;

	/**
	 * The type to cast to or a function to use to cast.
	 */
	public declare type: ArgumentType | ArgumentTypeCaster;

	/**
	 * Whether or not the argument is unordered.
	 */
	public declare unordered: boolean | number | number[];

	/**
	 * @param command - Command of the argument.
	 * @param options - Options for the argument.
	 */
	public constructor(command: Command, options: ArgumentOptions = {}) {
		const {
			match = ArgumentMatches.PHRASE,
			type = ArgumentTypes.STRING,
			flag = null!,
			multipleFlags = false,
			index = null!,
			unordered = false,
			limit = Infinity,
			prompt = null!,
			default: defaultValue = null,
			otherwise = null!,
			modifyOtherwise = null!
		} = options;

		this.command = command;
		this.match = match;
		this.type = typeof type === "function" ? type.bind(this) : type;
		this.flag = flag;
		this.multipleFlags = multipleFlags;
		this.index = index!;
		this.unordered = unordered;
		this.limit = limit;
		this.prompt = prompt!;
		this.default = typeof defaultValue === "function" ? defaultValue.bind(this) : defaultValue;
		this.otherwise = typeof otherwise === "function" ? otherwise.bind(this) : otherwise!;
		this.modifyOtherwise = modifyOtherwise!;
	}

	/**
	 * The client.
	 */
	get client(): AkairoClient {
		return this.command.client;
	}

	/**
	 * The command handler.
	 */
	get handler(): CommandHandler {
		return this.command.handler;
	}

	/**
	 * Casts a phrase to this argument's type.
	 * @param message - Message that called the command.
	 * @param phrase - Phrase to process.
	 */
	public cast(message: Message, phrase: string): Promise<any> {
		return Argument.cast(this.type, this.handler.resolver, message, phrase);
	}

	/**
	 * Collects input from the user by prompting.
	 * @param message - Message to prompt.
	 * @param commandInput - Previous input from command if there was one.
	 * @param parsedInput - Previous parsed input from command if there was one.
	 */
	public async collect(message: Message, commandInput = "", parsedInput: any = null): Promise<Flag | any> {
		const promptOptions: ArgumentPromptOptions = {};
		Object.assign(promptOptions, this.handler.argumentDefaults.prompt);
		Object.assign(promptOptions, this.command.argumentDefaults.prompt);
		Object.assign(promptOptions, this.prompt || {});

		const isInfinite = promptOptions.infinite || (this.match === ArgumentMatches.SEPARATE && !commandInput);
		const additionalRetry = Number(Boolean(commandInput));
		const values = isInfinite ? [] : null;

		const getText = async (
			promptType: string,
			prompter: any,
			retryCount: any,
			inputMessage: Message | undefined,
			inputPhrase: string | undefined,
			inputParsed: string
		) => {
			let text = await Util.intoCallable(prompter).call(this, message, {
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
					message: inputMessage!,
					phrase: inputPhrase!,
					failure: inputParsed as any
				});

				if (Array.isArray(text)) {
					text = text.join("\n");
				}
			}

			return text;
		};

		// eslint-disable-next-line complexity
		const promptOne = async (
			prevMessage: Message | undefined,
			prevInput: string | undefined,
			prevParsed: any,
			retryCount: number
		): Promise<any> => {
			let sentStart;
			// This is either a retry prompt, the start of a non-infinite, or the start of an infinite.
			if (retryCount !== 1 || !isInfinite || !values?.length) {
				const promptType = retryCount === 1 ? "start" : "retry";
				const prompter = retryCount === 1 ? promptOptions.start : promptOptions.retry;
				const startText = await getText(promptType, prompter, retryCount, prevMessage, prevInput, prevParsed!);

				if (startText) {
					sentStart = await (message.util || message.channel).send(startText);
					if (message.util && sentStart) {
						message.util.setEditable(false);
						message.util.setLastResponse(sentStart);
						message.util.addMessage(sentStart);
					}
				}
			}

			let input: Message;
			try {
				input = (
					await message.channel.awaitMessages({
						filter: m => m.author.id === message.author.id,
						max: 1,
						time: promptOptions.time,
						errors: ["time"]
					})
				).first()!;
				if (message.util) message.util.addMessage(input);
			} catch (err) {
				const timeoutText = await getText("timeout", promptOptions.timeout, retryCount, prevMessage, prevInput, "");
				if (timeoutText) {
					const sentTimeout = await message.channel.send(timeoutText);
					if (message.util) message.util.addMessage(sentTimeout);
				}

				return Flag.cancel();
			}

			if (promptOptions.breakout) {
				const looksLike = await this.handler.parseCommand(input);
				if (looksLike && looksLike.command) return Flag.retry(input);
			}

			if (input?.content.toLowerCase() === promptOptions.cancelWord!.toLowerCase()) {
				const cancelText = await getText("cancel", promptOptions.cancel, retryCount, input, input?.content, "cancel");
				if (cancelText) {
					const sentCancel = await message.channel.send(cancelText);
					if (message.util) message.util.addMessage(sentCancel);
				}

				return Flag.cancel();
			}

			if (isInfinite && input?.content.toLowerCase() === promptOptions.stopWord!.toLowerCase()) {
				if (!values?.length) return promptOne(input, input?.content, null, retryCount + 1);
				return values;
			}

			const parsedValue = await this.cast(input, input.content);
			if (Argument.isFailure(parsedValue)) {
				if (retryCount <= promptOptions.retries!) {
					return promptOne(input, input?.content, parsedValue, retryCount + 1);
				}

				const endedText = await getText("ended", promptOptions.ended, retryCount, input, input?.content, "stop");
				if (endedText) {
					const sentEnded = await message.channel.send(endedText);
					if (message.util) message.util.addMessage(sentEnded);
				}

				return Flag.cancel();
			}

			if (isInfinite) {
				values!.push(parsedValue as never);
				const limit = promptOptions.limit!;
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				if (values?.length! < limit) return promptOne(message, input.content, parsedValue, 1);

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
	public async process(message: Message, phrase: string): Promise<Flag | any> {
		const commandDefs = this.command.argumentDefaults;
		const handlerDefs = this.handler.argumentDefaults;
		const optional = Util.choice(
			typeof this.prompt === "object" && this.prompt && this.prompt.optional,
			commandDefs.prompt && commandDefs.prompt.optional,
			handlerDefs.prompt && handlerDefs.prompt.optional
		);

		const doOtherwise = async (failure: (Flag & { value: any }) | null | undefined) => {
			const otherwise = Util.choice(this.otherwise, commandDefs.otherwise, handlerDefs.otherwise);

			const modifyOtherwise = Util.choice(
				this.modifyOtherwise,
				commandDefs.modifyOtherwise,
				handlerDefs.modifyOtherwise
			);

			let text = await Util.intoCallable(otherwise).call(this, message, {
				phrase,
				failure
			});
			if (Array.isArray(text)) {
				text = text.join("\n");
			}

			if (modifyOtherwise) {
				text = await modifyOtherwise.call(this, message, text as string, {
					phrase,
					failure: failure as Flag & { value: any }
				});
				if (Array.isArray(text)) {
					text = text.join("\n");
				}
			}

			if (text) {
				const sent = await message.channel.send(text);
				if (message.util) message.util.addMessage(sent);
			}

			return Flag.cancel();
		};

		if (!phrase && optional) {
			if (this.otherwise != null) {
				return doOtherwise(null);
			}

			return Util.intoCallable(this.default)(message, {
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

			return this.default == null ? res : Util.intoCallable(this.default)(message, { phrase, failure: res });
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
	public static async cast(
		type: ArgumentType | ArgumentTypeCaster,
		resolver: TypeResolver,
		message: Message,
		phrase: string
	): Promise<any> {
		if (Array.isArray(type)) {
			for (const entry of type) {
				if (Array.isArray(entry)) {
					if (entry.some(t => t.toLowerCase() === phrase.toLowerCase())) {
						return entry[0];
					}
				} else if (entry.toLowerCase() === phrase.toLowerCase()) {
					return entry;
				}
			}

			return null;
		}

		if (typeof type === "function") {
			let res = type(message, phrase);
			if (Util.isPromise(res)) res = await res;
			return res;
		}

		if (type instanceof RegExp) {
			const match = phrase.match(type);
			if (!match) return null;

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
			if (Util.isPromise(res)) res = await res;
			return res;
		}

		return phrase || null;
	}

	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the entire composition fails.
	 * @param types - Types to use.
	 */
	public static compose(...types: (ArgumentType | ArgumentTypeCaster)[]): ArgumentTypeCaster {
		return async function typeFn(this: any, message, phrase) {
			let acc = phrase;
			for (let entry of types) {
				if (typeof entry === "function") entry = entry.bind(this);
				acc = await Argument.cast(entry, this.handler.resolver, message, acc);
				if (Argument.isFailure(acc)) return acc;
			}

			return acc;
		};
	}

	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the composition still continues with the failure passed on.
	 * @param types - Types to use.
	 */
	public static composeWithFailure(...types: (ArgumentType | ArgumentTypeCaster)[]): ArgumentTypeCaster {
		return async function typeFn(this: any, message, phrase) {
			let acc = phrase;
			for (let entry of types) {
				if (typeof entry === "function") entry = entry.bind(this);
				acc = await Argument.cast(entry, this.handler.resolver, message, acc);
			}

			return acc;
		};
	}

	/**
	 * Checks if something is null, undefined, or a fail flag.
	 * @param value - Value to check.
	 */
	public static isFailure(value: any): value is null | undefined | (Flag & { value: any }) {
		return value == null || Flag.is(value, "fail");
	}

	/**
	 * Creates a type from multiple types (product type).
	 * Only inputs where each type resolves with a non-void value are valid.
	 * @param types - Types to use.
	 */
	public static product(...types: (ArgumentType | ArgumentTypeCaster)[]): ArgumentTypeCaster {
		return async function typeFn(this: any, message, phrase) {
			const results = [];
			for (let entry of types) {
				if (typeof entry === "function") entry = entry.bind(this);
				const res = await Argument.cast(entry, this.handler.resolver, message, phrase);
				if (Argument.isFailure(res)) return res;
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
	public static range(
		type: ArgumentType | ArgumentTypeCaster,
		min: number,
		max: number,
		inclusive = false
	): ArgumentTypeCaster {
		return Argument.validate(type, (msg, p, x) => {
			const o =
				typeof x === "number" || typeof x === "bigint" ? x : x.length != null ? x.length : x.size != null ? x.size : x;

			return o >= min && (inclusive ? o <= max : o < max);
		});
	}

	/**
	 * Creates a type that parses as normal but also tags it with some data.
	 * Result is in an object `{ tag, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
	 */
	public static tagged(type: ArgumentType | ArgumentTypeCaster, tag: any = type): ArgumentTypeCaster {
		return async function typeFn(this: any, message, phrase) {
			if (typeof type === "function") type = type.bind(this);
			const res = await Argument.cast(type, this.handler.resolver, message, phrase);
			if (Argument.isFailure(res)) {
				return Flag.fail({ tag, value: res });
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
	public static taggedUnion(...types: (ArgumentType | ArgumentTypeCaster)[]): ArgumentTypeCaster {
		return async function typeFn(this: any, message, phrase) {
			for (let entry of types) {
				entry = Argument.tagged(entry);
				const res = await Argument.cast(entry, this.handler.resolver, message, phrase);
				if (!Argument.isFailure(res)) return res;
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
	public static taggedWithInput(type: ArgumentType | ArgumentTypeCaster, tag: any = type): ArgumentTypeCaster {
		return async function typeFn(this: any, message, phrase) {
			if (typeof type === "function") type = type.bind(this);
			const res = await Argument.cast(type, this.handler.resolver, message, phrase);
			if (Argument.isFailure(res)) {
				return Flag.fail({ tag, input: phrase, value: res });
			}

			return { tag, input: phrase, value: res };
		};
	}

	/**
	 * Creates a type from multiple types (union type).
	 * The first type that resolves to a non-void value is used.
	 * @param types - Types to use.
	 */
	public static union(...types: (ArgumentType | ArgumentTypeCaster)[]): ArgumentTypeCaster {
		return async function typeFn(this: any, message, phrase) {
			for (let entry of types) {
				if (typeof entry === "function") entry = entry.bind(this);
				const res = await Argument.cast(entry, this.handler.resolver, message, phrase);
				if (!Argument.isFailure(res)) return res;
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
	public static validate(type: ArgumentType | ArgumentTypeCaster, predicate: ParsedValuePredicate): ArgumentTypeCaster {
		return async function typeFn(this: any, message, phrase) {
			if (typeof type === "function") type = type.bind(this);
			const res = await Argument.cast(type, this.handler.resolver, message, phrase);
			if (Argument.isFailure(res)) return res;
			if (!predicate.call(this, message, phrase, res)) return null;
			return res;
		};
	}

	/**
	 * Creates a type that parses as normal but also carries the original input.
	 * Result is in an object `{ input, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 */
	public static withInput(type: ArgumentType | ArgumentTypeCaster): ArgumentTypeCaster {
		return async function typeFn(this: any, message, phrase) {
			if (typeof type === "function") type = type.bind(this);
			const res = await Argument.cast(type, this.handler.resolver, message, phrase);
			if (Argument.isFailure(res)) {
				return Flag.fail({ input: phrase, value: res });
			}

			return { input: phrase, value: res };
		};
	}
}

/**
 * Options for how an argument parses text.
 */
export interface ArgumentOptions {
	/**
	 * Default value if no input or did not cast correctly.
	 * If using a flag match, setting the default value to a non-void value inverses the result.
	 */
	default?: DefaultValueSupplier | any;

	/**
	 * The description of the argument
	 */
	description?: string | any | any[];

	/**
	 * The string(s) to use as the flag for flag or option match.
	 */
	flag?: string | string[];

	/**
	 * ID of the argument for use in the args object. This does nothing inside an ArgumentGenerator.
	 */
	id?: string;

	/**
	 * Index of phrase to start from. Applicable to phrase, text, content, rest, or separate match only.
	 * Ignored when used with the unordered option.
	 */
	index?: number;

	/**
	 * Amount of phrases to match when matching more than one.
	 * Applicable to text, content, rest, or separate match only.
	 * Defaults to infinity.
	 */
	limit?: number;

	/**
	 * Method to match text. Defaults to 'phrase'.
	 */
	match?: ArgumentMatch;

	/**
	 * Function to modify otherwise content.
	 */
	modifyOtherwise?: OtherwiseContentModifier;

	/**
	 * Whether or not to have flags process multiple inputs.
	 * For option flags, this works like the separate match; the limit option will also work here.
	 * For flags, this will count the number of occurrences.
	 */
	multipleFlags?: boolean;

	/**
	 * Text sent if argument parsing fails. This overrides the `default` option and all prompt options.
	 */
	otherwise?: string | MessagePayload | MessageOptions | OtherwiseContentSupplier;

	/**
	 * Prompt options for when user does not provide input.
	 */
	prompt?: ArgumentPromptOptions | boolean;

	/**
	 * Type to cast to.
	 */
	type?: ArgumentType | ArgumentTypeCaster;

	/**
	 * Marks the argument as unordered.
	 * Each phrase is evaluated in order until one matches (no input at all means no evaluation).
	 * Passing in a number forces evaluation from that index onwards.
	 * Passing in an array of numbers forces evaluation on those indices only.
	 * If there is a match, that index is considered used and future unordered args will not check that index again.
	 * If there is no match, then the prompting or default value is used.
	 * Applicable to phrase match only.
	 */
	unordered?: boolean | number | number[];
}

/**
 * Data passed to argument prompt functions.
 */
export interface ArgumentPromptData {
	/**
	 * Whether the prompt is infinite or not.
	 */
	infinite: boolean;

	/**
	 * The message that caused the prompt.
	 */
	message: Message;

	/**
	 * Amount of retries so far.
	 */
	retries: number;

	/**
	 * The input phrase that caused the prompt if there was one, otherwise an empty string.
	 */
	phrase: string;

	/**
	 * The value that failed if there was one, otherwise null.
	 */
	failure: void | (Flag & { value: any });
}

/**
 * A prompt to run if the user did not input the argument correctly.
 * Can only be used if there is not a default value (unless optional is true).
 */
export interface ArgumentPromptOptions {
	/**
	 * Whenever an input matches the format of a command, this option controls whether or not to cancel this command and run that command.
	 * The command to be run may be the same command or some other command.
	 * Defaults to true,
	 */
	breakout?: boolean;

	/**
	 * Text sent on cancellation of command.
	 */
	cancel?: string | MessagePayload | MessageOptions | PromptContentSupplier;

	/**
	 * Word to use for cancelling the command. Defaults to 'cancel'.
	 */
	cancelWord?: string;

	/**
	 * Text sent on amount of tries reaching the max.
	 */
	ended?: string | MessagePayload | MessageOptions | PromptContentSupplier;

	/**
	 * Prompts forever until the stop word, cancel word, time limit, or retry limit.
	 * Note that the retry count resets back to one on each valid entry.
	 * The final evaluated argument will be an array of the inputs.
	 * Defaults to false.
	 */
	infinite?: boolean;

	/**
	 * Amount of inputs allowed for an infinite prompt before finishing. Defaults to Infinity.
	 */
	limit?: number;

	/**
	 * Function to modify cancel messages.
	 */
	modifyCancel?: PromptContentModifier;

	/**
	 * Function to modify out of tries messages.
	 */
	modifyEnded?: PromptContentModifier;

	/**
	 * Function to modify retry prompts.
	 */
	modifyRetry?: PromptContentModifier;

	/**
	 * Function to modify start prompts.
	 */
	modifyStart?: PromptContentModifier;

	/**
	 * Function to modify timeout messages.
	 */
	modifyTimeout?: PromptContentModifier;

	/**
	 * Prompts only when argument is provided but was not of the right type. Defaults to false.
	 */
	optional?: boolean;

	/**
	 * Amount of retries allowed. Defaults to 1.
	 */
	retries?: number;

	/**
	 * Text sent on a retry (failure to cast type).
	 */
	retry?: string | MessagePayload | MessageOptions | PromptContentSupplier;

	/**
	 * Text sent on start of prompt.
	 */
	start?: string | MessagePayload | MessageOptions | PromptContentSupplier;

	/**
	 * Word to use for ending infinite prompts. Defaults to 'stop'.
	 */
	stopWord?: string;

	/**
	 * Time to wait for input. Defaults to 30000.
	 */
	time?: number;

	/**
	 * Text sent on collector time out.
	 */
	timeout?: string | MessagePayload | MessageOptions | PromptContentSupplier;
}

/**
 * The method to match arguments from text.
 * - `phrase` matches by the order of the phrases inputted.
 * It ignores phrases that matches a flag.
 * - `flag` matches phrases that are the same as its flag.
 * The evaluated argument is either true or false.
 * - `option` matches phrases that starts with the flag.
 * The phrase after the flag is the evaluated argument.
 * - `rest` matches the rest of the phrases.
 * It ignores phrases that matches a flag.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `separate` matches the rest of the phrases and processes each individually.
 * It ignores phrases that matches a flag.
 * - `text` matches the entire text, except for the command.
 * It ignores phrases that matches a flag.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `content` matches the entire text as it was inputted, except for the command.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `restContent` matches the rest of the text as it was inputted.
 * It preserves the original whitespace between phrases and the quotes around phrases.
 * - `none` matches nothing at all and an empty string will be used for type operations.
 */
export type ArgumentMatch =
	| "phrase"
	| "flag"
	| "option"
	| "rest"
	| "separate"
	| "text"
	| "content"
	| "restContent"
	| "none";

export type BaseArgumentType =
	| "string"
	| "lowercase"
	| "uppercase"
	| "charCodes"
	| "number"
	| "integer"
	| "bigint"
	| "emojint"
	| "url"
	| "date"
	| "color"
	| "user"
	| "users"
	| "member"
	| "members"
	| "relevant"
	| "relevants"
	| "channel"
	| "channels"
	| "textChannel"
	| "textChannels"
	| "voiceChannel"
	| "voiceChannels"
	| "categoryChannel"
	| "categoryChannels"
	| "newsChannel"
	| "newsChannels"
	| "storeChannel"
	| "storeChannels"
	| "stageChannel"
	| "stageChannels"
	| "threadChannel"
	| "threadChannels"
	| "role"
	| "roles"
	| "emoji"
	| "emojis"
	| "guild"
	| "guilds"
	| "message"
	| "guildMessage"
	| "relevantMessage"
	| "invite"
	| "userMention"
	| "memberMention"
	| "channelMention"
	| "roleMention"
	| "emojiMention"
	| "commandAlias"
	| "command"
	| "inhibitor"
	| "listener"
	| "task"
	| "contextMenuCommand";

/**
 * The type that the argument should be cast to.
 * - `string` does not cast to any type.
 * - `lowercase` makes the input lowercase.
 * - `uppercase` makes the input uppercase.
 * - `charCodes` transforms the input to an array of char codes.
 * - `number` casts to a number.
 * - `integer` casts to an integer.
 * - `bigint` casts to a big integer.
 * - `url` casts to an `URL` object.
 * - `date` casts to a `Date` object.
 * - `color` casts a hex code to an integer.
 * - `commandAlias` tries to resolve to a command from an alias.
 * - `command` matches the ID of a command.
 * - `inhibitor` matches the ID of an inhibitor.
 * - `listener` matches the ID of a listener.
 * - `task` matches the ID of a task.
 * - `contextMenuCommand` matches the ID of a context menu command.
 *
 * Possible Discord-related types.
 * These types can be plural (add an 's' to the end) and a collection of matching objects will be used.
 * - `user` tries to resolve to a user.
 * - `member` tries to resolve to a member.
 * - `relevant` tries to resolve to a relevant user, works in both guilds and DMs.
 * - `channel` tries to resolve to a channel.
 * - `textChannel` tries to resolve to a text channel.
 * - `voiceChannel` tries to resolve to a voice channel.
 * - `categoryChannel` tries to resolve to a category channel.
 * - `newsChannel` tries to resolve to a news channel.
 * - `storeChannel` tries to resolve to a store channel.
 * - `stageChannel` tries to resolve to a stage channel.
 * - `threadChannel` tries to resolve a thread channel.
 * - `role` tries to resolve to a role.
 * - `emoji` tries to resolve to a custom emoji.
 * - `guild` tries to resolve to a guild.
 *
 * Other Discord-related types:
 * - `message` tries to fetch a message from an ID within the channel.
 * - `guildMessage` tries to fetch a message from an ID within the guild.
 * - `relevantMessage` is a combination of the above, works in both guilds and DMs.
 * - `invite` tries to fetch an invite object from a link.
 * - `userMention` matches a mention of a user.
 * - `memberMention` matches a mention of a guild member.
 * - `channelMention` matches a mention of a channel.
 * - `roleMention` matches a mention of a role.
 * - `emojiMention` matches a mention of an emoji.
 *
 * An array of strings can be used to restrict input to only those strings, case insensitive.
 * The array can also contain an inner array of strings, for aliases.
 * If so, the first entry of the array will be used as the final argument.
 *
 * A regular expression can also be used.
 * The evaluated argument will be an object containing the `match` and `matches` if global.
 */
export type ArgumentType = BaseArgumentType | (string | string[])[] | RegExp | string;

/**
 * A function for processing user input to use as an argument.
 * A void return value will use the default value for the argument or start a prompt.
 * Any other truthy return value will be used as the evaluated argument.
 * If returning a Promise, the resolved value will go through the above steps.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 */
export type ArgumentTypeCaster = (message: Message, phrase: string) => any;

/**
 * A function for processing some value to use as an argument.
 * This is mainly used in composing argument types.
 * @param message - Message that triggered the command.
 * @param value - Some value.
 */
export type ArgumentTypeCaster_ = (message: Message, value: any) => any;

/**
 * Data passed to functions that run when things failed.
 */
export interface FailureData {
	/** The input phrase that failed if there was one, otherwise an empty string. */
	phrase: string;

	/** The value that failed if there was one, otherwise null. */
	failure: void | (Flag & { value: any });
}

/**
 * Defaults for argument options.
 */
export interface DefaultArgumentOptions {
	/**
	 * Default prompt options.
	 */
	prompt?: ArgumentPromptOptions;

	/**
	 * Default text sent if argument parsing fails.
	 */
	otherwise?: string | MessagePayload | MessageOptions | OtherwiseContentSupplier;

	/**
	 * Function to modify otherwise content.
	 */
	modifyOtherwise?: OtherwiseContentModifier;
}

/**
 * Function get the default value of the argument.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export type DefaultValueSupplier = (message: Message, data: FailureData) => any;

/**
 * A function for validating parsed arguments.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 * @param value - The parsed value.
 */
export type ParsedValuePredicate = (message: Message, phrase: string, value: any) => boolean;

/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text to modify.
 * @param data - Miscellaneous data.
 */
export type OtherwiseContentModifier = (
	message: Message,
	text: string,
	data: FailureData
) => string | MessagePayload | MessageOptions | Promise<string | MessagePayload | MessageOptions>;

/**
 * A function returning the content if argument parsing fails.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export type OtherwiseContentSupplier = (
	message: Message,
	data: FailureData
) => string | MessagePayload | MessageOptions | Promise<string | MessagePayload | MessageOptions>;

/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text from the prompt to modify.
 * @param data - Miscellaneous data.
 */
export type PromptContentModifier = (
	message: Message,
	text: string,
	data: ArgumentPromptData
) => string | MessagePayload | MessageOptions | Promise<string | MessagePayload | MessageOptions>;

/**
 * A function returning text for the prompt.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export type PromptContentSupplier = (
	message: Message,
	data: ArgumentPromptData
) => string | MessagePayload | MessageOptions | Promise<string | MessagePayload | MessageOptions>;
