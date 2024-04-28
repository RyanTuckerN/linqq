import { IEnumerable } from "./IEnumerable";
import { Orderable } from "../types";

export interface IOrderedEnumerable<T> extends IEnumerable<T> {
  thenBy<TKey extends Orderable>(keySelector: (x: T) => TKey): IOrderedEnumerable<T>;
  thenByDescending<TKey extends Orderable>(keySelector: (x: T) => TKey): IOrderedEnumerable<T>;
}
