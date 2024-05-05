import { IEqualityComparer } from "../../interfaces";

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
    } else if (isFunction(item)) {
      throw new Error("Function types cannot be hashed without a custom equality comparer.");
    } else {
      throw new Error("Unsupported type");
    }
  }

  equals(a: T, b: T): boolean {
    return a === b;
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

export class PrimitiveEqualityComparer<T> implements IEqualityComparer<T> {
  hash(item: T): string {
    return `hash_${item}`;
  }

  equals(a: T, b: T): boolean {
    return a === b;
  }
}

export class IdEqualityComparer<TId extends Primitive, T extends { id: TId }> implements IEqualityComparer<T> {
  hash(item: T): string {
    return `hash_${String(item.id)}`;
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

function isFunction(value: any): value is Function {
  return typeof value === "function";
}
