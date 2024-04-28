import linq from "../src";


// *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
// Partitioning
// *** *** *** *** *** *** *** *** *** *** *** *** *** *** *** ***
test(" *** Partitioning ***", () => {
  expect(emptyLinqArray).toHaveProperty("take");
  expect(emptyLinqArray).toHaveProperty("takeWhile");
  expect(emptyLinqArray).toHaveProperty("skip");
  expect(emptyLinqArray).toHaveProperty("skipWhile");
  expect(emptyLinqArray.take).toBeInstanceOf(Function);
  expect(emptyLinqArray.takeWhile).toBeInstanceOf(Function);
  expect(emptyLinqArray.skip).toBeInstanceOf(Function);
  expect(emptyLinqArray.skipWhile).toBeInstanceOf(Function);
});

test("take()", () => {
  expect(linq(numsArray).take(2).toArray()).toEqual([1, 2]);
  expect(linq(numsArray).take(0).toArray()).toEqual([]);
  expect(linq(numsArray).take(10).toArray()).toEqual([1, 2, 3, 4, 5]);
  expect(linq(numsArray).take(-1).toArray()).toEqual([]);
});

test("takeWhile()", () => {
  expect(
    linq(numsArray)
      .takeWhile((x) => x < 3)
      .toArray(),
  ).toEqual([1, 2]);
  const people = linq(peopleArray);
  expect(
    people
      .orderBy((x) => x.age)
      .takeWhile((x) => x.age < 50)
      .toArray(),
  ).toEqual([bob, alice]);
  expect(
    people
      .orderBy((x) => x.age)
      .takeWhile((x) => x.age < 30)
      .toArray(),
  ).toEqual([]);
});

test("skip()", () => {
  expect(linq(numsArray).skip(2).toArray()).toEqual([3, 4, 5]);
  expect(linq(numsArray).skip(0).toArray()).toEqual([1, 2, 3, 4, 5]);
  expect(linq(numsArray).skip(10).toArray()).toEqual([]);
  expect(linq(numsArray).skip(-1).toArray()).toEqual([1, 2, 3, 4, 5]);
});

test("skipWhile()", () => {
  expect(
    linq(numsArray)
      .skipWhile((x) => x < 3)
      .toArray(),
  ).toEqual([3, 4, 5]);

  const people = linq(peopleArray);
  expect(
    people
      .orderBy((x) => x.age)
      .skipWhile((x) => x.age < 50)
      .toArray(),
  ).toEqual([charlie]);

  expect(
    people
      .orderBy((x) => x.age)
      .skipWhile((x) => x.age < 30)
      .toArray(),
  ).toEqual([bob, alice, charlie]);
});

test("pagination -> skip() and take()", () => {
  expect(linq(numsArray).skip(2).take(2).toArray()).toEqual([3, 4]);
  expect(linq(numsArray).skip(10).take(2).toArray()).toEqual([]);
  expect(linq(numsArray).skip(2).take(10).toArray()).toEqual([3, 4, 5]);
  expect(linq(numsArray).skip(10).take(10).toArray()).toEqual([]);
});


const emptyLinqArray = linq([]);
const numsArray = [1, 2, 3, 4, 5];
const alice = {
  id: 123,
  name: "Alice",
  age: 40,
  enrolled: true,
  hobbies: ["reading", "swimming", "biking"],
};
const bob = {
  id: 234,
  name: "Bob",
  age: 30,
  enrolled: false,
  hobbies: ["biking", "hiking", "swimming"],
};
const charlie = {
  id: 345,
  name: "Charlie",
  age: 50,
  enrolled: true,
  hobbies: ["fishing", "camping", "swimming"],
};
const peopleArray = [alice, bob, charlie];