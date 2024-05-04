import { IEnumerable } from "../interfaces/IEnumerable";
import { Collection, Enumerable, IEnumerableFactory, List } from "..";
import { IList } from "../interfaces/IList";
import { ICollection } from "../interfaces/ICollection";

export class EnumerableService implements Pick<IEnumerableFactory, "create" | "createList" | "createCollection"> {
  create<T>(source: IterableIterator<T>): IEnumerable<T> {
    return Enumerable.from<T>(source);
  }

  createCollection<T>(source: IEnumerable<T>): ICollection<T> {
    return Collection.from<T>(source);
  }

  createList<T>(source: T[]): IList<T> {
    return List.from<T>(source);
  }
}
