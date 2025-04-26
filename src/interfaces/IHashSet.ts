import { IEnumerable } from ".";

/**
 * Represents a special type of Set that is used to store unique values.
 * This differs from a normal js Set in that it allows for the use of a custom equality comparer.
 */
export interface IHashSet<T> extends IEnumerable<T> {
  /**
   * Convert the HashSet to a Map.
   */
  readonly size: number;
  toMap(): Map<string, T>;
  add(value: T): this;
  clear(): void;
  delete(value: T): boolean;
  has(value: T): boolean;
  entries(): IterableIterator<[T, T]>;
  forEach(callbackfn: (value: T, value2: T, set: IHashSet<T>) => void, thisArg?: any): void;
  keys(): IterableIterator<T>;
  values(): IterableIterator<T>;
  [Symbol.iterator](): IterableIterator<T>;
  [Symbol.toStringTag]: "HashSet";
}
