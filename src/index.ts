import { IEnumerable } from "./interfaces/IEnumerable";
import { Enumerable } from "./enumerables";
import { IList } from "./interfaces";
export * from "./enumerables";
export * from "./types";
export * from "./interfaces";

/**
 * Why use array methods when you can use LINQ?
 */
function linq<T = any>(source: T[]): IList<T>;
function linq<T = any>(source: Iterable<T>): IEnumerable<T>;
function linq<T = any>(source: Iterable<T>): IEnumerable<T> | IList<T> {
  return Enumerable.from<T>(source);
}

linq.range = Enumerable.range;
linq.repeat = Enumerable.repeat;
linq.empty = Enumerable.empty;
linq.from = Enumerable.from;

export default linq;
