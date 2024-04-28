import { IOrderedEnumerable } from "../interfaces/IOrderedEnumerable";
import { IEnumerable } from "../interfaces/IEnumerable";
import { Sorter } from "../types";
import { OrderedEnumerable } from "..";

export interface IOrderedEnumerableService {
  createOrderedEnumerable<T>(source: IEnumerable<T>, sortingExpression: Sorter<T>[]): IOrderedEnumerable<T>;
}

export class OrderedEnumerableService implements IOrderedEnumerableService {
  constructor(){
    console.log("constructing OrderedEnumerableService")
  }
  createOrderedEnumerable<T>(source: IEnumerable<T>, sortingExpression: Sorter<T>[]): IOrderedEnumerable<T> {
    return OrderedEnumerable.createOrderedEnumerable(source, sortingExpression);
  }
}
