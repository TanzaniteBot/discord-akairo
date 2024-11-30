import { Client, type ClientOptions, type Snowflake, type UserResolvable } from "discord.js";
import { z } from "zod";
import { ArrayOrNot } from "../typings/Util.js";
import type { AkairoClientEvents } from "../typings/events.js";
import * as ClientUtil from "./ClientUtil.js";

/**
 * The Akairo framework client. Creates the handlers and sets them up.
 */
export class AkairoClient<
	Ready extends boolean = boolean,
	Events extends Record<keyof Events, any[]> = AkairoClientEvents
> extends Client<Ready, Events | AkairoClientEvents> {
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
	public util: typeof ClientUtil;

	/**
	 * @param options - Options for the client.
	 * @param clientOptions - Options for Discord JS client. If not specified, the previous options parameter is used instead.
	 */
	public constructor(options: AkairoClientOptions & ClientOptions);
	public constructor(options: AkairoClientOptions, clientOptions: ClientOptions);
	public constructor(options: (AkairoClientOptions & ClientOptions) | AkairoClientOptions, clientOptions?: ClientOptions) {
		const combinedOptions = <AkairoClientOptions & ClientOptions>{ ...options, ...(clientOptions ?? {}) };
		AkairoClientOptions.parse(combinedOptions);
		super(combinedOptions);
		this.ownerID = combinedOptions.ownerID ?? [];
		this.superUserID = combinedOptions.superUserID ?? [];
		this.util = ClientUtil;
	}

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
}

/**
 * Options for the client.
 */
export type AkairoClientOptions = {
	/**
	 * Discord ID of the client owner(s).
	 * @default []
	 */
	ownerID?: ArrayOrNot<Snowflake>;

	/**
	 * Discord ID of the client superUsers(s).
	 * @default []
	 */
	superUserID?: ArrayOrNot<Snowflake>;
};

export const AkairoClientOptions = z
	.object({
		ownerID: ArrayOrNot(z.string()).optional(),
		superUserID: ArrayOrNot(z.string()).optional()
	})
	.passthrough();
