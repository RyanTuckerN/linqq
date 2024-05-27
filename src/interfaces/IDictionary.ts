import { KeyValuePair } from "../types";
import { IEnumerable } from "./IEnumerable";

export type Indexable<TKey, TValue> = { [K in TKey extends string ? string : TKey extends number ? number : never]: TValue };
export interface IDictionary<TKey, TValue> extends IEnumerable<KeyValuePair<TKey, TValue>> {
    /**
     * Return an iterable of keys in the dictionary.
     * @returns An iterable of keys in the dictionary.
     */
    keys: Iterable<TKey>;
    /**
     * Return an iterable of values in the dictionary.
     * @returns An iterable of values in the dictionary.
     */
    values: Iterable<TValue>;
    /**
     * Return an iterable of entries in the dictionary.
     * @returns An iterable of entries in the dictionary.
     */
    entries: Iterable<[TKey, TValue]>;
    /**
     * Add a key-value pair to the dictionary.
     * @param KeyValuePair The key-value pair to add.
     * @returns True if the key-value pair was added; otherwise, false.
     */
    add({ key, value }: KeyValuePair<TKey, TValue>): boolean;
    /**
     * Remove a key from the dictionary.
     * @param key The key to remove.
     * @returns True if the key was removed. If the key didn't exist, returns false.
     */
    remove(key: TKey): boolean;
    /**
     * Set a value in the dictionary for a given key.
     */
    set(key: TKey, value: TValue): void;
    /**
     * Get a value from the dictionary based on a key.
     * @returns The corresponding value.
     * @throws If the key does not exist in the dictionary.
     */
    get(key: TKey): TValue;
    /**
     * Clear all keys and values from the dictionary.
     */
    clear(): void;
    /**
     * Check if the dictionary contains a given key.
     * @param key The key to check for.
     * @returns True if the value exists in the dictionary, else false.
     */
    containsKey(key: TKey): boolean;
    /**
     * Try to get a value from the dictionary. If found, [true, TValue] will be returned, else [false, undefined].
     * @param key The key to check for.
     * @returns [true, TValue] or [false, undefined]
     */
    tryGetValue(key: TKey): [true, TValue] | [false, undefined];
 };
