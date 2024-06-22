import { Comparator } from "../types";

export function defaultComparator<T>(a: T, b: T): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export class Sort {
  public static sort<T>(array: T[], comparator: Comparator<T> = defaultComparator): T[] {
    // the default sort implementation in JavaScript
    return array.sort(comparator);
  }
  private static merge<T>(
    array: T[],
    temp: T[],
    start: number,
    mid: number,
    end: number,
    comparator: Comparator<T>,
  ): void {
    let leftIndex = start;
    let rightIndex = mid + 1;
    let tempIndex = start;

    for (let index = start; index <= end; index++) {
      temp[index] = array[index];
    }

    while (leftIndex <= mid && rightIndex <= end) {
      if (comparator(temp[leftIndex], temp[rightIndex]) <= 0) {
        array[tempIndex++] = temp[leftIndex++];
      } else {
        array[tempIndex++] = temp[rightIndex++];
      }
    }

    while (leftIndex <= mid) {
      array[tempIndex++] = temp[leftIndex++];
    }
  }

  public static mergeSort<T>(
    array: T[],
    comparator: Comparator<T> = defaultComparator,
    start: number = 0,
    end: number = array.length - 1,
    temp: T[] = Array.from(array),
  ): void {
    if (start < end) {
      let mid = Math.floor((start + end) / 2);
      this.mergeSort(array, comparator, start, mid, temp);
      this.mergeSort(array, comparator, mid + 1, end, temp);
      this.merge(array, temp, start, mid, end, comparator);
    }
  }

  public static quickSort<T>(
    arr: T[],
    comparator: Comparator<T> = defaultComparator,
    left = 0,
    right = arr.length - 1,
  ): T[] {
    let index;
    if (arr.length > 1) {
      index = this.partition(arr, left, right, comparator);
      if (left < index - 1) {
        this.quickSort(arr, comparator, left, index - 1);
      }
      if (index < right) {
        this.quickSort(arr, comparator, index, right);
      }
    }
    return arr;
  }

  private static partition<T>(arr: T[], left: number, right: number, comparator: Comparator<T>) {
    const pivot = arr[Math.floor((right + left) / 2)];
    let i = left;
    let j = right;
    while (i <= j) {
      while (comparator(arr[i], pivot) < 0) {
        i++;
      }
      while (comparator(arr[j], pivot) > 0) {
        j--;
      }
      if (i <= j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
        j--;
      }
    }
    return i;
  }

  public static bubbleSort<T>(array: T[], comparator: Comparator<T> = defaultComparator): T[] {
    const len = array.length;
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len - i - 1; j++) {
        if (comparator(array[j], array[j + 1]) > 0) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
        }
      }
    }
    return array;
  }

  public static insertionSort<T>(array: T[], comparator: Comparator<T> = defaultComparator): T[] {
    const len = array.length;
    for (let i = 1; i < len; i++) {
      let j = i;
      while (j > 0 && comparator(array[j - 1], array[j]) > 0) {
        [array[j - 1], array[j]] = [array[j], array[j - 1]];
        j--;
      }
    }
    return array;
  }

  public static selectionSort<T>(array: T[], comparator: Comparator<T> = defaultComparator): T[] {
    const len = array.length;
    for (let i = 0; i < len; i++) {
      let min = i;
      for (let j = i + 1; j < len; j++) {
        if (comparator(array[min], array[j]) > 0) {
          min = j;
        }
      }
      if (min !== i) {
        [array[i], array[min]] = [array[min], array[i]];
      }
    }
    return array;
  }

  public static heapSort<T>(array: T[], comparator: Comparator<T> = defaultComparator): T[] {
    let heap = new MaxHeap(array, comparator);
    heap.sort();
    return array;
  }

  public static shellSort<T>(array: T[], comparator: Comparator<T> = defaultComparator): T[] {
    const len = array.length;
    for (let gap = Math.floor(len / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < len; i++) {
        let temp = array[i];
        let j = i;
        for (; j >= gap && comparator(array[j - gap], temp) > 0; j -= gap) {
          array[j] = array[j - gap];
        }
        array[j] = temp;
      }
    }
    return array;
  }

  public static countingSort(array: number[], min: number, max: number): number[] {
    const count: number[] = new Array(max - min + 1).fill(0);
    array.forEach((value) => {
      count[value - min]++;
    });

    let index = 0;
    for (let i = min; i <= max; i++) {
      while (count[i - min] > 0) {
        array[index++] = i;
        count[i - min]--;
      }
    }
    return array;
  }

  public static radixSort(array: number[]): number[] {
    const max = Math.max(...array);
    let exp = 1;
    while (max / exp > 0) {
      this.countSortByDigit(array, exp);
      exp *= 10;
    }
    return array;
  }

  private static countSortByDigit(array: number[], exp: number): void {
    const output = new Array(array.length).fill(0);
    const count = new Array(10).fill(0);

    for (let i = 0; i < array.length; i++) {
      count[Math.floor(array[i] / exp) % 10]++;
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    for (let i = array.length - 1; i >= 0; i--) {
      const digit = Math.floor(array[i] / exp) % 10;
      output[count[digit] - 1] = array[i];
      count[digit]--;
    }

    for (let i = 0; i < array.length; i++) {
      array[i] = output[i];
    }
  }

  public static bucketSort(array: number[], bucketSize = 5): number[] {
    if (array.length === 0) {
      return array;
    }

    const minValue = Math.min(...array);
    const maxValue = Math.max(...array);

    const bucketCount = Math.floor((maxValue - minValue) / bucketSize) + 1;
    const buckets: number[][] = new Array(bucketCount);
    for (let i = 0; i < buckets.length; i++) {
      buckets[i] = [];
    }

    array.forEach((currentVal) => {
      buckets[Math.floor((currentVal - minValue) / bucketSize)].push(currentVal);
    });

    array.length = 0;
    buckets.forEach((bucket) => {
      this.insertionSort(bucket);
      array.push(...bucket);
    });

    return array;
  }
}

class MaxHeap<T> {
  private comparator: Comparator<T>;

  constructor(
    private array: T[],
    comparator: Comparator<T>,
  ) {
    this.comparator = comparator;
    this.buildHeap();
  }

  private buildHeap(): void {
    const length = this.array.length;
    const start = Math.floor(length / 2) - 1;

    for (let i = start; i >= 0; i--) {
      this.siftDown(i, length);
    }
  }

  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private getLeftChildIndex(index: number): number {
    return 2 * index + 1;
  }

  private getRightChildIndex(index: number): number {
    return 2 * index + 2;
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parentIndex = this.getParentIndex(index);
      if (this.comparator(this.array[parentIndex], this.array[index]) >= 0) {
        break;
      }
      [this.array[parentIndex], this.array[index]] = [this.array[index], this.array[parentIndex]];
      index = parentIndex;
    }
  }

  private siftDown(index: number, length: number): void {
    let largest = index;
    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);

    if (leftChildIndex < length && this.comparator(this.array[leftChildIndex], this.array[largest]) > 0) {
      largest = leftChildIndex;
    }
    if (rightChildIndex < length && this.comparator(this.array[rightChildIndex], this.array[largest]) > 0) {
      largest = rightChildIndex;
    }

    if (largest !== index) {
      [this.array[index], this.array[largest]] = [this.array[largest], this.array[index]];
      this.siftDown(largest, length);
    }
  }

  public sort(): void {
    let length = this.array.length;
    while (length > 1) {
      [this.array[0], this.array[length - 1]] = [this.array[length - 1], this.array[0]];
      length--;
      this.siftDown(0, length);
    }
  }
}
