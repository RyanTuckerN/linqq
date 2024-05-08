import { IEnumerable, IGrouping, IOrderedEnumerable, IList, IDictionary } from ".";
import { Sorter } from "../types";

export interface IEnumerableFactory {
  create<T>(source: Iterable<T>): IEnumerable<T>;
  createGrouping<TKey, TValue>(key: TKey, source: Iterable<TValue>): IGrouping<TKey, TValue>;
  createOrderedEnumerable<T>(source: Iterable<T>, sortingExpression: Sorter<T>[]): IOrderedEnumerable<T>;
  createList<T>(source: Iterable<T>): IList<T>;
  createDictionary<TSource, TKey, TValue>(
    source: Iterable<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector?: (x: TSource, index: number) => TValue,
  ): IDictionary<TKey, TValue>;
}
