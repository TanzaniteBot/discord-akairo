import Argument, { ArgumentOptions } from "./Argument";
import Flag from "../Flag";
import { Message } from "discord.js";
import Command, { ArgumentGenerator } from "../Command";
import { ContentParserResult } from "../ContentParser";
/**
 * Runs arguments.
 * @param {Command} command - Command to run for.
 * @private
 */
export default class ArgumentRunner {
	/**
	 * The command the arguments are being run for
	 */
	command: Command;
	/**
	 * The Akairo client.
	 */
	get client(): import("../../AkairoClient").default;
	/**
	 * The command handler.
	 */
	get handler(): import("../CommandHandler").default;
	constructor(command: Command);
	/**
	 * Runs the arguments.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentGenerator} generator - Argument generator.
	 * @returns {Promise<Flag|any>}
	 */
	run(
		message: Message,
		parsed: ContentParserResult,
		generator: ArgumentGenerator
	): Promise<Flag | any>;
	/**
	 * Runs one argument.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runOne(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Runs `phrase` match.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runPhrase(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Runs `rest` match.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runRest(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Runs `separate` match.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runSeparate(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Runs `flag` match.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runFlag(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Runs `option` match.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runOption(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Runs `text` match.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runText(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Runs `content` match.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runContent(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Runs `restContent` match.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runRestContent(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Runs `none` match.
	 * @param {Message} message - Message that triggered the command.
	 * @param {ContentParserResult} parsed - Parsed data from ContentParser.
	 * @param {ArgumentRunnerState} state - Argument handling state.
	 * @param {Argument} arg - Current argument.
	 * @returns {Promise<Flag|any>}
	 */
	runNone(
		message: Message,
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		arg: Argument
	): Promise<Flag | any>;
	/**
	 * Modifies state by incrementing the indices.
	 * @param parsed - Parsed data from ContentParser.
	 * @param state - Argument handling state.
	 * @param n - Number of indices to increase by.
	 */
	static increaseIndex(
		parsed: ContentParserResult,
		state: ArgumentRunnerState,
		n?: number
	): void;
	/**
	 * Checks if something is a flag that short circuits.
	 * @param {any} value - A value.
	 * @returns {boolean}
	 */
	static isShortCircuit(value: any): boolean;
	/**
	 * Creates an argument generator from argument options.
	 * @param {ArgumentOptions[]} args - Argument options.
	 * @returns {GeneratorFunction}
	 */
	static fromArguments(args: ArgumentOptions[]): GeneratorFunction;
}
/**
 * State for the argument runner.
 */
export interface ArgumentRunnerState {
	/** Index in terms of the raw strings. */
	index: number;
	/** Index in terms of phrases. */
	phraseIndex: number;
	/** Indices already used for unordered match. */
	usedIndices: Set<number>;
}
//# sourceMappingURL=ArgumentRunner.d.ts.map
