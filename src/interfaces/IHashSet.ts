import { IEnumerable } from ".";

/**
 * Represents a special type of Set that is used to store unique values.
 * This differs from a normal Set in that it uses a hash function to determine uniqueness.
 * A custom equality comparer can be used to determine uniqueness.
 */
export interface IHashSet<T> extends Set<T>, IEnumerable<T> {
  /**
   * Convert the HashSet to a Map. 
   */
  toMap(): Map<string, T>;
}
