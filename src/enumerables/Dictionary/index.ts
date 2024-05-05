import util from "util";
import { KeyValuePair } from "../../types";
import { LinqUtils as Utils } from "../../util";
import { IDictionary } from "../../interfaces/IDictionary";
import { EnumerableBase } from "../Enumerable";
import { IEnumerable } from "../../interfaces";

export class Dictionary<TK, TV> extends EnumerableBase<KeyValuePair<TK, TV>> implements IDictionary<TK, TV> {
  private map: Map<TK, TV>;
  constructor(source: KeyValuePair<TK, TV>[] = []) {
    super(source);
    this.map = new Map<TK, TV>();
    source.forEach(({ key, value }) => this.map.set(key, value));
  }

  public override *[Symbol.iterator](): IterableIterator<KeyValuePair<TK, TV>> {
    for (const [key, value] of this.map.entries()) {
      yield { key, value };
    }
  }

  public get keys(): Iterable<TK> {
    return this.map.keys();
  }

  public get values(): Iterable<TV> {
    return this.map.values();
  }

  public get entries(): Iterable<[TK, TV]> {
    return this.map.entries();
  }

  public add({ key, value }: KeyValuePair<TK, TV>): boolean {
    if (this.map.has(key)) {
      throw new Error(`Key ${Utils.ensureString(key)} already exists in dictionary`);
    }
    this.map.set(key, value);
    return true;
  }

  public set(key: TK, value: TV): void {
    this.map.set(key, value);
  }

  public get(key: TK): TV | undefined {
    return this.map.get(key);
  }

  public remove(key: TK): boolean {
    return this.map.delete(key);
  }

  public clear(): void {
    this.map.clear();
  }

  public containsKey(key: TK): boolean {
    return this.map.has(key);
  }

  public tryGetValue(key: TK): [true, TV] | [false, undefined] {
    const hasKey = this.map.has(key);
    return [hasKey, hasKey ? this.map.get(key) : undefined] as any;
  }

  public static createDictionary<TSource, TKey, TValue>(
    source: Iterable<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector: (x: TSource, index: number) => TValue,
  ): IDictionary<TKey, TValue> {
    const sourceArray = Array.isArray(source) ? source : [...source];
    const dictionary = new Dictionary<TKey, TValue>(
      sourceArray.map((x, i) => ({ key: keySelector(x, i), value: valueSelector(x, i) })) ,
    );
    return dictionary;
  }

  protected clone(): IEnumerable<KeyValuePair<TK, TV>> {
    return new Dictionary(Array.from(this.map.entries()).map(([key, value]) => ({ key, value })));
  }

  toString() {
    const entries = Array.from(this.map.entries())
      .map(([key, value]) => `${Utils.ensureString(key)} => ${Utils.ensureString(value)}`)
      .join(", ");
    return `Dictionary(${this.map.size}): {${entries}}`;
  }

  [util.inspect.custom] = () => this.toString();

  // @ts-ignore, this is a getter
  next(): IteratorResult<KeyValuePair<TK, TV>> {
    return this.source[Symbol.iterator]().next();
  }
}
