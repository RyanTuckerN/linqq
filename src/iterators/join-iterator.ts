import { Lookup } from "@collections/lookup";
import { IteratorBase } from "@core/enumerable-base";
import { IEnumerable } from "@interfaces/IEnumerable";
import { IEqualityComparer } from "@interfaces/IEqualityComparer";
import { Selector } from "src/types";
import { UniversalEqualityComparer } from "src/util/equality-comparers.ts";

export class JoinIterator<TOuter, TInner, TKey, TResult> extends IteratorBase<TOuter, TResult> {
  private lookup: Lookup<TKey, TInner> | null = null;
  private outerIter = this.sourceIterator; // alias for clarity
  private innerIdx = 0; // position in current group
  private currentInners: TInner[] | null = null; // cached current group
  private lastOuter: TOuter | null = null; // last outer element

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
    /* build lookup once */
    if (!this.lookup) {
      this.lookup = Lookup.build(this.inner, this.innerKeySelector, (x) => x, this.comparer);
    }

    while (true) {
      /* still iterating current inner group? */
      if (this.currentInners && this.innerIdx < this.currentInners.length) {
        const innerItem = this.currentInners[this.innerIdx++];
        this.current = this.resultSelector(this.lastOuter!, innerItem);
        return true;
      }

      /* fetch next outer element */
      const n = this.outerIter.next();
      if (n.done) return false;

      this.lastOuter = n.value;
      const key = this.outerKeySelector(this.lastOuter);

      /* find matching inner group */
      this.currentInners = this.lookup.getGrouping(key, /* create = */ false) ?? null;
      this.innerIdx = 0;
    }
  }

  public clone(): JoinIterator<TOuter, TInner, TKey, TResult> {
    return new JoinIterator(this.source, this.inner, this.outerKeySelector, this.innerKeySelector, this.resultSelector);
  }
}
