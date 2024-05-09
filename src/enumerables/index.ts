import {
  Comparable,
  Selector,
  Predicate,
  NumericSelector,
  SelectorWithIndex,
  PredicateWithIndex,
  OrderSelector,
  Sorter,
  KeyValuePair,
} from "../types";
import {
  IEnumerable,
  IDictionary,
  IOrderedEnumerable,
  IGrouping,
  IEqualityComparer,
  IList,
  IHashSet,
  Indexable,
} from "../interfaces";
import { Generator, QueryOptions } from "../iterators/generator";
import { UniversalEqualityComparer } from "../util/equality-comparers.ts";
import { LinqUtils } from "../util";
import { Exception } from "../validator/exception";
import { Operation } from "../iterators/operation";

let i = 1;
let logIteration: ((name: string, ...args: any[]) => void) | undefined;
// logIteration = (name, ...args) => {
//   console.log(name, i++, ...args);
// };

export abstract class EnumerableBase<T extends any> implements IEnumerable<T>, Iterable<T> {
  constructor(source: Iterable<T>) {
    validateSource(source);
  }

  ensureList(): IList<T> {
    if (this instanceof List) return this;
    return this.toList();
  }

  toList(): IList<T> {
    return List.from([...this]);
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
    return new WhereSelectIterator(this, () => true, selector);
  }

  selectMany<TOut>(selector: SelectorWithIndex<T, Iterable<TOut>>): IEnumerable<TOut> {
    return new SelectManyIterator<T, TOut>(this, selector) as IEnumerable<TOut>;
  }

  aggregate<TAccumulate, TResult = TAccumulate>(
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector?: (acc: TAccumulate) => TResult,
  ): TResult {
    return Operation.aggregate(this, seed, func, resultSelector);
  }

  max<TOut extends Comparable>(selector?: Selector<T, TOut> | undefined): TOut {
    return Operation.max(this, selector);
  }

  min<TOut extends Comparable>(selector?: Selector<T, TOut> | undefined): TOut {
    return Operation.min(this, selector);
  }

  toDictionary<TKey, TOut>(
    keySelector: Selector<T, TKey>,
    valueSelector?: Selector<T, TOut>,
  ): IDictionary<TKey, TOut> & Indexable<TKey, TOut> {
    return Dictionary.createDictionary<T, TKey, TOut>(this, keySelector, valueSelector);
  }

  count(predicate?: Predicate<T> | undefined): number {
    return Operation.count(this, predicate);
  }

  sum(selector?: NumericSelector<T> | undefined): number;
  sum(selector: NumericSelector<T>): number {
    return Operation.sum(this, selector);
  }

  average(selector?: NumericSelector<T> | undefined): number;
  average(selector: NumericSelector<T>): number {
    return Operation.average(this, selector);
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
    return Operation.elementAt(this, index);
  }

  elementAtOrDefault(index: number): T | undefined {
    return Operation.elementAtOrDefault(this, index);
  }

  first(predicate?: Predicate<T> | undefined): T {
    return Operation.first(this, predicate);
  }

  firstOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    return Operation.firstOrDefault(this, predicate);
  }

  last(predicate?: Predicate<T> | undefined): T {
    return Operation.last(this, predicate);
  }

  lastOrDefault(predicate?: Predicate<T> | undefined): T | undefined {
    return Operation.lastOrDefault(this, predicate);
  }

  single(predicate?: Predicate<T>): T {
    return Operation.single(this, predicate);
  }

  singleOrDefault(predicate?: Predicate<T>): T | undefined {
    return Operation.singleOrDefault(this, predicate);
  }

  reverse(): IEnumerable<T> {
    return Enumerable.from(Generator.reverse(this));
  }

  append(element: T): IEnumerable<T> {
    return this.concat([element]);
  }

  any(predicate?: PredicateWithIndex<T> | undefined): boolean {
    return Operation.any(this, predicate);
  }
  all(predicate: PredicateWithIndex<T>): boolean {
    return Operation.all(this, predicate);
  }

  contains(element: T): boolean {
    return this.any((x) => x === element);
  }

  take(count: number): IEnumerable<T> {
    return Enumerable.from(Generator.take(this, count));
  }

  takeWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    return Enumerable.from(Generator.takeWhile(this, predicate));
  }

  skip(count: number): IEnumerable<T> {
    return Enumerable.from(Generator.skip(this, count));
  }

  skipWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    return Enumerable.from(Generator.skipWhile(this, predicate));
  }

  distinct(): IEnumerable<T> {
    return Enumerable.from(Generator.distinct(this));
  }

  distinctBy<TOut>(selector: Selector<T, TOut>): IEnumerable<T> {
    return Enumerable.from(Generator.distinctBy(this, selector));
  }

  union(other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T>): IEnumerable<T> {
    return Enumerable.from(Generator.union(this, other, comparer));
  }

  intersect(other: IEnumerable<T> | T[], comparer: IEqualityComparer<T>): IEnumerable<T> {
    return Enumerable.from(Generator.intersect(this, other, comparer));
  }

  except(other: IEnumerable<T> | T[], comparer: IEqualityComparer<T>): IEnumerable<T> {
    return Enumerable.from(Generator.except(this, other, comparer));
  }

  concat(...args: Iterable<T>[]): IEnumerable<T> {
    return Enumerable.from(Generator.concat(this, ...args));
  }

  zip<TOut, TSecond = T>(second: Iterable<TSecond>, selector: (f: T, s: TSecond) => TOut): IEnumerable<TOut> {
    return Enumerable.from(Generator.zip(this, second, selector));
  }

  groupBy<TKey, TNext = T>(
    keySelector: Selector<T, TKey>,
    elementSelector?: Selector<T, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<IGrouping<TKey, T>> {
    return cast<IEnumerable<IGrouping<TKey, T>>>(
      Enumerable.from(Generator.groupBy(this, keySelector, elementSelector, comparer)),
    );
  }

  orderBy(selector: OrderSelector<T>): IOrderedEnumerable<T> {
    return OrderedEnumerable.createOrderedEnumerable(this, [{ selector, descending: false }]);
  }

  orderByDescending(selector: OrderSelector<T>): IOrderedEnumerable<T> {
    return OrderedEnumerable.createOrderedEnumerable(this, [{ selector, descending: true }]);
  }

  // next is implemented explicitly in the iterator classes
  // however, in the derived enumerable classes, we can just throw and implement the Symbol.iterator method as a generator
  // this is because the iterator classes are the ones that actually implement the iterator protocol
  // There is probably a better way to do this, but I haven't figured it out yet
  next: (...args: [] | [undefined]) => IteratorResult<T, any> = () => {
    throw new Error("Method not implemented, we use generators in this house.");
  };

  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }

  throw(e?: any): IteratorResult<T, any> {
    throw new Exception(e);
  }
}

export class Enumerable<T> extends EnumerableBase<T> implements IEnumerable<T> {
  public static from<T>(source: Iterable<T>): IEnumerable<T> {
    if (source instanceof Enumerable) return source;
    if (Array.isArray(source)) return new List<T>(source);
    if (typeof source === "string") return new List<T>(source);
    return new Enumerable<T>(source);
  }

  protected constructor(protected source: Iterable<T>) {
    super(source);
  }

  *[Symbol.iterator](): IterableIterator<T> {
    for (const item of this.source) {
      yield item;
    }
  }

  public static empty<T>(): IEnumerable<T> {
    return Enumerable.from<T>(LinqUtils.defaultSource());
  }

  public static repeat<T>(element: T, count: number): IEnumerable<T> {
    if (count < 0) return Enumerable.empty<T>();
    count = Math.floor(count);
    return Enumerable.from<T>(Generator.repeat(element, count));
  }

  public static range(start: number, count: number): IEnumerable<number> {
    (start = Math.floor(start)), (count = Math.floor(count));
    if (count < 0) return Enumerable.empty<number>();
    return Enumerable.from<number>(Generator.range(start, count));
  }
}

abstract class IteratorBase<TSource, TNext extends any = TSource>
  extends EnumerableBase<TNext & TSource>
  implements Iterable<TSource>, Iterator<TSource, TNext>
{
  protected sourceIterator = this.source[Symbol.iterator]();
  protected state = 0; // 0 = before iteration, 1 = after iteration
  public *[Symbol.iterator](): IterableIterator<TSource & TNext> {
    const iterator = this.getIterator();
    while (iterator.moveNext()) {
      yield iterator.current as TNext & TSource;
    }
  }
  constructor(protected source: IEnumerable<TSource>) {
    super(source as IEnumerable<TSource & TNext>);
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

  public abstract moveNext(): boolean;
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

  public moveNext(): boolean {
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      if (this._predicate(result.value)) {
        this.current = result.value;
        logIteration?.("WhereIterator ");
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

  public override where(predicate: (x: TSource) => boolean): IEnumerable<TSource> {
    return new WhereIterator(this.source, WhereIterator.combinePredicates(this._predicate, predicate));
  }

  public override select<TOut>(selector: (x: TSource, i: number) => TOut): IEnumerable<TOut> {
    return new WhereSelectIterator(this.source, this._predicate, selector);
  }

  private static combinePredicates<TSource>(
    predicate1: (item: TSource) => boolean,
    predicate2: (item: TSource) => boolean,
  ): (item: TSource) => boolean {
    return (item) => predicate1(item) && predicate2(item);
  }

  private static combineSelectors<TSource, TMiddle, TResult>(
    selector1: (item: TSource) => TMiddle,
    selector2: (item: TMiddle) => TResult,
  ): (item: TSource) => TResult {
    return (item) => selector2(selector1(item)) as TResult;
  }
}

abstract class IndexIterator<TSource, TNext = TSource> extends IteratorBase<TSource, TNext> {
  protected index = 0;
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
    while (true) {
      if (this.innerIterator) {
        const result = this.innerIterator.next();
        logIteration?.("SelectManyIterator ");
        if (!result.done) {
          this.current = result.value;
          return true;
        }
        this.innerIterator = null;
      }
      const sourceResult = this.sourceIterator.next();
      if (sourceResult.done) return false;
      const innerIterable = this.selector(sourceResult.value, this.index++);
      this.innerIterator = innerIterable[Symbol.iterator]();
    }
  }

  public clone(): SelectManyIterator<TSource, TResult> {
    return new SelectManyIterator<TSource, TResult>(this.source, this.selector);
  }
}

export class WhereSelectIterator<TSource, TResult> extends IndexIterator<TSource, TResult> {
  constructor(
    source: IEnumerable<TSource>,
    private predicate: Predicate<TSource> | undefined | null,
    private selector: SelectorWithIndex<TSource, TResult>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    let result;
    while (!(result = this.sourceIterator.next()).done) {
      logIteration?.("WhereSelectIterator ");
      if (!this.predicate || this.predicate(result.value)) {
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
    const data = Array.isArray(this.source) ? this.source : Array.from(this.source);
    this.sorted = data.sort((a, b) => {
      for (const criterion of this.criteria) {
        const keyA = criterion.selector(a);
        const keyB = criterion.selector(b);
        const comparison = keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
        if (comparison !== 0) {
          logIteration?.(`OrderedEnumerable sort(), comparison: ${comparison}`);
          return criterion.descending ? -comparison : comparison;
        }
      }
      return 0;
    });

    // this quick sort works correctly, but it's not as efficient as the built-in sort method
    // I'm keeping it here for testing with different data sets
    // const quickSort = (arr: any[], left: number, right: number): void => {
    //   let index;
    //   if (arr.length > 1) {
    //     index = partition(arr, left, right);
    //     if (left < index - 1) {
    //       logIteration?.(`quickSort left partition, size: ${index - 1 - left + 1}`);
    //       quickSort(arr, left, index - 1);
    //     }
    //     if (index < right) {
    //       logIteration?.(`quickSort right partition, size: ${right - index + 1}`);
    //       quickSort(arr, index, right);
    //     }
    //   }
    // };

    // const partition = (arr: any[], left: number, right: number) => {
    //   const pivot = arr[Math.floor((right + left) / 2)];
    //   let i = left;
    //   let j = right;
    //   while (i <= j) {
    //     while (compare(arr[i], pivot) < 0) {
    //       logIteration?.(`partition left pointer move, index: ${i}`);
    //       i++;
    //     }
    //     while (compare(arr[j], pivot) > 0) {
    //       logIteration?.(`partition right pointer move, index: ${j}`);
    //       j--;
    //     }
    //     if (i <= j) {
    //       logIteration?.(`partition swap, indices: ${i}, ${j}`);
    //       [arr[i], arr[j]] = [arr[j], arr[i]];
    //       i++;
    //       j--;
    //     }
    //   }
    //   return i;
    // };

    // const compare = (a: any, b: any) => {
    //   for (const criterion of this.criteria) {
    //     const keyA = criterion.selector(a);
    //     const keyB = criterion.selector(b);
    //     const comparison = keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
    //     if (comparison !== 0) {
    //       return criterion.descending ? -comparison : comparison;
    //     }
    //   }
    //   return 0;
    // };

    // const data = Array.isArray(this.source) ? this.source : Array.from(this.source);
    // quickSort(data, 0, data.length - 1);
    // this.sorted = data;
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
      logIteration?.("JoinIterator ");
      const key = this.outerKeySelector(result.value);
      const inners = this.lookup.getGrouping(key, false);
      if (inners) {
        for (const innerItem of inners) {
          logIteration?.("JoinIterator inner");
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
      const inner = Enumerable.from(this.lookup.getGrouping(key, false) ?? []);
      this.current = this.resultSelector(result.value, inner);
      logIteration?.("GroupJoinIterator ");
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

export class Grouping<TKey, TValue> extends EnumerableBase<TValue> implements IGrouping<TKey, TValue> {
  public static createGrouping<TKey, TValue>(source: Iterable<TValue>, key: TKey): IGrouping<TKey, TValue> {
    return new Grouping<TKey, TValue>(source, key);
  }

  constructor(
    protected source: Iterable<TValue>,
    public readonly key: TKey,
  ) {
    if (key === undefined || key === null) {
      throw new Error("Grouping key cannot be undefined");
    }
    super(source);
    this.key = key;
  }

  toString(): string {
    return `Grouping: ${this.key}, ${super.toString()}`;
  }

  next: (...args: [] | [undefined]) => IteratorResult<TValue> = () => {
    throw new Error("Method not implemented.");
  };

  *[Symbol.iterator](): IterableIterator<TValue> {
    for (const item of this.source) {
      logIteration?.("Grouping ");
      yield item;
    }
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
      logIteration?.("GroupingIterator ");
      const key = result.value.key;
      const grouping = result.value;
      this.current = Grouping.createGrouping<TKey, TNext>(
        (this.elementSelector ? grouping.map(this.elementSelector) : grouping) as TNext[],
        key,
      );
      return true;
    }
    return false;
  }

  public clone(): GroupingIterator<TKey, TSource, TNext> {
    return new GroupingIterator(this.source, this.keySelector, this.elementSelector, this.comparer);
  }
}

export class List<T> extends Enumerable<T> implements IList<T> {
  constructor(protected source: T[]) {
    super(source);
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (typeof prop === "string" && !isNaN(+prop)) {
          return target.get(+prop);
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, value, receiver) {
        if (typeof prop === "string" && !isNaN(+prop)) {
          target.set(+prop, value);
          return true;
        }
        return Reflect.set(target, prop, value, receiver);
      },
    });
  }

  [index: number]: T;

  get(index: number): T {
    return this.source[index];
  }

  set(index: number, value: T): void {
    this.source[index] = value;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.source;
  }

  public static from<T>(source: T[] | IEnumerable<T>): IList<T> {
    if (source instanceof List) return source;
    return new List<T>(Array.isArray(source) ? source : [...source]);
  }

  public static range(start: number, count: number): IList<number> {
    return List.from(Enumerable.range(start, count));
  }

  public static repeat<T>(element: T, count: number): IList<T> {
    return List.from(Enumerable.repeat(element, count));
  }

  public static empty<T>(): IList<T> {
    return List.from(Enumerable.empty<T>());
  }

  public get length(): number {
    return this.source.length;
  }
  private hasIndex(index: number): boolean {
    return index >= 0 && index < this.length;
  }
  indexOf(element: T): number {
    return this.source.indexOf(element);
  }
  insert(index: number, element: T): void {
    this.source.splice(index, 0, element);
  }
  removeAt(index: number): void {
    this.source.splice(index, 1);
  }
  isEmpty(): boolean {
    return this.source.length === 0;
  }
  add(element: T): boolean {
    this.source.push(element);
    return true;
  }
  remove(element: T): boolean {
    const index = this.source.indexOf(element);
    if (index === -1) return false;
    this.source.splice(index, 1);
    return true;
  }
  clear(): void {
    this.source.splice(0, this.length);
  }
  forEach(action: (element: T, index: number, list: this) => void): void {
    this.source.forEach((v, i) => action(v, i, this));
  }

  public override sum(selector?: NumericSelector<T> | undefined): number;
  public override sum(selector: NumericSelector<T>): number {
    this.throwIfEmpty();
    selector ??= (x) => x as number;
    return this.source.reduce((acc, x) => acc + selector(x), 0);
  }

  private throwIfEmpty(): void {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
  }

  public override average(selector?: NumericSelector<T> | undefined): number;
  public override average(selector: NumericSelector<T>): number {
    this.throwIfEmpty();
    return this.sum(selector) / this.length;
  }

  public override max<TOut extends Comparable>(selector?: Selector<T, TOut> | undefined): TOut {
    this.throwIfEmpty();
    if (this.source[0] instanceof Date) {
      selector ??= (x) => x as any;
      return this.source.reduce((acc, x) => (selector!(x) > acc ? selector!(x) : acc), selector(this.source[0]));
    }
    return (selector ? Math.max(...(this.source.map(selector) as any[])) : Math.max(...(this.source as any[]))) as TOut;
  }

  public override min<TOut extends Comparable>(selector?: Selector<T, TOut> | undefined): TOut {
    this.throwIfEmpty();
    if (this.source[0] instanceof Date) {
      selector ??= (x) => x as any;
      return this.source.reduce((acc, x) => (selector!(x) < acc ? selector!(x) : acc), selector(this.source[0]));
    }
    return (selector ? Math.min(...(this.source.map(selector) as any[])) : Math.min(...(this.source as any[]))) as TOut;
  }

  public override aggregate<TAccumulate, TResult = TAccumulate>(
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector?: (acc: TAccumulate) => TResult,
  ): TResult {
    const raw = this.source.reduce(func, seed);
    if (resultSelector) return resultSelector(raw);
    return raw as TResult & TAccumulate;
  }

  public override count(predicate?: Predicate<T> | undefined): number {
    return predicate ? this.source.filter(predicate).length : this.length;
  }

  public override any(predicate?: PredicateWithIndex<T> | undefined): boolean {
    return predicate ? this.source.some(predicate) : this.length > 0;
  }

  public override all(predicate: PredicateWithIndex<T>): boolean {
    return this.source.every(predicate);
  }

  public override contains(element: T): boolean {
    return this.source.includes(element);
  }

  public override elementAt(index: number): T {
    if (!this.hasIndex(index)) throw Exception.indexOutOfRange();
    return this.source[index];
  }
  public override elementAtOrDefault(index: number): T | undefined {
    return this.source[index];
  }
  public override first(predicate?: Predicate<T>): T {
    this.throwIfEmpty();
    let index = 0;
    if (predicate) {
      index = this.source.findIndex(predicate);
    }
    if (!this.hasIndex(index)) throw Exception.noMatch();
    return this.source[index];
  }

  public override firstOrDefault(predicate?: Predicate<T>): T | undefined {
    if (predicate) return this.source.find(predicate);
    return this.source[0];
  }

  public override last(predicate?: Predicate<T>): T {
    this.throwIfEmpty();
    if (predicate) return super.last(predicate);
    return this.source[this.length - 1];
  }

  public override lastOrDefault(predicate?: Predicate<T>): T | undefined {
    if (predicate) return super.lastOrDefault(predicate);
    return this.source[this.length - 1];
  }

  public override toList(): IList<T> {
    return this;
  }

  public override toArray(): T[] {
    return this.source;
  }
}

export class Lookup<TKey, T> implements Iterable<KeyedArray<TKey, T>> {
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
      logIteration?.("Lookup create ");
      const key = keySelector(item);
      lookup.getGrouping(key, true).push(elementSelector(item));
    }
    return lookup;
  }
}

class KeyedArray<TKey, T> extends Array<T> {
  constructor(public readonly key: TKey) {
    super();
  }
}

export class HashSet<T> implements IHashSet<T> {
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
export class Dictionary<TK, TV, TPrev = TV>
  extends EnumerableBase<KeyValuePair<TK, TV>>
  implements IDictionary<TK, TV>
{
  private map: Map<TK, TV>;
  constructor(
    protected source: Iterable<TPrev>,
    keySelector: (x: TPrev, index: number) => TK,
    valueSelector?: (x: TPrev, index: number) => TV,
  ) {
    const map = new Map<TK, TV>();
    let index = 0;
    for (const item of source) {
      const key = keySelector(item, index);
      const value = valueSelector ? valueSelector(item, index) : (item as TV & TPrev);
      map.set(key, value);
      index++;
    }
    super(Dictionary.fromMap(map));
    this.map = map;
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        let propKey = prop as any;
        if (typeof propKey === "string" && !isNaN(+propKey)) {
          propKey = +propKey;
        }
        return target.get(propKey);
      },
      set(target, prop, value, receiver) {
        if (prop in target) return Reflect.set(target, prop, value, receiver);
        let propKey = prop as any;
        if (typeof propKey === "string" && !isNaN(+propKey)) {
          propKey = +propKey;
        }
        target.set(propKey, value);
        return true;
      },
    }) as IDictionary<TK, TV> & Indexable<TK, TV> & any;
  }

  private static *fromMap<TK, TV>(map: Map<TK, TV>): Iterable<KeyValuePair<TK, TV>> {
    for (const [key, value] of map.entries()) {
      yield { key, value };
    }
  }

  public *[Symbol.iterator](): IterableIterator<KeyValuePair<TK, TV>> {
    for (const [key, value] of this.map.entries()) {
      yield { key, value };
    }
  }

  public get keys(): Iterable<TK> {
    return this.map.keys();
  }

  public get values(): Iterable<TV> {
    return this.map.values();
  }

  public get entries(): Iterable<[TK, TV]> {
    return this.map.entries();
  }

  public add({ key, value }: KeyValuePair<TK, TV>): boolean {
    if (this.map.has(key)) {
      throw new Error(`Key ${LinqUtils.ensureString(key)} already exists in dictionary`);
    }
    this.map.set(key, value);
    return true;
  }

  public set(key: TK, value: TV): void {
    this.map.set(key, value);
  }

  public get(key: TK): TV {
    if (!this.map.has(key)) throw Exception.invalidOperation("Key not found in dictionary");
    return this.map.get(key)!;
  }

  public remove(key: TK): boolean {
    return this.map.delete(key);
  }

  public clear(): void {
    this.map.clear();
  }

  public containsKey(key: TK): boolean {
    return this.map.has(key);
  }

  public tryGetValue(key: TK): [true, TV] | [false, undefined] {
    const hasKey = this.map.has(key);
    return [hasKey, hasKey ? this.map.get(key) : undefined] as any;
  }

  public static createDictionary<TSource, TKey, TValue>(
    source: Iterable<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector?: (x: TSource, index: number) => TValue,
  ): IDictionary<TKey, TValue> & Indexable<TKey, TValue> {
    if (!source) throw Exception.argumentNull("source");
    if (!keySelector) throw Exception.argumentNull("keySelector");
    return new Dictionary<TKey, TValue>(source as any, keySelector as any, valueSelector as any) as IDictionary<
      TKey,
      TValue
    > &
      Indexable<TKey, TValue>;
  }

  toString() {
    const entries = Array.from(this.map.entries())
      .map(([key, value]) => `${LinqUtils.ensureString(key)} => ${LinqUtils.ensureString(value)}`)
      .join(", ");
    return `Dictionary(${this.map.size}): {${entries}}`;
  }
}

export function cast<T>(source: any): T {
  return source as T;
}

function validateSource<T>(source: Iterable<T>): void {
  if (!source) throw Exception.argumentNull("source");
  if (typeof source !== "string" || !source[Symbol.iterator]) throw Exception.argument("Source must be iterable");
}
