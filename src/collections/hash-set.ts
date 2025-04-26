import { EnumerableBase } from "@core/enumerable-base";
import { createList } from "@factories/collection-factory";
import { UniversalEqualityComparer } from "src/util/equality-comparers.ts";
import type { IEqualityComparer } from "@interfaces/IEqualityComparer";
import type { IHashSet } from "@interfaces/IHashSet";
import type { IList } from "@interfaces/IList";
import type { Predicate } from "src/types";

export class HashSet<T> extends EnumerableBase<T> implements IHashSet<T> {
  private map: HashMap<T>;
  private comparer: IEqualityComparer<T>;
  constructor(source: Iterable<T> = [], equalityComparer?: IEqualityComparer<T>) {
    const comparer = equalityComparer ?? new UniversalEqualityComparer<T>();
    const map = new HashMap<T>();
    for (const item of source) {
      map.set(comparer.hash(item), item);
    }
    super(map.values());
    this.map = map;
    this.comparer = comparer;
  }
  toArray(): T[] {
    return [...this.map.values()];
  }
  toList(): IList<T> {
    return createList(this.toArray());
  }
  [Symbol.iterator](): IterableIterator<T> {
    return this.map.values();
  }

  [Symbol.toStringTag]: "HashSet" = "HashSet";

  forEach(callbackfn: (value: T, value2: T, set: HashSet<T>) => void, thisArg?: any): void {
    this.map.forEach((x) => callbackfn(x, x, this), thisArg);
  }

  keys = this.values;

  entries(): IterableIterator<[T, T]> {
    return this.map.getSetEntries();
  }

  values(): IterableIterator<T> {
    return this.map.values();
  }

  get size(): number {
    return this.map.size;
  }

  public override count(predicate?: Predicate<T>): number {
    if (!predicate) return this.size;
    return super.count(predicate);
  }

  add(value: T): this {
    this.map.set(this.comparer.hash(value), value);
    return this;
  }

  clear(): void {
    this.map.clear();
  }

  delete(value: T): boolean {
    return this.map.delete(this.comparer.hash(value));
  }

  has(value: T): boolean {
    return this.map.has(this.comparer.hash(value));
  }

  toString(): string {
    return `HashSet(${this.size}): ${[...this.map.values()].join(", ")}`;
  }

  toMap(): Map<string, T> {
    return this.map;
  }
}

class HashMap<T> extends Map<string, T> {
  public *getSetEntries(): IterableIterator<[T, T]> {
    for (const value of this.values()) {
      yield [value, value];
    }
  }
}
