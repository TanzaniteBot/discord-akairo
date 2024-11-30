import {
	BitField,
	Message,
	MessagePayload,
	PermissionFlagsBits,
	type MessageCreateOptions,
	type OmitPartialGroupDMChannel,
	type PermissionResolvable,
	type PermissionsString
} from "discord.js";
import { z, type ZodLiteral, type ZodType, type ZodTypeAny, type ZodUnion } from "zod";
import { AkairoMessage } from "../util/AkairoMessage.js";

type MakeConstructable<T> = new (...args: any[]) => T;

export type MessageSendResolvable = string | MessagePayload | MessageCreateOptions;
export const MessageSendResolvable = z.union([z.string(), z.instanceof(MessagePayload), z.record(z.any())]);

export type SyncOrAsync<T> = T | Promise<T>;
export const SyncOrAsync = <T extends ZodTypeAny>(t: T) => z.union([t, z.promise(t)]);

export type MessageInstance = Message;
export const MessageInstance = z.instanceof(Message as new (...args: any[]) => Message);

export type ArrayOrNot<T> = T | T[];
export const ArrayOrNot = <T extends ZodTypeAny>(t: T) => z.union([t, z.array(t)]);

export const PermissionKey = z.union(Object.keys(PermissionFlagsBits).map(key => z.literal(key)) as any) as ZodUnion<
	[ZodLiteral<keyof typeof PermissionFlagsBits>, ZodLiteral<keyof typeof PermissionFlagsBits>]
>;

const BigIntBitFieldInstance = z.instanceof(BitField as MakeConstructable<BitField<PermissionsString, bigint>>);

const BigIntStr = z.string().regex(/^\d*$/) as unknown as ZodLiteral<`${bigint}`>;

export type TextCommandMessage = OmitPartialGroupDMChannel<Message>;
export type SlashCommandMessage = AkairoMessage;

export type MessageUnion = TextCommandMessage | SlashCommandMessage;
export const MessageUnion = z.union([MessageInstance, z.instanceof(AkairoMessage)]);

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
