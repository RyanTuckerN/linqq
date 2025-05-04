import { Predicate, PredicateWithIndex, Selector, NumericSelector, SelectorWithIndex, Indexable } from "../types";
import { IGrouping, IEqualityComparer, IDictionary, IOrderedEnumerable, IHashSet, IExtendedList } from ".";
import { IList } from "./IList";

/**
 * Represents a collection of elements - the main interface of the `linqq` library.
 * All other enumerable interfaces are built around this.
 * Elements can be accessed by index, and the collection can be iterated over, just like an array.
 * The power of the IEnumerable, however, lies in the methods it provides for querying and manipulating the elements.
 * Operations like `where`, `select`, `groupBy`, `orderBy`, `join`, and many more are available to transform and filter the elements in the collection.
 * @typeparam T The type of elements in the collection.
 */
export interface IEnumerable<T> extends Iterable<T> {
  // Transformation
  /**
   * Transform the elements in the IEnumerable to an array.
   * @returns An array of the elements in the IEnumerable.
   * @example
   * ```typescript
   * const numbers = [1, 2, 3, 4, 5];
   * const enumerable = linqq(numbers).select(x => x * 2);
   * const array = enumerable.toArray() // [2, 4, 6, 8, 10]
   * // the sequence is enumerated, and array methods can be used
   * array.push(12);
   * array.shift();
   * ```
   */
  toArray(): T[];
  /**
   * Transform the elements in the IEnumerable to an IList.
   * @returns An IList of the elements in the IEnumerable.
   * @example
   * ```typescript
   * const numbers = [1, 2, 3, 4, 5];
   * const enumerable = linqq(numbers).select(x => x * 2);
   * const list = enumerable.toList() // List { 2, 4, 6, 8, 10 }
   * // the sequence is enumerated, and list methods can be used
   * list.add(12);
   * list.removeAt(0);
   * ```
   */
  toList(): IList<T>;
  /**
   * Transform the elements in the IEnumerable to an ExtendedList.
   * A ExtendedList is a List with many additional methods, ranging from partitioning, advanced aggregation, and math operations.
   * @returns A ExtendedList of the elements in the IEnumerable.
   */
  toExtendedList(): IExtendedList<T>;
  /**
   * Transform the elements in the IEnumerable to a List.
   * @returns A List of the elements in the IEnumerable.
   */
  ensureList(): IList<T>;
  /**
   * Transform the elements in the IEnumerable to a Set.
   * @returns A Set of the elements in the IEnumerable.
   */
  toSet(): Set<T>;
  /**
   * Transform the elements in the IEnumerable to a HashSet.
   * @param comparer The comparer to use when comparing elements.
   * @returns A HashSet of the elements in the IEnumerable.
   */
  toHashSet(comparer?: IEqualityComparer<T>): IHashSet<T>;
  /**
   * Transform the elements in the IEnumerable to a Lookup.
   * @param keySelector The key selector to group elements by.
   * @param valueSelector The value selector to transform elements with.
   * @returns A Dictionary of the elements in the IEnumerable.
   */
  toDictionary<TKey, TOut = T>(
    keySelector: Selector<T, TKey>,
    valueSelector?: Selector<T, TOut>,
  ): IDictionary<TKey, TOut> & Indexable<TKey, TOut>;
  /**
   * Cast the elements in the IEnumerable to a different type.
   * @returns An IEnumerable of the elements cast to the specified type.
   */
  cast<TOut>(): IEnumerable<TOut>;

  // Aggregation
  /**
   * Perform an aggregation on the elements in the IEnumerable.
   * @param seed The initial value of the accumulator.
   * @param func The function to perform on each element.
   * @param resultSelector The function to transform the accumulator into the result.
   * @returns The result of the aggregation.
   */
  aggregate<TAccumulate, TResult>(
    seed: TAccumulate,
    func: (acc: TAccumulate, x: T) => TAccumulate,
    resultSelector?: (acc: TAccumulate) => TResult,
  ): TResult;
  /**
   * Count the elements in the IEnumerable.
   * @param predicate The predicate to filter elements with.
   * @returns The number of elements in the IEnumerable.
   */
  count(predicate?: Predicate<T>): number;
  /**
   * Sum the elements in the IEnumerable.
   * @param selector The selector to transform elements with.
   * @returns The sum of the elements in the IEnumerable.
   */
  sum(selector?: NumericSelector<T>): number;
  sum(selector: NumericSelector<T>): number;
  /**
   * Calculate the average of the elements in the IEnumerable.
   * @param selector The selector to transform elements with.
   * @returns The average of the elements in the IEnumerable.
   */
  average(selector?: NumericSelector<T>): number;
  average(selector: NumericSelector<T>): number;
  /**
   * Find the maximum element in the IEnumerable.
   * @param selector The selector to transform elements with.
   * @returns The maximum element in the IEnumerable.
   */
  max<TOut = T extends number ? T : unknown>(selector?: Selector<T, TOut>): TOut;
  /**
   * Find the minimum element in the IEnumerable.
   * @param selector The selector to transform elements with.
   * @returns The minimum element in the IEnumerable.
   */
  min<TOut = T extends number ? T : unknown>(selector?: Selector<T, TOut>): TOut;

  // Quantifiers
  /**
   * Check if any elements in the IEnumerable satisfy the predicate.
   * @param predicate The predicate to check elements with.
   * @returns True if any elements satisfy the predicate, otherwise false.
   */
  any(predicate?: Predicate<T>): boolean;
  /**
   * Check if all elements in the IEnumerable satisfy the predicate.
   * @param predicate The predicate to check elements with.
   * @returns True if all elements satisfy the predicate, otherwise false.
   */
  all(predicate: Predicate<T>): boolean;
  /**
   * Check if the IEnumerable contains the element.
   * @param element The element to check for.
   * @returns True if the element is in the IEnumerable, otherwise false.
   */
  contains(element: T): boolean;

  // Element
  /**
   * Get the element at the specified index.
   * @param index The index of the element to get.
   * @returns The element at the specified index.
   * @throws If the index is out of range.
   */
  elementAt(index: number): T;
  /**
   * Get the element at the specified index or the undefined.
   * @param index The index of the element to get.
   * @returns The element at the specified index or the undefined.
   */
  elementAtOrDefault(index: number): T | undefined;
  /**
   * Get the first element in the IEnumerable.
   * @param predicate The predicate to filter elements with.
   * @returns The first element in the IEnumerable.
   * @throws If the IEnumerable is empty.
   */
  first(predicate?: Predicate<T>): T;
  /**
   * Get the first element in the IEnumerable or the undefined.
   * @param predicate The predicate to filter elements with.
   * @returns The first element in the IEnumerable or the undefined.
   */
  firstOrDefault(predicate?: Predicate<T>): T | undefined;
  /**
   * Get the last element in the IEnumerable.
   * @param predicate The predicate to filter elements with.
   * @returns The last element in the IEnumerable.
   * @throws If the IEnumerable is empty.
   */
  last(predicate?: Predicate<T>): T;
  /**
   * Get the last element in the IEnumerable or the undefined.
   * @param predicate The predicate to filter elements with.
   * @returns The last element in the IEnumerable or the undefined.
   */
  lastOrDefault(predicate?: Predicate<T>): T | undefined;
  /**
   * Get the single element in the IEnumerable.
   * @param predicate The predicate to filter elements with.
   * @returns The single element in the IEnumerable.
   * @throws If the IEnumerable is empty.
   * @throws If the IEnumerable contains more than one element.
   */
  single(predicate?: Predicate<T>): T;
  /**
   * Get the single element in the IEnumerable or the undefined.
   * @param predicate The predicate to filter elements with.
   * @returns The single element in the IEnumerable or the undefined.
   * @throws If the IEnumerable contains more than one element.
   */
  singleOrDefault(predicate?: Predicate<T>): T | undefined;
  /**
   * Add an element to the end of the IEnumerable.
   * @param element The element to append.
   * @returns A new IEnumerable with the element appended.
   */
  append(element: T): IEnumerable<T>;
  /**
   * Reverse the elements in the IEnumerable.
   * @returns A new IEnumerable with the elements reversed.
   */
  reverse(): IEnumerable<T>;

  // Query
  /**
   * Filter elements in the IEnumerable.
   * @param predicate The predicate to filter elements with.
   * @returns A new IEnumerable with the elements that satisfy the predicate.
   */
  where(predicate: PredicateWithIndex<T>): IEnumerable<T>;
  /**
   * Project elements in the IEnumerable.
   * @param selector The selector to transform elements with.
   * @returns A new IEnumerable with the elements transformed.
   */
  select<TOut>(selector: SelectorWithIndex<T, TOut>): IEnumerable<TOut>;
  /**
   * Project and flatten elements in the IEnumerable.
   * @param selector The selector to transform elements with.
   * @returns A new IEnumerable with the elements transformed.
   */
  selectMany<TOut>(selector: SelectorWithIndex<T, Iterable<TOut>>): IEnumerable<TOut>;
  /**
   * Join two sequences based on a key selector and result selector.
   * @param inner The sequence to join with.
   * @param outerKeySelector The key selector for the outer sequence.
   * @param innerKeySelector The key selector for the inner sequence.
   * @param resultSelector The result selector for the joined sequences.
   * @param comparer The comparer to compare keys with.
   * @returns A new IEnumerable with the joined sequences.
   */
  join<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: TInner) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut>;
  /**
   * Group two sequences based on a key selector and result selector.
   * @param inner The sequence to group with.
   * @param outerKeySelector The key selector for the outer sequence.
   * @param innerKeySelector The key selector for the inner sequence.
   * @param resultSelector The result selector for the grouped sequences.
   * @param comparer The comparer to compare keys with.
   * @returns A new IEnumerable with the grouped sequences.
   */
  groupJoin<TInner, TKey, TOut>(
    inner: TInner[] | IEnumerable<TInner>,
    outerKeySelector: Selector<T, TKey>,
    innerKeySelector: Selector<TInner, TKey>,
    resultSelector: (x: T, y: IEnumerable<TInner>) => TOut,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<TOut>;
  /**
   * Order elements in the IEnumerable by a key selector in ascending order.
   * @param selector The key selector to order elements by.
   * @returns A new IOrderedEnumerable with the elements ordered.
   */
  orderBy<TKey>(selector: Selector<T, TKey>): IOrderedEnumerable<T>;
  /**
   * Order elements in the IEnumerable by a key selector in descending order.
   * @param selector The key selector to order elements by.
   * @returns A new IOrderedEnumerable with the elements ordered.
   */
  orderByDescending<TKey>(selector: Selector<T, TKey>): IOrderedEnumerable<T>;
  /**
   *  Take a specified number of elements from the IEnumerable.
   * @param count The number of elements to take.
   * @returns A new IEnumerable with the specified number of elements.
   */
  take(count: number): IEnumerable<T>;
  /**
   * Take elements from the IEnumerable while the predicate is true.
   * @param predicate The predicate to take elements with.
   * @returns A new IEnumerable with elements taken while the predicate is true.
   */
  takeWhile(predicate: PredicateWithIndex<T>): IEnumerable<T>;
  /**
   * Skip a specified number of elements in the IEnumerable.
   * @param count The number of elements to skip.
   * @returns A new IEnumerable with the specified number of elements skipped.
   */
  skip(count: number): IEnumerable<T>;
  /**
   * Skip elements in the IEnumerable while the predicate is true.
   * @param predicate The predicate to skip elements with.
   * @returns A new IEnumerable with elements skipped while the predicate is true.
   */
  skipWhile(predicate: PredicateWithIndex<T>): IEnumerable<T>;
  /**
   * Concatenate multiple sequences.
   * @param args The sequences to concatenate.
   * @returns A new IEnumerable with the sequences concatenated.
   */
  concat(...args: Iterable<T>[]): IEnumerable<T>;
  /**
   * Zip two sequences together.
   * @param second The sequence to zip with.
   * @param selector The selector to transform elements with.
   * @returns A new IEnumerable with the sequences zipped.
   */
  zip<TOut, TSecond = T>(second: Iterable<TSecond>, selector: (f: T, s: TSecond) => TOut): IEnumerable<TOut>;

  // Set
  /**
   * Get the distinct elements in the IEnumerable.
   * @returns A new IEnumerable with the distinct elements.
   */
  distinct(): IEnumerable<T>;
  /**
   * Get the distinct elements in the IEnumerable by a key selector.
   * @param selector The key selector to compare elements with.
   * @returns A new IEnumerable with the distinct elements.
   */
  distinctBy<TOut>(selector: Selector<T, TOut>): IEnumerable<T>;
  /**
   * Union two sequences into an IEnumerable of unique elements.
   * @param other The sequence to union with.
   * @param comparer The comparer to compare elements with.
   * @returns A new IEnumerable with the sequences combined.
   */
  union(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  /**
   * Intersect two sequences into an IEnumerable of common elements.
   * @param other The sequence to intersect with.
   * @param comparer The comparer to compare elements with.
   * @returns A new IEnumerable with the sequences intersected.
   */
  intersect(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  /**
   * Take the elements in the IEnumerable except for the specified elements.
   * @param other The elements to exclude.
   * @param comparer The comparer to compare elements with.
   * @returns A new IEnumerable with the elements except for the specified elements.
   */
  except(other: T[] | IEnumerable<T>, comparer?: IEqualityComparer<T>): IEnumerable<T>;
  /**
   * Group elements into a sequence of Groupings based on a key selector.
   * @param keySelector The key selector to group elements by.
   * @param elementSelector The element selector to transform elements with.
   * @param comparer The comparer to compare keys with.
   * @returns Am IEnumerable of Groupings.
   */
  groupBy<TKey, TNext = T>(
    keySelector: Selector<T, TKey>,
    elementSelector?: Selector<T, TNext>,
    comparer?: IEqualityComparer<TKey>,
  ): IEnumerable<IGrouping<TKey, TNext>>;

  /**
   * Check if the elements in the IEnumerable are equal to the elements in another sequence.
   * @param other The other sequence to compare.
   * @param comparer The comparer to compare elements with.
   */
  sequenceEqual(other: Iterable<T>, comparer?: IEqualityComparer<T>): boolean;

  [Symbol.iterator](): IterableIterator<T>;
}
