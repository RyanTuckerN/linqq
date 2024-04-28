import util from "util";
import {
  KeyValuePair,
} from "../types";
import { LinqUtils as Utils } from "../util";
import { IEnumerable } from "../interfaces/IEnumerable";
import { IDictionary } from "../interfaces/IDictionary";
import { DelegatedEnumerable } from "./delegated-enumerable";
import { Enumerable } from "./enumerable";
export class Dictionary<TK, TV> extends DelegatedEnumerable<KeyValuePair<TK, TV>, IDictionary<TK,TV>> implements IDictionary<TK, TV> {
  private _map: Map<TK, TV> = new Map();
  protected source: IEnumerable<KeyValuePair<TK, TV>>;
  private constructor(source: IEnumerable<KeyValuePair<TK, TV>>) {
    super(Enumerable.empty());
    this._map = new Map<TK, TV>();
    source.forEach(({key, value}) => this._map.set(key, value));
    this.source = source.where((x) => this._map.has(x.key)).toList();
  }

  public get keys(): Iterable<TK> {
    return this._map.keys();
  }

  public get values(): Iterable<TV> {
    return this._map.values();
  }

  public get entries(): Iterable<[TK, TV]> {
    return this._map.entries();
  }

  public add({ key, value }: KeyValuePair<TK, TV>): boolean {
    if (this._map.has(key)) {
      throw new Error(`Key ${Utils.ensureString(key)} already exists in dictionary`);
    }
    this._map.set(key, value);
    return true;
  }

  public remove(key: TK): boolean {
    const sourceElement = this.source.firstOrDefault((x) => x.key === key);
    if (sourceElement) {
      this.source = this.source.except([sourceElement]);
    }
    return this._map.delete(key);
  }

  public clear(): void {
    this.forEach((d) => this.remove(d.key));
  }

  public containsKey(key: TK): boolean {
    return this._map.has(key);
  }

  public tryGetValue(key: TK): [true, TV] | [false, undefined] {
    const hasKey = this._map.has(key);
    return [hasKey, hasKey ? this._map.get(key) : undefined] as any;
  }

  public static createDictionary<TSource, TKey, TValue>(
    source: IEnumerable<TSource>,
    keySelector: (x: TSource, index: number) => TKey,
    valueSelector: (x: TSource, index: number) => TValue,
  ): IDictionary<TKey, TValue> {
    const dictionary = new Dictionary(
      source.select((val, i) => ({ key: keySelector(val, i), value: valueSelector(val, i) })),
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
        if (!target._map.has(property as any)) {
          if (typeof property === "string" && `${+property}` === property && target._map.has(+property as any)) {
            return target._map.get(+property as any);
          }
          throw new Error(`Key ${Utils.ensureString(property)} not found in dictionary`);
        }
        return target._map.get(property as any);
      },
      set(target, property, value) {
        if (property in target && property === 'source') {
          target["source"] = value;
          return true;
        }
        try {
          target.add({ key: property as TKey, value: value as TValue });
          return true;
        } catch (e) {
          return false;
        }
      },
      ownKeys(target: Dictionary<TKey, TValue>): ArrayLike<any> {
        return [...target._map.keys()];
      },
      getOwnPropertyDescriptor(target, property) {
        if (target._map.has(property as any)) {
          return {
            enumerable: true,
            configurable: true,
            value: target._map.get(property as any),
          };
        }
        return Object.getOwnPropertyDescriptor(target, property);
      },
    }) as IDictionary<TKey, TValue>;
  }

  protected createInstance(data: IEnumerable<KeyValuePair<TK, TV>>): IDictionary<TK, TV> {
    return Dictionary.createDictionary(data, (x) => x.key, (x) => x.value);
  }

  toString() {
    const entries = Array.from(this._map.entries())
      .map(([key, value]) => `${Utils.ensureString(key)} => ${Utils.ensureString(value)}`)
      .join(", ");
    return `Dictionary(${this._map.size}): {${entries}}`;
  }

  [util.inspect.custom] = () => this.toString();
}
