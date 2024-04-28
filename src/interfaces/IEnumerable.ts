import {
  EqualityComparer,
  Comparable,
  Numeric,
  Predicate,
  Selector,
  NumericSelector,
  Orderable,
  Sorter,
} from "../types";
import { IDictionary } from "./IDictionary";
import { IGrouping } from "./IGrouping";
import { IOrderedEnumerable } from "./IOrderedEnumerable";

export interface IEnumerable<T> {
  toArray(): T[];
  append(element: T): IEnumerable<T>;
  reverse(): IEnumerable<T>;
  forEach(action: (x: T, i: number) => void): void;
  select<TR>(selector: (x: T, i: number) => TR): IEnumerable<TR>;
  selectMany<TR>(selector: (x: T, i: number) => TR[]): IEnumerable<TR>;
  where(predicate: (x: T, i: number, a: T[]) => boolean): IEnumerable<T>;
  elementAt(index: number): T;
  elementAtOrDefault(index: number): T | undefined;
  first(predicate?: Predicate<T>): T;
  last(predicate?: Predicate<T>): T;
  count(predicate?: Predicate<T>): number;
  any(predicate?: (x: T, i: number) => boolean): boolean;
  all(predicate: (x: T, i: number) => boolean): boolean;
  contains(element: T): boolean;
  orderBy(selector: (x: T) => Orderable): IOrderedEnumerable<T>;
  orderByDescending(selector: (x: T) => Orderable): IOrderedEnumerable<T>;
  take(count: number): IEnumerable<T>;
  takeWhile(predicate: (x: T, i: number) => boolean): IEnumerable<T>;
  skip(count: number): IEnumerable<T>;
  skipWhile(predicate: (x: T, i: number) => boolean): IEnumerable<T>;
  sum(selector?: NumericSelector<T>): Numeric;
  sum(selector: NumericSelector<T>): Numeric;
  average(selector?: NumericSelector<T>): Numeric;
  average(selector: NumericSelector<T>): Numeric;
  max<TResult extends Comparable>(selector?: Selector<T, TResult>): TResult;
  min<TResult extends Comparable>(selector?: Selector<T, TResult>): TResult;
  firstOrDefault(predicate?: Predicate<T>): T | undefined;
  lastOrDefault(predicate?: Predicate<T>): T | undefined;
  singleOrDefault(predicate?: Predicate<T>): T | undefined;
  single(predicate?: Predicate<T>): T;
  distinct(): IEnumerable<T>;
  distinctBy<TKey>(keySelector: Selector<T, TKey>): IEnumerable<T>;
  union(other: T[] | IEnumerable<T>, comparer?: EqualityComparer<T>): IEnumerable<T>;
  intersect(other: T[] | IEnumerable<T>, comparer?: EqualityComparer<T>): IEnumerable<T>;
  except(other: T[] | IEnumerable<T>, comparer?: EqualityComparer<T>): IEnumerable<T>;
  concat(...args: (T | T[])[]): IEnumerable<T>;
  join<TInner, TKey, TResult>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: TInner) => TResult,
    comparer?: EqualityComparer<TKey>,
  ): IEnumerable<TResult>;
  groupJoin<TInner, TKey, TResult>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TResult,
    comparer?: EqualityComparer<TKey>,
  ): IEnumerable<TResult>;
  toString(): string;
  [Symbol.iterator](): IterableIterator<T>;
  toDictionary<TKey, TValue = T>(
    keySelector: Selector<T, TKey>,
    valueSelector?: Selector<T, TValue>,
  ): IDictionary<TKey, TValue>;
  groupBy<TKey>(keySelector: Selector<T, TKey>): IEnumerable<IGrouping<TKey, T>>;
  toList(): IEnumerable<T>;
}
