import util from "util";
import {
  Orderable,
  Comparable,
  Selector,
  Numeric,
  EqualityComparer,
  Predicate,
  IEnumerableConfig as EnumerableFactory,
} from "../types";
import { LinqArrayValidator as Validator } from "../validator";
import { LinqUtils as Utils } from "../util";
import { IEnumerable } from "../interfaces/IEnumerable";
import { IGrouping } from "../interfaces/IGrouping";
import { IDictionary } from "../interfaces/IDictionary";
import { IOrderedEnumerable } from "../interfaces/IOrderedEnumerable";
import { HashSet } from "../structures/hash-set";

import { DictionaryService } from "../services/dictionary-service";
import { OrderedEnumerableService } from "../services/ordered-enumerable-service";
import { GroupingService } from "../services/grouping-service";

const dictionaryService = new DictionaryService();
const orderedEnumerableService = new OrderedEnumerableService();
const groupingService = new GroupingService();

export abstract class EnumerableBase<T> implements IEnumerable<T> {
  protected _data: T[]; // source array
  protected factory: EnumerableFactory;
  [index: number]: T; // allow array access
  abstract toArray(): T[];
  protected abstract createInstance<T>(data: T[]): IEnumerable<T>;
  constructor(data: T[]) {
    this._data = data;
    this.factory = {
      createDictionary: dictionaryService.createDictionary,
      createOrderedEnumerable: orderedEnumerableService.createOrderedEnumerable,
      createGrouping: groupingService.create,
    };
  }

  public forEach(action: (x: T, i: number) => void): void {
    this._data.forEach(action);
  }

  public append(element: T): IEnumerable<T> {
    return this.createInstance([...this._data, element]) as this;
  }

  public reverse(): this {
    return this.createInstance([...this._data].reverse()) as this;
  }

  public select<TR>(selector: (x: T, i: number) => TR): IEnumerable<TR> {
    return this.createInstance(this._data.map(selector));
  }

  public selectMany<TR>(selector: (x: T, i: number) => TR[]): IEnumerable<TR> {
    return this.createInstance(this._data.flatMap(selector));
  }

  public where(predicate: (x: T, i: number, a: T[]) => boolean): this {
    return this.createInstance(this._data.filter(predicate)) as this;
  }

  public elementAt(index: number): T {
    Validator.throwIfEmpty(this._data);
    index = Math.floor(index);
    return Validator.throwIfIndexOutOfRange(this._data, index);
  }

  public elementAtOrDefault(index: number): T | undefined {
    index = Math.floor(index);
    return this._data[index];
  }

  public first(predicate: Predicate<T> = Utils.defaultPredicate): T {
    Validator.throwIfEmpty(this._data);
    const index = this._data.findIndex(predicate);
    return Validator.throwIfIndexOutOfRange(this._data, index);
  }

  public last(predicate: Predicate<T> = Utils.defaultPredicate): T {
    Validator.throwIfEmpty(this._data);
    const reversed = [...this._data].reverse();
    const index = reversed.findIndex(predicate);
    return Validator.throwIfIndexOutOfRange(reversed, index);
  }

  count(predicate: Predicate<T> = Utils.defaultPredicate): number {
    return this._data.filter(predicate).length;
  }

  public any(predicate: (x: T, i: number) => boolean = Utils.defaultPredicate): boolean {
    return this._data.some(predicate);
  }

  public all(predicate: (x: T, i: number) => boolean): boolean {
    return this._data.every(predicate);
  }

  public contains(element: T): boolean {
    return this._data.includes(element);
  }

  public sum(selector?: (x: T) => Numeric): Numeric;
  public sum(selector: (x: T) => Numeric): Numeric {
    Validator.throwIfEmpty(this._data);

    if (selector) {
      return this._data.reduce((acc, curr) => acc + (selector(curr) as number), 0);
    }
    Validator.throwIfMissingNumberSelector(this._data);
    return this._data.reduce((acc, curr) => acc + (curr as number), 0);
  }

  public average(selector?: (x: T) => Numeric): Numeric;
  public average(selector: (x: T) => Numeric): Numeric {
    Validator.throwIfEmpty(this._data);
    if (selector) {
      return Number(this.sum(selector)) / this._data.length;
    }
    Validator.throwIfMissingNumberSelector(this._data);
    return Number(this.sum()) / this._data.length;
  }

  public max<TResult extends Comparable>(selector?: (x: T) => TResult): TResult {
    Validator.throwIfEmpty(this._data);
    if (selector) {
      let max = selector(this._data[0]);
      this._data.forEach((el) => {
        if (selector(el) > max) {
          max = selector(el);
        }
      });
      return max;
    }
    Validator.throwIfInvalidMinMaxSelector(this._data);
    let max = this._data[0];
    this._data.forEach((el) => {
      if (el > max) {
        max = el;
      }
    });
    return max as unknown as TResult;
  }

  public min<TResult extends Comparable>(selector?: (x: T) => TResult): TResult {
    Validator.throwIfEmpty(this._data);
    if (selector) {
      let min = selector(this._data[0]);
      this._data.forEach((el) => {
        if (selector(el) < min) {
          min = selector(el);
        }
      });
      return min;
    }
    Validator.throwIfInvalidMinMaxSelector(this._data);
    let min = this._data[0];
    this._data.forEach((el) => {
      if (el < min) {
        min = el;
      }
    });
    return min as unknown as TResult;
  }

  public orderBy(selector: (x: T) => Orderable): IOrderedEnumerable<T> {
    const sortOperation = Utils.getOrderExpression(selector, "asc");
    return this.factory.createOrderedEnumerable(this, [sortOperation]);
  }

  public orderByDescending(selector: (x: T) => Orderable): IOrderedEnumerable<T> {
    const sortOperation = Utils.getOrderExpression(selector, "desc");
    return this.factory.createOrderedEnumerable(this, [sortOperation]);
  }

  public take(count: number): this {
    if (count < 0) return this.createInstance<T>([]) as this;
    return this.createInstance(this._data.slice(0, count)) as this;
  }

  public takeWhile(predicate: (x: T, i: number) => boolean): this {
    const index = this._data.findIndex((x, i) => !predicate(x, i));
    return this.take(index);
  }

  public skip(count: number): this {
    if (count < 0) return this;
    return this.createInstance(this._data.slice(count)) as this;
  }

  public skipWhile(predicate: (x: T, i: number) => boolean): this {
    const index = this._data.findIndex((x, i) => !predicate(x, i));
    return this.skip(index);
  }

  public firstOrDefault(predicate: Predicate<T> = Utils.defaultPredicate): T | undefined {
    return this._data.find(predicate);
  }

  public lastOrDefault(predicate: Predicate<T> = Utils.defaultPredicate): T | undefined {
    return [...this._data].reverse().find(predicate);
  }

  public singleOrDefault(predicate: (x: T) => boolean = Utils.defaultPredicate): T | undefined {
    const result = this._data.filter(predicate);
    Validator.throwIfMultiple(result);
    return result[0];
  }

  public single(predicate: (x: T) => boolean = Utils.defaultPredicate): T {
    Validator.throwIfEmpty(this._data);
    const result = this._data.filter(predicate);
    Validator.throwIfMultiple(result);
    return Validator.throwIfIndexOutOfRange(result, 0);
  }

  public distinct(): this {
    return this.createInstance([...new HashSet(this._data)]) as this;
  }

  public distinctBy<TKey>(keySelector: (x: T) => TKey): this {
    const map = new Map<TKey, T>();
    for (let i = 0; i < this._data.length; i++) {
      const el = this._data[i];
      const key = keySelector(el);
      if (!map.has(key)) {
        map.set(key, el);
      }
    }

    return this.createInstance([...map.values()]) as this;
  }

  public union(other: T[] | IEnumerable<T>, comparer?: EqualityComparer<T>): this {
    return this.createInstance([...new HashSet([...this._data, ...((other ?? []) as T[])], comparer)]) as this;
  }

  public intersect(other: T[] | IEnumerable<T>, comparer: EqualityComparer<T> = Utils.defaultEqualityComparer): this {
    return this.createInstance([
      ...new HashSet(
        this._data.filter((x) => [...other].find((y) => y && comparer(x, y))),
        comparer,
      ),
    ] as T[]) as this;
  }

  public except(other: T[] | IEnumerable<T>, comparer: EqualityComparer<T> = Utils.defaultEqualityComparer): this {
    return this.createInstance<T>([
      ...new HashSet(
        this._data.filter((x) => ![...other].find((y) => y && comparer(x, y))),
        comparer,
      ),
    ] as T[]) as this;
  }

  //TODO: Write some unit tests for this
  public concat(...args: (T | T[])[]): IEnumerable<T> {
    if (!args.length) return this.createInstance(this._data.slice());
    return this.createInstance([
      ...this._data,
      ...args.flat(), // flatten the args, in case they are arrays
    ]) as IEnumerable<T>;
  }

  public join<TInner, TKey, TResult>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: (x: T) => TKey,
    innerKeySelector: (x: TInner) => TKey,
    resultSelector: (x: T, y: TInner) => TResult,
    comparer: EqualityComparer<TKey> = Utils.defaultEqualityComparer,
  ): IEnumerable<TResult> {
    return this.createInstance(
      this._data.flatMap((outer) => {
        const outerKey = outerKeySelector(outer);
        const innerMatch = [...inner].filter((inn) => comparer(innerKeySelector(inn!), outerKey));
        return innerMatch.map((inn) => resultSelector(outer, inn!));
      }),
    );
  }

  public groupJoin<TInner, TKey, TResult>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: (x: T) => TKey,
    innerKeySelector: (x: TInner) => TKey,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TResult,
    comparer: EqualityComparer<TKey> = Utils.defaultEqualityComparer,
  ): IEnumerable<TResult> {
    return this.createInstance(
      this._data.map((outer) => {
        const outerKey = outerKeySelector(outer);
        const innerMatch = this.createInstance([...inner].filter((inn) => comparer(innerKeySelector(inn!), outerKey)));
        return resultSelector(outer, innerMatch);
      }),
    );
  }

  public toDictionary<TKey, TValue>(
    keySelector: Selector<T, TKey>,
    valueSelector: Selector<T, TValue>,
  ): IDictionary<TKey, TValue> {
    return this.factory.createDictionary<T, TKey, TValue>(this, keySelector, valueSelector);
  }

  public groupBy<TKey>(keySelector: (x: T) => TKey): IEnumerable<IGrouping<TKey, T>> {
    const map = new Map<TKey, T[]>();
    for (let i = 0; i < this._data.length; i++) {
      const el = this._data[i];
      const key = keySelector(el);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(el);
    }

    return this.createInstance(
      [...map.entries()].map(([key, value]) => this.factory.createGrouping(key, this.createInstance(value))),
    );
  }

  public toList(): IEnumerable<T> {
    return this.createInstance<T>([...this._data]);
  }

  [Symbol.iterator](): IterableIterator<T> {
    let index = 0;
    const data = this._data;
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
    return `Collection(${this._data.length}): ${this._data.toLocaleString()}`;
  }
}
