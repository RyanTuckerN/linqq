import { Orderable, Selector, Sorter } from "../types";
import { LinqUtils as Utils } from "../util";
import { IEnumerable } from "../interfaces/IEnumerable";
import { IOrderedEnumerable } from "../interfaces/IOrderedEnumerable";
import { DelegatedEnumerable } from "./delegated-enumerable";
import { Enumerable } from "./enumerable";
import { IDictionary } from "../interfaces/IDictionary";

export class OrderedEnumerable<T>
  extends DelegatedEnumerable<T, IOrderedEnumerable<T>>
  implements IOrderedEnumerable<T>
{
  public static createOrderedEnumerable<T>(
    data: IEnumerable<T>,
    sortExpressions: Array<(a: T, b: T) => number> = [],
  ): IOrderedEnumerable<T> {
    return new OrderedEnumerable(data, sortExpressions);
  }
  private _sortExpressions: Sorter<T>[];
  protected constructor(data: IEnumerable<T>, sortExpressions: Sorter<T>[] = []) {
    super(data);
    this._sortExpressions = sortExpressions;
  }

  public toArray(): T[] {
    return this.materializedList.toArray();
  }

  private get materializedList(): IEnumerable<T> {
    const copy = this.source.toArray();
    copy.sort((a, b) => {
      for (const sortExpression of this._sortExpressions) {
        const result = sortExpression(a, b);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    });

    return (Enumerable.create(copy));
  }

  public override orderBy<TKey extends Orderable>(keySelector: (x: T) => TKey): IOrderedEnumerable<T> {
    this._sortExpressions = [...this._sortExpressions, Utils.getOrderExpression(keySelector, "asc")];
    return this;
  }

  public override orderByDescending<TKey extends Orderable>(keySelector: (x: T) => TKey): IOrderedEnumerable<T> {
    this._sortExpressions = [...this._sortExpressions, Utils.getOrderExpression(keySelector, "desc")];
    return this;
  }

  public thenBy<TKey extends Orderable>(keySelector: (x: T) => TKey): IOrderedEnumerable<T> {
    this._sortExpressions = [...(this._sortExpressions || []), Utils.getOrderExpression(keySelector, "asc")];
    return this;
  }

  public thenByDescending<TKey extends Orderable>(keySelector: (x: T) => TKey): IOrderedEnumerable<T> {
    this._sortExpressions = [...this._sortExpressions, Utils.getOrderExpression(keySelector, "desc")];
    return this;
  }

  protected createInstance(source: IEnumerable<T>): IOrderedEnumerable<T> {
    return OrderedEnumerable.createOrderedEnumerable(source, this._sortExpressions);
  }

  public override toList(): IOrderedEnumerable<T> {
    return this.createInstance(this.materializedList);
  }

  public override where(predicate: (x: T, i: number, a: T[]) => boolean): IOrderedEnumerable<T> {
    return this.createInstance(this.materializedList.where(predicate));
  }

  public override append(element: T): IOrderedEnumerable<T> {
    return this.createInstance(this.materializedList.append(element));
  }

  public override reverse(): IOrderedEnumerable<T> {
    return this.createInstance(this.materializedList.reverse());
  }

  public override take(count: number): IOrderedEnumerable<T> {
    return this.createInstance(this.materializedList.take(count));
  }

  public override takeWhile(predicate: (x: T, i: number) => boolean): IOrderedEnumerable<T> {
    return this.createInstance(this.materializedList.takeWhile(predicate));
  }

  public override skip(count: number): IOrderedEnumerable<T> {
    return this.createInstance(this.materializedList.skip(count));
  }

  public override skipWhile(predicate: (x: T, i: number) => boolean): IOrderedEnumerable<T> {
    return this.createInstance(this.materializedList.skipWhile(predicate));
  }

  public override forEach(action: (x: T, i: number) => void): void {
    this.materializedList.forEach(action);
  }

  public override elementAt(index: number): T {
    return this.materializedList.elementAt(index);
  }

  public override elementAtOrDefault(index: number): T | undefined {
    return this.materializedList.elementAtOrDefault(index);
  }

  public override toDictionary<TKey, TValue = T>(
    keySelector: Selector<T, TKey>,
    valueSelector: Selector<T, TValue>,
  ): IDictionary<TKey, TValue> {
    return this.materializedList.toDictionary(keySelector, valueSelector);
  }
  public override select<TR>(selector: (x: T, i: number) => TR): IEnumerable<TR> {
    return Enumerable.create(this.materializedList.select(selector));
  }
  public override selectMany<TR>(selector: (x: T, i: number) => TR[]): IEnumerable<TR> {
    return Enumerable.create(this.materializedList.selectMany(selector));
  }
}

// The following methods require materialization of the source enumerable, and need to be overridden above:
// - where
// - append
// - reverse
// - take
// - takeWhile
// - skip
// - skipWhile
// - forEach
// - elementAt
// - elementAtOrDefault
