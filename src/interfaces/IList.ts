import { ICollection } from "./ICollection";

export interface IList<T> extends ICollection<T> {
  indexOf(element: T): number;
  insert(index: number, element: T): void;
  removeAt(index: number): void;
  get(index: number): T;
  set(index: number, element: T): void;
  length: number;
}
