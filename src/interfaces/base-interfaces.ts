import { IEqualityComparer, IOrderedEnumerable, IEnumerable, IDictionary } from ".";
import { Orderable, Selector, Comparable } from "../types";

export interface IOrderable<T> {
  orderBy(selector: (x: T) => Orderable): IOrderedEnumerable<T>;
  orderByDescending(selector: (x: T) => Orderable): IOrderedEnumerable<T>;
}

abstract class OrderableBase<T> implements IOrderable<T> {
  orderBy(selector: (x: T) => Orderable): IOrderedEnumerable<T, T> {
    throw new Error("Method not implemented.");
  }
  orderByDescending(selector: (x: T) => Orderable): IOrderedEnumerable<T, T> {
    throw new Error("Method not implemented.");
  }
}

export interface IOutEnumerable<T, TOut> {
  select<TOut>(selector: (x: T, i: number) => TOut): IEnumerable<TOut>;
  selectMany<TOut>(selector: (x: T, i: number) => TOut[]): IEnumerable<TOut>;
  max<TOut extends Comparable>(selector?: Selector<T, TOut>): TOut;
  min<TOut extends Comparable>(selector?: Selector<T, TOut>): TOut;
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

  // materialize and return a dictionary
  toDictionary<TKey, TOut = T>(
    keySelector: Selector<T, TKey>,
    valueSelector?: Selector<T, TOut>,
  ): IDictionary<TKey, TOut>;
}

abstract class OutEnumerableBase<T, TOut> implements IOutEnumerable<T, TOut> {
  select<TOut>(selector: (x: T, i: number) => TOut): IEnumerable<TOut> {
    throw new Error("Method not implemented.");
  }
  selectMany<TOut>(selector: (x: T, i: number) => TOut[]): IEnumerable<TOut> {
    throw new Error("Method not implemented.");
  }
  max<TOut extends Comparable>(selector?: Selector<T, TOut>): TOut {
    throw new Error("Method not implemented.");
  }
  min<TOut extends Comparable>(selector?: Selector<T, TOut>): TOut {
    throw new Error("Method not implemented.");
  }
  join<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: TInner) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut> {
    throw new Error("Method not implemented.");
  }
  groupJoin<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut> {
    throw new Error("Method not implemented.");
  }
  toDictionary<TKey, TOut = T>(
    keySelector: Selector<T, TKey>,
    valueSelector?: Selector<T, TOut>,
  ): IDictionary<TKey, TOut> {
    throw new Error("Method not implemented.");
  }

}

