import { linqq as linq, IEqualityComparer } from "../src";
import {
  IdEqualityComparer,
  ObjectReferenceEqualityComparer,
  UniversalEqualityComparer,
} from "../src/util/equality-comparers.ts";
const add1 = { id: 99 },
  add2 = { id: 98 };
const obj1 = { id: 1, name: "Alice", address: add1 };
const obj2 = { id: 2, name: "Bob", address: add2 };
const obj3 = { id: 3, name: "Alice", address: add1 };
const obj4 = { id: 4, name: "Bob", address: add2 };

// set tests, so distinct, distinctBy, union, intersect, except

test("distinct()", () => {
  const arr = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5];
  const distinct = linq(arr).distinct().toArray();
  expect(distinct).toEqual([1, 2, 3, 4, 5]);
});

test("distinct() - reference equality", () => {
  const obj1 = { id: 1 };
  const obj2 = { id: 2 };

  expect(
    linq([obj1, obj2, { ...obj1 }, { ...obj2 }])
      .distinct()
      .toArray().length,
  ).toBe(4);

  expect(linq([obj1, obj2, obj1, obj2]).distinct().toArray().length).toBe(2); // reference equality
});

test("distinctBy()", () => {
  const arr = [obj1, obj2, obj3, obj4];
  expect(
    linq(arr)
      .distinctBy((x) => x.name)
      .toArray(),
  ).toEqual([obj1, obj2]);

  expect(
    linq(arr)
      .distinctBy((x) => x.id)
      .toArray(),
  ).toEqual([obj1, obj2, obj3, obj4]);
});

test("distinctBy() - reference equality", () => {
  expect(
    linq([{ ...obj1 }, { ...obj2 }, { ...obj3 }, { ...obj4 }])
      .distinctBy((x) => x.address)
      .toArray().length,
  ).toBe(2); // reference equality

  expect(
    linq([obj1, obj2, obj3, obj4])
      .distinctBy((x) => x)
      .toArray().length,
  ).toBe(4); // reference equality
});

test("union()", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const arr2 = [4, 5, 6, 7, 8];
  const union = linq(arr1).union(arr2).toArray();
  expect(union).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
});

test("union() - reference equality", () => {
  expect(linq([obj1, obj2, obj3]).union([obj2, obj3, obj4]).toArray().length).toBe(4);

  expect(
    linq([{ ...obj1 }, { ...obj2 }, { ...obj3 }])
      .union([{ ...obj2 }, { ...obj3 }, { ...obj4 }])
      .toArray().length,
  ).toBe(6);
});

test("union(), - equality comparer", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const arr2 = [4, 5, 6, 7, 8];
  expect(linq(arr1).union(arr2).toArray().length).toEqual(8);

  expect(
    linq(arr1)
      .union(arr2, {
        hash: (a) => `${a}`,
        equals: (a, b) => a == b,
      })
      .toArray().length,
  ).toEqual(8);

  const compare = (c: IEqualityComparer<{ id: number; name: string }>) =>
    linq([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ])
      .union(
        [
          { id: 2, name: "Bob" },
          { id: 3, name: "Charlie" },
        ],
        c,
      )
      .toArray().length;

  expect(compare(new UniversalEqualityComparer())).toBe(4);
  expect(compare(new IdEqualityComparer())).toBe(3);
});

test("intersect()", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const arr2 = [4, 5, 6, 7, 8];
  const intersect = linq(arr1).intersect(arr2).toArray();
  expect(intersect).toEqual([4, 5]);
});

test("intersect() - reference equality", () => {
  expect(linq([obj1, obj2, obj3]).intersect([obj2, obj3, obj4]).toArray().length).toBe(2);

  expect(
    linq([{ ...obj1 }, { ...obj2 }, { ...obj3 }])
      .intersect([{ ...obj2 }, { ...obj3 }, { ...obj4 }])
      .toArray().length,
  ).toBe(0);
});

test("intersect(), - equality comparer", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const arr2 = [6, 7, 8, 4, 5];

  expect(linq(arr1).intersect(arr2).toArray().length).toEqual(2);
  expect(linq(arr1).intersect(arr2).toArray().length).toEqual(2);

  const compare = (c: IEqualityComparer<{ id: number; name: string }>) =>
    linq([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ])
      .intersect(
        [
          { id: 2, name: "Bob" },
          { id: 3, name: "Charlie" },
        ],
        c,
      )
      .toArray().length;

  expect(compare(new UniversalEqualityComparer())).toBe(0);
  expect(compare(new IdEqualityComparer())).toBe(1);
});

test("except()", () => {
  const arr1 = [1, 2, 3, 4, 5];
  const arr2 = [4, 5, 6, 7, 8];
  const except = linq(arr1).except(arr2).toArray();
  expect(except).toEqual([1, 2, 3]);
});

test("except() - reference equality", () => {
  expect(linq([obj1, obj2, obj3]).except([obj2, obj3, obj4]).toArray().length).toBe(1);

  expect(
    linq([{ ...obj1 }, { ...obj2 }, { ...obj3 }])
      .except([{ ...obj2 }, { ...obj3 }, { ...obj4 }])
      .toArray().length,
  ).toBe(3);
});

test("except(), - equality comparer", () => {
  expect(
    linq([obj1, obj2])
      .except([obj3, obj4], {
        hash: (a) => new ObjectReferenceEqualityComparer().hash(a.address),
        equals: (a, b) => new ObjectReferenceEqualityComparer().equals(a.address, b.address),
      })
      .toArray().length,
  ).toBe(0);

  const arr1 = [1, 2, 3, 4, 5];
  const arr2 = [6, 7, 8, 4, 5];
  expect(linq(arr1).except(arr2).toArray().length).toEqual(3);

  const compare = (c: IEqualityComparer<{ id: number; name: string }>) =>
    linq([
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ])
      .except(
        [
          { id: 2, name: "Bob" },
          { id: 3, name: "Charlie" },
        ],
        c,
      )
      .toArray().length;

  expect(compare(new UniversalEqualityComparer())).toBe(2);
  expect(compare(new IdEqualityComparer())).toBe(1);
});

test("primitive data uniqueness (UniversalEqualityComparer)", () => {
  const arr = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, "1", "2", "3", "4", "5"];
  const distinct = linq(arr).distinct().toArray();
  expect(distinct).toEqual([1, 2, 3, 4, 5, "1", "2", "3", "4", "5"]);
});

test("toSet()", () => {
  const arr = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5];
  const set = linq(arr).toHashSet().toArray();
  expect(set).toEqual([1, 2, 3, 4, 5]);
});

// set methods
test("toMap()", () => {
  const arr = [1, 2, 3, 4, 5];
  const map = linq(arr)
    .toHashSet({
      hash: (a) => `${a}`,
      equals: (a, b) => a == b,
    })
    .toMap();
  expect(map).toBeInstanceOf(Map);
  expect(map.size).toBe(5);
  expect(map.get("1")).toBe(1);
  expect(map.get("2")).toBe(2);
  expect(map.get("3")).toBe(3);
  expect(map.get("4")).toBe(4);
  expect(map.get("5")).toBe(5);
});

test("toMap() - equality comparer", () => {
  const arr = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];
  const map = linq(arr)
    .toHashSet(new IdEqualityComparer())
    .toMap();
  expect(map).toBeInstanceOf(Map);
  expect(map.size).toBe(2);
  expect(map.get("1")).toEqual({ id: 1, name: "Alice" });
  expect(map.get("2")).toEqual({ id: 2, name: "Bob" });
});

test("toMap() - reference equality", () => {
  const arr = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];
  const map = linq(arr)
    .toHashSet(new ObjectReferenceEqualityComparer())
    .toMap();
  expect(map).toBeInstanceOf(Map);
  expect(map.size).toBe(2);
  expect(map.get("hash_1")).toEqual({ id: 1, name: "Alice" });
  expect(map.get("hash_2")).toEqual({ id: 2, name: "Bob" });
});

test("add()", () => {
  const set = linq([1, 2, 3]).toHashSet();
  set.add(4);
  expect(set.has(4)).toBe(true);
  expect(set.size).toBe(4);
});

test("add() - reference equality", () => {
  const set = linq([obj1, obj2]).toHashSet();
  set.add(obj3);
  expect(set.has(obj3)).toBe(true);
  expect(set.size).toBe(3);
  set.add(obj3);
  expect(set.size).toBe(3);
});

test("add() - equality comparer", () => {
  const set = linq([obj1, obj2]).toHashSet(new IdEqualityComparer());
  set.add(obj3);
  expect(set.has(obj3)).toBe(true);
  expect(set.size).toBe(3);
  set.add(obj3);
  expect(set.size).toBe(3);
});

test("clear()", () => {
  const set = linq([1, 2, 3]).toHashSet();
  set.clear();
  expect(set.size).toBe(0);
});

test("delete()", () => {
  const set = linq([1, 2, 3]).toHashSet();
  set.delete(2);
  expect(set.has(2)).toBe(false);
  expect(set.size).toBe(2);
});

test("delete() - reference equality", () => {
  const set = linq([obj1, obj2, obj3]).toHashSet();
  set.delete(obj2);
  expect(set.has(obj2)).toBe(false);
  expect(set.size).toBe(2);
});

test("delete() - equality comparer", () => {
  const set = linq([obj1, obj2, obj3]).toHashSet(new IdEqualityComparer());
  set.delete(obj2);
  expect(set.has(obj2)).toBe(false);
  expect(set.size).toBe(2);
});

test("forEach()", () => {
  const set = linq([1, 2, 3]).toHashSet();
  const arr: number[] = [];
  set.forEach((x) => arr.push(x));
  expect(arr).toEqual([1, 2, 3]);
});

test("has()", () => {
  const set = linq([1, 2, 3]).toHashSet();
  expect(set.has(2)).toBe(true);
  expect(set.has(4)).toBe(false);
});

test("keys()", () => {
  const set = linq([1, 2, 3]).toHashSet();
  const keys = Array.from(set.keys());
  expect(keys).toEqual([1, 2, 3]);
});

test("values()", () => {
  const set = linq([1, 2, 3]).toHashSet();
  const values = Array.from(set.values());
  expect(values).toEqual([1, 2, 3]);
});

test("entries()", () => {
  const set = linq([1, 2, 3]).toHashSet();
  const entries = Array.from(set.entries());
  expect(entries).toEqual([
    [1, 1],
    [2, 2],
    [3, 3],
  ]);
});

test("size", () => {
  const set = linq([1, 2, 3]).toHashSet();
  expect(set.size).toBe(3);
});
