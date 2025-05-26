/* eslint-disable no-console */
import chalk from "chalk";

function timestamp(): string {
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes();

	const twelveHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
	const amOrPm: "AM" | "PM" = hours >= 12 ? "PM" : "AM";

	return `${twelveHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${amOrPm}`;
}

export function debug(header: string, content: any, ...moreContent: any[]): void {
	console.log(`${chalk.bgGrey(timestamp())} ${chalk.grey(`[${header}]`)}`, content, ...moreContent);
}

export function log(header: string, content: any, ...moreContent: any[]): void {
	console.log(`${chalk.bgCyan(timestamp())} ${chalk.cyan(`[${header}]`)}`, content, ...moreContent);
}

export function error(header: string, content: any, ...moreContent: any[]): void {
	console.warn(`${chalk.bgRedBright(timestamp())} ${chalk.redBright(`[${header}]`)}`, content, ...moreContent);
}

export function warn(header: string, content: any, ...moreContent: any[]): void {
	console.warn(`${chalk.bgYellow(timestamp())} ${chalk.yellow(`[${header}]`)}`, content, ...moreContent);
}

export default {
	debug,
	log,
	error,
	warn
};
