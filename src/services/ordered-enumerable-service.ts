import { IOrderedEnumerable } from "../interfaces/IOrderedEnumerable";
import { IEnumerable } from "../interfaces/IEnumerable";
import { Sorter } from "../types";
import { OrderedEnumerable } from "..";

export interface IOrderedEnumerableService {
  create<T>(source: IEnumerable<T>, sortingExpression: Sorter<T>[]): IOrderedEnumerable<T>;
}

export class OrderedEnumerableService implements IOrderedEnumerableService {
  create<T>(source: IEnumerable<T>, sortingExpression: Sorter<T>[]): IOrderedEnumerable<T> {
    return OrderedEnumerable.createOrderedEnumerable(source, sortingExpression);
  }
}
