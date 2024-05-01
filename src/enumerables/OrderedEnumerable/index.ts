import {  Orderable, Sorter } from "../../types";
import { LinqUtils as Utils } from "../../util";
import { IEnumerable, IEqualityComparer } from "../../interfaces";
import { IOrderedEnumerable } from "../../interfaces/IOrderedEnumerable";
import { EnumerableBase, State } from "../Enumerable/enumerable-base";

export class OrderedEnumerable<T, TOut = T> extends EnumerableBase<T, TOut> implements IOrderedEnumerable<T, TOut> {
  private _sortExpressions: Sorter<T>[];
  private constructor(sortExpressions: Sorter<T>[] = [], state: State) {
    super(state);
    this._sortExpressions = sortExpressions;
  }

  private addOrderOperation(): void {
    this._state.operations.push({
      type: "order",
      action: (x) =>
        x.sort((a, b) => {
          for (const sortExpression of this._sortExpressions) {
            const result = sortExpression(a, b);
            if (result !== 0) {
              return result;
            }
          }
          return 0;
        }),
    });
  }

  public static createOrderedEnumerable<T, TOut = T>(
    state: State,
    sortExpressions: Sorter<T>[] = [],
  ): IOrderedEnumerable<T, TOut> {
    return new OrderedEnumerable(sortExpressions, state)
  }

  thenBy<TKey extends Orderable>(keySelector: (x: T) => TKey): this {
    const sortExpression = Utils.getOrderExpression(keySelector, "asc");
    this._sortExpressions = [...this._sortExpressions, sortExpression];
    return this;
  }

  thenByDescending<TKey extends Orderable>(keySelector: (x: T) => TKey): this {
    const sortExpression = Utils.getOrderExpression(keySelector, "desc");
    this._sortExpressions = [...this._sortExpressions, sortExpression];
    return this;
  }

  public override where(predicate: (x: T, i: number, a: T[]) => boolean): this {
    this.addOrderOperation();
    return super.where(predicate);
  }
  public override take(count: number): this {
    this.addOrderOperation();
    return super.take(count);
  }
  public override takeWhile(predicate: (x: T, i: number) => boolean): this {
    this.addOrderOperation();
    return super.takeWhile(predicate);
  }
  public override skip(count: number): this {
    this.addOrderOperation();
    return super.skip(count);
  }
  public override skipWhile(predicate: (x: T, i: number) => boolean): this {
    this.addOrderOperation();
    return super.skipWhile(predicate);
  }
  public override distinct(): this {
    this.addOrderOperation();
    return super.distinct();
  }
  public override distinctBy<TKey>(keySelector: (x: T) => TKey): this {
    this.addOrderOperation();
    return super.distinctBy(keySelector);
  }

  public override union(other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T> | undefined): this {
    this.addOrderOperation();
    return super.union(other, comparer);
  }

  public override intersect(other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T> | undefined): this {
    this.addOrderOperation();
    return super.intersect(other, comparer);
  }

  public override except(other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T> | undefined): this {
    this.addOrderOperation();
    return super.except(other, comparer);
  }

  public override concat(...args: (T | T[])[]): this {
    this.addOrderOperation();
    return super.concat(...args);
  }

  public override toList(): IEnumerable<T> {
    this.addOrderOperation();
    return super.toList();
  }
  public override append(element: T): this {
    this.addOrderOperation();
    return super.append(element);
  }
  public override reverse(): this {
    this.addOrderOperation();
    return super.reverse();
  }
  public select<TOut>(selector: (x: T, i: number) => TOut): IEnumerable<TOut> {
    this.addOrderOperation();
    return super.select<TOut>(selector);
  }
  public selectMany<TOut>(selector: (x: T, i: number) => TOut[]): IEnumerable<TOut> {
    this.addOrderOperation();
    return super.selectMany<TOut>(selector);
  }
  public override toArray(): T[] {
    this.addOrderOperation();
    return super.toArray();
  }
  public override join<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: (x: T) => TKey,
    innerKeySelector: (x: TInner) => TKey,
    resultSelector: (x: T, y: TInner) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut> {
    this.addOrderOperation();
    return super.join(inner, outerKeySelector, innerKeySelector, resultSelector, comparer);
  }

  public override groupJoin<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: (x: T) => TKey,
    innerKeySelector: (x: TInner) => TKey,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut> {
    this.addOrderOperation();
    return super.groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector, comparer);
  }
}

