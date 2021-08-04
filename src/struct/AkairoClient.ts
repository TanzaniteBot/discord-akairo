import { Client, ClientOptions, Snowflake, UserResolvable } from "discord.js";
import ClientUtil from "./ClientUtil";

/**
 * The Akairo framework client. Creates the handlers and sets them up.
 * @param options - Options for the client.
 * @param clientOptions - Options for Discord JS client.If not specified, the previous options parameter is used instead.
 */
export default class AkairoClient extends Client {
	public constructor(
		options?: AkairoOptions & ClientOptions,
		clientOptions?: ClientOptions
	) {
		super(clientOptions || options);

		const { ownerID = "" } = options;

		const { superUserID = "" } = options;

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
		return Array.isArray(this.ownerID)
			? this.ownerID.includes(id)
			: id === this.ownerID;
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
export interface AkairoOptions {
	/** Discord ID of the client owner(s). */
	ownerID?: Snowflake | Snowflake[];

	/** Discord ID of the client superUsers(s). */
	superUserID?: Snowflake | Snowflake[];
}
