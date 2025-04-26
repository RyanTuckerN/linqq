// import { EnumerableBase } from "@core/enumerable-base";
// import { IGrouping } from "@interfaces/IGrouping";
// import { Exception } from "src/validator/exception";

// export class Grouping<TKey, TValue> extends EnumerableBase<TValue> implements IGrouping<TKey, TValue> {
//   public static createGrouping<TKey, TValue>(source: Iterable<TValue>, key: TKey): IGrouping<TKey, TValue> {
//     return new Grouping<TKey, TValue>(source, key);
//   }

//   constructor(
//     protected source: Iterable<TValue>,
//     public readonly key: TKey,
//   ) {
//     if (key === undefined || key === null) throw Exception.argumentNull("key");
//     super(source);
//     this.key = key;
//   }

//   toString(): string {
//     return `Grouping: ${this.key}, ${super.toString()}`;
//   }
// }
