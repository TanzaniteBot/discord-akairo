/* eslint-disable @typescript-eslint/no-shadow, callback-return, @typescript-eslint/no-unused-vars */
import { codeBlock, escapeCodeBlock, type Message } from "discord.js";
import { inspect } from "node:util";
import { Command, type TextCommandMessage } from "../../../../src/index.js";

import logger from "../../struct/Logger.mjs";

export default class EvalCommand extends Command {
	public constructor() {
		super("eval", {
			aliases: ["eval", "e"],
			category: "owner",
			ownerOnly: true,
			quoted: false,
			args: [
				{
					id: "code",
					match: "content"
				}
			]
		});
	}

	public override async exec(message: TextCommandMessage, { code }: { code: string }) {
		if (!code) return message.util!.reply("No code provided!");

		const evaled: { output?: string; errored?: boolean; message?: Message } = {};
		const logs: string[] = [];

		const token = this.client.token!.split("").join("[^]{0,2}");
		const rev = this.client.token!.split("").reverse().join("[^]{0,2}");
		const tokenRegex = new RegExp(`${token}|${rev}`, "g");
		const cb = (code: string) => codeBlock("js", escapeCodeBlock(code));

		const print = (...a: any[]) => {
			const cleaned = a.map(obj => {
				const str = typeof obj !== "string" ? inspect(obj, { depth: 1 }) : obj;
				return str.replace(tokenRegex, "[TOKEN]");
			});

			if (!evaled.output) {
				logs.push(...cleaned);
				return;
			}

			evaled.output += evaled.output.endsWith("\n") ? cleaned.join(" ") : `\n${cleaned.join(" ")}`;
			const title = evaled.errored ? "☠\u2000**Error**" : "📤\u2000**Output**";

			if (evaled.output.length + code.length > 1900) evaled.output = "Output too long.";
			evaled.message!.edit([`📥\u2000**Input**`, cb(code), `${title}`, cb(evaled.output)].join("\n"));
		};

		try {
			let output = eval(code);
			if (output instanceof Promise) output = await output;

			if (typeof output !== "string") output = inspect(output, { depth: 0 });
			output = `${logs.join("\n")}\n${logs.length && output === "undefined" ? "" : output}`;
			output = output.replace(tokenRegex, "[TOKEN]");

			if (output.length + code.length > 1900) output = "Output too long.";

			const sent = await message.util!.sendNew(["📥\u2000**Input**", cb(code), "📤\u2000**Output**", cb(output)].join("\n"));

			evaled.message = sent;
			evaled.errored = false;
			evaled.output = output;

			return sent;
		} catch (err) {
			logger.error("EvalCommandError", err);
			let error: Error | any = err;

			error = error.toString();
			error = `${logs.join("\n")}\n${logs.length && error === "undefined" ? "" : error}`;
			error = error.replace(tokenRegex, "[TOKEN]");

			const sent = await message.util!.send([`📥\u2000**Input**`, cb(code), `☠\u2000**Error**`, cb(error)].join("\n"));

			evaled.message = sent;
			evaled.errored = true;
			evaled.output = error;

			return sent;
		}
	}
}
