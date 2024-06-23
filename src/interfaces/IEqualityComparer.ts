/**
 * Represents a structure that can compare objects for equality.
 */
export interface IEqualityComparer<T> {
  /**
   * Determines whether the specified objects are equal.
   * @param x The first object of type T to compare.
   * @param y The second object of type T to compare.
   * @returns true if the specified objects are equal; otherwise, false.
   */
  equals(x: T, y: T): boolean;
  /**
   * Returns a hash code for the specified object.
   * @param obj The object for which a hash code is to be returned.
   * @returns A hash code for the specified object.
   * */
  hash(obj: T): string;
}
