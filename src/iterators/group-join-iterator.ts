import { Lookup } from "@collections/lookup";
import { EnumerableBase, IteratorBase } from "@core/enumerable-base";
import { IEnumerable } from "@interfaces/IEnumerable";
import { IEqualityComparer } from "@interfaces/IEqualityComparer";
import { Selector } from "src/types";
import { UniversalEqualityComparer } from "src/util/equality-comparers.ts";

export class GroupJoinIterator<TOuter, TInner, TKey, TResult> extends IteratorBase<TOuter, TResult> {
  private lookup: Lookup<TKey, TInner> | null = null; // built on first use

  constructor(
    source: Iterable<TOuter>,
    private inner: IEnumerable<TInner>,
    private outerKeySelector: Selector<TOuter, TKey>,
    private innerKeySelector: Selector<TInner, TKey>,
    private resultSelector: (outer: TOuter, inner: IEnumerable<TInner>) => TResult,
    private comparer: IEqualityComparer<TKey> = new UniversalEqualityComparer<TKey>(),
  ) {
    super(source);
  }

  public moveNext(): boolean {
    this.lookup ??= Lookup.build(this.inner, this.innerKeySelector, (x) => x, this.comparer);

    let outer; // iterator result cache
    while (!(outer = this.sourceIterator.next()).done) {
      const key = this.outerKeySelector(outer.value); // compute outer key
      const group = this.lookup.getGrouping(key, false) ?? []; // fetch matching inners
      this.current = this.resultSelector(
        // create TResult
        outer.value,
        EnumerableBase.from(group), // wrap array lazily
      );
      return true; // emit one result per outer
    }
    return false; // no more outers
  }

  public clone(): GroupJoinIterator<TOuter, TInner, TKey, TResult> {
    // same parameters, comparer forwarded
    return new GroupJoinIterator(
      this.source,
      this.inner,
      this.outerKeySelector,
      this.innerKeySelector,
      this.resultSelector,
      this.comparer,
    );
  }
}
