// @ts-check
"use strict";

/**
 * @typedef {import("discord.js").ClientOptions} ClientOptions
 * @typedef {import("discord.js").Snowflake} Snowflake
 * @typedef {import("discord.js").UserResolvable} UserResolvable
 */

const { Client } = await import("discord.js")
import ClientUtil from "./ClientUtil.js";

/**
 * The Akairo framework client.
 * Creates the handlers and sets them up.
 * @param {AkairoOptions} [options={}] - Options for the client.
 * @param {ClientOptions} [clientOptions] - Options for Discord JS client.
 * If not specified, the previous options parameter is used instead.
 */
export default class AkairoClient extends Client {
	constructor(options = {}, clientOptions) {
		super(clientOptions || options);

		const { ownerID = "" } = options;

		const { superUserID = "" } = options;

		/**
		 * The ID of the owner(s).
		 * @type {Snowflake|Snowflake[]}
		 */
		this.ownerID = ownerID;

		/**
		 * The ID of the superUser(s).
		 * @type {Snowflake|Snowflake[]}
		 */
		this.superUserID = superUserID;

		/**
		 * Utility methods.
		 * @type {ClientUtil}
		 */
		this.util = new ClientUtil(this);
	}

	/**
	 * Checks if a user is the owner of this bot.
	 * @param {UserResolvable} user - User to check.
	 * @returns {boolean}
	 */
	isOwner(user) {
		const id = this.users.resolveId(user);
		return Array.isArray(this.ownerID)
			? this.ownerID.includes(id)
			: id === this.ownerID;
	}
	/**
	 * Checks if a user is the owner of this bot.
	 * @param {UserResolvable} user - User to check.
	 * @returns {boolean}
	 */
	isSuperUser(user) {
		const id = this.users.resolveId(user);
		return Array.isArray(this.superUserID)
			? this.superUserID.includes(id) || this.ownerID.includes(id)
			: id === this.superUserID || id === this.ownerID;
	}
}

/**
 * Options for the client.
 * @typedef {Object} AkairoOptions
 * @prop {Snowflake|Snowflake[]} [ownerID=""] - Discord ID of the client owner(s).
 * @prop {Snowflake|Snowflake[]} [superUserID=""] - Discord ID of the client superUsers(s).
 */
