import linq, { Enumerable } from "../src";

test(" *** Filtering ***", () => {
  expect(emptyLinqArray).toHaveProperty("where");
  expect(emptyLinqArray.where).toBeInstanceOf(Function);
});

test("where()", () => {
  expect(
    linq(numsArray)
      .where((x) => x > 2)
      .toArray(),
  ).toEqual([3, 4, 5]);
});

test("where() - chaining", () => {
  expect(
    linq(numsArray)
      .where((x) => x > 2)
      .where((x) => x < 5)
      .toArray(),
  ).toEqual([3, 4]);

  expect(
    linq(numsArray)
      .where((x) => x > 2)
      .where((x) => x < 5)
      .where((x) => x > 3)
      .toArray(),
  ).toEqual([4]);

  expect(
    linq(numsArray)
      .where((x) => x > 2)
      .where((x) => x < 5)
      .where((x) => x > 3)
      .where((x) => x < 4)
      .toArray(),
  ).toEqual([]);
});

test("where() - with index", () => {
  expect(
    linq(numsArray)
      .where((_, i) => i > 2)
      .toArray(),
  ).toEqual([4, 5]);

  expect(
    Enumerable.range(0, 10)
      .where((_, i) => i > 5)
      .toArray(),
  ).toEqual([6, 7, 8, 9]);

  expect(
    Enumerable.range(0, 10)
      .where((_, i) => i > 5) // 6, 7, 8, 9
      .where((_, i) => i > 1) // 8, 9
      .where((_, i) => i === 1) // 9
      .single(),
  ).toBe(9);
});

// Additional `where()` tests
test("where() - empty input", () => {
  expect(
    linq([])
      .where((x) => x > 10)
      .toArray(),
  ).toEqual([]);
});

test("where() - all elements filtered out", () => {
  expect(
    linq(numsArray)
      .where((x) => x > 10)
      .toArray(),
  ).toEqual([]);
});

test("where() - all elements pass", () => {
  expect(
    linq(numsArray)
      .where((x) => x > 0)
      .toArray(),
  ).toEqual([1, 2, 3, 4, 5]);
});

// Tests for `select()`
test("select() - basic projection", () => {
  expect(
    linq(numsArray)
      .select((x) => x * 2)
      .toArray(),
  ).toEqual([2, 4, 6, 8, 10]);
});

test("select() - projection with index", () => {
  expect(
    linq(numsArray)
      .select((x, i) => x + i)
      .toArray(),
  ).toEqual([1, 3, 5, 7, 9]);
});

test("select() - chaining projections", () => {
  expect(
    linq(numsArray)
      .select((x) => x * 2)
      .select((x) => x + 1)
      .toArray(),
  ).toEqual([3, 5, 7, 9, 11]);
});

test("where() and select() - combination", () => {
  expect(
    linq(numsArray)
      .where((x) => x > 2)
      .select((x) => x * 2)
      .toArray(),
  ).toEqual([6, 8, 10]);
});

test("where() and select() - combination alternating", () => {
  expect(
    Enumerable.range(0, 10)
      .select((x) => x * 2) // 0, 2, 4, 6, 8, 10, 12, 14, 16, 18
      .select((x) => x * 4) // 0, 8, 16, 24, 32, 40, 48, 56, 64, 72
      .where((x) => x > 10) // 16, 24, 32, 40, 48, 56, 64, 72
      .select((x) => x / 10) // 1.6, 2.4, 3.2, 4, 4.8, 5.6, 6.4, 7.2
      .where((x) => Math.floor(x % 2) === 0) // 2.4, 4, 4.8, 6.4
      .select((x) => Math.round(x)) // 2, 4, 5, 6
      .toArray(),
  ).toEqual([2, 4, 5, 6]);
});

test("where() and select() - index", () => {
  expect(
    linq(numsArray)
      .where((x, i) => i > 2)
      .select((x, i) => x + i)
      .toArray(),
  ).toEqual([4, 6]);
});

test("where() and select() - index and projection", () => {
  expect(
    linq(numsArray)
      .where((x, i) => i > 2) // 4, 5
      .select((x, i) => (x + i) * 2) // 8, 12
      .toArray(),
  ).toEqual([8, 12]);
});

test("where() and select() - alternating with index", () => {
  expect(
    Enumerable.range(0, 20)
      .where((x, i) => i > 5) // 6, 7, 8, 9
      .select((x, i) => x + i) // 6, 8, 10, 12
      .where((x, i) => i > 1) // 10, 12
      .select((x, i) => x + i) // 10, 13
      .where((x, i) => i === 1) // 13
      .single(),
  ).toEqual(13);
});

const emptyLinqArray = linq([]);
const numsArray = [1, 2, 3, 4, 5];
