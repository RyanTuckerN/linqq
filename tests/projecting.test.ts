import { linqq as linq } from "../src";

test(" *** Projecting ***", () => {
  expect(emptyLinqArray).toHaveProperty("select");
  expect(emptyLinqArray).toHaveProperty("selectMany");
  expect(emptyLinqArray.select).toBeInstanceOf(Function);
  expect(emptyLinqArray.selectMany).toBeInstanceOf(Function);
});

test("select()", () => {
  expect(
    linq(numsArray)
      .select((x) => x * 2)
      .toArray(),
  ).toEqual([2, 4, 6, 8, 10]);
});

test("selectMany()", () => {
  const people = linq([
    { name: "Alice", hobbies: ["reading", "swimming"] },
    { name: "Bob", hobbies: ["biking", "hiking"] },
    { name: "Charlie", hobbies: ["fishing", "camping"] },
  ]);

  const hobbies = people.selectMany((x) => x.hobbies).toArray();
  expect(hobbies).toEqual(["reading", "swimming", "biking", "hiking", "fishing", "camping"]);
});


const emptyLinqArray = linq([]);
const numsArray = [1, 2, 3, 4, 5];