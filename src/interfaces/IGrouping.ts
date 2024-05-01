import { IEnumerable } from "./IEnumerable";

export interface IGrouping<TKey, TElement> extends IEnumerable<TElement> {
  readonly key: TKey;
}
