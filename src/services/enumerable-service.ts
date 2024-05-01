import { IEnumerable } from "../interfaces/IEnumerable";
import { Enumerable, ICanEnumerate, IEnumerableFactory, State } from "..";

export class EnumerableService implements Pick<IEnumerableFactory, 'create'> {
  create<T, TOut = T>(state: State): IEnumerable<TOut> {
    return Enumerable.createFromState<TOut>(state);
  }
}
