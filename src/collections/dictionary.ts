import { EnumerableBase } from "@core/enumerable-base";
import { IDictionary } from "@interfaces/IDictionary";
import { Indexable, KeyValuePair } from "src/types";
import { Utils } from "src/util";
import { Exception } from "src/validator/exception";
export class Dictionary<TK, TV, TPrev = TV>
  extends EnumerableBase<KeyValuePair<TK, TV>>
  implements IDictionary<TK, TV>
{
  private map: Map<TK, TV>;
  private constructor(
    source: Iterable<TPrev>,
    keySelector?: (x: TPrev, index: number) => TK,
    valueSelector?: (x: TPrev, index: number) => TV,
  ) {
    if (source instanceof Map) {
      super(Dictionary.fromMapToIterable(source as Map<TK, TV>));
      this.map = source as Map<TK, TV>;
      return Dictionary.constructProxy(this);
    }

    if (!keySelector) throw Exception.argumentNull("keySelector");

    const map = new Map<TK, TV>();
    let index = 0;
    for (const item of source) {
      map.set(keySelector(item, index), valueSelector ? valueSelector(item, index) : (item as TV & TPrev));
      index++;
    }
    super(Dictionary.fromMapToIterable(map));
    this.map = map;
    return Dictionary.constructProxy(this);
  }

  public static fromMap<TK, TV>(map: Map<TK, TV>): IDictionary<TK, TV> {
    return new Dictionary(map);
  }

  private static constructProxy<TK, TV>(target: Dictionary<TK, TV>) {
    return new Proxy(target, {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        let propKey = prop as any;
        if (typeof propKey === "string" && !isNaN(+propKey)) {
          propKey = +propKey;
        }

        if (!target.containsKey(propKey)) {
          return undefined;
        }

        return target.get(propKey);
      },
      set(target, prop, value, receiver) {
        if (prop in target) return Reflect.set(target, prop, value, receiver);
        let propKey = prop as any;
        if (typeof propKey === "string" && !isNaN(+propKey)) {
          propKey = +propKey;
        }
        target.set(propKey, value);
        return true;
      },
    }) as IDictionary<TK, TV> & Indexable<TK, TV> & any;
  }

  private static *fromMapToIterable<TK, TV>(map: Map<TK, TV>): Iterable<KeyValuePair<TK, TV>> {
    for (const [key, value] of map.entries()) {
      yield { key, value };
    }
  }

  public *[Symbol.iterator](): IterableIterator<KeyValuePair<TK, TV>> {
    yield* Dictionary.fromMapToIterable(this.map);
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

  public get(key: TK): TV {
    if (!this.map.has(key)) throw Exception.invalidOperation("Key not found in dictionary");
    return this.map.get(key)!;
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
    if (hasKey) return [true, this.map.get(key)!];
    return [false, undefined];
  }

  public forEach(action: (kvp: KeyValuePair<TK, TV>) => void, thisArg?: any): void {
    for (const [key, value] of this.map.entries()) {
      action.call(thisArg, { key, value });
    }
  }

  public static createDictionary<TSource, TKey, TValue>(
    source: Iterable<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector?: (x: TSource, index: number) => TValue,
  ): IDictionary<TKey, TValue> & Indexable<TKey, TValue> {
    if (!source) throw Exception.argumentNull("source");
    if (!keySelector) throw Exception.argumentNull("keySelector");
    return new Dictionary<TKey, TValue>(source as any, keySelector as any, valueSelector as any) as IDictionary<
      TKey,
      TValue
    > &
      Indexable<TKey, TValue>;
  }

  toString() {
    const entries = Array.from(this.map.entries())
      .map(([key, value]) => `${Utils.ensureString(key)} => ${Utils.ensureString(value)}`)
      .join(", ");
    return `Dictionary(${this.map.size}): {${entries}}`;
  }

  toJSON() {
    const obj: Record<string, TV> = {};
    for (const [key, value] of this.map.entries()) {
      obj[Utils.ensureString(key)] = value;
    }
    return obj;
  }
}
