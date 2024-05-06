import { IHashSet, IEqualityComparer, ICollection, IDictionary, IEnumerable, IGrouping, IList, IOrderedEnumerable } from "../../interfaces";
import { Predicate, NumericSelector, SelectorWithIndex, Comparable, Selector, Orderable, PredicateWithIndex } from "../../types";
import { UniversalEqualityComparer } from "../../util/equality-comparers.ts";
import { EnumerableBase, List } from "../Enumerable";


export class HashSet<T> implements IHashSet<T>{
  private map: HashMap<T>;
  private comparer: IEqualityComparer<T>;
  constructor(source: Iterable<T> = [], equalityComparer?: IEqualityComparer<T>) {
    const comparer = equalityComparer || new UniversalEqualityComparer<T>();
    const map = new HashMap<T>();
    for (const item of source) {
      map.set(comparer.hash(item), item);
    }
    this.map = map;
    this.comparer = comparer;
  }
  toArray(): T[] {
    return [...this.map.values()];
  }
  toList(): IList<T> {
    return List.from(this.toArray());
  }
  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.map.values();
  }
  [Symbol.toStringTag]: "HashSet" = "HashSet";
  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
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

  next(): IteratorResult<T> {
    return this.map.values().next();
  }
}

class HashMap<T> extends Map<string, T> {
  public getSetEntries(): IterableIterator<[T, T]> {
    return [...this.entries()].map(([_, value]) => [value, value] as [T, T])[Symbol.iterator]();
  }
}
