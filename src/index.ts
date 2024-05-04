import { IEnumerable } from "./interfaces/IEnumerable";
import { ICanEnumerate } from "./types";
import { Enumerable } from "./enumerables/Enumerable";
export * from "./enumerables";
export * from "./types";
export * from "./interfaces";

/**
 * Why use array methods when you can use LINQ?
 */
export default function linq<T>(source: ICanEnumerate<T>): IEnumerable<T> {
  return Enumerable.from<T>(source);
}
