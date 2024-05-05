import { KeyValuePair } from "../types";
import { IEnumerable } from "./IEnumerable";

type Indexable<T> = T extends string ? T : T extends number ? T : never;
export interface IDictionary<TKey, TValue> extends IEnumerable<KeyValuePair<TKey, TValue>> {
    // i want to do a mapped type here for indexing
    // if the key is a string, then the indexing should be allowed, but only for strings
    // if the key is a number, then the indexing should be allowed, but only for numbers 
    // otherwise, the key should NOT be accessible via indexing, at least in the type system
    // seems like a good use case for a mapped type
    keys: Iterable<TKey>;
    values: Iterable<TValue>;
    entries: Iterable<[TKey, TValue]>;
    add({ key, value }: KeyValuePair<TKey, TValue>): boolean;
    remove(key: TKey): boolean;
    set(key: TKey, value: TValue): void;
    get(key: TKey): TValue | undefined;
    clear(): void;
    containsKey(key: TKey): boolean;
    tryGetValue(key: TKey): [true, TValue] | [false, undefined];
 };
