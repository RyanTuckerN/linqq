// import { IEnumerable } from "../../interfaces/IEnumerable";
// import { EnumerableBase } from "./enumerable-base";
// import { LinqUtils as Utils } from "../../util";
// import { ICanEnumerate } from "../..";

// export class Enumerable<T> extends EnumerableBase<T> implements IEnumerable<T> {
//   public static from<T>(source: ICanEnumerate<T>): IEnumerable<T> {
//     if (source instanceof Enumerable) return source;
//     return new Enumerable<T>(source);
//   }

//   public static empty<T>(): IEnumerable<T> {
//     return Enumerable.from<T>(Utils.defaultState());
//   }

//   public static repeat<T>(element: T, count: number): IEnumerable<T> {
//     if (count < 0) return Enumerable.empty<T>();
//     count = Math.floor(count);
//     const arr = Array(count).fill(element);
//     return Enumerable.from<T>(arr);
//   }

//   public static range(start: number, count: number): IEnumerable<number> {
//     count = Math.floor(count);

//     if (count < 0) return Enumerable.from([]);
//     const arr = Array(count)
//       .fill(0)
//       .map((_, i) => start + i);
//     return Enumerable.from(arr);
//   }

//   public toString(): string {
//     return `Enumerable: ${super.toString()}`;
//   }
// }
