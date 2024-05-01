import { IEnumerable } from ".";

export interface IHashSet<T, TOut = T> extends IEnumerable<T>, Set<T> {}