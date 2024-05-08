import { KeyValuePair } from "../types";
import { IEnumerable } from "./IEnumerable";

type Indexable<T> = T extends string ? T : T extends number ? T : never; // Indexable types are strings and numbers, still need to implement this
export interface IDictionary<TKey, TValue> extends IEnumerable<KeyValuePair<TKey, TValue>> {
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
