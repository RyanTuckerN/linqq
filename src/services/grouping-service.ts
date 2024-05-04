import { Grouping, ICanEnumerate, IEnumerableFactory } from "../";
import { IGrouping } from "../interfaces/IGrouping";

export class GroupingService implements Pick<IEnumerableFactory, 'createGrouping'> {
  createGrouping<TKey, TValue>(key: TKey, source: ICanEnumerate<TValue>): IGrouping<TKey, TValue> {
    return Grouping.createGrouping(source, key);
  }
}
