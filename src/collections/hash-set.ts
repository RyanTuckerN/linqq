import { EnumerableBase } from "@core/enumerable-base";
import { createList } from "@factories/collection-factory";
import { UniversalEqualityComparer } from "src/util/equality-comparers.ts";
import type { IEqualityComparer } from "@interfaces/IEqualityComparer";
import type { IHashSet } from "@interfaces/IHashSet";
import type { IList } from "@interfaces/IList";
import type { Predicate } from "src/types";

export class HashSet<T> extends EnumerableBase<T> implements IHashSet<T> {
  private readonly map?: HashMap<T>; // used when a comparer is supplied
  private readonly set?: Set<T>; // used when native equality is OK
  private readonly cmp?: IEqualityComparer<T>;

  constructor(source: Iterable<T> = [], comparer?: IEqualityComparer<T>) {
    let iterable: Iterable<T>,
      cmp: IEqualityComparer<T> | undefined = undefined,
      map: HashMap<T> | undefined = undefined,
      set: Set<T> | undefined = undefined;

    if (comparer) {
      // we have a comparer and must use our own hash map
      cmp = comparer;
      map = new HashMap<T>();
      for (const item of source) map.set(comparer.hash(item), item);
      iterable = map.values();
    } else {
      // no comparer, use native equality/Set, it is faster
      set = new Set<T>(source);
      iterable = set.values();
    }

    super(iterable);
    this.map = map;
    this.set = set;
    this.cmp = cmp;
  }

  [Symbol.toStringTag] = "HashSet" as const;
  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }
  keys = this.values;

  *values(): IterableIterator<T> {
    if (this.set) yield* this.set.values();
    else if (this.map) yield* this.map.values();
  }

  *entries(): IterableIterator<[T, T]> {
    for (const v of this.values()) yield [v, v];
  }

  forEach(cb: (v: T, v2: T, s: HashSet<T>) => void, thisArg?: unknown): void {
    for (const v of this.values()) cb.call(thisArg, v, v, this);
  }

  get size(): number {
    return this.set ? this.set.size : this.map!.size;
  }

  override count(pred?: Predicate<T>): number {
    if (!pred) return this.size;
    return super.count(pred);
  }

  toArray(): T[] {
    return [...this.values()];
  }
  toList(): IList<T> {
    return createList(this.toArray());
  }

  toMap(): Map<string, T> {
    // eq comparer was passed
    if (this.map) return new Map(this.map); // shallow copy

    // no eq comparer was passed
    const comparer = new UniversalEqualityComparer<T>();
    const m = new Map<string, T>();
    for (const v of this.set!) m.set(comparer.hash(v), v);
    return m;
  }

  add(value: T): this {
    if (this.set) this.set.add(value);
    else {
      const h = this.cmp!.hash(value);
      this.map!.set(h, value);
    }
    return this;
  }

  clear(): void {
    this.set ? this.set.clear() : this.map!.clear();
  }

  delete(value: T): boolean {
    return this.set ? this.set.delete(value) : this.map!.delete(this.cmp!.hash(value));
  }

  has(value: T): boolean {
    return this.set ? this.set.has(value) : this.map!.has(this.cmp!.hash(value));
  }

  toString(): string {
    return `HashSet(${this.size}): ${this.toArray().join(", ")}`;
  }
}

class HashMap<T> extends Map<string, T> {
  public *getSetEntries(): IterableIterator<[T, T]> {
    for (const v of this.values()) yield [v, v];
  }
}
