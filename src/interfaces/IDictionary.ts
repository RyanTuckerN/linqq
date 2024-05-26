import { KeyValuePair } from "../types";
import { IEnumerable } from "./IEnumerable";

export type Indexable<TKey, TValue> = { [K in TKey extends string ? string : TKey extends number ? number : never]: TValue };
export interface IDictionary<TKey, TValue> extends IEnumerable<KeyValuePair<TKey, TValue>> {
    keys: Iterable<TKey>;
    values: Iterable<TValue>;
    entries: Iterable<[TKey, TValue]>;
    add({ key, value }: KeyValuePair<TKey, TValue>): boolean;
    remove(key: TKey): boolean;
    set(key: TKey, value: TValue): void;
    get(key: TKey): TValue;
    clear(): void;
    containsKey(key: TKey): boolean;
    tryGetValue(key: TKey): [true, TValue] | [false, undefined];
    set(key: TKey, value: TValue): void;
    get(key: TKey): TValue | undefined;
 };
