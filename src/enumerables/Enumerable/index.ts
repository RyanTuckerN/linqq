import util from "util";
import {
  Comparable,
  Selector,
  Numeric,
  Predicate,
  IEnumerableFactory,
  ICanEnumerate,
  NumericSelector,
  SelectorWithIndex,
  PredicateWithIndex,
  OrderSelector,
  Sorter,
  Orderable,
} from "../../types";
// import { Validator as Validator } from "../../validator";
// import { LinqUtils as Utils } from "../../util";
import {
  IEnumerable,
  IDictionary,
  IOrderedEnumerable,
  IGrouping,
  IEqualityComparer,
  ICollection,
  IList,
  IHashSet,
} from "../../interfaces";
import { HashSet } from "../HashSet";

import { DictionaryService, EnumerableService, GroupingService, OrderedEnumerableService } from "../../services";
import { UniversalEqualityComparer } from "../../util/equality-comparers.ts";
import { LinqUtils } from "../../util";

export abstract class EnumerableBase<T extends any> implements IEnumerable<T>, Iterable<T> {
  protected source: IEnumerable<T>;
  protected sourceIterator: IterableIterator<T>;
  protected factory: IEnumerableFactory;

  abstract next(...args: [] | [undefined]): IteratorResult<T, any>;

  constructor(source: ICanEnumerate<T>) {
    if (!(Symbol.iterator in source)) throw new Error("Source is not iterable");
    this.source = cast<IEnumerable<T>>(source);
    this.sourceIterator = source[Symbol.iterator]() as IterableIterator<T>;
    this.factory = {
      create: enumerableService.create,
      createCollection: enumerableService.createCollection,
      createList: enumerableService.createList,
      createOrderedEnumerable: orderedEnumerableService.createOrderedEnumerable,
      createGrouping: groupingService.createGrouping,
      createDictionary: dictionaryService.createDictionary,
    };
  }
  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }
  ensureList(): IList<T> {
    return this.toList();
  }
  toList(): IList<T> {
    return this.factory.createList([...this.source]);
  }
  ensureCollection(): ICollection<T> {
    return this.toCollection();
  }
  toCollection(): ICollection<T> {
    return this.factory.createCollection([...this.source]);
  }
  toArray(): T[] {
    return [...this];
  }
  cast<TOut>(): IEnumerable<TOut> {
    return cast<IEnumerable<TOut>>(this);
  }
  where(predicate: (x: T) => boolean): IEnumerable<T> {
    return new WhereIterator(this.source, predicate);
  }
  select<TOut>(selector: (x: T, i: number) => TOut): IEnumerable<TOut> {
    let iterator;
    if (this instanceof WhereIterator) iterator = new WhereSelectIterator<T, TOut>(this, this.predicate, selector);
    return cast<IEnumerable<TOut>>(iterator ?? new SelectIterator<T, TOut>(this, selector));
  }
  selectMany<TOut>(selector: (x: T, i: number) => TOut[]): IEnumerable<TOut> {
    return cast<IEnumerable<TOut>>(new SelectManyIterator(this, selector));
  }
  max<TOut extends Comparable>(selector?: Selector<T, TOut> | undefined): TOut {
    let max: TOut | undefined = undefined;
    for (const item of this) {
      const value = selector ? selector(item) : (item as unknown as TOut);
      if (max === undefined || value > max) max = value;
    }
    if (max === undefined) throw new Error("Sequence contains no elements");
    return max;
  }
  min<TOut extends Comparable>(selector?: Selector<T, TOut> | undefined): TOut {
    let min: TOut | undefined = undefined;
    for (const item of this) {
      const value = selector ? selector(item) : (item as unknown as TOut);
      if (min === undefined || value < min) min = value;
    }
    if (min === undefined) throw new Error("Sequence contains no elements");
    return min;
  }

  toDictionary<TKey, TOut>(keySelector: Selector<T, TKey>, valueSelector: Selector<T, TOut>): IDictionary<TKey, TOut> {
    return this.factory.createDictionary<T, TKey, TOut>(this.source, keySelector, valueSelector);
  }
  count(predicate?: Predicate<T> | undefined): number {
    let count = 0;
    for (const item of this) if (!predicate || predicate(item)) count++;
    return count;
  }
  sum(selector?: NumericSelector<T> | undefined): Numeric;
  sum(selector: NumericSelector<T>): Numeric {
    selector ??= (x) => x as unknown as Numeric;
    let sum; // no initializer since a.) we need to know if we've seen any elements and b.) we don't know the type of the sum (number | bigint)
    for (const item of this) {
      const value = selector(item);
      sum = sum === undefined ? value : sum + value;
    }
    if (sum === undefined) throw new Error("Sequence contains no elements");
    return sum as Numeric;
  }
  average(selector?: NumericSelector<T> | undefined): Numeric;
  average(selector: NumericSelector<T>): Numeric {
    selector ??= (x) => x as unknown as Numeric;
    let sum = 0;
    let count = 0;
    for (const item of this) {
      sum += selector(item);
      count++;
    }
    if (count === 0) throw new Error("Sequence contains no elements");
    return (sum / count) as Numeric;
  }
  join<TInner, TKey, TOut>(
    inner: IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: TInner) => TOut,
    comparer?: IEqualityComparer<TKey> | undefined,
  ): IEnumerable<TOut> {
    return cast<IEnumerable<TOut>>(new JoinIterator(this, inner, outerKeySelector, innerKeySelector, resultSelector, comparer));
  }
  groupJoin<TInner, TKey, TOut>(
    inner: IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TOut,
    comparer?: IEqualityComparer<TKey> | undefined,
  ): IEnumerable<TOut> {
    return cast<IEnumerable<TOut>>(new GroupJoinIterator(this, inner, outerKeySelector, innerKeySelector, resultSelector, comparer));
  }
  elementAt(index: number): T {
    const el = this.elementAtOrDefault(index);
    if (el === undefined) throw new Error("Index out of range");
    return el;
  }
  elementAtOrDefault(index: number): T | undefined {
    let i = 0;
    for (const item of this) if (i++ === index) return item;
    return undefined;
  }
  first(predicate?: Predicate<T> | undefined): T {
    const el = this.firstOrDefault(predicate);
    if (el === undefined) throw new Error("Sequence contains no elements");
    return el;
  }
  firstOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    let result;
    while (!(result = this.sourceIterator.next()).done) if (!predicate || predicate(result.value)) return result.value;
    return undefined;
  }
  last(predicate?: Predicate<T> | undefined): T {
    const el = this.lastOrDefault(predicate);
    if (el === undefined) throw new Error("Sequence contains no elements");
    return el;
  }
  lastOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    let result, last;
    while (!(result = this.sourceIterator.next()).done) {
      if (!predicate || predicate(result.value)) last = result.value;
    }
    return last;
  }
  single(predicate?: Predicate<T> | undefined): T {
    const el = this.singleOrDefault(predicate);
    if (el === undefined) throw new Error("Sequence contains no elements");
    return el;
  }
  singleOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    let result, single;
    while (!(result = this.sourceIterator.next()).done) {
      if (!predicate || predicate(result.value)) {
        if (single !== undefined) throw new Error("Sequence contains more than one element");
        single = result.value;
      }
    }
    return single;
  }
  append(element: T): IEnumerable<T> {
    return this.concat(element);
  }
  reverse(): IEnumerable<T> {
    const newArr = [];
    for (const item of this) newArr.unshift(item);
    return this.factory.create(newArr);
  }
  any(predicate?: PredicateWithIndex<T> | undefined): boolean {
    let result,
      i = 0;
    while (!(result = this.sourceIterator.next()).done) if (!predicate || predicate(result.value, i++)) return true;
    return false;
  }
  all(predicate: PredicateWithIndex<T>): boolean {
    let result,
      i = 0;
    while (!(result = this.sourceIterator.next()).done) if (!predicate(result.value, i++)) return false;
    return true;
  }
  contains(element: T): boolean {
    return this.any((x) => x === element);
  }
  take(count: number): IEnumerable<T> {
    let result,
      i = 0,
      newArr = [];
    while (!(result = this.sourceIterator.next()).done && i++ < count) newArr.push(result.value);
    return this.factory.create(newArr);
  }
  takeWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    let result,
      i = 0,
      newArr = [];
    while (!(result = this.sourceIterator.next()).done && predicate(result.value, i++)) {
      newArr.push(result.value);
    }
    return this.factory.create(newArr);
  }
  skip(count: number): IEnumerable<T> {
    let i = 0;
    while (!this.sourceIterator.next().done && i++ < count) {}
    return this.factory.create([...this.sourceIterator]);
  }
  skipWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    let result,
      i = 0;
    while (!(result = this.sourceIterator.next()).done && predicate(result.value, i++)) {}
    return this.factory.create([...this.sourceIterator]);
  }
  distinct(): IEnumerable<T> {
    const set = new HashSet<T>(this);
    return this.factory.create([...set]);
  }
  union(
    other: IEnumerable<T> | T[],
    comparer = (defaultEqualityComparer ??= new UniversalEqualityComparer()),
  ): IEnumerable<T> {
    const set = new HashSet<T>(this, comparer);
    for (const item of other) {
      set.add(item);
    }
    return this.factory.create(set);
  }
  intersect(
    other: IEnumerable<T> | T[],
    comparer = (defaultEqualityComparer ??= new UniversalEqualityComparer()),
  ): IEnumerable<T> {
    let set = new HashSet<T>(this, comparer);
    const otherSet = new HashSet<T>(other, comparer);
    set = set.intersect(otherSet);
    return this.factory.create(set);
  }
  except(
    other: IEnumerable<T> | T[],
    comparer = (defaultEqualityComparer ??= new UniversalEqualityComparer()),
  ): IEnumerable<T> {
    let set = new HashSet<T>(this, comparer);
    const otherSet = new HashSet<T>(other, comparer);
    set = set.except(otherSet);
    return this.factory.create(set);
  }
  concat(...args: (T | T[])[]): IEnumerable<T> {
    return cast<IEnumerable<T>>(this.factory.create([...this.source, ...args.flat()]));
  }
  groupBy<TKey>(keySelector: Selector<T, TKey>): IEnumerable<IGrouping<TKey, T>> {
    throw new Error("Method not implemented.");
  }
  orderBy(selector: OrderSelector<T>): IOrderedEnumerable<T> {
    throw new Error("Method not implemented.");
    // let sortingExpression = [selector];
    // return orderedEnumerableService.createOrderedEnumerable(this.source, sortingExpression);
  }
  orderByDescending(selector: OrderSelector<T>): IOrderedEnumerable<T> {
    throw new Error("Method not implemented.");
  }

  // toString(): string {
  //   return util.inspect(this.toArray());
  // }
  // [util.inspect.custom] = () => this.toString();
}

export class Enumerable<T> extends EnumerableBase<T> implements IEnumerable<T> {
  public static from<T>(source: ICanEnumerate<T>): IEnumerable<T> {
    return new DefaultIterator<T>(cast<IEnumerable<T>>(source));
  }

  next(...args: [] | [undefined]): IteratorResult<T, any> {
    console.log("args", args);
    throw new Error("Method not implemented.");
  }

  public static empty<T>(): IEnumerable<T> {
    return Enumerable.from<T>(LinqUtils.defaultState());
  }

  public static repeat<T>(element: T, count: number): IEnumerable<T> {
    if (count < 0) return Enumerable.empty<T>();
    count = Math.floor(count);
    const arr = Array(count).fill(element);
    return Enumerable.from<T>(arr);
  }

  public static range(start: number, count: number): IEnumerable<number> {
    count = Math.floor(count);

    if (count < 0) return Enumerable.from([]);
    const arr = Array(count)
      .fill(0)
      .map((_, i) => start + i);
    return Enumerable.from(arr);
  }

  public toString(): string {
    return `Enumerable: ${super.toString()}`;
  }
}

abstract class IteratorBase<TSource, TNext extends any = TSource>
  extends EnumerableBase<TSource>
  implements Iterable<TSource>, Iterator<TSource, TNext>
{
  // @ts-ignore
  private _current: TNext;

  protected state = 0;

  // This is what everything hinges on. Proceed with caution!!
  *[Symbol.iterator](): IterableIterator<TSource> {
    // this is the key to the whole thing. It's a deep clone of the iterator
    // so that we can iterate over the same source multiple times
    // and it's done in a way that doesn't require the source to be an array
    const iterator = this.getIterator();
    while (iterator.moveNext()) {
      yield iterator.current as TNext & TSource;
    }
  }

  private getIterator(): typeof this {
    if (this.state === 0) {
      this.state = 1;
      return this;
    } 
    const copy = this.clone();
    copy.state = 1;
    return copy as typeof this;
  }

  constructor(protected source: IEnumerable<TSource>) {
    super(source);
  }

  protected get current(): TNext {
    return this._current;
  }

  next(...args: [] | [undefined]): IteratorResult<TSource, any> {
    // This is handled by the iterator, which is this, so we can just return the result of the iterator and skip the next method in this class 
    throw new Error("Method not implemented.");
  }

  protected set current(value: TNext) {
    this._current = value;
  }

  public abstract moveNext(): boolean;

  public abstract clone(): IteratorBase<TSource, TNext>;
}

export class DefaultIterator<TSource> extends IteratorBase<TSource> {
  constructor(protected source: IEnumerable<TSource>) {
    super(source);
  }

  public moveNext(): boolean {
    const result = this.sourceIterator.next();
    if (!result.done) {
      this.current = result.value;
      return true;
    }
    return false;
  }

  public clone(): DefaultIterator<TSource> {
    return new DefaultIterator(this.source);
  }
}

export class WhereIterator<TSource> extends IteratorBase<TSource> {
  constructor(
    protected source: IEnumerable<TSource>,
    private _predicate: (item: TSource) => boolean,
  ) {
    super(source);
  }

  public get predicate(): (item: TSource) => boolean {
    return this._predicate;
  }

  // this works
  public moveNext(): boolean {
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      if (this._predicate(result.value)) {
        this.current = result.value;
        return true;
      }
    }
    return false;
  }

  public static isWhereIterator<TSource>(source: any): source is WhereIterator<TSource> {
    return source instanceof WhereIterator;
  }

  public clone(): IteratorBase<TSource> {
    return new WhereIterator(this.source, this._predicate);
  }
}

abstract class IndexIterator<TSource, TNext = TSource> extends IteratorBase<TSource, TNext> {
  protected index = 0;
}

export class SelectIterator<TSource, TResult> extends IndexIterator<TSource, TResult> {
  constructor(
    source: IEnumerable<TSource>,
    private _selector: SelectorWithIndex<TSource, TResult>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    const result = this.sourceIterator.next();
    if (!result.done) {
      this.current = this._selector(result.value, this.index++);
      return true;
    }
    return false;
  }

  public clone(): SelectIterator<TSource, TResult> {
    return new SelectIterator<TSource, TResult>(this.source, this._selector);
  }
}

export class SelectManyIterator<TSource, TResult> extends IndexIterator<TSource, TResult> {
  private innerIterator: Iterator<TResult> | null = null;

  constructor(
    source: IEnumerable<TSource>,
    private selector: SelectorWithIndex<TSource, Iterable<TResult>>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    if (this.innerIterator) {
      const result = this.innerIterator.next();
      if (!result.done) {
        this.current = result.value;
        return true;
      }
    }

    let sourceResult;
    while (!(sourceResult = this.sourceIterator.next()).done) {
      const inner = this.selector(sourceResult.value, this.index++);
      this.innerIterator = inner[Symbol.iterator]();
      const result = this.innerIterator.next();
      if (!result.done) {
        this.current = result.value;
        return true;
      }
    }

    return false;
  }

  public clone(): SelectManyIterator<TSource, TResult> {
    return new SelectManyIterator<TSource, TResult>(this.source, this.selector);
  }
}

export class WhereSelectIterator<TSource, TResult> extends IndexIterator<TSource, TResult> {
  constructor(
    source: IEnumerable<TSource>,
    private predicate: (item: TSource) => boolean,
    private selector: SelectorWithIndex<TSource, TResult>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      if (this.predicate(result.value)) {
        this.current = this.selector(result.value, this.index++);
        return true;
      }
    }
    return false;
  }

  public clone(): WhereSelectIterator<TSource, TResult> {
    return new WhereSelectIterator<TSource, TResult>(this.source, this.predicate, this.selector);
  }
}

export class OrderedEnumerable<T> extends IndexIterator<T> implements IOrderedEnumerable<T> {
  private sorted: T[] | null = null;
  public static createOrderedEnumerable<T>(
    source: IEnumerable<T>,
    sortExpressions: Sorter<T>[] = [],
  ): IOrderedEnumerable<T> {
    return new OrderedEnumerable<T>(source, sortExpressions);
  }
  constructor(
    source: IEnumerable<T>,
    private criteria: Sorter<T>[],
  ) {
    super(source);
  }

  thenBy<TKey extends any>(selector: (x: T) => TKey): this {
    this.criteria = [...this.criteria, { selector, descending: false }];
    return this;
  }

  thenByDescending<TKey extends any>(selector: (x: T) => TKey): this {
    this.criteria = [...this.criteria, { selector, descending: true }];
    return this;
  }

  public moveNext(): boolean {
    if (!this.sorted) {
      this.sort();
    }
    if (this.index < this.sorted!.length) {
      this.current = this.sorted![this.index++];
      return true;
    }
    return false;
  }

  public clone(): IteratorBase<T, T> {
    return new OrderedEnumerable<T>(this.source, this.criteria);
  }

  private sort(): void {
    // should i implement a buffer?
    // maybe quick sort?
    // or just use the built in sort?
    const data = Array.isArray(this.source) ? this.source : Array.from(this.source);
    this.sorted = data.sort((a, b) => {
      for (const criterion of this.criteria) {
        const keyA = criterion.selector(a);
        const keyB = criterion.selector(b);
        const comparison = keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
        if (comparison !== 0) {
          return criterion.descending ? -comparison : comparison;
        }
      }
      return 0;
    });
  }
}

export class GroupingIterator<TKey, TElement> extends IteratorBase<TElement> {
  private lookup = new Lookup<TKey, TElement>();
  constructor(
    source: IEnumerable<TElement>,
    private selector: Selector<TElement, TKey>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      const key = this.selector(result.value);
      this.lookup.getGrouping(key, true).push(result.value);
    }
    return false;
  }

  public clone(): GroupingIterator<TKey, TElement> {
    return new GroupingIterator(this.source, this.selector);
  }
}

export class JoinIterator<TOuter, TInner, TKey, TResult> extends IteratorBase<TOuter, TResult> {
  private lookup: Lookup<TKey, TInner> | null = null;
  
  constructor(
    source: IEnumerable<TOuter>,
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
      this.lookup = Lookup.create(this.inner, this.innerKeySelector, this.comparer);
    }
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      const key = this.outerKeySelector(result.value);
      for (const innerItem of this.lookup.getGrouping(key, false)) {
        this.current = this.resultSelector(result.value, innerItem);
        return true;
      }
    }
    return false;
  }

  public clone(): JoinIterator<TOuter, TInner, TKey, TResult> {
    return new JoinIterator(this.source, this.inner, this.outerKeySelector, this.innerKeySelector, this.resultSelector);
  }
}

export class GroupJoinIterator<TOuter, TInner, TKey, TResult> extends IteratorBase<TOuter, TResult> {
  private lookup: Lookup<TKey, TInner> | null = null;

  constructor(
    source: IEnumerable<TOuter>,
    private inner: IEnumerable<TInner>,
    private outerKeySelector: Selector<TOuter, TKey>,
    private innerKeySelector: Selector<TInner, TKey>,
    private resultSelector: (outer: TOuter, inner: IEnumerable<TInner>) => TResult,
    private comparer: IEqualityComparer<TKey> = new UniversalEqualityComparer<TKey>(),
  ) {
    super(source);
  }

  public moveNext(): boolean {
    if (!this.lookup) {
      this.lookup = Lookup.create(this.inner, this.innerKeySelector, this.comparer);
    }
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      const key = this.outerKeySelector(result.value);
      this.current = this.resultSelector(result.value, this.factory.create(this.lookup.getGrouping(key, false)));
      return true;
    }
    return false;
  }

  public clone(): GroupJoinIterator<TOuter, TInner, TKey, TResult> {
    return new GroupJoinIterator(this.source, this.inner, this.outerKeySelector, this.innerKeySelector, this.resultSelector);
  }
}

export class Collection<T> extends EnumerableBase<T> implements ICollection<T> {
  protected sourceArray: T[];
  public static from<T>(source: IEnumerable<T>): ICollection<T> {
    if (source instanceof Collection) return source;
    return new Collection<T>([...source]);
  }
  next(...args: [] | [undefined]): IteratorResult<T, any> {
    return this.sourceIterator.next(...args);
  }
  constructor(source: T[]) {
    super(cast<IEnumerable<T>>(source));
    this.sourceArray = source;
  }
  public toArray(): T[] {
    return [...this.sourceArray];
  }
  public get length(): number {
    return this.sourceArray.length;
  }
  isEmpty(): boolean {
    return this.sourceArray.length === 0;
  }
  add(element: T): boolean {
    this.sourceArray.push(element);
    return true;
  }
  remove(element: T): boolean {
    const index = this.sourceArray.indexOf(element);
    if (index === -1) return false;
    this.sourceArray.splice(index, 1);
    return true;
  }
  clear(): void {
    this.sourceArray.splice(0, this.length);
  }
}

export class List<T> extends Collection<T> implements IList<T> {
  constructor(source: T[]) {
    super(source);
  }
  public static from<T>(source: T[] | IEnumerable<T>): IList<T> {
    if (source instanceof List) return source;
    return new List<T>(Array.isArray(source) ? source : [...source]);
  }
  public get length(): number {
    return this.sourceArray.length;
  }
  indexOf(element: T): number {
    return this.sourceArray.indexOf(element);
  }
  insert(index: number, element: T): void {
    this.sourceArray.splice(index, 0, element);
  }
  removeAt(index: number): void {
    this.sourceArray.splice(index, 1);
  }
  get(index: number): T {
    return this.sourceArray[index];
  }
  set(index: number, element: T): void {
    this.sourceArray[index] = element;
  }
  isEmpty(): boolean {
    return this.sourceArray.length === 0;
  }
  add(element: T): boolean {
    this.sourceArray.push(element);
    return true;
  }
  remove(element: T): boolean {
    const index = this.sourceArray.indexOf(element);
    if (index === -1) return false;
    this.sourceArray.splice(index, 1);
    return true;
  }
  clear(): void {
    this.sourceArray.splice(0, this.length);
  }
}

class Lookup<TKey, T> implements Iterable<T[]> {
  private map: Map<string, T[]>;
  [Symbol.iterator] = this.getIterator;

  constructor(private comparer: IEqualityComparer<TKey> = new UniversalEqualityComparer<TKey>()) {
    this.map = new Map<string, T[]>();
  }

  public getGrouping(key: TKey, create: boolean): T[] {
    const hash = this.comparer.hash(key);
    if (!this.map.has(hash) && create) {
      this.map.set(hash, []);
    }
    return this.map.get(hash)!;
  }

  public static create<TKey, TValue>(
    source: IEnumerable<TValue>,
    keySelector: Selector<TValue, TKey>,
    comparer?: IEqualityComparer<TKey>,
  ): Lookup<TKey, TValue> {
    const lookup = new Lookup<TKey, TValue>(comparer);
    for (const item of source) {
      const key = keySelector(item);
      const element = item;
      lookup.getGrouping(key, true).push(element);
    }
    return lookup;
  }

  public getIterator<T, TNext = T>(selector?: Selector<T, TNext>): IterableIterator<TNext> {
    let iterator: IterableIterator<any> = this.map.values();
    if (selector) iterator = new SelectIterator(cast<IEnumerable<T>>(iterator), selector);
    return iterator;
  }
}

export function cast<T>(source: any): T {
  return source as T;
}
class IteratorUtils {
  public static combinePredicates<T>(...predicates: Predicate<T>[]): Predicate<T> {
    return (item: T) => predicates.every((predicate) => predicate(item));
  }

  public static combineSelectors<TSource, TMiddle, TResult>(
    selector1: Selector<TSource, TMiddle>,
    selector2: Selector<TMiddle, TResult>,
  ): Selector<TSource, TResult> {
    return (item: TSource) => selector2(selector1(item));
  }
}

// instantiate services once and reuse them
const enumerableService = new EnumerableService();
const orderedEnumerableService = new OrderedEnumerableService();
const groupingService = new GroupingService();
const dictionaryService = new DictionaryService();
let defaultEqualityComparer: IEqualityComparer<any>;
