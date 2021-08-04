/**
 * Akairo Utilities.
 */
export default class Util {
    /**
     *
     * @param xs
     */
    static choice(...xs: any[]): any;
    /**
     *
     * @param o1
     * @param os
     */
    static deepAssign(o1: any, ...os: any): any;
    /**
     *
     * @param xs
     * @param f
     */
    static flatMap(xs: any, f: any): any;
    /**
     * Converts the supplied value into an array if it is not already one.
     * @param x - Value to convert.
     */
    static intoArray<T>(x: T | T[]): T[];
    /**
     * Converts something to become callable.
     * @param thing - What to turn into a callable.
     */
    static intoCallable(thing: any): any;
    /**
     * Checks if the supplied value is an event emitter.
     * @param value - Value to check.
     */
    static isEventEmitter(value: any): boolean;
    /**
     * Checks if the supplied value is a promise.
     * @param value - Value to check.
     */
    static isPromise(value: any): boolean;
    /**
     * Compares two prefixes.
     * @param aKey - First prefix.
     * @param bKey - Second prefix.
     */
    static prefixCompare(aKey: string | ((...args: any[]) => any), bKey: string | ((...args: any[]) => any)): number;
}
//# sourceMappingURL=Util.d.ts.map