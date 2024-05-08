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
export class Generator {
  public static *range(start: number, count: number): Iterable<number> {
    while (count--) yield start++;
  }

  public static *repeat<T>(element: T, count: number): Iterable<T> {
    while (count-- > 0) yield element;
  }

  public static *reverse<T>(source: Iterable<T>): Iterable<T> {
    yield* [...source].reverse(); // fastest way to reverse an iterable
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
