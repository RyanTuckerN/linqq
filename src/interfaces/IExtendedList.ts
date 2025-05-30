import { Comparator, Predicate, Selector } from "../types";
import { IDictionary } from "./IDictionary";
import { IList } from "./IList";

/**
 * Represents a collection of elements that can be manipulated in various ways.
 * All methods from IList are available, with additional advanced features for sorting, statistics, and other operations.
 */
export interface IExtendedList<T> extends IList<T> {
  /**
   * Returns an tuple of two Lists, one with elements that match the predicate and one with elements that do not.
   * @param predicate A function that accepts an argument; the function to perform on each element of the List.
   * @returns An tuple of two Lists, one with elements that match the predicate and one with elements that do not.
   * @example
   * const list = ExtendedList.from([1, 2, 3, 4, 5]);
   * const [even, odd] = list.partition((x) => x % 2 === 0);
   */
  partition(predicate: Predicate<T>): [IExtendedList<T>, IExtendedList<T>];
  /**
   * Creates a new List with the elements in a random order.
   * @returns A new List with the elements in a random order.
   */
  shuffle(): IExtendedList<T>;
  /**
   * Randomizes the order of the elements in the List **in place**.
   * @returns The List after shuffling.
   */
  shuffleInPlace(): this;
  /**
   * Rotates the elements in the List by a specified number of steps.
   * Positive steps rotate to the right, negative steps rotate to the left.
   * @param steps The number of steps to rotate the elements.
   * @returns A new List after rotating.
   */
  rotate(steps: number): IExtendedList<T>;
  /**
   * Rotates the elements in the List **in place** by a specified number of steps.
   * Positive steps rotate to the right, negative steps rotate to the left.
   * @param steps The number of steps to rotate the elements.
   * @returns The List after rotating.
   */
  rotateInPlace(steps: number): this;
  /**
   * Returns a deep copy of the List.
   * @returns A deep copy of the List.
   */
  deepClone(): IExtendedList<T>;
  /**
   * Reverses the order of the elements in the List.
   */
  reverseInPlace(): this;
  /**
   * Transform a List **in place** by applying a selector function to each element.
   * @param selector A function that accepts an argument; the function to perform on each element of the List.
   */
  transform<TOut>(selector: (element: T, index: number, list: this) => TOut): IExtendedList<TOut>;
  /**
   * Returns the maximum element in the List based on a selector function.
   * @param selector A function that accepts an argument; the function to perform on each element of the List.
   * @returns The maximum element in the List based on a selector function.
   */
  maxBy(selector: (element: T) => number): T;
  /**
   * Returns the minimum element in the List based on a selector function.
   * @param selector A function that accepts an argument; the function to perform on each element of the List.
   * @returns The minimum element in the List based on a selector function.
   */
  minBy(selector: (element: T) => number): T;
  /**
   * Returns a new List paginated by a specified page size and number.
   * @param pageSize The number of elements in a page.
   * @param pageNumber The page number to retrieve.
   * @returns A new List paginated by a specified page size and number.
   */
  paginate(pageSize: number, pageNumber?: number): IExtendedList<T>;
  /**
   * Returns a map of each unique item in the list to its frequency count.
   * @returns A dictionary of each unique item in the list to its frequency count.
   */
  frequencies(): IDictionary<T, number>;
  /**
   * Returns a new List of the top n items, sorted according to a comparator.
   * If no comparator is provided, it sorts by the natural order of the items.
   * @param count The number of items to return.
   * @param comparator A function that accepts two arguments; the function to compare two elements of the List.
   * @returns A new List of the top n items, sorted according to a comparator.
   */
  top(count: number, comparator?: (a: T, b: T) => number): IExtendedList<T>;
  /**
   * Returns a new List of the bottom n items, sorted according to a comparator.
   * If no comparator is provided, it sorts by the natural order of the items.
   * @param count The number of items to return.
   * @param comparator A function that accepts two arguments; the function to compare two elements of the List.
   * @returns A new List of the bottom n items, sorted according to a comparator.
   */
  bottom(count: number, comparator?: (a: T, b: T) => number): IExtendedList<T>;
  /**
   * Get a random element from the List.
   * @returns A random element from the List.
   */
  getRandom(): T;
  /**
   * Get a random element from the List and remove it.
   * @returns A random element from the List.
   */
  popRandom(): T;
  /**
   * Take a random sample of elements from the List.
   * @param count The number of elements to take.
   * @returns A new List of random elements.
   */
  sample(count: number): IExtendedList<T>;
  /**
   * Sorts the List **in place** using the built-in JavaScript sort method.
   * This method is typically stable, but depends on the browser/runtime implementation.
   * This is often the fastest sorting method as most engines are highly optimized, but it can be slower than quick sort or merge sort.
   * @param comparator A function that accepts two arguments; the function to compare two elements of the List.
   */
  sort(comparator?: Comparator<T>): this;

  /**
   * Sorts the List **in place** using the merge sort algorithm.
   * This algorithm is efficient and stable, making it suitable for sorting large datasets and linked lists where random access is costly.
   * Time Complexity: O(n log n) in all cases.
   * @param comparator A function that accepts two arguments; the function to compare two elements of the List.
   * @returns The List after sorting.
   */
  mergeSort(comparator?: Comparator<T>): this;

  /**
   * Sorts the List **in place** using the quick sort algorithm.
   * QuickSort is very efficient for large datasets but has a worst-case performance of O(n^2). It performs well on average and is generally faster than merge sort in practice.
   * Not stable, which means it might not preserve the order of equal elements.
   * Best used when average-case performance is important.
   * @param comparator A function that accepts two arguments; the function to compare two elements of the List.
   * @returns The List after sorting.
   */
  quickSort(comparator?: Comparator<T>): this;

  /**
   * Sorts the List **in place** using the heap sort algorithm.
   * Efficient for both large and small data sets with O(n log n) complexity.
   * Not stable but does not require additional memory for another array like merge sort.
   * Useful when consistent O(n log n) performance is required regardless of data ordering.
   * @param comparator A function that accepts two arguments; the function to compare two elements of the List.
   * @returns The List after sorting.
   */
  heapSort(comparator?: Comparator<T>): this;

  /**
   * Calculates the standard deviation of elements in the list, optionally transformed by a selector.
   * @param selector A function to transform list elements into numbers.
   * @returns The standard deviation of the transformed list elements.
   */
  stdDeviation(selector?: Selector<T, number>): number;

  /**
   * Computes the mean (average) of elements in the list, optionally transformed by a selector.
   * @param selector A function to transform list elements into numbers.
   * @returns The mean of the transformed list elements.
   */
  mean(selector?: Selector<T, number>): number;

  /**
   * Determines the median value of elements in the list, optionally transformed by a selector.
   * @param selector A function to transform list elements into numbers.
   * @returns The median of the transformed list elements.
   */
  median(selector?: Selector<T, number>): number;

  /**
   * Finds the mode of elements in the list, optionally transformed by a selector.
   * The mode is the value that appears most frequently.
   * If multiple values have the same highest frequency, returns the first one found.
   * @param selector A function to transform list elements into numbers.
   * @returns The most frequently occurring transformed value.
   */
  mode(selector?: Selector<T, number>): number;

  /**
   * Calculates the variance of elements in the list, optionally transformed by a selector.
   * Variance measures how far a set of numbers are spread out from their average value.
   * @param selector A function to transform list elements into numbers.
   * @returns The variance of the transformed list elements.
   */
  variance(selector?: Selector<T, number>): number;

  /**
   * Computes the specified percentile of elements in the list, optionally transformed by a selector.
   * @param percentile The percentile to calculate (0-100).
   * @param selector A function to transform list elements into numbers.
   * @returns The value at the specified percentile.
   */
  percentile(percentile: number, selector?: Selector<T, number>): number;

  /**
   * Calculates the product of elements in the list, optionally transformed by a selector.
   * @param selector A function to transform list elements into numbers.
   * @returns The product of the transformed list elements.
   */
  product(selector?: Selector<T, number>): number;

  /**
   * Computes the harmonic mean of elements in the list, optionally transformed by a selector.
   * The harmonic mean is the reciprocal of the arithmetic mean of the reciprocals.
   * @param selector A function to transform list elements into numbers.
   * @returns The harmonic mean of the transformed list elements.
   */
  harmonicMean(selector?: Selector<T, number>): number;

  /**
   * Calculates the geometric mean of elements in the list, optionally transformed by a selector.
   * The geometric mean is the nth root of the product of n numbers.
   * @param selector A function to transform list elements into numbers.
   * @returns The geometric mean of the transformed list elements.
   */
  geometricMean(selector?: Selector<T, number>): number;

  /**
   * Finds both the minimum and maximum values of elements in the list, optionally transformed by a selector.
   * @param selector A function to transform list elements into numbers.
   * @returns An object containing the minimum and maximum of the transformed list elements.
   */
  minMax(selector?: Selector<T, number>): { min: number; max: number };

  /**
   * Finds both the minimum and maximum elements of the list based on a numeric property specified by the selector.
   * @param selector A function to transform list elements into numbers.
   * @returns An object containing the elements with the minimum and maximum values.
   */
  minMaxBy(selector: Selector<T, number>): { min: T; max: T };

  /**
   * Calculates the range of elements in the list, optionally transformed by a selector.
   * The range is defined as the difference between the maximum and minimum values.
   * @param selector A function to transform list elements into numbers.
   * @returns The range of the transformed list elements.
   */
  range(selector?: Selector<T, number>): number;

  /**
   * Normalizes the elements of the list to a range between 0 and 1, optionally transformed by a selector.
   * @param selector A function to transform list elements into numbers.
   * @returns A new list of normalized numbers.
   */
  normalize(selector?: Selector<T, number>): IExtendedList<number>;

  /**
   * Calculates the cumulative sum of elements in the list, optionally transformed by a selector.
   * @param selector A function to transform list elements into numbers.
   * @returns A new list containing the cumulative sums.
   */
  cumulativeSum(selector?: Selector<T, number>): IExtendedList<number>;

  /**
   * Batch the elements of the list into chunks of a specified size.
   * @param size The number of elements in each chunk.
   * @returns A new list of chunks.
   * @example
   * const list = ExtendedList.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
   * const chunks = list.chunk(3);
   * // chunks: { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 }, { 10 } }
   */
  chunk(size: number): IExtendedList<IExtendedList<T>>;

  /**
   * Applies an accumulator function over the elements of the list, returning an IEnumerable of accumulated values at each step.
   * @param seed The initial accumulator value.
   * @param accumulator An accumulator function to be invoked on each element.
   */
  scan<TAccumulate>(
    seed: TAccumulate,
    accumulator: (acc: TAccumulate, value: T) => TAccumulate,
  ): IExtendedList<TAccumulate>;

  /**
   * Generate a sliding window over the elements of the list. Useful for computing moving averages or other windowed statistics.
   * @param size The number of elements in each window.
   * @returns A new list of sliding windows.
   */
  window(size: number): IExtendedList<IExtendedList<T>>;
}
