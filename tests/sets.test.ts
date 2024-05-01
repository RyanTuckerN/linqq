import linq, { IStringEqualityComparer } from "../src";
import { LinqUtils } from "../src/util";
import { IdEqualityComparer, ObjectReferenceEqualityComparer, UniversalEqualityComparer } from "../src/util/equality-comparers.ts";
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

// test("distinctBy()", () => {
//   const arr = [obj1, obj2, obj3, obj4];
//   expect(
//     linq(arr)
//       .distinctBy((x) => x.name)
//       .toArray(),
//   ).toEqual([obj1, obj2]);

//   expect(
//     linq(arr)
//       .distinctBy((x) => x.id)
//       .toArray(),
//   ).toEqual([obj1, obj2, obj3, obj4]);
// });

// test("distinctBy() - reference equality", () => {
//   expect(
//     linq([{ ...obj1 }, { ...obj2 }, { ...obj3 }, { ...obj4 }])
//       .distinctBy((x) => x.address)
//       .toArray().length,
//   ).toBe(2); // reference equality

//   expect(
//     linq([obj1, obj2, obj3, obj4])
//       .distinctBy((x) => x)
//       .toArray().length,
//   ).toBe(4); // reference equality
// });

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
  const arr1 = [1, 2, 3, 4, 5, "5", "6"];
  const arr2 = [4, 5, 6, 7, 8, "5", "6"];
  expect(linq(arr1).union(arr2).toArray().length).toEqual(10);

  expect(
    linq(arr1)
      .union(arr2, {
        hash: (a) => `${a}`,
        equals: (a, b) => a == b,
      })
      .toArray().length,
  ).toEqual(8);

  const compare = (c: IStringEqualityComparer<{ id: number; name: string }>) =>
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
  const arr1 = [1, 2, 3, 4, 5, "5", "6"];
  const arr2 = [4, 5, 6, 7, 8, "5", "6"];
  expect(linq(arr1).intersect(arr2).toArray().length).toEqual(4);

  expect(
    linq(arr1)
      .intersect(arr2, {
        hash: (a) => `${a}`,
        equals: (a, b) => a == b,
      })
      .toArray().length,
  ).toEqual(3);

  const compare = (c: IStringEqualityComparer<{ id: number; name: string }>) =>
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
  expect(
    linq(arr1)
      .except(arr2)
      .toArray().length,
  ).toEqual(3);

  const compare = (c: IStringEqualityComparer<{ id: number; name: string }>) =>
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
