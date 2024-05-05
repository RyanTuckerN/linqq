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
  cast<TOut>(): IEnumerable<TOut> {
    throw new Error("Method not implemented.");
  }
  ensureList(): IList<T> {
    throw new Error("Method not implemented.");
  }
  ensureCollection(): ICollection<T> {
    throw new Error("Method not implemented.");
  }
  toCollection(): ICollection<T> {
    throw new Error("Method not implemented.");
  }
  count(predicate?: Predicate<T> | undefined): number {
    throw new Error("Method not implemented.");
  }
  sum(selector?: NumericSelector<T> | undefined): number;
  sum(selector: NumericSelector<T>): number;
  sum(selector?: unknown): number {
    throw new Error("Method not implemented.");
  }
  average(selector?: NumericSelector<T> | undefined): number;
  average(selector: NumericSelector<T>): number;
  average(selector?: unknown): number {
    throw new Error("Method not implemented.");
  }
  elementAt(index: number): T {
    throw new Error("Method not implemented.");
  }
  elementAtOrDefault(index: number): T | undefined {
    throw new Error("Method not implemented.");
  }
  first(predicate?: Predicate<T> | undefined): T {
    throw new Error("Method not implemented.");
  }
  firstOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    throw new Error("Method not implemented.");
  }
  last(predicate?: Predicate<T> | undefined): T {
    throw new Error("Method not implemented.");
  }
  lastOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    throw new Error("Method not implemented.");
  }
  single(predicate?: Predicate<T> | undefined): T {
    throw new Error("Method not implemented.");
  }
  singleOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    throw new Error("Method not implemented.");
  }
  append(element: T): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  reverse(): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  where(predicate: Predicate<T>): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  select<TOut>(selector: SelectorWithIndex<T, TOut>): IEnumerable<TOut> {
    throw new Error("Method not implemented.");
  }
  selectMany<TOut>(selector: SelectorWithIndex<T, Iterable<TOut>>): IEnumerable<TOut> {
    throw new Error("Method not implemented.");
  }
  max<TOut extends Comparable>(selector?: Selector<T, TOut> | undefined): TOut {
    throw new Error("Method not implemented.");
  }
  min<TOut extends Comparable>(selector?: Selector<T, TOut> | undefined): TOut {
    throw new Error("Method not implemented.");
  }
  join<TInner, TKey, TOut>(inner: TInner[] | IEnumerable<TInner>, outerKeySelector: Selector<T, TKey>, innerKeySelector: Selector<TInner, TKey>, resultSelector: (x: T, y: TInner) => TOut, comparer?: IEqualityComparer<TKey> | undefined): IEnumerable<TOut> {
    throw new Error("Method not implemented.");
  }
  groupJoin<TInner, TKey, TOut>(inner: TInner[] | IEnumerable<TInner>, outerKeySelector: Selector<T, TKey>, innerKeySelector: Selector<TInner, TKey>, resultSelector: (x: T, y: IEnumerable<TInner>) => TOut, comparer?: IEqualityComparer<TKey> | undefined): IEnumerable<TOut> {
    throw new Error("Method not implemented.");
  }
  toDictionary<TKey, TOut = T>(keySelector: Selector<T, TKey>, valueSelector?: Selector<T, TOut> | undefined): IDictionary<TKey, TOut> {
    throw new Error("Method not implemented.");
  }
  any(predicate?: Predicate<T> | undefined): boolean {
    throw new Error("Method not implemented.");
  }
  all(predicate: Predicate<T>): boolean {
    throw new Error("Method not implemented.");
  }
  contains(element: T): boolean {
    throw new Error("Method not implemented.");
  }
  orderBy(selector: (x: T) => Orderable): IOrderedEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  orderByDescending(selector: (x: T) => Orderable): IOrderedEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  take(count: number): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  takeWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  skip(count: number): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  skipWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  distinct(): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  union(other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T> | undefined): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  intersect(other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T> | undefined): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  except(other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T> | undefined): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  concat(...args: (T | IEnumerable<T> | T[])[]): IEnumerable<T> {
    throw new Error("Method not implemented.");
  }
  groupBy<TKey, TNext = T>(keySelector: Selector<T, TKey>, elementSelector?: Selector<T, TNext> | undefined, comparer?: IEqualityComparer<TKey> | undefined): IEnumerable<IGrouping<TKey, T>> {
    throw new Error("Method not implemented.");
  }
  return?(value?: any): IteratorResult<T, any> {
    throw new Error("Method not implemented.");
  }
  throw?(e?: any): IteratorResult<T, any> {
    throw new Error("Method not implemented.");
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
