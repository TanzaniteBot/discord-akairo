import type { TextCommandMessage } from "../../typings/Util.ts";

/**
 * Represents a special return value during command execution or argument parsing.
 */
export class Flag<T extends FlagType = FlagType> {
	/**
	 * The type of flag.
	 */
	public type: T;

	/**
	 * Order waiting time .
	 *
	 * Only exists if {@link type} is {@link FlagType.Timeout}.
	 */
	public time!: T extends FlagType.Timeout ? number : never;

	/**
	 * Message to handle.
	 *
	 * Only exists if {@link type} is {@link FlagType.Retry}.
	 */
	public message!: T extends FlagType.Retry ? TextCommandMessage : never;

	/**
	 * The extra data for the failure.
	 *
	 * Only exists if {@link type} is {@link FlagType.Fail}.
	 */
	public value!: T extends FlagType.Fail ? any : never;

	/**
	 * Command ID.
	 *
	 * Only exists if {@link type} is {@link FlagType.Continue}.
	 */
	public command!: T extends FlagType.Continue ? string : never;

	/**
	 * Whether or not to ignore permission checks.
	 *
	 * Only exists if {@link type} is {@link FlagType.Continue}.
	 */
	public ignore!: T extends FlagType.Continue ? boolean : never;

	/**
	 *  The rest of the arguments. If this is not set, the argument handler will automatically use the rest of the content.
	 *
	 * Only exists if {@link type} is {@link FlagType.Continue}.
	 */
	public rest!: T extends FlagType.Continue ? string : never;

	/**
	 * @param type - Type of flag.
	 * @param data - Extra data.
	 */
	public constructor(type: T & FlagType.Cancel);
	public constructor(type: T & FlagType.Timeout, data?: FlagTimeoutData);
	public constructor(type: T & FlagType.Retry, data?: FlagRetryData);
	public constructor(type: T & FlagType.Fail, data?: FlagFailData);
	public constructor(type: T & FlagType.Continue, data?: FlagContinueData);
	public constructor(
		type: T,
		data: Record<string, never> | FlagTimeoutData | FlagRetryData | FlagFailData | FlagContinueData = {}
	) {
		this.type = type;
		Object.assign(this, data);
	}

	/**
	 * Creates a flag that cancels the command.
	 */
	public static cancel(): Flag<FlagType.Cancel> {
		return new Flag(FlagType.Cancel);
	}

	/**
	 * Create a flag that cancels the command because of the timeout
	 */
	public static timeout(time: number): Flag<FlagType.Timeout> {
		return new Flag(FlagType.Timeout, { time });
	}

	/**
	 * Creates a flag that retries with another input.
	 * @param message - Message to handle.
	 */
	public static retry(message: TextCommandMessage): Flag<FlagType.Retry> {
		return new Flag(FlagType.Retry, { message });
	}

	/**
	 * Creates a flag that acts as argument cast failure with extra data.
	 * @param value - The extra data for the failure.
	 */
	public static fail(value: any): Flag<FlagType.Fail> {
		return new Flag(FlagType.Fail, { value });
	}

	/**
	 * Creates a flag that runs another command with the rest of the arguments.
	 * @param command - Command ID.
	 * @param ignore - Whether or not to ignore permission checks.
	 * @param rest - The rest of the arguments. If this is not set, the argument handler will automatically use the rest of the content.
	 */
	public static continue(command: string, ignore: boolean = false, rest: string | null = null): Flag<FlagType.Continue> {
		return new Flag(FlagType.Continue, { command, ignore, rest });
	}

	/**
	 * Checks if a value is a flag and of some type.
	 * @param value - Value to check.
	 * @param type - Type of flag.
	 */
	public static is<Type extends FlagType>(value: unknown, type: Type): value is Flag<typeof type> {
		return value instanceof Flag && value.type === type;
	}
}

export enum FlagType {
	Cancel = "cancel",
	Timeout = "timeout",
	Retry = "retry",
	Fail = "fail",
	Continue = "continue"
}

interface FlagTimeoutData {
	time: number;
}

interface FlagRetryData {
	message: TextCommandMessage;
}

interface FlagFailData {
	value: any;
}

interface FlagContinueData {
	command: string;
	ignore: boolean;
	rest: string | null;
}
