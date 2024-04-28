import { IEnumerable } from "../interfaces/IEnumerable";
import { EnumerableBase } from "./enumerable-base";
export class Enumerable<T> extends EnumerableBase<T> implements IEnumerable<T> {
  public static create<T>(data: T[] | IEnumerable<T>): IEnumerable<T> {
    return new Enumerable([...data]);
  }

  protected createInstance<T>(data: T[]): IEnumerable<T> {
    return Enumerable.create(data);
  }

  public static empty<T>(): IEnumerable<T> {
    return Enumerable.create<T>([]);
  }

  public static repeat<T>(element: T, count: number): IEnumerable<T> {
    if (count < 0) return Enumerable.create<T>([]);
    count = Math.floor(count);
    return Enumerable.create<T>(Array(count).fill(element));
  }

  public static range(start: number, count: number): IEnumerable<number> {
    if (count < 0) return Enumerable.create<number>([]);
    count = Math.floor(count);
    return Enumerable.create<number>(
      Array(count)
        .fill(0)
        .map((_, i) => start + i),
    );
  }

  public toArray() {
    return this._data;
  }
}
