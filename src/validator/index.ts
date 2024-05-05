import { Numeric, Comparable } from "../types";

export class Validator {
  public static SEQUENCE_EMPTY = "Sequence contains no elements" as const;
  public static SEQUENCE_EMPTY_OR_NO_MATCH = "Sequence contains no matching element" as const;
  public static SEQUENCE_MULTIPLE = "Sequence contains more than one element" as const;
  public static SEQUENCE_SELECTOR = "Sequence requires a selector function" as const;
  public static SEQUENCE_ORDERABLE_KEY = "Sequence requires a selector function that returns an orderable key" as const;
  public static SEQUENCE_MIN_MAX =
    "Sequence requires a selector function that returns a number, bigint, or Date" as const;

  public static INDEX_OUT_OF_RANGE = "Index out of range" as const;

  public static throwIfEmpty = (result: any) => {
    if (Array.isArray(result) && result.length === 0) {
      throw new Error(this.SEQUENCE_EMPTY);
    }
    return result;
  };
}
