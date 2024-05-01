import { Dictionary, ICanEnumerate, IEnumerableFactory, State } from "..";
import { IDictionary } from "../interfaces/IDictionary";
import { IEnumerable } from "../interfaces/IEnumerable";
import { LinqUtils } from "../util";


export class DictionaryService implements Pick<IEnumerableFactory, 'createDictionary'> {
  createDictionary<TSource, TKey, TValue>(
    source: ICanEnumerate<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector: (x: TSource, index: number) => TValue = LinqUtils.defaultSelector,
  ): IDictionary<TKey, TValue> {
    return Dictionary.createDictionary(source, keySelector, valueSelector);
  }
}
