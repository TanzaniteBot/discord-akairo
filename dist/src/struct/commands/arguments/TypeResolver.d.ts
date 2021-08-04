import { Collection } from "discord.js";
import CommandHandler from "../CommandHandler";
import { ArgumentTypeCaster } from "./Argument";
import AkairoClient from "../../AkairoClient";
import InhibitorHandler from "../../inhibitors/InhibitorHandler";
import ListenerHandler from "../../listeners/ListenerHandler";
/**
 * Type resolver for command arguments.
 * The types are documented under ArgumentType.
 * @param handler - The command handler.
 */
export default class TypeResolver {
    constructor(handler: CommandHandler);
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The command handler.
     */
    commandHandler: CommandHandler;
    /**
     * The inhibitor handler.
     */
    inhibitorHandler?: InhibitorHandler | null;
    /**
     * The listener handler.
     */
    listenerHandler?: ListenerHandler | null;
    /**
     * Collection of types.
     */
    types: Collection<string, ArgumentTypeCaster>;
    /**
     * Adds built-in types.
     */
    addBuiltInTypes(): void;
    /**
     * Gets the resolver function for a type.
     * @param name - Name of type.
     */
    type(name: string): ArgumentTypeCaster | undefined;
    /**
     * Adds a new type.
     * @param name - Name of the type.
     * @param fn - Function that casts the type.
     */
    addType(name: string, fn: ArgumentTypeCaster): TypeResolver;
    /**
     * Adds multiple new types.
     * @param types  - Object with keys as the type name and values as the cast function.
     */
    addTypes(types: any): TypeResolver;
}
//# sourceMappingURL=TypeResolver.d.ts.map
