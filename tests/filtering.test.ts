import linq from "../src";

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

const emptyLinqArray = linq([]);
const numsArray = [1, 2, 3, 4, 5];
