import { IEnumerable } from "../../interfaces/IEnumerable";
import { EnumerableBase, State } from "./enumerable-base";
import { LinqUtils as Utils } from "../../util";
import { ICanEnumerate } from "../..";
export class Enumerable<T> extends EnumerableBase<T> implements IEnumerable<T> {
  public static createFromState<T>(state: State): IEnumerable<T> {
    return new Enumerable<T>(state);
  }

  public static from<T>(source: ICanEnumerate<T>): IEnumerable<T> {
    return Enumerable.createFromState(Utils.defaultState(Array.from(source)));
  }

  public static empty<T>(): IEnumerable<T> {
    return Enumerable.createFromState<T>(Utils.defaultState());
  }

  public static repeat<T>(element: T, count: number): IEnumerable<T> {
    if (count < 0) return Enumerable.from([]);
    count = Math.floor(count);
    const arr = Array(count).fill(element);
    return Enumerable.from(arr);
  }

  public static range(start: number, count: number): IEnumerable<number> {
    count = Math.floor(count);

    if (count < 0) return Enumerable.from([]);
    const arr = Array(count)
      .fill(0)
      .map((_, i) => start + i);
    return Enumerable.from(arr);
  }

  public toString(): string {
    return `Enumerable: ${super.toString()}`;  
  }
}
