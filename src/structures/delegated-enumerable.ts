import {
  Orderable,
  Comparable,
  Selector,
  Numeric,
  EqualityComparer,
  Predicate,
  NumericSelector,
  Sorter,
} from "../types";
import { IEnumerable } from "../interfaces/IEnumerable";
import { IGrouping } from "../interfaces/IGrouping";
import { IDictionary } from "../interfaces/IDictionary";
import { IOrderedEnumerable } from "../interfaces/IOrderedEnumerable";
import { IDelegatedEnumerable } from "../interfaces/IDelegatedEnumerable";


export abstract class DelegatedEnumerable<T, TOut extends IEnumerable<T>> implements IDelegatedEnumerable<T, TOut> {
  protected source: IEnumerable<T>;
  protected abstract createInstance(source: IEnumerable<T>): TOut;
  // [index: number]: T;
  constructor(source: IEnumerable<T>) {
    this.source = source;
    return new Proxy(this, {
      get(target, prop) {
        if (!(prop in target) && typeof prop === "string" && `${Number(prop)}` === prop) {
          return target.source.elementAtOrDefault(+prop);
        }
        return target[prop as keyof typeof target];
      },
    });
  }

  append(element: T): TOut {
    return this.createInstance(this.source.append(element));
  }
  reverse(): TOut {
    return this.createInstance(this.source.reverse());
  }
  forEach(action: (x: T, i: number) => void): void {
    return this.source.forEach(action);
  }
  select<TR>(selector: (x: T, i: number) => TR): IEnumerable<TR> {
    return this.source.select(selector);
  }
  selectMany<TR>(selector: (x: T, i: number) => TR[]): IEnumerable<TR> {
    return this.source.selectMany(selector);
  }
  where(predicate: (x: T, i: number, a: T[]) => boolean): TOut {
    return this.createInstance(this.source.where(predicate))
  }
  elementAt(index: number): T {
    return this.source.elementAt(index);
  }
  elementAtOrDefault(index: number): T | undefined {
    return this.source.elementAtOrDefault(index);
  }
  first(predicate?: Predicate<T> | undefined): T {
    return this.source.first(predicate);
  }
  last(predicate?: Predicate<T> | undefined): T {
    return this.source.last(predicate);
  }
  count(predicate?: Predicate<T> | undefined): number {
    return this.source.count(predicate);
  }
  any(predicate?: ((x: T, i: number) => boolean) | undefined): boolean {
    return this.source.any(predicate);
  }
  all(predicate: (x: T, i: number) => boolean): boolean {
    return this.source.all(predicate);
  }
  contains(element: T): boolean {
    return this.source.contains(element);
  }
  orderBy(selector: (x: T) => Orderable): IOrderedEnumerable<T> {
    return this.source.orderBy(selector);
  }
  orderByDescending(selector: (x: T) => Orderable): IOrderedEnumerable<T> {
    return this.source.orderByDescending(selector);
  }
  take(count: number): TOut {
    return this.createInstance(this.source.take(count));
  }
  takeWhile(predicate: (x: T, i: number) => boolean): TOut {
    return this.createInstance(this.source.takeWhile(predicate));
  }
  skip(count: number): TOut {
    return this.createInstance(this.source.skip(count));
  }
  skipWhile(predicate: (x: T, i: number) => boolean): TOut {
    return this.createInstance(this.source.skipWhile(predicate));
  }
  sum(selector?: NumericSelector<T> | undefined): Numeric;
  sum(selector: NumericSelector<T>): Numeric {
    return this.source.sum(selector);
  }
  average(selector?: NumericSelector<T> | undefined): Numeric;
  average(selector: NumericSelector<T>): Numeric {
    return this.source.average(selector);
  }
  max<TResult extends Comparable>(selector?: Selector<T, TResult> | undefined): TResult {
    return this.source.max(selector);
  }
  min<TResult extends Comparable>(selector?: Selector<T, TResult> | undefined): TResult {
    return this.source.min(selector);
  }
  firstOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    return this.source.firstOrDefault(predicate);
  }
  lastOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    return this.source.lastOrDefault(predicate);
  }
  singleOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    return this.source.singleOrDefault(predicate);
  }
  single(predicate: Predicate<T>): T {
    return this.source.single(predicate);
  }
  distinct(): TOut {
    return this.createInstance(this.source.distinct());
  }
  distinctBy<TKey>(keySelector: Selector<T, TKey>): TOut {
    return this.createInstance(this.source.distinctBy(keySelector));
  }
  union(other: IEnumerable<T> | T[], comparer?: EqualityComparer<T> | undefined): TOut {
    return this.createInstance(this.source.union(other, comparer));
  }
  intersect(other: IEnumerable<T> | T[], comparer?: EqualityComparer<T> | undefined): TOut {
    return this.createInstance(this.source.intersect(other, comparer));
  }
  except(other: IEnumerable<T> | T[], comparer?: EqualityComparer<T> | undefined): TOut {
    return this.createInstance(this.source.except(other, comparer));
  }
  concat(...args: (T | T[])[]): TOut {
    return this.createInstance(this.source.concat(...args));
  }
  join<TInner, TKey, TResult>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: TInner) => TResult,
    comparer?: EqualityComparer<TKey> | undefined,
  ): IEnumerable<TResult> {
    return this.source.join(inner, outerKeySelector, innerKeySelector, resultSelector, comparer);
  }
  groupJoin<TInner, TKey, TResult>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TResult,
    comparer?: EqualityComparer<TKey> | undefined,
  ): IEnumerable<TResult> {
    return this.source.groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector, comparer);
  }
  toString(): string {
    return [...this.source].toString();
  }
  toDictionary<TKey, TValue = T>(
    keySelector: Selector<T, TKey>,
    valueSelector: Selector<T, TValue>,
  ): IDictionary<TKey, TValue> {
    return this.source.toDictionary(keySelector, valueSelector);
  }
  groupBy<TKey>(keySelector: Selector<T, TKey>): IEnumerable<IGrouping<TKey, T>> {
    return this.source.groupBy(keySelector);
  }
  toList(): TOut {
    return this.createInstance(this.source.toList());
  }
  toArray(): T[] {
    return this.source.toArray();
  }
  [Symbol.iterator](): IterableIterator<T> {
    return this.source[Symbol.iterator]();
  }
}
