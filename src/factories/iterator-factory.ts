import type { IEnumerable } from "@interfaces/IEnumerable";
import type { Predicate, Selector, SelectorWithIndex } from "src/types";
import type { WhereIterator } from "@iterators/where-iterator";
import type { WhereArrayIterator } from "@iterators/where-array-iterator";
import type { GeneratorIterator } from "@iterators/generator-iterator";
import type { WhereSelectIterator } from "@iterators/where-select-iterator";
import type { WhereSelectArrayIterator } from "@iterators/where-select-array-iterator";
import type { SelectManyIterator } from "@iterators/select-many-iterator";
import type { OrderedEnumerable } from "@iterators/ordered-enumerable";
import type { JoinIterator } from "@iterators/join-iterator";
import type { GroupJoinIterator } from "@iterators/group-join-iterator";
import type { GroupingIterator } from "@iterators/grouping-iterator";
import type { IEqualityComparer } from "@interfaces/IEqualityComparer";

export function createWhereIterator<TSource>(
  source: IEnumerable<TSource>,
  predicate: Predicate<TSource>,
): WhereIterator<TSource> {
  const { WhereIterator } = require("@iterators/where-iterator") as typeof import("@iterators/where-iterator");
  return new WhereIterator(source, predicate);
}

export function createWhereArrayIterator<TSource>(
  source: TSource[],
  predicate: Predicate<TSource>,
): WhereArrayIterator<TSource> {
  const { WhereArrayIterator } = require("@iterators/where-array-iterator") as typeof import("@iterators/where-array-iterator");
  return new WhereArrayIterator(source, predicate);
}

export function createGeneratorIterator<TSource>(getSource: () => Iterable<TSource>): GeneratorIterator<TSource> {
  const { GeneratorIterator } = require("@iterators/generator-iterator") as typeof import("@iterators/generator-iterator");
  return new GeneratorIterator(getSource);
}

export function createWhereSelectIterator<TSource, TOut>(
  source: IEnumerable<TSource>,
  predicate: Predicate<TSource> | undefined = (x) => true,
  selector: SelectorWithIndex<TSource, TOut>,
): WhereSelectIterator<TSource, TOut> {
  const { WhereSelectIterator } = require("@iterators/where-select-iterator") as typeof import("@iterators/where-select-iterator");
  return new WhereSelectIterator(source, predicate, selector);
}

export function createWhereSelectArrayIterator<TSource, TOut>(
  source: TSource[],
  predicate: Predicate<TSource> | undefined,
  selector: SelectorWithIndex<TSource, TOut>,
): WhereSelectArrayIterator<TSource, TOut> {
  const { WhereSelectArrayIterator } = require("@iterators/where-select-array-iterator") as typeof import("@iterators/where-select-array-iterator");
  return new WhereSelectArrayIterator(source, predicate, selector);
}

export function createSelectManyIterator<TSource, TOut>(
  source: IEnumerable<TSource>,
  selector: SelectorWithIndex<TSource, Iterable<TOut>>,
): SelectManyIterator<TSource, TOut> {
  const { SelectManyIterator } = require("@iterators/select-many-iterator") as typeof import("@iterators/select-many-iterator");
  return new SelectManyIterator(source, selector);
}

export function createOrderedEnumerable<T>(
  source: Iterable<T>,
  criteria: { selector: Selector<T, any>; descending: boolean }[],
): OrderedEnumerable<T> {
  const { OrderedEnumerable } = require("@iterators/ordered-enumerable") as typeof import("@iterators/ordered-enumerable");
  return new OrderedEnumerable(source, criteria);
}

export function createJoinIterator<TOuter, TInner, TKey, TOut>(
  outer: Iterable<TOuter>,
  inner: IEnumerable<TInner>,
  outerKeySelector: Selector<TOuter, TKey>,
  innerKeySelector: Selector<TInner, TKey>,
  resultSelector: (outer: TOuter, inner: TInner) => TOut,
  comparer?: IEqualityComparer<TKey>,
): JoinIterator<TOuter, TInner, TKey, TOut> {
  const { JoinIterator } = require("@iterators/join-iterator") as typeof import("@iterators/join-iterator");
  return new JoinIterator(outer, inner, outerKeySelector, innerKeySelector, resultSelector, comparer);
}

export function createGroupJoinIterator<TOuter, TInner, TKey, TOut>(
  outer: Iterable<TOuter>,
  inner: IEnumerable<TInner>,
  outerKeySelector: Selector<TOuter, TKey>,
  innerKeySelector: Selector<TInner, TKey>,
  resultSelector: (outer: TOuter, inner: IEnumerable<TInner>) => TOut,
  comparer?: IEqualityComparer<TKey>,
): GroupJoinIterator<TOuter, TInner, TKey, TOut> {
  const { GroupJoinIterator } = require("@iterators/group-join-iterator") as typeof import("@iterators/group-join-iterator");
  return new GroupJoinIterator(outer, inner, outerKeySelector, innerKeySelector, resultSelector, comparer);
}

export function createGroupingIterator<TSource, TKey, TNext = TSource>(
  source: Iterable<TSource>,
  keySelector: Selector<TSource, TKey>,
  elementSelector?: Selector<TSource, TNext>,
  comparer?: IEqualityComparer<TKey>,
): GroupingIterator<TKey, TSource, TNext> {
  const { GroupingIterator } = require("@iterators/grouping-iterator") as typeof import("@iterators/grouping-iterator");
  return new GroupingIterator(source, keySelector, elementSelector, comparer);
}
