import { Dictionary } from "..";
import { IDictionary } from "../interfaces/IDictionary";
import { IEnumerable } from "../interfaces/IEnumerable";
import { LinqUtils } from "../util";

export interface IDictionaryService  {
  create<TSource, TKey, TValue>(
    source: IEnumerable<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector?: (x: TSource, index: number) => TValue,
  ): IDictionary<TKey, TValue>;
}

export class DictionaryService implements IDictionaryService {
  create<TSource, TKey, TValue>(
    source: IEnumerable<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector: (x: TSource, index: number) => TValue = LinqUtils.defaultSelector,
  ): IDictionary<TKey, TValue> {
    return Dictionary.createDictionary(source, keySelector, valueSelector);
  }
}
