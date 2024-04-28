import linq from "../src";

test(" *** Quantifiers ***", () => {
  expect(emptyLinqArray).toHaveProperty("any");
  expect(emptyLinqArray).toHaveProperty("all");
  expect(emptyLinqArray).toHaveProperty("contains");
  expect(emptyLinqArray.any).toBeInstanceOf(Function);
  expect(emptyLinqArray.all).toBeInstanceOf(Function);
  expect(emptyLinqArray.contains).toBeInstanceOf(Function);
});

test("any()", () => {
  expect(linq(numsArray).any()).toBe(true);
  expect(emptyLinqArray.any()).toBe(false);
  expect(linq(numsArray).any((x) => x > 4)).toBe(true);
  expect(linq(numsArray).any((x) => x > 5)).toBe(false);
});

test("all()", () => {
  expect(linq(numsArray).all((x) => x > 0)).toBe(true);
  expect(linq(numsArray).all((x) => x > 1)).toBe(false);
});

test("contains()", () => {
  expect(linq(numsArray).contains(3)).toBe(true);
  expect(linq(numsArray).contains(6)).toBe(false);
});

const emptyLinqArray = linq([]);
const numsArray = [1, 2, 3, 4, 5];
