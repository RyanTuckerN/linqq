import { IHashSet, IEqualityComparer } from "../../interfaces";
import { UniversalEqualityComparer } from "../../util/equality-comparers.ts";
import { State } from "../Enumerable/enumerable-base";

export class HashSet<T> implements Set<T> {
  private _map: HashMap<T>;
  private _comparer: IEqualityComparer<T>;
  constructor(source: Iterable<T> = [], equalityComparer?: IEqualityComparer<T>) {
    const comparer = equalityComparer || new UniversalEqualityComparer<T>();
    const map = new HashMap<T>();
    for (const item of source) {
      map.set(comparer.hash(item), item);
    }
    this._map = map;
    this._comparer = comparer;
  }
  [Symbol.iterator](): IterableIterator<T> {
    return this._map.values();
  }
  [Symbol.toStringTag]: "HashSet" = "HashSet";
  forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
    this._map.forEach((x) => callbackfn(x, x, this), thisArg);
  }
  keys = this.values;
  entries(): IterableIterator<[T, T]> {
    return this._map.getSetEntries();
  }

  values(): IterableIterator<T> {
    return this._map.values();
  }

  get size(): number {
    return this._map.size;
  }

  add(value: T): this {
    this._map.set(this._comparer.hash(value), value);
    return this;
  }

  clear(): void {
    this._map.clear();
  }

  delete(value: T): boolean {
    return this._map.delete(this._comparer.hash(value));
  }

  has(value: T): boolean {
    return this._map.has(this._comparer.hash(value));
  }

  toString(): string {
    return `HashSet(${this.size}): ${[...this._map.values()].join(", ")}`;
  }
  toMap(): Map<string, T> {
    return this._map;
  }
}

class HashMap<T> extends Map<string, T>{
  public getSetEntries(): IterableIterator<[T, T]> {
    return [...this.entries()].map(([key, value]) => [value, value] as [T,T])[Symbol.iterator]();
  }
}