import { Dictionary, IEnumerableFactory} from "..";
import { IDictionary } from "../interfaces/IDictionary";
import { LinqUtils } from "../util";

export class DictionaryService implements Pick<IEnumerableFactory, 'createDictionary'> {
  createDictionary<TSource, TKey, TValue>(
    source: Iterable<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector: (x: TSource, index: number) => TValue = LinqUtils.defaultSelector,
  ): IDictionary<TKey, TValue> {
    return Dictionary.createDictionary(source, keySelector, valueSelector);
  }
}
