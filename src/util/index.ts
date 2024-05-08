export class LinqUtils {
  static defaultSource<T>(source: T[] = []): T[]{
    return source;
  }
  static ensureString(value: any): string {
    return String(value);
  }
}
