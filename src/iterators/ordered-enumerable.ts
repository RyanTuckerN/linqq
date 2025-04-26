import { IteratorBase } from "@core/enumerable-base";
import { IOrderedEnumerable } from "@interfaces/IOrderedEnumerable";
import { Sorter } from "src/types";

export class OrderedEnumerable<T> extends IteratorBase<T> implements IOrderedEnumerable<T> {
  private index = 0;
  private sorted: T[] | null = null;
  public static createOrderedEnumerable<T, TKey>(
    source: Iterable<T>,
    sortExpressions: Sorter<T, TKey>[] = [],
  ): IOrderedEnumerable<T> {
    return new OrderedEnumerable<T>(source, sortExpressions);
  }
  constructor(
    source: Iterable<T>,
    private criteria: Sorter<T, any>[],
  ) {
    super(source);
  }

  thenBy<TKey extends any>(selector: (x: T) => TKey): this {
    this.criteria = [...this.criteria, { selector, descending: false }];
    return this;
  }

  thenByDescending<TKey extends any>(selector: (x: T) => TKey): this {
    this.criteria = [...this.criteria, { selector, descending: true }];
    return this;
  }

  public moveNext(): boolean {
    if (!this.sorted) {
      this.sort();
    }
    if (this.index < this.sorted!.length) {
      this.current = this.sorted![this.index++];

      return true;
    }
    return false;
  }

  public clone(): IteratorBase<T, T> {
    return new OrderedEnumerable<T>(this.source, this.criteria);
  }

  private sort(): void {
    const data = Array.isArray(this.source) ? this.source : Array.from(this.source);
    this.sorted = data.sort((a, b) => {
      for (const criterion of this.criteria) {
        const keyA = criterion.selector(a);
        const keyB = criterion.selector(b);
        const comparison = keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
        if (comparison !== 0) {
          return criterion.descending ? -comparison : comparison;
        }
      }
      return 0;
    });

    // this quick sort works correctly, but it's not as efficient as the built-in sort method
    // I'm keeping it here for testing with different data sets
    // const quickSort = (arr: any[], left: number, right: number): void => {
    //   let index;
    //   if (arr.length > 1) {
    //     index = partition(arr, left, right);
    //     if (left < index - 1) {
    //       quickSort(arr, left, index - 1);
    //     }
    //     if (index < right) {
    //       quickSort(arr, index, right);
    //     }
    //   }
    // };

    // const partition = (arr: any[], left: number, right: number) => {
    //   const pivot = arr[Math.floor((right + left) / 2)];
    //   let i = left;
    //   let j = right;
    //   while (i <= j) {
    //     while (compare(arr[i], pivot) < 0) {
    //       i++;
    //     }
    //     while (compare(arr[j], pivot) > 0) {
    //       j--;
    //     }
    //     if (i <= j) {
    //       [arr[i], arr[j]] = [arr[j], arr[i]];
    //       i++;
    //       j--;
    //     }
    //   }
    //   return i;
    // };

    // const compare = (a: any, b: any) => {
    //   for (const criterion of this.criteria) {
    //     const keyA = criterion.selector(a);
    //     const keyB = criterion.selector(b);
    //     const comparison = keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
    //     if (comparison !== 0) {
    //       return criterion.descending ? -comparison : comparison;
    //     }
    //   }
    //   return 0;
    // };

    // const data = Array.isArray(this.source) ? this.source : Array.from(this.source);
    // quickSort(data, 0, data.length - 1);
    // this.sorted = data;
  }
}
