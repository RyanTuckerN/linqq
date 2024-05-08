import { IEnumerable } from "../interfaces/IEnumerable";
import { Enumerable, IEnumerableFactory, List } from "..";
import { IList } from "../interfaces/IList";
export class EnumerableService implements Pick<IEnumerableFactory, "create" | "createList"> {
  create<T>(source: Iterable<T>): IEnumerable<T> {
    return Enumerable.from<T>(source);
  }

  createList<T>(source: T[]): IList<T> {
    return List.from<T>(source);
  }
}
