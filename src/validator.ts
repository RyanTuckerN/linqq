import { Numeric, Comparable } from "./types";

export class LinqArrayValidator {
  public static SEQUENCE_EMPTY = "Sequence contains no elements" as const;
  public static SEQUENCE_EMPTY_OR_NO_MATCH = "Sequence contains no matching element" as const;
  public static SEQUENCE_MULTIPLE = "Sequence contains more than one matching element" as const;
  public static SEQUENCE_SELECTOR = "Sequence requires a selector function" as const;
  public static SEQUENCE_ORDERABLE_KEY = "Sequence requires a selector function that returns an orderable key" as const;
  public static SEQUENCE_MIN_MAX =
    "Sequence requires a selector function that returns a number, bigint, or Date" as const;

  public static INDEX_OUT_OF_RANGE = "Index is out of range" as const;

  public static throwIfEmpty = (result: any) => {
    if (Array.isArray(result) && result.length === 0) {
      throw new Error(this.SEQUENCE_EMPTY);
    }
    return result;
  };

  public static throwIfIndexOutOfRange = (result: any[], index: number) => {
    if ((Array.isArray(result) && !(index in result))) {
      throw new Error(this.INDEX_OUT_OF_RANGE);
    }
    return result[index];
  };

  public static throwIfMultiple = (result: any[]) => {
    if (result.length > 1) {
      throw new Error(this.SEQUENCE_MULTIPLE);
    }
    return result;
  };

  public static throwIfMissingSelector = (arr: any[], typeSelector: (el: any) => boolean) => {
    if (!arr.every(typeSelector)) {
      throw new Error(this.SEQUENCE_SELECTOR);
    }
  };

  public static throwIfMissingNumberSelector = (arr: any[]) => {
    this.throwIfMissingSelector(arr, this._isNumeric);
  };

  public static throwIfInvalidMinMaxSelector = (arr: any[]) => {
    if (!arr.every(this._isComparable)) {
      throw new Error(this.SEQUENCE_MIN_MAX);
    }
  };

  private static _isNumeric(n: any): n is Numeric {
    return typeof n === "number" || typeof n === "bigint";
  }

  private static _isComparable(n: any): n is Comparable {
    return typeof n === "number" || typeof n === "bigint" || n instanceof Date;
  }

  // not currently being used
  // private static _isOrderable(n: any): n is Orderable {
  //   return typeof n === 'string' || typeof n === "number" || typeof n === "bigint" || n instanceof Date;
  // }
}
