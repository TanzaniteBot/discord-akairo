import type { Message } from "discord.js";
import { z } from "zod";
import { AkairoError } from "../../../util/AkairoError.js";
import { ArgumentMatches } from "../../../util/Constants.js";
import type { ArgumentGenerator, ArgumentGeneratorReturn, Command } from "../Command.js";
import type { ContentParserResult } from "../ContentParser.js";
import { Flag, FlagType } from "../Flag.js";
import { Argument, type ArgumentOptions, type ArgumentTypeCasterReturn } from "./Argument.js";

/**
 * Runs arguments.
 */
export class ArgumentRunner {
	/**
	 * The command the arguments are being run for
	 */
	public command: Command;

	/**
	 * @param command - Command to run for.
	 */
	public constructor(command: Command) {
		this.command = command;
	}

	/**
	 * The Akairo client.
	 */
	public get client() {
		return this.command.client;
	}

	/**
	 * The command handler.
	 */
	public get handler() {
		return this.command.handler;
	}

	/**
	 * Runs the arguments.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param generator - Argument generator.
	 */
	public async run(
		message: Message,
		parsed: ContentParserResult,
		generator: OmitThisParameter<ArgumentGenerator>
	): Promise<Flag | { [args: string]: unknown }> {
		const state = {
			usedIndices: new Set<number>(),
			phraseIndex: 0,
			index: 0
		};

		const augmentRest = (val: Flag | ArgumentOptions) => {
			if (Flag.is(val, FlagType.Continue)) {
				val.rest = parsed.all
					.slice(state.index)
					.map(x => x.raw)
					.join("");
			}
		};

		const iter = generator(message, parsed, state);
		let curr = await iter.next();
		while (!curr.done) {
			const value = curr.value;
			if (ArgumentRunner.isShortCircuit(value)) {
				augmentRest(value);
				return value;
			}

			const res = await this.runOne(message, parsed, state, new Argument(this.command, value));
			if (ArgumentRunner.isShortCircuit(res)) {
				augmentRest(res);
				return res;
			}

			curr = await iter.next(res);
		}

		augmentRest(curr.value);
		return curr.value;
	}

	/**
	 * Runs one argument.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public runOne(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any> {
		const cases = {
			[ArgumentMatches.PHRASE]: this.runPhrase,
			[ArgumentMatches.FLAG]: this.runFlag,
			[ArgumentMatches.OPTION]: this.runOption,
			[ArgumentMatches.REST]: this.runRest,
			[ArgumentMatches.SEPARATE]: this.runSeparate,
			[ArgumentMatches.TEXT]: this.runText,
			[ArgumentMatches.CONTENT]: this.runContent,
			[ArgumentMatches.REST_CONTENT]: this.runRestContent,
			[ArgumentMatches.NONE]: this.runNone
		};

		const runFn = cases[arg.match];
		if (runFn == null) {
			throw new AkairoError("UNKNOWN_MATCH_TYPE", arg.match);
		}

		return runFn.call(this, message, parsed, state, arg);
	}

	/**
	 * Runs `phrase` match.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public async runPhrase(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any> {
		if (arg.unordered || arg.unordered === 0) {
			const indices =
				typeof arg.unordered === "number"
					? Array.from(parsed.phrases.keys()).slice(arg.unordered)
					: Array.isArray(arg.unordered)
						? arg.unordered
						: Array.from(parsed.phrases.keys());

			for (const i of indices) {
				if (state.usedIndices.has(i)) {
					continue;
				}

				const phrase = parsed.phrases[i] ? parsed.phrases[i].value : "";
				// `cast` is used instead of `process` since we do not want prompts.
				const res = await arg.cast(message, phrase);
				if (res != null) {
					state.usedIndices.add(i);
					return res;
				}
			}

			// No indices matched.
			return arg.process(message, "");
		}

		const index = arg.index == null ? state.phraseIndex : arg.index;
		const ret = arg.process(message, parsed.phrases[index] ? parsed.phrases[index].value : "");
		if (arg.index == null) {
			ArgumentRunner.increaseIndex(parsed, state);
		}

		return ret;
	}

	/**
	 * Runs `rest` match.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public async runRest(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any> {
		const index = arg.index == null ? state.phraseIndex : arg.index;
		const rest = parsed.phrases
			.slice(index, index + arg.limit)
			.map(x => x.raw)
			.join("")
			.trim();
		const ret = await arg.process(message, rest);
		if (arg.index == null) {
			ArgumentRunner.increaseIndex(parsed, state);
		}

		return ret;
	}

	/**
	 * Runs `separate` match.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public async runSeparate(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any> {
		const index = arg.index == null ? state.phraseIndex : arg.index;
		const phrases = parsed.phrases.slice(index, index + arg.limit);
		if (!phrases.length) {
			const ret = await arg.process(message, "");
			if (arg.index != null) {
				ArgumentRunner.increaseIndex(parsed, state);
			}

			return ret;
		}

		const res = [];
		for (const phrase of phrases) {
			const response = await arg.process(message, phrase.value);

			if (Flag.is(response, FlagType.Cancel)) {
				return response;
			}

			res.push(response);
		}

		if (arg.index != null) {
			ArgumentRunner.increaseIndex(parsed, state);
		}

		return res;
	}

	/**
	 * Runs `flag` match.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public runFlag(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag> | any {
		const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
		if (arg.multipleFlags) {
			const amount = parsed.flags.filter(flag => names.some(name => name?.toLowerCase() === flag.key.toLowerCase())).length;

			return amount;
		}

		const flagFound = parsed.flags.some(flag => names.some(name => name?.toLowerCase() === flag.key.toLowerCase()));

		return arg.default == null ? flagFound : !flagFound;
	}

	/**
	 * Runs `option` match.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public async runOption(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any> {
		const names = Array.isArray(arg.flag) ? arg.flag : [arg.flag];
		if (arg.multipleFlags) {
			const values = parsed.optionFlags
				.filter(flag => names.some(name => name?.toLowerCase() === flag.key.toLowerCase()))
				.map(x => x.value)
				.slice(0, arg.limit);

			const res = [];
			for (const value of values) {
				res.push(await arg.process(message, value));
			}

			return res;
		}

		const foundFlag = parsed.optionFlags.find(flag => names.some(name => name?.toLowerCase() === flag.key.toLowerCase()));

		return arg.process(message, foundFlag != null ? foundFlag.value : "");
	}

	/**
	 * Runs `text` match.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public runText(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any> {
		const index = arg.index == null ? 0 : arg.index;
		const text = parsed.phrases
			.slice(index, index + arg.limit)
			.map(x => x.raw)
			.join("")
			.trim();
		return arg.process(message, text);
	}

	/**
	 * Runs `content` match.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public runContent(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any> {
		const index = arg.index == null ? 0 : arg.index;
		const content = parsed.all
			.slice(index, index + arg.limit)
			.map(x => x.raw)
			.join("")
			.trim();
		return arg.process(message, content);
	}

	/**
	 * Runs `restContent` match.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public async runRestContent(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any> {
		const index = arg.index == null ? state.index : arg.index;
		const rest = parsed.all
			.slice(index, index + arg.limit)
			.map(x => x.raw)
			.join("")
			.trim();
		const ret = await arg.process(message, rest);
		if (arg.index == null) {
			ArgumentRunner.increaseIndex(parsed, state);
		}

		return ret;
	}

	/**
	 * Runs `none` match.
	 * @param message - Message that triggered the command.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param arg - Current argument.
	 */
	public runNone(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any> {
		return arg.process(message, "");
	}

	/**
	 * Modifies state by incrementing the indices.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param n - Number of indices to increase by.
	 */
	public static increaseIndex(parsed: ContentParserResult, state: ArgumentRunnerState, n = 1): void {
		state.phraseIndex += n;
		while (n > 0) {
			do {
				state.index++;
			} while (parsed.all[state.index] && parsed.all[state.index].type !== "Phrase");
			n--;
		}
	}

	/**
	 * Checks if something is a flag that short circuits.
	 * @param value - A value.
	 */
	public static isShortCircuit(value: unknown): value is Flag<FlagType.Cancel> | Flag<FlagType.Retry> | Flag<FlagType.Continue> {
		return (
			Flag.is(value, FlagType.Cancel) ||
			Flag.is(value, FlagType.Timeout) ||
			Flag.is(value, FlagType.Retry) ||
			Flag.is(value, FlagType.Continue)
		);
	}

	/**
	 * Creates an argument generator from argument options.
	 * @param args - Argument options.
	 */
	public static fromArguments(args: [id: string, argument: Argument][]) {
		return function* generate(): ArgumentGeneratorReturn {
			const res: { [args: string]: ArgumentTypeCasterReturn<unknown> } = {};
			for (const [id, arg] of args) {
				res[id] = yield arg;
			}

			return res;
		};
	}
}

/**
 * State for the argument runner.
 */
export type ArgumentRunnerState = {
	/**
	 * Index in terms of the raw strings.
	 */
	index: number;

	/**
	 * Index in terms of phrases.
	 */
	phraseIndex: number;

	/**
	 * Indices already used for unordered match.
	 */
	usedIndices: Set<number>;
};
export const ArgumentRunnerState = z.object({
	index: z.number(),
	phraseIndex: z.number(),
	usedIndices: z.set(z.number())
});
