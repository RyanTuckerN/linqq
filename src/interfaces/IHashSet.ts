import { IEnumerable } from ".";

export interface IHashSet<T> extends Set<T>, IEnumerable<T> {
  toMap(): Map<string, T>;
}
