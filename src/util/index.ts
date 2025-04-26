export class Utils {
  public static defaultSource<T>(source: T[] = []): T[] {
    return source;
  }

  public static cast<TOut>(source: any): TOut {
    return source as TOut;
  }

  public static ensureString(value: any): string {
    return String(value);
  }

  public static combinePredicates<TSource>(
    predicate1: (item: TSource) => boolean,
    predicate2: (item: TSource) => boolean,
  ): (item: TSource) => boolean {
    return (item) => predicate1(item) && predicate2(item);
  }

  public static combineSelectors<TSource, TMiddle, TResult>(
    selector1: (item: TSource) => TMiddle,
    selector2: (item: TMiddle) => TResult,
  ): (item: TSource) => TResult {
    return (item) => selector2(selector1(item)) as TResult;
  }
}
