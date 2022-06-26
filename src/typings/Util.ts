import { MessageOptions, MessagePayload } from "discord.js";
import { z, ZodTypeAny } from "zod";

export type MessageSendResolvable = string | MessagePayload | MessageOptions;
export const MessageSendResolvable = z.union([z.string(), z.instanceof(MessagePayload), z.record(z.any())]);

export type SyncOrAsync<T> = T | Promise<T>;
export const SyncOrAsync = <T extends ZodTypeAny>(t: T) => z.union([t, z.promise(t)]);
