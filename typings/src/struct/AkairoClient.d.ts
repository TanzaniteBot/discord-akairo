import { Client, ClientOptions, Snowflake, UserResolvable } from "discord.js";
import ClientUtil from "./ClientUtil";
/**
 * The Akairo framework client. Creates the handlers and sets them up.
 * @param options - Options for the client.
 * @param clientOptions - Options for Discord JS client.If not specified, the previous options parameter is used instead.
 */
export default class AkairoClient extends Client {
	/**
	 * The ID of the owner(s).
	 */
	ownerID: Snowflake | Snowflake[];
	/**
	 * The ID of the superUser(s).
	 */
	superUserID: Snowflake | Snowflake[];
	/**
	 * Utility methods.
	 */
	util: ClientUtil;
	constructor(
		options?: AkairoOptions & ClientOptions,
		clientOptions?: ClientOptions
	);
	/**
	 * Checks if a user is the owner of this bot.
	 * @param user - User to check.
	 */
	isOwner(user: UserResolvable): boolean;
	/**
	 * Checks if a user is a super user of this bot.
	 * @param user - User to check.
	 */
	isSuperUser(user: UserResolvable): boolean;
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
//# sourceMappingURL=AkairoClient.d.ts.map
