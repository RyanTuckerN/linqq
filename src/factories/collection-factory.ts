// Factory functions for creating lists, dictionaries, etc.
import type { IList } from "@interfaces/IList";
import type { IDictionary } from "@interfaces/IDictionary";
import type { IHashSet } from "@interfaces/IHashSet";
import type { IEqualityComparer } from "@interfaces/IEqualityComparer";
import type { Indexable } from "src/types";
import { List } from "@collections/list";
import { Dictionary } from "@collections/dictionary";
import { HashSet } from "@collections/hash-set";

export function createList<T>(source: Iterable<T>): IList<T> {
  if (Array.isArray(source)) {
    return List.from(source);
  }
  return List.from(Array.from(source));
}

export function createDictionary<TSource, TKey, TValue>(
  source: Iterable<TSource>,
  keySelector: (x: TSource, index: number) => TKey,
  valueSelector?: (x: TSource, index: number) => TValue,
): IDictionary<TKey, TValue> & Indexable<TKey, TValue> {
  return Dictionary.createDictionary(source, keySelector, valueSelector);
}

export function createHashSet<T>(source: Iterable<T> = [], equalityComparer?: IEqualityComparer<T>): IHashSet<T> {
  return new HashSet(source, equalityComparer);
}

export function isList<T>(obj: any): obj is IList<T> {
  return obj instanceof List;
}
