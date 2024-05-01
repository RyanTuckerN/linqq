export interface IEqualityComparer<T> {
    equals(x: T, y: T): boolean;
    hash(obj: T): string;
}