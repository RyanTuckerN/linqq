export type Numeric = number
export type Comparable = number | bigint | Date;
export type Orderable = number | bigint | Date | string | number;
export type KeyValuePair<TKey, TValue> = { key: TKey; value: TValue };
export type Pagination = { take: number; skip: number };
export type Sorter<T> = { selector: (item: T) => any; descending: boolean };
export type Selector<T, TResult> = (item: T) => TResult;
export type SelectorWithIndex<T, TResult> = (item: T, index: number) => TResult;
export type NumericSelector<T> = Selector<T, number>;
export type OrderSelector<T> = Selector<T, Orderable>;
export type Predicate<T> = (item: T) => boolean;
export type PredicateWithIndex<T> = (item: T, index: number) => boolean;