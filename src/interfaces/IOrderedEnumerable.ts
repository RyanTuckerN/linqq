import { IEnumerable } from "./IEnumerable";

/**
 * Represents an ordered sequence.
 */
export interface IOrderedEnumerable<T> extends IEnumerable<T> {
  /**
   * Performs a subsequent ordering of the elements in a sequence in ascending order according to a key.
   * @param keySelector A function to extract a key from an element.
   * @returns An IOrderedEnumerable<T> whose elements are sorted according to a key.
   */
  thenBy<TKey>(keySelector: (x: T) => TKey): IOrderedEnumerable<T>;
  /**
   * Performs a subsequent ordering of the elements in a sequence in descending order according to a key.
   * @param keySelector A function to extract a key from an element.
   * @returns An IOrderedEnumerable<T> whose elements are sorted in descending order according to a key.
   */
  thenByDescending<TKey>(keySelector: (x: T) => TKey): IOrderedEnumerable<T>;
}
