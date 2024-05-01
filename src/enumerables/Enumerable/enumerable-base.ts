import util from "util";
import { Orderable, Comparable, Selector, Numeric, Predicate, IEnumerableFactory, ICanEnumerate } from "../../types";
import { LinqArrayValidator as Validator } from "../../validator";
import { LinqUtils as Utils } from "../../util";
import { IEnumerable, IDictionary, IOrderedEnumerable, IGrouping, IEqualityComparer } from "../../interfaces";
import { HashSet } from "../HashSet";

import { DictionaryService, EnumerableService, GroupingService, OrderedEnumerableService } from "../../services";

// instantiate services once and reuse them
const enumerableService = new EnumerableService();
const orderedEnumerableService = new OrderedEnumerableService();
const groupingService = new GroupingService();
const dictionaryService = new DictionaryService();

export type State = {
  operations: Operation[];
  source: any[]; // storing the original source array as any[] because we can project to any type, but the transformations don't apply until we enumerate
};
type OperationType = "project" | "order" | "filter" | "group" | "aggregate" | "element" | "set"; // I expect I'll want to add/change operation types
type Operation = {
  type: OperationType;
  action: (x: any[]) => any[];
};

abstract class BaseAbstractEnumerable<T, TOut = T> {
  protected _state: State;
  protected factory: IEnumerableFactory;
  [index: number]: T; // allow array access
  toArray(): T[] {
    this.enumerate();
    return this._state.source;
  }
  constructor(initialState: State) {
    this._state = initialState;
    this.factory = {
      create: enumerableService.create,
      createOrderedEnumerable: orderedEnumerableService.createOrderedEnumerable,
      createGrouping: groupingService.createGrouping,
      createDictionary: dictionaryService.createDictionary,
    };
  }

  protected enumerate(shouldApplyOperation: (operation: Operation) => boolean = () => true): void {
    this._state.operations.filter(shouldApplyOperation).forEach((operation) => {
      this._state.source = operation.action(this._state.source);
    });
  }

  protected addOperation(operation: Operation): void {
    this._state.operations.push(operation);
  }
}

export abstract class EnumerableBase<T, TOut = T> extends BaseAbstractEnumerable<T, TOut> implements IEnumerable<T, TOut> {
  public append(element: T): this {
    this.addOperation({
      type: "project",
      action: (x) => {
        x.push(element);
        return x;
      },
    });
    return this;
  }

  public reverse(): this {
    this.addOperation({
      type: "project",
      action: (x) => {
        return x.reverse();
      },
    });
    return this;
  }

  public select<TOut>(selector: (x: T, i: number) => TOut): IEnumerable<TOut> {
    this.addOperation({
      type: "project",
      action: (x) => x.map(selector),
    });
    return this.factory.create<T, TOut>(this._state);
  }

  public selectMany<TOut>(selector: (x: T, i: number) => TOut[]): IEnumerable<TOut> {
    this.addOperation({
      type: "project",
      action: (x) => x.flatMap(selector),
    });
    return this.factory.create<T, TOut>(this._state);
  }

  public where(predicate: (x: T, i: number, a: T[]) => boolean): this {
    this.addOperation({
      type: "filter",
      action: (x) => x.filter(predicate),
    });
    return this;
  }

  public elementAt(index: number): T {
    this.enumerate();
    Validator.throwIfEmpty(this._state.source);
    index = Math.floor(index);
    return Validator.throwIfIndexOutOfRange(this._state.source, index);
  }

  public elementAtOrDefault(index: number): T | undefined {
    this.enumerate();
    index = Math.floor(index);
    return this._state.source[index];
  }

  public first(predicate: Predicate<T> = Utils.defaultPredicate): T {
    this.enumerate();
    Validator.throwIfEmpty(this._state.source);
    const index = this._state.source.findIndex(predicate);
    return Validator.throwIfIndexOutOfRange(this._state.source, index);
  }

  public last(predicate: Predicate<T> = Utils.defaultPredicate): T {
    this.enumerate();
    Validator.throwIfEmpty(this._state.source);
    let index = this._state.source.length;
    while (index--) {
      if (predicate(this._state.source[index])) {
        break;
      }
    }
    return Validator.throwIfIndexOutOfRange(this._state.source, index);
  }

  count(predicate: Predicate<T> = Utils.defaultPredicate): number {
    this.enumerate();
    return this._state.source.filter(predicate).length;
  }

  public any(predicate: (x: T, i: number) => boolean = Utils.defaultPredicate): boolean {
    this.enumerate();
    return this._state.source.some(predicate);
  }

  public all(predicate: (x: T, i: number) => boolean): boolean {
    this.enumerate();
    return this._state.source.every(predicate);
  }

  public contains(element: T): boolean {
    this.enumerate();
    return this._state.source.includes(element);
  }

  public sum(selector?: (x: T) => Numeric): Numeric;
  public sum(selector: (x: T) => Numeric): Numeric {
    this.enumerate();

    Validator.throwIfEmpty(this._state.source);

    if (selector) {
      return this._state.source.reduce((acc, curr) => acc + (selector(curr) as number), 0);
    }
    Validator.throwIfMissingNumberSelector(this._state.source);
    return this._state.source.reduce((acc, curr) => acc + (curr as number), 0);
  }

  public average(selector?: (x: T) => Numeric): Numeric;
  public average(selector: (x: T) => Numeric): Numeric {
    this.enumerate();

    Validator.throwIfEmpty(this._state.source);
    if (selector) {
      return Number(this.sum(selector)) / this._state.source.length;
    }
    Validator.throwIfMissingNumberSelector(this._state.source);
    return Number(this.sum()) / this._state.source.length;
  }

  public max<TResult extends Comparable>(selector?: (x: T) => TResult): TResult {
    this.enumerate();
    Validator.throwIfEmpty(this._state.source);
    if (selector) {
      let max = selector(this._state.source[0]);
      this._state.source.forEach((el) => {
        if (selector(el) > max) {
          max = selector(el);
        }
      });
      return max;
    }
    Validator.throwIfInvalidMinMaxSelector(this._state.source);
    let max = this._state.source[0];
    this._state.source.forEach((el) => {
      if (el > max) {
        max = el;
      }
    });
    return max as T & TResult;
  }

  public min<TResult extends Comparable>(selector?: (x: T) => TResult): TResult {
    this.enumerate();
    Validator.throwIfEmpty(this._state.source);
    if (selector) {
      let min = selector(this._state.source[0]);
      this._state.source.forEach((el) => {
        if (selector(el) < min) {
          min = selector(el);
        }
      });
      return min;
    }
    Validator.throwIfInvalidMinMaxSelector(this._state.source);
    let min = this._state.source[0];
    this._state.source.forEach((el) => {
      if (el < min) {
        min = el;
      }
    });
    return min as T & TResult;
  }

  public orderBy(selector: (x: T) => Orderable): IOrderedEnumerable<T> {
    const sortOperation = Utils.getOrderExpression(selector, "asc");
    return this.factory.createOrderedEnumerable<T>(this._state, [sortOperation]);
  }

  public orderByDescending(selector: (x: T) => Orderable): IOrderedEnumerable<T> {
    const sortOperation = Utils.getOrderExpression(selector, "desc");
    return this.factory.createOrderedEnumerable<T>(this._state, [sortOperation]);
  }

  public take(count: number): this {
    if (count <= 0) this._state.source = [];
    this._state.source = this._state.source.slice(0, count);
    return this;
  }

  public takeWhile(predicate: (x: T, i: number) => boolean): this {
    const index = this._state.source.findIndex((x, i) => !predicate(x, i));
    return this.take(index);
  }

  public skip(count: number): this {
    if (count < 0) return this;
    this._state.source = this._state.source.slice(count);
    return this;
  }

  public skipWhile(predicate: (x: T, i: number) => boolean): this {
    this.addOperation({
      type: "filter",
      action: (x) => {
        let index = 0;
        while (predicate(x[index], index)) {
          index++;
        }
        return x.slice(index);
      },
    });

    return this;
  }

  public firstOrDefault(predicate: Predicate<T> = Utils.defaultPredicate): T | undefined {
    this.enumerate();
    return this._state.source.find(predicate);
  }

  public lastOrDefault(predicate: Predicate<T> = Utils.defaultPredicate): T | undefined {
    this.enumerate();
    let index = this._state.source.length;
    while (index--) {
      if (predicate(this._state.source[index])) {
        return this._state.source[index];
      }
    }
    return undefined;
  }

  public singleOrDefault(predicate: (x: T) => boolean = Utils.defaultPredicate): T | undefined {
    this.enumerate();
    const result = this._state.source.filter(predicate);
    Validator.throwIfMultiple(result);
    return result[0];
  }

  public single(predicate: (x: T) => boolean = Utils.defaultPredicate): T {
    this.enumerate();
    Validator.throwIfEmpty(this._state.source);
    const result = this._state.source.filter(predicate);
    Validator.throwIfMultiple(result);
    return Validator.throwIfIndexOutOfRange(result, 0);
  }

  public distinct(): this {
    this.addOperation({
      type: "set",
      action: (x) => [...new Set(x)],
    });
    return this;
  }

  public distinctBy<TKey>(keySelector: (x: T) => TKey): this {
    this.addOperation({
      type: "set",
      action: (x) => {
        const map = new Map<TKey, T>();
        for (let i = 0; i < x.length; i++) {
          const el = x[i];
          const key = keySelector(el);
          if (!map.has(key)) {
            map.set(key, el);
          }
        }
        return [...map.values()];
      },
    });
    return this;
  }

  private setOperation(
    action: (set: HashSet<T>, otherSet: HashSet<T>) => HashSet<T>,
    other: ICanEnumerate<T>,
    comparer?: IEqualityComparer<T>,
  ): this {
    this.addOperation({
      type: "set",
      action: (x) => {
        const set = new HashSet(x, comparer);
        const otherSet = new HashSet(other, comparer);
        return [...action(set, otherSet).values()];
      },
    });
    return this;
  }

  public union(other: ICanEnumerate<T>, comparer?: IEqualityComparer<T>): this {
    return this.setOperation(
      (set, otherSet) => {
        otherSet.forEach((x) => set.add(x));
        return set;
      },
      other,
      comparer,
    );
  }

  public intersect(other: ICanEnumerate<T>, comparer?: IEqualityComparer<T>): this {
    return this.setOperation(
      (set, otherSet) => {
        const intersection = new HashSet<T>();
        set.forEach((x) => {
          if (otherSet.has(x)) {
            intersection.add(x);
          }
        });
        return intersection;
      },
      other,
      comparer,
    );
  }

  public except(other: ICanEnumerate<T>, comparer?: IEqualityComparer<T>): this {
    return this.setOperation(
      (set, otherSet) => {
        otherSet.forEach((x) => set.delete(x));
        return set;
      },
      other,
      comparer,
    );
  }

  //TODO: Write some unit tests for this
  public concat(...args: (T | T[])[]): this {
    if (args.length) {
      this.addOperation({
        type: "element",
        action: (x) => x.concat(...args),
      });
    }
    return this;
  }

  public join<TInner, TKey, TResult = TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: (x: T) => TKey,
    innerKeySelector: (x: TInner) => TKey,
    resultSelector: (x: T, y: TInner) => TResult,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TResult> {
    const comparerFn = comparer?.equals || Utils.defaultComparer;
    this.addOperation({
      type: "project",
      action: (x) => {
        return x.flatMap((outer) => {
          const outerKey = outerKeySelector(outer);
          const innerMatch = [...inner].filter((inn) => comparerFn(innerKeySelector(inn!), outerKey));
          return innerMatch.map((inn) => resultSelector(outer, inn!));
        });
      },
    });
    return this.factory.create<T, TResult>(this._state);
  }

  public groupJoin<TInner, TKey, TResult = TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: (x: T) => TKey,
    innerKeySelector: (x: TInner) => TKey,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TResult,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TResult> {
    const comparerFn = comparer?.equals || Utils.defaultComparer;
    this.addOperation({
      type: "project",
      action: (x) => {
        return x.map((outer) => {
          const outerKey = outerKeySelector(outer);
          const innerMatch = [...inner].filter((inn) => comparerFn(innerKeySelector(inn!), outerKey));
          return resultSelector(outer, this.factory.create({ source: innerMatch, operations: [] }));
        });
      },
    });
    return this.factory.create<T, TResult>(this._state);
  }

  public toDictionary<TKey, TOut>(
    keySelector: Selector<T, TKey>,
    valueSelector: Selector<T, TOut>,
  ): IDictionary<TKey, TOut> {
    this.enumerate();
    return this.factory.createDictionary<T, TKey, TOut>(this._state.source, keySelector, valueSelector);
  }

  public groupBy<TKey>(keySelector: (x: T) => TKey): IEnumerable<IGrouping<TKey, T>> {
    this.addOperation({
      type: "group",
      action: (x) => {
        const map = new Map<TKey, T[]>();
        for (let i = 0; i < x.length; i++) {
          const el = x[i];
          const key = keySelector(el);
          if (!map.has(key)) {
            map.set(key, []);
          }
          map.get(key)?.push(el);
        }
        return [...map.entries()].map(([key, value]) =>
          this.factory.createGrouping(key, {
            operations: [],
            source: value,
          }),
        );
      },
    });
    return this.factory.create<T, IGrouping<TKey, T>>(this._state);
  }

  public toList(): IEnumerable<T> {
    this.enumerate();
    return this.factory.create({ source: this._state.source, operations: [] });
  }

  [Symbol.iterator](): IterableIterator<T> {
    this.enumerate();
    let index = 0;
    const data = this._state.source;
    return {
      next() {
        if (index < data.length) {
          return { value: data[index++] as T, done: false };
        } else {
          return { done: true, value: undefined };
        }
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }

  [util.inspect.custom] = () => this.toString();

  toString() {
    return `Enumerable(${this._state.source.length}): ${this._state.source.map((x) => JSON.stringify(x, null, 2)).join(" ")}`;
  }
}

abstract class EnumeratorBase<T, TOut = T> extends EnumerableBase<T, TOut> {
  public abstract enumerate(): void;
}
