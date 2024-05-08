import { EnumerableBase, Grouping, HashSet, Lookup } from "../enumerables";
import { IEqualityComparer, IEnumerable, IGrouping } from "../interfaces";
import { PredicateWithIndex, Selector, Predicate, Comparable, SelectorWithIndex } from "../types";
import { Exception } from "../validator/exception";
export type QueryOptions<T, TState, TResult> = {
  shouldYield: (item: T, state: TState) => boolean;
  selector: (item: T, state: TState) => TResult;
  afterYield?: (state: TState) => TState;
  shouldBreak?: (item: TResult, state: TState) => boolean;
};
export class EnumerableOperations {
  public static *range(start: number, count: number): Iterable<number> {
    while (count--) yield start++;
  }

  public static *repeat<T>(element: T, count: number): Iterable<T> {
    while (count-- > 0) yield element;
  }

  public static *where<T>(source: Iterable<T>, predicate: Predicate<T>): Iterable<T> {
    for (const item of source) {
      if (predicate(item)) yield item;
    }
  }

  public static *select<T, TOut>(source: Iterable<T>, selector: Selector<T, TOut>): Iterable<TOut> {
    for (const item of source) {
      yield selector(item);
    }
  }

  public static *whereSelect<T, TOut>(
    source: Iterable<T>,
    predicate: Predicate<T>,
    selector: Selector<T, TOut>,
  ): Iterable<TOut> {
    for (const item of source) {
      if (predicate(item)) yield selector(item);
    }
  }

  public static *selectMany<T, TOut>(
    source: Iterable<T>,
    selector: SelectorWithIndex<T, Iterable<TOut>>,
  ): Iterable<TOut> {
    let i = 0;
    for (const item of source) {
      yield* selector(item, i++);
    }
  }

  public static aggregate<T, TAccumulate, TResult>(
    source: Iterable<T>,
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector?: (acc: TAccumulate) => TResult,
  ): TResult {
    let acc = seed;
    for (const item of source) {
      acc = func(acc, item);
    }
    return resultSelector ? resultSelector(acc) : (acc as T & TResult);
  }

  public static max<T, TOut extends Comparable>(source: Iterable<T>, selector?: Selector<T, TOut> | undefined): TOut {
    let max: TOut | undefined = undefined;
    for (const item of source) {
      const value = selector ? selector(item) : (item as unknown as TOut);
      if (max === undefined || value > max) max = value;
    }
    if (max === undefined) throw Exception.sequenceEmpty();
    return max;
  }

  public static min<T, TOut extends Comparable>(source: Iterable<T>, selector?: Selector<T, TOut> | undefined): TOut {
    let min: TOut | undefined = undefined;
    for (const item of source) {
      const value = selector ? selector(item) : (item as unknown as TOut);
      if (min === undefined || value < min) min = value;
    }
    if (min === undefined) throw Exception.sequenceEmpty();
    return min;
  }

  public static count<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): number {
    let count = 0;
    for (const item of source) {
      if (!predicate || predicate(item)) count++;
    }
    return count;
  }

  public static sum<T>(source: Iterable<T>, selector?: Selector<T, number> | undefined): number {
    selector ??= (x) => x as number;
    let sum = 0;
    for (const item of source) {
      sum += selector(item);
    }
    return sum as number;
  }

  public static average<T>(source: Iterable<T>, selector?: Selector<T, number> | undefined): number {
    selector ??= (x) => x as number;
    let sum = 0;
    let count = 0;
    for (const item of source) {
      sum += selector(item);
      count++;
    }
    if (count === 0) throw Exception.sequenceEmpty();
    return (sum / count) as number;
  }

  public static elementAtOrDefault<T>(source: Iterable<T>, index: number): T | undefined {
    let i = 0;
    for (const item of source) if (i++ === index) return item;
    return undefined;
  }

  public static elementAt<T>(source: Iterable<T>, index: number): T {
    const el = this.elementAtOrDefault(source, index);
    if (el === undefined) throw Exception.indexOutOfRange();
    return el;
  }

  public static first<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T {
    const el = this.firstOrDefault(source, predicate);
    if (el === undefined) throw Exception.sequenceEmpty();
    return el;
  }

  public static firstOrDefault<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T | undefined {
    for (const item of source) {
      if (!predicate || predicate(item)) return item;
    }
    return undefined;
  }

  public static last<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T {
    const el = this.lastOrDefault(source, predicate);
    if (el === undefined) throw Exception.sequenceEmpty();
    return el;
  }

  public static lastOrDefault<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T | undefined {
    let last;
    for (const item of source) {
      if (!predicate || predicate(item)) last = item;
    }
    return last;
  }

  public static single<T>(source: Iterable<T>, predicate?: Predicate<T>): T {
    const el = this.singleOrDefault(source, predicate);
    if (el === undefined) throw Exception.sequenceEmpty();
    return el;
  }

  public static singleOrDefault<T>(source: Iterable<T>, predicate?: Predicate<T>): T | undefined {
    let found: T | undefined = undefined;
    for (const item of source) {
      if (!predicate || predicate(item)) {
        if (found !== undefined) throw Exception.moreThanOne();
        found = item;
      }
    }
    return found;
  }

  public static any<T>(source: Iterable<T>, predicate?: PredicateWithIndex<T> | undefined): boolean {
    let i = 0;
    for (const item of source) {
      if (!predicate || predicate(item, i++)) return true;
    }
    return false;
  }

  public static all<T>(source: Iterable<T>, predicate: PredicateWithIndex<T>): boolean {
    let i = 0;
    for (const item of source) if (!predicate(item, i++)) return false;
    return true;
  }

  public static contains<T>(source: Iterable<T>, element: T, comparer?: IEqualityComparer<T>): boolean {
    if (comparer) {
      for (const item of source) {
        if (comparer.equals(item, element)) return true;
      }
    } else {
      for (const item of source) {
        if (item === element) return true;
      }
    }
    return false;
  }

  public static *reverse<T>(source: Iterable<T>): Iterable<T> {
    yield* [...source].reverse();
  }

  public static *take<T>(source: Iterable<T>, count: number): Iterable<T> {
    if (count > 0) {
      for (const item of source) {
        yield item;
        if (--count === 0) break;
      }
    }
  }
  public static *takeWhile<T>(source: Iterable<T>, predicate: PredicateWithIndex<T>): Iterable<T> {
    let i = 0;
    for (const item of source) {
      if (!predicate(item, i++)) break;
      yield item;
    }
  }

  public static *skip<T>(source: Iterable<T>, count: number): Iterable<T> {
    for (const item of source) {
      if (count-- > 0) continue;
      yield item;
    }
  }

  public static *skipWhile<T>(source: Iterable<T>, predicate: PredicateWithIndex<T>): Iterable<T> {
    let i = 0;
    for (const item of source) {
      if (predicate(item, i++)) continue;
      yield item;
    }
  }

  public static *distinctBy<T, TKey>(source: Iterable<T>, selector: Selector<T, TKey>): Iterable<T> {
    const map = new Map<TKey, T>();
    for (const item of source) {
      const key = selector(item);
      if (!map.has(key)) {
        map.set(key, item);
        yield item;
      }
    }
  }

  public static *distinct<T>(source: Iterable<T>): Iterable<T> {
    const set = new Set<T>(source);
    yield* set.values();
  }

  public static *union<T>(source: Iterable<T>, other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T>) {
    let set: Set<T> | undefined;
    if (comparer) {
      set = new HashSet<T>([...source, ...other], comparer);
    } else {
      set = new Set<T>([...source, ...other]);
    }
    yield* set.values();
  }

  public static *intersect<T>(
    source: Iterable<T>,
    other: IEnumerable<T> | T[],
    comparer: IEqualityComparer<T>,
  ): Iterable<T> {
    let set: Set<T> | undefined;
    if (comparer) {
      set = new HashSet<T>(other, comparer);
    } else {
      set = new Set<T>(other);
    }
    for (const item of source) {
      if (set.has(item)) yield item;
    }
  }
  public static *except<T>(
    source: Iterable<T>,
    other: IEnumerable<T> | T[],
    comparer: IEqualityComparer<T>,
  ): Iterable<T> {
    let set: Set<T> | undefined;
    if (comparer) {
      set = new HashSet<T>(other, comparer);
    } else {
      set = new Set<T>(other);
    }
    for (const item of source) {
      if (!set.has(item)) yield item;
    }
  }

  public static *concat<T>(source: Iterable<T>, ...args: Iterable<T>[]): Iterable<T> {
    for (const item of source) {
      yield item;
    }
    for (const arg of args) {
      for (const item of arg) {
        yield item;
      }
    }
  }

  /**
   * Generates a sequence of values starting with the initial value and applying the action to the current value
   * until the predicate returns false.
   * @param config Configure the generator.
   * @returns A sequence of values.
   * @throws If the predicate, selector, or action is null.
   * @throws If an error occurs during the generation and no error handler is provided.
   * @example
   * ```typescript
   * const sequence = EnumerableOperations.generate({
   * initial: 1, // x
   * predicate: (x) => x < 10,
   * action: (x) => x + 1,
   * selector: (x) => x * 2,
   * });
   * // sequence: 1, 2, 4, 8, 16, 32, 64, 128, 256, 512
   * ```
   */
  public static *generateFrom<TState, TNext>(config: {
    initial: TState;
    predicate: Predicate<TState>;
    selector: Selector<TState, TNext>;
    action: (current: TState) => TState;
  }): Iterable<TNext> {
    const { initial, predicate, selector, action } = config;
    if (!predicate) throw Exception.argumentNull("predicate");
    if (!selector) throw Exception.argumentNull("selector");
    if (!action) throw Exception.argumentNull("action");
    if ("initial" in config && !predicate(initial)) return;
    for (let i = initial; predicate(i); i = action(i)) {
      yield selector(i);
    }
  }

  // *generateFor<TSource, TNext>(options: {
  //   source: Iterable<TSource>;
  //   predicate: PredicateWithIndex<TSource>;
  //   selector: SelectorWithIndex<TSource, TNext>;
  //   shouldBreak?: (current: TSource, index: number) => boolean;
  // }): Iterable<TNext> {
  //   const { source, predicate, selector, shouldBreak } = options;
  //   if (!predicate) throw Exception.argumentNull("predicate");
  //   if (!selector) throw Exception.argumentNull("selector");
  //   let i = 0;
  //   for (const item of source) {
  //     if (!predicate(item, i++)) continue;
  //     yield selector(item, i);
  //     if (shouldBreak && shouldBreak(item, i)) break;
  //   }
  // }

  public static *zip<T, TSecond, TOut>(
    source: Iterable<T>,
    second: Iterable<TSecond>,
    selector: (f: T, s: TSecond) => TOut,
  ): Iterable<TOut> {
    const first = source[Symbol.iterator]();
    const secondIterator = second[Symbol.iterator]();
    let firstResult = first.next();
    let secondResult = secondIterator.next();
    while (!firstResult.done && !secondResult.done) {
      yield selector(firstResult.value, secondResult.value);
      firstResult = first.next();
      secondResult = secondIterator.next();
    }
  }

  public static *groupBy<T, TKey, TNext = T>(
    source: IEnumerable<T>,
    keySelector: Selector<T, TKey>,
    elementSelector?: Selector<T, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): Iterable<IGrouping<TKey, TNext>> {
    const lookup = Lookup.create(source, keySelector, elementSelector ?? ((x) => x as T & TNext), comparer);
    for (const group of lookup) {
      yield Grouping.createGrouping<TKey, TNext>(group, group.key);
    }
  }
}
