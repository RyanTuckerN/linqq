import { KeyedArray, Lookup } from "@collections/lookup";
import { EnumerableBase, IteratorBase } from "@core/enumerable-base";
import { IEqualityComparer } from "@interfaces/IEqualityComparer";
import { IGrouping } from "@interfaces/IGrouping";
import { Selector } from "src/types";
import { UniversalEqualityComparer } from "src/util/equality-comparers.ts";
import { Exception } from "src/validator/exception";

export class GroupingIterator<TKey, TSource, TNext = TSource> extends IteratorBase<TSource, IGrouping<TKey, TNext>> {
  private lookup?: Lookup<TKey, TSource>;
  private lookupIterator?: Iterator<KeyedArray<TKey, TSource>>;
  constructor(
    source: Iterable<TSource>,
    private keySelector: Selector<TSource, TKey>,
    private elementSelector?: Selector<TSource, TNext>,
    private comparer: IEqualityComparer<TKey> = new UniversalEqualityComparer<TKey>(),
  ) {
    super(source);
  }

  public moveNext(): boolean {
    this.lookup ??= Lookup.create(this.source, this.keySelector, (x) => x, this.comparer);
    this.lookupIterator ??= this.lookup[Symbol.iterator]();

    let result;
    while (!(result = this.lookupIterator.next()).done) {
      const key = result.value.key;
      const grouping = result.value;
      this.current = Grouping.createGrouping<TKey, TNext>(
        (this.elementSelector ? grouping.map(this.elementSelector) : grouping) as TNext[],
        key,
      );
      return true;
    }
    return false;
  }

  public clone(): GroupingIterator<TKey, TSource, TNext> {
    return new GroupingIterator(this.source, this.keySelector, this.elementSelector, this.comparer);
  }
}

class Grouping<TKey, TValue> extends EnumerableBase<TValue> implements IGrouping<TKey, TValue> {
  public static createGrouping<TKey, TValue>(source: Iterable<TValue>, key: TKey): IGrouping<TKey, TValue> {
    return new Grouping<TKey, TValue>(source, key);
  }

  constructor(
    protected source: Iterable<TValue>,
    public readonly key: TKey,
  ) {
    if (key === undefined || key === null) throw Exception.argumentNull("key");
    super(source);
    this.key = key;
  }

  toString(): string {
    return `Grouping: ${this.key}, ${super.toString()}`;
  }
}
