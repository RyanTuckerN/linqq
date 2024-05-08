import { Comparable, Predicate, PredicateWithIndex, Selector } from "../types";
import { IEqualityComparer } from "../interfaces";
import { Exception } from "../validator/exception";

export class Operation {
  public static aggregate<T, TAccumulate, TResult>(
    source: Iterable<T>,
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector?: (acc: TAccumulate) => TResult,
  ): TResult {
    let acc = seed;
    for (const item of source) {
      acc = func(acc, item);
    }
    return resultSelector ? resultSelector(acc) : (acc as T & TResult);
  }

  public static max<T, TOut extends Comparable>(source: Iterable<T>, selector?: Selector<T, TOut> | undefined): TOut {
    let max: TOut | undefined = undefined;
    for (const item of source) {
      const value = selector ? selector(item) : (item as unknown as TOut);
      if (max === undefined || value > max) max = value;
    }
    if (max === undefined) throw Exception.sequenceEmpty();
    return max;
  }

  public static min<T, TOut extends Comparable>(source: Iterable<T>, selector?: Selector<T, TOut> | undefined): TOut {
    let min: TOut | undefined = undefined;
    for (const item of source) {
      const value = selector ? selector(item) : (item as unknown as TOut);
      if (min === undefined || value < min) min = value;
    }
    if (min === undefined) throw Exception.sequenceEmpty();
    return min;
  }

  public static count<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): number {
    let count = 0;
    for (const item of source) {
      if (!predicate || predicate(item)) count++;
    }
    return count;
  }

  public static sum<T>(source: Iterable<T>, selector?: Selector<T, number> | undefined): number {
    selector ??= (x) => x as number;
    let sum = 0;
    for (const item of source) {
      sum += selector(item);
    }
    return sum as number;
  }

  public static average<T>(source: Iterable<T>, selector?: Selector<T, number> | undefined): number {
    selector ??= (x) => x as number;
    let sum = 0;
    let count = 0;
    for (const item of source) {
      sum += selector(item);
      count++;
    }
    if (count === 0) throw Exception.sequenceEmpty();
    return (sum / count) as number;
  }

  public static elementAtOrDefault<T>(source: Iterable<T>, index: number): T | undefined {
    let i = 0;
    for (const item of source) if (i++ === index) return item;
    return undefined;
  }

  public static elementAt<T>(source: Iterable<T>, index: number): T {
    const el = this.elementAtOrDefault(source, index);
    if (el === undefined) throw Exception.indexOutOfRange();
    return el;
  }

  public static first<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T {
    const el = this.firstOrDefault(source, predicate);
    if (el === undefined) throw Exception.sequenceEmpty();
    return el;
  }

  public static firstOrDefault<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T | undefined {
    for (const item of source) {
      if (!predicate || predicate(item)) return item;
    }
    return undefined;
  }

  public static last<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T {
    const el = this.lastOrDefault(source, predicate);
    if (el === undefined) throw Exception.sequenceEmpty();
    return el;
  }

  public static lastOrDefault<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T | undefined {
    let last;
    for (const item of source) {
      if (!predicate || predicate(item)) last = item;
    }
    return last;
  }

  public static single<T>(source: Iterable<T>, predicate?: Predicate<T>): T {
    const el = this.singleOrDefault(source, predicate);
    if (el === undefined) throw Exception.sequenceEmpty();
    return el;
  }

  public static singleOrDefault<T>(source: Iterable<T>, predicate?: Predicate<T>): T | undefined {
    let found: T | undefined = undefined;
    for (const item of source) {
      if (!predicate || predicate(item)) {
        if (found !== undefined) throw Exception.moreThanOne();
        found = item;
      }
    }
    return found;
  }

  public static any<T>(source: Iterable<T>, predicate?: PredicateWithIndex<T> | undefined): boolean {
    let i = 0;
    for (const item of source) {
      if (!predicate || predicate(item, i++)) return true;
    }
    return false;
  }

  public static all<T>(source: Iterable<T>, predicate: PredicateWithIndex<T>): boolean {
    let i = 0;
    for (const item of source) if (!predicate(item, i++)) return false;
    return true;
  }

  public static contains<T>(source: Iterable<T>, element: T, comparer?: IEqualityComparer<T>): boolean {
    if (comparer) {
      for (const item of source) {
        if (comparer.equals(item, element)) return true;
      }
    } else {
      for (const item of source) {
        if (item === element) return true;
      }
    }
    return false;
  }
}
