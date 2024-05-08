import { Enumerable } from "../src";

/* 
empty, repeat, range
*/
test("empty()", () => {
    expect(Enumerable.empty().toArray()).toEqual([]);
    const nums = Enumerable.empty<number>();
    expect(nums.append(1).toArray()).toEqual([1]);
})

test("repeat()", () => {
    expect(Enumerable.repeat(1, 3).toArray()).toEqual([1, 1, 1]);
    expect(Enumerable.repeat(1, 0).toArray()).toEqual([]);
    expect(Enumerable.repeat(1, -1).toArray()).toEqual([]);
    expect(Enumerable.repeat(1, 1.5).toArray()).toEqual([1]);
})

test("range()", () => {
    expect(Enumerable.range(1, 3).toArray()).toEqual([1, 2, 3]);
    expect(Enumerable.range(1, 0).toArray()).toEqual([]);
    expect(Enumerable.range(1, -1).toArray()).toEqual([]);
    expect(Enumerable.range(1, 2.5).toArray()).toEqual([1,2]);
})