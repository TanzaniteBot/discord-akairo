/// <reference types="node" />
import AkairoHandler, { AkairoHandlerOptions, LoadPredicate } from "../AkairoHandler";
import { Awaited, Collection } from "discord.js";
import Listener from "./Listener";
import AkairoClient from "../AkairoClient";
import EventEmitter from "events";
import Category from "../../util/Category";
import { ListenerHandlerEvents } from "../../typings/events";
/**
 * Loads listeners and registers them with EventEmitters.
 * @param client - The Akairo client.
 * @param options - Options.
 */
export default class ListenerHandler extends AkairoHandler {
    constructor(client: AkairoClient, { directory, classToHandle, extensions, automateCategories, loadFilter }?: AkairoHandlerOptions);
    /**
     * Categories, mapped by ID to Category.
     */
    categories: Collection<string, Category<string, Listener>>;
    /**
     * Class to handle.
     */
    classToHandle: typeof Listener;
    /**
     * The Akairo client
     */
    client: AkairoClient;
    /**
     * Directory to listeners.
     */
    directory: string;
    /**
     * EventEmitters for use, mapped by name to EventEmitter.
     * By default, 'client' is set to the given client.
     */
    emitters: Collection<string, EventEmitter>;
    /**
     * Listeners loaded, mapped by ID to Listener.
     */
    modules: Collection<string, Listener>;
    /**
     * Adds a listener to the EventEmitter.
     * @param id - ID of the listener.
     */
    addToEmitter(id: string): Listener;
    /**
     * Deregisters a module.
     * @param mod - Module to use.
     */
    deregister(listener: Listener): void;
    /**
     * Finds a category by name.
     * @param name - Name to find with.
     */
    findCategory(name: string): Category<string, Listener>;
    /**
     * Loads a module, can be a module class or a filepath.
     * @param thing - Module class or path to module.
     * @param isReload - Whether this is a reload or not.
     */
    load(thing: string | Listener, isReload?: boolean): Listener;
    /**
     * Reads all listeners from the directory and loads them.
     * @param directory - Directory to load from. Defaults to the directory passed in the constructor.
     * @param filter - Filter for files, where true means it should be loaded.
     */
    loadAll(directory?: string, filter?: LoadPredicate): ListenerHandler;
    /**
     * Registers a module.
     * @param listener - Module to use.
     * @param filepath - Filepath of module.
     */
    register(listener: Listener, filepath: string): void;
    /**
     * Reloads a listener.
     * @param id - ID of the listener.
     */
    reload(id: string): Listener;
    /**
     * Reloads all listeners.
     */
    reloadAll(): ListenerHandler;
    /**
     * Removes a listener.
     * @param id - ID of the listener.
     */
    remove(id: string): Listener;
    /**
     * Removes all listeners.
     */
    removeAll(): ListenerHandler;
    /**
     * Removes a listener from the EventEmitter.
     * @param id - ID of the listener.
     */
    removeFromEmitter(id: string): Listener;
    /**
     * Sets custom emitters.
     * @param emitters - Emitters to use. The key is the name and value is the emitter.
     */
    setEmitters(emitters: any): ListenerHandler;
    on<K extends keyof ListenerHandlerEvents>(event: K, listener: (...args: ListenerHandlerEvents[K][]) => Awaited<void>): this;
}
//# sourceMappingURL=ListenerHandler.d.ts.map