import { IEnumerable } from "../interfaces/IEnumerable";
import { EqualityComparer } from "../types";
import { LinqUtils as Utils } from "../util";

export class HashSet<T> implements Set<T> {
  private _items: T[] = [];
  private _comparer: EqualityComparer<T>; // we'll use a simple callback comparer instead of a true EqualityComparer, which would require reflection

  constructor(data: T[] = [], equalityComparer?: EqualityComparer<T>) {
    this._comparer = equalityComparer || Utils.defaultEqualityComparer;
    data.forEach((item) => this.add(item));
  }

  keys = this.values;

  values(): IterableIterator<T> {
    return this._items[Symbol.iterator]();
  }

  get size(): number {
    return this._items.length;
  }

  add(value: T): this {
    if (!this.has(value)) {
      this._items.push(value);
    }
    return this;
  }

  clear(): void {
    this._items = [];
  }

  delete(value: T): boolean {
    const index = this._items.findIndex((item) => this._comparer(value, item));
    if (index !== -1) {
      this._items.splice(index, 1);
      return true;
    }
    return false;
  }

  forEach(callbackfn: (value: T, value2: T, set: HashSet<T>) => void, thisArg?: any): void {
    this._items.forEach((value) => {
      callbackfn.call(thisArg, value, value, this);
    });
  }

  has(value: T): boolean {
    return this._items.some((item) => this._comparer(value, item));
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this._items[Symbol.iterator]();
  }

  entries(): IterableIterator<[T, T]> {
    return this._items.map((item) => [item, item] as [T, T])[Symbol.iterator]();
  }

  [Symbol.toStringTag]: "HashSet" = "HashSet";

  toString() {
    return `HashSet(${this.size}): ${this._items.join(", ")}`;
  }
}
