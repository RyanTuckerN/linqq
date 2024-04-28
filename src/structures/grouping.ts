import { IEnumerable } from "../interfaces/IEnumerable";
import { IGrouping } from "../interfaces/IGrouping";
import { DelegatedEnumerable } from "./delegated-enumerable";
export class Grouping<TKey, TValue> extends DelegatedEnumerable<TValue, IGrouping<TKey, TValue>> implements IGrouping<TKey, TValue> {
  public readonly key: TKey;
  protected createInstance<T>(data: IEnumerable<T>): IGrouping<TKey, T> {
    return new Grouping(data, this.key);
  }

  public toArray() {
    return this.source.toArray();
  }

  public static createGrouping<TKey, TValue>(data: IEnumerable<TValue>, key: TKey): IGrouping<TKey, TValue> {
    return new Grouping(data, key);
  }

  constructor(data: IEnumerable<TValue>, key: TKey) {
    super(data);
    if (key === undefined) {
      throw new Error("Grouping key cannot be undefined");
    }
    this.key = key;
  }
}