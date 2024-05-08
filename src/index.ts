import { IEnumerable } from "./interfaces/IEnumerable";
import { Enumerable } from "./enumerables";
export * from "./enumerables";
export * from "./types";
export * from "./interfaces";

/**
 * Why use array methods when you can use LINQ?
 */
function linq<T>(source: Iterable<T>): IEnumerable<T> {
  return Enumerable.from<T>(source);
}
linq.range = Enumerable.range;
linq.repeat = Enumerable.repeat;
linq.empty = Enumerable.empty;
linq.from = Enumerable.from;

export default linq;
