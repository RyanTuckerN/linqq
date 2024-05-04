import { IOrderedEnumerable } from "../interfaces/IOrderedEnumerable";
import { IEnumerableFactory, Sorter } from "../types";
import { IEnumerable, OrderedEnumerable as OrderedEnumerable } from "..";
export class OrderedEnumerableService implements Pick<IEnumerableFactory, "createOrderedEnumerable"> {
  createOrderedEnumerable<T>(source: IEnumerable<T>, sortingExpression: Sorter<T>[]): IOrderedEnumerable<T> {
    return OrderedEnumerable.createOrderedEnumerable(source, sortingExpression);
  }
}
