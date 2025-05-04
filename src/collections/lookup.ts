import { IEqualityComparer } from "@interfaces/IEqualityComparer";

export interface GroupBucket<TKey, T> {
  key: TKey;
  items: T[];
}

export class Lookup<TKey, T> implements Iterable<GroupBucket<TKey, T>> {
  private readonly map = new Map<string, GroupBucket<TKey, T>>(); // hash → bucket

  private constructor(private readonly cmp: IEqualityComparer<TKey>) {}

  private bucketFor(key: TKey): GroupBucket<TKey, T> {
    const h = this.cmp.hash(key); // string hash once
    let bucket = this.map.get(h);

    if (!bucket) {
      // first time we see hash
      bucket = { key, items: [] };
      this.map.set(h, bucket);
      return bucket;
    }
    
    // collision guard: same hash but not equal → throw
    if (!this.cmp.equals(bucket.key, key)) {
      throw new Error("Hash collision with non-equal keys");
    }
    return bucket;
  }

  static build<TKey, TSource, TElement>(
    src: Iterable<TSource>,
    keySel: (v: TSource) => TKey,
    elemSel: (v: TSource) => TElement,
    cmp: IEqualityComparer<TKey>,
  ): Lookup<TKey, TElement> {
    const lookup = new Lookup<TKey, TElement>(cmp);

    for (const v of src) {
      const k = keySel(v);
      lookup.bucketFor(k).items.push(elemSel(v)); // push directly
    }
    return lookup;
  }

  public getGrouping(key: TKey, create: false): T[] | undefined;
  public getGrouping(key: TKey, create: true): T[];
  public getGrouping(key: TKey, create: boolean): T[] | undefined {
    const h = this.cmp.hash(key);
    let bucket = this.map.get(h);

    if (!bucket) {
      if (!create) return undefined; // readonly call
      bucket = { key, items: [] }; // create new
      this.map.set(h, bucket);
      return bucket.items;
    }
    // collision check
    if (!this.cmp.equals(bucket.key, key)) {
      throw new Error("Hash collision with non‑equal keys");
    }
    return bucket.items;
  }

  [Symbol.iterator](): Iterator<GroupBucket<TKey, T>> {
    return this.map.values();
  }
}
