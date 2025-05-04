import { Lookup, GroupBucket } from "@collections/lookup";
import { EnumerableBase, IteratorBase } from "@core/enumerable-base";
import { IEqualityComparer } from "@interfaces/IEqualityComparer";
import { IGrouping } from "@interfaces/IGrouping";
import { GroupByEqualityComparer } from "src/util/equality-comparers.ts";

export class GroupingIterator<TKey, TSource, TNext = TSource> extends IteratorBase<TSource, IGrouping<TKey, TNext>> {
  private iterator: Iterator<GroupBucket<TKey, TNext>> | null = null;

  constructor(
    src: Iterable<TSource>,
    private readonly keySel: (x: TSource) => TKey,
    private readonly elemSel: (x: TSource) => TNext = (x) => x as TNext & TSource,
    private readonly cmp: IEqualityComparer<TKey> = new GroupByEqualityComparer<TKey>(),
  ) {
    super(src);
  }

  moveNext(): boolean {
    if (!this.iterator) {
      const lookup = Lookup.build(this.source, this.keySel, this.elemSel, this.cmp);
      this.iterator = lookup[Symbol.iterator]();
    }
    const n = this.iterator.next();
    if (n.done) return false;

    this.current = new Grouping(n.value.key, n.value.items);
    return true;
  }
  clone() {
    return this.constructor(this.source, this.keySel, this.elemSel, this.cmp);
  }
}

class Grouping<TKey, TValue> extends EnumerableBase<TValue> implements IGrouping<TKey, TValue> {
  constructor(
    readonly key: TKey,
    src: TValue[],
  ) {
    super(src);
  }

  toArray(): TValue[] {
    return this.source as TValue[];
  }
}
