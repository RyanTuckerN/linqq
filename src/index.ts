import { IEnumerable } from "./interfaces/IEnumerable";
import { Enumerable } from "./structures";
export * from "./structures";
export * from "./types";
export * from "./interfaces";

/**
 * Why use array methods when you can use LINQ?
 */
export default function linq<T>(array: T[]): IEnumerable<T> {
  return Enumerable.create(array);
}
