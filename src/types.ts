import { IDictionary, IEnumerable, IGrouping, IOrderedEnumerable } from "./interfaces";
import { State } from "./enumerables";

// export interface ICanEnumerate<T> {
//   [Symbol.iterator](): Iterator<T>;
// }
export interface ICanEnumerate<T> extends Iterable<T> {}

export type Numeric = number | bigint;
export type Comparable = number | bigint | Date;
export type Orderable = number | bigint | Date | string | number;
export type KeyValuePair<TKey, TValue> = { key: TKey; value: TValue };
export type Pagination = { take: number; skip: number };
type Comparer<T, TR> = (a: T, b: T) => TR;
export type Sorter<T> = Comparer<T, number>;
export type Selector<T, TResult> = (item: T) => TResult;
export type NumericSelector<T> = Selector<T, number>;
export type Predicate<T> = (item: T) => boolean;
export interface IEnumerableFactory {
  create<T, TOut = T>(state: State): IEnumerable<TOut>;
  createDictionary<TSource, TKey, TValue>(
    source: ICanEnumerate<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector?: (x: TSource, index: number) => TValue,
  ): IDictionary<TKey, TValue>;
  createOrderedEnumerable<T, TOut = T>(state: State, sortingExpression: Sorter<TOut>[]): IOrderedEnumerable<TOut>;
  createGrouping<TKey, TValue>(key: TKey, state: State): IGrouping<TKey, TValue>;
}
