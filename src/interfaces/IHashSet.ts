import { IEnumerable } from ".";

/**
 * Represents a special type of Set that is used to store unique values.
 * This differs from a normal Set in that it allows for the use of a custom equality comparer.
 */
export interface IHashSet<T> extends Set<T>, IEnumerable<T> {
  /**
   * Convert the HashSet to a Map. 
   */
  toMap(): Map<string, T>;
}
