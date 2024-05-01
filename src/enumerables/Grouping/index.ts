import util from "util";
import { IGrouping } from "../../interfaces/IGrouping";
import { EnumerableBase, State } from "../Enumerable/enumerable-base";
export class Grouping<TKey, TValue> extends EnumerableBase<TValue> implements IGrouping<TKey, TValue> {
  public readonly key: TKey;
  public static createGrouping<TKey, TValue>(state: State, key: TKey): IGrouping<TKey, TValue> {
    return new Grouping<TKey, TValue>(state, key);
  }

  constructor(state: State, key: TKey) {
    super(state);
    if (key === undefined) {
      throw new Error("Grouping key cannot be undefined");
    }
    this.key = key;
  }

  toString(): string {
    return `Grouping: ${this.key}, ${super.toString()}`;
  }
}
