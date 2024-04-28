import { IEnumerable } from "./IEnumerable";
import { IOrderedEnumerable } from "./IOrderedEnumerable";
export interface IDelegatedEnumerable<T, TOut extends IEnumerable<T>, TList extends IEnumerable<T> = TOut>
  extends IEnumerable<T> {
  where(predicate: (x: T, i: number, a: T[]) => boolean): TOut;
  take(count: number): TOut;
  takeWhile(predicate: (x: T, i: number) => boolean): TOut;
  skip(count: number): TOut;
  skipWhile(predicate: (x: T, i: number) => boolean): TOut;
  distinct(): TOut;
  distinctBy<TKey>(keySelector: (x: T) => TKey): TOut;
  union(other: T[] | IEnumerable<T>, comparer?: (x: T, y: T) => boolean): TOut;
  intersect(other: T[] | IEnumerable<T>, comparer?: (x: T, y: T) => boolean): TOut;
  except(other: T[] | IEnumerable<T>, comparer?: (x: T, y: T) => boolean): TOut;
  concat(...args: (T | T[])[]): TOut;
  toList(): TList;
  toArray(): T[];
}
