import { Enumerable } from "../src";
const { empty, repeat, range } = Enumerable;
/* 
empty, repeat, range
*/
test("empty()", () => {
  expect(empty().toArray()).toEqual([]);
  const nums = empty<number>();
  expect(nums.append(1).toArray()).toEqual([1]);
});

test("repeat()", () => {
  expect(repeat(1, 3).toArray()).toEqual([1, 1, 1]);
  expect(repeat(1, 0).toArray()).toEqual([]);
  expect(repeat(1, -1).toArray()).toEqual([]);
  expect(repeat(1, 1.5).toArray()).toEqual([1]);
});

test("range()", () => {
  expect(range(1, 3).toArray()).toEqual([1, 2, 3]);
  expect(range(1, 0).toArray()).toEqual([]);
  expect(range(1, -1).toArray()).toEqual([]);
  expect(range(1, 2.5).toArray()).toEqual([1, 2]);
});
