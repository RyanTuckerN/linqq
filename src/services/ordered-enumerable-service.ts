import { IOrderedEnumerable } from "../interfaces/IOrderedEnumerable";
import { IEnumerableFactory, Sorter } from "../types";
import { OrderedEnumerable as OrderedEnumerable, State } from "..";

export class OrderedEnumerableService implements Pick<IEnumerableFactory, "createOrderedEnumerable"> {
  createOrderedEnumerable<T, TOut = T>(
    state: State,
    sortingExpression: Sorter<TOut>[],
  ): IOrderedEnumerable<TOut> {
    return OrderedEnumerable.createOrderedEnumerable(state, sortingExpression);
  }
}
