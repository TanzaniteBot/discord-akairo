import { Message } from "discord.js";
import Command, { ArgumentGenerator } from "../Command";
import { ContentParserResult } from "../ContentParser";
import Flag from "../Flag";
import Argument, { ArgumentOptions } from "./Argument";
/**
 * Runs arguments.
 * @param command - Command to run for.
 */
export default class ArgumentRunner {
    constructor(command: Command);
    /**
     * The command the arguments are being run for
     */
    command: Command;
    /**
     * The Akairo client.
     */
    get client(): import("../../AkairoClient").default<boolean>;
    /**
     * The command handler.
     */
    get handler(): import("../CommandHandler").default;
    /**
     * Runs the arguments.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param generator - Argument generator.
     */
    run(message: Message, parsed: ContentParserResult, generator: ArgumentGenerator): Promise<Flag | any>;
    /**
     * Runs one argument.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runOne(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Runs `phrase` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runPhrase(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Runs `rest` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runRest(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Runs `separate` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runSeparate(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Runs `flag` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runFlag(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Runs `option` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runOption(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Runs `text` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runText(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Runs `content` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runContent(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Runs `restContent` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runRestContent(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Runs `none` match.
     * @param message - Message that triggered the command.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param arg - Current argument.
     */
    runNone(message: Message, parsed: ContentParserResult, state: ArgumentRunnerState, arg: Argument): Promise<Flag | any>;
    /**
     * Modifies state by incrementing the indices.
     * @param parsed - Parsed data from ContentParser.
     * @param state - Argument handling state.
     * @param n - Number of indices to increase by.
     */
    static increaseIndex(parsed: ContentParserResult, state: ArgumentRunnerState, n?: number): void;
    /**
     * Checks if something is a flag that short circuits.
     * @param value - A value.
     */
    static isShortCircuit(value: any): boolean;
    /**
     * Creates an argument generator from argument options.
     * @param args - Argument options.
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