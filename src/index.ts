import { IEnumerable } from "@interfaces/IEnumerable";
import { Enumerable } from "@core/enumerable";

/**
 * Why use arrays when you can use linqq?
 * @param source Any iterable source
 * @returns IEnumerable
 */
export default function linqq<T>(source: Iterable<T>): IEnumerable<T> {
  return Enumerable.from<T>(source);
}

export { Enumerable, linqq };
export * from "@interfaces";
