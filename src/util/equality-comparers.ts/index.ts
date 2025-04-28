import { IEqualityComparer } from "@interfaces";

export class UniversalEqualityComparer<T> implements IEqualityComparer<T> {
  private objectMap = new WeakMap<object, number>();
  private idCounter = 0;

  hash(item: T): string {
    if (isPrimitive(item)) {
      return `${typeof item}_${String(item)}`;
    } else if (isObject(item)) {
      if (!this.objectMap.has(item)) {
        this.objectMap.set(item, ++this.idCounter);
      }
      return `hash_${this.objectMap.get(item)}`;
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

function hashObject(obj: object): string {
  let cache: Set<any> | null = new Set();
  const str = JSON.stringify(obj, (key, val) => {
    if (typeof val === "object" && val !== null) {
      if (cache!.has(val)) {
        return "[Circular]";
      }
      cache!.add(val);
    }
    return val;
  });
  cache = null; // Clear the cache
  return str;
}

export class GroupByEqualityComparer<T> implements IEqualityComparer<T> {
  hash(item: T): string {
    if (isPrimitive(item)) {
      return `${typeof item}:${String(item)}`;
    } else if (typeof item === "object" && item !== null) {
      return `obj:${hashObject(item)}`;
    }
    throw new Error("Unsupported key type for hashing.");
  }

  equals(a: T, b: T): boolean {
    if (isPrimitive(a) && isPrimitive(b)) {
      return a === b;
    }
    if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
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

type Primitive = string | number | boolean | symbol | bigint | null | undefined;
function isPrimitive(value: any): value is Primitive {
  return (typeof value !== "object" && typeof value !== "function") || value === null;
}

function isObject(value: any): value is object {
  return typeof value === "object" && value !== null;
}
