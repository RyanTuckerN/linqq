import { IEnumerable } from ".";

export interface ICollection<T> extends IEnumerable<T> {
  isEmpty(): boolean;
  add(element: T): boolean;
  remove(element: T): boolean;
  clear(): void;
}
