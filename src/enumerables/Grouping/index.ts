import { IEnumerable } from "../../interfaces";
import { IGrouping } from "../../interfaces/IGrouping";
import { EnumerableBase } from "../Enumerable";
export class Grouping<TKey, TValue> extends EnumerableBase<TValue> implements IGrouping<TKey, TValue> {
  public readonly key: TKey;
  public static createGrouping<TKey, TValue>(source: Iterable<TValue>, key: TKey): IGrouping<TKey, TValue> {
    return new Grouping<TKey, TValue>(source, key);
  }

  constructor(source: Iterable<TValue>, key: TKey) {
    if (key === undefined || key === null) {
      throw new Error("Grouping key cannot be undefined");
    }
    super(source);
    this.key = key;
  }

  toString(): string {
    return `Grouping: ${this.key}, ${super.toString()}`;
  }

  next: (...args: [] | [undefined]) => IteratorResult<TValue> = () => {
    throw new Error("Method not implemented.");
  };

  protected clone(): IEnumerable<TValue> {
    return Grouping.createGrouping(this.source, this.key);
  }

  // Don't remove this!! It's needed for the iterator to work
  public override *[Symbol.iterator](): IterableIterator<TValue> {
    for (const item of this.source) {
      yield item;
    }
  }

}
