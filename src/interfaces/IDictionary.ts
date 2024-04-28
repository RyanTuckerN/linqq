import { KeyValuePair } from "../types";
import { IEnumerable } from "./IEnumerable";

export interface IDictionary<TKey, TValue> extends IEnumerable<KeyValuePair<TKey, TValue>>  {
    keys: Iterable<TKey>;
    values: Iterable<TValue>;
    entries: Iterable<[TKey, TValue]>;
    add({ key, value }: KeyValuePair<TKey, TValue>): boolean;
    remove(key: TKey): boolean;
    clear(): void;
    containsKey(key: TKey): boolean;
    tryGetValue(key: TKey): [true, TValue] | [false, undefined];
    toList(): IEnumerable<KeyValuePair<TKey, TValue>>;
}
