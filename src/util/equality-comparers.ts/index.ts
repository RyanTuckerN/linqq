import { IEqualityComparer } from "@interfaces";

export class UniversalEqualityComparer<T> implements IEqualityComparer<T> {
  private objectMap = new WeakMap<object, number>();
  private idCounter = 0;

  hash(item: T): string {
    if (isPrimitive(item)) {
      return `${Tag.prim}${item}`;
    } else if (isObject(item)) {
      if (!this.objectMap.has(item)) {
        this.objectMap.set(item, ++this.idCounter);
      }
      return `${Tag.obj}${this.objectMap.get(item)}`;
    } else {
      throw new Error("Unsupported type");
    }
  }

  equals(a: T, b: T): boolean {
    return a === b;
  }
}

function shallowEqual(a: object, b: object): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!(key in b) || (a as any)[key] !== (b as any)[key]) {
      return false;
    }
  }
  return true;
}

const enum Tag {
  prim = "p:",
  obj = "o:",
}

export function hashObject(obj: object): string {
  const keys = Object.keys(obj);
  if (keys.length > 1) keys.sort();

  let out = "";
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i] as keyof typeof obj;
    const v = obj[k];

    // we only support primitives at this level
    // undefined ⇒ '', null ⇒ 'null', others via String()
    out += k + ":" + (v == null ? String(v) : v) + ";";
  }
  return out;
}

export class GroupByEqualityComparer<T> implements IEqualityComparer<T> {
  hash(item: T): string {
    if (isPrimitive(item)) {
      return `${Tag.prim}${item}`;
    }
    try {
      // try to use JSON.stringify first, which is faster for most cases
      return Tag.obj + JSON.stringify(item);
    } catch {
      // circular reference or other error? Use custom hash, which is a lil slower
      if (isObject(item)) {
        return Tag.obj + hashObject(item!);
      }
      throw new Error("Unsupported key type for hashing.");
    }
  }

  equals(a: T, b: T): boolean {
    if (isPrimitive(a)) return a === b;

    if (a === b) return true;

    if (typeof a === "object" && typeof b === "object" && a && b) {
      return shallowEqual(a, b);
    }
    return false;
  }
}

export class ObjectReferenceEqualityComparer<T extends object> implements IEqualityComparer<T> {
  private objectMap = new WeakMap<T, number>();
  private idCounter = 0;

  hash(item: T): string {
    if (!this.objectMap.has(item)) {
      this.objectMap.set(item, ++this.idCounter);
    }
    return `hash_${this.objectMap.get(item)}`;
  }

  equals(a: T, b: T): boolean {
    return a === b; // Direct reference comparison
  }
}

export class IdEqualityComparer<TId extends Primitive, T extends { id: TId }> implements IEqualityComparer<T> {
  hash(item: T): string {
    return `${String(item.id)}`;
  }

  equals(a: T, b: T): boolean {
    return a.id === b.id;
  }
}

type Primitive = string | number | boolean | bigint | null | undefined;
function isPrimitive(value: any): value is Primitive {
  if (value == null) return true;
  const t = typeof value;
  return t === "string" || t === "number" || t === "boolean" || t === "bigint" || t === "symbol";
}

function isObject(value: any): value is object {
  return Object(value) === value;
}
