import { Awaitable, Client, ClientOptions, Snowflake, UserResolvable } from "discord.js";
import { AkairoClientEvents } from "../typings/events";
import ClientUtil from "./ClientUtil";

type Event = AkairoClientEvents;

/**
 * The Akairo framework client. Creates the handlers and sets them up.
 * @param options - Options for the client.
 * @param clientOptions - Options for Discord JS client.If not specified, the previous options parameter is used instead.
 */
export default class AkairoClient<Ready extends boolean = boolean> extends Client<Ready> {
	public constructor(options?: AkairoOptions & ClientOptions, clientOptions?: ClientOptions) {
		super(clientOptions || options!);
		const { ownerID = "" } = options!;
		const { superUserID = "" } = options!;
		this.ownerID = ownerID;
		this.superUserID = superUserID;
		this.util = new ClientUtil(this);
	}

	/**
	 * The ID of the owner(s).
	 */
	public ownerID: Snowflake | Snowflake[];

	/**
	 * The ID of the superUser(s).
	 */
	public superUserID: Snowflake | Snowflake[];

	/**
	 * Utility methods.
	 */
	public util: ClientUtil;

	/**
	 * Checks if a user is the owner of this bot.
	 * @param user - User to check.
	 */
	public isOwner(user: UserResolvable): boolean {
		const id = this.users.resolveId(user);
		if (!id) return false;
		return Array.isArray(this.ownerID) ? this.ownerID.includes(id) : id === this.ownerID;
	}

	/**
	 * Checks if a user is a super user of this bot.
	 * @param user - User to check.
	 */
	public isSuperUser(user: UserResolvable): boolean {
		const id = this.users.resolveId(user);
		if (!id) return false;
		return Array.isArray(this.superUserID)
			? this.superUserID.includes(id) || this.ownerID.includes(id)
			: id === this.superUserID || id === this.ownerID;
	}

	public override on<K extends keyof Event>(event: K, listener: (...args: Event[K]) => Awaitable<void>): this;
	public override on<S extends string | symbol>(
		event: Exclude<S, keyof Event>,
		listener: (...args: any[]) => Awaitable<void>
	): this {
		return super.on(event as any, listener);
	}

	public override once<K extends keyof Event>(event: K, listener: (...args: Event[K]) => Awaitable<void>): this;
	public override once<S extends string | symbol>(
		event: Exclude<S, keyof Event>,
		listener: (...args: any[]) => Awaitable<void>
	): this {
		return super.once(event as any, listener);
	}

	public override emit<K extends keyof Event>(event: K, ...args: Event[K]): boolean;
	public override emit<S extends string | symbol>(event: Exclude<S, keyof Event>, ...args: unknown[]): boolean {
		return super.emit(event as any, ...args);
	}

	public override off<K extends keyof Event>(event: K, listener: (...args: Event[K]) => Awaitable<void>): this;
	public override off<S extends string | symbol>(
		event: Exclude<S, keyof Event>,
		listener: (...args: any[]) => Awaitable<void>
	): this {
		return super.off(event as any, listener);
	}

	public override removeAllListeners<K extends keyof Event>(event?: K): this;
	public override removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof Event>): this {
		return super.removeAllListeners(event as any);
	}
}

/**
 * Options for the client.
 */
export interface AkairoOptions {
	/** Discord ID of the client owner(s). */
	ownerID?: Snowflake | Snowflake[];

	/** Discord ID of the client superUsers(s). */
	superUserID?: Snowflake | Snowflake[];
}
