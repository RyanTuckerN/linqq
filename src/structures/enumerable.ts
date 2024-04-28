import { IEnumerable } from "../interfaces/IEnumerable";
import { EnumerableBase } from "./enumerable-base";
import { ICanEnumerate } from "../types";

export class Enumerable<T> extends EnumerableBase<T> implements IEnumerable<T> {
  public static from<T>(data: ICanEnumerate<T>): IEnumerable<T> {
    return new Enumerable([...data]);
  }

  protected createInstance<T>(data: T[]): IEnumerable<T> {
    return Enumerable.from(data);
  }

  public static empty<T>(): IEnumerable<T> {
    return Enumerable.from<T>([]);
  }

  public static repeat<T>(element: T, count: number): IEnumerable<T> {
    if (count < 0) return Enumerable.from<T>([]);
    count = Math.floor(count);
    return Enumerable.from<T>(Array(count).fill(element));
  }

  public static range(start: number, count: number): IEnumerable<number> {
    if (count < 0) return Enumerable.from<number>([]);
    count = Math.floor(count);
    return Enumerable.from<number>(
      Array(count)
        .fill(0)
        .map((_, i) => start + i),
    );
  }

  public toArray() {
    return this._data;
  }
}
