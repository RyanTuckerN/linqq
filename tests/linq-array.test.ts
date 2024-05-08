import linq from "../src";

function *iter(){
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
}

test("linq() function should handle all iterables", () => {
  const arr = [1, 2, 3, 4, 5];
  const set = new Set(arr);
  const map = new Map(arr.map((x) => [x, x]));
  const gen = iter();
  const str = "12345";

  expect(linq(arr).toArray()).toEqual(arr);
  expect(linq(set).toArray()).toEqual(arr);
  expect(linq(map.values()).toArray()).toEqual(arr);
  expect(linq(gen).toArray()).toEqual(arr);
  expect(linq(str).select(Number).toArray()).toEqual(arr);
  expect(linq(arr).toArray()).toEqual(arr);
});

test("toArray()", () => {
  expect(linq(numsArray).toArray()).toEqual([1, 2, 3, 4, 5]);
});

const numsArray = [1, 2, 3, 4, 5];
