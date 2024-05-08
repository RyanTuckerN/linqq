import { IEnumerable } from ".";

export interface IList<T> extends IEnumerable<T> {
  indexOf(element: T): number;
  insert(index: number, element: T): void;
  removeAt(index: number): void;
  get(index: number): T;
  set(index: number, element: T): void;
  isEmpty(): boolean;
  add(element: T): boolean;
  remove(element: T): boolean;
  clear(): void;
  length: number;
}
