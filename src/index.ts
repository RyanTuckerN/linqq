import type { IEnumerable } from "@interfaces/IEnumerable";
import { Enumerable } from "@core/enumerable";
import { Sort } from "./operations/sort";
import { GeneratorUtils } from "./operations/generator";
const { generator, arrayFromGenerator } = GeneratorUtils;

/**
 * Why use arrays when you can use linqq?
 * @param source Any iterable source
 * @returns IEnumerable
 */
export default function linqq<T>(source: Iterable<T>): IEnumerable<T> {
  return Enumerable.from<T>(source);
}

linqq.range = Enumerable.range;
linqq.repeat = Enumerable.repeat;
linqq.empty = Enumerable.empty;
linqq.from = Enumerable.from;
linqq.generate = Enumerable.generate;

export { linqq, Enumerable, Sort, generator, arrayFromGenerator };

export type * from "@interfaces";
