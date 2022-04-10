/* eslint-disable no-console */
import chalk from "chalk";

function isDaylightSavings(date: Date): boolean {
	const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
	const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();

	return Math.max(jan, jul) !== date.getTimezoneOffset();
}

function timestamp(): string {
	const now = new Date();
	const hours = isDaylightSavings(now) ? now.getHours() - 1 : now.getHours();

	const minute = now.getMinutes();
	let hour = hours;
	let amOrPm: "AM" | "PM" = "AM";
	if (hour > 12) {
		amOrPm = "PM";
		hour -= 12;
	}
	return `${hour >= 10 ? hour : `0${hour}`}:${minute >= 10 ? minute : `0${minute}`} ${amOrPm}`;
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
