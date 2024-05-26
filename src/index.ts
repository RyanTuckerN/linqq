import { IEnumerable, IList } from "./interfaces";
import { Enumerable } from "./enumerables";
export * from "./enumerables";
export * from "./types";
export * from "./interfaces";

/**
 * Why use array methods when you can use LINQ?
 */
export default function linqq<T = any>(source: T[]): IList<T>;
export default function linqq<T = any>(source: Iterable<T>): IEnumerable<T>;
export default function linqq<T = any>(source: Iterable<T>): IEnumerable<T> | IList<T> {
  return Enumerable.from<T>(source);
}

export { linqq };
/**
 * Create a new Enumerable within the specified range.
 * @param start The start of the range.
 * @param count The number of elements in the range.
 * @returns A new Enumerable within the specified range.
 */
export const range = Enumerable.range;

/**
 * Generate a new Enumerable from a given element with the specified count.
 * @param element The element to repeat.
 * @param count The number of times to repeat the element.
  * @returns A new Enumerable from a given element with the specified count.
 */
export const repeat = Enumerable.repeat;

/**
 * Create an empty Enumerable.
 * @returns An empty Enumerable.
 */
export const empty = Enumerable.empty;

/**
 * Create an Enumerable from a given iterable. This is the same as calling `linqq(iterable)`.
 * @param iterable The iterable to create an Enumerable from.
 * @returns An Enumerable from the given iterable.
 */
export const from = Enumerable.from;

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
export const generate = Enumerable.generateFrom;