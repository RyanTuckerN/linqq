import {
  Numeric,
  Predicate,
  Orderable,
  PredicateWithIndex,
  Selector,
  NumericSelector,
  SelectorWithIndex,
  Comparable,
} from "../types";
import { IGrouping, IEqualityComparer, IDictionary, IOrderedEnumerable, Indexable } from "./";
import { HashSet } from "../enumerables";
import { IList } from "./IList";

export interface IEnumerable<T> extends Iterable<T>, IterableIterator<T> {
  // Transformation
  toArray(): T[];
  toList(): IList<T>;
  ensureList(): IList<T>;
  toSet(comparer?: IEqualityComparer<T>): HashSet<T>;
  toDictionary<TKey, TOut = T>(
    keySelector: Selector<T, TKey>,
    valueSelector?: Selector<T, TOut>,
  ): IDictionary<TKey, TOut> & Indexable<TKey, TOut>;
  cast<TOut>(): IEnumerable<TOut>;
  
  // Aggregation
  aggregate<TAccumulate, TResult>(
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector: (acc: TAccumulate) => TResult,
  ): TResult;
  count(predicate?: Predicate<T>): number;
  sum(selector?: NumericSelector<T>): Numeric;
  sum(selector: NumericSelector<T>): Numeric;
  average(selector?: NumericSelector<T>): Numeric;
  average(selector: NumericSelector<T>): Numeric;
  max<TOut extends Comparable>(selector?: Selector<T, TOut>): TOut;
  min<TOut extends Comparable>(selector?: Selector<T, TOut>): TOut;
  
  // Quantifiers
  any(predicate?: Predicate<T>): boolean;
  all(predicate: Predicate<T>): boolean;
  contains(element: T): boolean;

  // Element
  elementAt(index: number): T;
  elementAtOrDefault(index: number): T | undefined;
  first(predicate?: Predicate<T>): T;
  firstOrDefault(predicate?: Predicate<T>): T | undefined;
  last(predicate?: Predicate<T>): T;
  lastOrDefault(predicate?: Predicate<T>): T | undefined;
  single(predicate?: Predicate<T>): T;
  singleOrDefault(predicate?: Predicate<T>): T | undefined;
  append(element: T): IEnumerable<T>;
  reverse(): IEnumerable<T>;

  // Query
  where(predicate: Predicate<T>): IEnumerable<T>;
  select<TOut>(selector: SelectorWithIndex<T, TOut>): IEnumerable<TOut>;
  selectMany<TOut>(selector: SelectorWithIndex<T, Iterable<TOut>>): IEnumerable<TOut>;
  join<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: TInner) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut>;
  groupJoin<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut>;
  orderBy(selector: (x: T) => Orderable): IOrderedEnumerable<T>;
  orderByDescending(selector: (x: T) => Orderable): IOrderedEnumerable<T>;
  take(count: number): IEnumerable<T>;
  takeWhile(predicate: PredicateWithIndex<T>): IEnumerable<T>;
  skip(count: number): IEnumerable<T>;
  skipWhile(predicate: PredicateWithIndex<T>): IEnumerable<T>;
  concat(...args: (Iterable<T>)[]): IEnumerable<T>;
  zip<TOut, TSecond = T>(second: Iterable<TSecond>, selector: (f: T, s: TSecond) => TOut): IEnumerable<TOut>;

  // Set
  distinct(): IEnumerable<T>;
  distinctBy<TOut>(selector: Selector<T, TOut>): IEnumerable<T>;
  union(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  intersect(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  except(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  groupBy<TKey, TNext = T>(
    keySelector: Selector<T, TKey>,
    elementSelector?: Selector<T, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<IGrouping<TKey, T>>;
  
  [Symbol.iterator](): IterableIterator<T>;
}
