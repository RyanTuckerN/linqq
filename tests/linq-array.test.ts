import linq from "../src";
import { EnumerableBase } from "../src/enumerables/Enumerable";

test("linq() function should return a LinqArray", () => {
  expect(linq(numsArray)).toBeInstanceOf(EnumerableBase);
});

test("toArray()", () => {
  expect(linq(numsArray).toArray()).toEqual([1, 2, 3, 4, 5]);
});

const numsArray = [1, 2, 3, 4, 5];
