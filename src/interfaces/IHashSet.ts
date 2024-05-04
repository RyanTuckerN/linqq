import { IEnumerable } from ".";

export interface IHashSet<T> extends IEnumerable<T>, Set<T> {}