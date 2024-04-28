import { IDictionaryService } from "./services/dictionary-service";
import { IGroupingService } from "./services/grouping-service";
import { IOrderedEnumerableService } from "./services/ordered-enumerable-service";

export type Numeric = number | bigint;
export type Comparable = number | bigint | Date;
export type Orderable = number | bigint | Date | string | number;
export type KeyValuePair<TKey, TValue> = { key: TKey; value: TValue };
export type Pagination = { take: number; skip: number };
type Comparer<T, TR> = (a: T, b: T) => TR;
export type EqualityComparer<T> = Comparer<T, boolean>;
export type Sorter<T> = Comparer<T, number>;
export type Selector<T, TResult> = (item: T) => TResult;
export type NumericSelector<T> = Selector<T, number>;
export type Predicate<T> = (item: T) => boolean;
export interface IEnumerableConfig {
  // dictionaryService: IDictionaryService;
  // orderedEnumerableService: IOrderedEnumerableService;
  // groupingService: IGroupingService;
  createDictionary: IDictionaryService["createDictionary"];
  createOrderedEnumerable: IOrderedEnumerableService["createOrderedEnumerable"];
  createGrouping: IGroupingService["create"];
}
