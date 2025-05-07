import { EnumerableBase } from "@core/enumerable-base";
import { defaultComparator, Sort } from "src/operations/sort";
import { Exception } from "src/validator/exception";
import type { IDictionary } from "@interfaces/IDictionary";
import type { IEnumerable } from "@interfaces/IEnumerable";
import type { IList } from "@interfaces/IList";
import type { IExtendedList } from "@interfaces/IExtendedList";
import type { Comparator, Selector, Predicate, PredicateWithIndex, NumericSelector } from "src/types";
import { Dictionary } from "./dictionary";

export class List<T> extends EnumerableBase<T> implements IExtendedList<T> {
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
    if (!this.hasIndex(index)) throw Exception.indexOutOfRange();
    return this.source[index];
  }

  set(index: number, value: T): void {
    this.source[index] = value;
  }

  public static from<T>(source: T[] | IEnumerable<T>): IExtendedList<T> {
    if (source instanceof List) return source;
    let newSource = source;
    if (!Array.isArray(source)) {
      newSource = [...source];
    }

    return new List<T>(newSource as T[]);
  }

  public static range(start: number, count: number): IList<number> {
    return List.from(Array.from({ length: count }, (_, i) => start + i));
  }

  public static repeat<T>(element: T, count: number): IList<T> {
    return List.from(Array.from({ length: count }, () => element));
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
      this.source = this.source.concat(elements);
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
  partition(predicate: (element: T) => boolean): [IExtendedList<T>, IExtendedList<T>] {
    return this.aggregate([List.empty<T>(), List.empty<T>()], (acc, x) => {
      acc[predicate(x) ? 0 : 1].add(x);
      return acc;
    });
  }
  shuffle(): IExtendedList<T> {
    return (this.deepClone() as IExtendedList<T>).shuffleInPlace();
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
  rotate(steps: number): IExtendedList<T> {
    return (this.deepClone() as IExtendedList<T>).rotateInPlace(steps);
  }
  rotateInPlace(steps: number): this {
    if (this.isEmpty()) return this;
    const len = this.length;
    const normalizedSteps = ((steps % len) + len) % len; // Handle negative steps
    if (normalizedSteps === 0) return this;

    if (normalizedSteps > 0) {
      this.source.unshift(...this.source.splice(len - normalizedSteps, normalizedSteps));
    } else {
      this.source.push(...this.source.splice(0, -normalizedSteps));
    }
    return this;
  }
  deepClone(): IExtendedList<T> {
    return List.from(this.source.map((x) => structuredClone(x)));
  }
  reverseInPlace(): this {
    this.source.reverse();
    return this;
  }
  transform<TOut>(selector: (element: T, index: number, list: this) => TOut): IExtendedList<TOut> {
    this.source.forEach((v, i) => ((this.source as any[])[i] = selector(v, i, this)));
    return this as unknown as IExtendedList<TOut>;
  }
  maxBy(selector: (element: T) => number): T {
    return this.aggregate(this.source[0], (max, x) => (selector(x) > selector(max) ? x : max));
  }
  minBy(selector: (element: T) => number): T {
    return this.aggregate(this.source[0], (min, x) => (selector(x) < selector(min) ? x : min));
  }
  paginate(pageSize: number, pageNumber = 1): IExtendedList<T> {
    if (pageSize == undefined) Exception.argumentNull("pageSize");
    if (pageSize <= 0) return <IExtendedList<T>>List.empty<T>();
    return List.from(this.source.slice(pageSize * (pageNumber - 1), pageSize * pageNumber));
  }
  frequencies(): IDictionary<T, number> {
    return this.aggregate(Dictionary.fromMap(new Map()), (acc, x) => {
      acc.set(x, (acc.containsKey(x) ? acc.get(x) : 0) + 1);
      return acc;
    });
  }
  top(n: number, comparator: Comparator<T> = defaultComparator): IExtendedList<T> {
    return List.from(this.source.slice().sort(comparator).slice(0, n));
  }
  bottom(n: number, comparator: Comparator<T> = defaultComparator): IExtendedList<T> {
    return List.from(this.source.slice().sort(comparator).slice(-n));
  }
  getRandom(): T {
    return this.source[Math.floor(Math.random() * this.length)];
  }
  popRandom(): T {
    return this.source.splice(Math.floor(Math.random() * this.length), 1)[0];
  }
  sample(count: number): IExtendedList<T> {
    if (count <= 0) return <IExtendedList<T>>List.empty<T>();
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

  heapSort(comparator?: Comparator<T>): this {
    Sort.heapSort(this.source, comparator);
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
  mode(selector?: Selector<T, number>): number {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;

    const valueFreq = new Map<number, number>();
    for (const item of this.source) {
      const value = selector(item);
      valueFreq.set(value, (valueFreq.get(value) || 0) + 1);
    }

    let maxFreq = 0;
    let mode: number | null = null;

    for (const [value, freq] of valueFreq.entries()) {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = value;
      }
    }

    return mode!;
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

    if (percentile < 0) percentile = 0;
    if (percentile > 100) percentile = 100;

    const sorted = this.source.slice().sort((a, b) => selector(a) - selector(b));

    const index = Math.ceil((percentile / 100) * this.length) - 1;

    const boundedIndex = Math.max(0, Math.min(index, this.length - 1));

    return selector(sorted[boundedIndex]);
  }
  product(selector?: Selector<T, number>): number {
    selector ??= (x) => x as number;
    return this.aggregate(1, (acc, x) => acc * selector(x));
  }
  harmonicMean(selector?: Selector<T, number>): number {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    return this.length / this.aggregate(0, (acc, x) => acc + 1 / selector(x));
  }
  geometricMean(selector?: Selector<T, number>): number {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
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
    let sel;
    for (const item of this.source) {
      sel = selector(item);
      min = sel < selector(min) ? item : min;
      max = sel > selector(max) ? item : max;
    }
    return { min, max };
  }
  range(selector?: Selector<T, number>): number {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    const { min, max } = this.minMax(selector);
    return max - min;
  }
  normalize(selector?: Selector<T, number>): IExtendedList<number> {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    const { min, max } = this.minMax(selector);
    return List.from(this.source.map((x) => (selector(x) - min) / (max - min)));
  }
  cumulativeSum(selector?: Selector<T, number>): IExtendedList<number> {
    if (this.isEmpty()) throw Exception.sequenceEmpty();
    selector ??= (x) => x as number;
    let sum = 0;
    return List.from(this.source.map((x) => (sum += selector(x))));
  }

  chunk(size: number): IExtendedList<IExtendedList<T>> {
    if (size <= 0) throw Exception.argument("size must be greater than 0");
    const result = List.empty<IExtendedList<T>>();
    for (let i = 0; i < this.length; i += size) {
      result.add(List.from(this.source.slice(i, i + size)));
    }
    return result as IExtendedList<IExtendedList<T>>;
  }

  scan<TAccumulate>(
    seed: TAccumulate,
    accumulator: (acc: TAccumulate, value: T) => TAccumulate,
  ): IExtendedList<TAccumulate> {
    const result = List.empty<TAccumulate>();
    let acc = seed;
    for (const item of this.source) {
      acc = accumulator(acc, item);
      result.add(acc);
    }
    return result as IExtendedList<TAccumulate>;
  }

  window(size: number): IExtendedList<IExtendedList<T>> {
    if (size <= 0) throw Exception.argument("size must be greater than 0");
    const result = List.empty<IExtendedList<T>>();
    for (let i = 0; i < this.length - size + 1; i++) {
      result.add(List.from(this.source.slice(i, i + size)));
    }
    return result as IExtendedList<IExtendedList<T>>;
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
