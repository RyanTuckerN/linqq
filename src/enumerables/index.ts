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
  IEnumerable,
  IDictionary,
  IOrderedEnumerable,
  IGrouping,
  IEqualityComparer,
  IList,
  IPowerList,
  IHashSet,
  Indexable,
  Comparator,
} from "../";
import { UniversalEqualityComparer } from "../util/equality-comparers.ts";
import { Generator } from "../operations/generator";
import { Operation } from "../operations/operation";
import { Exception } from "../validator/exception";
import { Utils } from "../util";
import util from "util";
import { Sort, defaultComparator } from "../operations/sort";

export class Enumerable<T> implements IEnumerable<T> {
  public static from<T>(source: Iterable<T>): IEnumerable<T> {
    if (typeof source === "string" || Array.isArray(source)) return new List<T>(source);
    if (source instanceof Enumerable) return source;
    return new Enumerable<T>(source);
  }

  protected constructor(protected source: Iterable<T>) {}

  *[Symbol.iterator](): IterableIterator<T> {
    yield* this.source;
  }

  [util.inspect.custom](): string {
    return this.toString();
  }

  toString(): string {
    return `${this.constructor.name} { ${this.toArray().join(", ")} }`;
  }

  ensureList(): IList<T> {
    if (this instanceof List) return this;
    return this.toList();
  }

  toList(): IList<T> {
    return List.from(this);
  }

  toPowerList(): IPowerList<T> {
    return <IPowerList<T>>List.from(this); // All Lists are PowerLists, but we only expose the interface if it's explicitly requested since it has a lot of extra methods.
  }

  toArray(): T[] {
    return [...this];
  }

  toHashSet(comparer?: IEqualityComparer<T>): HashSet<T> {
    return new HashSet(this, comparer);
  }

  toSet(): Set<T> {
    return new Set(this);
  }

  cast<TOut>(): IEnumerable<TOut> {
    return Utils.cast<IEnumerable<TOut>>(this);
  }

  where(predicate: Predicate<T> | PredicateWithIndex<T>): IEnumerable<T> {
    if (!predicate) throw Exception.argumentNull("predicate");
    if (predicate.length > 1) return new Enumerable<T>(Generator.where(this, predicate));
    let iterable: IEnumerable<T> | any;
    if (Array.isArray(this.source)) {
      iterable = new WhereArrayIterator(this.source, predicate as Predicate<T>);
    } else if (this instanceof List) {
      iterable = new WhereArrayIterator(this.toArray(), predicate as Predicate<T>);
    } else {
      iterable = new WhereIterator(this, predicate as Predicate<T>);
    }
    return Utils.cast<IEnumerable<T>>(iterable);
  }

  select<TOut>(selector: (x: T, i: number) => TOut): IEnumerable<TOut> {
    if (!selector) throw Exception.argumentNull("selector");
    let iterable: IEnumerable<TOut> | any;
    if (Array.isArray(this.source)) {
      iterable = new WhereSelectArrayIterator(this.source, undefined, selector);
    } else if (this instanceof List) {
      iterable = new WhereSelectArrayIterator(this.toArray(), undefined, selector);
    } else {
      iterable = new WhereSelectIterator(this, undefined, selector);
    }
    return Utils.cast<IEnumerable<TOut>>(iterable);
  }

  selectMany<TOut>(selector: SelectorWithIndex<T, Iterable<TOut>>): IEnumerable<TOut> {
    if (!selector) throw Exception.argumentNull("selector");
    return Utils.cast<IEnumerable<TOut>>(new SelectManyIterator<T, TOut>(this, selector));
  }

  aggregate<TAccumulate, TResult = TAccumulate>(
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector?: (acc: TAccumulate) => TResult,
  ): TResult {
    if (!this) throw Exception.argumentNull("source");
    if (!func) throw Exception.argumentNull("func");
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
    if (!keySelector) throw Exception.argumentNull("keySelector");
    return Dictionary.createDictionary<T, TKey, TOut>(this, keySelector, valueSelector);
  }

  count(predicate?: Predicate<T> | undefined): number {
    return Operation.count(this, predicate);
  }

  sum(selector?: NumericSelector<T> | undefined): number;
  sum(selector: NumericSelector<T>): number {
    return Operation.sum(this, selector);
  }

  average(selector?: Partial<NumericSelector<T>> | undefined): number;
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
    if (!inner) throw Exception.argumentNull("inner");
    if (!outerKeySelector) throw Exception.argumentNull("outerKeySelector");
    if (!innerKeySelector) throw Exception.argumentNull("innerKeySelector");
    if (!resultSelector) throw Exception.argumentNull("resultSelector");
    return Utils.cast<IEnumerable<TOut>>(
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
    if (!inner) throw Exception.argumentNull("inner");
    if (!outerKeySelector) throw Exception.argumentNull("outerKeySelector");
    if (!innerKeySelector) throw Exception.argumentNull("innerKeySelector");
    if (!resultSelector) throw Exception.argumentNull("resultSelector");
    return Utils.cast<IEnumerable<TOut>>(
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
    if (!predicate) throw Exception.argumentNull("predicate");
    return Operation.all(this, predicate);
  }

  contains(element: T): boolean {
    return this.any((x) => x === element);
  }

  take(count: number): IEnumerable<T> {
    if (count < 0) count = 0;
    return Enumerable.from(Generator.take(this, count));
  }

  takeWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    if (!predicate) throw Exception.argumentNull("predicate");
    return Enumerable.from(Generator.takeWhile(this, predicate));
  }

  skip(count: number): IEnumerable<T> {
    count = Math.floor(count);
    if (count < 0) count = 0;
    return Enumerable.from(Generator.skip(this, count));
  }

  skipWhile(predicate: PredicateWithIndex<T>): IEnumerable<T> {
    if (!predicate) throw Exception.argumentNull("predicate");
    return Enumerable.from(Generator.skipWhile(this, predicate));
  }

  distinct(): IEnumerable<T> {
    return Enumerable.from(Generator.distinct(this));
  }

  distinctBy<TOut>(selector: Selector<T, TOut>): IEnumerable<T> {
    if (!selector) throw Exception.argumentNull("selector");
    return Enumerable.from(Generator.distinctBy(this, selector));
  }

  union(other: IEnumerable<T> | T[], comparer?: IEqualityComparer<T>): IEnumerable<T> {
    return Enumerable.from(Generator.union(this, other, comparer));
  }

  intersect(other: IEnumerable<T> | T[], comparer: IEqualityComparer<T>): IEnumerable<T> {
    if (!other) throw Exception.argumentNull("other");
    return Enumerable.from(Generator.intersect(this, other, comparer));
  }

  except(other: IEnumerable<T> | T[], comparer: IEqualityComparer<T>): IEnumerable<T> {
    if (!other) throw Exception.argumentNull("other");
    return Enumerable.from(Generator.except(this, other, comparer));
  }

  concat(...args: Iterable<T>[]): IEnumerable<T> {
    if (!args.length) throw Exception.argumentNull("args");
    return Enumerable.from(Generator.concat(this, ...args));
  }

  zip<TOut, TSecond = T>(second: Iterable<TSecond>, selector: (f: T, s: TSecond) => TOut): IEnumerable<TOut> {
    if (!second) throw Exception.argumentNull("second");
    if (!selector) throw Exception.argumentNull("selector");
    return Enumerable.from(Generator.zip(this, second, selector));
  }

  groupBy<TKey, TNext = T>(
    keySelector: Selector<T, TKey>,
    elementSelector?: Selector<T, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<IGrouping<TKey, T>> {
    return new GroupingIterator(this, keySelector, elementSelector, comparer) as IEnumerable<IGrouping<TKey, T>>;
  }

  sequenceEqual(other: Iterable<T>, comparer?: IEqualityComparer<T> | undefined): boolean {
    return Operation.sequenceEqual(this, other, comparer);
  }

  orderBy(selector: OrderSelector<T>): IOrderedEnumerable<T> {
    return OrderedEnumerable.createOrderedEnumerable(this, [{ selector, descending: false }]);
  }

  orderByDescending(selector: OrderSelector<T>): IOrderedEnumerable<T> {
    return OrderedEnumerable.createOrderedEnumerable(this, [{ selector, descending: true }]);
  }

  public static empty<T>(): IEnumerable<T> {
    return Enumerable.from<T>(Utils.defaultSource());
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

  public static generateFrom<TState, TOut>(
    initial: TState,
    predicate: Predicate<TState>,
    action: (state: TState) => TState,
    selector: Selector<TState, TOut>,
  ): IEnumerable<TOut> {
    if (!predicate) throw Exception.argumentNull("predicate");
    if (!selector) throw Exception.argumentNull("selector");
    if (!action) throw Exception.argumentNull("action");
    return Enumerable.from<TOut>(Generator.generateFrom({ initial, predicate, selector, action }));
  }
}

abstract class IteratorBase<TSource, TNext extends any = TSource> extends Enumerable<TSource> {
  protected sourceIterator = this.source[Symbol.iterator]();
  protected state = 0; // 0 = before iteration, 1 = during iteration, 2 = after iteration
  public [Symbol.iterator](): IterableIterator<TSource & TNext> {
    return this.getIterator();
  }
  next(): IteratorResult<TSource & TNext> {
    // prettier-ignore
    return (
      this.moveNext() 
        ? { done: false, value: this.current } 
        : { done: this._done(), value: undefined }
      ) as IteratorResult<TSource & TNext>;
  }

  private _done(): true {
    this.current = undefined as TNext;
    this.state = 2; // 2 = done
    return true;
  }

  constructor(protected source: Iterable<TSource>) {
    super(source as Iterable<TSource & TNext>);
  }
  protected current!: TNext;
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

class WhereIterator<TSource> extends IteratorBase<TSource> {
  constructor(
    protected source: IEnumerable<TSource>,
    private _predicate: Predicate<TSource>,
  ) {
    super(source);
  }

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

  public clone(): IteratorBase<TSource> {
    return new WhereIterator(this.source, this._predicate);
  }

  public override where(predicate: Predicate<TSource> | PredicateWithIndex<TSource>): IEnumerable<TSource> {
    if (predicate.length > 1) return super.where(predicate);
    return new WhereIterator(this.source, Utils.combinePredicates(this._predicate, predicate as Predicate<TSource>));
  }

  public override select<TOut>(selector: (x: TSource, i: number) => TOut): IEnumerable<TOut> {
    return Utils.cast<IEnumerable<TOut>>(new WhereSelectIterator(this.source, this._predicate, selector));
  }
}

class WhereArrayIterator<TSource> extends IteratorBase<TSource> {
  private index = 0;
  constructor(
    protected source: TSource[],
    private _predicate: Predicate<TSource>,
  ) {
    super(source);
  }

  public get predicate(): Predicate<TSource> {
    return this._predicate;
  }

  public moveNext(): boolean {
    while (this.index < this.source.length) {
      const item = this.source[this.index++];
      if (this._predicate(item)) {
        this.current = item;
        return true;
      }
    }
    return false;
  }

  public clone(): IteratorBase<TSource> {
    return new WhereArrayIterator(this.source, this._predicate);
  }

  public override where(predicate: Predicate<TSource> | PredicateWithIndex<TSource>): IEnumerable<TSource> {
    if (predicate.length > 1) return super.where(<PredicateWithIndex<TSource>>predicate);
    return new WhereArrayIterator(this.source, Utils.combinePredicates(this._predicate, <Predicate<TSource>>predicate));
  }

  public override select<TOut>(selector: SelectorWithIndex<TSource, TOut>): IEnumerable<TOut> {
    return Utils.cast<IEnumerable<TOut>>(new WhereSelectArrayIterator(this.source, this._predicate, selector));
  }
}

class WhereSelectIterator<TSource, TResult> extends IteratorBase<TSource, TResult> {
  private index = 0;
  constructor(
    source: Iterable<TSource>,
    private predicate: Predicate<TSource> | undefined | null,
    private selector: SelectorWithIndex<TSource, TResult>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    let result;
    while (!(result = this.sourceIterator.next()).done) {
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

class WhereSelectArrayIterator<TSource, TOut> extends IteratorBase<TSource, TOut> {
  private index = 0;
  constructor(
    protected source: TSource[],
    private _predicate: Predicate<TSource> | undefined | null,
    private _selector: (item: TSource, index: number) => TOut,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    while (this.index < this.source.length) {
      const item = this.source[this.index++];
      if (!this._predicate || this._predicate(item)) {
        this.current = this._selector(item, this.index - 1);
        return true;
      }
    }
    return false;
  }

  public clone(): IteratorBase<TSource, TOut> {
    return new WhereSelectArrayIterator(this.source, this._predicate, this._selector);
  }

  public override select<TNext>(selector: (x: TSource, i: number) => TNext): IEnumerable<TNext> {
    if (this._selector.length === 1) {
      return Utils.cast<IEnumerable<TNext>>(
        new WhereSelectArrayIterator(
          this.source,
          this._predicate,
          Utils.combineSelectors(this._selector as any, selector as any),
        ),
      );
    }
    return super.select(selector);
  }

  public override where(predicate: (x: TSource) => boolean): IEnumerable<TSource> {
    return new WhereIterator(Utils.cast(this), predicate);
  }
}

class SelectManyIterator<TSource, TResult> extends IteratorBase<TSource, TResult> {
  private index = 0;
  private innerIterator: Iterator<TResult> | null = null;

  constructor(
    source: Iterable<TSource>,
    private selector: SelectorWithIndex<TSource, Iterable<TResult>>,
  ) {
    super(source);
  }

  public moveNext(): boolean {
    while (true) {
      if (this.innerIterator) {
        const result = this.innerIterator.next();
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

class OrderedEnumerable<T> extends IteratorBase<T> implements IOrderedEnumerable<T> {
  private index = 0;
  private sorted: T[] | null = null;
  public static createOrderedEnumerable<T>(
    source: Iterable<T>,
    sortExpressions: Sorter<T>[] = [],
  ): IOrderedEnumerable<T> {
    return new OrderedEnumerable<T>(source, sortExpressions);
  }
  constructor(
    source: Iterable<T>,
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
    //       quickSort(arr, left, index - 1);
    //     }
    //     if (index < right) {
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
    //       i++;
    //     }
    //     while (compare(arr[j], pivot) > 0) {
    //       j--;
    //     }
    //     if (i <= j) {
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

class JoinIterator<TOuter, TInner, TKey, TResult> extends IteratorBase<TOuter, TResult> {
  private lookup: Lookup<TKey, TInner> | null = null;

  constructor(
    source: Iterable<TOuter>,
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

class GroupJoinIterator<TOuter, TInner, TKey, TResult> extends IteratorBase<TOuter, TResult> {
  private lookup: Lookup<TKey, TInner> | null = null;

  constructor(
    source: Iterable<TOuter>,
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
      this.current = this.resultSelector(
        result.value,
        Enumerable.from(this.lookup.getGrouping(this.outerKeySelector(result.value), false) ?? []),
      );
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

export class Grouping<TKey, TValue> extends Enumerable<TValue> implements IGrouping<TKey, TValue> {
  public static createGrouping<TKey, TValue>(source: Iterable<TValue>, key: TKey): IGrouping<TKey, TValue> {
    return new Grouping<TKey, TValue>(source, key);
  }

  constructor(
    protected source: Iterable<TValue>,
    public readonly key: TKey,
  ) {
    if (key === undefined || key === null) throw Exception.argumentNull("key");
    super(source);
    this.key = key;
  }

  toString(): string {
    return `Grouping: ${this.key}, ${super.toString()}`;
  }
}

class GroupingIterator<TKey, TSource, TNext = TSource> extends IteratorBase<TSource, IGrouping<TKey, TNext>> {
  private lookup?: Lookup<TKey, TSource>;
  private lookupIterator?: Iterator<KeyedArray<TKey, TSource>>;
  constructor(
    source: Iterable<TSource>,
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

export class List<T> extends Enumerable<T> implements IPowerList<T> {
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

  private throwIfEmpty(): void {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
  }

  get(index: number): T {
    return this.source[index];
  }

  set(index: number, value: T): void {
    this.source[index] = value;
  }

  public static from<T>(source: T[] | IEnumerable<T>): IPowerList<T> {
    if (source instanceof List) return source;
    let newSource = source;
    if (!Array.isArray(source)) {
      newSource = Array.from(source);
    }

    return new List<T>(newSource as T[]);
  }

  public static range(start: number, count: number): IList<number> {
    return List.from(Enumerable.range(start, count));
  }

  public static repeat<T>(element: T, count: number): IList<T> {
    return List.from(Enumerable.repeat(element, count));
  }

  public static empty<T>(): IList<T> {
    return List.from<T>([]);
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
  addRange(elements: Iterable<T> | T[]): number {
    if (Array.isArray(elements)) {
      this.source.concat(elements);
      return elements.length;
    } else {
      const prevLength = this.length;
      return this.source.push(...elements) - prevLength;
    }
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
  partition(predicate: (element: T) => boolean): [IPowerList<T>, IPowerList<T>] {
    return this.aggregate([List.empty<T>(), List.empty<T>()], (acc, x) => {
      acc[predicate(x) ? 0 : 1].add(x);
      return acc;
    });
  }
  shuffle(): IPowerList<T> {
    return (this.deepClone() as IPowerList<T>).shuffleInPlace();
  }
  shuffleInPlace(): this {
    const array = this.source;
    let currentIndex = array.length,
      randomIndex: number;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return this;
  }
  rotate(steps: number): IPowerList<T> {
    return (this.deepClone() as IPowerList<T>).rotateInPlace(steps);
  }
  rotateInPlace(steps: number): this {
    if (this.isEmpty()) return this;
    const index = steps % this.length;
    if (index < 0) {
      this.source.unshift(...this.source.splice(this.length + index, -index));
    } else {
      this.source.push(...this.source.splice(0, index));
    }
    return this;
  }
  deepClone(): IPowerList<T> {
    return List.from(this.source.map((x) => structuredClone(x)));
  }
  reverseInPlace(): this {
    this.source.reverse();
    return this;
  }
  transform<TOut>(selector: (element: T, index: number, list: this) => TOut): IPowerList<TOut> {
    this.source.forEach((v, i) => ((this.source as any[])[i] = selector(v, i, this)));
    return Utils.cast<IPowerList<TOut>>(this);
  }
  maxBy(selector: (element: T) => number): T {
    return this.aggregate(this.source[0], (max, x) => (selector(x) > selector(max) ? x : max));
  }
  minBy(selector: (element: T) => number): T {
    return this.aggregate(this.source[0], (min, x) => (selector(x) < selector(min) ? x : min));
  }
  paginate(pageSize: number, pageNumber = 1): IPowerList<T> {
    if (pageSize == undefined) Exception.argumentNull("pageSize");
    if (pageSize <= 0) return <IPowerList<T>>List.empty<T>();
    return List.from(this.source.slice(pageSize * (pageNumber - 1), pageSize * pageNumber));
  }
  frequencies(): IDictionary<T, number> {
    return this.aggregate(Dictionary.fromMap(new Map()), (acc, x) => {
      acc.set(x, (acc.containsKey(x) ? acc.get(x) : 0) + 1);
      return acc;
    });
  }
  top(n: number, comparator: Comparator<T> = defaultComparator): IPowerList<T> {
    return List.from(this.source.slice().sort(comparator).slice(0, n));
  }
  bottom(n: number, comparator: Comparator<T> = defaultComparator): IPowerList<T> {
    return List.from(this.source.slice().sort(comparator).slice(-n));
  }
  getRandom(): T {
    return this.source[Math.floor(Math.random() * this.length)];
  }
  popRandom(): T {
    return this.source.splice(Math.floor(Math.random() * this.length), 1)[0];
  }
  sample(count: number): IPowerList<T> {
    if (count <= 0) return <IPowerList<T>>List.empty<T>();
    if (count > this.length) return this.shuffle();
    let seen = new Set<number>();
    let result = new Array<T>(count);
    while (count) {
      const rand = Math.floor(Math.random() * this.length);
      if (!seen.has(rand)) {
        seen.add(rand);
        result[--count] = this.source[rand];
      }
    }
    return List.from(result);
  }
  sort(comparator?: Comparator<T> | undefined): this {
    Sort.sort(this.source, comparator);
    return this;
  }
  mergeSort(comparator?: Comparator<T>): this {
    Sort.mergeSort(this.source, comparator);
    return this;
  }
  quickSort(comparator?: Comparator<T>): this {
    Sort.quickSort(this.source, comparator);
    return this;
  }
  bubbleSort(comparator?: Comparator<T>): this {
    Sort.bubbleSort(this.source, comparator);
    return this;
  }
  insertionSort(comparator?: Comparator<T>): this {
    Sort.insertionSort(this.source, comparator);
    return this;
  }
  selectionSort(comparator?: Comparator<T>): this {
    Sort.selectionSort(this.source, comparator);
    return this;
  }
  heapSort(comparator?: Comparator<T>): this {
    Sort.heapSort(this.source, comparator);
    return this;
  }
  shellSort(comparator?: Comparator<T>): this {
    Sort.shellSort(this.source, comparator);
    return this;
  }
  stdDeviation(selector?: Selector<T, number>): number {
    return Math.sqrt(this.variance(selector));
  }
  mean(selector?: Selector<T, number>): number {
    return this.average(selector);
  }
  median(selector?: Selector<T, number>): number {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    const sorted = this.source.slice().sort((a, b) => selector(a) - selector(b));
    const mid = Math.floor(this.length / 2);
    return this.length % 2 === 0 ? (selector(sorted[mid - 1]) + selector(sorted[mid])) / 2 : selector(sorted[mid]);
  }
  mode(selector?: Selector<T, number>): IPowerList<number> {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    const f = this.frequencies();
    const max = f.max((x) => x.value);
    return List.from(f.where((x) => x.value === max).select((x) => x.value));
  }
  variance(selector?: Selector<T, number>): number {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    const mean = this.mean(selector);
    return this.aggregate(0, (acc, x) => acc + Math.pow(selector(x) - mean, 2)) / this.length;
  }
  percentile(percentile: number, selector?: Selector<T, number>): number {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    const sorted = this.source.slice().sort((a, b) => selector(a) - selector(b));
    const index = Math.floor((percentile / 100) * this.length);
    return selector(sorted[index]);
  }
  product(selector?: Selector<T, number>): number {
    selector ??= (x) => x as number;
    return this.aggregate(1, (acc, x) => acc * selector(x));
  }
  harmonicMean(selector?: Selector<T, number>): number {
    selector ??= (x) => x as number;
    return this.length / this.aggregate(0, (acc, x) => acc + 1 / selector(x));
  }
  geometricMean(selector?: Selector<T, number>): number {
    selector ??= (x) => x as number;
    return Math.pow(this.product(selector), 1 / this.length);
  }
  minMax(selector?: Selector<T, number>): { min: number; max: number } {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    let min = selector(this.source[0]);
    let max = min;
    for (const item of this.source) {
      const value = selector(item);
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
    return { min, max };
  }
  minMaxBy(selector: Selector<T, number>): { min: T; max: T } {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    let min = this.source[0];
    let max = min;
    for (const item of this.source) {
      min = selector(item) < selector(min) ? item : min;
      max = selector(item) > selector(max) ? item : max;
    }
    return { min, max };
  }
  range(selector?: Selector<T, number>): number {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    const { min, max } = this.minMax(selector);
    return max - min;
  }
  normalize(selector?: Selector<T, number>): IPowerList<number> {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    const { min, max } = this.minMax(selector);
    return List.from(this.source.map((x) => (selector(x) - min) / (max - min)));
  }
  cumulativeSum(selector?: Selector<T, number>): IPowerList<number> {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    let sum = 0;
    return List.from(this.source.map((x) => (sum += selector(x))));
  }

  chunk(size: number): IPowerList<IPowerList<T>> {
    if (size <= 0) throw Exception.argument("size must be greater than 0");
    const result = List.empty<IPowerList<T>>();
    for (let i = 0; i < this.length; i += size) {
      result.add(List.from(this.source.slice(i, i + size)));
    }
    return result as IPowerList<IPowerList<T>>;
  }

  scan<TAccumulate>(
    seed: TAccumulate,
    accumulator: (acc: TAccumulate, value: T) => TAccumulate,
  ): IPowerList<TAccumulate> {
    const result = List.empty<TAccumulate>();
    let acc = seed;
    for (const item of this.source) {
      acc = accumulator(acc, item);
      result.add(acc);
    }
    return result as IPowerList<TAccumulate>;
  }

  window(size: number): IPowerList<IPowerList<T>> {
    if (size <= 0) throw Exception.argument("size must be greater than 0");
    const result = List.empty<IPowerList<T>>();
    for (let i = 0; i < this.length - size + 1; i++) {
      result.add(List.from(this.source.slice(i, i + size)));
    }
    return result as IPowerList<IPowerList<T>>;
  }

  public override sum(selector?: NumericSelector<T> | undefined): number;
  public override sum(selector: NumericSelector<T>): number {
    selector ??= (x) => x as number;
    return this.source.reduce((acc, x) => acc + selector(x), 0);
  }

  public override average(selector?: NumericSelector<T> | undefined): number;
  public override average(selector: NumericSelector<T>): number {
    this.throwIfEmpty();
    return this.sum(selector) / this.length;
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

  [Symbol.iterator](): IterableIterator<T> {
    return this.source[Symbol.iterator]();
  }
}

export class Lookup<TKey, T> implements Iterable<KeyedArray<TKey, T>> {
  private map: Map<string, KeyedArray<TKey, T>>;
  *[Symbol.iterator]() {
    yield* this.map.values();
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
    source: Iterable<TValue>,
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
  constructor(public readonly key: TKey) {
    super();
  }
}

export class HashSet<T> extends Enumerable<T> implements IHashSet<T> {
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
    return List.from(this.toArray());
  }
  [Symbol.iterator](): IterableIterator<T> {
    return this.map.values();
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

// @ts-ignore - we apply the transformation upon construction as well as in the iterator
export class Dictionary<TK, TV, TPrev = TV> extends Enumerable<KeyValuePair<TK, TV>> implements IDictionary<TK, TV> {
  private map: Map<TK, TV>;
  private constructor(
    source: Iterable<TPrev>,
    keySelector?: (x: TPrev, index: number) => TK,
    valueSelector?: (x: TPrev, index: number) => TV,
  ) {
    if (source instanceof Map) {
      super(Dictionary.fromMapToIterable(source as Map<TK, TV>));
      this.map = source as Map<TK, TV>;
      return Dictionary.constructProxy(this);
    }

    if (!keySelector) throw Exception.argumentNull("keySelector");

    const map = new Map<TK, TV>();
    let index = 0;
    for (const item of source) {
      map.set(keySelector(item, index), valueSelector ? valueSelector(item, index) : (item as TV & TPrev));
      index++;
    }
    super(Dictionary.fromMapToIterable(map));
    this.map = map;
    return Dictionary.constructProxy(this);
  }

  public static fromMap<TK, TV>(map: Map<TK, TV>): IDictionary<TK, TV> {
    return new Dictionary(map);
  }

  private static constructProxy<TK, TV>(target: Dictionary<TK, TV>) {
    return new Proxy(target, {
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

  private static *fromMapToIterable<TK, TV>(map: Map<TK, TV>): Iterable<KeyValuePair<TK, TV>> {
    for (const [key, value] of map.entries()) {
      yield { key, value };
    }
  }

  public *[Symbol.iterator](): IterableIterator<KeyValuePair<TK, TV>> {
    yield* Dictionary.fromMapToIterable(this.map);
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
      throw new Error(`Key ${Utils.ensureString(key)} already exists in dictionary`);
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
      .map(([key, value]) => `${Utils.ensureString(key)} => ${Utils.ensureString(value)}`)
      .join(", ");
    return `Dictionary(${this.map.size}): {${entries}}`;
  }
}