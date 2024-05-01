import {
  Numeric,
  Predicate,
  Selector,
  NumericSelector,
} from "../types";
import { IGrouping, IOutEnumerable, IOrderable, IEqualityComparer } from "./";

export interface IEnumerable<T, TOut = T> extends IOutEnumerable<T, TOut>, IOrderable<T>, Iterable<T> {
  // materialize and return an array
  toArray(): T[];
  // materialize and return an enumerable
  toList(): IEnumerable<T>;
  // materialize and return the number of elements - I think we can safely skip ordering when calling count(), since we're only interested in the number of elements
  count(predicate?: Predicate<T>): number;
  sum(selector?: NumericSelector<T>): Numeric;
  sum(selector: NumericSelector<T>): Numeric;
  average(selector?: NumericSelector<T>): Numeric;
  average(selector: NumericSelector<T>): Numeric;
  elementAt(index: number): T;
  elementAtOrDefault(index: number): T | undefined;
  first(predicate?: Predicate<T>): T;
  firstOrDefault(predicate?: Predicate<T>): T | undefined;
  last(predicate?: Predicate<T>): T;
  lastOrDefault(predicate?: Predicate<T>): T | undefined;
  single(predicate?: Predicate<T>): T;
  singleOrDefault(predicate?: Predicate<T>): T | undefined;
  // defer execution until enumeration
  append(element: T): IEnumerable<T>;

  // defer execution until enumeration
  reverse(): IEnumerable<T>;

  // defer execution until enumeration, return a new enumerable
  where(predicate: (x: T, i: number, a: T[]) => boolean): IEnumerable<T>;
  // materialize and return true if the sequence is not empty - I think we can safely skip ordering when calling any(), since we're only interested in whether the sequence is empty
  any(predicate?: (x: T, i: number) => boolean): boolean;
  // materialize and return true if all elements satisfy the predicate - I think we can safely skip ordering when calling all(), since we're only interested in whether all elements satisfy the predicate
  all(predicate: (x: T, i: number) => boolean): boolean;
  // materialize and return true if the sequence contains the element - I think we can safely skip ordering when calling contains(), since we're only interested in whether the sequence contains the element
  contains(element: T): boolean;

  take(count: number): IEnumerable<T>;
  takeWhile(predicate: (x: T, i: number) => boolean): IEnumerable<T>;
  skip(count: number): IEnumerable<T>;
  skipWhile(predicate: (x: T, i: number) => boolean): IEnumerable<T>;
  distinct(): IEnumerable<T>;
  union(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  intersect(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  except(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  concat(...args: (T | T[])[]): IEnumerable<T>;
  groupBy<TKey>(keySelector: Selector<T, TKey>): IEnumerable<IGrouping<TKey, T>>;
  [Symbol.iterator](): IterableIterator<T>;
}



//   removeAt(index: number): void;
// }
