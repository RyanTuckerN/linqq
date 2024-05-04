import { IEnumerable } from "../interfaces";
import { Orderable, Selector } from "../types";

export class LinqUtils {
  static defaultComparer<T>(a: T, b: T): boolean {
    return a === b;
  }

  static defaultSelector<T, U>(item: T): U {
    return item as U & T;
  }

  static defaultPredicate<T>(item: T): boolean {
    return true;
  }

  static defaultState<T>(source: T[] = []){
    return source as unknown as IEnumerable<T>;
  }

  static getOrderExpression<T>(keySelector: Selector<T, Orderable>, direction: "asc" | "desc"): (a: T, b: T) => number {
    const descending = direction === "desc";
    return (a, b) => {
      let aKey = keySelector(a);
      let bKey = keySelector(b);

      if (aKey < bKey) {
        return descending ? 1 : -1;
      }
      if (aKey > bKey) {
        return descending ? -1 : 1;
      }
      return 0;
    };
  }

  static ensureString(value: any): string {
    return String(value);
  }
}
