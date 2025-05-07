import { createHashSet as hashSet } from "@factories/collection-factory";
import { IEqualityComparer } from "@interfaces/IEqualityComparer";
import { PredicateWithIndex, Selector, Predicate } from "../types";

export class GeneratorUtils {
  public static *where<T>(source: Iterable<T>, predicate: PredicateWithIndex<T>): Iterable<T> {
    let i = -1;
    for (const item of source) {
      if (predicate(item, ++i)) yield item;
    }
  }

  public static *range(start: number, count: number): Iterable<number> {
    while (count--) yield start++;
  }

  public static *repeat<T>(element: T, count: number): Iterable<T> {
    while (count-- > 0) yield element;
  }

  public static *reverse<T>(source: Iterable<T>): Iterable<T> {
    const arr = Array.isArray(source) ? source : [...source];
    for (let i = arr.length - 1; i >= 0; i--) yield arr[i];
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
    const seen = new Set<T>();
    for (const v of source)
      if (!seen.has(v)) {
        seen.add(v);
        yield v;
      }
  }

  public static *union<T>(a: Iterable<T>, b: Iterable<T>, cmp?: IEqualityComparer<T>) {
    if (cmp) {
      const set = hashSet<T>(a, cmp);
      yield* a;
      for (const x of b)
        if (!set.has(x)) {
          set.add(x);
          yield x;
        }
    } else {
      const seen = new Set<T>();
      for (const v of a)
        if (!seen.has(v)) {
          seen.add(v);
          yield v;
        }
      for (const v of b)
        if (!seen.has(v)) {
          seen.add(v);
          yield v;
        }
    }
  }

  public static *intersect<T>(a: Iterable<T>, b: Iterable<T>, cmp?: IEqualityComparer<T>) {
    const set = cmp ? hashSet<T>(b, cmp) : new Set<T>(b);
    for (const v of a) if (set.has(v)) yield v;
  }
  
  public static *except<T>(source: Iterable<T>, other: Iterable<T>, comparer?: IEqualityComparer<T>): Iterable<T> {
    let set: ISet<T>;
    if (comparer) {
      set = hashSet<T>(other, comparer);
    } else {
      set = new Set<T>(other);
    }
    for (const item of source) {
      if (!set.has(item)) yield item;
    }
  }

  public static *concat<T>(source: Iterable<T>, ...args: Iterable<T>[]): Iterable<T> {
    yield* source;
    for (const arg of args) {
      yield* arg;
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
  public static *generateFrom<TState, TOut>(config: {
    initial: TState;
    predicate: Predicate<TState>;
    selector: Selector<TState, TOut>;
    action: (current: TState) => TState;
  }): Iterable<TOut> {
    const { initial, predicate, selector, action } = config;
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

  /**
   * Generates a range, optionally transformed by a selector function.
   * @param count The number of elements to generate.
   * @param getValue A function to transform the index into a value.
   * @returns A generator function that yields the generated values.
   * @example
   * ```typescript
   * const sequence = generate(5, (i) => i * 2);
   * // sequence: 0, 2, 4, 6, 8
   * ```
   */
  public static generator<T = number>(count: number, getValue: (i: number) => T = (i) => i as T): () => Generator<T> {
    return function* () {
      for (let i = 0; i < count; i++) {
        yield getValue(i);
      }
    };
  }

  /**
   * Creates an array from a generator function.
   * @param generator A generator function that yields values.
   * @param getArray A function to transform the generated array into a different type.
   * @returns The transformed array.
   * @example
   * ```typescript
   * const generator = function* () {
   *   yield 1;
   *   yield 2;
   *   yield 3;
   * };
   * const array = arrayFromGenerator(generator, (arr) => arr.map((x) => x * 2));
   * // array: [2, 4, 6]
   * ```
   */
  public static arrayFromGenerator<T, R = T[]>(
    generator: Generator<T>,
    getArray: (array: T[]) => R = (a) => a as R,
  ): R {
    return getArray(Array.from(generator));
  }
}

interface ISet<T> {
  has: (item: T) => boolean;
  values: () => Iterable<T>;
}
