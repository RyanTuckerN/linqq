import { Lookup } from "@collections/lookup";
import { IteratorBase } from "@core/enumerable-base";
import { IEnumerable } from "@interfaces/IEnumerable";
import { IEqualityComparer } from "@interfaces/IEqualityComparer";
import { Selector } from "src/types";
import { UniversalEqualityComparer } from "src/util/equality-comparers.ts";

export class JoinIterator<TOuter, TInner, TKey, TResult> extends IteratorBase<TOuter, TResult> {
  private lookup: Lookup<TKey, TInner> | null = null;
  private outerIter = this.sourceIterator;
  private innerIdx = 0;
  private currentInners: TInner[] | null = null;
  private lastOuter: TOuter | null = null;

  constructor(
    source: Iterable<TOuter>,
    private inner: IEnumerable<TInner>,
    private outerKeySelector: Selector<TOuter, TKey>,
    private innerKeySelector: Selector<TInner, TKey>,
    private resultSelector: (outer: TOuter, inner: TInner) => TResult,
    private comparer: IEqualityComparer<TKey> = new UniversalEqualityComparer<TKey>(),
  ) {
    super(source);
  }
  public moveNext(): boolean {
    if (!this.lookup) {
      this.lookup = Lookup.build(this.inner, this.innerKeySelector, (x) => x, this.comparer);
    }

    while (true) {
      if (this.currentInners && this.innerIdx < this.currentInners.length) {
        const innerItem = this.currentInners[this.innerIdx++];
        this.current = this.resultSelector(this.lastOuter!, innerItem);
        return true;
      }

      const n = this.outerIter.next();
      if (n.done) return false;

      this.lastOuter = n.value;
      const key = this.outerKeySelector(this.lastOuter);

      this.currentInners = this.lookup.getGrouping(key, /* create = */ false) ?? null;
      this.innerIdx = 0;
    }
  }

  public clone(): JoinIterator<TOuter, TInner, TKey, TResult> {
    return new JoinIterator(this.source, this.inner, this.outerKeySelector, this.innerKeySelector, this.resultSelector);
  }
}
