/// <reference types="node" />
import Flag from "../Flag";
import Command from "../Command";
import { MessageOptions } from "child_process";
import { Message, MessagePayload } from "discord.js";
import TypeResolver from "./TypeResolver";
/**
 * Represents an argument for a command.
 * @param command - Command of the argument.
 * @param options - Options for the argument.
 */
export default class Argument {
	/**
	 * The client.
	 */
	get client(): import("../../AkairoClient").default;
	/**
	 * The command this argument belongs to.
	 */
	command: Command;
	/**
	 * The default value of the argument or a function supplying the default value.
	 */
	default: DefaultValueSupplier | any;
	description: string | any;
	/**
	 * The string(s) to use for flag or option match.
	 */
	flag?: string | string[];
	/**
	 * The command handler.
	 */
	get handler(): import("../CommandHandler").default;
	/**
	 * The index to start from.
	 */
	index?: number;
	/**
	 * The amount of phrases to match for rest, separate, content, or text match.
	 */
	limit: number;
	/**
	 * The method to match text.
	 */
	match: ArgumentMatch;
	/**
	 * Function to modify otherwise content.
	 */
	modifyOtherwise: OtherwiseContentModifier;
	/**
	 * Whether to process multiple option flags instead of just the first.
	 */
	multipleFlags: boolean;
	/**
	 * The content or function supplying the content sent when argument parsing fails.
	 */
	otherwise?:
		| string
		| MessagePayload
		| MessageOptions
		| OtherwiseContentSupplier;
	/**
	 * The prompt options.
	 */
	prompt?: ArgumentPromptOptions | boolean;
	/**
	 * The type to cast to or a function to use to cast.
	 */
	type: ArgumentType | ArgumentTypeCaster;
	/**
	 * Whether or not the argument is unordered.
	 */
	unordered: boolean | number | number[];
	constructor(
		command: Command,
		{
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
		}?: ArgumentOptions
	);
	/**
	 * Casts a phrase to this argument's type.
	 * @param message - Message that called the command.
	 * @param phrase - Phrase to process.
	 */
	cast(message: Message, phrase: string): Promise<any>;
	/**
	 * Collects input from the user by prompting.
	 * @param message - Message to prompt.
	 * @param commandInput - Previous input from command if there was one.
	 * @param parsedInput - Previous parsed input from command if there was one.
	 */
	collect(
		message: Message,
		commandInput?: string,
		parsedInput?: any
	): Promise<Flag | any>;
	/**
	 * Processes the type casting and prompting of the argument for a phrase.
	 * @param message - The message that called the command.
	 * @param phrase - The phrase to process.
	 */
	process(message: Message, phrase: string): Promise<Flag | any>;
	/**
	 * Casts a phrase to this argument's type.
	 * @param type - The type to cast to.
	 * @param resolver - The type resolver.
	 * @param message - Message that called the command.
	 * @param phrase - Phrase to process.
	 */
	static cast(
		type: ArgumentType | ArgumentTypeCaster,
		resolver: TypeResolver,
		message: Message,
		phrase: string
	): Promise<any>;
	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the entire composition fails.
	 * @param types - Types to use.
	 */
	static compose(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;
	/**
	 * Creates a type that is the left-to-right composition of the given types.
	 * If any of the types fails, the composition still continues with the failure passed on.
	 * @param types - Types to use.
	 */
	static composeWithFailure(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;
	/**
	 * Checks if something is null, undefined, or a fail flag.
	 * @param value - Value to check.
	 */
	static isFailure(value: any): value is
		| null
		| undefined
		| (Flag & {
				value: any;
		  });
	/**
	 * Creates a type from multiple types (product type).
	 * Only inputs where each type resolves with a non-void value are valid.
	 * @param types - Types to use.
	 */
	static product(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;
	/**
	 * Creates a type where the parsed value must be within a range.
	 * @param type - The type to use.
	 * @param min - Minimum value.
	 * @param max - Maximum value.
	 * @param inclusive - Whether or not to be inclusive on the upper bound.
	 */
	static range(
		type: ArgumentType | ArgumentTypeCaster,
		min: number,
		max: number,
		inclusive?: boolean
	): ArgumentTypeCaster;
	/**
	 * Creates a type that parses as normal but also tags it with some data.
	 * Result is in an object `{ tag, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
	 */
	static tagged(
		type: ArgumentType | ArgumentTypeCaster,
		tag?: any
	): ArgumentTypeCaster;
	/**
	 * Creates a type from multiple types (union type).
	 * The first type that resolves to a non-void value is used.
	 * Each type will also be tagged using `tagged` with themselves.
	 * @param types - Types to use.
	 */
	static taggedUnion(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;
	/**
	 * Creates a type that parses as normal but also tags it with some data and carries the original input.
	 * Result is in an object `{ tag, input, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 * @param tag - Tag to add. Defaults to the `type` argument, so useful if it is a string.
	 */
	static taggedWithInput(
		type: ArgumentType | ArgumentTypeCaster,
		tag?: any
	): ArgumentTypeCaster;
	/**
	 * Creates a type from multiple types (union type).
	 * The first type that resolves to a non-void value is used.
	 * @param types - Types to use.
	 */
	static union(
		...types: (ArgumentType | ArgumentTypeCaster)[]
	): ArgumentTypeCaster;
	/**
	 * Creates a type with extra validation.
	 * If the predicate is not true, the value is considered invalid.
	 * @param type - The type to use.
	 * @param predicate - The predicate function.
	 */
	static validate(
		type: ArgumentType | ArgumentTypeCaster,
		predicate: ParsedValuePredicate
	): ArgumentTypeCaster;
	/**
	 * Creates a type that parses as normal but also carries the original input.
	 * Result is in an object `{ input, value }` and wrapped in `Flag.fail` when failed.
	 * @param type - The type to use.
	 */
	static withInput(type: ArgumentType | ArgumentTypeCaster): ArgumentTypeCaster;
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
	/** The description of the argument */
	description?: string | any | any[];
	/** The string(s) to use as the flag for flag or option match. */
	flag?: string | string[];
	/**  ID of the argument for use in the args object. This does nothing inside an ArgumentGenerator. */
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
	/** Method to match text. Defaults to 'phrase'. */
	match?: ArgumentMatch;
	/** Function to modify otherwise content. */
	modifyOtherwise?: OtherwiseContentModifier;
	/**
	 * Whether or not to have flags process multiple inputs.
	 * For option flags, this works like the separate match; the limit option will also work here.
	 * For flags, this will count the number of occurrences.
	 */
	multipleFlags?: boolean;
	/** Text sent if argument parsing fails. This overrides the `default` option and all prompt options. */
	otherwise?:
		| string
		| MessagePayload
		| MessageOptions
		| OtherwiseContentSupplier;
	/** Prompt options for when user does not provide input. */
	prompt?: ArgumentPromptOptions | boolean;
	/** Type to cast to. */
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
	/** Whether the prompt is infinite or not. */
	infinite: boolean;
	/** The message that caused the prompt. */
	message: Message;
	/** Amount of retries so far. */
	retries: number;
	/** The input phrase that caused the prompt if there was one, otherwise an empty string. */
	phrase: string;
	/** The value that failed if there was one, otherwise null. */
	failure:
		| void
		| (Flag & {
				value: any;
		  });
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
	/** Text sent on cancellation of command. */
	cancel?: string | MessagePayload | MessageOptions | PromptContentSupplier;
	/** Word to use for cancelling the command. Defaults to 'cancel'. */
	cancelWord?: string;
	/** Text sent on amount of tries reaching the max. */
	ended?: string | MessagePayload | MessageOptions | PromptContentSupplier;
	/**
	 * Prompts forever until the stop word, cancel word, time limit, or retry limit.
	 * Note that the retry count resets back to one on each valid entry.
	 * The final evaluated argument will be an array of the inputs.
	 * Defaults to false.
	 */
	infinite?: boolean;
	/** Amount of inputs allowed for an infinite prompt before finishing. Defaults to Infinity. */
	limit?: number;
	/** Function to modify cancel messages. */
	modifyCancel?: PromptContentModifier;
	/** Function to modify out of tries messages. */
	modifyEnded?: PromptContentModifier;
	/** Function to modify retry prompts. */
	modifyRetry?: PromptContentModifier;
	/** Function to modify start prompts. */
	modifyStart?: PromptContentModifier;
	/** Function to modify timeout messages. */
	modifyTimeout?: PromptContentModifier;
	/** Prompts only when argument is provided but was not of the right type. Defaults to false. */
	optional?: boolean;
	/** Amount of retries allowed. Defaults to 1. */
	retries?: number;
	/** Text sent on a retry (failure to cast type). */
	retry?: string | MessagePayload | MessageOptions | PromptContentSupplier;
	/** Text sent on start of prompt. */
	start?: string | MessagePayload | MessageOptions | PromptContentSupplier;
	/** Word to use for ending infinite prompts. Defaults to 'stop'. */
	stopWord?: string;
	/** Time to wait for input. Defaults to 30000. */
	time?: number;
	/** Text sent on collector time out. */
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
export declare type ArgumentMatch =
	| "phrase"
	| "flag"
	| "option"
	| "rest"
	| "separate"
	| "text"
	| "content"
	| "restContent"
	| "none";
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
 *
 * Possible Discord-related types.
 * These types can be plural (add an 's' to the end) and a collection of matching objects will be used.
 * - `user` tries to resolve to a user.
 * - `member` tries to resolve to a member.
 * - `relevant` tries to resolve to a relevant user, works in both guilds and DMs.
 * - `channel` tries to resolve to a channel.
 * - `textChannel` tries to resolve to a text channel.
 * - `voiceChannel` tries to resolve to a voice channel.
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
export declare type ArgumentType =
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
	| (string | string[])[]
	| RegExp
	| string;
/**
 * A function for processing user input to use as an argument.
 * A void return value will use the default value for the argument or start a prompt.
 * Any other truthy return value will be used as the evaluated argument.
 * If returning a Promise, the resolved value will go through the above steps.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 */
export declare type ArgumentTypeCaster = (
	message: Message,
	phrase: string
) => any;
/**
 * A function for processing some value to use as an argument.
 * This is mainly used in composing argument types.
 * @param message - Message that triggered the command.
 * @param value - Some value.
 */
export declare type ArgumentTypeCaster_ = (message: Message, value: any) => any;
/**
 * Data passed to functions that run when things failed.
 */
export interface FailureData {
	/** The input phrase that failed if there was one, otherwise an empty string. */
	phrase: string;
	/** The value that failed if there was one, otherwise null. */
	failure:
		| void
		| (Flag & {
				value: any;
		  });
}
/**
 * Defaults for argument options.
 */
export interface DefaultArgumentOptions {
	/** Default prompt options. */
	prompt?: ArgumentPromptOptions;
	/** Default text sent if argument parsing fails. */
	otherwise?:
		| string
		| MessagePayload
		| MessageOptions
		| OtherwiseContentSupplier;
	/** Function to modify otherwise content. */
	modifyOtherwise?: OtherwiseContentModifier;
}
/**
 * Function get the default value of the argument.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export declare type DefaultValueSupplier = (
	message: Message,
	data: FailureData
) => any;
/**
 * A function for validating parsed arguments.
 * @param message - Message that triggered the command.
 * @param phrase - The user input.
 * @param value - The parsed value.
 */
export declare type ParsedValuePredicate = (
	message: Message,
	phrase: string,
	value: any
) => boolean;
/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text to modify.
 * @param data - Miscellaneous data.
 */
export declare type OtherwiseContentModifier = (
	message: Message,
	text: string,
	data: FailureData
) =>
	| string
	| MessagePayload
	| MessageOptions
	| Promise<string | MessagePayload | MessageOptions>;
/**
 * A function returning the content if argument parsing fails.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export declare type OtherwiseContentSupplier = (
	message: Message,
	data: FailureData
) =>
	| string
	| MessagePayload
	| MessageOptions
	| Promise<string | MessagePayload | MessageOptions>;
/**
 * A function modifying a prompt text.
 * @param message - Message that triggered the command.
 * @param text - Text from the prompt to modify.
 * @param data - Miscellaneous data.
 */
export declare type PromptContentModifier = (
	message: Message,
	text: string,
	data: ArgumentPromptData
) =>
	| string
	| MessagePayload
	| MessageOptions
	| Promise<string | MessagePayload | MessageOptions>;
/**
 * A function returning text for the prompt.
 * @param message - Message that triggered the command.
 * @param data - Miscellaneous data.
 */
export declare type PromptContentSupplier = (
	message: Message,
	data: ArgumentPromptData
) =>
	| string
	| MessagePayload
	| MessageOptions
	| Promise<string | MessagePayload | MessageOptions>;
//# sourceMappingURL=Argument.d.ts.map
