import { Predicate, PredicateWithIndex, Selector } from "../types";
import { IEqualityComparer } from "@interfaces/IEqualityComparer";
import { Exception } from "../validator/exception";

export class Operation {
  public static aggregate<T, TAccumulate, TResult = TAccumulate>(
    source: Iterable<T>,
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector?: (acc: TAccumulate) => TResult,
  ): TResult {
    if (!source) throw Exception.argumentNull("source");
    let acc = seed;
    for (const v of source) acc = func(acc, v);
    return resultSelector ? resultSelector(acc) : (acc as TAccumulate & TResult);
  }

  public static max<T, TOut>(source: Iterable<T>, selector?: Selector<T, TOut> | undefined): TOut {
    const it = source[Symbol.iterator]();
    let first = it.next();
    if (first.done) throw Exception.sequenceEmpty();
    if (selector) {
      let best = selector(first.value);
      for (let n = it.next(); !n.done; n = it.next()) {
        const val = selector(n.value);
        if (val > best) best = val;
      }
      return best;
    }
    let best = first.value as unknown as TOut;
    for (let n = it.next(); !n.done; n = it.next()) {
      const val = n.value as unknown as TOut;
      if (val > best) best = val;
    }
    return best;
  }

  public static min<T, TOut>(source: Iterable<T>, selector?: Selector<T, TOut> | undefined): TOut {
    const it = source[Symbol.iterator]();
    let first = it.next();
    if (first.done) throw Exception.sequenceEmpty();
    if (selector) {
      let best = selector(first.value);
      for (let n = it.next(); !n.done; n = it.next()) {
        const val = selector(n.value);
        if (val < best) best = val;
      }
      return best;
    }
    let best = first.value as unknown as TOut;
    for (let n = it.next(); !n.done; n = it.next()) {
      const val = n.value as unknown as TOut;
      if (val < best) best = val;
    }
    return best;
  }

  public static count<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): number {
    let count = 0;
    if (predicate) {
      for (const item of source) if (predicate(item)) count++;
    } else {
      for (const _ of source) count++;
    }
    return count;
  }

  public static sum<T>(source: Iterable<T>, selector?: Selector<T, number> | undefined): number {
    selector ??= (x) => x as number;
    let sum = 0;
    for (const item of source) sum += selector(item);
    return sum as number;
  }

  public static average<T>(source: Iterable<T>, selector?: Selector<T, number> | undefined): number {
    selector ??= (x) => x as number;
    let total = 0, n = 0, any = false;
    for (const v of source) { any = true; total += selector(v); n++; }
    if (!any) throw Exception.sequenceEmpty();
    return total / n;
  }

  public static elementAtOrDefault<T>(source: Iterable<T>, index: number): T | undefined {
    let i = 0;
    for (const v of source) if (i++ === index) return v;
    return undefined;
  }

  public static elementAt<T>(source: Iterable<T>, index: number): T {
    let i = 0;
    for (const v of source) if (i++ === index) return v;
    throw Exception.indexOutOfRange();
  }

  public static first<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T {
    const [found, first] = this._tryGetFirst(source, predicate);
    if (!found) throw Exception.sequenceEmpty();
    return first;
  }

  public static firstOrDefault<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T | undefined {
    const [, first] = this._tryGetFirst(source, predicate);
    return first;
  }

  private static _tryGetFirst<T>(
    source: Iterable<T>, 
    predicate?: Predicate<T> | undefined
  ): [true, T] | [false, undefined] {
    if (predicate) {
      for (const item of source) if (predicate(item)) { return [true, item] };
    } else {
      for (const item of source) return [true, item];
    }

    return [false, undefined];
  }

  public static last<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T {
    const [found, last] = this._tryGetLast(source, predicate);
    if (!found) throw Exception.sequenceEmpty();
    return last;
  }

  public static lastOrDefault<T>(source: Iterable<T>, predicate?: Predicate<T> | undefined): T | undefined {
    const [, last] = this._tryGetLast(source, predicate);
    return last;
  }

  private static _tryGetLast<T>(
    source: Iterable<T>,
    predicate?: Predicate<T> | undefined,
  ): [true, T] | [false, undefined] {
    let last, found = false;

    if (predicate) {
      for (const item of source) if (predicate(item)) { found = true; last = item; }
    } else { 
      for (const item of source) { found = true; last = item; }
    }

    if (found) return [true, last!];
    return [false, undefined];
  }

  public static single<T>(source: Iterable<T>, predicate?: Predicate<T>): T {
    const [found, single] = this._tryGetSingle(source, predicate);
    if (!found) throw Exception.sequenceEmpty();
    return single;
  }

  public static singleOrDefault<T>(source: Iterable<T>, predicate?: Predicate<T>): T | undefined {
    const [,single] = this._tryGetSingle(source, predicate);
    return single;
  }
  
  private static _tryGetSingle<T>(source: Iterable<T>, predicate?: Predicate<T>): [true, T] | [false, undefined] {
    let single: T, found = false;
    if (predicate) {
      for (const item of source) {
        if (predicate(item)) {
          if (found) throw Exception.moreThanOne();
          found = true;
          single = item;
        }
      }
    } else {
      for (const item of source) {
        if (found) throw Exception.moreThanOne();
        found = true;
        single = item;
      }
    }
    if (found) return [true, single!];
    return [false, undefined];
  }

  public static any<T>(source: Iterable<T>, predicate?: PredicateWithIndex<T> | undefined): boolean {
    let i = 0;
    const usePred = !!predicate;
    if (usePred) {
      for (const item of source) if (predicate(item, i++)) return true;
    } else {
      for (const item of source) if (item) return true;
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
      for (const item of source) if (comparer.equals(item, element)) return true;
    } else {
      for (const item of source) if (item === element) return true;
    }
    return false;
  }

  public static sequenceEqual<T>(source: Iterable<T>, other: Iterable<T>, comparer?: IEqualityComparer<T>): boolean {
    const it1 = source[Symbol.iterator]();
    const it2 = other[Symbol.iterator]();
    const cmp = !!comparer;
    const eq = comparer?.equals;

    while (true) {
      const a = it1.next();
      const b = it2.next();
      if (a.done !== b.done) return false;
      if (a.done) return true;
      if (cmp ? !eq!(a.value, b.value) : a.value !== b.value) return false;
    }
  }
}
