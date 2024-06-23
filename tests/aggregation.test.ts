import { linqq as linq } from "../src";

test(" *** Aggregation/Reduction ***", () => {
  expect(emptyLinqArray).toHaveProperty("aggregate");
  expect(emptyLinqArray).toHaveProperty("count");
  expect(emptyLinqArray).toHaveProperty("sum");
  expect(emptyLinqArray).toHaveProperty("average");
  expect(emptyLinqArray).toHaveProperty("max");
  expect(emptyLinqArray).toHaveProperty("min");
  expect(emptyLinqArray.aggregate).toBeInstanceOf(Function);
  expect(emptyLinqArray.count).toBeInstanceOf(Function);
  expect(emptyLinqArray.sum).toBeInstanceOf(Function);
  expect(emptyLinqArray.average).toBeInstanceOf(Function);
  expect(emptyLinqArray.max).toBeInstanceOf(Function);
  expect(emptyLinqArray.min).toBeInstanceOf(Function);
});

test("count() - numbers", () => {
  expect(linq(numsArray).count()).toBe(5);
});

test("sum() - numbers", () => {
  expect(linq(numsArray).sum()).toBe(15);
});

test("sum() - objects", () => {
  const people = linq([
    { id: 123, name: "Alice", age: 30 },
    { id: 234, name: "Bob", age: 40 },
    { id: 345, name: "Charlie", age: 50 },
  ]);
  expect(people.sum((x) => x.age)).toBe(120);
  // expect(() => people.sum()).toThrow(Validator.SEQUENCE_SELECTOR);
  // expect(() => emptyLinqArray.sum()).toThrow(Validator.SEQUENCE_EMPTY);
});

test("average() - numbers", () => {
  expect(linq(numsArray).average()).toBe(3);
});

test("average() - objects", () => {
  const people = linq([
    { id: 123, name: "Alice", age: 30 },
    { id: 234, name: "Bob", age: 40 },
    { id: 345, name: "Charlie", age: 50 },
  ]);
  expect(people.average((x) => x.age)).toBe(40);
  // expect(() => people.average()).toThrow(Validator.SEQUENCE_SELECTOR);
  // expect(() => emptyLinqArray.average()).toThrow(Validator.SEQUENCE_EMPTY);
});

test("max() - numbers", () => {
  expect(linq(numsArray).max()).toBe(5);
  // expect(() => emptyLinqArray.max()).toThrow(Validator.SEQUENCE_EMPTY);
});

test("max() - objects", () => {
  const people = linq([
    { id: 123, name: "Alice", age: 30 },
    { id: 234, name: "Bob", age: 40 },
    { id: 345, name: "Charlie", age: 50 },
  ]);
  expect(people.max((x) => x.age)).toBe(50);
  // expect(() => people.max()).toThrow(Validator.SEQUENCE_MIN_MAX);
  // expect(() => emptyLinqArray.max()).toThrow(Validator.SEQUENCE_EMPTY);
});

test("max() - dates", () => {
  expect(linq(datesArray).max()).toEqual(new Date("2021-05-01"));
});

test("min() - numbers", () => {
  expect(linq(numsArray).min()).toBe(1);
  // expect(() => emptyLinqArray.min()).toThrow(Validator.SEQUENCE_EMPTY);
});

test("min() - objects", () => {
  const people = linq([
    { id: 123, name: "Alice", age: 30 },
    { id: 234, name: "Bob", age: 40 },
    { id: 345, name: "Charlie", age: 50 },
  ]);
  expect(people.min((x) => x.age)).toBe(30);
  // expect(() => people.min()).toThrow(Validator.SEQUENCE_MIN_MAX);
});

test("min() - dates", () => {
  expect(linq(datesArray).min()).toEqual(new Date("2021-01-01"));
});

test("aggregate() - numbers", () => {
  expect(
    linq(numsArray).aggregate(
      0,
      (sum, n) => sum + n,
      (x) => x,
    ),
  ).toBe(15);

  expect(linq(numsArray).aggregate(0, (sum, n) => sum + n)).toBe(15);
});

const emptyLinqArray = linq([]);
const numsArray = [1, 2, 3, 4, 5];
const datesArray = [
  new Date("2021-01-01"),
  new Date("2021-02-01"),
  new Date("2021-03-01"),
  new Date("2021-04-01"),
  new Date("2021-05-01"),
];
