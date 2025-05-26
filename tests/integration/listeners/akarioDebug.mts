import assert from "node:assert";
import { Listener, type AkairoClientEvents } from "../../../src/index.js";
import logger from "../struct/Logger.mjs";

export default class AkairoDebugListener extends Listener {
	public constructor() {
		super("akairoDebug", {
			emitter: "client",
			event: "akairoDebug"
		});
	}

	public override exec(...[message, ...other]: AkairoClientEvents["akairoDebug"]) {
		if (message.includes("[registerInteractionCommandsCompare]")) {
			const [calculated, current] = other as unknown as [any, any];

			logger.debug("akairoDebug", "", { current, calculated });

			const replacer = (key: string, value: any) => {
				if (typeof value === "bigint") return value.toString();
				if (Array.isArray(value)) {
					return value.toSorted((a, b) => {
						if (typeof a === "number" && typeof b === "number") {
							return a > b ? 1 : a < b ? -1 : 0;
						} else return a.toString().localeCompare(b.toString());
					});
				}
				return value;
			};

			const a = JSON.parse(JSON.stringify(current, replacer));
			const b = JSON.parse(JSON.stringify(calculated, replacer));

			logger.debug("akairoDebug", "", { current: a, calculated: b });

			try {
				assert.deepStrictEqual(a, b);
			} catch (error) {
				logger.debug("akairoDebug", error);
			}
		} else {
			logger.debug("AkairoDebug", message);
		}
	}
}
