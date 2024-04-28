import { IEnumerable } from "../interfaces/IEnumerable";
import { Grouping } from "..";
import { IGrouping } from "../interfaces/IGrouping";

export interface IGroupingService {
  create<TKey, TValue>(key: TKey, elements: IEnumerable<TValue>): IGrouping<TKey, TValue>;
}

export class GroupingService implements IGroupingService {
  create<TKey, TValue>(key: TKey, elements: IEnumerable<TValue>): IGrouping<TKey, TValue> {
    return Grouping.createGrouping(elements, key);
  }
}
