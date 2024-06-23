import { IEnumerable } from "./interfaces";
import { Enumerable } from "./enumerables";

/**
 * Why use arrays when you can use linqq?
 * @param source Any iterable source
 * @returns IEnumerable
 */
export default function linqq<T>(source: Iterable<T>): IEnumerable<T> {
  return Enumerable.from<T>(source);
}

export { Enumerable, linqq };
export * from "./types";
export * from "./interfaces";
