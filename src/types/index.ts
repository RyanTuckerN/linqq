import { IDictionary, IEnumerable, IGrouping, IOrderedEnumerable } from "../interfaces";
import { ICollection } from "../interfaces/ICollection";
import { IList } from "../interfaces/IList";

type Comparer<T, TR> = (a: T, b: T) => TR;
export interface ICanEnumerate<T> extends Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}
export type Numeric = number & bigint;
export type Comparable = number | bigint | Date;
export type Orderable = number | bigint | Date | string | number;
export type KeyValuePair<TKey, TValue> = { key: TKey; value: TValue };
export type Pagination = { take: number; skip: number };
export type Sorter<T> = { selector: (item: T) => any; descending: boolean };
export type Selector<T, TResult> = (item: T) => TResult;
export type SelectorWithIndex<T, TResult> = (item: T, index: number) => TResult;
export type NumericSelector<T> = Selector<T, number>;
export type OrderSelector<T> = Selector<T, Orderable>;
export type Predicate<T> = (item: T) => boolean;
export type PredicateWithIndex<T> = (item: T, index: number) => boolean;
export interface IEnumerableFactory {
  create<T>(source: Iterable<T>): IEnumerable<T>;
  createGrouping<TKey, TValue>(key: TKey, source: Iterable<TValue>): IGrouping<TKey, TValue>;
  createOrderedEnumerable<T>(source: Iterable<T>, sortingExpression: Sorter<T>[]): IOrderedEnumerable<T>;
  createList<T>(source: Iterable<T>): IList<T>;
  createCollection<T>(source: Iterable<T>): ICollection<T>;
  createDictionary<TSource, TKey, TValue>(
    source: Iterable<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector?: (x: TSource, index: number) => TValue,
  ): IDictionary<TKey, TValue>;
}
