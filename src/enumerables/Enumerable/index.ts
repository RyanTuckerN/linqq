import {
  Comparable,
  Selector,
  Numeric as number,
  Predicate,
  NumericSelector,
  SelectorWithIndex,
  PredicateWithIndex,
  OrderSelector,
  Sorter,
} from "../../types";
import {
  IEnumerableFactory,
  IEnumerable,
  IDictionary,
  IOrderedEnumerable,
  IGrouping,
  IEqualityComparer,
  ICollection,
  IList,
} from "../../interfaces";
import { HashSet } from "../HashSet";

import { DictionaryService, EnumerableService, GroupingService, OrderedEnumerableService } from "../../services";
import { UniversalEqualityComparer } from "../../util/equality-comparers.ts";
import { LinqUtils } from "../../util";
import { Exception } from "../../validator/exception";

export abstract class EnumerableBase<T extends any> implements IEnumerable<T>, Iterable<T> {
  protected source: IEnumerable<T>;
  protected sourceIterator: IterableIterator<T>;
  protected factory: IEnumerableFactory;
  // next is implemented explicitly in the iterator classes, so we declare it abstract here
  // however, in the derived enumerable classes, we can just throw and implement the Symbol.iterator method as a generator
  // this is because the iterator classes are the ones that actually implement the iterator protocol
  // There is probably a better way to do this, but I haven't figured it out yet
  abstract next(...args: [] | [undefined]): IteratorResult<T, any>;

  constructor(source: Iterable<T>) {
    if (!(Symbol.iterator in source)) throw Exception.invalidOperation("Source is not iterable");
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
  // Don't change this line!!
  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }
  throw(e?: any): IteratorResult<T, any> {
    throw new Exception(e);
  }
  ensureList(): IList<T> {
    if (this instanceof List) return this;
    return this.toList();
  }
  toList(): IList<T> {
    return this.factory.createList([...this.source]);
  }
  ensureCollection(): ICollection<T> {
    if (this instanceof Collection) return this;
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
    return new WhereIterator(this, predicate);
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
    if (max === undefined) throw Exception.sequenceEmpty();
    return max;
  }

  min<TOut extends Comparable>(selector?: Selector<T, TOut> | undefined): TOut {
    let min: TOut | undefined = undefined;
    for (const item of this) {
      const value = selector ? selector(item) : (item as unknown as TOut);
      if (min === undefined || value < min) min = value;
    }
    if (min === undefined) throw Exception.sequenceEmpty();
    return min;
  }

  toDictionary<TKey, TOut>(keySelector: Selector<T, TKey>, valueSelector: Selector<T, TOut>): IDictionary<TKey, TOut> {
    return this.factory.createDictionary<T, TKey, TOut>(this.source, keySelector, valueSelector);
  }

  count(predicate?: Predicate<T> | undefined): number {
    let count = 0;
    for (const item of this) {
      if (!predicate || predicate(item)) count++;
    }
    return count;
  }
  sum(selector?: NumericSelector<T> | undefined): number;
  sum(selector: NumericSelector<T>): number {
    selector ??= (x) => x as number;
    let sum = 0;
    for (const item of this) {
      sum += selector(item);
    }
    return sum as number;
  }
  average(selector?: NumericSelector<T> | undefined): number;
  average(selector: NumericSelector<T>): number {
    selector ??= (x) => x as unknown as number;
    let sum = 0;
    let count = 0;
    for (const item of this) {
      sum += selector(item);
      count++;
    }
    if (count === 0) throw Exception.sequenceEmpty();
    return (sum / count) as number;
  }
  join<TInner, TKey, TOut>(
    inner: IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: TInner) => TOut,
    comparer?: IEqualityComparer<TKey> | undefined,
  ): IEnumerable<TOut> {
    return cast<IEnumerable<TOut>>(
      new JoinIterator(this, inner, outerKeySelector, innerKeySelector, resultSelector, comparer),
    );
  }
  groupJoin<TInner, TKey, TOut>(
    inner: IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TOut,
    comparer?: IEqualityComparer<TKey> | undefined,
  ): IEnumerable<TOut> {
    return cast<IEnumerable<TOut>>(
      new GroupJoinIterator(this, inner, outerKeySelector, innerKeySelector, resultSelector, comparer),
    );
  }
  elementAt(index: number): T {
    const el = this.elementAtOrDefault(index);
    if (el === undefined) throw Exception.indexOutOfRange();
    return el;
  }
  elementAtOrDefault(index: number): T | undefined {
    let i = 0;
    for (const item of this) if (i++ === index) return item;
    return undefined;
  }
  first(predicate?: Predicate<T> | undefined): T {
    const el = this.firstOrDefault(predicate);
    if (el === undefined) throw Exception.sequenceEmpty();
    return el;
  }
  firstOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    for (const item of this) {
      if (!predicate || predicate(item)) return item;
    }
    return undefined;
  }
  last(predicate?: Predicate<T> | undefined): T {
    const el = this.lastOrDefault(predicate);
    if (el === undefined) throw Exception.sequenceEmpty();
    return el;
  }
  lastOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    let last;
    for (const item of this) {
      if (!predicate || predicate(item)) last = item;
    }
    return last;
  }
  single(predicate?: Predicate<T>): T {
    const el = this.singleOrDefault(predicate);
    if (el === undefined) throw Exception.sequenceEmpty();
    return el;
  }
  singleOrDefault(predicate?: Predicate<T>): T | undefined {
    let found: T | undefined = undefined;
    for (const item of this) {
      if (!predicate || predicate(item)) {
        if (found !== undefined) throw Exception.moreThanOne();
        found = item;
      }
    }
    return found;
  }
  append(element: T): IEnumerable<T> {
    return this.concat(element);
  }
  reverse(): IEnumerable<T> {
    return this.factory.create(this.reverseIterator());
  }

  private *reverseIterator(): Iterable<T> {
    const arr = [...this];
    for (let i = arr.length - 1; i >= 0; i--) {
      yield arr[i];
    }
  }

  any(predicate?: PredicateWithIndex<T> | undefined): boolean {
    let i = 0;
    for (const item of this) if (!predicate || predicate(item, i++)) return true;
    return false;
  }
  all(predicate: PredicateWithIndex<T>): boolean {
    let i = 0;
    for (const item of this) if (!predicate(item, i++)) return false;
    return true;
  }
  contains(element: T): boolean {
    return this.any((x) => x === element);
  }
  take(count: number): IEnumerable<T> {
    return this.factory.create(this.takeIterator(count));
  }
  protected *takeIterator(count: number): Iterable<T> {
    if (count > 0) {
      for (const item of this) {
        yield item;
        if (--count === 0) break;
      }
    }
  }
  takeWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    return this.factory.create(this.takeWhileIterator(predicate));
  }

  private *takeWhileIterator(predicate: PredicateWithIndex<T>): Iterable<T> {
    let i = 0;
    for (const item of this) {
      if (!predicate(item, i++)) break;
      yield item;
    }
  }

  skip(count: number): IEnumerable<T> {
    return this.factory.create(this.skipIterator(count));
  }

  private *skipIterator(count: number): Iterable<T> {
    for (const item of this) {
      if (count-- > 0) continue;
      yield item;
    }
  }

  skipWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    return this.factory.create(this.skipWhileIterator(predicate));
  }

  protected *skipWhileIterator(predicate: PredicateWithIndex<T>): Iterable<T> {
    let i = 0;
    for (const item of this) {
      if (predicate(item, i++)) continue;
      yield item;
    }
  }

  private get defaultComparer(): IEqualityComparer<T> {
    return (defaultEqualityComparer ??= new UniversalEqualityComparer<T>());
  }

  distinct(): IEnumerable<T> {
    return this.factory.create(this.distinctIterator());
  }

  protected *distinctIterator(): Iterable<T> {
    const set = new HashSet<T>();
    for (const item of this) {
      if (!set.has(item)) {
        set.add(item);
        yield item;
      }
    }
  }

  union(other: IEnumerable<T> | T[], comparer = this.defaultComparer): IEnumerable<T> {
    return this.factory.create(this.unionIterator(other, comparer));
  }

  private *unionIterator(other: IEnumerable<T> | T[], comparer = this.defaultComparer) {
    const set = new HashSet<T>(this, comparer);
    for (const item of other) {
      set.add(item);
    }
    for (const item of set) {
      yield item;
    }
  }

  intersect(other: IEnumerable<T> | T[], comparer = this.defaultComparer): IEnumerable<T> {
    return this.factory.create(this.intersectIterator(other, comparer));
  }

  protected *intersectIterator(other: IEnumerable<T> | T[], comparer = this.defaultComparer): Iterable<T> {
    const set = new HashSet<T>(other, comparer);
    for (const item of this) {
      if (set.has(item)) yield item;
    }
  }

  except(other: IEnumerable<T> | T[], comparer = this.defaultComparer): IEnumerable<T> {
    return this.factory.create(this.exceptIterator(other, comparer));
  }

  protected *exceptIterator(other: IEnumerable<T> | T[], comparer = this.defaultComparer): Iterable<T> {
    const set = new HashSet<T>(other, comparer);
    for (const item of this) {
      if (!set.has(item)) yield item;
    }
  }

  concat(...args: (T | T[])[]): IEnumerable<T> {
    return this.factory.create(this.concatIterator(...args));
  }

  protected *concatIterator(...args: (T | T[] | IEnumerable<T>)[]): Iterable<T> {
    for (const item of this) {
      yield item;
    }
    for (const arg of args) {
      if (isIterable(arg)) {
        for (const item of arg) {
          yield item;
        }
      } else {
        yield arg;
      }
    }
  }

  groupBy<TKey, TNext = T>(
    keySelector: Selector<T, TKey>,
    elementSelector?: Selector<T, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<IGrouping<TKey, T>> {
    return cast<IEnumerable<IGrouping<TKey, T>>>(
      this.factory.create(this.groupingIterator(keySelector, elementSelector, comparer)),
    );
  }

  protected *groupingIterator<TKey, TNext = T>(
    keySelector: Selector<T, TKey>,
    elementSelector?: Selector<T, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): Iterable<IGrouping<TKey, TNext>> {
    const lookup = Lookup.create(this.source, keySelector, elementSelector ?? ((x) => x as T & TNext), comparer);
    for (const group of lookup) {
      yield this.factory.createGrouping<TKey, TNext>(group.key, group);
    }
  }
  orderBy(selector: OrderSelector<T>): IOrderedEnumerable<T> {
    return this.factory.createOrderedEnumerable(this, [{ selector, descending: false }]);
  }
  orderByDescending(selector: OrderSelector<T>): IOrderedEnumerable<T> {
    return this.factory.createOrderedEnumerable(this, [{ selector, descending: true }]);
  }
}

export class Enumerable<T> extends EnumerableBase<T> implements IEnumerable<T> {
  public static from<T>(source: Iterable<T>): IEnumerable<T> {
    return new Enumerable<T>(source);
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (const item of this.source) {
      yield item;
    }
  }
  next(...args: [] | [undefined]): IteratorResult<T, any> {
    return this.source[Symbol.iterator]().next();
  }

  public static empty<T>(): IEnumerable<T> {
    return Enumerable.from<T>(LinqUtils.defaultSource());
  }

  public static repeat<T>(element: T, count: number): IEnumerable<T> {
    if (count < 0) return Enumerable.empty<T>();
    count = Math.floor(count);
    const arr = Array(count).fill(element);
    return Enumerable.from<T>(arr);
  }

  protected *rangeGenerator(start: number, count: number): Iterable<number> {
    for (let i = 0; i < count; i++) {
      yield start + i;
    }
  }
  public static range(start: number, count: number): IEnumerable<number> {
    count = Math.floor(count);
    if (count < 0) return Enumerable.empty<number>();
    const arr = Array(count)
      .fill(start)
      .map((x, i) => x + i);
    return Enumerable.from<number>(arr);
  }
}

abstract class IteratorBase<TSource, TNext extends any = TSource>
  extends EnumerableBase<TSource>
  implements Iterable<TSource>, Iterator<TSource, TNext>
{
  // This is what everything hinges on. Change with caution!!
  public *[Symbol.iterator](): IterableIterator<TSource> {
    // this is the key to the whole thing. It's a deep clone of the iterator
    // so that we can iterate over the same source multiple times
    // and it's done in a way that doesn't require the source to be an array
    const iterator = this.getIterator();
    while (iterator.moveNext()) {
      yield iterator.current as TNext & TSource;
    }
  }
  constructor(protected source: IEnumerable<TSource>) {
    super(source);
  }
  private _current: TNext | undefined;
  protected get current(): TNext {
    if (this._current === undefined || this._current === null)
      throw Exception.invalidOperation("Current value is not set");
    return this._current;
  }
  protected set current(value: TNext) {
    this._current = value;
  }
  protected state = 0;
  protected abstract clone(): IteratorBase<TSource, TNext>;
  private getIterator(): typeof this {
    if (this.state === 0) {
      this.state = 1;
      return this;
    }
    const copy = this.clone();
    copy.state = 1;
    return copy as typeof this;
  }

  next(...args: [] | [undefined]): IteratorResult<TSource, any> {
    // This is handled by the iterator, which is the derived this, so we can just return the result of the iterator and skip implementing it here
    throw Exception.notImplemented();
  }

  public abstract moveNext(): boolean;
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
    this.lookup ??= Lookup.create(this.inner, this.innerKeySelector, (x) => x, this.comparer);
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      const key = this.outerKeySelector(result.value);
      const inners = this.lookup.getGrouping(key, false);
      if (inners) {
        for (const innerItem of inners) {
          this.current = this.resultSelector(result.value, innerItem);
          return true;
        }
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
    this.lookup ??= Lookup.create(this.inner, this.innerKeySelector, (x) => x, this.comparer);
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      const key = this.outerKeySelector(result.value);
      const inner = this.factory.create(this.lookup.getGrouping(key, false) ?? []);
      this.current = this.resultSelector(result.value, inner);
      return true;
    }
    return false;
  }

  public clone(): GroupJoinIterator<TOuter, TInner, TKey, TResult> {
    return new GroupJoinIterator(
      this.source,
      this.inner,
      this.outerKeySelector,
      this.innerKeySelector,
      this.resultSelector,
    );
  }
}

export class GroupingIterator<TKey, TSource, TNext = TSource> extends IteratorBase<TSource, IGrouping<TKey, TNext>> {
  private lookup?: Lookup<TKey, TSource>;
  private lookupIterator?: Iterator<KeyedArray<TKey, TSource>>;
  constructor(
    source: IEnumerable<TSource>,
    private keySelector: Selector<TSource, TKey>,
    private elementSelector?: Selector<TSource, TNext>,
    private comparer: IEqualityComparer<TKey> = new UniversalEqualityComparer<TKey>(),
  ) {
    super(source);
  }

  public moveNext(): boolean {
    this.lookup ??= Lookup.create(this.source, this.keySelector, (x) => x, this.comparer);
    this.lookupIterator ??= this.lookup[Symbol.iterator]();

    let result;
    while (!(result = this.lookupIterator.next()).done) {
      const key = result.value.key;
      const grouping = result.value;
      this.current = this.factory.createGrouping<TKey, TNext>(
        key,
        (this.elementSelector ? grouping.map(this.elementSelector) : grouping) as TNext[],
      );
      return true;
    }
    return false;
  }

  public clone(): GroupingIterator<TKey, TSource, TNext> {
    return new GroupingIterator(this.source, this.keySelector, this.elementSelector, this.comparer);
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
    return [...this];
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

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.sourceArray;
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

class Lookup<TKey, T> implements Iterable<KeyedArray<TKey, T>> {
  private map: Map<string, KeyedArray<TKey, T>>;
  *[Symbol.iterator]() {
    for (const item of this.map.values()) {
      yield item;
    }
  }

  private constructor(private comparer: IEqualityComparer<TKey> = new UniversalEqualityComparer<TKey>()) {
    this.map = new Map<string, KeyedArray<TKey, T>>();
  }

  public getGrouping(key: TKey, create: false): KeyedArray<TKey, T> | undefined;
  public getGrouping(key: TKey, create: true): KeyedArray<TKey, T>;
  public getGrouping(key: TKey, create: boolean): KeyedArray<TKey, T> {
    const hash = this.comparer.hash(key);
    if (!this.map.has(hash) && create) {
      this.map.set(hash, new KeyedArray(key));
    }
    return this.map.get(hash)!;
  }

  public static create<TKey, TValue, TNext>(
    source: IEnumerable<TValue>,
    keySelector: Selector<TValue, TKey>,
    elementSelector: Selector<TValue, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): Lookup<TKey, TNext> {
    const lookup = new Lookup<TKey, TNext>(comparer);
    for (const item of source) {
      const key = keySelector(item);
      lookup.getGrouping(key, true).push(elementSelector(item));
    }
    return lookup;
  }
}

class KeyedArray<TKey, T> extends Array<T> {
  constructor(public key: TKey) {
    super();
  }
}

export function cast<T>(source: any): T {
  return source as T;
}

function isIterable<T>(source: any): source is Iterable<T> {
  return typeof source[Symbol.iterator] === "function";
}

// instantiate services once and reuse them
const enumerableService = new EnumerableService();
const orderedEnumerableService = new OrderedEnumerableService();
const groupingService = new GroupingService();
const dictionaryService = new DictionaryService();
let defaultEqualityComparer: IEqualityComparer<any>;
