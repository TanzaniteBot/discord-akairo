/// <reference types="node" />
import EventEmitter from "events";
import Category from "../../util/Category";
import AkairoClient from "../AkairoClient";
import AkairoModule, { AkairoModuleOptions } from "../AkairoModule";
import ListenerHandler from "./ListenerHandler";
/**
 * Represents a listener.
 * @param id - Listener ID.
 * @param options - Options for the listener.
 */
export default abstract class Listener extends AkairoModule {
    constructor(id: string, { category, emitter, event, type }: ListenerOptions);
    /**
     * The category of this listener.
     */
    category: Category<string, Listener>;
    /**
     * The Akairo client.
     */
    client: AkairoClient;
    /**
     * The event emitter.
     */
    emitter: string | EventEmitter;
    /**
     * The event name listened to.
     */
    event: string;
    /**
     * The filepath.
     */
    filepath: string;
    /**
     * The handler.
     */
    handler: ListenerHandler;
    /**
     * Type of listener.
     */
    type: string;
    /**
     * Executes the listener.
     * @param args - Arguments.
     */
    exec(...args: any[]): any;
    /**
     * Reloads the listener.
     */
    reload(): Listener;
    /**
     * Removes the listener.
     */
    remove(): Listener;
}
/**
 * Options to use for listener execution behavior.
 */
export interface ListenerOptions extends AkairoModuleOptions {
    /**
     * The event emitter, either a key from `ListenerHandler#emitters` or an EventEmitter.
     */
    emitter: string | EventEmitter;
    /**
     * Event name to listen to.
     */
    event: string;
    /**
     * Type of listener, either 'on' or 'once'.
     * Defaults to `on`
     */
    type?: string;
}
//# sourceMappingURL=Listener.d.ts.map