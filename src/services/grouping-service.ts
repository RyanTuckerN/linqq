import { Grouping, IEnumerableFactory, State } from "..";
import { IGrouping } from "../interfaces/IGrouping";

export class GroupingService implements Pick<IEnumerableFactory, 'createGrouping'> {
  createGrouping<TKey, TValue>(key: TKey, state: State): IGrouping<TKey, TValue> {
    return Grouping.createGrouping(state, key);
  }
}
