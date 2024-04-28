import { IEnumerable } from "../interfaces/IEnumerable";
import { Enumerable, ICanEnumerate } from "..";

export interface IEnumerableService {
  create<T>(data: ICanEnumerate<T>): IEnumerable<T>;
}

export class EnumerableService implements IEnumerableService {
  create<T>(data: ICanEnumerate<T>): IEnumerable<T> {
    return Enumerable.from(data);
  }
}
