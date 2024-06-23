/**
 * Callback function that returns a boolean value.
 * @param item The item to test.
 * @returns A boolean value.
 * @template T The type of the item.
 * @example
 * ```typescript
 * const predicate: Predicate<number> = (x) => x > 5;
 * console.log(predicate(10)); // true
 * console.log(predicate(3)); // false
 * ```
 */
export type Predicate<T> = (item: T) => boolean;
/**
 * Callback function that returns a boolean value.
 * @param item The item to test.
 * @param index The index of the item.
 * @returns A boolean value.
 * @template T The type of the item.
 * @example
 * ```typescript
 * const predicate: PredicateWithIndex<number> = (x, i) => x > 5 && i < 2;
 * console.log(predicate(10, 0)); // true
 * console.log(predicate(3, 1)); // false
 * ```
 */
export type PredicateWithIndex<T> = (item: T, index: number) => boolean;
/**
 * Callback function that returns a value.
 * @param item The item to select.
 * @returns The selected value.
 * @template T The type of the item.
 * @template TResult The type of the selected value.
 * @example
 * ```typescript
 * const selector: Selector<number, string> = (x) => x.toString();
 * console.log(selector(10)); // "10"
 * console.log(selector(3)); // "3"
 * ```
 */
export type Selector<T, TResult> = (item: T) => TResult;
/**
 * Callback function that returns a value.
 * @param item The item to select.
 * @param index The index of the item.
 * @returns The selected value.
 * @template T The type of the item.
 * @template TResult The type of the selected value.
 * @example
 * ```typescript
 * const selector: SelectorWithIndex<number, string> = (x, i) => x.toString() + i.toString();
 * console.log(selector(10, 0)); // "100"
 * console.log(selector(3, 1)); // "31"
 * ```
 */
export type SelectorWithIndex<T, TResult> = (item: T, index: number) => TResult;
/**
 * Selector function that returns a numeric value.
 * @param item The item to select.
 * @returns The selected numeric value.
 * @template T The type of the item.
 * @example
 * ```typescript
 * const selector: NumericSelector<{ name: string, age: number }> = (x) => x.age;
 * console.log(selector({ name: "Alice", age: 30 })); // 30
 * console.log(selector({ name: "Bob", age: 25 })); // 25
 * ```
 */
export type NumericSelector<T> = Selector<T, number>;
/**
 * Callback function that compares two values. This function has the same call signature as `Array.prototype.sort()`.
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @returns A number that indicates the relative values of `a` and `b`.
 * @template T The type of the values to compare.
 * @example
 * ```typescript
 * const comparator: Comparator<number> = (a, b) => a - b;
 * console.log(comparator(10, 5)); // 5
 * console.log(comparator(3, 3)); // 0
 * const stringComparator: Comparator<string> = (a, b) => a.localeCompare(b);
 * console.log(stringComparator("Alice", "Bob")); // -1
 * console.log(stringComparator("Bob", "Alice")); // 1
 * console.log(stringComparator("Alice", "Alice")); // 0
 * ```
 */
export type Comparator<T> = (a: T, b: T) => number;
/**
 * Structure that represents a key-value pair.
 * @template TKey The type of the key.
 * @template TValue The type of the value.
 * @example
 * ```typescript
 * const pair: KeyValuePair<string, number> = { key: "Alice", value: 30 };
 * console.log(pair.key); // "Alice"
 * console.log(pair.value); // 30
 * ```
 */
export type KeyValuePair<TKey, TValue> = { key: TKey; value: TValue };
export type Sorter<T, TKey> = { selector: Selector<T, TKey>; descending: boolean };
export type Indexable<TKey, TValue> = { [K in TKey extends string ? string : TKey extends number ? number : never]: TValue };