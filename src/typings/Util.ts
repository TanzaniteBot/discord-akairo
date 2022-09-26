// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
	BitField,
	Message,
	MessagePayload,
	PermissionFlagsBits,
	PermissionResolvable,
	type MessageCreateOptions
} from "discord.js";
import { z, ZodLiteral, ZodType, ZodUnion, type ZodTypeAny } from "zod";

export type MessageSendResolvable = string | MessagePayload | MessageCreateOptions;
export const MessageSendResolvable = z.union([z.string(), z.instanceof(MessagePayload), z.record(z.any())]);

export type SyncOrAsync<T> = T | Promise<T>;
export const SyncOrAsync = <T extends ZodTypeAny>(t: T) => z.union([t, z.promise(t)]);

export const MessageInstance = z.instanceof(Message as new (...args: any[]) => Message);

export type ArrayOrNot<T> = T | T[];
export const ArrayOrNot = <T extends ZodTypeAny>(t: T) => z.union([t, z.array(t)]);

export const PermissionKey = z.union(Object.keys(PermissionFlagsBits).map(key => z.literal(key)) as any) as ZodUnion<
	[ZodLiteral<keyof typeof PermissionFlagsBits>, ZodLiteral<keyof typeof PermissionFlagsBits>]
>;

const BigIntBitFieldInstance = z.instanceof(
	BitField as new (...args: any[]) => BitField<keyof typeof PermissionFlagsBits, bigint>
);

const BigIntStr = z.string().regex(/^\d*$/) as unknown as ZodLiteral<`${bigint}`>;

/**
 * {@link PermissionResolvable}
 */
export const PermissionResolvableValidator = z.union([
	z.bigint(),
	BigIntStr,
	PermissionKey,
	BigIntBitFieldInstance,
	z.bigint().array(),
	BigIntStr.array(),
	PermissionKey.array(),
	BigIntBitFieldInstance.array()
]) as ZodType<PermissionResolvable, any, PermissionResolvable>;
