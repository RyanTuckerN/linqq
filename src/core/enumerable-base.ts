// import type {
//   Selector,
//   Predicate,
//   NumericSelector,
//   SelectorWithIndex,
//   PredicateWithIndex,
//   IEnumerable,
//   IDictionary,
//   IOrderedEnumerable,
//   IGrouping,
//   IEqualityComparer,
//   IList,
//   IExtendedList,
//   IHashSet,
//   Indexable,
// } from "../";
import type { Predicate, PredicateWithIndex, Selector, SelectorWithIndex, NumericSelector, Indexable } from "../types";
import type {
  IDictionary,
  IEnumerable,
  IOrderedEnumerable,
  IGrouping,
  IEqualityComparer,
  IList,
  IExtendedList,
  IHashSet,
} from "@interfaces";
import { Generator } from "../operations/generator";
import { Operation } from "../operations/operation";
import { Exception } from "../validator/exception";
import { Utils } from "../util";
import {
  createDictionary as dictionary,
  createHashSet as hashSet,
  createList as list,
  isList,
} from "@factories/collection-factory";
import {
  createWhereIterator as where,
  createGeneratorIterator as generator,
  createWhereSelectIterator as whereSelect,
  createWhereSelectArrayIterator as whereSelectArray,
  createSelectManyIterator as selectMany,
  createOrderedEnumerable as orderedEnumerable,
  createJoinIterator as join,
  createGroupJoinIterator as groupJoin,
  createGroupingIterator as grouping,
  createWhereArrayIterator as whereArray,
} from "@factories/iterator-factory";
import util from "util";

/**
 * Represents a collection of elements - the main structure of the `linqq` library.
 * All other classes and methods are built around this class.
 * Elements can be accessed by index, and the collection can be iterated over, just like an array.
 * The power of the Enumerable class, however, lies in the methods it provides for querying and manipulating the elements.
 * Operations like `where`, `select`, `groupBy`, `orderBy`, `join`, and many more are available to transform and filter the elements in the collection.
 * @typeparam T The type of elements in the collection.
 */
export class EnumerableBase<T> implements IEnumerable<T> {
  public static from<T>(source: Iterable<T>): IEnumerable<T> {
    return new EnumerableBase<T>(source);
  }
  protected constructor(protected source: Iterable<T>) {}

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.source;
  }

  [util.inspect.custom](): string {
    return this.toString();
  }

  /**
   * Create an empty Enumerable.
   * @returns An empty Enumerable.
   * @example
   * ```typescript
   * const empty = Enumerable.empty();
   * console.log(empty.toArray()); // []
   * ```
   */
  public static empty<T>(): IEnumerable<T> {
    return EnumerableBase.from<T>(Utils.defaultSource());
  }

  /**
   * Generate a new Enumerable from a given element with the specified count.
   * It is important to note that the element is repeated by reference.
   * @param element The element to repeat.
   * @param count The number of times to repeat the element.
   * @returns A new Enumerable from a given element with the specified count.
   * @example
   * ```typescript
   * const repeat = Enumerable.repeat(1, 3);
   * console.log(repeat.toArray()); // [1, 1, 1]
   * ```
   */
  public static repeat<T>(element: T, count: number): IEnumerable<T> {
    if (count < 0) return EnumerableBase.empty<T>();
    count = Math.floor(count);
    return EnumerableBase.from(generator<T>(() => Generator.repeat(element, count)));
  }

  /**
   * Create a new Enumerable within the specified range.
   * @param start The start of the range.
   * @param count The number of elements in the range.
   * @returns A new Enumerable within the specified range.
   * @example
   * ```typescript
   * const range = Enumerable.range(1, 5);
   * console.log(range.toArray()); // [1, 2, 3, 4, 5]
   * ```
   */
  public static range(start: number, count: number): IEnumerable<number> {
    (start = Math.floor(start)), (count = Math.floor(count));
    if (count < 0) return EnumerableBase.empty<number>();
    return EnumerableBase.from(generator<number>(() => Generator.range(start, count)));
  }

  /**
   * Generates a sequence of values starting with the initial value and applying the action to the current value
   * until the predicate returns false.
   * @param initial `TState` The initial value.
   * @param predicate `(state: TState) => boolean` The predicate to determine if the sequence should continue.
   * @param action `(prevState: TState) => TState` The action to apply to the current value.
   * @param selector `(TState) => TOut` The selector to transform the current value.
   * @returns An IEnumerable of values.
   * @throws If the predicate, selector, or action is null.
   * @throws If an error occurs during the generation and no error handler is provided.
   * @example
   * ```typescript
   * const sequence = EnumerableOperations.generate(
   *  1, // x
   *  (x) => x < 10,
   *  (x) => x + 1,
   *  (x) => x * 2)
   * // sequence: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512
   * ```
   */
  public static generate<TState, TOut>(
    initial: TState,
    predicate: Predicate<TState>,
    action: (state: TState) => TState,
    selector: Selector<TState, TOut>,
  ): IEnumerable<TOut> {
    if (!predicate) throw Exception.argumentNull("predicate");
    if (!selector) throw Exception.argumentNull("selector");
    if (!action) throw Exception.argumentNull("action");
    return EnumerableBase.from(generator<TOut>(() => Generator.generateFrom({ initial, predicate, selector, action })));
  }

  toString(): string {
    return `${this.constructor.name} { ${this.toArray().join(", ")} }`;
  }

  ensureList(): IList<T> {
    // if (this instanceof List) return this;
    return this.toList();
  }

  toList(): IList<T> {
    return list(this);
  }

  toExtendedList(): IExtendedList<T> {
    return <IExtendedList<T>>list(this); // All Lists are ExtendedLists, but we only expose the interface if it's explicitly requested since it has a lot of extra methods.
  }

  toArray(): T[] {
    return [...this];
  }

  toHashSet(comparer?: IEqualityComparer<T>): IHashSet<T> {
    return hashSet(this, comparer);
  }

  toSet(): Set<T> {
    return new Set(this);
  }

  cast<TOut>(): IEnumerable<TOut> {
    return Utils.cast<IEnumerable<TOut>>(this);
  }

  where(predicate: Predicate<T> | PredicateWithIndex<T>): IEnumerable<T> {
    if (!predicate) throw Exception.argumentNull("predicate");
    if (predicate.length > 1) return generator<T>(() => Generator.where(this, predicate));
    let iterable: IEnumerable<T> | any;
    if (Array.isArray(this.source)) {
      iterable = whereArray(this.source, predicate as Predicate<T>);
    } else if (isList<T>(this)) {
      iterable = whereArray(this.toArray(), predicate as Predicate<T>);
    } else {
      iterable = where(this, predicate as Predicate<T>);
    }
    return Utils.cast<IEnumerable<T>>(iterable);
  }

  select<TOut>(selector: (x: T, i: number) => TOut): IEnumerable<TOut> {
    if (!selector) throw Exception.argumentNull("selector");
    let iterable: IEnumerable<TOut> | any;
    if (Array.isArray(this.source)) {
      iterable = whereSelectArray(this.source, undefined, selector);
    } else if (isList<T>(this)) {
      iterable = whereSelectArray(this.toArray(), undefined, selector);
    } else {
      iterable = whereSelect(this, undefined, selector);
    }
    return Utils.cast<IEnumerable<TOut>>(iterable);
  }

  selectMany<TOut>(selector: SelectorWithIndex<T, Iterable<TOut>>): IEnumerable<TOut> {
    if (!selector) throw Exception.argumentNull("selector");
    return Utils.cast<IEnumerable<TOut>>(selectMany<T, TOut>(this, selector));
  }

  aggregate<TAccumulate, TResult = TAccumulate>(
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector?: (acc: TAccumulate) => TResult,
  ): TResult {
    if (!this) throw Exception.argumentNull("source");
    if (!func) throw Exception.argumentNull("func");
    return Operation.aggregate(this, seed, func, resultSelector);
  }

  max<TOut>(selector?: Selector<T, TOut> | undefined): TOut {
    return Operation.max(this, selector);
  }

  min<TOut>(selector?: Selector<T, TOut> | undefined): TOut {
    return Operation.min(this, selector);
  }

  toDictionary<TKey, TOut>(
    keySelector: Selector<T, TKey>,
    valueSelector?: Selector<T, TOut>,
  ): IDictionary<TKey, TOut> & Indexable<TKey, TOut> {
    if (!keySelector) throw Exception.argumentNull("keySelector");
    return dictionary(this, keySelector, valueSelector);
  }

  count(predicate?: Predicate<T> | undefined): number {
    return Operation.count(this, predicate);
  }

  sum(selector?: NumericSelector<T> | undefined): number;
  sum(selector: NumericSelector<T>): number {
    return Operation.sum(this, selector);
  }

  average(selector?: Partial<NumericSelector<T>> | undefined): number;
  average(selector: NumericSelector<T>): number {
    return Operation.average(this, selector);
  }

  join<TInner, TKey, TOut>(
    inner: IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: TInner) => TOut,
    comparer?: IEqualityComparer<TKey> | undefined,
  ): IEnumerable<TOut> {
    if (!inner) throw Exception.argumentNull("inner");
    if (!outerKeySelector) throw Exception.argumentNull("outerKeySelector");
    if (!innerKeySelector) throw Exception.argumentNull("innerKeySelector");
    if (!resultSelector) throw Exception.argumentNull("resultSelector");
    return Utils.cast<IEnumerable<TOut>>(
      join(this, inner, outerKeySelector, innerKeySelector, resultSelector, comparer),
    );
  }

  groupJoin<TInner, TKey, TOut>(
    inner: IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TOut,
    comparer?: IEqualityComparer<TKey> | undefined,
  ): IEnumerable<TOut> {
    if (!inner) throw Exception.argumentNull("inner");
    if (!outerKeySelector) throw Exception.argumentNull("outerKeySelector");
    if (!innerKeySelector) throw Exception.argumentNull("innerKeySelector");
    if (!resultSelector) throw Exception.argumentNull("resultSelector");
    return Utils.cast<IEnumerable<TOut>>(
      groupJoin(this, inner, outerKeySelector, innerKeySelector, resultSelector, comparer),
    );
  }
  elementAt(index: number): T {
    return Operation.elementAt(this, index);
  }

  elementAtOrDefault(index: number): T | undefined {
    return Operation.elementAtOrDefault(this, index);
  }

  first(predicate?: Predicate<T> | undefined): T {
    return Operation.first(this, predicate);
  }

  firstOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    return Operation.firstOrDefault(this, predicate);
  }

  last(predicate?: Predicate<T> | undefined): T {
    return Operation.last(this, predicate);
  }

  lastOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    return Operation.lastOrDefault(this, predicate);
  }

  single(predicate?: Predicate<T>): T {
    return Operation.single(this, predicate);
  }

  singleOrDefault(predicate?: Predicate<T>): T | undefined {
    return Operation.singleOrDefault(this, predicate);
  }

  reverse(): IEnumerable<T> {
    return generator(() => Generator.reverse(this));
  }

  append(element: T): IEnumerable<T> {
    return this.concat([element]);
  }

  any(predicate?: PredicateWithIndex<T> | undefined): boolean {
    return Operation.any(this, predicate);
  }
  all(predicate: PredicateWithIndex<T>): boolean {
    if (!predicate) throw Exception.argumentNull("predicate");
    return Operation.all(this, predicate);
  }

  contains(element: T): boolean {
    return this.any((x) => x === element);
  }

  take(count: number): IEnumerable<T> {
    if (count < 0) count = 0;
    return generator(() => Generator.take(this, count));
  }

  takeWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    if (!predicate) throw Exception.argumentNull("predicate");
    return generator(() => Generator.takeWhile(this, predicate));
  }

  skip(count: number): IEnumerable<T> {
    count = Math.floor(count);
    if (count < 0) count = 0;
    return generator(() => Generator.skip(this, count));
  }

  skipWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    if (!predicate) throw Exception.argumentNull("predicate");
    return generator(() => Generator.skipWhile(this, predicate));
  }

  distinct(): IEnumerable<T> {
    return generator(() => Generator.distinct(this));
  }

  distinctBy<TOut>(selector: Selector<T, TOut>): IEnumerable<T> {
    if (!selector) throw Exception.argumentNull("selector");
    return generator(() => Generator.distinctBy(this, selector));
  }

  union(other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T>): IEnumerable<T> {
    return generator(() => Generator.union(this, other, comparer));
  }

  intersect(other: IEnumerable<T> | T[], comparer: IEqualityComparer<T>): IEnumerable<T> {
    if (!other) throw Exception.argumentNull("other");
    return generator(() => Generator.intersect(this, other, comparer));
  }

  except(other: IEnumerable<T> | T[], comparer: IEqualityComparer<T>): IEnumerable<T> {
    if (!other) throw Exception.argumentNull("other");
    return generator(() => Generator.except(this, other, comparer));
  }

  concat(...args: Iterable<T>[]): IEnumerable<T> {
    if (!args.length) throw Exception.argumentNull("args");
    return generator(() => Generator.concat(this, ...args));
  }

  zip<TOut, TSecond = T>(second: Iterable<TSecond>, selector: (f: T, s: TSecond) => TOut): IEnumerable<TOut> {
    if (!second) throw Exception.argumentNull("second");
    if (!selector) throw Exception.argumentNull("selector");
    return generator(() => Generator.zip(this, second, selector));
  }

  groupBy<TKey, TNext = T>(
    keySelector: Selector<T, TKey>,
    elementSelector?: Selector<T, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<IGrouping<TKey, T>> {
    return grouping(this, keySelector, elementSelector, comparer) as IEnumerable<IGrouping<TKey, T>>;
  }

  sequenceEqual(other: Iterable<T>, comparer?: IEqualityComparer<T> | undefined): boolean {
    return Operation.sequenceEqual(this, other, comparer);
  }

  orderBy<TKey>(selector: Selector<T, TKey>): IOrderedEnumerable<T> {
    return orderedEnumerable(this, [{ selector, descending: false }]);
  }

  orderByDescending<TKey>(selector: Selector<T, TKey>): IOrderedEnumerable<T> {
    return orderedEnumerable(this, [{ selector, descending: true }]);
  }
}

export abstract class IteratorBase<TSource, TNext extends any = TSource> extends EnumerableBase<TSource> {
  constructor(protected source: Iterable<TSource>) {
    super(source as Iterable<TSource & TNext>);
    this.sourceIterator = this.source[Symbol.iterator]();
  }
  protected sourceIterator: Iterator<TSource>;
  protected state = 0; // 0 = before iteration, 1 = during iteration, 2 = after iteration
  public [Symbol.iterator](): IterableIterator<TSource & TNext> {
    return this.getIterator();
  }
  next(): IteratorResult<TSource & TNext> {
    // prettier-ignore
    return (
      this.moveNext() 
        ? { done: false, value: this.current } 
        : { done: this._done(), value: undefined }
      ) as IteratorResult<TSource & TNext>;
  }

  private _done(): true {
    this.current = undefined as TNext;
    this.state = 2; // 2 = done
    return true;
  }

  protected current!: TNext;
  protected abstract clone(): IteratorBase<TSource, TNext>;
  private getIterator(): typeof this {
    if (this.state === 0) {
      this.state = 1;
      return this;
    }
    const copy = this.clone();
    copy.state = 1;
    return copy as typeof this;
  }

  public abstract moveNext(): boolean;
}
