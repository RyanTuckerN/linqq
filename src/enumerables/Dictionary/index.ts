import util from "util";
import { ICanEnumerate, KeyValuePair } from "../../types";
import { LinqUtils as Utils } from "../../util";
import { IDictionary } from "../../interfaces/IDictionary";
import { EnumerableBase } from "../Enumerable";
import { IEnumerable } from "../../interfaces";

export class Dictionary<TK, TV> extends EnumerableBase<KeyValuePair<TK, TV>> implements IDictionary<TK, TV> {
  private map: Map<TK, TV>;
  constructor(source: KeyValuePair<TK, TV>[] = []) {
    super(source);
    this.map = new Map<TK, TV>(source.map(({ key, value }) => [key, value]));
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

  public remove(key: TK): boolean {
    return this.map.delete(key);
  }

  public clear(): void {
    this.map.clear();
    super.take(0);
  }

  public containsKey(key: TK): boolean {
    return this.map.has(key);
  }

  public tryGetValue(key: TK): [true, TV] | [false, undefined] {
    const hasKey = this.map.has(key);
    return [hasKey, hasKey ? this.map.get(key) : undefined] as any;
  }

  public static createDictionary<TSource, TKey, TValue>(
    source: ICanEnumerate<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector: (x: TSource, index: number) => TValue,
  ): IDictionary<TKey, TValue> {
    const sourceArray = Array.isArray(source) ? source : [...source];
    const dictionary = new Dictionary<TKey, TValue>(
      sourceArray.map((x, i) => ({ key: keySelector(x, i), value: valueSelector(x, i) })) ,
    );
    return new Proxy(dictionary, {
      get(target, property) {
        if (property in target) {
          return target[property as keyof typeof target];
        }

        // Ok, so here is where things get a little weird...
        // We want to allow direct access to the dictionary values by key
        // key can be ANY type, but because we are using a proxy, the property is always a string or a symbol
        // so if the dictionary had a numeric key, we would not be able to access it directly, however...
        if (!target.map.has(property as any)) {
          if (typeof property === "string" && `${+property}` === property && target.map.has(+property as any)) {
            return target.map.get(+property as any);
          }
          throw new Error(`Key ${Utils.ensureString(property)} not found in dictionary`);
        }
        return target.map.get(property as any);
      },
      set(target, property, value) {
        if (property in target && property === "source") {
          // target["source"] = value;
          console.log("source, wtf is this? Why did I add this line???");
          console.log("was previously returning `true`, but why?");
          // return true;
        }
        try {
          target.add({ key: property as TKey, value: value as TValue });
          return true;
        } catch (e) {
          return false;
        }
      },
      ownKeys(target: Dictionary<TKey, TValue>): ArrayLike<any> {
        return [...target.map.keys()];
      },
      getOwnPropertyDescriptor(target, property) {
        if (target.map.has(property as any)) {
          return {
            enumerable: true,
            configurable: true,
            value: target.map.get(property as any),
          };
        }
        return Object.getOwnPropertyDescriptor(target, property);
      },
    }) as IDictionary<TKey, TValue>;
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
