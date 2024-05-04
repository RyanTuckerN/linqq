import util from "util";
import { IGrouping } from "../../interfaces/IGrouping";
import { EnumerableBase } from "../Enumerable";
import { ICanEnumerate } from "../../types";
export class Grouping<TKey, TValue> extends EnumerableBase<TValue> implements IGrouping<TKey, TValue> {
  public readonly key: TKey;
  public static createGrouping<TKey, TValue>(source: ICanEnumerate<TValue>, key: TKey): IGrouping<TKey, TValue> {
    return new Grouping<TKey, TValue>(source, key);
  }

  constructor(state: ICanEnumerate<TValue>, key: TKey) {
    super(state);
    if (key === undefined || key === null) {
      throw new Error("Grouping key cannot be undefined");
    }
    this.key = key;
  }

  toString(): string {
    return `Grouping: ${this.key}, ${super.toString()}`;
  }

  next: () => IteratorResult<TValue> = () => {
    return this.source[Symbol.iterator]().next();
  };
}
