import {
	type AnnouncementChannel,
	type CategoryChannel,
	type Collection,
	type DirectoryChannel,
	type Emoji,
	type ForumChannel,
	type Guild,
	type GuildBasedChannel,
	type GuildChannel,
	type GuildEmoji,
	type GuildMember,
	type Invite,
	type Message,
	type Role,
	type Snowflake,
	type StageChannel,
	type TextBasedChannel,
	type TextChannel,
	type ThreadChannel,
	type User,
	type VoiceBasedChannel,
	type VoiceChannel
} from "discord.js";
import type { URL } from "node:url";
import { z } from "zod";
import { MessageInstance, MessageSendResolvable, SyncOrAsync, type TextCommandMessage } from "../../../typings/Util.js";
import { ArgumentMatch, BuiltinArgumentType } from "../../../util/Constants.js";
import { intoCallable, isPromise } from "../../../util/Util.js";
import type { AkairoClient } from "../../AkairoClient.js";
import type { ContextMenuCommand } from "../../contextMenuCommands/ContextMenuCommand.js";
import type { Inhibitor } from "../../inhibitors/Inhibitor.js";
import type { Listener } from "../../listeners/Listener.js";
import type { Task } from "../../tasks/Task.js";
import type { Command } from "../Command.js";
import type { CommandHandler } from "../CommandHandler.js";
import { Flag, FlagType } from "../Flag.js";
import type { TypeResolver } from "./TypeResolver.js";

/** ```ts
 * <R = unknown> = ArgumentTypeCaster<R>
 * ``` */
type ATC<R = unknown> = ArgumentTypeCaster<R>;
/** ```ts
 * type OATC<R = unknown> = OmitThisParameter<ArgumentTypeCaster<R>>;
 * ``` */
type OATC<R = unknown> = OmitThisParameter<ArgumentTypeCaster<R>>;
/** ```ts
 * keyof BaseArgumentType
 * ``` */
type KBAT = keyof BaseArgumentType;
/** ```ts
 * <R> = ArgumentTypeCasterReturn<R>
 * ``` */
type ATCR<R> = ArgumentTypeCasterReturn<R>;
/** ```ts
 * ArgumentType
 * ``` */
type AT = ArgumentType;
/** ```ts
 * BaseArgumentType
 * ``` */
type BAT = BaseArgumentType;

/** ```ts
 * <T extends ArgumentTypeCaster> = ArgumentTypeCaster<ArgumentTypeCasterReturn<T>>
 * ``` */
type ATCATCR<T extends ArgumentTypeCaster> = ArgumentTypeCaster<ArgumentTypeCasterReturn<T>>;
/** ```ts
 * <T extends keyof BaseArgumentType> = ArgumentTypeCaster<BaseArgumentType[T]>
 * ``` */
type ATCBAT<T extends keyof BaseArgumentType> = ArgumentTypeCaster<BaseArgumentType[T]>;

/**
 * Represents an argument for a command.
 */
export class Argument {
	/**
	 * The command this argument belongs to.
	 */
	public command: Command;

	/**
	 * The default value of the argument or a function supplying the default value.
	 */
	public default: OmitThisParameter<DefaultValueSupplier> | any;

	/**
	 *  Description of the command.
	 */
	public description: string | any;

	/**
	 * The string(s) to use for flag or option match.
	 */
	public flag: string | string[] | null;

	/**
	 * The index to start from.
	 */
	public index: number | null;

	/**
	 * The amount of phrases to match for rest, separate, content, or text match.
	 */
	public limit: number;

	/**
	 * The method to match text.
	 */
	public match: ArgumentMatchString;

	/**
	 * Function to modify otherwise content.
	 */
	public modifyOtherwise: OtherwiseContentModifier | null;

	/**
	 * Whether to process multiple option flags instead of just the first.
	 */
	public multipleFlags: boolean;

	/**
	 * The content or function supplying the content sent when argument parsing fails.
	 */
	public otherwise: MessageSendResolvable | OmitThisParameter<OtherwiseContentSupplier> | null;

	/**
	 * The prompt options.
	 */
	public prompt: ArgumentPromptOptions | boolean | null;

	/**
	 * The type to cast to or a function to use to cast.
	 */
	public type: ArgumentType | OmitThisParameter<ArgumentTypeCaster>;

	/**
	 * Whether or not the argument is unordered.
	 */
	public unordered: boolean | number | number[];

	/**
	 * @param command - Command of the argument.
	 * @param options - Options for the argument.
	 */
	public constructor(command: Command, options: ArgumentOptions = {}) {
		ArgumentOptions.parse(options);

		const {
			match,
			type,
			flag,
			multipleFlags,
			index,
			unordered,
			limit,
			prompt,
			default: defaultValue,
			otherwise,
			modifyOtherwise
		} = options;

		this.command = command;
		this.match = match ?? ArgumentMatch.PHRASE;
		this.type = typeof type === "function" ? type.bind(this) : (type ?? BuiltinArgumentType.STRING);
		this.flag = flag ?? null;
		this.multipleFlags = multipleFlags ?? false;
		this.index = index ?? null;
		this.unordered = unordered ?? false;
		this.limit = limit ?? Infinity;
		this.prompt = prompt ?? null;
		this.default = typeof defaultValue === "function" ? defaultValue.bind(this) : (defaultValue ?? null);
		this.otherwise = typeof otherwise === "function" ? otherwise.bind(this) : (otherwise ?? null);
		this.modifyOtherwise = modifyOtherwise ?? null;
	}

	/**
	 * The client.
	 */
	public get client(): AkairoClient {
		return this.command.client;
	}

	/**
	 * The command handler.
	 */
	public get handler(): CommandHandler {
		return this.command.handler;
	}

	/**
	 * Casts a phrase to this argument's type.
	 * @param message - Message that called the command.
	 * @param phrase - Phrase to process.
	 */
	public cast(message: TextCommandMessage, phrase: string): Promise<any> {
		return Argument.cast(this.type, this.handler.resolver, message, phrase);
	}

	/**
	 * Collects input from the user by prompting.
	 * @param message - Message to prompt.
	 * @param commandInput - Previous input from command if there was one.
	 * @param parsedInput - Previous parsed input from command if there was one.
	 */
	public async collect(message: TextCommandMessage, commandInput = "", parsedInput: any = null): Promise<Flag | any> {
		const promptOptions = {
			...this.handler.argumentDefaults.prompt,
			...this.command.argumentDefaults.prompt,
			...(typeof this.prompt === "object" ? this.prompt : {})
		};

		/* const promptOptions: ArgumentPromptOptions = {};
		Object.assign(promptOptions, this.handler.argumentDefaults.prompt);
		Object.assign(promptOptions, this.command.argumentDefaults.prompt);
		Object.assign(promptOptions, this.prompt || {}); */

		const isInfinite = promptOptions.infinite || (this.match === ArgumentMatch.SEPARATE && !commandInput);
		const additionalRetry = Number(Boolean(commandInput));
		const values: any[] | null = isInfinite ? [] : null;

		const getText = async (
			promptType: "start" | "retry" | "timeout" | "ended" | "cancel",
			prompter: ArgumentPromptResponse | undefined,
			retryCount: number,
			inputMessage: TextCommandMessage | undefined,
			inputPhrase: string | undefined,
			inputParsed: "stop" | "cancel" | "" | null | undefined | Flag<FlagType.Fail>
		) => {
			let text = await intoCallable(prompter).call(this, message, {
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
				text = await modifier.call(this, message, text!, {
					retries: retryCount,
					infinite: isInfinite,
					message: inputMessage!,
					phrase: inputPhrase!,
					// @ts-expect-error
					failure: inputParsed
				});

				if (Array.isArray(text)) {
					text = text.join("\n");
				}
			}

			return text;
		};

		// eslint-disable-next-line complexity
		const promptOne = async (
			prevMessage: TextCommandMessage | undefined,
			prevInput: string | undefined,
			prevParsed: "stop" | "cancel" | "" | null | undefined | Flag<FlagType.Fail>,
			retryCount: number
		): Promise<any> => {
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

			let input: TextCommandMessage;
			try {
				input = (
					await message.channel.awaitMessages({
						filter: m => m.author.id === message.author.id,
						max: 1,
						time: promptOptions.time,
						errors: ["time"]
					})
				).first()! as TextCommandMessage;
				if (message.util) message.util.addMessage(input);
			} catch {
				const timeoutText = await getText("timeout", promptOptions.timeout, retryCount, prevMessage, prevInput, "");
				if (timeoutText) {
					const sentTimeout = await message.channel.send(timeoutText);
					if (message.util) message.util.addMessage(sentTimeout);
				}
				if (!promptOptions.time) return Flag.cancel();
				return Flag.timeout(promptOptions.time);
			}

			if (promptOptions.breakout) {
				const looksLike = await this.handler.parseCommand(input);
				if (looksLike?.command) return Flag.retry(input);
			}

			if (input?.content.toLowerCase() === promptOptions.cancelWord.toLowerCase()) {
				const cancelText = await getText("cancel", promptOptions.cancel, retryCount, input, input?.content, "cancel");
				if (cancelText) {
					const sentCancel = await message.channel.send(cancelText);
					if (message.util) message.util.addMessage(sentCancel);
				}

				return Flag.cancel();
			}

			if (isInfinite && input?.content.toLowerCase() === promptOptions.stopWord!.toLowerCase()) {
				if (!values!.length) return promptOne(input, input?.content, null, retryCount + 1);
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
				values!.push(parsedValue);
				const limit = promptOptions.limit!;
				if (values!.length < limit) return promptOne(message, input.content, parsedValue, 1);

				return values!;
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
	public async process(message: TextCommandMessage, phrase: string): Promise<Flag | any> {
		const commandDefs = this.command.argumentDefaults;
		const handlerDefs = this.handler.argumentDefaults;
		const optional =
			(typeof this.prompt === "object" && this.prompt?.optional) ??
			commandDefs.prompt?.optional ??
			handlerDefs.prompt?.optional ??
			null;

		const doOtherwise = async (failure: Flag<FlagType.Fail> | null | undefined) => {
			const otherwise = this.otherwise ?? commandDefs.otherwise ?? handlerDefs.otherwise ?? null;

			const modifyOtherwise = this.modifyOtherwise ?? commandDefs.modifyOtherwise ?? handlerDefs.modifyOtherwise ?? null;

			let text = await intoCallable(otherwise).call(this, message, {
				phrase,
				failure
			});
			if (Array.isArray(text)) {
				text = text.join("\n");
			}

			if (modifyOtherwise) {
				text = await modifyOtherwise.call(this, message, text!, {
					phrase,
					failure: failure ?? null
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

			return intoCallable(this.default)(message, {
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

			return this.default == null ? res : intoCallable(this.default)(message, { phrase, failure: res });
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
	public static cast<T extends ATC>(
		type: T,
		resolver: TypeResolver,
		message: TextCommandMessage,
		phrase: string
	): Promise<ATCR<T>>;
	public static cast<T extends KBAT>(
		type: T,
		resolver: TypeResolver,
		message: TextCommandMessage,
		phrase: string
	): Promise<BAT[T]>;
	public static cast(type: AT | ATC, resolver: TypeResolver, message: TextCommandMessage, phrase: string): Promise<any>;
	public static async cast(type: OATC | AT, resolver: TypeResolver, message: TextCommandMessage, phrase: string): Promise<any> {
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
			if (isPromise(res)) res = await res;
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
			if (isPromise(res)) res = await res;
			return res;
		}

		return phrase || null;
	}

	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the entire composition fails.
	 * @param types - Types to use.
	 */
	public static compose<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static compose<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static compose(...types: (AT | ATC)[]): ATC;
	public static compose(...types: (AT | ATC)[]): ATC {
		return async function typeFn(this: Argument, message, phrase) {
			let acc: any = phrase;
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
	public static composeWithFailure<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static composeWithFailure<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static composeWithFailure(...types: (AT | ATC)[]): ATC;
	public static composeWithFailure(...types: (AT | ATC)[]): ATC {
		return async function typeFn(this: Argument, message, phrase) {
			let acc: any = phrase;
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
	public static isFailure(value: unknown): value is null | undefined | Flag<FlagType.Fail> {
		return value == null || Flag.is(value, FlagType.Fail);
	}

	/**
	 * Creates a type from multiple types (product type).
	 * Only inputs where each type resolves with a non-void value are valid.
	 * @param types - Types to use.
	 */
	public static product<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static product<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static product(...types: (AT | ATC)[]): ATC;
	public static product(...types: (AT | ATC)[]): ATC {
		return async function typeFn(this: Argument, message, phrase) {
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
	public static range<T extends ATC>(type: T, min: number, max: number, inclusive?: boolean): ATCATCR<T>;
	public static range<T extends KBAT>(type: T, min: number, max: number, inclusive?: boolean): ATCBAT<T>;
	public static range(type: AT | ATC, min: number, max: number, inclusive?: boolean): ATC;
	public static range(type: AT | ATC, min: number, max: number, inclusive = false): ATC {
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
	public static tagged<T extends ATC>(type: T, tag?: any): ATCATCR<T>;
	public static tagged<T extends KBAT>(type: T, tag?: any): ATCBAT<T>;
	public static tagged(type: AT | ATC, tag?: any): ATC;
	public static tagged(type: AT | ATC, tag: any = type): ATC {
		return async function typeFn(this: Argument, message, phrase) {
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
	public static taggedUnion<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static taggedUnion<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static taggedUnion(...types: (AT | ATC)[]): ATC;
	public static taggedUnion(...types: (AT | ATC)[]): ATC {
		return async function typeFn(this: Argument, message, phrase) {
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
	public static taggedWithInput<T extends ATC>(type: T, tag?: any): ATCATCR<T>;
	public static taggedWithInput<T extends KBAT>(type: T, tag?: any): ATCBAT<T>;
	public static taggedWithInput(type: AT | ATC, tag?: any): ATC;
	public static taggedWithInput(type: AT | ATC, tag: any = type): ATC {
		return async function typeFn(this: Argument, message, phrase) {
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
	public static union<T extends ATC>(...types: T[]): ATCATCR<T>;
	public static union<T extends KBAT>(...types: T[]): ATCBAT<T>;
	public static union(...types: (AT | ATC)[]): ATC;
	public static union(...types: (AT | ATC)[]): ATC {
		return async function typeFn(this: Argument, message, phrase) {
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
	public static validate<T extends ATC>(type: T, predicate: ParsedValuePredicate): ATCATCR<T>;
	public static validate<T extends KBAT>(type: T, predicate: ParsedValuePredicate): ATCBAT<T>;
	public static validate(type: AT | ATC, predicate: ParsedValuePredicate): ATC;
	public static validate(type: AT | ATC, predicate: ParsedValuePredicate): ATC {
		return async function typeFn(this: Argument, message, phrase) {
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
	public static withInput<T extends ATC>(type: T): ATC<ATCR<T>>;
	public static withInput<T extends KBAT>(type: T): ATCBAT<T>;
	public static withInput(type: AT | ATC): ATC;
	public static withInput(type: AT | ATC): ATC {
		return async function typeFn(this: Argument, message, phrase) {
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
 * Data passed to argument prompt functions.
 */
export type ArgumentPromptData = {
	/**
	 * Amount of retries so far.
	 */
	retries: number;

	/**
	 * Whether the prompt is infinite or not.
	 */
	infinite: boolean;

	/**
	 * The message that caused the prompt.
	 */
	message: TextCommandMessage;

	/**
	 * The input phrase that caused the prompt if there was one, otherwise an empty string.
	 */
	phrase: string;

	/**
	 * The value that failed if there was one, otherwise null.
	 */
	failure: null | Flag<FlagType.Fail>;
};
export const ArgumentPromptData = z.object({
	retries: z.number(),
	infinite: z.boolean(),
	message: MessageInstance,
	phrase: z.string(),
	failure: z.instanceof(Flag<FlagType.Fail>).nullable()
});

/**
 * A function returning text for the prompt.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export type PromptContentSupplier = (message: TextCommandMessage, data: ArgumentPromptData) => SyncOrAsync<MessageSendResolvable>;
export const PromptContentSupplier = z
	.function()
	.args(MessageInstance, ArgumentPromptData)
	.returns(SyncOrAsync(MessageSendResolvable));

export type ArgumentPromptResponse = MessageSendResolvable | PromptContentSupplier;
export const ArgumentPromptResponse = z.union([MessageSendResolvable, PromptContentSupplier]);

/**
 * Data passed to functions that run when things failed.
 */
export type FailureData = {
	/**
	 * The input phrase that failed if there was one, otherwise an empty string.
	 */
	phrase: string;

	/**
	 * The value that failed if there was one, otherwise null.
	 */
	failure: null | Flag<FlagType.Fail>;
};
export const FailureData = z.object({
	phrase: z.string(),
	failure: z.instanceof(Flag<FlagType.Fail>).nullable()
});

/**
 * A function returning the content if argument parsing fails.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export type OtherwiseContentSupplier = (
	this: Argument,
	message: TextCommandMessage,
	data: FailureData
) => SyncOrAsync<MessageSendResolvable>;
export const OtherwiseContentSupplier = z
	.function()
	.args(MessageInstance, FailureData)
	.returns(SyncOrAsync(MessageSendResolvable));

/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text from the prompt to modify.
 * @param data - Miscellaneous data.
 */
export type PromptContentModifier = (
	this: Argument,
	message: TextCommandMessage,
	text: MessageSendResolvable | OtherwiseContentSupplier,
	data: ArgumentPromptData
) => SyncOrAsync<MessageSendResolvable>;
export const PromptContentModifier = z
	.function()
	.args(MessageInstance, z.union([MessageSendResolvable, OtherwiseContentSupplier]))
	.returns(SyncOrAsync(MessageSendResolvable));

/**
 * A prompt to run if the user did not input the argument correctly.
 * Can only be used if there is not a default value (unless optional is true).
 */
export type ArgumentPromptOptions = {
	/**
	 * Whenever an input matches the format of a command, this option controls whether or not to cancel this command and run that command.
	 * The command to be run may be the same command or some other command.
	 * @default true
	 */
	breakout?: boolean;

	/**
	 * Text sent on cancellation of command.
	 */
	cancel?: ArgumentPromptResponse;

	/**
	 * Word to use for cancelling the command.
	 * @default "cancel"
	 */
	cancelWord?: string;

	/**
	 * Text sent on amount of tries reaching the max.
	 */
	ended?: ArgumentPromptResponse;

	/**
	 * Prompts forever until the stop word, cancel word, time limit, or retry limit.
	 * Note that the retry count resets back to one on each valid entry.
	 * The final evaluated argument will be an array of the inputs.
	 * @default false
	 */
	infinite?: boolean;

	/**
	 * Amount of inputs allowed for an infinite prompt before finishing.
	 * @default Infinity.
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
	 * Prompts only when argument is provided but was not of the right type.
	 * @default false
	 */
	optional?: boolean;

	/**
	 * Amount of retries allowed.
	 * @default 1
	 */
	retries?: number;

	/**
	 * Text sent on a retry (failure to cast type).
	 */
	retry?: ArgumentPromptResponse;

	/**
	 * Text sent on start of prompt.
	 */
	start?: ArgumentPromptResponse;

	/**
	 * Word to use for ending infinite prompts.
	 * @default "stop"
	 */
	stopWord?: string;

	/**
	 * Time to wait for input.
	 * @default 30000
	 */
	time?: number;

	/**
	 * Text sent on collector time out.
	 */
	timeout?: ArgumentPromptResponse;
};

export const ArgumentPromptOptions = z.object({
	breakout: z.boolean().optional(),
	cancel: ArgumentPromptResponse.optional(),
	cancelWord: z.string().optional(),
	ended: ArgumentPromptResponse.optional(),
	infinite: z.boolean().optional(),
	limit: z.number().optional(),
	modifyCancel: PromptContentModifier.optional(),
	modifyEnded: PromptContentModifier.optional(),
	modifyRetry: PromptContentModifier.optional(),
	modifyStart: PromptContentModifier.optional(),
	modifyTimeout: PromptContentModifier.optional(),
	optional: z.boolean().optional(),
	retries: z.number().optional(),
	retry: ArgumentPromptResponse.optional(),
	start: ArgumentPromptResponse.optional(),
	stopWord: z.string().optional(),
	time: z.number().optional(),
	timeout: ArgumentPromptResponse.optional()
});

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
export type ArgumentMatchString = `${ArgumentMatch}`;

/**
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
 * - `announcementChannel` tries to resolve to a announcement channel.
 * - `stageChannel` tries to resolve to a stage channel.
 * - `threadChannel` tries to resolve a thread channel.
 * - `directoryChannel` tries to resolve to a directory channel.
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
 */
export interface BaseArgumentType {
	string: string | null;
	lowercase: string | null;
	uppercase: string | null;
	charCodes: number[] | null;
	number: number | null;
	integer: number | null;
	bigint: bigint | null;
	emojint: number | null;
	url: URL | null;
	date: Date | null;
	color: number | null;
	user: User | null;
	users: Collection<Snowflake, User> | null;
	member: GuildMember | null;
	members: Collection<Snowflake, GuildMember> | null;
	relevant: User | GuildMember | null;
	relevants: Collection<Snowflake, User> | Collection<Snowflake, GuildMember> | null;
	channel: GuildBasedChannel | null;
	channels: Collection<Snowflake, GuildBasedChannel> | null;
	textChannel: TextChannel | null;
	textChannels: Collection<Snowflake, TextChannel> | null;
	voiceChannel: VoiceChannel | null;
	voiceChannels: Collection<Snowflake, VoiceChannel> | null;
	categoryChannel: CategoryChannel | null;
	categoryChannels: Collection<Snowflake, CategoryChannel> | null;
	announcementChannel: AnnouncementChannel | null;
	announcementChannels: Collection<Snowflake, AnnouncementChannel> | null;
	stageChannel: StageChannel | null;
	stageChannels: Collection<Snowflake, StageChannel> | null;
	threadChannel: ThreadChannel | null;
	threadChannels: Collection<Snowflake, ThreadChannel> | null;
	directoryChannel: DirectoryChannel | null;
	directoryChannels: Collection<Snowflake, DirectoryChannel> | null;
	forumChannel: ForumChannel | null;
	forumChannels: Collection<Snowflake, ForumChannel> | null;
	textBasedChannel: TextBasedChannel | null;
	textBasedChannels: Collection<Snowflake, TextBasedChannel> | null;
	voiceBasedChannel: VoiceBasedChannel | null;
	voiceBasedChannels: Collection<Snowflake, VoiceBasedChannel> | null;
	role: Role | null;
	roles: Collection<Snowflake, Role> | null;
	emoji: Emoji | null;
	emojis: Collection<Snowflake, Emoji> | null;
	guild: Guild | null;
	guilds: Collection<Snowflake, Guild> | null;
	message: Message | null;
	guildMessage: Message<true> | null;
	relevantMessage: Message | null;
	invite: Invite | null;
	userMention: User | null;
	memberMention: GuildMember | null;
	channelMention: ThreadChannel | GuildChannel | null;
	roleMention: Role | null;
	emojiMention: GuildEmoji | null;
	commandAlias: Command | null;
	command: Command | null;
	inhibitor: Inhibitor | null;
	listener: Listener | null;
	task: Task | null;
	contextMenuCommand: ContextMenuCommand | null;
}

type BaseArgumentTypeComplete = { [K in `${BuiltinArgumentType}`]: BaseArgumentType[K] };

/**
 * The type that the argument should be cast to.
 *
 * An array of strings can be used to restrict input to only those strings, case insensitive.
 * The array can also contain an inner array of strings, for aliases.
 * If so, the first entry of the array will be used as the final argument.
 *
 * A regular expression can also be used.
 * The evaluated argument will be an object containing the `match` and `matches` if global.
 */
export type ArgumentType = keyof BaseArgumentType | (string | string[])[] | RegExp | string;

export const ArgumentType = z.union([z.string(), z.union([z.string(), z.string().array()]).array(), z.instanceof(RegExp)]);

/**
 * A function for processing user input to use as an argument.
 * A void return value will use the default value for the argument or start a prompt.
 * Any other truthy return value will be used as the evaluated argument.
 * If returning a Promise, the resolved value will go through the above steps.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 */
export type ArgumentTypeCaster<R = unknown> = (this: Argument, message: TextCommandMessage, phrase: string) => R;

export const ArgumentTypeCaster = z.function().args(MessageInstance, z.string()).returns(z.any());

/**
 * The return type of an argument.
 */
export type ArgumentTypeCasterReturn<R> = R extends ArgumentTypeCaster<infer S> ? S : R;

/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text to modify.
 * @param data - Miscellaneous data.
 */
export type OtherwiseContentModifier = (
	this: Argument,
	message: TextCommandMessage,
	text: MessageSendResolvable | OtherwiseContentSupplier,
	data: FailureData
) => SyncOrAsync<MessageSendResolvable>;

export const OtherwiseContentModifier = z
	.function()
	.args(MessageInstance, z.union([MessageSendResolvable, OtherwiseContentSupplier], FailureData))
	.returns(SyncOrAsync(MessageSendResolvable));

/**
 * Base Argument options
 */
export type BaseArgumentOptions = {
	/**
	 * Default text sent if argument parsing fails.
	 */
	otherwise?: MessageSendResolvable | OtherwiseContentSupplier;

	/**
	 * Function to modify otherwise content.
	 */
	modifyOtherwise?: OtherwiseContentModifier;
};
export const BaseArgumentOptions = z.object({
	otherwise: z.union([MessageSendResolvable, OtherwiseContentSupplier]).optional(),
	modifyOtherwise: OtherwiseContentModifier.optional()
});

/**
 * Defaults for argument options.
 */
export type DefaultArgumentOptions = BaseArgumentOptions & {
	/**
	 * Default prompt options.
	 */
	prompt?: ArgumentPromptOptions;
};
export const DefaultArgumentOptions = BaseArgumentOptions.extend({
	prompt: ArgumentPromptOptions.optional()
});

/**
 * The argument defaults with default values provided.
 */
export interface ArgumentDefaults extends BaseArgumentOptions {
	/**
	 * Prompt options.
	 */
	prompt: ArgumentPromptOptions &
		Required<
			Pick<ArgumentPromptOptions, "breakout" | "cancelWord" | "infinite" | "limit" | "optional" | "retries" | "stopWord" | "time">
		>;
}

/**
 * Function get the default value of the argument.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export type DefaultValueSupplier = (this: Argument, message: TextCommandMessage, data: FailureData) => any;
export const DefaultValueSupplier = z.function().args(MessageInstance, FailureData).returns(z.any());

/**
 * A function for validating parsed arguments.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 * @param value - The parsed value.
 */
export type ParsedValuePredicate = (message: TextCommandMessage, phrase: string, value: any) => boolean;
export const ParsedValuePredicate = z.function().args(MessageInstance, z.string(), z.any()).returns(z.boolean());

/**
 * Options for how an argument parses text.
 */
export type ArgumentOptions = {
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
	 * @default null
	 */
	flag?: string | string[] | null;

	/**
	 * ID of the argument for use in the args object. This does nothing inside an ArgumentGenerator.
	 */
	id?: string | null;

	/**
	 * Index of phrase to start from. Applicable to phrase, text, content, rest, or separate match only.
	 * Ignored when used with the unordered option.
	 * @default null
	 */
	index?: number | null;

	/**
	 * Amount of phrases to match when matching more than one.
	 * Applicable to text, content, rest, or separate match only.
	 * @default Infinity.
	 */
	limit?: number;

	/**
	 * Method to match text. Defaults to 'phrase'.
	 * @default ArgumentMatch.PHRASE
	 */
	match?: ArgumentMatchString;

	/**
	 * Function to modify otherwise content.
	 */
	modifyOtherwise?: OtherwiseContentModifier | null;

	/**
	 * Whether or not to have flags process multiple inputs.
	 * For option flags, this works like the separate match; the limit option will also work here.
	 * For flags, this will count the number of occurrences.
	 * @default false
	 */
	multipleFlags?: boolean;

	/**
	 * Text sent if argument parsing fails. This overrides the `default` option and all prompt options.
	 */
	otherwise?: MessageSendResolvable | OtherwiseContentSupplier | null;

	/**
	 * Prompt options for when user does not provide input.
	 */
	prompt?: ArgumentPromptOptions | boolean | null;

	/**
	 * Type to cast to.
	 * @default ArgumentType.STRING
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
	 * @default false
	 */
	unordered?: boolean | number | number[];
};

export const ArgumentOptions = z.object({
	default: z.any(),
	description: z.any(),
	flag: z.union([z.string(), z.string().array()]).nullish(),
	id: z.string().nullish(),
	index: z.number().nullish(),
	limit: z.number().optional(),
	match: z.nativeEnum(ArgumentMatch).optional(),
	modifyOtherwise: OtherwiseContentModifier.nullish().optional(),
	multipleFlags: z.boolean().optional(),
	otherwise: z.union([MessageSendResolvable, OtherwiseContentSupplier]).nullish(),
	prompt: z.union([ArgumentPromptOptions, z.boolean()]).nullish(),
	type: z.union([ArgumentType, ArgumentTypeCaster]).optional(),
	unordered: z.union([z.boolean(), z.number(), z.number().array()]).optional()
});
