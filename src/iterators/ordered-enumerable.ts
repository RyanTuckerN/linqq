import { IteratorBase } from "@core/enumerable-base";
import { IOrderedEnumerable } from "@interfaces/IOrderedEnumerable";
import { Sorter } from "src/types";
import { Sort } from "src/operations/sort";
import { createList } from "@factories/collection-factory";
import { IList } from "@interfaces/IList";

export class OrderedEnumerable<T> extends IteratorBase<T> implements IOrderedEnumerable<T> {
  private index = 0;
  private sorted: T[] | null = null;

  constructor(
    source: Iterable<T>,
    private criteria: Sorter<T, any>[],
  ) {
    super(source);
  }

  thenBy<TKey>(selector: (x: T) => TKey): this {
    this.criteria = [...this.criteria, { selector, descending: false }];
    return this;
  }
  thenByDescending<TKey>(selector: (x: T) => TKey): this {
    this.criteria = [...this.criteria, { selector, descending: true }];
    return this;
  }

  public override toArray(): T[] {
    if (!this.sorted) this.sort();
    return this.sorted!;
  }

  public override toList(): IList<T> {
    if (!this.sorted) this.sort();
    return createList(this.sorted!);
  }

  public clone(): IteratorBase<T, T> {
    return new OrderedEnumerable(this.source, [...this.criteria]);
  }

  public moveNext(): boolean {
    if (!this.sorted) this.sort();
    if (this.index < this.sorted!.length) {
      this.current = this.sorted![this.index++];
      return true;
    }
    return false;
  }

  private sort(): void {
    const src = Array.isArray(this.source) ? this.source : Array.from(this.source);
    const n = src.length;
    const k = this.criteria.length;

    if (k === 1) {
      const { selector, descending } = this.criteria[0];

      // small‑N → native sort (cheapest)
      if (n < 2_048) {
        this.sorted = [...src].sort((a, b) => {
          const ka = selector(a);
          const kb = selector(b);
          return ka < kb ? -1 : ka > kb ? 1 : 0;
        });
        if (descending) this.sorted.reverse();
        return;
      }

      // unsigned ints, fast path
      const keys32 = new Uint32Array(n);
      let isUInt32 = true;
      for (let i = 0; i < n; i++) {
        const v = selector(src[i]);
        if (typeof v !== "number" || v >>> 0 !== v) {
          isUInt32 = false;
          break;
        }
        keys32[i] = v;
      }
      if (isUInt32) {
        const idx = new Array<number>(n);
        for (let i = 0; i < n; i++) idx[i] = i;
        Sort.radixSortIdx(keys32, idx);
        this.sorted = idx.map((i) => src[i]);
        if (descending) this.sorted.reverse();
        return;
      }

      // Date epoch‑ms, fast path (hi+lo, radix twice with bit shifts)
      const lo = new Uint32Array(n);
      let hi: Uint32Array | null = null;
      let isDate = true;
      for (let i = 0; i < n; i++) {
        const d = selector(src[i]);
        if (!(d instanceof Date)) {
          isDate = false;
          break;
        }
        const t = d.getTime();
        lo[i] = t & 0xffff_ffff;
        const h = t / 0x1_0000_0000;
        if (h > 0xffff_ffff) {
          isDate = false;
          break;
        }
        if (!hi) hi = new Uint32Array(n);
        hi[i] = (t / 0x1_0000_0000) >>> 0;
      }
      if (isDate) {
        const idx = new Array<number>(n);
        for (let i = 0; i < n; i++) idx[i] = i;
        Sort.radixSortIdx(lo, idx);
        Sort.radixSortIdx(hi!, idx);
        this.sorted = idx.map((i) => src[i]);
        if (descending) this.sorted.reverse();
        return;
      }

      // fallback single‑key (pre‑computed keys)
      const keys = src.map(selector);
      const idx = new Array<number>(n);
      for (let i = 0; i < n; i++) idx[i] = i;
      idx.sort((i, j) => (keys[i] < keys[j] ? -1 : keys[i] > keys[j] ? 1 : 0));
      if (descending) idx.reverse();
      this.sorted = idx.map((i) => src[i]);
      return;
    }

    // multi‑key path
    const keyCols: any[][] = Array.from({ length: k }, () => new Array(n));
    for (let c = 0; c < k; c++) {
      const sel = this.criteria[c].selector;
      for (let i = 0; i < n; i++) keyCols[c][i] = sel(src[i]);
    }
    const dir = this.criteria.map((c) => (c.descending ? -1 : 1));
    const idx = new Array<number>(n);
    for (let i = 0; i < n; i++) idx[i] = i;

    idx.sort((a, b) => {
      for (let c = 0; c < k; c++) {
        const diff = keyCols[c][a] < keyCols[c][b] ? -1 : keyCols[c][a] > keyCols[c][b] ? 1 : 0;
        if (diff) return dir[c] * diff;
      }
      return 0;
    });
    this.sorted = idx.map((i) => src[i]);
  }
}
