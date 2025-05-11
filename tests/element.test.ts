import { Exception } from "../src/validator/exception";
import { linqq as linq } from "../src";

test(" *** Element ***", () => {
  expect(emptyLinqArray).toHaveProperty("first");
  expect(emptyLinqArray).toHaveProperty("last");
  expect(emptyLinqArray).toHaveProperty("single");
  expect(emptyLinqArray).toHaveProperty("elementAt");
  expect(emptyLinqArray).toHaveProperty("firstOrDefault");
  expect(emptyLinqArray).toHaveProperty("lastOrDefault");
  expect(emptyLinqArray).toHaveProperty("singleOrDefault");
  expect(emptyLinqArray).toHaveProperty("elementAtOrDefault");
  expect(emptyLinqArray).toHaveProperty("append");
  expect(emptyLinqArray.first).toBeInstanceOf(Function);
  expect(emptyLinqArray.last).toBeInstanceOf(Function);
  expect(emptyLinqArray.single).toBeInstanceOf(Function);
  expect(emptyLinqArray.elementAt).toBeInstanceOf(Function);
  expect(emptyLinqArray.firstOrDefault).toBeInstanceOf(Function);
  expect(emptyLinqArray.lastOrDefault).toBeInstanceOf(Function);
  expect(emptyLinqArray.singleOrDefault).toBeInstanceOf(Function);
  expect(emptyLinqArray.elementAtOrDefault).toBeInstanceOf(Function);
  expect(emptyLinqArray.append).toBeInstanceOf(Function);
});

test("first()", () => {
  expect(linq(numsArray).first()).toBe(1);
  expect(linq(numsArray).first((x) => x > 2)).toBe(3);
  expect(() => linq(numsArray).first((x) => x > 5)).toThrow();
  expect(() => emptyLinqArray.first()).toThrow();
  expect(linq(undefinedArray).first()).toBe(undefined);
  expect(linq(undefinedArray).first((x) => x === undefined)).toBe(undefined);
  expect(() => linq(undefinedArray).first((x) => x !== undefined)).toThrow();

});

test("last()", () => {
  expect(linq(numsArray).last()).toBe(5);
  expect(() => emptyLinqArray.last()).toThrow();
  expect(linq(numsArray).last((x) => x < 4)).toBe(3);
  expect(() => linq(numsArray).last((x) => x < 1)).toThrow();
  expect(linq(undefinedArray).last()).toBe(undefined);
  expect(linq(undefinedArray).last((x) => x === undefined)).toBe(undefined);
  expect(() => linq(undefinedArray).last((x) => x !== undefined)).toThrow();
});

test("single()", () => {
  expect(linq([1]).single()).toBe(1);
  expect(() => linq([1, 2]).single()).toThrow(Exception.SEQUENCE_MULTIPLE);
  expect(() => emptyLinqArray.single()).toThrow(Exception.SEQUENCE_EMPTY);
  expect(() => linq([2, 2]).single((x) => x > 1)).toThrow(Exception.SEQUENCE_MULTIPLE);
  expect(() => linq([2, 2]).single((x) => x === 2)).toThrow(Exception.SEQUENCE_MULTIPLE);
});

test("elementAt()", () => {
  expect(linq(numsArray).elementAt(2)).toBe(3);
  expect(() => emptyLinqArray.elementAt(0)).toThrow(Exception.INDEX_OUT_OF_RANGE);
  expect(() => linq(numsArray).elementAt(10)).toThrow(Exception.INDEX_OUT_OF_RANGE);
  expect(() => linq(numsArray).elementAt(-1)).toThrow(Exception.INDEX_OUT_OF_RANGE);
  expect(linq(undefinedArray).elementAt(0)).toBe(undefined);
  expect(linq(undefinedArray).elementAt(1)).toBe(undefined);
  expect(() => linq(undefinedArray).elementAt(10)).toThrow(Exception.INDEX_OUT_OF_RANGE);
});

test("firstOrDefault()", () => {
  expect(linq(numsArray).firstOrDefault()).toBe(1);
  expect(linq(numsArray).firstOrDefault((x) => x > 2)).toBe(3);
  expect(linq(numsArray).firstOrDefault((x) => x > 5)).toBe(undefined);
  expect(emptyLinqArray.firstOrDefault()).toBe(undefined);
  expect(linq(undefinedArray).firstOrDefault()).toBe(undefined);
  expect(linq(undefinedArray).firstOrDefault((x) => x === undefined)).toBe(undefined);
  expect(linq(undefinedArray).firstOrDefault((x) => x !== undefined)).toBe(undefined);
  expect(linq(undefinedArray).firstOrDefault((x) => x === undefined)).toBe(undefined);
});

test("lastOrDefault()", () => {
  expect(linq(numsArray).lastOrDefault()).toBe(5);
  expect(linq(numsArray).lastOrDefault((x) => x < 4)).toBe(3);
  expect(linq(numsArray).lastOrDefault((x) => x < 1)).toBe(undefined);
  expect(emptyLinqArray.lastOrDefault()).toBe(undefined);
  expect(linq(undefinedArray).lastOrDefault()).toBe(undefined);
  expect(linq(undefinedArray).lastOrDefault((x) => x === undefined)).toBe(undefined);
  expect(linq(undefinedArray).lastOrDefault((x) => x !== undefined)).toBe(undefined);
});

test("singleOrDefault()", () => {
  expect(linq([1]).singleOrDefault()).toBe(1);
  expect(() => linq([2, 2]).singleOrDefault()).toThrow(Exception.SEQUENCE_MULTIPLE);
  expect(() => linq([2, 2]).singleOrDefault((x) => x === 2)).toThrow(Exception.SEQUENCE_MULTIPLE);
  expect(linq([2, 2]).singleOrDefault((x) => x > 2)).toBe(undefined);
  expect(emptyLinqArray.singleOrDefault()).toBe(undefined);
  expect(() => linq(undefinedArray).singleOrDefault()).toThrow();
  expect(linq(undefinedArray).singleOrDefault((x) => x !== undefined)).toBe(undefined);
});

test("elementAtOrDefault()", () => {
  expect(linq(numsArray).elementAtOrDefault(2)).toBe(3);
  expect(linq(numsArray).elementAtOrDefault(10)).toBe(undefined);
  expect(emptyLinqArray.elementAtOrDefault(0)).toBe(undefined);
  expect(linq(numsArray).elementAtOrDefault(-1)).toBe(undefined);
  expect(linq(undefinedArray).elementAtOrDefault(0)).toBe(undefined);
  expect(linq(undefinedArray).elementAtOrDefault(1)).toBe(undefined);
  expect(linq(undefinedArray).elementAtOrDefault(10)).toBe(undefined);
});

test("append()", () => {
  expect(linq(numsArray).append(6).toArray()).toEqual([1, 2, 3, 4, 5, 6]);
});

const emptyLinqArray = linq([]);
const numsArray = [1, 2, 3, 4, 5];
const undefinedArray = [undefined, undefined, undefined];