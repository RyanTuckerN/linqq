import type { IEnumerable } from "@interfaces";
import { createList } from "@factories/collection-factory";
import { EnumerableBase } from "./enumerable-base";

/**
 * Represents a collection of elements - the main structure of the `linqq` library.
 * All other classes and methods are built around this class.
 * Elements can be accessed by index, and the collection can be iterated over, just like an array.
 * The power of the Enumerable class, however, lies in the methods it provides for querying and manipulating the elements.
 * Operations like `where`, `select`, `groupBy`, `orderBy`, `join`, and many more are available to transform and filter the elements in the collection.
 * @typeparam T The type of elements in the collection.
 */
export class Enumerable<T> extends EnumerableBase<T> implements IEnumerable<T> {
  /**
   * Create an Enumerable from a given iterable. This is the same as calling `linqq(iterable)`.
   * @param iterable The iterable to create an Enumerable from.
   * @returns An Enumerable from the given iterable.
   * @example
   * ```typescript
   * const arrSequence = Enumerable.from([1, 2, 3]).toList(); // List { 1, 2, 3 }
   * const strSequence = Enumerable.from("hello").toList(); // List { "h", "e", "l", "l", "o" }
   * const mapSequence = Enumerable.from(new Map([["a", 1], ["b", 2]])).toList(); // List { ["a", 1], ["b", 2] }
   * const setSequence = Enumerable.from(new Set([1, 2, 3])).toList(); // List { 1, 2, 3 }
   * const linqqSequence = Enumerable.from(arrSequence).toList(); // List { 1, 2, 3 }
   * function *generator() { yield 1; yield 2; yield 3; }
   * const genSequence = Enumerable.from(generator()).toList(); // List { 1, 2, 3 }
   * ```
   */
  public static from<T>(source: Iterable<T>): IEnumerable<T> {
    if (typeof source === "string" || Array.isArray(source)) return createList(source);
    if (source instanceof Enumerable) return source;
    return new Enumerable<T>(source);
  }
}
